#!/usr/bin/env bash
# @catalog what   Isolate Engine 1's Windows CTF boxes from each other and from the internet
# @catalog run    sudo bash _tools/engine1/provision/netguard.sh    (on bc2)
# @catalog status TOOL
#
# THE PROBLEM. Every team box sits on libvirt's default NAT bridge with no guest-to-guest filtering,
# so a student who escalates on their own box, which IS the challenge, can reach all five other teams'
# boxes. Credentials and flags are now unique per box, so they can neither log in nor score with a
# stolen flag, but they can still attack. The boxes also had unrestricted outbound internet, on
# machines students are deliberately handed SYSTEM on.
#
# ── WHY THIS SCRIPT NEEDED TWO MECHANISMS, discovered by measuring rather than by reading ──────────
# The first version used iptables FORWARD for both halves, and on bc2 the guest-to-guest half was a
# SILENT NO-OP: it installed cleanly, printed "guard applied to 10 Engine 1 MAC(s)", and changed
# nothing, because `br_netfilter` is not loaded on this host and /proc/sys/net/bridge/
# bridge-nf-call-iptables does not exist. Two guests on one bridge talk at layer 2; without
# br_netfilter those frames never enter iptables at all.
#
# Proven from inside a box, before and after: `internet -> 1.1.1.1:443` flipped True to False, while
# `peer -> 192.168.122.18:22` stayed True. Half the guard worked and half was theatre, and the output
# said it was applied.
#
# So: iptables for guest->elsewhere (routed, really does traverse FORWARD), and EBTABLES for
# guest->guest (layer 2, which is where those frames actually are). ebtables rather than loading
# br_netfilter because that sysctl is host-wide and would change packet processing for every bridge on
# this machine, including the docker bridges serving the live tournament's terminals and the OpenStack
# sandbox. A targeted layer-2 rule has a blast radius of exactly the MACs named in it.
#
# WHAT IT DOES, for Engine 1 MACs only:
#   guest -> guest                    DROP (ebtables, src AND dst both in the Engine 1 MAC set)
#   guest -> anything but the bridge  DROP (iptables)
# Host -> guest is untouched in both: that is local delivery, not FORWARD, so the browser terminals
# and all provisioning over SSH keep working.
#
# SCOPED TO MACS, NOT THE BRIDGE, ON PURPOSE. This bridge also carries the OpenStack sandbox work
# (bc2-horizon points at 192.168.122.62). A bridge-wide rule would silently break that project the
# next time its VM starts.
#
# NOT PERSISTENT ACROSS A REBOOT OR A LIBVIRT RESTART. libvirt rewrites its own chains, so this must
# be re-run, or wired into a systemd unit ordered after libvirtd. Re-running is safe: both chains are
# flushed and rebuilt.
#
# --ensure MODE exists so this can be re-asserted often without opening a hole. A plain run FLUSHES
# both chains and rebuilds them, and between the flush and the last -A there is a window, however
# small, where traffic passes. Re-asserting every few minutes would manufacture hundreds of those
# windows a day. --ensure therefore checks first and rebuilds ONLY when something is actually wrong,
# so the steady state costs nothing and opens nothing.
set -euo pipefail
CHAIN=ENGINE1GUARD
ENSURE=false
[ "${1:-}" = "--ensure" ] && ENSURE=true

MACS=$(virsh list --all --name | grep "^engine1" | while read -r d; do
  [ -n "$d" ] && virsh dumpxml "$d" 2>/dev/null | grep -oE "mac address='[0-9a-f:]+'" | head -1 | cut -d"'" -f2
done | sort -u)
[ -n "$MACS" ] || { echo "no Engine 1 domains found; refusing to install empty rules"; exit 1; }
NMAC=$(printf '%s\n' "$MACS" | wc -l)
MACLIST=$(printf '%s\n' "$MACS" | paste -sd,)

# ── 0. --ensure: is the guard ALREADY correctly installed? If so, touch nothing. ───────────────────
# Structural rather than functional: it verifies both chains exist, are REFERENCED from their FORWARD
# chain (an unreferenced chain full of perfect rules enforces nothing, which is its own trap), and
# cover the expected number of MACs. A functional check would mean SSHing into a guest, which is not
# something to do every few minutes.
if [ "$ENSURE" = true ]; then
    # Every probe is failure-tolerant on purpose. Under `set -euo pipefail` a missing chain or an
    # unsupported flag would abort the script mid-check, and an ensure-run that DIES is an ensure-run
    # that silently never repaired anything -- the same shape of failure this whole unit exists to stop.
    # `ebtables -S` is not available on this host's nf_tables build (it was the first thing tried, and
    # it took the check down without printing a word), so the listing is parsed instead.
    ok=true
    iptables -C FORWARD -j $CHAIN 2>/dev/null || ok=false
    IPTMAC=$(iptables -S $CHAIN 2>/dev/null | grep -c -- '--mac-source' || true)
    [ "${IPTMAC:-0}" = "$((NMAC * 2))" ] || ok=false
    ebtables -L FORWARD 2>/dev/null | grep -q -- "-j $CHAIN" || ok=false
    EBMACS=$(ebtables -L $CHAIN 2>/dev/null | grep -oP '(?<=--among-src )[^ ]+' | head -1 | tr ',' '\n' | grep -c . || true)
    [ "${EBMACS:-0}" = "$NMAC" ] || ok=false
    if [ "$ok" = true ]; then
        echo "netguard already enforced for $NMAC MAC(s); nothing changed"
        exit 0
    fi
    echo "netguard DRIFTED or absent, rebuilding for $NMAC MAC(s)"
fi

# ── 1. guest -> elsewhere, via iptables. This half genuinely works: that traffic is routed. ─────────
iptables -N $CHAIN 2>/dev/null || iptables -F $CHAIN
iptables -C FORWARD -j $CHAIN 2>/dev/null || iptables -I FORWARD 1 -j $CHAIN
for m in $MACS; do
  # Kept for defence in depth if br_netfilter is ever loaded. INERT on a host without it, which is
  # why it is no longer the only thing standing between two teams.
  iptables -A $CHAIN -m mac --mac-source "$m" -o virbr0 -j DROP
  iptables -A $CHAIN -m mac --mac-source "$m" ! -o virbr0 -j DROP
done

# ── 2. guest -> guest, via ebtables. This is the half that actually isolates teams. ────────────────
command -v ebtables >/dev/null || {
  echo "FATAL: ebtables is missing, so guest-to-guest CANNOT be enforced on this host."
  echo "The iptables rules above do NOT isolate teams from each other when br_netfilter is absent."
  echo "Install ebtables, or load br_netfilter and set bridge-nf-call-iptables=1, then re-run."
  exit 1
}
ebtables -N $CHAIN 2>/dev/null || ebtables -F $CHAIN
ebtables -L FORWARD 2>/dev/null | grep -q -- "-j $CHAIN" || ebtables -I FORWARD 1 -j $CHAIN
# One rule, not N-squared: `among` matches a whole MAC set on each side.
ebtables -A $CHAIN --among-src "$MACLIST" --among-dst "$MACLIST" -j DROP

# ── 3. Say which mechanism is actually enforcing what, so the output cannot overstate the result. ───
BRNF=/proc/sys/net/bridge/bridge-nf-call-iptables
echo "guard applied to $NMAC Engine 1 MAC(s)"
echo "  guest -> elsewhere : iptables $CHAIN ($((NMAC * 2)) rules)"
echo "  guest -> guest     : ebtables $CHAIN (1 among-rule over $NMAC MACs)"
if [ -r "$BRNF" ] && [ "$(cat $BRNF)" = "1" ]; then
  echo "  note: br_netfilter IS active, so the iptables guest-to-guest rules also apply"
else
  echo "  note: br_netfilter is NOT active on this host, so the iptables guest-to-guest rules are"
  echo "        INERT and ebtables is the only thing isolating teams. Do not remove it."
fi
ebtables -L $CHAIN --Lc 2>/dev/null | head -4

cat <<'VERIFY'

VERIFY AFTER APPLYING. Do not trust this script's own output for 3 and 4; the first version of it
printed success while isolating nothing.
  1. a terminal still works        curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:7701/
  2. provisioning still works      bash provision/inject-flag.sh engine1-team-red-cell <flagfile>
  3. teams cannot reach each other FROM INSIDE A BOX: a peer's port 22 must be unreachable
  4. no internet FROM INSIDE A BOX: 1.1.1.1:443 must be unreachable
If 1 or 2 break, the rules caught host-to-guest traffic that they should not have. Flush with
`iptables -F ENGINE1GUARD; ebtables -F ENGINE1GUARD` and re-examine before retrying.
VERIFY
