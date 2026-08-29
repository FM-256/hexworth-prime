#!/usr/bin/env node
/*
 * Does every lab The Rig advertises as PRACTICE actually get capped as practice by the server?
 *
 * @catalog what    cross-repo check: Rig browsable labs vs lab-manager free-play classification
 * @catalog run     node _tools/rules-test/freeplay-classification.test.js [--server=<path>]
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. Fixing BUG-233 (2026-08-28) meant taking openstack-cli out of the server's
 * FREE_PLAY_LABS, because the security sprint server-grades four missions on it and a whole
 * class was being charged against the practice cap. I claimed The Rig did not offer that lab,
 * having grepped _app/rig/index.html for the string "openstack" and found nothing. That grep
 * was keyed on the WRONG SURFACE: The Rig does not name labs in its source at all, it projects
 * SandboxLauncher.getBrowsableLabs() at rig/index.html:150 and hands each id to
 * renderButton(mount, id, {freePlay:true}) at :178. openstack-cli is browsable:true, so it very
 * much is on the shelf. Removing it from FREE_PLAY_LABS without adding it to
 * CONTEXT_FREE_PLAY_LABS would have left Rig practice launches UNCAPPED and competing with a
 * graded class for all 40 container slots -- worse than the bug being fixed. Nancy caught it by
 * refusing the grep and re-deriving from primary sources.
 *
 * THE INVARIANT CANNOT BE CHECKED BY EITHER REPO ALONE. The classification sets live in
 * lab-manager/server.js, which is deliberately NOT in this repo (it carries a real node address
 * and this repo is public -- see _docs/operations/openstack-cloud-durability.md). The browsable
 * registry lives here. So nothing in CI on either side can see both halves, and the next person
 * to add a browsable:true lab gets no warning at all. That is what this file is for: it is the
 * automation of the cross-repo trace that had to be done by hand.
 *
 * EXIT CODES ARE THREE, NOT TWO, on purpose. 0 = verified. 1 = invariant violated. 2 = COULD
 * NOT VERIFY (server.js not reachable from here). A skip that exits 0 reads as a pass in every
 * log and every gate, and a check that cannot fail is not evidence.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '../..');
const LAUNCHER = path.join(REPO, '_app/components/SandboxLauncher.js');

// server.js lives on bc1. Accept an explicit path, an env var, or try the known locations.
const argPath = (process.argv.find((a) => a.startsWith('--server=')) || '').split('=')[1];
const CANDIDATES = [
  argPath,
  process.env.LAB_MANAGER_SERVER_JS,
  '/home/eq1/hexworth-sandbox/lab-manager/server.js',   // on bc1 itself
].filter(Boolean);

const serverPath = CANDIDATES.find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });

if (!serverPath) {
  console.error('  COULD NOT VERIFY - lab-manager/server.js not found.');
  console.error('  Tried: ' + CANDIDATES.join(', '));
  console.error('  It is not in this repo by design. Run this ON bc1, or pass --server=<path>.');
  console.error('  Exiting 2: this is NOT a pass.');
  process.exit(2);
}

const launcherSrc = fs.readFileSync(LAUNCHER, 'utf8');
const serverSrc = fs.readFileSync(serverPath, 'utf8');

// ── Parse both sides ───────────────────────────────────────────────────────────
// A lab id is browsable when its LAB_INFO entry says so explicitly. hub-registry-audit.js
// Part E already guarantees every entry carries an explicit ruling, so a missing key here
// means that gate is broken, not that the lab is private.
function browsableLabs(src) {
  const out = [];
  const body = (src.match(/const LAB_INFO\s*=\s*\{([\s\S]*?)\n    \};/) || [])[1] || '';
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*'([a-z0-9-]+)':\s*\{(.*)$/);
    if (m && /browsable:\s*true/.test(m[2])) out.push(m[1]);
  }
  return out;
}

// Read a `const NAME = new Set([...])` declaration out of the server source.
function serverSet(src, name) {
  const m = src.match(new RegExp('const ' + name + "\\s*=\\s*new Set\\(\\[([^\\]]*)\\]"));
  if (!m) return null;
  return m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
}

const browsable = browsableLabs(launcherSrc);
const always = serverSet(serverSrc, 'FREE_PLAY_LABS');
const context = serverSet(serverSrc, 'CONTEXT_FREE_PLAY_LABS');

if (!browsable.length || !always || !context) {
  console.error('  COULD NOT VERIFY - failed to parse one of the declarations.');
  console.error(`  browsable=${browsable.length} FREE_PLAY_LABS=${always && always.length} CONTEXT=${context && context.length}`);
  console.error('  A parser that silently reads zero entries would pass everything. Exiting 2.');
  process.exit(2);
}

// A lab has a COURSE launch path if any page outside The Rig mounts a launcher for it.
// Rig-only labs are pure practice; anything with a course page is dual-path.
//
// MISSION-DRIVEN LAUNCHES DO NOT COUNT, and leaving that out produced a false positive on the
// first run of this file. The server computes `isFreePlay = !missionId && (...)`, so a mission
// exempts a launch from the practice cap no matter which set the lab is in. The observatory
// page launches linux-sandbox with `mission: function(){...}` and its own comment says
// "Null = free-play" -- a missionless launch there is DELIBERATELY practice, not miscapped
// coursework. So the signal that separates the two cases is whether the call site passes a
// mission option at all:
//   passes mission (even conditionally) -> the page has a graded mode; missionless launches
//                                          from it are intentional free-play. Not a violation.
//   never passes mission                -> every launch from this course page is charged to
//                                          the practice cap. That is the BUG-233 shape.
// This is a heuristic about INTENT, which a parser cannot read directly; it is stated here so
// the next person can judge a finding rather than trust it.
function coursePagesWithoutMission(labId) {
  let files = [];
  try {
    const out = execSync(
      `grep -rl "renderButton(.*'${labId}'" ${JSON.stringify(path.join(REPO, '_app'))} 2>/dev/null || true`,
      { encoding: 'utf8' });
    files = out.split('\n').filter((f) => f && !f.includes('/_app/rig/') && !f.endsWith('SandboxLauncher.js'));
  } catch { return []; }

  return files.filter((f) => {
    const src = fs.readFileSync(f, 'utf8');
    const lines = src.split('\n');
    const i = lines.findIndex((l) => new RegExp(`renderButton\\(.*'${labId}'`).test(l));
    if (i < 0) return false;
    // The options object follows the call. 25 lines comfortably covers every call site in the
    // tree (largest is ~20) without running into the next unrelated block.
    return !/\bmission\s*:/.test(lines.slice(i, i + 25).join('\n'));
  });
}

// ── The checks ─────────────────────────────────────────────────────────────────
let failures = 0;
const fail = (m) => { console.log('  FAIL  ' + m); failures++; };
const ok = (m) => console.log('  OK    ' + m);

console.log(`  browsable on The Rig : ${browsable.length}  [${browsable.join(', ')}]`);
console.log(`  FREE_PLAY_LABS       : [${always.join(', ')}]`);
console.log(`  CONTEXT_FREE_PLAY    : [${context.join(', ')}]`);
console.log(`  server source        : ${serverPath}`);
console.log('');

// CHECK 1. The Rig sends freePlay:true for every card it renders. The server only honours that
// flag for CONTEXT_FREE_PLAY_LABS, and caps FREE_PLAY_LABS unconditionally. A browsable lab in
// NEITHER set is advertised as practice and charged to nothing -- uncapped, competing with
// graded work for the whole pool. This is the exact hole BUG-233's fix nearly shipped.
for (const id of browsable) {
  if (!always.includes(id) && !context.includes(id)) {
    fail(`'${id}' is browsable:true but in NEITHER FREE_PLAY_LABS nor CONTEXT_FREE_PLAY_LABS -> `
       + `The Rig offers it as practice and the server never caps it. Add it to CONTEXT_FREE_PLAY_LABS.`);
  }
}
if (!failures) ok(`all ${browsable.length} browsable labs are classified server-side`);

// CHECK 2. FREE_PLAY_LABS is UNCONDITIONAL -- it caps a lab even when a course page launched it.
// So a lab with a course launch path must never live there, or a class gets throttled by the
// practice cap. That is BUG-233 itself: openstack-cli sat in FREE_PLAY_LABS while nine course
// pages launched it, and a 34-student class was charged against the practice reserve.
const before2 = failures;
for (const id of always) {
  const pages = coursePagesWithoutMission(id);
  if (pages.length) {
    fail(`'${id}' is in FREE_PLAY_LABS (unconditional) but ${pages.length} missionless course launch(es): `
       + pages.map((p) => path.relative(REPO, p)).join(', ')
       + ` -> coursework charged to the practice cap. Move it to CONTEXT_FREE_PLAY_LABS.`);
  }
}
if (failures === before2) ok(`no unconditionally-capped lab has a course launch path`);

// CHECK 3 (informational, never fatal). A context lab that is not browsable can never receive
// freePlay:true from anywhere, so its membership is dead weight -- worth knowing, not breaking.
const dead = context.filter((id) => !browsable.includes(id));
if (dead.length) console.log(`  NOTE  in CONTEXT_FREE_PLAY_LABS but not browsable (flag unreachable): [${dead.join(', ')}]`);

console.log('');
console.log(failures ? `  ${failures} INVARIANT VIOLATION(S)` : '  PASSED - Rig and lab-manager agree on what counts as practice');
process.exit(failures ? 1 : 0);
