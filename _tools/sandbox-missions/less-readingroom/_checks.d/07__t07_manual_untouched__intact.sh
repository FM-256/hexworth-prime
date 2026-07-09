#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/readingroom/manual.txt | cut -d' ' -f1)" = "$MISSION_SHA_MANUAL"
