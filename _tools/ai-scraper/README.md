# AI Scraper — Microsoft Learn Multi-Certification Scraper

Scrapes Microsoft Learn learning paths into structured markdown for Hexworth Prime houses. Supports batch scraping of multiple certifications with per-cert output directories, deduplication, and incremental updates.

## Usage

```bash
# Scrape ALL configured certifications
python3 _tools/ai-scraper/scrape-mslearn.py

# Scrape a specific certification
python3 _tools/ai-scraper/scrape-mslearn.py --cert ai-900
python3 _tools/ai-scraper/scrape-mslearn.py --cert ai-102

# List configured certifications
python3 _tools/ai-scraper/scrape-mslearn.py --list

# Force re-scrape (overwrite existing files)
python3 _tools/ai-scraper/scrape-mslearn.py --force
python3 _tools/ai-scraper/scrape-mslearn.py --cert ai-900 --force

# Legacy: scrape a single learning path URL (flat output)
python3 _tools/ai-scraper/scrape-mslearn.py <learning-path-url>
```

## Configuration

Certifications are defined in `certs.json`:

```json
{
  "certs": [
    {
      "id": "ai-900",
      "name": "Azure AI Fundamentals",
      "house": "ai",
      "paths": [
        "https://learn.microsoft.com/en-us/training/paths/introduction-to-ai-on-azure/",
        "https://learn.microsoft.com/en-us/training/paths/explore-computer-vision-microsoft-azure/"
      ]
    }
  ]
}
```

Each cert entry has:
- **id** — Short identifier, used as directory name (e.g., `ai-900`)
- **name** — Full certification name for display
- **house** — Hexworth house ID that owns this content
- **paths** — Array of Microsoft Learn learning path URLs to scrape

## Output Structure

```
_app/houses/{house}/reference/microsoft-learn/
  _master.json                    # Master manifest for the house
  {cert-id}/
    INDEX.md                      # Human-readable module listing
    _manifest.json                # Machine-readable manifest with sources
    {module-slug}.md              # One file per module
```

Example for AI house:
```
_app/houses/ai/reference/microsoft-learn/
  _master.json
  ai-900/
    INDEX.md
    _manifest.json
    get-started-ai-fundamentals.md
    ...
  ai-102/
    INDEX.md
    _manifest.json
    provision-manage-azure-cognitive-services.md
    ...
```

## How It Works

1. Reads cert definitions from `certs.json`
2. For each cert, fetches all configured learning path pages
3. Discovers modules across all paths, deduplicating by slug
4. Scrapes each module's units into clean markdown
5. Tracks which learning path(s) each module came from
6. Writes per-cert manifests and a house-level master manifest
7. Skips existing modules unless `--force` is used

## Incremental Updates

By default, the scraper skips modules that already have a `.md` file on disk. This allows you to:
- Add new learning paths to a cert and only scrape the new modules
- Resume after a network interruption without re-downloading everything
- Use `--force` when you want a full refresh

## Error Handling

- If a learning path URL fails, the error is logged and the scraper continues to the next path
- If a module fails, the error is logged and the scraper continues to the next module
- Partial results are still written (manifests, index, successfully scraped modules)

## Dependencies

- Python 3
- `requests` — HTTP client
- `beautifulsoup4` — HTML parsing

## Details

| | |
|---|---|
| **Type** | Python CLI script |
| **Location** | `_tools/ai-scraper/scrape-mslearn.py` |
| **Config** | `_tools/ai-scraper/certs.json` |
| **Output** | `_app/houses/{house}/reference/microsoft-learn/{cert-id}/` |
| **User-Agent** | Educational scraper identifier with project URL |
| **Rate limit** | 1 second delay between requests |

This is the original prototype scraper (AI-12), now upgraded to multi-cert batch mode. The generalized version lives in `_tools/scraper-core/` (see its PLAN.md for the full multi-source architecture).

## Nexus Integration

Not a Nexus spoke. This is a one-off content tool, not a findings source.
