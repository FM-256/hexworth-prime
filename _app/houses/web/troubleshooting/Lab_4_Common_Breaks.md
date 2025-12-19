# Lab 4 Troubleshooting Guide: OSPF Dynamic Routing

This guide is your safety net. If your lab breaks, do not restart or rebuild. Every issue you encounter is a clue about how OSPF forms neighbors and calculates routes.

---

## 1. OSPF Neighbors Stuck in INIT State

- Mismatched area IDs on each side of the link
- ACL blocking OSPF (multicast 224.0.0.5 and 224.0.0.6)
- Only one side sending hellos (check both routers)
- MTU mismatch preventing DBD exchange

**Symptom:** `show ip ospf neighbor` shows INIT instead of FULL.

**Verify with:** `show ip ospf interface Gi0/1`

Both sides MUST have matching: Area ID, Hello/Dead timers, Network type.

---

## 2. No OSPF Neighbors Forming At All

- OSPF process not started (`router ospf 1` missing)
- Interface not included in `network` statement
- Interface is passive (no hellos sent)
- Wrong wildcard mask in network statement

**Verify with:** `show ip ospf interface brief`

If interface not listed, OSPF isn't running on it.

**Common mistake:**
```
network 10.0.2.0 255.255.255.252 area 10   ! WRONG - subnet mask
network 10.0.2.0 0.0.0.3 area 10           ! CORRECT - wildcard mask
```

---

## 3. Passive Interface Blocking Neighbor Formation

- Setting infrastructure link as passive
- Using `passive-interface default` and forgetting to exclude uplinks
- Confusing passive-interface with `no network` statement

**Symptom:** Route is advertised but no neighbor forms on that interface.

**Verify with:** `show ip ospf interface Gi0/1 | include Passive`

"No Hellos (Passive interface)" means this interface won't form neighbors.

**Fix:**
```
router ospf 1
 no passive-interface GigabitEthernet0/1
```

---

## 4. Area ID Mismatch

- Core switch in Area 0, Distribution switch in Area 10, but link configured wrong
- Forgetting that ABR interfaces must be in correct areas
- Using area 0.0.0.0 vs area 0 (same thing, but confusing)

**Symptom:** Neighbors stuck in INIT or never form.

**Verify with:** `show ip ospf interface Gi0/1`

Both routers must show same Area ID for the connecting interface.

---

## 5. Missing Router ID

- No loopback interface configured
- Multiple OSPF processes with conflicting Router IDs
- Router ID changes after OSPF restart (not immediately)

**Symptom:** Unpredictable OSPF behavior, log messages about Router ID conflicts.

**Verify with:** `show ip ospf`

Check "Routing Process ospf 1 with ID X.X.X.X"

**Best practice - always set explicitly:**
```
router ospf 1
 router-id 1.1.1.1
```

---

## 6. Reference Bandwidth Mismatch

- Core switches set to 10000, Distribution switches left at default 100
- Inconsistent cost calculations across network
- Suboptimal path selection

**Symptom:** Traffic takes unexpected paths, metrics don't match expectations.

**Verify with:** `show ip ospf | include Reference`

ALL OSPF routers MUST use same reference bandwidth.

**Warning message you might see:**
```
%OSPF-5-ADJCHG: Reference bandwidth mismatch with neighbor
```

---

## 7. OSPF Routes Not Appearing in Routing Table

- Network statement doesn't match interface IP
- Area 0 not contiguous (non-backbone areas can't reach each other)
- Route filtering configured somewhere
- ABR not summarizing correctly

**Verify with:** `show ip route ospf`

Missing routes? Check:
1. Is the network being advertised? `show ip ospf database`
2. Is there a path to Area 0?
3. Are there any route filters? `show ip protocols`

---

## 8. Wildcard Mask Errors

- Using subnet mask instead of wildcard mask
- Wildcard mask too broad (matching wrong networks)
- Wildcard mask too narrow (not matching intended network)

**Wildcard mask = inverse of subnet mask**

| Subnet Mask | Wildcard Mask |
|-------------|---------------|
| 255.255.255.252 (/30) | 0.0.0.3 |
| 255.255.255.0 (/24) | 0.0.0.255 |
| 255.255.0.0 (/16) | 0.0.255.255 |

**Verify with:** `show run | section router ospf`

---

## 9. Static Routes Conflicting with OSPF

- Forgot to remove static routes from Lab 1
- Static routes (AD 1) override OSPF routes (AD 110)
- Default route pointing wrong direction

**Symptom:** OSPF configured correctly but traffic still using old static route.

**Verify with:** `show ip route`

"S" (static) routes will be preferred over "O" (OSPF) routes.

**Remove conflicting static routes:**
```
no ip route 192.168.10.0 255.255.255.0 10.0.2.2
```

---

## 10. Network Type Mismatch

- Point-to-point link configured as broadcast (DR/BDR election)
- Broadcast network configured as point-to-point
- NBMA issues in frame-relay scenarios

**Symptom:** DR/BDR election on point-to-point links (unnecessary), slow convergence.

**Verify with:** `show ip ospf interface Gi0/1`

For router-to-router links: "Network Type POINT_TO_POINT" is optimal.

**Fix:**
```
interface Gi0/1
 ip ospf network point-to-point
```

---

## Recommended Troubleshooting Order

1. **Verify OSPF process:** `show ip ospf`
2. **Check interface participation:** `show ip ospf interface brief`
3. **Verify neighbor state:** `show ip ospf neighbor`
4. **Check database for routes:** `show ip ospf database`
5. **Verify routing table:** `show ip route ospf`
6. **Check for passive interfaces:** `show ip protocols`
7. **Compare area IDs on both sides:** `show ip ospf interface Gi0/1`

---

## OSPF Neighbor States

| State | Meaning |
|-------|---------|
| Down | No hellos received |
| Init | Hello received, but neighbor hasn't seen us |
| 2-Way | Bidirectional communication established |
| ExStart | Master/slave negotiation |
| Exchange | DBD packets exchanged |
| Loading | LSR/LSU exchange |
| **Full** | Fully adjacent, databases synchronized |

**Goal:** All neighbors should reach FULL state.

---

## OSPF Route Codes

| Code | Meaning |
|------|---------|
| O | OSPF intra-area (same area) |
| O IA | OSPF inter-area (from different area via ABR) |
| O E1 | OSPF external type 1 (metric increases) |
| O E2 | OSPF external type 2 (metric fixed) |
| O N1 | OSPF NSSA external type 1 |
| O N2 | OSPF NSSA external type 2 |

---

## Quick Reference Commands

| Issue | Command |
|-------|---------|
| OSPF process status | `show ip ospf` |
| Interface participation | `show ip ospf interface brief` |
| Neighbor status | `show ip ospf neighbor` |
| Full neighbor details | `show ip ospf neighbor detail` |
| OSPF database | `show ip ospf database` |
| OSPF routes only | `show ip route ospf` |
| Routing protocols | `show ip protocols` |

---

**If you fix the problem without rebuilding the lab, you did it the right way.**
