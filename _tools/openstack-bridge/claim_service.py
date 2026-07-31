#!/usr/bin/env python3
"""
OpenStack Stage 3 claim service. Runs ON bc2 (host), binds the tailnet IP only.

Design: _docs/architecture/openstack-identity-bridge.md (RESOLUTIONS 2026-07-30).
Nancy conditions implemented here:
  - Auth is shared-secret AND Firebase ID token: every /claim must carry the student's ID
    token, verified against Google's securetoken x509 certs (RS256, iss/aud/exp) with
    sign_in_provider != 'anonymous' enforced SERVER-SIDE on this host. A leaked bc1 secret
    alone mints nothing.
  - App credentials are SELF-SERVICE in Keystone (proven 2026-07-30: no --user on create),
    so this service authenticates AS the pool user with the password from the 0600 store
    (provision-pool.sh) and self-creates a RESTRICTED app cred (restricted is the Keystone
    default; unrestricted is never requested).
  - Sticky uid->slot mapping lives in KEYSTONE PROJECT PROPERTIES (hexworth_uid=<uid>):
    durable exactly as long as the project, wiped atomically by term reset, no new storage.
  - Headroom guard: /claim refuses (503 CLOUD_FULL) when Nova hypervisor free_ram_mb drops
    below FLOOR_MB, so exhaustion never masquerades as the seeded "No valid host found" lab.
  - Reconcile: bc1 posts the set of app-cred IDs labeled on live containers; anything else
    on pool users is deleted via the admin REST path (404-tolerant, proven 204/404).

Endpoints (JSON; all require X-Bridge-Secret):
  POST /claim      {uid, id_token}        -> {slot, project, cred_id, cred_secret, auth_url}
  DELETE /cred     {cred_id, slot}        -> {deleted: true}    (404 counts as deleted)
  POST /reconcile  {active: [cred_id,..]} -> {checked, deleted}
  POST /seed       {slot, scenario}       -> {seeded, volume_id, server_id}   (Stage 4)
  POST /verify     {slot}                 -> {servers[], volumes[]}  SERVER-SIDE grading truth
  GET  /slot/<uid>                        -> {slot} | 404       (Fork E read path)
  GET  /health                            -> {ok, free_ram_mb, slots_used}   (secret required)
"""
import json, os, re, socket, threading, time, urllib.error, urllib.request
# Transport note (Nancy): the listener is deliberately plaintext HTTP. It binds the
# tailnet IP only; WireGuard encrypts the path bc1<->bc2. No TLS is layered on top.
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import jwt  # PyJWT
from cryptography.x509 import load_pem_x509_certificate

BIND = os.environ.get('BRIDGE_BIND', '100.125.36.2')
PORT = int(os.environ.get('BRIDGE_PORT', '9711'))
SECRET_PATH = os.path.expanduser('~/openstack-stage1/bridge-secret')       # 0600
POOL_STORE = os.path.expanduser('~/openstack-stage1/pool-credentials.env')  # 0600
KEYSTONE = os.environ.get('KEYSTONE_URL', 'http://192.168.122.62/identity')
FIREBASE_PROJECT = 'hexworth-prime'
GOOGLE_CERTS = ('https://www.googleapis.com/robot/v1/metadata/x509/'
                'securetoken@system.gserviceaccount.com')
FLOOR_MB = int(os.environ.get('HEADROOM_FLOOR_MB', '2048'))
POOL_RE = re.compile(r'^student-\d{2}$')
ADMIN_ENV = os.path.expanduser('~/openstack-stage1/admin-auth.env')  # OS_ADMIN_USER/PASS, 0600

_lock = threading.Lock()          # serializes slot assignment (no double-assign race)
_certs = {'exp': 0, 'keys': {}}   # Google cert cache


def _read_env(path):
    out = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                out[k] = v
    return out


def bridge_secret():
    with open(SECRET_PATH) as f:
        return f.read().strip()


# ── Firebase ID token verification (no Firebase credential needed) ──────────────
def google_keys():
    now = time.time()
    if now < _certs['exp'] and _certs['keys']:
        return _certs['keys']
    with urllib.request.urlopen(GOOGLE_CERTS, timeout=10) as r:
        data = json.loads(r.read())
        cc = r.headers.get('Cache-Control', '')
    m = re.search(r'max-age=(\d+)', cc)
    _certs['exp'] = now + (int(m.group(1)) if m else 3600)
    _certs['keys'] = {kid: load_pem_x509_certificate(pem.encode()).public_key()
                      for kid, pem in data.items()}
    return _certs['keys']


def verify_id_token(token):
    """Returns (uid, None) or (None, error_string). Enforces non-anonymous provider."""
    try:
        kid = jwt.get_unverified_header(token).get('kid')
        key = google_keys().get(kid)
        if key is None:
            return None, 'UNKNOWN_KID'
        claims = jwt.decode(token, key=key, algorithms=['RS256'],
                            audience=FIREBASE_PROJECT,
                            issuer=f'https://securetoken.google.com/{FIREBASE_PROJECT}')
        provider = (claims.get('firebase') or {}).get('sign_in_provider', '')
        if provider == 'anonymous' or not provider:
            return None, 'ANONYMOUS_NOT_ALLOWED'
        return claims.get('sub') or None, None
    except jwt.PyJWTError as e:
        return None, f'TOKEN_INVALID:{type(e).__name__}'


# ── Keystone helpers ────────────────────────────────────────────────────────────
def ks(method, path, token=None, body=None, auth=None):
    """Raw Keystone REST call. Returns (status, dict|None, headers)."""
    req = urllib.request.Request(KEYSTONE + path, method=method)
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('X-Auth-Token', token)
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data, timeout=20) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, None, dict(e.headers or {})
    except (urllib.error.URLError, socket.timeout, OSError):
        # VM unreachable / DNS / timeout: a clean sentinel, never an unhandled throw
        # in the request thread (Nancy concern 4).
        return 599, None, {}


def token_for(user, password, project):
    """Password-scoped token; returns (token, catalog) or (None, None)."""
    body = {'auth': {
        'identity': {'methods': ['password'], 'password': {'user': {
            'name': user, 'domain': {'name': 'Default'}, 'password': password}}},
        'scope': {'project': {'name': project, 'domain': {'name': 'Default'}}}}}
    st, doc, hdr = ks('POST', '/v3/auth/tokens', body=body)
    if st != 201:
        return None, None
    return hdr.get('X-Subject-Token'), (doc or {}).get('token', {}).get('catalog')


def admin_token():
    env = _read_env(ADMIN_ENV)
    tok, _ = token_for(env['OS_ADMIN_USER'], env['OS_ADMIN_PASS'], env.get('OS_ADMIN_PROJECT', 'admin'))
    return tok


def pool_projects(atok):
    st, doc, _ = ks('GET', '/v3/projects', token=atok)
    if st != 200:
        return None
    return [p for p in doc.get('projects', []) if POOL_RE.match(p.get('name', ''))]


def free_ram_mb(atok):
    """Nova hypervisor stats via the VM's compute endpoint."""
    nova = KEYSTONE.replace('/identity', '/compute/v2.1')
    req = urllib.request.Request(nova + '/os-hypervisors/statistics')
    req.add_header('X-Auth-Token', atok)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())['hypervisor_statistics']['free_ram_mb']
    except Exception:
        return None  # guard fails CLOSED at the callsite


# ── Core operations ─────────────────────────────────────────────────────────────
def claim(uid):
    atok = admin_token()
    if not atok:
        return 500, {'error': 'KEYSTONE_ADMIN_AUTH_FAILED'}
    free = free_ram_mb(atok)
    if free is None or free < FLOOR_MB:
        # fail-closed headroom guard: a clear "full/unavailable", never a fake lab error
        return 503, {'error': 'CLOUD_FULL', 'free_ram_mb': free}
    with _lock:
        projects = pool_projects(atok)
        if projects is None:
            return 500, {'error': 'KEYSTONE_LIST_FAILED'}
        mine = [p for p in projects if p.get('hexworth_uid') == uid]
        if mine:
            proj = mine[0]
        else:
            free_slots = sorted((p for p in projects if not p.get('hexworth_uid')),
                                key=lambda p: p['name'])
            if not free_slots:
                return 503, {'error': 'POOL_EXHAUSTED', 'pool': len(projects)}
            proj = free_slots[0]
            st, _, _ = ks('PATCH', f"/v3/projects/{proj['id']}", token=atok,
                          body={'project': {'hexworth_uid': uid}})
            if st != 200:
                return 500, {'error': 'MAPPING_WRITE_FAILED'}
    slot = proj['name']
    pw = _read_env(POOL_STORE).get(slot)
    if not pw:
        return 500, {'error': 'POOL_PASSWORD_MISSING', 'slot': slot}
    utok, _ = token_for(slot, pw, slot)
    if not utok:
        return 500, {'error': 'POOL_USER_AUTH_FAILED', 'slot': slot}
    st, doc, _ = ks('POST', f'/v3/users/{_user_id(atok, slot)}/application_credentials',
                    token=utok,
                    body={'application_credential': {
                        'name': f'session-{int(time.time())}',
                        'description': f'hexworth session cred for {uid}'}})
    if st != 201:
        return 500, {'error': 'APP_CRED_CREATE_FAILED', 'status': st}
    ac = doc['application_credential']
    return 200, {'slot': slot, 'project': slot, 'cred_id': ac['id'],
                 'cred_secret': ac['secret']}


# ── Seed engine (Stage 4): create a genuinely broken state to REPAIR ────────────
# Why this exists: a lab that asks a student to read an error cannot be graded -- the
# cloud records nothing when it refuses you, so the only "evidence" is student-typed
# output, which is forgeable (proven by adversarial-wall.js). Repair is different:
# the repaired state IS real server-side state, so it is gradeable and unbeatable.
# This is what makes troubleshooting and permissions labs possible at all.
#
# Seeding runs as the POOL USER (never admin), so a scenario can only ever create what
# the student themselves could create -- a seed can never grant privilege or exceed quota.
SCENARIOS = ('orphaned-volume',)


def _os(utok, service, path, method='GET', body=None):
    """Call a non-Keystone service with the student's own token via the bridge address."""
    base = KEYSTONE.replace('/identity', '')
    req = urllib.request.Request(f'{base}{service}{path}', method=method)
    req.add_header('X-Auth-Token', utok)
    req.add_header('Content-Type', 'application/json')
    # Nova's DEFAULT microversion (2.1) returns flavor as {id, links} with no name, so
    # flavor_name came back empty and lab 2's check 15 could never pass. 2.47+ embeds the
    # flavor, including original_name. Sent only for compute; other services ignore it.
    # Measured 2026-07-31 -- this was found by qc-lab.sh failing the honest path, not by
    # reading docs.
    if service.startswith('/compute'):
        req.add_header('X-OpenStack-Nova-API-Version', '2.47')
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data, timeout=60) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, None
    except (urllib.error.URLError, socket.timeout, OSError):
        return 599, None


def _user_token(slot):
    pw = _read_env(POOL_STORE).get(slot)
    if not pw:
        return None
    tok, _ = token_for(slot, pw, slot)
    return tok


def seed(slot, scenario):
    """Idempotent: if the scenario's marker resources already exist, leave them alone."""
    if not POOL_RE.match(slot or ''):
        return 400, {'error': 'BAD_SLOT'}
    if scenario not in SCENARIOS:
        return 400, {'error': 'UNKNOWN_SCENARIO', 'known': list(SCENARIOS)}
    utok = _user_token(slot)
    if not utok:
        return 500, {'error': 'POOL_USER_AUTH_FAILED', 'slot': slot}

    if scenario == 'orphaned-volume':
        # The situation: a volume holding "data" is attached to a server that is no longer
        # wanted, and the 1-instance quota means that server blocks all new work. The student
        # must reclaim the quota WITHOUT destroying the volume -- detach, delete the server,
        # then attach the SAME volume to a server they build. The check verifies the volume's
        # original id survived, which a student who deletes and recreates cannot fake.
        st, doc = _os(utok, '/volume/v3', '/volumes/detail?name=orphan-vol')
        vols = [v for v in ((doc or {}).get('volumes') or []) if v.get('name') == 'orphan-vol']
        st2, doc2 = _os(utok, '/compute/v2.1', '/servers/detail')
        srvs = [x for x in ((doc2 or {}).get('servers') or []) if x.get('name') == 'ghost-srv']
        if vols and srvs:
            return 200, {'seeded': False, 'reason': 'already present',
                         'volume_id': vols[0]['id'], 'server_id': srvs[0]['id']}
        # Refuse to seed over a student's own in-flight work rather than clobbering it.
        # VOLUME BLIND SPOT fixed 2026-07-30 (Nancy): this checked only servers. The traced
        # failure: a student deletes just the volume and keeps ghost-srv -> no 409 -> we
        # create a NEW orphan-vol, then the server POST 500s on the 1-instance quota ->
        # the fresh volume is never cleaned up -> the NEXT seed sees volume+server and takes
        # the "already present" branch, handing back an id pair that was never attached.
        # Check 10 then becomes a permanent freebie for that student. Check both resource
        # types, and require them to be CONSISTENT before trusting an existing seed.
        others = [x for x in ((doc2 or {}).get('servers') or []) if x.get('name') != 'ghost-srv']
        other_vols = [v for v in ((doc or {}).get('volumes') or []) if v.get('name') != 'orphan-vol']
        if others or other_vols:
            return 409, {'error': 'PROJECT_NOT_EMPTY',
                         'detail': 'delete your existing server and volumes before starting this lab'}
        # Half-seeded debris (one resource without the other) is repaired, never reused:
        # reusing it would hand back an unattached pair and give away a check.
        if vols and not srvs:
            for v in vols:
                _os(utok, '/volume/v3', f"/volumes/{v['id']}", 'DELETE')
            vols = []
        if srvs and not vols:
            for x in srvs:
                _os(utok, '/compute/v2.1', f"/servers/{x['id']}", 'DELETE')
            time.sleep(8)
            srvs = []
        vol_id = vols[0]['id'] if vols else None
        if not vol_id:
            st, doc = _os(utok, '/volume/v3', '/volumes', 'POST',
                          {'volume': {'size': 1, 'name': 'orphan-vol',
                                      'description': 'seeded lab data volume'}})
            if st not in (200, 202):
                return 500, {'error': 'SEED_VOLUME_FAILED', 'status': st}
            vol_id = doc['volume']['id']
        for _ in range(24):
            st, doc = _os(utok, '/volume/v3', f'/volumes/{vol_id}')
            if (doc or {}).get('volume', {}).get('status') == 'available':
                break
            time.sleep(5)
        st, doc = _os(utok, '/compute/v2.1', '/images')
        imgs = (doc or {}).get('images') or []
        st, doc = _os(utok, '/compute/v2.1', '/flavors')
        flav = [f for f in ((doc or {}).get('flavors') or []) if f.get('name') == 'm1.nano']
        if not imgs or not flav:
            return 500, {'error': 'SEED_NO_IMAGE_OR_FLAVOR'}
        st, doc = _os(utok, '/compute/v2.1', '/servers', 'POST',
                      {'server': {'name': 'ghost-srv', 'imageRef': imgs[0]['id'],
                                  'flavorRef': flav[0]['id']}})
        if st not in (200, 202):
            return 500, {'error': 'SEED_SERVER_FAILED', 'status': st, 'detail': doc}
        srv_id = doc['server']['id']
        for _ in range(36):
            st, doc = _os(utok, '/compute/v2.1', f'/servers/{srv_id}')
            if (doc or {}).get('server', {}).get('status') in ('ACTIVE', 'ERROR'):
                break
            time.sleep(5)
        st, _ = _os(utok, '/compute/v2.1', f'/servers/{srv_id}/os-volume_attachments',
                    'POST', {'volumeAttachment': {'volumeId': vol_id}})
        if st not in (200, 202):
            return 500, {'error': 'SEED_ATTACH_FAILED', 'status': st}
        return 200, {'seeded': True, 'volume_id': vol_id, 'server_id': srv_id}
    return 400, {'error': 'UNKNOWN_SCENARIO'}


_uid_cache = {}
UID_CACHE_TTL = 600  # provision-pool.sh restarts this service on term reset, but a
                     # missed restart must degrade to 10 minutes of staleness, not forever


def _user_id(atok, name):
    hit = _uid_cache.get(name)
    if hit and time.time() < hit[1]:
        return hit[0]
    st, doc, _ = ks('GET', f'/v3/users?name={name}', token=atok)
    uid = doc['users'][0]['id'] if st == 200 and doc.get('users') else None
    if uid:
        _uid_cache[name] = (uid, time.time() + UID_CACHE_TTL)
    return uid


def delete_cred(slot, cred_id):
    if not POOL_RE.match(slot or ''):
        return 400, {'error': 'BAD_SLOT'}
    atok = admin_token()
    if not atok:
        return 500, {'error': 'KEYSTONE_ADMIN_AUTH_FAILED'}
    uid = _user_id(atok, slot)
    if not uid:
        return 404, {'error': 'NO_SUCH_USER'}
    st, _, _ = ks('DELETE', f'/v3/users/{uid}/application_credentials/{cred_id}', token=atok)
    # 404 counts as deleted (proven idempotent 2026-07-30: first 204, repeat 404)
    return 200, {'deleted': True, 'status': st}


def reconcile(active_ids):
    atok = admin_token()
    if not atok:
        return 500, {'error': 'KEYSTONE_ADMIN_AUTH_FAILED'}
    active = set(active_ids or [])
    checked = deleted = 0
    for slot in _read_env(POOL_STORE):
        uid = _user_id(atok, slot)
        if not uid:
            continue
        st, doc, _ = ks('GET', f'/v3/users/{uid}/application_credentials', token=atok)
        if st != 200:
            continue
        for ac in (doc or {}).get('application_credentials', []):
            checked += 1
            if ac['id'] not in active:
                ks('DELETE', f"/v3/users/{uid}/application_credentials/{ac['id']}", token=atok)
                deleted += 1
    return 200, {'checked': checked, 'deleted': deleted}


def verify(slot):
    """Authoritative cloud state for a slot, read SERVER-SIDE.

    Why this exists: cloud checks used to run `openstack ...` inside the student's own
    container via docker exec. That container gives the student NOPASSWD sudo, so they can
    replace the CLI with a shim that prints whatever the grader wants (verified live), and
    even without sudo `bash -lc` sources their ~/.bashrc so PATH poisoning does the same.
    Any check that asks the student's machine about the cloud is therefore forgeable.

    The cloud itself is the source of truth and this service can reach it, so grading reads
    from here. The container goes back to being the student's workspace, never the grader's
    witness. (Container-side checks remain correct where the container filesystem IS the
    subject -- linux-sandbox missions -- because there is no trusted value to forge there.)
    """
    if not POOL_RE.match(slot or ''):
        return 400, {'error': 'BAD_SLOT'}
    utok = _user_token(slot)
    if not utok:
        return 500, {'error': 'POOL_USER_AUTH_FAILED', 'slot': slot}
    st, sdoc = _os(utok, '/compute/v2.1', '/servers/detail')
    if st != 200:
        return 502, {'error': 'COMPUTE_QUERY_FAILED', 'status': st}
    st, vdoc = _os(utok, '/volume/v3', '/volumes/detail')
    if st != 200:
        return 502, {'error': 'VOLUME_QUERY_FAILED', 'status': st}
    # flavor + addresses added 2026-07-31 for Stage 4 lab 2 (launch chain). The lab's
    # checks 15/16 grade "right size" and "network attached"; without these two fields
    # they could never pass and the lab was uncompletable -- caught by qc-lab.sh before
    # it shipped. Both are flattened to plain, stable shapes so a grader never has to
    # know Nova microversion quirks: flavor_name is the human name, addresses is the
    # list of network names that actually carry an address.
    servers = [{'id': x.get('id'), 'name': x.get('name'), 'status': x.get('status'),
                'created': x.get('created'),
                'flavor_name': ((x.get('flavor') or {}).get('original_name')
                                or (x.get('flavor') or {}).get('name') or ''),
                'addresses': [n for n, lst in ((x.get('addresses') or {}).items())
                              if isinstance(lst, list) and lst],
                'volumes': [a.get('id') for a in (x.get('os-extended-volumes:volumes_attached') or [])]}
               for x in ((sdoc or {}).get('servers') or [])]
    volumes = [{'id': v.get('id'), 'name': v.get('name'), 'status': v.get('status'),
                'size': v.get('size'), 'created_at': v.get('created_at'),
                'attached_to': [a.get('server_id') for a in (v.get('attachments') or [])]}
               for v in ((vdoc or {}).get('volumes') or [])]
    # Security groups + their rules, added 2026-07-31 to unblock Stage 4 lab 3.
    # Same shape discipline as servers: flatten to plain fields so a grader never has to
    # know Neutron's nesting. Each group carries its rules already decoded, and each
    # server carries the group NAMES attached to it, so "is this group actually applied
    # to a machine" is answerable without a second round trip.
    st3, gdoc = _os(utok, '/networking', '/v2.0/security-groups')
    groups = [{'id': g.get('id'), 'name': g.get('name'),
               'rules': [{'direction': r.get('direction'),
                          'protocol': r.get('protocol'),
                          'port_min': r.get('port_range_min'),
                          'port_max': r.get('port_range_max'),
                          'remote_ip': r.get('remote_ip_prefix'),
                          'remote_group': r.get('remote_group_id')}
                         for r in (g.get('security_group_rules') or [])]}
              for g in ((gdoc or {}).get('security_groups') or [])]
    # Which groups are actually ON a server -- membership is what makes a rule real.
    for srv in servers:
        raw = next((x for x in ((sdoc or {}).get('servers') or []) if x.get('id') == srv['id']), {})
        srv['security_groups'] = [sg.get('name') for sg in (raw.get('security_groups') or [])]

    # Networks + subnets + routers, added 2026-07-31 for Stage 4 lab 5 (self-service
    # networking). Same flattening discipline as servers and security groups: a grader
    # should never have to know Neutron's nesting. `owned` distinguishes a network the
    # STUDENT built from the shared ones the cloud already provides -- that distinction
    # IS the lab.
    st4, ndoc = _os(utok, '/networking', '/v2.0/networks')
    st5, sdoc2 = _os(utok, '/networking', '/v2.0/subnets')
    st6, rdoc = _os(utok, '/networking', '/v2.0/routers')
    subs = {x.get('id'): x for x in ((sdoc2 or {}).get('subnets') or [])}
    networks = [{'id': n.get('id'), 'name': n.get('name'),
                 'shared': bool(n.get('shared')),
                 'external': bool(n.get('router:external')),
                 # "Theirs" = neither shared NOR external. Verified against live data:
                 # `public` is NOT flagged shared, yet Neutron shows it to every project
                 # because it is external -- so "not shared" alone wrongly counted the
                 # admin's external network as the student's own. Caught before any lab
                 # check was written against this field.
                 'owned': not bool(n.get('shared')) and not bool(n.get('router:external')),
                 'status': n.get('status'),
                 'subnets': [{'id': sid,
                              'name': (subs.get(sid) or {}).get('name'),
                              'cidr': (subs.get(sid) or {}).get('cidr'),
                              'gateway': (subs.get(sid) or {}).get('gateway_ip'),
                              'dhcp': bool((subs.get(sid) or {}).get('enable_dhcp'))}
                             for sid in (n.get('subnets') or [])]}
                for n in ((ndoc or {}).get('networks') or [])]
    routers = [{'id': r.get('id'), 'name': r.get('name'), 'status': r.get('status'),
                'owned': True,   # routers are only visible within the student's project
                # An external gateway is what makes a private network reachable outward.
                'external_gateway': bool((r.get('external_gateway_info') or {}).get('network_id')),
                'external_network': ((r.get('external_gateway_info') or {}).get('network_id'))}
               for r in ((rdoc or {}).get('routers') or [])]

    return 200, {'slot': slot, 'servers': servers, 'volumes': volumes,
                 'security_groups': groups, 'networks': networks, 'routers': routers}


def slot_of(uid):
    atok = admin_token()
    if not atok:
        return 500, {'error': 'KEYSTONE_ADMIN_AUTH_FAILED'}
    for p in pool_projects(atok) or []:
        if p.get('hexworth_uid') == uid:
            return 200, {'slot': p['name']}
    return 404, {'error': 'NO_SLOT'}


# ── HTTP layer ──────────────────────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):
    server_version = 'HexworthBridge/1.0'

    def _reply(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _authed(self):
        try:
            ok = self.headers.get('X-Bridge-Secret', '') == bridge_secret()
        except OSError:
            ok = False
        if not ok:
            self._reply(401, {'error': 'BAD_SECRET'})
        return ok

    def _body(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > 65536:
            return {}
        try:
            return json.loads(self.rfile.read(n))
        except Exception:
            return {}

    def log_message(self, fmt, *args):  # quiet; systemd journal captures stderr anyway
        pass

    def _safely(self, fn):
        try:
            fn()
        except Exception as e:  # noqa: broad -- last-resort boundary per Nancy concern 4
            try:
                self._reply(502, {'error': 'BRIDGE_INTERNAL', 'detail': type(e).__name__})
            except Exception:
                pass

    def do_GET(self):
        self._safely(self._get)

    def _get(self):
        if not self._authed():
            return
        if self.path == '/health':
            atok = admin_token()
            self._reply(200, {'ok': bool(atok),
                              'free_ram_mb': free_ram_mb(atok) if atok else None})
            return
        m = re.match(r'^/slot/([A-Za-z0-9]{5,128})$', self.path)
        if m:
            self._reply(*slot_of(m.group(1)))
            return
        self._reply(404, {'error': 'NOT_FOUND'})

    def do_POST(self):
        self._safely(self._post)

    def _post(self):
        if not self._authed():
            return
        b = self._body()
        if self.path == '/claim':
            uid, err = verify_id_token(b.get('id_token', ''))
            if err:
                self._reply(401, {'error': err})
                return
            if b.get('uid') and b['uid'] != uid:
                self._reply(401, {'error': 'UID_TOKEN_MISMATCH'})
                return
            self._reply(*claim(uid))
            return
        if self.path == '/reconcile':
            self._reply(*reconcile(b.get('active')))
            return
        if self.path == '/seed':
            self._reply(*seed(b.get('slot'), b.get('scenario')))
            return
        if self.path == '/verify':
            self._reply(*verify(b.get('slot')))
            return
        self._reply(404, {'error': 'NOT_FOUND'})

    def do_DELETE(self):
        self._safely(self._delete)

    def _delete(self):
        if not self._authed():
            return
        if self.path == '/cred':
            b = self._body()
            self._reply(*delete_cred(b.get('slot'), b.get('cred_id')))
            return
        self._reply(404, {'error': 'NOT_FOUND'})


if __name__ == '__main__':
    for p in (SECRET_PATH, POOL_STORE, ADMIN_ENV):
        if not os.path.exists(p):
            raise SystemExit(f'missing required 0600 file: {p}')
        mode = os.stat(p).st_mode & 0o777
        if mode & 0o077:
            raise SystemExit(f'{p} must be 0600 (is {oct(mode)})')
    srv = ThreadingHTTPServer((BIND, PORT), Handler)
    print(f'claim service on {BIND}:{PORT} (keystone {KEYSTONE})')
    srv.serve_forever()
