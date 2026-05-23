# Hex AI — Network Exposure Decision

> Decision date: 2026-05-23
> Status: Selected — Cloudflare Tunnel direct to hexclass:8000

## Constraint

The orchestrator runs on `hexclass.lan` at `192.168.1.160` — a residential LAN behind NAT. Firebase Cloud Functions (which will host `hexAiChat`, the bridge from `hexworth.com` to the orchestrator) run in Google's network. There is no path between the two without one of:

- A public IP on hexclass (requires static IP + port forward + DDNS + DIY TLS)
- A tunnel service (Cloudflare Tunnel, Tailscale Funnel, ngrok, etc.)
- A proxy node with public reachability (bc1 — same NAT problem)
- A VPC + subnet router (Cloud VPN + Tailscale subnet router on a GCE VM)

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Cloudflare Tunnel direct to hexclass** | Industry standard for this exact pattern; free tier sufficient; `cloudflared` runs as systemd service; Cloudflare Access provides second-stage auth (free tier); no port-forward; automatic TLS | Adds Cloudflare as new vendor (Hexworth doesn't currently use CF — Firebase Hosting is on Google CDN); Cloudflare can see request bodies (acceptable risk: not student PII, just orchestrator chat) |
| B. Tailscale Funnel | Stays in our existing Tailscale network; ACLs in config not vendor UI | Funnel public endpoint quality less mature than CF; requires Tailscale plan upgrade for production-grade Funnel; less battle-tested at scale |
| C. bc1 as Caddy reverse-proxy → Tailscale → hexclass | Defense-in-depth (auth at edge + auth at origin); reuses existing infra | bc1 ALSO behind residential NAT — same exposure problem one layer up; adds hop latency; bc1 becomes single point of failure |
| D. GCP VPC + subnet router | No public exposure ever; closed network | Requires GCE VM + Cloud VPN + Tailscale subnet router; substantial monthly cost; complex setup |

## Decision: Option A (Cloudflare Tunnel direct)

**Why:**

1. **The other options that "stay private" actually inherit the same NAT problem.** bc1 isn't a meaningful improvement over direct exposure because bc1 is ALSO behind residential NAT — it would need its own tunnel. The only real "private" option is D (VPC), which has substantial cost.

2. **Cloudflare Tunnel is the standard pattern.** Self-hosted services behind residential NAT exposed to cloud functions is a known shape; CF Tunnel is the dominant solution. Documentation, community, debugging tools are mature.

3. **Cloudflare Access adds a second auth layer.** Beyond `X-API-Key`, Cloudflare Access can require Google SSO or a service-token issued only to the Firebase CF. That means a stolen `X-API-Key` alone cannot reach the orchestrator from outside Cloudflare Access's allowlist.

4. **No infrastructure cost.** Free tier handles our traffic volume; the only cost is operator time to set up.

5. **Defense-in-depth still applies.** The orchestrator binds `127.0.0.1`; `cloudflared` proxies to it locally. Even if Cloudflare were compromised, an attacker reaching the tunnel still needs `X-API-Key` to invoke `/chat`. Even if both were compromised, the orchestrator's `Help Level` ceiling + prompt-injection guard + Constitution prompt limit damage.

## Implementation shape

```
[browser]
   ↓ HTTPS to hexworth.com (Firebase Hosting)
   → Calls /api/hex-ai (Firebase CF: hexAiChat)
     - Validates Firebase Auth ID token from the user
     - Reads HEX_API_KEY from Secret Manager
     - Reads CF_SERVICE_TOKEN from Secret Manager (Cloudflare Access)
     - POSTs to https://hex-ai.hexworth.com/chat
       with CF-Access-Client-Id + CF-Access-Client-Secret + X-API-Key
   ↓
[Cloudflare Tunnel → hex-ai.hexworth.com]
   - Cloudflare Access validates service token (only Firebase CF allowed)
   - Routes to cloudflared on hexclass via tunnel
   ↓
[hexclass:8000 — orchestrator]
   - Validates X-API-Key against HEX_API_KEYS
   - Runs RAG retrieval, ollama, returns response
```

## What ships in Step 2 of v0.3.0

1. `cloudflared` installed on hexclass as systemd unit
2. Tunnel created via `cloudflared tunnel create hex-ai`
3. DNS: `hex-ai.hexworth.com` CNAME to the tunnel
4. Cloudflare Access policy: only Firebase CF service token allowed
5. orchestrator stays bound to `127.0.0.1`; `cloudflared` is the only thing reaching it

## What this does NOT do

- No request rate-limiting at the Cloudflare edge yet (CF has the feature; defer until traffic shape is real)
- No request logging beyond what `cloudflared` provides by default
- No regional pinning (default Cloudflare anycast)
- No Cloudflare Workers in front (defer until we have a reason)

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — orchestrator architecture (v0.3.0 will be the version that depends on this network shape)
- `_docs/operations/hexclass-server-profile.md` — host this runs on
- `[[hexclass-server]]` (memory) — operational state of the box

---

*Last Updated: 2026-05-23 · v0.3.0 design phase*
