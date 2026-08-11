// Temp verification: reads the PRODUCTION flag_registry doc and simulates
// validateFlag's exact compare (index.js:220/228/247) for the natural student
// submission of each flag on dark-arts-ceh-01-recon. Non-destructive (read-only).
const admin = require('firebase-admin');
try { admin.initializeApp(); } catch (e) {}
const db = admin.firestore();
(async () => {
  const doc = await db.doc('flag_registry/dark-arts-ceh-01-recon').get();
  if (!doc.exists) { console.log('DOC MISSING'); process.exit(1); }
  const flags = doc.data().flags || {};
  const submissions = {
    registrar_iana_id: '299',
    primary_nameserver: 'NS1.meridiantech-corp.example',   // upper-case: tests case-insensitivity
    mail_server_ip: '198.51.100.25',
    vpn_cname_target: 'edge.cloudhost-dns.example',
    internal_ci_host: 'jenkins-ci.dev.meridiantech-corp.example'
  };
  let allOk = true;
  for (const [fid, sub] of Object.entries(submissions)) {
    const stored = flags[fid];
    const ok = sub.trim().toLowerCase() === String(stored).trim().toLowerCase();
    if (!ok) allOk = false;
    console.log((ok ? 'ACCEPT' : 'REJECT'), fid, '| submit', JSON.stringify(sub), '=> stored', JSON.stringify(stored));
  }
  const dotted = 'ns1.meridiantech-corp.example.';
  console.log('\n[friction] dotted', JSON.stringify(dotted), '=>',
    (dotted.trim().toLowerCase() === flags.primary_nameserver.trim().toLowerCase()
      ? 'ACCEPT' : 'REJECT (student guided to drop the dot; backlog: FQDN dot-tolerance)'));
  console.log('\n' + (allOk ? '>>> ALL 5 FLAGS VALIDATE SERVER-SIDE (production doc + real compare)' : '>>> FAIL'));
  process.exit(allOk ? 0 : 1);
})();
