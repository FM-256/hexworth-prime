#!/usr/bin/env bash
#
# @catalog what    Self-test for freeze-check.sh, covering every fail-closed path (count: see run)
# @catalog run     bash _tools/deploy/freeze-check.selftest.sh
# @catalog status  TOOL
#
# Round 1 of freeze-check.sh was BLOCKED by review for printing "FROZEN ... exit 0" against a
# truncated manifest while a real change sat on disk. That defect was found by hand, which means
# nothing would have caught its return. This file exists so every fail-closed path has a test
# that fails loudly if someone later "simplifies" the validation away.
#
# The exit-code contract under test:
#   0 = compared, and identical      1 = compared, and DIFFERENT      2 = could not compare
# Case 6-9 are the ones that matter most: a degraded baseline must NEVER produce 0.
#
# Runs entirely inside a throwaway tree via FREEZE_ROOT/FREEZE_MANIFEST. Touches no repo file.

set -uo pipefail
FC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/freeze-check.sh"
SCRATCH="${TMPDIR:-/tmp}/freeze-selftest-$$"
mkdir -p "$SCRATCH/tree/sub"
export FREEZE_ROOT="$SCRATCH/tree"
export FREEZE_MANIFEST="$SCRATCH/manifest"

pass=0; fail=0
# Assert on BOTH the exit code and the output text. Exit code alone would have passed round 1's
# space-splitting bug; output alone would have passed a gate that printed correctly and exited 0.
ck() { # ck <label> <want_exit> <want_substr> <actual_exit> <actual_out>
    local label="$1" we="$2" ws="$3" ae="$4" ao="$5"
    if [ "$ae" = "$we" ] && [[ "$ao" == *"$ws"* ]]; then
        printf '  PASS  %s\n' "$label"; pass=$((pass+1))
    else
        printf '  FAIL  %s\n        want exit=%s containing %q\n        got  exit=%s: %s\n' \
               "$label" "$we" "$ws" "$ae" "$(echo "$ao" | head -3 | tr '\n' '|')"
        fail=$((fail+1))
    fi
}
run() { out=$("$@" 2>&1); rc=$?; }   # capture without a pipe: a pipe reports the LAST command's
                                     # status, which is how round 1's self-test measured sed's
                                     # exit instead of the script's and read a failure as a pass.

printf 'a\n' > "$SCRATCH/tree/one.js"
printf 'b\n' > "$SCRATCH/tree/sub/two.js"
printf 'c\n' > "$SCRATCH/tree/has space.js"

run "$FC" snapshot .            ; ck "snapshot succeeds"                    0 "frozen: 3 file(s)" "$rc" "$out"
run "$FC" verify                ; ck "1. unchanged -> FROZEN"               0 "FROZEN: 3 file(s)" "$rc" "$out"

printf 'x\n' > "$SCRATCH/tree/added.js"
run "$FC" verify                ; ck "2. added file detected"               1 "+ added.js"        "$rc" "$out"

run "$FC" snapshot .            > /dev/null
printf 'MODIFIED\n' >> "$SCRATCH/tree/one.js"
run "$FC" verify                ; ck "3. modified-only, empty added list"   1 "M one.js"          "$rc" "$out"

# Space-in-filename: round 1 used awk '{print $2}' and reported "has" instead of "has space.js",
# a path the operator cannot act on.
run "$FC" snapshot .            > /dev/null
printf 'MODIFIED\n' >> "$SCRATCH/tree/has space.js"
run "$FC" verify                ; ck "4. space in filename reported whole"  1 "M has space.js"    "$rc" "$out"

run "$FC" snapshot .            > /dev/null
rm -f "$SCRATCH/tree/added.js"
run "$FC" verify                ; ck "5. removed file detected"             1 "- added.js"        "$rc" "$out"

# ---- fail-closed cases: a degraded baseline must never read as a clean freeze ----
run "$FC" snapshot .            > /dev/null
printf 'UNDETECTED\n' >> "$SCRATCH/tree/one.js"   # a REAL change, present for every case below
: > "$FREEZE_MANIFEST"
run "$FC" verify                ; ck "6. truncated manifest -> ERROR"       2 "baseline destroyed" "$rc" "$out"

printf 'garbage not a header\n' > "$FREEZE_MANIFEST"
run "$FC" verify                ; ck "7. corrupt header -> ERROR"           2 "header missing"     "$rc" "$out"

printf '# watched: .\n' > "$FREEZE_MANIFEST"
run "$FC" verify                ; ck "8. header but zero entries -> ERROR"  2 "zero file entries"  "$rc" "$out"

printf '# watched: \n' > "$FREEZE_MANIFEST"
run "$FC" verify                ; ck "9. empty watched list -> ERROR"       2 "names no watched"   "$rc" "$out"

printf '# watched: .\ndeadbeef  one.js\n' > "$FREEZE_MANIFEST"
run "$FC" verify                ; ck "10. bad hash field -> ERROR"          2 "malformed manifest" "$rc" "$out"

# ---- watched path vanishes entirely: must be labeled, not reported as an added file ----
mkdir -p "$SCRATCH/tree/doomed"; printf 'd\n' > "$SCRATCH/tree/doomed/f.js"
run "$FC" snapshot doomed       > /dev/null
rm -rf "$SCRATCH/tree/doomed"
run "$FC" verify                ; ck "11. watched path gone -> labeled"     1 "watched path no longer exists" "$rc" "$out"

# ---- snapshot must refuse to baseline a path that is not there ----
run "$FC" snapshot nope         ; ck "12. snapshot missing path -> ERROR"   2 "cannot snapshot missing path" "$rc" "$out"

# ---- the tool must not report ITS OWN scratch files as changes ----
# Found after the fail-closed fix landed: the real manifest lives in _tools/deploy, so watching
# _tools/deploy made `verify` hash the manifest's own temp files and print
# "+ _tools/deploy/.freeze-manifest.now.1456473" / "M .freeze-manifest.tmp.1456374". A freeze
# check that can never come back clean while watching its own directory is not usable there.
export FREEZE_MANIFEST="$SCRATCH/tree/.freeze-manifest"
run "$FC" snapshot .            ; ck "13. snapshot w/ manifest inside watched tree" 0 "frozen:" "$rc" "$out"
run "$FC" verify                ; ck "14. own scratch files ignored -> FROZEN"      0 "FROZEN"  "$rc" "$out"

# ---- lock: a dead holder must be reclaimed, a live one must be respected ----
# Round 2 shipped a lock with no staleness recovery: a SIGKILL mid-snapshot bypasses the EXIT trap
# and the tool then failed forever with "another snapshot is in progress" until a human rmdir'd it.
export FREEZE_MANIFEST="$SCRATCH/manifest2"
run "$FC" snapshot .            > /dev/null
mkdir -p "$FREEZE_MANIFEST.lock"                       # crashed run: lock exists, no pid recorded
run "$FC" snapshot .            ; ck "15. stale lock (no pid) reclaimed"   0 "reclaiming stale lock" "$rc" "$out"

mkdir -p "$FREEZE_MANIFEST.lock"; echo 999999 > "$FREEZE_MANIFEST.lock/pid"   # dead pid
run "$FC" snapshot .            ; ck "16. stale lock (dead pid) reclaimed"  0 "reclaiming stale lock" "$rc" "$out"

mkdir -p "$FREEZE_MANIFEST.lock"; echo $$ > "$FREEZE_MANIFEST.lock/pid"       # OUR pid: alive
run "$FC" snapshot .            ; ck "17. live lock respected"              2 "another snapshot is in progress" "$rc" "$out"
rm -rf "$FREEZE_MANIFEST.lock"

# The lock must be released on the failure path too, not just on success -- a die() that leaks the
# lock is the same permanent wedge by another route.
run "$FC" snapshot nope         > /dev/null 2>&1
run "$FC" snapshot .            ; ck "18. lock released after a die()"      0 "frozen:"          "$rc" "$out"

printf '\n  %d passed, %d failed  (scratch: %s)\n' "$pass" "$fail" "$SCRATCH"
[ "$fail" -eq 0 ] || exit 1
