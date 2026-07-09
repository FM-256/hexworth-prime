#!/bin/sh
. /opt/mission/env.ls-first-inventory 2>/dev/null
grep -qx "$MISSION_HIDDEN_COUNT" /home/student/$MISSION_DEPT/reports/hiddencount.txt
