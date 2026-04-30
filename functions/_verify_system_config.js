#!/usr/bin/env node
// Verify _system_config/self_healing has the new availableTemplates field
// after the auto-mirror runs.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const snap = await db.doc('_system_config/self_healing').get();
    if (!snap.exists) {
        console.error('_system_config/self_healing does not exist');
        process.exit(1);
    }
    const d = snap.data();
    console.log('Self-healing config:');
    console.log('  enabled:', d.enabled);
    console.log('  enabledTemplates:', JSON.stringify(d.enabledTemplates || []));
    console.log('  availableTemplates:', JSON.stringify(d.availableTemplates || [], null, 2));
    console.log('  availableTemplatesUpdatedAt:', d.availableTemplatesUpdatedAt && d.availableTemplatesUpdatedAt.toDate ? d.availableTemplatesUpdatedAt.toDate().toISOString() : null);
    process.exit(0);
})();
