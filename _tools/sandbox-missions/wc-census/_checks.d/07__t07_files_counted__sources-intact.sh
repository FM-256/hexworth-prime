#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/census/minutes.txt | cut -d' ' -f1)" = "$MISSION_SHA_MINUTES"
