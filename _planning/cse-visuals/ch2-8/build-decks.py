#!/usr/bin/env python3
"""
Emit cse-lecture-ch2..ch8.html from the approved CH1 pattern.

The CSS and the slide engine are LIFTED VERBATIM from cse-lecture-ch1.html rather than
retyped, so all eight decks cannot drift apart. CH1 is the reviewed artifact; if its
layout is fixed later, this script re-emits the rest from the corrected source.

Content comes from the companion deck (already extracted to ch-content.json): the
talking points, class anchors and ask-the-room prompts become PRESENTER NOTES, never
projected text. The short on-screen beats are authored per slide in ch2-8-specs.py.
"""
import html as H
import json
import pathlib
import re
import shutil

REPO = pathlib.Path('/home/eq/ai-content/hexworth-prime')
SCRATCH = pathlib.Path('/tmp/claude-1000/-home-eq/1eb9d697-6d75-4472-8907-c09dccba6344/scratchpad')
DECKS = REPO / '_app/houses/cloud/cse/instructor'
ASSETS = REPO / '_app/assets/images/cse-lecture'

import sys
sys.path.insert(0, str(SCRATCH))
from ch2_8_specs import SPECS, REUSED

CH1 = (DECKS / 'cse-lecture-ch1.html').read_text()
STYLE = re.search(r'<style>.*?</style>', CH1, re.S).group(0)
SCRIPT = re.search(r'<script>\n/\* Slide engine.*?</script>', CH1, re.S).group(0)

CHAPTERS = {
    'CH2': ('Cloud Security Fundamentals', 'Same attackers, same goals &mdash; a different terrain.'),
    'CH3': ('Identity and Access', 'The control plane has one front door, and it is identity.'),
    'CH4': ('Data Protection', 'The data is yours in every service model. So is the key question.'),
    'CH5': ('Network Security', 'The network stopped being a wall and became a blast radius.'),
    'CH6': ('Application Security in Cloud', 'The code is yours everywhere. There is nowhere to delegate this.'),
    'CH7': ('Monitoring and Incident Response', 'Cloud records everything, and destroys evidence just as fast.'),
    'CH8': ('Risk and Governance', 'Where the whole course is finally cashed in.'),
}

content = json.loads((SCRATCH / 'ch-content.json').read_text())


def notes_json(slide):
    """Talking points + anchor/ask/demo -> the data-notes payload. These are the things that
    must NOT be projected; the whole point of the presenter panel."""
    def clean(s):
        # strip the leading bold label the companion deck uses inside cue/ask/demo divs
        return re.sub(r'^(Class anchor:|Ask the room:|Demo cue:|Demo:)\s*', '', s).strip().strip('"')
    payload = {'points': [p for p in slide['points'] if p]}
    if slide.get('table'):
        payload['points'] += [t for t in slide['table'][1:] if t]
    if slide.get('cue'):
        payload['anchor'] = clean(slide['cue'])
    if slide.get('ask'):
        payload['ask'] = clean(slide['ask'])
    if slide.get('demo'):
        payload['points'].append('DEMO — ' + clean(slide['demo']))
    return H.escape(json.dumps(payload), quote=True)


def build(mod):
    title, subtitle = CHAPTERS[mod]
    n = int(mod[2])
    slides = content[mod]
    out = [f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CSE Lecture &middot; Chapter {n} | CloudMaster</title>
<!--
  CSE LECTURE DECK -- CHAPTER {n} ({title})

  Generated from the approved CH1 pattern by _planning/cse-visuals/build-decks.py. The CSS and
  slide engine are lifted verbatim from cse-lecture-ch1.html so the eight decks cannot drift.
  Edit the builder and re-emit rather than hand-patching one chapter.

  This is a PROJECTION deck, not a reading deck: the visual owns the slide, on-screen text is a
  title plus two or three beats, and every talking point, trap, class anchor and ask-the-room
  prompt lives in the presenter panel (press N) where the class cannot see it.
-->
{STYLE}
<script src="../../../../components/FirebaseAuth.js"></script>
<script src="../../../../components/FirestoreManager.js"></script>
<script src="../../../../components/AccessGuard.js"></script>
<script>AccessGuard.require('instructor');</script>
</head>
<body>
<div class="app">

  <div class="bar">
    <a href="../../instructor/index.html">&larr; Instructor Slides</a>
    <span class="mid">EC-Council C|CSE &middot; Lecture &middot; Chapter {n}</span>
    <span class="right" id="counter"></span>
  </div>

  <div class="stage" id="stage">

    <section class="slide cover active">
      <div class="eyebrow">Chapter {n} &middot; EC-Council C|CSE</div>
      <h1>{title}</h1>
      <p class="tag">{subtitle}</p>
    </section>
''']

    for i, s in enumerate(slides, 1):
        slug = f'ch{n}-{i:02d}-'
        match = [k for k in list(SPECS) + list(REUSED) if k.startswith(slug)]
        if not match:
            raise SystemExit(f'no visual spec for {mod} slide {i}: {s["title"]}')
        key = match[0]
        if key in REUSED:
            src, beats = REUSED[key]
        else:
            src, beats = f'/assets/images/cse-lecture/ch{n}/{key}.webp', SPECS[key][1]
        alt = H.escape(re.sub(r'\s+', ' ', SPECS[key][0].split('\n')[0]) if key in SPECS
                       else 'Illustrated scene for ' + s['title'], quote=True)
        beat_html = '\n        '.join(
            f'<span{" class=\"key\"" if j == len(beats) - 1 else ""}>{b}</span>'
            for j, b in enumerate(beats))
        out.append(f'''
    <section class="slide" data-notes="{notes_json(s)}">
      <h2>{s['title']}</h2>
      {f'<p class="sub">{s["sub"]}</p>' if s.get('sub') else ''}
      <div class="visual">
        <img src="{src}" alt="{alt}">
      </div>
      <div class="beats">
        {beat_html}
      </div>
    </section>
''')

    out.append(f'''
  </div>

  <div class="notes" id="notes"></div>

  <div class="nav">
    <button onclick="go(-1)">&larr; Prev</button>
    <span class="hint">
      <kbd>&larr;</kbd> <kbd>&rarr;</kbd> move &nbsp;&middot;&nbsp;
      <kbd>N</kbd> presenter notes &nbsp;&middot;&nbsp; <kbd>F</kbd> fullscreen
    </span>
    <button onclick="go(1)">Next &rarr;</button>
  </div>

</div>

{SCRIPT}
</body>
</html>
''')
    return ''.join(out)


built = []
for mod in ('CH2', 'CH3', 'CH4', 'CH5', 'CH6', 'CH7', 'CH8'):
    n = int(mod[2])
    (ASSETS / f'ch{n}').mkdir(parents=True, exist_ok=True)
    for key in SPECS:
        if key.startswith(f'ch{n}-'):
            shutil.copy(SCRATCH / f'{key}.webp', ASSETS / f'ch{n}' / f'{key}.webp')
    path = DECKS / f'cse-lecture-ch{n}.html'
    path.write_text(build(mod))
    built.append((path.name, len(content[mod]) + 1, path.stat().st_size // 1024))

for name, slides, kb in built:
    print(f'  {name:24s} {slides} slides  {kb} KB')
