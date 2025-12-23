#!/usr/bin/env python3
"""
Verify all links in Hexworth Prime are now valid
"""

import os
import re
from pathlib import Path
from urllib.parse import unquote

APP_DIR = Path("/home/eq/Ai content creation/Hexworth Prime/_app")

results = {
    "checked": 0,
    "valid": 0,
    "broken": [],
    "external": 0,
    "anchors": 0,
    "js_calls": 0
}

def resolve_path(link, source_file):
    """Resolve a relative link to an absolute path"""
    if link.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
        return None, "external"
    if link.startswith('#'):
        return None, "anchor"
    if link.startswith('data:'):
        return None, "data"

    # Remove query strings and anchors
    clean_link = link.split('?')[0].split('#')[0]
    if not clean_link:
        return None, "anchor"

    # Resolve relative to source file's directory
    source_dir = source_file.parent
    resolved = (source_dir / clean_link).resolve()

    return resolved, "path"

def check_file(file_path):
    """Check all links in a single file"""
    global results

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    # Find all href and src attributes
    links = re.findall(r'(?:href|src)=["\']([^"\']+)["\']', content)

    for link in links:
        results["checked"] += 1
        link = unquote(link)  # Decode URL encoding

        resolved, link_type = resolve_path(link, file_path)

        if link_type == "external":
            results["external"] += 1
            continue
        if link_type in ("anchor", "data"):
            results["anchors"] += 1
            continue

        # Check if resolved path exists
        if resolved and resolved.exists():
            results["valid"] += 1
        else:
            rel_source = file_path.relative_to(APP_DIR)
            results["broken"].append({
                "file": str(rel_source),
                "link": link,
                "resolved": str(resolved) if resolved else "N/A"
            })

def main():
    print("=" * 70)
    print("Hexworth Prime Link Verification")
    print("=" * 70)

    # Find all HTML files
    html_files = list(APP_DIR.rglob("*.html"))
    print(f"\nChecking {len(html_files)} HTML files...\n")

    for file_path in html_files:
        check_file(file_path)

    print("=" * 70)
    print("VERIFICATION RESULTS")
    print("=" * 70)
    print(f"Total links checked: {results['checked']}")
    print(f"Valid internal links: {results['valid']}")
    print(f"External links (skipped): {results['external']}")
    print(f"Anchor/data links (skipped): {results['anchors']}")
    print(f"BROKEN LINKS: {len(results['broken'])}")
    print("=" * 70)

    if results["broken"]:
        print("\nBROKEN LINKS DETAIL:")
        print("-" * 70)
        # Group by file
        by_file = {}
        for item in results["broken"]:
            if item["file"] not in by_file:
                by_file[item["file"]] = []
            by_file[item["file"]].append(item["link"])

        for file_path, links in sorted(by_file.items()):
            print(f"\n{file_path}:")
            for link in links:
                print(f"  - {link}")

        print("\n" + "=" * 70)
        print(f"TOTAL BROKEN: {len(results['broken'])} links in {len(by_file)} files")
        print("=" * 70)
    else:
        print("\n✅ ALL LINKS ARE VALID!")

if __name__ == "__main__":
    main()
