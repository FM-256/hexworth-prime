#!/usr/bin/env node
/**
 * audit-analytics-collections-2026-05-12.js
 *
 * READ-ONLY probe of analytics-v2 health markers in production Firestore.
 * Reports the state of _quality_reports/{latest,spellbook,scanHeartbeat}
 * and the _self_heal_monitor collection. Useful for diagnosing "dashboard
 * looks stale" complaints — confirms whether the Nexus pipeline is
 * actually writing or whether the dashboard is reading a wrong field.
 *
 * Built 2026-05-12 during the "ethics analytics not showing right"
 * investigation. Surfaced two facts: (1) scannedAt is the freshness
 * field, not updatedAt — dashboard probes for the wrong key would see
 * "never updated"; (2) _self_heal_monitor was empty (0 docs).
 *
 * Usage:
 *   cd functions
 *   node audit-analytics-collections-2026-05-12.js
 */
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
(async () => {
  // Check _quality_reports
  const docs = ['latest', 'spellbook', 'scanHeartbeat'];
  for (const d of docs) {
    const snap = await db.doc(`_quality_reports/${d}`).get();
    if (snap.exists) {
      const data = snap.data();
      const keys = Object.keys(data).slice(0, 8);
      const ts = data.updatedAt || data.timestamp || data.lastScanAt;
      console.log(`_quality_reports/${d}: ${keys.join(',')} ts=${ts && ts.toDate ? ts.toDate().toISOString() : ts}`);
    } else {
      console.log(`_quality_reports/${d}: MISSING`);
    }
  }
  // Self-heal status (analytics-v2)
  const heal = await db.collection('_self_heal_monitor').orderBy('timestamp', 'desc').limit(3).get();
  console.log(`\nself-heal recent: ${heal.size} docs`);
  heal.forEach(d => {
    const r = d.data();
    console.log(`  ${d.id} status=${r.status} ts=${r.timestamp?.toDate?.()?.toISOString?.()}`);
  });
})().catch(e => { console.error(e); process.exit(2); });
