#!/bin/sh
. /opt/mission/env.systemctl-servicedesk 2>/dev/null
grep -q "hexweb restart" /home/student/$MISSION_DEPT/servicedesk/bounce.txt
