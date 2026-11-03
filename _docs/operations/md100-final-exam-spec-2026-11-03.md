# MD-100 / CTS1156C Final Exam: "Meridian Workstation Build" Build Spec (server-graded)

**Status:** design only. No code or files were written.
**Engine model:** `functions/netfinal/` (Network+ Meridian final, live since 2026-10-20).
**Target:** class sits it 2026-11-19 (CTS1156C); build D1 = 2026-11-04, operator dry run by D11-D12, buffer to the sitting.
**Hard rules:**
- `feedback_no_client_grading_ever`: the browser never grades and never holds expected values.
- `feedback_server_holds_trusted_values_not_the_container`: every value a check trusts comes from the server's frozen key. It is never read back from the student's own state.

---

## 0. Findings that shape the design

Each of these was checked in the code, not taken from memory.

1. **netfinal is no longer one attempt.** Since 2026-10-19 any student can restart their own submitted sitting (`netfinal-exam.js:173-190` sets `oneAttempt:false`; `functions/index.js:11447` `mayReset` allows the caller's own uid). The MD final must not copy that. It uses its own `mayReset`: staff only, no self-restart.
2. **netfinal already writes the grade from the server.** `netfinalRecordGrade` (`functions/index.js:11326-11387`) writes to `classes/{c}/progress/{uid}.completions[catalogId]`. It only writes for classes that are run by staff and have the exam assigned. The pattern works; the code is hardcoded to `netfinal_sessions` and to `source:'netfinal'`, so it needs a generalised copy.
   - **Caveat (BUG-272):** a student can still write their own progress row, so the gradebook copy is not authoritative. The session document is the record of truth. The results page rebuilds the gradebook copy from it (`index.js:11538-11545`).
3. **Completion registry.** Source 6 of `_tools/content/gen-completion-registry.js:562-568` reads only `functions/netfinal/netfinal-exams.js` CATALOG_IDS. A new server exam id stays invisible to the registry until that source becomes a list.
   - The MD exam page must never call `ModuleProgress.complete` or `completeQuiz`. That keeps it out of BUG-298 (browser-asserted grades) and BUG-299 (generator blind to `completeQuiz`) by construction.
4. **The practice sims grade in the browser.** `forge-md100-m01-sim.lab.html` (`confirmEdition` ~1559, `applyPartitions` ~1655, `finishCleanInstall` ~1789) and `forge-md100-midterm-sim.lab.html` (objective checks at ~:530-560, `checkObjectives` ~:562, `ModuleProgress.complete` ~:590, localStorage state ~:479-516) all check answers client-side.
   - Their HTML/CSS and screen layouts can be reused. **None of their JS logic can be reused.** Every "Correct."/"Wrong edition." feedback string has to go.
5. **`_tools/` is in `.gitignore` (line 52)**, but the netfinal suites are force-tracked (`git ls-files _tools/netfinal` lists them). New `_tools/mdfinal/*` files need `git add -f`, or they silently never reach the repo.
6. **Seed secret.** A missing bound secret aborts every functions deploy (firebase-tools validates all bound secrets; see the netfinal memory "HARD BLOCKER" section).
   - Recommended: reuse `NETFINAL_SEED_SECRET` with a domain-separation prefix. Open question Q7.
7. **The deploy dash gate** (`deploy.sh:209-221`) blocks em dashes and " -- " on added `_app` lines, comments included. The page, hub card and catalog text must be written without them.
8. **No MD-100 exams folder exists.** The hub (`_app/houses/forge/md-100/index.html`) has a Midterm Checkpoint section at :591-606 and the M11 card ends at ~:676, before `.arena-section` at ~:678. Its counter (:833-860) reads localStorage only.

---

## 1. Architecture

### 1.1 Module layout

All new modules go under `functions/mdfinal/`. Every engine function is pure and DOM-free, with no clock reads; the clock is injected only in `mdfinal-exam.js`, same as netfinal.

| File | Role | Built how |
|---|---|---|
| `mdfinal-exams.js` | `EXAM_IDS=['md100-final-2026']`, `DURATION_MINUTES={'md100-final-2026':150}`, `CATALOG_IDS={'md100-final-2026':'forge-md100-final'}`, `resolveExamId`, `durationMinutes`, `catalogId` | Same shape as `netfinal-exams.js`. `clampMinutes` is imported from it (pure). |
| `mdfinal-core.js` | `generate(uid, examId, {secret})`: seeded work order (WO) plus the initial host/VM state. Also `variantSpace()`. | New. Imports `makeRng`, `own`, `setOwn`, `UNSAFE_WRITE_KEYS` and `ip.*` from `netfinal-core.js` (exported at :1872-1882). |
| `mdfinal-pc.js` | The PC model, described below | New |
| `mdfinal-shell.js` | `exec(state, session, line)` with contexts: `ps` (PowerShell+cmd), `setup-cmd` (Shift+F10), `winre-cmd`, `diskpart` (sub-mode), `hyperv-ps` (host) | New. Same pattern as `netfinal-shell.js:1301`, with a trie/prefix table per context. |
| `mdfinal-gui.js` | Window renderers, ACTIONS, `ACTION_SCHEMA`, `actionSchema()`, `schemaGaps()`, `screenAllows(window)` | Pattern copied from `netfinal-gui.js:520-731`. Dispatch only through `own()`. |
| `mdfinal-faults.js` | Phase 7 fault catalog (`apply`, `fixed`, `method`, `evidence`, `ticket`), invariants, `applyAtHandover`, `recordProgress` | Pattern from `netfinal-faults.js:1300-1461`. |
| `mdfinal-checks.js` | The objective list as data, described below | New |
| `mdfinal-grade.js` | `buildAnswerKey(state)` (deep-frozen at start), `grade(session)`, `retotal`, `studentReport`, `toCsv` | Pattern from `netfinal-grade.js:33-562`. Imports `NORM`/`sameAnswer` from `netfinal-questions.js` (`text`, `ipv4`, `prefix`). |
| `mdfinal-client.js` | `toInitialState(state)` (a whitelist) and `findDisclosures` with MD-specific FORBIDDEN_KEYS/PATTERNS and STUDENT_AUTHORED_FIELDS | Copy of the structure of `netfinal-client.js`. The lists are MD-specific, so this cannot be imported. |
| `mdfinal-exam.js` | Session service: `startExam`, `admitSession`, `readSession`, `withSession`, `runCommand`, `renderWindow`, `runAction`, `saveAnswer`, `handover`, `submitExam`, `notifyGraded`, `markNarrative`, `instructorView`, `resetSession`, `mayReset` (staff only), `examModeFlags` (`oneAttempt:true`) | Adapted copy of `netfinal-exam.js` (lifecycle at :84-551). Imports `sameSitting` (:588), `isStaff` (:492) and `memoryStore` (:595) unchanged. |

`mdfinal-pc.js` holds:
- `boot(state)`: the outcome screen computed from the VM/firmware/disk/BCD/driver state.
- The effective-vs-pending config model and `reboot(state)`.
- Derived tables, computed and never stored: `ipconfig`, effective NTFS/share access, `Get-NetConnectionProfile`, activation status, `manage-bde` status, event log query.

`mdfinal-checks.js` holds each objective as data: `{id, phase, objective, points, basis: 'snapshot'|'final'|'answers', check(view, key) -> {earned, of, note}, negative: '...'}`. It also exports `CHECKS` for the negatives-ledger test.

**Reuse vs copy vs generalise:**
- **Import unchanged (no netfinal edits):**
  - `netfinal-core.js`: `own`, `setOwn`, `makeRng`, `ip`.
  - `netfinal-exam.js`: `sameSitting`, `isStaff`, `memoryStore`.
  - `netfinal-exams.js`: `clampMinutes`.
  - `netfinal-questions.js`: `NORM`, `sameAnswer`.
  - The MD suites assert the behaviour they rely on (for example `MD.own === CORE.own`, and `sameSitting` refuses a missing doc), so a later netfinal change that breaks MD fails MD's tests.
  - One caution: `ip.maskToPrefix` does not check that a mask is contiguous (BUG-290 note). MD wraps every mask input in a round-trip check, `prefixToMask(maskToPrefix(m)) === m`.
- **Copy and adapt:** the session lifecycle and the disclosure scanner. Both are bound to netfinal's modules and lists.
- **Generalise, as new code that only MD uses:** two helpers in `functions/index.js`:
  - `makeExamStore(liveCol, archCol)`, a parameterised copy of `netfinalStore` (:11145-11233).
  - `recordExamGrade(session, {liveCol, archCol, catalogId, source}, onlyClassId, cache)`, a parameterised copy of `netfinalRecordGrade` (:11326-11387). It reuses `netfinalClassOwnerIsStaff` (:11308) unchanged.
  - **netfinal's own functions are not changed during this window.** Moving netfinal onto the generic helpers is a follow-up taskboard item after the sitting, done with `netfinal-results.test.js` as the guard.

### 1.2 Callables (`functions/index.js`, new block after :11585)

- **Shared options:** `mdfinalOpts = { ...cfOptions, secrets: [netfinalSeedSecret] }`. This reuses the existing `defineSecret` at :11137 (see Q7).
- **Shared wrapper:** `mdfinalCall(fn)`, a copy of `netfinalCall` (:11237-11278):
  - The session id is derived from the caller: `uid + '::' + examId`. It is never taken from the request.
  - `examId` goes through the `MDFINAL_EXAMS.resolveExamId` allowlist.
  - Error codes pass through the known list.
  - The seed is built as `secret + '|mdfinal|' + uid + '|' + examId`.

| Callable | Request | Reply | Notes |
|---|---|---|---|
| `mdfinalStart` | `{examId}` | `{sessionId, resumed, submitted, handedOver, screen, initialState, answers, remainingMs, examMode, report?}` | Create-if-absent. Resume returns the same lab, clock and saved P8 answers. Duration comes from `durationMinutes(examId)` and never from the client. |
| `mdfinalCommand` | `{examId, line}` (≤500 chars) | `{out, prompt, context, screen, remainingMs}` | `withSession` (compare-and-set). Output is not scanned (netfinal's reversal, `netfinal-exam.js:262-296`); fault ids never enter `state`. |
| `mdfinalWindow` | `{examId, window}` | `{window, view (+_actions), screen, remainingMs}` | `readSession`. `findDisclosures` runs on the payload. Refuses windows the current screen does not offer, with a generic message. |
| `mdfinalAction` | `{examId, window, action, params}` (params JSON ≤4 KB, strings ≤500) | `{result:{ok, reason?, message?}, screen, remainingMs}` | `withSession` plus a scan. Covers power, setup and OOBE steps, Settings, MMC actions and the WinRE menu. |
| `mdfinalAnswer` | `{examId, fieldId, value}` | `{saved, answeredCount, remainingMs}` | P8 only. Stored verbatim, never graded mid-exam. `fieldId` is allowlisted against the P8 schema with `own()`. |
| `mdfinalHandover` | `{examId, confirm:true}` | `{handedOver, tickets:[{id,text}], screen, remainingMs}` | Idempotent. Refused unless Windows boots to the desktop. Freezes the snapshot and applies the faults. |
| `mdfinalSubmit` | `{examId}` | `{submitted, alreadySubmitted, submittedAt, report: studentReport}` | Idempotent. Grades on the server. Calls `onGraded` → `mdfinalRecordGrade`. |
| `mdfinalReset` | `{examId, uid, reason}` | `{reset, archiveId, wasSubmitted, previousTotal}` | **Staff only** (`isStaff`). Students get `permission-denied`, even for their own uid. Archive-then-remove in one transaction. |
| `mdfinalResults` | `{examId, classId?}` | Same shapes as `netfinalResults` (:11490-11551) | Staff only. Rebuilds the gradebook copy per class. Each row also reports a `gradebookMismatch` flag when the progress row disagrees with the session (BUG-272 visibility). |
| `mdfinalMarkNarrative` | `{examId, uid, mark: 0\|1\|2}` | `{marked, total, outOf, pending}` | Staff only. P8.9 handover note. Re-totals and re-records. |

`mdfinalRecordGrade(session, onlyClassId, cache)` is `recordExamGrade` with:
- `liveCol:'mdfinal_sessions'`, `archCol:'mdfinal_sessions_archive'`, `catalogId:'forge-md100-final'`, `source:'mdfinal'`.
- The entry carries `{completed:true, score:%, total, outOf, pendingInstructorMarks, phases, completedAt, duration, flagged, source}`.
- **Failures are recorded too.** `completed:true` means "sat", and `score` carries the result. This is the BUG-298 fix for this exam: instructors see every sitting, pass or fail.

### 1.3 Firestore

- Add to `firestore.rules`, next to :353-362:
  ```
  match /mdfinal_sessions/{sessionId} { allow read, write: if false; }
  match /mdfinal_sessions_archive/{archiveId} { allow read, write: if false; }
  ```
- **Session document:** `{sessionId, studentId, examId, startedAt, durationMs, submittedAt, handedOverAt, stateJson, snapshotJson, answerKeyJson, shellJson, reportJson, rev, updatedAt}`.
  - Everything is stored as JSON strings, because registry paths and file paths contain dots and backslashes.
  - Size budget is well under 1 MiB. Events are capped at 4000, each detail truncated to 300 characters; a test asserts the serialized maximum stays under 600 KB.
- The archive is copied as-is, with `{resetAt, resetBy, reason, originalId}` added.

### 1.4 Attempts, duration, restart

- **One attempt.** A second `mdfinalStart` resumes the sitting. There is no self-restart path anywhere.
- **Staff restart** (admin claim, the admin email allowlist, or the `handler` claim) can rescue an in-progress or submitted sitting. **The same lab comes back by default** (the seed is unchanged; see Q3).
- **Duration:** 150 minutes, clamped 1..240 at both the callable and the engine. On expiry, any call auto-submits (copy of `admitSession`, :193-215).
- `examModeFlags`: `{examMode:true, loadHexAI:false, courseLinks:false, hints:false, serverTimer:true, serverGraded:true, oneAttempt:true}`.

### 1.5 Per-student seeding

These come from the seed and are recorded in the frozen key:

| Seeded | Values |
|---|---|
| WO profile (3) | CORP-FIN (domain, Pro, KMS); CORP-SEC (domain; Credential Guard/AppLocker requirement means Enterprise; KMS); CONTRACTOR (workgroup; BitLocker plus RDP-host requirement means Pro; MAK). **The profile id is never sent;** only its requirement prose is. |
| Hostname | Profile prefix plus 3 digits |
| Users/groups | Primary user name (name list), seeded local group name, confidential-data group |
| IP plan | Address in 10.x.y.0, prefix /23, /24 or /25, gateway, DNS (DC IP or two resolvers), VPN server FQDN and tunnel type, split tunnel yes/no |
| Disks | Disk 0 size {127,160,200}; C: size {80,96,120}; **which disk number is the install target vs the archive disk (0 or 1)**; two blank pool disks of {64,80} GB |
| LOB app | LedgerSync port {8443, 9120, 7443, 5986}; firewall remote scope subnet; MSI property `SERVER=` host |
| Share | Share name, NTFS group |
| Updates | Feature deferral {60,90,120,180}, quality deferral {3,7,14}, active hours window |
| Power | AC/DC sleep and display timeouts |
| Display | Resolution and scaling (2-3 options) |
| Misc | Time zone (4 US zones); unwanted app (one of 4); printer IP and correct driver package; restore point name; perfmon counter and threshold; EFS target file; Defender exclusion path |
| Faults | One "boot/recovery" fault (3) and one "system/service/data" fault (4): 12 combinations. Ticket ids are random numbers. |

- **Seeded but deliberately not secret:** the WO values themselves (they are the task).
- **Secret:** the derived answers (edition, activation channel choice), the fault identities, and the handover snapshot.
- **Residual:** students who share a profile share the edition answer. With 3 profiles, a shared "pick Pro" is right about a third of the time and is only 3 points.

### 1.6 Placement

- **Page:** `_app/houses/forge/md-100/exams/md100-final.exam.html`, a thin renderer.
  - Loads AccessGuard (`require('sorted')`), FirebaseAuth and ObservatoryTelemetry.
  - Does **not** load the Dr. Hex script, FluxCapacitor, ModuleProgress or AchievementManager.
  - No course links. The page must not name the AI button's filename anywhere, including comments (netfinal lesson).
- **Staff page:** `_app/houses/forge/md-100/exams/md100-final-results.html`, a parameterised copy of `network-plus/exams/network-final-results.html` (273 lines). It adds Restart, Mark narrative and CSV.
- **Hub:**
  - Add a new `checkpoint-section` "Final Exam" after the M11 card (`index.html` ~:676), mirroring :591-606.
  - Ship it as a non-clickable `div.checkpoint-card.is-upcoming` until the flip, with `data-module="forge-md100-final"`.
  - Add `'forge-md100-final'` to `MD100_REGISTRATIONS` (:875-890) for the orphan scanner.
  - Leave the 45-item counter (:835) unchanged. The grade lives server-side, and the comment should say so.
- **Catalog:** `ContentCatalog.js` entry after :3003: `{house:'forge', id:'forge-md100-final', components:['exam'], status:'coming-soon', href:'md-100/exams/md100-final.exam.html', category:'md-100', tags:['final','exam']}`.
- **Registry:**
  - Turn generator source 6 into `SERVER_EXAM_MODULES = ['functions/netfinal/netfinal-exams.js','functions/mdfinal/mdfinal-exams.js']`.
  - Regenerate, and add `forge-md100-final` to `_tools/content/registry-canaries.json` with provenance.
  - `completion-validation.test.js` must pass.
- **Tenant map:** not added (netfinal precedent; Q8).
- **Deploy order:** functions (callables + rules) → verify → hosting with the card still upcoming → operator dry run → flip card and catalog to available.

---

## 2. State model and action vocabulary

### 2.1 State, server-only

```
meta:      {studentId, examId, generatorVersion, seedStr*, devSeed*}      (* forbidden to client)
host:      {isoLibrary:[{file, os, build, editions[]}], switches:['External-LAN'],
            usb:{F:{label:'TECH-USB', files:{}}}}           // backup target for keys and EFS cert
vm:        {exists, name, generation:1|2, memoryMB, dynamicMemory, vcpu,
            vhdx:{sizeGB}, dvd:{iso|null}, secureBoot:{on, template:'MicrosoftWindows'|'MicrosoftUEFICA'},
            vtpm:false, bootOrder:[...], nic:{switch}, power:'off'|'on', checkpoints:[] (cut, see 5)}
disks:     [{n, sizeGB, role:'target'|'archive'|'pool', style:null|'GPT'|'MBR', canPool,
             partitions:[{type:'EFI'|'MSR'|'Basic'|'Recovery', sizeGB, letter, fs, label,
                          files:{path:{hash, acl, efs}}}]}]
             // the archive disk is pre-seeded with a file manifest + hashes (truth lives in key)
setup:     {screen:'lang'|'key'|'edition'|'eula'|'type'|'disk'|'copying'|null, labConfig:{BypassTPMCheck,...}}
os:        {installed, version, build, edition, installDisk, pendingReboot:[...],
            hostname:{effective, pending}, timezone, display:{res, scale},
            power:{plan, ac:{sleep, display}, dc:{sleep, display}},
            activation:{key, channel:'Retail'|'OEM'|'KMS'|'MAK', kmsHost, status},
            oobe:{done, accountPath:'msa'|'domain-join-instead'|'local', privacy:{...5}},
            updates:{history:[KB], pendingReboot, wufb:{featureDays, qualityDays, activeHours}},
            bcd:{ok}, drivers:{store:[{inf, provider, version, class}], devices:[{id, name, driver, status, code}]},
            startup:[{name, enabled}], tasks:[...], processes:[...], services:{name:{startType, state, logon}},
            systemFiles:{healthy, componentStoreHealthy},
            sysProtection:{C:{on, maxPct}}, restorePoints:[{name, seq}],
            apps:{installed:[{id, kind:'msi'|'appx', arch, props}], provisioned:[...]},
            perfmon:{collectorSets:[{name, counters, alerts:[{counter, op, value}]}]}}
identity:  {users:{name:{enabled, mustChange, neverExpires, groups:[...]}},
            groups:{name:{members:[]}}, uac:{consent, secureDesktop},
            membership:{type:'workgroup'|'domain', name, effective:true|false}}
network:   {adapters:{Ethernet:{dhcp, ip, prefix, gw, dns:[]}}, profile, hosts:[],
            firewall:{profiles:{Domain,Private,Public:{on}}, rules:[{name, dir, proto, port, profiles, remote, action, enabled}]},
            rdp:{enabled, nla}, smb1:false, shares:[{name, path, perms:[{principal, right}]}],
            vpn:[{name, server, tunnel, split, auth}], printers:[{name, port, driver}]}
security:  {bitlocker:{C:{status:'off'|'encrypting'|'on'|'suspended', method,
                         protectors:[{type, id}], backups:[{to:'AD'|'file', path}]}},
            efs:{certExported:[path]}, defender:{realtime, sigVersion, exclusions:[], lastScan}}
events:    [{t, kind, actor, detail}]   // the student's actions, server-built
eventlog:  [{log, id, source, level, msg, t}]   // the simulated Windows Event Viewer; faults write here
answers:   {fieldId: {value, at}}       // P8 only
faults*:   [{id, group, ticketId, applied, fixedAtEvent, undone}]   // never projected
baseline*: post-fault invariant amnesty (as netfinal)
```

**Frozen key (`answerKey`, built at start, deep-frozen, `netfinal-grade.js:33` pattern):**
- The WO values, the derived edition and channel, and the correct GVLK/MAK.
- The archive manifest hashes and the target disk number.
- The fault picks with their evidence ids and root-cause categories.
- Checks read the key for every trusted value. They never read `state.workOrder`, which exists only as a projection copy.

**Handover snapshot:** `snapshot = deepClone(state)` taken immediately before `faults.applyAtHandover`. P1-P6 are graded against it. If the student never hands over, P1-P6 are graded against the final state, P7 scores 0, and the P8 fault fields score 0. The brief states this.

**Boot model (`pc.boot`):**
- Gen1 VM plus Win11 ISO: setup refuses with the real generic "This PC can't run Windows 11", unless `labConfig.BypassTPMCheck/BypassSecureBootCheck` was set via Shift+F10 `reg add`. Allowing the real bypass makes the firmware checks genuinely failable.
- Secure Boot template `MicrosoftUEFICA`: the Windows image fails at firmware with "The image's hash and certificate are not allowed".
- No DVD in the boot order: "No operating system was loaded".
- BCD damaged: 0xc000000e, then WinRE after two failures.
- Boot-start filter driver fault: 0x7B loop, then WinRE.
- Otherwise: login, then the desktop.

**Reboot semantics.** Rename, domain join, updates, BitLocker start and drivers set `pendingReboot`. Effective fields change only on Restart. Checks read effective fields, and Settings shows a "Restart required" banner, which is real behaviour and not an oracle.

### 2.2 Action vocabulary by phase

GUI actions are written `window/action`. Every action is declared in `ACTION_SCHEMA`, and `schemaGaps()` must be empty. Commands are typed in the matching context. Every objective has at least one GUI path. A PowerShell/cmd path is required for: network, disk, activation, BitLocker and recovery.

**P1 Build and install**
- GUI:
  - `hyperv/new-vm{name, generation, memoryMB, dynamic, vcpu, vhdxGB, switch}`
  - `hyperv/settings{secureBoot, template, vtpm, dvdIso, bootOrder[]}`
  - `hyperv/start|stop|connect`
  - `setup/lang{lang, tz-format, keyboard}`, `setup/key{key|'none'}`, `setup/edition{edition}`, `setup/eula`, `setup/type{'custom'|'upgrade'}`
  - `setup/disk-select{disk, part}`, `setup/disk-new{disk, sizeMB}`, `setup/disk-delete|format{disk, part}`, `setup/install`
  - `oobe/region`, `oobe/keyboard`, `oobe/name{hostname}`, `oobe/path{'personal'|'work'}`, `oobe/signin-options{'domain-join-instead'}`, `oobe/account{name, password, questions}`, `oobe/privacy{location, findDevice, diagnostics:'required'|'optional', inking, tailored, adId}`
  - `settings/activation-change-key{key}`
- Commands:
  - Host: `New-VM`, `Set-VMFirmware -EnableSecureBoot -SecureBootTemplate`, `Enable-VMTPM`, `Set-VMDvdDrive`, `Start-VM`
  - Setup Shift+F10: `diskpart` (list/select disk/part, clean, convert gpt, create partition, assign, exit), `reg add HKLM\SYSTEM\Setup\LabConfig ...`
  - OS: `slmgr /ipk`, `/skms`, `/ato`, `/dlv`, `/xpr`; `winver`

**P2 Post-install**
- GUI:
  - `settings/rename{hostname}`, `settings/restart`, `settings/update-check|install`, `settings/display{res, scale}`, `settings/time{tz}`
  - `settings/power{plan, acSleep, acDisplay, dcSleep, dcDisplay}`
  - `printers/add{ip, driverInf}`, `printers/remove`
  - `taskmgr/startup-toggle{name}`
- Commands: `Rename-Computer`, `Restart-Computer`, `powercfg /change standby-timeout-ac|dc ...`, `powercfg /setactive`, `tzutil /s`, `Add-PrinterDriver`, `Add-PrinterPort`, `Add-Printer`, `pnputil /add-driver`

**P3 Identity**
- GUI:
  - `lusrmgr/user-new{name, mustChange, neverExpires}`, `lusrmgr/user-set{name, enabled, ...}`
  - `lusrmgr/group-new{name}`, `lusrmgr/group-add|remove{group, member}`
  - `uac/set{level 1..4}`
  - `sysprops/membership{type, name, user, password}`
- Commands: `New-LocalUser`, `Set-LocalUser`, `Disable-LocalUser`, `Add-LocalGroupMember`, `Remove-LocalGroupMember`, `net user`, `net localgroup`, `Add-Computer -DomainName|-WorkgroupName [-Restart]`, `Set-ItemProperty ...\Policies\System ConsentPromptBehaviorAdmin/PromptOnSecureDesktop`
- **Realism dependency:** `Add-Computer` fails ("domain could not be contacted") unless DNS points at the DC.

**P4 Network and sharing**
- GUI:
  - `ncpa/ipv4{dhcp, ip, mask, gw, dns1, dns2}`, `settings/net-profile{category}`
  - `wf/rule-new{name, proto, port, profiles[], remote, action}`, `wf/rule-delete|toggle`, `wf/profile-toggle`
  - `sysprops/remote{enabled, nla}`, `sysprops/remote-users-add{user}`
  - `explorer/share{path, name}`, `explorer/share-perm{principal, right}`, `explorer/ntfs{path, principal, right, inherit}`
  - `settings/vpn-add{name, server, tunnel, auth}`, `settings/vpn-split{name, on}`
  - `features/smb1{on}`
- Commands: `New-NetIPAddress`, `Remove-NetIPAddress`, `Set-NetIPInterface -Dhcp`, `Set-DnsClientServerAddress`, `Set-NetConnectionProfile`, `New-NetFirewallRule`, `Set-NetFirewallProfile`, `New-SmbShare`, `Grant-SmbShareAccess`, `Revoke-SmbShareAccess`, `icacls`, `Get-Acl`, `Add-VpnConnection -SplitTunneling`, `ipconfig /all`, `ping`, `nslookup`, `Test-NetConnection -Port`, `robocopy`/`Copy-Item` (archive to D:)

**P5 Storage and security**
- GUI:
  - `diskmgmt/init{disk, style}`, `diskmgmt/new-simple{disk, sizeMB, letter, fs, label}`, `diskmgmt/delete`
  - `storagespaces/pool-new{name, disks[]}`, `storagespaces/vdisk-new{pool, resiliency, letter, fs, label}`
  - `bitlocker/turn-on{drive, method, scope, backup:'AD'|'file', path}`, `bitlocker/suspend|resume|backup`
  - `explorer/advanced-security{path, disableInherit:'convert'|'remove', ace...}`, `explorer/efs{path, on}`, `certmgr/export-efs{path}`
  - `defender/realtime{on}`, `defender/update`, `defender/scan{type}`, `defender/exclusion-add|remove{type, value}`
- Commands: `Get-Disk`, `Initialize-Disk`, `New-Partition`, `Format-Volume`, `Get-PhysicalDisk -CanPool`, `New-StoragePool`, `New-VirtualDisk -ResiliencySettingName`, `manage-bde -on|-status|-protectors -add -tpm|-rp|-get|-adbackup`, `Enable-BitLocker`, `cipher /e`, `cipher /x`, `icacls /inheritance:d|r`, `Set-MpPreference -DisableRealtimeMonitoring`, `Add-MpPreference -ExclusionPath`, `Update-MpSignature`, `Start-MpScan`

**P6 Apps, updates, performance**
- GUI:
  - `apps/install-msi{path, props}`, `apps/uninstall{id}`
  - `settings/wufb{featureDays, qualityDays}`, `settings/active-hours{start, end}`
  - `sysprops/protection{drive, on, maxPct}`, `sysprops/restore-point{name}`
  - `perfmon/dcs-new{name, counters[]}`, `perfmon/alert-new{counter, op, value}`
- Commands: `msiexec /i <path> /qn PROP=val`, `Get-AppxPackage`, `Remove-AppxPackage`, `Remove-AppxProvisionedPackage`, `winget uninstall`, `reg add HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate ...DeferFeatureUpdatesPeriodInDays/DeferQualityUpdatesPeriodInDays`, `Enable-ComputerRestore`, `Checkpoint-Computer`, `logman create counter|alert`

**P7 Troubleshoot and recover (after handover)**
- GUI:
  - `winre/startup-repair`, `winre/startup-settings{option:'safe'|'safe-net'|...}`, `winre/system-restore{point}`, `winre/uninstall-update{'latest-quality'}`, `winre/reset-pc` (a destructive trap, see P7 grading)
  - `devmgmt/rollback|uninstall|disable{device}`
  - `services/set{name, startType, logon, password}`, `services/start|stop`
  - `eventvwr/query{log, id?, level?}`, `taskmgr/end{pid}`, `taskmgr/startup-toggle`
  - `taskschd/disable|delete{task}`, `settings/update-history-uninstall{kb}`, `explorer/restore-from{source, item}`
- Commands:
  - WinRE: `diskpart` (assign the EFI letter), `bcdboot C:\Windows /s S: /f UEFI`, `bootrec /rebuildbcd|/fixmbr|/fixboot|/scanos`, `bcdedit /enum`, `sc config <svc> start= disabled`, `reg load`
  - OS: `sfc /scannow`, `DISM /Online /Cleanup-Image /CheckHealth|ScanHealth|RestoreHealth`, `pnputil /enum-drivers|/delete-driver /uninstall`, `wusa /uninstall /kb:`, `Get-WinEvent -FilterHashtable`, `Get-Process`, `Stop-Process`, `Get-ScheduledTask`, `Disable-ScheduledTask`, `Get-Service`, `Set-Service`, `sc.exe config obj= password=`, `notepad C:\Windows\System32\drivers\etc\hosts` (editor), `ipconfig /flushdns`, `robocopy \\MER-BK01\nightly\... /COPY:DAT`

**P8 As-built record:** the window `asbuilt`. Fields are served by `actionSchema` and saved through `mdfinalAnswer`.

---

## 3. Objectives, points, partial credit, negatives

**Rules**
- Fractions are rounded to 0.01 (netfinal `totals`, `netfinal-grade.js:503`).
- **Every row below names its negative case. The test `mdfinal-negatives.test.js` drives each one** (honest run plus that one wrong action) and asserts:
  - that row drops below full;
  - every other row is unchanged.
- The ledger is derived from `CHECKS`, so a check without a negative fixture fails the suite.

### P1 Build and install (18) — syllabus objective 1

| id | Basis | Pass | Points | Negative case |
|---|---|---|---|---|
| 1.1 | snap | VM Gen2; Secure Boot on; vTPM on | 3 (1 each) | Gen1 plus LabConfig bypass = 0/3; Gen2 with TPM off plus BypassTPMCheck = 2/3 |
| 1.2 | snap | RAM, vCPU and VHDX size equal the WO (static memory if the WO says so) | 2 (thirds) | 4 GB when the WO says 8 |
| 1.3 | snap | `os.version` is Win11 build from the correct ISO (1); edition equals the derived edition (2) | 3 | Win10 ISO = 0/1; Home or Enterprise on a Pro profile = 0/2 |
| 1.4 | snap | Windows on the key's target disk; GPT with EFI+MSR+Basic(+Recovery); C: equals the WO size ±1 GB; the rest unallocated | 3 (1/1/1) | Installed on the archive disk; "Next" on whole unallocated space (C: too big) |
| 1.5 | snap | Archive volume present, label intact, every manifest hash equal to the key | 2 | Deleted or formatted in setup, or `diskpart clean` |
| 1.6 | snap | Local account exactly as in the WO via domain-join-instead/local; the 5 privacy toggles per WO | 2 (1 + 1×n/5) | Microsoft-account path; diagnostics "optional" |
| 1.7 | snap | Activation `Licensed`, channel per WO, key matches edition | 2 (1 + 1) | Retail decoy COA rejected; wrong `/skms` host leaves "Notification" |

### P2 Post-install (10) — objectives 1, 2, 5, 9

| id | Pass | Points | Negative case |
|---|---|---|---|
| 2.1 | Effective hostname equals the WO (case-insensitive) | 2 | Renamed but not restarted (pending); typo |
| 2.2 | Seeded latest CU in history, no pending reboot | 1 | Updates never installed |
| 2.3 | Printer queue on the WO IP with the WO x64 driver package | 2 (1 port, 1 driver) | Decoy universal or x86 driver |
| 2.4 | Display resolution and scale per WO | 1 | Scale left at 100% |
| 2.5 | Time zone per WO | 1 | Default Pacific on an Eastern WO |
| 2.6 | Power plan plus AC timeouts (1) and DC timeouts (1) per WO | 2 | DC values left at default |
| 2.7 | Seeded tray app disabled at startup; required entries untouched | 1 | Disabled the Defender tray / SecurityHealth |

### P3 Identity (10) — objectives 6, 7

| id | Pass | Points | Negative case |
|---|---|---|---|
| 3.1 | User exists, in Users and not Administrators, flags per WO | 3 (1 each) | Added to Administrators |
| 3.2 | Seeded group exists with exactly the WO members; user in Remote Desktop Users | 2 | Extra member; RDU skipped |
| 3.3 | UAC (ConsentPromptBehaviorAdmin + PromptOnSecureDesktop) equals the WO level | 1 | Never notify |
| 3.4 | Domain profiles: joined meridian.local, effective. Contractor: workgroup name exact. | 3 (joined-pending = 1) | Workgroup named "MERIDIAN"; joined but not restarted |
| 3.5 | Built-in Administrator and Guest disabled | 1 | Enabled Administrator to avoid prompts |

### P4 Network and sharing (14) — objectives 3, 9

| id | Pass | Points | Negative case |
|---|---|---|---|
| 4.1 | DHCP off; IP, prefix and gateway exact (mask must round-trip) | 3 (1 each) | Mask 255.255.255.0 on a /23 WO |
| 4.2 | DNS servers exact and in order | 1 | Reversed order, or 8.8.8.8 on a domain profile |
| 4.3 | Profile DomainAuthenticated (domain) or Private (workgroup) | 1 | Public |
| 4.4 | Inbound rule: proto/port (1), profiles exact with Public excluded (1), remote scope (1); all profiles firewall-on, else 0 | 3 | Rule on Any profile; firewall turned off |
| 4.5 | RDP on with NLA (1); WO user allowed via RDU and not admin (1) | 2 | NLA off |
| 4.6 | Share exists; computed effective network access: WO group Modify, other test principal none, Everyone absent | 2 | Everyone Full Control at share level |
| 4.7 | VPN profile name, server, tunnel type, split tunnel per WO | 2 (n/4) | Split tunnel set on a WO that forbids it |

### P5 Storage and security (16) — objectives 2, 7, 9

| id | Pass | Points | Negative case |
|---|---|---|---|
| 5.1 | D: on Disk-target free space, NTFS, WO label, uses all remaining space | 2 | D: created on the archive disk; size half |
| 5.2 | Pool of exactly the two blank disks (1); vdisk resiliency per WO (1); volume letter/fs/label (1) | 3 | Simple resiliency |
| 5.3 | BitLocker C: protection On and fully encrypted (1); TPM protector (1); RecoveryPassword (1); method equals WO (1); backup to the WO location (1) | 5 | Suspended; AES-CBC; key saved to C: (real refusal); never backed up |
| 5.4 | Confidential folder: inheritance disabled; effective access WO group Read&Execute, Users none, Administrators/SYSTEM Full | 3 (1 per principal test) | Users left with Read |
| 5.5 | EFS on the WO file for the WO user, plus the cert exported to F:\ | 1 (0.5 + 0.5) | Encrypted, no cert backup |
| 5.6 | Real-time on and signatures updated (1); exclusion exactly the WO path, nothing broader (1) | 2 | Excluded `D:\` |

### P6 Apps, updates, performance (8) — objectives 4, 5, 8

| id | Pass | Points | Negative case |
|---|---|---|---|
| 6.1 | LedgerSync x64 MSI installed (1) with `SERVER=` equal to the WO (1) | 2 | x86 MSI; property omitted |
| 6.2 | Seeded unwanted app removed (per-user and provisioned); keep-list intact | 1 | Removed Calculator or Company Portal from the keep list |
| 6.3 | Feature days, quality days and active hours per WO | 2 (thirds) | Quality deferral 30 |
| 6.4 | System Protection on C: and the WO-named restore point exists | 1 | Protection off |
| 6.5 | Perfmon alert on the WO counter, operator and threshold | 2 (1 counter, 1 threshold) | Threshold 80 when the WO says 90 |

### P7 Troubleshoot and recover (14) — objectives 8, 5, 2

There are two faults, each worth 7:
- **Resolved (4):** `fixed(final)`. `fixed` is evaluated "after next boot": persistence points are cleared and boot reaches the desktop.
- **Method (2):** a root fix rather than a workaround.
- **No regression (1):** the set of P1-P6 config the fault did not touch is equal between the snapshot and the final state.
- **Design rule:** every fault targets something that exists regardless of what the student completed in P2-P6. `mdfinal-faults.test.js` applies every fault to a "P1-only" snapshot and proves it fixable.

**Group B: boot and recovery (one seeded)**

| Fault | Symptom and evidence | Full method (2) | Partial or zero |
|---|---|---|---|
| B1: boot-start filter driver from a "backup agent" | 0x7B loop, then WinRE; System log 7026 / 7000 in Safe Mode | Safe Mode → uninstall the agent, `pnputil /delete-driver /uninstall`, or `sc config start= disabled`; System Restore to the P6 point also counts | Reset this PC = 0, and regression fires |
| B2: BCD corrupt | 0xc000000e; SrtTrail shows "Boot configuration data store is corrupted"; Startup Repair fails | `bcdboot C:\Windows /s S: /f UEFI` after assigning the EFI letter, or `bootrec /rebuildbcd` | `bootrec /fixmbr` has no effect; Reset this PC = 0 |
| B3: bad quality update KB (seeded number) breaks Start/Explorer | Application 1000 faulting module; update history shows the KB | `wusa /uninstall /kb:N`, Settings uninstall, or System Restore | sfc-only does nothing |

**Group S: system, service, data (one seeded)**

| Fault | Symptom and evidence | Full method (2) | Partial or zero |
|---|---|---|---|
| S1: component store corruption | `sfc` reports "unable to fix some"; CBS log | `DISM /RestoreHealth` before a final successful `sfc /scannow` (event-log order) | `sfc` alone never fixes |
| S2: "VPN helper" changed DNS and added a stale HOSTS entry for the file server | `nslookup` vs `ping` disagree; hosts file | Remove the hosts line and restore the WO DNS (`/flushdns` optional) | Hosts fixed only = resolved false |
| S3: runaway startup app plus scheduled task | 100% CPU in Task Manager; Reliability Monitor | End the process, disable the startup entry **and** the task, or uninstall | End the process only: returns at next boot, so resolved false. Disabling SysMain or Windows Search (decoy high disk) breaks the no-regression point. |
| S4: user deleted a workbook from Documents | Ticket names "Tuesday's version"; backup share has 3 dated versions | Restore that one file from `\\MER-BK01\nightly\<host>\` with the Tuesday hash | Wrong date = resolved false; restoring the whole folder over newer files = regression |

### P8 As-built record (10) — SLO6, documenting complex configurations

These are closed lists or strongly normalised typed values. **No free text feeds an exact comparison.**
- Truth is the server's snapshot (fields A1-A5) or the fault key (A6-A8), computed at grade time.
- Documentation is graded for accuracy against what is actually on the PC, not against the WO.

| id | Field | Input | Points |
|---|---|---|---|
| A1 | Installed edition | select (Home/Pro/Education/Enterprise/Pro Education) | 1 |
| A2 | Activation channel | select (Retail/OEM/MAK/KMS client) | 1 |
| A3 | IPv4 address/prefix | two fields, NORM.ipv4 + int | 1 (0.5 each) |
| A4 | BitLocker recovery-password protector ID, first 8 hex characters (blank when BitLocker is off) | typed, `/^[0-9a-f]{8}$/i` | 1 |
| A5 | Storage Spaces resiliency | select | 1 |
| A6, A7 | Per ticket (keyed by the ticket's random id): root-cause category | select from 8 categories (driver, boot configuration, update, system file corruption, name resolution, persistence/startup, data loss, hardware) | 1 + 1 |
| A8 | Per ticket: the evidencing event ID or stop code | typed; hex or int normalised; graded against the fault's evidence set | 0.5 + 0.5 |
| A9 | Handover record per ticket (operator decision 2026-11-03: auto-graded, no instructor marking): `verifiedBy` select (reboot test / Event Viewer recheck / service status / file hash compare / connectivity test / none) graded against the evidence the student's own event log shows (1 per ticket x 0.5), and `changesMade` multi-select from a closed list of change categories graded as exact set against the server's recorded fix actions (0.5 per ticket) | 2 |

**Totals:** P1 18 + P2 10 + P3 10 + P4 14 + P5 16 + P6 8 + P7 14 + P8 10 = **100**, all auto-graded (no instructor-marked items).

**Collateral.** This applies only to bad states that no row grades directly, and it deducts within its phase with a floor of 0:
- P3 −1: any additional local admin.
- P4 −1: SMB1 enabled.
- P4 −1: any share with Everyone Full Control.
- Each is evaluated on the snapshot. The fault catalog's own changes have amnesty, as netfinal's baseline does.

**Gating**
- P1 must reach the desktop before any OS window opens; the server's `screenAllows` enforces this.
- P2-P6 can be done in any order. Real dependencies are enforced by the simulation, not by gates: the join needs DNS, BitLocker's TPM protector needs a vTPM, D: needs free space.
- Handover is one-way and confirmed twice: "Phases 1-6 are recorded as they stand now".
- P8 is editable until submit.
- The brief recommends handing over with at least 35 minutes left. The header shows the server clock.

---

## 4. Anti-cheat, leak analysis, tests

### 4.1 What reaches the client

**Sent:**
- `toInitialState`, a whitelist: WO prose and values, the ISO library list, screen id, VM summary, the clock, counts.
- Window views (data only, plus `_actions`), command text, action results, and ticket text after handover.
- The student's own saved P8 values on resume.
- After submit, `studentReport`: total, outOf, pending and phase totals only.

**Never sent:**
- `answerKey`, `faults`, `snapshot`, `baseline`, `seedStr`/`seed32`, profile id, derived edition or channel, GVLK choice, manifest hashes, `fixedAtEvent`, `amnesty`, `variantSpace`.
- These are the `FORBIDDEN_KEYS`, plus `profile`, `expectedEdition`, `expected*`, `key*`.
- `FORBIDDEN_PATTERNS`: fault ids `/\bmdf-[bs]\d\b/i`, `/\bvariant\b/i`, profile codes `/\b(?:CORP-FIN|CORP-SEC|CONTRACTOR)\b/`.
- `STUDENT_AUTHORED_FIELDS`: `answers`, `note`, account and VM names the student typed. This follows netfinal's lockout lesson (`netfinal-client.js:160-195`).
- Refusal messages must name no token (the netfinal refusal-leak lesson, `netfinal-exam.js:262-296`).

### 4.2 Oracle risks and how each is handled

| Risk | Handling |
|---|---|
| Setup's hardware gate reveals pass/fail on TPM/Secure Boot | This is real Windows behaviour. Weight is 3 points, and the LabConfig bypass keeps it failable. |
| `slmgr` errors reveal key/edition mismatch | Real behaviour. It confirms the key, not the edition requirement (1.3 is separate). |
| Domain join failure reveals DNS | Real behaviour, and it is the lesson. |
| The page shows no objective ticks, no progress per check, no "Correct" text | Enforced by the page test, which greps for those strings and classes. |
| Per-check results after submit | Aggregates and phase totals only (`studentReport` copy). Staff-only restart means no resubmission loop. |
| P8 save replies | Only `{saved, answeredCount}`, never correctness. |
| Event Viewer and evidence | Show symptoms by design. Fault ids never appear. |
| Shared answers | Seeded values per student. Edition is shared within a profile (stated residual). |

### 4.3 Replay, state and time

- Every callable takes a `sessionId` derived from auth, plus a line or params. **Nothing accepts a state blob.**
- `withSession` compare-and-set uses `sameSitting` (exists + rev + startedAt).
- Start is create-if-absent. Submit and handover are idempotent.
- Writes after submit are refused. The engine clamps duration, and expiry auto-submits.
- `own()`/`setOwn()` are the only path for client keys (windows, actions, field ids, user/group/share/service names).
- A runtime prototype sweep drives every entry point with `__proto__`, `constructor` and `prototype` as every key, then compares the shared prototypes before and after (netfinal leak section 6 pattern).

### 4.4 Required tests

All live in `_tools/mdfinal/`, need `git add -f`, and are scored by exit code. Each critical guard is mutation-tested.

1. **`mdfinal-core.test.js`**
   - Byte-identical state and key for the same seed; 1000 seeds valid (no address collision, target ≠ archive).
   - The whole variant space is reachable: all 3 profiles × 12 fault pairs drawn naturally, with a count asserted from `variantSpace()`, never from prose.
   - The secret is required (`failed-precondition` without it).
2. **`mdfinal-pc.test.js`**: the boot outcome table; reboot semantics; effective-access computation; mask round-trip.
3. **`mdfinal-shell.test.js` / `mdfinal-gui.test.js`**
   - Every command and action changes the output it should (golden before and after).
   - `schemaGaps()` is empty.
   - Every objective is reachable by GUI, and the core ones by PowerShell.
4. **`mdfinal-faults.test.js`**, for each of the 7 faults:
   - evidence present;
   - `fixed` false at handover and true after the canonical repair;
   - each wrong fix leaves it false or trips no-regression;
   - fixable from a P1-only snapshot.
5. **`mdfinal-negatives.test.js`**
   - The derived ledger: every `CHECKS` row has a negative fixture that lowers that row and only that row, across 3 seeds per profile.
   - "Do nothing" scores 0. "Submit immediately" scores 0. "Install only, then hand over" leaves P7 still earnable.
6. **`mdfinal-grade.test.js`**
   - Determinism: the same session graded twice, and after a JSON round-trip through the Firestore serializer, gives identical reports.
   - The key is frozen (a mutation throws). Partial-credit arithmetic. Narrative pending.
   - **The perfect run answers P8 from STATE READS through the shell, not from the key**, so a wrong key would be detected (netfinal "answered from the key" lesson).
7. **`mdfinal-walkthrough.js --qc N` and `--student <uid>`**
   - The completability QC sits N synthetic students through the real modules: **all 36 profile × fault classes forced, plus 300 random seeds, each 98/100 + 2 pending.**
   - `--student` prints one student's key and repair steps for `~/hexworth-shared/Solutions/MD-100/`. The operator runs it with the secret.
   - Repair recipes live in a shared `mdfinal-repairs.js` so the suite and the key document cannot drift.
8. **`mdfinal-adversarial.js`**: named cheats must FAIL:
   - forged `examId` / `minutes` / `sessionId` / `uid` (self-reset);
   - `window:'constructor'`, `action:'__proto__'`;
   - state fields in params;
   - double submit and racing submit;
   - writes after submit or expiry;
   - LabConfig bypass costs 1.1;
   - "Reset this PC" clears the fault but loses the regression point plus method;
   - restoring the whole folder for S4;
   - ending the S3 process only;
   - P8 brute force on selects gets no feedback until submit.
9. **`mdfinal-leak.test.js`**
   - Scan the start, resume and submit **envelopes** (not only the projector).
   - Every window across all 7 faults forced and the 3 profiles. Every action return. Fuzzed output of every command. Thrown error messages.
   - Each scan carries a could-this-have-failed guard: the sweep must reach the fault-emitting branches, and the untrimmed report must still disclose.
   - The callable ledger is derived from the `mdfinal*` exports of `functions/index.js`.
10. **`mdfinal-results.test.js`**: loads the real `functions/index.js` with firebase stubbed and an in-memory Firestore (netfinal-results pattern):
    - The grade is recorded only to assigned, staff-owned classes; failures are recorded.
    - Newer over older; results and marking are staff only.
    - **A student calling `mdfinalReset` on themselves gets `permission-denied`.**
    - Rules text denies both collections.
11. **`mdfinal-page.test.js` + `mdfinal-render.test.js`** (headless Chrome over a memoryStore bridge):
    - Every callable is reached; every `_actions` form renders.
    - No Dr. Hex script, no course links, no `ModuleProgress`/`completeQuiz`/`localStorage` grading.
    - Start runs after auth resolves. Resume restores P8 answers. One "answered" definition.
    - The staff-only control is hidden by **computed style**, not by an attribute.
    - The CSS classes used are defined (comments stripped first).
12. **Registry:** `completion-validation.test.js` and the canaries include `forge-md100-final`.

---

## 5. 14-day plan

Day 1 = Tue 2026-11-04. Gates: Nancy (adversarial review), Mallory (attacker), Chris (purpose and quality bar), and decisions by the four-way vote.

| Day | Work | Gate |
|---|---|---|
| D1 | Operator answers to section 6. Four-way vote on this spec. Scaffold `functions/mdfinal/`: exams, core generator, frozen key, determinism tests | Vote |
| D2 | `pc.js` boot model, VM/firmware, setup/OOBE state machine, disks; P1 actions, setup-cmd and diskpart contexts; P1 checks with negatives | |
| D3 | P2 and P3: reboot semantics, updates, printer, power/display/timezone, users/groups/UAC, join with DNS dependency; checks with negatives | |
| D4 | P4 and P5: IP/DNS/profile, firewall, RDP, share and NTFS effective access, VPN; disks, Storage Spaces, BitLocker, EFS, Defender | |
| D5 | P6; handover snapshot; fault engine end to end with B2 and S1; grader; P8 schema; `walkthrough --qc 3` | |
| D6 | B1, B3, S2, S3, S4. Session service. Callables, `makeExamStore`, `recordExamGrade`, rules. Results test; leak suite | |
| **D7** | **SCOPE CHECKPOINT.** Bar: `--qc` 36 classes + 300 seeds at 98/100; negatives ledger complete; leak and adversarial green. Nancy R1 and Mallory R1 on engine and callables. Four-way vote on cuts. | Nancy, Mallory, vote |
| D8 | Page: thin renderer reusing m01-sim CSS and screens (edition, UEFI, partition, wizard) and midterm-sim views (Settings, Users, Network, Disk, Explorer, terminal) with all checks stripped. Setup/OOBE screens and desktop | |
| D9 | Page: windows from `_actions`, WinRE, P8 form, review/submit, resume; page and render tests | |
| D10 | Results page; hub card (upcoming); catalog; registry source 6 and canary; Solutions key doc. Nancy R2 (page), Mallory R2 (Network tab, live-shape callables). **Feature freeze** | Nancy, Mallory |
| D11 | Chris QC with evidence (qc output, negatives matrix, render screenshots). With operator authorisation: deploy functions and rules, then hosting with the card still unlinked. **Operator dry run in production via the direct URL** on their own account, timed | Chris PASS, operator go |
| D12 | Fix dry-run findings. Nancy final. Re-record Chris PASS. Staff reset of the dry-run sitting (archived) | Nancy, Chris |
| D13 | Flip the card to an anchor and the catalog to available (hosting deploy). Instructor assigns `forge-md100-final` in the class (needed for the gradebook write) | Operator go |
| D14 | Buffer / sitting. Post-sitting: grade pass, mark narratives, CSV | |

**Cut order if behind at D7.** Cuts happen in this order and never touch server grading, the leak, negatives or completability suites, one attempt, aggregates-only reporting, or lockdown:
1. VM checkpoints (already excluded).
2. Perfmon alert (6.5): move the 2 points to S3 evidence.
3. VPN (4.7): give the points to 4.4.
4. EFS cert backup (5.5).
5. Narrow PowerShell parity to network, disk, activation, BitLocker and recovery.
6. Fault catalog down to B2/B3 × S1/S3 (4 combinations, still seeded).
7. Hyper-V build screen replaced by a preset VM with firmware toggles only. 1.1 and 1.2 become "fix the VM settings".

Points are re-weighted only by a four-way vote, and the total stays 100.

---

## 6. Open questions for the operator

1. **Sitting date and length.** The default is 150 minutes, server-set (max 240). Is it in-class or open window? Are per-student accommodations needed? The latter needs a staff-only duration override; it is not built yet.
2. **Target platform.** The default is a Hyper-V Gen2 VM built by the student, per the proposal. The alternative is a physical PC: UEFI setup plus a bootable-USB (Rufus GPT/MBR) step, where the m01-sim screens fit more directly.
3. **Restart policy.** One attempt with staff-only restart is assumed. On a staff restart, should the student get the same lab (default, matches netfinal and keeps the key valid) or a fresh seed?
4. **Post-submit view.** The default is total plus phase totals. Per-objective results are possible because there is no self-restart, but a staff restart onto the same lab would make them an oracle.
5. **Instructor-marked note (A9, 2 points).** Keep it, or replace it with an auto-graded field?
6. **Allowed resources.** Open notes? Microsoft Learn? The in-exam GVLK reference table is planned to be provided.
7. **Seed secret.** Reuse `NETFINAL_SEED_SECRET` with `|mdfinal|` domain separation (default; no new secret, no all-functions deploy risk), or create `MDFINAL_SEED_SECRET`? The second needs your `firebase functions:secrets:set`; I must never see the value.
8. **Tenant map.** Leave the final out of `_app/tenant/*` (netfinal precedent)?
9. **Make-up sitting.** Should a second exam id (`md100-final-2026-makeup`) exist now?
10. **Gradebook.** Does the 20% weight get applied in Blackboard from the results-page CSV? Confirm that the class exists in `classes/*` with a staff `handlerUid` and all students as members, or the server write skips them, visibly.
11. **Profile mix.** Is it acceptable that roughly a third of students get the workgroup (Contractor) profile, so no domain join? It still exercises objective 6 through workgroup configuration.

---

### Critical Files for Implementation
- /home/eq/ai-content/hexworth-prime/functions/netfinal/netfinal-exam.js
- /home/eq/ai-content/hexworth-prime/functions/index.js (netfinal block :11118-11585; new mdfinal block after it)
- /home/eq/ai-content/hexworth-prime/functions/netfinal/netfinal-gui.js (dispatch and ACTION_SCHEMA pattern :520-731)
- /home/eq/ai-content/hexworth-prime/functions/netfinal/netfinal-client.js (projection and disclosure scanner pattern)
- /home/eq/ai-content/hexworth-prime/_tools/content/gen-completion-registry.js (source 6 at :562-568)
- /home/eq/ai-content/hexworth-prime/_app/houses/forge/md-100/labs/forge-md100-midterm-sim.lab.html and /home/eq/ai-content/hexworth-prime/_app/houses/forge/md-100/labs/forge-md100-m01-sim.lab.html (UI to reuse, logic to discard)
- /home/eq/ai-content/hexworth-prime/firestore.rules (:338-362)


---

## 7. Operator decisions (2026-11-03)

- Sitting: **2026-11-19, in class, 150 minutes**, server-enforced.
- Platform: **student-built Hyper-V Gen2 VM** (Phase 1 as specified).
- Restart: **staff-only, same lab** (seed unchanged, clock reset).
- A9: **auto-graded** structured fields instead of an instructor-marked note (section 3, P8). `mdfinalMarkNarrative` is therefore not built.
- Defaults accepted for the remaining open questions: totals + phase totals after submit; GVLK table provided in-exam; reuse `NETFINAL_SEED_SECRET` with `|mdfinal|` separation; no tenant map; no make-up exam id yet (can be added later as a second allowlisted id); gradebook via the results-page CSV, with the class required to exist in `classes/*` with a staff handler; ~1/3 Contractor (workgroup) profile acceptable.
