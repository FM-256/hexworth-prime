#!/bin/bash
# Post-deploy verification for the API track back-link fix.
# Baselines captured from production BEFORE the deploy; the four must invert, the three holdouts
# must not move.
# Matches the HREF, never the link label -- keying on the label is exactly how the original audit
# found 2 of the 4 broken hubs and called the other two clean.
set -u
P=https://hexworth.com
pass=0; fail=0
chk() { n=$(curl -s "$P$2" | grep -cE "$3"); if [ "$n" = "$5" ]; then
    printf '  OK    %-46s %s -> %s\n' "$1" "$4" "$n"; pass=$((pass+1))
  else printf '  FAIL  %-46s %s -> %s (expected %s)\n' "$1" "$4" "$n" "$5"; fail=$((fail+1)); fi; }
echo "── API track back-link verification ──"
for d in pentest capstone event-driven rate-limiting; do
  chk "$d: no link to the legacy Auth lesson" "/houses/cloud/api/$d/index.html" 'href="\.\./cloud-api-00[0-9]\.presentation\.html"' 1 0
  chk "$d: track link points at the index"    "/houses/cloud/api/$d/index.html" 'href="\.\./index\.html"' 0 1
done
echo "  ── holdouts must NOT have shipped ──"
chk "HOLDOUT incubator card absent"     "/houses/cloud/incubator/index.html" 'cloud-practitioner-final' 0 0
chk "HOLDOUT openstack capstone absent" "/houses/cloud/openstack/index.html" 'project-iac' 0 0
chk "HOLDOUT api-capstone NOT in registry" "/components/HubRegistry.js" "'api-capstone'" 0 0
echo ""
echo "  $pass passed, $fail failed."
[ "$fail" -eq 0 ] || exit 1
