#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
grep -q "4 packets transmitted" /home/student/$MISSION_DEPT/linecheck/pulse.txt
