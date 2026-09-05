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
/* PORT 0: the OS assigns a free port at listen time, set in the listen callback below.
   These suites each hardcoded a port, which makes them unsafe to run concurrently with
   each other or with themselves. Two of them were already colliding on 9311. Reproduced
   directly: two instances of one suite at once, one passed and the other died with
   EADDRINUSE. Phantom failures are worse than no test, because they train whoever sees
   them to re-run until green. */
let PORT = 0;

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
/* Prompt detection, hardened twice.
 *
 * It used to match the literal `hex&gt;`. A reviewer defeated that with a `$` prompt, so the
 * per-block coverage check was added. He then defeated THAT with a full-width `＞` (U+FF1E) on a
 * new line inside a block that already had legitimate prompts: the block still yielded examples,
 * the prompt count still agreed, and a false claim rode along invisibly.
 *
 * Adding U+FF1E to a list would just be guessing the next disguise. Two changes instead:
 *   normalisePrompt() folds the lookalikes to ASCII before matching, so a visually-identical
 *   prompt IS a prompt; and
 *   the conformance check below fails on ANY bolded command line inside a <pre> that the parser
 *   did not turn into an example, whatever precedes it. That one does not depend on predicting
 *   the disguise at all, which is the only reason it closes the class. */
const PROMPT_LOOKALIKES = {
    '\uFF1E': '>',   // ＞ fullwidth greater-than
    '\uFE65': '>',   // ﹥ small greater-than
    '\u203A': '>',   // › single right angle quote
    '\u3009': '>',   // 〉 right angle bracket
    '\u2265': '>',   // ≥ greater-than-or-equal, close enough to read as a prompt
};
function normalisePrompt(line) {
    let out = line.replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    for (const [glyph, ascii] of Object.entries(PROMPT_LOOKALIKES)) {
        out = out.split(glyph).join(ascii);
    }
    return out;
}
/** Does this line present itself to a reader as a shell prompt? */
function looksLikePrompt(line) {
    return /hex\s*>/i.test(normalisePrompt(line));
}

function examplesFromFaq() {
    const html = fs.readFileSync(FAQ, 'utf8');
    const dec = (s) => s.replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
    const out = [];
    let blockIndex = -1;
    for (const blk of html.matchAll(/<pre>([\s\S]*?)<\/pre>/g)) {
        blockIndex++;
        // Keep the RAW markup per line. The command is whatever sits inside <b>; anything after it
        // on the same line is a <span class="muted"> annotation for the reader, not shell output.
        // Stripping tags first merged those annotations into the command and produced nonsense
        // like `ls   categories, and how many apps in each` for 6 of 11 examples.
        const rawLines = blk[1].split('\n');
        for (let i = 0; i < rawLines.length; i++) {
            if (!looksLikePrompt(rawLines[i])) continue;
            const bm = rawLines[i].match(/<b>([^<]+)<\/b>/);
            if (!bm) continue;
            const raw = dec(bm[1]).trim();
            if (!raw) continue;
            // Output is the following lines up to the next prompt, minus muted annotations.
            const body = [];
            for (let j = i + 1; j < rawLines.length && !looksLikePrompt(rawLines[j]); j++) {
                const t = dec(rawLines[j].replace(/<span class="muted">[\s\S]*?<\/span>/g, '')).trim();
                if (t) body.push(t);
            }
            // From the RAW line, not from `raw`: the FAQ writes `<b>RUN AR</b>⇥`, so the glyph sits
            // OUTSIDE the bold span and never appears in the extracted command.
            const isTab = /<\/b>\s*⇥/.test(rawLines[i]);
            const cmd = raw.replace(/⇥\s*$/, '').trim();
            const shownError = ERRORS.find((e) => body.join(' ').toLowerCase().includes(e));
            // Remember which raw lines this example consumed (its prompt plus its output), so a
            // conformance check can tell an UNPARSED command line from bold used as emphasis
            // inside output that WAS parsed.
            const consumed = [blockIndex + ':' + i];
            for (let k = i + 1; k < rawLines.length && !looksLikePrompt(rawLines[k]); k++) {
                consumed.push(blockIndex + ':' + k);
            }
            out.push({ cmd, kind: isTab ? 'TAB' : (shownError ? 'ERROR' : 'ENTER'), shownError, body, blockIndex, consumed });
        }
    }
    return out;
}

/* THE CONVENTION THIS GATE ENFORCES, stated because it is now load-bearing:
 * inside a <pre> block, unmuted text is LITERAL SHELL OUTPUT, and every editorial aside belongs
 * in a <span class="muted">. That is already how the page is written; the gate simply stops it
 * being optional.
 *
 * The first version compared word-by-word and filtered English with a hand-maintained stopword
 * list. Two reviewers broke it from both directions: `run` is both a stopword and a real command,
 * so the gate accused the page of omitting something it plainly showed; and adding one ordinary
 * sentence of commentary produced five spurious failures. A wordlist cannot tell prose from ids.
 * Comparing whole lines can, provided prose is marked as prose, which is why the convention above
 * is enforced rather than guessed at.
 *
 * Returns the transcript lines a block claims the shell prints, normalised for whitespace. */
function transcriptLines(ex) {
    return ex.body
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter((l) => l.length > 0);
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

srv.listen(0, '127.0.0.1', async () => {
    PORT = srv.address().port;
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

        /* COVERAGE FLOOR. `>= 3` against an 11-block page was not a floor, it was a formality: a
           reformat that broke extraction on the newest blocks while three legacy ones still
           parsed would report "ok" at a quarter of real coverage. Tie it to the page instead, so
           the gate fails when it silently stops testing things. A gate that quietly tests nothing
           is worse than no gate. */
        const faqSrc = fs.readFileSync(FAQ, 'utf8');
        const promptCount = faqSrc.split('\n').filter(looksLikePrompt).length;
        chk('every prompt in the FAQ was extracted as an example',
            cmds.length === promptCount, `${cmds.length} extracted vs ${promptCount} prompts on the page`);
        /* AND every <pre> BLOCK must have yielded at least one. Counting prompts alone was not
           enough: a reviewer added a block using a `$` prompt instead of `hex&gt;`, and BOTH the
           extractor and the prompt count missed it identically, so the counts still agreed while
           an untested block sat on the page claiming the opposite of real behaviour. The
           anti-vacuousness check was itself vacuous against a format it did not recognise.
           A block that parses to nothing is now a failure, whatever convention it used. */
        /* THE CHECK THAT DOES NOT GUESS. Every `<b>` inside a `<pre>` is a command being shown to
           a student. If the parser did not turn one into an example, something on that line is a
           prompt convention we do not recognise, and the example is going untested while looking
           tested. This catches `$`, a full-width `＞`, a bare `>`, an emoji, or anything else,
           without anyone having to anticipate it. Both previous bypasses die here regardless of
           the normaliser above. */
        const covered = new Set();
        cmds.forEach((c) => (c.consumed || []).forEach((k) => covered.add(k)));
        const unparsedBold = [];
        let bi = -1;
        for (const blk of faqSrc.matchAll(/<pre>([\s\S]*?)<\/pre>/g)) {
            bi++;
            blk[1].split('\n').forEach((line, li) => {
                // Bold inside a line the parser already consumed is emphasis within output, which
                // is legitimate: the FAQ bolds the suggestion in "did you mean: arctic-cli". Only
                // bold on a line NO example claimed is a command going untested.
                if (/<b>[^<]+<\/b>/.test(line) && !covered.has(bi + ':' + li)) {
                    unparsedBold.push(line.trim().slice(0, 80));
                }
            });
        }
        chk('every bolded command inside a <pre> was parsed as an example',
            unparsedBold.length === 0,
            `unparsed: ${JSON.stringify(unparsedBold.slice(0, 3))}`);

        /* AND NAME THE REAL PROBLEM WHEN IT HAPPENS. A line using an unrecognised prompt gets
           absorbed as the PREVIOUS example's output, so the suite does go red, but it goes red on
           the innocent example above it: injecting `$ <b>run fake</b>` failed the `cd cl` Tab
           assertions with "offers run", which tells a maintainer nothing about what is actually
           wrong. A gate that fails for a reason the reader cannot act on is only half a gate.
           A line that opens with punctuation and then a bolded command is a prompt convention we
           do not know. "did you mean: <b>arctic-cli</b>" and "e.g. <b>run cloud-incubator</b>"
           start with words, so legitimate emphasis inside output is untouched. */
        const foreignPrompts = [];
        for (const blk of faqSrc.matchAll(/<pre>([\s\S]*?)<\/pre>/g)) {
            for (const line of blk[1].split('\n')) {
                if (/^\s*[^\w\s<]{1,3}\s*<b>[^<]+<\/b>/.test(line) && !looksLikePrompt(line)) {
                    foreignPrompts.push(line.trim().slice(0, 70));
                }
            }
        }
        chk('no <pre> line uses a prompt convention this gate does not recognise',
            foreignPrompts.length === 0,
            `unrecognised prompt: ${JSON.stringify(foreignPrompts.slice(0, 3))}`);

        const blockTotal = (faqSrc.match(/<pre>/g) || []).length;
        const parsedBlocks = new Set(cmds.map((c) => c.blockIndex));
        const emptyBlocks = [];
        for (let i = 0; i < blockTotal; i++) if (!parsedBlocks.has(i)) emptyBlocks.push(i);
        chk('every <pre> block yielded at least one runnable example', emptyBlocks.length === 0,
            `blocks ${JSON.stringify(emptyBlocks)} parsed to nothing; unrecognised prompt convention?`);

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
                /* For a TAB example the FIRST body line IS the candidate list the shell prints,
                   so compare that line token-for-token instead of scanning the whole block. My
                   first attempt filtered prose with a stopword list and immediately produced a
                   false failure: `run` is both an English word on that list AND a real command
                   the FAQ does document, so the gate reported the page had omitted something it
                   plainly showed. A wordlist cannot separate prose from ids; the line the shell
                   actually printed can. */
                const documented = (ex.body[0] || '').split(/\s+/)
                    .map((w) => w.replace(/[.,]+$/, ''))
                    .filter((w) => /^[a-z0-9][\w-]{2,}$/i.test(w));
                for (const want of documented) {
                    chk(`  -> offers "${want}"`, st.o.includes(want) || st.v.includes(want), st.o || st.v);
                }
                /* UNDER-DOCUMENTATION IS ALSO A FAILURE, and it was invisible before. A reviewer
                   trimmed this block's documented candidates from 6 to 3 and the suite went from
                   25/25 to 22/22, still green: nothing distinguished "the FAQ now says less" from
                   "nothing changed". Since post-verify branches on exit code alone, a quietly
                   shrinking transcript would drift stale forever without ever turning it red.
                   So the documented list must be the WHOLE list: every candidate the shell prints
                   has to appear on the page. */
                const offered = st.o.split(/\s+/).filter((w) => /^[a-z0-9][\w-]{2,}$/i.test(w));
                /* ORDER IS DOCUMENTED BEHAVIOUR, so it is checked. The page tells the student
                   "manual pages come first, then app ids", and the shell really does rank them
                   that way. A reviewer reversed the whole candidate line and the gate stayed
                   green, because both checks used set membership. A transcript that lists the
                   right things in the wrong order still teaches the wrong thing. */
                if (documented.length && offered.length) {
                    chk('  -> lists candidates in the order the shell prints them',
                        offered.join(' ').startsWith(documented.join(' ')) ||
                        documented.join(' ') === offered.join(' '),
                        `page: ${documented.join(' ')}\n            shell: ${offered.join(' ')}`);
                }
                const undocumented = offered.filter((w) => !documented.includes(w));
                chk(`  -> documents every candidate the shell offers`, undocumented.length === 0,
                    `shell also offers ${JSON.stringify(undocumented)} which the FAQ does not show`);
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
                /* The FAQ demonstrates this failure on purpose, so absence-of-error is the wrong
                   assertion. Assert the shell still says what the page claims.
                   AND ASSERT THE SPECIFICS. The first version checked only that the output
                   contained the generic phrase from ERRORS, and a reviewer proved that vacuous by
                   changing the documented did-you-mean target from `arctic-cli` to the
                   nonexistent `arctic-clique`: still 25/25 green, while the FAQ now told students
                   to type an app that does not exist. The suggestion IS the point of that block,
                   so every concrete token the page prints has to appear in the real output. */
                chk(`FAQ error example still behaves as documented: ${ex.cmd}`,
                    out.toLowerCase().includes(ex.shownError),
                    `expected "${ex.shownError}" | got: ${out}`);
                const flatErr = out.replace(/\s+/g, ' ');
                for (const line of transcriptLines(ex)) {
                    chk(`  -> and still prints: "${line.slice(0, 48)}"`, flatErr.includes(line), out);
                }
                continue;
            }
            const bad = ERRORS.find((e) => out.toLowerCase().includes(e));
            chk(`FAQ example works: ${ex.cmd}`, !bad, out);
            /* AND it must do what the page SAYS it does. The first version checked only for the
               absence of a known error string, so a reviewer added a block claiming `clear`
               "launches the Arctic Linux sandbox and grants instructor access" and the gate passed
               it: `clear` errors on nothing, so absence-of-error was satisfied by a command that
               does something completely different from the claim. Absence of a failure is not
               evidence of the documented success. */
            const flat = out.replace(/\s+/g, ' ');
            for (const line of transcriptLines(ex)) {
                chk(`  -> output matches the page: "${line.slice(0, 48)}"`, flat.includes(line), out);
            }
        }
    } finally {
        await b.close();
        srv.close();
    }
    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
});
