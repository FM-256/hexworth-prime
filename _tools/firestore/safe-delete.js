#!/usr/bin/env node
'use strict';
// THE ONLY AUTHORIZED FIRESTORE DELETE PROCESS.
//
// Operator ruling 2026-07-31. Nothing removes data from Firestore except this script, for the
// same reason `rm` and `mv` are blocked in the permission deny-list: a delete that looks routine
// is how unrepairable damage happens. This exists so the safe path is also the easy path.
//
// FOUR PROPERTIES, each of which came from a specific thing that went wrong:
//
// 1. SURGICAL, NEVER READ-MODIFY-WRITE. It uses FieldValue.arrayRemove(exactObject), which sends
//    only the element to remove. The rejected alternative was: read the array, filter it in
//    memory, write the whole array back. That has a window -- anything written to the array
//    between the read and the write is silently overwritten by the stale copy, and nobody ever
//    sees it happen. arrayRemove cannot clobber a concurrent addition because it never sends the
//    other elements.
//
// 2. FAILS SAFE ON AMBIGUITY. arrayRemove only matches a DEEP-EQUAL object. If the match is not
//    exactly one element, this refuses and removes nothing, rather than guessing which was meant.
//
// 3. ARCHIVE FIRST, VERIFIED, OR NOTHING HAPPENS. The archive is written from what the live read
//    ACTUALLY RETURNED -- never from what the caller believes is there -- then read back off disk
//    and deep-compared before any write is attempted. Firestore has no recycle bin: once the
//    write lands, hand-authored copy is gone and the only way back is retyping it from memory.
//    This mirrors the file rule (cp, verify, and only then consider the original -- never mv).
//
// 4. DRY RUN BY DEFAULT. --apply is required to write, and per CLAUDE.md rule 10 the operator
//    must authorize that specific operation in chat. The dry run still produces the archive, so
//    the archive can be inspected before anything is committed to.
//
// usage:
//   node _tools/firestore/safe-delete.js --doc <collection/docId> --field <a.b.c> \
//        --match <key>=<value> [--apply]
//
// example (the case this was built for):
//   node _tools/firestore/safe-delete.js \
//     --doc hubRegistry/cloud-master --field sections.projects \
//     --match href=/houses/cloud/openstack/labs/cloud-openstack-project-iac.lab.html
const fs = require('fs');
const path = require('path');

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i !== -1 ? process.argv[i + 1] : null;
}
const APPLY = process.argv.includes('--apply');
const DOC = arg('doc');
const FIELD = arg('field');
const MATCH = arg('match');

if (!DOC || !FIELD || !MATCH || DOC.split('/').length !== 2 || MATCH.indexOf('=') === -1) {
  console.error('usage: node _tools/firestore/safe-delete.js --doc <collection/docId> '
    + '--field <a.b.c> --match <key>=<value> [--apply]');
  process.exit(2);
}
const [COLL, ID] = DOC.split('/');
const MKEY = MATCH.slice(0, MATCH.indexOf('='));
const MVAL = MATCH.slice(MATCH.indexOf('=') + 1);

// firebase-admin is required AFTER argument validation, and resolved from functions/node_modules
// because that is where the dependency is installed -- this tool lives in _tools/. Requiring it
// at the top meant a usage mistake produced a MODULE_NOT_FOUND stack trace instead of the usage
// line, i.e. the tool failed to explain itself in exactly the situation where that matters.
let admin;
try {
  admin = require(path.resolve(__dirname, '../../functions/node_modules/firebase-admin'));
} catch (e) {
  console.error('cannot load firebase-admin from functions/node_modules -- run `npm install` in functions/');
  process.exit(2);
}

// projectId is pinned EXPLICITLY. A bare initializeApp() resolves the project from ambient
// credentials, which is how a script writes to whatever project happens to be configured
// instead of the one it names.
if (!admin.apps.length) { admin.initializeApp({ projectId: 'hexworth-prime' }); }
const db = admin.firestore();

// Walk a dotted path without eval and without assuming any level exists.
function dig(obj, dotted) {
  return dotted.split('.').reduce(function (o, k) {
    return (o && typeof o === 'object') ? o[k] : undefined;
  }, obj);
}

(async () => {
  const ref = db.collection(COLL).doc(ID);
  const snap = await ref.get();
  if (!snap.exists) { console.error(`${DOC} does not exist -- nothing to do.`); process.exit(1); }

  const data = snap.data() || {};
  const arr = dig(data, FIELD);
  if (!Array.isArray(arr)) {
    console.error(`${DOC} field '${FIELD}' is not an array (got ${typeof arr}). `
      + 'This tool only removes ARRAY ELEMENTS -- it will not delete a field or a document.');
    process.exit(1);
  }

  console.log(`${DOC} -> ${FIELD}  (${arr.length} element(s))`);
  arr.forEach((it, i) => {
    const mark = (it && it[MKEY] === MVAL) ? '>>' : '  ';
    console.log(`  ${mark} [${i}] ${JSON.stringify(it).slice(0, 150)}`);
  });

  const matches = arr.filter((it) => it && it[MKEY] === MVAL);
  if (matches.length === 0) {
    console.log(`\nNO MATCH for ${MKEY}=${MVAL}. Nothing to do.`);
    process.exit(0);
  }
  if (matches.length > 1) {
    console.error(`\nAMBIGUOUS: ${matches.length} elements match ${MKEY}=${MVAL}. `
      + 'Refusing to guess which was meant. Nothing removed.');
    process.exit(1);
  }
  const target = matches[0];
  console.log(`\nWILL REMOVE exactly 1 element:\n${JSON.stringify(target, null, 2)}`);

  // ── Archive, from what the LIVE READ returned, then verify off disk ──────────────────
  const stamp = DOC.replace('/', '.') + '.' + FIELD;
  const dir = path.resolve(__dirname, '../../_archive/firestore-deletes');
  const out = path.join(dir, stamp + '.removed.json');
  const payload = {
    doc: DOC, field: FIELD, match: { key: MKEY, value: MVAL },
    removedElement: target,
    fieldBefore: arr,
    restoreNote: 'Re-add removedElement with FieldValue.arrayUnion, or re-run the original '
      + 'registration script if one exists.',
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  const back = JSON.parse(fs.readFileSync(out, 'utf8'));
  if (JSON.stringify(back.removedElement) !== JSON.stringify(target)
      || !Array.isArray(back.fieldBefore) || back.fieldBefore.length !== arr.length) {
    console.error('\nARCHIVE VERIFY FAILED -- nothing removed.'); process.exit(1);
  }
  console.log(`\nARCHIVED  ${path.relative(process.cwd(), out)}`);
  console.log('          (written from the live read, read back off disk, deep-compared)');

  if (!APPLY) {
    console.log('\nDRY RUN -- nothing written. Pass --apply to remove.');
    console.log('Per CLAUDE.md rule 10 this needs the operator to authorize THIS operation in chat.');
    process.exit(0);
  }

  // ── The delete. Surgical: only the matched element is sent. ──────────────────────────
  await ref.update({ [FIELD]: admin.firestore.FieldValue.arrayRemove(target) });

  const after = dig((await ref.get()).data() || {}, FIELD) || [];
  console.log(`\nREMOVED. ${FIELD} now has ${after.length} element(s) (was ${arr.length}).`);
  if (after.length !== arr.length - 1) {
    console.error('UNEXPECTED count after write -- investigate before doing anything else.');
    process.exit(1);
  }
  console.log('verified by re-read.');
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
