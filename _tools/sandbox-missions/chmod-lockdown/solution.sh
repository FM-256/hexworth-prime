#!/bin/sh
# Canonical student solution for chmod-lockdown, run AS student.
# Numeric + symbolic chmod, recursive file fix via find, sticky bit.
. /opt/mission/env.chmod-lockdown
cd "/home/student/$MISSION_DEPT/lockdown" || exit 1
cat ../BRIEFING13.txt >/dev/null
chmod 600 payroll.csv                       # t01
chmod u+x deploy.sh                         # t02 symbolic
chmod 640 team_report.txt                   # t03
chmod go-w dropbox.txt                      # t04 symbolic strip
chmod 700 records                           # t05 directory
find handouts -type f -exec chmod 644 {} +  # t06 recursive files-only
chmod 444 final_report.txt                  # t07 sealed
chmod 1777 exchange                         # t09 sticky bonus
echo "solution applied"
