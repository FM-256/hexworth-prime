# Dr. Hex Button — Platform-Wide Rollout (2026-05-25)

> Bulk-injection of the floating Dr. Hex mood-ring button into every
> lab-style page across all 13 houses + dispatch. Coverage went from 1
> page (matrix/adv-linux pilot) to 2431 pages (100%).

## What students see now

A floating cyan circle (calm state) in the bottom-right corner of every:
- House landing page (matrix, shield, key, code, web, cloud, forge, eye,
  ai, divergent, dark-arts, dispatch, script)
- Lab page (`*.lab.html`)
- Box page (`*.box.html`)
- Quiz page (`*.quiz.html`)
- Applet (`*.applet.html`)
- Module / Tool / Exam page

Click → chat panel opens. Sign in → real-time Dr. Hex chat backed by
qwen2.5:7b GPU-accelerated on hexclass.

## Distribution

| House | Pages |
|---|---|
| script | 481 |
| code | 287 |
| shield | 284 |
| web | 240 |
| cloud | 234 |
| forge | 232 |
| eye | 220 |
| matrix | 188 |
| dispatch | 95 |
| divergent | 64 |
| ai | 41 |
| key | 33 |
| dark-arts | 31 |
| **TOTAL** | **2431** |

## Injection method

Single-pass bulk injector at `_tools/eduscan/inject-hex-ai-button.js`.
Idempotent (skips files that already have the button). Insertion happens
just before the LAST `</body></html>` in each file. Mission-id derived
by stripping the file's content-type suffix (`.lab.html` → `key-aes`,
etc.). House derived from the file's path under `_app/houses/<house>/`.

Run:

```
node _tools/eduscan/inject-hex-ai-button.js              # dry run
node _tools/eduscan/inject-hex-ai-button.js --apply      # write
node _tools/eduscan/inject-hex-ai-button.js --apply --house key   # scoped
```

## Validation

The HEX-AI-001 audit at `_tools/eduscan/hex-ai-button-presence-audit.js`
walks every lab-style page and reports coverage:

```
$ node _tools/eduscan/hex-ai-button-presence-audit.js
Lab-style pages found: 2431
Pages WITH button: 2431 (100%)
Pages MISSING button: 0
```

## Issues found and handled

### 1. Injector regex bug (corrupted ~12 pages — fixed cleanly before commit)

First-wave injection used a non-greedy `</body></html>` regex that
matched the **first** occurrence. In ~12 specialized lab pages, the
first match was inside a JS template literal that contained mock HTML
for a simulated filesystem — for example, `script-linux-links.lab.html`
has:

```javascript
content:'<!DOCTYPE html><html><body><h1>Hexworth</h1></body></html>'
```

The injector inserted the button INSIDE the JS string, breaking the
inline script's parser (HEUR-012 "Unexpected end of input"). Caught by
the post-deploy EduScan + the authenticated chat smoke failing on
`key-aes.lab.html`.

Stashed the corrupted state per the "we do not destroy" rule (preserved
at `stash@{0}` for forensics). Rewrote the injector to find the **last**
`</body></html>` AND require it to sit within the last 5% of the file
(EOF anchor). Re-applied — clean.

### 2. Pre-existing validator strip-order bug (allowlisted, tracked separately)

The HTML validator's `stripComments` runs before `stripScriptBlocks`.
The shield-web-security-headers-lab.applet.html has an inline JS string
starting with `<!--')){`. `stripComments` treats that as a real HTML
comment, swallows content forward until the next `-->`, eating a real
`</script>` along the way and creating a false HTML-001 "unclosed
script tag" finding.

This is a **pre-existing latent bug** — my injection just made it
visible by appending one more `<script>` tag (the button include),
revealing the previously-hidden imbalance. Direct invocation of
`checkCriticalUnclosedTags` on the file returns 0 issues (7 opens / 7
closes balanced). The phantom is created by the strip-order interaction.

**Mitigation:** added the file to
`_tools/eduscan/quarantine-allowlist.json` with a documented reason.

**Fix tracked:** swap the strip order (stripScriptBlocks before
stripComments) so JS-string content can't poison the comment regex.

## Verification

### Browser content-leak smoke (full deploy gate)

```
$ ./deploy.sh
[5/5] Lab content-leak browser smoke
  ✓ ══ 10 PASS / 0 FAIL ══
```

10 random labs across houses load + render correctly with the button
present.

### Authenticated chat smoke — pilot page (matrix/adv-linux)

15/15 PASS. See `dr-hex-v1.1-deploy-verification.md`.

### Authenticated chat smoke — POST-ROLLOUT, non-pilot page

```
$ node _tools/eduscan/smoke/test-hex-ai-chat-authenticated.js \
    "https://hexworth-prime.web.app/houses/key/labs/key-aes.lab.html"

Dr. Hex authenticated end-to-end smoke — https://hexworth-prime.web.app/houses/key/labs/key-aes.lab.html
────────────────────────────────────────────────────────────
  PASS  create Firebase test user
  PASS  lab page loaded
  PASS  sign in with custom token
  PASS  signed-in UID matches test UID
  PASS  button click registered (with auth)
  PASS  chat panel mounted
  PASS  chat message sent
  PASS  AI response received within timeout
  PASS  AI response has content
  PASS  downvote button rendered alongside response
       response: "Let's look at your recent activity in the House of
        the Eye to see where you left off with the AES lab..."
  PASS  downvote button clicked
  PASS  downvote button visually activated
  PASS  no engagement beacons were dropped (CF reachable)
  PASS  no HexAI / engagement console errors
  PASS  test user cleanup (delete account)
────────────────────────────────────────────────────────────
  15 PASS / 0 FAIL
```

End-to-end against a different house + a real authored lab file (not
the engine-driven matrix pilot). Real-time Dr. Hex response, telemetry
beacons flowing.

## What this unlocks

- Students get Dr. Hex on every page they study from.
- Engagement telemetry (intervention_sent, tab_closed,
  walkthrough_opened, downvote_response, external_ai_signal) starts
  flowing into `dr_hex_engagement_events` from every lab.
- The Constitution's post-intervention-engagement metric (Codex's
  premortem failure mode detector) becomes a real production signal.
- voice_linter findings (observe-only mode) accumulate in
  `dr_hex_security_events` for the first time at scale.

## Related

- Constitution: `_docs/operations/dr-hex-constitution.md` ·
  [Confluence](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19562497)
- Voice Guide: `_docs/operations/dr-hex-voice-guide.md` ·
  [Confluence](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19365890)
- Deploy verification (v1.1): `_docs/operations/dr-hex-v1.1-deploy-verification.md` ·
  [Confluence](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19660802)
- GPU config: `_docs/operations/hexclass-ollama-vulkan-gpu.md`
- Button UX spec: `_docs/operations/dr-hex-button-integration.md` ·
  [Confluence](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/18579527)
- Open follow-up: Task #207 — fix html.js strip-order bug

## Commits

- `f6d7984a` — feat(dr-hex): roll out floating button to all 2431 lab pages
- `a45ca0de8` — test(dr-hex): auth smoke accepts target URL via CLI arg
