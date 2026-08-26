#!/bin/bash
# @catalog what    audit whether every layer of the cloud restarts after a power cut
# @catalog run     bash _tools/openstack-bridge/restart-audit.sh   (on bc2)
# @catalog status  TOOL
# Would this platform come back on its own after a power cut? Checked, not assumed.
# Every layer has to survive independently: the VM must autostart, the services inside it must be
# enabled, the bridges on bc2 must be enabled, and bc1's containers must have a restart policy.
set -uo pipefail
V=192.168.122.62; K=~/openstack-stage1/stage1_key
echo "  === bc2: does the DevStack VM auto-start? ==="
printf "    libvirt autostart: "; sudo virsh dominfo openstack-stage1 2>/dev/null | awk -F: '/Autostart/{gsub(/ /,"",$2);print $2}'
printf "    libvirtd enabled : "; systemctl is-enabled libvirtd 2>/dev/null || echo "?"
echo "  === bc2: bridge services enabled at boot? ==="
for s in openstack-bridge openstack-api-bridge openstack-vnc-bridge; do
  printf "    %-24s enabled=%s active=%s\n" "$s" "$(systemctl is-enabled $s 2>/dev/null || echo no)" "$(systemctl is-active $s 2>/dev/null || echo no)"
done
echo "  === inside the VM: OpenStack services enabled? ==="
ssh -i "$K" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$V" '
  tot=$(systemctl list-unit-files "devstack@*" --no-legend 2>/dev/null | wc -l)
  en=$(systemctl list-unit-files "devstack@*" --no-legend 2>/dev/null | grep -c enabled)
  echo "    devstack units: $tot total, $en enabled at boot"
  systemctl list-unit-files "devstack@*" --no-legend 2>/dev/null | grep -v enabled | head -5 | sed "s/^/      NOT ENABLED: /"
  printf "    apache2 enabled: %s\n" "$(systemctl is-enabled apache2 2>/dev/null)"
  printf "    guest resume of student instances: %s\n" "$(grep -c "^resume_guests_state_on_host_boot *= *[Tt]rue" /etc/nova/nova-cpu.conf 2>/dev/null)"
' 2>&1 | tail -12
