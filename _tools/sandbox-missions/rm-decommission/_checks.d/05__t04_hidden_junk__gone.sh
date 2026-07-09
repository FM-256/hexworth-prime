#!/bin/sh
. /opt/mission/env.rm-decommission 2>/dev/null
test ! -e /home/student/$MISSION_DEPT/decommission/.cache_junk
