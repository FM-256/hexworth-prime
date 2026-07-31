#!/usr/bin/env python3
"""Dump every pool slot and the Firebase uid bound to it, as JSON, for ownership auditing.

REPORT-ONLY. Reads Keystone project properties; changes nothing.

Runs ON bc2 (needs claim_service.py for the admin token + Keystone helpers):
    ssh bc2 'cd ~/openstack-stage1 && python3 dump-slot-uids.py' > uids.json

Then classify each uid as live/dead against Firebase Auth:
    node functions/audit-pool-slot-owners.js uids.json

WHY: deciding which slots to reclaim by RESOURCE NAME is unsafe — the labs instruct students to
create servers named exactly what the QC harnesses create (chain-vm, guard-vm, lab5-vm,
proj-vm), so a name match proves nothing about ownership. A slot bound to a uid that no longer
exists in Firebase Auth, however, cannot belong to a live student. That is checkable.
"""
import importlib.util
import json
import sys

spec = importlib.util.spec_from_file_location('cs', '/home/eq1/openstack-stage1/claim_service.py')
cs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cs)

tok = cs.admin_token()
if isinstance(tok, tuple):
    tok = tok[0]
if not tok:
    print('FATAL: no Keystone admin token', file=sys.stderr)
    raise SystemExit(1)

rows = []
for n in range(1, 31):
    name = 'student-%02d' % n
    r = cs.ks('GET', '/v3/projects?name=' + name, token=tok)
    doc = r[1] if isinstance(r, tuple) and len(r) > 1 else None
    projects = (doc or {}).get('projects') or []
    if not projects:
        continue
    p = projects[0]
    # The binding is stored as a Keystone project property. It has appeared both at the top
    # level and nested under `extra` depending on how it was written, so read both rather than
    # assuming one shape and silently reporting every slot as unbound.
    uid = p.get('hexworth_uid') or (p.get('extra') or {}).get('hexworth_uid')
    rows.append({'slot': name, 'project_id': p.get('id'), 'uid': uid})

print(json.dumps(rows, indent=2))
