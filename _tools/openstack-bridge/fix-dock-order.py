#!/usr/bin/env python3
"""Move the terminal card ABOVE the steps card and wrap both in .work-zone.

WHY
    apply-lab-layout.py marked the terminal card `term-dock` and gave it `position: sticky`
    on every lab. On three of them the card sits AFTER the entire steps card in the DOM, so
    sticky had nothing useful to do: a student scrolls past all four mission steps before the
    terminal appears at all, and it only pins once they are already below the instructions it
    exists to sit beside. The CSS was applied to a structure that could not use it, and the
    script reported success because it only ever checked the OBJECTIVES panel shape.

    That is the same defect the layout commit claims to have fixed, just relocated -- caught by
    Chris rendering the pages rather than reading the CSS.

HOW
    Blocks are extracted by COUNTING div depth, not by matching a closing tag, because these
    cards contain nested divs and the first `</div>` is never the right one. Every file is
    checked before and after: div balance must be unchanged, the parser must accept the result,
    and the dock must actually end up before the steps. Any file that fails is not written.

@catalog what    move a lab's terminal card above its steps card and wrap both in .work-zone
@catalog run     python3 _tools/openstack-bridge/fix-dock-order.py <lab.html> [--write]
@catalog status  TOOL
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


def block_end(lines, start):
    """Index of the line closing the div opened on `start`, by depth counting."""
    depth = 0
    for i in range(start, len(lines)):
        depth += lines[i].count('<div') - lines[i].count('</div>')
        if depth <= 0 and i > start:
            return i
    return -1


def treat(html):
    notes = []
    lines = html.split('\n')

    dock = [i for i, l in enumerate(lines) if 'class="card term-dock"' in l]
    if len(dock) != 1:
        return None, [f'term-dock card matched {len(dock)} lines: refusing']
    dock = dock[0]

    # The steps card is the card containing the steps heading.
    head = [i for i, l in enumerate(lines) if re.search(r'<h2>[^<]*Steps</h2>', l)]
    if len(head) != 1:
        return None, [f'steps heading matched {len(head)} lines: refusing']
    steps = max((i for i in range(head[0]) if '<div class="card' in lines[i]), default=-1)
    if steps == -1:
        return None, ['steps heading is not inside a card: refusing']

    if dock < steps:
        return None, ['terminal already precedes the steps: nothing to do']

    dock_end = block_end(lines, dock)
    steps_end = block_end(lines, steps)
    if dock_end == -1 or steps_end == -1:
        return None, ['could not close one of the cards by depth counting: refusing']
    if not (steps < steps_end < dock < dock_end):
        return None, [f'unexpected layout (steps {steps}-{steps_end}, dock {dock}-{dock_end}): refusing']

    dock_block = lines[dock:dock_end + 1]
    # Drop the dock from its old position FIRST (it is later in the file, so the steps
    # indices stay valid), then re-insert above the steps with the wrapper around both.
    rest = lines[:dock] + lines[dock_end + 1:]
    wrapped = (['        <div class="work-zone">']
               + ['    ' + l if l.strip() else l for l in dock_block]
               + ['    ' + l if l.strip() else l for l in rest[steps:steps_end + 1]]
               + ['        </div>'])
    out = rest[:steps] + wrapped + rest[steps_end + 1:]
    notes.append(f'moved terminal ({len(dock_block)} lines) above steps, wrapped both in .work-zone')
    return '\n'.join(out), notes


if __name__ == '__main__':
    p = Path(sys.argv[1])
    src = p.read_text()
    out, notes = treat(src)
    for n in notes:
        print(f'  {n}')
    if out is None:
        sys.exit(1 if 'refusing' in notes[0] else 0)

    # Structure must be provably intact, not assumed.
    if (src.count('<div'), src.count('</div>')) != (out.count('<div') - 1, out.count('</div>') - 1):
        sys.exit(f'  ABORT: div count changed by more than the one wrapper '
                 f'({src.count("<div")}/{src.count("</div>")} -> {out.count("<div")}/{out.count("</div>")})')
    if out.count('<div') != out.count('</div>'):
        sys.exit('  ABORT: div balance broken')
    HTMLParser().feed(out)
    d = out.index('class="card term-dock"')
    s = re.search(r'<h2>[^<]*Steps</h2>', out).start()
    if d > s:
        sys.exit('  ABORT: terminal still follows the steps')
    print(f'  balance {out.count("<div")}/{out.count("</div>")} OK, terminal now precedes steps')

    if '--write' in sys.argv:
        p.write_text(out)
        print('  WRITTEN')
    else:
        print('  dry run (pass --write to apply)')
