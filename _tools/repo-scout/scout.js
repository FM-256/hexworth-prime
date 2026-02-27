#!/usr/bin/env node
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// --- Constants ---

const DATA_FILE = path.join(__dirname, 'discoveries.json');
const GITHUB_API = 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN || null;
const DELAY_MS = 1200; // 1.2s between requests (stay well under rate limit)

// ANSI color codes
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
};

// --- Search Queries ---

const DEFAULT_QUERIES = [
  'cybersecurity education',
  'networking labs',
  'CTF challenges',
  'sysadmin tutorials',
  'cloud labs',
  'programming courses',
  'IT certification prep',
];

// --- License Allowlist ---

const ALLOWED_LICENSES = new Set([
  'mit',
  'apache-2.0',
  'cc-by-4.0',
  'cc-by-sa-4.0',
]);

// --- House Mapping ---
// Each house has keywords that map repo topics/descriptions to Hexworth houses.

const HOUSE_KEYWORDS = {
  'shield':     ['security', 'defense', 'incident-response', 'blue-team', 'soc', 'siem', 'ids', 'ips', 'firewall', 'malware-analysis', 'threat-detection', 'dfir', 'forensics'],
  'eye':        ['soc', 'monitoring', 'detection', 'threat-intelligence', 'osint', 'splunk', 'elk', 'wireshark', 'packet-analysis', 'log-analysis', 'observability'],
  'dark-arts':  ['pentesting', 'offensive', 'red-team', 'exploit', 'ctf', 'capture-the-flag', 'vulnerability', 'pentest', 'bug-bounty', 'hacking', 'kali', 'metasploit', 'burpsuite'],
  'web':        ['networking', 'network', 'cisco', 'routing', 'switching', 'tcp-ip', 'dns', 'dhcp', 'subnetting', 'ccna', 'network-security', 'web-security', 'owasp'],
  'cloud':      ['cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'docker', 'terraform', 'ansible', 'cloud-security', 'serverless', 'infrastructure-as-code'],
  'forge':      ['hardware', 'comptia', 'a-plus', 'network-plus', 'security-plus', 'embedded', 'iot', 'raspberry-pi', 'arduino', 'firmware', 'certification'],
  'code':       ['programming', 'python', 'javascript', 'golang', 'rust', 'coding', 'software-development', 'algorithms', 'data-structures', 'web-development'],
  'script':     ['linux', 'bash', 'automation', 'scripting', 'shell', 'powershell', 'sysadmin', 'system-administration', 'cli', 'terminal', 'unix'],
  'key':        ['cryptography', 'crypto', 'encryption', 'pki', 'certificates', 'tls', 'ssl', 'hashing', 'steganography'],
  'ai':         ['machine-learning', 'artificial-intelligence', 'deep-learning', 'neural-network', 'nlp', 'ai-security', 'adversarial-ml'],
};

// --- Helpers ---

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadDiscoveries() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveDiscoveries(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Make an HTTPS GET request to the GitHub API.
 * Returns parsed JSON.
 */
function ghGet(endpoint) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(endpoint, GITHUB_API);
    const headers = {
      'User-Agent': 'hexworth-repo-scout/1.0',
      'Accept': 'application/vnd.github+json',
    };
    if (TOKEN) {
      headers['Authorization'] = `Bearer ${TOKEN}`;
    }

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 403 && res.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = parseInt(res.headers['x-ratelimit-reset'], 10);
          const waitSec = Math.max(0, resetTime - Math.floor(Date.now() / 1000));
          reject(new Error(`Rate limited. Resets in ${waitSec}s. Use GITHUB_TOKEN for 5000 req/hr.`));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API ${res.statusCode}: ${body.slice(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Calculate quality score for a repo.
 */
function scoreRepo(repo) {
  let score = 0;

  // Stars: 1 point per 10
  score += Math.floor((repo.stargazers_count || 0) / 10);

  // Forks: 1 point per 5
  score += Math.floor((repo.forks_count || 0) / 5);

  // Has wiki: +5
  if (repo.has_wiki) score += 5;

  // Has topics: +3
  if (repo.topics && repo.topics.length > 0) score += 3;

  // Recent push (within 6 months): +5
  if (repo.pushed_at) {
    const pushDate = new Date(repo.pushed_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (pushDate > sixMonthsAgo) score += 5;
  }

  return score;
}

/**
 * Map a repo to Hexworth houses based on topics, name, and description.
 */
function mapHouses(repo) {
  const houses = new Set();

  // Build a searchable text blob from topics, name, and description
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const text = [
    repo.name || '',
    repo.description || '',
    ...topics,
  ].join(' ').toLowerCase();

  for (const [house, keywords] of Object.entries(HOUSE_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw) || topics.includes(kw)) {
        houses.add(house);
        break; // One match is enough for this house
      }
    }
  }

  // Default: if no house matched, assign 'code' (generic)
  if (houses.size === 0) houses.add('code');

  return Array.from(houses).sort();
}

/**
 * Determine content type from repo metadata.
 */
function classifyContent(repo) {
  const text = [
    repo.name || '',
    repo.description || '',
    ...(repo.topics || []),
  ].join(' ').toLowerCase();

  if (/\b(lab|hands[- ]on|exercise|workshop|practical)\b/.test(text)) return 'lab';
  if (/\b(ctf|capture[- ]the[- ]flag|challenge|wargame)\b/.test(text)) return 'ctf';
  if (/\b(course|curriculum|syllabus|bootcamp|class)\b/.test(text)) return 'course';
  if (/\b(tutorial|guide|how[- ]to|walkthrough|learn)\b/.test(text)) return 'tutorial';
  if (/\b(tool|framework|library|utility|scanner)\b/.test(text)) return 'tool';
  if (/\b(cheatsheet|cheat[- ]sheet|reference|awesome|list)\b/.test(text)) return 'reference';
  if (/\b(cert|certification|exam|prep|study)\b/.test(text)) return 'certification';
  return 'resource';
}

/**
 * Check if a repo's license is in our allowlist.
 */
function isAllowedLicense(repo) {
  if (!repo.license || !repo.license.spdx_id) return false;
  return ALLOWED_LICENSES.has(repo.license.spdx_id.toLowerCase());
}

/**
 * Check if a repo was pushed within the last 2 years.
 */
function isRecentlyActive(repo) {
  if (!repo.pushed_at) return false;
  const pushDate = new Date(repo.pushed_at);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  return pushDate > twoYearsAgo;
}

/**
 * Build a discovery record from a GitHub repo object.
 */
function toDiscovery(repo) {
  return {
    url: repo.html_url,
    name: repo.full_name,
    description: (repo.description || '').slice(0, 300),
    license: repo.license ? repo.license.spdx_id : null,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    lastPush: repo.pushed_at,
    topics: repo.topics || [],
    score: scoreRepo(repo),
    houses: mapHouses(repo),
    contentType: classifyContent(repo),
    evaluated: false,
  };
}

// --- Commands ---

/**
 * Search GitHub for repos matching our queries.
 */
async function cmdSearch(customQuery) {
  const queries = customQuery ? [customQuery] : DEFAULT_QUERIES;
  const existing = loadDiscoveries();
  const existingUrls = new Set(existing.map(d => d.url));
  let added = 0;
  let skipped = 0;
  let filtered = 0;

  console.log(`${C.cyan}${C.bold}Repo Scout — Search${C.reset}`);
  console.log(`${C.gray}Loaded ${existing.length} existing discoveries${C.reset}`);
  if (!TOKEN) {
    console.log(`${C.yellow}Warning: No GITHUB_TOKEN set. Limited to 10 req/min (unauthenticated).${C.reset}`);
    console.log(`${C.yellow}Export GITHUB_TOKEN for 5000 req/hr.${C.reset}`);
  }
  console.log();

  for (const query of queries) {
    console.log(`${C.bold}Searching: "${query}"${C.reset}`);

    // Build search query with qualifiers
    const q = encodeURIComponent(`${query} in:name,description,readme stars:>=5`);
    const searchUrl = `/search/repositories?q=${q}&sort=stars&order=desc&per_page=30`;

    try {
      const data = await ghGet(searchUrl);
      const items = data.items || [];
      console.log(`  ${C.gray}Found ${data.total_count} results, processing top ${items.length}${C.reset}`);

      for (const repo of items) {
        // Deduplication
        if (existingUrls.has(repo.html_url)) {
          skipped++;
          continue;
        }

        // Filter: must have allowed license
        if (!isAllowedLicense(repo)) {
          filtered++;
          continue;
        }

        // Filter: must be recently active
        if (!isRecentlyActive(repo)) {
          filtered++;
          continue;
        }

        // Filter: must have description (proxy for "has README" since API doesn't expose that directly)
        if (!repo.description) {
          filtered++;
          continue;
        }

        const discovery = toDiscovery(repo);
        existing.push(discovery);
        existingUrls.add(repo.html_url);
        added++;

        console.log(`  ${C.green}+${C.reset} ${repo.full_name} ${C.gray}(score: ${discovery.score}, houses: ${discovery.houses.join(', ')})${C.reset}`);
      }
    } catch (err) {
      console.log(`  ${C.red}Error: ${err.message}${C.reset}`);
      if (err.message.includes('Rate limited')) {
        console.log(`  ${C.red}Stopping searches due to rate limit.${C.reset}`);
        break;
      }
    }

    // Rate limit delay
    if (queries.indexOf(query) < queries.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Sort by score descending before saving
  existing.sort((a, b) => b.score - a.score);
  saveDiscoveries(existing);

  console.log();
  console.log(`${C.bold}Results:${C.reset}`);
  console.log(`  ${C.green}Added:    ${added}${C.reset}`);
  console.log(`  ${C.gray}Skipped:  ${skipped} (duplicates)${C.reset}`);
  console.log(`  ${C.gray}Filtered: ${filtered} (license/activity/quality)${C.reset}`);
  console.log(`  ${C.cyan}Total:    ${existing.length} discoveries${C.reset}`);
}

/**
 * List all discoveries.
 */
function cmdList() {
  const data = loadDiscoveries();
  if (data.length === 0) {
    console.log(`${C.gray}No discoveries yet. Run: node scout.js search${C.reset}`);
    return;
  }

  console.log(`${C.cyan}${C.bold}Repo Scout — Discoveries (${data.length})${C.reset}`);
  console.log();

  for (const d of data) {
    const evalMark = d.evaluated ? `${C.green}[eval]${C.reset}` : `${C.gray}[new]${C.reset}`;
    const scoreStr = `${C.yellow}score:${d.score}${C.reset}`;
    const houseStr = d.houses.map(h => `${C.cyan}${h}${C.reset}`).join(', ');
    const typeStr = `${C.magenta}${d.contentType}${C.reset}`;

    console.log(`  ${evalMark} ${C.bold}${d.name}${C.reset} ${scoreStr}`);
    console.log(`    ${d.description || '(no description)'}`);
    console.log(`    ${C.gray}Stars: ${d.stars} | Forks: ${d.forks} | License: ${d.license || 'unknown'} | Type: ${typeStr} | Houses: ${houseStr}${C.reset}`);
    console.log(`    ${C.gray}${d.url}${C.reset}`);
    console.log();
  }
}

/**
 * Show statistics about discoveries.
 */
function cmdStats() {
  const data = loadDiscoveries();
  if (data.length === 0) {
    console.log(`${C.gray}No discoveries yet. Run: node scout.js search${C.reset}`);
    return;
  }

  console.log(`${C.cyan}${C.bold}Repo Scout — Statistics${C.reset}`);
  console.log();

  // Count by house
  const houseCounts = {};
  for (const d of data) {
    for (const h of d.houses) {
      houseCounts[h] = (houseCounts[h] || 0) + 1;
    }
  }

  console.log(`${C.bold}By House:${C.reset}`);
  const sortedHouses = Object.entries(houseCounts).sort((a, b) => b[1] - a[1]);
  for (const [house, count] of sortedHouses) {
    const bar = '█'.repeat(Math.min(count, 40));
    console.log(`  ${C.cyan}${house.padEnd(12)}${C.reset} ${bar} ${count}`);
  }
  console.log();

  // Count by license
  const licenseCounts = {};
  for (const d of data) {
    const lic = d.license || 'unknown';
    licenseCounts[lic] = (licenseCounts[lic] || 0) + 1;
  }

  console.log(`${C.bold}By License:${C.reset}`);
  const sortedLicenses = Object.entries(licenseCounts).sort((a, b) => b[1] - a[1]);
  for (const [lic, count] of sortedLicenses) {
    console.log(`  ${C.white}${lic.padEnd(16)}${C.reset} ${count}`);
  }
  console.log();

  // Score distribution
  const scoreBuckets = { '0-5': 0, '6-10': 0, '11-20': 0, '21-50': 0, '51+': 0 };
  for (const d of data) {
    if (d.score <= 5) scoreBuckets['0-5']++;
    else if (d.score <= 10) scoreBuckets['6-10']++;
    else if (d.score <= 20) scoreBuckets['11-20']++;
    else if (d.score <= 50) scoreBuckets['21-50']++;
    else scoreBuckets['51+']++;
  }

  console.log(`${C.bold}By Score:${C.reset}`);
  for (const [range, count] of Object.entries(scoreBuckets)) {
    const bar = '█'.repeat(Math.min(count, 40));
    console.log(`  ${C.yellow}${range.padEnd(8)}${C.reset} ${bar} ${count}`);
  }
  console.log();

  // Count by content type
  const typeCounts = {};
  for (const d of data) {
    typeCounts[d.contentType] = (typeCounts[d.contentType] || 0) + 1;
  }

  console.log(`${C.bold}By Content Type:${C.reset}`);
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    console.log(`  ${C.magenta}${type.padEnd(16)}${C.reset} ${count}`);
  }
  console.log();

  // Evaluation status
  const evaluated = data.filter(d => d.evaluated).length;
  const pending = data.length - evaluated;
  console.log(`${C.bold}Evaluation:${C.reset}`);
  console.log(`  ${C.green}Evaluated: ${evaluated}${C.reset}`);
  console.log(`  ${C.gray}Pending:   ${pending}${C.reset}`);
  console.log(`  ${C.cyan}Total:     ${data.length}${C.reset}`);
}

// --- CLI Router ---

function printUsage() {
  console.log(`${C.cyan}${C.bold}Repo Scout${C.reset} — GitHub repo discovery for Hexworth Prime`);
  console.log();
  console.log(`${C.bold}Usage:${C.reset}`);
  console.log(`  node scout.js search                  Search all default queries`);
  console.log(`  node scout.js search --query "text"    Search a custom query`);
  console.log(`  node scout.js list                     List all discoveries`);
  console.log(`  node scout.js stats                    Show statistics`);
  console.log();
  console.log(`${C.bold}Environment:${C.reset}`);
  console.log(`  GITHUB_TOKEN    GitHub personal access token (recommended)`);
  console.log(`                  Without: 10 requests/min. With: 5000 requests/hr`);
  console.log();
  console.log(`${C.bold}Data:${C.reset}`);
  console.log(`  ${DATA_FILE}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'search': {
      let customQuery = null;
      const queryIdx = args.indexOf('--query');
      if (queryIdx !== -1 && args[queryIdx + 1]) {
        customQuery = args[queryIdx + 1];
      }
      await cmdSearch(customQuery);
      break;
    }
    case 'list':
      cmdList();
      break;
    case 'stats':
      cmdStats();
      break;
    default:
      printUsage();
      break;
  }
}

main().catch(err => {
  console.error(`${C.red}Fatal: ${err.message}${C.reset}`);
  process.exit(1);
});
