# SEO Monitoring Runbook

**Status:** Active operations doc
**Created:** 2026-06-02 (CAREER-4 follow-up)
**Owner:** Platform operator

## What this runbook covers

The Hexworth Prime SEO surface shipped in commit `0c1153f85` (CAREER-4) added the infrastructure needed for search engines to discover and index the platform's public pages. This runbook is the operational procedure that keeps the system healthy and surfaces problems when they appear.

It does NOT cover SEO content strategy (which queries to rank for, how to write better titles, link-building, etc.). It covers the monitoring side: did Google see the sitemap, what got indexed, what errors does GSC report, when to act.

## What's deployed on production

- `/robots.txt` — allows all crawlers, points to sitemap, disallows bot-knowledge / archive / components / lib / config paths
- `/sitemap.xml` — 25 curated public URLs (6 landing-class, 5 Career Launchpad, 13 per-house careers, the Signal hub)
- SEO meta block on 25 public pages: `<meta name="description">`, Open Graph, Twitter card, canonical URL, JSON-LD structured data (EducationalOrganization, Course, FAQPage, WebPage as appropriate)
- `/c9ef8e71d110cb110ef4fc14f2579eff.txt` — IndexNow key file (proof of ownership)
- `_tools/seo/ping-indexnow.py` — script to notify Bing-family search engines of fresh content

## Initial submission procedure (one-time)

This runs once when SEO is first turned on, then again if domain changes or GSC property is reset.

### Google Search Console

1. Sign into [search.google.com/search-console](https://search.google.com/search-console) with the Hexworth admin Google account.
2. **Add property** → **Domain** (not URL prefix). Covers hexworth.com + all subdomains in one property.
3. **Verify ownership** via DNS TXT record. Google supplies a string like `google-site-verification=abc123xyz...`. Add as TXT record at the root of the hexworth.com DNS zone. Wait ~5 minutes for propagation, click verify. Confirm: success message in GSC.
4. **Submit sitemap** in left sidebar → **Sitemaps**. Enter `sitemap.xml` (root is implied). Click submit. Status should change to "Success" within minutes.
5. **Request indexing** for top 5 priority URLs via **URL Inspection**:
   - `https://hexworth.com/`
   - `https://hexworth.com/career/`
   - `https://hexworth.com/career/career-paths.html`
   - `https://hexworth.com/houses/shield/careers.html`
   - `https://hexworth.com/houses/eye/careers.html`
   For each, paste URL into inspection bar, click **Test live URL**, then **Request indexing**.

### Bing Webmaster Tools

1. Sign into [bing.com/webmasters](https://www.bing.com/webmasters).
2. Add site → **hexworth.com**.
3. If GSC was set up first: click **Import from Google Search Console**. Bing inherits the verification and pulls the sitemap automatically.
4. Otherwise: verify ownership (DNS, HTML file `BingSiteAuth.xml`, or meta tag), then submit sitemap manually.
5. Confirm sitemap status in **Sitemaps** view.

### IndexNow (Bing-family, NOT Google)

**Auto-pinged on every `./deploy.sh` run as of 2026-06-02.** Step 7/7 of the deploy script runs `python3 _tools/seo/ping-indexnow.py` after Confluence inventory regen succeeds. Non-blocking: ping failures never fail a deploy that already shipped. The deploy log shows `✓ N URLs accepted (Bing, Yandex, Seznam, Naver)` on success.

Skip with `--skip-indexnow` if needed:

```bash
./deploy.sh --skip-indexnow
```

Manual ping (for ad-hoc notification between deploys, e.g., a sitemap change that does not trigger a hosting deploy):

```bash
cd /home/eq/ai-content/hexworth-prime
python3 _tools/seo/ping-indexnow.py
```

This POSTs all 25 sitemap URLs to the central IndexNow endpoint, which forwards to Bing, Yandex, Seznam, and Naver. URLs get crawled within hours.

Specific URL ping (faster than full sitemap):

```bash
python3 _tools/seo/ping-indexnow.py --url https://hexworth.com/houses/eye/careers.html
```

Dry-run to see what would be sent:

```bash
python3 _tools/seo/ping-indexnow.py --dry-run
```

Per-engine pings (route around central endpoint if it is down):

```bash
python3 _tools/seo/ping-indexnow.py --per-engine
```

The script exits 0 on success (HTTP 200/202), 1 on failure.

## Ongoing monitoring cadence

### Weekly (15 min)

1. **GSC Coverage report** — check the "Pages" section. Looking for:
   - **Valid (indexed)** count growing toward 25 (the sitemap total). Within first 30 days, should reach 20+.
   - **Excluded** with reason "Discovered, currently not indexed" — patience required, normal for low-authority new sites
   - **Excluded** with reason "Page with redirect" — broken; usually means a canonical URL points to a redirect chain. Fix the canonical.
   - **Error** with any 5xx — Hexworth-side problem; check Cloud Logging for the URL
2. **GSC Performance report** — last 7 days. Note total impressions + clicks. Trend should be upward as Google indexes more pages.
3. **Bing Webmaster Tools** equivalent of both.

### Monthly (30 min)

1. **GSC Enhancements** section — structured data validation. Each page type (Course, FAQPage, EducationalOrganization) should show as recognized rich-result-eligible. If any errors appear, fix the JSON-LD in the affected pages.
2. **Mobile Usability** report in GSC — should be all green. If issues appear, run the affected pages through PageSpeed Insights and fix.
3. **Core Web Vitals** report — LCP, FID, CLS thresholds. Slow pages should be optimized.
4. **Search Analytics deep dive** — what queries are bringing traffic? Surprises both ways are useful:
   - Unexpected high-traffic queries → consider creating dedicated landing content
   - Expected queries with no traffic → page may need title/description tuning

### Quarterly (60 min)

1. **Sitemap accuracy audit** — has new public content shipped that's NOT in sitemap.xml? Add it.
2. **JSON-LD schema audit** — does each Course schema accurately reflect what the page describes? Update names, descriptions as content evolves.
3. **Cert exam code audit** — exam codes change (Sec+ moved SY0-601 → SY0-701 in 2024). The per-house careers pages reference specific codes; verify they're current and update if not.
4. **Salary range audit** — BLS data updates annually. The 2026 USD ranges in careers pages should be reviewed each year, adjusted as needed.
5. **Backlink check** — Google rewards inbound links. Use GSC Links report or third-party (Ahrefs, Moz, Semrush). Identify gaps and opportunities for partnership / publication / community contribution.

## When to expect what

| Timeline | Expected state |
|---|---|
| Day 0 (sitemap submitted) | GSC accepts sitemap, queues URLs |
| Day 1-3 | Top priority URLs you explicitly requested get crawled and indexed |
| Day 7-14 | Most sitemap URLs get crawled |
| Day 14-30 | Pages start ranking for low-competition queries ("hexworth prime", "hexworth careers") |
| Day 30-90 | Ranking matures for medium-competition queries ("AI security careers", "cybersecurity career path") |
| Month 3+ | High-competition queries depend on content depth + backlinks |

## Common issues + fixes

### Sitemap not being read

- Check `https://hexworth.com/sitemap.xml` returns HTTP 200 with valid XML
- Check `https://hexworth.com/robots.txt` lists the sitemap correctly
- Resubmit in GSC Sitemaps section

### Page indexed but ranking nowhere

- Title and H1 might be too generic. Refresh.
- Meta description may not match what users actually search for. A/B different framings.
- Content may be too thin. Google rewards depth.
- No inbound links. Get linked from somewhere.

### Page not indexed despite being in sitemap

- Check **URL Inspection** in GSC for the URL. It will tell you exactly why.
- Common reason: page is auth-gated (AccessGuard) and Google's crawler can't render past it. Confirm the page is genuinely public (no AccessGuard, no noindex).
- Another common reason: canonical URL points to a different URL. Fix the canonical.

### Structured-data validation errors

- Run the page through [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Fix the JSON-LD in the page's `<script type="application/ld+json">` block
- Wait for next crawl; GSC will re-validate

### IndexNow ping fails with 403

- Key file at `/c9ef8e71d110cb110ef4fc14f2579eff.txt` must be reachable and contain exactly the key string
- Verify with `curl https://hexworth.com/c9ef8e71d110cb110ef4fc14f2579eff.txt`
- If key was rotated, update `KEY` constant in `_tools/seo/ping-indexnow.py` AND the key file

### IndexNow ping fails with 422

- URLs in the payload don't all belong to `hexworth.com`. Check the sitemap.
- Make sure all URLs use the same scheme (https) and host

## Out of scope for this runbook

- Content strategy: which queries to target, keyword research, intent matching
- Link-building outreach: how to get backlinks from industry sites
- Paid SEM (Google Ads) integration
- International SEO (multiple-language variants of hexworth.com)
- AMP / instant articles

These are separate decisions if Hexworth grows into them.

## Related

- `_app/sitemap.xml` — the canonical list of public URLs
- `_app/robots.txt` — crawler directives
- `_tools/seo/ping-indexnow.py` — fresh-content notification script
- `_docs/research/hacker-fantasy-landscape-2026-06-02.md` — career-bridge tier strategy memo
- Memory: `project_career_area_audit_2026_06_02` — original SEO gap analysis
- Commit: `0c1153f85` — CAREER-4 SEO foundation
