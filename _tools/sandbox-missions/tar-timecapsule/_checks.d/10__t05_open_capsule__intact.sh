#!/bin/sh
. /opt/mission/env.tar-timecapsule 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/capsule/opened/vault_2021/deposits.txt | cut -d' ' -f1)" = "$MISSION_SHA_DEPOSITS"
