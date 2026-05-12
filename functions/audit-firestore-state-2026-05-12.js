#!/usr/bin/env node
/**
 * audit-firestore-state-2026-05-12.js
 *
 * READ-ONLY snapshot of analytics-v2 + Nexus pipeline Firestore state.
 * Companion to audit-analytics-collections-2026-05-12.js with deeper
 * coverage: dumps _quality_reports/latest contents (severity + spokes),
 * checks 7 candidate analytics-v2 collection names for population
 * (analytics_events / analytics_v2_events / class_events /
 * instructor_metrics / student_metrics / analytics-v2 / consent_v2),
 * and shows the head of _triage_queue + _auto_fix_queue with timestamps.
 *
 * Built 2026-05-12 during analytics investigation. Confirmed that all 7
 * analytics-v2 collection candidates were empty (0 docs) — pointing the
 * "Class Report not showing" issue at the instructor.html COURSE_MAPS
 * registry (only 3 of 16 courses had maps) rather than the analytics
 * event pipeline.
 *
 * Usage:
 *   cd functions
 *   node audit-firestore-state-2026-05-12.js
 */
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
(async () => {
  // Check scannedAt values
  const latest = await db.doc('_quality_reports/latest').get();
  if (latest.exists) {
    const d = latest.data();
    console.log('latest scannedAt:', d.scannedAt?.toDate?.()?.toISOString?.() || d.scannedAt);
    console.log('latest scannedBy:', d.scannedBy);
    console.log('latest spokes:', Object.keys(d.spokes || {}));
    console.log('latest severity:', d.severity);
  }
  // Look for analytics-v2 collections
  const collections = ['analytics_events', 'analytics_v2_events', 'class_events', 'instructor_metrics', 'student_metrics', 'analytics-v2', 'consent_v2'];
  for (const c of collections) {
    const snap = await db.collection(c).limit(1).get();
    console.log(`${c}: ${snap.size} docs`);
  }
  // Check triage queue + auto-fix queue
  for (const c of ['_triage_queue', '_auto_fix_queue']) {
    const snap = await db.collection(c).limit(5).get();
    console.log(`${c}: ${snap.size} docs`);
    snap.forEach(d => {
      const r = d.data();
      const ts = r.createdAt?.toDate?.()?.toISOString?.() || r.timestamp?.toDate?.()?.toISOString?.() || 'n/a';
      console.log(`  ${d.id} status=${r.status || '?'} ts=${ts}`);
    });
  }
})().catch(e => { console.error(e); process.exit(2); });
