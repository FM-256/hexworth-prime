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

        } else {
            // Generic spoke display
            const displayName = (status.name || name).toUpperCase();
            const label = padRight(`${C.bold}${displayName}${C.reset}`, 24);

            // Try to render severity breakdown if available
            const sev = status.bySeverity;
            if (sev && Object.keys(sev).length > 0) {
                const sevParts = [];
                for (const s of SEVERITY_ORDER) {
                    if (sev[s]) sevParts.push(`${severityColor(s)}${sev[s]} ${s}${C.reset}`);
                }
                console.log(`  ${label}${sevParts.join('  ')}`);
                combined.critical += sev.critical || 0;
                combined.high += sev.high || 0;
                combined.medium += sev.medium || 0;
                combined.low += sev.low || 0;
            } else if (status.counts && Object.keys(status.counts).length > 0) {
                const countParts = Object.entries(status.counts).map(([k, v]) => `${C.dim}${v} ${k}${C.reset}`);
                console.log(`  ${label}${countParts.join('  ')}`);
            } else {
                const total = status.totalItems || status.totalFindings || status.uniqueFindings || status.totalSpells || 0;
                console.log(`  ${label}${C.dim}${total} item${total !== 1 ? 's' : ''}${C.reset}`);
            }

            // Summary sub-line
            const detailParts = [];
            if (status.totalItems != null) detailParts.push(`${status.totalItems} total`);
            if (status.totalFindings != null) detailParts.push(`${status.totalFindings} findings`);
            if (status.totalSpells != null) detailParts.push(`${status.totalSpells} spells`);
            if (status.uniqueFindings != null) detailParts.push(`${status.uniqueFindings} unique`);
            if (status.totalEntries != null) detailParts.push(`${status.totalEntries} entries`);
            if (detailParts.length) {
                console.log(`  ${' '.repeat(17)}${C.dim}${detailParts.join(' · ')}${C.reset}`);
            }
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

async function cmdScan(args, flags) {
    const publish = flags.publish || false;
    const config = hub.loadConfig();
    const projectRoot = hub.getProjectRoot();

    const scanStart = Date.now();

    console.log('');
    console.log(`${C.bold}NEXUS SCAN${C.reset}${publish ? `  ${C.cyan}(publish)${C.reset}` : ''}`);
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

    // Step 2b: Auto-save scan history snapshot
    if (spokes.history && spokes.history.save) {
        console.log('');
        spokes.history.save();
    }

    // Step 3: Publish to Firestore (always — keeps dashboard fresh)
    {
        const duration = Date.now() - scanStart;
        const gateResult = hub.runGate(config, spokes, { strict: false });
        const { buildSummary, publishToFirestore } = require('./publish');
        const summary = buildSummary(hub, config, spokes, store, gateResult, duration);

        console.log('');
        console.log(`  ${C.cyan}Publishing to Firestore...${C.reset}`);
        try {
            await publishToFirestore(summary);
            console.log(`  ${C.green}Published${C.reset} ${C.dim}→ _quality_reports/latest${C.reset}`);
        } catch (err) {
            console.error(`  ${C.red}Publish failed: ${err.message}${C.reset}`);
        }
    }

    console.log('');
}

function cmdSync(args, flags) {
    const prune = flags.prune || false;
    // First non-flag arg is spoke name
    const targetSpoke = args.find(a => !a.startsWith('-')) || null;
    const config = hub.loadConfig();
    const spokes = hub.loadSpokes(config);
    const store = hub.loadFindings();

    console.log('');
    console.log(`${C.bold}NEXUS SYNC${C.reset}${prune ? `  ${C.yellow}(pruning stale)${C.reset}` : ''}`);
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
            const result = hub.syncFromSpoke(adapter, store, { prune });
            let line = `  ${C.green}${name}${C.reset}  ${C.bold}+${result.added}${C.reset} new  ${C.dim}~${result.refreshed} refreshed${C.reset}`;
            if (prune && result.pruned > 0) {
                line += `  ${C.red}-${result.pruned} pruned${C.reset}`;
            }
            line += `  ${C.dim}=${result.total} total${C.reset}`;
            console.log(line);
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

function cmdTriage(args, flags) {
    const apply = flags.apply || false;
    const severityFilter = flags.severity
        ? flags.severity.split(',').map(s => s.trim().toLowerCase())
        : ['critical', 'high'];

    const config = hub.loadConfig();
    const spokes = hub.loadSpokes(config);
    const store = hub.loadFindings();

    if (!store.findings.length) {
        console.error(`\n  ${C.red}No findings — run ${C.cyan}nexus sync${C.red} first.${C.reset}\n`);
        process.exit(1);
    }

    if (!spokes.sprint) {
        console.error(`\n  ${C.red}Sprint Master adapter not available.${C.reset}\n`);
        process.exit(1);
    }

    // Filter findings: only scanner sources (not sprint items feeding back), and by severity
    const SCANNER_SOURCES = ['eduscan', 'hed', 'audit', 'todo'];
    const filtered = store.findings.filter(f =>
        severityFilter.includes(f.severity) && SCANNER_SOURCES.includes(f.source)
    );

    if (!filtered.length) {
        console.log(`\n  ${C.dim}No findings matching severity: ${severityFilter.join(', ')}${C.reset}\n`);
        return;
    }

    const modeLabel = apply ? '' : ' (dry run)';
    console.log('');
    console.log(`${C.bold}NEXUS TRIAGE${C.reset}${C.dim}${modeLabel}${C.reset}`);
    console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);

    const result = hub.triageToSpoke(filtered, spokes.sprint, { dryRun: !apply });

    // Print results table
    for (const item of result.created) {
        const sevCol = severityColor(item.severity);
        const codeCol = padRight(item.code, 12);
        const sevLabel = padRight(item.severity, 10);
        console.log(`  ${C.bold}${codeCol}${C.reset}${sevCol}${sevLabel}${C.reset}${C.dim}${item.count} file${item.count !== 1 ? 's' : ''}${C.reset}  ${C.green}\u2192 ${item.reference} (new)${C.reset}`);
    }
    for (const item of result.skipped) {
        const sevCol = severityColor(item.severity);
        const codeCol = padRight(item.code, 12);
        const sevLabel = padRight(item.severity, 10);
        console.log(`  ${C.dim}${codeCol}${sevLabel}${item.count} file${item.count !== 1 ? 's' : ''}  \u2192 (already tracked as ${item.reference})${C.reset}`);
    }

    console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);
    const parts = [];
    if (result.created.length) parts.push(`${C.green}+${result.created.length} new item${result.created.length !== 1 ? 's' : ''}${C.reset}`);
    if (result.skipped.length) parts.push(`${C.dim}=${result.skipped.length} already tracked${C.reset}`);
    parts.push(`${C.dim}${result.total} code${result.total !== 1 ? 's' : ''} triaged${C.reset}`);
    console.log(`  ${parts.join('  ')}`);

    if (!apply && result.created.length > 0) {
        console.log(`\n  ${C.dim}To apply: ${C.cyan}nexus triage --apply${C.reset}`);
    }
    console.log('');
}

function cmdReport(args, flags) {
    const jsonOutput = flags.json || false;
    const config = hub.loadConfig();
    const spokes = hub.loadSpokes(config);
    const store = hub.loadFindings();

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (jsonOutput) {
        const report = {
            date: dateStr,
            spokes: {},
            findingsStore: {
                total: store.findings.length,
                lastSync: store.lastSync,
                bySeverity: store.stats.bySeverity || {},
                bySource: store.stats.bySource || {},
            },
        };

        for (const [name, adapter] of Object.entries(spokes)) {
            const status = hub.getSpokeStatus(adapter);
            report.spokes[name] = status;
        }

        console.log(JSON.stringify(report, null, 2));
        return;
    }

    // Markdown output
    console.log(`# Nexus Report \u2014 ${dateStr}`);
    console.log('');

    for (const [name, adapter] of Object.entries(spokes)) {
        const status = hub.getSpokeStatus(adapter);

        if (name === 'eduscan') {
            console.log('## EduScan');
            if (!status.available) {
                console.log('- (no data)');
            } else {
                const sev = status.bySeverity || {};
                console.log(`- ${status.issueCount || 0} findings: ${sev.critical || 0} critical, ${sev.high || 0} high, ${sev.medium || 0} medium, ${sev.low || 0} low`);
                console.log(`- Last scan: ${timeAgo(status.scannedAt)}`);

                // Top codes from findings store
                const eduFindings = store.findings.filter(f => f.source === 'eduscan');
                if (eduFindings.length > 0) {
                    const codeCounts = {};
                    for (const f of eduFindings) {
                        codeCounts[f.code] = (codeCounts[f.code] || 0) + 1;
                    }
                    const topCodes = Object.entries(codeCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([code, count]) => `${code} (${count})`)
                        .join(', ');
                    console.log(`- Top codes: ${topCodes}`);
                }
            }
            console.log('');

        } else if (name === 'sprint') {
            console.log('## Sprint Master');
            if (!status.available) {
                console.log('- (no data)');
            } else {
                const c = status.counts || {};
                console.log(`- ${status.totalItems} items: ${c.open || 0} open, ${c['in-progress'] || 0} in-progress, ${c.blocked || 0} blocked, ${c.done || 0} done`);
                console.log(`- Last updated: ${timeAgo(status.lastUpdated)}`);
            }
            console.log('');

        } else {
            // Generic spoke report
            const displayName = status.name || name.charAt(0).toUpperCase() + name.slice(1);
            console.log(`## ${displayName}`);
            if (!status.available) {
                console.log(`- (no data${status.reason ? ': ' + status.reason : ''})`);
            } else {
                const sev = status.bySeverity;
                if (sev && Object.keys(sev).length > 0) {
                    const sevParts = SEVERITY_ORDER
                        .filter(s => sev[s])
                        .map(s => `${sev[s]} ${s}`);
                    console.log(`- Findings: ${sevParts.join(', ') || 'none'}`);
                }
                if (status.counts && Object.keys(status.counts).length > 0) {
                    const countParts = Object.entries(status.counts).map(([k, v]) => `${v} ${k}`);
                    console.log(`- Counts: ${countParts.join(', ')}`);
                }
                if (status.totalItems != null) console.log(`- Total items: ${status.totalItems}`);
                if (status.totalFindings != null) console.log(`- Total findings: ${status.totalFindings}`);
                if (status.totalSpells != null) console.log(`- Total spells: ${status.totalSpells}`);
            }
            console.log('');
        }
    }

    console.log('## Combined Findings Store');
    console.log(`- ${store.findings.length} synced findings from ${Object.keys(store.stats.bySource || {}).length} spoke${Object.keys(store.stats.bySource || {}).length !== 1 ? 's' : ''}`);
    console.log(`- Last sync: ${timeAgo(store.lastSync)}`);
    console.log('');
}

function cmdGate(args, flags) {
    const strict = flags.strict || false;
    const jsonOutput = flags.json || false;
    const config = hub.loadConfig();
    const spokes = hub.loadSpokes(config);

    const result = hub.runGate(config, spokes, { strict });

    if (jsonOutput) {
        const output = {
            passed: result.passed,
            failOn: result.failOn,
            bySeverity: result.bySeverity,
            blockingCount: result.blocking.length,
            polled: result.polled,
            skipped: result.skipped,
            errors: result.errors,
        };
        console.log(JSON.stringify(output, null, 2));
        process.exit(result.passed ? 0 : 1);
    }

    console.log('');
    console.log(`${C.bold}NEXUS GATE${C.reset}${strict ? `  ${C.yellow}(strict)${C.reset}` : ''}`);
    console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);
    console.log('');

    // Show polled/skipped
    if (result.polled.length) {
        console.log(`  ${C.dim}Polled:  ${result.polled.join(', ')}${C.reset}`);
    }
    if (result.skipped.length) {
        console.log(`  ${C.dim}Skipped: ${result.skipped.join(', ')} (no data)${C.reset}`);
    }
    if (result.errors.length) {
        for (const e of result.errors) {
            console.log(`  ${C.red}Error:   ${e.source} — ${e.error}${C.reset}`);
        }
    }
    console.log('');

    // Severity summary
    const sevLine = SEVERITY_ORDER
        .filter(s => result.bySeverity[s])
        .map(s => `${severityColor(s)}${result.bySeverity[s]} ${s}${C.reset}`)
        .join('  ');
    if (sevLine) {
        console.log(`  ${sevLine}`);
        console.log('');
    }

    // Fail criteria
    console.log(`  ${C.dim}Blocking on: ${result.failOn.join(', ')}${C.reset}`);
    console.log('');

    if (result.passed) {
        console.log(`  ${C.green}${C.bold}GATE PASSED${C.reset}  ${C.dim}No blocking findings.${C.reset}`);
    } else {
        console.log(`  ${C.red}${C.bold}GATE FAILED${C.reset}  ${C.red}${result.blocking.length} blocking finding${result.blocking.length !== 1 ? 's' : ''}${C.reset}`);

        // Show top 5 blocking findings
        const top = result.blocking.slice(0, 5);
        console.log('');
        for (const f of top) {
            console.log(`  ${severityColor(f.severity)}${padRight(f.severity, 10)}${C.reset}${C.bold}${f.code}${C.reset}  ${C.dim}${hub.truncate(f.message, 45)}${C.reset}`);
        }
        if (result.blocking.length > 5) {
            console.log(`  ${C.dim}... and ${result.blocking.length - 5} more${C.reset}`);
        }
    }

    console.log('');
    process.exit(result.passed ? 0 : 1);
}

function cmdPipe(args, flags) {
    const pipeName = args[0];
    const dryRun = flags['dry-run'] || false;
    const threshold = flags.threshold ? parseInt(flags.threshold, 10) : undefined;

    if (!pipeName) {
        console.error(`\n  ${C.red}Usage: nexus pipe <pipe-name>${C.reset}`);
        console.error(`  ${C.dim}Available: hed-github${C.reset}\n`);
        process.exit(1);
    }

    const config = hub.loadConfig();
    const spokes = hub.loadSpokes(config);
    const pipeConfig = (config.pipes && config.pipes[pipeName]) || {};

    if (pipeName === 'hed-github') {
        const adapter = spokes.hed;
        if (!adapter) {
            console.error(`\n  ${C.red}HED spoke not available.${C.reset}\n`);
            process.exit(1);
        }

        console.log('');
        console.log(`${C.bold}NEXUS PIPE${C.reset}  ${C.cyan}hed-github${C.reset}${dryRun ? `  ${C.yellow}(dry run)${C.reset}` : ''}`);
        console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);
        console.log('');

        const options = { dryRun };
        if (threshold != null) options.threshold = threshold;

        const result = hub.pipeHedToGithub(adapter, pipeConfig, options);

        if (result.noData) {
            console.log(`  ${C.dim}No HED data available. Export from HED panel first.${C.reset}`);
            console.log('');
            return;
        }

        console.log(`  ${C.dim}Threshold: >= ${result.threshold || pipeConfig.threshold || 3} occurrences${C.reset}`);
        console.log('');

        for (const item of result.created) {
            if (item.wouldCreate) {
                console.log(`  ${C.cyan}[would create]${C.reset}  ${item.title}`);
            } else {
                console.log(`  ${C.green}[created]${C.reset}  ${item.title}`);
            }
        }
        for (const item of result.skipped) {
            console.log(`  ${C.dim}[skipped]  ${item.code} — ${item.reason}${C.reset}`);
        }

        if (!result.created.length && !result.skipped.length) {
            console.log(`  ${C.dim}No findings met the threshold.${C.reset}`);
        }

        console.log('');
        const parts = [];
        if (result.created.length) parts.push(`${C.green}${result.created.length} created${C.reset}`);
        if (result.skipped.length) parts.push(`${C.dim}${result.skipped.length} skipped${C.reset}`);
        if (parts.length) console.log(`  ${parts.join('  ')}`);
        console.log('');
    } else {
        console.error(`\n  ${C.red}Unknown pipe: ${pipeName}${C.reset}`);
        console.error(`  ${C.dim}Available: hed-github${C.reset}\n`);
        process.exit(1);
    }
}

async function cmdPull(args, flags) {
    const source = args[0];

    if (!source) {
        console.log('');
        console.log(`${C.bold}NEXUS PULL${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);
        console.log('');
        console.log(`  ${C.dim}Available sources:${C.reset}`);
        console.log(`    ${C.cyan}hed${C.reset}    Pull HED errors from Cloud Function`);
        console.log('');
        console.log(`  ${C.dim}Usage: nexus pull <source>${C.reset}`);
        console.log('');
        return;
    }

    if (source === 'hed') {
        console.log('');
        console.log(`${C.bold}NEXUS PULL${C.reset}  ${C.cyan}hed${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(68)}${C.reset}`);
        console.log('');

        const config = hub.loadConfig();
        console.log(`  ${C.dim}Fetching HED errors from Cloud Function...${C.reset}`);

        const result = await hub.pullHed(config);

        if (result.success) {
            console.log(`  ${C.green}Pulled ${result.count} error${result.count !== 1 ? 's' : ''}${C.reset}  ${C.dim}→ ${result.path}${C.reset}`);
        } else {
            console.log(`  ${C.red}Pull failed:${C.reset} ${C.dim}${result.reason}${C.reset}`);
        }
        console.log('');
    } else {
        console.error(`\n  ${C.red}Unknown pull source: ${source}${C.reset}`);
        console.error(`  ${C.dim}Available: hed${C.reset}\n`);
        process.exit(1);
    }
}

async function cmdFull(args, flags) {
    const strict = flags.strict || false;
    // Always publish on full pipeline — the admin console Quality panel
    // reads from Firestore, so every full run should update it.
    // Use --no-publish to skip if needed (e.g., offline).
    const publish = flags.publish !== false;
    const config = hub.loadConfig();
    const projectRoot = hub.getProjectRoot();

    const scanStart = Date.now();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log('');
    console.log(`${C.bold}NEXUS FULL${C.reset}${strict ? `  ${C.yellow}(strict)${C.reset}` : ''}${publish ? `  ${C.cyan}(publish)${C.reset}` : ''}${' '.repeat(Math.max(1, (strict ? 43 : publish ? 43 : 52) - dateStr.length))}${C.dim}${dateStr}${C.reset}`);
    console.log(`${C.dim}${'═'.repeat(68)}${C.reset}`);

    // Step 1: Scan
    console.log('');
    console.log(`  ${C.bold}[1/6]${C.reset} ${C.cyan}Running EduScan...${C.reset}`);
    console.log('');

    try {
        execSync('node _tools/eduscan/cli.js', {
            cwd: projectRoot,
            stdio: 'inherit',
            timeout: 120000,
        });
    } catch (err) {
        if (!err.status && err.status !== 1) {
            console.error(`\n  ${C.red}EduScan failed to run: ${err.message}${C.reset}`);
            process.exit(1);
        }
    }

    // Step 2: Pull HED data (silent skip on failure)
    console.log('');
    console.log(`  ${C.bold}[2/6]${C.reset} ${C.cyan}Pulling HED data...${C.reset}`);

    try {
        const pullResult = await hub.pullHed(config);
        if (pullResult.success) {
            console.log(`  ${C.green}hed${C.reset}  ${C.bold}${pullResult.count}${C.reset} ${C.dim}error${pullResult.count !== 1 ? 's' : ''} pulled${C.reset}`);
        } else {
            console.log(`  ${C.dim}hed  skipped (${pullResult.reason})${C.reset}`);
        }
    } catch (err) {
        console.log(`  ${C.dim}hed  skipped (${err.message})${C.reset}`);
    }

    // Step 3: Sync all spokes (with prune)
    console.log('');
    console.log(`  ${C.bold}[3/6]${C.reset} ${C.cyan}Syncing all spokes...${C.reset}`);
    console.log('');

    const spokes = hub.loadSpokes(config);
    const store = hub.loadFindings();

    for (const name of Object.keys(spokes)) {
        const adapter = spokes[name];
        try {
            const result = hub.syncFromSpoke(adapter, store, { prune: true });
            let line = `  ${C.green}${name}${C.reset}  ${C.bold}+${result.added}${C.reset} new  ${C.dim}~${result.refreshed} refreshed${C.reset}`;
            if (result.pruned > 0) {
                line += `  ${C.red}-${result.pruned} pruned${C.reset}`;
            }
            line += `  ${C.dim}=${result.total} total${C.reset}`;
            console.log(line);
        } catch (err) {
            console.log(`  ${C.red}${name}${C.reset}  ${C.dim}error: ${err.message}${C.reset}`);
        }
    }

    hub.saveFindings(store);
    console.log(`\n  ${C.dim}Findings store: ${store.findings.length} total${C.reset}`);

    // Step 4: Triage — always apply (dedup prevents duplicates)
    console.log('');
    console.log(`  ${C.bold}[4/6]${C.reset} ${C.cyan}Triage scan findings...${C.reset}`);

    if (spokes.sprint) {
        const SCANNER_SOURCES = ['eduscan', 'hed', 'audit', 'todo'];
        const triageFiltered = store.findings.filter(f =>
            ['critical', 'high'].includes(f.severity) && SCANNER_SOURCES.includes(f.source)
        );

        if (triageFiltered.length) {
            const triageResult = hub.triageToSpoke(triageFiltered, spokes.sprint, { dryRun: false });

            if (triageResult.created.length) {
                const label = 'created';
                console.log(`  ${C.green}+${triageResult.created.length}${C.reset} ${C.dim}items ${label}${C.reset}`);
            }
            if (triageResult.skipped.length) {
                console.log(`  ${C.dim}=${triageResult.skipped.length} already tracked${C.reset}`);
            }
        } else {
            console.log(`  ${C.dim}No critical/high scanner findings to triage${C.reset}`);
        }
    } else {
        console.log(`  ${C.dim}Sprint Master not available${C.reset}`);
    }

    // Step 5: Gate
    console.log('');
    console.log(`  ${C.bold}[5/6]${C.reset} ${C.cyan}Running deploy gate...${C.reset}`);
    console.log('');

    const gateResult = hub.runGate(config, spokes, { strict });

    if (gateResult.polled.length) {
        console.log(`  ${C.dim}Polled:  ${gateResult.polled.join(', ')}${C.reset}`);
    }
    if (gateResult.skipped.length) {
        console.log(`  ${C.dim}Skipped: ${gateResult.skipped.join(', ')} (no data)${C.reset}`);
    }

    const sevLine = SEVERITY_ORDER
        .filter(s => gateResult.bySeverity[s])
        .map(s => `${severityColor(s)}${gateResult.bySeverity[s]} ${s}${C.reset}`)
        .join('  ');
    if (sevLine) {
        console.log(`\n  ${sevLine}`);
    }

    console.log(`\n  ${C.dim}Blocking on: ${gateResult.failOn.join(', ')}${C.reset}`);

    if (gateResult.passed) {
        console.log(`\n  ${C.green}${C.bold}GATE PASSED${C.reset}`);
    } else {
        console.log(`\n  ${C.red}${C.bold}GATE FAILED${C.reset}  ${C.red}${gateResult.blocking.length} blocking finding${gateResult.blocking.length !== 1 ? 's' : ''}${C.reset}`);
    }

    // Step 5: Status summary
    console.log('');
    console.log(`  ${C.bold}[6/6]${C.reset} ${C.cyan}Status summary${C.reset}`);
    console.log('');

    let connectedSpokes = 0;
    for (const name of Object.keys(spokes)) {
        const status = hub.getSpokeStatus(spokes[name]);
        if (status.available) connectedSpokes++;

        const displayName = (status.name || name).toUpperCase();
        const label = padRight(`  ${C.bold}${displayName}${C.reset}`, 26);

        if (!status.available) {
            console.log(`${label}${C.dim}(no data)${C.reset}`);
        } else if (status.bySeverity && Object.keys(status.bySeverity).length > 0) {
            const parts = SEVERITY_ORDER
                .filter(s => status.bySeverity[s])
                .map(s => `${severityColor(s)}${status.bySeverity[s]} ${s}${C.reset}`);
            console.log(`${label}${parts.join('  ')}`);
        } else if (status.counts && Object.keys(status.counts).length > 0) {
            const parts = Object.entries(status.counts).map(([k, v]) => `${C.dim}${v} ${k}${C.reset}`);
            console.log(`${label}${parts.join('  ')}`);
        } else {
            const total = status.totalItems || status.totalFindings || status.totalSpells || 0;
            console.log(`${label}${C.dim}${total} items${C.reset}`);
        }
    }

    console.log('');
    console.log(`${C.dim}${'═'.repeat(68)}${C.reset}`);
    console.log(`  ${C.dim}${connectedSpokes} spoke${connectedSpokes !== 1 ? 's' : ''} connected · ${store.findings.length} findings synced · gate: ${gateResult.passed ? `${C.green}PASS${C.dim}` : `${C.red}FAIL${C.dim}`}${C.reset}`);
    console.log('');

    // Publish to Firestore (always — keeps dashboard fresh)
    {
        console.log(`  ${C.cyan}Publishing to Firestore...${C.reset}`);
        try {
            const duration = Date.now() - scanStart;
            const { buildSummary, publishToFirestore } = require('./publish');
            const summary = buildSummary(hub, config, spokes, store, gateResult, duration);
            await publishToFirestore(summary);
            console.log(`  ${C.green}Published${C.reset} ${C.dim}→ _quality_reports/latest${C.reset}`);
        } catch (err) {
            console.error(`  ${C.red}Publish failed: ${err.message}${C.reset}`);
        }
        console.log('');
    }

    process.exit(gateResult.passed ? 0 : 1);
}

// --- Help ---

function showHelp() {
    console.log(`
${C.bold}nexus${C.reset} — Hexworth Prime Hub & Spoke Tool Orchestrator

${C.bold}COMMANDS${C.reset}

  ${C.cyan}full${C.reset}                    Full pipeline: scan → pull → sync → gate → status
  ${C.cyan}status${C.reset}                  Unified dashboard — live data from all spokes
  ${C.cyan}scan${C.reset}                    Run EduScan + sync findings into store
  ${C.cyan}pull${C.reset} <source>           Pull data from cloud (e.g. hed)
  ${C.cyan}sync${C.reset} [spoke]            Sync all spokes (or one named spoke)
  ${C.cyan}triage${C.reset}                  Auto-create Sprint Master items from findings
  ${C.cyan}gate${C.reset}                    Deploy gate — block on critical findings
  ${C.cyan}pipe${C.reset} <name>             Run a named pipe (e.g. hed-github)
  ${C.cyan}report${C.reset}                  Cross-tool summary (markdown to stdout)
  ${C.cyan}help${C.reset}                    Show this help message

${C.bold}FLAGS${C.reset}

  ${C.dim}--apply${C.reset}                  Actually write (triage defaults to dry-run)
  ${C.dim}--publish${C.reset}                Publish scan results to Firestore (full, scan)
  ${C.dim}--triage${C.reset}                 Full: auto-create sprint items during full run
  ${C.dim}--prune${C.reset}                  Remove stale findings during sync
  ${C.dim}--severity${C.reset} critical,high Severity filter for triage (default: critical,high)
  ${C.dim}--json${C.reset}                   Output as JSON (report, gate)
  ${C.dim}--strict${C.reset}                 Gate: block on critical + high
  ${C.dim}--dry-run${C.reset}                Pipe: show what would be created
  ${C.dim}--threshold${C.reset} N            Pipe: minimum occurrence count (default: 3)

${C.bold}EXAMPLES${C.reset}

  nexus full                Full pipeline (scan + pull + sync + gate + status)
  nexus full --publish      Full pipeline + publish results to Firestore
  nexus full --strict       Full pipeline, gate blocks on critical + high
  nexus pull hed            Pull HED errors from Cloud Function
  nexus status              Show combined status from all tools
  nexus scan                Run EduScan and sync results
  nexus sync                Sync all spokes into findings store
  nexus sync --prune        Sync and remove stale findings
  nexus triage              Dry-run: show what items would be created
  nexus triage --apply      Create Sprint Master backlog items
  nexus gate                Deploy gate (blocks on critical)
  nexus gate --strict       Deploy gate (blocks on critical + high)
  nexus gate --json         Gate result as JSON
  nexus pipe hed-github     Create GitHub issues from HED errors
  nexus pipe hed-github --dry-run   Preview without creating
  nexus report              Markdown summary to stdout
  nexus report --json       JSON summary to stdout

${C.bold}DATA${C.reset}

  ${C.dim}Config:   ${hub.CONFIG_FILE}${C.reset}
  ${C.dim}Findings: ${hub.FINDINGS_FILE}${C.reset}
`);
}

// --- Generic Spoke Runner ---

function cmdSpoke(spokeName, args, flags) {
    const config = hub.loadConfig();
    const projectRoot = hub.getProjectRoot();
    const spokeConfig = config.spokes[spokeName];
    if (!spokeConfig || !spokeConfig.enabled) {
        console.error(`  ${C.red}${spokeName} spoke not enabled${C.reset}`);
        return;
    }
    const createAdapter = require(require('path').resolve(__dirname, spokeConfig.adapter));
    const adapter = createAdapter({ name: spokeName, dataPath: spokeConfig.dataPath, projectRoot });
    const result = adapter.commands[''](args, flags);
    return result;
}

// --- Deploy Check ---

function cmdDeployCheck(args, flags) {
    const config = hub.loadConfig();
    const projectRoot = hub.getProjectRoot();
    const spokeConfig = config.spokes['deploy-check'];
    if (!spokeConfig || !spokeConfig.enabled) {
        console.error(`  ${C.red}deploy-check spoke not enabled${C.reset}`);
        return;
    }

    const createAdapter = require(require('path').resolve(__dirname, spokeConfig.adapter));
    const adapter = createAdapter({ name: 'deploy-check', dataPath: spokeConfig.dataPath, projectRoot });

    const result = adapter.commands[''](args, flags);
    adapter.render(result);

    if (result.verdict === 'BLOCKED' || result.verdict === 'FAIL') {
        process.exit(1);
    }
}

// --- CLI Router ---

const argv = process.argv.slice(2);
const command = argv[0];
const cmdArgs = argv.slice(1);

// Parse flags from args
function parseFlags(args) {
    const flags = {};
    const positional = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--apply') {
            flags.apply = true;
        } else if (args[i] === '--prune') {
            flags.prune = true;
        } else if (args[i] === '--json') {
            flags.json = true;
        } else if (args[i] === '--strict') {
            flags.strict = true;
        } else if (args[i] === '--publish') {
            flags.publish = true;
        } else if (args[i] === '--no-publish') {
            flags.publish = false;
        } else if (args[i] === '--dry-run') {
            flags['dry-run'] = true;
        } else if (args[i] === '--severity' && args[i + 1]) {
            flags.severity = args[++i];
        } else if (args[i] === '--threshold' && args[i + 1]) {
            flags.threshold = args[++i];
        } else if (!args[i].startsWith('--')) {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
}

const { flags, positional } = parseFlags(cmdArgs);

switch (command) {
    case 'full':
        cmdFull(positional, flags);
        break;
    case 'status':
    case 'st':
        cmdStatus();
        break;
    case 'scan':
        cmdScan(positional, flags);
        break;
    case 'sync':
        cmdSync(positional, flags);
        break;
    case 'triage':
        cmdTriage(positional, flags);
        break;
    case 'report':
        cmdReport(positional, flags);
        break;
    case 'gate':
        cmdGate(positional, flags);
        break;
    case 'pipe':
        cmdPipe(positional, flags);
        break;
    case 'pull':
        cmdPull(positional, flags);
        break;
    case 'deploy-check':
    case 'dc':
        cmdDeployCheck(positional, flags);
        break;
    case 'quiz-report':
    case 'qr':
        cmdSpoke('quiz-report', positional, flags);
        break;
    case 'dead-code':
        cmdSpoke('dead-code', positional, flags);
        break;
    case 'fix':
        cmdSpoke('auto-fix', positional, flags);
        break;
    case 'changelog':
    case 'cl':
        cmdSpoke('changelog', positional, flags);
        break;
    case 'smoke':
        cmdSpoke('smoke-test', positional, flags);
        break;
    default:
        console.error(`  ${C.red}Unknown command: ${command}${C.reset}`);
        console.error(`  Run ${C.cyan}nexus help${C.reset} for usage.`);
        process.exit(1);
}
