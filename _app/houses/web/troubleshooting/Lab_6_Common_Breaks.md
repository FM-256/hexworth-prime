# Lab 6 Troubleshooting Guide: Advanced Features (Capstone)

This guide is your safety net. If your lab breaks, do not restart or rebuild. Every issue you encounter is a clue about how production network features integrate.

---

## HSRP Issues

### 1. HSRP Not Electing Active/Standby

- Both switches showing as "Init" state
- VLANs not matching between switches
- Layer 2 connectivity broken (can't see each other's hellos)
- Different HSRP group numbers configured

**Symptom:** `show standby brief` shows Init state, not Active/Standby.

**Verify with:** `show standby`

Both switches must:
- Be in same VLAN
- Use same HSRP group number
- Have Layer 2 connectivity

---

### 2. Wrong Switch Becomes Active

- Priority not configured correctly
- Preempt not enabled on intended Active router
- Higher priority switch came up after lower priority

**Verify with:** `show standby brief`

Check Priority column - higher number should be Active.

**Fix:**
```
interface Vlan10
 standby 10 priority 110
 standby 10 preempt
```

---

### 3. PC Gateway Not Updated to Virtual IP

- PC still using physical switch IP (.2 or .3)
- PC gateway in wrong subnet
- DHCP giving old gateway

**Critical:** PC gateway MUST be the HSRP virtual IP (.1), not physical IPs.

**Test:** If PC can ping .2 but not .1, HSRP isn't working.

---

### 4. HSRP Failover Not Working

- Preempt not configured
- Tracking not configured (interface down but priority not reduced)
- Layer 2 path between switches broken

**Test failover:**
1. Start continuous ping from PC
2. Shutdown Active switch's SVI: `interface Vlan10` → `shutdown`
3. Standby should become Active within 3-10 seconds
4. Ping should resume after brief loss

---

## DHCP Issues

### 5. PCs Getting 169.254.x.x (APIPA)

- DHCP server not configured or not reachable
- IP helper-address missing on SVI
- DHCP pool exhausted
- Network statement wrong in DHCP pool

**Symptom:** PC shows 169.254.x.x = DHCP failed, using auto-config.

**Verify on DHCP server:** `show ip dhcp pool`
**Verify on distribution switch:** `show run interface Vlan10 | include helper`

---

### 6. IP Helper-Address Wrong or Missing

- DHCP requests are broadcasts - won't cross routers
- Helper-address must point to DHCP server
- Wrong IP used for helper-address

**Fix on distribution switch SVI:**
```
interface Vlan10
 ip helper-address 10.0.0.1
```

Replace with actual DHCP server IP.

---

### 7. DHCP Pool Network Mismatch

- Pool network doesn't match VLAN subnet
- Wrong subnet mask in pool
- Excluded addresses wrong

**Example error:**
Pool says: `network 192.168.100.0 255.255.255.0`
VLAN actually uses: `192.168.10.0/24`

**Verify with:** `show ip dhcp pool`

---

### 8. All IPs Excluded from DHCP Pool

- Excluded range too large
- Excluded addresses overlap with entire pool
- No available addresses left

**Verify with:** `show ip dhcp pool`

"Current index" should be within valid range.

---

## ACL Issues

### 9. ACL Blocking Legitimate Traffic

- Rule order wrong (deny before permit)
- Wildcard mask too broad
- ACL applied in wrong direction (in vs out)
- Implicit deny at end blocking desired traffic

**Symptom:** Expected traffic blocked.

**Verify with:** `show access-lists`

Check hit counters - is traffic matching deny rules?

**Remember:** ACLs process TOP to BOTTOM. First match wins!

---

### 10. ACL Not Blocking Anything

- ACL created but not applied to interface
- Applied in wrong direction
- Traffic not flowing through that interface
- Missing deny statement (all permits = allow everything)

**Verify ACL is applied:** `show ip interface Vlan10`

Look for "Inbound access list" or "Outgoing access list"

---

### 11. Wildcard Mask Errors in ACL

- Using subnet mask instead of wildcard
- Wildcard too restrictive or too broad

| To Block | Wildcard Mask |
|----------|---------------|
| Single host 192.168.10.10 | 0.0.0.0 |
| Subnet 192.168.10.0/24 | 0.0.0.255 |
| First two octets 192.168.x.x | 0.0.255.255 |

---

### 12. Implicit Deny Blocking Everything

- ACL has only deny statements
- No `permit any` at end
- All traffic being dropped

**Every ACL ends with implicit:**
```
deny any any
```

**If you want to permit everything else:**
```
access-list 10 permit any
```

---

## SNMP Issues

### 13. SNMP Not Responding

- SNMP not enabled on device
- Wrong community string
- ACL blocking SNMP (UDP 161/162)
- Firewall blocking management traffic

**Verify with:** `show snmp`

Should show SNMP enabled and community strings.

---

### 14. SNMP Traps Not Received

- Trap destination IP wrong
- SNMP host command missing
- Specific traps not enabled

**Verify with:** `show snmp host`

Check trap destination configured correctly.

---

## Integration Issues

### 15. Previous Labs Broken After Adding New Features

- HSRP changed SVI IPs but OSPF not updated
- ACL blocking routing protocol traffic
- DHCP giving wrong gateway (not HSRP VIP)

**Always verify after changes:**
1. `show ip ospf neighbor` - Still FULL?
2. `show ip eigrp neighbors` - Still connected?
3. `show standby brief` - HSRP working?
4. End-to-end ping test

---

### 16. OSPF Neighbors Lost After HSRP Configuration

- SVI IP changed from .1 to .2/.3
- OSPF network statement no longer matches
- Passive interface misconfigured

**Verify with:** `show ip ospf interface brief`

If SVIs missing from OSPF, update network statements.

---

## Recommended Troubleshooting Order

1. **Verify underlying routing:** `show ip route`
2. **Check HSRP status:** `show standby brief`
3. **Test DHCP:** PC obtains IP? `show ip dhcp binding`
4. **Review ACLs:** `show access-lists` (check hit counters)
5. **Verify SNMP:** `show snmp`
6. **End-to-end test:** Ping across entire network

---

## Quick Reference Commands

| Feature | Verification Command |
|---------|---------------------|
| HSRP status | `show standby brief` |
| HSRP detail | `show standby` |
| DHCP bindings | `show ip dhcp binding` |
| DHCP pools | `show ip dhcp pool` |
| ACL rules & hits | `show access-lists` |
| ACL on interface | `show ip interface [int]` |
| SNMP status | `show snmp` |
| SNMP hosts | `show snmp host` |
| Logging/Syslog | `show logging` |

---

## Feature Integration Checklist

Before declaring Lab 6 complete:

- [ ] All OSPF neighbors still FULL
- [ ] EIGRP neighbor still established
- [ ] HSRP Active/Standby correctly assigned
- [ ] HSRP failover tested successfully
- [ ] All PCs obtaining DHCP addresses
- [ ] DHCP giving HSRP virtual IP as gateway
- [ ] ACLs blocking intended traffic only
- [ ] ACL hit counters increasing appropriately
- [ ] SNMP configured on all devices
- [ ] End-to-end connectivity verified

---

## The Ultimate Test

**From Remote-PC1 (EIGRP domain), can you reach a PC in VLAN 40 (OSPF domain)?**

This tests:
- EIGRP neighbor formation
- Route redistribution OSPF ↔ EIGRP
- OSPF multi-area routing
- VLAN trunking
- STP (no loops)
- SVI routing
- ACLs (if VLAN 40 is accessible from Remote)

**If this works, your network is production-ready.**

---

**If you fix the problem without rebuilding the lab, you did it the right way.**

---

## Congratulations!

You've completed all 6 labs and their troubleshooting guides. You now have the skills to build and troubleshoot enterprise networks. Go build great networks!
