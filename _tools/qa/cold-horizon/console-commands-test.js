#!/usr/bin/env node
/*
 * @catalog what    Types EVERY command the Lagrange ground segment console advertises, plus the
 * @catalog what    shell commands its prompt implies, and reports which actually answer.
 * @catalog run     node _tools/qa/cold-horizon/console-commands-test.js
 * @catalog status  GATE
 *
 * WHY. The operator hit "ls: command not found" on console.html. The cause is a fix of mine from
 * earlier the same day: SecurityTerminal used to `extends LinuxTerminal`, which threw at load and
 * left the class in a permanent TDZ, so five lab terminals were silently dead. Making it
 * standalone fixed that and REMOVED the inherited LinuxTerminal command surface with it, taking
 * ls / cd / cat / pwd along.
 *
 * ⚠ THE PROMPT IS AN ADVERTISEMENT. It renders `ir-lead@moc-jax:~$`, which is a Unix shell
 * prompt with a home directory in it. A student will type ls, because everything about the
 * affordance says they can. "Nothing documents ls" is not a defence when the prompt implies it.
 *
 * So this checks three populations, and a bare "command not found" is a FAIL in all three:
 *   1. what `lehelp` lists            — the console's own contract
 *   2. what the PAGE COPY promises    — nmap/tcpdump/dig, "the ground segment is a real network"
 *   3. what the PROMPT implies        — ls, pwd, cat, cd, whoami, help
 *
 * Population 3 is the one that matters here, and it is deliberately included even though nothing
 * "documents" it. Auditing only what a thing claims about itself is how a console ends up
 * looking like a shell and behaving like a vending machine.
 */
'use strict';
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '../../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
               '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, buf) => {
        if (e) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        res.end(buf);
    });
});

// 1. the console's own contract, from _cmdHelp
const ADVERTISED = ['lehelp', 'pass', 'link', 'tm', 'tc SAFE_MODE', 'frames', 'ranging', 'sdls'];
// 2. the page copy: "Network tooling (nmap, tcpdump, dig) works here too"
const PAGE_PROMISED = ['nmap 10.0.0.0/24', 'tcpdump', 'dig hexworth.com', 'whois hexworth.com',
                       'host hexworth.com', 'traceroute 8.8.8.8', 'sechelp'];
// 3. what a `user@host:~$` prompt implies to anyone who has used a terminal
const PROMPT_IMPLIED = ['ls', 'pwd', 'cat', 'cd', 'whoami', 'help', 'clear'];

const DEAD = /command not found|not recognized|unknown command/i;

let pass = 0, fail = 0;
const results = [];
function check(group, cmd, out) {
    const dead = DEAD.test(out) || !out.trim();
    results.push({ group, cmd, dead, out: out.replace(/\s+/g, ' ').slice(0, 70) });
    if (dead) { fail++; console.log(`  FAIL  [${group}] ${cmd}  -> ${out.replace(/\s+/g,' ').slice(0,58) || '(no output)'}`); }
    else { pass++; console.log(`  PASS  [${group}] ${cmd}`); }
}

(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const port = server.address().port;
    const browser = await puppeteer.launch({ headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message).slice(0, 120)));
    await page.evaluateOnNewDocument(() => {
        try { localStorage.setItem('hexworth_house', 'cloud'); } catch (e) {}
    });
    await page.goto(`http://127.0.0.1:${port}/arena/boxes/le-01-cold-horizon/console.html`,
                    { waitUntil: 'networkidle0', timeout: 40000 });
    await new Promise(r => setTimeout(r, 1500));

    // The console must at least have loaded. A dead terminal would make every command "fail"
    // for one reason, which is a different bug and must not be reported as 20.
    const alive = await page.evaluate(() =>
        typeof LagrangeTerminal !== 'undefined' &&
        !/Console failed to load/.test(document.getElementById('terminalOutput').textContent));
    if (!alive) {
        console.log('  FAIL  the console did not load at all — every command below would be noise');
        await browser.close(); server.close(); process.exit(1);
    }

    async function run(cmd) {
        await page.evaluate(() => { document.getElementById('terminalOutput').innerHTML = ''; });
        await page.click('#commandInput');
        await page.type('#commandInput', cmd);
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 260));
        return page.evaluate(() => document.getElementById('terminalOutput').textContent || '');
    }

    console.log('\n--- Lagrange ground segment console: every advertised command ---\n');
    for (const c of ADVERTISED)      check('lehelp', c, await run(c));
    console.log('');
    for (const c of PAGE_PROMISED)   check('page copy', c, await run(c));
    console.log('');
    for (const c of PROMPT_IMPLIED) {
        /* `clear` is the one command whose success is the ABSENCE of output: its effect is on
           the transcript, not in it. The generic "empty output means dead" rule is exactly
           backwards for it, and the first run of this harness reported a working clear as a
           failure. Asserted on the transcript instead. */
        if (c === 'clear') {
            await run('lehelp');                       // put something in the transcript first
            const beforeLen = await page.evaluate(() =>
                (document.getElementById('terminalOutput').textContent || '').length);
            await page.click('#commandInput');
            await page.type('#commandInput', 'clear');
            await page.keyboard.press('Enter');
            await new Promise(r => setTimeout(r, 260));
            const afterLen = await page.evaluate(() =>
                (document.getElementById('terminalOutput').textContent || '').length);
            const ok = beforeLen > 0 && afterLen === 0;
            if (ok) { pass++; console.log('  PASS  [prompt implies] clear'); }
            else { fail++; console.log(`  FAIL  [prompt implies] clear  -> ${beforeLen} chars -> ${afterLen}`); }
            results.push({ group: 'prompt implies', cmd: 'clear', dead: !ok, out: `${beforeLen}->${afterLen}` });
            continue;
        }
        check('prompt implies', c, await run(c));
    }

    /* ── DOES THE HELP TEXT MATCH THE BEHAVIOUR? ──────────────────────────────────────
       The population checks above ask "does this command answer". They cannot catch a console
       whose help PROSE promises something the console refuses, because both halves pass on
       their own: lehelp answers, and ls answers (with a refusal). Chris found exactly that —
       _cmdHelp said "ls, cat, grep ... work as usual" while _executeFallback rejected all
       three, which is the same "it lied about what works" bug this file was written for,
       sitting inside the fix.

       So: take every command name lehelp mentions in prose, run it, and fail on any that the
       console then refuses. A manual that disagrees with the machine is a defect in the manual. */
    console.log('\n--- help text vs actual behaviour ---\n');
    const helpText = await run('lehelp');
    const mentioned = [...new Set((helpText.match(/\b(ls|cat|grep|cd|pwd|head|tail|find|nmap|tcpdump|dig|whois|host|traceroute|nc|mtr|arp|route)\b/g) || []))];
    if (!mentioned.length) {
        console.log('  (lehelp mentions no tool names in prose)');
    }
    for (const c of mentioned) {
        const out = await run(c === 'nmap' ? 'nmap 10.0.0.0/24' : c);
        const refused = /not a shell|command not found/i.test(out);
        if (refused) { fail++; console.log(`  FAIL  lehelp promises "${c}" but the console refuses it`); }
        else { pass++; console.log(`  PASS  lehelp promises "${c}" and it works`); }
        results.push({ group: 'help vs behaviour', cmd: c, dead: refused, out: '' });
    }

    console.log(`\n=== page errors (${errors.length}) ===`);
    if (errors.length) console.log('  ' + [...new Set(errors)].join('\n  '));

    const byGroup = {};
    results.forEach(r => {
        byGroup[r.group] = byGroup[r.group] || { ok: 0, dead: 0 };
        byGroup[r.group][r.dead ? 'dead' : 'ok']++;
    });
    console.log('\n--- by population ---');
    Object.keys(byGroup).forEach(g =>
        console.log(`  ${g.padEnd(16)} ${byGroup[g].ok} answer, ${byGroup[g].dead} dead`));

    console.log(`\n${pass}/${pass + fail} commands answer`);
    await browser.close(); server.close();
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
