/* ═══════════════════════════════════════════════════════════════════════════
   LAGRANGE EDGE, MISSION ACTS
   ═══════════════════════════════════════════════════════════════════════════
   WHY THIS EXISTS. Every z1 level was "pick the right card". The mission's own
   revealGate demands a corroborator from the PHYSICAL family, and the game then
   handed that corroborator over as a tile you could read without doing anything.
   Mission 1 is the only level that felt different, and the reason is that it is
   the only one where you go and GET the physical truth yourself.

   So a corroborator may now declare `earnedBy`. Until the act is performed it
   renders REDACTED and cannot be selected for an independence test. You have to
   move something first: fly the RSV, command the platform, or work the console.

   ⚠ THIS IS A PLAY GATE, NOT A SECURITY CONTROL. It lives in localStorage, so a
   devtools line defeats it in seconds. That is acceptable ONLY because it is not
   the thing protecting credit. Taskboard #306 (proven by Mallory 2026-08-09) is
   the integrity half: revealGate must be evaluated SERVER-SIDE before a flag is
   credited. Do not let this file grow into a justification for skipping that, and
   do not describe it to a player as tamper-proof. It shapes the intended path; it
   does not defend it. The box has already been bitten once by a client-side gate
   that a cached value walked straight through.

   STORAGE
     hexworth_le01_acts -> { "<missionId>:<corrId>": { kind, at, payload } }
   Deliberately one key holding a map rather than a key per act: a player clearing
   one act should not have to hunt through a dozen keys, and the sortie hand-off
   (hexworth_le01_sortie) already established the one-key-per-concern pattern.
   ═══════════════════════════════════════════════════════════════════════════ */

var MissionActs = (function () {
    'use strict';

    var KEY = 'hexworth_le01_acts';

    /* Every read is total. A student with storage disabled, a private window, or a
       half-written value from an interrupted act gets "nothing earned yet" rather
       than a thrown exception that takes the whole gateway down with it. The box
       has shipped a page that died on load twice; neither time was it obvious. */
    function readAll() {
        try {
            if (typeof localStorage === 'undefined') return {};
            var raw = localStorage.getItem(KEY);
            if (!raw) return {};
            var o = JSON.parse(raw);
            return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
        } catch (e) { return {}; }
    }

    function keyFor(missionId, corrId) { return String(missionId) + ':' + String(corrId); }

    function isEarned(missionId, corrId) {
        return Object.prototype.hasOwnProperty.call(readAll(), keyFor(missionId, corrId));
    }

    function get(missionId, corrId) {
        return readAll()[keyFor(missionId, corrId)] || null;
    }

    /* Called by whichever surface hosted the act: the sortie on a clean scan, the
       console on a completed command, the satellite panel on a delayed ack. */
    function record(missionId, corrId, kind, payload) {
        try {
            if (typeof localStorage === 'undefined') return false;
            var all = readAll();
            all[keyFor(missionId, corrId)] = {
                kind: kind || 'unknown',
                at: new Date().toISOString(),
                payload: payload || null
            };
            localStorage.setItem(KEY, JSON.stringify(all));
            return true;
        } catch (e) { return false; }
    }

    /* The three verbs. Each names the PLACE it is performed and the sentence the
       player is shown, because "go do the thing" is not an instruction. */
    var VERBS = {
        drone: {
            label: 'FLY RSV-04',
            blurb: 'A record can be moved. A structure you flew out and looked at cannot.',
            /* ROUTED BY WHAT THE MISSION ACTUALLY NEEDS TO SEE, not by verb.

               For one commit every drone act pointed here at cloud-cold-horizon.html, which
               is a HELIOS-7 thermal panel survey. Mission 12's corroborator IS that survey,
               word for word. Missions 6 and 8 want an RF chain topology and a physical cable
               count, and flying a thermal survey establishes neither. Chris blocked the deploy
               over it: the box teaches that a reading carries only what its provenance
               supports, and crediting "seen with your own optics" for something never seen is
               that lesson inverted.

               So the environment is chosen by the evidence. A drone act with no environment
               built for it gets NO page rather than a convenient stand-in. */
            page: function (m, c) {
                var key = String(m) + ':' + String(c);
                if (key === '12:ir-survey') {
                    return '../../../houses/cloud/games/cloud-cold-horizon.html?act=' + key;
                }
                return '../../../houses/cloud/games/lagrange-inspect.html?act=' + key;
            }
        },
        satellite: {
            label: 'COMMAND THE PLATFORM',
            blurb: 'Issue the command and wait out the light-time. The platform answers when it answers.',
            page: function (m, c) { return 'console.html?mode=command&act=' + m + ':' + c; }
        },
        terminal: {
            label: 'WORK THE CONSOLE',
            blurb: 'Pull the reading yourself, with its link, its clock and its signing authority attached.',
            page: function (m, c) { return 'console.html?act=' + m + ':' + c; }
        }
    };

    function verb(kind) { return VERBS[kind] || null; }

    /* ── PER-MISSION CONSOLE DATA ────────────────────────────────────────────
       LagrangeTerminal takes `options.platform`, so a mission hands the console ITS
       evidence rather than mission 1's. Without this, `tm BMC-SEL` answers "no such
       telemetry point" and nine levels dead-end at the act they were sent to perform.

       THE PROVENANCE HERE IS LEDGER, NOT DECORATION. Every earned point deliberately
       arrives on a link whose clock and authority differ from the platform's ka-1,
       because that difference is the entire reason the reading corroborates anything.
       A badge record that arrived down the spacecraft's own downlink would be one more
       voice from the same throat. If you add a mission here, give it a link that could
       genuinely have failed independently, or you have written a prop.

       SDLS is authenticated only for the missions whose act is a TELECOMMAND. `tc` is
       refused at the frame layer without a session, which is correct and is mission 4's
       lesson, but it would make m5 and m13 impossible to complete. */
    var GROUND = {
        badge:  { id: 'moc-badge', name: 'Facility access control, ops floor', station: 'MOC-JAX',
                  clock: 'MOC-NTP', authority: 'facility-pacs-ca', up: true },
        bmc:    { id: 'bmc-oob',   name: 'Management network, out-of-band', station: 'MOC-JAX',
                  clock: 'BMC-RTC', authority: 'bmc-attest-ca', up: true },
        tape:   { id: 'gs-tape',   name: 'Ground downlink recorder, write-once', station: 'DSS-JAX',
                  clock: 'GS-MASER', authority: 'gs-recorder-seal', up: true },
        wire:   { id: 'gw-tap',    name: 'Orbital gateway wire tap', station: 'DSS-JAX',
                  clock: 'GS-MASER', authority: 'gateway-tap-attest', up: true },
        lab:    { id: 'ops-lab',   name: 'Offline analysis rig', station: 'MOC-JAX',
                  clock: 'MOC-NTP', authority: 'lagrange-ops-ca', up: true }
    };

    var ACT_PLATFORM = {
        '2':  { link: GROUND.badge, point: { point: 'BADGE', desc: 'Ops floor access, S-4471 holder',
                    value: 'NO ENTRY 03:40-07:20Z', via: 'moc-badge' } },
        '7':  { link: GROUND.bmc,   point: { point: 'BMC-SEL', desc: 'Management processor event log',
                    value: 'VIRTUAL MEDIA MOUNTED 05:58Z', via: 'bmc-oob' } },
        '9':  { link: GROUND.lab,   point: { point: 'LAYER-HASH', desc: 'Running container layer digest',
                    value: 'sha256:9f2c..a1', via: 'ops-lab' } },
        '10': { link: GROUND.tape,  point: { point: 'TAPE', desc: 'Ground recording of the downlink',
                    value: 'CONTINUOUS, NO GAP', via: 'gs-tape' } },
        '11': { link: GROUND.lab,   point: { point: 'REPLAY', desc: 'Offline replay on corrected inputs',
                    value: 'VERDICT FLIPS TO BENIGN', via: 'ops-lab' } },
        '14': { link: GROUND.tape,  point: { point: 'SEAL', desc: 'Evidence bundle hash, fixed at capture',
                    value: 'sha256:41d0..7e', via: 'gs-tape' } },
        '15': { link: GROUND.wire,  point: { point: 'TLS-FP', desc: 'Certificate fingerprint seen on the wire',
                    value: 'SHA1 3A:9C:..:E2', via: 'gw-tap' } },
        // Telecommand acts: no new reading, but the link must accept a command at all.
        '5':  { authenticate: true },
        '13': { authenticate: true }
    };

    /* Builds the platform object for a mission, starting from the component's own default
       so a mission inherits the real links, passes and SDLS posture rather than a stub.

       NEVER MUTATES `base`. An earlier draft assigned p.sdls straight onto the argument,
       which meant a mission that authenticates the link (5 and 13) would write
       authenticated:true through to any shared platform object and hand every later
       mission a session it never established. That is precisely mission 4's lesson
       running backwards, planted by a helper. Copy first, then extend. */
    function platformFor(missionId, base) {
        var src = base || {};
        var extra = ACT_PLATFORM[String(missionId)];
        var p = {};
        for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) p[k] = src[k]; }
        if (!extra) return p;
        if (extra.link && Array.isArray(p.links) && p.links.every(function (l) { return l.id !== extra.link.id; })) {
            p.links = p.links.concat([extra.link]);
        }
        if (extra.point && Array.isArray(p.telemetry) && p.telemetry.every(function (t) { return t.point !== extra.point.point; })) {
            p.telemetry = p.telemetry.concat([extra.point]);
        }
        if (extra.authenticate) {
            p.sdls = { authenticated: true, suite: 'AES-256-GCM', spi: 12 };
        }
        return p;
    }

    /* Parses ?act=<missionId>:<corrId> for the surfaces that HOST an act, so the
       sortie and the console know what they were opened to produce. Returns null
       rather than a partial object: a malformed act param must not half-arm a page. */
    function parseRequest(search) {
        try {
            var raw = new URLSearchParams(search || (typeof location !== 'undefined' ? location.search : ''));
            var v = raw.get('act');
            if (!v) return null;
            var bits = v.split(':');
            if (bits.length !== 2 || !bits[0] || !bits[1]) return null;
            return { missionId: bits[0], corrId: bits[1] };
        } catch (e) { return null; }
    }

    return {
        isEarned: isEarned,
        get: get,
        record: record,
        verb: verb,
        parseRequest: parseRequest,
        platformFor: platformFor,
        actPlatform: ACT_PLATFORM,
        _key: KEY
    };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = MissionActs; }
