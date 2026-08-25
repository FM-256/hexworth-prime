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
import calendar, json, os, re, secrets, socket, threading, time, urllib.error, urllib.request
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
def token_after_rotation(slot, pw, attempts=4):
    """Issue a project-scoped token that SURVIVES the password change just made.

    Keystone writes a revocation event when a password changes, and those events carry only
    SECOND resolution. A token issued in the same wall-clock second as the change is judged
    to predate the revocation and is rejected with 401 on first use. Critically, the token
    REQUEST still succeeds - the token is born dead - so the failure is invisible at auth
    time and surfaces downstream. That is exactly how this appeared in production on
    2026-08-20: every claim reported APP_CRED_CREATE_FAILED while auth looked healthy, and
    all 14 claimed slots ended up mapped to a student with zero credentials.

    Sleeping past the second boundary is the fix; USING the token is the proof. A token that
    authenticates but 401s on use is worse than no token at all, so this never returns one it
    has not exercised against a real call.
    """
    for _ in range(attempts):
        time.sleep(1.0 - (time.time() % 1.0) + 0.15)
        utok, _ = token_for(slot, pw, slot)
        if utok and ks('GET', '/v3/auth/projects', token=utok)[0] == 200:
            return utok
    return None


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
            # This uid ALREADY holds this slot: a re-claim, not a hand-over. Load-bearing for
            # the rotation decision below - see the comment there.
            proj = mine[0]
            fresh_assignment = False
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
            # Slot is changing hands. A PREVIOUS student may still have its password on screen.
            fresh_assignment = True
    slot = proj['name']
    # ROTATE ONLY ON A FRESH ASSIGNMENT.
    #
    # Rotation exists to kill a password a DIFFERENT student may still be holding, so it is
    # required when a slot changes hands, and again at teardown (see delete_cred). Neither of
    # those is a re-claim. When the SAME uid re-claims a slot it already owns there is no other
    # student to protect against, and the only thing a rotation accomplishes is invalidating the
    # console password THIS student is currently typing.
    #
    # That was a live defect, not a theoretical one. claim() runs on every launch, so re-launching
    # the TERMINAL silently killed the student's Horizon session - and cloud-openstack-console.lab.html
    # tells them, in step 1, to keep the console open in a SECOND TAB and work between the two.
    # Measured on bc1 2026-08-20: student-11 re-claimed 5 times, student-13 and student-05 3 times
    # each, one pair 23 seconds apart. Every one of those killed a working console login. The lab
    # page told them the password only changes "when your lab ends", which is not what this did.
    #
    # Rotating FIRST and authenticating with the new value is still correct on the fresh path, for
    # the reason the previous comment here gave: it guarantees the password handed out is the one
    # now in Keystone, so the Horizon half can never silently keep an older value than the CLI half.
    # The CLI is unaffected by any of this either way - it uses an application credential, never
    # this password.
    if fresh_assignment:
        pw = rotate_password(atok, slot)
        if not pw:
            return 500, {'error': 'PASSWORD_ROTATE_FAILED', 'slot': slot}
        utok = token_after_rotation(slot, pw)
    else:
        # Re-claim: hand back the password already live in Keystone so an open console tab keeps
        # working. token_after_rotation is reused rather than a bare token_for because its real
        # value is the second half - it USES the token before returning it. A stored password that
        # no longer authenticates must be discovered here, not downstream.
        try:
            pw = _read_env(POOL_STORE).get(slot)
        except Exception:
            pw = None  # store unreadable: fall through to the rotate path, never throw
        utok = token_after_rotation(slot, pw) if pw else None
        if not utok:
            # Either nothing is stored for this slot, or the store has drifted from Keystone.
            # Rotating is the documented self-heal for exactly that state (see rotate_password:
            # "admin can always reset it, which is exactly what the next claim does"). A student
            # who gets no working credential is worse off than one whose console tab needs a
            # fresh login, so this fails toward issuing a usable password.
            pw = rotate_password(atok, slot)
            if not pw:
                return 500, {'error': 'PASSWORD_ROTATE_FAILED', 'slot': slot}
            utok = token_after_rotation(slot, pw)
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
    # horizon_* is the web-console half. The CLI still uses the app credential and the student
    # never sees it; only this password is ever displayed, once, because a human has to type it
    # into a login form. Its lifetime is the session's — see rotate_password().
    return 200, {'slot': slot, 'project': slot, 'cred_id': ac['id'],
                 'cred_secret': ac['secret'],
                 'horizon_user': slot, 'horizon_password': pw, 'horizon_domain': 'Default'}


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
# The image the rescue-lab seed boots. It MUST be named, never taken by list position: Glance
# returns newest-first, so before this existed the lab booted whatever image had most recently
# been uploaded to the cloud. Overridable for a term where cirros is rebuilt under another name.
SEED_IMAGE = os.environ.get('SEED_IMAGE', 'cirros-0.6.3-x86_64-disk')


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
        # Glance, NOT the Nova image proxy. `/compute/v2.1/images` was Nova's proxy to
        # Glance and has been REMOVED from modern Nova -- measured on this cloud it returns
        # HTTP 404, so `imgs` came back empty and every seed died with
        # SEED_NO_IMAGE_OR_FLAVOR, making the Rescue lab unlaunchable for every student.
        # Glance `/image/v2/images` returns HTTP 200 with cirros-0.6.3-x86_64-disk, and its
        # entries carry the same 'id' field the server create below already uses.
        st, doc = _os(utok, '/image/v2', '/images')
        imgs = (doc or {}).get('images') or []
        st, doc = _os(utok, '/compute/v2.1', '/flavors')
        flav = [f for f in ((doc or {}).get('flavors') or []) if f.get('name') == 'm1.nano']
        if not imgs or not flav:
            return 500, {'error': 'SEED_NO_IMAGE_OR_FLAVOR'}
        # NAME the image, and verify it FITS the flavor. This used to be imgs[0], which trusted
        # Glance's default ordering -- newest first. That made the Rescue lab's boot image
        # whatever had been uploaded to this cloud most recently, by anyone, for any reason.
        #
        # Measured 2026-08-24: a newly built ubuntu-24.04-sprint (min_ram 512, min_disk 4) took
        # position 0, and since the seed hard-codes the tiny m1.nano flavor (192MB / 1GB), every
        # student launch failed -- "Could not build this lab environment" -- for a lab whose
        # image had not changed. Nothing in the lab was broken; an unrelated upload moved it.
        #
        # The flavor here is fixed and very small, so the image is chosen to fit it. The
        # name-match is the intended path; the fits-the-flavor scan is the safety net for a term
        # where cirros has been renamed or rebuilt.
        f_ram = flav[0].get('ram') or 0
        f_disk = flav[0].get('disk') or 0
        img = (next((i for i in imgs if i.get('name') == SEED_IMAGE), None)
               or next((i for i in imgs
                        if (i.get('min_ram') or 0) <= f_ram
                        and (i.get('min_disk') or 0) <= f_disk), None))
        if not img:
            return 500, {'error': 'SEED_NO_IMAGE_FITS_FLAVOR',
                         'flavor': flav[0].get('name'), 'ram': f_ram, 'disk': f_disk}
        # A network MUST be named explicitly. Two shared networks exist on this cloud (the
        # second was added so lab 2 could teach that --network is mandatory), and Nova
        # refuses a create that does not say which one to use. The seed never specified one,
        # so once the second network appeared this create started failing and took the whole
        # Rescue lab down -- every student got "Could not build this lab environment".
        st, doc = _os(utok, '/networking', '/v2.0/networks')
        nets = (doc or {}).get('networks') or []
        pick = (next((n for n in nets if n.get('name') == 'shared'), None)
                or next((n for n in nets if n.get('shared')), None)
                or (nets[0] if nets else None))
        if not pick:
            return 500, {'error': 'SEED_NO_NETWORK'}
        st, doc = _os(utok, '/compute/v2.1', '/servers', 'POST',
                      {'server': {'name': 'ghost-srv', 'imageRef': img['id'],
                                  'flavorRef': flav[0]['id'],
                                  'networks': [{'uuid': pick['id']}]}})
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


def _write_pool_store(values):
    """Rewrite POOL_STORE atomically, 0600, preserving every slot we did not touch.

    tmp+rename because a torn write here locks the bridge out of a slot: it authenticates AS
    the pool user, so a half-written store means POOL_PASSWORD_MISSING on the next claim.
    """
    tmp = POOL_STORE + '.tmp'
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as f:
        for k in sorted(values):
            f.write(f'{k}={values[k]}\n')
    os.replace(tmp, POOL_STORE)


def rotate_password(atok, slot):
    """Set a fresh random Keystone password on the pool user; return it. None on failure.

    This is the "temporary passwords" half of the identity bridge (design doc fork B): an
    application credential is strictly better for the CLI, but HORIZON CANNOT CONSUME ONE --
    its login form takes username/password/region and has no app-cred path (verified against
    the live form 2026-08-19). So the web console needs a human-typeable secret, and the only
    way that stays safe is to make its lifetime equal the session's.

    Rotation happens at BOTH ends: a fresh value at claim, and another at teardown that nobody
    is ever told. So a password a student saw is dead the moment their lab is reaped, and a
    screenshot of it is worthless afterwards.

    ORDER MATTERS: Keystone first, store second. If the store write fails after Keystone
    accepted the change, this slot's password is unknown to us -- but NOT lost, because admin
    can always reset it, which is exactly what the next claim does. The failure is therefore
    self-healing on retry. The reverse order would leave the store claiming a password Keystone
    never accepted, which fails closed but stays broken until a human intervenes.
    """
    uid = _user_id(atok, slot)
    if not uid:
        return None
    pw = secrets.token_urlsafe(18)
    st, _, _ = ks('PATCH', f'/v3/users/{uid}', token=atok,
                  body={'user': {'password': pw}})
    if st != 200:
        return None
    try:
        store = _read_env(POOL_STORE)
        store[slot] = pw
        _write_pool_store(store)
    except Exception:
        # Keystone already took it. Report failure so the caller does not hand out a password
        # the bridge itself can no longer use; the next claim resets it via admin.
        return None
    return pw


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

    # Kill the Horizon half too. Deleting only the app credential would revoke the CLI while
    # leaving the web password the student was shown fully valid — they could keep using the
    # console after their lab was reaped, and a screenshot would stay live indefinitely. The
    # new value is discarded deliberately: nobody needs it, and the next claim rotates again.
    rotated = rotate_password(atok, slot) is not None
    return 200, {'deleted': True, 'status': st, 'password_rotated': rotated}


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


def release(uid):
    """Return this uid's slot to the pool. The pool had NO release path at all until now.

    WHY THIS DID NOT EXIST, and why that was the real bug behind taskboard #275. claim() binds
    hexworth_uid to a project and nothing ever unbound it. reconcile() only deletes stale
    application credentials; it never touches the binding. The single line anywhere in this
    system that sets hexworth_uid back to None lived in reclaim-idle-slots.py, a sweeper on the
    WRONG HOST that had therefore never run once. So a slot was held for life: 50 slots was not
    a concurrency limit, it was a lifetime cap on distinct users, students included.

    OPERATOR POLICY, 2026-08-11: a slot is released when the student finishes the course, and
    the student tears their own sandbox down as part of finishing.

    ⚠ RELEASE ON THE LAST SANDBOX COURSE, NOT ANY COURSE. A binding is per-UID and this service
    has no concept of a course at all, so one student holds one slot across every course they
    take. Releasing when they finish course A would yank the slot they are still using for
    course B, mid-lab, with their servers attached. Deciding "this uid has no sandbox course
    still open" is a platform-side question; this endpoint only executes the decision.

    ⚠ THE EMPTINESS GUARD IS THE SAFETY PROPERTY, not the caller's good intentions. Unbinding
    does NOT free anything: the servers and volumes stay exactly where they are, the next
    student to claim that slot inherits them, and they keep counting against the FLOOR_MB
    headroom guard in claim(), so a recycled pool can report free slots while every claim
    returns CLOUD_FULL. Refusing to release a slot that still holds anything is what keeps that
    from happening, and it is also what makes a mis-targeted call harmless: the worst case is a
    student with an empty slot re-claiming one.

    Nothing here deletes a cloud resource. It clears a pointer. If the slot still holds work,
    the work stays and so does the binding.
    """
    atok = admin_token()
    if not atok:
        return 500, {'error': 'KEYSTONE_ADMIN_AUTH_FAILED'}
    if not uid:
        return 400, {'error': 'UID_REQUIRED'}
    with _lock:
        projects = pool_projects(atok)
        if projects is None:
            return 500, {'error': 'KEYSTONE_LIST_FAILED'}
        mine = [p for p in projects if p.get('hexworth_uid') == uid]
        if not mine:
            # Idempotent: releasing a uid that holds nothing is a no-op, not an error, because
            # a completion event may be delivered more than once.
            return 200, {'released': False, 'reason': 'NO_SLOT_BOUND'}
        proj = mine[0]
        slot = proj['name']

        suid = _user_id(atok, slot)
        creds = 0
        if suid:
            st, doc, _ = ks('GET', f'/v3/users/{suid}/application_credentials', token=atok)
            creds = len((doc or {}).get('application_credentials') or [])
        utok = _user_token(slot)
        srv = vol = 0
        if utok:
            _s, sd = _os(utok, '/compute/v2.1', '/servers/detail')
            srv = len((sd or {}).get('servers') or [])
            _s, vd = _os(utok, '/volume/v3', '/volumes/detail')
            vol = len((vd or {}).get('volumes') or [])
        elif suid:
            # Could not read the slot's own state. Refuse rather than guess: releasing a slot
            # we cannot inspect is exactly how someone's work ends up under a stranger.
            return 200, {'released': False, 'reason': 'SLOT_STATE_UNREADABLE', 'slot': slot}

        if creds or srv or vol:
            return 200, {'released': False, 'reason': 'SLOT_NOT_EMPTY', 'slot': slot,
                         'creds': creds, 'servers': srv, 'volumes': vol}

        st, _, _ = ks('PATCH', f"/v3/projects/{proj['id']}", token=atok,
                      body={'project': {'hexworth_uid': None}})
        if st != 200:
            return 500, {'error': 'MAPPING_CLEAR_FAILED', 'slot': slot}
        return 200, {'released': True, 'slot': slot}


_PID_CACHE = {}      # slot -> (project_id, expires_at); projects change only at term reset
_ATOK_CACHE = [None, 0]   # [token, expires_at]; Keystone tokens outlive this TTL comfortably


def _cached_admin_token(ttl=1500):
    """Admin token, reused across /verify calls. Issued per-call this would add a Keystone
    round trip to every Check My Work, and /verify is the hot path for every cloud lab."""
    now = time.time()
    if _ATOK_CACHE[0] and now < _ATOK_CACHE[1]:
        return _ATOK_CACHE[0]
    tok = admin_token()
    if tok:
        _ATOK_CACHE[0], _ATOK_CACHE[1] = tok, now + ttl
    return tok


def _slot_project_id(slot, atok, ttl=3600):
    """Project id for a pool slot. Slot name IS the project name (see claim())."""
    hit = _PID_CACHE.get(slot)
    if hit and time.time() < hit[1]:
        return hit[0]
    for p in (pool_projects(atok) or []):
        _PID_CACHE[p['name']] = (p['id'], time.time() + ttl)
    hit = _PID_CACHE.get(slot)
    return hit[0] if hit else None


def _deleted_servers(slot, window_h=24, cap=8):
    """Servers this slot created and then DELETED, with the times they attached a volume.

    WHY THIS EXISTS (BUG-058). The cinder lab's check 6 claims to prove "the volume outlived
    its first server". Nothing in the end state can prove that: attaching is not history
    bearing, so any final arrangement is reachable by a five-command shortcut that never
    detaches anything. Cinder drops its attachment rows on detach and Nova empties
    volumes_attached on delete (both measured 2026-07-31), which is why the check was
    downgraded to a timestamp comparison that every shortcut passes.

    Nova does keep one thing: the instance row for a deleted server, and its ACTION log.
    So "you attached a volume to a server that no longer exists" IS answerable, server-side,
    from state the student cannot reach. That is the missing witness.

    TWO MEASURED TRAPS, both of which would have produced a confidently wrong grade:

      1. `deleted=True` is admin-only and Nova SILENTLY IGNORES it for a project user --
         asked with student-48's own token it returned that slot's LIVE ACTIVE server
         (measured 2026-08-25). A grader trusting the user token would read a running
         server as a deleted one. Hence the admin token, and hence the explicit
         status == 'DELETED' filter rather than trusting the query parameter to have been
         honoured at all.
      2. Nova keeps deleted-instance rows FOREVER, and a slot is recycled between students,
         so this list carries other people's runs. It is returned raw, timestamps included;
         anchoring it to the volume under test is the CALLER's job (check 6 requires the
         attach to postdate the volume's own creation). release() refuses a non-empty slot,
         so a recycled slot never carries a volume, which is what makes that anchor sound.

    Returns (list, ok). `ok` is False when the history could not be read, so a check can tell
    "no history" apart from "history unavailable" instead of silently failing an honest
    student on an infrastructure blip.
    """
    atok = _cached_admin_token()
    if not atok:
        return [], False
    pid = _slot_project_id(slot, atok)
    if not pid:
        return [], False
    st, doc = _os(atok, '/compute/v2.1',
                  f'/servers/detail?all_tenants=1&deleted=True&tenant_id={pid}&limit=20')
    if st != 200 or doc is None:
        return [], False
    cutoff = time.time() - window_h * 3600
    out = []
    for s in (doc.get('servers') or []):
        # Trust the STATUS, not the filter: see trap 1 above.
        if s.get('status') != 'DELETED' or s.get('tenant_id') != pid:
            continue
        try:
            born = calendar.timegm(time.strptime(s.get('created', ''), '%Y-%m-%dT%H:%M:%SZ'))
        except (ValueError, TypeError):
            continue
        if born < cutoff:
            continue     # someone else's term, or debris; bounds the action calls below
        out.append({'id': s.get('id'), 'name': s.get('name'), 'created': s.get('created'),
                    'terminated_at': s.get('OS-SRV-USG:terminated_at'), 'attach_volume_at': []})
    out.sort(key=lambda d: d['created'], reverse=True)
    out = out[:cap]
    for d in out:
        sta, adoc = _os(atok, '/compute/v2.1', f'/servers/{d["id"]}/os-instance-actions')
        if sta != 200 or adoc is None:
            return out, False    # partial history is worse than none: say so
        d['attach_volume_at'] = sorted(
            a.get('start_time') for a in (adoc.get('instanceActions') or [])
            if a.get('action') == 'attach_volume' and a.get('start_time'))
    return out, True


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
    # Router INTERFACES, added 2026-07-31 after Nancy proved lab 5 could be passed 4/4
    # with the router never connected to the student's subnet -- an honest student who
    # skips one line got told they had "a way out" when they had none. An external
    # gateway alone is not connectivity; the router must also hold an interface ON the
    # subnet. Ports carry that, so map router -> subnet ids it actually terminates.
    st7, pdoc = _os(utok, '/networking', '/v2.0/ports')
    _rif = {}
    for prt in ((pdoc or {}).get('ports') or []):
        if str(prt.get('device_owner') or '').startswith('network:router_interface'):
            _rif.setdefault(prt.get('device_id'), []).extend(
                [f.get('subnet_id') for f in (prt.get('fixed_ips') or []) if f.get('subnet_id')])
    routers = [{'id': r.get('id'), 'name': r.get('name'), 'status': r.get('status'),
                'interface_subnets': _rif.get(r.get('id'), []),
                'owned': True,   # routers are only visible within the student's project
                # An external gateway is what makes a private network reachable outward.
                'external_gateway': bool((r.get('external_gateway_info') or {}).get('network_id')),
                'external_network': ((r.get('external_gateway_info') or {}).get('network_id'))}
               for r in ((rdoc or {}).get('routers') or [])]

    # Identity, added 2026-07-31 for Stage 4 lab 6 (Keystone reduced-privilege).
    # An application credential can be RESTRICTED to a subset of the creating user's roles;
    # that restriction is the whole lesson, so roles are flattened to plain names and
    # `unrestricted` is surfaced explicitly. Keystone needs the user id, which the token
    # response carries -- _user_token returns only the token string, so ask Keystone who
    # this token belongs to rather than guessing.
    app_creds = []
    who_st, who, _hdrs = ks('GET', '/v3/auth/tokens', token=utok, body=None)
    uid = None
    if who_st == 200 and who:
        uid = (((who.get('token') or {}).get('user')) or {}).get('id')
    else:
        # Keystone validates a token via X-Subject-Token; fall back to that shape.
        try:
            req = urllib.request.Request(KEYSTONE + '/v3/auth/tokens', method='GET')
            req.add_header('X-Auth-Token', utok)
            req.add_header('X-Subject-Token', utok)
            with urllib.request.urlopen(req, timeout=20) as r:
                doc = json.loads(r.read() or b'{}')
                uid = (((doc.get('token') or {}).get('user')) or {}).get('id')
        except Exception:
            uid = None
    if uid:
        ac_st, ac, _h2 = ks('GET', f'/v3/users/{uid}/application_credentials', token=utok)
        if ac_st == 200 and ac:
            app_creds = [{'id': c.get('id'), 'name': c.get('name'),
                          'unrestricted': bool(c.get('unrestricted')),
                          'roles': sorted([(r.get('name') or '') for r in (c.get('roles') or [])]),
                          'expires_at': c.get('expires_at')}
                         for c in (ac.get('application_credentials') or [])]

    hist, hist_ok = _deleted_servers(slot)

    return 200, {'slot': slot, 'servers': servers, 'volumes': volumes,
                 'security_groups': groups, 'networks': networks, 'routers': routers,
                 'app_creds': app_creds,
                 'deleted_servers': hist, 'deleted_servers_ok': hist_ok}


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
        if self.path == '/release':
            # AUTHED BY THE BRIDGE SECRET, NOT A STUDENT TOKEN, unlike /claim. Course
            # completion is decided platform-side by a server reacting to an event, and that
            # server does not hold the student's id_token. Accepting a uid from a
            # secret-holding caller is therefore the only shape that works.

            # That is only acceptable because release() refuses any slot that still holds
            # credentials, servers or volumes. A mis-targeted call cannot strand anyone's
            # work; the worst it can do is make a student with an empty slot claim a new one.
            # If the guard is ever loosened, this route needs an id_token like /claim does.
            self._reply(*release(b.get('uid')))
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
