# HUB-001 — `divergent/ethics-it` catalog patch (ready to merge)

## Summary

Same shape as `web/ccna`: clean Class A finding, **all 30 dead references resolve to real files**, single-commit catalog patch flips the hub from 32% live to 100% live.

## Verified state

```
houses/divergent/ethics-it/index.html
  refs: 44  |  live: 14  |  catalog gap (file exists): 30  |  true dead: 0
```

The 14 LIVE refs use descriptive IDs (`eth-w1-ethics-overview`, `eth-w1-quiz`, etc.) — already in catalog. The 30 catalog-gap refs split:

| Group | Count | File location |
|---|---|---|
| `eth-{NN}` numeric presentations | 15 | `presentations/eth-NN-{topic}.presentation.html` |
| `eth-l{NN}` labs (Case Room series) | 10 | `labs/eth-l{NN}-{topic}/index.html` |
| `eth-r{1..3}` review docs | 3 | `eth-r{N}.html` (hub-root level) |
| `eth-midterm`, `eth-final` exams | 2 | `exams/eth-{midterm|final}.exam.html` |

## Note on parallel curriculum structures

The hub renders BOTH `eth-01..eth-15` numbered cards AND `eth-w{N}-{topic}` weekly-topic cards. They point to DIFFERENT files (e.g. `eth-01-overview.presentation.html` vs `eth-w1-ethics-overview.presentation.html`). This is a deliberate two-track structure — likely a numbered-sequence track and a weekly-topic track presenting overlapping material in different orderings. Both tracks should be cataloged.

## Patch (paste into `_app/components/ContentCatalog.js`)

Insert near other `house: 'divergent'` entries.

```js
        // ETH curriculum — numbered presentations (15)
        { house: 'divergent', id: 'eth-01', title: 'ETH-01: Overview of Ethics', description: 'Introduction to ethics in IT', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-01-overview.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-02', title: 'ETH-02: Ethics for IT Professionals', description: 'Ethics for IT practitioners', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-02-it-professionals.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-03', title: 'ETH-03: Cyberattacks and Cybersecurity Ethics', description: 'Cybersecurity ethics and attack ethics', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-03-cybersecurity-ethics.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-04', title: 'ETH-04: Week 1 Checkpoint', description: 'Week 1 review and assessment', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-04-week1-checkpoint.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-05', title: 'ETH-05: Privacy', description: 'Privacy in the digital age', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-05-privacy.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-06', title: 'ETH-06: Freedom of Expression', description: 'Speech and expression ethics', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-06-freedom-expression.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-07', title: 'ETH-07: Intellectual Property', description: 'IP rights, copyright, and ethics', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-07-intellectual-property.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-08', title: 'ETH-08: Week 2 Checkpoint', description: 'Week 2 review and assessment', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-08-week2-checkpoint.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-09', title: 'ETH-09: Ethical Decisions in Software Development', description: 'Software development ethics', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-09-software-development.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-10', title: 'ETH-10: IT Impact on Society', description: 'Societal impact of information technology', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-10-it-impact.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-11', title: 'ETH-11: Week 3 Checkpoint', description: 'Week 3 review and assessment', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-11-week3-checkpoint.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-12', title: 'ETH-12: Social Media Ethics', description: 'Ethics in social media platforms', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-12-social-media.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-13', title: 'ETH-13: Ethics of IT Organizations', description: 'Organizational ethics in IT', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-13-it-organizations.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-14', title: 'ETH-14: Codes of Ethics', description: 'Professional codes of ethics', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-14-codes-of-ethics.presentation.html', category: 'eth' },
        { house: 'divergent', id: 'eth-15', title: 'ETH-15: Final Assessment', description: 'Final assessment review', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['presentation'], href: 'ethics-it/presentations/eth-15-final-assessment.presentation.html', category: 'eth' },
        // ETH curriculum — review docs (3)
        { house: 'divergent', id: 'eth-r1', title: 'ETH-R1: What Is Ethics', description: 'Foundational review on what ethics is', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['review'], href: 'ethics-it/eth-r1.html', category: 'eth' },
        { house: 'divergent', id: 'eth-r2', title: 'ETH-R2: The Ethical Decision Framework', description: 'Framework for ethical decision-making', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['review'], href: 'ethics-it/eth-r2.html', category: 'eth' },
        { house: 'divergent', id: 'eth-r3', title: 'ETH-R3: Why Technology Needs Ethics', description: 'Argument for ethics in technology', icon: '/assets/images/icons/icon-scales.webp', status: 'available', components: ['review'], href: 'ethics-it/eth-r3.html', category: 'eth' },
        // ETH curriculum — labs (Case Room series, 10)
        { house: 'divergent', id: 'eth-l01', title: 'ETH-L01: The Defeat Device (VW Emissions)', description: 'Case Room lab — VW emissions scandal', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l01-vw-emissions/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l02', title: 'ETH-L02: The Sony Breach', description: 'Case Room lab — Sony breach', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l02-sony-breach/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l03', title: 'ETH-L03: The Snowden Files', description: 'Case Room lab — Snowden case', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l03-snowden-files/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l04', title: 'ETH-L04: The IP War', description: 'Case Room lab — intellectual property dispute', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l04-ip-war/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l05', title: 'ETH-L05: The Autonomous Decision', description: 'Case Room lab — autonomous systems ethics', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l05-autonomous-decision/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l06', title: 'ETH-L06: The Algorithm', description: 'Case Room lab — algorithmic ethics', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l06-the-algorithm/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l07', title: 'ETH-L07: The Platform', description: 'Case Room lab — platform responsibility', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l07-the-platform/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l08', title: 'ETH-L08: The Whistleblower', description: 'Case Room lab — whistleblower ethics', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l08-the-whistleblower/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l09', title: 'ETH-L09: The Gig', description: 'Case Room lab — gig economy ethics', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l09-the-gig/index.html', category: 'eth' },
        { house: 'divergent', id: 'eth-l10', title: 'ETH-L10: The Code', description: 'Case Room lab — code-of-conduct ethics', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'ethics-it/labs/eth-l10-the-code/index.html', category: 'eth' },
        // ETH curriculum — exams (2)
        { house: 'divergent', id: 'eth-midterm', title: 'Ethics in IT Midterm Exam', description: 'Midterm exam covering weeks 1-2', icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['exam'], href: 'ethics-it/exams/eth-midterm.exam.html', category: 'eth' },
        { house: 'divergent', id: 'eth-final', title: 'Ethics in IT Final Exam', description: 'Final exam covering all 4 weeks', icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['exam'], href: 'ethics-it/exams/eth-final.exam.html', category: 'eth' },
```

## Verification

All 30 paths verified to exist on disk by `_tools/audit-hub-deadrefs-v2.js` run on 2026-05-07. Titles extracted from each file's `<title>` tag. Descriptions are concise summaries; operator may refine.

## How to apply (if approved)

```bash
# After operator approves:
# 1. Open _app/components/ContentCatalog.js
# 2. Find a 'divergent' house section (search: house: 'divergent')
# 3. Paste the 30 entries above
# 4. Save
# 5. node _tools/eduscan/cli.js --files _app/components/ContentCatalog.js,_app/houses/divergent/ethics-it/index.html
#    Verify HUB-001 cleared on divergent/ethics-it/index.html
# 6. git add _app/components/ContentCatalog.js && git commit
# 7. ./deploy.sh --only hosting
```

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Sister proposals (Class A paste-and-deploy): `hub-001-ccna-catalog-patch.md`
- Strategy umbrella: `sym-8-hub001-fix-proposal.md`
- Consolidated decision matrix: `hub-001-all-hubs-analysis.md`
