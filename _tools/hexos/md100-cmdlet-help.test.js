#!/usr/bin/env node
/**
 * md100-cmdlet-help.test.js
 *
 * @catalog what    Runs every example in the MD-100 midterm sim's Get-Help pages through the sim's
 * @catalog what    OWN parser and fails if any of them is rejected. Documented syntax must work.
 * @catalog run     node _tools/hexos/md100-cmdlet-help.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * The operator hit this lab at 24 of 25 objectives, stuck on "Disable Lock Screen ads via
 * Registry". They were not wrong: they were using `reg add`, the idiomatic cmd.exe form that most
 * MD-100 material shows, and this sim implements no `reg` command at all. It answered "not
 * recognized", which tells a student their correct answer is incorrect. The cmdlet that DOES work,
 * Set-ItemProperty, appeared in the `help` list by name with no syntax anywhere, so there was no
 * way in the product to learn it wanted `-Value 0`.
 *
 * The fix is a Get-Help layer. The risk a Get-Help layer creates is a NEW instance of the bug it
 * is fixing: help that documents syntax the parser does not accept is worse than no help, because
 * the student now has a confident wrong answer instead of an unknown. That failure has occurred on
 * this platform already, in the Hex OS FAQ, where an example nobody had typed shipped with a
 * nonexistent app id in it.
 *
 * So the examples are not reviewed, they are EXECUTED: the page is served, opened in a browser,
 * and each example is typed into the sim's OWN command handler, with the terminal's output
 * deciding. Nothing here re-implements the parser. An earlier draft of this file claimed exactly
 * that while doing string matching with a private copy of extractParam, which a QC hook caught,
 * and which produced two false failures of its own because the copy did not know `-NoPassword`
 * takes no value.
 *
 * IT ALSO CHECKS THE EXAMPLES DO NOT HAND OVER THE GRADED ANSWERS. The design decision behind
 * choosing Get-Help over a cmdlet builder was that a builder performs the examinable skill for the
 * student. An example that IS the objective's answer would reintroduce that through the back door,
 * so `Set-ItemProperty` is documented against Remote Desktop rather than the lock-screen key the
 * midterm asks for. This asserts that no example completes an objective.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const LAB = path.resolve(__dirname, '../../_app/houses/forge/md-100/labs/forge-md100-midterm-sim.lab.html');

let pass = 0, fail = 0;
const chk = (n, c, d) => {
    c ? pass++ : fail++;
    console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 150)}`);
};

const src = fs.readFileSync(LAB, 'utf8');

/* Pull CMDLET_HELP out of the page by evaluating just that declaration. Parsing it with a regex
   would be a second, drifting definition of the table; evaluating the real one cannot drift. */
function extractTable() {
    const start = src.indexOf('const CMDLET_HELP = {');
    if (start === -1) return null;
    // Balance braces from the opening one so the extraction survives nested objects and arrays.
    const open = src.indexOf('{', start);
    let depth = 0, i = open;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    // eslint-disable-next-line no-new-func
    return new Function('return ' + src.slice(open, i))();
}

const HELP = extractTable();
chk('CMDLET_HELP is present and parses', HELP && Object.keys(HELP).length > 0, 'not found');
if (!HELP) { console.log(`\n  ${pass}/${pass + fail} passed`); process.exit(1); }

chk('every cmdlet documented has a syntax line and an example',
    Object.values(HELP).every((h) => h.syntax && h.example && h.synopsis),
    Object.keys(HELP).filter((k) => !HELP[k].example).join(', '));

/* THE POINT OF THE FILE. Every documented cmdlet must have a real branch in the parser. A help
   page for a cmdlet the sim cannot run is exactly the confident-wrong-answer failure this exists
   to prevent, and it is the shape a future edit is most likely to introduce. */
for (const name of Object.keys(HELP)) {
    const handled = src.includes(`cmdName === '${name}'`)
        || src.includes(`lower === '${name}'`)
        || src.includes(`cmdName === '${name.split('-')[0]}'`);
    chk(`the parser implements ${name}`, handled, 'documented but no branch in the command handler');
}

/* EVERY EXAMPLE IS TYPED INTO THE REAL TERMINAL. The first version of this file asserted that in
   its own header while actually doing string matching against the source with a re-implemented
   copy of the parser's extractParam. A QC hook caught the overclaim, and it was the same defect
   class this gate exists to prevent, committed in the gate itself: a confident claim about
   behaviour that nothing executed. It also produced two false failures, because the private copy
   of extractParam did not know that `-NoPassword` is a valueless switch.
   Now the page is served and driven in a browser, the example is typed at the prompt, and the
   terminal's own output decides. No second implementation of anything. */
async function runExamplesInBrowser(HELP) {
    let puppeteer;
    try { puppeteer = require('puppeteer'); } catch (e) {
        console.error('  puppeteer not installed; documented examples cannot be executed. Refusing to fake a pass.');
        process.exit(2);
    }
    const http = require('http');
    const APP = path.resolve(__dirname, '../../_app');
    /* PORT 0: assigned by the OS at listen time. A hardcoded port makes this suite unsafe to
   run alongside another, which produced phantom failures elsewhere in this directory. */
let PORT = 0;
    const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
                   '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' };
    const srv = http.createServer((q, r) => {
        let p = decodeURIComponent(q.url.split('?')[0]);
        if (p.endsWith('/')) p += 'index.html';
        const f = path.join(APP, p);
        if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
        r.end(fs.readFileSync(f));
    });
    await new Promise((res) => srv.listen(0, '127.0.0.1', res));
    PORT = srv.address().port;   // real port, before any URL is built from it

    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    await pg.setRequestInterception(true);
    pg.on('request', (r) => {
        const u = r.url();
        if (/AccessGuard\.js$/.test(u)) {
            return r.respond({ status: 200, contentType: 'text/javascript',
                body: 'window.AccessGuard={require:function(){},redirect:function(){}};' });
        }
        if (!u.startsWith(`http://127.0.0.1:${PORT}`)) return r.abort();
        r.continue();
    });
    await pg.goto(`http://127.0.0.1:${PORT}/houses/forge/md-100/labs/forge-md100-midterm-sim.lab.html`,
                  { waitUntil: 'networkidle0', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1500));

    const hasTerminal = await pg.evaluate(() => !!document.getElementById('terminalOutput'));
    chk('the sim terminal is present, so the results below mean something', hasTerminal, 'no #terminalOutput');

    for (const [name, h] of Object.entries(HELP)) {
        /* An entry may opt out of execution ONLY by declaring why. cipher does, because this sim
           accepts exactly one path for it and that path is the graded answer, so a runnable
           example would hand over the objective. Requiring the reason keeps the exemption from
           becoming a quiet way to dodge this check. */
        if (h.syntaxOnly) {
            chk(`${name}: opts out of execution and says why`, !!h.why, 'syntaxOnly without a why');
            continue;
        }
        const out = await pg.evaluate((cmdText) => {
            const box = document.getElementById('terminalOutput');
            if (box) box.innerHTML = '';
            // Call the page's own handler. Nothing here re-implements parsing.
            if (typeof processCommand !== 'function') return '__NO_HANDLER__';
            processCommand(cmdText);
            /* ASK THE TERMINAL WHICH LINES ARE ERRORS instead of pattern-matching its prose.
               addLine(text, cls) stamps the class onto the element, so the sim states this
               directly. My first version regexed the text for /error/i and failed
               `Repair-Volume`, whose SUCCESS output is "No errors found." A detector that reads
               the artifact cannot be fooled by a word appearing in a sentence. */
            const errs = [...box.querySelectorAll('.terminal-line.error')].map((n) => n.textContent);
            return JSON.stringify({ errors: errs, text: box.innerText.trim().slice(0, 160) });
        }, h.example);

        if (out === '__NO_HANDLER__') {
            chk(`${name}: example is executable`, false, 'no command handler found on the page');
            continue;
        }
        const res = JSON.parse(out);
        chk(`${name}: its documented example is accepted by the parser`,
            res.errors.length === 0, res.errors[0] || res.text);
    }

    await b.close();
    srv.close();
}

/* NO EXAMPLE MAY COMPLETE A GRADED OBJECTIVE. This is the line that keeps Get-Help from becoming
   the cmdlet builder it was chosen over: teach the shape, never hand over the answer. The
   lock-screen registry value is the objective the operator was stuck on, so it is the specific
   thing an example must not contain. */
const FORBIDDEN = [
    ['rotatinglockscreen', 'the lock-screen objective (c5)'],
    ['192.168.1.100', 'the static IP objective (n1)'],
    ['8.8.8.8', 'the DNS objective (n2)'],
    ['hexworth.local', 'the domain-join objective'],
    ['shareddata', 'the share objective (da2)'],
    ['confidential', 'the EFS objective (da3)'],
];
for (const [needle, which] of FORBIDDEN) {
    // syntaxOnly entries use a placeholder, so they cannot leak an answer by construction.
    const leak = Object.entries(HELP).find(([, h]) =>
        !h.syntaxOnly && h.example.toLowerCase().includes(needle));
    chk(`no example gives away ${which}`, !leak, leak ? `${leak[0]} example contains "${needle}"` : '');
}

/* The cmd.exe equivalents map must name cmdlets that actually have help pages, or the redirect
   sends a stuck student to a second dead end. */
const eqStart = src.indexOf('const CMD_EXE_EQUIVALENTS = {');
if (eqStart !== -1) {
    const open = src.indexOf('{', eqStart);
    let depth = 0, i = open;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    // eslint-disable-next-line no-new-func
    const EQ = new Function('return ' + src.slice(open, i))();
    chk('reg is redirected, since that is what the operator actually typed', !!EQ.reg, Object.keys(EQ).join(','));
    /* Validates EVERY cmdlet named in the advice, not just the first word, and strips the
       punctuation of a list like "Initialize-Disk, New-Partition and Format-Volume". Checking
       only the first token both missed the later names and reported a false failure on the
       trailing comma of the first one. */
    for (const [tool, advice] of Object.entries(EQ)) {
        const named = String(advice).split(/[\s,]+/)
            .map((w) => w.replace(/[^A-Za-z-]/g, '').toLowerCase())
            .filter((w) => w.indexOf('-') !== -1);
        chk(`${tool} names at least one cmdlet`, named.length > 0, String(advice));
        const orphan = named.filter((n) => !HELP[n]);
        chk(`${tool} redirects only to cmdlets that have a help page`,
            orphan.length === 0, `no Get-Help entry for: ${orphan.join(', ')}`);
    }
} else {
    chk('CMD_EXE_EQUIVALENTS is present', false, 'not found');
}

runExamplesInBrowser(HELP).then(() => {
    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
}).catch((e) => {
    console.error('  harness error, nothing verified:', e.message);
    process.exit(2);
});
