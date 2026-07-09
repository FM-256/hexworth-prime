#!/usr/bin/env python3
"""Catalog briefs are pre-launch (no seeded values exist yet): mask $MISSION_*
tokens with the neutral placeholder via missionEngine.substituteTokens({}).
Chris gate follow-through 2026-07-09."""
import shutil, subprocess, sys, datetime
F = 'server.js'
src = open(F).read()
OLD = "      brief: t.hidden ? 'Hidden requirement' : t.brief,"
NEW = "      brief: t.hidden ? 'Hidden requirement' : missionEngine.substituteTokens(t.brief, {}),"
if NEW in src:
    print('already applied'); sys.exit(0)
if OLD not in src:
    print('anchor missing'); sys.exit(1)
bak = f'server.js.bak-{datetime.datetime.now().strftime("%Y%m%d-%H%M%S")}-catalog-mask'
shutil.copy(F, bak); print('backup:', bak)
src = src.replace(OLD, NEW, 1)
open(F, 'w').write(src)
r = subprocess.run(['node', '--check', F], capture_output=True, text=True)
if r.returncode != 0:
    print('SYNTAX FAIL', r.stderr); shutil.copy(bak, F); sys.exit(1)
print('catalog mask applied, node --check OK')
