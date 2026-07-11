#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// --- Constants ---

const DATA_FILE = path.join(__dirname, 'sprints.json');

const STATUSES = ['done', 'awaiting-qc', 'open', 'in-progress', 'partial', 'blocked', 'deferred', 'backlog'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const SERIES_MAP = {
  'A':   'Architecture',
  'DL':  'Digital Life',
  'M':   'Migration',
  'F':   'Feature',
  'DA':  'Dark Arts',
  'L':   'Linux',
  'MX':  'Matrix',
  'HD':  'Handler Dashboard',
  'R':   'Registration & Rebuild',
  'CLH': 'Command Line Heroes',
  'AR':  'Arena',
  'PR':  'Product Readiness',
  'QC':  'Quality Control',
  'ES':  'EduScan',
  'OB':  'Onboarding',
  'HED': 'Host Error Detector',
  'ARC': 'Arctic',
  'WSA': 'Windows Server Admin',
  'AI':  'AI & Agents',
  'MON': 'Monitoring & Observability',
};
const HOUSES = ['forge', 'shield', 'cloud', 'web', 'script', 'code', 'key', 'eye', 'dark-arts', 'multi', 'ai'];

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
  bgRed:   '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow:'\x1b[43m',
};

const STATUS_ICONS = {
  'done':        `${C.green}✅${C.reset}`,
  'awaiting-qc': `${C.cyan}🔍${C.reset}`,
  'open':        `${C.white}○${C.reset}`,
  'in-progress': `${C.yellow}🔨${C.reset}`,
  'partial':     `${C.yellow}◐${C.reset}`,
  'blocked':     `${C.red}⛔${C.reset}`,
  'deferred':    `${C.gray}⏸${C.reset}`,
  'backlog':     `${C.gray}📋${C.reset}`,
};

const STATUS_ICONS_PLAIN = {
  'done':        '✅',
  'awaiting-qc': '🔍',
  'open':        '○',
  'in-progress': '🔨',
  'partial':     '◐',
  'blocked':     '⛔',
  'deferred':    '⏸',
  'backlog':     '📋',
};

function priorityColor(priority) {
  switch (priority) {
    case 'critical': return C.red;
    case 'high':     return C.yellow;
    case 'medium':   return C.cyan;
    case 'low':      return C.gray;
    default:         return C.white;
  }
}

// --- Data I/O ---

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const empty = {
      meta: { version: 1, lastUpdated: new Date().toISOString() },
      sprints: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2) + '\n');
  }
}

function loadData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function saveData(data) {
  data.meta.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
}

// --- Formatters ---

function padRight(str, len) {
  const visible = stripAnsi(str);
  if (visible.length >= len) return str;
  return str + ' '.repeat(len - visible.length);
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

function formatTable(rows, columns) {
  if (rows.length === 0) return '';

  // Calculate column widths
  const widths = columns.map((col, i) => {
    const headerLen = col.header.length;
    const maxData = rows.reduce((max, row) => {
      const val = stripAnsi(String(row[col.key] || ''));
      return Math.max(max, val.length);
    }, 0);
    return Math.max(headerLen, maxData);
  });

  const lines = [];
  rows.forEach(row => {
    const cells = columns.map((col, i) => {
      const val = String(row[col.key] || '');
      return padRight(val, widths[i]);
    });
    lines.push('  ' + cells.join('  '));
  });

  return lines.join('\n');
}

function seriesLabel(series) {
  return SERIES_MAP[series] || series;
}

function depStatus(depId, sprints) {
  const dep = sprints.find(s => s.id === depId);
  if (!dep) return `${C.gray}?${C.reset}`;
  if (dep.status === 'done') return `${C.green}✅${C.reset}`;
  return `${C.red}⛔${C.reset}`;
}

// Stragglers commit ac664e03 (2026-05-02) introduced status='completed' as a
// one-time convention for STR-N items satisfied by the v7.1.0 ZION release.
// Treat 'completed' identically to 'done' for all dashboard / filter logic.
// (Use a helper instead of changing the data — see Nancy review 2026-05-09.)
function isClosed(s) {
  return s.status === 'done' || s.status === 'completed';
}

function isBlocked(sprint, sprints) {
  if (!sprint.depends || sprint.depends.length === 0) return false;
  return sprint.depends.some(depId => {
    const dep = sprints.find(s => s.id === depId);
    return !dep || !isClosed(dep);
  });
}

// --- Commands ---

function cmdList(args, data) {
  let items = data.sprints;

  // Parse filters
  const showAll = args.includes('--all');
  const seriesFilter = getArgValue(args, '--series');
  const houseFilter = getArgValue(args, '--house');
  const priorityFilter = getArgValue(args, '--priority');
  const statusFilter = getArgValue(args, '--status');

  // Default: exclude closed items unless --all or --status
  if (!showAll && !statusFilter) {
    items = items.filter(s => !isClosed(s));
  }

  if (seriesFilter) {
    const sf = seriesFilter.toUpperCase();
    items = items.filter(s => s.series === sf);
  }
  if (houseFilter) {
    const hf = houseFilter.toLowerCase();
    items = items.filter(s => s.houses && s.houses.includes(hf));
  }
  if (priorityFilter) {
    const pf = priorityFilter.toLowerCase();
    items = items.filter(s => s.priority === pf);
  }
  if (statusFilter) {
    const sf = statusFilter.toLowerCase();
    items = items.filter(s => s.status === sf);
  }

  if (items.length === 0) {
    console.log(`\n  ${C.dim}No items match the current filters.${C.reset}\n`);
    return;
  }

  const totalLabel = showAll ? 'total' : 'open';
  console.log(`\n${C.bold}SPRINT BACKLOG${C.reset} — ${items.length} ${totalLabel} items\n`);

  // Group by priority
  const groups = {};
  PRIORITIES.forEach(p => { groups[p] = []; });
  items.forEach(item => {
    const p = item.priority || 'medium';
    if (groups[p]) groups[p].push(item);
    else groups['medium'].push(item);
  });

  PRIORITIES.forEach(priority => {
    const group = groups[priority];
    const color = priorityColor(priority);
    console.log(`  ${color}${C.bold}${priority.toUpperCase()}${C.reset}`);

    if (group.length === 0) {
      console.log(`  ${C.dim}(none)${C.reset}\n`);
      return;
    }

    group.forEach(item => {
      const icon = STATUS_ICONS[item.status] || '?';
      const id = padRight(`${C.bold}${item.id}${C.reset}`, 14);
      const title = padRight(truncate(item.title, 44), 44);
      const status = padRight(item.status, 12);
      const houses = item.houses ? item.houses.join('/') : '';

      let depInfo = '';
      if (item.depends && item.depends.length > 0 && !isClosed(item)) {
        const deps = item.depends.map(d => `${d} (${depStatus(d, data.sprints)})`).join(', ');
        depInfo = `  ${C.dim}← ${deps}${C.reset}`;
      }

      console.log(`  ${icon} ${id} ${title} ${C.dim}${status}${C.reset} ${C.cyan}${houses}${C.reset}${depInfo}`);
    });
    console.log('');
  });
}

function cmdShow(args, data) {
  const id = args[0];
  if (!id) {
    console.error(`  ${C.red}Usage: sprint show <ID>${C.reset}`);
    process.exit(1);
  }

  const item = data.sprints.find(s => s.id.toLowerCase() === id.toLowerCase());
  if (!item) {
    console.error(`  ${C.red}Sprint "${id}" not found.${C.reset}`);
    process.exit(1);
  }

  const width = 55;
  const line = '─'.repeat(width);
  const icon = STATUS_ICONS[item.status] || '?';

  console.log('');
  console.log(`  ┌${'─'.repeat(width)}┐`);
  console.log(`  │  ${C.bold}${padRight(item.id, 7)}${C.reset}${padRight(truncate(item.title, width - 11), width - 10)}│`);
  console.log(`  ├${line}┤`);

  const fields = [];
  fields.push(['Status',   `${icon} ${item.status}`]);
  fields.push(['Priority', `${priorityColor(item.priority)}${item.priority}${C.reset}`]);
  fields.push(['Series',   `${item.series} (${seriesLabel(item.series)})`]);

  if (item.houses && item.houses.length > 0) {
    fields.push(['Houses', item.houses.join(', ')]);
  }

  if (item.depends && item.depends.length > 0) {
    const deps = item.depends.map(d => {
      const dep = data.sprints.find(s => s.id === d);
      const st = dep ? `${STATUS_ICONS_PLAIN[dep.status]} ${dep.status}` : '?';
      return `${d} (${st})`;
    }).join(', ');
    fields.push(['Depends', deps]);
  }

  if (item.commits && item.commits.length > 0) {
    fields.push(['Commits', item.commits.join(', ')]);
  }

  fields.push(['Created', item.created || 'unknown']);
  fields.push(['Updated', item.updated || 'unknown']);

  if (item.completed) {
    fields.push(['Completed', item.completed]);
  }

  fields.forEach(([label, value]) => {
    const labelStr = padRight(`${label}:`, 12);
    const valueVisible = stripAnsi(String(value));
    const pad = width - 14 - valueVisible.length;
    console.log(`  │  ${C.dim}${labelStr}${C.reset}${value}${' '.repeat(Math.max(0, pad))} │`);
  });

  if (item.notes) {
    console.log(`  │${' '.repeat(width)}│`);
    // Word-wrap notes
    const maxLine = width - 4;
    const words = item.notes.split(' ');
    let currentLine = '';
    const noteLines = [];
    words.forEach(word => {
      if (currentLine.length + word.length + 1 > maxLine) {
        noteLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    });
    if (currentLine) noteLines.push(currentLine);
    noteLines.forEach(nl => {
      console.log(`  │  ${padRight(nl, width - 2)}│`);
    });
  }

  console.log(`  └${'─'.repeat(width)}┘`);
  console.log('');
}

function nextId(data, seriesPrefix) {
  const prefix = seriesPrefix.toUpperCase();
  let max = 0;
  data.sprints.forEach(s => {
    if (s.series === prefix) {
      const num = parseInt(s.id.replace(/^[A-Z]+-/, '')) || 0;
      if (num > max) max = num;
    }
  });
  return `${prefix}-${max + 1}`;
}

function cmdAdd() {
  const data = loadData();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (prompt, defaultVal) => new Promise(resolve => {
    const suffix = defaultVal ? ` [${defaultVal}]` : '';
    rl.question(`  ${prompt}${suffix}: `, answer => {
      resolve(answer.trim() || defaultVal || '');
    });
  });

  // Show available series with next ID
  const seriesList = Object.entries(SERIES_MAP).map(([prefix, name]) => {
    const nid = nextId(data, prefix);
    return `${C.dim}${prefix.padEnd(4)}→ ${nid.padEnd(8)}${name}${C.reset}`;
  });

  console.log(`\n${C.bold}CREATE NEW SPRINT${C.reset}\n`);
  console.log(`  ${C.bold}Series${C.reset}  ${C.bold}Next ID${C.reset}  ${C.bold}Category${C.reset}`);
  seriesList.forEach(s => console.log(`  ${s}`));
  console.log('');

  (async () => {
    const rawId = (await ask('Series prefix or full ID (e.g., F or F-41)')).replace(/[^A-Za-z0-9\-]/g, '');
    if (!rawId) { console.error('  ID is required.'); rl.close(); return; }

    // If user typed just a prefix (no dash+number), auto-assign next ID
    let id;
    if (/^[A-Za-z]+$/.test(rawId)) {
      id = nextId(data, rawId);
      console.log(`  ${C.cyan}→ Auto-assigned: ${id}${C.reset}`);
    } else {
      id = rawId.toUpperCase();
    }

    // Check for duplicates
    if (data.sprints.find(s => s.id.toLowerCase() === id.toLowerCase())) {
      console.error(`  ${C.red}Sprint "${id}" already exists.${C.reset}`);
      rl.close();
      return;
    }

    const title = await ask('Title');
    if (!title) { console.error('  Title is required.'); rl.close(); return; }

    const series = id.replace(/-\d+$/, '').replace(/\d+$/, '').toUpperCase();
    const priority = await ask(`Priority (${PRIORITIES.join('/')})`, 'medium');
    const status = await ask(`Status (${STATUSES.join('/')})`, 'open');
    const housesRaw = await ask('Houses (comma-separated)', '');
    const dependsRaw = await ask('Depends on (comma-separated IDs)', '');
    const notes = await ask('Notes', '');

    const today = new Date().toISOString().split('T')[0];

    const sprint = {
      id,
      title,
      series,
      status: STATUSES.includes(status) ? status : 'open',
      priority: PRIORITIES.includes(priority) ? priority : 'medium',
      houses: housesRaw ? housesRaw.split(',').map(h => h.trim().toLowerCase()).filter(Boolean) : [],
      depends: dependsRaw ? dependsRaw.split(',').map(d => d.trim().toUpperCase()).filter(Boolean) : [],
      commits: [],
      notes: notes,
      created: today,
      updated: today,
      completed: null,
    };

    data.sprints.push(sprint);
    saveData(data);

    console.log(`\n  ${C.green}✅ Created ${sprint.id}: ${sprint.title}${C.reset}\n`);
    rl.close();
  })();
}

function cmdUpdate(args, data) {
  const id = args[0];
  if (!id) {
    console.error(`  ${C.red}Usage: sprint update <ID> --field value${C.reset}`);
    process.exit(1);
  }

  const item = data.sprints.find(s => s.id.toLowerCase() === id.toLowerCase());
  if (!item) {
    console.error(`  ${C.red}Sprint "${id}" not found.${C.reset}`);
    process.exit(1);
  }

  const updates = [];
  const restArgs = args.slice(1);

  const statusVal = getArgValue(restArgs, '--status');
  if (statusVal) {
    const sv = statusVal.toLowerCase();
    if (!STATUSES.includes(sv)) {
      console.error(`  ${C.red}Invalid status: ${statusVal}. Valid: ${STATUSES.join(', ')}${C.reset}`);
      process.exit(1);
    }
    item.status = sv;
    if (sv === 'done' && !item.completed) {
      item.completed = new Date().toISOString().split('T')[0];
    }
    if (sv !== 'done') {
      item.completed = null;
    }
    updates.push(`status → ${sv}`);
  }

  const priorityVal = getArgValue(restArgs, '--priority');
  if (priorityVal) {
    const pv = priorityVal.toLowerCase();
    if (!PRIORITIES.includes(pv)) {
      console.error(`  ${C.red}Invalid priority: ${priorityVal}. Valid: ${PRIORITIES.join(', ')}${C.reset}`);
      process.exit(1);
    }
    item.priority = pv;
    updates.push(`priority → ${pv}`);
  }

  const titleVal = getArgValue(restArgs, '--title');
  if (titleVal) {
    item.title = titleVal;
    updates.push(`title → ${titleVal}`);
  }

  const notesVal = getArgValue(restArgs, '--notes');
  if (notesVal) {
    item.notes = notesVal;
    updates.push(`notes updated`);
  }

  const housesVal = getArgValue(restArgs, '--houses');
  if (housesVal) {
    item.houses = housesVal.split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
    updates.push(`houses → ${item.houses.join(', ')}`);
  }

  const dependsVal = getArgValue(restArgs, '--depends');
  if (dependsVal) {
    item.depends = dependsVal.split(',').map(d => d.trim().toUpperCase()).filter(Boolean);
    updates.push(`depends → ${item.depends.join(', ')}`);
  }

  const commitVal = getArgValue(restArgs, '--commit');
  if (commitVal) {
    if (!item.commits) item.commits = [];
    item.commits.push(commitVal);
    updates.push(`commit added: ${commitVal}`);
  }

  const seriesVal = getArgValue(restArgs, '--series');
  if (seriesVal) {
    item.series = seriesVal.toUpperCase();
    updates.push(`series → ${item.series}`);
  }

  if (updates.length === 0) {
    console.error(`  ${C.yellow}No updates provided. Use --status, --priority, --title, --notes, --houses, --depends, --commit, --series${C.reset}`);
    process.exit(1);
  }

  item.updated = new Date().toISOString().split('T')[0];
  saveData(data);

  console.log(`\n  ${C.green}✅ Updated ${item.id}:${C.reset}`);
  updates.forEach(u => console.log(`     ${C.dim}${u}${C.reset}`));
  console.log('');
}

function cmdDelete(args, data) {
  const id = args[0];
  if (!id) {
    console.error(`  ${C.red}Usage: sprint delete <ID>${C.reset}`);
    process.exit(1);
  }

  const idx = data.sprints.findIndex(s => s.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) {
    console.error(`  ${C.red}Sprint "${id}" not found.${C.reset}`);
    process.exit(1);
  }

  const item = data.sprints[idx];
  data.sprints.splice(idx, 1);
  saveData(data);

  console.log(`\n  ${C.red}🗑  Deleted ${item.id}: ${item.title}${C.reset}\n`);
}

function cmdTriage(args, data) {
  let items = data.sprints.filter(s => !isClosed(s) && s.status !== 'deferred');

  // Sort by priority rank, then blocked status (unblocked first)
  const prioRank = { critical: 0, high: 1, medium: 2, low: 3 };
  items.sort((a, b) => {
    const aBlocked = isBlocked(a, data.sprints) ? 1 : 0;
    const bBlocked = isBlocked(b, data.sprints) ? 1 : 0;
    if (aBlocked !== bBlocked) return aBlocked - bBlocked;
    const aRank = prioRank[a.priority] ?? 2;
    const bRank = prioRank[b.priority] ?? 2;
    return aRank - bRank;
  });

  console.log(`\n${C.bold}TRIAGE VIEW${C.reset} — ${items.length} actionable items\n`);

  if (items.length === 0) {
    console.log(`  ${C.green}All clear — nothing to triage.${C.reset}\n`);
    return;
  }

  items.forEach(item => {
    const blocked = isBlocked(item, data.sprints);
    const icon = blocked ? `${C.red}⛔${C.reset}` : STATUS_ICONS[item.status];
    const color = priorityColor(item.priority);
    const id = padRight(`${C.bold}${item.id}${C.reset}`, 14);
    const title = padRight(truncate(item.title, 44), 44);
    const prio = padRight(`${color}${item.priority}${C.reset}`, 18);

    let deps = '';
    if (item.depends && item.depends.length > 0) {
      deps = item.depends.map(d => {
        const dep = data.sprints.find(s => s.id === d);
        if (!dep || !isClosed(dep)) return `${C.red}${d}${C.reset}`;
        return `${C.green}${d}${C.reset}`;
      }).join(', ');
      deps = `  ← ${deps}`;
    }

    console.log(`  ${icon} ${id} ${title} ${prio}${deps}`);
  });
  console.log('');
}

function cmdDashboard(args, data) {
  const all = data.sprints;

  console.log(`\n${C.bold}SPRINT DASHBOARD${C.reset}\n`);

  // Status counts
  const statusCounts = {};
  STATUSES.forEach(s => { statusCounts[s] = 0; });
  all.forEach(item => {
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  });

  // Series counts
  const seriesCounts = {};
  all.forEach(item => {
    seriesCounts[item.series] = (seriesCounts[item.series] || 0) + 1;
  });
  const sortedSeries = Object.entries(seriesCounts).sort((a, b) => b[1] - a[1]);

  // Priority counts (open items only)
  const openItems = all.filter(s => !isClosed(s) && s.status !== 'deferred');
  const prioCounts = {};
  PRIORITIES.forEach(p => { prioCounts[p] = 0; });
  openItems.forEach(item => {
    prioCounts[item.priority] = (prioCounts[item.priority] || 0) + 1;
  });

  // Print side by side
  console.log(`  ${C.bold}Status${C.reset}                  ${C.bold}Series${C.reset}`);
  console.log(`  ${'─'.repeat(18)}      ${'─'.repeat(18)}`);

  const statusLines = STATUSES.map(s => {
    const icon = STATUS_ICONS_PLAIN[s];
    const count = String(statusCounts[s]).padStart(4);
    return `  ${icon} ${padRight(s, 13)}${count}`;
  });

  const seriesLines = sortedSeries.map(([s, count]) => {
    return `      ${padRight(s, 8)}${String(count).padStart(4)}`;
  });

  const maxLines = Math.max(statusLines.length, seriesLines.length);
  for (let i = 0; i < maxLines; i++) {
    const left = statusLines[i] || '                       ';
    const right = seriesLines[i] || '';
    console.log(`${left}${right}`);
  }

  console.log(`\n  ${C.dim}Total${C.reset}        ${C.bold}${String(all.length).padStart(4)}${C.reset}`);

  // Priority breakdown
  console.log(`\n  ${C.bold}Priority (open only)${C.reset}`);
  console.log(`  ${'─'.repeat(18)}`);
  PRIORITIES.forEach(p => {
    const color = priorityColor(p);
    const count = String(prioCounts[p]).padStart(4);
    console.log(`  ${color}${padRight(p, 13)}${C.reset}${count}`);
  });

  console.log('');
}

function cmdNext(args, data) {
  const openItems = data.sprints.filter(s =>
    !isClosed(s) && s.status !== 'deferred' && !isBlocked(s, data.sprints)
  );

  if (openItems.length === 0) {
    console.log(`\n  ${C.green}No actionable items — everything is done or blocked.${C.reset}\n`);
    return;
  }

  // Sort by priority
  const prioRank = { critical: 0, high: 1, medium: 2, low: 3 };
  openItems.sort((a, b) => {
    const aRank = prioRank[a.priority] ?? 2;
    const bRank = prioRank[b.priority] ?? 2;
    if (aRank !== bRank) return aRank - bRank;
    // Prefer in-progress over open
    if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
    if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
    return 0;
  });

  const next = openItems[0];
  const icon = STATUS_ICONS[next.status];
  const color = priorityColor(next.priority);

  console.log(`\n${C.bold}NEXT UP${C.reset}\n`);
  console.log(`  ${icon} ${C.bold}${next.id}${C.reset}  ${next.title}`);
  console.log(`     ${color}${next.priority}${C.reset} · ${next.status} · ${next.houses ? next.houses.join('/') : 'no house'}`);
  if (next.notes) {
    console.log(`     ${C.dim}${truncate(next.notes, 70)}${C.reset}`);
  }

  if (openItems.length > 1) {
    console.log(`\n  ${C.dim}${openItems.length - 1} more actionable items in queue${C.reset}`);
  }
  console.log('');
}

function cmdBlocked(args, data) {
  const blocked = data.sprints.filter(s =>
    !isClosed(s) && isBlocked(s, data.sprints)
  );

  console.log(`\n${C.bold}BLOCKED ITEMS${C.reset} — ${blocked.length} items\n`);

  if (blocked.length === 0) {
    console.log(`  ${C.green}No blocked items.${C.reset}\n`);
    return;
  }

  blocked.forEach(item => {
    const color = priorityColor(item.priority);
    const id = padRight(`${C.bold}${item.id}${C.reset}`, 14);
    const title = padRight(truncate(item.title, 44), 44);

    const deps = item.depends.map(d => {
      const dep = data.sprints.find(s => s.id === d);
      if (!dep) return `${C.red}${d} (missing)${C.reset}`;
      if (dep.status === 'done') return `${C.green}${d} ✅${C.reset}`;
      return `${C.red}${d} (${dep.status})${C.reset}`;
    }).join(', ');

    console.log(`  ⛔ ${id} ${title} ${color}${item.priority}${C.reset}`);
    console.log(`     ${C.dim}blocked by:${C.reset} ${deps}`);
  });
  console.log('');
}

function cmdSearch(args, data) {
  const term = args.join(' ').toLowerCase();
  if (!term) {
    console.error(`  ${C.red}Usage: sprint search <term>${C.reset}`);
    process.exit(1);
  }

  const results = data.sprints.filter(s => {
    const haystack = `${s.id} ${s.title} ${s.notes || ''} ${(s.houses || []).join(' ')} ${s.series}`.toLowerCase();
    return haystack.includes(term);
  });

  console.log(`\n${C.bold}SEARCH${C.reset} — "${term}" — ${results.length} results\n`);

  if (results.length === 0) {
    console.log(`  ${C.dim}No matches.${C.reset}\n`);
    return;
  }

  results.forEach(item => {
    const icon = STATUS_ICONS[item.status];
    const id = padRight(`${C.bold}${item.id}${C.reset}`, 14);
    const title = padRight(truncate(item.title, 44), 44);
    const status = item.status;
    const houses = item.houses ? item.houses.join('/') : '';

    console.log(`  ${icon} ${id} ${title} ${C.dim}${status}${C.reset}  ${C.cyan}${houses}${C.reset}`);
    if (item.notes) {
      // Highlight search term in notes
      const idx = (item.notes || '').toLowerCase().indexOf(term);
      if (idx !== -1) {
        const snippet = item.notes.slice(Math.max(0, idx - 20), idx + term.length + 40);
        console.log(`     ${C.dim}...${snippet.replace(new RegExp(term, 'gi'), m => `${C.yellow}${C.bold}${m}${C.reset}${C.dim}`)}...${C.reset}`);
      }
    }
  });
  console.log('');
}

function cmdExport(args, data) {
  const format = getArgValue(args, '--md') !== undefined ? 'md' : (args[0] === '--md' ? 'md' : null);

  // Default to markdown if --md flag present (even without value)
  const isMd = args.includes('--md') || format === 'md';

  if (!isMd) {
    console.error(`  ${C.yellow}Usage: sprint export --md${C.reset}`);
    process.exit(1);
  }

  const lines = [];
  lines.push('# Sprint Backlog Summary');
  lines.push('');
  lines.push(`*Generated: ${new Date().toISOString().split('T')[0]}*`);
  lines.push('');

  // Group by status
  const groups = {};
  data.sprints.forEach(item => {
    if (!groups[item.status]) groups[item.status] = [];
    groups[item.status].push(item);
  });

  const statusOrder = ['in-progress', 'awaiting-qc', 'open', 'partial', 'blocked', 'deferred', 'backlog', 'done'];
  statusOrder.forEach(status => {
    const items = groups[status];
    if (!items || items.length === 0) return;

    const icon = STATUS_ICONS_PLAIN[status];
    lines.push(`## ${icon} ${status.charAt(0).toUpperCase() + status.slice(1)} (${items.length})`);
    lines.push('');
    lines.push('| Sprint | Title | Priority | Houses |');
    lines.push('|--------|-------|----------|--------|');

    items.forEach(item => {
      const houses = (item.houses || []).join(', ');
      lines.push(`| **${item.id}** | ${item.title} | ${item.priority} | ${houses} |`);
    });
    lines.push('');
  });

  const output = lines.join('\n');
  console.log(output);
}

function cmdStats(args, data) {
  // Quick stats one-liner
  const total = data.sprints.length;
  const done = data.sprints.filter(s => s.status === 'done').length;
  const qc = data.sprints.filter(s => s.status === 'awaiting-qc').length;
  const open = data.sprints.filter(s => !['done', 'deferred', 'backlog', 'awaiting-qc'].includes(s.status)).length;
  const blocked = data.sprints.filter(s => !isClosed(s) && isBlocked(s, data.sprints)).length;
  console.log(`\n  ${C.bold}${total}${C.reset} total · ${C.green}${done} done${C.reset} · ${C.cyan}${qc} awaiting-qc${C.reset} · ${C.yellow}${open} open${C.reset} · ${C.red}${blocked} blocked${C.reset}\n`);
}

// --- Argument Parsing ---

function getArgValue(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  // Handle flags like --md that may not have a value
  const nextVal = args[idx + 1];
  if (!nextVal || nextVal.startsWith('--')) return '';
  return nextVal;
}

// --- Help ---

function showHelp() {
  console.log(`
${C.bold}sprint${C.reset} — Hexworth Prime Sprint Backlog Manager

${C.bold}COMMANDS${C.reset}

  ${C.cyan}list${C.reset}                         Open items grouped by priority
    --all                        Include completed items
    --series AR                  Filter by series prefix
    --house shield               Filter by house
    --priority high              Filter by priority
    --status done                Filter by status

  ${C.cyan}show${C.reset} <ID>                     Full detail panel for one item
  ${C.cyan}add${C.reset}                           Interactive create (prompted)

  ${C.cyan}update${C.reset} <ID> [--field value]   Update field(s)
    --status done                Set status
    --priority high              Set priority
    --title "..."                Set title
    --notes "..."                Set notes
    --houses "forge,shield"      Set houses
    --depends "AR-2,AR-3"        Set dependencies
    --commit "abc1234"           Add a commit SHA
    --series AR                  Set series

  ${C.cyan}delete${C.reset} <ID>                   Remove a sprint item

  ${C.cyan}triage${C.reset}                        Priority-sorted open items + deps
  ${C.cyan}dashboard${C.reset}                     Summary stats
  ${C.cyan}next${C.reset}                          Suggest next actionable item
  ${C.cyan}blocked${C.reset}                       Items with unresolved deps
  ${C.cyan}search${C.reset} <term>                 Full-text search
  ${C.cyan}stats${C.reset}                         Quick counts one-liner
  ${C.cyan}export${C.reset} --md                   Generate markdown summary

${C.bold}DATA${C.reset}

  ${C.dim}${DATA_FILE}${C.reset}
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

// Commands that need data loaded
const data = loadData();

switch (command) {
  case 'list':
  case 'ls':
    cmdList(cmdArgs, data);
    break;
  case 'show':
  case 'view':
    cmdShow(cmdArgs, data);
    break;
  case 'add':
  case 'new':
  case 'create':
    cmdAdd();
    break;
  case 'update':
  case 'set':
    cmdUpdate(cmdArgs, data);
    break;
  case 'delete':
  case 'rm':
    cmdDelete(cmdArgs, data);
    break;
  case 'triage':
    cmdTriage(cmdArgs, data);
    break;
  case 'dashboard':
  case 'dash':
    cmdDashboard(cmdArgs, data);
    break;
  case 'next':
    cmdNext(cmdArgs, data);
    break;
  case 'blocked':
    cmdBlocked(cmdArgs, data);
    break;
  case 'search':
  case 'find':
    cmdSearch(cmdArgs, data);
    break;
  case 'export':
    cmdExport(cmdArgs, data);
    break;
  case 'stats':
    cmdStats(cmdArgs, data);
    break;
  default:
    console.error(`  ${C.red}Unknown command: ${command}${C.reset}`);
    console.error(`  Run ${C.cyan}sprint help${C.reset} for usage.`);
    process.exit(1);
}
