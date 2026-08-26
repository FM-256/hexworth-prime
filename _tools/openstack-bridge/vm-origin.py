#!/usr/bin/env python3
"""Let the console proxy accept the PUBLIC origin.

Nova's websocketproxy checks the browser's Origin header against its own host and closes the
socket when they differ. Now that students reach the console at sandbox.hexworth.tech rather
than the VM's own address, every real browser was rejected with
    ValidationError: Origin header does not match
while curl sailed through -- curl sends no Origin at all. That gap is why the transport tested
green (101 Switching Protocols, RFB 003.008 greeting) while the actual console stayed black.
A protocol handshake is not a working console.
"""
import configparser, pathlib, shutil, subprocess, sys

ORIGIN = 'sandbox.hexworth.tech'
changed = []
for path in ('/etc/nova/nova.conf', '/etc/nova/nova_cell1.conf'):
    P = pathlib.Path(path)
    if not P.exists():
        continue
    c = configparser.RawConfigParser()
    c.read(path)
    if not c.has_section('console'):
        c.add_section('console')
    cur = c.get('console', 'allowed_origins', fallback='')
    if ORIGIN in cur:
        print(f'  {path}: already allows {ORIGIN}')
        continue
    shutil.copy2(path, path + '.bak-origin')
    c.set('console', 'allowed_origins', ORIGIN if not cur else f'{cur},{ORIGIN}')
    with open(path, 'w') as f:
        c.write(f)
    changed.append(path)
    print(f'  {path}: allowed_origins -> {ORIGIN}')

if not changed:
    print('  no config change needed')
r = subprocess.run(['systemctl', 'restart', 'devstack@n-novnc-cell1'], capture_output=True, text=True)
print('  novncproxy restart rc=', r.returncode, (r.stderr or '').strip()[:100])
