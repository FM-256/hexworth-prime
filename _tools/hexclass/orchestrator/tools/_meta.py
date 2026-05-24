"""
tools._meta — the single tool that ships in v0.6.0a.

Purpose: prove the registry + filter + dispatch chain works end-to-end
WITHOUT introducing any student-facing surface. Instructor-only, returns
a version string, no side effects.

Real student-facing tools land in v0.6.0b+ after the scaffolding has a
track record. This tool is also useful at runtime — it's the canary the
operator probes to confirm "is the tool layer up and serving the right
instructor?" without invoking anything sensitive.
"""
from __future__ import annotations

from typing import Any

from .registry import register_tool


@register_tool(
    name="hex_ai_version",
    description=(
        "Return the orchestrator version and the count of registered tools. "
        "Instructor-only diagnostic tool — students should not see this."
    ),
    parameters_schema={
        "type": "object",
        "properties": {},
        "additionalProperties": False,
    },
    exposure_rules={
        "min_help_level": 0,
        "instructor_only": True,
        # Explicit None — the tool is visible to all personas (instructor_only
        # already gates by role). Per Nancy 2026-05-23: allowed_personas
        # defaults to [] (empty allowlist) for safety; tools that should be
        # persona-agnostic must opt in to that shape explicitly.
        "allowed_personas": None,
        "audit": False,         # operator-self probes, not worth audit storage
    },
)
def hex_ai_version(ctx: dict[str, Any]) -> dict[str, Any]:
    """Sync handler — returns instantly, no I/O. Tests this is the simplest
    case dispatch can handle. (Tools with I/O should be async.)"""
    # Local import to avoid a circular at module load.
    from . import TOOL_REGISTRY
    return {
        "version": "0.6.0a",
        "tool_count": len(TOOL_REGISTRY),
    }
