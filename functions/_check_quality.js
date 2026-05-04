#!/usr/bin/env node
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
admin.firestore().doc('_quality_reports/latest').get().then(d => {
    const data = d.data();
    console.log('scannedAt:', data.scannedAt);
    console.log('scannedBy:', data.scannedBy);
    console.log('duration:', data.duration);
    console.log('filesScanned:', data.filesScanned);
    console.log('gate:', data.gate);
    console.log('severity:', JSON.stringify(data.severity));
    console.log('topIssues count:', data.topIssues?.length || 0);
    console.log('spokes count:', data.spokes?.length || 0);
    console.log('ruleBreakdown count:', data.ruleBreakdown?.length || 0);
    process.exit(0);
});
