# OpenStack Cloud: durability, recovery, and the console

What survives a power cut, what does not, and how to check rather than assume. Written
2026-08-26 after a day in which the cloud went down mid-class and the lab could not be run.

---

## TLDR

| Layer | Comes back by itself? | How it is guaranteed |
|---|---|---|
| bc1 containers (traefik, cloudflared, lab-manager, horizon-proxy, vnc-proxy, status) | Yes | `restart: unless-stopped`, docker enabled at boot |
| bc1 student sessions | Yes | persisted to `/app/data/sessions.json`, restored on start |
| bc2 bridges (claim, api, vnc) | Yes | all three `systemctl enabled` |
| DevStack VM | Yes | libvirt `autostart: enable` |
| OpenStack services inside the VM | Yes | 20/20 `devstack@*` units enabled, apache2 enabled |
| Student instances | Yes | `resume_guests_state_on_host_boot = true` in `nova-cpu.conf` |

**Verified by actually rebooting bc2 on 2026-08-26**, not by reading config: cold boot at
00:47:16, every service active unaided, DevStack VM running, identity endpoint answering
HTTP 300 about 45 seconds later.

Re-check any time with `bash _tools/openstack-bridge/restart-audit.sh` on bc2.

---

## The one thing that does NOT restart: nothing. But two things nearly weren't declared.

`horizon-proxy` and `vnc-proxy` were created with bare `docker run` and referenced by no file.
A reboot brought them back, because a restart policy does not care whether a container is
declared — but `docker compose down && up`, or a fresh host build, would silently not recreate
them, and the entire Horizon path (dashboard AND instance console) would vanish with no error
anywhere. Both are now in `docker-compose.yml` and compose-managed.

**The lesson generalises:** "it survives a reboot" and "it can be rebuilt" are different
properties. The restart policy gave the first and hid the absence of the second.

---

## The console: why students could not log in, and what fixed it

The noVNC console shows the **guest operating system**, not Horizon. A student's Horizon
username and password are not an answer to `ubuntu login:` — different system entirely. That
confusion cost a class period.

Worse, the sprint image deliberately baked **no credential** ("the student sets the password
themselves with `sudo passwd ubuntu`"), which deadlocks: you cannot run `passwd` without a
shell, and the console was the only way to a shell.

**Fixed by baking console autologin into the image.** A student opens the console and lands at
`ubuntu@<host>:~$` with nothing to type. They can still set a password themselves for
Mission 2's peer SFTP, so the original refusal to ship a shared credential is preserved.

Autologin is written into `build-sprint-image.sh` (asserted on **both** gettys — noVNC shows
`tty1` while the console-log API reads `ttyS0`; covering one and assuming the other is how this
silently half-works).

### Two traps that cost hours

1. **`curl` cannot verify a console.** It sends no `Origin` header, so Nova's console proxy
   never runs its origin check: I had `101 Switching Protocols` and even the `RFB 003.008`
   server greeting through the full public chain while every real browser was closed with
   "Origin header does not match". Nova needs `[console] allowed_origins`. **Test with a
   browser** — `node _tools/openstack-bridge/verify-novnc-console.js <pw> <cookie> [slot]`.
2. **The console websocket is ROOT-relative.** noVNC builds it as `protocol://host + '/' + path`
   and Horizon passes `path="?token=..."`, so it dials `wss://host/?token=...` regardless of what
   prefix the page is served under. That is why `vnc-proxy` has *two* traefik routers: one for
   `/novnc`, one matching the bare path plus a token query with `addPrefix`.

---

## Peer connectivity: students can now ping each other

Each student has their own project, and a project's `default` security group allows all
protocols only from **itself** (`remote_group = self`). Two students are in different projects,
so nothing reached anything — which is why the sprint uses `nmap -Pn` and why "ping your
partner" never worked.

`bash _tools/openstack-bridge/allow-peer-icmp.sh` adds an **ICMP-only** ingress rule scoped to
the shared lab subnet (`192.168.233.0/24`, **not** `0.0.0.0/0`) to every pool project's default
group. Idempotent. TCP still requires the explicit per-peer `/32` rules the sprint teaches, so
the security lesson is intact; only reachability testing is restored.

Verified cross-project: `PINGTEST 192.168.233.49 REACHABLE`, `192.168.233.175 REACHABLE`.

**Not automatic for new projects.** The script walks the projects that exist when it runs. If
the pool is ever extended past `student-50`, re-run it.

---

## Do NOT run the image build while the cloud is live

`build-sprint-image.sh` took the whole cloud down mid-class on 2026-08-25.

The DevStack VM is allocated **26G of bc2's 31G**, leaving roughly 5G of headroom. The build
adds `qemu-nbd`, a chroot running `apt`, and a 4G image write. The host tipped over, the OOM
killer chose the largest process, and the largest process is the cloud:

```
Aug 25 11:17:36 bc2 systemd: machine.slice: killed by the OOM killer
Aug 25 11:17:36 bc2 systemd-machined: Machine qemu-2-openstack-stage1 terminated
```

The script now **refuses** while the VM is running unless `ALLOW_LIVE_BUILD=1`.

### Build images by SNAPSHOT instead

The safe path, which needs no `qemu-nbd` and no host memory:

1. Boot one instance with cloud-init that configures it, then `cloud-init clean` and powers off
2. `openstack server image create` from the SHUTOFF instance (by **ID** — admin cannot resolve a
   server in a student project by name without `--all-projects`)
3. **Make it `--public`** — a snapshot is private to its creating project, so a private image
   renamed into place is invisible to every student
4. **Verify the candidate under its own name** — boot from it, and run
   `SPRINT_IMAGE=<candidate> bash sprint-student-walkthrough.sh`
5. Only then archive the old image by **rename** and promote the candidate

Step 5 last is the whole point. Renaming the working image away *before* its replacement
existed left students with no image at all and a class that could not start.

---

## Access when Tailscale is blocked

bc2 is tailscale-only. **Zscaler runs as a client on the operator's laptop**, so it intercepts on
office wifi *and* on a phone hotspot — egress shows `165.225.x.x` and `136.226.x.x`, both
Zscaler, and Tailscale stays `offline` with `rx 0` either way. Switching networks does not help.

Route through bc1 instead, which is reachable over its Cloudflare tunnel:

```
ssh bc1-cf            # works from anywhere
ssh bc1-cf "ssh bc2 '<command>'"
```

Students are unaffected — everything they touch is published through Cloudflare and Firebase.
Confirm from any network with `bash _tools/openstack-bridge/office-reachability-check.sh`.

---

## Not in git, and it matters

`lab-manager/server.js` — the grader for every cloud lab — lives **only on bc1**. The exposure
gate correctly refuses it here because it carries a real node address and this repo is public.
It therefore has no version history: a rebuild of that host loses it. Its home should be the
private infra repo.
