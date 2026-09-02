#!/usr/bin/env node
/**
 * doc-examples.test.js
 *
 * @catalog what    Runs every shell example printed in the Hex OS FAQ against the real shell and
 * @catalog what    fails if any of them errors. Documented examples must actually work.
 * @catalog run     node _tools/hexos/doc-examples.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * I wrote a student-facing changelog and FAQ describing the case-insensitivity work, and used
 * `RUN ARCTIC` as the headline example of the headline feature. There is no app id `arctic`; it is
 * `arctic-cli`. Typing the example verbatim produces "no app called ARCTIC". Two of the three
 * examples in that one sentence were broken, and the FAQ's worked transcripts showed a completion
 * list of 3 where the shell prints 6, and 2 where it prints 6.
 *
 * None of it was a code bug. The shell was correct. I composed the examples from what I intended
 * the feature to do instead of typing them, which is the same failure as every other one in this
 * chain, landing this time in the copy a student reads first. A reviewer caught it before it
 * shipped; the auto-popping What's New modal would have put it in front of every returning
 * student.
 *
 * My own live probe missed it, and that is the sharper lesson: it asserted
 * `/arctic|arena|armory/` against the Tab output, which MATCHED `arctic-cli` and reported success
 * for an example that does not work. A loose pattern turns "I verified this" into "I verified
 * something adjacent to this".
 *
 * So the examples are no longer trusted to prose review. They are extracted from the FAQ itself
 * and executed. If someone edits the FAQ to show a command that does not work, or the shell
 * changes so a documented command stops working, this fails.
 *
 * WHAT COUNTS AS FAILURE: any of the shell's own "I could not do that" messages. Those strings are
 * listed in ERRORS below and are the exact ones the shell emits, not paraphrases.
 */

'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const FAQ = path.join(APP, 'hex/faq.html');
const PORT = 9231;

let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; documented examples cannot be executed. Refusing to fake a pass.');
    process.exit(2);
}

// The shell's actual failure messages. If the shell's wording changes these must change with it,
// which is deliberate: a gate that stops recognising failure is worse than no gate.
const ERRORS = [
    'no app called', 'nothing matched', 'no such place', 'is not a command',
    'no manual page', 'no lab or session called', 'is a category, not an app',
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };

/* Pull every command out of the FAQ's <pre> blocks. The convention on that page is
 * `hex&gt; <b>the command</b>`, which is also how a student reads it, so parsing exactly that
 * keeps the gate honest: it tests what is displayed, not a list maintained beside it.
 *
 * THREE KINDS of example live on that page, and conflating them is how the first version of this
 * gate reported four false failures:
 *   ENTER  an ordinary command. Must not produce one of the shell's failure messages.
 *   TAB    a partial line ending in the ⇥ glyph. Pressing Enter on it is meaningless; `RUN AR`
 *          SHOULD say "no app called AR", because AR is not an app, it is a prefix.
 *   ERROR  a deliberate demonstration of a failure message, like `run arctic` showing the
 *          did-you-mean. Here the error IS the documented behaviour, so absence-of-error is
 *          exactly the wrong assertion.
 * An ERROR example is recognised by the FAQ block itself printing one of the failure strings
 * underneath the command; in that case the gate asserts the shell still says that, which is
 * stronger than the generic check and is what would have caught my broken examples. */
function examplesFromFaq() {
    const html = fs.readFileSync(FAQ, 'utf8');
    const dec = (s) => s.replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
    const out = [];
    for (const blk of html.matchAll(/<pre>([\s\S]*?)<\/pre>/g)) {
        // Keep the RAW markup per line. The command is whatever sits inside <b>; anything after it
        // on the same line is a <span class="muted"> annotation for the reader, not shell output.
        // Stripping tags first merged those annotations into the command and produced nonsense
        // like `ls   categories, and how many apps in each` for 6 of 11 examples.
        const rawLines = blk[1].split('\n');
        for (let i = 0; i < rawLines.length; i++) {
            if (!/hex&gt;/.test(rawLines[i])) continue;
            const bm = rawLines[i].match(/<b>([^<]+)<\/b>/);
            if (!bm) continue;
            const raw = dec(bm[1]).trim();
            if (!raw) continue;
            // Output is the following lines up to the next prompt, minus muted annotations.
            const body = [];
            for (let j = i + 1; j < rawLines.length && !/hex&gt;/.test(rawLines[j]); j++) {
                const t = dec(rawLines[j].replace(/<span class="muted">[\s\S]*?<\/span>/g, '')).trim();
                if (t) body.push(t);
            }
            // From the RAW line, not from `raw`: the FAQ writes `<b>RUN AR</b>⇥`, so the glyph sits
            // OUTSIDE the bold span and never appears in the extracted command.
            const isTab = /<\/b>\s*⇥/.test(rawLines[i]);
            const cmd = raw.replace(/⇥\s*$/, '').trim();
            const shownError = ERRORS.find((e) => body.join(' ').toLowerCase().includes(e));
            out.push({ cmd, kind: isTab ? 'TAB' : (shownError ? 'ERROR' : 'ENTER'), shownError, body });
        }
    }
    return out;
}

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});
srv.on('error', (e) => {
    console.error(`  harness could not bind ${PORT}: ${e.code || e.message}. Nothing was verified.`);
    process.exit(1);
});

let pass = 0, fail = 0;
const chk = (n, c, d) => {
    c ? pass++ : fail++;
    console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '\n         -> ' + String(d).replace(/\n/g, '\n            ').slice(0, 300)}`);
};

srv.listen(PORT, '127.0.0.1', async () => {
    const cmds = examplesFromFaq();
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    try {
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
        await pg.goto(`http://127.0.0.1:${PORT}/hex/`, { waitUntil: 'networkidle0' });
        await new Promise((r) => setTimeout(r, 1500));

        /* If the manifest never loaded, every command below could "pass" by failing differently,
           so prove the shell is usable BEFORE trusting any result from it.
           Checked by OBSERVING `ls`, not by reading a global. My first version tested
           `window.APPS`, which is always undefined: APPS is a `var` inside the page's IIFE, so it
           is a lexical binding and not a window property. That is the same trap logged as
           BUG-247, committed here inside the very gate written to stop me asserting things I had
           not observed. It reported the shell broken while all 23 other assertions passed. */
        await pg.evaluate(() => { document.getElementById('out').innerHTML = '';
                                  document.getElementById('cmd').value = ''; });
        await pg.click('#cmd');
        await pg.type('#cmd', 'ls');
        await pg.keyboard.press('Enter');
        await new Promise((r) => setTimeout(r, 900));
        const probe = await pg.evaluate(() => document.getElementById('out').innerText.trim());
        chk('the shell loaded its manifest (so the results below mean something)',
            /\d+\s+apps?|categor|house/i.test(probe) && !/still loading/i.test(probe), probe.slice(0, 120));

        chk('the FAQ actually contains runnable examples', cmds.length >= 3, `${cmds.length} found`);

        for (const ex of cmds) {
            // Back to a known page first. `run` LAUNCHES, which means it navigates away, so the
            // previous command may have left us on a course page with no #out at all. The first
            // version of this loop crashed on `run az-104` reading innerText of null, which was
            // the example SUCCEEDING.
            if (!/\/hex\/$|\/hex\/index\.html$/.test(await pg.evaluate(() => location.pathname))) {
                await pg.goto(`http://127.0.0.1:${PORT}/hex/`, { waitUntil: 'networkidle0' });
                await new Promise((r) => setTimeout(r, 1200));
            }
            await pg.evaluate(() => { document.getElementById('out').innerHTML = '';
                                      document.getElementById('cmd').value = ''; });
            await pg.click('#cmd');
            await pg.type('#cmd', ex.cmd);

            if (ex.kind === 'TAB') {
                await pg.keyboard.press('Tab');
                await new Promise((r) => setTimeout(r, 700));
                const st = await pg.evaluate(() => ({ v: document.getElementById('cmd').value,
                                                      o: document.getElementById('out').innerText.trim() }));
                // A documented Tab example must DO something: either fill the line in or list
                // candidates. Producing neither is the exact defect that shipped silent.
                const acted = st.v !== ex.cmd || st.o.length > 0;
                chk(`FAQ Tab example does something: ${ex.cmd}`, acted, JSON.stringify(st));
                // And every candidate the FAQ prints must really be offered, which is what would
                // have caught a transcript listing ids that do not exist.
                for (const want of ex.body.join(' ').split(/\s+/).filter((w) => /^[a-z0-9][\w-]{2,}$/i.test(w))) {
                    chk(`  -> offers "${want}"`, st.o.includes(want) || st.v.includes(want), st.o || st.v);
                }
                continue;
            }

            await pg.keyboard.press('Enter');
            await new Promise((r) => setTimeout(r, 900));

            // Navigating away IS the success condition for `run`: the app opened.
            if (!/\/hex\/$|\/hex\/index\.html$/.test(await pg.evaluate(() => location.pathname))) {
                const where = await pg.evaluate(() => location.pathname);
                chk(`FAQ example works: ${ex.cmd}`, true, '');
                console.log(`         (launched, now at ${where})`);
                continue;
            }
            const out = await pg.evaluate(() => document.getElementById('out').innerText.trim());
            if (ex.kind === 'ERROR') {
                // The FAQ demonstrates this failure on purpose, so absence-of-error would be the
                // wrong assertion. Assert the shell STILL says what the page claims it says.
                chk(`FAQ error example still behaves as documented: ${ex.cmd}`,
                    out.toLowerCase().includes(ex.shownError),
                    `expected "${ex.shownError}" | got: ${out}`);
                continue;
            }
            const bad = ERRORS.find((e) => out.toLowerCase().includes(e));
            chk(`FAQ example works: ${ex.cmd}`, !bad, out);
        }
    } finally {
        await b.close();
        srv.close();
    }
    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
});
