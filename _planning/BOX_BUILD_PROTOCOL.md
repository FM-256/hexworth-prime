# CTF Box Build Protocol

**Status:** MANDATORY — No box may be built without following this protocol
**Created:** 2026-04-09
**Reason:** 13 boxes built without flags = complete failure. This protocol prevents that from ever happening again.

---

## The Rule

**A CTF box without flags is not a CTF box. It is nothing.**

Before writing a single line of HTML, CSS, or JavaScript, the flags must exist — defined, documented, and registered. If you cannot explain where the student discovers each FLAG{xxxxx} string, the box is not designed. Stop and design it.

---

## Protocol Phases

### Phase 0: CONCEPT (discuss with user)
- [ ] Scenario defined (who, what, where, why)
- [ ] Attack vector / investigation type identified
- [ ] Difficulty level set
- [ ] Number of flags decided
- [ ] User approves concept before proceeding

**GATE: User says "proceed" before moving to Phase 1.**

---

### Phase 1: WALKTHROUGH (write before ANY code)

Write the complete instructor walkthrough document FIRST. This document must include:

- [ ] Every flag value: `FLAG{exact_string_here}`
- [ ] Where each flag is discovered (which device, which file, which action)
- [ ] The exact student action that reveals the flag (command, query, decode, correlation)
- [ ] Step-by-step path from box start to each flag
- [ ] What the student sees when the flag appears
- [ ] Flag submission method (how they enter it)
- [ ] Scoring breakdown per flag
- [ ] Hints available and their cost
- [ ] Red herrings and why they're wrong
- [ ] MITRE ATT&CK or cert objective mapping (if applicable)

**The walkthrough IS the design document. No walkthrough = no build.**

**GATE: Walkthrough complete with all FLAG{} values before moving to Phase 2.**

---

### Phase 2: FLAG REGISTRATION (server-side, before any client code)

- [ ] Generate FLAG{xxxxx} values (unique per box, not guessable)
- [ ] Register in Firestore `flag_registry/{boxId}` via seed script
- [ ] Verify registration: `node -e "db.doc('flag_registry/{boxId}').get()..."`
- [ ] Confirm `deliverFlag` and `validateFlag` Cloud Functions will work with the new box ID

**GATE: Flags verified in Firestore before moving to Phase 3.**

---

### Phase 3: CONFIG (box configuration)

- [ ] Box metadata (id, title, storageKey, registryId, difficulty)
- [ ] Flag definitions (ids, points — NO flag text, only IDs)
- [ ] Phases/connections with required flags
- [ ] Hints (text + cost + penalty)
- [ ] Scoring rules
- [ ] Lore/scenario text
- [ ] `{{FLAG:id}}` token placement planned (which page, which element)

**NO answer strings in client JavaScript. NO flag values in client JavaScript.**

**GATE: Config complete, Nancy reviews config before moving to Phase 4.**

---

### Phase 4: BUILD (device pages / interfaces)

- [ ] Build one page at a time
- [ ] Place `{{FLAG:id}}` tokens where the walkthrough says flags are discovered
- [ ] Verify each token resolves via `resolveFlagTokens()` (BoxEngine) or Cloud Function (OpenWorld)
- [ ] Include realistic noise data (80% noise, 20% evidence)
- [ ] Test each page: can the student find the flag following the walkthrough?
- [ ] Add pin/evidence mechanics if applicable

**For each page built:**
1. Does it match the walkthrough step?
2. Is the FLAG{} discoverable through the intended action?
3. Is the flag server-delivered (not in client JS)?

**GATE: All pages built, all flags discoverable per walkthrough.**

---

### Phase 5: QC (quality control)

- [ ] Run walkthrough end-to-end — can you complete the box following your own steps?
- [ ] Verify every FLAG{} token resolves from server
- [ ] Verify flag submission works (via `validateFlag` Cloud Function)
- [ ] Nancy adversarial review (security, logic, UX, realism)
- [ ] Run EduScan — no new SEC-001 or SEC-002 findings
- [ ] Completability check — every flag reachable, every path functional

**GATE: Nancy approves, EduScan clean, walkthrough completable.**

---

### Phase 6: REGISTER & DEPLOY

- [ ] Add to `box-catalog.json`
- [ ] Add to Arena hub (`index.html`)
- [ ] Copy walkthrough to shared solutions folder
- [ ] Run full Nexus — findings count should not increase beyond expected
- [ ] Compare Nexus before/after — if unexpected increase, investigate before deploying
- [ ] Deploy with user approval

**GATE: User approves deployment.**

---

## For Open World (OW/OWS) Boxes Specifically

The Open World format adds complexity but does NOT change the flag requirement:

1. **Flags are still FLAG{xxxxx}** — embedded in evidence, gated behind investigation progress
2. **Flag discovery moments:** When the student pins enough evidence and makes the right connections, a FLAG{} is revealed via server delivery
3. **Answer submission** calls `validateFlag` Cloud Function, not client-side string matching
4. **Evidence items are NOT flags** — evidence is what the student finds; flags are what the student earns for finding the right evidence
5. **Connection confirmation can trigger flag delivery** — completing a key connection reveals a FLAG{} via `{{FLAG:id}}` token

Example flow:
- Student pins evidence A and evidence B
- CaseBoard reveals connection
- Student confirms connection
- Server delivers FLAG{connection_1_confirmed} via `deliverFlag`
- Student submits FLAG{} string

---

## What This Protocol Would Have Prevented

On 2026-04-09, 13 boxes were built without this protocol:
- 98 HTML pages written
- 174 evidence items created
- 93 connections defined
- **0 flags generated**
- **0 Firestore registrations**
- **0 server-side validation**
- All answers in plain text client JavaScript
- Complete failure

Had this protocol been followed, Phase 1 (walkthrough) would have required FLAG{} values before any HTML was written. The failure would have been caught before line 1 of code.

---

## Enforcement

This protocol is not optional. It is not a suggestion. It is not something to "get to later."

**Phase 1 (walkthrough with flags) must be complete before Phase 4 (build) begins. No exceptions. No "I'll add flags later." No "the evidence system replaces flags." No shortcuts.**

If you find yourself writing HTML before the walkthrough has FLAG{} values in it, STOP. You are about to repeat the 2026-04-09 failure.

---

*This protocol exists because 13 boxes were built without flags. Never again.*
