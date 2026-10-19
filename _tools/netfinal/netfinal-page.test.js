#!/usr/bin/env node
/**
 * netfinal-page.test.js — the exam PAGE, against the engine it talks to.
 *
 * @catalog what    Checks the Network+ final's exam page is actually wired to the engine: every
 * @catalog what    callable reached, every declared action renderable, every CSS class it uses
 * @catalog what    defined, and exam-mode lockdown intact.
 * @catalog run     node _tools/netfinal/netfinal-page.test.js
 * @catalog status  TOOL
 *
 * WHY THIS FILE EXISTS. The engine's reachability was fully proven and the page was still broken.
 * The shell suite drives 18 of the 24 variants through exec() and the gui suite drives the other 6
 * through act(), each with a ledger accounting for all 24 -- so "can a student fix every fault" was
 * answered yes, with evidence. Then the page shipped with a generic read-only table dump for its
 * window body: 15 actions existed, act() accepted all of them, and the page offered controls for
 * none. `change-requests/submit` and `incident-log/submit` are GRADED, and neither could be reached.
 *
 * Engine reachability is not page reachability, and no suite could see the difference because
 * nothing looked at the page. This does. It is static analysis, not a browser -- it cannot prove the
 * page RENDERS -- so every check here is phrased as a claim about wiring that a text search can
 * actually settle, and the honest limits are stated where they bite.
 */
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '../..');
const NF = path.join(REPO, 'functions/netfinal');

const GUI = require(path.join(NF, 'netfinal-gui.js'));
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const EXAMS = require(path.join(NF, 'netfinal-exams.js'));
const CLIENT = require(path.join(NF, 'netfinal-client.js'));
const QUESTIONS = require(path.join(NF, 'netfinal-questions.js'));

/* NETFINAL_PAGE_PATH lets a mutated COPY be analysed without touching the tracked file, so these
 * static assertions can be mutation-verified at all. Without it, a mutation run against a scratch
 * copy left this suite reading the real page and passing for the only reason that matters: it was
 * never shown the mutation. I scored a round of mutations that way and the result was meaningless. */
const PAGE_PATH = process.env.NETFINAL_PAGE_PATH
    || path.join(REPO, '_app/houses/web/network-plus/exams/network-final.exam.html');
const INDEX_PATH = path.join(REPO, 'functions/index.js');
const page = fs.readFileSync(PAGE_PATH, 'utf8');
const index = fs.readFileSync(INDEX_PATH, 'utf8');

/* The page's own composite-field declarations, LIFTED from the page rather than retyped, so a
 * sandbox can never be exercising a different pair of fields than the page uses. */
const PAGE_CONSTS = (() => {
    const grab = (name) => {
        const m = require('fs').readFileSync(PAGE_PATH, 'utf8')
            .match(new RegExp('var ' + name + ' = \\{[^}]*\\};'));
        return m ? m[0] : '';
    };
    return grab('COMPOSITE_PARTS') + '\n' + grab('PART_LABELS') + '\n';
})();

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};
const section = (t) => console.log('\n' + t);

/* ─── 1. every callable the server exposes is reached by the page ───────────────────────────────── */
section('1. the page reaches every callable, and names none that does not exist');
{
    const exported = (index.match(/^exports\.netfinal[A-Za-z]+/gm) || [])
        .map(x => x.replace('exports.', '')).sort();
    const called = (page.match(/call\('netfinal[A-Za-z]+'/g) || [])
        .map(x => x.replace("call('", '').replace("'", ''))
        .filter((v, i, a) => a.indexOf(v) === i).sort();

    /* Eight since 2026-10-19: netfinalReset, the staff restart, reached from the Submitted panel. */
    chk('the server exposes the eight exam callables', exported.length === 8, JSON.stringify(exported));
    const unreached = exported.filter(e => called.indexOf(e) < 0);
    /* THE ONE THAT WAS BROKEN. netfinalAction and netfinalRestore were exported, tested, and never
     * called by the page -- so every GUI action and the only recovery path were dead. */
    chk('no exported callable goes unreached by the page',
        unreached.length === 0, 'unreached: ' + unreached.join(', '));
    const phantom = called.filter(c => exported.indexOf(c) < 0);
    chk('the page calls no callable the server does not export',
        phantom.length === 0, 'phantom: ' + phantom.join(', '));
    chk('the lists are non-empty, so both checks above could fail',
        exported.length > 0 && called.length > 0, exported.length + '/' + called.length);
}

/* ─── 2. the window body can actually act ───────────────────────────────────────────────────────── */
section('2. the window body renders controls, not just a table');
{
    chk('the page builds forms from the schema the server ships',
        /function renderActions\s*\(/.test(page) && /renderActions\(name, view\._actions\)/.test(page));
    chk('the generic dumper EXCLUDES the control keys, so they are not printed as data',
        /k === '_actions'/.test(page) && /k === '_restore'/.test(page));
    chk('a submit handler is delegated on the window body, not bound per form',
        /el\('winbody'\)\.addEventListener\('submit'/.test(page),
        'per-form binding would stop working after the first re-render');
    chk('the action handler posts window, action and params',
        /call\('netfinalAction',[\s\S]{0,200}?window: form\.dataset\.window[\s\S]{0,120}?action: form\.dataset\.action/.test(page));
    chk('the restore handler posts a device', /call\('netfinalRestore', \{ examId: EXAM_ID, device:/.test(page));
    chk('the window is re-rendered after an action, so the student sees what changed',
        /function refreshWindow\(/.test(page) && (page.match(/refreshWindow\(\)/g) || []).length >= 2);
    chk('a rejected action updates the status line instead of throwing the form away',
        /function actionResult\(/.test(page) && /res\.reason/.test(page));
}

/* ─── 3. every declared form is renderable by THIS page's renderer ──────────────────────────────── */
section('3. the page can render every control the engine declares');
{
    const lab = CORE.generate('page-lab', EXAMS.DEFAULT_EXAM_ID, { secret: 's' });
    FAULTS.applyAll(lab);
    FAULTS.assignTickets(lab, CORE.makeRng('page-tkt'));

    chk('the engine declares no action without a form and no form without an action',
        GUI.schemaGaps().length === 0, GUI.schemaGaps().join(' | '));

    /* The renderer handles exactly three control shapes. A param that is none of them would render
     * as nothing at all -- an invisible required field, which is worse than a missing form. */
    const shapes = [];
    GUI.WINDOWS.forEach(w => {
        GUI.actionSchema(lab, w).forEach(f => f.params.forEach(prm => {
            const kind = (prm.options && prm.options.length) ? 'select' : (prm.textarea ? 'textarea' : 'input');
            shapes.push(kind);
        }));
    });
    chk('the renderer implements all three control shapes it can be handed',
        /<select id=/.test(page) && /<textarea id=/.test(page) && /<input id=/.test(page));
    chk('and every declared param resolves to one of them (' + shapes.length + ' params)',
        shapes.every(k => ['select', 'textarea', 'input'].indexOf(k) >= 0));
    /* The two highest-value forms the new UI added. Both `layer` fields feed a String() comparison
     * that grades Q43 and the layer half of all twelve fix questions, so a free-text input here
     * costs points for a correct answer typed as "Layer 2". */
    ['change-requests', 'incident-log'].forEach(w => {
        const layer = GUI.actionSchema(lab, w)[0].params.filter(x => x.name === 'layer')[0];
        chk(w + ': the graded layer field reaches the page as a closed list',
            !!(layer && layer.options && layer.options.length),
            JSON.stringify(layer));
    });
    chk('and the page renders a list-valued param as a <select>, not a text input',
        /if \(prm\.options && prm\.options\.length\) \{[\s\S]{0,160}?<select id=/.test(page));

    chk('each control carries data-param, which is how the handler collects values',
        (page.match(/data-param="/g) || []).length >= 3
        && /querySelectorAll\('\[data-param\]'\)/.test(page));
    /* An empty optional field must be OMITTED, not sent as ''. portforward-set applies toPort only
     * when present, and '' becomes NaN. */
    /* OMIT ONLY WHAT THE SCHEMA CALLED OPTIONAL. Omitting any blank field made a blank REQUIRED
     * field arrive as undefined, so the rejection read "not a network in CIDR form: undefined"
     * instead of naming the field. Optional blanks are still omitted, because portforward-set
     * applies toPort only when present and '' would become NaN. */
    chk('a blank OPTIONAL field is omitted, a blank REQUIRED field is sent as empty',
        /var optional = ctl\.dataset\.optional === '1';/.test(page)
        && /if \(!optional\) \{ params\[ctl\.dataset\.param\] = ''; \}/.test(page));
    chk('and the renderer marks which params are optional, so the handler can tell',
        /prm\.optional \? ' data-optional="1"' : ''/.test(page));

    /* ONE REQUEST PER FORM. The exam-submit button disabled itself while in flight; these forms did
     * not, so a double-click raced itself and the loser surfaced as the compare-and-set 'aborted'
     * error. The server was right to refuse it, but a student who reads a red message and moves on
     * has lost the work anyway. */
    chk('an action form disables its button while a request is in flight',
        /if \(btn && btn\.disabled\) \{ return; \}/.test(page)
        && /if \(btn\) \{ btn\.disabled = true; \}/.test(page));
    chk('and re-enables it on BOTH outcomes, so a failure does not freeze the form',
        /\.then\(release, function \(e\) \{ release\(\); fatal\(e\); \}\)/.test(page));
    chk('the restore form is guarded the same way',
        /if \(rbtn && rbtn\.disabled\) \{ return; \}/.test(page)
        && /\.then\(rrelease, function \(e\) \{ rrelease\(\); fatal\(e\); \}\)/.test(page));
    /* A `.catch(fatal)` on an action form would re-introduce the frozen button, so assert the shape
     * that replaced it is the only one present on these two handlers. */
    chk('no action handler still ends in a bare .catch(fatal), which would leave it disabled',
        !/return refreshWindow\(\);\s*\}\)\.catch\(fatal\);/.test(page));
}

/* ─── 3b. the question panel can render every KIND the bank uses ────────────────────────────────── */
section('3b. every question kind has a control, and the two-field one posts both halves');
{
    const QQ = require(path.join(NF, 'netfinal-questions.js'));
    const lab2 = CORE.generate('page-kinds', EXAMS.DEFAULT_EXAM_ID, { secret: 's' });
    FAULTS.applyAll(lab2);

    /* THE LEDGER. The panel's renderer is an if/else chain ending in a plain text input, so a kind it
     * does not know renders as a text box with no complaint -- which is how a question that needs a
     * closed list or two fields would silently become free text again. Derived from the bank, so
     * adding a kind fails this until the page learns it. */
    const kinds = QQ.forStudent(lab2).map(q => q.kind).filter((v, i, a) => a.indexOf(v) === i).sort();
    const handled = {
        aclref: /q\.kind === 'aclref'/.test(page),
        select: /q\.kind === 'select'/.test(page),
        state: /q\.kind === 'state'/.test(page),
        sequence: /q\.kind === 'sequence'/.test(page),
        /* text and multi legitimately fall through to the plain input, which is the right control. */
        text: /<input type="text" data-q=/.test(page),
        multi: /<input type="text" data-q=/.test(page)
    };
    const unhandled = kinds.filter(k => !handled[k]);
    chk('every question kind in the bank has a control on the page (' + kinds.join(', ') + ')',
        unhandled.length === 0, 'no control for: ' + unhandled.join(', '));
    chk('the kind list is non-empty and includes the structured one, so this could fail',
        kinds.length >= 3 && kinds.indexOf('aclref') >= 0, JSON.stringify(kinds));

    /* The two-field control specifically. */
    chk('the ACL reference renders a closed list for the name and a typed field for the sequence',
        /data-part="name"/.test(page) && /data-part="seq"/.test(page)
        && /<select data-q="' \+ esc\(q\.id\) \+ '" data-part="name"/.test(page));
    chk('the sequence half is NOT a closed list, so the harder half is still answered by the student',
        !/data-part="seq"[\s\S]{0,80}<option/.test(page));
    chk('both halves carry the same data-q, which is how the pair is collected',
        (page.match(/data-q="' \+ esc\(q\.id\) \+ '" data-part=/g) || []).length === 2);
    /* A change to EITHER half must post BOTH, or picking the ACL would wipe a typed sequence. */
    chk('a change to either half posts the whole pair, not just the field touched',
        /querySelectorAll\('\[data-q="' \+ t\.dataset\.q \+ '"\]\[data-part\]'\)/.test(page)
        && /saveAnswer\(t\.dataset\.q, parts\)/.test(page));
    chk('and a single-control question still posts its own value',
        /saveAnswer\(t\.dataset\.q, t\.value\)/.test(page));

    /* The offered names must be the lab's real ACLs, which is the whole point of closing the list. */
    const q24 = QQ.forStudent(lab2).filter(q => q.n === 24)[0];
    chk('the offered ACL names are the router’s real ACLs',
        !!q24 && JSON.stringify((q24.options || []).map(o => o.id).sort())
            === JSON.stringify(Object.keys(lab2.acls['MeridianRTR-01']).sort()),
        JSON.stringify({ offered: (q24 || {}).options, real: Object.keys(lab2.acls['MeridianRTR-01']) }));
    chk('and the question still discloses no answer',
        !!q24 && !('answer' in q24) && !('slot' in q24), JSON.stringify(Object.keys(q24 || {})));
}

/* ─── 3c. a resume must put the saved answers back into the controls ────────────────────────────── */
section('3c. the page restores what the student already answered');
{
    /* THE FORM DID NOT CARRY WHAT ITS SAVE HANDLER READ BACK OUT OF IT. renderQuestions built every
     * control from blank defaults and ran once per load -- on a FIRST load and on a RESUME alike --
     * so a refresh showed every field empty even though the answers were safe on the server.
     *
     * For one text box that was re-entry. For the two-field ACL question it was data loss: both
     * controls post together, so re-picking the ACL after a refresh posted the name with a blank
     * sequence and overwrote a complete, credited answer with a half-credit one. The student lost
     * half a question for re-affirming a field they had got right.
     *
     * This is static analysis -- it cannot prove the DOM ends up populated. What it CAN settle is
     * that the values are requested, kept, applied on every render, and applied per-field for a
     * multi-field answer. The end-to-end half (the server returning both halves of the pair across a
     * refresh) is asserted in netfinal-exam.test.js, which drives the real callables. */
    chk('the page asks the server for the saved answers',
        /answers = r\.answers \|\| \{\};/.test(page));
    chk('it keeps them in page state rather than reading them once and discarding',
        /var answers = \{\};/.test(page));
    chk('every question re-render restores them, not just the first',
        /function restoreAnswers\(\)/.test(page)
        && /^\s*restoreAnswers\(\);$/m.test(page));
    chk('restoreAnswers is called from renderQuestions, so no caller can forget it',
        /\}\)\.join\(''\);\s*\n\s*restoreAnswers\(\);/.test(page),
        'the restore must be inside the render, not a step a caller has to remember');
    chk('a multi-field answer is restored PER FIELD, by data-part',
        /var part = ctl\.dataset\.part;/.test(page)
        && /var pv = v\[part\];/.test(page));
    /* A bare string must NOT be spread across both halves of a pair: it put the same text in the
     * select and the number field. Only reachable by a raw API call, but worth refusing. */
    chk('a multi-field control restores only from an object, never from a bare string',
        /if \(!v \|\| typeof v !== 'object'\) \{ return; \}/.test(page));
    chk('the answered marker is restored too, so progress does not read as lost',
        /card\.classList\.add\('answered'\)/.test(page));
    /* ONE DEFINITION OF "ANSWERED", FOR BOTH PATHS. There were three: restoreAnswers checked for
     * content, saveAnswer's success handler marked the card unconditionally and counted from the
     * server's raw key count, and an `answeredLocal` flag set on save and reset on every reload.
     * Same stored state, three answers -- so a student who typed something and deleted it saw the
     * question marked and counted, then watched both drop on refresh. Three copies of a display rule
     * is how they disagreed; there is one now, and the assertions below are about there being one. */
    chk('a single predicate decides whether an answer counts as content',
        /function hasContent\(v\)/.test(page));
    chk('it treats a blank string and a blank pair as unanswered',
        /return String\(v\) !== '';/.test(page)
        && /typeof x !== 'object' && String\(x\) !== ''/.test(page),
        'a multi-field answer with every half blank must not count');
    chk('one function marks the card, and it can UNMARK it too',
        /function markAnswered\(qid\)/.test(page)
        && /classList\.add\('answered'\)/.test(page)
        && /classList\.remove\('answered'\)/.test(page),
        'a value cleared to blank has to lose the marker, not merely fail to gain it');
    chk('one function derives the count, off the markers',
        /function refreshAnswerCount\(\)/.test(page)
        && /querySelectorAll\('\.q\.answered'\)\.length/.test(page));
    /* THE POINT OF THE REFACTOR: the live path and the resumed path call the SAME two functions. */
    chk('the live save path and the question render BOTH use them',
        (page.match(/markAnswered\(/g) || []).length >= 3
        && (page.match(/refreshAnswerCount\(\)/g) || []).length >= 3,
        'definition plus at least one call from each path');
    chk('the live path no longer counts from the server\u2019s raw key count',
        !/el\('qcount'\)\.textContent = r\.answered/.test(page),
        'r.answered counts a blank entry the same as a filled one');
    chk('and the third source of truth is gone, not merely kept in step',
        (page.match(/q\.answeredLocal/g) || []).length === 0,
        'answeredLocal was set on save, never cleared, and reset on every reload');
    chk('a saved answer is recorded locally after the server accepts it',
        /answers\[id\] = value;/.test(page));
    /* Values are assigned, not interpolated into the markup: a student's text would otherwise have
     * to survive attribute escaping to come back correctly. */
    chk('values are assigned to controls rather than written into the HTML',
        (page.match(/ctl\.value = String\((?:pv|v)\);/g) || []).length === 2
        && !/value="' \+ esc\(answers/.test(page));
    chk('and a non-scalar is skipped rather than stringified into a control',
        (page.match(/=== null \|\| (?:pv|v) === undefined \|\| typeof (?:pv|v) === 'object'\) \{ return; \}/g) || []).length === 2);
}

/* ─── 4. every class the script uses is defined in the stylesheet ───────────────────────────────── */
section('4. no class is referenced but unstyled');
{
    /* `.good` and `.big` were both used by the script and defined nowhere, so the status line
     * rendered unstyled and the submitted score rendered at body size. A class that does not exist
     * fails silently, which is why it needs a test rather than a look. */
    /* COMMENTS STRIPPED FIRST. The stylesheet explains, in a comment, that `.good` and `.big` were
     * once referenced and undefined -- and a substring search found the class name in that very
     * comment and called it defined. Mutation caught it: deleting the real `.good` rule left this
     * section green. That is the third time in this build a comment has satisfied a checker that
     * was looking for code (an anchor tag inside a comment broke the hub's tag balance, and the AI
     * tutor's filename inside a comment defeated the lockdown grep). A checker that reads comments
     * as code is not checking anything. */
    const styleBlock = ((page.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '')
        .replace(/\/\*[\s\S]*?\*\//g, ' ');
    const used = {};
    /* Only real class TOKENS. Some class attributes in this page are built by string concatenation,
     * so the raw attribute text can contain JavaScript -- `class="q ' + (q.answeredLocal ...` -- and
     * feeding that to RegExp threw an unterminated-group error. A token that is not a plain
     * identifier is not a class name, so it is skipped rather than guessed at. */
    const isClassToken = (c) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(c);
    (page.match(/class="([^"]+)"/g) || []).forEach(m => {
        m.replace(/class="|"/g, '').split(/\s+/).forEach(c => { if (isClassToken(c)) { used[c] = true; } });
    });
    (page.match(/classList\.add\('([a-z-]+)'\)/g) || []).forEach(m => {
        used[m.replace(/classList\.add\('|'\)/g, '')] = true;
    });
    /* CLASSES CHOSEN AT RUNTIME. The status line does
     *     '<span class="' + (okay ? 'good' : 'bad') + '">'
     * so neither name appears inside a quoted class attribute and the token scan above cannot see
     * them. Mutation proved it: deleting the `.good` rule left this section at 30/30, because the
     * class it was supposed to be checking was never in the list. A clean pass on an empty set is
     * not a pass. So: for every `class="` occurrence, also take the quoted identifiers from the
     * expression that follows it. */
    (page.match(/class="[\s\S]{0,160}/g) || []).forEach(win => {
        /* Bounded at the tag's own '>', or a 160-char window swallows unrelated code and reports
         * `netfinalWindow` and `object` as missing classes -- a detector so loud it would be turned
         * off. Everything inside ONE tag's class expression, and nothing past it. */
        const gt = win.indexOf('>');
        const expr = gt >= 0 ? win.slice(0, gt) : win;
        (expr.match(/'([a-zA-Z][a-zA-Z0-9_-]*)'/g) || []).forEach(lit => {
            const c = lit.replace(/'/g, '');
            if (isClassToken(c)) { used[c] = true; }
        });
    });
    const undefinedClasses = Object.keys(used)
        .filter(c => styleBlock.indexOf('.' + c) < 0);
    chk('every class the markup or script applies is defined (' + Object.keys(used).length + ' classes)',
        undefinedClasses.length === 0, 'undefined: ' + undefinedClasses.join(', '));
    chk('the class list is non-empty, so the check above could fail',
        Object.keys(used).length > 5, String(Object.keys(used).length));

    /* Every custom property the stylesheet READS must also be DECLARED here, or it silently resolves
     * to nothing -- which is how the action forms briefly had transparent inputs via var(--panel). */
    const declared = {};
    (styleBlock.match(/--[a-z0-9-]+\s*:/g) || []).forEach(m => { declared[m.replace(/\s*:/, '').trim()] = true; });
    const readWithoutFallback = (styleBlock.match(/var\((--[a-z0-9-]+)\)/g) || [])
        .map(m => m.replace(/var\(|\)/g, ''))
        .filter((v, i, a) => a.indexOf(v) === i)
        .filter(v => !declared[v]);
    chk('every custom property read without a fallback is declared',
        readWithoutFallback.length === 0, 'undeclared: ' + readWithoutFallback.join(', '));
}

/* ─── 5. the submitted score does not read as a final grade ─────────────────────────────────────── */
section('5. the score presentation');
{
    /* Q45 is instructor-marked, so a flawless run submits as 191 of 200 with 9 pending. "191 / 200"
     * in 1.9rem type reads as a final grade to every student who screenshots it. The headline
     * denominator is now the GRADED total, and the pending points are stated as pending. */
    chk('the headline denominator excludes the instructor-marked points',
        /var gradedOutOf = report\.outOf - pending;/.test(page)
        && /'<div class="big">' \+ report\.total \+ ' <span class="of">\/ ' \+ gradedOutOf/.test(page));
    chk('the headline is NOT the full point total',
        !/<div class="big">' \+ report\.total \+ ' \/ ' \+ report\.outOf/.test(page),
        'the big number is the full total again');
    chk('the pending points are stated, with the full total for context',
        /pending \+ ' of the ' \+ report\.outOf/.test(page));
    chk('collateral damage is still surfaced', /report\.flagged \?/.test(page));
}

/* ─── 6. exam-mode lockdown ─────────────────────────────────────────────────────────────────────── */
section('6. spec section 9 lockdown, as the page delivers it');
{
    /* The tutor's script filename is deliberately absent from the file, comments included: the
     * criterion is checked by searching the delivered page, and a mention in a comment reads as a
     * hit. This asserts the property the spec actually states. */
    chk('the AI tutor script is not referenced anywhere in the page',
        !/HexAIButton/.test(page) && !/hex-ai/.test(page));
    chk('no course or module navigation is offered',
        !/href="\.\.\/(modules|index)/.test(page) && !/courseLinks: true/.test(page));
    chk('the access guard runs', /AccessGuard\.require/.test(page));
    chk('the page loads only the three components it needs', (() => {
        const srcs = (page.match(/<script[^>]+src="([^"]+)"/g) || []).map(m => m.replace(/.*src="|"/g, ''));
        return srcs.length === 3 && srcs.every(x => /components\/(AccessGuard|FirebaseAuth|ObservatoryTelemetry)\.js$/.test(x));
    })(), JSON.stringify((page.match(/<script[^>]+src="([^"]+)"/g) || [])));
    /* THE EXAM DID NOT START IN PRODUCTION, and this is the assertion that would have caught it.
     * `call('netfinalStart')` ran synchronously as the script executed, before FirebaseAuth had
     * resolved its auth state -- so `call()` found callFunction undefined, rejected locally, and the
     * request never reached the server. The function logs showed netfinalWindow and netfinalCommand
     * calls (tab click, typed line -- both long after auth settles) and NO netfinalStart at all.
     * The student saw "Cloud Functions unavailable", then "No such exam session" on everything.
     *
     * Every other exam page calls its callable from a submit handler, where auth has resolved for
     * free. This is the only page that calls one on LOAD, which is why it is the only one that had
     * to wait deliberately -- and why no existing page's shape would have shown me the requirement.
     *
     * None of the 1358 assertions caught this, because none of them load the page in a browser.
     * That is the limit of static analysis, and this is the narrowest check that closes THIS hole:
     * the start call must be downstream of a resolved auth state. */
    chk('the exam start waits for auth to resolve before calling the server',
        /FirebaseAuth\.waitForAuth\(\)/.test(page)
        && /return call\('netfinalStart'/.test(page),
        'netfinalStart must be inside the waitForAuth chain, not at top level');
    chk('and the start call is NOT made unconditionally at script level',
        !/^\s*call\('netfinalStart'/m.test(page),
        'a bare top-level netfinalStart call is the bug');
    chk('a signed-out visitor is told to sign in, not that the backend is broken',
        /Sign in to sit this exam/.test(page),
        'signed-out must not read as a server failure');

    chk('the clock is display-only and the server value is authoritative',
        /remainingMs/.test(page) && /setRemaining\(out\.remainingMs\)/.test(page),
        'the clock is applied centrally in call(), not per handler');
    chk('the exam id the page sends is one the server allows',
        (() => {
            const m = page.match(/EXAM_ID = '([^']+)'/);
            return !!m && EXAMS.resolveExamId(m[1]) === m[1];
        })(), (page.match(/EXAM_ID = '([^']+)'/) || [])[1] + ' vs ' + JSON.stringify(EXAMS.EXAM_IDS));
    /* THIS CHECK SCANS THE PAGE, NOT ITSELF, and I learned that the embarrassing way: it caught a
     * star glyph I had just put in the page's own comments, I removed that one, and I wrote in the
     * commit message that my emoji assertion had caught it. It had. But I had put a SECOND star in
     * THIS FILE in the same commit, which this check cannot see, and my message implied the file was
     * clean. So the test file is checked too -- a rule the suite enforces on the product but exempts
     * itself from is a rule with a hole the shape of the enforcer. */
    chk('no emoji in the page', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(page));
    chk('and none in this suite either', (() => {
        const self = require('fs').readFileSync(__filename, 'utf8');
        return !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(self);
    })(), 'this file carries a glyph the page is forbidden from having');
}

/* ─── 10. the brief and the answer review, EXECUTED ─────────────────────────────────────────────── */
/* Everything above is static analysis, and for wiring that is the honest tool. It is the wrong tool
 * here. "The brief shows the stale diagram" and "the review lists every question" are claims about
 * OUTPUT, and a text search for `decoyDiagram` would pass on a page that interpolated it into a
 * comment. So this section lifts the real functions out of the page and RUNS them, against the real
 * generator's state and the real 50 questions, and asserts on the HTML that comes back.
 *
 * It is still not a browser. It cannot prove the brief is legible or that the tab is clickable. What
 * it can prove is that the strings a student reads contain the values the server shipped, which is
 * the part that was silently absent: the page received `decoyDiagram` from the first day and
 * rendered it nowhere, and nothing failed, because nothing asked. */
section('10. the brief and the review, run for real');
{
    /* Slice a function out of the page by brace matching. Fragile by nature, so it ASSERTS it found
     * the function: a rename must break this loudly rather than quietly extract nothing and leave
     * the section passing on an empty sandbox. */
    const fnSource = (name) => {
        const start = page.indexOf('function ' + name + '(');
        if (start < 0) { return null; }
        let depth = 0, seen = false;
        for (let i = start; i < page.length; i++) {
            if (page[i] === '{') { depth++; seen = true; }
            else if (page[i] === '}') { depth--; if (seen && depth === 0) { return page.slice(start, i + 1); } }
        }
        return null;
    };
    const NEEDED = ['esc', 'hasContent', 'isDerived', 'typedQuestions', 'unansweredNumbers',
                    'missingParts', 'answerState', 'partialQuestions', 'completeCount',
                    'renderBrief', 'renderReview'];
    const sources = NEEDED.map(fnSource);
    const missing = NEEDED.filter((n, i) => !sources[i]);
    chk('every function this section runs was found in the page',
        missing.length === 0, 'not extractable: ' + missing.join(', '));

    if (missing.length === 0) {
        const build = new Function(
            'var session, tickets, questions, answers;\n' + PAGE_CONSTS + sources.join('\n') + '\n' +
            'return { set: function (s, t, q, a) { session = s; tickets = t; questions = q; answers = a; },' +
            '  renderBrief: renderBrief, renderReview: renderReview,' +
            '  unansweredNumbers: unansweredNumbers, typedQuestions: typedQuestions,' +
            '  missingParts: missingParts, answerState: answerState,' +
            '  partialQuestions: partialQuestions, completeCount: completeCount };');
        const pageFns = build();
        /* The page escapes before it renders, so a prompt must be escaped the same way to be found
         * in the output. Using the page's own function means a change to escaping cannot make the
         * strip silently miss. */
        const esc_ = new Function(fnSource('esc') + '; return esc;')();

        const lab = CORE.generate('brief-lab', EXAMS.DEFAULT_EXAM_ID, { secret: 's' });
        FAULTS.applyAll(lab);
        const init = CLIENT.toInitialState(lab);
        const qs = QUESTIONS.forStudent(lab);
        pageFns.set({ initialState: init }, init.tickets || [], qs, {});

        const brief = pageFns.renderBrief();

        // ── the brief carries the SERVER's stale values, not values I typed into the page ──────
        chk('the brief renders the documented DNS address the server shipped',
            brief.indexOf(init.decoyDiagram.dnsServer) >= 0,
            'decoyDiagram.dnsServer ' + init.decoyDiagram.dnsServer + ' is not in the brief');
        chk('the brief renders the documented second-floor management address',
            brief.indexOf(init.decoyDiagram.sw02Mgmt) >= 0,
            'decoyDiagram.sw02Mgmt ' + init.decoyDiagram.sw02Mgmt + ' is not in the brief');
        /* The decoy only works if the student is told the documentation is suspect. A stale diagram
         * presented as authoritative is not a decoy, it is a wrong answer the exam handed out. */
        chk('the brief says the documentation may be out of date',
            /may be out of date/i.test(brief) && /the network is right/i.test(brief));
        chk('the brief hard-codes neither decoy value',
            page.indexOf("'" + init.decoyDiagram.dnsServer + "'") < 0
            && page.indexOf("'" + init.decoyDiagram.sw02Mgmt + "'") < 0,
            'a literal in the page would survive the generator changing');

        /* Spec section 1: no answer may appear in the brief. The guest VLAN is Q3/Q4 territory, and
         * the diagram's job is to omit it. */
        chk('the brief states the guest VLAN is absent from the diagram rather than naming one',
            init.decoyDiagram.guestVlanShown === false && /not in the diagram/.test(brief),
            'guestVlanShown=' + init.decoyDiagram.guestVlanShown);
        const leaks = CLIENT.findDisclosures(JSON.parse(JSON.stringify({ brief: brief })));
        chk('the brief discloses no fault, slot or variant', leaks.length === 0, JSON.stringify(leaks));

        // ── the ticket count is COUNTED ────────────────────────────────────────────────────────
        chk('the brief states the real ticket count, not a number from the prose',
            brief.indexOf(String((init.tickets || []).length) + ' open ticket') >= 0,
            'tickets=' + (init.tickets || []).length);
        chk('and no other count is asserted in the brief text',
            !/\beleven\b/i.test(brief), 'the spec prose says eleven; the generator decides');

        // ── the credentials match what the shell ACCEPTS ───────────────────────────────────────
        /* A brief that invents a password costs a student minutes they do not have. The shell strips
         * everything before the @ and never prompts, so "admin, no password" is the truth. */
        chk('the brief tells the student no password is needed',
            /nothing in this lab will prompt you/i.test(brief));
        chk('the brief gives a connect form, by address and by name',
            /ssh admin@/.test(brief) && /MeridianSW-01/.test(brief));

        // ── the review lists EVERY question ────────────────────────────────────────────────────
        const review = pageFns.renderReview();
        chk('the review lists all ' + qs.length + ' questions', qs.length === 50
            && qs.every(q => review.indexOf('<th>' + q.n + '</th>') >= 0),
            'questions=' + qs.length);
        chk('the review groups them under every phase the server uses',
            QUESTIONS.PHASES.every(ph => review.indexOf('>' + ph + '</h2>') >= 0),
            JSON.stringify(QUESTIONS.PHASES));
        chk('with nothing answered, every typed question reads "not answered"',
            (review.match(/not answered/g) || []).length === pageFns.typedQuestions().length,
            'typed=' + pageFns.typedQuestions().length
            + ' shown=' + (review.match(/not answered/g) || []).length);
        /* The two kinds with no input field. Marking them unanswered would send a student hunting a
         * control that does not exist, so they must read as graded-from-the-network. */
        const derived = qs.filter(q => q.kind === 'state' || q.kind === 'sequence');
        chk('the derived questions exist, so the branch below is reachable',
            derived.length > 0, 'no state/sequence questions');
        chk('derived questions are not reported as unanswered',
            pageFns.unansweredNumbers().indexOf(derived[0].n) < 0
            && /graded from the network/.test(review));
        /* MEASURED ON THE PAGE'S OWN WORDS, not on the question text. The first version of this
         * check scanned the whole table and failed on four questions that legitimately ask which
         * value is CORRECT. That failure was the assertion aiming at the wrong surface: the claim
         * is that the PAGE states no verdict, and a question's own wording is not the page's. So the
         * prompts are removed first, and the count of what is removed is asserted, because a strip
         * that silently removed everything would make this pass on an empty string. */
        const chrome = qs.reduce((acc, q) => acc.split(esc_(q.prompt)).join(''), review);
        chk('stripping the question prompts leaves the page chrome, not nothing',
            chrome.length > 200 && chrome.length < review.length,
            'chrome=' + chrome.length + ' review=' + review.length);
        chk('the page chrome never states a verdict on an answer',
            !/\b(correct|incorrect|right|wrong|score|points?)\b/i.test(
                chrome.replace(/not whether it is correct/g, '')),
            'an exam that leaks correctness mid-sitting is not an exam');

        // ── and it reflects SAVED answers, which is the point ──────────────────────────────────
        const typed = pageFns.typedQuestions();
        const one = typed[0];
        pageFns.set({ initialState: init }, init.tickets || [], qs, { [one.id]: 'my-typed-answer' });
        const review2 = pageFns.renderReview();
        chk('an answer the server stored appears in the review',
            review2.indexOf('my-typed-answer') >= 0, 'q=' + one.id);
        chk('and the recorded count moves with it',
            review2.indexOf('1 of ' + typed.length + ' written answers complete') >= 0,
            'expected 1 of ' + typed.length + ', one answer having been saved');
        chk('the count excludes the derived questions from its denominator',
            typed.length < qs.length
            && review2.indexOf('plus ' + (qs.length - typed.length) + ' graded from the network') >= 0,
            'typed=' + typed.length + ' total=' + qs.length);
        chk('that question is no longer listed as unanswered',
            pageFns.unansweredNumbers().indexOf(one.n) < 0);

        /* The two-field ACL question stores an object. Showing "[object Object]" to a student is the
         * same class of bug as the production `[object Object]` completion keys. */
        const acl = qs.find(q => q.kind === 'aclref');
        if (acl) {
            pageFns.set({ initialState: init }, init.tickets || [], qs,
                { [acl.id]: { name: 'BLOCK-GUEST', seq: '20' } });
            const review3 = pageFns.renderReview();
            chk('a two-field answer renders both fields, not [object Object]',
                review3.indexOf('BLOCK-GUEST 20') >= 0 && review3.indexOf('[object Object]') < 0,
                'composite answers must be readable');
        } else {
            chk('an aclref question exists to exercise the composite path', false, 'none found');
        }

        // ── escaping, because these strings reach innerHTML ───────────────────────────────────
        pageFns.set({ initialState: init }, init.tickets || [], qs, { [one.id]: '<img src=x onerror=1>' });
        chk('a saved answer is escaped before it reaches innerHTML',
            pageFns.renderReview().indexOf('<img src=x') < 0,
            'the review writes to innerHTML, so an unescaped answer is stored XSS');
        /* EVERY string the server supplies, not one of them. The first version of this check put
         * markup in `dnsServer` only, and a mutation that dropped `esc()` from `sw02Mgmt` went
         * uncaught: the assertion proved one field safe and read as if it proved the brief safe. So
         * the payload is injected into every string field the projection actually carries, derived
         * from the live object rather than a list I maintain by hand. */
        const strFields = Object.keys(init.decoyDiagram)
            .filter(k => typeof init.decoyDiagram[k] === 'string');
        chk('the brief has more than one server-supplied string to escape',
            strFields.length > 1, JSON.stringify(strFields));
        const poisoned = {};
        strFields.forEach((k, i) => { poisoned[k] = '<img src=x onerror=' + i + '>'; });
        pageFns.set({ initialState: { decoyDiagram: poisoned } }, [], qs, {});
        const poisonedBrief = pageFns.renderBrief();
        const unescaped = strFields.filter(k => poisonedBrief.indexOf(poisoned[k]) >= 0);
        chk('no server value reaches the brief unescaped',
            unescaped.length === 0, 'rendered raw: ' + unescaped.join(', '));
        /* The check above is vacuous for a field the brief never renders, so the rendered ones are
         * counted. Not all of them ARE rendered, and that is deliberate: see the note below. */
        const rendered = strFields.filter(k => poisonedBrief.indexOf(esc_(poisoned[k])) >= 0);
        chk('at least two server strings do reach the brief, so that check has teeth',
            rendered.length >= 2, 'rendered: ' + rendered.join(', ') + ' of ' + strFields.join(', '));

        /* THE NOTE MUST NOT BE RENDERED. `decoyDiagram.note` reads "Intentionally stale. Never read
         * by the generator; shown to the student only." It is an annotation for whoever reads the
         * payload, and printing it to a student would announce that the diagram is a planted decoy,
         * which is the giveaway for Q3 and Q4. Found by the teeth check above: it failed when I
         * asserted every string field reaches the brief, and the right answer was not to render the
         * third one but to prove it stays out. */
        chk('the brief does not render the decoy annotation',
            typeof init.decoyDiagram.note === 'string'
            && brief.indexOf(init.decoyDiagram.note) < 0
            && !/intentionally stale/i.test(brief),
            'the note tells the student the diagram is a trap');

        // ── the brief must survive a session that has not arrived ─────────────────────────────
        /* showSurface can fire before `session` is set if a tab is clicked during boot. A throw there
         * would leave the window body on "Loading" with no way back. */
        pageFns.set(null, [], [], {});
        let threw = null;
        try { pageFns.renderBrief(); pageFns.renderReview(); } catch (e) { threw = e.message; }
        chk('neither surface throws before the session exists', threw === null, String(threw));
    }
}

/* ─── 11. both surfaces are reachable and cost nothing on the clock ─────────────────────────────── */
section('11. the two new tabs are wired, and locally rendered');
{
    chk('the brief and the review are tabs the student can click',
        /data-surface="brief"/.test(page) && /data-surface="review"/.test(page));
    chk('the page opens ON the brief, not on a blank terminal prompt',
        /showSurface\('brief'\)/.test(page),
        'the markup starts with the terminal visible, so the surface var alone does nothing');
    /* THE WHOLE POINT of rendering these locally: showSurface calls netfinalWindow for every other
     * surface. Re-reading the brief must not cost a round trip, and must not be able to fail. */
    chk('neither surface is a server window, so re-reading cannot fail on a blip',
        /hasOwnProperty\.call\(LOCAL_SURFACES, name\)/.test(page)
        && /LOCAL_SURFACES\[name\]\(\)/.test(page));
    chk('the local branch returns BEFORE the netfinalWindow call',
        page.indexOf('LOCAL_SURFACES[name]()') < page.indexOf("call('netfinalWindow'"),
        'falling through would ask the server for a window it does not have');
    /* `brief` and `review` are not engine windows. If they ever became engine windows, the local
     * branch would shadow them, so this asserts they are not. */
    chk('the engine declares no window by either name',
        Object.keys(GUI.RENDERERS || {}).indexOf('brief') < 0
        && Object.keys(GUI.RENDERERS || {}).indexOf('review') < 0,
        'a local surface shadowing a real window would hide it');

    // ── the submit warning reads the same rule the review does ───────────────────────────────
    chk('the submit confirmation names the unanswered questions',
        /unansweredNumbers\(\)/.test(page) && /No answer recorded yet for Q|no answer recorded for /i.test(page));
    chk('and it derives them from the shared helper, not its own copy',
        (page.match(/function unansweredNumbers/g) || []).length === 1
        && (page.match(/unansweredNumbers\(\)/g) || []).length >= 2,
        'two copies of this rule is how the count and the cards came to disagree before');
    chk('cancelling the confirmation does not submit',
        /if \(!window\.confirm\(msg\)\) \{ return; \}/.test(page));
    chk('the timed auto-submit does NOT ask for confirmation',
        /remaining === 0[\s\S]{0,400}?call\('netfinalSubmit'/.test(page),
        'a confirm on expiry would let a student hold the exam open past the clock');
}

/* ─── 12. the header counter and the review agree ───────────────────────────────────────────────── */
/* NANCY, finding 1, and she was right. The header counter divided by all fifty questions while
 * `markAnswered` could only ever mark the 31 that have an input control, so it was pinned at 31/50
 * for the whole sitting. On its own that was a long-standing wart nobody had measured. Adding the
 * review tab turned it into a contradiction: one surface saying "every question that takes a written
 * answer has one" while the header said 31/50, three inches apart, minutes before an irreversible
 * submit. My 106 assertions did not catch it because they ran `renderReview` in isolation and never
 * put the two numbers side by side, which is the whole class of defect the operator's own comment at
 * `refreshAnswerCount` was written about. */
section('12. the header counter cannot disagree with the review');
{
    const refresh = (() => {
        const i = page.indexOf('function refreshAnswerCount(');
        return i < 0 ? '' : page.slice(i, page.indexOf('}', page.indexOf('textContent', i)));
    })();
    chk('refreshAnswerCount was found', refresh.length > 0);
    chk('the header divides by the typed questions, not by all fifty',
        /typedQuestions\(\)\.length/.test(refresh) && !/\/ ' \+ questions\.length/.test(refresh),
        'dividing by questions.length pins the header at 31/50: ' + refresh.replace(/\s+/g, ' '));
    chk('and it says WHAT it counts, so 31/31 is not read as 31 of fifty',
        /written answers/.test(refresh), refresh.replace(/\s+/g, ' '));
    /* Both surfaces must read ONE definition. Two call sites of one helper, not two helpers. */
    chk('the header and the review share the denominator helper',
        (page.match(/function typedQuestions/g) || []).length === 1
        && (page.match(/typedQuestions\(\)/g) || []).length >= 3,
        'calls: ' + (page.match(/typedQuestions\(\)/g) || []).length);
    chk('nothing still divides a displayed count by the full question list',
        !/questions\.length \+ ' answered'/.test(page));

    /* The numerator can only move for a question with a control, so the claim is that the two
     * populations are THE SAME population. Measured, not asserted: every typed question must render
     * a data-q control and every derived one must not. */
    const lab2 = CORE.generate('counter-lab', EXAMS.DEFAULT_EXAM_ID, { secret: 's' });
    FAULTS.applyAll(lab2);
    const qs2 = QUESTIONS.forStudent(lab2);
    const derived2 = qs2.filter(q => q.kind === 'state' || q.kind === 'sequence');
    chk('the derived questions are the ONLY ones the page gives no control',
        derived2.length === 19 && qs2.length === 50,
        'derived=' + derived2.length + ' total=' + qs2.length);
    chk('the page renders a control for every other kind',
        qs2.filter(q => q.kind !== 'state' && q.kind !== 'sequence')
           .every(q => ['text', 'multi', 'select', 'aclref'].indexOf(q.kind) >= 0),
        'an unhandled kind would fall to the text input and still be countable');

    /* NANCY, finding 3: is any stored answer an ARRAY? She could not confirm it and reasoned from
     * `typeof`. It is not reachable: Q6 is kind `multi` with norm `vlanSet`, and the page has no
     * `multi` branch, so it falls to the plain text input and stores a STRING. `aclref` is the only
     * control that stores an object. Asserted so that adding a real multi-select control cannot
     * quietly start rendering [object Object] into the review. */
    const objectKinds = qs2.filter(q => q.kind === 'aclref').map(q => q.kind);
    chk('aclref is the only kind that stores a composite answer',
        objectKinds.length === 1
        && !/q\.kind === 'multi'/.test(page)
        && /q\.kind === 'aclref'/.test(page),
        'a new composite control must be checked against the review renderer');
    const multi = qs2.find(q => q.kind === 'multi');
    chk('the multi question exists and the page gives it a plain text control',
        !!multi && multi.norm === 'vlanSet',
        'if this kind gains a control, re-check the review object branch');
}

/* ─── 13. a HALF-FILLED composite answer ────────────────────────────────────────────────────────── */
/* CHRIS BLOCKED HERE, and the block was correct. `hasContent` uses `.some()`, so one of the two
 * aclref fields made the whole answer "answered". That was harmless while the function only drove a
 * CSS highlight. This change put it in charge of the review table and the ONE-ATTEMPT submit
 * warning without my re-checking that its meaning still fitted the larger job, so the feature built
 * to catch a silently incomplete answer reported the most likely incomplete answer as finished, on
 * the hardest question in the exam.
 *
 * My section 10 test for the composite path fed the two-field control two values. That proves the
 * happy path and nothing about the halves. Two fixtures, always: every permutation is driven here. */
section('13. a half-filled two-field answer is not "answered"');
{
    const fnSource = (name) => {
        const start = page.indexOf('function ' + name + '(');
        if (start < 0) { return null; }
        let depth = 0, seen = false;
        for (let i = start; i < page.length; i++) {
            if (page[i] === '{') { depth++; seen = true; }
            else if (page[i] === '}') { depth--; if (seen && depth === 0) { return page.slice(start, i + 1); } }
        }
        return null;
    };
    const NEED = ['esc', 'hasContent', 'isDerived', 'typedQuestions', 'unansweredNumbers',
                  'missingParts', 'answerState', 'partialQuestions', 'completeCount', 'renderReview'];
    const srcs = NEED.map(fnSource);
    chk('every helper this section runs was found', srcs.every(Boolean),
        'missing: ' + NEED.filter((n, i) => !srcs[i]).join(', '));

    const declared = (page.match(/var COMPOSITE_PARTS = \{([^}]*)\}/) || [])[1] || '';
    const parts = (declared.match(/'[a-z]+'/g) || []).map(x => x.replace(/'/g, ''));
    chk('COMPOSITE_PARTS declares the aclref fields, once',
        /aclref:/.test(declared) && parts.length === 2
        && (page.match(/var COMPOSITE_PARTS/g) || []).length === 1,
        'declared: ' + declared.trim());
    /* THE DECLARATION MUST MATCH THE RENDERER. A third field added to the control without being
     * added here would be silently optional, which is this defect all over again. */
    const rendered = (page.match(/data-part="([a-z]+)"/g) || [])
        .map(x => x.replace(/data-part="|"/g, '')).filter((v, i, a) => a.indexOf(v) === i).sort();
    chk('the declared parts are exactly the data-part controls the page renders',
        JSON.stringify(rendered) === JSON.stringify(parts.slice().sort()),
        'rendered ' + JSON.stringify(rendered) + ' vs declared ' + JSON.stringify(parts.slice().sort()));
    /* And the SERVER requires both, so this is not a page-side opinion about what counts as done. */
    chk('the server requires both fields too',
        JSON.stringify((QUESTIONS.REQUIRED_FIELDS || {}).aclRef) === JSON.stringify(parts),
        JSON.stringify((QUESTIONS.REQUIRED_FIELDS || {}).aclRef));

    if (srcs.every(Boolean)) {
        const fns = new Function(
            'var session, tickets, questions, answers;\n' + PAGE_CONSTS + srcs.join('\n') + '\n' +
            'return { set: function (s, t, q, a) { session = s; tickets = t; questions = q; answers = a; },' +
            ' answerState: answerState, missingParts: missingParts, renderReview: renderReview,' +
            ' unansweredNumbers: unansweredNumbers, partialQuestions: partialQuestions,' +
            ' completeCount: completeCount, hasContent: hasContent };')();

        const lab3 = CORE.generate('partial-lab', EXAMS.DEFAULT_EXAM_ID, { secret: 's' });
        FAULTS.applyAll(lab3);
        const qs3 = QUESTIONS.forStudent(lab3);
        const acl = qs3.find(q => q.kind === 'aclref');
        chk('there is an aclref question to drive', !!acl);

        /* Stated as the thing a student actually does, every permutation of it. */
        const cases = [
            { v: undefined,                          want: 'blank',    why: 'nothing entered' },
            { v: { name: '', seq: '' },              want: 'blank',    why: 'both halves empty' },
            { v: { name: 'BLOCK-GUEST', seq: '' },   want: 'partial',  why: 'picked the ACL, never typed the number' },
            { v: { name: '', seq: '20' },            want: 'partial',  why: 'typed the number, never picked the ACL' },
            { v: { name: 'BLOCK-GUEST', seq: '20' }, want: 'complete', why: 'both halves' },
            { v: 'BLOCK-GUEST',                      want: 'blank',    why: 'a non-object supplies no part' }
        ];
        cases.forEach((c) => {
            fns.set({}, [], qs3, c.v === undefined ? {} : { [acl.id]: c.v });
            chk('aclref with ' + c.why + ' is "' + c.want + '"',
                fns.answerState(acl) === c.want,
                'got ' + fns.answerState(acl) + ' for ' + JSON.stringify(c.v));
        });

        /* hasContent is not wrong, it answers a different question, and that is precisely why
         * leaning on it here was the defect. Asserted so nobody folds answerState back into it. */
        fns.set({}, [], qs3, { [acl.id]: { name: 'BLOCK-GUEST', seq: '' } });
        chk('hasContent alone would still call the half answer answered',
            fns.hasContent({ name: 'BLOCK-GUEST', seq: '' }) === true
            && fns.answerState(acl) === 'partial',
            'if these two ever agree, one of them has lost its meaning');

        chk('a half answer is NOT counted as a complete written answer',
            fns.completeCount() === 0, 'completeCount=' + fns.completeCount());
        chk('a half answer is NOT in the blank list, because it is not blank',
            fns.unansweredNumbers().indexOf(acl.n) < 0);
        chk('a half answer IS in the part-answered list',
            fns.partialQuestions().map(q => q.n).indexOf(acl.n) >= 0,
            'partial: ' + JSON.stringify(fns.partialQuestions().map(q => q.n)));
        chk('missingParts names the missing half only',
            JSON.stringify(fns.missingParts(acl)) === JSON.stringify(['seq']),
            JSON.stringify(fns.missingParts(acl)));

        const rev = fns.renderReview();
        chk('the review calls it part answered and says WHICH half is missing',
            /part answered/i.test(rev) && /the sequence number/.test(rev),
            'a student must be told which field, not merely that something is wrong');
        /* NANCY, finding 2: this assertion was VACUOUS and I left it standing beside the fix for it.
         * In this fixture 30 other questions are blank, so `blank.length` alone suppresses the
         * all-clear and deleting the partial condition entirely would not have moved it. She proved
         * that by mutation in a worktree copy. The isolated version lives further down, where every
         * other question is complete; what THIS fixture can honestly prove is that the two notices
         * coexist, so a half answer is not hidden behind the blank list. */
        chk('the blank notice and the part-answered notice are shown TOGETHER',
            /No answer recorded yet for Q/.test(rev) && /is only part answered/.test(rev),
            'a half answer must not be swallowed by the blank list');
        chk('and it shows the half they DID fill, so they recognise the question',
            rev.indexOf('BLOCK-GUEST') >= 0);
        /* The mirrored half, so this is not a one-fixture check either. */
        fns.set({}, [], qs3, { [acl.id]: { name: '', seq: '20' } });
        chk('the mirrored half answer names the OTHER missing field',
            /the ACL name/.test(fns.renderReview())
            && JSON.stringify(fns.missingParts(acl)) === JSON.stringify(['name']),
            JSON.stringify(fns.missingParts(acl)));

        /* The all-clear must stay REACHABLE, or a warning nobody can clear is just noise. */
        const all = {};
        qs3.filter(q => q.kind !== 'state' && q.kind !== 'sequence').forEach((q) => {
            all[q.id] = q.kind === 'aclref' ? { name: 'BLOCK-GUEST', seq: '20' } : 'x';
        });
        fns.set({}, [], qs3, all);
        chk('with every field filled the review gives the all-clear',
            /Every question that takes a written answer has a complete/.test(fns.renderReview())
            && fns.partialQuestions().length === 0 && fns.unansweredNumbers().length === 0,
            'partial=' + fns.partialQuestions().length + ' blank=' + fns.unansweredNumbers().length);
        chk('and every typed question counts as complete',
            fns.completeCount() === qs3.filter(q => q.kind !== 'state' && q.kind !== 'sequence').length,
            'completeCount=' + fns.completeCount());

        /* THE ALL-CLEAR, ISOLATED. The earlier half-answer fixture left the other 30 questions blank,
         * so `blank.length` alone suppressed the all-clear and a mutation deleting the partial
         * condition entirely still passed. Only a lab where EVERYTHING else is finished can show
         * whether a half answer on its own holds the all-clear back. */
        const allButAcl = {};
        qs3.filter(q => q.kind !== 'state' && q.kind !== 'sequence').forEach((q) => {
            allButAcl[q.id] = q.kind === 'aclref' ? { name: 'BLOCK-GUEST', seq: '' } : 'x';
        });
        fns.set({}, [], qs3, allButAcl);
        chk('nothing else is outstanding in this fixture, so the all-clear is the only thing blocking',
            fns.unansweredNumbers().length === 0 && fns.partialQuestions().length === 1,
            'blank=' + fns.unansweredNumbers().length + ' partial=' + fns.partialQuestions().length);
        const lastRev = fns.renderReview();
        chk('ONE half answer alone holds back the all-clear',
            !/Every question that takes a written answer has a complete/.test(lastRev),
            'the all-clear fired with a half answer outstanding and everything else done');
        chk('and that one question is still named with its missing field',
            lastRev.indexOf('Q' + acl.n + ' is only part answered') >= 0
            && /the sequence number/.test(lastRev),
            'the student must be able to find it from the notice alone');
        chk('the header count excludes it, so header and review agree',
            fns.completeCount()
              === qs3.filter(q => q.kind !== 'state' && q.kind !== 'sequence').length - 1,
            'completeCount=' + fns.completeCount());
    }

    /* SCOPED TO THE FUNCTION, not to the file. Both of these checks first searched the whole page
     * and both passed with the code mutated away: `answerState(q) === 'complete'` also appears in
     * `completeCount`, and "is only part answered" also appears in the review's own notice, so a
     * file-wide match proved the string existed SOMEWHERE and nothing about the surface that needs
     * it. Measure the claim, not a proxy for it. */
    const bodyOf = (startNeedle) => {
        const i = page.indexOf(startNeedle);
        if (i < 0) { return ''; }
        let depth = 0, seen = false;
        for (let j = i; j < page.length; j++) {
            if (page[j] === '{') { depth++; seen = true; }
            else if (page[j] === '}') { depth--; if (seen && depth === 0) { return page.slice(i, j + 1); } }
        }
        return '';
    };
    const markBody = bodyOf('function markAnswered(');
    const submitBody = bodyOf("el('submit').addEventListener('click'");
    chk('both bodies were located, so the two checks below can fail',
        markBody.length > 50 && submitBody.length > 200,
        'mark=' + markBody.length + ' submit=' + submitBody.length);
    chk('markAnswered itself lights the card on COMPLETE, not on hasContent',
        /answerState\(q\) === 'complete'/.test(markBody),
        'one filled field of two would light the card and enter the header count');
    chk('the SUBMIT handler itself warns about part-answered questions',
        /partialQuestions\(\)/.test(submitBody) && /part answered/.test(submitBody),
        'the review mentioning it is not the submit confirmation mentioning it');
    chk('and it names the missing field in that warning',
        /missingParts\(q\)/.test(submitBody) && /PART_LABELS/.test(submitBody),
        'a count without the field name sends a student back to guess which half');
    chk('one rule drives every surface that reports on an answer',
        (page.match(/function answerState/g) || []).length === 1
        && (page.match(/answerState\(/g) || []).length >= 4,
        'answerState call sites: ' + (page.match(/answerState\(/g) || []).length);
}

/* ─── 14. the save path: stale responses and lost revision races ────────────────────────────────── */
/* NANCY, round 3 finding 3. `saveAnswer` applied whatever its closure captured, so two saves in
 * flight for one question -- which the composite handler guarantees, since it posts the whole pair
 * on every change to either control -- could land out of order and let the EARLIER, less complete
 * value win. The render suite proves the behaviour in a browser with the responses genuinely
 * reordered; these are the structural facts a text search can settle, including the retry bound I
 * could not build a reliable browser fixture for. */
section('14. the answer-save path is ordered and bounded');
{
    const saveBody = (() => {
        const i = page.indexOf('function saveAnswer(');
        if (i < 0) { return ''; }
        let d = 0, seen = false;
        for (let j = i; j < page.length; j++) {
            if (page[j] === '{') { d++; seen = true; }
            else if (page[j] === '}') { d--; if (seen && d === 0) { return page.slice(i, j + 1); } }
        }
        return '';
    })();
    chk('saveAnswer was located', saveBody.length > 200, 'len=' + saveBody.length);

    /* ORDERING. The guard must come BEFORE anything it protects, the clock included: a stale reply
     * carries a larger remainingMs and would hand the student time back. */
    const guard = saveBody.indexOf('seq !== saveSeq[id]');
    chk('a per-question sequence guard exists', guard >= 0,
        'without it the earlier save wins when it lands last');
    chk('the guard runs BEFORE the stored answer is updated',
        guard >= 0 && guard < saveBody.indexOf('answers[id] = value'),
        'applying then checking is not a guard');
    /* THE CLOCK MOVED UP A LEVEL, and the assertion has to move with it. `remaining` is a single
     * global, so a per-question counter cannot order it: two saves for DIFFERENT questions are each
     * the newest for their own question, both pass this guard, and whichever response lands last
     * sets the clock even when it was issued first. An earlier request carries a LARGER remainingMs,
     * so the displayed clock ticked UP. Nancy reproduced that on 7 of 22 runs; I reproduced it on
     * 4 of 12. It is now applied once, in `call`, under a global request counter. */
    const callBody = (() => {
        const i = page.indexOf('function call(name, data)');
        if (i < 0) { return ''; }
        let d = 0, seen = false;
        for (let j = i; j < page.length; j++) {
            if (page[j] === '{') { d++; seen = true; }
            else if (page[j] === '}') { d--; if (seen && d === 0) { return page.slice(i, j + 1); } }
        }
        return '';
    })();
    chk('the call wrapper was located', callBody.length > 150, 'len=' + callBody.length);
    chk('EXACTLY ONE place writes the clock from a response',
        (page.match(/setRemaining\((?:out|r)\.remainingMs\)/g) || []).length === 1
        && /setRemaining\(out\.remainingMs\)/.test(callBody),
        'found ' + (page.match(/setRemaining\((?:out|r)\.remainingMs\)/g) || []).length
        + ' writers; five handlers each writing one global is how it got out of order');
    chk('that writer is guarded by a GLOBAL request counter, not a per-question one',
        /seq >= clockSeq/.test(callBody) && /var seq = \+\+reqSeq/.test(callBody),
        callBody.replace(/\s+/g, ' ').slice(0, 200));
    chk('the guard is checked BEFORE the clock is applied',
        callBody.indexOf('seq >= clockSeq') < callBody.indexOf('setRemaining'),
        'applying then checking is not a guard');
    /* AGAINST THE INVOCATION, not the availability check. `callFunction` appears first in the
     * `typeof FirebaseAuth.callFunction !== 'function'` guard at the top of the wrapper, so matching
     * the bare name compared the counter's position against the wrong occurrence and failed on
     * correct code. Fourth time in this feature that a check of mine aimed at too wide a surface. */
    chk('and the counter is advanced per REQUEST, before the call is made',
        callBody.indexOf('++reqSeq') > 0
        && callBody.indexOf('++reqSeq') < callBody.indexOf('FirebaseAuth.callFunction(name'),
        'advancing it when the response lands would record ARRIVAL order, which is the bug');
    chk('no handler sets the clock from its own response any more',
        !/\.then\(function \(r\) \{\s*setRemaining/.test(page),
        'a second writer reopens the whole class');
    chk('the counter increments per save, not per question once',
        /saveSeq\[id\] = \(saveSeq\[id\] \|\| 0\) \+ 1/.test(saveBody),
        'a counter that does not advance cannot order anything');

    /* THE RETRY, and its two dangerous edges. */
    chk('a lost revision race is retried rather than dropped',
        /lostRace/.test(saveBody) && /saveAnswer\(id, value, attempt \+ 1\)/.test(saveBody),
        'the server calls aborted the code the client should retry on, and the page did not');
    /* SCOPED TO THE STATEMENT, because the comment above it quotes BOTH strings verbatim. Nancy
     * deleted each half of the condition in turn against a scratch copy and this reported ok both
     * times: it was matching the prose that explains the code, not the code. That is the third time
     * in this feature a check of mine searched too wide a surface, and the second time it reappeared
     * in the very section written to replace the last one. */
    const lostRaceStmt = (saveBody.match(/var lostRace =[\s\S]*?;/) || [''])[0];
    chk('the lostRace statement was located', lostRaceStmt.length > 40, JSON.stringify(lostRaceStmt));
    chk('both transport spellings are matched IN THE STATEMENT, not in its comment',
        /aborted/.test(lostRaceStmt) && /session changed while this request/i.test(lostRaceStmt),
        'the SDK reports functions/aborted, a direct bridge reports aborted: ' + lostRaceStmt);
    /* THE EDGE THAT LOSES AN ANSWER: re-sending a superseded value writes the stale half back over
     * the complete pair ON THE SERVER. Worse than the bug the retry fixes. */
    chk('a SUPERSEDED save is never retried',
        /attempt < MAX_SAVE_ATTEMPTS && seq === saveSeq\[id\]/.test(saveBody),
        'retrying a replaced value overwrites the newer answer on the server');
    /* THE BOUND, stated as a number so it can be asserted at all. */
    const maxDecl = (page.match(/var MAX_SAVE_ATTEMPTS = (\d+);/) || [])[1];
    chk('the retry bound is a declared constant', maxDecl !== undefined, 'not declared');
    chk('and it is 2: one try, one retry', Number(maxDecl) === 2, 'MAX_SAVE_ATTEMPTS=' + maxDecl);
    chk('the recursion is bounded BY that constant, not by a boolean',
        /attempt < MAX_SAVE_ATTEMPTS/.test(saveBody) && !/!isRetry/.test(saveBody),
        'a boolean bound is correct and not falsifiable; a constant is both');
    chk('the attempt number defaults, so the first call needs no argument',
        /attempt = attempt \|\| 1/.test(saveBody));
    /* And a failure that is NOT a lost race must still reach the student. */
    chk('any other error still surfaces',
        /fatal\(e\)/.test(saveBody), 'swallowing a real failure would hide a broken save');
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
