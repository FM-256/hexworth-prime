#!/usr/bin/env python3
"""Build a curated edition for an INDEX-keyed game (kahoot / wheel / fifth).

Jeopardy is category+value keyed (see build_jeopardy_edition.py). Kahoot, wheel,
and fifth are flat ordered sequences, so positions are matched by list index.

Same two outputs as the jeopardy builder:
  1) Tag Ed1 (data/<type>/<course>.json) items with an additive `objective` key.
  2) Author Ed2 (data/<type>/<course>.<slug>.json): clone Ed1, then at each index
     overwrite the content fields with the PARALLEL form from the MAP, preserving any
     structural fields the MAP omits (e.g. fifth's value/gradeTag/milestone).

MAP file = JSON list aligned 1:1 by index with Ed1's sequence. Each entry MUST include
`objective` plus the type's content fields:
  kahoot/fifth: { objective, q, options[], answer, note, explain{correct,wrong[]} }
  wheel:        { objective, phrase, category, hint, explain }

Usage:
  build_seq_edition.py <type> <course> <slug> <subtitle> <map.json>
"""
import json, sys, copy, os

SEQ_KEY = {'kahoot': 'questions', 'wheel': 'puzzles', 'fifth': 'questions'}

def seq_of(typ, doc):
    """Return the ordered list of items for this game type (tolerates legacy key names)."""
    if typ == 'wheel':
        return doc.get('puzzles', doc.get('rounds', []))
    return doc.get('questions', doc.get('ladder', []))

def main():
    """Validate the MAP against Ed1's length, tag Ed1, write Ed1 + Ed2 to disk."""
    if len(sys.argv) != 6:
        sys.exit("usage: build_seq_edition.py <type> <course> <slug> <subtitle> <map.json>")
    typ, course, slug, subtitle, mapfile = sys.argv[1:6]
    if typ not in SEQ_KEY:
        sys.exit(f"type must be one of {list(SEQ_KEY)}")
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..',
                                        '_app', '_games-lab', 'data', typ))
    ed1_path = os.path.join(base, f'{course}.json')
    ed2_path = os.path.join(base, f'{course}.{slug}.json')
    ed1 = json.load(open(ed1_path))
    mp = json.load(open(mapfile))

    seq1 = seq_of(typ, ed1)
    if len(mp) != len(seq1):
        sys.exit(f"MAP length {len(mp)} != Ed1 sequence length {len(seq1)}")
    for i, e in enumerate(mp):
        if not str(e.get('objective', '')).strip():
            sys.exit(f"MAP[{i}] missing/empty 'objective'")

    # 1) tag Ed1 additively (objective only)
    for i, item in enumerate(seq1):
        item['objective'] = mp[i]['objective']

    # 2) build Ed2: clone Ed1, set subtitle, overwrite content fields per index.
    ed2 = copy.deepcopy(ed1)
    ed2['subtitle'] = subtitle
    seq2 = seq_of(typ, ed2)
    for i, item in enumerate(seq2):
        # update merges the MAP's content fields onto the cloned item, leaving any
        # structural fields the MAP omits (value/gradeTag/milestone) intact.
        item.update(mp[i])

    # Write both files.
    for path, obj in ((ed1_path, ed1), (ed2_path, ed2)):
        with open(path, 'w') as f:
            json.dump(obj, f, indent=2, ensure_ascii=False)
            f.write('\n')

    objs = set(e['objective'] for e in mp)
    print(f"OK  {typ}/{course}: tagged Ed1 ({len(seq1)} items) + wrote Ed2 '{slug}' "
          f"({len(seq1)} items, {len(objs)} distinct objectives)")

if __name__ == '__main__':
    main()
