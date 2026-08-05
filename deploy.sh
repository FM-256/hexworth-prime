#!/bin/bash
# deploy.sh - Hexworth Prime deployment with multi-layer safety gates
#
# Gates (in order, cheapest to most expensive):
#   1. Branch check    : must be on master (CLAUDE.md Rule #10) — no override
#   1.5 Chris gate     : recorded Chris purpose+bar QC PASS must match HEAD — --skip-chris bypass (with reason)
#   2. Nexus gate      : static-analysis quality scan — --force bypass
#   3. Smoke gate      : real-browser pre-render check (Puppeteer) — --skip-smoke bypass
#   4. firebase deploy --only hosting
#   5. Post-verify     : nexus refresh + EduScan + log-spike check — --skip-post-verify bypass (with reason)
#   6. Confluence inventory regen (post-deploy, NON-BLOCKING — never aborts deploy)
#   7. IndexNow ping (post-deploy, NON-BLOCKING — notifies Bing-family search engines)
#
# Usage:
#   ./deploy.sh                     Run all gates, deploy hosting + regen inventory + ping IndexNow
#   ./deploy.sh --strict            Nexus blocks on CRITICAL or HIGH
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
