#!/bin/sh
# Canonical student solution for wc-census, run AS student.
# Pure wc workflow: -l, -w, -c, -L, pipe census, multi-file totals.
. /opt/mission/env.wc-census
cd "/home/student/$MISSION_DEPT/census" || exit 1
cat ../BRIEFING10.txt >/dev/null
wc -l < minutes.txt > minutes_lines.txt
wc -w < contract.txt > contract_words.txt
wc -c < export.bin > export_bytes.txt
wc -L < banner.txt > banner_width.txt
grep ERROR build.log | wc -l > errorcount.txt
wc report_q1.txt report_q2.txt report_q3.txt > quarter_totals.txt
wc -c < blank.txt > blank_proof.txt
echo "solution applied"
