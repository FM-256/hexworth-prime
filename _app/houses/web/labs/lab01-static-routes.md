# Lab 1: Static Routes - Foundation Network

**Prepared by:** EQ6
**Course:** Network Essentials
**Estimated Time:** 90 minutes
**Difficulty:** Beginner
**Prerequisites:** Basic understanding of IP addressing

---

## 📋 **Lab Objectives**

By the end of this lab, you will be able to:
- ✅ Build a multi-layer network topology in Packet Tracer
- ✅ Configure IP addresses on routers and switches
- ✅ Implement static routes for inter-network connectivity
- ✅ Configure default gateways on end devices
- ✅ Verify end-to-end connectivity using ping and traceroute
- ✅ Understand routing table entries

---

## 🏗️ **Network Topology**

### **Topology Diagram:**
```
                    [Internet - Simulated]
                           |
                     [Edge-Router]
                      (1.1.1.1)
                           |
                  10.0.0.0/30 (P2P)
                           |
        +------------------+------------------+
        |                                     |
   [Core-SW1]                            [Core-SW2]
   (1.1.2.2)                              (1.1.3.3)
        |                                     |
    +---+---+                             +---+---+
    |       |                             |       |
[Dist-SW1][Dist-SW2]               [Dist-SW3][Dist-SW4]
(1.1.4.4) (1.1.5.5)                (1.1.6.6) (1.1.7.7)
    |       |                             |       |
[Acc-SW1][Acc-SW2]                  [Acc-SW3][Acc-SW4]
    |       |                             |       |
  PC1-2   PC3-4                        Server1-2  Server3-4
```

---

## 📦 **Required Equipment**

### **Packet Tracer Devices:**
- **1x Router:** 1841, 2811, or 2901
- **6x Layer 3 Switches:** 3560, Multilayer Switch, or use routers
- **4x Layer 2 Switches:** 2960 (for access layer)
- **4x PCs:** Generic PC
- **4x Servers:** Generic Server
- **Cables:** Copper Straight-Through and Copper Cross-Over (auto-detect)

---

## 🔢 **IP Addressing Scheme**

### **Loopback Addresses (Router IDs):**
| Device | Loopback0 | Purpose |
|--------|-----------|---------|
| Edge-Router | 1.1.1.1/32 | Router ID |
| Core-SW1 | 1.1.2.2/32 | Router ID |
| Core-SW2 | 1.1.3.3/32 | Router ID |
| Dist-SW1 | 1.1.4.4/32 | Router ID |
| Dist-SW2 | 1.1.5.5/32 | Router ID |
| Dist-SW3 | 1.1.6.6/32 | Router ID |
| Dist-SW4 | 1.1.7.7/32 | Router ID |

### **Point-to-Point Links:**
| Link | Network | Device 1 IP | Device 2 IP |
|------|---------|-------------|-------------|
| Edge ↔ Core-SW1 | 10.0.0.0/30 | 10.0.0.1 | 10.0.0.2 |
| Edge ↔ Core-SW2 | 10.0.1.0/30 | 10.0.1.1 | 10.0.1.2 |
| Core-SW1 ↔ Dist-SW1 | 10.0.2.0/30 | 10.0.2.1 | 10.0.2.2 |
| Core-SW1 ↔ Dist-SW2 | 10.0.3.0/30 | 10.0.3.1 | 10.0.3.2 |
| Core-SW2 ↔ Dist-SW3 | 10.0.4.0/30 | 10.0.4.1 | 10.0.4.2 |
| Core-SW2 ↔ Dist-SW4 | 10.0.5.0/30 | 10.0.5.1 | 10.0.5.2 |

### **User VLANs (Configured as separate subnets for now):**
| VLAN/Segment | Network | Gateway | Connected To |
|--------------|---------|---------|--------------|
| Sales (future VLAN 10) | 192.168.10.0/24 | 192.168.10.1 | Dist-SW1 |
| Engineering (future VLAN 20) | 192.168.20.0/24 | 192.168.20.1 | Dist-SW2 |
| Servers (future VLAN 30) | 192.168.30.0/24 | 192.168.30.1 | Dist-SW3 |
| Management (future VLAN 40) | 192.168.40.0/24 | 192.168.40.1 | Dist-SW4 |

### **End Device IPs:**
| Device | IP Address | Gateway | Connected To |
|--------|------------|---------|--------------|
| PC1 | 192.168.10.10 | 192.168.10.1 | Access-SW1 |
| PC2 | 192.168.10.20 | 192.168.10.1 | Access-SW1 |
| PC3 | 192.168.20.10 | 192.168.20.1 | Access-SW2 |
| PC4 | 192.168.20.20 | 192.168.20.1 | Access-SW2 |
| Server1 | 192.168.30.10 | 192.168.30.1 | Access-SW3 |
| Server2 | 192.168.30.20 | 192.168.30.1 | Access-SW3 |
| Server3 | 192.168.40.10 | 192.168.40.1 | Access-SW4 |
| Server4 | 192.168.40.20 | 192.168.40.1 | Access-SW4 |

---

## 📝 **Part 1: Build the Physical Topology**

### **Step 1: Add Devices to Workspace**

1. Open Cisco Packet Tracer
2. Add devices from the device panel:
   - **Routers:** 1x Router (1841 or 2901)
   - **Switches:** 6x Layer 3 switches (3560) + 4x Layer 2 switches (2960)
   - **End Devices:** 4x PC + 4x Server

3. **Rename devices** (click on device, Config tab, Display Name):
   ```
   Router → Edge-Router
   Switch0 → Core-SW1
   Switch1 → Core-SW2
   Switch2 → Dist-SW1
   Switch3 → Dist-SW2
   Switch4 → Dist-SW3
   Switch5 → Dist-SW4
   Switch6 → Access-SW1
   Switch7 → Access-SW2
   Switch8 → Access-SW3
   Switch9 → Access-SW4
   PC0 → PC1
   PC1 → PC2
   (etc.)
   ```

### **Step 2: Connect Devices with Cables**

Use **Copper Straight-Through** cables for all connections:

**Edge Router Connections:**
```
Edge-Router GigabitEthernet0/0 → Core-SW1 GigabitEthernet0/1
Edge-Router GigabitEthernet0/1 → Core-SW2 GigabitEthernet0/1
```

**Core to Distribution:**
```
Core-SW1 GigabitEthernet0/2 → Dist-SW1 GigabitEthernet0/1
Core-SW1 GigabitEthernet0/3 → Dist-SW2 GigabitEthernet0/1
Core-SW2 GigabitEthernet0/2 → Dist-SW3 GigabitEthernet0/1
Core-SW2 GigabitEthernet0/3 → Dist-SW4 GigabitEthernet0/1
```

**Distribution to Access:**
```
Dist-SW1 GigabitEthernet0/2 → Access-SW1 GigabitEthernet0/1
Dist-SW2 GigabitEthernet0/2 → Access-SW2 GigabitEthernet0/1
Dist-SW3 GigabitEthernet0/2 → Access-SW3 GigabitEthernet0/1
Dist-SW4 GigabitEthernet0/2 → Access-SW4 GigabitEthernet0/1
```

**Access to End Devices:**
```
Access-SW1 FastEthernet0/1 → PC1 FastEthernet0
Access-SW1 FastEthernet0/2 → PC2 FastEthernet0
Access-SW2 FastEthernet0/1 → PC3 FastEthernet0
Access-SW2 FastEthernet0/2 → PC4 FastEthernet0
Access-SW3 FastEthernet0/1 → Server1 FastEthernet0
Access-SW3 FastEthernet0/2 → Server2 FastEthernet0
Access-SW4 FastEthernet0/1 → Server3 FastEthernet0
Access-SW4 FastEthernet0/2 → Server4 FastEthernet0
```

**Verification:** All link lights should turn green after a few seconds.

---

## ⚙️ **Part 2: Configure Edge Router**

### **Step 1: Basic Configuration**

Click on Edge-Router → CLI tab:

```cisco
Router> enable
Router# configure terminal

! Set hostname
Router(config)# hostname Edge-Router

! Create loopback for Router ID
Edge-Router(config)# interface Loopback0
Edge-Router(config-if)# ip address 1.1.1.1 255.255.255.255
Edge-Router(config-if)# description Router ID
Edge-Router(config-if)# exit

! Configure interface to Core-SW1
Edge-Router(config)# interface GigabitEthernet0/0
Edge-Router(config-if)# ip address 10.0.0.1 255.255.255.252
Edge-Router(config-if)# description Link to Core-SW1
Edge-Router(config-if)# no shutdown
Edge-Router(config-if)# exit

! Configure interface to Core-SW2
Edge-Router(config)# interface GigabitEthernet0/1
Edge-Router(config-if)# ip address 10.0.1.1 255.255.255.252
Edge-Router(config-if)# description Link to Core-SW2
Edge-Router(config-if)# no shutdown
Edge-Router(config-if)# exit

! Save configuration
Edge-Router(config)# exit
Edge-Router# copy running-config startup-config
```

### **Step 2: Verify Interface Status**

```cisco
Edge-Router# show ip interface brief
```

**Expected Output:**
```
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.0.0.1        YES manual up                    up
GigabitEthernet0/1     10.0.1.1        YES manual up                    up
Loopback0              1.1.1.1         YES manual up                    up
```

---

## 🔧 **Part 3: Configure Core Switches (Layer 3)**

### **Core-SW1 Configuration:**

```cisco
Switch> enable
Switch# configure terminal

! Set hostname
Switch(config)# hostname Core-SW1

! Enable IP routing (required for Layer 3 switching)
Core-SW1(config)# ip routing

! Create loopback
Core-SW1(config)# interface Loopback0
Core-SW1(config-if)# ip address 1.1.2.2 255.255.255.255
Core-SW1(config-if)# exit

! Configure interface to Edge-Router
Core-SW1(config)# interface GigabitEthernet0/1
Core-SW1(config-if)# no switchport
Core-SW1(config-if)# ip address 10.0.0.2 255.255.255.252
Core-SW1(config-if)# description Link to Edge-Router
Core-SW1(config-if)# no shutdown
Core-SW1(config-if)# exit

! Configure interface to Dist-SW1
Core-SW1(config)# interface GigabitEthernet0/2
Core-SW1(config-if)# no switchport
Core-SW1(config-if)# ip address 10.0.2.1 255.255.255.252
Core-SW1(config-if)# description Link to Dist-SW1
Core-SW1(config-if)# no shutdown
Core-SW1(config-if)# exit

! Configure interface to Dist-SW2
Core-SW1(config)# interface GigabitEthernet0/3
Core-SW1(config-if)# no switchport
Core-SW1(config-if)# ip address 10.0.3.1 255.255.255.252
Core-SW1(config-if)# description Link to Dist-SW2
Core-SW1(config-if)# no shutdown
Core-SW1(config-if)# exit

! Save configuration
Core-SW1(config)# exit
Core-SW1# copy running-config startup-config
```

### **Core-SW2 Configuration:**

```cisco
Switch> enable
Switch# configure terminal
Switch(config)# hostname Core-SW2
Core-SW2(config)# ip routing

Core-SW2(config)# interface Loopback0
Core-SW2(config-if)# ip address 1.1.3.3 255.255.255.255
Core-SW2(config-if)# exit

Core-SW2(config)# interface GigabitEthernet0/1
Core-SW2(config-if)# no switchport
Core-SW2(config-if)# ip address 10.0.1.2 255.255.255.252
Core-SW2(config-if)# description Link to Edge-Router
Core-SW2(config-if)# no shutdown
Core-SW2(config-if)# exit

Core-SW2(config)# interface GigabitEthernet0/2
Core-SW2(config-if)# no switchport
Core-SW2(config-if)# ip address 10.0.4.1 255.255.255.252
Core-SW2(config-if)# description Link to Dist-SW3
Core-SW2(config-if)# no shutdown
Core-SW2(config-if)# exit

Core-SW2(config)# interface GigabitEthernet0/3
Core-SW2(config-if)# no switchport
Core-SW2(config-if)# ip address 10.0.5.1 255.255.255.252
Core-SW2(config-if)# description Link to Dist-SW4
Core-SW2(config-if)# no shutdown
Core-SW2(config-if)# exit

Core-SW2# copy running-config startup-config
```

---

## 🌐 **Part 4: Configure Distribution Switches**

### **Dist-SW1 Configuration:**

```cisco
Switch> enable
Switch# configure terminal
Switch(config)# hostname Dist-SW1
Dist-SW1(config)# ip routing

Dist-SW1(config)# interface Loopback0
Dist-SW1(config-if)# ip address 1.1.4.4 255.255.255.255
Dist-SW1(config-if)# exit

! Uplink to Core-SW1
Dist-SW1(config)# interface GigabitEthernet0/1
Dist-SW1(config-if)# no switchport
Dist-SW1(config-if)# ip address 10.0.2.2 255.255.255.252
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit

! Downlink to Access-SW1 (will be Layer 2 for now, Layer 3 SVI for user VLAN)
Dist-SW1(config)# interface GigabitEthernet0/2
Dist-SW1(config-if)# switchport mode access
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit

! Create SVI for user network
Dist-SW1(config)# interface Vlan1
Dist-SW1(config-if)# ip address 192.168.10.1 255.255.255.0
Dist-SW1(config-if)# description Gateway for Sales Network
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit

Dist-SW1# copy running-config startup-config
```

### **Dist-SW2 Configuration:**

```cisco
Switch> enable
Switch# configure terminal
Switch(config)# hostname Dist-SW2
Dist-SW2(config)# ip routing

Dist-SW2(config)# interface Loopback0
Dist-SW2(config-if)# ip address 1.1.5.5 255.255.255.255
Dist-SW2(config-if)# exit

Dist-SW2(config)# interface GigabitEthernet0/1
Dist-SW2(config-if)# no switchport
Dist-SW2(config-if)# ip address 10.0.3.2 255.255.255.252
Dist-SW2(config-if)# no shutdown
Dist-SW2(config-if)# exit

Dist-SW2(config)# interface GigabitEthernet0/2
Dist-SW2(config-if)# switchport mode access
Dist-SW2(config-if)# no shutdown
Dist-SW2(config-if)# exit

Dist-SW2(config)# interface Vlan1
Dist-SW2(config-if)# ip address 192.168.20.1 255.255.255.0
Dist-SW2(config-if)# description Gateway for Engineering Network
Dist-SW2(config-if)# no shutdown
Dist-SW2(config-if)# exit

Dist-SW2# copy running-config startup-config
```

### **Dist-SW3 Configuration:**

```cisco
Switch> enable
Switch# configure terminal
Switch(config)# hostname Dist-SW3
Dist-SW3(config)# ip routing

Dist-SW3(config)# interface Loopback0
Dist-SW3(config-if)# ip address 1.1.6.6 255.255.255.255
Dist-SW3(config-if)# exit

Dist-SW3(config)# interface GigabitEthernet0/1
Dist-SW3(config-if)# no switchport
Dist-SW3(config-if)# ip address 10.0.4.2 255.255.255.252
Dist-SW3(config-if)# no shutdown
Dist-SW3(config-if)# exit

Dist-SW3(config)# interface GigabitEthernet0/2
Dist-SW3(config-if)# switchport mode access
Dist-SW3(config-if)# no shutdown
Dist-SW3(config-if)# exit

Dist-SW3(config)# interface Vlan1
Dist-SW3(config-if)# ip address 192.168.30.1 255.255.255.0
Dist-SW3(config-if)# description Gateway for Server Network
Dist-SW3(config-if)# no shutdown
Dist-SW3(config-if)# exit

Dist-SW3# copy running-config startup-config
```

### **Dist-SW4 Configuration:**

```cisco
Switch> enable
Switch# configure terminal
Switch(config)# hostname Dist-SW4
Dist-SW4(config)# ip routing

Dist-SW4(config)# interface Loopback0
Dist-SW4(config-if)# ip address 1.1.7.7 255.255.255.255
Dist-SW4(config-if)# exit

Dist-SW4(config)# interface GigabitEthernet0/1
Dist-SW4(config-if)# no switchport
Dist-SW4(config-if)# ip address 10.0.5.2 255.255.255.252
Dist-SW4(config-if)# no shutdown
Dist-SW4(config-if)# exit

Dist-SW4(config)# interface GigabitEthernet0/2
Dist-SW4(config-if)# switchport mode access
Dist-SW4(config-if)# no shutdown
Dist-SW4(config-if)# exit

Dist-SW4(config)# interface Vlan1
Dist-SW4(config-if)# ip address 192.168.40.1 255.255.255.0
Dist-SW4(config-if)# description Gateway for Management Network
Dist-SW4(config-if)# no shutdown
Dist-SW4(config-if)# exit

Dist-SW4# copy running-config startup-config
```

---

## 🔌 **Part 5: Configure Access Switches (Layer 2)**

Access switches are simple Layer 2 switches - no IP routing needed.

### **Access-SW1 Configuration:**

```cisco
Switch> enable
Switch# configure terminal
Switch(config)# hostname Access-SW1

! All ports in default VLAN 1 (will change in Lab 2)
Access-SW1(config)# interface range FastEthernet0/1-2
Access-SW1(config-if-range)# switchport mode access
Access-SW1(config-if-range)# no shutdown
Access-SW1(config-if-range)# exit

! Uplink to distribution
Access-SW1(config)# interface GigabitEthernet0/1
Access-SW1(config-if)# switchport mode access
Access-SW1(config-if)# no shutdown
Access-SW1(config-if)# exit

Access-SW1# copy running-config startup-config
```

**Repeat similar configuration for Access-SW2, Access-SW3, Access-SW4:**
- Replace hostname
- Configure FastEthernet0/1-2 for end devices
- Configure GigabitEthernet0/1 for uplink

---

## 💻 **Part 6: Configure End Devices**

### **Configure PCs:**

For each PC, click on device → Desktop tab → IP Configuration:

**PC1:**
- IP Address: `192.168.10.10`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.10.1`

**PC2:**
- IP Address: `192.168.10.20`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.10.1`

**PC3:**
- IP Address: `192.168.20.10`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.20.1`

**PC4:**
- IP Address: `192.168.20.20`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.20.1`

### **Configure Servers:**

**Server1:**
- IP Address: `192.168.30.10`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.30.1`

**Server2:**
- IP Address: `192.168.30.20`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.30.1`

**Server3:**
- IP Address: `192.168.40.10`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.40.1`

**Server4:**
- IP Address: `192.168.40.20`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.40.1`

---

## 🛣️ **Part 7: Configure Static Routes**

Now we need to tell each router/switch how to reach remote networks.

### **Edge-Router Static Routes:**

```cisco
Edge-Router(config)# ip route 192.168.10.0 255.255.255.0 10.0.0.2
Edge-Router(config)# ip route 192.168.20.0 255.255.255.0 10.0.0.2
Edge-Router(config)# ip route 192.168.30.0 255.255.255.0 10.0.1.2
Edge-Router(config)# ip route 192.168.40.0 255.255.255.0 10.0.1.2
```

### **Core-SW1 Static Routes:**

```cisco
Core-SW1(config)# ip route 192.168.10.0 255.255.255.0 10.0.2.2
Core-SW1(config)# ip route 192.168.20.0 255.255.255.0 10.0.3.2
Core-SW1(config)# ip route 192.168.30.0 255.255.255.0 10.0.0.1
Core-SW1(config)# ip route 192.168.40.0 255.255.255.0 10.0.0.1
```

### **Core-SW2 Static Routes:**

```cisco
Core-SW2(config)# ip route 192.168.10.0 255.255.255.0 10.0.1.1
Core-SW2(config)# ip route 192.168.20.0 255.255.255.0 10.0.1.1
Core-SW2(config)# ip route 192.168.30.0 255.255.255.0 10.0.4.2
Core-SW2(config)# ip route 192.168.40.0 255.255.255.0 10.0.5.2
```

### **Dist-SW1 Static Routes:**

```cisco
Dist-SW1(config)# ip route 0.0.0.0 0.0.0.0 10.0.2.1
! (Default route - send everything to Core-SW1)
```

### **Dist-SW2 Static Routes:**

```cisco
Dist-SW2(config)# ip route 0.0.0.0 0.0.0.0 10.0.3.1
```

### **Dist-SW3 Static Routes:**

```cisco
Dist-SW3(config)# ip route 0.0.0.0 0.0.0.0 10.0.4.1
```

### **Dist-SW4 Static Routes:**

```cisco
Dist-SW4(config)# ip route 0.0.0.0 0.0.0.0 10.0.5.1
```

**Save all configurations:**
```cisco
copy running-config startup-config
```

---

## ✅ **Part 8: Verification and Testing**

### **Step 1: Verify Routing Tables**

On **Edge-Router:**
```cisco
Edge-Router# show ip route
```

**Expected to see:**
```
Gateway of last resort is not set

      1.0.0.0/32 is subnetted, 1 subnets
C        1.1.1.1 is directly connected, Loopback0
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/0
C        10.0.1.0/30 is directly connected, GigabitEthernet0/1
S     192.168.10.0/24 [1/0] via 10.0.0.2
S     192.168.20.0/24 [1/0] via 10.0.0.2
S     192.168.30.0/24 [1/0] via 10.0.1.2
S     192.168.40.0/24 [1/0] via 10.0.1.2
```

**Legend:**
- **C** = Directly connected
- **S** = Static route
- **[1/0]** = [Administrative Distance / Metric]

### **Step 2: Test Local Connectivity**

On **PC1**, open Command Prompt (Desktop tab):
```
ping 192.168.10.1
```
**Expected:** Successful (pinging own gateway)

```
ping 192.168.10.20
```
**Expected:** Successful (pinging PC2 on same network)

### **Step 3: Test Remote Connectivity**

From **PC1:**
```
ping 192.168.20.10
```
**Expected:** Successful (pinging PC3 on different network)

```
ping 192.168.30.10
```
**Expected:** Successful (pinging Server1)

### **Step 4: Trace Packet Path**

From **PC1:**
```
tracert 192.168.30.10
```

**Expected output:**
```
Tracing route to 192.168.30.10 over a maximum of 30 hops:
  1    <1 ms    <1 ms    <1 ms    192.168.10.1  (Dist-SW1)
  2    1 ms     1 ms     1 ms     10.0.2.1      (Core-SW1)
  3    1 ms     1 ms     1 ms     10.0.0.1      (Edge-Router)
  4    2 ms     2 ms     2 ms     10.0.1.2      (Core-SW2)
  5    2 ms     2 ms     2 ms     192.168.30.10 (Server1)
```

### **Step 5: Complete Connectivity Matrix**

Test connectivity from PC1 to all other devices:

| Source | Destination | Expected Result |
|--------|-------------|-----------------|
| PC1 | 192.168.10.20 (PC2) | ✅ Success |
| PC1 | 192.168.20.10 (PC3) | ✅ Success |
| PC1 | 192.168.30.10 (Server1) | ✅ Success |
| PC1 | 192.168.40.10 (Server3) | ✅ Success |

**If any ping fails, troubleshoot using these steps:**

1. **Check local IP:** `ipconfig` on PC
2. **Check gateway:** `ping 192.168.10.1`
3. **Check routing table:** `show ip route` on distribution switch
4. **Check static routes:** Are they configured correctly?
5. **Check interface status:** `show ip interface brief`

---

## 📊 **Lab Completion Checklist**

- [ ] All devices added and renamed
- [ ] All cables connected (green link lights)
- [ ] All IP addresses configured correctly
- [ ] All interfaces showing "up/up" status
- [ ] Static routes configured on all Layer 3 devices
- [ ] End devices can ping their gateways
- [ ] PC1 can ping all other end devices
- [ ] Routing tables show correct routes
- [ ] Traceroute shows expected path
- [ ] Configuration saved on all devices

---

## 🎯 **Lab Deliverables**

Submit the following:
1. ✅ **Packet Tracer file:** `lab01-lastname.pkt`
2. ✅ **Screenshot:** Successful ping from PC1 to Server1
3. ✅ **Screenshot:** Traceroute output from PC1 to Server3
4. ✅ **Screenshot:** `show ip route` from Edge-Router
5. ✅ **Written answers** to reflection questions below

---

## 🤔 **Reflection Questions**

Answer these questions in a separate document:

1. **Why do we need static routes?** What would happen if they weren't configured?

2. **What is the difference between a directly connected route (C) and a static route (S)?**

3. **Why do distribution switches use default routes (`0.0.0.0/0`) instead of specific static routes?**

4. **What happens if you remove the static route from Edge-Router to 192.168.10.0/24?** Try it and document the result.

5. **How many hops does it take for PC1 to reach Server1?** Is this the most efficient path?

---

## 🔧 **Troubleshooting Guide**

### **Problem: Cannot ping gateway**
- **Check:** Is IP address configured correctly on PC?
- **Check:** Is default gateway correct?
- **Check:** Is VLAN1 interface up on distribution switch?
- **Command:** `show ip interface brief` on switch

### **Problem: Can ping gateway but not remote networks**
- **Check:** Are static routes configured?
- **Check:** Routing table with `show ip route`
- **Check:** Is next-hop IP reachable?

### **Problem: Interface shows "down/down"**
- **Check:** Is cable connected?
- **Check:** Did you use `no shutdown` command?
- **Command:** `show interface GigabitEthernet0/1`

### **Problem: Static route not appearing in routing table**
- **Check:** Syntax - `ip route [network] [mask] [next-hop]`
- **Check:** Is next-hop IP address reachable?
- **Check:** Did you save configuration?

---

## 🚀 **Next Lab Preview**

**Lab 2: Add VLANs and Trunking**

In the next lab, you will:
- ✅ **Keep this same topology** (don't start over!)
- ➕ Segment networks into VLANs (10, 20, 30, 40)
- ➕ Configure trunk links between switches
- ➕ Implement 802.1Q tagging
- ➕ Configure inter-VLAN routing

**Save your work!** You'll build on this file in Lab 2.

---

## 📚 **Additional Resources**

- **Cisco IOS Command Reference:** [cisco.com/c/en/us/support/ios-nx-os-software/](https://www.cisco.com/c/en/us/support/ios-nx-os-software/)
- **Packet Tracer Tutorials:** Built-in Help → Tutorials
- **Subnetting Practice:** [subnetipv4.com](http://www.subnetipv4.com)
- **Routing Fundamentals:** Course lecture notes

---

**Lab Created by:** EQ6
**Last Updated:** 2025-12-01
**Version:** 1.0
