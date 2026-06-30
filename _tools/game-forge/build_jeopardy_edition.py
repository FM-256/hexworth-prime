#!/usr/bin/env python3
"""Build a curated Jeopardy edition (generic, any course).

Two outputs from one canonical Ed1 file:
  1) Tag Ed1 (data/jeopardy/<course>.json) clues with an additive `objective` key.
     Nothing else in Ed1 changes -- enforced later by edition_gate.py's additive diff.
  2) Author Ed2 (data/jeopardy/<course>.<slug>.json): clone Ed1 metadata
     (theme/categories/values/gradeLabels) and replace each clue's clue/response/
     explain/objective with the PARALLEL form supplied in the MAP. Same categories,
     same value tiers, same count -> the picker's static item count stays honest.

MAP file = JSON list, one object per Ed1 clue:
  { "category": "<exact Ed1 category name>", "value": <int>,
    "objective": "<area:slug>", "clue": "...", "response": "What is ..?",
    "explain": "..." }

Usage:
  build_jeopardy_edition.py <course> <slug> <subtitle> <map.json>
"""
import json, sys, copy, os

BASE = os.path.join(os.path.dirname(__file__), '..', '..', '_app', '_games-lab', 'data', 'jeopardy')
BASE = os.path.abspath(BASE)

def main():
    """Parse args, validate the MAP, tag Ed1 additively, write Ed1 + Ed2 to disk.

    Optional trailing `--out-dir <dir>` redirects BOTH outputs (tagged Ed1 + Ed2) to
    <dir> instead of the live data dir -- used by generate_edition.mjs to STAGE an
    edition for QC without touching live data. Ed1 is always READ from the live dir.
    """
    argv = sys.argv[1:]
    out_dir = None
    if '--out-dir' in argv:
        i = argv.index('--out-dir')
        out_dir = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    if len(argv) != 4:
        sys.exit("usage: build_jeopardy_edition.py <course> <slug> <subtitle> <map.json> [--out-dir <dir>]")
    course, slug, subtitle, mapfile = argv
    ed1_path = os.path.join(BASE, f'{course}.json')               # always read live Ed1
    dest_dir = out_dir or BASE                                    # write target (staging or live)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    ed1_out = os.path.join(dest_dir, f'{course}.json')
    ed2_path = os.path.join(dest_dir, f'{course}.{slug}.json')
    ed1 = json.load(open(ed1_path))
    raw = json.load(open(mapfile))

    # index MAP by (category, value); error on dup or missing.
    # Skip the optional `_meta` element (carries legend/format overrides, no clue).
    mp = {}
    for e in raw:
        if e.get('_meta'):
            continue
        key = (e['category'], int(e['value']))
        if key in mp:
            sys.exit(f"DUPLICATE map entry for {key}")
        for f in ('objective', 'clue', 'response', 'explain'):
            if not str(e.get(f, '')).strip():
                sys.exit(f"EMPTY '{f}' in map entry {key}")
        mp[key] = e

    # 1) tag Ed1 additively
    for cat in ed1['categories']:
        for cl in cat['clues']:
            key = (cat['name'], int(cl['value']))
            if key not in mp:
                sys.exit(f"MAP missing Ed1 clue {key}")
            cl['objective'] = mp[key]['objective']

    # 2) build Ed2 from Ed1 structure + parallel content
    ed2 = copy.deepcopy(ed1)
    ed2['subtitle'] = subtitle
    for cat in ed2['categories']:
        for cl in cat['clues']:
            e = mp[(cat['name'], int(cl['value']))]
            cl['objective'] = e['objective']
            cl['clue']      = e['clue']
            cl['response']  = e['response']
            cl['explain']   = e['explain']
    # refresh the format example + legend if the author supplied them (optional keys)
    # (kept simple: leave Ed1's metadata unless author provided overrides in map[0])
    meta = next((e for e in raw if e.get('_meta')), None)
    if meta:
        if meta.get('categoryLegend'): ed2['categoryLegend'] = meta['categoryLegend']
        if meta.get('jeopardyFormatExample'): ed2['jeopardyFormatExample'] = meta['jeopardyFormatExample']

    # Write both files: Ed1 (now objective-tagged) and Ed2 (parallel edition).
    # ed1_out == ed1_path in live mode; points at the staging dir when --out-dir is set.
    for path, obj in ((ed1_out, ed1), (ed2_path, ed2)):
        with open(path, 'w') as f:
            json.dump(obj, f, indent=2, ensure_ascii=False)
            f.write('\n')

    # Summary: clue count + distinct objective count, for a quick sanity glance.
    n = sum(len(c['clues']) for c in ed1['categories'])
    objs = set(mp[k]['objective'] for k in mp)
    print(f"OK  {course}: tagged Ed1 ({n} clues) + wrote Ed2 '{slug}' ({n} clues, {len(objs)} distinct objectives)")

if __name__ == '__main__':
    main()
