"""
hex_ai_orchestrator.tools — Tool layer scaffolding (v0.6.0a).

Implements the registry + exposure filter + dispatch validator described in
_docs/architecture/hex-ai-tool-layer-design.md.

v0.6.0a deliberately ships with ONE tool (hex_ai_version, instructor-only)
to prove the filter math is correct. Real student-facing tools land in
v0.6.0b+ after the scaffolding has a track record.

Public API:
    register_tool(...)           — decorator (in registry.py)
    filter_tools_for_context(...) — produce ollama-shaped allowed list (in exposure.py)
    dispatch_tool_call(...)       — validate + execute a tool_call (in dispatch.py)
    TOOL_REGISTRY                 — read-only-by-convention dict of tool metadata

This module is NOT yet imported by main.py — wiring the registry into the
/chat pipeline is v0.6.0b's job.
"""
from .registry import TOOL_REGISTRY, register_tool, ToolMetadata, ToolError, redact_uid
from .exposure import filter_tools_for_context
from .dispatch import dispatch_tool_call

# Import side-effect-registering modules so tools self-register on package load.
# Each module decorated with @register_tool puts itself into TOOL_REGISTRY at
# import time. The list here is the authoritative source of "what tools exist".
from . import _meta      # noqa: F401  — hex_ai_version
from . import _kb        # noqa: F401  — search_knowledge_base (v0.6.0b)
from . import _progress  # noqa: F401  — get_student_progress (v0.6.0c-2)
from . import audit      # noqa: F401  — fire-and-forget audit write (v0.6.0c-3)

__all__ = [
    "TOOL_REGISTRY",
    "register_tool",
    "ToolMetadata",
    "ToolError",
    "filter_tools_for_context",
    "dispatch_tool_call",
    "redact_uid",
]
