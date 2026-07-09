#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
grep -q ":7681" /home/student/$MISSION_DEPT/linecheck/listener.txt
