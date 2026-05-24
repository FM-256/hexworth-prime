# Hex AI — Build State Snapshot

> Snapshot date: 2026-05-24
> Purpose: single artifact letting the operator pick up the next session without re-deriving the architecture from chat history. Read this first.

## TLDR

**Orchestrator on hexclass: v0.6.3 — feature-complete for v0.6.x.** RAG retrieval, prompt-injection guard, streaming UX, conversation memory, tool layer with one read-only tool live, audit log scaffolded.

**Cloud Function bridge: BUILT, NOT DEPLOYED.** Four functions ready (`hexAiChat`, `hexAiChatStream`, `hexAiHealth`, `hexAiToolCallback`). One operator gate stands between staged code and end-to-end live: Cloudflare Tunnel + Firebase secrets + `firebase deploy --only functions`.

**Client SDK + test page: BUILT.** `_app/_lib/HexAI.js` + `_app/admin/ai-chat-test.html` are ready to use the moment the CF chain ships.

**Regression: 50 tests across 6 sets, all passing.** Includes streaming SSE, prompt-injection refusal, conversation memory recall, tool dispatch end-to-end.

## What's live RIGHT NOW

```
[hexclass]
  hex-orchestrator.service (systemd user unit)
    127.0.0.1:8000  — uvicorn + FastAPI
    Backend: ollama @ 127.0.0.1:11434 (qwen2.5:7b, nomic-embed-text)
    Augmentation: pgvector (95 dispatch chunks) + Redis (10-entry memory)
    Tools registered: 2 (hex_ai_version, search_knowledge_base)
    Auth: X-API-Key (one key in /tmp/hex-test-key on hexclass)

[bc1]  — Tailscale relay path to hexclass; used as fallback when LAN is down
  ssh hexclass-via-bc1 — alternative ssh path, validated 2026-05-23/24

[hexworth.com]  — Firebase Hosting
  No AI chain yet. The /admin/ai-chat-test.html page exists in code but
  needs the CF chain deployed to be useful end-to-end.
```

## Orchestrator capability matrix

| Capability | Version added | Live |
|---|---|---|
| Persona system (10 personas) | v0.0.1 | ✓ |
| Help Level ladder (0–5) with deterministic escalation | v0.0.1 | ✓ |
| Blocking `/chat` | v0.0.1 | ✓ |
| Streaming `/chat/stream` (SSE) | v0.1.0 | ✓ |
| CORS middleware | v0.1.0 | ✓ |
| Prompt-injection Constitution prompt | v0.1.0 | ✓ |
| Prometheus `/metrics` | v0.1.0 | ✓ |
| RAG retrieval (pgvector + nomic-embed-text) | v0.2.0 | ✓ |
| RAG context in user-turn (not system) — Nancy fix | v0.2.0 | ✓ |
| API-key auth | v0.3.0 | ✓ |
| `HEX_ENV=production` fail-fast | v0.3.0 | ✓ |
| Tool registry + exposure filter | v0.6.0a | ✓ |
| Tool dispatch in blocking `/chat` | v0.6.0b | ✓ |
| `search_knowledge_base` tool | v0.6.0b | ✓ |
| Conversation memory (Redis, 30-min TTL) | v0.6.1 | ✓ |
| Tool invocation audit log (scaffolded; no-op until CF deploys) | v0.6.0c-3 / v0.6.2 | ✓ scaffolded |
| Tool dispatch in `/chat/stream` (with `tool_call_start/done` events) | v0.6.0c-1 / v0.6.3 | ✓ |

## What's built but NOT deployed (operator gates)

### Cloud Function bridge

| Function | Type | Purpose |
|---|---|---|
| `hexAiChat` | callable | Blocking AI chat — student/operator → orchestrator |
| `hexAiChatStream` | onRequest | Streaming AI chat (SSE forwarded) |
| `hexAiHealth` | callable | Probe orchestrator reachability from CF |
| `hexAiToolCallback` | onRequest | Audit-log sink (orchestrator → CF → Firestore) |

Operator gates blocking deploy:

1. **Cloudflare Tunnel on hexclass** — orchestrator must be reachable from CF runtime. Step-by-step in `_docs/operations/hex-ai-deploy-runbook.md`.
2. **Firebase secrets** — `HEX_AI_URL`, `HEX_AI_API_KEY`, optionally `CF_ACCESS_CLIENT_ID/SECRET`. Set via `firebase functions:secrets:set`.
3. **Production write gate** — per `CLAUDE.md` rule 10, `firebase deploy --only functions` requires explicit operator authorization in chat.

### Client SDK + test page

| File | Purpose |
|---|---|
| `_app/_lib/HexAI.js` | Browser SDK: `askDrHex`, `askDrHexStream`, `probeHexAi`, `startConversation`, `endConversation` |
| `_app/admin/ai-chat-test.html` | Admin-gated end-to-end test page — exercises both blocking and streaming paths with conversation controls and inline tool indicators |

Both are deployed via `firebase deploy --only hosting` whenever the operator deploys. No special gate — they'll just become useful when the CF chain ships.

### Firestore changes

`firestore.rules` has a new `tool_invocations/{docId}` block (lines near end) — student reads own, admin reads all, no client writes. Deploy via `firebase deploy --only firestore:rules`.

## Test coverage (50/50)

| Set | Count | Path |
|---|---|---|
| Base regression | 10 | `tests/test_orchestrator.py` |
| RAG integration | 4 | `tests/test_rag_integration.py` |
| API-key auth | 8 | `tests/test_auth.py` |
| Tool registry | 17 | `tests/test_tools_registry.py` |
| Tool dispatch integration | 6 | `tests/test_tool_integration.py` |
| Conversation memory | 6 | `tests/test_conversation_memory.py` |

Run all: `ssh hexclass-via-bc1 'KEY=$(grep -oP "KEY=\K.*" /tmp/hex-test-key) && cd /opt/hexclass/orchestrator && for f in test_orchestrator.py tests/test_*.py; do HEX_TEST_API_KEY=$KEY .venv/bin/python "$f"; done'`

## Nancy [PAUSE] reviews fielded this marathon

Five adversarial reviews, all concerns applied before commit:

| Phase | Concerns caught |
|---|---|
| v0.2.0 RAG wiring | RAG content in system prompt vs user-turn (3 fixes) |
| v0.3.0 auth design | Empty-CSV split, `/context` exfiltration, test harness break (3 fixes) |
| v0.5.0a streaming | Buffer flush on stream-done, upstream timeout, double-error delivery (3 fixes) |
| v0.6.0a registry | `allowed_personas` default footgun, `returns_schema` dead code, CancelledError comment (3 fixes) |
| v0.6.0b dispatch loop | JSON serialization, show_thinking role-gate, empty-content guard (3 fixes) |
| v0.6.1 memory | Asymmetric LTRIM/LRANGE caps, UUID format validation, meta-expiry race documented (3 fixes) |

Memory file `feedback_asymmetric_caps_pattern.md` captures the generalizable lesson from v0.6.1.

## Confluence pages this marathon (17 total)

| Title | Page |
|---|---|
| PIS Final Practical: Patient Zero (Eclipse Tier) | 18153474 |
| Hexclass Server — Operational Profile | 18153494 |
| Dr. Hex AI Orchestrator Architecture (v0.5.0a) | 18579457 |
| Dr. Hex AI Orchestrator Architecture (v0.6.1) | 18677779 |
| EduScan Safety Net Architecture | 18448385 |
| Hex AI CF Bridge — v0.4.0 + v0.5.0a + Nancy-fixes (multiple bumps) | 18382851 / 17956873 |
| Hex AI Client SDK (HexAI.js) | 18087939 / 18481213 |
| Hex AI Network Exposure Decision | 18546689 |
| Hex AI Deploy Runbook | 18382887 / 18087957 |
| Hex AI Tool Layer Design Proposal (v0.6.0) | 18382869 |
| Hex AI Tool Layer Scaffolding (v0.6.0a) | 18546707 / 18677762 |
| Hex AI Tool Layer v0.6.0b (Nancy-applied) | 18579491 / 18546743 |
| Hex AI Tool Layer v0.6.0c Design (streaming + Firestore + audit) | 18546725 |
| Hex AI Conversation Memory Design (v0.5.0b) | 18481230 |
| Hex AI Conversation Memory v0.6.1 (Nancy-cleared) | 18415619 |
| Hex AI Tool Invocation Audit Log (v0.6.0c-3) | 18546761 |
| Hex AI Streaming Tool Support (v0.6.0c-1) | 18382905 |
| Hex AI Ghost Layer Design Proposal (v0.7.0) | 18579474 |
| Session Changelog 2026-05-22 → 23 (Eclipse + Hexclass + Dr. Hex) | 18481153 |

## Recommended operator next session — pick one of three paths

### Path A: Ship the synergy chain end-to-end (highest leverage)

1. **Cloudflare account** — confirm Hexworth has one or create. If new, you'll need to add `hexworth.com` as a CF zone (NS records updated at the registrar).
2. **Run the deploy runbook** — `_docs/operations/hex-ai-deploy-runbook.md` walks step-by-step from `cloudflared tunnel create` through `firebase deploy`. 5 phases, each with verify steps.
3. **Open the test page** — `/admin/ai-chat-test.html` exercises both blocking and streaming paths. Should "just work" once the chain is live.

Expected time: 60–90 min if Cloudflare account exists; +30 min for first-time CF zone setup.

### Path B: Add the first Firestore-backed tool (v0.6.0c-2)

`get_student_progress(mission_id)` — the v0.6.0c design's intended first real tool, deferred because it needs CF deploy first.

If Path A ships first, Path B is the next slice: write the orchestrator-side handler that calls back to a new CF endpoint, register it with `min_help_level=1`, deny dark-arts persona, audit=true. Already designed in `_docs/architecture/hex-ai-tool-layer-v0.6.0c-design.md`.

### Path C: GPU compute Path 3 (uncertain)

Intel Arc Pro B60 Battlemage compute runtime is broken as of 2026-05-23 (`intel-opencl-icd` predates Battlemage; PyTorch XPU segfaults). Path 3 = install oneAPI Base Toolkit. May or may not work. If it works, larger models (qwen2.5:14b or 32b) unlock — currently CPU-only at qwen2.5:7b.

Uncertainty makes this lower priority than Path A. Recommended after Path A is live.

## Operational quick reference

```bash
# Verify orchestrator is alive (from operator laptop)
ssh hexclass-via-bc1 'curl -s http://127.0.0.1:8000/health | python3 -m json.tool'

# Restart orchestrator (after config change)
ssh hexclass-via-bc1 'systemctl --user restart hex-orchestrator.service'

# Tail logs
ssh hexclass-via-bc1 'journalctl --user -u hex-orchestrator.service -f'

# Run all regression tests
ssh hexclass-via-bc1 'KEY=$(grep -oP "KEY=\K.*" /tmp/hex-test-key) && cd /opt/hexclass/orchestrator && for f in test_orchestrator.py tests/test_*.py; do HEX_TEST_API_KEY=$KEY .venv/bin/python "$f"; done'

# Get the API key (one-time per fresh shell)
ssh hexclass-via-bc1 'grep -oP "KEY=\K.*" /tmp/hex-test-key'
```

## Known issues / known limitations

1. **LAN path to hexclass intermittently down** — fallback through `hexclass-via-bc1` (Tailscale) works. Documented in server profile.
2. **GPU compute runtime broken** — Battlemage Intel ICD predates support. CPU-only inference. Documented in server profile.
3. **Conversation memory meta-expiry race** — low-probability TOCTOU where the conversation list survives but the meta key expires. Non-security, degraded-conversation only. Documented in `conversation.py` module docstring + arch doc. Fix would require Lua atomic check-then-append.
4. **LLM recall is non-deterministic** — `test_second_turn_sees_prior_turn` asserts the MECHANISM (prior_turn_count=2) hard and the OUTCOME (model recalls 'purple') soft. qwen2.5:7b at temp=0.4 may choose to call tools instead of recalling. Best-effort.
5. **CF + client + test page never end-to-end tested** — gated on operator deploy. Code is reviewed, syntax-clean, and individual unit-tested; integration test is part of the operator's first session post-deploy.

## Reading order for context

If you need to refresh on the build before the next session:

1. **This doc** (`hex-ai-build-state-snapshot.md`) — you're here.
2. `_docs/architecture/dr-hex-orchestrator.md` — the orchestrator architecture.
3. `_docs/operations/hex-ai-deploy-runbook.md` — operator's deploy checklist.
4. `_docs/architecture/hex-ai-cf-bridge.md` — what gets deployed.
5. Specific slice docs only if you're touching that slice.

---

*Last Updated: 2026-05-24 · Marathon block snapshot · Orchestrator v0.6.3 live*
