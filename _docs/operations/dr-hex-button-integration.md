# Dr. Hex Floating Button — Integration & Operations Guide

> The always-visible "ask Dr. Hex" floating button with the mood-ring
> state machine. v1 shipped 2026-05-25.

## What it is

A floating button (bottom-right of any lab page) that:
- Lets students chat with Dr. Hex at any time
- Changes color + pulse intensity based on the student's recent lab activity
- Click → opens a chat panel (`HexAIChatPanel`) overlay

The state is computed server-side by the `hexAiAmbientState` callable
Cloud Function, based on the student's flag attempts vs captures in the
current mission. State is recomputed event-driven (on page load + after
each lab-attempt-submitted event), NOT polled.

## State machine

| State | Color | Pulse | Trigger |
|---|---|---|---|
| `calm` | soft cyan (`#67e8f9`) | none | no recent attempts, OR most recent was correct |
| `noticing` | warm yellow (`#fbbf24`) | 4s | 2+ incorrect in last 5 min |
| `active` | bright orange (`#fb923c`) | 2s | 4+ incorrect in last 10 min, no captures |
| `insistent` | red (`#ef4444`) | 700ms | 6+ incorrect in last 20 min, no captures |
| `celebrating` | purple shimmer (`#a78bfa`) | 1.5s shimmer | flag captured in last 60 sec |

State only changes on lab attempts. A student walking away does not
escalate the button — only their actions do.

## How to integrate a lab page

Add to the page just before `</body>`:

```html
<hex-ai-button
    mission-id="<your-mission-id>"
    house="<house-slug>">
</hex-ai-button>
<script type="module" src="/_lib/HexAIButton.js"></script>
```

Then, anywhere the page submits a lab attempt (validateFlag,
gate-check, BoxEngine action), dispatch the custom event:

```javascript
window.dispatchEvent(new CustomEvent('hexworth:lab-attempt-submitted'));
```

This triggers a state refetch after Firestore commit propagates. No
polling needed.

### Where mission_id comes from

| Page type | mission_id value |
|---|---|
| Dispatch box | The `ticketId` field on the box (e.g., `NT-001`) |
| House lab | The lab's canonical ID (e.g., `eth-l11`, `lab-py-01`) |
| Quiz | The quiz's canonical ID (e.g., `aws-ccp-ch01-quiz`) |
| Walkthrough | Use the lab/box it references, not the walkthrough itself |

If the page can't determine a sensible mission_id, omit the attribute
— the button still works as a generic chat entry point in calm state.

## Components and where they live

| Component | Path | Purpose |
|---|---|---|
| Floating button widget | `_app/_lib/HexAIButton.js` | Shadow-DOM custom element, mood-ring animation, event-driven state fetch |
| Chat panel | `_app/_lib/HexAIChatPanel.js` | Lazy-loaded chat overlay, persists conversation per session |
| CF state computer | `functions/hex-ai-bridge.js` (`hexAiAmbientState`) | Server-side state classification from `flag_attempts` + `flag_captures` |
| Demo page | `_app/admin/dr-hex-button-demo.html` | Admin testing surface — drive states manually |
| Presence validator | `_tools/eduscan/hex-ai-button-presence-audit.js` | Lists lab pages without the button include |

## Validator

Run on demand to find lab pages missing the integration:

```bash
node _tools/eduscan/hex-ai-button-presence-audit.js
```

Outputs markdown report; exits 1 if any lab pages are missing the
button include. Exit 0 if every eligible lab page has the button.

## Forensics

Every state transition writes to `dr_hex_security_events` with
`event_type: "ambient_state_changed"`. The event includes:
- previous state → new state
- mission_id (cleartext for instructor lookup)
- attempt counts in the trigger windows (incorrect_5min, incorrect_10min, incorrect_20min)
- uid_hash (hashed for privacy, like all other security events)

Instructors can query for student patterns:

```javascript
db.collection('dr_hex_security_events')
  .where('event_type', '==', 'ambient_state_changed')
  .where('uid_hash', '==', <student-uid-hash>)
  .orderBy('ts', 'desc')
```

## Accessibility

- `aria-label` updates per state — screen readers announce state changes
- `prefers-reduced-motion` respected — pulse animations disabled, only color changes
- Color contrast ratios verified ≥ 4.5:1 against the site's dark background
- Button is keyboard-focusable + focus-visible ring rendered
- Click anywhere on the button opens the chat (no precision targeting required)

## Operational notes

### Firestore read cost

Each `hexAiAmbientState` call reads:
- ≤50 docs from `flag_attempts` (filtered by `boxId`, last 20 min)
- ≤20 docs from `flag_captures` (filtered by `boxId`, last 20 min)
- ≤50 docs from `flag_captures` (mission-wide, for capturedFlagIds set)

Worst case: 120 reads per call. With event-driven refetch + tab-visibility
guard (30s minimum gap), a student submitting 20 attempts in an hour
generates ~21 calls × 120 reads = 2,520 reads/hour per active student.

### Rate limiting

The CF is callable (Firebase Auth required). Today there's no explicit
per-uid rate limit ON THIS endpoint — the orchestrator's existing rate
limit applies to `/chat` but not this CF. **Harden TODO:** add a Redis-
backed rate limit on `hexAiAmbientState` (60 calls/minute per uid)
before broad rollout.

### Behavior under orchestrator outage

The CF reads Firestore directly — it does NOT depend on the orchestrator.
If hexclass is down, the button still works (returns state based on
historical attempts). If Firestore is down, the button stays in its
last-known state and silently logs a warning to the browser console.

### Conversation memory across button clicks

The chat panel persists `conversation_id` in `sessionStorage` keyed by
mission_id. Closing and reopening the panel on the same lab continues
the conversation. Navigating to a different lab starts a new conversation.

## Known v1 limitations (track for v2)

- Tests for the state machine are not yet unit-tested. The state
  classifier is inline in the CF — extract to a pure function for
  testability.
- `gate_attempts` + `activation_attempts` not included (no mission_id
  field on those documents — schema change required).
- Per-command granularity for sandbox labs (real shell commands in
  bc1/bc2/bc3 Docker containers) is out of scope. Only flag submissions
  drive state for those labs.
- No "do not disturb" mode — student can't quiet the button.
- No instructor view of state-history aggregate (events are logged but
  no dashboard query view yet).
- Rate limit on `hexAiAmbientState` not yet implemented (see Operational
  notes above).

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — the chat path the button hands off to
- `_docs/operations/dr-hex-governance.md` — change-management rules for AI element
- `_docs/architecture/ai-ghost-layer-build-plan.md` — this button is effectively the v1 Ghost Layer
- `_app/admin/dr-hex-button-demo.html` — admin testing surface
