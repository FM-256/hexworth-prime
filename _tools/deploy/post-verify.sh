#!/usr/bin/env bash
# _tools/deploy/post-verify.sh — post-deploy verification
#
# Invoked by deploy.sh (hosting) and _tools/eduscan/smoke/deploy.sh (functions/
# firestore) after `firebase deploy` succeeds. Refreshes platform stats,
# verifies deployed CFs are ACTIVE, and surfaces any post-deploy regressions.
#
# Exit codes:
#   0 — all checks passed
#   1 — caller misuse (e.g., --hosting + --only X conflict)
#   2 — verification flagged divergence (DEPLOY SHIPPED, regression detected)
#   3 — post-verify infrastructure failure (no creds, no gcloud, network error)
#
# Lock file: $REPO_ROOT/_tools/deploy/.deploy-in-progress
#   Written by deploy.sh / smoke/deploy.sh BEFORE firebase deploy.
#   Removed by their `trap` on exit. If absent OR stale (>30 min) OR PID not
#   in our ancestor chain on Linux, we run in dry-run mode — no Firestore
#   writes, no `nexus full --publish` invocation. Defense-in-depth against
#   accidental standalone invocation. NOT a security boundary against
#   deliberate misuse — operators must follow the carve-out in CLAUDE.md
#   rule 10.
#
# On post-verify failure: see _docs/operations/post-verify-recovery.md
# for the recovery runbook.

set -uo pipefail   # NOT -e — we want explicit exit-code control

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOCK_FILE="$REPO_ROOT/_tools/deploy/.deploy-in-progress"

# Colors (graceful if not a TTY)
if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; DIM='\033[2m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; DIM=''; NC=''
fi

# ── Reject conflicting invocations ───────────────────────────────────
HAS_HOSTING_FLAG=0
HAS_ONLY_FLAG=0
for arg in "$@"; do
    [[ "$arg" == "--hosting" ]] && HAS_HOSTING_FLAG=1
    [[ "$arg" == "--only" ]] && HAS_ONLY_FLAG=1
done
if [[ "$HAS_HOSTING_FLAG" == 1 && "$HAS_ONLY_FLAG" == 1 ]]; then
    echo -e "${RED}ERROR: --hosting and --only X are mutually exclusive${NC}" >&2
    echo "  --hosting is deploy.sh-internal; --only X is firebase passthrough." >&2
    exit 1
fi

# ── Lock file presence + staleness + PID validation ──────────────────
DRY_RUN=0
if [[ ! -f "$LOCK_FILE" ]]; then
    echo -e "${DIM}INFO: no deploy-in-progress lock — running in dry-run mode${NC}"
    DRY_RUN=1
elif [[ -n "$(find "$LOCK_FILE" -mmin +30 -print 2>/dev/null)" ]]; then
    echo -e "${YELLOW}WARN: lock file is stale (>30 min) — running in dry-run mode${NC}"
    DRY_RUN=1
elif [[ "$(uname -s)" == "Linux" ]]; then
    # PID ancestor walk — verifies post-verify is downstream of the deploy
    # script that wrote the lock. macOS skipped (no /proc).
    if command -v jq >/dev/null 2>&1; then
        DEPLOY_PID=$(jq -r '.deployScriptPid' "$LOCK_FILE" 2>/dev/null || echo "")
        if [[ -n "$DEPLOY_PID" && "$DEPLOY_PID" != "null" ]]; then
            CUR_PID=$$
            FOUND=0
            while [[ "$CUR_PID" -gt 1 ]]; do
                if [[ "$CUR_PID" == "$DEPLOY_PID" ]]; then FOUND=1; break; fi
                NEXT_PID=$(awk '/^PPid:/{print $2}' "/proc/$CUR_PID/status" 2>/dev/null || echo 0)
                CUR_PID="${NEXT_PID:-0}"
                [[ "$CUR_PID" == 0 ]] && break
            done
            if [[ "$FOUND" == 0 ]]; then
                echo -e "${YELLOW}WARN: deploy PID not in ancestor chain — running in dry-run mode${NC}"
                DRY_RUN=1
            fi
        fi
    fi
else
    echo -e "${DIM}INFO: non-Linux platform — skipping PID validation, lock-file-only check${NC}"
fi

# ── Detect deploy targets (HOSTING_ONLY vs functions/firestore) ──────
HOSTING_ONLY=0
if [[ "$HAS_HOSTING_FLAG" == 1 ]]; then
    HOSTING_ONLY=1
elif [[ "$#" -gt 0 ]]; then
    PREV=""
    for arg in "$@"; do
        if [[ "$PREV" == "--only" ]]; then
            if [[ "$arg" == "hosting" ]]; then
                HOSTING_ONLY=1
            elif [[ "$arg" == *functions* || "$arg" == *firestore* ]]; then
                HOSTING_ONLY=0
                break
            fi
        fi
        PREV="$arg"
    done
fi

# ── Track exit status across checks ──────────────────────────────────
DIVERGENCE=0   # set to 1 if any check flags regression → exit 2
INFRA_FAIL=0   # set to 1 if a check can't run due to tooling → exit 3

echo -e "${DIM}────── post-verify ──────${NC}"
echo "  mode:          $([[ $DRY_RUN == 1 ]] && echo 'DRY-RUN (no Firestore writes)' || echo 'FULL')"
echo "  scope:         $([[ $HOSTING_ONLY == 1 ]] && echo 'hosting-only' || echo 'functions/firestore')"
echo ""

# ── Check 1: Nexus refresh ───────────────────────────────────────────
echo "[1/5] Nexus refresh"
NEXUS_CMD=""
if [[ "$HOSTING_ONLY" == 1 ]]; then
    NEXUS_CMD="scan"      # hosting → read-only scan, no Firestore publish
else
    NEXUS_CMD="full --publish"  # functions/firestore → full publish
fi

if [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run 'nexus $NEXUS_CMD'${NC}"
else
    if ! node "$REPO_ROOT/_tools/nexus/nexus.js" $NEXUS_CMD; then
        echo -e "  ${RED}✗ nexus $NEXUS_CMD failed${NC}"
        INFRA_FAIL=1
    else
        echo -e "  ${GREEN}✓${NC} nexus $NEXUS_CMD complete"
    fi
fi
echo ""

# ── Check 2: gcloud functions ACTIVE check (functions deploys only) ──
echo "[2/5] Functions ACTIVE check"
if [[ "$HOSTING_ONLY" == 1 ]]; then
    echo -e "  ${DIM}skipped (hosting-only deploy)${NC}"
elif ! command -v gcloud >/dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠ gcloud not installed — skipping functions check${NC}"
elif [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would verify all CFs are ACTIVE${NC}"
else
    PROJECT="$(gcloud config get-value project 2>/dev/null || echo unknown)"
    if [[ "$PROJECT" != "hexworth-prime" ]]; then
        echo -e "  ${YELLOW}⚠ gcloud project=$PROJECT (expected hexworth-prime) — skipping${NC}"
    else
        NON_ACTIVE=$(gcloud functions list --project=hexworth-prime --regions=us-central1 \
            --format="value(name,state)" 2>/dev/null | awk '$2 != "ACTIVE" {print $1}')
        if [[ -n "$NON_ACTIVE" ]]; then
            echo -e "  ${RED}✗ non-ACTIVE functions:${NC}"
            echo "$NON_ACTIVE" | sed 's/^/      /'
            DIVERGENCE=1
        else
            echo -e "  ${GREEN}✓${NC} all functions ACTIVE"
        fi
    fi
fi
echo ""

# ── Check 3: Cloud Logging error-spike check ─────────────────────────
echo "[3/5] Cloud Logging error spike (last 5 min)"
if ! command -v gcloud >/dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠ gcloud not installed — skipping${NC}"
elif [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would check ERROR severity in last 5 min${NC}"
else
    SINCE="$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%SZ)"
    ERROR_COUNT=$(gcloud logging read "severity>=ERROR AND timestamp>=\"$SINCE\"" \
        --project=hexworth-prime --limit=20 --format="value(timestamp)" 2>/dev/null | wc -l)
    if [[ "$ERROR_COUNT" -gt 5 ]]; then
        echo -e "  ${YELLOW}⚠ $ERROR_COUNT ERROR log entries in last 5 min — investigate${NC}"
        # Note: NOT setting DIVERGENCE=1 — error spikes are signal, not always
        # post-deploy regression. Operator inspects via Cloud Logging console.
    else
        echo -e "  ${GREEN}✓${NC} $ERROR_COUNT ERROR entries in last 5 min (within tolerance)"
    fi
fi
echo ""

# ── Check 4: EduScan critical+high gate ──────────────────────────────
echo "[4/5] EduScan critical+high gate"
if [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run eduscan --fail-on critical,high${NC}"
else
    # HEUR-035 (em-dash / " -- ") is excluded from THIS gate, not from the scan or from
    # triage. It was promoted LOW -> HIGH on 2026-08-06 for triage visibility, which turned
    # ~3228 legacy style findings into HIGH and made this functional post-deploy check fail
    # on every deploy for a reason that has nothing to do with the deploy. The blocking
    # enforcement for NEW violations is dash-hygiene-gate.js at deploy gate 2.6, which is
    # scoped to changed files. A verification gate that is permanently red verifies nothing.
    #
    # HEUR-042 (correct answer is always the longest option) is excluded for exactly the same
    # reason and was added the same way: HIGH for triage visibility, ~248 legacy quizzes over
    # the bar on the day it shipped, and blocking enforcement that lives in
    # answer-balance-gate.js at deploy gate 2.9, scoped to changed quizzes. It failed this
    # check on the #295 functions deploy (2026-08-07) within the hour of being written --
    # a deploy that touched no quiz at all, which is the proof that leaving it in would make
    # this gate permanently red and therefore worthless.
    #
    # THE PATTERN, for whoever adds the next one: a rule that is HIGH for VISIBILITY and
    # enforced elsewhere on CHANGED files belongs in this exclusion list. A rule that is HIGH
    # because a deploy genuinely must not proceed does NOT.
    if ! node "$REPO_ROOT/_tools/eduscan/cli.js" --fail-on critical,high --fail-on-except HEUR-035,HEUR-042 >/dev/null 2>&1; then
        echo -e "  ${RED}✗ EduScan found critical/high findings post-deploy${NC}"
        DIVERGENCE=1
    else
        echo -e "  ${GREEN}✓${NC} no critical/high findings"
    fi
fi
echo ""

# ── Check 4b: CTF box / flag-registry cross-check ────────────────────
# Added 2026-08-05. ops-05-operation-blackwire shipped to students fully built,
# listed in the arena, and unsolvable — no flag_registry doc, so every flag
# submission threw. Nothing caught it because the defect lived in the GAP between
# content on disk and flags in Firestore, and no check spanned both. It was found
# by hand, months late.
#
# Runs here rather than inside eduscan's main scan because scan() is synchronous
# and this needs an async Firestore read. Non-blocking: it flags divergence, it
# does not abort a deploy that already happened.
echo "[4b/5] CTF box / flag-registry cross-check"
if [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run eduscan --ctf-boxes${NC}"
else
    CTF_OUT="$(node "$REPO_ROOT/_tools/eduscan/cli.js" --ctf-boxes 2>&1)"
    CTF_RC=$?
    if [[ $CTF_RC -eq 1 ]]; then
        echo -e "  ${RED}✗ unregistered or unsolvable CTF box(es) detected${NC}"
        echo "$CTF_OUT" | grep -E '\[BOX-00[123]\]' | head -5 | sed 's/^/    /'
        DIVERGENCE=1
    elif [[ $CTF_RC -eq 2 ]]; then
        echo -e "  ${YELLOW}! cross-check could not run${NC} (see _tools/eduscan --ctf-boxes)"
    else
        echo -e "  ${GREEN}✓${NC} every box on disk has its flags registered"
    fi
fi
echo ""

# ── Check 4c: rules/CF bypass check (SEC-010/011) ────────────────────
# Static, no credentials. Catches the class of bug that shipped twice on
# 2026-08-04: a client write in firestore.rules shadowing a validating Cloud
# Function, so the function's checks can simply be skipped.
echo "[4c/5] Firestore rules / Cloud Function bypass check"
if [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run eduscan --rules-bypass${NC}"
else
    RB_OUT="$(node "$REPO_ROOT/_tools/eduscan/cli.js" --rules-bypass 2>&1)"
    if [[ $? -eq 1 ]]; then
        echo -e "  ${YELLOW}! client writes shadow a validating Cloud Function${NC}"
        echo "$RB_OUT" | grep -E '\[SEC-01[01]\]' | head -4 | sed 's/^/    /'
    else
        echo -e "  ${GREEN}✓${NC} no client write shadows a validating Cloud Function"
    fi
fi
echo ""

# ── Check 4d: Dr. Hex Skill Map load audit ──────────────────────────
# A Skill Map that fails validation does not error — Dr. Hex silently falls back
# to a generic posture whose whole forbidden list is three FLAG{...} patterns,
# which protects nothing on a lab whose answer is prose. 17 maps were already
# failing on 2026-08-05 and nobody had noticed, because list_all_skill_maps had
# zero callers. At-or-below-baseline so pre-existing debt does not block every
# deploy, while a NEW break is caught on the next one.
echo "[4d/5] Dr. Hex Skill Map load audit"
if [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run skill-map-audit.py${NC}"
else
    SM_OUT="$(python3 "$REPO_ROOT/_tools/qa/skill-map-audit.py" 2>&1)"
    SM_RC=$?
    echo "$SM_OUT" | head -6 | sed 's/^/  /'
    if [[ $SM_RC -ne 0 ]]; then
        echo -e "  ${YELLOW}! a Skill Map stopped loading — Dr. Hex has no guardrail on that lab${NC}"
        # MUST set DIVERGENCE or this check does not gate anything. The first
        # version captured SM_RC, printed a warning, and never used it again —
        # post-verify still exited 0 and reported PASSED. A detector for silent
        # failures that fails silently is worse than no detector, and that is
        # the exact pattern this check exists to catch.
        DIVERGENCE=1
    fi
fi
echo ""

# ── Check 4e: script catalog refresh + drift ─────────────────────────
# DELIBERATELY NON-BLOCKING. This never sets DIVERGENCE and never fails a deploy: it
# regenerates bookkeeping, it does not verify the deploy. A gate that can flake teaches
# people to skip gates, and then they skip the ones that matter. The point of running it
# here is DRIFT -- the orphan and not-in-git counts only mean something if they are
# recomputed on a schedule nobody has to remember.
echo "[4e/5] Script catalog refresh"
if [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would regenerate _tools/CATALOG.md${NC}"
else
    # Snapshot the previous totals BEFORE regenerating, so the delta is real.
    CAT_JSON="$REPO_ROOT/_tools/catalog.json"
    CAT_PREV="$(python3 - "$CAT_JSON" <<'PY' 2>/dev/null || true
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(0)
s = d.get('scripts', [])
c = lambda w: sum(1 for r in s if r.get('wiring') == w)
print(f"{len(s)} {c('GATE')} {c('ORPHAN')} {sum(1 for r in s if not r.get('tracked'))}")
PY
)"
    CAT_OUT="$(python3 "$REPO_ROOT/_tools/catalog/gen-catalog.py" 2>&1)"
    CAT_RC=$?
    if [[ $CAT_RC -ne 0 ]]; then
        # Informational only. Say so plainly rather than implying the deploy is at risk.
        echo -e "  ${YELLOW}! catalog did not regenerate (non-blocking; CATALOG.md is now stale)${NC}"
        echo "$CAT_OUT" | head -3 | sed 's/^/    /'
    else
        echo "$CAT_OUT" | head -2 | sed 's/^/  /'
        CAT_NOW="$(python3 - "$CAT_JSON" <<'PY' 2>/dev/null || true
import json, sys
d = json.load(open(sys.argv[1])); s = d['scripts']
c = lambda w: sum(1 for r in s if r.get('wiring') == w)
print(f"{len(s)} {c('GATE')} {c('ORPHAN')} {sum(1 for r in s if not r.get('tracked'))}")
PY
)"
        if [[ -n "$CAT_PREV" && -n "$CAT_NOW" && "$CAT_PREV" != "$CAT_NOW" ]]; then
            read -r P_TOT P_GATE P_ORPH P_UNTR <<<"$CAT_PREV"
            read -r N_TOT N_GATE N_ORPH N_UNTR <<<"$CAT_NOW"
            printf "  drift since last deploy: scripts %+d · gated %+d · orphaned %+d · not-in-git %+d\n" \
                   $((N_TOT-P_TOT)) $((N_GATE-P_GATE)) $((N_ORPH-P_ORPH)) $((N_UNTR-P_UNTR))
            if (( N_ORPH - P_ORPH > 0 )); then
                echo -e "  ${DIM}new scripts arrived that nothing calls — search _tools/CATALOG.md before writing the next one${NC}"
            fi
        fi
    fi
fi
echo ""

# ── Check 4f: careers-page track links match the course catalog ──────
# BLOCKING, unlike 4e. _app/components/HouseTracks.js is GENERATED from
# _app/data/course-trees/*.json and puts 54 course links on the 13 careers.html pages. If a
# track moves or is renamed, the catalog updates and the committed component does not, so the
# careers pages keep pointing at URLs that no longer resolve. Nothing else notices: the links
# are in a generated file nobody re-reads, on pages nobody edits.
#
# This re-derives from the catalog and compares. It does NOT trust the committed file, which is
# the whole point -- a gate that reads the artifact it is gating proves nothing.
echo "[4f/5] Careers, manifest, hex shell and dead-entry gates"
if [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run gen-house-tracks.js --check${NC}"
else
    # Salary bands on career-paths.html must still equal the min/max of the roles each card
    # names, read from that house's own careers.html. These were hand-authored and unverified
    # until 2026-08-29, when a card shipped a $185K ceiling above a $210K role it listed.
    SAL_OUT="$(node "$REPO_ROOT/_tools/career/audit-card-salaries.js" 2>&1)"
    if [[ $? -ne 0 ]]; then
        echo "$SAL_OUT" | tail -4 | sed 's/^/  /'
        echo -e "  ${YELLOW}! a career card's salary no longer matches its source careers.html${NC}"
        DIVERGENCE=1
    else
        echo "$SAL_OUT" | tail -1 | sed 's/^/  /'
    fi

    # HEXOS-0: the app manifest must match its sources, and no NEW launchable surface may appear
    # unregistered. The second is the omission detector: it is what would have caught Bug Hunting
    # being invisible. Baselined at 88 known-unregistered so it blocks new debt without failing on
    # the existing backlog; that baseline should only ever shrink.
    HX_OUT="$(node "$REPO_ROOT/_tools/hexos/gen-app-manifest.js" --check 2>&1)"
    if [[ $? -ne 0 ]]; then
        echo "$HX_OUT" | tail -3 | sed 's/^/  /'
        echo -e "  ${YELLOW}! hex-apps.json no longer matches HubRegistry + PLATFORM_APPS${NC}"
        DIVERGENCE=1
    else
        echo "$HX_OUT" | tail -1 | sed 's/^/  /'
    fi
    HXU_OUT="$(node "$REPO_ROOT/_tools/hexos/gen-app-manifest.js" --unregistered 2>&1)"
    if [[ $? -ne 0 ]]; then
        echo "$HXU_OUT" | tail -5 | sed 's/^/  /'
        echo -e "  ${YELLOW}! a launchable surface exists that no registry knows about${NC}"
        DIVERGENCE=1
    else
        echo "$HXU_OUT" | tail -1 | sed 's/^/  /'
    fi

    # The hex shell's manual pages must cover exactly its commands, and no app id may shadow a
    # command name. Three false statements about behaviour shipped from that one file in a single
    # session; this catches the mechanical subset before a human has to.
    HM_OUT="$(node "$REPO_ROOT/_tools/hexos/hex-manual-check.js" 2>&1)"
    if [[ $? -ne 0 ]]; then
        echo "$HM_OUT" | tail -4 | sed 's/^/  /'
        echo -e "  ${YELLOW}! hex shell manual pages have drifted from its commands${NC}"
        DIVERGENCE=1
    else
        echo "$HM_OUT" | tail -1 | sed 's/^/  /'
    fi

    # The hex shell's process commands (ps/stop/restart) drive a real container scheduler, and
    # THREE separate concurrency bugs shipped from their in-flight lock across five review
    # rounds: a double-fire race, a watchdog that could wedge the lock permanently, and a
    # watchdog whose own recovery path reopened the race it was built beside. Each was caught by
    # a reviewer, not by a gate. Every one of those is now a falsifiable assertion, so run them
    # here rather than trusting that whoever edits that file next reads the header first.
    # Needs a browser; skipped rather than failed where puppeteer is absent (exit 2).
    # HEXOS-3: no app may point at a missing file, and no NEW app may be unreachable. This is
    # the gate that makes taskboard #272 and #277 a closed class rather than a triage queue.
    DE_OUT="$(node "$REPO_ROOT/_tools/hexos/dead-entry-gate.js" 2>&1)"
    if [[ $? -ne 0 ]]; then
        echo "$DE_OUT" | tail -5 | sed 's/^/  /'
        echo -e "  ${YELLOW}! an app points at a missing file, or a new one is unreachable${NC}"
        DIVERGENCE=1
    else
        echo "$DE_OUT" | tail -1 | sed 's/^/  /'
    fi

    # safeEntry decides whether a manifest row becomes a clickable link, exists in two files, and
    # had zero coverage until a reviewer found it was wrong in both. Checks drift AND escape.
    SE_OUT="$(node "$REPO_ROOT/_tools/hexos/safe-entry.test.js" 2>&1)"
    SE_RC=$?
    if [[ $SE_RC -eq 2 ]]; then
        echo -e "  ${YELLOW}- safeEntry suite SKIPPED (puppeteer unavailable)${NC}"
    elif [[ $SE_RC -ne 0 ]]; then
        echo "$SE_OUT" | grep -E "FAIL|passed" | tail -4 | sed 's/^/  /'
        echo -e "  ${YELLOW}! safeEntry drifted or a vector reached another origin${NC}"
        DIVERGENCE=1
    else
        echo "$SE_OUT" | tail -1 | sed 's/^/  /'
    fi

    HS_OUT="$(node "$REPO_ROOT/_tools/hexos/hex-shell-process.test.js" 2>&1)"
    HS_RC=$?
    if [[ $HS_RC -eq 2 ]]; then
        echo -e "  ${YELLOW}- hex shell process suite SKIPPED (puppeteer unavailable)${NC}"
    elif [[ $HS_RC -ne 0 ]]; then
        echo "$HS_OUT" | grep -E "FAIL|passed" | tail -5 | sed 's/^/  /'
        echo -e "  ${YELLOW}! hex shell ps/stop/restart regressed${NC}"
        DIVERGENCE=1
    else
        echo "$HS_OUT" | tail -1 | sed 's/^/  /'
    fi

    # Documented examples must actually work. A student-facing FAQ told people to type
    # `RUN ARCTIC`, an id that does not exist, as the headline proof of the headline feature; two
    # of the three examples in that sentence errored when typed. Nothing caught it but a reviewer,
    # and the changelog it matched pops automatically for every returning student. This runs the
    # FAQ's own transcripts against the real shell.
    DX_OUT="$(node "$REPO_ROOT/_tools/hexos/doc-examples.test.js" 2>&1)"
    DX_RC=$?
    if [[ $DX_RC -eq 2 ]]; then
        echo -e "  ${YELLOW}- documented shell examples SKIPPED (puppeteer unavailable)${NC}"
    elif [[ $DX_RC -ne 0 ]]; then
        echo "$DX_OUT" | grep -E "FAIL|passed" | tail -6 | sed 's/^/  /'
        echo -e "  ${YELLOW}! a documented Hex OS example does not work when typed${NC}"
        DIVERGENCE=1
    else
        echo "$DX_OUT" | tail -1 | sed 's/^/  /'
    fi

    # A white-label student must never be shown Hexworth's own release notes. This is dormant
    # until a version bump, which is exactly why it needs a gate rather than a memory.
    WN_OUT="$(node "$REPO_ROOT/_tools/hexos/whatsnew-tenant.test.js" 2>&1)"
    WN_RC=$?
    if [[ $WN_RC -eq 2 ]]; then
        echo -e "  ${YELLOW}- What's New tenant guard SKIPPED (puppeteer unavailable)${NC}"
    elif [[ $WN_RC -ne 0 ]]; then
        echo "$WN_OUT" | grep -E "FAIL|passed" | tail -4 | sed 's/^/  /'
        echo -e "  ${YELLOW}! tenant students could be shown Hexworth release notes${NC}"
        DIVERGENCE=1
    else
        echo "$WN_OUT" | tail -1 | sed 's/^/  /'
    fi

    HT_OUT="$(node "$REPO_ROOT/_tools/career/gen-house-tracks.js" --check 2>&1)"
    HT_RC=$?
    echo "$HT_OUT" | head -3 | sed 's/^/  /'
    if [[ $HT_RC -ne 0 ]]; then
        echo -e "  ${YELLOW}! careers pages link to a catalog that has moved under them${NC}"
        # Naming only the regenerator, not the browser suite. The catalog derives its "wiring"
        # column by scanning for script paths, so mentioning the suite here would list it as
        # GATE when nothing actually invokes it -- and the catalog's one guarantee is that a
        # script cannot lie about having a caller. Re-run the suite by hand after regenerating.
        echo -e "  ${DIM}fix: node _tools/career/gen-house-tracks.js${NC}"
        DIVERGENCE=1
    fi
fi
echo ""

# ── Check 5: Lab content-leak browser smoke (hosting deploys only) ───
echo "[5/5] Lab content-leak browser smoke"
if [[ "$HOSTING_ONLY" != 1 ]]; then
    echo -e "  ${DIM}skipped (non-hosting deploy — lab content unchanged)${NC}"
elif [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run smoke-lab-content-leaks-remote.sh (executes on bc1, not here)${NC}"
elif [[ "${SKIP_LAB_SMOKE:-0}" == 1 ]]; then
    echo -e "  ${YELLOW}⚠ skipped (SKIP_LAB_SMOKE=1 — reason: ${SKIP_LAB_SMOKE_REASON:-unspecified})${NC}"
else
    # Preflight: confirm puppeteer is resolvable. If not, this is infra, not
    # regression — YELLOW warn + INFRA_FAIL=1, do NOT set DIVERGENCE.
    # ⚠ RUNS ON bc1, NOT HERE. Headless Chrome under WSL2 on this deploy host stalled roughly
    # half of all runs with 30s navigation timeouts on a randomly different lab, while curl on
    # the same machine fetched those pages 12/12 under 1.4s and bc1 ran the identical smoke 4/4
    # clean. Three real defects in the smoke were fixed first (see its header); this is the
    # residual, and it was the environment. The wrapper NEVER falls back to local — a silent
    # fallback would reintroduce the flake and leave nobody able to say which environment
    # produced a given result. It exits 2 when bc1 is unreachable, which the branches below
    # already treat as infrastructure rather than as a regression.
    SMOKE_OUTPUT=$("$REPO_ROOT/_tools/smoke-lab-content-leaks-remote.sh" 2>&1)
    SMOKE_EXIT=$?
    if [[ "$SMOKE_EXIT" == 0 ]]; then
        # Print the trailing summary line only — full output is noisy
        echo -e "  ${GREEN}✓${NC} $(echo "$SMOKE_OUTPUT" | grep -E '══ [0-9]+ PASS' | tail -1)"
    elif [[ "$SMOKE_EXIT" == 1 ]]; then
        echo -e "  ${RED}✗ lab content-leak smoke flagged regression(s):${NC}"
        echo "$SMOKE_OUTPUT" | sed 's/^/      /'
        DIVERGENCE=1
    else
        # Exit code 2 or other = infra failure (puppeteer launch, network)
        echo -e "  ${YELLOW}⚠ lab smoke infra failure (exit=$SMOKE_EXIT):${NC}"
        echo "$SMOKE_OUTPUT" | tail -10 | sed 's/^/      /'
        INFRA_FAIL=1
    fi
fi
echo ""

# ── EduScan baseline archive (drift detector for the NEXT deploy) ────
# Saves the current EduScan scan to _tools/eduscan/history/ so the next
# deploy's pre-deploy `--diff` step has a baseline. Runs only because
# post-verify only runs after firebase deploy succeeded. NON-FATAL on
# archive write failure — we don't fail a successful deploy because of
# a baseline-write hiccup.
echo ""
echo -e "${DIM}─────────────────────────${NC}"
echo -e "${GREEN}Archiving EduScan baseline for next-deploy drift detection...${NC}"
if (cd "$REPO_ROOT" && node _tools/eduscan/cli.js --archive --quiet > /tmp/eduscan-archive.log 2>&1); then
    ARCHIVED=$(ls -t "$REPO_ROOT/_tools/eduscan/history/"scan-*.json 2>/dev/null | head -1)
    if [[ -n "$ARCHIVED" ]]; then
        echo -e "  ${GREEN}✓${NC} archived: $(basename "$ARCHIVED")"
    else
        echo -e "  ${GREEN}✓${NC} archived (path not surfaced)"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} archive write failed (non-fatal — see /tmp/eduscan-archive.log)"
fi

# ── Final verdict ────────────────────────────────────────────────────
echo -e "${DIM}─────────────────────────${NC}"
if [[ "$DIVERGENCE" == 1 ]]; then
    echo -e "${RED}✗ post-verify FLAGGED divergence (deploy SHIPPED)${NC}"
    echo -e "${DIM}  Recovery runbook: _docs/operations/post-verify-recovery.md${NC}"
    exit 2
fi
if [[ "$INFRA_FAIL" == 1 ]]; then
    echo -e "${YELLOW}⚠ post-verify infra issues (deploy SHIPPED, verification incomplete)${NC}"
    echo -e "${DIM}  Recovery runbook: _docs/operations/post-verify-recovery.md${NC}"
    exit 3
fi
echo -e "${GREEN}✓ post-verify PASSED${NC}"
exit 0
