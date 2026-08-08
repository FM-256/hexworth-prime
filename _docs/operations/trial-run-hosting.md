# Trial Run — where it gets deployed

**Status: ANALYSIS RECORDED, NOT DECIDED. Revisit after M4.**

Trial Run is the Career Launchpad service being built at
`~/hexworth-shared/carreer_launchpad/trial-run/` (spec: `../TRIAL_RUN_BUILD_SPEC.md`).
This doc lives in hexworth-prime because the hosting decision lands *here*: it changes
`firebase.json`, `_app/career/`, and the deploy chain.

## A spec assumption that is now wrong

Spec §13.4 says:

> The application does not fit `CLAUDE.md` rule 3 (no build step; raw HTML/CSS/JS on
> Firebase Hosting). A React SPA over FastAPI and Postgres is a different stack from the
> entire platform.

**No React SPA was built.** `web/index.html` is a single 25KB self-contained file: zero
external references, no `package.json`, no `node_modules`, no bundler. Verified.

That splits the problem more cleanly than the spec anticipated:

| | fits rule 3? | where |
|---|---|---|
| Frontend (`web/index.html`) | **yes** | `_app/career/trial-run/`, normal `./deploy.sh` |
| API (FastAPI + weasyprint + pdfplumber) | no | needs a Python host |

This is not "a foreign stack inside the platform". It is a static page plus one Python
service.

## Recommended placement: Cloud Run behind a Hosting rewrite

`firebase.json` already rewrites `/api/hex-ai/stream` to a Cloud Function. Extend the same
pattern:

```json
{ "source": "/api/trial-run/**", "run": { "serviceId": "trial-run-api", "region": "us-central1" } }
```

Reasons, in order of weight:

**1. Same origin — this is the load-bearing one.** `api/access.py` builds its trust boundary
on loopback + `Sec-Fetch-Site` (imported from Lodestar). Under a Hosting rewrite the API is
same-origin with `hexworth.com`, so that check keeps meaning something, there is no CORS, and
no `SameSite` cookie problem. On a separate host the boundary has to be thrown away and
rebuilt as token auth — which is precisely what §13.2 calls *"a security-model change rather
than a deploy"*. The rewrite avoids paying that cost at all.

**2. Container, not runtime.** weasyprint needs cairo/pango/gdk-pixbuf system libraries.
Painful on Cloud Functions, trivial in a Dockerfile. A container image is **not** what rule 3
prohibits — rule 3 is about frontend bundlers.

**3. Same project, IAM, billing, Secret Manager.** No new account surface. Scales to zero,
which suits a product with three users.

### Why not bc1/bc2/bc3

The Cloudflare Tunnel and CF Access are already there, so it looks like the cheap option. It
is not:

- Taskboard **#275**: pool slot reclamation is dead on bc1, slots bind to a uid permanently,
  and in the script's own words *"real students would get 503"*. Putting paying customers'
  resumes on the box whose known failure mode is capacity exhaustion is the wrong trade.
- bc1 already runs 14 scrapers plus the tunnel.
- Different security domain from `hexworth.com`, which forfeits reason 1 above.

## The actual recommendation: do not deploy before M4

§13.2 asks the right question — *is Phase 0 a throwaway thesis rig, or the foundation of the
paid product?* **M4 answers it, and M4 has not run.**

Deploying now means buying auth, tenancy, entitlement and PII-at-rest handling for a thesis
that is unproven. If M4 fails, §5.1 says the finding redirects effort into step-level
telemetry inside Hexworth Prime, and all of that work is wasted.

**M4 does not need hosting.** It needs three students to sit through three sessions and react
to a report. One machine, operator in the room — which is the better research setup anyway,
because you hear the reaction instead of reading a form.

## What makes this a real decision rather than a chore

`llm_call` stores full request and response JSON: **entire resumes at rest**, plus interview
transcripts. That is what turns "where do we host it" into a genuine question.

Two things already work in our favour, and both were built before hosting rather than after:

- §9.3's hard delete cascades to `llm_call` (that is what the `candidate_id` column is for;
  the M1 gate proves it — 0 rows survive).
- **BYOK**: the server never holds an Anthropic key. A breach of this service leaks user
  content but no credentials.

## Sequence

1. **Now** — run M4 locally. Three students, three sessions, no deployment.
2. **If M4 passes** — frontend to `_app/career/trial-run/`, API to Cloud Run behind
   `/api/trial-run/**`, Postgres on Cloud SQL, key in Secret Manager, card becomes a link.
3. **If M4 fails** — none of the above happens, which is the cheapest outcome available.

## Not verified

- Whether Cloud Run is enabled on the `hexworth-prime` GCP project.
- Cold-start cost of a weasyprint-capable image.
- Cloud SQL pricing at this scale (SQLite is what everything has been tested on; §"what this
  gate does not prove" in every gate artifact says the same thing).

## Unrelated risk found while answering this — FIXED 2026-08-08

**`~/hexworth-shared/carreer_launchpad/` was not a git repository.** The entire product —
API, prompts, tests, and every M1/M2/M3 gate artifact — had no version control and no
history. Same failure mode `CLAUDE.md` records for `_tools/` (534 scripts not in git, so they
do not survive a fresh clone), except a whole product rather than a script collection.

Now its own repo (`248a68e`, branch `master`): 122 files, 808KB, from a 427MB tree. The
`.gitignore` was written before `init` rather than after, because a secret or a 160MB venv
committed once stays in the object store forever. Excluded: three `.venv` dirs, `__pycache__`,
and `*.db` — the last one because `llm_call` stores full request/response JSON, meaning whole
resumes and interview transcripts live in that file.

**Still open:** the repo has **no remote**. It now survives an `rm`, not a disk loss. Pick a
home for it before treating this as closed — and note that the same hosting question applies,
since a private repo for a product with paying customers is not the same decision as a
scratch repo.
