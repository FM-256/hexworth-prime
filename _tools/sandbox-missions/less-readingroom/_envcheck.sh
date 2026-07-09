#!/bin/sh
ERR=$(. /opt/mission/env.less-readingroom 2>&1)
[ -z "$ERR" ] || { echo "ENV SOURCE ERRORS(less-readingroom): $ERR"; exit 1; }
. /opt/mission/env.less-readingroom
for k in $(grep -oE '^MISSION_[A-Z0-9_]+' /opt/mission/env.less-readingroom); do
  v=$(eval printf '%s' "\${$k}")
  [ -n "$v" ] || { echo "EMPTY ENV VAR(less-readingroom): $k"; exit 1; }
done
echo "env ok: less-readingroom"
