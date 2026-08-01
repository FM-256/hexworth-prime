#!/usr/bin/env node
'use strict';
// WHICH POOL SLOTS ARE SAFE TO RECLAIM? Identity first, resources second.
//
// WHY THIS EXISTS. reclaim-idle-slots.py decides safety from RESOURCES ALONE: a slot with no
// application credentials, no servers and no volumes is called reclaimable. Nancy showed that
// test cannot tell a dead slot from a live student mid-lab:
//
//   IDLE_TIMEOUT is 15 minutes, and container teardown calls deleteBridgeCred(), which is what
//   zeroes `creds`. So creds==0 means "no container in the last 15 minutes", NOT "nobody is
//   working here". The capstone's own destroy -> rebuild gap is exactly the pause that runs past
//   15 minutes while a student reads the next step or troubleshoots an error. Reclaiming there
//   would release a live student's binding mid-lab.
//
// The stronger signal is IDENTITY, and it is independent of the timing question entirely:
//   * a uid that resolves to a @hexworth-smoke.local account is QC debris by construction
//   * a uid that resolves to NO Firebase user at all can never authenticate again, so nothing
//     can ever come back for that slot
// Either of those is safe regardless of what the 15-minute window says. The resource test then
// applies ONLY to uids that are real, live, non-QC accounts -- the small set where timing
// actually matters.
//
// THIS SCRIPT ONLY CLASSIFIES. It writes an allowlist and touches nothing. Reclaiming is a
// separate, explicitly authorized step, because releasing a pool binding is a production state
// change on shared infrastructure.
//
// usage:
//   node _tools/firestore/classify-pool-uids.js <pool.json>
// where pool.json is [{slot, project_id, uid}, ...] as produced on bc2 from claim_service.
const fs = require('fs');
const path = require('path');

const IN = process.argv[2];
if (!IN || !fs.existsSync(IN)) {
  console.error('usage: node _tools/firestore/classify-pool-uids.js <pool.json>');
  process.exit(2);
}

let admin;
try {
  admin = require(path.resolve(__dirname, '../../functions/node_modules/firebase-admin'));
} catch (e) {
  console.error('cannot load firebase-admin from functions/node_modules');
  process.exit(2);
}
// Credential must be passed EXPLICITLY. A bare initializeApp({projectId}) gave
// auth/internal-error on all 29 lookups -- the Auth Admin API needs a real credential, not just a
// project id. functions/register-capstone-project.js uses applicationDefault() for the same
// reason, and ~/.config/gcloud/application_default_credentials.json is what backs it.
// The identitytoolkit API additionally requires a QUOTA PROJECT, which local ADC does not set by
// default -- without it every lookup returns a 403 wrapped as auth/internal-error, which looks
// like a code bug and is not one. Set it here so the tool works from a normal shell rather than
// requiring the operator to mutate their gcloud config.
if (!process.env.GOOGLE_CLOUD_QUOTA_PROJECT) {
  process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';
}
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'hexworth-prime' });
}

const QC_DOMAIN = '@hexworth-smoke.local';

(async () => {
  const pool = JSON.parse(fs.readFileSync(IN, 'utf8'));
  const bound = pool.filter((p) => p.uid);
  console.log(`  pool: ${pool.length} slots, ${bound.length} bound, ${pool.length - bound.length} free\n`);

  const rows = [];
  for (const p of bound) {
    let verdict, detail;
    try {
      const u = await admin.auth().getUser(p.uid);
      const email = u.email || '(no email)';
      if (email.endsWith(QC_DOMAIN)) { verdict = 'QC'; detail = email; }
      else { verdict = 'REAL'; detail = email; }
    } catch (e) {
      // auth/user-not-found means nobody can ever sign in as this uid again.
      verdict = (e && e.code === 'auth/user-not-found') ? 'DEAD' : 'ERROR';
      detail = (e && e.code) || String(e).slice(0, 60);
    }
    rows.push({ ...p, verdict, detail });
    console.log(`  ${p.slot.padEnd(12)} ${String(verdict).padEnd(6)} ${detail}`);
  }

  const safe = rows.filter((r) => r.verdict === 'QC' || r.verdict === 'DEAD');
  const real = rows.filter((r) => r.verdict === 'REAL');
  const err = rows.filter((r) => r.verdict === 'ERROR');

  console.log(`\n  SAFE on identity alone : ${safe.length}  (QC accounts + uids no Firebase user can claim)`);
  console.log(`  REAL accounts          : ${real.length}  <- resource test applies here, and ONLY here`);
  if (err.length) { console.log(`  ERRORS                 : ${err.length}  <- treat as REAL, never reclaim on an error`); }

  // A run that resolved nothing must say so rather than emitting an empty allowlist that
  // reads like "nothing to do".
  if (!bound.length) {
    console.error('\n  no bound slots examined -- this classified NOTHING. Not writing an allowlist.');
    process.exit(2);
  }

  const outDir = path.resolve(__dirname, '../../_archive/pool-classification');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'pool-classification.json');
  fs.writeFileSync(out, JSON.stringify({ examined: bound.length, rows, safeToReclaim: safe }, null, 2));
  console.log(`\n  written: ${path.relative(process.cwd(), out)}`);
  console.log('  NOTHING WAS RECLAIMED. This script only classifies.');
  process.exit(0);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
