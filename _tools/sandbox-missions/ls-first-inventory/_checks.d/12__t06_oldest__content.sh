#!/bin/sh
. /opt/mission/env.ls-first-inventory 2>/dev/null
grep -qx "$MISSION_OLDEST" /home/student/$MISSION_DEPT/reports/oldest.txt
