# QUIZ-DUP Finding — 2026-05-07

## Summary

ES-1107 v1 sync-helper C9 detector surfaced **14 cross-quiz duplicate answer-array clusters** on first full run. The most-impactful finding is a **9-quiz cluster** sharing the same 15-element answer array in **production Firestore**, **local registry (`functions/quiz_keys.json`)**, AND **Confluence Verified Answer Index**.

Status: **OPEN — operator review required.** Triage items written to `_triage_queue/quiz_dup_*` but no autonomous fix applied (graded answer keys; student impact requires operator validation per quiz).

## The 9-quiz cluster

All 9 of these quizzes have identical answer array `[0, 0, 2, 3, 2, 3, 1, 0, 3, 2, 1, 3, 1, 0, 1]` in production:

| Quiz ID | Path | Confluence VAI |
|---|---|---|
| `shield-pis-w1-quiz` | shield/intro-security or pis/ | (same array) |
| `shield-pis-w2-quiz` | shield/intro-security or pis/ | (same array) |
| `shield-pis-w3-quiz` | shield/intro-security or pis/ | (same array) |
| `shield-pis-w4-quiz` | shield/intro-security or pis/ | (same array) |
| `fw-w2-wireless` | shield/intro-security/quizzes/ | (same array) |
| `fw-w3-os-security` | shield/intro-security/quizzes/ | (same array) |
| `fw-w3-workstation` | shield/intro-security/quizzes/ | (same array) |
| `fw-w4-mobile` | shield/intro-security/quizzes/ | (same array) |
| `fw-w4-soho` | shield/intro-security/quizzes/ | (same array) |

Verified live in production Firestore via:
```
node -e "const a=require('firebase-admin');a.initializeApp({projectId:'hexworth-prime'});a.firestore().doc('quiz_keys/fw-w4-mobile').get().then(d=>console.log(d.data().answers))"
```

## Why this matters

Each of these 9 quizzes covers different content (week 1/2/3/4 of personal info security; wireless; OS; workstation; mobile; SOHO). Different content → different correct answers expected. **A student taking any of the 9 is graded against the same answer pattern.** This means:
- If `fw-w4-mobile` Q1's correct answer is option index 0, then `fw-w2-wireless` Q1's correct answer is also index 0 — by accident, not design.
- Students who happen to share the answer pattern get the right grade by luck; others get wrong grades.

## Root cause hypothesis

Likely a copy-paste error during STR-40 marathon (2026-05-06) when the `seed-str40-keys.js` script seeded Firestore. Either:
- One quiz's answer array was used as a placeholder for the others, never replaced
- OR a single VAI was extracted from a single Confluence page and reused for all 9 because the script grouped them

Karl-PASSed status (per `project_str40_marathon_complete.md`) confirms each quiz's questions and citations were verified — but the **answer key seeding step** appears to have collapsed all into one array.

The Confluence pages also share the same VAI, suggesting the upstream Confluence build script also used a single array. So drift propagated through every layer — exactly the bug class C9 was designed to catch.

## Other clusters (medium severity, partial list)

13 additional clusters surfaced — most are placeholder cycles (all-1, all-0, 0123-cycle) from quizzes whose Firestore seed never got real values. Notable:
- 6 quizzes share `[1,1,1,1,1,1,1,1...]` (length 15): `az104-ch02-quiz`, `feh-08`, `feh-09`, `feh-10`, `md100-m11`, `pc-ard-19-quiz`
- 9 quizzes share `[1,1,1,1,1,1,1,1...]` (length 10): `cse-04-network`, `cse-06-monitoring`, `cse-08-compliance`, `eth-04-quiz`, `eth-08-quiz`, `eth-11-quiz`, `eye-cysa-ch12-quiz`, `eye-cysa-ch14-quiz`, `pis-16-checkpoint`
- 3 quizzes share `[0,0,0,0,...]` (length 25): `divergent-cse-final`, `divergent-cse-midterm`, `security`

Full cluster list: see `_triage_queue/quiz_dup_*` in production Firestore or run `node _tools/nexus/nexus.js quiz-sync` locally.

## Recommended remediation

**Per quiz, in priority order:**
1. **9-quiz cluster (HAND-COPY DRIFT)** — for each, source the correct answer key from the original quiz's HTML (instructor-authored intent) or Karl-audited Confluence solutions page if it has *non-VAI* answer-text rows. Re-seed Firestore with the corrected array. Update local registry. Update Confluence VAI.
2. **Placeholder clusters (PLACEHOLDER, high severity)** — these are quiz_keys that never received real values. Either build the answer key (multi-hour Karl audit per quiz) or take the quizzes offline until keys are seeded.
3. **2-quiz drift clusters (MEDIUM)** — verify whether the share is legitimate or accidental. Most likely accidental; same remediation as 9-quiz cluster.

## Tools shipped 2026-05-07 to support remediation

- `_tools/quiz-sync/sync-helper.js --quiz <id> --with-confluence` — verify a single quiz across HTML, Firestore, Confluence
- `node _tools/nexus/nexus.js quiz-sync` — list all clusters with severity classification
- `_triage_queue/quiz_dup_*` — operator-facing triage entries for each cluster (auto-resolves on remediation)
- `_tools/quiz-sync/quiz-pages.json` — quizId → Confluence pageId registry for 3-source verification

## Cross-references

- ES-1107 v1 sprint: in-review, this is the catch
- STR-40 marathon: closed, but the seeding step may have introduced this
- Karl prompts: `_docs/operations/karl-prompts/`
- C9 detector logic: `_tools/quiz-sync/sync-helper.js` (mirror in `_tools/nexus/adapters/quiz-sync.js`)
- Production Firestore writes today: scheduled `quizQualityMonitor` CF (functions/quiz-quality-monitor.js — not yet deployed, runs weekly when shipped)

## Marker

This finding is **in operator queue**, not auto-fixed. The C9 tool is running in production now; on remediation, triage items auto-resolve.
