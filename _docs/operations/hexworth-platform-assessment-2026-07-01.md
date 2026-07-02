# Hexworth Platform Assessment — 2026-07-01

**Status:** Findings documented; remediation Phase 1 in progress.
**Scope:** Domain/DNS architecture, Firebase Hosting config, Cloud Functions QC, shared-folder hygiene, platform content-QC posture.

## TLDR

The "main domains" are not mirrors and never were: the Firebase Hosting site has exactly **one** provisioned custom domain (`hexworth.com`, verified via the Hosting REST API). `www.hexworth.com` and `hexworth.tech` have DNS records but were never registered with Firebase Hosting, so Firebase has no TLS certificate for them — `www` fails the TLS handshake in the browser, `.tech` fails it between Cloudflare and origin (error 525). A bare A record is not enough on multi-tenant hosting: each hostname must be provisioned on the site for certificate issuance and Host-header routing. Separately, a live-verified cache bug makes `/` and directory-index URLs CDN-cached for up to 1 hour while `.html` URLs are always fresh — a second, independent source of "same site renders differently." Cloud Functions are in good shape overall, with one real correctness bug (per-instance `FLAG_SECRET`). Content QC debt is concentrated in QC-57 (client-graded quizzes) and HUB-001 (hub/catalog drift).

---

## 1. Domain architecture (the "why do domains render differently" question)

### Verified state, per domain (all probes 2026-07-01)

| Domain | DNS (nameservers) | Live result | Cause |
|---|---|---|---|
| `hexworth.com` | IONOS (`ui-dns.*`) → A 199.36.158.100 | HTTP 200 | Only provisioned custom domain: Hosting API reports `DOMAIN_ACTIVE / CERT_ACTIVE / DNS_MATCH` |
| `www.hexworth.com` | IONOS → A 199.36.158.100 | TLS failure (no HTTP response) | Never added in Firebase Hosting; Firebase presents the fallback `CN=firebaseapp.com` cert (verified via `openssl s_client`); the `hexworth.com` cert has no `www` SAN |
| `hexworth.tech` (apex) | Cloudflare (`laura/clark.ns.cloudflare.com`), proxied | Cloudflare **error 525** (SSL handshake with origin failed) | *Inference, unverified:* apex record most likely points at an origin (Firebase) that has no certificate for `hexworth.tech` — same root cause as `www`. Confirm in the Cloudflare dashboard (DNS record target + SSL mode) |
| `www.hexworth.tech` | No DNS record | NXDOMAIN | Never created |
| `sandbox.hexworth.tech` | Cloudflare Tunnel → bc1 traefik | Working (root `/` 404 = no router for `/`, expected) | Lab infrastructure, independent of hosting |
| `hexworth.org` | Cloudflare (different setup), generic haproxy-style 403 | 403 | *Inference:* believed **not owned by Hexworth** — zero references in repo, `~/hexworth-shared/`, or docs. Confirm against registrar records |
| `hexworth-prime.web.app` / `.firebaseapp.com` | Google | HTTP 200, byte-identical to `hexworth.com` | Auto-provisioned true mirrors |

### Mechanism

Firebase Hosting is multi-tenant behind shared anycast IPs. Routing is by TLS SNI / Host header, and certificates are issued per registered custom domain. A DNS record pointing at `199.36.158.100` reaches Firebase's front door, but for an unregistered hostname Firebase serves the generic `firebaseapp.com` certificate → browsers (and Cloudflare in Full SSL mode) reject the handshake. "Simple name records" therefore cannot produce mirrors on this platform.

### Even a provisioned second domain would not be a full mirror today

- `functions/hex-ai-bridge.js:320` — `ALLOWED_STREAM_ORIGINS` allows only `https://hexworth.com`, `https://hexworth-prime.web.app`, `https://hexworth-prime.firebaseapp.com` (plus preview channels and localhost). Dr. Hex AI streaming returns 403 from any other origin.
- Invite links default to `https://hexworth.com` (`INVITE_BASE_URL` fallback, `functions/index.js:4636`); Discord bot embeds hardcode `https://hexworth.com/...` deep links throughout `functions/index.js`.

### Cache-header defect (second "renders differently" mechanism, live-verified)

`firebase.json` sets `Cache-Control: no-store` via glob `**/*.html`. Header matching runs against the literal request path *before* Firebase resolves a directory to its `index.html`, so extensionless paths never match the glob. Verified live: `https://hexworth.com/` returned `cache-control: max-age=3600` while `https://hexworth.com/index.html` returned `no-store`. Affected URL forms: `/`, `/arena/`, `/join/`, `/workshop/`, `/signal/`, `/announcements/`, `/dispatch/`, `/tenant/`, etc. Consequence: after a deploy, these pages can serve stale for up to 1 hour, varying per CDN edge node — different machines/domains see different content.

**Fix (this pass):** added a `regex` header rule `^/(.*/)?$` in `firebase.json` applying the same `no-store` value to `/` and all trailing-slash paths.

**Known residual gap (scoped out of this pass):** the no-trailing-slash form (`/arena`) triggers a Firebase-generated 301 to `/arena/`; that redirect response carries no Cache-Control from our rules and may itself be edge-cached. Low impact (redirect target rarely changes), tracked here so it is not lost.

---

## 2. Cloud Functions QC

Overall posture is good: ~130 deployed functions, all firebase-functions v2, Node 22, `us-central1`, current dependencies. Every `admin*` callable goes through `requireAdmin` (auth + admin claim + `ADMIN_EMAILS` allowlist); deliberately unauthenticated endpoints (`resolveJoinCode`, Discord interaction webhook with ed25519 verification) are justified. Real secrets use Secret Manager; `functions/.env` is git-ignored.

Findings, ranked:

1. **`FLAG_SECRET` is per-instance, but the path is inert (demoted 2026-07-02 after code-trace)** — `functions/index.js:27`: `crypto.randomBytes(32)` at module load. Sole consumer is `generateGateProof` (`index.js:1914`), whose only caller is `completeGate` (`index.js:109`) verifying an *optional* legacy `proof` param for gates 1-5; gate pages call `completeGate` with an empty proof, and no server path ever returns a proof to a client, so no client can hold a valid one — the check is unreachable-in-practice legacy code, not a live student-facing bug. Note the code/comment mismatch: the comment (`index.js:1915-1918`) describes a gate-answer-derived proof computed by a client-side `AccessGuard.generateGateProof()`, but that function exists nowhere (searched `_app/` and `~/hexworth-shared/` 2026-07-02, both empty) and the implementation actually uses an HMAC keyed by the server-only random secret — abandoned mid-design scaffolding rather than mere dead code. If the proof flow is ever revived: move the secret to Secret Manager AND make the proof compare at `index.js:110` timing-safe. Low priority.
2. **Deploy artifact bloat + tracked answer keys** — `functions/.gcloudignore` excludes only `.git`/`node_modules`, so ~118 one-off scripts, `.bak` files, `_backups/`, `_audit/` upload on every deploy. `functions/quiz_keys.json` (264 KB) and `functions/operator_keys.json` are git-tracked answer keys — decide whether that is acceptable for this (private) repo; they should at minimum be excluded from the deploy artifact.
3. **App Check disabled platform-wide** — `ENFORCE_APP_CHECK = false` (`functions/index.js:31`). Callables accept any client bearing a valid Firebase ID token. Deliberate trade-off; revisit when convenient.
4. **One naive API-key compare** — `functions/index.js:1045` (`getHedExport`) uses plain `!==`. The four `x-api-key` sites in `hex-ai-bridge.js` already use `crypto.timingSafeEqual` (lines 542, 914, 989, 1089) — verified per-site, do not generalize this finding. Low severity.
5. **`ADMIN_EMAILS` duplicated in 3 files** — `index.js:26`, `hex-ai-bridge.js:68`, `manage-announcements.js`. Drift-prone; centralize.

---

## 3. Shared folder (`~/hexworth-shared/`, ~71 GB)

Active working set (`Solutions/`, `Raw sources/wsa|Ai/`, `class-decks/`) is healthy. Issues:

- **Credential-shaped files in a Syncthing-synced folder** (contents referenced by path only, deliberately not reproduced here): `Ai-NODE/CF-api-fix.txt`, `Ai-NODE/firebase-cf-hex-ai.txt`, `atlassian/API/api.txt`, `images/neon ip configs.zip`. The Cloudflare token in `CF-api-fix.txt` was tested against the CF API on 2026-07-01 and is **expired** (verified). The others are unverified — they appear credential-shaped by name/format; whether they hold live secrets has not been checked. Action: relocate all to a proper secret store / `_archive`, rotate anything live. Per the never-destroy rule: move, do not delete.
- **~25 GB reclaimable bloat:** duplicate ` (1)` Humble Bundle zips (10+ GB), 15 GB of ISOs in `PXE/` that belong in bc1 cold storage, 726 `*:Zone.Identifier` Windows metadata files.
- **Archive candidates:** `eth-strip-quiz-2026-04-28/`, `eth-quiz-rebalance-2026-04-28/`, `india-restore-2026-04-28/`, `Educative/` (untouched since 2026-03-04), NSF proposal draft sprawl at folder root.

---

## 4. Platform content-QC posture (all scans regenerated 2026-07-01)

Green: box-state reset audit (268 boxes, 0 findings); arcade functional health (95/95 ok — `contentQuality` still "pending" on all, content pass not yet run).

Debt, ranked:

1. **QC-57** — 86 of 94 quizzes still client-graded (exams 13/13 done). Grading-integrity issue; conversion recipe exists in the QC-57 marathon doc.
2. **HUB-001 / QC-60** — ~500 modules across 19 hubs out of sync with ContentCatalog, incl. QC-59 (Python for IT: 33/39 hub modules missing from catalog).
3. **~90 high-severity EduScan quiz defects** — QUIZ-002b ×74, QUIZ-011 ×16 — the only meaningful high-severity cluster in the 13,035-issue scan (75%+ of the total is low-priority learning-path linkage and em-dash style rules).
4. **CAT-007 ×915** — duplicate catalog IDs pointing at the same file.
5. **PROG-003 / ES-1096** — 5 files share one progress key (`ModuleProgress.complete('web', …)`), causing progress collisions.
6. `_tools/sprint-master/sprints.json` last updated 2026-06-27 — 4 days behind the scans.

---

## 5. Remediation plan

### Phase 1 — Domains (operator console + one repo edit)

| # | Action | Where | Status |
|---|---|---|---|
| 1.1 | Cache-header fix: `regex ^/(.*/)?$` → no-store | `firebase.json` (this repo) | **DEPLOYED 2026-07-02, live-verified (`/`, `/arena/`, `/join/` now no-store)** |
| 1.2 | Add `www.hexworth.com` as custom domain, type "redirect to hexworth.com" | Firebase console → Hosting → Add custom domain; add the verification TXT + any records the wizard specifies at IONOS | Operator (console) |
| 1.3 | `hexworth.tech` apex: **Option A (recommended)** Cloudflare Redirect Rule, 301 `hexworth.tech/*` → `https://hexworth.com/$1`; keep `.tech` as the infrastructure zone. **Option B (true mirror)** add `hexworth.tech` in Firebase Hosting (DNS-only/grey-cloud record), plus add origin to `ALLOWED_STREAM_ORIGINS` (`functions/hex-ai-bridge.js:320`) and de-hardcode `hexworth.com` URLs | Cloudflare dashboard (API token on file is expired) | Operator decision |
| 1.4 | Confirm `hexworth.org` ownership at registrar; acquire or drop from the mental model | Registrar records | Operator |
| 1.5 | Add fixed hostnames to runtime-monitor probes | `_tools/runtime-monitor/` | After 1.2/1.3 |

### Phase 2 — Functions hardening
Done 2026-07-02: deploy-bundle trim via `firebase.json` `functions.ignore` (the Firebase CLI honors `functions.ignore`, NOT `.gcloudignore` — bundle went 162 files / 2.7 MB → 56 files / 902 KB, answer-key JSONs and `_exam-keys/` excluded, all 11 runtime requires + `.env` verified surviving via firebase-tools' own minimatch semantics; `verify-quiz-keys.js` is intentionally swept by `verify-*.js` — it is a local-only tool per Critical Rule 9's workflow, never required at runtime); `getHedExport` timing-safe compare (`functions/index.js:1045`, length pre-check required because `timingSafeEqual` throws on mismatched lengths — edge cases tested 403-not-500). Also done 2026-07-02 (commits dbec80aee/c3b175e07/pending, functions deploy pending): gradeQuiz partial-grading mode (attempt-log flooding + reveal scoping, explicit opt-in); ADMIN_EMAILS centralized into `functions/admin-emails.js` (jorden@ added to manage-announcements.js allowlist — reviewed decision; script is not currently deployed); `HED_EXPORT_KEY` staged in functions/.env — NOTE getHedExport is UNAUTHENTICATED in production until that deploy ships; set `NEXUS_HED_KEY` (same value) on this machine + bc1 cron the same day or the HED spoke silently skips. Remaining: App Check revisit; `FLAG_SECRET` demoted to low priority (see finding 1).

### Phase 3 — Content-integrity marathons (recipes exist)
Resume QC-57 (86 quizzes); reconcile HUB-001 drift; fix the 90 high-sev QUIZ defects; fix PROG-003 shared progress keys.

### Phase 4 — Hygiene
Relocate credential-shaped files out of `~/hexworth-shared/` (archive, never delete); dedupe/relocate ~25 GB bloat to bc1 cold storage; refresh `sprints.json`.

---

## Appendix — verification commands used

```
dig +short <domain> A / NS
curl -sI https://hexworth.com/ | grep -i cache-control          # max-age=3600 (pre-fix)
curl -sI https://hexworth.com/index.html | grep -i cache-control # no-store
echo | openssl s_client -connect www.hexworth.com:443 -servername www.hexworth.com  # CN=firebaseapp.com
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "x-goog-user-project: hexworth-prime" \
  https://firebasehosting.googleapis.com/v1beta1/sites/hexworth-prime/domains
  # → hexworth.com | DOMAIN_ACTIVE | CERT_ACTIVE | DNS_MATCH  (sole entry)
curl -s https://api.cloudflare.com/client/v4/user/tokens/verify  # token on file → status: expired
```

*Related: `_docs/operations/bc1-cloudflare-access-admin-plan.md` (bc1 admin over the same Cloudflare zone).*
