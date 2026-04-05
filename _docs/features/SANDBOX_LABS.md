# Sandbox Labs

**Status:** SHIPPED
**Components:** `lab-manager/server.js` (API), `docker-compose.yml` (orchestration), 4 container images, `SandboxLauncher.js` (frontend SDK)
**Location:** `/home/eq/hexworth-sandbox/` (separate repo), `_app/components/SandboxLauncher.js` (platform integration)
**Added:** v5.0.0
**Last reviewed:** 2026-04-05

## Purpose

Sandbox Labs provisions isolated Docker containers for hands-on terminal and IDE
experiences. Students click a "Launch Lab" button in course content, receive a
temporary Linux environment (Alpine terminal, Ubuntu terminal, VS Code IDE, or
PostgreSQL database), and access it through a web browser via Cloudflare Tunnel.
No VPN, no SSH keys, no local software installation required.

This exists because cybersecurity and DevOps skills require real command-line practice
on real operating systems — not simulated terminals. The sandbox provides disposable
environments that students can break without consequences.

## Architecture

```
Student browser
  |
  |-- SandboxLauncher.js calls POST /api/sandbox/launch
  |
  v
Cloudflare Tunnel (sandbox.hexworth.dev)
  |
  v
Traefik v3.1 (reverse proxy)
  |-- Routes /api/sandbox/* → Lab Manager (port 3000)
  |-- Routes /s/{sessionId}/* → Container (dynamic, per-session)
  |     (strips /s/{sessionId} prefix before forwarding)
  |
  v
Lab Manager (Node.js Express)
  |-- Validates Firebase ID token
  |-- Creates Docker container with resource limits
  |-- Labels container with Traefik routing rules
  |-- Returns session URL to student
  |
  v
Docker container (sandbox-{sessionId})
  |-- Runs ttyd (web terminal) or code-server (VS Code)
  |-- Isolated on sandbox-net bridge network
  |-- Sablier pauses after 15 min idle, resumes on access
  |-- Auto-destroyed after 120 min max lifetime
```

## Lab Types (6)

| Lab ID | Name | Image | RAM | CPU | Port | Use Case |
|--------|------|-------|-----|-----|------|----------|
| `do-100` | DevOps Foundation | terminal-light | 128MB | 0.5 | 7681 | YAML/JSON editing, env vars |
| `do-101` | DevOps Workbench | terminal-full | 256MB | 1.0 | 7681 | Full dev tools, git, SSH |
| `do-102` | DevOps IDE | ide | 512MB | 1.5 | 8080 | VS Code in browser |
| `do-16` | Git Fundamentals | terminal-full | 256MB | 1.0 | 7681 | Git/version control |
| `arctic` | Arctic Terminal | terminal-full | 256MB | 1.0 | 7681 | Arctic CLI Hub labs |
| `db-sql` | PostgreSQL Terminal | postgres-lab | 256MB | 1.0 | 7681 | SQL/database training |

## Container Images (4)

### terminal-light (Alpine 3.20)
Minimal footprint for read-only exercises:
- **User:** `student` (non-root)
- **Tools:** ttyd, bash, vim, nano, jq, yq, tree, grep, sed, awk, git, ssh, curl, wget
- **Size:** ~50MB

### terminal-full (Ubuntu 24.04)
Full development environment:
- **User:** `student` (non-root)
- **Tools:** ttyd, bash-completion, vim, nano, git (+ git-lfs, tig), openssh-client, gnupg, python3, make, NVM (Node.js v22)
- **Size:** ~250MB

### ide (Ubuntu 24.04)
VS Code in the browser via code-server:
- **Tools:** code-server, git, python3, make, NVM, openssh-client, gnupg
- **Config:** No auth (handled by Lab Manager), no TLS, telemetry disabled
- **Size:** ~400MB

### postgres-lab (Ubuntu 22.04)
Database training with seed data:
- **Tools:** PostgreSQL 16, ttyd, vim, nano, sudo
- **Seed:** Initialized from `seed.sql` (custom per lab)
- **User:** `student` (non-root, can sudo)

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/sandbox/launch` | Firebase token | Create or resume container |
| `GET` | `/api/sandbox/status/:sessionId` | Firebase token | Check container state |
| `DELETE` | `/api/sandbox/destroy/:sessionId` | Firebase token | Stop and remove container |
| `GET` | `/api/sandbox/list` | Firebase token | List user's active sandboxes |
| `GET` | `/api/sandbox/health` | None | Deployment health check |

### Launch Flow

1. Validate Firebase ID token (or `X-Dev-Uid` in dev mode)
2. Check for existing session for same user + lab pair
3. If container exists and running → return existing URL
4. If container exists but paused (by Sablier) → restart it
5. If expired or not found → create new container
6. Enforce per-user limit (default: 2 concurrent containers)
7. Docker creates container with Traefik labels for dynamic routing
8. Return `{ sessionId, url, status, lab }` to frontend

## Idle Management (Sablier)

Sablier 1.8 monitors container activity:
- **Idle timeout:** 15 minutes (configurable via `IDLE_TIMEOUT_MINUTES`)
- **On idle:** Container paused (not deleted) — preserves student work
- **On next access:** Sablier intercepts request, shows "Resuming..." UI, unpause container
- **Theme:** `hacker-terminal` (custom pause screen matching Hexworth aesthetic)

This means a student can walk away, come back 30 minutes later, and resume exactly
where they left off — their files, terminal history, and running processes are preserved.

## Container Security

- **No new privileges:** `security_opt: ['no-new-privileges:true']`
- **Dropped capabilities:** ALL (no root escalation)
- **Added capabilities:** Only CHOWN, SETUID, SETGID, DAC_OVERRIDE, NET_BIND_SERVICE
- **Non-root user:** `student` user runs ttyd/code-server
- **Network isolation:** Bridge network, no host network access
- **Session ownership:** Only the token owner can access/destroy their sessions

## Frontend Integration (SandboxLauncher.js)

The platform-side SDK in `_app/components/SandboxLauncher.js`:

```javascript
SandboxLauncher.launch('arctic');        // Launch Arctic terminal
SandboxLauncher.status(sessionId);       // Check container state
SandboxLauncher.destroy(sessionId);      // Stop and remove
SandboxLauncher.list();                  // List active sandboxes
SandboxLauncher.renderButton(container, 'do-100');  // Render launch button
```

- **API base:** `https://sandbox.hexworth.tech/api/sandbox`
- **Auth:** Uses FirebaseAuth token, `X-Dev-Uid` fallback in dev
- **Polling:** Checks status every 10s until container is running
- **Timeout display:** Shows max lifetime (120 min) and idle timeout (15 min) to student

## Infrastructure Stack

| Component | Image | Purpose |
|-----------|-------|---------|
| **Traefik v3.1** | `traefik:v3.1` | Reverse proxy, dynamic routing via Docker labels |
| **Cloudflare Tunnel** | `cloudflare/cloudflared:latest` | Public HTTPS exposure without port forwarding |
| **Sablier 1.8** | `acouvreur/sablier:1.8` | Idle container management (pause/resume) |
| **Lab Manager** | Custom (Node.js) | API server, container orchestration |

All services run on `sandbox-net` Docker bridge network.

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Dev mode enables X-Dev-Uid auth bypass |
| `FIREBASE_PROJECT_ID` | — | Hexworth Prime project for token validation |
| `SANDBOX_DOMAIN` | — | Public domain for container URLs |
| `MAX_CONTAINERS_PER_USER` | `2` | Concurrent container limit per student |
| `IDLE_TIMEOUT_MINUTES` | `15` | Sablier idle threshold |
| `MAX_LIFETIME_MINUTES` | `120` | Hard limit before auto-cleanup |

## Key Decisions

- **Docker-in-Docker via socket mount** — Lab Manager creates containers by talking to
  the host Docker daemon via `/var/run/docker.sock`. This avoids nested Docker (DinD)
  complexity while giving full control over container lifecycle.

- **Traefik dynamic routing** — Each container gets Traefik labels at creation time.
  Traefik watches the Docker socket and instantly creates routes. No config reload,
  no restart. Container creation = route creation.

- **Sablier over custom idle detection** — Rather than building idle monitoring into
  ttyd or code-server, Sablier operates at the network level. No traffic to the
  container for 15 minutes = pause. This works regardless of what's running inside.

- **Cloudflare Tunnel over port forwarding** — Zero exposed ports on the host. The
  tunnel connects outbound to Cloudflare's edge, which handles SSL termination and
  DDoS protection. Students access `sandbox.hexworth.dev` without knowing the server's IP.

- **Per-user limit of 2** — Prevents resource exhaustion. A student can have one terminal
  and one IDE running simultaneously, but not 10 terminals. Configurable via env var.

- **Separate repo** — Sandbox infrastructure is in `hexworth-sandbox/`, not in the main
  `hexworth-prime/` repo. This enforces separation of concerns: the platform doesn't
  need Docker knowledge, the sandbox doesn't need Firebase Hosting knowledge.

## Known Limitations

- **No persistent storage** — Container filesystems are ephemeral. When a container is
  destroyed (after 120 min or manual destroy), all student work is lost. No volume
  mounts to persistent storage. Students must save work externally (git push, copy/paste).

- **Single server** — All containers run on one host. No horizontal scaling, no load
  balancing across multiple Docker hosts. Sufficient for classroom use (20-30 concurrent
  students) but not for hundreds.

- **WebSocket stability** — ttyd uses WebSocket for terminal I/O. Traefik is configured
  with extended timeouts (readTimeout=0s, writeTimeout=0s, idleTimeout=300s) and ttyd
  has ping intervals to maintain connections. Despite this, brief disconnects can occur
  on flaky networks.

- **No GPU passthrough** — Containers are CPU-only. No GPU access for machine learning
  labs or GPU-accelerated tasks. The bc4 MI60 GPU is planned for future integration
  but requires a Dell riser (0800JH) that hasn't been installed.

- **Domain mismatch** — SandboxLauncher.js references `sandbox.hexworth.tech` but the
  Docker Compose configures `sandbox.hexworth.dev`. This needs reconciliation.
