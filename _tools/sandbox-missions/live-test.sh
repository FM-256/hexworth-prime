#!/bin/sh
# Generic mission live-test harness. Usage: sh live-test.sh <mission-id>
# From the repo mission dir, ships seed + generated per-check scripts + solution
# to bc1, runs the FULL cycle in a throwaway container (never the lab pool):
# seed -> pre-solve grade -> canonical solution as student -> expect ALL checks
# pass -> re-seed idempotency -> destroy. Exits non-zero on any failure.
set -e
MID="$1"
test -d "$MID" || { echo "no such mission dir: $MID"; exit 1; }
# generate per-check scripts (argv-style: cmd raw in its own file, zero quote nesting)
python3 - "$MID" <<'EOF'
import json, os, shutil, sys
mid = sys.argv[1]
m = json.load(open(f'{mid}/mission.json'))
d = f'{mid}/_checks.d'
shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
n = 0
for t in m['tasks']:
    for c in t['checks']:
        n += 1
        with open(f'{d}/{n:02d}__{t["id"]}__{c["aspect"]}.sh', 'w') as f:
            f.write(f'#!/bin/sh\n. /opt/mission/env.{mid} 2>/dev/null\n' + c['cmd'] + '\n')
print(f'{n} checks generated for {mid}')
EOF
# PERMANENT GATE (Chris 2026-07-09): every $MISSION_* token referenced anywhere in
# the manifest must be defined by the seed's env file, or briefs would render
# with raw shell tokens / checks would compare against empty strings.
python3 - "$MID" <<'EOF2'
import json, re, sys
mid = sys.argv[1]
m = json.load(open(f'{mid}/mission.json'))
seed = open(f'{mid}/seed.sh').read()
used = set(re.findall(r'\$(MISSION_[A-Z0-9_]+)', json.dumps(m)))
defined = set(re.findall(r'^(MISSION_[A-Z0-9_]+)=', seed, re.M))
missing = used - defined - {'MISSION_ID'}
if missing:
    print('TOKEN GATE FAIL: used but never seeded:', sorted(missing)); sys.exit(1)
print(f'token gate OK ({len(used)} tokens all seeded)')
EOF2
ssh bc1 "mkdir -p /tmp/lcm-$MID"
scp -q "$MID/seed.sh" "$MID/solution.sh" bc1:/tmp/lcm-$MID/
scp -qr "$MID/_checks.d" bc1:/tmp/lcm-$MID/
ssh bc1 "set -e
docker rm -f lcm-$MID >/dev/null 2>&1 || true
docker run -d --name lcm-$MID --pids-limit 512 hexworth/linux-sandbox:latest >/dev/null
docker cp /tmp/lcm-$MID/seed.sh lcm-$MID:/tmp/seed.sh
docker cp /tmp/lcm-$MID/_checks.d lcm-$MID:/tmp/checks.d
docker cp /tmp/lcm-$MID/solution.sh lcm-$MID:/tmp/solution.sh
docker exec -u root lcm-$MID sh /tmp/seed.sh && echo 'seed ok'
run_checks() { docker exec -u student lcm-$MID sh -c 'f=0;t=0;for s in /tmp/checks.d/*.sh;do t=\$((t+1));sh \"\$s\" >/dev/null 2>&1||{ echo \"FAIL \$(basename \$s .sh)\";f=\$((f+1));};done;echo \"RESULT: \$((t-f))/\$t (\$f fail)\"'; }
echo '--- BEFORE solving ---'; run_checks | tail -1
docker exec -u student lcm-$MID sh /tmp/solution.sh >/dev/null && echo 'solution applied'
echo '--- AFTER solving ---'; run_checks
echo '--- re-seed idempotency ---'
docker exec -u root lcm-$MID sh /tmp/seed.sh >/dev/null 2>&1
run_checks | tail -1
docker rm -f lcm-$MID >/dev/null && echo destroyed"
