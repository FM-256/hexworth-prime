# Lobby Phase A+B Verification Snippets

**Purpose:** copy-paste DevTools console snippets for the marathon branch verification scenarios. Run on the preview channel URL:

`https://hexworth-prime--marathon-yoj3gm8e.web.app/lobby.html`

Each snippet sets up the localStorage/sessionStorage state for a specific scenario, then either reloads `/lobby.html` or asserts a value. No manual DevTools clicks required.

---

## Setup helpers (run once)

```js
// Common helpers — paste at top of console session
function clearTenantState() {
    ['hexworth_tenant', 'hexworth_class'].forEach(k => sessionStorage.removeItem(k));
    ['hexworth_tenant', 'hexworth_tenant_slug', 'hexworth_class_id',
     'hexworth_course_id', 'hexworth_class_name', 'hexworth_enrollments']
        .forEach(k => localStorage.removeItem(k));
    console.log('[verify] All tenant storage cleared');
}

function showTenantState() {
    console.table({
        sessionStorage_tenant: sessionStorage.getItem('hexworth_tenant'),
        sessionStorage_class:  sessionStorage.getItem('hexworth_class'),
        localStorage_tenant:   localStorage.getItem('hexworth_tenant'),
        localStorage_slug:     localStorage.getItem('hexworth_tenant_slug'),
        localStorage_classId:  localStorage.getItem('hexworth_class_id'),
        localStorage_courseId: localStorage.getItem('hexworth_course_id'),
        localStorage_name:     localStorage.getItem('hexworth_class_name'),
        localStorage_array:    localStorage.getItem('hexworth_enrollments')
    });
}
```

---

## Scenario 1 — single enrollment, state-enrolled renders

**Expected:** state-enrolled card with "Continue to Course" + "Leave this class" buttons. Tenant context fully populated.

```js
clearTenantState();
localStorage.setItem('hexworth_enrollments', JSON.stringify([
    { tenantSlug: 'dr-norfleet', classId: 'pfi-spring-2026', courseId: 'pfi', className: 'Python for IT — Spring 2026' }
]));
location.reload();
// After reload, run showTenantState() — should show all 7 keys populated for dr-norfleet/pfi
```

---

## Scenario 2 — multi-enrollment picker WITH × buttons

**Expected:** 3-card picker. Each card has the new × leave button (muted gray, red on hover).

```js
clearTenantState();
localStorage.setItem('hexworth_enrollments', JSON.stringify([
    { tenantSlug: 'dr-norfleet', classId: 'pfi-spring-2026', courseId: 'pfi', className: 'Python for IT' },
    { tenantSlug: 'keiser-university', classId: 'cb-fall-2025', courseId: 'cb', className: 'Cloud Basics' },
    { tenantSlug: 'test-x', classId: 'web-summer-2026', courseId: 'web', className: 'Networking' }
]));
location.reload();
// Verify visually:
//   - 3 cards rendered with class names
//   - × button visible right-side of each card, muted gray
//   - Hover × → turns red with light red background
//   - Card body click → would navigate (don't click during verify)
//   - × click → confirm prompt with class name in quotes
```

---

## Scenario 3 — cross-tenant × leave from multi (security critical)

**Setup state-multi with 2 different-tenant enrollments. Click × on one. Verify storage doesn't retain stale tenant.**

```js
clearTenantState();
localStorage.setItem('hexworth_enrollments', JSON.stringify([
    { tenantSlug: 'dr-norfleet', classId: 'pfi-2026', courseId: 'pfi', className: 'PFI' },
    { tenantSlug: 'keiser-university', classId: 'cb-2025', courseId: 'cb', className: 'CB' }
]));
// Pre-set storage to dr-norfleet's tenant JSON to simulate prior session
localStorage.setItem('hexworth_tenant_slug', 'dr-norfleet');
localStorage.setItem('hexworth_tenant', JSON.stringify({ slug: 'dr-norfleet' }));
sessionStorage.setItem('hexworth_tenant', JSON.stringify({ slug: 'dr-norfleet' }));
location.reload();

// After page renders state-multi:
//   1. Click × on the dr-norfleet card (the PFI class)
//   2. Confirm "OK" on the prompt
// Then run:
showTenantState();
//
// EXPECTED after leave-with-1-remaining (keiser-university card):
//   - localStorage_tenant parses to {"slug":"keiser-university"} (NOT dr-norfleet)
//   - localStorage_slug === 'keiser-university'
//   - sessionStorage_tenant matches the same
// If localStorage_tenant still says dr-norfleet → SECURITY GAP. AccessGuard would bypass to wrong tenant.
```

---

## Scenario 4 — leave the last one → state-code (clean state)

```js
clearTenantState();
localStorage.setItem('hexworth_enrollments', JSON.stringify([
    { tenantSlug: 'dr-norfleet', classId: 'pfi', courseId: 'pfi', className: 'PFI' }
]));
location.reload();

// Page should render state-enrolled. Click "Leave this class". Confirm "OK".
// Expected: transitions to state-code (the join-by-code form). No traces of dr-norfleet in storage.
showTenantState();
// All entries should be null/empty.
```

---

## Scenario 5 — XSS smoke (HTML special chars in className)

```js
clearTenantState();
localStorage.setItem('hexworth_enrollments', JSON.stringify([
    { tenantSlug: 'dr-norfleet', classId: 'xss-test-1', courseId: 'pfi', className: 'He said <"Hi"> Class' },
    { tenantSlug: 'dr-norfleet', classId: 'xss-test-2', courseId: 'pfi', className: "<script>alert('xss')</script>" }
]));
location.reload();

// Expected:
//   - 2 cards render
//   - Class names show literal text including the angle brackets and quotes
//   - NO JS alert fires (the <script> tag is escaped, not interpreted)
//   - Click × → confirm prompt shows the escaped className text accurately
```

---

## Scenario 6 — Apostrophe smoke

```js
clearTenantState();
localStorage.setItem('hexworth_enrollments', JSON.stringify([
    { tenantSlug: 'dr-norfleet', classId: 'apos-test', courseId: 'pfi', className: "O'Brien's Lab Class" }
]));
location.reload();

// Expected:
//   - Card renders with literal apostrophes in class name
//   - Click × → confirm prompt: Are you sure you want to leave "O'Brien's Lab Class"?
//   - Apostrophes preserved in prompt (not escaped to &#39; literally)
```

---

## Scenario 7 — Malformed JSON (defensive guard)

```js
clearTenantState();
localStorage.setItem('hexworth_enrollments', '{this is broken json');
location.reload();

// Expected:
//   - _getEnrollments() catches the JSON parse error and returns []
//   - Page falls through to state-code (no enrollments)
//   - No JS errors in console
//   - User can still join via code-entry form
```

---

## Cleanup

```js
clearTenantState();
console.log('[verify] State cleared. Ready for next test or normal browsing.');
```

---

## Summary checklist

| # | Scenario | Visual verify | Storage assert |
|---|---|---|---|
| 1 | Single enrollment → state-enrolled | Continue + Leave buttons render | All 7 keys populated |
| 2 | Multi-enrollment picker | 3 cards with × buttons, muted-gray with red hover | n/a |
| 3 | Cross-tenant × leave | Confirm prompt fires | hexworth_tenant JSON correctly switched (NOT stale) |
| 4 | Leave last → state-code | Transitions to code-entry | All storage cleared |
| 5 | XSS smoke | Class names render literally, NO alert | Card text reads literal `<` `>` |
| 6 | Apostrophe smoke | Class name shows raw apostrophe | Confirm prompt preserves apostrophe |
| 7 | Malformed JSON | Falls through to state-code | No JS errors |

**If any FAIL:** capture screenshot + DevTools console output + `showTenantState()` table → that's the regression report.
**If all PASS:** marathon merge approved.
