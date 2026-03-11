const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();
const uid = 'fX0fezm1JMOnJXejsiGfbWJWbD62';

(async () => {
  const snap = await db.collection('users').doc(uid).collection('sync').doc('localStorage').get();
  if (!snap.exists) { console.log('No sync doc'); process.exit(0); }
  const data = snap.data().data || {};

  console.log('Keys in sync:\n' + Object.keys(data).join('\n'));

  console.log('\n=== hexworth_progress ===');
  if (data.hexworth_progress) {
    const progress = JSON.parse(data.hexworth_progress);
    for (const [house, modules] of Object.entries(progress)) {
      if (modules && typeof modules === 'object' && !Array.isArray(modules) && house !== 'houses' && house !== 'completionCounts') {
        const completed = Object.entries(modules).filter(([,v]) => v && v.completed);
        if (completed.length > 0) {
          console.log('\n' + house + ' (' + completed.length + ' completed):');
          completed.forEach(([id]) => console.log('  -', id));
        }
      }
    }
    if (progress.completedModules) console.log('\ncompletedModules:', progress.completedModules.length, 'items:', progress.completedModules);
    if (progress.xp) console.log('XP:', progress.xp);
    if (progress.level) console.log('Level:', progress.level);
  } else {
    console.log('No hexworth_progress in sync');
  }

  console.log('\n=== hexworth_arctic_progress ===');
  if (data.hexworth_arctic_progress) {
    console.log(data.hexworth_arctic_progress);
  } else {
    console.log('No arctic progress');
  }

  console.log('\n=== Other progress keys ===');
  if (data.hexworth_streak) console.log('Streak:', data.hexworth_streak);
  if (data.hexworth_modules_completed) console.log('Modules completed count:', data.hexworth_modules_completed);
  if (data.hexworth_completion_stamps) {
    const stamps = JSON.parse(data.hexworth_completion_stamps);
    const done = Object.entries(stamps).filter(([,v]) => v.completed);
    console.log('\nCompletion stamps (' + done.length + '):');
    done.forEach(([id]) => console.log('  -', id));
  }

  process.exit(0);
})();
