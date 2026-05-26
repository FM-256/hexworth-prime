# Dr. Hex AI Latency — End-to-End Profile + Improvement Track

Audit date: 2026-05-26. Background analysis agent: `aa5a852c211cc2542`. The full per-hop breakdown is preserved in the agent transcript; this document captures the durable findings + improvement queue.

## Where latency lived (pre-streaming)

| Hop | Realistic latency | Bottleneck? |
|----|------|------|
| Browser → CF Callable | 50–200 ms | No |
| CF cold start (when applicable) | 0–2 s | Periodic only |
| `deriveFailedAttempts` Firestore | 80–250 ms | No |
| CF → orchestrator via CF Tunnel | 30–80 ms | No |
| Orchestrator pre-LLM gates | 10–40 ms | No |
| RAG retrieve (embed + pgvector) | 150–500 ms | **Medium** |
| Skill map YAML parse (per request) | 1–20 ms | Minor |
| **ollama `qwen2.5:7b` generate** | **2–25 s typical, 49 s p95** | **THE bottleneck** |
| Tool-loop iterations (if any) | +1–5 s × up to 3 | Compounds bottleneck |
| Output filters (regex) | 2–8 ms | No |
| Orchestrator → CF → browser | 60–180 ms | No |
| UI render | < 10 ms | No |

**Total perceived latency (pre-fix): 5–25 s typical, ~49 s p95.**

Root cause of perceived latency: the chat panel called the **blocking** `hexAiChat` Cloud Function. Students saw a full freeze ("Dr. Hex is thinking…") for the entire ollama generate duration before any text appeared.

## What was fixed (commit `7bb6cbfc4`, 2026-05-26)

**Streaming wired into `_app/_lib/HexAIChatPanel.js`.** Swapped the blocking `chatFn(...)` call for a direct fetch of the hosting-rewrite stream URL (`/__/functions/hexAiChatStream`) with inline SSE parsing. Tokens append to the AI message node as they arrive.

Perceived first-byte latency now matches ollama first-token latency (~1–3 s typical) instead of full-response latency (5–25 s). **The infrastructure was already there** — `hexAiChatStream` CF, `/chat/stream` endpoint, `askDrHexStream()` SDK — all built in v0.5.0a but never connected to the chat panel UI.

## Improvement queue (highest ROI first)

The remaining items are sub-second polish; the streaming fix delivered the order-of-magnitude win.

### 2 — Smaller model per help-level

A/B `qwen2.5:7b` vs `qwen2.5:3b` (or smaller quant of 7b) on help-level 0–2 (Socratic, short responses). Quality cost should be negligible for the Socratic-only tier where the model isn't writing code or step-by-steps. Expected: 2× generation speed for low-help-level turns.

### 3 — Skip RAG on chitchat

Add a fast classifier (`MIN_QUERY_LEN` is already 8; add a heuristic for "is question?" via verb presence + length) before the embed call. RAG hits are useful for "explain SQL injection"; useless for "is this right?". Saves 150–500 ms per turn that doesn't need RAG.

### 4 — Cache embeddings for repeated questions

Key on SHA-256 of normalized query, 1-hour TTL in Redis. Saves embed call on hot-question patterns.

### 5 — `asyncio.gather` `_resolve_request`

`fetch_prior_turns`, RAG retrieve, and `filter_tools_for_context` are independent. Currently RAG runs first then awaits prior_turns. Parallelizing saves ~150 ms typical.

### 6 — Pre-warm ollama on boot

A no-op prompt at orchestrator boot puts the model + tokenizer in GPU memory. Avoids the cold-load spike (5–15 s on Vulkan) when the first student of the day arrives.

### 7 — In-process LRU cache for `maybe_load_skill_map`

Key on `(lab_id, file_mtime)`. Drops to constant time after first hit. Currently parses YAML on every request even though OS page cache hides most of the I/O cost.

### 8 — Cut prompt size

The CONSTITUTION system message is appended on EVERY turn. With 10 turns of prior history that's 10× constitution-attention. Move to the first system message only OR compress.

### 9 — Increase ollama `keep_alive`

If the model unloads between idle periods, the first response after idle pays the model-load tax. Set `keep_alive` to a longer duration in the ollama service config.

### 10 — Move `deriveFailedAttempts` to orchestrator

Currently Firestore read happens in CF, serially before the orchestrator call. Moving it into the orchestrator lets it run in parallel with RAG retrieve. Saves ~100–200 ms on lab pages.

## Files touched in the streaming fix

- `_app/_lib/HexAIChatPanel.js` lines 1–10 (header) + 34–41 (imports) + 405–510 (chat path)

## Cross-reference

- `_app/_lib/HexAI.js:181` — `askDrHexStream()` reference implementation
- `_tools/hexclass/orchestrator/main.py:1489` — `/chat/stream` endpoint
- `functions/hex-ai-bridge.js:353` — `hexAiChatStream` Cloud Function bridge
- `_docs/operations/dr-hex-orchestrator-v0.5.0a.md` — streaming endpoint design (v0.5.0a)
- `_docs/operations/dr-hex-production-stability.md` — Karl-verified citations on Constitution/Voice Guide
