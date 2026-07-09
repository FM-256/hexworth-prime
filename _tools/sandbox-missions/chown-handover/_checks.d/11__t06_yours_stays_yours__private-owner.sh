#!/bin/sh
. /opt/mission/env.chown-handover 2>/dev/null
test "$(stat -c %U /home/student/$MISSION_DEPT/handover/my_private_notes.txt)" = "student"
