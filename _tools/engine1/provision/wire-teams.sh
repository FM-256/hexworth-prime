#!/usr/bin/env bash
# Engine 1: one browser terminal per team, each bound to loopback and pointed at that team's VM.
#
# Ports are fixed per team so the tunnel's ingress rules stay stable. The VM's ADDRESS is read
# live from libvirt rather than hardcoded, because these are DHCP leases: a host reboot can
# reshuffle them and a container pointed at a stale address would quietly drop a team onto
# another team's box. Re-running this after a reboot is the intended repair.
#
# CREATE ONLY: an existing container for a team is left alone and reported, never replaced.
set -euo pipefail
declare -A PORT=( [blue-shield-v3]=7691 [cyan-storm]=7692 [gold-strike]=7693 [green-ops]=7694 [purple-haze]=7695 [red-cell]=7696 )
for t in "${!PORT[@]}"; do
  d="engine1-team-$t"; p="${PORT[$t]}"; c="engine1-wetty-$t"
  ip=$(sudo virsh domifaddr "$d" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
  if [ -z "$ip" ]; then echo "  $t: NO ADDRESS, skipped (is $d running?)"; continue; fi
  if sudo docker inspect "$c" >/dev/null 2>&1; then
    cur=$(sudo docker inspect "$c" --format '{{range .Args}}{{.}} {{end}}' | grep -oE 'ssh-host=[0-9.]+' | cut -d= -f2)
    [ "$cur" = "$ip" ] && echo "  $t: container exists and targets $ip, left alone" \
                       || echo "  $t: container exists but targets $cur while the VM is now $ip - STALE, needs a human"
    continue
  fi
  sudo docker run -d --name "$c" --restart unless-stopped -p "127.0.0.1:$p:3000" \
    wettyoss/wetty:latest --ssh-host="$ip" --ssh-user=player --ssh-port=22 --base=/ >/dev/null
  echo "  $t: terminal on 127.0.0.1:$p -> $ip"
done
echo "--- listening, loopback only ---"
ss -ltn 2>/dev/null | awk '$4 ~ /127.0.0.1:769/ {print "  "$4}' | sort
