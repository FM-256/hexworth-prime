#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(sed -n 4p /home/student/$MISSION_DEPT/notes.txt)" = 'Fragments: located'
