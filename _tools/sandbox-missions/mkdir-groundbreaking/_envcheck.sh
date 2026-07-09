#!/bin/sh
ERR=$(. /opt/mission/env.mkdir-groundbreaking 2>&1)
[ -z "$ERR" ] || { echo "ENV SOURCE ERRORS(mkdir-groundbreaking): $ERR"; exit 1; }
. /opt/mission/env.mkdir-groundbreaking
for k in $(grep -oE '^MISSION_[A-Z0-9_]+' /opt/mission/env.mkdir-groundbreaking); do
  v=$(eval printf '%s' "\${$k}")
  [ -n "$v" ] || { echo "EMPTY ENV VAR(mkdir-groundbreaking): $k"; exit 1; }
done
echo "env ok: mkdir-groundbreaking"
