// Put the three Cloud Master projects on the hub's Projects shelf.
// AUTHORISED BY THE OPERATOR, verbatim: "we made 3 projects yesterday they should be listed in the
// cloudmaster project area get them there"
//
// ADDITIVE ONLY. This writes sections.projects and touches nothing else. It archives the current
// value first and verifies the archive before writing, same order safe-delete.js uses.
//
// NO HREF ON ANY CARD, deliberately, and this is the one judgement call in here:
//   P1 "The Environment Is Data" -- its only page is the LAB, which already renders under Labs from
//      the catalog projection. The cross-section dedup drops a curated card whose href was already
//      placed in an earlier section, so giving P1 the lab href makes it silently disappear -- the
//      exact double-render bug that was fixed. It is also the taxonomy point the operator raised:
//      a lab is not a project.
//   P2/P3 -- designed, not built. hasPage:false in ProjectsData.js. A card linking to a page that
//      does not exist 404s, and a 404 card is worse than an absent one.
// renderSection() creates a <div> instead of an <a> when there is no href, so all three list with
// title and description and none of them lie about being openable.
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'hexworth-prime' });
const db = admin.firestore();
const DOC = 'hubRegistry/cloud-master';
const APPLY = process.argv.includes('--apply');

const ITEMS = [
  { title: 'The Environment Is Data',
    desc: 'Capstone. Describe the stack you built by hand as a provider-neutral manifest, destroy every piece of it, then rebuild it from the description alone. The grader holds the pre-teardown resource IDs, so the rebuild must carry different ones: same shape, different identity. Open it from the Labs shelf.' },
  { title: 'Survive the Drift',
    desc: 'Take the applier you wrote and make it hold a line. Run it twice and nothing changes; break a resource by hand and it puts the environment back. Designed, not yet open.' },
  { title: 'Same Intent, Different Cloud',
    desc: 'Your manifest describes intent, not API calls, so port it. Map your size classes and network shapes onto a second provider primitives, with a dry-run adapter that proves the mapping holds. Designed, not yet open.' },
];

(async () => {
  const ref = db.doc(DOC);
  const snap = await ref.get();
  if (!snap.exists) { console.error('  REFUSED: ' + DOC + ' does not exist.'); process.exit(1); }
  const before = (snap.data().sections || {}).projects || [];
  console.log('  BEFORE: sections.projects = ' + before.length + ' item(s)');
  before.forEach(i => console.log('     - ' + (i.title || i.href || '?')));

  const dir = path.resolve(__dirname, '../_archive/firestore-writes');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'hubRegistry.cloud-master.sections.projects.before-add.json');
  fs.writeFileSync(out, JSON.stringify({ doc: DOC, field: 'sections.projects', before }, null, 2));
  const back = JSON.parse(fs.readFileSync(out, 'utf8'));
  if (JSON.stringify(back.before) !== JSON.stringify(before)) {
    console.error('  ARCHIVE VERIFY FAILED -- nothing written.'); process.exit(1);
  }
  console.log('  ARCHIVED ' + path.relative(process.cwd(), out));

  console.log('\n  WOULD WRITE ' + ITEMS.length + ' item(s):');
  ITEMS.forEach(i => console.log('     - ' + i.title + '   [no href: renders as a non-clickable card]'));

  if (!APPLY) { console.log('\n  DRY RUN. Re-run with --apply to write.'); process.exit(0); }

  await ref.update({ 'sections.projects': ITEMS });
  const after = ((await ref.get()).data().sections || {}).projects || [];
  console.log('\n  AFTER: sections.projects = ' + after.length + ' item(s)');
  after.forEach(i => console.log('     - ' + i.title));
  console.log(after.length === ITEMS.length ? '\n  WRITE VERIFIED.' : '\n  MISMATCH -- check the doc.');
  process.exit(0);
})().catch(e => { console.error('  ERROR: ' + e.message); process.exit(1); });
