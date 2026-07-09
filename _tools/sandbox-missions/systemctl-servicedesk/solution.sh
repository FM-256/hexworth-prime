#!/bin/sh
# Canonical student solution for systemctl-servicedesk, run AS student.
# start/enable/stop/disable/is-active/is-enabled/status/restart on the shim.
. /opt/mission/env.systemctl-servicedesk
cd "/home/student/$MISSION_DEPT/servicedesk" || exit 1
cat ../BRIEFING17.txt >/dev/null
systemctl start hexweb                     # t01
systemctl enable hexweb                    # t02
systemctl start hexqueue                   # t03
systemctl enable hexqueue
systemctl stop legacyd                     # t04
systemctl disable legacyd
systemctl is-active hexreportd > diagnosis.txt || true   # t05 diagnose (inactive)
systemctl start hexreportd                 # t06 fix
systemctl enable hexreportd
systemctl restart hexweb > bounce.txt      # t08 bonus receipt
echo "solution applied"
