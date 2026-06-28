# Security+ Lesson Citation Standard

**TLDR** — The "book"/text lessons for the Security+ hub (`_app/houses/shield/security-plus/lessons/*.lesson.html`) must ground **every factual claim** in a **live, public, primary-tier source with a real URL**, verified by Karl (the citation auditor) at each gate. No claim ships uncited; no paywalled source is used as a citation. Reference sample: `shield-sp-cryptography.lesson.html` (Karl-PASS 2026-06-28).

This standard was set by the operator after the first sample was built from model knowledge with decorative (URL-less) and partly-fabricated citations. See [[project_shield_labs_gold_standard]] for the sibling lab standard.

---

## What counts as a citation (the bar)

| Source type | Acceptable? | Form |
|---|---|---|
| **NIST** (FIPS, SP, IR) | YES | The official publication page, e.g. `https://csrc.nist.gov/pubs/fips/197/final`. The landing page is acceptable for a teaching lesson (it is NIST's canonical page for the standard and links the PDF). Deep-link PDF `#page=NN` anchors are NOT required for lessons (that is the quiz-solutions-manual bar). |
| **IETF RFCs** | YES | `https://www.rfc-editor.org/rfc/rfcNNNN` (full HTML text). |
| **CompTIA objectives** | YES | `https://www.comptia.org/en-us/certifications/security/` for the objective mapping (this topic = Objective 1.4, etc.). |
| **Original research / primary site** | YES | e.g. `https://shattered.io/` for the SHA-1 collision. |
| **Vendor / standards-body docs** | YES | Live HTML page that supports the claim. |
| **Paywalled textbooks** (Sybex Study Guide, Cryptography Engineering, Applied Cryptography, etc.) | NO — not as a citation | List only in a clearly-labeled **"Further Reading (publisher resources — not used as citations)"** block. They may inform structure/exam-alignment but must not be the cited source of any factual claim. |

**Rules:**
1. Every substantive claim carries an inline citation (`<span class="cite">[<a href="#ref-x">FIPS 197</a>]</span>`) pointing to a source entry.
2. Every source entry (`<div class="source-entry" id="ref-x">`) has a real, live `<a href>` URL.
3. Every named specific (a named study, algorithm, RFC, standard, date) must appear in the cited source — no fabricated or misattributed specifics. (Karl's failure modes from the first sample: "AES-256 required for TOP SECRET" attributed to FIPS 197 → that is NSA/CNSS policy; 2024 PQC names attributed to a 2023 textbook; an invented Schneier sentence; "SHAttered" with no source; OCSP stapling cited to RFC 5280/6960 instead of RFC 6961.)
4. No inline anchor without a matching source entry; no orphan source entry.
5. Get the exam-objective number right: in **SY0-701, cryptography + PKI are Objective 1.4** (not the SY0-601 "2.8/3.9").

## Verified source map (cryptography — reuse / extend per topic)

AES → csrc.nist.gov/pubs/fips/197/final · SHA-2 → /fips/180-4/final · signatures/ECDSA → /fips/186-5/final · HMAC → /fips/198-1/final · key mgmt → /sp/800/57/pt1/r5/final · AES-GCM → /sp/800/38/d/final · transitions/3DES → /sp/800/131/a/r2/final · PQC ML-KEM/ML-DSA/SLH-DSA → /fips/203|204|205/final · PQC program → /projects/post-quantum-cryptography · quantum threat (Shor/Grover) → /pubs/ir/8105/final · X.509/CRL → rfc-editor.org/rfc/rfc5280 · OCSP → rfc6960 · OCSP stapling → rfc6961 · PEM → rfc7468 · TLS 1.3 → rfc8446 · SHA-1 collision → shattered.io. (All confirmed HTTP 200, 2026-06-28.)

## Build + gate flow per lesson

1. Pull the topic structure from the Sybex SY0-701 Study Guide chapter slides (`~/hexworth-shared/Raw sources/sec +/Slides/`) — exam-aligned skeleton only.
2. Write textbook-depth prose; anchor **every** technical claim to a primary source per the table above (verify each URL is live, `curl -o /dev/null -w '%{http_code}'`).
3. Format: full-bleed, section-per-topic, a "Key Takeaway" box per section, a right-rail **Sources** panel, real webp icons, no emoji / em-dash / position:fixed / lazy-load, `class="back-link"`. Integration: AccessGuard, `ProgressManager.completeModule('<id>-lesson','shield','lesson')`, Dr. Hex button, PresentationA11y.js.
4. **Karl gate** (auditor) — apply the *lesson* standard above (landing pages OK). PASS required: every citation live + content-matched, no fabrications, all anchors resolve.
5. **Chris gate** — pedagogy/quality.
6. Wire into the module's **Learn** tier in `security-plus-manifest.json` so every topic has text → lab → quiz.
