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

// Per-mission env file: seeds write /opt/mission/env.<id> so two missions on
// the same box never clobber each other's randomization/checksum values.
function envPrefix(missionId) { return `. /opt/mission/env.${missionId} 2>/dev/null; `; }

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

// ── Mission env readback (for display substitution) ─────────────────────────
// Task briefs may contain $MISSION_* tokens (e.g. "Project: $MISSION_PROJ").
// Checks resolve them by sourcing the env file in-shell, but briefs are DISPLAY
// text: they must be substituted with the container's actual seeded values
// before they reach a student (Chris gate 2026-07-09: raw tokens were rendered
// verbatim in the grade panel). Reads /opt/mission/env.<id> once per grade.
function readMissionEnv(container, missionId) {
  return new Promise((resolve) => {
    const vals = {};
    (async () => {
      try {
        const exec = await container.exec({
          Cmd: ['cat', `/opt/mission/env.${missionId}`],
          AttachStdout: true, AttachStderr: true, User: 'root',
        });
        const stream = await exec.start({});
        let out = '';
        const { PassThrough } = require('stream');
        const so = new PassThrough();                       // stdout only; stderr discarded
        so.on('data', (d) => { out += d.toString('utf8'); });
        container.modem.demuxStream(stream, so, new PassThrough());
        const done = () => {
          out.split('\n').forEach((line) => {
            const m = /^(MISSION_[A-Z0-9_]+)=(.*)$/.exec(line.trim());
            if (m) vals[m[1]] = m[2];
          });
          resolve(vals);
        };
        stream.on('end', done);
        stream.on('close', done);
        stream.on('error', () => resolve(vals));
      } catch (e) { resolve(vals); }
    })();
  });
}

// Replace $MISSION_* tokens in display text with seeded values. Unknown tokens
// fall back to a neutral placeholder so a student is never shown shell syntax.
function substituteTokens(text, env) {
  if (typeof text !== 'string') return text;
  return text.replace(/\$MISSION_[A-Z0-9_]+/g, (tok) => {
    const key = tok.slice(1);
    return Object.prototype.hasOwnProperty.call(env, key) ? env[key] : '[assigned at launch]';
  });
}

// ── Grade ────────────────────────────────────────────────────────────────────
// Returns:
// { mission, title, results: [{id, brief, tier, bonus, hidden, pass, feedback[]}],
//   passed, total, hiddenUnmet, badgeEligible, badge }
// - feedback[] = fail strings of failed aspects (empty when task passes)
// - hidden tasks: brief replaced, feedback suppressed; counted in hiddenUnmet
// - badgeEligible = every non-bonus task (incl hidden) passes
// - all display strings (brief/desc/feedback) have $MISSION_* substituted with
//   the container's seeded values (never raw shell tokens to a student)
async function gradeMission(container, mission, execCheck) {
  const results = [];
  let hiddenUnmet = 0;
  const env = await readMissionEnv(container, mission.id);
  const sub = (s) => substituteTokens(s, env);
  for (const t of mission.tasks) {
    const feedback = [];
    let pass = true;
    for (const c of t.checks) {
      const ok = await execCheck(container, envPrefix(mission.id) + c.cmd, 'student');
      if (!ok) { pass = false; feedback.push(sub(c.fail || `${c.aspect || 'a requirement'} not met`)); }
    }
    if (t.hidden && !pass) hiddenUnmet++;
    const shownBrief = t.hidden ? 'Hidden requirement' : sub(t.brief);
    results.push({
      id: t.id,
      brief: shownBrief,
      desc: shownBrief, // legacy-frontend alias (old UI reads .desc)
      tier: t.tier || 'bronze',
      bonus: !!t.bonus,
      hidden: !!t.hidden,
      pass,
      feedback: t.hidden ? [] : feedback,
    });
  }
  const gating = results.filter(r => !r.bonus);
  const passed = results.filter(r => r.pass).length;
  const badgeEligible = gating.every(r => r.pass);
  return {
    mission: mission.id,
    title: mission.title,
    results,
    passed,
    total: results.length,
    hiddenUnmet,
    badgeEligible,
    complete: badgeEligible, // legacy-frontend alias (old UI reads .complete)
    badge: mission.badge,
  };
}

module.exports = { loadMissions, runSeed, gradeMission, substituteTokens };
