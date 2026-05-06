'use strict';

/**
 * Firebase Auth REST sign-in helper for runtime-monitor auth-mode probes.
 *
 * SYM-14 SKELETON — NOT YET WIRED. Awaits 6 design decisions.
 * See: _docs/operations/sym-14-auth-probe-design.md
 *
 * When this skeleton is completed, it will:
 *   1. Load test-account credentials from secure storage (decision 1)
 *   2. POST to Firebase Auth REST endpoint to get an ID token
 *   3. Return { idToken, refreshToken, uid } for the probe to inject
 *      into Puppeteer page context
 *
 * The probe then navigates to auth-gated URLs with the token attached
 * (either via cookie injection or fetch interceptor wrapping subsequent
 * Firebase Auth calls).
 *
 * Why separate file: keeps auth concerns out of run.js (least-privilege
 * mental model — anonymous probe code never imports this) AND lets us
 * swap credential storage backends without touching run.js.
 */

// ── DECISION TODO MARKERS — fill in after sym-14-auth-probe-design.md is approved
// Each marker maps 1:1 to a decision in the design doc's "Open decisions" section.

/**
 * TODO(SYM-14 decision 1: credential storage approach)
 *   Recommended: Secret Manager (gcp-managed secret named `runtime-monitor-test-account`)
 *   Alternatives: Cloud Run env var (less secure, easier rotation)
 *
 *   When decided, replace this stub with the appropriate read.
 *   Returns: { email: string, password: string }
 */
async function loadCredentials() {
    throw new Error(
        'SYM-14 not yet implemented (decision 1: credential storage). ' +
        'See _docs/operations/sym-14-auth-probe-design.md'
    );
}

/**
 * TODO(SYM-14 decision 5: test account email)
 *   Recommended: runtime-monitor@hexworth.com
 *
 *   This constant is set ONCE; rotation happens via password change in
 *   Secret Manager (decision 6: cadence).
 */
const TEST_ACCOUNT_EMAIL = null; // SET ME after decision 5

/**
 * TODO(SYM-14 decision 3: MFA handling)
 *   Recommended: disable MFA on the test account (it's automated, can't
 *   enter codes; security posture is rotation, not MFA)
 *
 *   If MFA is REQUIRED by org policy, this skeleton needs significant
 *   rework — likely needs a long-lived service-account-style auth flow
 *   instead of email/password. Flag for design revisit.
 */
const MFA_DISABLED_ON_TEST_ACCOUNT = false; // SET TO true after decision 3 confirms MFA off

/**
 * TODO(SYM-14 decision 6: rotation cadence)
 *   Recommended: quarterly. This constant is just for telemetry — rotation
 *   itself is a manual operator step (Secret Manager + Firebase Auth).
 */
const ROTATION_CADENCE_DAYS = 90; // CONFIRM after decision 6

/**
 * Sign in to Firebase Auth via REST API.
 * Skeleton — does not yet make the actual API call.
 *
 * Real implementation (when decisions 1, 3, 5 are made):
 *   const creds = await loadCredentials();
 *   if (!MFA_DISABLED_ON_TEST_ACCOUNT) throw new Error('MFA on automated account — see SYM-14 design notes');
 *   const apiKey = process.env.FIREBASE_API_KEY; // public key, OK in env
 *   const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
 *   const resp = await fetch(url, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ email: creds.email, password: creds.password, returnSecureToken: true })
 *   });
 *   if (!resp.ok) throw new Error(`Firebase Auth sign-in failed: ${resp.status}`);
 *   const data = await resp.json();
 *   return { idToken: data.idToken, refreshToken: data.refreshToken, uid: data.localId };
 */
async function signIn() {
    if (!TEST_ACCOUNT_EMAIL) {
        throw new Error(
            'SYM-14 not yet implemented (decision 5: test account email not set). ' +
            'See _docs/operations/sym-14-auth-probe-design.md'
        );
    }
    if (!MFA_DISABLED_ON_TEST_ACCOUNT) {
        throw new Error(
            'SYM-14 not yet implemented (decision 3: MFA status unconfirmed). ' +
            'See _docs/operations/sym-14-auth-probe-design.md'
        );
    }
    throw new Error('SYM-14 signIn() stub — implementation pending all 6 decisions');
}

/**
 * Inject Firebase Auth state into a Puppeteer page so subsequent
 * navigations and fetch calls behave as the authenticated user.
 *
 * Real implementation (when wired):
 *   await page.evaluateOnNewDocument((auth) => {
 *       // Firebase SDK reads from window-scoped storage keys
 *       const stored = {
 *           uid: auth.uid,
 *           stsTokenManager: { accessToken: auth.idToken, refreshToken: auth.refreshToken }
 *       };
 *       try { localStorage.setItem('firebase:authUser:...:[DEFAULT]', JSON.stringify(stored)); } catch (_) {}
 *   }, authState);
 */
async function attachAuthToPage(page, authState) {
    throw new Error('SYM-14 attachAuthToPage() stub — implementation pending');
}

module.exports = {
    loadCredentials,
    signIn,
    attachAuthToPage,
    // Constants exposed for diagnostics
    _TEST_ACCOUNT_EMAIL: TEST_ACCOUNT_EMAIL,
    _MFA_DISABLED_ON_TEST_ACCOUNT: MFA_DISABLED_ON_TEST_ACCOUNT,
    _ROTATION_CADENCE_DAYS: ROTATION_CADENCE_DAYS
};
