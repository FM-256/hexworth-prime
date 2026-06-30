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

def check_additive(typ, course):
    """Check A: Ed1 differs from git HEAD only by added `objective` keys."""
    rel = f'_app/_games-lab/data/{typ}/{course}.json'
    cur = json.load(open(os.path.join(REPO, rel)))
    head = git_head_json(rel)
    errs = []
    if head is None:
        return [f"(note) {rel} not in git HEAD yet -- additive check skipped (new file)"]
    if strip_objective(cur) != strip_objective(head):
        errs.append(f"Ed1 {rel} changed MORE than additive `objective` keys vs git HEAD "
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

def check_parity(typ, course, slug):
    """Check B: Ed2 structural parity with Ed1 + required fields + valid answers."""
    d = os.path.join(DATA, typ)
    ed1 = json.load(open(os.path.join(d, f'{course}.json')))
    ed2p = os.path.join(d, f'{course}.{slug}.json')
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

def main():
    """Run checks A and B, print PASS/FAIL with reasons."""
    if len(sys.argv) != 4:
        sys.exit("usage: edition_gate.py <type> <course> <slug>")
    typ, course, slug = sys.argv[1:4]
    errs = []
    notes = []
    a = check_additive(typ, course)
    for e in a:
        (notes if e.startswith('(note)') else errs).append(e)
    errs += check_parity(typ, course, slug)
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
