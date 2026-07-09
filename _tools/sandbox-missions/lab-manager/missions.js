/**
 * missions.js — Sandbox Mission Engine (Linux Command Mastery series)
 *
 * Loaded by the bc1 lab-manager (server.js). Source of truth lives in the
 * hexworth-prime repo at _tools/sandbox-missions/ and is synced to
 * ~/hexworth-sandbox/lab-manager/missions/ on bc1 alongside this file.
 *
 * Contract (SCHEMA.md v1):
 *  - loadMissions(dir)          -> { [id]: manifest } (validated; bad manifests skipped, logged)
 *  - runSeed(container, id)     -> Promise<boolean>   (exec seed.sh as root; logged, never throws)
 *  - gradeMission(container,id) -> Promise<result>    (rich per-task results; checks exec as student)
 *
 * Grading model: every check cmd is one argv element to `bash -lc` (NO nested
 * shell-string quoting — proven necessary by the pilot's live test), prefixed
 * with sourcing /opt/mission/env so seeds and checks agree on randomized values.
 * A task passes iff ALL its checks pass. Hidden tasks report pass/fail only
 * (no brief/feedback leak). Checks exec AS STUDENT (root would bypass DAC and
 * silently false-pass future chmod/chown missions); perms checks must inspect
 * mode via stat, not access tests. Bonus tasks never gate badgeEligible.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ENV_PREFIX = '. /opt/mission/env 2>/dev/null; ';

// ── Manifest loading ─────────────────────────────────────────────────────────
function loadMissions(dir) {
  const missions = {};
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { console.warn(`[missions] no missions dir at ${dir}: ${e.message}`); return missions; }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const id = ent.name;
    const mPath = path.join(dir, id, 'mission.json');
    const sPath = path.join(dir, id, 'seed.sh');
    try {
      const m = JSON.parse(fs.readFileSync(mPath, 'utf8'));
      const err = validateManifest(m, id);
      if (err) { console.warn(`[missions] SKIP ${id}: ${err}`); continue; }
      if (!fs.existsSync(sPath)) { console.warn(`[missions] SKIP ${id}: seed.sh missing`); continue; }
      m._seedScript = fs.readFileSync(sPath, 'utf8');
      missions[m.id] = m;
    } catch (e) {
      console.warn(`[missions] SKIP ${id}: ${e.message}`);
    }
  }
  console.log(`[missions] loaded: ${Object.keys(missions).join(', ') || '(none)'}`);
  return missions;
}

function validateManifest(m, dirName) {
  if (m.schema !== 1) return `unsupported schema ${m.schema}`;
  if (m.id !== dirName) return `id "${m.id}" != directory "${dirName}"`;
  if (!m.labId || typeof m.labId !== 'string') return 'labId missing';
  if (!m.badge || !m.badge.id) return 'badge.id missing';
  if (!Array.isArray(m.tasks) || m.tasks.length === 0) return 'tasks empty';
  for (const t of m.tasks) {
    if (!t.id || !Array.isArray(t.checks) || t.checks.length === 0) return `task ${t.id || '?'} malformed`;
    for (const c of t.checks) {
      if (!c.cmd || typeof c.cmd !== 'string') return `task ${t.id} has a check without cmd`;
      if (/\n/.test(c.cmd)) return `task ${t.id} check cmd contains newline`;
    }
  }
  return null;
}

// ── Seed ─────────────────────────────────────────────────────────────────────
// Writes the seed script into the container via a base64 exec (no bind mounts,
// no docker cp dependency), then runs it as root. Never throws; logs and
// returns false on failure so a broken seed degrades to free-play (SCHEMA.md).
async function runSeed(container, mission, execCheck) {
  try {
    const b64 = Buffer.from(mission._seedScript, 'utf8').toString('base64');
    const write = `mkdir -p /opt/mission && echo '${b64}' | base64 -d > /opt/mission/seed.sh && chmod 0700 /opt/mission/seed.sh`;
    const wrote = await execCheck(container, write, 'root');
    if (!wrote) { console.warn(`[missions] ${mission.id}: seed write failed`); return false; }
    const ran = await execCheck(container, 'sh /opt/mission/seed.sh', 'root');
    if (!ran) { console.warn(`[missions] ${mission.id}: seed run failed`); return false; }
    console.log(`[missions] ${mission.id}: seeded`);
    return true;
  } catch (e) {
    console.warn(`[missions] ${mission.id}: seed error ${e.message}`);
    return false;
  }
}

// ── Grade ────────────────────────────────────────────────────────────────────
// Returns:
// { mission, title, results: [{id, brief, tier, bonus, hidden, pass, feedback[]}],
//   passed, total, hiddenUnmet, badgeEligible, badge }
// - feedback[] = fail strings of failed aspects (empty when task passes)
// - hidden tasks: brief replaced, feedback suppressed; counted in hiddenUnmet
// - badgeEligible = every non-bonus task (incl hidden) passes
async function gradeMission(container, mission, execCheck) {
  const results = [];
  let hiddenUnmet = 0;
  for (const t of mission.tasks) {
    const feedback = [];
    let pass = true;
    for (const c of t.checks) {
      const ok = await execCheck(container, ENV_PREFIX + c.cmd, 'student');
      if (!ok) { pass = false; feedback.push(c.fail || `${c.aspect || 'a requirement'} not met`); }
    }
    if (t.hidden && !pass) hiddenUnmet++;
    results.push({
      id: t.id,
      brief: t.hidden ? 'Hidden requirement' : t.brief,
      tier: t.tier || 'bronze',
      bonus: !!t.bonus,
      hidden: !!t.hidden,
      pass,
      feedback: t.hidden ? [] : feedback,
    });
  }
  const gating = results.filter(r => !r.bonus);
  const passed = results.filter(r => r.pass).length;
  return {
    mission: mission.id,
    title: mission.title,
    results,
    passed,
    total: results.length,
    hiddenUnmet,
    badgeEligible: gating.every(r => r.pass),
    badge: mission.badge,
  };
}

module.exports = { loadMissions, runSeed, gradeMission };
