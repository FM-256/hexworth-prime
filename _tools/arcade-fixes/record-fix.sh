#!/bin/bash
# record-fix.sh — record a shipped, gated arcade content-quality fix in the fixes ledger
# and refresh the Arcade Fixes cockpit's content dimension (fast: no headless run).
#
# Call this in the per-game ship sequence, AFTER record-chris-pass.sh + a successful deploy,
# so the cockpit (_app/admin/console.html -> _app/arcade-health.json) reflects the fix.
# Idempotent: re-running for the same href replaces that ledger entry (no duplicates).
#
# Usage: _tools/arcade-fixes/record-fix.sh <href> <title> <commit> <summary> [gate]
#   href    games.html-relative path, e.g. houses/shield/games/shield-threat-runner.applet.html
#   title   display title, e.g. "Threat Runner"
#   commit  shipping commit sha (defaults to HEAD if literal "HEAD")
#   summary one-line what-was-fixed
#   gate    review gates passed (default "nancy+chris")
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LEDGER="$ROOT/_tools/arcade-fixes/fixes-ledger.json"

HREF="${1:-}"; TITLE="${2:-}"; COMMIT="${3:-}"; SUMMARY="${4:-}"; GATE="${5:-nancy+chris}"
if [ -z "$HREF" ] || [ -z "$TITLE" ] || [ -z "$COMMIT" ] || [ -z "$SUMMARY" ]; then
    echo "usage: $0 <href> <title> <commit> <summary> [gate]" >&2
    exit 1
fi
if [ "$COMMIT" = "HEAD" ]; then COMMIT="$(git -C "$ROOT" rev-parse --short HEAD)"; fi
DATE="$(date -u +%Y-%m-%d)"

# Append/replace the ledger entry idempotently (by href), then re-merge content into the snapshot.
LEDGER="$LEDGER" HREF="$HREF" TITLE="$TITLE" COMMIT="$COMMIT" SUMMARY="$SUMMARY" GATE="$GATE" DATE="$DATE" node - <<'NODE'
const fs = require('fs');
const p = process.env.LEDGER;
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
d.fixes = (d.fixes || []).filter((f) => f.href !== process.env.HREF); // drop any prior entry for this href
d.fixes.push({ href: process.env.HREF, title: process.env.TITLE, commit: process.env.COMMIT, date: process.env.DATE, summary: process.env.SUMMARY, gate: process.env.GATE, dimension: 'content-quality' });
const tmp = p + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(d, null, 2) + '\n');
fs.renameSync(tmp, p);
console.log('ledger: recorded ' + process.env.TITLE + ' (' + process.env.HREF + ')');
NODE

node "$ROOT/_tools/arcade-fixes/arcade-audit.mjs" --content-only

echo "Arcade Fixes cockpit refreshed. Redeploy _app/arcade-health.json to surface it live."
