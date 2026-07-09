#!/bin/sh
. /opt/mission/env.cd-breadcrumbs 2>/dev/null
test "$(sed -n 2p /home/student/$MISSION_DEPT/toggle.txt)" = "/opt/campus/annex"
