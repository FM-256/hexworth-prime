# MD-100 / CTS1156C Final Exam: "Meridian Workstation Build" Build Spec v2 (server-graded)

**Status:** design only. No code or files were written. This replaces v1 (`md100-final-exam-spec-2026-11-03.md`).
**Inputs:** v1; the four-way vote (Nancy, Mallory, Chris, primary: all APPROVE-WITH-CHANGES) and the operator decisions of 2026-11-03 (`REQUIRED-CHANGES.md`). Section 10 maps every required change to the section of this spec that carries it.
**Engine model:** `functions/netfinal/` (Network+ Meridian final, live since 2026-10-20).
**Sitting:** 2026-11-19, in class, 150 minutes, enforced by the server. Build D1 = Wed 2026-11-04. Sitting = D16 = Thu 2026-11-19.
- **Calendar correction:** the vote note says "D1 Tue 11-04 ... sitting Wed 11-19; D6 is a Sunday". In 2026, 11-04 is a **Wednesday** and 11-19 is a **Thursday**. The weekend days are D4 Sat 11-07, D5 Sun 11-08, D11 Sat 11-14 and D12 Sun 11-15. The syllabus schedule is Tue/Thu, 6:00-9:00 pm, so Thu 11-19 is a class day. Open question Q1 asks the operator to confirm.

**Scope:** TRIMMED CORE, as the operator chose it. The only additions are the light items the objective floors force; they are listed in section 3.4 and in Q5.

**Hard rules (unchanged):**
- `feedback_no_client_grading_ever`: the browser never grades and never holds expected values.
- `feedback_server_holds_trusted_values_not_the_container`: every value a check trusts comes from the server's frozen key or the server-held handover snapshot. Nothing is read back from what the student's state claims.
- **Every point is auto-graded.** No item is marked by an instructor, no callable exists for marking, and the QC bar is exactly 100/100 with 0 pending.

---

## 0. Findings that shape the design (re-verified against the code, 2026-11-03)

1. **netfinal is not one-attempt.**
   - `netfinal-exam.js` `examModeFlags()` returns `oneAttempt:false`.
   - `mayReset(callerUid, targetUid, ...)` returns `true` when `targetUid === callerUid` (`netfinal-exam.js:502-506`).
   - MD therefore has its **own** `mayReset`, staff only, with no self branch, and a mutation test proves it (R6).
2. **The netfinal gradebook write** (`netfinalRecordGrade`, `functions/index.js` ~11290-11387):
   - It writes `completions[catalogId] = {completed:true, score, ...}` for every submitted sitting, pass or fail.
   - It writes only to classes that are run by staff and have the exam assigned.
   - Its never-older-over-newer transaction checks both the live sitting and the archive. MD copies that logic.
3. **InstructorDashboard counts `completed` as credit.** `_app/components/InstructorDashboard.js`:
   - Progress percent: `c.completed && validIds.has(id)` (:983-984).
   - Class completion: :1194-1195.
   - Path completion: `every(m => completions[m]?.completed)` (:1461).
   - Assignment completion rate: :1465.
   - Status tick: :2361/2371.
   - Score averages include a row only `if (comp?.completed && comp.score != null)` (:1377).
   - The per-assignment table shows `comp.score` whether or not the row is completed (:2362).
   - **Consequence:** writing `completed:true` for a failed sitting would count a failure as module and path completion. Section 6 (R7) gives the shape MD writes instead.
4. **BUG-272 is still open.** A student can write their own `classes/{c}/progress/{uid}` row. The session document is the record of truth, and the instructor grades from the results CSV only.
5. **Seed derivation is breakable.**
   - `makeRng` (`netfinal-core.js:153`) hashes the seed string to a 32-bit `seed32` with xmur3 and draws from mulberry32.
   - Mallory's PoC (`mdfinal-vote/mallory/seed.js`) recovers `seed32` from 16 visible work-order (WO) draws in about 60 s by brute force, and then predicts the hidden draws (the faults).
   - Hidden choices therefore must not come from the stream that produces visible values (R1).
6. **netfinal's shell evaluates user regexes.** `netfinal-shell.js:839` (`grep`) runs `new RegExp(pat, 'i')` on student input, which is a ReDoS surface. MD must not copy it (R4).
7. **The netfinal disclosure scanner** (`netfinal-client.js`) matches FORBIDDEN_KEYS exactly and exempts student text by a field-name list (`STUDENT_AUTHORED_FIELDS`).
   - v1 planned wildcard keys (`expected*`, `key*`) and banned the words `profile` and `variant`. Those rules would have flagged the product-key field and the network profile, so v2 replaces them (R5).
8. **netfinal caps nothing except the command line.** The line is limited to 500 characters (`netfinal-exam.js:259`). `params` are uncapped and `state.events` grows without limit. MD adds caps (R3).
9. **The staff test** `isStaff` (`netfinal-exam.js:492`) accepts the admin claim, the admin email list, or the `handler` claim, which is platform-wide.
   - `netfinalResults` with a `classId` returns every member's full sitting for **any** class to any handler.
   - MD narrows this (R7).
10. **The completion registry has a single server-exam source.** Source 6 of `_tools/content/gen-completion-registry.js` (~:562-568) reads only `functions/netfinal/netfinal-exams.js`. Output goes to `functions/completion-registry.json`; canaries are in `_tools/content/registry-canaries.json`.
11. **`_tools/` is gitignored.** The netfinal suites are force-tracked (`_tools/netfinal/*`), so the MD suites need `git add -f`.
12. **Deploy wrappers:**
    - `deploy.sh` covers hosting only and runs the dash gate on `_app` lines.
    - `_tools/eduscan/smoke/deploy.sh --only <targets>` handles functions and rules, and only from master.
13. **The functions options** are `cfOptions = { region:'us-central1', enforceAppCheck: ENFORCE_APP_CHECK }` (index.js:48). The load check must run with App Check off in the emulator, or with debug tokens.
14. **Hub anchors are still valid** (`_app/houses/forge/md-100/index.html`): the Midterm Checkpoint section at :591-606, the M11 card closing at ~:676, `.arena-section` at ~:678, and `MD100_REGISTRATIONS` at :881.
15. **Syllabus objectives** (CTS1156C): 1 Install and Deploy Windows; 2 Manage Disks and Devices; 3 Connect to Networks and Share Resources; 4 Work with Applications; 5 Manage and Monitor Performance; 6 Work with Workgroups and Domains; 7 Implement Security on Windows; 8 Administer and Troubleshoot Windows; 9 Implement Mobile Computers. SLO #6 (documenting complex configurations) is assessed by P8.

---

## 1. Architecture (v1 kept where unchanged)

### 1.1 Module layout (`functions/mdfinal/`)

All modules are pure, have no DOM, and read no clock; the clock is injected only in `mdfinal-exam.js`. **They are free of side effects at load time.** `functions/index.js` requires them lazily inside each handler, so a load-time fault in MD cannot break cold starts of unrelated functions.

| File | Role | Change vs v1 |
|---|---|---|
| `mdfinal-exams.js` | `EXAM_IDS=['md100-final-2026','md100-final-rehearsal']`, `DURATION_MINUTES` (150 each), `CATALOG_IDS={'md100-final-2026':'forge-md100-final'}` (the rehearsal has **none**, so it is never recorded), `WINDOWS` (R2), `resolveExamId`, `durationMinutes`, `catalogId`, `PASS_PERCENT` (Q3) | rehearsal id, window, pass mark |
| `mdfinal-derive.js` | `deriveKey(secret)`, `hidden(K, uid, examId, label)`, `pickIndex(bytes, n)`, `visibleSeed(K, uid, examId)` (R1) | new |
| `mdfinal-core.js` | `generate(uid, examId, {secret})` builds the WO and the initial host/VM state; also `variantSpace()` (3 profiles × 4 variants = 12) and `defaultInstalledState()` for the defaults test | HMAC split |
| `mdfinal-limits.js` | every cap as a constant (R3) | new |
| `mdfinal-pc.js` | boot model, the effective-vs-pending config model, `reboot()`, derived tables (effective NTFS/share access, `Get-NetConnectionProfile`, activation, `manage-bde -status`, event-log query), and the System Restore and WinRE models (section 4.3) | extended |
| `mdfinal-match.js` | literal and wildcard matcher with a step budget (R4) | new |
| `mdfinal-registry.js` | registry whitelist and canonicalisation; routes writes into the pending model through the same preconditions as the GUI (R9) | new |
| `mdfinal-shell.js` | `exec(state, session, line)` with contexts `ps`, `setup-cmd`, `winre-cmd`, `diskpart`, `hyperv-ps` (R4 limits) | hardened |
| `mdfinal-gui.js` | renderers, ACTIONS, `ACTION_SCHEMA`, `schemaGaps()`, `screenAllows(window)`; schema-driven validation of params (R3) | hardened |
| `mdfinal-faults.js` | the 4-variant P7 catalogue (section 4), `applyAtHandover`, `fixedAfterBoot(clone)`, amnesty sets | rewritten |
| `mdfinal-checks.js` | `CHECKS` (24 rows) and `PENALTIES` as data (section 3) | rewritten |
| `mdfinal-grade.js` | `buildAnswerKey` (deep-frozen), `grade`, `retotal`, `studentReport` (aggregates only), `toCsv`, `objectiveTotals` | no pending marks |
| `mdfinal-client.js` | `toInitialState` (whitelist) and `findDisclosures` with exact-key semantics and origin-tagged student text (R5) | rewritten scanner |
| `mdfinal-exam.js` | `startExam` (window gate), `admitSession`, `readSession`, `withSession` (size guard), `runCommand`, `renderWindow`, `runAction`, `saveAnswer` (field allowlist), `handover`, `submitExam`, `provision`, `sweepExpired`, `instructorView`, `resetSession`, `mayReset` (staff only), `examModeFlags` (`oneAttempt:true`) | per R2/R3/R6 |

**Imported unchanged:**
- From `netfinal-core.js`: `own`, `setOwn`, `UNSAFE_WRITE_KEYS` and `ip`. `makeRng` is used only for the **visible** stream.
- From `netfinal-exam.js`: `sameSitting`, `memoryStore`, `isStaff`. `isStaff` is wrapped by MD's own gate (R7).
- From `netfinal-exams.js`: `clampMinutes`.
- From `netfinal-questions.js`: `NORM` and `sameAnswer`.
- The MD suites assert that the behaviour they rely on still holds.
- `ip.maskToPrefix` is always wrapped in the round-trip check `prefixToMask(maskToPrefix(m)) === m`.

**netfinal is not modified** during this window. `makeExamStore` and `recordExamGrade` are new, parameterised copies used only by MD. Moving netfinal onto them is a taskboard item for after the sitting.

### 1.2 Callables: one delimited block in `functions/index.js`

The block is fenced `/* ═══ MDFINAL BEGIN ═══ */ ... /* ═══ MDFINAL END ═══ */` and placed after the netfinal block (~:11585), so the pending BUG-272 restore conflicts with it, if at all, in one place.

- `mdfinalOpts = { ...cfOptions, secrets: [netfinalSeedSecret] }` reuses the existing `defineSecret('NETFINAL_SEED_SECRET')`. If Q2 says the secret is short, a new `MDFINAL_SEED_SECRET` is bound instead.
- `mdfinalCall(fn)` is a copy of `netfinalCall`:
  - `examId` goes through the allowlist.
  - The session id is `uid + '::' + examId`, derived from the caller.
  - Known error codes pass through.
  - The secret is handed to the engine, which derives `K` (R1).

| Callable | Who | Request | Reply / notes |
|---|---|---|---|
| `mdfinalStart` | student | `{examId}` | Create-if-absent behind the window gate (R2); resume always allowed. Reply: `{sessionId, resumed, submitted, handedOver, screen, initialState, answers, answerFields, remainingMs, examMode}` |
| `mdfinalCommand` | student | `{examId, line}` (≤500 chars) | `{out, prompt, context, screen, remainingMs}`; R4 limits |
| `mdfinalWindow` | student | `{examId, window}` | Read only; scanned; refused (generic message) if the current screen does not offer the window |
| `mdfinalAction` | student | `{examId, window, action, params}` | R3 caps; scanned |
| `mdfinalAnswer` | student | `{examId, fieldId, value}` | Field allowlist computed per session (R3); reply `{saved, answeredCount, remainingMs}`, never correctness |
| `mdfinalHandover` | student | `{examId, confirm:true}` | Allowed **at any time** before submit; idempotent; takes the snapshot, then applies the fault if an OS is installed (section 2.4) |
| `mdfinalSubmit` | student | `{examId}` | Idempotent; grades; `onGraded` → `mdfinalRecordGrade`; reply `studentReport` (aggregates only) |
| `mdfinalReset` | staff gate (R7) | `{examId, uid, reason}` | Archive, then remove; same lab comes back (seed unchanged) |
| `mdfinalProvision` | staff gate (R7) | `{examId, uid, reason}` | Rescue after a failed install (section 2.5) |
| `mdfinalResults` | staff gate (R7) | `{examId, classId?, sweep?:true}` | Results, gradebook rebuild, mismatch flags; **sweeps and auto-submits expired unsubmitted sittings** of the listed members |
| `mdfinalControl` | admin only | `{examId, armed?, allowUids?:{add:[],remove:[]}}` | Release flag and allowlist (R2) |

**`mdfinalRecordGrade`** is `recordExamGrade` with `liveCol:'mdfinal_sessions'`, `archCol:'mdfinal_sessions_archive'`, `catalogId:'forge-md100-final'` and `source:'mdfinal'`. The entry shape is in R7. It skips the rehearsal id (no catalog id) and keeps netfinal's never-older-over-newer transaction.

### 1.3 Firestore: one delimited block in `firestore.rules`

The block goes next to the netfinal block (:353-362):
```
match /mdfinal_sessions/{sessionId}          { allow read, write: if false; }
match /mdfinal_sessions_archive/{archiveId}  { allow read, write: if false; }
match /mdfinal_control/{examId}              { allow read, write: if false; }
```
- **Session document:** `{sessionId, studentId, examId, startedAt, durationMs, submittedAt, autoSubmitted, handedOverAt, provisionedAt, stateJson, snapshotJson, p1SnapshotJson, answerKeyJson, shellJson, reportJson, rev, updatedAt}`.
  - Every field is a JSON string, because registry paths and file paths contain dots and backslashes.
  - Size is guarded by R3.
- **Control document:** `{armed, armedBy, armedAt, allowUids[≤20], updatedBy, updatedAt}`.

### 1.4 Attempts, duration, restart

- **One attempt.** A second start resumes the sitting. No self-restart path exists anywhere (R6).
- **Staff restart** brings back the same lab with a new clock. It is archived, never deleted.
- **Duration:** 150 minutes, clamped 1..240 at both the callable and the engine. On expiry, any call auto-submits (copy of `admitSession`), and `mdfinalResults` sweeps sittings that nobody touches again.
- `examModeFlags`: `{examMode:true, loadHexAI:false, courseLinks:false, hints:false, serverTimer:true, serverGraded:true, oneAttempt:true}`.

### 1.5 Seeding (trimmed scope)

| Seeded | Values | Stream |
|---|---|---|
| WO profile | CORP-FIN (domain, Pro, KMS); CORP-SEC (domain; "Credential Guard under the Meridian enterprise agreement, not academic" requires Enterprise; KMS); CONTRACTOR (workgroup; BitLocker plus RDP host requires Pro; MAK). Internal ids `mdp-a/b/c` are never sent; only the requirement prose is. | **hidden** |
| Hostname | `MERWS-` plus 3 digits. One prefix for every profile, so the hostname reveals nothing. | visible |
| Accounts | user name (from a name list), second group member, local group name | visible |
| IP plan | 10.x.y.0 with prefix /23, /24 or /25; gateway; DNS (domain: DC1, DC2; workgroup: two resolvers); KMS host IP and FQDN | visible |
| VM | startup RAM {6144, 8192} MB static; vCPU {2, 4}; OS VHDX {96, 160, 200} GB. All differ from the Hyper-V wizard defaults. | visible |
| Disks | C: size {80, 96, 120} GB; archive {40, 60} GB with a file manifest; pool disks 2 × {64, 80} GB; SCSI order (archive at location 0, or the OS disk at 0); D: label; Spaces label; resiliency prose → Simple or Two-way mirror | visible |
| LOB app | LedgerSync port {8443, 9120, 7443, 9443}; `SERVER=` host; firewall remote subnet | visible |
| Share / ACL | share name, path on D:, confidential folder on D: | visible |
| Updates | CU KB-A (P2), drawn from range A; feature deferral {60, 90, 120, 180}; quality deferral {3, 7, 14}; active-hours window | visible |
| Power | AC/DC display and sleep minutes, drawn from sets that exclude the sim's defaults | visible |
| Time zone | {Eastern, Central, Mountain, US Mountain (Arizona)}. Never Pacific, which is the default. | visible |
| Performance | which 2 of 4 startup candidates are High impact; pagefile MB {4096, 6144, 8192} | visible |
| Consumer app | one of {Microsoft.BingNews, Microsoft.GamingApp, Clipchamp.Clipchamp, Microsoft.MicrosoftSolitaireCollection} | visible |
| Defender | exclusion path | visible |
| Fault | variant V1-V4; KB-B from range B, disjoint from range A (test-asserted); driver inf number; process name; LOB decoy IP | **hidden** |
| BitLocker | protector GUIDs and the 48-digit recovery password, created when the student enables BitLocker | **hidden** (derived) |

**Generator invariant (test):** no WO target equals the simulator's default for that setting. Section 3.2 states the parameter rule.

### 1.6 Placement

- **Pages:** `_app/houses/forge/md-100/exams/md100-final.exam.html` (thin renderer) and `md100-final-results.html`, a parameterised copy of `network-plus/exams/network-final-results.html` with Restart, Provision, Sweep and CSV.
  - The page loads AccessGuard, FirebaseAuth and ObservatoryTelemetry only.
  - The AI button script is not loaded, and its filename is never named. There are no course links, and no ModuleProgress, `completeQuiz` or localStorage grading.
  - `?exam=rehearsal` maps to `md100-final-rehearsal`. The server allowlist decides; the page merely passes the id.
- **Hub:**
  - Add a new `checkpoint-section` "Final Exam" after the M11 card (~:676).
  - It ships as a non-clickable `div.checkpoint-card.is-upcoming` with `data-module="forge-md100-final"`.
  - Add `'forge-md100-final'` to `MD100_REGISTRATIONS` (:881).
  - The 45-item counter is unchanged, with a comment saying the grade lives server-side.
- **Catalog:** `ContentCatalog.js`, after :3003: `{house:'forge', id:'forge-md100-final', components:['exam'], status:'coming-soon', href:'md-100/exams/md100-final.exam.html', category:'md-100', tags:['final','exam']}`.
- **Registry:**
  - Source 6 becomes `SERVER_EXAM_MODULES = ['functions/netfinal/netfinal-exams.js','functions/mdfinal/mdfinal-exams.js']`.
  - Regenerate. The diff of `functions/completion-registry.json` must be exactly `+forge-md100-final` (count +1). Add the canary with provenance.
  - `completion-validation.test.js` must pass.
  - MD never goes through `recordProgress`/`syncProgress` (it writes server-side), so the registry change does not gate MD. It keeps the registry consistent when those functions are next deployed.
- **No tenant map**, following the netfinal precedent.

---

## 2. State model, realism, flow

### 2.1 State (server-only)

Same as v1 except as noted here. Cut domains (EFS, VPN, printer, display, perfmon, restore-point objective, data-loss fault) are removed.

```
meta, host:{isoLibrary, switches, usb:{F:{label:'TECH-USB', files}}, labFiles}
vm, disks, setup, os (+ pagefile, startupApps, sysProtection:{C:{on:false}}, restorePoints:[], safeboot:null)
identity, network (+ hosts:[]), security, apps
ledger:  [{i, k, ref}]   // graded evidence, server-written, NEVER evicted (R3)
events:  [{t, kind, detail}] // display log only, ring buffer (R3)
eventlog: [...]          // simulated Event Viewer
answers: {fieldId:{value, at}}
regScratch: {}           // inert, non-whitelisted registry values (R9), capped
fault*: {variant, ticketId, appliedAtLedger, fixedAtLedger}   // never projected
```

**Frozen key:** WO values; derived edition and channel; correct GVLK/MAK; archive manifest hashes; target disk; the fault's variant, evidence set, category, valid verification methods, amnesty set and resolution ladder.

**Handover snapshot:** `snapshot = deepClone(state)` immediately before the fault is applied. P1-P6 are graded **only** against it, so tampering with P1-P6 after handover moves no P1-P6 score; it can only cost the no-regression part of 7.1. If the student never hands over, P1-P6 are graded against the final state, and P7 and 8.2 score 0. The brief says so.

### 2.2 Realism decisions (Windows 11)

- **Build pinned:** Windows 11 version 24H2, OS build 26100. The ISO baseline is 26100.1742. CU KB-A raises the revision; KB numbers are lab values from reserved ranges, and the brief says so. The value is stated in the brief and stored in `os.build` (operator may swap the constant: Q6).
- **ISO library** (host panel lists each ISO with its edition list):
  - `Win10_22H2_x64.iso` (build 19045; decoy).
  - `Win11_24H2_Consumer_x64.iso`: Home, Home N, Education, Education N, Pro, Pro N, Pro Education, Pro Education N, Pro for Workstations, Pro N for Workstations.
  - `Win11_24H2_Business_x64.iso`: Education, Education N, Enterprise, Enterprise N, Pro, Pro N, Pro Education, Pro Education N, Pro for Workstations, Pro N for Workstations.
  - **Enterprise is only on the business ISO.** In Setup's real order the derived edition (Pro or Enterprise) is never the first, highlighted entry.
- **Disks:** the student creates the VM and its OS VHDX. The **lab fabric pre-attaches** `MER-ARCHIVE.vhdx`, `MER-POOL1.vhdx`, `MER-POOL2.vhdx` and `TECH-USB.vhdx` on the SCSI controller when the VM is created.
  - They are visible by file name and size in VM Settings.
  - The archive has a partition, so it is not `CanPool`. The pool disks are blank. TECH-USB appears in the VM as F: and is also readable from the host's Lab Files panel; this is a declared simplification, used for the BitLocker key in WinRE.
- **Setup:** Gen1, or Gen2 without a vTPM, shows the real "This PC can't run Windows 11" unless `HKLM\SYSTEM\Setup\LabConfig` bypass values were set through Shift+F10 `reg add`.
- **OOBE:** six privacy toggles: Location, Find my device, Diagnostic data (Required/Optional), Inking & typing, Tailored experiences, Advertising ID. All default On/Optional; the WO requires all Off/Required. Local account through Set up for work or school > Sign-in options > Domain join instead.
- **Activation:** an in-exam GVLK table (public GVLKs) plus the WO's MAK for Contractor and a decoy Retail COA. Commands: `slmgr /ipk`, `/skms`, `/ato`, `/dlv`.
- **Update deferral** has two routes. Both write the enabling DWORDs:
  - gpedit: Computer Configuration > Administrative Templates > Windows Components > Windows Update > Manage updates offered from Windows Update > "Select when Preview Builds and Feature Updates are received" / "Select when Quality Updates are received".
  - Registry under `HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate`: `DeferFeatureUpdates=1` plus `DeferFeatureUpdatesPeriodInDays`, and `DeferQualityUpdates=1` plus `DeferQualityUpdatesPeriodInDays` (REG_DWORD).
  - Days written without the enabling DWORD, or with the wrong type, are not effective.
- **BitLocker encryption method:** set by policy before encrypting:
  - gpedit: BitLocker Drive Encryption > "Choose drive encryption method and cipher strength (Windows 10 [Version 1511] and later)" > OS drives XTS-AES 256. Registry: `HKLM\SOFTWARE\Policies\Microsoft\FVE\EncryptionMethodWithXtsOs=7`.
  - Or `manage-bde -on C: -em xts_aes256 ...` / `Enable-BitLocker -EncryptionMethod XtsAes256`.
  - **The wizard has no method picker.** Without policy it uses the default XTS-AES 128.
  - The key cannot be saved to the drive being encrypted (real refusal).
- **System Protection is off by default.** `Checkpoint-Computer` is throttled to one point per 1440 minutes (real warning text). Manual creation in the System Protection dialog is not throttled. Scope is in section 4.3.
- **Battery settings:** a Hyper-V VM has no battery, so Settings and Control Panel show no "On battery" values. DC values are set with `powercfg /change monitor-timeout-dc N` and `standby-timeout-dc N` (or `/setdcvalueindex`). The brief says "this image ships to laptops; set battery values with powercfg". Row 2.3 is the one declared command-only row.
- **Reboot semantics:** rename, join, CU, BitLocker start, pagefile and driver changes set `pendingReboot`. Checks read **effective** values, and Settings shows the real "Restart required" banner.

### 2.3 Gating

- OS windows open only after P1 reaches the desktop; `screenAllows` enforces this. P2-P6 can be done in any order; dependencies are real ones (section 3.3).
- **The P8 window (`asbuilt`) is only reachable from the desktop.**
  - The build-record fields appear once the desktop exists.
  - The incident fields appear only after handover, keyed by the ticket's random id.
  - `answerFields` is computed per session from that state (R3).

### 2.4 Handover

- **Allowed at any time before submit.** It is one-way and needs two confirmations.
- The confirmation text explains the consequences: "Phases 1-6 are recorded as they stand now. A fault ticket will be applied to this PC. If Windows is not installed, Phase 7 and the incident record cannot be earned."
- If no OS is installed, the snapshot is still taken, no fault is applied, and 7.1 and 8.2 score 0 with reason `no-os`.
- The brief recommends handing over with at least 40 minutes left. Expert P7 takes about 6 minutes; students take about 20-25.

### 2.5 Staff "provision PC" rescue

`mdfinalProvision` is staff-gated and only valid before handover.
1. Stores `p1SnapshotJson` (P1 rows are graded from it, **as it stood**).
2. Replaces the VM with the fabric baseline: Gen2, vTPM, Secure Boot. It runs Windows 11 **Pro** (fixed, never the derived edition) installed on the target disk with C: at the WO size, so D: stays possible. The archive is re-attached from the fabric, and any P1 archive penalty already recorded stands. A local admin `mertech` is created with a password staff read from the runbook; the PC is unactivated with default OOBE privacy.
3. Logs a ledger `provisioned` event with the staff uid.

P2-P6, P7 and P8 proceed normally. Results and CSV carry `provisioned:true`.

---

## 3. Objectives, points, negatives

### 3.1 Rules

- **`CHECKS` is the single source of truth.** `mdfinal-grade.test.js` derives and asserts:
  - the sum is exactly 100;
  - every phase total matches table 3.5;
  - every objective total matches table 3.6;
  - the floors hold (each objective ≥5; objective 9 ≥4);
  - every row has `{id, phase, objective, points, basis, parts[], negative, knockOn[]}`.
- `walkthrough --print-weights` prints the tables in this section from `CHECKS`, so the spec and the code cannot drift.
- **Arithmetic:**
  - Part values are kept unrounded and row values are sums of parts. Only displayed row values and the final total are rounded to 0.01.
  - Every full row is an integer, so a perfect run is exactly 100.00.
  - The only fractional parts are the 6 privacy toggles (2 × n/6) and 7.1's no-regression deductions (integers).
- **Fault mutations are evaluated on the snapshot.** Penalties (section 3.4) deduct within their phase, with a floor of 0.

### 3.2 No default-state points

- **A part scores only state the student created by an action.**
  - A part may score a **parameter of a required action**, such as the resiliency chosen when creating the virtual disk, because the action is itself required.
  - A part may never score untouched system state. Built-in accounts disabled, firewall on, real-time protection on, keep-lists intact, Secure Boot on (on a Gen2 VM) and the GPT layout setup creates are all regression **penalties only**.
- `mdfinal-defaults.test.js` enforces this:
  - `defaultInstalledState()` is the state after accepting every default on a Gen2 VM. Every row scores **0** on it.
  - "Do nothing", "submit immediately" and "install with all defaults, then hand over" score exactly 0, 0 and 0 on P1-P6. (Amended by 13.7 item 1: "all defaults" means every wizard default, which Setup refuses; the minimal installable default state scores exactly the three action-parameter parts.)
  - P8 fields left blank, or answered when the underlying state was never built, score 0.

### 3.3 The objective table (24 rows, total 100)

The target was about 22. P1-P6 have 21 rows, P7 has 1 and P8 has 2. The two rows above target come from splitting power into AC (objective 5) and DC (objective 9) and from adding the 6.3 performance row. Both are forced by the floors.

Basis: **snap** = the handover snapshot (or the final state if the student never hands over); **final** = the final state; **ans** = P8 answers compared with the snapshot or key.

| id | Ph | Obj | Pts | Basis | Pass condition (parts) | Negative case (fixture) | Allowed knock-on rows |
|---|---|---|---|---|---|---|---|
| 1.1 VM hardware | P1 | 1 | 4 | snap | Generation 2 (1); vTPM enabled (1); startup RAM, static memory and vCPU = WO (1); OS VHDX size = WO (1) | Gen1 plus LabConfig bypass → 0 for Gen2 and vTPM; dynamic 4096 MB | 5.2 (TPM protector; BitLocker cannot start without the no-TPM policy), 8.1 (BitLocker never on) |
| 1.2 Image & edition | P1 | 1 | 4 | snap | build = pinned Win11 26100 (1); edition = the edition derived from the WO prose (3) | Pro on CORP-SEC → 1/4; Win10 ISO → 0/4 | Home only: 3.3 (no domain join), 4.3 (no RDP host), 5.2 and 8.1 (no BitLocker). Activation is graded against the **installed** edition, so 1.4 is not a knock-on. |
| 1.3 System disk | P1 | 1 | 3 | snap | Windows on the WO target disk via an explicit partition creation on that disk (Setup New, or diskpart create) (1); C: within ±1 GB of WO (2) | "Next" on the whole unallocated disk → 0/3; install on the archive disk → 0/3 plus P1 archive penalty | 5.1 D: part, unless the student shrinks C: (Disk Management Shrink is modelled), 4.4 and 5.3 (paths on D:) |
| 1.4 OOBE & activation | P1 | 1 | 5 | snap | local account with the WO name via Domain join instead (1); six privacy toggles = WO (2 × n/6); key matches the installed edition and the WO channel (KMS GVLK; Contractor: WO MAK) (1); status Licensed (1) | Optional diagnostics → 1.67/2; Retail COA decoy → key 0 and Licensed 0; wrong `/skms` host → Licensed 0 | Licensed part only, from 4.1, when `/skms` names the FQDN and DNS is wrong (the IP avoids it) |
| 2.1 Post-install | P2 | 1 | 4 | snap | hostname = WO and effective (2; pending restart = 1); time zone = WO (1); CU KB-A installed with the restart completed (1) | rename without restart → 1/2; time zone left Pacific; CU pending restart | none |
| 2.2 Power (AC) | P2 | 5 | 3 | snap | custom plan "Meridian Desk" exists and is active (1); AC display = WO (1); AC sleep = WO (1) | Balanced edited in place → plan part 0 | none |
| 2.3 Battery (DC) | P2 | 9 | 2 | snap | on the **active** plan: DC display = WO (1); DC sleep = WO (1) (powercfg) | DC values set on an inactive plan → 0/2 | none (DC is read from whichever plan is active) |
| 3.1 Local user & group | P3 | 6 | 5 | snap | WO user exists (1); in Users and not in Administrators (1); password never expires on and must-change off (1); WO group exists (1); WO group members exactly the two WO members (1) | user added to Administrators → part 2 = 0 (excluded from the P3 admin penalty, so there is no double count); extra member | none |
| 3.2 UAC | P3 | 7 | 1 | snap | Always notify: ConsentPromptBehaviorAdmin=2, PromptOnSecureDesktop=1, EnableLUA=1 | Never notify | none |
| 3.3 Domain / workgroup | P3 | 6 | 4 | snap | domain WO: joined meridian.local and effective (4; pending restart = 1). Contractor: workgroup name exactly WO and effective (4; pending = 1) | workgroup "MERIDIAN" on a domain WO; join attempted before DNS is set → fails → 0 | from 4.1 (IP/DNS wrong → DC not found), from 1.2 (Home) |
| 4.1 IPv4 & DNS | P4 | 3 | 5 | snap | DHCP off and IP = WO (1); prefix = WO with the mask round-trip (1); gateway (1); DNS1 = WO[0] (1); DNS2 = WO[1] (1) | 255.255.255.0 on a /23 WO → prefix 0; DNS reversed → 0 on both DNS parts | none |
| 4.2 Firewall & profile | P4 | 7 | 4 | snap | inbound allow rule for LedgerSync with TCP and the WO port (1); profiles exactly Domain+Private (domain WO) or Private (Contractor), never Public (1); remote address = WO subnet (1); network category: Contractor Private; domain WO DomainAuthenticated, **or Private when the join is not effective** (1) | rule on Any profile; remote Any; category left Public | **none.** The either-rule removes the double jeopardy with 3.3. A successful join earns the category part through a real effect of the join, which is declared and correlated but not a double penalty. |
| 4.3 Remote Desktop | P4 | 9 | 2 | snap | RDP enabled (1); WO user in Remote Desktop Users (1) | enabled, user not added | from 1.2 (Home), from 3.1 (user missing) |
| 4.4 Share | P4 | 3 | 4 | snap | share with WO name on the WO D: path (1); share ACL: Everyone absent (1); WO group Change or Full at share level (1); computed effective network access for the WO group = Modify (1) | Everyone Full Control left; group Read at share | from 5.1 or 1.3 (no D:), from 3.1 (group missing → parts 3-4) |
| 5.1 Data volumes | P5 | 2 | 7 | snap | D: on the target disk's free space using all of it (1); D: NTFS with the WO label (1); pool = exactly the two pool disks (2); virtual-disk resiliency = the one the WO prose implies (Simple / Two-way mirror) (2); Spaces volume letter, NTFS, WO label (1) | D: on the archive disk; pool including the archive (it has to be wiped first → P1 archive penalty too); mirror where the prose wants Simple | from 1.3 (no free space) |
| 5.2 BitLocker C: | P5 | 7 | 5 | snap | method XTS-AES 256, set by policy or manage-bde/Enable-BitLocker before encryption (1); protection On and fully encrypted (1); TPM protector (1); recovery-password protector (1); a file on TECH-USB F:\ containing the current recovery password (1) | wizard with no policy → XTS-AES 128 (method 0); suspended → protection 0; key saved to C: is refused (real); never saved | from 1.1 (no vTPM), from 1.2 (Home) |
| 5.3 Confidential NTFS | P5 | 7 | 3 | snap | inheritance disabled on the WO folder (1); Users and Authenticated Users have no effective access (1); WO group effective Read & Execute (1). **Gate:** Administrators and SYSTEM keep Full Control, else the row scores 0 | inheritance converted but Users left with Read → 2/3 | from 5.1 or 1.3 (no D:), from 3.1 (group missing → part 3) |
| 5.4 Defender | P5 | 7 | 2 | snap | signatures updated after install (1); exclusions = exactly {WO path} (1) | exclusion `D:\` → part 2 = 0 | none |
| 6.1 Applications | P6 | 4 | 5 | snap | LedgerSync from the x64 MSI (1); `SERVER=` WO host (1); `PORT=` WO port (1); seeded consumer app removed for the user (1); deprovisioned (`Remove-AppxProvisionedPackage`) (1) | x86 MSI (it installs; part 1 = 0); property omitted; removed only for the user → 4/5 | none |
| 6.2 Update policy | P6 | 8 | 3 | snap | feature deferral = WO days with `DeferFeatureUpdates=1` (1); quality deferral = WO days with `DeferQualityUpdates=1` (1); active hours manual = WO window (1) | days value with no enabling DWORD → part 0; quality 30 | none |
| 6.3 Performance tuning | P6 | 5 | 3 | snap | each of the two WO-seeded High-impact, non-keep startup apps disabled (1+1); pagefile on C: custom with initial = maximum = WO MB, automatic management off, effective (1) | SecurityHealth disabled instead (P6 keep-list penalty, and the part stays 0); pagefile set without restart → part 0 | none |
| 7.1 Fault repair | P7 | 8 (secondary per variant: V1→2, V2→8, V3→5, V4→3) | 15 | final | **Resolved** 0/4/7/10 on the variant ladder (section 4), evaluated on a **clone after a simulated normal boot**. **No-regression** 5: −1 per regressed state domain outside the variant's amnesty set (section 4.2), floor 0. **Reset this PC or a reinstall → the row scores 0.** | per variant (section 4) | Gate: handover with an installed OS, else 0 (`no-os` / `no-handover`, declared) |
| 8.1 Build record | P8 | 7 | 2 | ans/snap | B1: first 8 hex of the RP protector ID = snapshot (1); B2: encryption-method select = snapshot method (1). Each earns only if the snapshot shows BitLocker enabled by the student. | B1 typed from a removed protector; blank → 0 | from 5.2 (BitLocker never on → 0/2) |
| 8.2 Incident record | P8 | 8 | 5 | ans/key/ledger | I1 root-cause category = key (2); I2 evidence identifier ∈ the variant's evidence set (2); I3 "verified by" ∈ the variant's valid methods **and** a matching verification event in the ledger after the credited fix event (1). Offered only after handover. | I3 "restart" chosen with no restart after the fix → 0 | from 7.1 (no credited fix event → I3 0); whole row gated by handover |

### 3.4 Regression penalties

Penalties apply to default state the student broke. Each has its own negative fixture in the ledger.

| Phase | Penalty | Exclusions (no double jeopardy) |
|---|---|---|
| P1 | archive volume deleted or formatted, or any manifest hash changed: −2; Secure Boot disabled on a Gen2 VM: −1 | Secure Boot penalty not applied to Gen1 (1.1 already lost) |
| P3 | built-in Administrator enabled −1; Guest enabled −1; any additional local admin −1 | the WO user (3.1 grades it); the OOBE account |
| P4 | any firewall profile off −1; NLA disabled −1; SMB1 enabled −1; any **other** share with Everyone Full Control −1 | the WO share (4.4 grades it) |
| P5 | Defender real-time protection off −1 | none |
| P6 | any keep-list item removed or disabled (Calculator, Store, Notepad, SecurityHealth startup) −1 | none |

**Floor-driven additions to the operator's trimmed list** (Q5 asks the operator to confirm). Each is "light", one to three actions:
- 6.1 parts 4-5: consumer-app removal (objective 4 floor).
- 6.2 part 3: active hours.
- 6.3: two startup apps plus the pagefile (objective 5 floor, so performance does not rest only on the P7 variant one student in four gets).
- 2.3: DC power (objective 9 floor, with VPN cut).

### 3.5 Phase totals

P1 16 · P2 9 · P3 10 · P4 15 · P5 17 · P6 11 · P7 15 · P8 7 = **100**

### 3.6 Objective totals and floors (primary tags)

| Obj | Rows | Total | Floor | Holds |
|---|---|---|---|---|
| 1 Install/deploy | 1.1 4 + 1.2 4 + 1.3 3 + 1.4 5 + 2.1 4 | 20 | ≥5 | yes |
| 2 Disks/devices | 5.1 7 | 7 | ≥5 | yes |
| 3 Networks/share | 4.1 5 + 4.4 4 | 9 | ≥5 | yes |
| 4 Applications | 6.1 5 | 5 | ≥5 | yes (exactly) |
| 5 Performance | 2.2 3 + 6.3 3 | 6 | ≥5 | yes. The V3 students get a further 15 under the secondary tag. |
| 6 Workgroups/domains | 3.1 5 + 3.3 4 | 9 | ≥5 | yes |
| 7 Security | 3.2 1 + 4.2 4 + 5.2 5 + 5.3 3 + 5.4 2 + 8.1 2 | 17 | ≥5 | yes |
| 8 Troubleshoot | 6.2 3 + 7.1 15 + 8.2 5 | 23 | ≥5 | yes |
| 9 Mobile | 2.3 2 + 4.3 2 | 4 | ≥4 | yes (exactly) |
| **Sum** | | **100** | | |

**Honest weighting statement:**
- Objective 9 is assessed only as battery power management and remote access (RDP), because the operator cut VPN.
- Objective 4 is assessed as MSI deployment and Store-app removal.
- Objective 5 is assessed as power/startup/pagefile tuning for everyone, plus the performance fault for one student in four.
- The floors hold for **every** variant, because they are computed on primary tags only.

### 3.7 Negatives ledger (`mdfinal-negatives.test.js`)

- Derived from `CHECKS` plus `PENALTIES`. A row or part with no fixture fails the suite.
- For each fixture, the test runs the honest walkthrough plus that one wrong action, across 3 seeds per profile, and asserts:
  1. that row (or that penalty) drops;
  2. every **other** row is unchanged **except** rows listed in that row's `knockOn[]`, which may drop only for the declared reason;
  3. no row outside `knockOn[]` moves.
- **Never decouple a real dependency to make it green.** A knock-on is either declared here or a defect.
- **Post-handover tamper test:** after handover, change every P1-P6 domain → P1-P6 totals are identical, and only the 7.1 no-regression part moves.
- **Mutation tests of CHECKS themselves** (`mdfinal-mutate-checks.js`): for each row, replace `check()` with (a) always full, (b) always zero and (c) the pass comparison inverted. At least one of the perfect / negatives / defaults suites must go red for every mutant; a surviving mutant fails the build.

---

## 4. P7: the single fault catalogue (4 variants, one per student)

The variant is chosen with HMAC (R1), 25% each. `--qc` forces all 4 variants × 3 profiles.

**Common rules:**
- **Resolved** is evaluated on a clone after `pc.reboot(clone, {normal:true})`. A safeboot flag the student leaves set makes the "normal" boot go to Safe Mode, so resolved = 0 (declared).
- Every **canonical repair** is proven in `mdfinal-faults.test.js` starting from the **full perfect P1-P6** state for each profile (BitLocker on with TPM+RP, domain joined for CORP-FIN/SEC, workgroup for CONTRACTOR). It must score 15/15 and an exam total of 100/100.
- It is also proven fixable from a "P1-only" snapshot.
- **Reset this PC or a reinstall** clears every variant and scores the whole 7.1 row 0.

### 4.1 The variants

| | V1 Boot-start filter driver | V2 Bad vendor hotfix | V3 Runaway sync helper (performance) | V4 Name-resolution hijack |
|---|---|---|---|---|
| Ticket | "After the backup agent install last night the PC blue-screens and lands on a blue recovery screen." | "Since I installed the hotfix support emailed, the taskbar and Start keep disappearing." | "PC got very slow this morning, fans loud." | "LedgerSync says 'server not found' since I installed the VPN helper." |
| Applied at handover | Driver package `oem<N>.inf` "Meridian Backup Agent Volume Filter" (`mbafilt.sys`, Start=0) is added to UpperFilters of the disk-drive class `{4d36e967-e325-11ce-bfc1-08002be10318}`; the PC is restarted. | Standalone hotfix **KB-B** installed (range B, disjoint from P2's KB-A); it hooks Explorer. | `C:\ProgramData\MeridianSync\msynchlp.exe` is installed, with an HKLM Run value `MerSync` and scheduled task `\Meridian\SyncHelperWatchdog` (at logon and every 5 min). The process uses about 95% CPU with growing working set. | Service `MerVpnHelper` (Automatic) is installed. At every start it sets the adapter DNS to two vendor resolvers and writes the hosts line `<decoy IP> <LOB FQDN> <LOB short name>`. |
| Symptom state | 0x7B INACCESSIBLE_BOOT_DEVICE, then automatic Repair, then WinRE | Desktop with Explorer crash-looping; Ctrl+Shift+Esc → Task Manager > Run new task works | Desktop responsive but slow; CPU pinned | LOB unreachable; on domain WOs also NETLOGON 5719 / GroupPolicy 1129 (logon with cached credentials works) |
| Evidence | stop code on screen; SrtTrail ("Startup Repair couldn't repair your PC"); in Safe Mode, System 1001 BugCheck 0x0000007b and 41 Kernel-Power; `pnputil /enum-drivers` shows the Meridian package dated at handover; setupapi log | Application 1000 (`explorer.exe`, faulting module from KB-B); 1001 WER; Update history and `Get-HotFix` show KB-B at handover time; Reliability Monitor | Task Manager / Resource Monitor; `Get-Process \| Sort-Object CPU -Descending \| Select-Object -First 5`; Task Scheduler library; Startup apps | `ping <LOB>` resolves to the decoy (hosts); `nslookup` uses the vendor server and fails; `ipconfig /all` shows changed DNS; System 1014 DNS Client timeouts; hosts file content |
| P8 I1 category (8 options: driver, boot configuration, update, system file corruption, name resolution, runaway process, data loss, hardware) | driver | update | runaway process | name resolution |
| P8 I2 evidence set (normalised) | {0x7B ≡ 0x0000007B ≡ INACCESSIBLE_BOOT_DEVICE, 1001} | {KB-B (KB prefix optional), 1000} | {msynchlp(.exe)} | {1014; 5719 on domain WOs} |
| Canonical repair (no recovery key needed) | WinRE > Troubleshoot > Advanced options > Startup Settings > Restart > 4 (Safe Mode). Then `pnputil /delete-driver oem<N>.inf /uninstall /force` (or uninstall "Meridian Backup Agent" in Apps), and restart normally. | Task Manager > Run new task `ms-settings:windowsupdate-history` > Uninstall updates > KB-B (or `wusa /uninstall /kb:<B> /norestart`, or `DISM /Online /Remove-Package`), then restart. | End `msynchlp.exe`; disable or delete the task; disable the startup entry (or uninstall "Meridian Sync Helper", which removes all three); restart. | Disable or uninstall `MerVpnHelper`; restore DNS; delete the hosts line; `ipconfig /flushdns` (optional); restart. |
| Other valid routes | WinRE Command Prompt (**key required**): `reg load` of the offline SYSTEM hive, then remove the UpperFilters entry or set Start=4, or `dism /image:C:\ /remove-driver`; System Restore to a point created after P6 | WinRE > Uninstall Updates > latest quality update (**key required**); System Restore to a post-P6 point | System Restore to a post-P6 point | none (System Restore leaves hosts in place, see 4.3) |
| Resolved ladder (10) | package removed and normal boot reaches the desktop = 10; filter removed or service disabled but package left = 7; otherwise 0 | KB-B absent and Explorer stable after reboot = 10; otherwise 0 | after reboot no `msynchlp` and both persistence points neutralised (task and Run), or app uninstalled = 10; only one persistence point neutralised = 4; process ended only = 0 | after reboot: DNS ∈ {snapshot DNS, WO DNS}, no hosts entry for the LOB names, helper not starting = 10; DNS and hosts fixed but helper still Automatic (it re-breaks at boot) = 4; otherwise 0 |
| Wrong fixes (fixtures) | Startup Repair (no effect); `bootrec /rebuildbcd` (no effect); `bootrec /fixboot` (real "Access is denied"); staying in Safe Mode via `bcdedit /set safeboot` (resolved 0); Reset this PC (row 0) | uninstall KB-A (no effect, and regression: updates domain); `sfc /scannow` ("did not find any integrity violations"); restart Explorer only; new user profile | end process only; disable SysMain/WSearch (decoy disk activity; regression: services domain); switch to High performance (regression: power domain); lower priority | correct hosts line added (workaround → 0, DNS still wrong); DHCP on the adapter (regression: network domain); disable IPv6 (regression) |
| Amnesty set (excluded from no-regression) | driver store entry, `mbafilt` service key, disk-class UpperFilters, Apps entry, safeboot flag | KB-B, its Apps/Update-history rows | the three sync-helper artefacts | adapter DNS, hosts file, `MerVpnHelper` service |
| Valid I3 verification methods (ledger event required after the fix) | restart to desktop; Event Viewer recheck | restart and Explorer stable; Update history check; Event Viewer recheck | restart and Task Manager / `Get-Process` check | `ping`, `nslookup` or `Test-NetConnection <LOB> -Port <port>` |

### 4.2 No-regression rule (5 points)

- The 13 state domains: VM; install (edition, activation, partitions); names (hostname, time zone); updates (KB history excluding the fault KB); power (plans, AC/DC); accounts (users, groups, UAC); membership; IP and DNS (including the network profile); firewall, RDP and shares; storage (volumes, Spaces, BitLocker, ACLs); Defender; apps and policy (MSI, appx, WU policy, startup, pagefile); protected services (SysMain, WSearch, WinDefend, wuauserv, BITS, TermService, LanmanServer, mpssvc, Dnscache).
- Each domain is compared as a canonical projection between the snapshot and the final state, with the variant's amnesty set removed.
- Score: −1 per changed domain, floor 0.
- The P1-P6 rows are unaffected (snapshot basis).

### 4.3 System Restore scope (sim)

- **Availability:** a restore point exists only if the student turned on System Protection for C: (off by default) and created one.
  - `Checkpoint-Computer` is throttled to one per 1440 minutes, with the real warning.
  - The dialog's Create button is not throttled.
  - Windows Installer creates an automatic point before an MSI install when protection is on, under the same throttle.
- **Reverts** (registry and system state changed after the point): HKLM SOFTWARE/SYSTEM values, including services and driver configuration, policies (WU, UAC, FVE), firewall rules, RDP setting, share definitions, network adapter IP/DNS, power schemes and computer name; the driver store and drivers installed after the point; Windows updates installed after the point; Win32/MSI programs installed after the point; scheduled tasks and HKLM Run entries.
- **Does not revert:**
  - user data (Documents, D:, the archive disk, share contents);
  - NTFS ACLs on data folders;
  - BitLocker state and protectors;
  - partitions, volumes and Storage Spaces;
  - local accounts, group memberships and domain membership (declared sim simplification);
  - the hosts file (`drivers\etc` is not a monitored location).
- **Consequence:** restoring to a point taken **after** P6 is a full, legitimate repair for V1-V3. An earlier point regresses P3-P6 domains (no-regression lost). Restore cannot fix V4. It is never one click: it needs foresight, the throttle bites early points, and from WinRE it needs the key.

### 4.4 WinRE and the BitLocker recovery key (decision: modelled, yes)

When the OS volume is protected:

| WinRE tool | Key? | Without the key ("Skip this drive") |
|---|---|---|
| Startup Repair | no (runs; fails for V1) | n/a |
| Startup Settings (Safe Mode) | **no.** The restart uses the normal boot path and the TPM unlocks. | n/a |
| Command Prompt | **yes** | C: shows as locked; `manage-bde -unlock C: -rp <key>` is still possible |
| System Restore, Uninstall Updates, System Image Recovery | **yes** | unavailable |
| Reset this PC | yes, or Skip (then only "Remove everything") | destructive; row 0 |

- The prompt screen shows the real "Recovery key ID: XXXXXXXX".
- **The key source** is the student's own file on TECH-USB, readable from the host's Lab Files panel. The brief says: "Save the recovery key to TECH-USB. You may need it."
- **Fairness:** every variant's canonical repair needs **no** key (V1 through Safe Mode; V2-V4 from the desktop), so a missing backup costs only 5.2's part and never blocks P7.

---

## 5. P8 fields (auto-graded, 5 fields, 7 points)

| Field | Row | Input | Pts | Truth | Earns only if |
|---|---|---|---|---|---|
| B1 Recovery-password protector ID, first 8 hex | 8.1 | typed; braces and dashes stripped; `/^[0-9A-F]{8}$/i`; ≤64 characters stored | 1 | snapshot RP protector on C: | snapshot shows BitLocker enabled by the student with an RP protector; blank never earns |
| B2 C: encryption method | 8.1 | select: XTS-AES 128 / XTS-AES 256 / AES-CBC 128 / AES-CBC 256 | 1 | snapshot method | snapshot status On or Encrypting |
| I1 Root-cause category | 8.2 | select (8 options, section 4.1) | 2 | key | handover happened with an OS |
| I2 Evidence identifier | 8.2 | typed ≤32; normalised per kind (hex or int stop code ≡ symbolic name; KB with optional prefix; event id int; process name case-insensitive, `.exe` optional) | 2 | key evidence set | as I1 |
| I3 Verified by | 8.2 | select: restart and confirm normal boot / restart and confirm Explorer stable / Task Manager or Get-Process after restart / name-resolution or port test / Event Viewer recheck / Update history check / none | 1 | key valid methods | as I1, **and** the ledger has a matching verification event ordered after `fault.fixedAtLedger` |

- **Cut** (allowed by the vote): the IPv4 field, the edition field, and the "changes made" multi-select. Fewer fields leave no default-scoring surface.
- Saves return only `{saved, answeredCount}`. Values are editable until submit and restored on resume.

---

## 6. Security design (R1-R9)

### R1: seeds and HMAC derivation (`mdfinal-derive.js`, Node `crypto`)

```
S  = bound secret (NETFINAL_SEED_SECRET, or MDFINAL_SEED_SECRET per Q2)
K  = HMAC-SHA256(S, "hexworth/mdfinal/v1")                      // domain-separated key
H(label, i) = HMAC-SHA256(K, uid + "|" + examId + "|" + label + "#" + i)
hidden(label, n): read uint32s from H(label,0), H(label,1), ...; reject v >= floor(2^32/n)*n; return v mod n
visibleSeed = hex(H("visible", 0))  ->  makeRng(visibleSeed)    // mulberry32 for visible WO values only
```

- Labels: `profile`, `fault`, `fault-kb`, `fault-driver`, `fault-decoy-ip`, `bl-rp#<n>` (48-digit password digits), `bl-guid#<n>`.
- Recovering the visible stream's `seed32` (Mallory's 60-second attack) reveals only values already on screen.
- **Secret strength:** the start fails closed with `failed-precondition` ("Exam seed secret is not configured.") if `S` is missing, shorter than 32 characters, or equal to a known dev placeholder.
  - The operator confirms entropy privately (Q2), for example `openssl rand -base64 48`. The value is never shown to an agent.
- **Tests:**
  - Changing the secret changes every hidden pick while the visible picks stay keyed to it.
  - A brute-forced `seed32` (stub with a known seed) predicts **no** hidden pick above chance over 10,000 students.
  - The chi-square of the variant distribution is within bounds.

### R2: server-side release window and dry runs

- **In code** (`mdfinal-exams.js`, changed only by a deploy):
  - `WINDOWS['md100-final-2026'] = {opensAt: Date.parse('2026-11-19T22:30:00Z') /* 17:30 EST */, closesAt: Date.parse('2026-11-19T23:30:00Z') /* 18:30 EST: last new start */}`. Values are subject to Q1.
  - The rehearsal id has no window.
- **In Firestore:** `mdfinal_control/{examId}` = `{armed, allowUids}`, written only by the admin-only `mdfinalControl`.
- **`startExam` create path** (resume is always allowed; the clock governs):
  - real id: `uid ∈ allowUids` **or** (`armed` **and** `opensAt ≤ now < closesAt`);
  - rehearsal id: caller is admin **or** `uid ∈ allowUids(rehearsal)`.
  - Otherwise: `failed-precondition` "This exam is not open." Nothing is created.
- **Dry runs:**
  - The operator's timed dry run and the non-author human sitting use `md100-final-rehearsal` through `?exam=rehearsal`.
  - The exam id is part of the HMAC input, so a rehearsal never reveals that account's real-exam lab.
  - No catalog id means nothing is written to the gradebook.
  - The rehearsal sitting is reset (archived) afterwards.
  - An optional real-id smoke by the operator uses `allowUids` and is then reset.
- **Tests:** before the window → refused; not armed → refused; armed inside the window → created; after `closesAt` → refused for a new start and allowed for a resume; a student on the rehearsal id → refused.

### R3: caps and storage (`mdfinal-limits.js`)

| What | Cap |
|---|---|
| command `line` | ≤500 chars; ≤64 tokens; ≤4 pipeline stages |
| action `params` | `JSON.stringify` ≤4096 bytes; depth ≤4; strings ≤500; arrays ≤32; keys ≤32 and each must be in that action's `ACTION_SCHEMA` (`own()`), matching `/^[A-Za-z][A-Za-z0-9]{0,31}$/` |
| local users / groups / members per group | 20 / 20 / 20 |
| firewall rules created | 40 |
| shares / ACEs per share | 10 / 16 |
| ACL'd paths / ACEs per path | 50 / 16 |
| files created (incl. TECH-USB) | 200, each ≤8 KB |
| partitions per disk / volumes | 8 / 12 |
| Defender exclusions | 20 |
| hosts lines | 50 |
| `regScratch` values | 100, each ≤1 KB |
| shell history kept | 200 lines |
| display `events` | ring buffer of 500, detail ≤300 chars (display only) |
| graded `ledger` | **never evicted.** At 2000 entries (about 80 B each), further state-changing calls are refused with the storage message. An honest run produces about 150-250. |
| P8 answers | only ids in `answerFields(session)`; select values must be an option id (≤32 chars); typed values strings ≤64; objects and arrays rejected; `''` clears |
| **total document** | `withSession` serialises the candidate document. Above **700,000 bytes** (Firestore limit 1,048,576; headroom for archive metadata and `reportJson`) it refuses with `failed-precondition` "This change would exceed the lab's storage limit." Nothing is written and `rev` is unchanged. |

Tests: an adversarial filler session hits each cap; the maximum serialised size is ≤700 KB; a refused write leaves the stored document byte-identical.

### R4: shell limits

- **No user regex or script blocks.** No `new RegExp` on student input anywhere in `functions/mdfinal/`; a lint test greps for a non-literal `RegExp(` (`netfinal-shell.js:839` is the counter-example).
  - `Select-String` gets `-SimpleMatch` semantics.
  - `-like` and `Where-Object <Prop> -eq|-ne|-gt|-lt|-like <literal>` use `mdfinal-match.js`, an iterative two-pointer glob, O(n·m) with n ≤ 500 and m ≤ 64.
  - `{ ... }` gets "Script blocks are disabled in this exam console."
- **Budget per command:** ≤50,000 matcher steps and ≤400 output lines (then "... (output truncated)"). Over budget → "Command exceeded the console's limits." The command is logged as `kind:'refused'` and the state is unchanged.
- **Fixed projections:** every cmdlet returns a fixed property set. `Select-Object` accepts only named properties from that set. `Format-List *`, `Select-Object *`, `ConvertTo-Json`, `Export-Clixml`, `Get-Member` and `Out-String -Width` > 200 are refused with real-looking errors, so no dump can reach hidden fields.
- Every name lookup (user, group, service, path, task, registry key) goes through `own()`.
- **Adversarial cases:** a ReDoS pattern such as `(a+)+$` in `-like`/`Select-String` returns within budget; a 64-token pipeline; `__proto__` as a name in every lookup.

### R5: disclosure scanner

- **Exact-key semantics.**
  - FORBIDDEN_KEYS are exact names, with no wildcards: `answerKey, fault, faults, snapshot, baseline, seedStr, seed32, devSeed, derivedKey, hmac, fixedAtLedger, appliedAtLedger, amnesty, variantSpace, expectedEdition, expectedChannel, canonicalRepair, validVerify, evidenceSet, resolutionLadder, profileId`.
  - Legitimate names stay allowed: `profile` (network profile), `key` (product key), `category`, `method`, `id`.
- **Patterns** (values): fault ids `/\bmdf-v[1-4]\b/`, profile ids `/\bmdp-[abc]\b/`, `/hexworth\/mdfinal/`. The hostname prefix `MERWS-` matches neither (test).
  - Profile **display names** (CORP-FIN, CORP-SEC, CONTRACTOR) are in the WO prose by design and are not secret, so they are not patterns.
- **Origin-tagged student text** replaces the field-name list.
  - Renderers emit every student-authored string as `{$s:"..."}`; the page unwraps it.
  - The scanner skips the **value** of a `$s` node for patterns, but still checks keys and shapes.
  - Origin is set at the write site (the action or command that stored the student's input), not inferred from the field name.
- **Lockout test:** type every forbidden token and pattern match into **every** free-text input (hostname, user, group, share, labels, paths, file contents, command lines, P8 typed fields). Every window must still render, every command must still run, and the leak suite must stay green.
- Guards that could-this-have-failed: the sweep reaches the fault-emitting branches, and an unscrubbed key still trips.

### R6: `mayReset` is staff only

- `mdfinal-exam.js`: `mayReset(callerUid, targetUid, token, adminEmails, ownsClassOf)` returns `true` only when the R7 gate passes. It has no self branch.
- `mdfinal-results.test.js` loads the real `functions/index.js` with stubs:
  - (a) a student resetting their own uid gets `permission-denied`;
  - (b) a **mutation case** monkey-patches `MDFINAL.mayReset = NETFINAL.mayReset` and asserts (a) now fails, proving the test can see the swap;
  - (c) a static check asserts the index block calls `MDFINAL.mayReset` and never `NETFINAL.mayReset`.

### R7: staff gate and gradebook shape

- **Recommended gate** (Q4 asks the operator to confirm):
  - **admin** (claim or allowlist): any student, any class;
  - **handler**: only students who are members of a class whose `handlerUid == caller` and which has `forge-md100-final` assigned.
  - Applies to `mdfinalResults` (with `classId`: admin, or that class's handler; without `classId`: the caller's own classes), `mdfinalReset` and `mdfinalProvision`. `mdfinalControl` is admin only.
  - This is narrower than netfinal, where any handler can read any class.
  - Reason: results expose per-check reports and student emails, and a restart brings the same lab back, so the report is the student's key.
- **Gradebook entry** (`classes/{c}/progress/{uid}.completions['forge-md100-final']`), written by the server only:
  ```
  { sat: true, passed: total/outOf*100 >= PASS_PERCENT,
    completed: <passed>,                 // credit ONLY on pass: dashboard reads completed as completion
    score: <percent, always>, total, outOf, phases, objectives,
    satAt: ISO, completedAt: passed ? ISO : null,
    duration, flagged, provisioned, autoSubmitted, source: 'mdfinal' }
  ```
  - This fits the dashboard as read (finding 3). A fail is never counted as module or path completion.
  - The per-assignment table still shows the score of a failed sitting (:2362).
  - Class score averages include passes only (:1377). That is acceptable because the instructor grades from the CSV; the results page shows every sitting with `sat`, `passed` and `score`.
- **Mismatch flag** per results row:
  - (a) a progress entry exists but there is no live or archived session ("progress row present, no session");
  - (b) entry fields (`score/total/passed/completed/sat`) differ from the session-derived entry;
  - (c) `source !== 'mdfinal'`.
  - The CSV carries the flag. While BUG-272 is open, the CSV is the grade of record.

### R8: isolation test (`mdfinal-isolation.test.js`)

1. Generate student A. Drive the canonical run, every `ACTION_SCHEMA` action with fuzzed params, every shell command form, and all four fault variants.
2. Generate student B in the same process. B's state, key and initial projection must be byte-identical to B generated in a fresh child process.
3. `JSON.stringify` of every exported module constant (catalogues, ISO library, option lists, `CHECKS` metadata) is identical before and after.
4. `generate()` and `buildAnswerKey()` return JSON round-trip clones: mutating nested arrays of the result and regenerating gives pristine output.

### R9: registry writes (`mdfinal-registry.js`)

- **Canonicalisation:**
  - hive aliases are mapped: `HKLM`, `HKLM:`, `HKEY_LOCAL_MACHINE`, `Registry::HKEY_LOCAL_MACHINE`, and the same for `HKCU`;
  - matching is case-insensitive;
  - duplicate backslashes are collapsed and trailing ones stripped;
  - `CurrentControlSet ≡ ControlSet001`;
  - value names are case-insensitive;
  - types are enforced (DWORD in decimal or `0x` hex, range-checked; REG_MULTI_SZ where real).
- **Whitelist.** Each entry calls the same precondition function as the GUI and writes only to the pending model:

  | Key | Values | Context |
  |---|---|---|
  | `HKLM\SYSTEM\Setup\LabConfig` | BypassTPMCheck, BypassSecureBootCheck, BypassRAMCheck | setup-cmd, before the compatibility check |
  | `...\Policies\System` | ConsentPromptBehaviorAdmin 0-5, PromptOnSecureDesktop, EnableLUA | |
  | `HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate` | DeferFeatureUpdates, DeferFeatureUpdatesPeriodInDays 0-365, DeferQualityUpdates, DeferQualityUpdatesPeriodInDays 0-30 | |
  | `HKLM\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings` | ActiveHoursStart, ActiveHoursEnd | |
  | `HKLM\SOFTWARE\Policies\Microsoft\FVE` | EncryptionMethodWithXtsOs ∈ {3, 4, 6, 7} | |
  | `HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server` | fDenyTSConnections | |
  | `...\WinStations\RDP-Tcp` | UserAuthentication | |
  | `...\Session Manager\Memory Management` | PagingFiles | |
  | `HKLM\...\CurrentVersion\Run` and HKCU Run | deletes / sets | |
  | `HKLM\SYSTEM\CurrentControlSet\Services\<svc>` | Start 0-4 | known services only |
  | disk-drive class key | UpperFilters | |
  | offline hive `HKLM\<loaded>` | mapped to the above | after `reg load` in winre-cmd |

- **Everything else** returns real-looking success and is stored inert in `regScratch` (capped), so `reg query` round-trips, but **no check ever reads it**. The brief says registry edits outside these areas are recorded but have no effect.
- **Tests:**
  - every whitelisted write gives the same model result as its GUI path;
  - wrong case and alias spellings behave identically;
  - a whitelisted write cannot bypass a precondition (LabConfig after the compatibility check; DWORD out of range; REG_SZ "60" for days → not effective);
  - no `regScratch` value changes any grade (mutation: write every graded concept under a near-miss path → score unchanged).

### 6.1 Remaining surfaces (from v1, kept)

- Callables take a session id derived from auth, and never a state blob. Compare-and-set uses `sameSitting`.
- Writes are refused after submit or expiry.
- A runtime prototype sweep on every entry point.
- Reports are aggregates only after submit.
- The page shows no ticks, no "Correct" text and no per-check progress (page test greps for them).
- Setup's hardware gate, `slmgr` errors and join failures are real Windows behaviour and are kept.

---

## 7. Size of the task: action count and expert time

**Method:**
- `mdfinal-walkthrough.js --print-steps <profile> <variant>` lists the canonical minimum path from the shared `mdfinal-repairs.js` (the same recipes the QC uses).
- Each step is classed as **F** (a form with WO values: 20 s), **C** (a typed command: 15 s), **K** (a click or navigation: 5 s) or **R** (restart: 10 s, simulated).
- Fixed overhead: reading the brief and WO (3 min), P7 diagnosis thinking (2 min), P8 (1 min).
- **Student estimate:** expert × 3 to 3.5, an assumption validated at the D9 non-author completability run and the D13 human sitting.

| Phase | Minimum actions (canonical, CORP-FIN) | Mix | Expert time |
|---|---|---|---|
| P1 | 21 (New-VM, VM settings, start/connect, 7 Setup screens incl. disk select + New, install, 7 OOBE screens, `slmgr /ipk`, `/skms`, `/ato`) | 12F 3C 6K | 5.3 min |
| P2 | 9 (rename, time zone, update check/install, restart, create plan, 2 × powercfg DC, restart folded) | 4F 3C 2R | 2.4 min |
| P3 | 7 (user, group, 2 × add member, UAC, join, restart) | 6F 1R | 2.2 min |
| P4 | 9 (IPv4 form, firewall rule, RDP enable, RDP user, share, 2 × share permission, NTFS, profile check) | 8F 1K | 2.8 min |
| P5 | 12 (D: volume, pool, vdisk, gpedit FVE method, BitLocker wizard with backup to F:, status, inheritance, remove Users, add group, Defender update, exclusion, verify) | 9F 1C 2K | 3.4 min |
| P6 | 10 (msiexec, 2 × appx, 2 × gpedit WU, active hours, 2 × startup toggle, pagefile, restart) | 5F 3C 1K 1R | 2.7 min |
| Handover | 1 (+ confirmation) | 1K | 0.1 min |
| P7 | 7 (V1: WinRE > Startup Settings > Safe Mode, `pnputil /enum-drivers`, `/delete-driver`, restart, verify) | 4C 1K 2R | 1.6 min + 2 diagnosis |
| P8 + submit | 6 | 5F 1K | 1.8 min |
| Diagnostic look-ups (`ipconfig`, `Get-Disk`, `manage-bde -status`, `Get-NetConnectionProfile`, ...) | about 8 | 8C | 2.0 min |
| **Total** | **about 90 actions** (6-7 restarts) | | **about 27 min + 6 min overhead ≈ 33-35 min** |

**Students:** about 100-120 minutes inside the 150-minute window. **Gate:** the timed expert run of P1-P6 plus the fault must finish within **60 minutes** (target ≤40), with step count and restarts recorded (D9).

---

## 8. Plan: D1 Wed 2026-11-04 to D16 Thu 2026-11-19 (the sitting)

**Reviewers:** Nancy (adversarial, back-end correctness), Mallory (attacker), Chris (purpose and quality bar). Each back-end stage closes with a Nancy round and a Mallory round on that stage's code. Fixes land the same or the next day, and a stage is not "done" until both rounds are closed.

| Day | Date | Work | Review / gate |
|---|---|---|---|
| D1 | Wed 11-04 | v2 sign-off (the vote confirms v2 carries every item). Scaffold `mdfinal-exams.js` (ids, window, pass mark), `mdfinal-derive.js` (R1), `mdfinal-limits.js`, core generator, frozen key, `variantSpace`. Tests: determinism, HMAC independence, secret-strength fail-closed, isolation (R8) skeleton, generator "WO ≠ default" invariant. | Mallory R1 (seeds, R1/R8) |
| D2 | Thu 11-05 | `mdfinal-pc.js`: Hyper-V host, fabric-attached VHDXs, ISO library, Setup/OOBE state machine, LabConfig, disks/diskpart, boot model. P1 actions and commands. P1 checks, P1 penalties, negatives, `defaultInstalledState`, defaults test for P1. | Nancy R1 (P1 checks, ledger structure) |
| D3 | Fri 11-06 | P2 and P3: reboot semantics, CU KB-A, time zone, power incl. powercfg DC, users/groups/UAC, join with the DNS dependency. `mdfinal-registry.js` (R9). `mdfinal-match.js` and shell limits (R4). Checks and negatives. | Mallory R2 (R4 shell, R9 registry) |
| D4 | Sat 11-07 | P4 and P5: IP/DNS/profile (either-rule), firewall, RDP, share and effective access, D:, Shrink, Storage Spaces, BitLocker (policy, manage-bde, wizard, TECH-USB), NTFS, Defender. Checks, penalties, negatives. | Nancy R2 (P2-P5 checks, knock-on declarations) |
| D5 | Sun 11-08 | P6 (MSI, appx, WU policy, active hours, startup, pagefile). Handover snapshot. Faults V1-V4 with ladders, amnesty, `fixedAfterBoot`. System Restore and WinRE/key models. Grader, P8 schema, `objectiveTotals`. `walkthrough --qc 12` (all classes) and `--print-steps` / `--print-weights`. | Nancy R3 (fault catalogue, canonical-from-full proofs) |
| D6 | Mon 11-09 | Session service (window gate, `mayReset`, size guard, ledger, answer allowlist, provision, sweep). Index block (lazy require, `makeExamStore`, `recordExamGrade` with the sat/passed shape, R7 gate, 11 callables). Rules block. Results, leak, adversarial, mutate-checks suites. **Text harness** `_tools/mdfinal/mdfinal-cli.js`. **Evening: non-author completability run** (an agent that did not write the engine, from the brief only, no key, at student speed, fresh seed via the CLI). It records steps, stuck points and wall time. | Mallory R3 (R2, R3, R5, R6, R7 on callables) |
| **D7** | **Tue 11-10** | **Scope checkpoint.** Bar: `--qc` 12 forced classes plus 300 random seeds, each **100/100, pending 0**; negatives ledger complete with knock-ons declared; defaults test 0; tamper test; mutate-checks with no surviving mutant; leak, adversarial and isolation green; non-author run report triaged. Four-way vote on cuts only if the bar is missed. | Nancy R4 + Mallory R4 (engine + callables, whole), vote |
| D8 | Wed 11-11 | Page: thin renderer reusing the m01-sim and midterm-sim HTML/CSS with **all their JS logic dropped**. Hyper-V Manager, Setup, OOBE, desktop, Settings, Control Panel/MMC windows driven by `_actions`, `$s` unwrapping. | |
| D9 | Thu 11-12 | Page: WinRE (key prompt), Task Manager, Event Viewer, terminal, P8 form, handover flow with the P7-consequence confirmation, submit, resume, retry on `aborted`. Page and render tests. **Timed expert gate** in the local emulator: P1-P6 plus the fault ≤60 min (target ≤40); step count and restarts recorded against section 7. | Gate: expert run |
| D10 | Fri 11-13 | Results page (R7 gate, Restart, Provision, Sweep, CSV, mismatch flags, sat/passed). Hub card (upcoming). Catalog. Registry source 6 list, regenerated, diff = +`forge-md100-final` only, canary. Solutions key doc (`--student <uid>`, run by the operator with the secret). Student brief. Staff runbook. `git add -f _tools/mdfinal/*`. **Feature freeze.** | Nancy R5 (page), Mallory R5 (Network tab, live callable shapes in emulator) |
| D11 | Sat 11-14 | **Load check:** `_tools/mdfinal/mdfinal-load.js` runs 30 concurrent synthetic sittings, about 90 actions each with think time compressed 10×, against the Functions and Firestore emulators (App Check off). Pass: 0 lost ledger entries; `aborted` rate under 1% and always recovered by the page's single retry; p95 latency under 1.5 s; max document under 700 KB. Chris QC with evidence (qc output, negatives matrix, render screenshots, load report). **Deploy** with operator authorisation; see section 8.1. | Chris PASS, operator go |
| D12 | Sun 11-15 | **Operator dry run in production** on `md100-final-rehearsal` (admin), timed. Fix findings, redeploy the affected callables only. Staff reset of the rehearsal sitting (archived). | operator |
| D13 | Mon 11-16 | **Non-author human sitting** in production on the rehearsal id (allowUids, a different seed), full 150 min, scored and debriefed. Production concurrency smoke: 3 staff accounts on the rehearsal id at once. Fix findings. Nancy final, Chris re-PASS. | Nancy, Chris |
| D14 | Tue 11-17 | In class: brief walkthrough (the rules, handover and P7 dependency, TECH-USB, powercfg note), with no lab access. Instructor assigns `forge-md100-final`. Verify the class exists in `classes/*` with a staff `handlerUid` and every student as a member (results page "classes" view). Hosting deploy: flip the card to a link and the catalog to available. Start stays gated by the window and the arm flag. | operator go |
| D15 | Wed 11-18 | Buffer and freeze. Pre-sitting checklist: window constants correct; `armed=false`; rehearsal sittings reset; real-id allowUids empty; secret check passed (a dry run started); results page loads for the class; runbook printed. | |
| **D16** | **Thu 11-19** | **Sitting** (runbook, section 8.2). | |

**Cut list at D7 for the trimmed scope.** Never cut: server grading; leak, negatives, defaults and completability suites; one attempt; aggregates-only reporting; lockdown; R1-R9. Every cut below has its reweight precomputed so totals stay 100 and floors still hold; the vote is yes or no.
1. PowerShell parity narrowed to network, disk, activation, BitLocker, recovery and powercfg DC; GUI only elsewhere. No reweight.
2. WinRE Command Prompt route: show "not available in this lab"; V1 stays fixable through Safe Mode. No reweight.
3. System Restore: protection can be enabled, but no points can be created ("Create" is greyed with a lab note); remove the restore routes from the valid-method lists. No reweight.
4. Active hours (6.2 part 3): feature and quality parts become 1.5 each. Objective 8 is unchanged.
5. Pagefile (6.3 part 3): startup parts become 1.5 each. Objective 5 stays 6.
6. Hyper-V build screen replaced by a pre-created VM with editable settings: 1.1 becomes "set the VM to the WO" with the same parts and points.
7. Fault catalogue down to V1, V3, V4: needs a vote, because the operator chose 4 variants. Performance V3 is kept.

### 8.1 Deploy steps (D11, repeated for fixes)

All steps run from master.

1. **Load safety:** `node -e "require('./functions/mdfinal/mdfinal-exam.js')"` produces no output and no side effects. `mdfinal-results.test.js` loads the real `index.js` with firebase stubbed. MD is lazily required inside the block.
2. **Rules:**
   - Fetch the live ruleset through the Firebase Rules REST API (`projects/<id>/releases/cloud.firestore` → `rulesets/<name>` source) and diff it against `git show HEAD:firestore.rules` with the MDFINAL block removed.
   - **If production ≠ HEAD, stop and reconcile with the operator.** The BUG-272 work has touched these rules before.
   - Run the emulator rules test (all three MD collections are denied).
   - Then: `_tools/eduscan/smoke/deploy.sh --only firestore:rules`.
3. **Functions, MD callables only:**
   `_tools/eduscan/smoke/deploy.sh --only functions:mdfinalStart,functions:mdfinalCommand,functions:mdfinalWindow,functions:mdfinalAction,functions:mdfinalAnswer,functions:mdfinalHandover,functions:mdfinalSubmit,functions:mdfinalReset,functions:mdfinalResults,functions:mdfinalProvision,functions:mdfinalControl`.
   - The bound secret must already exist (Q2) before this runs.
4. **Verify:**
   - A student test account calling `mdfinalStart` on the real id gets "not open".
   - Admin on the rehearsal id gets a session; reset it.
   - `mdfinalResults` returns for a class the operator handles.
5. **Hosting:** `./deploy.sh` (dash gate, Nexus, smoke, Chris PASS recorded) with the card still `is-upcoming` and the catalog `coming-soon`.
6. **D14 flip:** hosting only.

### 8.2 Staff sitting-day runbook (D16, times Eastern; Q1 confirms)

1. **17:15:** results page open for the class; confirm the roster.
2. **17:30:** `mdfinalControl {armed:true}`.
3. **18:00:** students open the exam; the server clock starts at each student's own start.
4. **During the sitting:**
   - **Failed install**, judged by staff: `mdfinalProvision`. P1 is graded as it stood; tell the student the `mertech` password from the runbook.
   - **Broken session:** `mdfinalReset`, which brings back the same lab with a new clock, archived. Record the reason.
   - **Never reset to give a second attempt.**
5. **18:30:** last new start (`closesAt`); resumes still work.
6. **About 21:00:** results page with **Sweep**, which auto-submits every expired unsubmitted sitting. Then `mdfinalControl {armed:false}`.
7. Export the CSV. **The instructor grades from the CSV only** while BUG-272 is open. Review mismatch flags; note provisioned and autoSubmitted rows.

---

## 9. Tests (summary; all in `_tools/mdfinal/`, `git add -f`, exit-code scored)

1. `core`: determinism, R1, R8 isolation, the generator default invariant, and the variant space of 12.
2. `pc`: boot table, reboot semantics, effective access, mask round-trip, Restore scope, WinRE key table.
3. `shell` / `gui` / `registry` / `match`: golden before-and-after output, `schemaGaps()` empty, R4 and R9 cases.
4. `faults`: per variant, evidence present; resolved ladder steps; every wrong fix; canonical repair from the full P1-P6 state × 3 profiles = 15/15; fixable from a P1-only snapshot.
5. `negatives`: the derived ledger with knock-on enforcement; penalties; tamper.
6. `defaults`: the default baseline scores 0; blank P8 scores 0.
7. `grade`: totals and floors derived from `CHECKS`; determinism after a Firestore JSON round-trip; frozen key; the perfect run answers P8 **from state reads through the shell**, not from the key.
8. `mutate-checks`: no surviving mutant.
9. `walkthrough --qc`: 12 forced classes plus 300 seeds, each 100/100 with 0 pending; `--print-steps`, `--print-weights`, `--student`.
10. `adversarial`: forged ids; prototype keys; caps; ReDoS; self-reset; window bypass; double and racing submit; writes after expiry; the Reset-this-PC row 0; P8 brute force gets no feedback.
11. `leak`: envelopes, every window across 12 classes, fuzzed commands, the lockout test (R5), the callable ledger derived from the `mdfinal*` exports.
12. `results`: gate (R7), sat/passed shape, rehearsal never recorded, newer-over-older, sweep, mismatch flags (a)-(c), `mayReset` mutation (R6), rules text.
13. `page` / `render`: forbidden scripts and strings, auth-then-start, resume, staff controls hidden by computed style, CSS classes defined.
14. Registry: `completion-validation.test.js` and the canary.
15. `load` (D11).

---

## 10. Traceability: REQUIRED-CHANGES → v2

| Required change | Where |
|---|---|
| Totals exactly 100, derived from CHECKS; no instructor-marked items or pending marks; QC bar 100/100, pending 0 | 3.1, 3.5, 3.6, 9 (item 9); header |
| Calendar fixed, all days used | header, 8 |
| Objective tags, floor test, honest weights (4, 5, 9) | 3.3, 3.6 |
| Negatives ledger with knock-ons | 3.3, 3.7 |
| No default-state points | 3.2, 3.4, defaults test |
| P8 (no defaults, desktop gate, verifiedBy ordered after fix, changes-made cut, precise arithmetic) | 2.3, 3.1, 5 |
| Faults: canonical repair from full state, distinct KBs, Restore scope, WinRE key | 1.5, 4 |
| Tamper and CHECKS mutation | 2.1, 3.7 |
| Realism: 6 toggles, gpedit/registry DWORDs, BitLocker method, System Protection and throttle, ISO labels, build pin, disk attachment, join/profile double jeopardy | 2.2, 3.3 (4.2) |
| Fairness and operations: provision, handover any time, brief, sweep, runbook, CSV | 2.4, 2.5, 1.2, 8.2 |
| R1-R9 | 6 |
| Per-stage reviews, non-author run before D7, walkthrough steps and time, timed expert gate, non-author human, load check, deploy plan, lazy require, delimited blocks, registry diff, `git add -f` | 8, 8.1, 7, 1.1-1.3 |

---

## 11. Open questions (genuinely open)

1. **Sitting day and time.** 2026-11-19 is a **Thursday** (the vote note said Wednesday). The syllabus shows Tue/Thu 6:00-9:00 pm. Confirm Thu 11-19, and the window opensAt 17:30 / last start 18:30 Eastern (22:30Z / 23:30Z).
2. **Seed secret strength.** Is `NETFINAL_SEED_SECRET` at least 32 random characters?
   - If yes, reuse it with HMAC domain separation (default).
   - If no, run `firebase functions:secrets:set MDFINAL_SEED_SECRET` (for example `openssl rand -base64 48`) before D11.
   - Rotating the netfinal secret instead would change netfinal labs on any future reset.
3. **Pass mark** for `passed` and `completed`. Default 70%; the syllabus scale makes 65-69.99 a D.
4. **Staff gate.** Confirm the recommendation: admin = all; handler = only students in classes they own that have the final assigned.
5. **Floor-driven light items** (section 3.4) added to your trimmed list: consumer-app removal, active hours, two startup apps plus the pagefile, and DC power via powercfg. Accept them, or accept lower floors for objectives 4, 5 and 9.
6. **Build pin.** Windows 11 24H2 / 26100 (default) or 25H2 / 26200, to match the class's lab images.
7. **Accommodations.** Are extended-time students expected? The server would need a staff-only per-student duration override; it is not built.

---

### Critical Files for Implementation
- /home/eq/ai-content/hexworth-prime/functions/netfinal/netfinal-exam.js
- /home/eq/ai-content/hexworth-prime/functions/index.js (netfinal block ~11118-11585; MDFINAL block after it)
- /home/eq/ai-content/hexworth-prime/functions/netfinal/netfinal-client.js (scanner pattern to re-implement with exact keys and origin tags)
- /home/eq/ai-content/hexworth-prime/functions/netfinal/netfinal-core.js (`makeRng` :153, `own`/`setOwn` :994-1006)
- /home/eq/ai-content/hexworth-prime/_app/components/InstructorDashboard.js (completion readers :983, :1194, :1377, :1461-1465, :2361-2371)
- /home/eq/ai-content/hexworth-prime/_tools/content/gen-completion-registry.js (source 6 ~:562-568)
- /home/eq/ai-content/hexworth-prime/firestore.rules (:338-362)
---

## 12. Operator decisions on section 11 (2026-11-03)

1. Sitting Thu 2026-11-19; window opensAt 17:30, last start (closesAt) 18:30 Eastern (22:30Z / 23:30Z); resumes allowed after closesAt.
2. Seed secret: **reuse `NETFINAL_SEED_SECRET`** with HMAC domain separation. The engine must refuse to start (failed-precondition, generic message) if the bound secret is shorter than 32 characters, so a weak secret fails closed rather than producing predictable labs; the D11 deploy verification (8.1 step 4) proves a start succeeds.
3. Pass mark **70%**.
4. Staff gate: spec recommendation accepted by default (admin = all; handler = only students in classes they own that have the final assigned) unless the operator says otherwise.
5. Floor-driven light items (3.4): accepted by default.
6. Build pin: Windows 11 24H2 / 26100 by default.
7. Accommodations: **none this cohort**; the per-student duration override is not built.

---

## 13. v2.1 errata (2026-11-03): confirm-round findings (Chris, Nancy, Mallory) and operator decisions

These override any conflicting text above. Each reviewer re-checks only this section's diff.

### 13.1 Operator decisions (confirm round)
- **OOBE account:** OOBE creates a separate seeded technician admin account (name seeded per student, e.g. `mertech` + 2 digits, stated in the WO). The WO end user is created afterwards as a standard user (row 3.1). Row 1.4's account part checks the technician admin name; the penalty exclusions list both names. Built-in Administrator stays disabled; a perfect run therefore leaves exactly one local admin (the technician).
- **Secret:** `NETFINAL_SEED_SECRET` reused; operator confirms it was generated randomly (CSPRNG). Not rotated between 2026-11-04 and the end of grading.
- **Human testers:** none available. Operator accepts the risk explicitly. Evidence instead: operator's own timed dry run (treated as expert speed) plus the D6 non-author agent run (completability only). Chris's margin applies: see 13.5 item 1.
- **Restart policy (operator: "students can restart themselves"):** `mayReset(caller, target)`: (a) a student may reset their OWN sitting only while it is NOT submitted; the replacement session is the same lab (same seed) and **keeps the original `startedAt`/expiry** (no extra time); every self-reset is archived and flagged `selfReset:n` on the results page; (b) after submit, only admin may reset; an admin reset gives a fresh clock. "One attempt" in the brief becomes "one graded submission; you may restart your build before submitting, the clock keeps running". R6's mutation test changes accordingly: swapping in `NETFINAL.mayReset` (self-reset after submit allowed) must turn the suite red, and a student self-reset after submit must be `permission-denied`.
- **Staff gate (R7):** Reset-after-submit, Provision, Control, Sweep and Results-for-all = **admin only** (decoded `admin` claim). Handlers may call Results for classes they own, only if the handler claim is present on the decoded token AND the class owner passes the `netfinalClassOwnerIsStaff` check; no handler reset/provision. Test: a non-staff user who created a class containing themselves with the final assigned gets `permission-denied` on Reset (after submit), Provision, Control, Sweep and Results.

### 13.2 Blocking fixes
1. **7.1 no-regression (Chris, Nancy):** awarded only when Resolved ≥ 4 or a credited root-fix ledger event exists; otherwise 0. Defaults test extended to the TOTAL: "install with defaults, hand over, do nothing" = 0 overall (wizard defaults; for the minimal installable default state, exactly the three action-parameter parts per 13.7 item 1). Also gate I1/I2 (P8 fault fields) on at least one diagnostic ledger event for that ticket (event viewer query, task manager, ipconfig/nslookup, etc.).
2. **127 GB (Nancy):** OS VHDX sizes become {96, 160, 200} GB; assert D: free space ≥ share + confidential folder needs for every seed. Add `SIM_DEFAULTS` (wizard RAM 4096 MB dynamic, 1 vCPU, VHDX 127 GB, time zone Pacific, Balanced power defaults, `DESKTOP-XXXXXXX` hostname, lab DHCP IP, Defender defaults) in `mdfinal-pc.js`; the "WO ≠ default" invariant test reads it.
3. **Secret check (Nancy, Mallory):** `deriveKey()` itself throws `failed-precondition` (generic message) for a missing secret, length < 32 after trimming, fewer than 8 distinct characters (see 13.5 item 3), or a known placeholder (`netfinal-dev-seed-not-for-exams` and any `DEV_SEED`); no fallback to `DEV_SEED_SECRET` or `process.env`; trailing newline trimmed consistently; `K` never logged; no dev-seed bypass in the production path; HMAC input is JSON-encoded `[uid, examId, label, i]`. Tests pass an explicit ≥32-char random test secret. Independence test defined: attacker = v1 method (recover `seed32`, continue the visible stream); over 10,000 uids the fault pick (n=4) and profile pick (n=3) prediction rates must lie within the binomial 99.9% interval of chance.
4. **Reset after `closesAt` (Mallory B1):** `mdfinalReset` (self or admin) creates the replacement session atomically in the same transaction under the reset gate; the student's next `mdfinalStart` is a resume. `mdfinalStart` reads the control document fresh on every create (no module-level cache). Test: reset at 19:00 then resume = same lab.
5. **Size guard vs submit (Mallory B3):** submit, auto-submit, sweep and expiry are exempt from the 700 KB guard and the ledger cap; 64 KB headroom reserved for `reportJson`; sizes measured with `Buffer.byteLength`; ledger `ref` fields capped at 64 bytes and never carry student text; archive document asserted ≤ 1 MiB. Test: fill to the cap, then submit and sweep both grade.
6. **Time gate (Chris):** section 7 arithmetic corrected (table = 24.3 min; with overhead ≈ 30 min); planning estimate uses 40 s per multi-field form → expert ≈ 45-50 min. **Hard gate: operator's timed run ≤ 45 min on the slowest variant** (operator speed counts as expert). **Numeric cut triggers:** if over 45 min, or the projected student handover (3.25 × expert P1-P6 time) is later than minute 110, apply cut-list items 4, 5, 6 in that order, then re-time. `walkthrough --print-steps` prints per-variant counts (V1-V4). D6 measures completability only, not time. With no human tester (13.1), the operator's run moves earlier: **operator partial run (P1-P3 on the real page) by D10**, full timed run D12.
7. **Sweep timing:** sweep at 21:05, re-sweep at 21:15 (last 18:30 start expires 21:00).

### 13.3 D1 specificity
- D1 delivers a minimal `buildAnswerKey` (WO values, derived edition and channel, profile, variant, technician name); D5 extends it with fault evidence and ladders.
- State shapes: v1 section 2.1 applies minus the cut domains (perfmon, vpn, printers, efs) and with 6 OOBE privacy toggles; v2 section 2 additions apply.
- `git add -f _tools/mdfinal/*` on D1 and every day, not only D10.
- Negative-form parts (4.4 part 2, 5.3 part 2, 3.1 part 2) require the object to exist; a nonexistent object scores 0.

### 13.4 Non-blocking, before D3 (Mallory N1-N7)
- R4: one work counter charged per pipeline element and per range/string expansion, plus a wall-clock abort; default-deny grammar (refuse `[type]::`, `$()`, `&`, dot-call, `Invoke-Expression`/`iex`, `Invoke-Command`, `Add-Type`, `Start-Job`, nested `powershell -c` / `cmd /c`); refuse regex operators (`-match`, `-replace`, `-split` with pattern, `findstr` without `/l`, `Where-Object -match`); lint `RegExp(`, `.match(`, `.search(`; fuzz every engine regex with 500-char adversarial input.
- R9: `reg import`, `reg copy`, `reg restore`, `reg load`, `Copy-ItemProperty` route through the canonical writer; WOW6432Node mapped or inert; test copy-from-near-miss onto a whitelisted path leaves the score unchanged.
- R6/R7: same swap and static check for every staff gate; student caller tested on every staff callable.
- R5: hidden-value canary (fault KB, inf number, decoy IP, process name, profile id, BitLocker digits) asserted absent from all pre-handover output across the 12 classes; `$s` validated as a capped string.
- R8: interleaved two-session isolation via `Promise.all`; deep-freeze/identity check of constants; `Object.prototype`/`Array.prototype` unchanged.
- Results for an admin without `classId`: returns every sitting for the exam id.


### 13.5 Final errata (2026-11-03): confirm-round findings on 13.1-13.4

Nancy CONFIRM (D1 may start), Chris and Mallory's remaining items folded in here. These override earlier text.

1. **Time gate (Chris).** Binding gate: the operator's timed run, **P1-P6 ≤ 31 min** (110 / 3.5); secondary ceiling: **P1-P6 + slowest fault ≤ 45 min**. Student multiplier = **3.5×** (author speed is a floor; no human tester). Any breach applies cut-list items 4, 5, 6 in order, then re-times. Run protocol (D10 partial P1-P3, D12 full): from the student brief only, no key, fresh seed; time the slowest variant (walk all four with `--print-steps`, time the largest); log restarts and stuck points. D6 non-author agent run: record its step count and stuck points per variant against the canonical `--print-steps` count; any phase above 1.5× is a student-time risk and is trimmed. **Residual risk recorded:** no cold human timing exists. A D10 breach applies the cuts and re-times at D12; a D12 breach applies the cuts and ships without a re-measure, accepted by the operator. Brief states handover by minute 110.
2. **Domain-join admins (Nancy 1).** The P3 "additional local admin" penalty considers local user accounts only; the domain-join default membership (Domain Admins in local Administrators) is expected and excluded. Perfect runs on CORP-FIN/CORP-SEC must score 100.
3. **Secret check (Nancy 5).** Refuse when the trimmed secret is missing, < 32 chars, has < 8 distinct characters, or is a known placeholder. Hex secrets of ≥ 32 chars always pass. Pre-flight before D3: the operator checks the live secret's length privately (length only), so a refusal never first appears at D11.
4. **Provision (Nancy 2).** `mdfinalProvision` creates the student's **seeded** technician admin (same name as the WO), so no penalty and no 1.4 mismatch beyond P1 as it stood.
5. **P7/P8 gates (Nancy 3, 4).** No-regression pays only when Resolved ≥ 4 (the "or credited root-fix event" clause is removed). I1/I2 qualifying diagnostic events are defined per variant in `mdfinal-faults.js` and included in each canonical recipe (V1: the WinRE/boot screen view counts, as the stop code is on screen; V2: Task Manager or Update history; V3: Task Manager / Resource Monitor; V4: ipconfig / nslookup / hosts view).
6. **Self-reset policy (Mallory; replaces 13.1's restart bullet).** Self-reset is "recover a broken build": no extra time, no second graded attempt.
   1. Allowed only if all hold, evaluated inside the reset transaction after `admitSession`: the caller owns an existing session; not submitted; not expired; **not handed over**. After handover, reset is admin-only with a recorded reason.
   2. The replacement keeps `seed`, `startedAt`, `expiresAt` verbatim; nothing is recomputed from now; the reset count never enters key derivation.
   3. At most **2** self-resets per sitting (`SELF_RESET_CAP`, operator-adjustable constant). Each archives the full prior session (admin-readable only) and sets `selfReset:n`; the reset response returns nothing from the archive.
   4. Survive reset (session lineage, not replaceable state): P8 attempt counters, rate and size counters, destructive-action and penalty flags. P8 attempt counters, and any I1/I2 diagnostic-event credit already recorded, are lineage and survive. Any P8 answer state is cleared on reset, though normally none exists before handover. The "P8 counter persists" test sets the counter directly via the test harness, because the normal path cannot create it.
   5. Reset, submit and sweep are each a transaction reading `submitted` and expiry; exactly one wins a race.
   6. Reset never creates a session. An expired-but-unswept session is auto-submitted, not reset.
   7. **Admin reset (Mallory).** Admin-only. `reason` must be one of `PLATFORM_FAULT_CODES` (`vm_unreachable`, `provision_failed`, `engine_error`, `outage`) plus a free-text evidence reference; a student claim alone is not a reason. Admin uid, reason and flag are recorded on both sessions; both archived.
      - Before submit: original `startedAt`/`expiresAt` kept, unless `freshClock:true` with a reason; a fresh clock is bounded: `expiresAt` = now + remaining time at the fault, never later than `closesAt` + one grace period.
      - After submit or handover: a new sitting with a fresh clock. **Seed: OPEN, operator decision.** Mallory: a new seed (sitting index enters derivation here only), because the same seed is a known-answer retake of seen P7/P8. Operator's earlier answer was "same lab on restart". Until decided, the code path refuses any admin reset of a session that is submitted OR handed over (not only submitted), with a clear message. Only the before-handover admin reset (original clock, or `freshClock:true` with a reason) is live.
      - Cap: `ADMIN_RESET_CAP` = 1 per student per exam; a further reset needs the operator-role claim, not a class handler.
      - Newer sitting supersedes older in the gradebook; both archived and visible to admins.
      - Rate, size, destructive-action and penalty counters carry into the new sitting's lineage; P8 attempt counters restart at 0 only on a new seed.
      - Tests: student caller and a class handler without the operator claim denied; second admin reset denied without the operator claim; (if new seed adopted) new sitting's seed differs. Admin reset of a handed-over unsubmitted session, and of a submitted session, are both refused while the seed decision is OPEN.
   8. Tests: self-reset after handover / after expiry / after submit / with no session after closesAt → denied; third self-reset → denied; `startedAt`, `expiresAt`, `seed` byte-identical across reset; P8 counter persists; `Promise.all([submit, reset])` and `([sweep, reset])` → exactly one outcome; `deriveKey` identical across resets.
7. **Stale wording (Nancy 7, Mallory).** Superseded: 1.4 "No self-restart path", R6 "no self branch", `oneAttempt:true` (now `oneGradedSubmission:true`), runbook 8.2 step 4 ("Broken session: admin reset only after submit or handover; students may self-reset a broken build before handover"). Section 8 line "reset gives a new clock" applies to admin reset only. 13.2 item 6's 3.25x multiplier and "hard gate 45 min" are superseded by 13.5 item 1 (3.5x; binding P1-P6 <= 31; 45 min is the secondary ceiling).
8. **Brief (Nancy 8, Mallory).** "You may restart your build up to twice before handover. Restarting gives no extra time and your clock keeps running; it is not a second attempt."
9. **Sweep vs Results (Nancy 9).** `mdfinalResults` never sweeps by itself; sweeping happens only on `sweep:true` from an admin. Test: a handler with the claim who owns the class gets Results but cannot sweep or reset.
10. **Deterministic statistics (Nancy 10).** Independence tests use fixed test uids and a fixed test secret, so results are deterministic.
11. Section 1.5 OS VHDX sizes: {96, 160, 200} GB (13.2 item 2 supersedes line 148).

### 13.6 D1 review outcomes (2026-11-03): Mallory R1 BLOCK, Nancy APPROVE-WITH-CHANGES

Code changes are in `functions/mdfinal/` and `_tools/mdfinal/`. Decisions recorded here:
1. **Visible stream vendored and sectioned.** xmur3/mulberry32 are copied into `mdfinal-derive.js`. A test asserts they still draw identically to netfinal's, so drift is reported. A netfinal edit can no longer re-draw an MD lab. Each generator section uses its own sub-stream, `visibleStream(K, uid, examId, '<section>')`. D1 is `'wo'`; D2 onward each add a new section, never interleaved draws. A golden hash of 10 fixed sittings is pinned in `mdfinal-core.test.js`; changing it requires a `GENERATOR_VERSION` bump in the same commit.
2. **Edition prose.** `EDITION_RULE` now says the requirements decide edition and licensing only, every build task applies to every PC, and academic and N editions are not licensed. CORP-FIN reads "edition needs are domain membership and BitLocker; nothing on it needs Credential Guard".
3. **Pass mark** compares the percent rounded to 0.01 (a sum of sixths displaying 70.00 passes).
4. **SIM_DEFAULTS** list every wizard memory default seen (1024/2048/4096 MB), plug-in display 5/10/15 (the WO set is now {20, 25, 45}), network category Public, RDP off, and privacy On/Optional.
5. **Drive letters.** The archive volume is pre-assigned E: (label MER-ARCHIVE), so D: is free for row 5.1. D2 assigns the Setup DVD a letter other than D:.
6. **Domain join account** `MERIDIAN\svc-wsjoin` is printed on domain WOs. Its password, and the technician and user passwords, come from the student brief (fixed values, not seeded).
7. **V3 process name is fixed** (`msynchlp.exe`, as in 4.1). The 1.5 "process name" hidden entry is superseded, so no `fault-process` label exists.
8. **Archive manifest hashes** are keyed (`hiddenHex`, label `archive-hash#i`) and consume no visible draw.
9. **Contractor LOB.** `SERVER=` takes `wo.lob.fqdn`. The contractor's two resolvers serve `meridian.local` for the LOB name, which D4 models.
10. **Open for D3:** whether a Hyper-V Gen2 guest shows a Sleep setting in Settings/Power Options. If it does not, rows 2.2 sleep and 2.3 both need the powercfg note in the brief (verify on a real 24H2 guest; the operator can check during the D10 partial run).
11. **Open (Q6):** Windows 11 24H2 Home/Pro servicing ended in October 2026. The pinned build stays 24H2 (Enterprise is still serviced, and the brief says KB numbers are lab values) unless the operator asks for 25H2.
12. **Callable contract (D6):** `generate()`/`buildAnswerKey()` throw for a non-string or empty uid and for any exam id not in `EXAM_IDS`; the callable still resolves the id first. `generateForced` is test-only; D6 adds a grep test that `functions/index.js` never references it.

### 13.7 D2 decisions (2026-11-04)

1. **Defaults test vs required-action parameters.** Section 3.2 says every row scores 0 on `defaultInstalledState()`, "the state after accepting every default on a Gen2 VM". That cannot hold literally: Windows 11 Setup refuses to install without a TPM and at least 2 vCPUs, and 1.1 awards Generation 2 and the vTPM. **Resolution:**
   - `CHECKS` marks `actionParam: true` on the parts that score a parameter of a required action: 1.1 Gen2, 1.1 vTPM, 1.2 pinned build.
   - On `defaultInstalledState()`, the test asserts that **exactly** those parts score and nothing else does: Gen2 VM, vTPM on, 4096 MB dynamic, 2 vCPU (the minimum Setup accepts), 127 GB, consumer ISO, first edition in the list, Next on unallocated, OOBE accepting every default.
   - "Install with every wizard default" (Gen1, 1 vCPU) is refused by Setup, so it installs nothing and scores 0. "Do nothing" and "submit immediately" score 0.
2. **1.4 account part** accepts the OOBE local account with the technician name whichever local path created it ("Domain join instead", or limited setup after `oobe\bypassnro`). The objective is a correctly named local admin. The path is evidence for P8 later, not a second penalty on a Home install (1.2 already loses it).
3. **Setup compatibility check:** "Secure Boot capable" is satisfied by any Gen2 VM, even with Secure Boot switched off, which is the −1 P1 penalty rather than a Setup refusal. Gen1 needs `BypassSecureBootCheck`. `BypassCPUCheck` is accepted as on real Setup (added to the R9 LabConfig whitelist).
4. **Archive install path:** Setup refuses to install onto the archive's data partition ("We couldn't create a new partition or locate an existing one"), because that disk has no EFI partition. A student can only install there after deleting the archive partition, which records the archive penalty. This is the 1.3 negative case as specified.
5. **1.1 scores the VM itself**, installed or not (Nancy D2). The VM settings are student actions; a VM with no OS keeps its 1.1 parts. Do-nothing and wizard defaults still score 0.
6. **1.3 "explicit" is a property of the partition Windows is on**: set only by Setup New or `diskpart create partition primary`, never by Setup's automatic layout or by EFI/MSR creates. Creating then deleting a partition earns nothing (Nancy D2).
7. **Archive damage is permanent evidence.** Deleting and recreating the VM rebuilds the fabric disks, but the recorded damage keeps the −2 (fixtures: Setup delete, diskpart delete, diskpart clean).
8. **Activation retries.** A failed `/ato` never un-licenses an activated PC (KMS 180-day lease, MAK permanent); only `/ipk` resets the status.
9. **Reinstall** is modelled: "Press any key to boot from CD or DVD" on a running VM with media (`hyperv/boot-dvd`) reopens Setup; a new install replaces Windows, its accounts and its settings.
10. **Ledger refs are server text only.** OOBE hostname and account names are not logged (they live in `os.hostname` and `identity`). A test checks every ref against a server-text grammar after a hostile walk.
11. **Partition cap** (R3, 8 per disk) enforced in Setup and diskpart with the VDS text.
12. **Brief must say (D10):** the edition is chosen at install; product keys do not change the edition here (`0xC004F069`); P1 consoles take one cmdlet per line (no pipelines until P2 consoles); OOBE: `oobe\bypassnro` is the offline route; reinstall by "press any key" with the ISO attached.
13. **D3 forward note:** the OOBE device name is effective immediately, so the 2.1 "rename without restart" fixture must rename after OOBE.

### 13.8 D3 decisions (2026-11-04)

1. **Module layout:** desktop settings live in `mdfinal-os.js` (P2-P6 operations) and the desktop console's commands and pipeline engine in `mdfinal-cmdlets.js`, beside `mdfinal-pc.js` (machine, Setup, OOBE, boot) and `mdfinal-shell.js` (tokeniser, deny rules, contexts). Same contract: pure operations, shared by GUI and console, server-text ledger.
2. **Sleep on a Hyper-V guest (closes 13.6 item 10 for the build; operator verifies at D10):** the guest has no sleep state (`powercfg /a` lists S1-S3 and S0ix unavailable), so Power Options and Settings offer the display timeout only; AC and DC sleep and DC display are set with `powercfg /change` (or `/setacvalueindex` / `/setdcvalueindex`). The brief says so. If a real guest shows a sleep control, nothing a student does by command is marked wrong.
3. **`ncpa/ipv4` moved forward from D4:** the domain join depends on DNS, so the IPv4 dialog exists from D3 (row 4.1's check stays D4). Static address, either DNS mode, real validation messages.
4. **Accounts:** lusrmgr's New User defaults to "must change password at next logon" (real); `net user /add` and `New-LocalUser` do not; every new local user joins Users. `net user /expires:never` sets the account expiry, not the password, and earns nothing (real). lusrmgr is refused on Home with the real snap-in text; `net user` still works. Built-in accounts cannot be deleted.
5. **Domain join:** needs a business edition, Meridian DNS (a DHCP address with the DC as DNS works), and the brief's join account and password; effective after a restart; adds `MERIDIAN\Domain Admins` / `Domain Users` to the local groups (13.5 item 2). Leaving a domain is not modelled (reinstall instead).
6. **Prompts:** `New-LocalUser` without `-NoPassword` and `Add-Computer -Credential` prompt for a password; the next line is consumed as the secret, never tokenised, never in history (stored as `********`), never in the ledger or events.
7. **Registry, D3 scope:** whitelisted now: LabConfig (Setup only), UAC, Windows Update policy, active hours, BitLocker method policy, Remote Desktop values. Paging file, Run keys, services and UpperFilters join at D5 with their models (scratch until then). Key existence is real (`reg add` creates keys; `Set-ItemProperty` needs `New-Item`; a new value without `-Type` is REG_SZ and inert).
8. **Desktop console grammar:** pipelines of at most 4 stages, producers with fixed property sets (Get-LocalUser, Get-LocalGroup, Get-LocalGroupMember, Get-TimeZone, Get-HotFix, Get-CimInstance Win32_ComputerSystem, Get-ItemProperty), stages Select-Object, Where-Object (simple syntax), Sort-Object, Measure-Object, Format-Table/-List (last only). Refused: `*` projections, Get-Member, ConvertTo-Json, Export-Clixml, Out-String, regex operators, script blocks, variables other than `$true/$false/$null`, unquoted parentheses, mutating commands after the first stage.

### 13.9 D3 R2 outcomes (2026-11-04): Mallory BLOCK, fixed

1. **Reserved account names:** `__proto__`, `prototype` and `constructor` (any case) are refused as user and group names on every create path. Windows would accept them, so this is declared. A suite drives each through New-LocalUser, net user, New-LocalGroup, net localgroup and lusrmgr, and asserts nothing is created and nothing throws.
2. **No nested local groups:** adding a local group to a local group is refused with Windows' "wrong account type" text, so 3.1 "standard" and P3-extra-admin can no longer be dodged. Domain principals are limited to the lab's real ones (`MERIDIAN\Domain Admins`, `Domain Users`, `svc-wsjoin`).
3. **Session lifetime:** every diskpart session starts with nothing selected. A VM start, stop or restart ends console contexts and cancels pending prompts, and so does using any other console. The line after a prompt is still consumed as the secret.
4. **Add-Computer is atomic:** `-NewName` is validated before the join and applied only if the join succeeds. Workgroup names are validated as typed, before upper-casing.
5. **History:** `net user <name> <password>` lines are stored with the password masked.
6. **Registry tree:** ancestors of default keys exist (`HKLM:\SOFTWARE\Microsoft` and the like), forward slashes are accepted, `Run`, `Services` and `Memory Management` keys exist for D5, and an inert value never shadows a modelled one in queries.
7. **Callable contract (D6, required):** an engine call either completes or throws. The callable writes the session only when the call returns, so a throw leaves the stored document unchanged (all-or-nothing). `state.shell.pending` and `state.shell.history` are never part of the client projection.
8. **Known simplification:** the 13.4 wall-clock abort is not implemented, because nothing in the consoles is slow enough to need it (Mallory measured a 1,988-row pipeline at about 3 ms). The step budget and the 400-line output cap are the bounds.

### 13.10 D4 decisions (2026-11-04)

1. **BitLocker hidden values in the key.** `buildAnswerKey` carries `bitlocker.ids` (4 protector GUIDs, label `bl-guid#n`) and `bitlocker.passwords` (4 recovery passwords, 8 blocks, each block `11 × hidden(bl-rp#n#b, 65536)`, as real ones are multiples of 11). The nth protector a student creates takes slot n. A value enters the state only when its protector exists, and the engine never needs the secret at action time (ctx carries the key). `GENERATOR_VERSION` 1.1.0. The state is unchanged; the golden hash is updated in the same commit.
2. **Modules:** `mdfinal-fs.js` (NTFS folders, ACLs, inheritance, effective access as a bitset; share ∩ NTFS over SMB), `mdfinal-storage.js` (Disk Management, Shrink/Extend, Storage Spaces), `mdfinal-bitlocker.js`, `mdfinal-net.js` (category, firewall, RDP, shares, SMB1, Defender, NTFS UI wrappers), `mdfinal-cmdlets-d4.js` (P4/P5 console commands, registered into the D3 pipeline engine).
3. **Declared simplifications:**
   - the DVD drive is R:, so D: is free;
   - Windows' used space on C: is 30 GB (the Shrink floor);
   - one pool and one space, which take the whole pool;
   - the no-TPM BitLocker startup policy is not modelled, so a PC without a vTPM cannot start BitLocker (1.1 knock-on);
   - files exist only on TECH-USB (F:) and folders only on NTFS data volumes;
   - `New-StoragePool -PhysicalDisks` takes `PhysicalDisk<n>` names;
   - `Get-NetFirewallRule` shows its own port and address;
   - one adapter, "Ethernet".
4. **Real behaviour kept:**
   - new data volumes give Authenticated Users Modify, Users Read & execute, and Administrators/SYSTEM Full;
   - inherited entries cannot be removed until inheritance is disabled;
   - Advanced Sharing and `New-SmbShare` default to Everyone Read;
   - a DomainAuthenticated network's category cannot be set by hand;
   - Tamper Protection (on) makes `Set-MpPreference -DisableRealtimeMonitoring` report success and do nothing, while the Windows Security toggle works;
   - the BitLocker wizard has no method picker and cannot save the key to C:;
   - encryption completes at the hardware-test restart;
   - the CanPool rules hold (the archive cannot be pooled while it holds its volume).
5. **Grading notes:**
   - 4.2 takes the best enabled inbound allow TCP rule covering the WO port;
   - remote addresses compare as canonical network/prefix;
   - 4.4 "effective" is share ∩ NTFS for the WO group;
   - 5.3 "no access" is effective access for Users and Authenticated Users;
   - 5.2's TECH-USB part needs the full 48-digit current recovery password in a file on F: (dashes optional);
   - P4-everyone-full excludes the WO share, which 4.4 grades.

### 13.11 D4 R2 outcomes (2026-11-04): Nancy BLOCK, fixed

1. **One rule earns 4.2 (answers Nancy E2):** parts 1-3 come from a single enabled inbound Allow TCP rule that names the WO port explicitly. An Any-port rule is not "a rule for LedgerSync". An enabled inbound Block rule covering the port voids parts 1-3, as Block wins in Windows. 4.2 now declares 4.1 as a knock-on: a joined PC whose DNS stops pointing at the DC loses DomainAuthenticated.
2. **No cascade gates (answers E1):** 5.1's resiliency and spaces parts and 5.2's method, TPM, recovery-password and TECH-USB parts are each scored on their own. Only 5.2 "protection on and fully encrypted" needs the hardware-test restart. The method counts once encryption has started.
3. **Effective access as a member sees it (A1):** 5.3 part 3 and 4.4 part 4 evaluate a representative member of the WO group, carrying the group plus Users, Authenticated Users and Everyone. 5.3 needs exactly Read & execute; the brief says "Read & execute" (answers E3). Leaving Authenticated Users with Modify costs both part 2 and part 3, which is what Windows would really grant (declared).
4. **Home and Home N** share one helper for RDP-host, domain-join and BitLocker availability.
5. **Console parsing:** list arguments accept spaces after commas (`a, b`); netsh keyword values are case-insensitive; `{GUID}` literals (`manage-bde -id {...}`) pass the deny rule; icacls accepts `/T /C /Q /L`, the `X` and `N` rights, `(R,X)` lists and `.\Group`.
6. **BitLocker (answers E4):** decrypt exists (`manage-bde -off`, `Disable-BitLocker`, Control Panel > Turn off), and decrypting removes every protector. The wizard reuses an existing TPM protector. `Enable-BitLocker` with both protector switches, or a recovery-password-only start on C:, is refused up front. The key carries **8** slots per sitting (lifetime: a removed protector's slot is never reused). GUIDs use the RFC 4122 v4 layout.
7. **gpedit:** `gpedit/fve-os-method` sets "Choose drive encryption method and cipher strength" (OS drives) and writes the same policy model as the registry route. The Windows Update gpedit policies arrive with D5.
8. **Supported now:** the `New-Partition ... | Format-Volume ...` pipeline, `Enable-`/`Disable-NetFirewallRule`, `Get-NetAdapter`, `Get-NetIPAddress`, remote address ranges `a-b`, and `%ProgramData%`-style exclusion paths. The GUI New Simple Volume wizard defaults to the next free letter (D:).
9. **Declared, not modelled:**
   - `("a","b")` and `@(...)` list forms are refused (the comma list works);
   - output redirection (`>`, `Out-File`) is refused, so the recovery key reaches TECH-USB through the wizard's "Save to a file", "Back up your recovery key", or `Set-Content` with the password;
   - `Get-NetFirewallPortFilter` is absent (`Get-NetFirewallRule` shows its port and address);
   - Extend ignores partition adjacency (lenient);
   - the admin shares (C$, ADMIN$, IPC$) are not listed.
10. **Knock-ons are derived, not just named:** a test breaks each upstream dependency (no D:, whole-disk layout, no vTPM, WO group missing, WO user missing) on two profiles and asserts that every row that moves declares the broken row.
11. **D6 assertions (required):** the callable always passes `ctx.key`, and refuses a stored session whose key predates generator 1.1.0 (no `bitlocker` section).
