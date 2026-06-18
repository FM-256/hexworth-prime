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

## Status

- **Done:** My First Agent — three context sections (`715f04754`) + Level 1 executable rebuild
  (`2771bc242`, exemplar). Tracked as sprint **AI-AUDIT-1**.
- **Next:** Agent L2–L5, then siblings per the table.
