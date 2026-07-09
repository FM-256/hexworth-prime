#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test -f /home/student/$MISSION_DEPT/census/blank_proof.txt && grep -qxE " *0" /home/student/$MISSION_DEPT/census/blank_proof.txt
