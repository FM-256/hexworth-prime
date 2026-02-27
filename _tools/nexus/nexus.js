#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const hub = require('./hub');
const {
    C, SEVERITY_ORDER, padRight, severityColor, timeAgo
} = hub;

// --- Commands ---

function cmdStatus() {
    const config = hub.loadConfig();
    const spokes = hub.loadSpokes(config);
    const spokeNames = Object.keys(spokes);

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log('');
    console.log(`${C.bold}NEXUS STATUS${C.reset}${' '.repeat(56 - dateStr.length)}${C.dim}${dateStr}${C.reset}`);
    console.log(`${C.dim}${'═'.repeat(68)}${C.reset}`);
    console.log('');

    // Accumulators for combined line
    const combined = { critical: 0, high: 0, medium: 0, low: 0 };
    let totalFindings = 0;
    let connectedSpokes = 0;

    for (const name of spokeNames) {
        const adapter = spokes[name];
        const status = hub.getSpokeStatus(adapter);

        if (!status.available) {
            console.log(`  ${C.bold}${name.toUpperCase()}${C.reset}${' '.repeat(Math.max(1, 17 - name.length))}${C.dim}(no data)${C.reset}`);
            console.log('');
            continue;
        }

        connectedSpokes++;

        if (name === 'eduscan') {
            const sev = status.bySeverity || {};
            const cr = sev.critical || 0;
            const hi = sev.high || 0;
            const me = sev.medium || 0;
            const lo = sev.low || 0;

            combined.critical += cr;
            combined.high += hi;
            combined.medium += me;
            combined.low += lo;
            totalFindings += status.issueCount || 0;

            const sevLine = [
                cr > 0 ? `${C.red}${cr} critical${C.reset}` : `${C.dim}${cr} critical${C.reset}`,
                hi > 0 ? `${C.yellow}${hi} high${C.reset}` : `${C.dim}${hi} high${C.reset}`,
                me > 0 ? `${C.cyan}${me} medium${C.reset}` : `${C.dim}${me} medium${C.reset}`,
                lo > 0 ? `${C.gray}${lo} low${C.reset}` : `${C.dim}${lo} low${C.reset}`,
            ].join('  ');

            const label = padRight(`${C.bold}EDUSCAN${C.reset}`, 24);
            console.log(`  ${label}${sevLine}`);
            console.log(`  ${' '.repeat(17)}${C.dim}last scan: ${timeAgo(status.scannedAt)} · ${status.issueCount} total findings${C.reset}`);

        } else if (name === 'sprint') {
            const c = status.counts || {};
            const parts = [
                c.open > 0 ? `${C.white}${c.open} open${C.reset}` : `${C.dim}${c.open} open${C.reset}`,
                c['in-progress'] > 0 ? `${C.yellow}${c['in-progress']} in-progress${C.reset}` : `${C.dim}${c['in-progress']} in-progress${C.reset}`,
                c.blocked > 0 ? `${C.red}${c.blocked} blocked${C.reset}` : `${C.dim}${c.blocked} blocked${C.reset}`,
                `${C.green}${c.done} done${C.reset}`,
            ].join('  ');

            const label = padRight(`${C.bold}SPRINT MASTER${C.reset}`, 24);
            console.log(`  ${label}${parts}`);
            console.log(`  ${' '.repeat(17)}${C.dim}${status.totalItems} total items · last updated: ${timeAgo(status.lastUpdated)}${C.reset}`);
        }

        console.log('');
    }

    // Combined line
    console.log(`${C.dim}${'═'.repeat(68)}${C.reset}`);
    const combLine = [
        combined.critical > 0 ? `${C.red}${combined.critical} critical${C.reset}` : `${C.dim}${combined.critical} critical${C.reset}`,
        combined.high > 0 ? `${C.yellow}${combined.high} high${C.reset}` : `${C.dim}${combined.high} high${C.reset}`,
        combined.medium > 0 ? `${C.cyan}${combined.medium} medium${C.reset}` : `${C.dim}${combined.medium} medium${C.reset}`,
        combined.low > 0 ? `${C.gray}${combined.low} low${C.reset}` : `${C.dim}${combined.low} low${C.reset}`,
    ].join('  ');

    const store = hub.loadFindings();
    const syncCount = store.findings.length;

    const combLabel = padRight(`${C.bold}COMBINED${C.reset}`, 24);
    console.log(`  ${combLabel}${combLine}`);
    console.log(`  ${' '.repeat(17)}${C.dim}findings store: ${syncCount} synced · ${connectedSpokes} spoke${connectedSpokes !== 1 ? 's' : ''} connected${C.reset}`);
    console.log('');
}

function cmdScan() {
    const config = hub.loadConfig();
    const projectRoot = hub.getProjectRoot();

    console.log('');
    console.log(`${C.bold}NEXUS SCAN${C.reset}`);
    console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);
    console.log('');

    // Step 1: Run EduScan via shell
    console.log(`  ${C.cyan}Running EduScan...${C.reset}`);
    console.log('');

    try {
        execSync('node _tools/eduscan/cli.js', {
            cwd: projectRoot,
            stdio: 'inherit',
            timeout: 120000,
        });
    } catch (err) {
        // EduScan may exit non-zero when it finds critical issues — that's OK.
        // Only truly fatal errors (can't run at all) will lack a status code.
        if (!err.status && err.status !== 1) {
            console.error(`\n  ${C.red}EduScan failed to run: ${err.message}${C.reset}`);
            process.exit(1);
        }
    }

    console.log('');
    console.log(`  ${C.cyan}Syncing findings...${C.reset}`);

    // Step 2: Sync EduScan findings
    const spokes = hub.loadSpokes(config);
    const store = hub.loadFindings();

    if (spokes.eduscan) {
        const result = hub.syncFromSpoke(spokes.eduscan, store);
        hub.saveFindings(store);
        console.log(`  ${C.green}eduscan${C.reset}  ${C.bold}+${result.added}${C.reset} new  ${C.dim}~${result.refreshed} refreshed${C.reset}  ${C.dim}=${result.total} total${C.reset}`);
    } else {
        console.log(`  ${C.yellow}eduscan adapter not available${C.reset}`);
    }

    console.log('');
    console.log(`  ${C.dim}Findings store: ${store.findings.length} total${C.reset}`);
    console.log('');
}

function cmdSync(args) {
    const targetSpoke = args[0] || null;
    const config = hub.loadConfig();
    const spokes = hub.loadSpokes(config);
    const store = hub.loadFindings();

    console.log('');
    console.log(`${C.bold}NEXUS SYNC${C.reset}`);
    console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);
    console.log('');

    const spokeNames = targetSpoke ? [targetSpoke] : Object.keys(spokes);
    let anySync = false;

    for (const name of spokeNames) {
        const adapter = spokes[name];
        if (!adapter) {
            console.log(`  ${C.yellow}${name}${C.reset}  ${C.dim}spoke not found — skipping${C.reset}`);
            continue;
        }

        try {
            const result = hub.syncFromSpoke(adapter, store);
            console.log(`  ${C.green}${name}${C.reset}  ${C.bold}+${result.added}${C.reset} new  ${C.dim}~${result.refreshed} refreshed${C.reset}  ${C.dim}=${result.total} total${C.reset}`);
            anySync = true;
        } catch (err) {
            console.log(`  ${C.red}${name}${C.reset}  ${C.dim}error: ${err.message}${C.reset}`);
        }
    }

    if (anySync) {
        hub.saveFindings(store);
    }

    console.log('');
    console.log(`  ${C.dim}Findings store: ${store.findings.length} total${C.reset}`);
    console.log('');
}

// --- Help ---

function showHelp() {
    console.log(`
${C.bold}nexus${C.reset} — Hexworth Prime Hub & Spoke Tool Orchestrator

${C.bold}COMMANDS${C.reset}

  ${C.cyan}status${C.reset}                  Unified dashboard — live data from all spokes
  ${C.cyan}scan${C.reset}                    Run EduScan + sync findings into store
  ${C.cyan}sync${C.reset} [spoke]            Sync all spokes (or one named spoke)
  ${C.cyan}help${C.reset}                    Show this help message

${C.bold}EXAMPLES${C.reset}

  nexus status              Show combined status from all tools
  nexus scan                Run EduScan and sync results
  nexus sync                Sync all spokes into findings store
  nexus sync eduscan        Sync only EduScan findings

${C.bold}DATA${C.reset}

  ${C.dim}Config:   ${hub.CONFIG_FILE}${C.reset}
  ${C.dim}Findings: ${hub.FINDINGS_FILE}${C.reset}
`);
}

// --- CLI Router ---

const argv = process.argv.slice(2);
const command = argv[0];
const cmdArgs = argv.slice(1);

if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
}

switch (command) {
    case 'status':
    case 'st':
        cmdStatus();
        break;
    case 'scan':
        cmdScan();
        break;
    case 'sync':
        cmdSync(cmdArgs);
        break;
    default:
        console.error(`  ${C.red}Unknown command: ${command}${C.reset}`);
        console.error(`  Run ${C.cyan}nexus help${C.reset} for usage.`);
        process.exit(1);
}
