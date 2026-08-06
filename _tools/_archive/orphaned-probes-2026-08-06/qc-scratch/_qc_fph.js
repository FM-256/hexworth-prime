const puppeteer = require('puppeteer');
const path = require('path');

const FILE = 'file://' + path.resolve('_app/houses/forge/applets/comptia-aplus/core-1/labs/forge-front-panel-header.lab.html');

const ACCESS_STUB = 'window.AccessGuard={require(){},requireAdmin(){}};';

async function newPage(browser, log) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: ACCESS_STUB });
    } else if (u.startsWith('http') && (u.includes('/_lib/') || u.includes('/assets/'))) {
      // block remote assets we don't need
      req.abort();
    } else {
      req.continue();
    }
  });
  page.on('pageerror', e => log.errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') log.console.push('CONSOLE.ERR: ' + m.text()); });
  await page.goto(FILE, { waitUntil: 'domcontentloaded' });
  // patch ModuleProgress.complete
  await page.evaluate(() => {
    window.__done = null;
    if (typeof ModuleProgress !== 'undefined') {
      const o = ModuleProgress.complete;
      ModuleProgress.complete = function (...a) { window.__done = a; try { return o.apply(this, a); } catch (e) {} };
    } else {
      // Define a stub so showModal's typeof check passes and we capture the call
      window.ModuleProgress = { complete: function (...a) { window.__done = a; } };
    }
  });
  return page;
}

// helpers run in page
async function advanceToWiring(page) {
  await page.evaluate(() => completeStep(0));
}
async function placeNonPolar(page, connId) {
  await page.evaluate((id) => {
    selectConnector(id);
    document.querySelector(`.pin-socket[data-group-id="${id}"]:not(.pin-nc)`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, connId);
}
async function placePolar(page, connId, orient, targetGroup) {
  targetGroup = targetGroup || connId;
  await page.evaluate((id, or, tg) => {
    selectConnector(id);
    selectOrientation(or);
    document.querySelector(`.pin-socket[data-group-id="${tg}"]:not(.pin-nc)`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, connId, orient, targetGroup);
}
async function placeWrongGroup(page, connId, targetGroup) {
  // non-polar connector onto a different group
  await page.evaluate((id, tg) => {
    selectConnector(id);
    document.querySelector(`.pin-socket[data-group-id="${tg}"]:not(.pin-nc)`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, connId, targetGroup);
}
async function state(page) {
  return page.evaluate(() => ({
    placements: JSON.parse(JSON.stringify(placements)),
    connectBtnDisabled: document.getElementById('btn-connect').disabled,
    selHint: document.getElementById('selection-hint').textContent,
    selHintVisible: document.getElementById('selection-hint').classList.contains('visible'),
  }));
}
async function runPost(page) {
  await page.evaluate(() => runPostTest());
  // wait for interval to finish (4 steps * 500ms + buffer)
  await new Promise(r => setTimeout(r, 2600));
}
async function postOutcome(page) {
  return page.evaluate(() => ({
    done: window.__done,
    feedbackClass: document.getElementById('post-feedback').className,
    feedbackText: document.getElementById('post-feedback').innerText,
    modalActive: document.getElementById('results-modal').classList.contains('active'),
    modalTitle: document.getElementById('modal-title').textContent,
    postBtnDisabled: document.getElementById('btn-post').disabled,
  }));
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const report = {};

  // ───────── TEST 1: correct wiring ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    await placeNonPolar(page, 'pwr-sw');
    await placeNonPolar(page, 'reset-sw');
    await placePolar(page, 'pwr-led', 'normal');
    await placePolar(page, 'hdd-led', 'normal');
    await placeNonPolar(page, 'speaker');
    const st = await state(page);
    await page.evaluate(() => completeWiringStep());
    await runPost(page);
    const out = await postOutcome(page);
    report.test1_correct = { state: st, outcome: out, errors: log.errors, console: log.console };
    await page.close();
  }

  // ───────── TEST 2a: reversed Power LED -> must FAIL ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    await placeNonPolar(page, 'pwr-sw');
    await placeNonPolar(page, 'reset-sw');
    await placePolar(page, 'pwr-led', 'reversed');
    await placePolar(page, 'hdd-led', 'normal');
    await placeNonPolar(page, 'speaker');
    await page.evaluate(() => completeWiringStep());
    await runPost(page);
    report.test2a_pwrled_reversed = { outcome: await postOutcome(page), errors: log.errors };
    await page.close();
  }

  // ───────── TEST 2b: reversed HDD LED -> must FAIL ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    await placeNonPolar(page, 'pwr-sw');
    await placeNonPolar(page, 'reset-sw');
    await placePolar(page, 'pwr-led', 'normal');
    await placePolar(page, 'hdd-led', 'reversed');
    await placeNonPolar(page, 'speaker');
    await page.evaluate(() => completeWiringStep());
    await runPost(page);
    report.test2b_hddled_reversed = { outcome: await postOutcome(page), errors: log.errors };
    await page.close();
  }

  // ───────── TEST 2c: switches non-polarized — orientation not even offered ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    // probe: select pwr-sw, is orient selector visible? what is selectedOrient?
    const probe = await page.evaluate(() => {
      selectConnector('pwr-sw');
      return {
        orientVisible: document.getElementById('orient-selector').classList.contains('visible'),
        selectedOrient: typeof selectedOrient !== 'undefined' ? selectedOrient : 'undef',
      };
    });
    // Now build full correct set but try forcing a 'reversed' on a switch programmatically
    // (UI never offers it; test grader doesn't penalize switch orientation)
    await page.evaluate(() => {
      // place switch with reversed orientation by directly invoking placeConnector
      placeConnector('pwr-sw', 'pwr-sw', 'reversed');
      placeConnector('reset-sw', 'reset-sw', 'reversed');
    });
    await placePolar(page, 'pwr-led', 'normal');
    await placePolar(page, 'hdd-led', 'normal');
    await placeNonPolar(page, 'speaker');
    await page.evaluate(() => completeWiringStep());
    await runPost(page);
    report.test2c_switch_reversed = { probe, outcome: await postOutcome(page), errors: log.errors };
    await page.close();
  }

  // ───────── TEST 3: wrong group (Reset onto HDD_LED pins) -> must FAIL/blocked ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    // Attempt to place reset-sw onto hdd-led group via UI socket click
    await placeWrongGroup(page, 'reset-sw', 'hdd-led');
    const afterMismatch = await state(page);
    // Now force a wrong-group placement into state to confirm grader rejects it
    await page.evaluate(() => {
      placeConnector('pwr-sw', 'pwr-sw', 'normal');
      // reset-sw connector seated on hdd-led group:
      placeConnector('hdd-led', 'reset-sw', 'normal');
      placeConnector('pwr-led', 'pwr-led', 'normal');
      placeConnector('reset-sw', 'reset-sw', 'normal');
      placeConnector('speaker', 'speaker', 'normal');
    });
    await page.evaluate(() => completeWiringStep());
    await runPost(page);
    report.test3_wrong_group = { afterMismatchHint: { text: afterMismatch.selHint, visible: afterMismatch.selHintVisible, placements: afterMismatch.placements }, outcome: await postOutcome(page), errors: log.errors };
    await page.close();
  }

  // ───────── TEST 4a: empty sockets — can connect btn / post fire? ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    const empty = await page.evaluate(() => ({
      connectDisabled: document.getElementById('btn-connect').disabled,
      // try forcing completeWiringStep with nothing placed
    }));
    const forced = await page.evaluate(() => {
      completeWiringStep(); // should be a no-op (allPlaced false)
      return { currentStep: currentStep, postBtnDisabled: document.getElementById('btn-post').disabled, step2locked: document.getElementById('build-step-2').classList.contains('locked') };
    });
    report.test4a_empty = { emptyConnectDisabled: empty.connectDisabled, forcedCompleteWiring: forced, errors: log.errors };
    await page.close();
  }

  // ───────── TEST 4b: reset mid-POST animation — does interval get cleared / false complete? ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    await placeNonPolar(page, 'pwr-sw');
    await placeNonPolar(page, 'reset-sw');
    await placePolar(page, 'pwr-led', 'normal');
    await placePolar(page, 'hdd-led', 'normal');
    await placeNonPolar(page, 'speaker');
    await page.evaluate(() => completeWiringStep());
    // start POST then immediately reset mid-animation
    await page.evaluate(() => {
      runPostTest();
    });
    await new Promise(r => setTimeout(r, 700)); // mid-animation (after ~1 step)
    const midInterval = await page.evaluate(() => postInterval !== null);
    await page.evaluate(() => resetLab());
    const afterResetInterval = await page.evaluate(() => postInterval);
    // wait past where the animation would have completed
    await new Promise(r => setTimeout(r, 2500));
    const out = await postOutcome(page);
    report.test4b_reset_mid_post = {
      midAnimationIntervalActive: midInterval,
      intervalAfterReset: afterResetInterval, // expect null
      doneAfterReset: out.done,               // expect null (no false completion)
      modalActive: out.modalActive,
      errors: log.errors,
    };
    await page.close();
  }

  // ───────── TEST 4c: early test click (btn-post before wiring) ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    const earlyBtn = await page.evaluate(() => document.getElementById('btn-post').disabled);
    // force runPostTest with nothing placed — grader defensive branch
    await page.evaluate(() => runPostTest());
    await new Promise(r => setTimeout(r, 2600));
    report.test4c_early_post_empty = { postBtnDisabledInitially: earlyBtn, outcome: await postOutcome(page), errors: log.errors };
    await page.close();
  }

  // ───────── TEST 6: overflow / visual at 1280 ─────────
  {
    const log = { errors: [], console: [] };
    const page = await newPage(browser, log);
    await advanceToWiring(page);
    await placeNonPolar(page, 'pwr-sw');
    await placeNonPolar(page, 'reset-sw');
    await placePolar(page, 'pwr-led', 'normal');
    await placePolar(page, 'hdd-led', 'normal');
    await placeNonPolar(page, 'speaker');
    const overflow = await page.evaluate(() => ({
      docScrollW: document.documentElement.scrollWidth,
      docClientW: document.documentElement.clientWidth,
      bodyScrollW: document.body.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    await page.screenshot({ path: '_qc_fph_board.png', fullPage: false });
    report.test6_overflow = { overflow, errors: log.errors };
    await page.close();
  }

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
