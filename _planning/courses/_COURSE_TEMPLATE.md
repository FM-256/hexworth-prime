# COURSE: [Course Title]

**Course ID:** [HOUSE-COURSEID] (e.g., DA-WAHH, SH-TM, CH-AWS)
**House:** [Dark Arts / Shield / Key / Cloud / Code / etc.]
**Source Material:** [Book/Resource title and filename]
**Status:** Planning | Scaffolding | In Progress | Complete
**Created:** [Date]
**Last Updated:** [Date]

---

## Overview

**Description:**
[2-3 sentences describing what this course covers]

**Target Audience:**
[Who is this course for? Prerequisites?]

**Certification Alignment:**
[Any industry certs this maps to - OSCP, AWS SA, etc.]

**Estimated Duration:**
- Modules: X
- Total Labs: X
- Estimated Hours: X-X hours

---

## Learning Objectives

By the end of this course, students will be able to:

1. [ ] Objective 1
2. [ ] Objective 2
3. [ ] Objective 3
4. [ ] ...

---

## Module Breakdown

### Module 01: [Title]

**Source Chapter:** [Chapter X from source material]
**Type:** Presentation | Lab | Both

**Description:**
[What this module covers]

**Learning Objectives:**
- Objective A
- Objective B

**Lab Specification (if applicable):**
```
Filesystem:
├── /home/user/
│   ├── file1.txt
│   └── file2.log
└── /etc/
    └── config.conf

Commands Required:
- command1
- command2

Objectives:
1. Task description → check: (cmd, state, output) => logic
2. Task description → check: (cmd, state, output) => logic

Insight Question:
Q: "Question text?"
A: "answer" (accepted variations: "alt1", "alt2")
```

**Quiz Questions:**
1. Question text? [A/B/C/D] → Answer: X
2. Question text? [A/B/C/D] → Answer: X

---

### Module 02: [Title]

[Repeat structure for each module...]

---

## File Scaffolding

### Directory Structure
```
_app/houses/[house]/courses/[course-id]/
├── index.html
├── m01-[topic]/
│   ├── presentation.html
│   ├── lab.html
│   └── quiz.html
├── m02-[topic]/
│   ├── presentation.html
│   ├── lab.html
│   └── quiz.html
├── ...
└── assets/
    ├── images/
    └── data/
```

### Files to Create

| File | Template | Notes |
|------|----------|-------|
| `index.html` | Course index template | Update title, module list |
| `m01/presentation.html` | Presentation template | X slides |
| `m01/lab.html` | Lab template | Add to CLHConfig.js |
| `m01/quiz.html` | Quiz template | X questions |
| ... | ... | ... |

---

## Dependencies

### Components Used
- [ ] CLHTerminal.js (for CLI labs)
- [ ] CLHConfig.js (module configs)
- [ ] GUISimulator.js (for GUI labs)
- [ ] PSTerminal.js (for PowerShell labs)
- [ ] Other: ___

### Registry Updates Needed
- [ ] ContentRegistry.js - Add course entry
- [ ] House index.html - Add to SAMPLE_MODULES
- [ ] LearningPaths.js - Add to learning paths (if applicable)

---

## Content Extraction Notes

**Source File Location:**
`_planning/usb-import/humble-extract/[folder]/`

**Key Chapters to Extract:**
- Chapter X: [Topic] → Module Y
- Chapter X: [Topic] → Module Y

**Assets to Create:**
- [ ] Diagrams from page X
- [ ] Code samples from chapter Y
- [ ] Practice files for lab Z

---

## Progress Tracker

| Module | Planning | Presentation | Lab | Quiz | QA |
|--------|----------|--------------|-----|------|----|
| M01 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| M02 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| M03 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ... | | | | | |

Legend: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Notes & Decisions

- [Date]: Decision or note
- [Date]: Decision or note

---

*Template Version: 1.0*
