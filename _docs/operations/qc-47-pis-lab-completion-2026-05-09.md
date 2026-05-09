# QC-47 — PIS Lab Walkthrough Completion Gating Audit

**Date:** 2026-05-09
**Status:** Audit-complete
**Scope:** `_app/houses/shield/infosec/labs/pis-l01` through `pis-l12` (12 labs)

## Finding

All 12 PIS labs use **BoxEngine** (CTF-style flag-capture engine), not EDTEngine. The architectural pattern is sound — completion is gated on **finding all flags**, not scroll-trigger or click-to-complete.

## Architecture per lab

```
labs/pis-lNN-<topic>/
  ├── index.html  (minimal launcher; loads BoxEngine + config; calls BriefingPage.show before BoxEngine.init)
  └── config.js   (lab-specific configuration including flags array)
```

Each `index.html` includes:
- `/arena/firebase-init.js`
- `/arena/engine/BoxEngine.js`
- `<script>BriefingPage.show(PISLNNConfig, function() { BoxEngine.init(PISLNNConfig); });</script>`

The lab config defines `config.flags` (the flag set students must find) plus optional scoring/hint/lore.

## Completion gate (BoxEngine.js:1680-1708)

```js
_checkCompletion() {
    const allFlags = this.config.flags || [];
    const allFound = allFlags.every(f => this.state.flagsFound.includes(f.id));

    if (allFound && !this.state.completed) {
        this.state.completed = true;
        // ... speed bonus calculation ...
        this._logEvent('box_complete', { score, totalTime, flagsFound, hintsUsed });
        this.save();
        this._reportCompletion();
        // ... show completion modal ...
    }
}
```

The state transitions to `completed: true` ONLY when every flag in `config.flags` is found. Then `_reportCompletion()` runs:

```js
async _reportCompletion() {
    // Computes research analytics (flag events, hint events, command events,
    // navigation events, time-between-flags, hint-effectiveness, phase timing)
    // Then bridges to ProgressManager:
    if (typeof ProgressManager !== 'undefined' && trackerKey) {
        ProgressManager.completeModule(trackerKey, 'arena', 'lab', { ... });
    } else if (trackerKey) {
        this._bridgeProgress(trackerKey, s.score);
    }
}
```

## Verdict

**PIS labs are architecturally sound.** No HEUR-018 (scroll-triggered auto-completion) vulnerability. Completion requires:
1. Student must engage with each challenge to find each flag
2. Flag capture is logged + scored
3. Wrong-flag attempts apply penalties
4. Hints applied apply penalties (deliberate trade-off)
5. ALL flags must be captured before `state.completed` flips
6. Speed bonus rewards efficient solves

The completion gate is **stronger than the Ethics IT labs** because:
- BoxEngine requires multiple correct flag submissions (vs. EDT's one batch submission)
- Wrong-flag and hint penalties create meaningful trade-offs
- Each flag capture is independently auditable in the event log

## Memory note: FLAGS FIRST

Per `feedback_flags_first.md` (CRITICAL): "CTF boxes MUST have FLAG{} values before content. 12 boxes built without flags = total failure."

PIS labs all have flag values populated (verified by `grep -l "flag:" _app/houses/shield/infosec/labs/pis-l*/config.js`). Completion gate is functional.

## Out of scope

This audit does not address:
- Karl citation audit on PIS quizzes (Task #65, completed 2026-05-08)
- Bridget three-way sync on PIS quizzes (`bridget-pis-2026-05-09.md`)
- Cluster cheatability bug (4 PIS quizzes share answer array — covered in solutions-manual-quality memo)
- Specific flag values per lab (FLAGS-FIRST audit, separate task)

## QC-47 sub-task progress

- [x] HUB-001 + Karl + verify-quiz-keys (Tasks #65, #66)
- [x] Bridget three-way sync (today: 0 drift, structural cheatability surfaced)
- [x] EduScan smoke gate on PIS hub (commit b6672d33)
- [x] **(this audit) Lab walkthrough completion gating** — VERIFIED architecturally sound
- [ ] Confluence summary deliverable — pending operator decisions on cluster cheatability remediation

## Confluence summary blockers

- **9-quiz cluster cheatability remediation** — operator chooses Fisher-Yates inline shuffle vs per-quiz option re-authoring
- **Bridget R1** — Ethics quiz architecture intent (also affects PIS w1-w4 client-graded status, though PIS has Firestore keys pre-positioned)
