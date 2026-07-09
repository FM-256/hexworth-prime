#!/bin/sh
. /opt/mission/env.cd-breadcrumbs 2>/dev/null
test -f /home/student/$MISSION_DEPT/depth.txt && grep -qx '8' /home/student/$MISSION_DEPT/depth.txt
