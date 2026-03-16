#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * HexContent Spoke Adapter (NXS-1)
 *
 * Bridges Nexus to the HexContent shuttle output from bc1.
 * Reads scraped content from a shared directory (Samba mount or local sync path),
 * classifies it by house/category, stages it for review, and imports approved items
 * into the correct _app/houses/ directory.
 *
 * Standalone CLI: node hexcontent-adapter.js <command>
 *   fetch       Read latest content from shared directory
 *   classify    Classify all pending content
 *   stage       Stage classified content for review
 *   import      Import approved items to _app/houses/
 *   report      Summary of pending/imported/rejected
 *   help        Show usage
 */

// ── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
    // Where HexContent drops scraped files (Samba mount from bc1 or Syncthing)
    contentSourcePath: path.resolve(process.env.HOME || '~', 'hexworth/content'),

    // Alternate: direct path if mounted differently
    // contentSourcePath: '/mnt/bc1/hexworth/content',

    // Where review queue state lives
    reviewQueuePath: path.resolve(__dirname, '..', 'review-queue.json'),

    // Project root for import targets
    projectRoot: path.resolve(__dirname, '..', '..', '..'),

    // Supported file extensions for content
    contentExtensions: ['.html', '.htm', '.md', '.json'],

    // Max items per batch operation
    batchSize: 50,
};

// ANSI colors (matches Nexus hub convention)
const C = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    red:    '\x1b[31m',
    green:  '\x1b[32m',
    yellow: '\x1b[33m',
    cyan:   '\x1b[36m',
    gray:   '\x1b[90m',
};

// ── House Classification ─────────────────────────────────────────────────────

const HOUSE_KEYWORDS = {
    shield:     ['compliance', 'grc', 'governance', 'risk', 'nist', 'cmmc', 'policy', 'audit', 'defense', 'incident-response', 'soc', 'siem', 'blue-team'],
    'dark-arts': ['offensive', 'pentesting', 'pentest', 'exploit', 'metasploit', 'burp', 'kali', 'red-team', 'ctf', 'hacking', 'vulnerability', 'injection', 'xss', 'sqli'],
    eye:        ['forensics', 'osint', 'threat-intel', 'malware-analysis', 'investigation', 'ioc', 'threat-hunting', 'intelligence', 'dfir'],
    cloud:      ['aws', 'azure', 'gcp', 'cloud', 'terraform', 'kubernetes', 'docker', 'serverless', 'lambda', 'ec2', 's3', 'iam'],
    forge:      ['sysadmin', 'windows', 'active-directory', 'group-policy', 'comptia', 'a-plus', 'hardware', 'troubleshoot', 'helpdesk', 'server'],
    web:        ['networking', 'cisco', 'ccna', 'tcp', 'dns', 'dhcp', 'routing', 'switching', 'firewall', 'vpn', 'subnet', 'protocol', 'http', 'osi'],
    code:       ['python', 'programming', 'algorithm', 'data-structure', 'javascript', 'java', 'api', 'development', 'coding'],
    key:        ['cryptography', 'encryption', 'cipher', 'hash', 'pki', 'certificate', 'tls', 'ssl', 'rsa', 'aes'],
    script:     ['linux', 'bash', 'shell', 'automation', 'scripting', 'cli', 'terminal', 'cron', 'systemd', 'grep', 'sed', 'awk'],
    ai:         ['machine-learning', 'ai', 'artificial-intelligence', 'neural', 'prompt', 'llm', 'chatgpt', 'agent', 'nlp'],
};

// ── Utility Functions ────────────────────────────────────────────────────────

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

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return null;
    }
}

function writeJson(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function walkDir(dir, extensions) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkDir(fullPath, extensions));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (extensions.includes(ext)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

// ── Core Functions ───────────────────────────────────────────────────────────

/**
 * fetchLatestContent
 * Reads content from the shared directory (Samba/Syncthing mount).
 * Returns array of content items with metadata.
 */
function fetchLatestContent(sourcePath) {
    const dir = sourcePath || CONFIG.contentSourcePath;

    if (!fs.existsSync(dir)) {
        return { ok: false, items: [], error: `Source directory not found: ${dir}` };
    }

    const files = walkDir(dir, CONFIG.contentExtensions);
    const items = files.map(filePath => {
        const stat = fs.statSync(filePath);
        const relativePath = path.relative(dir, filePath);

        return {
            id: relativePath.replace(/[/\\]/g, '_').replace(/\.[^.]+$/, ''),
            filename: path.basename(filePath),
            sourcePath: filePath,
            relativePath,
            extension: path.extname(filePath).toLowerCase(),
            sizeBytes: stat.size,
            lastModified: stat.mtime.toISOString(),
            status: 'pending',       // pending | classified | staged | approved | rejected | imported
            house: null,
            tags: [],
            classification: null,
        };
    });

    return { ok: true, items, scannedAt: new Date().toISOString() };
}

/**
 * classifyContent
 * Determines which house/category a single content item belongs to.
 * Uses filename path segments and, for HTML files, a lightweight content scan.
 */
function classifyContent(item) {
    const scores = {};
    const searchText = item.relativePath.toLowerCase().replace(/[_\-./\\]/g, ' ');

    // Score by path/filename keywords
    for (const [house, keywords] of Object.entries(HOUSE_KEYWORDS)) {
        scores[house] = 0;
        for (const kw of keywords) {
            const kwNorm = kw.replace(/-/g, ' ');
            if (searchText.includes(kwNorm) || searchText.includes(kw)) {
                scores[house] += 2;
            }
        }
    }

    // For HTML files, do lightweight content scan (first 4KB)
    if ((item.extension === '.html' || item.extension === '.htm') && fs.existsSync(item.sourcePath)) {
        try {
            const fd = fs.openSync(item.sourcePath, 'r');
            const buf = Buffer.alloc(4096);
            fs.readSync(fd, buf, 0, 4096, 0);
            fs.closeSync(fd);
            const snippet = buf.toString('utf8').toLowerCase();

            for (const [house, keywords] of Object.entries(HOUSE_KEYWORDS)) {
                for (const kw of keywords) {
                    if (snippet.includes(kw)) {
                        scores[house] = (scores[house] || 0) + 1;
                    }
                }
            }
        } catch (_) {
            // Ignore read errors — classify by path alone
        }
    }

    // Find best match
    let bestHouse = null;
    let bestScore = 0;
    for (const [house, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestHouse = house;
        }
    }

    return {
        ...item,
        house: bestHouse,
        confidence: bestScore,
        status: bestHouse ? 'classified' : 'unclassified',
        classification: {
            house: bestHouse,
            confidence: bestScore,
            scores,
            classifiedAt: new Date().toISOString(),
        },
    };
}

/**
 * stageForReview
 * Creates review queue entries in review-queue.json.
 */
function stageForReview(items) {
    const queue = readJson(CONFIG.reviewQueuePath) || {
        _meta: { version: 1, format: 'hexcontent-review-queue' },
        lastUpdated: null,
        items: [],
    };

    const existingIds = new Set(queue.items.map(i => i.id));
    let added = 0;
    let skipped = 0;

    for (const item of items) {
        if (existingIds.has(item.id)) {
            skipped++;
            continue;
        }

        queue.items.push({
            id: item.id,
            filename: item.filename,
            sourcePath: item.sourcePath,
            relativePath: item.relativePath,
            house: item.house,
            confidence: item.confidence || 0,
            tags: item.tags || [],
            status: 'pending-review',   // pending-review | approved | rejected
            stagedAt: new Date().toISOString(),
            reviewedAt: null,
            reviewedBy: null,
            notes: '',
        });

        existingIds.add(item.id);
        added++;
    }

    queue.lastUpdated = new Date().toISOString();
    writeJson(CONFIG.reviewQueuePath, queue);

    return { added, skipped, total: queue.items.length };
}

/**
 * importApproved
 * Copies approved content to the correct _app/houses/ directory.
 */
function importApproved() {
    const queue = readJson(CONFIG.reviewQueuePath);
    if (!queue || !queue.items) {
        return { ok: false, imported: 0, error: 'No review queue found' };
    }

    const approved = queue.items.filter(i => i.status === 'approved');
    let imported = 0;
    let failed = 0;
    const results = [];

    for (const item of approved) {
        if (!item.house) {
            results.push({ id: item.id, ok: false, reason: 'no house assigned' });
            failed++;
            continue;
        }

        const targetDir = path.join(CONFIG.projectRoot, '_app', 'houses', item.house);
        if (!fs.existsSync(targetDir)) {
            results.push({ id: item.id, ok: false, reason: `house directory not found: ${item.house}` });
            failed++;
            continue;
        }

        if (!fs.existsSync(item.sourcePath)) {
            results.push({ id: item.id, ok: false, reason: 'source file missing' });
            failed++;
            continue;
        }

        try {
            const targetPath = path.join(targetDir, item.filename);

            // Prevent overwrite without explicit flag
            if (fs.existsSync(targetPath)) {
                results.push({ id: item.id, ok: false, reason: 'target already exists' });
                failed++;
                continue;
            }

            fs.copyFileSync(item.sourcePath, targetPath);
            item.status = 'imported';
            item.importedAt = new Date().toISOString();
            item.importedTo = targetPath;
            imported++;
            results.push({ id: item.id, ok: true, target: targetPath });
        } catch (err) {
            results.push({ id: item.id, ok: false, reason: err.message });
            failed++;
        }
    }

    // Save updated queue
    queue.lastUpdated = new Date().toISOString();
    writeJson(CONFIG.reviewQueuePath, queue);

    return { ok: true, imported, failed, results };
}

/**
 * generateReport
 * Summary of pending/imported/rejected content.
 */
function generateReport() {
    const queue = readJson(CONFIG.reviewQueuePath);
    if (!queue || !queue.items) {
        return {
            ok: false,
            summary: 'No review queue found. Run fetch + stage first.',
        };
    }

    const counts = { 'pending-review': 0, approved: 0, rejected: 0, imported: 0 };
    const byHouse = {};

    for (const item of queue.items) {
        counts[item.status] = (counts[item.status] || 0) + 1;

        const house = item.house || 'unclassified';
        if (!byHouse[house]) byHouse[house] = { total: 0, pending: 0, approved: 0, rejected: 0, imported: 0 };
        byHouse[house].total++;
        if (item.status === 'pending-review') byHouse[house].pending++;
        else if (item.status === 'approved') byHouse[house].approved++;
        else if (item.status === 'rejected') byHouse[house].rejected++;
        else if (item.status === 'imported') byHouse[house].imported++;
    }

    return {
        ok: true,
        lastUpdated: queue.lastUpdated,
        totalItems: queue.items.length,
        counts,
        byHouse,
        generatedAt: new Date().toISOString(),
    };
}

// ── Nexus Spoke Interface ────────────────────────────────────────────────────

module.exports = function createHexcontentAdapter(opts) {
    const spokeName = (opts && opts.name) || 'hexcontent-adapter';
    const reviewPath = (opts && opts.dataPath)
        ? (path.isAbsolute(opts.dataPath)
            ? opts.dataPath
            : path.resolve(__dirname, '..', opts.dataPath))
        : CONFIG.reviewQueuePath;
    const projRoot = (opts && opts.projectRoot) || CONFIG.projectRoot;

    // Override config with provided values
    if (opts && opts.dataPath) CONFIG.reviewQueuePath = reviewPath;
    if (opts && opts.projectRoot) CONFIG.projectRoot = projRoot;

    function getFindings() {
        const queue = readJson(reviewPath);
        if (!queue || !queue.items) return [];

        const findings = [];
        const now = new Date().toISOString();

        // Pending reviews older than 3 days
        const pendingItems = queue.items.filter(i => i.status === 'pending-review');
        for (const item of pendingItems) {
            const ageDays = (Date.now() - new Date(item.stagedAt).getTime()) / (1000 * 60 * 60 * 24);

            findings.push({
                source:    spokeName,
                code:      'HCA-PENDING-REVIEW',
                severity:  ageDays > 7 ? 'medium' : 'low',
                message:   `"${item.filename}" awaiting review (${Math.floor(ageDays)}d, house: ${item.house || '?'})`,
                file:      item.sourcePath,
                line:      null,
                timestamp: now,
                meta: {
                    itemId:     item.id,
                    house:      item.house,
                    confidence: item.confidence,
                    ageDays:    Math.floor(ageDays),
                },
            });
        }

        // Stale queue warning
        if (queue.lastUpdated) {
            const queueAge = (Date.now() - new Date(queue.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
            if (queueAge > 5) {
                findings.push({
                    source:    spokeName,
                    code:      'HCA-QUEUE-STALE',
                    severity:  'low',
                    message:   `Review queue last updated ${Math.floor(queueAge)}d ago`,
                    file:      reviewPath,
                    line:      null,
                    timestamp: now,
                    meta: { lastUpdated: queue.lastUpdated, queueAgeDays: Math.floor(queueAge) },
                });
            }
        }

        return findings;
    }

    function getStatus() {
        const queue = readJson(reviewPath);
        if (!queue) {
            return { available: false, reason: 'review-queue.json not found' };
        }

        const report = generateReport();

        return {
            available:   true,
            name:        'HexContent Adapter',
            lastUpdated: queue.lastUpdated,
            totalItems:  report.totalItems || 0,
            counts:      report.counts || {},
        };
    }

    function acceptFinding() {
        return { accepted: false, reason: 'read-only spoke' };
    }

    return {
        name: spokeName,
        getFindings,
        getStatus,
        acceptFinding,

        // Expose core functions for programmatic use
        fetchLatestContent,
        classifyContent,
        stageForReview,
        importApproved,
        generateReport,
    };
};

// ── Standalone CLI ───────────────────────────────────────────────────────────

if (require.main === module) {
    const adapter = module.exports({
        name:        'hexcontent-adapter',
        dataPath:    CONFIG.reviewQueuePath,
        projectRoot: CONFIG.projectRoot,
    });

    const command = process.argv[2];

    if (!command || command === 'help' || command === '--help') {
        console.log(`
${C.bold}hexcontent-adapter${C.reset} -- content shuttle bridge for Nexus

${C.bold}COMMANDS${C.reset}

  ${C.cyan}fetch${C.reset}       Scan source directory for new content
  ${C.cyan}classify${C.reset}    Classify all fetched items by house
  ${C.cyan}stage${C.reset}       Stage classified items for review
  ${C.cyan}import${C.reset}      Import approved items to _app/houses/
  ${C.cyan}report${C.reset}      Show review queue summary
  ${C.cyan}pipeline${C.reset}    Run full pipeline: fetch -> classify -> stage
  ${C.cyan}help${C.reset}        Show this help

${C.bold}CONFIG${C.reset}

  Source:  ${C.dim}${CONFIG.contentSourcePath}${C.reset}
  Queue:   ${C.dim}${CONFIG.reviewQueuePath}${C.reset}
  Target:  ${C.dim}${CONFIG.projectRoot}/_app/houses/${C.reset}
`);
        process.exit(0);
    }

    if (command === 'fetch') {
        console.log(`\n${C.bold}HEXCONTENT FETCH${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}\n`);
        console.log(`  ${C.dim}Scanning ${CONFIG.contentSourcePath}...${C.reset}`);

        const result = fetchLatestContent();
        if (!result.ok) {
            console.log(`  ${C.yellow}${result.error}${C.reset}`);
        } else {
            console.log(`  ${C.green}Found ${result.items.length} content files${C.reset}`);
            for (const item of result.items.slice(0, 10)) {
                console.log(`    ${C.dim}${item.relativePath}${C.reset}`);
            }
            if (result.items.length > 10) {
                console.log(`    ${C.dim}... and ${result.items.length - 10} more${C.reset}`);
            }
        }
        console.log('');
        process.exit(0);
    }

    if (command === 'classify') {
        console.log(`\n${C.bold}HEXCONTENT CLASSIFY${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}\n`);

        const result = fetchLatestContent();
        if (!result.ok) {
            console.log(`  ${C.yellow}${result.error}${C.reset}\n`);
            process.exit(1);
        }

        let classified = 0;
        let unclassified = 0;

        for (const item of result.items) {
            const cl = classifyContent(item);
            if (cl.house) {
                classified++;
                console.log(`  ${C.cyan}${cl.house.padEnd(12)}${C.reset} ${C.dim}(${cl.confidence})${C.reset}  ${cl.relativePath}`);
            } else {
                unclassified++;
                console.log(`  ${C.yellow}???         ${C.reset} ${C.dim}(0)${C.reset}  ${cl.relativePath}`);
            }
        }

        console.log(`\n  ${C.green}${classified} classified${C.reset}  ${C.yellow}${unclassified} unclassified${C.reset}\n`);
        process.exit(0);
    }

    if (command === 'stage') {
        console.log(`\n${C.bold}HEXCONTENT STAGE${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}\n`);

        const result = fetchLatestContent();
        if (!result.ok) {
            console.log(`  ${C.yellow}${result.error}${C.reset}\n`);
            process.exit(1);
        }

        const classified = result.items.map(i => classifyContent(i));
        const staged = stageForReview(classified);
        console.log(`  ${C.green}${staged.added} added${C.reset}  ${C.dim}${staged.skipped} skipped (duplicate)${C.reset}  ${C.dim}${staged.total} total in queue${C.reset}\n`);
        process.exit(0);
    }

    if (command === 'import') {
        console.log(`\n${C.bold}HEXCONTENT IMPORT${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}\n`);

        const result = importApproved();
        if (!result.ok) {
            console.log(`  ${C.yellow}${result.error}${C.reset}\n`);
            process.exit(1);
        }

        console.log(`  ${C.green}${result.imported} imported${C.reset}  ${C.red}${result.failed} failed${C.reset}`);
        for (const r of result.results) {
            const icon = r.ok ? C.green + 'OK' : C.red + 'FAIL';
            console.log(`    ${icon}${C.reset}  ${r.id}${r.reason ? '  ' + C.dim + r.reason + C.reset : ''}`);
        }
        console.log('');
        process.exit(0);
    }

    if (command === 'pipeline') {
        console.log(`\n${C.bold}HEXCONTENT PIPELINE${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}\n`);

        // Step 1: Fetch
        console.log(`  ${C.cyan}[1/3]${C.reset} Fetching content...`);
        const fetched = fetchLatestContent();
        if (!fetched.ok) {
            console.log(`  ${C.yellow}${fetched.error}${C.reset}\n`);
            process.exit(1);
        }
        console.log(`        ${C.dim}${fetched.items.length} files found${C.reset}`);

        // Step 2: Classify
        console.log(`  ${C.cyan}[2/3]${C.reset} Classifying...`);
        const classified = fetched.items.map(i => classifyContent(i));
        const withHouse = classified.filter(i => i.house);
        console.log(`        ${C.dim}${withHouse.length} classified, ${classified.length - withHouse.length} unclassified${C.reset}`);

        // Step 3: Stage
        console.log(`  ${C.cyan}[3/3]${C.reset} Staging for review...`);
        const staged = stageForReview(classified);
        console.log(`        ${C.dim}${staged.added} added, ${staged.skipped} skipped${C.reset}`);

        console.log(`\n  ${C.green}Pipeline complete.${C.reset} ${staged.total} items in review queue.\n`);
        process.exit(0);
    }

    if (command === 'report') {
        console.log(`\n${C.bold}HEXCONTENT REPORT${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(52)}${C.reset}\n`);

        const report = generateReport();
        if (!report.ok) {
            console.log(`  ${C.dim}${report.summary}${C.reset}\n`);
            process.exit(0);
        }

        console.log(`  ${C.bold}Queue Summary${C.reset}  ${C.dim}(last updated: ${timeAgo(report.lastUpdated)})${C.reset}\n`);

        const c = report.counts;
        console.log(`  Pending review:  ${c['pending-review'] > 0 ? C.yellow : C.dim}${c['pending-review'] || 0}${C.reset}`);
        console.log(`  Approved:        ${c.approved > 0 ? C.green : C.dim}${c.approved || 0}${C.reset}`);
        console.log(`  Rejected:        ${c.rejected > 0 ? C.red : C.dim}${c.rejected || 0}${C.reset}`);
        console.log(`  Imported:        ${c.imported > 0 ? C.cyan : C.dim}${c.imported || 0}${C.reset}`);

        if (Object.keys(report.byHouse).length > 0) {
            console.log(`\n  ${C.bold}By House${C.reset}\n`);
            for (const [house, data] of Object.entries(report.byHouse)) {
                console.log(`    ${C.cyan}${house.padEnd(16)}${C.reset} ${C.dim}${data.total} total${C.reset}  ${data.pending > 0 ? C.yellow + data.pending + ' pending' + C.reset + '  ' : ''}${data.imported > 0 ? C.green + data.imported + ' imported' + C.reset : ''}`);
            }
        }

        console.log('');
        process.exit(0);
    }

    console.error(`  ${C.red}Unknown command: ${command}${C.reset}`);
    console.error(`  Run ${C.cyan}node hexcontent-adapter.js help${C.reset} for usage.`);
    process.exit(1);
}
