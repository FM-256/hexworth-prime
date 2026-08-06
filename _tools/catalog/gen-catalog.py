#!/usr/bin/env python3
"""
gen-catalog.py — generate the Hexworth script catalog.

@catalog what   Walks _tools/ and emits CATALOG.md + catalog.json: every script, whether
@catalog what   anything actually invokes it, and whether it is even in git.
@catalog run    python3 _tools/catalog/gen-catalog.py          (writes _tools/CATALOG.md)
@catalog run    python3 _tools/catalog/gen-catalog.py --missing (list scripts with no header)
@catalog status TOOL

WHY THIS EXISTS
  789 scripts live under _tools/. ELEVEN of them are reachable from deploy.sh,
  post-verify.sh or package.json. The rest are invisible unless you already know their
  name, which is why the same verification script gets written again every few sessions
  instead of being found. Operator, 2026-08-06: "we should be creating a scripts catalog
  in the tools area. instead of generating new scripts everytime."

WHY IT IS GENERATED AND NOT HAND-WRITTEN
  _tools/TOOL_INVENTORY.md is the control experiment. It is hand-maintained, describes
  SEVEN systems, and its own header says "Last updated: 2026-02-27" while its last commit
  is 2026-05-19. Seven entries could not be kept current by hand; 789 has no chance.
  TOOL_INVENTORY.md is kept -- it explains WHY the big systems exist, which no generator
  can derive. This file answers WHAT EXISTS and WHETHER IT RUNS.

THE FIELDS THAT MATTER ARE DERIVED, NOT DECLARED
  A script cannot lie about whether something calls it. Wiring, tracked-ness and mtime are
  computed from the tree, so the catalog is useful on day one with zero backfill. The
  declared header only supplies what cannot be derived: intent.

HEADER CONVENTION (optional, opportunistic -- do NOT backfill 789 files)
  Anywhere in the first 40 lines, inside whatever comment syntax the language uses:
      @catalog what    one line, what it does
      @catalog run     the exact command to run it
      @catalog status  GATE | TOOL | PROBE
  Repeat a key to add lines. Status meanings:
      GATE   something invokes it automatically; breaking it breaks a gate
      TOOL   run by hand, worth keeping and finding
      PROBE  answered one question once; ARCHIVE it rather than let it rot -- we do not
             destroy, we move things somewhere they stop being mistaken for live tooling
"""
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
TOOLS = REPO / '_tools'
OUT_MD = TOOLS / 'CATALOG.md'
OUT_JSON = TOOLS / 'catalog.json'

SCRIPT_EXT = {'.js', '.py', '.sh', '.mjs', '.cjs'}

# Directories that are output, not source. Scanning them is slow and meaningless.
SKIP_DIRS = {
    'node_modules', '.git', '__pycache__', 'reports', '.cache', 'venv', '.venv',
    'dist', 'build', 'coverage', '_backups',
    # Archived scripts still EXIST -- we do not destroy -- but they are deliberately out of
    # the live tree, so counting them as live orphans would mean the orphan number never
    # falls no matter how much tidying happens, and the archive would keep re-appearing as
    # a candidate for archiving.
    '_archive',
}

# A script named in one of these is GATE-wired: it runs without anyone choosing to run it.
# Keep this list honest -- adding a path here claims that path executes things.
ENTRY_POINTS = [
    REPO / 'deploy.sh',
    REPO / 'package.json',
    TOOLS / 'deploy' / 'post-verify.sh',
    TOOLS / 'eduscan' / 'smoke' / 'deploy.sh',
]

# Files that may REFERENCE a script without executing it (docs, other tools).
REF_SCAN_EXT = {'.sh', '.js', '.py', '.json', '.md', '.mjs', '.cjs', '.yml', '.yaml'}

TAG_RE = re.compile(r'@catalog\s+(what|run|status)\b[:\s]\s*(.+?)\s*$', re.I)


def iter_scripts():
    """Every script under _tools/, skipping output and vendor directories."""
    for root, dirs, files in os.walk(TOOLS):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        for f in files:
            if Path(f).suffix in SCRIPT_EXT:
                yield Path(root) / f


def read_head(path, lines=40):
    try:
        with path.open('r', encoding='utf-8', errors='replace') as fh:
            return [next(fh) for _ in range(lines)]
    except StopIteration:
        try:
            return path.read_text(encoding='utf-8', errors='replace').splitlines(True)
        except Exception:
            return []
    except Exception:
        return []


def parse_header(path):
    """Pull @catalog tags out of the first 40 lines. Absent is normal, not an error."""
    out = {'what': [], 'run': [], 'status': ''}
    for line in read_head(path):
        m = TAG_RE.search(line)
        if not m:
            continue
        key, val = m.group(1).lower(), m.group(2).strip()
        if key == 'status':
            out['status'] = val.split()[0].upper()
        else:
            out[key].append(val)
    return out


def tracked_files():
    """Which _tools files are actually in git. _tools/ is gitignored, so most are NOT --
    an untracked script does not survive a fresh clone, which is worth seeing."""
    try:
        r = subprocess.run(['git', '-C', str(REPO), 'ls-files', '_tools'],
                           capture_output=True, text=True, timeout=60)
        return {line.strip() for line in r.stdout.splitlines() if line.strip()}
    except Exception:
        return set()


# Any token in any file that looks like a path to a script. Extracting these ONCE per
# file and comparing sets is what makes this finish in seconds: the obvious approach --
# for each of 1121 scripts, search every file for its name -- is O(scripts x corpus) and
# ran past five minutes before being killed. An exact token match is also strictly more
# precise than a substring search, which is what wrongly promoted audit.py to GATE
# because deploy.sh mentions skill-map-audit.py.
TOKEN_RE = re.compile(r'[A-Za-z0-9_.\-/]+\.(?:js|py|sh|mjs|cjs)\b')


def tokens_in(text):
    """Script-ish paths named by this file, as both full token and bare basename."""
    found = set()
    for tok in TOKEN_RE.findall(text):
        tok = tok.lstrip('./') if tok.startswith('./') else tok
        found.add(tok)
        found.add(tok.rsplit('/', 1)[-1])
    return found


def build_reference_index():
    """Read every file that could name a script, ONCE. Returns [(relpath, tokenset)].
    Doing this per-script would be 1121 full-tree scans."""
    corpus = []
    roots = [TOOLS, REPO / '_docs', REPO / 'functions']
    for p in REPO.iterdir():
        if p.is_file() and p.suffix in REF_SCAN_EXT:
            corpus.append(p)
    for root_dir in roots:
        if not root_dir.exists():
            continue
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
            for f in files:
                if Path(f).suffix in REF_SCAN_EXT:
                    corpus.append(Path(root) / f)
    # A CATALOG THAT LISTS EVERY SCRIPT MAKES EVERY SCRIPT LOOK CALLED. On the first run
    # after CATALOG.md/catalog.json existed, orphans went 721 -> 0 and every script claimed
    # a caller: itself, via this catalog. The generator was measuring its own output.
    # Caught because "0 orphans" is not a result, it is a smell.
    SELF = {OUT_MD.resolve(), OUT_JSON.resolve(), Path(__file__).resolve()}

    out = []
    for p in corpus:
        try:
            if p.resolve() in SELF:
                continue
            if p.stat().st_size > 4_000_000:      # giant report dumps, not references
                continue
            out.append((str(p.relative_to(REPO)),
                        tokens_in(p.read_text(encoding='utf-8', errors='replace'))))
        except Exception:
            continue
    return out


def main():
    want_missing = '--missing' in sys.argv

    scripts = sorted(iter_scripts())
    tracked = tracked_files()
    corpus = build_reference_index()

    # Basenames that appear more than once cannot be matched on basename alone without
    # inventing references. Those fall back to full-relpath matching only.
    from collections import Counter
    name_counts = Counter(p.name for p in scripts)

    # Entry points are tokenised the same way the corpus is, so both sides of every
    # comparison are sets and no raw-string substring test survives anywhere.
    entry_tokens = {}
    for ep in ENTRY_POINTS:
        try:
            entry_tokens[str(ep.relative_to(REPO))] = tokens_in(
                ep.read_text(encoding='utf-8', errors='replace'))
        except Exception:
            pass

    rows = []
    for p in scripts:
        rel = str(p.relative_to(REPO))
        name = p.name
        unique_name = name_counts[name] == 1

        # EXACT TOKEN MATCH, never a substring. A substring test reported
        # _tools/nexus/adapters/audit.js and hexclass/.../audit.py as GATE-wired, because
        # deploy.sh mentions skill-map-audit.js/py and those END with the shorter name.
        # Two false gates out of thirteen -- caught by checking the detector against cases
        # whose answer I already knew, not by reading the totals.
        # Both sides are token SETS now (see tokens_in), so this is a dict lookup.
        def names_it(toks):
            return rel in toks or (unique_name and name in toks)

        gated_by = [ep for ep, toks in entry_tokens.items() if names_it(toks)]

        # A MENTION IS NOT AN INVOCATION. Splitting these is the whole value of the
        # column: presenter-view-test.js came back "referenced" purely because SITREP.md
        # talks about it, which is exactly the false comfort this catalog exists to remove.
        code_refs, doc_refs = [], []
        for cp, toks in corpus:
            if cp == rel or cp in entry_tokens:
                continue                      # itself, or already counted as a gate
            if not names_it(toks):
                continue
            (doc_refs if cp.endswith('.md') else code_refs).append(cp)

        hdr = parse_header(p)
        if gated_by:
            wiring = 'GATE'
        elif code_refs:
            wiring = 'CALLED'
        elif doc_refs:
            wiring = 'DOCS-ONLY'
        else:
            wiring = 'ORPHAN'
        referenced_by = code_refs + doc_refs

        st = p.stat()
        rows.append({
            'path': rel,
            'name': name,
            'dir': str(p.parent.relative_to(REPO)),
            'ext': p.suffix,
            'bytes': st.st_size,
            'mtime': time.strftime('%Y-%m-%d', time.localtime(st.st_mtime)),
            'tracked': rel in tracked,
            'wiring': wiring,
            'gatedBy': gated_by,
            'refCount': len(referenced_by),
            'codeRefs': len(code_refs),
            'docRefs': len(doc_refs),
            'refSample': referenced_by[:3],
            'what': hdr['what'],
            'run': hdr['run'],
            'declaredStatus': hdr['status'],
            'hasHeader': bool(hdr['what'] or hdr['run'] or hdr['status']),
            # Local convention: smoke/_*.js are one-shot debugging probes.
            'looksLikeProbe': name.startswith('_'),
        })

    if want_missing:
        missing = [r for r in rows if not r['hasHeader']]
        print(f"{len(missing)} of {len(rows)} scripts have no @catalog header\n")
        for r in sorted(missing, key=lambda r: (r['wiring'] != 'GATE', r['path'])):
            print(f"  [{r['wiring']:<10}] {r['path']}")
        return 0

    OUT_JSON.write_text(json.dumps({'generated': time.strftime('%Y-%m-%d %H:%M'),
                                    'total': len(rows), 'scripts': rows}, indent=1))
    OUT_MD.write_text(render_md(rows))
    c = lambda w: sum(1 for r in rows if r['wiring'] == w)
    h = sum(1 for r in rows if r['hasHeader'])
    print(f"{len(rows)} scripts: {c('GATE')} GATE, {c('CALLED')} CALLED, "
          f"{c('DOCS-ONLY')} DOCS-ONLY, {c('ORPHAN')} ORPHAN, {h} with a header")
    print(f"wrote {OUT_MD.relative_to(REPO)} and {OUT_JSON.relative_to(REPO)}")
    return 0


def render_md(rows):
    gates = [r for r in rows if r['wiring'] == 'GATE']
    orphans = [r for r in rows if r['wiring'] == 'ORPHAN']
    called = [r for r in rows if r['wiring'] == 'CALLED']
    docsonly = [r for r in rows if r['wiring'] == 'DOCS-ONLY']
    probes = [r for r in orphans if r['looksLikeProbe']]
    untracked = [r for r in rows if not r['tracked']]

    L = []
    L.append('# Hexworth Script Catalog')
    L.append('')
    L.append('> GENERATED by `_tools/catalog/gen-catalog.py`. Do not hand-edit — rerun it.')
    L.append('> For WHY the big systems exist, read `_tools/TOOL_INVENTORY.md`; this file')
    L.append('> answers what exists and whether anything actually runs it.')
    L.append('')
    L.append(f"**Generated:** {time.strftime('%Y-%m-%d %H:%M')} · "
             f"**{len(rows)} scripts** · {len(gates)} wired into a gate · "
             f"{len(called)} called by other code · {len(docsonly)} only mentioned in docs · "
             f"{len(orphans)} referenced by nothing · {len(untracked)} not in git")
    L.append('')
    L.append('## Read this before writing a new script')
    L.append('')
    L.append('Search here first. `python3 _tools/search/search-all.py "<what you need>"`')
    L.append('covers this file. If something close exists, extend it; if nothing does,')
    L.append('write one and give it a header so the next person finds it:')
    L.append('')
    L.append('```')
    L.append('@catalog what    one line, what it does')
    L.append('@catalog run     the exact command')
    L.append('@catalog status  GATE | TOOL | PROBE')
    L.append('```')
    L.append('')
    L.append('`GATE` = something invokes it automatically. `TOOL` = run by hand, worth')
    L.append('keeping. `PROBE` = answered one question once; **archive** it rather than let it')
    L.append('rot. We do not destroy — moving it out of the live tree is the whole remedy.')
    L.append('')
    L.append('The **Wiring** column is derived and cannot be fibbed:')
    L.append('')
    L.append('| | Meaning |')
    L.append('|---|---|')
    L.append('| `GATE` | named by deploy.sh, post-verify.sh, the smoke wrapper, or package.json |')
    L.append('| `CALLED` | named by other CODE (`.sh` `.js` `.py` `.json`) — something can run it |')
    L.append('| `DOCS-ONLY` | mentioned only in markdown. A doc talking about a script is not a caller |')
    L.append('| `ORPHAN` | nothing names it anywhere |')
    L.append('')

    L.append('## Wired into a gate')
    L.append('')
    L.append('These run without anyone choosing to run them. Breaking one breaks a deploy.')
    L.append('')
    L.append('| Script | Invoked by | In git | What |')
    L.append('|---|---|---|---|')
    for r in sorted(gates, key=lambda r: r['path']):
        what = ' '.join(r['what']) if r['what'] else '_(no header)_'
        L.append(f"| `{r['path']}` | {', '.join(f'`{g}`' for g in r['gatedBy'])} | "
                 f"{'yes' if r['tracked'] else '**NO**'} | {what} |")
    L.append('')

    L.append('## Everything else, by directory')
    L.append('')
    by_dir = {}
    for r in rows:
        if r['wiring'] == 'GATE':
            continue
        by_dir.setdefault(r['dir'], []).append(r)
    for d in sorted(by_dir):
        rs = sorted(by_dir[d], key=lambda r: r['name'])
        n_orph = sum(1 for r in rs if r['wiring'] == 'ORPHAN')
        L.append(f"### `{d}` — {len(rs)} scripts, {n_orph} referenced by nothing")
        L.append('')
        L.append('| Script | Wiring | Called by | Modified | In git | What |')
        L.append('|---|---|---|---|---|---|')
        for r in rs:
            what = ' '.join(r['what']) if r['what'] else ''
            if not what and r['looksLikeProbe']:
                what = '_one-shot probe (leading underscore)_'
            L.append(f"| `{r['name']}` | {r['wiring']} | {r['codeRefs']} | {r['mtime']} | "
                     f"{'yes' if r['tracked'] else 'no'} | {what} |")
        L.append('')

    L.append('## Archive candidates')
    L.append('')
    L.append(f'{len(probes)} scripts are referenced by nothing AND follow the leading-underscore')
    L.append('one-shot convention. That is a strong signal, not a verdict.')
    L.append('')
    L.append('**These get ARCHIVED, never deleted.** Move them out of the live tree so they stop')
    L.append('being mistaken for working tooling; the files keep existing. Read one before moving')
    L.append('it — a leading underscore is a naming convention, not evidence that a script is dead.')
    L.append('')
    for r in sorted(probes, key=lambda r: r['path'])[:60]:
        L.append(f"- `{r['path']}` · last modified {r['mtime']}")
    if len(probes) > 60:
        L.append(f"- _...and {len(probes) - 60} more_")
    L.append('')
    return '\n'.join(L) + '\n'


if __name__ == '__main__':
    sys.exit(main())
