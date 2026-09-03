#!/usr/bin/env python3
"""
@catalog what    BUG-248: add the missing ModuleProgress.js tag to Operator mission pages
@catalog run     python3 _tools/operator/add-moduleprogress-to-missions.py [--apply]
@catalog status  TOOL

BUG-248. 52 of 124 live Operator missions (js-01..js-50, python-01, python-02) never loaded
ModuleProgress.js, so OperatorEngine's completion hook was skipped and finishing them recorded
no XP and no progress. The hook at OperatorEngine.js:794 is guarded:

    if (typeof window.ModuleProgress !== 'undefined' && ...) { ModuleProgress.complete(...) }

so a missing script tag does not error. It silently does nothing, which is why 52 pages could ship
looking fine. The other 72 missions (python-03..python-50 and the rest) already carry the tag and
are the working control.

Operator confirmed 2026-09-03 that this is an authoring gap, not a decision: the missions ARE
meant to grant progress.

The path is `../../components/ModuleProgress.js`, which from _app/operator/missions/ resolves to
_app/components/ModuleProgress.js. Copied from the working pages rather than derived, because
script-src depth is a repeat failure here (CLAUDE.md QC item 3).

IDEMPOTENT by construction: a file that already mentions ModuleProgress is skipped, so re-running
cannot double-insert. DRY RUN BY DEFAULT; pass --apply to write.
"""
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MISSIONS = os.path.join(ROOT, '_app', 'operator', 'missions')
TAG = '<script src="../../components/ModuleProgress.js"></script>'
ANCHOR = 'href="../engine/operator.css"'

apply_changes = '--apply' in sys.argv

# _archive is deliberately excluded: those pages are retired copies, and "we do not destroy" cuts
# both ways -- an archived file is kept AS IT WAS, not quietly upgraded to current conventions.
names = sorted(n for n in os.listdir(MISSIONS) if n.endswith('.mission.html'))

changed, skipped, refused = [], [], []

for name in names:
    path = os.path.join(MISSIONS, name)
    with open(path, 'r', encoding='utf-8') as fh:
        text = fh.read()

    if 'ModuleProgress' in text:
        skipped.append(name)
        continue

    lines = text.split('\n')
    hits = [i for i, ln in enumerate(lines) if ANCHOR in ln]
    # Refuse rather than guess. A file with no anchor, or more than one, is not the shape this
    # sweep was verified against, and inserting into it would be a different edit than the one
    # that was reviewed.
    if len(hits) != 1:
        refused.append((name, f'{len(hits)} anchor lines, expected exactly 1'))
        continue
    if text.count('</head>') != 1:
        refused.append((name, f"{text.count('</head>')} </head> tags, expected exactly 1"))
        continue

    i = hits[0]
    indent = re.match(r'\s*', lines[i]).group(0)
    lines.insert(i + 1, indent + TAG)
    new_text = '\n'.join(lines)

    if apply_changes:
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(new_text)
    changed.append(name)

mode = 'APPLIED' if apply_changes else 'DRY RUN (pass --apply to write)'
print(f'  {mode}')
print(f'  would add the tag to : {len(changed)} file(s)')
print(f'  already had it       : {len(skipped)} file(s)')
print(f'  refused (odd shape)  : {len(refused)} file(s)')
for name, why in refused:
    print(f'      REFUSED {name}: {why}')
if changed:
    print(f'      first: {changed[0]}   last: {changed[-1]}')
sys.exit(1 if refused else 0)
