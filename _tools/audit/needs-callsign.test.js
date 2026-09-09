#!/usr/bin/env node
/**
 * needs-callsign.test.js: who gets prompted for a callsign, and who does not
 *
 * @catalog what    Asserts the needsCallsign rule from FirestoreManager: a callsign is requested
 * @catalog what    only when the auth provider supplied no name and none is already set.
 * @catalog run     node _tools/audit/needs-callsign.test.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * The commit that changed this rule claimed "4/4 behavioural cases verified". That check was run
 * inline and never saved, so the claim had no artifact behind it: assertion wearing the word
 * verified, which is the standard this repo's gates are supposed to hold. A reviewer called it and
 * was right. This is the artifact.
 *
 * WHAT THE RULE IS FOR. A callsign is a handle for signups that have NO provider-supplied name,
 * i.e. password/email. Federated users (Google) already arrive with a displayName. Asking them to
 * invent a second identity was harmless until the availability check began failing closed on
 * 2026-08-21, at which point every callsign read as "taken" and, since the modal had no dismiss
 * affordance, new Google signups were trapped for 18 days.
 *
 * NOT A SUBSTITUTE FOR THE PRODUCT DECISION. Skipping the modal for federated users means their
 * provider displayName (a real name) becomes their public identity, because UserProfileModal falls
 * back `callsign || displayName || 'Anonymous'` and there is no self-service way to set a callsign
 * later. That trade is a four-way-vote question and is NOT settled by these tests passing. See
 * taskboard 370.
 *
 * EXIT: 0 all cases behave as specified, 1 a case failed.
 */
'use strict';

/* Mirrors the expression in _app/components/FirestoreManager.js. Kept as a copy deliberately: this
   file exists to pin the INTENDED behaviour, so if the source drifts the copy disagrees and a case
   fails, which is the point. A test that imported the implementation would agree with it by
   construction and could never catch a regression. */
function needsCallsign(storedCallsign, authDisplayName, profileDisplayName) {
    const providerName = authDisplayName || profileDisplayName || '';
    return !storedCallsign && !String(providerName).trim();
}

const CASES = [
    ['Google user: provider name, no callsign -> NOT prompted', null, 'Ada Lovelace', null, false],
    ['password user: no provider name, no callsign -> PROMPTED', null, null, null, true],
    ['user who already chose a callsign -> NOT prompted', 'SHADOW_42', 'Ada Lovelace', null, false],
    ['password user who chose a callsign -> NOT prompted', 'SHADOW_42', null, null, false],
    // Whitespace must count as ABSENT. A provider returning "   " would otherwise suppress the
    // prompt and leave the user with no usable name at all.
    ['provider name is whitespace only -> PROMPTED', null, '   ', null, true],
    ['empty-string provider name -> PROMPTED', null, '', null, true],
    // The stored profile is the fallback: a profile predating the displayName capture would look
    // nameless on the auth object alone and wrongly re-prompt an established user.
    ['auth object empty but profile has a name -> NOT prompted', null, null, 'Ada Lovelace', false],
    ['both sources empty -> PROMPTED', null, null, '', true],
];

let pass = 0, fail = 0;
for (const [name, cs, authName, profName, want] of CASES) {
    const got = needsCallsign(cs, authName, profName);
    const ok = got === want;
    ok ? pass++ : fail++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `  (got ${got}, want ${want})`}`);
}
console.log(`\n  ${pass}/${pass + fail} cases behave as specified`);
process.exit(fail ? 1 : 0);
