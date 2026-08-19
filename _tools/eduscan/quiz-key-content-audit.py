#!/usr/bin/env python3
"""
quiz-key-content-audit.py — check each answer key against the QUESTION'S OWN EXPLANATION.

@catalog what   Flags questions where the answer key disagrees with the explanation text that
                sits beside it in the quiz HTML. Complements quiz-key-drift-audit.js.
@catalog run    python3 _tools/eduscan/quiz-key-content-audit.py [--ids a,b,c] [--json]
@catalog status TOOL

WHY THIS EXISTS, AND WHY THE OTHER AUDIT IS NOT ENOUGH
quiz-key-drift-audit.js compares the registry to Firestore. Once a key is pushed the two agree,
so a WRONG key that was pushed successfully reads as green forever. It moved the defect out of
the tool's field of view rather than out of production. Nancy, 2026-08-19, spot-checked 4 of the
81 repaired quizzes by hand and found 3 with a wrong answer live. This audit is the missing half:
registry-vs-TRUTH, where truth is the explanation the author wrote for that question.

WHY WORD OVERLAP IS NOT THE TEST
The first pass scored options by token overlap with the explanation. That measure is blind
exactly where the defects were:

  "How many PIO state machines does the RP2040 have in total?"  options 2 / 4 / 8 / 16
  explanation "...2 PIO blocks, each containing 4 state machines, for a total of 8..."

Every option is a bare numeral with no tokens to overlap, so the metric cannot separate them and
quietly returns the first index. All three defects Nancy found are numeric-option questions. An
aggregate score of 57% looked like signal while being uninformative on precisely these items —
which is why an aggregate must never stand in for reading the question.

STRATEGY (strongest available signal per question, and it says WHICH it used)
  1. VERBATIM   the option's full text appears in the explanation. Near-conclusive.
  2. NUMERIC    options are bare quantities; extract the quantity the explanation asserts. Handles
                "a total of 8" and prefers the LAST such assertion, since explanations typically
                build up ("2 blocks, each with 4 ... total of 8").
  3. OVERLAP    token overlap. Weakest; reported as low confidence.
  4. NONE       no method applies — reported as unknown, never as agreement.

Every finding is a question to READ, not a verdict to push. This tool never writes.
"""

import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APP = os.path.join(REPO, '_app')
REGISTRY = os.path.join(REPO, 'functions', 'quiz_keys.json')

STOP = set("the a an and or of to in is are that with for on as it its by be can this which "
           "when what does not you your they them then than at from into each per most only".split())

NUM_WORDS = {'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
             'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'twelve': 12}


def tokens(s):
    return {w for w in re.findall(r"[a-z]{4,}", s.lower())} - STOP


def parse_questions(path):
    """Split POSITIONALLY on question boundaries so index i is always question i.

    A regex matching question+options+explanation as one unit silently drops any question
    containing an embedded apostrophe, which shifts every later index and makes the audit
    compare the wrong question while reading perfectly plausibly. Splitting first means a
    failed extraction yields a blank entry, never a shifted one.
    """
    with open(path, encoding='utf-8', errors='ignore') as fh:
        text = fh.read()
    starts = [m.start() for m in re.finditer(r'"?question"?\s*:\s*[\'"]', text)]
    out = []
    for i, s in enumerate(starts):
        seg = text[s: starts[i + 1] if i + 1 < len(starts) else s + 4000]
        qm = re.match(r'"?question"?\s*:\s*([\'"])(.*?)\1\s*,', seg, re.S)
        om = re.search(r'"?options"?\s*:\s*\[(.*?)\]\s*,', seg, re.S)
        em = re.search(r'"?explanation"?\s*:\s*([\'"])(.*?)\1\s*[,}\n]', seg, re.S)
        opts = []
        if om:
            opts = [m.group(2) for m in
                    re.finditer(r'([\'"])((?:[^\\]|\\.)*?)\1\s*(?:,|$)', om.group(1), re.S)]
        out.append({
            'q': qm.group(2) if qm else '',
            'opts': opts,
            'e': em.group(2) if em else ''
        })
    return out


def quantity_of(s):
    """The single quantity an option expresses, or None if it is not a bare quantity."""
    t = s.strip().lower().replace(',', '')
    m = re.fullmatch(r'(?:about|approx\.?|approximately|up to|max(?:imum)? of)?\s*'
                     r'(\d+(?:\.\d+)?)\s*'
                     r'(bits?|bytes?|kb|mb|gb|hours?|minutes?|days?|seconds?|ms|v|volts?|%|'
                     r'accounts?|users?|peers?|teams?|days|pins?)?\s*'
                     r'(?:\(.*\))?', t)
    if m:
        return float(m.group(1))
    if t in NUM_WORDS:
        return float(NUM_WORDS[t])
    return None


def decide(question, opts, expl):
    """Return (predicted_index, method, confidence) using the strongest applicable signal."""
    if not opts or not expl:
        return None, 'NONE', 0.0
    el = expl.lower()

    # 1. VERBATIM — an option restated inside the explanation.
    verbatim = [i for i, o in enumerate(opts)
                if len(o.strip()) >= 12 and o.strip().lower().rstrip('.') in el]
    if len(verbatim) == 1:
        return verbatim[0], 'VERBATIM', 0.95

    # 2. NUMERIC — every option is a bare quantity, so overlap cannot separate them.
    quantities = [quantity_of(o) for o in opts]
    if sum(q is not None for q in quantities) >= max(2, len(opts) - 1):
        # ONLY an explicitly-signalled total counts. An earlier version also fell back to "the
        # last number mentioned", which mis-read "264 KB of SRAM" as 64 (substring of a larger
        # numeral) and "9-DOF ... gyro + accel + mag" as 3. Both were false positives on
        # correct keys. A weak numeric guess is worse than none: it sends a reader to re-key a
        # question that was already right.
        totals = re.findall(r'(?:total(?:ling)?\s+of|in\s+total|altogether|only)\s+(\d+(?:\.\d+)?)', el)
        for raw in totals:
            hits = [i for i, q in enumerate(quantities) if q is not None and q == float(raw)]
            if len(hits) == 1:
                return hits[0], 'NUMERIC', 0.85
        return None, 'NUMERIC-AMBIGUOUS', 0.0

    # 3. OVERLAP — weakest signal, so it is scored by MARGIN over the runner-up rather than by
    # raw score. A previous version capped this at 0.6 while the report floor was 0.7, which
    # silently made the entire method dead code and hid every non-numeric defect. Its findings
    # are reported in a separate REVIEW tier, never mixed with the conclusive ones.
    et = tokens(expl)
    scores = [len(tokens(o) & et) / max(len(tokens(o)), 1) for o in opts]
    if max(scores) == 0:
        return None, 'NONE', 0.0
    best = max(range(len(scores)), key=lambda i: scores[i])
    ordered = sorted(scores, reverse=True)
    margin = ordered[0] - (ordered[1] if len(ordered) > 1 else 0)
    return best, 'OVERLAP', round(margin, 2)


def main():
    args = sys.argv[1:]
    as_json = '--json' in args
    only = None
    if '--ids' in args:
        only = set(args[args.index('--ids') + 1].split(','))

    with open(REGISTRY, encoding='utf-8') as fh:
        registry = json.load(fh)

    # moduleId -> file, over both quizzes and exams
    id_to_file = {}
    for root, _dirs, files in os.walk(APP):
        for fn in files:
            if not fn.endswith(('.quiz.html', '.exam.html')):
                continue
            p = os.path.join(root, fn)
            with open(p, encoding='utf-8', errors='ignore') as fh:
                head = fh.read()
            m = re.search(r"moduleId:\s*['\"]([^'\"]+)['\"]", head) or \
                re.search(r"QUIZ_ID\s*=\s*['\"]([^'\"]+)['\"]", head)
            if m:
                id_to_file.setdefault(m.group(1), p)

    findings = []
    checked = skipped = 0
    for quiz_id, entry in registry.items():
        if only and quiz_id not in only:
            continue
        answers = entry.get('answers') if isinstance(entry, dict) else entry
        path = id_to_file.get(quiz_id)
        if not isinstance(answers, list) or not path:
            skipped += 1
            continue
        blocks = parse_questions(path)
        for i, key in enumerate(answers):
            if i >= len(blocks):
                break
            b = blocks[i]
            if not b['opts'] or key >= len(b['opts']):
                continue
            checked += 1
            pred, method, conf = decide(b['q'], b['opts'], b['e'])
            # VERBATIM/NUMERIC are near-conclusive; OVERLAP is a hint and is segregated below so
            # it can never be mistaken for one. Its floor is a MARGIN over the runner-up, not a
            # raw score — a high score every option shares proves nothing.
            floor = 0.7 if method in ('VERBATIM', 'NUMERIC') else 0.35
            if pred is not None and pred != key and conf >= floor:
                findings.append({
                    'quizId': quiz_id,
                    'file': os.path.relpath(path, REPO),
                    'question': i + 1,
                    'keyed': key,
                    'keyedText': b['opts'][key][:90],
                    'predicted': pred,
                    'predictedText': b['opts'][pred][:90],
                    'method': method,
                    'confidence': round(conf, 2),
                    'explanation': b['e'][:180]
                })

    if as_json:
        print(json.dumps({'checked': checked, 'skipped': skipped, 'findings': findings}, indent=2))
        return 1 if findings else 0

    print(f"\n  checked {checked} questions across {len(registry) - skipped} quizzes "
          f"({skipped} had no matching file)\n")
    if not findings:
        print("  no key/explanation disagreements above the confidence floor.\n")
        return 0

    strong = [f for f in findings if f['method'] in ('VERBATIM', 'NUMERIC')]
    review = [f for f in findings if f['method'] == 'OVERLAP']

    def dump(items, heading, note):
        print(f"  {heading} ({len(items)})")
        print(f"  {note}\n")
        by_quiz = {}
        for f in items:
            by_quiz.setdefault(f['quizId'], []).append(f)
        for quiz_id, rows in sorted(by_quiz.items()):
            print(f"    {quiz_id}  ({rows[0]['file']})")
            for f in rows:
                print(f"      Q{f['question']}  key[{f['keyed']}] {f['keyedText']}")
                print(f"            -> [{f['predicted']}] {f['predictedText']}   "
                      f"[{f['method']} {f['confidence']}]")
            print('')

    if strong:
        dump(strong, "KEY DISAGREES WITH ITS OWN EXPLANATION",
             "The explanation restates a different option verbatim, or states a different total.\n"
             "  Read each one. Do not push without reading.")
    if review:
        dump(review, "WEAKER SIGNAL — REVIEW ONLY, NOT A VERDICT",
             "Token overlap only. This method produced false verdicts before (it called a\n"
             "  correct az104-ch02 broken). Expect false positives; treat as a reading list.")
    # Only the near-conclusive tier fails the run. A hint tier that can go red on correct keys
    # would train people to ignore the exit code, which is how the placeholder keys survived.
    return 1 if strong else 0


if __name__ == '__main__':
    sys.exit(main())
