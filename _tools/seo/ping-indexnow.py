#!/usr/bin/env python3
"""
ping-indexnow.py — notify IndexNow-compliant search engines of fresh content.

IndexNow (https://www.indexnow.org/) is a free protocol supported by Bing,
Yandex, Seznam, Naver, and others (NOT Google as of 2026-06). A POST with
the list of URLs gets crawled within hours instead of waiting for the
search engine's normal discovery cycle.

Usage:

    # Ping all URLs in _app/sitemap.xml
    python3 _tools/seo/ping-indexnow.py

    # Ping a specific subset
    python3 _tools/seo/ping-indexnow.py --url https://hexworth.com/career/

    # Dry-run (print payload, don't POST)
    python3 _tools/seo/ping-indexnow.py --dry-run

The key file at _app/<KEY>.txt is the ownership proof. Keep it in source
control; deploying it makes the verification fetch from api.indexnow.org
succeed. Rotating the key requires updating both the key file on disk
and the KEY constant below.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path

# Key issued 2026-06-02 (CAREER-4 follow-up). Lives at
# _app/<KEY>.txt and is fetched by IndexNow to verify ownership.
KEY = "c9ef8e71d110cb110ef4fc14f2579eff"
HOST = "hexworth.com"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

# Central IndexNow endpoint forwards to all participating engines
# (Bing, Yandex, Seznam, Naver). Per-engine endpoints exist but the
# central one is simpler and covers them all.
INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"

# Per-engine direct endpoints (use as fallback if central fails or
# you want to control delivery to specific engines):
ENGINE_ENDPOINTS = {
    "bing":   "https://www.bing.com/indexnow",
    "yandex": "https://yandex.com/indexnow",
    "seznam": "https://search.seznam.cz/indexnow",
    "naver":  "https://searchadvisor.naver.com/indexnow",
}

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SITEMAP = REPO_ROOT / "_app" / "sitemap.xml"


def load_sitemap_urls(sitemap_path: Path) -> list[str]:
    """Parse sitemap.xml and return all <loc> URLs."""
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text.strip() for loc in root.findall(".//sm:loc", ns) if loc.text]
    return urls


def ping(urls: list[str], endpoint: str = INDEXNOW_ENDPOINT, dry_run: bool = False) -> int:
    """POST the URL list to the given IndexNow endpoint. Returns HTTP status."""
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }

    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    print(f"  endpoint: {endpoint}")
    print(f"  host:     {HOST}")
    print(f"  key:      {KEY}")
    print(f"  urls:     {len(urls)}")
    for u in urls:
        print(f"    {u}")

    if dry_run:
        print("\n  DRY RUN — no POST sent")
        print(f"  payload: {json.dumps(payload, ensure_ascii=False, indent=2)}")
        return 0

    req = urllib.request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "hexworth-prime-indexnow/1.0",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            status = resp.status
            body_text = resp.read().decode("utf-8", errors="replace")
            print(f"\n  ✓ HTTP {status}")
            if body_text.strip():
                print(f"  response body: {body_text[:500]}")
            return status
    except urllib.error.HTTPError as e:
        status = e.code
        body_text = e.read().decode("utf-8", errors="replace") if e.fp else ""
        print(f"\n  ✗ HTTP {status}")
        if body_text:
            print(f"  response body: {body_text[:500]}")
        # IndexNow status codes (per spec):
        #   200 OK            — URLs accepted, will be crawled
        #   202 Accepted      — URLs received, key validation pending
        #   400 Bad Request   — payload malformed
        #   403 Forbidden     — key not found at keyLocation (verification fail)
        #   422 Unprocessable — URLs don't belong to the verified host
        #   429 Too Many Reqs — rate limited (back off)
        return status
    except urllib.error.URLError as e:
        print(f"\n  ✗ network error: {e}")
        return -1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument(
        "--url",
        action="append",
        help="Specific URL to ping (repeat for multiple). Default: all URLs in sitemap.xml",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print payload but do not POST",
    )
    parser.add_argument(
        "--endpoint",
        default=INDEXNOW_ENDPOINT,
        help=f"Override the IndexNow endpoint (default: {INDEXNOW_ENDPOINT})",
    )
    parser.add_argument(
        "--per-engine",
        action="store_true",
        help="POST to each engine endpoint separately instead of the central api.indexnow.org",
    )
    args = parser.parse_args()

    if args.url:
        urls = args.url
    else:
        urls = load_sitemap_urls(SITEMAP)

    # IndexNow spec limit: 10000 URLs per submission.
    if len(urls) > 10000:
        print(f"  ⚠ {len(urls)} URLs exceeds IndexNow's 10000 limit. Submitting first 10000.")
        urls = urls[:10000]

    if args.per_engine:
        rc = 0
        for engine, endpoint in ENGINE_ENDPOINTS.items():
            print(f"\n=== ping {engine} ===")
            status = ping(urls, endpoint, args.dry_run)
            if status not in (200, 202):
                rc = max(rc, 1)
        return rc

    print("=== ping IndexNow central ===")
    status = ping(urls, args.endpoint, args.dry_run)
    if status in (200, 202):
        print("\n  ✓ submission accepted")
        return 0
    print(f"\n  ✗ submission failed (status {status})")
    return 1


if __name__ == "__main__":
    sys.exit(main())
