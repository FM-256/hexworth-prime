#!/bin/bash
# perms/setup.sh — seeds broken permissions in $WORKSPACE for $LEVEL.
set -eu
W="$WORKSPACE"
mkdir -p "$W/shared" "$W/private"

# A script that should be runnable by its owner but is not; and world-writable.
printf '#!/bin/bash\necho "backup complete"\n' > "$W/backup.sh"
chmod 666 "$W/backup.sh"

# A directory the group should be able to enter but cannot.
chmod 600 "$W/shared"
echo "team notes" > "$W/private/notes.txt" 2>/dev/null || true

if [ "$LEVEL" -ge 2 ]; then
  # Level 2: wrong ownership + a setuid decoy binary copy.
  sudo useradd -m svc-backup 2>/dev/null || true
  sudo touch "$W/private/svc.log"
  sudo chown root:root "$W/private/svc.log"
  cp /usr/bin/id "$W/shared/idtool"
  sudo chown root:root "$W/shared/idtool"
  sudo chmod 4755 "$W/shared/idtool"
fi

echo ""
echo "LAB READY: Fix the Permissions (level $LEVEL)"
echo "OBJECTIVES:"
echo "  1. ~/lab/backup.sh: owner can execute it; NOBODY else can write to it."
echo "  2. ~/lab/shared: you (and your group) can enter AND list it."
if [ "$LEVEL" -ge 2 ]; then
  echo "  3. ~/lab/private/svc.log: owned by svc-backup (user AND group)."
  echo "  4. ~/lab/shared/idtool: remove the dangerous setuid bit."
fi
echo "Check your work anytime: lab check"
