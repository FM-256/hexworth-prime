#!/bin/sh
. /opt/mission/env.cd-breadcrumbs 2>/dev/null
test "$(awk 'END{print NR}' /home/student/$MISSION_DEPT/toggle.txt)" -eq 2
