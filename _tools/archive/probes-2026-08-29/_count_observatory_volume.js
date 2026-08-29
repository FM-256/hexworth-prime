// READ-ONLY: Observatory consented-event volume for the telemetry report. Uses aggregate count()
// queries (cheap, no per-doc reads) for the event stream, and reads the small consent/enrollment
// collections for participant denominators. No writes anywhere. Auth via ADC, same as the sibling
// _count_consent_versions.js script.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

// Event types the ingestion function admits (keep in lockstep with logObservatoryEvent's ALLOWED).
const TYPES = ['house_enter', 'course_click', 'house_dwell', 'content_complete',
    'page_view', 'session_end', 'client_error', 'device', 'sandbox_launch'];
const PHASE2 = new Set(['page_view', 'session_end', 'client_error', 'device']); // require v2 re-consent

(async () => {
    const activity = db.collection('observatory_activity');

    // Total event volume via a single aggregate count (does not read every doc).
    const total = (await activity.count().get()).data().count;

    // Per-type volume: one cheap aggregate count per type.
    const byType = {};
    for (const t of TYPES) {
        byType[t] = (await activity.where('type', '==', t).count().get()).data().count;
    }

    // Time span of the stream: earliest and latest event by the server timestamp `at`.
    let firstAt = null, lastAt = null;
    try {
        const a = await activity.orderBy('at', 'asc').limit(1).get();
        const b = await activity.orderBy('at', 'desc').limit(1).get();
        if (!a.empty && a.docs[0].data().at) firstAt = a.docs[0].data().at.toDate().toISOString();
        if (!b.empty && b.docs[0].data().at) lastAt = b.docs[0].data().at.toDate().toISOString();
    } catch (e) { /* index may be building; leave nulls */ }

    // Consent denominators: total records, breakdown by form version, and explicit declines.
    const consentSnap = await db.collection('observatory_consent').get();
    const byVer = {}; let consentDeclined = 0;
    consentSnap.forEach(d => {
        const v = d.data().formVersion || '(none)';
        byVer[v] = (byVer[v] || 0) + 1;
        if (d.data().participates === false) consentDeclined++;
    });

    // Enrollment denominators: total, distinct classes, and declines.
    const enrollSnap = await db.collection('observatory_enrollment').get();
    const byClass = {}; let enrollDeclined = 0;
    enrollSnap.forEach(d => {
        const c = d.data().classId || '(none)';
        byClass[c] = (byClass[c] || 0) + 1;
        if (d.data().participates === false) enrollDeclined++;
    });

    // Emit a compact, parse-friendly summary.
    const out = {
        pulledAt: new Date().toISOString(),
        activity: { total, byType, firstAt, lastAt,
            phase1: TYPES.filter(t => !PHASE2.has(t)).reduce((s, t) => s + byType[t], 0),
            phase2: TYPES.filter(t => PHASE2.has(t)).reduce((s, t) => s + byType[t], 0) },
        consent: { records: consentSnap.size, byFormVersion: byVer, declined: consentDeclined },
        enrollment: { records: enrollSnap.size, classes: Object.keys(byClass).length, byClass, declined: enrollDeclined },
    };
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
})().catch(e => { console.error('READ FAILED:', e.message); process.exit(1); });
