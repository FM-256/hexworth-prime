#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Scraper Content Classifier (SC-5)
 *
 * Auto-tagger for scraped content. Classifies HTML/text files into Hexworth
 * houses, maps to cert objectives, and generates tag arrays for catalog use.
 *
 * Standalone CLI: node content-classifier.js <command>
 *   classify <file>      Classify a single file
 *   batch <directory>    Batch classify all HTML files in a directory
 *   report               Show last batch report
 *   help                 Show usage
 */

// ── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
    outputPath: path.resolve(__dirname, 'classification-report.json'),
    maxContentBytes: 8192,   // Read first 8KB for content analysis
};

// ANSI colors
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

// ── House Keyword Dictionaries ───────────────────────────────────────────────

const HOUSE_KEYWORDS = {
    shield: {
        weight: 1,
        terms: [
            'compliance', 'grc', 'governance', 'risk management', 'nist',
            'cmmc', 'policy', 'audit', 'defense', 'incident response',
            'soc analyst', 'siem', 'blue team', 'security operations',
            'iso 27001', 'hipaa', 'pci dss', 'fedramp', 'continuous monitoring',
            'security framework', 'controls', 'threat detection',
        ],
    },
    'dark-arts': {
        weight: 1,
        terms: [
            'offensive security', 'penetration testing', 'pentest', 'exploit',
            'metasploit', 'burp suite', 'kali linux', 'red team', 'ctf',
            'ethical hacking', 'vulnerability', 'injection', 'xss',
            'sql injection', 'buffer overflow', 'privilege escalation',
            'social engineering', 'phishing', 'payload', 'reverse shell',
            'nmap', 'enumeration', 'footprinting',
        ],
    },
    eye: {
        weight: 1,
        terms: [
            'digital forensics', 'osint', 'threat intelligence', 'malware analysis',
            'investigation', 'indicator of compromise', 'ioc', 'threat hunting',
            'intelligence', 'dfir', 'memory forensics', 'disk forensics',
            'chain of custody', 'evidence', 'autopsy', 'volatility',
            'cyber kill chain', 'mitre att&ck', 'threat actor',
        ],
    },
    cloud: {
        weight: 1,
        terms: [
            'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp',
            'google cloud', 'cloud computing', 'terraform', 'kubernetes',
            'docker', 'serverless', 'lambda', 'ec2', 's3', 'iam',
            'virtual machine', 'cloud security', 'devops', 'ci/cd',
            'infrastructure as code', 'containers', 'microservices',
        ],
    },
    forge: {
        weight: 1,
        terms: [
            'system administration', 'sysadmin', 'windows server',
            'active directory', 'group policy', 'comptia a+',
            'hardware', 'troubleshooting', 'helpdesk', 'server',
            'workstation', 'bios', 'motherboard', 'raid', 'backup',
            'windows administration', 'powershell', 'registry',
            'disk management', 'device manager',
        ],
    },
    web: {
        weight: 1,
        terms: [
            'networking', 'cisco', 'ccna', 'tcp/ip', 'tcp ip', 'dns',
            'dhcp', 'routing', 'switching', 'firewall', 'vpn',
            'subnetting', 'protocol', 'http', 'osi model', 'lan',
            'wan', 'vlan', 'network address translation', 'nat',
            'access control list', 'acl', 'bgp', 'ospf', 'network+',
        ],
    },
    code: {
        weight: 1,
        terms: [
            'python', 'programming', 'algorithm', 'data structure',
            'javascript', 'java', 'api development', 'software development',
            'coding', 'object oriented', 'function', 'class', 'inheritance',
            'recursion', 'sorting', 'binary tree', 'linked list',
            'design pattern', 'debugging', 'version control',
        ],
    },
    key: {
        weight: 1,
        terms: [
            'cryptography', 'encryption', 'cipher', 'hash function',
            'pki', 'public key', 'private key', 'certificate',
            'tls', 'ssl', 'rsa', 'aes', 'des', 'sha',
            'digital signature', 'key exchange', 'diffie hellman',
            'symmetric', 'asymmetric', 'block cipher', 'stream cipher',
        ],
    },
    script: {
        weight: 1,
        terms: [
            'linux', 'bash', 'shell scripting', 'automation',
            'command line', 'cli', 'terminal', 'cron', 'systemd',
            'grep', 'sed', 'awk', 'pipe', 'chmod', 'chown',
            'file system', 'ubuntu', 'centos', 'debian', 'redhat',
            'package manager', 'apt', 'yum', 'ssh',
        ],
    },
    ai: {
        weight: 1,
        terms: [
            'machine learning', 'artificial intelligence', 'neural network',
            'prompt engineering', 'llm', 'large language model', 'chatgpt',
            'ai agent', 'nlp', 'natural language processing',
            'deep learning', 'training', 'model', 'inference',
            'transformer', 'reinforcement learning', 'computer vision',
        ],
    },
};

// ── Cert Alignment Dictionaries ──────────────────────────────────────────────

const CERT_KEYWORDS = {
    'CompTIA Security+': [
        'security+', 'sy0-701', 'sy0-601', 'threats', 'vulnerabilities',
        'risk management', 'cryptography', 'identity', 'access management',
        'network security', 'compliance', 'operational security',
    ],
    'CompTIA Network+': [
        'network+', 'n10-009', 'n10-008', 'subnetting', 'routing',
        'switching', 'network troubleshooting', 'network architecture',
        'network operations', 'network security',
    ],
    'CompTIA A+': [
        'a+', '220-1101', '220-1102', 'hardware', 'troubleshooting',
        'operating systems', 'networking basics', 'security basics',
        'mobile devices', 'virtualization',
    ],
    'CompTIA CySA+': [
        'cysa+', 'cs0-003', 'threat detection', 'security monitoring',
        'incident response', 'vulnerability management', 'security analytics',
    ],
    'CompTIA CASP+': [
        'casp+', 'cas-004', 'enterprise security', 'risk management',
        'security architecture', 'security engineering', 'governance',
    ],
    'CompTIA Linux+': [
        'linux+', 'xk0-005', 'system management', 'linux security',
        'shell scripting', 'linux troubleshooting', 'kernel',
    ],
    'AWS Cloud Practitioner': [
        'aws', 'clf-c02', 'clf-c01', 'cloud practitioner', 'ec2',
        's3', 'lambda', 'iam', 'vpc', 'cloudformation',
    ],
    'AWS Solutions Architect': [
        'solutions architect', 'saa-c03', 'high availability',
        'elasticity', 'auto scaling', 'load balancer', 'rds',
    ],
    'Cisco CCNA': [
        'ccna', '200-301', 'cisco', 'ios', 'ospf', 'eigrp',
        'spanning tree', 'vlan', 'access list', 'nat', 'ppp',
    ],
    'Microsoft AZ-900': [
        'az-900', 'azure fundamentals', 'azure services', 'cloud concepts',
        'azure pricing', 'azure governance',
    ],
};

// ── Difficulty Estimation ────────────────────────────────────────────────────

const DIFFICULTY_SIGNALS = {
    beginner: ['introduction', 'basics', 'getting started', 'fundamentals', 'beginner', 'first', '101', 'overview', 'what is'],
    intermediate: ['intermediate', 'configuration', 'implementation', 'hands-on', 'lab', 'practice', 'troubleshoot'],
    advanced: ['advanced', 'enterprise', 'architecture', 'exploit', 'reverse engineer', 'kernel', 'internals', 'deep dive', 'mastery'],
};

// ── Core Functions ───────────────────────────────────────────────────────────

/**
 * classifyByTitle
 * Keyword-based house assignment from title string.
 */
function classifyByTitle(title) {
    if (!title) return { house: null, confidence: 0, scores: {} };

    const text = title.toLowerCase();
    const scores = {};

    for (const [house, dict] of Object.entries(HOUSE_KEYWORDS)) {
        scores[house] = 0;
        for (const term of dict.terms) {
            if (text.includes(term)) {
                scores[house] += 3;  // Title matches are high signal
            }
        }
    }

    let bestHouse = null;
    let bestScore = 0;
    for (const [house, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestHouse = house;
        }
    }

    return { house: bestHouse, confidence: bestScore, scores };
}

/**
 * classifyByContent
 * Content analysis for HTML files. Reads body text and scores by term frequency.
 */
function classifyByContent(html) {
    if (!html) return { house: null, confidence: 0, scores: {} };

    // Strip tags for cleaner text matching
    const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();

    const scores = {};

    for (const [house, dict] of Object.entries(HOUSE_KEYWORDS)) {
        scores[house] = 0;
        for (const term of dict.terms) {
            // Count occurrences (capped at 5 to prevent single-term dominance)
            let count = 0;
            let idx = text.indexOf(term);
            while (idx !== -1 && count < 5) {
                count++;
                idx = text.indexOf(term, idx + term.length);
            }
            scores[house] += count;
        }
    }

    let bestHouse = null;
    let bestScore = 0;
    for (const [house, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestHouse = house;
        }
    }

    return { house: bestHouse, confidence: bestScore, scores };
}

/**
 * tagCertAlignment
 * Maps content to CompTIA/AWS/Cisco/Microsoft cert objectives.
 */
function tagCertAlignment(content) {
    if (!content) return [];

    const text = content.toLowerCase();
    const alignedCerts = [];

    for (const [cert, keywords] of Object.entries(CERT_KEYWORDS)) {
        let matchCount = 0;
        for (const kw of keywords) {
            if (text.includes(kw)) matchCount++;
        }

        // Require at least 2 keyword matches for cert alignment
        if (matchCount >= 2) {
            alignedCerts.push({
                cert,
                matchCount,
                confidence: Math.min(matchCount / keywords.length, 1.0),
            });
        }
    }

    // Sort by confidence descending
    alignedCerts.sort((a, b) => b.confidence - a.confidence);
    return alignedCerts;
}

/**
 * estimateDifficulty
 * Rough difficulty estimation from content signals.
 */
function estimateDifficulty(text) {
    if (!text) return 'intermediate';

    const lower = text.toLowerCase();
    const scores = { beginner: 0, intermediate: 0, advanced: 0 };

    for (const [level, signals] of Object.entries(DIFFICULTY_SIGNALS)) {
        for (const signal of signals) {
            if (lower.includes(signal)) scores[level]++;
        }
    }

    let best = 'intermediate';
    let bestScore = 0;
    for (const [level, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            best = level;
        }
    }

    return best;
}

/**
 * generateTags
 * Returns full tag array for an item: house, difficulty, certs, topics.
 */
function generateTags(item) {
    const tags = [];

    // Read content if file path provided
    let content = item.content || '';
    if (!content && item.filePath && fs.existsSync(item.filePath)) {
        try {
            const fd = fs.openSync(item.filePath, 'r');
            const buf = Buffer.alloc(CONFIG.maxContentBytes);
            const bytesRead = fs.readSync(fd, buf, 0, CONFIG.maxContentBytes, 0);
            fs.closeSync(fd);
            content = buf.toString('utf8', 0, bytesRead);
        } catch (_) { /* ignore */ }
    }

    const title = item.title || item.filename || '';

    // House classification (combine title + content signals)
    const titleClass = classifyByTitle(title);
    const contentClass = classifyByContent(content);

    // Merge scores
    const mergedScores = {};
    for (const house of Object.keys(HOUSE_KEYWORDS)) {
        mergedScores[house] = (titleClass.scores[house] || 0) + (contentClass.scores[house] || 0);
    }

    let bestHouse = null;
    let bestScore = 0;
    for (const [house, score] of Object.entries(mergedScores)) {
        if (score > bestScore) {
            bestScore = score;
            bestHouse = house;
        }
    }

    if (bestHouse) tags.push(`house:${bestHouse}`);

    // Difficulty
    const combinedText = title + ' ' + content;
    const difficulty = estimateDifficulty(combinedText);
    tags.push(`difficulty:${difficulty}`);

    // Cert alignment
    const certs = tagCertAlignment(combinedText);
    for (const cert of certs.slice(0, 3)) {  // Top 3 certs max
        tags.push(`cert:${cert.cert}`);
    }

    // Topic tags (houses that scored above threshold)
    for (const [house, score] of Object.entries(mergedScores)) {
        if (score > 0 && house !== bestHouse) {
            tags.push(`topic:${house}`);
        }
    }

    return {
        tags,
        house: bestHouse,
        confidence: bestScore,
        difficulty,
        certs: certs.map(c => c.cert),
    };
}

/**
 * batchClassify
 * Process all HTML files in a directory.
 */
function batchClassify(directory) {
    if (!fs.existsSync(directory)) {
        return { ok: false, error: `Directory not found: ${directory}`, results: [] };
    }

    const htmlExtensions = ['.html', '.htm'];
    const results = [];

    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (htmlExtensions.includes(ext)) {
                    const item = {
                        filePath: fullPath,
                        filename: entry.name,
                        title: entry.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
                    };

                    const tagged = generateTags(item);
                    results.push({
                        file: fullPath,
                        relativePath: path.relative(directory, fullPath),
                        ...tagged,
                    });
                }
            }
        }
    }

    walk(directory);

    // Summary
    const houseCounts = {};
    const certCounts = {};
    for (const r of results) {
        const h = r.house || 'unclassified';
        houseCounts[h] = (houseCounts[h] || 0) + 1;
        for (const c of r.certs) {
            certCounts[c] = (certCounts[c] || 0) + 1;
        }
    }

    const report = {
        directory,
        totalFiles: results.length,
        classifiedAt: new Date().toISOString(),
        houseCounts,
        certCounts,
        results,
    };

    // Save report
    try {
        fs.writeFileSync(CONFIG.outputPath, JSON.stringify(report, null, 2) + '\n');
    } catch (_) { /* non-fatal */ }

    return { ok: true, ...report };
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    classifyByTitle,
    classifyByContent,
    tagCertAlignment,
    generateTags,
    batchClassify,
    estimateDifficulty,
    HOUSE_KEYWORDS,
    CERT_KEYWORDS,
};

// ── Standalone CLI ───────────────────────────────────────────────────────────

if (require.main === module) {
    const command = process.argv[2];

    if (!command || command === 'help' || command === '--help') {
        console.log(`
${C.bold}content-classifier${C.reset} -- auto-tagger for scraped content

${C.bold}COMMANDS${C.reset}

  ${C.cyan}classify <file>${C.reset}       Classify a single HTML file
  ${C.cyan}batch <directory>${C.reset}     Batch classify all HTML files in a directory
  ${C.cyan}report${C.reset}               Show last batch classification report
  ${C.cyan}help${C.reset}                 Show this help

${C.bold}OUTPUT${C.reset}

  ${C.dim}${CONFIG.outputPath}${C.reset}
`);
        process.exit(0);
    }

    if (command === 'classify') {
        const filePath = process.argv[3];
        if (!filePath) {
            console.error(`  ${C.red}Usage: node content-classifier.js classify <file>${C.reset}`);
            process.exit(1);
        }

        const absPath = path.resolve(filePath);
        if (!fs.existsSync(absPath)) {
            console.error(`  ${C.red}File not found: ${absPath}${C.reset}`);
            process.exit(1);
        }

        console.log(`\n${C.bold}CLASSIFY${C.reset}  ${C.dim}${absPath}${C.reset}\n`);

        const item = {
            filePath: absPath,
            filename: path.basename(absPath),
            title: path.basename(absPath).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        };

        const result = generateTags(item);
        console.log(`  House:       ${result.house ? C.cyan + result.house + C.reset : C.yellow + 'unclassified' + C.reset}`);
        console.log(`  Confidence:  ${C.dim}${result.confidence}${C.reset}`);
        console.log(`  Difficulty:  ${C.dim}${result.difficulty}${C.reset}`);

        if (result.certs.length > 0) {
            console.log(`  Certs:       ${result.certs.map(c => C.green + c + C.reset).join(', ')}`);
        }

        console.log(`  Tags:        ${C.dim}${result.tags.join(', ')}${C.reset}`);
        console.log('');
        process.exit(0);
    }

    if (command === 'batch') {
        const dir = process.argv[3];
        if (!dir) {
            console.error(`  ${C.red}Usage: node content-classifier.js batch <directory>${C.reset}`);
            process.exit(1);
        }

        const absDir = path.resolve(dir);
        console.log(`\n${C.bold}BATCH CLASSIFY${C.reset}  ${C.dim}${absDir}${C.reset}\n`);

        const report = batchClassify(absDir);
        if (!report.ok) {
            console.error(`  ${C.red}${report.error}${C.reset}\n`);
            process.exit(1);
        }

        console.log(`  ${C.green}${report.totalFiles} files classified${C.reset}\n`);

        // House breakdown
        console.log(`  ${C.bold}By House${C.reset}`);
        for (const [house, count] of Object.entries(report.houseCounts)) {
            console.log(`    ${C.cyan}${house.padEnd(16)}${C.reset} ${count}`);
        }

        // Cert breakdown
        if (Object.keys(report.certCounts).length > 0) {
            console.log(`\n  ${C.bold}Cert Alignment${C.reset}`);
            for (const [cert, count] of Object.entries(report.certCounts)) {
                console.log(`    ${C.green}${cert.padEnd(28)}${C.reset} ${count} files`);
            }
        }

        console.log(`\n  ${C.dim}Report saved: ${CONFIG.outputPath}${C.reset}\n`);
        process.exit(0);
    }

    if (command === 'report') {
        console.log(`\n${C.bold}CLASSIFICATION REPORT${C.reset}\n`);

        if (!fs.existsSync(CONFIG.outputPath)) {
            console.log(`  ${C.dim}No report found. Run: node content-classifier.js batch <directory>${C.reset}\n`);
            process.exit(0);
        }

        try {
            const report = JSON.parse(fs.readFileSync(CONFIG.outputPath, 'utf8'));
            console.log(`  Directory:   ${C.dim}${report.directory}${C.reset}`);
            console.log(`  Files:       ${C.dim}${report.totalFiles}${C.reset}`);
            console.log(`  Classified:  ${C.dim}${report.classifiedAt}${C.reset}\n`);

            console.log(`  ${C.bold}By House${C.reset}`);
            for (const [house, count] of Object.entries(report.houseCounts || {})) {
                console.log(`    ${C.cyan}${house.padEnd(16)}${C.reset} ${count}`);
            }

            if (Object.keys(report.certCounts || {}).length > 0) {
                console.log(`\n  ${C.bold}Cert Alignment${C.reset}`);
                for (const [cert, count] of Object.entries(report.certCounts)) {
                    console.log(`    ${C.green}${cert.padEnd(28)}${C.reset} ${count} files`);
                }
            }
        } catch (err) {
            console.error(`  ${C.red}Failed to read report: ${err.message}${C.reset}`);
        }
        console.log('');
        process.exit(0);
    }

    console.error(`  ${C.red}Unknown command: ${command}${C.reset}`);
    console.error(`  Run ${C.cyan}node content-classifier.js help${C.reset} for usage.`);
    process.exit(1);
}
