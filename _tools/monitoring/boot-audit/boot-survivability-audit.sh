#!/usr/bin/env bash
# Hexworth boot-survivability audit — asks "will this come BACK", not "is it up NOW".
#
# WHY THIS EXISTS
#   service-probe.sh answers "does it work right now". Nothing answered "will it return after a
#   power cut". That question has been answered twice, both times BY HAND, and both hand-audits
#   passed while a real gap sat one layer below where anyone looked:
#
#     · 2026-08-18  bc2's OpenStack VM had libvirt autostart DISABLED. Every systemd unit on the
#                   host came back green and the entire cloud stayed down underneath them.
#     · 2026-08-18  neon booted a kernel with NO INITRAMFS every time, because a failed nvidia
#                   dkms postinst skipped update-initramfs and GRUB_DEFAULT=0 means "newest".
#                   That machine was never coming back, no matter how many times it tried.
#     · 2026-08-18  nginx lost a port-80 boot race to apache2. PXE was dead; the host served the
#                   stock Apache placeholder and looked fine.
#     · 2026-08-20  prometheus was set --restart unless-stopped and STILL did not come back.
#                   The correct policy. An audit of policy alone would have PASSED it.
#
#   That last one is why this script is necessary and NOT sufficient. Config inspection cannot
#   prove recovery; only a rehearsal (reboot, then diff the service inventory) can. This audit
#   narrows where to look and catches the mechanical gaps. It does not license the claim
#   "everything will come back" — see REHEARSAL.md next to this file.
#
# DESIGN RULES — inherited from service-probe.sh, each earned by a real incident
#   1. READ-ONLY. Changes nothing, safe on a live host serving students. No writes, no restarts.
#   2. NEVER HANG. Every call is bounded. A monitoring script that blocks forever stops
#      reporting, and stopped reporting looks exactly like healthy.
#   3. A CHECK THAT COULD NOT RUN IS NOT A PASS. Every check reports PASS / WARN / FAIL / BLIND.
#      BLIND means "I could not tell" and is counted and printed separately. Missing sudo, a
#      missing binary, or an unreadable file must NEVER silently read as healthy — that is how a
#      broken instrument becomes a green light.
#   4. CHECK WHAT ANSWERED, NOT THAT SOMETHING ANSWERED. curl :9090/-/healthy returned 200 from
#      cockpit-tls while prometheus (on 9091) was dead.
#   5. STATE SCOPE HONESTLY. Where a check is narrow (the port-race check is), it says so in its
#      own output rather than implying general coverage.
#
# @catalog what    audit whether a host's services survive a power cut or a crash (read-only)
# @catalog run     _tools/monitoring/boot-audit/boot-survivability-audit.sh
# @catalog status  TOOL

set -u

VERSION="1.0.0"

# Containers that are SUPPOSED to have restart policy "no" because they are ephemeral.
# Student sandboxes must not resurrect after a reboot — that is correct, not a defect.
# Override per host if needed. Printed in the output so the exclusion can never hide silently.
EPHEMERAL_RE="${HEXWORTH_EPHEMERAL_RE:-^sandbox-}"

# Units that legitimately fail on multi-homed hosts or absent hardware. Documented as benign in
# _docs/operations/power-loss-recovery-2026-08-18.md. Listed, not hidden.
BENIGN_FAILED_RE="${HEXWORTH_BENIGN_FAILED_RE:-wait-online|openipmi}"

# Input paths are overridable SO THAT THE CHECKS CAN BE PROVEN TO FAIL. A check that has never
# gone red has not been tested — the PXE probe once passed while aimed at the wrong host, and a
# detector that accepts the wrong target converts an outage into a green light. The fixture
# suite next to this file drives these overrides. Defaults are the real system paths.
FSTAB_PATH="${HEXWORTH_FSTAB_PATH:-/etc/fstab}"
GRUB_PATH="${HEXWORTH_GRUB_PATH:-/etc/default/grub}"
BOOT_DIR="${HEXWORTH_BOOT_DIR:-/boot}"
DPKG_CMD="${HEXWORTH_DPKG_CMD:-dpkg -l}"

PASS_N=0; WARN_N=0; FAIL_N=0; BLIND_N=0
declare -a FINDINGS=()

c_pass()  { PASS_N=$((PASS_N+1));  printf '  [ PASS  ] %s\n' "$1"; }
c_warn()  { WARN_N=$((WARN_N+1));  printf '  [ WARN  ] %s\n' "$1"; FINDINGS+=("WARN  $1"); }
c_fail()  { FAIL_N=$((FAIL_N+1));  printf '  [ FAIL  ] %s\n' "$1"; FINDINGS+=("FAIL  $1"); }
c_blind() { BLIND_N=$((BLIND_N+1)); printf '  [ BLIND ] %s\n' "$1"; FINDINGS+=("BLIND $1"); }
c_info()  { printf '           %s\n' "$1"; }
section() { printf '\n== %s ==\n' "$1"; }

have() { command -v "$1" >/dev/null 2>&1; }
# Passwordless sudo only. We never prompt — a hung prompt is rule 2.
sudo_ok() { sudo -n true 2>/dev/null; }

printf '===============================================================\n'
printf 'Hexworth boot-survivability audit v%s\n' "$VERSION"
printf 'host: %s   time: %s   user: %s\n' "$(hostname)" "$(date -Is)" "$(whoami)"
printf 'READ-ONLY. Changes nothing.\n'
printf '===============================================================\n'

# ---------------------------------------------------------------------------
# L1  BOOTLOADER — neon booted an unbootable kernel every time and never came back.
# ---------------------------------------------------------------------------
section "L1 bootloader / kernel"

if [ -r "$GRUB_PATH" ]; then
  gd=$(grep -E '^GRUB_DEFAULT=' "$GRUB_PATH" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"')
  if [ -z "$gd" ]; then
    c_blind "GRUB_DEFAULT not set in $GRUB_PATH (host may not use GRUB)"
  elif [ "$gd" = "0" ]; then
    c_warn "GRUB_DEFAULT=0 — boots the NEWEST kernel, whatever it is. This is exactly the setting that made neon unrecoverable: a kernel whose postinst failed has no initramfs, and 0 selects it anyway. Safe only while every kernel below is bootable."
  elif printf '%s' "$gd" | grep -qE '^[0-9]+$'; then
    c_warn "GRUB_DEFAULT=$gd is a positional INDEX. An index moves when a kernel is added or removed. Pin by explicit menuentry id instead."
  else
    c_pass "GRUB_DEFAULT pinned by name/id: $gd"
  fi
else
  c_blind "$GRUB_PATH unreadable — cannot determine boot selection"
fi

# The neon failure mode: a kernel present with no matching initramfs.
if [ -d "$BOOT_DIR" ] && ls "$BOOT_DIR"/vmlinuz-* >/dev/null 2>&1; then
  missing=0; total=0
  for k in "$BOOT_DIR"/vmlinuz-*; do
    kv=${k#"$BOOT_DIR"/vmlinuz-}
    total=$((total+1))
    if [ ! -f "$BOOT_DIR/initrd.img-$kv" ]; then
      c_fail "kernel $kv has NO INITRAMFS — if GRUB selects it the host panics on boot and will not recover unattended"
      missing=$((missing+1))
    fi
  done
  [ "$missing" -eq 0 ] && c_pass "all $total installed kernel(s) have an initramfs"
else
  c_blind "$BOOT_DIR not readable or no kernels found — cannot verify initramfs presence"
fi

# ---------------------------------------------------------------------------
# L2  PACKAGE STATE — the upstream cause of neon's missing initramfs.
#     'rc' (removed, config remains) is BENIGN and must not be counted here.
#     The real condition is desired=install with a non-installed state: iU, iF, iH.
# ---------------------------------------------------------------------------
section "L2 package state"

# The `have dpkg` guard must not gate the OVERRIDE, or a fixture would fall through to BLIND on
# a non-Debian box and never exercise the classifier at all.
if [ -n "${HEXWORTH_DPKG_CMD:-}" ] || have dpkg; then
  broken=$($DPKG_CMD 2>/dev/null | tail -n +6 | awk '$1 ~ /^i/ && $1 != "ii" {print "    " $1 " " $2}')
  if [ -n "$broken" ]; then
    c_fail "half-configured / half-installed packages present — this is what stopped update-initramfs on neon:"
    printf '%s\n' "$broken"
  else
    c_pass "0 half-configured packages (note: 'rc' entries are removed-with-config and are benign)"
  fi
else
  c_blind "dpkg not present — non-Debian host, package state unchecked"
fi

# ---------------------------------------------------------------------------
# L3  SYSTEMD — two DIFFERENT questions, matching the two failure modes.
#       active-but-not-enabled  -> survives a crash, does NOT survive a reboot
#       enabled-but-Restart=no  -> survives a reboot, does NOT survive a crash
#     The devstack units had the second condition on all 20 units.
# ---------------------------------------------------------------------------
section "L3 systemd units"

if have systemctl; then
  # ⚠ systemctl prefixes failed units with a UTF-8 bullet (●) as field 1. Taking $1 naively
  # yields "●" for every unit: the name is never extracted, so BENIGN_FAILED_RE can never match
  # and documented-benign failures (wait-online, openipmi) report as hard FAILs on every host
  # that has them. Caught by running this script against a host that actually had failed units.
  # --plain suppresses the bullet; the sed is belt-and-braces for older systemd.
  failed=$(systemctl list-units --state=failed --no-legend --plain 2>/dev/null \
             | sed 's/^[^[:alnum:]]*//' | awk '{print $1}')
  if [ -n "$failed" ]; then
    while read -r u; do
      [ -z "$u" ] && continue
      if printf '%s' "$u" | grep -qE "$BENIGN_FAILED_RE"; then
        c_info "failed but documented benign: $u"
      else
        c_fail "unit FAILED: $u"
      fi
    done <<< "$failed"
  fi
  c_info "(benign-failed pattern in use: $BENIGN_FAILED_RE)"

  # Running now, gone after a reboot.
  notenabled=""
  while read -r u _; do
    [ -z "$u" ] && continue
    case "$u" in *@*|systemd-*|user@*|session-*|dbus-*|run-*) continue;; esac
    # ⚠ D-Bus-activated services (Type=dbus with a BusName) are started ON DEMAND by dbus and
    # report is-enabled=disabled BY DESIGN. Flagging them as "will not come back" is a false
    # positive — rtkit-daemon and upower tripped exactly this during the first smoke test.
    # A boot audit that cries wolf over correct configuration is one people stop reading.
    if [ "$(systemctl show -p Type --value "$u" 2>/dev/null)" = "dbus" ] \
       && [ -n "$(systemctl show -p BusName --value "$u" 2>/dev/null)" ]; then
      continue
    fi
    # ⚠ SOCKET-ACTIVATED services report is-enabled=disabled on the .service while the .socket
    # carries the enablement. bc2's sshd is exactly this: ssh.service=disabled, ssh.socket=enabled
    # +active. Reporting that as "SSH will not come back after a reboot" is a false alarm about
    # the single most important unit on a remote host — it would send someone to "fix" a correct
    # configuration, and it is the kind of loud-but-wrong finding that teaches people to ignore
    # the audit. Check the companion .socket before flagging.
    sock="${u%.service}.socket"
    if [ "$(systemctl is-enabled "$sock" 2>/dev/null)" = "enabled" ]; then
      c_info "$u is socket-activated via $sock (enabled) — correct, not a gap"
      continue
    fi
    st=$(systemctl is-enabled "$u" 2>/dev/null)
    case "$st" in
      disabled) notenabled="${notenabled}    $u (disabled)\n" ;;
      static|indirect|generated|transient|enabled|enabled-runtime|masked|alias|"") : ;;
    esac
  done < <(systemctl list-units --type=service --state=running --no-legend 2>/dev/null | awk '{print $1}')

  if [ -n "$notenabled" ]; then
    c_fail "service(s) RUNNING NOW but DISABLED — these survive a crash but will NOT come back after a reboot:"
    printf "$notenabled"
  else
    c_pass "no running service is left disabled"
  fi

  # Enabled but with no crash-restart policy.
  norestart=""
  while read -r u _; do
    [ -z "$u" ] && continue
    case "$u" in *@*|systemd-*|user@*|session-*|dbus-*|run-*) continue;; esac
    rp=$(systemctl show -p Restart --value "$u" 2>/dev/null)
    ty=$(systemctl show -p Type --value "$u" 2>/dev/null)
    [ "$ty" = "oneshot" ] && continue
    [ "$rp" = "no" ] && norestart="${norestart}    $u\n"
  done < <(systemctl list-units --type=service --state=running --no-legend 2>/dev/null | awk '{print $1}')

  if [ -n "$norestart" ]; then
    c_warn "running service(s) with Restart=no — these come back after a REBOOT but not after a CRASH. All 20 devstack units had exactly this:"
    printf "$norestart"
  else
    c_pass "every running service has a crash-restart policy"
  fi
else
  c_blind "systemctl not present — init posture unchecked"
fi

# ---------------------------------------------------------------------------
# L4  DOCKER — prometheus had the CORRECT policy here and still did not return.
#     Policy is necessary, not sufficient. Say so in the output.
# ---------------------------------------------------------------------------
section "L4 docker"

if have docker; then
  if docker info >/dev/null 2>&1; then
    de=$(systemctl is-enabled docker 2>/dev/null || echo unknown)
    if [ "$de" = "enabled" ]; then
      c_pass "docker.service enabled at boot"
    else
      c_fail "docker.service is '$de' — containers cannot restart if the daemon does not start"
    fi

    c_info "ephemeral exclusion in use: $EPHEMERAL_RE"
    bad=""
    while read -r n; do
      [ -z "$n" ] && continue
      pol=$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$n" 2>/dev/null)
      st=$(docker inspect -f '{{.State.Status}}' "$n" 2>/dev/null)
      [ "$st" = "running" ] || continue
      if printf '%s' "$n" | grep -qE "$EPHEMERAL_RE"; then
        c_info "ephemeral, policy '$pol' is correct: $n"
        continue
      fi
      case "$pol" in
        ""|no) bad="${bad}    $n (policy='${pol:-none}')\n" ;;
      esac
    done < <(docker ps --format '{{.Names}}' 2>/dev/null)

    if [ -n "$bad" ]; then
      c_fail "non-ephemeral container(s) RUNNING with no restart policy — gone after a reboot:"
      printf "$bad"
    else
      c_pass "every non-ephemeral running container has a restart policy"
    fi
    c_warn "policy alone does NOT prove recovery: prometheus was 'unless-stopped' on 2026-08-20 and did not come back. Only a rehearsal settles this."
  else
    c_blind "docker present but daemon unreachable for this user — container policy unchecked (not a pass)"
  fi
else
  c_info "docker not installed on this host"
fi

# ---------------------------------------------------------------------------
# L5  LIBVIRT — the 2026-08-18 defect. A layer BELOW every service check.
# ---------------------------------------------------------------------------
section "L5 libvirt guests"

if have virsh; then
  # ⚠⚠ MUST target qemu:///system EXPLICITLY. An unprivileged `virsh` defaults to qemu:///session,
  # which is a SEPARATE, usually-empty namespace. On bc2 that returned "no domains" while
  # openstack-stage1 was running under qemu:///system — so this check reported nothing to see on
  # the ONE host where the 2026-08-18 autostart defect actually lived. A check pointed at the
  # wrong target does not merely miss the fault, it CLOSES THE INVESTIGATION. Caught by running
  # this audit against bc2 and disbelieving a clean result on a host known to run a VM.
  VIRSH=""
  if virsh -c qemu:///system list --all >/dev/null 2>&1; then
    VIRSH="virsh -c qemu:///system"
  elif sudo_ok && sudo -n virsh -c qemu:///system list --all >/dev/null 2>&1; then
    VIRSH="sudo -n virsh -c qemu:///system"
  fi
  if [ -n "$VIRSH" ]; then
    c_info "querying $( [ "${VIRSH#sudo}" != "$VIRSH" ] && echo 'qemu:///system (via sudo)' || echo 'qemu:///system' )"
    doms=$($VIRSH list --all --name 2>/dev/null | grep -v '^$')
    if [ -z "$doms" ]; then
      c_info "no libvirt domains defined under qemu:///system on this host"
    else
      while read -r d; do
        [ -z "$d" ] && continue
        as=$($VIRSH dominfo "$d" 2>/dev/null | awk -F: '/Autostart/{gsub(/ /,"",$2); print $2}')
        if [ "$as" = "enable" ]; then
          c_pass "VM '$d' autostart=enable"
        elif [ -z "$as" ]; then
          c_blind "VM '$d' autostart unreadable"
        else
          c_fail "VM '$d' autostart=$as — the host will boot clean and this guest will stay DOWN. This is the exact 2026-08-18 OpenStack defect."
        fi
      done <<< "$doms"
    fi
  else
    c_blind "virsh present but qemu:///system is not queryable by this user and sudo -n is unavailable — guest autostart UNCHECKED. This is NOT 'no VMs'; the 2026-08-18 outage was a VM that this exact check must see."
  fi
else
  c_info "libvirt not installed on this host"
fi

# ---------------------------------------------------------------------------
# L6  MOUNTS — two distinct hazards.
#       missing nofail on a non-root mount -> boot can drop to emergency, host never returns
#       network fs without automount       -> a failed mount is NEVER retried (08-18, three hosts)
# ---------------------------------------------------------------------------
section "L6 mounts"

FSTAB_SEEN=0
if [ -r "$FSTAB_PATH" ]; then
  while read -r dev mnt fs opts _; do
    case "$dev" in \#*|"") continue;; esac
    [ "$mnt" = "/" ] && continue
    [ "$fs" = "swap" ] && continue
    case "$mnt" in /boot|/boot/efi) continue;; esac
    FSTAB_SEEN=$((FSTAB_SEEN+1))

    case "$fs" in
      cifs|nfs|nfs4|sshfs)
        if printf '%s' "$opts" | grep -q 'x-systemd.automount'; then
          c_pass "network mount $mnt has x-systemd.automount (defers and retries)"
        else
          c_fail "network mount $mnt has NO x-systemd.automount — a failed mount is never retried. This failed on bc1, bc2 and bc4 on 2026-08-18."
        fi
        printf '%s' "$opts" | grep -q 'nofail' || \
          c_fail "network mount $mnt lacks nofail — a boot-time failure can block startup"
        printf '%s' "$opts" | grep -qE 'password=' && \
          c_fail "credential is INLINE in /etc/fstab for $mnt — fstab is world-readable. Move to a 0600 credentials= file."
        ;;
      *)
        if printf '%s' "$opts" | grep -q 'nofail'; then
          c_pass "mount $mnt has nofail"
        else
          c_warn "mount $mnt has no 'nofail' — if this device is absent at boot, systemd can drop to emergency mode and the host does not return unattended"
        fi
        ;;
    esac
  done < "$FSTAB_PATH"
  # An audit that prints NOTHING is ambiguous: "no mounts to check" and "the loop silently did
  # not run" look identical. Say which one it was.
  [ "$FSTAB_SEEN" -eq 0 ] && c_info "no non-root, non-swap, non-/boot fstab entries on this host — nothing to check here (this is a real result, not a skipped check)"
else
  c_blind "$FSTAB_PATH unreadable — mount posture unchecked"
fi

# ---------------------------------------------------------------------------
# L7  PORT RACE — NARROW BY DESIGN. Generalising this needs port-to-unit mapping
#     that is not reliably available offline, so it checks the exact class that bit us
#     and says plainly that it is not general coverage.
# ---------------------------------------------------------------------------
section "L7 port-80 race (narrow check)"

if have systemctl; then
  webs=""
  for u in nginx apache2 httpd lighttpd caddy; do
    st=$(systemctl is-enabled "${u}.service" 2>/dev/null)
    [ "$st" = "enabled" ] && webs="$webs $u"
  done
  n=$(printf '%s' "$webs" | wc -w)
  if [ "$n" -gt 1 ]; then
    c_fail "MORE THAN ONE web server enabled at boot:$webs — whichever wins the port-80 race keeps it. On 2026-08-18 apache2 beat nginx and PXE boot was down while the host served a placeholder page."
  elif [ "$n" -eq 1 ]; then
    c_pass "exactly one web server enabled at boot:$webs"
  else
    c_info "no standard web server enabled on this host"
  fi
  c_info "SCOPE: this checks the five common web servers only. It is NOT general port-conflict coverage."
else
  c_blind "systemctl not present — port race unchecked"
fi

# ---------------------------------------------------------------------------
# L8  SCHEDULED WORK — a monitor started by hand dies at the next power cut, silently.
# ---------------------------------------------------------------------------
section "L8 scheduled work persistence"

if have systemctl; then
  ce=$(systemctl is-enabled cron 2>/dev/null || systemctl is-enabled crond 2>/dev/null || echo unknown)
  if [ "$ce" = "enabled" ]; then
    c_pass "cron enabled at boot"
  else
    c_warn "cron reports '$ce' — if scheduled probes rely on it, they do not return after a reboot"
  fi
fi
if [ -d /etc/cron.d ] && ls /etc/cron.d/* >/dev/null 2>&1; then
  c_pass "/etc/cron.d entries present ($(ls /etc/cron.d | wc -l)) — these persist across reboot"
  c_info "$(ls /etc/cron.d | tr '\n' ' ')"
else
  c_info "no /etc/cron.d entries"
fi

# ---------------------------------------------------------------------------
# L0  FIRMWARE — usually unreadable without IPMI. Reported BLIND, never assumed.
# ---------------------------------------------------------------------------
section "L0 firmware AC-power policy"

if have ipmitool && { ipmitool chassis status >/dev/null 2>&1 || { sudo_ok && sudo -n ipmitool chassis status >/dev/null 2>&1; }; }; then
  pol=$(ipmitool chassis status 2>/dev/null | grep -i 'Power Restore Policy' || sudo -n ipmitool chassis status 2>/dev/null | grep -i 'Power Restore Policy')
  if printf '%s' "$pol" | grep -qi 'always-on'; then
    c_pass "firmware power-restore policy: always-on"
  else
    c_fail "firmware power-restore policy is NOT always-on: ${pol:-unreadable} — this host stays OFF after mains returns"
  fi
else
  c_blind "no IPMI on this host — 'Restore on AC Power Loss' must be read and set in BIOS by hand. It is FREE and it is the difference between the estate returning by itself and someone driving to the building."
fi

# ---------------------------------------------------------------------------
printf '\n===============================================================\n'
printf 'SUMMARY  host=%s  pass=%d warn=%d fail=%d blind=%d\n' "$(hostname)" "$PASS_N" "$WARN_N" "$FAIL_N" "$BLIND_N"
if [ "${#FINDINGS[@]}" -gt 0 ]; then
  printf '\nNon-pass findings:\n'
  for f in "${FINDINGS[@]}"; do printf '  %s\n' "$f"; done
fi
printf '\nBLIND is not PASS. %d check(s) could not be evaluated on this host.\n' "$BLIND_N"
printf 'This audit narrows where to look. It does NOT prove recovery — prometheus held the\n'
printf 'correct policy and still failed to return. Only a reboot rehearsal proves it.\n'
printf '===============================================================\n'

[ "$FAIL_N" -gt 0 ] && exit 1
exit 0
