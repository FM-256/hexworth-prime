#!/usr/bin/env node
/*
 * Capstone Project 1 walkthrough QC ("The Environment Is Data"). Runs ON bc1.
 *
 * VERBATIM MEANS VERBATIM. walkthrough-cinder.js v1 inserted a poll the page never
 * taught, passed 4/4, and would have failed an honest student following the page. So:
 * every command below is a line lifted from cloud-openstack-project-iac.lab.html,
 * and the ONLY waits are the two the page marks with "# WAIT for:" / "WAIT until":
 *   step 2  -- server list, until the old chain-vm is gone
 *   step 4  -- server show ... -c status, until ACTIVE
 * If a wait is needed anywhere else, that is the LAB's bug to fix, not this harness's
 * to paper over by adding a poll the student was never told to run.
 *
 * Runs the lab TWICE with no cleanup between. A successful run leaves chain-vm behind,
 * and the page's own step 2 is the clean-up -- so run 2 proves a returning student is
 * not blocked by their own previous success (the failure Chris found on Cinder).
 */
const { execSync } = require('child_process');
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE = 'http://localhost/api/sandbox';
const sh = (c) => execSync(c, { encoding: 'utf8', timeout: 300000 });

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}

(async () => {
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping. So every gate run consumed another of the 30 slots and never gave it
  // back; repeated runs walked the pool to exhaustion and launches started returning 503,
  // which is what real students would have hit. A fixed identity binds exactly ONE slot and
  // every later run reuses it, so QC costs a constant 12 slots instead of growing forever.
  const email = 'proj-walk-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcPrW9x';
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) {
    // EMAIL_EXISTS is the NORMAL path after the first ever run -- sign in instead.
    su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true },
      { Referer: 'https://hexworth-prime.web.app/' });
  }
  if (su.status !== 200 || !su.data || !su.data.idToken) fail('could not create the QC user');
  const idToken = su.data.idToken;
  const auth = { Authorization: `Bearer ${idToken}` };

  // CLEAR THIS UID'S CAPSTONE BASELINE BEFORE THE RUN.
  //
  // capstone-baselines.json is keyed by uid with NO expiry (server.js:414, sole write at :430),
  // and it is the only persistent per-uid grading artifact on the platform. Until now the
  // per-run `accounts:delete` masked that by handing every run a brand-new uid -- an accident,
  // not a design. Removing that delete (the slot leak, see adversarial-wall.js:105-111) makes
  // the QC uid PERMANENT, so from the second run onward check 27 would be reading a baseline
  // written by an EARLIER run instead of "never recorded" -- which is exactly the contamination
  // BUG-077 already caught once, a stale baseline trusted 5.5 hours later.
  //
  // So the harness clears its OWN entry, and only its own, at the start of every run. Scoped to
  // this uid: no other student's baseline is touched. Done via docker exec rather than a new
  // server route because server.js is baked into the lab-manager image and would need a rebuild.
  const qcUid = su.data.localId;
  if (!qcUid) fail('no localId on the QC identity -- cannot clear the stale baseline safely');
  sh(`docker exec lab-manager node -e ${JSON.stringify(
    "const f='/app/data/capstone-baselines.json',fs=require('fs');" +
    "let a={};try{a=JSON.parse(fs.readFileSync(f,'utf8'))||{}}catch(e){}" +
    `if(a[${JSON.stringify(qcUid)}]){delete a[${JSON.stringify(qcUid)}];` +
    "fs.writeFileSync(f,JSON.stringify(a));console.log('baseline cleared')}" +
    "else{console.log('no baseline to clear')}"
  )}`);

  const l1 = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  if (l1.status !== 200 || !l1.data || !l1.data.sessionId) fail(`launch failed: ${l1.status}`);
  const sid = l1.data.sessionId;
  if (l1.data.cloudMode !== 'personal') fail(`needed a personal cloud, got '${l1.data.cloudMode}' -- cannot grade this lab`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);

  // Page step 1: look before you boot. These are the three discovery commands verbatim.
  let img = '', net = '';
  for (let i = 0; i < 6 && !img; i++) {
    img = dex('openstack image list -f value -c Name | head -1').trim();
    if (!img) sh('sleep 10');                       // credential warm-up, pre-lab, not a lab step
  }
  if (!img) fail('no image visible -- the cloud credential never came up');
  dex('openstack flavor list');
  net = dex('openstack network list -f value -c Name | head -1').trim();
  if (!net) fail('no network visible');

  async function runLab(pass) {
    console.log(`--- run ${pass}: image=${img} network=${net} ---`);
    const t = (c) => { try { dex(c); } catch (e) {} };

    // Clean slate. A project run must start from nothing of its own.
    t('openstack server delete proj-vm');
    for (let i = 0; i < 24; i++) {
      if (!dex('openstack server list -f value -c Name').trim().split('\n').map(x=>x.trim()).includes('proj-vm')) break;
      sh('sleep 5');
    }
    t('openstack router unset --external-gateway proj-router');
    t('openstack router remove subnet proj-router proj-subnet');
    t('openstack router delete proj-router');
    t('openstack network delete proj-net');
    t('openstack security group delete proj-sg');
    dex('rm -rf /home/student/project && mkdir -p /home/student/project');

    // ── PHASE 1: build a small stack by hand (stands in for labs 1-5 output) ──
    dex('openstack network create proj-net');
    dex('openstack subnet create proj-subnet --network proj-net --subnet-range 10.77.0.0/24');
    dex('openstack security group create proj-sg --description "project"');
    dex('openstack security group rule create proj-sg --protocol tcp --dst-port 22:22 --remote-ip 10.0.0.0/8 --ingress');
    dex(`openstack server create --image ${JSON.stringify(img).slice(1,-1)} --flavor m1.nano --network proj-net --security-group proj-sg proj-vm`);
    let st = '';
    for (let i = 0; i < 30; i++) {
      st = dex('openstack server show proj-vm -f value -c status').trim();
      if (st === 'ACTIVE' || st === 'ERROR') break;
      sh('sleep 10');
    }
    if (st !== 'ACTIVE') fail(`run ${pass}: proj-vm ended '${st}'`);

    // ── PHASE 2: export intent + record ids (page step 2) ──
    dex(`mkdir -p /home/student/project && echo ewogICJtYW5pZmVzdF92ZXJzaW9uIjogMSwKICAibmFtZSI6ICJwcm9qIiwKICAibmV0d29ya3MiOiBbCiAgICB7CiAgICAgICJuYW1lIjogInByb2otbmV0IiwKICAgICAgInN1Ym5ldHMiOiBbCiAgICAgICAgewogICAgICAgICAgIm5hbWUiOiAicHJvai1zdWJuZXQiLAogICAgICAgICAgImNpZHIiOiAiMTAuNzcuMC4wLzI0IgogICAgICAgIH0KICAgICAgXQogICAgfQogIF0sCiAgInNlY3VyaXR5X2dyb3VwcyI6IFsKICAgIHsKICAgICAgIm5hbWUiOiAicHJvai1zZyIsCiAgICAgICJydWxlcyI6IFsKICAgICAgICB7CiAgICAgICAgICAiZGlyZWN0aW9uIjogImluZ3Jlc3MiLAogICAgICAgICAgInByb3RvY29sIjogInRjcCIsCiAgICAgICAgICAicG9ydF9taW4iOiAyMiwKICAgICAgICAgICJwb3J0X21heCI6IDIyLAogICAgICAgICAgInJlbW90ZV9pcCI6ICIxMC4wLjAuMC84IgogICAgICAgIH0KICAgICAgXQogICAgfQogIF0sCiAgInNlcnZlcnMiOiBbCiAgICB7CiAgICAgICJuYW1lIjogInByb2otdm0iLAogICAgICAic2l6ZSI6ICJzbWFsbCIsCiAgICAgICJpbWFnZSI6ICJjaXJyb3MiLAogICAgICAibmV0d29ya3MiOiBbCiAgICAgICAgInByb2otbmV0IgogICAgICBdLAogICAgICAic2VjdXJpdHlfZ3JvdXBzIjogWwogICAgICAgICJwcm9qLXNnIgogICAgICBdCiAgICB9CiAgXQp9 | base64 -d > /home/student/project/stack.json`);
    // Page step 2: the GRADER records the baseline, not the student. This is exactly what
    // the page's "Record Baseline" button posts. The old student-written before-ids.json is
    // gone: it was forgeable (BUG-055) and, because it captured shared networks the student
    // cannot delete, it also failed every honest run (BUG-056).
    const bl = await post(`${BASE}/baseline/${sid}`, {}, auth);
    if (bl.status !== 200 || !bl.data || bl.data.ok !== true) {
      fail(`run ${pass}: baseline capture failed (${bl.status}): ${JSON.stringify(bl.data)}`);
    }
    console.log(`  baseline recorded: ${bl.data.recorded.networks} network(s), ${bl.data.recorded.servers} server(s)`);

    // ── PHASE 3: DESTROY (page step 3) ──
    dex('openstack server delete proj-vm');
    for (let i = 0; i < 24; i++) {
      if (!dex('openstack server list -f value -c Name').trim().split('\n').map(x=>x.trim()).includes('proj-vm')) break;
      sh('sleep 5');
    }
    dex('openstack security group delete proj-sg');
    dex('openstack network delete proj-net');

    // ── PHASE 4: rebuild from the manifest alone, twice (page step 4) ──
    // A reference honest applier. The PAGE asks the student to write this themselves
    // ("roughly forty lines of Python"), so there is no verbatim source to lift -- this
    // stands in for what an honest student produces, which is what a completability proof
    // needs. Written via base64: a heredoc inside `docker exec sh -lc "..."` arrives with
    // its newlines escaped, so the heredoc never terminates and sh parses the Python.
    const APPLY_PY = `import json,subprocess,sys
SIZE={'small':'m1.nano'}
def sh(c):
    return subprocess.run(c,shell=True,capture_output=True,text=True,timeout=180).stdout.strip()
def have(kind,name):
    return name in sh(f'openstack {kind} list -f value -c Name').split()
m=json.load(open(sys.argv[1])); changed=0
for n in m.get('networks',[]):
    if not have('network',n['name']):
        sh(f"openstack network create {n['name']}"); changed+=1
    for sb in n.get('subnets',[]):
        if not have('subnet',sb['name']):
            sh(f"openstack subnet create {sb['name']} --network {n['name']} --subnet-range {sb['cidr']}"); changed+=1
for g in m.get('security_groups',[]):
    if not have('security group',g['name']):
        sh(f"openstack security group create {g['name']}"); changed+=1
        for r in g.get('rules',[]):
            sh(f"openstack security group rule create {g['name']} --protocol {r['protocol']} "
               f"--dst-port {r['port_min']}:{r['port_max']} --remote-ip {r['remote_ip']} --{r['direction']}")
for v in m.get('servers',[]):
    if not have('server',v['name']):
        img=sh("openstack image list -f value -c Name | head -1")
        nets=' '.join(f'--network {x}' for x in v.get('networks',[]))
        sgs=' '.join(f'--security-group {x}' for x in v.get('security_groups',[]))
        sh(f"openstack server create --image '{img}' --flavor {SIZE[v['size']]} {nets} {sgs} {v['name']}"); changed+=1
print('created' if changed else 'no changes')`;
    dex(`echo ${Buffer.from(APPLY_PY).toString('base64')} | base64 -d > /home/student/project/apply.py`);
    dex('{ echo "RUN 1"; python3 /home/student/project/apply.py /home/student/project/stack.json; echo "RUN 2"; python3 /home/student/project/apply.py /home/student/project/stack.json; } > /home/student/project/apply-twice.txt 2>&1');
    for (let i = 0; i < 30; i++) {
      st = dex('openstack server show proj-vm -f value -c status 2>/dev/null').trim();
      if (st === 'ACTIVE' || st === 'ERROR') break;
      sh('sleep 10');
    }
    if (st !== 'ACTIVE') fail(`run ${pass}: rebuilt proj-vm ended '${st}'`);

    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    const results = (gr && gr.results) || [];
    const want = [25, 26, 27, 28];
      // Coverage trace for the gate's third stage. A check that is only ever observed
      // REJECTING is indistinguishable from a check that rejects EVERYTHING -- that is
      // exactly how a check that failed the honest path passed the adversarial half.
      // Emitting the outcome per id lets qc-lab.sh prove each check was seen both ways.
    for (const id of want) {
      const hit = results.filter((r) => Number(r.id) === id)[0];
      if (hit) console.log(`COVERAGE ${id} ${hit.pass ? 'PASS' : 'FAIL'}`);
    }
    const missed = want.filter(id => !results.some(r => Number(r.id) === id && r.pass));
    console.log(`run ${pass}: ` + want.map(id => {
      const hit = results.filter(r => Number(r.id) === id)[0];
      return `${id}=${hit && hit.pass ? 'PASS' : 'fail'}`;
    }).join(' '));
    if (missed.length) fail(`run ${pass}: honest path did not satisfy ${missed.join(', ')}`);
  }

  try {
    await runLab(1);
    await runLab(2);            // deliberately NO cleanup between
    console.log('WALKTHROUGH PASS: 4/4 twice, second run started from the first run\'s leftovers');
  } finally {
    // The QC account is deliberately NOT deleted -- see adversarial-wall.js:105-111. Deleting it
    // frees the email, so the next run's signUp mints a NEW uid and binds ANOTHER pool slot.
    // Safe to stop deleting only because this run CLEARS ITS OWN BASELINE at the top; without
    // that, a permanent uid would leave check 27 reading an earlier run's baseline.
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
  }
})().catch((e) => {
  // Runs AFTER the finally block. That ordering is the entire fix: fail() throws rather than
  // calling process.exit, because process.exit does not unwind and therefore skipped the
  // session teardown and QC-account deletion on every failing run.
  if (!e || e.message !== '__harness_fail__') console.error('HARNESS ERROR:', e && e.message);
  process.exit(1);
});
