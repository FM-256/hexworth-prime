#!/bin/bash
# @catalog what    true pool capacity: slots total/bound/free, and how many instances the host can run
# @catalog run     bash _tools/openstack-bridge/pool-capacity.sh   (on bc2)
# @catalog status  TOOL
#
# WHY THIS EXISTS. On 2026-08-26 twenty simultaneous launches produced six successes and
# fourteen POOL_EXHAUSTED. The reason I did not see it coming is that I asked
# `dump-slot-uids.py`, which reports only the FIRST 30 SLOTS, and read "20 free" off a
# truncated list. A capacity number taken from a paginated source is not a capacity number.
#
# This asks the claim service the same question the allocator asks itself, over the WHOLE
# pool, and prints the count it derives so the number cannot be a sample.
#
# TWO SEPARATE CEILINGS, and they fail differently. Confusing them wasted a class period:
#   * FREE SLOTS  -> exhaustion returns POOL_EXHAUSTED (claim_service.py:207). A slot is bound
#     to a uid FOR LIFE until an explicit release (operator policy 2026-08-11), so this is a
#     cap on DISTINCT USERS EVER, not on concurrent ones. It only ever goes down.
#   * FREE RAM    -> exhaustion returns CLOUD_FULL (claim_service.py:192), refused below
#     HEADROOM_FLOOR_MB. This is a cap on instances RUNNING AT ONCE, and it recovers when
#     instances are deleted.
# A pool with free slots and no RAM still refuses every claim, and vice versa. Print both.
#
# Read-only. Touches no credential and changes nothing.
set -uo pipefail

# The service and its 0600 credential files live on bc2 under the service account. This script
# is meaningless anywhere else, so the path is explicit and checked rather than guessed.
CS=${CLAIM_SERVICE_PY:-/home/eq1/openstack-stage1/claim_service.py}
if [ ! -r "$CS" ]; then
  echo "  cannot read $CS"
  echo "  Run this ON bc2 (the claim service host), or set CLAIM_SERVICE_PY."
  exit 1
fi

CS="$CS" python3 - <<'PY'
import importlib.util, os, sys

# Load by path, the same way reclaim-idle-slots.py does, rather than by sys.path games.
# NOTE for whoever reads this next: claim_service.py's 0600 permission checks live under
# `if __name__ == '__main__'` (line 926), so importing it does NOT run them and does NOT bind
# a port. The SystemExit guard below is belt-and-braces for a future edit that moves them out.
path = os.environ['CS']
spec = importlib.util.spec_from_file_location('cs', path)
cs = importlib.util.module_from_spec(spec)
try:
    spec.loader.exec_module(cs)
except SystemExit:
    pass

atok = cs.admin_token()
if not atok:
    print("  KEYSTONE_ADMIN_AUTH_FAILED -- cannot read the pool"); sys.exit(1)

# The SAME call the allocator makes. Not a dump script, not a paginated helper.
projects = cs.pool_projects(atok)
if projects is None:
    print("  KEYSTONE_LIST_FAILED"); sys.exit(1)

bound = [p['name'] for p in projects if p.get('hexworth_uid')]
free  = [p['name'] for p in projects if not p.get('hexworth_uid')]
store = cs._read_env(cs.POOL_STORE)

# A slot with no stored password cannot be handed out even when it looks free: the claim path
# reads the password from POOL_STORE (claim_service.py:247) and fails without it. So the number
# that matters is free AND credentialed, not free.
usable = [s for s in free if s in store]
orphan = [s for s in free if s not in store]

print(f"  pool projects            : {len(projects)}")
print(f"  bound to a uid (sticky)  : {len(bound)}")
print(f"  free                     : {len(free)}")
print(f"  free AND credentialed    : {len(usable)}   <-- students who can claim RIGHT NOW")
if orphan:
    print(f"  free but NO PASSWORD     : {len(orphan)}  {orphan[:10]}")
    print( "     ^ these would fail on claim. Re-run provision-pool.sh.")

free_mb = cs.free_ram_mb(atok)
floor = cs.FLOOR_MB
if free_mb is None:
    print("  hypervisor free RAM      : UNREADABLE (claim() fails closed -> CLOUD_FULL)")
    ram_cap = 0
else:
    # Instances are ds512M. Claims are refused once free RAM would drop under the floor.
    ram_cap = max(0, free_mb - floor) // 512
    print(f"  hypervisor free RAM      : {free_mb} MB (floor {floor} MB)")
    print(f"  more 512MB instances     : {ram_cap}   <-- concurrent RUNNING cap")

print()
print(f"  A CLASS OF {min(len(usable), ram_cap)} COULD START RIGHT NOW (the smaller of the two ceilings).")
PY
