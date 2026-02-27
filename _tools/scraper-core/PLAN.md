# Scraper Core — Architecture & Implementation Plan

## Overview

A three-layer content scraping infrastructure for Hexworth Prime. Designed to systematically
discover, extract, classify, and organize educational content from Microsoft Learn, GitHub,
and other sources. Build the scrapers now, test on AI content, unleash at scale when Neon
storage is ready.

## Architecture

```
Layer 1: Scraper Core (SC-1, SC-2)
  Shared infrastructure — rate limiting, caching, output format, storage schema, CLI

Layer 2: Source Scrapers (SC-3, SC-6, SC-7, SC-8)
  Microsoft Learn crawler | GitHub repo discovery | (future: documentation sites)

Layer 3: Content Processing (SC-5) + Production Sweeps (SC-4, SC-6, SC-7)
  Classifier/tagger | AI cert sweep | Security sweep | Azure sweep

Layer 4: Content Hubs (AI-13 through AI-18)
  Curated landing pages organizing scraped content by topic/cert/skill
```

## Directory Structure

```
_tools/scraper-core/
  PLAN.md                        # This file
  config.yaml                    # Rate limits, output dirs, API keys (gitignored)
  requirements.txt               # Python dependencies
  setup.py                       # Package setup

  scraper/
    __init__.py
    base.py                      # BaseScraper class (SC-1)
    cache.py                     # Response cache with TTL
    cli.py                       # Click-based CLI entry point
    classifier.py                # Content classifier & tagger (SC-5)

  scraper/sources/
    __init__.py
    mslearn.py                   # Microsoft Learn crawler (SC-3)
    github_discovery.py          # GitHub repo discovery (SC-8)

  output/                        # Scraped content (gitignored)
    microsoft-learn/
      certifications/
        ai-900/
        ai-102/
        ai-050/
        sc-900/
        sc-200/
        az-900/
        az-104/
        ...
      topics/
        agents/
        prompt-engineering/
        rag/
        ...
    github-repos/
      ai/
      security/
      automation/
      ...
    index.json                   # Master catalog of all scraped content

  logs/                          # Structured JSON logs (gitignored)
  cache/                         # Response cache (gitignored)
```

## Sprint Sequence & Dependencies

```
SC-1 (Framework)  ──────────────────────┬──── SC-3 (MS Learn Crawler)
                                        │       ├── SC-4 (AI Cert Sweep) ──── AI-13, AI-16, AI-17, AI-18
                                        │       ├── SC-6 (Security Sweep)
                                        │       └── SC-7 (Azure/Cloud Sweep)
SC-2 (Storage Schema) ─── SC-5 (Classifier) ────┘
                                        │
SC-1 ──────────────────── SC-8 (GitHub Discovery) ──── AI-14, AI-15
```

### Phase 1: Foundation (SC-1, SC-2)
Build the shared framework and define storage schema. No content scraped yet,
but the structure is ready.

### Phase 2: Microsoft Learn Scraper (SC-3)
Generalize the AI-12 prototype into a reusable crawler. Test against known
AI-900 content to validate output quality.

### Phase 3: First Production Sweep (SC-4)
Sweep all AI certifications. This is the test run that proves the pipeline.
Validate: content quality, deduplication, metadata richness, storage organization.

### Phase 4: Classifier & Tagging (SC-5)
Build the auto-tagger that enriches metadata with topics, hub assignments,
house mappings, difficulty levels. Runs against SC-4 output.

### Phase 5: Expand Sources (SC-6, SC-7, SC-8)
With the pipeline proven on AI content, expand to:
- Security certs (SC-6) — feeds Shield, Dark Arts, Eye houses
- Azure/Cloud certs (SC-7) — feeds Cloud house
- GitHub repos (SC-8) — feeds AI and Code houses

### Phase 6: Content Hubs (AI-13 through AI-18)
Build curated landing pages that organize scraped content into browsable
topic-based hubs within the AI house.

## Content Hub Plan

| Hub ID | Title | Key Sources | Primary Content |
|--------|-------|-------------|-----------------|
| AI-13 | Agent Architecture | MS Learn, GitHub (langchain, crewai, autogen) | Agent patterns, memory, tools, multi-agent |
| AI-14 | CLI & Dev Tools | GitHub (claude-code, copilot, aider) | AI-powered development tools |
| AI-15 | N8N & Automation | GitHub (n8n), MS Learn (Power Automate) | No-code AI automation platforms |
| AI-16 | Advanced Features | MS Learn (Azure OpenAI), GitHub | RAG, fine-tuning, embeddings, evaluation |
| AI-17 | AI-102 Cert Track | MS Learn (AI-102 paths) | Structured cert prep with study guide |
| AI-18 | Azure OpenAI Hub | MS Learn (Azure OpenAI) | Enterprise AI platform deep dive |

## Key Design Decisions

1. **Python-based** — requests + BeautifulSoup + markdownify. Same stack as AI-12 prototype.
2. **Local-first storage** — filesystem output, portable to Neon server later.
3. **Incremental scraping** — track last-scraped timestamps, only re-fetch updated content.
4. **Deduplication by content hash** — SHA-256 of extracted markdown prevents duplicate storage.
5. **Polite crawling** — 1s delay between requests, educational User-Agent, respect rate limits.
6. **Separate scraping from curation** — raw scraped content stays in _tools/scraper-core/output/.
   Curated hubs in the AI house reference this content but are hand-curated selections.

## Relationship to Existing Systems

- **AI-12 prototype** (`_tools/ai-scraper/`) — SC-3 generalizes this into the full MS Learn crawler.
- **Repo Scout** (RS-1 through RS-9) — focuses on GitHub repo discovery for educational content
  to fork and convert. SC-8 complements this with AI/automation-specific repo discovery.
  RS handles the full fork→extract→convert pipeline; SC focuses on content scraping.
- **Neon Server** (NE-1 through NE-3) — future storage backend. Once Neon is online, scraped
  content migrates from local filesystem to server storage with network access from all devs.

## Metrics & Validation

After each sweep, validate:
- Content quality: spot-check 10 random modules for clean markdown formatting
- Completeness: compare module count against MS Learn catalog (no missing modules)
- Metadata accuracy: verify cert mappings, topic tags, house assignments
- Deduplication: no duplicate entries in index.json
- Storage efficiency: reasonable file sizes, no bloated HTML artifacts in markdown
