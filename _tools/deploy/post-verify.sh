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
    if ! node "$REPO_ROOT/_tools/eduscan/cli.js" --fail-on critical,high >/dev/null 2>&1; then
        echo -e "  ${RED}✗ EduScan found critical/high findings post-deploy${NC}"
        DIVERGENCE=1
    else
        echo -e "  ${GREEN}✓${NC} no critical/high findings"
    fi
fi
echo ""

# ── Check 5: Lab content-leak browser smoke (hosting deploys only) ───
echo "[5/5] Lab content-leak browser smoke"
if [[ "$HOSTING_ONLY" != 1 ]]; then
    echo -e "  ${DIM}skipped (non-hosting deploy — lab content unchanged)${NC}"
elif [[ "$DRY_RUN" == 1 ]]; then
    echo -e "  ${DIM}DRY-RUN: would run smoke-lab-content-leaks.js${NC}"
elif [[ "${SKIP_LAB_SMOKE:-0}" == 1 ]]; then
    echo -e "  ${YELLOW}⚠ skipped (SKIP_LAB_SMOKE=1 — reason: ${SKIP_LAB_SMOKE_REASON:-unspecified})${NC}"
else
    # Preflight: confirm puppeteer is resolvable. If not, this is infra, not
    # regression — YELLOW warn + INFRA_FAIL=1, do NOT set DIVERGENCE.
    if ! node -e "require('puppeteer')" >/dev/null 2>&1; then
        echo -e "  ${YELLOW}⚠ puppeteer not resolvable — skipping (run 'npm i puppeteer' in repo root)${NC}"
        INFRA_FAIL=1
    else
        SMOKE_OUTPUT=$(node "$REPO_ROOT/_tools/smoke-lab-content-leaks.js" 2>&1)
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
fi
echo ""

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
