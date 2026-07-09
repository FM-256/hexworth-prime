#!/bin/sh
ERR=$(. /opt/mission/env.cpmv-relocation 2>&1)
[ -z "$ERR" ] || { echo "ENV SOURCE ERRORS(cpmv-relocation): $ERR"; exit 1; }
. /opt/mission/env.cpmv-relocation
for k in $(grep -oE '^MISSION_[A-Z0-9_]+' /opt/mission/env.cpmv-relocation); do
  v=$(eval printf '%s' "\${$k}")
  [ -n "$v" ] || { echo "EMPTY ENV VAR(cpmv-relocation): $k"; exit 1; }
done
echo "env ok: cpmv-relocation"
