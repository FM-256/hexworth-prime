"""
tools.audit — fire-and-forget audit log for tool invocations.

Per v0.6.0c-3 design. Each tool dispatch (where exposure_rules.audit=True)
posts a small record to the Cloud Function `hexAiToolCallback`, which
writes to Firestore `tool_invocations` collection.

Fire-and-forget semantics:
    - The chat path NEVER blocks on the audit write
    - Failures log a warning but never propagate to the user
    - Audit is observability, not a security boundary
    - If the CF is unreachable, dispatch still completes normally

Why CF callback (vs direct Firestore from hexclass):
    Per the v0.6.0c design doc — keeps Firestore access centralized in
    functions/, avoids putting firebase-admin + service-account JSON on
    hexclass, and reuses the same X-API-Key the orchestrator already
    has for the (forthcoming) get_student_progress callback.

Configuration env vars:
    HEX_AI_AUDIT_URL  — full URL of hexAiToolCallback CF (e.g.
                        https://us-central1-hexworth-prime.cloudfunctions.net/hexAiToolCallback)
    HEX_AI_API_KEY    — shared secret. Same key in orchestrator's
                        HEX_API_KEYS + Firebase secret HEX_AI_API_KEY.
    HEX_AI_AUDIT_TIMEOUT_S — per-call timeout. Default 3s.

If HEX_AI_AUDIT_URL is unset, audit is disabled (logged at startup).
This is the dev/standalone mode where the CF hasn't been deployed yet.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

import httpx

from .registry import redact_uid

log = logging.getLogger("hex_ai.tools.audit")

AUDIT_URL = os.environ.get("HEX_AI_AUDIT_URL", "")
AUDIT_API_KEY = os.environ.get("HEX_AI_API_KEY", "")
AUDIT_TIMEOUT_S = float(os.environ.get("HEX_AI_AUDIT_TIMEOUT_S", "3.0"))
# Truncate result_summary so audit payloads stay bounded. The full result
# already exists in the in-memory tool_invocations list for the current
# request; audit storage is for review, not for replay.
RESULT_SUMMARY_MAX_CHARS = 500


def is_enabled() -> bool:
    return bool(AUDIT_URL and AUDIT_API_KEY)


def _truncate(s: str, limit: int = RESULT_SUMMARY_MAX_CHARS) -> str:
    if not isinstance(s, str):
        s = json.dumps(s, default=str)
    if len(s) <= limit:
        return s
    return s[:limit] + f"…[+{len(s)-limit} chars]"


async def write_invocation(
    tool_name: str,
    parameters: dict[str, Any],
    ctx: dict[str, Any],
    result: dict[str, Any],
) -> None:
    """
    Post a single tool invocation to the audit CF. Returns when the
    request completes OR times out — caller should wrap this in
    asyncio.create_task() for fire-and-forget semantics.

    `result` is the dict returned by dispatch_tool_call:
        {"ok": True, "result": <handler return>}  or
        {"ok": False, "error": str, "code": str}
    """
    if not is_enabled():
        return

    ok = bool(result.get("ok"))
    body = {
        "tool_name": tool_name,
        # Parameters are already schema-validated by dispatch; safe to log.
        # default=str catches any non-JSON types (Firestore types etc.)
        "parameters": json.loads(json.dumps(parameters, default=str)),
        "uid": ctx.get("uid"),
        "persona": ctx.get("persona_slug"),
        "help_level": ctx.get("help_level"),
        "role": ctx.get("role"),
        "ok": ok,
        "ts_iso": datetime.now(timezone.utc).isoformat(),
    }
    if ok:
        body["result_summary"] = _truncate(json.dumps(result.get("result", {}), default=str))
        body["error"] = None
        body["code"] = None
    else:
        body["result_summary"] = None
        body["error"] = _truncate(str(result.get("error", "")))
        body["code"] = result.get("code")

    try:
        async with httpx.AsyncClient(timeout=AUDIT_TIMEOUT_S) as client:
            r = await client.post(
                AUDIT_URL,
                json=body,
                headers={"X-API-Key": AUDIT_API_KEY, "Content-Type": "application/json"},
            )
            if r.status_code >= 400:
                log.warning(
                    "audit write returned %d for tool=%s uid=%s",
                    r.status_code, tool_name, redact_uid(ctx.get("uid")),
                )
    except (httpx.HTTPError, asyncio.TimeoutError) as e:
        log.warning("audit write failed for tool=%s uid=%s: %s",
                    tool_name, redact_uid(ctx.get("uid")), e)


def schedule_invocation(
    tool_name: str,
    parameters: dict[str, Any],
    ctx: dict[str, Any],
    result: dict[str, Any],
    audit_rule: bool,
) -> None:
    """
    Synchronous entrypoint that fire-and-forgets the audit write IF the
    tool's exposure_rules.audit is True.

    Designed for use inside the dispatch loop in main.py. Returns
    immediately; the actual HTTP call happens in a detached task. The
    chat response is NOT delayed by audit network latency.
    """
    if not audit_rule:
        return
    if not is_enabled():
        return
    # Detached task — exceptions inside it are caught in write_invocation
    # and only logged. asyncio.create_task requires a running event loop,
    # which is always the case inside FastAPI request handlers.
    asyncio.create_task(write_invocation(tool_name, parameters, ctx, result))
