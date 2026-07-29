# OpenStack Stage 3 -- Identity Bridge (scope)

**Status:** SCOPE -- awaiting Nancy design pass, then Frank ruling on the open forks.
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
- **C. Pool size and quota per student.** Pool 30 (per the earlier ruling, with the standing
  per-term roster check) and quota **2 instances / 2 cores / 1024MB RAM** -- which, at the
  Stage-1-measured ~221MB per m1.nano, keeps the whole class inside the cloud's ~13GB even if
  every student runs their cap. **Rec as stated; Frank confirms numbers.**
- **D. Term reset policy.** Delete-and-recreate student projects each term (clean slate, students
  lose old work) vs preserve. **Rec: delete-and-recreate**, announced to students, matching the
  VM's rebuild-per-term policy.
- **E. Does the graded path depend on this?** Stage 3's graded challenges (`/check` running
  server-side `openstack ...` against the student's project) require per-student projects, so this
  bridge is the prerequisite for cloud labs ever being GRADED rather than explored.

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
