#!/usr/bin/env node
/**
 * nt1-filesystem-commands.test.js
 *
 * @catalog what   Drives NT1's Windows shell commands (dir/cd/type/find/cls) and the
 *                 loopback branch of _checkConnectivity against BOTH copies of the box
 *                 (dispatch + arena). Proves: `dir` only advertises directories `cd` can
 *                 actually enter; the gateway 192.168.1.1 is reachable in-sim during
 *                 HD-7201; loopback answers with the adapter disabled; and no command
 *                 returns null (which Terminal.js turns into a builtin fallthrough).
 * @catalog run    node _tools/hexos/nt1-filesystem-commands.test.js
 * @catalog status TOOL
 *
 * WHY IT EXISTS. HD-7201 told the student to `ping 192.168.1.1` while the sim showed
 * that address nowhere, and `dir` listed a Documents directory that `cd` refused to
 * enter with a bash error. Both were invisible to every existing gate because both
 * printed plausible-looking output. This asserts the behaviour, not the source text.
 *
 * NULL RETURNS ARE THE SUBTLE ONE. Terminal.js treats `null` from a box command as
 * "fall through to the built-in handler", so a command that returns null silently gets
 * the POSIX builtin's behaviour. That is what broke `cls` and what would have broken the
 * new `cd`. Case 8 asserts it directly rather than trusting a code read.
 *
 * Exit 0 = all passed. Exit 1 = a failure.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// NT1_REPO_ROOT lets the harness be pointed at a checkout of the PRE-FIX code, so it can
// be proven to FAIL before it is trusted to pass. A harness that has only ever been run
// against the fixed tree has not demonstrated that it detects anything.
//   git archive <pre-fix-rev> | tar -x -C /tmp/arm && NT1_REPO_ROOT=/tmp/arm node <this>
const REPO = process.env.NT1_REPO_ROOT || path.resolve(__dirname, '../..');
const COPIES = [
    '_app/dispatch/boxes/nt1-network-troubleshoot/config.js',
    '_app/arena/boxes/nt1-network-troubleshoot/config.js'
];

let pass = 0, fail = 0;
/**
 * The single assertion helper. Records one result: prints "ok"/"FAIL" for `label`,
 * increments the pass/fail tallies that decide the exit code, and on failure prints
 * `detail` so the output says WHY it failed rather than only that it did.
 */
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + label); }
    else { fail++; console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')); }
};

/** Load a box config.js in an isolated context and hand back its NT1Config object. */
function loadConfig(rel) {
    const src = fs.readFileSync(path.join(REPO, rel), 'utf8');
    const sandbox = {
        window: {}, document: { createElement: () => ({ set textContent(v) { this.innerHTML = v; }, innerHTML: '' }) },
        console, BoxEngine: { requestFlagText: async () => 'flag{test}', getDeliveredFlag: () => 'flag{test}' }
    };
    vm.createContext(sandbox);
    vm.runInContext(src + '\n;globalThis.__NT1 = NT1Config;', sandbox, { filename: rel });
    return sandbox.__NT1;
}

/** Minimal stand-in for the Terminal instance the box commands receive. */
function makeTerm() {
    return { cwd: 'C:\\Users\\Technician', outputEl: { innerHTML: 'x' }, _updatePrompt() { this.promptUpdated = true; } };
}

/** Minimal engine carrying the HD-7201 broken state: adapter disabled, no addressing. */
function makeEngine() {
    return { state: { _networkConfig: { adapter: 'disabled', dhcp: true, ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' }, _scenarioSelected: true, _scenarioId: 1 } };
}

for (const rel of COPIES) {
    console.log('\n=== ' + rel + ' ===');
    const C = loadConfig(rel);
    const cmd = C.commands;

    // 1. HD-7201: loopback must answer even though the adapter is disabled.
    const loop = C._checkConnectivity('127.0.0.1', makeEngine());
    chk('loopback succeeds with the adapter disabled (HD-7201)', loop.success === true,
        'got ' + JSON.stringify(loop) + ' -- the box would teach that a dead NIC breaks the TCP/IP stack');

    // 2. ...while a real network target still correctly fails.
    const gw = C._checkConnectivity('192.168.1.1', makeEngine());
    chk('gateway still fails with the adapter disabled', gw.success === false && /General failure/.test(gw.error),
        'got ' + JSON.stringify(gw));

    // A missing command must read as a clean FAIL, not a TypeError. On the pre-fix
    // baseline `cd`/`type`/`find` do not exist at all, and a harness that dies on the
    // first absent one reports a single crash instead of the full list of defects.
    const missing = ['dir', 'cd', 'type', 'find', 'cls'].filter(k => typeof cmd[k] !== 'function');
    chk('dir/cd/type/find/cls are all defined by the box', missing.length === 0,
        'not defined: ' + missing.join(', ') + ' -- these fall through to Terminal.js POSIX builtins');

    // Run the null-return check BEFORE any early exit. It does not depend on the new
    // commands existing, and it is the assertion that catches the `cls` fallthrough --
    // so skipping it on the baseline arm would leave that defect unproven.
    const nulls = Object.keys(cmd).filter(k => {
        try { return cmd[k]([], makeTerm(), makeEngine()) === null; } catch (e) { return false; }
    });
    chk('no command returns null (null = silent builtin fallthrough)', nulls.length === 0,
        'these return null: ' + nulls.join(', '));

    if (missing.length) { console.log('  ..   skipping the remaining behavioural cases; those commands do not exist'); continue; }

    // 3. Every directory `dir` advertises must be enterable by `cd`.
    const term = makeTerm();
    const listing = cmd.dir([], term);
    const advertised = listing.split('\n')
        .filter(l => l.includes('<DIR>'))
        .map(l => l.split('<DIR>')[1].trim())
        .filter(d => d !== '.' && d !== '..');
    let unenterable = [];
    for (const d of advertised) {
        const t2 = makeTerm();
        const r = cmd.cd([d], t2);
        if (r !== '' || t2.cwd === 'C:\\Users\\Technician') unenterable.push(d + ' -> ' + JSON.stringify(r));
    }
    chk('every directory `dir` lists can be entered by `cd` (' + advertised.length + ' listed)',
        advertised.length > 0 && unenterable.length === 0, unenterable.join('; '));

    // 4. The gateway address must be discoverable in-sim during HD-7201.
    const t3 = makeTerm();
    cmd.cd(['Documents'], t3);
    const doc = cmd.type(['network-baseline.txt'], t3);
    chk('network-baseline.txt is readable and names the gateway', /192\.168\.1\.1/.test(doc),
        'type returned: ' + String(doc).slice(0, 120));
    chk('baseline also teaches the loopback fact', /disabled or unplugged/.test(doc));

    // 4b. Windows paths are CASE-INSENSITIVE. A student who types `cd documents` or
    // `type network-baseline.TXT` must not be dead-ended -- that would reproduce the
    // original defect (the shell names a thing, then refuses a trivial variant of it)
    // on the one command that reveals the gateway address.
    const t3b = makeTerm();
    const cdLower = cmd.cd(['documents'], t3b);
    chk('cd is case-insensitive (`cd documents`)', cdLower === '' && /Documents$/.test(t3b.cwd),
        'returned ' + JSON.stringify(cdLower) + ', cwd=' + t3b.cwd);
    chk('cd restores canonical casing in the prompt', t3b.cwd === 'C:\\Users\\Technician\\Documents',
        'cwd=' + t3b.cwd + ' -- cmd.exe shows the stored spelling, not what was typed');
    chk('type is case-insensitive (`Network-Baseline.TXT`)',
        /192\.168\.1\.1/.test(String(cmd.type(['Network-Baseline.TXT'], t3b))),
        'got ' + String(cmd.type(['Network-Baseline.TXT'], t3b)).slice(0, 90));
    chk('dir is case-insensitive on an explicit path',
        /Directory of/.test(String(cmd.dir(['c:\\users\\technician'], makeTerm()))),
        'got ' + String(cmd.dir(['c:\\users\\technician'], makeTerm())).slice(0, 90));
    chk('find takes a case-varied FILENAME',
        /192\.168\.1\.1/.test(String(cmd.find(['"gateway"', 'NETWORK-BASELINE.TXT'], t3b))),
        'got ' + String(cmd.find(['"gateway"', 'NETWORK-BASELINE.TXT'], t3b)).slice(0, 90));
    chk('find keeps its search string case-SENSITIVE by default, as real FIND does',
        String(cmd.find(['"GATEWAY"', 'network-baseline.txt'], t3b)).indexOf('192.168.1.1') === -1);
    chk('find /I makes the search string case-insensitive',
        /192\.168\.1\.1/.test(String(cmd.find(['/I', '"GATEWAY"', 'network-baseline.txt'], t3b))));

    // 5. A path the lab does not model gets the WINDOWS error, not a bash one.
    const t4 = makeTerm();
    const bad = cmd.cd(['Nonexistent'], t4);
    chk('cd to a missing dir returns the Windows error', bad === 'The system cannot find the path specified.',
        'got ' + JSON.stringify(bad));

    // 6. FIND: real Windows command, must work and must not dump the file on an empty needle.
    const t5 = makeTerm();
    t5.cwd = 'C:\\Users\\Technician\\Documents';
    const hit = cmd.find(['"gateway"', 'network-baseline.txt'], t5);
    chk('find locates a string in the baseline', /192\.168\.1\.1/.test(hit), String(hit).slice(0, 120));
    const empty = cmd.find(['""', 'network-baseline.txt'], t5);
    chk('find with an empty needle refuses instead of dumping the file',
        empty === 'FIND: Parameter format not correct', 'got ' + String(empty).slice(0, 120));

    // 7. Linux builtins must not leak into a Windows CMD simulation.
    for (const c of ['ls', 'cat', 'pwd', 'head', 'tail', 'man', 'uname', 'file', 'history']) {
        chk('`' + c + '` is refused as a Windows box would refuse it',
            typeof cmd[c] === 'function' && /is not recognized as an internal or external command/.test(cmd[c]([], makeTerm())));
    }

}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
