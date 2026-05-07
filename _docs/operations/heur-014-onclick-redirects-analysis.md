# HEUR-014 — hardcoded onclick redirects (operator decision required)

## TL;DR

EduScan flags 18 instances of `onclick="window.location.href='...'"` in 2 files. **All 18 are real findings** — they bypass `TenantShell`'s navigation override (which queries `'a[href]'`), causing tenant-encapsulated users to escape into Hexworth Prime's general dashboard.

The fix is mechanical (convert `<div role="link" onclick="...">` to `<a href="...">`) but `dashboard.html` is load-bearing. **Per CLAUDE.md memory: "One extra `</div>` broke the entire admin console" — apply with operator approval, not autonomously.**

## Verified state

```
HEUR-014 distribution:
  16x  _app/dashboard.html         (mini-house navigation cards)
   2x  _app/houses/web/index.html  (paths-section navigation)
```

All 18 follow the same pattern:

```html
<div class="<card-class>"
     href="<path>"                                            ← non-standard on <div>
     onclick="window.location.href='<path>'"                  ← bypasses TenantShell
     onkeydown="if(event.key==='Enter'){window.location.href='<path>'}"
     tabindex="0"
     role="link"
     style="cursor:pointer;">
  ...inner content...
</div>
```

## Why this is a real bug

`_app/components/TenantShell.js:302` queries `document.querySelectorAll('a[href]')` to override navigation links for tenant-encapsulated users. The 18 div-based "fake links" are invisible to that selector. Result:

- Tenant student clicks a `<div>` mini-house-card on dashboard.html
- Card's onclick handler fires `window.location.href = 'arctic/index.html'` (or similar)
- Browser navigates directly to Hexworth Prime content
- Tenant context (sessionStorage) preserved, but TenantShell's link override is bypassed → student sees Hexworth-Prime-styled UI not tenant-branded UI for one navigation hop

Memory `feedback_no_architectural_debt.md` says: don't accept the debt — find the fix. The fix is structural.

## Recommended fix

Convert each `<div role="link" ...>` to `<a href="...">`. Each instance:

**Before:**
```html
<div class="mini-house-card arctic-destination"
     href="arctic/index.html"
     onclick="window.location.href='arctic/index.html'"
     onkeydown="if(event.key==='Enter'){window.location.href='arctic/index.html'}"
     tabindex="0" role="link" style="cursor:pointer;">
  <div class="mini-house-icon"><img ...></div>
  <div class="mini-house-name">THE ARCTIC</div>
  <div class="mini-house-count">Linux Content Hub</div>
</div>
```

**After:**
```html
<a class="mini-house-card arctic-destination" href="arctic/index.html">
  <div class="mini-house-icon"><img ...></div>
  <div class="mini-house-name">THE ARCTIC</div>
  <div class="mini-house-count">Linux Content Hub</div>
</a>
```

Removed (anchor handles natively): `onclick`, `onkeydown`, `tabindex`, `role`, `style="cursor:pointer;"`.

## Required CSS additions

Anchor tags inherit browser defaults that the original `<div>` did not. Need to add to dashboard.html's stylesheet near line 1685:

```css
a.mini-house-card,
a.paths-section {
    text-decoration: none;
    color: inherit;
    display: block;  /* or grid-item-friendly */
}
```

Without these, anchor content gets blue underlines and inherits link color. The `cursor:pointer;` inline style can be dropped (anchors are clickable by default).

## Risk profile

`_app/dashboard.html` is mentioned twice in CLAUDE.md as a load-bearing file with prior breakages:
1. "One extra `</div>` broke the entire admin console layout"
2. "Verify HTML nesting (count opening and closing tags)"

The proposed change reduces tag count by 1 per card (closing `</div>` → `</a>`, opening tag changes shape). Need to:
1. Verify each card's inner content is balanced
2. Run dashboard render check after the diff
3. Confirm focus-visible styles still apply (CSS already handles `.mini-house-card:focus-visible`)
4. Verify keyboard nav (Tab + Enter) works on anchor (default behavior)

## Two options

### Option A — Apply diff to dashboard.html + houses/web/index.html

Single commit. ~18 div-to-a conversions + 4-line CSS addition. Touches load-bearing file.

- **Pros**: clears all 18 HEUR-014 findings; restores TenantShell encapsulation; semantically correct (anchors are for navigation)
- **Cons**: dashboard.html risk; needs render verification; cannot test in headless mode (visual confirmation needed)

### Option B — Move tenant-shell behavior to MutationObserver + click delegation

Instead of converting div to a, make TenantShell capture clicks at the document level and intercept ALL navigation (including `window.location.href` assignments via div onclicks).

- **Pros**: zero edits to dashboard.html; future onclick-in-div code keeps working
- **Cons**: complex to implement correctly; does not fix the underlying anti-pattern (divs as fake links is bad accessibility); the div elements still send wrong screen-reader semantics

## Recommendation framing

Option A is the structurally correct fix. Option B papers over the issue. But Option A requires careful execution on a high-risk file.

**Suggested execution path** (operator approves first):
1. Apply diff in a feature branch
2. Deploy to a Firebase preview channel
3. Smoke-test dashboard rendering + tenant navigation flow
4. Merge to master + production deploy

## What I will not do autonomously

- Edit `_app/dashboard.html`
- Edit `_app/houses/web/index.html`
- Add the CSS rules

`dashboard.html` is explicitly called out in `feedback_precision_over_speed.md` as load-bearing. Operator approval required before any edit.

## Cross-references

- Validator: `_tools/eduscan/validators/syntax/heuristics.js` (lines 1033-1079)
- TenantShell link interception: `_app/components/TenantShell.js:296-320`
- TenantRouter alternate API: `_app/components/TenantRouter.js`
- Memory: `feedback_precision_over_speed.md` (CLAUDE.md "Hexworth requires finesse")
- Memory: `feedback_no_architectural_debt.md` (Option B may violate this)
