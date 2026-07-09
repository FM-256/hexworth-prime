#!/bin/sh
. /opt/mission/env.mkdir-groundbreaking 2>/dev/null
test "$(ls -d /home/student/$MISSION_DEPT/expansion/wing_* 2>/dev/null | awk 'END{print NR}')" -eq 1
