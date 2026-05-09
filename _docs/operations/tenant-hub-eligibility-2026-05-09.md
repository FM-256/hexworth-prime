# Tenant Hub Eligibility — Current State + Path to "All Hubs"

**Status:** DISCOVERY — operator-review pending before implementation
**Created:** 2026-05-09
**Operator request:** Make ethics-it (CIS4253) and infosec (CIS2350C) tenant-assignable now; eventually expand to all course hubs.

## The need

When an operator creates or updates a tenant via the Admin Console (`_app/admin/console.html`), the Content Picker shows a multi-checkbox UI for assigning content access. Today, exactly **17 items** are selectable: 5 platform hubs + 12 courses. Two course hubs that students need (ethics-it, infosec) are NOT in that list, so tenants can't license them. The platform actually has ~43 hub directories (27 top-level houses + 13 shield sub-courses + 3 divergent sub-courses); the 26 missing items represent real curriculum that's invisible at tenant creation.

Immediate need: add ethics-it and infosec.
Eventual goal: every shippable hub is selectable.

## Current design

Three touch-points control which hubs are assignable. The list is hand-maintained in **one place** — the picker in console.html.

### 1. The picker (UI source of truth) — `_app/admin/console.html:6999-7046`

Two hardcoded arrays drive the checkbox list:

```js
// Lines 7000-7006 — Platform Hubs (5 entries)
const hubItems = [
    { value: 'wireshark',  label: 'Wireshark Hub (32 modules)' },
    { value: 'forensics',  label: 'Forensics Hub (30 modules)' },
    { value: 'bug-hunting', label: 'Bug Hunting Dojo' },
    { value: 'signal',     label: 'Signal Toolkit — Hardware' },
    { value: 'arctic-cli', label: 'Arctic CLI Training' }
];

// Lines 7032-7045 — Courses (12 entries)
const courseItems = [
    { value: 'network-plus',  label: 'CompTIA Network+ N10-009' },
    { value: 'cyberops',      label: 'CyberOps 200-201' },
    { value: 'aplus-core1',   label: 'CompTIA A+ Core 1' },
    { value: 'aplus-core2',   label: 'CompTIA A+ Core 2' },
    { value: 'md-100',        label: 'MD-100 Windows Client' },
    { value: 'md-101',        label: 'MD-101 Windows Devices' },
    { value: 'feh',           label: 'FEH — Forensics & Ethical Hacking' },
    { value: 'python-hub',    label: 'Python Programming Hub' },
    { value: 'python-for-it', label: 'Python for IT (COP1034C)' },
    { value: 'security-plus', label: 'CompTIA Security+ SY0-701' },
    { value: 'isc2-cc',       label: 'ISC2 Certified in Cybersecurity (CC)' },
    { value: 'server-plus',   label: 'CompTIA Server+ SK0-005' }
];
```

The form-save handler (line 7169) collects all checked `hub_*` checkboxes and writes them to `tenant.licensing.contentAccess.hubs` in Firestore. Adding entries to `courseItems` immediately makes them assignable — no other code changes needed for the basic add.

### 2. Firestore schema — `functions/tenant-admin.js:36-98`

The tenant document has a free-form `licensing.contentAccess.hubs: []` array. **No whitelist** on which hub IDs are valid — Firestore rules only enforce who can write the field, not what values are allowed. This means any string in the array is accepted by Firestore. The picker's `value` strings are the *de facto* contract; runtime checks rely on those strings being recognized by client code (hub-specific gates, navigation, etc.).

### 3. CLI tool — `functions/tenant-admin.js` `set-content` command (line 278)

Generic — accepts any comma-separated list:
```
node tenant-admin.js set-content --tenant=<id> --hubs=ethics-it,infosec
```
No hardcoded list, so adding new hub IDs at the picker doesn't require CLI changes.

## Hub inventory

**43 directories with `index.html` exist:**
- 27 top-level houses: ai, aplus-core1, aplus-core2, aws-ccp, aws-developer, azure-fundamentals, casp-plus, ccna, cloud, code, comptia-linux, comptia-network, cryptography-track, cysa-plus, dark-arts, devops-fundamentals, divergent, eye, forge, key, matrix, script, security-operations, security-plus, security-plus-crypto, shield, web
- 13 shield sub-courses: challenges, cyber-framework, exams, incubator, **infosec**, intro-security, isc2-cc, ms-security, reviews, sc-200, sc-900, security-101, security-plus
- 3 divergent sub-courses: cybersecurity-ethics, cybersecurity-policy, **ethics-it**

The 12-entry `courseItems` list uses some IDs that don't directly match dir names (e.g., `network-plus` ≠ `comptia-network/`). This is fine — the value strings are stable contracts; clients map them to whatever paths make sense.

## ID convention question (low-priority)

Should ethics-it and infosec be added under the **Courses** section (both have catalog codes — CIS4253 and CIS2350C) or as their own category? Both have a "course" feel (full-semester academic curriculum with a code). Recommend: Courses section. Matches existing pattern.

## Three options for the path forward

### Option A — Hand-add 2 entries now; defer all-hubs to separate sprint

Add `ethics-it` and `infosec` to `courseItems` at console.html:7032-7045. Two-line edit. Ships in one commit.

**Pros:**
- Smallest blast radius. Operator unblocked today.
- No new infrastructure to maintain.
- Future hubs added one-at-a-time as needed (10 min per add).

**Cons:**
- Doesn't scale to "all 43 hubs" goal — that would mean a 43-row hand-maintained array.
- Hand-maintenance drift risk: new hubs ship without being added (already happening — that's the bug).

### Option B — Build a hub registry, refactor courseItems to be data-driven

Create `_app/components/HubRegistry.js` (or extend ContentCatalog.js) with one entry per shippable hub: `{ id, label, category, catalogCode, dir, tenantAssignable: true }`. Refactor `courseItems` to render from the registry, filtered by `tenantAssignable`.

**Pros:**
- Single source of truth. Adding a new hub = one entry in the registry.
- Future tooling can use the registry too (e.g., catalog audits, broken-link gates, instructor view).
- Surfaces the "tenantAssignable" flag explicitly — makes it a first-class concept.

**Cons:**
- More work upfront. Need to populate registry with 17 existing entries + verify metadata (label text, catalog code, dir mapping).
- Refactor risk: console.html's picker has been stable; rewiring it carries regression risk.
- Premature optimization if we only ever add a handful more entries.

### Option C — Hybrid: add 2 entries now, prototype registry in parallel

Ship the 2-entry add today (unblocks operator). Open a separate sprint item to design the hub registry pattern. Migrate `courseItems` to data-driven only after the registry is reviewed and proven.

**Pros:**
- Operator unblocked immediately.
- Registry design can be Nancy-reviewed without a deadline.
- Future hub additions can land via either path during the transition.

**Cons:**
- Two paths existing in parallel until migration completes.
- "Eventually" might become "never" if registry sprint never ships.

## Recommendation

**Option C — hybrid.** Reasoning:
- The 2-entry add is a 5-minute change with zero infrastructure risk. Shipping it today closes the operator-stated need.
- The registry is the right answer for the "all hubs" eventual goal, but it's a real design exercise — needs decisions on hub categorization (Course vs Hub vs Tool), label conventions, sort order, status flags (beta, deprecated, internal-only), and per-hub metadata schema. Doing it under deadline pressure would either skimp on those or block the immediate need.
- Marathon-mode platform-improvement work has been about reducing hand-maintained lists in favor of registries (placeholder detector consolidation, audit Tier 1 JSON, sync-helper). The hub registry fits that direction.

**Concrete next step (if approved):** add the 2 entries (lines 7032-7045 in console.html), commit, deploy via `./deploy.sh`. Then open Task #97 for the hub registry design exploration.

## Files to edit (Option A path or hybrid Step 1)

- `_app/admin/console.html` — courseItems array, lines 7032-7045 — add 2 entries
  ```js
  { value: 'ethics-it', label: 'Ethics in IT (CIS4253)' },
  { value: 'infosec',   label: 'Principles of Information Security (CIS2350C)' },
  ```

That's it. No Firestore rules change, no CLI change, no migration. Existing tenants are not affected — their `contentAccess.hubs` arrays continue to work.
