#!/usr/bin/env node
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Repo Scout -- GitHub Repository Discovery Tool (RS-2)
 *
 * Searches GitHub for educational repositories relevant to Hexworth Prime,
 * evaluates them on quality/relevance, and builds a browseable catalog.
 *
 * Standalone CLI: node repo-scout.js <command>
 *   search <query>       Search GitHub repos
 *   evaluate <owner/repo>  Score a specific repo
 *   extract <owner/repo>   Download relevant files from a repo
 *   batch                 Search across all configured topics
 *   catalog               Show the current catalog
 *   help                  Show usage
 */

// ── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
    catalogPath: path.resolve(__dirname, 'repo-catalog.json'),
    extractDir:  path.resolve(__dirname, 'extracted'),

    // GitHub API (unauthenticated: 60 req/hr, authenticated: 5000 req/hr)
    githubToken: process.env.GITHUB_TOKEN || null,
    apiBase:     'api.github.com',

    // Rate limiting
    requestDelay: 2000,    // ms between requests (be nice to GitHub)
    maxPerSearch: 30,      // max results per search query

    // Default search topics aligned to Hexworth houses
    topics: [
        'cybersecurity education',
        'ethical hacking labs',
        'network security tutorial',
        'linux administration tutorial',
        'comptia study guide',
        'ctf challenges',
        'cloud security labs',
        'python security tools',
        'cryptography tutorial',
        'osint tools',
        'incident response playbook',
        'devops security',
    ],

    // File types worth extracting from repos
    extractableExtensions: ['.md', '.html', '.htm', '.ipynb', '.txt', '.py', '.sh'],
    maxExtractFiles: 20,
    maxExtractFileSize: 512 * 1024,  // 512KB per file
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

// ── GitHub API Helpers ───────────────────────────────────────────────────────

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make a GET request to the GitHub API.
 * Returns a Promise that resolves to { ok, data, headers, status }.
 */
function githubGet(urlPath) {
    return new Promise((resolve, reject) => {
        const headers = {
            'User-Agent': 'HexworthPrime-RepoScout/1.0',
            'Accept': 'application/vnd.github.v3+json',
        };

        if (CONFIG.githubToken) {
            headers['Authorization'] = `Bearer ${CONFIG.githubToken}`;
        }

        const options = {
            hostname: CONFIG.apiBase,
            path: urlPath,
            method: 'GET',
            headers,
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        data,
                        headers: res.headers,
                        rateLimit: {
                            remaining: parseInt(res.headers['x-ratelimit-remaining'] || '0', 10),
                            reset: parseInt(res.headers['x-ratelimit-reset'] || '0', 10),
                            limit: parseInt(res.headers['x-ratelimit-limit'] || '0', 10),
                        },
                    });
                } catch (err) {
                    resolve({
                        ok: false,
                        status: res.statusCode,
                        data: { message: 'JSON parse error', raw: body.slice(0, 200) },
                        headers: res.headers,
                        rateLimit: { remaining: 0, reset: 0, limit: 0 },
                    });
                }
            });
        });

        req.on('error', err => {
            resolve({
                ok: false,
                status: 0,
                data: { message: err.message },
                headers: {},
                rateLimit: { remaining: 0, reset: 0, limit: 0 },
            });
        });

        req.setTimeout(15000, () => {
            req.destroy();
            resolve({
                ok: false,
                status: 0,
                data: { message: 'Request timeout' },
                headers: {},
                rateLimit: { remaining: 0, reset: 0, limit: 0 },
            });
        });

        req.end();
    });
}

/**
 * Download raw file content from GitHub.
 */
function githubDownloadRaw(owner, repo, filePath) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'raw.githubusercontent.com',
            path: `/${owner}/${repo}/HEAD/${encodeURIComponent(filePath)}`,
            method: 'GET',
            headers: { 'User-Agent': 'HexworthPrime-RepoScout/1.0' },
        };

        const req = https.request(options, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const url = new URL(res.headers.location);
                const redirectOpts = {
                    hostname: url.hostname,
                    path: url.pathname + url.search,
                    method: 'GET',
                    headers: { 'User-Agent': 'HexworthPrime-RepoScout/1.0' },
                };
                const req2 = https.request(redirectOpts, (res2) => {
                    let body = '';
                    res2.on('data', chunk => { body += chunk; });
                    res2.on('end', () => resolve({ ok: res2.statusCode === 200, content: body }));
                });
                req2.on('error', () => resolve({ ok: false, content: '' }));
                req2.end();
                return;
            }

            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => resolve({ ok: res.statusCode === 200, content: body }));
        });

        req.on('error', () => resolve({ ok: false, content: '' }));
        req.setTimeout(15000, () => { req.destroy(); resolve({ ok: false, content: '' }); });
        req.end();
    });
}

// ── Core Functions ───────────────────────────────────────────────────────────

/**
 * searchRepos
 * Search GitHub for repos matching a query.
 * options: { sort, order, perPage, minStars }
 */
async function searchRepos(query, options) {
    const opts = Object.assign({
        sort: 'stars',
        order: 'desc',
        perPage: Math.min(CONFIG.maxPerSearch, 30),
        minStars: 5,
    }, options);

    const qualifiers = `${query} stars:>=${opts.minStars}`;
    const encoded = encodeURIComponent(qualifiers);
    const urlPath = `/search/repositories?q=${encoded}&sort=${opts.sort}&order=${opts.order}&per_page=${opts.perPage}`;

    const result = await githubGet(urlPath);

    if (!result.ok) {
        return {
            ok: false,
            error: result.data.message || `HTTP ${result.status}`,
            rateLimit: result.rateLimit,
            repos: [],
        };
    }

    const repos = (result.data.items || []).map(repo => ({
        owner: repo.owner.login,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        license: repo.license ? repo.license.spdx_id : null,
        hasWiki: repo.has_wiki,
        size: repo.size,
        defaultBranch: repo.default_branch,
    }));

    return {
        ok: true,
        totalCount: result.data.total_count || 0,
        repos,
        rateLimit: result.rateLimit,
    };
}

/**
 * evaluateRepo
 * Score a repo on relevance to Hexworth Prime.
 * Criteria: stars, topics, readme quality, activity, license.
 */
async function evaluateRepo(owner, repo) {
    const repoResult = await githubGet(`/repos/${owner}/${repo}`);
    if (!repoResult.ok) {
        return { ok: false, error: repoResult.data.message || 'Failed to fetch repo' };
    }

    await delay(CONFIG.requestDelay);

    // Fetch README
    const readmeResult = await githubGet(`/repos/${owner}/${repo}/readme`);
    const hasReadme = readmeResult.ok;
    let readmeLength = 0;
    if (hasReadme && readmeResult.data.size) {
        readmeLength = readmeResult.data.size;
    }

    const r = repoResult.data;
    const score = { total: 0, breakdown: {} };

    // Stars (0-25 points)
    const starScore = Math.min(r.stargazers_count / 40, 25);
    score.breakdown.stars = Math.round(starScore * 10) / 10;
    score.total += starScore;

    // Topics relevance (0-20 points)
    const eduTopics = ['education', 'tutorial', 'learning', 'course', 'lab', 'ctf',
        'cybersecurity', 'security', 'networking', 'linux', 'hacking', 'pentesting'];
    const matchedTopics = (r.topics || []).filter(t => eduTopics.includes(t));
    const topicScore = Math.min(matchedTopics.length * 5, 20);
    score.breakdown.topics = topicScore;
    score.total += topicScore;

    // README quality (0-20 points)
    let readmeScore = 0;
    if (hasReadme) {
        readmeScore += 5;  // Has README at all
        if (readmeLength > 500) readmeScore += 5;
        if (readmeLength > 2000) readmeScore += 5;
        if (readmeLength > 5000) readmeScore += 5;
    }
    score.breakdown.readme = readmeScore;
    score.total += readmeScore;

    // Activity (0-15 points): repos updated in last 6 months get full marks
    const monthsStale = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    const activityScore = Math.max(0, 15 - monthsStale);
    score.breakdown.activity = Math.round(activityScore * 10) / 10;
    score.total += activityScore;

    // License (0-10 points)
    const openLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'GPL-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'CC0-1.0', 'Unlicense'];
    const licenseScore = r.license && openLicenses.includes(r.license.spdx_id) ? 10 : 0;
    score.breakdown.license = licenseScore;
    score.total += licenseScore;

    // Forks as social proof (0-10 points)
    const forkScore = Math.min(r.forks_count / 10, 10);
    score.breakdown.forks = Math.round(forkScore * 10) / 10;
    score.total += forkScore;

    score.total = Math.round(score.total * 10) / 10;

    return {
        ok: true,
        owner,
        repo,
        fullName: r.full_name,
        description: r.description || '',
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics || [],
        license: r.license ? r.license.spdx_id : null,
        updatedAt: r.updated_at,
        hasReadme,
        readmeLength,
        score,
        evaluatedAt: new Date().toISOString(),
        rateLimit: repoResult.rateLimit,
    };
}

/**
 * extractContent
 * Download relevant files (markdown, HTML, notebooks) from a repo.
 */
async function extractContent(owner, repo) {
    // Get repo tree (recursive)
    const treeResult = await githubGet(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`);
    if (!treeResult.ok) {
        return { ok: false, error: treeResult.data.message || 'Failed to fetch tree' };
    }

    const tree = treeResult.data.tree || [];

    // Filter to extractable files within size limit
    const candidates = tree.filter(item => {
        if (item.type !== 'blob') return false;
        const ext = path.extname(item.path).toLowerCase();
        if (!CONFIG.extractableExtensions.includes(ext)) return false;
        if (item.size > CONFIG.maxExtractFileSize) return false;
        // Skip common non-content files
        if (item.path.includes('node_modules/')) return false;
        if (item.path.includes('.github/')) return false;
        if (item.path.includes('vendor/')) return false;
        return true;
    });

    // Limit file count
    const toExtract = candidates.slice(0, CONFIG.maxExtractFiles);
    const extractDir = path.join(CONFIG.extractDir, `${owner}--${repo}`);

    if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
    }

    const results = [];
    for (const file of toExtract) {
        await delay(500);  // Light delay for raw downloads

        const dl = await githubDownloadRaw(owner, repo, file.path);
        if (dl.ok) {
            const targetPath = path.join(extractDir, file.path);
            const targetDir = path.dirname(targetPath);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            fs.writeFileSync(targetPath, dl.content);
            results.push({ path: file.path, ok: true, size: dl.content.length });
        } else {
            results.push({ path: file.path, ok: false });
        }
    }

    return {
        ok: true,
        owner,
        repo,
        extractDir,
        totalCandidates: candidates.length,
        extracted: results.filter(r => r.ok).length,
        failed: results.filter(r => !r.ok).length,
        results,
        rateLimit: treeResult.rateLimit,
    };
}

/**
 * batchSearch
 * Search across multiple topics and build a combined results set.
 */
async function batchSearch(topics) {
    const searchTopics = topics || CONFIG.topics;
    const allRepos = new Map();  // fullName -> repo (dedup)
    const errors = [];

    for (const topic of searchTopics) {
        const result = await searchRepos(topic, { perPage: 10, minStars: 10 });

        if (!result.ok) {
            errors.push({ topic, error: result.error });
        } else {
            for (const repo of result.repos) {
                if (!allRepos.has(repo.fullName)) {
                    repo.matchedTopics = [topic];
                    allRepos.set(repo.fullName, repo);
                } else {
                    // Track which search topics matched this repo
                    allRepos.get(repo.fullName).matchedTopics.push(topic);
                }
            }
        }

        // Rate limit check
        if (result.rateLimit && result.rateLimit.remaining < 5) {
            const resetIn = (result.rateLimit.reset * 1000 - Date.now()) / 1000;
            console.log(`  ${C.yellow}Rate limit low (${result.rateLimit.remaining} remaining). Resets in ${Math.ceil(resetIn)}s${C.reset}`);
            break;
        }

        await delay(CONFIG.requestDelay);
    }

    // Sort by stars descending
    const repos = Array.from(allRepos.values());
    repos.sort((a, b) => b.stars - a.stars);

    return {
        ok: true,
        topicsSearched: searchTopics.length,
        uniqueRepos: repos.length,
        repos,
        errors,
        searchedAt: new Date().toISOString(),
    };
}

/**
 * generateCatalog
 * Create/update the browseable catalog JSON file.
 */
async function generateCatalog(searchResults) {
    const catalog = {
        _meta: {
            version: 1,
            format: 'repo-scout-catalog',
            description: 'GitHub repository catalog for Hexworth Prime content pipeline',
        },
        generatedAt: new Date().toISOString(),
        totalRepos: searchResults.uniqueRepos,
        topicsSearched: searchResults.topicsSearched,
        repos: searchResults.repos.map(r => ({
            fullName: r.fullName,
            owner: r.owner,
            name: r.name,
            description: r.description,
            url: r.url,
            stars: r.stars,
            forks: r.forks,
            language: r.language,
            topics: r.topics,
            license: r.license,
            updatedAt: r.updatedAt,
            matchedTopics: r.matchedTopics || [],
        })),
    };

    fs.writeFileSync(CONFIG.catalogPath, JSON.stringify(catalog, null, 2) + '\n');
    return catalog;
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    searchRepos,
    evaluateRepo,
    extractContent,
    batchSearch,
    generateCatalog,
    CONFIG,
};

// ── Standalone CLI ───────────────────────────────────────────────────────────

if (require.main === module) {
    const command = process.argv[2];

    if (!command || command === 'help' || command === '--help') {
        console.log(`
${C.bold}repo-scout${C.reset} -- GitHub repository discovery for Hexworth Prime

${C.bold}COMMANDS${C.reset}

  ${C.cyan}search <query>${C.reset}         Search GitHub repos
  ${C.cyan}evaluate <owner/repo>${C.reset}  Score a specific repo
  ${C.cyan}extract <owner/repo>${C.reset}   Download relevant files
  ${C.cyan}batch${C.reset}                  Search across all configured topics
  ${C.cyan}catalog${C.reset}                Show the current repo catalog
  ${C.cyan}help${C.reset}                   Show this help

${C.bold}ENVIRONMENT${C.reset}

  GITHUB_TOKEN   Optional. Raises rate limit from 60 to 5000 req/hr.

${C.bold}OUTPUT${C.reset}

  Catalog:    ${C.dim}${CONFIG.catalogPath}${C.reset}
  Extracted:  ${C.dim}${CONFIG.extractDir}/${C.reset}
`);
        process.exit(0);
    }

    // Wrap async CLI in IIFE
    (async () => {
        try {
            if (command === 'search') {
                const query = process.argv.slice(3).join(' ');
                if (!query) {
                    console.error(`  ${C.red}Usage: node repo-scout.js search <query>${C.reset}`);
                    process.exit(1);
                }

                console.log(`\n${C.bold}REPO SEARCH${C.reset}  ${C.dim}${query}${C.reset}\n`);

                const result = await searchRepos(query);
                if (!result.ok) {
                    console.error(`  ${C.red}${result.error}${C.reset}\n`);
                    process.exit(1);
                }

                console.log(`  ${C.dim}${result.totalCount} total results (showing ${result.repos.length})${C.reset}\n`);

                for (const repo of result.repos) {
                    const stars = String(repo.stars).padStart(6);
                    console.log(`  ${C.yellow}${stars}${C.reset}  ${C.cyan}${repo.fullName}${C.reset}`);
                    if (repo.description) {
                        console.log(`         ${C.dim}${repo.description.slice(0, 70)}${C.reset}`);
                    }
                }

                console.log(`\n  ${C.dim}Rate limit: ${result.rateLimit.remaining}/${result.rateLimit.limit} remaining${C.reset}\n`);
                process.exit(0);
            }

            if (command === 'evaluate') {
                const target = process.argv[3];
                if (!target || !target.includes('/')) {
                    console.error(`  ${C.red}Usage: node repo-scout.js evaluate <owner/repo>${C.reset}`);
                    process.exit(1);
                }

                const [owner, repo] = target.split('/');
                console.log(`\n${C.bold}EVALUATE${C.reset}  ${C.cyan}${owner}/${repo}${C.reset}\n`);

                const result = await evaluateRepo(owner, repo);
                if (!result.ok) {
                    console.error(`  ${C.red}${result.error}${C.reset}\n`);
                    process.exit(1);
                }

                console.log(`  ${C.bold}Score: ${result.score.total}/100${C.reset}\n`);
                console.log(`  Stars:     ${C.dim}${result.stars}${C.reset}  (${result.score.breakdown.stars} pts)`);
                console.log(`  Topics:    ${C.dim}${result.topics.join(', ') || 'none'}${C.reset}  (${result.score.breakdown.topics} pts)`);
                console.log(`  README:    ${C.dim}${result.hasReadme ? result.readmeLength + ' bytes' : 'none'}${C.reset}  (${result.score.breakdown.readme} pts)`);
                console.log(`  Activity:  ${C.dim}${result.updatedAt}${C.reset}  (${result.score.breakdown.activity} pts)`);
                console.log(`  License:   ${C.dim}${result.license || 'none'}${C.reset}  (${result.score.breakdown.license} pts)`);
                console.log(`  Forks:     ${C.dim}${result.forks}${C.reset}  (${result.score.breakdown.forks} pts)`);
                console.log(`\n  ${C.dim}${result.url}${C.reset}\n`);
                process.exit(0);
            }

            if (command === 'extract') {
                const target = process.argv[3];
                if (!target || !target.includes('/')) {
                    console.error(`  ${C.red}Usage: node repo-scout.js extract <owner/repo>${C.reset}`);
                    process.exit(1);
                }

                const [owner, repo] = target.split('/');
                console.log(`\n${C.bold}EXTRACT${C.reset}  ${C.cyan}${owner}/${repo}${C.reset}\n`);

                const result = await extractContent(owner, repo);
                if (!result.ok) {
                    console.error(`  ${C.red}${result.error}${C.reset}\n`);
                    process.exit(1);
                }

                console.log(`  ${C.green}${result.extracted} files extracted${C.reset}  ${result.failed > 0 ? C.red + result.failed + ' failed' + C.reset : ''}`);
                console.log(`  ${C.dim}${result.totalCandidates} candidates found in tree${C.reset}`);
                console.log(`  ${C.dim}Output: ${result.extractDir}${C.reset}\n`);
                process.exit(0);
            }

            if (command === 'batch') {
                console.log(`\n${C.bold}BATCH SEARCH${C.reset}  ${C.dim}(${CONFIG.topics.length} topics)${C.reset}\n`);

                const result = await batchSearch();

                if (result.errors.length > 0) {
                    for (const err of result.errors) {
                        console.log(`  ${C.yellow}WARN${C.reset}  ${err.topic}: ${err.error}`);
                    }
                    console.log('');
                }

                console.log(`  ${C.green}${result.uniqueRepos} unique repos found${C.reset}\n`);

                for (const repo of result.repos.slice(0, 20)) {
                    const stars = String(repo.stars).padStart(6);
                    console.log(`  ${C.yellow}${stars}${C.reset}  ${C.cyan}${repo.fullName}${C.reset}`);
                    if (repo.description) {
                        console.log(`         ${C.dim}${repo.description.slice(0, 70)}${C.reset}`);
                    }
                }

                if (result.repos.length > 20) {
                    console.log(`\n  ${C.dim}... and ${result.repos.length - 20} more${C.reset}`);
                }

                // Save catalog
                const catalog = await generateCatalog(result);
                console.log(`\n  ${C.dim}Catalog saved: ${CONFIG.catalogPath} (${catalog.totalRepos} repos)${C.reset}\n`);
                process.exit(0);
            }

            if (command === 'catalog') {
                console.log(`\n${C.bold}REPO CATALOG${C.reset}\n`);

                if (!fs.existsSync(CONFIG.catalogPath)) {
                    console.log(`  ${C.dim}No catalog found. Run: node repo-scout.js batch${C.reset}\n`);
                    process.exit(0);
                }

                try {
                    const catalog = JSON.parse(fs.readFileSync(CONFIG.catalogPath, 'utf8'));
                    console.log(`  ${C.dim}Generated: ${catalog.generatedAt}${C.reset}`);
                    console.log(`  ${C.dim}Repos: ${catalog.totalRepos}${C.reset}\n`);

                    for (const repo of (catalog.repos || []).slice(0, 30)) {
                        const stars = String(repo.stars).padStart(6);
                        const topics = repo.matchedTopics && repo.matchedTopics.length
                            ? `  ${C.gray}[${repo.matchedTopics.join(', ')}]${C.reset}`
                            : '';
                        console.log(`  ${C.yellow}${stars}${C.reset}  ${C.cyan}${repo.fullName}${C.reset}${topics}`);
                    }

                    if ((catalog.repos || []).length > 30) {
                        console.log(`\n  ${C.dim}... and ${catalog.repos.length - 30} more (see ${CONFIG.catalogPath})${C.reset}`);
                    }
                } catch (err) {
                    console.error(`  ${C.red}Failed to read catalog: ${err.message}${C.reset}`);
                }
                console.log('');
                process.exit(0);
            }

            console.error(`  ${C.red}Unknown command: ${command}${C.reset}`);
            console.error(`  Run ${C.cyan}node repo-scout.js help${C.reset} for usage.`);
            process.exit(1);

        } catch (err) {
            console.error(`\n  ${C.red}Error: ${err.message}${C.reset}\n`);
            process.exit(1);
        }
    })();
}
