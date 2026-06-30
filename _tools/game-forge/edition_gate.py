#!/usr/bin/env python3
"""Deterministic parity + additive-diff gate for a curated edition pair.

Run this BEFORE Chris on any new edition. It is the structural backstop Nancy
required: it cannot rubber-stamp. Two independent checks:

  A) ADDITIVE Ed1: compared against its git HEAD version, the canonical Ed1 file
     may differ ONLY by added `objective` keys on clues/questions. Any other field
     change (clue text, response, value, category order, theme) FAILS. This protects
     the live exam set from silent corruption during tagging.

  B) Ed2 PARITY: same structure as Ed1 (categories+values+count for jeopardy;
     item count for kahoot/wheel/fifth), objective parity by position, every item
     carries the required non-empty fields, and the correct answer is present/valid.

Usage:
  edition_gate.py <type> <course> <slug>      e.g. edition_gate.py jeopardy aplus practice-b
Exit 0 = PASS, non-zero = FAIL with reasons.
"""
import json, sys, subprocess, os

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = os.path.join(REPO, '_app', '_games-lab', 'data')

def git_head_json(relpath):
    """Return the parsed JSON of relpath at git HEAD, or None if not tracked yet."""
    try:
        out = subprocess.check_output(['git', '-C', REPO, 'show', f'HEAD:{relpath}'],
                                      stderr=subprocess.DEVNULL)
        return json.loads(out)
    except Exception:
        return None

def items_of(typ, doc):
    """Yield (positionKey, itemDict) pairs in canonical order for a given game type."""
    if typ == 'jeopardy':
        for cat in doc['categories']:
            for cl in cat['clues']:
                yield (cat['name'], int(cl['value'])), cl
    elif typ == 'kahoot':
        for i, q in enumerate(doc['questions']):
            yield ('q', i), q
    elif typ == 'wheel':
        seq = doc.get('puzzles', doc.get('rounds', []))
        for i, p in enumerate(seq):
            yield ('p', i), p
    elif typ == 'fifth':
        seq = doc.get('questions', doc.get('ladder', []))
        for i, q in enumerate(seq):
            yield ('q', i), q
    else:
        raise SystemExit(f"unknown type {typ}")

def strip_objective(obj):
    """Deep copy with every `objective` key removed, for additive-diff comparison."""
    if isinstance(obj, dict):
        return {k: strip_objective(v) for k, v in obj.items() if k != 'objective'}
    if isinstance(obj, list):
        return [strip_objective(v) for v in obj]
    return obj

def check_additive(typ, course, ed1_override=None):
    """Check A: the tagged Ed1 differs from its baseline only by added `objective` keys.

    Live mode (no override): baseline is git HEAD of the canonical file.
    Staged mode (ed1_override set): baseline is the CURRENT live canonical file, so the
    check proves the staged tagged-Ed1 only added objectives to what's live right now."""
    rel = f'_app/_games-lab/data/{typ}/{course}.json'
    live = os.path.join(REPO, rel)
    errs = []
    if ed1_override:
        cur = json.load(open(ed1_override))
        base = json.load(open(live))            # baseline = current live Ed1
    else:
        cur = json.load(open(live))
        base = git_head_json(rel)               # baseline = git HEAD
        if base is None:
            return [f"(note) {rel} not in git HEAD yet -- additive check skipped (new file)"]
    if strip_objective(cur) != strip_objective(base):
        errs.append(f"Ed1 changed MORE than additive `objective` keys vs baseline "
                    f"(some non-objective field was modified)")
    # every item must now carry a non-empty objective
    for key, it in items_of(typ, cur):
        if not str(it.get('objective', '')).strip():
            errs.append(f"Ed1 item {key} missing `objective` tag")
    return errs

def required_fields(typ):
    """Return the list of required non-empty fields each Ed2 item must carry, per game type."""
    return {
        'jeopardy': ['clue', 'response', 'explain', 'objective'],
        'kahoot':   ['q', 'options', 'answer', 'explain', 'objective'],
        'wheel':    ['phrase', 'category', 'hint', 'explain', 'objective'],
        'fifth':    ['q', 'options', 'answer', 'explain', 'objective'],
    }[typ]

def check_parity(typ, course, slug, ed1_override=None, ed2_override=None):
    """Check B: Ed2 structural parity with Ed1 + required fields + valid answers.

    Overrides let the gate read a STAGED Ed1/Ed2 pair instead of the live data dir."""
    d = os.path.join(DATA, typ)
    ed1 = json.load(open(ed1_override or os.path.join(d, f'{course}.json')))
    ed2p = ed2_override or os.path.join(d, f'{course}.{slug}.json')
    if not os.path.exists(ed2p):
        return [f"Ed2 file missing: {ed2p}"]
    ed2 = json.load(open(ed2p))
    errs = []
    k1 = [k for k, _ in items_of(typ, ed1)]
    k2 = [k for k, _ in items_of(typ, ed2)]
    if k1 != k2:
        errs.append(f"STRUCTURE mismatch: Ed1 has {len(k1)} positions, Ed2 has {len(k2)} "
                    f"(or category/value/order differs). Ed1={k1[:6]}... Ed2={k2[:6]}...")
        return errs  # can't do per-position checks if structure differs
    m1 = dict(items_of(typ, ed1)); m2 = dict(items_of(typ, ed2))
    req = required_fields(typ)
    for key in k1:
        a, b = m1[key], m2[key]
        # objective parity by position
        if a.get('objective') != b.get('objective'):
            errs.append(f"{key}: objective mismatch Ed1={a.get('objective')!r} Ed2={b.get('objective')!r}")
        # required non-empty fields on Ed2
        for f in req:
            v = b.get(f)
            if v is None or (isinstance(v, str) and not v.strip()) or (isinstance(v, list) and not v):
                errs.append(f"{key}: Ed2 missing/empty required field '{f}'")
        # answer validity for option-based types
        if typ in ('kahoot', 'fifth') and isinstance(b.get('options'), list):
            ans = b.get('answer')
            if not isinstance(ans, int) or ans < 0 or ans >= len(b['options']):
                errs.append(f"{key}: Ed2 answer index {ans!r} out of range for {len(b['options'])} options")
        # jeopardy response should be a non-empty 'What is..'-style string (soft: just non-empty checked above)
    return errs

def check_orphans():
    """Deploy-safety audit: every edition file in live data/ must be registered in
    editions.json. An orphan (`<course>.<slug>.json` with no manifest entry) is un-surfaced
    yet URL-reachable by the engine -- exactly the un-QC'd-content leak we forbid. Returns
    a list of orphan descriptions (empty = clean)."""
    manifest = json.load(open(os.path.join(DATA, 'editions.json'))) if os.path.exists(os.path.join(DATA, 'editions.json')) else {}
    orphans = []
    for typ in ('jeopardy', 'kahoot', 'wheel', 'fifth'):
        d = os.path.join(DATA, typ)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if not fn.endswith('.json'):
                continue
            stem = fn[:-5]
            if '.' not in stem:
                continue  # canonical game, not an edition
            course, slug = stem.split('.', 1)
            ids = [e.get('id') for e in (manifest.get(typ, {}).get(course) or [])]
            if slug not in ids:
                orphans.append(f"{typ}/{fn} (slug '{slug}' not in editions.json[{typ}][{course}])")
    return orphans

def main():
    """Run checks A and B, print PASS/FAIL with reasons.

    Optional `--ed1 <path> --ed2 <path>` gate a STAGED pair (additive vs current live).
    `--orphans` runs the deploy-safety audit (unregistered edition files) instead."""
    argv = sys.argv[1:]
    if '--orphans' in argv:
        orphans = check_orphans()
        if orphans:
            print(f"ORPHAN EDITIONS ({len(orphans)}) -- live edition files missing from editions.json:")
            for o in orphans:
                print("  - " + o)
            print("Remove the file OR register it (promote) before deploy.")
            sys.exit(1)
        print("ORPHAN CHECK PASS (every live edition file is registered in editions.json)")
        sys.exit(0)
    ed1_override = ed2_override = None
    if '--ed1' in argv:
        i = argv.index('--ed1'); ed1_override = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    if '--ed2' in argv:
        i = argv.index('--ed2'); ed2_override = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    if len(argv) != 3:
        sys.exit("usage: edition_gate.py <type> <course> <slug> [--ed1 <path> --ed2 <path>]")
    typ, course, slug = argv
    errs = []
    notes = []
    a = check_additive(typ, course, ed1_override)
    for e in a:
        (notes if e.startswith('(note)') else errs).append(e)
    errs += check_parity(typ, course, slug, ed1_override, ed2_override)
    for n in notes:
        print("  " + n)
    if errs:
        print(f"\nGATE FAIL ({typ}/{course}.{slug}): {len(errs)} issue(s)")
        for e in errs:
            print("  - " + e)
        sys.exit(1)
    print(f"GATE PASS ({typ}/{course}.{slug})")

if __name__ == '__main__':
    main()
