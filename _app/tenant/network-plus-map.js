/**
 * Network+ N10-009 Course Content Map
 * Auto-extracted from the hub page data-module attributes.
 * Used by the instructor dashboard Course Progress view to show
 * per-item completion rates across all enrolled students.
 *
 * Each chapter lists its expected content items (modules, presentations,
 * tools, labs, quizzes) with their data-module IDs matching what
 * ModuleProgress.complete() saves to localStorage and Firestore.
 */
var NETWORK_PLUS_MAP = {
    courseId: "network-plus",
    title: "CompTIA Network+ N10-009",
    /* ── LEGACY ID ALIASES ──────────────────────────────────────────────────────────
       The 28 ids above were migrated from web-<name> to web-np-<name>-<type>, which is
       what ModuleProgress.complete() now writes and what the hub card data-module
       attributes now carry (network-plus/index.html).

       A student's stored record is NOT rewritten by that migration. Content pages call
       copyLegacyKey(old -> new) on load, but that only runs for someone who opens the
       page again, and it never writes back from new to old. So two populations coexist
       in Firestore: older records holding only the OLD id, and current records holding
       the NEW one.

       Swapping the ids above WITHOUT this table would therefore have traded one silent
       under-count for its mirror image: new completions would start appearing on the
       instructor dashboard while every historical completion vanished from it. The
       dashboard maps old -> new through this table when it loads student data, so both
       populations count. Entries are keyed OLD -> NEW and are safe to keep forever.
       ───────────────────────────────────────────────────────────────────────────────── */
    idAliases: {
        "web-osi": "web-np-osi-pres",
        "web-osi-deep-dive": "web-np-osi-deep-dive-pres",
        "web-ne01-osi-scenario": "web-np-ne01-osi-scenario-lab",
        "web-tcp": "web-np-tcp-pres",
        "web-port": "web-np-port-tool",
        "web-ne02-tcpip-scenario": "web-np-ne02-tcpip-scenario-lab",
        "web-ne03-subnet-scenario": "web-np-ne03-subnet-scenario-lab",
        "web-subnetting-practice": "web-np-subnetting-practice-lab",
        "web-switch-operations": "web-np-switch-operations-pres",
        "web-vlan": "web-np-vlan-pres",
        "web-stp": "web-np-stp-pres",
        "web-ospf": "web-np-ospf-pres",
        "web-fhrp": "web-np-fhrp-pres",
        "web-ospf-cost": "web-np-ospf-cost-tool",
        "web-wan-technologies": "web-np-wan-technologies-pres",
        "web-cloud-networking": "web-np-cloud-networking-pres",
        "web-ne07-nat-scenario": "web-np-ne07-nat-scenario-lab",
        "web-wireless": "web-np-wireless-pres",
        "web-wireless-architecture": "web-np-wireless-architecture-pres",
        "web-ne08-wireless-scenario": "web-np-ne08-wireless-scenario-lab",
        "web-network-monitoring": "web-np-network-monitoring-pres",
        "web-high-availability": "web-np-high-availability-pres",
        "web-qos": "web-np-qos-tool",
        "web-network-security": "web-np-network-security-pres",
        "web-networking-ch7-20": "web-np-ch7-20-quiz",
        "web-packet-analysis": "web-np-packet-analysis-lab",
        "web-vlan-config": "web-np-vlan-config-lab",
        "web-troubleshooting-lab": "web-np-troubleshooting-lab"
    },

    chapters: [
        {
            id: "ch1",
            num: 1,
            title: "OSI Model",
            items: [
                { id: "web-ne-01", type: "module", title: "OSI Model Deep Dive" },
                { id: "web-np-osi-pres", type: "presentation", title: "OSI Model Overview" },
                { id: "web-osi-model", type: "presentation", title: "OSI Model" },
                { id: "web-np-osi-deep-dive-pres", type: "presentation", title: "OSI Deep Dive" },
                { id: "web-osi-tool", type: "tool", title: "OSI Reference Tool" },
                { id: "web-osi-deep-dive-tool", type: "tool", title: "OSI Deep Dive Tool" },
                { id: "gui-ne01-wireshark", type: "lab", title: "Wireshark Packet Inspector" },
                { id: "web-np-ne01-osi-scenario-lab", type: "lab", title: "OSI Layer Diagnosis" },
                { id: "web-osi-quiz", type: "quiz", title: "Chapter 1: OSI Quiz" },
            ]
        },
        {
            id: "ch2",
            num: 2,
            title: "TCP/IP & Protocols",
            items: [
                { id: "web-ne-02", type: "module", title: "TCP/IP Protocol Suite" },
                { id: "web-np-tcp-pres", type: "presentation", title: "TCP Fundamentals" },
                { id: "web-ports", type: "presentation", title: "Ports &amp; Protocols" },
                { id: "web-arp", type: "presentation", title: "ARP" },
                { id: "web-icmp", type: "presentation", title: "ICMP Protocol" },
                { id: "web-traffic-types", type: "presentation", title: "Traffic Types" },
                { id: "web-ipsec-gre", type: "presentation", title: "IPSec &amp; GRE" },
                { id: "web-np-port-tool", type: "presentation", title: "Port Reference Tool" },
                { id: "gui-ne02-windows-nic", type: "lab", title: "Windows NIC Configuration" },
                { id: "web-np-ne02-tcpip-scenario-lab", type: "lab", title: "TCP/IP Troubleshooting" },
                { id: "web-tcpip-quiz", type: "quiz", title: "Chapter 2: TCP/IP Quiz" },
            ]
        },
        {
            id: "ch3",
            num: 3,
            title: "IP Addressing & Subnetting",
            items: [
                { id: "web-ne-03", type: "module", title: "IP Addressing &amp; Subnetting" },
                { id: "web-subnetting", type: "presentation", title: "Subnetting" },
                { id: "web-ipv6", type: "presentation", title: "IPv6" },
                { id: "web-subnetting-tool", type: "tool", title: "Subnet Calculator Tool" },
                { id: "web-ipv6-tool", type: "tool", title: "IPv6 Reference Tool" },
                { id: "web-np-ne03-subnet-scenario-lab", type: "lab", title: "Subnetting After Merger" },
                { id: "web-np-subnetting-practice-lab", type: "presentation", title: "Subnetting Practice" },
                { id: "web-subnetting-quiz", type: "quiz", title: "Chapter 3: Subnetting Quiz" },
            ]
        },
        {
            id: "ch4",
            num: 4,
            title: "Cables, Connectors & Infrastructure",
            items: [
                { id: "web-ne-04-infrastructure", type: "module", title: "Physical Infrastructure" },
                { id: "web-cables", type: "presentation", title: "Cables &amp; Media" },
                { id: "web-physical-installations", type: "presentation", title: "Physical Installations" },
                { id: "web-topologies", type: "presentation", title: "Topologies" },
                { id: "web-devices", type: "presentation", title: "Network Devices" },
                { id: "web-cable-tool", type: "tool", title: "Cable Reference Tool" },
                { id: "web-topology-tool", type: "tool", title: "Topology Tool" },
                { id: "gui-ne04-cable-testing", type: "lab", title: "Cable Testing Lab" },
                { id: "gui-ne04-server-room", type: "lab", title: "Server Room Setup" },
                { id: "web-infrastructure-quiz", type: "quiz", title: "Chapter 4: Infrastructure Quiz" },
            ]
        },
        {
            id: "ch5",
            num: 5,
            title: "Ethernet & Switching",
            items: [
                { id: "web-ne-04", type: "module", title: "Ethernet &amp; Switching" },
                { id: "web-np-switch-operations-pres", type: "presentation", title: "Switch Operations" },
                { id: "web-np-vlan-pres", type: "presentation", title: "VLANs" },
                { id: "web-np-stp-pres", type: "presentation", title: "Spanning Tree Protocol" },
                { id: "web-etherchannel", type: "presentation", title: "EtherChannel" },
                { id: "web-switch-operations-tool", type: "tool", title: "Switch Operations Tool" },
                { id: "web-vlan-tool", type: "tool", title: "VLAN Tool" },
                { id: "web-stp-tool", type: "tool", title: "STP Tool" },
                { id: "web-etherchannel-tool", type: "tool", title: "EtherChannel Tool" },
                { id: "gui-ne04-unifi-switch", type: "lab", title: "UniFi Switch Controller" },
                { id: "web-switching-quiz", type: "quiz", title: "Chapter 5: Switching Quiz" },
            ]
        },
        {
            id: "ch6",
            num: 6,
            title: "Routing Fundamentals",
            items: [
                { id: "web-ne-05", type: "module", title: "Routing Fundamentals" },
                { id: "web-np-ospf-pres", type: "presentation", title: "OSPF" },
                { id: "web-eigrp", type: "presentation", title: "EIGRP" },
                { id: "web-np-fhrp-pres", type: "presentation", title: "FHRP" },
                { id: "web-np-ospf-cost-tool", type: "presentation", title: "OSPF Cost Tool" },
                { id: "gui-ne05-pfsense", type: "lab", title: "pfSense Firewall / Router" },
                { id: "web-static-routes", type: "presentation", title: "Static Routes" },
                { id: "web-routing-quiz", type: "quiz", title: "Chapter 6: Routing Quiz" },
            ]
        },
        {
            id: "ch7",
            num: 7,
            title: "DNS, DHCP & Network Services",
            items: [
                { id: "web-ne-06", type: "module", title: "DNS &amp; DHCP" },
                { id: "web-dns", type: "presentation", title: "DNS" },
                { id: "web-dhcp", type: "presentation", title: "DHCP" },
                { id: "web-ntp", type: "presentation", title: "NTP" },
                { id: "web-network-services-tool", type: "tool", title: "Network Services Tool" },
                { id: "gui-ne06-dns-dhcp-console", type: "lab", title: "DNS &amp; DHCP Console" },
                { id: "web-dns-troubleshooting", type: "presentation", title: "DNS Troubleshooting" },
                { id: "web-dns-dhcp-quiz", type: "quiz", title: "Chapter 7: DNS &amp; DHCP Quiz" },
            ]
        },
        {
            id: "ch8",
            num: 8,
            title: "NAT, WAN, Cloud & Remote Access",
            items: [
                { id: "web-ne-07", type: "module", title: "Network Address Translation" },
                { id: "web-nat", type: "presentation", title: "NAT" },
                { id: "web-np-wan-technologies-pres", type: "presentation", title: "WAN Technologies" },
                { id: "web-np-cloud-networking-pres", type: "presentation", title: "Cloud Networking" },
                { id: "web-network-access-methods", type: "presentation", title: "Network Access Methods" },
                { id: "gui-ne07-paloalto", type: "lab", title: "Palo Alto Firewall" },
                { id: "web-np-ne07-nat-scenario-lab", type: "lab", title: "NAT Troubleshooting" },
                { id: "web-wan-cloud-quiz", type: "quiz", title: "Chapter 8: WAN & Cloud Quiz" },
            ]
        },
        {
            id: "ch9",
            num: 9,
            title: "Wireless Networking",
            items: [
                { id: "web-ne-08", type: "module", title: "Wireless Networking" },
                { id: "web-np-wireless-pres", type: "presentation", title: "Wireless Networking" },
                { id: "web-np-wireless-architecture-pres", type: "presentation", title: "Wireless Architecture" },
                { id: "web-wireless-tool", type: "tool", title: "Wireless Reference Tool" },
                { id: "web-wireless-architecture-tool", type: "tool", title: "Wireless Architecture Tool" },
                { id: "gui-ne08-unifi-wireless", type: "lab", title: "UniFi Wireless Controller" },
                { id: "web-np-ne08-wireless-scenario-lab", type: "lab", title: "Wireless Site Survey" },
                { id: "web-wireless-quiz", type: "quiz", title: "Chapter 9: Wireless Quiz" },
            ]
        },
        {
            id: "ch10",
            num: 10,
            title: "Network Operations & Monitoring",
            items: [
                { id: "web-ne-10-operations", type: "module", title: "Network Operations & Monitoring" },
                { id: "web-organizational-processes", type: "presentation", title: "Organizational Processes" },
                { id: "web-np-network-monitoring-pres", type: "presentation", title: "Network Monitoring" },
                { id: "web-np-high-availability-pres", type: "presentation", title: "High Availability" },
                { id: "web-performance-issues", type: "presentation", title: "Performance Issues" },
                { id: "web-np-qos-tool", type: "presentation", title: "QoS Tool" },
                { id: "gui-ne10-monitoring", type: "lab", title: "SNMP & Syslog Monitoring" },
                { id: "gui-ne10-change-mgmt", type: "lab", title: "Change Management Workflow" },
                { id: "web-operations-quiz", type: "quiz", title: "Chapter 10: Operations Quiz" },
            ]
        },
        {
            id: "ch11",
            num: 11,
            title: "Network Security",
            items: [
                { id: "web-ne-10", type: "module", title: "Network Security Fundamentals" },
                { id: "web-np-network-security-pres", type: "presentation", title: "Network Security" },
                { id: "web-security-tool", type: "tool", title: "Security Reference Tool" },
                { id: "web-acl-tool", type: "tool", title: "ACL Tool" },
                { id: "gui-ne10-juniper", type: "lab", title: "Juniper SRX Firewall" },
                { id: "web-firewall-rules", type: "presentation", title: "Firewall Rules" },
                { id: "web-security-quiz", type: "quiz", title: "Chapter 11: Security Quiz" },
            ]
        },
        {
            id: "ch12",
            num: 12,
            title: "Troubleshooting",
            items: [
                { id: "web-ne-09", type: "module", title: "Troubleshooting Methodology" },
                { id: "web-troubleshooting", type: "presentation", title: "Troubleshooting" },
                { id: "web-troubleshooting-tool", type: "tool", title: "Troubleshooting Tool" },
                { id: "gui-ne09-linux-network", type: "lab", title: "Linux NetworkManager" },
                { id: "web-troubleshooting-quiz", type: "quiz", title: "Chapter 12: Troubleshooting Quiz" },
                { id: "gui-midterm-comprehensive", type: "lab", title: "Midterm Lab" },
                { id: "web-netplus-final-practice", type: "presentation", title: "N10-009 Practice Exam" },
                { id: "web-np-ch7-20-quiz", type: "presentation", title: "Workbook Ch 7-20" },
                { id: "web-netplus-jeopardy", type: "presentation", title: "Jeopardy Review Game" },
                { id: "web-pbq-vlan-switch", type: "presentation", title: "PBQ: VLAN Switch Config" },
                { id: "web-pbq-network-discovery", type: "presentation", title: "PBQ: Network Discovery" },
                { id: "web-pbq-routing-troubleshoot", type: "presentation", title: "PBQ: Routing Troubleshoot" },
                { id: "web-pbq-network-design", type: "presentation", title: "PBQ: Network Design" },
                { id: "web-np-packet-analysis-lab", type: "presentation", title: "Packet Analysis" },
                { id: "web-networking-fundamentals", type: "presentation", title: "Networking Fundamentals" },
                { id: "web-np-vlan-config-lab", type: "presentation", title: "VLAN Configuration" },
                { id: "web-np-troubleshooting-lab", type: "presentation", title: "Troubleshooting Lab" },
            ]
        },
    ]
};
