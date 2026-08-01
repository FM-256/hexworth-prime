#!/bin/bash
# Restore the two files held out of the 2026-08-01 deploy, then prove the tree is whole again.
#
# WHY A SCRIPT. deploy.sh ships the WORKING TREE, so shipping a subset meant hand-reverting two
# gated files before the deploy. Leaving them reverted afterwards would silently discard real work
# -- the incubator card and the capstone link -- and a half-finished restore looks identical to a
# finished one. This makes it one step that verifies itself.
#
# It restores from GIT, not from the archive copies. Git is the authority for tracked files; the
# archive at _archive/deploy-holdout-2026-08-01/ is the belt-and-braces copy taken before the swap
# and is only compared against here, never used as the source.
set -u
cd "$(dirname "$0")/../.." || exit 1
A=_archive/deploy-holdout-2026-08-01
I=_app/houses/cloud/incubator/index.html
O=_app/houses/cloud/openstack/index.html
fail=0

echo "── restoring holdouts from git ──"
git checkout HEAD -- "$I" "$O" || { echo "  git checkout FAILED"; exit 1; }

# Falsifiable: the two markers that were deliberately absent during the deploy must be back.
c=$(grep -c 'cloud-practitioner-final' "$I"); [ "$c" -ge 1 ] \
  && echo "  OK    incubator card restored (count $c)" \
  || { echo "  FAIL  incubator card still missing"; fail=1; }
c=$(grep -c 'project-iac' "$O"); [ "$c" -ge 1 ] \
  && echo "  OK    openstack capstone link restored (count $c)" \
  || { echo "  FAIL  openstack capstone link still missing"; fail=1; }

# Cross-check against the pre-swap archive. If these differ, one of the two is not what I think.
cmp -s "$I" "$A/incubator.index.html.BLOCKED-chris" \
  && echo "  OK    incubator matches the pre-deploy archive byte for byte" \
  || { echo "  FAIL  incubator differs from the archive taken before the swap"; fail=1; }
cmp -s "$O" "$A/openstack.index.html.HELD-nancy" \
  && echo "  OK    openstack matches the pre-deploy archive byte for byte" \
  || { echo "  FAIL  openstack differs from the archive taken before the swap"; fail=1; }

# The tree must be clean afterwards: a leftover modification here is the bug this script exists
# to prevent, and it would silently ship on the NEXT deploy.
d=$(git status --porcelain _app | wc -l)
[ "$d" -eq 0 ] && echo "  OK    _app tree clean, 0 modified files" \
                || { echo "  FAIL  _app still has $d modified file(s):"; git status --porcelain _app | sed 's/^/          /'; fail=1; }

echo ""
[ "$fail" -eq 0 ] && echo "  HOLDOUTS RESTORED AND VERIFIED." || echo "  RESTORE INCOMPLETE -- do not deploy again until this is clean."
exit $fail
