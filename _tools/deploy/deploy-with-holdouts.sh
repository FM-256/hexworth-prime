#!/bin/bash
# DEPLOY WHILE HOLDING SPECIFIC FILES BACK, as one self-verifying operation.
#
# WHY. deploy.sh ships the WORKING TREE, not a commit. Shipping a subset therefore means swapping
# gated files to their last-deployed content, deploying, and restoring them. Done by hand that is
# four steps with no memory between them, and I have now run it twice in one day: the second time
# the files had been restored by the first run, so they were sitting in the tree with their blocked
# content and a straight `./deploy.sh` would have shipped both. Nothing warned me; I happened to look.
#
# The failure is silent in both directions -- forget the swap and blocked content ships; forget the
# restore and real work is discarded on the NEXT deploy. This makes both halves mandatory and checked.
#
# usage: deploy-with-holdouts.sh <sha:path> [<sha:path> ...] -- [deploy.sh args]
#   each holdout is the commit whose version should ship, and the path to hold back.
set -u
cd "$(dirname "$0")/../.." || exit 1
HOLD=(); ARGS=()
seen_sep=0
for a in "$@"; do
  if [ "$a" = "--" ]; then seen_sep=1; continue; fi
  if [ $seen_sep -eq 1 ]; then ARGS+=("$a"); else HOLD+=("$a"); fi
done
[ ${#HOLD[@]} -gt 0 ] || { echo "usage: $0 <sha:path> [...] -- [deploy args]"; exit 2; }

A=_archive/deploy-holdout-$(git log -1 --format=%cd --date=format:%Y-%m-%d)
mkdir -p "$A"

echo "── [1/4] archiving current versions ──"
for h in "${HOLD[@]}"; do
  p="${h#*:}"; b=$(basename "$p")
  cp "$p" "$A/$b.held" || exit 1
  cmp -s "$p" "$A/$b.held" || { echo "  ARCHIVE VERIFY FAILED for $p -- aborting"; exit 1; }
  echo "  archived+verified  $p"
done

echo "── [2/4] swapping holdouts to their last-deployed content ──"
for h in "${HOLD[@]}"; do
  sha="${h%%:*}"; p="${h#*:}"
  git show "$sha:$p" > "$p" || { echo "  git show failed for $sha:$p"; exit 1; }
  echo "  $p <- $sha"
done

echo "── [3/4] deploy ──"
./deploy.sh "${ARGS[@]+"${ARGS[@]}"}"
rc=$?

# ALWAYS restore, deploy success or not. A failed deploy that leaves the tree swapped is how the
# next deploy silently discards real work.
echo "── [4/4] restoring holdouts from git (runs even if the deploy failed) ──"
fail=0
for h in "${HOLD[@]}"; do
  p="${h#*:}"; b=$(basename "$p")
  git checkout HEAD -- "$p" || { echo "  RESTORE FAILED $p"; fail=1; continue; }
  cmp -s "$p" "$A/$b.held" && echo "  restored+verified  $p" \
    || { echo "  RESTORE MISMATCH $p vs $A/$b.held"; fail=1; }
done
d=$(git status --porcelain _app | wc -l)
[ "$d" -eq 0 ] || { echo "  _app NOT CLEAN after restore ($d file(s)) -- fix before the next deploy"; fail=1; }

echo ""
[ $rc -eq 0 ] && echo "  deploy exit: 0" || echo "  deploy exit: $rc (FAILED)"
[ $fail -eq 0 ] && echo "  holdouts restored and verified." || echo "  HOLDOUT RESTORE PROBLEM -- do not deploy again until clean."
[ $rc -eq 0 ] && [ $fail -eq 0 ]
