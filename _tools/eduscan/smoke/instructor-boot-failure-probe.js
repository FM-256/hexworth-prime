// Proves BUG-075: when tenant/instructor.html fails to boot, the user can still leave.
//
// The trap this closes: on the failure path the catch block sets "Initialization failed" and
// NEVER reveals the app element, so the header — and its Dashboard button, the page's only
// other navigation — is never shown. The user is left on a full-screen loader with a spinner
// still turning and nothing to click. Cold entry (bookmark, shared link, cleared storage) is
// the ordinary way to reach that state.
//
// Asserting "an exit link exists in the DOM" would be a proxy. This forces a real failure, then
// asserts the link is VISIBLE and that clicking it actually navigates away.
//
// Ablation (--ablate) strips the reveal so the run must FAIL.
//
// usage: BASE=https://... node _tools/eduscan/smoke/instructor-boot-failure-probe.js [--ablate]
const puppeteer = require('puppeteer');
const https = require('https');

const BASE = process.env.BASE;
// Reaching the trap requires a SIGNED-IN user with no tenant context. An unauthenticated cold
// visitor is redirected to /login.html and is never stranded -- which is a good outcome and
// narrows the bug: it is the authenticated-but-tenantless case (cleared storage, new device,
// an instructor bookmark) that lands on the dead loader.
const KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const EMAIL = `bug075-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`;
const PW = 'Bp' + Math.random().toString(36).slice(2, 6) + '9X';
function signUp() {
  const body = JSON.stringify({ email: EMAIL, password: PW, returnSecureToken: true });
  return new Promise((res, rej) => {
    const r = https.request({ method: 'POST', hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signUp?key=${KEY}`,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
                 'Referer': 'https://hexworth-prime.web.app/' } },
      (x) => { let d = ''; x.on('data', c => d += c); x.on('end', () => { try { const j = JSON.parse(d); j.idToken ? res(j) : rej(new Error(d.slice(0,200))); } catch (e) { rej(e); } }); });
    r.on('error', rej); r.write(body); r.end();
  });
}
const ABLATE = process.argv.includes('--ablate');

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1280, height: 800 });

    // COLD ENTRY: no TENANT context, but the visitor is still 'sorted'.
    // Clearing localStorage wholesale also wipes hexworth_house, which makes AccessGuard
    // redirect to the tourist-visa prompt -- so the probe never lands on instructor.html at all
    // and every assertion measures the wrong page. Set the house, clear only tenant state.
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.clear(); sessionStorage.clear();
        localStorage.setItem('hexworth_house', 'cloud');
      } catch (e) {}
    });
    if (ABLATE) {
      // Undo the fix: hide the exit again right after the page scripts run.
      await page.evaluateOnNewDocument(() => {
        document.addEventListener('DOMContentLoaded', function () {
          var i = setInterval(function () {
            var e = document.getElementById('loader-exit');
            if (e) { e.style.display = 'none'; }
          }, 100);
          setTimeout(function () { clearInterval(i); }, 20000);
        });
      });
    }

    // Sign in for real, then go to the page with NO tenant context set.
    await signUp();
    await page.goto(`${BASE}/login.html`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));
    const signedIn = await page.evaluate(async (e, p) => {
      try { await FirebaseAuth.signInWithEmail(e, p); const u = FirebaseAuth.getUser(); return !!(u && u.uid); }
      catch (err) { return false; }
    }, EMAIL, PW);
    if (!signedIn) { console.log('\n  PROBE INVALID: could not sign in; cannot reach the trap.'); process.exit(2); }

    await page.goto(`${BASE}/tenant/instructor.html`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 9000));   // let auth attempt + fail

    // Guard: if AccessGuard bounced us, say so instead of asserting against another page.
    const landed = new URL(page.url()).pathname;
    if (landed !== '/tenant/instructor.html') {
      console.log(`\n  PROBE INVALID: redirected to ${landed} -- not measuring instructor.html.`);
      process.exit(2);
    }

    const state = await page.evaluate(() => {
      const loader = document.getElementById('tenant-loader');
      const exit = document.getElementById('loader-exit');
      const app = document.querySelector('.vc-header');
      const vis = (el) => !!(el && el.offsetParent !== null && getComputedStyle(el).display !== 'none');
      return {
        loaderPresent: !!loader,
        loaderText: (document.getElementById('loader-text') || {}).textContent || '',
        appHeaderVisible: vis(app),
        exitVisible: vis(exit),
        exitHref: exit ? exit.getAttribute('href') : null,
        spinnerVisible: vis(document.querySelector('#tenant-loader .hud-spinner')),
        // Every clickable thing the user can actually see right now.
        visibleClickables: [...document.querySelectorAll('a,button')].filter(vis).length,
      };
    });

    console.log(`  loader text: "${state.loaderText}"`);
    console.log(`  app header visible: ${state.appHeaderVisible} | visible clickables: ${state.visibleClickables}`);

    // If the app DID boot, this environment has tenant access and the trap is not reachable
    // here -- say so rather than silently passing on the wrong scenario.
    if (state.appHeaderVisible) {
      console.log('\n  NOTE: the app booted, so the failure path was not exercised.');
      console.log('  This probe only means something when boot actually fails.');
      process.exit(2);
    }

    check('boot failed as expected (the trap scenario)', /fail/i.test(state.loaderText), state.loaderText);
    check('an exit link is VISIBLE, not merely present', state.exitVisible === true);
    check('exit points somewhere real', state.exitHref === '/', String(state.exitHref));
    check('spinner stopped (does not claim work is still happening)', state.spinnerVisible === false);
    check('the user has at least one thing to click', state.visibleClickables >= 1, String(state.visibleClickables));

    if (state.exitVisible) {
      await Promise.all([
        page.waitForNavigation({ timeout: 15000 }).catch(() => null),
        page.click('#loader-exit'),
      ]);
      const left = new URL(page.url()).pathname !== '/tenant/instructor.html';
      check('clicking it actually navigates AWAY from the dead page', left, page.url());
    }

    await page.close();
  } finally { await browser.close().catch(() => {}); }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  if (ABLATE) {
    console.log(fail > 0 ? '\n  ABLATION OK -- without the reveal the user is stranded.'
                         : '\n  ABLATION FAILED -- passed with the fix disabled. False oracle.');
    process.exit(fail > 0 ? 0 : 1);
  }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
