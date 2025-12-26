/**
 * Hexworth Prime - HTML Audit Report Generator
 *
 * Generates a comprehensive HTML audit report with:
 * - Summary dashboard with pass/fail indicators
 * - Per-house content inventory
 * - Checks & balances (orphaned files, broken links, missing categories)
 * - Detailed catalog with status indicators
 *
 * Usage:
 *   node scripts/generate-audit-report.js
 *   node scripts/generate-audit-report.js --open  (opens in browser after generation)
 *
 * Output:
 *   ../_planning/reports/audit-report-YYYY-MM-DD.html
 *   ../_planning/reports/audit-report-latest.html (copy)
 *
 * Created: December 26, 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOUSES = ['web', 'shield', 'cloud', 'forge', 'script', 'code', 'key', 'eye'];
const VALID_STATUSES = ['available', 'coming-soon', 'locked', 'beta'];
const args = process.argv.slice(2);
const openAfter = args.includes('--open');

// ============================================
// DATA COLLECTION FUNCTIONS
// ============================================

/**
 * Find all HTML files in a directory recursively
 */
function findHtmlFiles(dir, baseDir = dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...findHtmlFiles(fullPath, baseDir));
        } else if (item.name.endsWith('.html') && item.name !== 'index.html') {
            const relativePath = path.relative(baseDir, fullPath);
            files.push(relativePath);
        }
    }
    return files;
}

/**
 * Parse SAMPLE_MODULES from house index.html
 */
function parseModules(indexPath) {
    if (!fs.existsSync(indexPath)) return { modules: [], categories: [] };

    const content = fs.readFileSync(indexPath, 'utf8');
    const modules = [];

    // Extract CATEGORIES
    const categories = [];
    const catMatches = content.matchAll(/{\s*id:\s*['"]([^'"]+)['"]/g);

    // Find CATEGORIES array section
    const catSection = content.match(/const CATEGORIES\s*=\s*\[([\s\S]*?)\];/);
    if (catSection) {
        const catIds = catSection[1].matchAll(/id:\s*['"]([^'"]+)['"]/g);
        for (const match of catIds) {
            categories.push(match[1]);
        }
    }

    // Parse each module entry - handle both multi-line and single-line formats
    const lines = content.split('\n');
    let currentModule = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect start of a module entry
        if (line.match(/{\s*id:\s*['"]/)) {
            currentModule = {
                lineNumber: i + 1,
                raw: line.trim()
            };

            // Extract properties from current line
            const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
            const titleMatch = line.match(/title:\s*['"]([^'"]+)['"]/);
            const hrefMatch = line.match(/href:\s*['"]([^'"]+)['"]/);
            const statusMatch = line.match(/status:\s*['"]([^'"]+)['"]/);
            const categoryMatch = line.match(/category:\s*['"]([^'"]+)['"]/);
            const iconMatch = line.match(/icon:\s*['"]([^'"]+)['"]/);
            const descMatch = line.match(/description:\s*['"]([^'"]+)['"]/);

            if (idMatch) currentModule.id = idMatch[1];
            if (titleMatch) currentModule.title = titleMatch[1];
            if (hrefMatch) currentModule.href = hrefMatch[1];
            if (statusMatch) currentModule.status = statusMatch[1];
            if (categoryMatch) currentModule.category = categoryMatch[1];
            if (iconMatch) currentModule.icon = iconMatch[1];
            if (descMatch) currentModule.description = descMatch[1];

            // Check next few lines for multi-line entries
            for (let j = 1; j <= 15 && i + j < lines.length; j++) {
                const nextLine = lines[i + j];

                // Stop at next entry or closing
                if (nextLine.match(/^\s*{\s*id:/) || nextLine.match(/^\s*\];/)) break;
                if (nextLine.match(/^\s*},?\s*$/) && j > 1) break;

                // Extract missing properties
                if (!currentModule.id) {
                    const m = nextLine.match(/id:\s*['"]([^'"]+)['"]/);
                    if (m) currentModule.id = m[1];
                }
                if (!currentModule.title) {
                    const m = nextLine.match(/title:\s*['"]([^'"]+)['"]/);
                    if (m) currentModule.title = m[1];
                }
                if (!currentModule.href) {
                    const m = nextLine.match(/href:\s*['"]([^'"]+)['"]/);
                    if (m) currentModule.href = m[1];
                }
                if (!currentModule.status) {
                    const m = nextLine.match(/status:\s*['"]([^'"]+)['"]/);
                    if (m) currentModule.status = m[1];
                }
                if (!currentModule.category) {
                    const m = nextLine.match(/category:\s*['"]([^'"]+)['"]/);
                    if (m) currentModule.category = m[1];
                }
            }

            if (currentModule.id) {
                modules.push(currentModule);
            }
        }
    }

    return { modules, categories };
}

/**
 * Audit a single house
 */
function auditHouse(houseName) {
    const houseDir = path.join('./houses', houseName);
    const indexPath = path.join(houseDir, 'index.html');

    if (!fs.existsSync(houseDir)) {
        return { error: 'House directory not found' };
    }

    const filesOnDisk = findHtmlFiles(houseDir);
    const { modules, categories } = parseModules(indexPath);

    // Checks
    const orphanedFiles = filesOnDisk.filter(file =>
        !modules.some(m => m.href === file)
    );

    const brokenLinks = modules.filter(m => {
        if (!m.href) return false;
        const fullPath = path.join(houseDir, m.href);
        return !fs.existsSync(fullPath);
    });

    const missingCategory = modules.filter(m => !m.category);
    const invalidCategory = modules.filter(m =>
        m.category && !categories.includes(m.category)
    );
    const missingStatus = modules.filter(m => !m.status);
    const invalidStatus = modules.filter(m =>
        m.status && !VALID_STATUSES.includes(m.status)
    );
    const missingHref = modules.filter(m => !m.href);

    // Calculate health score
    const totalChecks = modules.length * 4; // category, status, href, file exists
    const failedChecks = missingCategory.length + invalidCategory.length +
                         missingStatus.length + invalidStatus.length +
                         missingHref.length + brokenLinks.length;
    const healthScore = totalChecks > 0 ? Math.round((1 - failedChecks / totalChecks) * 100) : 100;

    return {
        house: houseName,
        filesOnDisk: filesOnDisk.length,
        modulesInIndex: modules.length,
        categories,
        modules,
        issues: {
            orphanedFiles,
            brokenLinks,
            missingCategory,
            invalidCategory,
            missingStatus,
            invalidStatus,
            missingHref
        },
        healthScore,
        status: failedChecks === 0 && orphanedFiles.length === 0 ? 'PASS' : 'ISSUES'
    };
}

// ============================================
// HTML GENERATION
// ============================================

function generateHtml(results, timestamp) {
    const totalModules = results.reduce((sum, r) => sum + r.modulesInIndex, 0);
    const totalFiles = results.reduce((sum, r) => sum + r.filesOnDisk, 0);
    const totalIssues = results.reduce((sum, r) => {
        const issues = r.issues;
        return sum + issues.orphanedFiles.length + issues.brokenLinks.length +
               issues.missingCategory.length + issues.invalidCategory.length +
               issues.missingStatus.length + issues.invalidStatus.length +
               issues.missingHref.length;
    }, 0);
    const avgHealth = Math.round(results.reduce((sum, r) => sum + r.healthScore, 0) / results.length);
    const passCount = results.filter(r => r.status === 'PASS').length;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hexworth Prime - Audit Report</title>
    <style>
        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #1a1a1a;
            --bg-tertiary: #2a2a2a;
            --text-primary: #ffffff;
            --text-secondary: #aaaaaa;
            --accent-green: #00ff88;
            --accent-red: #ff4444;
            --accent-yellow: #ffaa00;
            --accent-blue: #4488ff;
            --border-color: #333333;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 20px;
        }

        .container { max-width: 1400px; margin: 0 auto; }

        header {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid var(--border-color);
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .timestamp {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Summary Cards */
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            border: 1px solid var(--border-color);
            transition: transform 0.2s;
        }

        .summary-card:hover { transform: translateY(-2px); }

        .summary-card .value {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .summary-card .label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .summary-card.pass .value { color: var(--accent-green); }
        .summary-card.warn .value { color: var(--accent-yellow); }
        .summary-card.fail .value { color: var(--accent-red); }
        .summary-card.info .value { color: var(--accent-blue); }

        /* Health Bar */
        .health-bar-container {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid var(--border-color);
        }

        .health-bar {
            height: 30px;
            background: var(--bg-tertiary);
            border-radius: 15px;
            overflow: hidden;
            margin-top: 15px;
        }

        .health-bar-fill {
            height: 100%;
            border-radius: 15px;
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: var(--bg-primary);
        }

        /* House Sections */
        .house-section {
            background: var(--bg-secondary);
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid var(--border-color);
            overflow: hidden;
        }

        .house-header {
            padding: 20px 25px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
        }

        .house-header:hover { background: #333; }

        .house-title {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .house-icon { font-size: 2rem; }

        .house-name {
            font-size: 1.4rem;
            font-weight: 600;
        }

        .house-stats {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .stat-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .stat-badge.pass { background: rgba(0, 255, 136, 0.2); color: var(--accent-green); }
        .stat-badge.warn { background: rgba(255, 170, 0, 0.2); color: var(--accent-yellow); }
        .stat-badge.fail { background: rgba(255, 68, 68, 0.2); color: var(--accent-red); }
        .stat-badge.info { background: rgba(68, 136, 255, 0.2); color: var(--accent-blue); }

        .toggle-icon {
            font-size: 1.5rem;
            transition: transform 0.3s;
        }

        .house-section.collapsed .toggle-icon { transform: rotate(-90deg); }
        .house-section.collapsed .house-content { display: none; }

        .house-content { padding: 25px; }

        /* Issues Panel */
        .issues-panel {
            background: var(--bg-primary);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .issues-panel h4 {
            color: var(--accent-yellow);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .issue-list {
            list-style: none;
            font-family: 'Consolas', monospace;
            font-size: 0.85rem;
        }

        .issue-list li {
            padding: 5px 10px;
            border-left: 3px solid var(--accent-red);
            margin-bottom: 5px;
            background: rgba(255, 68, 68, 0.1);
        }

        .issue-list.orphaned li { border-left-color: var(--accent-yellow); background: rgba(255, 170, 0, 0.1); }

        /* Module Table */
        .module-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .module-table th {
            text-align: left;
            padding: 12px 15px;
            background: var(--bg-primary);
            color: var(--text-secondary);
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            border-bottom: 2px solid var(--border-color);
        }

        .module-table td {
            padding: 10px 15px;
            border-bottom: 1px solid var(--border-color);
        }

        .module-table tr:hover { background: var(--bg-tertiary); }

        .status-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-dot.available { background: var(--accent-green); }
        .status-dot.coming-soon { background: var(--accent-yellow); }
        .status-dot.locked { background: var(--accent-red); }
        .status-dot.beta { background: var(--accent-blue); }
        .status-dot.missing { background: #666; }

        .check-icon { font-size: 1.1rem; }
        .check-icon.pass { color: var(--accent-green); }
        .check-icon.fail { color: var(--accent-red); }
        .check-icon.warn { color: var(--accent-yellow); }

        /* Footer */
        footer {
            text-align: center;
            padding: 30px;
            color: var(--text-secondary);
            font-size: 0.85rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
            .house-stats { flex-wrap: wrap; gap: 10px; }
            .module-table { font-size: 0.8rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🏰 Hexworth Prime Audit Report</h1>
            <p class="timestamp">Generated: ${timestamp}</p>
        </header>

        <!-- Summary Dashboard -->
        <section class="summary-grid">
            <div class="summary-card ${passCount === results.length ? 'pass' : passCount > results.length / 2 ? 'warn' : 'fail'}">
                <div class="value">${passCount}/${results.length}</div>
                <div class="label">Houses Passing</div>
            </div>
            <div class="summary-card info">
                <div class="value">${totalModules}</div>
                <div class="label">Total Modules</div>
            </div>
            <div class="summary-card info">
                <div class="value">${totalFiles}</div>
                <div class="label">Files on Disk</div>
            </div>
            <div class="summary-card ${totalIssues === 0 ? 'pass' : totalIssues < 10 ? 'warn' : 'fail'}">
                <div class="value">${totalIssues}</div>
                <div class="label">Total Issues</div>
            </div>
        </section>

        <!-- Overall Health Bar -->
        <section class="health-bar-container">
            <h3>Overall Platform Health: ${avgHealth}%</h3>
            <div class="health-bar">
                <div class="health-bar-fill" style="width: ${avgHealth}%; background: ${avgHealth >= 90 ? 'var(--accent-green)' : avgHealth >= 70 ? 'var(--accent-yellow)' : 'var(--accent-red)'}">
                    ${avgHealth}%
                </div>
            </div>
        </section>

        <!-- Per-House Details -->
        ${results.map(r => generateHouseSection(r)).join('\n')}

        <footer>
            <p>Hexworth Prime Audit System v1.0</p>
            <p>Run <code>node scripts/generate-audit-report.js</code> to regenerate</p>
        </footer>
    </div>

    <script>
        // Toggle house sections
        document.querySelectorAll('.house-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('collapsed');
            });
        });
    </script>
</body>
</html>`;
}

function generateHouseSection(r) {
    const houseIcons = {
        web: '🌐', shield: '🛡️', cloud: '☁️', forge: '⚒️',
        script: '📜', code: '💻', key: '🔑', eye: '👁️'
    };

    const totalIssues = r.issues.orphanedFiles.length + r.issues.brokenLinks.length +
                        r.issues.missingCategory.length + r.issues.invalidCategory.length +
                        r.issues.missingStatus.length + r.issues.invalidStatus.length +
                        r.issues.missingHref.length;

    return `
        <section class="house-section">
            <div class="house-header">
                <div class="house-title">
                    <span class="house-icon">${houseIcons[r.house] || '🏠'}</span>
                    <span class="house-name">${r.house.charAt(0).toUpperCase() + r.house.slice(1)} House</span>
                </div>
                <div class="house-stats">
                    <span class="stat-badge info">${r.modulesInIndex} modules</span>
                    <span class="stat-badge info">${r.filesOnDisk} files</span>
                    <span class="stat-badge ${totalIssues === 0 ? 'pass' : 'warn'}">${totalIssues} issues</span>
                    <span class="stat-badge ${r.status === 'PASS' ? 'pass' : 'fail'}">${r.healthScore}% health</span>
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            <div class="house-content">
                ${generateIssuesPanel(r.issues)}
                ${generateModuleTable(r)}
            </div>
        </section>
    `;
}

function generateIssuesPanel(issues) {
    const sections = [];

    if (issues.orphanedFiles.length > 0) {
        sections.push(`
            <div class="issues-panel">
                <h4>⚠️ Orphaned Files (${issues.orphanedFiles.length}) - Files exist but not in index</h4>
                <ul class="issue-list orphaned">
                    ${issues.orphanedFiles.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>
        `);
    }

    if (issues.brokenLinks.length > 0) {
        sections.push(`
            <div class="issues-panel">
                <h4>❌ Broken Links (${issues.brokenLinks.length}) - Index entries with missing files</h4>
                <ul class="issue-list">
                    ${issues.brokenLinks.map(m => `<li>${m.id}: ${m.href}</li>`).join('')}
                </ul>
            </div>
        `);
    }

    if (issues.missingCategory.length > 0) {
        sections.push(`
            <div class="issues-panel">
                <h4>🏷️ Missing Category (${issues.missingCategory.length})</h4>
                <ul class="issue-list">
                    ${issues.missingCategory.map(m => `<li>Line ${m.lineNumber}: ${m.id} - "${m.title}"</li>`).join('')}
                </ul>
            </div>
        `);
    }

    if (issues.missingStatus.length > 0) {
        sections.push(`
            <div class="issues-panel">
                <h4>📊 Missing Status (${issues.missingStatus.length})</h4>
                <ul class="issue-list">
                    ${issues.missingStatus.map(m => `<li>Line ${m.lineNumber}: ${m.id} - "${m.title}"</li>`).join('')}
                </ul>
            </div>
        `);
    }

    if (sections.length === 0) {
        return '<p style="color: var(--accent-green); margin-bottom: 20px;">✅ No issues found!</p>';
    }

    return sections.join('');
}

function generateModuleTable(r) {
    if (r.modules.length === 0) {
        return '<p style="color: var(--text-secondary);">No modules found in index.</p>';
    }

    const rows = r.modules.map(m => {
        const fileExists = m.href && fs.existsSync(path.join('./houses', r.house, m.href));
        const hasCategory = !!m.category;
        const hasStatus = !!m.status;
        const validStatus = VALID_STATUSES.includes(m.status);

        return `
            <tr>
                <td>${m.icon || '📄'}</td>
                <td><strong>${m.title || m.id}</strong></td>
                <td><span class="status-dot ${m.status || 'missing'}"></span>${m.status || 'MISSING'}</td>
                <td>${m.category || '<span style="color: var(--accent-red)">MISSING</span>'}</td>
                <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-secondary);">${m.href || 'N/A'}</td>
                <td class="check-icon ${fileExists ? 'pass' : 'fail'}">${fileExists ? '✓' : '✗'}</td>
                <td class="check-icon ${hasCategory ? 'pass' : 'fail'}">${hasCategory ? '✓' : '✗'}</td>
                <td class="check-icon ${hasStatus && validStatus ? 'pass' : 'fail'}">${hasStatus && validStatus ? '✓' : '✗'}</td>
            </tr>
        `;
    }).join('');

    return `
        <table class="module-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Module</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Path</th>
                    <th title="File Exists">📁</th>
                    <th title="Has Category">🏷️</th>
                    <th title="Valid Status">📊</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// ============================================
// MAIN EXECUTION
// ============================================

function main() {
    console.log('\n🔍 Hexworth Prime Audit Report Generator\n');
    console.log('Scanning houses...\n');

    const results = [];

    for (const house of HOUSES) {
        process.stdout.write(`  Auditing ${house}... `);
        const result = auditHouse(house);
        results.push(result);
        console.log(result.status === 'PASS' ? '✓ PASS' : `⚠ ${result.status}`);
    }

    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const dateStr = new Date().toISOString().split('T')[0];

    console.log('\nGenerating HTML report...');

    const html = generateHtml(results, timestamp);

    // Write timestamped report
    const reportDir = path.join('..', '_planning', 'reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestampedPath = path.join(reportDir, `audit-report-${dateStr}.html`);
    const latestPath = path.join(reportDir, 'audit-report-latest.html');

    fs.writeFileSync(timestampedPath, html);
    fs.writeFileSync(latestPath, html);

    console.log(`\n✅ Report generated:`);
    console.log(`   ${timestampedPath}`);
    console.log(`   ${latestPath}`);

    // Summary
    const totalIssues = results.reduce((sum, r) => {
        const i = r.issues;
        return sum + i.orphanedFiles.length + i.brokenLinks.length +
               i.missingCategory.length + i.invalidCategory.length +
               i.missingStatus.length + i.missingHref.length;
    }, 0);

    console.log(`\n📊 Summary:`);
    console.log(`   Houses: ${results.length}`);
    console.log(`   Passing: ${results.filter(r => r.status === 'PASS').length}`);
    console.log(`   Total Issues: ${totalIssues}`);
    console.log('');

    // Open in browser if requested
    if (openAfter) {
        const fullPath = path.resolve(latestPath);
        console.log('Opening in browser...\n');
        try {
            if (process.platform === 'linux') {
                execSync(`xdg-open "${fullPath}" 2>/dev/null || wslview "${fullPath}" 2>/dev/null || echo "Open manually: ${fullPath}"`);
            } else if (process.platform === 'darwin') {
                execSync(`open "${fullPath}"`);
            } else if (process.platform === 'win32') {
                execSync(`start "" "${fullPath}"`);
            }
        } catch (e) {
            console.log(`Open manually: file://${fullPath}\n`);
        }
    }
}

// Run from _app directory
if (!fs.existsSync('./houses')) {
    console.error('Error: Must run from _app directory');
    console.log('Usage: cd _app && node scripts/generate-audit-report.js');
    process.exit(1);
}

main();
