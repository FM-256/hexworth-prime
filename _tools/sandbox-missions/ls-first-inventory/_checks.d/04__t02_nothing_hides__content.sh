#!/bin/sh
. /opt/mission/env.ls-first-inventory 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/reports/all.txt | cut -d' ' -f1)" = "$MISSION_SHA_ALL"
