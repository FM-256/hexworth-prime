#!/usr/bin/env node
/**
 * dont-brick-the-pc-check.js — plays Don't Brick the PC in a real browser and checks every ending
 * and every achievement route.
 *
 * @catalog what    Serves the real game page to headless Chrome and plays it: the textbook order at
 * @catalog what    HUMAN pace (By The Book must be earnable after containment), DONE without
 * @catalog what    documenting, the 9-achievement route, Safe Mode, reimage, and (with --full) Frozen.
 * @catalog run     node _tools/arcade-fixes/dont-brick-the-pc-check.js [--full]
 * @catalog status  TOOL
 *
 * WHY HUMAN PACE. The game used to end 1.5 seconds after the network was isolated and the process
 * killed, so By The Book ("Isolate, identify, kill, scan, document") could not be earned in its own
 * order. A script typing every 120 ms landed scan and document inside that 1.5 seconds and EARNED it,
 * which is how a broken achievement looked fine to automation. Every check below that depends on
 * timing waits past that window on purpose. Walkthrough:
 * ~/hexworth-shared/Solutions/Arcade/DONT-BRICK-THE-PC-SOLUTION.md
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const PAGE = '/houses/forge/games/forge-dont-brick-the-pc.html';
const FULL = process.argv.includes('--full');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};

/* The page, with AccessGuard stubbed so a signed-out visitor is not redirected away. Every other
   script is the real one. */
const srv = http.createServer((q, r) => {
    const clean = q.url.split('?')[0];
    if (/AccessGuard\.js$/.test(clean)) {
        r.writeHead(200, { 'Content-Type': 'application/javascript' });
        return r.end('window.AccessGuard={require:function(){}};');
    }
    /* DONT_BRICK_PAGE serves a copy of the page instead, so a mutation (or the pre-fix version)
       can be checked without touching the real file while someone else may be reading it. */
    if (process.env.DONT_BRICK_PAGE && clean === PAGE) {
        r.writeHead(200, { 'Content-Type': 'text/html' });
        return r.end(fs.readFileSync(process.env.DONT_BRICK_PAGE));
    }
    const f = path.join(APP, clean);
    if (f.indexOf(APP) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': /\.html$/.test(f) ? 'text/html' : /\.js$/.test(f) ? 'application/javascript' : 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});

(async () => {
    await new Promise((r) => srv.listen(0, r));
    const url = 'http://127.0.0.1:' + srv.address().port + PAGE;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const pg = await browser.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(e.message));

    /* A fresh game with no saved achievements, started from the title screen. */
    const fresh = async () => {
        await pg.goto(url, { waitUntil: 'networkidle0' });
        await pg.evaluate(() => {
            localStorage.removeItem('hexworth_dontbrick_achievements');
            localStorage.removeItem('game_brick_xp_awarded');
            localStorage.removeItem('hexworth_achievements');   // the platform badge store
        });
        await pg.goto(url, { waitUntil: 'networkidle0' });
        await pg.waitForSelector('#input');
        await pg.focus('#input'); await pg.keyboard.press('Enter');   // a bare Enter, as the title says
        await sleep(200);
    };
    /* type: enter one command and wait `after` ms. ach: the achievement ids the game has saved.
       out: the terminal's visible text. ended: whether the end-of-game summary is showing. */
    const type = async (t, after) => { await pg.type('#input', t); await pg.keyboard.press('Enter'); await sleep(after || 150); };
    const ach = () => pg.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('hexworth_dontbrick_achievements') || '{}')).sort());
    const out = () => pg.$eval('#output', (e) => e.innerText);
    const ended = async () => /Achievements: \d+\/12/.test(await out());

    try {
        console.log('\n0. the title screen starts on a bare Enter, as it says');
        await fresh();
        chk('a bare Enter at the title starts the game', /FRIDAY, 4:45 PM/.test(await out()));

        console.log('\n1. the textbook order, at human pace, earns By The Book');
        await fresh();
        await sleep(3200);                                 // a real, non-zero contained time
        await type('disconnect network', 300);
        await type('taskkill /pid 6648', 2000);           // past the old 1.5 s window
        chk('containment no longer ends the game: the wrap-up is open', !(await ended()) && /THREAT CONTAINED\. The clock has stopped\./.test(await out()));
        chk('win credit is given AT containment, so closing the tab here still earns the XP',
            await pg.evaluate(() => localStorage.getItem('game_brick_xp_awarded') === 'true'));
        /* And the two platform badges awardWinCredit moved here with it: AchievementManager's
           game_brick and AchievementSystem's game_brick_win, both kept in hexworth_achievements.
           Asserting only the XP flag let either badge go missing unnoticed (Nancy, mutation C). */
        const badges = await pg.evaluate(() => localStorage.getItem('hexworth_achievements') || '');
        chk('and both platform badges, game_brick and game_brick_win, before DOCUMENT',
            /"game_brick"/.test(badges) && /"game_brick_win"/.test(badges), badges.slice(0, 200));
        await type('quit', 300);
        chk('quit in the wrap-up points to DONE instead of blaming live malware',
            /Type DOCUMENT to close the ticket, or DONE/.test(await out()) && !(await ended()));
        const t1 = await pg.$eval('#timer', (e) => e.textContent);
        await sleep(2200);
        chk('and the clock has stopped', (await pg.$eval('#timer', (e) => e.textContent)) === t1, t1);
        await type('scan', 1200);
        chk('a scan after the kill quarantines the files', /4 threats removed\. System clean\./.test(await out()));
        chk('the game is still open after the scan', !(await ended()));
        await type('document', 2000);
        const a1 = await ach();
        chk('document closes the ticket: INCIDENT CLOSED, textbook ending', (await ended())
            && /INCIDENT CLOSED/.test(await out()) && /Textbook incident response/.test(await out()));
        const tm = (await out()).match(/Time: (\d+)m (\d+)s/);
        chk('the end screen shows the real contained time, not zero', !!tm && Number(tm[1]) * 60 + Number(tm[2]) >= 3,
            tm ? tm[0] : 'no time line');
        chk('with By The Book and Scanner Savant earned in the textbook order',
            a1.indexOf('by_the_book') >= 0 && a1.indexOf('scanner_savant') >= 0, a1.join(', '));
        chk('and the first win awarded the XP once', await pg.evaluate(() => localStorage.getItem('game_brick_xp_awarded') === 'true'));

        console.log('\n2. DONE closes the incident without documenting');
        await fresh();
        await type('done', 300);
        chk('DONE before containment is refused', /still active\. Contain it first/.test(await out()) && !(await ended()));
        await type('disconnect network', 300);
        await type('taskkill /pid 6648', 2000);
        await type('done', 2000);
        const a2 = await ach();
        chk('DONE ends it CONTAINED, without By The Book', (await ended()) && /THREAT CONTAINED/.test(await out()) && a2.indexOf('by_the_book') < 0, a2.join(', '));

        console.log('\n3. the nine-achievement route still works, ending at the kill');
        await fresh();
        for (const c of ['restart', 'disconnect network', 'ls', 'blame user', 'coffee', 'scan', 'document']) { await type(c, 150); }
        await type('taskkill /pid 6648', 2000);
        const a3 = await ach();
        const want3 = ['blame_user', 'by_the_book', 'coffee_break', 'first_responder', 'have_you_tried', 'process_hunter', 'scanner_savant', 'speed_run', 'wrong_os'];
        chk('everything already done at containment: it ends at once, no wrap-up prompt',
            (await ended()) && !/The clock has stopped/.test(await out()));
        chk('with all nine', JSON.stringify(a3) === JSON.stringify(want3), a3.join(', '));

        console.log('\n4. Safe Mode');
        await fresh();
        await type('safe mode', 300);
        await type('scan', 2000);
        chk('safe mode plus scan contains it and opens the wrap-up', !(await ended()) && /The clock has stopped/.test(await out()));
        await type('done', 2000);
        chk('and earns Safe Mode Hero', (await ach()).indexOf('safe_mode_hero') >= 0 && (await ended()));

        console.log('\n4b. By The Book needs isolate THEN kill, not a shortcut');
        await fresh();
        for (const c of ['safe mode', 'scan']) { await type(c, 300); }
        await sleep(1800);
        await type('disconnect network', 300);
        await type('document', 2000);
        const sb = await ach();
        chk('safe mode, scan, then disconnect and document in the wrap-up does NOT earn By The Book',
            (await ended()) && sb.indexOf('by_the_book') < 0, sb.join(', '));
        chk('nor Speed Run: the disconnect came after containment, with the clock stopped', sb.indexOf('speed_run') < 0, sb.join(', '));
        await fresh();
        await type('taskkill /pid 6648', 300);
        await type('disconnect network', 2000);
        await type('scan', 300);
        await type('document', 2000);
        const kb = await ach();
        chk('kill BEFORE isolating, then scan and document, does NOT earn By The Book',
            (await ended()) && kb.indexOf('by_the_book') < 0, kb.join(', '));

        console.log('\n5. reimage');
        await fresh();
        await type('format', 800);
        chk('format is the nuclear ending, Nuke From Orbit', /NUCLEAR OPTION/.test(await out()) && (await ach()).indexOf('nuke_from_orbit') >= 0);

        if (FULL) {
            console.log('\n6. Frozen (3 minutes 30 seconds)');
            await fresh();
            await sleep(213000);
            chk('doing nothing until time runs out is GAME OVER and Frozen',
                /GAME OVER/.test(await out()) && (await ach()).indexOf('frozen') >= 0);
        } else {
            console.log('\n6. Frozen skipped (3.5 minutes): run with --full');
        }

        chk('no uncaught page error', errors.length === 0, errors.join(' | '));
    } finally {
        await browser.close();
        srv.close();
    }
    console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('harness fault:', e && e.stack ? e.stack : e); process.exit(2); });
