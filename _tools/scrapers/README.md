# Scrapers

Content pipeline tools for discovering, classifying, and importing external content into Hexworth Prime.

## Tools

### content-classifier.js (SC-5)

Auto-tagger for scraped content. Classifies HTML files by Hexworth house, maps to cert objectives (CompTIA/AWS/Cisco/Microsoft), and estimates difficulty level.

```bash
node content-classifier.js classify <file>       # Classify a single file
node content-classifier.js batch <directory>      # Batch classify all HTML files
node content-classifier.js report                 # Show last batch report
```

**Output:** `classification-report.json`

### repo-scout.js (RS-2)

GitHub repository discovery tool. Searches for educational repos, scores them on relevance/quality, and extracts content files.

```bash
node repo-scout.js search <query>           # Search GitHub repos
node repo-scout.js evaluate <owner/repo>    # Score a specific repo (stars, topics, readme, activity, license)
node repo-scout.js extract <owner/repo>     # Download relevant files (md, html, ipynb, py, sh)
node repo-scout.js batch                    # Search across all configured topics
node repo-scout.js catalog                  # Show the current catalog
```

**Output:** `repo-catalog.json`, `extracted/<owner>--<repo>/`

Set `GITHUB_TOKEN` env var to raise the API rate limit from 60 to 5000 requests/hour.

## Dependencies

None. Built-in Node.js modules only (fs, path, https).
