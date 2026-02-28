# AI Scraper — Microsoft Learn Content Scraper

Scrapes Microsoft Learn learning paths into structured markdown for the Hexworth Prime AI House.

## Usage

```bash
# Scrape default AI-900 learning path
python3 _tools/ai-scraper/scrape-mslearn.py

# Scrape a specific learning path
python3 _tools/ai-scraper/scrape-mslearn.py <learning-path-url>
```

## How It Works

1. Fetches the learning path page from Microsoft Learn
2. Discovers all modules within the path
3. For each module, extracts content into clean markdown
4. Writes output to `_app/houses/ai/reference/microsoft-learn/<module-slug>.md`

## Dependencies

- Python 3
- `requests` — HTTP client
- `beautifulsoup4` — HTML parsing

## Details

| | |
|---|---|
| **Type** | Python CLI script |
| **Location** | `_tools/ai-scraper/scrape-mslearn.py` |
| **Output** | `_app/houses/ai/reference/microsoft-learn/` |
| **User-Agent** | Educational scraper identifier with project URL |

This is the original prototype scraper (AI-12). The generalized version lives in `_tools/scraper-core/` (see its PLAN.md for the full multi-source architecture).

## Nexus Integration

Not a Nexus spoke. This is a one-off content tool, not a findings source.
