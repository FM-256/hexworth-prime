#!/bin/sh
# Canonical student solution for ip-linecheck, run AS student.
# ip addr/route/link, ss -tln, ping -c, and the composite audit signature.
. /opt/mission/env.ip-linecheck
cd "/home/student/$MISSION_DEPT/linecheck" || exit 1
cat ../BRIEFING18.txt >/dev/null
ip -o -4 addr show eth0 | awk '{print $4}' | cut -d/ -f1 > myip.txt     # t01
ip -o -4 addr show eth0 | awk '{print $4}' | cut -d/ -f2 > prefix.txt   # t02
ip route | awk '/^default/{print $3}' > gateway.txt                      # t03
ip -o link show lo | grep -oE 'state [A-Z]+' | awk '{print $2}' > lostate.txt  # t04
ss -tln | grep ':7681' > listener.txt                                    # t05
ping -c 4 127.0.0.1 > pulse.txt                                          # t06
printf '%s\n%s\n%s\n' "$(cat myip.txt)" "$(cat gateway.txt)" "pulse confirmed" > AUDIT.txt  # t08
echo "solution applied"
