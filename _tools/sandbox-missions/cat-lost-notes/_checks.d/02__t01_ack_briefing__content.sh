#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
grep -qx "$MISSION_CODEWORD" /home/student/$MISSION_DEPT/ack.txt
