# Lab 4: Replace Static Routes with OSPF

**Prepared by:** EQ6
**Course:** Network Essentials
**Estimated Time:** 120 minutes
**Difficulty:** Intermediate
**Prerequisites:** Completion of Labs 1-3 (Static Routes, VLANs, STP)

---

## 📋 **Lab Objectives**

By the end of this lab, you will be able to:
- ✅ Remove static routes and implement dynamic routing with OSPF
- ✅ Configure OSPF multi-area design (Areas 0, 10, 20)
- ✅ Use loopback interfaces as OSPF Router IDs
- ✅ Configure OSPF cost metrics with reference bandwidth
- ✅ Implement passive interfaces for security
- ✅ Verify OSPF neighbor adjacencies and Full state
- ✅ Analyze OSPF routing tables (O and O IA routes)
- ✅ Test OSPF reconvergence during link failures
- ✅ Troubleshoot OSPF neighbor adjacency issues

---

## 🏗️ **Network Topology**

### **Topology Diagram:**
```
                    [Internet - Simulated]
                           |
                     [Edge-Router]
                      (1.1.1.1)
                      Area 0
                           |
                  10.0.0.0/30 (P2P)
                           |
        +------------------+------------------+
        |                                     |
   [Core-SW1]                            [Core-SW2]
   (1.1.2.2)                              (1.1.3.3)
    Area 0                                 Area 0
        |                                     |
    +---+---+                             +---+---+
    |       |                             |       |
[Dist-SW1][Dist-SW2]               [Dist-SW3][Dist-SW4]
(1.1.4.4) (1.1.5.5)                (1.1.6.6) (1.1.7.7)
 Area 10   Area 10                 Area 20   Area 20
    |       |                             |       |
[Acc-SW1][Acc-SW2]                  [Acc-SW3][Acc-SW4]
    |       |                             |       |
  PC1-2   PC3-4                        Server1-2  Server3-4
```

### **OSPF Area Design:**
- **Area 0 (Backbone):** Edge-Router, Core-SW1, Core-SW2
- **Area 10:** Dist-SW1, Dist-SW2, Access-SW1, Access-SW2
- **Area 20:** Dist-SW3, Dist-SW4, Access-SW3, Access-SW4

---

## 📦 **Required Equipment**

### **What You Need:**
- ✅ **Completed Lab 3 Packet Tracer file** (with VLANs and STP configured)
- ✅ Same 12-device topology from previous labs

**IMPORTANT:** This lab is **INCREMENTAL**. Do NOT start from scratch. Open your completed Lab 3 file and build on it.

---

## 🔢 **OSPF Design Summary**

### **Area Assignments:**
| Device | OSPF Area | Router ID | Role |
|--------|-----------|-----------|------|
| Edge-Router | 0 | 1.1.1.1 | ABR (Area Border Router) |
| Core-SW1 | 0 | 1.1.2.2 | ABR |
| Core-SW2 | 0 | 1.1.3.3 | ABR |
| Dist-SW1 | 10 | 1.1.4.4 | Internal Router |
| Dist-SW2 | 10 | 1.1.5.5 | Internal Router |
| Dist-SW3 | 20 | 1.1.6.6 | Internal Router |
| Dist-SW4 | 20 | 1.1.7.7 | Internal Router |

### **OSPF Process Configuration:**
- **Process ID:** 1 (locally significant)
- **Reference Bandwidth:** 10000 (10 Gbps for accurate cost calculation)
- **Router IDs:** Use existing Loopback0 addresses
- **Network Type:** Point-to-Point on all routed links

### **Passive Interface Strategy:**
- User-facing VLANs (10, 20, 30, 40) will be passive
- Only infrastructure links will actively exchange OSPF hellos

---

## 📝 **Part 1: Document Current Static Routes**

Before removing static routes, let's document what we have.

### **Step 1: Capture Current Routing Tables**

On **Edge-Router:**
```cisco
Edge-Router# show ip route static
```

**Document the output** - you'll compare this with OSPF routes later.

**Expected to see:**
```
S     192.168.10.0/24 [1/0] via 10.0.0.2
S     192.168.20.0/24 [1/0] via 10.0.0.2
S     192.168.30.0/24 [1/0] via 10.0.1.2
S     192.168.40.0/24 [1/0] via 10.0.1.2
```

### **Step 2: Test Current Connectivity**

From **PC1**, verify baseline connectivity:
```
ping 192.168.20.10
ping 192.168.30.10
ping 192.168.40.10
```

**Expected:** All pings should succeed with static routing.

---

## 🗑️ **Part 2: Remove All Static Routes**

Now we'll remove static routing to prepare for OSPF.

### **Edge-Router - Remove Static Routes:**

```cisco
Edge-Router> enable
Edge-Router# configure terminal
Edge-Router(config)# no ip route 192.168.10.0 255.255.255.0 10.0.0.2
Edge-Router(config)# no ip route 192.168.20.0 255.255.255.0 10.0.0.2
Edge-Router(config)# no ip route 192.168.30.0 255.255.255.0 10.0.1.2
Edge-Router(config)# no ip route 192.168.40.0 255.255.255.0 10.0.1.2
Edge-Router(config)# exit
```

### **Core-SW1 - Remove Static Routes:**

```cisco
Core-SW1> enable
Core-SW1# configure terminal
Core-SW1(config)# no ip route 192.168.10.0 255.255.255.0 10.0.2.2
Core-SW1(config)# no ip route 192.168.20.0 255.255.255.0 10.0.3.2
Core-SW1(config)# no ip route 192.168.30.0 255.255.255.0 10.0.0.1
Core-SW1(config)# no ip route 192.168.40.0 255.255.255.0 10.0.0.1
Core-SW1(config)# exit
```

### **Core-SW2 - Remove Static Routes:**

```cisco
Core-SW2> enable
Core-SW2# configure terminal
Core-SW2(config)# no ip route 192.168.10.0 255.255.255.0 10.0.1.1
Core-SW2(config)# no ip route 192.168.20.0 255.255.255.0 10.0.1.1
Core-SW2(config)# no ip route 192.168.30.0 255.255.255.0 10.0.4.2
Core-SW2(config)# no ip route 192.168.40.0 255.255.255.0 10.0.5.2
Core-SW2(config)# exit
```

### **Dist-SW1 - Remove Default Route:**

```cisco
Dist-SW1> enable
Dist-SW1# configure terminal
Dist-SW1(config)# no ip route 0.0.0.0 0.0.0.0 10.0.2.1
Dist-SW1(config)# exit
```

### **Dist-SW2 - Remove Default Route:**

```cisco
Dist-SW2> enable
Dist-SW2# configure terminal
Dist-SW2(config)# no ip route 0.0.0.0 0.0.0.0 10.0.3.1
Dist-SW2(config)# exit
```

### **Dist-SW3 - Remove Default Route:**

```cisco
Dist-SW3> enable
Dist-SW3# configure terminal
Dist-SW3(config)# no ip route 0.0.0.0 0.0.0.0 10.0.4.1
Dist-SW3(config)# exit
```

### **Dist-SW4 - Remove Default Route:**

```cisco
Dist-SW4> enable
Dist-SW4# configure terminal
Dist-SW4(config)# no ip route 0.0.0.0 0.0.0.0 10.0.5.1
Dist-SW4(config)# exit
```

### **Step 3: Verify Static Routes Are Gone**

On **Edge-Router:**
```cisco
Edge-Router# show ip route static
```

**Expected:** No output (all static routes removed)

### **Step 4: Test Connectivity Loss**

From **PC1:**
```
ping 192.168.30.10
```

**Expected:** Ping should FAIL. This is normal - we removed routing and haven't configured OSPF yet.

---

## ⚙️ **Part 3: Configure OSPF on Area 0 Devices**

### **Edge-Router OSPF Configuration:**

```cisco
Edge-Router> enable
Edge-Router# configure terminal

! Configure OSPF process
Edge-Router(config)# router ospf 1
Edge-Router(config-router)# router-id 1.1.1.1
Edge-Router(config-router)# auto-cost reference-bandwidth 10000
Edge-Router(config-router)# log-adjacency-changes

! Advertise networks in Area 0
Edge-Router(config-router)# network 1.1.1.1 0.0.0.0 area 0
Edge-Router(config-router)# network 10.0.0.0 0.0.0.3 area 0
Edge-Router(config-router)# network 10.0.1.0 0.0.0.3 area 0
Edge-Router(config-router)# exit

! Configure point-to-point network type on interfaces
Edge-Router(config)# interface GigabitEthernet0/0
Edge-Router(config-if)# ip ospf network point-to-point
Edge-Router(config-if)# exit

Edge-Router(config)# interface GigabitEthernet0/1
Edge-Router(config-if)# ip ospf network point-to-point
Edge-Router(config-if)# exit

Edge-Router(config)# exit
Edge-Router# copy running-config startup-config
```

**Configuration Explanation:**
- `router-id 1.1.1.1` - Uses loopback as stable Router ID
- `auto-cost reference-bandwidth 10000` - Sets reference to 10 Gbps
- `network 1.1.1.1 0.0.0.0 area 0` - Advertises loopback
- `network 10.0.0.0 0.0.0.3 area 0` - Advertises P2P link to Core-SW1
- `ip ospf network point-to-point` - Optimizes OSPF on P2P links

### **Core-SW1 OSPF Configuration:**

```cisco
Core-SW1> enable
Core-SW1# configure terminal

Core-SW1(config)# router ospf 1
Core-SW1(config-router)# router-id 1.1.2.2
Core-SW1(config-router)# auto-cost reference-bandwidth 10000
Core-SW1(config-router)# log-adjacency-changes

! Area 0 networks
Core-SW1(config-router)# network 1.1.2.2 0.0.0.0 area 0
Core-SW1(config-router)# network 10.0.0.0 0.0.0.3 area 0

! Area 10 networks (ABR configuration)
Core-SW1(config-router)# network 10.0.2.0 0.0.0.3 area 10
Core-SW1(config-router)# network 10.0.3.0 0.0.0.3 area 10
Core-SW1(config-router)# exit

! Configure point-to-point on all routed interfaces
Core-SW1(config)# interface GigabitEthernet0/1
Core-SW1(config-if)# ip ospf network point-to-point
Core-SW1(config-if)# exit

Core-SW1(config)# interface GigabitEthernet0/2
Core-SW1(config-if)# ip ospf network point-to-point
Core-SW1(config-if)# exit

Core-SW1(config)# interface GigabitEthernet0/3
Core-SW1(config-if)# ip ospf network point-to-point
Core-SW1(config-if)# exit

Core-SW1(config)# exit
Core-SW1# copy running-config startup-config
```

**Note:** Core-SW1 is an ABR (Area Border Router) because it connects Area 0 and Area 10.

### **Core-SW2 OSPF Configuration:**

```cisco
Core-SW2> enable
Core-SW2# configure terminal

Core-SW2(config)# router ospf 1
Core-SW2(config-router)# router-id 1.1.3.3
Core-SW2(config-router)# auto-cost reference-bandwidth 10000
Core-SW2(config-router)# log-adjacency-changes

! Area 0 networks
Core-SW2(config-router)# network 1.1.3.3 0.0.0.0 area 0
Core-SW2(config-router)# network 10.0.1.0 0.0.0.3 area 0

! Area 20 networks (ABR configuration)
Core-SW2(config-router)# network 10.0.4.0 0.0.0.3 area 20
Core-SW2(config-router)# network 10.0.5.0 0.0.0.3 area 20
Core-SW2(config-router)# exit

! Configure point-to-point
Core-SW2(config)# interface GigabitEthernet0/1
Core-SW2(config-if)# ip ospf network point-to-point
Core-SW2(config-if)# exit

Core-SW2(config)# interface GigabitEthernet0/2
Core-SW2(config-if)# ip ospf network point-to-point
Core-SW2(config-if)# exit

Core-SW2(config)# interface GigabitEthernet0/3
Core-SW2(config-if)# ip ospf network point-to-point
Core-SW2(config-if)# exit

Core-SW2(config)# exit
Core-SW2# copy running-config startup-config
```

### **Verify Area 0 OSPF Neighbors**

On **Edge-Router:**
```cisco
Edge-Router# show ip ospf neighbor
```

**Expected Output:**
```
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.2.2           0   FULL/  -        00:00:39    10.0.0.2        GigabitEthernet0/0
1.1.3.3           0   FULL/  -        00:00:38    10.0.1.2        GigabitEthernet0/1
```

**Key Points:**
- **State: FULL** - Adjacency is established and LSDBs are synchronized
- **Pri: 0** - Point-to-point links don't use DR/BDR election
- **FULL/  -** - The dash means no DR/BDR (point-to-point)

On **Core-SW1:**
```cisco
Core-SW1# show ip ospf neighbor
```

**Expected:** Should see Edge-Router (1.1.1.1) as neighbor.

---

## 🌐 **Part 4: Configure OSPF on Area 10 Devices**

### **Dist-SW1 OSPF Configuration:**

```cisco
Dist-SW1> enable
Dist-SW1# configure terminal

Dist-SW1(config)# router ospf 1
Dist-SW1(config-router)# router-id 1.1.4.4
Dist-SW1(config-router)# auto-cost reference-bandwidth 10000
Dist-SW1(config-router)# log-adjacency-changes

! All networks in Area 10
Dist-SW1(config-router)# network 1.1.4.4 0.0.0.0 area 10
Dist-SW1(config-router)# network 10.0.2.0 0.0.0.3 area 10
Dist-SW1(config-router)# network 192.168.10.0 0.0.0.255 area 10
Dist-SW1(config-router)# exit

! Point-to-point on uplink
Dist-SW1(config)# interface GigabitEthernet0/1
Dist-SW1(config-if)# ip ospf network point-to-point
Dist-SW1(config-if)# exit

! Passive interface on user-facing VLAN
Dist-SW1(config)# router ospf 1
Dist-SW1(config-router)# passive-interface Vlan10
Dist-SW1(config-router)# exit

Dist-SW1(config)# exit
Dist-SW1# copy running-config startup-config
```

**Note:** VLAN 10 is made passive to prevent OSPF hellos on user network.

### **Dist-SW2 OSPF Configuration:**

```cisco
Dist-SW2> enable
Dist-SW2# configure terminal

Dist-SW2(config)# router ospf 1
Dist-SW2(config-router)# router-id 1.1.5.5
Dist-SW2(config-router)# auto-cost reference-bandwidth 10000
Dist-SW2(config-router)# log-adjacency-changes

Dist-SW2(config-router)# network 1.1.5.5 0.0.0.0 area 10
Dist-SW2(config-router)# network 10.0.3.0 0.0.0.3 area 10
Dist-SW2(config-router)# network 192.168.20.0 0.0.0.255 area 10
Dist-SW2(config-router)# exit

Dist-SW2(config)# interface GigabitEthernet0/1
Dist-SW2(config-if)# ip ospf network point-to-point
Dist-SW2(config-if)# exit

Dist-SW2(config)# router ospf 1
Dist-SW2(config-router)# passive-interface Vlan20
Dist-SW2(config-router)# exit

Dist-SW2(config)# exit
Dist-SW2# copy running-config startup-config
```

### **Verify Area 10 Neighbors**

On **Dist-SW1:**
```cisco
Dist-SW1# show ip ospf neighbor
```

**Expected:**
```
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.2.2           0   FULL/  -        00:00:37    10.0.2.1        GigabitEthernet0/1
```

On **Core-SW1:**
```cisco
Core-SW1# show ip ospf neighbor
```

**Expected:** Should now see both Area 0 and Area 10 neighbors (Edge-Router, Dist-SW1, Dist-SW2).

---

## 🌐 **Part 5: Configure OSPF on Area 20 Devices**

### **Dist-SW3 OSPF Configuration:**

```cisco
Dist-SW3> enable
Dist-SW3# configure terminal

Dist-SW3(config)# router ospf 1
Dist-SW3(config-router)# router-id 1.1.6.6
Dist-SW3(config-router)# auto-cost reference-bandwidth 10000
Dist-SW3(config-router)# log-adjacency-changes

Dist-SW3(config-router)# network 1.1.6.6 0.0.0.0 area 20
Dist-SW3(config-router)# network 10.0.4.0 0.0.0.3 area 20
Dist-SW3(config-router)# network 192.168.30.0 0.0.0.255 area 20
Dist-SW3(config-router)# exit

Dist-SW3(config)# interface GigabitEthernet0/1
Dist-SW3(config-if)# ip ospf network point-to-point
Dist-SW3(config-if)# exit

Dist-SW3(config)# router ospf 1
Dist-SW3(config-router)# passive-interface Vlan30
Dist-SW3(config-router)# exit

Dist-SW3(config)# exit
Dist-SW3# copy running-config startup-config
```

### **Dist-SW4 OSPF Configuration:**

```cisco
Dist-SW4> enable
Dist-SW4# configure terminal

Dist-SW4(config)# router ospf 1
Dist-SW4(config-router)# router-id 1.1.7.7
Dist-SW4(config-router)# auto-cost reference-bandwidth 10000
Dist-SW4(config-router)# log-adjacency-changes

Dist-SW4(config-router)# network 1.1.7.7 0.0.0.0 area 20
Dist-SW4(config-router)# network 10.0.5.0 0.0.0.3 area 20
Dist-SW4(config-router)# network 192.168.40.0 0.0.0.255 area 20
Dist-SW4(config-router)# exit

Dist-SW4(config)# interface GigabitEthernet0/1
Dist-SW4(config-if)# ip ospf network point-to-point
Dist-SW4(config-if)# exit

Dist-SW4(config)# router ospf 1
Dist-SW4(config-router)# passive-interface Vlan40
Dist-SW4(config-router)# exit

Dist-SW4(config)# exit
Dist-SW4# copy running-config startup-config
```

### **Verify Area 20 Neighbors**

On **Core-SW2:**
```cisco
Core-SW2# show ip ospf neighbor
```

**Expected:**
```
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           0   FULL/  -        00:00:38    10.0.1.1        GigabitEthernet0/1
1.1.6.6           0   FULL/  -        00:00:39    10.0.4.2        GigabitEthernet0/2
1.1.7.7           0   FULL/  -        00:00:37    10.0.5.2        GigabitEthernet0/3
```

---

## ✅ **Part 6: Verify OSPF Operation**

### **Step 1: Check OSPF Process Status**

On **Edge-Router:**
```cisco
Edge-Router# show ip ospf
```

**Expected Output:**
```
 Routing Process "ospf 1" with ID 1.1.1.1
 Supports only single TOS(TOS0) routes
 SPF schedule delay 5 secs, Hold time between two SPFs 10 secs
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa
 Area BACKBONE(0)
     Number of interfaces in this area is 3
     Area has no authentication
     SPF algorithm executed 3 times
     Number of LSA 5. Checksum Sum 0x2A3B4
```

### **Step 2: Verify OSPF Routing Table**

On **Edge-Router:**
```cisco
Edge-Router# show ip route ospf
```

**Expected Output:**
```
      1.0.0.0/32 is subnetted, 7 subnets
O        1.1.2.2 [110/2] via 10.0.0.2, 00:05:23, GigabitEthernet0/0
O        1.1.3.3 [110/2] via 10.0.1.2, 00:05:18, GigabitEthernet0/1
O IA     1.1.4.4 [110/3] via 10.0.0.2, 00:03:45, GigabitEthernet0/0
O IA     1.1.5.5 [110/3] via 10.0.0.2, 00:03:41, GigabitEthernet0/0
O IA     1.1.6.6 [110/3] via 10.0.1.2, 00:03:22, GigabitEthernet0/1
O IA     1.1.7.7 [110/3] via 10.0.1.2, 00:03:18, GigabitEthernet0/1
      10.0.0.0/8 is variably subnetted, 8 subnets
O IA     10.0.2.0/30 [110/2] via 10.0.0.2, 00:03:45, GigabitEthernet0/0
O IA     10.0.3.0/30 [110/2] via 10.0.0.2, 00:03:41, GigabitEthernet0/0
O IA     10.0.4.0/30 [110/2] via 10.0.1.2, 00:03:22, GigabitEthernet0/1
O IA     10.0.5.0/30 [110/2] via 10.0.1.2, 00:03:18, GigabitEthernet0/1
O IA  192.168.10.0/24 [110/3] via 10.0.0.2, 00:03:45, GigabitEthernet0/0
O IA  192.168.20.0/24 [110/3] via 10.0.0.2, 00:03:41, GigabitEthernet0/0
O IA  192.168.30.0/24 [110/3] via 10.0.1.2, 00:03:22, GigabitEthernet0/1
O IA  192.168.40.0/24 [110/3] via 10.0.1.2, 00:03:18, GigabitEthernet0/1
```

**Route Code Legend:**
- **O** = OSPF intra-area route (within same area)
- **O IA** = OSPF inter-area route (from different area)
- **[110/3]** = [Administrative Distance / OSPF Cost]
- **110** = OSPF default AD (more trustworthy than RIP=120, less than static=1)

### **Step 3: Compare Static vs OSPF Routes**

**Before (Static Routes):**
```
S     192.168.10.0/24 [1/0] via 10.0.0.2
```
- Administrative Distance: **1**
- Metric: **0** (hop count not used)
- Manual configuration required

**After (OSPF Routes):**
```
O IA  192.168.10.0/24 [110/3] via 10.0.0.2
```
- Administrative Distance: **110**
- Metric: **3** (based on bandwidth cost)
- Automatically learned via OSPF
- Will reconverge if topology changes

### **Step 4: Verify OSPF Interface Configuration**

On **Dist-SW1:**
```cisco
Dist-SW1# show ip ospf interface brief
```

**Expected Output:**
```
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     10              1.1.4.4/32         1     LOOP  0/0
Gi0/1        1     10              10.0.2.2/30        1     P2P   1/1
Vl10         1     10              192.168.10.1/24    10    DR    0/0
```

**Key Observations:**
- **Gi0/1:** Point-to-Point state with 1 neighbor
- **Vl10:** DR state (passive interface, no neighbors)
- **Cost:** Lower is better (1 for Gigabit, 10 for 100 Mbps)

### **Step 5: Check Passive Interfaces**

On **Dist-SW1:**
```cisco
Dist-SW1# show ip ospf interface Vlan10
```

**Expected Output should include:**
```
Vlan10 is up, line protocol is up
  Internet Address 192.168.10.1/24, Area 10
  Process ID 1, Router ID 1.1.4.4, Network Type BROADCAST, Cost: 10
  Transmit Delay is 1 sec, State DR, Priority 1
  No Hellos (Passive interface)
```

**Important:** "No Hellos (Passive interface)" confirms users won't receive OSPF packets.

---

## 🧪 **Part 7: Test OSPF Connectivity**

### **Step 1: Test End-to-End Connectivity**

From **PC1** (192.168.10.10):
```
ping 192.168.20.10
```
**Expected:** Success

```
ping 192.168.30.10
```
**Expected:** Success

```
ping 192.168.40.10
```
**Expected:** Success

### **Step 2: Trace Path with OSPF**

From **PC1:**
```
tracert 192.168.30.10
```

**Expected Output:**
```
Tracing route to 192.168.30.10 over a maximum of 30 hops:
  1    <1 ms    <1 ms    <1 ms    192.168.10.1  (Dist-SW1 VLAN10)
  2    1 ms     1 ms     1 ms     10.0.2.1      (Core-SW1)
  3    1 ms     1 ms     1 ms     10.0.0.1      (Edge-Router)
  4    2 ms     2 ms     2 ms     10.0.1.2      (Core-SW2)
  5    2 ms     2 ms     2 ms     192.168.30.10 (Server1)
```

**Path Analysis:**
- PC1 → Dist-SW1 (default gateway)
- Dist-SW1 → Core-SW1 (Area 10 to Area 0)
- Core-SW1 → Edge-Router (within Area 0)
- Edge-Router → Core-SW2 (OSPF routing decision)
- Core-SW2 → Server1 (Area 0 to Area 20)

---

## 🔥 **Part 8: Test OSPF Reconvergence**

Now let's test OSPF's dynamic routing capabilities.

### **Scenario 1: Link Failure Between Core-SW1 and Edge-Router**

### **Step 1: Establish Baseline**

From **PC1:**
```
ping 192.168.30.10 -t
```
(Continuous ping)

### **Step 2: Simulate Link Failure**

On **Edge-Router:**
```cisco
Edge-Router(config)# interface GigabitEthernet0/0
Edge-Router(config-if)# shutdown
```

**Observe ping results:**
- You should see **brief packet loss** (2-5 packets)
- OSPF will reconverge within seconds
- Traffic will reroute through Core-SW2

### **Step 3: Verify Rerouted Path**

On **Edge-Router:**
```cisco
Edge-Router# show ip route 192.168.10.0
```

**Expected:** Route now points to 10.0.1.2 (Core-SW2) instead of 10.0.0.2 (Core-SW1)

Check OSPF neighbors:
```cisco
Edge-Router# show ip ospf neighbor
```

**Expected:**
```
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.3.3           0   FULL/  -        00:00:38    10.0.1.2        GigabitEthernet0/1
```
(Only Core-SW2 neighbor remains)

### **Step 4: Restore Link**

On **Edge-Router:**
```cisco
Edge-Router(config)# interface GigabitEthernet0/0
Edge-Router(config-if)# no shutdown
```

Wait 30 seconds and verify neighbor returns:
```cisco
Edge-Router# show ip ospf neighbor
```

**Expected:** Both neighbors (Core-SW1 and Core-SW2) should return to FULL state.

### **Step 5: Document Convergence Time**

From your ping results, calculate:
- **How many packets were lost?**
- **Approximate convergence time:** (packets lost × 1 second)

**Typical OSPF convergence:** 3-10 seconds depending on timers.

---

## 🔧 **Part 9: Troubleshooting OSPF**

### **Common Issue 1: Neighbors Stuck in INIT State**

**Symptom:**
```cisco
Dist-SW1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.2.2           0   INIT/  -        00:00:35    10.0.2.1        GigabitEthernet0/1
```

**Causes:**
1. **Mismatched areas** - Check both sides are in same area
2. **ACL blocking OSPF** - OSPF uses multicast 224.0.0.5
3. **Authentication mismatch** - Both sides must match
4. **MTU mismatch** - Check with `show interface`

**Troubleshooting Commands:**
```cisco
Dist-SW1# show ip ospf interface GigabitEthernet0/1
```
Look for: Area ID, Network Type, Authentication

**Solution:**
```cisco
! Verify area configuration
Dist-SW1(config)# router ospf 1
Dist-SW1(config-router)# network 10.0.2.0 0.0.0.3 area 10
```

### **Common Issue 2: No OSPF Neighbors Forming**

**Symptom:**
```cisco
Dist-SW1# show ip ospf neighbor
(No output)
```

**Troubleshooting Steps:**

**1. Check OSPF is enabled:**
```cisco
Dist-SW1# show ip ospf
```
If no output, OSPF not configured.

**2. Check interfaces are in OSPF:**
```cisco
Dist-SW1# show ip ospf interface brief
```
Missing interfaces? Add with `network` command.

**3. Verify interface is up:**
```cisco
Dist-SW1# show ip interface brief | include Gi0/1
```

**4. Check for passive interface:**
```cisco
Dist-SW1# show ip ospf interface Gi0/1 | include Passive
```
If passive, remove with:
```cisco
Dist-SW1(config-router)# no passive-interface GigabitEthernet0/1
```

### **Common Issue 3: Routes Not Appearing**

**Symptom:** OSPF neighbors FULL, but routes missing.

**Troubleshooting:**

**1. Check OSPF database:**
```cisco
Dist-SW1# show ip ospf database
```
Are LSAs present for missing networks?

**2. Verify ABR is advertising summary routes:**
```cisco
Core-SW1# show ip ospf database summary
```

**3. Check for route filtering:**
```cisco
Core-SW1# show ip ospf | include filter
```

**4. Verify routing table:**
```cisco
Dist-SW1# show ip route
Dist-SW1# show ip route ospf
```

### **Common Issue 4: Routing Loop or Suboptimal Path**

**Symptom:** Traffic takes inefficient path.

**Diagnosis:**
```cisco
Edge-Router# show ip route 192.168.10.0
```

Check metric and next-hop. If suboptimal, verify:

**1. OSPF cost:**
```cisco
Edge-Router# show ip ospf interface brief
```

**2. Adjust cost manually if needed:**
```cisco
Edge-Router(config)# interface GigabitEthernet0/0
Edge-Router(config-if)# ip ospf cost 10
```

**3. Verify reference bandwidth is consistent:**
```cisco
Edge-Router# show ip ospf | include Reference
```
All routers MUST use same reference bandwidth!

---

## 📊 **Part 10: Advanced Verification**

### **Step 1: Examine OSPF Database**

On **Core-SW1** (ABR):
```cisco
Core-SW1# show ip ospf database
```

**Expected Output:**
```
            OSPF Router with ID (1.1.2.2) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         234         0x80000003 0x00A123 3
1.1.2.2         1.1.2.2         187         0x80000004 0x00B456 5
1.1.3.3         1.1.3.3         201         0x80000003 0x00C789 4

                Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
10.0.2.0        1.1.2.2         145         0x80000002 0x00D111
192.168.10.0    1.1.2.2         156         0x80000002 0x00E222
```

**Explanation:**
- **Router Link States:** LSA Type 1 (router LSAs in Area 0)
- **Summary Net Link States:** LSA Type 3 (ABR summaries from other areas)

### **Step 2: View OSPF Neighbors Detail**

On **Edge-Router:**
```cisco
Edge-Router# show ip ospf neighbor detail
```

**Expected Output:**
```
Neighbor 1.1.2.2, interface address 10.0.0.2
    In the area 0 via interface GigabitEthernet0/0
    Neighbor priority is 0, State is FULL, 6 state changes
    DR is 0.0.0.0, BDR is 0.0.0.0
    Options is 0x12 in Hello (E-bit, L-bit)
    Dead timer due in 00:00:37
    Neighbor is up for 00:15:23
    Index 1/1, retransmission queue length 0, number of retransmission 0
```

**Key Information:**
- **State is FULL:** Adjacency fully established
- **Dead timer:** How long until neighbor declared down (default 40s)
- **Neighbor is up for:** Uptime of adjacency

### **Step 3: Check OSPF Timers**

On **Dist-SW1:**
```cisco
Dist-SW1# show ip ospf interface GigabitEthernet0/1
```

**Look for:**
```
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
```

**Default Timers:**
- **Hello:** 10 seconds (how often hellos sent)
- **Dead:** 40 seconds (4× hello interval)
- **Wait:** 40 seconds (DR/BDR election wait time)
- **Retransmit:** 5 seconds (LSA retransmission interval)

---

## 📈 **Part 11: Analyze OSPF Metrics**

### **Step 1: Calculate OSPF Cost**

**Formula:**
```
OSPF Cost = Reference Bandwidth / Interface Bandwidth
```

With `auto-cost reference-bandwidth 10000`:
```
Reference = 10000 Mbps (10 Gbps)
```

**Cost Calculations:**
| Interface Speed | Cost Calculation | Result |
|----------------|------------------|--------|
| 10 Gbps | 10000 / 10000 | 1 |
| 1 Gbps (Gigabit) | 10000 / 1000 | 10 |
| 100 Mbps (FastEthernet) | 10000 / 100 | 100 |
| 10 Mbps | 10000 / 10 | 1000 |

### **Step 2: Verify Path Cost**

On **PC1**, trace to **Server1**:
```
tracert 192.168.30.10
```

**Manual calculation:**
1. PC1 → Dist-SW1: (local, no OSPF cost)
2. Dist-SW1 → Core-SW1: Cost **10** (Gigabit)
3. Core-SW1 → Edge-Router: Cost **10** (Gigabit)
4. Edge-Router → Core-SW2: Cost **10** (Gigabit)
5. Core-SW2 → Dist-SW3: Cost **10** (Gigabit)

**Total OSPF Cost:** 40

Verify on **Dist-SW1:**
```cisco
Dist-SW1# show ip route 192.168.30.0
```

**Expected:**
```
O IA  192.168.30.0/24 [110/40] via 10.0.2.1, GigabitEthernet0/1
```

The **[110/40]** confirms:
- AD = 110 (OSPF)
- Metric = 40 (total cost)

---

## 📋 **Lab Completion Checklist**

- [ ] All static routes removed from all devices
- [ ] OSPF configured on Edge-Router, Core-SW1, Core-SW2
- [ ] OSPF configured on Dist-SW1, Dist-SW2, Dist-SW3, Dist-SW4
- [ ] Correct Router IDs configured (using Loopback0)
- [ ] Multi-area design implemented (Area 0, 10, 20)
- [ ] Reference bandwidth set to 10000 on all devices
- [ ] Passive interfaces configured on user VLANs
- [ ] Point-to-point network type on all P2P links
- [ ] All OSPF neighbors in FULL state
- [ ] OSPF routes appear in routing tables (O and O IA)
- [ ] End-to-end connectivity verified (PC1 to all networks)
- [ ] OSPF reconvergence tested successfully
- [ ] Configuration saved on all devices

---

## 🎯 **Lab Deliverables**

Submit the following:
1. ✅ **Packet Tracer file:** `lab04-lastname.pkt`
2. ✅ **Screenshot:** `show ip ospf neighbor` from Edge-Router showing FULL state
3. ✅ **Screenshot:** `show ip route ospf` from Dist-SW1 showing O IA routes
4. ✅ **Screenshot:** Successful ping from PC1 to Server1 with OSPF
5. ✅ **Screenshot:** OSPF reconvergence test (before/after link failure)
6. ✅ **Screenshot:** `show ip ospf database` from Core-SW1
7. ✅ **Written answers** to reflection questions below

---

## 🤔 **Reflection Questions**

Answer these questions in a separate document:

1. **What are the advantages of OSPF over static routing?** Consider scalability, convergence, and administrative overhead.

2. **Why do we use multi-area OSPF instead of single-area?** What are the benefits of Area 0, 10, and 20 design?

3. **Explain the difference between "O" and "O IA" routes.** Which type would you see for networks in the same area?

4. **What is the purpose of the `auto-cost reference-bandwidth 10000` command?** What would happen if it was different on each router?

5. **Why do we configure passive interfaces on user VLANs?** What security or performance issues would arise without this?

6. **What is an ABR (Area Border Router)?** Which devices in our topology are ABRs?

7. **During the link failure test, approximately how long did OSPF take to reconverge?** How does this compare to static routing?

8. **What would happen if two routers had the same OSPF Router ID?** Why do we use loopback interfaces for Router IDs?

9. **Calculate the OSPF cost** from Dist-SW1 to Dist-SW4. Show your work.

10. **Compare the routing table from Lab 1 (static) vs Lab 4 (OSPF).** Which provides more redundancy? Why?

---

## 🔧 **Troubleshooting Quick Reference**

### **Neighbor Not Forming:**
```cisco
show ip ospf interface brief
show ip ospf neighbor
debug ip ospf adj  (use carefully, turn off with 'undebug all')
```

### **Routes Missing:**
```cisco
show ip route ospf
show ip ospf database
show ip protocols
```

### **Wrong Path Selected:**
```cisco
show ip ospf interface brief  (check costs)
show ip route [network]  (verify metric)
```

### **Clear OSPF Process (resets neighbors):**
```cisco
clear ip ospf process
```
**Warning:** This disrupts routing briefly. Use in maintenance windows only.

---

## 🚀 **Next Lab Preview**

**Lab 5: Add HSRP (First Hop Redundancy)**

In the next lab, you will:
- ✅ Keep the same OSPF topology
- ➕ Implement HSRP between distribution switches
- ➕ Configure virtual IP addresses for gateway redundancy
- ➕ Test automatic failover of default gateway
- ➕ Combine OSPF dynamic routing with HSRP gateway redundancy

**Save your work!** You'll continue building on this file in Lab 5.

---

## 📚 **Additional Resources**

- **OSPF RFC 2328:** [IETF OSPF Specification](https://datatracker.ietf.org/doc/html/rfc2328)
- **Cisco OSPF Design Guide:** [cisco.com](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/7039-1.html)
- **OSPF Areas Explained:** Course lecture notes Week 8
- **OSPF LSA Types:** [Cisco Documentation](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/7039-1.html)
- **OSPF vs EIGRP Comparison:** Course supplementary materials

---

**Lab Created by:** EQ6
**Last Updated:** 2025-12-01
**Version:** 1.0
