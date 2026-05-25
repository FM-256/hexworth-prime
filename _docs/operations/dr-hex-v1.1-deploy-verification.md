# Dr. Hex v1.1 — Deploy Verification (2026-05-25)

> End-to-end browser verification of the v1.1 production deploy.
> Reference: deploy commits `b91b07f0`, `9b83b4ae`, `0ca0e8c1`.

## What was deployed in this batch

1. **hexAiEngagementEvent Cloud Function** — receives student engagement
   beacons (intervention_sent, tab_closed, walkthrough_opened,
   downvote_response, external_ai_signal). Writes to
   `dr_hex_engagement_events` Firestore collection.
2. **HexAIChatPanel.js (hosting)** — emits the engagement beacons + adds
   a downvote button to every Dr. Hex response.
3. **voice_linter wired into orchestrator** — runs on every `/chat`
   response post-scrub, in observe-only mode. Findings emit to
   `dr_hex_security_events`.
4. **3 pilot Lab Skill Maps deployed** to `/opt/hexclass/lab-skill-maps/`:
   ala-l01-dead-cell-recovery, key-aes, pis-final.
5. **dr-hex-ten-laws.md** — condensed reviewer reference.

## Browser smoke results

Target: https://hexworth-prime.web.app/houses/matrix/adv-linux/index.html

Headless Chromium (1280×800, Tourist Visa activated):

| Check | Result |
|---|---|
| `<hex-ai-button>` element in DOM | PASS |
| Unsigned-in click does not crash | PASS |
| Unsigned-in click correctly refuses to open panel (auth gate works) | PASS |
| Auth-bypassed click registered | PASS |
| `<hex-ai-chat-panel>` mounts after click | PASS |
| Chat panel has Shadow DOM populated | PASS |
| Chat panel has header with title | PASS |
| Chat panel header includes "Dr. Hex" | PASS |
| Chat panel has close button | PASS |
| Chat panel has messages area | PASS |
| Chat panel has textarea | PASS |
| Chat panel has send button | PASS |
| Panel CSS includes .downvote-btn (v1.1 scaffold) | PASS |
| Panel CSS includes .downvote-row (v1.1 scaffold) | PASS |
| Close button clickable | PASS |
| Chat panel removed after close | PASS |
| No HexAI-related console errors | PASS |

**17/17 PASS.**

Smoke script: `_tools/eduscan/smoke/test-hex-ai-chat-panel.js`

## Visual verification

Three screenshots captured against the live production page.

### Closed state — Dr. Hex button on lab page

The cyan (calm-state) Dr. Hex button sits bottom-right of the Advanced
Linux Administration course landing. The button absorbs onto the page
background; no rectangular frame.

[SCREENSHOT:hex-ai-v1.1-closed.png:Closed state — Dr. Hex button bottom-right of the Matrix house lab page]

### Open state — chat panel after click

After click (auth bypassed for smoke), the chat panel slides in from the
right. 440px wide. Textarea reads "Ask Dr. Hex about this lab…". Send
button visible. Empty messages area waiting for the first turn.

[SCREENSHOT:hex-ai-v1.1-open.png:Open state — chat panel slid in from the right]

### Conversation state — Help Level + downvote UI

Simulated conversation showing the v1.1 additions: Dr. Hex's response
includes the `Dr. Hex · Level 3 · 4s` metadata footer (Help Level
announcement per Constitution §7) and an `unhelpful?` downvote link
(TELEMETRY-001 explicit-dissatisfaction signal).

[SCREENSHOT:hex-ai-v1.1-conversation.png:Conversation state — Level 3 metadata footer + unhelpful? downvote link]

## Server-side verification

Orchestrator end-to-end imports + linting smoke on hexclass:

```
HEX_SKILL_MAPS_DIR=/opt/hexclass/lab-skill-maps
voice_linter import OK
skill maps loaded: ['ala-l01-dead-cell-recovery', 'key-aes', 'pis-final']

# Synthetic input: "Great question! Just run openssl enc -aes-256-cbc and you are done."
# Mission: key-aes
violations: [('no_forbidden_disclosure', 'BLOCK'), ('forbidden_phrase_hit', 'WARN')]
blocked: True
```

The linter correctly detected:
- `no_forbidden_disclosure` BLOCK — `openssl enc -aes-256-cbc` is the
  exact-graded-command forbidden disclosure listed in key-aes Skill Map
- `forbidden_phrase_hit` WARN — "Great question!" personal-praise marker

In production, "blocked: True" emits a `voice_linter_*` event to
`dr_hex_security_events` but does NOT regenerate the response yet
(observe-only mode for v1).

## What can't be verified from headless

These require a real signed-in student session and will be confirmed by
production telemetry within the first 50 sessions:

- `intervention_sent` beacon firing on actual Dr. Hex response
- `downvote_response` beacon firing when the button is clicked
- voice_linter findings flowing into `dr_hex_security_events` on real
  `/chat` calls

## Visual nits noted (defer to v1.2 polish pass)

- Chat panel "Dr. Hex" header is dark-on-dark in the current theme — easy
  to miss against the surrounding `#15151c` background. Functional (the
  close × is still clickable) but worth a contrast bump.

## Related

- Commits: `b91b07f0` (docs), `9b83b4ae` (code), `0ca0e8c1` (orchestrator wire-in)
- Constitution: `_docs/operations/dr-hex-constitution.md`
- Voice Guide: `_docs/operations/dr-hex-voice-guide.md`
- 10 Laws: `_docs/operations/dr-hex-ten-laws.md`
- Production Stability spec: `_docs/operations/dr-hex-production-stability.md`
- Lab Skill Map spec: `_docs/operations/dr-hex-lab-skill-map.md`
