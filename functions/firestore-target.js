/**
 * Say out loud which Firestore a script is about to talk to.
 *
 * WHY THIS EXISTS
 *
 * On 2026-08-07 an agent verifying task #295 ran `push-quiz-keys.js` without
 * FIRESTORE_EMULATOR_HOST set and wrote two junk documents into PRODUCTION quiz_keys.
 * They caught it and disclosed it, but nothing in the tool's output would have told them
 * either way: it printed
 *
 *     Mode: LIVE (writing to Firestore)
 *
 * which is true against the emulator and against production, and distinguishes neither.
 * `admin.initializeApp({ projectId: 'hexworth-prime' })` reads as "production" in the
 * source, but the Admin SDK silently reroutes every call to FIRESTORE_EMULATOR_HOST when
 * that variable is set — so the project id in the code is not evidence of the target.
 *
 * The only thing that decides where the writes land is an environment variable the
 * operator cannot see from the output. This module prints it.
 *
 * It is a BANNER, not a guard. It stops nobody. That is deliberate: a confirmation prompt
 * here would be answered reflexively within a week, and these scripts are also run from
 * deploy chains where a prompt would hang. Making the target impossible to miss is the
 * cheap fix that addresses the actual failure, which was not recklessness but invisibility.
 *
 * Usage, immediately after admin.initializeApp():
 *
 *     const { announceTarget } = require('./firestore-target');
 *     announceTarget({ writing: !DRY_RUN });
 */

'use strict';

const PROJECT_ID = 'hexworth-prime';

/**
 * Work out where Firestore calls will actually go.
 * Returns { emulator: boolean, host: string|null, label: string }.
 */
function resolveTarget() {
    // FIREBASE_FIRESTORE_EMULATOR_ADDRESS is the older name; both are honoured by the SDK,
    // so a script that checked only one would report the wrong target for anyone using it.
    const host = process.env.FIRESTORE_EMULATOR_HOST
        || process.env.FIREBASE_FIRESTORE_EMULATOR_ADDRESS
        || null;
    return {
        emulator: Boolean(host),
        host,
        label: host ? `EMULATOR at ${host}` : `PRODUCTION (${PROJECT_ID})`,
    };
}

/**
 * Print the target. `writing` controls the volume: a read-only tool states its target on
 * one line, a tool about to write to production gets a block that cannot be skimmed past.
 */
function announceTarget({ writing = false } = {}) {
    const t = resolveTarget();

    if (!writing) {
        console.log(`Target: ${t.label}`);
        return t;
    }

    if (t.emulator) {
        console.log(`Target: ${t.label}  [writes are local, nothing reaches production]`);
        return t;
    }

    // Production + writing. This is the case that cost us two junk documents.
    console.log('');
    console.log('  ####################################################################');
    console.log('  #                                                                  #');
    console.log(`  #   WRITING TO PRODUCTION FIRESTORE: ${PROJECT_ID}              #`);
    console.log('  #                                                                  #');
    console.log('  #   FIRESTORE_EMULATOR_HOST is NOT set. Every write below lands    #');
    console.log('  #   on the live database that real students are using right now.   #');
    console.log('  #                                                                  #');
    console.log('  #   For the emulator instead:                                      #');
    console.log('  #     export FIRESTORE_EMULATOR_HOST=localhost:8080                #');
    console.log('  #                                                                  #');
    console.log('  ####################################################################');
    console.log('');
    return t;
}

module.exports = { announceTarget, resolveTarget, PROJECT_ID };
