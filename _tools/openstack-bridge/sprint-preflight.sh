#!/bin/bash
# READ-ONLY readiness check for the Cloud Security Sprint. Run on bc2, any time, including five
# minutes before class. Creates nothing, changes nothing, and exits non-zero if students would hit
# a wall.
#
# WHY A SEPARATE READ-ONLY CHECK
#   ensure-sprint-ready.sh CHANGES things, so nobody wants to run it on a Monday morning to find
#   out whether they need to. This answers "is it ready?" without touching anything. It also checks
#   things the provisioner cannot fix, like capacity and the console service.
#
#   Every check states what GOOD means, because several of the failure modes here are silent:
#   a cirros-only cloud looks healthy, a 192MB quota looks healthy, and the two decoy networks
#   look exactly like the working one in `openstack network list`.
#
# @catalog what    read-only: is the cloud ready to run the Cloud Security Sprint?
# @catalog run     bash _tools/openstack-bridge/sprint-preflight.sh [expected_class_size]  (on bc2)
# @catalog status  TOOL
set -uo pipefail

CLASS=${1:-20}
# Overridable SO THAT THIS CHECK CAN BE PROVEN TO FAIL. A preflight that has only ever been run
# against a healthy cloud has not been shown to detect an unhealthy one. See the runbook's
# "proving the preflight works" section.
IMAGE=${SPRINT_IMAGE:-ubuntu-24.04-minimal}
FLAVOR=${SPRINT_FLAVOR:-ds512M}
KEY=${STAGE1_KEY:-$HOME/openstack-stage1/stage1_key}
VMADDR=${STAGE1_VM:-192.168.122.62}
ADMIN_ENV=${ADMIN_ENV:-$HOME/openstack-stage1/admin-auth.env}

[ -r "$ADMIN_ENV" ] || { echo "✗ cannot read $ADMIN_ENV -- run this on bc2"; exit 2; }
set -a; . "$ADMIN_ENV"; set +a

ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$VMADDR" \
  "U='$OS_ADMIN_USER' P='$OS_ADMIN_PASS' PR='$OS_ADMIN_PROJECT' \
   IMAGE='$IMAGE' FLAVOR='$FLAVOR' CLASS='$CLASS' bash -s" <<'REMOTE'
set -uo pipefail
export OS_AUTH_URL=http://192.168.122.62/identity OS_IDENTITY_API_VERSION=3 \
       OS_USERNAME="$U" OS_PASSWORD="$P" OS_PROJECT_NAME="$PR" \
       OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default

fail=0; warn=0
ok(){   echo "  [ PASS ] $1"; }
no(){   echo "  [ FAIL ] $1"; fail=$((fail+1)); }
wa(){   echo "  [ WARN ] $1"; warn=$((warn+1)); }

echo "=== 1. guest image ==="
st=$(openstack image show "$IMAGE" -f value -c status 2>/dev/null)
mr=$(openstack image show "$IMAGE" -f value -c min_ram 2>/dev/null)
md=$(openstack image show "$IMAGE" -f value -c min_disk 2>/dev/null)
vis=$(openstack image show "$IMAGE" -f value -c visibility 2>/dev/null)
if [ "$st" = active ]; then ok "$IMAGE active (min_ram=${mr}MB min_disk=${md}GB)"
else no "$IMAGE is '${st:-absent}'. Students get cirros, which has no apt/systemd/python. Run ensure-sprint-ready.sh"; fi
[ "$vis" = public ] && ok "image is public (every student project can boot it)" \
  || no "image visibility is '${vis:-?}' -- student projects cannot see it"

echo "=== 2. flavor fits the image ==="
fr=$(openstack flavor show "$FLAVOR" -f value -c ram 2>/dev/null || echo 0)
fd=$(openstack flavor show "$FLAVOR" -f value -c disk 2>/dev/null || echo 0)
if [ "${fr:-0}" -ge "${mr:-512}" ] && [ "${fd:-0}" -ge "${md:-3}" ]; then
  ok "$FLAVOR = ${fr}MB/${fd}GB"
else
  no "$FLAVOR (${fr}MB/${fd}GB) does not satisfy the image. m1.nano/micro/tiny all have 1GB disk and CANNOT boot it."
fi

echo "=== 3. per-slot quota ==="
low=0; tot=0
for p in $(openstack project list -f value -c Name | grep -E '^student-[0-9]+$' | sort); do
  tot=$((tot+1))
  q=$(openstack quota show "$p" 2>/dev/null | awk '/\| ram /{print $4}')
  [ "${q:-0}" -lt "${fr:-512}" ] 2>/dev/null && low=$((low+1))
done
[ "$low" -eq 0 ] && ok "all $tot slots have ram quota >= ${fr}MB" \
  || no "$low of $tot slots still below ${fr}MB -- those students get a quota error. Run ensure-sprint-ready.sh"

echo "=== 4. capacity for a class of $CLASS ==="
free=$(openstack hypervisor stats show -f value -c free_ram_mb 2>/dev/null || echo 0)
fits=$((free / ${fr:-512}))
if [ "$fits" -ge "$CLASS" ]; then ok "nova reports ${free}MB free -> ~$fits instances, class of $CLASS fits"
else no "only ~$fits instances fit (${free}MB free) but class is $CLASS. Grow the DevStack VM -- see the runbook."; fi

echo "=== 5. networks: which are actually bootable ==="
for n in shared lab-net public; do
  ext=$(openstack network show "$n" -f value -c router:external 2>/dev/null)
  shr=$(openstack network show "$n" -f value -c shared 2>/dev/null)
  case "$n" in
    shared)  [ "$shr" = True ] && ok "'shared' is shared -- THIS is the network the sprint uses" \
                               || no "'shared' is not shared; peer projects cannot attach" ;;
    lab-net) [ -n "$ext" ] && wa "'lab-net' exists and is a DECOY (subnet created --no-dhcp): a server attaches and gets NO address. Tell students not to use it." ;;
    public)  [ "$ext" = True ] && wa "'public' is external: visible to every project but NOT attachable. Booting onto it fails LATE with 'Failed to allocate the network(s)' and the instance cannot be rebooted." ;;
  esac
done

echo "=== 6. console access (the shell path -- there is no data plane from lab containers) ==="
if ss -lnt 2>/dev/null | grep -q ':6080'; then ok "novnc listening on :6080 -- 'openstack console url show <server>' will work"
else no "novnc is NOT listening on :6080. Students would have no way to get a shell on their VM."; fi

echo
echo "=== KNOWN TRAPS (not failures -- brief the class) ==="
echo "  - ICMP does not pass even with a correct icmp ingress rule; tcp does. Use nmap -Pn."
echo "  - Floating IPs are 172.24.4.0/24 (DevStack default) and are NOT routable off the VM host."
echo "    Peer verification must be VM->VM on 'shared', never via a floating IP."
echo "  - Ubuntu MINIMAL ships without curl/nmap/ping: labs must apt install them."
echo
echo "SUMMARY: $fail failure(s), $warn warning(s)"
exit $([ "$fail" -gt 0 ] && echo 1 || echo 0)
REMOTE
