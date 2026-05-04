# SYM-10 — Untagged Catalog Audit + Strategy Options

> 2,563 of 2,996 catalog modules (~85%) lack tags entirely. Untagged content does not surface in tag-based search/filter. This audit categorizes the gap and proposes three strategies. **Awaiting user direction before any catalog edits.**

## Discovery

```
Total catalog modules:              2,996
Modules WITH tags:                    433  (~14%)
Modules WITHOUT tags:               2,563  (~85%)
```

### Untagged distribution by house

| House | Untagged | Notes |
|---|---|---|
| script | 417 | Largest gap — Linux/Bash content density |
| web | 333 | Network-Plus / CCNA tracks |
| shield | 324 | Security+/CC/cyber-framework |
| matrix | 271 | Advanced Linux + Operator + Protocore + PiVerse |
| code | 264 | Python tracks |
| cloud | 232 | OpenStack, Server+, WSA, Azure |
| forge | 217 | A+, MD-100/101, server-management |
| eye | 86 | Forensics, SIEM, threat detection |
| ai | 52 | New track, smaller content |
| key | 46 | Cryptography |
| dark-arts | 35 | Offensive security |
| (unknown) | 286 | Cross-house / platform-level entries |

### Untagged distribution by category

The catalog already has a `category` field on every untagged module. There are **121 distinct categories** in use among untagged modules. Top 15:

| Count | Category | Implication |
|---|---|---|
| 264 | `general` | Catch-all — needs re-categorization, not just tagging |
| 160 | `armory` | Likely tools/utilities — could share an `armory` tag |
| 156 | `linux-administration` | Clear topic cluster — `linux`, `administration`, `bash` tags obvious |
| 150 | `piverse` | New track — Pi/embedded — `pi`, `embedded`, `microcontroller` |
| 129 | `clh` | Command Line Hero course — `bash`, `linux`, `course` |
| 128 | `network-plus` | Cert track — `network-plus`, `networking`, `comptia` |
| 64 | `cloud-security` | `cloud`, `security`, `aws-azure` |
| 61 | `command-line` | `bash`, `terminal`, `linux` |
| 57 | `arduino` | `arduino`, `embedded`, `microcontroller` |
| 52 | `linux-admin` | Same as linux-administration — needs deduping |
| 50 | `cryptography` | `crypto`, `encryption`, `pki` |
| 48 | `cysa-plus` | `cysa`, `comptia`, `analysis` |
| 48 | `md-100` | `windows`, `microsoft`, `desktop` |
| 45 | `esp32` | `esp32`, `embedded`, `microcontroller` |
| 40 | `cloud-security-engineering` | Same as cloud-security — likely needs dedup |

**108 of 121 categories used in untagged modules are NOT used in any tagged module.** This means the tagging effort needs to define a tag taxonomy from scratch for most of the untagged content — there's no existing tag vocabulary to inherit from.

---

## Three strategies

### Strategy A — Auto-tag from category field

For each untagged module, generate a default tag list from its `category`:

```js
// Example mapping
'linux-administration' → ['linux', 'administration', 'bash']
'network-plus'         → ['network-plus', 'networking', 'comptia']
'cryptography'         → ['cryptography', 'crypto', 'security']
```

Build a `category → tags[]` mapping table (~120 entries, one per distinct category). Run a one-shot script that adds the derived tags to every untagged module's catalog entry.

**Pros:**
- Single pass; closes the 85% gap immediately
- Tag taxonomy is at least categorical (matches existing `category` semantics)
- Reversible — untag is one script away

**Cons:**
- Tags are coarse; doesn't capture content-specific terms (a "Wireshark Training Lab" gets `linux`/`administration` from category but not `wireshark`/`packet-capture`)
- The 264-strong `general` bucket gets useless tags
- Two near-duplicate categories (`linux-administration` + `linux-admin`; `cloud-security` + `cloud-security-engineering`) need consolidation first or they each get separate tag sets

### Strategy B — Human-curated taxonomy + workflow tool

Define a clean tag taxonomy first (~30-50 tags total). Build a small admin tool that loads untagged modules in batches with proposed tags + manual override, persists decisions, marks completion.

**Pros:**
- Highest-quality end state — tags reflect actual content
- Tool is reusable for future tagging work
- Could combine LLM suggestion + human review for speed

**Cons:**
- Substantial up-front design (taxonomy + tool)
- Sustained operator time per batch
- Risk of analysis paralysis on taxonomy choices

### Strategy C — Accept the gap; rely on other discovery

Don't tag the 2,563. Let students find content via:
- House navigation (the dominant path today)
- Course/track hubs (ContentCatalog → hub renderer)
- Global Search (Ctrl+K) — full-text title/description match
- Learning Paths (prerequisite chains)

Only tag content where tag filtering is the EXPECTED discovery path (e.g., when a future feature needs `#beginner`, `#advanced`, `#prerequisite-free`).

**Pros:**
- Zero work
- Tag-based search isn't documented as a primary student feature anyway
- Low risk of bad tags polluting search results

**Cons:**
- Tag-based UI features (filter chips, tag clouds) remain unusable for 85% of content
- Future taxonomy work has to start from scratch when needed

---

## Recommendation

**Strategy A first, then targeted Strategy B for content that warrants depth.**

Rationale:
1. Strategy A in one commit closes the 85% gap with category-derived tags. Even coarse tags are better than no tags for filtering.
2. After Strategy A, the operator can use the tag-filter UI to find content that needs better tags (the obviously-mis-tagged) and refine in a Strategy-B-lite pass.
3. Strategy C alone leaves the gap permanently — that's a deferred decision, not a fix.

Strategy A implementation requires:
- Build the `category → tags[]` mapping table (collaborative — operator must approve the mapping before script runs)
- Pre-pass: dedupe the near-duplicate categories (`linux-administration` ↔ `linux-admin`, etc.)
- Auto-tag script + dry-run + apply
- After: remove TAG-002 baseline lock from `_tools/eduscan/tests/run.js`

---

## Decision points for user

1. **Strategy A, B, or C?** — A recommended.
2. **If A:** review the proposed `category → tags[]` mapping (would draft a separate doc with all 121 categories + proposed tags for sign-off)
3. **Category dedup** — handle automatically (collapse `linux-admin` into `linux-administration`) or leave both as separate tags?
4. **Tag taxonomy ceiling** — total distinct tags allowed? (Current: ~unbounded. Recommended: 30-50 max for usability.)
5. **`general` category (264 modules)** — re-categorize first (manual), or accept default tag like `untagged-general`?

---

## Reference

- Catalog: `_app/components/ContentCatalog.js` MODULES array
- Tags validator: `_tools/eduscan/validators/syntax/tags.js`
- TAG-002 baseline: `_tools/eduscan/tests/run.js` `KNOWN_TAG_BASELINE` constant
- Sister docs: `prog003-rename-plan-2026-05-04.md` (PROG-003 spec), `sym-8-hub001-fix-proposal.md` (HUB-001 strategy)
