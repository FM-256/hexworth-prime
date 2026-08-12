// Root-home fix harness (task #104). Boots each REAL lab page headless, drives
// the LinuxTerminal engine via its public execute()/getFs()/getState() API, and
// asserts root-home semantics. Read-only: serves _app from disk, writes nothing.
//
// Covers all 10 LinuxTerminal root-session labs + 3 non-root regression labs.
// For the 5 labs that redefine /root wholesale, asserts (a) base generic-home
// orphans are NOT reachable by absolute path (cd/cat/ls), and (b) the lab's own
// authored /root payload survives the addFilesystem prune.
//
// Run: NODE_PATH=<repo>/node_modules node linux-root-home-harness.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const APP = '/home/eq/ai-content/hexworth-prime/_app';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
const STUBS = {
  AccessGuard: 'window.AccessGuard={require:function(){},isAuthed:function(){return true;}};',
  FirebaseAuth: 'window.FirebaseAuth={onReady:function(cb){try{cb&&cb(null)}catch(e){}},getUser:function(){return null;}};',
  TenantRouter: 'window.TenantRouter={isActive:function(){return false;},getUrl:function(p){return "/"+p;}};',
  ModuleProgress: 'window.ModuleProgress={complete:function(){},completeQuiz:function(){},copyLegacyKey:function(){},isCompleted:function(){return false;}};',
  AchievementManager: 'window.AchievementManager={unlock:function(){}};',
  AchievementSystem: 'window.AchievementSystem={};',
  ProgressManager: 'window.ProgressManager={completeModule:function(){}};'
};

// url = page path under _app; root = expected home; redefines = lab claims /root
// wholesale (assert prune); payload = authored /root paths that MUST survive;
// orphansGone = base generic-home paths that MUST be unreachable after prune.
const ORPHANS = ['/root/notes.txt', '/root/Documents', '/root/Documents/report.txt', '/root/Downloads', '/root/scores.txt', '/root/.bashrc'];
const LABS = [
  { url: '/houses/shield/labs/linux/shield-linux-sudo.lab.html', root: true },
  { url: '/houses/shield/labs/linux/shield-linux-selinux.lab.html', root: true },
  { url: '/houses/shield/labs/linux/shield-linux-password-policy.lab.html', root: true },
  { url: '/houses/shield/labs/linux/shield-linux-sudo-policy-prep.lab.html', root: true },
  { url: '/houses/shield/labs/linux/shield-linux-audit.lab.html', root: true, redefines: true, payload: [] },
  { url: '/houses/shield/labs/linux/shield-linux-hardening.lab.html', root: true, redefines: true, payload: [] },
  { url: '/houses/shield/labs/linux/shield-linux-file-integrity.lab.html', root: true, redefines: true, payload: [] },
  { url: '/houses/shield/labs/linux/shield-linux-firewall.lab.html', root: true, redefines: true, payload: [] },
  { url: '/houses/shield/labs/linux/shield-linux-perms-drill.lab.html', root: true, redefines: true, payload: ['/root/.ssh', '/root/.ssh/id_rsa', '/root/.ssh/authorized_keys'] },
  { url: '/dark-arts/vault/labs/linux/da-linux-post-exploitation.lab.html', root: true, redefines: true, payload: ['/root/.ssh/id_rsa', '/root/report.txt', '/root/.bashrc', '/root/.ssh/authorized_keys'] },
  // Non-root regression
  { url: '/houses/script/modules/linux-mastery/script-lm-09-copy-move.module.html', root: false },
  { url: '/houses/script/modules/linux-mastery/script-lm-10-viewing-files.module.html', root: false },
  { url: '/houses/code/armory/bash/arm-bash-08-system-admin.module.html', root: false }
];

function makeInterceptor(page, r) {
  const NOISE = /gstatic\.com|firebasejs|firebase-|CORS|ERR_FAILED|Failed to load resource|net::/i;
  page.on('pageerror', e => { if (!NOISE.test(String(e))) r.errors.push(String(e)); });
  page.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) r.errors.push(m.text()); });
  return async () => {
    await page.setRequestInterception(true);
    page.on('request', req => {
      let u; try { u = new URL(req.url()); } catch { return req.respond({ status: 400, body: '' }); }
      if (u.protocol === 'data:') return req.continue();
      const p = decodeURIComponent(u.pathname);
      const base = path.basename(p).replace(/\.js$/, '');
      if (STUBS[base]) return req.respond({ contentType: 'text/javascript', body: STUBS[base] });
      const disk = path.join(APP, p.replace(/^\/+/, ''));
      if (!disk.startsWith(APP)) return req.respond({ status: 403, body: '' });
      if (fs.existsSync(disk) && fs.statSync(disk).isFile())
        return req.respond({ contentType: MIME[path.extname(disk).toLowerCase()] || 'application/octet-stream', body: fs.readFileSync(disk) });
      return req.respond({ status: 404, body: '' });
    });
  };
}

// Run a command through the engine and return ONLY its output (the engine
// echoes the prompt+command as the first new node; drop it). Returns the
// output lines joined — callers take .trim() or last-line as needed.
async function run(page, cmd) {
  return page.evaluate((c) => {
    const out = document.querySelector('#lt-output');
    const before = out ? out.children.length : 0;
    LinuxTerminal.execute(c);
    if (!out) return '';
    const fresh = Array.from(out.children).slice(before).map(n => n.textContent);
    // First fresh node is the echoed "prompt# command" line — drop it.
    return fresh.slice(1).join('\n');
  }, cmd);
}
// Last non-empty line of output (for scalar commands: echo/pwd).
const lastLine = (s) => s.split('\n').map(x => x.trim()).filter(Boolean).pop() || '';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = [];
  for (const lab of LABS) {
    const r = { url: lab.url, root: lab.root, problems: [], errors: [] };
    const page = await browser.newPage();
    await makeInterceptor(page, r)();
    try {
      await page.goto('http://localhost' + lab.url, { waitUntil: 'networkidle0', timeout: 25000 });
      const ready = await page.evaluate(() => !!(LinuxTerminal && LinuxTerminal.getState && LinuxTerminal.getState().isInitialized));
      if (!ready) { r.problems.push('LinuxTerminal not initialized'); results.push(r); await page.close(); continue; }

      const expHome = lab.root ? '/root' : null;
      const home = await page.evaluate(() => LinuxTerminal.getState().currentUser.home);
      const uid = await page.evaluate(() => LinuxTerminal.getState().currentUser.uid);
      const envHome = lastLine(await run(page, 'echo $HOME'));
      const idOut = (await run(page, 'id')).trim();

      if (lab.root) {
        if (home !== '/root') r.problems.push(`currentUser.home = ${home} (want /root)`);
        if (uid !== 0) r.problems.push(`uid = ${uid} (want 0)`);
        if (envHome !== '/root') r.problems.push(`$HOME = "${envHome}" (want /root)`);
        if (!/uid=0\(root\)/.test(idOut)) r.problems.push(`id = "${idOut}" (want uid=0(root))`);
      } else {
        if (home === '/root' || uid === 0) r.problems.push(`non-root lab got root identity: home=${home} uid=${uid}`);
        if (envHome === '/root') r.problems.push(`non-root $HOME resolved to /root`);
      }

      // cd ~ then pwd must equal home; ls ~ must list the home tree
      await run(page, 'cd ~');
      const pwd = lastLine(await run(page, 'pwd'));
      if (lab.root && pwd !== '/root') r.problems.push(`cd ~; pwd = "${pwd}" (want /root)`);
      if (!lab.root && pwd === '/root') r.problems.push(`non-root cd ~; pwd = /root`);

      // passwd: exactly one root line
      const passwd = await run(page, 'cat /etc/passwd');
      const rootLines = passwd.split('\n').filter(l => /^root:x:0:0:/.test(l.trim())).length;
      const uid1000root = /\nroot:x:1000:|^root:x:1000:/m.test(passwd);
      if (lab.root && rootLines !== 1) r.problems.push(`/etc/passwd has ${rootLines} root:x:0:0 lines (want 1)`);
      if (uid1000root) r.problems.push('/etc/passwd has a root:x:1000 line (duplicate identity)');

      // prompt mark
      const promptMark = await page.evaluate(() => {
        const p = document.querySelector('#lt-prompt');
        return p ? p.textContent.trim().slice(-1) : '?';
      });
      if (lab.root && promptMark !== '#') r.problems.push(`prompt mark = "${promptMark}" (want #)`);
      if (!lab.root && promptMark === '#') r.problems.push(`non-root prompt mark = # (want $)`);

      // Redefining labs: orphan unreachability + payload survival
      if (lab.redefines) {
        const fsKeys = await page.evaluate(() => Object.keys(LinuxTerminal.getFs()));
        for (const orphan of ORPHANS) {
          // Task 213: a lab that deliberately reseeds one of the generic-home
          // paths (lists it in its own payload) makes that path lab-authored,
          // not an orphan — e.g. da-linux-post-exploitation reseeds /root/.bashrc
          // after task #205. Skip those instead of false-positive flagging.
          if ((lab.payload || []).includes(orphan)) continue;
          if (fsKeys.includes(orphan)) r.problems.push(`ORPHAN reachable: ${orphan} still in fs after prune`);
        }
        // Payload survival — TWO independent checks (Chris gate): the key must
        // exist in the fs AND the node must actually LIST in its parent's `ls`
        // (which reads the parent's children[] array, the real visibility
        // mechanism — a surviving key with a missing children entry is the
        // exact ls-invisibility bug perms-drill's /root node fix targets).
        const lsCache = {};
        const lsOf = async (dir) => (lsCache[dir] ??= await run(page, 'ls -la ' + dir));
        for (const keep of (lab.payload || [])) {
          if (!fsKeys.includes(keep)) r.problems.push(`PAYLOAD LOST: ${keep} missing from fs after prune`);
          const parent = keep.slice(0, keep.lastIndexOf('/')) || '/';
          const base = keep.slice(keep.lastIndexOf('/') + 1);
          const listing = await lsOf(parent);
          // match basename as a whole token (ls -la columns are space-separated)
          if (!new RegExp('(^|\\s)' + base.replace(/[.]/g, '\\.') + '(\\s|$)', 'm').test(listing)) {
            r.problems.push(`PAYLOAD INVISIBLE: ${base} not listed by 'ls -la ${parent}' (children[] gap)`);
          }
        }
        // behavioral: cat a known orphan must fail
        const catOrphan = await run(page, 'cat /root/notes.txt');
        if (!/No such file|not found|cannot/i.test(catOrphan)) r.problems.push(`cat /root/notes.txt did not fail: "${catOrphan.trim().slice(0,60)}"`);
      }
    } catch (e) {
      r.problems.push('EXCEPTION: ' + e.message);
    }
    results.push(r);
    await page.close();
  }
  await browser.close();

  let pass = 0, fail = 0;
  for (const r of results) {
    const ok = r.problems.length === 0 && r.errors.length === 0;
    if (ok) pass++; else fail++;
    console.log((ok ? 'PASS ' : 'FAIL ') + r.url + (r.root ? ' [root]' : ' [user]'));
    r.problems.forEach(p => console.log('   ✗ ' + p));
    r.errors.slice(0, 3).forEach(e => console.log('   ! ' + e));
  }
  console.log(`\n${pass}/${results.length} labs pass`);
  process.exit(fail ? 1 : 0);
})();
