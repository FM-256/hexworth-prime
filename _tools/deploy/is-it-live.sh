#!/bin/bash
# Is what I just changed actually LIVE?  Usage:  bash _tools/deploy/is-it-live.sh [path ...]
# With no args, checks every _app/ file touched by the last commit.
#
# WHY THIS EXISTS: I told the operator "NOT deployed" about Gate 6 for hours while it was
# live, discoverable, and serving a claim a reviewer had disproved. deploy.sh ships ALL of
# _app/, so ANY deploy publishes every file sitting in that tree -- including ones still
# under review. "Not deployed" was intent I never verified.
#
# I verify content claims habitually and deployment-state claims never. This makes the
# second as cheap as the first.
set -u
SITE="${SITE:-https://hexworth.com}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

FILES=("$@")
if [ ${#FILES[@]} -eq 0 ]; then
  mapfile -t FILES < <(git diff-tree --no-commit-id --name-only -r HEAD -- _app/ | grep -v '^$')
  echo "checking _app/ files from the last commit ($(git log --oneline -1 | cut -c1-9))"
fi
[ ${#FILES[@]} -eq 0 ] && { echo "no _app/ files in that commit -- nothing to check"; exit 0; }

drift=0
for f in "${FILES[@]}"; do
  [ -f "$f" ] || continue
  url="$SITE/${f#_app/}"
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$url")
  if [ "$code" != "200" ]; then
    printf "  %-58s NOT SERVING (%s)\n" "${f#_app/}" "$code"
    continue
  fi
  lh=$(sha256sum "$f" | cut -c1-12)
  rh=$(curl -s --max-time 30 "$url" | sha256sum | cut -c1-12)
  if [ "$lh" = "$rh" ]; then
    printf "  %-58s LIVE = local\n" "${f#_app/}"
  else
    printf "  %-58s LIVE DIFFERS from local  (local %s / live %s)\n" "${f#_app/}" "$lh" "$rh"
    drift=$((drift+1))
  fi
done
echo
if [ $drift -gt 0 ]; then
  echo "$drift file(s) differ from production."
  echo "That is fine if you meant to hold them back -- but say 'committed, not deployed',"
  echo "and know that the NEXT deploy of anything will publish them, reviewed or not."
  exit 1
fi
echo "everything checked matches production."
