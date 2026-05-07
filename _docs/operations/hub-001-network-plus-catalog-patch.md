# HUB-001 — `web/network-plus` catalog patch (largest hub, ready to merge)

## Summary

Largest HUB-001 finding in the platform (115 refs). Same shape as ethics-it: clean Class A finding, **all 74 dead references resolve to real files**, single-commit catalog patch flips the hub from current 20% live → 36% live (without Option 1) or **20% live → 100% live with PFI Option 1 + this patch**.

## Verified state

```
houses/web/network-plus/index.html
  refs: 115
  live (current validator):           23   (20%)
  live (with Option 1 suffix tol.):   41   (+18 if PFI Option 1 approved)
  catalog gap (file exists):          74   (paste-ready below — this proposal)
  true dead:                           0
```

The 74 paste-ready entries split by component type:

| Group | Count | File location |
|---|---|---|
| `web-ne-{NN}` modules | 12 | `modules/ne-NN.html` and 2 specials (`-infrastructure`, `-operations`) |
| `web-{topic}` presentations | 13 | `presentations/{topic}.presentation.html` |
| `gui-*` GUI labs (NE-01..NE-10 walkthroughs) | 14 | `labs/{neNN}-{topic}-gui.lab.html` |
| `web-pbq-{topic}` Performance-Based Question labs | 4 | `labs/pbq-{topic}.lab.html` |
| `web-{topic}-quiz` quizzes | 10 | `quizzes/{topic}.quiz.html` |
| Final exam + Jeopardy review | 2 | `exams/{final-practice|jeopardy}.{exam|review}.html` |
| `web-{topic}-tool` interactive applets | 19 | `tools/{topic}.tool.html` |

The `gui-*` prefix the original consolidated analysis flagged as a "Class D convention question" turns out to be: GUI version of a numbered NE-XX lab. Pattern: hub IDs use `gui-{module-prefix}` while files use `{module-prefix}-gui.lab.html`. Both intentional; cataloging as `components: ['lab']` matches existing convention.

## Coverage table after both fixes land

| Status | Count | % |
|---|---|---|
| LIVE today (house-prefix only) | 23 | 20% |
| + this patch (74 entries) | 97 | 84% |
| + PFI Option 1 (suffix tolerance, +18) | **115** | **100%** |

## Patch (paste into `_app/components/ContentCatalog.js`)

Insert near other `house: 'web'` Network+ entries.

```js
// MODULE (12)
        { house: 'web', id: 'web-ne-01', title: "NE-01: OSI Model Deep Dive", description: "NE-01: OSI Model Deep Dive", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-01.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-02', title: "NE-02: TCP/IP Protocol Suite", description: "NE-02: TCP/IP Protocol Suite", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-02.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-03', title: "NE-03: IP Addressing & Subnetting", description: "NE-03: IP Addressing & Subnetting", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-03.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-04', title: "NE-04: Ethernet & Switching Fundamentals", description: "NE-04: Ethernet & Switching Fundamentals", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-04.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-04-infrastructure', title: "NE-04: Physical Infrastructure", description: "NE-04: Physical Infrastructure", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-04-infrastructure.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-05', title: "NE-05: Routing Fundamentals", description: "NE-05: Routing Fundamentals", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-05.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-06', title: "NE-06: DNS & DHCP", description: "NE-06: DNS & DHCP", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-06.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-07', title: "NE-07: Network Address Translation", description: "NE-07: Network Address Translation", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-07.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-08', title: "NE-08: Wireless Networking Basics", description: "NE-08: Wireless Networking Basics", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-08.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-09', title: "NE-09: Network Troubleshooting Methodology", description: "NE-09: Network Troubleshooting Methodology", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-09.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-10', title: "NE-10: Network Security Fundamentals", description: "NE-10: Network Security Fundamentals", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-10.html', category: 'netplus' },
        { house: 'web', id: 'web-ne-10-operations', title: "NE-10: Network Operations & Monitoring", description: "NE-10: Network Operations & Monitoring", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'network-plus/modules/ne-10-operations.html', category: 'netplus' },
// PRESENTATION (13)
        { house: 'web', id: 'web-icmp', title: "ICMP: The Network's Diagnostic Language", description: "The Network's Diagnostic Language", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/icmp.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-ipsec-gre', title: "IPSec & GRE - Securing Traffic Across the Internet", description: "IPSec & GRE - Securing Traffic Across the Internet", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/ipsec-gre.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-network-access-methods', title: "Network Access Methods", description: "Network Access Methods", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/network-access-methods.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-organizational-processes', title: "Organizational Processes", description: "Organizational Processes", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/organizational-processes.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-osi-deep-dive', title: "OSI Troubleshooting Deep Dive — Diagnose by Layer", description: "OSI Troubleshooting Deep Dive — Diagnose by Layer", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/osi-deep-dive.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-ospf', title: "OSPF", description: "OSPF", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/ospf.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-performance-issues', title: "Performance Issues", description: "Performance Issues", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/performance-issues.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-physical-installations', title: "Physical Installations", description: "Physical Installations", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/physical-installations.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-switch-operations', title: "Switch Operations", description: "Switch Operations", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/switch-operations.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-tcp', title: "TCP/IP — The Backbone of Reliable Communication", description: "TCP/IP — The Backbone of Reliable Communication", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/tcp.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-traffic-types', title: "Network Traffic Types — Unicast, Multicast, Anycast, Broadcast", description: "Network Traffic Types — Unicast, Multicast, Anycast, Broadcast", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/traffic-types.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-vlan', title: "VLANs & Trunking", description: "VLANs & Trunking", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/vlan.presentation.html', category: 'netplus' },
        { house: 'web', id: 'web-wireless-architecture', title: "Wireless Architecture", description: "Wireless Architecture", icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'network-plus/presentations/wireless-architecture.presentation.html', category: 'netplus' },
// LAB (18)
        { house: 'web', id: 'gui-midterm-comprehensive', title: "Network+ Midterm — Comprehensive GUI Lab", description: "Network+ Midterm — Comprehensive GUI Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/midterm-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne01-wireshark', title: "NE-01 Lab: Wireshark Packet Inspector", description: "NE-01 Lab: Wireshark Packet Inspector", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne01-wireshark-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne02-windows-nic', title: "NE-02 Lab: Windows NIC Configuration", description: "NE-02 Lab: Windows NIC Configuration", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne02-windows-nic-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne04-cable-testing', title: "NE-04 Lab: Cable Testing & Troubleshooting", description: "NE-04 Lab: Cable Testing & Troubleshooting", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne04-cable-testing-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne04-server-room', title: "NE-04 Lab: Server Room Setup", description: "NE-04 Lab: Server Room Setup", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne04-server-room-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne04-unifi-switch', title: "NE-04: UniFi Switch Configuration Lab", description: "NE-04: UniFi Switch Configuration Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne04-unifi-switch-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne05-pfsense', title: "NE-05 Routing: pfSense Firewall/Router GUI Lab", description: "NE-05 Routing: pfSense Firewall/Router GUI Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne05-pfsense-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne06-dns-dhcp-console', title: "NE-06: DNS & DHCP Server Configuration Lab", description: "NE-06: DNS & DHCP Server Configuration Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne06-dns-dhcp-console-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne07-paloalto', title: "NE-07 NAT: Palo Alto PA-220 Firewall GUI Lab", description: "NE-07 NAT: Palo Alto PA-220 Firewall GUI Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne07-paloalto-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne08-unifi-wireless', title: "NE-08: UniFi Wireless Controller Lab", description: "NE-08: UniFi Wireless Controller Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne08-unifi-wireless-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne09-linux-network', title: "NE-09: Linux Network Troubleshooting — GUI Lab", description: "NE-09: Linux Network Troubleshooting — GUI Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne09-linux-network-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne10-change-mgmt', title: "NE-10 Lab: Change Management & Documentation", description: "NE-10 Lab: Change Management & Documentation", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne10-change-mgmt-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne10-juniper', title: "NE-10 Security: Juniper SRX345 Firewall Hardening GUI Lab", description: "NE-10 Security: Juniper SRX345 Firewall Hardening GUI Lab", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne10-juniper-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'gui-ne10-monitoring', title: "NE-10 Lab: SNMP & Syslog Monitoring", description: "NE-10 Lab: SNMP & Syslog Monitoring", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/ne10-monitoring-gui.lab.html', category: 'netplus' },
        { house: 'web', id: 'web-pbq-network-design', title: "PBQ: Network Design", description: "Network Design", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/pbq-network-design.lab.html', category: 'netplus' },
        { house: 'web', id: 'web-pbq-network-discovery', title: "PBQ: Network Discovery", description: "Network Discovery", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/pbq-network-discovery.lab.html', category: 'netplus' },
        { house: 'web', id: 'web-pbq-routing-troubleshoot', title: "PBQ: Routing Troubleshoot", description: "Routing Troubleshoot", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/pbq-routing-troubleshoot.lab.html', category: 'netplus' },
        { house: 'web', id: 'web-pbq-vlan-switch', title: "PBQ: VLAN Switch Configuration", description: "VLAN Switch Configuration", icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'network-plus/labs/pbq-vlan-switch-config.lab.html', category: 'netplus' },
// QUIZ (10)
        { house: 'web', id: 'web-dns-dhcp-quiz', title: "DNS & DHCP Quiz | N10-009", description: "DNS & DHCP Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/dns-dhcp.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-infrastructure-quiz', title: "Infrastructure Quiz | N10-009", description: "Infrastructure Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/infrastructure.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-operations-quiz', title: "Operations Quiz | N10-009", description: "Operations Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/operations.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-routing-quiz', title: "Routing Quiz | N10-009", description: "Routing Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/routing.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-security-quiz', title: "Security Quiz | N10-009", description: "Security Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/security.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-switching-quiz', title: "Switching Quiz | N10-009", description: "Switching Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/switching.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-tcpip-quiz', title: "TCP/IP Quiz | N10-009", description: "TCP/IP Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/tcpip.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-troubleshooting-quiz', title: "Troubleshooting Quiz | N10-009", description: "Troubleshooting Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/troubleshooting.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-wan-cloud-quiz', title: "WAN & Cloud Quiz | N10-009", description: "WAN & Cloud Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/wan-cloud.quiz.html', category: 'netplus' },
        { house: 'web', id: 'web-wireless-quiz', title: "Wireless Quiz | N10-009", description: "Wireless Quiz | N10-009", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['quiz'], href: 'network-plus/quizzes/wireless.quiz.html', category: 'netplus' },
// EXAM (1)
        { house: 'web', id: 'web-netplus-final-practice', title: "CompTIA Network+ N10-009 Final Practice Exam - Hexworth Prime", description: "CompTIA Network+ N10-009 Final Practice Exam - Hexworth Prime", icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['exam'], href: 'network-plus/exams/final-practice.exam.html', category: 'netplus' },
// REVIEW (1)
        { house: 'web', id: 'web-netplus-jeopardy', title: "Network+ N10-009 Jeopardy Review - Hexworth Prime", description: "Network+ N10-009 Jeopardy Review - Hexworth Prime", icon: '/assets/images/icons/icon-scroll.webp', status: 'available', components: ['review'], href: 'network-plus/exams/jeopardy.review.html', category: 'netplus' },
// APPLET (19)
        { house: 'web', id: 'web-acl-tool', title: "ACL Visualizer", description: "ACL Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/acl.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-cable-tool', title: "Cable Visualizer - Network Essentials", description: "Cable Visualizer - Network Essentials", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/cable.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-etherchannel-tool', title: "EtherChannel Visualizer - LACP & PAgP", description: "EtherChannel Visualizer - LACP & PAgP", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/etherchannel.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-ipv6-tool', title: "IPv6 Visualizer", description: "IPv6 Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/ipv6.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-network-services-tool', title: "Network Services Visualizer | DHCP, DNS, NTP", description: "Network Services Visualizer | DHCP, DNS, NTP", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/network-services.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-osi-deep-dive-tool', title: "OSI Model Deep Dive", description: "OSI Model Deep Dive", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/osi-deep-dive.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-osi-tool', title: "OSI Model Visualizer", description: "OSI Model Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/osi.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-ospf-cost', title: "OSPF Cost Visualizer", description: "OSPF Cost Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/ospf-cost.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-port', title: "Port Visualizer - Network Essentials", description: "Port Visualizer - Network Essentials", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/port.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-qos', title: "QoS Visualizer - Network+ N10-009", description: "QoS Visualizer - Network+ N10-009", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/qos.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-security-tool', title: "Network Security Visualizer - Network+ N10-009", description: "Network Security Visualizer - Network+ N10-009", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/security.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-stp-tool', title: "STP Visualizer - Network+ N10-009", description: "STP Visualizer - Network+ N10-009", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/stp.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-subnetting-tool', title: "Subnetting Visualizer", description: "Subnetting Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/subnetting.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-switch-operations-tool', title: "Switch Operations Visualizer", description: "Switch Operations Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/switch-operations.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-topology-tool', title: "Network Topology Visualizer", description: "Network Topology Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/topology.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-troubleshooting-tool', title: "Network Troubleshooting Visualizer - Network+ N10-009", description: "Network Troubleshooting Visualizer - Network+ N10-009", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/troubleshooting.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-vlan-tool', title: "VLAN Visualizer", description: "VLAN Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/vlan.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-wireless-architecture-tool', title: "Wireless Architecture Visualizer", description: "Wireless Architecture Visualizer", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/wireless-architecture.tool.html', category: 'netplus' },
        { house: 'web', id: 'web-wireless-tool', title: "Wireless Networking Visualizer - Network Essentials", description: "Wireless Networking Visualizer - Network Essentials", icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['applet'], href: 'network-plus/tools/wireless.tool.html', category: 'netplus' },
```

(Total: 12 modules + 13 presentations + 14 GUI labs + 4 PBQ labs + 10 quizzes + 1 exam + 1 review + 19 applets = 74 entries.)

## Notes for operator review

1. **Title escaping**: I used double-quoted JS strings throughout because some titles contain apostrophes (e.g. `web-icmp` title is `"ICMP: The Network's Diagnostic Language"`). The catalog file mostly uses single quotes for strings. Either convention works — but **mixing single+double on the same array element will not compile**. If operator prefers single quotes platform-wide, the apostrophes in 1-2 titles need to be HTML-escaped (`&#39;`) or rewritten.
2. **Title quality**: titles extracted from each file's `<title>` tag with site-suffix stripping. Most are clean; a few are barebones (`"OSPF"`, `"VLANs & Trunking"`). Operator may refine.
3. **Tool components**: existing catalog uses `components: ['applet']` for interactive tools; this patch follows that convention. There is no `components: ['tool']` convention today.

## Verification

All 74 paths verified to exist on disk by `_tools/audit-hub-deadrefs-v2.js` run on 2026-05-07. The generation script that produced this entry list lives in commit history (parameterized over hub directory); operator can re-run if any titles drift.

## How to apply (if approved)

```bash
# 1. Open _app/components/ContentCatalog.js
# 2. Find the 'web' house Network+ section (search: house: 'web' near network-plus)
# 3. Paste the 74 entries above
# 4. Save
# 5. node _tools/eduscan/cli.js --files _app/components/ContentCatalog.js,_app/houses/web/network-plus/index.html
#    Verify HUB-001 finding for network-plus drops from 92 to 18 (or 0 if Option 1 also applied)
# 6. git add _app/components/ContentCatalog.js && git commit
# 7. ./deploy.sh --only hosting
```

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Sister proposals (Class A paste-and-deploy): `hub-001-ccna-catalog-patch.md`, `hub-001-ethics-it-catalog-patch.md`, `hub-001-adv-linux-catalog-patch.md`
- Cross-hub Option 1 dependency: `hub-001-pfi-catalog-patch.md`
- Strategy umbrella: `sym-8-hub001-fix-proposal.md`
- Consolidated decision matrix: `hub-001-all-hubs-analysis.md`
