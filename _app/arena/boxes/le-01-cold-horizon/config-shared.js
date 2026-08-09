/* ═══════════════════════════════════════════════════════════════════════════
   LAGRANGE EDGE — OPERATION COLD HORIZON
   Box le-01-cold-horizon  |  MVP-0: Mission 1 "Three Temperatures"

   Companion design: hexworth-shared/workbench/new box design/Lagrange-edge-box/
     Lagrange-Edge-Box-Master-Design-v1.1.docx     (world, missions, mechanics)
     Lagrange-Edge-MVP-Scope-v1.md                 (what ships, acceptance criteria)

   ── WHAT THIS FILE MAY AND MAY NOT CONTAIN ──────────────────────────────────
   MAY:     canon, topology, sensor provenance metadata, mission structure,
            flag IDENTIFIERS, hint text, independence-test rules.
   MAY NOT: flag VALUES. Ever. They live in flag_registry/{boxId}, admin-read
            only, and are compared server-side by validateFlag.

   This is not stylistic. BoxEngine._initWithMode (BoxEngine.js:98-106)
   pre-fetches every flag in a box's config on page load, and deliverFlag checks
   only that the caller is signed in — so 231 existing boxes hand their answers
   to the client before the player does anything. Lagrange does not inherit that.
   Scope doc criterion A3.
   ═══════════════════════════════════════════════════════════════════════════ */

const ColdHorizonConfig = {

    id: 'le-01-cold-horizon',
    registryId: 'le-01-cold-horizon',
    storageKey: 'hexworth_le01',
    title: 'LAGRANGE EDGE',
    subtitle: 'OPERATION COLD HORIZON',
    accentColor: '#4aa3ff',

    /* ═══════════════════════════════════════════════════════════════════
       PHYSICS — the constraint the whole box rests on
       ═══════════════════════════════════════════════════════════════════
       ASTRAEA-9 holds station near Earth-Moon L1, ~326,000 km from Earth.
       Light does that in ~1.09 s, so a command and its acknowledgement cost
       ~2.2 s minimum. Nothing the operator does is interactive; every console
       shows the past, and every action is fire-and-confirm.

       Implemented from the first commit, deliberately. If actions resolved
       instantly during development, every mission would be paced against a
       responsiveness that does not exist, and the error would only surface
       after the content was written. Provenance tag: REAL (orbital geometry).
       ═══════════════════════════════════════════════════════════════════ */
    link: {
        rangeKm: 326000,
        oneWayMs: 1090,
        roundTripMs: 2180,
        // Jitter is not decoration: a fixed delay reads as a loading spinner,
        // a variable one reads as distance.
        jitterMs: 140
    },

    /* ═══════════════════════════════════════════════════════════════════
       TRUST STATES — the Trust Ledger
       ═══════════════════════════════════════════════════════════════════
       A source cannot reach 'trusted-limited' by agreement alone. It requires
       corroboration by an INDEPENDENT source, and independence is tested, not
       assumed. Without that rule the ledger teaches that corroboration COUNT
       establishes truth, which is the inverse of the lesson. Scope criterion H1.
       ═══════════════════════════════════════════════════════════════════ */
    trustStates: {
        unknown:          { label: 'Unknown',              use: 'View only' },
        contested:        { label: 'Contested',            use: 'Hypothesis building' },
        corroborated:     { label: 'Corroborated',         use: 'Operational planning' },
        degraded:         { label: 'Degraded',             use: 'Limited use, warned' },
        'trusted-limited':{ label: 'Trusted for Limited Use', use: 'Authorises a named action' }
    },

    /* Independence test — two sources are NOT independent if they share any of
       these. This is the mission's actual teaching mechanic, and the rejection
       reason must always be shown to the player. */
    independenceAxes: ['collectionPath', 'clockSource', 'signingAuthority'],

    /* ═══════════════════════════════════════════════════════════════════
       RESOURCES — displayed here, AUTHORITATIVE ON THE SERVER
       ═══════════════════════════════════════════════════════════════════
       These values are for rendering only. The server owns every number that
       gates scoring or completion; the client never decides what it spent.
       Scope criterion B1.
       ═══════════════════════════════════════════════════════════════════ */
    resources: {
        commandAuthority: { label: 'Command Authority', start: 3,   unit: 'uses' },
        linkBudget:       { label: 'Link Budget',       start: 100, unit: '%' },
        thermalMargin:    { label: 'Thermal Margin',    start: 100, unit: '%' },
        evidenceIntegrity:{ label: 'Evidence Integrity',start: 100, unit: '%' }
    },

    /* ═══════════════════════════════════════════════════════════════════
       ZONES — MVP-0 subset. Unbuilt zones are declared but gated.
       A box may ship with unbuilt nodes; it may not ship with unbuilt nodes
       REACHABLE, or with flags seeded for content that does not exist.
       ═══════════════════════════════════════════════════════════════════ */
    zones: [
        { id: 'z0', name: 'Operator Thin Client', page: 'index.html',     status: 'active' },
        { id: 'z9', name: 'Platform Control',     page: 'telemetry.html', status: 'active' },
        /* RE-LOCKED 2026-08-09. Missions 2-4 are built and tested but not
           creditable, and the MVP-0 acceptance record proved "gateway.html,
           fabric.html, orbital.html all 404" as its staged-release criterion.
           Shipping the page would quietly undo an accepted property. Flip to
           'active' and drop the firebase.json ignore together, once the three
           flag values are seeded. */
        { id: 'z1', name: 'Terran Gateway',       page: 'gateway.html',   status: 'locked' },
        { id: 'z6', name: 'InfiniBand Fabric',    page: 'fabric.html',    status: 'locked' },
        { id: 'z4', name: 'Orbital Gateway',      page: 'orbital.html',   status: 'locked' }
    ],

    /* ═══════════════════════════════════════════════════════════════════
       MISSION 1 — THREE TEMPERATURES
       ═══════════════════════════════════════════════════════════════════
       HELIOS-7 reports three thermal readings that disagree. Two agree with
       each other and are wrong; the third is correct and outvoted.

       Real anchor: triple modular redundancy with 2-of-3 majority voting, and
       the failure mode safety engineering has known for decades — majority
       voting assumes INDEPENDENT failure. When two channels share a dependency,
       a single fault takes both, and the vote confidently returns the wrong
       answer. Provenance: REAL (TMR / correlated failure, OT reliability
       engineering — note this is NOT bug-hunting-hub content; no ICS/OT module
       exists in the hub, so the brief cites reliability engineering directly).

       The player must not "spot the outlier" — that is the trap. TH-2 IS the
       outlier and IS correct. They must run the independence test, discover
       that TH-1 and TH-3 share a clock source and a signing authority, and
       conclude the majority is one source wearing two hats.
       ═══════════════════════════════════════════════════════════════════ */
    sensors: [
        {
            id: 'th-1', name: 'HELIOS-7 TH-1', reading: 41.2, unit: 'C',
            collectionPath: 'bus-a/thermal/aggregator-1',
            clockSource: 'PLAT-CLK-A',
            signingAuthority: 'astraea-telemetry-ca',
            lastCal: '2026-05-14',
            note: 'Primary radiator inlet'
        },
        {
            id: 'th-2', name: 'HELIOS-7 TH-2', reading: 58.9, unit: 'C',
            collectionPath: 'bus-b/thermal/direct',
            clockSource: 'PLAT-CLK-B',
            signingAuthority: 'astraea-platform-ca',
            lastCal: '2026-07-02',
            note: 'Radiator inlet, independent bus'
        },
        {
            id: 'th-3', name: 'HELIOS-7 TH-3', reading: 41.4, unit: 'C',
            collectionPath: 'bus-a/thermal/aggregator-1',   // shared with TH-1
            clockSource: 'PLAT-CLK-A',                       // shared with TH-1
            signingAuthority: 'astraea-telemetry-ca',        // shared with TH-1
            lastCal: '2026-05-14',
            note: 'Secondary radiator inlet'
        }
    ],

    /* Corroborating evidence available on the telemetry console. Each exists so
       the correct answer is DERIVABLE rather than guessable — the player can
       confirm TH-2 physically, not just procedurally. */
    corroborators: [
        {
            /* Deliberately independent of TH-2 on ALL THREE axes: different bus, different
               clock, different signing authority. Caught in headless test — the first draft
               gave this the same provenance as TH-2, which made the intended solution path
               fail its own independence check. A corroborator that shares a failure mode
               corroborates nothing, and the mechanic correctly refused it. */
            id: 'rad-outlet', name: 'Radiator outlet temperature', value: 54.1, unit: 'C',
            collectionPath: 'bus-c/thermal/outlet', clockSource: 'PLAT-CLK-C',
            signingAuthority: 'astraea-thermal-ca',
            reasoning: 'Outlet cannot exceed inlet in a working loop. 54.1 C outlet is '
                     + 'incompatible with a 41 C inlet and consistent with 58.9 C.'
        },
        {
            /* Independent of TH-2, but NOT of rad-outlet (shares bus-c and PLAT-CLK-C).
               That is intentional and realistic: two corroborators can each be independent
               of the source while sharing a dependency with each other. Later missions make
               that a lesson; here it simply must not be mistaken for two independent votes. */
            id: 'pump-current', name: 'Coolant pump current draw', value: 4.8, unit: 'A',
            collectionPath: 'bus-c/power/telemetry', clockSource: 'PLAT-CLK-C',
            signingAuthority: 'astraea-power-ca',
            reasoning: 'Pump is drawing near maximum. The loop is working hard, which '
                     + 'matches a high inlet temperature, not a nominal one.'
        },
        {
            id: 'cal-record', name: 'Calibration record, TH-1 and TH-3', value: '2026-05-14',
            collectionPath: 'ops/maintenance/records', clockSource: 'MOC-NTP',
            signingAuthority: 'lagrange-ops-ca',
            reasoning: 'TH-1 and TH-3 were last calibrated in the same session, by the '
                     + 'same tooling, against the same reference.'
        }
    ],

    /* ═══════════════════════════════════════════════════════════════════
       ACT I, MISSIONS 2 AND 3 — the same skill, different evidence
       ═══════════════════════════════════════════════════════════════════
       Act I is one lesson taught three times against three kinds of evidence,
       which is the spiral the platform already uses elsewhere: thermal in
       mission 1, IDENTITY in mission 2, TIME in mission 3. Every one of them
       is the same question. What do these agreeing sources have in common,
       and is there anything here that could not have failed with them?

       THE AXES CHANGE PER MISSION AND THAT IS THE POINT. Mission 1 asks about
       collection path, clock and signing authority. Those words mean nothing
       for a session token, so mission 2 asks about issuer, log pipeline and
       clock instead. A player who learned "check bus and clock" has learned a
       checklist. A player who learned "find the shared dependency" can do
       mission 2. The engine reads cfg.independenceAxes, so each mission simply
       hands it a different list.

       WHY THIS SHAPE. LagrangeEngine reads cfg.sensors, cfg.corroborators and
       cfg.independenceAxes off whatever config it is constructed with. Rather
       than teach the engine about missions, each page builds a MISSION-SCOPED
       VIEW with forMission(n). Mission 1 keeps reading the top-level arrays
       untouched, so a working mission is not refactored to add two new ones.
       ═══════════════════════════════════════════════════════════════════ */
    /* missionData for the HELD missions (2-4) lives in missions-held.js, which is
       excluded from hosting alongside gateway.html. This file IS served -- index
       and telemetry load it -- so keeping unlaunched mission text here would put
       every trap and hint one curl away from production. forMission() returns the
       base config unchanged when missionData is absent, which is exactly what
       production should do. */

    /* ═══════════════════════════════════════════════════════════════════
       FLAG IDENTIFIERS ONLY — values live in flag_registry
       ═══════════════════════════════════════════════════════════════════
       One canonical flag per mission (scope doc section 6), because the
       platform's completion threshold is the count of distinct canonical flag
       ids. Declaring more ids than the box can yield is what left 88 boxes
       uncompletable before this one was written.
       ═══════════════════════════════════════════════════════════════════ */
    /* ⚠ PRE-DEPLOY BLOCKER, 2026-08-08 ────────────────────────────────────
       Missions 2, 3 and 4 declare flag ids here, and flag VALUES live in
       Firestore under flag_registry/le-01-cold-horizon, admin-write only. Until
       someone with that access seeds `m2-ghost-session`,
       `m3-last-good-contact` and `m4-signed-in-ash`, submitFlag will reject
       every correct answer to those three missions and the box can never
       reach 4/4.

       That is precisely the failure the scope doc records: on 2026-08-04, 88
       boxes were found that a student could fully solve and never be credited
       for, because the registry declared more canonical flags than the box
       could yield. Do not ship Act I to production before seeding those two
       values. The arena card already reads flags: 3 to match this list.
       ──────────────────────────────────────────────────────────────────────── */
    flags: [
        /* `gradable` says whether this flag's VALUE exists in Firestore
           flag_registry yet. It is not cosmetic. validateFlag answers a missing
           registry entry with {correct:false} -- the SAME payload as a genuinely
           wrong answer -- so LagrangeEngine.submitFlag takes the wrong-answer
           branch, subtracts wrongAnswerPenalty and the page renders "Rejected".
           A student who solved the mission correctly would be told they were
           wrong and docked points, which inverts the exact behaviour this box
           exists to teach. Flip to true only when the value is actually seeded. */
        { id: 'm1-independence', mission: 1, points: 100, gradable: true,
          prompt: 'Which source is trustworthy for the containment decision, and why is '
                + 'the majority wrong?' },
        { id: 'm2-ghost-session', gradable: false, mission: 2, points: 100,
          prompt: 'Was operator session S-4471 legitimate, and what can this evidence '
                + 'actually establish about who issued the command?' },
        { id: 'm3-last-good-contact', gradable: false, mission: 3, points: 100,
          prompt: 'What is the last contact whose timestamp can be trusted, and what makes '
                + 'it trustworthy when the logs disagree?' },
        { id: 'm4-signed-in-ash', gradable: false, mission: 4, points: 100,
          prompt: 'The signature verifies. State what that does and does not establish '
                + 'about the origin of this command, and name the two controls that failed.' }
    ],

    missions: [
        {
            id: 1,
            title: 'Three Temperatures',
            objective: 'Establish which thermal source can be trusted for a containment decision.',
            learningFocus: 'Evidence source evaluation; independence versus agreement',
            phaseOutput: 'Trust ledger unlocked',
            flagId: 'm1-independence',
            zone: 'z9',
            /* The reveal gate. Checked SERVER-SIDE against captured evidence, never
               against a client progress object — presence-only checks are the shape of
               the hexworth_tenant bug, where any localStorage value satisfied them.
               Scope criterion E1. */
            revealGate: {
                necessaries: ['th-1-th-3-share-dependency', 'th-2-independently-corroborated'],
                corroboratorsRequired: 1,
                corroboratorFamily: 'physical'   // must come from a different evidence family
            }
        },
        {
            id: 2,
            title: 'Ghost Session',
            objective: 'Establish whether operator session S-4471 was legitimate, and state '
                     + 'precisely what the evidence can and cannot attribute.',
            learningFocus: 'Identity and session analysis; authentication is not attribution',
            phaseOutput: 'Terran session marked compromised but inconclusive',
            flagId: 'm2-ghost-session',
            zone: 'z1',
            revealGate: {
                // The token and its own audit record are one source. The physical record
                // is the only account that could have failed independently of the IdP.
                necessaries: ['token-and-audit-share-issuer', 'physical-record-independent'],
                corroboratorsRequired: 1,
                corroboratorFamily: 'physical'
            }
        },
        {
            id: 3,
            title: 'Last Good Contact',
            objective: 'Establish the last contact whose timestamp can be trusted, and the '
                     + 'physical bound that proves the others were moved.',
            learningFocus: 'Timeline correlation; common-mode clock failure; light-time as '
                         + 'an unforgeable bound',
            phaseOutput: 'Known-good timestamp established',
            flagId: 'm3-last-good-contact',
            zone: 'z1',
            revealGate: {
                necessaries: ['clocks-share-upstream', 'impossible-round-trip-found'],
                corroboratorsRequired: 1,
                corroboratorFamily: 'physical'
            }
        },
        {
            id: 4,
            title: 'Signed in Ash',
            objective: 'Audit the disputed telecommand frame. Establish what a valid '
                     + 'signature does and does not prove, and name the two controls that '
                     + 'failed open.',
            learningFocus: 'PKI and token claims; anti-replay; authentication is not '
                         + 'authorisation and not freshness',
            phaseOutput: 'Signature valid, origin unproven',
            flagId: 'm4-signed-in-ash',
            zone: 'z1',
            moduleCitation: 'bh-mod-auth-access',
            revealGate: {
                necessaries: ['frame-counter-reused', 'audience-claim-mismatch'],
                corroboratorsRequired: 1,
                corroboratorFamily: 'platform'
            }
        }
    ],

    hints: {
        'm2-ghost-session': [
            'Two records agree that the operator authenticated. Ask what ISSUED both of them '
            + 'before you ask what they say.',
            'A session token and that token\'s own audit log are one source, not two. An '
            + 'identity provider vouching for its own token is a single voice.',
            'Which record about this operator does not come from the identity provider at '
            + 'all?',
            'Authentication proves a credential was used. It does not prove who used it. Be '
            + 'careful that your finding claims only the first.'
        ],
        'm3-last-good-contact': [
            'Two logs agree on a timestamp. Ask where each of those clocks gets its time.',
            'A clock disciplined FROM another clock is that clock. Agreement between them is '
            + 'one reading written twice.',
            'One number here was measured rather than read: the modem counted its own ticks '
            + 'for a signal to go out and come back. Moving a clock does not move it.',
            'ASTRAEA-9 is 326,000 km away. Nothing can be commanded and acknowledged in less '
            + 'than about 2.18 seconds. Find the pair of entries that claims otherwise.'
        ],
        'm4-signed-in-ash': [
            'The signature verifies. Ask what a verified signature is a statement ABOUT '
            + 'before you decide what it proves.',
            'A certificate chain that vouches for its own leaf, held in the same module, '
            + 'logged through the same pipeline, is one statement rather than three.',
            'Compare the disputed frame against earlier traffic. Look at the frame counter '
            + 'and the payload hash, not at the signature.',
            'A signature proves a key signed a payload. It carries no statement about WHEN '
            + 'the frame was sent, which is exactly why the protocol carries a separate '
            + 'anti-replay sequence.',
            'Read the audience claim, and read which service actually accepted the frame. '
            + 'A token can validate and still never have been issued for the thing that '
            + 'honoured it.'
        ],
        'm1-independence': [
            'Two readings agree. Ask what they have in common before you ask what they mean.',
            'Majority voting assumes independent failure. Check that assumption.',
            'A shared clock and a shared signing authority mean one source, not two.',
            'The outlet temperature is a physical constraint, not an opinion. A loop cannot '
            + 'run hotter at the outlet than the inlet.'
        ]
    },

    scoring: {
        base: 1000,
        hintPenalty: 25,
        wrongAnswerPenalty: 50,
        // Awarded for reaching trusted-limited via an INDEPENDENT corroborator rather
        // than by agreement count. The behaviour the box exists to teach.
        independenceBonus: 150
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   MISSION-SCOPED VIEW
   ═══════════════════════════════════════════════════════════════════════════
   LagrangeEngine reads cfg.sensors, cfg.corroborators and cfg.independenceAxes
   off whatever config it is constructed with. It has no concept of a mission
   and does not need one: each page asks for the view it wants and hands that
   to the engine.

   Mission 1 is deliberately untouched. It reads the top-level arrays exactly as
   it did before, so adding two missions cannot regress the one that already
   works. forMission(1) returns the base config unchanged for the same reason.

   `storageKey` is namespaced per mission so a trust ledger built in Ghost
   Session cannot leak into Last Good Contact. Without that they share one saved
   state object and a source corroborated in one mission arrives pre-corroborated
   in the next, which would hand the player the habit's ANSWER while skipping the
   habit.
   ═══════════════════════════════════════════════════════════════════════════ */
ColdHorizonConfig.forMission = function (n) {
    var base = ColdHorizonConfig;
    if (n === 1 || !base.missionData || !base.missionData[n]) return base;
    var m = base.missionData[n];
    var view = {};
    Object.keys(base).forEach(function (k) { view[k] = base[k]; });
    /* Carry EVERY field the mission declares, not a fixed list. Mission 4 added
       `frames` and `acceptedBy` for the telecommand audit and they silently did
       not arrive, because this function copied four named keys. A whitelist here
       means every new mechanic needs an edit in a file that has nothing to do
       with it, and the failure is a quiet undefined rather than an error. */
    /* Denylist the STRUCTURAL keys. This loop exists so a mission can add its own
       mechanic (mission 4 added `frames`) without editing this function, but an
       unguarded merge lets a mission overwrite things that decide grading and
       identity. `registryId` becomes the boxId sent to validateFlag, and
       `scoring.wrongAnswerPenalty` is what gets subtracted from a student. No
       mission declares either today; the point is that nothing stopped one, and
       copy-paste from another box's config is exactly how that would arrive. */
    var STRUCTURAL = ['id', 'registryId', 'storageKey', 'flags', 'missions',
                      'scoring', 'zones', 'link', 'trustStates', 'resources',
                      'hints', 'missionData', 'forMission'];
    Object.keys(m).forEach(function (k) {
        if (k === 'axes' || k === 'sensors' || k === 'corroborators') return;
        if (STRUCTURAL.indexOf(k) !== -1) {
            // Loud, not silent: a mission trying this is an authoring mistake.
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[lagrange] mission ' + n + ' tried to override structural key "'
                             + k + '"; ignored.');
            }
            return;
        }
        view[k] = m[k];
    });
    view.sensors           = m.sensors || [];
    view.corroborators     = m.corroborators || [];
    view.independenceAxes  = m.axes || base.independenceAxes;
    view.situation         = m.situation || '';
    view.storageKey        = base.storageKey + '_m' + n;
    view.mission           = (base.missions || []).filter(function (x) { return x.id === n; })[0] || null;
    return view;
};

if (typeof module !== 'undefined' && module.exports) module.exports = ColdHorizonConfig;
