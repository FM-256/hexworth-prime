# Lab 3: Spanning Tree Protocol (STP) - Adding Redundancy and Loop Prevention

**Prepared by:** EQ6
**Course:** Network Essentials
**Estimated Time:** 120 minutes
**Difficulty:** Intermediate
**Prerequisites:** Completion of Lab 1 (Static Routes) and Lab 2 (VLANs and Trunking)

---

## 📋 **Lab Objectives**

By the end of this lab, you will be able to:
- ✅ Add redundant physical links to create network resilience
- ✅ Understand and identify Layer 2 switching loops
- ✅ Configure Rapid Spanning Tree Protocol (RSTP/Rapid-PVST+)
- ✅ Configure root bridge priorities per VLAN
- ✅ Enable PortFast on access ports for faster connectivity
- ✅ Implement BPDU Guard to prevent rogue switches
- ✅ Verify STP port states and roles
- ✅ Test failover and convergence during link failures
- ✅ Troubleshoot STP issues

---

## 🏗️ **Network Topology**

### **Updated Topology Diagram with Redundant Links:**
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
   [Core-SW1]=============================[Core-SW2]
   (1.1.2.2)          REDUNDANT            (1.1.3.3)
        |                                     |
    +---+---+                             +---+---+
    |       |                             |       |
[Dist-SW1]=[Dist-SW2]               [Dist-SW3]=[Dist-SW4]
(1.1.4.4) (1.1.5.5)                (1.1.6.6) (1.1.7.7)
    |       |                             |       |
[Acc-SW1][Acc-SW2]                  [Acc-SW3][Acc-SW4]
    |       |                             |       |
  PC1-2   PC3-4                        Server1-2  Server3-4

Legend:
= (double lines) = Redundant/New trunk links added in Lab 3
```

### **New Redundant Links Added in This Lab:**
1. **Core-SW1 ↔ Core-SW2** (Second link - creates loop at core)
2. **Dist-SW1 ↔ Dist-SW2** (Cross-connect - creates loop at distribution)
3. **Dist-SW3 ↔ Dist-SW4** (Cross-connect - creates loop at distribution)

**Why Add Redundancy?**
- Provides alternative paths if primary link fails
- Increases network availability
- BUT: Creates switching loops that must be prevented by STP

---

## 📦 **Required Equipment**

Same as Lab 1 and Lab 2:
- **1x Router:** 1841, 2811, or 2901
- **6x Layer 3 Switches:** 3560 (Core and Distribution)
- **4x Layer 2 Switches:** 2960 (Access Layer)
- **4x PCs and 4x Servers**
- **Additional Cables:** For redundant links

---

## 🔢 **VLAN Scheme (From Lab 2)**

| VLAN ID | Name | Network | Gateway | Root Bridge (Primary) | Root Bridge (Secondary) |
|---------|------|---------|---------|----------------------|------------------------|
| 10 | Sales | 192.168.10.0/24 | 192.168.10.1 | Core-SW1 (priority 4096) | Core-SW2 (priority 8192) |
| 20 | Engineering | 192.168.20.0/24 | 192.168.20.1 | Core-SW1 (priority 4096) | Core-SW2 (priority 8192) |
| 30 | Servers | 192.168.30.0/24 | 192.168.30.1 | Core-SW2 (priority 4096) | Core-SW1 (priority 8192) |
| 40 | Management | 192.168.40.0/24 | 192.168.40.1 | Core-SW2 (priority 4096) | Core-SW1 (priority 8192) |
| 99 | Native | - | - | Default | Default |

**STP Root Bridge Strategy:**
- Core-SW1 is primary root for VLANs 10 and 20
- Core-SW2 is primary root for VLANs 30 and 40
- This provides load balancing across core switches

---

## 📝 **Part 1: Understanding the Problem - Switching Loops**

### **Step 1: Open Your Lab 2 Packet Tracer File**

1. Open your saved file from Lab 2: `lab02-lastname.pkt`
2. Verify all VLANs are configured and working
3. Verify trunk links are operational

**Quick Verification Commands:**
```cisco
show vlan brief
show interfaces trunk
show spanning-tree summary
```

### **Step 2: Understanding Broadcast Storms**

**What happens without STP?**
When you have redundant Layer 2 paths:
1. Broadcast frames loop infinitely
2. MAC address tables become unstable
3. Network becomes unusable within seconds
4. Switch CPU utilization reaches 100%

**STP Solution:**
- Automatically detects loops
- Blocks redundant ports to create loop-free topology
- Maintains blocked ports as standby for failover

---

## 🔗 **Part 2: Add Redundant Physical Links**

### **Step 1: Cable the Redundant Core Link**

Add a second link between core switches:

```
Core-SW1 GigabitEthernet0/4 → Core-SW2 GigabitEthernet0/4
```

**Note:** Packet Tracer will immediately show port states changing as STP detects the loop.

### **Step 2: Cable Distribution Cross-Connects**

Add cross-connect links:

```
Dist-SW1 GigabitEthernet0/3 → Dist-SW2 GigabitEthernet0/3
Dist-SW3 GigabitEthernet0/3 → Dist-SW4 GigabitEthernet0/3
```

### **Step 3: Verify Physical Connectivity**

All new links should show green (physically up), but some ports may be in blocking state (orange/amber in Packet Tracer).

**This is normal and expected!** STP is preventing loops.

---

## ⚙️ **Part 3: Configure Redundant Links as Trunks**

All redundant links must carry all VLANs, so configure them as trunks.

### **Core-SW1 Configuration:**

```cisco
Core-SW1> enable
Core-SW1# configure terminal

! Configure redundant link to Core-SW2
Core-SW1(config)# interface GigabitEthernet0/4
Core-SW1(config-if)# description Redundant Link to Core-SW2
Core-SW1(config-if)# switchport trunk encapsulation dot1q
Core-SW1(config-if)# switchport mode trunk
Core-SW1(config-if)# switchport trunk native vlan 99
Core-SW1(config-if)# switchport trunk allowed vlan 10,20,30,40,99
Core-SW1(config-if)# no shutdown
Core-SW1(config-if)# exit

Core-SW1# copy running-config startup-config
```

### **Core-SW2 Configuration:**

```cisco
Core-SW2> enable
Core-SW2# configure terminal

Core-SW2(config)# interface GigabitEthernet0/4
Core-SW2(config-if)# description Redundant Link to Core-SW1
Core-SW2(config-if)# switchport trunk encapsulation dot1q
Core-SW2(config-if)# switchport mode trunk
Core-SW2(config-if)# switchport trunk native vlan 99
Core-SW2(config-if)# switchport trunk allowed vlan 10,20,30,40,99
Core-SW2(config-if)# no shutdown
Core-SW2(config-if)# exit

Core-SW2# copy running-config startup-config
```

### **Dist-SW1 Configuration:**

```cisco
Dist-SW1> enable
Dist-SW1# configure terminal

Dist-SW1(config)# interface GigabitEthernet0/3
Dist-SW1(config-if)# description Cross-Connect to Dist-SW2
Dist-SW1(config-if)# switchport trunk encapsulation dot1q
Dist-SW1(config-if)# switchport mode trunk
Dist-SW1(config-if)# switchport trunk native vlan 99
Dist-SW1(config-if)# switchport trunk allowed vlan 10,20,99
Dist-SW1(config-if)# no shutdown
Dist-SW1(config-if)# exit

Dist-SW1# copy running-config startup-config
```

### **Dist-SW2 Configuration:**

```cisco
Dist-SW2> enable
Dist-SW2# configure terminal

Dist-SW2(config)# interface GigabitEthernet0/3
Dist-SW2(config-if)# description Cross-Connect to Dist-SW1
Dist-SW2(config-if)# switchport trunk encapsulation dot1q
Dist-SW2(config-if)# switchport mode trunk
Dist-SW2(config-if)# switchport trunk native vlan 99
Dist-SW2(config-if)# switchport trunk allowed vlan 10,20,99
Dist-SW2(config-if)# no shutdown
Dist-SW2(config-if)# exit

Dist-SW2# copy running-config startup-config
```

### **Dist-SW3 Configuration:**

```cisco
Dist-SW3> enable
Dist-SW3# configure terminal

Dist-SW3(config)# interface GigabitEthernet0/3
Dist-SW3(config-if)# description Cross-Connect to Dist-SW4
Dist-SW3(config-if)# switchport trunk encapsulation dot1q
Dist-SW3(config-if)# switchport mode trunk
Dist-SW3(config-if)# switchport trunk native vlan 99
Dist-SW3(config-if)# switchport trunk allowed vlan 30,40,99
Dist-SW3(config-if)# no shutdown
Dist-SW3(config-if)# exit

Dist-SW3# copy running-config startup-config
```

### **Dist-SW4 Configuration:**

```cisco
Dist-SW4> enable
Dist-SW4# configure terminal

Dist-SW4(config)# interface GigabitEthernet0/3
Dist-SW4(config-if)# description Cross-Connect to Dist-SW3
Dist-SW4(config-if)# switchport trunk encapsulation dot1q
Dist-SW4(config-if)# switchport mode trunk
Dist-SW4(config-if)# switchport trunk native vlan 99
Dist-SW4(config-if)# switchport trunk allowed vlan 30,40,99
Dist-SW4(config-if)# no shutdown
Dist-SW4(config-if)# exit

Dist-SW4# copy running-config startup-config
```

### **Verify Trunk Configuration:**

```cisco
show interfaces trunk
```

**Expected Output:**
All trunk ports (including new redundant links) should show:
- Status: `trunking`
- Native VLAN: `99`
- Allowed VLANs: `10,20,30,40,99` (or subset)

---

## 🌲 **Part 4: Configure Rapid Spanning Tree Protocol (RSTP)**

By default, Cisco switches run PVST+ (Per-VLAN Spanning Tree Plus). We'll upgrade to Rapid-PVST+ for faster convergence.

### **Configure RSTP on All Switches:**

Run these commands on **ALL switches** (Core, Distribution, and Access):

```cisco
Switch> enable
Switch# configure terminal

! Enable Rapid-PVST+ mode
Switch(config)# spanning-tree mode rapid-pvst

! Verify
Switch(config)# exit
Switch# show spanning-tree summary
```

**Expected Output:**
```
Switch is in rapid-pvst mode
Root bridge for: none
```

**Configure on these switches:**
1. Core-SW1
2. Core-SW2
3. Dist-SW1
4. Dist-SW2
5. Dist-SW3
6. Dist-SW4
7. Access-SW1
8. Access-SW2
9. Access-SW3
10. Access-SW4

---

## 👑 **Part 5: Configure Root Bridge Priorities**

### **Strategy:**

**Load Balancing:**
- Core-SW1: Primary root for VLANs 10, 20
- Core-SW2: Primary root for VLANs 30, 40

**Priorities:**
- Primary Root: 4096 (lowest priority wins)
- Secondary Root: 8192
- Default: 32768

### **Core-SW1 Configuration:**

```cisco
Core-SW1> enable
Core-SW1# configure terminal

! Set as primary root for VLANs 10 and 20
Core-SW1(config)# spanning-tree vlan 10 priority 4096
Core-SW1(config)# spanning-tree vlan 20 priority 4096

! Set as secondary root for VLANs 30 and 40
Core-SW1(config)# spanning-tree vlan 30 priority 8192
Core-SW1(config)# spanning-tree vlan 40 priority 8192

! Set Native VLAN priority
Core-SW1(config)# spanning-tree vlan 99 priority 4096

Core-SW1(config)# exit
Core-SW1# copy running-config startup-config
```

### **Core-SW2 Configuration:**

```cisco
Core-SW2> enable
Core-SW2# configure terminal

! Set as secondary root for VLANs 10 and 20
Core-SW2(config)# spanning-tree vlan 10 priority 8192
Core-SW2(config)# spanning-tree vlan 20 priority 8192

! Set as primary root for VLANs 30 and 40
Core-SW2(config)# spanning-tree vlan 30 priority 4096
Core-SW2(config)# spanning-tree vlan 40 priority 4096

! Set Native VLAN priority
Core-SW2(config)# spanning-tree vlan 99 priority 8192

Core-SW2(config)# exit
Core-SW2# copy running-config startup-config
```

### **Verify Root Bridge Election:**

On **Core-SW1:**
```cisco
Core-SW1# show spanning-tree vlan 10
```

**Expected Output:**
```
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    4106
             Address     [MAC of Core-SW1]
             This bridge is the root
  Bridge ID  Priority    4106 (priority 4096 sys-id-ext 10)
             Address     [MAC of Core-SW1]
```

On **Core-SW2:**
```cisco
Core-SW2# show spanning-tree vlan 30
```

**Expected Output:**
```
VLAN0030
  Spanning tree enabled protocol rstp
  Root ID    Priority    4126
             Address     [MAC of Core-SW2]
             This bridge is the root
  Bridge ID  Priority    4126 (priority 4096 sys-id-ext 30)
             Address     [MAC of Core-SW2]
```

---

## 🚀 **Part 6: Configure PortFast on Access Ports**

PortFast allows access ports to bypass STP listening and learning states, providing immediate connectivity to end devices.

**IMPORTANT:** Only enable PortFast on ports connected to end devices (PCs, servers), NEVER on trunk ports or ports connecting to other switches!

### **Access-SW1 Configuration:**

```cisco
Access-SW1> enable
Access-SW1# configure terminal

! Enable PortFast on access ports connected to PCs
Access-SW1(config)# interface range FastEthernet0/1-2
Access-SW1(config-if-range)# spanning-tree portfast
Access-SW1(config-if-range)# exit

Access-SW1# copy running-config startup-config
```

**Expected Warning:**
```
%Warning: portfast should only be enabled on ports connected to a single
host. Connecting hubs, concentrators, switches, bridges, etc... to this
interface when portfast is enabled, can cause temporary bridging loops.
Use with CAUTION
```

### **Configure PortFast on All Access Switches:**

**Access-SW2:**
```cisco
Access-SW2(config)# interface range FastEthernet0/1-2
Access-SW2(config-if-range)# spanning-tree portfast
Access-SW2(config-if-range)# exit
```

**Access-SW3:**
```cisco
Access-SW3(config)# interface range FastEthernet0/1-2
Access-SW3(config-if-range)# spanning-tree portfast
Access-SW3(config-if-range)# exit
```

**Access-SW4:**
```cisco
Access-SW4(config)# interface range FastEthernet0/1-2
Access-SW4(config-if-range)# spanning-tree portfast
Access-SW4(config-if-range)# exit
```

### **Verify PortFast:**

```cisco
Access-SW1# show spanning-tree interface FastEthernet0/1 detail
```

**Look for:**
```
Port 1 (FastEthernet0/1) of VLAN0010 is designated forwarding
  Port path cost 19, Port priority 128, Port Identifier 128.1
  Designated root has priority 4106, address [MAC]
  ...
  The port is in the portfast mode
```

---

## 🛡️ **Part 7: Configure BPDU Guard**

BPDU Guard protects against rogue switches by shutting down any PortFast-enabled port that receives a BPDU (Bridge Protocol Data Unit).

### **Enable BPDU Guard Globally:**

Configure on **all access switches**:

```cisco
Access-SW1> enable
Access-SW1# configure terminal

! Enable BPDU Guard globally on all PortFast ports
Access-SW1(config)# spanning-tree portfast bpduguard default

Access-SW1(config)# exit
Access-SW1# copy running-config startup-config
```

**Repeat on:**
- Access-SW2
- Access-SW3
- Access-SW4

### **Alternative: Per-Interface BPDU Guard:**

```cisco
! Enable on specific interface
Access-SW1(config)# interface FastEthernet0/1
Access-SW1(config-if)# spanning-tree bpduguard enable
Access-SW1(config-if)# exit
```

### **Verify BPDU Guard:**

```cisco
Access-SW1# show spanning-tree summary
```

**Expected Output:**
```
Switch is in rapid-pvst mode
Root bridge for: none
...
PortFast BPDU Guard Default is enabled
```

---

## ✅ **Part 8: Verification and Analysis**

### **Step 1: View Complete Spanning Tree Topology**

On **Core-SW1:**
```cisco
Core-SW1# show spanning-tree
```

**Expected Output (truncated):**
```
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    4106
             Address     0001.9734.8901
             This bridge is the root
             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    4106 (priority 4096 sys-id-ext 10)
             Address     0001.9734.8901
             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec

Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Gi0/2            Desg FWD 4         128.2    P2p
Gi0/3            Desg FWD 4         128.3    P2p
Gi0/4            Desg FWD 4         128.4    P2p
```

**Port Role Definitions:**
- **Root:** Best path to root bridge
- **Desg (Designated):** Forwarding port on segment
- **Altn (Alternate):** Backup path to root (blocked)
- **Back (Backup):** Backup designated port (blocked)

**Port States:**
- **FWD (Forwarding):** Actively forwarding traffic
- **BLK (Blocking):** Preventing loops, standby
- **LRN (Learning):** Building MAC table, not forwarding
- **LIS (Listening):** Processing BPDUs, not forwarding

### **Step 2: Identify Blocked Ports**

On **Dist-SW1:**
```cisco
Dist-SW1# show spanning-tree vlan 10 | include BLOCKING|BLK
```

or

```cisco
Dist-SW1# show spanning-tree blockedports
```

**Example Output:**
```
Name                 Blocked Interfaces List
-------------------- ------------------------------------
VLAN0010             Gi0/3
```

**This is expected!** The cross-connect link is blocked to prevent loops.

### **Step 3: View Port Roles and States**

On **Dist-SW2:**
```cisco
Dist-SW2# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    4106
             Address     0001.9734.8901
             Cost        4
             Port        1 (GigabitEthernet0/1)
             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778 (priority 32768 sys-id-ext 10)
             Address     0001.9734.8902

Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Gi0/1            Root FWD 4         128.1    P2p
Gi0/2            Desg FWD 4         128.2    P2p
Gi0/3            Altn BLK 4         128.3    P2p
```

**Analysis:**
- Gi0/1: Root port (path to Core-SW1)
- Gi0/2: Designated port (forwarding to Access-SW2)
- Gi0/3: Alternate port (BLOCKED - redundant path to Dist-SW1)

### **Step 4: Verify Rapid Convergence**

```cisco
show spanning-tree summary
```

**Expected Output:**
```
Switch is in rapid-pvst mode
Root bridge for: VLAN0010, VLAN0020
Extended system ID           is enabled
Portfast Default             is disabled
Portfast BPDU Guard Default  is enabled
Portfast BPDU Filter Default is disabled
Loopguard Default            is disabled
PVST Simulation Default      is enabled but inactive in rapid-pvst mode
Bridge Assurance             is enabled but inactive in rapid-pvst mode
EtherChannel misconfig guard is enabled
Configured Pathcost method used is short
```

---

## 🔥 **Part 9: Failover Testing**

### **Test 1: Primary Link Failure**

**Objective:** Verify STP reconverges when an active link fails.

**Steps:**

1. **Baseline Test:**
   - From PC1, start continuous ping to Server1:
   ```
   ping 192.168.30.10 -t
   ```

2. **Record Current Topology:**
   On Dist-SW1:
   ```cisco
   show spanning-tree vlan 10 brief
   ```

3. **Simulate Link Failure:**
   On Dist-SW1, shutdown the uplink to Core-SW1:
   ```cisco
   Dist-SW1# configure terminal
   Dist-SW1(config)# interface GigabitEthernet0/1
   Dist-SW1(config-if)# shutdown
   ```

4. **Observe Reconvergence:**
   - Watch the ping output - you should see 1-2 dropped packets
   - RSTP should converge in less than 6 seconds
   - The cross-connect (Gi0/3) should unblock and become forwarding

5. **Verify New Topology:**
   ```cisco
   Dist-SW1# show spanning-tree vlan 10 brief
   ```

   **Expected Change:**
   - Gi0/3 changed from ALTN/BLK to ROOT/FWD

6. **Restore Link:**
   ```cisco
   Dist-SW1(config-if)# no shutdown
   Dist-SW1(config-if)# exit
   ```

7. **Verify Restoration:**
   - Network reconverges again
   - Original topology restored
   - Gi0/1 becomes Root port again
   - Gi0/3 returns to Alternate/Blocked

### **Test 2: Core Switch Failure**

**Objective:** Test root bridge failover.

**Steps:**

1. **Identify Current Root:**
   ```cisco
   show spanning-tree vlan 10 root
   ```

2. **Simulate Core-SW1 Failure:**
   - Physically power off Core-SW1 (or shutdown all interfaces)

3. **Observe Root Bridge Election:**
   On Core-SW2:
   ```cisco
   show spanning-tree vlan 10
   ```

   **Expected:** Core-SW2 should become root for VLAN 10 (priority 8192)

4. **Verify Connectivity:**
   - PC1 should still be able to ping Server1
   - Path will route through Core-SW2

5. **Restore Core-SW1:**
   - Power it back on
   - It should reclaim root bridge role for VLANs 10 and 20

### **Test 3: BPDU Guard Protection**

**Objective:** Verify BPDU Guard shuts down port when switch is connected.

**Steps:**

1. **Connect a Switch to Access Port:**
   - Add a new switch to workspace
   - Connect it to Access-SW1 FastEthernet0/1 (where PC1 is connected)

2. **Observe Port Shutdown:**
   - Port LED turns red/amber
   - Port enters err-disabled state

3. **Verify Error:**
   ```cisco
   Access-SW1# show interfaces status err-disabled
   ```

   **Expected Output:**
   ```
   Port      Name               Status       Reason
   Fa0/1                        err-disabled bpduguard
   ```

4. **Recover Port:**
   ```cisco
   Access-SW1# configure terminal
   Access-SW1(config)# interface FastEthernet0/1
   Access-SW1(config-if)# shutdown
   Access-SW1(config-if)# no shutdown
   Access-SW1(config-if)# exit
   ```

5. **Reconnect PC1** and verify connectivity restored.

---

## 📊 **Part 10: Comprehensive Verification Commands**

### **Command Reference:**

| Command | Purpose |
|---------|---------|
| `show spanning-tree` | View all VLANs STP information |
| `show spanning-tree vlan 10` | View specific VLAN topology |
| `show spanning-tree summary` | View STP mode and global settings |
| `show spanning-tree root` | View root bridge for all VLANs |
| `show spanning-tree interface gi0/1` | View specific interface STP status |
| `show spanning-tree blockedports` | List all blocked ports |
| `show spanning-tree inconsistentports` | Identify configuration issues |
| `show interfaces status err-disabled` | View ports shut down by BPDU Guard |
| `debug spanning-tree events` | Real-time STP event logging (use carefully!) |

### **Verification Checklist:**

Run on **Core-SW1:**

```cisco
! Verify RSTP mode
show spanning-tree summary

! Verify root bridge for VLANs 10 and 20
show spanning-tree root

! Check all port states
show spanning-tree

! Verify no inconsistencies
show spanning-tree inconsistentports
```

**Expected Results:**
- ✅ Mode: rapid-pvst
- ✅ Root for VLANs 10, 20: Core-SW1 (priority 4096)
- ✅ Root for VLANs 30, 40: Core-SW2 (priority 4096)
- ✅ All trunk ports forwarding or properly blocked
- ✅ No inconsistent ports

---

## 🔧 **Troubleshooting Guide**

### **Problem: All ports are forwarding (no blocked ports)**

**Symptoms:**
- No Alternate or Backup ports
- Network may be unstable or experiencing broadcast storms

**Possible Causes:**
- STP disabled on switches
- Switches not in same VTP domain
- VLANs not matching across trunk

**Solution:**
```cisco
! Verify STP is enabled
show spanning-tree summary

! If disabled, enable
configure terminal
spanning-tree mode rapid-pvst

! Verify VLANs exist
show vlan brief

! Check trunk allowed VLANs
show interfaces trunk
```

---

### **Problem: Wrong switch is root bridge**

**Symptoms:**
- Distribution or access switch shows as root
- Suboptimal traffic paths

**Possible Causes:**
- Priority not configured correctly
- Core switch has higher MAC address

**Solution:**
```cisco
! Check current root
show spanning-tree vlan 10 root

! Reconfigure priority on desired root
configure terminal
spanning-tree vlan 10 priority 4096

! Verify change
show spanning-tree vlan 10
```

---

### **Problem: Slow convergence during failover**

**Symptoms:**
- 30+ seconds of downtime during link failure
- Running classic STP instead of RSTP

**Possible Causes:**
- Not all switches running rapid-pvst
- PortFast not enabled on access ports
- Link type not point-to-point

**Solution:**
```cisco
! Verify RSTP mode on ALL switches
show spanning-tree summary

! Enable RSTP
configure terminal
spanning-tree mode rapid-pvst

! Enable PortFast on access ports
interface range fa0/1-24
spanning-tree portfast

! Ensure point-to-point links
interface gi0/1
spanning-tree link-type point-to-point
```

---

### **Problem: Port stuck in Listening or Learning state**

**Symptoms:**
- Port doesn't transition to Forwarding
- No connectivity through port

**Possible Causes:**
- Receiving inconsistent BPDUs
- Duplex mismatch
- Physical layer issues

**Solution:**
```cisco
! Check port status
show spanning-tree interface gi0/1 detail

! Look for inconsistencies
show spanning-tree inconsistentports

! Check physical layer
show interfaces gi0/1

! Force reconvergence
configure terminal
interface gi0/1
shutdown
no shutdown
```

---

### **Problem: BPDU Guard triggered repeatedly**

**Symptoms:**
- Access port constantly going to err-disabled
- Users reporting intermittent connectivity

**Possible Causes:**
- Switch connected to access port
- Virtualization host with bridging enabled
- BPDU Guard enabled on trunk

**Solution:**
```cisco
! Identify culprit port
show interfaces status err-disabled

! If legitimate switch connection, disable BPDU Guard
configure terminal
interface fa0/5
no spanning-tree bpduguard enable
spanning-tree portfast disable

! If rogue device, investigate physically

! Recover port
interface fa0/1
shutdown
no shutdown
```

---

### **Problem: Topology changes frequently**

**Symptoms:**
- MAC address table constantly flushing
- Network performance degradation
- Frequent "Topology Change Notification" messages

**Possible Causes:**
- Flapping link (physical issue)
- Device constantly connecting/disconnecting
- PortFast not enabled on access ports

**Solution:**
```cisco
! View topology change count
show spanning-tree vlan 10 detail | include changes

! Identify which port causing changes
show spanning-tree detail | include changes|from

! Enable PortFast on access ports
interface range fa0/1-24
spanning-tree portfast

! Reduce TCN impact
spanning-tree vlan 10 hello-time 1
```

---

### **Problem: VLANs missing from spanning-tree**

**Symptoms:**
- `show spanning-tree` doesn't show all VLANs
- Inconsistent VLAN reachability

**Possible Causes:**
- VLAN not created on switch
- VLAN pruned from trunk
- Switch not participating in VLAN

**Solution:**
```cisco
! Verify VLANs exist
show vlan brief

! Create missing VLAN
configure terminal
vlan 10
name Sales
exit

! Check trunk allowed VLANs
show interfaces trunk

! Add VLAN to trunk
interface gi0/1
switchport trunk allowed vlan add 10
```

---

## 📋 **Lab Completion Checklist**

- [ ] Three redundant links added and cabled correctly
- [ ] All redundant links configured as trunks
- [ ] RSTP (rapid-pvst) enabled on all switches
- [ ] Core-SW1 is root for VLANs 10 and 20 (priority 4096)
- [ ] Core-SW2 is root for VLANs 30 and 40 (priority 4096)
- [ ] PortFast enabled on all access ports
- [ ] BPDU Guard enabled globally on access switches
- [ ] At least one port per redundant loop is blocking
- [ ] Failover test completed successfully (< 6 seconds)
- [ ] BPDU Guard protection verified
- [ ] No topology inconsistencies detected
- [ ] All configurations saved to startup-config

---

## 🎯 **Lab Deliverables**

Submit the following:

1. ✅ **Packet Tracer file:** `lab03-lastname.pkt`
2. ✅ **Screenshot:** `show spanning-tree` output from Core-SW1
3. ✅ **Screenshot:** `show spanning-tree` output from Core-SW2
4. ✅ **Screenshot:** Dist-SW1 showing blocked port on redundant link
5. ✅ **Screenshot:** Ping results during failover test (showing brief disruption)
6. ✅ **Screenshot:** BPDU Guard triggered (err-disabled port)
7. ✅ **Documentation:** Failover test results with convergence time
8. ✅ **Written answers** to reflection questions below

---

## 🤔 **Reflection Questions**

Answer these questions in a separate document:

1. **Explain the purpose of Spanning Tree Protocol.** What problem does it solve, and what would happen without it?

2. **What is the difference between RSTP and traditional STP?** Why is RSTP preferred in modern networks?

3. **Explain the root bridge election process.** What parameters determine which switch becomes the root bridge?

4. **Why do we configure different root bridges for different VLANs?** What benefit does this provide?

5. **What is PortFast and why should it ONLY be enabled on access ports?** What could happen if you enable it on a trunk port?

6. **Explain BPDU Guard.** In what scenarios would BPDU Guard shut down a port, and how would you recover it?

7. **During your failover test, how long did reconvergence take?** Explain the process STP uses to detect failure and activate the backup path.

8. **Identify all blocked ports in your topology.** For each blocked port, explain why STP chose to block that specific port instead of another.

9. **What is the difference between a Root port and a Designated port?** Can a switch have more than one Root port?

10. **If you removed all priority configurations (reset to default 32768 on all switches), which switch would become root and why?**

---

## 🚀 **Advanced Challenge (Optional)**

For extra credit, implement these advanced STP features:

### **Challenge 1: Configure Root Guard**

Prevent distribution switches from becoming root:

```cisco
Dist-SW1(config)# interface gi0/1
Dist-SW1(config-if)# spanning-tree guard root
```

Test by lowering priority on Dist-SW1 and verify port goes to inconsistent state.

### **Challenge 2: Configure Loop Guard**

Protect against unidirectional link failures:

```cisco
Core-SW1(config)# spanning-tree loopguard default
```

### **Challenge 3: Configure UplinkFast and BackboneFast**

Note: These are legacy features for classic STP, not needed in RSTP, but good to understand:

```cisco
! UplinkFast (access layer)
Access-SW1(config)# spanning-tree uplinkfast

! BackboneFast (all switches)
Core-SW1(config)# spanning-tree backbonefast
```

### **Challenge 4: Monitor Topology Changes**

Enable debugging to see real-time STP events:

```cisco
! On Core-SW1
debug spanning-tree events

! Shutdown a trunk port and watch convergence
interface gi0/2
shutdown

! Disable debug when done
no debug all
```

### **Challenge 5: Implement MST (Multiple Spanning Tree)**

Research and implement MST to reduce overhead:

```cisco
spanning-tree mode mst
spanning-tree mst configuration
name COMPANY
revision 1
instance 1 vlan 10,20
instance 2 vlan 30,40
exit
spanning-tree mst 1 priority 4096
```

---

## 📊 **STP Design Best Practices Summary**

**Root Bridge Placement:**
- ✅ Always place root bridges in core/distribution layer
- ✅ Use manually configured priorities (don't rely on MAC address)
- ✅ Implement primary and secondary root bridges for redundancy
- ✅ Balance load by having different roots for different VLANs

**Port Configuration:**
- ✅ Enable PortFast on all access ports
- ✅ Enable BPDU Guard on all PortFast ports
- ✅ Use Root Guard on distribution switches to prevent root hijacking
- ✅ Configure point-to-point link type on trunk ports

**STP Mode:**
- ✅ Use Rapid-PVST+ (rapid-pvst) for faster convergence
- ✅ Consider MST in very large networks (1000+ VLANs)
- ✅ Ensure all switches run same STP mode

**Monitoring:**
- ✅ Regularly check for blocked ports
- ✅ Monitor topology change count
- ✅ Watch for err-disabled ports
- ✅ Document expected topology and compare regularly

---

## 📚 **Additional Resources**

- **Cisco STP Configuration Guide:** [cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/)
- **IEEE 802.1D Specification:** Original STP standard
- **IEEE 802.1w Specification:** RSTP standard
- **Understanding RSTP:** [cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/24062-146.html](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/24062-146.html)
- **STP Toolkit:** [cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/10556-16.html](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/10556-16.html)

---

## 🔄 **Next Lab Preview**

**Lab 4: Dynamic Routing with OSPF**

In the next lab, you will:
- ✅ **Keep this same topology** (don't start over!)
- ➕ Replace static routes with OSPF dynamic routing
- ➕ Configure OSPF areas and router IDs
- ➕ Implement route summarization
- ➕ Verify OSPF neighbor adjacencies
- ➕ Analyze OSPF LSA database

**Save your work!** You'll build on this file in Lab 4.

---

**Lab Created by:** EQ6
**Last Updated:** 2025-12-01
**Version:** 1.0
