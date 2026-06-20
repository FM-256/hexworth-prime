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

### Eye house — ALL 5 `eye-*` DONE + LIVE (commit 6d64ee7ac)

These pages were BARER than the rest: no phase-progress scaffold at all (no `id=phase-N`, no
togglePhase, no closing script) AND no AccessGuard. The rebuild added the full interactive system
(`id=phase-N` + phase-check + togglePhase + progress tracker + ModuleProgress.js + commented closure)
plus the `.cf-steps`/`.cf-code`/`.cf-fix`/`.phase-checkpoint` CSS, and transformed prose phases into
runnable code. The ungated state was PRESERVED (no AccessGuard added — flagged to the operator as a
possible platform inconsistency to decide on separately). Accent `#c084fc`.

Pages: eye-selenium-testing (Selenium 4.x with built-in Selenium Manager — webdriver-manager retired —
+ Page Object Model + pytest-html, against the-internet.herokuapp.com), eye-playwright-testing
(Playwright-for-Python, auto-waiting, trace viewer, parallel run), eye-pytorch-onnx (train a small
PyTorch MNIST CNN → export ONNX → run client-side in the browser via onnxruntime-web; the
Python↔JS preprocessing contract is the crux), eye-motion-surveillance (OpenCV MOG2 background
subtraction + contours, webcam with a video-file/headless fallback, try/finally-safe recording),
eye-osint-dashboard (PASSIVE/public OSINT — DNS/WHOIS/crt.sh CT logs/HTTP headers — behind a prominent
authorization/ethics notice, aggregated in a Flask dashboard).

**Eye-house lesson:** a reviewer conflict on `torch.onnx.export(dynamo=False)` (INVALID in torch 2.3.0
— the kwarg landed later → TypeError) was settled in Nancy's favor; she also caught a verify-script
that compared the ONNX model against a RANDOM-weight PyTorch model (must save/load the `.pth`), a wrong
Playwright title assertion (use a `re.compile` regex, never a brittle exact title), a pytest
`hookwrapper=True` deprecation, a headless `Ctrl+C` corrupt-file path (wrap the capture loop in
try/finally), and a wrong `whois.parser.PywhoisError` path (→ `whois.exceptions`). OSINT content rule:
mandatory prominent authorization/ethics notice, passive/public techniques only, plus a
domain-validation/SSRF hygiene note.

### Matrix house — ALL 10 `matrix-*` DONE + LIVE (2 waves)

Matrix pages already had the phase scaffold (togglePhase/id=phase-N) — the rebuild was prose→executable
(numbered cf-steps + paste-ready code + cf-fix + phase-checkpoint) + adding the cf-* CSS in Matrix green
(`#00ff41`). 8 are gated (`require('sorted')`); packet-visualizer + traffic-dashboard are ungated (preserved).

Wave A (commit 1811597e4): customer-segmentation (sklearn K-Means, elbow+silhouette), time-series
(statsmodels SARIMAX, AirPassengers, chronological split), sentiment-nlp (VADER + HuggingFace
transformers two-method compare), stock-analysis (yfinance + CSV-cache fallback), climate-analysis
(synthetic series, warming-trend regression, decomposition, forecast).

Wave B (commit 74856a303): data-viz (matplotlib GridSpec dashboard), plotly-viz (interactive
write_html), kafka-streaming (Kafka KRaft via docker-compose + kafka-python producer/consumer),
packet-visualizer + traffic-dashboard (scapy traffic analysis/dashboard, authorization-gated, pcap
fallback, ungated).

**Matrix-house lessons (data-science heavy):** (1) NEW CRASH CLASS — CSS `rgba(r,g,b,a)` strings leaked
into matplotlib `color=` args (ValueError); fix = hex/tuple in Python, CSS rgba only in `<style>`; grep
`color=['"]rgba\(` per page. (2) FABRICATED EXPECTED OUTPUT was the recurring sin — designers must RUN
the script and paste REAL numbers (caught a climate warming-rate 4× off, data-viz seed values, and a
0.812-vs-actual-0.319 correlation). (3) numpy 2.x / pandas 3.x / matplotlib 3.11 require Python 3.11+ —
state the floor. (4) Heavy infra (Kafka): the apache/kafka KRaft image needs `CLUSTER_ID` or it
crash-loops — ship a working docker-compose. (5) Flaky live-data (yfinance): cache to CSV early, every
later phase reads the CSV. (6) Packet pages: prominent ethics notice + passive pcap-fallback (no root).
(7) Versions that "look future" (matplotlib 3.11, transformers 5.12, kafka-python 3.0.2, scapy 2.7) are
REAL as of 2026-06 — WebFetch PyPI to confirm rather than trust training-cutoff doubt.

### Shield house — DONE + LIVE (all 13 `shield-*`)

Three waves, all ungated except where noted (gating state preserved per page).

Wave A (commit 0a7a8bbfc): shield-ids-ml (RandomForest IDS), shield-fake-news (gated;
real tokens from an inspect_tokens run), shield-log-analyzer (removed a dead `from report
import` crash; datetime64[us]), shield-firewall-iptables (green accent; DROP = timeout not
"Connection refused"; SSH-allow before DROP), shield-aws-cognito (gated; boto3
`create_user_pool`/`create_user_pool_client` with `ALLOW_USER_PASSWORD_AUTH`; full
`decode_jwt.py`; `delete_user_pool` teardown).

Wave B (commit 6c602d660): 6 GRC document-deliverable pages (all ungated) — shield-first-
risk-assessment (NIST 800-30), shield-first-security-policy (ISO A.6.4/clause 7.4/5.1,
NIST 800-63B), shield-incident-response-plan (NIST 800-61; SEC materiality-determination;
NARA GRS-24 not NIST), shield-control-framework-mapping (NIST CSF 2.0 subcategory text
verbatim-matched to the official Excel), shield-awareness-program (NIST 800-50 Rev.1, DBIR
68%, non-punitive), shield-tabletop-exercise (CISA/NIST 800-84; fixed a CSS counter
double-increment). The "executable deliverable" for GRC = filled-in templates + worked
examples, not `.cf-steps` code.

Wave C (commit 55b4d2d2e): shield-perimeter-alarm (gpiozero 2.0.1 PIR+buzzer alarm w/ full
MockFactory no-hardware path), shield-pi-ids (Suricata 8.0.5 IDS on Pi/Linux-VM,
testmynids.org SID 2100498 proof + eve.json/fast.log). Both ungated.

**Shield-house lessons:** (1) GRC citations are the high-risk surface — Nancy caught SEC
"becomes aware"→"determines material", "NIST GRS 24"→"NARA GRS 24" (federal-only), ISO
clause/annex mislabels, and made CSF subcategory descriptions verbatim. Treat every
standard ID + clause number as a load-bearing claim to verify. (2) Hardware pages MUST ship
a real no-hardware path (gpiozero MockFactory; Suricata on a Linux VM with a bridged NIC) —
it is the primary path for most learners, not a footnote. (3) Tool-output strings are
load-bearing and must be ground-truthed against SOURCE, not memory — Suricata's `-T` line is
`<Notice> - Configuration provided was successfully loaded. Exiting.` (src/suricata.c:3101),
the rule-load summary is `N rule files processed. M rules successfully loaded, K rules
failed, X rules skipped` (detect-engine-loader.c:473) where N is the FILE count (=1 after
suricata-update consolidates) — so `grep "rules loaded"` matches NOTHING; use `grep
"successfully loaded"`. (4) Verify-live uses the real public path `/projects/<file>.html`
(Firebase `public` is `_app`), NOT `/_app/projects/...` — the latter 404s and looks like a
failed deploy. (5) Logic traps in mock scenarios are real bugs: a re-arm-then-retrigger demo
silently suppressed the second alarm because the elapsed time was inside the cooldown window
— trace the timeline, don't trust the `# fires alarm #2` comment.

### Forge house — DONE + LIVE (all 9 `forge-*`)

Three waves, all dual-gated. 7 ungated + 2 gated (crossword, spring — AccessGuard preserved).

Wave A — virtualization GUI walkthroughs (commit cc7525438): forge-virtualbox-first-vm
(VirtualBox 7.2.x + Ubuntu 26.04 LTS), forge-vmware-first-vm (VMware Workstation Pro 17.x
free-for-personal-use via Broadcom + Ubuntu Server 26.04), forge-home-lab (3-VM AD lab:
Server DC + Win11 + Kali 2026.1 on an isolated Internal Network; Install-ADDSForest;
DNS-at-DC). Caught + fixed a broken nested-comment closing script (togglePhase undefined)
on virtualbox before ship.

Wave B — software (commit 9b4d1f415): forge-flashcard-engine (Python CLI + SM-2 spaced
repetition + JSON persistence, stdlib-only, real run output), forge-telegram-bot (Node.js
URL uptime/change monitor, node-telegram-bot-api 1.1.0 ESM), forge-crossword-puzzle (Vite 8
+ Vitest 4 grid-placement + 29 real passing tests, GATED), forge-spring-fullstack (Spring
Boot 4.1 MVC + Thymeleaf + JPA + H2 full CRUD, jakarta.*, GATED).

Wave C — Arduino hardware (commit 58e38b781): forge-env-monitor (Mega + DHT threshold LEDs
+ buzzer), forge-sensor-dashboard (Mega + 16x2 LCD + DHT + LDR + LEDs). BOTH use **Wokwi**
(the online Arduino simulator) as a first-class no-hardware path — the Arduino analog of the
shield MockFactory/Linux-VM fallbacks.

**Forge-house lessons:** (1) GUI/version walkthroughs live or die on CURRENT accuracy —
WebFetch every version + UI label (installer screen labels drift: Ubuntu's new Flutter
installer is "Interactive installation"/"Default selection", NOT the old "Normal
installation"). (2) "Looks-future but real-as-of-now" versions struck again — Ubuntu 26.04
LTS, Vite 8, Vitest 4, Spring Boot 4.1, VMware-free-for-personal-use, Kali 2026.1, open-vm-
tools 13.0.10 are ALL real as of 2026-06; verify, don't trust training-cutoff doubt. A
reviewer (Chris) BLOCKED on "Ubuntu 26.04 doesn't exist" — a training-cutoff error
overridden by checking releases.ubuntu.com. Conversely a designer's node-telegram-bot-api
"1.1.1" was the phantom (real latest 1.1.0). ALWAYS compute ground truth on version
conflicts. (3) Simulator capabilities are load-bearing facts to verify per-part: Wokwi's
DHT22 has a click-drag slider popup but the photoresistor does NOT (lux-attribute/automation
only), and LCD1602 V0 contrast is "not simulated" — a Chris/Nancy conflict resolved against
Wokwi docs (Nancy right). (4) The nested-`/* */`-comment closing-script bug (JS comments
don't nest → first `*/` ends the block → togglePhase undefined) recurs when designers wrap
the PROJECT_KEY/TOTAL_PHASES markers in an outer comment; keep them as separate top-level
block comments. (5) Hardware/heavy projects need an honest no-hardware path (Wokwi) AND
honest heavy-prereq disclosure (home-lab: 16GB/120GB + a run-two-at-a-time fallback).

### Divergent house — DONE + LIVE (all 5 `divergent-*`)

Two waves, all dual-gated. 4 ungated + 1 gated (manim — AccessGuard preserved).

Wave A — software (commit f09e25e5f): divergent-multi-tool (Python plugin-discovery CLI via
importlib/pkgutil, stdlib-only, real run output), divergent-manim (Manim Community Edition
0.20.1 math animations → real MP4s, GATED), divergent-discord-bot (TypeScript Discord.js
14.26.4 moderation bot — privileged-intents wall + role hierarchy + better-sqlite3 audit trail).

Wave B — special (commit 479d180a4): divergent-faceless-youtube (7-phase PROCESS project:
produce + publish ONE real faceless YouTube video; each checkpoint a concrete artifact
script→voiceover→assets→final.mp4→live URL; honest YouTube-policy framing, no get-rich-quick),
divergent-field-terminal (ESP32 "Cheap Yellow Display" ESP32-2432S028R handheld wireless field
terminal — WiFi scan, NimBLE 2.x BLE recon, passive frame counter, net diagnostics; prominent
ethics gate, recon-only/no-attack-code).

**Divergent-house lessons:** (1) Reviewer conflicts on VERIFIABLE facts → compute/fetch ground
truth, override the wrong reviewer (regardless of which). This house: Chris BLOCKED multi-tool
on a byte-count he MISCOUNTED (`printf|wc -c`=69 confirmed his 70 wrong); Nancy was RIGHT that
the YouTube AI-disclosure requirement targets photorealistic/deceptive content only (a plain AI
voiceover is explicitly NOT required to disclose) — fetched support.google.com/youtube/answer/
14328491 to confirm and reframed the page's overstated "required". (2) The argparse duplicate-
subparser collision raises ArgumentError (not "built-in wins") — run it to settle. (3) Manim
has TWO incompatible libs — use Manim COMMUNITY (`manim`/docs.manim.community), never ManimGL;
watch for ManimGL-era contamination (`ApplyMethod`, `stop_skipping()` don't exist in CE).
(4) Incremental multi-phase sketches need FORWARD DECLARATIONS + explicit per-phase "remove the
old stub" steps, or the composite fails to compile (duplicate definition / use-before-declare)
— a recurring hardware-page trap. (5) AUTH-TOKEN EXPIRY mid-run kills subagents with a 401
(0 tokens); operator re-login + re-dispatch recovers (the crashed run's file writes had already
landed). (6) Process/content projects (faceless-youtube) are "executable" when each phase yields
a concrete artifact and the final phase ships a real published result — and must be POLICY-HONEST
(disclosure rules, demonetization of low-effort AI spam), no hype.

### Key house — DONE + LIVE (all 6 `key-*`)

Two waves, all dual-gated. 3 ungated + 3 gated (manim... no — crossword/spring were Forge; here:
brownie-contracts, nft-marketplace, secure-doc-storage gated — AccessGuard preserved).

Wave A — crypto (commit e6abd71c3): key-password-vault (Python AES-256-GCM CLI vault, PBKDF2 600k,
per-entry nonce, real run output), key-blockchain (from-scratch Python blockchain: SHA-256 PoW +
ECDSA signed tx + Flask API), key-secure-doc-storage (Python SHA-256 hash-chain document-integrity
ledger, GATED, honestly scoped as a local linked-ledger not distributed consensus).

Wave B — smart-contract + hardware (commit f5cb9e4d5): key-brownie-contracts (Solidity lifecycle,
GATED — PIVOTED off the deprecated Brownie to Foundry/forge/anvil/cast + Sepolia), key-nft-marketplace
(ERC-721 + Marketplace list/buy, GATED — RETARGETED Hardhat 3 → Hardhat 2.28.6 + @nomicfoundation/
hardhat-toolbox because HH3's default is Viem with no official ethers path; OZ v5 + ethers v6 +
reentrancy-safe), key-rfid-access (Arduino RC522 + keypad + servo two-factor access controller, Wokwi
first-class, 3.3V safety + UID-spoofable honesty).

**Key-house lessons:** (1) CRYPTO pages: the load-bearing checkpoint is a DETERMINISTIC hash/output —
fabricated ones are the dominant sin. Independently RE-COMPUTE every deterministic value (I ran
python3 hashlib to confirm the blockchain tampered hash e9b2bbdc, the secure-doc tampered hash
a820608c, the AES round-trip) rather than trust the designer OR a reviewer — Chris MISCOUNTED a wc
byte-count and the page's value was right. (2) Dead/deprecated frameworks: Brownie is unmaintained →
pivot to Foundry; Hardhat 3 dropped the official ethers toolbox → retarget ethers-v6 code to Hardhat 2
+ hardhat-toolbox (the supported ethers path) rather than fight a Viem dual-plugin. Verify the install/
init CLI per major (`npx hardhat init` HH2 vs `--init` HH3; `cast to-dec` not `--to-dec`). (3) Version-
pin volatile deps a beginner installs (OZ @5.6.1). (4) Real code bugs hide behind plausible output:
a `daemon=True`+no-join clipboard clear that never fires; an SSH port returning a fabricated HTTP
banner; a socket leak. RUN it. (5) Threading/portability: bound `t.join(timeout=...)` so a headless/
WSL clipboard call can't hang; use symbolic `errno.ECONNREFUSED` not hardcoded 111.

### Dark Arts house — DONE + LIVE (all 7 `darkarts-*`)

Two waves, all dual-gated, with MANDATORY authorization/ethics framing throughout (the only
offensive-security house). All content is authorized/educational security testing — sanctioned
practice targets only (localhost, scanme.nmap.org, *.toscrape.com), passive-only RF, lab-only Kali;
ZERO attack code (no DoS, deauth, evil-twin, mass-targeting, malicious evasion). Operator authorized
the house via "continue until all projects done".

Wave A — Python tools (commit ce344c232): darkarts-port-scanner (stdlib TCP scanner, localhost
practice, 27+ authorization callouts), darkarts-web-scraping (requests+BS4 + Playwright, GATED,
robots.txt/ToS/rate-limit gate), darkarts-recon-automation (DNS/crt.sh/portscan/fingerprint pipeline,
passive-vs-active distinction gating the active scan).

Wave B — setup/Node/hardware (commit 75bfb7a04): darkarts-kali-setup (Kali 2026.1 VM install/config),
darkarts-puppeteer (Puppeteer 25.1.0 headless scraping, GATED), darkarts-wifi-scanner (ESP32 CYD
passive WiFi recon, passive-only, no attacks — reuses field-terminal's CYD config).

**Dark Arts lessons:** (1) Offensive content is shippable under the rules as AUTHORIZED/educational
testing with prominent CFAA/authorization framing + sanctioned targets + zero attack code — that
framing is itself a gate dimension (Chris fails a scanner page that omits it). (2) Same fabricated-
output sin, higher stakes: a port scanner whose f-string was a SyntaxError (`{'PORT'}<8}` → must be
`{'PORT':<8}`), a recon page showing SSH:22 returning an HTTP/Apache banner (impossible). RUN the
code; I verified the f-string SyntaxError + the real SSH banner + £38.05 myself. (3) Reviewer misses
cut both ways — Chris PASSed the f-string SyntaxError that Nancy caught; verify deterministic claims
independently regardless of who flagged. (4) Hex-verify ambiguous fixes (`.strip('"“”')` codepoints
0x22/0x201c/0x201d confirmed by dump, resolving a Nancy PAUSE). (5) ESP32: `analogWrite` doesn't
exist (→ core-3.x `ledcAttach`/`ledcWrite`); each multi-phase sketch must be a COMPLETE standalone
.ino, not additive patches. (6) Stale tool output: Kali prebuilt ships SSH OFF (nmap shows 0 open),
apt-key is removed (→ `apt install --reinstall kali-archive-keyring`).

## ✅ MARATHON COMPLETE (2026-06-20)

**All 13 houses rebuilt to the zero-knowledge executability bar + LIVE in production:**
Tier 1 starters (22) + Code (10) + Web (6) + Script (8) + Cloud (~13) + AI (12) + Eye (5) +
Matrix (10) + Shield (13) + Forge (9) + Divergent (5) + Key (6) + Dark Arts (7) ≈ **126 project
pages**. Every page: full phase scaffold + numbered cf-steps + paste-ready code + observable
per-phase checkpoints + cf-fix trap boxes; dual-gated (adversarial-reviewer "Nancy" + "Chris");
0px overflow at 360/768/1280; AccessGuard/gating preserved per page; deployed via ./deploy.sh
(smoke 10/0 PASS the real gate; post-verify FLAGGED = standing QC-57 backlog, not a regression).

**The loop that carried it:** delegate authoring (edu-content-designer, exemplar-grounded) → render-QC
(/tmp/qc-house.js) → Nancy + Chris dual-gate → consolidated fix list → lean re-gate → verify-live
(curl /projects/) → ship in waves. EVERY fresh page hit a real BLOCK on domain accuracy / live code
bugs, never structure. The decisive recurring move: when a reviewer flags a VERIFIABLE fact (or two
reviewers conflict), COMPUTE/QUERY ground truth (WebFetch PyPI/docs/vendor + tool SOURCE, gh api,
python3) and override whoever is wrong — this overturned ~a dozen calls in both directions across the
marathon. Recurring catches captured in [[feedback_quality_from_the_start]],
[[feedback_scan_fix_verify_loop]], [[reference_chris_qc_gate]].

## Progress log (newest first)
- 2026-06-20: MARATHON COMPLETE. Key house (6 pages: A e6abd71c3 crypto, B f5cb9e4d5 smart-contract+
  RFID) + Dark Arts house (7 pages: A ce344c232 Python tools, B 75bfb7a04 Kali/Puppeteer/WiFi) both
  DONE + LIVE. All 13 houses (~126 pages) rebuilt + shipped. Key: independently recomputed every
  deterministic crypto hash; pivoted Brownie→Foundry + Hardhat 3→2. Dark Arts: offensive content
  shipped under authorized/educational framing + zero attack code; caught a port-scanner f-string
  SyntaxError + a fabricated SSH-as-HTTP banner. Operator: "continue until we have taken care of all
  the projects."
- 2026-06-20: Divergent house COMPLETE + LIVE (5 pages, 2 waves: A f09e25e5f software,
  B 479d180a4 faceless-youtube + ESP32 field-terminal). Ten houses done; only darkarts + key
  remain. Settled reviewer conflicts by ground truth (wc byte-count, argparse collision, YouTube
  AI-disclosure policy). Recovered from an auth-token expiry that 401'd two subagents mid-run.
  Next house = operator's call; darkarts (offensive) needs a scope read first.
- 2026-06-20: Forge house COMPLETE + LIVE (9 pages, 3 waves: A cc7525438 virtualization,
  B 9b4d1f415 software, C 58e38b781 Arduino). Nine houses done. Wokwi adopted as the Arduino
  no-hardware path. Two version conflicts settled by computing ground truth (Ubuntu 26.04 IS
  real → overrode a BLOCK; node-telegram-bot-api 1.1.1 was NOT real → corrected to 1.1.0).
  Next house = operator's call (darkarts/divergent/key); darkarts needs a scope read first.
- 2026-06-19: Shield house COMPLETE + LIVE (13 pages, 3 waves: A 0a7a8bbfc, B 6c602d660,
  C 55b4d2d2e). Eight houses done (T1/code/web/script/cloud/ai/eye/matrix/shield). Wave C
  Suricata strings ground-truthed against OISF 8.0.5 source; fixed a mock-cooldown logic bug
  that silently suppressed the demo's second alarm. Next house = operator's call (darkarts/
  divergent/forge/key).
- 2026-06-18: Marathon started. Enumerated 127 pages. Full render-QC sweep launched.
  Prior: webpage brought to tutorial standard (`b046e5768`); agent+workflow overflow fixed
  (`c083584c2`). See `my-first-series-audit-2026-06-17.md`.
