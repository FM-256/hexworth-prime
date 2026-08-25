#!/usr/bin/env python3
"""Apply the capstone's proven layout treatment to one OpenStack lab page.

WHY A SCRIPT AND NOT SEVEN HAND EDITS
    Seven pages share one structure and one set of defects. Hand-editing each invites seven
    slightly different results, and the differences would be invisible until a student hit one.
    Every page gets the identical treatment here, and the measurement afterwards is what proves
    it landed, not the fact that the script ran.

THE FOUR DEFECTS, ALL MEASURED ON THE CAPSTONE BEFORE THEY WERE FIXED
    1. Commands set at 0.84rem, SMALLER than the prose around them, on pages about typing
       commands. Now 0.95rem with real padding and line height.
    2. Prose running 210 to 228 characters per line. Comfortable is 60 to 90; past about 110 the
       eye cannot find the start of the next line. Capped by measurement, not by the ch unit,
       which is the width of "0" and narrower than the average glyph.
    3. A dead column down the right of a 1600px page. The objectives panel moves into a sticky
       second column above 1500px, so what a student is graded on stays beside the work.
    4. A launched terminal 648px tall that scrolls out of view, so working the lab meant
       scrolling thousands of pixels up to type and back down to read, per step. The terminal
       card docks, bounded to the work so it cannot cover the closing section.

    The pin, the height cap and the hidden heading are ONE trade and live in ONE breakpoint.
    Split across two, they shrink the console on viewports where it is not even pinned.

@catalog what    apply the proven layout treatment to one OpenStack lab page
@catalog run     python3 _tools/openstack-bridge/apply-lab-layout.py <lab.html> [--write]
@catalog status  TOOL
"""
import re
import sys
from pathlib import Path

CSS = """        /* ---- layout treatment (see _tools/openstack-bridge/apply-lab-layout.py) ---- */
        /* Commands are what a student reads most carefully and were set SMALLER than the prose
           around them. */
        .cmd { padding: 16px 20px !important; margin: 12px 0 !important;
               font-size: 0.95rem !important; line-height: 1.65 !important; }
        /* Cap EVERY text container, found by measuring the rendered page rather than by
           listing the classes I happened to edit. The first version capped `.card p, .card li`
           and left .mode-note at 226 characters per line, a bare <p> at 215, and the io blocks
           at 140: worse than the 210 it was meant to fix. */
        .wrap p, .wrap li,
        .brief, .mode-note,
        .lab-monitor__sub, .lab-monitor__task, .lab-monitor p,
        .header .sub,
        .io__expect, .io__ifnot { max-width: 80ch; }
        ul + p { margin-top: 14px; }
        /* Two columns above 1500px: the work left, what you are graded on beside it. Below that
           the single column keeps the full width for the steps. */
        @media (min-width: 1500px) {
            .cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
                    gap: 22px; align-items: start; }
            .cols > .side { position: sticky; top: 20px; max-height: calc(100vh - 40px);
                            overflow-y: auto; }
            /* The pin, the cap and the hidden heading are one trade, so they switch together. */
            .term-dock { position: sticky; top: 10px; z-index: 5; }
            .term-dock > h2 { display: none; }
            .term-dock .sandbox-launcher__iframe-wrap { height: clamp(200px, 26vh, 420px); }
        }
        .term-dock { padding: 12px 16px; }
        /* The sticky boundary ends where the steps end, so the terminal cannot ride down over
           the closing section. */
        .work-zone { position: relative; }
        /* These pages say "check 4 reads this exact state" in their own prose while the panel
           shows no numbers anywhere. Two vocabularies with no bridge. */
        .lab-monitor__id {
            display: inline-block; font-size: 0.72rem; letter-spacing: 0.08em; font-weight: 700;
            color: var(--cloud-dark); background: var(--cloud-accent);
            border-radius: 4px; padding: 1px 7px; margin-right: 8px; vertical-align: 2px;
        }
"""


def treat(html: str):
    notes = []
    if "apply-lab-layout.py" in html:
        return html, ["already treated, skipped"]

    # 1. CSS, injected just before .footer so it wins on order as well as specificity
    anchor = re.search(r"^\s*\.footer \{", html, re.M)
    if not anchor:
        return html, ["NO .footer rule to anchor the CSS: refusing"]
    html = html[:anchor.start()] + CSS + html[anchor.start():]
    notes.append("css injected")

    # 2. the terminal card becomes the dock
    m = re.search(r'<div class="card">\s*\n\s*<h2>Live Cloud Terminal</h2>', html)
    if not m:
        return html, ["NO 'Live Cloud Terminal' card: refusing"]
    html = html[:m.start()] + m.group(0).replace('<div class="card">', '<div class="card term-dock">', 1) + html[m.end():]
    notes.append("term-dock marked")

    lines = html.split("\n")

    # 3. move the objectives panel into a sticky second column
    try:
        start = next(i for i, l in enumerate(lines) if re.search(r'class="lab-monitor" id="', l))
        # Search AFTER the panel starts. `lab-monitor__msg` also appears in the CSS near the top
        # of the file, so searching from line 0 matched the stylesheet and put the end marker
        # above the start: the move then relocated a 5-line fragment instead of the 40-line
        # panel, and div balance still came out even, so only the line count gave it away.
        msg = next(i for i in range(start, len(lines)) if 'lab-monitor__msg' in lines[i])
        end = next(i for i in range(msg, len(lines)) if lines[i].strip() == "</div>")
    except StopIteration:
        return "\n".join(lines), notes + ["NO objectives panel found: refusing"]
    panel = lines[start:end + 1]
    rest = lines[:start] + lines[end + 1:]
    body = next(i for i, l in enumerate(rest) if "</body>" in l)
    closes = [i for i in range(body) if rest[i].rstrip() == "    </div>"]
    if not closes:
        return "\n".join(rest), notes + ["could not locate the .cols close: refusing"]
    cols_close = closes[-1]
    rest = rest[:cols_close] + ['    <div class="side">'] + ["    " + p for p in panel] + ["    </div>", ""] + rest[cols_close:]
    notes.append(f"objectives panel moved into .side ({len(panel)} lines)")

    # 4. wrap dock + steps so the sticky region ends before the closing card
    dock = next(i for i, l in enumerate(rest) if 'class="card term-dock"' in l)
    tail = [i for i, l in enumerate(rest) if re.search(r'<h2>(Why this transfers|What this proves)</h2>', l)]
    if tail:
        tail_card = max(i for i in range(tail[0]) if rest[i].strip().startswith('<div class="card'))
        rest = rest[:dock] + ['        <div class="work-zone">'] + rest[dock:tail_card] + ["        </div>", ""] + rest[tail_card:]
        notes.append("work-zone wraps dock + steps")
    else:
        notes.append("no closing card found; work-zone not needed")

    # 5. badge each objective with its check id.
    # This was hand-applied to the first lab AFTER the script ran, which is exactly the drift
    # this script exists to prevent: the tool would have been run five more times, exited 0 each
    # time, and silently left the defect in place, because nothing errors for a step that was
    # never implemented. Encoded here so one run produces the whole treatment.
    out = "\n".join(rest)
    badged = 0
    for cid in re.findall(r'data-check="(\d+)"', out):
        marker = f'<li class="fail" data-check="{cid}">'
        if marker not in out:
            continue
        i = out.index(marker)
        j = out.index('<div class="lab-monitor__task">', i)
        if 'lab-monitor__id' in out[j:j + 120]:
            continue
        out = (out[:j]
               + f'<div class="lab-monitor__task"><span class="lab-monitor__id">CHECK {cid}</span>'
               + out[j + len('<div class="lab-monitor__task">'):])
        badged += 1
    notes.append(f"badged {badged} objective(s) with their check ids")
    return out, notes


if __name__ == "__main__":
    p = Path(sys.argv[1])
    src = p.read_text()
    out, notes = treat(src)
    for n in notes:
        print(f"  {n}")
    ok = out.count("<div") == out.count("</div>")
    print(f"  div balance: {out.count('<div')}/{out.count('</div')} -> {'OK' if ok else 'BROKEN'}")
    if not ok:
        sys.exit("  refusing to write: div balance broken")
    # A note that says "refusing" must actually refuse. The first version printed it and then
    # exited 0, so a partial treatment (css + dock, no panel move, no badges) would have been
    # written to four of the five remaining labs and looked like a success. Silent partial
    # application is the drift this script exists to prevent.
    refusals = [n for n in notes if "refusing" in n or "NO " in n]
    if refusals:
        sys.exit(f"  ABORT: {refusals[0]} -- nothing written, this page needs a different shape")
    if "--write" in sys.argv:
        p.write_text(out)
        print("  WRITTEN")
    else:
        print("  dry run (pass --write to apply)")
