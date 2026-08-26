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

## The pool: how many students can start at once

Twenty simultaneous launches on 2026-08-26 produced **six successes and fourteen
`POOL_EXHAUSTED`**. The pool held 50 projects, 44 already bound — six free, six succeeded. The
arithmetic was exact, and a class of twenty could not have started.

The pool is now **80 slots**. Re-running the same twenty: **20/20, 20 distinct slots, 6.4s.**

### Two ceilings, and they fail differently

Confusing them is what made this hard to see. Check both with
`bash _tools/openstack-bridge/pool-capacity.sh` (on bc2):

| Ceiling | Error | What it really caps | Recovers? |
|---|---|---|---|
| Free slots | `POOL_EXHAUSTED` | distinct users **ever** — a slot binds to a uid for life | No, only by release |
| Free RAM | `CLOUD_FULL` | instances running **at once**, below `HEADROOM_FLOOR_MB` | Yes, on delete |

A pool with free slots and no RAM refuses every claim, and so does the reverse. Currently 34
free slots against RAM for 35 more instances — deliberately balanced, so neither runs out first.

**Slots are sticky for life by design** (operator policy, 2026-08-11): released when the student
finishes their *last* sandbox course, and the emptiness guard refuses to release a slot that
still holds work. So "free slots" only ever decreases. Watch it; it is the number that ran out.

### Why I did not see it coming

I asked `dump-slot-uids.py`, which **reports only the first 30 slots**, and read "20 free" off a
truncated list. A capacity number taken from a paginated source is not a capacity number.
`pool-capacity.sh` asks the allocator the same question the allocator asks itself, over the
whole pool, and counts what it gets.

### Extending it again

1. `bash provision-pool.sh <N>` on bc2 — idempotent, but **slow**: every check is a separate
   SSH into the VM, so 80 slots is several hundred round trips and roughly 20 minutes. It is
   not hung.
2. **Re-run `allow-peer-icmp.sh`** — it walks the projects that exist *when it runs*, so new
   slots have no peer-ICMP rule until it is run again (`added=30, already-had=50, failed=0`).
3. `pool-capacity.sh` to confirm free **and credentialed** — a slot with no password in
   `pool-credentials.env` looks free and fails on claim.
4. `node concurrency-test.js <N>` on bc1 to prove it.

`provision-pool.sh` set `--ram 192` per slot, below the 512MB the sprint image needs. It failed
loudly on in-use slots (`Quota limit 192 ... must be >= already used 512`) but would have
silently downgraded every empty one. Now 512.

### The test is a file now, and it costs no slots

`node _tools/openstack-bridge/concurrency-test.js [N]` on bc1. It uses **N fixed identities**,
because the bridge binds a slot to a uid permanently — a harness that invents a random identity
per run eats a slot per run forever, which is how the pool was walked down before — and it hands
every slot back in `finally`. Verified: pool returns to exactly its prior free count after each
run.

Beyond counting successes it asserts **no two uids got the same slot**. `claim()` serialises
assignment under one lock, and that property had never been tested under real concurrency; a
success count cannot see that bug, and two students sharing a slot would see and grade each
other's servers.

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

---

## Where each piece of today's configuration lives

Asked "is everything documented?", the answer was no until this section existed. Checked, not
assumed.

| Change | Recorded in |
|---|---|
| Console autologin in the image | `build-sprint-image.sh` (asserted on both gettys) |
| Apache `/novnc/` proxy on the VM | `vm-novnc.py` |
| Nova `novncproxy_base_url` -> public | `vm-novnc-url.py` |
| Nova `[console] allowed_origins` | `vm-origin.py` |
| bc2 noVNC tailnet bridge | `openstack-vnc-bridge.service` (addresses parameterised) |
| bc1 console front + routers | `lab-manager-docker-compose.yml` (`vnc-proxy`, `horizon-proxy`) |
| Image snapshot / verify / promote / restore | `img-snap2.sh`, `img-verify-candidate.sh`, `img-swap.sh`, `img-restore-img.sh` |
| Peer ICMP on the shared subnet | `allow-peer-icmp.sh` (re-run after extending the pool) |
| Pool capacity, both ceilings | `pool-capacity.sh` |
| N-way simultaneous launch proof | `concurrency-test.js` |
| Per-slot quota (512MB, was 192) | `provision-pool.sh` |
| Restart posture audit | `restart-audit.sh` |
| Reachability from any network | `office-reachability-check.sh` |
| Browser-based console verification | `verify-novnc-console.js` |
| Horizon panel fix (credentials on reload) | `fix-horizon-panel.py` |
| Live-build guard | inside `build-sprint-image.sh` |

### Deliberately NOT in this repo

- **`lab-manager/server.js`** — the grader for every cloud lab. Carries a real node address and
  this repo is public, so the exposure gate refuses it. It has **no version history anywhere**
  and would be lost with bc1. Its home is the private infra repo. This is the largest remaining
  gap in the platform.
- **Node addresses** — every script takes them from `hexworth-infra-private/openstack.env`.
- **`FREE_PLAY_CAP=32`** — lives in bc1's `.env`. The compose default is still `12`, which is
  what throttled the class on 2026-08-25 while 28 container slots sat idle. A fresh host build
  will come up at 12 unless the `.env` is restored with it.

### A trap worth naming

`restart-audit.sh` and `setup-novnc-console.sh` both *check* that
`openstack-vnc-bridge` is running. That reads as coverage. Neither contained the unit, so the
audit would have reported a missing service with no way to restore it. **A check is not a
backup.** If a script asserts something exists, the thing it asserts should be recoverable from
the same repo.
