# Security+ Cert Prep Center — Arena Box System

*Live as of 2026-06-21*

---

## TLDR

The Security+ hub at `_app/houses/shield/security-plus/index.html` hosts 9 engine-driven arena boxes — real terminal and SOC-tool investigation environments where students discover indicators of compromise and submit them as flags. All 9 boxes replaced legacy quiz-style `.lab.html` pages in the same hub section.

**State:** All 9 boxes are LIVE in production. Flags are seeded in Firestore `flag_registry/`. Server-side validation is active via the `validateFlag` Cloud Function (`functions/index.js:164`). Hub completion tracking reads `localStorage[storageKey].completed` for all arena-box manifest items.

**Audience for this doc:** Hexworth engineers and content authors who will add new arena boxes to this hub or replicate the pattern for other cert hubs.

---

## Box Inventory

All 9 boxes live under `_app/houses/shield/security-plus/labs/`. The shared fictional universe is **Veridian Financial** (D4 boxes) and a separate unnamed corporate environment (D5 boxes).

### Domain 4 — Security Operations (28% of SY0-701)

| Directory | Title | SY0-701 Objectives | Desktop Devices | Flags |
|---|---|---|---|---|
| `shield-sp-blueteam-log-intrusion-hunt` | Intrusion Hunt | 4.3, 4.4, 4.5, 4.8 | Terminal, LogViewer | 5 |
| `shield-sp-blueteam-siem-triage` | SIEM Alert Triage | 4.2, 4.4, 4.8 | Terminal, Monitoring, IDS, LogViewer | 5 |
| `shield-sp-blueteam-config-audit` | Config Audit | 4.1, 2.5, 3.3 | Terminal, FirewallManager | 5 |
| `shield-sp-blueteam-vuln-triage` | Vulnerability Scan Triage | 4.3 | Terminal, LogViewer | 5 |
| `shield-sp-blueteam-breach-capstone` | Breach Capstone | 4.3, 4.4, 4.8 | Terminal, Monitoring, IDS, LogViewer, FirewallManager | 7 |

### Domain 5 — Program Management and Oversight (20% of SY0-701)

| Directory | Title | SY0-701 Objectives | Desktop Devices | Flags |
|---|---|---|---|---|
| `shield-sp-blueteam-vendor-assessment` | Vendor Due Diligence | 5.1, 5.3 | Terminal, Browser | 5 |
| `shield-sp-blueteam-risk-quant` | Quantitative Risk Analysis | 5.2, 5.1 | Terminal, LogViewer | 5 |
| `shield-sp-blueteam-risk-register` | Risk Register Analysis | 5.2 | Terminal, LogViewer | 5 |
| `shield-sp-blueteam-policy-classify` | Governance Doc Classification | 5.1 | Terminal, Browser | 6 |

### Breach Capstone detail

The capstone (`shield-sp-blueteam-breach-capstone`) is phase-gated across three stages — Detect, Investigate, Contain — with 7 flags mapping the full CVE-2021-44228 (Log4Shell, CVSS 10.0) kill chain at Veridian Financial. It replaced the standalone `shield-incident-response-playbook.lab.html` quiz card in the hub manifest.

Phase gate structure (per `config.js:68`):

| Phase | Required flags | Unlock condition |
|---|---|---|
| 1 — Detect | `attacker_ip`, `entry_cve` | Both submitted correctly |
| 2 — Investigate | `webshell_path`, `compromised_account`, `lateral_target` | All three submitted correctly |
| 3 — Contain | `exfil_bytes`, `c2_port` | Both submitted correctly |

---

## Architecture

### How one box works

A box is a directory containing two files:

- `config.js` — declares `window.<X>Config = { ... }`. All evidence (filesystem content, device data, hints, flags, scoring) lives here.
- `index.html` — loads engines with absolute paths, then boots via `BriefingPage.show(<X>Config, function(){ BoxEngine.init(<X>Config); })`.

Why absolute paths in `index.html`: the arena engines live at `/arena/engine/` and are shared across all boxes. Relative paths break whenever a box directory moves or is nested at a different depth.

### Engine scripts (load order in index.html)

```
/components/FirebaseAuth.js
/arena/firebase-init.js
/arena/engine/CoOpSync.js      -- required stub even in single-player mode
/arena/engine/CoOpLobby.js     -- required stub even in single-player mode
/arena/engine/CoOpUI.js        -- required stub even in single-player mode
/arena/engine/BoxEngine.js
/arena/engine/Terminal.js
/arena/engine/Browser.js
/arena/engine/BlueTeam.js      -- only when box uses SOC devices
/arena/engine/BriefingPage.js
config.js                      -- box-specific, loaded last before boot call
/_lib/HexAIButton.js           -- Dr. Hex mood-ring button (type="module")
```

The CoOp stubs are unconditionally required by BoxEngine even for single-player boxes. Omitting them causes a runtime reference error before `BoxEngine.init()` runs.

### BlueTeam devices (`_app/arena/engine/BlueTeam.js`)

| Device key (in config `desktop.icons[].app`) | What it renders | Config section that feeds it |
|---|---|---|
| `monitoring` | Traffic histogram + event feed + alert panel | `config.monitoring.{traffic,events,alerts}` |
| `ids` | IDS/Suricata alert list with MITRE T-codes | `config.ids.alerts[]` |
| `logviewer` | Structured log viewer with severity filter | `config.logViewer.entries[]` |
| `firewall` | Firewall ruleset table | `config.firewall.rules[]` |
| `browser` | In-box web browser for document review | `config.browser.*` |
| `terminal` | Real terminal with virtual filesystem | `config.terminal` + `config.filesystem` + `config.commands` |

`blueTeamMode: true` in the config root tells BoxEngine to accept these device types. Without it, BlueTeam icon registrations are silently ignored.

### Flag validation (server-side)

`BoxEngine.submitFlag` calls the `validateFlag` Cloud Function at `functions/index.js:164`.

The function:
1. Reads `flag_registry/{boxId}` from Firestore where `boxId = config.registryId`.
2. Normalizes both the submission and the stored value: `submission.trim().toLowerCase()`.
3. If `flagId` is provided, checks only that flag. If omitted, scans all flags for the box (mode 2).
4. On a correct match, writes `users/{uid}/flag_captures/{boxId}_{flagId}` and syncs `ctfFlagsCaptured` to the user profile.

Rate limiting: 10 attempts per box per 60 seconds (`functions/index.js:178`).

Why `registryId` equals the directory basename: `flag_registry/{registryId}` is the Firestore key. If these diverge, `validateFlag` returns `not-found` and students receive a permanent 0 on every submission. The BOX-013 smoke-gate validator enforces this invariant at deploy time.

### Scoring

`config.scoring.maxScore` is declared in the config but **ignored** by BoxEngine. The actual maximum is computed at runtime (`BoxEngine.js:2699`):

```
maxScore = scoring.base + sum(flag.points for each flag) + speedBonus.points
```

Why: this prevents stale `maxScore` values after flags are added or removed during development. Set `scoring.base` to match the sum of all flag points (the capstone uses 1150; standard boxes use 700–1000).

### Completion tracking (hub side)

Arena boxes do NOT call `ModuleProgress`. BoxEngine persists `{completed, flagsFound, ...}` to `localStorage[config.storageKey]` when the final flag is submitted.

The hub (`index.html:892`) reads completion for `engine:'arena-box'` items as:

```js
var raw = localStorage.getItem(item.storageKey);
if (raw) { var st = JSON.parse(raw); if (st && st.completed) return true; }
```

The manifest item in `_app/data/security-plus-manifest.json` must carry all three: `engine:'arena-box'`, `boxId`, and `storageKey`. Missing any one of these silently prevents completion tracking from firing.

### Fictional universe (cross-box consistency)

The D4 boxes share the Veridian Financial universe. The canonical IP-to-hostname mapping is:

| IP | Hostname | Role |
|---|---|---|
| 10.10.10.20 | WEB-DMZ-01 | Internet-facing Java web server (DMZ) |
| 10.10.20.15 | APP-INT-05 | Internal application server (app subnet) |
| 10.10.1.5 | deploy-jump | Internal deploy jump host |
| 10.10.30.5 | (DB server) | Database (referenced in log4j.log startup only) |
| 203.0.113.66 | (attacker) | RFC 5737 documentation-range address, external attacker |

Any new D4 box that references Veridian Financial infrastructure must use these addresses. Cross-box IP/hostname collision is a QC gate item — see the QC checklist below.

---

## Authoring a New Box

### Step 1 — Create the directory and files

Directory name = `registryId` = `config.id`. All three must be identical. BOX-013 blocks deploy if they diverge.

```
_app/houses/<hub>/labs/<registryId>/
    config.js        # window.<VAR>Config = { ... }
    index.html       # copy boot pattern from an existing box
```

Copy `index.html` from `_app/houses/shield/security-plus/labs/shield-sp-blueteam-log-intrusion-hunt/index.html`. Change the `<title>`, the `<h1>`, the config variable name in the boot call, and add or remove `BlueTeam.js` depending on whether the box uses SOC devices.

### Step 2 — Build the config

Required top-level fields:

| Field | Rule |
|---|---|
| `id` | Must equal directory basename |
| `registryId` | Must equal `id` (BOX-013) |
| `storageKey` | Must be globally unique across all boxes (BOX-storage-key-uniqueness) |
| `trackerKey` | Unique identifier used in analytics events |
| `blueTeamMode` | `true` if any BlueTeam device is on the desktop |
| `flags[]` | Each entry needs `id`, `points`, `label`, `description` |
| `hints[]` | Progressive 3-hint ladder per flag; only the final hint per flag uses `{{FLAG:id}}` |
| `lore.outro` | Completion-gated — BoxEngine renders it only after all flags are submitted (`BoxEngine.js:1801`) |
| `resetState` | Idempotent function; call at load time (BOX-006 backfill pattern) |
| `certObjectives.mappings` | Map each flag to a SY0-701 objective |

Evidence design rules:
- Every flag value must be discoverable from the evidence (filesystem, device data). If a student can only find it via a hint chain, the box fails the legit-lab gate.
- Flag values must NOT appear in: `lore.intro`, `lore.scenario`, `lore.goals`, `lore.toolkit`, task text in `hints[1-2]` (only hint 3 of each flag may use `{{FLAG:id}}`), `desktop.icons[].label`, or any device header/subtitle text.
- Free-text answers need a controlled vocabulary stated in the task description. `validateFlag` has no value-alias mechanism — the student must submit exactly the stored string (case-insensitive after trim, but exact value match otherwise).

### Step 3 — Register in box_flags.json

Add an entry to `functions/box_flags.json`:

```json
"<registryId>": {
    "flags": {
        "<flagId>": "<exact_value>",
        ...
    },
    "hashStubs": {
        "<flagId>": "<sha256(value.lower().strip())>",
        ...
    },
    "migratedAt": "YYYY-MM-DD"
}
```

Flag IDs must exactly match `config.flags[].id`. BOX-020 catches mismatches between `box_flags.json` and `config.flags[]`.

### Step 4 — Seed Firestore

**Production write — gated: master branch + explicit operator authorization required.**

```bash
# Preview (no write):
cd functions && node seed-one-box.js <registryId> --dry-run

# Write to Firestore (ADC credentials required):
cd functions && node seed-one-box.js <registryId>
```

`seed-one-box.js` reads `functions/box_flags.json`, writes `flag_registry/{registryId}`, then reads back and prints the result for confirmation (`functions/seed-one-box.js:36`).

### Step 5 — Add the hub manifest card

Add to `_app/data/security-plus-manifest.json` (or the target hub's manifest):

```json
{
    "id": "<manifest-id>",
    "title": "<display title>",
    "type": "lab",
    "href": "houses/<path>/labs/<registryId>/index.html",
    "domain": "<SY0-701 domain>",
    "src": ["new"],
    "exists": true,
    "engine": "arena-box",
    "boxId": "<registryId>",
    "storageKey": "<config.storageKey>"
}
```

`storageKey` in the manifest must exactly match `config.storageKey`. A mismatch means the hub reads the wrong localStorage key and the item never marks complete.

### Step 6 — Dual review gate

Before shipping, both of these gates must pass:

- **Chris** (purpose/bar gate): confirms the box is a legit investigation lab with zero quiz mechanics. Flags that can be answered by reading task descriptions rather than examining evidence fail this gate.
- **Nancy** (adversarial review): checks for accuracy leaks, technically-impossible artifacts, cross-box consistency, CVSS correctness, and flag pre-gives.

Then run `./deploy.sh` — the smoke gate enforces BOX-001/013/020/024 before deploy proceeds.

Arena boxes cannot be verified with headless rendering. Verify live via a real authenticated account.

---

## Known Pitfalls — QC Checklist

This checklist was used during the 2026-06-21 quality sweep. Run it for every new box and every significant edit.

### Pre-flight (static)

- [ ] `registryId === id === dirname` — three-way match (BOX-013 enforces at deploy)
- [ ] `storageKey` is globally unique — grep across all `config.js` files
- [ ] `storageKey` in `config.js` matches `storageKey` in the manifest entry
- [ ] `box_flags.json` flag IDs match `config.flags[].id` exactly (BOX-020)
- [ ] No flag value appears in: lore, goals, non-final hints, device header text, case-file content, filesystem file content outside the actual evidence artifact that contains it
- [ ] `node --check config.js` passes
- [ ] LogViewer entries do not restate type-definitions or echo flag values as metadata — if a LogViewer entry summarizes a log event but paraphrases the flag answer, neutralize or remove it
- [ ] Evidence does not self-label (e.g., a document footer that identifies its own document type when the flag answer IS the document type)

### Evidence integrity

- [ ] Every flag is discoverable from the evidence without using any hint
- [ ] No artifact pre-gives a flag value in context that precedes the student's expected investigation path (e.g., `/etc/hosts` listing APP-INT-05's IP when that IP is a flag)
- [ ] Log startup banners do not name flag values (e.g., a service banner announcing a version number when that version string is the flag)
- [ ] All filesystem log entries are technically consistent:
  - SYN packets carry no data bytes (URGP=0, no BYTES field on pure SYN)
  - iptables `OUTPUT` chain uses the host's own IP as SRC; cross-host traffic in `FORWARD`
  - A world-readable SSH key (`chmod 644`) must have an explicit stated reason (misconfig noted in a CI audit finding, case file, etc.) or the access is implausible
  - OpenSSL version and CVE must be coherent: OpenSSL 1.0.2k is NOT vulnerable to Heartbleed; use 1.0.1e for a Heartbleed scenario
- [ ] CVSS scores are NVD-exact and the vector string matches the numeric score
- [ ] SLE and ALE values are arithmetically correct and recomputed from the stated asset value, ARO, and control effectiveness — do not copy from drafts without re-verifying the arithmetic
- [ ] Free-text flag answers have a stated controlled vocabulary in the flag task description

### Cross-box consistency (Veridian Financial universe)

- [ ] All IP addresses in new D4 boxes match the canonical IP/hostname table in this doc
- [ ] No CVE that is already the flag answer in an existing box is also the flag answer in a new box (pre-reveal between boxes)

### Firestore

- [ ] `node seed-one-box.js <registryId> --dry-run` output matches expected flag IDs and values
- [ ] After live seed: `node seed-one-box.js <registryId>` readback confirms all flags present
- [ ] `flag_registry/{registryId}` in Firestore is readable by the `validateFlag` function (confirm via a live submission in a real account)

### Hub integration

- [ ] Manifest href resolves on disk (`exists: true`) and returns HTTP 200 in production
- [ ] No duplicate manifest IDs
- [ ] Hub card renders (section, title, domain assignment correct)
- [ ] No console errors on hub load
- [ ] Completion: submit all flags in a real account, reload the hub, verify the card shows complete

### Smoke gate (must be clean before `./deploy.sh`)

| Validator | Code | What it catches |
|---|---|---|
| `box-flag-registry-audit.js` | BOX-001 | Box in hub manifest missing from `box_flags.json` |
| `box-registry-id-dirname.js` | BOX-013 | `config.registryId` does not match directory name |
| `box-flag-count-consistency.js` | BOX-020 | Flag IDs in `config.flags[]` vs `box_flags.json` mismatch |
| `box-flag-value-duplicates.js` | BOX-024 | Two flags in the same box share the same value |

---

## What This System Does NOT Do

- Arena boxes do NOT call `ModuleProgress`. Hub completion is tracked exclusively via `localStorage[storageKey]`. Cross-device completion is not available — a student who completes a box on one device will see it incomplete on another.
- `config.scoring.maxScore` is not enforced. It is a hint to the config author but the runtime ignores it (`BoxEngine.js:2699`).
- The `validateFlag` function has no value-alias mechanism. Partial matches, synonym lists, and numeric-format variants (e.g., `$750,000` vs `750000`) are not supported. The stored value in `box_flags.json` must match exactly what the student submits after `trim().toLowerCase()`.
- Arena boxes cannot be headless-tested for correctness. The EduScan smoke gate checks structure (BOX-001/013/020/024) but cannot execute a box and verify a flag chain end-to-end. Live verification with a real authenticated account is the only complete test.
- This pattern is not yet replicated to other cert hubs. The box engine, engines, and `validateFlag` function are hub-agnostic; the only hub-specific piece is the manifest file and the hub's `itemComplete()` handler.

---

## Deferred Items

| Item | State | Notes |
|---|---|---|
| Cross-device completion sync | Not built | Arena boxes write completion only to `localStorage`. Firestore `flag_captures` holds authoritative per-flag captures server-side; a completion-sync bridge reading from `flag_captures` is not wired to the hub progress bar. |
| Replication to other cert hubs | Not started | The engine is generic. Authoring new boxes for other cert hubs follows the same runbook above; only the manifest file differs. |
| Co-op multiplayer mode | Stubbed | CoOp stubs are loaded but single-player boot is the only active mode. The stubs are required to prevent BoxEngine runtime errors. |

---

## Related

- `_app/arena/engine/BoxEngine.js` — core engine (scoring, flag submit, phase gates, completion)
- `_app/arena/engine/BlueTeam.js` — SOC device implementations (MonitoringDashboard, IDSPanel, LogViewer, FirewallManager)
- `_app/arena/engine/Terminal.js` — virtual terminal and filesystem; pipe-aware `grep` via `term._pipedStdin`
- `functions/index.js:164` — `validateFlag` Cloud Function
- `functions/box_flags.json` — canonical flag registry (source of truth for seeding)
- `functions/seed-one-box.js` — seed script for `flag_registry/{boxId}`
- `_app/data/security-plus-manifest.json` — hub manifest (items 1022–1380 cover arena-box entries)
- `_tools/eduscan/box-registry-id-dirname.js` — BOX-013 smoke-gate validator
- `_tools/eduscan/box-flag-registry-audit.js` — BOX-001 smoke-gate validator
- `_tools/eduscan/box-flag-count-consistency.js` — BOX-020 smoke-gate validator
- `_tools/eduscan/box-flag-value-duplicates.js` — BOX-024 smoke-gate validator
- [[feedback_labs_must_be_legit_engines]] — operator directive that drove this conversion
- [[reference_chris_qc_gate]] — Chris gate procedure (legit-lab check)
- [[feedback_decision_protocol_with_nancy]] — Nancy review pattern

---

*Confluence parent: Platform Documentation (page ID 65704)*

*Last Updated: 2026-06-21 · v1.0.0*
