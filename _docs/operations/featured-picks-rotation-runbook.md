# Featured Picks Weekly Rotation Runbook

**Status:** Active operations doc
**Created:** 2026-06-03 (LIVE-5)
**Sprint:** LIVE-5 — Admin path for setting weekly editorial pick

## What this covers

The Internship Finder and Job Board pages render an editorial "Spotlight" section at the top, populated from `_app/data/featured-pick-internship.json` and `_app/data/featured-pick-job.json`. These JSON files are checked into the repo and ship with each hosting deploy.

This runbook is the operator procedure for rotating the picks each Monday.

## Pick rotation cadence

Recommended: **Monday at 9 AM eastern**, weekly.

Rotation is manual. The 7-day cadence matches the `rotates_after` field in each JSON file. If a pick stays past its `rotates_after` date, the spotlight still renders, but the doc is stale.

## How to rotate the Internship spotlight

1. Open `/home/eq/ai-content/hexworth-prime/_app/data/featured-pick-internship.json` for editing.
2. Choose the next program. The 45-program curated dataset is documented inline in `_app/career/internships.html` (the `PROGRAMS` array near the bottom of the JS block). Most natural rotation sources:
   - **Federal track:** DoD SkillBridge, NSA Stokes, FBI Honors, CISA Pathways, SFS/CyberCorps, NIST SURF, NSA Co-op
   - **Defense industrial base:** Lockheed Martin, Northrop Grumman, RTX, Booz Allen, Leidos, MITRE, SAIC
   - **Vendor:** Microsoft, Google STEP, Cisco, Splunk, Palo Alto Networks (LEAP/CAMP), CrowdStrike, Cloudflare, Mandiant, IBM Security, AWS, Meta
   - **Pseudo / alt-path:** HackerOne Hacker101, Bugcrowd University, Synack Red Team, Intigriti, Hack The Box Academy, TryHackMe, PentesterLab, OffSec
   - **Academic / pathway:** SANS Cyber Academy, WiCyS, Black Girls Hack, Apprenti, National Cyber Scholarship Foundation, CYBER.ORG, CyberSeek
3. Fill in the JSON with the program's current data. Required fields:
   - `type` (always `"internship"`)
   - `id` (kebab-case, year-quarter suffix, e.g. `nsa-stokes-2026-q3`)
   - `name`, `sponsor`, `tagline`, `story`, `why_hexworth`
   - `deadline_note` or `deadline`
   - `eligibility` (array of 3-5 short bullet points)
   - `duration`, `paid`
   - `url` (official program landing page; verify it returns HTTP 200 before saving)
   - `tags.houses` (array of house slugs that benefit from this program)
   - `tags.region`, `tags.level`, `tags.type`
   - `updated` (today's date)
   - `rotates_after` (today + 7 days)
4. Verify the URL is current. Federal program URLs change occasionally; use `python3 _tools/search/search-all.py "<program name>"` to find any updates documented in the repo or Confluence first.
5. `git diff _app/data/featured-pick-internship.json` to review your change.
6. Commit on master: `git add _app/data/featured-pick-internship.json && git commit -m "docs(featured-picks): rotate internship spotlight to <program>"`
7. Deploy: `./deploy.sh`
8. Verify live: visit https://hexworth.com/career/internships.html, confirm the Spotlight section shows the new program.

## How to rotate the Job Board spotlight

Same procedure, different file: `_app/data/featured-pick-job.json`.

The Job Board pick is a **Featured Employer** (not a single role). Required fields:
- `type` (always `"employer"`)
- `id`, `name`, `sponsor`, `tagline`, `story`, `why_hexworth`
- `what_they_value` (array of 3-5 short bullets describing what the employer screens for)
- `common_roles` (array of role titles they hire for)
- `cert_signal` (one sentence on what certs they value most)
- `url` (their main careers page)
- `deep_link_search_url` (their careers page pre-filtered to cyber roles, if available)
- `tags.houses`, `tags.level`, `tags.region`, `tags.type`
- `updated`, `rotates_after`

Sources of Featured Employer ideas:
- **High-volume cyber hirers:** CrowdStrike, Palo Alto Networks, Cloudflare, Microsoft Security, Google Cloud Security, IBM Security, Splunk, Mandiant
- **Defense industrial base:** Lockheed Martin, Northrop Grumman, Raytheon, L3Harris, Booz Allen Hamilton, Leidos
- **Specialty cyber:** Rapid7, Tenable, Qualys, Recorded Future, FireEye/Trellix, SentinelOne, Tanium, Snyk
- **Federal direct-hire:** USDS, USCIS, the various DoD cyber commands (USCYBERCOM, AFCYBER, ARCYBER, MARFORCYBER, FLTCYBERCOM)

## Future automation paths (not built yet)

The current procedure is fully manual (edit JSON, commit, deploy). Future improvements that would reduce friction:

- **Admin form on handler-dashboard.html.** A small section in the existing handler-dashboard that lists the 45 internship programs in a dropdown, has fields for the operator to fill in story/why-hexworth/deadline, and saves to Firestore `featured_picks/current`. The Spotlight section on both pages would fall back to Firestore if the static JSON file is older than 7 days. Would require Firestore Web SDK on the public pages, which doubles their JS bundle. Probably not worth it for a weekly cadence.
- **Auto-rotation via Cloud Scheduler.** Schedule a CF that picks the next program from a rotation queue every Monday at 9am. Removes operator load but loses editorial discretion (some weeks deserve a specific feature, e.g., during a real application window).
- **Sourcing from LIVE feed.** The fetchOpportunities CF (LIVE-2) populates `featured_opportunities` with real openings every 4 hours. The Spotlight could surface the highest-hexworthScore entry of the week instead of an operator-curated one. Loses editorial depth (no "story" or "why_hexworth" framing from the operator), but removes manual work entirely. Best as a fallback when operator hasn't rotated in 14+ days.

## Related

- `_app/career/internships.html` — Spotlight renderer reads from `/data/featured-pick-internship.json` on page load
- `_app/career/job-board.html` — same pattern for Featured Employer
- `functions/fetchOpportunities.js` — LIVE-2 scheduled aggregator that populates the live-feed section
- `firestore.rules` — LIVE-3, `featured_picks` and `featured_opportunities` collection rules
- `_docs/operations/seo-monitoring-runbook.md` — adjacent operations doc
- Memory: `feedback_grep_before_asserting.md` — search before stating any value
