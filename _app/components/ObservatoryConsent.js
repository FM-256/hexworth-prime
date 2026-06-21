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
    const FORM_VERSION = 'draft-2026-06-21';

    // Fallback class list used when the Firestore `observatory_classes`
    // collection is empty/unavailable. Replaced by admin-editable data later.
    const DEFAULT_CLASSES = [
        { id: 'cis2350c', label: 'CIS2350C — Principles of Information Security' },
        { id: 'cop1034c', label: 'COP1034C — Python for IT' },
        { id: 'other',    label: 'Other / Not listed' }
    ];

    // DRAFT consent text — PLACEHOLDER. Replace with IRB-approved language.
    const CONSENT_DRAFT = [
        { h: 'Purpose', p: 'You are being invited to participate in an educational research study conducted through Hexworth Prime. The purpose is to study how students interact with course materials in order to improve teaching and learning. [DRAFT — final purpose statement to be supplied by IRB.]' },
        { h: 'What we collect', p: 'If you consent, the platform records your activity within the Hexworth Observatory — pages and modules you open, time spent, interactions, and progress. Your name and selected class are recorded to associate your activity with your enrollment. [DRAFT.]' },
        { h: 'Voluntary participation & withdrawal', p: 'Participation is entirely voluntary. You may decline without penalty, and you may withdraw at any time by contacting the instructor; withdrawal stops further data collection. [DRAFT — withdrawal procedure to be finalized by IRB.]' },
        { h: 'Data use & retention', p: 'Collected data is used for educational research and program improvement. It is stored securely and retained per the institution\'s data-retention policy. [DRAFT — retention period and sharing terms to be finalized by IRB.]' },
        { h: 'Contact', p: 'Questions about this study or your rights as a participant can be directed to the course instructor and the institution\'s IRB. [DRAFT — contact details to be supplied.]' }
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
        const sections = CONSENT_DRAFT.map(s => `<h3>${esc(s.h)}</h3><p>${esc(s.p)}</p>`).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Hexworth Observatory — Research Consent (copy)</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 24px;color:#111;line-height:1.5}
h1{font-size:20px}h3{margin:18px 0 4px}.draft{background:#fde68a;border:1px solid #d97706;padding:8px 12px;border-radius:6px;font-family:monospace;font-size:12px}
.meta{margin-top:24px;border-top:1px solid #ccc;padding-top:12px;font-size:14px}</style></head>
<body><h1>Hexworth Observatory — Research Participation Consent</h1>
<div class="draft">DRAFT — placeholder consent text, pending IRB approval. Not a final consent document.</div>
${sections}
<div class="meta"><p><strong>Participant:</strong> ${esc(record.name)}</p>
<p><strong>Class:</strong> ${esc(record.className)}</p>
<p><strong>Agreed:</strong> Participate · Data use understood · Voluntary/withdrawal understood</p>
<p><strong>Signature:</strong> ${esc(record.signature)}</p>
<p><strong>Date:</strong> ${esc(record.consentedAt)}</p>
<p><strong>Form version:</strong> ${esc(record.formVersion)}</p></div></body></html>`;
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
        .obs-draft-banner{background:rgba(217,119,6,0.12);border:1px solid rgba(245,158,11,0.5);color:#fbbf24;
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
        const sectionsHTML = CONSENT_DRAFT.map(s => `<h3>${s.h}</h3><p>${s.p}</p>`).join('');
        const classOpts = classes.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
        overlay.innerHTML = `
        <div class="obs-consent-card" role="dialog" aria-modal="true" aria-label="Research participation consent">
            <h1>Find your way by Polaris</h1>
            <div class="obs-consent-sub">Hexworth Observatory — Research Participation Consent</div>
            <div class="obs-draft-banner">DRAFT consent text — placeholder pending IRB approval. Not a final consent document.</div>
            <div class="obs-consent-body" tabindex="0">${sectionsHTML}</div>
            <div class="obs-field"><label for="obsName">Full name</label><input type="text" id="obsName" autocomplete="name"></div>
            <div class="obs-field"><label for="obsClass">Your class (enrollment)</label><select id="obsClass">${classOpts}</select></div>
            <div class="obs-check"><input type="checkbox" id="obsA1"><label for="obsA1">I agree to participate in this educational research study.</label></div>
            <div class="obs-check"><input type="checkbox" id="obsA2"><label for="obsA2">I understand what data is collected and how it is used.</label></div>
            <div class="obs-check"><input type="checkbox" id="obsA3"><label for="obsA3">I understand participation is voluntary and I may withdraw at any time.</label></div>
            <div class="obs-field"><label for="obsSig">Type your name as signature</label><input type="text" id="obsSig" autocomplete="off"></div>
            <div class="obs-actions">
                <button class="obs-btn" id="obsSubmit" disabled>Agree, enroll & enter</button>
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
                && $('#obsA1').checked && $('#obsA2').checked && $('#obsA3').checked;
            submit.disabled = !ok;
        }
        ['#obsName', '#obsSig', '#obsClass'].forEach(s => $(s).addEventListener('input', revalidate));
        ['#obsA1', '#obsA2', '#obsA3'].forEach(s => $(s).addEventListener('change', revalidate));

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
                agreements: { participate: true, dataUse: true, voluntary: true },
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
