/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-grade.js — stage 6: the answer key, the grader, the report, the CSV.
 *
 * Spec section 8 (scoring and grading rules) and section 10 extension 10: "generate(seed) returns
 * { initialState, answerKey }; grade(answers, events, finalState, answerKey) returns the report."
 *
 * SERVER-ONLY. This file IS the answer key and the grader; `answerKey` is already on the leak
 * scanner's forbidden list.
 *
 * THREE GRADING BASES, because the questions genuinely have three:
 *   EXAM START   questions 1-26, against `answerKey` -- those answers describe the BROKEN network
 *                and change as the student repairs it, so grading them against final state would
 *                mark the honest answer wrong (spec section 8, and Q2 under S4A is its example).
 *   FINAL STATE  questions 27-38, against fixed() and collateralDamage().
 *   THE EVENT LOG questions 39-42, which require the proof to have been run AFTER the fix landed.
 *
 * WHAT THIS FILE WILL NOT PRETEND TO DO. Question 45 is prose and the spec gives it an instructor
 * rubric; the "2 of 6 when the change request names the correct root cause" rule also turns on
 * prose. Both are reported as PENDING with the evidence an instructor needs, never auto-scored.
 * Guessing at a narrative's quality with keyword matching would produce a number that looks like a
 * grade and is not one, which is worse than reporting the work as unmarked.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var TOPO = require('./netfinal-topology.js');
    var CORE = require('./netfinal-core.js');
    var FAULTS = require('./netfinal-faults.js');
    var QUESTIONS = require('./netfinal-questions.js');
    var NORM = QUESTIONS.NORM, sameAnswer = QUESTIONS.sameAnswer;

    /* ═══ THE ANSWER KEY, BUILT AT EXAM START ═════════════════════════════════════════════════════ */
    function deepFreeze(o) {
        if (o && typeof o === 'object') {
            Object.keys(o).forEach(function (k) { deepFreeze(o[k]); });
            Object.freeze(o);
        }
        return o;
    }

    /* Called immediately after FAULTS.applyAll, which is the moment `captureBaseline` also runs and
     * for the same reason: this is the lab the student is handed.
     *
     * EVERY VALUE IS CLONED AND FROZEN. Chris caught this before it was written: a key holding a
     * live reference into state -- `state.endpoints[i]` rather than a copy of its address -- would
     * be silently rewritten by a later repair, restore or lease re-resolution, and the stored
     * "correct answer" would change under the grader. Freezing turns a future accidental mutation
     * into a throw instead of a wrong grade. */
    function buildAnswerKey(state) {
        var key = { builtAtEvent: (state.events || []).length, questions: {} };
        /* Which ports have an endpoint on more than one switch IN THIS LAB. Spec section 8 allows the
         * switch name to be omitted "when only one switch has that port active with that endpoint" --
         * a condition about the lab, so it is resolved here, at the same moment and from the same
         * state as the answer it qualifies, and frozen alongside it. Deciding it at grading time
         * would read live state to qualify a frozen key, which is the bug class this key exists to
         * avoid. */
        var ambiguous = QUESTIONS.ambiguousPorts(state);
        QUESTIONS.QUESTIONS.forEach(function (q) {
            var resolved = QUESTIONS.resolve(state, q);
            var entry = {
                id: q.id, n: q.n, kind: resolved.kind, norm: resolved.norm,
                points: q.points, tag: q.tag, phase: q.phase, slot: q.slot || null,
                parts: resolved.parts, ticket: resolved.ticket, proof: resolved.proof,
                selection: resolved.selection, rubric: resolved.rubric
            };
            /* A QUESTION ABOUT A SLOT THAT IS NOT IN THIS LAB HAS NO ANSWER, and must not throw.
             * Every lab the generator produces carries all twelve slots, so this never fires in an
             * exam -- but buildAnswerKey crashed outright on a lab built with a subset, which is how
             * the test harness and any future instructor preview construct one. A question with no
             * answer is recorded as unanswerable rather than silently scored. */
            if (q.slot && !state.faults.some(function (f) { return f.slot === q.slot && f.active; })) {
                entry.answer = undefined;
                entry.unavailable = 'slot ' + q.slot + ' is not active in this lab';
                key.questions[q.id] = entry;
                return;
            }
            if (typeof q.answer === 'function') {
                /* JSON round-trip: a clone AND a guarantee the value is plain data, so nothing a
                 * grader reads can be a getter or a reference. */
                entry.answer = JSON.parse(JSON.stringify(q.answer(state)));
            }
            /* An interface answer on an AMBIGUOUS port must name its switch. Without this, a bare
             * "Fa0/5" matched either switch and "which switch" stopped being graded at all on the
             * questions whose whole point it is.
             *
             * THIS CHECKED ONLY A TOP-LEVEL STRING ANSWER, which covered Q5, Q8 and Q17 and MISSED
             * Q18 -- `parts: ['iface','select']`, so its norm is 'text' and its answer is an object,
             * and the condition could never fire. Q18 is 4 points, slot S1, in every student's lab,
             * and a bare port on an ambiguous port scored full marks there while the three questions
             * beside it were correctly strict. Fixed one shape of a defect and left the shape next to
             * it, which is a mistake I have made before on exactly this kind of edit.
             *
             * So: collect EVERY candidate interface answer this entry could be graded against -- the
             * top-level value, each part, and each alternative inside an array of accepted answers --
             * and require the switch if any of them names an ambiguous port. */
            var ifaceCandidates = [];
            var collectIface = function (v) {
                if (typeof v === 'string') { ifaceCandidates.push(v); return; }
                if (Array.isArray(v)) { v.forEach(collectIface); }
            };
            if (entry.norm === 'iface') { collectIface(entry.answer); }
            if (entry.parts && entry.parts.indexOf('iface') >= 0
                && entry.answer && typeof entry.answer === 'object' && !Array.isArray(entry.answer)) {
                collectIface(entry.answer.iface);
            }
            if (ifaceCandidates.some(function (v) {
                var parsed = QUESTIONS.NORM.iface(v);
                return !!(parsed && parsed.iface && ambiguous[parsed.iface]);
            })) {
                entry.requireSw = true;
            }
            key.questions[q.id] = entry;
        });
        /* The catalog layer per ticket, which Q43 compares against. Recorded here rather than looked
         * up at grading time because a restore can deactivate nothing but the FAULT list is what
         * carries the layer, and the key must survive anything the student does. */
        key.ticketLayers = {};
        state.faults.forEach(function (f) {
            if (f.ticketId) { key.ticketLayers[f.ticketId] = f.layer; }
        });
        return deepFreeze(key);
    }

    /* ═══ GRADING ONE TYPED ANSWER ════════════════════════════════════════════════════════════════ */
    /* Spec section 8: "Two-part question, one part correct: half." */
    function gradeTyped(entry, given) {
        if (given === undefined || given === null || given === '') {
            return { earned: 0, of: entry.points, note: 'unanswered' };
        }
        if (entry.parts && entry.parts.length) {
            var got = 0;
            var detail = {};
            entry.parts.forEach(function (part) {
                var want = entry.answer ? entry.answer[part] : undefined;
                var mine = (given && typeof given === 'object') ? given[part] : undefined;
                /* A single string answering a two-part question is accepted and matched against
                 * both parts: students write "10.84.10.40/24", not a JSON object. */
                if (mine === undefined && typeof given === 'string') { mine = given; }
                var kind = ['ipv4', 'prefix', 'mac', 'iface', 'range', 'vlanSet', 'aclRef', 'integer', 'select']
                    .indexOf(part) >= 0 ? part : (entry.norm || 'text');
                var popts = (kind === 'iface' && entry.requireSw) ? { require: ['sw'] } : undefined;
                var ok = Array.isArray(want)
                    ? want.some(function (w) { return sameAnswer(kind, mine, w, popts); })
                    : sameAnswer(kind, mine, want, popts);
                detail[part] = ok;
                if (ok) { got++; }
            });
            var frac = got / entry.parts.length;
            return { earned: Math.round(entry.points * frac * 100) / 100, of: entry.points,
                     note: got + ' of ' + entry.parts.length + ' parts', detail: detail };
        }
        var want2 = entry.answer;
        var opts2 = ((entry.norm === 'iface') && entry.requireSw) ? { require: ['sw'] } : undefined;
        var ok2 = Array.isArray(want2)
            ? (NORM.multi(given) !== null && JSON.stringify(NORM.multi(given)) === JSON.stringify(NORM.multi(want2)))
              || want2.some(function (w) { return sameAnswer(entry.norm || 'text', given, w, opts2); })
            : sameAnswer(entry.norm || 'text', given, want2, opts2);
        if (ok2) { return { earned: entry.points, of: entry.points, note: 'correct' }; }

        /* ── AN ACL REFERENCE IS A TWO-PART ANSWER, SO IT SCORES LIKE ONE ─────────────────────────
         * Spec section 8: "Two-part question, one part correct: half." Q24 asks for "the ACL name and
         * the sequence number", which is two parts in one field -- and every other question of that
         * shape in the bank (Q1, Q9, Q16B, Q18, Q21B, Q22A, Q23B, Q25A) is declared with `parts` and
         * gets half credit. Q24 is not, so it fell to the single-value branch above.
         *
         * That made it the only member of the family graded all-or-nothing, and it became so BY
         * ACCIDENT: requiring both aclRef fields (the fix for an answer that named the wrong ACL and
         * scored full marks) turned a tolerant comparison into a binary one. Nobody decided that.
         * This is the decision, written where the behaviour is: the name and the sequence are worth
         * half each, which is what the spec's table says and what the eight sibling questions do.
         * Declaring `parts` on Q24 instead would mean inventing part names that are not normalizer
         * kinds, so the rule lives here rather than distorting the question bank to reach it. */
        if (entry.norm === 'aclRef' && !Array.isArray(want2)) {
            var mine = NORM.aclRef(given), theirs = NORM.aclRef(want2);
            if (mine && theirs) {
                var nameOk = theirs.name !== null && mine.name !== null && mine.name === theirs.name;
                var seqOk = theirs.seq !== null && mine.seq !== null && mine.seq === theirs.seq;
                if (nameOk !== seqOk) {
                    return { earned: Math.round(entry.points / 2 * 100) / 100, of: entry.points,
                             note: '1 of 2 parts: ' + (nameOk ? 'ACL name right, sequence wrong'
                                                             : 'sequence right, ACL name wrong') };
                }
            }
        }
        return { earned: 0, of: entry.points, note: 'incorrect' };
    }

    /* ═══ GRADING A FIX ═══════════════════════════════════════════════════════════════════════════
     * Spec section 8's partial-credit table, in its own words:
     *   fix passes, change request filed BEFORE the change ........ full
     *   fix passes, no change request or one filed after .......... 3 of 6
     *   fix passes but breaks an invariant ........................ 0, flagged for instructor review
     *   fix does not pass, CR names correct root cause and layer .. 2 of 6
     *   verify task run before the fix, or the fix later undone .... 0 */
    function gradeFix(state, entry, ctx) {
        var fault = state.faults.filter(function (f) { return f.ticketId === entry.ticket; })[0];
        if (!fault) { return { earned: 0, of: entry.points, note: 'no such ticket' }; }
        var passes = ctx.fixedMap[fault.id] === true;
        /* Collateral damage is scoped to THIS fix only in the sense that the spec scores a damaging
         * fix at zero; damage is reported whole, because attributing it to one of twelve fixes would
         * be a guess. Any damage zeroes every fix and flags the paper, which is the honest reading of
         * "in production that change would cause a new outage". */
        if (ctx.damage.length) {
            return { earned: 0, of: entry.points, flagged: true,
                     note: 'collateral damage: ' + ctx.damage.map(function (d) { return d.id; }).join(', ') };
        }
        if (!passes) {
            /* "the fix later undone" and "never fixed" are the same zero, but the report should say
             * which, because one is a student who nearly had it. */
            if (fault.undone || fault.undoneCount) {
                return { earned: 0, of: entry.points, note: 'fixed and then undone' };
            }
            var cr = (state.changeRequests || []).filter(function (c) { return c.ticket === entry.ticket; })[0];
            if (cr && String(cr.layer) === String(entry.layerForTicket)) {
                /* The layer matches; the root cause is prose and is NOT auto-scored. 2 of 6 is the
                 * spec's award for naming both, so it is offered as PENDING for an instructor to
                 * confirm rather than granted on a keyword match. */
                return { earned: 0, of: entry.points, pending: 2,
                         note: 'not fixed; change request layer is correct — award 2 of 6 if the stated root cause is also correct',
                         rootCause: cr.rootCause };
            }
            return { earned: 0, of: entry.points, note: 'not fixed' };
        }
        var cr2 = (state.changeRequests || []).filter(function (c) { return c.ticket === entry.ticket; })[0];
        var before = cr2 && typeof fault.fixedAtEvent === 'number' && cr2.atEvent < fault.fixedAtEvent;
        return before
            ? { earned: entry.points, of: entry.points, note: 'fixed, change request filed before the change' }
            : { earned: Math.round(entry.points / 2), of: entry.points,
                note: cr2 ? 'fixed, but the change request was filed after the change' : 'fixed, no change request' };
    }

    /* ═══ GRADING A VERIFY SEQUENCE ═══════════════════════════════════════════════════════════════ */
    function gradeSequence(state, entry, ctx) {
        var proof = entry.proof;
        if (!proof) { return { earned: 0, of: entry.points, note: 'no proof defined' }; }
        var fault = entry.slot
            ? state.faults.filter(function (f) { return f.slot === entry.slot; })[0] : null;
        var fixedAt = fault && typeof fault.fixedAtEvent === 'number' ? fault.fixedAtEvent : null;
        if (fixedAt === null) {
            return { earned: 0, of: entry.points, note: 'the fix it verifies does not pass, so there is nothing to verify' };
        }
        var re = new RegExp(proof.match.source || proof.match, 'i');
        var events = state.events || [];

        /* TWO PASSES, BECAUSE ORDER IS THE WHOLE POINT. One pass set `prereq` for any matching event
         * after the fix -- including one that ran AFTER the proof. Q41A's prescribed sequence is
         * `arp -d *`, ping the gateway, THEN `arp -a`: clearing the cache is what makes the table a
         * measurement rather than a memory, so clearing it after reading it proves nothing and must
         * not score as if it did. The prerequisite is now required to fall strictly between the fix
         * and the proof. */
        var hit = null;
        events.forEach(function (e, i) {
            if (hit !== null) { return; }
            var onRight = !proof.on || proof.on.indexOf(e.actor) >= 0;
            if (onRight && re.test(e.detail) && i > fixedAt) { hit = i; }
        });
        var prereq = !proof.requires;
        if (proof.requires && hit !== null) {
            var preRe = new RegExp(proof.requires.source || proof.requires, 'i');
            prereq = events.some(function (e, i) {
                return i > fixedAt && i < hit && preRe.test(e.detail);
            });
        }
        if (hit === null) {
            /* Spec: "Verify task run before the fix ... 0". Said explicitly, because a student who
             * ran the command early and never again should know why it scored nothing. */
            var ranEarly = events.some(function (e, i) {
                return i < fixedAt && re.test(e.detail) && (!proof.on || proof.on.indexOf(e.actor) >= 0);
            });
            return { earned: 0, of: entry.points,
                     note: ranEarly ? 'the proof was run BEFORE the fix, which the spec scores zero'
                                    : 'the proof was never run: ' + proof.why };
        }
        if (!prereq) {
            return { earned: Math.round(entry.points / 2), of: entry.points,
                     note: 'proof run after the fix, but its prerequisite step did not run before it' };
        }
        return { earned: entry.points, of: entry.points, note: 'proof run after the fix, at event ' + hit };
    }

    /* ═══ GRADING THE INCIDENT LOG (43, 44, 45) ═══════════════════════════════════════════════════ */
    function gradeIncidentLayers(state, entry, ctx) {
        var log = state.incidentLog || [];
        var total = Object.keys(ctx.key.ticketLayers).length || 12;
        var right = 0, detail = [];
        Object.keys(ctx.key.ticketLayers).forEach(function (tid) {
            var e = log.filter(function (x) { return x.ticket === tid; })[0];
            var want = ctx.key.ticketLayers[tid];
            if (!e) { detail.push({ ticket: tid, got: null, want: want, ok: false }); return; }
            /* A 2/3 slot accepts either, per spec Q43. The catalog stores 2.5 for those. */
            var ok = (want === 2.5)
                ? (String(e.layer) === '2' || String(e.layer) === '3')
                : String(e.layer) === String(want);
            /* 3.5 is the spec's "3/4" family and accepts either, for the same reason. */
            if (!ok && want === 3.5) { ok = (String(e.layer) === '3' || String(e.layer) === '4'); }
            if (ok) { right++; }
            detail.push({ ticket: tid, got: e.layer, want: want, ok: ok });
        });
        return { earned: Math.round(entry.points * (right / total) * 100) / 100, of: entry.points,
                 note: right + ' of ' + total + ' layers correct', detail: detail };
    }

    function gradeIncidentEvidence(state, entry, ctx) {
        var log = state.incidentLog || [];
        var total = Object.keys(ctx.key.ticketLayers).length || 12;
        var right = 0, detail = [];
        /* THE CLAIM MUST NOT CORROBORATE ITSELF. Every GUI action is logged with its parameters, so
         * the incident-log submission event CONTAINS the evidence text the student just typed --
         * which meant any claim matched the event that recorded it, and Q44 awarded full marks to
         * anyone who wrote anything in the field. Circular, and caught only because the test
         * asserted the NEGATIVE case: a claim with nothing behind it must earn nothing.
         *
         * Corroboration therefore reads only what the student DID: typed commands, and GUI actions
         * other than writing in the log itself. */
        var events = (state.events || []).filter(function (e) {
            if (e.kind === 'command') { return true; }
            return e.kind === 'gui' && e.actor !== 'incident-log' && e.actor !== 'change-requests';
        }).map(function (e) { return String(e.detail || ''); });
        Object.keys(ctx.key.ticketLayers).forEach(function (tid) {
            var e = log.filter(function (x) { return x.ticket === tid; })[0];
            if (!e || !e.verification && !e.fix) { detail.push({ ticket: tid, ok: false, why: 'no entry' }); return; }
            var claimed = String(e.verification || '') + ' ' + String(e.fix || '');
            /* The claim must correspond to something the student ACTUALLY RAN. Matched by the
             * distinctive tokens in the claim rather than by substring, so "show interfaces trunk"
             * matches an event reading "sh int trunk". */
            var tokens = claimed.toLowerCase().match(/[a-z][a-z0-9/._-]{2,}/g) || [];
            var strong = tokens.filter(function (t) {
                return ['the', 'and', 'for', 'with', 'that', 'this', 'was', 'then', 'after'].indexOf(t) < 0;
            });
            var used = strong.some(function (t) {
                return events.some(function (ev) { return ev.toLowerCase().indexOf(t) >= 0; });
            });
            if (used) { right++; }
            detail.push({ ticket: tid, ok: used, claimed: claimed.trim().slice(0, 80) });
        });
        return { earned: Math.round(entry.points * (right / total) * 100) / 100, of: entry.points,
                 note: right + ' of ' + total + ' evidence claims corroborated by the event log', detail: detail };
    }

    function gradeNarratives(state, entry, ctx) {
        var picked = entry.selection || [];
        var log = state.incidentLog || [];
        return {
            earned: 0, of: entry.points, pending: entry.points,
            note: 'instructor-marked, 3 points per narrative',
            rubric: entry.rubric,
            items: picked.map(function (tid) {
                var e = log.filter(function (x) { return x.ticket === tid; })[0];
                return { ticket: tid, narrative: e ? (e.rootCause || '') : null,
                         submitted: !!e, catalogLayer: ctx.key.ticketLayers[tid] };
            })
        };
    }

    /* ═══ THE REPORT ══════════════════════════════════════════════════════════════════════════════ */
    function grade(state, answerKey) {
        var ctx = {
            key: answerKey,
            fixedMap: FAULTS.fixedMap(state),
            damage: FAULTS.collateralDamage(state)
        };
        var answers = state.answers || {};
        var rows = [];
        Object.keys(answerKey.questions).sort(function (a, b) {
            return answerKey.questions[a].n - answerKey.questions[b].n;
        }).forEach(function (qid) {
            var entry = answerKey.questions[qid];
            var given = answers[qid] ? answers[qid].value : undefined;
            var res;
            if (entry.n === 43) { res = gradeIncidentLayers(state, entry, ctx); }
            else if (entry.n === 44) { res = gradeIncidentEvidence(state, entry, ctx); }
            else if (entry.n === 45) { res = gradeNarratives(state, entry, ctx); }
            else if (entry.kind === 'state') {
                var withLayer = Object.assign({}, entry, { layerForTicket: ctx.key.ticketLayers[entry.ticket] });
                res = gradeFix(state, withLayer, ctx);
            } else if (entry.kind === 'sequence') { res = gradeSequence(state, entry, ctx); }
            else { res = gradeTyped(entry, given); }
            rows.push(Object.assign({ id: qid, n: entry.n, phase: entry.phase, tag: entry.tag,
                                      slot: entry.slot, points: entry.points }, res));
        });

        var sum = function (f) {
            return Math.round(rows.filter(f).reduce(function (a, r) { return a + r.earned; }, 0) * 100) / 100;
        };
        var sumOf = function (f) { return rows.filter(f).reduce(function (a, r) { return a + r.of; }, 0); };
        var pending = Math.round(rows.reduce(function (a, r) { return a + (r.pending || 0); }, 0) * 100) / 100;

        var perSlot = {};
        rows.forEach(function (r) {
            if (!r.slot) { return; }
            perSlot[r.slot] = perSlot[r.slot] || { earned: 0, of: 0 };
            perSlot[r.slot].earned = Math.round((perSlot[r.slot].earned + r.earned) * 100) / 100;
            perSlot[r.slot].of += r.of;
        });

        return {
            studentId: state.meta.studentId, examId: state.meta.examId,
            total: sum(function () { return true; }), outOf: sumOf(function () { return true; }),
            pendingInstructorMarks: pending,
            flagged: rows.some(function (r) { return r.flagged; }),
            collateralDamage: ctx.damage.map(function (d) { return { id: d.id, detail: d.detail, why: d.why }; }),
            subtotals: {
                practical: { earned: sum(function (r) { return r.tag === 'practical'; }), of: sumOf(function (r) { return r.tag === 'practical'; }) },
                reasoning: { earned: sum(function (r) { return r.tag === 'reasoning'; }), of: sumOf(function (r) { return r.tag === 'reasoning'; }) }
            },
            phases: QUESTIONS.PHASES.reduce(function (acc, p) {
                acc[p] = { earned: sum(function (r) { return r.phase === p; }), of: sumOf(function (r) { return r.phase === p; }) };
                return acc;
            }, {}),
            perSlot: perSlot,
            questions: rows
        };
    }

    /* ═══ CSV, for the LMS ════════════════════════════════════════════════════════════════════════ */
    function toCsv(report) {
        var esc = function (v) {
            var s = v === null || v === undefined ? '' : String(v);
            return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        var lines = ['student,exam,question,phase,tag,slot,earned,of,pending,note'];
        report.questions.forEach(function (r) {
            lines.push([report.studentId, report.examId, r.n, r.phase, r.tag, r.slot || '',
                        r.earned, r.of, r.pending || 0, r.note].map(esc).join(','));
        });
        lines.push([report.studentId, report.examId, 'TOTAL', '', '', '',
                    report.total, report.outOf, report.pendingInstructorMarks,
                    report.flagged ? 'FLAGGED: collateral damage' : ''].map(esc).join(','));
        return lines.join('\n');
    }

    module.exports = { buildAnswerKey: buildAnswerKey, grade: grade, toCsv: toCsv,
                       gradeTyped: gradeTyped, gradeFix: gradeFix, gradeSequence: gradeSequence };
})();
