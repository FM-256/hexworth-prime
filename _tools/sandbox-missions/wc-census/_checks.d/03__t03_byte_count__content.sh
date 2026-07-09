#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test -f /home/student/$MISSION_DEPT/census/export_bytes.txt && grep -qxE " *$MISSION_EXPORT_BYTES" /home/student/$MISSION_DEPT/census/export_bytes.txt
