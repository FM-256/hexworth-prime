#!/usr/bin/env bash
# reset-team-box.sh — give a team a CLEAN box for the next event, without destroying the old one.
#
# @catalog what    Pre-event reset: new versioned clone off the golden, old instance retained
# @catalog run     sudo bash _tools/engine1/provision/reset-team-box.sh <team-slug> [--dry]
# @catalog status  TOOL
#
# WHY THIS EXISTS. A team clone that has been played is DIRTY: the flag has been found, the
# vulnerability may have been patched by the team that exploited it, ACLs may have changed, and
# services may be broken. Handing that machine to the next event means the next team either finds
# someone else's work already done or meets a box that cannot be solved at all. Nothing in the
# platform notices, because a dirty box boots and answers exactly like a clean one. That is the
# same shape as the discovery-gap defect: the host side looks fine.
#
# NON-DESTRUCTIVE BY CONSTRUCTION, which is not a nicety here. This does NOT undefine a domain or
# delete an overlay. It creates the NEXT version (`engine1-team-<slug>-v2`, `-v3`, ...) off the
# read-only golden and leaves the previous instance defined and shut off, with its overlay on disk.
# That is already the established pattern: blue-shield, blue-shield-v2 and blue-shield-v3 all exist
# for exactly this reason. It matters beyond policy: a dirty overlay is the only evidence of how a
# team solved the box, and of whether they sabotaged it. Deleting it destroys the post-event record.
#
# COST. An overlay starts at a few hundred KB and grows as the box runs; the measured six were about
# 2.7 GB each after a session. bc2 has terabytes free, so retention is affordable. Disk, not RAM, is
# the cheap resource here.
#
# THE REAL CEILING IS RAM, AND THIS SCRIPT DOES NOT LIFT IT. Each instance is 4 GiB and bc2 has 31
# GiB total, so seven running instances (six teams plus the shared box) is about 28 GiB and there is
# no room for an eighth. Resetting a team means the OLD instance must be shut off, which this does,
# or the host will be oversubscribed. If a tournament ever needs more than six teams, the fix is
# on-demand start and stop, not more resets.
#
# WHAT THIS DOES NOT DO, deliberately:
#   - it does NOT rotate the flag. A reused box carries the SAME flag text between events unless a
#     fresh one is minted, which is the harvest-and-reuse path proven in the emulator (taskboard
#     407). Mint and inject after this runs: mint-flag.sh then inject-flag.sh.
#   - it does NOT touch Cloudflare, the tunnel, the wetty container or the token. Those are keyed to
#     the TEAM, not the instance, so re-pointing the terminal at the new domain is a separate step
#     (token-terminals.sh) and is the one thing that can leave a team looking at a dead box.
#   - it does NOT update the Firestore box pool. The pool stores a token URL, which does not change.
set -euo pipefail

TEAM="${1:?usage: reset-team-box.sh <team-slug> [--dry]   e.g. reset-team-box.sh red-cell}"
DRY=false
[ "${2:-}" = "--dry" ] && DRY=true

BASE=/srv/hexworth/engine1
# ${BASH_SOURCE[0]} is UNBOUND when this is piped (`bash -s`) rather than run as a file, and with
# `set -u` that left HERE empty: the dry run printed commands with no directory, and the real path
# would have tried to exec /clone-team.sh. Caught by actually piping it. Fall back to $0, then to
# the known install path, so it works however it is invoked.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-${0:-/srv/hexworth/engine1/provision/reset-team-box.sh}}")" 2>/dev/null && pwd)"
[ -f "$HERE/clone-team.sh" ] || HERE=/srv/hexworth/engine1/provision
[ -f "$HERE/clone-team.sh" ] || { echo "FATAL: cannot locate clone-team.sh next to this script (looked in '$HERE'). Run it as a file: sudo bash <path>/reset-team-box.sh <team>" >&2; exit 1; }
GOLD="$BASE/images/engine1-v2.qcow2"

[ -f "$GOLD" ] || { echo "FATAL: golden image missing at $GOLD" >&2; exit 1; }

# Find the highest existing version for this team, so the new one cannot collide with a retained
# instance. clone-team.sh is create-only and refuses a name that exists, which is the backstop.
CURRENT=$(sudo virsh list --all --name 2>/dev/null | grep -E "^engine1-team-${TEAM}(-v[0-9]+)?$" || true)
if [ -z "$CURRENT" ]; then
    echo "No existing instance for team '$TEAM'. Use clone-team.sh to create the first one." >&2
    exit 1
fi
MAXV=1
for d in $CURRENT; do
    v=$(echo "$d" | sed -nE 's/.*-v([0-9]+)$/\1/p')
    [ -n "$v" ] && [ "$v" -gt "$MAXV" ] && MAXV=$v
done
NEXTV=$((MAXV + 1))
NEWSLUG="${TEAM}-v${NEXTV}"
NEWDOM="engine1-team-${NEWSLUG}"

echo "Team           : $TEAM"
echo "Existing       : $(echo "$CURRENT" | tr '\n' ' ')"
echo "New instance   : $NEWDOM  (off the read-only golden)"
echo "Old instances  : RETAINED, shut off. Nothing is deleted."

if [ "$DRY" = true ]; then
    echo
    echo "DRY RUN. Would then run, in order:"
    echo "  clone-team.sh $NEWSLUG start"
    echo "  mint-flag.sh  (fresh flag, so the previous event's value does not score again)"
    echo "  prepare-clone.sh $NEWDOM <the minted flag file>"
    echo "  token-terminals.sh   (re-point this team's terminal at $NEWDOM)"
    echo
    echo "Then verify BEFORE the event: player SSH answers, the flag file reads non-zero, and the"
    echo "team's token URL reaches the NEW domain and not the retained one."
    exit 0
fi

# Shut down the current instances so the host is not oversubscribed. Shut off, NOT undefined.
for d in $CURRENT; do
    if sudo virsh domstate "$d" 2>/dev/null | grep -q running; then
        echo "shutting down $d (retained, not deleted)"
        sudo virsh shutdown "$d" >/dev/null 2>&1 || true
    fi
done

echo "creating $NEWDOM ..."
sudo bash "$HERE/clone-team.sh" "$NEWSLUG" start

cat <<NEXT

$NEWDOM is created and starting.

IT IS NOT PLAYABLE YET, and that is not a warning to skip: the golden was frozen BEFORE the player
account and the flag existed, so a fresh clone has neither. Finish with:

  1. sudo bash $HERE/mint-flag.sh                 # a FRESH flag. Reusing the old one is taskboard 407.
  2. sudo bash $HERE/prepare-clone.sh $NEWDOM <flagfile>
  3. sudo bash $HERE/token-terminals.sh           # re-point this team's terminal at the new domain

Then verify against the MACHINE, not the host: player SSH answers, the flag file reads non-zero,
and the team's token URL lands on $NEWDOM rather than the retained instance. A terminal still
pointing at the old box is the failure this sequence can leave behind.
NEXT
