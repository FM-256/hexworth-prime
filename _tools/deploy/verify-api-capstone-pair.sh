#!/bin/bash
# Post-deploy verification for the api-capstone rules/registry PAIR.
# Both halves must be live, or the pair is not shipped. Baselines captured before the deploy:
# rules had it ABSENT, registry had it ABSENT. Both must now read PRESENT.
set -u
P=https://hexworth.com
pass=0; fail=0
chk() { n=$(curl -s "$P$2" | grep -cE "$3"); if [ "$n" = "$5" ]; then
    printf '  OK    %-44s %s -> %s\n' "$1" "$4" "$n"; pass=$((pass+1))
  else printf '  FAIL  %-44s %s -> %s (expected %s)\n' "$1" "$4" "$n" "$5"; fail=$((fail+1)); fi; }
echo "── api-capstone pair verification ──"
echo "  [half 1] firestore rules, read from the Rules REST API:"
if bash "$(dirname "$0")/verify-deployed-rules.sh" "'api-capstone'" 1 >/dev/null 2>&1; then
  echo "  OK    rules reserve api-capstone                 absent -> present"; pass=$((pass+1))
else
  echo "  FAIL  rules do NOT reserve api-capstone"; fail=$((fail+1)); fi
echo "  [half 2] hosting:"
chk "HubRegistry serves api-capstone"      "/components/HubRegistry.js" "'api-capstone'" 0 1
chk "cloud-master children still 11"       "/components/HubRegistry.js" "parent: 'cloud-master'" 11 11
echo "  ── holdouts must still NOT be live ──"
chk "HOLDOUT incubator card absent"        "/houses/cloud/incubator/index.html" 'cloud-practitioner-final' 0 0
chk "HOLDOUT openstack capstone absent"    "/houses/cloud/openstack/index.html" 'project-iac' 0 0
echo ""
echo "  $pass passed, $fail failed."
[ "$fail" -eq 0 ] || exit 1
