#!/usr/bin/env bash
# Engine 1: mint a DISTINCT flag for every team, inject each into that team's own box, and emit the
# per-team salt/hash map to paste into the admin console.
#
# @catalog what   Mints one unique CSPRNG flag per Engine 1 team box, verifies each box holds its own
#                 and only its own, and emits the perTeam JSON for flagSecrets/{challengeId}
# @catalog run    sudo _tools/engine1/provision/perteam-flags.sh [short-name ...]   # on bc2
# @catalog status TOOL
#
# WHY (taskboard 407). Every team got its own Windows box and every box carried the SAME flag --
# measured by hashing C:\Hexworth\loot\proof.txt on all six clones and getting one identical digest.
# Per-team boxes with a shared flag is isolation in the infrastructure and none in the scoring, which
# is the half that decides who wins: the first team to escalate could hand the string to the rest and
# the scoreboard would measure who pasted fastest.
#
# THIS SCRIPT ORCHESTRATES, IT DOES NOT REIMPLEMENT. mint-flag.sh already mints from the CSPRNG,
# injects, and verifies by reading the value back OUT of the machine; inject-flag.sh already proves
# the `player` account is DENIED. Both are called here rather than copied, because a second copy of
# an ssh+PowerShell path is a second copy that drifts.
#
# DISTINCTNESS IS CHECKED, NOT ASSUMED. A driver that minted the same flag twice would silently
# recreate the exact defect this exists to fix, and every per-box check would still pass. So the run
# fails unless all flags and all hashes are pairwise distinct. Together with each box's own readback
# verification, that is what proves no two boxes carry the same flag -- per-box verification alone
# cannot see a collision, and a collision is the whole failure mode.
#
# The plaintext flags stay in 0600 files on bc2. This script prints salts and hashes only; a hash is
# what the platform stores and is useless without the box.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-${0:-/srv/hexworth/engine1/provision/perteam-flags.sh}}")" && pwd)"
MINT="$HERE/mint-flag.sh"
INJECT="$HERE/inject-flag.sh"
for f in "$MINT" "$INJECT"; do
    [ -x "$f" ] || { echo "FATAL: $f not found or not executable (run this from the provision dir on bc2)"; exit 1; }
done

# BASE is overridable ONLY so the refusal paths can be exercised against stubbed mint/inject
# scripts in a fixture tree. A distinctness check that has never been shown to fail is not
# evidence that duplicates are caught, and this one is the whole point of the script.
BASE="${ENGINE1_BASE:-/srv/hexworth/engine1}"
SCENARIO=engine1_foothold
TEAMS=("$@")
if [ ${#TEAMS[@]} -eq 0 ]; then
    TEAMS=(blue-shield-v3 cyan-storm gold-strike green-ops purple-haze red-cell)
fi

declare -A SALT HASH FLAGFILE
FAILED=()

for t in "${TEAMS[@]}"; do
    DOMAIN="engine1-team-$t"
    echo "=== $t ($DOMAIN) ==="

    # Mint + inject + read back out of the machine. Writes a 0600 flagfile under $BASE/config/flags.
    if ! "$MINT" "$DOMAIN" "$SCENARIO" >/dev/null; then
        echo "  MINT FAILED"; FAILED+=("$t: mint"); continue
    fi

    # Newest flagfile for this domain+scenario. Named with a UTC stamp by mint-flag.sh, so newest by
    # mtime is the one just written.
    ff=$(ls -1t "$BASE/config/flags/$DOMAIN-$SCENARIO-"*.flag 2>/dev/null | head -1 || true)
    [ -n "$ff" ] || { echo "  NO FLAGFILE"; FAILED+=("$t: no flagfile"); continue; }

    # Re-assert against the machine AND prove the starting account cannot read it. Idempotent: the
    # same flag is written again. This is the check that matters most -- a flag the `player` account
    # can cat is not a challenge, it is a text file.
    if ! "$INJECT" "$DOMAIN" "$ff"; then
        echo "  VERIFY/DENY FAILED"; FAILED+=("$t: verify or player-denied"); continue
    fi

    SALT[$t]=$(grep '^salt=' "$ff" | cut -d= -f2-)
    HASH[$t]=$(grep '^hash=' "$ff" | cut -d= -f2-)
    FLAGFILE[$t]="$ff"
    [ -n "${SALT[$t]}" ] && [ -n "${HASH[$t]}" ] || { echo "  NO SALT/HASH"; FAILED+=("$t: no salt/hash"); continue; }
done

if [ ${#FAILED[@]} -gt 0 ]; then
    echo; echo "REFUSING TO EMIT: ${#FAILED[@]} team(s) failed:"; printf '  - %s\n' "${FAILED[@]}"
    echo "Nothing is registered until every box is verified. A tournament where some teams have a"
    echo "working flag and others do not is unfair rather than partially ready."
    exit 1
fi

# Pairwise distinctness, over hashes AND plaintext. Hashes alone would miss two teams sharing a flag
# with different salts, which is the collision that matters.
dupe=0
mapfile -t hl < <(for t in "${!HASH[@]}"; do echo "${HASH[$t]}"; done)
mapfile -t fl < <(for t in "${!FLAGFILE[@]}"; do grep '^flag=' "${FLAGFILE[$t]}" | cut -d= -f2-; done)
[ "$(printf '%s\n' "${hl[@]}" | sort -u | wc -l)" -eq "${#hl[@]}" ] || { echo "DUPLICATE HASH across teams"; dupe=1; }
[ "$(printf '%s\n' "${fl[@]}" | sort -u | wc -l)" -eq "${#fl[@]}" ] || { echo "DUPLICATE FLAG across teams"; dupe=1; }
if [ "$dupe" -ne 0 ]; then
    echo "REFUSING TO EMIT: two teams share a flag, which is the defect this script exists to remove."
    exit 1
fi
echo
echo "DISTINCT: ${#hl[@]} teams, ${#hl[@]} different flags, ${#hl[@]} different hashes, each verified"
echo "on its own box and each denied to the player account."

# Paste-ready. Keyed by the team SHORT NAME, which is what the box_pool entries are labelled with;
# the console resolves short name -> teamId through each team's existing assignment and REFUSES on
# anything it cannot match, rather than guessing which team a box belongs to.
echo
echo "--- paste this into Admin Console > CTF > Per-Team Flags ---"
printf '{\n'
i=0; n=${#TEAMS[@]}
for t in "${TEAMS[@]}"; do
    i=$((i+1)); sep=,; [ "$i" -eq "$n" ] && sep=
    printf '  "%s": { "flagSalt": "%s", "flagHash": "%s" }%s\n' "$t" "${SALT[$t]}" "${HASH[$t]}" "$sep"
done
printf '}\n'
echo
echo "Plaintext flags remain 0600 under $BASE/config/flags/ on bc2 and are not printed."
