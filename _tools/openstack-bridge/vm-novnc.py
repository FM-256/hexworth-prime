#!/usr/bin/env python3
"""Give the DevStack VM an internal route to its own noVNC proxy.

WHY. Horizon hands the browser a console URL pointing at this VM's private libvirt address on
port 6080. No student browser can route to that, so the console PAGE loaded and only the VNC
view failed -- which is why it looked healthy for so long.

WHY THROUGH PORT 80 rather than exposing 6080. The tailnet ACL between bc1 and bc2 permits only
8080 and 9711; 6080 and 22 both time out (measured, not assumed). Opening 6080 is a change in
the Tailscale admin console, which is the operator's to make. Port 80 already rides the
permitted 8080 forward, so the console uses the path that already works.

upgrade=websocket is load bearing: noVNC fetches the page over HTTP and then upgrades the SAME
path to a websocket for the RFB stream, so one ProxyPass has to serve both.
"""
import pathlib, subprocess, sys

P = pathlib.Path('/etc/apache2/sites-available/horizon.conf')
s = P.read_text()
if '/novnc/' in s:
    print('  novnc bridge already present in the vhost')
else:
    if s.count('</VirtualHost>') != 1:
        sys.exit(f'  ABORT: expected 1 </VirtualHost>, found {s.count("</VirtualHost>")}')
    BLOCK = (
        "\n    # noVNC console bridge (2026-08-25). See _tools/openstack-bridge notes.\n"
        "    # Tunnelled through port 80 because the tailnet ACL permits only 8080/9711.\n"
        "    # upgrade=websocket carries the RFB stream on the same path as the page.\n"
        "    ProxyPass /novnc/ http://127.0.0.1:6080/ upgrade=websocket\n"
        "    ProxyPassReverse /novnc/ http://127.0.0.1:6080/\n"
    )
    P.write_text(s.replace('</VirtualHost>', BLOCK + '</VirtualHost>', 1))
    print('  ProxyPass inserted into the horizon vhost')

print('  configtest:', subprocess.run(['apache2ctl', 'configtest'], capture_output=True,
                                      text=True).stderr.strip().splitlines()[-1])
subprocess.run(['systemctl', 'reload', 'apache2'], check=True)
print('  apache reloaded')
