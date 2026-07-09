#!/bin/sh
# Runner: executes every per-check script, prints PASS/FAIL per check + summary.
fails=0; total=0
for s in /tmp/checks.d/*.sh; do
  total=$((total+1))
  if sh "$s" >/dev/null 2>&1; then echo "PASS $(basename $s .sh)"; else echo "FAIL $(basename $s .sh)"; fails=$((fails+1)); fi
done
echo "RESULT: $((total-fails))/$total checks pass ($fails fail)"
