#!/bin/sh
. /opt/mission/env.chown-handover 2>/dev/null
test "$(stat -c %U:%G /home/student/$MISSION_DEPT/handover/template.txt)" = "$(stat -c %U:%G /home/student/$MISSION_DEPT/handover/nightly.dat)"
