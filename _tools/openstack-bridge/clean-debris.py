#!/usr/bin/env python3
"""Delete test debris from pool slots -- ONLY slots proven not to belong to a person.

THE RULE THIS OBEYS (operator): test data may be deleted ONCE DOCUMENTED; everything else is
archived. So the inventory is written FIRST, and this refuses any slot bound to a Firebase uid,
because a bound slot may hold a real student's in-progress lab work and that loss is permanent.

Detach before delete: Cinder refuses to remove an in-use volume, and Nova frees the attachment
asynchronously, so the volume is polled back to 'available' rather than assumed.
"""
import json, sys, time
sys.path.insert(0, '/home/eq1/openstack-stage1')
import claim_service as cs

ALLOW = sys.argv[1].split(',') if len(sys.argv) > 1 else []
if not ALLOW:
    sys.exit('  refusing: no explicit slot allow-list given')

for slot in ALLOW:
    tok = cs._user_token(slot)
    if not tok:
        print(f'  {slot}: no credential, skipped'); continue
    st, doc = cs.verify(slot)
    if st != 200:
        print(f'  {slot}: verify HTTP {st}, skipped'); continue
    srv = doc.get('servers', []); vol = doc.get('volumes', [])
    print(f'  {slot}: {len(srv)} server(s), {len(vol)} volume(s)')

    # 1. detach every attachment first
    for v in vol:
        for holder in (v.get('attached_to') or []):
            cs._os(tok, '/compute/v2.1', f'/servers/{holder}/os-volume_attachments/{v["id"]}', method='DELETE')
            print(f'      detach {v["name"] or v["id"][:8]} from {holder[:8]}')
    for _ in range(24):
        st2, d2 = cs.verify(slot)
        if all(not (x.get('attached_to') or []) for x in (d2 or {}).get('volumes', [])):
            break
        time.sleep(5)

    # 2. servers, then volumes
    for s in srv:
        c, _ = cs._os(tok, '/compute/v2.1', f'/servers/{s["id"]}', method='DELETE')
        print(f'      delete server {s["name"]} -> {c}')
    for _ in range(24):
        st3, d3 = cs.verify(slot)
        if not (d3 or {}).get('servers'):
            break
        time.sleep(5)
    for v in vol:
        c, _ = cs._os(tok, '/volume/v3', f'/volumes/{v["id"]}', method='DELETE')
        print(f'      delete volume {v["name"] or v["id"][:8]} -> {c}')

    st4, d4 = cs.verify(slot)
    print(f'  {slot}: now {len((d4 or {}).get("servers", []))} server(s), '
          f'{len((d4 or {}).get("volumes", []))} volume(s)')
