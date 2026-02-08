# Humble Bundle Content → Hexworth Module Mapping

**Date Created:** February 3, 2026
**Status:** Planning - Ready for prioritization
**Source:** USB D:\training\Humble (extracted to _planning/usb-import/humble-extract/)

---

## Mapping Legend

| Symbol | Meaning |
|--------|---------|
| 📚 | Full course potential (8+ modules) |
| 🧪 | Lab/hands-on content |
| 📝 | Quiz/assessment material |
| 🎯 | Applet (interactive tool) |
| 📊 | Reference/cheatsheet |
| ⭐ | High priority |
| 🔥 | Already has code/labs ready |

---

## Course Index

**Full details for each course are in `_planning/courses/COURSE_*.md`**

### Dark Arts Vault

| Course | Source | Modules | Planning Doc | Status |
|--------|--------|---------|--------------|--------|
| Web App Hacking | Web App Hacker's Handbook | 12 | `COURSE_WEB_APP_HACKING.md` | ⬜ |
| Malware Analysis | Malware Analyst's Cookbook | 8 | `COURSE_MALWARE_ANALYSIS.md` | ⬜ |
| Memory Forensics | Art of Memory Forensics | 7 | `COURSE_MEMORY_FORENSICS.md` | ⬜ |
| Reverse Engineering | Practical Reverse Engineering | 5 | `COURSE_REVERSE_ENGINEERING.md` | ⬜ |
| Exploit Development | Shellcoder's Handbook | 5 | `COURSE_EXPLOIT_DEV.md` | ⬜ |
| Advanced Pentesting | Advanced Penetration Testing | 5 | `COURSE_ADVANCED_PENTEST.md` | ⬜ |
| Physical Security | Unauthorised Access | 4 | `COURSE_PHYSICAL_SECURITY.md` | ⬜ |

### Shield House

| Course | Source | Modules | Planning Doc | Status |
|--------|--------|---------|--------------|--------|
| Threat Modeling | Threat Modeling (Wiley) | 5 | `COURSE_THREAT_MODELING.md` | ⬜ |
| Blue Team Ops | Blue Team Toolkit | 5 | `COURSE_BLUE_TEAM.md` | ⬜ |
| Incident Response | Applied Incident Response | 6 | `COURSE_INCIDENT_RESPONSE.md` | ⬜ |
| Wireshark | Wireshark for Security Pros | 5 | `COURSE_WIRESHARK.md` | ⬜ |

### Key House

| Course | Source | Modules | Planning Doc | Status |
|--------|--------|---------|--------------|--------|
| Applied Cryptography | Applied Cryptography (Schneier) | 5 | `COURSE_APPLIED_CRYPTO.md` | ⬜ |
| Crypto Engineering | Cryptography Engineering | 5 | `COURSE_CRYPTO_ENGINEERING.md` | ⬜ |

### Cloud House

| Course | Source | Modules | Planning Doc | Status |
|--------|--------|---------|--------------|--------|
| AWS Architecture | AWS for SA + Projects | 7 | `COURSE_AWS_ARCHITECTURE.md` | ⬜ |
| Azure Architecture | Azure Mapbook + AZ-304 | 6 | `COURSE_AZURE_ARCHITECTURE.md` | ⬜ |
| GCP Architecture | GCP Architect Guide | 5 | `COURSE_GCP_ARCHITECTURE.md` | ⬜ |
| Kubernetes + AI | K8s for GenAI | 5 | `COURSE_K8S_GENAI.md` | ⬜ |

### Code House

| Course | Source | Modules | Planning Doc | Status |
|--------|--------|---------|--------------|--------|
| GenAI Development | GenAI for Developers | 5 | `COURSE_GENAI_DEV.md` | ⬜ |

---

## Quick Stats

| House | Courses | Total Modules | Code Ready |
|-------|---------|---------------|------------|
| Dark Arts | 7 | ~46 | ⬜ |
| Shield | 4 | ~21 | ⬜ |
| Key | 2 | ~10 | ⬜ |
| Cloud | 4 | ~23 | ✅ 220 files |
| Code | 1 | ~5 | ✅ 67 files |
| **TOTAL** | **18** | **~105** | |

---

## Priority Matrix

### Phase 1: Quick Wins (Code Already Extracted)
| Course | House | Code Files |
|--------|-------|------------|
| Azure Architecture | Cloud | 91 |
| K8s + GenAI | Cloud | 67 |
| GCP Architecture | Cloud | 32 |
| AWS Architecture | Cloud | 30 |

### Phase 2: High Value (PDF Conversion)
| Course | House | Priority |
|--------|-------|----------|
| Web App Hacking | Dark Arts | ⭐⭐⭐ |
| Malware Analysis | Dark Arts | ⭐⭐⭐ |
| Threat Modeling | Shield | ⭐⭐⭐ |
| Applied Cryptography | Key | ⭐⭐⭐ |

### Phase 3: Advanced/Specialized
| Course | House | Priority |
|--------|-------|----------|
| Memory Forensics | Dark Arts | ⭐⭐ |
| Reverse Engineering | Dark Arts | ⭐⭐ |
| Exploit Development | Dark Arts | ⭐ |

---

## Documentation Structure

**IMPORTANT:** This file is the INDEX only. Each course gets its own planning document.

```
_planning/
├── HUMBLE_CONTENT_MODULE_MAPPING.md    ← THIS FILE (index/overview)
├── courses/                             ← Course-specific planning docs
│   ├── COURSE_WEB_APP_HACKING.md       ← Full module breakdown
│   ├── COURSE_MALWARE_ANALYSIS.md
│   ├── COURSE_MEMORY_FORENSICS.md
│   ├── COURSE_THREAT_MODELING.md
│   ├── COURSE_AWS_ARCHITECTURE.md
│   ├── COURSE_AZURE_ARCHITECTURE.md
│   ├── COURSE_GCP_ARCHITECTURE.md
│   ├── COURSE_APPLIED_CRYPTO.md
│   └── ...
└── usb-import/humble-extract/           ← Extracted source content
```

### Course Planning Doc Template

Each `COURSE_*.md` should contain:
1. **Course Overview** - Title, house, source material, prerequisites
2. **Learning Objectives** - What students will be able to do
3. **Module Breakdown** - Full description of each module
4. **Lab Specifications** - What each lab includes (filesystem, commands, objectives)
5. **Quiz Questions** - Question bank per module
6. **File Scaffolding** - Exact files to create
7. **Dependencies** - What existing components it uses (CLHTerminal, etc.)

### Scaffolding Per Course

Each course needs in `_app/houses/{house}/`:
```
courses/{course-id}/
├── index.html              ← Course landing page
├── m01-{topic}/
│   ├── presentation.html   ← Slides
│   ├── lab.html           ← Interactive lab (if applicable)
│   └── quiz.html          ← Assessment
├── m02-{topic}/
│   └── ...
└── assets/                 ← Course-specific images, data files
```

---

## Next Steps

1. [ ] Create `_planning/courses/` directory
2. [ ] Create course planning doc template
3. [ ] Choose first course to fully scaffold
4. [ ] Build proof-of-concept module
5. [ ] Iterate and scale

---

*Last Updated: February 3, 2026*
