#!/bin/sh
# Mission seed: cat-lost-notes ("Mission 01: Lost Notes")
# Runs once at launch, as root, inside the linux-sandbox container. Idempotent.
# Builds the Hexworth Dynamics department world, plants the fragments and the
# messy file, and records randomization values + expected artifact checksums in
# /opt/mission/env (sourced by every grader check so seeds and checks agree).
set -u

MISSION_DIR=/opt/mission
REF_DIR="$MISSION_DIR/.ref"          # root-only reference artifacts (0700)
mkdir -p "$REF_DIR"
chmod 0700 "$REF_DIR"

# ── 1. Randomization (deterministic per container via hostname hash) ────────
# hostname is unique per container; derive a stable index so re-running the
# seed (idempotency) picks the SAME values.
H=$(hostname | cksum | cut -d' ' -f1)
pick() { # pick <idx-mod> <items...>
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research;              pick 3 "$@")
PROJ=$(set -- alpha delta kestrel waypoint;            pick 4 "$@")
CODEWORD=$(set -- BLUE-HERON IRON-GATE NIGHT-CANYON SILVER-FOX; pick 4 "$@")

DEPT_DIR="/home/student/$DEPT"
FRAG_DIR="$DEPT_DIR/fragments"
mkdir -p "$FRAG_DIR"

# ── 2. World content ─────────────────────────────────────────────────────────
cat > "$DEPT_DIR/BRIEFING.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT
Welcome aboard. Project "$PROJ" lost its report in last night's backup failure.
Your recovery code word is: $CODEWORD
Acknowledge receipt, recreate the analyst notes, and rebuild the report from
the fragments/ directory. The import system chokes on invisible characters;
messy.txt is a sample of the problem. Good luck.
EOF

# Report fragments (part2 carries the code word line for t11)
cat > "$FRAG_DIR/part1.txt" <<EOF
QUARTERLY RECOVERY REPORT - PROJECT $PROJ
Section 1: Overview
The $DEPT department initiated recovery procedures.

Systems affected: archive, mirror, import.
EOF
cat > "$FRAG_DIR/part2.txt" <<EOF
Section 2: Findings
Recovery authorization code word: $CODEWORD
Backup rotation skipped three cycles before failure.

Root cause: retention script pruned active volumes.
EOF
cat > "$FRAG_DIR/part3.txt" <<EOF
Section 3: Actions
Restore from fragments and re-audit all checksums.
Sign-off pending director review.
EOF

# messy.txt: hides a tab, trailing spaces, and a blank line (for -A / -E tasks)
printf 'inventory\tcount mismatch  \nclean line\n\ntrailing again \t\nlast line\n' > "$DEPT_DIR/messy.txt"

# Director's header/footer for the final assembly
cat > "$DEPT_DIR/HEADER.txt" <<EOF
== HEXWORTH DYNAMICS OFFICIAL - $DEPT / $PROJ ==
EOF
cat > "$DEPT_DIR/FOOTER.txt" <<EOF
== END OF REPORT - archived by recovery desk ==
EOF

chown -R student:student "$DEPT_DIR"

# ── 3. Reference artifacts + expected checksums (root-only) ─────────────────
cat "$FRAG_DIR/part1.txt" "$FRAG_DIR/part2.txt" "$FRAG_DIR/part3.txt" > "$REF_DIR/combined"
cat -n "$REF_DIR/combined"  > "$REF_DIR/numbered"
cat -b "$REF_DIR/combined"  > "$REF_DIR/nonblank"
cat -A "$DEPT_DIR/messy.txt" > "$REF_DIR/visible"
cat -E "$DEPT_DIR/messy.txt" > "$REF_DIR/ends"
grep "$CODEWORD" "$REF_DIR/combined" > "$REF_DIR/found"
cat "$DEPT_DIR/HEADER.txt" "$REF_DIR/combined" "$DEPT_DIR/FOOTER.txt" > "$REF_DIR/final"
tac "$REF_DIR/combined" > "$REF_DIR/reversed"

sha() { sha256sum "$1" | cut -d' ' -f1; }

# ── 4. Mission env (sourced by grader checks; see SCHEMA.md on secrecy scope:
#      the box is passwordless-sudo practice, in-box values are not exam secrets;
#      badge integrity lives in the server-side award path) ──────────────────
cat > "$MISSION_DIR/env" <<EOF
MISSION_ID=cat-lost-notes
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_CODEWORD=$CODEWORD
MISSION_SHA_COMBINED=$(sha "$REF_DIR/combined")
MISSION_SHA_NUMBERED=$(sha "$REF_DIR/numbered")
MISSION_SHA_NONBLANK=$(sha "$REF_DIR/nonblank")
MISSION_SHA_VISIBLE=$(sha "$REF_DIR/visible")
MISSION_SHA_ENDS=$(sha "$REF_DIR/ends")
MISSION_SHA_FOUND=$(sha "$REF_DIR/found")
MISSION_SHA_FINAL=$(sha "$REF_DIR/final")
MISSION_SHA_REVERSED=$(sha "$REF_DIR/reversed")
EOF
chmod 0644 "$MISSION_DIR/env"

exit 0
