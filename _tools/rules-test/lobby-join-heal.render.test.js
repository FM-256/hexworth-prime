#!/usr/bin/env node
'use strict';
/**
 * lobby-join-heal.render.test.js
 *
 * @catalog what   Drives the SHIPPED window.joinTeam from tournament-lobby.html to prove it reports the
 *                 team the server actually seated you on, not the card you clicked
 * @catalog run    node _tools/rules-test/lobby-join-heal.render.test.js
 * @catalog status TOOL
 *
 * WHY IT EXISTS. ctfJoinTeam can seat you somewhere other than the team you clicked: a roster lock
 * naming another team, with your membership missing, is repaired and the response carries
 * `healed: true` plus the team you actually belong to. Chris found that nothing consumed those fields
 * -- the lobby set myTeamId to the REQUESTED id and toasted "Joined <clicked team>", so the toast was
 * simply wrong for that case and my commit claimed a capability that did not exist. A reload corrected
 * the view a moment later, which is exactly why it could ship unnoticed.
 *
 * The refusal path matters for the same reason: this page derives "your team" from members[] and CANNOT
 * read rosterLocks (rules deny it to every client), so "leave that team first" may name a team the page
 * does not know is yours and draws no Leave button for. Adopting `details.teamId` is what makes the
 * instruction actionable.
 *
 * Extracted from the shipped page rather than reimplemented, so it cannot pass while the lobby does
 * something else. A shim is not a browser: element ids and CSS are not covered here, only the logic.
 */
const path = require('path');
const { extractShipped } = require('./lib/extract-shipped');

const PAGE = process.env.LOBBY_PATH || path.join(__dirname, '..', '..', '_app', 'arena', 'tournament-lobby.html');

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

/* One harness per case. A shared one let an earlier case's myTeamId decide a later one. */
function harness(callableResult, callableError) {
    const state = { toasts: [], reloads: 0, myTeamId: null, called: null };
    const teamsData = [
        { id: 'team-a', name: 'Alpha', members: [] },
        { id: 'team-b', name: 'Bravo', members: [] },
    ];
    const sandbox = {
        currentUser: { uid: 'u1' },
        myTeamId: null,
        teamsData,
        tournamentData: { name: 'T', maxTeamSize: 4, hasJoinCode: false },
        tournamentId: 't1',
        toast: (m, k) => state.toasts.push(`${k}:${m}`),
        loadTournament: async () => { state.reloads++; },
        firebase: {
            functions: () => ({
                httpsCallable: () => async (payload) => {
                    state.called = payload;
                    if (callableError) throw callableError;
                    return { data: callableResult };
                },
            }),
        },
        window: {},
    };
    /* `myTeamId` is a page-level binding the handler assigns, so it must live in the same scope the
     * extracted function closes over -- not on a shim object it would only read. */
    const fn = new Function('sandbox', `
        with (sandbox) {
            ${extractShipped(PAGE, 'joinTeam')}
            return { run: window.joinTeam, peek: () => myTeamId };
        }
    `)(sandbox);
    return { fn, state, sandbox };
}

(async () => {
    console.log('\n== lobby joinTeam: report the team the SERVER seated you on ==');

    /* 1. The healed case, which is the one that used to lie. */
    {
        const { fn, state } = harness({ ok: true, teamId: 'team-a', healed: true, requestedTeamId: 'team-b' });
        await fn.run('team-b');
        chk('healed: myTeamId becomes the team the server returned, not the one clicked',
            fn.peek() === 'team-a', `myTeamId=${fn.peek()}`);
        chk('healed: the toast names the ACTUAL team and explains why',
            state.toasts.length === 1 && /Alpha/.test(state.toasts[0]) && /already registered/i.test(state.toasts[0])
            && !/Joined Bravo/.test(state.toasts[0]), state.toasts.join(' | '));
        chk('healed: still reloads so the rendered roster catches up', state.reloads === 1);
    }

    /* 2. The ordinary join must be untouched by all of this. */
    {
        const { fn, state } = harness({ ok: true, teamId: 'team-b' });
        await fn.run('team-b');
        chk('CONTROL: an ordinary join still says "Joined <team>" and sets that team',
            fn.peek() === 'team-b' && /Joined Bravo/.test(state.toasts[0]), `${fn.peek()} ${state.toasts[0]}`);
    }

    /* 3. A server that returns no teamId at all must not blank the page's state. */
    {
        const { fn, state } = harness({ ok: true });
        await fn.run('team-b');
        chk('CONTROL: a response with no teamId falls back to the requested team',
            fn.peek() === 'team-b' && /Joined Bravo/.test(state.toasts[0]), `${fn.peek()}`);
    }

    /* 4. The refusal that names a team the page does not think is yours. */
    {
        const err = new Error('You are already on Alpha in this tournament. Leave it first.');
        err.details = { teamId: 'team-a', teamName: 'Alpha' };
        const { fn, state } = harness(null, err);
        await fn.run('team-b');
        chk('refused with details: adopts that team so the next render can draw Leave',
            fn.peek() === 'team-a', `myTeamId=${fn.peek()}`);
        chk('refused with details: shows the server message and reloads',
            /Alpha/.test(state.toasts[0]) && state.reloads === 1, `${state.toasts[0]} reloads=${state.reloads}`);
    }

    /* 5. A refusal WITHOUT details must not invent a team. */
    {
        const err = new Error('Team is full.');
        const { fn, state } = harness(null, err);
        await fn.run('team-b');
        chk('refused with no details: myTeamId is left alone and nothing is reloaded',
            fn.peek() === null && state.reloads === 0 && /full/i.test(state.toasts[0]),
            `myTeamId=${fn.peek()} reloads=${state.reloads}`);
    }

    /* 6. details naming a team this page has never heard of must be ignored, not trusted. */
    {
        const err = new Error('You are already on Ghost in this tournament. Leave it first.');
        err.details = { teamId: 'team-ghost', teamName: 'Ghost' };
        const { fn, state } = harness(null, err);
        await fn.run('team-b');
        chk('refused with an UNKNOWN details.teamId: not adopted, no reload',
            fn.peek() === null && state.reloads === 0, `myTeamId=${fn.peek()} reloads=${state.reloads}`);
    }

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('HARNESS ERROR', e.message); process.exit(1); });
