#!/usr/bin/env python3
"""Apply the Mission Engine integration to bc1 lab-manager server.js.

Three anchored, additive edits (legacy paths byte-identical when no mission param):
  1. after SANDBOX_CHALLENGES block: require + load missions
  2. /launch: accept `mission` in body, seed after start (fresh, restart, and
     existing-running paths), record mission on the session
  3. /check/:sessionId and /grade-for: ?mission= forks to gradeMission

Run ON bc1 from ~/hexworth-sandbox/lab-manager. Refuses to run twice.
Backup + `node --check` verification; restores backup on any failure.
"""
import re, shutil, subprocess, sys, datetime

F = 'server.js'
src = open(F).read()

if 'missions.js' in src:
    print('already applied — refusing to double-patch'); sys.exit(1)

stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
bak = f'server.js.bak-{stamp}-mission-engine'
shutil.copy(F, bak)
print('backup:', bak)

def anchor(pattern, insert, where='after', count=1):
    """Insert text after/before the FIRST regex match; die loudly if absent."""
    global src
    m = re.search(pattern, src)
    if not m:
        print(f'ANCHOR NOT FOUND: {pattern[:60]}'); restore_and_die()
    pos = m.end() if where == 'after' else m.start()
    src = src[:pos] + insert + src[pos:]

def restore_and_die():
    shutil.copy(bak, F)
    print('restored backup'); sys.exit(1)

# ── 1. engine load, after the SANDBOX_CHALLENGES closing brace ────────────────
anchor(r"const SANDBOX_CHALLENGES = \{[\s\S]*?\n\};\n", """
// ── Mission Engine (Linux Command Mastery series) ────────────────────────────
// Manifests live in ./missions/<id>/{mission.json,seed.sh} (synced from the
// hexworth-prime repo _tools/sandbox-missions/). Legacy SANDBOX_CHALLENGES
// behavior is untouched when no mission param is present.
const missionEngine = require('./missions.js');
const MISSIONS = missionEngine.loadMissions(require('path').join(__dirname, 'missions'));
""")

# ── 2a. /launch: accept mission in body ──────────────────────────────────────
anchor(r"app\.post\('/api/sandbox/launch', verifyAuth, async \(req, res\) => \{\n  const \{ labId \} = req\.body;",
       "", where='after')  # position probe only
src = src.replace(
    "app.post('/api/sandbox/launch', verifyAuth, async (req, res) => {\n  const { labId } = req.body;",
    "app.post('/api/sandbox/launch', verifyAuth, async (req, res) => {\n  const { labId } = req.body;\n"
    "  // Optional mission: validated against the engine + must target this labId.\n"
    "  const missionId = (typeof req.body.mission === 'string' && MISSIONS[req.body.mission]\n"
    "    && MISSIONS[req.body.mission].labId === labId) ? req.body.mission : null;",
    1)

# ── 2b. existing-running path: idempotent seed so a mission works on resume ──
src = src.replace(
    """    if (running) {
      return res.json({
        sessionId: existing.id,
        url: `https://${DOMAIN}/s/${existing.id}/`,
        status: 'running',
        lab: LABS[labId].name,
      });
    }""",
    """    if (running) {
      if (missionId) { // idempotent world-build on resume (seed is contract-idempotent)
        existing.mission = missionId;
        await missionEngine.runSeed(docker.getContainer(existing.containerId), MISSIONS[missionId], execCheck);
      }
      return res.json({
        sessionId: existing.id,
        url: `https://${DOMAIN}/s/${existing.id}/`,
        status: 'running',
        lab: LABS[labId].name,
        mission: missionId || undefined,
      });
    }""", 1)

# ── 2c. fresh-launch path: seed right after sessions.set ─────────────────────
src = src.replace(
    """    sessions.set(sessionId, {
      containerId: container.id,
      uid,
      labId,
      createdAt: Date.now(),
    });
""",
    """    sessions.set(sessionId, {
      containerId: container.id,
      uid,
      labId,
      mission: missionId || undefined,
      createdAt: Date.now(),
    });

    if (missionId) await missionEngine.runSeed(container, MISSIONS[missionId], execCheck);
""", 1)

# ── 3a. /check/:sessionId mission fork ────────────────────────────────────────
src = src.replace(
    """  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  const labId = session && session.labId;
  const challenges = SANDBOX_CHALLENGES[labId];""",
    """  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  const labId = session && session.labId;

  // Mission grading fork: ?mission=<id> (or the mission the session launched with).
  const mReq = typeof req.query.mission === 'string' ? req.query.mission : (session && session.mission);
  if (mReq && MISSIONS[mReq] && session && MISSIONS[mReq].labId === labId) {
    const cname = `sandbox-${sessionId}`;
    if (!(await isContainerRunning(cname))) return res.status(404).json({ ok: false, error: 'Session not running.' });
    const graded = await missionEngine.gradeMission(docker.getContainer(cname), MISSIONS[mReq], execCheck);
    return res.json({ ok: true, ...graded });
  }

  const challenges = SANDBOX_CHALLENGES[labId];""", 1)

# ── 3b. grade-for mission fork (after uid parse, before legacy challenges) ───
src = src.replace(
    """  const challenges = SANDBOX_CHALLENGES[labId];
  if (!challenges) {
    // Distinct from "not running": the labId has no configured challenges""",
    """  // Mission grading fork (?mission=<id>): same ownership model — uid resolved
  // to ITS OWN session server-side; mission determines the labId to bind.
  const mReq = typeof req.query.mission === 'string' ? req.query.mission : '';
  if (mReq) {
    if (!MISSIONS[mReq]) {
      return res.json({ ok: true, running: false, reason: 'unsupported_mission', passed: 0, total: 0, badgeEligible: false, results: [] });
    }
    const mSession = getExistingSession(uid, MISSIONS[mReq].labId);
    if (!mSession) {
      return res.json({ ok: true, running: false, reason: 'no_session', passed: 0, total: MISSIONS[mReq].tasks.length, badgeEligible: false, results: [] });
    }
    const mName = `sandbox-${mSession.id}`;
    if (!(await isContainerRunning(mName))) {
      return res.json({ ok: true, running: false, reason: 'not_running', passed: 0, total: MISSIONS[mReq].tasks.length, badgeEligible: false, results: [] });
    }
    const graded = await missionEngine.gradeMission(docker.getContainer(mName), MISSIONS[mReq], execCheck);
    return res.json({ ok: true, running: true, ...graded });
  }

  const challenges = SANDBOX_CHALLENGES[labId];
  if (!challenges) {
    // Distinct from "not running": the labId has no configured challenges""", 1)

open(F, 'w').write(src)

r = subprocess.run(['node', '--check', F], capture_output=True, text=True)
if r.returncode != 0:
    print('SYNTAX FAIL:\n', r.stderr); restore_and_die()
print('node --check OK — mission engine applied')
