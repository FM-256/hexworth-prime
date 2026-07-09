#!/bin/sh
. /opt/mission/env.find-sweep 2>/dev/null
test -f /home/student/$MISSION_DEPT/sweep/filecount.txt && grep -qxE " *$MISSION_FILES_AFTER" /home/student/$MISSION_DEPT/sweep/filecount.txt
