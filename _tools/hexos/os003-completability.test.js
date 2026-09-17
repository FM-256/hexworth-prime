#!/usr/bin/env node
/**
 * os003-completability.test.js
 *
 * @catalog what   Plays every os003 scenario as a student does and asserts each ENDS with a
 *                 token, then attacks the box: a negative control, panel-only scenarios that
 *                 must NOT be completable from the terminal, and every fix command checked
 *                 against every OTHER scenario so none of them leaks.
 * @catalog run    node _tools/hexos/os003-completability.test.js [--base URL]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * Measured on hexworth.com 2026-09-16: the walkthrough documents 16 commands, 15 failed and
 * the 16th — `dir C:\Windows\System32\vcruntime140.dll`, scenario 1's entire diagnostic —
 * answered about C:\Users\Technician. os002's lesson was that walkthrough-verbatim proves a
 * box COMPLETABLE and says nothing about whether it is cheatable; both defects Chris found
 * there lived in that gap. So the cheat section here is not an afterthought.
 *
 * Token VALUES are only asserted against hexworth.com. Firebase Auth is domain-scoped, so
 * localhost and preview channels deliver null BY DESIGN — asserting there reports a false
 * failure on a correct box, and passing a null through reports a false success.
 */
'use strict';
const puppeteer = require('puppeteer');
const bi = process.argv.indexOf('--base');
const BASE = bi > -1 ? process.argv[bi + 1] : 'http://127.0.0.1:5660';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const REG_COMPAT = 'reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\Legacy\\InventoryPro.exe" /d "~ WIN7 RUNASADMIN" /f';
const DEL_CACHE  = 'del /q /s C:\\Users\\username\\AppData\\Local\\Temp\\*';
const DISM_NETFX = 'dism /online /enable-feature /featurename:NetFx3 /all';

const PLAN = [
    { idx: 0, id: 'missing_vcredist',    panel: true },
    { idx: 1, id: 'dll_not_found',       panel: true },
    { idx: 2, id: 'compat_mode',         cmds: [REG_COMPAT] },
    { idx: 3, id: 'corrupt_profile',     cmds: [DEL_CACHE] },
    { idx: 4, id: 'dotnet_conflict',     cmds: [DISM_NETFX] }
];

let pass = 0, fail = 0;
/* Set once a delivery has landed in THIS process, so the latency budget applies only where
 * the Cloud Function is known warm. The first scenario of a run may be paying a cold start. */
let warmConfirmed = false;
const ok = (n, c, d) => { if (c) { pass++; console.log(`    ok   ${n}`); } else { fail++; console.log(`    FAIL ${n}${d ? '  ' + d : ''}`); } };

async function open(p, idx) {
    await p.goto(`${BASE}/dispatch/boxes/os003-app-crash/`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(1000);
    await p.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).find(e => /start|begin|launch|enter/i.test(e.textContent)); if (x) x.click(); });
    for (let i = 0; i < 30; i++) { if (await p.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted))) break; await sleep(500); }
    await p.keyboard.press('Shift'); await sleep(350);
    await p.evaluate(() => { const bt = [...document.querySelectorAll('#survey-overlay button')].find(x => /skip/i.test(x.textContent)); if (bt) bt.click(); });
    await sleep(500);
    await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'ticket'); BoxEngine._launchApp(t); });
    await p.waitForSelector('[data-idx]', { timeout: 9000 });
    await p.evaluate(i => document.querySelectorAll('[data-idx]')[i].click(), idx);
    await sleep(900);
    await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'hw_panel'); BoxEngine._launchApp(t); });
    await sleep(700);
}
async function term(p, cmds) {
    await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
    await sleep(800);
    return p.evaluate(async list => {
        const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
        const n = t.outputEl.innerText.length;
        for (const c of list) await t._execute(c);
        return t.outputEl.innerText.slice(n);
    }, cmds);
}

(async () => {
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    for (const sc of PLAN) {
        console.log(`\n--- ${sc.id} (${sc.panel ? 'panel route' : 'terminal route'})`);
        const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
        const errs = []; p.on('pageerror', e => errs.push(e.message));
        p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
        await open(p, sc.idx);
        const panelLen = await p.evaluate(() => [...document.querySelectorAll('[data-os3-panel]')].map(n => n.innerText.trim().length));
        ok('App Panel renders', panelLen.length > 0 && panelLen.every(l => l > 50), JSON.stringify(panelLen));

        if (sc.panel) {
            // The DLL must read NOT FOUND before the fix, and the terminal must not be able
            // to conjure the installer.
            const before = await term(p, ['dir C:\\Windows\\System32\\' + (sc.id === 'missing_vcredist' ? 'vcruntime140.dll' : 'msvcp120.dll')]);
            ok('the missing DLL reads File Not Found before the fix', /File Not Found/.test(before), before.replace(/\s+/g, ' ').slice(0, 120));
            ok('Apply Fix present and clicked', await p.evaluate(() => { const f = document.querySelector('.os3-panel-fix'); if (!f) return false; f.click(); return true; }));
            await sleep(900);
            const after = await term(p, ['dir C:\\Windows\\System32\\' + (sc.id === 'missing_vcredist' ? 'vcruntime140.dll' : 'msvcp120.dll')]);
            ok('the DLL is present after the fix', !/File Not Found/.test(after), after.replace(/\s+/g, ' ').slice(0, 120));
        } else {
            await term(p, sc.cmds);
            ok('terminal sequence completed the scenario', await p.evaluate(() => !!BoxEngine.state._flagRevealed));
        }
        /* ── WHY THIS POLLS INSTEAD OF SLEEPING ────────────────────────────────────────────
         * This was `await sleep(1600)` and one sample. On 2026-09-17, against hexworth.com,
         * it reported `a real token is RENDERED  got: null` for scenario 1 while scenarios
         * 2-5 passed — on a box that was working correctly. What it raced: requestFlagText
         * establishes the anonymous session AND calls deliverFlag, and that call was behind a
         * container cold start. Four probe plays (flag-slot-fill-latency.probe.js) delivered a
         * real token EVERY time and never wrote N/A, so the null lived only inside the window.
         *
         * A gate that reports red on correct code is worse than no gate: it teaches everyone
         * to explain the red away, and the next REAL failure gets the same shrug. */
        const PRESENCE_CEILING_MS = 20000;   // poll deadline: "did it EVER arrive". Not an SLA.
        const PROD = /hexworth\.com/.test(BASE);

        /* ── WARM_BUDGET_MS: THE LATENCY DETECTOR, AND WHY IT SKIPS THE FIRST SCENARIO ──────
         * Replacing the fixed sleep with a 20s ceiling would delete this test's only latency
         * sensitivity — the old 1600ms sample was an SLA by accident. Printing a number is not
         * a gate; nobody fails a run by reading stdout. So the budget is a real assertion.
         *
         * IT IS DERIVED FROM CLIENT-OBSERVED FILLS ONLY:
         *   - scenarios 2-5 each passed the OLD sleep(1600) sample on production => warm fill
         *     was under 1600ms, observed four independent times, measured at the DOM.
         *   - the probe measured ~1.0s warm, twice.
         *   4000ms is ~2.5x the largest of those. Catches a warm path that degrades 2.5x+.
         *
         * IT DELIBERATELY DOES NOT COVER THE FIRST SCENARIO OF A RUN. A cold end-to-end fill
         * has NEVER been measured: the only cold number available is a platform-log gap
         * (container boot -> serve start, ~2.2s) which EXCLUDES deliverFlag's own execution,
         * the round trip back, and the DOM write. Budgeting the client-observed claim on that
         * server-side proxy is measuring a proxy instead of the claim, and if real cold latency
         * is 6-11s the budget would fail on legitimate cold starts — reproducing the very flake
         * this change removes, under a new assertion name, on the run most likely to be cold
         * (straight after a deploy). So scenario 1 is covered by PRESENCE_CEILING_MS alone.
         * To close this properly: measure a true cold fill (idle the function ~15min, then one
         * probe play) and only then decide whether a cold budget is warranted. */
        const WARM_BUDGET_MS = 4000;

        /* ONE loop, ONE deadline, slot text and token read in the SAME iteration — not two
         * poll helpers, which would make the worst case 2x the ceiling per scenario.
         *
         * No separate non-prod ceiling: off hexworth.com there is no auth, so requestFlagText
         * takes the BoxEngine.js:1487 early return, the slot resolves to N/A almost at once and
         * the N/A exit below fires. An extra tuned constant there would be a number with no
         * derivation behind it, which is the thing this comment block exists to avoid.
         *
         * Exiting on /N\/A/ is safe ONLY because os003 config.js:1033 writes "Token: N/A" as a
         * ONE-SHOT TERMINAL state: `.then(f => el.textContent = 'Token: ' + (f || 'N/A'))`, no
         * .catch, nothing re-rendering the slot afterwards. IF A RETRY IS EVER ADDED THERE,
         * N/A becomes an INTERIM value and this exit reintroduces the race it fixes. */
        const t0 = Date.now();
        let slot = null, tok = null, elapsed = 0;
        for (;;) {
            slot = await p.evaluate(() => { const el = document.querySelector('.os3-flag-slot'); return el ? el.textContent.trim() : null; });
            tok = await p.evaluate(() => { const m = document.body.innerText.match(/flag\{[^}]{3,60}\}/i); return m ? m[0] : null; });
            elapsed = Date.now() - t0;
            if (tok) break;                                      // delivered
            if (slot && /N\/A/i.test(slot)) break;                // terminal failure state
            if (elapsed >= PRESENCE_CEILING_MS) break;            // gave up; assertions go red
            await sleep(250);
        }
        /* THREE outcomes, named separately. An earlier version printed "NEVER within 20000ms"
         * for an N/A that had resolved in 3ms — the loop exited on the terminal state and never
         * waited. Caught by the mutation run, not by reading. A log line that misstates what
         * happened sends the next reader somewhere wrong, which is this whole change's subject. */
        const how = tok ? `delivered in ${elapsed}ms`
            : (slot && /N\/A/i.test(slot)) ? `resolved to N/A in ${elapsed}ms (terminal, no retry)`
            : `NEVER resolved within the ${PRESENCE_CEILING_MS}ms ceiling`;
        console.log(`    ·    token fill: ${how}  slot="${slot}"`);

        /* Named for what it CHECKS, not for what a reader hopes it proves. It passes on a prod
         * N/A — that is deliberate, because the alternative (pass only on a real token) makes
         * it a duplicate of the two assertions below, and a duplicate is what gets deleted as
         * redundant later, taking real coverage with it. Delivery correctness is owned by
         * 'a real token is RENDERED' and nothing else. */
        ok('completion UI slot resolved (not the loading placeholder)',
           !!slot && /^Token:/.test(slot) && !/loading/i.test(slot), `got: ${slot}`);

        if (PROD) {
            /* Detail carries SLOT TEXT and ELAPSED, not just `got: null`. The old message could
             * not tell "still loading" from "N/A" — opposite causes, identical output — and
             * separating them by hand is exactly what flag-slot-fill-latency.probe.js is for. */
            const d = `got: ${tok} slot="${slot}" elapsed=${elapsed}ms`;
            ok('a real token is RENDERED', !!tok && !/null|N\/A/i.test(tok), d);
            ok("token is this scenario's own value", !!tok && tok.toLowerCase().includes(sc.id), d);
            if (warmConfirmed) {
                ok(`token arrived within the ${WARM_BUDGET_MS}ms warm budget`, !!tok && elapsed <= WARM_BUDGET_MS, d);
            } else {
                console.log(`    ·    latency budget NOT asserted for the first scenario of the run — a cold end-to-end fill has never been measured (see WARM_BUDGET_MS comment)`);
            }
            if (tok) warmConfirmed = true;   // a delivery landed, so the instance is now warm
        } else {
            console.log(`    SKIP token value — ${BASE} is not hexworth.com, Auth is domain-scoped so delivery is null by design (slot: ${slot})`);
        }
        ok('no uncaught page errors', errs.length === 0, errs.join(' | '));
        await ctx.close();
    }

    /* ── CHEAT RESISTANCE ──────────────────────────────────────────────────────────
     * A walkthrough proves a box completable, never unbeatable. Both defects Chris found
     * in os002 were reachable only by trying things the happy path never does. */
    console.log('\n--- cheat resistance');

    // 1. NEGATIVE CONTROL. Open everything, touch nothing.
    {
        const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
        p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
        await open(p, 0);
        await p.evaluate(async () => {
            for (const ic of BoxEngine.config.desktop.icons) {
                if (ic.app === 'reset_lab') continue;
                try { BoxEngine._launchApp(ic); } catch (e) {}
                await new Promise(r => setTimeout(r, 200));
            }
        });
        await sleep(1500);
        ok('negative control: opening every window reveals nothing',
            !(await p.evaluate(() => /flag\{/i.test(document.body.innerText) || !!BoxEngine.state._flagRevealed)));
        await ctx.close();
    }

    // 2. THE PANEL-ONLY SCENARIOS MUST NOT BE COMPLETABLE FROM THE TERMINAL.
    //    This is the claim the whole S1/S2 design rests on: the installer is not on this
    //    machine, so no amount of typing may install it.
    for (const sc of [PLAN[0], PLAN[1]]) {
        const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
        p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
        await open(p, sc.idx);
        await term(p, ['vc_redist.x64.exe /install /quiet /norestart', 'vcredist_x64_2013.exe /install /quiet',
                       REG_COMPAT, DEL_CACHE, DISM_NETFX]);
        const st = await p.evaluate(() => ({ flag: !!BoxEngine.state._flagRevealed, dll: !!BoxEngine.state._dllPresent }));
        ok(`${sc.id}: no terminal command installs the missing runtime`, !st.flag && !st.dll, JSON.stringify(st));
        await ctx.close();
    }

    /* 3. RIGHT KEYWORDS, WRONG VALUE.
     *    THE BLIND SPOT THAT LET ALL THREE EXPLOITS THROUGH. The 39 assertions before this
     *    only ever typed each scenario's CANONICAL correct command, and the cross-scenario
     *    checks used other scenarios' CORRECT commands — so a harness that was green could
     *    not see that `dism /online /disable-feature /featurename:netfx3` (the literal
     *    opposite of the fix), a Layers write with a garbage compat value, and a `del`
     *    against the WRONG USER'S profile all completed their scenarios. Nancy reproduced
     *    all three against a running box. Near-misses in the ARGUMENT dimension, not just
     *    the scenario dimension. */
    {
        const WRONG = [
            { idx: 4, id: 'dotnet_conflict', label: 'dism with /disable-feature (the opposite action)',
              cmd: 'dism /online /disable-feature /featurename:netfx3 /all' },
            { idx: 4, id: 'dotnet_conflict', label: 'dism naming netfx3 with no affirmative verb',
              cmd: 'dism /online /cleanup-image /featurename:netfx3' },
            { idx: 2, id: 'compat_mode', label: 'Layers write with a garbage compat value',
              cmd: 'reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\App.exe" /d "GARBAGE_NOT_A_REAL_COMPAT_STRING" /f' },
            { idx: 2, id: 'compat_mode', label: 'Layers write whose /v is not an executable',
              cmd: 'reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "NotAProgram" /d "~ WIN7 RUNASADMIN" /f' },
            { idx: 3, id: 'corrupt_profile', label: "del against a DIFFERENT user's AppData",
              cmd: 'del /q /s C:\\Users\\Public\\AppData\\Local\\Temp\\*' },
            { idx: 3, id: 'corrupt_profile', label: "del against the technician's own AppData",
              cmd: 'del /q /s C:\\Users\\Technician\\AppData\\Local\\Temp\\*' }
        ];
        for (const w of WRONG) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, w.idx);
            await term(p, [w.cmd]);
            const st = await p.evaluate(() => ({ flag: !!BoxEngine.state._flagRevealed, netfx: !!BoxEngine.state._netfx3Enabled, compat: !!BoxEngine.state._compatSet, cache: !!BoxEngine.state._cachesCleared }));
            ok(`${w.id}: ${w.label} does NOT complete it`, !st.flag, JSON.stringify(st));
            await ctx.close();
        }
    }

    /* 3b. ENUMERATE THE WHITELIST — DO NOT GUESS AT IT.
     *     Four straight review rounds found the same defect shape: a check that accepts a
     *     keyword or a list member without asking whether that particular value actually
     *     fixes THIS ticket. Each was found by someone hand-picking a near-miss, which only
     *     works for as long as somebody keeps guessing well.
     *
     *     So this reads both token lists OFF THE BOX CONFIG and tries every single one on
     *     its own. An OS layer alone must complete compat_mode; a modifier alone must not,
     *     because RUNASADMIN is elevation and HIGHDPIAWARE is DPI scaling and neither makes
     *     an application believe it is running on Windows 7. Add a token to either list in
     *     config.js and it is covered here without anyone remembering to write a case. */
    {
        const lists = await (async () => {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            const r = await p.evaluate(() => ({
                os: (typeof OS3Config !== 'undefined' && OS3Config._COMPAT_OS_LAYERS) || null,
                mod: (typeof OS3Config !== 'undefined' && OS3Config._COMPAT_MODIFIERS) || null
            }));
            await ctx.close();
            return r;
        })();
        /* CANARY: if the lists cannot be read, this section proves nothing and must say so
         * rather than silently testing zero tokens and reporting green. */
        ok('compat token lists are readable from the box config',
            !!(lists.os && lists.os.length && lists.mod && lists.mod.length), JSON.stringify(lists));

        /* AN INDEPENDENT ORACLE, because enumeration alone is not one.
         * Nancy moved RUNASADMIN from _COMPAT_MODIFIERS into _COMPAT_OS_LAYERS in a scratch
         * copy and this suite reported 67/0, cheerfully printing "OS layer RUNASADMIN alone
         * completes compat_mode". Of course it did: the test was deriving its expected answer
         * from the very array that had been corrupted, so it could only ever check that the
         * two were consistent with each other, never that the classification was TRUE.
         *
         * So the CLASSIFICATION lives here, independently, while the ENUMERATION above stays
         * dynamic for coverage. A token that moves between lists, appears in neither, or is
         * added without being classified fails right here and a human has to decide which it
         * is. That is the point: the machine enumerates, a person classifies.
         *
         * Each OS layer makes an application believe it is running on that Windows version.
         * Each modifier changes something else about the process and fixes no version check. */
        const ORACLE_OS = ['WIN95','WIN98','WINXPSP2','WINXPSP3','VISTARTM','VISTASP2','WIN7RTM','WIN7','WIN8RTM','WIN8'];
        const ORACLE_MOD = ['RUNASADMIN','HIGHDPIAWARE','640X480','DISABLEDXMAXIMIZEDWINDOWEDMODE'];
        const sorted = a => (a || []).slice().sort().join(',');
        ok('OS-layer list matches the independent classification',
            sorted(lists.os) === sorted(ORACLE_OS),
            `config=${sorted(lists.os)} oracle=${sorted(ORACLE_OS)}`);
        ok('modifier list matches the independent classification',
            sorted(lists.mod) === sorted(ORACLE_MOD),
            `config=${sorted(lists.mod)} oracle=${sorted(ORACLE_MOD)}`);

        /* NO ACCEPTANCE PATH OUTSIDE THE DECLARED MODEL.
         * Enumeration can only try what it can enumerate, so a bypass that lives in neither
         * array is invisible to it — Nancy added a `MAGICBYPASS` value to a scratch copy and
         * this suite stayed 68/0 while the exploit worked. This reads the shipped source and
         * asserts _compatSet is granted at exactly ONE place, inside the OS-layer guard. It
         * is a structural claim, not a behavioural one, which is why it can see what typing
         * commands cannot. */
        {
            const fs = require('fs'), path = require('path');
            /* STRIP COMMENTS HERE TOO. This block read raw source while the sibling block
             * below stripped — an inconsistency that bit exactly as you would expect: adding
             * an explanatory comment above the grant pushed the `hasOsLayer` guard outside
             * the character window and turned this assertion red against a correct box. A
             * proximity heuristic measured over prose is measuring the prose. */
            const raw0 = fs.readFileSync(path.resolve(__dirname, '../../_app/dispatch/boxes/os003-app-crash/config.js'), 'utf8');
            const src = raw0.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
            const grants = (src.match(/_compatSet\s*=\s*true/g) || []).length;
            ok('_compatSet is granted at exactly one call site', grants === 1, `found ${grants}`);
            const i = src.indexOf('_compatSet = true');
            const before = i > -1 ? src.slice(Math.max(0, i - 900), i) : '';
            const dist = i - src.lastIndexOf('if (!hasOsLayer)');
            ok('the only grant is gated by the OS-layer check',
                /if\s*\(!hasOsLayer\)/.test(before) && /hasOsLayer/.test(before),
                `guard is ${dist} chars before the grant (window 900, comments stripped)`);
        }

        for (const tok of (lists.os || [])) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            await term(p, [`reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\Legacy\\App.exe" /d "~ ${tok}" /f`]);
            ok(`OS layer ${tok} alone completes compat_mode`, await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }
        for (const tok of (lists.mod || [])) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            const out = await term(p, [`reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\Legacy\\App.exe" /d "${tok}" /f`]);
            const done = await p.evaluate(() => !!BoxEngine.state._flagRevealed);
            ok(`modifier ${tok} alone does NOT complete compat_mode`, !done);
            ok(`modifier ${tok} alone explains why it did not help`, /still will not start/.test(out), out.replace(/\s+/g, ' ').slice(0, 90));
            await ctx.close();
        }
        // An OS layer combined with a modifier is the documented form and must still work.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            await term(p, ['reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\Legacy\\App.exe" /d "~ WIN7 RUNASADMIN" /f']);
            ok('OS layer + modifier together completes compat_mode', await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }
    }

    /* 3c. NEAR-MISSES ARE GENERATED, NOT GUESSED.
     *     Nancy found this class with `Public`/`Technician` and `/disable-feature`. I closed
     *     exactly those strings and left `indexOf` in place, so Chris walked straight through
     *     with `C:\Users\notusername\...` and `/featurename:netfx3legacyfoo`. Two reviewers,
     *     the same class, because both fixes special-cased the examples they were handed.
     *
     *     So the identifiers are declared once and the variants are DERIVED from them —
     *     prefix, suffix, infix, and a plausible-looking neighbour. Change the account or
     *     the feature name in config.js and the adversarial set follows automatically. */
    {
        const variants = base => ['not' + base, base + 'legacyfoo', 'my' + base + '2', 'X' + base + 'X', base + '_old'];

        for (const bad of variants('username')) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 3); // corrupt_profile
            await term(p, [`del /q /s C:\\Users\\${bad}\\AppData\\Local\\Temp\\*`]);
            const st = await p.evaluate(() => ({ flag: !!BoxEngine.state._flagRevealed, cache: !!BoxEngine.state._cachesCleared }));
            ok(`del against account "${bad}" does NOT complete corrupt_profile`, !st.flag && !st.cache, JSON.stringify(st));
            await ctx.close();
        }

        for (const bad of variants('netfx3')) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 4); // dotnet_conflict
            await term(p, [`dism /online /enable-feature /featurename:${bad} /all`]);
            const st = await p.evaluate(() => ({ flag: !!BoxEngine.state._flagRevealed, netfx: !!BoxEngine.state._netfx3Enabled }));
            ok(`dism with feature "${bad}" does NOT complete dotnet_conflict`, !st.flag && !st.netfx, JSON.stringify(st));
            await ctx.close();
        }

        /* And the same discipline as 3b: no handler in this box may compare an identifier by
         * substring again. This reads the shipped source, so it sees what typing cannot. */
        {
            const fs = require('fs'), path = require('path');
            const raw = fs.readFileSync(path.resolve(__dirname, '../../_app/dispatch/boxes/os003-app-crash/config.js'), 'utf8');
            /* COMMENTS ARE NOT CODE. This check went red on its first run against a correctly
             * fixed box, because the comments explaining the old bug quote the old expression
             * verbatim — the detector was flagging the documentation of the fix. The repo has
             * this lesson already: _tools/hexos/flag-render-audit.js:80 carries the same guard
             * for the same reason ("a detector flagging the very comment that documents the
             * fix"). Strip comments, then judge the code. */
            const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
            ok('no handler gates on indexOf(_AFFECTED_USER)', !/indexOf\(\s*OS3Config\._AFFECTED_USER\s*\)/.test(src));
            ok("no handler gates on a bare indexOf('netfx3')", !/indexOf\(\s*'netfx3'\s*\)/.test(src));
            /* CANARY: comment-stripping must not eat the code it is meant to inspect. */
            ok('comment-stripping left the handlers intact', /_switchColonValue/.test(src) && /_accountInPath/.test(src));
        }
    }

    /* 3d. THE SURROUNDING CLAIM, NOT JUST THE IDENTIFIER.
     *     Round three of the same lesson. `del` verified the account segment and never asked
     *     whether the path was real, so D:, Z: and a UNC share to a nonexistent fileserver
     *     all completed the ticket. Generated drive/root variants, so this does not depend on
     *     anyone thinking of the next prefix. */
    {
        for (const root of ['D:\\Users', 'Z:\\Users', '\\\\fileserver\\Users', 'C:\\Usersx']) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 3);
            await term(p, [`del /q /s ${root}\\username\\AppData\\Local\\Temp\\*`]);
            const st = await p.evaluate(() => ({ flag: !!BoxEngine.state._flagRevealed, cache: !!BoxEngine.state._cachesCleared }));
            ok(`del rooted at "${root}" does NOT complete corrupt_profile`, !st.flag && !st.cache, JSON.stringify(st));
            await ctx.close();
        }

        /* THE COMPARISON THE WALKTHROUGH TELLS THE STUDENT TO MAKE MUST ACTUALLY WORK.
         * Both profiles reported an identical 214,877 files / 56.9 GB, so a student following
         * the documented diagnosis was told the clean control account was just as bloated as
         * the broken one — the opposite of what this scenario teaches. */
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 3);
            const out = await term(p, ['dir /s C:\\Users\\username | find "File(s)"',
                                       'dir /s C:\\Users\\Technician | find "File(s)"']);
            const nums = (out.match(/([\d,]{4,})\s+bytes/g) || []).map(x => x.replace(/\D/g, ''));
            ok('the affected profile and the control account report DIFFERENT sizes',
                nums.length >= 2 && nums[0] !== nums[nums.length - 1], JSON.stringify(nums));
            ok('the affected profile is the bloated one', /56,908,574,720/.test(out), out.replace(/\s+/g, ' ').slice(0, 140));
            await ctx.close();
        }

        /* wmic must read its own where clause. A filter matching nothing must say so. */
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 0);
            const miss = await term(p, ['wmic product where "Name like \'TotallyFakeVendorXYZ%\'" get Name,Version']);
            ok('wmic with a filter that matches nothing returns no rows',
                /No Instance\(s\) Available/.test(miss) && !/Visual C\+\+/.test(miss), miss.replace(/\s+/g, ' ').slice(0, 120));
            const hit = await term(p, ['wmic product where "Name like \'Microsoft Visual C++%\'" get Name,Version']);
            ok('wmic with a matching filter still lists the runtimes', /Visual C\+\+/.test(hit));
            await ctx.close();
        }

        /* A repeated /featurename: is an error in real dism, in either order. */
        for (const cmd of ['dism /online /enable-feature /featurename:NetFx3 /featurename:Bogus /all',
                           'dism /online /enable-feature /featurename:Bogus /featurename:NetFx3 /all']) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 4);
            await term(p, [cmd]);
            ok(`repeated /featurename: rejected (${cmd.includes('NetFx3 /featurename:Bogus') ? 'real first' : 'bogus first'})`,
                !(await p.evaluate(() => !!BoxEngine.state._flagRevealed)));
            await ctx.close();
        }
    }

    /* 3e. PATH ARITHMETIC. Round four of one disease.
     *     `C:\Users\username\..\Public\AppData\...` completed the ticket while really
     *     resolving to PUBLIC's cache, and `C:\Users\Public\..\username\AppData\...` —
     *     which genuinely resolves to the affected account — was rejected. Both directions
     *     matter: the first is credit for the wrong action, the second is denial of the
     *     right one. Generated from the account list so a new account is covered for free. */
    {
        const AFFECTED = 'username';
        const OTHERS = ['Public', 'Technician'];

        // Traversals that LAND somewhere else must not complete.
        for (const other of OTHERS) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 3);
            await term(p, [`del /q /s C:\\Users\\${AFFECTED}\\..\\${other}\\AppData\\Local\\Temp\\*`]);
            const st = await p.evaluate(() => ({ flag: !!BoxEngine.state._flagRevealed, cache: !!BoxEngine.state._cachesCleared }));
            ok(`del traversing to ${other} does NOT complete corrupt_profile`, !st.flag && !st.cache, JSON.stringify(st));
            await ctx.close();
        }

        // Traversals that LAND on the affected account must complete — denying the correct
        // action is the same defect wearing the opposite sign.
        for (const other of OTHERS) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 3);
            await term(p, [`del /q /s C:\\Users\\${other}\\..\\${AFFECTED}\\AppData\\Local\\Temp\\*`]);
            ok(`del traversing FROM ${other} to the affected account DOES complete it`,
                await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }

        // `.` segments must be inert, not a bypass.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 3);
            await term(p, [`del /q /s C:\\Users\\${AFFECTED}\\.\\AppData\\Local\\Temp\\*`]);
            ok('a "." segment in the correct path still completes it',
                await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }

        /* dir and del must agree about where a traversed path lands, or one of them is lying
         * — the invariant dir/cd already hold. */
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 3);
            const out = await term(p, ['dir C:\\Users\\username\\..\\Technician']);
            ok('dir resolves a traversed path to the account it really names',
                /Directory of C:\\Users\\Technician/i.test(out), out.replace(/\s+/g, ' ').slice(0, 120));
            await ctx.close();
        }
    }

    /* 3f. KEYWORD SMUGGLING. Round five, and the last one closed structurally.
     *     `reg add`'s key gate and `dism`'s verb check searched the WHOLE joined argv, so the
     *     words that unlock them could be carried in through an argument VALUE — a filename
     *     of AppCompatFlagsLayers.exe against a nonsense key, or the junk token
     *     foo/enable-feature. Both functions already parsed their other arguments correctly;
     *     the gate one line above the correct code was what nobody had looked at.
     *
     *     Payloads are BUILT from the keywords the gates use, so a new gate keyword is
     *     covered without anyone inventing a smuggling route for it. */
    {
        const KEY_WORDS = ['appcompatflags', 'layers'];
        const smuggleV = `C:\\Legacy\\${KEY_WORDS.join('')}.exe`;
        const smuggleD = `~ WIN7 ${KEY_WORDS.join(' ')}`;
        const CASES = [
            { idx: 2, id: 'compat_mode', label: 'keywords smuggled through the /v filename',
              cmd: `reg add "HKCU\\Software\\Totally\\Unrelated\\Nonsense" /v "${smuggleV}" /d "~ WIN7 RUNASADMIN" /f` },
            { idx: 2, id: 'compat_mode', label: 'keywords smuggled through the /d value',
              cmd: `reg add "HKCU\\Software\\Totally\\Unrelated\\Nonsense" /v "C:\\Legacy\\App.exe" /d "${smuggleD}" /f` },
            { idx: 4, id: 'dotnet_conflict', label: 'verb smuggled inside a junk token',
              cmd: 'dism /online /featurename:netfx3 foo/enable-feature' },
            { idx: 4, id: 'dotnet_conflict', label: 'verb smuggled through a path-looking token',
              cmd: 'dism /online /featurename:netfx3 C:\\x\\enable-feature' },
            { idx: 3, id: 'corrupt_profile', label: 'path keywords as part of a filename, not segments',
              cmd: 'del /q /s C:\\Users\\username\\Documents\\appdata-temp-notes.txt' }
        ];
        for (const c of CASES) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, c.idx);
            await term(p, [c.cmd]);
            ok(`${c.id}: ${c.label} does NOT complete it`,
                !(await p.evaluate(() => !!BoxEngine.state._flagRevealed)));
            await ctx.close();
        }

        /* THE STRUCTURAL END OF THIS CLASS.
         * Five rounds, five locations, each found by a reviewer typing something clever. A
         * behavioural test can only ever catch the smuggling routes someone imagined. This
         * reads the shipped source and asserts the SHAPE that made them all possible is
         * absent: no gate in this box may test a rejoined command line. */
        {
            const fs = require('fs'), path = require('path');
            const raw = fs.readFileSync(path.resolve(__dirname, '../../_app/dispatch/boxes/os003-app-crash/config.js'), 'utf8');
            const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
            const offenders = src.split('\n').filter(l => /\b(low|joined)\s*\.indexOf\(/.test(l));
            ok('no gate tests a rejoined command line', offenders.length === 0, offenders.slice(0, 3).join(' | '));
            /* Chris, round six: this assertion catches "read the wrong variable" and cannot
             * catch "validated the right variable with the wrong logic". Correctly scoping
             * regKey did not stop AppCompatFlagsLayersXYZ from passing. So the ban extends to
             * containment tests on a scoped structured identifier as well — those go through
             * _keyPathHas. It still cannot catch every wrong-logic case, and should not be
             * read as proof the class is closed. */
            const loose = src.split('\n').filter(l => /\bregKey\s*\.indexOf\(/.test(l));
            ok('no gate validates a registry key by containment', loose.length === 0, loose.slice(0, 3).join(' | '));
            ok('the switch and value primitives are present', /_hasSwitch/.test(src) && /_leadingValue/.test(src) && /_switchColonValue/.test(src));
        }
    }

    /* 3g. STRUCTURE, NOT CONTAINMENT. Round six.
     *     The key gate was correctly SCOPED to the key argument after round five and still
     *     accepted AppCompatFlagsLayersXYZ and LayersAppCompatFlagsBogus, because it asked
     *     whether two words appeared somewhere rather than whether the key had the shape a
     *     Windows path has. Chris's framing: a source-shape assertion catches "read the wrong
     *     variable", never "validated the right variable with the wrong logic".
     *
     *     Malformations are DERIVED from the real segments — concatenated, reversed, suffixed,
     *     separated — so a different key elsewhere gets the same treatment for free. */
    {
        const REAL = 'HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers';
        const A = 'AppCompatFlags', B = 'Layers';
        const MALFORMED = [
            ['concatenated with a suffix', `HKCU\\Software\\Whatever\\${A}${B}XYZ`],
            ['reversed and concatenated',  `HKCU\\${B}${A}Bogus`],
            ['both words, wrong order',    `HKCU\\Software\\${B}\\${A}`],
            ['both words, not adjacent',   `HKCU\\Software\\${A}\\Something\\${B}`],
            ['one word only',              `HKCU\\Software\\Microsoft\\${A}`]
        ];
        for (const [label, key] of MALFORMED) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            await term(p, [`reg add "${key}" /v "C:\\Legacy\\App.exe" /d "~ WIN7 RUNASADMIN" /f`]);
            ok(`compat_mode: key ${label} does NOT complete it`,
                !(await p.evaluate(() => !!BoxEngine.state._flagRevealed)), key);
            await ctx.close();
        }
        /* ANCHORED, not merely recognisable. `_keyPathHas` accepted the required segment pair
         * ANYWHERE in the key, so a fabricated vendor prefix or no hive at all still passed.
         * Real reg.exe rejects a key with no root predicate outright. */
        const UNANCHORED = [
            ['fabricated prefix before the real pair', 'HKCU\\Software\\ZzzMadeUpVendorNoSuchThing\\Whatever\\AppCompatFlags\\Layers'],
            ['no hive at all', 'AppCompatFlags\\Layers'],
            ['wrong hive', 'HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers'],
            ['nonexistent hive', 'HKXX\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers']
        ];
        for (const [label, key] of UNANCHORED) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            await term(p, [`reg add "${key}" /v "C:\\Legacy\\App.exe" /d "~ WIN7 RUNASADMIN" /f`]);
            ok(`compat_mode: ${label} does NOT complete it`,
                !(await p.evaluate(() => !!BoxEngine.state._flagRevealed)), key.slice(0, 60));
            await ctx.close();
        }

        /* reg.exe accepts both hive spellings, so a student typing the long form is not making
         * a mistake and must not be failed for it. */
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            await term(p, ['reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\Legacy\\App.exe" /d "~ WIN7 RUNASADMIN" /f']);
            ok('compat_mode: the long-form hive spelling also completes it',
                await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }

        // The real key must still work — the other half of every tightening.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            await term(p, [`reg add "${REAL}" /v "C:\\Legacy\\App.exe" /d "~ WIN7 RUNASADMIN" /f`]);
            ok('compat_mode: the REAL key still completes it', await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }
        /* Non-scoring but the same defect: a query for a key that does not exist must not
         * confidently answer about one that does. */
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 4);
            const out = await term(p, ['reg query "HKLM\\SOFTWARE\\RandomNdpTest"']);
            ok('reg query for a nonexistent key does not answer about the real one',
                /unable to find/i.test(out) && !/NET Framework Setup/.test(out), out.replace(/\s+/g, ' ').slice(0, 110));
            await ctx.close();
        }
    }

    /* 3h. HONEST MISTAKES DESERVE AN ANSWER, AND EVERY COMMAND THE BOX RECOMMENDS MUST EXIST.
     *     Round eight, and a different kind from the seven before: neither of these grants
     *     credit, so no cheat assertion could ever see them. They are about what a student
     *     who is trying, and getting it slightly wrong, is told. */
    {
        // A wrong hive is one of the two most ordinary registry mistakes there is.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            const out = await term(p, ['reg add "HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\Legacy\\App.exe" /d "~ WIN7 RUNASADMIN" /f']);
            ok('wrong hive is still not credited', !(await p.evaluate(() => !!BoxEngine.state._flagRevealed)));
            ok('wrong hive EXPLAINS itself rather than answering with silence',
                /HKCU/.test(out) && /still will not start/.test(out), out.replace(/\s+/g, ' ').slice(0, 120));
            await ctx.close();
        }

        /* EVERY COMMAND THE BOX'S OWN ERROR TEXT RECOMMENDS MUST WORK.
         * The unknown-feature error told the student to run /Get-Features, and running it
         * answered "Unrecognized option" — a dead end the box generated for itself. */
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 4);
            const err = await term(p, ['dism /online /enable-feature /featurename:bogus']);
            const rec = (err.match(/\/[A-Za-z][\w-]+/g) || []).filter(x => /get-features/i.test(x));
            ok('the unknown-feature error recommends /Get-Features', rec.length > 0, err.replace(/\s+/g, ' ').slice(0, 110));
            const listed = await term(p, ['dism /online /get-features']);
            ok('and /Get-Features actually works', /Feature Name/.test(listed) && /NetFx3/.test(listed), listed.replace(/\s+/g, ' ').slice(0, 110));
            ok('/Get-Features reports NetFx3 as Disabled before the fix', /NetFx3\s+Disabled/.test(listed));
            await term(p, ['dism /online /enable-feature /featurename:NetFx3 /all']);
            const after = await term(p, ['dism /online /get-features']);
            ok('/Get-Features reports NetFx3 as Enabled after the fix', /NetFx3\s+Enabled/.test(after));
            await ctx.close();
        }

        /* The panel route must remain a complete path for a student who does not want the
         * terminal at all — Chris verified this by hand; it is asserted here so it stays true. */
        for (const sc of PLAN.filter(x => !x.panel)) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, sc.idx);
            await p.evaluate(() => { const f = document.querySelector('.os3-panel-fix'); if (f) f.click(); });
            await sleep(900);
            ok(`${sc.id}: the panel button alone completes it, no terminal needed`,
                await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }
    }

    /* 3i. DOES LOOKING MATCH DOING? Chris's curious-student round.
     *     `dir C:\Users\username\AppData` reported 0 files and anything below it answered
     *     File Not Found, while `del` on that exact path removed 18,442 files. The ticket's
     *     whole subject is a bloated AppData. A student who verified before deleting — which
     *     A+ trains explicitly — was told the folder did not exist. No credit was reachable
     *     through it, so eight rounds of adversarial testing were structurally blind; it
     *     only appears if you ask whether the box's commands agree with each other. */
    {
        const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
        p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
        await open(p, 3);
        const before = await term(p, ['dir C:\\Users\\username\\AppData',
                                      'dir C:\\Users\\username\\AppData\\Local',
                                      'dir /s C:\\Users\\username\\AppData\\Local\\Temp']);
        ok('AppData is visible before the fix', !/File Not Found/.test(before), before.replace(/\s+/g, ' ').slice(0, 130));
        /* Compare NUMBERS, not strings. Windows does not comma-format the file count in
         * `dir /s`'s Total Files Listed line, while this box's `del` message does — so the
         * two print the same quantity as "18442" and "18,442". The invariant Chris named is
         * that looking matches doing, which is about the number, not its punctuation. */
        const digits = txt => (txt.match(/[\d,]{3,}/g) || []).map(x => x.replace(/,/g, ''));
        ok('the bloat dir REPORTS the files del claims to delete',
            digits(before).includes('18442'), before.replace(/\s+/g, ' ').slice(-130));

        const out = await term(p, ['del /q /s C:\\Users\\username\\AppData\\Local\\Temp\\*']);
        ok('the documented delete still works', /18,442 File\(s\) deleted/.test(out));

        const after = await term(p, ['dir /s C:\\Users\\username\\AppData\\Local\\Temp']);
        ok('after deleting, dir shows the folder EMPTY rather than missing',
            !/File Not Found/.test(after) && /\b0 File\(s\)/.test(after), after.replace(/\s+/g, ' ').slice(0, 130));
        await ctx.close();

        // A folder the box does not model must be refused by del, not silently "deleted".
        {
            const ctx2 = await b.createBrowserContext(); const p2 = await ctx2.newPage();
            p2.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p2, 3);
            const bogus = await term(p2, ['del /q /s C:\\Users\\username\\AppData\\Local\\NoSuchCache\\Temp\\*']);
            ok('del refuses a path dir does not model', /cannot find the path/i.test(bogus), bogus.replace(/\s+/g, ' ').slice(0, 110));
            ok('and it granted no credit', !(await p2.evaluate(() => !!BoxEngine.state._flagRevealed)));
            await ctx2.close();
        }

        // The walkthrough's SECOND documented del — a wildcard in the middle of the path.
        {
            const ctx3 = await b.createBrowserContext(); const p3 = await ctx3.newPage();
            p3.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p3, 3);
            const office = await term(p3, ['del /q /s C:\\Users\\username\\AppData\\Local\\Microsoft\\Office\\16.0\\*\\Cache\\*']);
            ok("the walkthrough's Office cache delete still works", /File\(s\) deleted/.test(office), office.replace(/\s+/g, ' ').slice(0, 110));
            await ctx3.close();
        }
    }

    /* 3j. DOES THE BOX TELL THE TRUTH ABOUT WHAT THE STUDENT DID? Round ten.
     *     Every assertion until now checked that credit was granted CORRECTLY. None checked
     *     that the box described accurately what it granted credit FOR. A student who used
     *     WIN8 on their own binary — equally valid, section 3b proves all ten layers work —
     *     was told "now starts under the Windows 7 compatibility layer", and `reg query`
     *     answered with a hardcoded InventoryPro.exe / WIN7 RUNASADMIN that was none of their
     *     work. Verifying your own write is exactly what the walkthrough models. */
    {
        const EXE = 'C:\\ProgramData\\OldBillingApp\\billing.exe';
        for (const layer of ['WIN8', 'WINXPSP3', 'WIN7']) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 2);
            const out = await term(p, [`reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "${EXE}" /d "~ ${layer}" /f`]);
            ok(`${layer}: completes the scenario`, await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            ok(`${layer}: the completion message names the layer the STUDENT chose`,
                new RegExp(layer, 'i').test(out) && !/Windows 7 compatibility/i.test(out.replace(new RegExp(layer, 'ig'), '')),
                out.replace(/\s+/g, ' ').slice(-120));
            const q = await term(p, ['reg query "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers"']);
            ok(`${layer}: reg query echoes the student's own exe`, q.includes('billing.exe'), q.replace(/\s+/g, ' ').slice(0, 130));
            ok(`${layer}: reg query echoes the student's own layer, not a placeholder`,
                new RegExp(layer, 'i').test(q) && !/InventoryPro/i.test(q), q.replace(/\s+/g, ' ').slice(0, 130));

            /* EVERY SURFACE THAT REPEATS A FACT MUST AGREE.
             * Round ten fixed the completion notice and the registry echo. The App Panel —
             * the most visible surface in the box, and one the walkthrough tells the student
             * is equally valid — still printed a hardcoded "WIN7 RUNASADMIN", so a student
             * who set WIN8, got the terminal's correct confirmation, then glanced at the
             * panel saw it contradicted. The fix had been made where the bug was FOUND rather
             * than everywhere the fact is REPEATED. Same shape as dir/del disagreeing about
             * AppData. This asserts the agreement rather than any one surface. */
            const panel = await p.evaluate(() => {
                const t = BoxEngine.config.desktop.icons.find(i => i.app === 'hw_panel');
                BoxEngine._launchApp(t);
                return new Promise(r => setTimeout(() => {
                    const n = document.querySelector('[data-os3-panel]');
                    r(n ? n.innerText : '');
                }, 600));
            });
            ok(`${layer}: the App Panel agrees with the terminal about the layer`,
                new RegExp(layer, 'i').test(panel) && !/WIN7 RUNASADMIN/i.test(panel.replace(new RegExp(layer, 'ig'), '')),
                panel.replace(/\s+/g, ' ').slice(0, 140));
            ok(`${layer}: the App Panel names the student's own binary`,
                panel.includes('billing.exe'), panel.replace(/\s+/g, ' ').slice(0, 140));
            await ctx.close();
        }
    }

    // 4. THE CORRECT COMMAND MUST STILL WORK after all that tightening.
    {
        for (const sc of PLAN.filter(x => !x.panel)) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, sc.idx);
            await term(p, sc.cmds);
            ok(`${sc.id}: the documented command still completes it`, await p.evaluate(() => !!BoxEngine.state._flagRevealed));
            await ctx.close();
        }
    }

    // 5. NO FIX COMMAND MAY COMPLETE A SCENARIO IT DOES NOT BELONG TO.
    //    Every terminal fix run against every other scenario.
    for (const target of PLAN) {
        for (const src of PLAN.filter(x => !x.panel && x.id !== target.id)) {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, target.idx);
            await term(p, src.cmds);
            ok(`${src.id}'s fix does not complete ${target.id}`,
                !(await p.evaluate(() => !!BoxEngine.state._flagRevealed)));
            await ctx.close();
        }
    }

    await b.close();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
