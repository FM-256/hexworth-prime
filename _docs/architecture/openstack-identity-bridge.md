# OpenStack Stage 3 -- Identity Bridge (scope)

**Status:** DESIGN RESOLVED (marathon 2026-07-30) -- Nancy design pass PROCEED-WITH-CONDITIONS;
conditions incorporated below. Build authorized under Frank's marathon directive ("we are building
the labs based on openstack"). One item flagged for Frank's eventual sign-off, not blocking:
Fork F ships CLI-only first, deferring the Horizon half of his original "how will students log in"
ask to its own future review (Nancy's rec, adopted).

## RESOLUTIONS (marathon 2026-07-30, Nancy design pass)

| Fork | Resolution |
|---|---|
| A (claim service) | ON bc2, tailnet-only bind + shared secret in bc2 0600 store mirrored in bc1 `.env`. **Plus Nancy's auth condition: bc1 forwards the student's Firebase ID TOKEN; bc2 verifies it against Google's public JWKS (aud = hexworth-prime) and enforces non-anonymous provider server-side.** Verification needs no Firebase credential. A leaked bc1 secret alone therefore mints nothing -- an attacker also needs a valid signed token for the target uid. |
| B (credential type) | Application credentials ONLY, **restricted** (never `--unrestricted` -- Nancy concern 4: unrestricted creds can mint trusts/further creds, far wider than a 1-instance student needs). Created per session, deleted at teardown. No passwords exist in Stage 3 at all. |
| C (pool/quota) | Pool 30, quota 1 instance / 1 core / 192MB = m1.nano exactly (measured; ~5.8GB flavor-RAM worst case). Headroom guard: claim service refuses new claims below a free-RAM floor so exhaustion reads "cloud is full", never a fake Nova "No valid host found". **Re-measure VM free RAM immediately before build (Nancy concern 6: the 13,306MB figure is a day old).** |
| D (term reset) | Delete-and-recreate projects each term, announced. |
| E (graded path) | Resolved-by-design now, not later (Nancy concern 3): uid->project resolution for future grading goes through the claim service's read-only `GET /slot/<uid>` (same auth), whose truth is Keystone itself -- see mapping below. |
| F (Horizon) | **PARTIALLY RESOLVED 2026-08-19.** Frank ruled: build it. The CREDENTIAL half is shipped and proven — `rotate_password()` in the claim service sets a fresh Keystone password at claim and another at teardown, returned as `horizon_user`/`horizon_password`. Verified against the live login form: HTTP 302 + `sessionid` cookie. App creds were tested to SURVIVE rotation (201 after), so the CLI is unaffected. **The EXPOSURE half is NOT shipped and still needs the Nancy pass this row always called for** — Horizon has no public route, and putting a login form for 50 predictable usernames (`student-01`..`student-50`) on the internet without CF Access in front is the decision that has not been made. |

**Sticky mapping -- Nancy killed both my options and the kill produced the design:** the mapping
lives in **Keystone project properties** (`openstack project set --property hexworth_uid=<uid>
student-NN`). It is exactly as durable as the project it describes, wiped atomically by the same
term reset (Fork D), recovered by `project list --long`, and needs no new storage, no backup story,
no Firebase credential on bc2. Firestore was rejected for the real reason (an admin-SDK credential
cannot be meaningfully scoped to one collection -- it would widen bc2's blast radius into the
platform's data layer), local SQLite for Nancy's reason (unverified durability, silent Fork E
dependency).

**Preconditions to verify ON-BOX before build** (Nancy, all six): (1) server.js uid label +
cleanupOrphans shape unchanged after today's two patches; (2) image's openstacksdk accepts
`auth_type: v3applicationcredential`; (3) Keystone admin can list/delete OTHER users' app creds;
(4) DELETE on a nonexistent app-cred ID is 404-tolerant for the reconciler; (5) claim service runs
under systemd `Restart=always`; (6) re-measure VM free RAM.

## DEPLOYED 2026-07-30 (marathon)

All six preconditions verified on-box before build (records in session transcript):
P1 uid label `server.js:575` + cleanupOrphans 10-min interval intact; P2 sdk loads the
`v3applicationcredential` plugin in the shipped image; P3/P4 proven at the REST layer --
admin cross-user DELETE 204, repeat 404, list 200 (the CLI lacks `--user` on BOTH create and
delete, so the service self-creates as the pool user and the reconciler deletes via REST);
P5 systemd unit `Restart=always` installed; P6 re-measured 13,316MB available (matches baseline).

**Design correction found by probe:** Keystone app creds are SELF-SERVICE. The claim service
authenticates AS the pool user using admin-set random passwords held only in bc2's 0600 store
(`pool-credentials.env`); restricted is the API default (probe: `unrestricted=False`).

**Nancy implementation review (PROCEED-WITH-CONDITIONS), all conditions applied:** quota
512MB -> 192MB (30x512 of quota-legal demand exceeded the 13.3GB real capacity; 192MB = m1.nano
EXACTLY AS MEASURED on this DevStack -- `flavor show m1.nano` says ram=192, not the folklore 128;
first deployed at 128 which blocked every m1.nano boot with a quota 403, corrected same hour;
5.8GB flavor-RAM / ~7.5GB real worst case -- the boot-time headroom gap is closed by
arithmetic, the per-claim guard stays as belt-and-suspenders); provisioner self-heals the
user-exists-but-password-unstored strand; term reset restarts the service + uid cache TTLs 10min;
ks() returns clean 599 on transport failure and handlers reply 502 rather than dropping sockets;
claim response no longer carries the bc2-internal Keystone URL.

**Public endpoint flip (found by e2e, fixed 2026-07-30):** `openstack server create` hung
indefinitely from containers while every list worked. Debug trace: python-novaclient (which OSC
uses for flavor/server-create calls) takes its endpoint from the TOKEN CATALOG, ignoring
clouds.yaml `*_endpoint_override` -- and the catalog advertised `http://192.168.122.62/...`
(VM-internal, unreachable from bc1). Correct-path fix, the same one a production cloud uses: the
PUBLIC interface endpoints now advertise the reachable bridge address
(`http://<bc2-addr>:8080/...`, all 7 services; archive of prior URLs at
`bc2:~/endpoint-archive/`). Verified in-VM admin flows still work (the VM reaches the bridge
address in 9ms) and container creates reach Nova. Endpoint overrides remain in clouds.yaml as
belt-and-suspenders but are no longer load-bearing.

**Live state:** claim service active on bc2 (tailnet-only :9711, health ok), pool provisioned,
bc1 lab-manager patched (9 anchored replacements, node --check PASS, targeted rebuild, 0 sessions
disrupted). Launch response now carries `cloudMode: personal|read-only` + `cloudSlot`. Fallback
on any bridge failure is the baked read-only clouds.yaml -- degraded to telescope mode, stated in
the response, never silent, never broken.
**Origin:** Frank 2026-07-29, after driving Stage 2b's Horizon login: *"how will the students log
in? we need to automate that. generating temporary passwords... so that if they generate a cloud
instance it lives with the openstack also."* Prereqs SHIPPED: Stage 1 (cloud), Stage 2a (read-only
CLI lab), Stage 2b (Horizon behind CF Access).

## The problem Stage 3 solves

Today every student shares ONE read-only account (`student-view`, project-scoped `reader`). They
can look; they cannot build. A cloud course whose students never launch an instance is the same
defect class as the "labs that are quizzes in disguise" finding that started this whole arc.

## The architectural fact that makes this worth building

**The container is only a CLI client; the CLOUD is the persistent layer.** An instance a student
launches lives in OpenStack on bc2 and SURVIVES their sandbox container being reaped at the
120-minute lifetime. Give a student their own project and their work persists across relaunches,
across days, across the whole term -- which is exactly Frank's "it lives with the openstack."
Nothing else in the platform's lab fleet has that property today.

## Verified-capable mechanisms (probed live in the VM 2026-07-29, not assumed)

| Mechanism | Probe result |
|---|---|
| Per-project quotas | `openstack quota set --instances 2 --cores 2 --ram 1024 demo-readonly` applied; `quota show` confirms cores 2 / instances 2 / ram 1024 |
| Roles available | `admin manager anotherrole reader member ResellerAdmin service` -- `member` is the writable student role |
| Application credentials | supported (`application credential create` incl `--unrestricted`) -- the password-free alternative, see fork B |
| Project-scoped isolation | already PROVEN in 2a: leak canary invisible, `--all-projects` 403, writes 403 by role |
| Client version | openstackclient 9.0.0 on DevStack 2026.1 |

## Design

**Pool, not on-demand.** `student-01`..`student-NN` projects + matching users, each with the
`member` role on its own project and a pre-set quota. Pre-provisioned by script, re-provisioned per
term from the snapshot. On-demand creation is rejected: it puts Keystone writes on the student
launch path (slow, failure-prone) and leaks projects when sessions die.

**Claim-on-launch, server-side.** lab-manager already knows the Firebase `uid` on every launch
(`server.js:369`, labels containers `hexworth.uid`). Flow:
1. Student launches the OpenStack lab.
2. lab-manager asks the **claim service** for this uid's project. Sticky mapping in Firestore
   (`openstack_projects/{uid}` -> `student-NN`): a returning student gets THEIR project back, with
   their instances still running in it.
3. The claim service sets a **fresh random password** on that project's Keystone user (admin
   credential never leaves bc2), returns it once.
4. lab-manager injects it into the container's `clouds.yaml` at start -- **the student never sees
   or types the CLI credential**, exactly like today's read-only path.
5. For **Horizon**, the same generated credential is displayed ONCE on the lab page (a human must
   type it into a web form -- unavoidable), and rotated at session end.

**Rotation = the temporary-password requirement.** Password lifetime == session lifetime. Session
ends (reap, idle, explicit destroy) -> password rotated to a fresh random value -> the old one is
dead. The PROJECT and its instances persist; only the credential is ephemeral.

## Where this lives

The claim service is the one real decision (fork A). Everything else is settled:
lab-manager gains ~40 lines (call claim, inject clouds.yaml, notify on teardown); the platform
side gains a Horizon-credential display panel on the openstack hub; Firestore holds the sticky
mapping; a provisioning script holds the pool.

## Open forks for Frank

- **A. Where does the claim service run?** (1) inside lab-manager on bc1 -- fewest moving parts,
  but bc1 would hold Keystone admin credentials, widening blast radius beyond the reader account;
  (2) a tiny service ON bc2 (where admin creds already live) that lab-manager calls over the
  existing tailnet bridge, returning only a scoped password. **Rec: (2)** -- keeps Keystone admin
  on the one host that already has it, and the bridge is proven.
- **B. Passwords or application credentials?** App creds are revocable, scoped, and never a
  human-typeable secret -- strictly better for the CLI. But **Horizon login cannot consume an app
  credential**, so a typeable password is still required for the web console. **Rec: app creds for
  the CLI container + a rotated password for Horizon**, i.e. both, each where it fits.
- **C. Pool size and quota per student. CORRECTED 2026-07-29 (Nancy): my first numbers were
  arithmetically FALSE by our own Stage 1 measurements.** I wrote pool 30 x 2 instances and
  claimed it fit in ~13GB. It does not: 60 worst-case instances x ~235MB = ~14.1GB against
  13,306MB available, and 60 also blows past the measured ~45-50 instance ceiling. With
  `ram_allocation_ratio=1.0` pinned, the failure mode is Nova "No valid host found" -- which is
  ALSO a seeded troubleshooting-lab scenario in this same course, so a capacity exhaustion would
  be indistinguishable from an intentional lab failure. Corrected options:
  - **REC: pool 30, quota 1 instance / 1 core / 512MB.** Worst case 30 instances ~7.05GB --
    comfortably inside both limits, and one m1.nano is all the current labs need.
  - Alternative if 2 instances is pedagogically required: pool 20 (40 x 235 = ~9.4GB), which
    then contradicts the roster-driven pool-30 sizing.
  - Either way, add a headroom guard so student launches refuse before the cloud reaches the
    measured ceiling, rather than surfacing as a fake lab failure.
  **Frank confirms; do not treat the original numbers as a live recommendation.**
- **D. Term reset policy.** Delete-and-recreate student projects each term (clean slate, students
  lose old work) vs preserve. **Rec: delete-and-recreate**, announced to students, matching the
  VM's rebuild-per-term policy.
- **E. Does the graded path depend on this?** Stage 3's graded challenges (`/check` running
  server-side `openstack ...` against the student's project) require per-student projects, so this
  bridge is the prerequisite for cloud labs ever being GRADED rather than explored.

## Nancy PAUSE 2026-07-29 -- three gaps to close BEFORE Frank rules on the forks

1. **Capacity math was false** -- corrected in Fork C above.
2. **Rotation-on-teardown does not match the code that exists.** Verified in `server.js`:
   `sessions` is an in-memory Map (line 128) with ZERO persistence -- a lab-manager restart forgets
   every issued credential with no reconciliation path; Sablier's idle-stop deliberately PAUSES and
   keeps the session (line 380 comment) so "idle" is NOT a rotation event today; and the only
   delete path, `cleanupOrphans`, runs on a 10-minute interval keyed to `createdAt`, so even the
   reap trigger lags up to 10 minutes and has no credential hook. **The doc's central safety claim
   ("the old password is dead") therefore describes code that does not exist.** Stage 3 must
   specify per-path behavior explicitly (which reaper calls rotate; whether idle-but-alive sessions
   keep a live Horizon password; how a restart reconciles orphaned live credentials -- likely a
   persisted issued-credential record, which also makes rotation auditable) and the "~40 lines"
   estimate is wrong until it does.
3. **Stage 3 IS the Horizon-widening event Stage 2b pre-committed to gating.** Stage 2b's record
   says widening past Frank-only requires a mandatory fresh Nancy pass; per-student Horizon
   credentials are exactly that. It must be presented to Frank as its own FORK, not inside this
   doc's "settled" bucket. Added as **Fork F: authorize student Horizon access (requires its own
   review pass), or ship Stage 3 CLI-only first and widen Horizon separately.** Rec: CLI-only
   first -- it delivers persistent per-student cloud work with zero browser-typed credentials.
4. **Fork A needs an auth answer, not a reuse claim.** "The bridge is proven" covers a dumb socat
   forward; a password-minting claim service is new code with a new requirement. Under 2a's stated
   trust model any tailnet peer could call an unauthenticated claim service and mint credentials
   for any student's writable project. Fork A must specify what authenticates lab-manager to it
   (rec: a shared secret in bc2's 0600 store + tailnet-only bind, both, not tailnet membership
   alone).
5. **BUG-050 fallback.** If Frank rules "accept anonymous as-is," the hard prerequisite has no
   resolution and Stage 3 must NOT silently downgrade it. In that case the bridge re-scopes:
   claims require a non-anonymous provider regardless of the platform-wide ruling (Stage 3 sets
   its own floor), or Stage 3 waits.
6. **Quota-restore honesty note:** no `demo-readonly` quota baseline was captured before my probe.
   The restored 10/20/51200 matches Nova's stock default quota class, so it is very likely correct
   -- but it is inferred from a known default, not verified against a recorded original.

## Dependencies and honest limits

- **BUG-050 must be fixed first.** Anonymous tokens can currently launch containers; a pool of 30
  writable cloud projects handed out on anonymous claims is a materially worse exposure than a
  shared read-only account. This is a hard ordering dependency, not a preference.
- Session extension (the Cisco-style +15min, not built) interacts: a longer session means a longer
  live credential. Extension should rotate on extend, or cap total credential lifetime.
- The 40-container bc1 pool and the ~45-50-instance bc2 ceiling are separate limits; a full class
  can exhaust bc1 containers before touching the cloud ceiling.
- Horizon's own policy layer is a separate enforcement path from API RBAC (Stage 2b finding): a
  `member`-role student CAN write, so Horizon write surfaces become legitimately live for them --
  the read-only assumption from 2a/2b does NOT carry into Stage 3, and the quota becomes the
  binding control instead of the role.
