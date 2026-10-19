#!/usr/bin/env node
/**
 * netfinal-walkthrough.js — the instructor's key for ONE student, and the completability proof.
 *
 * @catalog what    --student <id> prints that student's answer key and the exact repair commands.
 * @catalog what    --qc [n] sits the exam as n synthetic students end to end against the REAL
 * @catalog what    server modules, answers from the key, types every repair, submits, and reports
 * @catalog what    the score. --cheat proves the shortcuts a student might try do NOT score.
 * @catalog run     node _tools/netfinal/netfinal-walkthrough.js --qc 3
 * @catalog run     node _tools/netfinal/netfinal-walkthrough.js --student <uid>
 * @catalog status  TOOL
 *
 * THERE IS NO SINGLE ANSWER KEY FOR THIS EXAM, AND THAT IS THE FIRST THING TO UNDERSTAND.
 * The lab is seeded from `secret|studentId|examId`, so two students get different fault variants,
 * different addresses, different VLAN numbers and different DHCP pools. A printed key is correct
 * for exactly one student. Measured: `alice` and `bob` share only some of their twelve variants,
 * and the same student reproduces byte-identically every time. So the key is GENERATED per student
 * and the walkthrough is a method plus that student's values, never a static document.
 *
 * THE SEED SECRET. Production folds in `NETFINAL_SEED_SECRET`. Without the real secret this tool
 * reproduces the SHAPE of a sitting but not a specific student's actual lab, and it says so in its
 * output rather than letting an instructor read a key that does not match what the student saw.
 * Pass the real secret via NETFINAL_SEED_SECRET in the environment to generate a true key.
 *
 * WHY --qc IS THE REAL COMPLETABILITY CHECK
 * -----------------------------------------
 * The other suites prove the engine answers correctly and that each fault is individually
 * repairable. Neither answers the operator's question, which is whether a student can finish the
 * whole thing: all fifty questions, all twelve faults, change requests and incident log included,
 * in one session, and come out with full marks. That is a SCORE, not an opinion, so this drives one
 * real session per student through the same callables the page calls and prints what the grader
 * returns. A fault that is fixable in isolation but not alongside the other eleven fails here.
 *
 * AND WHY --cheat EXISTS
 * ----------------------
 * A walkthrough that scores full marks proves the exam is COMPLETABLE. It does not prove the exam
 * is not trivially beatable, and those are different claims. --cheat drives the shortcuts a student
 * would actually try -- answering everything without touching the network, typing a plausible-but-
 * wrong fix, submitting twice -- and asserts each one scores LESS. Without it, "the walkthrough
 * passes" would be equally true of an exam that marked everything correct.
 */
const path = require('path');
const REPO = path.resolve(__dirname, '../..');
const NF = path.join(REPO, 'functions/netfinal');

const NETFINAL = require(path.join(NF, 'netfinal-exam.js'));
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const GRADE = require(path.join(NF, 'netfinal-grade.js'));
const QUESTIONS = require(path.join(NF, 'netfinal-questions.js'));
const EXAMS = require(path.join(NF, 'netfinal-exams.js'));
const GUI = require(path.join(NF, 'netfinal-gui.js'));
const { REPAIRS, GUI_REPAIRS, GUI_FIXED, GUI_SURFACE } = require('./netfinal-repairs.js');

/* THE ENGINE REFUSES TO START WITHOUT A SEED SECRET, and it is right to: netfinal-exam.js throws
   "Refusing to serve an exam whose seed a student could reproduce", because an empty secret makes
   the lab derivable from a student id alone. So this tool cannot simply run secretless.

   The two modes therefore differ, and must:
     --qc / --cheat   a LOCAL placeholder is fine. The claim is about the exam's structure -- can
                      fifty questions and twelve faults be completed in one sitting -- which does not
                      depend on which secret seeded it. The output says so rather than implying the
                      numbers belong to a real sitting.
     --student        REFUSED without the real secret. An instructor reading a key that silently did
                      not match the student's lab is worse than no key: they would mark correct
                      answers wrong. The real value is supplied through the environment and is never
                      read, logged or written by this tool. */
const REAL_SECRET = process.env.NETFINAL_SEED_SECRET || null;
const QC_SECRET = 'qc-local-placeholder-not-production';
const SECRET = REAL_SECRET || QC_SECRET;
const EXAM = EXAMS.DEFAULT_EXAM_ID;

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};

/* ── the same call path the page uses ────────────────────────────────────────────────────────────
   Every one of these goes through the real exported handler with a real store, exactly as
   functions/index.js wires it. A harness that reached into the engine directly would prove the
   engine works and nothing about whether a student can get there. */
function session(studentId) {
    const store = NETFINAL.memoryStore();
    const sid = studentId + '::' + EXAM;
    const opts = { secret: SECRET };
    return {
        sid, store, opts,
        start: () => NETFINAL.startExam(store,
            { studentId, examId: EXAM, minutes: EXAMS.durationMinutes(EXAM) }, opts),
        cmd: (line) => NETFINAL.runCommand(store, { sessionId: sid, line }, opts),
        act: (window, action, params) =>
            NETFINAL.runAction(store, { sessionId: sid, window, action, params }, opts),
        answer: (questionId, value) =>
            NETFINAL.saveAnswer(store, { sessionId: sid, questionId, value }, opts),
        submit: () => NETFINAL.submitExam(store, { sessionId: sid }, opts),
        state: async () => (await store.get(sid)).state
    };
}

/* ── THE ANSWER, AS A STUDENT WOULD TYPE IT ──────────────────────────────────────────────────────
   `buildAnswerKey` returns structured values: {ipv4:'10.49.10.40', prefix:24} for Q1, [10,40,99]
   for Q6's VLAN set. A student types `10.49.10.40/24` and `10, 40, 99` into one text box, because
   the page renders those kinds as a single input.

   My first version of the QC handed the grader `JSON.stringify` of the structure and scored 57%.
   The marks said "1 of 2 parts" and "incorrect", and I could have mistaken that for an exam defect:
   it was the harness typing something no student would. An instructor key has the same requirement
   for a better reason -- a key that prints `{"ipv4":"10.49.10.40","prefix":24}` is a key somebody
   has to translate under time pressure, and they will translate it wrong.

   EVERY FORMAT HERE IS VERIFIED AGAINST THE GRADER, not asserted: `verifyTyped` runs the engine's
   own `sameAnswer` over the formatted string, so a format this function gets wrong is reported
   rather than printed into a key an instructor would mark from. */
function studentTyped(q, answer) {
    if (answer === null || answer === undefined) { return null; }
    /* The composite control the page actually renders as two fields stays an object, because that
       is literally what the page posts. */
    if (q.kind === 'aclref' && typeof answer === 'object') {
        return { name: answer.name, seq: String(answer.seq) };
    }
    if (Array.isArray(answer)) { return answer.join(', '); }
    if (typeof answer === 'object') {
        const parts = q.parts || Object.keys(answer);
        /* An address and its prefix are one slash-joined token; everything else a student types as
           words separated by spaces, which is how the normalizers read them back. */
        if (parts.length === 2 && parts[0] === 'ipv4' && parts[1] === 'prefix') {
            return answer.ipv4 + '/' + answer.prefix;
        }
        return parts.map((k) => {
            const v = answer[k];
            return Array.isArray(v) ? v.join(' ') : String(v);
        }).join(' ');
    }
    return String(answer);
}

/* Does the string this tool would print actually grade as correct? The engine's own comparator
   answers that, so the key cannot quietly contain an answer the grader rejects. */
function verifyTyped(q, keyAnswer) {
    const typed = studentTyped(q, keyAnswer);
    if (typed === null) { return { typed, ok: true, note: 'no typed answer for this kind' }; }
    const ok = QUESTIONS.sameAnswer(q.norm || 'text', typed, keyAnswer,
        { require: q.parts || [] });
    return { typed, ok, note: ok ? 'grades correct' : 'DOES NOT GRADE CORRECT' };
}

/* A fault's repair, as the student performs it. Returns what was done, so the caller can report a
   variant it could not drive rather than silently scoring it as attempted. */
async function repair(s, st, f) {
    if (REPAIRS[f.id]) {
        const lines = REPAIRS[f.id](st, f);
        const rejected = [];
        for (const line of lines) {
            const r = await s.cmd(line);
            if (/Invalid input|Incomplete command|not recognized|command not found|Pattern not found/
                .test(r.out || '')) { rejected.push(line + ' -> ' + (r.out || '').split('\n')[0]); }
        }
        return { via: 'terminal', lines, rejected };
    }
    /* THE SIX GUI-FIXED VARIANTS, ACTUALLY DRIVEN. My first version of this only COUNTED the
       actions the engine declared and reported the variant as "not driven", which left 2 to 4
       faults broken in every sitting and produced a 55% score I would have had to describe as
       completability. Counting the controls on a panel is not using them. These go through
       runAction, the same callable the page calls when a student clicks the form. */
    if (!GUI_REPAIRS[f.id]) {
        return { via: 'none', surface: GUI_SURFACE[f.id] || 'unknown',
                 rejected: ['no repair recipe exists for ' + f.id] };
    }
    const rejected = [];
    for (const [win, action, params] of GUI_REPAIRS[f.id](st, f)) {
        const res = await s.act(win, action, params);
        /* The engine answers {ok:false, reason} for a refused action. Recorded, never swallowed: a
           guard that refuses while the caller reports success is a bug this project has shipped
           twice, and a walkthrough that swallowed it would hand an instructor a dead recipe. */
        if (res && res.ok === false) {
            rejected.push(win + '/' + action + ' -> ' + (res.reason || 'refused'));
        }
    }
    return { via: 'gui', surface: GUI_SURFACE[f.id] || 'unknown',
             actions: GUI_REPAIRS[f.id](st, f).length, rejected };
}

/* ── --student: the instructor artifact ──────────────────────────────────────────────────────── */
async function printKey(studentId) {
    /* REFUSED WITHOUT THE REAL SECRET. A key generated from the placeholder would be internally
       consistent and wrong for this student, and an instructor would mark correct answers wrong
       from it. Better to hand back nothing than a confidently incorrect key. */
    if (!REAL_SECRET) {
        console.error('');
        console.error('REFUSING to print a key: NETFINAL_SEED_SECRET is not set in this environment.');
        console.error('');
        console.error('The lab is seeded from secret|studentId|examId. Without the real secret this');
        console.error('would produce a consistent key for a DIFFERENT lab than the student sat, and');
        console.error('you would mark their correct answers wrong.');
        console.error('');
        console.error('  NETFINAL_SEED_SECRET=<the value> node ' + path.relative(REPO, __filename)
            + ' --student ' + studentId);
        console.error('');
        console.error('The secret lives in Secret Manager as NETFINAL_SEED_SECRET. This tool never');
        console.error('reads, logs or writes it; it only passes what the environment already holds.');
        return 1;
    }
    const s = session(studentId);
    await s.start();
    const st = await s.state();
    const key = GRADE.buildAnswerKey(st);
    const qs = QUESTIONS.forStudent(st);

    console.log('');
    console.log('NETWORK+ FINAL — INSTRUCTOR KEY');
    console.log('student:  ' + studentId);
    console.log('exam:     ' + EXAM);
    console.log('seed:     REAL secret supplied: this matches the student\'s lab');
    console.log('total:    ' + qs.reduce((a, q) => a + q.points, 0) + ' points across '
        + qs.length + ' questions');
    console.log('');
    console.log('THIS KEY IS FOR ONE STUDENT. The lab is seeded per student, so these addresses,');
    console.log('VLANs and fault variants are not another student\'s. Regenerate per student.');

    console.log('');
    console.log('── THE TWELVE FAULTS IN THIS STUDENT\'S LAB ' + '─'.repeat(36));
    (st.faults || []).forEach((f) => {
        console.log('');
        console.log(f.slot + ' variant ' + f.variant + '  (' + f.id + ')   ticket ' + f.ticketId
            + '   OSI layer ' + f.layer);
        console.log('  target: ' + JSON.stringify(f.target));
        if (REPAIRS[f.id]) {
            console.log('  fix, typed at the terminal:');
            REPAIRS[f.id](st, f).forEach((l) => console.log('      ' + l));
        } else {
            console.log('  fix, NOT at the terminal: ' + (GUI_SURFACE[f.id] || '(surface unknown)'));
            console.log('      Use the tab\'s own controls; the engine declares the action and its');
            console.log('      parameters, so follow what the panel offers.');
        }
    });

    console.log('');
    console.log('── THE FIFTY ANSWERS ' + '─'.repeat(58));
    QUESTIONS.PHASES.forEach((phase) => {
        const inPhase = qs.filter((q) => q.phase === phase);
        if (!inPhase.length) { return; }
        console.log('');
        console.log('  ' + phase.toUpperCase());
        inPhase.forEach((q) => {
            const k = key.questions[q.id];
            let ans;
            if (q.kind === 'state' || q.kind === 'sequence') {
                ans = '(no typed answer: graded from the network and the event log)';
            } else if (k && k.answer !== undefined && k.answer !== null) {
                const v = verifyTyped(q, k.answer);
                ans = (typeof v.typed === 'object' ? JSON.stringify(v.typed) : v.typed)
                    + (v.ok ? '' : '   <<< ' + v.note + ', DO NOT MARK FROM THIS LINE');
            } else {
                ans = '(none)';
            }
            console.log('    Q' + String(q.n).padStart(2) + ' [' + q.points + 'pt] ' + ans);
            console.log('         ' + q.prompt);
            if (q.where) { console.log('         where: ' + q.where); }
        });
    });
    console.log('');
}

/* ── --qc: sit the exam, and report the SCORE ────────────────────────────────────────────────── */
async function sit(studentId, opts) {
    opts = opts || {};
    const s = session(studentId);
    const started = await s.start();
    const st0 = await s.state();
    const qs = QUESTIONS.forStudent(st0);
    const key = GRADE.buildAnswerKey(st0);
    const notes = { driven: [], undrivable: [], rejected: [] };

    /* THE ORDER THE BRIEF TELLS STUDENTS, which is also the order the grader scores.
       My first version did all twelve repairs and THEN all the paperwork, and twelve questions came
       back "fixed, but the change request was filed after the change" at 3 of 6 marks each: 36
       points lost to sequencing. The grader was right and the harness was wrong. The brief says
       "file a change request first, make the change, then verify it. Log every incident you
       resolve", so that is what a sitting does, per fault, in that order. */
    if (!opts.skipFixes) {
        for (const f of (st0.faults || [])) {
            if (!opts.skipPaperwork) {
                const cr = await s.act('change-requests', 'submit', {
                    ticket: f.ticketId, layer: String(f.layer),
                    rootCause: 'Fault at OSI layer ' + f.layer + ' on ' + JSON.stringify(f.target),
                    plannedChange: 'Apply the documented repair for ' + f.ticketId,
                    rollback: 'Restore the device from the Rack tab'
                });
                if (cr && cr.ok === false) {
                    notes.rejected.push('change-request ' + f.ticketId + ': ' + (cr.reason || 'refused'));
                }
            }
            const st = await s.state();
            const r = await repair(s, st, f);
            notes.driven.push(f.id + ':' + r.via);
            if ((r.rejected || []).length) { notes.rejected.push(f.id + ': ' + r.rejected.join('; ')); }
            if (r.via === 'none') { notes.undrivable.push(f.id + ' (no recipe)'); }
            if (!opts.skipPaperwork) {
                const il = await s.act('incident-log', 'submit', {
                    ticket: f.ticketId, symptom: 'Reported on ' + f.ticketId, layer: String(f.layer),
                    rootCause: 'Fault at OSI layer ' + f.layer,
                    fix: 'Applied the documented repair', verification: 'Re-tested after the change'
                });
                if (il && il.ok === false) {
                    notes.rejected.push('incident ' + f.ticketId + ': ' + (il.reason || 'refused'));
                }
            }
        }
    }

    /* The paperwork is filed INSIDE the loop above, around each repair, because the order is
       graded. It used to be a second pass here and that cost 36 points. */

    /* 3. Every typed answer, from the key. */
    if (!opts.skipAnswers) {
        for (const q of qs) {
            if (q.kind === 'state' || q.kind === 'sequence') { continue; }
            const k = key.questions[q.id];
            if (!k || k.answer === undefined || k.answer === null) { continue; }
            const v = studentTyped(q, k.answer);
            if (v === null) { continue; }
            try { await s.answer(q.id, v); } catch (e) { notes.rejected.push(q.id + ': ' + e.message); }
        }
    }

    const res = await s.submit();
    const rep = res.report || {};
    return {
        studentId, total: rep.total, outOf: rep.outOf,
        pending: rep.pendingInstructorMarks, phases: rep.phases,
        questions: rep.questions || [], resumed: !!started.resumed, notes
    };
}

async function qc(n, detail) {
    console.log('');
    console.log('COMPLETABILITY QC — sitting the exam as ' + n + ' synthetic student(s)');
    console.log('Every call goes through the real exported handlers with a real store, the same way');
    console.log('functions/index.js wires them. No production writes: the store is in memory.');
    if (!REAL_SECRET) {
        console.log('SEED: using a local placeholder, because the engine refuses an empty secret and');
        console.log('this tool does not read the production one. These are therefore REPRESENTATIVE');
        console.log('labs, not any specific student\'s. The claim being tested is that the exam is');
        console.log('completable, which does not depend on which secret seeded it.');
    }
    console.log('');

    const results = [];
    for (let i = 0; i < n; i++) {
        const id = 'qc-student-' + (i + 1);
        const r = await sit(id);
        results.push(r);
        const pct = r.outOf ? Math.round((r.total / r.outOf) * 100) : 0;
        console.log('  ' + id + ': ' + r.total + '/' + r.outOf + ' (' + pct + '%)'
            + (r.pending ? ', ' + r.pending + ' pending instructor marks' : ''));
        if (r.notes.undrivable.length) {
            console.log('      not driven by this harness: ' + r.notes.undrivable.join(', '));
        }
        if (r.notes.rejected.length) {
            console.log('      REJECTED: ' + r.notes.rejected.slice(0, 3).join(' | '));
        }
        /* --detail prints every question that did not earn full marks, with the grader's own note.
           An instructor needs this to see WHERE a sitting lost points, and I needed it to find that
           my own harness was typing answers no student would. */
        if (detail) {
            const lost = (r.questions || []).filter((m) => (m.earned || 0) < (m.of || m.points || 0));
            console.log('      ' + lost.length + ' question(s) below full marks, losing '
                + lost.reduce((a, m) => a + ((m.of || m.points || 0) - (m.earned || 0)), 0) + ' points:');
            lost.forEach((m) => console.log('        Q' + String(m.n).padStart(2) + ' '
                + (m.earned || 0) + '/' + (m.of || m.points) + '  ' + (m.note || '')));
        }
    }

    console.log('');
    console.log('ASSERTIONS');
    /* The GUI-fixed six are NOT driven here, so a full-marks claim would be false. What this proves
       is that everything reachable from the terminal plus the paperwork scores, and the shortfall is
       accounted for rather than hidden. The GUI six are driven by netfinal-gui.test.js. */
    chk('every sitting produced a graded report',
        results.every((r) => typeof r.total === 'number' && r.outOf > 0),
        JSON.stringify(results.map((r) => r.total + '/' + r.outOf)));
    chk('no command in any repair was rejected by the parser',
        results.every((r) => r.notes.rejected.length === 0),
        results.map((r) => r.notes.rejected.join('; ')).filter(Boolean).join(' || '));
    /* THE ACTUAL COMPLETABILITY CLAIM. Every fault is now driven, terminal and GUI, so a student
       who does everything right should lose nothing except marks a human has to award. Anything
       less is a fault that cannot be repaired alongside the other eleven, which is precisely what
       no other suite can see. */
    chk('every sitting scored EVERY automatically-awardable point',
        results.every((r) => r.total + (r.pending || 0) >= r.outOf),
        JSON.stringify(results.map((r) => r.total + '+' + (r.pending || 0) + ' of ' + r.outOf)));
    chk('and the only shortfall is marks a human awards, not marks lost',
        results.every((r) => r.outOf - r.total === (r.pending || 0)),
        JSON.stringify(results.map((r) => 'short ' + (r.outOf - r.total)
            + ' vs pending ' + (r.pending || 0))));
    chk('every fault was driven, none skipped',
        results.every((r) => r.notes.undrivable.length === 0),
        JSON.stringify(results.map((r) => r.notes.undrivable)));
    /* Different students, different labs: if every score were identical the harness would probably
       be grading one lab repeatedly. */
    chk('the sittings are of DIFFERENT labs, not the same one n times',
        n < 2 || new Set(results.map((r) => JSON.stringify(r.phases))).size > 1
              || new Set(results.map((r) => r.total)).size > 1,
        'identical phase breakdowns across students suggests one lab graded n times');
    chk('all twelve faults were driven in every sitting',
        results.every((r) => r.notes.driven.length === 12),
        JSON.stringify(results.map((r) => r.notes.driven.length)));
    chk('and both repair surfaces were exercised, not just the terminal',
        results.some((r) => r.notes.driven.some((d) => /:gui$/.test(d)))
        && results.every((r) => r.notes.driven.some((d) => /:terminal$/.test(d))),
        JSON.stringify(results.map((r) => r.notes.driven.join(' '))));
    return results;
}

/* ── --cheat: the shortcuts must NOT score ───────────────────────────────────────────────────── */
async function cheat() {
    console.log('');
    console.log('CHEAT CHECKS — a walkthrough that scores proves COMPLETABLE, not UNBEATABLE');
    console.log('');

    const honest = await sit('cheat-baseline');
    chk('the honest sitting scores something to compare against',
        honest.total > 0, JSON.stringify(honest.total + '/' + honest.outOf));

    /* 1. Answer everything, touch nothing. The verify and state questions are graded from the
          network, so a student who types every answer without repairing anything must score less. */
    const paper = await sit('cheat-answers-only', { skipFixes: true, skipPaperwork: true });
    chk('answering every question WITHOUT repairing anything scores less than doing the work',
        paper.total < honest.total,
        'answers-only ' + paper.total + ' vs honest ' + honest.total);

    /* 2. Do the work, file no paperwork. The spec requires a change request before a change and an
          incident entry after; those carry marks a repair alone cannot earn. */
    const nopaper = await sit('cheat-no-paperwork', { skipPaperwork: true });
    chk('repairing without filing change requests or incidents scores less',
        nopaper.total < honest.total,
        'no-paperwork ' + nopaper.total + ' vs honest ' + honest.total);

    /* 3. A second submit must not re-grade or add marks. */
    const s = session('cheat-double-submit');
    await s.start();
    const first = await s.submit();
    const second = await s.submit();
    chk('a second submit is refused as already submitted, not graded again',
        second.alreadySubmitted === true, JSON.stringify(second).slice(0, 120));
    chk('and it returns the SAME report, not a better one',
        JSON.stringify(second.report) === JSON.stringify(first.report));

    /* 4. A wrong-but-plausible fix must not satisfy the grader. The shell suite proves this for
          S12B and S9A; this drives the same shape through the callable path a student uses. */
    const w = session('cheat-wrong-fix');
    await w.start();
    const wst = await w.state();
    const sw = wst.devices['MeridianSW-02'].mgmtIp;
    await w.cmd('ssh admin@' + sw);
    await w.cmd('enable');
    await w.cmd('conf t');
    /* THE DECOY ADDRESS, READ FROM THE STUDENT'S OWN STATE. My first version of this line was
       `'ntp server ' + CORE.TOPO_DECOY_DNS || '10.0.0.10'`, which has two defects the repo's QC hook
       caught: `CORE.TOPO_DECOY_DNS` does not exist (the value lives on the topology module's
       DECOY_DIAGRAM), and `+` binds tighter than `||`, so the fallback could never fire -- the
       concatenation would have produced the truthy string "ntp server undefined" and pointed the
       cheat at nothing. A cheat check aimed at a nonexistent address would have "passed" while
       testing nothing, which is the same unfalsifiable-check failure as the rest of this feature.
       The state carries the decoy, so it is read from there and asserted non-empty first. */
    const decoyDns = (wst.decoyDiagram || {}).dnsServer;
    chk('the decoy DNS address is available, so the cheat below points somewhere real',
        typeof decoyDns === 'string' && /^\d+\.\d+\.\d+\.\d+$/.test(decoyDns),
        JSON.stringify(decoyDns));
    await w.cmd('ntp server ' + decoyDns);
    await w.cmd('end');
    const after = await w.state();
    chk('pointing NTP at the decommissioned server does not synchronise it',
        after.devices['MeridianSW-02'].ntp.synchronized === false,
        JSON.stringify(after.devices['MeridianSW-02'].ntp));
}

/* ── --verify-key: does every line this tool would print actually grade correct? ───────────────
   An instructor marks from this key. A line that looks plausible and grades wrong is worse than a
   missing line, because they will mark a correct student answer as wrong and never find out. This
   runs the engine's own comparator over every formatted answer, across several students, because
   question SHAPES vary per student too: Q25 is scalar in one lab and two-part in another. */
async function verifyKey(n) {
    console.log('');
    console.log('KEY SELF-CHECK — every printed answer, run through the engine\'s own comparator');
    console.log('across ' + n + ' labs, because question shapes vary per student as well as values.');
    console.log('');
    const bad = [];
    let checked = 0;
    for (let i = 0; i < n; i++) {
        const sid = 'verify-' + (i + 1);
        const s = session(sid);
        await s.start();
        const st = await s.state();
        const key = GRADE.buildAnswerKey(st);
        for (const q of QUESTIONS.forStudent(st)) {
            const k = key.questions[q.id];
            if (!k || k.answer === undefined || k.answer === null) { continue; }
            checked++;
            const v = verifyTyped(q, k.answer);
            if (!v.ok) {
                bad.push(sid + ' Q' + q.n + ' (' + q.kind + '/' + q.norm + ', parts='
                    + JSON.stringify(q.parts) + ') key=' + JSON.stringify(k.answer)
                    + ' typed=' + JSON.stringify(v.typed));
            }
        }
    }
    console.log('  checked ' + checked + ' answers across ' + n + ' labs');
    bad.slice(0, 25).forEach((b) => console.log('  BAD  ' + b));
    chk('every answer this tool prints grades as correct',
        bad.length === 0, bad.length + ' of ' + checked + ' do not');
    chk('and it checked a meaningful number of them', checked > 100, 'checked=' + checked);
}

async function main() {
    const argv = process.argv.slice(2);
    const flag = (f) => argv.indexOf(f) >= 0;
    const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

    if (flag('--student')) { return await printKey(val('--student', 'demo-student')) || 0; }
    if (flag('--cheat')) { await cheat(); }
    else if (flag('--verify-key')) { await verifyKey(Number(val('--verify-key', '4')) || 4); }
    else if (flag('--qc')) { await qc(Number(val('--qc', '3')) || 3, flag('--detail')); }
    else {
        console.log('usage:');
        console.log('  node _tools/netfinal/netfinal-walkthrough.js --student <uid>   key for one student');
        console.log('  node _tools/netfinal/netfinal-walkthrough.js --qc [n]          sit it n times');
        console.log('  node _tools/netfinal/netfinal-walkthrough.js --cheat           shortcuts must fail');
        console.log('  add --detail to --qc for a per-question breakdown of everything below full marks');
        console.log('');
        console.log('Set NETFINAL_SEED_SECRET to generate a key that matches a real sitting.');
        return 0;
    }

    console.log('');
    console.log('  ' + pass + '/' + (pass + fail) + ' assertions passed');
    return fail ? 1 : 0;
}

main().then((c) => process.exit(c)).catch((e) => {
    console.error('\n  walkthrough fault: ' + (e && e.stack ? e.stack : e));
    process.exit(2);
});
