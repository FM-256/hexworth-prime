#!/usr/bin/env node
/**
 * diag-pfi-progress.js — read-only Firestore diagnostic for PFI export bug
 *
 * Pulls Jorden Stafford's tenant class progress doc and dumps the raw
 * modulesCompleted/quizScores/labsCompleted arrays. Compares against the
 * Python For IT course-map item ids to determine if there's an ID mismatch.
 *
 * Read-only. Safe to run from master.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const JORDEN_UID = 'PYvAJ45PONfURvn1aQEtbPNXS0d2';
const LUIS_UID = '0zsHdHqZKkgNtMnDV28oYEvxG1g2';

// Load PFI course map to compare ids
const mapText = fs.readFileSync(path.join(__dirname, '..', '_app/tenant/python-for-it-map.js'), 'utf8');
const courseMapItemIds = [];
const itemRe = /id:\s*"([^"]+)"/g;
let m;
while ((m = itemRe.exec(mapText)) !== null) courseMapItemIds.push(m[1]);

async function dumpStudent(uid, name) {
    console.log('\n═══ ' + name + ' (' + uid + ') ═══');

    // Find enrollments
    const enrollDoc = await db.doc(`enrollments/${uid}`).get();
    if (!enrollDoc.exists) {
        console.log('  enrollments/{uid}: NOT FOUND');
        return;
    }
    const enroll = enrollDoc.data();
    console.log('  enrollments doc:', JSON.stringify(enroll, null, 2).slice(0, 500));

    // Find class progress doc
    const enrollments = enroll.enrollments || (enroll.tenantSlug ? [{ tenantSlug: enroll.tenantSlug, classId: enroll.classId }] : []);
    for (const e of enrollments) {
        const progressPath = `tenants/${e.tenantSlug}/classes/${e.classId}/progress/${uid}`;
        console.log('\n  → Reading: ' + progressPath);
        const progDoc = await db.doc(progressPath).get();
        if (!progDoc.exists) {
            console.log('    PROGRESS DOC DOES NOT EXIST');
            continue;
        }
        const data = progDoc.data();
        console.log('    Fields present:', Object.keys(data).join(', '));
        console.log('    modulesCompleted:', JSON.stringify(data.modulesCompleted || []));
        console.log('    labsCompleted:   ', JSON.stringify(data.labsCompleted || []));
        console.log('    quizScores:      ', JSON.stringify(data.quizScores || {}));
        console.log('    chaptersCompleted:', JSON.stringify(data.chaptersCompleted || []));
        console.log('    currentChapter:  ', data.currentChapter);
        console.log('    totalTimeSpent:  ', data.totalTimeSpent);
        console.log('    lastActive:      ', data.lastActive ? new Date(data.lastActive._seconds * 1000).toISOString() : 'null');

        // Compare IDs against course map
        const allCompletions = [
            ...(data.modulesCompleted || []),
            ...(data.labsCompleted || []),
            ...Object.keys(data.quizScores || {})
        ];
        const matched = allCompletions.filter(id => courseMapItemIds.includes(id));
        const unmatched = allCompletions.filter(id => !courseMapItemIds.includes(id));
        console.log('\n    Total completion IDs in arrays:', allCompletions.length);
        console.log('    Match course-map item.id:       ', matched.length);
        console.log('    DO NOT match (drift):           ', unmatched.length);
        if (unmatched.length > 0) {
            console.log('    Drifted IDs (first 10):');
            unmatched.slice(0, 10).forEach(id => console.log('      • ' + id));
        }
    }
}

async function main() {
    console.log('PFI course-map item.id count:', courseMapItemIds.length);
    console.log('First 5 course-map ids:', courseMapItemIds.slice(0, 5));
    await dumpStudent(JORDEN_UID, 'Jorden Stafford');
    await dumpStudent(LUIS_UID, 'Luis Diaz');
    process.exit(0);
}

main().catch(err => {
    console.error('FAILED:', err);
    process.exit(2);
});
