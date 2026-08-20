# Power loss, 2026-08-20 03:22 — what recovered itself and what lied

Second power failure in two days. All five servers came back. The interesting part is the
comparison: yesterday's fixes were tested for real, one held, and one monitoring gap that had
been invisible turned out to be the most serious finding of the night.

## The fix from 2026-08-19 held

**All 7 student OpenStack instances returned `ACTIVE` with no intervention.**

After the 08-18 outage every guest came back `SHUTOFF`, nobody noticed, and it took a user report
a day later to surface. `resume_guests_state_on_host_boot = True` in `/etc/nova/nova-cpu.conf` is
the difference. First real test, passed.

The devstack `Restart=on-failure` drop-ins also held: zero failed units on bc2.

## The serious finding: Prometheus was down and the port said 200

`prometheus` was `Exited (255)` from 03:22:14 — the moment of the cut — and **did not restart**,
despite `--restart unless-stopped`. It started cleanly by hand afterwards with no error, so this
was a failure to be restarted, not a failure to start.

**With Prometheus down, no rules evaluate. Every alert built on 08-18 and 08-19 was silent** —
including the OpenStack compute alerts written specifically so a repeat of the nova-compute
outage could not go unnoticed. Alertmanager was up the whole time, which makes the dashboard look
healthier than the system was.

And it presented as healthy:

```
curl localhost:9090/-/healthy   ->  200
```

That 200 is **cockpit-tls**, which owns 9090 on this host. Prometheus publishes on **9091**
(`"9090/tcp": [{"HostPort": "9091"}]`). A port check aimed at the obvious number returns success
from an unrelated service.

This is the same trap the service probe already documents for PXE — *"apache2 won the port-80 boot
race and the host kept serving a placeholder while PXE was dead"* — and it was nearly repeated
here during diagnosis. **Check what answered, not that something answered.**

Follow-up worth doing: find out why `unless-stopped` did not restart it, and add a check that
Prometheus itself is scraping — a monitoring system that cannot report its own absence is the one
component that must not be monitored only by itself.

## The mount that could not have come back

`/mnt/neon-shared` on bc1 was unmounted. Two independent causes, either alone enough:

**1. Boot race.** `mount error: could not resolve address for neon-server: Unknown error` at
03:22:49. `_netdev` waits for the network, not for name resolution, and a failed fstab mount is
never retried.

**2. The name now resolves to the wrong address.** `neon-server` resolves via MagicDNS to the
tailnet address, where **445 is ACL-blocked — correctly, because SMB is a LAN service**.

Only neon's building-LAN NICs answer on 445. The tailnet address does not, by design, and
neither do its other subnets. Exact addresses are in `~/hexworth-infra-private/` — this repo is
public and does not carry node addresses.

Fixed both: the fstab entry now names the LAN address of neon's share (see the private inventory) and carries
`nofail,x-systemd.automount,x-systemd.mount-timeout=30`, so a boot-time race defers to first
access and retries instead of failing permanently. Backup at `/etc/fstab.bak-pre-neon-mount-fix-2026-08-20`.

⚠ A diagnostic step here read a **wrong LAN address** out of the probe config and concluded
"SMB is down on neon". Samba was running the whole time and listening on `0.0.0.0:445`. The
conclusion was reversed by checking the service on the host itself rather than trusting a port
probe against an address that had been guessed.

## ⚠ Security: the share credential is in plaintext

`/etc/fstab` on bc1 carries `username=` and `password=` inline for the CIFS mount. Anything that
can read `/etc/fstab` — which is world-readable by default — has the neon share credential.

Not introduced tonight and not exploited, but it was displayed during diagnosis before being
noticed. It should move to a root-owned `credentials=` file (`0600`) and the password should be
rotated on the assumption it is known. Left as an operator decision rather than changed in the
middle of an incident.

## Final state

```
servers            5/5 up  (bc1, bc2, neon, bc4, hexclass)
failed units       neon: NetworkManager-wait-online   hexclass: openipmi   (both pre-existing)
OpenStack          7/7 instances ACTIVE, nova-compute up, placement offering candidates
service probe      7/7 up, fresh
prometheus         restarted; 5 rule groups loaded, 6/6 scrape targets up
compute metrics    hexworth_openstack_up{nova_compute}=1, {placement_capacity}=1
platform           hexworth.com 200, sandbox API 200, /dashboard 401 (gate holding)
qualifier box      verify-qual-box.js 12/12 (Firestore unaffected)
```

## Related

- `_docs/operations/openstack-nova-compute-outage-2026-08-19.md` — where the resume fix came from
- `_docs/operations/power-loss-recovery-2026-08-18.md` — the first event
- `_tools/monitoring/probe/service-probe.sh` — the PXE check whose comment predicted the 9090 trap
