# ADD - Active Directory Deep Dive Course Plan

**Created:** January 25, 2026
**Status:** FUTURE (Build after WSA)
**Codename:** IRONCLAD

---

## Course Overview

| Field | Value |
|-------|-------|
| Course Code | ADD |
| Full Name | Active Directory Deep Dive |
| Narrative | IRONCLAD (Ransomware Attack & AD Recovery) |
| House | Cloud |
| Location | `_app/houses/cloud/modules/add/` |
| Modules | 8 |
| Prerequisite | WSA (Windows Server Administration) or equivalent AD basics |

---

## Why This Course Exists

Active Directory is:
- **30-35% of AZ-800** exam
- **Foundation of enterprise identity** (on-prem and hybrid)
- **Its own specialty** in many organizations
- **Critical for security** (most attacks target AD)
- **Required for Azure hybrid** scenarios

WSA covers AD fundamentals; ADD goes deep.

---

## Course Relationship

```
┌─────────────────────────────────────┐
│  ADD (Active Directory Deep Dive)   │
│  ├── AD architecture                │
│  ├── GPO mastery                    │
│  ├── Replication & sites            │
│  ├── Security & delegation          │
│  ├── Azure AD hybrid                │
│  └── IRONCLAD capstone              │
└──────────────┬──────────────────────┘
               │ Builds on
               ▼
┌─────────────────────────────────────┐
│  WSA (Windows Server Admin)         │
│  └── M02: AD Essentials             │
│      (users, groups, OUs, basic GPO)│
└─────────────────────────────────────┘
```

---

## 8-Module Breakdown

### PHASE 1: CRAWL (M01-M03)

#### M01: AD DS Architecture & Installation
- AD DS components (DC, GC, FSMO roles)
- Forest and domain structure
- AD installation and promotion
- DNS integration requirements
- **Lab:** Install AD DS, promote DC, verify DNS

#### M02: Users, Groups, and Organizational Units
- User account management at scale
- Group types and scopes (domain local, global, universal)
- OU design and delegation
- Bulk operations with PowerShell
- **Lab:** Design OU structure, create users/groups via PS

#### M03: Group Policy Objects (GPO)
- GPO architecture and processing order
- LSDOU (Local, Site, Domain, OU)
- Security settings and preferences
- GPO troubleshooting (gpresult, rsop)
- **Lab:** Create GPOs, link to OUs, verify application

---

### PHASE 2: WALK (M04-M06)

#### M04: AD Sites, Replication & Trusts
- AD sites and subnets
- Replication topology and scheduling
- Trust types (forest, external, shortcut)
- Troubleshooting replication (repadmin, dcdiag)
- **Lab:** Configure sites, force replication, create trust

#### M05: AD Security & Delegation
- AD permissions and delegation
- Protected users and admin tiering
- Privileged Access Workstations (PAW)
- AD attack vectors (Kerberoasting, Pass-the-Hash)
- **Lab:** Implement delegation, configure protected users

#### M06: Azure AD & Hybrid Identity
- Azure AD Connect
- Password hash sync vs Pass-through auth vs Federation
- Hybrid join scenarios
- Conditional Access basics
- **Lab:** Configure Azure AD Connect (simulated), hybrid join

---

### PHASE 3: RUN (M07-M08)

#### M07: AD Troubleshooting & Recovery
- DCDIAG deep dive
- Replication troubleshooting
- AD backup and restore
- Authoritative vs non-authoritative restore
- AD Recycle Bin
- **Lab:** Diagnose AD issues, perform restores

#### M08: IRONCLAD Capstone
- **Narrative:** Ransomware hit the domain. DCs encrypted. Recover the enterprise.
- Full AD disaster recovery mission
- Timed, pressure scenario
- All skills from M01-M07 required
- **Lab:** Multi-stage AD recovery under fire

---

## Narrative: IRONCLAD

### Story Setup
```
╔══════════════════════════════════════════════════════════════════════╗
║                    🔒 OPERATION IRONCLAD 🔒                          ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  INCIDENT REPORT - CLASSIFICATION: CRITICAL                         ║
║                                                                      ║
║  At 0347 hours, ransomware was detected across the enterprise.      ║
║  Primary and secondary domain controllers: ENCRYPTED.               ║
║  Azure AD Connect: OFFLINE.                                         ║
║  All users: LOCKED OUT.                                             ║
║                                                                      ║
║  Executive leadership is demanding restoration.                      ║
║  Legal is demanding forensics preservation.                          ║
║  The clock is ticking.                                               ║
║                                                                      ║
║  Your mission: Rebuild the kingdom from the ashes.                  ║
║                                                                      ║
║                           - IRONCLAD RECOVERY TEAM                   ║
╚══════════════════════════════════════════════════════════════════════╝
```

### IRONCLAD Mission Stages
```
Stage 1: ASSESS     - Survey damage, identify viable backups
Stage 2: ISOLATE    - Contain threat, preserve evidence
Stage 3: RESTORE    - Bring first DC online from backup
Stage 4: VERIFY     - DCDIAG, replication health
Stage 5: REBUILD    - Restore additional DCs, FSMO roles
Stage 6: RECONNECT  - Azure AD Connect, hybrid restore
Stage 7: VALIDATE   - User authentication, GPO application
Stage 8: HARDEN     - Implement lessons learned, security controls
```

### Characters
- **IRONCLAD OPS**: Recovery mission control
- **CISO**: Demanding security forensics preserved
- **CEO**: Demanding immediate restoration ("I don't care how, just fix it")
- **FIELD TECH**: On-site at datacenter, following your commands

### Radio Frequencies (Capstone)
| MHz | Channel | Content |
|-----|---------|---------|
| 156.0 | STATIC | Noise |
| 162.5 | IRONCLAD-OPS | Mission hints |
| 168.0 | EXECUTIVE | Pressure ("The board is calling...") |
| 174.5 | FIELD-TECH | Datacenter status |
| 180.0 | SECURITY | Forensics requirements |
| 88.1 | EMERGENCY | Direct solutions |

---

## Technical Components

### Shared with WSA
- PSTerminal (PowerShell terminal)
- GUI Style Toggle (Windows/Hexworth)
- Progress tracking (LocalStorage)

### ADD-Specific
- ADUsersSim (enhanced for ADD depth)
- GPOEditorSim (Group Policy editor)
- ADSitesReplicationSim (Sites & Services)
- AzureADConnectSim (hybrid config)

---

## PowerShell Commands (ADD-Specific)

```powershell
# AD Infrastructure
Get-ADForest, Get-ADDomain, Get-ADDomainController
Get-ADReplicationSite, Get-ADReplicationSubnet
Get-ADReplicationConnection, Get-ADReplicationFailure
Move-ADDirectoryServerOperationMasterRole  # FSMO transfer

# GPO
Get-GPO, New-GPO, Set-GPLink, Get-GPResultantSetOfPolicy
Backup-GPO, Restore-GPO, Import-GPO

# Replication & Health
repadmin /showrepl, repadmin /syncall, repadmin /replsummary
dcdiag /v, dcdiag /test:DNS, dcdiag /test:Replications

# Recovery
ntdsutil, vssadmin, wbadmin
Restore-ADObject, Enable-ADOptionalFeature  # AD Recycle Bin

# Azure AD
Get-ADSyncScheduler, Start-ADSyncSyncCycle
Get-AzureADUser, Get-AzureADDevice
```

---

## Certification Alignment

| Certification | ADD Coverage |
|---------------|--------------|
| AZ-800 | AD DS domain (30-35%) |
| AZ-801 | AD security, recovery |
| SC-300 | Identity Administrator (Azure AD) |
| Security+ | Identity & access management concepts |

---

## Prerequisites

- **Required:** WSA M02 (AD Essentials) or equivalent
- **Recommended:** WSA complete, basic PowerShell

---

## Content Sources

| Source | URL | Use |
|--------|-----|-----|
| Microsoft Learn - AD DS | https://learn.microsoft.com/en-us/windows-server/identity/ | Technical reference |
| AZ-800 AD Domain | https://aka.ms/AZ800-StudyGuide | Exam objectives |
| AD Security Best Practices | Microsoft security baselines | Security module |
| Azure AD Connect Docs | https://learn.microsoft.com/en-us/azure/active-directory/hybrid/ | Hybrid module |

---

## Development Priority

**Status:** FUTURE - Build after WSA is complete

**Estimated Build Order:**
1. WSA Course (current project)
2. ADD Course (next)
3. IRONCLAD Capstone (ADD M08)

---

## Future Expansion

After ADD, consider:
- **Azure AD / Entra ID course** (cloud-native identity)
- **Identity Security course** (attack/defense focus)
- **Hybrid Identity Architect path** (SC-300 alignment)

---

*Planning document created January 25, 2026*
*Status: FUTURE - Queued after WSA completion*
