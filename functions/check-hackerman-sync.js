const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const uid = '51ps4GhN2Td9UEswkgXri194t9i1';

async function main() {
    const doc = await db.collection('users').doc(uid).collection('sync').doc('localStorage').get();

    if (!doc.exists) {
        console.log('No sync blob found');
        return;
    }

    const d = doc.data();
    console.log('Synced at:', d.syncedAt ? d.syncedAt.toDate() : 'n/a');
    console.log('Key count:', d.keyCount);
    console.log();

    const data = d.data || {};
    Object.keys(data).sort().forEach(key => {
        let val = data[key];
        if (val && val.length > 300) {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) {
                    val = '[Array(' + parsed.length + ')] ' + JSON.stringify(parsed.slice(0, 5)) + '...';
                } else if (typeof parsed === 'object') {
                    const keys = Object.keys(parsed);
                    val = '{Object(' + keys.length + ' keys)} ' + keys.slice(0, 10).join(', ') + '...';
                }
            } catch(e) {
                val = val.substring(0, 300) + '... [truncated]';
            }
        }
        console.log(key + ':', val);
    });

    // Dig into hexworth_progress specifically
    if (data.hexworth_progress) {
        console.log('\n=== HEXWORTH_PROGRESS DETAIL ===');
        try {
            const progress = JSON.parse(data.hexworth_progress);
            console.log('XP:', progress.xp);
            console.log('Level:', progress.level);
            console.log('completedModules:', progress.completedModules ? progress.completedModules.length : 'missing');
            if (progress.completedModules) {
                progress.completedModules.forEach(m => console.log('  ', m));
            }
            console.log('labsCompleted:', progress.labsCompleted ? progress.labsCompleted.length : 'missing');
            if (progress.labsCompleted) {
                progress.labsCompleted.forEach(l => console.log('  ', l));
            }
            // Show houses sub-object keys
            if (progress.houses) {
                console.log('Houses tracked:', Object.keys(progress.houses).join(', '));
                Object.entries(progress.houses).forEach(([h, hData]) => {
                    console.log(`  ${h}: modules=${(hData.modulesCompleted || []).length}, quizzes=${(hData.quizzesPassed || []).length}`);
                });
            }
        } catch(e) {
            console.log('Failed to parse:', e.message);
        }
    }
}

main().catch(console.error).finally(() => setTimeout(() => process.exit(0), 2000));
