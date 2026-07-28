#!/usr/bin/env node
/**
 * migrate-operator-keys.js -- SEC-4: Operator Mission Key Migration
 *
 * Scans every *.config.js in _app/operator/configs/ (124 at the 2026-07-28 count;
 * the count is discovered at runtime, never hard-coded), extracts missionId,
 * objectives (id, check expression), and state keys.
 *
 * Usage:
 *   node migrate-operator-keys.js --dry-run        Preview extraction results
 *   node migrate-operator-keys.js --export-keys    Write operator_keys.json for Firestore seeding
 *
 * This script does NOT modify config files or write to Firestore directly.
 * It generates artifacts for manual review and deployment.
 *
 * Firestore path: operator_keys/{missionId}
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONFIGS_DIR = path.join(PROJECT_ROOT, '_app', 'operator', 'configs');
const KEYS_OUTPUT = path.resolve(__dirname, 'operator_keys.json');

// ---- Config Extraction ----

/**
 * Extract mission data from an operator config.js file.
 * Parses: id, objectives array (id + check), customState keys, gate flags.
 */
function extractMissionConfig(content, filePath) {
    const result = {
        id: null,
        objectives: [],
        stateKeys: [],
        gateFlags: [],
        warnings: []
    };

    // Extract mission id
    const idMatch = content.match(/\bid\s*:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
        result.id = idMatch[1];
    } else {
        result.warnings.push('Could not extract mission id');
        return result;
    }

    // Extract objectives array
    // Find the objectives: [ ... ] block using brace matching
    const objIdx = content.search(/\bobjectives\s*:\s*\[/);
    if (objIdx !== -1) {
        const bracketStart = content.indexOf('[', objIdx);
        if (bracketStart !== -1) {
            let depth = 0;
            let bracketEnd = -1;
            for (let i = bracketStart; i < content.length; i++) {
                if (content[i] === '[') depth++;
                if (content[i] === ']') {
                    depth--;
                    if (depth === 0) { bracketEnd = i; break; }
                }
            }
            if (bracketEnd !== -1) {
                const block = content.substring(bracketStart, bracketEnd + 1);

                // Extract each { id: '...', ..., check: '...' } object
                // Must handle check expressions containing double quotes inside single quotes
                // e.g. check: 'nmapTargets.has("server-db") || nmapTargets.has("server-web")'
                const idRegex = /\{\s*id\s*:\s*'([^']+)'/g;
                let idMatch;
                while ((idMatch = idRegex.exec(block)) !== null) {
                    const objId = idMatch[1];
                    // Find the check value for this objective block
                    const afterId = block.substring(idMatch.index);
                    // Match check: '...' where the value may contain double quotes
                    const checkMatch = afterId.match(/check\s*:\s*'([^']+)'/);
                    if (checkMatch) {
                        result.objectives.push({
                            id: objId,
                            check: checkMatch[1]
                        });
                    }
                }
            }
        }
    }

    // Extract customState keys
    const csIdx = content.search(/\bcustomState\s*:\s*\{/);
    if (csIdx !== -1) {
        const braceStart = content.indexOf('{', csIdx);
        if (braceStart !== -1) {
            let depth = 0;
            let braceEnd = -1;
            for (let i = braceStart; i < content.length; i++) {
                if (content[i] === '{') depth++;
                if (content[i] === '}') {
                    depth--;
                    if (depth === 0) { braceEnd = i; break; }
                }
            }
            if (braceEnd !== -1) {
                const block = content.substring(braceStart + 1, braceEnd);
                // Extract key names from key: value pairs
                const keyRegex = /(\w+)\s*:/g;
                let km;
                while ((km = keyRegex.exec(block)) !== null) {
                    result.stateKeys.push(km[1]);
                }
            }
        }
    }

    // Extract gate flags
    const gatesIdx = content.search(/\bgates\s*:\s*\{/);
    if (gatesIdx !== -1) {
        const braceStart = content.indexOf('{', gatesIdx);
        if (braceStart !== -1) {
            let depth = 0;
            let braceEnd = -1;
            for (let i = braceStart; i < content.length; i++) {
                if (content[i] === '{') depth++;
                if (content[i] === '}') {
                    depth--;
                    if (depth === 0) { braceEnd = i; break; }
                }
            }
            if (braceEnd !== -1) {
                const block = content.substring(braceStart + 1, braceEnd);
                const flagRegex = /flag\s*:\s*['"](\w+)['"]/g;
                let fm;
                while ((fm = flagRegex.exec(block)) !== null) {
                    result.gateFlags.push(fm[1]);
                }
            }
        }
    }

    // Merge gate flags into stateKeys (they are state properties too)
    for (const gf of result.gateFlags) {
        if (!result.stateKeys.includes(gf)) {
            result.stateKeys.push(gf);
        }
    }

    // Also extract state keys referenced in check expressions but not in customState
    // These are built-in state keys (nodesDiscovered, nmapTargets, etc.)
    const builtinKeys = new Set();
    for (const obj of result.objectives) {
        // Extract bare identifiers from check expressions
        const refs = obj.check.match(/\b(\w+)\b/g) || [];
        for (const ref of refs) {
            // Skip operators, numbers, method names, string literals
            if (/^(size|has|true|false|undefined|null|\d+)$/.test(ref)) continue;
            if (!result.stateKeys.includes(ref)) {
                builtinKeys.add(ref);
            }
        }
    }
    // Add built-in keys that are actual state properties
    const knownBuiltins = ['nodesDiscovered', 'nmapTargets', 'integrity', 'trapsTriggered', 'agentCmdCount'];
    for (const key of builtinKeys) {
        if (knownBuiltins.includes(key) && !result.stateKeys.includes(key)) {
            result.stateKeys.push(key);
        }
    }

    // Any identifier used as a .has()/.size/.indexOf receiver in a check IS a state
    // property by construction (boot-script Sets like recon-02's dmzNodesMapped, the
    // engine's gate-flag Set 'flags') even when it never appears in customState/gates.
    // It must be in stateKeys or the server sanitizer strips it and the check can
    // never pass server-side (hard rejection of a legitimately completed mission).
    for (const obj of result.objectives) {
        for (const m of obj.check.matchAll(/(\w+)\.(?:has|size|indexOf)\b/g)) {
            if (!result.stateKeys.includes(m[1])) {
                result.stateKeys.push(m[1]);
            }
        }
    }

    return result;
}

// ---- Config Discovery ----

function findConfigs(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.config.js')) continue;
        results.push({
            filename: entry.name,
            configPath: path.join(dir, entry.name)
        });
    }
    return results.sort((a, b) => a.filename.localeCompare(b.filename));
}

// ---- Main ----

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const exportKeys = args.includes('--export-keys');

    if (!dryRun && !exportKeys) {
        console.log('SEC-4: Operator Mission Key Migration');
        console.log('=====================================');
        console.log('');
        console.log('Usage:');
        console.log('  node migrate-operator-keys.js --dry-run        Preview extraction results');
        console.log('  node migrate-operator-keys.js --export-keys    Generate operator_keys.json for Firestore');
        console.log('');
        console.log('Run --dry-run first to verify extraction before proceeding.');
        process.exit(0);
    }

    console.log('SEC-4: Operator Mission Key Migration');
    console.log('=====================================');
    console.log('');

    // Discover configs
    const configs = findConfigs(CONFIGS_DIR);
    console.log(`Found ${configs.length} operator mission configs in ${CONFIGS_DIR}\n`);

    // Registry for export
    const registry = {};
    let totalObjectives = 0;
    let totalStateKeys = 0;
    let missionsWithWarnings = 0;

    for (const cfg of configs) {
        const content = fs.readFileSync(cfg.configPath, 'utf-8');
        const extracted = extractMissionConfig(content, cfg.configPath);

        if (!extracted.id) {
            console.log(`  [SKIP] ${cfg.filename} -- no mission id found`);
            if (extracted.warnings.length > 0) {
                for (const w of extracted.warnings) {
                    console.log(`    [WARN] ${w}`);
                }
            }
            console.log('');
            continue;
        }

        const objCount = extracted.objectives.length;
        totalObjectives += objCount;
        totalStateKeys += extracted.stateKeys.length;

        console.log(`  ${extracted.id}`);
        console.log(`    Source: ${cfg.filename}`);
        console.log(`    Objectives: ${objCount}`);

        for (const obj of extracted.objectives) {
            console.log(`      [${obj.id}] check: "${obj.check}"`);
        }

        console.log(`    State keys: ${extracted.stateKeys.length}`);
        if (extracted.stateKeys.length > 0) {
            console.log(`      ${extracted.stateKeys.join(', ')}`);
        }

        if (extracted.gateFlags.length > 0) {
            console.log(`    Gate flags: ${extracted.gateFlags.join(', ')}`);
        }

        if (extracted.warnings.length > 0) {
            missionsWithWarnings++;
            for (const w of extracted.warnings) {
                console.log(`    [WARN] ${w}`);
            }
        }

        console.log('');

        // Build registry entry
        registry[extracted.id] = {
            objectives: extracted.objectives,
            stateKeys: extracted.stateKeys
        };
    }

    // Summary
    console.log('=== Summary ===');
    console.log(`  Missions found:     ${Object.keys(registry).length}`);
    console.log(`  Total objectives:   ${totalObjectives}`);
    console.log(`  Total state keys:   ${totalStateKeys}`);
    if (missionsWithWarnings > 0) {
        console.log(`  Missions w/ warns:  ${missionsWithWarnings}`);
    }
    console.log('');

    console.log('=== Firestore Path ===');
    console.log('  operator_keys/{missionId}');
    console.log('  Each document holds objectives[] and stateKeys[]');
    console.log('  Cloud Function: validateMissionCompletion');
    console.log('');

    // --export-keys
    if (exportKeys) {
        const firestoreData = {};
        for (const [missionId, data] of Object.entries(registry)) {
            firestoreData[missionId] = {
                objectives: data.objectives,
                stateKeys: data.stateKeys,
                migratedAt: new Date().toISOString()
            };
        }

        fs.writeFileSync(KEYS_OUTPUT, JSON.stringify(firestoreData, null, 2));
        console.log(`Wrote ${Object.keys(firestoreData).length} mission keys to: ${KEYS_OUTPUT}`);
        console.log('Use Firebase Admin SDK to import to operator_keys collection.');
        console.log('Each top-level key becomes a Firestore document ID in operator_keys/.');
    }

    if (dryRun) {
        console.log('[DRY RUN] No files were written. Use --export-keys to generate output.');
    }
}

main();
