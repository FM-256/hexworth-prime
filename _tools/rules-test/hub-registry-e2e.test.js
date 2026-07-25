// End-to-end for the hub scaffolder (task #225, step 6): the ACTUAL admin-written doc shape ->
// rules -> HubRegistry.allWithDynamic() (what the renderer/consumers read), across the
// draft -> published transition. Proves the full "create -> invisible to non-admin -> publish ->
// visible" loop against the real firestore rules, not synthetic booleans.
//   firebase emulators:exec --only firestore --project=demo-hexworth \
//     "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/hub-registry-e2e.test.js"
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
const HubRegistry = require('../../_app/components/HubRegistry.js');

// The exact shape saveHub (console.html) writes.
function makeHub(id, status) {
  return {
    id: id, category: 'course', label: id, sublabel: '', catalogCode: null,
    icon: '/assets/images/icons/hexworth-mark.webp', houseId: 'observatory',
    hubHref: '/houses/hub/' + id, tenantAssignable: true, sortOrder: 200, status: status,
    sections: { slides: [], labs: [], quizzes: [], exams: [], projects: [], games: [] },
    path: null, createdBy: 'adminUid', createdAt: { seconds: 1, nanoseconds: 0 }, publishedAt: null
  };
}
// modular-firestore surface allWithDynamic() expects
function fsMod() { return { collection: collection, query: query, where: where, getDocs: getDocs }; }

let pass = 0, fail = 0; const out = [];
const check = (n, c) => { out.push([c ? 'PASS' : 'FAIL', n]); c ? pass++ : fail++; };
const succeeds = async (p) => { try { await p; return true; } catch (e) { return false; } };
const fails = async (p) => { try { await p; return false; } catch (e) { return true; } };

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-hexworth', firestore: { rules: RULES, host: '127.0.0.1', port: 8181 },
  });
  const seed = () => env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, 'hubRegistry/dyn-draft'), makeHub('dyn-draft', 'draft'));
    await setDoc(doc(db, 'hubRegistry/dyn-pub'), makeHub('dyn-pub', 'published'));
  });
  await seed();
  const admin = env.authenticatedContext('adminUid', { email: 'f.mora80@gmail.com' }).firestore();
  const stu = env.authenticatedContext('stu1').firestore();
  const staticN = HubRegistry.all().length;

  // ── single-doc visibility ──
  check('student get(draft) DENIED (invisible)', await fails(getDoc(doc(stu, 'hubRegistry/dyn-draft'))));
  check('student get(published) OK', await succeeds(getDoc(doc(stu, 'hubRegistry/dyn-pub'))));
  check('admin get(draft) OK (preview)', await succeeds(getDoc(doc(admin, 'hubRegistry/dyn-draft'))));

  // ── unauthenticated tourist (AccessGuard 'sorted' TouristVisa is decoupled from Firebase Auth,
  //    so a house-page visitor may have NO Firebase session) — this is the exact HubDiscovery read
  //    path, so it must work for request.auth == null. ──
  const anon = env.unauthenticatedContext().firestore();
  check('anon get(published) OK', await succeeds(getDoc(doc(anon, 'hubRegistry/dyn-pub'))));
  check('anon get(draft) DENIED', await fails(getDoc(doc(anon, 'hubRegistry/dyn-draft'))));
  check('anon constrained list where(status==published) OK (HubDiscovery query)',
    await succeeds(getDocs(query(collection(anon, 'hubRegistry'), where('status', '==', 'published')))));
  check('anon UNconstrained list DENIED (draft would leak)',
    await fails(getDocs(collection(anon, 'hubRegistry'))));

  // ── allWithDynamic (what consumers/renderer read) ──
  const mStu = await HubRegistry.allWithDynamic({ db: stu, firestore: fsMod(), isAdmin: false });
  const idsStu = mStu.map((h) => h.id);
  check('allWithDynamic(student) includes published dynamic', idsStu.indexOf('dyn-pub') !== -1);
  check('allWithDynamic(student) EXCLUDES draft dynamic', idsStu.indexOf('dyn-draft') === -1);
  check('allWithDynamic(student) keeps all ' + staticN + ' static hubs',
    mStu.filter((h) => HubRegistry.byId(h.id)).length === staticN);
  check('allWithDynamic(student) every entry has status',
    mStu.every((h) => h.status === 'published'));  // static normalized + only-published dynamic

  const mAdm = await HubRegistry.allWithDynamic({ db: admin, firestore: fsMod(), isAdmin: true });
  const idsAdm = mAdm.map((h) => h.id);
  check('allWithDynamic(admin) includes draft', idsAdm.indexOf('dyn-draft') !== -1);
  check('allWithDynamic(admin) includes published', idsAdm.indexOf('dyn-pub') !== -1);

  // ── the publish transition ──
  await updateDoc(doc(admin, 'hubRegistry/dyn-draft'), { status: 'published', publishedAt: { seconds: 2, nanoseconds: 0 } });
  check('after publish: student get(formerly-draft) OK', await succeeds(getDoc(doc(stu, 'hubRegistry/dyn-draft'))));
  const m2 = await HubRegistry.allWithDynamic({ db: stu, firestore: fsMod(), isAdmin: false });
  check('after publish: allWithDynamic(student) now includes it', m2.map((h) => h.id).indexOf('dyn-draft') !== -1);

  // ── unpublish transition (reverse) ──
  await updateDoc(doc(admin, 'hubRegistry/dyn-pub'), { status: 'draft', publishedAt: null });
  check('after unpublish: student get DENIED again', await fails(getDoc(doc(stu, 'hubRegistry/dyn-pub'))));

  console.log('\n=== hub e2e (create -> invisible -> publish -> visible + allWithDynamic) ===');
  out.forEach((r) => console.log('  ' + r[0].padEnd(6) + r[1]));
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  await env.cleanup();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('HARNESS ERROR:', e); process.exit(2); });
