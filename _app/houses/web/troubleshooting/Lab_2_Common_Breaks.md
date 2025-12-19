# Lab 2 Troubleshooting Guide: VLANs and Trunking

This guide is your safety net. If your lab breaks, do not restart or rebuild. Every issue you encounter is a clue about how VLANs segment networks and how trunks carry multiple VLANs.

---

## 1. VLAN Not Created on All Switches

- Assuming VLANs propagate automatically (they don't without VTP)
- Creating VLAN on one switch but forgetting others
- Typos in VLAN ID (VLAN 10 vs VLAN 100)
- VLAN database not saved after creation

**Reality check:** If a VLAN doesn't exist on a switch, traffic for that VLAN is dropped silently.

**Verify with:** `show vlan brief`

Every switch in the path must have the VLAN defined.

---

## 2. Access Port Not Assigned to Correct VLAN

- Port left in default VLAN 1
- Wrong VLAN ID in `switchport access vlan X` command
- Forgetting to issue `switchport mode access` first
- Interface still in trunk mode from previous config

**Symptom:** PC has correct IP but cannot reach gateway.

**Verify with:** `show interfaces Fa0/1 switchport`

Look for "Access Mode VLAN" - it must match the PC's intended VLAN.

---

## 3. Trunk Not Forming Between Switches

- Only configuring trunk on one side (MUST be both sides)
- Native VLAN mismatch between switches
- Forgetting `switchport trunk encapsulation dot1q` on Layer 3 switches
- DTP negotiation failing (use `switchport mode trunk` explicitly)

**Verify with:** `show interfaces trunk`

Both sides must show the interface as "trunking" with matching native VLAN.

---

## 4. Native VLAN Mismatch

- Using different native VLANs on each end of trunk
- Leaving one side as VLAN 1 (default) while other is VLAN 99
- CDP warning message ignored

**Message you'll see:**
```
%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered
```

**This is NOT just a warning - traffic WILL be affected.**

**Fix:** Both sides must use the same native VLAN:
```
switchport trunk native vlan 99
```

---

## 5. VLAN Not Allowed on Trunk

- Using `switchport trunk allowed vlan 10,20` and forgetting a VLAN
- Using `allowed vlan` instead of `allowed vlan add` (overwrites list!)
- Forgetting to add native VLAN to allowed list

**Verify with:** `show interfaces trunk`

Check "Vlans allowed on trunk" - missing VLANs = no traffic for that VLAN.

**Safe way to add VLANs:**
```
switchport trunk allowed vlan add 30
```

---

## 6. SVI (VLAN Interface) Not Created or Down

- Forgetting to create `interface Vlan10` on Layer 3 switch
- SVI created but IP address not assigned
- SVI left administratively down (missing `no shutdown`)
- VLAN doesn't exist in VLAN database (SVI stays down)

**Symptom:** PCs in VLAN have connectivity to each other but not to other VLANs.

**Verify with:** `show ip interface brief | include Vlan`

SVI must show "up" and "up" with valid IP address.

---

## 7. PC Default Gateway Mismatch

- PC gateway doesn't match SVI IP address
- Gateway IP in wrong subnet
- Old gateway from Lab 1 not updated for new VLAN design

**Critical:** The PC's default gateway MUST exactly match the SVI IP for its VLAN.

**Example:** VLAN 10 SVI is 192.168.10.1 → PC gateway MUST be 192.168.10.1

---

## 8. Inter-VLAN Routing Not Enabled

- Forgetting `ip routing` on Layer 3 switch
- Assuming Layer 2 switch can route (it cannot)
- Static routes from Lab 1 conflicting with new SVI design

**Verify with:** `show ip route`

Should see "C" (connected) entries for each VLAN SVI network.

---

## 9. Trunk Encapsulation Missing on L3 Switch

- Layer 3 switches require explicit encapsulation before trunk mode
- Command order matters: encapsulation THEN mode trunk
- Layer 2 switches auto-negotiate but L3 switches don't

**Correct order on Layer 3 switch:**
```
interface Gi0/1
 switchport trunk encapsulation dot1q
 switchport mode trunk
```

---

## 10. PortFast Missing on Access Ports

- Access ports take 30-50 seconds to forward traffic (STP learning)
- Students think port is broken because ping fails initially
- Not a "break" but causes confusion during testing

**Symptom:** PC takes 30+ seconds to get network connectivity after plugging in.

**Fix:**
```
interface Fa0/1
 spanning-tree portfast
```

---

## Recommended Troubleshooting Order

1. **Verify VLAN exists:** `show vlan brief`
2. **Check port assignment:** `show interfaces Fa0/1 switchport`
3. **Verify trunk status:** `show interfaces trunk`
4. **Check native VLAN match:** Compare both trunk endpoints
5. **Verify SVI status:** `show ip interface brief | include Vlan`
6. **Confirm routing enabled:** `show ip route`
7. **Test default gateway:** Ping gateway from PC first

---

## Quick Reference Commands

| Issue | Command |
|-------|---------|
| VLAN existence | `show vlan brief` |
| Port mode/VLAN | `show interfaces switchport` |
| Trunk status | `show interfaces trunk` |
| SVI status | `show ip interface brief` |
| Routing table | `show ip route` |
| MAC table | `show mac address-table` |

---

**If you fix the problem without rebuilding the lab, you did it the right way.**
