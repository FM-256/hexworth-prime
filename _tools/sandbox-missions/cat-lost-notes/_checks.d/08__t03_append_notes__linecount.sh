#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(awk 'END{print NR}' /home/student/$MISSION_DEPT/notes.txt)" -eq 5
