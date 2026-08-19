# OpenStack web console (Horizon) — how it is reached, and how it is gated

**Live since 2026-08-19.** `https://sandbox.hexworth.tech/dashboard`

Students previously had CLI-only access to their OpenStack project. The console was running the
whole time but was reachable only from bc2, so nobody could use it. This is what changed, how to
use it, and what to check when it misbehaves.

## For students

1. Launch any OpenStack lab from the House of the Cloud.
2. A panel appears under the launcher with **User**, **Password**, and **Open the web console**.
3. Open the link, sign in with those two values.

The password is generated per session and **rotated when the lab ends**, so a screenshot of it
stops working. There is no permanent password to leak, and nothing to write down — relaunch and
read the new one.

The terminal never uses that password. It is authenticated with an **application credential**
injected into the container, which the student never sees or types. Horizon cannot consume an
application credential — its login form takes username/password — which is the entire reason a
typeable secret exists at all.

## For instructors

The same panel and the same gate apply; an instructor account reaches the console the same way a
student does. The older tunnel path still works if the platform is down:

```
ssh -L 8080:<vm-ip>:80 bc2      # then http://localhost:8080/dashboard
```

Addresses are in `~/hexworth-infra-private/`, not here — this repo is public.

## How the gate works

```
browser ──► cloudflared ──► traefik ──► horizon-proxy (nginx) ──► bc2:8080 ──► VM:80 /dashboard
                              │
                              └─ forwardAuth ──► lab-manager /api/sandbox/console-auth
```

Launching a lab calls `POST /api/sandbox/console-session`, which — **after** verifying the
student's Firebase ID token — returns an HttpOnly, HMAC-signed cookie. traefik calls
`console-auth` on every `/dashboard` request; no valid cookie means 401 and the login form is
never served.

**Deliberately not Cloudflare Access.** CF Access would be a second enrollment list beside
Firestore, keyed on assorted personal Google accounts rather than one domain. Two lists drift, and
drift fails both ways: a dropped student keeps console access, an added student is locked out and
it reads as "the lab is broken". forwardAuth against lab-manager means access follows enrollment
because it *is* enrollment.

The bar is exactly the bar for launching a sandbox: a real, non-anonymous Firebase account. This
host holds no service-account credential by design and cannot read Firestore, so claiming a
stricter check here than the one guarding the container pool would be theatre.

## Verifying it still works

```
# 1. the gate holds — anonymous must get 401 and NO login form
curl -s -o /dev/null -w '%{http_code}\n' https://sandbox.hexworth.tech/dashboard/auth/login/

# 2. credentialed CORS is allowed ONLY for platform origins
curl -s -D- -o /dev/null -X OPTIONS -H 'Origin: https://hexworth.com' \
     -H 'Access-Control-Request-Method: POST' \
     https://sandbox.hexworth.tech/api/sandbox/console-session | grep -i allow-credentials

# 3. the same check from any other origin must NOT return allow-credentials
#    NOTE: allow-ORIGIN is still reflected for any origin by the global cors({origin:true}).
#    That is expected and harmless. The property that matters is that allow-CREDENTIALS is
#    absent, because without it the browser refuses the credentialed fetch and no cookie is
#    minted. Do not "fix" the reflected origin and assume you have changed anything.
curl -s -D- -o /dev/null -X OPTIONS -H 'Origin: https://evil.example.com' \
     -H 'Access-Control-Request-Method: POST' \
     https://sandbox.hexworth.tech/api/sandbox/console-session | grep -i allow-credentials

# 4. compute can actually serve a lab — a gated console in front of dead compute still
#    fails the student, just later. This is the bc2 probe, not a Horizon check.
ssh bc2 /home/eq1/openstack-compute-probe.sh && \
  grep hexworth_openstack_up /var/lib/node_exporter/textfile_collector/openstack_compute.prom
```

Expected: `401`; `allow-credentials: true`; nothing; both `_up` series `1`.

## Failure modes, and what each one actually means

| Symptom | Cause | Fix |
|---|---|---|
| Console rejects a correct-looking password | Lab ended; password rotated at teardown | Relaunch, read the new one |
| `/dashboard` returns 401 for a signed-in student | Console cookie missing or expired (lifetime = `MAX_LIFETIME_MINUTES`) | Relaunch the lab; launching is what mints the cookie |
| Login POST fails with "Origin checking failed" | Horizon lost `CSRF_TRUSTED_ORIGINS` | Re-apply the `HEXWORTH_PUBLIC_CONSOLE` block in the VM's `local_settings.py`, reload apache2 |
| Credentials panel never appears | Not a personal-cloud launch, or the bridge refused the claim | Check `docker logs lab-manager` for `[bridge]` lines |
| Panel appears but says access could not be prepared | The cookie mint failed | Relaunch; if it persists, check lab-manager reachability from the browser |

## Things that will bite whoever changes this next

**The cookie is cross-site.** Lab pages are `hexworth.com`; this API is `sandbox.hexworth.tech`.
That means `SameSite=None` and `credentials: 'include'` and `Access-Control-Allow-Credentials`
must ALL hold. Drop any one and the browser silently discards the cookie — the console then 401s
for a student who did everything right, with nothing in any log to explain it.

**`cors({origin: true})` answers OPTIONS itself.** A route-level `app.options()` handler for this
path never runs. The credentialed-CORS middleware must be registered ABOVE `cors()` in
`server.js`, and it is. This cost a debugging cycle: the preflight returned Allow-Origin but no
Allow-Credentials, which looks fine until you read the exact header list.

**Password rotation does not revoke application credentials.** Verified against live Keystone
(app-cred auth returns 201 after a rotation). This is what makes rotating on every claim safe: a
student's second launch does not kill the first container's CLI. If a future OpenStack upgrade
changes that, rotation-on-claim becomes a session-killer and this assumption must be re-tested.

**The panel must be removed when the session ends.** `closeIframe()` in `SandboxLauncher.js`
deletes `.sandbox-console-panel`. Without that the credentials stay on screen, looking live, next
to a link that now 401s. Caught in review, not in testing — the happy path looked perfect.

## Related

- `_docs/architecture/openstack-identity-bridge.md` — fork B (app creds vs passwords), fork F (Horizon)
- `_docs/operations/openstack-nova-compute-outage-2026-08-19.md` — why compute liveness is monitored
- `_app/houses/cloud/openstack/labs/cloud-openstack-console.lab.html` — the student lab
