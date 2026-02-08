# Factionless Skill Tree Design

## Overview

The Factionless/Divergent experience replaces house-based content navigation with a **file tree interface** organized by skill domains rather than house affiliation.

**Inspiration**: Final Fantasy 7 Remake weapon upgrade trees
- Nodes unlock more nodes as you progress
- Visual branching structure
- Multiple perspectives on the same content

---

## Three Perspectives

Factionless users can view all content through three lenses:

### 1. Fundamentals (Concepts, Theory, "Know")
```
~/fundamentals/
├── networking/
│   ├── osi_model.md          ← web-osi-model
│   ├── tcp_ip.md             ← web-tcpip
│   ├── ip_addressing.md      ← web-ip-addressing
│   └── wireless.md           ← web-wireless
├── security/
│   ├── cia_triad.md          ← shield-cia-triad
│   ├── security_principles.md ← shield-security-fundamentals
│   ├── threats_attacks.md    ← shield-threat-types
│   └── cryptography.md       ← shield-cryptography
├── systems/
│   ├── hardware_basics.md    ← forge-hardware-fundamentals
│   ├── storage_raid.md       ← forge-storage-raid
│   ├── windows_editions.md   ← forge-windows-editions
│   └── linux_macos.md        ← forge-macos-linux-basics
├── cloud/
│   ├── cloud_concepts.md     ← cloud-concepts
│   ├── service_models.md     ← cloud-models
│   ├── aws_fundamentals.md   ← cloud-aws-account
│   └── azure_fundamentals.md ← cloud-azure-fundamentals
└── programming/
    ├── python_basics.md      ← script-python-basics
    ├── flow_control.md       ← script-python-flow-control
    └── oop_concepts.md       ← script-python-oop
```

### 2. Tools (Software, Utilities, "Use")
```
~/tools/
├── network_analysis/
│   ├── packet_tracer.md      ← web-network-simulator
│   ├── troubleshooting.md    ← web-troubleshooting
│   └── ?                     ← (locked: wireshark - future)
├── system_admin/
│   ├── windows_settings.md   ← forge-windows-settings
│   ├── control_panel.md      ← forge-control-panel
│   ├── admin_tools.md        ← forge-admin-tools
│   ├── system_tools.md       ← forge-system-tools
│   └── registry.md           ← script-windows-registry
├── command_line/
│   ├── linux_cli.md          ← script-linux-basics
│   ├── powershell.md         ← script-powershell-basics
│   ├── bash_scripting.md     ← script-bash-scripting
│   └── command_translator.md ← script-command-translator
├── development/
│   ├── git.md                ← code-git-basics
│   └── ?                     ← (locked: vs code - future)
├── cloud_platforms/
│   ├── aws_console.md        ← cloud-aws-tools
│   ├── aws_services.md       ← cloud-aws-services
│   └── architecture_designer.md ← cloud-architecture
└── security_tools/
    ├── cipher_tools.md       ← key-encryption-basics
    └── log_parser.md         ← eye-log-analysis
```

### 3. Skills (Applied Abilities, "Do")
```
~/skills/
├── network_engineering/
│   ├── subnetting.md         ← web-ip-addressing, web-vlsm
│   ├── switching_vlans.md    ← web-switching, web-stp
│   ├── routing.md            ← web-routing, web-fhrp
│   └── network_design.md     ← web-cumulative-labs
├── system_administration/
│   ├── windows_admin.md      ← forge-* series
│   ├── linux_admin.md        ← script-linux-* series
│   ├── process_management.md ← script-process-management
│   └── log_management.md     ← script-log-management
├── security_operations/
│   ├── access_control.md     ← shield-access-control
│   ├── network_security.md   ← shield-network-security
│   ├── risk_management.md    ← shield-risk-management
│   └── log_analysis.md       ← eye-log-analysis
├── cloud_engineering/
│   ├── compute.md            ← cloud-aws-compute, cloud-aws-ec2
│   ├── storage.md            ← cloud-aws-storage
│   ├── networking.md         ← cloud-aws-networking
│   └── automation.md         ← cloud-aws-automation
├── development/
│   ├── python_scripting.md   ← script-python-* series
│   ├── automation.md         ← script-automation-concepts
│   └── version_control.md    ← code-git-basics
└── offensive_security/
    └── ?                     ← (locked: requires Dark Arts)
```

---

## Content Mapping

| Content ID | Fundamentals | Tools | Skills |
|-----------|--------------|-------|--------|
| web-osi-model | networking/osi_model | - | - |
| web-tcpip | networking/tcp_ip | - | - |
| web-ip-addressing | networking/ip_addressing | - | network_engineering/subnetting |
| web-switching | - | - | network_engineering/switching_vlans |
| shield-cia-triad | security/cia_triad | - | security_operations/ |
| forge-hardware-fundamentals | systems/hardware_basics | - | - |
| forge-windows-settings | - | system_admin/windows_settings | - |
| script-linux-basics | - | command_line/linux_cli | system_administration/linux_admin |
| cloud-concepts | cloud/cloud_concepts | - | - |
| cloud-aws-tools | - | cloud_platforms/aws_console | - |
| code-git-basics | - | development/git | development/version_control |

---

## UI Design

### File Tree Component

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ FACTIONLESS EXPLORER                                        │
├─────────────────────────────────────────────────────────────────┤
│  [📚 Fundamentals]  [🔧 Tools]  [⚔️ Skills]                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ~/fundamentals/                                                │
│  ├── 📁 networking/                      ▼ [4 items]            │
│  │   ├── 📄 osi_model.md                 ✓ Complete             │
│  │   ├── 📄 tcp_ip.md                    ○ Available            │
│  │   ├── 📄 ip_addressing.md             ○ Available            │
│  │   └── 📄 wireless.md                  ○ Available            │
│  ├── 📁 security/                        ▶ [4 items]            │
│  ├── 📁 systems/                         ▶ [4 items]            │
│  ├── 📁 cloud/                           ▶ [4 items]            │
│  └── 📁 programming/                     ▶ [3 items]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visual States

- `📁` - Folder (collapsed)
- `📂` - Folder (expanded)
- `📄` - File (available)
- `❓` - File (locked/undiscovered)
- `✓` - Completed
- `○` - Not started
- `◐` - In progress

### Styling

Terminal aesthetic:
- Monospace font (Courier New, Consolas)
- Dark background (#0a0a0a)
- Green/cyan text for available items
- Dim text for locked items
- Tree lines using box-drawing characters (├, └, │)

---

## Data Structure

```javascript
const SkillTree = {
    fundamentals: {
        id: 'fundamentals',
        name: 'Fundamentals',
        icon: '📚',
        description: 'Concepts, Theory, Know',
        folders: {
            networking: {
                name: 'networking',
                expanded: false,
                items: [
                    { file: 'osi_model.md', contentId: 'web-osi-model', locked: false },
                    { file: 'tcp_ip.md', contentId: 'web-tcpip', locked: false },
                    // ...
                ]
            },
            // ...
        }
    },
    tools: { /* ... */ },
    skills: { /* ... */ }
};
```

---

## Implementation Plan

1. **Create SkillTree data structure** in `config/skill-tree.js`
2. **Build FileTreeExplorer component** in `components/FileTreeExplorer.js`
3. **Integrate into dashboard** - show for Divergent users instead of house cards
4. **Add progress tracking** - tie to existing ContentRegistry progress
5. **Add unlock logic** - `?` items based on prerequisites

---

## Cross-Reference: FF7 Elements

| FF7 Element | Skill Tree Translation |
|------------|----------------------|
| Colored materia orbs | Three tab colors (Fundamentals=📚, Tools=🔧, Skills=⚔️) |
| Branching nodes | Folders expand to reveal files |
| Leveling through use | Completion progress |
| Linked materia | Content appearing in multiple trees |
| Weapon skill tree | The overall tree structure |

---

*Created: December 20, 2025*
