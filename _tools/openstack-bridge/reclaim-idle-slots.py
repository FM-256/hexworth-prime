"""Reclaim pool slots stuck on throwaway QC users.

My gate runs each create a NEW Firebase user, and the bridge binds a slot to that uid
PERMANENTLY (hexworth_uid on the Keystone project). Running the gates repeatedly walked
the pool to student-30 and exhausted it -- real students would get 503. /reconcile only
deletes stale app credentials; it never releases the binding.

A slot is safe to reclaim when it holds NO application credentials (nobody has a live
session on it) AND no servers/volumes (no student work to lose). Report first, act second.
"""
import sys, importlib.util
spec = importlib.util.spec_from_file_location('cs', '/home/eq1/openstack-stage1/claim_service.py')
cs = importlib.util.module_from_spec(spec)
try: spec.loader.exec_module(cs)
except SystemExit: pass

APPLY = '--apply' in sys.argv
atok = cs.admin_token()
if not atok:
    print('KEYSTONE_ADMIN_AUTH_FAILED'); raise SystemExit(1)

st, doc, _ = cs.ks('GET', '/v3/projects', token=atok)
projects = [p for p in (doc or {}).get('projects', []) if str(p.get('name','')).startswith('student-')]
bound = [p for p in projects if p.get('hexworth_uid')]
print(f"pool: {len(projects)} slots, {len(bound)} bound to a uid, {len(projects)-len(bound)} free")

reclaim = []
for p in sorted(bound, key=lambda x: x['name']):
    uid = cs._user_id(atok, p['name'])
    creds = 0
    if uid:
        s2, d2, _ = cs.ks('GET', f'/v3/users/{uid}/application_credentials', token=atok)
        creds = len((d2 or {}).get('application_credentials') or [])
    utok = cs._user_token(p['name'])
    srv = vol = 0
    if utok:
        s3, sd = cs._os(utok, '/compute/v2.1', '/servers/detail')
        srv = len((sd or {}).get('servers') or [])
        s4, vd = cs._os(utok, '/volume/v3', '/volumes/detail')
        vol = len((vd or {}).get('volumes') or [])
    idle = (creds == 0 and srv == 0 and vol == 0)
    print(f"  {p['name']}: creds={creds} servers={srv} volumes={vol} -> {'RECLAIM' if idle else 'in use, keep'}")
    if idle: reclaim.append(p)

print(f"\n{len(reclaim)} slot(s) reclaimable")
if not APPLY:
    print("dry run -- pass --apply to release them"); raise SystemExit(0)
for p in reclaim:
    cs.ks('PATCH', f"/v3/projects/{p['id']}", token=atok, body={'project': {'hexworth_uid': None}})
    print(f"  released {p['name']}")
print(f"released {len(reclaim)} slots")
