# Linux Practice Sandbox — Walkthrough page map

The hexpractice graded-challenge walkthrough is maintained in TWO places and must be kept
in sync on every edit:
1. Shared folder: `~/hexworth-shared/Solutions/Linux Practice Sandbox/LINUX-SANDBOX-hexpractice-SOLUTION.md`
2. Confluence (KBA space), child of "Solutions and Walkthroughs Registry" (id 1736712)

To update the Confluence page after editing the `.md` (do NOT re-`publish`, that creates a duplicate):
`python3 _tools/confluence/publish-solution.py update <page_id> <md_file>`

| Walkthrough | Page ID | Title |
|-------------|---------|-------|
| hexpractice 5 graded challenges | 41451522 | Linux Practice Sandbox — hexpractice Graded Challenges (Walkthrough) |

URL: https://hexworth.atlassian.net/wiki/spaces/KBA/pages/41451522

QC standard: replay the transcript verbatim in a scratch HOME seeded like the image
(`~/playground/logs/app.log` = the 4 seeded lines) and run the grader's own `do_check`
conditions — must yield 5/5. Karl PASS (structural + reference), Chris PASS (verified
against the live bc1 grader `server.js:159-166`). Published 2026-07-07.
