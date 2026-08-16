# Hex AI — Deploy Runbook

> Live as of 2026-05-23 · For the v0.3.0–v0.5.0a Dr. Hex stack
> Audience: operator with Hexworth + Cloudflare account access

This runbook turns the staged code (orchestrator + CF bridge + client SDK) into a live end-to-end chain. Each step has a verify-then-proceed pattern; if a verify step fails, the next step is unsafe.

## Pre-flight (one-time per environment)

| # | Step | Verify |
|---|---|---|
| 1 | Confirm orchestrator is live on hexclass: `ssh hexclass 'curl -s http://127.0.0.1:8000/health \| python3 -m json.tool'` | `orchestrator: "ok"`, `version: "0.3.0"` (or higher) |
| 2 | Confirm orchestrator has an API key set: `ssh hexclass 'grep KEY /tmp/hex-test-key'` | `KEY=k_dev_<hex>` |
| 3 | Confirm pgvector RAG works: `ssh hexclass 'cd /opt/hexclass/orchestrator && KEY=$(grep -oP "KEY=\K.*" /tmp/hex-test-key) HEX_TEST_API_KEY=$KEY .venv/bin/python tests/test_rag_integration.py'` | `All 4 RAG tests passed` |
| 4 | Confirm regression sets pass: same command but `test_orchestrator.py` and `tests/test_auth.py` | `All N tests passed` for both |

## Step 1: Cloudflare Tunnel on hexclass — DONE 2026-05-24

> **Status as of 2026-05-24: LIVE.** Tunnel `hex-ai` UUID `2788de20-5e43-497d-97ff-de9259051d22`. Active edge connections at atl06/atl08/atl12/atl14. `https://hex-ai.hexworth.tech/health` returns the orchestrator JSON.

The orchestrator binds `127.0.0.1`; `cloudflared` is the only path inbound.

We reused the Cloudflare account credentials from bc1 (Path A — see `cloudflare-account-and-tunnels.md`), so no browser login was needed.

### What was actually done

```bash
# On hexclass:
sudo apt-get install -y cloudflared        # (or curl deb from GitHub)

# Path A: copy origin cert from bc1 (already authenticated on this CF account)
mkdir -p ~/.cloudflared
scp eq1@192.168.1.176:~/.cloudflared/cert.pem ~/.cloudflared/cert.pem
chmod 600 ~/.cloudflared/cert.pem

# Create the tunnel
cloudflared tunnel create hex-ai
# Tunnel UUID: 2788de20-5e43-497d-97ff-de9259051d22
# Credentials written to ~/.cloudflared/<UUID>.json

# Config (~/.cloudflared/config.yml)
cat > ~/.cloudflared/config.yml <<EOF
tunnel: 2788de20-5e43-497d-97ff-de9259051d22
credentials-file: /home/hexclass/.cloudflared/2788de20-5e43-497d-97ff-de9259051d22.json

ingress:
  - hostname: hex-ai.hexworth.tech
    service: http://127.0.0.1:8000
  - service: http_status:404
EOF

# DNS route — Cloudflare CNAME hex-ai.hexworth.tech to the tunnel (creates instantly via CF API)
cloudflared tunnel route dns hex-ai hex-ai.hexworth.tech

# Promote config + credentials to /etc/cloudflared (where systemd unit expects them)
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/config.yml /etc/cloudflared/config.yml
sudo cp ~/.cloudflared/2788de20-5e43-497d-97ff-de9259051d22.json /etc/cloudflared/
sudo sed -i "s|/home/hexclass/.cloudflared/|/etc/cloudflared/|g" /etc/cloudflared/config.yml

# Install + enable systemd service
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

**Verify externally** from operator laptop:

```bash
curl -s https://hex-ai.hexworth.tech/health | python3 -m json.tool
# Expect: { "orchestrator": "ok", "version": "0.6.5", ..., "all_ok": true }
```

If your local resolver hasn't picked up the new CNAME yet (NXDOMAIN-cached), force it via Cloudflare DNS:

```bash
CF_IP=$(dig +short hex-ai.hexworth.tech @1.1.1.1 | head -1)
curl -sS --resolve hex-ai.hexworth.tech:443:$CF_IP https://hex-ai.hexworth.tech/health
```

## Step 2: Cloudflare Access policy (zero-trust gate)

The tunnel is reachable from the public internet now. Without Access, anyone who guesses the URL can hit `/chat` and only the orchestrator's `X-API-Key` stands between them and the orchestrator. CF Access adds a second gate: even a leaked X-API-Key can't reach the orchestrator unless the request ALSO carries a valid Cloudflare Access service token.

### 2.1 — Create the Service Token (do this FIRST so you have the ID/Secret to paste later)

1. Cloudflare dashboard → **Zero Trust** (left sidebar) → **Access** → **Service Auth** → **Service Tokens** → **Create Service Token**
2. **Name:** `firebase-cf-hex-ai`
3. **Duration:** 1 year (default; calendar a rotation reminder)
4. Click **Generate token**.
5. **Copy the Client ID and Client Secret to a temporary scratchpad.** Cloudflare shows the Secret ONCE; if you lose it, you regenerate. The Client ID is shown permanently.

### 2.2 — Create the Self-Hosted Application

1. Cloudflare dashboard → **Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**
2. **Application name:** `Hex AI Orchestrator`
3. **Session duration:** 24 hours (defaults are fine)
4. **Application domain:**
   - Subdomain: `hex-ai`
   - Domain: `hexworth.tech` (should auto-populate from the available zones — this is the existing CF zone)
   - **Path:** `chat*` — this protects `/chat` and `/chat/stream` but leaves `/health`, `/metrics`, `/personas`, `/models` publicly reachable for the operator's monitoring + the test page's bridge probe
5. Application appearance / identity providers — skip (we're using service-token auth, not user login)
6. **Save** the application; it appears in the Applications list

### 2.3 — Add the access policy

Once the application exists:

1. Find `Hex AI Orchestrator` in the Applications list → **Edit**
2. Go to **Policies** tab → **Add a policy**
3. **Policy name:** `Firebase CF only`
4. **Action:** `Service Auth`
5. **Configure rules** → **Include**:
   - Selector: `Service Token`
   - Value: select the `firebase-cf-hex-ai` token you created in Step 2.1
6. **Save the policy**

### 2.4 — Verify it works

From your laptop (NOT from hexclass — the LAN sometimes bypasses CF Access via tunnel internals):

**With the service token — should succeed:**

```bash
curl -sI https://hex-ai.hexworth.tech/chat \
    -X POST \
    -H "CF-Access-Client-Id: <client-id>" \
    -H "CF-Access-Client-Secret: <client-secret>" \
    -H "Content-Type: application/json" \
    -d '{}'
# Expect: 401 (orchestrator rejects empty body, but CF Access let us through)
# The 401 is from the orchestrator's missing-X-API-Key check, NOT from CF Access.
```

**Without the service token — should be blocked:**

```bash
curl -sI https://hex-ai.hexworth.tech/chat -X POST -d '{}'
# Expect: 302 redirect to a Cloudflare Access login page
# OR a 401/403 from Cloudflare Access (NOT from the orchestrator)
```

**`/health` should still work without the token (unprotected path):**

```bash
curl -s https://hex-ai.hexworth.tech/health | python3 -m json.tool | head -5
# Expect: orchestrator JSON (CF Access doesn't apply to /health* because the path glob was /chat*)
```

### 2.5 — Save the service token credentials somewhere safe

You'll paste them into Firebase secrets in Step 3:
- `CF_ACCESS_CLIENT_ID` → the Client ID
- `CF_ACCESS_CLIENT_SECRET` → the Client Secret

Do NOT commit them to the repo or paste them into any chat. Store in your password manager.

## Step 3: Firebase secrets

```bash
# In the hexworth-prime repo root
firebase functions:secrets:set HEX_AI_URL
# When prompted, paste: https://hex-ai.hexworth.tech

firebase functions:secrets:set HEX_AI_API_KEY
# When prompted, paste the value from `ssh hexclass 'grep -oP "KEY=\K.*" /tmp/hex-test-key'`

firebase functions:secrets:set CF_ACCESS_CLIENT_ID
# Paste the Cloudflare Access service-token Client ID

firebase functions:secrets:set CF_ACCESS_CLIENT_SECRET
# Paste the Cloudflare Access service-token Client Secret
```

**Verify** the bridge code reads the CF Access secrets:

```bash
grep -n "CF-Access-Client" functions/hex-ai-bridge.js
# Expect lines around buildUpstreamHeaders() that set CF-Access-Client-Id
# and CF-Access-Client-Secret when those secrets are configured.
```

If the secrets are unset (e.g., emulator / dev mode), the headers are simply omitted — the bridge continues to work for testing without CF Access.

## Step 4: Deploy Cloud Functions

**Production write gate per CLAUDE.md rule 10 — operator must explicitly authorize this in chat.**

```bash
# From repo root (current branch should be master)
git branch --show-current     # → master
git status                    # → clean, no uncommitted changes

# Deploy only the new functions (not the whole 30+ CF set)
firebase deploy --only functions:hexAiChat,functions:hexAiChatStream,functions:hexAiHealth
```

**Verify** from operator laptop:

```bash
# Health probe via signed-in Firebase user
# (Use the test page below — simpler than crafting curl with ID token.)
```

## Step 5: End-to-end verification

1. Visit `https://hexworth.com/admin/ai-chat-test.html` in a browser, signed in as the operator Google account.
2. The "Bridge Health" card should show:
   - `Signed in as: <operator-email — see hexworth-infra-private>`
   - `CF bridge: ok`
   - `Orchestrator: ok v0.3.0` (or higher)
3. Type a question, click **Ask (blocking)**. Response appears within ~5–25 seconds (CPU inference on hexclass is slow).
4. Click **Ask (streaming)**. Response renders token-by-token. Cancel button works.

If all four checks pass, the end-to-end synergy chain is live.

## Rollback

| Layer | How to roll back |
|---|---|
| Functions deploy | `firebase functions:delete hexAiChat hexAiChatStream hexAiHealth --region us-central1` |
| Cloudflare Access policy | Delete the application in Cloudflare dashboard (instant) |
| Cloudflare Tunnel | `sudo systemctl stop cloudflared` on hexclass (instant; tunnel disconnects) |
| Orchestrator | `ssh hexclass 'systemctl --user stop hex-orchestrator.service'` |

Rollback is non-destructive: no data is deleted, no state is mutated. The tunnel + functions can be brought back up at any time by reversing the stop commands. Audit logs in `tool_invocations` (v0.6.0+) and Firestore remain.

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| `curl https://hex-ai.hexworth.tech/health` returns 530 | Tunnel not running | `sudo systemctl restart cloudflared` |
| `curl ...` returns 403 | Cloudflare Access policy denying | Recheck service token Client ID/Secret in CF Access app |
| CF bridge `unavailable` | Wrong HEX_AI_URL or DNS not propagated | `firebase functions:secrets:access HEX_AI_URL` — should be exact tunnel hostname |
| CF bridge `orchestrator status 401` | Wrong HEX_AI_API_KEY | Resync key: `firebase functions:secrets:set HEX_AI_API_KEY` |
| Streaming hangs at first token | Cloudflare proxy buffering | Confirm `cf-cache-status` is `DYNAMIC`, not `HIT`; add `Cache-Control: no-transform` to orchestrator if needed |

## What this runbook does NOT cover

- **Cost monitoring** — CF execution + Cloudflare Workers Usage. Set up billing alerts BEFORE the first real student traffic.
- **Token rotation** — Cloudflare Access service tokens rotate every 12 months by default. Calendar reminder needed.
- **Multi-region failover** — hexclass is the only orchestrator host. If it goes down, AI is unavailable until manually restored. Out of scope for v0.3.0.
- **Rate limiting** — Cloudflare can rate-limit at the edge; not configured. Defer until first abuse signal.

## v0.6.6 environment knobs (added 2026-06-02)

Versions 0.6.2 through 0.6.6 introduced new optional env vars on the
hexclass orchestrator. Set in `/etc/systemd/system/hex-ai.service` (or
the project's environment file) before `systemctl restart hex-ai`. All
have safe defaults; the orchestrator boots without any of them.

| Env var | Default | What it does |
|---|---|---|
| `HEX_OLLAMA_KEEP_ALIVE` | `30m` | How long ollama keeps the model resident in VRAM between requests. `'30m'` covers a normal classroom session. `'0'` unloads immediately (dev). `'-1s'` keeps loaded forever (NOT bare `-1` — Go's `time.ParseDuration` rejects unitless `-1`). |
| `HEX_EMBED_CACHE` | `1` | Set to `0` to disable the Redis embedding cache entirely. |
| `HEX_EMBED_CACHE_TTL_S` | `3600` | TTL for cached embeddings (1 hour). |
| `HEX_REDIS_URL` | `redis://127.0.0.1:6379/0` | Shared by embedding cache, rate limiter, conversation memory. |
| `HEX_REDIS_TIMEOUT_S` | `0.5` | Socket + connect timeout for the sync embedding-cache client. |
| `HEX_CONV_TTL_S` | `1800` | 30-min conversation memory TTL. v0.6.6 note: meta-TTL expiry now triggers an explicit orphan-list DEL on the next append (Lua-atomic), so a returning student after a >30 min idle gap will see a fresh conversation rather than potentially-orphaned context. |
| `HEX_CONV_MAX_TURNS` | `10` | Total role-tagged entries stored AND retrieved (5 user + 5 assistant pairs). |
| `HEX_TEST_REDIS` | unset | Set to `1` only for the live-Redis subset of the conversation-memory test suite (see below). Not consumed by the runtime. |

## v0.6.6 post-deploy test gates

After `systemctl restart hex-ai`, before declaring the deploy healthy:

```bash
# 1. /health reports the matching version
curl -s http://127.0.0.1:8080/health | jq .version
# expect: "0.6.6"

# 2. Unit tests covering the new code paths (CI-style; no live Redis needed)
cd /opt/hexclass/orchestrator
VIRTUAL_ENV=.venv /home/hexclass/.local/bin/uv run pytest \
    tests/test_embed_cache.py \
    tests/test_noscript_recovery.py \
    -v

# 3. TOCTOU regression suite (REQUIRES live Redis on HEX_REDIS_URL)
HEX_TEST_REDIS=1 VIRTUAL_ENV=.venv /home/hexclass/.local/bin/uv run pytest \
    tests/test_toctou_append.py -v

# 4. End-to-end smoke: ask Dr. Hex a question through the CF bridge
#    (covered by Step 5 of the original runbook)
```

If any of these fail, follow the Rollback section above. The v0.6.6
release does not change the CF bridge or Firestore rules, so rollback
is a single `git revert` + `systemctl restart hex-ai`.

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — the orchestrator this stack exposes
- `_docs/architecture/hex-ai-cf-bridge.md` — the CF code this deploys
- `_docs/architecture/hex-ai-network-exposure.md` — why Cloudflare Tunnel was chosen
- `_docs/architecture/hex-ai-client-sdk.md` — the client that calls into this stack
- `_docs/operations/dr-hex-latency-2026-05-26.md` — improvement queue (#4, #9 shipped in v0.6.6)
- `CLAUDE.md` rule 10 — production write gate

---

*Last Updated: 2026-06-02 · v0.6.6 env knobs + post-deploy test gates appended*
