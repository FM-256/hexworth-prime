# Security+ Hub Overhaul — Marathon Definition (created 2026-06-27)

**Sprint:** `MARA-SECPLUS-HUB`. **Status:** defined, NOT started. **Trigger:** operator review —
"the Security+ hub is severely lacking even the content... where are the practice exams? PBQs? labs?
it is way disorganized — I was expecting a hub organized like A+ or WSA." Operator instruction:
"organize it and fix it."

> DO NOT start executing this until the operator says go. This doc DEFINES the work; it is not a
> license to begin. (See [[feedback_follow_instructions_not_commentary]].)

## DIAGNOSIS — what's wrong now (from the 2026-06-27 inventory)
The hub at `_app/houses/shield/security-plus/index.html` is manifest-driven from
`_app/data/security-plus-manifest.json` (149 items). Problems:

1. **Organized by TYPE within DOMAIN, content LAST.** Each of the 5 SY0-701 domain cards dumps items
   grouped by type via `TYPE_ORDER = ['lab','applet','presentation','quiz','tool','other']` — so a
   domain leads with Hands-On Labs, then Interactive Tools, and **Presentations (the actual content)
   is THIRD.** Operator rule: **content first, always.** This is backwards.
2. **PBQs are buried and split.** The 4 PBQs are typed `lab` in the manifest, so they render inside
   each domain's "Hands-On Labs" subsection (no "PBQ" section), scattered across Domain 1 (×2),
   Domain 2 (×1), Domain 4 (×1). Effectively invisible as PBQs.
3. **NO SY0-701 practice exams.** There is no full-length / domain-weighted SY0-701 practice test. The
   "exams" that show are PIS (Principles of Information Security) finals/midterms.
4. **53 of 149 items are PIS — a DIFFERENT course** (Patient Zero, Outbreak, Vault Breach, Jeopardy,
   Kahoot, Wheel, Infosec midterm/final, week quizzes). They pad the count and masquerade as SY0-701.
5. **Genuine SY0-701 content is thin:** ~96 real items, but assessment/practice is only 5 short topic
   quizzes + 4 PBQs + 9 arena boxes. Several domains are sparse.
6. **Not built like A+/WSA.** A+ Core 2 = a card per CHAPTER (ch13–24); WSA = a card per MODULE
   (m01–m19); each unit-card bundles that unit's content + lab + quiz together, content-first,
   sequential. Security+ is the type-grouped domain dump described above.

## TARGET — organize like A+ / WSA
**STRUCTURE (operator-decided 2026-06-27): two levels — DOMAIN → MODULES.** Top level = the 5 SY0-701
domains. Within each domain, a set of **modules** (sub-topic units, like A+ chapters / WSA modules).
Each MODULE is the bundled unit: **content-first** — Learn (content/presentation) → Practice (PBQs,
labs) → Assess (quiz). Mirrors how A+ groups chapters and WSA groups modules, nested under the domain.
- **Surface PBQs** as their own clearly-labeled section/type within a module — not buried under "Labs".
- **SY0-701 only** — genuine cert content; PIS does not pad the hub.
- Match the A+ Core 2 / WSA visual + interaction pattern (`.chapter-card` / module-card).

## SCOPE / PHASES (define; execute later, operator-gated)
- **P0 — De-pad PIS.** Remove (or clearly separate) the 53 PIS items from the Security+ manifest so the
  hub shows only SY0-701. PIS keeps its own hub. (we-do-not-destroy: re-point/separate, don't delete.)
- **P1 — Reorganize structure.** Adopt the A+/WSA unit-card pattern; fix item order to content-first
  (`TYPE_ORDER` → presentation/applet first, then PBQ, lab, quiz); add a distinct PBQ section/type and
  re-type the 4 PBQs; ensure every item is searchable (ties to [[MARA-SEARCH-1]]).
- **P2 — Build missing content.** SY0-701 practice exam(s) (full-length + per-domain); more PBQs across
  ALL 5 domains; fill sparse domains with the right Learn/Practice/Assess items. Legit engines, not
  quiz-shaped ([[feedback_labs_must_be_legit_engines]]); score-gated; SY0-701-accurate.
- **P3 — QC + ship.** Render-QC, drive each new lab/PBQ/exam, Nancy + Chris gates, deploy per gates.

## DECISIONS
1. **Structure — DECIDED 2026-06-27:** Domain → Modules (two levels). Domains at top; modules within
   each domain; each module bundles content-first (Learn → Practice → Assess). Modules are CONTENT-DRIVEN
   teaching units grouped under objectives — a heavy objective (e.g. 1.2) SPLITS into multiple modules
   (operator: "some objectives may require multiple modules"). [resolved]
2. **PIS items — OPEN:** remove from the Security+ hub entirely, or keep in a clearly-labeled "Related"
   section? (53 items; PIS keeps its own hub regardless.)
3. **Sequencing — OPEN:** reorganize structure first then build content, build content first, or one
   combined phased plan?
4. **Module list per domain — TBD at kickoff:** define the modules for each of the 5 domains (the
   SY0-701 objective groups), then map existing items into them and identify gaps to build.

## METHOD / REFERENCES
- Model hubs: `_app/houses/forge/applets/comptia-aplus/core-2/index.html` (chapter-cards),
  `_app/houses/cloud/modules/wsa/index.html` (module-cards).
- Hub is manifest-driven: structure changes live in `index.html` (TYPE_ORDER, card rendering) +
  `security-plus-manifest.json` (items, domains, types). Searchability via `ContentCatalog`.
- Inventory script used for the diagnosis: counts/splits in this doc are reproducible read-only.

## STATUS CHECKLIST (2026-06-27) — marathon NOT complete

**DONE + LIVE:**
- [x] P0 — de-pad 53 PIS items (149 → 96 genuine SY0-701). Live.
- [x] P1 — Domain → Modules content-first render (all 5 domains, 22 modules, PBQs surfaced). Live.
- [x] P2a — Practice Exam 1 (90Q, server-graded, balanced key, secure). Live.
- [x] P2b — Practice Exam 2 (90Q, server-graded, balanced key, secure). Live.

**REMAINING (P2 content + refinements):**
- [ ] **15 of 22 modules lack practice and/or assessment** (7 complete). Each gap module needs at
      least a quiz; ~9 also need a practice item (lab/PBQ). The 15:
      - D1: Change Management (0P 0A) · Cryptographic Solutions (0A) · Design Principles & Best Practices (0P 0A) · Governance & Asset Management (0P 0A)
      - D2: Application & Injection Attacks (0A) · Malware (0P 0A) · Network & Social Engineering Attacks (0P 0A) · Threat Actors & Motivations (0P 0A)
      - D3: Cryptography & PKI (0P 0A) · Identity & Access AAA (0P 0A)
      - D4: Vulnerability & Threat Management (0A)
      - D5: Compliance/Law/Regulation (0A) · Risk Management (0A) · Security Governance (0A) · Third-Party & Vendor Risk (0A)
- [ ] More PBQs per domain (currently 4 total — thin).
- [ ] Nancy refinement: move the 3 domain-wide "Comprehensive/Challenge" quizzes to DOMAIN level (not inside a module).
- [ ] Nancy refinement: content-diff + curate the 3 near-duplicate "Security Fundamentals"/"CIA Triad" presentations.
- [ ] P3 — drive-to-completion QC each new quiz/PBQ; verify quiz_keys seeded for every new server-graded quiz.

**SEPARATE marathon (MARA-SEARCH-1) — NOT done:** only a partial/lazy 14-item searchability backfill
shipped; the comprehensive content-vs-catalog scan + the 77 strict-orphans are still pending.

## UPDATE 2026-06-27 (later) — P2 quizzes + exam grading fix shipped
- [x] **CRITICAL fix:** both practice exams were ungradeable — QuizEngine grades via `config.moduleId`
      but the exams' moduleId ('sy0-701-practice-exam-N') didn't match the seeded key
      ('shield-sy0-701-practice-exam-N'). Aligned + redeployed. (verify-quiz-keys checks
      static↔Firestore, NOT html↔key — use the bridget agent / check moduleId for server-graded quizzes.)
- [x] **15 module assessment quizzes** built + live (10 Qs each, server-graded, balanced, secure).
      Built via `_tools/secplus-quiz-gen.js` (correctness baked in: moduleId=key, no leakage, full-width).
      Module coverage: **14 of 22 complete** (was 7).
- [ ] **8 modules still need a PRACTICE item (PBQ/lab)** — they have content + a quiz but no practice:
      D1 Change Management · D1 Design Principles & Best Practices · D1 Governance & Asset Management ·
      D2 Malware · D2 Network & Social Engineering Attacks · D2 Threat Actors & Motivations ·
      D3 Cryptography & PKI · D3 Identity & Access (AAA). → next wave: build PBQs for these.
- [x] **Nancy refinement 1 — domain-wide quizzes → domain level (DONE 2026-06-27).** Re-tagged the 3 truly
      domain-spanning "Challenge" quizzes to `module:"Domain Challenge", mseq:99` so they render as a domain-level
      review block at the BOTTOM of their domain instead of nested in a topic module: Security+ Comprehensive
      Challenge (D1), Threats & Vulnerabilities Challenge (D2), Network Security Challenge (D3). The two
      topic-specific ones (Access Control Challenge, CIA Triad Challenge) stay in their modules. Verified each
      renders as the last module-block in its domain.
- [x] **Nancy refinement 2 — curate near-duplicate presentations (DONE 2026-06-27).** Found `shield-security-pres`
      ("Security Fundamentals") is actually a mislabeled **Network+ N10-008** "Network Security Fundamentals" deck
      (0 SY0-701 refs, 3× N10-008) duplicating the title in the CIA module. De-listed it from the Security+
      manifest + ContentCatalog (file preserved; entry archived to `_app/data/_security-plus-removed-2026-06-27.json`).
      Kept `shield-security-fundamentals` (real comprehensive Security+ deck) + `shield-cia-triad` (focused CIA deck) —
      complementary, not duplicates.
- [ ] (separate) MARA-SEARCH-1 comprehensive searchability scan.

## UPDATE 2026-06-27 (continued) — PBQ practice-gap wave (the 8 missing-Practice modules)
Verified from the manifest: ALL 22 modules now have Learn + Assess; the ONLY remaining content gap is
PRACTICE — exactly 8 modules have 0 practice items. Filling them with one PBQ each is the next wave.

**8 gap modules (module · domain · mseq to register the PBQ with):**
- Change Management · D1 · mseq=5
- Design Principles & Best Practices · D1 · mseq=3
- Governance & Asset Management · D1 · mseq=4
- Threat Actors & Motivations · D2 · mseq=1
- Malware · D2 · mseq=2
- Network & Social Engineering Attacks · D2 · mseq=3
- Identity & Access (AAA) · D3 · mseq=1
- Cryptography & PKI · D3 · mseq=2

**Registration facts (verified):** `renderModules()` groups items by the `module` STRING; `mseq` only sets
MODULE order (via min). So each PBQ registers with `module:"<exact name>", mseq:<module's value>,
type:"lab", pbq:true, domain:"<domain>"` and renders in that module's Practice tier. D5 fully refuted as a
gap — every D5 module already has a quiz + practice.

**Nancy design corrections (adopted):**
1. PBQs that "match a label to a scenario" must be ARTIFACT-DRIVEN (real logs/headers/transcripts/intel
   briefs), NOT descriptive paragraphs that telegraph the answer — model the (good) artifact-based
   `pbq-attack-identification.lab.html`, which uses real evidence. ([[feedback_labs_must_be_legit_engines]])
2. Cryptography & PKI PBQ must be a cert-chain DIAGNOSIS / lifecycle task — NOT definition-matching — to
   stay distinct from the existing `shield-crypto-pki` applet + `secplus-d3-crypto-pki-quiz`.
3. Build in WAVES of ~3 grouped by format, not 8 at once.
4. Client-side in-JS answer key is the accepted PBQ practice pattern (not a server-graded exam) — OK.

**Wave plan (each clones the polished `pbq-attack-identification.lab.html`: full-width, 16px fonts,
sticky tracker, score-gated, completion wiring):**
- **Wave 1 — artifact-driven IDENTIFY (evidence cards):** Malware (`pbq-malware-identification`),
  Social/Network (`pbq-social-network-identification`), Threat-Actor (`pbq-threat-actor-attribution`). ✅ SHIPPED + LIVE.
- **Wave 2 — classify (cloned `pbq-control-classification`):** Change Management (`pbq-change-management`),
  Governance & Asset Mgmt (`pbq-governance-asset`), Identity & Access AAA (`pbq-iam-aaa`, 2-axis). ✅ drive-QC'd 8/8, Chris PASS.
- **Wave 3 — apply/diagnose:** Design Principles / Zero Trust (`pbq-design-principles`, single-axis classify),
  Cryptography & PKI (`pbq-pki-diagnosis`, artifact-driven cert/TLS diagnosis from openssl/browser errors). ✅ drive-QC'd 8/8, Chris PASS.

**✅ PRACTICE GAP CLOSED — 8 of 8 modules filled. All 22 SY0-701 modules now have Learn + Practice + Assess.**
(Wave 1 = Malware/Network-Social/Threat-Actor D2; Wave 2 = Change Mgmt/Governance/AAA; Wave 3 = Design Principles/PKI.)
Verified: per-module manifest scan shows 0 modules missing practice. 8 new PBQ labs total, all artifact-driven or
objective-classify, all drive-to-completion 8/8, all Chris PASS, all registered in manifest + ContentCatalog (searchable).
Each PBQ: authored answer key (mine) → interactive-code-architect build → headless drive-to-completion QC
→ register manifest + ContentCatalog → Chris gate → deploy in batches.

## UPDATE 2026-06-27 (later) — side quick-links rail + acronym reference shipped
Operator: "where are the side quick links? where we can have quick access to pbq's and acronyms etc" → "get it done."
- [x] **Side quick-links rail** added to the hub (`index.html`). Converted the hub from a 1100px narrow-centered
      single column (a hard-rule violation) to a full-width two-column layout (`.container` 1100→1400px +
      `.page-layout` grid `1fr 300px`), matching the operator-approved WSA hub. New sticky `<aside>` rendered by
      `renderSidebar()` (manifest-driven), 3 sections: **Quick Access** (Acronyms · Practice Exams · Games),
      **Performance-Based Qs** (direct links to all 4 PBQ labs — previously buried inside domain cards),
      **Exam Domains** (D1–D5 jumps; click opens+scrolls the card via a hashchange handler). Webp icons, no emoji.
- [x] **SY0-701 Acronym Reference** page built: `security-plus/reference/sy0-701-acronyms.reference.html`.
      321 entries / 320 unique abbreviations, extracted VERBATIM via pdftotext from the official CompTIA
      SY0-701 Exam Objectives v5.0 acronym appendix. Live filter (abbr OR expansion, "Showing N of M"),
      full-width 4-col grid, AccessGuard-gated. Registered in ContentCatalog (`shield-sy0-701-acronyms`) so
      GlobalSearch surfaces it.
- QC: headless render-QC of both (two-column real, sticky, ≤1200px collapse, 0 broken icons, 0 console errors,
      filter round-trips 321→1→321, 10 expansions spot-checked accurate). Nancy must-not-break checks pass
      (no overflow/body.filter → Dr. Hex FAB stays fixed). Chris: PASS.
