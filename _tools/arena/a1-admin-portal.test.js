#!/usr/bin/env node
/**
 * a1-admin-portal.test.js
 *
 * @catalog what    Drives the SHIPPED A1 config's operator-portal handlers: credential login, the
 * @catalog what    auth bypass, role refusal, and the invariant that the admin log SIGNPOSTS the
 * @catalog what    stellar_forge_codes table without ever containing the root flag.
 * @catalog run     node _tools/arena/a1-admin-portal.test.js
 * @catalog status  TOOL
 *
 * WHY THIS FILE EXISTS AS A FILE
 * ------------------------------
 * It was a scratchpad script first. I reported "14/14 handler assertions passed" to the operator and
 * to the gate, and Nancy went looking for it: `grep -rln "_handleAdminLogin" _tools/` returned
 * nothing, because the script lived in /tmp and was never committed. Her verdict was blunt and
 * correct — the conclusion held up under her own manual read, but the claimed coverage did not exist
 * in any form she could rerun. That is the same unearned-claim pattern this repo has a starred rule
 * about, and the fix is not a better sentence, it is this file.
 *
 * WHAT IT GUARDS, in order of how much it would hurt to get wrong:
 *
 * 1. THE LOG IS A SIGNPOST, NOT A SHORTCUT. Both A1 flags stay where they were — `user` behind
 *    LOAD_FILE('/home/www-data/user.txt'), `root` inside the stellar_forge_codes table, both via the
 *    search field. The portal must NAME that table and must NOT contain the flag, the placeholder,
 *    or the LOAD_FILE path. If this breaks, the box's whole SQL-injection lesson becomes optional.
 *
 * 2. THE QUOTE IS MANDATORY IN THE BYPASS. The first implementation made every group before the
 *    comment marker optional, so a bare `--`, `#` or `/*` with no quote at all granted administrator
 *    access. That is not an injection: with no quote to terminate the string literal, `#` is just a
 *    one-character username. This box teaches WHY the quote matters, so rewarding the wrong mental
 *    model identically to the right one teaches the opposite of the lesson. Nancy caught it.
 *    My own first correction then anchored the quote at position 0 and broke `admin'--`, the
 *    canonical payload in the walkthrough — worse than the bug. Hence cases for BOTH directions.
 *
 * 3. ROLE IS ENFORCED. `viewer`, `data_scribe` and `logistics_bot` authenticate but are refused, with
 *    a message that confirms the passphrase worked. That is the point of dumping a `role` column.
 *
 * 4. NO RAW INPUT REACHES THE DOM. The login form is attacker-controlled and the non-admin path
 *    echoes a username back.
 *
 * KNOWN RESIDUAL, recorded here rather than left as an assumption. The portal is reachable from the
 * start and there is no engine-state check that the union dump actually happened, so `admin` /
 * `Cr1ms0nD4wn` typed cold succeeds. The gate is knowing the passphrase, and the only in-box source
 * is the users table — but that stops being the only source the first time a screenshot or a shared
 * walkthrough circulates, and this box's own walkthrough now prints the credential in a table. An
 * earlier draft DID add an `engine.state.ledgerUsersDumped` gate; it was removed as gating nothing
 * the credentials already gated. That tradeoff is deliberate and is stated here so the next reader
 * inherits the decision rather than the assumption.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const CONFIG = path.join(REPO, '_app/arena/boxes/a1-ancient-ledger/config.js');

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};

function loadConfig() {
    /* Loads the SHIPPED file rather than a copy, so this cannot pass against a stale duplicate.
     * The config is a browser script that assigns window.A1Config; a bare `new Function` with a
     * stub window is enough to evaluate it with no DOM. */
    const src = fs.readFileSync(CONFIG, 'utf8');
    const win = {};
    const doc = { createElement: () => ({}) };
    return new Function('window', 'document',
        src + '\n return typeof A1Config !== "undefined" ? A1Config : (window.A1Config || null);')(win, doc);
}

function main() {
    const A1 = loadConfig();
    if (!A1 || typeof A1._handleAdminLogin !== 'function') {
        console.error('  could not load A1Config._handleAdminLogin from ' + CONFIG);
        return 2;
    }
    const H = (u, p) => A1._handleAdminLogin(u, p, null);
    const tail = (name) => String(A1._db.users.find(u => u.username === name).password_hash).split('...').pop();

    // ── 1. credential login ────────────────────────────────────────────────────────────────────
    const adminLog = H('admin', tail('admin'));
    chk('the authored admin passphrase reaches the operations log', /Operations Log/.test(adminLog));
    chk('the second administrator account also works',
        /Operations Log/.test(H('arch_overseer', tail('arch_overseer'))));

    // ── 2. the signpost invariant — the one that must never regress ────────────────────────────
    chk('the log NAMES stellar_forge_codes (the signpost)', /stellar_forge_codes/.test(adminLog));
    chk('the log does NOT contain the root flag or its placeholder',
        !/FLAG:root/.test(adminLog) && !/\{\{FLAG/.test(adminLog));
    chk('the log does NOT leak the LOAD_FILE path that yields the user flag',
        !/user\.txt/.test(adminLog) && !/home\/www-data/.test(adminLog));
    chk('the log states the code values are not held in it', /not held in this log/i.test(adminLog));

    // ── 3. the bypass: the quote is mandatory, BOTH directions ────────────────────────────────
    for (const payload of ["admin'--", "'--", "' OR 1=1--", "' or 'a'='a", "admin'#", "arch_overseer'--"]) {
        chk('bypass ACCEPTS the taught payload ' + JSON.stringify(payload),
            /Operations Log/.test(H(payload, '')), 'the walkthrough teaches this and it was refused');
    }
    for (const notInjection of ['--', '#', '/*', 'admin', 'viewer', '', 'x']) {
        chk('bypass REFUSES ' + JSON.stringify(notInjection) + ' (no quote = not an injection)',
            !/Operations Log/.test(H(notInjection, '')), 'granted admin access without terminating the string literal');
    }
    chk('a successful bypass is LABELLED as a bypass in the log header',
        /authentication bypassed/i.test(H("admin'--", '')));

    // ── 4. role enforcement ────────────────────────────────────────────────────────────────────
    const v = H('viewer', tail('viewer'));
    chk('a non-administrator is refused the log', /not permitted/i.test(v) && !/Operations Log/.test(v));
    chk('the refusal confirms the passphrase was correct', /Signed in as/i.test(v));
    chk('the refusal points back at the role column', /administrator/i.test(v));

    // ── 5. failures and escaping ───────────────────────────────────────────────────────────────
    chk('wrong passphrase fails', /Sign-in failed/i.test(H('admin', 'not-the-passphrase')));
    chk('unknown operator fails', /Sign-in failed/i.test(H('nobody', 'x')));
    const xss = H('<img src=x onerror=alert(1)>', 'x');
    chk('markup in the operator field never reaches the DOM unescaped', !/<img/.test(xss), xss.slice(0, 140));

    console.log(`\n  ${pass}/${pass + fail} assertions passed`);
    return fail ? 1 : 0;
}

try { process.exit(main()); }
catch (e) { console.error('  a1-admin-portal.test could not run:', e && e.message); process.exit(2); }
