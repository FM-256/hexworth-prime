# Lab 2: VLANs and Trunking - Network Segmentation

**Prepared by:** EQ6
**Course:** Network Essentials
**Estimated Time:** 90 minutes
**Difficulty:** Intermediate
**Prerequisites:** Completed Lab 1 (Static Routes)

---

## 📋 **Lab Objectives**

By the end of this lab, you will be able to:
- ✅ Segment an existing network using VLANs
- ✅ Configure access ports for end devices
- ✅ Configure trunk ports between switches
- ✅ Implement 802.1Q tagging
- ✅ Configure native VLAN for untagged traffic
- ✅ Verify VLAN isolation
- ✅ Maintain inter-VLAN routing functionality
- ✅ Troubleshoot VLAN connectivity issues

---

## 🎯 **Important: This is an INCREMENTAL Lab**

**DO NOT START A NEW FILE!**

1. ✅ Open your completed **Lab 1** Packet Tracer file: `lab01-lastname.pkt`
2. ✅ You will ADD VLANs to this existing topology
3. ✅ Save as: `lab02-lastname.pkt`

**Why?** In the real world, networks evolve - you add technologies to existing infrastructure. This lab teaches you how VLANs integrate with your current routing setup.

---

## 📚 **What You're Building On**

### **Your Lab 1 Network (Review):**
- **12 devices:** 1 router, 6 Layer 3 switches, 4 Layer 2 switches, 4 PCs, 4 servers
- **Static routing** configured and working
- **IP addressing** already assigned
- **4 user networks:**
  - 192.168.10.0/24 (Sales - PC1, PC2)
  - 192.168.20.0/24 (Engineering - PC3, PC4)
  - 192.168.30.0/24 (Servers - Server1, Server2)
  - 192.168.40.0/24 (Management - Server3, Server4)

### **What's Changing in Lab 2:**
- ➕ Create VLANs to segment broadcast domains
- ➕ Assign access ports to specific VLANs
- ➕ Configure trunk links to carry multiple VLANs
- ➕ Add management VLAN (VLAN 99)
- ✅ Keep all existing IP addresses and routing

---

## 🔢 **VLAN Design**

| VLAN ID | Name | Network | Gateway | Devices |
|---------|------|---------|---------|---------|
| **10** | Sales | 192.168.10.0/24 | 192.168.10.1 | PC1, PC2 |
| **20** | Engineering | 192.168.20.0/24 | 192.168.20.1 | PC3, PC4 |
| **30** | Servers | 192.168.30.0/24 | 192.168.30.1 | Server1, Server2 |
| **40** | Management-Data | 192.168.40.0/24 | 192.168.40.1 | Server3, Server4 |
| **99** | Native-VLAN | 10.99.99.0/24 | - | Trunk native VLAN |

---

## 📝 **Part 1: Create VLANs on All Switches**

We'll create VLANs on all 10 switches to ensure consistency.

### **Step 1: Create VLANs on Access-SW1**

```cisco
Access-SW1> enable
Access-SW1# configure terminal

! Create VLANs
Access-SW1(config)# vlan 10
Access-SW1(config-vlan)# name Sales
Access-SW1(config-vlan)# exit

Access-SW1(config)# vlan 20
Access-SW1(config-vlan)# name Engineering
Access-SW1(config-vlan)# exit

Access-SW1(config)# vlan 30
Access-SW1(config-vlan)# name Servers
Access-SW1(config-vlan)# exit

Access-SW1(config)# vlan 40
Access-SW1(config-vlan)# name Management-Data
Access-SW1(config-vlan)# exit

Access-SW1(config)# vlan 99
Access-SW1(config-vlan)# name Native-VLAN
Access-SW1(config-vlan)# exit

! Verify VLANs created
Access-SW1# show vlan brief
```

**Expected Output:**
```
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Gig0/1
10   Sales                            active    
20   Engineering                      active    
30   Servers                          active    
40   Management-Data                  active    
99   Native-VLAN                      active    
```

### **Step 2: Repeat for All Switches**

Apply the same VLAN creation commands to:
- Access-SW2
- Access-SW3
- Access-SW4
- Dist-SW1
- Dist-SW2
- Dist-SW3
- Dist-SW4
- Core-SW1
- Core-SW2

**Note:** Distribution and Core switches already have IP routing enabled from Lab 1.

---

## 🔌 **Part 2: Configure Access Ports**

Access ports connect to end devices (PCs, servers) and belong to ONE VLAN.

### **Access-SW1 Configuration:**

PC1 and PC2 are on the Sales network (VLAN 10):

```cisco
Access-SW1(config)# interface range FastEthernet0/1-2
Access-SW1(config-if-range)# switchport mode access
Access-SW1(config-if-range)# switchport access vlan 10
Access-SW1(config-if-range)# spanning-tree portfast
Access-SW1(config-if-range)# no shutdown
Access-SW1(config-if-range)# exit
```

### **Access-SW2 Configuration:**

PC3 and PC4 are on Engineering network (VLAN 20):

```cisco
Access-SW2(config)# interface range FastEthernet0/1-2
Access-SW2(config-if-range)# switchport mode access
Access-SW2(config-if-range)# switchport access vlan 20
Access-SW2(config-if-range)# spanning-tree portfast
Access-SW2(config-if-range)# no shutdown
Access-SW2(config-if-range)# exit
```

### **Access-SW3 Configuration:**

Server1 and Server2 are on Servers network (VLAN 30):

```cisco
Access-SW3(config)# interface range FastEthernet0/1-2
Access-SW3(config-if-range)# switchport mode access
Access-SW3(config-if-range)# switchport access vlan 30
Access-SW3(config-if-range)# spanning-tree portfast
Access-SW3(config-if-range)# no shutdown
Access-SW3(config-if-range)# exit
```

### **Access-SW4 Configuration:**

Server3 and Server4 are on Management network (VLAN 40):

```cisco
Access-SW4(config)# interface range FastEthernet0/1-2
Access-SW4(config-if-range)# switchport mode access
Access-SW4(config-if-range)# switchport access vlan 40
Access-SW4(config-if-range)# spanning-tree portfast
Access-SW4(config-if-range)# no shutdown
Access-SW4(config-if-range)# exit
```

### **Verification:**

On Access-SW1:
```cisco
Access-SW1# show vlan brief
```

**Expected Output:**
```
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gig0/1
10   Sales                            active    Fa0/1, Fa0/2
20   Engineering                      active    
30   Servers                          active    
40   Management-Data                  active    
99   Native-VLAN                      active    
```

**Notice:** Ports Fa0/1-2 are now in VLAN 10!

---

## 🌉 **Part 3: Configure Trunk Ports**

Trunk ports carry traffic for MULTIPLE VLANs between switches.

### **Access-SW1 to Dist-SW1 Trunk:**

```cisco
! On Access-SW1
Access-SW1(config)# interface GigabitEthernet0/1
Access-SW1(config-if)# switchport mode trunk
Access-SW1(config-if)# switchport trunk native vlan 99
Access-SW1(config-if)# switchport trunk allowed vlan 10,20,30,40,99
Access-SW1(config-if)# no shutdown
Access-SW1(config-if)# exit
```

```cisco
! On Dist-SW1
Dist-SW1(config)# interface GigabitEthernet0/2
Dist-SW1(config-if)# switchport trunk encapsulation dot1q
Dist-SW1(config-if)# switchport mode trunk
Dist-SW1(config-if)# switchport trunk native vlan 99
Dist-SW1(config-if)# switchport trunk allowed vlan 10,20,30,40,99
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit
```

**Note:** Layer 3 switches require `switchport trunk encapsulation dot1q` before `switchport mode trunk`.

### **Repeat for All Access-to-Distribution Trunks:**

**Access-SW2 ↔ Dist-SW2:**
```cisco
! Access-SW2
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,30,40,99

! Dist-SW2
interface GigabitEthernet0/2
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,30,40,99
```

**Access-SW3 ↔ Dist-SW3:**
```cisco
! Access-SW3
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,30,40,99

! Dist-SW3
interface GigabitEthernet0/2
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,30,40,99
```

**Access-SW4 ↔ Dist-SW4:**
```cisco
! Access-SW4
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,30,40,99

! Dist-SW4
interface GigabitEthernet0/2
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,30,40,99
```

### **Configure Distribution to Core Trunks:**

These links are already Layer 3 routed ports from Lab 1. We need to convert them to trunks.

**Dist-SW1 to Core-SW1:**
```cisco
! On Dist-SW1
Dist-SW1(config)# interface GigabitEthernet0/1
Dist-SW1(config-if)# no ip address
Dist-SW1(config-if)# switchport trunk encapsulation dot1q
Dist-SW1(config-if)# switchport mode trunk
Dist-SW1(config-if)# switchport trunk native vlan 99
Dist-SW1(config-if)# switchport trunk allowed vlan 10,20,30,40,99
Dist-SW1(config-if)# exit

! On Core-SW1
Core-SW1(config)# interface GigabitEthernet0/2
Core-SW1(config-if)# no ip address
Core-SW1(config-if)# switchport trunk encapsulation dot1q
Core-SW1(config-if)# switchport mode trunk
Core-SW1(config-if)# switchport trunk native vlan 99
Core-SW1(config-if)# switchport trunk allowed vlan 10,20,30,40,99
Core-SW1(config-if)# exit
```

**Repeat for:**
- Dist-SW2 ↔ Core-SW1 (Gig0/1 ↔ Gig0/3)
- Dist-SW3 ↔ Core-SW2 (Gig0/1 ↔ Gig0/2)
- Dist-SW4 ↔ Core-SW2 (Gig0/1 ↔ Gig0/3)

**Note:** We're converting from routed ports to trunk ports. This temporarily breaks connectivity - we'll restore it with SVIs.

---

## 🖥️ **Part 4: Configure Inter-VLAN Routing (SVIs)**

Since we removed IP addresses from physical interfaces, we need Switched Virtual Interfaces (SVIs) for each VLAN.

### **Dist-SW1 SVIs (Gateway for VLAN 10):**

```cisco
Dist-SW1(config)# interface Vlan10
Dist-SW1(config-if)# ip address 192.168.10.1 255.255.255.0
Dist-SW1(config-if)# description Gateway for Sales VLAN
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit

! Keep existing point-to-point routing to core
! (This will be configured via subinterfaces or different method in advanced setups)
! For this lab, we'll use a simplified approach with VLAN-based routing
```

**Simplified Approach for Lab 2:**
To maintain connectivity while learning VLANs, we'll keep the distribution-to-core links as routed ports and only trunk the access-to-distribution links.

**Revised Configuration - Distribution to Core (Keep as Routed):**

```cisco
! On Dist-SW1 - Keep Gig0/1 as routed port to Core
Dist-SW1(config)# interface GigabitEthernet0/1
Dist-SW1(config-if)# no switchport
Dist-SW1(config-if)# ip address 10.0.2.2 255.255.255.252
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit

! Configure SVI for Sales VLAN
Dist-SW1(config)# interface Vlan10
Dist-SW1(config-if)# ip address 192.168.10.1 255.255.255.0
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit
```

### **Complete SVI Configuration for All Distribution Switches:**

**Dist-SW1:**
```cisco
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
```

**Dist-SW2:**
```cisco
interface Vlan20
 ip address 192.168.20.1 255.255.255.0
 no shutdown
```

**Dist-SW3:**
```cisco
interface Vlan30
 ip address 192.168.30.1 255.255.255.0
 no shutdown
```

**Dist-SW4:**
```cisco
interface Vlan40
 ip address 192.168.40.1 255.255.255.0
 no shutdown
```

---

## ✅ **Part 5: Verification and Testing**

### **Step 1: Verify VLAN Configuration**

On Access-SW1:
```cisco
Access-SW1# show vlan brief
```

**Expected:** Ports Fa0/1-2 in VLAN 10, Gig0/1 should NOT appear (it's a trunk).

### **Step 2: Verify Trunk Configuration**

On Access-SW1:
```cisco
Access-SW1# show interfaces trunk
```

**Expected Output:**
```
Port        Mode         Encapsulation  Status        Native vlan
Gig0/1      on           802.1q         trunking      99

Port        Vlans allowed on trunk
Gig0/1      10,20,30,40,99

Port        Vlans allowed and active in management domain
Gig0/1      10,20,30,40,99
```

### **Step 3: Verify Inter-VLAN Routing**

On Dist-SW1:
```cisco
Dist-SW1# show ip interface brief | include Vlan
Vlan10                 192.168.10.1    YES manual up                    up
```

### **Step 4: Test Local VLAN Connectivity**

From PC1 (192.168.10.10):
```
ping 192.168.10.20
```
**Expected:** Success (PC2 is in same VLAN)

```
ping 192.168.10.1
```
**Expected:** Success (Gateway)

### **Step 5: Test Inter-VLAN Connectivity**

From PC1:
```
ping 192.168.20.10
```
**Expected:** Success (PC3 in different VLAN, routed via gateway)

```
ping 192.168.30.10
```
**Expected:** Success (Server1)

### **Step 6: Verify VLAN Isolation**

Temporarily remove IP address from PC1, use Layer 2 only test:

1. On Access-SW1, move PC1 to VLAN 20:
```cisco
interface Fa0/1
 switchport access vlan 20
```

2. From PC1, try to ping PC2 (still in VLAN 10)
**Expected:** FAIL (Different broadcast domains, no Layer 2 connectivity)

3. Restore PC1 to VLAN 10:
```cisco
interface Fa0/1
 switchport access vlan 10
```

---

## 🔧 **Part 6: Troubleshooting Common Issues**

### **Problem: Cannot ping devices in same VLAN**

**Diagnosis:**
```cisco
show vlan brief
show interfaces Fa0/1 switchport
```

**Possible causes:**
- Port not assigned to correct VLAN
- Trunk not allowing VLAN
- SVI interface down

**Solution:**
```cisco
interface Fa0/1
 switchport access vlan 10
 no shutdown
```

### **Problem: Cannot ping devices in different VLAN**

**Diagnosis:**
```cisco
show ip interface brief
show ip route
```

**Possible causes:**
- SVI interface down
- No IP address on SVI
- Routing issue (static routes not updated)

**Solution:**
```cisco
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
```

### **Problem: Trunk not working**

**Diagnosis:**
```cisco
show interfaces trunk
show interfaces Gig0/1 switchport
```

**Possible causes:**
- Not configured as trunk on both sides
- Native VLAN mismatch
- Encapsulation mismatch

**Solution:**
```cisco
interface Gig0/1
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk encapsulation dot1q  ! (Layer 3 switches only)
```

### **Problem: Native VLAN mismatch warning**

**Message:**
```
%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered
```

**Solution:** Ensure both sides of trunk use same native VLAN (99):
```cisco
interface Gig0/1
 switchport trunk native vlan 99
```

---

## 📊 **Lab Completion Checklist**

- [ ] All VLANs created on all 10 switches (10, 20, 30, 40, 99)
- [ ] Access ports configured for all end devices
- [ ] Trunk ports configured between access and distribution layers
- [ ] Native VLAN 99 configured on all trunks
- [ ] SVIs configured on distribution switches
- [ ] IP routing still enabled on distribution switches
- [ ] PC1 can ping PC2 (same VLAN)
- [ ] PC1 can ping PC3 (different VLAN, inter-VLAN routing works)
- [ ] PC1 can ping all servers
- [ ] Verified with `show vlan brief`
- [ ] Verified with `show interfaces trunk`
- [ ] Configuration saved on all devices

---

## 🎯 **Lab Deliverables**

Submit the following:
1. ✅ **Packet Tracer file:** `lab02-lastname.pkt`
2. ✅ **Screenshot:** `show vlan brief` from Access-SW1
3. ✅ **Screenshot:** `show interfaces trunk` from Access-SW1
4. ✅ **Screenshot:** Successful ping from PC1 to PC3 (inter-VLAN)
5. ✅ **Screenshot:** `show ip interface brief` from Dist-SW1 showing SVIs
6. ✅ **Written answers** to reflection questions

---

## 🤔 **Reflection Questions**

1. **What is the purpose of VLANs?** How do they improve network security and performance?

2. **What's the difference between an access port and a trunk port?**

3. **Why do we use VLAN 99 as the native VLAN instead of VLAN 1?**

4. **What would happen if you forgot to configure a trunk between Access-SW1 and Dist-SW1?**

5. **Explain how a frame travels from PC1 (VLAN 10) to Server1 (VLAN 30).** Describe each step including tagging/untagging.

6. **Why do we need SVIs on the distribution switches?** What happens if you don't configure them?

7. **What is 802.1Q tagging?** Where is the tag added and removed?

8. **How many broadcast domains exist in this network now?** (Hint: Count the VLANs)

9. **What security benefit does VLAN segmentation provide?**

10. **Why do all switches need to have the same VLANs created?** What happens if a VLAN doesn't exist on a switch?

---

## 🚀 **Next Lab Preview**

**Lab 3: Spanning Tree Protocol (STP)**

In the next lab, you will:
- ✅ **Keep this same topology** (build on Lab 2)
- ➕ Add redundant physical links between switches
- ➕ Configure STP to prevent loops
- ➕ Manually set Root Bridge priorities
- ➕ Enable RSTP for fast convergence
- ➕ Configure PortFast and BPDU Guard
- ➕ Test network failover and recovery

**Save your work!** You'll build on this file in Lab 3.

---

## 📚 **Additional Resources**

- **802.1Q Standard:** IEEE VLAN tagging specification
- **Cisco VLAN Configuration Guide:** cisco.com/c/en/us/support/docs/lan-switching/vlan/
- **VLAN Trunking Protocol (VTP):** Advanced topic for next semester
- **Inter-VLAN Routing Methods:** Router-on-a-stick vs SVI comparison

---

**Lab Created by:** EQ6
**Last Updated:** 2025-12-01
**Version:** 1.0
