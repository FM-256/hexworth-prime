#!/usr/bin/env python3
"""
Microsoft Learn Multi-Certification Scraper
Scrapes learning paths into structured markdown for Hexworth Prime houses.

Usage:
  python3 scrape-mslearn.py                    # Scrape ALL certs in certs.json
  python3 scrape-mslearn.py --cert ai-900      # Scrape specific cert
  python3 scrape-mslearn.py --list             # List configured certs
  python3 scrape-mslearn.py --force            # Re-scrape even if files exist
  python3 scrape-mslearn.py <learning-path-url> # Legacy single-path mode

Output: _app/houses/{house}/reference/microsoft-learn/{cert-id}/
"""

import requests
from bs4 import BeautifulSoup
import re
import time
import os
import sys
import json
import argparse

BASE_URL = "https://learn.microsoft.com"
MODULES_BASE = f"{BASE_URL}/en-us/training/modules"
DEFAULT_PATH = "https://learn.microsoft.com/en-us/training/paths/introduction-to-ai-on-azure/"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, "..", "..")
CERTS_CONFIG = os.path.join(SCRIPT_DIR, "certs.json")

# Legacy output dir — used only for bare-URL mode
LEGACY_OUTPUT_DIR = os.path.join(PROJECT_ROOT, "_app/houses/ai/reference/microsoft-learn")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Hexworth-Prime educational-scraper/1.0; +https://hexworth-prime.web.app)"
}

DELAY = 1.0  # seconds between requests — be polite


# ─────────────────────────────────────────────
#  Core extraction functions (unchanged)
# ─────────────────────────────────────────────

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


# ─────────────────────────────────────────────
#  Config loading
# ─────────────────────────────────────────────

def load_certs_config():
    """Load the certs.json configuration file."""
    if not os.path.exists(CERTS_CONFIG):
        print(f"ERROR: Config file not found: {CERTS_CONFIG}")
        print("Create certs.json with cert definitions. See README.md for format.")
        sys.exit(1)
    with open(CERTS_CONFIG, "r", encoding="utf-8") as f:
        return json.load(f)


def get_cert_output_dir(cert):
    """Return the output directory for a cert: _app/houses/{house}/reference/microsoft-learn/{cert-id}/"""
    return os.path.join(PROJECT_ROOT, "_app", "houses", cert["house"],
                        "reference", "microsoft-learn", cert["id"])


def get_house_mslearn_dir(house):
    """Return the microsoft-learn directory for a house."""
    return os.path.join(PROJECT_ROOT, "_app", "houses", house, "reference", "microsoft-learn")


# ─────────────────────────────────────────────
#  Cert-based scraping
# ─────────────────────────────────────────────

def scrape_cert(cert, force=False):
    """Scrape all learning paths for a single certification."""
    cert_id = cert["id"]
    cert_name = cert["name"]
    output_dir = get_cert_output_dir(cert)

    print(f"\n{'#'*60}")
    print(f"  CERT: {cert_id.upper()} — {cert_name}")
    print(f"  House: {cert['house']}")
    print(f"  Paths: {len(cert['paths'])}")
    print(f"  Output: {output_dir}")
    print(f"{'#'*60}")

    os.makedirs(output_dir, exist_ok=True)

    # Collect modules from all paths, deduplicating
    all_modules = []       # ordered list of slugs
    module_sources = {}    # slug -> list of source path URLs

    for path_url in cert["paths"]:
        print(f"\n  Discovering modules from: {path_url}")
        try:
            slugs = get_module_slugs_from_path(path_url)
            print(f"    Found {len(slugs)} modules")
            for slug in slugs:
                if slug not in module_sources:
                    module_sources[slug] = []
                    all_modules.append(slug)
                module_sources[slug].append(path_url)
            time.sleep(DELAY)
        except Exception as e:
            print(f"    ERROR fetching path: {e}")
            print(f"    Continuing to next path...")
            continue

    print(f"\n  Total unique modules across all paths: {len(all_modules)}")

    # Scrape each module
    manifest = []
    total_chars = 0
    skipped = 0

    for i, slug in enumerate(all_modules, 1):
        outpath = os.path.join(output_dir, f"{slug}.md")

        # Skip existing unless --force
        if os.path.exists(outpath) and not force:
            print(f"\n  [{i}/{len(all_modules)}] SKIP (exists): {slug}")
            # Still need title for manifest — read from existing file
            try:
                with open(outpath, "r", encoding="utf-8") as f:
                    first_line = f.readline().strip()
                    title = first_line.lstrip("# ") if first_line.startswith("# ") else slug
                chars = os.path.getsize(outpath)
                lines = sum(1 for _ in open(outpath, encoding="utf-8"))
            except Exception:
                title = slug
                chars = 0
                lines = 0
            total_chars += chars
            skipped += 1
            manifest.append({
                "index": i,
                "slug": slug,
                "title": title,
                "file": f"{slug}.md",
                "chars": chars,
                "lines": lines,
                "sources": module_sources.get(slug, []),
                "skipped": True
            })
            continue

        try:
            md, title = scrape_module(slug, i)
        except Exception as e:
            print(f"    ERROR scraping module {slug}: {e}")
            print(f"    Continuing to next module...")
            continue

        # Write to file
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
            "lines": lines,
            "sources": module_sources.get(slug, []),
            "skipped": False
        })

        print(f"  -> Saved: {outpath} ({chars:,} chars, {lines} lines)")

    # Write cert manifest
    manifest_path = os.path.join(output_dir, "_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "cert_id": cert_id,
            "cert_name": cert_name,
            "house": cert["house"],
            "source_paths": cert["paths"],
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_modules": len(manifest),
            "total_chars": total_chars,
            "modules": manifest
        }, f, indent=2)

    # Write cert INDEX.md
    index_path = os.path.join(output_dir, "INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(f"# Microsoft Learn {cert_id.upper()} — {cert_name} Reference Content\n\n")
        f.write(f"**Certification:** {cert_id.upper()} — {cert_name}\n")
        f.write(f"**House:** {cert['house']}\n")
        f.write(f"**Learning Paths:** {len(cert['paths'])}\n")
        f.write(f"**Scraped:** {time.strftime('%Y-%m-%d %H:%M UTC')}\n")
        f.write(f"**Modules:** {len(manifest)}\n")
        f.write(f"**Total size:** {total_chars:,} chars\n\n")
        if skipped > 0:
            f.write(f"*{skipped} modules skipped (already existed). Use --force to re-scrape.*\n\n")
        f.write("## Learning Paths\n\n")
        for i, path_url in enumerate(cert["paths"], 1):
            f.write(f"{i}. {path_url}\n")
        f.write("\n## Modules\n\n")
        f.write("| # | Module | File | Size | Sources |\n")
        f.write("|---|--------|------|------|----------|\n")
        for m in manifest:
            src_count = len(m.get("sources", []))
            status = " (cached)" if m.get("skipped") else ""
            f.write(f"| {m['index']} | {m['title']} | [{m['file']}]({m['file']}) | {m['chars']:,} chars | {src_count} path(s){status} |\n")

    print(f"\n{'='*60}")
    print(f"  CERT COMPLETE: {cert_id.upper()}")
    print(f"  Modules: {len(manifest)} ({skipped} skipped)")
    print(f"  Total content: {total_chars:,} chars")
    print(f"  Output: {output_dir}")
    print(f"{'='*60}")

    return {
        "cert_id": cert_id,
        "cert_name": cert_name,
        "house": cert["house"],
        "modules": len(manifest),
        "chars": total_chars,
        "output_dir": output_dir
    }


def write_master_manifest(results, house):
    """Write a master manifest listing all certs for a house."""
    house_dir = get_house_mslearn_dir(house)
    os.makedirs(house_dir, exist_ok=True)
    master_path = os.path.join(house_dir, "_master.json")

    with open(master_path, "w", encoding="utf-8") as f:
        json.dump({
            "house": house,
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_certs": len(results),
            "total_modules": sum(r["modules"] for r in results),
            "total_chars": sum(r["chars"] for r in results),
            "certs": [
                {
                    "id": r["cert_id"],
                    "name": r["cert_name"],
                    "modules": r["modules"],
                    "chars": r["chars"],
                    "directory": r["cert_id"]
                }
                for r in results
            ]
        }, f, indent=2)

    print(f"\n  Master manifest: {master_path}")


# ─────────────────────────────────────────────
#  Legacy single-path mode (backwards compat)
# ─────────────────────────────────────────────

def scrape_learning_path_legacy(path_url):
    """Scrape an entire learning path (legacy mode — flat output to original dir)."""
    print(f"LEGACY MODE: Scraping single learning path")
    print(f"Scraping learning path: {path_url}")
    print(f"Output directory: {LEGACY_OUTPUT_DIR}\n")

    os.makedirs(LEGACY_OUTPUT_DIR, exist_ok=True)

    # Discover modules
    module_slugs = get_module_slugs_from_path(path_url)
    print(f"Found {len(module_slugs)} modules:")
    for i, slug in enumerate(module_slugs, 1):
        print(f"  {i}. {slug}")
    time.sleep(DELAY)

    # Scrape each module
    manifest = []
    total_chars = 0

    for i, slug in enumerate(module_slugs, 1):
        md, title = scrape_module(slug, i)

        # Write to file
        outpath = os.path.join(LEGACY_OUTPUT_DIR, f"{slug}.md")
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
    manifest_path = os.path.join(LEGACY_OUTPUT_DIR, "_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "source": path_url,
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_modules": len(manifest),
            "total_chars": total_chars,
            "modules": manifest
        }, f, indent=2)

    # Write index
    index_path = os.path.join(LEGACY_OUTPUT_DIR, "INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(f"# Microsoft Learn Reference Content\n\n")
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
    print(f"  Output: {LEGACY_OUTPUT_DIR}")
    print(f"{'='*60}")


# ─────────────────────────────────────────────
#  CLI
# ─────────────────────────────────────────────

def is_url(s):
    """Check if a string looks like a URL."""
    return s.startswith("http://") or s.startswith("https://")


def cmd_list(config):
    """List all configured certs."""
    print(f"Configured certifications ({len(config['certs'])}):\n")
    print(f"  {'ID':<12} {'Name':<40} {'House':<8} {'Paths'}")
    print(f"  {'-'*12} {'-'*40} {'-'*8} {'-'*5}")
    for cert in config["certs"]:
        print(f"  {cert['id']:<12} {cert['name']:<40} {cert['house']:<8} {len(cert['paths'])}")


def cmd_scrape_cert(config, cert_id, force=False):
    """Scrape a specific cert by ID."""
    cert = None
    for c in config["certs"]:
        if c["id"] == cert_id:
            cert = c
            break
    if not cert:
        print(f"ERROR: Cert '{cert_id}' not found in certs.json")
        print(f"Available certs: {', '.join(c['id'] for c in config['certs'])}")
        sys.exit(1)

    result = scrape_cert(cert, force=force)

    # Write master manifest for this house
    house_results = [result]
    # Include other certs for the same house that have existing manifests
    for c in config["certs"]:
        if c["id"] != cert_id and c["house"] == cert["house"]:
            cert_dir = get_cert_output_dir(c)
            manifest_file = os.path.join(cert_dir, "_manifest.json")
            if os.path.exists(manifest_file):
                with open(manifest_file, "r", encoding="utf-8") as f:
                    mdata = json.load(f)
                house_results.append({
                    "cert_id": c["id"],
                    "cert_name": c["name"],
                    "house": c["house"],
                    "modules": mdata.get("total_modules", 0),
                    "chars": mdata.get("total_chars", 0),
                    "output_dir": cert_dir
                })

    write_master_manifest(house_results, cert["house"])


def cmd_scrape_all(config, force=False):
    """Scrape all certs in config."""
    print(f"Batch scrape: {len(config['certs'])} certifications")

    all_results = []
    for cert in config["certs"]:
        result = scrape_cert(cert, force=force)
        all_results.append(result)

    # Write master manifests per house
    houses = {}
    for r in all_results:
        houses.setdefault(r["house"], []).append(r)

    for house, results in houses.items():
        write_master_manifest(results, house)

    # Summary
    print(f"\n{'#'*60}")
    print(f"  BATCH COMPLETE")
    print(f"  Certs scraped: {len(all_results)}")
    print(f"  Total modules: {sum(r['modules'] for r in all_results)}")
    print(f"  Total content: {sum(r['chars'] for r in all_results):,} chars")
    print(f"{'#'*60}")


def main():
    parser = argparse.ArgumentParser(
        description="Microsoft Learn Multi-Certification Scraper for Hexworth Prime",
        epilog="Examples:\n"
               "  python3 scrape-mslearn.py                    # Scrape all certs\n"
               "  python3 scrape-mslearn.py --cert ai-900      # Scrape one cert\n"
               "  python3 scrape-mslearn.py --list              # List certs\n"
               "  python3 scrape-mslearn.py --force             # Re-scrape everything\n"
               "  python3 scrape-mslearn.py <url>               # Legacy single-path mode\n",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("url", nargs="?", default=None,
                        help="Legacy mode: scrape a single learning path URL")
    parser.add_argument("--cert", type=str, default=None,
                        help="Scrape a specific cert by ID (e.g., ai-900)")
    parser.add_argument("--list", action="store_true",
                        help="List all configured certifications")
    parser.add_argument("--force", action="store_true",
                        help="Re-scrape modules even if files already exist")

    args = parser.parse_args()

    # Legacy URL mode
    if args.url and is_url(args.url):
        scrape_learning_path_legacy(args.url)
        return

    config = load_certs_config()

    if args.list:
        cmd_list(config)
    elif args.cert:
        cmd_scrape_cert(config, args.cert, force=args.force)
    else:
        cmd_scrape_all(config, force=args.force)


if __name__ == "__main__":
    main()
