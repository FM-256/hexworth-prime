#!/bin/sh
. /opt/mission/env.chown-handover 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/handover/analysis.txt | cut -d' ' -f1)" = "$MISSION_SHA_ANALYSIS"
