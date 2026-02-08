# CLH Transfer Bundle - AI Initialization Prompt

**Purpose:** Copy and paste the prompt below to initialize a new AI session on the target device.

---

## PROMPT TO GIVE THE AI

```
---
Project: Hexworth Prime - CLH Course Bug Fixes (Continuation)

Context: I've transferred files from another device to continue working on the CLH (Command Line Hacker) course modules in the House of Script. There is a transfer bundle that contains everything you need.

Transfer Bundle Location: _planning/CLH_TRANSFER_BUNDLE.md

Your First Task:
1. Read the transfer bundle at _planning/CLH_TRANSFER_BUNDLE.md
2. Extract the THREE files contained within it to their correct locations:
   - CLH_ISSUES.md → _planning/CLH_ISSUES.md
   - LINUX_LAB_TEMPLATE.md → _planning/LINUX_LAB_TEMPLATE.md
   - LinuxTerminal.js → _app/components/LinuxTerminal.js

3. After extraction, read CLH_ISSUES.md to understand the current state of work

Key Context:
- CLH labs are Linux terminal simulators for teaching command line skills
- Labs are located at: _app/houses/script/applets/linux/clh-XXX-*.html
- LinuxTerminal.js is the ENGINE that powers all labs - without it, labs break
- Labs must use FLAT filesystem structure with `children` arrays (not nested `contents` objects)
- 7 filesystem bugs were already fixed (CLH-002 through CLH-008)
- 8 open issues remain in CLH_ISSUES.md

Content Guidelines:
- All CLH lab content should be thematic: spy/espionage, UFO/alien, conspiracy, hacker culture
- NO generic lorem ipsum or bland placeholder text
- Content should feel like students are uncovering classified/forbidden material

Start: Extract the files from the bundle, then read CLH_ISSUES.md for the full status and next steps.
---
```

---

## WHAT THIS DOES

When you give this prompt to the AI on the other device, it will:

1. **Understand the project context** - Hexworth Prime, House of Script, CLH course
2. **Know what to do first** - Extract files from the bundle to correct locations
3. **Have the key technical insight** - Flat filesystem structure with `children` arrays
4. **Know the content style** - Spy/conspiracy/UFO themes, not generic text
5. **Know where to continue** - Read CLH_ISSUES.md for open issues

---

## FILES TO TRANSFER

Copy these two files to the other device's `_planning/` folder:

1. `CLH_TRANSFER_BUNDLE.md` - Contains the 3 files to extract
2. `README_CLH_AI_PROMPT.md` - This file (the prompt to give the AI)

---

*Created: January 16, 2026*
