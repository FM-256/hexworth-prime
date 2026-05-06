'use strict';

/**
 * Auth-mode probe targets for runtime monitor.
 *
 * SYM-14 SKELETON — NOT YET WIRED. See:
 *   _docs/operations/sym-14-auth-probe-design.md
 *
 * Same shape as the anonymous TARGETS in run.js, with one extra field:
 *   - requiresAuth: true   (signals run.js to attach auth state to page)
 *
 * TODO(SYM-14 decision 4: initial probe scope)
 *   Recommended starter set: A1 (dashboard) + A3 (canary module write)
 *   Wider possibilities: A2 (instructor dashboard) + A4 (operator console)
 *     — both require additional test accounts (deferred to follow-up)
 */

const AUTH_TARGETS = [
    {
        name: 'A1 — Authenticated student dashboard',
        url: '/dashboard.html',
        requiresAuth: true,
        seedLocalStorage: { hexworth_house: 'web' },
        assertions: [
            // TODO: pick the strongest "auth landed correctly" assertion.
            // Candidates:
            //   - selector that's only present for logged-in users (e.g., user-avatar)
            //   - selector-count on .mini-house-card with min:5 (same as anon, but here means dashboard rendered AFTER auth)
            //   - text contains the test account display name
            { type: 'selector-count', selector: '.mini-house-card', min: 5 }
        ]
    },
    {
        name: 'A3 — Canary module progress write',
        url: '/houses/key/aes/index.html', // TODO: confirm canary module path
        requiresAuth: true,
        seedLocalStorage: { hexworth_house: 'key' },
        assertions: [
            // The point of this probe is to validate ModuleProgress.complete()
            // can write to Firestore as the auth user. Assertion needs to
            // either:
            //   a) trigger the complete() call programmatically + check Firestore
            //   b) find a "completion successful" UI signal post-trigger
            //   c) just check that the page renders for now, do the write
            //      assertion in a follow-up
            // Picking (c) for skeleton — minimum viable.
            { type: 'selector-count', selector: '.module-card', min: 1 }
        ]
    }

    // Future targets (require additional test accounts):
    // - A2: /handler-dashboard.html (instructor account)
    // - A4: /operator/index.html (operator account)
];

module.exports = { AUTH_TARGETS };
