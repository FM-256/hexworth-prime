#!/usr/bin/env python3
"""Point Nova's console URL at the PUBLIC address instead of this VM's private one.

Horizon does not invent the console URL: it repeats novncproxy_base_url back to the browser.
It was http://<vm-private>:6080/vnc_lite.html, so every student's console iframe pointed at an
address only this host can reach. The page loaded and the screen stayed black, which is why the
break survived so long -- nothing 404s, nothing errors, it just never paints.
"""
import pathlib, re, shutil, subprocess, sys

P = pathlib.Path('/etc/nova/nova-cpu.conf')
NEW = 'https://sandbox.hexworth.tech/novnc/vnc_lite.html'
s = P.read_text()
m = re.search(r'^novncproxy_base_url\s*=\s*(.+)$', s, re.M)
if not m:
    sys.exit('  ABORT: novncproxy_base_url not found')
old = m.group(1).strip()
if old == NEW:
    print('  already set to the public URL')
else:
    shutil.copy2(P, str(P) + '.bak-novnc-url')
    s = s[:m.start(1)] + NEW + s[m.end(1):]
    P.write_text(s)
    print('  novncproxy_base_url updated (was a private address, now the public console route)')

print('  restarting nova-compute...')
r = subprocess.run(['systemctl', 'restart', 'devstack@n-cpu'], capture_output=True, text=True)
if r.returncode != 0:
    r = subprocess.run(['systemctl', 'restart', 'devstack@n-cpu.service'], capture_output=True, text=True)
print('  restart rc=', r.returncode, (r.stderr or '').strip()[:120])
