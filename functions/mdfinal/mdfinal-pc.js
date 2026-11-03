/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-pc.js — the simulated PC: defaults now, boot and config model from D2.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 2.2, 3.2, 13.2 item 2.
 *
 * D1 SCOPE: SIM_DEFAULTS only. This is what a student gets by accepting every default (the Hyper-V
 * New Virtual Machine wizard, Setup, OOBE, a fresh Windows 11 desktop). It exists for two readers:
 *   - the generator invariant test: no WO target may equal the default for that setting, or a
 *     student scores a point for doing nothing (spec 3.2);
 *   - defaultInstalledState() at D2, which is built FROM these values so the two cannot drift.
 * Where Windows has shipped more than one default across builds (power timeouts moved between
 * releases), every value seen is listed, and the generator avoids all of them.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');

    var SIM_DEFAULTS = LIM.deepFreeze({
        /* Hyper-V New Virtual Machine wizard */
        /* startupMemoryMB lists every wizard default seen across Hyper-V versions (1024 MB in the
         * New Virtual Machine wizard, 4096 MB in Quick Create); the WO avoids all of them. */
        vm: { generation: 1, startupMemoryMB: [1024, 2048, 4096], dynamicMemory: true, vcpu: 1, vhdxGB: 127,
              vtpm: false, secureBoot: true },
        /* Windows 11 after OOBE */
        hostnamePattern: '^DESKTOP-[A-Z0-9]{7}$',
        timeZone: 'Pacific Standard Time',
        workgroup: 'WORKGROUP',
        network: { dhcp: true, dhcpSubnet: '172.25.48.0/20', category: 'Public' },
        rdpEnabled: false,
        privacy: { location: true, findMyDevice: true, diagnosticData: 'Optional', inking: true,
                   tailored: true, advertisingId: true },
        power: {
            activePlan: 'Balanced',
            acDisplayMin: [5, 10, 15], acSleepMin: [15, 30],
            dcDisplayMin: [3, 5], dcSleepMin: [5, 10, 15]
        },
        uac: { ConsentPromptBehaviorAdmin: 5, PromptOnSecureDesktop: 1, EnableLUA: 1 },
        updates: { featureDeferralDays: 0, qualityDeferralDays: 0, activeHours: { start: 8, end: 17 } },
        pagefile: { automatic: true },
        defender: { exclusions: [] },
        bitlockerMethod: 'XTS-AES 128'
    });

    module.exports = { SIM_DEFAULTS: SIM_DEFAULTS };
})();
