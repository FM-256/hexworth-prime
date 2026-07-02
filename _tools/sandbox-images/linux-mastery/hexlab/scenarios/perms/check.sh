#!/bin/bash
# perms/check.sh — grades by inspecting real modes/ownership with stat.
set -u
W="$WORKSPACE"
pass=0; fail=0
ck() { local desc="$1"; shift; if "$@" >/dev/null 2>&1; then echo "  PASS  $desc"; pass=$((pass+1)); else echo "  FAIL  $desc"; fail=$((fail+1)); fi; }
mode() { stat -c '%a' "$1" 2>/dev/null; }

# backup.sh: user-execute set, group/other write clear.
ck "backup.sh is executable by its owner"   bash -c '[ -x "'"$W"'/backup.sh" ]'
ck "backup.sh is not group/other writable"  bash -c 'm=$(stat -c %a "'"$W"'/backup.sh"); [ $((0$m % 100 / 10 & 2)) -eq 0 ] && [ $((0$m % 10 & 2)) -eq 0 ]'
# shared dir: user r+x at minimum.
ck "shared/ can be entered and listed"      bash -c '[ -r "'"$W"'/shared" ] && [ -x "'"$W"'/shared" ]'
if [ "${LEVEL:-1}" -ge 2 ]; then
  ck "svc.log owned by svc-backup:svc-backup" bash -c '[ "$(stat -c %U:%G "'"$W"'/private/svc.log")" = "svc-backup:svc-backup" ]'
  ck "idtool setuid bit removed"              bash -c 'm=$(stat -c %a "'"$W"'/shared/idtool"); [ "${#m}" -le 3 ] || [ "${m:0:1}" -lt 4 ]'
fi
echo ""
if [ "$fail" -eq 0 ]; then echo "ALL OBJECTIVES COMPLETE — permissions mastered."; exit 0
else echo "$fail objective(s) remaining. (lab hint if stuck)"; exit 1; fi
