#!/usr/bin/env bash
# Run the lab content-leak smoke on bc1 instead of the deploy host.
#
# WHY
#   The smoke failed a deploy on 2026-08-19 and then roughly half of all repeated runs, always
#   as a 30s navigation timeout on a randomly different lab. Three real defects were found and
#   fixed in smoke-lab-content-leaks.js, and a residual stall remained. Everything measurable
#   said the deploy host, not the site:
#
#     curl, 12 fetches ....... all under 1.4s
#     DNS .................... 0.14-0.27s
#     8 concurrent fetches ... 477ms total
#     one page, same browser . 184-1645ms
#     the SAME url ........... timed out at 31.7s, then loaded in 254ms on the next attempt
#
#   Only headless Chrome under WSL2 stalled. Measured side by side:
#
#     deploy host (WSL2) ..... ~50% of runs flagged
#     bc1 (container) ........ 4 of 4 clean
#
#   So this does not tune the test further. It runs it somewhere the browser works.
#
# ⚠ IT DOES NOT FALL BACK TO LOCAL. A silent fallback would quietly reintroduce the flake and
#   nobody would know which environment produced a given result. If bc1 is unreachable this
#   exits 2 (infrastructure) rather than 1 (regression), so post-verify can tell "we could not
#   check" apart from "a check failed" — the same distinction the service probe draws.
#
# Exit codes match the local script so callers need no special handling:
#   0 — all assertions passed
#   1 — one or more assertions failed (regression)
#   2 — infrastructure failure (bc1 unreachable, docker missing, image pull failed)
#
# @catalog what    run the lab content-leak smoke on bc1, where headless Chrome is reliable
# @catalog run     _tools/smoke-lab-content-leaks-remote.sh
# @catalog status  GATE

set -u

HOST="${SMOKE_REMOTE_HOST:-bc1-cf}"
IMG="${SMOKE_PUPPETEER_IMAGE:-ghcr.io/puppeteer/puppeteer:latest}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO_ROOT/_tools/smoke-lab-content-leaks.js"
REMOTE_PATH="/tmp/smoke-lab-content-leaks.$$.js"

[ -f "$SCRIPT" ] || { echo "  smoke script not found at $SCRIPT"; exit 2; }

# Ship the CURRENT repo copy every run. Never trust a file already on the host — a stale copy
# would silently test different code than the one under review.
if ! scp -q -o ConnectTimeout=15 "$SCRIPT" "$HOST:$REMOTE_PATH" 2>/dev/null; then
    echo "  ✗ cannot reach $HOST to run the smoke (scp failed)"
    echo "    This is an INFRASTRUCTURE failure, not a regression. The smoke did not run."
    exit 2
fi

OUT=$(ssh -o ConnectTimeout=20 "$HOST" "
    command -v docker >/dev/null 2>&1 || { echo '__NO_DOCKER__'; exit 0; }
    docker image inspect '$IMG' >/dev/null 2>&1 || docker pull -q '$IMG' >/dev/null 2>&1 || { echo '__NO_IMAGE__'; exit 0; }
    timeout 300 docker run --rm --network host \
        -v '$REMOTE_PATH':/home/pptruser/smoke.js:ro \
        -w /home/pptruser '$IMG' node smoke.js 2>&1
    echo \"__EXIT__\$?\"
    rm -f '$REMOTE_PATH'
" 2>&1)

case "$OUT" in
    *__NO_DOCKER__*) echo "  ✗ docker not available on $HOST"; exit 2 ;;
    *__NO_IMAGE__*)  echo "  ✗ could not obtain $IMG on $HOST"; exit 2 ;;
esac

printf '%s\n' "$OUT" | grep -v '__EXIT__'
echo "  (ran on $HOST — headless Chrome is unreliable on the WSL2 deploy host; see this script's header)"

RC=$(printf '%s' "$OUT" | grep -oE '__EXIT__[0-9]+' | tail -1 | sed 's/__EXIT__//')
[ -n "$RC" ] || { echo "  ✗ no exit code returned from $HOST — treating as infrastructure failure"; exit 2; }
exit "$RC"
