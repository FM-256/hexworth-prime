#!/usr/bin/env bash
# @catalog what   Exercises perteam-flags.sh refusal paths against stubbed mint/inject in a fixture
#                 tree: duplicate flags, a failed box, and the happy path's JSON shape
# @catalog run    bash _tools/engine1/perteam-flags.test.sh
# @catalog status TOOL
#
# WHY. perteam-flags.sh cannot run off bc2 (it needs virsh and the boxes), so its REFUSALS would
# otherwise ship unexercised -- and the duplicate-flag refusal is the entire reason the script exists.
# A check that has never been shown to fire is not evidence of anything. mint and inject are stubbed
# so the orchestration, the distinctness proof and the emitted JSON are what is under test; the real
# ssh/PowerShell paths belong to mint-flag.sh and inject-flag.sh and are verified on the machines.
set -uo pipefail
SUT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/provision/perteam-flags.sh"
pass=0; fail=0
chk() { if [ "$2" = "1" ]; then echo "  PASS  $1${3:+ :: $3}"; pass=$((pass+1)); else echo "  FAIL  $1${3:+ :: $3}"; fail=$((fail+1)); fi; }

# A fixture tree per case: the harness carried state once before and made a later case pass on an
# earlier case's files.
mkfixture() {
    ROOT=$(mktemp -d); export ENGINE1_BASE="$ROOT"
    mkdir -p "$ROOT/config/flags" "$ROOT/bin"
    cat > "$ROOT/bin/mint-flag.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
D="$1"; S="$2"; B="${ENGINE1_BASE}"
# MODE=dupe makes every team mint the SAME flag, which is precisely the defect to catch.
if [ "${STUB_MODE:-ok}" = "dupe" ]; then R=deadbeefdeadbeef; else R=$(head -c 8 /dev/urandom | od -An -tx1 | tr -d ' \n'); fi
F="flag{${S}_${R}}"; SALT=$(head -c 8 /dev/urandom | od -An -tx1 | tr -d ' \n')
H="sha256:$(printf '%s' "$SALT:$F" | sha256sum | cut -d' ' -f1)"
printf 'domain=%s\nscenario=%s\nflag=%s\nsalt=%s\nhash=%s\n' "$D" "$S" "$F" "$SALT" "$H" \
  > "$B/config/flags/$D-$S-$(date -u +%Y%m%dT%H%M%S)$RANDOM.flag"
EOF
    cat > "$ROOT/bin/inject-flag.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
# MODE=boxfail makes ONE team's verification fail, to prove the run refuses partial readiness.
[ "${STUB_MODE:-ok}" = "boxfail" ] && [ "$1" = "engine1-team-b" ] && { echo "b: LEAK"; exit 1; }
echo "$1: flag present and hash-verified, and DENIED to the player account"
EOF
    # virsh stub: STUB_DOMAINS lists the "running" domains, one per line, so the domain-resolution
    # refusals can be driven without libvirt. Default: one plain domain per team.
    cat > "$ROOT/bin/virsh" <<'EOF'
#!/usr/bin/env bash
if [ "${1:-}" = "list" ]; then printf '%s\n' ${STUB_DOMAINS:-}; fi
EOF
    chmod +x "$ROOT/bin/"*.sh "$ROOT/bin/virsh"
    export VIRSH="$ROOT/bin/virsh"
    # The SUT resolves mint/inject as siblings of itself, so the fixture gets its own copy of it.
    cp "$SUT" "$ROOT/bin/perteam-flags.sh"; chmod +x "$ROOT/bin/perteam-flags.sh"
}

echo
echo "== perteam-flags.sh refusal paths =="

# 1. HAPPY PATH: distinct flags, all boxes verified, JSON emitted.
mkfixture; export STUB_DOMAINS="engine1-team-a engine1-team-b engine1-team-c"
STUB_MODE=ok "$ROOT/bin/perteam-flags.sh" a b c > "$ROOT/out.txt" 2>&1; rc=$?
json=$(sed -n '/^{$/,/^}$/p' "$ROOT/out.txt")
chk "happy path exits 0" "$([ $rc -eq 0 ] && echo 1 || echo 0)" "rc=$rc"
chk "emits one JSON object with an entry per team" \
  "$([ "$(grep -c 'flagSalt' <<<"$json")" = 3 ] && grep -q '^{' <<<"$json" && grep -q '^}' <<<"$json" && echo 1 || echo 0)" \
  "$(tr '\n' ' ' <<<"$json" | cut -c1-70)"
# json.tmp is written BEFORE the assertion, not inside its detail argument: bash evaluates $2 before
# $3, so the first version parsed a file the detail expression had not created yet and failed while
# the JSON was perfectly valid. A test that fails against a correct implementation is debris.
printf '%s' "$json" > "$ROOT/json.tmp"
chk "JSON parses and is keyed by team short name" \
  "$(python3 -c "
import json,sys
d=json.load(open('$ROOT/json.tmp'))
sys.exit(0 if sorted(d)==['a','b','c'] and all(set(v)=={'flagSalt','flagHash'} for v in d.values()) else 1)
" 2>/dev/null && echo 1 || echo 0)" \
  "$(python3 -c "
import json;d=json.load(open('$ROOT/json.tmp'));print(sorted(d), sorted(set(k for v in d.values() for k in v)))" 2>&1 | head -1)"
chk "no plaintext flag is printed" "$(grep -qE 'flag\{' "$ROOT/out.txt" && echo 0 || echo 1)" \
  "$(grep -oE 'flag\{[^}]*\}' "$ROOT/out.txt" | head -1)"
chk "says it verified distinctness" "$(grep -q 'DISTINCT: 3 teams' "$ROOT/out.txt" && echo 1 || echo 0)"

# 2. THE ONE THAT MATTERS: two teams sharing a flag must refuse, and emit NOTHING.
mkfixture; export STUB_DOMAINS="engine1-team-a engine1-team-b engine1-team-c"
STUB_MODE=dupe "$ROOT/bin/perteam-flags.sh" a b c > "$ROOT/out.txt" 2>&1; rc=$?
chk "DUPLICATE flags across teams refuses (nonzero exit)" "$([ $rc -ne 0 ] && echo 1 || echo 0)" "rc=$rc"
chk "duplicate run emits NO JSON to paste" \
  "$(grep -q 'flagSalt' "$ROOT/out.txt" && echo 0 || echo 1)" "$(grep -m1 'DUPLICATE' "$ROOT/out.txt")"

# 3. A single unverified box refuses the whole run, rather than half-registering.
mkfixture; export STUB_DOMAINS="engine1-team-a engine1-team-b engine1-team-c"
STUB_MODE=boxfail "$ROOT/bin/perteam-flags.sh" a b c > "$ROOT/out.txt" 2>&1; rc=$?
chk "one failed box refuses the whole run" "$([ $rc -ne 0 ] && echo 1 || echo 0)" "rc=$rc"
chk "failed run emits NO JSON to paste" "$(grep -q 'flagSalt' "$ROOT/out.txt" && echo 0 || echo 1)"
chk "names which team failed and why" \
  "$(grep -q 'b: verify or player-denied' "$ROOT/out.txt" && echo 1 || echo 0)" \
  "$(grep -m1 ' - ' "$ROOT/out.txt")"

# ── DOMAIN RESOLUTION (Chris's finding). reset-team-box.sh makes VERSIONED domains and keeps the old
# one defined but shut off, so "engine1-team-$t" is an assumption. The dangerous case is a stale
# sibling that is still RUNNING: minting against it verifies perfectly and produces a flag for a box
# no student's terminal points at, and nothing downstream catches it.
mkfixture; export STUB_DOMAINS="engine1-team-a engine1-team-b"
STUB_MODE=ok "$ROOT/bin/perteam-flags.sh" a b c > "$ROOT/out.txt" 2>&1; rc=$?
chk "a team with NO running domain refuses the run" "$([ $rc -ne 0 ] && echo 1 || echo 0)" "rc=$rc"
chk "names the team whose domain is absent" \
  "$(grep -q 'c: no running domain' "$ROOT/out.txt" && echo 1 || echo 0)" "$(grep -m1 'no running domain' "$ROOT/out.txt")"
chk "that run emits NO JSON" "$(grep -q 'flagSalt' "$ROOT/out.txt" && echo 0 || echo 1)"

mkfixture; export STUB_DOMAINS="engine1-team-a engine1-team-a-v2 engine1-team-b"
STUB_MODE=ok "$ROOT/bin/perteam-flags.sh" a b > "$ROOT/out.txt" 2>&1; rc=$?
chk "TWO running domains for one team is AMBIGUOUS and refuses" "$([ $rc -ne 0 ] && echo 1 || echo 0)" "rc=$rc"
chk "names both domains so the operator knows which to shut down" \
  "$(grep -q 'engine1-team-a-v2' "$ROOT/out.txt" && grep -qi 'ambiguous' "$ROOT/out.txt" && echo 1 || echo 0)" \
  "$(grep -m1 -i 'ambiguous' "$ROOT/out.txt")"
chk "ambiguous run emits NO JSON" "$(grep -q 'flagSalt' "$ROOT/out.txt" && echo 0 || echo 1)"

# The GOOD versioned case: only -v3 is running, so that is the box, and it must be USED not refused.
mkfixture; export STUB_DOMAINS="engine1-team-a-v3 engine1-team-b"
STUB_MODE=ok "$ROOT/bin/perteam-flags.sh" a b > "$ROOT/out.txt" 2>&1; rc=$?
chk "a single VERSIONED domain is used rather than refused" "$([ $rc -eq 0 ] && echo 1 || echo 0)" "rc=$rc"
chk "says which domain it used instead of the assumed name" \
  "$(grep -q 'Using engine1-team-a-v3' "$ROOT/out.txt" && echo 1 || echo 0)" "$(grep -m1 'Using engine1' "$ROOT/out.txt")"
chk "versioned run still emits JSON for both teams" \
  "$([ "$(grep -c 'flagSalt' "$ROOT/out.txt")" = 2 ] && echo 1 || echo 0)" "$(grep -c 'flagSalt' "$ROOT/out.txt") entries"

echo
echo "  $pass passed, $fail failed"
echo
[ "$fail" -eq 0 ]
