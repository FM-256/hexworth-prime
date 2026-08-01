#!/usr/bin/env node
'use strict';
// RETIRED 2026-07-31. This script no longer does anything. Do not revive it.
//
// It was a one-off to remove the capstone from hubRegistry/cloud-master sections.projects. The
// operator's ruling: there is ONE authorized Firestore delete process, and two paths to deleting
// data is one too many. So this is a stub rather than a second way in.
//
// The original is preserved verbatim (archived, byte-identical, verified by diff) at
//   _archive/retired-scripts/unregister-capstone-project.js.retired-2026-07-31
// and in git history. Nothing was destroyed to retire it -- the file was overwritten in place
// with this notice, which is why there is no rm or mv anywhere in this change.
//
// WHY IT WAS RETIRED RATHER THAN FIXED. It did a read-modify-write: read the whole array, filter
// it in memory, write the whole array back. The operator caught the hazard in that -- anything
// written to the array between the read and the write is silently overwritten by the stale copy,
// and nobody ever sees it happen. The replacement uses FieldValue.arrayRemove, which sends only
// the element being removed and therefore cannot clobber a concurrent addition.
//
// USE THIS INSTEAD:
//   node _tools/firestore/safe-delete.js \
//     --doc hubRegistry/cloud-master --field sections.projects \
//     --match href=/houses/cloud/openstack/labs/cloud-openstack-project-iac.lab.html
//
// Add --apply only with the operator's explicit authorization for that specific operation
// (CLAUDE.md rule 10). Without it the run reads, prints, and archives, and writes nothing.
console.error('RETIRED -- this script does nothing.');
console.error('');
console.error('Use the single authorized Firestore delete process:');
console.error('  node _tools/firestore/safe-delete.js \\');
console.error('    --doc hubRegistry/cloud-master --field sections.projects \\');
console.error('    --match href=/houses/cloud/openstack/labs/cloud-openstack-project-iac.lab.html');
console.error('');
console.error('Original archived at _archive/retired-scripts/unregister-capstone-project.js.retired-2026-07-31');
process.exit(2);
