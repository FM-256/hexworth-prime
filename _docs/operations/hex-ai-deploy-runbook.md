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

## Step 1: Cloudflare Tunnel on hexclass

The orchestrator binds `127.0.0.1`; `cloudflared` will be the only path inbound.

```bash
# On hexclass (via ssh hexclass)
sudo apt-get install -y cloudflared

# Authenticate to Cloudflare (interactive — opens a browser URL)
cloudflared tunnel login

# Create the tunnel
cloudflared tunnel create hex-ai

# Note the tunnel UUID printed — you'll need it for the config below
# (also stored at ~/.cloudflared/<UUID>.json on hexclass)

# Create the config
mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml <<EOF
tunnel: <UUID-from-above>
credentials-file: /home/hexclass/.cloudflared/<UUID>.json

ingress:
  - hostname: hex-ai.hexworth.com
    service: http://127.0.0.1:8000
  - service: http_status:404
EOF

# DNS route — Cloudflare CNAMEs hex-ai.hexworth.com to the tunnel
cloudflared tunnel route dns hex-ai hex-ai.hexworth.com

# Install as systemd service
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Verify
sudo systemctl status cloudflared
```

**Verify externally** from operator laptop (NOT from hexclass):

```bash
curl -s https://hex-ai.hexworth.com/health
# Expect: { "orchestrator": "ok", "version": "0.3.0", ... }
```

If this returns 200 + orchestrator JSON, the tunnel is up. Proceed to Step 2.

## Step 2: Cloudflare Access policy (zero-trust gate)

The tunnel is now reachable from the public internet. Without Access, anyone with the URL can hit `/chat` (and still needs `X-API-Key`, but defense-in-depth matters).

1. Open Cloudflare dashboard → Zero Trust → Access → Applications → Add an application → Self-hosted.
2. Application name: `Hex AI Orchestrator`. Domain: `hex-ai.hexworth.com`. Path: `/chat*`.
3. Create a policy:
   - Action: `Service Auth`
   - Include: `Service Token`
   - Create a new service token: `firebase-cf-hex-ai`. Copy the Client ID and Client Secret — you'll need them in Step 3.
4. Save the application. (Leave `/health` and `/metrics` UN-gated — those need to be reachable for monitoring.)

**Verify** with the service token:

```bash
curl -s https://hex-ai.hexworth.com/chat \
    -H "CF-Access-Client-Id: <client-id>" \
    -H "CF-Access-Client-Secret: <client-secret>" \
    -H "X-API-Key: <hex-api-key>" \
    -H "Content-Type: application/json" \
    -d '{"user_uid":"runbook-test","message":"hi","role":"student"}'
# Expect: 200 + orchestrator response

# Verify without the service token returns Cloudflare Access HTML:
curl -s https://hex-ai.hexworth.com/chat -X POST -d '{}'
# Expect: HTML redirect to Cloudflare login
```

## Step 3: Firebase secrets

```bash
# In the hexworth-prime repo root
firebase functions:secrets:set HEX_AI_URL
# When prompted, paste: https://hex-ai.hexworth.com

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
   - `Signed in as: f.mora80@gmail.com`
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
| `curl https://hex-ai.hexworth.com/health` returns 530 | Tunnel not running | `sudo systemctl restart cloudflared` |
| `curl ...` returns 403 | Cloudflare Access policy denying | Recheck service token Client ID/Secret in CF Access app |
| CF bridge `unavailable` | Wrong HEX_AI_URL or DNS not propagated | `firebase functions:secrets:access HEX_AI_URL` — should be exact tunnel hostname |
| CF bridge `orchestrator status 401` | Wrong HEX_AI_API_KEY | Resync key: `firebase functions:secrets:set HEX_AI_API_KEY` |
| Streaming hangs at first token | Cloudflare proxy buffering | Confirm `cf-cache-status` is `DYNAMIC`, not `HIT`; add `Cache-Control: no-transform` to orchestrator if needed |

## What this runbook does NOT cover

- **Cost monitoring** — CF execution + Cloudflare Workers Usage. Set up billing alerts BEFORE the first real student traffic.
- **Token rotation** — Cloudflare Access service tokens rotate every 12 months by default. Calendar reminder needed.
- **Multi-region failover** — hexclass is the only orchestrator host. If it goes down, AI is unavailable until manually restored. Out of scope for v0.3.0.
- **Rate limiting** — Cloudflare can rate-limit at the edge; not configured. Defer until first abuse signal.

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — the orchestrator this stack exposes
- `_docs/architecture/hex-ai-cf-bridge.md` — the CF code this deploys
- `_docs/architecture/hex-ai-network-exposure.md` — why Cloudflare Tunnel was chosen
- `_docs/architecture/hex-ai-client-sdk.md` — the client that calls into this stack
- `CLAUDE.md` rule 10 — production write gate

---

*Last Updated: 2026-05-23 · Initial runbook for v0.3.0–v0.5.0a stack*
