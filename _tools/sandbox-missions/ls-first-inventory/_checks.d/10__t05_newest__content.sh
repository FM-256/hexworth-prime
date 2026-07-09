#!/bin/sh
. /opt/mission/env.ls-first-inventory 2>/dev/null
grep -qx "$MISSION_NEWEST" /home/student/$MISSION_DEPT/reports/newest.txt
