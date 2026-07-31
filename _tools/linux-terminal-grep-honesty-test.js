// Proves LinuxTerminal's `grep` reports a missing file, and — just as important — that it does
// NOT report one for a file that exists.
//
// WHY BOTH DIRECTIONS: `grep pattern /nope` used to produce no output and no error, so any
// module gating completion on the common `ok = !output.includes('lt-error')` idiom credited a
// grep against a file that was never there. Adding the error fixes that, but a new error where
// there was none is WORSE than the silent pass if it hits a legitimate command — a student who
// did the work and gets no credit. So the false-FAIL case is asserted here too, and this test
// fails if either direction breaks.
//
// Boots the REAL engine in a real browser rather than reasoning about the source.
// usage: node _tools/linux-terminal-grep-honesty-test.js
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../_app');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json' };

const CASES = [
  { cmd: 'grep error /var/log/syslog', wantError: false, why: 'real file with content — must NOT error (false-FAIL guard)' },
  { cmd: 'grep error /var/log/nope.log', wantError: true,  why: 'missing file — must report No such file or directory' },
  { cmd: 'grep error /etc',             wantError: true,  why: 'directory — must report Is a directory' },
];

(async () => {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'text/plain' });
    res.end(fs.readFileSync(f));
  });
  await new Promise(r => srv.listen(8794, r));

  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const pg = await b.newPage();
  // AccessGuard.require('sorted') redirects an unsorted visitor to the sorting gate, where the
  // terminal does not exist — the probe would then measure the wrong page entirely.
  await pg.evaluateOnNewDocument(() => {
    try { localStorage.setItem('hexworth_house', 'script'); localStorage.setItem('hexworth_sorted', 'true'); } catch (e) {}
  });
  await pg.goto('http://127.0.0.1:8794/houses/script/modules/linux-mastery/script-lm-13-grep-basics.module.html',
    { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));

  const ready = await pg.evaluate(() => typeof LinuxTerminal !== 'undefined' && !!document.querySelector('.lt-input, input'));
  if (!ready) { console.error('FAIL: terminal never initialised — nothing was tested'); await b.close(); srv.close(); process.exit(1); }

  let failures = 0;
  for (const c of CASES) {
    // Measure a DELTA in .lt-error elements INSIDE the terminal, not a substring of the page.
    // The first version searched document.body.innerHTML for the command text and then tested
    // the remainder for /lt-error/ -- but the module's own JS task definitions contain the same
    // command strings, so the "tail" was arbitrary page content and any unrelated lt-error later
    // in the DOM satisfied it. That harness PASSED against a deliberately ABLATED engine, i.e.
    // it could not fail and verified nothing. Counting elements added to the terminal by THIS
    // command cannot be fooled that way.
    const gotError = await pg.evaluate((cmd) => {
      const term = document.querySelector('.lt-terminal, .lt-output, #terminal') || document.body;
      const before = term.querySelectorAll('.lt-error').length;
      const inp = document.querySelector('.lt-input') || document.querySelector('input');
      inp.value = cmd;
      inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return new Promise(res => setTimeout(() => {
        const after = term.querySelectorAll('.lt-error').length;
        res(after > before);
      }, 500));
    }, c.cmd);
    const ok = gotError === c.wantError;
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.cmd.padEnd(32)} error=${gotError} want=${c.wantError}  (${c.why})`);
  }
  await b.close(); srv.close();
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED — grep reports missing files and stays quiet on real ones');
  process.exit(failures ? 1 : 0);
})();
