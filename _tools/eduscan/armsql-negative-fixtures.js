#!/usr/bin/env node
'use strict';
// PERMANENT NEGATIVE FIXTURES for BUG-078 class B.
//
// Every line below completed a module and fired the instructor-visible gradebook write AFTER I had
// declared class B "closed" on all seven modules. Found by Chris on 2026-08-01 with a third
// adversary, after TWO of my harnesses returned zero. They are committed here so the claim is
// re-runnable rather than re-asserted -- which is precisely what my two zeros were.
//
// Why my harnesses could not find these, both structural:
//   - the corruption harness only mutates the modules' OWN commands and preserves keywords, table
//     names, aliases and CTE names, so by construction it is the weaker attacker
//   - the free-form harness had NO entries at all for 03, 05 or 09 -- three of the seven modules it
//     was cited as clearing
//
// Run: node armsql-negative-fixtures.js     (exit 1 if any module still completes)
const puppeteer = require(require('path').resolve(__dirname, '../../node_modules/puppeteer'));
const BASE = process.env.BASE || 'http://127.0.0.1:8901';

const CASES = [
  ['arm-sql-02-select', 'statement-level narrowing carries every chip', [
    "SELECT *, zz1 FROM users WHERE user_id < 3 ORDER BY username;",
    "SELECT DISTINCT zz1, zz2, username FROM users;"]],
  ['arm-sql-03-filtering', 'one real predicate authorises four fake operators', [
    "SELECT * FROM users WHERE user_id < 3 AND zz1 IS NULL AND zz2 LIKE '%' AND role IN ('admin','analyst','security','manager','user') AND user_id BETWEEN 1 AND 999;"]],
  ['arm-sql-04-joins', 'ON <col> = <same col>, still a ONE-LINE full completion', [
    "SELECT * FROM users u INNER JOIN login_logs l ON u.user_id = u.user_id LEFT JOIN permissions p ON u.user_id = u.user_id;"]],
  ['arm-sql-05-aggregation', 'meaningful() is a row-level some(), so one real cell covers three fake aggregates', [
    "SELECT COUNT(*), SUM(zz1), MIN(zz2), MAX(zz3) FROM login_logs;"]],
  ['arm-sql-06-subqueries', 'zz1 AS zz1 self-authorises through namesRealColumns', [
    "SELECT zz1 AS zz1 FROM users WHERE zz2 AS zz2 IN (SELECT zz3 AS zz3 FROM users);",
    "SELECT zz1 AS zz1 FROM users WHERE EXISTS (SELECT zz1 AS zz1 FROM users);",
    "WITH zz AS (SELECT zz1 AS zz1 FROM users) SELECT zz1 AS zz1 FROM zz;",
    "SELECT zz1 AS zz1 FROM users WHERE zz2 AS zz2 > (SELECT zz3 AS zz3 FROM users);"]],
  ['arm-sql-09-security', 'same alias bypass; every returned cell NULL', [
    "SELECT zz1 AS zz1 FROM users WHERE username = '' OR '1'='1' --",
    "SELECT zz1 AS zz1 FROM users UNION SELECT zz2 AS zz2 FROM users;",
    "SELECT zz1 AS zz1 FROM users WHERE username = ?;",
    "GRANT SELECT ON users TO 'webapp'@'localhost';",
    "REVOKE DELETE ON users FROM 'webapp'@'localhost';"]],
  ['arm-sql-10-practical', 'aggregate over a column that does not exist', [
    "SELECT SUM(zz4) AS zz4 FROM network_logs ORDER BY timestamp, ip_address;",
    "SELECT SUM(zz4) AS zz4, COUNT(*) FROM login_logs GROUP BY status;",
    "SELECT SUM(zz4) AS zz4 FROM permissions p INNER JOIN users u ON u.user_id = p.user_id;",
    "SELECT SUM(zz4) AS zz4 FROM network_logs;",
    "WITH zz AS (SELECT SUM(zz4) AS zz4 FROM network_logs), yy AS (SELECT 1 AS zz5) SELECT zz4 FROM zz;"]],
];

(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  let still = 0;
  for (const [mod, why, cmds] of CASES) {
    const p = await b.newPage();
    await p.setCacheEnabled(false);
    // Fresh page and cleared storage per case: completion is sticky, and a shared page latches an
    // early pass so every later case reads clean.
    await p.evaluateOnNewDocument(() => { try { localStorage.clear(); localStorage.setItem('hexworth_house', 'code'); } catch (e) {} });
    await p.goto(BASE + '/houses/code/armory/sql/' + mod + '.module.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 900));
    const r = await p.evaluate(async (L) => {
      const rec = { wrote: false };
      if (window.ModuleProgress && ModuleProgress.complete) {
        const o = ModuleProgress.complete;
        ModuleProgress.complete = function () { rec.wrote = true; return o.apply(this, arguments); };
      }
      const inp = document.querySelector('#terminal input') || document.querySelector('.terminal-input');
      if (!inp) return { noInput: true };
      for (const c of L) {
        inp.focus(); inp.value = c;
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        await new Promise(r => setTimeout(r, 340));
      }
      return { wrote: rec.wrote,
               chips: document.querySelectorAll('.task-chip.completed').length,
               total: document.querySelectorAll('.task-chip').length };
    }, cmds);
    await p.close();
    if (r.noInput) { console.log('  ??    ' + mod + '  no terminal input -- harness cannot judge'); still++; continue; }
    const full = r.wrote || (r.total && r.chips === r.total);
    if (full) still++;
    console.log('  ' + (full ? 'OPEN ' : 'closed') + ' ' + mod.padEnd(24) +
                'chips ' + r.chips + '/' + r.total + '  write: ' + r.wrote + '   ' + why);
  }
  console.log('\n  ' + still + ' of ' + CASES.length + ' module(s) still completable on meaningless input');
  console.log('  These are REGRESSION fixtures. Any of them going OPEN again means class B reopened.');
  process.exit(still ? 1 : 0);
})();
