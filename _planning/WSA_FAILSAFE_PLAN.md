# WSA - Windows Server Administration Course Plan

**Created:** January 25, 2026
**Status:** PLANNING
**Codename:** FAILSAFE

---

## Course Overview

| Field | Value |
|-------|-------|
| Course Code | WSA |
| Full Name | Windows Server Administration |
| Narrative | FAILSAFE (Datacenter Disaster Recovery) |
| House | Cloud |
| Location | `_app/houses/cloud/modules/wsa/` |
| Modules | 8 |
| Cert Alignment | Microsoft AZ-800 (Windows Server Hybrid Administrator) |
| Source Material | CTS1328C syllabus, Microsoft Learn docs |

---

## Learning Philosophy

### AD-Throughout Approach

Real Windows Server environments operate within Active Directory. Rather than treating AD as an isolated topic, WSA embeds AD fundamentals throughout:

| Module | AD Integration |
|--------|----------------|
| M01: Fundamentals | Domain join, AD context |
| M02: AD & Identity | Dedicated AD module (users, groups, OUs, basic GPO) |
| M03: Storage | AD groups for share/NTFS permissions |
| M04: Hyper-V | Domain-joined hosts and VMs |
| M05: Containers | Less AD-dependent (standalone) |
| M06: Clustering | AD-integrated failover cluster |
| M07: Monitoring | AD authentication, event logs |
| M08: FAILSAFE | AD + infrastructure disaster recovery |

**For AD Deep Dive:** See future course ADD (Active Directory Deep Dive) with IRONCLAD capstone.

---

### Crawl → Walk → Run

| Phase | Modules | Focus | Guidance Level |
|-------|---------|-------|----------------|
| **CRAWL** | M01-M03 | Foundations | Full guidance, GUI-heavy |
| **WALK** | M04-M06 | Core Skills | Mixed GUI/PS, moderate guidance |
| **RUN** | M07-M08 | Mastery | PS-focused, minimal hints, capstone |

---

## Module Structure

Each module contains:
```
wsa-module0X/
├── wsa-m0X-presentation.html   (Slide deck)
├── wsa-m0X-gui-lab.html        (Simulated Windows GUI)
├── wsa-m0X-ps-lab.html         (PowerShell terminal lab)
└── wsa-m0X-quiz.html           (Assessment)
```

### Learning Flow Per Module
1. **Presentation** - Theory, concepts, screenshots
2. **GUI Lab** - Point-and-click simulated Windows interface
3. **PS Lab** - PowerShell terminal commands
4. **Quiz** - Validate understanding

---

## 8-Module Breakdown

### PHASE 1: CRAWL (M01-M03)

#### M01: Windows Server Fundamentals
**Objective:** Install, configure, and navigate Windows Server environment

| Component | Content |
|-----------|---------|
| Presentation | Server editions, installation options, Server Manager overview, initial config |
| GUI Lab | Server Manager tour - navigate dashboard, view roles, basic settings |
| PS Lab | `Get-Command`, `Get-Help`, `Get-Service`, `Get-ComputerInfo` |
| Quiz | 10 questions on fundamentals |

**Key Concepts:**
- Windows Server 2019/2022 editions
- Desktop Experience vs Server Core
- Server Manager dashboard
- PowerShell basics (getting help)

---

#### M02: Active Directory & Identity
**Objective:** Implement identity services with AD DS

| Component | Content |
|-----------|---------|
| Presentation | AD DS concepts, domains, forests, OUs, users, groups, Group Policy intro |
| GUI Lab | AD Users & Computers - create OUs, users, groups, reset passwords |
| PS Lab | `Get-ADUser`, `New-ADUser`, `Get-ADGroup`, `Add-ADGroupMember` |
| Quiz | 10 questions on AD fundamentals |

**Key Concepts:**
- Domain vs Workgroup
- Organizational Units (OUs)
- User and group management
- Basic Group Policy

---

#### M03: Storage & File Services
**Objective:** Configure storage and implement file services

| Component | Content |
|-----------|---------|
| Presentation | Disk types, volumes, Storage Spaces, DFS, SMB shares, NTFS permissions |
| GUI Lab | Disk Management + Storage Spaces wizard, create shares |
| PS Lab | `Get-Disk`, `Initialize-Disk`, `New-Volume`, `New-SmbShare` |
| Quiz | 10 questions on storage |

**Key Concepts:**
- Basic vs Dynamic disks
- Storage Spaces / Storage Spaces Direct
- SMB file shares
- NTFS vs Share permissions

---

### PHASE 2: WALK (M04-M06)

#### M04: Hyper-V Virtualization
**Objective:** Implement virtualization with Hyper-V

| Component | Content |
|-----------|---------|
| Presentation | Hypervisor types, VM generations, virtual switches, checkpoints, replication |
| GUI Lab | Hyper-V Manager - create VM, configure settings, checkpoints |
| PS Lab | `New-VM`, `Get-VM`, `Start-VM`, `Checkpoint-VM`, `Get-VMSwitch` |
| Quiz | 10 questions on Hyper-V |

**Key Concepts:**
- Type 1 vs Type 2 hypervisors
- Generation 1 vs Generation 2 VMs
- Virtual switch types (External, Internal, Private)
- Checkpoints and snapshots

---

#### M05: Containers & Nano Server
**Objective:** Deploy containers and lightweight server images

| Component | Content |
|-----------|---------|
| Presentation | Container concepts, Docker, Windows containers vs Hyper-V containers, Nano Server |
| GUI Lab | Minimal (Windows Admin Center container view) |
| PS Lab | `docker pull`, `docker run`, `docker ps`, container management |
| Quiz | 10 questions on containers |

**Key Concepts:**
- Containers vs VMs
- Docker fundamentals
- Windows Server Core vs Nano Server
- Container orchestration intro

---

#### M06: Failover Clustering
**Objective:** Implement high availability with failover clustering

| Component | Content |
|-----------|---------|
| Presentation | Cluster concepts, quorum, witness, failover, Cluster-Aware Updating |
| GUI Lab | Failover Cluster Manager - create cluster, configure quorum, test failover |
| PS Lab | `New-Cluster`, `Get-Cluster`, `Get-ClusterNode`, `Move-ClusterGroup` |
| Quiz | 10 questions on clustering |

**Key Concepts:**
- Failover clustering requirements
- Quorum and witness types
- Cluster Shared Volumes (CSV)
- Cluster-Aware Updating (CAU)

---

### PHASE 3: RUN (M07-M08)

#### M07: Monitoring & Management
**Objective:** Implement monitoring strategies and management tools

| Component | Content |
|-----------|---------|
| Presentation | Event Viewer, Performance Monitor, WSUS, Windows Admin Center, Azure Arc |
| GUI Lab | Event Viewer analysis, Performance Monitor counters (reference/minimal) |
| PS Lab | `Get-EventLog`, `Get-Counter`, `Get-WindowsUpdateLog`, automation scripts |
| Quiz | 10 questions on monitoring |

**Key Concepts:**
- Event log analysis
- Performance baselines
- Windows Server Update Services
- Remote management tools

---

#### M08: FAILSAFE CAPSTONE
**Objective:** Recover datacenter from disaster using all learned skills

| Component | Content |
|-----------|---------|
| Narrative | Full FAILSAFE mission - datacenter down, services offline, must recover |
| GUI Lab | Initial assessment (Server Manager unresponsive - force PS fallback) |
| PS Lab | Primary recovery interface - timed, narrative-driven |
| Mission | Multi-stage recovery across all skill areas |

**FAILSAFE Mission Structure:**
```
Stage 1: ASSESS    - Identify what's down (Get-Service, Test-Connection)
Stage 2: STORAGE   - Recover storage (disk online, shares restored)
Stage 3: IDENTITY  - Restore AD services (DCDIAG, AD replication)
Stage 4: COMPUTE   - Bring VMs back online (Hyper-V recovery)
Stage 5: CLUSTER   - Restore cluster quorum (failover recovery)
Stage 6: VERIFY    - Confirm all services operational
```

**Timer:** Progressive pressure (more time early, tightens toward end)
**Radio:** FAILSAFE emergency channel for hints
**Insight:** Final disaster recovery analysis question

---

## Narrative: FAILSAFE

### Story Setup
```
SITUATION REPORT - PRIORITY ALPHA
══════════════════════════════════════════════════════════

INCIDENT: Power surge at primary datacenter
IMPACT:   Multiple server failures, services offline
STATUS:   Executive leadership demanding recovery

Your task: Remote into surviving management server
          Assess damage, recover services, restore operations

The clock is ticking. The business is bleeding.
Time to prove what you've learned.

                              - FAILSAFE OPERATIONS CENTER
```

### Characters
- **FAILSAFE OPS**: Mission control providing objectives
- **MANAGEMENT**: Impatient executives demanding ETAs
- **FIELD TECH**: On-site technician you're guiding remotely

### Radio Frequencies (Capstone)
| MHz | Channel | Content |
|-----|---------|---------|
| 156.0 | STATIC | Noise |
| 162.5 | FAILSAFE-OPS | Mission hints |
| 168.0 | MANAGEMENT | Narrative pressure ("How much longer?") |
| 174.5 | FIELD-TECH | On-site status updates |
| 88.1 | EMERGENCY | Direct solutions (burns channel) |

---

## Technical Components Required

### 1. PSTerminal Component
PowerShell-style terminal for Windows Server labs.

```javascript
// Key differences from CLHTerminal (bash):
- Prompt: "PS C:\Path>" instead of "user@host:~$"
- Commands: Get-*, Set-*, New-*, Remove-* cmdlets
- Paths: Backslash (C:\Windows\) not forward slash
- Piping: Same concept, different commands (Where-Object, Select-Object)
- Filesystem: Windows-style hierarchy
```

**Commands to Implement:**
```
# Core
Get-Help, Get-Command, Get-Member

# System
Get-ComputerInfo, Get-Service, Start-Service, Stop-Service, Restart-Service
Get-Process, Stop-Process, Get-EventLog, Get-Counter

# AD
Get-ADUser, New-ADUser, Set-ADUser, Remove-ADUser
Get-ADGroup, New-ADGroup, Add-ADGroupMember
Get-ADComputer, Get-ADOrganizationalUnit

# Storage
Get-Disk, Initialize-Disk, Get-Partition, New-Partition
Get-Volume, New-Volume, Format-Volume
Get-SmbShare, New-SmbShare, Get-SmbSession

# Hyper-V
Get-VM, New-VM, Start-VM, Stop-VM, Remove-VM
Get-VMSwitch, New-VMSwitch
Checkpoint-VM, Restore-VMCheckpoint

# Clustering
Get-Cluster, New-Cluster, Get-ClusterNode
Get-ClusterGroup, Move-ClusterGroup, Start-ClusterGroup
Get-ClusterQuorum, Set-ClusterQuorum

# Containers
docker pull, docker run, docker ps, docker stop, docker rm

# Network
Test-Connection, Test-NetConnection, Get-NetAdapter, Get-NetIPAddress
```

### 2. GUI Lab Components
Simulated Windows Server interfaces.

| Component | Simulates | Used In |
|-----------|-----------|---------|
| ServerManagerSim | Server Manager dashboard | M01, M07 |
| ADUsersSim | AD Users & Computers MMC | M02 |
| DiskMgmtSim | Disk Management + Storage Spaces | M03 |
| HyperVSim | Hyper-V Manager | M04 |
| FailoverClusterSim | Failover Cluster Manager | M06 |
| EventViewerSim | Event Viewer | M07 |

**GUI Lab Features:**
- Click-through wizards
- Simulated right-click context menus
- Property dialogs
- Status indicators
- Success/failure feedback

### 3. GUI Style Toggle System
Users can switch between two visual themes for GUI labs.

**Styles Available:**
| Style | Description |
|-------|-------------|
| **Windows** | Pixel-perfect Windows Server look (light theme, classic UI) |
| **Hexworth** | Stylized dark theme matching Hexworth platform aesthetic |

**Implementation:**
```javascript
// GuiStyleManager.js
const GuiStyleManager = {
    STYLES: {
        WINDOWS: 'windows',
        HEXWORTH: 'hexworth'
    },

    // Get current preference (default: hexworth)
    getStyle() {
        return localStorage.getItem('wsa-gui-style') || this.STYLES.HEXWORTH;
    },

    // Set and apply style
    setStyle(style) {
        localStorage.setItem('wsa-gui-style', style);
        document.documentElement.setAttribute('data-gui-style', style);
        this.onStyleChange(style);
    },

    // Toggle between styles
    toggle() {
        const current = this.getStyle();
        const newStyle = current === this.STYLES.WINDOWS
            ? this.STYLES.HEXWORTH
            : this.STYLES.WINDOWS;
        this.setStyle(newStyle);
        return newStyle;
    },

    // Callback for components to update
    onStyleChange(style) {
        document.dispatchEvent(new CustomEvent('gui-style-change', { detail: style }));
    }
};
```

**CSS Architecture:**
```css
/* Base component structure */
.gui-frame { /* shared layout */ }

/* Windows theme */
[data-gui-style="windows"] .gui-frame {
    background: #f0f0f0;
    border: 1px solid #888;
    color: #333;
}

[data-gui-style="windows"] .gui-titlebar {
    background: linear-gradient(to bottom, #4a90d9, #2672c0);
}

/* Hexworth theme */
[data-gui-style="hexworth"] .gui-frame {
    background: linear-gradient(135deg, #0f0f1a, #1a1025);
    border: 1px solid rgba(96, 165, 250, 0.3);
    color: #e0e0e0;
}

[data-gui-style="hexworth"] .gui-titlebar {
    background: rgba(96, 165, 250, 0.1);
}
```

**Toggle UI Component:**
```html
<div class="gui-style-toggle">
    <span class="label">GUI Style:</span>
    <button class="toggle-btn" onclick="GuiStyleManager.toggle()">
        <span class="option windows">🪟 Windows</span>
        <span class="switch"></span>
        <span class="option hexworth">🔮 Hexworth</span>
    </button>
</div>
```

**Toggle Placement:**
- Top-right of each GUI lab page
- Also available in WSA course settings
- Preference persists across all modules via LocalStorage

**Benefits:**
- User choice based on preference
- Accessibility (light vs dark themes)
- "Train on both" for real-world preparation
- Single codebase with CSS-driven theming

### 3. WSAConfig.js
Module configurations (like CLHConfig for GPM).

```javascript
const WSAConfig = {
    modules: {
        'WSA-M01': {
            title: 'Windows Server Fundamentals',
            phase: 'crawl',
            psFilesystem: { ... },
            psObjectives: [ ... ],
            guiObjectives: [ ... ],
            quiz: { ... }
        },
        // ... M02-M08
    }
};
```

---

## Difficulty Progression

### Guidance Features by Phase

| Feature | CRAWL (M01-03) | WALK (M04-06) | RUN (M07-08) |
|---------|----------------|---------------|--------------|
| Step hints | Always visible | On request (💡) | Hidden |
| Error messages | Friendly + fix | Technical + hint | Technical only |
| GUI prominence | Primary | 50/50 with PS | Reference only |
| PS complexity | Basic cmdlets | Pipelines, params | Scripts, automation |
| Timer | None | Optional | Active (M08) |
| Auto-complete | Full | Partial | None |

### Hint System

**CRAWL:** Proactive hints
```
💡 Hint: To list all services, use Get-Service
         Try: Get-Service | Where-Object {$_.Status -eq 'Running'}
```

**WALK:** On-request hints
```
Type 'hint' for guidance, or check the docs with Get-Help
```

**RUN:** Emergency only
```
Radio frequency 162.5 if you're truly stuck.
Real admins figure it out.
```

---

## File Structure

```
_app/houses/cloud/modules/wsa/
├── index.html                      # Course overview & navigation
├── components/
│   ├── PSTerminal.js               # PowerShell terminal engine
│   ├── WSAConfig.js                # Module configurations
│   ├── ServerManagerSim.js         # Server Manager GUI
│   ├── ADUsersSim.js               # AD Users & Computers GUI
│   ├── DiskMgmtSim.js              # Disk Management GUI
│   ├── HyperVSim.js                # Hyper-V Manager GUI
│   ├── FailoverClusterSim.js       # Failover Cluster GUI
│   └── EventViewerSim.js           # Event Viewer GUI
├── m01-fundamentals/
│   ├── presentation.html
│   ├── gui-lab.html
│   ├── ps-lab.html
│   └── quiz.html
├── m02-active-directory/
│   └── ... (same structure)
├── m03-storage/
├── m04-hyperv/
├── m05-containers/
├── m06-clustering/
├── m07-monitoring/
└── m08-failsafe/
    ├── mission-briefing.html
    ├── failsafe-terminal.html      # Combined GUI + PS capstone
    └── debriefing.html
```

---

## Content Sources

| Source | URL / Location | Use |
|--------|----------------|-----|
| **AZ-800 Exam Page (PRIMARY)** | https://learn.microsoft.com/en-us/credentials/certifications/exams/az-800/ | Official exam objectives, domain weights - THE TRUTH |
| Microsoft Learn - Windows Server | https://learn.microsoft.com/en-us/windows-server/ | Technical accuracy, cmdlet reference, official docs |
| AZ-800 Study Guide | https://aka.ms/AZ800-StudyGuide | Detailed skills breakdown |
| CTS1328C Syllabus | `Test imports/CTS1328C-Certification-Alignment.md` | Academic structure reference |
| Hands-On Windows Server 2019 (Eckert) | Textbook reference | Lab scenario inspiration |

---

## AZ-800 Official Exam Blueprint

**Exam:** AZ-800 - Administering Windows Server Hybrid Core Infrastructure
**Passing Score:** 700
**Certification:** Microsoft Certified: Windows Server Hybrid Administrator Associate
**Related Exam:** AZ-801 (Advanced Services - security, HA, DR, migration)

### Domain Weights (Official)

| Domain | Weight | Our Coverage |
|--------|--------|--------------|
| **Deploy and manage AD DS** (on-prem + cloud) | **30-35%** | M02 (heavy focus needed) |
| Manage Windows Servers and workloads (hybrid) | 10-15% | M01, M07 |
| Manage virtual machines and containers | 15-20% | M04, M05 |
| Implement on-prem and hybrid networking | 15-20% | M01, M06 |
| Manage storage and file services | 15-20% | M03 |

### Key Tools Candidates Must Know
- Windows Admin Center
- PowerShell
- Azure Arc
- Azure Policy
- Azure Monitor
- Azure Update Manager
- Microsoft Defender for Identity
- Microsoft Defender for Cloud
- IaaS VM administration

### Official Study Resources
- AZ-800 Study Guide: https://aka.ms/AZ800-StudyGuide
- Exam Readiness Videos: https://learn.microsoft.com/en-us/shows/exam-readiness-zone/
- Free Practice Assessment available on exam page
- Instructor-led course: AZ-800T00 (4 days)

---

## Module-to-Exam Alignment

| Module | Primary Domain | Weight |
|--------|---------------|--------|
| M01: Windows Server Fundamentals | Manage servers/workloads | 10-15% |
| M02: Active Directory & Identity | **AD DS deployment** | **30-35%** |
| M03: Storage & File Services | Storage and file services | 15-20% |
| M04: Hyper-V Virtualization | VMs and containers | 15-20% |
| M05: Containers & Nano Server | VMs and containers | (combined) |
| M06: Failover Clustering | Networking + HA | 15-20% |
| M07: Monitoring & Management | Manage servers/workloads | 10-15% |
| M08: FAILSAFE Capstone | All domains | Synthesis |

**Note:** AD DS is 30-35% of exam. WSA covers AD fundamentals with AD-based labs throughout.
Full AD mastery available in separate course: **ADD (Active Directory Deep Dive)** - see `ADD_IRONCLAD_PLAN.md`

---

### Microsoft Learn Sections to Reference
- Identity & Access: AD DS, AD FS, AD CS, LAPS
- Files & Storage: SMB, Storage Spaces Direct, DFS
- Security: Secured-core, TLS/SSL, Credentials
- Management: Windows Admin Center, Azure Arc, WSUS
- Networking: DNS, DHCP, NPS, SDN
- Remote Desktop: RDS, Remote Desktop clients
- Virtualization: Hyper-V, Containers
- Clustering: Failover Clustering, Quorum, CAU

---

## Development Phases

### Phase 1: Foundation
- [ ] Create PSTerminal component (PowerShell mode)
- [ ] Create WSAConfig.js structure
- [ ] Build M01 as template (all 4 components)
- [ ] Test crawl-phase guidance system

### Phase 2: GUI Labs
- [ ] ServerManagerSim component
- [ ] ADUsersSim component
- [ ] DiskMgmtSim component
- [ ] HyperVSim component

### Phase 3: Content Build
- [ ] M01-M03 (CRAWL phase)
- [ ] M04-M06 (WALK phase)
- [ ] M07 (RUN phase)

### Phase 4: Capstone
- [ ] M08 FAILSAFE mission design
- [ ] Multi-stage recovery narrative
- [ ] Radio system integration
- [ ] Final testing & balance

### Phase 5: Polish
- [ ] Quiz question banks
- [ ] Cross-module navigation
- [ ] Progress tracking
- [ ] Cloud house integration

---

## Future: IRONCLAD (Advanced Course)

Reserved for future advanced Windows Server course:
- **Theme:** Ransomware attack & enterprise recovery
- **Prereq:** WSA completion
- **Focus:** Security hardening, incident response, Azure hybrid
- **Modules:** TBD

---

## Resolved Questions

| Question | Decision |
|----------|----------|
| GUI fidelity | **Toggle** - User chooses Windows or Hexworth style |
| PowerShell version | **PS 7** (modern cross-platform) |
| Quiz style | **Both** - Multiple choice AND scenario-based |
| Progress persistence | **Yes** - LocalStorage tracking |

## Open Questions

1. **Docker in browser** - Simulated or actual container concepts only?

---

*Planning document created January 25, 2026*
