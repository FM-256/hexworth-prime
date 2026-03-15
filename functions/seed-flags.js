/**
 * Seed script — populates flag_registry in Firestore for all arena + dispatch boxes
 * so the validateFlag Cloud Function can verify submissions server-side.
 *
 * Usage:  node seed-flags.js
 * Uses Firebase Admin with project ID from .firebaserc
 *
 * IMPORTANT: After running this, the flag values in box config.js files
 * become redundant. SEC-2 will strip them from the client.
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

const FLAG_REGISTRY = {
    'a1-ancient-ledger': {
        user: 'flag{4nc13nt_l3dg3r_sql1_d1sc0v3r3d}',
        root: 'flag{st3ll4r_f0rg3_4ll0c4t10n_c0d3s}'
    },
    'a2-whispering-wall': {
        user: 'flag{wh1sp3r1ng_w4ll_x55_r3fl3ct3d}',
        root: 'flag{0bs1d14n_h4nd_s3rv3r_c0mpr0m1s3d}'
    },
    'a3-phantom-shell': {
        user: 'flag{ph4nt0m_sh3ll_1nj3ct10n_d1sc0v3r3d}',
        root: 'flag{1r0n_b4st10n_r00t_c0mpr0m1s3d}'
    },
    'a4-lost-root': {
        user: 'flag{c1t4d3l_m41nt_4cc3ss_gr4nt3d}',
        root: 'flag{l0st_r00t_pr1v3sc_c0mpl3t3}'
    },
    'a5-custodians-key': {
        user: 'flag{cust0d14n_b4ckup_4cc3ss}',
        root: 'flag{cust0d14ns_k3y_syst3m_0wn3d}'
    },
    'a6-broken-cipher': {
        user: 'flag{s1l3nt_0rd3r_cr4ck3d_c1ph3r}',
        root: 'flag{br0k3n_c1ph3r_v4ult_m4st3r}'
    },
    'a7-hollow-database': {
        user: 'flag{h0ll0w_db_n0sql_byp4ss}',
        root: 'flag{v01d_c0ll3ct1v3_m4st3r_k3y}'
    },
    'a8-forgotten-upload': {
        user: 'flag{4sh3n_4rch1v3_upl04d_byp4ss}',
        root: 'flag{4sh3n_r00t_f1nd_pr1v3sc}'
    },
    'a9-rusted-lock': {
        user: 'flag{rust3d_l0ck_d3s3r14l1z3d}',
        root: 'flag{f0rg3_r3mn4nts_rc3_m4st3r}'
    },
    'a10-glass-tunnel': {
        user: 'flag{gl4ss_tunn3l_ssrf_1nt3rn4l}',
        root: 'flag{gl4ss_c0rr1d0r_r3d1s_r00t}'
    },
    'a11-dockerized-vault': {
        user: 'flag{d0ck3r_s0ck3t_3xp0s3d_v4ult}',
        root: 'flag{c0nt41n3r_3sc4p3_m4st3r_m4n1f3st}'
    },
    'a12-mobile-scapegoat': {
        user: 'flag{v0y4g3r_h4rdc0d3d_4p1_k3y}',
        root: 'flag{n0m4d_m4n1f3st_c0nt3nt_pr0v1d3r}'
    },
    'a13-rogue-sensor': {
        user: 'flag{s3ns0r_n0d3_d3f4ult_cr3ds}',
        root: 'flag{b10_m4n1f3st_p1v0t_succ3ss}'
    },
    'a14-ghost-machine': {
        user: 'flag{gh0st_p3rs1st3nc3_ld_pr3l04d}',
        root: 'flag{v4ngu4rd_0p3r4t10n4l_m4nd4t3}'
    },
    'a15-spectral-interceptor': {
        user: 'flag{gfsk_4800_b4ud_nrz_pr0t0c0l}',
        root: 'flag{c0ur13r_m4n1f3st_d3c0d3d}'
    },
    'a16-corrupted-core': {
        user: 'flag{cr1ms0n_gh0st_c2_192_168_13_37}',
        root: 'flag{gh0st_pr0t0c0l_d3crypt10n_k3y}'
    },
    'a17-whisper-campaign': {
        user: 'flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}',
        root: 'flag{wh1sp3r_c0d3_f1n4l_m4n1f3st}'
    },
    'a18-ghost-ram': {
        user: 'flag{chr0n0s_c2_10_13_37_100}',
        root: 'flag{1nt3l_br13f1ng_chr0n0s_d3f34t3d}'
    },
    'a19-foundations-fault': {
        user: 'flag{k3rn3l_5_4_0_58_g3n3r1c}',
        root: 'flag{c1t4d3l_blu3pr1nt_k3rn3l_pwn3d}'
    },
    'a20-project-chimera': {
        user: 'flag{g3n3s1s_supply_ch41n_l1bcor3}',
        root: 'flag{gl0b4l_d0m1n4t10n_pr0t0c0l}'
    },

    // ── Dispatch Boxes ──

    'nt1-network-troubleshoot': {
        dns_poisoned: 'flag{cach3_p01s0n_cl34r3d}',
        disabled_adapter: 'flag{4d4pt3r_0nl1n3}',
        firewall_block: 'flag{f1r3w4ll_rul3_d1s4bl3d}',
        wrong_subnet: 'flag{subn3t_r34l1gn3d}',
        dhcp_stopped: 'flag{dhcp_s3rv1c3_r3st0r3d}'
    },
    'os001-boot-failure': {
        corrupted_bcd: 'FLAG{bcd_rebuilt}',
        bad_driver: 'FLAG{driver_rolled_back}',
        stuck_update: 'FLAG{update_reverted}',
        disk_corruption: 'FLAG{disk_repaired}',
        missing_bootloader: 'FLAG{bootloader_restored}'
    },
    'hw001-dead-workstation': {
        unseated_ram: 'FLAG{ram_reseated}',
        dead_gpu: 'FLAG{gpu_replaced}',
        failed_psu: 'FLAG{psu_replaced}',
        cpu_overheat: 'FLAG{thermal_restored}',
        bad_sata: 'FLAG{cable_replaced}'
    },
    'ad001-lockout-storm': {
        stale_creds: 'flag{st4l3_cr3d_f0und}',
        expired_svc: 'flag{svc_4cc0unt_r3n3w3d}',
        brute_force: 'flag{brut3_f0rc3_bl0ck3d}',
        gpo_misconfig: 'flag{gp0_p0l1cy_f1x3d}',
        rogue_task: 'flag{r0gu3_t4sk_k1ll3d}'
    },
    'pr001-printer-nightmare': {
        spooler_crash: 'FLAG{spooler_resurrected}',
        wrong_driver: 'FLAG{driver_corrected}',
        ip_changed: 'FLAG{port_repointed}',
        perms_denied: 'FLAG{access_granted}',
        stuck_queue: 'FLAG{queue_cleared}'
    }
};

// Dispatch boxes use scenario-based flags (multiple scenario IDs map to one config flag ID).
// The aliases tell validateFlag to return the config flag ID so the client can match it.
const DISPATCH_ALIASES = {
    'nt1-network-troubleshoot': {
        configFlagId: 'fixed',
        scenarioIds: ['dns_poisoned', 'disabled_adapter', 'firewall_block', 'wrong_subnet', 'dhcp_stopped']
    },
    'os001-boot-failure': {
        configFlagId: 'repaired',
        scenarioIds: ['corrupted_bcd', 'bad_driver', 'stuck_update', 'disk_corruption', 'missing_bootloader']
    },
    'hw001-dead-workstation': {
        configFlagId: 'repaired',
        scenarioIds: ['unseated_ram', 'dead_gpu', 'failed_psu', 'cpu_overheat', 'bad_sata']
    },
    'ad001-lockout-storm': {
        configFlagId: 'fixed',
        scenarioIds: ['stale_creds', 'expired_svc', 'brute_force', 'gpo_misconfig', 'rogue_task']
    },
    'pr001-printer-nightmare': {
        configFlagId: 'fixed',
        scenarioIds: ['spooler_crash', 'wrong_driver', 'ip_changed', 'perms_denied', 'stuck_queue']
    }
};

async function seed() {
    const batch = db.batch();
    let count = 0;

    for (const [boxId, flags] of Object.entries(FLAG_REGISTRY)) {
        const docData = { flags };

        // Add aliases for dispatch boxes
        const aliasConfig = DISPATCH_ALIASES[boxId];
        if (aliasConfig) {
            const aliases = {};
            for (const sid of aliasConfig.scenarioIds) {
                aliases[sid] = aliasConfig.configFlagId;
            }
            docData.aliases = aliases;
        }

        batch.set(db.doc(`flag_registry/${boxId}`), docData, { merge: true });
        count++;
    }

    await batch.commit();
    console.log(`Seeded flag_registry for ${count} boxes (${Object.keys(DISPATCH_ALIASES).length} with aliases)`);
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
