# "My First" Series — Executability Audit (lined up 2026-06-17)

## Why this exists

The operator logged into Microsoft Copilot Studio to actually *do* **My First Agent · Level 1**
and found it unusable: the lab described an **outcome** ("create an agent, name it, write
instructions, point it at a doc") but never walked through the real, sprawling tool UI. Worse,
Level 1 told the student to add "the provided help-desk FAQ" — **an asset that does not exist
anywhere on the platform.** Both QC gates (Nancy, Chris) confirmed the step was *physically
uncompletable*.

Level 1 has since been rebuilt as an executable, self-contained walkthrough (commit `2771bc242`)
and is the **exemplar** for this audit. The operator's call: "I honestly hope the rest of the labs
are more informative than this because if not we are going to have to do a deep audit." This is
that audit.

## The bar (what "done" means for a starter lab)

A starter project step PASSES only if **a genuine beginner, logged into the real current tool, can
execute it click-by-click and finish with a working result — without getting lost in the tool's
options.** Concretely, every level must:

1. **Name real screens and buttons** as they exist *today*, verified against the vendor's current
   quickstart/docs (not memory — the UI changes; a wrong click instruction is worse than vague).
2. **Be self-contained or supply real assets.** Any "provided" file (FAQ, policy doc, inbox, dataset)
   must be either (a) inline and copy-ready, or (b) a real hosted/downloadable asset linked from the
   page. No references to assets that don't exist.
3. **Give concrete, paste-ready text** where the student must author something (instructions, prompts,
   sample data) — not "write a clear purpose."
4. **Tell the student what to ignore** — the tools are wide; name which options to skip at this level.
5. **State licensing/access truthfully** (e.g. a Copilot Studio trial can create+test but NOT publish).
6. **End in an observable win condition + checkpoint** the student can verify inside the tool.

Exemplar pattern shipped in Level 1: the reusable `.cf-steps` numbered walkthrough + `.cf-faq-sample`
inline-asset block in `_app/projects/starter-first-agent.html`.

## Headline finding (cross-cutting)

**The "sample pack" does not exist.** `starter-first-agent.html` Requirements + Asset Manifest promise
"a help-desk FAQ, policy documents, and a sample inbox" — none are real files. Level 1's FAQ is now
inline; **Level 2 (policy docs) and Level 3 (sample inbox) still reference the missing pack.** Decide
per asset: inline-and-copy-ready vs. host a real downloadable. This likely repeats across siblings.

## Scope — what to audit, in order

Each item: verify against current vendor docs → rebuild outcome-descriptions into `.cf-steps`
walkthroughs → make self-contained / supply assets → Nancy + Chris gate → deploy.

| # | Target | Known/expected gaps |
|---|--------|---------------------|
| 1 | **starter-first-agent** L2–L5 | L2 RAG needs real policy docs + current Knowledge UI; L3 needs a real sample inbox + current Graph connector steps; L4 needs current Power Automate approval-flow UI; L5 orchestration. All likely outcome-descriptions today. |
| 2 | **starter-first-workflow** | Power Automate UI walkthrough; verify trigger/branch/approval steps against current Power Automate. |
| 3 | **starter-first-knowledge-base** | RAG ingest/retrieval steps; real corpus asset. |
| 4 | **starter-first-tool** | Function-calling / connector steps; auth/secrets concretely. |
| 5 | **ai-build-your-department** (capstone) | Multi-agent orchestration; depends on 1–4 being executable first. |

Per-level checklist (apply to every level of every project above):
- [ ] Vendor doc fetched + UI labels verified current
- [ ] Outcome-description replaced with a numbered click-path
- [ ] Every "provided" asset is inline-or-hosted (no phantom assets)
- [ ] Author-this steps give paste-ready text
- [ ] "What to ignore" called out
- [ ] Licensing/access accurate
- [ ] Observable win condition + checkpoint
- [ ] Nancy PROCEED + Chris PASS against the executability bar

## Method notes

- Ground every rebuild in the current vendor quickstart via WebFetch (Copilot Studio:
  `learn.microsoft.com/microsoft-copilot-studio/fundamentals-get-started`; Power Automate / Graph have
  their own current quickstarts). Re-verify each session — these UIs move.
- The QC miss that started this: the gate was set to "does it explain the concept" instead of "can a
  student execute it." Re-set Chris's bar to **executability** for every lab item. See
  [[feedback_quality_from_the_start]].
- Operator's live tool session is the highest-fidelity ground truth — request screenshots when a
  current screen is ambiguous.

## Feasibility finding (Level 3) — a level's *premise* can be broken, not just its wording

Level 3 ("Inbox Agent") was scoped before rebuild and found **infeasible as specified** on a
trial/student tenant: connecting a live mailbox needs the Office 365 Outlook connector + Entra
auth + a Power Automate agent flow (consumes Copilot Studio **capacity**) + publish — none
available on the create+test trial — plus it leaned on a non-existent "sample inbox." Rebuilt as
**Option A** (operator-approved): a self-contained in-test-panel triage (paste a provided sample
inbox, agent classifies + drafts, can't send because no connector is attached). The real-world
connector path is noted, not required.

**Lesson for the rest of the audit:** when a level's setup depends on connectors / live data /
publish / capacity, check whether it's executable on a trial *before* polishing the steps — the
fix may be to **change the scenario to a self-contained equivalent** that teaches the same skill,
not to rewrite an impossible setup. **L4 (Power Automate approval flow) is the next likely
feasibility problem** (agent flows consume capacity / need a licensed env).

**Second cross-cutting lesson (from L3 gate):** rebuilding a level isn't just the level card —
sweep the page-wide sections too. The L3 rebuild initially missed a stale **Asset Manifest**
entry ("Microsoft Graph (L3)") and a **Requirements** line capping the trial at "Levels 1–2."
Add to the per-level checklist: *update the Asset Manifest, Requirements, and Expected Outcomes
to match the rebuilt level.*

## Status

- **DONE — My First Agent, all of L1–L5** rebuilt to the executability bar, every level
  self-contained + trial-feasible: 3 context sections (`715f04754`); **L1** create+ground on an
  inline FAQ (`2771bc242`, exemplar); **L2** RAG/grounding, 2nd inline doc + real grounding
  controls (`a985db4db`); **L3** triage of an inline sample inbox, can't-send-by-design
  (`07c8d0ed1`); **L4** human-in-the-loop approval gate, propose→approve/deny→DRY RUN
  (`a81e1c306`); **L5** capstone governed daily-ops run orchestrating L1–L4 + action log
  (`e91ffdb56`). Tracked as sprint **AI-AUDIT-1**.
- **Next:** the **sibling projects** per the scope table — `starter-first-workflow`,
  `starter-first-knowledge-base`, `starter-first-tool`, then `ai-build-your-department`
  (capstone). Apply the same method; scope each level's feasibility first.
- **Pattern confirmed across L3+L4+L5:** the late levels' *premises* (live mailbox, live action
  flow, autonomous/triggered ops) aren't trial-executable. The fix is a self-contained
  in-test-panel equivalent that teaches the same skill (triage / approval gate / orchestration +
  governance), with the real licensed/triggered path noted as "in the real world." Expect the
  sibling projects (Workflow especially — Power Automate-heavy) to need the same treatment.
- **Also confirmed:** rebuilding a level means sweeping page-wide sections too (Requirements,
  Asset Manifest, cross-level notes) — every late-level gate caught a stale reference there.
