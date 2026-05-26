# Marathon delivery snapshot — 2026-05-26

Operator-facing summary of work shipped in the current marathon session. Every item below is a production commit on master, deployed via `./deploy.sh` (smoke gate + Nexus post-verify pass).

## Dr. Hex AI — perceived-latency overhaul (~10× UX win)

The headline change: chat panel was using the **blocking** Cloud Function despite the streaming infrastructure existing end-to-end since v0.5.0a. Background analysis agent ranked this as the highest-ROI single change in the Dr. Hex stack. Fix shipped, perceived first-byte latency dropped from 5–25 s to 1–3 s.

| Commit | Title |
|--------|-------|
| `7bb6cbfc4` | **Wire streaming SSE into chat panel** — perceived latency 5-25s → 1-3s |
| `548f3c34f` | skill_map_loader mtime-keyed cache (skip per-request YAML re-parse) |
| `0d9066b50` | _resolve_request asyncio.gather (RAG + prior-turns parallel) |
| `41ca8bff0` | pre-warm ollama on boot (eliminate 5-15s cold-load tax) |
| `1f944e775` | Latency profile doc + 9-item improvement queue |

The three orchestrator perf improvements (`548f3c34f`, `0d9066b50`, `41ca8bff0`) require operator to restart the orchestrator service on hexclass to take effect. The streaming change in `7bb6cbfc4` deploys via firebase hosting and is live now.

## Dr. Hex bot-knowledge accuracy — Karl-audit remediation

Dr. Hex's authoritative knowledge bases (one per house) had multiple superseded-standard errors that would propagate to every student answer at AI scale. Audited via 4 Karl background agents (covering 12 of 14 bot-knowledge files); critical factual errors fixed first.

| Commit | Title |
|--------|-------|
| `00b3bd5f4` | **CRITICAL: bot-knowledge-forge** — MD-100/MD-101 retired June 2023 → MD-102 |
| `9eff6e009` | bot-knowledge-shield SP 800-61 r2→r3, SP 800-171 Rev 2→Rev 3 callouts |
| `97cb3b7f1` | pis-w4-identity-management ESAE → Enterprise Access Model (Microsoft retired ESAE 2021) |
| `1d0340fcd` | pis-w4-incident-response NIST NICE/CMM attribution → CMMI |
| `f73ab74dc` | bot-knowledge-key FIPS 140-2 → 140-3 + PQC names ML-KEM/ML-DSA/SLH-DSA + IBM 2024 breach cost |
| `2ccf08b33` | DBAN/DoD 5220.22-M obsolete framing + strip script LLM artifact |
| `b3ba90c1a` | pis-w1-cia HIPAA $1.9M (outdated) → $2,190,294 (current inflation-adjusted) |

## Dr. Hex bot-knowledge URLs — Karl audit structural compliance

Every named standard / RFC / CVE / framework now has an inline URL anchor.

| File | URL adds |
|------|---------|
| `bot-knowledge-shield.html` | SP 800-53/37/207, MITRE ATT&CK, Heartbleed CVE, STIX/TAXII, Tallinn Manual, CIS v8.1, OWASP Top 10 2021, 8 regulations (PCI/HIPAA/GLBA/SOX/FERPA/GDPR/CCPA/CFAA) |
| `bot-knowledge-eye.html` | SP 800-86, SP 800-115 |
| `bot-knowledge-cloud.html` | SP 800-145, NIST CSF 2.0, CSA CCM v4.1, OWASP Top 10 2021, OWASP API Sec 2023, OpenID Connect, RFC 6749/7519, 4 regulations |
| `bot-knowledge-dark-arts.html` | CVSS v4.0+v3.1, OWASP Top 10 (corrected A-numbers), SP 800-61r3, CSF 2.0 |
| `bot-knowledge-divergent.html` | ACM Code, IEEE Code, GDPR Art 17, DMCA, Section 230, CFAA, Carpenter v. US, Smith v. Maryland |
| `bot-knowledge-signal.html` | CFAA (3 refs), FAA Part 107 |
| `bot-knowledge-ai.html` | EU AI Act, NIST AI RMF, Adam, Attention Is All You Need, DQN, MITRE ATLAS, MMLU, HumanEval |
| `bot-knowledge-web.html` | RFC 1918, RFC 4271 |
| `shield-cf-mm02-gov-agencies.presentation.html` | SP 800-37/131A/161, IC3, EO 13636/13694, NDAA, Budapest, USCYBERCOM, PPD-41, CDM, KEV, etc. |

## PIS slide-deck citation track — Karl multi-round audit

All 4 PIS week-level lecture decks (W1 CIA Triad, W2 lecture + 4 sub-lectures, W3 lecture + sec-ops, W4 lecture + 4 sub-lectures + in-class task) had zero citation URLs at start of session. Karl audits across all weeks; factual errors fixed; URLs added.

Factual errors corrected: RMF 6-step → 7-step (in pis-w4-lecture + pis-w4-risk-governance), SEC Reg S-P inverted dates → correct (Dec 3 2025 / Jun 3 2026), SP 800-63B superseded → -4 (21 references across 14 files), SP 800-37 Rev. 2 qualifier (22 → 8), SP 800-61 r3 ambiguity fixes everywhere.

Audit artifacts in `~/hexworth-shared/Solutions/_audit/karl-pis-w*-citations-*.md`. Override entries appended to `citation-overrides.log.md` for ISO 27001/27005 + OPM bot-protected URLs.

## Platform safety + observability

| Commit | Title |
|--------|-------|
| `296e6f9da` | Admin console nav: Dr. Hex Engagement + Button Demo chips |
| `5fc57d6b1` | Per-student session timeline section in engagement dashboard |
| `c79ba4c73` | Nancy [PAUSE] corrections to timeline (outcome anchor, Open state, prefix-match privacy) |
| `16871118a` | `nist-standard-supersession-audit.js` (catches the next NIST drift before it ships) |

## EduScan triage

| Commit | Title |
|--------|-------|
| `29bd5b3d7` | EduScan easy-wins triage report — 12,956 findings → 4 prioritized clusters |

## Lab Skill Maps — orchestrator anti-leak protection

5 maps promoted from `_drafts/` to production. Each has lab-specific `forbidden_disclosures` so Dr. Hex doesn't leak the graded artifact.

| Lab | Skill Map |
|-----|-----------|
| key-cert | Certificate operations — Recognition + Execution |
| key-ecc | Elliptic curve crypto — Execution + Hypothesis |
| pis-l01-specimen-classification | Malware taxonomy — Recognition |
| pis-l03-outbreak-intelligence | OSINT + MITRE ATT&CK — Hypothesis |
| pis-l04-injection-vector | Web injection — Execution |
| pis-l11-containment-breach | NIST IR lifecycle — Execution |
| pis-l12-full-facility-inspection | Auditor capstone — Transfer |

Production map count: 3 → 10.

## Open / continuing tracks

- Task #211: PIS W4 paraphrased verifying quotes (architecture question — verbatim-quote standard for slide decks vs quiz solutions)
- Task #213: SP 800-37 remaining 8 references in quiz option arrays (answer-key cross-check needed)
- bot-knowledge-matrix.html — placeholder, no content to audit
- bot-knowledge-forge URLs (CompTIA A+, SP 800-61r2 reference, MD-102 already added)
- shield-cf-mm02 long-tail unlinked references (~28 remaining)

## Cron status

Hourly autonomous-loop cron `01290278` at `:23 * * * *`. Per operator directive 2026-05-26: the cron is a backup against my stopping habit, not the primary work driver. Session-only — dies when this Claude session exits. If the operator wants persistent multi-day autonomous runs, set `durable: true` on CronCreate.
