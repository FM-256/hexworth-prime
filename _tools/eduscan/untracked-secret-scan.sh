#!/bin/bash
# SENSITIVE DATA IN UNTRACKED-BUT-COMMITTABLE FILES.
#
# WHY. functions/uids.json held 30 real Firebase UIDs mapped to OpenStack project ids. It was
# untracked, so no code scanner looked at it -- and `git check-ignore` matched NOTHING, so a stray
# `git add -A` would have committed real student identifiers into a history nobody rewrites.
# It was never committed, but only by luck. (BUG-083)
#
# A scanner that reads only TRACKED files is structurally blind to this. So is one that reads only
# ignored files. The dangerous set is exactly: UNTRACKED **AND NOT IGNORED**.
set -u
cd "$(dirname "$0")/../.." || exit 1
echo "── untracked AND not-ignored files carrying identifier/secret shapes ──"
found=0; scanned=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in *.png|*.jpg|*.webp|*.pdf|*.zip|*.woff*) continue;; esac
  scanned=$((scanned+1))
  uid=$(grep -coE '"[A-Za-z0-9_-]{28}"' "$f" 2>/dev/null)
  sec=$(grep -ciE '(api[_-]?key|client[_-]?secret|private[_-]?key|BEGIN [A-Z ]*PRIVATE KEY|password"|passwd"|bearer [A-Za-z0-9._-]{20})' "$f" 2>/dev/null)
  em=$(grep -coE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}' "$f" 2>/dev/null)
  # grep -c already prints 0 on no-match; the old `|| echo 0` fallback appended a SECOND
  # zero ("0\n0") and every comparison then failed with "integer expression expected".
  if [ "${uid:-0}" -gt 0 ] 2>/dev/null || [ "${sec:-0}" -gt 0 ] 2>/dev/null || [ "${em:-0}" -gt 2 ] 2>/dev/null; then
    found=$((found+1))
    printf '  FLAG  %-58s uid:%-4s secret:%-4s email:%s\n' "$f" "$uid" "$sec" "$em"
  fi
done < <(git ls-files --others --exclude-standard)
echo ""
echo "  $scanned untracked, non-ignored file(s) scanned; $found flagged."
echo "  Email threshold is >2 so a doc quoting one support address does not trip it."
echo "  A FLAG is a suspect: check whether the data is real before acting, and ARCHIVE, never delete."
[ "$found" -eq 0 ] || exit 1
