#!/usr/bin/env python3
"""
build-combined-deck.py — ONE deck that combines both existing C|CSE assets.

@catalog what   Joins the chapter lecture decks (visuals) with the companion deck (words)
@catalog what   into cse-lecture-combined.html. Neither source is modified.
@catalog run    python3 _planning/cse-visuals/build-combined-deck.py
@catalog status TOOL

THE PROBLEM, IN THE OPERATOR'S WORDS
  "you are supposes to create One new asset by combining all available assets. not destroy
   existing assets. because each individualy is incorrect. there is no balance one style
   has only text and the other is only images"

  cse-lecture-chN.html  33 content slides, 33 visuals, on-screen text is 2-3 short beats.
                        Beautiful and empty: a student who looks up learns nothing.
  cse-companion.html    34 content slides, 118 <li> of real substance, 13 images.
                        (118 counted as `<li\b`. An earlier note said 236, which was the
                        sloppy pattern `li>` matching BOTH <li> and </li> -- exactly the
                        mistake the instructor page's own header warns about, where a
                        loose grep once claimed 310 WSA slides against a real 89.
                        Chris blocked the deploy over it. Count with a word boundary.)
                        Substantive and unpresentable: a wall of words on a projector.

  Each alone is wrong. This makes the one that is right.

THE JOIN IS EXACT, NOT APPROXIMATE
  Both assets cover the same eight chapters with the SAME SLIDE TITLES. Measured before
  writing a line of this: 33 of 33 chapter-deck content slides have an exact title match
  in the companion. Zero unmatched. So nothing here is authored, reworded or invented --
  the visual comes from one file, the bullets from the other, and both are copied.

WHAT LANDS ON SCREEN
  title + subtitle, then the visual and the bullets SIDE BY SIDE. The visual keeps the
  larger share so it still reads as a projection deck; the bullets give the room something
  to hold onto. That is the balance that was missing.

WHAT STAYS OFF SCREEN
  Everything the class must not see: the chapter deck's data-notes (talking points, class
  anchors, ask-the-room prompts) plus the companion's .cue and .demo blocks, merged into
  one presenter-notes payload per slide. Press N for this screen, P for a second screen.

NOTHING IS DESTROYED
  Writes ONE new file. cse-lecture.html, cse-lecture-ch1..8.html and cse-companion.html are
  read-only inputs and stay exactly as they are.

ENGINE PROVENANCE
  The <style> and <script> are lifted verbatim from cse-lecture.html, which already carries
  the chapter menu (C), the second-screen presenter view (P), the per-tab pairing token that
  stops a third window hijacking the presenter, and the mirror-mode warning. Lifting rather
  than retyping means this deck cannot drift from the one that was tested.
"""
import html as H
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
INSTR = REPO / '_app/houses/cloud/instructor'
CHAPTERS_DIR = REPO / '_app/houses/cloud/cse/instructor'
MERGED = INSTR / 'cse-lecture.html'
COMPANION = CHAPTERS_DIR / 'cse-companion.html'
OUT = INSTR / 'cse-lecture-combined.html'

CHAPTER_TITLES = [
    (1, 'What is Cloud?'),
    (2, 'Cloud Security Fundamentals'),
    (3, 'Identity and Access'),
    (4, 'Data Protection'),
    (5, 'Network Security'),
    (6, 'Application Security in Cloud'),
    (7, 'Monitoring and Incident Response'),
    (8, 'Risk and Governance'),
]


def die(msg):
    print('BUILD ABORTED: ' + msg, file=sys.stderr)
    sys.exit(1)


def strip_tags(x):
    return H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x))).strip()


def norm(t):
    """Join key. Punctuation and case vary between the two assets; the words do not."""
    return re.sub(r'[^a-z0-9]+', '', strip_tags(t).lower())


def load_companion():
    """title-key -> {bullets, cues, demos}. The words half of the deck."""
    if not COMPANION.exists():
        die(f'{COMPANION} missing')
    s = COMPANION.read_text(encoding='utf-8', errors='replace')
    out = {}
    for part in re.split(r'(?=<div class="slide[ "])', s)[1:]:
        m = re.search(r'<h2[^>]*>(.*?)</h2>', part, re.S)
        if not m:
            continue                      # chapter divider or cover, no content to take
        # Keep the bullets' inline markup (<b>, <code>) -- it is the companion's emphasis,
        # and dropping it would be rewording by omission.
        # \b after li: without it this also matches SVG <line ...>, since "line" starts
        # with "li". No bullet was corrupted -- none of those false starts had a closing
        # </li> before the slide boundary -- but that is document-structure luck, not
        # correctness. Chris found it while verifying the fold.
        bullets = [x.strip() for x in re.findall(r'<li\b[^>]*>(.*?)</li>', part, re.S)]
        # Three slides -- "Five essential characteristics", "The threat landscape, in cloud
        # terms", "The IAM failures that actually cause breaches" -- carry their substance in
        # a two-column <table class="cmp"> (term -> consequence) and have NO <li> at all.
        # Reading only <li> left them with a single fallback bullet each, which a click-test
        # caught. Fold each row into "term — consequence": the same words, restructured from
        # a table into a bullet. A projected table at the back of a room is unreadable anyway.
        if not bullets:
            for row in re.findall(r'<tr[^>]*>(.*?)</tr>', part, re.S):
                cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.S)
                if len(cells) >= 2:
                    term, rest = cells[0].strip(), cells[1].strip()
                    if not term.lstrip().startswith('<b'):
                        term = f'<b>{term}</b>'
                    bullets.append(f'{term} {rest}')
        cues = [strip_tags(x) for x in re.findall(r'class="cue"[^>]*>(.*?)</div>', part, re.S)]
        demos = [strip_tags(x) for x in re.findall(r'class="demo"[^>]*>(.*?)</div>', part, re.S)]
        out[norm(m.group(1))] = {'bullets': bullets, 'cues': cues, 'demos': demos}
    return out


def load_chapters():
    """Per chapter: its cover slide plus its content slides with visual + notes + beats."""
    chapters = []
    for n, title in CHAPTER_TITLES:
        src = CHAPTERS_DIR / f'cse-lecture-ch{n}.html'
        if not src.exists():
            die(f'{src} missing')
        s = src.read_text(encoding='utf-8', errors='replace')
        sections = re.findall(r'<section class="slide.*?</section>', s, re.S)
        if not sections:
            die(f'ch{n}: no slides')
        cover, content = None, []
        for sec in sections:
            if re.search(r'<h1[^>]*>', sec):
                cover = sec
                continue
            h2 = re.search(r'<h2[^>]*>(.*?)</h2>', sec, re.S)
            if not h2:
                continue
            sub = re.search(r'<p class="sub">(.*?)</p>', sec, re.S)
            vis = re.search(r'<div class="visual">(.*?)</div>\s*(?=<div class="beats"|</section>)',
                            sec, re.S)
            if not vis:   # slide 7 of ch1 wraps its art in .tower-stage inside .visual
                vis = re.search(r'<div class="visual">(.*)</div>', sec, re.S)
            beats = [strip_tags(b) for b in re.findall(r'<span[^>]*>(.*?)</span>',
                                                       (re.search(r'<div class="beats">(.*?)</div>\s*</section>',
                                                                  sec, re.S) or re.match('', '')).group(1)
                                                       if re.search(r'<div class="beats">(.*?)</div>\s*</section>', sec, re.S)
                                                       else '', re.S)]
            notes = re.search(r"data-notes='(.*?)'\s*>", sec, re.S) or \
                    re.search(r'data-notes="(.*?)"\s*>', sec, re.S)
            content.append({
                'title': h2.group(1).strip(),
                'sub': sub.group(1).strip() if sub else '',
                'visual': vis.group(1).strip() if vis else '',
                'beats': beats,
                'notes_raw': notes.group(1) if notes else '',
            })
        if cover is None:
            die(f'ch{n}: no cover slide')
        chapters.append({'n': n, 'title': title, 'cover': cover, 'content': content})
    return chapters


def merge_notes(notes_raw, comp, beats):
    """One presenter payload: the chapter deck's notes plus the companion's cue/demo plus
    the chapter deck's on-screen beats, which stop being on-screen in this deck."""
    data = {}
    if notes_raw:
        try:
            data = json.loads(H.unescape(notes_raw))
        except Exception:
            data = {}
    points = list(data.get('points') or [])
    for c in comp.get('cues', []):
        points.append('<b>Cue.</b> ' + H.escape(c))
    for d in comp.get('demos', []):
        points.append('<b>Demo.</b> ' + H.escape(d))
    if beats:
        points.append('<b>Anchors.</b> ' + ' &middot; '.join(H.escape(b) for b in beats))
    out = {'points': points}
    if data.get('anchor'):
        out['anchor'] = data['anchor']
    if data.get('ask'):
        out['ask'] = data['ask']
    return out


def main():
    if not MERGED.exists():
        die(f'{MERGED} missing -- it supplies the tested style and engine')
    merged = MERGED.read_text(encoding='utf-8', errors='replace')

    # ALL style blocks, not the first. cse-lecture.html carries TWO: the base deck CSS and
    # a second block holding the chapter-menu, bar-label and presenter chapter-flag rules.
    # A non-greedy <style>.*?</style> takes only the first, which shipped a deck whose
    # .chapmenu had no `display:none` -- the jump menu rendered unstyled ON TOP of every
    # slide. Nothing asserted it, because the engine check looked for the id `chapMenu` in
    # the SCRIPT and found it there. Caught by looking at a screenshot.
    styles = re.findall(r'<style>.*?</style>', merged, re.S)
    script_m = re.search(r'<script>\n/\* Slide engine.*?</script>', merged, re.S)
    if not styles or not script_m:
        die('could not lift <style>/<script> from cse-lecture.html')
    style, script = '\n'.join(styles), script_m.group(0)
    # Assert against the STYLE specifically for CSS, and the SCRIPT for behaviour, so a
    # missing stylesheet can never be masked by a matching identifier in the engine.
    for needle in ('body.presenter', '.pv-warn', '.chapmenu', '.bar .chap'):
        if needle not in style:
            die(f'inherited STYLE is missing {needle}')
    for needle in ('pairToken', "getElementById('chapMenu')", 'openPresenter'):
        if needle not in script:
            die(f'inherited SCRIPT is missing {needle}')

    comp = load_companion()
    chapters = load_chapters()

    joined = unjoined = 0
    body, js_chapters, idx = [], [], 0
    for ch in chapters:
        start = idx
        cover = re.sub(r'<section class="slide cover( active)?"',
                       f'<section class="slide cover" data-ch="{ch["n"]}"', ch['cover'], count=1)
        body.append(f'\n    <!-- ══════ CHAPTER {ch["n"]} · {ch["title"]} ══════ -->\n')
        body.append(cover)
        idx += 1
        for c in ch['content']:
            key = norm(c['title'])
            cm = comp.get(key)
            if cm and cm['bullets']:
                joined += 1
                pts = ''.join(f'<li>{b}</li>' for b in cm['bullets'])
            else:
                # No companion bullets (4 slides carry their substance in cue/demo blocks
                # instead). Fall back to the chapter deck's own beats so the right-hand
                # column is never empty -- and count it, so the shortfall is visible.
                unjoined += 1
                cm = cm or {'bullets': [], 'cues': [], 'demos': []}
                src = cm['cues'] + cm['demos'] or c['beats']
                pts = ''.join(f'<li>{H.escape(x)}</li>' for x in src)
            notes = merge_notes(c['notes_raw'], cm, c['beats'])
            notes_attr = H.escape(json.dumps(notes), quote=True)
            body.append(
                f'<section class="slide split" data-ch="{ch["n"]}" data-notes="{notes_attr}">\n'
                f'  <h2>{c["title"]}</h2>\n'
                + (f'  <p class="sub">{c["sub"]}</p>\n' if c['sub'] else '')
                + f'  <div class="split-body">\n'
                f'    <div class="visual">{c["visual"]}</div>\n'
                f'    <ul class="points">{pts}</ul>\n'
                f'  </div>\n'
                f'</section>')
            idx += 1
        js_chapters.append("{n: %d, start: %d, len: %d, title: '%s'}"
                           % (ch['n'], start, idx - start, ch['title'].replace("'", "\\'")))

    slides_html = '\n\n'.join(body)
    slides_html = slides_html.replace('<section class="slide cover" data-ch="1"',
                                      '<section class="slide cover active" data-ch="1"', 1)

    # The engine's CHAPTERS table is emitted by the other generator; swap in ours.
    script = re.sub(r'const CHAPTERS = \[.*?\];',
                    'const CHAPTERS = [\n    ' + ',\n    '.join(js_chapters) + '\n];',
                    script, count=1, flags=re.S)

    out = TEMPLATE.format(style=style, split_css=SPLIT_CSS, slides=slides_html, script=script)
    OUT.write_text(out, encoding='utf-8')

    total = idx
    print(f'chapters: {len(chapters)}   slides: {total} '
          f'({total - len(chapters)} content + {len(chapters)} covers)')
    print(f'  slides taking companion bullets: {joined}')
    print(f'  slides falling back to cue/demo/beats: {unjoined}')

    w = OUT.read_text(encoding='utf-8')
    if w.count('<section class="slide') != total:
        die('slide count on disk does not match')
    if w.count('class="slide cover active"') != 1:
        die('not exactly one active slide')
    if w.count('<section') != w.count('</section>'):
        die('unbalanced <section>')
    if w.count('<div') != w.count('</div>'):
        die(f"unbalanced <div>: {w.count('<div')} open, {w.count('</div>')} close")
    print(f'verified on disk: {total} slides, 1 active, tags balanced')
    print(f'wrote {OUT.relative_to(REPO)} ({len(w)} bytes)')
    return 0


SPLIT_CSS = '''
    /* ── THE COMBINED SLIDE ───────────────────────────────────────
       The visual and the words share the slide instead of each owning a deck.
       Visual keeps the larger share so this still reads as a projection deck;
       the bullets give the room something to hold onto. */
    .slide.split .split-body {
        flex: 1; min-height: 0; width: 100%; display: flex;
        align-items: center; gap: 30px; margin-top: 6px;
    }
    .slide.split .visual { flex: 1 1 56%; min-width: 0; height: 100%; }
    .slide.split .points {
        flex: 1 1 44%; min-width: 0; max-height: 100%; overflow-y: auto;
        list-style: none; margin: 0; padding: 0 4px 0 0; text-align: left;
    }
    .slide.split .points li {
        position: relative; padding-left: 22px; margin-bottom: 15px;
        font-size: clamp(.92rem, 1.18vw, 1.16rem); line-height: 1.5; color: #dbe4f0;
    }
    .slide.split .points li::before {
        content: '\\25B8'; position: absolute; left: 0; top: .05em;
        color: var(--gold); font-size: .85em;
    }
    .slide.split .points li b { color: #93c5fd; font-weight: 650; }
    .slide.split .points li code {
        background: rgba(255,255,255,.07); border: 1px solid var(--line);
        border-radius: 4px; padding: 1px 5px; font-size: .9em;
    }
    /* Stack rather than squeeze on a narrow projector or a laptop preview. */
    @media (max-aspect-ratio: 5/4) {
        .slide.split .split-body { flex-direction: column; gap: 14px; }
        .slide.split .visual { flex: 1 1 auto; width: 100%; }
        .slide.split .points { flex: 0 1 auto; width: 100%; }
    }
'''

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CSE Lecture &middot; Combined Deck | CloudMaster</title>
<!--
  CSE LECTURE -- THE COMBINED DECK

  GENERATED. Do not hand-edit: run _planning/cse-visuals/build-combined-deck.py.

  WHAT THIS IS
    ONE asset built from BOTH existing ones, because each alone was wrong:
      cse-lecture-chN.html  gorgeous visuals, on-screen text was 2-3 short beats
      cse-companion.html    118 bullets of real substance, no visuals, unpresentable
    Every content slide here carries the chapter deck's visual AND the companion's
    bullets, side by side. The join is exact: all 33 content slides matched by title
    across the two sources. Nothing was authored, reworded or re-illustrated.

  BOTH SOURCES ARE UNTOUCHED and still work. This adds; it does not replace.

  KEYS
    -> / space / PageDown   next        <- / PageUp   previous
    N   presenter notes on this screen  P   presenter view in a second window
    C   chapter menu                    F   fullscreen
-->
{style}
<style>{split_css}</style>
<script src="../../../components/FirebaseAuth.js"></script>
<script src="../../../components/FirestoreManager.js"></script>
<script src="../../../components/AccessGuard.js"></script>
<script>AccessGuard.require('instructor');</script>
</head>
<body>
<div class="app">

  <div class="bar">
    <a href="index.html">&larr; Instructor Slides</a>
    <span class="mid">EC-Council C|CSE &middot; <span class="chap" id="chapLabel">&mdash;</span></span>
    <span class="right" id="counter"></span>
  </div>

  <div class="stage" id="stage">
{slides}

  </div>

  <div class="notes" id="notes"></div>

  <div class="chapmenu" id="chapMenu">
    <h3>Jump to chapter</h3>
    <ol id="chapList"></ol>
    <p class="dismiss">Press the chapter number, or C / Esc to close.</p>
  </div>

  </div>

  <div class="nav">
    <button onclick="go(-1)">&larr; Prev</button>
    <span class="hint">
      <kbd>&larr;</kbd> <kbd>&rarr;</kbd> move &nbsp;&middot;&nbsp;
      <kbd>C</kbd> chapters &nbsp;&middot;&nbsp;
      <kbd>N</kbd> notes &nbsp;&middot;&nbsp;
      <kbd>P</kbd> presenter view &nbsp;&middot;&nbsp; <kbd>F</kbd> fullscreen
    </span>
    <button onclick="go(1)">Next &rarr;</button>
  </div>

<div class="pv">
  <div class="pv-top">
    <span class="ttl" id="pvTitle">&mdash;</span>
    <span class="pos" id="pvPos"></span>
    <span class="pv-clock"><span id="pvClock">00:00</span>
      <button id="pvReset" type="button">RESET</button></span>
  </div>
  <div class="pv-body">
    <div class="pv-notes" id="pvNotes"></div>
    <div class="pv-next" id="pvNext"></div>
  </div>
  <div class="pv-ctrl">
    <button id="pvPrev" type="button">&larr; Previous</button>
    <button id="pvNext2" type="button">Next &rarr;</button>
    <span class="hint">Arrow keys work here too &middot; this window is yours, the other one is the class's</span>
  </div>
  <div class="pv-warn">
    Drag this window to your laptop screen before you begin. If your displays are
    <b>mirrored</b> rather than <b>extended</b>, the class is reading these notes right now.
  </div>
</div>

{script}
</body>
</html>
'''

if __name__ == '__main__':
    sys.exit(main())
