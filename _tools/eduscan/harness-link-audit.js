#!/usr/bin/env node
'use strict';
// A LAB THAT IS BUILT AND GATED MUST ALSO BE REACHABLE.
//
// WHY THIS EXISTS. On 2026-08-01 the Stage 4 OpenStack capstone was found with a finished
// page, BOTH QC harnesses (walkthrough-project.js + adversarial-project.js), a coverage-gated
// `project` mode in qc-lab.sh, and a ContentCatalog entry -- and ZERO links from its hub. Every
// one of its five sibling live labs had exactly one. It was built, gated, and unreachable, and
// it was found by hand rather than by any tool.
//
// The invariant this encodes is narrow on purpose:
//     a lab PAGE that exists AND has a walkthrough harness MUST have >= 1 inbound hub link.
//
// THE DISTINCTION THAT MAKES IT USABLE. `wall` (Lab 2, "Read the Wall") has both harnesses and
// NO page, deliberately: taskboard #251 records that error-reading labs cannot be graded to the
// Lab 1 bar, its checks 7-9 sit inert on bc1, and the harnesses were kept as the record. It is
// also absent from qc-lab.sh's mode list. A check that flagged that would be crying wolf about a
// decision someone already made, and would train everyone to ignore it.
//   HELD      harness exists, page does NOT exist   -> reported, never fails the build
//   ORPHANED  harness exists, page EXISTS, 0 links  -> FAILS
//
// usage: node _tools/eduscan/harness-link-audit.js [--json]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const HARNESS_DIR = path.join(ROOT, '_tools/openstack-bridge');
const LAB_DIR = path.join(ROOT, '_app/houses/cloud/openstack/labs');
// HUB_OVERRIDE exists so this audit can be tested against a hub file with the links REMOVED,
// without ever mutating _app. That matters twice over: _app is what deploy.sh ships, so editing
// it to test a tool is how a test artifact reaches production, and a check nobody has watched
// FAIL is not known to work. Proving this one fires is the whole reason it is trustworthy.
const HUB = process.env.HUB_OVERRIDE || path.join(ROOT, '_app/houses/cloud/openstack/index.html');

function main() {
  const asJson = process.argv.includes('--json');
  let harnesses = [];
  try {
    harnesses = fs.readdirSync(HARNESS_DIR)
      .filter((f) => /^walkthrough-.+\.js$/.test(f))
      .map((f) => f.replace(/^walkthrough-/, '').replace(/\.js$/, ''));
  } catch (e) {
    console.error('  no harness directory at ' + HARNESS_DIR + ' -- nothing to audit.');
    process.exit(0);
  }
  // A zero-harness run would "pass" while checking nothing. Say so instead.
  if (!harnesses.length) {
    console.error('  0 walkthrough harnesses found. This audit checked NOTHING -- treat as a failure of the audit, not a pass.');
    process.exit(2);
  }

  const hub = fs.readFileSync(HUB, 'utf8');
  const labFiles = fs.readdirSync(LAB_DIR);
  const rows = [];

  for (const lab of harnesses.sort()) {
    // Match the harness name against real filenames rather than assuming a naming convention:
    // the pages are cloud-openstack-<lab>-live.lab.html for most, but the capstone is
    // cloud-openstack-project-iac.lab.html. Predicting that string is how these get missed.
    const page = labFiles.find((f) => f.includes(lab) && f.endsWith('.lab.html'));
    if (!page) {
      rows.push({ lab, page: null, links: 0, verdict: 'HELD' });
      continue;
    }
    // Count occurrences of the basename, not lines: two links on one line is still curated.
    const links = (hub.match(new RegExp(page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    rows.push({ lab, page, links, verdict: links > 0 ? 'LINKED' : 'ORPHANED' });
  }

  const orphaned = rows.filter((r) => r.verdict === 'ORPHANED');

  if (asJson) {
    console.log(JSON.stringify({ generated: null, rows, orphaned: orphaned.length }, null, 2));
  } else {
    console.log('\n  Harness-to-hub-link audit  (' + rows.length + ' harness(es))\n');
    for (const r of rows) {
      const mark = r.verdict === 'ORPHANED' ? 'FAIL' : '    ';
      console.log('  ' + mark + '  ' + r.lab.padEnd(12)
        + (r.page || '(no page -- held)').padEnd(46)
        + 'links=' + r.links + '  ' + r.verdict);
    }
    if (orphaned.length) {
      console.log('\n  ' + orphaned.length + ' lab(s) are BUILT AND GATED BUT UNREACHABLE from the hub.');
      console.log('  A lab nobody can click is not shipped. Add a card to the hub, or, if it is');
      console.log('  being held deliberately, record that decision and remove the page.');
    } else {
      console.log('\n  Every built+gated lab has at least one inbound hub link.');
      const held = rows.filter((r) => r.verdict === 'HELD');
      if (held.length) {
        console.log('  Held (harness kept, page deliberately not shipped): ' + held.map((r) => r.lab).join(', '));
      }
    }
  }
  process.exit(orphaned.length ? 1 : 0);
}

main();
