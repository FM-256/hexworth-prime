# Lab 5: Add EIGRP + Redistribution

**Prepared by:** EQ6  
**Course:** Network Essentials  
**Lab Type:** Cumulative (builds on Lab 4)  
**Estimated Time:** 90-120 minutes  
**Difficulty:** Advanced

---

## ⚠️ IMPORTANT: Open Your Lab 4 File

**DO NOT START A NEW FILE!**

Open your completed Lab 4 Packet Tracer file (`lab04-yourname.pkt`). This lab adds EIGRP and redistribution to your existing OSPF network.

---

## Lab Objectives

By the end of this lab, you will be able to:

1. ✅ Add new network devices to existing topology
2. ✅ Configure EIGRP routing protocol
3. ✅ Implement bidirectional route redistribution between OSPF and EIGRP
4. ✅ Understand administrative distance and metric conversion
5. ✅ Verify multi-protocol network operation
6. ✅ Troubleshoot redistribution issues

---

## Topology Overview

### New Addition - Remote Branch

```
                [Edge-Router] (existing)
                      |
        +-------------+-------------+
        |                           |
   [OSPF Network]            [Remote-Router] (NEW)
   (Existing from Lab 4)            |
                              [Remote-Switch] (NEW)
                                    |
                              [Remote-PC1] [Remote-PC2] (NEW)
                           VLAN 50: 192.168.50.0/24
```

**What's New:**
- 1 Remote Router (1841 or 2911)
- 1 Remote Switch (2960)
- 2 Remote PCs

**Connection:**
- Edge-Router Gi0/2 → Remote-Router Gi0/0 (10.10.10.0/30)
- Remote-Router Gi0/1 → Remote-Switch Gi0/1
- Remote-PCs → Remote-Switch Fa0/1, Fa0/2

---

## IP Addressing Plan

### New Remote Branch Subnet

| Device | Interface | IP Address | Subnet Mask | Description |
|--------|-----------|------------|-------------|-------------|
| Edge-Router | Gi0/2 | 10.10.10.1 | 255.255.255.252 | WAN link to remote |
| Remote-Router | Gi0/0 | 10.10.10.2 | 255.255.255.252 | WAN link to HQ |
| Remote-Router | Gi0/1 | 192.168.50.1 | 255.255.255.0 | LAN gateway |
| Remote-PC1 | NIC | 192.168.50.10 | 255.255.255.0 | Workstation |
| Remote-PC2 | NIC | 192.168.50.11 | 255.255.255.0 | Workstation |

---

## Part 1: Review Current Network (Lab 4 State)

### Step 1.1: Verify OSPF is Working

On **Edge-Router**:
```
show ip ospf neighbor
```
Expected: Should see Core-SW1 and Core-SW2 as neighbors in FULL state.

```
show ip route ospf
```
Expected: Should see all internal networks (192.168.10.0/24, 20.0/24, 30.0/24, 40.0/24).

### Step 1.2: Test Connectivity

From **any PC in VLAN 10-40**, ping a PC in a different VLAN:
```
ping 192.168.20.10
```
Expected: Success (inter-VLAN routing via OSPF working).

### Step 1.3: Document Current State

Note down:
- Number of OSPF routes in routing table
- OSPF neighbor count
- Current network is all OSPF (no EIGRP yet)

---

## Part 2: Add Remote Branch Physical Devices

### Step 2.1: Add Remote-Router

1. Drag a **1841** or **2911** router onto workspace
2. Rename to `Remote-Router`
3. Power on (if not auto-powered)

### Step 2.2: Add Remote-Switch

1. Drag a **2960** switch onto workspace
2. Rename to `Remote-Switch`

### Step 2.3: Add Remote PCs

1. Drag 2 PCs onto workspace
2. Rename to `Remote-PC1` and `Remote-PC2`

### Step 2.4: Cable the Remote Branch

**Connections:**

1. **Edge-Router Gi0/2** → **Remote-Router Gi0/0** (Copper Straight-Through)
2. **Remote-Router Gi0/1** → **Remote-Switch Gi0/1** (Copper Straight-Through)
3. **Remote-Switch Fa0/1** → **Remote-PC1** (Copper Straight-Through)
4. **Remote-Switch Fa0/2** → **Remote-PC2** (Copper Straight-Through)

### Step 2.5: Verify Physical Connectivity

All link lights should turn green within 30-60 seconds.

---

## Part 3: Configure IP Addresses

### Step 3.1: Configure Edge-Router New Interface

On **Edge-Router**:
```
configure terminal
interface GigabitEthernet0/2
 description WAN Link to Remote Branch
 ip address 10.10.10.1 255.255.255.252
 no shutdown
 exit
```

### Step 3.2: Configure Remote-Router Interfaces

On **Remote-Router**:
```
configure terminal

! WAN interface to HQ
interface GigabitEthernet0/0
 description WAN Link to HQ Edge-Router
 ip address 10.10.10.2 255.255.255.252
 no shutdown
 exit

! LAN interface
interface GigabitEthernet0/1
 description LAN to Remote-Switch
 ip address 192.168.50.1 255.255.255.0
 no shutdown
 exit

! Set hostname
hostname Remote-Router
```

### Step 3.3: Configure Remote-Switch

On **Remote-Switch**:
```
configure terminal
hostname Remote-Switch

! Create VLAN 50
vlan 50
 name Remote_Branch
 exit

! Configure access ports for PCs
interface range FastEthernet0/1 - 2
 switchport mode access
 switchport access vlan 50
 spanning-tree portfast
 no shutdown
 exit

! Configure uplink to router
interface GigabitEthernet0/1
 no switchport
 no shutdown
 exit
```

**Note:** If switch doesn't support `no switchport`, it's Layer 2 only. Leave as default VLAN 1 (Remote-Router interface directly handles Layer 3).

### Step 3.4: Configure Remote PCs

**Remote-PC1:**
- IP Address: `192.168.50.10`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.50.1`

**Remote-PC2:**
- IP Address: `192.168.50.11`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.50.1`

### Step 3.5: Test Local Connectivity

From **Remote-PC1**:
```
ping 192.168.50.1
```
Expected: Success (can reach local gateway).

```
ping 192.168.50.11
```
Expected: Success (can reach Remote-PC2).

```
ping 192.168.10.10
```
Expected: **Failure** (no routing configured yet between branches).

---

## Part 4: Configure EIGRP on Remote Branch

### Step 4.1: Enable EIGRP on Remote-Router

On **Remote-Router**:
```
configure terminal
router eigrp 100
 
 ! Advertise local LAN
 network 192.168.50.0 0.0.0.255
 
 ! Advertise WAN link to HQ
 network 10.10.10.0 0.0.0.3
 
 ! Disable auto-summary (best practice)
 no auto-summary
 
 ! Set Router ID
 eigrp router-id 1.1.50.50
 exit
```

### Step 4.2: Enable EIGRP on Edge-Router

On **Edge-Router**:
```
configure terminal
router eigrp 100
 
 ! Advertise WAN link to Remote
 network 10.10.10.0 0.0.0.3
 
 ! Disable auto-summary
 no auto-summary
 
 ! Set Router ID
 eigrp router-id 1.1.1.1
 exit
```

### Step 4.3: Verify EIGRP Neighbor Relationship

On **Edge-Router**:
```
show ip eigrp neighbors
```

Expected output:
```
H   Address         Interface   Hold  Uptime    SRTT   RTO   Q   Seq
                                (sec)           (ms)        Cnt  Num
0   10.10.10.2      Gi0/2       14    00:00:15  1      200   0   3
```

On **Remote-Router**:
```
show ip eigrp neighbors
```

Expected: Should see Edge-Router (10.10.10.1) as neighbor.

### Step 4.4: Verify EIGRP Topology

On **Remote-Router**:
```
show ip eigrp topology
```

Expected: Should see 192.168.50.0/24 as directly connected.

On **Edge-Router**:
```
show ip eigrp topology
```

Expected: Should see 10.10.10.0/30 and 192.168.50.0/24.

### Step 4.5: Check Routing Table

On **Remote-Router**:
```
show ip route
```

Notice:
- C (connected): 192.168.50.0/24, 10.10.10.0/30
- **NO OSPF routes yet!** (no redistribution configured)

From **Remote-PC1**, try ping to HQ:
```
ping 192.168.10.10
```
Expected: **Still fails** (Remote-Router doesn't know about OSPF networks).

---

## Part 5: Configure Route Redistribution

### Step 5.1: Redistribute EIGRP into OSPF

On **Edge-Router**:
```
configure terminal
router ospf 1
 
 ! Redistribute EIGRP routes into OSPF
 redistribute eigrp 100 subnets
 
 ! Set default metric (optional, OSPF uses 20 if not specified)
 default-metric 100
 exit
```

**What this does:**
- Tells OSPF to advertise EIGRP-learned routes (192.168.50.0/24)
- Uses "subnets" keyword to include all subnet masks (not just classful)

### Step 5.2: Redistribute OSPF into EIGRP

On **Edge-Router**:
```
configure terminal
router eigrp 100
 
 ! Redistribute OSPF routes into EIGRP
 ! Must provide metric (BW, Delay, Reliability, Load, MTU)
 redistribute ospf 1 metric 10000 100 255 1 1500
 exit
```

**Metric explained:**
- 10000 = Bandwidth in Kbps (10 Mbps)
- 100 = Delay in tens of microseconds
- 255 = Reliability (255/255 = 100%)
- 1 = Load (1/255 = minimal load)
- 1500 = MTU in bytes

### Step 5.3: Verify Redistribution on Edge-Router

```
show ip route
```

Expected:
- O (OSPF routes): 192.168.10.0/24, 20.0/24, 30.0/24, 40.0/24
- D (EIGRP routes): 192.168.50.0/24
- C (Connected): All local interfaces

```
show ip protocols
```

Should show:
- OSPF redistributing EIGRP
- EIGRP redistributing OSPF

### Step 5.4: Verify Redistribution on Core Switches

On **Core-SW1**:
```
show ip route ospf
```

Expected to see:
- O (OSPF internal routes)
- **O E2** 192.168.50.0/24 (OSPF External Type 2 - redistributed from EIGRP!)

**E2 explained:** External Type 2 means the metric doesn't increase as the route propagates through OSPF (stays at configured cost).

### Step 5.5: Verify Redistribution on Remote-Router

On **Remote-Router**:
```
show ip route eigrp
```

Expected:
```
D EX 192.168.10.0/24 [170/...] via 10.10.10.1
D EX 192.168.20.0/24 [170/...] via 10.10.10.1
D EX 192.168.30.0/24 [170/...] via 10.10.10.1
D EX 192.168.40.0/24 [170/...] via 10.10.10.1
```

**D EX explained:** EIGRP External (redistributed from OSPF).
**[170/...]:** Administrative Distance 170 (external EIGRP) / Metric.

---

## Part 6: Test End-to-End Connectivity

### Step 6.1: Ping from Remote Branch to HQ

From **Remote-PC1** (192.168.50.10):
```
ping 192.168.10.10
```
Expected: **Success!** (Packets route: Remote-PC1 → Remote-Router [EIGRP] → Edge-Router [redistribution] → Core/Dist switches [OSPF] → VLAN 10 PC)

```
ping 192.168.20.10
ping 192.168.30.10
ping 192.168.40.10
```
Expected: All succeed.

### Step 6.2: Ping from HQ to Remote Branch

From **VLAN 10 PC** (192.168.10.10):
```
ping 192.168.50.10
```
Expected: **Success!** (Packets route back via redistribution)

### Step 6.3: Traceroute to See Path

From **Remote-PC1**:
```
tracert 192.168.10.10
```

Expected path:
1. 192.168.50.1 (Remote-Router)
2. 10.10.10.1 (Edge-Router)
3. [Core/Dist hops via OSPF]
4. 192.168.10.10 (destination)

**Key observation:** Crosses EIGRP → OSPF boundary at Edge-Router!

---

## Part 7: Analyze Administrative Distance

### Step 7.1: Understand Administrative Distance (AD)

**AD determines which route to trust when multiple routing protocols advertise the same destination.**

| Route Source | AD |
|--------------|-----|
| Connected | 0 |
| Static | 1 |
| EIGRP (internal) | 90 |
| OSPF | 110 |
| RIP | 120 |
| EIGRP (external) | 170 |

**Lower AD wins!**

### Step 7.2: Observe AD in Routing Table

On **Edge-Router**:
```
show ip route 192.168.50.0
```

Expected:
```
D    192.168.50.0/24 [90/...] via 10.10.10.2, GigabitEthernet0/2
```

**[90/...] = AD 90** (EIGRP internal) because Edge-Router learned it directly via EIGRP.

On **Core-SW1**:
```
show ip route 192.168.50.0
```

Expected:
```
O E2 192.168.50.0/24 [110/100] via 10.0.1.1, ...
```

**[110/100] = AD 110** (OSPF) because Core-SW1 learned it via OSPF redistribution.

### Step 7.3: What If Both Protocols Advertised Same Route?

**Hypothetical:** If both OSPF and EIGRP advertised 192.168.10.0/24 to the same router:
- EIGRP (AD 90) would win
- Router installs EIGRP route, ignores OSPF route
- This is why AD is critical in redistribution scenarios!

---

## Part 8: Compare Metrics

### Step 8.1: EIGRP Metric

On **Remote-Router**:
```
show ip eigrp topology 192.168.10.0/24
```

Expected output shows EIGRP metric (composite: bandwidth + delay).

### Step 8.2: OSPF Metric

On **Core-SW1**:
```
show ip route 192.168.10.0
```

Expected output shows OSPF cost (based on bandwidth).

**Key Insight:**
- EIGRP and OSPF calculate metrics differently
- Redistribution requires **metric conversion**
- You specified metric during redistribution: `metric 10000 100 255 1 1500`
- Edge-Router translates between the two metric systems

---

## Part 9: Optional - Implement Route Filtering

### Step 9.1: Why Filter?

In production networks, you might NOT want to redistribute ALL routes. Examples:
- Don't advertise test networks
- Don't advertise management VLANs
- Prevent routing loops from mutual redistribution

### Step 9.2: Create Access List

On **Edge-Router**:
```
configure terminal

! Block 192.168.40.0/24 (Management VLAN) from being redistributed to EIGRP
access-list 10 deny 192.168.40.0 0.0.0.255
access-list 10 permit any

router eigrp 100
 ! Apply filter to OSPF redistribution
 distribute-list 10 out ospf 1
 exit
```

### Step 9.3: Verify Filtering

On **Remote-Router**:
```
show ip route eigrp
```

Expected: 192.168.10.0/24, 20.0/24, 30.0/24 present, but **192.168.40.0/24 missing** (filtered).

From **Remote-PC1**, try ping:
```
ping 192.168.40.10
```
Expected: **Fails** (route not advertised to remote branch).

### Step 9.4: Remove Filter (for lab completion)

On **Edge-Router**:
```
configure terminal
router eigrp 100
 no distribute-list 10 out ospf 1
 exit
no access-list 10
```

This restores full connectivity.

---

## Part 10: Verification Checklist

✅ **EIGRP neighbor relationship formed:**
   ```
   show ip eigrp neighbors
   ```

✅ **Routes redistributed into OSPF:**
   ```
   show ip route ospf | include E2
   ```

✅ **Routes redistributed into EIGRP:**
   ```
   show ip route eigrp | include EX
   ```

✅ **End-to-end connectivity:**
   - Remote-PC1 can ping all HQ VLANs
   - HQ PCs can ping Remote Branch

✅ **Administrative Distance correct:**
   - EIGRP internal: AD 90
   - OSPF: AD 110
   - EIGRP external: AD 170

✅ **No routing loops** (ping doesn't timeout infinitely)

---

## Part 11: Troubleshooting Scenarios

### Problem 1: Remote-PC1 cannot ping HQ

**Diagnose:**
1. Can Remote-PC1 ping its gateway (192.168.50.1)? → If no, check PC config/switch ports
2. Can Remote-Router ping Edge-Router (10.10.10.1)? → If no, check WAN link
3. Is EIGRP neighbor up? `show ip eigrp neighbors` → If no, check EIGRP config
4. Does Remote-Router have routes to HQ? `show ip route eigrp` → If no, check redistribution on Edge-Router
5. Does Edge-Router redistribute OSPF into EIGRP? `show run | section router eigrp` → Should see `redistribute ospf 1`

### Problem 2: HQ PCs cannot ping Remote Branch

**Diagnose:**
1. Does Core-SW1 have route to 192.168.50.0/24? `show ip route 192.168.50.0` → If no, check redistribution on Edge-Router
2. Does Edge-Router redistribute EIGRP into OSPF? `show run | section router ospf` → Should see `redistribute eigrp 100 subnets`
3. Check OSPF neighbors: `show ip ospf neighbor` → All should be FULL

### Problem 3: Routes appear but connectivity fails

**Check:**
- ACLs blocking traffic? `show access-lists`
- NAT interfering? `show ip nat translations`
- Firewall on PCs blocking ICMP?
- Incorrect default gateway on PCs?

### Problem 4: Routing loop (ping never completes)

**Cause:** Misconfigured redistribution can cause loops (OSPF → EIGRP → OSPF → etc.)

**Fix:**
- Use route tags during redistribution
- Implement route filtering
- Check that you're not redistributing back into source protocol

---

## Part 12: Reflection Questions

1. **Why use EIGRP for the remote branch instead of OSPF?**
   - Possible answer: Simplicity, faster convergence, less overhead for small branch

2. **What would happen if you didn't specify a metric during EIGRP redistribution?**
   - Answer: Redistribution would fail. EIGRP requires explicit metric (unlike OSPF which uses default).

3. **Why does redistributed EIGRP route show as "O E2" in OSPF?**
   - Answer: "E2" means External Type 2 - redistributed from another protocol. Metric doesn't increase within OSPF domain.

4. **What is the purpose of Administrative Distance in this scenario?**
   - Answer: Prevents conflicts if both OSPF and EIGRP advertise the same route. Lower AD (EIGRP internal = 90) wins.

5. **What are the risks of mutual redistribution (OSPF ↔ EIGRP)?**
   - Answer: Routing loops, suboptimal routing, route flapping. Requires careful planning and filtering.

---

## Part 13: Save Your Work

```
! On ALL routers and switches
copy running-config startup-config
```

Or in Packet Tracer: **File → Save As → lab05-yourname.pkt**

---

## Part 14: Preview of Lab 6

In Lab 6, you'll add:
- **HSRP** (Hot Standby Router Protocol) for gateway redundancy
- **DHCP** server for automatic IP assignment
- **ACLs** (Access Control Lists) for security
- **SNMP** for monitoring

This will complete your enterprise network with all production features!

---

## Summary

**What You Accomplished:**
✅ Added remote branch with EIGRP
✅ Configured bidirectional route redistribution
✅ Learned about Administrative Distance
✅ Verified multi-protocol network operation
✅ Implemented route filtering (optional)

**Key Concepts:**
- **EIGRP:** Advanced distance-vector protocol with fast convergence
- **Redistribution:** Sharing routes between routing protocols
- **Metric Conversion:** Translating between OSPF cost and EIGRP composite metric
- **Administrative Distance:** Tie-breaker when multiple protocols advertise same route

**Real-World Application:**
This lab simulates a common enterprise scenario:
- Headquarters runs OSPF (standard, multi-vendor support)
- Remote branch runs EIGRP (simpler, all-Cisco)
- Edge router bridges the two protocols via redistribution

---

**Congratulations on completing Lab 5!**

You now have a sophisticated multi-protocol network with OSPF, EIGRP, VLANs, STP, and route redistribution. One more lab to go!

**Prepared by:** EQ6  
**Lab Version:** 1.0  
**Date:** 2025-12-01

