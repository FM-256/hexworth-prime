#!/usr/bin/env bash
# serve.sh -- local QA server for _app, so nobody has to open pages with file://
#
# WHY THIS EXISTS
#   Opening a lab, quiz or game page by double-clicking it (file://) produces a BLANK PAGE with
#   no console error. AccessGuard.js injects `body { visibility: hidden }` the moment it loads,
#   and only showContent() -- reachable via AccessGuard.require() -- ever removes it. Over
#   file:// the auth chain cannot complete, so the guard fails closed and the body is replaced.
#   Measured 2026-08-03: every lab page collapsed from 15-46KB to ~12.2KB, including pages that
#   had not been touched. It looks exactly like a broken page, and it has cost real debugging
#   time -- once while chasing a genuine regression that the same symptom was hiding.
#
#   Served over http:// the guard works normally. That is the whole fix: serve, do not file://.
#
# USAGE
#   _tools/qa/serve.sh              # serve on 8080
#   _tools/qa/serve.sh 9001         # serve on a specific port
#
#   Then open the printed URL. To view gated content you must look "sorted" to the guard --
#   paste the one-liner it prints into DevTools console once, then reload. That is the same
#   localStorage key a real sorted student carries; it is not a bypass, and it does not work
#   for admin-only pages.
#
# NOTE ON WHAT THIS IS NOT
#   AccessGuard is a client-side UX gate, not a security boundary -- every page's full content
#   is already fetchable anonymously with curl (verified 2026-08-03: a gated lab returned 200
#   with all its task content). So nothing here exposes anything that was protected.
set -euo pipefail

PORT="${1:-8080}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/_app"

if [ ! -d "$ROOT" ]; then
  echo "error: _app not found at $ROOT" >&2
  exit 1
fi

if command -v ss >/dev/null 2>&1 && ss -ltn "( sport = :$PORT )" 2>/dev/null | grep -q ":$PORT"; then
  echo "error: port $PORT is already in use -- pass a different one, e.g. $0 $((PORT+1))" >&2
  exit 1
fi

cat <<BANNER

  Hexworth local QA server
  ------------------------
  serving : $ROOT
  url     : http://127.0.0.1:$PORT/

  To see gated content, open DevTools console once and run:

      localStorage.setItem('hexworth_house','cloud'); location.reload();

  (use 'script', 'web', 'shield', 'eye', 'key' etc. for other houses)

  Handy pages:
      http://127.0.0.1:$PORT/games.html
      http://127.0.0.1:$PORT/houses/cloud/openstack/index.html
      http://127.0.0.1:$PORT/houses/cloud/games/cloud-the-nines.html

  Do NOT open these files with file:// -- the access guard fails closed and
  you get a blank page with no error. Ctrl-C to stop.

BANNER

cd "$ROOT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
