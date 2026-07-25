// Firestore security-rules test for the hubRegistry collection (task #225, hub scaffolder).
// Run against the Firestore emulator:
//   firebase emulators:exec --only firestore --project=demo-hexworth \
//     "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/hub-registry-rules.test.js"
//
// Proves the two adversarial-review (Nancy R2) must-fixes:
//  C3 — the draft/published read gate is correct for BOTH get and list. Critically, a NON-ADMIN
//       UNCONSTRAINED list with a draft doc present must be DENIED WHOLESALE (Firestore proves every
//       returnable doc satisfies the rule, so it cannot post-filter) — a non-admin must query
//       where('status','==','published'); an admin may list unconstrained.
//  #5 — create rejects any doc id colliding with a reserved static HubRegistry.js id, so a dynamic
//       hub can never shadow a live hardcoded course. Plus a drift assertion: the reserved-id set in
//       firestore.rules must exactly equal HubRegistry.all() ids.
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, collection, query, where } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
const HubRegistry = require('../../_app/components/HubRegistry.js');

const PUB   = { id:'pub-alpha',   status:'published', category:'course', label:'Published Alpha',
  sublabel:'x', icon:'/assets/images/icons/icon-shield.webp', houseId:'observatory', sortOrder:900 };
const DRAFT = { id:'draft-beta',  status:'draft',     category:'course', label:'Draft Beta',
  sublabel:'y', icon:'/assets/images/icons/icon-shield.webp', houseId:'observatory', sortOrder:901 };
const NEWHUB = { id:'brand-new',  status:'draft',     category:'course', label:'Brand New',
  sublabel:'z', icon:'/assets/images/icons/icon-shield.webp', houseId:'shield', sortOrder:902 };

let pass = 0, fail = 0; const out = [];
async function ok(name, p){ try { await assertSucceeds(p); out.push(['PASS', name]); pass++; }
  catch(e){ out.push(['FAIL (expected ALLOW, got DENY)', name]); fail++; } }
async function no(name, p){ try { await assertFails(p); out.push(['PASS', name + ' [denied]']); pass++; }
  catch(e){ out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; } }
function assert(name, cond){ if (cond){ out.push(['PASS', name]); pass++; } else { out.push(['FAIL', name]); fail++; } }

(async () => {
  // ── #5 drift check (pure JS, no emulator): rules reserved set == HubRegistry ids ──
  const m = RULES.match(/hubId in \[([\s\S]*?)\]/);
  const reserved = m ? (m[1].match(/'[^']+'/g) || []).map(s => s.replace(/'/g, '')) : [];
  const staticIds = HubRegistry.all().map(h => h.id);
  const missing = staticIds.filter(id => !reserved.includes(id));
  const extra   = reserved.filter(id => !staticIds.includes(id));
  assert(`drift: rules reserved set (${reserved.length}) == HubRegistry ids (${staticIds.length}); ` +
    `missing=[${missing}] extra=[${extra}]`, missing.length === 0 && extra.length === 0);

  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-hexworth',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8181 },
  });
  const seed = () => testEnv.withSecurityRulesDisabled(async c => {
    const db = c.firestore();
    await setDoc(doc(db, 'hubRegistry/pub-alpha'), PUB);
    await setDoc(doc(db, 'hubRegistry/draft-beta'), DRAFT);
  });
  const admin = testEnv.authenticatedContext('adminUid', { email: 'f.mora80@gmail.com' }).firestore();
  const stu   = testEnv.authenticatedContext('stu1').firestore();
  const anon  = testEnv.unauthenticatedContext().firestore();

  await seed();

  // ── C3 READ — single-doc get ──
  await ok('get published hub (student)',        getDoc(doc(stu,  'hubRegistry/pub-alpha')));
  await ok('get published hub (anon)',           getDoc(doc(anon, 'hubRegistry/pub-alpha')));
  await no('get DRAFT hub (student)',            getDoc(doc(stu,  'hubRegistry/draft-beta')));
  await no('get DRAFT hub (anon)',               getDoc(doc(anon, 'hubRegistry/draft-beta')));
  await ok('get DRAFT hub (admin — preview)',    getDoc(doc(admin,'hubRegistry/draft-beta')));

  // ── C3 READ — list query (the linchpin) ──
  await ok('list CONSTRAINED where(status==published) (student)',
    getDocs(query(collection(stu, 'hubRegistry'), where('status', '==', 'published'))));
  await no('list UNCONSTRAINED with a draft present (student) — whole query denied',
    getDocs(collection(stu, 'hubRegistry')));
  await no('list where(status==draft) (student) — cannot enumerate drafts',
    getDocs(query(collection(stu, 'hubRegistry'), where('status', '==', 'draft'))));
  await ok('list UNCONSTRAINED (admin)',         getDocs(collection(admin, 'hubRegistry')));

  // Verify the constrained student list returns ONLY the published doc (no draft leak).
  const stuList = await getDocs(query(collection(stu, 'hubRegistry'), where('status', '==', 'published')));
  const stuIds = stuList.docs.map(d => d.id);
  assert(`constrained student list returns only published [${stuIds}]`,
    stuIds.length === 1 && stuIds[0] === 'pub-alpha');

  // ── #5 CREATE — admin only, reserved static ids rejected ──
  await ok('admin creates a fresh non-reserved hub',
    setDoc(doc(admin, 'hubRegistry/brand-new'), NEWHUB));
  await no('admin CANNOT create a hub that shadows a reserved static id (aplus-core1)',
    setDoc(doc(admin, 'hubRegistry/aplus-core1'), { ...NEWHUB, id:'aplus-core1' }));
  await no('admin CANNOT shadow another reserved static id (security-plus)',
    setDoc(doc(admin, 'hubRegistry/security-plus'), { ...NEWHUB, id:'security-plus' }));
  await no('student creates a hub (denied — admin only)',
    setDoc(doc(stu, 'hubRegistry/stu-hub'), NEWHUB));
  await no('anon creates a hub (denied)',
    setDoc(doc(anon, 'hubRegistry/anon-hub'), NEWHUB));

  // ── UPDATE / DELETE — admin only (publish toggle lives here) ──
  await seed();
  await ok('admin publishes a draft (status draft->published)',
    updateDoc(doc(admin, 'hubRegistry/draft-beta'), { status:'published', publishedAt: 1 }));
  await seed();
  await no('student cannot update a hub',
    updateDoc(doc(stu, 'hubRegistry/pub-alpha'), { status:'draft' }));
  await no('student cannot unpublish (tamper) a hub',
    updateDoc(doc(stu, 'hubRegistry/pub-alpha'), { label:'Pwned' }));
  await ok('admin deletes a hub', deleteDoc(doc(admin, 'hubRegistry/pub-alpha')));
  await seed();
  await no('student cannot delete a hub', deleteDoc(doc(stu, 'hubRegistry/pub-alpha')));

  console.log('\n=== hubRegistry rules test (task #225 — draft/published gate + reserved-id) ===');
  out.forEach(r => console.log('  ' + r[0].padEnd(34) + r[1]));
  console.log(`\n${pass} passed, ${fail} failed`);
  await testEnv.cleanup();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST HARNESS ERROR:', e); process.exit(2); });
