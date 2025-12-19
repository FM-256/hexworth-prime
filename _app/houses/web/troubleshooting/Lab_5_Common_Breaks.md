# Lab 5 Troubleshooting Guide: EIGRP and Route Redistribution

This guide is your safety net. If your lab breaks, do not restart or rebuild. Every issue you encounter is a clue about how multiple routing protocols exchange information.

---

## 1. EIGRP Neighbors Not Forming

- Mismatched Autonomous System (AS) numbers
- Interface not included in network statement
- K-values mismatch (if modified from defaults)
- ACL blocking EIGRP (multicast 224.0.0.10)

**Symptom:** `show ip eigrp neighbors` shows nothing.

**Verify with:** `show ip eigrp interfaces`

Both routers MUST use same AS number (e.g., `router eigrp 100`).

---

## 2. Auto-Summary Causing Route Problems

- EIGRP auto-summarizing to classful boundary
- 192.168.50.0/24 being advertised as 192.168.0.0/16
- Routing black holes due to summarization

**Symptom:** Routes appear in routing table but traffic doesn't reach destination.

**Verify with:** `show ip route eigrp`

If you see classful networks instead of subnets, auto-summary is the culprit.

**Fix:**
```
router eigrp 100
 no auto-summary
```

---

## 3. Redistribution Not Configured on Both Protocols

- Only redistributing EIGRP into OSPF (one-way)
- Forgetting to redistribute OSPF into EIGRP
- Remote branch can't reach HQ networks

**Symptom:** One direction works, other direction fails.

**Verify with:** `show ip protocols`

Should see redistribution listed for BOTH routing protocols.

---

## 4. Missing Metric in EIGRP Redistribution

- EIGRP requires explicit seed metric when redistributing
- OSPF doesn't require metric (has default)
- Redistribution silently fails without error

**WRONG:**
```
redistribute ospf 1
```

**RIGHT:**
```
redistribute ospf 1 metric 10000 100 255 1 1500
```

The five metrics are: Bandwidth, Delay, Reliability, Load, MTU

---

## 5. Missing "subnets" Keyword in OSPF Redistribution

- OSPF redistributes only classful networks by default
- /24 and smaller subnets not redistributed
- Only /8, /16 boundaries appear

**WRONG:**
```
redistribute eigrp 100
```

**RIGHT:**
```
redistribute eigrp 100 subnets
```

**Verify with:** `show ip route ospf | include E2`

---

## 6. Administrative Distance Confusion

- Not understanding which route will be installed
- EIGRP internal (90) preferred over OSPF (110)
- EIGRP external (170) NOT preferred over OSPF (110)

| Route Type | Administrative Distance |
|------------|-------------------------|
| Connected | 0 |
| Static | 1 |
| EIGRP Internal | 90 |
| OSPF | 110 |
| EIGRP External | 170 |

**Key insight:** Redistributed routes have higher AD!

---

## 7. Routing Loop from Mutual Redistribution

- Route learned from OSPF, redistributed to EIGRP
- Same route redistributed back to OSPF from EIGRP
- Traffic loops indefinitely

**Symptom:** Ping times out, traceroute shows looping hops.

**Prevention:**
- Use route tags to identify redistributed routes
- Use distribute-lists to filter routes
- Only redistribute at ONE point (if possible)

---

## 8. Physical Connectivity to Remote Branch Missing

- New router interface not connected
- Wrong interface used for WAN link
- Interface administratively down

**Verify with:** `show ip interface brief`

WAN interface must be "up/up" before EIGRP can form neighbor.

**Test Layer 1/2:** Can Edge-Router ping Remote-Router WAN IP?

---

## 9. Remote Branch IP Addressing Errors

- Wrong IP on Remote-Router interfaces
- PC default gateway doesn't match router LAN interface
- Subnet mask mismatch

**Verify with:**
- Router: `show ip interface brief`
- PC: Gateway must match Remote-Router's LAN IP (192.168.50.1)

---

## 10. EIGRP Network Statement Mismatch

- Network statement doesn't match interface IP
- Wildcard mask wrong (EIGRP uses wildcard masks like OSPF)
- Interface IP changed after EIGRP configured

**Example:**
Interface: 10.10.10.2/30

**WRONG:**
```
network 10.10.10.0 255.255.255.252
```

**RIGHT:**
```
network 10.10.10.0 0.0.0.3
```

---

## Understanding Route Codes After Redistribution

**On OSPF routers (Core-SW1, Core-SW2):**
```
O E2 192.168.50.0/24 [110/100] via 10.0.1.1
```
- O E2 = OSPF External Type 2 (redistributed from EIGRP)
- [110/100] = AD 110 / Metric 100

**On EIGRP routers (Remote-Router):**
```
D EX 192.168.10.0/24 [170/...] via 10.10.10.1
```
- D EX = EIGRP External (redistributed from OSPF)
- [170/...] = AD 170 / EIGRP composite metric

---

## Recommended Troubleshooting Order

1. **Verify physical connectivity:** `ping` across WAN link
2. **Check EIGRP neighbors:** `show ip eigrp neighbors`
3. **Verify EIGRP topology:** `show ip eigrp topology`
4. **Check OSPF still working:** `show ip ospf neighbor`
5. **Verify redistribution config:** `show ip protocols`
6. **Check routing tables:** `show ip route eigrp` and `show ip route ospf`
7. **Test end-to-end:** Ping from Remote-PC to HQ PC

---

## Redistribution Verification Commands

| What to Check | Command |
|---------------|---------|
| EIGRP neighbors | `show ip eigrp neighbors` |
| EIGRP topology | `show ip eigrp topology` |
| EIGRP routes | `show ip route eigrp` |
| OSPF external routes | `show ip route ospf \| include E2` |
| Redistribution config | `show ip protocols` |
| Running config | `show run \| section router` |

---

## Metric Conversion Reference

**EIGRP Seed Metric Format:**
```
metric <bandwidth> <delay> <reliability> <load> <MTU>
```

**Recommended values for redistribution:**
```
metric 10000 100 255 1 1500
```
- 10000 = 10 Mbps bandwidth
- 100 = 1000 microseconds delay
- 255 = 100% reliable
- 1 = Minimal load
- 1500 = Standard MTU

---

## Common Redistribution Pitfalls

| Mistake | Result | Fix |
|---------|--------|-----|
| No metric in EIGRP redistribution | Routes not redistributed | Add `metric 10000 100 255 1 1500` |
| No "subnets" in OSPF redistribution | Only classful routes | Add `subnets` keyword |
| Wrong AS number | No EIGRP neighbors | Verify same AS on both routers |
| Mutual redistribution without filtering | Routing loops | Add route tags or distribute-lists |

---

**If you fix the problem without rebuilding the lab, you did it the right way.**
