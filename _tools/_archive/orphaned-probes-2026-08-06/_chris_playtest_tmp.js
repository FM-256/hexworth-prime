const puppeteer = require('puppeteer');

const URL = 'http://localhost:8934/houses/forge/applets/comptia-aplus/core-1/labs/forge-troubleshooting-scenarios.lab.html';

// Correct choice index per scenario per step, derived from SCENARIOS data (grep'd manually)
const CORRECT = {
  'silent-workstation': [1, 0, 1],
  'overheating-laptop': [1, 1, 1],
  'phantom-printer': [1, 1],
  'disappearing-wifi': [1, 1],
  'blue-screen-loop': [1, 1, 1],
  'slow-network': [1, 1],
  'locked-out-user': [1, 0],
  'malware-outbreak': [1, 0, 0],
  'failed-upgrade': [1, 0, 1],
  'mobile-crisis': [1, 0, 1]
};

const ORDER = ['silent-workstation','overheating-laptop','phantom-printer','disappearing-wifi',
  'blue-screen-loop','slow-network','locked-out-user','malware-outbreak','failed-upgrade','mobile-crisis'];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const consoleErrors = [];
  const completeLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('MODULEPROGRESS_COMPLETE_CALLED')) completeLogs.push(text);
    if (msg.type() === 'error') {
      if (text.includes('syncClassProgress') || text.includes('401')) return;
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => consoleErrors.push('PAGEERROR: ' + err.message));

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'forge');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    window.__completeCalls = [];
    if (typeof ModuleProgress !== 'undefined') {
      const orig = ModuleProgress.complete.bind(ModuleProgress);
      ModuleProgress.complete = function(...args) {
        window.__completeCalls.push(JSON.stringify(args));
        console.log('MODULEPROGRESS_COMPLETE_CALLED ' + JSON.stringify(args));
        return orig(...args);
      };
      window.__mpDefined = true;
    } else {
      window.__mpDefined = false;
    }
  });
  const mpDefined = await page.evaluate(() => window.__mpDefined);

  const results = { mpDefined };

  // ---- Scenario 6 render + text check ----
  await page.evaluate(() => openScenario('slow-network'));
  const s6text = await page.evaluate(() => {
    const el = document.querySelector('#card_slow-network');
    return el.textContent;
  });
  results.s6hasCableFaultText = s6text.includes('pins 4, 5, 7, and 8') || s6text.includes('wire pairs 1 and 4');
  results.s6outcomeTextCheck = s6text.includes('crushed under a furniture leg');

  await page.evaluate(() => beginTroubleshooting('slow-network'));
  const s6step0choices = await page.evaluate(() => [...document.querySelectorAll('#choices_slow-network_0 .choice-btn')].map(b=>b.textContent.trim()));
  results.s6step0ChoiceCount = s6step0choices.length;

  // try wrong on step0
  await page.evaluate(() => handleChoice('slow-network', 0, 0));
  const s6wrong = await page.evaluate(() => {
    const btn = document.getElementById('choice_slow-network_0_0');
    const nextBtn = document.getElementById('nextBtn_slow-network_0');
    return { disabled: btn.disabled, wrong: btn.classList.contains('wrong'), nextVisible: nextBtn.style.display };
  });
  results.s6step0WrongRejected = s6wrong.disabled && s6wrong.wrong && s6wrong.nextVisible !== 'inline-block';
  // now correct
  await page.evaluate(() => handleChoice('slow-network', 0, 1));
  await page.click('#nextBtn_slow-network_0');
  // step1 wrong then correct
  await page.evaluate(() => handleChoice('slow-network', 1, 0));
  const s6step1wrong = await page.evaluate(() => {
    const btn = document.getElementById('choice_slow-network_1_0');
    return { disabled: btn.disabled, wrong: btn.classList.contains('wrong') };
  });
  results.s6step1WrongRejected = s6step1wrong.disabled && s6step1wrong.wrong;
  await page.evaluate(() => handleChoice('slow-network', 1, 1));
  await page.click('#nextBtn_slow-network_1');
  const s6outcomeVisible = await page.evaluate(() => document.getElementById('outcomeArea_slow-network').classList.contains('visible'));
  results.s6outcomeVisible = s6outcomeVisible;
  // do NOT complete via next-scenario btn, go back and play full run in order instead

  // ---- FULL 10/10 RUN in canonical order via sidebar navigation ----
  for (const id of ORDER) {
    await page.evaluate((sid) => openScenario(sid), id);
    const alreadyDone = await page.evaluate((sid) => {
      // if outcome already visible from previous partial test (slow-network), still need officially "complete" via state.completed - it is already added by showOutcome
      return false;
    }, id);
    // Check if state already has this completed (slow-network, failed-upgrade were done above)
    const isCompleted = await page.evaluate((sid) => state.completed.has(sid), id);
    if (isCompleted) continue;
    await page.evaluate((sid) => beginTroubleshooting(sid), id);
    const steps = CORRECT[id];
    for (let i = 0; i < steps.length; i++) {
      await page.evaluate((sid, si, ci) => handleChoice(sid, si, ci), id, i, steps[i]);
      await page.click(`#nextBtn_${id}_${i}`);
    }
  }

  const completedCount = await page.evaluate(() => state.completed.size);
  results.completedCount = completedCount;
  results.completeLogsAfterFullRun = completeLogs.length;

  // Navigate to complete section (View Summary) and click Complete Module button (second trigger attempt)
  await page.evaluate(() => showCompleteSection());
  const completeSectionVisible = await page.evaluate(() => document.getElementById('completeSectionWrapper').style.display);
  results.completeSectionVisible = completeSectionVisible;
  const completeBtnExists = await page.evaluate(() => !!document.querySelector('.complete-btn'));
  results.completeBtnExists = completeBtnExists;

  await page.click('.complete-btn');
  await new Promise(r => setTimeout(r, 300));

  results.completeLogsAfterManualClick = completeLogs.length;
  const finalCallCount = await page.evaluate(() => window.__completeCalls.length);
  results.finalModuleProgressCompleteCallCount = finalCallCount;
  results.moduleCompletedFlag = await page.evaluate(() => moduleCompleted);

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  console.log('COMPLETE_LOGS:', JSON.stringify(completeLogs, null, 2));
  console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors, null, 2));
})();
