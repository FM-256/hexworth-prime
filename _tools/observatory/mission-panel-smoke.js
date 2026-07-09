// Headless smoke for the Command Mastery MISSIONS panel on the Observatory sandbox
// card. Same stub strategy as sandbox-card-smoke.js (real HTML + real
// SandboxLauncher.js, everything else stubbed, fetch mocked) plus:
//   - /missions returns a one-mission catalog
//   - /launch echoes back whether the body carried the mission id
//   - /check?mission=... returns the rich mission shape (incl. a hidden task + feedback)
//   - FirebaseAuth.callFunction('awardMissionBadge') is captured and returns awarded:true
// Asserts: catalog paints, Start Mission wires selection + launches WITH the mission,
// grading renders per-task feedback + hidden masking, Claim appears only on
// badgeEligible and calls the CF, server verdict renders.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const APP = path.resolve(__dirname, '../../_app');
const PAGE_URL = 'https://hexworth.com/houses/observatory/index.html';

// Stubs identical to sandbox-card-smoke.js, except FirebaseAuth also captures
// callFunction (the badge claim path).
const STUBS = {
    'AccessGuard.js': 'window.AccessGuard={require:function(){}};',
    'SkillTreeData.js': '', 'LearningPaths.js': '',
    'ProgressManager.js': '', 'FluxCapacitor.js': '', 'FavoritesManager.js': '',
    'ContentDiscovery.js': '', 'TrailHunter.js': '', 'MasteryXP.js': '',
    'mascot-lore.js': '',
    'StampRollout.js': 'window.StampRollout={init:function(){}};',
    'ContentCatalog.js': 'window.ContentCatalog={getHouseModules:function(){return[];}};',
    'HouseRenderer.js': 'window.HouseRenderer={init:function(cfg){if(cfg&&cfg.afterStatsHTML){var d=document.createElement("div");d.innerHTML=cfg.afterStatsHTML;document.body.appendChild(d);}}};',
    'FirebaseAuth.js': 'window.__cfCalls=[];window.FirebaseAuth={waitForAuth:async function(){},isSignedIn:function(){return true;},refreshToken:async function(){return "fake-token";},callFunction:async function(name,data){window.__cfCalls.push({name:name,data:data});return {data:{awarded:true,badgeId:"lcm_cat_lost_notes",name:"Lost Notes: Recovered"}};}};',
    'firebase-init.js': '',
    'ObservatoryConsent.js': 'window.ObservatoryConsent={ensureConsent:function(cb){cb();},showChangeClass:function(){},showWithdraw:function(){}};',
    'ObservatoryTracker.js': 'window.ObservatoryTracker={init:function(){},logSandbox:function(){}};',
    'AchievementSystem.js': 'window.__badges=[];window.AchievementSystem={unlock:function(id){window.__badges.push(id);return true;},isUnlocked:function(id){return window.__badges.indexOf(id)!==-1;},ACHIEVEMENTS:{}};',
};

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));

    // fetch mock: missions catalog, mission-aware launch, mission grading.
    await page.evaluateOnNewDocument(() => {
        window.__launchBodies = [];
        window.fetch = async (url, opts) => {
            const u = String(url);
            if (u.includes('/missions')) {
                return { ok: true, json: async () => ({ ok: true, missions: [{
                    id: 'cat-lost-notes', labId: 'linux-sandbox', title: 'Mission 01: Lost Notes',
                    command_star: 'cat', story: 'Rebuild the department report.', tier: 1,
                    badge: { id: 'lcm_cat_lost_notes', name: 'Lost Notes: Recovered' },
                    taskCount: 14,
                    tasks: [],
                }] }) };
            }
            if (u.includes('/launch')) {
                window.__launchBodies.push(opts && opts.body ? JSON.parse(opts.body) : {});
                return { ok: true, json: async () => ({ sessionId: 'smoke-sid', url: 'about:blank#ttyd-smoke', lab: 'Linux Practice Sandbox', status: 'running' }) };
            }
            if (u.includes('/check/') && u.includes('mission=')) {
                return { ok: true, json: async () => ({ ok: true, mission: 'cat-lost-notes',
                    passed: 2, total: 3, hiddenUnmet: 1, badgeEligible: false,
                    badge: { id: 'lcm_cat_lost_notes', name: 'Lost Notes: Recovered' },
                    results: [
                        { id: 't01', brief: 'Acknowledge the briefing', tier: 'bronze', bonus: false, hidden: false, pass: true, feedback: [] },
                        { id: 't02', brief: 'Recreate the notes', tier: 'bronze', bonus: false, hidden: false, pass: false, feedback: ['notes.txt does not exist yet.'] },
                        { id: 't13', brief: 'Hidden requirement', tier: 'gold', bonus: false, hidden: true, pass: false, feedback: [] },
                    ] }) };
            }
            if (u.includes('/check/')) {
                return { ok: true, json: async () => ({ ok: true, passed: 0, total: 5, complete: false, results: [] }) };
            }
            return { ok: true, json: async () => ({}) };
        };
    });

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
        req.respond({ body: '' });
    });

    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const checks = {};
    checks.panel = await page.$('.obs-missions') != null;
    checks.catalogPainted = await page.$eval('#obs-missions-list .obs-mission-card', el => !!el).catch(() => false);
    checks.starChip = (await page.$eval('.obs-mission-card__star', el => el.textContent).catch(() => '')) === 'cat';

    // Start Mission: selection + launch carries the mission id in the POST body.
    await page.click('.obs-mission-card__start');
    await new Promise(r => setTimeout(r, 400));
    checks.selected = await page.$eval('.obs-mission-card', el => el.classList.contains('selected')).catch(() => false);
    checks.launchCarriedMission = await page.evaluate(() =>
        window.__launchBodies.some(b => b.labId === 'linux-sandbox' && b.mission === 'cat-lost-notes'));
    checks.gradePanelShown = await page.$eval('#obs-mission-grade', el => el.style.display !== 'none').catch(() => false);

    // Grade: rich feedback + hidden note + no premature Claim.
    await page.click('#obs-mission-grade-btn');
    await new Promise(r => setTimeout(r, 300));
    const resultText = await page.$eval('#obs-mission-grade-result', el => el.textContent).catch(() => '');
    checks.gradeCounts = /2\s*\/\s*3 tasks complete/.test(resultText);
    checks.hiddenNote = /hidden requirement is not met/.test(resultText);
    checks.richFeedback = /notes\.txt does not exist yet\./.test(resultText);
    checks.hiddenMasked = /Hidden requirement/.test(resultText) && !/clean desk/i.test(resultText);
    checks.claimHiddenWhenIneligible = await page.$eval('#obs-mission-claim-btn', el => el.style.display === 'none').catch(() => false);

    // Force-eligible verdict: re-mock grading to eligible, re-grade, claim -> CF called.
    await page.evaluate(() => {
        const orig = window.fetch;
        window.fetch = async (url, opts) => {
            const u = String(url);
            if (u.includes('/check/') && u.includes('mission=')) {
                return { ok: true, json: async () => ({ ok: true, mission: 'cat-lost-notes',
                    passed: 3, total: 3, hiddenUnmet: 0, badgeEligible: true,
                    badge: { id: 'lcm_cat_lost_notes', name: 'Lost Notes: Recovered' },
                    results: [
                        { id: 't01', brief: 'Acknowledge the briefing', tier: 'bronze', bonus: false, hidden: false, pass: true, feedback: [] },
                        { id: 't02', brief: 'Recreate the notes', tier: 'bronze', bonus: false, hidden: false, pass: true, feedback: [] },
                        { id: 't13', brief: 'Hidden requirement', tier: 'gold', bonus: false, hidden: true, pass: true, feedback: [] },
                    ] }) };
            }
            return orig(url, opts);
        };
    });
    await page.click('#obs-mission-grade-btn');
    await new Promise(r => setTimeout(r, 300));
    checks.claimShownWhenEligible = await page.$eval('#obs-mission-claim-btn', el => el.style.display !== 'none').catch(() => false);
    if (checks.claimShownWhenEligible) {
        await page.click('#obs-mission-claim-btn');
        await new Promise(r => setTimeout(r, 300));
        checks.cfCalled = await page.evaluate(() =>
            window.__cfCalls.some(c => c.name === 'awardMissionBadge' && c.data && c.data.mission === 'cat-lost-notes'));
        const after = await page.$eval('#obs-mission-grade-result', el => el.textContent).catch(() => '');
        checks.serverVerdictShown = /server-verified.*Lost Notes: Recovered/.test(after);
    } else {
        checks.cfCalled = false; checks.serverVerdictShown = false;
    }

    await browser.close();
    const pass = Object.values(checks).every(Boolean) && errors.length === 0;
    console.log('  mission panel smoke:');
    for (const [k, v] of Object.entries(checks)) console.log('    ' + (v ? 'PASS' : 'FAIL') + '  ' + k);
    if (errors.length) { console.log('    page errors:'); errors.forEach(e => console.log('      ' + e.slice(0, 160))); }
    console.log(pass ? '  ALL GREEN' : '  FAILED');
    process.exit(pass ? 0 : 1);
})();
