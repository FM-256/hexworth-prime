#!/bin/sh
# Canonical student solution for ps-runaway, run AS student.
# pgrep/ps lookups, default TERM, -9 escalation, -USR1 message, -fc headcount.
. /opt/mission/env.ps-runaway
cd "/home/student/$MISSION_DEPT/ops" || exit 1
cat ../BRIEFING16.txt >/dev/null
pgrep -f hexlab_report_daemon | head -1 > daemon_pid.txt      # t01
ps -o comm= -p "$(cat daemon_pid.txt)" > daemon_name.txt      # t02
pkill -f hexlab_runaway_miner                                  # t03 polite TERM
pkill -f hexlab_gridmon_stuck || true                          # t04: TERM bounces off (trapped)...
sleep 1
pkill -9 -f hexlab_gridmon_stuck                               #      ...KILL does not
kill -USR1 "$(pgrep -f hexlab_logger_svc | head -1)"           # t05 reload message
sleep 3   # trap fires between loop iterations
pgrep -fc hexlab_worker_ > workercount.txt                     # t07 bonus headcount
echo "solution applied"
