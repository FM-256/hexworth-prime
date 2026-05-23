"""
hex_ai_orchestrator — Hexworth Prime AI orchestration service (v0.0.1)

The constrained version of Dr. Hex. Routes student/operator questions
through a context packet + persona + help-level pipeline before they
reach an inference model.

The point of v0.0.1: validate the architecture, not scale it. Single
model, single endpoint, no Firestore yet, no tool calling. If THIS
doesn't feel materially different from a generic chatbot, no amount
of B70s saves the architecture.

Endpoints:
  GET  /health                — service alive + ollama reachable
  GET  /models                — what's available on the ollama backend
  GET  /personas              — list resolvable personas
  POST /chat                  — the main pipeline
  GET  /context/{user_uid}    — preview what context would be assembled
"""
from __future__ import annotations

import logging
import os
import time
from typing import Any, Literal

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from personas import PERSONAS, COMMON_VOICE_RULE, resolve_persona
from help_levels import LEVEL_DEFINITIONS, resolve_help_level

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("hex_ai")

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
DEFAULT_MODEL = os.environ.get("HEX_DEFAULT_MODEL", "qwen2.5:7b")

app = FastAPI(
    title="hex_ai_orchestrator",
    version="0.0.1",
    description="Hexworth Prime AI orchestration — Dr. Hex's constrained layer.",
)


# ── REQUEST / RESPONSE MODELS ──────────────────────────────────────────────

class ChatRequest(BaseModel):
    user_uid: str = Field(..., description="Hexworth user UID (or 'operator' / 'anonymous')")
    message: str = Field(..., description="The student/operator question")
    house: str | None = Field(None, description="House slug (shield/script/forge/web/eye/dark-arts/code/divergent/matrix)")
    mission_id: str | None = Field(None, description="Optional mission/lab ID for context")
    role: Literal["student", "instructor", "operator", "anonymous"] = "student"
    failed_attempts: int = Field(0, description="How many times this objective has been failed")
    hint_used_recently: bool = Field(False, description="Hint used in last 5 min on this objective")
    base_help_level: int | None = Field(None, description="Override default help level for this turn")
    model: str | None = Field(None, description="Override the default model")
    show_thinking: bool = Field(False, description="If true, response includes which context+persona+level was used")


class ChatResponse(BaseModel):
    response: str
    persona: str
    persona_name: str
    help_level: int
    help_level_label: str
    model: str
    latency_ms: int
    context_packet: dict | None = None


# ── CONTEXT PACKET ASSEMBLY ────────────────────────────────────────────────

def build_context_packet(req: ChatRequest) -> dict:
    """
    v0.0.1: context comes from the request body (no Firestore pull yet).
    Future v0.1.0 will read live Firestore state via Cloud Functions or
    a service-account credentials proxy.
    """
    return {
        "user_uid": req.user_uid,
        "role": req.role,
        "house": req.house,
        "mission_id": req.mission_id,
        "failed_attempts": req.failed_attempts,
        "hint_used_recently": req.hint_used_recently,
    }


# ── SYSTEM PROMPT COMPOSITION ──────────────────────────────────────────────

def compose_system_prompt(persona: dict, help_level_suffix: str, context: dict) -> str:
    """
    Layer order is INTENTIONAL — common-voice-rule first (the universal
    guard), then persona (HOW we teach), then help-level (the ceiling
    on disclosure depth), then concrete context. Persona is wrapped by
    the help-level constraint, not the other way around.
    """
    persona_line = persona["voice"]

    context_lines = []
    if context.get("house"):
        context_lines.append(f"- Student is currently in: {context['house']} house")
    if context.get("mission_id"):
        context_lines.append(f"- Active mission/lab: {context['mission_id']}")
    if context.get("role") and context["role"] != "student":
        context_lines.append(f"- Operator role: {context['role']}")
    if context.get("failed_attempts", 0) > 0:
        context_lines.append(f"- Failed attempts on this objective: {context['failed_attempts']}")

    context_block = ""
    if context_lines:
        context_block = "\n\nSTUDENT CONTEXT:\n" + "\n".join(context_lines)

    return f"""{COMMON_VOICE_RULE}

PERSONA:
{persona_line}

{help_level_suffix}{context_block}"""


# ── OLLAMA CLIENT ──────────────────────────────────────────────────────────

async def call_ollama(model: str, system: str, user_message: str) -> str:
    """Stream-collect the response from ollama's /api/chat."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_message},
                ],
                "stream": False,
                "options": {"temperature": 0.4},
            },
        )
        r.raise_for_status()
        data = r.json()
        return data.get("message", {}).get("content", "")


# ── ENDPOINTS ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict[str, Any]:
    """Service + ollama reachability."""
    out: dict[str, Any] = {"orchestrator": "ok", "version": "0.0.1"}
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            tags = r.json().get("models", [])
            out["ollama"] = "ok"
            out["models_available"] = [m["name"] for m in tags]
    except Exception as e:
        out["ollama"] = f"unreachable: {e}"
    return out


@app.get("/models")
async def models() -> dict[str, Any]:
    """Pass-through to ollama /api/tags."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{OLLAMA_URL}/api/tags")
        r.raise_for_status()
        return r.json()


@app.get("/personas")
def personas() -> dict[str, Any]:
    return {
        slug: {"name": p["name"], "house": p.get("house"), "default_help_level": p["default_help_level"]}
        for slug, p in PERSONAS.items()
    }


@app.get("/context/{user_uid}")
def preview_context(
    user_uid: str,
    house: str | None = None,
    mission_id: str | None = None,
    role: str = "student",
    failed_attempts: int = 0,
) -> dict[str, Any]:
    """
    Preview the context packet + persona + help-level the orchestrator
    would assemble, WITHOUT actually calling the model. Useful for
    debugging and for operator visibility into routing decisions.
    """
    fake_req = ChatRequest(
        user_uid=user_uid,
        message="(preview)",
        house=house,
        mission_id=mission_id,
        role=role,
        failed_attempts=failed_attempts,
    )
    persona = resolve_persona(house)
    level, suffix = resolve_help_level(
        base_level=persona["default_help_level"],
        failed_attempts=failed_attempts,
        role=role,
    )
    return {
        "context": build_context_packet(fake_req),
        "persona": persona["name"],
        "persona_slug": [s for s, p in PERSONAS.items() if p == persona][0],
        "help_level": level,
        "help_level_label": LEVEL_DEFINITIONS[level]["label"],
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """The main pipeline. Context → persona → help level → model."""
    t0 = time.time()
    context = build_context_packet(req)
    persona = resolve_persona(req.house)
    base_level = req.base_help_level if req.base_help_level is not None else persona["default_help_level"]
    level, suffix = resolve_help_level(
        base_level=base_level,
        failed_attempts=req.failed_attempts,
        hint_used_recently=req.hint_used_recently,
        role=req.role,
    )
    system = compose_system_prompt(persona, suffix, context)
    model = req.model or DEFAULT_MODEL

    log.info(
        "chat: uid=%s house=%s mission=%s persona=%s level=%d model=%s",
        req.user_uid, req.house, req.mission_id, persona["name"], level, model,
    )

    try:
        content = await call_ollama(model, system, req.message)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ollama upstream error: {e}")

    latency_ms = int((time.time() - t0) * 1000)
    log.info("chat: returned %d chars in %d ms", len(content), latency_ms)

    return ChatResponse(
        response=content.strip(),
        persona=[s for s, p in PERSONAS.items() if p == persona][0],
        persona_name=persona["name"],
        help_level=level,
        help_level_label=LEVEL_DEFINITIONS[level]["label"],
        model=model,
        latency_ms=latency_ms,
        context_packet=context if req.show_thinking else None,
    )
