#!/bin/sh
# Canonical student solution for cat-lost-notes, run AS student inside the container.
# Uses cat (and its cousins) exactly as the mission intends. Values sourced from the
# mission env purely for test convenience (a student reads them from BRIEFING.txt).
. /opt/mission/env
cd "/home/student/$MISSION_DEPT" || exit 1
cat BRIEFING.txt >/dev/null                                    # t01 read
echo "$MISSION_CODEWORD" | cat > ack.txt                       # t01 create via cat+stdin
cat > notes.txt <<EOF
Project: $MISSION_PROJ
Status: recovery in progress
Analyst: student
EOF
cat >> notes.txt <<EOF
Fragments: located
Merge: pending
EOF
cat fragments/part1.txt fragments/part2.txt fragments/part3.txt > report_combined.txt
cat -n report_combined.txt > numbered.txt
cat -b report_combined.txt > nonblank.txt
cat -A messy.txt > visible.txt
cat -E messy.txt > ends.txt
echo "Recovered by hand for project $MISSION_PROJ" | cat > dictation.txt
echo "MEMO: $MISSION_DEPT recovery" | cat - notes.txt > memo.txt
cat fragments/part1.txt fragments/part2.txt fragments/part3.txt | grep "$MISSION_CODEWORD" > found.txt
cat HEADER.txt report_combined.txt FOOTER.txt > FINAL_REPORT.txt
tac report_combined.txt > reversed.txt
echo "solution applied"
