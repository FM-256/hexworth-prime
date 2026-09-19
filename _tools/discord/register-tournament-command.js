#!/usr/bin/env node
/**
 * register-tournament-command.js
 *
 * @catalog what   Registers the /tournament slash command with Discord, ADDITIVELY, and lists the
 *                 existing commands first so nothing is replaced by accident.
 * @catalog run    node _tools/discord/register-tournament-command.js --list
 *                 node _tools/discord/register-tournament-command.js --register
 * @catalog status TOOL
 *
 * WHY THIS SCRIPT EXISTS AT ALL. The bot already answers /challenge, /help, /join, /optin,
 * /profile, /standings, /streak and /trivia, but there is NO registration script anywhere in this
 * repo: those were registered out of band. So the handler for a new command can be deployed and
 * still be unreachable, because Discord will not surface a command it has not been told about.
 *
 * ***  THE TRAP, READ BEFORE CHANGING THIS  ***
 * Discord's PUT /applications/{app}/commands REPLACES THE ENTIRE COMMAND LIST. Using PUT with a
 * single command would DELETE the other eight, silently, in one call. This script uses POST, which
 * creates or updates ONE command and leaves the rest alone. Do not "simplify" it to PUT.
 *
 * It is deliberately NOT run automatically: it changes an outward-facing Discord application that
 * real students use, and it needs the bot token. An operator runs it.
 */
'use strict';
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const p = path.join(__dirname, '..', '..', 'functions', '.env');
    if (!fs.existsSync(p)) { console.error(`no ${p}; cannot read the bot credentials`); process.exit(1); }
    const out = {};
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        const m = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
        if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
    return out;
}

const COMMAND = {
    name: 'tournament',
    description: 'Show open Hexworth CTF tournaments, how to join, and what it earns you',
    type: 1,
};

(async () => {
    const env = loadEnv();
    const APP = env.DISCORD_APP_ID;
    const TOKEN = env.DISCORD_BOT_TOKEN;
    if (!APP || !TOKEN) { console.error('DISCORD_APP_ID or DISCORD_BOT_TOKEN missing from functions/.env'); process.exit(1); }
    const H = { Authorization: 'Bot ' + TOKEN, 'Content-Type': 'application/json' };
    const base = `https://discord.com/api/v10/applications/${APP}/commands`;

    const mode = process.argv.includes('--register') ? 'register' : 'list';

    const cur = await fetch(base, { headers: H });
    if (!cur.ok) { console.error(`could not list commands: HTTP ${cur.status} ${await cur.text()}`); process.exit(1); }
    const existing = await cur.json();
    console.log(`existing commands (${existing.length}):`);
    existing.forEach(c => console.log(`  /${c.name}  ${c.description || ''}`.slice(0, 100)));

    if (mode === 'list') {
        const has = existing.some(c => c.name === COMMAND.name);
        console.log(`\n/${COMMAND.name} is ${has ? 'ALREADY registered' : 'NOT registered'}`);
        console.log('re-run with --register to add it. POST is additive: the commands above are not touched.');
        return;
    }

    const r = await fetch(base, { method: 'POST', headers: H, body: JSON.stringify(COMMAND) });
    const body = await r.text();
    if (!r.ok) { console.error(`\nregistration FAILED: HTTP ${r.status} ${body.slice(0, 300)}`); process.exit(1); }
    console.log(`\nregistered /${COMMAND.name}. HTTP ${r.status}`);

    const after = await fetch(base, { headers: H });
    const list = await after.json();
    console.log(`commands now (${list.length}): ${list.map(c => '/' + c.name).join(' ')}`);
    if (list.length < existing.length) {
        console.error('WARNING: the command count went DOWN. Something replaced rather than added.');
        process.exit(1);
    }
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
