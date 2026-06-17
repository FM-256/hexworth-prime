# Scoping — Off-Repo Video Asset Hosting (Firebase Storage vs AWS S3+CloudFront)

*Status: SCOPED, provider decision open. Date: 2026-06-16.*

## TLDR

Three instructor explainer videos (~147MB) are now committed to git via `git add -f`
past the `*.mp4` ignore; GitHub warns at the 58MB VM/Docker file (soft limit 50MB, hard
100MB). We need to host video #4+ off-repo and reference it by URL in the deck
`<video src>` instead of committing binaries. Two viable backends: **Firebase Storage**
(operable today — gcloud is authed to `hexworth-prime`) and **AWS S3 + CloudFront**
(better media CDN, AWS credits cover egress, but needs CLI + IAM credential setup first).
Because the deck only references a URL, the backend is **swappable at near-zero cost** —
so the recommendation is: unblock now on Firebase Storage (dedicated public media
bucket), and evaluate AWS S3+CloudFront as the strategic media (and compute) home given
the credits. Leave the three existing in-repo videos as-is; route new ones off-repo.

## Problem

The trigger was three instructor videos (~147MB) — but the real footprint is larger
(verified 2026-06-16) and the problem is platform-wide:

- **321MB of video tracked in git across 35 files** (not 147MB). Includes the 3 instructor
  videos, `video-preview-hero.mp4` (36MB), and ~130MB of mascot hero animations.
- **486MB of video on disk under `_app/`**, including `hex_closing.mp4` (159MB) which is
  gitignored but **still deploys to Firebase Hosting** (it is not in the `firebase.json`
  `ignore` list).
- **No video is in `firebase.json` `ignore`**, so every `./deploy.sh` re-transmits and
  re-serves all of it from Firebase Hosting (storage + egress at Hosting rates).
- GitHub warns on the 58MB file (soft limit 50MB, hard 100MB). Git history grows
  permanently; clone/CI degrade. No Git LFS.
- Need: serve video from object storage / CDN, reference by URL, stop committing binaries
  AND stop deploying them through Firebase Hosting.

**Scope decision (open):** instructor-explainer videos only, or a platform-wide video
policy covering mascot animations + UI loops too? The footprint above argues for
platform-wide, but it can be phased (instructor first, mascots later).

## Grounded facts (verified 2026-06-16)

| Fact | Implication |
|---|---|
| Firebase Storage configured: `hexworth-prime.firebasestorage.app` | Default bucket exists. |
| `storage.rules` gates reads behind auth (e.g. `task-screenshots` requires `request.auth != null`); bucket holds app data | Do NOT make the default bucket public. Use a dedicated public media bucket. |
| `gcloud` authed, active project `hexworth-prime`; `gsutil` available | Firebase Storage path is operable now, no new credentials. |
| `aws` CLI NOT installed, no creds configured | AWS path needs CLI install + IAM credentials (operator-provisioned) before first use. |
| Operator has AWS credits | AWS egress (the main recurring video cost) is effectively covered for the credit period. |

## Key architectural property

The deck references a video by absolute URL in `<video src>` / `<source>`. The storage
backend is therefore **swappable**: moving from a Firebase URL to a CloudFront URL later
is a find-replace of the base URL plus a re-upload. Low switching cost de-risks choosing
one now.

## Option A — Firebase Storage (dedicated public media bucket)

- Create a separate public-read bucket (e.g. `gs://hexworth-media`) so the auth-gated
  default app bucket is never exposed.
- Public URL: `https://storage.googleapis.com/hexworth-media/videos/<file>.mp4`.
- Upload (gcloud already authed): `gcloud storage cp <file>.mp4 gs://hexworth-media/videos/ --content-type=video/mp4 --cache-control="public,max-age=31536000,immutable"`.
- Range requests (seeking): supported by GCS. CORS: set on the bucket for future
  `<track>` captions (crossorigin). True edge CDN requires adding Cloud CDN (extra
  setup); raw GCS egress is fine for low-traffic instructor decks.
- Cost: storage ~$0.02/GB/mo; egress ~$0.12/GB on the GCP project (no credits).
- Pros: operable today, same ecosystem, zero new credentials. Cons: GCS alone is not a
  CDN; egress billed to the project.

## Option B — AWS S3 + CloudFront

- Private S3 bucket (origin) + CloudFront distribution (public CDN, HTTPS, edge cache,
  range requests). Optional custom domain `media.hexworth.com` via CloudFront + ACM cert.
- Public URL: `https://<dist>.cloudfront.net/videos/<file>.mp4` (or `media.hexworth.com/...`).
- Upload: `aws s3 cp <file>.mp4 s3://hexworth-media/videos/ --content-type video/mp4 --cache-control "public,max-age=31536000,immutable"`.
- Range/streaming: CloudFront is purpose-built for media delivery. CORS configurable on
  S3/CloudFront for future captions.
- Cost: AWS credits cover S3 + CloudFront egress for the credit period.
- Pros: credits neutralize the main recurring cost; real CDN (best playback); isolates
  heavy media off the Firebase project and git; custom-domain option. Cons: new provider
  + dependency; needs `aws` CLI install and operator-provisioned IAM credentials; one-time
  CloudFront + cert setup.

## Comparison

| | Firebase Storage (A) | AWS S3 + CloudFront (B) |
|---|---|---|
| Operable today | Yes (gcloud authed) | No (needs CLI + IAM creds) |
| CDN / video delivery | GCS only (add Cloud CDN for edge) | CloudFront, purpose-built |
| Recurring cost | Egress billed to GCP project | Covered by AWS credits |
| New dependency | None (same ecosystem) | New provider |
| Setup friction | Create one public bucket | CLI + creds + distribution + (cert) |
| Deck change | Identical (URL in `<video src>`) | Identical |

## Position / recommendation

1. **Unblock now on Firebase Storage** (Option A, dedicated public `hexworth-media`
   bucket) — operable today with the authed gcloud, no credential provisioning, stops
   the git-bloat bleed before video #4.
2. **Evaluate AWS S3+CloudFront (Option B) as the strategic media + compute home**, given
   the AWS credits and CloudFront's media strengths. The swappable-URL property means
   migrating later is cheap (swap base URL + re-upload). The AWS credits are also relevant
   to the [[project_video_gen_pipeline]] pipeline (TTS / rendering / compute), so a
   holistic "what runs on AWS" review is worth doing rather than a video-only decision.
3. **Leave the three existing in-repo videos as-is** — purging them from git history
   (BFG / git-filter-repo) is heavy and coordination-prone; not worth it for 147MB. Route
   only NEW videos off-repo. Optionally revisit history purge if total grows materially.

Deck-side change either way: `<video src>` / `<source>` point to the absolute storage URL;
posters (tiny, ~80-120KB) can stay in the repo or move too; the embed + Nancy/Chris gate +
`./deploy.sh` flow is otherwise unchanged (the video binary is simply no longer committed).

## Open decisions

1. Provider: Firebase Storage now (zero new creds) vs go straight to AWS S3+CloudFront
   (needs creds, uses credits)?
2. Migrate the three existing videos off-repo, or leave them?
3. Custom media domain (`media.hexworth.com`) or provider-default URL?
4. Public-read vs signed URLs (public is fine for instructor course content).

## Nancy review (APPROVE-WITH-CHANGES) and revised plan

Adversarial review refined the scope. Verdict: direction sound; six changes before
building.

**Decision now hinges on two questions:**
1. **Urgency of video #4.** If needed this week -> Firebase Storage as a documented
   stopgap (operable today). If weeks out -> set up AWS S3+CloudFront first and skip the
   double migration (it also aligns with the [[project_video_gen_pipeline]] compute home,
   given the AWS credits). Sharpened lean: given credits + the 486MB platform-wide
   footprint + video-gen compute, **going straight to AWS is likely the better one-time
   move unless video #4 is imminent.**
2. **Instructor-only vs platform-wide** video policy (see Problem). Phased is fine:
   instructor first, mascots/UI later.

**Switching cost is NOT zero (correcting the earlier claim).** A backend migration in this
codebase touches, per video: the `<video src>`/`<source>` URL, the `poster` URL, the
`<a href>` download-fallback URL, the `firebase.json` CSP `media-src` origin, plus
re-upload. Real work, not a find-replace. There is no upload manifest or filename->URL
registry yet — build one.

**Existing videos are NOT neutral (correcting "leave as-is").** They deploy through
Firebase Hosting every run. Companion action required: either move them to the new
backend at stand-up time, or add them (and `hex_closing.mp4`) to the `firebase.json`
`ignore` list so they stop deploying. "Leave them" with no deploy-scope action is wrong.

**Day-1 implementation checklist (whichever backend):**
- Dedicated public media bucket — never the auth-gated default app bucket.
- **Bucket listing DISABLED** (public-read objects, not public-list).
- **Referer / hotlink restriction** to hexworth.com (egress-theft protection; matters most
  on GCS where egress is not credit-covered).
- **Write access via a scoped service account** (write-only to the media bucket) so a
  misremembered command can't push sensitive files to a public bucket.
- **CORS set at bucket creation** (`Access-Control-Allow-Origin: https://hexworth.com`) —
  required for future `<track>` captions; retrofitting after cached responses is painful.
- **`media-src` added to the CSP** in `firebase.json` when the first off-repo video goes
  live (`'self' https://storage.googleapis.com` or the CloudFront origin) — replaces the
  current broad `https:` allowance. Re-tighten on migration.
- Per-object: `Content-Type: video/mp4`, `Cache-Control: public,max-age=31536000,immutable`,
  range requests verified (seeking).
- Update embed template: video src + poster src + download-fallback href all point to the
  backend URL.
- Build a tiny upload helper + filename->URL manifest so migrations are scripted, not manual.


- Existing committed videos: `_app/assets/videos/` (DNS, VM/Docker, DORA).
