#!/usr/bin/env bash
# token-terminals.sh — (re)create the per-team browser terminals, logging the student straight in.
#
# @catalog what    Recreates each team's wetty container with --ssh-pass so students get a shell, not a prompt
# @catalog run     sudo bash _tools/engine1/provision/token-terminals.sh [--dry] [team-slug]
# @catalog status  TOOL
#
# WHY THIS EXISTS AT ALL. The containers serving the student token URLs were created by hand and the
# script was never saved: it is in neither the repo nor bc2's provision directory. So the one path
# every student walks through had no reproducible definition. Re-creating it after a host reboot, or
# after a token rotation, meant reconstructing a docker run line from memory.
#
# WHY --ssh-pass. Until 2026-09-20 these ran with password auth, so a student clicking their team
# link met `player@<ip>'s password:` and had to type a 24-character random string, blind, into a
# browser terminal. The operator hit this themselves and could not get in. Six teams times four
# students, on event day, with a string containing both `0` and `O`, is a tournament that stalls at
# the door. wetty can authenticate for them, so it does.
#
# WHAT THAT TRADES. The token in the URL becomes the only gate on the browser path. It is 32 hex
# characters, so it is not guessable, but it IS leakable: a screenshot, a shared screen, a pasted
# link. The consequence is an outsider getting a shell on a machine built to be broken into, not a
# breach of team isolation, because tokens and boxes are both per-team. The password it replaces was
# read aloud to the whole team by the instructor, so it was never a second factor in practice.
# THIS ASSUMES netguard.sh HAS BEEN APPLIED. Without it teams can reach each other's boxes on the
# network, and "an outsider is contained" stops being true.
#
# THE PASSWORD BECOMES VISIBLE IN `ps`. --ssh-pass puts it in the container's argv, so any local user
# on bc2 can read it, where today it sits in a 0600 file. wetty documents no environment variable for
# it. Stated rather than hidden: if bc2 ever has untrusted local accounts, this is the line to revisit.
#
# PORTS MUST MATCH THE TUNNEL. cloudflared maps one hostname per team to a fixed loopback port. A
# container on the wrong port is a team with a dead link, so the map below is the tunnel's, not a
# fresh allocation. Note red-cell is 7716, not 7706: its token was rotated and the -v2 container took
# over, and the ingress followed it.
set -euo pipefail

BASE=/srv/hexworth/engine1
CFG="$BASE/config"
DRY=false
ONLY=""
for a in "$@"; do
    case "$a" in
        --dry) DRY=true ;;
        -*) echo "unknown flag: $a" >&2; exit 1 ;;
        *) ONLY="$a" ;;
    esac
done

declare -A PORT=( [blue-shield-v3]=7701 [cyan-storm]=7702 [gold-strike]=7703 [green-ops]=7704 [purple-haze]=7705 [red-cell]=7716 )
declare -A DOMAIN=( [blue-shield-v3]=engine1-team-blue-shield-v3 [cyan-storm]=engine1-team-cyan-storm \
                    [gold-strike]=engine1-team-gold-strike [green-ops]=engine1-team-green-ops \
                    [purple-haze]=engine1-team-purple-haze [red-cell]=engine1-team-red-cell )
declare -A CNAME=( [blue-shield-v3]=engine1-wetty-tok-blue-shield-v3 [cyan-storm]=engine1-wetty-tok-cyan-storm \
                   [gold-strike]=engine1-wetty-tok-gold-strike [green-ops]=engine1-wetty-tok-green-ops \
                   [purple-haze]=engine1-wetty-tok-purple-haze [red-cell]=engine1-wetty-tok-red-cell-v2 )

fail=0
for t in "${!PORT[@]}"; do
    [ -n "$ONLY" ] && [ "$ONLY" != "$t" ] && continue
    tokfile="$CFG/tokens/$t.token"
    credfile="$CFG/team-$t.cred"
    dom="${DOMAIN[$t]}"; port="${PORT[$t]}"; cname="${CNAME[$t]}"

    # REFUSE ON A MISSING PIECE rather than create a half-working terminal. A container that starts
    # and then cannot authenticate looks identical, from the host, to one that works.
    if [ ! -r "$tokfile" ]; then echo "  $t: NO TOKEN at $tokfile - skipped"; fail=1; continue; fi
    if [ ! -r "$credfile" ]; then echo "  $t: NO CRED at $credfile - skipped"; fail=1; continue; fi
    tok=$(sudo tr -d '\r\n' < "$tokfile")
    pw=$(sudo awk 'NR==1{print $2}' "$credfile")
    if [ "${#tok}" -lt 16 ]; then echo "  $t: token looks wrong (${#tok} chars) - skipped"; fail=1; continue; fi
    if [ -z "$pw" ]; then echo "  $t: could not read the player password - skipped"; fail=1; continue; fi

    ip=$(sudo virsh domifaddr "$dom" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
    if [ -z "$ip" ]; then echo "  $t: NO ADDRESS (is $dom running?) - skipped"; fail=1; continue; fi

    if [ "$DRY" = true ]; then
        printf '  %-18s would recreate %-34s -> %-15s on 127.0.0.1:%s  (token %s chars, password %s chars)\n' \
            "$t" "$cname" "$ip" "$port" "${#tok}" "${#pw}"
        continue
    fi

    # REPLACES the container. This is the one step needing removal rights, which is why an operator
    # runs this script rather than an agent. The VM, its overlay and the golden are untouched: a
    # container here is a terminal, not state.
    sudo docker rm -f "$cname" >/dev/null 2>&1 || true
    sudo docker run -d --name "$cname" --restart unless-stopped -p "127.0.0.1:$port:3000" \
        wettyoss/wetty:latest \
        --ssh-host="$ip" --ssh-user=player --ssh-port=22 --ssh-pass="$pw" \
        --base="/t/$tok/" >/dev/null
    sleep 2
    if sudo docker inspect "$cname" --format '{{.State.Running}}' 2>/dev/null | grep -q true; then
        echo "  $t: terminal up on 127.0.0.1:$port -> $ip (student lands in a shell, no password)"
    else
        echo "  $t: container did NOT stay running - check 'docker logs $cname'"; fail=1
    fi
done

echo
echo "Ports are the tunnel's, not fresh. Verify with the STUDENT path, not a status code:"
echo "  node _tools/engine1/verify-student-shell.js"
echo "A 200 on the token URL proves nothing: a password prompt is also a 200."
exit $fail
