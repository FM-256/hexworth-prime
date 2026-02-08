# Course Planning Documents

This directory contains detailed planning documents for each course being developed from the Humble Bundle content (and other sources).

## Structure

```
courses/
├── _COURSE_TEMPLATE.md          ← Copy this to start a new course
├── README.md                    ← This file
├── COURSE_WEB_APP_HACKING.md    ← Dark Arts: Web App Hacker's Handbook
├── COURSE_MALWARE_ANALYSIS.md   ← Dark Arts: Malware Analyst's Cookbook
├── COURSE_MEMORY_FORENSICS.md   ← Dark Arts: Art of Memory Forensics
├── COURSE_THREAT_MODELING.md    ← Shield: Threat Modeling
├── COURSE_BLUE_TEAM.md          ← Shield: Blue Team Toolkit
├── COURSE_INCIDENT_RESPONSE.md  ← Shield: Applied Incident Response
├── COURSE_APPLIED_CRYPTO.md     ← Key: Applied Cryptography
├── COURSE_AWS_ARCHITECTURE.md   ← Cloud: AWS Solutions Architect
├── COURSE_AZURE_ARCHITECTURE.md ← Cloud: Azure Architecture
├── COURSE_GCP_ARCHITECTURE.md   ← Cloud: GCP Professional Architect
└── ...
```

## Workflow

1. **Copy template:** `cp _COURSE_TEMPLATE.md COURSE_[NAME].md`
2. **Fill out planning doc:** Complete all sections
3. **Create scaffolding:** Build directory structure in `_app/houses/`
4. **Build modules:** Create presentation → lab → quiz for each
5. **Update registries:** ContentRegistry, house index, LearningPaths
6. **QA/QC:** Test all components
7. **Deploy:** Version bump, commit, Firebase deploy

## Naming Convention

- File: `COURSE_[SHORTNAME].md` (e.g., `COURSE_WEB_APP_HACKING.md`)
- Course ID: `[HOUSE]-[CODE]` (e.g., `DA-WAHH`, `SH-TM`, `CH-AWS`)
- Module ID: `[COURSE]-[NN]` (e.g., `DA-WAHH-01`, `SH-TM-03`)

## Source Material Index

See `_planning/HUMBLE_CONTENT_MODULE_MAPPING.md` for:
- Full inventory of available content
- House assignments
- Priority matrix
- Estimated yields

## Quick Reference

| Course | House | Source | Priority |
|--------|-------|--------|----------|
| Web App Hacking | Dark Arts | Web App Hacker's Handbook | ⭐⭐⭐ |
| Malware Analysis | Dark Arts | Malware Analyst's Cookbook | ⭐⭐⭐ |
| Memory Forensics | Dark Arts | Art of Memory Forensics | ⭐⭐ |
| Threat Modeling | Shield | Threat Modeling (Wiley) | ⭐⭐⭐ |
| Blue Team | Shield | Blue Team Toolkit | ⭐⭐ |
| Applied Crypto | Key | Applied Cryptography | ⭐⭐⭐ |
| AWS Architecture | Cloud | AWS for SA + Projects | ⭐⭐⭐ |
| Azure Architecture | Cloud | Azure Mapbook + AZ-304 | ⭐⭐ |
| GCP Architecture | Cloud | GCP Architect Guide | ⭐⭐ |

---

*Created: February 3, 2026*
