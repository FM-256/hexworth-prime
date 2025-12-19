# **Lab Exercise: Configuring and Verifying Static IP Routes**

**Prepared by:** EQ6
**Subject:** Network Essentials Lab

---

## **1. Objective**

In this lab, you will apply your understanding of IP routing to build a multi-network environment, configure static routes, and verify connectivity between two separate networks. You will use Cisco Packet Tracer to simulate the environment and receive guidance on how to replicate this in a live Cisco DevNet sandbox.

---

## **2. Scenario**

Imagine a small business, "Innovate Inc.," has two departments: Engineering and Sales. Each department is on its own network to keep traffic separate. The Engineering department needs to access a server located on the Sales network. Your job is to establish a connection between these two networks by configuring the routers.

---

## **3. Network Topology**

You will build the following topology in Cisco Packet Tracer:

*   **2 Routers** (e.g., Cisco 4331 ISR)
*   **2 Switches** (e.g., Cisco 2960)
*   **2 PCs** (one for each network)

**Visual Diagram:**

```
[PC-Engineering]
      |
[Switch-Eng]
      |
[Router-Eng] ---- (Serial Link) ---- [Router-Sales]
                                            |
                                      [Switch-Sales]
                                            |
                                       [PC-Sales]
```

---

## **4. IP Addressing Table**

<div style="font-size: 0.9em;">

| Device | Interface | IP Address | Subnet Mask | Gateway |
|:-------|:----------|:-----------|:------------|:--------|
| **Router-Eng** | GigabitEthernet0/0/0 | 192.168.1.1 | 255.255.255.0 | N/A |
| | Serial0/1/0 | 10.0.0.1 | 255.255.255.252 | N/A |
| **Router-Sales** | GigabitEthernet0/0/0 | 192.168.2.1 | 255.255.255.0 | N/A |
| | Serial0/1/0 | 10.0.0.2 | 255.255.255.252 | N/A |
| **PC-Engineering** | Ethernet0 | 192.168.1.10 | 255.255.255.0 | 192.168.1.1 |
| **PC-Sales** | Ethernet0 | 192.168.2.10 | 255.255.255.0 | 192.168.2.1 |

</div>

---

## **Part 1: Build and Basic Configuration (Packet Tracer)**

### Step 1: Build the Topology
Open Cisco Packet Tracer. Add the devices listed above and connect them with the appropriate cables:
- **Copper Straight-Through** for PC-Switch and Switch-Router connections
- **Serial DCE** for the router-to-router link

### Step 2: Configure PC IP Addresses

**PC-Engineering:**
1. Click on `PC-Engineering`
2. Go to the `Desktop` tab → `IP Configuration`
3. Enter the IP, Subnet Mask, and Default Gateway from the table above

**PC-Sales:**
1. Repeat the same process for `PC-Sales`

### Step 3: Configure Router-Eng Interfaces

Click on `Router-Eng`, go to the `CLI` tab, and enter:

```cisco
enable
configure terminal
! Configure the LAN interface
interface GigabitEthernet0/0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
! Configure the WAN (serial) interface
interface Serial0/1/0
ip address 10.0.0.1 255.255.255.252
clock rate 64000
no shutdown
end
```

**Note:** Apply `clock rate` only on the DCE side of the serial cable.

### Step 4: Configure Router-Sales Interfaces

Click on `Router-Sales`, go to the `CLI` tab, and enter:

```cisco
enable
configure terminal
! Configure the LAN interface
interface GigabitEthernet0/0/0
ip address 192.168.2.1 255.255.255.0
no shutdown
exit
! Configure the WAN (serial) interface
interface Serial0/1/0
ip address 10.0.0.2 255.255.255.252
no shutdown
end
```

---

## **Part 2: Connectivity Verification (Before Routing)**

### Test 1: Ping within the Engineering Network

1. Open the Command Prompt on `PC-Engineering`
2. Type: `ping 192.168.1.1`
3. **Expected Result:** The ping should be **successful** [PASS]

This proves local connectivity.

### Test 2: Ping across to the Sales Network

1. From the same command prompt on `PC-Engineering`
2. Type: `ping 192.168.2.10`
3. **Expected Result:** The ping should **fail** [FAIL]

You will see "Request timed out" or "Destination host unreachable." This is because the Engineering router does not know how to reach the `192.168.2.0/24` network.

---

## **Part 3: Static Route Configuration**

### Configure the Route on Router-Eng

On `Router-Eng`, enter:

```cisco
configure terminal
! Tell Router-Eng how to reach the Sales network
ip route 192.168.2.0 255.255.255.0 10.0.0.2
end
copy running-config startup-config
```

### Configure the Route on Router-Sales

On `Router-Sales`, enter:

```cisco
configure terminal
! Tell Router-Sales how to reach the Engineering network
ip route 192.168.1.0 255.255.255.0 10.0.0.1
end
copy running-config startup-config
```

---

## **Part 4: Final Verification**

### Step 1: Verify the Route on Router-Eng

From `Router-Eng`, run `show ip route`. You should see:

```
S   192.168.2.0/24 [1/0] via 10.0.0.2
```

### Step 2: Ping Across Networks Again

1. Go back to the Command Prompt on `PC-Engineering`
2. Type: `ping 192.168.2.10`
3. **Expected Result:** The ping should now be **successful** [PASS]

### Step 3: Trace the Path

From the same command prompt, use the `tracert` command:

```
tracert 192.168.2.10
```

**Expected Result:** You will see the packet's journey:
1. `192.168.1.1` (Your gateway, Router-Eng)
2. `10.0.0.2` (The next hop, Router-Sales)
3. `192.168.2.10` (The final destination, PC-Sales)

---

## **Part 5: Cisco DevNet Sandbox Integration**

This lab can be replicated on live, enterprise-grade equipment using a free Cisco DevNet sandbox.

### Step 1: Find a Sandbox

1. Go to the [Cisco DevNet Sandbox Catalog](https://developer.cisco.com/site/sandbox/)
2. Look for an "IOS XE" sandbox, such as the "IOS XE on CSR Recommended" sandbox
3. This provides web-based and VPN access to live routers

### Step 2: Reserve and Connect

1. Reserve the sandbox (setup takes a few minutes)
2. Follow the provided instructions to connect via SSH or web console

### Step 3: Adapt and Implement

1. The sandbox will provide pre-configured devices and IP addresses
2. **Adapt** this lab's IP scheme to the available interfaces
3. Check existing configuration:
   - `show ip interface brief`
   - `show ip route`
4. Identify two networks for your "Engineering" and "Sales" LANs
5. Apply the same `ip route` commands from Part 3
6. Verify connectivity using `ping` and `traceroute`

---

## **Lab Completion Checklist**

- [ ] Built network topology in Packet Tracer
- [ ] Configured all IP addresses correctly
- [ ] Verified local connectivity (before routing)
- [ ] Configured static routes on both routers
- [ ] Successfully pinged across networks
- [ ] Traced the packet path with tracert
- [ ] (Optional) Replicated lab in DevNet sandbox

---

**Document Version:** 1.1 (Fixed formatting)
**Last Updated:** 2025-12-01
