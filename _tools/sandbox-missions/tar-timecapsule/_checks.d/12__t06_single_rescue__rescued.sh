#!/bin/sh
. /opt/mission/env.tar-timecapsule 2>/dev/null
test -f /home/student/$MISSION_DEPT/capsule/rescued/vault_2021/note_to_future.txt && test "$(sha256sum /home/student/$MISSION_DEPT/capsule/rescued/vault_2021/note_to_future.txt | cut -d' ' -f1)" = "$MISSION_SHA_NOTE"
