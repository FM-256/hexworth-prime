#!/bin/sh
. /opt/mission/env.chmod-lockdown 2>/dev/null
/home/student/$MISSION_DEPT/lockdown/deploy.sh >/dev/null 2>&1
