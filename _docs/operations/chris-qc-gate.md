# Chris — Purpose & Quality-Bar QC Gate

**Status:** Active · **Created:** 2026-06-12 · **Agent:** `~/.claude/agents/chris.md`

## TLDR

Chris is a mandatory adversarial gate that runs **before substantive, operator-facing work is presented or shipped**. He forces the primary agent to answer, and defend with evidence, three things it routinely skipped: *what is this for, what does "good" concretely mean, and does the output actually meet that bar.* He defaults to BLOCK and only PASSes on concrete answers backed by real evidence. He exists so the operator stops being the quality gate.

## Why Chris exists

The primary agent's failure mode (memory `feedback_quality_from_the_start`): it produces something that *looks* done quickly, without first defining the purpose/bar or self-QCing against it, so the operator catches the problems, sometimes over several rounds. Nancy already hunts flaws in a proposed change; Karl verifies citations; Bridget audits sync. None of them ask the question that was actually being missed: **was the purpose and bar defined, and does the finished work meet it?** That is Chris's lane.

## What Chris checks (7 questions)

| # | Question | Fails when |
|---|----------|-----------|
| 1 | What is this FOR? (consumer + their need) | answer is vague ("the m17 deck") |
| 2 | What does "good" concretely look like? | bar is a feeling ("looks professional"), not observable/testable |
| 3 | Reference exemplar, and WHY it works (function)? | "copied m14's layout" — form, not function |
| 4 | Does output meet the bar — with EVIDENCE? | assertion ("I'm confident") instead of evidence (read-back, screenshot, measured) |
| 5 | Verified vs assumed? | anything load-bearing was assumed, not checked |
| 6 | Function over form? | generic-but-pretty output that misses the purpose |
| 7 | Consumer served + would you sign it? | a student would not actually learn from it |

PASS requires all 7 to hold. Chris reads the **actual artifact** fresh (never trusts the primary's description) and cites evidence in his verdict.

## When Chris is mandatory

**In scope (must get a Chris PASS before presenting or shipping):**
- Any substantive operator-facing artifact: content, slide decks, features, applets, documentation
- Any deploy of new/changed student-facing content or features
- Declaring a piece of work "done"

**Out of scope (do not invoke — would be bureaucratic noise):**
- Trivial mechanical fixes (a one-line CSS tweak, a typo)
- Conversational replies
- Read-only investigation

## How to invoke

Dispatch the `chris` subagent with: the artifact (path / rendered output / diff) **plus** the primary's written answers to the 7 questions. Example framing:

> Chris, gate this before I show the operator. Artifact: `_app/houses/cloud/modules/wsa/m17-.../cloud-presentation.module.html`. (1) For: a student learning firewall config; they need each slide's takeaway to stick. (2) Bar: each visual's TLDR is one coherent sentence, 0px overflow at 1280x720, no garbled text. (3) Exemplar m14, which works because the art is the gestalt and the overlay states the one takeaway... [4-7 with evidence].

Chris returns `CHRIS: PASS — ...` or `CHRIS: BLOCK — <numbered gaps>`. On BLOCK, fix and re-submit; do not present until PASS.

## Relationship to the other gates

Chris is in the mandatory-gate family with Nancy (`adversarial-reviewer`), Karl, and Bridget, but his question is distinct:
- **Nancy** — find flaws/risks/simpler alternatives in a *proposed change* (before editing).
- **Karl** — every citation is live, content-matched, verbatim.
- **Bridget** — HTML ↔ Firestore ↔ Confluence sync is consistent.
- **Chris** — was the *purpose and bar* defined, and does the *finished work* meet it (before presenting/shipping).

Chris judges; he never edits.

## Future enforcement (not yet wired)

Agent-gate is live now. A harder enforcement option (deferred, operator decision): add a pre-deploy check in `deploy.sh` that requires a recorded Chris PASS for content/feature deploys, the way the smoke gate and Nexus gate work. Until then, Chris is enforced by the mandatory-gate rule, not mechanically.

## Related

- Agent: `~/.claude/agents/chris.md`
- Memory: `feedback_quality_from_the_start`, `reference_chris_qc_gate`
- Sibling gates: `~/.claude/agents/{adversarial-reviewer,karl,bridget}.md`
