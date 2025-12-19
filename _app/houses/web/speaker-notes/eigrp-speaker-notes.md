# EIGRP (Enhanced Interior Gateway Routing Protocol) - Speaker Notes

**Prepared by:** EQ6
**Date:** 2025-12-01
**Presentation:** EIGRP (19 slides)
**Target Audience:** Networking students, IT professionals  
**Duration:** 60-70 minutes

---

## Overview

EIGRP is Cisco's advanced distance-vector (hybrid) routing protocol. This presentation covers DUAL algorithm, metric calculation, successor/feasible successor concepts, and practical configuration.

## Key Teaching Points

### Slide 1: Title - EIGRP Introduction
- Emphasize "Enhanced" - evolution from IGRP
- Cisco proprietary until 2013 (now informational RFC 7868)
- Still widely deployed in enterprise networks

### Slide 2: History & Evolution  
- IGRP (1985) → EIGRP (1992)
- Opened as RFC in 2013 but still primarily Cisco
- Comparison with OSPF throughout presentation

### Slide 3: EIGRP Characteristics
- **Advanced Distance-Vector (Hybrid)**
- Uses DUAL algorithm (loop-free at all times)
- Fast convergence (subsecond possible)
- Supports VLSM and discontiguous networks
- Multicast/unicast updates (224.0.0.10)
- Only sends incremental updates (not full routing table)

### Slide 4: DUAL Algorithm Explained
- **Diffusing Update Algorithm**
- Guarantees loop-free topology at every instant
- Computes successor and feasible successor
- Query/Reply process for route computation

**Analogy:** DUAL is like having backup drivers for a delivery route - if the main driver (successor) is unavailable, backup driver (feasible successor) immediately takes over without asking for directions.

### Slide 5: Metric Calculation
**Formula:** Metric = 256 * (K1*Bandwidth + (K2*Bandwidth)/(256-Load) + K3*Delay) * (K5/(Reliability+K4))

**Default (K1=1, K3=1, others=0):**  
Metric = 256 * (Bandwidth + Delay)

**Bandwidth:** Slowest link in path (in Kbps)
**Delay:** Cumulative delay (in tens of microseconds)

**Teaching tip:** Show how 10Mbps link vs 1Gbps link dramatically affects metric.

### Slide 6: Successor & Feasible Successor
- **Successor:** Best path to destination (lowest metric) - installed in routing table
- **Feasible Successor:** Backup path that meets Feasibility Condition
- **Feasibility Condition:** FD of neighbor < our FD to destination (prevents loops)

**Example:**
```
Router A to Network X:
- Path via Router B: Metric 1000 (Successor)
- Path via Router C: Metric 1500 (Feasible Successor - backup)
- Path via Router D: Metric 2000 (Not feasible successor if violates FC)
```

### Slide 7: EIGRP Packet Types
1. **Hello (Type 5):** Neighbor discovery/keepalive
2. **Update (Type 1):** Routing information
3. **Query (Type 3):** Ask neighbors for path when successor lost
4. **Reply (Type 4):** Answer to query
5. **Ack (Type 5 with no data):** Acknowledge reliable packets

**Timers:**
- Hello: 5s (LAN), 60s (WAN)
- Hold: 15s (LAN), 180s (WAN)

### Slide 8: EIGRP Tables
1. **Neighbor Table:** Adjacent EIGRP routers
2. **Topology Table:** All learned routes (successors + feasible successors)
3. **Routing Table:** Best routes only (successors)

**Commands:**
```
show ip eigrp neighbors
show ip eigrp topology  
show ip route eigrp
```

### Slide 9: Active vs Passive Routes
- **Passive:** Route is stable, successor exists
- **Active:** Lost successor, querying neighbors for alternative
- **Stuck-in-Active (SIA):** Query times out (3 min default) - neighbor relationship resets

**SIA Prevention:**
- Route summarization
- Stub routing for branches
- Limit query scope

### Slide 10: Classic vs Named EIGRP Configuration

**Classic:**
```
router eigrp 100
 network 10.0.0.0
 network 192.168.1.0
 no auto-summary
```

**Named (modern):**
```
router eigrp COMPANY_NET
 address-family ipv4 unicast autonomous-system 100
  network 10.0.0.0
  network 192.168.1.0
```

Named mode advantages: IPv4/IPv6 in same config, per-AF settings, clearer hierarchy.

### Slide 11: EIGRP Authentication
**Why:** Prevent rogue routers from injecting false routes

**MD5 (classic):**
```
key chain EIGRP_KEY
 key 1
  key-string SecurePassword123

interface Gi0/0
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 EIGRP_KEY
```

**SHA-256 (named mode - more secure):**
```
router eigrp COMPANY_NET
 address-family ipv4 unicast as 100
  af-interface Gi0/0
   authentication mode hmac-sha-256 SecurePassword123
```

### Slide 12: Unequal Cost Load Balancing
**Variance command:** Use paths with metrics up to X times the successor's metric

```
router eigrp 100
 variance 2
```

If successor metric = 1000, paths with metric ≤ 2000 will be used for load balancing.

**OSPF cannot do this** - only equal-cost load balancing.

### Slide 13: Route Summarization
**Auto-summary (legacy, deprecated):**
```
router eigrp 100
 auto-summary  # DON'T USE - causes problems with discontiguous networks
```

**Manual summarization (correct way):**
```
interface Gi0/0
 ip summary-address eigrp 100 192.168.0.0 255.255.252.0
```

Summarizes 192.168.0.0/24, 192.168.1.0/24, 192.168.2.0/24, 192.168.3.0/24 into one advertisement.

### Slide 14: Stub Routing
**Purpose:** Prevent branch routers from being transit (query termination)

```
router eigrp 100
 eigrp stub connected summary
```

**Stub options:**
- **connected:** Advertise connected routes
- **summary:** Advertise summary routes  
- **static:** Advertise static routes
- **redistributed:** Advertise redistributed routes
- **receive-only:** Don't advertise anything (listen only)

**Benefit:** Hub doesn't query stub routers (reduces convergence time, prevents SIA).

### Slide 15: EIGRP vs OSPF Comparison

| Feature | EIGRP | OSPF |
|---------|-------|------|
| **Type** | Advanced distance-vector | Link-state |
| **Algorithm** | DUAL | Dijkstra (SPF) |
| **Vendor** | Cisco (mostly) | Open standard |
| **Convergence** | Very fast (subsecond) | Fast (seconds) |
| **CPU/Memory** | Lower | Higher |
| **Scalability** | Excellent | Excellent |
| **Configuration** | Simpler | More complex |
| **Load balancing** | Unequal-cost (variance) | Equal-cost only |
| **Authentication** | MD5, SHA-256 | MD5, SHA |
| **Multicast** | 224.0.0.10 | 224.0.0.5, 224.0.0.6 |

**When to use EIGRP:**
- All-Cisco network
- Need simple configuration
- Want unequal-cost load balancing
- Lower-end hardware (less CPU/RAM)

**When to use OSPF:**
- Multi-vendor environment
- Industry standard requirement
- Need hierarchical design (areas)
- Future IPv6 migration (OSPFv3 widely supported)

### Slide 16: Configuration Example Walkthrough
```
! Enable EIGRP with AS 100
router eigrp 100
 
 ! Disable auto-summary (best practice)
 no auto-summary
 
 ! Advertise networks
 network 10.1.1.0 0.0.0.255
 network 192.168.10.0 0.0.0.255
 
 ! Set router ID
 eigrp router-id 1.1.1.1
 
 ! Passive interfaces (don't send hellos)
 passive-interface GigabitEthernet0/1
 
 ! Configure variance for unequal-cost load balancing
 variance 2
 
 ! Tune timers (if needed)
 interface GigabitEthernet0/0
  ip hello-interval eigrp 100 10
  ip hold-time eigrp 100 30
```

### Slide 17: Verification Commands

**Neighbors:**
```
show ip eigrp neighbors
! Look for: neighbor IPs, uptime, SRTT (Smooth Round Trip Time), Q count (queued packets)
```

**Topology:**
```
show ip eigrp topology
show ip eigrp topology all-links  # Show all paths, not just successors
```

**Routes:**
```
show ip route eigrp
! 'D' = EIGRP route, 'D EX' = External EIGRP route
```

**Interfaces:**
```
show ip eigrp interfaces
! Shows which interfaces are running EIGRP
```

**Traffic stats:**
```
show ip eigrp traffic
! Packet counts: hellos, updates, queries, replies
```

### Slide 18: Troubleshooting Common Issues

**Problem 1: Neighbors not forming**
- Check: Different AS numbers
- Check: Mismatched authentication
- Check: ACL blocking multicast 224.0.0.10
- Check: Different K-values (must match!)

**Problem 2: Routes not appearing**
- Check: Network statement includes interface IP
- Check: Passive interface configured incorrectly
- Check: Split-horizon preventing advertisements
- Check: Route filtering (distribute-list)

**Problem 3: Stuck-in-Active (SIA)**
- Cause: Query range too large, slow/unreachable neighbor
- Solution: Implement summarization, use stub routing, increase SIA timer

**Problem 4: High CPU usage**
- Cause: Too many neighbors, route flapping, large topology
- Solution: Summarize routes, tune timers, implement query boundaries

### Slide 19: Summary & Key Takeaways

**EIGRP Strengths:**
✅ Fast convergence (subsecond possible)
✅ Simple configuration
✅ Efficient updates (incremental only)
✅ Unequal-cost load balancing
✅ Supports large networks (with proper design)
✅ Lower CPU/memory usage than OSPF

**EIGRP Considerations:**
⚠️ Primarily Cisco (limits multi-vendor deployments)
⚠️ Not as widely understood as OSPF
⚠️ Requires careful planning to avoid SIA
⚠️ K-values must match between neighbors

**Best Practices:**
1. Always disable auto-summary
2. Use manual summarization at appropriate boundaries
3. Implement stub routing for branch offices
4. Use authentication (SHA-256 in named mode)
5. Monitor for SIA conditions
6. Document AS numbers and summarization points

**Real-World Application:**
EIGRP excels in enterprise campus networks where:
- Fast convergence is critical
- Cisco equipment is deployed
- Simplified configuration is preferred
- Unequal-cost load balancing is valuable

**Lab Connection:**
In Lab 5, students will add an EIGRP-based remote branch and configure route redistribution between OSPF (main network) and EIGRP (remote branch). This shows how protocols interoperate in real multi-protocol environments.

---

## Teaching Tips Throughout Presentation

**Analogies to Use:**
- **DUAL = GPS with offline maps:** Always knows backup routes without asking for directions
- **Successor/Feasible Successor = Primary/Backup delivery driver:** Backup immediately available
- **Metric = Road quality score:** Considers both speed limit (bandwidth) and distance (delay)
- **Query/Reply = Asking neighbors for directions:** Only happens when lost

**Common Student Questions:**

**Q: "Why use EIGRP if OSPF is an open standard?"**
A: "In all-Cisco environments, EIGRP is simpler to configure and manage. It's like using Apple products - everything works smoothly together. OSPF is like Android - more flexibility, works with everyone, but slightly more complex."

**Q: "What does 'enhanced' mean in EIGRP?"**
A: "EIGRP enhanced its predecessor IGRP by adding: VLSM support, faster convergence, efficient updates, bounded updates, and the DUAL algorithm for loop prevention. It's not just an upgrade - it's a complete reimagination."

**Q: "Can I run EIGRP and OSPF at the same time?"**
A: "Yes! This is common in enterprise networks. You might use OSPF in the core and EIGRP in branches, or vice versa. You'll need route redistribution (covered in Lab 5) to share routes between them."

**Q: "Why does Cisco still use EIGRP if OSPF is standard?"**
A: "EIGRP is mature, proven, and simpler in Cisco environments. Many enterprises have decades of EIGRP expertise. 'If it ain't broke, don't fix it.' However, new deployments increasingly choose OSPF for vendor neutrality."

**Duration Notes:**
- Slides 1-3: 10 minutes (introduction, history, characteristics)
- Slides 4-7: 20 minutes (DUAL, metrics, packets - core concepts)
- Slides 8-10: 12 minutes (tables, states, configuration)
- Slides 11-14: 15 minutes (authentication, variance, summarization, stub)
- Slides 15-17: 10 minutes (comparison, configuration example, verification)
- Slides 18-19: 8 minutes (troubleshooting, summary)

**Total:** 60-70 minutes with questions

**Packet Tracer Demonstrations:**
- Show EIGRP neighbor formation in simulation mode
- Display topology table with multiple paths
- Demonstrate failover when successor is removed
- Show unequal-cost load balancing in action

---

**End of EIGRP Speaker Notes**

**Prepared by:** EQ6
**Date:** 2025-12-01
**Total Length:** Comprehensive coverage of all 19 slides with teaching guidance

