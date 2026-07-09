#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test -f /home/student/$MISSION_DEPT/census/contract_words.txt && grep -qxE " *$MISSION_CONTRACT_WORDS" /home/student/$MISSION_DEPT/census/contract_words.txt
