const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const uid = '51ps4GhN2Td9UEswkgXri194t9i1';

async function main() {
    // Check Firestore profile
    const profile = await db.collection('users').doc(uid).get();
    if (profile.exists) {
        const d = profile.data();
        console.log('=== FIRESTORE PROFILE ===');
        console.log('modulesCompleted:', JSON.stringify(d.modulesCompleted, null, 2));
        console.log('\nlabsCompleted:', JSON.stringify(d.labsCompleted, null, 2));
        console.log('\nXP:', d.xp, 'Level:', d.level);
    }

    // Check sync blob
    const sync = await db.collection('users').doc(uid).collection('sync').doc('localStorage').get();
    if (sync.exists) {
        const s = sync.data();
        const data = s.data || {};
        if (data.hexworth_progress) {
            console.log('\n=== SYNC BLOB: hexworth_progress ===');
            try {
                const progress = JSON.parse(data.hexworth_progress);
                console.log('Top-level keys:', Object.keys(progress).join(', '));
                console.log('\ncompletedModules (' + (progress.completedModules || []).length + '):');
                (progress.completedModules || []).forEach(m => console.log('  ', m));

                // Show numeric keys
                const numericKeys = Object.keys(progress).filter(k => /^\d+$/.test(k));
                if (numericKeys.length > 0) {
                    console.log('\nNumeric keys:', numericKeys.join(', '));
                    numericKeys.forEach(k => {
                        const val = progress[k];
                        if (typeof val === 'object' && val !== null) {
                            console.log(`  ${k}:`, JSON.stringify(Object.keys(val).slice(0, 5)));
                        } else {
                            console.log(`  ${k}:`, val);
                        }
                    });
                }
            } catch (e) {
                console.log('Parse error:', e.message);
            }
        }

        if (data.hexworth_house_completions) {
            console.log('\n=== hexworth_house_completions ===');
            try {
                const hc = JSON.parse(data.hexworth_house_completions);
                console.log('Keys:', Object.keys(hc).join(', '));
                // Show a few values
                Object.entries(hc).slice(0, 5).forEach(([k, v]) => {
                    console.log(`  ${k}:`, JSON.stringify(v).substring(0, 200));
                });
            } catch (e) {
                console.log('Parse error:', e.message);
            }
        }
    }
}

main().catch(console.error).finally(() => setTimeout(() => process.exit(0), 2000));
