# HUB-001 — `web/ccna` catalog patch (ready to merge)

## Summary

`web/ccna` is the easiest HUB-001 fix: 25 of 25 `data-module` references point to real files on disk that simply have no catalog entries. **One commit (31 catalog entries) flips the hub from 0% live → 100% live and clears it from the HUB-001 finding set.**

This doc is the operator-review artifact. Everything below is auto-generated from on-disk files — no curriculum decisions required.

## Verified state (catalog-aware audit)

```
houses/web/ccna/index.html
  refs: 25  |  live: 0  broken: 0  fileNoCatalog: 25  dead: 0
```

All 25 referenced IDs match files in `_app/houses/web/ccna/`:
- 25 module files at `modules/ccna-{NN}.module.html`
- (Optional) 6 lab files at `labs/ccna-{name}-lab.lab.html` — not currently referenced by hub but exist on disk; recommended to add for completeness

## Patch (paste into `_app/components/ContentCatalog.js`)

Insert anywhere in the catalog array, ideally grouped near other `house: 'web'` CCNA-related entries.

```js
        // CCNA 200-301 — module entries (25)
        { house: 'web', id: 'ccna-01', title: 'CCNA-01: Network Components & Architecture', description: 'Network components, topologies, and architecture fundamentals', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-01.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-02', title: 'CCNA-02: OSI & TCP/IP Models', description: 'OSI 7-layer model and TCP/IP stack fundamentals', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-02.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-03', title: 'CCNA-03: IPv4 Addressing & Subnetting', description: 'IPv4 addressing, subnetting, and VLSM', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-03.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-04', title: 'CCNA-04: IPv6 Fundamentals', description: 'IPv6 addressing, transition mechanisms', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-04.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-05', title: 'CCNA-05: Cisco IOS Fundamentals', description: 'Cisco IOS CLI, modes, configuration basics', icon: '/assets/images/icons/icon-terminal.webp', status: 'available', components: ['module'], href: 'modules/ccna-05.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-06', title: 'CCNA-06: Ethernet Switching Fundamentals', description: 'Ethernet switching, MAC tables, switch operations', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-06.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-07', title: 'CCNA-07: VLANs & Inter-VLAN Routing', description: 'VLAN configuration, trunking, and inter-VLAN routing', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-07.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-08', title: 'CCNA-08: Spanning Tree Protocol & EtherChannel', description: 'STP, RSTP, MSTP, and EtherChannel link aggregation', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-08.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-09', title: 'CCNA-09: Wireless Networking & Cisco Wireless', description: 'Wireless networking concepts and Cisco wireless solutions', icon: '/assets/images/icons/icon-antenna.webp', status: 'available', components: ['module'], href: 'modules/ccna-09.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-10', title: 'CCNA-10: Routing Fundamentals & Static Routes', description: 'Routing fundamentals and static route configuration', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-10.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-11', title: 'CCNA-11: OSPF Single-Area', description: 'OSPF single-area configuration and operation', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-11.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-12', title: 'CCNA-12: OSPF Multi-Area & Tuning', description: 'OSPF multi-area design, tuning, and authentication', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-12.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-13', title: 'CCNA-13: First Hop Redundancy & Advanced Routing', description: 'HSRP, VRRP, GLBP and advanced routing topics', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-13.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-14', title: 'CCNA-14: NAT & PAT', description: 'Network Address Translation and Port Address Translation', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-14.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-15', title: 'CCNA-15: DHCP, DNS & Network Services', description: 'DHCP, DNS, NTP, and other essential network services', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-15.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-16', title: 'CCNA-16: QoS Concepts', description: 'Quality of Service concepts, classification, marking', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['module'], href: 'modules/ccna-16.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-17', title: 'CCNA-17: Network Management & Monitoring', description: 'SNMP, syslog, NetFlow, and network monitoring', icon: '/assets/images/icons/icon-magnifier.webp', status: 'available', components: ['module'], href: 'modules/ccna-17.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-18', title: 'CCNA-18: Network Security Concepts', description: 'Network security fundamentals, threats, and defenses', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'modules/ccna-18.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-19', title: 'CCNA-19: Access Control Lists', description: 'ACL fundamentals, standard and extended ACLs', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'modules/ccna-19.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-20', title: 'CCNA-20: Layer 2 Security', description: 'Port security, DHCP snooping, dynamic ARP inspection', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'modules/ccna-20.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-21', title: 'CCNA-21: Wireless Security & WPA3', description: 'Wireless security, WPA2/WPA3, and authentication', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'modules/ccna-21.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-22', title: 'CCNA-22: Network Automation Concepts', description: 'Network automation fundamentals, controllers, programmability', icon: '/assets/images/icons/icon-gear.webp', status: 'available', components: ['module'], href: 'modules/ccna-22.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-23', title: 'CCNA-23: REST APIs & Data Formats', description: 'REST APIs, JSON, XML, YAML for network automation', icon: '/assets/images/icons/icon-gear.webp', status: 'available', components: ['module'], href: 'modules/ccna-23.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-24', title: 'CCNA-24: Cisco DNA Center & Meraki Dashboard', description: 'Cisco DNA Center and Meraki Dashboard for SDN', icon: '/assets/images/icons/icon-gear.webp', status: 'available', components: ['module'], href: 'modules/ccna-24.module.html', category: 'ccna' },
        { house: 'web', id: 'ccna-25', title: 'CCNA-25: Configuration Management & Automation Tools', description: 'Ansible, Puppet, Chef for network configuration management', icon: '/assets/images/icons/icon-gear.webp', status: 'available', components: ['module'], href: 'modules/ccna-25.module.html', category: 'ccna' },
        // CCNA 200-301 — companion lab entries (6, optional but recommended)
        { house: 'web', id: 'ccna-acl-lab', title: 'ACL Configuration Lab', description: 'Hands-on ACL configuration practice', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['lab'], href: 'labs/ccna-acl-lab.lab.html', category: 'ccna' },
        { house: 'web', id: 'ccna-ios-cli', title: 'IOS CLI Fundamentals Lab', description: 'Cisco IOS CLI hands-on practice', icon: '/assets/images/icons/icon-terminal.webp', status: 'available', components: ['lab'], href: 'labs/ccna-ios-cli.lab.html', category: 'ccna' },
        { house: 'web', id: 'ccna-nat-config', title: 'NAT Configuration Lab', description: 'NAT/PAT configuration practice', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['lab'], href: 'labs/ccna-nat-config.lab.html', category: 'ccna' },
        { house: 'web', id: 'ccna-ospf-config', title: 'OSPF Configuration Lab', description: 'OSPF configuration and verification practice', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['lab'], href: 'labs/ccna-ospf-config.lab.html', category: 'ccna' },
        { house: 'web', id: 'ccna-troubleshooting', title: 'Network Troubleshooting Lab', description: 'Network troubleshooting methodology and practice', icon: '/assets/images/icons/icon-wrench.webp', status: 'available', components: ['lab'], href: 'labs/ccna-troubleshooting.lab.html', category: 'ccna' },
        { house: 'web', id: 'ccna-vlan-config', title: 'VLAN Configuration Lab', description: 'VLAN and trunking configuration practice', icon: '/assets/images/icons/icon-network.webp', status: 'available', components: ['lab'], href: 'labs/ccna-vlan-config.lab.html', category: 'ccna' },
```

## Verification

All 31 paths verified to exist on disk by `_tools/audit-hub-deadrefs-v2.js` run on 2026-05-07. Titles extracted from each file's `<h1>` tag. Descriptions are concise summaries written to match catalog convention; operator may refine.

## What I won't do autonomously

Insert this directly into `ContentCatalog.js` without operator review. Catalog mutations affect:
- Search/discovery results
- LearningPaths curriculum mapping
- ContentRegistry progress tracking
- Hub renderers
- Future EduScan validators

A wrong description or wrong icon won't break anything but will look unprofessional once it propagates. Operator should glance + approve.

## How to apply (if approved)

```bash
# After operator approves:
# 1. Open _app/components/ContentCatalog.js
# 2. Find the 'web' house section (search: house: 'web')
# 3. Paste the 31 entries above
# 4. Save
# 5. node _tools/eduscan/cli.js --files _app/components/ContentCatalog.js,_app/houses/web/ccna/index.html
#    Verify HUB-001 cleared on web/ccna/index.html
# 6. git add _app/components/ContentCatalog.js && git commit
# 7. ./deploy.sh --only hosting
```

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Consolidated analysis: `_docs/operations/hub-001-all-hubs-analysis.md`
- HUB-001 finding: `_tools/reports/TREASURE_MAP.json` filter `code: HUB-001 file: houses/web/ccna/index.html`
