#!/usr/bin/env bash
# Engine 1: prove a team's credential opens ONLY that team's box.
set -uo pipefail
BASE=/srv/hexworth/engine1
TEAMS=(blue-shield-v3 cyan-storm gold-strike green-ops purple-haze red-cell)
declare -A IP PPW
for t in "${TEAMS[@]}"; do
  IP[$t]=$(sudo virsh domifaddr "engine1-team-$t" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
  PPW[$t]=$(awk '/^player /{print $2}' "$BASE/config/team-$t.cred" 2>/dev/null)
done

try() { # password host -> prints OK or NO
  sshpass -p "$1" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    -o ConnectTimeout=15 -o NumberOfPasswordPrompts=1 player@"$2" "cmd /c echo LOGIN_OK" 2>/dev/null \
    | tr -d '\r' | grep -q LOGIN_OK && echo OK || echo NO
}

echo "=== own credential must OPEN own box ==="
own_ok=0
for t in "${TEAMS[@]}"; do
  r=$(try "${PPW[$t]}" "${IP[$t]}")
  [ "$r" = "OK" ] && own_ok=$((own_ok+1))
  printf "  %-16s -> own box %-16s %s\n" "$t" "${IP[$t]}" "$r"
done
echo "  own-box logins succeeded: $own_ok / ${#TEAMS[@]}"

echo "=== a team credential must NOT open any OTHER team's box ==="
leaks=0; tested=0
for a in "${TEAMS[@]}"; do
  for b in "${TEAMS[@]}"; do
    [ "$a" = "$b" ] && continue
    r=$(try "${PPW[$a]}" "${IP[$b]}")
    tested=$((tested+1))
    if [ "$r" = "OK" ]; then leaks=$((leaks+1)); echo "  LEAK: $a credential opened $b ( ${IP[$b]} )"; fi
  done
done
echo "  cross-team attempts: $tested   LEAKS: $leaks"
[ "$leaks" -eq 0 ] && echo "  RESULT: credential isolation holds" || echo "  RESULT: ISOLATION BROKEN"
