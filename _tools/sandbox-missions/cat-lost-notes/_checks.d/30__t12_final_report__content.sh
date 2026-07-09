#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/FINAL_REPORT.txt | cut -d' ' -f1)" = "$MISSION_SHA_FINAL"
