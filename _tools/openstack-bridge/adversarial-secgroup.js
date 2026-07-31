#!/usr/bin/env node
/*
 * Security-group lab ADVERSARIAL QC (Stage 4 lab 3). Runs ON bc1.
 *
 * A walkthrough proves a lab is COMPLETABLE. It does not prove it is not trivially
 * beatable -- Nancy found a 5-command shortcut past a 4/4-passing Cinder lab. So each
 * named cheat below must FAIL its target check. If a cheat passes, the lab is broken
 * and the walkthrough is not permitted to run (qc-lab.sh enforces that ordering).
 *
 * The cheats are the three ways this lab is actually gettable wrong, which is the point:
 * each one is a real mistake a student makes, and each must be caught by exactly one check.
 *   A  group exists, no rule          -> nothing opened             must fail 18
 *   B  rule open to 0.0.0.0/0        -> the classic misconfig        must fail 19
 *   C  perfect group, NEVER ATTACHED -> guards nothing               must fail 20
 * C is the lab's whole point: the group looks identical to a working one from the
 * outside, and the ONLY thing that distinguishes them is membership on a live server.
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
  const fail = (m) => { console.error('ADVERSARIAL FAIL:', m); process.exit(1); };
  const email = `sg-adv-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`;
  const su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password: 'Cq' + Math.random().toString(36).slice(2, 6) + '9X', returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200 || !su.data || !su.data.idToken) fail('could not create the QC user');
  const idToken = su.data.idToken;
  const auth = { Authorization: `Bearer ${idToken}` };

  const l1 = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  if (l1.status !== 200 || !l1.data || !l1.data.sessionId) fail(`launch failed: ${l1.status}`);
  const sid = l1.data.sessionId;
  if (l1.data.cloudMode !== 'personal') fail(`needed a personal cloud, got '${l1.data.cloudMode}'`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    return (gr && gr.results) || [];
  };
  const passed = (rs, id) => rs.some((r) => Number(r.id) === id && r.pass);
  const wipe = () => {
    try {
      const srv = dex('openstack server list -f value -c Name').trim().split('\n').map(x => x.trim());
      if (srv.includes('guard-vm')) {
        dex('openstack server delete guard-vm');
        for (let i = 0; i < 24; i++) {
          const n = dex('openstack server list -f value -c Name').trim().split('\n').map(x => x.trim());
          if (!n.includes('guard-vm')) break;
          sh('sleep 5');
        }
      }
      const g = dex('openstack security group list -f value -c Name').trim().split('\n').map(x => x.trim());
      if (g.includes('web-sg')) dex('openstack security group delete web-sg');
    } catch (e) { /* nothing to wipe */ }
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

  try {
    // ── Cheat A: the group exists but carries no rule. Opens nothing. ──
    wipe();
    dex('openstack security group create web-sg --description "cheat A"');
    let rs = await grade();
    if (passed(rs, 18)) fail('cheat A PASSED check 18 -- a group with no rule counted as opening a port');
    console.log('  cheat A (group created, no rule) rejected by check 18');

    // ── Cheat B: the classic misconfiguration -- correct port, open to the world. ──
    wipe();
    dex('openstack security group create web-sg --description "cheat B"');
    dex('openstack security group rule create web-sg --protocol tcp --dst-port 22:22 --remote-ip 0.0.0.0/0 --ingress');
    rs = await grade();
    if (passed(rs, 19)) fail('cheat B PASSED check 19 -- 0.0.0.0/0 counted as scoped');
    if (!passed(rs, 18)) fail('cheat B failed check 18 too -- 18 should pass, only 19 should catch this');
    console.log('  cheat B (port 22 open to 0.0.0.0/0) rejected by check 19, while 18 still passes');

    // ── Cheat C: a perfect group that is attached to nothing. THE LAB'S POINT. ──
    wipe();
    dex('openstack security group create web-sg --description "cheat C"');
    dex('openstack security group rule create web-sg --protocol tcp --dst-port 22:22 --remote-ip 10.0.0.0/8 --ingress');
    rs = await grade();
    if (passed(rs, 20)) fail('cheat C PASSED check 20 -- an unattached group counted as protecting a server');
    if (!passed(rs, 17) || !passed(rs, 18) || !passed(rs, 19))
      fail('cheat C should satisfy 17-19 and fail ONLY 20; the group itself is correct');
    console.log('  cheat C (correct group, attached to nothing) rejected by check 20 -- 17-19 pass, 20 does not');

    // ── Cheat D (NANCY, live-proven): correct web-sg attached, PLUS a backdoor group. ──
    // v1 asserted only membership, so a world-open second group rode along and passed.
    wipe();
    dex('openstack security group create web-sg --description "cheat D"');
    dex('openstack security group rule create web-sg --protocol tcp --dst-port 22:22 --remote-ip 10.0.0.0/8 --ingress');
    try { dex('openstack security group delete backdoor-sg'); } catch (e) {}
    dex('openstack security group create backdoor-sg --description "cheat D backdoor"');
    dex('openstack security group rule create backdoor-sg --protocol tcp --dst-port 1:65535 --remote-ip 0.0.0.0/0 --ingress');
    dex(`openstack server create --image ${I} --flavor m1.nano --network ${N} --security-group web-sg --security-group backdoor-sg guard-vm`);
    for (let i = 0; i < 30; i++) {
      const s3 = dex('openstack server show guard-vm -f value -c status').trim();
      if (s3 === 'ACTIVE' || s3 === 'ERROR') break;
      sh('sleep 10');
    }
    rs = await grade();
    if (passed(rs, 20)) fail('cheat D PASSED check 20 -- a world-open second group rode along beside web-sg');
    console.log('  cheat D (web-sg correct, but a world-open backdoor-sg also attached) rejected by 20');
    try { dex('openstack server delete guard-vm'); sh('sleep 8'); dex('openstack security group delete backdoor-sg'); } catch (e) {}

    wipe();
    console.log('ADVERSARIAL PASS: every named cheat was rejected by its target check');
  } finally {
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
    await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' }).catch(() => {});
  }
})();
