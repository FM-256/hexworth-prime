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
       FLAG IDENTIFIERS ONLY — values live in flag_registry
       ═══════════════════════════════════════════════════════════════════
       One canonical flag per mission (scope doc section 6), because the
       platform's completion threshold is the count of distinct canonical flag
       ids. Declaring more ids than the box can yield is what left 88 boxes
       uncompletable before this one was written.
       ═══════════════════════════════════════════════════════════════════ */
    flags: [
        { id: 'm1-independence', mission: 1, points: 100,
          prompt: 'Which source is trustworthy for the containment decision, and why is '
                + 'the majority wrong?' }
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
        }
    ],

    hints: {
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

if (typeof module !== 'undefined' && module.exports) module.exports = ColdHorizonConfig;
