#!/usr/bin/env python3
"""Return Horizon credentials for a session the caller ALREADY owns.

THE BUG. Credentials are attached only where the cloud slot is FIRST claimed, so a student who
reloads the lab page, navigates back, or clicks Launch twice gets the same session with those
fields stripped. The page skips the whole panel when horizonPassword is absent, so the area is
never built. Measured: 1st launch PRESENT, 2nd launch on the SAME session MISSING.

The password is the student's own slot password, already sent to this same authenticated account
on the first launch, so re-issuing it to the same owner discloses nothing new.

Indentation is read from the file, never transcribed -- a terminal paste already cost two
attempts here.
"""
import pathlib, re, sys

P = pathlib.Path('/home/eq1/hexworth-sandbox/lab-manager/server.js')
lines = P.read_text().split('\n')

# 1. keep the credentials on the session record
hits = [i for i, l in enumerate(lines) if 'osCred: osClaim ?' in l]
if len(hits) != 1:
    sys.exit(f'ABORT: session record matched {len(hits)}')
i = hits[0]
ind = re.match(r'\s*', lines[i]).group(0)
lines[i + 1:i + 1] = [
    ind + '// Kept so a RELOAD can be answered. Without this the console panel exists for',
    ind + '// exactly one response and can never be shown again for the life of the session.',
    ind + 'horizon: (osClaim && osClaim.horizon_password)',
    ind + '  ? { user: osClaim.horizon_user, password: osClaim.horizon_password } : undefined,',
]
print('  session record: horizon credentials retained')

# 2. both existing-session returns re-issue them
targets = [i for i, l in enumerate(lines) if 'cloudSlot: existing.osCred ? existing.osCred.slot : null }' in l]
if len(targets) != 2:
    sys.exit(f'ABORT: existing-session returns matched {len(targets)}, expected 2')
for i in reversed(targets):                     # reverse so earlier indices stay valid
    ind = re.match(r'\s*', lines[i]).group(0)
    lines[i] = lines[i].replace(' }', ',')      # close later, after the spread
    lines[i + 1:i + 1] = [
        ind + '...(existing.horizon',
        ind + '  ? { horizonUrl: `https://${DOMAIN}/dashboard`,',
        ind + '      horizonUser: existing.horizon.user,',
        ind + '      horizonPassword: existing.horizon.password }',
        ind + '  : {}) }',
    ]
print('  both existing-session returns re-issue the credentials')
P.write_text('\n'.join(lines))
