// Deterministic unit test for TrophyCabinet.buildModel() — the tier/set/Platinum/
// level logic — using INJECTED mock sources (opts.core / opts.obs), so no browser
// or real AchievementRegistry boot is needed. Loads the browser IIFE via a
// Function wrapper that supplies a fake `window`.
//
// This test encodes the UNIFIED secret/pending model (post Nancy review):
//   - pending = not earnable yet → excluded from the count AND keeps Platinum locked.
//   - secret  = earnable now (masked until earned) → counts, required for Platinum.
// The two regression cases it exists to prevent:
//   #1 an all-secret set could never reach 100%/Platinum (false negative).
//   #2 the header "N/M" used a different population than the % → "2/5 · 100%".
const fs = require('fs');
const path = require('path');

const win = {};
new Function('window', fs.readFileSync(path.resolve(__dirname, '../_app/components/TrophyCabinet.js'), 'utf8'))(win);
const TC = win.TrophyCabinet;

// Mock CORE (shape of AchievementRegistry). sandbox_first_boot is a legacy id that
// ALSO appears in the obs defs below — it must be DEDUPED out of core. 'vault' is an
// all-secret set (both secret) used to prove #1. 'security' mixes secret + normal.
const core = {
    getAllDefinitions: () => [
        { id: 'a1', name: 'A1', description: 'ten', points: 10, category: 'foundations', secret: false },
        { id: 'a2', name: 'A2', description: 'onetwenty', points: 120, category: 'foundations', secret: false },
        { id: 'a3', name: 'A3', description: 'secret gold', points: 300, category: 'security', secret: true },
        { id: 'a4', name: 'A4', description: 'nonsecret gold', points: 250, category: 'security', secret: false },
        { id: 'v1', name: 'V1', description: 'secret', points: 50, category: 'vault', secret: true },
        { id: 'v2', name: 'V2', description: 'secret', points: 60, category: 'vault', secret: true },
        { id: 'sandbox_first_boot', name: 'First Boot (core)', description: 'dupe', points: 10, category: 'general', secret: false },
    ],
    getUnlockedIds: () => ['a1', 'a3', 'a4', 'v1', 'v2'],   // a2 not earned; both vault secrets earned
};

// Mock OBS (shape of ObservatoryBadges): earned() controllable via a set.
const obsEarned = { sandbox_first_boot: true, obs_first_mission: true };
const obs = {
    DEFS: [
        { id: 'sandbox_first_boot', legacy: true, name: 'First Boot', desc: 'launch', art: 'first_visit', pts: 10 },
        { id: 'obs_first_mission', name: 'First Blood', desc: 'first mission', art: 'first_blood', pts: 25 },
        { id: 'obs_mission_18', name: 'Command Master', desc: 'all 18', art: 'cli_master', pts: 500, style: 'legendary' },
        { id: 'obs_lab_git', name: 'Git', desc: 'pending', art: 'code_git_guru', pts: 150, pending: true },
    ],
    readProgress: () => ({ obsBadges: { obs_first_mission: { earnedAt: 1 } } }),
    earned: (def, prog) => def.legacy ? !!obsEarned[def.id] : !!(prog && prog.obsBadges && prog.obsBadges[def.id]),
};

const m = TC.buildModel({ core, obs });

// ── assertions ──
const checks = {};
const sandbox = m.sets.find(s => s.id === 'sandbox');
const foundations = m.sets.find(s => s.id === 'foundations');
const security = m.sets.find(s => s.id === 'security');
const vault = m.sets.find(s => s.id === 'vault');
const general = m.sets.find(s => s.id === 'general');

// 1. Dedup: sandbox_first_boot only in the sandbox set, never a core set.
checks.dedup_no_core_general = !general || !general.badges.some(b => b.id === 'sandbox_first_boot');
checks.dedup_in_sandbox = !!sandbox && sandbox.badges.some(b => b.id === 'sandbox_first_boot');

// 2. Sandbox set holds all 4 obs defs (legacy + pending tiles are shown).
checks.sandbox_has_all_obs = !!sandbox && sandbox.badges.length === 4;

// 3. Tiers by points.
const tierOf = id => { for (const s of m.sets) { const b = s.badges.find(x => x.id === id); if (b) return b.tier; } return null; };
checks.tier_a1_bronze = tierOf('a1') === 'bronze';       // 10
checks.tier_a2_silver = tierOf('a2') === 'silver';       // 120
checks.tier_a4_gold = tierOf('a4') === 'gold';           // 250
checks.tier_obs_first_bronze = tierOf('obs_first_mission') === 'bronze';  // 25
checks.tier_obs18_gold = tierOf('obs_mission_18') === 'gold';             // 500/legendary

// 4. Platinum — secrets now COUNT and are required.
//    security: a3(secret,earned) + a4(earned), no pending → PLATINUM.
checks.security_platinum = !!security && security.platinum === true;
//    foundations: a1(earned) + a2(not) → NO platinum.
checks.foundations_no_platinum = !!foundations && foundations.platinum === false;
//    sandbox: obs_mission_18 not earned AND has a pending badge → NO platinum.
checks.sandbox_no_platinum = !!sandbox && sandbox.platinum === false;

// 5. #1 FIX — an all-secret set is completable: vault (2 secret, both earned) → PLATINUM at 100%.
checks.allsecret_platinum = !!vault && vault.platinum === true;
checks.allsecret_100pct = !!vault && vault.pctComplete === 100 && vault.total === 2 && vault.earned === 2;

// 6. #2 FIX — header count and percentage share ONE population, for EVERY set.
//    (This is the assertion that would have caught "2/5 · 100%".)
checks.header_matches_pct = m.sets.every(s => s.pctComplete === (s.total ? Math.round((s.earned / s.total) * 100) : 0));

// 7. Population accounting.
checks.security_earnable_includes_secret = !!security && security.eligibleTotal === 2;   // secret a3 now counts
checks.sandbox_earnable_excludes_pending = !!sandbox && sandbox.eligibleTotal === 3;      // git pending not counted
checks.sandbox_pending_count = !!sandbox && sandbox.pendingCount === 1;

// 8. Profile roll-up.
checks.profile_level_above_1 = m.profile.level > 1;
checks.profile_platinum_count = m.profile.tierCounts.platinum === 2;   // security + vault
checks.profile_totalBadges_excludes_pending = m.profile.totalBadges === (m.sets.reduce((n, s) => n + s.badges.filter(b => !b.pending).length, 0));

const pass = Object.values(checks).every(Boolean);
console.log('\n  TrophyCabinet.buildModel() unit test — unified secret/pending model\n');
for (const [k, v] of Object.entries(checks)) console.log('    ' + (v ? 'PASS' : 'FAIL') + '  ' + k);
console.log('\n  sets: ' + m.sets.map(s => s.id + '(' + s.earned + '/' + s.total + (s.pendingCount ? '+' + s.pendingCount : '') + (s.platinum ? ',PLAT' : '') + ')').join('  '));
console.log('  profile: level ' + m.profile.level + ', ' + m.profile.totalEarned + '/' + m.profile.totalBadges + ' (' + m.profile.pctComplete + '%), tiers ' + JSON.stringify(m.profile.tierCounts));
console.log('\n  ' + (pass ? 'ALL GREEN' : 'FAILURES ABOVE') + '\n');
process.exit(pass ? 0 : 1);
