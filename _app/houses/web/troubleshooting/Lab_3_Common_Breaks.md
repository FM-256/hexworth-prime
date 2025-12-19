# Lab 3 Troubleshooting Guide: Spanning Tree Protocol (STP)

This guide is your safety net. If your lab breaks, do not restart or rebuild. Every issue you encounter is a clue about how STP prevents loops and manages redundancy.

---

## 1. Wrong Switch Becomes Root Bridge

- Not setting priority on intended root switch
- Forgetting that lower MAC address wins when priorities are equal
- Setting priority on only one VLAN (PVST runs per-VLAN!)
- Distribution or Access switch becoming root (suboptimal paths)

**Symptom:** Traffic takes longer paths, blocked ports in unexpected locations.

**Verify with:** `show spanning-tree root`

The Root ID should show your Core switch, not a Distribution or Access switch.

**Fix:**
```
spanning-tree vlan 10 priority 4096
```

---

## 2. All Ports Forwarding (No Blocked Ports)

- STP disabled on one or more switches
- Redundant links not actually connected
- VLANs don't match across trunk (STP runs per-VLAN)
- Different STP modes on different switches

**Danger:** If redundant links exist and no ports are blocked, you WILL have a broadcast storm.

**Verify with:** `show spanning-tree blockedports`

With redundant links, you SHOULD see at least one blocked port.

---

## 3. STP Mode Mismatch

- Some switches running PVST+ while others run Rapid-PVST+
- Mixed MSTP and PVST+ environments
- Forgetting to configure `spanning-tree mode rapid-pvst` on all switches

**Symptom:** Slow convergence, unexpected port states, compatibility issues.

**Verify with:** `show spanning-tree summary`

Look for "Switch is in rapid-pvst mode" - ALL switches must match.

---

## 4. PortFast Enabled on Trunk Ports

- Applying PortFast to inter-switch links instead of just end devices
- Global PortFast default enabling it everywhere
- Creating temporary loops during switch additions

**Danger:** PortFast on trunk ports can cause temporary broadcast storms!

**Symptom:** Network instability when devices plug in, intermittent connectivity.

**Verify with:** `show spanning-tree interface Gi0/1 detail`

PortFast should only show on access ports to PCs/servers.

---

## 5. BPDU Guard Triggering Unexpectedly

- Legitimate switch connected to port with BPDU Guard
- Virtual machines sending BPDUs (bridge mode VMs)
- Hub or unmanaged switch between port and end device

**Symptom:** Port goes err-disabled, user loses connectivity.

**Message:**
```
%PM-4-ERR_DISABLE: bpduguard error detected on Fa0/1
```

**Verify with:** `show interfaces status err-disabled`

**Recover:**
```
interface Fa0/1
 shutdown
 no shutdown
```

---

## 6. Port Stuck in Blocking State

- STP correctly blocking but you expected forwarding
- Misunderstanding which ports should block
- Lower-priority path exists that you weren't aware of

**Reality check:** Blocked ports are NORMAL in redundant networks. That's STP working correctly.

**Understand why:** `show spanning-tree vlan 10`

The port with higher cost or worse port priority will block.

---

## 7. Slow Convergence (30-50 seconds)

- Running classic STP (802.1D) instead of Rapid-PVST+ (802.1w)
- PortFast not enabled on access ports
- Link type not recognized as point-to-point

**Symptom:** After link failure, network takes 30-50 seconds to reconverge instead of 1-6 seconds.

**Verify RSTP mode:** `show spanning-tree summary`

**Verify link type:** `show spanning-tree interface Gi0/1 detail`
Look for "Link type is point-to-point"

---

## 8. Topology Change Notifications (TCN) Flooding

- Device constantly connecting/disconnecting
- Flapping link (physical cable issue)
- PortFast not enabled (every PC plug-in triggers TCN)

**Symptom:** MAC address table constantly flushing, network slowdowns.

**Verify with:** `show spanning-tree detail | include changes`

High topology change count = instability somewhere.

---

## 9. Root Bridge Priority Not Taking Effect

- Forgetting that priority must be multiple of 4096
- System ID extension adding VLAN ID to priority
- Priority set but switch still has higher MAC than competitor

**Example:** Priority 4096 + VLAN 10 = actual priority 4106

**Verify with:** `show spanning-tree vlan 10`

Check "Bridge ID Priority" - includes sys-id-ext.

---

## 10. Redundant Link Not Providing Failover

- Link physically connected but trunk not configured
- VLAN not allowed on redundant trunk
- STP blocking correct port but no alternate available

**Test failover:**
1. Ping continuously: `ping -t 192.168.x.x`
2. Shutdown primary link: `interface Gi0/1` → `shutdown`
3. Watch for 3-6 second recovery (RSTP) or 30-50 seconds (STP)

If ping doesn't recover, check if redundant path exists and is properly configured.

---

## Recommended Troubleshooting Order

1. **Verify STP is enabled:** `show spanning-tree summary`
2. **Check root bridge:** `show spanning-tree root`
3. **Identify blocked ports:** `show spanning-tree blockedports`
4. **Verify per-VLAN topology:** `show spanning-tree vlan X`
5. **Check for err-disabled ports:** `show interfaces status err-disabled`
6. **Review topology changes:** `show spanning-tree detail | include changes`
7. **Test failover:** Shut primary link, verify traffic reroutes

---

## STP Port States Reference

| State | Receives BPDUs | Learns MACs | Forwards Data | Duration |
|-------|----------------|-------------|---------------|----------|
| Blocking | Yes | No | No | 20 sec (max age) |
| Listening | Yes | No | No | 15 sec (forward delay) |
| Learning | Yes | Yes | No | 15 sec (forward delay) |
| Forwarding | Yes | Yes | Yes | Stable state |
| Disabled | No | No | No | Admin disabled |

**RSTP States:** Discarding, Learning, Forwarding (much faster!)

---

## Quick Reference Commands

| Issue | Command |
|-------|---------|
| STP summary | `show spanning-tree summary` |
| Root bridge per VLAN | `show spanning-tree root` |
| Blocked ports | `show spanning-tree blockedports` |
| Port details | `show spanning-tree interface Gi0/1 detail` |
| Err-disabled | `show interfaces status err-disabled` |
| Topology changes | `show spanning-tree detail` |

---

**If you fix the problem without rebuilding the lab, you did it the right way.**
