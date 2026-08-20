#!/usr/bin/env bash
# Move the CIFS share credential out of /etc/fstab into a root-only credentials file.
#
# @catalog what   Rewrites the neon-share fstab entry to use credentials=<file 0600> instead of
# @catalog what   inline username=/password=, which are world-readable in /etc/fstab (mode 644).
# @catalog run    sudo _tools/monitoring/neon/move-cifs-creds-out-of-fstab.sh [--dry-run]
# @catalog status TOOL
#
# WHY
# /etc/fstab is mode 644 by design - mount(8) and assorted tooling read it as any user. The neon
# share entry carried username= and password= inline, so every local account on bc1 could read
# the credential (verified: `sudo -u nobody test -r /etc/fstab` succeeds). Surfaced while
# diagnosing the 2026-08-20 power loss, when the line was displayed during troubleshooting.
#
# ⚠ THIS DOES NOT MAKE THE OLD PASSWORD SAFE. It stops NEW disclosure. The existing value must be
# treated as known and rotated on neon separately - moving a leaked secret to a better file does
# not un-leak it. Rotation is an operator action because it needs a matching change on the Samba
# side; this script deliberately does not attempt it, since a half-rotated credential breaks the
# mount on every host that uses the share.
#
# Idempotent: if the entry already uses credentials=, it exits without touching anything.
set -eu

FSTAB=/etc/fstab
CREDS=/etc/cifs-neon.creds
DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1

[ "$(id -u)" -eq 0 ] || { echo "  must run as root (it writes $CREDS mode 0600)"; exit 1; }

line=$(grep -n 'cifs' "$FSTAB" | grep 'neon-shared' || true)
[ -n "$line" ] || { echo "  no neon-shared cifs entry in $FSTAB - nothing to do"; exit 0; }

if printf '%s' "$line" | grep -q 'credentials='; then
    echo "  already using credentials= - nothing to change"
    exit 0
fi

# Extract WITHOUT echoing. These are the values being protected; printing them here would defeat
# the entire point of the change and repeat the disclosure that prompted it.
user=$(grep 'neon-shared' "$FSTAB" | grep -oE 'username=[^,[:space:]]+' | head -1 | cut -d= -f2-)
pass=$(grep 'neon-shared' "$FSTAB" | grep -oE 'password=[^,[:space:]]+' | head -1 | cut -d= -f2-)
[ -n "$user" ] && [ -n "$pass" ] || { echo "  could not parse username/password - refusing to guess"; exit 1; }

if [ "$DRY" -eq 1 ]; then
    echo "  DRY RUN: would write $CREDS (0600 root:root) and rewrite the fstab entry"
    echo "  resulting options would drop username=/password= and add credentials=$CREDS"
    exit 0
fi

cp -a "$FSTAB" "${FSTAB}.bak-pre-creds-move-$(date +%Y%m%d)"

# Create the credentials file BEFORE editing fstab, and with the restrictive mode set at creation
# rather than chmod'ed afterwards - a world-readable window, however brief, is the same disclosure
# this change exists to close.
umask 077
printf 'username=%s\npassword=%s\n' "$user" "$pass" > "$CREDS"
chown root:root "$CREDS"
chmod 0600 "$CREDS"

# Remove the two inline options and add credentials=. Anchored to the neon-shared line only, so a
# future second cifs mount is untouched.
python3 - "$FSTAB" "$CREDS" <<'PY'
import re, sys
fstab, creds = sys.argv[1], sys.argv[2]
out = []
for ln in open(fstab):
    if 'neon-shared' in ln and 'cifs' in ln and 'credentials=' not in ln:
        ln = re.sub(r'username=[^,\s]+,?', '', ln)
        ln = re.sub(r'password=[^,\s]+,?', '', ln)
        # Insert credentials= as the first option so the field is never empty, which would make
        # the line malformed and fail the mount.
        parts = ln.split()
        parts[3] = f'credentials={creds},' + parts[3].strip(',')
        ln = '\t'.join(parts) + '\n'
    out.append(ln)
open(fstab, 'w').writelines(out)
PY

echo "  wrote $CREDS ($(stat -c '%a %U:%G' "$CREDS"))"
echo "  fstab rewritten; backup kept alongside it"
grep 'neon-shared' "$FSTAB" | sed 's/^/  /'
