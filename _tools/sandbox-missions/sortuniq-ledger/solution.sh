#!/bin/sh
# Canonical student solution for sortuniq-ledger, run AS student.
# Pure sort/uniq workflow incl. the sort-before-uniq discipline.
. /opt/mission/env.sortuniq-ledger
cd "/home/student/$MISSION_DEPT/ledger" || exit 1
cat ../BRIEFING9.txt >/dev/null
sort vendors.txt > vendors_sorted.txt
sort vendors.txt | uniq > vendors_unique.txt
sort -n amounts.txt > amounts_sorted.txt
sort -rn amounts.txt | head -n 3 > top3.txt
sort billing.txt | uniq -c > billing_counts.txt
sort billing.txt | uniq -d > double_billed.txt
sort -t, -k2 -n expenses.csv > expenses_by_amount.txt
sort vendors.txt | uniq | wc -l > vendorcount.txt
echo "solution applied"
