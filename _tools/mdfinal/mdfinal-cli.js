#!/usr/bin/env node
/**
 * mdfinal-cli.js — sit the MD-100 final from a terminal, through the real session service.
 *
 * @catalog what    Text harness for the MD-100 final: one call per invocation against the real
 * @catalog what    session service (mdfinal-exam.js) with a file-backed store; journals every call
 * @catalog what    with a timestamp, for the D6 non-author completability run and for staff dry runs.
 * @catalog run     node _tools/mdfinal/mdfinal-cli.js --run <dir> help
 * @catalog status  TOOL
 *
 * WHAT IT IS FOR. Spec 8 D6: an agent that did not write the engine sits the exam from the brief
 * only, at student speed, on a fresh seed, and records its steps, stuck points and wall time. It sees
 * exactly what the page would: the start reply, window views, action and command replies, and after
 * submit the aggregates-only report. It never prints the answer key or any server-only field.
 *
 * TEST SECRET ONLY. The lab is generated with the suites' fixed test secret, never the production
 * secret, so nothing here reproduces a real student's lab. The store file under --run holds the key
 * (as Firestore would); a sitter must not read it, and the run brief says so.
 *
 *   start [--uid U] [--rehearsal]        create or resume the sitting (allowlisted locally)
 *   brief                                the rules, requirements and task list, as the page shows them
 *   screen                               screen, open windows, consoles, ticket, time left
 *   actions [window]                     the action table (forms the page would draw)
 *   window <name> [json-params]          render one window
 *   act <window> <action> [json-params]  one GUI action
 *   cmd <console> <line...>              one console line (hyperv-ps, setup-cmd, oobe-cmd, ps, winre-cmd)
 *   answer <field> <value...>            save one as-built (P8) field
 *   handover                             hand the PC over (one way)
 *   reset                                restart your build (before handover, at most twice)
 *   submit                               submit and print the aggregates-only report
 *   journal                              the call log: count, first and last timestamp
 */
const fs = require('fs');
const path = require('path');
const kit = require('./mdfinal-test-kit.js');
const EXAM = kit.req('mdfinal-exam.js');
const EXAMS = kit.req('mdfinal-exams.js');

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); if (i < 0) { return null; } const v = argv[i + 1]; argv.splice(i, 2); return v; };
const bool = (name) => { const i = argv.indexOf(name); if (i < 0) { return false; } argv.splice(i, 1); return true; };
const RUN = flag('--run') || path.join(process.cwd(), 'mdfinal-run');
const UID = flag('--uid');
const REHEARSAL = bool('--rehearsal');
const [verb, ...rest] = argv;

fs.mkdirSync(RUN, { recursive: true });
const STORE = path.join(RUN, 'store.json');
const JOURNAL = path.join(RUN, 'journal.jsonl');
const META = path.join(RUN, 'meta.json');

/* A store with the service's contract, persisted to one JSON file between invocations. */
function fileStore() {
    const load = () => (fs.existsSync(STORE) ? JSON.parse(fs.readFileSync(STORE, 'utf8')) : { live: {}, archive: {}, control: {} });
    const save = (d) => fs.writeFileSync(STORE, JSON.stringify(d));
    const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    return {
        get: async (k) => { const d = load(); return own(d.live, k) ? d.live[k] : null; },
        create: async (k, doc) => { const d = load(); if (own(d.live, k)) { return false; } d.live[k] = doc; save(d); return true; },
        putIfRev: async (k, doc, rev) => { const d = load(); if (!EXAM.sameSitting(own(d.live, k) ? d.live[k] : null, doc, rev)) { return false; } d.live[k] = doc; save(d); return true; },
        replaceIfRev: async (k, cur, rev, aid, adoc, next) => {
            const d = load(); if (!EXAM.sameSitting(own(d.live, k) ? d.live[k] : null, cur, rev)) { return false; }
            d.archive[aid] = adoc; d.live[k] = next; save(d); return true;
        },
        getControl: async (e) => { const d = load(); return own(d.control, e) ? d.control[e] : { armed: false, allowUids: [] }; },
        putControl: async (e, c) => { const d = load(); d.control[e] = c; save(d); return true; }
    };
}

/* The sitting this run directory belongs to. */
function meta() { return fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : null; }

/* Unwraps { $s } student-text nodes, as the page does. */
function unwrap(v) { return JSON.parse(JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) && Object.keys(x).length === 1 && typeof x.$s === 'string' ? x.$s : x))); }

/* Prints a value readably. */
function show(v) { console.log(typeof v === 'string' ? v : JSON.stringify(unwrap(v), null, 2)); }

/* Appends one journal line. */
function journal(entry) { fs.appendFileSync(JOURNAL, JSON.stringify(Object.assign({ at: new Date().toISOString() }, entry)) + '\n'); }

/* Parses an optional JSON argument. */
function json(s) { if (s === undefined) { return {}; } try { return JSON.parse(s); } catch (e) { throw new Error('params must be JSON, e.g. \'{"name":"MER-WS"}\''); } }

(async () => {
    const st = fileStore();
    const o = { secret: kit.TEST_SECRET };
    const m = meta();
    if (verb === 'start') {
        const uid = (m && m.uid) || UID || ('cli-' + Date.now().toString(36));
        const examId = (m && m.examId) || (REHEARSAL ? EXAMS.REHEARSAL_EXAM_ID : EXAMS.DEFAULT_EXAM_ID);
        await st.putControl(examId, { armed: false, allowUids: [uid] });
        const r = await EXAM.startExam(st, { studentId: uid, examId }, o);
        fs.writeFileSync(META, JSON.stringify({ uid, examId, sessionId: r.sessionId }));
        journal({ verb, resumed: r.resumed });
        show({ resumed: r.resumed, submitted: r.submitted, screen: r.screen, remainingMinutes: Math.round(r.remainingMs / 60000),
               windows: r.initialState.windows, consoles: r.initialState.consoles, selfResetsLeft: r.selfResetsLeft });
        return;
    }
    if (verb === 'journal') {
        const lines = fs.existsSync(JOURNAL) ? fs.readFileSync(JOURNAL, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : [];
        const by = {}; lines.forEach((l) => { by[l.verb] = (by[l.verb] || 0) + 1; });
        show({ calls: lines.length, byVerb: by, first: lines[0] && lines[0].at, last: lines.length ? lines[lines.length - 1].at : null });
        return;
    }
    if (!verb || verb === 'help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').filter((l) => /^ \*   /.test(l)).map((l) => l.slice(3)).join('\n')); return; }
    if (!m) { console.log('No sitting in ' + RUN + '. Run: start'); process.exitCode = 1; return; }
    const sid = m.sessionId;
    try {
        let out;
        if (verb === 'brief' || verb === 'screen' || verb === 'actions') {
            const r = await EXAM.startExam(st, { studentId: m.uid, examId: m.examId }, o);
            const i = r.initialState;
            if (verb === 'brief') { out = { rules: i.rules, workOrder: i.wo.ticket, requirements: i.wo.requirements, editionRule: i.wo.editionRule, tasks: i.tasks.map((x) => x.phase + '  ' + x.text), keyTable: i.keyTable }; }
            else if (verb === 'screen') { out = { screen: i.screen, message: i.screenMessage, windows: i.windows, consoles: i.consoles, handedOver: i.handedOver, ticket: i.ticket, answerFields: i.answerFields, remainingMinutes: Math.round(r.remainingMs / 60000), submitted: r.submitted }; }
            else { out = i.actions.filter((a) => !rest[0] || a.id.split('/')[0] === rest[0]); }
        }
        else if (verb === 'window') { out = (await EXAM.renderWindow(st, { sessionId: sid, window: rest[0], params: json(rest[1]) }, o)).view; }
        else if (verb === 'act') { const r = await EXAM.runAction(st, { sessionId: sid, window: rest[0], action: rest[1], params: json(rest[2]) }, o); out = r.result; }
        else if (verb === 'cmd') { const r = await EXAM.runCommand(st, { sessionId: sid, console: rest[0], line: rest.slice(1).join(' ') }, o); out = (r.out || '') + '\n' + (r.prompt || '') + '   [screen ' + r.screen + ', console ' + r.context + ']'; }
        else if (verb === 'answer') { out = await EXAM.saveAnswer(st, { sessionId: sid, fieldId: rest[0], value: rest.slice(1).join(' ') }, o); }
        else if (verb === 'handover') { const r = await EXAM.handover(st, { sessionId: sid, confirm: true }, o); out = { handedOver: r.handedOver, screen: r.screen, ticket: r.ticket, answerFields: r.answerFields }; }
        else if (verb === 'reset') { out = await EXAM.resetSession(st, { sessionId: sid, callerUid: m.uid, targetUid: m.uid, token: {}, adminEmails: [] }, o); }
        else if (verb === 'submit') { const r = await EXAM.submitExam(st, { sessionId: sid }, o); out = kit.req('mdfinal-grade.js').studentReport(r.report); }
        else { console.log('Unknown command. Run: help'); process.exitCode = 1; return; }
        journal({ verb, args: verb === 'answer' ? [rest[0]] : rest.slice(0, 3).map((x) => String(x).slice(0, 120)) });
        show(out);
    } catch (e) {
        journal({ verb, args: rest.slice(0, 3).map((x) => String(x).slice(0, 120)), error: e.code || 'error' });
        console.log('Error (' + (e.code || 'error') + '): ' + e.message);
        process.exitCode = 1;
    }
})();
