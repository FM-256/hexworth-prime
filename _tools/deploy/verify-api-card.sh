#!/bin/bash
# Post-deploy verification for the API Security card. Baselines captured BEFORE the deploy; each
# must invert, and the two holdouts must NOT move.
# Matches an anchor ELEMENT, not the bare string "api/index.html" -- that substring also occurs in
# other hrefs on the page, and three of my checks today reported wrong answers by matching prose or
# a substring instead of the thing itself.
set -u
P=https://hexworth.com
pass=0; fail=0
chk() { n=$(curl -s "$P$2" | grep -cE "$3"); if [ "$n" = "$5" ]; then
    printf '  OK    %-44s %s -> %s\n' "$1" "$4" "$n"; pass=$((pass+1))
  else printf '  FAIL  %-44s %s -> %s (expected %s)\n' "$1" "$4" "$n" "$5"; fail=$((fail+1)); fi; }
echo "── api card post-deploy verification ──"
chk "cloud course cards on the house page" "/houses/cloud/index.html" 'class="cloud-course-card"' 4 5
chk "api card anchor present"              "/houses/cloud/index.html" '<a href="api/index.html" class="cloud-course-card"' 0 1
echo "  ── holdouts must NOT have shipped ──"
chk "HOLDOUT incubator card absent"        "/houses/cloud/incubator/index.html" 'cloud-practitioner-final' 0 0
chk "HOLDOUT openstack capstone absent"    "/houses/cloud/openstack/index.html" 'project-iac' 0 0
echo ""
echo "  $pass passed, $fail failed."
[ "$fail" -eq 0 ] || exit 1
