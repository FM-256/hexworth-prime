"""
tools.exposure — the per-request filter that decides which tools the model
is allowed to see.

The exposure filter is applied BEFORE the tools list is sent to ollama.
This means the model never sees a tool it isn't allowed to call — making
prompt injection ("just call get_other_student_data!") structurally
impossible rather than relying on the model to refuse.

This is the v0.6.0 architectural keystone described in
_docs/architecture/hex-ai-tool-layer-design.md §3 ("Intervention Decision"
applies analogously to tool exposure).
"""
from __future__ import annotations

from typing import Any

from .registry import TOOL_REGISTRY, ToolMetadata


def _is_visible(meta: ToolMetadata, persona_slug: str, help_level: int, role: str) -> bool:
    """All four gates must pass. Any single failure → invisible."""
    rules = meta.exposure_rules

    # Gate 1: help level floor.
    if help_level < rules.get("min_help_level", 99):
        return False

    # Gate 2: instructor-only tools require role=instructor (operator).
    if rules.get("instructor_only", False) and role != "instructor":
        return False

    # Gate 3: persona allowlist (when set). None = no allowlist constraint.
    allowed = rules.get("allowed_personas")
    if allowed is not None and persona_slug not in allowed:
        return False

    # Gate 4: persona denylist.
    if persona_slug in rules.get("denied_personas", []):
        return False

    return True


def filter_tools_for_context(
    persona_slug: str,
    help_level: int,
    role: str,
) -> list[dict[str, Any]]:
    """
    Returns the subset of registered tools the model is allowed to see for
    THIS request, in the ollama /api/chat `tools` parameter shape.

    The model never sees a tool not in this list — that's the structural
    defense against the LLM trying to use a tool it shouldn't.

    Determinism: result is sorted by tool name for stable prompt caching.
    """
    visible = [
        meta for meta in TOOL_REGISTRY.values()
        if _is_visible(meta, persona_slug, help_level, role)
    ]
    visible.sort(key=lambda m: m.name)
    return [m.to_ollama_format() for m in visible]


def visible_tool_names(persona_slug: str, help_level: int, role: str) -> list[str]:
    """Convenience for tests + logging — names only, in the same order."""
    return [t["function"]["name"] for t in filter_tools_for_context(persona_slug, help_level, role)]
