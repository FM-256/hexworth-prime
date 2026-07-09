#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(sed -n 2p /home/student/$MISSION_DEPT/notes.txt)" = 'Status: recovery in progress'
