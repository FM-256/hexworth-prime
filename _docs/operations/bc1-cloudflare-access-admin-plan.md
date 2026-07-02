# bc1 Admin Access via Cloudflare Access (Zscaler-proof)

**Status:** PLAN — execute-ready (drafted 2026-07-01)
**Goal:** manage **bc1** (the sandbox host) from a **browser over HTTPS**, from anywhere — including the **Keiser office**, where the Zscaler agent on the managed laptop blocks Tailscale/SSH. See `reference_sandbox_bc1_traefik_docker_api.md` (memory) for the Zscaler-blocks-Tailscale finding.

**DECISIONS (operator, 2026-07-01):** management surface = **Cockpit**; primary hostname = **`bc1.hexworth.tech`**; **also gate the traefik `:8080` dashboard** (+ any sandbox admin UI) behind the **same Cloudflare Access application** (one identity policy for all bc1 admin surfaces). Requires a shell on bc1 for the install/tunnel steps → a TONIGHT/from-home task (Zscaler blocks bc1 SSH from the office); the Cloudflare dashboard steps are done in the operator's own Cloudflare account.

## Why this works where SSH/Tailscale don't
- Zscaler blocks Tailscale's control + relay traffic → **no SSH to bc1 from the office laptop.**
- Zscaler **allows normal HTTPS + WebSockets** — **proven 2026-07-01**: the ttyd lab terminals (WSS over the Cloudflare tunnel) work fine from the office. A browser admin console rides the *same* path, so it will work too.
- bc1 **already runs a Cloudflare Tunnel** (`cloudflared` container in `/home/eq1/hexworth-sandbox/`, routing `sandbox.hexworth.tech` → traefik). We extend that existing tunnel — no new tunnel needed.
- **Cloudflare Access** (Zero Trust) sits in front and requires identity before proxying — so the console is never bare on the internet.

## Architecture
```
Browser (office, behind Zscaler)
  → https://bc1.hexworth.tech           (normal HTTPS — Zscaler allows)
    → Cloudflare Access  (identity gate: email allowlist + OTP/SSO, optional MFA)
      → existing Cloudflare Tunnel (cloudflared on bc1)
        → Cockpit  https://localhost:9090   (system console: web terminal, services, logs, containers)
          → PAM login (second factor of auth — bc1 system account)
```
Two independent auth layers: **Cloudflare Access identity** + **Cockpit system login**.

## Recommended management surface: Cockpit
Cockpit is already the pattern on **neon-server** (runs on :9090). It gives, in one browser UI: a **full web terminal** (the main need — run `apt-mark hold`, `docker logs`, restart services), plus service/log/storage/network management and a **Podman/containers** view. Self-contained, ~zero maintenance.

*(Alternatives, if preferred — see bottom.)*

## Prerequisites
- Cloudflare dashboard access to the **hexworth.tech** zone + **Zero Trust** (Access). (Free plan covers this; Access is free ≤50 users.)
- Admin emails for the allowlist: **f.mora80@gmail.com**, **jorden@hexworth.com** (same as the sandbox lab-manager `ADMIN_EMAILS`).
- Shell on bc1 (do this step from home / a non-Zscaler device the first time).

## Steps (tonight, from a machine that CAN reach bc1)

### 1. Install Cockpit on bc1
```bash
sudo apt-get update && sudo apt-get install -y cockpit cockpit-podman
sudo systemctl enable --now cockpit.socket
# verify it's up locally (Cockpit serves TLS on 9090):
curl -sk https://localhost:9090/ | head -c 40      # expect an HTML/login response
```
Cockpit listens on :9090. Keep it reachable only via the tunnel (don't open :9090 in any firewall / don't publish the port). If bc1 has ufw, ensure 9090 is NOT allowed from the LAN/public.

### 2. Add a public hostname to the EXISTING tunnel → Cockpit
The bc1 tunnel is the `cloudflared` container. Two cases:

**(a) Dashboard-managed tunnel (most likely — the container runs `cloudflared ... tunnel run <token>`):**
Cloudflare dashboard → **Zero Trust → Networks → Tunnels →** *(the bc1 tunnel)* → **Public Hostnames → Add a public hostname**:
- Subdomain: `bc1`  · Domain: `hexworth.tech`
- Service: `HTTPS` → `localhost:9090`
- Additional settings → **TLS → No TLS Verify: ON** (Cockpit uses a self-signed cert) and set **HTTP Host Header / Origin Server Name** if Cockpit rejects the host.
No bc1 restart needed — dashboard-managed ingress applies live.

**(b) Local-config tunnel (`/etc/cloudflared/config.yml` or a mounted config in the compose):** add an ingress rule ABOVE the catch-all:
```yaml
ingress:
  - hostname: bc1.hexworth.tech
    service: https://localhost:9090
    originRequest:
      noTLSVerify: true
  - hostname: sandbox.hexworth.tech      # existing
    service: http://traefik:80
  - service: http_status:404             # existing catch-all (keep last)
```
Then `docker compose up -d cloudflared` (or `restart cloudflared`). Add the DNS route: `cloudflared tunnel route dns <tunnel> bc1.hexworth.tech` (or add the CNAME in the dashboard).

### 3. Gate it with Cloudflare Access (REQUIRED — do before/with step 2 going live)
**One Access application covering ALL bc1 admin hostnames** (so there's a single identity policy for Cockpit + traefik + any future surface).
Cloudflare dashboard → **Zero Trust → Access → Applications → Add an application → Self-hosted**:
- Application name: `bc1 Admin`
- Session Duration: `24h` (or shorter)
- **Application domains** (add all of these to the one app):
  - `bc1.hexworth.tech`            → Cockpit (step 2)
  - `traefik.bc1.hexworth.tech`    → traefik dashboard (step 5)
  - *(add any sandbox admin UI here later)*
  - Or simplest: one wildcard domain **`*.bc1.hexworth.tech`** to cover them all at once.
- **Policy:** Action `Allow` · Include → **Emails**: `f.mora80@gmail.com`, `jorden@hexworth.com`
- (Recommended) Require → **MFA / one of the listed identity providers**; enable email OTP as the login method if no SSO is configured.
- Save. Access now challenges every request to any `*.bc1.hexworth.tech` (and `bc1.hexworth.tech`) before it reaches the origin.

### 4. Verify from the office
Browse **https://bc1.hexworth.tech** → Cloudflare Access login (email OTP/SSO) → Cockpit login (bc1 system user) → open **Terminal**. Run something harmless (`whoami`, `docker ps`). This confirms the whole chain works through Zscaler.

### 5. Also gate the traefik dashboard (:8080)
traefik's dashboard/API is already listening on bc1 `:8080` (`--api.dashboard=true --api.insecure=true`; the compose maps `8080:8080`). Expose it via the **same tunnel + same Access app**, never bare:
- **Tunnel public hostname:** `traefik.bc1.hexworth.tech` → service `HTTP` → `http://traefik:8080` (the tunnel container is on `sandbox-net`, so it can reach the `traefik` service by name; if using local config.yml, add an ingress rule the same way as step 2b).
- The Access app from step 3 already includes `*.bc1.hexworth.tech`, so this hostname is auto-gated by the same email policy. If NOT using the wildcard, add `traefik.bc1.hexworth.tech` to the app's domains.
- **Hardening:** because traefik's API is `insecure=true` (no auth of its own), Cloudflare Access is the ONLY thing protecting it — so it MUST be added to the Access app before the hostname resolves. Do not create the tunnel hostname without the Access app live. (Optional, better: later flip traefik to `--api.insecure=false` + a secured dashboard router, but Access-gating is sufficient.)
- *(Any sandbox/lab-manager admin UI: same recipe — new `X.bc1.hexworth.tech` tunnel hostname, covered by the same wildcard Access app.)*

## Security checklist
- [ ] Cockpit reachable ONLY via the tunnel (port 9090 not exposed on LAN/public/firewall).
- [ ] Cloudflare Access app is LIVE before the hostname resolves publicly (no window where Cockpit is open on the internet).
- [ ] Access policy = explicit email allowlist (not "everyone"); consider MFA + shorter session.
- [ ] Cockpit still requires a bc1 PAM login (defense in depth).
- [ ] Log/review Access logins periodically (Zero Trust → Logs → Access).

## Cost & rollback
- **Cost: $0** — tunnel already exists; Cloudflare Access free tier covers ≤50 users; Cockpit is OSS.
- **Rollback:** delete the Access app + the public hostname/ingress rule, then `sudo systemctl disable --now cockpit.socket` (optionally `apt purge cockpit`). Nothing else on bc1 is touched; the sandbox stack is unaffected throughout.

## Alternatives (if not Cockpit)
- **Cloudflare Access for Infrastructure / browser SSH** — Cloudflare can proxy SSH through the tunnel with short-lived certs and even render a browser SSH terminal (no WARP needed for the browser-rendered path). Cleaner "pure SSH," more setup (SSH CA / infra targets). Good if you want SSH specifically, not a web UI.
- **Portainer** (behind the same tunnel+Access) — Docker/stack-focused web UI; narrower than Cockpit (no system terminal/logs).
- **wetty / ttyd-wrapping-ssh** — minimal browser shell only; least features, smallest footprint.

## Follow-on (optional, later)
- Harden traefik: flip `--api.insecure=false` and serve the dashboard via a secured router (rather than relying only on Access). Access-gating (step 5) is sufficient in the meantime.
- Extend the same `*.bc1.hexworth.tech` + Access pattern to any other bc1 admin surface as it appears.
- Consider the same tunnel+Access pattern for **bc2** if it needs office-reachable admin too.
```
