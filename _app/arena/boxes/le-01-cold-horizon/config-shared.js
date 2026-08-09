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
        { id: 'z1', name: 'Terran Gateway',       page: 'gateway.html',   status: 'active' },
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
    missionData: {

        /* ── MISSION 2 — GHOST SESSION ──────────────────────────────────────
           A maintenance command reached ASTRAEA-9 from a Terran operator
           session while HELIOS-7's channels were diverging. Was it legitimate?

           THE TRAP, and it is the same trap in a new coat: the session token
           and the SSO audit log agree, and they are the same source. The
           identity provider vouching for its own token is one voice, not two.

           THE CANON OUTPUT IS "COMPROMISED BUT INCONCLUSIVE" and the design
           has to actually earn the second word. The physical record proves the
           human was not in the building, so the credential was used without
           them. Nothing here can say BY WHOM, because everything capable of
           attributing the action derives from the identity provider that was
           itself the thing being used. Authentication is not attribution.
           That is also mission 4's lesson ("valid signature does not establish
           origin"), so this plants it rather than duplicating it.

           Provenance: REAL. Federated identity, SSO audit trails, physical
           access control as an out-of-band witness, and the standing
           distinction between authentication and attribution. */
        2: {
            axes: ['issuer', 'logPipeline', 'clockSource'],
            situation:
                'A maintenance command reached ASTRAEA-9 at 06:14:22Z from operator '
              + 'session S-4471, during the window in which HELIOS-7 thermal channels '
              + 'diverged. The session authenticated cleanly. Establish whether it was '
              + 'legitimate, and be precise about what the evidence can and cannot show.',
            sensors: [
                { id: 'sess-token', name: 'Operator session token S-4471',
                  reading: 'VALID', unit: '',
                  issuer: 'terran-sso', logPipeline: 'sso-audit', clockSource: 'MOC-NTP',
                  note: 'Subject R. Okonkwo. Issued 06:12:04Z, MFA satisfied, not expired.' },
                { id: 'sso-audit', name: 'SSO audit record for S-4471',
                  reading: 'CONFIRMS', unit: '',
                  issuer: 'terran-sso', logPipeline: 'sso-audit', clockSource: 'MOC-NTP',
                  note: 'Authentication success, MFA satisfied, same subject, same second.' },
                { id: 'vpn-log', name: 'VPN concentrator session log',
                  reading: 'CONFIRMS', unit: '',
                  issuer: 'terran-sso', logPipeline: 'netops-syslog', clockSource: 'MOC-NTP',
                  note: 'Tunnel established for the same subject. SSO-integrated, so the '
                      + 'identity it reports is the one SSO handed it.' }
            ],
            corroborators: [
                { id: 'badge-log', name: 'Facility access control, ops floor',
                  value: 'BADGED OUT 05:48Z', unit: '',
                  issuer: 'facility-acs', logPipeline: 'facility-acs', clockSource: 'ACS-RTC',
                  reasoning: 'R. Okonkwo badged OUT of the operations floor at 05:48Z and '
                           + 'did not badge back in. The session authenticated at 06:12:04Z. '
                           + 'This system shares no issuer, no pipeline and no clock with '
                           + 'the identity provider.' },
                { /* Independent of the SSO family, but NOT of badge-log: same clock, same
                     pipeline. Deliberate, and the same shape as mission 1's corroborator
                     pair. Two witnesses can each be independent of the accused and still
                     be one witness with respect to each other. */
                  id: 'cam-still', name: 'Ops floor camera still, 06:12Z',
                  value: 'POSITION UNOCCUPIED', unit: '',
                  issuer: 'facility-cctv', logPipeline: 'facility-acs', clockSource: 'ACS-RTC',
                  reasoning: 'Console position 4 is unoccupied in the frame timestamped '
                           + '06:12Z. Shares a clock and a pipeline with the badge record, '
                           + 'so it strengthens that account rather than being a second one.' },
                { id: 'cmd-origin', name: 'Uplink source address for the command',
                  value: '10.42.7.19 (MOC floor subnet)', unit: '',
                  issuer: 'terran-sso', logPipeline: 'netops-syslog', clockSource: 'MOC-NTP',
                  reasoning: 'The command came from inside the MOC address space, which is '
                           + 'consistent with a legitimate console and equally consistent '
                           + 'with anyone who reached that subnet. It narrows WHERE and '
                           + 'says nothing about WHO.' }
            ]
        },

        /* ── MISSION 3 — LAST GOOD CONTACT ──────────────────────────────────
           Rebuild the last communications window that can be trusted, so every
           later mission has a reference point that is not simply asserted.

           THE TRAP: the platform clock and the ground clock are disciplined
           from the same upstream source, so two logs agreeing on a timestamp
           are one clock counted twice. Exactly mission 1's structure, applied
           to time.

           THE ANCHOR IS THE BOX'S OWN PHYSICS, which is why this mission is
           worth building rather than being a third variation. ASTRAEA-9 sits
           ~326,000 km away, so a command and its acknowledgement cannot be
           separated by less than ~2.18 s. That figure is not a setting anyone
           can edit, it is the distance. Any command/ack pair in the logs that
           appears to have completed faster than light is proof the timestamps
           were moved, and the ranging fix is a measurement of DISTANCE rather
           than a reading of a clock, so it cannot be forged by touching one.

           The player looks for the physically impossible round trip. That is
           the whole mission, and it turns the constraint the box opens with
           into the tool that solves it.

           Provenance: REAL (two-way ranging, light-time as a physical bound,
           NTP hierarchy and common-mode clock failure). */
        3: {
            /* timeRoot is the axis that matters and the reason this mission is not
               mission 1 reskinned. Two clocks with DIFFERENT NAMES can still be one
               clock: PLAT-CLK-A is disciplined from MOC-NTP, which is disciplined from
               GPS-DISC-1. Comparing clock names finds nothing, which is exactly the
               mistake a real analyst makes. Caught by act1-test: plat-log and moc-log
               came back INDEPENDENT because they share no field value, while being the
               same time by derivation. Dependency here is a hierarchy, not a string
               match, so the hierarchy is stated as its own axis. Real anchor: NTP
               stratum and common-mode clock failure. */
            axes: ['timeSource', 'timeRoot', 'logPipeline', 'signingAuthority'],
            situation:
                'Every later finding needs a moment it can be measured against. Establish '
              + 'the last contact whose timestamp can be trusted. Note that a command and '
              + 'its acknowledgement cannot be separated by less than the round-trip light '
              + 'delay, whatever any log says.',
            sensors: [
                { id: 'plat-log', name: 'ASTRAEA-9 command log',
                  reading: '06:14:22.31Z', unit: '',
                  timeSource: 'PLAT-CLK-A', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'platform-telemetry',
                  signingAuthority: 'astraea-telemetry-ca',
                  note: 'Command received. Platform clock, disciplined from the ground '
                      + 'reference on every contact.' },
                { id: 'moc-log', name: 'MOC uplink log',
                  reading: '06:14:22.10Z', unit: '',
                  timeSource: 'MOC-NTP', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'netops-syslog',
                  signingAuthority: 'lagrange-ops-ca',
                  note: 'Command transmitted. 0.21 s before the platform recorded '
                      + 'receiving it, which is not possible at this range.' },
                { id: 'sso-time', name: 'SSO audit timestamp for the session',
                  reading: '06:12:04.00Z', unit: '',
                  timeSource: 'MOC-NTP', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'sso-audit',
                  signingAuthority: 'lagrange-ops-ca',
                  note: 'Shares its time source with the MOC uplink log.' }
            ],
            corroborators: [
                { id: 'range-fix', name: 'Two-way ranging fix, modem-measured',
                  value: '2.181 s round trip', unit: '',
                  /* Its own root: a free-running counter is not disciplined from
                     anything, which is precisely what makes it usable here. */
                  timeSource: 'MODEM-COUNTER', timeRoot: 'MODEM-COUNTER',
                  logPipeline: 'rf-front-end',
                  signingAuthority: 'gs-ranging-ca',
                  reasoning: 'This is a measurement of DISTANCE, not a reading of a clock. '
                           + 'The modem counts its own elapsed ticks between transmitting a '
                           + 'code and hearing it returned. Moving a clock does not move '
                           + 'this number, and 2.181 s is the floor for any command and its '
                           + 'acknowledgement.' },
                { id: 'gs-maser', name: 'Ground station arrival time, maser reference',
                  value: '06:14:23.19Z', unit: '',
                  timeSource: 'GS-MASER', timeRoot: 'GS-MASER',
                  logPipeline: 'rf-front-end',
                  signingAuthority: 'gs-ranging-ca',
                  reasoning: 'RF arrival stamped against a local hydrogen maser that is not '
                           + 'disciplined from the ground NTP hierarchy. Shares a pipeline '
                           + 'with the ranging fix, so the two are one account of the RF '
                           + 'front end rather than two independent ones.' },
                { id: 'ntp-tree', name: 'Time service topology',
                  value: 'PLAT-CLK-A <- MOC-NTP <- GPS-DISC-1', unit: '',
                  timeSource: 'MOC-NTP', timeRoot: 'GPS-DISC-1',
                  logPipeline: 'netops-syslog',
                  signingAuthority: 'lagrange-ops-ca',
                  reasoning: 'The platform clock is disciplined FROM the ground reference. '
                           + 'Agreement between them is not two clocks agreeing, it is one '
                           + 'clock and its copy.' }
            ]
        },

        /* ── MISSION 4 — SIGNED IN ASH ──────────────────────────────────────
           MVP-1's centrepiece, and the first mission that is NOT another
           independence test. Act I taught one habit three times; running it a
           fourth would be a treadmill. This mission needs the habit and then
           needs something the habit cannot do.

           THE COMMAND'S SIGNATURE IS VALID. The key is the right key, the chain
           builds to a trusted root, nothing is expired. And it still does not
           establish origin, for two independent reasons the player must find:

             REPLAY.  The frame counter was already used. A signature proves the
                      key signed THAT PAYLOAD at some point; it says nothing
                      about when it was sent. That is precisely why CCSDS SDLS
                      carries an anti-replay sequence rather than relying on the
                      MAC alone.                                        [REAL]
             SCOPE.   The token's `aud` names the thermal service, not the
                      command authority. It validates and it was not issued FOR
                      this. Verbatim the `bh-mod-auth-access` lesson on aud/iss
                      claim validation, which the scope doc names as this
                      mission's module citation.                        [REAL]

           IT CHAINS BACKWARD DELIBERATELY. Mission 3 establishes a known-good
           timestamp; without it there is no reference against which "this frame
           counter was already used at 06:09" means anything. And mission 2
           planted "authentication is not attribution" so this can pay it off
           rather than teach it cold. Act I is the equipment for Act II.

           Provenance: REAL. CCSDS Space Data Link Security, telecommand frame
           counters, and JWT-style audience/issuer claim validation. */
        4: {
            axes: ['keyCustody', 'signingAuthority', 'logPipeline'],
            situation:
                'The maintenance command from session S-4471 carries a valid signature. '
              + 'Ops is treating that as proof of origin and is ready to close the '
              + 'investigation. Audit the telecommand frame itself. A signature establishes '
              + 'that a key signed a payload; decide what else it does and does not show.',
            /* Frames for the audit panel. The mission is solved by comparing them,
               not by reading any single one: every frame here is individually valid. */
            frames: [
                { id: 'f-1131', label: 'Frame 1131 — thermal setpoint',
                  frameCounter: 1131, payloadHash: 'a41c…9e02', sig: 'VALID',
                  aud: 'astraea.thermal', iss: 'terran-sso', sentAt: '06:09:41Z',
                  note: 'Legitimate. Issued and acknowledged inside the known-good window '
                      + 'established in Last Good Contact.' },
                { id: 'f-1131-r', label: 'Frame 1131 — maintenance command (disputed)',
                  frameCounter: 1131, payloadHash: 'a41c…9e02', sig: 'VALID',
                  aud: 'astraea.thermal', iss: 'terran-sso', sentAt: '06:14:22Z',
                  note: 'The disputed command. Signature verifies. Same frame counter and '
                      + 'the same payload hash as 06:09:41Z.' },
                { id: 'f-1132', label: 'Frame 1132 — housekeeping poll',
                  frameCounter: 1132, payloadHash: 'b7d0…1a55', sig: 'VALID',
                  aud: 'astraea.command', iss: 'terran-sso', sentAt: '06:15:03Z',
                  note: 'Normal traffic. Counter advances, audience is the command '
                      + 'authority, payload is its own.' }
            ],
            /* The service this frame was accepted BY. A token whose aud names a
               different service is a scope failure even when it verifies. */
            acceptedBy: 'astraea.command',
            sensors: [
                { id: 'cmd-sig', name: 'Telecommand signature',
                  reading: 'VERIFIES', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'lagrange-ops-ca',
                  logPipeline: 'netops-syslog',
                  note: 'MAC verifies against the operations signing key. Chain builds to a '
                      + 'trusted root. Nothing is expired.' },
                { id: 'cmd-cert', name: 'Signing certificate chain',
                  reading: 'TRUSTED', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'lagrange-ops-ca',
                  logPipeline: 'netops-syslog',
                  note: 'Same key custody and same authority as the signature it vouches '
                      + 'for. A chain confirming its own leaf is one statement.' },
                { id: 'hsm-audit', name: 'HSM key-use audit',
                  reading: 'ONE USE AT 06:09:41Z', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'hsm-attest-ca',
                  logPipeline: 'hsm-internal',
                  note: 'The HSM records the key being used ONCE this hour, at 06:09:41Z. '
                      + 'It has no record of a signing operation at 06:14:22Z.' }
            ],
            corroborators: [
                { id: 'seq-window', name: 'SDLS anti-replay window',
                  value: 'COUNTER 1131 ALREADY SEEN', unit: '',
                  keyCustody: 'astraea-fsw', signingAuthority: 'astraea-platform-ca',
                  logPipeline: 'platform-telemetry',
                  reasoning: 'The platform recorded frame counter 1131 at 06:09:41Z and '
                           + 'accepted it again at 06:14:22Z. A frame counter is single-use '
                           + 'by design; accepting it twice is the anti-replay control '
                           + 'failing open, not the signature being forged.' },
                { id: 'aud-claim', name: 'Token audience claim',
                  value: 'aud = astraea.thermal', unit: '',
                  keyCustody: 'terran-sso', signingAuthority: 'terran-sso-ca',
                  logPipeline: 'sso-audit',
                  reasoning: 'The frame was accepted by astraea.command. Its audience claim '
                           + 'names astraea.thermal. It validates, and it was never issued '
                           + 'for the service that honoured it.' },
                { id: 'hsm-attest', name: 'HSM attestation log',
                  value: 'NO SIGNING OPERATION AT 06:14:22Z', unit: '',
                  keyCustody: 'moc-hsm-2', signingAuthority: 'hsm-attest-ca',
                  logPipeline: 'hsm-internal',
                  reasoning: 'The key never left the module and the module did not sign '
                           + 'anything at the disputed time. Whoever sent that frame did '
                           + 'not need the key, because the bytes already existed.' }
            ]
        }
    },

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
    Object.keys(m).forEach(function (k) {
        if (k !== 'axes' && k !== 'sensors' && k !== 'corroborators') view[k] = m[k];
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
