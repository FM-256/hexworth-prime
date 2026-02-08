# Web House Certification Paths - Planning Document

**Created:** January 28, 2026
**Status:** Planning
**House:** Web (Networking)

---

## Executive Summary

The House of Web currently has a single learning path that attempts to serve both CompTIA Network+ and Cisco CCNA students. This document outlines the plan to separate these into distinct certification tracks while maximizing content reuse through a shared foundation.

---

## Current State

### Problem
- Both "Network+" and "CCNA" buttons in Web house lead to the same generic path
- Content is vendor-neutral, missing Cisco-specific CLI training for CCNA
- No clear certification alignment for students

### Existing Content (LearningPaths.js - 'web')
1. OSI Model Fundamentals
2. OSI Model Challenge (quiz)
3. IP Addressing Basics
4. Subnetting Fundamentals
5. Subnetting Challenge (quiz)
6. Network Switching
7. VLAN Configuration
8. Routing Fundamentals
9. OSPF Protocol
10. Network Simulator Lab

---

## Certification Comparison

### CompTIA Network+ (N10-009)

| Domain | Weight | Focus Areas |
|--------|--------|-------------|
| Networking Concepts | 23% | OSI, ports/protocols, cloud, IPv4/IPv6 |
| Network Implementation | 20% | Routing protocols, VLANs, wireless setup |
| Network Operations | 19% | Documentation, lifecycle, change management, DR |
| Network Security | 14% | Encryption, PKI, segmentation, attacks |
| Network Troubleshooting | 24% | Methodology, cable diagnostics, performance |

**Exam Details:**
- 90 questions, 90 minutes
- Passing: 720/900
- Cost: $369
- Vendor-neutral

### Cisco CCNA (200-301)

| Domain | Weight | Focus Areas |
|--------|--------|-------------|
| Network Fundamentals | 20% | OSI/TCP-IP, topologies, IPv4/IPv6 |
| Network Access | 20% | VLANs, STP, EtherChannel, wireless |
| IP Connectivity | 25% | Static/dynamic routing, OSPF, EIGRP |
| IP Services | 10% | DHCP, DNS, NAT, NTP, QoS |
| Security Fundamentals | 15% | Threats, ACLs, VPNs, wireless security |
| Automation & Programmtic | 10% | SDN, APIs, Ansible, Terraform |

**Exam Details:**
- 100-120 questions, 120 minutes
- Passing: ~825/1000
- Cost: $330
- Cisco-specific (IOS CLI required)

---

## Proposed Architecture

### Option A: Branching Path (Recommended)

```
                    [Shared Foundation]
                           |
            +--------------+--------------+
            |                             |
    [Network+ Track]              [CCNA Track]
            |                             |
    +-------+-------+             +-------+-------+
    |       |       |             |       |       |
  Ops  Security  Mail         Cisco   Auto  Security
                               CLI    mtic
```

**Structure:**
1. **Shared Foundation** (~40% of content)
   - OSI/TCP-IP Models
   - IP Addressing & Subnetting
   - Basic Switching Concepts
   - VLAN Fundamentals
   - Routing Concepts
   - Basic Security Principles

2. **Network+ Branch** (~30% unique)
   - Network Operations & Documentation
   - Troubleshooting Methodology
   - Change Management
   - Disaster Recovery
   - Physical Installation
   - Vendor-neutral labs

3. **CCNA Branch** (~30% unique)
   - Cisco IOS CLI Basics
   - IOS Configuration Labs
   - EIGRP Configuration
   - SDN & Controller-Based Networking
   - REST APIs & Automation
   - Ansible/Terraform Basics

### Option B: Parallel Paths (Complete Separation)

```
[Network+ Path]              [CCNA Path]
      |                           |
   Module 1                    Module 1
   Module 2                    Module 2
   Module 3                    Module 3
     ...                         ...
```

**Pros:** Clear separation, no confusion
**Cons:** Content duplication, more maintenance

### Option C: Unified Path with Cert Tags

```
[Single Comprehensive Path]
      |
   Module 1 [N+] [CCNA]
   Module 2 [N+] [CCNA]
   Module 3 [N+]
   Module 4 [CCNA]
     ...
```

**Pros:** Single path to maintain
**Cons:** Longer path, students see irrelevant content

---

## Recommended Implementation (Option A)

### Phase 1: Shared Foundation Path

Create new path ID: `networking-foundation`

```javascript
'networking-foundation': {
    name: 'Networking Foundation',
    description: 'Core concepts for Network+ and CCNA',
    icon: '🌐',
    color: '#3b82f6',
    modules: [
        // OSI & TCP/IP
        { id: 'net-osi-model', title: 'OSI Model Deep Dive', type: 'presentation' },
        { id: 'net-osi-quiz', title: 'OSI Model Challenge', type: 'quiz' },
        { id: 'net-tcpip-model', title: 'TCP/IP Model', type: 'presentation' },

        // IP Addressing
        { id: 'net-ipv4-basics', title: 'IPv4 Addressing', type: 'presentation' },
        { id: 'net-subnetting', title: 'Subnetting Mastery', type: 'applet' },
        { id: 'net-ipv6-intro', title: 'IPv6 Fundamentals', type: 'presentation' },

        // Switching
        { id: 'net-ethernet', title: 'Ethernet & MAC', type: 'presentation' },
        { id: 'net-switching', title: 'Switch Operations', type: 'presentation' },
        { id: 'net-vlans', title: 'VLAN Concepts', type: 'presentation' },

        // Routing
        { id: 'net-routing-basics', title: 'Routing Fundamentals', type: 'presentation' },
        { id: 'net-static-routes', title: 'Static Routing', type: 'presentation' },
        { id: 'net-dynamic-routing', title: 'Dynamic Routing Overview', type: 'presentation' },

        // Services
        { id: 'net-dhcp-dns', title: 'DHCP & DNS', type: 'presentation' },
        { id: 'net-nat', title: 'NAT & PAT', type: 'presentation' },

        // Security Basics
        { id: 'net-security-intro', title: 'Network Security Basics', type: 'presentation' },
        { id: 'net-wireless-basics', title: 'Wireless Fundamentals', type: 'presentation' },

        // Foundation Assessment
        { id: 'net-foundation-exam', title: 'Foundation Assessment', type: 'quiz' }
    ]
}
```

### Phase 2: Network+ Specific Path

Create new path ID: `comptia-network`

```javascript
'comptia-network': {
    name: 'CompTIA Network+ (N10-009)',
    description: 'Complete Network+ certification preparation',
    icon: '📜',
    color: '#22c55e',
    prerequisite: 'networking-foundation',
    modules: [
        // Domain 1: Networking Concepts (23%)
        { id: 'np-ports-protocols', title: 'Ports & Protocols Reference', type: 'applet' },
        { id: 'np-cloud-concepts', title: 'Cloud & Virtualization', type: 'presentation' },
        { id: 'np-network-topologies', title: 'Network Topologies', type: 'presentation' },

        // Domain 2: Network Implementation (20%)
        { id: 'np-routing-protocols', title: 'Routing Protocol Concepts', type: 'presentation' },
        { id: 'np-wireless-config', title: 'Wireless Configuration', type: 'presentation' },
        { id: 'np-wan-technologies', title: 'WAN Technologies', type: 'presentation' },

        // Domain 3: Network Operations (19%)
        { id: 'np-documentation', title: 'Network Documentation', type: 'presentation' },
        { id: 'np-change-mgmt', title: 'Change Management', type: 'presentation' },
        { id: 'np-monitoring', title: 'Network Monitoring (SNMP)', type: 'applet' },
        { id: 'np-disaster-recovery', title: 'Disaster Recovery & BCP', type: 'presentation' },
        { id: 'np-lifecycle', title: 'Equipment Lifecycle', type: 'presentation' },

        // Domain 4: Network Security (14%)
        { id: 'np-encryption-pki', title: 'Encryption & PKI', type: 'presentation' },
        { id: 'np-attack-types', title: 'Network Attack Types', type: 'presentation' },
        { id: 'np-security-devices', title: 'Security Appliances', type: 'presentation' },
        { id: 'np-segmentation', title: 'Network Segmentation', type: 'presentation' },

        // Domain 5: Network Troubleshooting (24%)
        { id: 'np-troubleshoot-method', title: 'Troubleshooting Methodology', type: 'presentation' },
        { id: 'np-cable-diagnostics', title: 'Cable & Physical Issues', type: 'applet' },
        { id: 'np-connectivity-issues', title: 'Connectivity Troubleshooting', type: 'lab' },
        { id: 'np-performance-issues', title: 'Performance Problems', type: 'presentation' },
        { id: 'np-wireless-issues', title: 'Wireless Troubleshooting', type: 'lab' },

        // Practice Exams
        { id: 'np-practice-exam-1', title: 'Practice Exam 1', type: 'quiz' },
        { id: 'np-practice-exam-2', title: 'Practice Exam 2', type: 'quiz' },
        { id: 'np-final-exam', title: 'Network+ Final Assessment', type: 'quiz' }
    ]
}
```

### Phase 3: CCNA Specific Path

Create new path ID: `ccna`

```javascript
'ccna': {
    name: 'Cisco CCNA (200-301)',
    description: 'Complete CCNA certification preparation',
    icon: '🔷',
    color: '#0ea5e9',
    prerequisite: 'networking-foundation',
    modules: [
        // Cisco IOS Fundamentals (Gateway to CCNA)
        { id: 'ccna-ios-intro', title: 'Cisco IOS Introduction', type: 'presentation' },
        { id: 'ccna-ios-cli', title: 'IOS CLI Navigation', type: 'lab' },
        { id: 'ccna-ios-config', title: 'Basic Device Configuration', type: 'lab' },

        // Domain 2: Network Access (20%)
        { id: 'ccna-vlan-config', title: 'VLAN Configuration (IOS)', type: 'lab' },
        { id: 'ccna-trunking', title: 'Trunking & DTP', type: 'lab' },
        { id: 'ccna-stp', title: 'Spanning Tree Protocol', type: 'presentation' },
        { id: 'ccna-etherchannel', title: 'EtherChannel', type: 'lab' },
        { id: 'ccna-wireless-infra', title: 'Wireless Infrastructure', type: 'presentation' },

        // Domain 3: IP Connectivity (25%)
        { id: 'ccna-static-routing', title: 'Static Routing (IOS)', type: 'lab' },
        { id: 'ccna-ospf-concepts', title: 'OSPF Concepts', type: 'presentation' },
        { id: 'ccna-ospf-config', title: 'OSPF Configuration', type: 'lab' },
        { id: 'ccna-eigrp', title: 'EIGRP Fundamentals', type: 'presentation' },
        { id: 'ccna-route-selection', title: 'Route Selection & AD', type: 'presentation' },

        // Domain 4: IP Services (10%)
        { id: 'ccna-dhcp-config', title: 'DHCP Server Configuration', type: 'lab' },
        { id: 'ccna-nat-config', title: 'NAT Configuration', type: 'lab' },
        { id: 'ccna-ntp-snmp', title: 'NTP & SNMP Setup', type: 'lab' },
        { id: 'ccna-qos-basics', title: 'QoS Fundamentals', type: 'presentation' },

        // Domain 5: Security Fundamentals (15%)
        { id: 'ccna-acl-concepts', title: 'ACL Concepts', type: 'presentation' },
        { id: 'ccna-acl-config', title: 'ACL Configuration', type: 'lab' },
        { id: 'ccna-port-security', title: 'Switch Port Security', type: 'lab' },
        { id: 'ccna-aaa', title: 'AAA & RADIUS/TACACS+', type: 'presentation' },
        { id: 'ccna-vpn-basics', title: 'VPN Fundamentals', type: 'presentation' },

        // Domain 6: Automation & Programmability (10%)
        { id: 'ccna-sdn-concepts', title: 'SDN & Controllers', type: 'presentation' },
        { id: 'ccna-rest-apis', title: 'REST APIs for Networking', type: 'presentation' },
        { id: 'ccna-json-data', title: 'JSON Data Formats', type: 'applet' },
        { id: 'ccna-ansible-intro', title: 'Ansible for Network Automation', type: 'presentation' },
        { id: 'ccna-terraform-intro', title: 'Terraform Basics', type: 'presentation' },

        // Practice Exams
        { id: 'ccna-practice-exam-1', title: 'Practice Exam 1', type: 'quiz' },
        { id: 'ccna-practice-exam-2', title: 'Practice Exam 2', type: 'quiz' },
        { id: 'ccna-final-exam', title: 'CCNA Final Assessment', type: 'quiz' }
    ]
}
```

---

## Content Matrix

### Shared Content (Build Once, Use Twice)

| Module | Network+ Domain | CCNA Domain |
|--------|-----------------|-------------|
| OSI Model | 1.0 Concepts | 1.0 Fundamentals |
| TCP/IP Model | 1.0 Concepts | 1.0 Fundamentals |
| IPv4 Addressing | 1.0 Concepts | 1.0 Fundamentals |
| Subnetting | 1.0 Concepts | 1.0 Fundamentals |
| IPv6 Basics | 1.0 Concepts | 1.0 Fundamentals |
| Ethernet/Switching | 2.0 Implementation | 2.0 Network Access |
| VLAN Concepts | 2.0 Implementation | 2.0 Network Access |
| Routing Basics | 2.0 Implementation | 3.0 IP Connectivity |
| OSPF Concepts | 2.0 Implementation | 3.0 IP Connectivity |
| DHCP/DNS | 1.0 Concepts | 4.0 IP Services |
| NAT | 1.0 Concepts | 4.0 IP Services |
| Security Basics | 4.0 Security | 5.0 Security |
| Wireless Basics | 2.0 Implementation | 2.0 Network Access |

### Network+ Exclusive Content

| Module | Domain | Weight Impact |
|--------|--------|---------------|
| Network Documentation | 3.0 Operations | 19% |
| Change Management | 3.0 Operations | 19% |
| Disaster Recovery/BCP | 3.0 Operations | 19% |
| Equipment Lifecycle | 3.0 Operations | 19% |
| Troubleshooting Methodology | 5.0 Troubleshooting | 24% |
| Cable Diagnostics | 5.0 Troubleshooting | 24% |
| Physical Installation | 2.0 Implementation | 20% |
| Cloud Concepts (NFV, VPC) | 1.0 Concepts | 23% |

### CCNA Exclusive Content

| Module | Domain | Weight Impact |
|--------|--------|---------------|
| Cisco IOS CLI | All | Foundation |
| IOS Device Configuration | All | Foundation |
| EIGRP | 3.0 IP Connectivity | 25% |
| Spanning Tree Protocol | 2.0 Network Access | 20% |
| EtherChannel | 2.0 Network Access | 20% |
| ACL Configuration | 5.0 Security | 15% |
| Port Security | 5.0 Security | 15% |
| SDN/Controllers | 6.0 Automation | 10% |
| REST APIs | 6.0 Automation | 10% |
| Ansible/Terraform | 6.0 Automation | 10% |
| QoS Configuration | 4.0 IP Services | 10% |

---

## UI/UX Changes

### Web House Index Updates

Replace current certification cards with:

```html
<!-- Foundation Path -->
<div class="path-card foundation" onclick="openPath('networking-foundation')">
    <span class="path-icon">🌐</span>
    <div class="path-info">
        <h3>Networking Foundation</h3>
        <p>Start here - Core concepts for both certifications</p>
        <span class="path-meta">17 modules | ~8 hours</span>
    </div>
</div>

<!-- Certification Tracks -->
<div class="cert-tracks">
    <div class="path-card network-plus" onclick="openPath('comptia-network')">
        <span class="path-icon">📜</span>
        <div class="path-info">
            <h3>CompTIA Network+</h3>
            <p>N10-009 | Vendor-neutral networking</p>
            <span class="path-meta">22 modules | ~12 hours</span>
            <span class="prereq">Requires: Foundation</span>
        </div>
    </div>

    <div class="path-card ccna" onclick="openPath('ccna')">
        <span class="path-icon">🔷</span>
        <div class="path-info">
            <h3>Cisco CCNA</h3>
            <p>200-301 | Cisco-specific skills</p>
            <span class="path-meta">26 modules | ~15 hours</span>
            <span class="prereq">Requires: Foundation</span>
        </div>
    </div>
</div>
```

### Path View Updates

Add prerequisite checking:

```javascript
// In path-view.html
if (pathData.prerequisite) {
    const prereqComplete = isPathComplete(pathData.prerequisite);
    if (!prereqComplete) {
        showPrerequisiteWarning(pathData.prerequisite);
    }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Sprint F-WEB-01)
- [ ] Create `networking-foundation` path in LearningPaths.js
- [ ] Audit existing modules for foundation suitability
- [ ] Create missing foundation modules
- [ ] Update Web house UI with foundation card

### Phase 2: Network+ Track (Sprint F-WEB-02)
- [ ] Create `comptia-network` path in LearningPaths.js
- [ ] Build Network+ exclusive modules (Operations, Troubleshooting)
- [ ] Create practice exams aligned to N10-009 objectives
- [ ] Add prerequisite logic to path-view.html

### Phase 3: CCNA Track (Sprint F-WEB-03)
- [ ] Create `ccna` path in LearningPaths.js
- [ ] Build Cisco IOS CLI simulator/labs
- [ ] Create CCNA exclusive modules (Automation, EIGRP, ACLs)
- [ ] Create practice exams aligned to 200-301 objectives

### Phase 4: Polish (Sprint F-WEB-04)
- [ ] Add progress tracking per path
- [ ] Implement "dual certification" badge for completing both
- [ ] Add exam readiness indicators
- [ ] Create study schedule generator

---

## Content Development Priority

### High Priority (Foundation)
1. OSI/TCP-IP Models (exists, may need update)
2. IP Addressing & Subnetting (exists)
3. Switching & VLANs (exists, may need update)
4. Routing Fundamentals (exists)
5. DHCP/DNS/NAT (needs creation)
6. Basic Security (needs creation)

### Medium Priority (Cert-Specific)
1. **Network+:** Troubleshooting Methodology
2. **Network+:** Network Operations & Documentation
3. **CCNA:** Cisco IOS CLI Basics
4. **CCNA:** OSPF/EIGRP Configuration Labs

### Lower Priority (Advanced)
1. **Network+:** Disaster Recovery Planning
2. **CCNA:** SDN & Automation
3. **CCNA:** REST APIs & JSON
4. Practice Exams (both)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Foundation completion rate | >70% |
| Cert path enrollment after foundation | >50% |
| Practice exam pass rate (first attempt) | >60% |
| Student feedback rating | >4.5/5 |

---

## Open Questions

1. **Cisco Packet Tracer Integration?**
   - Should we embed or link to Packet Tracer for IOS labs?
   - Alternative: Build web-based CLI simulator

2. **Exam Voucher Partnerships?**
   - Explore CompTIA Academic pricing
   - Cisco NetAcad partnership potential

3. **Content Licensing?**
   - Can we reference official exam objectives directly?
   - Need to review CompTIA/Cisco usage policies

---

## References

- [CompTIA Network+ N10-009 Objectives](https://www.comptia.org/certifications/network)
- [Cisco CCNA 200-301 Exam Topics](https://learningnetwork.cisco.com/s/ccna-exam-topics)
- [Pearson CCNA Exam Profile](https://www.pearsonitcertification.com/articles/article.aspx?p=2982442)

---

*Document Version: 1.0*
*Last Updated: January 28, 2026*
