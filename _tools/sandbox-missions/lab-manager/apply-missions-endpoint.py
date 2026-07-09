#!/usr/bin/env python3
"""Add GET /api/sandbox/missions (public, read-only mission METADATA).
Strips check cmds entirely and masks hidden-task briefs — nothing answer-bearing
leaves the server. Anchored before app.listen; backup + node --check + rollback."""
import shutil, subprocess, sys, datetime
F = 'server.js'
src = open(F).read()
if '/api/sandbox/missions' in src:
    print('already applied'); sys.exit(0)
bak = f'server.js.bak-{datetime.datetime.now().strftime("%Y%m%d-%H%M%S")}-missions-endpoint'
shutil.copy(F, bak); print('backup:', bak)
anchor = 'app.listen(PORT, () => {'
if anchor not in src:
    print('anchor missing'); sys.exit(1)
insert = '''// ── Mission catalog (public metadata; check cmds and hidden briefs never leave) ──
app.get('/api/sandbox/missions', (req, res) => {
  const catalog = Object.values(MISSIONS).map(m => ({
    id: m.id,
    labId: m.labId,
    title: m.title,
    command_star: m.command_star,
    story: m.story,
    tier: m.tier,
    badge: m.badge,
    taskCount: m.tasks.length,
    tasks: m.tasks.map(t => ({
      id: t.id,
      brief: t.hidden ? 'Hidden requirement' : t.brief,
      tier: t.tier || 'bronze',
      bonus: !!t.bonus,
      hidden: !!t.hidden,
    })),
  }));
  res.json({ ok: true, missions: catalog });
});

'''
src = src.replace(anchor, insert + anchor, 1)
open(F, 'w').write(src)
r = subprocess.run(['node', '--check', F], capture_output=True, text=True)
if r.returncode != 0:
    print('SYNTAX FAIL', r.stderr); shutil.copy(bak, F); sys.exit(1)
print('missions endpoint applied, node --check OK')
