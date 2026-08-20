/**
 * mission-gates.js — server-side evaluation of a mission's revealGate.
 *
 * TASKBOARD #306, proven by Mallory 2026-08-09. config-shared.js states the reveal gate is
 * "Checked SERVER-SIDE against captured evidence, never against a client progress object"
 * and cites scope criterion E1. A grep for revealGate across functions/ and _app/ returned
 * only the config declaring it. Nothing read it, server or client. A player could type a
 * flag and click Transmit on the first frame, having tested nothing, and be credited.
 *
 * That is an INTEGRITY gap rather than a leak: no flag value is exposed. But anyone holding a
 * flag from any out-of-band source (a screenshot, a prior cohort, a TA) got full credit
 * without ever touching the mechanic the box exists to teach.
 *
 * ── THE DESIGN PROBLEM, AND WHY THE OBVIOUS ANSWER IS THEATRE ────────────────────────────
 * The server cannot evaluate the gate unless it knows what the player established. The
 * tempting shortcut is to let the client post its trust ledger and check THAT. It is
 * worthless: a client that can be edited to skip the work can equally be edited to claim the
 * work. Verifying a self-reported conclusion verifies nothing.
 *
 * So the server keeps its OWN copy of each mission's evidence and their provenance axes, and
 * a client may only report an ACTION ("I compared ch-primary against ch-backup"). The server
 * re-derives the conclusion from its own data. A claim that two sources share an RF chain is
 * accepted only if, in the server's copy, they actually do.
 *
 * ── WHAT THIS DELIBERATELY DOES NOT CLAIM ────────────────────────────────────────────────
 * A determined player can still call the record endpoint directly with the correct pairs. To
 * do that they must KNOW which sources share a dependency, which is the entire learning
 * objective. The gate's job is to make credit require demonstrating the reasoning, not to
 * make it require using the UI. Those are different bars and only the first one is worth
 * defending. Anyone extending this should keep that distinction: reject claims that are
 * FALSE, not claims that arrived by an unusual route.
 *
 * Pure functions, no firebase-admin import, so the logic is unit-testable without emulators
 * and without network. The callable wiring lives in index.js.
 */
'use strict';

/** Evidence families. A corroborator only corroborates if it could have failed independently,
    so the gate can demand a specific family rather than "any second source". */
const FAMILIES = ['physical', 'platform', 'ground', 'offline'];

/**
 * Verify ONE claimed finding against the server's copy of the mission.
 *
 * @param {object} spec    the finding's definition from the server-side mission gate doc
 * @param {object} claim   { sources: string[] } as reported by the client
 * @param {object} sources map of sourceId -> { axes: {axisName: value}, family }
 * @returns {{ok: boolean, reason: string}}
 */
function verifyFinding(spec, claim, sources) {
    if (!spec || typeof spec !== 'object') return { ok: false, reason: 'unknown finding' };
    const claimed = Array.isArray(claim && claim.sources) ? claim.sources.slice() : [];
    if (!claimed.length) return { ok: false, reason: 'no sources named' };

    // Every named source must exist. An unknown id is a malformed or probing claim.
    for (const id of claimed) {
        if (!sources[id]) return { ok: false, reason: `unknown source: ${id}` };
    }

    const axis = spec.axis;
    const valueOf = id => (sources[id].axes || {})[axis];

    if (spec.type === 'shared-axis') {
        /* "These sources are NOT independent: they share <axis>." The player must name at
           least as many as the spec requires, and they must genuinely all share one value.
           Requiring the exact set would reject a player who found a larger true grouping. */
        const need = spec.minSources || (spec.sources ? spec.sources.length : 2);
        if (claimed.length < need) {
            return { ok: false, reason: `name at least ${need} sources that share ${axis}` };
        }
        const first = valueOf(claimed[0]);
        if (first === undefined) return { ok: false, reason: `sources carry no ${axis}` };
        const allShare = claimed.every(id => valueOf(id) === first);
        if (!allShare) return { ok: false, reason: `those sources do not all share ${axis}` };
        /* And the grouping must be the one the mission is about. Without this, naming any two
           incidentally-matching sources would satisfy a gate about a different dependency. */
        if (spec.value && first !== spec.value) {
            return { ok: false, reason: `that is a different ${axis}` };
        }
        /* Confirm WITHOUT echoing the value. recordMissionFinding returns this string to the
         * caller as `detail`, so anything named here is disclosed to anyone who can make one
         * successful claim. On qual-w1-lockout the shared sourceIp IS the box's flag, so the
         * old `all share ${axis}=${first}` handed the answer back in the success response —
         * proven live by an adversarial audit, one call, no corroborator, no second finding.
         * The disclosure guard on deliverFlag was never the only writer of that guarantee.
         *
         * The player loses nothing: they named these sources, so they can already read the
         * shared value in the box. Confirmation is the useful part, not the echo. Kept
         * value-free for EVERY box rather than gated per-box, because the next competition box
         * whose axis happens to equal its flag would otherwise reintroduce this silently.
         */
        return { ok: true, reason: `all ${claimed.length} named sources share ${axis}` };
    }

    if (spec.type === 'distinct-axis') {
        /* "This source COULD have failed independently: its <axis> differs from the others."
           Two ids exactly, because independence is a statement about a pair. */
        if (claimed.length !== 2) return { ok: false, reason: 'name exactly two sources' };
        const a = valueOf(claimed[0]), b = valueOf(claimed[1]);
        if (a === undefined || b === undefined) return { ok: false, reason: `sources carry no ${axis}` };
        if (a === b) return { ok: false, reason: `those two share ${axis}=${a}` };
        // Same rule as shared-axis above: confirm, do not echo. On this box the values are
        // collector names rather than the flag, so it was a lesser leak — but "lesser leak"
        // is not a property worth relying on when the next box's axes are unknown.
        return { ok: true, reason: `${axis} differs between the two named sources` };
    }

    return { ok: false, reason: `unsupported finding type: ${spec.type}` };
}

/**
 * Evaluate a mission's revealGate against a player's VERIFIED progress.
 *
 * `progress.findings` and `progress.corroborators` are written only by the server, after
 * verifyFinding accepted them. This function never sees a client claim.
 *
 * @returns {{satisfied: boolean, missing: string[], detail: string}}
 */
function evaluateGate(gate, progress, sources) {
    const missing = [];
    if (!gate || typeof gate !== 'object') {
        // No gate declared for this flag: nothing to enforce, and saying so plainly beats
        // failing open silently. Callers decide whether an ungated flag is acceptable.
        return { satisfied: true, missing: [], detail: 'no gate declared' };
    }

    const have = (progress && progress.findings) || {};
    const necessaries = Array.isArray(gate.necessaries) ? gate.necessaries : [];
    for (const n of necessaries) {
        if (!have[n]) missing.push(n);
    }

    /* The corroborator requirement is the part that makes this mission-shaped rather than a
       checklist: agreeing sources are not corroboration if they could all have failed
       together, so the gate demands N from a NAMED family. */
    const need = gate.corroboratorsRequired || 0;
    let got = 0;
    if (need > 0) {
        const fam = gate.corroboratorFamily;
        const held = (progress && progress.corroborators) || {};
        got = Object.keys(held).filter(id => {
            if (!held[id]) return false;
            const s = sources && sources[id];
            return !fam || (s && s.family === fam);
        }).length;
        if (got < need) {
            missing.push(`corroborator:${fam || 'any'}x${need - got}`);
        }
    }

    return {
        satisfied: missing.length === 0,
        missing,
        detail: missing.length === 0
            ? `all ${necessaries.length} necessaries established, ${got}/${need} corroborators`
            : `missing: ${missing.join(', ')}`
    };
}

/**
 * The message a player sees when the gate refuses.
 *
 * MUST NOT NAME WHAT IS MISSING. The missing necessaries ARE the answers: "you have not
 * established that three channels share one front end" hands over the finding the mission
 * exists to make you discover. It says how many remain and nothing else, which is enough to
 * tell an honest player they have work left and useless to someone fishing.
 */
function refusalMessage(result) {
    const n = result.missing.length;
    return 'This finding cannot be filed yet. Your trust ledger does not yet support it: '
         + `${n} ${n === 1 ? 'requirement is' : 'requirements are'} outstanding. `
         + 'Establish what the evidence can carry, then file.';
}

module.exports = { verifyFinding, evaluateGate, refusalMessage, FAMILIES };
