#!/usr/bin/env bash
# Mutation test for boot-survivability-audit.sh.
#
# WHY THIS EXISTS
#   "A check that has never failed has not been tested." The PXE check in service-probe.sh once
#   PASSED while aimed at hexworth.com instead of the PXE server, because that page also contains
#   the word "images". A detector that accepts the wrong target converts an outage into a green
#   light — which is strictly worse than having no detector, because it closes the investigation.
#
#   So every check here is driven TWICE: once with a fixture that must go RED, once with a
#   fixture that must stay GREEN. A check that cannot be made to fail is not verifying anything.
#
# @catalog what    prove every boot-audit check can go RED (mutation test, two fixtures each)
# @catalog run     _tools/monitoring/boot-audit/test-boot-audit.sh
# @catalog status  TOOL

set -u

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDIT="$HERE/boot-survivability-audit.sh"
FIX="$(mktemp -d)"
trap 'rm -rf "$FIX"' EXIT

T_RUN=0; T_OK=0; T_BAD=0

# assert <name> <expect-regex> <must-match: yes|no> <env assignments...>
assert() {
  local name="$1" pat="$2" want="$3"; shift 3
  T_RUN=$((T_RUN+1))
  local out
  out=$(env "$@" bash "$AUDIT" 2>&1)
  if printf '%s' "$out" | grep -qE "$pat"; then
    if [ "$want" = "yes" ]; then T_OK=$((T_OK+1)); printf '  ok   %s\n' "$name"
    else T_BAD=$((T_BAD+1)); printf '  FAIL %s — pattern /%s/ matched but should NOT have\n' "$name" "$pat"; fi
  else
    if [ "$want" = "no" ]; then T_OK=$((T_OK+1)); printf '  ok   %s\n' "$name"
    else T_BAD=$((T_BAD+1)); printf '  FAIL %s — pattern /%s/ did NOT match\n' "$name" "$pat"; fi
  fi
}

printf '=== boot-audit mutation test ===\n\n'

# ---------------------------------------------------------------- L1 grub
printf -- '-- L1 GRUB_DEFAULT --\n'
printf 'GRUB_DEFAULT=0\n'                             > "$FIX/grub.zero"
printf 'GRUB_DEFAULT=3\n'                             > "$FIX/grub.index"
printf 'GRUB_DEFAULT="gnulinux-6.8.0-137-generic"\n'  > "$FIX/grub.pinned"

assert "GRUB_DEFAULT=0 warns (the neon setting)" \
  '\[ WARN  \] GRUB_DEFAULT=0' yes "HEXWORTH_GRUB_PATH=$FIX/grub.zero"
assert "GRUB_DEFAULT=3 warns (index moves)" \
  '\[ WARN  \] GRUB_DEFAULT=3 is a positional INDEX' yes "HEXWORTH_GRUB_PATH=$FIX/grub.index"
assert "pinned-by-id passes" \
  'GRUB_DEFAULT pinned by name/id' yes "HEXWORTH_GRUB_PATH=$FIX/grub.pinned"
# The control: the PASS fixture must NOT also emit the warning.
assert "pinned-by-id does NOT warn" \
  '\[ WARN  \] GRUB_DEFAULT' no "HEXWORTH_GRUB_PATH=$FIX/grub.pinned"
assert "missing grub file is BLIND, not PASS" \
  '\[ BLIND \].*unreadable — cannot determine boot selection' yes "HEXWORTH_GRUB_PATH=$FIX/nope"

# ---------------------------------------------------------------- L1 initramfs
printf -- '\n-- L1 initramfs (the neon killer) --\n'
mkdir -p "$FIX/boot.good" "$FIX/boot.bad"
: > "$FIX/boot.good/vmlinuz-6.8.0-137"; : > "$FIX/boot.good/initrd.img-6.8.0-137"
: > "$FIX/boot.good/vmlinuz-6.8.0-138"; : > "$FIX/boot.good/initrd.img-6.8.0-138"
: > "$FIX/boot.bad/vmlinuz-6.8.0-137";  : > "$FIX/boot.bad/initrd.img-6.8.0-137"
: > "$FIX/boot.bad/vmlinuz-7.0.0-28"    # <-- no initrd: exactly neon's condition

assert "kernel without initramfs FAILS" \
  '\[ FAIL  \] kernel 7\.0\.0-28 has NO INITRAMFS' yes "HEXWORTH_BOOT_DIR=$FIX/boot.bad"
assert "all-kernels-good PASSES" \
  'all 2 installed kernel\(s\) have an initramfs' yes "HEXWORTH_BOOT_DIR=$FIX/boot.good"
assert "good boot dir emits NO initramfs failure" \
  'NO INITRAMFS' no "HEXWORTH_BOOT_DIR=$FIX/boot.good"

# ---------------------------------------------------------------- L2 dpkg
printf -- '\n-- L2 package state --\n'
# dpkg -l has a 5-line header; the audit does tail -n +6. Reproduce that shape exactly.
{ printf 'Desired\nStatus\n|/ Err\n||/ Name\n+++-====\n'
  printf 'ii  bash    5.2  amd64  shell\n'
  printf 'rc  linux-image-6.8.0-88  6.8  amd64  old kernel\n'; } > "$FIX/dpkg.clean"
{ printf 'Desired\nStatus\n|/ Err\n||/ Name\n+++-====\n'
  printf 'ii  bash    5.2  amd64  shell\n'
  printf 'rc  linux-image-6.8.0-88  6.8  amd64  old kernel\n'
  printf 'iU  linux-image-7.0.0-28  7.0  amd64  half-configured\n'; } > "$FIX/dpkg.broken"

assert "half-configured package FAILS" \
  '\[ FAIL  \] half-configured / half-installed packages present' yes "HEXWORTH_DPKG_CMD=cat $FIX/dpkg.broken"
assert "'rc' entries alone do NOT fail (they are benign)" \
  '\[ FAIL  \] half-configured' no "HEXWORTH_DPKG_CMD=cat $FIX/dpkg.clean"
assert "clean package state PASSES" \
  '0 half-configured packages' yes "HEXWORTH_DPKG_CMD=cat $FIX/dpkg.clean"

# ---------------------------------------------------------------- L6 mounts
printf -- '\n-- L6 mounts --\n'
printf '//10.0.0.1/shared /mnt/s cifs credentials=/etc/c.creds,_netdev,nofail,x-systemd.automount 0 0\n' > "$FIX/fstab.good"
printf '//10.0.0.1/shared /mnt/s cifs credentials=/etc/c.creds,_netdev,nofail 0 0\n'                     > "$FIX/fstab.noauto"
printf '//10.0.0.1/shared /mnt/s cifs username=u,password=hunter2,_netdev,nofail,x-systemd.automount 0 0\n' > "$FIX/fstab.inlinepw"
printf '/dev/vg/data /data ext4 defaults 0 2\n'                                                          > "$FIX/fstab.nonofail"
printf '# only comments\n'                                                                               > "$FIX/fstab.empty"

assert "network mount without automount FAILS" \
  '\[ FAIL  \] network mount /mnt/s has NO x-systemd.automount' yes "HEXWORTH_FSTAB_PATH=$FIX/fstab.noauto"
assert "network mount with automount PASSES" \
  '\[ PASS  \] network mount /mnt/s has x-systemd.automount' yes "HEXWORTH_FSTAB_PATH=$FIX/fstab.good"
assert "good mount emits NO automount failure" \
  'NO x-systemd.automount' no "HEXWORTH_FSTAB_PATH=$FIX/fstab.good"
assert "inline fstab password FAILS" \
  '\[ FAIL  \] credential is INLINE' yes "HEXWORTH_FSTAB_PATH=$FIX/fstab.inlinepw"
assert "credentials= file does NOT trip the inline-password check" \
  'credential is INLINE' no "HEXWORTH_FSTAB_PATH=$FIX/fstab.good"
assert "local mount without nofail WARNS (boot-hang risk)" \
  "\[ WARN  \] mount /data has no 'nofail'" yes "HEXWORTH_FSTAB_PATH=$FIX/fstab.nonofail"
assert "empty fstab says so explicitly, never silence" \
  'nothing to check here \(this is a real result, not a skipped check\)' yes "HEXWORTH_FSTAB_PATH=$FIX/fstab.empty"
assert "unreadable fstab is BLIND, not PASS" \
  '\[ BLIND \].*unreadable — mount posture unchecked' yes "HEXWORTH_FSTAB_PATH=$FIX/nope"

# ---------------------------------------------------------------- exit contract
printf -- '\n-- exit code contract --\n'
T_RUN=$((T_RUN+1))
env "HEXWORTH_BOOT_DIR=$FIX/boot.bad" bash "$AUDIT" >/dev/null 2>&1
if [ $? -ne 0 ]; then T_OK=$((T_OK+1)); printf '  ok   a FAIL finding exits non-zero\n'
else T_BAD=$((T_BAD+1)); printf '  FAIL a FAIL finding did not exit non-zero\n'; fi

printf '\n=== %d run, %d ok, %d failed ===\n' "$T_RUN" "$T_OK" "$T_BAD"
[ "$T_BAD" -gt 0 ] && exit 1
exit 0
