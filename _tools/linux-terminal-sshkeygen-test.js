// Functional test for the LinuxTerminal ssh-keygen fix (task #66 item 3, lm-39):
// ssh-keygen must (a) use the ACTUAL current user in its output — not a hardcoded
// 'student' (the old code read state.currentUser.name, but the field is `username`,
// so it always fell back) — and (b) actually CREATE ~/.ssh + the key pair in the
// filesystem so a follow-up `ls ~/.ssh` / `cat *.pub` works and the "navigate ~/.ssh"
// objective is completable. Boots the REAL LinuxTerminal.js as user 'learner' and
// drives it via execute(). Fails against the old print-only, /home/student behavior.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const SRC = fs.readFileSync(path.resolve(__dirname, '../_app/components/LinuxTerminal.js'), 'utf8');
const PAGE_URL = 'https://hexworth.com/__lt-sshkeygen-test';
const HTML = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<div id="terminal"></div><script>\n' + SRC + '\n</script></body></html>';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.url() === PAGE_URL) { req.respond({ contentType: 'text/html', body: HTML }); return; }
        req.abort();
    });
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    const res = await page.evaluate(() => {
        var out = {};
        var T = (typeof LinuxTerminal !== 'undefined') ? LinuxTerminal : null;   // top-level const, not on window
        out.hasEngine = !!(T && typeof T.execute === 'function');
        if (!out.hasEngine) return out;
        // Run as 'learner' (as lm-39 does) to catch the hardcoded-'student' bug.
        T.init('SSHKEYGEN-TEST', '#terminal', { user: 'learner', startDir: '/home/learner', suppressUnknown: true });
        var term = document.getElementById('terminal');

        // Before keygen: ~/.ssh should not exist yet (real ssh-keygen creates it on demand).
        out.sshDirAbsentBefore = !T.getFs()['/home/learner/.ssh'];

        T.execute('ssh-keygen -t ed25519');
        // Oracle on full innerText, not an innerHTML delta-slice — the terminal
        // re-renders (prompt line moves) so a length-based slice is unreliable.
        var txt = term.innerText;
        // (a) output uses the real user, not 'student'
        out.usesLearnerPath = txt.indexOf('/home/learner/.ssh/id_ed25519') !== -1;
        out.usesLearnerFingerprint = /SHA256:[^\s]+ learner@/.test(txt);
        out.noStudentLeak = txt.indexOf('/home/student') === -1 && txt.indexOf('student@') === -1;
        // (b) keys were actually created in the filesystem
        out.privCreated = !!T.getFs()['/home/learner/.ssh/id_ed25519'];
        out.pubCreated = !!T.getFs()['/home/learner/.ssh/id_ed25519.pub'];
        // (b cont.) a follow-up ls ~/.ssh now works (lists both keys, no error)
        var b2 = term.innerHTML.length;
        T.execute('ls ~/.ssh');
        var lsOut = term.innerText.slice(term.innerText.lastIndexOf('ls ~/.ssh'));
        out.lsWorks = lsOut.indexOf('id_ed25519') !== -1 && lsOut.indexOf('id_ed25519.pub') !== -1
            && term.innerHTML.slice(b2).indexOf('lt-error') === -1;

        // Scenario 2 (Nancy #1): a lab that PRE-SEEDS ~/.ssh keys (e.g.
        // script-linux-ssh.lab.html seeds sysop's keys) then runs ssh-keygen in Task 1 —
        // the authored key content must be PRESERVED, not clobbered by the generic sim.
        T.init('SSHKEYGEN-PRESERVE', '#terminal', { user: 'sysop', startDir: '/home/sysop', suppressUnknown: true });
        var AUTHORED = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHexw0rth+pr1me/k3y+m4t3r14l sysop@hexworth-jump\n';
        T.addFilesystem({
            '/home/sysop/.ssh': { type: 'dir', perms: 'drwx------', owner: 'sysop', group: 'sysop', children: ['id_ed25519', 'id_ed25519.pub'] },
            '/home/sysop/.ssh/id_ed25519': { type: 'file', perms: '-rw-------', owner: 'sysop', group: 'sysop', size: 411, content: 'AUTHORED-PRIVATE\n' },
            '/home/sysop/.ssh/id_ed25519.pub': { type: 'file', perms: '-rw-r--r--', owner: 'sysop', group: 'sysop', size: 96, content: AUTHORED }
        });
        T.execute('ssh-keygen -t ed25519');
        var pubAfter = T.getFs()['/home/sysop/.ssh/id_ed25519.pub'];
        out.authoredPreserved = !!pubAfter && pubAfter.content === AUTHORED;

        // Scenario 3 (Nancy #3): junk `-t` must whitelist-fallback to rsa, NOT create a
        // garbage `id_../../etc` entry in the fs / ls output.
        T.init('SSHKEYGEN-WHITELIST', '#terminal', { user: 'learner', startDir: '/home/learner', suppressUnknown: true });
        T.execute('ssh-keygen -t ../../etc');
        var kk = Object.keys(T.getFs());
        out.noGarbageKey = !kk.some(function (k) { return k.indexOf('id_../../etc') !== -1; });
        out.whitelistFallbackRsa = !!T.getFs()['/home/learner/.ssh/id_rsa'];

        // Scenario 4 (Nancy residual #1 — atomic): ASYMMETRIC pre-seed — a lab seeds a
        // private key but NO matching .pub. Real ssh-keygen is atomic: it aborts if EITHER
        // half exists and never writes just the missing half. So `ssh-keygen` (default -t rsa)
        // must NOT fabricate a generic id_rsa.pub next to the authored private key.
        // NOTE: seeded at the engine's REAL home for this user (/home/learner). The engine
        // models every user's home as /home/<user> consistently (env.HOME, currentUser.home,
        // base fs, and ~ expansion all agree) — so this is where the atomic guard actually
        // engages. (A lab that seeds root's key at literal /root/.ssh instead of the engine's
        // /home/root is a separate pre-existing authoring mismatch, logged to backlog; the
        // guard here is verified against the home the engine's ~ resolves to.)
        T.init('SSHKEYGEN-ASYM', '#terminal', { user: 'learner', startDir: '/home/learner', suppressUnknown: true });
        var SEEDED_PRIV = '-----BEGIN OPENSSH PRIVATE KEY-----\n[REDACTED attacker key]\n-----END OPENSSH PRIVATE KEY-----\n';
        T.addFilesystem({
            '/home/learner/.ssh': { type: 'dir', perms: 'drwx------', owner: 'learner', group: 'learner', children: ['id_rsa'] },
            '/home/learner/.ssh/id_rsa': { type: 'file', perms: '-rw-------', owner: 'learner', group: 'learner', size: 411, content: SEEDED_PRIV }
        });
        // sanity: the guard only means something if ~ actually resolves to this path
        out.asymSeedIsAtRealHome = T.getCwd() === '/home/learner' && !!T.getFs()['/home/learner/.ssh/id_rsa'];
        T.execute('ssh-keygen');
        out.asymNoFabricatedPub = !T.getFs()['/home/learner/.ssh/id_rsa.pub'];
        var privAfterAsym = T.getFs()['/home/learner/.ssh/id_rsa'];
        out.asymPrivPreserved = !!privAfterAsym && privAfterAsym.content === SEEDED_PRIV;
        return out;
    });

    await browser.close();
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch/i.test(e));

    const pass = res.hasEngine && res.sshDirAbsentBefore && res.usesLearnerPath && res.usesLearnerFingerprint
        && res.noStudentLeak && res.privCreated && res.pubCreated && res.lsWorks
        && res.authoredPreserved && res.noGarbageKey && res.whitelistFallbackRsa
        && res.asymSeedIsAtRealHome && res.asymNoFabricatedPub && res.asymPrivPreserved && realErrors.length === 0;

    console.log('\n  LinuxTerminal ssh-keygen test (task #66, lm-39)\n');
    console.log('  engine loaded                 : ' + res.hasEngine);
    console.log('  ~/.ssh absent before keygen   : ' + res.sshDirAbsentBefore);
    console.log('  output uses /home/learner path: ' + res.usesLearnerPath + '   (was hardcoded /home/student)');
    console.log('  fingerprint is learner@       : ' + res.usesLearnerFingerprint);
    console.log('  no /home/student or student@  : ' + res.noStudentLeak);
    console.log('  private key created in fs     : ' + res.privCreated);
    console.log('  public key created in fs      : ' + res.pubCreated);
    console.log('  ls ~/.ssh works after keygen  : ' + res.lsWorks + '   (was: cannot access)');
    console.log('  pre-seeded lab keys preserved : ' + res.authoredPreserved + '   (Nancy #1 — no clobber)');
    console.log('  junk -t: no garbage fs key    : ' + res.noGarbageKey + '   (Nancy #3)');
    console.log('  junk -t: whitelist->id_rsa    : ' + res.whitelistFallbackRsa);
    console.log('  asym seed at engine real home : ' + res.asymSeedIsAtRealHome + '   (guard precondition)');
    console.log('  asym seed: no fabricated .pub : ' + res.asymNoFabricatedPub + '   (Nancy residual #1 — atomic)');
    console.log('  asym seed: authored priv kept : ' + res.asymPrivPreserved);
    if (realErrors.length) { console.log('\n  PAGE ERRORS:'); realErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
