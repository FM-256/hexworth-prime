#!/usr/bin/env python3
"""
Microsoft Learn AI Course Scraper
Scrapes learning paths into structured markdown for Hexworth Prime AI House.

Usage:
  python3 scrape-mslearn.py                    # Scrape default AI-900 path
  python3 scrape-mslearn.py <learning-path-url> # Scrape a specific path

Output: _app/houses/ai/reference/microsoft-learn/<module-slug>.md
"""

import requests
from bs4 import BeautifulSoup
import re
import time
import os
import sys
import json

BASE_URL = "https://learn.microsoft.com"
MODULES_BASE = f"{BASE_URL}/en-us/training/modules"
DEFAULT_PATH = "https://learn.microsoft.com/en-us/training/paths/introduction-to-ai-on-azure/"

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
    "../../_app/houses/ai/reference/microsoft-learn")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Hexworth-Prime educational-scraper/1.0; +https://hexworth-prime.web.app)"
}

DELAY = 1.0  # seconds between requests — be polite


def fetch_page(url):
    """Fetch a page and return BeautifulSoup object."""
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def get_module_slugs_from_path(path_url):
    """Extract all module slugs from a learning path page."""
    soup = fetch_page(path_url)
    modules = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        # Module links look like: ../../modules/slug/ or /en-us/training/modules/slug/
        match = re.search(r'/modules/([\w-]+)/?', href)
        if match:
            slug = match.group(1)
            if slug not in modules:
                modules.append(slug)
    return modules


def get_unit_urls(module_slug):
    """Get all unit URLs from a module page."""
    url = f"{MODULES_BASE}/{module_slug}/"
    soup = fetch_page(url)

    # Extract module title and metadata
    title_el = soup.find("h1")
    title = title_el.get_text(strip=True) if title_el else module_slug

    units = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        text = link.get_text(strip=True)
        # Relative unit links like "1-introduction", "2-generative-ai"
        if re.match(r'^\d+\w?-[\w-]+$', href):
            full = f"{MODULES_BASE}/{module_slug}/{href}"
            if full not in [u[0] for u in units]:
                units.append((full, text))
        # Path-relative with digits
        elif re.search(r'/\d+\w?-[\w-]+/?$', href):
            if href.startswith("http"):
                full = href
            elif href.startswith("/"):
                full = f"{BASE_URL}{href}"
            else:
                full = f"{MODULES_BASE}/{module_slug}/{href.split('/')[-1]}"
            if full not in [u[0] for u in units]:
                units.append((full, text))

    return title, units


def extract_content(soup):
    """Extract the main teaching content from a unit page."""
    main = soup.find("main") or soup.find("div", {"id": "main"}) or soup.find("article")
    if not main:
        main = soup.body
    if not main:
        return ""

    lines = []
    seen = set()  # Deduplicate

    for el in main.find_all(["h1", "h2", "h3", "h4", "p", "li", "table", "pre", "blockquote"]):
        # Skip nav/header/footer/feedback elements
        if el.find_parent(["nav", "header", "footer"]):
            continue

        tag = el.name
        text = el.get_text(separator=" ", strip=True)
        if not text or text in seen:
            continue

        # Skip boilerplate
        if any(skip in text for skip in [
            "Was this page helpful?",
            "Need help with this topic?",
            "Want to try using Ask Learn",
            "Feedback",
            "Additional resources",
            "This content is also available as",
        ]):
            continue

        seen.add(text)

        if tag == "h1":
            lines.append(f"\n# {text}\n")
        elif tag == "h2":
            lines.append(f"\n## {text}\n")
        elif tag == "h3":
            lines.append(f"\n### {text}\n")
        elif tag == "h4":
            lines.append(f"\n#### {text}\n")
        elif tag == "li":
            lines.append(f"- {text}")
        elif tag == "pre":
            lines.append(f"\n```\n{text}\n```\n")
        elif tag == "blockquote":
            lines.append(f"\n> {text}\n")
        elif tag == "table":
            rows = el.find_all("tr")
            for i, row in enumerate(rows):
                cells = [c.get_text(strip=True) for c in row.find_all(["th", "td"])]
                if cells:
                    lines.append("| " + " | ".join(cells) + " |")
                    if i == 0:
                        lines.append("|" + "|".join(["---"] * len(cells)) + "|")
        else:
            lines.append(text)

    return "\n".join(lines)


def scrape_module(module_slug, index):
    """Scrape an entire module into markdown."""
    print(f"\n{'='*60}")
    print(f"  Module {index}: {module_slug}")
    print(f"{'='*60}")

    title, units = get_unit_urls(module_slug)
    print(f"  Title: {title}")
    print(f"  Units: {len(units)}")
    time.sleep(DELAY)

    output = f"# {title}\n\n"
    output += f"**Module slug:** `{module_slug}`\n"
    output += f"**Source:** {MODULES_BASE}/{module_slug}/\n"
    output += f"**Units:** {len(units)}\n\n"

    # Table of contents
    output += "## Table of Contents\n\n"
    for i, (url, text) in enumerate(units, 1):
        output += f"{i}. {text}\n"
    output += "\n---\n\n"

    # Scrape each unit
    for i, (url, unit_title) in enumerate(units, 1):
        slug = url.split("/")[-1]
        print(f"  [{i}/{len(units)}] {slug}: {unit_title}")
        try:
            soup = fetch_page(url)
            content = extract_content(soup)
            output += f"{content}\n\n---\n\n"
        except Exception as e:
            print(f"    ERROR: {e}")
            output += f"\n[ERROR fetching {url}: {e}]\n\n---\n\n"
        time.sleep(DELAY)

    return output, title


def scrape_learning_path(path_url):
    """Scrape an entire learning path (all modules)."""
    print(f"Scraping learning path: {path_url}")
    print(f"Output directory: {OUTPUT_DIR}\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Discover modules
    module_slugs = get_module_slugs_from_path(path_url)
    print(f"Found {len(module_slugs)} modules:")
    for i, slug in enumerate(module_slugs, 1):
        print(f"  {i}. {slug}")
    time.sleep(DELAY)

    # Scrape each module
    manifest = []
    total_chars = 0
    total_units = 0

    for i, slug in enumerate(module_slugs, 1):
        md, title = scrape_module(slug, i)

        # Write to file
        outpath = os.path.join(OUTPUT_DIR, f"{slug}.md")
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(md)

        chars = len(md)
        lines = md.count("\n")
        total_chars += chars

        manifest.append({
            "index": i,
            "slug": slug,
            "title": title,
            "file": f"{slug}.md",
            "chars": chars,
            "lines": lines
        })

        print(f"  -> Saved: {outpath} ({chars:,} chars, {lines} lines)")

    # Write manifest
    manifest_path = os.path.join(OUTPUT_DIR, "_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "source": path_url,
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_modules": len(manifest),
            "total_chars": total_chars,
            "modules": manifest
        }, f, indent=2)

    # Write index
    index_path = os.path.join(OUTPUT_DIR, "INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write("# Microsoft Learn AI-900 Reference Content\n\n")
        f.write(f"**Source:** {path_url}\n")
        f.write(f"**Scraped:** {time.strftime('%Y-%m-%d %H:%M UTC')}\n")
        f.write(f"**Modules:** {len(manifest)}\n")
        f.write(f"**Total size:** {total_chars:,} chars\n\n")
        f.write("## Modules\n\n")
        f.write("| # | Module | File | Size |\n")
        f.write("|---|--------|------|------|\n")
        for m in manifest:
            f.write(f"| {m['index']} | {m['title']} | [{m['file']}]({m['file']}) | {m['chars']:,} chars |\n")

    print(f"\n{'='*60}")
    print(f"  COMPLETE")
    print(f"  Modules: {len(manifest)}")
    print(f"  Total content: {total_chars:,} chars")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Manifest: {manifest_path}")
    print(f"  Index: {index_path}")
    print(f"{'='*60}")


if __name__ == "__main__":
    path_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PATH
    scrape_learning_path(path_url)
