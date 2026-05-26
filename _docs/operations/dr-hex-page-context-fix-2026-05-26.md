# Dr. Hex Page-Context Fix (2026-05-26)

> Live-traffic finding: Dr. Hex was location-blind on house landing
> pages, course landings, and admin pages — anywhere `mission_id` was
> null. Fixed by passing the page URL + title on every chat request and
> surfacing them in the model's system prompt context block.

## Symptom

User on `/houses/matrix/adv-linux/index.html` asked Dr. Hex a question.
The response sounded location-aware-of-house but not of the specific
page — Dr. Hex didn't know which course / lab / area within the house
the student was on. Behavior held on every page that had no graded
mission attached: house landings, course landings, admin pages.

## Diagnosis

Confirmed by querying `dr_hex_engagement_events`:

```
00:24:46  intervention_sent   house=matrix   mission=-
00:24:06  intervention_sent   house=matrix   mission=-
```

`mission=-` is empty because:
- House landing pages and course landing pages don't have a graded
  mission, so the button's `mission-id` attribute is intentionally
  omitted.
- The chat panel only sent `{house, mission_id, conversation_id}` —
  with `mission_id=null`, the orchestrator's system prompt only got
  `"Student is currently in: matrix house"`.
- No URL / page title was ever sent, so Dr. Hex had no way to
  distinguish "matrix house overview" from "Advanced Linux
  Administration course landing."

## Fix (three layers)

### 1. `HexAIChatPanel.js` — always send page location

```javascript
const result = await chatFn({
    message: msg,
    house: this._house || undefined,
    mission_id: this._missionId || undefined,
    conversation_id: this._convId,
    page_path: window.location.pathname,
    page_title: document.title,
});
```

### 2. `functions/hex-ai-bridge.js` — forward + sanitize

Both `hexAiChat` (callable) and `hexAiChatStream` (HTTP) accept the new
fields. Length-capped at 200 chars to defend against payload bloat /
prompt-budget burn.

### 3. `_tools/hexclass/orchestrator/main.py` — surface in system prompt

`ChatRequest` accepts `page_path` (regex-restricted path-shape) and
`page_title` (200-char cap). `build_context_packet` carries them through.
`compose_system_prompt` adds a STUDENT CONTEXT line whenever either is
present, even when `mission_id` is null:

```
- Page: "<title>" (<path>)
```

## Verification

Direct curl to the orchestrator post-restart:

```
POST /chat
{
  "message": "Where am I right now?",
  "user_uid": "smoke-page-context",
  "role": "student",
  "house": "matrix",
  "page_path": "/houses/matrix/adv-linux/index.html",
  "page_title": "Advanced Linux Administration — Matrix House"
}

Response:
"Based on your context, you are currently in the Matrix house working
 on advanced Linux administration tasks. Have you recently interacted
 with any specific services or processes related to file descriptors,
 namespaces, or capabilities? If so, where do you think the issue
 might be occurring?"
```

Dr. Hex correctly references both the house AND the page.

## Deployed

- **Orchestrator** — `main.py` SCP'd to hexclass, `hex-orchestrator.service`
  restarted clean at 2026-05-26 00:31:56 UTC.
- **Functions** — `hexAiChat` + `hexAiChatStream` deployed via
  smoke-gated wrapper.
- **Hosting** — deployed via `./deploy.sh --force` (Nexus phantom
  HTML-001 from task #207 unrelated).

## Privacy / security notes

- `page_path` matches restrictive regex `^/[A-Za-z0-9_\-./]*$` — no
  query strings, no fragments, no special chars. Prompt-injection via
  URL-shaped strings is blocked at the orchestrator validator.
- `page_title` capped at 200 chars. Real Hexworth titles are well under
  100. Anything longer is truncated by the CF bridge before reaching
  the orchestrator.
- These fields are NOT persisted server-side (orchestrator-only
  use). Student URLs are already in Firebase Hosting logs; this doesn't
  expand the visibility surface.

## Commit

- `19a087c4e` — fix(dr-hex): pass page_path + page_title so Dr. Hex always knows location

## Related

- Constitution: `dr-hex-constitution.md` — §6 state-specific behavior
  assumed mission context; this fix supplies a fallback when mission is
  absent.
- Rollout report (2026-05-25): `dr-hex-button-rollout-2026-05-25.md` ·
  [Confluence](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19431445).
- Deploy verification (v1.1): `dr-hex-v1.1-deploy-verification.md` ·
  [Confluence](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19660802).
