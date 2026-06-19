# Projects Marathon — render-QC sweep + beginner-detail uplift (started 2026-06-18)

## Goal (operator directive)
"Start a marathon on the projects: run the full project-page sweep and make all our
projects more detailed so beginners can complete it."

Two workstreams:
- **A — Render-QC sweep + fix** (mechanical, decision-free): every project page renders
  correctly, no mobile overflow, no JS errors.
- **B — Beginner-detail uplift** (content): bring projects up to the zero-knowledge
  executability bar proven on `starter-first-webpage.html`.

## Scope
**127 HTML pages** in `_app/projects/` (126 projects + `index.html`), across 13 houses:
ai, cloud, code, darkarts, divergent, eye, forge, key, matrix, script, shield, starter, web.

## The beginner-executability bar (from the webpage exemplar)
A project PASSES "a beginner can complete it" only if a true novice can follow it
click-by-click, unaided, and finish with a working result. Concretely:
1. **Real tool/UI names** as they exist today (verified, not from memory).
2. **OS-level steps** where needed (make folder, create file, install, run) — not "create a file".
3. **Full-file / full-state snapshots** at each phase so there's always a whole-artifact model.
4. **Paste-ready text/code/commands** where the student must author something.
5. **Anticipated failure modes** with named fixes (the #1 beginner traps).
6. **What to ignore** — name the options to skip.
7. **Accurate prerequisites + licensing/access** (free tiers, accounts).
8. **Observable win condition + checkpoint** per phase.
9. **Honest caveats** where the simple path differs from "the real thing."

Gate each substantive content change: **Nancy (adversarial) + Chris (executability)**, plus the
**headless render-QC probe** (text gates miss render bugs).

## Workstream A — render-QC sweep
Probe: `/tmp/qc-fullsweep.js` — loads each page at 360/390, reports
`documentElement.scrollWidth - clientWidth` and JS errors. Results JSON:
`/tmp/qc-fullsweep-results.json`.

Known bug class: `.cf-req-list li { display:flex }` text won't wrap below min-content without
`overflow-wrap:anywhere`. Fix = 4-line CSS guard (proven on webpage/agent/workflow). Likely
present on every case-file page with a long requirement line.

### Sweep status
- [x] Sweep complete: **126 pages, 20 offenders, 0 JS errors, 0 load failures.**
- [x] Root mechanism diagnosed: `.cf-evidence-card { display:flex }` → `.cf-evidence-body
  { flex:1 }` has **no `min-width:0`**, so a long token anywhere in the body pins the body to
  its min-content width and every block child renders at that width (e.g. a short title showing
  553px wide). Same min-content/flex bug as `.cf-req-list li`. Pages differ only by *content*
  (a long word/URL/command), which is why only 20 of 126 tripped it.
- [x] **Universal recipe** (validated by render-time injection → all 20 go to 0px at 360/390):
  ```
  .cf-evidence-body { min-width: 0; overflow-wrap: anywhere; }
  .cf-req-list li { overflow-wrap: anywhere; }
  code { overflow-wrap: break-word; word-break: break-word; }
  .cf-code, pre { overflow-x: auto; }
  ```
  Applied to all 20 (inserted before final `</style>`).
- [ ] Re-sweep confirms 0 offenders (running)
- [ ] Deployed + verified live

Offenders fixed: starter-first-pipeline, code-arduino-pipeline, key-password-vault,
starter-github-profile, forge-virtualbox-first-vm, code-serial-console, ai-threat-classifier,
script-data-logger, darkarts-metasploit, ai-rag-chatbot, divergent-field-terminal,
starter-first-bot, cloud-container-checker, starter-first-repo, starter-first-hack,
darkarts-recon-automation, starter-first-app, matrix-traffic-dashboard, ai-intrusion-detector,
shield-ids-ml.

## Workstream B — beginner-detail uplift (prioritized)

### Depth audit (2026-06-18) — the gap is concrete
Signals: # of `.cf-steps` walkthroughs / `.cf-fix` failure boxes / `.cf-code` paste blocks / words.
- **Exemplars:** webpage = 5 steps / 2 fix / 17 code / 6,102 w; agent = 5 steps / 6,282 w;
  workflow = 3 steps / 4,591 w.
- **Everything else (19 starter pages + calculator/github-profile/portfolio):** **0 `.cf-steps`,
  0 `.cf-fix`, 0 `.cf-code`, ~3,000 w.** They have the 4-5 phase cards + checkpoints but only
  *describe the outcome* — no click-by-click steps, no paste-ready code/commands, no failure
  modes. This is the exact "outcome-description" defect the My First audit caught on Agent L1.

So Tier-1 work = give each of these the walkthrough treatment: real per-phase `.cf-steps`,
paste-ready commands/code, `.cf-fix` boxes for the top beginner traps, full-state snapshots where
it helps. Tools are real (git, Docker, nmap, Flask, SQLite, etc.) — commands must be verified
(Karl-grade), not from memory.

Tier 1 — **starter-first-\*** + 3 starters. DONE: webpage, agent, workflow.
  Pending (need walkthroughs): knowledge-base, tool, first-app, first-api, first-bot,
  first-container, first-database, first-firewall, first-gui, first-hack, first-network,
  first-pipeline, first-repo, first-scan, first-script, first-server, calculator,
  github-profile, portfolio-site.
Tier 2 — house-themed beginner projects (intro-level ai/cloud/code/etc.).
Tier 3 — intermediate/advanced house projects (detail helps, "zero-knowledge" bar relaxed).

### Scale reality
~19 Tier-1 rewrites, each comparable to the agent/webpage rebuild (multi-pass, tool-verified,
dual-gated). This is a multi-session marathon. Approach: one page (or small batch) at a time,
each grounded in current tool docs, each through Nancy + Chris + render-QC before deploy. No
mass-generation without per-page verification (avoids the "advertising-flyer" failure mode).

### Workstream B — completed pages
- **starter-portfolio-site** (DONE 2026-06-18): rebuilt 805→1290 lines. 5 phases now full
  walkthroughs (HTML skeleton w/ boilerplate, About/Skills, Projects + Contact fill-in, CSS w/
  Google Fonts + responsive grid, GitHub Pages deploy verified vs current docs). Authored by
  edu-content-designer (exemplar-grounded), then gated: Chris PASS; Nancy PAUSE→fixed (wrong
  "update nav links" claim removed; `&display=swap`→valid `&amp;display=swap`; Contact placeholder
  now filled via a real step; sticky-nav `scroll-margin-top`; Phase-3 desc mismatch). 0px overflow
  360/390/768/1280, no JS errors. **Pattern proven: delegate authoring → hard-gate → fix → ship.**

### Workstream B — in flight
- **starter-first-repo** + **starter-github-profile**: authored by edu-content-designer, both
  hard-gated → both **BLOCKED** by Nancy+Chris with legit accuracy gaps (this is the gates
  working — first drafts of tool-walkthroughs carry real OS/UI/auth inaccuracies). Fix agents
  dispatched with consolidated, verified blocker lists:
  - repo: teach opening a terminal per-OS (standardize Git Bash on Windows); kill the
    PowerShell/cmd `echo` corruption trap; `git init` hint-line output; master-vs-main; Phase-5
    auth restructured around GCM browser/credential flow (PAT as fallback); fix command-history
    snapshot; conditional `git log` pager; remove phantom mkdir fix; correct GitHub commit-count UI.
  - profile: correct pencil-edit path (click filename → pencil in file view); soften the
    unverifiable "secret repo" banner quote; remove false case-sensitivity claim; Owner-dropdown
    (not-an-org) step; orient first-time user post-sign-in; define branch/PR in plain words;
    `&mdash;`→hyphen in README snippets; stronger stats-card rate-limit note; fix "Hi there"
    checkpoint. NOTE: a reviewer (Chris) wrongly flagged the badge `&amp;` escaping — Nancy
    correctly verified `&amp;` in source copies as `&` (right for Markdown); left as-is.
- **Lesson:** gating each delegated page with BOTH Nancy+Chris is essential — the builder's domain
  accuracy (git/GitHub UI, auth, OS shells) is where first drafts fail, not structure. Re-gate
  after fixes can be leaner (verify the specific fixes + render-QC + one executability pass).

### Workstream B — shipped/committed (live unless noted)
1. starter-portfolio-site (ade48cd56) — GitHub Pages deploy walkthrough
2. starter-first-repo (7eacd7867) — git/GitHub, GCM auth
3. starter-github-profile (7eacd7867) — profile README, browser-only
4. starter-first-script (c1fa49276 / e7e7f8c6b) — Bash organizer, Git Bash on Windows
5. starter-calculator (e7e7f8c6b) — browser JS calc, fixed a real NaN bug
   (#4/#5 deploying as of this checkpoint; #1-3 verified live)
Authoring next: starter-first-server, starter-first-database.
Remaining Tier-1: first-app, first-api, first-bot, first-container, first-firewall,
first-gui, first-hack, first-network, first-pipeline, first-scan, knowledge-base, tool.

**Process that works:** delegate authoring (edu-content-designer, exemplar-grounded) →
integrity+render-QC → Nancy+Chris dual-gate (EVERY fresh page got BLOCKED on real
domain-accuracy/code defects: GitHub auth, shell traps, a live JS NaN bug, stale UI,
misdescribed layouts) → consolidated fix list → lean re-gate (single Chris) → ship.
Primary adjudicates reviewer disagreements (overrode a wrong `&amp;` escaping flag).

## TIER 1 COMPLETE (2026-06-18)
All 19 `starter-first-*` + 3 starters (calculator, github-profile, portfolio-site) are rebuilt to
the zero-knowledge executability bar and LIVE. Plus Workstream A (126-page render sweep, 20 fixed).
Pages rebuilt this marathon (each delegate-authored -> integrity+render-QC -> Nancy+Chris dual-gate
-> fix -> re-gate -> verify-live -> ship): portfolio-site, first-repo, github-profile, first-script,
calculator, first-server, first-database, first-gui, first-api, first-pipeline, first-app,
first-scan, first-container, first-network, first-firewall, first-hack, first-bot, knowledge-base,
first-tool. (webpage/agent/workflow were done pre-marathon.) EVERY fresh page hit a real BLOCK
before shipping — the dual-gate earned its place on all 19.

**RECURRING REVIEWER FALSE ALARM (do not re-fix):** the gates flagged `&lt;x&gt;`-style HTML
entities inside `.cf-code`/`<code>` as "critical copy-paste bugs" THREE times (first-api `<name>`,
github-profile `&` badge URLs, first-bot `<question>`) — each WRONG. The entity in HTML SOURCE is
what makes the displayed code correct (browser renders `&lt;x&gt;` as `<x>`; clipboard copy yields
`<x>`). A literal `<x>` in source would be parsed as an unknown tag and vanish. Real bug = only
`&amp;lt;`/`&amp;amp;` (double-escape). Verify with `grep -c '&amp;lt;\|&amp;amp;'` (expect 0),
don't trust the gate's escaping intuition.

## CODE HOUSE COMPLETE (2026-06-18)
All 10 `code-*` Code-house projects rebuilt to the zero-knowledge executability bar and LIVE.
Each delegate-authored -> integrity + god-mode render-QC -> Nancy+Chris dual-gate -> fix ->
lean re-gate -> verify-live -> ship. Two operator decisions bound this set: (1) React/Vite
projects were REBUILT AS REAL REACT (not converted to vanilla); (2) hardware/server projects
got FULL RIGOR assuming the kit/accounts as honest stated prerequisites.

Pages (commit):
1. code-typing-speed (cbc7a6950) — vanilla typing test; fixed idempotent input handler + real elapsed-time WPM
2. code-memory-game (9c034f2ed) — REAL React+Vite; fixed off-by-one best score, stale-closure difficulty, ALL_SYMBOLS 16 glyphs
3. code-wordle-clone (c4e47ca03) — REAL React+Vite; fixed VALID.has uppercase, colorless flip keyframe, dep array
4. code-task-manager (bac4d3aba) — vanilla + localStorage; var tasks=[] hoisting, saveTasks try/catch, persistence wording
5. code-cli-task-manager (32cb255e8) — Python argparse+JSON; Phase-5 state trace reconciled (done 4/remove 2), json.loads
6. code-resume-builder (afb07537e) — vanilla form->preview + window.print(); saveData try/catch, skills hasContent, dead html2canvas/jsPDF removed
7. code-chat-app (f40c6b4f0) — Node/Express 5/Socket.IO v4; impossible failure-mode trap replaced with event-name mismatch; EADDRINUSE port-first
8. code-ecommerce-stripe (9e661d773) — Stripe Hosted Checkout TEST mode; cancel-flow corrected (Stripe in-page back, not browser), express.urlencoded, key-rotation-first, Dashboard UI re-grounded
9. code-arduino-pipeline (ac26cc4df) — Arduino->serial->Python->CSV; ETL self-contradiction fixed, observable Phase-5 diagnostic, port-busy trap
10. code-serial-console (42735b6a0) — two-way Python<->Arduino LED console; GUARANTEED blink timeout bug fixed (timeout=1->3), Leonardo/Micro while(!Serial) hang guarded

Deployed in 2 batches (5 + 5). Both smoke gates 10 PASS / 0 FAIL; post-verify "FLAGGED
divergence" each time = standing QC-57 EduScan HIGH backlog, not a regression.

**Infra surfaced this leg:** `/tmp/qc-house.js` (god-mode render-QC for AccessGuard-gated
house pages — sets sessionStorage hexworth_god_mode, filters the benign addGodModeBadge
file:// error); `/tmp/qc-find-overflow.js` (names the specific overflowing element at 360px).
New overflow-guard members added to project pages as offenders surfaced:
`.cf-manifest-item` and `.cf-debrief-list li` (both grid/flex children with implicit
min-width:auto that a long code token pins past the viewport — same min-content bug class
as `.cf-req-list li`).

**Recurring false-alarm held again:** HEUR-008 `position: fixed` on the `body::after`
background layer was flagged on the hardware pages — but `body.style.filter` is never set
anywhere (not in any project page, not in AccessGuard), so HEUR-008 is inert; the pattern is
identical across all shipped project pages incl. the starter-first-webpage exemplar. Left as-is.

## WEB HOUSE COMPLETE (2026-06-18)
All 6 `web-*` projects rebuilt to the zero-knowledge bar and LIVE. These are intermediate
"build a real app" projects — same executability bar, with HONEST stated prerequisites
(Node/MongoDB/Python/a LAN host). Run in 2 deploy batches; each smoke gate 10 PASS / 0 FAIL.
Loop per page: delegate-author (grounded against LIVE vendor docs) -> integrity + god-mode
render-QC -> Nancy + Chris dual-gate -> fix -> lean re-gate -> verify-live -> ship. EVERY page
hit a real BLOCK/PROCEED-WITH-FIXES on domain accuracy — the dual-gate earned its keep again.

Wave 1 (frontend/browser, commits 7112405a8 / db95cac85 / b81d0a81e):
1. web-online-portfolio — HTML/CSS/JS portfolio (theme toggle, parallax, IntersectionObserver). Fixes: added the promised full-file snapshots to phases 3-5; real CSS cascade bug (prefers-reduced-motion hover not suppressed) reordered to win; honest no-backend contact form.
2. web-topology-visualizer — Canvas 2D network viz (pan/zoom/drag, animated traffic, force layout, PNG export). Core coord math was correct; fixes: geometric-cooling comment, .dragging class actually added, dead gradient code removed, impossible "clearRect race" .cf-fix rewritten.
3. web-react-router — REAL React+Vite+React Router product site. Verified LIVE: React Router's package is now `react-router` (NOT react-router-dom), v8. Fixes: full Navbar.jsx snapshot (was a partial that would destroy components), Router-context .cf-fix, correct styled-components dev/prod note (SWC not Babel for Vite).

Wave 2 (backend/server, commit 21b0348e1):
4. web-rest-api — Node/Express 4.x/MongoDB(Mongoose 9)/JWT/multer, curl-tested. Prereq: free MongoDB Atlas M0. Fixes: harmonized duplicate-email message so checkpoint matches code, Atlas URI DB name, Windows cmd.exe curl .cf-fix, rejected-upload 400-not-500.
5. web-elearning-flask — Flask 3.1/Flask-SQLAlchemy(SQLite, modern SQLAlchemy 2.x)/Flask-Login. Fixes: closed an OPEN REDIRECT in the login `next` param (urlparse netloc validation), checkpoint course count, navbar aria attrs, N+1 caveat.
6. web-pi-network-probe — Python probe (ping sweep, socket port check, SQLite uptime, Flask dashboard, alerts). Prereq: any Python 3 LAN host (Pi optional) + up-front ethics notice. Fixes: macOS `ping -W` is MILLISECONDS (verified ss64) so the shared Linux/Mac `-W 1` made every host show DOWN on a Mac -> split into Windows/Darwin(`-W 2000`)/Linux branches; rewrote a Phase-5 alert test that couldn't fire (in-memory previous_state); added PRAGMA journal_mode=WAL for the concurrent writer+reader.

**Pattern note for the remaining houses:** these intermediate projects carry MORE domain-accuracy
risk than the starters (live-drifting library APIs, OS-specific CLI flags, auth/DB/security). The
"ground against LIVE docs via WebFetch in the authoring prompt" + "Nancy verifies the high-stakes
version/API claim herself" approach caught: the react-router package rename, the macOS ping-flag
unit, an open-redirect, and several checkpoint-vs-code mismatches. Keep doing both.

## SCRIPT HOUSE COMPLETE (2026-06-19)
All 8 `script-*` projects rebuilt to the zero-knowledge bar and LIVE. Run in 3 prereq-grouped
waves; each smoke gate 10 PASS / 0 FAIL. Loop per page: delegate-author (grounded against LIVE
docs) -> integrity + god-mode render-QC -> Nancy + Chris dual-gate -> fix -> lean re-gate ->
verify-live -> ship. EVERY page hit real domain-accuracy must-fixes — the dual-gate + live-doc
verification earned their keep again.

Wave 1 — universal runtimes (commit 8f1dfd6f6):
1. script-system-monitor (Bash, Linux/WSL) — CPU iowait-in-idle delta fix, trap de-register, df portability, macOS honesty
2. script-web-crawler (Node) — Phase-2 BFS fetched-count termination, SVG isAllowed label, .text vs .attr
3. script-video-summarizer (Python) — youtube-transcript-api 1.2.4 .fetch(), NLTK punkt_tab; id-format guard, ratio clamp, AgeRestricted
4. script-etl-pipeline (Python) — SQLite UPSERT/PK; pandas-label SVG fix, loaded->upserted, context-mgr one-liner

Wave 2 — accounts/frameworks (commit 6c7b450ab):
5. script-github-actions — VERIFIED LIVE via gh api that checkout@v7/setup-node@v6/upload-artifact@v7 are CURRENT (a Chris BLOCK from stale training knowledge was OVERRIDDEN by live data — same lesson as react-router/macOS-ping). Fixes: download-artifact@v4->@v8, PR-trigger for the skip demo, notify skip-propagation prose, matrix job.status output removed.
6. script-data-pipeline (Kedro 1.4) — recomputed a WRONG expected-output table to ground-truth 7 rows (ran the actual logic in python3 to settle a 7-vs-9 reviewer dispute); venv ../path, units_bar, learning-curve note

Wave 3 — hardware (commit 33ea47bc9):
7. script-data-logger (Arduino + SD/RTC/DHT11/LDR) — while(!Serial) timeout-guard (CDC boards), pandas>=2.0, DS3231 OSF note
8. script-pi-automation (Raspberry Pi) — vcgencmd CPU temp (thermal_zone0 != CPU on Pi 5!), cron bare-assign not .bashrc, $HOME user-agnostic

**Cross-house lesson reinforced:** for intermediate projects, ground authoring against LIVE docs
via WebFetch AND have Nancy independently verify the high-stakes version/API/value claim. This
caught: the GH action versions (Chris was wrong from stale knowledge; gh api was right), the
macOS ping-flag unit, the Pi 5 thermal-zone sensor, an open-redirect, a react-router rename, and
multiple checkpoint-vs-code mismatches. When reviewers disagree on a verifiable fact, COMPUTE/QUERY
the ground truth (gh api, python3) rather than trust either's assertion.

### Cloud house — ALL ~13 `cloud-*` DONE + LIVE (3 waves)

Wave 1 (commit b2f0f0f6c): container-checker (Docker; f-string `{x:<N}` bare `<` escaped),
k8s-deploy (minikube; nginx 1.26->1.27 real rollout), helm-charts (Helm v3; `myapp.chart`
defined), pi-homelab (Pi; raspbian->debian repo on 64-bit).

Wave 2 (commit a007e7a8b): ec2-first-server (free-tier July-2025 model, t3.micro primary),
s3-static-site (eu-west-2 DOT endpoint WebFetch-verified, account-BPA), oracle-free-vm (removed
false "60-day login" claim -> real utilization reclamation; A1 corrected to 4 OCPU/24 GB),
aws-vpc (no NAT Gateway; EIP all-public-IPv4 charge; subnet-disassociate teardown step).

Wave 3 (commit f4a9d4bf7): api-nginx (reverse proxy + gunicorn + systemd, local/free; ProxyFix
x_host wired to X-Forwarded-Host), django-eks (eksctl; --wait teardown; LB-before-cluster order;
ECR nginx 1.27->1.28 live tags; cost-safety hammered up front), serverless-django (Zappa/Lambda;
Django 5.x STORAGES dict — was the REMOVED `STATICFILES_STORAGE` = collectstatic crash; mandatory
log-group + undeploy teardown), terraform-infra (provider ~>6 split S3 versioning; `bucket_region`
exported attr — was non-existent `.region` = apply failure; mandatory destroy + .gitignore),
budget-fern (Firebase v12 modular; client read-only Firestore rules + Admin-SDK writes; proactive
composite-index step; full-file Dashboard.jsx).

**Cloud-house lesson:** Nancy (deep API/cost correctness) caught hard BLOCKs that Chris
(executability) passed — Django 5.1 STORAGES crash, TF `bucket_region`, EOL nginx ECR tags, the
false Oracle login claim. Run BOTH gates on every cloud page; cost-safety is its own gate dimension
(mandatory + correctly-ordered teardown, free-tier accuracy, no orphan resources). When a
version/attribute claim is load-bearing, WebFetch the authoritative doc (ECR gallery, TF registry,
AWS pricing) rather than trust either reviewer.

### AI house — ALL 12 `ai-*` DONE + LIVE (3 waves)

These pages had the phase-card SHELL but `cf-code=0` — prose descriptions, not executable. Rebuild =
preserve shell + ADD the `.cf-steps`/`.cf-code`/`.cf-fix`/`.phase-checkpoint` CSS + transform every
phase into runnable, version-grounded content.

Wave A (commit 5829a4851): face-detection (OpenCV DNN SSD vs dlib HOG; verified-live model URLs),
data-augmentation (Albumentations 2.0.8; ToTensorV2/Normalize roles correct), explainable-ml
(SHAP 0.52 Explanation API + LIME + permutation importance; built-in dataset), reinforcement-taxi
(gymnasium 1.3 Taxi-v4, 5-tuple step API, tabular Q-learning).

Wave B (commit adafa221d): intrusion-detector (NSL-KDD RandomForest; real KDDTest+ counts 9711/12833;
ROC uses P(attack)), network-anomaly (IsolationForest + LOF; hardware-draft SVG retargeted to ML
labels), threat-classifier (TF-IDF + LogisticRegression on imbalanced SOC alerts; no-leakage),
music-generation (music21 + Markov -> playable MIDI; bwv66.6 = 165 notes, verified by run).

Wave C (commit 1bb95bd70): rag-chatbot (LangChain 1.x + Ollama + Chroma free-local; coherent
langchain-core 1.4.8 stack), rasa-chatbot (Rasa 3.6.21 honest Python 3.8-3.10 lock), research-agent
(LangChain create_agent + Ollama qwen3:4b tool-calling + ddgs search), build-your-department
(Microsoft Copilot Studio no-code capstone; trial-completable via Test pane, MS-doc grounded).

**AI-house lesson:** the LLM/ML ecosystem churns fast — WebFetch PyPI/docs for EVERY load-bearing
version/API/dataset-URL. Nancy caught a ROC inversion, gym->gymnasium 5-tuple, Django-removed
STORAGES, a pip langchain-core 0.x-vs-1.x dependency conflict, the ddgs import rename, a non-existent
create_agent kwarg, and Copilot Studio trial/analytics false premises. Two reviewer conflicts settled
by querying ground truth (WebFetch): Taxi-v4 IS real (gymnasium 1.3); langchain 1.3.10 + create_agent
ARE current. Defaults: LLM projects use a free local Ollama path (no paid key); version-locked libs
(Rasa) get an honest Python-compat statement up front; no-code GUI pages (Copilot Studio) = precise
click-by-click steps + Test-pane checkpoints grounded against current vendor docs.

**Remaining (NOT started):** Tier 2/3 across darkarts, divergent, eye, forge, key,
matrix, shield. ~68 house project pages still on their original outcome-description content
(render-clean after Workstream A).

## Progress log (newest first)
- 2026-06-18: Marathon started. Enumerated 127 pages. Full render-QC sweep launched.
  Prior: webpage brought to tutorial standard (`b046e5768`); agent+workflow overflow fixed
  (`c083584c2`). See `my-first-series-audit-2026-06-17.md`.
