#!/bin/sh
. /opt/mission/env.rm-decommission 2>/dev/null
test -z "$(ls -A /home/student/$MISSION_DEPT/decommission/cache 2>/dev/null)"
