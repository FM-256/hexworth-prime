# ALA Lab Walkthroughs — Confluence page map

Walkthroughs are maintained in TWO places and must be kept in sync on every edit:
1. Shared folder: `~/hexworth-shared/Solutions/Advanced Linux Administration/ALA-L0X-*-SOLUTION.md`
2. Confluence (KBA space), child pages of "Solutions and Walkthroughs Registry" (id 1736712)

To update an existing page after editing the `.md` (do NOT re-`publish`, that creates a duplicate):
`python3 _tools/confluence/publish-solution.py update <page_id> <md_file>`

| Lab | Page ID | Title |
|-----|---------|-------|
| ALA-L01 Dead Cell Recovery | 28344322 | Matrix — ALA-L01: Dead Cell Recovery (Lab Walkthrough) |
| ALA-L02 Grid Handshake | 28311554 | Matrix — ALA-L02: Grid Handshake (Lab Walkthrough) |
| ALA-L03 Signal in the Noise | 28311571 | Matrix — ALA-L03: Signal in the Noise (Lab Walkthrough) |
| ALA-L04 Lockdown Protocol | 28377089 | Matrix — ALA-L04: Lockdown Protocol (Lab Walkthrough) |
| ALA-L05 The Insider | 28409857 | Matrix — ALA-L05: The Insider (Lab Walkthrough) |
| ALA-L06 Field Assembly | 28442626 | Matrix — ALA-L06: Field Assembly (Lab Walkthrough) |
| ALA-L07 Name Authority | 28442644 | Matrix — ALA-L07: Name Authority (Lab Walkthrough) |
| ALA-L08 The Night Shift | 28540930 | Matrix — ALA-L08: The Night Shift (Lab Walkthrough) |
| ALA-L09 Poisoned Records | 28606466 | Matrix — ALA-L09: Poisoned Records (Lab Walkthrough) |
| ALA-L10 Ghost in the Cell | 28540948 | Matrix — ALA-L10: Ghost in the Cell (Lab Walkthrough) |
| ALA-L11 Flatline | 28639234 | Matrix — ALA-L11: Flatline (Lab Walkthrough) |
| ALA-L12 Full Cell Audit | 28672002 | Matrix — ALA-L12: Full Cell Audit (Lab Walkthrough) |
| ALA-Hunt1 Website Down | 28672019 | Matrix — ALA-Hunt1: Website Down (Lab Walkthrough) |

QC standard: replay each walkthrough VERBATIM through the real BoxEngine (the student's
exact commands, not config-derived sequences). Harness: /tmp/ala-vrun.js (job JSON {url,cfg,cmds}).

---

## Professional PDFs (added 2026-06-13)

Each walkthrough is also rendered to a branded instructor PDF and attached to its Confluence page.
- Generate: `python3 _tools/scratch/build-ala-pdfs.py [file.md ...]` (no args = all 13) — python-markdown + WeasyPrint, branded template (title page, running header, page-numbered Instructor-Only footer). Output PDFs land next to the .md in the shared ALA folder.
- Attach to Confluence: `python3 _tools/confluence/attach-ala-pdfs.py [file.pdf ...]` (no args = all 13) — uploads to each page's child/attachment. Re-uploading identical bytes returns a 400 no-op (already attached); changed content creates a new version.
| ALA Final Cell-Σ Commissioning (Practical Final) | 34275330 | Matrix — ALA Final: Cell-Σ Commissioning (Practical Final Walkthrough) |
