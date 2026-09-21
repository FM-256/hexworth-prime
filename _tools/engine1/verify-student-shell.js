#!/usr/bin/env node
'use strict';
/**
 * verify-student-shell.js
 *
 * @catalog what    Opens each team's REAL token URL in a browser and proves a student reaches a SHELL
 * @catalog run     node _tools/engine1/verify-student-shell.js [--team <slug>]
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS, and it is not a flattering reason. The access check for Engine 1 was: does the
 * token URL return HTTP 200, is the bare hostname gated, does a wrong token 404. All six passed and
 * the SITREP recorded the result as "seamless". It was not. A student clicking their team link met
 * `player@<ip>'s password:` and had to type a 24-character random string, blind, into a browser
 * terminal. The operator hit it themselves and could not get in.
 *
 * THE CHECK COULD NOT HAVE FAILED. wetty serves the terminal page successfully and the SSH login
 * happens INSIDE it, so a password prompt is also an HTTP 200. The old check returned the same
 * answer whether a student landed in a shell or at a wall. Measuring the transport and calling it
 * access is the whole defect.
 *
 * So this asserts the only thing that matters: type a command, get output back from the Windows box.
 * `whoami` must answer `engine1\player`. That fails on a password prompt, on a dead container, on a
 * stale IP after a host reboot, and on a token that no longer matches the tunnel.
 *
 * NON-DESTRUCTIVE. It authenticates and runs one read-only command per team. It never writes to a
 * box, and it never prints a token or a password: a URL that appears in a log is a URL that has
 * leaked, and the token IS the gate on this path.
 */
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const TEAMS = ['blue-shield-v3', 'cyan-storm', 'gold-strike', 'green-ops', 'purple-haze', 'red-cell'];
const HOST = { 'blue-shield-v3': 'engine1-blue-shield', 'cyan-storm': 'engine1-cyan-storm',
               'gold-strike': 'engine1-gold-strike', 'green-ops': 'engine1-green-ops',
               'purple-haze': 'engine1-purple-haze', 'red-cell': 'engine1-red-cell' };

/* READS THE TERMINAL BUFFER, NOT THE DOM. xterm.js here uses the CANVAS renderer: there are zero
 * `.xterm-rows` elements and three canvases, so terminal text never enters the DOM and
 * `document.body.innerText` is always the empty string. The first version of this file read innerText
 * and therefore reported "not stopped at a password prompt" for a page showing exactly that prompt,
 * because an empty string contains no prompt either. That is the same false-pass shape as the HTTP
 * 200 check this file exists to replace, reproduced inside the replacement.
 * wetty exposes the Terminal instance as `window.wetty_term`, so the buffer can be read for real. */
function readTerminal() {
    const t = window.wetty_term;
    if (!t || !t.buffer) return '(no terminal instance)';
    const buf = t.buffer.active;
    let out = '';
    for (let i = 0; i < buf.length; i++) {
        const line = buf.getLine(i);
        if (line) out += line.translateToString(true) + '\n';
    }
    return out.replace(/\n{2,}/g, '\n').trim();
}

const only = (() => { const i = process.argv.indexOf('--team'); return i > 0 ? process.argv[i + 1] : null; })();
let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

/* Tokens live on bc2 at 0600 and are never printed. Read them over ssh at run time rather than
 * storing them anywhere this repo can leak them. */
function tokenFor(team) {
    return execFileSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=20', 'bc2-cf',
        `sudo tr -d '\\r\\n' < /srv/hexworth/engine1/config/tokens/${team}.token`],
        { encoding: 'utf8', timeout: 45000 }).trim();
}

(async () => {
    console.log('\n== student shell reachability (the REAL path a student walks) ==');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    for (const team of TEAMS) {
        if (only && only !== team) continue;
        let token;
        try { token = tokenFor(team); }
        catch (e) { chk(`${team}: token readable on bc2`, false, e.message.slice(0, 60)); continue; }
        if (!token || token.length < 16) { chk(`${team}: token looks valid`, false, `${token.length} chars`); continue; }

        const url = `https://${HOST[team]}.hexworth.tech/t/${token}/`;
        const page = await browser.newPage();
        let text = '';
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
            /* Give wetty time to open its SSH session before typing. */
            await new Promise(r => setTimeout(r, 6000));
            await page.keyboard.type('whoami\n');
            await new Promise(r => setTimeout(r, 6000));
            text = await page.evaluate(readTerminal);
        } catch (e) {
            chk(`${team}: terminal reachable`, false, e.message.slice(0, 70));
            await page.close();
            continue;
        }
        await page.close();

        const prompted = /password\s*:/i.test(text);
        const gotShell = /engine1\\player/i.test(text);
        /* A missing terminal instance is its own failure, not a silent pass: if the page changes so
         * `wetty_term` disappears, this file must go red rather than quietly measure nothing again. */
        if (/no terminal instance/.test(text)) chk(`${team}: terminal instance readable`, false, 'wetty_term absent');
        /* Asserted separately on purpose: "no prompt" and "a shell answered" are different claims,
         * and a blank page would satisfy the first while failing the student. */
        chk(`${team}: NOT stopped at a password prompt`, !prompted, prompted ? 'password prompt present' : '');
        chk(`${team}: whoami answered engine1\\player`, gotShell,
            gotShell ? '' : ('last 70 chars: ' + text.replace(/\s+/g, ' ').slice(-70)));
    }
    await browser.close();
    console.log(`\n  ${pass} passed, ${fail} failed`);
    if (fail) console.log('  A student cannot start playing until every team passes BOTH lines.');
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('SUITE FAILED:', e.message); process.exit(1); });
