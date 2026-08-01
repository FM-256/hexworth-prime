// Exercise the once-per-reason logic against the Firestore emulator.
// Two fixtures, per the rule: the SAME reason twice must dedup; a DIFFERENT reason must award.
// A guard that blocks everything would pass a "does it dedup" test while breaking the feature.
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
(async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-hexworth', firestore: { host: '127.0.0.1', port: 8181 } });
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const ref = db.doc('users/probe-uid');
    await ref.set({ xpHistory: [] });

    // the CF's logic, transcribed exactly
    async function addXP(amount, reason) {
      const snap = await ref.get();
      const history = (snap.exists && snap.data().xpHistory) || [];
      if (history.some(e => e && e.reason === reason)) return { added: 0, deduped: true };
      await ref.update({ xpHistory: [...history, { amount, reason, timestamp: new Date().toISOString() }] });
      return { added: amount };
    }

    const r1 = await addXP(50, 'Cipher Cracker Complete');
    const r2 = await addXP(50, 'Cipher Cracker Complete');   // replay
    const r3 = await addXP(35, 'STRIDE Threat Modeler - Payments');  // different work
    const final = (await ref.get()).data().xpHistory;
    const total = final.reduce((s, e) => s + e.amount, 0);

    console.log('  first award (new reason)      :', JSON.stringify(r1));
    console.log('  replay  (same reason)         :', JSON.stringify(r2));
    console.log('  different work (new reason)   :', JSON.stringify(r3));
    console.log('  xpHistory entries             :', final.length, ' total XP:', total);
    const pass = r1.added === 50 && r2.added === 0 && r2.deduped && r3.added === 35 && final.length === 2 && total === 85;
    console.log('\n  ' + (pass ? 'PASS -- replay blocked, distinct work still earns' : 'FAIL'));
    process.exitCode = pass ? 0 : 1;
  });
  await env.cleanup();
})();
