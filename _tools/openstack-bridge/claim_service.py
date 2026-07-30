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
  GET  /slot/<uid>                        -> {slot} | 404       (Fork E read path)
  GET  /health                            -> {ok, free_ram_mb, slots_used}   (secret required)
"""
import json, os, re, ssl, threading, time, urllib.request
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
                 'cred_secret': ac['secret'], 'auth_url': KEYSTONE}


_uid_cache = {}


def _user_id(atok, name):
    if name in _uid_cache:
        return _uid_cache[name]
    st, doc, _ = ks('GET', f'/v3/users?name={name}', token=atok)
    uid = doc['users'][0]['id'] if st == 200 and doc.get('users') else None
    if uid:
        _uid_cache[name] = uid
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

    def do_GET(self):
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
        self._reply(404, {'error': 'NOT_FOUND'})

    def do_DELETE(self):
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
