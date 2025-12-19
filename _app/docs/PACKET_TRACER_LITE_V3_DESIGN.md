# Packet Tracer Lite v3.9 - Documentation

**Prepared by:** EQ6
**Last Updated:** 2025-12-09
**Current Version:** v3.9
**Status:** Production Ready ✅

---

## 🎯 Overview

Packet Tracer Lite is a standalone browser-based network simulator that provides a Cisco Packet Tracer-like experience without any installation requirements. It's designed for educational networking fundamentals and integrates with the Network Essentials course materials.

**Key Features:**
- **Zero Installation** - Pure HTML/CSS/JavaScript, runs in any modern browser
- **CLI Interface** - Cisco IOS-style command line with 50+ supported commands
- **Lab Library** - 17+ pre-built labs (7 configuration + 10 troubleshooting scenarios)
- **Visual Learning** - Interactive topology canvas with drag-and-drop devices
- **Export/Import** - Save and load topologies with full configuration data

---

## 📋 Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| v3.0 | 2025-12-02 | Initial release with Lab Library |
| v3.5 | 2025-12-09 | Cumulative lab persistence fix |
| v3.6 | 2025-12-09 | Export/Import enhancement (full config data) |
| v3.7 | 2025-12-09 | Fixed "Back to Catalog" 404 error |
| v3.8 | 2025-12-09 | Added CLI Command Reference popup |
| **v3.9** | **2025-12-09** | **Fixed interface selection bug (Gi0/1, Fa0/2, etc.)** |

---

## 🖥️ User Interface

### Main Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 Packet Tracer Lite v3.9    [New] [Export] [Import] [Labs] [?]  │
├──────────┬────────────────────────────────────────────┬─────────────┤
│          │                                            │             │
│  Device  │                                            │  Device     │
│  Palette │         Canvas (Topology View)             │  Properties │
│  ────────│                                            │  ───────────│
│  🔷Router│      [Drag devices here]                   │  Name       │
│  🔶Switch│                                            │  Type       │
│  🔷L3-SW │      [Click device to select]             │  Interfaces │
│  💻 PC   │      [Drag to connect]                    │  ───────────│
│  🖥️Server│                                            │  CLI        │
│          │                                            │  Terminal   │
│          │                                            │  [📖]       │
├──────────┴────────────────────────────────────────────┴─────────────┤
│  Status: Ready  |  Mode: Design  |  Lab: None                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Device Types

| Device | Icon | Description | Interfaces |
|--------|------|-------------|------------|
| **Router** | 🔷 | Layer 3 routing device | Gi0/0, Gi0/1, Gi0/2, Se0/0/0 |
| **L2 Switch** | 🔶 | Layer 2 switching only | Fa0/1-5, Gi0/1-2 |
| **L3 Switch** | 🔷 | Layer 3 switch with routing | Fa0/1-5, Gi0/1-2, Vlan1 |
| **PC** | 💻 | End-user workstation | Ethernet0 |
| **Server** | 🖥️ | Server with DHCP capability | Ethernet0 |

---

## 💻 CLI Command Reference

### Mode Navigation

| Command | Mode | Description |
|---------|------|-------------|
| `enable` or `en` | User | Enter privileged EXEC mode |
| `configure terminal` or `conf t` | Privileged | Enter global configuration mode |
| `exit` | Any | Return to previous mode |
| `end` | Config | Return directly to privileged mode |
| `help` or `?` | Any | Display available commands |

### Interface Configuration

| Command | Mode | Description |
|---------|------|-------------|
| `interface <name>` | Config | Enter interface config mode |
| `int Gi0/0` | Config | Shortcut for GigabitEthernet0/0 |
| `int Fa0/1` | Config | Shortcut for FastEthernet0/1 |
| `int vlan 10` | Config | Enter VLAN interface (SVI) |
| `interface range Fa0/1-24` | Config | Configure multiple interfaces |
| `ip address <ip> <mask>` | Interface | Assign IP address |
| `no shutdown` | Interface | Enable interface |
| `shutdown` | Interface | Disable interface |

### Switching / VLANs

| Command | Mode | Description |
|---------|------|-------------|
| `vlan <id>` | Config | Create VLAN |
| `name <name>` | VLAN | Name the VLAN |
| `switchport mode access` | Interface | Set port to access mode |
| `switchport mode trunk` | Interface | Set port to trunk mode |
| `switchport access vlan <id>` | Interface | Assign port to VLAN |
| `switchport trunk native vlan <id>` | Interface | Set native VLAN |
| `no switchport` | Interface | Convert to routed port (L3) |

### Spanning Tree

| Command | Mode | Description |
|---------|------|-------------|
| `spanning-tree mode rapid-pvst` | Config | Enable Rapid PVST+ |
| `spanning-tree vlan <id> root primary` | Config | Make switch root bridge |
| `spanning-tree vlan <id> root secondary` | Config | Make backup root bridge |
| `spanning-tree portfast` | Interface | Enable PortFast |
| `spanning-tree bpduguard enable` | Interface | Enable BPDU Guard |

### Routing

| Command | Mode | Description |
|---------|------|-------------|
| `ip route <net> <mask> <next-hop>` | Config | Add static route |
| `router ospf <id>` | Config | Enable OSPF |
| `router eigrp <as>` | Config | Enable EIGRP |
| `network <ip> <wildcard> area <id>` | Router-OSPF | Advertise network |
| `network <ip> <wildcard>` | Router-EIGRP | Advertise network |
| `router-id <ip>` | Router | Set router ID |
| `passive-interface <name>` | Router | Suppress routing updates |
| `no auto-summary` | Router-EIGRP | Disable auto-summary |
| `redistribute <protocol>` | Router | Import routes |

### HSRP (First Hop Redundancy)

| Command | Mode | Description |
|---------|------|-------------|
| `standby <group> ip <vip>` | Interface | Configure HSRP VIP |
| `standby <group> priority <value>` | Interface | Set HSRP priority |
| `standby <group> preempt` | Interface | Enable preemption |

### Access Control Lists

| Command | Mode | Description |
|---------|------|-------------|
| `ip access-list extended <name>` | Config | Create named extended ACL |
| `permit <proto> <src> <dst>` | ACL | Allow traffic |
| `deny <proto> <src> <dst>` | ACL | Block traffic |
| `ip access-group <name> <in\|out>` | Interface | Apply ACL |

### DHCP

| Command | Mode | Description |
|---------|------|-------------|
| `ip dhcp pool <name>` | Config | Create DHCP pool |
| `ip dhcp excluded-address <start> <end>` | Config | Exclude addresses |
| `default-router <ip>` | DHCP | Set default gateway |
| `dns-server <ip>` | DHCP | Set DNS server |

### Device Management

| Command | Mode | Description |
|---------|------|-------------|
| `hostname <name>` | Config | Set device hostname |
| `ping <ip>` | Any | Test connectivity |
| `clear` | Any | Clear CLI output |

### Show Commands

| Command | Description |
|---------|-------------|
| `show ip interface brief` | Interface summary with IP/status |
| `show running-config` or `show run` | Current configuration |
| `show vlan brief` | VLAN list and status |
| `show interfaces trunk` | Trunk port information |
| `show ip route` | Routing table |
| `show spanning-tree` | STP status |
| `show ip ospf neighbor` | OSPF neighbor table |
| `show ip eigrp neighbors` | EIGRP neighbor table |
| `show standby` | HSRP status |
| `show access-lists` | Configured ACLs |

---

## 📖 CLI Command Reference Popup (v3.8+)

Click the **📖** button next to the CLI input to open a searchable command reference popup.

**Features:**
- 10 command categories with 50+ commands documented
- Real-time search filtering
- Each command shows: syntax, required mode, description, and examples
- Dark theme matching CLI aesthetic
- Press Escape or click outside to close

---

## 🔬 Lab Library

### Configuration Labs (7 Total)

| Lab | Difficulty | Duration | Topics |
|-----|------------|----------|--------|
| Lab 1: Basic Routing | Beginner | 20 min | IP addressing, static routes |
| Lab 2: VLAN Configuration | Beginner | 25 min | VLANs, access ports |
| Lab 3: OSPF Single-Area | Beginner | 35 min | OSPF basics |
| Lab 4: Inter-VLAN Routing | Intermediate | 30 min | SVIs, L3 switching |
| Lab 5: OSPF Multi-Area | Advanced | 40 min | Areas, ABRs |
| Lab 6: Access Control Lists | Advanced | 35 min | Standard/Extended ACLs |
| Lab 7: VLAN Trunking | Intermediate | 30 min | 802.1Q trunks |

### Troubleshooting Labs (10 Total)

| Scenario | Difficulty | Duration | Issue |
|----------|------------|----------|-------|
| Scenario 1 | Beginner | 10 min | Interface administratively down |
| Scenario 2 | Beginner | 15 min | Wrong VLAN assignment |
| Scenario 3 | Beginner | 15 min | Missing default gateway |
| Scenario 4 | Intermediate | 20 min | Trunk native VLAN mismatch |
| Scenario 5 | Intermediate | 25 min | ACL blocking traffic |
| Scenario 6 | Beginner | 15 min | Duplicate IP address |
| Scenario 7 | Advanced | 30 min | OSPF area mismatch |
| Scenario 8 | Advanced | 30 min | Routing loop |
| Scenario 9 | Intermediate | 25 min | DHCP pool exhausted |
| Scenario 10 | Advanced | 35 min | Wrong STP root bridge |

### Cumulative Lab Series (6 Progressive Labs)

These labs build on each other to create a complete enterprise network:

1. **Lab 1: Static Routes** - Foundation topology (12 devices)
2. **Lab 2: Add VLANs** - Segmentation and trunking
3. **Lab 3: Add STP** - Redundancy and loop prevention
4. **Lab 4: Replace with OSPF** - Dynamic routing
5. **Lab 5: Add EIGRP** - Multi-protocol with redistribution
6. **Lab 6: Advanced Features** - HSRP, DHCP, ACLs, SNMP (Capstone)

---

## 💾 Export & Import

### Export Topology (JSON)

Click **Export** → Select **Option 1** to save your topology.

**What gets saved:**
- All devices (position, name, type)
- Interface configurations (IP, mask, status, VLAN)
- Routing configurations (static routes, OSPF, EIGRP)
- VLAN configurations
- ACL configurations
- DHCP server settings
- All connections between devices

### Import Topology

Click **Import** → Select a `.json` file to load a saved topology.

**Use cases:**
- Backup your work before making changes
- Submit lab assignments
- Share topologies with classmates
- Transfer between devices

**Naming convention for submissions:**
```
topology_LASTNAME_Lab1_2025-12-09.json
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+U` | Unlock all cumulative labs |
| `Escape` | Close popups/modals |
| `?` | Show CLI help (when in CLI) |

---

## 🐛 Bug Fixes History

### v3.9 (Current)
- **Fixed:** Interface selection for `int Gi0/1`, `int Fa0/2`, etc.
  - Root cause: The `/` character wasn't being stripped during comparison
  - Now both input and interface names are normalized before matching

### v3.8
- **Added:** CLI Command Reference popup (📖 button)

### v3.7
- **Fixed:** "Back to Catalog" button 404 error (wrong relative path)

### v3.6
- **Enhanced:** Export now includes full configuration data (VLANs, routes, OSPF, EIGRP, ACLs, DHCP)

### v3.5
- **Fixed:** Cumulative lab configurations now persist between lab iterations

---

## 🎯 Educational Alignment

### Network+ N10-008 Objectives Covered

| Objective | Topic | Coverage |
|-----------|-------|----------|
| 1.1 | OSI Model | Packet visualization |
| 1.4 | IP Addressing | Interface configuration |
| 2.1 | Network Devices | Router, Switch, L3 Switch |
| 2.2 | Routing Technologies | Static, OSPF, EIGRP |
| 2.3 | Switching Features | VLANs, Trunking, STP |
| 3.2 | Network Services | DHCP configuration |
| 4.3 | Network Security | ACLs |
| 5.5 | Troubleshooting | 10 troubleshooting scenarios |

---

## 📊 Technical Specifications

| Specification | Value |
|---------------|-------|
| File Size | ~450 KB (single HTML file) |
| Browser Support | Chrome, Firefox, Edge, Safari (modern versions) |
| Dependencies | None (standalone) |
| Storage | LocalStorage for lab progress |
| Export Format | JSON |

---

## 🆘 Troubleshooting

### Common Issues

**Q: I can't type commands in the CLI**
- A: First select a device by clicking on it in the canvas
- A: Make sure the CLI panel is visible (expand the right sidebar)

**Q: Interface command not working (e.g., `int Gi0/1`)**
- A: Upgrade to v3.9 which fixes interface selection
- A: Try the full name: `interface GigabitEthernet0/1`

**Q: My configuration didn't save**
- A: Use the Export function to save your topology
- A: For cumulative labs, progress auto-saves to browser storage

**Q: The "Back to Catalog" button doesn't work**
- A: Upgrade to v3.7+ which fixes the relative path issue

---

## 📁 File Location

```
/Home/tools/packet-tracer-lite-v3.html
```

Access from the catalog via **Interactive Tools** → **Packet Tracer Lite**

---

**Document Version:** 3.9
**Last Updated:** 2025-12-09
**Maintained by:** CCode-Delta
