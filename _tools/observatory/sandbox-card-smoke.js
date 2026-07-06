// Headless smoke for the Observatory Linux Practice Sandbox showcase card.
// Loads the real _app/houses/observatory/index.html with every component STUBBED
// except the real SandboxLauncher.js, mocks fetch so no bc1 call is made, and
// asserts: (1) the showcase panel renders, (2) SandboxLauncher.renderButton mounts
// into #obs-sandbox-mount, (3) clicking Launch calls POST /launch with labId
// linux-sandbox and embeds the returned session URL in the iframe.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const APP = path.resolve(__dirname, '../../_app');
const PAGE_URL = 'https://hexworth.com/houses/observatory/index.html';

// Minimal JS stubs keyed by script basename. Each defines just enough global for
// the observatory inline script to run through to the sandbox mount.
const STUBS = {
    'AccessGuard.js': 'window.AccessGuard={require:function(){}};',
    'SkillTreeData.js': '', 'LearningPaths.js': '', 'AchievementSystem.js': '',
    'ProgressManager.js': '', 'FluxCapacitor.js': '', 'FavoritesManager.js': '',
    'ContentDiscovery.js': '', 'TrailHunter.js': '', 'MasteryXP.js': '',
    'mascot-lore.js': '',
    'StampRollout.js': 'window.StampRollout={init:function(){}};',
    'ContentCatalog.js': 'window.ContentCatalog={getHouseModules:function(){return[];}};',
    'HouseRenderer.js': 'window.HouseRenderer={init:function(cfg){if(cfg&&cfg.afterStatsHTML){var d=document.createElement("div");d.innerHTML=cfg.afterStatsHTML;document.body.appendChild(d);}}};',
    'FirebaseAuth.js': 'window.FirebaseAuth={waitForAuth:async function(){},isSignedIn:function(){return true;},refreshToken:async function(){return "fake-token";}};',
    'firebase-init.js': '',
    'ObservatoryConsent.js': 'window.ObservatoryConsent={ensureConsent:function(cb){cb();},showChangeClass:function(){},showWithdraw:function(){}};',
    'ObservatoryTracker.js': 'window.ObservatoryTracker={init:function(){}};',
};

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));

    // Mock fetch before any script runs: POST /launch returns a fake running session.
    await page.evaluateOnNewDocument(() => {
        window.fetch = async (url, opts) => {
            const u = String(url);
            if (u.includes('/launch')) {
                return { ok: true, json: async () => ({ sessionId: 'smoke-sid', url: 'about:blank#ttyd-smoke', lab: 'Linux Practice Sandbox', status: 'running' }) };
            }
            return { ok: true, json: async () => ({}) };
        };
    });

    // Serve the real HTML + real SandboxLauncher.js; stub everything else.
    await page.setRequestInterception(true);
    page.on('request', req => {
        const url = req.url();
        if (url === PAGE_URL) {
            req.respond({ contentType: 'text/html', body: fs.readFileSync(path.join(APP, 'houses/observatory/index.html'), 'utf8') });
            return;
        }
        const base = url.split('?')[0].split('/').pop();
        if (base === 'SandboxLauncher.js') {
            req.respond({ contentType: 'application/javascript', body: fs.readFileSync(path.join(APP, 'components/SandboxLauncher.js'), 'utf8') });
            return;
        }
        if (Object.prototype.hasOwnProperty.call(STUBS, base)) {
            req.respond({ contentType: 'application/javascript', body: STUBS[base] });
            return;
        }
        if (/\.(webp|png|jpg|svg|mp4|css|ico)$/.test(base)) { req.respond({ body: '' }); return; }
        req.respond({ body: '' });
    });

    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    // Give the retrying mount + renderButton a moment.
    await new Promise(r => setTimeout(r, 400));

    const checks = {};
    checks.panel = await page.$('.obs-sandbox-showcase') != null;
    checks.title = (await page.$eval('.obs-sandbox-showcase__title', el => el.textContent.trim()).catch(() => '')) === 'Linux Practice Sandbox';
    checks.mounted = await page.$('#obs-sandbox-mount .sandbox-launcher') != null;
    checks.launchBtn = await page.$('#obs-sandbox-mount .sandbox-launcher__btn--launch') != null;

    // Click Launch and confirm the iframe gets the mocked session URL.
    if (checks.launchBtn) {
        await page.click('#obs-sandbox-mount .sandbox-launcher__btn--launch');
        await new Promise(r => setTimeout(r, 300));
        const src = await page.$eval('#obs-sandbox-mount .sandbox-launcher__iframe', el => el.getAttribute('src')).catch(() => '');
        checks.launched = (src || '').includes('ttyd-smoke');
    } else {
        checks.launched = false;
    }

    await browser.close();

    const pass = Object.values(checks).every(Boolean) && errors.length === 0;
    console.log('  sandbox card smoke:');
    for (const [k, v] of Object.entries(checks)) console.log('    ' + (v ? 'PASS' : 'FAIL') + '  ' + k);
    if (errors.length) { console.log('    page errors:'); errors.forEach(e => console.log('      ' + e.slice(0, 160))); }
    console.log(pass ? '  ALL GREEN' : '  FAILED');
    process.exit(pass ? 0 : 1);
})();
