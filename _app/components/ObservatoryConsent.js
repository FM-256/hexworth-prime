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
 * IMPORTANT: CONSENT_DRAFT below is PLACEHOLDER text marked DRAFT — it must be
 * replaced with the operator's IRB-approved wording before any real student
 * uses this house. The on-screen banner makes the draft status unmistakable.
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
                const { doc, setDoc, serverTimestamp } = conn.fs;
                await setDoc(doc(conn.db, 'observatory_consent', uid), {
                    ...record, serverConsentedAt: serverTimestamp()
                });
            } catch (e) { console.warn('[Observatory] consent write failed (mirrored locally):', e.message); }
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
        .obs-consent-overlay{position:fixed;inset:0;z-index:99999;background:radial-gradient(ellipse at top,#0f1530,#05060f);
            display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;font-family:system-ui,-apple-system,sans-serif}
        .obs-consent-card{max-width:680px;width:100%;background:#0b1024;border:1px solid rgba(129,140,248,0.35);
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
        .obs-err{color:#fca5a5;font-size:12px;min-height:16px;margin-top:6px}`;
        document.head.appendChild(css);
    }

    // ── Form rendering ──────────────────────────────────────────────────
    // Render the full-screen consent form; resolve onGranted after a valid submit.
    async function showForm(uid, onGranted) {
        const classes = await loadClasses();
        const overlay = document.createElement('div');
        overlay.className = 'obs-consent-overlay';
        const sectionsHTML = CONSENT_SECTIONS.map(s => `<h3>${s.h}</h3><p>${s.p}</p>`).join('');
        const classOpts = classes.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
        overlay.innerHTML = `
        <div class="obs-consent-card" role="dialog" aria-modal="true" aria-label="Research participation consent">
            <h1>Find your way by Polaris</h1>
            <div class="obs-consent-sub">Research Participation Consent — ${CONSENT_META.title}</div>
            <div class="obs-meta-banner">Principal Investigator: ${CONSENT_META.pi} &middot; ${CONSENT_META.institution} &middot; ${CONSENT_META.email}</div>
            <div class="obs-consent-body" tabindex="0">${sectionsHTML}</div>
            <div class="obs-field"><label for="obsName">Participant name</label><input type="text" id="obsName" autocomplete="name"></div>
            <div class="obs-field"><label for="obsClass">Your class (enrollment)</label><select id="obsClass">${classOpts}</select></div>
            <div class="obs-check"><input type="checkbox" id="obsAgree"><label for="obsAgree">I confirm that I understand this study and agree to participate voluntarily.</label></div>
            <div class="obs-field"><label for="obsSig">Type your name as signature</label><input type="text" id="obsSig" autocomplete="off"></div>
            <div class="obs-actions">
                <button class="obs-btn" id="obsSubmit" disabled>Agree, enroll &amp; enter</button>
                <span style="font-size:12px;color:#7c8bd6">A copy downloads to your device on submit.</span>
            </div>
            <div class="obs-err" id="obsErr"></div>
        </div>`;
        document.body.appendChild(overlay);

        const $ = id => overlay.querySelector(id);
        const submit = $('#obsSubmit'), err = $('#obsErr');
        // Enable submit only when all required fields are valid.
        function revalidate() {
            const ok = $('#obsName').value.trim() && $('#obsSig').value.trim()
                && $('#obsAgree').checked;
            submit.disabled = !ok;
        }
        ['#obsName', '#obsSig', '#obsClass'].forEach(s => $(s).addEventListener('input', revalidate));
        $('#obsAgree').addEventListener('change', revalidate);

        // Submit handler: persist, download, reveal house.
        submit.addEventListener('click', async () => {
            submit.disabled = true; err.textContent = '';
            const classId = $('#obsClass').value;
            const classObj = classes.find(c => c.id === classId) || { id: classId, label: classId };
            const record = {
                uid: uid || null,
                name: $('#obsName').value.trim(),
                classId: classObj.id,
                className: classObj.label,
                formVersion: FORM_VERSION,
                studyTitle: CONSENT_META.title,
                agreements: { understoodAndAgree: true },
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

    // ── Public entry ────────────────────────────────────────────────────
    // Confirm consent (existing record → immediate), else show the form.
    async function ensureConsent(onGranted) {
        injectStyles();
        const uid = await getUid();
        const existing = await loadConsent(uid);
        if (existing) { onGranted(); return; }
        showForm(uid, onGranted);
    }

    return { ensureConsent: ensureConsent, FORM_VERSION: FORM_VERSION };
})();

// Browser global for script-tag consumers.
window.ObservatoryConsent = ObservatoryConsent;
