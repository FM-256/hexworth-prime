"""semantic_disclosure.py — does this response GIVE AWAY the lab's answer?

WHY THIS EXISTS
    `voice_linter.check_no_forbidden_disclosure` is string matching, and string
    matching cannot answer this question. Six rounds of adversarial review on
    two Skill Maps established the limit concretely:

        "Kerberoast the account, then DCSync the domain."      <- must block
        "Kerberoast yields a hash, unlike DCSync which gives
         replication rights."                                  <- must allow

    Same words. Same proximity. Opposite intent. Every pattern that caught the
    first also caught the second, and widening to fix that produced patterns
    which refused a lab's own transfer-prompt answer while still letting
    "Use PATCH." straight through. The tool was wrong for the job.

THE DESIGN — REGEX FOR RECALL, MODEL FOR PRECISION
    The mistake was demanding precision from regex. Precision is what regex
    cannot give; recall is what it gives cheaply. So the roles invert:

      1. TRIGGER (`should_check`) — a deliberately over-broad string test.
         False positives are FINE here: it decides nothing, it only decides
         whether asking is worth the latency. Most turns never mention an
         answer token and skip the judge entirely.

      2. JUDGE (`judge_disclosure`) — a local model answering ONE boolean with
         the lab's real answer supplied as ground truth. This is a meaning
         question and a model is the right tool for it.

    The orchestrator runs self-hosted Ollama with the model resident in VRAM
    (OLLAMA_KEEP_ALIVE, default 30m), so the judge costs latency and GPU, not
    money. On a metered API this design would not be worth it; here it is.

SHADOW MODE IS THE DEFAULT, DELIBERATELY
    A classifier nobody has validated must not silently start refusing students.
    `HEX_SEMANTIC_GUARD=shadow` (the default) LOGS what it would have blocked
    and changes nothing. Promote to `enforce` only after checking the shadow
    logs against real traffic. This mirrors the path voice_linter itself took —
    log-only, then Phase 2 enforce-mode for codes proven not to false-positive.

FAILURE DIRECTION, STATED PLAINLY
    On timeout, transport error, or an unparseable reply the judge FAILS OPEN:
    the response goes to the student. Breaking the tutor because a judge is slow
    is a worse outcome than a leak. But every fail-open is COUNTED and logged,
    and the counter is exposed for the deploy audit — because the recurring
    lesson on this platform is that a guardrail which degrades silently is worse
    than no guardrail at all.
"""
from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass, field
from typing import Optional

log = logging.getLogger("hex_ai_orchestrator.semantic_disclosure")

# shadow | enforce | off
MODE = os.environ.get("HEX_SEMANTIC_GUARD", "shadow").strip().lower()
JUDGE_MODEL = os.environ.get("HEX_SEMANTIC_GUARD_MODEL", "qwen2.5:7b")
TIMEOUT_S = float(os.environ.get("HEX_SEMANTIC_GUARD_TIMEOUT", "6"))

VIOLATION_CODE = "no_semantic_disclosure"

# Observability. A judge that quietly stops working must be visible.
_counters = {"triggered": 0, "judged": 0, "disclosed": 0, "fail_open": 0, "skipped_no_guard": 0}


def counters() -> dict:
    """Snapshot for /health and the deploy audit."""
    return dict(_counters)


@dataclass
class SemanticGuard:
    """Declared by a Skill Map. Without one, the judge never runs for that lab."""
    answer_summary: str                      # ground truth, given to the judge
    trigger_terms: list = field(default_factory=list)   # recall-side tokens

    @property
    def enabled(self) -> bool:
        return bool(self.answer_summary and self.trigger_terms)


@dataclass
class JudgeResult:
    discloses: bool
    reason: str
    failed_open: bool = False


def should_check(text: str, guard: Optional[SemanticGuard]) -> bool:
    """TRIGGER — high recall, low precision, on purpose.

    Returns True if the response mentions anything answer-shaped for this lab.
    A false positive here costs one local inference. A false NEGATIVE costs the
    whole guardrail, so the terms should be generous: include synonyms, spelled
    and unspelled number forms, and the vocabulary the lab actually uses.
    """
    if not guard or not guard.enabled or not text:
        return False
    for term in guard.trigger_terms:
        t = term.strip()
        if not t:
            continue
        # Bare \b-bounded term match. No proximity, no connectors, no ordering —
        # all the machinery that failed belongs on the judge side, not here.
        if re.search(r"\b" + re.escape(t).replace(r"\ ", r"\s+") + r"\b", text, re.I):
            return True
    return False


_PROMPT = """You are a strict grader checking one tutoring reply.

THE LAB'S ANSWER (ground truth, never reveal it):
{answer}

THE TUTOR'S REPLY TO CHECK:
{reply}

Question: does the reply GIVE AWAY the answer above, or state which specific
option/step the student should choose?

Answer YES if the reply hands over the answer, names the specific choice to
make, or lays out the ordered steps of the solution.
Answer NO if the reply only explains concepts, defines terms, compares options
without picking one, or asks the student a question — even if it mentions the
same words as the answer.

Reply with JSON only: {{"discloses": true|false, "why": "<8 words>"}}"""


def _parse(raw: str) -> Optional[JudgeResult]:
    """Tolerant parse. A judge that returns prose around its JSON is still useful."""
    if not raw:
        return None
    m = re.search(r"\{[^{}]*\"discloses\"[^{}]*\}", raw, re.S)
    if not m:
        return None
    try:
        data = json.loads(m.group(0))
    except (ValueError, TypeError):
        return None
    if not isinstance(data.get("discloses"), bool):
        return None
    return JudgeResult(discloses=data["discloses"], reason=str(data.get("why", ""))[:80])


async def judge_disclosure(text: str, guard: SemanticGuard, *, client=None,
                           ollama_url: str = "http://127.0.0.1:11434") -> JudgeResult:
    """JUDGE — one boolean from a local model. Fails OPEN and counts it.

    `client` is an injectable httpx.AsyncClient-shaped object so the parsing and
    failure paths can be tested without a model. The MODEL's accuracy cannot be
    unit-tested and must be validated from shadow-mode logs against real traffic
    before this is promoted to enforce.
    """
    _counters["judged"] += 1
    prompt = _PROMPT.format(answer=guard.answer_summary.strip(), reply=text.strip()[:4000])
    payload = {
        "model": JUDGE_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "options": {"temperature": 0},     # a grader must not be creative
        "format": "json",
    }
    try:
        if client is None:
            import httpx
            async with httpx.AsyncClient(timeout=TIMEOUT_S) as c:
                r = await c.post(f"{ollama_url}/api/chat", json=payload)
                r.raise_for_status()
                body = r.json()
        else:
            r = await client.post(f"{ollama_url}/api/chat", json=payload)
            body = r.json()
        raw = (body.get("message") or {}).get("content", "")
        parsed = _parse(raw)
        if parsed is None:
            _counters["fail_open"] += 1
            log.warning("semantic_guard: unparseable judge reply, failing OPEN: %r", raw[:120])
            return JudgeResult(False, "unparseable judge reply", failed_open=True)
        if parsed.discloses:
            _counters["disclosed"] += 1
        return parsed
    except Exception as exc:                      # noqa: BLE001 — deliberate catch-all
        _counters["fail_open"] += 1
        log.warning("semantic_guard: judge unavailable (%s), failing OPEN", exc.__class__.__name__)
        return JudgeResult(False, f"judge unavailable: {exc.__class__.__name__}", failed_open=True)


async def evaluate(text: str, guard: Optional[SemanticGuard], **kw) -> Optional[JudgeResult]:
    """Full path: trigger, then judge. Returns None when the judge did not run.

    Callers decide what to do with a positive result based on MODE — in shadow
    the caller must log and NOT block.
    """
    if MODE == "off":
        return None
    if not guard or not guard.enabled:
        _counters["skipped_no_guard"] += 1
        return None
    if not should_check(text, guard):
        return None
    _counters["triggered"] += 1
    return await judge_disclosure(text, guard, **kw)
