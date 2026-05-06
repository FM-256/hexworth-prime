# DEPRECATED — wrong pattern

> This file's original content was a verbatim "paste-into-Karl" prompt with all 15 fw-w1-logical citations pre-staged (URL, quote, classification, areas of concern). That framing was wrong — it constrains Karl to confirming pre-staged conclusions instead of independently auditing.

## The right pattern

Karl is an SME in source verification. He doesn't need a structured prompt with the citations laid out for him. He doesn't need to be told which citations to focus on. He doesn't need pre-classifications. **All of those are biases.**

To invoke Karl on the fw-w1-logical sample, the entire prompt is:

```
Audit the citations in Confluence page id 8486914 (KBA space, hexworth.atlassian.net).
Credentials at ~/.config/confluence/credentials.json.
```

That's it. Karl reads the page himself. He identifies each citation. He audits each per his mandate (live + HTML-direct + opens-on-the-answer + content-matches-claim + quote-verbatim + source-type-appropriate). He returns per-citation verdicts. The submitter fixes DENY/REJECT and resubmits.

## Why this directory may still exist

The `karl-prompts/` directory was created under the wrong assumption that each artifact would need a tailored prompt. In practice, Karl's invocation is the same minimal shape regardless of artifact — point him at it and step back.

If a future use case genuinely needs MORE than "point at the artifact" (e.g., the artifact is in a system Karl doesn't know how to access, or the citation list is in an unusual format that needs explanation), the addition should be a one-paragraph access/format note, not a structured pre-staged prompt.

See `~/.claude/agents/karl.md` for Karl's full mandate.
