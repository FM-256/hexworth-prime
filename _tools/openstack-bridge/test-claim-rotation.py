#!/usr/bin/env python3
"""Regression test for claim()'s rotate-only-on-fresh-assignment behaviour.

WHY THIS EXISTS
    claim() used to rotate the pool user's Keystone password on EVERY call. That is correct when
    a slot changes hands (the previous student may still have the old password on screen) and
    wrong when the same student re-claims a slot they already hold: the only thing it invalidates
    is the console password THAT student is currently using.

    It was not theoretical. cloud-openstack-console.lab.html step 1 tells students to keep Horizon
    open in a second tab and work between it and the terminal, so every terminal re-launch killed
    their console login. Measured on bc1 2026-08-20: student-11 re-claimed 5 times, student-13 and
    student-05 3 times each, one pair 23 seconds apart.

    The risk in fixing it is the opposite failure: NOT rotating when we should, or handing back a
    stored password that no longer authenticates. Both are worse than the bug. Hence this test.

    Every case asserts on whether rotate_password was CALLED, not merely on the returned payload —
    a test that only checked the password value would pass even if rotation fired anyway.

@catalog what    prove claim() rotates on fresh assignment and NOT on re-claim, and self-heals
@catalog run     python3 _tools/openstack-bridge/test-claim-rotation.py
@catalog status  TOOL
"""
import os
import sys
import types

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

# Import without touching the network or the real credential files.
os.environ.setdefault('KEYSTONE_URL', 'http://127.0.0.1:1/identity')
import importlib.util
spec = importlib.util.spec_from_file_location('claim_service', os.path.join(HERE, 'claim_service.py'))
cs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cs)

RESULTS = []


def case(name, *, existing_uid, stored_pw, stored_readable=True, token_works=True):
    """Drive claim() with everything external stubbed. Returns (status, body, calls)."""
    calls = {'rotate': 0, 'mapping_patch': 0}
    SLOT = 'student-07'
    ROTATED_PW = 'ROTATED-newvalue'

    cs.admin_token = lambda: 'admin-tok'
    cs.free_ram_mb = lambda atok: 999999
    cs.pool_projects = lambda atok: [
        {'id': 'p1', 'name': SLOT, 'hexworth_uid': existing_uid},
    ]

    def fake_rotate(atok, slot):
        calls['rotate'] += 1
        return ROTATED_PW
    cs.rotate_password = fake_rotate

    def fake_read_env(path):
        if not stored_readable:
            raise FileNotFoundError(path)
        return {SLOT: stored_pw} if stored_pw else {}
    cs._read_env = fake_read_env

    def fake_token_after_rotation(slot, pw, attempts=4):
        # The stored password authenticates only when the fixture says so; a freshly rotated
        # password always does. This is what distinguishes "store drifted" from "store fine".
        if pw == ROTATED_PW:
            return 'utok'
        return 'utok' if token_works else None
    cs.token_after_rotation = fake_token_after_rotation

    def fake_ks(method, path, token=None, body=None, auth=None):
        if method == 'PATCH' and '/v3/projects/' in path:
            calls['mapping_patch'] += 1
            return 200, None, {}
        if method == 'POST' and 'application_credentials' in path:
            return 201, {'application_credential': {'id': 'cid', 'secret': 'csecret'}}, {}
        return 200, {}, {}
    cs.ks = fake_ks
    cs._user_id = lambda atok, slot: 'uid-1'

    st, body = cs.claim('student-uid-abc')
    RESULTS.append((name, st, body, calls))
    return st, body, calls


def check(label, cond, detail=''):
    mark = 'ok  ' if cond else 'FAIL'
    print(f'  {mark} {label}' + (f'  -- {detail}' if detail and not cond else ''))
    return cond


ok = True
print('=== claim() rotation policy ===')

# 1. RE-CLAIM, stored password healthy -> must NOT rotate, must hand back the SAME password.
st, body, calls = case('reclaim-healthy', existing_uid='student-uid-abc', stored_pw='LIVE-pw')
ok &= check('re-claim returns 200', st == 200, f'got {st} {body}')
ok &= check('re-claim does NOT rotate', calls['rotate'] == 0, f"rotate called {calls['rotate']}x")
ok &= check('re-claim hands back the LIVE password',
            body.get('horizon_password') == 'LIVE-pw', f"got {body.get('horizon_password')}")
ok &= check('re-claim does not re-map the project', calls['mapping_patch'] == 0)

# 2. FRESH assignment -> MUST rotate. This is the security property; if this ever stops firing,
#    a slot changing hands would leave the previous student's password valid.
st, body, calls = case('fresh-assignment', existing_uid=None, stored_pw='STALE-pw')
ok &= check('fresh returns 200', st == 200, f'got {st} {body}')
ok &= check('fresh DOES rotate', calls['rotate'] == 1, f"rotate called {calls['rotate']}x")
ok &= check('fresh hands back the ROTATED password',
            body.get('horizon_password') == 'ROTATED-newvalue', f"got {body.get('horizon_password')}")
ok &= check('fresh maps the project to this uid', calls['mapping_patch'] == 1)

# 3. RE-CLAIM but the stored password no longer authenticates (store drifted from Keystone)
#    -> must self-heal by rotating rather than failing the claim.
st, body, calls = case('reclaim-drifted', existing_uid='student-uid-abc',
                       stored_pw='WRONG-pw', token_works=False)
ok &= check('drifted store still returns 200', st == 200, f'got {st} {body}')
ok &= check('drifted store self-heals by rotating', calls['rotate'] == 1,
            f"rotate called {calls['rotate']}x")
ok &= check('drifted store hands back the ROTATED password',
            body.get('horizon_password') == 'ROTATED-newvalue')

# 4. RE-CLAIM with no stored value at all -> rotate, never throw.
st, body, calls = case('reclaim-empty-store', existing_uid='student-uid-abc', stored_pw=None)
ok &= check('empty store returns 200', st == 200, f'got {st} {body}')
ok &= check('empty store rotates', calls['rotate'] == 1)

# 5. RE-CLAIM with an UNREADABLE store -> must not raise into the request thread.
try:
    st, body, calls = case('reclaim-unreadable-store', existing_uid='student-uid-abc',
                           stored_pw='x', stored_readable=False)
    ok &= check('unreadable store returns 200 (no unhandled throw)', st == 200, f'got {st} {body}')
    ok &= check('unreadable store rotates', calls['rotate'] == 1)
except Exception as e:
    ok = False
    print(f'  FAIL unreadable store raised into the caller: {type(e).__name__}: {e}')

print()
print('PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
