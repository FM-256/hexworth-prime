#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(tail -n +2 /home/student/$MISSION_DEPT/memo.txt | sha256sum | cut -d' ' -f1)" = "$(sha256sum /home/student/$MISSION_DEPT/notes.txt | cut -d' ' -f1)"
