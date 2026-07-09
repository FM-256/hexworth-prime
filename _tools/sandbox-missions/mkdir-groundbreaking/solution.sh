#!/bin/sh
# Canonical student solution for mkdir-groundbreaking, run AS student.
# Pure mkdir/rmdir workflow: -p, siblings, -m mode-at-creation, rmdir,
# empty-then-demolish, rmdir -p chain, -v verbose permit.
. /opt/mission/env.mkdir-groundbreaking
cd "/home/student/$MISSION_DEPT" || exit 1
cat BRIEFING6.txt >/dev/null
mkdir expansion                                             # t01
mkdir -p "expansion/wing_$MISSION_PROJ/floor1/suite_a"      # t02
mkdir "expansion/wing_$MISSION_PROJ/floor1/suite_b" "expansion/wing_$MISSION_PROJ/floor1/suite_c"  # t03
mkdir -m 700 expansion/vault                                # t04
rmdir scaffolding_empty                                     # t05
mv scaffolding_occupied/blueprint.txt expansion/            # t06 empty first
rmdir scaffolding_occupied                                  #     then demolish
rmdir -p temp/deep/deeper/deepest                           # t07 chain
mkdir -v "expansion/inspection_$MISSION_PROJ" > expansion/permit.txt  # t09 bonus
echo "solution applied"
