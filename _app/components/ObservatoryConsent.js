/**
 * ObservatoryConsent.js — research-participation gate for Hexworth Observatory.
 *
 * Blocks the Observatory house until the signed-in user has a consent record on
 * file. On first entry it shows a full-screen consent form: the participant
 * reads the consent text, selects their class (enrollment), agrees, types a
 * signature, then (1) a copy is written to Firestore so the operator receives
 * every submission, (2) the participant can download their own copy, and (3)
 * the house is revealed.
 *
 * Storage:
 *   - Firestore `observatory_consent/{uid}` (operator's copy; admin-readable).
 *   - localStorage mirror so preview/offline still works before rules/auth land.
 * Class list:
 *   - Firestore `observatory_classes` collection if present (admin-editable),
 *     else DEFAULT_CLASSES fallback so the form always renders.
 *
 * CONSENT_SECTIONS below holds the APPROVED consent text verbatim from the study's
 * Research Participation Consent Form (see CONSENT_META for study/PI metadata).
 *
 * Public API:  ObservatoryConsent.ensureConsent(onGranted)
 *   onGranted() runs once consent is confirmed (existing record or fresh submit).
 *
 * Exposed as window.ObservatoryConsent (browser script-tag global).
 */
const ObservatoryConsent = (function () {
    'use strict';

    // Bump when the consent wording changes so re-consent can be required later.
    const FORM_VERSION = 'cerbi-v1-2026-06-21';

    // Fallback class list used when the Firestore `observatory_classes`
    // collection is empty/unavailable. Replaced by admin-editable data later.
    const DEFAULT_CLASSES = [
        { id: 'cis2350c', label: 'CIS2350C — Principles of Information Security' },
        { id: 'cop1034c', label: 'COP1034C — Python for IT' },
        { id: 'other',    label: 'Other / Not listed' }
    ];

    // Study metadata (from the approved Research Participation Consent Form).
    const CONSENT_META = {
        title: 'Gamification in Cybersecurity Training and CERBI Score Analysis',
        pi: 'Frank Mora, MCSIA',
        institution: 'National University',
        email: 'frank.mora@keiseruniversity.edu',
        phone: '904-616-8333',
        researcher: 'Frank Mora'
    };

    // Consent text — verbatim from the approved Research Participation Consent Form.
    const CONSENT_SECTIONS = [
        { h: 'Purpose', p: 'This study examines how gamified cybersecurity training influences user behavior, awareness, and decision making. It also evaluates CERBI scoring and behavioral pattern discovery to improve training methods.' },
        { h: 'Procedures', p: 'Participants will engage in courses, training activities, and competitions using HEXworth Academy content. Interaction and performance data will be collected. Duration: up to 6 months.' },
        { h: 'Voluntary Participation', p: 'Participation is voluntary. You may withdraw at any time without penalty.' },
        { h: 'Risks', p: 'Minimal risk. Possible mild discomfort or privacy concerns. Safeguards will be implemented.' },
        { h: 'Benefits', p: 'No direct benefit. Results may improve cybersecurity education and behavioral risk modeling.' },
        { h: 'Confidentiality', p: 'All data will be anonymized and securely stored. No personally identifiable information will be disclosed.' },
        { h: 'Data Usage', p: 'Data will be used for academic research, publications, and development of cybersecurity frameworks such as CERBI.' },
        { h: 'Consent', p: 'By signing below, you confirm that you understand this study and agree to participate voluntarily.' }
    ];

    // ── Firebase helpers ────────────────────────────────────────────────
    // Return the current user's uid, or null when auth is unavailable
    // (preview/offline). Defers to ArenaFirebase if present.
    async function getUid() {
        try {
            if (typeof ArenaFirebase !== 'undefined') {
                await ArenaFirebase.isReady();
                return (ArenaFirebase.auth && ArenaFirebase.auth.currentUser)
                    ? ArenaFirebase.auth.currentUser.uid : null;
            }
        } catch (e) { /* fall through to null */ }
        return null;
    }

    // Return the live Firestore db handle + modular SDK fns, or null.
    function getDb() {
        if (typeof ArenaFirebase !== 'undefined' && ArenaFirebase.db && window.firebaseFirestore) {
            return { db: ArenaFirebase.db, fs: window.firebaseFirestore };
        }
        return null;
    }

    // Return the current Firebase user object (for displayName/email), or null.
    // Anonymous users return a user with null displayName/email — expected.
    function getAuthUser() {
        try {
            if (typeof ArenaFirebase !== 'undefined' && ArenaFirebase.auth) {
                return ArenaFirebase.auth.currentUser || null;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    // ── Escaping ────────────────────────────────────────────────────────
    // Escape a string for safe interpolation into innerHTML/attributes. Class
    // labels/ids can originate from a participant's own devtools-editable
    // Firestore doc (or elsewhere), so anything rendered back into the DOM
    // (option text, option value, "current class" banner) must be escaped -
    // otherwise a crafted className is a self-XSS payload the next time this
    // switcher (or the consent form) renders. Shared so every render site
    // uses one escape, not a copy each.
    function escHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    // ── Persistence ─────────────────────────────────────────────────────
    // Look up an existing consent record (Firestore first, localStorage mirror
    // fallback). Returns the record object or null.
    async function loadConsent(uid) {
        const conn = getDb();
        if (conn && uid) {
            try {
                const { doc, getDoc } = conn.fs;
                const snap = await getDoc(doc(conn.db, 'observatory_consent', uid));
                if (snap.exists()) return snap.data();
            } catch (e) { console.warn('[Observatory] consent read failed:', e.message); }
        }
        try {
            const raw = localStorage.getItem('observatory_consent_' + (uid || 'preview'));
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return null;
    }

    // Write the consent record to Firestore (operator's copy) + a localStorage
    // mirror. Never throws — preview/offline still completes the flow.
    async function saveConsent(uid, record) {
        const conn = getDb();
        if (conn && uid) {
            try {
                const { doc, writeBatch, serverTimestamp } = conn.fs;
                const u = getAuthUser();
                // Atomic batch: the consent doc (the signed agreement) and the
                // enrollment roster doc (what the admin dashboard queries) commit
                // together or not at all. This rules out the half-written state
                // where consent persists but the roster doc is silently missing —
                // which would never self-heal, since the version check passes on
                // the next visit and the form is never re-shown.
                const batch = writeBatch(conn.db);
                batch.set(doc(conn.db, 'observatory_consent', uid), {
                    ...record, serverConsentedAt: serverTimestamp()
                });
                // displayName/email come from auth and are null for anonymous users.
                batch.set(doc(conn.db, 'observatory_enrollment', uid), {
                    uid: uid,
                    classId: record.classId || null,
                    className: record.className || null,
                    name: record.name || null,
                    displayName: (u && u.displayName) || null,
                    email: (u && u.email) || null,
                    formVersion: record.formVersion || null,
                    // participates=false => declined research; the CF telemetry gate drops their events.
                    // Absent (legacy records) is treated as consented for backward compatibility.
                    // MIRRORED intentionally onto BOTH docs in this atomic batch (consent via ...record
                    // above, enrollment here) so the three readers stay consistent: the CF ORs both docs,
                    // the client tracker reads enrollment, the admin roster reads enrollment. A future
                    // write that touches one doc's participates without the other would break that.
                    participates: record.participates !== false,
                    enrolledAt: record.consentedAt || null,
                    serverEnrolledAt: serverTimestamp()
                });
                await batch.commit();
            } catch (e) { console.warn('[Observatory] consent+enrollment batch failed — mirrored to localStorage, NOT persisted to Firestore:', e.message); }
        }
        try { localStorage.setItem('observatory_consent_' + (uid || 'preview'), JSON.stringify(record)); }
        catch (e) { /* ignore */ }
    }

    // Load the admin-editable class list from Firestore, else DEFAULT_CLASSES.
    async function loadClasses() {
        const conn = getDb();
        if (conn) {
            try {
                const { collection, getDocs } = conn.fs;
                const qs = await getDocs(collection(conn.db, 'observatory_classes'));
                const list = [];
                qs.forEach(d => { const v = d.data(); list.push({ id: d.id, label: v.label || d.id }); });
                if (list.length) return list;
            } catch (e) { console.warn('[Observatory] class list read failed:', e.message); }
        }
        return DEFAULT_CLASSES.slice();
    }

    // ── Download (participant's own copy) ───────────────────────────────
    // Build a self-contained, printable HTML copy of the consent + responses
    // and trigger a browser download.
    function triggerDownload(record) {
        const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
        const sections = CONSENT_SECTIONS.map(s => `<h3>${esc(s.h)}</h3><p>${esc(s.p)}</p>`).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Research Participation Consent (copy)</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 24px;color:#111;line-height:1.5}
h1{font-size:20px;text-align:center}h3{margin:18px 0 4px;color:#1e3a8a}
table.hdr{border-collapse:collapse;margin:14px 0;font-size:14px;width:100%}table.hdr td{border:1px solid #ccc;padding:5px 10px}
.meta{margin-top:24px;border-top:1px solid #ccc;padding-top:12px;font-size:14px}</style></head>
<body><h1>RESEARCH PARTICIPATION CONSENT FORM</h1>
<table class="hdr">
<tr><td><strong>Study Title</strong></td><td>${esc(CONSENT_META.title)}</td></tr>
<tr><td><strong>Principal Investigator</strong></td><td>${esc(CONSENT_META.pi)}</td></tr>
<tr><td><strong>Institution</strong></td><td>${esc(CONSENT_META.institution)}</td></tr>
<tr><td><strong>Email</strong></td><td>${esc(CONSENT_META.email)}</td></tr>
<tr><td><strong>Phone</strong></td><td>${esc(CONSENT_META.phone)}</td></tr>
</table>
${sections}
<div class="meta"><p><strong>Participant Name:</strong> ${esc(record.name)}</p>
<p><strong>Class:</strong> ${esc(record.className)}</p>
<p><strong>Participant Signature:</strong> ${esc(record.signature)} &nbsp;&nbsp; <strong>Date:</strong> ${esc(record.consentedAt)}</p>
<p><strong>Researcher Signature:</strong> ${esc(CONSENT_META.researcher)}</p>
<p style="color:#666;font-size:12px"><strong>Form version:</strong> ${esc(record.formVersion)}</p></div></body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hexworth-observatory-consent-' + (record.consentedAt || '').slice(0, 10) + '.html';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    // ── Styles ──────────────────────────────────────────────────────────
    // Inject the overlay/form CSS once (celestial Polaris palette).
    function injectStyles() {
        if (document.getElementById('obs-consent-styles')) return;
        const css = document.createElement('style');
        css.id = 'obs-consent-styles';
        css.textContent = `
        .obs-consent-overlay{position:fixed;inset:0;z-index:99999;overflow:auto;padding:24px;
            display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;
            background:radial-gradient(60% 50% at 80% 12%, rgba(139,92,246,0.18), transparent 70%),
                       radial-gradient(55% 45% at 15% 88%, rgba(34,211,238,0.14), transparent 70%),
                       radial-gradient(ellipse at top, #0f1530, #05060f)}
        .obs-gate-stars{position:absolute;inset:0;pointer-events:none;background-repeat:repeat;
            background-image:radial-gradient(1.4px 1.4px at 40px 60px,#fff,transparent),radial-gradient(1.2px 1.2px at 160px 130px,#c7d2fe,transparent),radial-gradient(1.3px 1.3px at 250px 40px,#fff,transparent),radial-gradient(1.4px 1.4px at 330px 200px,#a5b4fc,transparent);
            background-size:380px 320px;animation:obs-gate-twinkle 5s ease-in-out infinite}
        @keyframes obs-gate-twinkle{0%,100%{opacity:.4}50%{opacity:.9}}
        @media (prefers-reduced-motion: reduce){.obs-gate-stars{animation:none}}
        .obs-consent-card{position:relative;z-index:1;max-width:680px;width:100%;background:#0b1024;border:1px solid rgba(129,140,248,0.35);
            border-radius:14px;padding:28px 30px;box-shadow:0 0 60px rgba(129,140,248,0.18);color:#cdd6f4}
        .obs-consent-card h1{margin:0 0 4px;font-size:22px;color:#a5b4fc}
        .obs-consent-sub{color:#7c8bd6;font-size:13px;margin-bottom:14px}
        .obs-meta-banner{background:rgba(129,140,248,0.10);border:1px solid rgba(129,140,248,0.35);color:#a5b4fc;
            font-size:12px;padding:8px 12px;border-radius:8px;margin-bottom:16px;letter-spacing:0.3px}
        .obs-consent-body{max-height:38vh;overflow:auto;border:1px solid rgba(129,140,248,0.15);border-radius:8px;
            padding:14px 16px;background:rgba(129,140,248,0.04);margin-bottom:16px;font-size:14px;line-height:1.55}
        .obs-consent-body h3{color:#a5b4fc;font-size:14px;margin:12px 0 2px}.obs-consent-body p{margin:0 0 6px}
        .obs-field{margin-bottom:12px}.obs-field label{display:block;font-size:13px;color:#9aa6e0;margin-bottom:4px}
        .obs-field input[type=text],.obs-field select{width:100%;padding:9px 11px;border-radius:8px;
            border:1px solid rgba(129,140,248,0.3);background:#070a18;color:#e7ecff;font-size:14px}
        .obs-check{display:flex;gap:9px;align-items:flex-start;font-size:13px;color:#c3cdf2;margin-bottom:8px}
        .obs-check input{margin-top:2px}
        .obs-actions{display:flex;gap:10px;align-items:center;margin-top:18px;flex-wrap:wrap}
        .obs-btn{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#06060f;font-weight:700;border:none;
            padding:11px 20px;border-radius:9px;cursor:pointer;font-size:14px}
        .obs-btn[disabled]{opacity:0.45;cursor:not-allowed}
        .obs-err{color:#fca5a5;font-size:12px;min-height:16px;margin-top:6px}
        .obs-signin-card{max-width:440px;text-align:center}
        .obs-google-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;margin-top:8px;
            background:#fff;color:#1f2937;font-weight:600;border:none;padding:12px 22px;border-radius:9px;
            cursor:pointer;font-size:15px;box-shadow:0 2px 12px rgba(129,140,248,0.35)}
        .obs-google-btn:hover{opacity:0.92}
        .obs-google-btn[disabled]{opacity:0.5;cursor:not-allowed}
        .obs-google-icon{width:18px;height:18px}`;
        document.head.appendChild(css);
    }

    // ── Form rendering ──────────────────────────────────────────────────
    // Render the full-screen consent form; resolve onGranted after a valid submit.
    async function showForm(uid, onGranted) {
        const classes = await loadClasses();
        const overlay = document.createElement('div');
        overlay.className = 'obs-consent-overlay';
        const sectionsHTML = CONSENT_SECTIONS.map(s => `<h3>${s.h}</h3><p>${s.p}</p>`).join('');
        const classOpts = classes.map(c => `<option value="${escHtml(c.id)}">${escHtml(c.label)}</option>`).join('');
        overlay.innerHTML = `
        <div class="obs-gate-stars" aria-hidden="true"></div>
        <div class="obs-consent-card" role="dialog" aria-modal="true" aria-label="Research participation consent">
            <h1>Find your way by Polaris</h1>
            <div class="obs-consent-sub">Research Participation Consent — ${CONSENT_META.title}</div>
            <div class="obs-meta-banner">Principal Investigator: ${CONSENT_META.pi} &middot; ${CONSENT_META.institution} &middot; ${CONSENT_META.email}</div>
            <div class="obs-consent-body" tabindex="0">${sectionsHTML}</div>
            <div class="obs-field"><label for="obsName">Participant name</label><input type="text" id="obsName" autocomplete="name"></div>
            <div class="obs-field"><label for="obsClass">Your class (enrollment)</label><select id="obsClass">${classOpts}</select></div>
            <div class="obs-check"><input type="radio" name="obsConsent" id="obsAgree"><label for="obsAgree">I confirm that I understand this study and <strong>agree to participate</strong> voluntarily.</label></div>
            <div class="obs-check"><input type="radio" name="obsConsent" id="obsDecline"><label for="obsDecline">I understand this study and <strong>decline to participate</strong>. I can still use the Observatory; no research data will be collected about me.</label></div>
            <div class="obs-field"><label for="obsSig">Type your name as signature</label><input type="text" id="obsSig" autocomplete="off"></div>
            <div class="obs-actions">
                <button class="obs-btn" id="obsSubmit" disabled>Enroll &amp; enter</button>
                <span style="font-size:12px;color:#7c8bd6">A copy downloads to your device on submit.</span>
            </div>
            <div class="obs-err" id="obsErr"></div>
        </div>`;
        document.body.appendChild(overlay);

        const $ = id => overlay.querySelector(id);
        const submit = $('#obsSubmit'), err = $('#obsErr');
        // Enable submit once name + signature are filled AND a choice (agree OR decline) is made.
        // The button label reflects the choice so "decline" never looks like agreement.
        function revalidate() {
            const choiceMade = $('#obsAgree').checked || $('#obsDecline').checked;
            const ok = $('#obsName').value.trim() && $('#obsSig').value.trim() && choiceMade;
            submit.disabled = !ok;
            submit.textContent = $('#obsDecline').checked ? 'Enter without participating' : 'Agree, enroll & enter';
        }
        ['#obsName', '#obsSig', '#obsClass'].forEach(s => $(s).addEventListener('input', revalidate));
        $('#obsAgree').addEventListener('change', revalidate);
        $('#obsDecline').addEventListener('change', revalidate);

        // Submit handler: persist, download, reveal house.
        submit.addEventListener('click', async () => {
            submit.disabled = true; err.textContent = '';
            const classId = $('#obsClass').value;
            const classObj = classes.find(c => c.id === classId) || { id: classId, label: classId };
            // Capture the actual choice. participates=false means the student declined research:
            // they still enroll and enter, but the telemetry pipeline (CF + tracker) collects nothing.
            const participates = $('#obsAgree').checked;
            const record = {
                uid: uid || null,
                name: $('#obsName').value.trim(),
                classId: classObj.id,
                className: classObj.label,
                formVersion: FORM_VERSION,
                studyTitle: CONSENT_META.title,
                participates: participates,
                // Both radio options affirm "I understand this study" — so understanding is always true.
                // participates carries the actual choice. Recording them separately keeps the raw record
                // honest: a decliner understood the study and chose not to participate (not a comprehension
                // failure, which understoodAndAgree:false could be misread as by a human reviewer).
                agreements: { understoodStudy: true, agreedToParticipate: participates },
                signature: $('#obsSig').value.trim(),
                consentedAt: new Date().toISOString()
            };
            try {
                await saveConsent(uid, record);
                triggerDownload(record);
                overlay.remove();
                onGranted();
            } catch (e) {
                err.textContent = 'Something went wrong saving consent. Please try again.';
                submit.disabled = false;
            }
        });
    }

    // ── Sign-in gate ────────────────────────────────────────────────────
    // True ONLY for a real (non-anonymous) signed-in account. The platform
    // auto-creates an ANONYMOUS user (ArenaFirebase), which does NOT count — the
    // Observatory requires a real account so consent is tied to a stable
    // identity across devices (operator/IRB decision, 2026-06-22).
    async function isRealSignedIn() {
        try { if (typeof ArenaFirebase !== 'undefined') await ArenaFirebase.isReady(); }
        catch (e) { /* ignore — fall through to the current user */ }
        const u = getAuthUser();
        return !!(u && u.uid && u.isAnonymous === false);
    }

    // Full-screen sign-in gate shown before the consent form when the visitor
    // has no real account. Calls onSignedIn() once a non-anonymous account is
    // established via Google popup (the platform's canonical sign-in).
    function showSignIn(onSignedIn) {
        const overlay = document.createElement('div');
        overlay.className = 'obs-consent-overlay';
        overlay.innerHTML = `
        <div class="obs-gate-stars" aria-hidden="true"></div>
        <div class="obs-consent-card obs-signin-card" role="dialog" aria-modal="true" aria-label="Sign in to the Observatory">
            <h1>Find your way by Polaris</h1>
            <div class="obs-consent-sub">The Observatory is a research cohort. Sign in with your Hexworth account to continue — your participation and progress are tied to your account.</div>
            <button class="obs-google-btn" id="obsSignin">
                <img src="/assets/images/icons/icon-google.webp" alt="" class="obs-google-icon">Sign in with Google
            </button>
            <div class="obs-err" id="obsSigninErr"></div>
        </div>`;
        document.body.appendChild(overlay);
        const btn = overlay.querySelector('#obsSignin');
        const err = overlay.querySelector('#obsSigninErr');
        // Trigger the Google popup; only proceed on a confirmed real account.
        btn.addEventListener('click', async () => {
            btn.disabled = true; err.textContent = '';
            try {
                if (typeof FirebaseAuth === 'undefined') throw new Error('auth unavailable');
                if (FirebaseAuth.init) await FirebaseAuth.init();
                const user = await FirebaseAuth.signInWithGoogle();
                if (user && user.isAnonymous === false) {
                    overlay.remove();
                    onSignedIn();
                } else {
                    err.textContent = 'Sign-in was cancelled or did not complete. Please try again.';
                    btn.disabled = false;
                }
            } catch (e) {
                err.textContent = 'Sign-in failed. Please try again.';
                btn.disabled = false;
            }
        });
    }

    // ── Public entry ────────────────────────────────────────────────────
    // Require a real account first, then confirm consent.
    async function ensureConsent(onGranted) {
        injectStyles();
        // Gate on a real (non-anonymous) account before anything else.
        if (!(await isRealSignedIn())) {
            showSignIn(function () { proceedAfterAuth(onGranted); });
            return;
        }
        proceedAfterAuth(onGranted);
    }

    // After a real account is confirmed: honor an existing consent record ONLY
    // if it matches the current consent wording. A FORM_VERSION bump means the
    // text changed — an older agreement doesn't cover wording the participant
    // never saw, so we re-prompt; otherwise show the form for first consent.
    async function proceedAfterAuth(onGranted) {
        const uid = await getUid();
        const existing = await loadConsent(uid);
        if (existing && existing.formVersion === FORM_VERSION) { onGranted(); return; }
        showForm(uid, onGranted);
    }

    // ── Withdrawal (IRB right to withdraw) ───────────────────────────────
    // Full-screen confirm dialog → calls the withdrawFromObservatory Cloud
    // Function, which permanently deletes this user's consent, enrollment, and
    // ALL activity. Irreversible; the student may re-join later by consenting
    // again. Exposed so the house can offer a "manage participation" link.
    function showWithdraw() {
        injectStyles();
        const overlay = document.createElement('div');
        overlay.className = 'obs-consent-overlay';
        overlay.innerHTML = `
        <div class="obs-gate-stars" aria-hidden="true"></div>
        <div class="obs-consent-card obs-signin-card" role="dialog" aria-modal="true" aria-label="Withdraw from research">
            <h1>Withdraw from research</h1>
            <div class="obs-consent-sub">This permanently deletes your consent record, your class enrollment, and all of your Observatory activity data. This cannot be undone — though you may re-join later by consenting again.</div>
            <div class="obs-check" style="text-align:left"><input type="checkbox" id="obsWdAck"><label for="obsWdAck">I understand this permanently deletes my participation data.</label></div>
            <div class="obs-actions" style="justify-content:center">
                <button class="obs-btn" id="obsWdGo" disabled style="background:linear-gradient(135deg,#f87171,#ef4444)">Withdraw &amp; delete my data</button>
                <button class="obs-btn" id="obsWdCancel" style="background:#1b2140;color:#cdd6f4">Cancel</button>
            </div>
            <div class="obs-err" id="obsWdErr"></div>
        </div>`;
        document.body.appendChild(overlay);
        const $ = id => overlay.querySelector(id);
        const go = $('#obsWdGo'), err = $('#obsWdErr');
        // Require explicit acknowledgement before enabling the destructive action.
        $('#obsWdAck').addEventListener('change', e => { go.disabled = !e.target.checked; });
        $('#obsWdCancel').addEventListener('click', () => overlay.remove());
        // Confirm: call the Cloud Function, clear the local mirror, then leave.
        go.addEventListener('click', async () => {
            go.disabled = true; err.textContent = 'Deleting your data…';
            try {
                if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.callFunction) throw new Error('unavailable');
                await FirebaseAuth.callFunction('withdrawFromObservatory');
                // Stop tracking NOW so no late dwell/click beacon re-creates an
                // activity event under this uid after the CF deleted them all.
                if (typeof ObservatoryTracker !== 'undefined' && ObservatoryTracker.abort) ObservatoryTracker.abort();
                // Clear the localStorage mirror so the gate won't think consent exists.
                try {
                    const uid = await getUid();
                    localStorage.removeItem('observatory_consent_' + (uid || 'preview'));
                } catch (e2) { /* ignore */ }
                overlay.querySelector('.obs-consent-card').innerHTML =
                    '<h1>You have withdrawn</h1><div class="obs-consent-sub">Your participation data has been deleted. Redirecting…</div>';
                setTimeout(() => { window.location.href = '/dashboard.html'; }, 2200);
            } catch (e) {
                err.textContent = 'Withdrawal did not finish. Click again to complete deleting your data (it is safe to retry).';
                go.disabled = false;
            }
        });
    }

    // ── Class switcher (cohort re-attribution, not a consent change) ────
    // Lets an already-consented participant pick a different class without
    // re-running consent. Rewrites observatory_enrollment/{uid} (the doc the
    // Cloud Function and admin dashboard treat as authoritative for classId)
    // and mirrors the change into observatory_consent/{uid} + the localStorage
    // record for consistency. Does NOT touch formVersion or agreement fields.
    // No-ops gracefully (routes into normal consent instead) ONLY when there is
    // no signed-in user or no consent record at all - a not-yet-enrolled
    // visitor has nothing to "change" yet. A consent record with a missing or
    // unreadable enrollment doc (partial/legacy state) still gets the dialog
    // below, current class shown as none, so the click is never a dead click;
    // the save handler recreates BOTH docs regardless of which one existed.
    async function showChangeClass() {
        injectStyles();
        const uid = await getUid();
        if (!uid) { ensureConsent(function () {}); return; }

        const conn = getDb();
        let enrollment = null;
        if (conn) {
            try {
                const { doc, getDoc } = conn.fs;
                const snap = await getDoc(doc(conn.db, 'observatory_enrollment', uid));
                if (snap.exists()) enrollment = snap.data();
            } catch (e) { console.warn('[Observatory] enrollment read failed:', e.message); }
        }

        // Only route away to full consent when there is NO consent record at
        // all. If consent exists but enrollment is missing/unreadable, fall
        // through to the dialog below instead of silently doing nothing.
        let consentFallback = null;
        if (!enrollment) {
            consentFallback = await loadConsent(uid);
            if (!consentFallback) { ensureConsent(function () {}); return; }
        }

        const classes = await loadClasses();
        const currentId = (enrollment && enrollment.classId) || '';
        const currentLabel = (enrollment && (enrollment.className || enrollment.classId))
            || (consentFallback && (consentFallback.className || consentFallback.classId))
            || '(none yet)';
        const classOpts = classes.map(c =>
            `<option value="${escHtml(c.id)}"${c.id === currentId ? ' selected' : ''}>${escHtml(c.label)}</option>`).join('');

        const overlay = document.createElement('div');
        overlay.className = 'obs-consent-overlay';
        overlay.innerHTML = `
        <div class="obs-gate-stars" aria-hidden="true"></div>
        <div class="obs-consent-card obs-signin-card" role="dialog" aria-modal="true" aria-label="Change your class">
            <h1>Change my class</h1>
            <div class="obs-consent-sub">Your current class: <strong>${escHtml(currentLabel)}</strong>. This only changes which class your activity is grouped under for the study. It does not affect your research consent or your data.</div>
            <div class="obs-field" style="text-align:left"><label for="obsChangeClass">New class</label><select id="obsChangeClass">${classOpts}</select></div>
            <div class="obs-actions" style="justify-content:center">
                <button class="obs-btn" id="obsChangeGo">Save class</button>
                <button class="obs-btn" id="obsChangeCancel" style="background:#1b2140;color:#cdd6f4">Cancel</button>
            </div>
            <div class="obs-err" id="obsChangeErr"></div>
        </div>`;
        document.body.appendChild(overlay);

        const $ = id => overlay.querySelector(id);
        $('#obsChangeCancel').addEventListener('click', () => overlay.remove());
        $('#obsChangeGo').addEventListener('click', async () => {
            const go = $('#obsChangeGo'), err = $('#obsChangeErr');
            go.disabled = true; err.textContent = '';
            const classId = $('#obsChangeClass').value;
            const classObj = classes.find(c => c.id === classId) || { id: classId, label: classId };
            try {
                if (!conn) throw new Error('database unavailable');
                const { doc, writeBatch, serverTimestamp } = conn.fs;
                // Atomic batch (mirrors saveConsent's own pattern above): both
                // docs commit together or not at all, so enrollment.classId and
                // consent.classId can never disagree from a partial failure.
                // merge:true on each set so no other field (name, formVersion,
                // agreements, etc.) is disturbed - batch.set does not merge by
                // default, unlike a bare setDoc call, so this must be explicit.
                const batch = writeBatch(conn.db);
                batch.set(doc(conn.db, 'observatory_enrollment', uid), {
                    classId: classObj.id,
                    className: classObj.label,
                    serverClassChangedAt: serverTimestamp()
                }, { merge: true });
                batch.set(doc(conn.db, 'observatory_consent', uid), {
                    classId: classObj.id,
                    className: classObj.label
                }, { merge: true });
                await batch.commit();
                try {
                    const raw = localStorage.getItem('observatory_consent_' + uid);
                    if (raw) {
                        const rec = JSON.parse(raw);
                        rec.classId = classObj.id;
                        rec.className = classObj.label;
                        localStorage.setItem('observatory_consent_' + uid, JSON.stringify(rec));
                    }
                } catch (e2) { /* ignore, mirror is best-effort */ }
                overlay.remove();
            } catch (e) {
                err.textContent = 'Could not save your class change. Please try again.';
                go.disabled = false;
            }
        });
    }

    return {
        ensureConsent: ensureConsent,
        showWithdraw: showWithdraw,
        showChangeClass: showChangeClass,
        FORM_VERSION: FORM_VERSION
    };
})();

// Browser global for script-tag consumers.
window.ObservatoryConsent = ObservatoryConsent;
