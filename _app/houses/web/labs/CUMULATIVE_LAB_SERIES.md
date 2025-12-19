# Network Essentials - Cumulative Lab Series

**Prepared by:** EQ6
**Purpose:** Progressive hands-on labs building enterprise network skills
**Tool:** Cisco Packet Tracer
**Approach:** Incremental - each lab builds on the previous

---

## 📚 **Lab Series Overview**

This lab series uses a **cumulative approach** where students progressively build a complete enterprise network. Instead of starting fresh each time, students add new technologies to their existing topology.

### **Pedagogical Benefits:**
- ✅ Reinforces previous concepts while learning new ones
- ✅ Mirrors real-world network evolution
- ✅ Students see how technologies integrate
- ✅ Reduces cognitive load (familiar topology)
- ✅ Builds comprehensive troubleshooting skills

---

## 🏗️ **Base Topology Architecture**

### **Starting Point: Static Routes Lab**
```
                    [Internet Cloud - Simulated]
                              |
                        [Edge-Router]
                              |
                    +---------+---------+
                    |                   |
            [Core-SW1]              [Core-SW2]
                |                       |
        +-------+-------+       +-------+-------+
        |               |       |               |
    [Dist-SW1]      [Dist-SW2] [Dist-SW3]  [Dist-SW4]
        |               |       |               |
    [Access-SW1]    [Access-SW2] [Access-SW3] [Access-SW4]
        |               |       |               |
      PCs            PCs      Servers        Servers
   (VLAN 10)      (VLAN 20)  (VLAN 30)     (VLAN 40)
```

### **Network Design:**
- **Edge Layer:** 1 router (Internet connectivity)
- **Core Layer:** 2 switches (high-speed backbone)
- **Distribution Layer:** 4 switches (routing/policy)
- **Access Layer:** 4 switches (end-user connectivity)
- **End Devices:** 8 PCs, 4 Servers

### **IP Addressing Scheme:**

| Segment | Network | Purpose |
|---------|---------|---------|
| WAN Link | 203.0.113.0/30 | Edge to Internet |
| Core Interconnect | 10.0.0.0/30 | Core-SW1 to Core-SW2 |
| Core to Dist 1 | 10.0.1.0/30 | Core-SW1 to Dist-SW1 |
| Core to Dist 2 | 10.0.2.0/30 | Core-SW1 to Dist-SW2 |
| Core to Dist 3 | 10.0.3.0/30 | Core-SW2 to Dist-SW3 |
| Core to Dist 4 | 10.0.4.0/30 | Core-SW2 to Dist-SW4 |
| VLAN 10 (Sales) | 192.168.10.0/24 | User workstations |
| VLAN 20 (Engineering) | 192.168.20.0/24 | User workstations |
| VLAN 30 (Servers) | 192.168.30.0/24 | Application servers |
| VLAN 40 (Management) | 192.168.40.0/24 | Network management |
| Loopbacks | 1.1.X.X/32 | Router IDs for OSPF/EIGRP |

---

## 📖 **Lab Progression**

### **Lab 1: Static Routes (Foundation)**
**Lecture:** IP Routing Fundamentals
**File:** `lab01-static-routes.md` + `lab01-base-topology.pkt`

**Objectives:**
- Build the base network topology
- Configure IP addresses on all devices
- Implement static routes for inter-VLAN routing
- Test end-to-end connectivity

**Devices Added:**
- 1 Edge Router
- 6 Switches (Core, Distribution, Access)
- 12 End Devices (PCs and Servers)

**Technologies Introduced:**
- IP addressing
- Default gateway configuration
- Static routing
- Basic switch configuration

**Deliverable:** Fully functioning network with static routes

---

### **Lab 2: VLANs and Trunking (Layer 2 Segmentation)**
**Lecture:** VLAN & Trunking
**File:** `lab02-add-vlans.md` + `lab02-with-vlans.pkt`

**Objectives:**
- Segment existing network into VLANs
- Configure trunk links between switches
- Implement 802.1Q tagging
- Verify VLAN isolation

**Building on Lab 1:**
- ✅ Keep existing topology
- ✅ Keep existing IP scheme
- ➕ Create VLANs (10, 20, 30, 40, 99-Management)
- ➕ Configure access ports
- ➕ Configure trunk ports
- ➕ Add native VLAN configuration

**New Configuration Tasks:**
```
Access-SW1:
  - Create VLANs 10, 20, 30, 40, 99
  - Assign PC ports to VLAN 10
  - Configure uplink as trunk
  - Set native VLAN 99
```

**Verification:**
- PCs in different VLANs cannot communicate (yet)
- Trunk links carry multiple VLANs
- `show vlan brief` confirms assignments

**What Students Learn:**
- How VLANs segment broadcast domains
- Trunk vs access ports
- 802.1Q tagging
- Native VLAN concept

---

### **Lab 3: Spanning Tree Protocol (Loop Prevention)**
**Lecture:** STP
**File:** `lab03-add-stp.md` + `lab03-with-stp.pkt`

**Objectives:**
- Add redundant links for fault tolerance
- Configure STP to prevent loops
- Manually configure Root Bridge
- Implement PortFast and BPDU Guard

**Building on Lab 2:**
- ✅ Keep VLANs from Lab 2
- ✅ Keep IP addressing
- ➕ Add redundant links between switches
- ➕ Configure STP priorities
- ➕ Enable RSTP (rapid-pvst)
- ➕ Configure PortFast on access ports
- ➕ Enable BPDU Guard

**New Physical Connections:**
```
Redundant Links Added:
  - Core-SW1 ←→ Core-SW2 (second link)
  - Dist-SW1 ←→ Dist-SW2 (cross-connect)
  - Dist-SW3 ←→ Dist-SW4 (cross-connect)
```

**New Configuration Tasks:**
```
Core-SW1:
  - spanning-tree vlan 10,20 root primary
  - spanning-tree mode rapid-pvst

Core-SW2:
  - spanning-tree vlan 30,40 root primary
  - spanning-tree mode rapid-pvst

Access Switches:
  - spanning-tree portfast default
  - spanning-tree portfast bpduguard default
```

**Verification:**
- Redundant links exist but one is blocking
- Root Bridge is correct switch for each VLAN
- PortFast ports transition immediately
- Simulate link failure - convergence occurs

**What Students Learn:**
- Why redundancy requires STP
- Root Bridge election
- Port states and roles
- Rapid convergence with RSTP

---

### **Lab 4: OSPF (Dynamic Routing)**
**Lecture:** OSPF
**File:** `lab04-replace-with-ospf.md` + `lab04-with-ospf.pkt`

**Objectives:**
- Remove static routes
- Implement OSPF for dynamic routing
- Configure multi-area OSPF
- Verify OSPF neighbors and routes

**Building on Lab 3:**
- ✅ Keep VLANs and STP configuration
- ✅ Keep redundant topology
- ➖ Remove all static routes
- ➕ Configure OSPF on all routers
- ➕ Implement Area 0 (backbone) and Area 10/20
- ➕ Configure Router IDs using loopbacks
- ➕ Adjust reference bandwidth

**OSPF Area Design:**
```
Area 0 (Backbone):
  - Edge-Router
  - Core-SW1
  - Core-SW2

Area 10 (Branch 1):
  - Dist-SW1
  - Dist-SW2
  - Access-SW1
  - Access-SW2

Area 20 (Branch 2):
  - Dist-SW3
  - Dist-SW4
  - Access-SW3
  - Access-SW4
```

**New Configuration Tasks:**
```
Edge-Router:
  interface Loopback0
   ip address 1.1.1.1 255.255.255.255

  router ospf 1
   router-id 1.1.1.1
   network 203.0.113.0 0.0.0.3 area 0
   network 10.0.0.0 0.0.0.3 area 0
   auto-cost reference-bandwidth 10000
   passive-interface GigabitEthernet0/0
```

**Verification:**
- All OSPF neighbors in Full state
- Routes learned via OSPF (O and O IA)
- Traceroute shows dynamic path selection
- Link failure triggers reconvergence

**What Students Learn:**
- Migration from static to dynamic routing
- OSPF configuration and verification
- Multi-area design
- Automatic failover

---

### **Lab 5: EIGRP and Redistribution (Multi-Protocol)**
**Lecture:** EIGRP
**File:** `lab05-add-eigrp.md` + `lab05-with-eigrp.pkt`

**Objectives:**
- Add new branch running EIGRP
- Implement route redistribution between OSPF and EIGRP
- Understand routing protocol interaction
- Optimize routing with route filtering

**Building on Lab 4:**
- ✅ Keep OSPF configuration in main network
- ➕ Add new "Remote Branch" running EIGRP
- ➕ Configure redistribution on Edge Router
- ➕ Implement route maps for filtering
- ➕ Compare OSPF vs EIGRP metrics

**New Topology Addition:**
```
              [Edge-Router]
                    |
       +------------+------------+
       |                         |
  [OSPF Network]          [Remote-Router]
  (Existing)                     |
                          [Remote-Switch]
                                 |
                              [Remote-PCs]
                           (VLAN 50: 192.168.50.0/24)
```

**New Configuration Tasks:**
```
Remote-Router:
  router eigrp 100
   network 192.168.50.0 0.0.0.255
   network 10.10.10.0 0.0.0.3
   no auto-summary

Edge-Router:
  router ospf 1
   redistribute eigrp 100 subnets

  router eigrp 100
   redistribute ospf 1 metric 10000 100 255 1 1500
```

**Verification:**
- EIGRP neighbors established
- OSPF routes visible in Remote-Router
- EIGRP routes visible in main network
- Redistribution working bidirectionally

**What Students Learn:**
- When to use EIGRP vs OSPF
- Route redistribution concepts
- Administrative distance
- Metric conversion between protocols

---

### **Lab 6: Advanced Features (Capstone)**
**Lectures:** Multiple
**File:** `lab06-advanced-features.md` + `lab06-complete.pkt`

**Objectives:**
- Implement HSRP for gateway redundancy
- Configure DHCP for dynamic addressing
- Add ACLs for security
- Enable SNMP monitoring

**Building on Lab 5:**
- ✅ Keep entire network topology
- ➕ Configure HSRP on distribution layer
- ➕ Set up DHCP server on Edge Router
- ➕ Implement ACLs to restrict traffic
- ➕ Enable SNMP for monitoring

**Final Network Features:**
- ✅ Redundant topology with STP
- ✅ VLANs for segmentation
- ✅ OSPF for dynamic routing
- ✅ EIGRP in remote branch
- ✅ HSRP for first-hop redundancy
- ✅ DHCP for automatic IP assignment
- ✅ ACLs for security
- ✅ SNMP for monitoring

**This becomes a complete enterprise network simulation!**

---

## 📁 **File Organization**

```
/home/eq/Ai content creation/network-essentials/labs/
├── CUMULATIVE_LAB_SERIES.md (this file - overview)
├── lab01-static-routes.md (detailed instructions)
├── lab01-base-topology.pkt (Packet Tracer file)
├── lab02-add-vlans.md (incremental instructions)
├── lab02-with-vlans.pkt (builds on lab01)
├── lab03-add-stp.md (incremental instructions)
├── lab03-with-stp.pkt (builds on lab02)
├── lab04-replace-with-ospf.md (incremental instructions)
├── lab04-with-ospf.pkt (builds on lab03)
├── lab05-add-eigrp.md (incremental instructions)
├── lab05-with-eigrp.pkt (builds on lab04)
├── lab06-advanced-features.md (incremental instructions)
└── lab06-complete.pkt (final complete network)
```

---

## 🎯 **Student Workflow**

### **Week 1: Foundation**
1. Watch Static Routes lecture
2. Complete Lab 1 (build base topology)
3. Verify connectivity with ping/traceroute
4. Save as `lab01-lastname.pkt`

### **Week 2: VLANs**
1. Watch VLAN/Trunking lecture
2. **Open your Lab 1 file** (don't start fresh!)
3. Follow Lab 2 instructions to add VLANs
4. Verify VLAN isolation
5. Save as `lab02-lastname.pkt`

### **Week 3: STP**
1. Watch STP lecture
2. **Open your Lab 2 file**
3. Follow Lab 3 instructions to add redundancy and STP
4. Test failover scenarios
5. Save as `lab03-lastname.pkt`

### **...and so on**

---

## 🔧 **Instructor Tools**

### **Pre-Built .pkt Files**
Each lab includes:
- **Starting point .pkt** - Students open this to begin
- **Solution .pkt** - Instructor reference for grading
- **Broken .pkt** - Intentional misconfigurations for troubleshooting practice

### **Grading Rubrics**
Each lab guide includes:
- Required configurations checklist
- Verification commands to run
- Expected output samples
- Point values for each section

### **Troubleshooting Scenarios**
After completing labs, students can:
- Open "broken" version
- Diagnose issues using show commands
- Fix configurations
- Document their troubleshooting process

---

## 📊 **Learning Outcomes**

By completing the full series, students will:

✅ **Build** a complete enterprise network from scratch
✅ **Configure** routing, switching, and redundancy protocols
✅ **Integrate** multiple technologies in one topology
✅ **Troubleshoot** complex multi-protocol networks
✅ **Understand** how network technologies work together
✅ **Document** network changes and configurations
✅ **Think** like a network engineer (incremental design)

---

## 💡 **Why This Approach Works**

**Traditional Approach:**
- Lab 1: Build network, configure static routes, delete file
- Lab 2: Build NEW network, configure VLANs, delete file
- Lab 3: Build ANOTHER network, configure STP, delete file
- **Problem:** Students don't see integration, start from scratch each time

**Cumulative Approach:**
- Lab 1: Build network with static routes
- Lab 2: **Add** VLANs to YOUR existing network
- Lab 3: **Add** STP to YOUR existing network
- Lab 4: **Replace** static routes with OSPF in YOUR network
- **Benefit:** Students see how real networks evolve, technologies integrate

**Real-World Parallel:**
This mirrors how actual networks are built:
- Phase 1: Basic connectivity
- Phase 2: Segmentation (VLANs)
- Phase 3: Redundancy (STP)
- Phase 4: Scalability (dynamic routing)
- Phase 5: Advanced features

---

## 🚀 **Next Steps**

1. ✅ Create detailed lab guide for each lab (Lab 1-6)
2. ✅ Build Packet Tracer files for each stage
3. ✅ Create instructor solution guides
4. ✅ Develop troubleshooting scenarios
5. ✅ Create grading rubrics

**Status:** Ready to create individual lab guides

---

**Prepared by:** EQ6
**Last Updated:** 2025-12-01
**Version:** 1.0
