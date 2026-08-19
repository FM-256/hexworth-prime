# The status endpoint on bc1 — how it is configured, and why

Written because an adversarial review pointed out, correctly, that this configuration existed
only as a narrative in a commit message. **"I moved the credential" is not verifiable six months
from now.** This file is the artifact; the verification commands are at the bottom so anyone can
re-check the claims rather than trust them.

> Addresses and credentials are NOT here — this repo is PUBLIC. The credential lives on bc1 in
> `/home/eq1/hexworth-status-secret/` (0700) and in Firebase Secret Manager as
> `SERVICE_STATUS_CREDENTIAL`.

## What it is

The probe writes `status.json`; a small nginx container serves it; traefik routes and
authenticates it; the existing cloudflared tunnel publishes it. **No new hostname, no new
credential store, no Firestore write from bc1.**

```
probe (cron */2) ──> /home/eq1/hexworth-status/status.json
                          │ (read-only bind mount)
                     hexworth-status  (nginx:alpine, restart unless-stopped, sandbox-net)
                          │
                     traefik  Path(`/status.json`) + basicauth middleware
                          │
                     cloudflared ──> https://sandbox.hexworth.tech/status.json
```

## The container

```
docker run -d --name hexworth-status --restart unless-stopped --network sandbox-net \
  -v /home/eq1/hexworth-status:/usr/share/nginx/html:ro \
  --label traefik.enable=true \
  --label 'traefik.http.routers.hexstatus.rule=Path(`/status.json`)' \
  --label traefik.http.routers.hexstatus.entrypoints=web \
  --label traefik.http.routers.hexstatus.middlewares=hexstatus-auth \
  --label 'traefik.http.middlewares.hexstatus-auth.basicauth.users=<bcrypt from the 0700 dir>' \
  --label traefik.http.services.hexstatus.loadbalancer.server.port=80 \
  nginx:alpine
```

Three details that are load-bearing:

**`Path()` and not `PathPrefix()`.** Exact match is what makes everything else in the directory
unreachable — the `.tmp` files from the probe's atomic write, any stray backup, a directory
listing. With `PathPrefix` those would all be served.

**`:ro` on the mount.** The web server has no business writing to the probe's output directory.

**The credential is NOT in the served directory.** It was, briefly, during setup — a mistake
caught and moved to `/home/eq1/hexworth-status-secret/` (0700). It was never reachable, because
of the exact-`Path()` rule, but it was one label away from being so.

## Failure mode seen during setup, worth knowing

`docker run --rm httpd:alpine htpasswd -nbB ...` produced an **empty string** on this host. That
empty value went into the traefik label, and traefik responded by **disabling the router** — so
the endpoint returned 404 rather than serving unauthenticated. It failed safe, but only by luck:
a middleware that failed *open* would have published the file to the internet.

The lesson generalises past this one script: **verify a generated credential is non-empty before
you deploy something that depends on it**, and prefer a config that breaks loudly over one that
silently degrades to permissive.

## Verify the claims — do not trust this file either

```
# 1. only /status.json is reachable; everything else 404s
for p in / /status.json.1.tmp /htpasswd /index.html; do
  curl -s -o /dev/null -w "$p %{http_code}\n" -u "$CRED" "https://sandbox.hexworth.tech$p"
done

# 2. the gate holds
curl -s -o /dev/null -w "anon %{http_code}\n" https://sandbox.hexworth.tech/status.json   # want 401
curl -s -o /dev/null -w "auth %{http_code}\n" -u "$CRED" https://.../status.json          # want 200

# 3. the credential is not in the served tree, and the secret dir is 0700
ls -la /home/eq1/hexworth-status/            # expect: status.json ONLY
ls -ld /home/eq1/hexworth-status-secret      # expect: drwx------

# 4. the router is enabled and has the auth middleware attached
curl -s http://127.0.0.1:8080/api/http/routers | grep -A2 hexstatus

# 5. the running probe matches the repo (no drift between reviewed and executing code)
diff <(ssh bc1 cat /home/eq1/hexworth-deadman/service-probe.sh) \
     _tools/monitoring/probe/service-probe.sh
```

Verified 2026-08-19: all five pass — 404 on every path except `/status.json`, 401 anonymous /
200 authenticated, served directory contains only `status.json`, secret directory `drwx------`,
router `enabled` with `hexstatus-auth` attached, and the deployed probe byte-identical to the
committed one.

## Rebuilding it

The container is `--restart unless-stopped`, so it survives reboots. If it is lost entirely,
re-run the `docker run` above with the hash from `/home/eq1/hexworth-status-secret/htpasswd`.
If that file is lost, generate a new credential, update the container label, and set the new
value as `SERVICE_STATUS_CREDENTIAL` in Firebase Secret Manager — the function reads it from
there, so both sides must be changed together.
