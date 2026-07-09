#!/bin/sh
. /opt/mission/env.mkdir-groundbreaking 2>/dev/null
test "$(stat -c %a /home/student/$MISSION_DEPT/expansion/vault)" = "700"
