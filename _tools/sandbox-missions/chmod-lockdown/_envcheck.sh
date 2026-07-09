#!/bin/sh
ERR=$(. /opt/mission/env.chmod-lockdown 2>&1)
[ -z "$ERR" ] || { echo "ENV SOURCE ERRORS: $ERR"; exit 1; }
. /opt/mission/env.chmod-lockdown
for k in $(grep -oE '^MISSION_[A-Z0-9_]+' /opt/mission/env.chmod-lockdown); do
  v=$(eval printf '%s' "\${$k}")
  [ -n "$v" ] || { echo "EMPTY ENV VAR: $k"; exit 1; }
done
echo "env integrity ok"
