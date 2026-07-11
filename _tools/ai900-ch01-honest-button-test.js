// Functional honesty test for ai900-ch01-intro-ai.lab.html (task #72, Family A).
// Boots the REAL lab HTML, drives its terminal via the input box (types + Enter,
// exactly as a student would), and asserts task cards only reach `.completed` when
// the student actually did the task. Oracle = the `.completed` class completeTask()
// adds to #task-card-N (task state lives inside an IIFE, not on window).
//
// Covers the 3 audit-found bugs + the 2 Nancy folded in:
//   T4  wrong --kind (TextAnalytics) must NOT complete "Deploy a Computer Vision resource"
//   T5  show the wrong resource (the T10 hub) must NOT complete "Verify the Resource"
//   T6  keys list the wrong resource must NOT complete "Retrieve API Keys"
//   T7  export garbage env vars must NOT complete "Set Environment Variables"
//   T9  garbage-env + python must NOT complete "Run AI Analysis" (whole-chain bypass)
// ...while the instructed happy-path still completes every task (no false rejection).
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const LAB = path.resolve(__dirname, '../_app/houses/ai/ai-900/labs/ai900-ch01-intro-ai.lab.html');
const HTML = fs.readFileSync(LAB, 'utf8');
const PAGE_URL = 'https://hexworth.com/__ai900-ch01-test';
const VISION_KEY1 = 'e3a7b2f1c9d04568a2b3c4d5e6f70001';   // must match the lab (:758)
const REAL_EP = 'https://my-vision-lab.cognitiveservices.azure.com';

// Boot a fresh copy of the lab (fresh IIFE state per page so scenarios don't bleed
// into each other), type the given list of terminal commands one-by-one via the real
// input box + Enter, and report which of the 10 task cards reached `.completed`.
// Returns { done: {1..10: bool}, realErrors: [] } — realErrors excludes the benign
// aborted-request noise from request interception.
async function runScenario(browser, commands) {
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
    await page.waitForSelector('#termInput');

    const done = await page.evaluate((cmds) => {
        const input = document.getElementById('termInput');
        function run(cmd) {
            input.value = cmd;
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
        cmds.forEach(run);
        const out = {};
        for (var n = 1; n <= 10; n++) {
            var card = document.getElementById('task-card-' + n);
            out[n] = !!(card && card.classList.contains('completed'));
        }
        return out;
    }, commands);

    // Filter benign isolation noise: aborted sibling-request failures, and AccessGuard —
    // the lab loads ../../../../components/AccessGuard.js (:6) and calls AccessGuard.require
    // (:8), but this harness serves ONLY the lab file, so that platform script is absent.
    // Pre-existing, unrelated to the honesty fix (the diff never touches AccessGuard).
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch|AccessGuard is not defined/i.test(e));
    await page.close();
    return { done, realErrors };
}

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const results = {};
    let allErrors = [];

    // ---- Scenario HAPPY: follow the instructions verbatim → all 10 complete ----
    const happy = await runScenario(browser, [
        'az account show',
        'az group list',
        'az cognitiveservices account list-kinds',
        'az cognitiveservices account create --name my-vision-lab --resource-group ai-fundamentals-rg --kind ComputerVision --sku F0 --location eastus',
        'az cognitiveservices account show --name my-vision-lab --resource-group ai-fundamentals-rg',
        'az cognitiveservices account keys list --name my-vision-lab --resource-group ai-fundamentals-rg',
        'export VISION_ENDPOINT=' + REAL_EP,
        'export VISION_KEY=' + VISION_KEY1,
        'ls ~/data/images/',
        'cat ~/scripts/analyze_image.py',
        'python3 ~/scripts/analyze_image.py ~/data/images/street-scene.jpg',
        'az cognitiveservices account create --name my-ai-hub --resource-group ai-fundamentals-rg --kind CognitiveServices --sku S0 --location eastus',
        'az cognitiveservices account list --resource-group ai-fundamentals-rg'
    ]);
    allErrors = allErrors.concat(happy.realErrors);
    results.happyAll10 = Object.keys(happy.done).every(k => happy.done[k] === true);

    // ---- Scenario A: T4 wrong kind (TextAnalytics) must NOT complete ----
    const wrongKind = await runScenario(browser, [
        'az cognitiveservices account create --name my-vision-lab --resource-group ai-fundamentals-rg --kind TextAnalytics --sku F0 --location eastus'
    ]);
    allErrors = allErrors.concat(wrongKind.realErrors);
    results.t4WrongKindBlocked = wrongKind.done[4] === false;

    // ---- Scenario A2: T4 wrong sku (S1) must NOT complete (all-five-flags honesty) ----
    const wrongSku = await runScenario(browser, [
        'az cognitiveservices account create --name my-vision-lab --resource-group ai-fundamentals-rg --kind ComputerVision --sku S1 --location eastus'
    ]);
    allErrors = allErrors.concat(wrongSku.realErrors);
    results.t4WrongSkuBlocked = wrongSku.done[4] === false;

    // ---- Scenario B: T7 garbage env must NOT complete ----
    const garbageExport = await runScenario(browser, [
        'export VISION_ENDPOINT=x',
        'export VISION_KEY=y'
    ]);
    allErrors = allErrors.concat(garbageExport.realErrors);
    results.t7GarbageBlocked = garbageExport.done[7] === false;

    // ---- Scenario C: T9 whole-chain bypass (garbage env + python) must NOT complete ----
    const bypassPython = await runScenario(browser, [
        'export VISION_ENDPOINT=x',
        'export VISION_KEY=y',
        'python3 ~/scripts/analyze_image.py ~/data/images/street-scene.jpg'
    ]);
    allErrors = allErrors.concat(bypassPython.realErrors);
    results.t9BypassBlocked = bypassPython.done[9] === false;

    // ---- Scenario D: T5/T6 wrong resource (the hub) must NOT complete ----
    const wrongResource = await runScenario(browser, [
        'az cognitiveservices account create --name my-ai-hub --resource-group ai-fundamentals-rg --kind CognitiveServices --sku S0 --location eastus',
        'az cognitiveservices account show --name my-ai-hub --resource-group ai-fundamentals-rg',
        'az cognitiveservices account keys list --name my-ai-hub --resource-group ai-fundamentals-rg'
    ]);
    allErrors = allErrors.concat(wrongResource.realErrors);
    results.t5WrongResourceBlocked = wrongResource.done[5] === false;
    results.t6WrongResourceBlocked = wrongResource.done[6] === false;

    await browser.close();

    const pass = Object.keys(results).every(k => results[k] === true) && allErrors.length === 0;

    console.log('\n  ai900-ch01 honest-button test (task #72, Family A)\n');
    console.log('  happy path completes all 10 tasks   : ' + results.happyAll10 + '   (no false rejection)');
    console.log('  T4 wrong --kind (TextAnalytics) block: ' + results.t4WrongKindBlocked);
    console.log('  T4 wrong --sku (S1) blocked          : ' + results.t4WrongSkuBlocked);
    console.log('  T7 garbage env (x/y) blocked         : ' + results.t7GarbageBlocked);
    console.log('  T9 whole-chain bypass blocked        : ' + results.t9BypassBlocked + '   (Nancy fold-in)');
    console.log('  T5 wrong resource (hub) blocked      : ' + results.t5WrongResourceBlocked);
    console.log('  T6 wrong resource (hub) blocked      : ' + results.t6WrongResourceBlocked + '   (Nancy fold-in)');
    if (allErrors.length) { console.log('\n  PAGE ERRORS:'); allErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
