# Cloudflare Account and Tunnels — Hexworth Infrastructure

> Audited 2026-05-24 — what's currently on Cloudflare, what's NOT, and how to add new endpoints

## TLDR

| Domain | DNS at | Used for | Touch? |
|---|---|---|---|
| `hexworth.com` | **IONOS** | Firebase Hosting (main student-facing site) | **DO NOT migrate** — high risk to live site |
| `hexworth.tech` | **Cloudflare** | Sandbox lab infrastructure via tunnel | Add new endpoints here |

For any new Cloudflare-fronted service (AI orchestrator, sandbox extension, etc.), **use `*.hexworth.tech`** — the zone is already on Cloudflare with active tunneling and known credentials.

## Active Cloudflare Tunnel — `hexworth-sandbox`

The only currently-running tunnel on the account.

| | |
|---|---|
| Tunnel name | `hexworth-sandbox` |
| Tunnel UUID | `2809c48c-5898-4c24-90fe-7c967696b4cb` |
| Host | bc1 (`192.168.1.176`) |
| Binary | `/usr/local/bin/cloudflared` (systemd service) |
| User credentials | `~eq1/.cloudflared/cert.pem` + `~eq1/.cloudflared/<UUID>.json` |
| System credentials | `/etc/cloudflared/credentials.json` (root-owned, used by systemd) |
| Config | `~eq1/.cloudflared/config.yml` |
| Created | 2026-03-07 |
| Active connections | 4 edge connections (atl11, atl12 ×2, atl14) |
| Ingress rule | `sandbox.hexworth.tech` → `http://traefik:80` |

This tunnel exposes the bc1 sandbox lab infrastructure (Traefik reverse proxy + Docker containers running student lab environments) without port-forwarding. Memory note: an older memory entry said `sandbox.hexworth.dev` — that was incorrect; the actual domain is `.tech`, corrected 2026-05-24.

## Adding a new tunnel/endpoint

Use this recipe for any future service that needs a `*.hexworth.tech` hostname.

### 1. Install cloudflared on the host that serves the traffic

```bash
sudo apt-get update
sudo apt-get install -y cloudflared
```

### 2. Authenticate against the existing Cloudflare account

**Path A — Reuse the existing Origin Certificate (faster, no browser):**

```bash
# From the host that already has it (bc1):
scp eq1@192.168.1.176:~/.cloudflared/cert.pem ~/.cloudflared/cert.pem
# That's it — the cert authenticates new tunnel creation on the same account
```

**Path B — Fresh login (cleaner auth boundary):**

```bash
cloudflared tunnel login
# Print a URL — visit in browser, log in to Cloudflare, authorize the zone
# Generates a fresh ~/.cloudflared/cert.pem
```

### 3. Create a new tunnel per host (DON'T share one tunnel across hosts)

Tunnels are 1:1 with the service they front. Mixing services into one tunnel routes traffic through whichever host runs it — usually wrong.

```bash
cloudflared tunnel create <tunnel-name>
# Outputs: "Created tunnel <name> with id <UUID>" and writes a credentials JSON
```

### 4. Write the config

```bash
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml <<EOF
tunnel: <UUID-from-above>
credentials-file: /home/<user>/.cloudflared/<UUID>.json

ingress:
  - hostname: <name>.hexworth.tech
    service: http://127.0.0.1:<port>
  - service: http_status:404
EOF
```

### 5. Route DNS in the existing `hexworth.tech` zone

```bash
cloudflared tunnel route dns <tunnel-name> <name>.hexworth.tech
# Cloudflare API creates the CNAME automatically; no manual dashboard work
```

### 6. Install as a systemd service for boot persistence

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

### 7. Verify externally

From any machine NOT on the LAN:

```bash
curl -sI https://<name>.hexworth.tech | head -5
```

Should return `HTTP/2 200` (or whatever your origin returns) with a `cf-ray` header.

## What this account does NOT cover

- `hexworth.com` — registered at IONOS, DNS at IONOS, points to Firebase Hosting (apex A `199.36.158.100`). Not on Cloudflare. Don't migrate without a specific reason — see "When to migrate hexworth.com" below.
- Other potential domains (e.g., `hexworth.dev`, `hexworth.ai`) — unconfirmed; check Cloudflare dashboard if needed.

## When to migrate `hexworth.com` to Cloudflare

Not now. Triggers to revisit:

- Want Cloudflare proxy/caching/WAF in front of `hexworth.com` (perf optimization, DDoS protection)
- Want CF Workers running at `hexworth.com` paths
- Want CF Access in front of admin routes on `hexworth.com`

None apply for the current AI build. Stay on `hexworth.tech` for new services.

## Migration would entail (when the trigger comes)

1. Add `hexworth.com` as a new zone in the Cloudflare dashboard
2. Copy every current IONOS DNS record into Cloudflare BEFORE flipping NS
3. Verify by querying Cloudflare's nameservers directly with `dig`
4. Change NS records at IONOS to the Cloudflare-provided nameservers
5. Wait for propagation (4-48 hours; most resolvers in ~1-2 hours)
6. Decide on per-record proxy status (gray cloud = DNS-only, orange = CF proxy)
   - Firebase Hosting A records: keep gray (Firebase handles its own CDN)
   - New CF Workers / Tunnel-fronted endpoints: orange

## Related

- `_docs/operations/hex-ai-deploy-runbook.md` — AI orchestrator deploy that uses the new tunnel
- `_docs/architecture/hex-ai-network-exposure.md` — decision rationale for Cloudflare Tunnel vs other paths
- `_docs/operations/hexclass-server-profile.md` — host that will receive the new `hex-ai` tunnel

## Memory references

- `[[cloudflare-account]]` — same content in the operator memory store
- `[[sandbox-infrastructure]]` — what the existing tunnel exposes

---

*Last Updated: 2026-05-24 · Account audit on Cloudflare account discovery*
