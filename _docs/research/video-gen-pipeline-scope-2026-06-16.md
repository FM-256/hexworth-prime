# Scoping — Automated Narrated-Explainer Video Pipeline (`video-gen`)

*Status: SCOPED, paused pending operator decisions. Nothing built. Date: 2026-06-16.*

## TLDR

The operator made a DNS explainer video in NotebookLM and we embedded it in the WSA
week-02 instructor deck. The operator asked whether we can automate generating such
videos the way we already call fal.ai. NotebookLM has no usable public API for *video*
generation, so the realistic path is to build our own pipeline (script -> TTS narration
-> visuals -> ffmpeg assembly -> MP4) reusing existing infra. Nancy reviewed the scope
and returned PAUSE: do not build until a cheap TTS voice sample is judged acceptable and
the volume question is answered. The build-vs-buy decision hinges on how many videos are
actually needed per course per term. Recommended first action: a zero-code fal-TTS (or
ElevenLabs/Google) voice spike on acronym-heavy text, played to the operator for a
go/no-go, before any pipeline code.

## Origin

Operator-created DNS video (`Journey_of_a_DNS_Query.mp4`, NotebookLM) embedded as a
dedicated M08 slide in `_app/houses/cloud/modules/wsa/instructor/week-02.html`
(committed `ed9f8d87e`, live). Operator then asked to automate creating such videos
"similar to the way you interact with fal."

## Verified external state (2026)

| Question | Finding |
|---|---|
| Does NotebookLM have an API? | Yes — an official **Enterprise** API (Google Cloud), covering notebooks, sources, and **audio** overviews. |
| Can it generate **video** overviews programmatically? | **No** (not exposed). Cinematic Video Overviews are UI-only, Google AI Ultra tier, English-only at launch. The old standalone Podcast API is deprecated/closed to new customers. |
| Can I drive it like fal? | No clean public video API. Only brittle browser automation against a logged-in Google session — not production-grade. |

Sources: [AutoContent API blog — NotebookLM API in 2026](https://autocontentapi.com/blog/does-notebooklm-have-an-api) · [BuildFastWithAI — Cinematic Video Overview guide 2026](https://www.buildfastwithai.com/blogs/notebooklm-cinematic-video-overview-full-guide-2026) · [DigitalOcean — What Is NotebookLM (2026)](https://www.digitalocean.com/resources/articles/what-is-notebooklm)

## Options (build vs buy)

| Path | What | Trade-offs |
|---|---|---|
| **Keep using NotebookLM (manual)** | Operator makes each video in the UI | Zero build, polished conversational output, zero maintenance. Manual, not on-brand, no API. Best at low volume. |
| **3rd-party "NotebookLM-style" REST API** (e.g. AutoContent API) | Call a REST API that returns finished audio/video overviews | Closest to NotebookLM *feel*, fast to wire. Per-asset cost, vendor dependency, less brand control. |
| **Build our own (`video-gen`)** *(this scope)* | Script -> TTS -> visuals -> ffmpeg -> MP4 | Most control, on-brand, captions, no per-asset cost, repeatable. Quality delta vs NotebookLM ("automated narrated slideshow"), new pipeline to maintain. |

**The decision driver (Nancy):** volume. Fewer than ~2 videos per course per term -> the
manual NotebookLM workflow is almost certainly cheaper in total effort. More than that,
or a hard need for on-brand + captioned + no-per-asset-cost -> building is justified.

## Proposed pipeline (`video-gen`) — reusing existing infra

1. **Script + storyboard** — Claude authors structured JSON: `segments[{ narration, visual_spec, duration_hint }]`. Source of truth.
2. **Narration (TTS API)** — per-segment audio; durations measured via `ffprobe`. The only NEW dependency: a TTS key (provisioned like the fal key). Check whether **fal.ai itself has a TTS model** first — if so, the existing fal key covers it ("literally like fal").
3. **Visuals** — primary candidate is the existing `_tools/wsa-rich-render` (HTML+CSS+SVG -> headless Chromium -> WebP); fal (Recraft/Veo3) or Graphviz optional. NOTE: rich-render outputs 1280x720 stills for slides; video likely wants 1080p frames -> this is a new render config, not pure reuse.
4. **Timeline sync** — each visual shown for its narration segment's measured duration.
5. **Assembly (`ffmpeg`, already installed)** — concatenate -> MP4 + poster + auto-generated **VTT captions** derived from the JSON script (closes the accessibility gap flagged on the DNS video; WCAG 1.2.2).
6. **Embed + gated deploy** — copy to `/assets/videos/`, add a deck slide, Nancy/Chris gates, `./deploy.sh` (the flow already used manually for the DNS video).

## Nancy's review — verdict: PAUSE (common ground)

**Do first (cheap, de-risking):**
- **TTS voice spike** — generate ~30s of TTS reading acronym-heavy technical text (DNS, WSUS, FSMO, LDAP), play it to the operator, get a go/no-go on voice quality **before any pipeline code**. This answers the single highest-risk question at zero cost. ElevenLabs tends to handle acronyms better out-of-the-box than Google TTS; test whichever (and check fal).
- **Design the JSON segment schema** (low cost, informs everything; can be a doc before code).

**Keep, non-negotiable:**
- **Hard QC gate, no auto-publish.** Narration is teaching content. But note the review-modality mismatch: auditing a 5-min narrated video for factual errors is ~3-5x slower than text and there is **no EduScan-for-audio** — the QC burden is real and must be owned.
- **VTT captions** from the script.
- **SSML / pronunciation lexicon** for technical acronyms, resolved before first real narration.

**Cut from v1 / defer:**
- The full segment-assembly pipeline (until voice quality is confirmed).
- Multiple visual sources (Graphviz/fal) — one source in v1 to reduce variables.
- Formal embed+deploy flow for v1 — get one clip to `/tmp/` and judge it first.

**Decide before starting:**
- **Volume** (how many videos / course / term) — the build-vs-buy driver.
- **Voice acceptance** — operator has actually heard TTS on a technical passage and accepts it.
- **Quality trade-off** — operator explicitly accepts "automated but more robotic than NotebookLM," not "we'll see."
- **Storage strategy** — repo `/assets/videos/` bloats fast (90s 1080p ~= 55MB; 10 videos ~= 0.5GB). Consider **Firebase Storage / CDN** instead of committing binaries. Decide before the first video lands.
- **Regeneration procedure** — a factual error in narration is not a 5-minute fix (regenerate audio segment, re-measure, re-assemble). Trace it end to end.

## Recommended next step

Run the **fal-TTS voice spike** (or ElevenLabs/Google if fal has no TTS model): ~30s of
acronym-heavy narration, played to the operator, go/no-go. No pipeline code until that
clears and the volume question is answered.

## Open questions for the operator (gating)

1. How many explainer videos per course, per term?
2. Run the voice spike now? (and: do we have/need a TTS key, or does fal cover it?)
3. Accept the quality delta vs NotebookLM?
4. Storage: repo vs Firebase Storage/CDN?

## Related

- DNS video embed (the trigger): `_app/houses/cloud/modules/wsa/instructor/week-02.html`, commit `ed9f8d87e`.
- Existing visual-gen infra: `_tools/wsa-rich-render/` (HTML->WebP), fal.ai pipelines (Recraft/Veo3).
- Memory: [[project_video_gen_pipeline]].
