/*
 * Shared harness preflight: refuse to start on a dirty tenant, and say what is in the way.
 *
 * WHY THIS EXISTS. On 2026-08-02 the cinder gate had been unrunnable since Jul 31 and the error
 * told you nothing useful: "More than one volume exists with the name 'lab-vol'". Two separate
 * blockers were in play, and only one of them is about names:
 *
 *   1. QUOTA -- the pool caps `--instances 1` (provision-pool.sh:52), confirmed live as
 *      maxTotalInstances=1 / totalInstancesUsed=1. ONE leftover server exhausts it, so NO
 *      harness can create its own server. A sweep the same day found a stranded server in
 *      EVERY ONE of the 25 bound slots (BUG-092), which makes this the universal blocker --
 *      not a cinder quirk.
 *   2. NAME AMBIGUITY -- harnesses resolve resources by NAME and OpenStack permits duplicates,
 *      so a single leftover makes every later `show <name>` ambiguous. It kills the run at the
 *      first step, BEFORE any cleanup, so the debris blocks the code that would clear it.
 *
 * The quota check is generic and applies to every harness. The name check is per-harness,
 * because the names genuinely differ (cinder: lab-vol/cheat-srv; rescue: orphan-vol; wall:
 * wall-vol) -- which is exactly why this takes them as a parameter instead of hardcoding a list.
 *
 * DELIBERATELY DOES NOT DELETE ANYTHING. Deleting cloud resources is not a harness's call; it
 * is pending an operator decision (BUG-091, BUG-092). This only reports.
 */

/**
 * @param {function} dex   run a command inside the session container, returns stdout
 * @param {string}   slot  pool slot name, for the message
 * @param {string[]} names resource names this harness creates and would collide with
 * @returns {string[]} blockers, empty when the tenant is clean
 */
function findBlockers(dex, slot, names) {
  const blockers = [];

  // 1. QUOTA -- the universal one. Checked FIRST because it blocks every harness regardless
  //    of naming, and because a used-up instance quota is the more actionable report.
  try {
    const lim = dex('openstack limits show --absolute -f value -c Name -c Value').trim();
    const get = (k) => {
      const row = lim.split('\n').map((l) => l.trim().split(/\s+/))
        .find((p) => p[0] === k);
      return row ? Number(row[1]) : null;
    };
    const max = get('maxTotalInstances');
    const used = get('totalInstancesUsed');
    if (max !== null && used !== null && used >= max) {
      blockers.push(`instance quota exhausted: ${used}/${max} in use before this run started`);
    }
  } catch (e) {
    // A limits query that fails should not mask the name checks below.
    blockers.push(`could not read instance quota: ${String(e.message || e).split('\n')[0]}`);
  }

  // 2. NAME COLLISIONS -- per-harness. Exact match only: a substring test would wrongly flag
  //    `lab-vol-backup`, which is somebody else's resource.
  const scan = (cmd, kind) => {
    let out = '';
    try { out = dex(cmd).trim(); } catch (e) { return; }
    out.split('\n').filter(Boolean).forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const id = parts[0];
      const name = parts.slice(1).join(' ');
      if (names.indexOf(name) !== -1) blockers.push(`${kind} ${id} (${name})`);
    });
  };
  scan('openstack volume list -f value -c ID -c Name', 'volume');
  scan('openstack server list -f value -c ID -c Name', 'server');

  return blockers;
}

/** Print the blockers in an actionable form. Caller decides whether to abort. */
function report(slot, blockers) {
  console.error(`DIRTY TENANT on ${slot} -- this run cannot start. Leftovers from an earlier run:`);
  blockers.forEach((b) => console.error(`    ${b}`));
  console.error('  Delete these BY ID (names are ambiguous, so name-based deletion is unsafe).');
  console.error('  Servers must go first: they hold volume attachments and the 1-instance quota.');
}

module.exports = { findBlockers, report };
