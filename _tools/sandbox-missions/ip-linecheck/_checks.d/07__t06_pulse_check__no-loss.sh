#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
grep -q " 0% packet loss" /home/student/$MISSION_DEPT/linecheck/pulse.txt
