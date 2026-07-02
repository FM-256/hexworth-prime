#!/bin/bash
# navigate/check.sh — grades by real state: found.txt must hold the seeded token.
set -u
W="$WORKSPACE"
TOKEN=$(sudo cat /opt/hexlab/answers/navigate.token 2>/dev/null)
pass=0; fail=0
ck() { # ck DESCRIPTION COMMAND... — run a test, print PASS/FAIL.
  local desc="$1"; shift
  if "$@" >/dev/null 2>&1; then echo "  PASS  $desc"; pass=$((pass+1)); else echo "  FAIL  $desc"; fail=$((fail+1)); fi
}
ck "found.txt exists in ~/lab"                 test -f "$W/found.txt"
ck "found.txt contains the real treasure token" grep -q "HEXTOKEN:$TOKEN" "$W/found.txt"
echo ""
if [ "$fail" -eq 0 ]; then echo "ALL OBJECTIVES COMPLETE — well navigated."; exit 0
else echo "$fail objective(s) remaining. (lab hint if stuck)"; exit 1; fi
