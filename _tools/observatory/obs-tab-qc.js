// OBS-1 Sandbox tab QC — real observatory page + real HouseRenderer/MissionFieldGuide
// in headless Chrome; only the auth/consent/bc1 network boundary is stubbed.
// Covers Nancy's conditions:
//   A. 6 tabs on Observatory (5 built-in + Sandbox), sandbox panel holds the
//      full sandbox UI (mount + 18 sorted mission cards + field guides).
//   B. Teaser on the default view; clicking it activates the Sandbox panel.
//   C. Start-flow works INSIDE the panel.
//   D. Iframe DOM-survival: set src, switch away, switch back - same element,
//      src intact, no reload.
//   E. Stale-localStorage guard: stored tab id that does not exist must fall
//      back to paths (NOT a blank content area).
//   F. Blast radius: another house (shield) still renders EXACTLY 5 tabs.
//   G. Zero page/JS errors (resource-load file:// artifacts excluded).
const puppeteer = require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');
const ROOT = '/home/eq/ai-content/hexworth-prime';
const MDIR = ROOT + '/_tools/sandbox-missions';
const CATALOG = { missions: fs.readdirSync(MDIR)
  .filter(d => fs.existsSync(path.join(MDIR, d, 'mission.json')))
  .map(d => { const m = JSON.parse(fs.readFileSync(path.join(MDIR, d, 'mission.json'), 'utf8'));
    return { id: m.id, title: m.title, command_star: m.command_star, tier: m.tier,
             story: m.story.slice(0, 140), badge: m.badge,
             taskCount: m.tasks.filter(t => !t.hidden).length,
             // Mirror the server catalog's tasks[] shape (hidden briefs masked,
             // and — critically — substituteTokens(brief, {}) with an EMPTY env:
             // every $MISSION_* token becomes the literal '[assigned at launch]',
             // exactly what production serves pre-session). The Mission Workspace
             // paints its checklist from this.
             tasks: m.tasks.map(t => ({ id: t.id,
                                        brief: t.hidden ? 'Hidden requirement'
                                          : t.brief.replace(/\$MISSION_[A-Z0-9_]+/g, '[assigned at launch]'),
                                        tier: t.tier || 'bronze', bonus: !!t.bonus, hidden: !!t.hidden })) }; }) };
// small helpers: async pause + shorthand for an intercepted-JS response body
const sleep = ms => new Promise(r => setTimeout(r, ms));
const js = body => ({ contentType: 'application/javascript', body });

// Fixed grade payload the fake lab-manager returns for /check — mirrors the
// REAL gradeMission response shape from missions.js (incl. hiddenUnmet, which
// the stale doc comment omitted; verified against server source 2026-07-10).
const GRADE = {
  ok: true, mission: 'cat-lost-notes', title: 'Mission 01: Lost Notes',
  passed: 2, total: 5, hiddenUnmet: 1, badgeEligible: false, complete: false,
  results: [
    { id: 't01', brief: 'Read BRIEFING.txt and create ack.txt', tier: 'bronze', bonus: false, hidden: false, pass: true, feedback: [] },
    { id: 't02', brief: 'Recreate notes.txt with the three lines', tier: 'bronze', bonus: false, hidden: false, pass: false, feedback: ['notes.txt does not exist yet'] },
    { id: 't03', brief: 'Merge the fragments in order', tier: 'silver', bonus: false, hidden: false, pass: false, feedback: ['report_combined.txt missing'] },
    { id: 't04', brief: 'Hidden requirement', tier: 'gold', bonus: false, hidden: true, pass: false, feedback: [] },
    { id: 't05', brief: 'Pipe the report through a search', tier: 'silver', bonus: false, hidden: false, pass: true, feedback: [] },
  ],
};
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type,x-dev-uid', 'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS' };

// Shared interception: consent/auth/telemetry stubbed, everything else real.
// The lab-manager API is FAKED (not aborted) since 2026-07-10 so the full
// launch -> running -> grade flow runs end-to-end in headless Chrome.
function intercept(page) {
  page.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js/.test(u)) return r.respond(js('window.AccessGuard={require(){},requireAny(){},isTourist(){return false;}};'));
    if (/ObservatoryConsent\.js/.test(u)) return r.respond(js('window.ObservatoryConsent={ensureConsent(cb){setTimeout(cb,0);},showChangeClass(){},showWithdraw(){}};'));
    if (/ObservatoryTracker\.js/.test(u)) return r.respond(js('window.ObservatoryTracker={init(){},logSandbox(){}};'));
    if (/FirebaseAuth\.js|firebase-init\.js/.test(u)) return r.respond(js('window.FirebaseAuth={onAuthStateChanged(){},getCurrentUser(){return{uid:"qc"};},isSignedIn(){return true;},waitForAuth(){return Promise.resolve();},refreshToken(){return Promise.resolve("qc-token");},callFunction(){return Promise.resolve({data:{}});}};'));
    if (/sandbox\.hexworth\.tech/i.test(u)) {
      if (r.method() === 'OPTIONS') return r.respond({ status: 204, headers: CORS, body: '' });   // CORS preflight (fetch carries Authorization)
      if (/\/api\/sandbox\/launch/.test(u)) return r.respond({ headers: CORS, contentType: 'application/json', body: JSON.stringify({ sessionId: 'qc-sess-1', url: 'about:blank', lab: 'Linux Practice Sandbox', status: 'created' }) });
      if (/\/api\/sandbox\/check\//.test(u)) return r.respond({ headers: CORS, contentType: 'application/json', body: JSON.stringify(GRADE) });
      if (/\/api\/sandbox\/missions/.test(u)) return r.respond({ headers: CORS, contentType: 'application/json', body: JSON.stringify({ ok: true, missions: CATALOG.missions }) });
      return r.abort();   // destroy/status/etc — not needed by any test
    }
    if (/gstatic|googleapis|firestore|favicon|HexAIButton|hexai/i.test(u)) return r.abort();
    if (/SandboxLauncher\.js/.test(u)) {
      const real = fs.readFileSync(ROOT + '/_app/components/SandboxLauncher.js', 'utf8');
      return r.respond(js(real + '\n;SandboxLauncher.listMissions=async()=>window.__QC_CATALOG;'));
    }
    r.continue();
  });
}

// Open a house page with the standard stub set. preScript (optional) runs
// before any page script - used to preseed localStorage for the stale-tab test.
// viewport (optional): {width,height} — the fold test needs a real laptop size.
async function boot(browser, pagePath, preScript, viewport) {
  const page = await browser.newPage();
  if (viewport) await page.setViewport(viewport);
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  // resource-load + bot-settings errors are file:// stub artifacts (network
  // aborted), verified pre-existing; real JS errors stay fatal.
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|Cannot get bot settings/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.evaluateOnNewDocument(`window.__QC_CATALOG = ${JSON.stringify(CATALOG)}; ${preScript || ''}`);
  await page.setRequestInterception(true);
  intercept(page);
  await page.goto('file://' + pagePath, { waitUntil: 'load' });
  await sleep(900);
  return { page, errors };
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  let fails = 0, total = 0;
  // assertion helper: prints ok/FAIL per named expectation and counts failures
  const check = (name, val, expect) => {
    total++;
    const ok = val === expect;
    if (!ok) fails++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: ${JSON.stringify(val)} (expect ${JSON.stringify(expect)})`);
  };

  console.log('===== [A/B/C/D] Observatory with Sandbox tab =====');
  const { page: obs, errors: obsErr } = await boot(browser, ROOT + '/_app/houses/observatory/index.html');
  const a = await obs.evaluate(async () => {
    const out = {};
    out.tabs = document.querySelectorAll('.hr-tab[role="tab"]').length;
    out.sandboxTab = !!document.getElementById('hr-tab-sandbox');
    const panel = document.getElementById('hr-panel-sandbox');
    out.panelHasMount = !!(panel && panel.querySelector('#obs-sandbox-mount'));
    out.teaser = !!document.querySelector('.obs-sandbox-teaser');
    out.teaserInPanel = !!(panel && panel.querySelector('.obs-sandbox-teaser'));
    // B: click teaser -> sandbox panel active
    document.querySelector('.obs-sandbox-teaser__btn').click();
    await new Promise(r => setTimeout(r, 700)); // renderMissionsPanel is async
    out.panelActive = panel.classList.contains('active');
    out.cards = panel.querySelectorAll('.obs-mission-card').length;
    const titles = Array.from(panel.querySelectorAll('.obs-mission-card strong')).slice(0, 2).map(e => e.textContent);
    out.orderOk = /Mission 01/.test(titles[0] || '') && /Mission 02/.test(titles[1] || '');
    out.guides = panel.querySelectorAll('details.mission-fieldguide').length;
    // C: start flow inside the panel
    const btn = panel.querySelector('.obs-mission-card__start');
    if (btn) { btn.click(); await new Promise(r => setTimeout(r, 150)); }
    out.selected = panel.querySelectorAll('.obs-mission-card.selected').length;
    // D: iframe survival across tab switches
    const iframe = panel.querySelector('.sandbox-launcher__iframe');
    if (iframe) {
      iframe.dataset.qcMark = 'original';
      iframe.src = 'about:blank#qc-live';
      document.getElementById('hr-tab-paths').click();
      await new Promise(r => setTimeout(r, 200));
      out.hiddenWhileAway = !panel.classList.contains('active');
      document.getElementById('hr-tab-sandbox').click();
      await new Promise(r => setTimeout(r, 200));
      const back = panel.querySelector('.sandbox-launcher__iframe');
      out.iframeSameNode = back === iframe && back.dataset.qcMark === 'original';
      out.iframeSrcIntact = back.src.endsWith('#qc-live');
    } else { out.hiddenWhileAway = 'no-iframe'; }
    return out;
  });
  check('tabs rendered', a.tabs, 6);
  check('sandbox tab present', a.sandboxTab, true);
  check('panel holds sandbox mount', a.panelHasMount, true);
  check('teaser on default view', a.teaser, true);
  check('teaser NOT inside panel', a.teaserInPanel, false);
  check('teaser click activates panel', a.panelActive, true);
  check('mission cards in panel', a.cards, 18);
  check('curriculum order', a.orderOk, true);
  check('field guides in panel', a.guides, 18);
  check('start-flow selects card', a.selected, 1);
  check('panel hidden while away', a.hiddenWhileAway, true);
  check('iframe same node after switch', a.iframeSameNode, true);
  check('iframe src intact', a.iframeSrcIntact, true);
  check('observatory JS errors', obsErr.length, 0);
  if (obsErr.length) console.log('   errors:', obsErr.slice(0, 4));

  console.log('===== [W] Mission Workspace (identity + checklist + race guard) =====');
  const w = await obs.evaluate(async () => {
    const out = {};
    const panel = document.getElementById('hr-panel-sandbox');
    // No duplicate ids after the grade-block move.
    out.gradeBlocks = document.querySelectorAll('[id="obs-mission-grade"]').length;
    const ws = document.getElementById('obs-mission-workspace');
    out.wsInWorkspaceParent = !!(ws && ws.querySelector('#obs-mission-grade'));
    // A mission was started in section [C]; the workspace must be live.
    out.wsVisible = !!(ws && ws.style.display !== 'none');
    out.wsTitle = (document.getElementById('obs-mission-ws-title') || {}).textContent || '';
    out.wsStar = (document.getElementById('obs-mission-ws-star') || {}).textContent || '';
    // Pending checklist painted from catalog (no grading call).
    out.checklist = ws ? ws.querySelectorAll('.obs-grade-list li.todo').length : -1;
    // TEXT assertions (Chris gate): cat-lost-notes has $MISSION_* tokens in 2
    // briefs — the raw empty-env placeholder must NEVER reach a student, and
    // the teaching rewrite must actually appear in its place.
    out.placeholderLeak = ws ? /\[assigned at launch\]/.test(ws.textContent) : true;
    out.rewriteShown = ws ? /shown in the BRIEFING file inside your box/.test(ws.textContent) : false;
    // Workspace sits ABOVE the terminal mount in the DOM.
    const mount = document.getElementById('obs-sandbox-mount');
    out.aboveTerminal = !!(ws && mount && (ws.compareDocumentPosition(mount) & Node.DOCUMENT_POSITION_FOLLOWING));
    // localStorage record written by startMission.
    let rec = null; try { rec = JSON.parse(localStorage.getItem('hexworth_obs_active_mission') || 'null'); } catch (e) {}
    out.recordId = rec && rec.id;
    out.recordHasTs = !!(rec && rec.at);
    const startedId = rec && rec.id;
    // FIELD GUIDE UN-CRUNCH (operator 2026-07-09):
    // (a) the manual renders inside the workspace, open on FIRST-ever start
    const wsGuide = document.getElementById('obs-mission-ws-guide');
    const wsDet = wsGuide && wsGuide.querySelector('details.mission-fieldguide');
    out.guideInWorkspace = !!wsDet;
    out.guideOpenFirstTime = !!(wsDet && wsDet.open);
    out.seenFlagSet = (() => { try { return localStorage.getItem('obs_fieldguide_seen') === '1'; } catch (e) { return false; } })();
    // (b) exactly ONE copy open on the page: the started card's own guide collapsed
    const startedCard = document.querySelector('.obs-mission-card[data-mission="' + startedId + '"]');
    const cardDet = startedCard && startedCard.querySelector('details.mission-fieldguide');
    out.cardGuideCollapsed = !!(cardDet && !cardDet.open);
    // (c) 240px scroll cap SURVIVES the workspace overrides (bounds open guide height)
    const wsList = wsDet && wsDet.querySelector('.mission-fieldguide__list');
    out.guideCapKept = wsList ? getComputedStyle(wsList).maxHeight : 'missing';
    // (d) two-column layout: chip column fixed at 230px in workspace context
    const wsCode = wsList && wsList.querySelector('code');
    out.chipCol = wsCode ? getComputedStyle(wsCode).flexBasis : 'missing';
    // (e) checklist measure SCOPED: inside workspace li max-width set; a synthetic
    //     .obs-grade-list li OUTSIDE the workspace must stay unconstrained
    const wsLi = document.querySelector('#obs-mission-workspace .obs-grade-list li');
    out.wsLiMeasured = wsLi ? getComputedStyle(wsLi).maxWidth !== 'none' : false;
    const stray = document.createElement('ul'); stray.className = 'obs-grade-list';
    const strayLi = document.createElement('li'); strayLi.textContent = 'x'; stray.appendChild(strayLi);
    const gradeResult = document.getElementById('obs-grade-result');   // free-play panel = OUTSIDE the workspace
    if (gradeResult) {
      gradeResult.appendChild(stray);
      out.outsideLiUnstyled = getComputedStyle(strayLi).maxWidth === 'none';
      stray.remove();
    } else {
      out.outsideLiUnstyled = 'missing-container';                     // fail loudly, never throw
    }
    // (f) WIDE CARD: opening a different card's guide stretches it to the full flex row
    const otherCard = Array.from(document.querySelectorAll('.obs-mission-card'))
      .find(c => c.dataset.mission && c.dataset.mission !== startedId && c.querySelector('details.mission-fieldguide'));
    if (otherCard) {
      const od = otherCard.querySelector('details.mission-fieldguide');
      od.open = true;                       // property change fires 'toggle'
      await new Promise(r => setTimeout(r, 50));
      const cs = getComputedStyle(otherCard);
      out.wideClass = otherCard.classList.contains('obs-mission-card--wide');
      out.wideMaxWidth = cs.maxWidth;       // must be 'none' (base caps at 420px)
      out.wideBasis = cs.flexBasis;         // must be '100%'
      // card guides keep the tighter 240px cap (only the workspace got 300px)
      out.cardCap = getComputedStyle(od.querySelector('.mission-fieldguide__list')).maxHeight;
      // overflow hint appears at open time, OUTSIDE the scroll box (sibling)
      const cardHint = od.querySelector('.obs-scroll-hint');
      const sib = od.querySelector('.mission-fieldguide__list').nextElementSibling;
      out.cardHintSibling = !!(cardHint && sib === cardHint);
      od.open = false;
      await new Promise(r => setTimeout(r, 50));
      out.wideClassRemoved = !otherCard.classList.contains('obs-mission-card--wide');
    }
    // RACE GUARD: disable the shared launch button, click a DIFFERENT card's Start.
    const launchBtn = document.querySelector('#obs-sandbox-mount .sandbox-launcher button');
    if (launchBtn) launchBtn.disabled = true;
    const cards = panel.querySelectorAll('.obs-mission-card');
    const other = Array.from(cards).find(c => c.dataset.mission && c.dataset.mission !== startedId);
    if (other) other.querySelector('.obs-mission-card__start').click();
    await new Promise(r => setTimeout(r, 100));
    out.selectionHeld = window.__obsSelectedMission === startedId;
    out.busyNote = /launch is already in progress/.test((document.getElementById('obs-mission-ws-note') || {}).textContent || '');
    if (launchBtn) launchBtn.disabled = false;
    return out;
  });
  check('single grade block (ids unique)', w.gradeBlocks, 1);
  check('grade block lives in workspace', w.wsInWorkspaceParent, true);
  check('workspace visible after start', w.wsVisible, true);
  check('workspace names the mission', /Mission 01/.test(w.wsTitle), true);
  check('workspace shows command star', w.wsStar.length > 0, true);
  check('pending checklist painted', w.checklist > 0, true);
  check('NO raw [assigned at launch] leak', w.placeholderLeak, false);
  check('placeholder rewritten to teaching copy', w.rewriteShown, true);
  check('workspace above terminal', w.aboveTerminal, true);
  check('localStorage record id', w.recordId, 'cat-lost-notes');
  check('localStorage record timestamped', w.recordHasTs, true);
  check('race guard holds selection', w.selectionHeld, true);
  check('race guard explains itself', w.busyNote, true);
  check('guide renders in workspace', w.guideInWorkspace, true);
  check('guide OPEN on first-ever start', w.guideOpenFirstTime, true);
  check('seen-flag persisted', w.seenFlagSet, true);
  check('card copy collapsed (no double-open manual)', w.cardGuideCollapsed, true);
  check('workspace guide cap 300px', w.guideCapKept, '300px');
  check('chip column fixed 230px', w.chipCol, '230px');
  check('workspace checklist has measure', w.wsLiMeasured, true);
  check('outside .obs-grade-list NOT restyled (scoped)', w.outsideLiUnstyled, true);
  check('open guide widens card (class)', w.wideClass, true);
  check('wide card max-width lifted', w.wideMaxWidth, 'none');
  check('wide card takes full row', w.wideBasis, '100%');
  check('card guide keeps 240px cap', w.cardCap, '240px');
  check('card overflow hint is list sibling', w.cardHintSibling, true);
  check('closing guide un-widens card', w.wideClassRemoved, true);
  await obs.close();

  console.log('===== [W4] FOLD TEST @1280x800: first-ever start must not bury the terminal =====');
  // Chris gate 2026-07-09: previous build put the terminal 413px below the fold
  // for exactly this cohort (first-time student, guide open by default).
  // file:// pages share one localStorage across the whole browser profile, and
  // section [W] above already set obs_fieldguide_seen — clear it so this page
  // really is a FIRST-EVER student (the cohort Chris measured the burial on).
  const { page: fold, errors: foldErr } = await boot(browser, ROOT + '/_app/houses/observatory/index.html',
    `try { localStorage.removeItem('obs_fieldguide_seen'); localStorage.removeItem('hexworth_obs_active_mission'); } catch (e) {}`,
    { width: 1280, height: 800 });
  const f2 = await fold.evaluate(async () => {
    document.getElementById('hr-tab-sandbox').click();
    await new Promise(r => setTimeout(r, 700));      // renderMissionsPanel async
    const card = document.querySelector('.obs-mission-card[data-mission="cat-lost-notes"]');
    card.querySelector('.obs-mission-card__start').click();
    await new Promise(r => setTimeout(r, 300));      // paintWorkspace + smooth-scroll start
    const ws = document.getElementById('obs-mission-workspace');
    const mount = document.getElementById('obs-sandbox-mount');
    const det = document.querySelector('#obs-mission-ws-guide details.mission-fieldguide');
    const list = document.querySelector('#obs-mission-workspace .obs-grade-list');
    const cols = getComputedStyle(document.querySelector('.obs-mission-workspace__cols')).gridTemplateColumns;
    // workspace height = distance the student must consume before the terminal;
    // offset-based (layout truth), independent of the in-flight smooth scroll.
    const wsH = ws.getBoundingClientRect().height;
    const guideHint = det && det.querySelector('.mission-fieldguide__list').nextElementSibling;
    const taskHint = list && list.nextElementSibling;
    const li = list && list.querySelector('li');
    return {
      guideOpen: !!(det && det.open),
      twoCols: cols.split(' ').length,                 // 2 tracks at >=1100px
      wsHeight: Math.round(wsH),
      terminalReachable: wsH < 560,                    // mount top lands inside an 800px viewport with chrome
      checklistCap: list ? getComputedStyle(list).maxHeight : 'missing',
      guideHintShown: !!(guideHint && guideHint.classList.contains('obs-scroll-hint')),
      taskHintShown: !!(taskHint && taskHint.classList.contains('obs-scroll-hint')),
      numbered: li ? getComputedStyle(li, '::before').content.indexOf('counter(task') !== -1 : false,
      noXOverflow: document.documentElement.scrollWidth <= 1280,
    };
  });
  check('guide open (first-time cohort)', f2.guideOpen, true);
  check('two columns active @1280', f2.twoCols, 2);
  console.log(`  info workspace height: ${f2.wsHeight}px (budget < 560)`);
  check('terminal reachable in first viewport', f2.terminalReachable, true);
  check('checklist 300px cap', f2.checklistCap, '300px');
  check('guide overflow hint shown (17 rows clip)', f2.guideHintShown, true);
  check('task overflow hint shown (14 items clip)', f2.taskHintShown, true);
  check('tasks CSS-numbered', f2.numbered, true);
  check('no horizontal overflow @1280', f2.noXOverflow, true);
  check('fold-test JS errors', foldErr.length, 0);
  await fold.close();

  console.log('===== [W3] veteran: guide collapsed by default on later starts =====');
  const { page: vet, errors: vetErr } = await boot(browser, ROOT + '/_app/houses/observatory/index.html',
    `try { localStorage.setItem('obs_fieldguide_seen', '1'); } catch (e) {}`);
  // Page booted with obs_fieldguide_seen=1 preseeded (a returning student).
  // Same start-flow as [A/B/C]: activate the Sandbox tab, start Mission 01,
  // then check the workspace guide is PRESENT but stays COLLAPSED — the
  // open-by-default treatment is for the first-ever start only.
  const v = await vet.evaluate(async () => {
    document.querySelector('.obs-sandbox-teaser__btn').click();
    await new Promise(r => setTimeout(r, 700));   // renderMissionsPanel is async
    const card = document.querySelector('.obs-mission-card[data-mission="cat-lost-notes"]');
    card.querySelector('.obs-mission-card__start').click();
    await new Promise(r => setTimeout(r, 200));   // paintWorkspace + guide attach settle
    const det = document.querySelector('#obs-mission-ws-guide details.mission-fieldguide');
    return { present: !!det, open: !!(det && det.open) };
  });
  check('veteran still gets the guide', v.present, true);
  check('veteran guide collapsed by default', v.open, false);
  check('veteran JS errors', vetErr.length, 0);
  await vet.close();

  console.log('===== [W2] refresh-restore (fresh + stale record) =====');
  const { page: res1, errors: res1Err } = await boot(browser, ROOT + '/_app/houses/observatory/index.html',
    `try { localStorage.setItem('hexworth_obs_active_mission', JSON.stringify({ id: 'cat-lost-notes', at: ${Date.now()} })); } catch (e) {}`);
  const r1 = await res1.evaluate(() => {
    const ws = document.getElementById('obs-mission-workspace');
    return {
      restored: !!(ws && ws.style.display !== 'none'),
      selected: window.__obsSelectedMission,
      cardSelected: !!document.querySelector('.obs-mission-card[data-mission="cat-lost-notes"].selected'),
      note: (document.getElementById('obs-mission-ws-note') || {}).textContent || '',
    };
  });
  check('workspace restored on refresh', r1.restored, true);
  check('selection restored', r1.selected, 'cat-lost-notes');
  check('card re-selected', r1.cardSelected, true);
  check('reconnect note shown', /Launch Sandbox/.test(r1.note), true);
  check('restore JS errors', res1Err.length, 0);
  await res1.close();
  const { page: res2, errors: res2Err } = await boot(browser, ROOT + '/_app/houses/observatory/index.html',
    `try { localStorage.setItem('hexworth_obs_active_mission', JSON.stringify({ id: 'cat-lost-notes', at: ${Date.now() - 25 * 60 * 60 * 1000} })); } catch (e) {}`);
  const r2 = await res2.evaluate(() => {
    const ws = document.getElementById('obs-mission-workspace');
    return { shown: !!(ws && ws.style.display !== 'none'),
             cleared: localStorage.getItem('hexworth_obs_active_mission') === null };
  });
  check('stale record does NOT restore', r2.shown, false);
  check('stale record cleared', r2.cleared, true);
  check('stale-restore JS errors', res2Err.length, 0);
  await res2.close();

  console.log('===== [E] stale localStorage tab id must NOT blank the page =====');
  const { page: stale, errors: staleErr } = await boot(browser, ROOT + '/_app/houses/observatory/index.html',
    `try { localStorage.setItem('hexworth_house_tab_observatory', 'tab-that-was-renamed'); } catch (e) {}`);
  const e1 = await stale.evaluate(() => {
    const active = document.querySelector('.hr-panel.active');
    return { activePanel: active ? active.dataset.tab : 'NONE (blank page!)',
             visibleTabs: document.querySelectorAll('.hr-tab.active').length };
  });
  check('fallback panel active', e1.activePanel, 'paths');
  check('one tab highlighted', e1.visibleTabs, 1);
  check('stale-test JS errors', staleErr.length, 0);
  await stale.close();

  console.log('===== [F] blast radius: shield house still has exactly 5 tabs =====');
  const { page: shield, errors: shieldErr } = await boot(browser, ROOT + '/_app/houses/shield/index.html');
  const f1 = await shield.evaluate(() => ({
    tabs: document.querySelectorAll('.hr-tab[role="tab"]').length,
    sandboxTab: !!document.getElementById('hr-tab-sandbox'),
  }));
  check('shield tabs', f1.tabs, 5);
  check('shield has NO sandbox tab', f1.sandboxTab, false);
  check('shield JS errors', shieldErr.length, 0);
  if (shieldErr.length) console.log('   errors:', shieldErr.slice(0, 4));
  await shield.close();

  console.log('===== [L] launcher extras: Field Manual + Grade Mission (full fake-API flow) =====');
  const { page: lch, errors: lchErr } = await boot(browser, ROOT + '/_app/houses/observatory/index.html');
  const l = await lch.evaluate(async () => {
    const out = {};
    document.getElementById('hr-tab-sandbox').click();
    await new Promise(r => setTimeout(r, 700));
    const row = document.querySelector('#obs-sandbox-mount .sandbox-launcher__actions');
    const extras = row.querySelectorAll('.sandbox-launcher__btn--extra');
    out.extraCount = extras.length;
    const fmBtn = Array.from(extras).find(b => b.textContent === 'Field Manual');
    const grBtn = Array.from(extras).find(b => b.textContent === 'Grade Mission');
    out.fmVisibleIdle = !!(fmBtn && fmBtn.style.display !== 'none');   // visibleWhen 'always'
    out.grHiddenIdle = !!(grBtn && grBtn.style.display === 'none');    // visibleWhen 'running'
    // panel exists, hidden, sits BETWEEN actions row and iframe wrap
    const panel = document.querySelector('#obs-sandbox-mount .sandbox-launcher__extra-panel');
    const wrap = document.querySelector('#obs-sandbox-mount .sandbox-launcher__iframe-wrap');
    out.panelHidden = !!(panel && panel.style.display === 'none');
    out.panelAdjacent = !!(panel && wrap && panel.nextElementSibling === wrap);
    // FREE-PLAY first: launch WITHOUT a mission (fake API succeeds) -> Grade
    // click must show the standalone framed message (workspace is hidden).
    document.querySelector('#obs-sandbox-mount .sandbox-launcher__btn--launch').click();
    await new Promise(r => setTimeout(r, 400));
    out.grVisibleRunning = grBtn.style.display !== 'none';
    grBtn.click();
    await new Promise(r => setTimeout(r, 300));
    out.freePlayMsg = /free-play/.test(panel.textContent) && /Start Mission/.test(panel.textContent);
    // Field Manual click: capture window.open target + url
    let opened = null;
    window.open = function (url, name) { opened = { url, name }; return null; };
    const card = document.querySelector('.obs-mission-card[data-mission="cat-lost-notes"]');
    card.querySelector('.obs-mission-card__start').click();   // select + (re)launch with mission
    await new Promise(r => setTimeout(r, 400));
    fmBtn.click();
    out.fmUrl = opened && opened.url;
    out.fmTarget = opened && opened.name;
    // GRADE with mission active: ONE fetch -> compact panel AND workspace both painted
    grBtn.click();
    await new Promise(r => setTimeout(r, 400));
    out.compactScore = /2 \/ 5 tasks complete/.test(panel.textContent);
    // MARATHON L4 (operator: 3 stacked trackers): compact panel is now ONE
    // status line — it must NOT duplicate the failure list, and must point
    // at the single canonical tracker (the workspace) instead.
    out.compactFail = /notes\.txt does not exist yet/.test(panel.textContent);           // expect FALSE now
    out.compactHidden = /1 hidden requirement not met/.test(panel.textContent);
    out.compactPointsUp = /Mission panel above/.test(panel.textContent);
    out.compactNoPassedRows = !/Read BRIEFING\.txt and create ack\.txt/.test(panel.textContent);
    const ws = document.getElementById('obs-mission-grade-result');
    out.workspaceAlsoPainted = /2 \/ 5 tasks complete/.test(ws.textContent);   // single fetch, two renders
    // L4: free-play grade block hidden while a mission is active (also closes
    // the client path of the #94 mis-grading trap)
    out.freePlayHiddenOnMission = (document.getElementById('obs-sandbox-grade') || {}).style.display === 'none';
    // L1: durable progress recorded (in_progress + lastGrade from the grade above)
    let prog = null; try { prog = JSON.parse(localStorage.getItem('hexworth_obs_sandbox_progress') || 'null'); } catch (e) {}
    const rec = prog && prog.missions && prog.missions['cat-lost-notes'];
    out.progressStatus = rec && rec.status;
    out.progressGrade = !!(rec && rec.lastGrade && rec.lastGrade.passed === 2 && rec.lastGrade.total === 5);
    // L3: STOP mission -> free-play (workspace hides, selection clears, free-play
    // tooling returns, card chip shows In progress + Resume)
    document.getElementById('obs-mission-stop').click();
    await new Promise(r => setTimeout(r, 100));
    out.stopHidesWorkspace = document.getElementById('obs-mission-workspace').style.display === 'none';
    out.stopClearsSelection = window.__obsSelectedMission === null;
    out.stopRestoresFreePlay = (document.getElementById('obs-sandbox-grade') || {}).style.display !== 'none';
    out.stopClearsRecord = localStorage.getItem('hexworth_obs_active_mission') === null;
    const startedCard2 = document.querySelector('.obs-mission-card[data-mission="cat-lost-notes"]');
    out.chipInProgress = (startedCard2.querySelector('.obs-mission-card__state') || {}).textContent === 'In progress';
    out.btnResume = startedCard2.querySelector('.obs-mission-card__start').textContent === 'Resume Mission';
    return out;
  });
  check('two extra buttons rendered', l.extraCount, 2);
  check('Field Manual visible at idle', l.fmVisibleIdle, true);
  check('Grade Mission hidden at idle', l.grHiddenIdle, true);
  check('extra panel hidden until used', l.panelHidden, true);
  check('panel adjacent to terminal iframe', l.panelAdjacent, true);
  check('Grade Mission appears when running', l.grVisibleRunning, true);
  check('free-play grade: standalone framed message', l.freePlayMsg, true);
  check('Field Manual url carries mission', l.fmUrl, 'field-manual.html?mission=cat-lost-notes');
  check('Field Manual reuses ONE named tab', l.fmTarget, 'obs-field-manual');
  check('compact panel: score line', l.compactScore, true);
  check('compact panel: NO duplicated failure list (L4)', l.compactFail, false);
  check('compact panel: hiddenUnmet surfaced', l.compactHidden, true);
  check('compact panel: points to canonical tracker', l.compactPointsUp, true);
  check('compact panel: passed tasks excluded', l.compactNoPassedRows, true);
  check('workspace painted from SAME fetch', l.workspaceAlsoPainted, true);
  check('free-play block hidden during mission (L4/#94)', l.freePlayHiddenOnMission, true);
  check('progress doc: in_progress (L1)', l.progressStatus, 'in_progress');
  check('progress doc: lastGrade recorded (L1)', l.progressGrade, true);
  check('Stop hides workspace (L3)', l.stopHidesWorkspace, true);
  check('Stop clears selection (L3)', l.stopClearsSelection, true);
  check('Stop restores free-play tooling (L3)', l.stopRestoresFreePlay, true);
  check('Stop clears restore record (L3)', l.stopClearsRecord, true);
  check('card chip In progress after stop (L3)', l.chipInProgress, true);
  check('card button becomes Resume (L3)', l.btnResume, true);
  check('launcher-extras JS errors', lchErr.length, 0);
  if (lchErr.length) console.log('   errors:', lchErr.slice(0, 4));
  await lch.close();

  console.log('===== [W6] tutorial resume (L2): saved step survives everything =====');
  // Page boots with a durable progress doc at tutorial step 2 (localStorage
  // cleared of the legacy done-flag): the start card must OFFER RESUME at
  // step 3 of 5 instead of silently restarting — the operator's "always
  // halfway done" fix.
  const { page: tut, errors: tutErr } = await boot(browser, ROOT + '/_app/houses/observatory/index.html',
    `try { localStorage.removeItem('obs_sandbox_tutorial_done'); localStorage.removeItem('hexworth_obs_tutorial_done');
           localStorage.setItem('hexworth_obs_sandbox_progress', JSON.stringify({ v: 1, updatedAt: ${Date.now()}, tutorial: { step: 2, done: false }, missions: {} })); } catch (e) {}`);
  const t2 = await tut.evaluate(async () => {
    document.getElementById('hr-tab-sandbox').click();
    await new Promise(r => setTimeout(r, 700));
    const btn = document.getElementById('obs-tut-start');
    return { label: btn ? btn.textContent : 'NO BUTTON',
             why: (document.querySelector('.obs-tutorial__why') || {}).textContent || '' };
  });
  check('resume offered at saved step', t2.label, 'Resume tutorial (step 3 of 5)');
  check('resume copy names the step', /saved at step 3 of 5/.test(t2.why), true);
  check('tutorial-resume JS errors', tutErr.length, 0);
  await tut.close();

  console.log('===== [M] zero-options caller unchanged: do-16 git lab =====');
  const { page: m16, errors: m16Err } = await boot(browser, ROOT + '/_app/houses/code/devops/sections/git/do-16-git-lab.html');
  const m = await m16.evaluate(() => {
    const w = document.querySelector('.sandbox-launcher');
    return {
      rendered: !!w,
      btns: w ? w.querySelectorAll('.sandbox-launcher__btn').length : -1,      // launch/open/destroy/collapse ONLY
      extras: w ? w.querySelectorAll('.sandbox-launcher__btn--extra').length : -1,
      panels: w ? w.querySelectorAll('.sandbox-launcher__extra-panel').length : -1,
    };
  });
  check('do-16 launcher renders', m.rendered, true);
  check('do-16 exactly 4 stock buttons', m.btns, 4);
  check('do-16 zero extra buttons', m.extras, 0);
  check('do-16 zero extra panels', m.panels, 0);
  check('do-16 JS errors', m16Err.length, 0);
  if (m16Err.length) console.log('   errors:', m16Err.slice(0, 4));
  await m16.close();

  console.log('===== [FM] field-manual.html: full-page manual =====');
  const { page: fman, errors: fmanErr } = await boot(browser, ROOT + '/_app/houses/observatory/field-manual.html?mission=cat-lost-notes');
  await new Promise(r => setTimeout(r, 600));
  const fm = await fman.evaluate(() => ({
    sections: document.querySelectorAll('.fm-mission').length,
    commonRows: document.querySelectorAll('#fm-common-rows li').length,
    tocLinks: document.querySelectorAll('#fm-toc a').length,
    firstIsM01: /Mission 01/.test((document.querySelector('.fm-mission h2') || {}).textContent || ''),
    deepLinkHighlight: !!document.querySelector('#fm-cat-lost-notes.highlight'),
    tocActive: !!document.querySelector('#fm-toc a.active'),
    noCaps: getComputedStyle(document.querySelector('.fm-mission .fm-rows')).maxHeight === 'none',  // room to breathe: NO scroll caps
  }));
  check('18 mission sections', fm.sections, 18);
  check('common survival kit rows', fm.commonRows, 5);
  check('TOC links all missions', fm.tocLinks, 18);
  check('curriculum order (M01 first)', fm.firstIsM01, true);
  check('?mission deep link highlights section', fm.deepLinkHighlight, true);
  check('TOC marks active mission', fm.tocActive, true);
  check('manual lists have NO height caps', fm.noCaps, true);
  check('field-manual JS errors', fmanErr.length, 0);
  if (fmanErr.length) console.log('   errors:', fmanErr.slice(0, 4));
  await fman.close();

  console.log(`\nRESULT: ${fails === 0 ? 'ALL PASS' : fails + ' FAIL(S)'} (${total} checks)`);
  await browser.close();
  process.exit(fails === 0 ? 0 : 1);
})();
