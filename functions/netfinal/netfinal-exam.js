/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-exam.js — stage 7: the exam session. Server-authoritative and server-timed. One sitting
 * at a time; since 2026-10-19 a submitted sitting may be restarted (resetSession), each archived.
 *
 * Spec section 9 (randomization and academic integrity) and section 10 extensions 9 and 10.
 *
 * ★ THE DECISION MALLORY SAID STAGE 7 MUST NOT GET WRONG, implemented here:
 *   STATE LIVES SERVER-SIDE, KEYED BY SESSION. Every entry point takes a sessionId and reads the
 *   lab from the store. NOTHING accepts a client-supplied state blob.
 * Every function in the engine is pure over whatever state it is handed, which is right for testing
 * and wrong to expose: round-trip `state` through the browser and a student edits `services`,
 * `rogue.placed`, `baseline.amnesty` or `fixedAtEvent` in the request body and bypasses the command
 * interface entirely, or fabricates a change request at an earlier event index than the fix it
 * preceded. The engine would comply, because complying is all it does.
 *
 * THE STORE IS INJECTED so these rules are testable without Firestore. functions/index.js passes a
 * Firestore-backed store; the test passes an in-memory one. The rules are identical either way,
 * which is the point -- an exam rule that only holds in production is a rule nobody has checked.
 *
 * WHAT THE CLIENT EVER RECEIVES: netfinal-client.js's toInitialState(), plus rendered command text
 * and window data. Never the answer key, the fault list, the baseline, or the seed.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CORE = require('./netfinal-core.js');
    var FAULTS = require('./netfinal-faults.js');
    var SHELL = require('./netfinal-shell.js');
    var GUI = require('./netfinal-gui.js');
    var CLIENT = require('./netfinal-client.js');
    var QUESTIONS = require('./netfinal-questions.js');
    var GRADE = require('./netfinal-grade.js');
    var EXAMS = require('./netfinal-exams.js');

    /* Spec section 12 leaves the duration open; the pilot in section 11 targets 100 minutes, so that
     * is the default and the caller may override it per sitting. */
    var DEFAULT_MINUTES = 120;

    function err(code, message) {
        var e = new Error(message);
        e.code = code;
        return e;
    }

    /* ── the clock ────────────────────────────────────────────────────────────────────────────────
     * THE ONLY PLACE A CLOCK IS READ. Spec section 9: "One attempt, server-timed. The timer runs on
     * the server. A browser refresh resumes the same lab and the same clock." Injected so tests can
     * advance time deterministically -- and so the rest of the engine stays clock-free, which is
     * what makes a seed reproduce byte-for-byte. */
    function nowMs(opts) {
        return (opts && typeof opts.now === 'function') ? opts.now() : Date.now();
    }

    function remainingMs(session, opts) {
        var elapsed = nowMs(opts) - session.startedAt;
        return Math.max(0, session.durationMs - elapsed);
    }
    function expired(session, opts) { return remainingMs(session, opts) <= 0; }

    /* ── starting ────────────────────────────────────────────────────────────────────────────────
     * ONE SITTING AT A TIME. A second start returns the SAME session rather than a fresh lab, which is also
     * what makes a refresh resume: the browser cannot tell the difference and does not need to. */
    /* RESUME. Same lab, same clock, same answers. Nothing is regenerated, so a student who refreshes
     * to reroll their faults gets the faults they already had. */
    function resumeReply(sessionId, existing, opts) {
        return {
            sessionId: sessionId,
            resumed: true,
            submitted: !!existing.submittedAt,
            initialState: CLIENT.toInitialState(existing.state),
            questions: QUESTIONS.forStudent(existing.state),
            /* Without this a refresh showed every field blank -- see savedAnswers. */
            answers: savedAnswers(existing.state),
            remainingMs: remainingMs(existing, opts),
            examMode: examModeFlags(),
            /* A SUBMITTED sitting brings its grade back, through the same aggregates-only
             * studentReport the submit reply uses. The page used to say "This exam has already been
             * submitted." with no score, so a student who reloaded, or came back the next day, had
             * no way to see what they got. */
            report: existing.submittedAt ? studentReport(existing.report) : null
        };
    }

    async function startExam(store, args, opts) {
        opts = opts || {};
        var studentId = String(args.studentId || '');
        var examId = String(args.examId || '');
        if (!studentId || !examId) { throw err('invalid-argument', 'studentId and examId are required.'); }

        var sessionId = studentId + '::' + examId;
        var existing = await store.get(sessionId);
        if (existing) { return resumeReply(sessionId, existing, opts); }

        var secret = opts.secret || (typeof process !== 'undefined' && process.env && process.env.NETFINAL_SEED_SECRET) || null;
        if (!secret && !opts.allowDevSeed) {
            /* FAILS CLOSED. A lab generated without a server secret can be regenerated by anyone
             * who knows the student's own id and the exam id, and diffed against a healthy one to
             * locate all twelve faults -- Mallory proved that in about thirty lines. Serving one
             * would be worse than refusing to start. */
            throw err('failed-precondition',
                'NETFINAL_SEED_SECRET is not configured. Refusing to serve an exam whose seed a student could reproduce.');
        }
        var state = CORE.generate(studentId, examId, { secret: secret });
        FAULTS.applyAll(state);
        var answerKey = GRADE.buildAnswerKey(state);

        var session = {
            sessionId: sessionId, studentId: studentId, examId: examId,
            startedAt: nowMs(opts),
            /* CLAMPED, not trusted. This read `Number(args.minutes)` with no ceiling, and the
             * callable handed it `c.data.minutes` straight from the browser -- so an exam could be
             * started with a duration of 694,444 days and never expire. The callable no longer
             * forwards a client value at all; this clamp is the second layer, because a guard that
             * only exists at the edge is one a new caller removes without noticing. */
            durationMs: EXAMS.clampMinutes(args.minutes) * 60000,
            state: state,
            answerKey: answerKey,
            shell: SHELL.newSession(),
            submittedAt: null, report: null,
            /* Optimistic-concurrency revision. See withSession for what it defends against. */
            rev: 0
        };
        /* CREATE-IF-ABSENT, NOT put. Two starts that both read "nothing here" -- two tabs opened at
         * once, which a staff restart makes routine -- each built a sitting, and a blind put let the
         * second overwrite the first, dropping any answer or command already written to it and
         * restarting its clock. Mallory proved it and Nancy flagged it independently. Whoever creates
         * first owns the sitting; the loser resumes it, exactly as a refresh would. */
        var created = await store.create(sessionId, session);
        if (!created) {
            var winner = await store.get(sessionId);
            if (!winner) { throw err('aborted', 'The exam session changed while starting. Retry.'); }
            return resumeReply(sessionId, winner, opts);
        }
        return {
            sessionId: sessionId, resumed: false, submitted: false,
            initialState: CLIENT.toInitialState(state),
            questions: QUESTIONS.forStudent(state),
            /* Always present, empty on a fresh start, so the page has one code path. */
            answers: savedAnswers(state),
            remainingMs: remainingMs(session, opts),
            examMode: examModeFlags()
        };
    }

    /* ═══ THE STUDENT'S OWN SAVED ANSWERS, FOR A RESUME ══════════════════════════════════════════
     *
     * Spec section 9 promises "a browser refresh resumes the same lab and the same clock". The lab
     * and the clock did resume. The ANSWERS did not -- not because they were lost, they were safe in
     * `state.answers` the whole time, but because nothing ever sent them back and the page had no way
     * to put a saved value into a control. Every field came up blank on every reload.
     *
     * For a single text box that was a nuisance: retype it, same value, no harm. For Q24's two
     * fields it is DATA LOSS. Both controls post the pair together, so a student who had saved
     * {name:'GUEST-IN', seq:'10'}, refreshed, then re-picked the ACL out of habit would post
     * {name:'GUEST-IN', seq:''} -- overwriting a complete, correct, already-credited answer with a
     * half-credit one, for re-affirming a field they had got right.
     *
     * A form that does not carry what its save handler reads back out of it is the defect; the pair
     * only made the cost visible. Sent for every question kind, not just the pair.
     *
     * This is the student's OWN input going back to the student. It is not the answer key, and it
     * carries no new information -- they typed it. */
    function savedAnswers(state) {
        var out = {};
        Object.keys((state && state.answers) || {}).forEach(function (qid) {
            var a = state.answers[qid];
            if (a && a.value !== undefined) { out[qid] = a.value; }
        });
        return out;
    }

    /* Spec section 9's lockdown, as data the page reads rather than prose a developer remembers. */
    function examModeFlags() {
        return {
            examMode: true,
            /* "Dr. Hex disabled on the exam page, by not loading HexAIButton.js when examMode:
             * true." The spec records that the midterm build FAILS this, which is why it is a flag
             * and an assertion rather than a convention. */
            loadHexAI: false,
            courseLinks: false,
            hints: false,
            timeBonus: false,
            serverTimer: true,
            serverGraded: true,
            /* FALSE since 2026-10-19. Spec section 9 asked for one attempt; the operator chose
             * unlimited self-restart instead (netfinalReset), each attempt archived. Reported
             * truthfully so nothing downstream advertises a rule the exam no longer has. */
            oneAttempt: false
        };
    }

    /* Load and admit: the checks every entry point shares, with no opinion about writing. */
    async function admitSession(store, sessionId, opts) {
        if (!sessionId) { throw err('invalid-argument', 'sessionId is required.'); }
        var session = await store.get(sessionId);
        if (!session) { throw err('not-found', 'No such exam session.'); }
        if (session.submittedAt) { throw err('failed-precondition', 'This exam has been submitted.'); }
        if (expired(session, opts)) {
            /* TIME IS UP, SO SUBMIT IT. Leaving an expired session open would let a student keep
             * working past the clock; discarding it would lose their work. Auto-submission grades
             * what they had, which is what a timed exam means. */
            var auto = await submitExam(store, { sessionId: sessionId, auto: true }, opts);
            throw err('deadline-exceeded', 'Time expired; the exam was submitted automatically. Score: '
                + auto.report.total + ' of ' + auto.report.outOf);
        }
        return session;
    }

    /* A READ. No revision claimed, nothing written.
     *
     * Rendering a window mutates nothing -- GUI.render is pure -- but it went through the writing
     * path, which bumped `rev` and ran a full transactional write for every window the student
     * opened AND for the refresh the page fires after every single action. Reads contended with real
     * writes for a revision they had no reason to hold, widening the very collision surface the
     * compare-and-set exists to narrow. A read that takes a write lock is not a cheaper bug than no
     * lock at all. */
    async function readSession(store, sessionId, opts, fn) {
        var session = await admitSession(store, sessionId, opts);
        return fn(session);
    }

    /* Everything a student action has in common: load, check the clock, check not submitted, and
     * commit the mutation under a revision check. */
    async function withSession(store, sessionId, opts, fn) {
        var session = await admitSession(store, sessionId, opts);
        /* COMPARE-AND-SET, NOT READ-MODIFY-WRITE.
         *
         * This was get -> mutate -> put with nothing in between. Two concurrent calls on one session
         * -- a callable retry on a flaky connection, a double-clicked Submit, a student with two tabs
         * open -- both read the same prior state, each computed from it, and the second write
         * silently discarded the first. What gets discarded is not cosmetic: the event log is where
         * the verify-sequence questions (Q39-42) are graded from, so a student could watch a command
         * echo in their terminal and have it never reach the log the grader reads. A lost point on a
         * final with no way to prove it happened is the worst kind of defect -- invisible to both
         * sides.
         *
         * The revision check is part of the store CONTRACT, implemented by the Firestore store in a
         * transaction and by the in-memory store directly. It is deliberately NOT optional with a
         * fallback to put(): a guard that silently skips when the store does not implement it is a
         * guard that protects the test and not production. */
        var expectedRev = Number(session.rev || 0);
        var out = await fn(session);
        session.rev = expectedRev + 1;
        var wrote = await store.putIfRev(sessionId, session, expectedRev);
        if (!wrote) {
            /* 'aborted' is the code the client should retry on, and the only safe answer: the action
             * may or may not have been applied by the writer that won, so the caller must re-read
             * rather than assume either way. */
            throw err('aborted', 'The exam session changed while this request was running. Retry.');
        }
        return out;
    }

    /* ── the terminal ────────────────────────────────────────────────────────────────────────────
     * Takes a LINE, never state. The command runs here, on the server, against the stored lab. */
    async function runCommand(store, args, opts) {
        return withSession(store, args.sessionId, opts, function (session) {
            var line = String(args.line === undefined ? '' : args.line);
            if (line.length > 500) { throw err('invalid-argument', 'Command too long.'); }
            var res = SHELL.exec(session.state, session.shell, line);
            session.shell = res.session;
            /* ═══ COMMAND TEXT IS DELIBERATELY NOT SCANNED, AND THAT IS A REVERSAL ══════════════
             *
             * I added a disclosure scan here on the argument that renderWindow, runAction and
             * restoreDevice were scanned and this surface was not -- "I looked and found nothing is
             * not the same as something is looking". The scan had to exempt the student's own echoed
             * input, because `ssh S7B` replies "ssh: connect to host S7B port 22" and refusing that
             * would 500 a student for typing a hostname. Both halves were wrong, and the design
             * review found both:
             *
             *   1. THE REFUSAL DISCLOSED THE SECRET IT REFUSED TO SEND. The thrown message was
             *      'Refusing to return command output that discloses fault data: ' + the matched
             *      tokens. `err('internal', ...)` is passed through verbatim by netfinalCall, and the
             *      page writes `esc(e.message)` into a visible element -- so every time the scanner
             *      did its job it printed the fault id on screen, isolated and labelled. Strictly
             *      worse than no scan.
             *   2. THE ECHO EXEMPTION WAS BYPASSABLE FOR FREE. A token was exempt if it appeared
             *      anywhere in the 500-character line, with no link between that appearance and the
             *      token's appearance in the OUTPUT. Padding a command with the 24 slot names -- 123
             *      characters -- exempted everything. Two of the three patterns are the literal
             *      English words "slot" and "variant", so no guessing was even required.
             *
             * I could have written a third version. I am not going to. The scan was speculative
             * hardening behind no demonstrated leak: the security audit fuzzed 70 command/device
             * combinations across every registered command and found nothing it would have caught,
             * and grepped every hardcoded output string for the pattern words with hits only in
             * comments. Against that, my two rounds of additions here produced two real defects, one
             * of which leaked. Removing an unproven guard that caused proven harm is the smaller
             * mistake, and the audited position is the one without it.
             *
             * THE GAP IS REAL AND STATED RATHER THAN CLOSED: if a future change makes a command echo
             * server-authored fault data, nothing here will stop it. The protections that remain are
             * the three structured surfaces, which are scanned, and the fact that fault definitions
             * live in netfinal-faults.js and never enter `state`. If this is ever revisited, the
             * design must satisfy both: a message that names no token, and an exemption that cannot
             * be manufactured by the attacker supplying the token themselves. */
            return {
                out: res.out,
                prompt: SHELL.prompt(session.state, session.shell),
                remainingMs: remainingMs(session, opts)
            };
        });
    }

    /* ── the windows ─────────────────────────────────────────────────────────────────────────────── */
    async function renderWindow(store, args, opts) {
        /* readSession, not withSession: this is the one entry point that changes nothing. */
        return readSession(store, args.sessionId, opts, function (session) {
            var view = GUI.render(session.state, String(args.window || ''));
            if (view && view.error) { throw err('invalid-argument', view.error); }
            /* BELT AND BRACES. The leak suite already asserts no render discloses a fault, and this
             * re-checks the actual payload on its way out: a disclosure that reached a student
             * cannot be taken back, so it is cheaper to refuse to send it. */
            var leaks = CLIENT.findDisclosures(view, args.window);
            if (leaks.length) {
                throw err('internal', 'Refusing to send a window that discloses fault data: '
                    + leaks.map(function (l) { return l.path; }).join(', '));
            }
            return { window: args.window, view: view, remainingMs: remainingMs(session, opts) };
        });
    }

    async function runAction(store, args, opts) {
        return withSession(store, args.sessionId, opts, function (session) {
            var res = GUI.act(session.state, String(args.window || ''), String(args.action || ''), args.params || {});
            /* THE SAME CHECK renderWindow HAS, because there are two surfaces that can emit
             * arbitrary engine output and the scanner was wired to one of them. A prototype-chain
             * dispatch confusion made `act` return the whole state -- every fault with its target,
             * the baseline, the seed -- and renderWindow REFUSED the identical payload while this
             * returned it, because nothing here looked. The dispatch bug is fixed at its root in
             * netfinal-gui.js; this is the layer that would have contained it anyway, and the reason
             * to add it is precisely that it did not exist when it was needed. */
            var leaks = CLIENT.findDisclosures(res, 'action:' + args.window + '/' + args.action);
            if (leaks.length) {
                throw err('internal', 'Refusing to return an action result that discloses fault data: '
                    + leaks.map(function (l) { return l.path; }).join(', '));
            }
            return { result: res, remainingMs: remainingMs(session, opts) };
        });
    }

    async function restoreDevice(store, args, opts) {
        return withSession(store, args.sessionId, opts, function (session) {
            var res = GUI.restore(session.state, String(args.device || ''));
            /* Third emitting surface, same reasoning as runAction above. */
            var leaks = CLIENT.findDisclosures(res, 'restore:' + args.device);
            if (leaks.length) {
                throw err('internal', 'Refusing to return a restore result that discloses fault data: '
                    + leaks.map(function (l) { return l.path; }).join(', '));
            }
            return { result: res, remainingMs: remainingMs(session, opts) };
        });
    }

    /* ── answers ─────────────────────────────────────────────────────────────────────────────────
     * Stored verbatim and UNGRADED. Spec section 9: the browser never holds expected values, and
     * nothing may tell a student mid-exam whether an answer is right. */
    async function saveAnswer(store, args, opts) {
        return withSession(store, args.sessionId, opts, function (session) {
            var res = GUI.act(session.state, 'questions', 'answer',
                { id: String(args.questionId || ''), value: args.value });
            if (!res.ok) { throw err('invalid-argument', res.reason); }
            return {
                saved: true,
                answered: Object.keys(session.state.answers || {}).length,
                remainingMs: remainingMs(session, opts)
            };
        });
    }

    /* ── submission ──────────────────────────────────────────────────────────────────────────────
     * GRADED ON THE SERVER, against the key built at exam start. Idempotent: a second submission
     * returns the first report rather than regrading, so a double-click cannot change a mark. */
    async function submitExam(store, args, opts) {
        opts = opts || {};
        var session = await store.get(args.sessionId);
        if (!session) { throw err('not-found', 'No such exam session.'); }
        if (session.submittedAt) {
            return { alreadySubmitted: true, submittedAt: session.submittedAt, report: session.report };
        }
        var expectedRev = Number(session.rev || 0);
        var report = GRADE.grade(session.state, session.answerKey);
        report.auto = !!args.auto;
        report.durationUsedMs = Math.min(session.durationMs, nowMs(opts) - session.startedAt);
        session.submittedAt = nowMs(opts);
        session.report = report;
        session.rev = expectedRev + 1;
        /* COMPARE-AND-SET here too, for the same reason as withSession. A double-clicked Submit ran
         * this twice concurrently: both saw submittedAt null, both graded, and the loser's write
         * landed second. Worse, a Submit racing a command could drop the command -- grading a state
         * the student had already moved past, or accepting a write after the submit it lost to. */
        var wrote = await store.putIfRev(args.sessionId, session, expectedRev);
        if (!wrote) {
            /* Someone else wrote first. Re-read: if they submitted, that submission stands and this
             * call is idempotent after all. If they did not, the caller retries. */
            var fresh = await store.get(args.sessionId);
            if (fresh && fresh.submittedAt) {
                return { alreadySubmitted: true, submittedAt: fresh.submittedAt, report: fresh.report };
            }
            throw err('aborted', 'The exam session changed while submitting. Retry.');
        }
        await notifyGraded(session, opts);
        return { submitted: true, submittedAt: session.submittedAt, report: report };
    }

    /* AFTER A GRADE LANDS, tell whoever records grades (functions/index.js writes the gradebook).
     * Called only once the submission is durably stored, from the ONE place every submission goes
     * through -- a student's Submit, the clock's auto-submit and an instructor's Q45 marking -- so no
     * path can grade without recording. A recording failure is logged and never undoes the grade:
     * the session is the record of truth, the gradebook a copy that can be rebuilt from it. */
    async function notifyGraded(session, opts) {
        if (!opts || typeof opts.onGraded !== 'function') { return; }
        try { await opts.onGraded(session); }
        catch (e) { if (typeof console !== 'undefined') { console.error('[netfinal] onGraded failed: ' + (e && e.message)); } }
    }

    /* ── instructor marking: Q45 ─────────────────────────────────────────────────────────────────
     * Three narratives, 0-3 each, per the spec section 8 rubric. Staff only; the callable checks.
     * Marking changes one row and every total above it, so the report is re-totalled by the
     * grader's own `retotal` rather than patched here, and the gradebook copy follows through
     * notifyGraded. Re-marking replaces the previous marks; it never adds to them. */
    async function markNarratives(store, args, opts) {
        opts = opts || {};
        var sessionId = String(args.sessionId || '');
        var markedBy = String(args.markedBy || '');
        if (!sessionId || !markedBy) { throw err('invalid-argument', 'sessionId and markedBy are required.'); }
        var marks = args.marks;
        if (!Array.isArray(marks) || marks.length !== 3
            || !marks.every(function (m) { return m === 0 || m === 1 || m === 2 || m === 3; })) {
            throw err('invalid-argument', 'Q45 takes three marks, each 0, 1, 2 or 3.');
        }
        var session = await store.get(sessionId);
        if (!session) { throw err('not-found', 'No exam session.'); }
        if (!session.submittedAt || !session.report) {
            throw err('failed-precondition', 'Only a submitted sitting can be marked.');
        }
        var expectedRev = Number(session.rev || 0);
        var row = (session.report.questions || []).filter(function (r) { return r.n === 45; })[0];
        if (!row) { throw err('failed-precondition', 'This report has no Q45 row.'); }
        var got = marks[0] + marks[1] + marks[2];
        row.earned = Math.min(got, row.of);
        row.pending = 0;
        row.marks = marks.slice();
        row.markedBy = markedBy;
        row.markedAt = nowMs(opts);
        row.note = 'instructor-marked: ' + marks.join(' + ') + ' = ' + row.earned + ' of ' + row.of;
        GRADE.retotal(session.report);
        session.rev = expectedRev + 1;
        var wrote = await store.putIfRev(sessionId, session, expectedRev);
        if (!wrote) { throw err('aborted', 'The sitting changed while marking. Retry.'); }
        await notifyGraded(session, opts);
        return { marked: true, total: session.report.total, outOf: session.report.outOf,
                 pendingInstructorMarks: session.report.pendingInstructorMarks };
    }

    /* WHAT AN INSTRUCTOR SEES OF ONE SITTING. The FULL report (every question, its marks and the
     * grader's note) is for staff only -- it is the key to that student's lab, and the same lab
     * comes back on a restart -- so the callable that returns this checks staff first. */
    function instructorView(session, opts) {
        if (!session) { return null; }
        var rep = session.report || null;
        var q45 = rep ? (rep.questions || []).filter(function (r) { return r.n === 45; })[0] : null;
        return {
            studentId: session.studentId, examId: session.examId,
            startedAt: session.startedAt, submittedAt: session.submittedAt || null,
            remainingMs: session.submittedAt ? 0 : remainingMs(session, opts),
            report: rep,
            narratives: q45 ? { items: q45.items || [], rubric: q45.rubric || null,
                                marks: q45.marks || null, markedBy: q45.markedBy || null } : null
        };
    }

    /* ── restart ─────────────────────────────────────────────────────────────────────────────────
     * NO AUTHORISATION HERE: this function trusts its `resetBy`, and the callable decides who may
     * restart whose sitting (anyone their own, staff anyone's) before it gets here.
     *
     * ARCHIVED, NEVER DELETED. The sitting -- lab, answers, event log, report -- is copied to the
     * archive and only then removed from the live path, in one store operation, so a failure leaves
     * either the original or both and never neither. The attempt a student is being given a second
     * go at is evidence an instructor may need, and a reset that destroyed it would make "why did
     * this student get a retake" unanswerable.
     *
     * THE SAME LAB COMES BACK. The seed is secret|studentId|examId and none of those change, so the
     * next start regenerates the identical faults, addresses and key -- the operator's decision, and
     * it means the instructor key for this student is still the right key after a reset. What is new
     * is the clock, the answers and the event log. */
    /* WHO MAY RESTART SOMEBODY ELSE'S SITTING: platform admins (the `admin` claim, or an email on the
     * admin allowlist -- the same two tests as requireAdmin in functions/index.js) and instructors
     * (the `handler` claim, the role gradeEDTSubmission already trusts to mark student work). Anyone
     * may restart their OWN sitting since 2026-10-19; this guards everybody else's.
     * Pure over the decoded token so the rule is testable without firebase-functions. */
    function isStaff(token, adminEmails) {
        if (!token || typeof token !== 'object') { return false; }
        if (token.admin === true || token.handler === true) { return true; }
        var email = typeof token.email === 'string' ? token.email.toLowerCase() : '';
        return !!email && Array.isArray(adminEmails) && adminEmails.indexOf(email) >= 0;
    }

    /* WHO MAY RESTART WHICH SITTING. Your own: any signed-in caller, unlimited (operator,
     * 2026-10-19). Somebody else's: staff only, or any student could wipe another's work in
     * progress. One function so the callable and the tests ask the same question. */
    function mayReset(callerUid, targetUid, token, adminEmails) {
        if (typeof callerUid !== 'string' || !callerUid) { return false; }
        if (targetUid === callerUid) { return true; }
        return isStaff(token, adminEmails);
    }

    async function resetSession(store, args, opts) {
        var sessionId = String(args.sessionId || '');
        if (!sessionId) { throw err('invalid-argument', 'sessionId is required.'); }
        var resetBy = String(args.resetBy || '');
        if (!resetBy) { throw err('invalid-argument', 'resetBy is required.'); }
        /* A STUDENT restarts only a SUBMITTED sitting (operator, 2026-10-19). Otherwise a restart is a
         * fresh two-hour clock on a lab whose faults the student has already found, available at any
         * moment from devtools. The callable sets requireSubmitted for non-staff; staff may restart a
         * sitting in progress, which is how a broken session is rescued. Checked by a read before the
         * archive: a sitting only moves from open to submitted, never back, so the read cannot be
         * overtaken in the direction that matters. */
        if (args.requireSubmitted) {
            var cur = await store.get(sessionId);
            if (!cur) { throw err('not-found', 'No exam session to restart.'); }
            if (!cur.submittedAt) {
                throw err('failed-precondition', 'Submit this attempt before restarting it.');
            }
        }
        var resetAt = nowMs(opts);
        var archiveId = sessionId + '__' + resetAt;
        var archived = await store.archiveAndRemove(sessionId, archiveId, {
            resetAt: resetAt, resetBy: resetBy,
            reason: String(args.reason || '').slice(0, 500)
        });
        if (!archived) { throw err('not-found', 'No exam session to restart.'); }
        return {
            reset: true, archiveId: archiveId,
            wasSubmitted: !!archived.submittedAt,
            previousTotal: archived.report ? archived.report.total : null,
            previousOutOf: archived.report ? archived.report.outOf : null
        };
    }

    /* The student's own view after submitting: AGGREGATES ONLY -- the total, the phase totals and
     * the practical/reasoning subtotals. Never the key, and since 2026-10-19 never per-question marks.
     *
     * Per-question marks used to go back here, justified as "what they scored, not what they should
     * have written". That held for ONE look at one attempt. Unlimited self-restart onto the SAME lab
     * turned it into an answer oracle: submit, read which question (and which PART -- partial credit
     * isolates the wrong field) scored zero, restart, change only those, repeat. Mallory converged
     * Q1 in four attempts. The operator chose aggregates-only. The page never rendered the
     * per-question rows, so nothing a student SEES changed; what changed is what the Network tab
     * shows. Totals still move between attempts, so this slows guessing rather than ending it --
     * an honest residual, not a closed hole. The full report stays in the session for instructors. */
    function studentReport(report) {
        if (!report) { return null; }
        return {
            total: report.total, outOf: report.outOf,
            pendingInstructorMarks: report.pendingInstructorMarks,
            subtotals: report.subtotals, phases: report.phases,
            flagged: report.flagged
        };
    }

    /* ── telemetry ───────────────────────────────────────────────────────────────────────────────
     * Spec section 9: "Every command, GUI change, answer, restore, and change request is logged with
     * a timestamp through the existing ObservatoryTelemetry component." The event log already holds
     * all of it, so this shapes it for that pipeline rather than recording it twice. */
    function telemetry(session) {
        return (session.state.events || []).map(function (e) {
            return {
                t: e.t, kind: e.kind, actor: e.actor, detail: e.detail,
                studentId: session.studentId, examId: session.examId
            };
        });
    }

    /* THE COMPARE-AND-SET CONDITION, shared by both stores so they cannot disagree about it.
     *
     * A write lands only on the SAME SITTING it read, at the revision it read. Before restarts
     * existed, "the stored rev equals the one I read, or there is nothing stored" was enough. A
     * restart breaks both halves:
     *   - nothing stored: a command in flight when the sitting is archived would write the OLD
     *     session straight back to the live path, undoing the restart with a stale lab state;
     *   - rev 0 again: a restart followed by a fresh start puts a new sitting at rev 0, and an old
     *     request that read rev 0 would match it and overwrite the new sitting -- an old Submit
     *     would mark the retake submitted before the student touched it.
     * So the stored document must EXIST and must be the same sitting, identified by `startedAt`,
     * which is set once at creation and never rewritten. putIfRev is only ever reached after a read
     * of an existing session, so requiring existence refuses nothing legitimate. */
    function sameSitting(stored, incoming, expectedRev) {
        return !!stored
            && Number(stored.rev || 0) === Number(expectedRev)
            && Number(stored.startedAt) === Number(incoming && incoming.startedAt);
    }

    /* An in-memory store, used by the tests and by nothing else. */
    function memoryStore() {
        var m = {};
        var archive = {};
        /* COPIES, NOT REFERENCES, because the Firestore store cannot hand back a reference: it
         * serializes to JSON on write and parses on read. Storing the live object here made the test
         * store behave in a way production never does -- and it was not a harmless difference. The
         * revision check read the SAME object the caller was mutating, so the bump the caller had
         * just made was already visible and every write looked like a conflict. A harness that
         * aliases where production copies tests a system nobody runs. */
        var copy = function (v) { return v === null || v === undefined ? v : JSON.parse(JSON.stringify(v)); };
        return {
            get: async function (k) { return m[k] ? copy(m[k]) : null; },
            put: async function (k, v) { m[k] = copy(v); return true; },
            /* Write only if nothing is stored. Returns false, never throws, when something is. */
            create: async function (k, v) {
                if (m[k]) { return false; }
                m[k] = copy(v);
                return true;
            },
            /* The same contract the Firestore store implements with a transaction: write only if the
             * stored revision is still the one the caller read. Returns false on a mismatch rather
             * than throwing, so the caller owns the error type. */
            putIfRev: async function (k, v, expectedRev) {
                var cur = m[k];
                if (!sameSitting(cur, v, expectedRev)) { return false; }
                m[k] = copy(v);
                return true;
            },
            /* Archive, then remove, as one step. Returns the archived session, or null if there was
             * nothing to archive. */
            archiveAndRemove: async function (k, archiveId, meta) {
                var cur = m[k];
                if (!cur) { return null; }
                archive[archiveId] = Object.assign(copy(cur), copy(meta), { originalId: k });
                delete m[k];
                return copy(cur);
            },
            all: function () { return m; },
            archived: function () { return archive; }
        };
    }

    module.exports = {
        startExam: startExam, runCommand: runCommand, renderWindow: renderWindow,
        runAction: runAction, restoreDevice: restoreDevice, saveAnswer: saveAnswer,
        submitExam: submitExam, studentReport: studentReport, telemetry: telemetry,
        markNarratives: markNarratives, instructorView: instructorView,
        resetSession: resetSession, sameSitting: sameSitting, isStaff: isStaff, mayReset: mayReset,
        examModeFlags: examModeFlags, memoryStore: memoryStore,
        savedAnswers: savedAnswers,
        remainingMs: remainingMs, DEFAULT_MINUTES: DEFAULT_MINUTES
    };
})();
