# HEXOS-4 — Home Directory

**Status: designed, not built.** Taskboard #329. Scope parent: `hex-os-scope.md:94-96`.

---

## TLDR

HEXOS-4 is specified as "unify `ModuleProgress`, badges and transcript into one addressable
per-user object." The survey that preceded this document found that **the stores it would unify
already disagree with each other**, in six ways serious enough to log as bugs (BUG-236 through
BUG-241 in `_docs/operations/BUG_TRACKER.md`).

That changes what the right build is. A unified store written over disagreeing sources does not
resolve the disagreement; it **launders** it. One record would then assert a single number where
today two systems visibly hold two, and the wrongness becomes authoritative and unattributable.

So: **HEXOS-4 is a read model, not a migration.** It reads the existing systems, never writes to
them, never re-awards, and where sources conflict it reports the conflict instead of silently
picking a winner. Nothing is merged, nothing is moved, and the whole thing is deletable without
touching a single byte of student data.

This is not a novel idea. It is the pattern `TrophyCabinet.js` already established.

---

## The precedent this follows

`_app/components/TrophyCabinet.js:3-13` states its own contract:

> this combines the VIEW, not the plumbing. It READS from the existing systems and never migrates
> or re-awards. No storage is merged, no earned data is moved.

It has zero `localStorage` writes and zero Firestore calls. It unified the badge presentation
across `AchievementRegistry` and `ObservatoryBadges` without touching either store, and it shipped.
HEXOS-4 is the same move at a wider scope.

The counter-precedent is also on record and is the one to avoid: `functions/ctf-stats.js:2-11`
documents three conflicting definitions of "pwned" that were only closable by making the server
authoritative and **removing the client writers in one atomic change alongside a rules tightening**.
That is what a genuine unification costs. It is the right eventual answer for some of these fields
and it is emphatically not a side-effect of building a home directory.

---

## What it must NOT do

These are constraints, not preferences. Each maps to a defect already on the books.

| Prohibition | Why |
|---|---|
| No write to any existing progress store | Every store here has multiple writers already; adding one more is how BUG-238 happened |
| No re-award, no back-fill of badges | `users/{uid}/server_awards` is the tamper-evident proof store. A client-side back-fill makes a server-issued badge indistinguishable from a synthesised one, which is the exact property it exists to preserve |
| No collapsing `verified` provenance | BUG-239: the gate `verified` flag is already discarded once, on restore. A read model that shows "gate 6 complete" without provenance repeats that defect at a new surface |
| No deriving a grade client-side | Standing rule: never client-grade. The home directory REPORTS a server-held score; it never computes one |
| No single number where sources disagree | Show both and label them. See below |

---

## Conflict display, which is the actual feature

The valuable thing this build can do that nothing today does: **make the disagreements visible**.
Today they are invisible, which is why five of the six logged bugs survived this long.

Where two sources disagree, the home directory shows the server-held value, marks it, and names
the other. Concretely:

- **XP** is computed in four places with four tables (`ModuleProgress.js:422-425`,
  `ProgressManager.XP_REWARDS`, `functions/index.js:1325-1333`, `functions/account-merge.js:55-64`),
  and `XPCalculator.js:2-6` declares itself the deterministic single authority. Show
  `XPCalculator`'s recomputed value. Where the stored `users/{uid}.xp` differs, surface the delta
  rather than hiding it — that delta is a bug report writing itself.
- **Streak** has two definitions merged by `Math.max` with a Cloud Function that has no caller
  (BUG-237). Show the client value, flag when the server value differs.
- **Quiz scores** have three policies (BUG-241). Until that decision lands, show the value from
  `users/{uid}.quizzes` AND the best attempt from `users/{uid}/quiz_attempts` when they differ.
  Two numbers with labels is honest; one number is a guess.

A conflict count on the page is also the cheapest possible regression detector for this whole
class of defect. If it rises after a deploy, something started disagreeing.

---

## Sources, and which is authoritative

Server-held records win whenever one exists, without exception. Client stores are shown as
*local, unconfirmed* and never promoted.

| Fact | Authoritative source | Client mirror (display only) |
|---|---|---|
| Badges (mission/course) | `users/{uid}/server_awards/{badgeId}` | `hexworth_achievements`, `_v2` |
| Flag captures | `users/{uid}/flag_captures` | — |
| Gate completion + provenance | `users/{uid}/gates/gate{N}` incl. `verified`, `source` | `gate{N}_complete` (do not trust) |
| Mission completion | `users/{uid}/mission_completions` | — |
| Quiz attempts (ledger) | `users/{uid}/quiz_attempts` | `hexworth_quiz_scores` |
| Quiz score (summary) | `users/{uid}.quizzes` — **contested, see BUG-241** | flat progress blob |
| Module/lab completion | `users/{uid}.modulesCompleted`, `.labsCompleted` — **contested, see BUG-238** | `hexworth_progress` |
| XP / level | recomputed by `XPCalculator` | stored `users/{uid}.xp` |

**Transcript does not exist.** `_docs/architecture/user-transcript-and-skill-anchoring.md:3` says
"scoped, not built", and grepping `functions/` and `_app/components/` finds no transcript code.
HEXOS-4 must not imply otherwise. The nearest real thing is the 34 `_app/lab-skill-maps/*.yaml`,
26 of which assess by flag and are therefore already server-provable from `flag_captures`. That is
the honest seed of a transcript and is the only part worth surfacing now.

---

## The one decision that is not mine

**BUG-241: is a quiz grade best-score or latest-score?**

This blocks the home directory stating a grade at all, because today the platform holds both
answers and shows whichever was written last.

**Recommendation: best-score.** The reasoning:

1. Two of the three existing implementations already do it — `mergeQuizzes`
   (`account-merge.js:83-85`) and `mergeQuizScores` (`FirestoreManager.js:725`) both keep the
   higher, with an explicit `// Keep highest score`. Only `recordProgress` overwrites, and it is
   the one nobody wrote a policy comment for. The intent is already best-score; the primary
   writer just does not implement it.
2. It is recoverable either way. `users/{uid}/quiz_attempts` records every submission
   (`functions/index.js:2134`), so latest-score can always be derived from best-score data, and
   the reverse is also true. Nothing is lost by choosing.
3. A student who retakes to revise and scores lower has been *punished for practising*. That is
   the wrong incentive for a teaching platform.

**Counter-argument, stated fairly:** for a graded assessment of record, latest-score is the more
defensible academic policy, and an instructor may need the most recent attempt rather than the
best one. If that matters, the answer is not a different global default but a per-quiz `policy`
field, which is more work and should be decided deliberately rather than inherited.

Whichever is chosen, all three sites must state it identically, or it drifts again.

---

## Build order

1. **Read-only projection module.** No UI. Pure function: uid in, structured record out, with a
   `conflicts[]` array. Testable without a browser.
2. **Gate on the invariants.** It must be impossible for this module to write. A test that fails
   if it acquires a `set`/`update`/`setItem` call, in the spirit of `pwa.test.js` asserting an
   absence.
3. **The page.** Renders the projection, shows conflicts, never computes a grade.
4. **Only then**, and separately, consider fixing the underlying stores — that is the
   `ctf-stats.js` pattern (server authoritative, client writers removed, rules tightened, one
   atomic change) and it is its own reviewed piece of work, not a side-effect of this one.

Steps 1-3 are safe to build now. Step 4 is not, and is not part of HEXOS-4.
