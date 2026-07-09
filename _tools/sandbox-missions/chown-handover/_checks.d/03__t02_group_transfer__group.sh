#!/bin/sh
. /opt/mission/env.chown-handover 2>/dev/null
test "$(stat -c %G /home/student/$MISSION_DEPT/handover/shared_notes.txt)" = "analysts"
