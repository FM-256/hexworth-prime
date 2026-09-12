#!/usr/bin/env node
/**
 * box-reset-button.test.js
 *
 * @catalog what   Proves the taskbar Reset button still performs its PRODUCT function --
 *                 clearing the box so a student can switch to a different scenario -- and
 *                 that the typed `reset` command no longer does so silently.
 * @catalog run    node _tools/hexos/box-reset-button.test.js [--copy dispatch|arena] [--base URL]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * de5b804b0 changed Terminal.js's `reset` COMMAND, which used to call engine.reset()
 * directly -- wipe, save, reload, no confirmation. The operator then asked the right
 * question: "we have a reset button in each box, those are needed to ensure we can switch
 * scenarios. is that the reset you removed?"
 *
 * Reading the code says no: the button is BoxEngine._confirmReset, wired at
 * BoxEngine.js:609, last touched by 2290ff8ab, and none of the four commits in that change
 * touched BoxEngine.js at all. But "I read the diff and it looks fine" is exactly the
 * claim that has been wrong here before. Scenario switching is the whole reason a student
 * resets an NT1 box, and nothing in the tree exercised it. So this drives the real button
 * on the real page and asserts the student-visible outcome:
 *
 *   1. pick ticket HD-7201            -> scenario 1 is locked in
 *   2. type `reset` in the terminal   -> state MUST be unchanged  (the fix)
 *   3. click the Reset button         -> a confirmation dialog MUST appear
 *   4. click Cancel                   -> state MUST be unchanged  (the confirm is real)
 *   5. click Reset, then confirm      -> scenario MUST be cleared
 *   6. pick a DIFFERENT ticket        -> scenario MUST now be 3   (switching works)
 *
 * Step 6 is the one that matters. Steps 1-5 can all pass while the product function is
 * still broken, if reset clears state but the ticket picker never comes back.
 *
 * THIS HARNESS DOES NOT SIGN IN and never requests a flag, so unlike
 * nt1-completable-as-user.test.js it does NOT mint an anonymous account. It deliberately
 * avoids pressing a trusted key, which is what arms BoxEngine's engagement gate.
 *
 * Exit 0 = every assertion passed. Exit 1 = at least one failed.
 */
'use strict';

const puppeteer = require('puppeteer');

const argv = process.argv.slice(2);
const copyIdx = argv.indexOf('--copy');
const COPY = copyIdx > -1 ? argv[copyIdx + 1] : 'dispatch';
const baseIdx = argv.indexOf('--base');
const BASE = baseIdx > -1 ? argv[baseIdx + 1] : 'https://hexworth.com';
const URL = `${BASE}/${COPY}/boxes/nt1-network-troubleshoot/`;
const KEY = COPY === 'arena' ? 'hexworth_lab_nt1' : 'hexworth_lab_nt1_dispatch';

let pass = 0, fail = 0;
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('    ok   ' + label); }
    else { fail++; console.log('    FAIL ' + label + (detail ? '\n           ' + String(detail).replace(/\s+/g, ' ').slice(0, 240) : '')); }
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    try {
        const page = await browser.newPage();
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(1500);

        /** The saved lab state, as the student's browser holds it. */
        const state = () => page.evaluate(k => {
            try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
        }, KEY);

        /**
         * The PROGRESS fingerprint -- the fields a student would lose.
         *
         * Comparing whole-state JSON is wrong and my first version did it: `elapsed` ticks
         * every second and `events` appends on every action, so that comparison can NEVER
         * hold and reported a working Cancel button as broken. An assertion that cannot pass
         * is as useless as one that cannot fail. These are the fields that carry the work.
         */
        const progress = async () => {
            const s = await state();
            if (!s) return 'null';
            return JSON.stringify({
                scenarioSelected: s._scenarioSelected === true,
                scenarioId: s._scenarioId,
                score: s.score,
                flagsFound: s.flagsFound,
                hintsUsed: s.hintsUsed,
                completed: s.completed,
                net: s._networkConfig
            });
        };

        /** Dismiss the intro and open the Help Desk ticket list. */
        const openTickets = async () => {
            await page.evaluate(() => {
                const b = [...document.querySelectorAll('button')].find(x => /start|begin|launch|enter/i.test(x.textContent));
                if (b) b.click();
            });
            await sleep(2200);
            await page.evaluate(() => {
                const i = [...document.querySelectorAll('.desktop-icon')].find(x => /help desk|ticket/i.test(x.textContent));
                if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            await sleep(1400);
        };
        const pickTicket = async (idx) => {
            const clicked = await page.evaluate((i) => {
                const btn = [...document.querySelectorAll('.nt1-scenario-btn')].find(b => b.dataset.idx === String(i));
                if (!btn) return false;
                btn.click();
                return true;
            }, idx);
            await sleep(2000);
            return clicked;
        };

        console.log(`\n=== reset button: product function ===\n${URL}\n`);

        // ── 1. lock in a scenario ────────────────────────────────────────────────
        await openTickets();
        chk('ticket picker offers scenarios', await pickTicket(1), 'no .nt1-scenario-btn[data-idx="1"]');
        let s = await state();
        chk('scenario 1 selected and saved', s && s._scenarioSelected === true && s._scenarioId === 1, JSON.stringify(s));
        const afterPick = await progress();

        // ── 2. the typed command must NOT wipe it ────────────────────────────────
        await page.evaluate(() => {
            const i = [...document.querySelectorAll('.desktop-icon')].find(x => /command/i.test(x.textContent));
            if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        });
        await sleep(1200);
        const out = await page.evaluate(async () => {
            const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
            const before = t.outputEl.innerText.length;
            await t._execute('reset');
            return t.outputEl.innerText.slice(before);
        });
        await sleep(800);
        let now = await progress();
        chk('typed `reset` leaves lab progress untouched', now === afterPick, `was ${afterPick}\n           now ${now}`);
        chk('typed `reset` is refused in this cmd.exe box', /not recognized/i.test(out), out);

        // ── 3 + 4. the button confirms, and Cancel really cancels ────────────────
        const hasBtn = await page.evaluate(() => !!document.getElementById('taskbarResetBtn'));
        chk('taskbar Reset button is present', hasBtn);
        await page.evaluate(() => document.getElementById('taskbarResetBtn').click());
        await sleep(700);
        const dlg = await page.evaluate(() => {
            const o = document.getElementById('resetConfirmOverlay');
            return o ? o.innerText.replace(/\s+/g, ' ').trim() : null;
        });
        chk('clicking it opens a confirmation dialog', !!dlg && /reset box/i.test(dlg), dlg);
        await page.evaluate(() => document.getElementById('resetConfirmNo').click());
        await sleep(700);
        now = await progress();
        chk('Cancel leaves lab progress untouched', now === afterPick, `was ${afterPick}\n           now ${now}`);

        // ── 5. confirming really does clear the box ──────────────────────────────
        await page.evaluate(() => document.getElementById('taskbarResetBtn').click());
        await sleep(600);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {}),
            page.evaluate(() => document.getElementById('resetConfirmYes').click())
        ]);
        await sleep(2000);
        s = await state();
        chk('confirming clears the selected scenario', !s || s._scenarioSelected !== true, JSON.stringify(s));
        /* NEGATIVE CONTROL. The two "untouched" assertions above compare this same
         * fingerprint. If it could not detect a real wipe they would be decoration that
         * passes no matter what the button does. A confirmed reset IS a real wipe, so the
         * fingerprint MUST differ here -- that is what makes the two passes above mean
         * something. */
        now = await progress();
        chk('CONTROL: the fingerprint does detect a real wipe', now !== afterPick, `unchanged after a confirmed reset: ${now}`);

        // ── 6. THE POINT: a DIFFERENT scenario can now be chosen ─────────────────
        await openTickets();
        chk('ticket picker is available again after reset', await pickTicket(3), 'no .nt1-scenario-btn[data-idx="3"] after reset');
        s = await state();
        chk('student switched to scenario 3', s && s._scenarioSelected === true && s._scenarioId === 3, JSON.stringify(s));

    } catch (e) {
        fail++;
        console.log('    FAIL harness error: ' + e.message);
    } finally {
        await browser.close();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
