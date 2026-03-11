#!/usr/bin/env node
/**
 * Seed script — populates challenge_registry/clh in Firestore
 * with insight phase answers for server-side validation.
 *
 * Usage:  node seed-clh-insights.js
 *
 * Reads insight phases from extract-clh-insights.js output,
 * stores each module's answers in Firestore.
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { execSync } = require('child_process');

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

async function seed() {
    // Extract insights from CLHConfig.js
    const raw = execSync('node extract-clh-insights.js', { encoding: 'utf8' });
    const insights = JSON.parse(raw);

    const batch = db.batch();

    // Store metadata doc
    batch.set(db.doc('challenge_registry/clh'), {
        type: 'clh-insight',
        totalModules: insights.length,
        updatedAt: new Date().toISOString()
    });

    // Store each module's insight phase
    for (const insight of insights) {
        batch.set(db.doc(`challenge_registry/clh/insights/${insight.moduleId}`), {
            question: insight.question,
            acceptedAnswers: insight.acceptedAnswers,
            correctMessage: insight.correctMessage,
            wrongMessage: insight.wrongMessage
        });
    }

    await batch.commit();
    console.log(`Seeded challenge_registry/clh with ${insights.length} insight phases`);
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
