# clh-022 Page B — CLASSIC-CYCLING false-positive verification (2026-07-08)

## TLDR

EduScan QUIZ-011 flagged `quiz_keys/clh-022` answers `[0,1,2,3,0]` as a CLASSIC-CYCLING placeholder
pattern (the `i%4` cycle that bypasses QUIZ-008's skew threshold). The key is **genuinely correct** —
the five answers coincidentally cycle 0,1,2,3,0. Each is verified below against the Page B quiz's own
inline `explanation:` field (authoritative for a self-contained server-graded quiz). Added to the
QUIZ-011 allowlist (`_tools/eduscan/config/quiz-011-allowlist.json`) so the false positive is
suppressed; hash drift will re-fire as QUIZ-011B.

- Source HTML: `_app/houses/script/courses/clh/modules/clh-022/script-quiz.quiz.html`
- Firestore: `quiz_keys/clh-022` answers = `[0,1,2,3,0]`, answerHash `ef55667a45e6d5b921e846346f829a8e26b37dee`
- Topic: network reconnaissance tools (curl / dig / nc / wget / version disclosure). Page B is the
  Layer-B course-module tree; Page A (`houses/script/clh/script-clh-022.quiz.html`) is a different
  quiz on the `clh-022-legacy` key (see the CLH dual-tree split, commits f49bc891e + 0d56a8743).

## Per-question verification (index = the option the explanation states is correct)

| Q | Question | Correct option | Index | Explanation evidence |
|---|----------|----------------|-------|----------------------|
| 1 | Fetch HTTP headers only (no body) | `curl -I url` | **0** | "`curl -I` (capital I) sends a HEAD request, returning only headers." |
| 2 | Find a target's mail server | `dig target.com MX` | **1** | "`dig target.com MX` queries the MX (Mail eXchange) record." |
| 3 | What does `nc -zv target 22 80 443` do | Scans ports 22, 80, 443 | **2** | "`nc -z` scans ports without sending data (zero-I/O mode), `-v` verbose." |
| 4 | Download a file quietly | `wget -q file.pdf` | **3** | "`wget -q` (quiet mode) downloads files without progress bars or messages." |
| 5 | Why is "nginx/1.18.0" valuable intel | Search known vulns for that version | **0** | "Server version disclosure lets you search CVE databases for known vulnerabilities." |

Derived key = `[0,1,2,3,0]` — exact match to Firestore. The cycling shape is coincidental, not a
placeholder.

## Confluence + independent corroboration (Bridget three-way audit, 2026-07-08)

Bridget verified all 5 questions PASS on answer-text across HTML / Firestore / Confluence:
- **Confluence page 2818687** ("Script — CLH-022: CLH-022 Quiz: Network Reconnaissance", v1). Every
  question's answer TEXT matches HTML/Firestore. Caveat: the page predates the 2026-05-08 Rule-6
  rebalance (`a66cedbd1`, "[1,1,1,1,1] -> [0,1,2,3,0]"), so its "B(1)" index LABELS are stale
  leftovers from the old option order — cite the page's answer text, not its index labels.
- **Legitimate Karl Mode-2 audit**: `~/hexworth-shared/Solutions/_audit/karl-clh-poc-rebalance-2026-05-08.md`
  explicitly walks clh-022's 5 questions and states "ALL-PASS — 5/5 MATCH. Static key [0,1,2,3,0] is
  correct." This is the primary provenance for the allowlist entry.

Three independent confirmations that [0,1,2,3,0] is genuine: (1) HTML explanations (above),
(2) the 2026-05-08 Karl audit, (3) Confluence 2818687 answer text.

## Data-integrity defect flagged for operator (NOT auto-fixed)

Bridget found the `quiz_keys/clh-022` Firestore doc carries a **misattributed** `fixNote` /
`lastFixedBy: "seed-clh-022-disciplineB-2026-05-12"` claiming "Prior key [0,1,2,3,0] was a placeholder
... verified all 5 correct at options[1]" — but clh-022 does NOT appear in the 2026-05-12 Discipline-B
batch it cites (`qc49-architecture-audit-2026-05-12.md`); the text is boilerplate from an unrelated
batch. The `answers` array itself was never changed (still correctly [0,1,2,3,0]). RISK: a future
automated process trusting `fixNote` could wrongly "fix" clh-022 to [1,1,1,1,1]. Operator should
review/correct the `fixNote`/`lastFixedBy` metadata. Tracked separately from this allowlist fix.
