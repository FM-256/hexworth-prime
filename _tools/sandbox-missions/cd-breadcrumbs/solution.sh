#!/bin/sh
# Canonical student solution for cd-breadcrumbs, run AS student in-container.
# Pure cd/pwd navigation exactly as the briefs teach (cd -, pwd -P included).
. /opt/mission/env.cd-breadcrumbs
cd "/home/student/$MISSION_DEPT" || exit 1
cat BRIEFING3.txt >/dev/null
cd "campus/$MISSION_WING-wing/floor2/suite_b/server_room"
pwd > here.txt                                   # t01
cd ../..
pwd > floor.txt                                  # t02 (one relative dot-dot move)
cd ~
pwd > athome.txt                                 # t03
cd /opt/campus/annex
pwd > annex.txt                                  # t04
# t05: bounce with cd - between the two survey sites, capture both pwds in order
cd "/home/student/$MISSION_DEPT/campus/$MISSION_WING-wing/floor2/suite_b/server_room"
A=$(pwd)
cd /opt/campus/annex
B=$(pwd)
cd -  >/dev/null                                 # flip back with the one-character shortcut
printf '%s\n%s\n' "$A" "$B" > "/home/student/$MISSION_DEPT/toggle.txt"
# t06: enter via the symlink; logical pwd vs physical pwd -P
cd "/home/student/$MISSION_DEPT/campus/shortcut"
L=$(pwd)
P=$(pwd -P)
printf '%s\n%s\n' "$L" "$P" > "/home/student/$MISSION_DEPT/truth.txt"
# t08 bonus: components between / and the server room
echo "$P" | awk -F/ '{print NF-1}' > "/home/student/$MISSION_DEPT/depth.txt"
echo "solution applied"
