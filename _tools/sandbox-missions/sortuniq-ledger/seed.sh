#!/bin/sh
# Mission seed: sortuniq-ledger ("Mission 09: The Ledger Audit")
# Deterministic shuffled ledgers with duplicates (vendors), text-vs-numeric trap
# amounts, double-billed lines, and a vendor,amount CSV. Non-destructive rebuild.
set -eu

MISSION_DIR=/opt/mission
mkdir -p "$MISSION_DIR"

H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research;   pick 3 "$@")
PROJ=$(set -- alpha delta kestrel waypoint; pick 4 "$@")

DEPT_DIR="/home/student/$DEPT"
LG="$DEPT_DIR/ledger"
REF_DIR="$MISSION_DIR/.ref"
mkdir -p "$LG" "$REF_DIR"
chmod 0700 "$REF_DIR"

cat > "$DEPT_DIR/BRIEFING9.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 9
Quarter close for "$PROJ". The ledgers in ledger/ arrived shuffled and
duplicate-ridden. The auditor reads ordered data only. Produce every report the
work orders name; the SOURCE files are originals - never modify them.
Classic trap reminder: uniq only sees duplicates that are NEIGHBORS.
  - The Director
EOF

# Shuffled vendor list with duplicates (fixed shuffle, deterministic)
cat > "$LG/vendors.txt" <<EOF
Norwood Freight
Apex Crating
Norwood Freight
Zenith Paper
Marlow Catering
Apex Crating
Ironline Tools
Zenith Paper
Norwood Freight
Beacon Couriers
EOF

# Amounts with the text-vs-numeric trap (900 vs 1000 vs 85)
cat > "$LG/amounts.txt" <<EOF
900
85
1000
12500
7
340
9000
120
EOF

# Billing lines; two of them double-billed
cat > "$LG/billing.txt" <<EOF
INV-2201 Apex Crating 340.00
INV-2205 Zenith Paper 120.00
INV-2203 Marlow Catering 900.00
INV-2201 Apex Crating 340.00
INV-2207 Beacon Couriers 85.00
INV-2205 Zenith Paper 120.00
INV-2209 Ironline Tools 1000.00
EOF

# vendor,amount CSV for field sorting
cat > "$LG/expenses.csv" <<EOF
Zenith Paper,120
Apex Crating,340
Beacon Couriers,85
Ironline Tools,1000
Marlow Catering,900
Norwood Freight,12500
EOF

chown -R student:student "$DEPT_DIR"

# References computed exactly as the briefs instruct
cd "$LG"
sort vendors.txt                       > "$REF_DIR/vsorted"
sort -u vendors.txt                    > "$REF_DIR/vunique"
sort -n amounts.txt                    > "$REF_DIR/asorted"
sort -rn amounts.txt | head -n 3       > "$REF_DIR/top3"
sort billing.txt | uniq -c             > "$REF_DIR/bcounts"
sort billing.txt | uniq -d             > "$REF_DIR/doubles"
sort -t, -k2 -n expenses.csv           > "$REF_DIR/byamount"
VENDOR_COUNT=$(sort -u vendors.txt | wc -l)

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.sortuniq-ledger" <<EOF
MISSION_ID=sortuniq-ledger
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_SHA_VENDORS=$(sha vendors.txt)
MISSION_SHA_BILLING=$(sha billing.txt)
MISSION_SHA_VSORTED=$(sha "$REF_DIR/vsorted")
MISSION_SHA_VUNIQUE=$(sha "$REF_DIR/vunique")
MISSION_SHA_ASORTED=$(sha "$REF_DIR/asorted")
MISSION_SHA_TOP3=$(sha "$REF_DIR/top3")
MISSION_SHA_BCOUNTS=$(sha "$REF_DIR/bcounts")
MISSION_SHA_DOUBLES=$(sha "$REF_DIR/doubles")
MISSION_SHA_BYAMOUNT=$(sha "$REF_DIR/byamount")
MISSION_VENDOR_COUNT=$VENDOR_COUNT
EOF
chmod 0644 "$MISSION_DIR/env.sortuniq-ledger"

rm -rf "$REF_DIR"

exit 0
