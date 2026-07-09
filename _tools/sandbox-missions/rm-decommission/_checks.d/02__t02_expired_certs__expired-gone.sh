#!/bin/sh
. /opt/mission/env.rm-decommission 2>/dev/null
test -z "$(find /home/student/$MISSION_DEPT/decommission -maxdepth 1 -name 'expired_*.cert' -print -quit)"
