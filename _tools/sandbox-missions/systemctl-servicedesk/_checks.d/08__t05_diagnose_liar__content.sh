#!/bin/sh
. /opt/mission/env.systemctl-servicedesk 2>/dev/null
grep -qx "inactive" /home/student/$MISSION_DEPT/servicedesk/diagnosis.txt
