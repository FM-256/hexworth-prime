#!/usr/bin/env node
'use strict';
// Phase 3 + 4 — Placement Recommender (Stragglers branch, 2026-04-30)
//
// Reads ORPHAN_CLUSTER_MATRIX.json + STRICT_ORPHAN_MAP.json and produces
// per-cluster placement recommendations:
//
//   - Match each cluster to an existing curated hub (preferred), OR
//   - Propose a new dedicated hub (when sufficient module mass + clear scope), OR
//   - Propose an incubation hub (for early-stage / heterogeneous clusters)
//
// Placement targets follow the platform convention:
//   _app/houses/<house>/<sub-area>/index.html
//
// Output:
//   _tools/reports/PLACEMENT_RECOMMENDATIONS.json
//   _tools/reports/PLACEMENT_RECOMMENDATIONS.md  (operator-readable plan)

const fs = require('fs');
const path = require('path');

const MATRIX_PATH = path.resolve(__dirname, '../reports/ORPHAN_CLUSTER_MATRIX.json');
const STRICT_PATH = path.resolve(__dirname, '../reports/STRICT_ORPHAN_MAP.json');
const OUT_JSON = path.resolve(__dirname, '../reports/PLACEMENT_RECOMMENDATIONS.json');
const OUT_MD = path.resolve(__dirname, '../reports/PLACEMENT_RECOMMENDATIONS.md');

// ── Hub matching rules ──
// Maps cluster signature → existing hub path. Order matters (most specific first).
//
// Key: { housePrefix?, idPrefix?, signalPattern? }
// Value: { targetHub: relPath, mechanism: 'data-module'|'inline-id'|'learning-path', notes }
const HUB_RULES = [
    // ──── CERT HUBS (existing) ────
    { match: { signalIncludes: 'A+ Core 1' }, target: 'houses/aplus-core1/index.html', mech: 'learning-path', notes: 'Existing A+ Core 1 cert hub' },
    { match: { signalIncludes: 'A+ Core 2' }, target: 'houses/aplus-core2/index.html', mech: 'learning-path', notes: 'Existing A+ Core 2 cert hub' },
    { match: { signalIncludes: 'CySA+' }, target: 'houses/cysa-plus/index.html', mech: 'learning-path', notes: 'Existing CySA+ cert hub' },
    { match: { signalIncludes: 'Security+' }, target: 'houses/security-plus/index.html', mech: 'learning-path', notes: 'Existing Sec+ cert hub' },
    { match: { signalIncludes: 'Network+' }, target: 'houses/comptia-network/index.html', mech: 'learning-path', notes: 'Existing Net+ cert hub' },
    { match: { signalIncludes: 'Linux+' }, target: 'houses/comptia-linux/index.html', mech: 'learning-path', notes: 'Existing Linux+ cert hub' },
    { match: { signalIncludes: 'CASP+' }, target: 'houses/casp-plus/index.html', mech: 'learning-path', notes: 'Existing CASP+ cert hub' },
    { match: { signalIncludes: 'CCNA' }, target: 'houses/ccna/index.html', mech: 'learning-path', notes: 'Existing CCNA cert hub (top-level)' },
    { match: { signalIncludes: 'AZ-900' }, target: 'houses/cloud/az-900/index.html', mech: 'data-module', notes: 'Existing AZ-900 cert hub (cloud)' },
    { match: { signalIncludes: 'AZ-104' }, target: 'houses/cloud/az-104/index.html', mech: 'data-module', notes: 'Existing AZ-104 cert hub' },
    { match: { signalIncludes: 'MS-900' }, target: 'houses/cloud/ms-900/index.html', mech: 'data-module', notes: 'Existing MS-900 cert hub' },
    { match: { signalIncludes: 'MS-102' }, target: 'houses/cloud/ms-102/index.html', mech: 'data-module', notes: 'Existing MS-102 cert hub' },
    { match: { signalIncludes: 'AI-900' }, target: 'houses/ai/ai-900/index.html', mech: 'data-module', notes: 'Existing AI-900 cert hub' },
    { match: { signalIncludes: 'PL-300' }, target: 'houses/cloud/pl-300/index.html', mech: 'data-module', notes: 'Existing PL-300 cert hub' },
    { match: { signalIncludes: 'SC-200' }, target: 'houses/shield/sc-200/index.html', mech: 'data-module', notes: 'Existing SC-200 cert hub' },
    { match: { signalIncludes: 'SC-900' }, target: 'houses/shield/sc-900/index.html', mech: 'data-module', notes: 'Existing SC-900 cert hub' },
    { match: { signalIncludes: 'AWS Cloud Practitioner' }, target: 'houses/aws-ccp/index.html', mech: 'data-module', notes: 'Existing AWS CCP cert hub' },
    { match: { signalIncludes: 'AWS Developer' }, target: 'houses/aws-developer/index.html', mech: 'data-module', notes: 'Existing AWS DVA cert hub' },
    { match: { signalIncludes: 'CHFI' }, target: 'houses/eye/forensics/certs/chfi/index.html', mech: 'data-module', notes: 'Existing CHFI cert hub (just shipped)' },
    { match: { signalIncludes: 'GCFA' }, target: 'houses/eye/forensics/certs/gcfa/index.html', mech: 'data-module', notes: 'Existing GCFA cert hub' },
    { match: { signalIncludes: 'GCFE' }, target: 'houses/eye/forensics/certs/gcfe/index.html', mech: 'data-module', notes: 'Existing GCFE cert hub' },
    { match: { signalIncludes: 'ISC2 CC' }, target: 'houses/shield/isc2-cc/index.html', mech: 'data-module', notes: 'Existing ISC2 CC hub' },
    { match: { signalIncludes: 'Server+' }, target: 'houses/cloud/server-plus/index.html', mech: 'data-module', notes: 'Existing Server+ cert hub' },
    { match: { signalIncludes: 'Cloud Security Engineer' }, target: 'houses/cloud/cse/index.html', mech: 'data-module', notes: 'Existing CSE cert hub' },

    // ──── COURSE HUBS (existing) ────
    { match: { idPrefix: 'clh-', house: 'script' }, target: 'houses/script/courses/clh/index.html', mech: 'inline-id', notes: 'Existing CLH course hub' },
    { match: { signalIncludes: 'CLH Terminal' }, target: 'houses/script/courses/clh/index.html', mech: 'inline-id', notes: 'Existing CLH course hub' },
    { match: { signalIncludes: 'Linux Ascent' }, target: 'houses/script/linux/index.html', mech: 'inline-id', notes: 'Existing Linux Administration course (la-)' },
    { match: { idPrefix: 'ra-', house: 'script' }, target: 'houses/script/linux/index.html', mech: 'inline-id', notes: 'Linux Ascent (ra-w*) — Linux course hub' },
    { match: { signalIncludes: 'Snake Pit' }, target: 'houses/code/python-programming/index.html', mech: 'inline-id', notes: 'Snake Pit / COP2891' },
    { match: { signalIncludes: 'Cloud Base' }, target: 'houses/cloud/cloud-essentials/index.html', mech: 'inline-id', notes: 'Cloud Base / CTS2145C' },
    { match: { signalIncludes: 'First Link' }, target: 'houses/web/intro-networks/index.html', mech: 'inline-id', notes: 'First Link / CTS1090C' },
    { match: { signalIncludes: 'First Watch' }, target: 'houses/shield/intro-security/index.html', mech: 'inline-id', notes: 'First Watch / CTS1120C' },
    { match: { signalIncludes: 'Bare Metal' }, target: 'houses/forge/hardware-support/index.html', mech: 'inline-id', notes: 'Bare Metal / CTS1150C' },
    { match: { signalIncludes: 'Server Room' }, target: 'houses/forge/server-management/index.html', mech: 'inline-id', notes: 'Server Room / CTS1328C' },
    { match: { signalIncludes: 'CIS2253' }, target: 'houses/divergent/cybersecurity-ethics/index.html', mech: 'inline-id', notes: 'CIS2253 Cybersecurity Ethics (currently divergent)' },
    { match: { signalIncludes: 'CIS4253' }, target: 'houses/divergent/ethics-it/index.html', mech: 'inline-id', notes: 'CIS4253 Ethics in IT' },
    { match: { signalIncludes: 'CIS2208' }, target: 'houses/divergent/cybersecurity-policy/index.html', mech: 'inline-id', notes: 'CIS2208 Cybersecurity Policy' },
    { match: { idPrefix: 'eth-', house: 'divergent' }, target: 'houses/divergent/ethics-it/index.html', mech: 'inline-id', notes: 'CIS4253 Ethics modules' },
    { match: { idPrefix: 'cse-', house: 'shield' }, target: 'houses/divergent/cybersecurity-ethics/index.html', mech: 'inline-id', notes: 'CIS2253 Cybersecurity Ethics — currently shield, belongs in divergent' },
    { match: { idPrefix: 'cse-', house: 'cloud' }, target: 'houses/cloud/cse/index.html', mech: 'data-module', notes: 'Cloud Security Engineer cert' },
    { match: { signalIncludes: 'Dark Arts Feh' }, target: 'houses/dark-arts/feh/index.html', mech: 'inline-id', notes: 'Existing Feh course hub' },
    { match: { idPrefix: 'feh-', house: 'dark-arts' }, target: 'houses/dark-arts/feh/index.html', mech: 'inline-id', notes: 'Feh course modules' },
    { match: { signalIncludes: 'CyberOps' }, target: 'houses/eye/modules/cyberops/index.html', mech: 'data-module', notes: 'Existing CyberOps course hub' },
    { match: { idPrefix: 'cyberops', house: 'eye' }, target: 'houses/eye/modules/cyberops/index.html', mech: 'data-module', notes: 'Existing CyberOps course' },
    { match: { signalIncludes: 'Wireshark (Eye)' }, target: 'houses/eye/index.html', mech: 'data-module', notes: 'Wireshark — eye house, no dedicated hub yet' },
    { match: { signalIncludes: 'Advanced Linux (Matrix)' }, target: 'houses/matrix/adv-linux/index.html', mech: 'inline-id', notes: 'Existing Adv Linux course (CTS4321C)' },
    { match: { idPrefix: 'ala-', house: 'matrix' }, target: 'houses/matrix/adv-linux/index.html', mech: 'inline-id', notes: 'Adv Linux Administration' },
    { match: { signalIncludes: 'Operator Missions' }, target: 'houses/matrix/index.html', mech: 'data-module', notes: 'Operator Missions — matrix landing' },
    { match: { idPrefix: 'op-', house: 'matrix' }, target: 'houses/matrix/protocore/index.html', mech: 'inline-id', notes: 'Op-* Python modules — Protocore (matrix)' },
    { match: { signalIncludes: 'PiVerse' }, target: 'houses/matrix/piverse/index.html', mech: 'data-module', notes: 'Existing PiVerse hub' },
    { match: { signalIncludes: 'Protocore' }, target: 'houses/matrix/protocore/index.html', mech: 'data-module', notes: 'Existing Protocore hub' },

    // ──── HOUSE-LEVEL FALLBACKS — for pure topic clusters ────
    { match: { signalIncludes: 'Cryptography', house: 'key' }, target: 'houses/cryptography-track/index.html', mech: 'data-module', notes: 'Cryptography track hub' },
    { match: { signalIncludes: 'Cryptography', house: 'shield' }, target: 'houses/security-plus-crypto/index.html', mech: 'data-module', notes: 'Sec+ Cryptography domain hub' },

    // ──── HOUSE-PREFIX RULES (forge cards) ────
    { match: { idPrefix: 'core1', house: 'forge' }, target: 'houses/aplus-core1/index.html', mech: 'learning-path', notes: 'A+ Core 1 (220-1101)' },
    { match: { idPrefix: 'core2', house: 'forge' }, target: 'houses/aplus-core2/index.html', mech: 'learning-path', notes: 'A+ Core 2 (220-1102)' },
    { match: { idPrefix: 'aplus', house: 'forge' }, target: 'houses/aplus-core1/index.html', mech: 'learning-path', notes: 'A+ generic (review against core1/core2 split)' },
    { match: { idPrefix: 'md100', house: 'forge' }, target: 'houses/forge/md-100/index.html', mech: 'data-module', notes: 'Existing MD-100 hub' },
    { match: { idPrefix: 'md101', house: 'forge' }, target: 'houses/forge/md-101/index.html', mech: 'data-module', notes: 'Existing MD-101 hub' },
    { match: { idPrefix: 'cysa', house: 'eye' }, target: 'houses/eye/cysa/index.html', mech: 'data-module', notes: 'Existing Eye CySA+ track' },

    // ──── PROPOSED NEW HUBS (do not yet exist; need scaffolding) ────
    { match: { idPrefix: 'arm-', house: 'code' }, target: 'NEW: houses/code/arm-assembly/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — ARM Assembly course hub. 160 modules across asm/bash/c/cpp/go/rust/etc. variants. Needs grouping by language and level.' },
    { match: { idPrefix: 'do-', house: 'code' }, target: 'NEW: houses/code/devops-foundations/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — DevOps Foundations course (do-7 .. do-N). Existing forge/devops/ may be related; verify.' },
    { match: { idPrefix: 'pfi-', house: 'code' }, target: 'houses/code/python-for-it/index.html', mech: 'data-module', notes: 'Existing PFI course hub — likely just needs data-module attrs added' },
    { match: { idPrefix: 'np-', house: 'web' }, target: 'houses/web/network-plus/index.html', mech: 'data-module', notes: 'Existing Network+ study hub (web)' },
    { match: { idPrefix: 'ccna-', house: 'web' }, target: 'houses/web/ccna/index.html', mech: 'data-module', notes: 'Existing CCNA hub (web)' },
    { match: { idPrefix: 'ip-', house: 'web' }, target: 'houses/web/network-plus/index.html', mech: 'data-module', notes: 'IP addressing → Network+ hub' },
    { match: { idPrefix: 'wsa-', house: 'cloud' }, target: 'houses/cloud/modules/wsa/index.html', mech: 'data-module', notes: 'Existing WSA hub' },
    { match: { idPrefix: 'guilab', house: 'cloud' }, target: 'CLEANUP: WSA sub-content', mech: 'cleanup', cleanup: true, notes: 'cloud-guilab/pslab/quizquiz are WSA child files with auto-derived dup ids. Cleanup: dedupe catalog OR roll up under m01-m19' },
    { match: { idPrefix: 'pslab', house: 'cloud' }, target: 'CLEANUP: WSA sub-content', mech: 'cleanup', cleanup: true, notes: 'See guilab note' },
    { match: { idPrefix: 'quizquiz', house: 'cloud' }, target: 'CLEANUP: WSA sub-content', mech: 'cleanup', cleanup: true, notes: 'See guilab note' },
    { match: { idPrefix: 'openstack', house: 'cloud' }, target: 'houses/cloud/openstack/index.html', mech: 'data-module', notes: 'Existing OpenStack hub' },
    { match: { idPrefix: 'aws-', house: 'cloud' }, target: 'houses/aws-ccp/index.html', mech: 'learning-path', notes: 'AWS topics — assign to AWS CCP hub (most general)' },
    { match: { idPrefix: 'wsa', house: 'cloud' }, target: 'houses/cloud/modules/wsa/index.html', mech: 'data-module', notes: 'WSA course hub' },
    { match: { idPrefix: 'cmmc', house: 'shield' }, target: 'NEW: houses/shield/cmmc/index.html', mech: 'data-module', proposed: true, notes: 'NEW — CMMC Domain hub. CMMC modules currently scattered.' },
    { match: { idPrefix: 'threat', house: 'shield' }, target: 'NEW (incubation): houses/shield/threat-detection-lab/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'INCUBATION — Threat Detection Lab. 17 mods: runner, swarm, botnets — game-style. Park here until topic resolves to Sec+/CySA+ alignment.' },
    { match: { idPrefix: 'sec101', house: 'shield' }, target: 'NEW: houses/shield/sec-101/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — Sec-101 module series (8 modules). Could roll up into First Watch or stand alone.' },
    { match: { idPrefix: 'cf-', house: 'shield' }, target: 'houses/shield/cyber-framework/index.html', mech: 'data-module', notes: 'Existing Cyber Framework hub' },
    { match: { idPrefix: 'da-', house: 'dark-arts' }, target: 'NEW: houses/dark-arts/vault-labs/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — Vault Labs hub. da-* prefix lab series.' },
    { match: { idPrefix: 'dark-', house: 'dark-arts' }, target: 'NEW: houses/dark-arts/vault-labs/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — Vault Labs hub. dark-* prefix lab series.' },
    { match: { idPrefix: 'db-', house: 'script' }, target: 'NEW: houses/script/databases/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — Script Databases hub (db-01 .. db-NN). 35 modules. Could be SQL fundamentals course.' },
    { match: { idPrefix: 'bash-', house: 'script' }, target: 'NEW: houses/script/bash-mastery/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — Bash Mastery hub. 14 modules.' },
    { match: { idPrefix: 'pwsh-', house: 'script' }, target: 'NEW: houses/script/powershell/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — PowerShell hub. 4 modules so far — incubator.' },
    { match: { idPrefix: 'mission-', house: 'script' }, target: 'NEW: houses/script/missions/index.html', mech: 'inline-id', proposed: true, notes: 'NEW — Script Missions incubator. 4 modules.' },

    // ──── INCUBATION FALLBACK PER HOUSE ────
    { match: { catchAll: 'script' }, target: 'NEW (incubation): houses/script/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for script orphans without strong cluster signal' },
    { match: { catchAll: 'code' }, target: 'NEW (incubation): houses/code/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for code orphans' },
    { match: { catchAll: 'web' }, target: 'NEW (incubation): houses/web/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for web orphans' },
    { match: { catchAll: 'forge' }, target: 'NEW (incubation): houses/forge/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for forge orphans' },
    { match: { catchAll: 'shield' }, target: 'NEW (incubation): houses/shield/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for shield orphans' },
    { match: { catchAll: 'cloud' }, target: 'NEW (incubation): houses/cloud/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for cloud orphans' },
    { match: { catchAll: 'eye' }, target: 'NEW (incubation): houses/eye/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for eye orphans' },
    { match: { catchAll: 'dark-arts' }, target: 'NEW (incubation): houses/dark-arts/incubator/index.html', mech: 'inline-id', proposed: true, incubation: true, notes: 'Catch-all incubation hub for dark-arts orphans' },
    { match: { catchAll: 'matrix' }, target: 'houses/matrix/index.html', mech: 'data-module', notes: 'Matrix house landing — small orphan count, can absorb directly' },
    { match: { catchAll: 'key' }, target: 'houses/key/index.html', mech: 'data-module', notes: 'Key house landing — only 12 orphans, can absorb' },
    { match: { catchAll: 'ai' }, target: 'houses/ai/index.html', mech: 'data-module', notes: 'AI house landing — only 2 orphans' },
    { match: { catchAll: 'forensics' }, target: 'houses/eye/forensics/index.html', mech: 'data-module', notes: 'Forensics — single orphan, route to forensics hub' },
    { match: { catchAll: 'divergent' }, target: 'houses/divergent/index.html', mech: 'data-module', notes: 'Divergent — small count' },
];

function matchOrphanToRule(orphan, idPrefix) {
    const sig = orphan.cluster ? orphan.cluster.label : null;
    const house = orphan.house;
    for (const rule of HUB_RULES) {
        const m = rule.match;
        if (m.idPrefix && m.house) {
            if (idPrefix === m.idPrefix.replace(/-$/, '') && house === m.house) return rule;
            if (idPrefix === m.idPrefix && house === m.house) return rule;
        } else if (m.signalIncludes && m.house) {
            if (sig && sig.includes(m.signalIncludes) && house === m.house) return rule;
        } else if (m.signalIncludes) {
            if (sig && sig.includes(m.signalIncludes)) return rule;
        } else if (m.idPrefix) {
            if (idPrefix === m.idPrefix.replace(/-$/, '')) return rule;
        }
    }
    // Fall back to catchAll
    for (const rule of HUB_RULES) {
        if (rule.match.catchAll === house) return rule;
    }
    return null;
}

function main() {
    const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
    const strict = JSON.parse(fs.readFileSync(STRICT_PATH, 'utf8'));

    // Aggregate orphans per (house, idPrefix) with rule match
    const recommendations = [];
    const trueOrphanIds = new Set();
    // Collect sub-content set
    const subSamples = new Set((matrix.subContentSamples || []).map(s => s.id));

    // Iterate per house items
    for (const [house, hd] of Object.entries(strict.byHouse)) {
        const items = hd.items || [];
        // Group by id-prefix
        const groups = new Map();
        for (const item of items) {
            // skip sub-content for placement matrix (handled separately)
            // We'll classify all items, but flag sub-content distinctly.
            const isSub = subSamples.has(item.id);
            let parts = item.id.split('-');
            if (parts[0] === house) parts = parts.slice(1);
            else if (house === 'dark-arts' && item.id.startsWith('dark-arts-')) parts = item.id.slice('dark-arts-'.length).split('-');
            const prefix = parts[0] || '?';
            const key = prefix;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push({ ...item, _sub: isSub });
        }
        for (const [prefix, list] of groups) {
            // Use the first item for rule matching (cluster signal usually consistent in a prefix)
            const rep = list[0];
            const rule = matchOrphanToRule(rep, prefix);
            const subCount = list.filter(l => l._sub).length;
            const trueCount = list.length - subCount;
            recommendations.push({
                house,
                idPrefix: prefix,
                count: list.length,
                trueOrphans: trueCount,
                subContent: subCount,
                clusterSignal: rep.cluster ? rep.cluster.label : null,
                samples: list.slice(0, 5).map(l => l.id),
                rule: rule ? {
                    target: rule.target,
                    mech: rule.mech,
                    proposed: rule.proposed === true,
                    incubation: rule.incubation === true,
                    cleanup: rule.cleanup === true,
                    notes: rule.notes,
                } : null,
            });
        }
    }

    // Sort by total count desc within each house
    recommendations.sort((a, b) => {
        if (a.house !== b.house) return a.house.localeCompare(b.house);
        return b.count - a.count;
    });

    // Aggregate stats
    const stats = {
        totalRecommendations: recommendations.length,
        existing: recommendations.filter(r => r.rule && !r.rule.proposed && !r.rule.cleanup).length,
        proposed: recommendations.filter(r => r.rule && r.rule.proposed && !r.rule.incubation).length,
        incubation: recommendations.filter(r => r.rule && r.rule.incubation).length,
        cleanup: recommendations.filter(r => r.rule && r.rule.cleanup).length,
        unmatched: recommendations.filter(r => !r.rule).length,
        modulesAffected: recommendations.reduce((s, r) => s + r.count, 0),
        modulesToExisting: recommendations.filter(r => r.rule && !r.rule.proposed && !r.rule.cleanup).reduce((s, r) => s + r.count, 0),
        modulesToProposed: recommendations.filter(r => r.rule && r.rule.proposed && !r.rule.incubation).reduce((s, r) => s + r.count, 0),
        modulesToIncubation: recommendations.filter(r => r.rule && r.rule.incubation).reduce((s, r) => s + r.count, 0),
        modulesCleanup: recommendations.filter(r => r.rule && r.rule.cleanup).reduce((s, r) => s + r.count, 0),
    };

    const output = {
        generated: new Date().toISOString(),
        sourceMatrix: path.relative(process.cwd(), MATRIX_PATH),
        sourceStrict: path.relative(process.cwd(), STRICT_PATH),
        stats,
        recommendations,
    };
    fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2));

    // Markdown
    let md = `# Placement Recommendations — Phase 3 + 4\n\n`;
    md += `**Generated:** ${output.generated}\n\n`;
    md += `## Summary\n\n`;
    md += `| Metric | Count |\n|---|---:|\n`;
    md += `| Total cluster recommendations | ${stats.totalRecommendations} |\n`;
    md += `| → To existing hub | ${stats.existing} clusters / **${stats.modulesToExisting} modules** |\n`;
    md += `| → To proposed new hub | ${stats.proposed} / **${stats.modulesToProposed}** |\n`;
    md += `| → To incubation hub | ${stats.incubation} / **${stats.modulesToIncubation}** |\n`;
    md += `| → CLEANUP (dedupe / roll-up) | ${stats.cleanup} / **${stats.modulesCleanup}** |\n`;
    md += `| Unmatched (need manual review) | ${stats.unmatched} |\n`;
    md += `| **Total modules covered** | **${stats.modulesAffected}** |\n\n`;

    md += `## Recommendation Types\n\n`;
    md += `- **EXISTING HUB** — hub already exists; just needs the orphan ids registered (data-module attr OR inline JS array OR LearningPath modules array).\n`;
    md += `- **PROPOSED NEW HUB** — sufficient module mass + clear curriculum scope to justify a new dedicated hub. Build it as part of Stragglers follow-up sprint.\n`;
    md += `- **INCUBATION HUB** — orphans without strong curriculum identity yet. Park them in a per-house incubator for visibility; promote to dedicated hub when ≥10 modules cluster around a clear topic.\n`;
    md += `- **CLEANUP** — these aren't really orphans-needing-placement; they're catalog artifacts (autogen dup ids, sub-content of in-hub parents). Need dedupe or roll-up, not hub assignment.\n\n`;

    md += `## Per-House Placement Plan\n\n`;
    let currentHouse = null;
    for (const r of recommendations) {
        if (r.house !== currentHouse) {
            currentHouse = r.house;
            const total = recommendations.filter(x => x.house === r.house).reduce((s, x) => s + x.count, 0);
            md += `\n### \`${r.house}\` (${total} orphan modules)\n\n`;
            md += `| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |\n`;
            md += `|---|---:|---|---|---|---|---|\n`;
        }
        const ts = r.rule ? r.rule.target : '*UNMATCHED*';
        const mech = r.rule ? r.rule.mech : '?';
        const tag = r.rule ? (r.rule.cleanup ? '🧹' : r.rule.incubation ? '🥚' : r.rule.proposed ? '🆕' : '✓') : '⚠️';
        const notes = r.rule ? r.rule.notes : 'No rule matched — manual review';
        md += `| ${tag} \`${r.idPrefix}-*\` | ${r.count} | ${r.trueOrphans}/${r.subContent} | ${r.clusterSignal || '—'} | \`${ts}\` | ${mech} | ${notes} |\n`;
    }

    md += `\n## Tag Legend\n\n`;
    md += `- ✓ existing hub (just register ids)\n`;
    md += `- 🆕 proposed new hub (build then register)\n`;
    md += `- 🥚 incubation hub (park here, promote later)\n`;
    md += `- 🧹 cleanup (dedupe/roll-up, not hub assignment)\n`;
    md += `- ⚠️ unmatched (manual review needed)\n`;

    fs.writeFileSync(OUT_MD, md);

    // stdout
    console.log('');
    console.log('  Placement Recommendations — Phase 3 + 4');
    console.log('');
    console.log('    Total cluster recommendations: ' + stats.totalRecommendations);
    console.log('    → existing hubs:    ' + String(stats.existing).padStart(3) + '  (' + stats.modulesToExisting + ' modules)');
    console.log('    → new hubs (build): ' + String(stats.proposed).padStart(3) + '  (' + stats.modulesToProposed + ' modules)');
    console.log('    → incubation hubs:  ' + String(stats.incubation).padStart(3) + '  (' + stats.modulesToIncubation + ' modules)');
    console.log('    → cleanup:          ' + String(stats.cleanup).padStart(3) + '  (' + stats.modulesCleanup + ' modules)');
    console.log('    → unmatched:        ' + String(stats.unmatched).padStart(3));
    console.log('');
    console.log('    Total modules covered: ' + stats.modulesAffected);
    console.log('');
    console.log('  JSON: ' + path.relative(process.cwd(), OUT_JSON));
    console.log('  MD:   ' + path.relative(process.cwd(), OUT_MD));
}

main();
