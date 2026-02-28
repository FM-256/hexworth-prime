# Scraper Core — Content Scraping Infrastructure

Three-layer content scraping infrastructure for Hexworth Prime. Designed to systematically discover, extract, classify, and organize educational content from Microsoft Learn, GitHub, and other sources.

## Status

**Planning phase.** Architecture is documented in `PLAN.md`. No code implemented yet. The prototype scraper lives in `_tools/ai-scraper/`.

## Architecture

```
Layer 1: Scraper Core (SC-1, SC-2)
  Shared infrastructure — rate limiting, caching, output format, storage schema, CLI

Layer 2: Source Scrapers (SC-3, SC-6, SC-7, SC-8)
  Microsoft Learn crawler | GitHub repo discovery | (future: documentation sites)

Layer 3: Content Processing (SC-5) + Production Sweeps (SC-4, SC-6, SC-7)
  Classifier/tagger | AI cert sweep | Security sweep | Azure sweep
```

## Planned Directory Structure

```
_tools/scraper-core/
  PLAN.md              # Full architecture and sprint plan
  README.md            # This file
  config.yaml          # Rate limits, output dirs (gitignored)
  requirements.txt     # Python dependencies
  scraper/
    base.py            # BaseScraper class
    cache.py           # Response cache with TTL
    cli.py             # Click-based CLI entry point
    classifier.py      # Content classifier & tagger
    sources/
      mslearn.py       # Microsoft Learn crawler
      github_discovery.py  # GitHub repo discovery
  output/              # Scraped content (gitignored)
```

## Key Design Decisions

- **Python-based** — requests + BeautifulSoup + markdownify
- **Local-first storage** — filesystem output, portable to server later
- **Incremental scraping** — track last-scraped timestamps, only re-fetch updated content
- **Deduplication by content hash** — SHA-256 of extracted markdown prevents duplicates
- **Polite crawling** — 1s delay between requests, educational User-Agent

## Related

- `_tools/ai-scraper/` — Original prototype (AI-12), scrapes AI-900 content
- `_tools/repo-scout/` — GitHub repo discovery for fork-and-convert pipeline
- See `PLAN.md` for the full sprint sequence and content hub plan
