# Game Forge

Dev-time pipeline that migrates the platform's legacy hardcoded review-game
clones onto the shared data-driven engines (`_app/_games-lab/{jeopardy,kahoot}.html`,
which read `?course=` and fetch `data/<type>/<course>.json`), audits their
quality, and (optionally) AI-improves their content.

`_tools/` is gitignored — track these with `git add -f`.

## Commands

```bash
# 1. CONVERT — extract each legacy clone's embedded data, map to the shared
#    schema, write to data-extracted/ STAGING (never live). Writes forge-manifest.json.
node forge.mjs            # all engine-typed clones
node forge.mjs jeopardy/pis   # one

# 2. AUDIT — deterministic quality lint of the staged data; per-game reports
#    in forge-lint/ + summary folded into the manifest.
node lint.mjs

# 3. IMPROVE (optional, needs a key) — Claude rewrites distractors / stems /
#    clues / explanations while the CORRECT ANSWER IS LOCKED (verified verbatim
#    after the call). Output -> data-improved/ STAGING. Never live.
ANTHROPIC_API_KEY=sk-... node improve.mjs jeopardy/pis
ANTHROPIC_API_KEY=sk-... node improve.mjs --all --model claude-opus-4-8

# unit tests for the improve safety guarantees (no key needed)
node improve.test.mjs
```

## Three staging tiers (nothing is ever written to live blindly)

| Path | Written by | Promote to live by |
|------|-----------|--------------------|
| `data-extracted/` | `forge.mjs` | review `git diff`, `cp` into `data/` |
| `data-improved/`  | `improve.mjs` | review diff, `cp` into `data/` |
| `data/`           | (live, served) | ships via `./deploy.sh` |

Promotion is a deliberate human step. Improved/extracted content is NOT live
until copied into `data/` and deployed.

## Admin surface

`_app/_games-lab/forge.html` (admin console > Review Games > Forge tab) is the
review dashboard: catalog, conversion status, audit findings, and live preview
of any converted game. It reads `forge-manifest.json` + `forge-lint/`. It does
not run conversion — that's these CLI tools.

## Answer-lock guarantee (improve.mjs)

The model may improve everything EXCEPT the answer key:
- Jeopardy: each clue `response` and `value` held verbatim; only `clue` phrasing improves.
- Kahoot: the correct option text and its `answer` index held verbatim; only the
  three distractors, the stem `q`, and the `note` improve.

`validateJeopardy` / `validateKahoot` re-check these after every call and REJECT
(write nothing) on any violation. See `improve.test.mjs`.

## Files

- `config.mjs` — clone registry + per-course themes + paths
- `forge.mjs` — extractor (string-aware scan + `vm` parse) + schema mapper
- `lint.mjs` — deterministic quality audit
- `improve.mjs` — answer-locked AI improve (plain `fetch`, no SDK)
- `improve.test.mjs` — unit tests for the improve guarantees
