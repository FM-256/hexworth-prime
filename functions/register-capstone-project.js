// Registers the Cloud Master capstone in hubRegistry/cloud-master sections.projects.
//
// PRODUCTION FIRESTORE WRITE. Operator-authorized 2026-07-31 for this specific operation.
// Run with --apply; without it, this prints what it WOULD write and changes nothing.
//
// SEQUENCING (matters): the capstone page must be DEPLOYED first. The page is already live in
// an older form that lacks the "Record Baseline" button, and without that button check 27
// cannot pass — registering first would surface a lab a student cannot complete. Deploy, then
// register.
//
// TARGET VERIFICATION (the reason this file exists rather than a one-liner): an earlier attempt
// added these entries to _app/projects/ProjectsData.js, which is the PLATFORM Projects Hub —
// the wrong surface. The Cloud Master hub is a Firestore document; its sections.projects array
// is what the "Projects (0)" heading on /houses/hub/cloud-master reads. Confirmed by reading
// _app/houses/hub/index.html: typed sections are PROJECTED from ContentCatalog and Firestore
// sections are merged ADDITIVELY on top (`merged(s.projects, proj.projects)`), and the capstone
// is absent from ContentCatalog, so projection alone will never surface it.
const admin = require('firebase-admin');

const APPLY = process.argv.includes('--apply');
const DOC = 'hubRegistry/cloud-master';
const ENTRY = {
  // Item shape read from renderSection(): href / title / desc. A missing or unsafe href renders
  // a non-clickable div rather than a broken link.
  href: '/houses/cloud/openstack/labs/cloud-openstack-project-iac.lab.html',
  title: 'The Environment Is Data',
  desc: 'Capstone. Describe the stack you built by hand as a provider-neutral manifest, destroy every piece of it, then rebuild it from the description alone. The grader holds the pre-teardown resource IDs, so the rebuild must carry different ones: same shape, different identity.',
};

(async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
  const db = admin.firestore();
  const ref = db.doc(DOC);
  const snap = await ref.get();
  if (!snap.exists) { console.error(`FATAL: ${DOC} does not exist — refusing to create it`); process.exit(1); }

  const data = snap.data();
  const sections = data.sections && typeof data.sections === 'object' ? data.sections : {};
  const current = Array.isArray(sections.projects) ? sections.projects : [];

  console.log(`doc            : ${DOC}`);
  console.log(`label          : ${data.label}`);
  console.log(`projects (now) : ${current.length}`);
  if (current.some((p) => p && p.href === ENTRY.href)) {
    console.log('ALREADY REGISTERED — this exact href is present. Nothing to do.');
    process.exit(0);
  }
  const next = current.concat([ENTRY]);
  console.log(`projects (next): ${next.length}`);
  console.log(JSON.stringify(ENTRY, null, 2));

  if (!APPLY) { console.log('\nDRY RUN — pass --apply to write.'); process.exit(0); }

  // Merge-write only the one nested field, so nothing else on the document can be clobbered.
  await ref.update({ 'sections.projects': next });
  const after = (await ref.get()).data();
  const n = ((after.sections || {}).projects || []).length;
  console.log(`\nWROTE. projects now: ${n}`);
  if (n !== next.length) { console.error('MISMATCH after write — investigate'); process.exit(1); }
  console.log('verified by re-read.');
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
