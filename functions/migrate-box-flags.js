#!/usr/bin/env node
/**
 * migrate-box-flags.js -- SEC-9: Box Flag Migration
 *
 * Scans all box config.js files in _app/arena/boxes/ and _app/dispatch/boxes/,
 * extracts plaintext flag values, and:
 *   1. Generates Firestore documents at flag_registry/{boxId} with flagId -> value mappings
 *   2. Outputs a report of all flags found per box
 *   3. Generates SHA-256 hash stubs for client-side fallback comparison
 *
 * Usage:
 *   node migrate-box-flags.js --dry-run        Preview extraction results
 *   node migrate-box-flags.js --export-keys    Write box_flags.json for Firestore seeding
 *
 * This script does NOT modify config files in place or write to Firestore directly.
 * It generates artifacts for manual review and deployment.
 *
 * Firestore path: flag_registry/{boxId} (matches existing validateFlag Cloud Function)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARENA_DIR = path.join(PROJECT_ROOT, '_app', 'arena', 'boxes');
const DISPATCH_DIR = path.join(PROJECT_ROOT, '_app', 'dispatch', 'boxes');
const KEYS_OUTPUT = path.resolve(__dirname, 'box_flags.json');

// ---- SHA-256 hash helper ----

function sha256(value) {
    return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

// ---- Flag Extraction ----

/**
 * Extract flags from a box config.js file.
 * Handles three patterns:
 *   1. _scenarioFlags: { id: 'flag{...}', ... }  (dispatch boxes)
 *   2. flags: { id: 'flag{...}', ... }            (pr7 shared flags object)
 *   3. Inline flag{...} and FLAG{...} in file content  (arena boxes)
 *      Cross-referenced with flags: [{ id: 'user' }, { id: 'root' }] arrays
 */
function extractFlags(configContent, filePath) {
    const result = {
        registryId: null,
        flagType: null,       // 'scenario' | 'inline' | 'flags_object'
        flags: {},            // { flagId: flagValue }
        rawMatches: [],       // all flag{...} found in file
        warnings: []
    };

    // Extract registryId
    const regMatch = configContent.match(/registryId\s*:\s*['"]([^'"]+)['"]/);
    if (regMatch) {
        result.registryId = regMatch[1];
    }

    // Pattern 1: _scenarioFlags object (dispatch boxes)
    // Brace-match to handle flag{...} braces inside the object
    const scenarioIdx = configContent.indexOf('_scenarioFlags');
    if (scenarioIdx !== -1) {
        const braceStart = configContent.indexOf('{', scenarioIdx);
        if (braceStart !== -1) {
            let depth = 0;
            let braceEnd = -1;
            for (let i = braceStart; i < configContent.length; i++) {
                if (configContent[i] === '{') depth++;
                if (configContent[i] === '}') { depth--; if (depth === 0) { braceEnd = i; break; } }
            }
            if (braceEnd !== -1) {
                result.flagType = 'scenario';
                const block = configContent.substring(braceStart + 1, braceEnd);
                const pairRegex = /(\w+)\s*:\s*['"]([Ff][Ll][Aa][Gg]\{[^}]+\})['"]/g;
                let m;
                while ((m = pairRegex.exec(block)) !== null) {
                    result.flags[m[1]] = m[2];
                }
            }
        }
    }

    // Pattern 2: shared flags object (pr7 style: flags: { key: 'flag{...}' })
    // Distinct from flags: [...] array pattern; only match if no _scenarioFlags found
    if (scenarioIdx === -1) {
        // Find a `flags: {` that contains flag{...} values (not flags: [...] arrays)
        const flagsObjRegex = /\bflags\s*:\s*\{/g;
        let fom;
        while ((fom = flagsObjRegex.exec(configContent)) !== null) {
            const braceStart = fom.index + fom[0].length - 1;
            let depth = 0;
            let braceEnd = -1;
            for (let i = braceStart; i < configContent.length; i++) {
                if (configContent[i] === '{') depth++;
                if (configContent[i] === '}') { depth--; if (depth === 0) { braceEnd = i; break; } }
            }
            if (braceEnd !== -1) {
                const block = configContent.substring(braceStart + 1, braceEnd);
                if (/(?:flag|FLAG)\{/.test(block)) {
                    result.flagType = 'flags_object';
                    const pairRegex = /(\w+)\s*:\s*['"]([Ff][Ll][Aa][Gg]\{[^}]+\})['"]/g;
                    let m;
                    while ((m = pairRegex.exec(block)) !== null) {
                        result.flags[m[1]] = m[2];
                    }
                    break;
                }
            }
        }
    }

    // Pattern 3: Inline flags in content (arena boxes)
    // Collect all unique flag{...} and FLAG{...} values
    const inlineRegex = /(?:flag|FLAG)\{[^}]+\}/g;
    let im;
    while ((im = inlineRegex.exec(configContent)) !== null) {
        const val = im[0];
        if (!result.rawMatches.includes(val)) {
            result.rawMatches.push(val);
        }
    }

    // If we have a flags: [...] array with id fields but no values,
    // and we found inline flags, try to map them using the seed-flags.js registry
    // (This is the arena box pattern -- flags are embedded in filesystem/command output)
    if (!result.flagType && result.rawMatches.length > 0) {
        result.flagType = 'inline';
        // We can't reliably auto-map inline flags to flag IDs without the seed registry.
        // Store them as raw matches for the report; seed-flags.js handles the canonical mapping.
    }

    return result;
}

// ---- Box Discovery ----

function findBoxConfigs(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const configPath = path.join(dir, entry.name, 'config.js');
        if (fs.existsSync(configPath)) {
            results.push({
                boxDir: entry.name,
                configPath,
                source: dir.includes('dispatch') ? 'dispatch' : 'arena'
            });
        }
    }
    return results.sort((a, b) => a.boxDir.localeCompare(b.boxDir));
}

// ---- Cross-reference with existing seed-flags.js ----

function loadSeedRegistry() {
    const seedPath = path.join(__dirname, 'seed-flags.js');
    if (!fs.existsSync(seedPath)) return {};

    const content = fs.readFileSync(seedPath, 'utf-8');
    // Extract the FLAG_REGISTRY object
    const match = content.match(/const FLAG_REGISTRY\s*=\s*(\{[\s\S]*?\n\};)/);
    if (!match) return {};

    try {
        // Use Function constructor to evaluate the object literal
        const fn = new Function(`return ${match[1].replace(/;$/, '')}`);
        return fn();
    } catch (e) {
        console.warn('  [WARN] Could not parse seed-flags.js registry:', e.message);
        return {};
    }
}

// ---- Main ----

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const exportKeys = args.includes('--export-keys');

    if (!dryRun && !exportKeys) {
        console.log('SEC-9: Box Flag Migration');
        console.log('=========================');
        console.log('');
        console.log('Usage:');
        console.log('  node migrate-box-flags.js --dry-run        Preview extraction results');
        console.log('  node migrate-box-flags.js --export-keys    Generate box_flags.json for Firestore');
        console.log('');
        console.log('Run --dry-run first to verify extraction before proceeding.');
        process.exit(0);
    }

    console.log('SEC-9: Box Flag Migration');
    console.log('=========================');
    console.log('');

    // Load the canonical seed registry for arena boxes
    const seedRegistry = loadSeedRegistry();
    const seedBoxes = Object.keys(seedRegistry).length;
    console.log(`Loaded seed-flags.js registry: ${seedBoxes} arena boxes\n`);

    // Discover all box configs
    const arenaBoxes = findBoxConfigs(ARENA_DIR);
    const dispatchBoxes = findBoxConfigs(DISPATCH_DIR);
    const allBoxes = [...arenaBoxes, ...dispatchBoxes];

    console.log(`Found ${arenaBoxes.length} arena boxes, ${dispatchBoxes.length} dispatch boxes`);
    console.log(`Total: ${allBoxes.length} box configs\n`);

    // Combined flag registry for export
    const flagRegistry = {};
    const hashStubs = {};
    let totalFlags = 0;
    let boxesWithFlags = 0;

    console.log('--- Arena Boxes ---\n');

    for (const box of arenaBoxes) {
        const content = fs.readFileSync(box.configPath, 'utf-8');
        const extracted = extractFlags(content, box.configPath);
        const boxId = extracted.registryId || box.boxDir;

        // For arena boxes, prefer the seed registry (authoritative source)
        const seedFlags = seedRegistry[boxId];
        const flags = seedFlags || extracted.flags;
        const flagCount = Object.keys(flags).length;

        if (flagCount > 0 || extracted.rawMatches.length > 0) {
            boxesWithFlags++;
            console.log(`  ${boxId}`);
            console.log(`    Source: ${box.source}/${box.boxDir}/config.js`);
            console.log(`    Registry ID: ${boxId}`);

            if (seedFlags) {
                console.log(`    Flags (from seed-flags.js): ${Object.keys(seedFlags).length}`);
                flagRegistry[boxId] = { flags: seedFlags };
                for (const [fid, fval] of Object.entries(seedFlags)) {
                    console.log(`      ${fid}: ${fval}`);
                    console.log(`        SHA-256: ${sha256(fval).substring(0, 16)}...`);
                    totalFlags++;
                }
            } else if (flagCount > 0) {
                console.log(`    Flags (extracted): ${flagCount}`);
                flagRegistry[boxId] = { flags };
                for (const [fid, fval] of Object.entries(flags)) {
                    console.log(`      ${fid}: ${fval}`);
                    console.log(`        SHA-256: ${sha256(fval).substring(0, 16)}...`);
                    totalFlags++;
                }
            }

            if (extracted.rawMatches.length > 0) {
                console.log(`    Inline flag references: ${extracted.rawMatches.length}`);
            }

            // Generate hash stubs
            const stubs = {};
            const flagSource = seedFlags || flags;
            for (const [fid, fval] of Object.entries(flagSource)) {
                stubs[fid] = sha256(fval);
            }
            if (Object.keys(stubs).length > 0) {
                hashStubs[boxId] = stubs;
            }

            console.log('');
        }
    }

    console.log('--- Dispatch Boxes ---\n');

    for (const box of dispatchBoxes) {
        const content = fs.readFileSync(box.configPath, 'utf-8');
        const extracted = extractFlags(content, box.configPath);
        const boxId = extracted.registryId || box.boxDir;
        const flags = extracted.flags;
        const flagCount = Object.keys(flags).length;

        if (flagCount > 0) {
            boxesWithFlags++;
            console.log(`  ${boxId}`);
            console.log(`    Source: ${box.source}/${box.boxDir}/config.js`);
            console.log(`    Registry ID: ${boxId}`);
            console.log(`    Type: scenario-based (_scenarioFlags)`);
            console.log(`    Flags: ${flagCount}`);
            flagRegistry[boxId] = { flags };

            for (const [fid, fval] of Object.entries(flags)) {
                console.log(`      ${fid}: ${fval}`);
                console.log(`        SHA-256: ${sha256(fval).substring(0, 16)}...`);
                totalFlags++;
            }

            // Generate hash stubs
            const stubs = {};
            for (const [fid, fval] of Object.entries(flags)) {
                stubs[fid] = sha256(fval);
            }
            hashStubs[boxId] = stubs;

            console.log('');
        }
    }

    // Summary
    console.log('=== Summary ===');
    console.log(`  Boxes with flags: ${boxesWithFlags}`);
    console.log(`  Total flags:      ${totalFlags}`);
    console.log(`  Arena boxes:      ${arenaBoxes.length} (${seedBoxes} in seed registry)`);
    console.log(`  Dispatch boxes:   ${dispatchBoxes.length}`);
    console.log('');

    // Flag storage patterns
    console.log('=== Storage Patterns ===');
    console.log('  Arena boxes:    flags embedded in filesystem/command output + seed-flags.js');
    console.log('  Dispatch boxes: _scenarioFlags object with per-scenario flag values');
    console.log('  PR7:            shared flags object on parent config, used by red/blue modes');
    console.log('  Firestore:      flag_registry/{boxId}.flags.{flagId} = plaintext value');
    console.log('');

    // --export-keys
    if (exportKeys) {
        // Build Firestore-ready format
        const firestoreData = {};
        for (const [boxId, data] of Object.entries(flagRegistry)) {
            firestoreData[boxId] = {
                flags: data.flags,
                hashStubs: hashStubs[boxId] || {},
                migratedAt: new Date().toISOString()
            };
        }

        fs.writeFileSync(KEYS_OUTPUT, JSON.stringify(firestoreData, null, 2));
        console.log(`Wrote ${Object.keys(firestoreData).length} box flag sets to: ${KEYS_OUTPUT}`);
        console.log('Use seed-flags.js or Firebase Admin SDK to import to flag_registry collection.');
        console.log('Each top-level key becomes a Firestore document ID in flag_registry/.');
    }

    if (dryRun) {
        console.log('[DRY RUN] No files were written. Use --export-keys to generate output.');
    }
}

main();
