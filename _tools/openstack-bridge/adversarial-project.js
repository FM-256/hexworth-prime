#!/usr/bin/env node
/*
 * Capstone Project 1 ADVERSARIAL QC ("The Environment Is Data"). Runs ON bc1.
 *
 * A walkthrough proves a lab is COMPLETABLE. It does not prove it is not trivially
 * beatable -- Nancy found a 5-command shortcut past a 4/4-passing Cinder lab. So each
 * named cheat below must FAIL its target check. If a cheat passes, the lab is broken
 * and the walkthrough is not permitted to run (qc-lab.sh enforces that ordering).
 *
 * The cheats are the three ways this lab is actually gettable wrong, which is the point:
 * each one is a real mistake a student makes, and each must be caught by exactly one check.
 *   A  manifest full of UUIDs           -> exported STATE, not intent  must fail 25
 *   B  manifest names a flavor            -> not portable                must fail 25
 *   C  perfect manifest, NOTHING built    -> a document with no stack     must fail 26
 *   D  built it but NEVER destroyed       -> ids unchanged                must fail 27
 * D is the project's whole thesis. A student who builds a stack and writes a manifest
 * describing it, but never tears it down, has proven nothing about reproducibility --
 * and their resource ids give them away. Same shape, same identity = not a rebuild.
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
  const fail = (m) => { console.error('ADVERSARIAL FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping, so every gate run consumed one of the 30 slots and never gave it back.
  // Repeated runs walked the pool to exhaustion and launches began returning 503, which is
  // exactly what a real student would have hit. A fixed identity binds ONE slot and every
  // later run reuses it, so QC costs a constant number of slots instead of growing forever.
  const email = 'proj-adv-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcPrA9x';
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

  // CLEAR THIS UID'S CAPSTONE BASELINE BEFORE THE RUN. Matters MORE here than in the
  // walkthrough: cheat E is "a real stack and a real manifest, but the baseline was NEVER
  // recorded", and check 27 must reject it. capstone-baselines.json is keyed by uid with NO
  // expiry (server.js:414, sole write at :430), so a baseline left by an earlier run makes
  // cheat E's premise false and the cheat would pass for the wrong reason -- the harness would
  // report a green it did not earn. BUG-077 already caught exactly this once, a baseline
  // trusted 5.5 hours later by a different session.
  //
  // Measured 2026-08-02: the live store held 4 entries and TWO were the project QC identities,
  // so this is present contamination, not a hypothetical.
  //
  // Scoped to this uid only; done via docker exec because server.js is baked into the
  // lab-manager image and a new route would need a rebuild.
  const qcUid = su.data.localId;
  if (!qcUid) fail('no localId on the QC identity -- cannot clear the stale baseline safely');
  // sh() CAPTURES stdout, so log the result explicitly -- an invisible cleanup step cannot be
  // verified after the fact. Matters especially here: if this silently stopped working, cheat E
  // would start passing for the wrong reason and the harness would report an unearned green.
  console.log('0. baseline: ' + sh(`docker exec lab-manager node -e ${JSON.stringify(
    "const f='/app/data/capstone-baselines.json',fs=require('fs');" +
    "let a={};try{a=JSON.parse(fs.readFileSync(f,'utf8'))||{}}catch(e){}" +
    `if(a[${JSON.stringify(qcUid)}]){delete a[${JSON.stringify(qcUid)}];` +
    "fs.writeFileSync(f,JSON.stringify(a));console.log('cleared a stale entry')}" +
    "else{console.log('none to clear')}"
  )}`).trim() + ` (uid ${qcUid.slice(0, 8)}...)`);

  const l1 = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  if (l1.status !== 200 || !l1.data || !l1.data.sessionId) fail(`launch failed: ${l1.status}`);
  const sid = l1.data.sessionId;
  if (l1.data.cloudMode !== 'personal') fail(`needed a personal cloud, got '${l1.data.cloudMode}'`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    const rs = (gr && gr.results) || [];
      // Coverage trace for the gate's third stage. A check that is only ever observed
      // REJECTING is indistinguishable from a check that rejects EVERYTHING -- that is
      // exactly how a check that failed the honest path passed the adversarial half.
      // Emitting the outcome per id lets qc-lab.sh prove each check was seen both ways.
    for (const id of [25, 26, 27, 28]) {
      const hit = rs.filter((r) => Number(r.id) === id)[0];
      if (hit) console.log(`COVERAGE ${id} ${hit.pass ? 'PASS' : 'FAIL'}`);
    }
    return rs;
  };
  const passed = (rs, id) => rs.some((r) => Number(r.id) === id && r.pass);
  const wipe = () => {
    const t = (c) => { try { dex(c); } catch (e) {} };
    try {
      t('openstack server delete proj-vm');
      for (let i = 0; i < 24; i++) {
        if (!dex('openstack server list -f value -c Name').trim().split('\n').map(x=>x.trim()).includes('proj-vm')) break;
        sh('sleep 5');
      }
      t('openstack router unset --external-gateway proj-router');
      t('openstack router remove subnet proj-router proj-subnet');
      t('openstack router delete proj-router');
      t('openstack security group delete proj-sg');
      t('openstack network delete proj-net');
      t('rm -rf /home/student/project');
      dex('mkdir -p /home/student/project');
    } catch (e) {}
  };

  let img = '', net = '', bigFlavor = '';
  for (let i = 0; i < 6 && !img; i++) {
    img = dex('openstack image list -f value -c Name | head -1').trim();
    if (!img) sh('sleep 10');
  }
  if (!img) fail('no image visible -- the cloud credential never came up');
  net = dex('openstack network list -f value -c Name | head -1').trim();
  bigFlavor = dex("openstack flavor list -f value -c Name | grep -v '^m1.nano$' | head -1").trim();
  if (!net) fail('no network visible');

  const I = JSON.stringify(img).slice(1, -1), N = JSON.stringify(net).slice(1, -1);

  // Base64 so the JSON never has to survive two layers of shell + python quoting. The
  // first version wrapped an already-stringified object in json.dumps(), which wrote a
  // JSON *string* to the file -- json.load then returned a str and check 25 died on
  // .get(). The gate caught it; this is why the harness runs before anything ships.
  const writeManifest = (obj) => {
    const b64 = Buffer.from(JSON.stringify(obj, null, 2)).toString('base64');
    dex(`mkdir -p /home/student/project && echo ${b64} | base64 -d > /home/student/project/stack.json`);
  };

  try {
    // ── Cheat A: exported STATE, not intent -- UUIDs in the manifest. ──
    wipe();
    writeManifest({manifest_version:1,name:'x',
      networks:[{name:'proj-net',id:'11111111-2222-3333-4444-555555555555',subnets:[{name:'s',cidr:'10.77.0.0/24'}]}],
      servers:[{name:'proj-vm',size:'small',image:'cirros'}]});
    let rs = await grade();
    if (passed(rs, 25)) fail('cheat A PASSED check 25 -- a manifest carrying a UUID counted as intent');
    console.log('  cheat A (UUIDs in the manifest = exported state) rejected by check 25');

    // ── Cheat B: a flavor name instead of a size class -- not portable. ──
    wipe();
    writeManifest({manifest_version:1,name:'x',
      networks:[{name:'proj-net',subnets:[{name:'s',cidr:'10.77.0.0/24'}]}],
      servers:[{name:'proj-vm',size:'m1.nano',image:'cirros'}]});
    rs = await grade();
    if (passed(rs, 25)) fail('cheat B PASSED check 25 -- a flavor name counted as a portable size class');
    console.log('  cheat B (flavor name instead of a size class) rejected by check 25');

    // ── Cheat C: a perfect manifest describing a stack that does not exist. ──
    wipe();
    writeManifest({manifest_version:1,name:'x',
      networks:[{name:'proj-net',subnets:[{name:'proj-subnet',cidr:'10.77.0.0/24'}]}],
      servers:[{name:'proj-vm',size:'small',image:'cirros',networks:['proj-net']}]});
    rs = await grade();
    if (!passed(rs, 25)) fail('cheat C should SATISFY 25 -- the manifest itself is well formed');
    if (passed(rs, 26)) fail('cheat C PASSED check 26 -- a document with no stack behind it counted as built');
    console.log('  cheat C (valid manifest, nothing actually built) rejected by 26 -- 25 still passes');

    // ── Cheat E: a real stack, a real manifest, but the baseline was NEVER recorded. ──
    // 27 must fail CLOSED. This has to run before cheat D, because D records a baseline and
    // writeBaseline always overwrites -- once one exists for this uid there is no way back to
    // the "never recorded" state within a single run.
    wipe();
    dex('openstack network create proj-net');
    dex('openstack subnet create proj-subnet --network proj-net --subnet-range 10.77.0.0/24');
    dex(`openstack server create --image ${I} --flavor m1.nano --network proj-net proj-vm`);
    for (let i = 0; i < 30; i++) {
      const s3 = dex('openstack server show proj-vm -f value -c status').trim();
      if (s3 === 'ACTIVE' || s3 === 'ERROR') break;
      sh('sleep 10');
    }
    writeManifest({manifest_version:1,name:'x',
      networks:[{name:'proj-net',subnets:[{name:'proj-subnet',cidr:'10.77.0.0/24'}]}],
      servers:[{name:'proj-vm',size:'small',image:'cirros',networks:['proj-net']}]});
    rs = await grade();
    if (passed(rs, 27)) fail('cheat E PASSED check 27 -- no baseline was ever recorded, so nothing was proven');
    if (!passed(rs, 26)) fail('cheat E should SATISFY 26 -- the stack genuinely exists');
    console.log('  cheat E (no baseline ever recorded) rejected by 27 -- 26 still passes');

    // ── Cheat D (THE THESIS): build it, describe it, never destroy it. ──
    wipe();
    dex('openstack network create proj-net');
    dex('openstack subnet create proj-subnet --network proj-net --subnet-range 10.77.0.0/24');
    dex(`openstack server create --image ${I} --flavor m1.nano --network proj-net proj-vm`);
    for (let i = 0; i < 30; i++) {
      const s2 = dex('openstack server show proj-vm -f value -c status').trim();
      if (s2 === 'ACTIVE' || s2 === 'ERROR') break;
      sh('sleep 10');
    }
    writeManifest({manifest_version:1,name:'x',
      networks:[{name:'proj-net',subnets:[{name:'proj-subnet',cidr:'10.77.0.0/24'}]}],
      servers:[{name:'proj-vm',size:'small',image:'cirros',networks:['proj-net']}]});
    // Record the baseline the honest way, through the endpoint, while everything is STILL
    // RUNNING -- then never tear any of it down. This is the thesis cheat: the student did
    // every visible step except the one that matters.
    const blD = await post(`${BASE}/baseline/${sid}`, {}, auth);
    if (blD.status !== 200 || !blD.data || blD.data.ok !== true) {
      fail(`cheat D could not record a baseline (${blD.status}): ${JSON.stringify(blD.data)}`);
    }
    rs = await grade();
    if (passed(rs, 27)) fail('cheat D PASSED check 27 -- a stack that was never destroyed counted as rebuilt');
    if (!passed(rs, 26)) fail('cheat D should SATISFY 26 -- the stack genuinely exists');
    console.log('  cheat D (built and described, but NEVER destroyed) rejected by 27 -- 26 still passes');

    wipe();
    console.log('ADVERSARIAL PASS: every named cheat was rejected by its target check');
  } finally {
    /* TEARDOWN ON EVERY PATH, INCLUDING FAILURE.
       Cleanup used to sit at the END OF THE TRY BLOCK, so a run that FAILED left its instance
       behind -- and because the bridge binds a pool slot to a uid permanently, a stranded VM
       consumed that slot for good. 25 of 30 slots were lost this way and had to be purged by
       hand on 2026-08-03, after real students hit "cloud is at capacity".
       Sweeping the whole project is safe: a harness owns one pool slot exclusively. It must run
       BEFORE /destroy because it needs the sandbox container, and servers must go before
       volumes because an attached volume refuses to delete. */
    try {
      const names = () => dex('openstack server list -f value -c Name').trim().split('\n')
        .map((n) => n.trim()).filter(Boolean);
      names().forEach((n) => { try { dex(`openstack server delete ${n}`); } catch (e) { /* already gone */ } });
      for (let i = 0; i < 12 && names().length; i++) { sh('sleep 5'); }
      dex('openstack volume list -f value -c Name').trim().split('\n')
        .map((v) => v.trim()).filter(Boolean)
        .forEach((v) => { try { dex(`openstack volume delete ${v}`); } catch (e) { /* still attached or gone */ } });
    } catch (e) { /* sandbox already torn down -- nothing left to sweep */ }

    // The QC account is deliberately NOT deleted -- see adversarial-wall.js:105-111. Deleting it
    // frees the email, so the next run's signUp mints a NEW uid and binds ANOTHER pool slot.
    // Safe to stop deleting only because this run CLEARS ITS OWN BASELINE at the top; without
    // that, cheat E's "never recorded" premise would be false from the second run onward.
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
  }
})().catch((e) => {
  // Runs AFTER the finally block. That ordering is the entire fix: fail() throws rather than
  // calling process.exit, because process.exit does not unwind and therefore skipped the
  // session teardown and QC-account deletion on every failing run.
  if (!e || e.message !== '__harness_fail__') console.error('HARNESS ERROR:', e && e.message);
  process.exit(1);
});
