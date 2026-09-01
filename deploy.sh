#!/bin/bash
# deploy.sh - Hexworth Prime deployment with multi-layer safety gates
#
# Gates (in order, cheapest to most expensive):
#   1. Branch check    : must be on master (CLAUDE.md Rule #10) — no override
#   1.5 Chris gate     : recorded Chris purpose+bar QC PASS must match HEAD — --skip-chris bypass (with reason)
#   2. Nexus gate      : static-analysis quality scan — --force bypass
#   3. Smoke gate      : real-browser pre-render check (Puppeteer) — --skip-smoke bypass
#   3.2 Hub links       : every LIVE href in every course data file resolves to a real file,
#                         and every redirect stub lands somewhere — NO bypass (BUG-115/116/118).
#                         'Live' is load-bearing: coming-soon roadmap entries are excluded by
#                         design, because nothing renders them as a followable link.
#   3.3 Completion      : module progress records + OpenStack course completable — NO bypass
#   3.4 Quiz shuffle   : option shuffling live on the OpenStack quizzes — NO bypass (BUG-111)
#   3.5 Deploy surface : nothing ships from _app/ that git does not track — NO bypass (BUG-096)
#   4. firebase deploy --only hosting
#   5. Post-verify     : nexus refresh + EduScan + log-spike check — --skip-post-verify bypass (with reason)
#   6. Confluence inventory regen (post-deploy, NON-BLOCKING — never aborts deploy)
#   7. IndexNow ping (post-deploy, NON-BLOCKING — notifies Bing-family search engines)
#
# Usage:
#   ./deploy.sh                     Run all gates, deploy hosting + regen inventory + ping IndexNow
#   ./deploy.sh --strict            Nexus blocks on CRITICAL or HIGH
#   --force also skips the dash hygiene gate (2.6) and the A+ lab suites (2.7)
#   ./deploy.sh --force             Skip Nexus only (preserve smoke gate)
#   ./deploy.sh --skip-smoke        Skip smoke only (preserve Nexus gate)
#   ./deploy.sh --skip-inventory    Skip Confluence inventory regen (deploy proceeds normally)
#   ./deploy.sh --skip-indexnow     Skip IndexNow ping (Bing/Yandex/etc. notification)
#   ./deploy.sh --skip-post-verify --skip-post-verify-reason "<text>"
#                                   Skip post-verify (audit-logged with reason)
#   ./deploy.sh --skip-chris --skip-chris-reason "<text>"
#                                   Skip Chris quality gate for a trivial change (audit-logged)
#   (Record a Chris PASS after the 'chris' subagent approves: _tools/deploy/record-chris-pass.sh "<scope>")
#   ./deploy.sh --force --skip-smoke   Skip BOTH gates (explicit, audit-trail-friendly)
#
# Branch check is hard-fail by design — for non-master deploys, use:
#   firebase hosting:channel:deploy <channel-name>
#
# For non-hosting deploys (functions, firestore:*), use the standalone wrapper:
#   _tools/eduscan/smoke/deploy.sh --only functions
#   _tools/eduscan/smoke/deploy.sh --only firestore:rules,firestore:indexes
# (That wrapper passes args through to firebase; this script is hosting-only.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}Hexworth Prime Deploy${NC}"
echo -e "${DIM}────────────────────────────────────${NC}"
echo ""

# Parse flags
FORCE=false
STRICT=false
SKIP_SMOKE=false
SKIP_INVENTORY=false
SKIP_INDEXNOW=false
SKIP_POST_VERIFY=false
SKIP_POST_VERIFY_REASON=""   # initialized for set -u safety
SKIP_POST_VERIFY_NEXT=false
SKIP_CHRIS=false
SKIP_CHRIS_REASON=""         # initialized for set -u safety
SKIP_CHRIS_NEXT=false
for arg in "$@"; do
    if [[ "$SKIP_POST_VERIFY_NEXT" == "true" ]]; then
        SKIP_POST_VERIFY_REASON="$arg"
        SKIP_POST_VERIFY_NEXT=false
        continue
    fi
    if [[ "$SKIP_CHRIS_NEXT" == "true" ]]; then
        SKIP_CHRIS_REASON="$arg"
        SKIP_CHRIS_NEXT=false
        continue
    fi
    case "$arg" in
        --force)                    FORCE=true ;;
        --strict)                   STRICT=true ;;
        --skip-smoke)               SKIP_SMOKE=true ;;
        --skip-inventory)           SKIP_INVENTORY=true ;;
        --skip-indexnow)            SKIP_INDEXNOW=true ;;
        --skip-post-verify)         SKIP_POST_VERIFY=true ;;
        --skip-post-verify-reason)  SKIP_POST_VERIFY_NEXT=true ;;
        --skip-chris)               SKIP_CHRIS=true ;;
        --skip-chris-reason)        SKIP_CHRIS_NEXT=true ;;
        *)                          echo -e "${RED}Unknown flag: $arg${NC}"; exit 1 ;;
    esac
done

# Post-loop flag-pair validation (audit-trail integrity)
if [[ "$SKIP_POST_VERIFY_NEXT" == "true" ]]; then
    echo -e "${RED}--skip-post-verify-reason requires a value (e.g., --skip-post-verify-reason \"<text>\")${NC}"
    exit 1
fi
if [[ -n "$SKIP_POST_VERIFY_REASON" && "$SKIP_POST_VERIFY" == "false" ]]; then
    echo -e "${RED}--skip-post-verify-reason supplied without --skip-post-verify; the reason would be silently swallowed.${NC}"
    exit 1
fi
if [[ "$SKIP_POST_VERIFY" == "true" && -z "$SKIP_POST_VERIFY_REASON" ]]; then
    echo -e "${RED}--skip-post-verify requires --skip-post-verify-reason \"<text>\" for audit trail${NC}"
    exit 1
fi
if [[ "$SKIP_CHRIS_NEXT" == "true" ]]; then
    echo -e "${RED}--skip-chris-reason requires a value (e.g., --skip-chris-reason \"<text>\")${NC}"
    exit 1
fi
if [[ -n "$SKIP_CHRIS_REASON" && "$SKIP_CHRIS" == "false" ]]; then
    echo -e "${RED}--skip-chris-reason supplied without --skip-chris; the reason would be silently swallowed.${NC}"
    exit 1
fi
if [[ "$SKIP_CHRIS" == "true" && -z "$SKIP_CHRIS_REASON" ]]; then
    echo -e "${RED}--skip-chris requires --skip-chris-reason \"<text>\" for audit trail${NC}"
    exit 1
fi

# ── Gate 1: Branch check (no override) ───────────────────────────────
echo -e "${BOLD}[1/7]${NC} Branch safety check..."
CURRENT_BRANCH="$(git branch --show-current)"
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo ""
    echo -e "${RED}DEPLOY BLOCKED${NC}: not on master (current: $CURRENT_BRANCH)"
    echo ""
    echo "Per CLAUDE.md Rule #10, firebase deploy is master-only."
    echo "For preview-channel deploys from a feature branch:"
    echo "  firebase hosting:channel:deploy <channel-name>"
    exit 1
fi
echo -e "${GREEN}✓${NC} on master"
echo ""

# ── Gate 1.5: Chris quality gate (purpose+bar PASS recorded for this HEAD) ──
# Defense-in-depth, NOT a security boundary (same philosophy as the deploy lock):
# requires a recorded Chris PASS matching the current commit before a hosting
# deploy of student-facing content/features. Record one after the 'chris' subagent
# returns PASS:  _tools/deploy/record-chris-pass.sh "<scope>"
CHRIS_MARKER="$SCRIPT_DIR/_tools/deploy/.chris-pass"
if [ "$SKIP_CHRIS" = true ]; then
    echo -e "${BOLD}[1.5/7]${NC} Chris gate ${YELLOW}[SKIPPED]${NC} — reason: $SKIP_CHRIS_REASON"
    mkdir -p "$SCRIPT_DIR/_tools/deploy"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) SKIP-CHRIS $(git rev-parse --short HEAD) :: $SKIP_CHRIS_REASON" \
        >> "$SCRIPT_DIR/_tools/deploy/chris-skip-audit.log"
    echo ""
else
    echo -e "${BOLD}[1.5/7]${NC} Chris quality gate..."
    HEAD_SHA="$(git rev-parse HEAD)"
    if [ -f "$CHRIS_MARKER" ] && grep -q "$HEAD_SHA" "$CHRIS_MARKER"; then
        echo -e "${GREEN}✓${NC} Chris PASS recorded for HEAD ($(git rev-parse --short HEAD))"
        echo ""
    else
        echo ""
        echo -e "${RED}DEPLOY BLOCKED${NC}: no Chris PASS recorded for HEAD ($(git rev-parse --short HEAD))"
        echo ""
        echo "Substantive content/feature deploys require a Chris quality-gate PASS."
        echo "Dispatch the 'chris' subagent on the work; on PASS, record it:"
        echo "  _tools/deploy/record-chris-pass.sh \"<scope>\""
        echo "For a trivial change that does not need Chris:"
        echo "  ./deploy.sh --skip-chris --skip-chris-reason \"<text>\""
        exit 1
    fi
fi

# ── Gate 2: Nexus static-analysis gate ───────────────────────────────
if [ "$FORCE" = true ]; then
    echo -e "${BOLD}[2/7]${NC} Nexus gate ${YELLOW}[SKIPPED]${NC} — --force flag set"
    echo ""
else
    echo -e "${BOLD}[2/7]${NC} Running Nexus deploy gate..."
    echo ""

    GATE_FLAGS=""
    if [ "$STRICT" = true ]; then
        GATE_FLAGS="--strict"
    fi

    if node _tools/nexus/nexus.js gate $GATE_FLAGS; then
        echo ""
    else
        echo ""
        echo -e "${DIM}To bypass Nexus only: ./deploy.sh --force${NC}"
        exit 1
    fi
fi

# ── Gate 2.5: Hub registry audit (task #225) ─────────────────────────
# Firestore-only hubs are invisible to Nexus/EduScan/smoke (all filesystem-rooted). This static
# check gates reserved-id PARITY (firestore.rules <-> HubRegistry) + renderer/rewrite presence, and,
# when firebase-admin + creds are present, validates each hubRegistry doc + that every PUBLISHED hub
# sits in a 'sorted'-gated house. Guarded so a checkout without the script skips rather than blocks.
if [ -f _tools/eduscan/hub-registry-audit.js ]; then
    echo -e "${BOLD}[2.5/7]${NC} Hub registry audit..."
    if node _tools/eduscan/hub-registry-audit.js; then
        echo ""
    else
        echo -e "${RED}DEPLOY BLOCKED${NC}: hub-registry audit failed (reserved-id drift or an invalid published hub)."
        exit 1
    fi
fi

# ── Gate 2.6: Dash hygiene gate ──────────────────────────────────────
# Style rule `feedback_no_em_dashes` has been in force since 2026-05-26 and was already
# automated as EduScan HEUR-035, which fired at LOW and therefore could never fail a build:
# --strict blocks on CRITICAL/HIGH only. An A+ Core 2 deck reached production on 2026-08-06
# carrying 24 em-dashes. HEUR-035 is now HIGH for visibility; THIS is the part that blocks.
# Scoped to files changed against master, so ~1587 legacy files cannot turn it into noise.
# Catches all five forms: literal U+2014, &mdash;, &#8212;, &#x2014;, and " -- ".
if [ -f _tools/eduscan/dash-hygiene-gate.js ]; then
    if [ "$FORCE" = true ]; then
        echo -e "${BOLD}[2.6/7]${NC} Dash hygiene gate ${YELLOW}[SKIPPED]${NC} — --force flag set"
        echo ""
    else
        echo -e "${BOLD}[2.6/7]${NC} Dash hygiene gate (changed _app content)..."
        if node _tools/eduscan/dash-hygiene-gate.js --quiet; then
            echo ""
        else
            echo ""
            echo -e "${DIM}To bypass static analysis: ./deploy.sh --force${NC}"
            exit 1
        fi
    fi
fi

# ── Gate 2.7: A+ lab suites ──────────────────────────────────────────
# The suites in _tools/lab-tests caught every defect in the ch25 marathon (2026-08-06/07):
# a tick cache that let six devtools lines complete a lab with zero VMs, a stage-skip that
# credited a lab whose first two stages were never done, a quiz that scored every perfect
# student 60%, and Core 1 gates that credited a student for touching nothing. They lived in a
# session scratchpad until 2026-08-07 and vanished with the session; running them was always
# something someone had to remember. Now it is not.
#
# SCOPED TO WHAT CHANGED, deliberately: nine puppeteer suites take minutes, and paying that on
# a deploy that never touched a lab would make this the gate people reach for --force to skip.
# Covers the A+ Core 1 and Core 2 applets the suites actually assert against, plus the suites
# and shared components they drive.
if [ -f _tools/lab-tests/run-all.js ]; then
    LAB_PATHS="_app/houses/forge/applets/comptia-aplus _tools/lab-tests _app/components/QuizEngine.js _app/components/ModuleProgress.js"
    LAB_BASE="$(git rev-parse --verify --quiet origin/master || git rev-parse --verify --quiet master)"
    LAB_CHANGED=""
    if [ -n "$LAB_BASE" ]; then
        LAB_MB="$(git merge-base HEAD "$LAB_BASE" 2>/dev/null || echo "$LAB_BASE")"
        LAB_CHANGED="$(git diff --name-only "$LAB_MB" -- $LAB_PATHS 2>/dev/null)"
    fi
    # deploy ships the WORKING TREE, not the commit, so uncommitted and untracked count too
    LAB_CHANGED="$LAB_CHANGED
$(git diff --name-only HEAD -- $LAB_PATHS 2>/dev/null)
$(git ls-files --others --exclude-standard -- $LAB_PATHS 2>/dev/null)"
    LAB_CHANGED="$(printf '%s\n' "$LAB_CHANGED" | grep -c . || true)"

    if [ "$FORCE" = true ]; then
        echo -e "${BOLD}[2.7/7]${NC} A+ lab suites ${YELLOW}[SKIPPED]${NC} — --force flag set"
        echo ""
    elif [ "$LAB_CHANGED" -eq 0 ]; then
        echo -e "${BOLD}[2.7/7]${NC} A+ lab suites ${DIM}[skipped — no A+ lab/quiz files changed]${NC}"
        echo ""
    else
        echo -e "${BOLD}[2.7/7]${NC} A+ lab suites (${LAB_CHANGED} relevant file(s) changed)..."
        if node _tools/lab-tests/run-all.js; then
            echo ""
        else
            echo ""
            echo -e "${RED}DEPLOY BLOCKED${NC}: an A+ lab suite failed."
            echo -e "${DIM}Run it yourself: node _tools/lab-tests/run-all.js${NC}"
            echo -e "${DIM}To bypass static analysis: ./deploy.sh --force${NC}"
            exit 1
        fi
    fi
fi

# ── Gate 2.8: Pool-draw bridge (taskboard #295) ──────────────────────
# A quiz declares its draw in the PAGE (QuizEngine poolSize); gradeQuiz learns the served
# count only from quiz_keys/{id}.poolSize. Disagree, and nobody finds out from a log:
#   page pools, key doc silent  -> the drawn subset is graded against the FULL bank, so a
#                                  perfect student scores 12/20 = 60% and fails, every attempt
#   key doc pools, page silent  -> a student who runs out of time answering 12 of 20 is
#                                  graded 12/12 = 100%. A false PASS, which is worse.
# Both directions are checked. Unconditional and offline: it reads the repo and the static
# registry, no Firestore and no credentials, and it costs about half a second over ~5,300
# files — cheap enough that scoping it to changed files would only add a way to miss.
if [ -f functions/verify-quiz-keys.js ]; then
    if [ "$FORCE" = true ]; then
        echo -e "${BOLD}[2.8/7]${NC} Pool-draw bridge ${YELLOW}[SKIPPED]${NC} — --force flag set"
        echo ""
    else
        echo -e "${BOLD}[2.8/7]${NC} Pool-draw bridge (page draw vs quiz_keys poolSize)..."
        if node functions/verify-quiz-keys.js --pool-draw > /tmp/hexworth-pooldraw.$$ 2>&1; then
            rm -f /tmp/hexworth-pooldraw.$$
            echo ""
        else
            grep -E '^  (X|\?) ' /tmp/hexworth-pooldraw.$$ || cat /tmp/hexworth-pooldraw.$$
            rm -f /tmp/hexworth-pooldraw.$$
            echo ""
            echo -e "${RED}DEPLOY BLOCKED${NC}: a quiz's draw and its answer key disagree."
            echo -e "${DIM}Run it yourself: node functions/verify-quiz-keys.js --pool-draw${NC}"
            echo -e "${DIM}To bypass static analysis: ./deploy.sh --force${NC}"
            exit 1
        fi
    fi
fi

# ── Gate 2.9: Answer-balance gate ────────────────────────────────────
# assessment-testing-standard.md section 1 names LENGTH as the first tell: the correct
# answer must not be identifiable by being the longest option. Measured 2026-08-07, it is
# the longest in 61.2% of all 5,261 quiz questions against 25% by chance, and 20 quizzes sit
# at a flat 100% -- there, a student who reads nothing and always picks the wordiest option
# scores full marks. HEUR-042 gives platform-wide visibility; this is the part that blocks.
#
# SCOPED TO CHANGED QUIZZES, deliberately. 248 legacy quizzes are already over the bar and
# the standard grandfathers shipped content, so a platform-wide block would be --forced past
# on day one and stop mattering. Position skew is NOT gated: QuizEngine shuffles options
# every attempt, so no student sees it (see the gate header).
if [ -f _tools/eduscan/answer-balance-gate.js ]; then
    if [ "$FORCE" = true ]; then
        echo -e "${BOLD}[2.9/7]${NC} Answer-balance gate ${YELLOW}[SKIPPED]${NC} — --force flag set"
        echo ""
    else
        echo -e "${BOLD}[2.9/7]${NC} Answer-balance gate (changed quizzes)..."
        if node _tools/eduscan/answer-balance-gate.js; then
            echo ""
        else
            echo ""
            echo -e "${DIM}Report across everything: node _tools/eduscan/answer-balance-audit.js${NC}"
            echo -e "${DIM}To bypass static analysis: ./deploy.sh --force${NC}"
            exit 1
        fi
    fi
fi

# ── Gate 3: Smoke gate (real-browser pre-render check) ───────────────
if [ "$SKIP_SMOKE" = true ]; then
    echo -e "${BOLD}[3/7]${NC} Smoke gate ${YELLOW}[SKIPPED]${NC} — --skip-smoke flag set"
    echo ""
else
    echo -e "${BOLD}[3/7]${NC} Running real-browser smoke gate..."
    echo ""
    if node _tools/eduscan/smoke/run.js; then
        echo ""
    else
        echo ""
        echo -e "${DIM}To bypass smoke only: ./deploy.sh --skip-smoke${NC}"
        exit 1
    fi
fi

# ── Drift report (informational) — what changed since the last deploy? ───
# Compares the current EduScan findings against the most recent archive
# (from the previous successful deploy's post-verify --archive step).
# NEVER blocks deploy — smoke + nexus gates already enforce critical/high.
# Captures the EduScan "DRIFT ANALYSIS" section: trend, counts, NEW ISSUES.
echo -e "${BOLD}[3.5/7]${NC} EduScan drift report (informational, non-blocking)..."
echo ""
DRIFT_OUTPUT=$(node _tools/eduscan/cli.js --diff 2>&1 || true)
# Extract just the DRIFT ANALYSIS block. If --diff finds no prior archive,
# EduScan still runs the scan; the DRIFT section just shows everything as new.
echo "$DRIFT_OUTPUT" | awk '/DRIFT ANALYSIS/,/^$/{print}' | sed 's/^/  /'
echo ""

# ── Gate 3.6: Answer-key exposure (BLOCKING, and deliberately PRE-deploy) ──
# This same check also runs in post-verify, but post-verify runs AFTER the
# upload — it would report a published exam answer key, not prevent one. On
# 2026-08-05 three separate answer-key exposures were found live in production:
# 34 Skill Map YAMLs, the complete COP1034C final project, and four instructor
# solution guides including an ALA final exam with 10 literal FLAG values.
# Detection after the fact is not good enough for this class, so it gates here.
echo -e "${BOLD}[3.6/7]${NC} Answer-key exposure check..."
if python3 _tools/qa/skill-map-audit.py; then
    echo ""
else
    echo -e "${RED}DEPLOY BLOCKED${NC}: deploying would publish answer-bearing files."
    echo "Add the path to firebase.json hosting.ignore, or if it is a false"
    echo "positive, READ the file and add it to REVIEWED_SAFE in the audit."
    exit 1
fi

# ── Gate 3.7: Hex shell process commands (BLOCKING, and deliberately PRE-deploy) ──
# Same reasoning as 3.6, and for the same reason it is duplicated rather than left to
# post-verify: post-verify runs AFTER the upload, so it would report a shipped session race
# rather than prevent one. ps/stop/restart drive a real container scheduler with real per-user
# capacity, and their in-flight lock has produced a NEW concurrency defect in every review
# round it has been through: a double-fire race, a watchdog that could wedge the lock for the
# life of the tab, a watchdog whose recovery path reopened the race it was built beside, a
# failed chain that cleared state it never set, and superseded chains narrating boxes they no
# longer spoke for. No tally is written here on purpose: three different hardcoded counts had
# already drifted apart across two files before a reviewer noticed. Every one of those defects
# was caught by a reviewer driving the page, none by a gate, because until recently the suite
# was only wired into post-verify.
# Blocks on ANY non-zero, including a missing puppeteer: puppeteer is a declared dependency in
# package.json and the smoke gate already relies on it, so its absence is a broken environment,
# not a valid state to deploy from.
# Honours --force, unlike 3.6, and the asymmetry is deliberate. 3.6 is a deterministic file
# scan with no external process: nothing about the environment can make it wrong, so it has no
# bypass. 3.7 drives real Chromium across five pages against multi-second real-clock margins
# that are validated on two machines and NOT under CI load. Making an environment-dependent
# check un-bypassable would let a Chromium download failure block an unrelated hotfix. FORCE
# already guards exactly this class here (Nexus, hub-registry, dash-hygiene, pool-draw) and
# deliberately does not guard 3.6, so this follows the existing convention rather than
# weakening it. Using --force to silence a gate that has found a real defect is a different
# act entirely, and remains wrong.
# No change-detection skip: that is one more thing that can be wrong, and the suite costs ~35s
# against a deploy that uploads the whole site.
if [ "$FORCE" = true ]; then
    # Loud on purpose. A reviewer's objection was not that this gate bypasses (gate 2.7, the
    # other puppeteer-driven suite, bypasses identically) but that --force exists mainly to
    # silence noisy Nexus output, so habitual use would ALSO drop this one without the operator
    # noticing. Naming what protection is being given up is the difference between a bypass and
    # an accident. Not given a bespoke flag: diverging from the file's convention for one gate
    # is how conventions rot, and a skip nobody reads is the actual problem.
    echo -e "${BOLD}[3.7/7]${NC} Hex shell process commands ${YELLOW}[SKIPPED]${NC} — --force flag set"
    echo -e "  ${YELLOW}! ps/stop/restart drive real containers and real per-user capacity.${NC}"
    echo -e "  ${YELLOW}! Every review round of that lock has found a new concurrency defect.${NC}"
    echo -e "  ${YELLOW}! This suite is what catches the next one. Run it before trusting${NC}"
    echo -e "  ${YELLOW}! this deploy:${NC}"
    echo -e "  ${YELLOW}!   node _tools/hexos/hex-shell-process.test.js${NC}"
    echo ""
else
echo -e "${BOLD}[3.7/7]${NC} Hex shell process commands (ps/stop/restart)..."
# Capture, THEN test the status. `if node ... | tail -3` would take tail's exit status, which is
# always 0, producing a gate that can never block. That is the exact defect class this suite
# exists to catch, and it was written into this gate on the first attempt.
# Assignment as the if-condition, for the errexit reason documented in 3.8 below. As a bare
# assignment this died on the failing substitution before printing anything.
HEXPROC_RC=0
HEXPROC_OUT="$(node _tools/hexos/hex-shell-process.test.js 2>&1)" || HEXPROC_RC=$?
echo "$HEXPROC_OUT" | tail -3 | sed 's/^/  /'
if [[ $HEXPROC_RC -ne 0 ]]; then
    echo -e "${RED}DEPLOY BLOCKED${NC}: the hex shell's session commands regressed."
    echo "These drive real containers and real per-user capacity. Full output:"
    echo "  node _tools/hexos/hex-shell-process.test.js"
    exit 1
fi
echo ""
fi

# ── Gate 3.8: Hex OS structural gates (BLOCKING, PRE-deploy) ──
# Same argument as 3.7, and it is the codebase's own: post-verify runs AFTER the upload, so it
# would report a shipped open redirect rather than prevent one. safeEntry decides whether a
# manifest row becomes a clickable link; a reviewer proved it could be defeated by a control
# character and navigate a student off the platform, in the DEPLOYED shell. A regression to that
# function must not be something we learn about from a post-deploy report.
# The list below is the loop's own; the loop is the count. (It said "these four" while running
# six, which is why this now describes the set instead of sizing it.) Most are cheap and
# deterministic; safe-entry and pwa drive real Chromium:
#   gen-app-manifest --check   the manifest still matches its sources
#   hex-manual-check           manual pages, guards, /hex/ link coverage, prose-vs-code claims
#   dead-entry-gate            no app points at a missing file; no NEW app is unreachable
#   safe-entry.test            the two safeEntry copies have not drifted; no vector escapes origin
#   pwa.test                   the PWA worker stays scoped to /hex/, stays network-first, and
#                              stands down for a tenant session. That last one is why it blocks
#                              rather than reports: a worker at '/hex/' outranks tenant-sw.js at
#                              '/', which would silently stop the white-label injection for a
#                              tenant's students. A post-deploy report of that is a report of a
#                              live branding leak in somebody else's classroom.
# Honours --force for the same reason 3.7 does: safe-entry drives real Chromium, and an
# environment failure must not block an unrelated hotfix. The skip says what it gives up.
if [ "$FORCE" = true ]; then
    echo -e "${BOLD}[3.8/7]${NC} Hex OS structural gates ${YELLOW}[SKIPPED]${NC} — --force flag set"
    echo -e "  ${YELLOW}! includes the safeEntry open-redirect guard and the dead-entry gate.${NC}"
    echo -e "  ${YELLOW}! Run before trusting this deploy:${NC}"
    echo -e "  ${YELLOW}!   node _tools/hexos/safe-entry.test.js && node _tools/hexos/dead-entry-gate.js${NC}"
    echo ""
else
echo -e "${BOLD}[3.8/7]${NC} Hex OS structural gates..."
HEXOS_FAILED=""
for hg in \
    "manifest drift|node _tools/hexos/gen-app-manifest.js --check" \
    "manual/prose/link coverage|node _tools/hexos/hex-manual-check.js" \
    "dead-entry scanner|node _tools/hexos/dead-entry-gate.test.js" \
    "corpus content preservation|node _tools/hexos/corpus-preservation.test.js" \
    "dead entries|node _tools/hexos/dead-entry-gate.js" \
    "safeEntry drift + origin escape|node _tools/hexos/safe-entry.test.js" \
    "PWA scope + tenant precedence|node _tools/hexos/pwa.test.js" \
    "home directory is read-only|node _tools/hexos/home-directory.test.js" \
    "tenant cross-tab context|node _tools/hexos/tenant-crosstab.test.js" \
    "MD-100 arena cards vs registry|node _tools/hexos/md100-arena-cards.test.js" \
    "tenant containment on Hex OS|node _tools/hexos/tenant-containment.test.js"; do
    HG_NAME="${hg%%|*}"; HG_CMD="${hg#*|}"
    # Capture, THEN test the status. `if $HG_CMD | tail` would read tail's exit code, which is
    # always 0. That produced a gate that could never block once already in this file.
    # The assignment IS the condition. A BARE `OUT="$(cmd)"` is NOT exempt from errexit, so
    # under `set -euo pipefail` (line 44) the script dies on the failing substitution before the
    # next line runs: no FAIL label, no captured output, no DEPLOY BLOCKED message. It still
    # aborts, but by accident of set -e rather than by this logic, and every diagnostic below
    # would be dead code. Found by a reviewer injecting a failing member into the real loop; my
    # own check had extracted the loop into a fixture WITHOUT set -e, so it could not reproduce
    # the environment it was testing. Gate 3.7 above has the identical flaw and is fixed too.
    if HG_OUT="$(eval "$HG_CMD" 2>&1)"; then
        echo "$HG_OUT" | tail -1 | sed 's/^/  /'
    else
        echo -e "  ${RED}FAIL${NC} $HG_NAME"
        echo "$HG_OUT" | tail -4 | sed 's/^/    /'
        HEXOS_FAILED="yes"
    fi
done
if [ -n "$HEXOS_FAILED" ]; then
    echo -e "${RED}DEPLOY BLOCKED${NC}: a Hex OS structural gate failed."
    echo "These cover real containers, real capacity, and an open-redirect guard."
    exit 1
fi
echo ""
fi

# ── Gate 4: Firebase deploy (with deploy-in-progress lock for post-verify) ──
echo -e "${BOLD}[4/7]${NC} Deploying to Firebase..."
echo ""

LOCK_FILE="$SCRIPT_DIR/_tools/deploy/.deploy-in-progress"
mkdir -p "$SCRIPT_DIR/_tools/deploy" || { echo -e "${RED}✗ mkdir _tools/deploy/ failed${NC}"; exit 1; }

# Build lock JSON safely (jq -n) — handles arbitrary deploy args without
# JSON-injection. WARN paths are non-fatal: post-verify falls back to dry-run.
if ! command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}WARN: jq not installed — post-verify will run in dry-run mode${NC}"
elif ! jq -n \
    --arg pid "$$" \
    --arg started "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg targets "hosting" \
    --arg branch "master" \
    '{deployScriptPid: ($pid | tonumber), startedAt: $started, deployTargets: $targets, branch: $branch}' \
    > "$LOCK_FILE"; then
    echo -e "${YELLOW}WARN: lock file write failed (filesystem error) — post-verify will run in dry-run mode${NC}"
fi

# Trap covers EXIT, INT, TERM, HUP. SIGKILL leaves stale lock; post-verify
# staleness check (>30 min) handles that case.
trap 'rm -f "$LOCK_FILE"' EXIT INT TERM HUP

# ── Gate 3.2: COURSE LINK INTEGRITY ──────────────────────────────────────────
# BUG-115: the forensics hub linked TWELVE modules that do not exist, confirmed 404 on
# production. The IDS matched throughout, so every id-based check passed while a quarter of
# the course was unreachable. Same family as BUG-107 and the ws-pa-01/ws-07 split.
#
# ⚠ SCOPE IS THE WHOLE POINT OF THIS GATE, so state it truthfully. The first version checked
# TWO data files and printed "4/4 passed", which reads as platform coverage and was not --
# it saw 95 hrefs, and 108 more were broken outside its view (BUG-116). It now covers all 7
# files that declare hrefs, and prints its own totals -- do not transcribe them here.
#
# ⚠ THIS COMMENT ITSELF CARRIED A FALSE CLAIM, caught in review. It said "42 links to content
# that was never built are carried in hub-href-known-dead.txt and PRINTED on every run". That
# file is EMPTY, and correctly so: the 42 is the ROADMAP count of coming-soon entries, read
# from ContentCatalog's status field -- an entirely different code path from the known-dead
# baseline. Wrong number AND wrong mechanism, in the one place a reader checks what the gate
# does. The lesson is the same one BUG-118 records: prose states invariants, the script
# reports quantities.
echo -e "\n${YELLOW}Gate 3.2: course link integrity${NC}"   # the script prints its own totals
if ! node "$(dirname "$0")/_tools/qa/hub-href-integrity-test.js"; then
    echo -e "${RED}ABORT: a course hub links a module file that does not exist.${NC}"
    exit 1
fi

# ── Gate 3.3: COURSE COMPLETION KEEPERS ──────────────────────────────────────
# Chris, 2026-08-14: both of these are stamped `@catalog status GATE` and NOTHING invoked
# either — "GATE means something runs it automatically" is this repo's own catalog rule, so
# they were citing an authority they did not have. Wired rather than downgraded, because both
# guard live student-facing completion:
#   module-init-progress   BUG-099 — 93 pages record progress and the Wireshark hub MOVES
#   openstack-hub-completion BUG-100/103/104/106/107 — a student can finish the course
echo -e "\n${YELLOW}Gate 3.3: course completion keepers${NC}"
if ! node "$(dirname "$0")/_tools/qa/module-init-progress-test.js"; then
    echo -e "${RED}ABORT: module progress is not recording — two courses would show 0% forever.${NC}"
    exit 1
fi
if ! node "$(dirname "$0")/_tools/qa/openstack-hub-completion-test.js"; then
    echo -e "${RED}ABORT: the OpenStack course cannot be completed by a student.${NC}"
    exit 1
fi

# ── Gate 3.4: QUIZ SHUFFLE INTEGRITY ─────────────────────────────────────────
# BUG-111 + Karl 2026-08-14: the OpenStack answer keys are 80% index-1 with zero index-3 in
# authored order, so the shuffle is what stands between them and being trivially passable.
# BUG-067 already happened once on these exact four pages. Karl's note: a gate guarding an
# exploitability cliff belongs in the deploy chain, not the run-it-by-hand tier.
echo -e "\n${YELLOW}Gate 3.4: quiz shuffle integrity${NC}"
if ! node "$(dirname "$0")/_tools/qa/quiz-shuffle-integrity-test.js"; then
    echo -e "${RED}ABORT: option shuffling is not live on the OpenStack quizzes.${NC}"
    echo -e "${RED}Two of the four become passable by picking the same index every time.${NC}"
    exit 1
fi

# ── Gate 3.5: DEPLOY SURFACE ─────────────────────────────────────────────────
# BUG-096: _app/ IS the hosting root, so anything left there ships. Two debug probes sat
# publicly fetchable on hexworth.com at 200 for a day. This fails the deploy if any file that
# Firebase would actually serve is untracked by git and not explicitly allowlisted.
# NO BYPASS FLAG, deliberately: every other gate here has one, and a bypass is exactly how a
# probe reaches production. If it fires, archive the file or `git add` it — both take seconds.
echo -e "\n${YELLOW}Gate 3.5: deploy surface${NC}"
if ! python3 "$(dirname "$0")/_tools/deploy/deploy-surface-gate.py"; then
    echo -e "${RED}ABORT: untracked files would be published from _app/.${NC}"
    echo -e "${RED}Archive them (cp to _tools/archive/, verify with cmp) or git add them.${NC}"
    exit 1
fi

npx firebase deploy --only hosting

echo ""

# ── Gate 5: Post-deploy verification ─────────────────────────────────
# Runs BEFORE Confluence regen so a flagged regression skips inventory
# update — Confluence shouldn't reflect a broken state as "deployed."
if [ "$SKIP_POST_VERIFY" = true ]; then
    echo -e "${BOLD}[5/7]${NC} Post-verify ${YELLOW}[SKIPPED]${NC} — reason: $SKIP_POST_VERIFY_REASON"
    AUDIT_LOG="$SCRIPT_DIR/_planning/reports/skip-post-verify-audit.log"
    mkdir -p "$(dirname "$AUDIT_LOG")"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) deploy.sh skip-post-verify: $SKIP_POST_VERIFY_REASON" >> "$AUDIT_LOG"
    echo ""
elif [ -f "$SCRIPT_DIR/_tools/deploy/post-verify.sh" ]; then
    echo -e "${BOLD}[5/7]${NC} Running post-deploy verification..."
    echo ""
    if bash "$SCRIPT_DIR/_tools/deploy/post-verify.sh" --hosting; then
        echo ""
    else
        POST_EXIT=$?
        echo ""
        echo -e "${RED}✗ post-verify exited $POST_EXIT — Confluence regen SKIPPED${NC}"
        echo -e "${RED}✗ Deploy SHIPPED but verification flagged — see _docs/operations/post-verify-recovery.md${NC}"
        exit $POST_EXIT
    fi
else
    echo -e "${BOLD}[5/7]${NC} ${YELLOW}post-verify.sh not found — skipping${NC}"
    echo ""
fi

# ── Step 6: Confluence inventory regen (NON-BLOCKING) ────────────────
# This step exists to keep the "Hexworth Prime — Complete Course & Hub
# Inventory" Confluence page (id 4358163) current with each deploy. The
# wrapper script catches all errors and always exits 0, so a Confluence
# outage / auth failure / network blip will NEVER fail the deploy that
# already shipped successfully. The deploy is committed at this point.
# Only runs if post-verify passed (or was skipped) — a flagged regression
# would have exit'd above.
if [ "$SKIP_INVENTORY" = true ]; then
    echo -e "${BOLD}[6/7]${NC} Confluence inventory regen ${YELLOW}[SKIPPED]${NC} — --skip-inventory flag set"
else
    echo -e "${BOLD}[6/7]${NC} Refreshing Confluence inventory page..."
    # The wrapper handles its own error reporting + always exits 0.
    # Wrap in `|| true` as belt-and-suspenders against `set -e`.
    "$SCRIPT_DIR/_tools/confluence/push_hub_inventory.sh" || true
fi

# ── Step 7: IndexNow ping (NON-BLOCKING) ─────────────────────────────
# Notify Bing-family search engines (Bing, Yandex, Seznam, Naver, plus
# downstream consumers DuckDuckGo / Brave / Ecosia / Startpage which
# source results from Bing's index) of fresh content via the IndexNow
# protocol. Google does NOT accept IndexNow as of 2026-06; Google
# discovery happens via Search Console + organic crawl. About 5-8%
# of US search traffic is Bing-family.
#
# Non-blocking by design: ping failures (network, IndexNow outage,
# rate limit, key validation drift) NEVER fail a deploy that already
# shipped. Wrapped in `|| true` as belt-and-suspenders against `set -e`.
#
# Script source: _tools/seo/ping-indexnow.py
# Runbook: _docs/operations/seo-monitoring-runbook.md
# Key file: _app/c9ef8e71d110cb110ef4fc14f2579eff.txt (must remain deployed)
if [ "$SKIP_INDEXNOW" = true ]; then
    echo -e "${BOLD}[7/7]${NC} IndexNow ping ${YELLOW}[SKIPPED]${NC} — --skip-indexnow flag set"
elif [ ! -f "$SCRIPT_DIR/_tools/seo/ping-indexnow.py" ]; then
    echo -e "${BOLD}[7/7]${NC} ${YELLOW}ping-indexnow.py not found — skipping${NC}"
else
    echo -e "${BOLD}[7/7]${NC} Notifying IndexNow (Bing-family search engines)..."
    # Capture full output; show only the result summary to keep deploy
    # log readable. Full per-URL detail is in the script's verbose mode.
    INDEXNOW_OUT=$(python3 "$SCRIPT_DIR/_tools/seo/ping-indexnow.py" 2>&1 || true)
    URL_COUNT=$(echo "$INDEXNOW_OUT" | grep -oE 'urls:\s+[0-9]+' | head -1 | grep -oE '[0-9]+')
    if echo "$INDEXNOW_OUT" | grep -q '✓ submission accepted'; then
        echo -e "  ${GREEN}✓${NC} ${URL_COUNT:-?} URLs accepted (Bing, Yandex, Seznam, Naver)"
    else
        echo -e "  ${YELLOW}WARN: IndexNow ping did not confirm acceptance (non-blocking)${NC}"
        # Print last 5 lines so an operator can see what happened
        echo "$INDEXNOW_OUT" | tail -5 | sed 's/^/    /'
    fi
fi

echo ""
echo -e "${GREEN}${BOLD}Deploy complete.${NC}"
