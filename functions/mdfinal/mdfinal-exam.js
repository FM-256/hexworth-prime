/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-exam.js — the exam session service: start behind the release window, every student entry
 * point, handover, submit, the staff rescue paths, resets, sweep, and the gradebook entry shape.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 1.1-1.4, 2.4, 2.5, R2, R3,
 * R6, R7, 13.1, 13.2 items 4-5, 13.5 item 6.
 *
 * THE LAB LIVES SERVER-SIDE, KEYED BY SESSION (netfinal-exam.js header, the decision Mallory said
 * stage 7 must not get wrong). Every entry point takes a sessionId the callable derived from the
 * caller and reads the lab from the store; nothing accepts a state blob.
 *
 * THE CLOCK IS READ HERE AND NOWHERE ELSE (opts.now), and handed to the engine as ctx.now; the
 * answer key is handed as ctx.key on every action and command (BitLocker protector ids and
 * recovery passwords are keyed per sitting). The store is injected: functions/index.js passes the
 * Firestore store, the suites pass memoryStore(); both share toDocument/fromDocument/sameSitting,
 * so the two cannot disagree about what is stored or what counts as the same sitting.
 *
 * WHAT A CLIENT RECEIVES: mdfinal-client.js toInitialState, view and action payloads that pass
 * findDisclosures, command output, and after submit studentReport (aggregates only).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var EXAMS = require('./mdfinal-exams.js');
    var LIM = require('./mdfinal-limits.js');

    /* The engine is required on first use, not at load, so a fault in an engine module cannot break
     * loading this file (spec 1.1: free of side effects at load time; 8.1 step 1). */
    var M = null;
    function eng() {
        if (!M) {
            M = {
                CORE: require('./mdfinal-core.js'), GRADE: require('./mdfinal-grade.js'), GUI: require('./mdfinal-gui.js'),
                SH: require('./mdfinal-shell.js'), VIEWS: require('./mdfinal-views.js'), CLIENT: require('./mdfinal-client.js'),
                ANS: require('./mdfinal-answers.js'), HO: require('./mdfinal-handover.js'), PROV: require('./mdfinal-provision.js')
            };
        }
        return M;
    }

    var L = LIM.LIMITS;
    /* Normal writes leave room for the report (13.2 item 5): 700,000 - 65,536 bytes. */
    var WRITE_LIMIT = L.storage.documentBytes - L.storage.reportHeadroomBytes;
    var GENERIC_WINDOW = 'This window could not be shown.';
    var GENERIC_ACTION = 'That action could not be completed.';

    function err(code, message) { var e = new Error(message); e.code = code; return e; }

    /* ── the clock ───────────────────────────────────────────────────────────────────────────── */

    /* The only clock read: injected by tests, Date.now() in production. */
    function nowMs(opts) { return (opts && typeof opts.now === 'function') ? Number(opts.now()) : Date.now(); }
    function remainingMs(session, opts) { return Math.max(0, Number(session.expiresAt) - nowMs(opts)); }
    function expired(session, opts) { return remainingMs(session, opts) <= 0; }

    /* ── identities ──────────────────────────────────────────────────────────────────────────── */

    /* A uid that may become part of a document id: non-empty, bounded, no path or id separators. */
    function validUid(uid) { return typeof uid === 'string' && uid.length > 0 && uid.length <= 128 && uid.indexOf('/') < 0 && uid.indexOf('::') < 0; }
    function sessionIdFor(uid, examId) { return uid + '::' + examId; }

    /* Platform admin: the decoded `admin` claim, or a VERIFIED email on the admin allowlist. An
     * unverified token carrying an allowlisted address is not admin here (Mallory D6 F4; the
     * platform's requireAdmin has the same gap and is the operator's call). */
    function isAdmin(token, adminEmails) {
        if (!token || typeof token !== 'object') { return false; }
        if (token.admin === true) { return true; }
        var email = typeof token.email === 'string' ? token.email.toLowerCase() : '';
        return !!email && token.email_verified === true && Array.isArray(adminEmails) && adminEmails.indexOf(email) >= 0;
    }

    /* The operator role a second admin reset needs (13.5 item 6.7). No `operator` claim exists on
     * the platform, so the role is the admin email allowlist itself, which is narrower than the
     * `admin` claim (declared, 13.14). */
    function isOperator(token, adminEmails) {
        var email = token && typeof token.email === 'string' ? token.email.toLowerCase() : '';
        return !!email && token.email_verified === true && Array.isArray(adminEmails) && adminEmails.indexOf(email) >= 0;
    }

    /* ── the stored document ─────────────────────────────────────────────────────────────────── */

    /* One serializer for every store. Every structured field is a JSON string (registry and file
     * paths carry dots and backslashes, which Firestore would read as field paths). */
    function toDocument(s) {
        var j = function (v) { return v === null || v === undefined ? null : JSON.stringify(v); };
        return {
            sessionId: s.sessionId, studentId: s.studentId, examId: s.examId, attempt: Number(s.attempt || 0),
            startedAt: s.startedAt, expiresAt: s.expiresAt, durationMs: s.durationMs,
            submittedAt: s.submittedAt || null, autoSubmitted: !!s.autoSubmitted,
            handedOverAt: s.handedOverAt || null, provisionedAt: s.provisionedAt || null, provisionedBy: s.provisionedBy || null,
            generatorVersion: s.generatorVersion,
            stateJson: j(s.state), snapshotJson: j(s.snapshot), p1SnapshotJson: j(s.p1Snapshot),
            answerKeyJson: j(s.answerKey), reportJson: j(s.report), lineageJson: j(s.lineage),
            rev: Number(s.rev || 0)
        };
    }
    function fromDocument(d) {
        if (!d) { return null; }
        var p = function (v) { return v === null || v === undefined ? null : JSON.parse(v); };
        return {
            sessionId: d.sessionId, studentId: d.studentId, examId: d.examId, attempt: Number(d.attempt || 0),
            startedAt: d.startedAt, expiresAt: d.expiresAt, durationMs: d.durationMs,
            submittedAt: d.submittedAt || null, autoSubmitted: !!d.autoSubmitted,
            handedOverAt: d.handedOverAt || null, provisionedAt: d.provisionedAt || null, provisionedBy: d.provisionedBy || null,
            generatorVersion: d.generatorVersion,
            state: p(d.stateJson), snapshot: p(d.snapshotJson), p1Snapshot: p(d.p1SnapshotJson),
            answerKey: p(d.answerKeyJson), report: p(d.reportJson), lineage: p(d.lineageJson) || freshLineage(),
            rev: Number(d.rev || 0)
        };
    }
    /* Bytes the stored document would take (13.2 item 5: measured with Buffer.byteLength). */
    function documentBytes(s) { return Buffer.byteLength(JSON.stringify(toDocument(s))); }

    /* A write lands only on the SAME attempt it read, at the revision it read (netfinal's sameSitting,
     * plus `attempt`: a self-reset keeps startedAt verbatim, so startedAt alone no longer tells an
     * attempt from its replacement). Works on stored documents or sessions alike. */
    function sameSitting(stored, incoming, expectedRev) {
        return !!stored && !!incoming
            && Number(stored.rev || 0) === Number(expectedRev)
            && Number(stored.startedAt) === Number(incoming.startedAt)
            && Number(stored.attempt || 0) === Number(incoming.attempt || 0);
    }

    function freshLineage() { return { selfResets: 0, adminResets: 0, resets: [], penalties: [], seed: 0 }; }
    /* The seed index a sitting's lab is derived with (0 until an admin reset deals a new lab). */
    function seedOf(lineage) { return lineage && typeof lineage.seed === 'number' ? lineage.seed : 0; }

    /* ── start and resume ────────────────────────────────────────────────────────────────────── */

    /* Spec 1.4 lockdown flags, as data the page reads (13.5 item 7: one graded submission). */
    function examModeFlags() {
        return { examMode: true, loadHexAI: false, courseLinks: false, hints: false, timeBonus: false,
                 serverTimer: true, serverGraded: true, oneGradedSubmission: true, selfResetCap: EXAMS.SELF_RESET_CAP };
    }

    /* The student's own saved P8 values (selects as ids, typed values as $s). */
    function savedAnswers(state) {
        var E = eng(), out = {};
        Object.keys((state && state.answers) || {}).forEach(function (id) {
            var f = E.ANS.FIELDS[id];
            if (!f) { return; }
            out[id] = f.type === 'text' ? E.VIEWS.S(state.answers[id].value) : state.answers[id].value;
        });
        return out;
    }

    /* The initial-state projection, through the scanner like every other payload (defence in depth:
     * the projection is a pinned whitelist). */
    function scannedInitial(st) {
        var E = eng(), init = E.CLIENT.toInitialState(st);
        var leaks = E.CLIENT.findDisclosures(init, 'initial');
        if (leaks.length) { throw refuseDisclosure('initial', leaks, 'The exam could not be loaded.'); }
        return init;
    }

    /* What start and resume return. A submitted sitting brings back its aggregates-only report. */
    function startReply(session, resumed, opts) {
        var E = eng(), st = session.state;
        return {
            sessionId: session.sessionId, resumed: resumed,
            submitted: !!session.submittedAt, handedOver: !!session.handedOverAt,
            screen: E.GUI.currentScreen(st),
            initialState: scannedInitial(st),
            answers: savedAnswers(st),
            answerFields: E.ANS.answerFields(st),
            remainingMs: session.submittedAt ? 0 : remainingMs(session, opts),
            examMode: examModeFlags(),
            selfResetsLeft: Math.max(0, EXAMS.SELF_RESET_CAP - session.lineage.selfResets),
            report: session.submittedAt ? E.GRADE.studentReport(session.report) : null
        };
    }

    /* A new attempt of the sitting: generated from the secret (same lab every time for this uid and
     * exam id), on the given clock. */
    function newSession(uid, examId, clock, secret, attempt, lineage) {
        var E = eng();
        var seed = seedOf(lineage);
        var state = E.CORE.generate(uid, examId, { secret: secret, seed: seed });
        var key = E.GRADE.buildAnswerKey(uid, examId, { secret: secret, seed: seed });
        return {
            sessionId: sessionIdFor(uid, examId), studentId: uid, examId: examId, attempt: attempt,
            startedAt: clock.startedAt, expiresAt: clock.expiresAt, durationMs: clock.durationMs,
            submittedAt: null, autoSubmitted: false, handedOverAt: null, provisionedAt: null, provisionedBy: null,
            generatorVersion: E.CORE.GENERATOR_VERSION,
            state: state, snapshot: null, p1Snapshot: null, answerKey: key, report: null,
            lineage: lineage || freshLineage(), rev: 0
        };
    }

    /* Start or resume. Resume is always allowed (the session clock governs it); a NEW sitting needs
     * the release window or the allowlist (R2), checked against the control document read fresh on
     * every create (13.2 item 4). `isAdmin` is decided by the callable from the decoded token. */
    async function startExam(store, args, opts) {
        opts = opts || {};
        var uid = args.studentId, examId = EXAMS.resolveExamId(args.examId);
        if (!validUid(uid) || !examId) { throw err('invalid-argument', 'Invalid exam request.'); }
        var sid = sessionIdFor(uid, examId);
        var existing = fromDocument(await store.get(sid));
        if (existing) { return resumeOrClose(store, existing, opts); }
        var control = await store.getControl(examId);
        if (!EXAMS.mayCreate(examId, uid, args.isAdmin === true, control, nowMs(opts))) {
            throw err('failed-precondition', 'This exam is not open.');
        }
        var minutes = EXAMS.durationMinutes(examId);
        var t = nowMs(opts);
        var session = newSession(uid, examId, { startedAt: t, expiresAt: t + minutes * 60000, durationMs: minutes * 60000 }, opts.secret, 0, null);
        /* create-if-absent: two first starts race, the loser resumes the winner (netfinal, Mallory) */
        var created = await store.create(sid, toDocument(session));
        if (!created) {
            var winner = fromDocument(await store.get(sid));
            if (!winner) { throw err('aborted', 'The exam session changed while starting. Retry.'); }
            return resumeOrClose(store, winner, opts);
        }
        return startReply(session, false, opts);
    }

    /* A resume of an expired, unsubmitted sitting submits it first, so a late return sees its grade. */
    async function resumeOrClose(store, session, opts) {
        if (!session.submittedAt && expired(session, opts)) {
            await submitExam(store, { sessionId: session.sessionId, auto: true }, opts);
            session = fromDocument(await store.get(session.sessionId));
        }
        return startReply(session, true, opts);
    }

    /* ── admission ───────────────────────────────────────────────────────────────────────────── */

    /* Load and admit: exists, built by this generator, not submitted, not expired (expiry submits). */
    async function admitSession(store, sessionId, opts) {
        if (typeof sessionId !== 'string' || !sessionId) { throw err('invalid-argument', 'Invalid exam request.'); }
        var session = fromDocument(await store.get(sessionId));
        if (!session) { throw err('not-found', 'No exam session. Start the exam first.'); }
        if (session.submittedAt) { throw err('failed-precondition', 'This exam has been submitted.'); }
        if (expired(session, opts)) {
            await submitExam(store, { sessionId: sessionId, auto: true }, opts);
            throw err('deadline-exceeded', 'Time expired; the exam was submitted automatically.');
        }
        /* A sitting whose key predates the current generator (1.0.0 had no BitLocker slots) is refused
         * rather than graded against a key that cannot describe it. */
        if (!session.answerKey || session.answerKey.version !== eng().CORE.GENERATOR_VERSION) {
            throw err('failed-precondition', 'This sitting was created by an older exam build. Ask staff to restart it.');
        }
        return session;
    }

    /* The engine context for one call: the frozen key and the server clock. */
    function engineCtx(session, opts) { return { key: session.answerKey, now: nowMs(opts) }; }

    /* A read: no revision claimed, nothing written. */
    async function readSession(store, sessionId, opts, fn) {
        var session = await admitSession(store, sessionId, opts);
        return fn(session);
    }

    /* A write: compare-and-set on the attempt and revision, refused BEFORE writing when the result
     * would pass the ledger cap or the storage limit (R3), so a refused call leaves the stored
     * document byte-identical and `rev` unchanged. */
    async function withSession(store, sessionId, opts, fn, caps) {
        var session = await admitSession(store, sessionId, opts);
        var expectedRev = session.rev;
        var ledgerBefore = session.state.ledger.length;
        var out = await fn(session);
        /* A call that ADDS entries past the cap is refused; one that adds none (a read-only command)
         * is not, even on a ledger already past it. Handover is exempt (it adds the fault's entries),
         * so a spammed ledger cannot cost a student Phase 7 (Nancy D6 low). */
        var ledgerAfter = session.state.ledger.length;
        if (!(caps && caps.ledgerExempt) && ledgerAfter > ledgerBefore && ledgerAfter > L.ledger.maxEntries) { throw err('failed-precondition', LIM.STORAGE_MESSAGE); }
        session.rev = expectedRev + 1;
        if (documentBytes(session) > WRITE_LIMIT) { throw err('failed-precondition', LIM.STORAGE_MESSAGE); }
        var wrote = await store.putIfRev(sessionId, toDocument(session), expectedRev);
        if (!wrote) { throw err('aborted', 'The exam session changed while this request was running. Retry.'); }
        return out;
    }

    /* ── the student surface ─────────────────────────────────────────────────────────────────── */

    /* One console line. The line crosses the wire; the lab does not. Output is not pattern-scanned
     * (it echoes the student's own input, netfinal-exam.js runCommand); the leak suite fuzzes it. */
    async function runCommand(store, args, opts) {
        var line = args.line;
        if (typeof line !== 'string' || line.length > L.command.maxChars) { throw err('invalid-argument', 'Command too long.'); }
        var cons = typeof args.console === 'string' ? args.console : '';
        return withSession(store, args.sessionId, opts, function (session) {
            var E = eng();
            var r = E.SH.exec(session.state, cons, line, engineCtx(session, opts));
            return { out: r.out, prompt: r.prompt, context: r.context, screen: E.GUI.currentScreen(session.state),
                     consoles: E.CLIENT.toInitialState(session.state).consoles, windows: E.CLIENT.toInitialState(session.state).windows, remainingMs: remainingMs(session, opts) };
        });
    }

    /* Logs a disclosure server-side (paths and reasons only, never values) and refuses generically. */
    function refuseDisclosure(where, leaks, message) {
        if (typeof console !== 'undefined') { console.error('[mdfinal] disclosure refused at ' + where + ': ' + JSON.stringify(leaks.slice(0, 20))); }
        return err('internal', message);
    }

    /* One window, read only, scanned on its way out. */
    async function renderWindow(store, args, opts) {
        var w = typeof args.window === 'string' ? args.window : '';
        return readSession(store, args.sessionId, opts, function (session) {
            var E = eng();
            var r = E.VIEWS.render(session.state, w, args.params);
            if (!r.ok) { throw err('invalid-argument', r.msg); }
            var leaks = E.CLIENT.findDisclosures(r.view, 'window:' + w);
            if (leaks.length) { throw refuseDisclosure('window:' + w, leaks, GENERIC_WINDOW); }
            return { window: w, view: r.view, screen: E.GUI.currentScreen(session.state), remainingMs: remainingMs(session, opts) };
        });
    }

    /* One GUI action. The result is rebuilt from three named fields, so an engine dispatch fault
     * cannot return an object (netfinal's prototype-dispatch leak returned the whole state). `msg`
     * is console-like text built from state and the request, often echoing the student's own
     * input, including names stored by earlier actions; like command output it is exempt from the
     * value patterns (an echo would lock the student out, and the ids they match never exist in
     * state) and is fuzzed by the leak suite instead. The structure is still scanned. */
    async function runAction(store, args, opts) {
        var w = typeof args.window === 'string' ? args.window : '';
        var a = typeof args.action === 'string' ? args.action : '';
        return withSession(store, args.sessionId, opts, function (session) {
            var E = eng();
            var r = E.GUI.act(session.state, w, a, args.params, engineCtx(session, opts));
            var result = { ok: !!r.ok, msg: typeof r.msg === 'string' ? r.msg.slice(0, 20000) : '', screen: E.GUI.currentScreen(session.state) };
            var leaks = E.CLIENT.findDisclosures({ ok: result.ok, screen: result.screen }, 'action:' + w + '/' + a);
            if (leaks.length) { throw refuseDisclosure('action:' + w + '/' + a, leaks, GENERIC_ACTION); }
            return { result: result, consoles: E.CLIENT.toInitialState(session.state).consoles,
                     windows: E.CLIENT.toInitialState(session.state).windows, remainingMs: remainingMs(session, opts) };
        });
    }

    /* One P8 field. Stored verbatim and ungraded: the reply never says whether it is right. */
    async function saveAnswer(store, args, opts) {
        var id = typeof args.fieldId === 'string' ? args.fieldId : '';
        return withSession(store, args.sessionId, opts, function (session) {
            var r = eng().ANS.save(session.state, id, args.value);
            if (!r.ok) { throw err('invalid-argument', r.msg); }
            return { saved: true, answeredCount: r.answeredCount, remainingMs: remainingMs(session, opts) };
        });
    }

    /* Handover (2.4): allowed any time before submit, one way, idempotent. Takes the P1-P6 snapshot,
     * then applies the fault when Windows is installed. */
    async function handover(store, args, opts) {
        if (args.confirm !== true) { throw err('invalid-argument', 'Confirm the handover.'); }
        return withSession(store, args.sessionId, opts, function (session) {
            var E = eng();
            if (session.handedOverAt) {
                return { handedOver: true, already: true, screen: E.GUI.currentScreen(session.state), ticket: E.VIEWS.ticket(session.state),
                         answerFields: E.ANS.answerFields(session.state), remainingMs: remainingMs(session, opts) };
            }
            var h = E.HO.handover(session.state, session.answerKey);
            if (!h.ok) { throw err('failed-precondition', h.msg); }
            session.snapshot = h.snapshot;
            session.handedOverAt = nowMs(opts);
            return { handedOver: true, already: false, applied: !!h.applied, screen: E.GUI.currentScreen(session.state),
                     ticket: E.VIEWS.ticket(session.state), answerFields: E.ANS.answerFields(session.state),
                     initialState: E.CLIENT.toInitialState(session.state), remainingMs: remainingMs(session, opts) };
        }, { ledgerExempt: true });
    }

    /* ── submission ──────────────────────────────────────────────────────────────────────────── */

    /* The full grade of a stored sitting. */
    function gradeOf(session) {
        return eng().GRADE.gradeSitting({ final: session.state, snapshot: session.snapshot, p1Snapshot: session.p1Snapshot,
                                          carriedPenalties: session.lineage.penalties }, session.answerKey);
    }

    /* Graded on the server, idempotent: a second submit returns the first report. Exempt from the
     * storage limit and the ledger cap (13.2 item 5), so a full sitting can always be graded. */
    async function submitExam(store, args, opts) {
        opts = opts || {};
        var session = fromDocument(await store.get(args.sessionId));
        if (!session) { throw err('not-found', 'No exam session. Start the exam first.'); }
        if (session.submittedAt) { return { alreadySubmitted: true, submittedAt: session.submittedAt, report: session.report }; }
        var expectedRev = session.rev;
        var report = gradeOf(session);
        var t = nowMs(opts);
        report.durationUsedMs = Math.max(0, Math.min(Number(session.expiresAt), t) - Number(session.startedAt));
        report.auto = !!args.auto;
        session.report = report;
        session.submittedAt = t;
        session.autoSubmitted = !!args.auto;
        session.rev = expectedRev + 1;
        var wrote = await store.putIfRev(args.sessionId, toDocument(session), expectedRev);
        if (!wrote) {
            var fresh = fromDocument(await store.get(args.sessionId));
            if (fresh && fresh.submittedAt) { return { alreadySubmitted: true, submittedAt: fresh.submittedAt, report: fresh.report }; }
            throw err('aborted', 'The exam session changed while submitting. Retry.');
        }
        await notifyGraded(session, opts);
        return { submitted: true, submittedAt: session.submittedAt, report: report };
    }

    /* After a grade is durably stored, tell the gradebook writer. A failure is logged, never undoes
     * the grade: the session is the record of truth. */
    async function notifyGraded(session, opts) {
        if (!opts || typeof opts.onGraded !== 'function') { return; }
        try { await opts.onGraded(session); }
        catch (e) { if (typeof console !== 'undefined') { console.error('[mdfinal] onGraded failed: ' + (e && e.message)); } }
    }

    /* Auto-submits each listed sitting that has expired unsubmitted (R7 sweep; admin only, decided by
     * the callable). Returns one outcome per id; one failure does not stop the rest. */
    async function sweepExpired(store, sessionIds, opts) {
        var out = [];
        for (var i = 0; i < sessionIds.length; i++) {
            var id = sessionIds[i];
            try {
                var s = fromDocument(await store.get(id));
                if (!s) { out.push({ sessionId: id, swept: false, why: 'no session' }); continue; }
                if (s.submittedAt) { out.push({ sessionId: id, swept: false, why: 'submitted' }); continue; }
                if (!expired(s, opts)) { out.push({ sessionId: id, swept: false, why: 'in progress' }); continue; }
                var r = await submitExam(store, { sessionId: id, auto: true }, opts);
                out.push({ sessionId: id, swept: !r.alreadySubmitted, why: r.alreadySubmitted ? 'submitted' : 'auto-submitted' });
            } catch (e) { out.push({ sessionId: id, swept: false, why: 'error: ' + String(e && e.message || e).slice(0, 200) }); }
        }
        return out;
    }

    /* ── staff rescue: provision (2.5) ───────────────────────────────────────────────────────── */

    /* Replaces a failed install with the fabric baseline, before handover only. P1 is graded from
     * the PC as it stood (p1Snapshot, kept from the first rescue if there are two). */
    async function provision(store, args, opts) {
        var staff = args.staffUid;
        if (!validUid(staff)) { throw err('invalid-argument', 'Invalid staff identity.'); }
        return withSession(store, args.sessionId, opts, function (session) {
            var E = eng();
            if (session.handedOverAt) { throw err('failed-precondition', 'This PC has been handed over; it can no longer be provisioned.'); }
            if (!session.p1Snapshot) { session.p1Snapshot = JSON.parse(JSON.stringify(session.state)); }
            /* the same lab the sitting has (its seed), rebuilt as the fabric baseline */
            var fresh = E.CORE.generate(session.studentId, session.examId, { secret: opts.secret, seed: seedOf(session.lineage) });
            session.state = E.PROV.build(fresh);
            session.provisionedAt = nowMs(opts);
            session.provisionedBy = staff;
            return { provisioned: true, screen: E.GUI.currentScreen(session.state), remainingMs: remainingMs(session, opts) };
        });
    }

    /* ── resets (13.5 item 6) ────────────────────────────────────────────────────────────────── */

    /* Who may reset this sitting, decided on the sitting as read inside the reset (R6, 13.5 item 6):
     *   'self'  : the owner, not admin, while not submitted, not handed over, not expired, under the cap;
     *   'admin' : a platform admin (the admin rules then apply);
     *   false   : everyone else, including class handlers. */
    function mayReset(callerUid, targetUid, token, adminEmails, session, now) {
        if (!validUid(callerUid) || !validUid(targetUid)) { return false; }
        if (isAdmin(token, adminEmails)) { return 'admin'; }
        if (callerUid !== targetUid || !session) { return false; }
        if (session.submittedAt || session.handedOverAt) { return false; }
        if (!(Number(session.expiresAt) > Number(now))) { return false; }
        if (session.lineage.selfResets >= EXAMS.SELF_RESET_CAP) { return false; }
        return 'self';
    }

    /* Resets a sitting: archives the whole prior attempt and writes its replacement in one store
     * transaction (13.2 item 4: never "remove, then the next start creates"). The replacement is the
     * same lab (same seed), attempt + 1, with the lineage carried. Reset never creates a sitting.
     *   args: { sessionId, callerUid, targetUid, token, adminEmails, reason, evidence, freshClock, faultAt } */
    async function resetSession(store, args, opts) {
        opts = opts || {};
        var sid = args.sessionId;
        /* a caller with no claim to this sitting learns nothing and changes nothing (Mallory D6 F5):
         * only the owner or an admin gets past here, before the lookup and the expiry auto-submit */
        if (!(validUid(args.callerUid) && (args.callerUid === args.targetUid || isAdmin(args.token, args.adminEmails)))) {
            throw err('permission-denied', 'This sitting cannot be restarted.');
        }
        var cur = fromDocument(await store.get(sid));
        if (!cur) { throw err('not-found', 'No exam session to restart.'); }
        var t = nowMs(opts);
        /* an expired, unsubmitted sitting is submitted, not reset (13.5 item 6.6) */
        if (!cur.submittedAt && !(Number(cur.expiresAt) > t)) {
            await submitExam(store, { sessionId: sid, auto: true }, opts);
            throw err('failed-precondition', 'Time had expired; the exam was submitted automatically.');
        }
        /* through the exported binding, so the R6 mutation test (swap in netfinal's rule) can see it */
        var who = api.mayReset(args.callerUid, args.targetUid, args.token, args.adminEmails, cur, t);
        if (!who) { throw err('permission-denied', 'This sitting cannot be restarted.'); }
        var lineage = JSON.parse(JSON.stringify(cur.lineage));
        var clock = { startedAt: cur.startedAt, expiresAt: cur.expiresAt, durationMs: cur.durationMs };
        var meta = { resetAt: t, resetBy: args.callerUid, kind: who };
        if (who === 'admin') {
            if (EXAMS.PLATFORM_FAULT_CODES.indexOf(args.reason) < 0) { throw err('invalid-argument', 'Give a platform fault code as the reason.'); }
            if (typeof args.evidence !== 'string' || !args.evidence.trim() || args.evidence.length > 500) {
                throw err('invalid-argument', 'Give an evidence reference for the restart.');
            }
            if (lineage.adminResets >= EXAMS.ADMIN_RESET_CAP && !isOperator(args.token, args.adminEmails)) {
                throw err('permission-denied', 'A further restart of this sitting needs the operator.');
            }
            /* After handover or submit (13.19 item 1): a NEW sitting on a NEW lab (the seed index goes
             * up, so the fault, the values and the answers are all new) with a fresh clock. The
             * student has seen the old fault and its answers, so the same lab would be a retake. */
            if (cur.submittedAt || cur.handedOverAt) {
                /* the next seed whose fault variant differs from the voided lab's, so the retake is
                 * never the same fault with the same answers (Nancy R6 #3: about 1 in 4 otherwise) */
                var nextSeed = seedOf(lineage) + 1, E0 = eng();
                while (nextSeed <= 99 && E0.GRADE.buildAnswerKey(cur.studentId, cur.examId, { secret: opts.secret, seed: nextSeed }).variant === cur.answerKey.variant) { nextSeed++; }
                if (nextSeed > 99) { throw err('failed-precondition', 'This sitting has no further lab to deal.'); }
                lineage.seed = nextSeed;
                clock = { startedAt: t, expiresAt: t + cur.durationMs, durationMs: cur.durationMs };
                meta.newLab = true;
            } else if (args.freshClock === true) {
                var faultAt = Number(args.faultAt);
                if (!isFinite(faultAt) || faultAt < cur.startedAt || faultAt > t) { throw err('invalid-argument', 'faultAt must fall within the sitting.'); }
                /* Gives back the time left at the fault, never takes any (Nancy D6 #4): the new expiry
                 * is never before the old one. It is capped at the latest any sitting could end (the
                 * last new start plus the duration) plus the grace; the rehearsal at now + duration. */
                var left = Math.max(0, cur.expiresAt - faultAt);
                var w = EXAMS.windowFor(cur.examId);
                var grace = EXAMS.ADMIN_RESET_GRACE_MINUTES * 60000;
                var cap = w ? w.closesAt + cur.durationMs + grace : t + cur.durationMs;
                clock = { startedAt: cur.startedAt, expiresAt: Math.max(cur.expiresAt, Math.min(t + left, cap)), durationMs: cur.durationMs };
            }
            lineage.adminResets += 1;
            meta.reason = args.reason;
            meta.evidence = args.evidence.slice(0, 500);
            meta.freshClock = args.freshClock === true;
        } else {
            lineage.selfResets += 1;
        }
        /* penalties this attempt incurred survive into the next (13.5 item 6.4), but not onto a NEW
         * lab: that lab was voided for a platform fault (Nancy R6 #2) */
        var E = eng();
        var incurred = meta.newLab ? [] : E.GRADE.appliedPenalties(cur.state, cur.answerKey);
        if (meta.newLab) { lineage.penalties = []; }
        /* after a provision, the P1 penalties of the PC as it stood count too (Nancy D6 #5) */
        if (cur.p1Snapshot && !meta.newLab) { incurred = incurred.concat(E.GRADE.appliedPenalties(cur.p1Snapshot, cur.answerKey, 'P1')); }
        incurred.forEach(function (id) { if (lineage.penalties.indexOf(id) < 0) { lineage.penalties.push(id); } });
        lineage.resets.push({ at: t, by: args.callerUid, kind: who, reason: meta.reason || null });
        var next = newSession(cur.studentId, cur.examId, clock, opts.secret, cur.attempt + 1, lineage);
        next.rev = cur.rev + 1;
        var archiveId = sid + '__' + cur.attempt + '__' + t;
        var ok = await store.replaceIfRev(sid, toDocument(cur), cur.rev, archiveId, Object.assign(toDocument(cur), meta, { originalId: sid }), toDocument(next));
        if (!ok) { throw err('aborted', 'The exam session changed while restarting. Retry.'); }
        return { reset: true, kind: who, attempt: next.attempt, selfResetsLeft: Math.max(0, EXAMS.SELF_RESET_CAP - lineage.selfResets) };
    }

    /* ── staff views ─────────────────────────────────────────────────────────────────────────── */

    /* The gradebook entry for a submitted sitting (R7 shape). Credit only on a pass. */
    function gradebookEntry(session) {
        if (!session || !session.submittedAt || !session.report) { return null; }
        var E = eng(), rep = session.report, sr = E.GRADE.studentReport(rep);
        var pass = EXAMS.passed(rep.total, 100);
        return {
            sat: true, passed: pass, completed: pass,
            score: Math.round(rep.total * 100) / 100, total: sr.total, outOf: 100,
            phases: sr.phases, objectives: E.GRADE.objectiveTotals(rep),
            satAt: new Date(session.submittedAt).toISOString(), completedAt: pass ? new Date(session.submittedAt).toISOString() : null,
            duration: Math.max(0, Math.round(Number(rep.durationUsedMs || 0) / 1000)),
            flagged: !!(session.lineage.selfResets || session.lineage.adminResets),
            provisioned: !!session.provisionedAt, autoSubmitted: !!session.autoSubmitted,
            source: 'mdfinal'
        };
    }

    /* What staff see of one sitting: the full report, lineage and flags. Staff only (callable). */
    function instructorView(session, opts) {
        if (!session) { return null; }
        return {
            studentId: session.studentId, examId: session.examId, attempt: session.attempt,
            startedAt: session.startedAt, expiresAt: session.expiresAt, submittedAt: session.submittedAt,
            remainingMs: session.submittedAt ? 0 : remainingMs(session, opts),
            handedOverAt: session.handedOverAt, provisionedAt: session.provisionedAt, autoSubmitted: !!session.autoSubmitted,
            selfResets: session.lineage.selfResets, adminResets: session.lineage.adminResets, seed: seedOf(session.lineage),
            report: session.report, entry: gradebookEntry(session)
        };
    }

    /* What a class handler sees of one sitting (13.19 item 4): the staff view with the per-check
     * report replaced by its total and phase scores, so listing a student in a class cannot reveal
     * their per-check marks (Mallory D6 F1). */
    function handlerView(view) {
        if (!view) { return null; }
        var out = JSON.parse(JSON.stringify(view));
        if (out.report) {
            var sr = eng().GRADE.studentReport(out.report);
            out.report = { display: sr.total, phases: sr.phases, provisioned: !!out.report.provisioned };
        }
        return out;
    }

    /* The handler's CSV: totals only, one line per submitted sitting. */
    function totalsCsv(sessions) {
        var esc = function (v) { var t = String(v === undefined || v === null ? '' : v); return /[",\n]/.test(t) ? '"' + t.split('"').join('""') + '"' : t; };
        var rows = sessions.filter(function (s) { return s && s.submittedAt && s.report; }).map(function (s) {
            var e = gradebookEntry(s);
            var fl = [];
            if (s.provisionedAt) { fl.push('provisioned'); }
            if (s.autoSubmitted) { fl.push('autoSubmitted'); }
            if (s.lineage.selfResets) { fl.push('selfReset:' + s.lineage.selfResets); }
            if (s.lineage.adminResets) { fl.push('adminReset:' + s.lineage.adminResets); }
            return [s.studentId, e.score, e.passed ? 'pass' : 'not passed', fl.join(' ')].map(esc).join(',');
        });
        return ['studentId,total,result,flags'].concat(rows).join('\n');
    }

    /* The CSV the instructor grades from: one line per submitted sitting. */
    function resultsCsv(sessions) {
        var E = eng();
        return E.GRADE.toCsv(sessions.filter(function (s) { return s && s.submittedAt && s.report; }).map(function (s) {
            var flags = [];
            if (s.provisionedAt) { flags.push('provisioned'); }
            if (s.autoSubmitted) { flags.push('autoSubmitted'); }
            if (s.lineage.selfResets) { flags.push('selfReset:' + s.lineage.selfResets); }
            if (s.lineage.adminResets) { flags.push('adminReset:' + s.lineage.adminResets); }
            return { studentId: s.studentId, grade: s.report, flags: flags };
        }));
    }

    /* ── the in-memory store (tests) ─────────────────────────────────────────────────────────── */

    /* The same contract as the Firestore store in functions/index.js: stored documents (JSON strings
     * inside), copies on every read and write, compare-and-set through sameSitting. */
    function memoryStore() {
        var live = {}, archive = {}, control = {};
        var copy = function (v) { return v === null || v === undefined ? v : JSON.parse(JSON.stringify(v)); };
        return {
            get: async function (k) { return own(live, k) ? copy(live[k]) : null; },
            create: async function (k, doc) { if (own(live, k)) { return false; } live[k] = copy(doc); return true; },
            putIfRev: async function (k, doc, expectedRev) {
                if (!sameSitting(own(live, k) ? live[k] : null, doc, expectedRev)) { return false; }
                live[k] = copy(doc); return true;
            },
            replaceIfRev: async function (k, curDoc, expectedRev, archiveId, archiveDoc, nextDoc) {
                if (!sameSitting(own(live, k) ? live[k] : null, curDoc, expectedRev)) { return false; }
                archive[archiveId] = copy(archiveDoc); live[k] = copy(nextDoc); return true;
            },
            getControl: async function (examId) { return own(control, examId) ? copy(control[examId]) : { armed: false, allowUids: [] }; },
            putControl: async function (examId, doc) { control[examId] = copy(doc); return true; },
            archived: function () { return copy(archive); },
            raw: function () { return live; }
        };
    }
    function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

    var api = {
        startExam: startExam, runCommand: runCommand, renderWindow: renderWindow, runAction: runAction, saveAnswer: saveAnswer,
        handover: handover, submitExam: submitExam, sweepExpired: sweepExpired, provision: provision,
        resetSession: resetSession, mayReset: mayReset, isAdmin: isAdmin, isOperator: isOperator,
        gradebookEntry: gradebookEntry, instructorView: instructorView, handlerView: handlerView, resultsCsv: resultsCsv, totalsCsv: totalsCsv, examModeFlags: examModeFlags,
        toDocument: toDocument, fromDocument: fromDocument, documentBytes: documentBytes, sameSitting: sameSitting,
        sessionIdFor: sessionIdFor, validUid: validUid, remainingMs: remainingMs, memoryStore: memoryStore,
        WRITE_LIMIT: WRITE_LIMIT
    };
    module.exports = api;
})();
