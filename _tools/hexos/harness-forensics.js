'use strict';
/**
 * @catalog what    Shared harness forensics for the puppeteer-driven hexos suites. Records
 * @catalog what    renderer crashes and browser death, so a dead browser stops reading as a
 * @catalog what    product regression in deploy.sh and post-verify.
 * @catalog run     require()d by a suite; never run directly
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS (taskboard 345, then 352). Eleven hexos suites drive real Chromium. When one
 * dies mid-run the suite dies with a stack that names nothing useful, and both callers then
 * report it as a PRODUCT REGRESSION -- deploy.sh gate 3.7 said "the hex shell's session commands
 * regressed" on ANY nonzero rc. A phantom failure that blames the product is worse than no test:
 * it trains whoever sees it to re-run until green, which is how a real regression gets waved
 * through. hex-shell-process.test.js carries the full version of this; this is the shared, much
 * smaller form for the other ten.
 *
 * THE CONTRACT, and every clause of it was paid for:
 *
 *   EXIT CODE IS ALWAYS 1, NEVER 2. Node's own default for both unhandledRejection and
 *   uncaughtException is 1 (measured), so a suite using this behaves exactly as it does today.
 *   Exit 2 is NOT available: SEVEN call sites in post-verify.sh read rc 2 as "puppeteer
 *   unavailable, skip" with NO divergence flag, so emitting 2 here would make a harness fault
 *   silently skip POST-DEPLOY verification against live production.
 *
 *   THE LAST LINE MUST SAY "FAIL". Both callers filter this output before a human sees it:
 *   deploy.sh keeps `tail -3`, post-verify keeps `grep -E "FAIL|passed" | tail -5`. A plain dump
 *   is truncated by the first and dropped ENTIRELY by the second. The summary is therefore last
 *   (beats the tail) and contains FAIL (beats the grep), which is also the marker deploy.sh and
 *   post-verify branch on to say "harness fault" instead of "regressed".
 *
 *   A FAULT AFTER A CLEAN TALLY IS DIFFERENT NEWS. Suites print their tally BEFORE tearing the
 *   browser down, and browser.close() has been measured hanging and failing after a dead target.
 *   Claiming "nothing was verified" there would be false in the one sentence an operator acts on,
 *   so call completed() before teardown and the report says the suite WAS verified.
 *
 * WHY page.on('error') AND NOT isClosed()/connected ALONE. Measured under a real renderer OOM:
 * page.on('error') fired "Page crashed!" while isClosed() stayed FALSE and browser.connected
 * stayed TRUE. It is the only signal that sees that failure mode. The rival signal --
 * browser.connected=false -- comes from a single self-inflicted kill, so this keeps BOTH rather
 * than trading the well-evidenced one for the weakly-evidenced one.
 *
 * DELIBERATELY NOT HERE: page labels, a page Map, and a targetcreated net. Eight of the ten
 * target suites drive at most ONE page (three go through browser.createBrowserContext() +
 * ctx.newPage()), so "which of six pages died" is a problem they do not have. That machinery
 * lives in hex-shell-process.test.js, which does have six.
 *
 * KNOWN GAP, tracked on 352: this handles a fault that THROWS. It does nothing for
 * browser.close() HANGING, where there is no exception, no exit code and no file -- the process
 * simply sits. A gate that hangs is worse than one that fails.
 *
 * USAGE
 *   const F = require('./harness-forensics').arm({ dir: __dirname, suite: 'doc-examples' });
 *   const b = F.browser(await puppeteer.launch(...));
 *   const pg = F.watch(await b.newPage());          // or F.watch(await ctx.newPage())
 *   ...
 *   F.completed(`${pass} passed, ${fail} failed`);  // AFTER the last assertion, BEFORE teardown
 *
 * ADOPTING THIS IN A NEW SUITE -- REQUIRED, NOT OPTIONAL.
 *
 * completed() HAS NO OBSERVABLE EFFECT ON A PASSING RUN. It only changes the fault path, which
 * is rare by construction. So a suite can pass a hundred clean runs with completed() placed one
 * line too early, inside a branch that misses a success path, or after an early return -- and
 * nothing will ever surface it until a real fault lands in the gap, at which point the report
 * makes a CONFIDENT, FALSE claim about whether the suite was verified. That is the failure mode
 * this module exists to prevent, reintroduced as a wiring mistake instead of an exit-code one.
 * Clean runs are not evidence that the wiring is right. Proof requires deliberately faulting it:
 *
 *   1. Copy the suite. If it resolves paths from __dirname, pin them absolute or the copy dies
 *      before your injection and you will read a crash as a pass. (That happened; the tell was
 *      no tally line in the output.)
 *   2. Inject `Promise.reject(new Error('probe'))` BEFORE the completed() call.
 *      EXPECT: rc=1 and "NOTHING WAS VERIFIED".
 *   3. Inject it AFTER completed(), i.e. in teardown.
 *      EXPECT: rc=1 and "AFTER a completed run (<tally>) -- the suite WAS verified".
 *   4. Confirm BOTH survive the callers' filters: `tail -3`, and `grep -E "FAIL|passed"`.
 *   5. Placement differs per suite. hex-shell-process prints its tally BEFORE teardown;
 *      doc-examples tears down in `finally` and prints AFTER, so completed() goes at the end of
 *      the try. Copying a line position from another suite is not a substitute for step 2/3.
 *
 * Both directions, every time. A branch tested one way is how a negative assertion passes
 * against the wrong failure.
 */
const fs = require('fs');
const path = require('path');

/* Read a field off a thrown value without trusting it. The value reaching an uncaughtException
   handler is NOT necessarily a plain Error: CDP protocol errors and session objects are the kind
   of malformed input a real crash produces, and a getter that throws (or a hostile toString) would
   make THIS handler throw while it is the registered handler. Node then falls through to its fatal
   default -- no dump, no FAIL line, no classification, just the anonymous stack this module exists
   to prevent, in the one case most likely to be malformed. The file write was already guarded; the
   field reads that build the report were not. */
function str(fn, fallback) {
    try {
        const v = fn();
        if (v === undefined || v === null) return fallback;
        const s = String(v);                      // can itself throw on a hostile toString
        return s.length ? s : fallback;
    } catch (e) { return fallback; }
}

function arm(opts) {
    const dir = (opts && opts.dir) || __dirname;
    const suite = (opts && opts.suite) || path.basename(process.argv[1] || 'suite', '.js');
    const crashes = [];         // renderer crashes, in the order they happened
    let browserRef = null;
    let completedTally = null;

    // A crashed renderer is silent unless something listens: no throw, no close event, and
    // isClosed() keeps returning false. One listener per page, no bookkeeping beyond that.
    const watch = (page) => {
        try {
            page.on('error', (e) => {
                const m = str(() => e.message, '') || str(() => e, 'unprintable');
                crashes.push(m.split('\n')[0]);
            });
        } catch (e) {
            /* LOUD, not silent. Arming must never BE the fault, but a swallowed failure here is
               the "looks armed, silently isn't" shape: crashes[] stays empty forever and every
               later report says "renderer crashes: none" -- reassuring, and recording nothing.
               That exact shape has already been fixed twice on this work, so it does not get to
               reappear in the shared module meant to generalise the lesson. */
            console.error(`  WARNING: harness-forensics could not watch a page in ${suite}: ` +
                          `${str(() => e.message, 'unknown')}. Renderer crashes will NOT be recorded.`);
        }
        return page;
    };

    const state = () => {
        let connected = '?';
        try { connected = String(browserRef && browserRef.connected); } catch (e) { /* dead */ }
        return connected;
    };

    const diagnose = (kind) => (e) => {
        // pid-suffixed: these suites are run concurrently and two faults must not overwrite
        // each other's evidence. The path is printed, so a unique name costs the reader nothing.
        // Nothing sweeps these; they are gitignored via .gitignore:48 `_tools/` and a fault is
        // rare by construction. `ls _tools/hexos/.harness-fault-*.log` is the whole inventory.
        const dump = path.join(dir, `.harness-fault-${suite}-${process.pid}.log`);
        // Every read below is guarded: see str(). A reporter that throws is not a reporter.
        const msg = str(() => e.message, '') || str(() => e, '(unprintable value)');
        const stack = str(() => e.stack, msg);
        const crashList = crashes.length ? crashes.join(' | ') : 'none';
        const body = [
            `${kind}: ${msg}`, '',
            stack, '',
            `suite=${suite}`,
            `renderer crashes: ${crashList}`,
            `browser.connected=${state()}`,
            `completed: ${completedTally || 'NO -- faulted before the tally'}`,
        ].join('\n');
        try { fs.writeFileSync(dump, body + '\n'); } catch (x) { /* reporter must not be the fault */ }

        console.error(`\n  ${kind}: ${msg.split('\n')[0]}`);
        console.error(`  HARNESS FORENSICS (taskboard 345/352): suite=${suite}`);
        console.error(`  renderer crashes: ${crashList}`);
        console.error(`  browser.connected=${state()}`);
        // Last three lines are what deploy.sh's `tail -3` keeps; most useful last.
        console.error(completedTally
            ? `  FAIL  harness fault AFTER a completed run (${completedTally}) -- the suite WAS verified; the fault is in teardown.`
            : `  FAIL  harness fault: NOTHING WAS VERIFIED. This is not a verdict on the product.`);
        console.error(`  FAIL  forensics written to ${dump}`);
        process.exit(1);        // node's own default for both. Deliberately unchanged.
    };

    process.on('unhandledRejection', diagnose('UNHANDLED REJECTION'));
    process.on('uncaughtException', diagnose('UNCAUGHT EXCEPTION'));

    return {
        watch,
        browser: (b) => { browserRef = b; return b; },
        completed: (tally) => { completedTally = String(tally); },
    };
}

module.exports = { arm };
