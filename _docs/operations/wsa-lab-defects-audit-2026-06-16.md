# WSA Lab Defects Audit

*Status: findings only, no code changed. Date: 2026-06-16. Source: surfaced while authoring the WSA per-module lab walkthroughs (faculty answer keys) directly from each lab's source.*

## TLDR

Authoring walkthroughs for all 19 WSA modules' GUI + PowerShell labs (by reading the
actual completion/validator code) surfaced a large set of grading defects in the
student-facing labs. The single highest-impact issue is a **PSTerminal parameter-casing
bug** that silently fails correct student commands across the PowerShell labs. The rest
fall into: validators accepting wrong/dangerous answers, objectives that do not fire on
the action the task describes, dead/undefined UI controls, and hint/state mismatches.
None of these were caught by EduScan (the labs are simulation modules, not BoxEngine
boxes). The walkthroughs document the intended answers and flag the leniency; this doc is
the consolidated fix list. Labs live at `_app/houses/cloud/modules/wsa/m{NN}-*/cloud-{guilab,pslab}.module.html`.

## Cross-cutting (fix once, fixes many)

### C1 — PSTerminal parameter-casing silent failure (HIGH, student-impacting NOW)
`PSTerminal._parseCommand()` normalizes a parameter name as
`rawName.charAt(0).toUpperCase() + rawName.slice(1)` — it upper-cases only the FIRST
character. So an all-lowercase parameter `-startrange` becomes key `Startrange`, not the
`StartRange` the cmdlet handler reads. The parameter is silently dropped; the student
gets a "required parameter" error or a default-substituted result with no indication that
**case** is the cause. All-lowercase parameter typing is normal muscle memory (real
shells tab-complete the casing; the simulator does not).
- **Confirmed to BLOCK credit:** M08 (`-IPv4Address`), M09 (all 5 DHCP cmdlets), M14
  (`New-NetFirewallRule -displayname`, `New-NetNat -internalipinterfaceaddressprefix`),
  M15 (`New-ADReplicationSiteLink -sitesincluded`).
- **Fix:** normalize parameter keys to true PascalCase (or look them up case-insensitively
  against the handler's expected names). One change in PSTerminal fixes every PS lab.

### C2 — Pervasive validator leniency (MED, grading integrity)
Most labs credit a task on a loose match (base cmdlet name only, a substring, or a catchall
branch) rather than the intended action. A student can earn credit with the wrong object,
the wrong value, or no value. Per-task specifics are in the table below. Decide whether
assessed labs should require the correct answer; if so, tighten the validators.

### C3 — Dead / unreachable code and undefined controls (MED)
Several UI controls and code branches can never do what they imply (see M01, M08, M17, M19).
These mislead students and faculty. Remove or wire them up.

### C4 — Hint / state mismatches (MED)
Several sidebar hints reference objects, DNs, or hostnames that don't exist in the lab's
actual state (M02, M06, M07, M16). Harmless for completion today (validators don't check
the value) but they teach wrong specifics and break if validators are tightened.

## Per-module findings

| Module | Lab | Severity | Defect | Suggested fix |
|---|---|---|---|---|
| M01 | GUI T3 | LOW | `SVR/DC/SRV` name checks are dead code; any name change completes (catchall `!== 'WIN-SRVR2022'`) | Check for the intended name if graded |
| M01 | PS | MED | Install-Feature accepts `-name` (any value), dns, ad-domain; Restart-Service any param; Rename-Computer any non-empty name | Validate intended feature/name |
| M02 | GUI | MED | OU validator matches any name containing `"it"`; create-user/add-member fire unconditionally; **Unlock-Account is a no-op — only Reset Password credits T5** | Match intended OU; require own objects; credit Unlock if intended |
| M02 | PS | MED/LOW | Several tasks check base cmdlet only; group scope/category unchecked; SearchBase DN unchecked. **Hint says `OU=IT` but GUI creates `IT Department`** | Tighten validators; fix hint DN |
| M03 | GUI | LOW/MED | Format accepts any volume; T2 online-state UI quirk (`OperationalStatus` set but `IsOffline` not cleared → context menu still shows "Offline") | Target a specific volume; clear `IsOffline` on init |
| M03 | PS | MED | T3 hardcodes drive `E:` on `-AssignDriveLetter`; `-DriveLetter F` breaks T4; New-SmbShare accepts any path | Honor specified letter; or warn in hint |
| M04 | GUI T4 | HIGH | **"Shut Down" (`shutdownVM`) does NOT fire the stop objective — only "Turn Off" (`stopVM`) does**, despite both reaching Off state | Fire `stop-vm` from `shutdownVM` too, or clarify task |
| M05 | GUI | MED | T6 Remove works on running containers via context menu (no status guard); T7 Inspect is context-menu-only and T6 can block T7 | Guard Remove; add Inspect fallback |
| M05 | PS T14 | HIGH | **`docker compose` (space form) fails — only `docker-compose` (hyphen) credits**; tasks 3/6/8-11 subcommand-only | Accept both forms |
| M06 | PS T14 | MED | Hint references non-existent group `SQL-AG` / `NODE02` (actual: `SQL-VM-01/02`, `FileServer`, `NODE1/2/3`) | Fix hint to real state |
| M07 | GUI | MED | T1 not credited on init (must click System); single row-click double-completes T3+T8; "Errors Only" filter is log-agnostic | Credit T1 on first view; separate T3/T8 |
| M07 | PS | LOW | Get-WinEvent variants are distinct objective IDs (error-filter variant doesn't credit T1); `DC02` hint not in state | Note in hint |
| M08 | GUI T6 | LOW | `createReverseZone` else-branch catchall — any 3-octet network completes; `10.0.0` check inert | Validate intended network |
| M08 | PS T3 | HIGH | `-ipv4address` (lowercase) → key `Ipv4address` mismatch → error path (C1) | Fix C1 |
| M09 | PS | HIGH | All 5 DHCP cmdlets fail on lowercase params (C1) | Fix C1 |
| M10 | GUI | MED | obj4 + obj7 permanently coupled — one Add fires both ('Authenticated Users' not in dropdown), can't complete separately | Decouple |
| M10 | PS | MED | `Get-GPOReport -ReportType` silently dropped (`params.Reporttype` never read) | Read the param |
| M11 | GUI | HIGH | **obj4/obj8 silent failure when no site selected** — `saveAuthentication`/`saveDefaultDocuments` guard `if(site)`, modal closes with no save and no warning | Add a "select a site" guard/alert like obj7/9 |
| M11 | PS T5 | MED | `Set-WebConfigurationProperty` catchall — any params completes T5 (the auth-specific branch is never entered with named-param form) | Match the auth filter |
| M12 | PS T3 | MED | `New-RDRemoteApp -CollectionName "Sales"` before T2 creates Sales → "not found", no credit; no UI ordering cue | Add ordering hint/guard |
| M13 | PS T2 | MED | `Get-Certificate` without `-Template` renders plausible output but doesn't credit (likely confusion point) | Clarify or credit listing separately |
| M14 | PS | HIGH | T3 (`New-NetFirewallRule -displayname`) + T5 (`New-NetNat -internalipinterfaceaddressprefix`) silently fail on lowercase (C1) | Fix C1 |
| M15 | PS T4 | HIGH | `New-ADReplicationSiteLink -sitesincluded` silently fails on lowercase (C1) | Fix C1 |
| M16 | PS T2 | MED | `new-wbbackuptarget` objective ID not in the objectives list (no-op); only `add-wbbackuptarget` credits, with enforced T1 + New-WBBackupTarget prerequisites | Register the objective or update hint |
| M17 | GUI | MED/HIGH | obj3 only via `createRule` `if(port)` (Port Exception button → obj8 not obj3); **obj9 table-render is unreachable dead code** (`connectionSecurityRules` never initialized); **outbound rows have no click handler** (can't complete obj5 there) | Wire handlers; init array or remove |
| M17 | PS T4 | HIGH | `Set-NetFirewallProfile` validator fires on ANY invocation **including disabling the firewall** (`-Enabled False`) | Require enable + intended profile |
| M18 | GUI T3 | MED | **`runScript()` doesn't read the textarea** — hardcoded output; erase the whole script and it still passes | Evaluate/inspect submitted script if graded |
| M18 | PS | LOW/MED | T8 `ErrorActionPreference` substring match (bare read credits without setting "Stop"); T13 `icm` alias not expanded (silent fail) | Match assignment; expand aliases |
| M19 | GUI T5 | HIGH | **"Backup Once…" toolbar button calls undefined `showBackupOnce()` — does nothing**; real control is the Start Backup card button | Define the function or remove the button |

## Course-level findings (sims / gauntlets / review)

| Artifact | Severity | Defect | Suggested fix |
|---|---|---|---|
| Midterm: Outpost (`midterm-outpost/cloud-simulation.module.html`) | HIGH | Objective n4 (scope gateway/DNS) has **no GUI remediation path** — a student who leaves them blank can't fix it via GUI (only PowerShell `Set-DhcpServerv4OptionValue` or delete/recreate) | Add an "Edit Scope" dialog |
| Midterm: Outpost | LOW | s4 credited by any command containing `vssadmin` (read-only `vssadmin list shadows` counts); f3 domain check is case-sensitive (`=== 'hexworth.local'`) | Tighten if graded |
| Skills Gauntlet (`gauntlet/cloud-gauntlet.module.html`) | HIGH | `ad-08` (add jsmith to Branch_Admins) is **unsatisfiable via the GUISimulator ADUC path** — `syncWSAStateToGauntlet()` writes the CN display name ("John Smith") not the SAM (`jsmith`) the validator checks. Students using that path get silently stuck | Map CN->SAM in sync, or instruct students to use the inline AD console |
| Advanced Gauntlet (`gauntlet-advanced/cloud-gauntlet-advanced.module.html`) | MED | `fix-07` (broken DiskOnly quorum) and `bt-cls-05` (set NodeMajority) validate the same state field — completing the routine task auto-grants the troubleshooting fix-bonus; can't distinguish skill from routine | Separate state fields or a fix-flag |
| Review (`reviews/cloud-wsa-review.module.html`) | HIGH | Two explanation/correct-index mismatches: **DNS-300** (`correct:2` but explanation describes option 1) and **SR-300** (`correct:2` but explanation describes option 1). Students who answer "correctly" see an explanation arguing the other option | Flip `correct` or rewrite the explanation to agree |

## Quiz answer-key findings

Quiz keys live server-side in `functions/quiz_keys.json` (seed for Firestore `quiz_keys/{id}`), not in the quiz HTML. Building the M02-M16 solution keys surfaced:

| Quiz | Key | Finding |
|---|---|---|
| M09 DHCP | `[1,1,1,1,1,1,1,1,1,1]` | All-index-1 — matches the known placeholder pattern; carries `orphan: true` (Task #85, 2026-05-12). Index 1 happens to be substantively correct on all 10 on review, so it may be deliberate. **Re-verify against authorial intent before grading; redistribute on next revision.** |
| M16 Backup/Recovery | `[1,1,1,1,1,1,1,1,1,1]` | Same all-index-1 position bias; answers verified substantively correct. Runtime shuffle hides the bias from students, but redistribute on next revision. |
| M02 Active Directory | `[1,1,1,1,1,2,1,1,2,2]` | 7/10 at index 1 — mild concentration, not a mechanical cycle; answers correct. |
| M15 AD Sites | `[1,1,1,1,2,1,1,1,1,2]` | Carries a prior `orphan` flag but the key is confirmed active. |

These are answer-distribution / stale-flag concerns, not wrong answers (each was verified correct). Tracked alongside [[project_placeholder_keys_audit]].


### C5 — `Set-NetFirewallProfile -Enabled` bare switch crashes (M17, pre-existing)

`PSTerminal.js` `_cmdSetNetFirewallProfile` (~line 8674) calls `params.Enabled.toLowerCase()` guarded only by `!== undefined`. If a student types `-Enabled` with no value (bare switch), `params.Enabled === true` and `.toLowerCase()` throws. Found by Nancy during the C1 fix; predates it. Fix: guard for boolean / coerce. (C1 case-insensitive parsing shipped 2026-06-17.)

## Recommended fix order

1. **C1 — PSTerminal parameter casing** (one change, unblocks correct answers across all PS labs; students are hitting this now).
2. **HIGH dead/undefined controls** that strand students: M19 "Backup Once…" undefined function, M11 silent auth-save failure, M17 unreachable obj9 / dead outbound rows.
3. **HIGH objective-misfires:** M04 "Shut Down" not crediting, M05 `docker compose` form, M17 firewall-disable accepted.
4. **MED leniency / hint-mismatch** pass per C2/C4 if assessed-grading accuracy is desired.

(Each item above is also documented inline in the corresponding `WSA-M{NN}-*_WALKTHROUGH.md` so faculty grading from the keys see the leniency in context.)
