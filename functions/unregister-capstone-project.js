// Removes the Cloud Master capstone from hubRegistry/cloud-master sections.projects.
//
// PRODUCTION FIRESTORE WRITE. NOT YET AUTHORIZED. Run with --apply only after the operator has
// authorized THIS specific operation in chat (CLAUDE.md rule 10). Without --apply it prints what
// it WOULD remove and changes nothing.
//
// WHY THIS EXISTS -- the exact inverse of register-capstone-project.js, and that file's own
// header explains how the duplicate happened without anyone being careless:
//
//     "the capstone is absent from ContentCatalog, so projection alone will never surface it"
//
// That was TRUE when it was written. Registering the capstone into sections.projects was then the
// only way to surface it at all. Hours later a ContentCatalog entry was added (e608ebd47), which
// made the projection surface it too -- under Labs, because the catalog types it
// components:['lab']. Two correct decisions, made in sequence, produced one wrong page: the same
// lab rendering twice with different authored copy.
//
// WHY REMOVE THE CURATED ENTRY RATHER THAN THE CATALOG ENTRY. The operator's rule: if it is a lab
// it cannot be a project. Every piece of data says LAB --
//     it lives in   houses/cloud/openstack/labs/
//     it is named   cloud-openstack-project-iac.lab.html
//     it is typed   components: ['lab']
// The Projects shelf was being used as a "featured" mechanism, not a type. Removing the curated
// entry leaves the capstone showing exactly once, under Labs, where all three agree.
//
// WHAT THIS DELIBERATELY DOES NOT DO. It does not delete the lab, the catalog entry, or the page.
// It removes ONE array element from ONE nested field. The Cloud Master Projects shelf will then
// read 0 -- which is TRUE: no project has been built for this house yet. An empty shelf that is
// accurate beats a populated shelf that is not. (P2 "Survive the Drift" is designed and unbuilt,
// _app/projects/ProjectsData.js -> cloud-openstack-iac-harden.)
//
// PAIRS WITH the cross-section de-dup fix in _app/houses/hub/index.html. That fix is the general
// guard for any future curated/catalogued collision; this removes the one that exists today.
// Shipping the de-dup ALONE would be worse than the duplicate: curated-wins would keep the
// mislabelled Projects card and drop the honest Labs one.
const admin = require('firebase-admin');

const APPLY = process.argv.includes('--apply');
const HREF = '/houses/cloud/openstack/labs/cloud-openstack-project-iac.lab.html';

if (!admin.apps.length) { admin.initializeApp(); }
const db = admin.firestore();

(async () => {
  const ref = db.collection('hubRegistry').doc('cloud-master');
  const snap = await ref.get();
  if (!snap.exists) { console.error('hubRegistry/cloud-master does not exist'); process.exit(1); }

  const data = snap.data() || {};
  const current = ((data.sections || {}).projects) || [];
  console.log(`projects (current): ${current.length}`);
  current.forEach((it, i) => console.log(`  [${i}] ${it && it.title} -> ${it && it.href}`));

  const next = current.filter((it) => !(it && it.href === HREF));
  if (next.length === current.length) {
    console.log('\nNOT PRESENT -- this href is not in sections.projects. Nothing to do.');
    process.exit(0);
  }
  const removed = current.filter((it) => it && it.href === HREF);
  console.log(`\nwould remove ${removed.length} entry(s) matching:\n  ${HREF}`);
  console.log(`projects (next): ${next.length}`);

  // WE DO NOT DESTROY -- ARCHIVE FIRST. Operator rule. A Firestore array element has no
  // recycle bin: once the merge-write lands, the authored title/description are gone and the
  // only way back is retyping them from memory. So the exact entries are written to disk and
  // read back BEFORE anything is removed, and a failure to archive aborts the removal.
  const fs = require('fs');
  const path = require('path');
  const dir = path.resolve(__dirname, '../_archive/firestore-hubregistry');
  const out = path.join(dir, 'cloud-master.sections.projects.removed.json');
  const payload = {
    archivedFrom: 'hubRegistry/cloud-master -> sections.projects',
    reason: 'capstone is a LAB (labs/ dir, .lab.html, components:[lab]); the Projects shelf was '
          + 'being used as a featured mechanism, not a type. Removed so it renders once, under Labs.',
    restoreWith: 'node functions/register-capstone-project.js --apply',
    entriesRemoved: removed,
    sectionsProjectsBefore: current,
    sectionsProjectsAfter: next,
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  const readBack = JSON.parse(fs.readFileSync(out, 'utf8'));
  if (!Array.isArray(readBack.entriesRemoved) || readBack.entriesRemoved.length !== removed.length) {
    console.error('ARCHIVE VERIFY FAILED -- nothing removed.'); process.exit(1);
  }
  console.log(`\nARCHIVED to ${path.relative(process.cwd(), out)} (${removed.length} entry(s), read back and verified)`);

  if (!APPLY) { console.log('\nDRY RUN -- pass --apply to write. Requires operator authorization.'); process.exit(0); }

  // Merge-write only the one nested field, so nothing else on the document can be clobbered.
  await ref.update({ 'sections.projects': next });
  const after = (await ref.get()).data();
  const n = (((after || {}).sections || {}).projects || []).length;
  console.log(`\nWROTE. projects now: ${n}`);
  if (n !== next.length) { console.error('MISMATCH after write -- investigate'); process.exit(1); }
  console.log('verified by re-read.');
  console.log('\nNEXT: deploy the de-dup fix, then confirm with');
  console.log('  BASE=https://hexworth.com node _tools/eduscan/smoke/hub-dedup-probe.js');
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
