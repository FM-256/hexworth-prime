#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(sed -n 5p /home/student/$MISSION_DEPT/notes.txt)" = 'Merge: pending'
