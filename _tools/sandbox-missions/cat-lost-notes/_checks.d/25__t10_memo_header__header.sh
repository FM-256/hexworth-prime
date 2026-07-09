#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(sed -n 1p /home/student/$MISSION_DEPT/memo.txt)" = "MEMO: $MISSION_DEPT recovery"
