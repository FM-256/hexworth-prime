/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-core.js — per-student work order and initial lab state for the MD-100 final.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 1.5 (seeding), 2.1 (state),
 * R1 (derivation), 13.2 item 2 (sizes), 13.3 (D1 scope), 13.1 (technician account).
 *
 * TWO KINDS OF VALUE, AND THEY NEVER MIX.
 *   hidden  : profile, P7 fault variant, fault KB, driver inf number, decoy IP. Each is its own
 *             HMAC pick (mdfinal-derive.js). They live in the answer key, never in `state`.
 *   visible : everything printed on the work order. Drawn from the 'wo' visible sub-stream. A student who
 *             recovers that stream's 32-bit seed learns only what is already on screen.
 * The profile is hidden as an ID, but its REQUIREMENTS are printed: deriving the edition and the
 * licence channel from them is the 1.2 and 1.4 task.
 *
 * Pure, no clock, no I/O. The secret is an argument; the same (uid, examId, secret) always gives a
 * byte-identical state and key. Every result is a fresh JSON clone, so no caller can reach the
 * module's constants through it (R8).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var NF = require('../netfinal/netfinal-core.js');
    var DERIVE = require('./mdfinal-derive.js');
    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var EXAMS = require('./mdfinal-exams.js');

    var GENERATOR_VERSION = '1.0.0';
    var freeze = LIM.deepFreeze;

    /* ═══ CATALOGUES (frozen constants) ═══════════════════════════════════════════════════════ */

    /* Internal profile ids are never sent to a client; only `requirements` is printed. */
    var PROFILES = freeze([
        { id: 'mdp-a', label: 'CORP-FIN', joinType: 'domain', edition: 'Pro', channel: 'KMS',
          requirements: [
              'Finance desk PC. It must join the meridian.local domain.',
              'Its edition needs are domain membership and BitLocker; nothing on it needs Credential Guard.',
              'Licensing: Meridian commercial volume agreement, activated against the Meridian KMS host.'
          ] },
        { id: 'mdp-b', label: 'CORP-SEC', joinType: 'domain', edition: 'Enterprise', channel: 'KMS',
          requirements: [
              'Security operations PC. It must join the meridian.local domain.',
              'Credential Guard is mandatory on this PC under the Meridian enterprise agreement.',
              'Licensing: Meridian commercial volume agreement, activated against the Meridian KMS host.'
          ] },
        { id: 'mdp-c', label: 'CONTRACTOR', joinType: 'workgroup', edition: 'Pro', channel: 'MAK',
          requirements: [
              'Contractor PC. It stays in a workgroup; it is never joined to the domain.',
              'The system drive must be encrypted with BitLocker, and the PC must accept Remote Desktop connections.',
              'Licensing: the Multiple Activation Key printed on this work order.'
          ] }
    ]);

    /* Printed on every WO, so the edition is derivable rather than guessed. The requirements list
     * decides edition and licensing only; the build tasks apply to every PC (Nancy D1: CORP-FIN's
     * earlier wording could be read as "skip BitLocker"). N editions excluded so exactly one edition
     * is defensible per profile. */
    var EDITION_RULE = 'The requirements above decide the edition and licensing only; every build task on this ' +
        'work order applies to this PC. Install the lowest-tier Windows 11 edition that meets every requirement. ' +
        'Meridian is a commercial customer: academic editions and N (media-feature-less) editions are not licensed.';

    var VARIANTS = freeze(['V1', 'V2', 'V3', 'V4']);

    /* Public KMS client setup keys (GVLKs) as Microsoft publishes them; printed in the exam's key
     * table, so they are not secrets. */
    var GVLK = freeze({ 'Pro': 'W269N-WFGWX-YVC9B-4J6C9-T83GX', 'Enterprise': 'NPPR9-FWDCX-D2C8J-H872K-2YT43' });

    var DOMAIN_FQDN = 'meridian.local';
    var PINNED_BUILD = freeze({ version: '24H2', build: 26100, isoRevision: 1742 });

    /* Lab KB ranges (the brief says KB numbers are lab values). A is P2's cumulative update, B is
     * the V2 fault hotfix; disjoint by construction and by test. */
    var KB_RANGE_A = freeze([5090100, 5090899]);
    var KB_RANGE_B = freeze([5091100, 5091899]);

    var DRIVER_OEM_RANGE = freeze([3, 40]);      /* oem<N>.inf for V1 */

    var SETS = freeze({
        ramMB: [6144, 8192], vcpu: [2, 4], vhdxGB: [96, 160, 200],
        cGB: [80, 96, 120], archiveGB: [40, 60], poolGB: [64, 80],
        prefix: [23, 24, 25],
        lobPort: [8443, 9120, 7443, 9443],
        lobHost: ['LEDGER01', 'LSYNC-APP01', 'MERLOB02'],
        workgroup: ['MERPARTNERS', 'CONTRACT-OPS', 'MEREXT'],
        firstNames: ['Ana', 'Ben', 'Carla', 'Dev', 'Elena', 'Femi', 'Grace', 'Hiro', 'Ines', 'Jamal',
                     'Kofi', 'Lena', 'Marco', 'Nadia', 'Omar', 'Priya', 'Quinn', 'Rosa', 'Sam', 'Tomas'],
        lastNames: ['Alvarez', 'Brooks', 'Chen', 'Diaz', 'Evans', 'Fischer', 'Garcia', 'Haddad', 'Ito',
                    'Jensen', 'Kowalski', 'Lopez', 'Mensah', 'Novak', 'Okafor', 'Patel', 'Reyes', 'Silva'],
        groupName: ['FinanceAnalysts', 'LedgerOps', 'ProjectLeads', 'AuditReaders', 'RecordsTeam'],
        dLabel: ['MER-DATA', 'FINDATA', 'PROJECTS', 'WORKDATA'],
        spacesLabel: ['MER-POOL', 'SCRATCH', 'STAGING'],
        spacesLetter: ['P', 'S', 'V'],
        resiliency: ['Simple', 'Two-way mirror'],
        shareName: ['LedgerDrop', 'FinShare', 'TeamFiles', 'Handoff'],
        confidential: ['Payroll', 'HR-Records', 'Contracts', 'Legal'],
        featureDeferral: [60, 90, 120, 180], qualityDeferral: [3, 7, 14],
        activeStart: [6, 7, 9, 10], activeLength: [10, 11, 12],
        acDisplay: [20, 25, 45], acSleep: [45, 60, 90], dcDisplay: [2, 4, 7], dcSleep: [8, 12, 20],
        timeZone: ['Eastern Standard Time', 'Central Standard Time', 'Mountain Standard Time',
                   'US Mountain Standard Time'],
        startupCandidates: ['ZoomLauncher', 'SpotifyWebHelper', 'AcroTray', 'LogiOptions',
                            'DropboxUpdate', 'SkypeBridge'],
        pagefileMB: [4096, 6144, 8192],
        consumerApp: ['Microsoft.BingNews', 'Microsoft.GamingApp', 'Clipchamp.Clipchamp',
                      'Microsoft.MicrosoftSolitaireCollection'],
        defenderExclusion: ['D:\\LedgerSync\\Cache', 'C:\\ProgramData\\LedgerSync\\Spool',
                            'D:\\LedgerSync\\Import'],
        archiveFiles: ['ledger-2024-q1.bak', 'ledger-2024-q2.bak', 'vendors.csv', 'audit-trail.log',
                       'payroll-export.zip', 'fx-rates.xlsx']
    });

    var RESILIENCY_PROSE = freeze({
        'Simple': 'The pooled volume holds re-generable export scratch; capacity matters more than redundancy.',
        'Two-way mirror': 'The pooled volume holds the only copy of staged ledgers; it must survive the loss of one disk.'
    });

    /* Free space D: needs: share plus confidential folder plus margin (13.2 item 2). */
    var D_MIN_GB = 10;
    /* EFI + MSR + recovery partitions on a GPT install, rounded up. */
    var SYSTEM_OVERHEAD_GB = 1;

    var PRODUCT_KEY_ALPHABET = 'BCDFGHJKMPQRTVWXY2346789';

    /* ═══ HELPERS ══════════════════════════════════════════════════════════════════════════════ */

    /* JSON round-trip clone: the result shares nothing with module constants. */
    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    /* A 25-character product key in five dash-separated groups, from the visible stream. */
    function productKey(rng) {
        var groups = [];
        for (var g = 0; g < 5; g++) {
            var s = '';
            for (var c = 0; c < 5; c++) { s += PRODUCT_KEY_ALPHABET[rng.int(0, PRODUCT_KEY_ALPHABET.length - 1)]; }
            groups.push(s);
        }
        return groups.join('-');
    }

    /* `count` distinct picks from `arr`, in drawn order. */
    function pickDistinct(rng, arr, count) { return rng.shuffle(arr).slice(0, count); }

    /* Refuses anything but a non-empty string uid and an allowlisted exam id, so 1 and "1", or
     * undefined and "undefined", can never name the same sitting (Mallory D1 R1). The callable
     * resolves the id first; this is the engine's own guard behind it. */
    function checkIdentity(uid, examId) {
        if (typeof uid !== 'string' || uid.length === 0 || uid.length > 128) {
            throw new Error('mdfinal-core: uid must be a non-empty string');
        }
        if (typeof examId !== 'string' || EXAMS.EXAM_IDS.indexOf(examId) < 0) {
            throw new Error('mdfinal-core: unknown examId');
        }
    }

    /* All hidden picks for one sitting, each its own HMAC label (R1). */
    function hiddenPicks(K, uid, examId) {
        return {
            profileIndex: DERIVE.hidden(K, uid, examId, 'profile', PROFILES.length),
            variantIndex: DERIVE.hidden(K, uid, examId, 'fault', VARIANTS.length),
            faultKb: KB_RANGE_B[0] + DERIVE.hidden(K, uid, examId, 'fault-kb', KB_RANGE_B[1] - KB_RANGE_B[0] + 1),
            driverOem: DRIVER_OEM_RANGE[0] +
                DERIVE.hidden(K, uid, examId, 'fault-driver', DRIVER_OEM_RANGE[1] - DRIVER_OEM_RANGE[0] + 1),
            /* RFC 5737 TEST-NET-2: never a real host. */
            decoyIp: '198.51.100.' + (10 + DERIVE.hidden(K, uid, examId, 'fault-decoy-ip', 241))
        };
    }

    /* The IP plan for one sitting: 10.x.y.0/prefix with the PC, gateway, DNS and KMS inside it. */
    function ipPlan(rng, profile) {
        var prefix = rng.pick(SETS.prefix);
        var x = rng.int(16, 250);
        var y = rng.int(0, 255);
        if (prefix === 23) { y -= y % 2; }
        var base = NF.ip.toInt('10.' + x + '.' + y + '.0');
        if (prefix === 25 && rng.int(0, 1) === 1) { base += 128; }
        var at = function (off) { return NF.ip.toStr(base + off); };
        var plan = {
            ip: at(rng.int(30, 120)), prefix: prefix, mask: NF.ip.prefixToMask(prefix),
            gateway: at(1),
            dns: profile.joinType === 'domain' ? [at(10), at(11)] : [at(5), at(6)],
            dnsNames: profile.joinType === 'domain' ? ['DC1.' + DOMAIN_FQDN, 'DC2.' + DOMAIN_FQDN] : null
        };
        if (profile.channel === 'KMS') { plan.kms = { ip: at(12), fqdn: 'kms01.' + DOMAIN_FQDN }; }
        /* Remote subnet for the LedgerSync rule: a different /24 in 10.0.0.0/8. */
        var rx = x === 250 ? 249 : x + 1;
        plan.lobRemoteSubnet = '10.' + rx + '.' + rng.int(0, 255) + '.0/24';
        return plan;
    }

    /* ═══ THE WORK ORDER AND INITIAL STATE ════════════════════════════════════════════════════ */

    /* Builds the full sitting from the hidden picks and the visible stream. Internal: callers use
     * generate() and buildAnswerKey(), which each return a fresh clone of their half. */
    function draft(uid, examId, K, force) {
        checkIdentity(uid, examId);
        var h = hiddenPicks(K, uid, examId);
        if (force) {
            if (force.profileIndex !== undefined) { h.profileIndex = force.profileIndex; }
            if (force.variantIndex !== undefined) { h.variantIndex = force.variantIndex; }
        }
        var profile = PROFILES[h.profileIndex];
        var rng = DERIVE.visibleStream(K, uid, examId, 'wo');

        var vhdxGB = rng.pick(SETS.vhdxGB);
        var cChoices = SETS.cGB.filter(function (c) { return vhdxGB - SYSTEM_OVERHEAD_GB - c >= D_MIN_GB; });
        var cGB = rng.pick(cChoices);

        var people = pickDistinct(rng, SETS.firstNames, 2);
        var surnames = pickDistinct(rng, SETS.lastNames, 2);
        var userName = (people[0][0] + surnames[0]).toLowerCase();
        var memberName = (people[1][0] + surnames[1]).toLowerCase();

        var activeStart = rng.pick(SETS.activeStart);
        var candidates = pickDistinct(rng, SETS.startupCandidates, 4);
        var archiveFiles = pickDistinct(rng, SETS.archiveFiles, 4).map(function (f) {
            return { name: f, bytes: rng.int(40000, 900000) };
        });
        var lobHost = rng.pick(SETS.lobHost);
        var shareName = rng.pick(SETS.shareName);

        var wo = {
            ticket: 'WO-' + rng.int(40000, 49999),
            requirements: profile.requirements.slice(),
            editionRule: EDITION_RULE,
            hostname: 'MERWS-' + rng.int(100, 999),
            technician: 'mertech' + rng.int(10, 99),
            user: { name: userName, fullName: people[0] + ' ' + surnames[0] },
            secondMember: { name: memberName, fullName: people[1] + ' ' + surnames[1] },
            group: rng.pick(SETS.groupName),
            join: profile.joinType === 'domain'
                ? { type: 'domain', domain: DOMAIN_FQDN, joinAccount: 'MERIDIAN\\svc-wsjoin' }
                : { type: 'workgroup', workgroup: rng.pick(SETS.workgroup) },
            network: ipPlan(rng, profile),
            vm: { startupMemoryMB: rng.pick(SETS.ramMB), dynamicMemory: false, vcpu: rng.pick(SETS.vcpu),
                  vhdxGB: vhdxGB },
            disks: {
                cGB: cGB,
                archiveGB: rng.pick(SETS.archiveGB),
                archiveManifest: archiveFiles,
                poolGB: rng.pick(SETS.poolGB),
                archiveAtLocation0: rng.int(0, 1) === 1,
                dLabel: rng.pick(SETS.dLabel),
                spacesLabel: rng.pick(SETS.spacesLabel),
                spacesLetter: rng.pick(SETS.spacesLetter),
                resiliencyProse: null
            },
            lob: { name: 'LedgerSync', port: rng.pick(SETS.lobPort), host: lobHost,
                   fqdn: lobHost.toLowerCase() + '.' + DOMAIN_FQDN },
            share: { name: shareName, path: 'D:\\Shares\\' + shareName },
            confidentialPath: 'D:\\' + rng.pick(SETS.confidential),
            updates: {
                cumulativeKb: 'KB' + (KB_RANGE_A[0] + rng.int(0, KB_RANGE_A[1] - KB_RANGE_A[0])),
                featureDeferralDays: rng.pick(SETS.featureDeferral),
                qualityDeferralDays: rng.pick(SETS.qualityDeferral),
                activeHours: { start: activeStart, end: activeStart + rng.pick(SETS.activeLength) }
            },
            power: { planName: 'Meridian Desk',
                     acDisplayMin: rng.pick(SETS.acDisplay), acSleepMin: rng.pick(SETS.acSleep),
                     dcDisplayMin: rng.pick(SETS.dcDisplay), dcSleepMin: rng.pick(SETS.dcSleep) },
            timeZone: rng.pick(SETS.timeZone),
            performance: { startupCandidates: candidates, highImpact: pickDistinct(rng, candidates, 2),
                           pagefileMB: rng.pick(SETS.pagefileMB) },
            consumerApp: rng.pick(SETS.consumerApp),
            defenderExclusion: rng.pick(SETS.defenderExclusion),
            privacy: { location: false, findMyDevice: false, diagnosticData: 'Required', inking: false,
                       tailored: false, advertisingId: false },
            /* Both keys printed for every profile: the MAK is the right one only for the contractor
             * PC, and the retail COA (the sticker on the box) is never right. */
            mak: productKey(rng),
            retailCoa: productKey(rng),
            build: { version: PINNED_BUILD.version, build: PINNED_BUILD.build }
        };
        var resiliency = rng.pick(SETS.resiliency);
        wo.disks.resiliencyProse = RESILIENCY_PROSE[resiliency];
        /* Manifest hashes: keyed, and drawn from no visible stream, so they shift nothing. */
        wo.disks.archiveManifest.forEach(function (f, i) {
            f.sha256 = DERIVE.hiddenHex(K, uid, examId, 'archive-hash#' + i, 64);
        });
        /* D2 onward: each later section draws from its own sub-stream, e.g.
         * DERIVE.visibleStream(K, uid, examId, 'd2'), APPENDED here and never interleaved above. */

        var state = {
            meta: { studentId: String(uid), examId: String(examId), generatorVersion: GENERATOR_VERSION },
            wo: wo,
            host: {
                isoLibrary: ['Win10_22H2_x64.iso', 'Win11_24H2_Consumer_x64.iso', 'Win11_24H2_Business_x64.iso'],
                switches: [{ name: 'Meridian-LAN', type: 'External' }, { name: 'Default Switch', type: 'Internal' }],
                fabricDisks: [
                    { file: 'MER-ARCHIVE.vhdx', gb: wo.disks.archiveGB, partitioned: true, letter: 'E', label: 'MER-ARCHIVE' },
                    { file: 'MER-POOL1.vhdx', gb: wo.disks.poolGB, partitioned: false },
                    { file: 'MER-POOL2.vhdx', gb: wo.disks.poolGB, partitioned: false },
                    { file: 'TECH-USB.vhdx', gb: 8, partitioned: true, letter: 'F', label: 'TECH-USB' }
                ],
                usb: { F: { label: 'TECH-USB', files: [] } },
                labFiles: []
            },
            vm: null, disks: null, setup: null, os: null,
            identity: null, network: null, security: null, apps: null,
            ledger: [], events: [], eventlog: [], answers: {}, regScratch: {}
        };

        var key = {
            version: GENERATOR_VERSION,
            profile: profile.id,
            edition: profile.edition,
            channel: profile.channel,
            productKey: profile.channel === 'KMS' ? GVLK[profile.edition] : wo.mak,
            resiliency: resiliency,
            technician: wo.technician,
            variant: VARIANTS[h.variantIndex],
            fault: { kb: 'KB' + h.faultKb, driverInf: 'oem' + h.driverOem + '.inf', decoyIp: h.decoyIp },
            wo: wo
        };
        return { state: state, key: key };
    }

    /* The initial state for one sitting. `opts.secret` is the bound seed secret; it fails closed. */
    function generate(uid, examId, opts) {
        var K = DERIVE.deriveKey(opts && opts.secret);
        return clone(draft(uid, examId, K, null).state);
    }

    /* The frozen answer key (D1 minimum, 13.3): WO values, derived edition and channel, the correct
     * key, resiliency, profile, variant, technician name. D5 adds fault evidence and ladders. */
    function buildAnswerKey(uid, examId, opts) {
        var K = DERIVE.deriveKey(opts && opts.secret);
        return freeze(clone(draft(uid, examId, K, null).key));
    }

    /* TEST AND --qc ONLY (index.js must never reference it; D6 adds the grep test): one sitting with the profile and variant forced, so all 12 classes are
     * exercised. No callable reaches this; the index block calls generate() and buildAnswerKey(). */
    function generateForced(uid, examId, opts, profileIndex, variantIndex) {
        var K = DERIVE.deriveKey(opts && opts.secret);
        var d = draft(uid, examId, K, { profileIndex: profileIndex, variantIndex: variantIndex });
        return { state: clone(d.state), key: freeze(clone(d.key)) };
    }

    /* The 12 forced classes, profile-major. */
    function variantSpace() {
        var out = [];
        for (var p = 0; p < PROFILES.length; p++) {
            for (var v = 0; v < VARIANTS.length; v++) {
                out.push({ profileIndex: p, profile: PROFILES[p].label, variantIndex: v, variant: VARIANTS[v] });
            }
        }
        return out;
    }

    module.exports = {
        GENERATOR_VERSION: GENERATOR_VERSION, PROFILES: PROFILES, VARIANTS: VARIANTS, GVLK: GVLK,
        SETS: SETS, KB_RANGE_A: KB_RANGE_A, KB_RANGE_B: KB_RANGE_B, DRIVER_OEM_RANGE: DRIVER_OEM_RANGE,
        PINNED_BUILD: PINNED_BUILD, DOMAIN_FQDN: DOMAIN_FQDN, D_MIN_GB: D_MIN_GB,
        SYSTEM_OVERHEAD_GB: SYSTEM_OVERHEAD_GB, EDITION_RULE: EDITION_RULE,
        SIM_DEFAULTS: PC.SIM_DEFAULTS,
        generate: generate, buildAnswerKey: buildAnswerKey, generateForced: generateForced,
        variantSpace: variantSpace,
        own: NF.own, setOwn: NF.setOwn, makeRng: DERIVE.makeRng, ip: NF.ip
    };
})();
