#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * hexcontent Spoke Adapter
 *
 * Reports cold storage inventory and workbench state from bc1 (the home server).
 * bc1 is the warehouse: ~/hexworth/content/ holds all scraped reference libraries.
 * The workbench (~/hexworth/tools/workbench/) is the loading dock — items checked
 * out there sync to the laptop via Syncthing.
 *
 * Offline-first strategy:
 *   1. Read cached state from cache/hexcontent-state.json (always available)
 *   2. SSH to bc1 on refresh to get live inventory (bc1 may be unreachable)
 *
 * Nexus spoke interface: { name, getFindings, getStatus, acceptFinding }
 *
 * Standalone CLI (node hexcontent.js <command>):
 *   status     Summary: cold storage + workbench counts
 *   list       Full cold storage inventory
 *   workbench  Items currently on the workbench
 *   refresh    SSH to bc1 and update the cache
 */

// ANSI color codes (matches Nexus hub convention)
const C = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    red:     '\x1b[31m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    cyan:    '\x1b[36m',
    gray:    '\x1b[90m',
};

// SSH config matching bc1 from INTRO.md
const BC1_DEFAULTS = {
    host:            'bc1',
    tailscaleIp:     '100.96.136.114',
    user:            'eq1',
    coldStoragePath: '~/hexworth/content',
    workbenchPath:   '~/hexworth/tools/workbench',
    sshTimeout:      5,   // seconds — keeps the CLI snappy when bc1 is down
};

// --- Shared utilities ---

function timeAgo(isoString) {
    if (!isoString) return 'never';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function fmtSize(mb) {
    if (mb === null || mb === undefined) return '?MB';
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)}GB`;
    return `${mb.toFixed(1)}MB`;
}

// --- Factory ---

module.exports = function createHexcontentAdapter({ name, dataPath, projectRoot }) {

    // Resolve the cache file path relative to the nexus/ directory
    const NEXUS_DIR  = path.resolve(__dirname, '..');
    const CACHE_FILE = path.isAbsolute(dataPath)
        ? dataPath
        : path.resolve(NEXUS_DIR, dataPath);

    const BC1 = { ...BC1_DEFAULTS };

    // Seed bc1 connection info from cache if available (preserves LAN IP etc.)
    function bc1Config() {
        const state = readCache();
        if (state && state.bc1) {
            return { ...BC1, ...state.bc1 };
        }
        return BC1;
    }

    // --- Cache I/O ---

    function readCache() {
        if (!fs.existsSync(CACHE_FILE)) return null;
        try {
            return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        } catch (_) {
            return null;
        }
    }

    function writeCache(data) {
        const dir = path.dirname(CACHE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2) + '\n');
    }

    // --- SSH helpers ---

    /**
     * Execute a command on bc1 over SSH.
     * Returns { ok: true, stdout } or { ok: false, error }.
     * ConnectTimeout + BatchMode=yes (no interactive prompts) ensure fast failure
     * when bc1 is unreachable.
     */
    function sshRun(cmd) {
        const cfg = bc1Config();
        const escaped = cmd.replace(/"/g, '\\"');
        const sshCmd = [
            'ssh',
            '-o', `ConnectTimeout=${cfg.sshTimeout}`,
            '-o', 'BatchMode=yes',
            '-o', 'StrictHostKeyChecking=no',
            `${cfg.user}@${cfg.host}`,
            `"${escaped}"`,
        ].join(' ');

        try {
            const stdout = execSync(sshCmd, {
                encoding: 'utf8',
                timeout: (cfg.sshTimeout + 3) * 1000,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            return { ok: true, stdout: stdout.trim() };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    function bc1Reachable() {
        const result = sshRun('echo ok');
        return result.ok && result.stdout === 'ok';
    }

    /**
     * Pull live inventory from bc1.
     * Uses du + find for sizes/counts — standard on Ubuntu, no extra tooling needed.
     * Returns a state object in the same shape as the cache file, or null on failure.
     */
    function fetchLiveState() {
        if (!bc1Reachable()) return null;

        const cfg = bc1Config();

        // One compound command per target directory: name|sizeMb|fileCount|modEpoch
        const inventoryCmd = (dir) =>
            `if [ -d ${dir} ]; then ` +
            `cd ${dir} && ` +
            `for d in */; do ` +
            `  [ "$d" = "*/" ] && break; ` +
            `  n=$(printf '%s' "$d" | tr -d /); ` +
            `  sz=$(du -sm "$d" 2>/dev/null | cut -f1); ` +
            `  fc=$(find "$d" -type f 2>/dev/null | wc -l); ` +
            `  mt=$(stat -c %Y "$d" 2>/dev/null); ` +
            `  echo "$n|$sz|$fc|$mt"; ` +
            `done; fi`;

        const diskCmd =
            `du -sm ${cfg.coldStoragePath} 2>/dev/null | cut -f1; ` +
            `du -sm ${cfg.workbenchPath}   2>/dev/null | cut -f1 || echo 0`;

        const coldResult = sshRun(inventoryCmd(cfg.coldStoragePath));
        const wbResult   = sshRun(inventoryCmd(cfg.workbenchPath));
        const diskResult = sshRun(diskCmd);

        const now = new Date().toISOString();

        // Parse pipe-delimited inventory rows
        function parseRows(output) {
            if (!output) return [];
            return output.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const parts = line.split('|');
                    if (parts.length < 4) return null;
                    const [itemName, sizeRaw, countRaw, epochRaw] = parts;
                    return {
                        name:         itemName.trim(),
                        sizeMb:       parseFloat(sizeRaw)  || 0,
                        fileCount:    parseInt(countRaw, 10) || 0,
                        lastModified: parseInt(epochRaw, 10)
                            ? new Date(parseInt(epochRaw, 10) * 1000).toISOString()
                            : null,
                        status: 'available',
                    };
                })
                .filter(Boolean);
        }

        const coldItems = parseRows(coldResult.ok ? coldResult.stdout : '');
        const wbItems   = parseRows(wbResult.ok   ? wbResult.stdout   : '');

        const diskLines = diskResult.ok
            ? diskResult.stdout.split('\n').filter(Boolean)
            : [];
        const coldMb = parseFloat(diskLines[0]) || 0;
        const wbMb   = parseFloat(diskLines[1]) || 0;

        // Preserve human labels and tags from the existing cache (live scan has none)
        const cachedState = readCache();
        const cachedCold  = (cachedState && cachedState.coldStorage && cachedState.coldStorage.items) || [];

        function mergeLabels(liveItems, cachedItems) {
            return liveItems.map(item => {
                const cached = cachedItems.find(c => c.name === item.name);
                return {
                    ...item,
                    label: (cached && cached.label) || item.name,
                    tags:  (cached && cached.tags)  || [],
                };
            });
        }

        return {
            _meta: {
                version:     1,
                format:      'hexcontent-state',
                description: 'Live state pulled from bc1 via SSH',
            },
            lastSync: now,
            source:   'live',
            bc1: {
                host:            cfg.host,
                tailscaleIp:     cfg.tailscaleIp,
                lanIp:           cfg.lanIp || null,
                user:            cfg.user,
                coldStoragePath: cfg.coldStoragePath,
                workbenchPath:   cfg.workbenchPath,
            },
            coldStorage: {
                totalItems:  coldItems.length,
                totalSizeMb: coldMb,
                items:       mergeLabels(coldItems, cachedCold),
            },
            workbench: {
                totalItems:  wbItems.length,
                totalSizeMb: wbMb,
                // Live scan can't know checkedOutAt/purpose — preserve from cache
                items: mergeLabels(wbItems, (cachedState && cachedState.workbench && cachedState.workbench.items) || []),
            },
            diskUsage: {
                coldStorageMb:     coldMb,
                workbenchMb:       wbMb,
                totalMb:           coldMb + wbMb,
                syncthingSharedMb: wbMb,
                lastMeasured:      now,
            },
        };
    }

    // --- Spoke interface ---

    /**
     * getFindings
     *
     * Surfaces two classes of operational findings for the Nexus findings store:
     *
     *   HC-WB-CHECKOUT  Items sitting on the workbench. Long-running checkouts
     *                   (> 7 days) escalate from low to medium.
     *
     *   HC-CACHE-STALE  Cache file is > 3 days old. Nudges operator to refresh.
     */
    function getFindings() {
        const state = readCache();
        if (!state) return [];

        const now = Date.now();
        const findings = [];

        // Workbench checkouts
        const wbItems = (state.workbench && state.workbench.items) || [];
        for (const item of wbItems) {
            const checkedOutAt = item.checkedOutAt || state.lastSync;
            const ageDays = (now - new Date(checkedOutAt).getTime()) / (1000 * 60 * 60 * 24);

            findings.push({
                source:    name,
                code:      'HC-WB-CHECKOUT',
                severity:  ageDays > 7 ? 'medium' : 'low',
                message:   `"${item.label || item.name}" on workbench (${Math.floor(ageDays)}d)`,
                file:      null,
                line:      null,
                timestamp: new Date().toISOString(),
                meta: {
                    itemName:    item.name,
                    ageDays:     Math.floor(ageDays),
                    sizeMb:      item.sizeMb   || null,
                    fileCount:   item.fileCount || null,
                    checkedOutAt,
                    purpose:     item.purpose  || null,
                },
            });
        }

        // Stale cache
        if (state.lastSync) {
            const cacheAgeDays = (now - new Date(state.lastSync).getTime()) / (1000 * 60 * 60 * 24);
            if (cacheAgeDays > 3) {
                findings.push({
                    source:    name,
                    code:      'HC-CACHE-STALE',
                    severity:  'low',
                    message:   `hexcontent cache is ${Math.floor(cacheAgeDays)}d old — run: node hexcontent.js refresh`,
                    file:      CACHE_FILE,
                    line:      null,
                    timestamp: new Date().toISOString(),
                    meta: {
                        lastSync:     state.lastSync,
                        cacheAgeDays: Math.floor(cacheAgeDays),
                    },
                });
            }
        }

        return findings;
    }

    /**
     * getStatus
     *
     * Returns a compact object consumed by nexus.js status/report commands.
     * The `counts` key maps to the generic spoke display branch in nexus.js.
     */
    function getStatus() {
        const state = readCache();

        if (!state) {
            return {
                available: false,
                reason:    'cache file not found — run: node hexcontent.js refresh',
            };
        }

        const cold      = state.coldStorage || { totalItems: 0, totalSizeMb: 0 };
        const workbench = state.workbench   || { totalItems: 0, totalSizeMb: 0 };
        const disk      = state.diskUsage   || {};

        return {
            available:       true,
            name:            'hexcontent',
            source:          state.source || 'cache',
            lastSync:        state.lastSync || null,
            isLive:          state.source === 'live',

            coldItems:       cold.totalItems      || 0,
            coldSizeMb:      cold.totalSizeMb     || 0,

            workbenchItems:  workbench.totalItems  || 0,
            workbenchSizeMb: workbench.totalSizeMb || 0,

            totalSizeMb:     disk.totalMb || 0,

            // Generic nexus.js spoke display uses `counts` for a key→value breakdown
            counts: {
                'cold storage': cold.totalItems      || 0,
                'on workbench': workbench.totalItems  || 0,
            },

            // Generic display also uses totalItems for the fallback single-number line
            totalItems: (cold.totalItems || 0) + (workbench.totalItems || 0),
        };
    }

    function acceptFinding() {
        return { accepted: false, reason: 'read-only spoke' };
    }

    /**
     * refresh — public method for programmatic use (e.g. a future nexus pull hexcontent).
     * Returns { ok, state? } or { ok: false, reason }.
     */
    function refresh() {
        const liveState = fetchLiveState();
        if (!liveState) return { ok: false, reason: 'bc1 unreachable' };
        writeCache(liveState);
        return { ok: true, state: liveState };
    }

    return {
        name,
        getFindings,
        getStatus,
        acceptFinding,
        refresh,
    };
};

// --- Standalone CLI ---
// Runs when invoked directly: node hexcontent.js <command>
// Bypasses Nexus hub entirely — useful for quick bc1 checks from the terminal.

if (require.main === module) {

    const NEXUS_DIR  = path.resolve(__dirname, '..');
    const CACHE_PATH = path.join(NEXUS_DIR, 'cache', 'hexcontent-state.json');

    // Instantiate the adapter with canonical paths
    const adapter = module.exports({
        name:        'hexcontent',
        dataPath:    CACHE_PATH,
        projectRoot: path.resolve(NEXUS_DIR, '../..'),
    });

    const command = process.argv[2];

    // ── help ──────────────────────────────────────────────────────────────────
    if (!command || command === 'help' || command === '--help' || command === '-h') {
        console.log(`
${C.bold}hexcontent adapter${C.reset} — bc1 cold storage spoke for Nexus

${C.bold}COMMANDS${C.reset}

  ${C.cyan}status${C.reset}     Summary: cold storage + workbench counts
  ${C.cyan}list${C.reset}       Full cold storage inventory
  ${C.cyan}workbench${C.reset}  Items currently on the workbench
  ${C.cyan}refresh${C.reset}    SSH to bc1 and update the cache
  ${C.cyan}help${C.reset}       Show this help

${C.bold}CACHE${C.reset}

  ${C.dim}${CACHE_PATH}${C.reset}
`);
        process.exit(0);
    }

    // ── status ────────────────────────────────────────────────────────────────
    if (command === 'status') {
        const st = adapter.getStatus();
        console.log('');
        console.log(`${C.bold}HEXCONTENT STATUS${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}`);
        console.log('');

        if (!st.available) {
            console.log(`  ${C.yellow}No data${C.reset}  ${C.dim}${st.reason}${C.reset}`);
        } else {
            const srcLabel = st.isLive
                ? `${C.green}live${C.reset}`
                : `${C.yellow}cached${C.reset}`;

            console.log(`  ${C.bold}Cold storage${C.reset}    ${C.cyan}${st.coldItems}${C.reset} items  ${C.dim}${fmtSize(st.coldSizeMb)}${C.reset}`);
            console.log(`  ${C.bold}Workbench${C.reset}       ${st.workbenchItems > 0 ? C.yellow : C.dim}${st.workbenchItems}${C.reset} checked out  ${C.dim}${fmtSize(st.workbenchSizeMb)}${C.reset}`);
            console.log(`  ${C.bold}Total on bc1${C.reset}    ${C.dim}${fmtSize(st.totalSizeMb)}${C.reset}`);
            console.log('');
            console.log(`  ${C.dim}source: ${C.reset}${srcLabel}  ${C.dim}· last sync: ${timeAgo(st.lastSync)}${C.reset}`);
        }
        console.log('');
        process.exit(0);
    }

    // ── list ──────────────────────────────────────────────────────────────────
    if (command === 'list') {
        // Read cache directly for display (adapter.getStatus() is summarized)
        const CACHE_FILE = CACHE_PATH;
        let state = null;
        try { state = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (_) {}

        console.log('');
        console.log(`${C.bold}COLD STORAGE INVENTORY${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}`);
        console.log('');

        if (!state || !state.coldStorage || !state.coldStorage.items.length) {
            console.log(`  ${C.dim}No data. Run: node hexcontent.js refresh${C.reset}`);
        } else {
            const items = state.coldStorage.items;
            for (const item of items) {
                const nameCol  = item.name.padEnd(22);
                const labelCol = (item.label && item.label !== item.name)
                    ? `${C.dim}${item.label}${C.reset}  `
                    : '';
                const sizeCol  = fmtSize(item.sizeMb).padStart(7);
                const fileCol  = item.fileCount != null ? `${C.dim}${item.fileCount} files${C.reset}` : '';
                const tagCol   = item.tags && item.tags.length
                    ? `  ${C.gray}[${item.tags.join(', ')}]${C.reset}`
                    : '';
                console.log(`  ${C.cyan}${nameCol}${C.reset}${labelCol}${sizeCol}  ${fileCol}${tagCol}`);
            }
            console.log('');
            console.log(`  ${C.dim}${items.length} items · ${fmtSize(state.coldStorage.totalSizeMb)} total${C.reset}`);
        }
        console.log('');
        process.exit(0);
    }

    // ── workbench ─────────────────────────────────────────────────────────────
    if (command === 'workbench') {
        const CACHE_FILE = CACHE_PATH;
        let state = null;
        try { state = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (_) {}

        console.log('');
        console.log(`${C.bold}WORKBENCH${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}`);
        console.log('');

        if (!state || !state.workbench || !state.workbench.items.length) {
            console.log(`  ${C.dim}Workbench is empty.${C.reset}`);
        } else {
            const items = state.workbench.items;
            for (const item of items) {
                const checkedOutAt = item.checkedOutAt || state.lastSync;
                const ageDays = Math.floor(
                    (Date.now() - new Date(checkedOutAt).getTime()) / (1000 * 60 * 60 * 24)
                );
                const ageLabel = ageDays > 7
                    ? `${C.yellow}${ageDays}d${C.reset}`
                    : `${C.dim}${ageDays}d${C.reset}`;

                const indent = ' '.repeat(item.name.length + 2);
                console.log(`  ${C.cyan}${item.name}${C.reset}  ${C.dim}${fmtSize(item.sizeMb)}  on workbench ${ageLabel}${C.reset}`);
                if (item.purpose) {
                    console.log(`  ${indent}${C.dim}${item.purpose}${C.reset}`);
                }
            }
        }
        console.log('');
        process.exit(0);
    }

    // ── refresh ───────────────────────────────────────────────────────────────
    if (command === 'refresh') {
        console.log('');
        console.log(`${C.bold}HEXCONTENT REFRESH${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}`);
        console.log('');
        console.log(`  ${C.dim}Connecting to ${BC1_DEFAULTS.user}@${BC1_DEFAULTS.host}...${C.reset}`);

        const result = adapter.refresh();

        if (!result.ok) {
            console.log(`  ${C.yellow}bc1 unreachable${C.reset}  ${C.dim}(${result.reason})${C.reset}`);
            console.log('');
            const st = adapter.getStatus();
            if (st.available) {
                console.log(`  ${C.dim}Serving cached state from ${timeAgo(st.lastSync)}${C.reset}`);
            } else {
                console.log(`  ${C.dim}No cache available. Edit manually:${C.reset}`);
                console.log(`  ${C.dim}${CACHE_PATH}${C.reset}`);
            }
        } else {
            const live = result.state;
            const cold = live.coldStorage;
            const wb   = live.workbench;
            console.log(
                `  ${C.green}Connected.${C.reset}  ` +
                `${C.bold}${cold.totalItems}${C.reset} cold  ` +
                `${wb.totalItems > 0 ? C.yellow : C.dim}${wb.totalItems}${C.reset} on workbench  ` +
                `${C.dim}${fmtSize(live.diskUsage.totalMb)} total${C.reset}`
            );
            console.log(`  ${C.dim}Cache updated: ${CACHE_PATH}${C.reset}`);
        }
        console.log('');
        process.exit(0);
    }

    // Unknown command
    console.error(`  ${C.red}Unknown command: ${command}${C.reset}`);
    console.error(`  Run ${C.cyan}node hexcontent.js help${C.reset} for usage.`);
    process.exit(1);
}
