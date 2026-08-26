#!/bin/bash
# OpenStack Stage 3 -- student pool provisioner. Runs ON bc2 (host), talks to the DevStack VM.
#
# Creates student-01..student-30: project + user (member role on own project only) + quota
# 1 instance / 1 core / 512MB (Fork C, Nancy-corrected numbers) + a random per-user password
# written ONLY to the 0600 store the claim service reads. Nobody else ever sees these passwords;
# they exist because Keystone application credentials are SELF-SERVICE (proven 2026-07-30: no
# --user flag on create), so the claim service must authenticate AS the pool user to mint a
# session app credential.
#
# Idempotent: safe to re-run; existing users/projects are left alone, missing pieces are added.
# Term reset (Fork D) = delete projects+users, re-run this.
#
# Usage (on bc2):  bash provision-pool.sh [pool_size]
set -euo pipefail

POOL=${1:-30}
VM_KEY=~/openstack-stage1/stage1_key
VM=stack@192.168.122.62
STORE=~/openstack-stage1/pool-credentials.env   # chmod 600; claim service reads this

# All OpenStack calls run inside the VM as the stack user (admin openrc lives there;
# admin credentials never leave bc2/VM -- same boundary as Stages 1-2).
V() { ssh -o BatchMode=yes -i "$VM_KEY" "$VM" "source ~/devstack/openrc admin admin >/dev/null 2>&1; $1" < /dev/null; }

touch "$STORE"; chmod 600 "$STORE"

for i in $(seq -w 1 "$POOL"); do
  U="student-$i"
  # project
  if ! V "openstack project show $U -f value -c id" >/dev/null 2>&1; then
    V "openstack project create --description 'Stage3 student pool slot' $U -f value -c id" >/dev/null
    echo "created project $U"
  fi
  # user + role
  if ! V "openstack user show $U -f value -c id" >/dev/null 2>&1; then
    PW=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
    V "openstack user create --project $U --password '$PW' $U -f value -c id" >/dev/null
    grep -q "^${U}=" "$STORE" || echo "${U}=${PW}" >> "$STORE"
    echo "created user $U (password stored)"
  elif ! grep -q "^${U}=" "$STORE"; then
    # SELF-HEAL (Nancy 2026-07-30): user exists but the password never made it to the
    # store (crash between create and echo). Without this branch the slot is bricked
    # forever -- claim() returns POOL_PASSWORD_MISSING and nothing ever fixes it.
    PW=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
    V "openstack user set --password '$PW' $U"
    echo "${U}=${PW}" >> "$STORE"
    echo "HEALED $U: password was unstored, reset + stored"
  fi
  V "openstack role add --project $U --user $U member" || true
  # quota: 1 instance / 1 core / 512MB.
  # 192 was the ORIGINAL number, chosen when m1.nano and CirrOS were the only things that ran
  # here. `ubuntu-24.04-sprint` declares a 512MB minimum, so a 192MB quota makes the Cloud
  # Security Sprint impossible: the create is refused outright with "Flavor's memory is too
  # small for requested image". The live slots were raised to 512 at some point and this script
  # was not, so re-running it -- the documented way to add slots or reset a term -- would have
  # silently downgraded every EMPTY slot back to 192 and broken the sprint for those students.
  # It errors instead of downgrading on slots already using 512, which is the only reason this
  # was caught rather than shipped.
  V "openstack quota set --instances 1 --cores 1 --ram 512 $U"
done

echo "pool of $POOL provisioned; passwords in $STORE (0600)"

# Term-reset hygiene (Nancy 2026-07-30): the claim service caches Keystone user ids for
# the pool; after ANY delete+recreate pass those ids are stale and reconcile would sweep
# ghosts forever. Restart it; if that fails, shout.
if systemctl is-active --quiet openstack-bridge 2>/dev/null; then
  sudo systemctl restart openstack-bridge && echo "openstack-bridge restarted (uid cache cleared)" \
    || echo "WARNING: could not restart openstack-bridge -- restart it MANUALLY or reconcile will act on stale user ids"
else
  echo "NOTE: openstack-bridge not running here; if it runs elsewhere, restart it after this provision pass"
fi
