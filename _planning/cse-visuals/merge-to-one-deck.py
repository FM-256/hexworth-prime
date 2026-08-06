#!/usr/bin/env python3
"""
Merge cse-lecture-ch1..ch8.html into a single cse-lecture.html.

WHY THIS EXISTS
  Frank teaches the C|CSE lecture from eight separate files. Eight files means eight
  URLs to find mid-class, eight windows to close, and -- since the presenter view was
  added to ch1 only -- seven chapters with no second-screen support. One file fixes
  all three at once, and the presenter view comes along for free instead of being
  implemented eight times.

WHAT IT DOES AND DOES NOT DO
  MOVES content. Every <section class="slide"> is copied BYTE FOR BYTE out of its
  chapter file: the headings, the beats, the data-notes JSON, the image and video
  src attributes. No slide is authored, rewritten, reworded or re-illustrated here,
  and no new imagery is generated -- the decks already have their visuals.

  The only thing added to a slide is a data-ch="N" attribute, so the engine can tell
  which chapter a slide belongs to without re-deriving it from cover slides.

WHY IT READS THE EMITTED HTML RATHER THAN THE BUILDER
  _planning/cse-visuals/ch2-8/build-decks.py cannot re-emit: it imports its specs from
  a scratch directory under /tmp belonging to a session that has since been cleaned up
  (SCRATCH = /tmp/claude-1000/-home-eq/1eb9d697-.../scratchpad -- verified gone). The
  emitted HTML in _app is therefore the only surviving source of truth, so that is what
  this script reads. Do not "fix" this to call the builder without first restoring its
  specs.

SHELL PROVENANCE
  style  <- ch1. Verified a strict SUPERSET of the ch2-8 stylesheet: diffing the two
            <style> blocks yields 84 ch1-only lines and ZERO ch2-only lines, so one
            stylesheet renders all eight chapters exactly as they render today.
  engine <- ch1. Its slide engine is the ch2-8 engine plus the presenter view.
  .nav   <- kept a SIBLING of .app, as in ch1 after commit a28700098. The presenter CSS
            and the 18/18 sync test were both validated against that exact structure.
"""
import pathlib
import re
import sys

REPO = pathlib.Path('/home/eq/ai-content/hexworth-prime')
DECKS = REPO / '_app/houses/cloud/cse/instructor'
OUT = DECKS / 'cse-lecture.html'

# (chapter number, on-screen chapter title). Titles are read back out of each file's
# cover <h1> and asserted against this table, so a renamed chapter fails the build
# instead of silently shipping a stale label in the top bar.
CHAPTERS = [
    (1, 'What is Cloud?'),
    (2, 'Cloud Security Fundamentals'),
    (3, 'Identity and Access'),
    (4, 'Data Protection'),
    (5, 'Network Security'),
    (6, 'Application Security in Cloud'),
    (7, 'Monitoring and Incident Response'),
    (8, 'Risk and Governance'),
]

SECTION_RE = re.compile(r'<section class="slide.*?</section>', re.S)
H1_RE = re.compile(r'<h1>(.*?)</h1>', re.S)


def die(msg):
    print('MERGE ABORTED: ' + msg, file=sys.stderr)
    sys.exit(1)


def load_chapter(n, expected_title):
    """Return the chapter's slide sections, verbatim, with data-ch stamped on."""
    src = DECKS / f'cse-lecture-ch{n}.html'
    if not src.exists():
        die(f'{src} is missing')
    text = src.read_text()

    # Sections do not nest in these files (verified: <section> and </section> counts
    # match in all eight), which is what makes a non-greedy regex safe here.
    if text.count('<section') != text.count('</section>'):
        die(f'ch{n}: unbalanced <section> tags, refusing to extract')

    sections = SECTION_RE.findall(text)
    if not sections:
        die(f'ch{n}: no slides found')

    # The first slide of every chapter is its cover, and the cover carries the title.
    m = H1_RE.search(sections[0])
    if not m:
        die(f'ch{n}: first slide is not a cover (no <h1>)')
    found = m.group(1).strip()
    if found != expected_title:
        die(f'ch{n}: cover title is "{found}", table says "{expected_title}"')

    out = []
    for s in sections:
        # Only one slide in the whole merged deck may be active, and it is set below.
        s = s.replace('<section class="slide cover active"', '<section class="slide cover"')
        s = s.replace('<section class="slide active"', '<section class="slide"')
        # Stamp the chapter. Inserted right after the class attribute so the rest of
        # the tag -- crucially data-notes, whose JSON quoting differs between ch1 and
        # ch2-8 -- is never touched.
        s = re.sub(r'(<section class="slide[^"]*")', r'\1 data-ch="%d"' % n, s, count=1)
        out.append(s)
    return out


def main():
    ch1_text = (DECKS / 'cse-lecture-ch1.html').read_text()

    style_m = re.search(r'<style>.*?</style>', ch1_text, re.S)
    if not style_m:
        die('ch1: could not find the <style> block')
    style = style_m.group(0)

    # Sanity: the presenter view must actually be in the stylesheet we inherit,
    # otherwise the merged deck would ship a P key that renders nothing.
    for needle in ('body.presenter', '.pv-notes', '.pv-clock'):
        if needle not in style:
            die(f'ch1 stylesheet is missing {needle} -- presenter CSS not inherited')

    chapters = []
    for n, title in CHAPTERS:
        chapters.append((n, title, load_chapter(n, title)))

    total = sum(len(s) for _, _, s in chapters)
    print(f'slides per chapter: ' + ', '.join(f'ch{n}={len(s)}' for n, _, s in chapters))
    print(f'total slides: {total}')

    # Chapter start indices, zero-based, in final deck order.
    starts, i = [], 0
    for n, title, s in chapters:
        starts.append({'n': n, 'title': title, 'start': i, 'len': len(s)})
        i += len(s)

    js_chapters = ',\n    '.join(
        '{n: %d, start: %d, len: %d, title: %s}' % (
            c['n'], c['start'], c['len'], _js_str(c['title']))
        for c in starts
    )

    body = []
    for n, title, sections in chapters:
        body.append(f'\n    <!-- ══════ CHAPTER {n} · {title} ══════ -->\n')
        body.extend(sections)
    slides_html = '\n\n'.join(body)

    # Exactly one active slide: the very first cover.
    slides_html = slides_html.replace(
        '<section class="slide cover" data-ch="1"',
        '<section class="slide cover active" data-ch="1"', 1)

    out = TEMPLATE.format(
        style=style,
        slides=slides_html,
        chapters=js_chapters,
        total=total,
    )
    OUT.write_text(out)
    print(f'wrote {OUT} ({len(out)} bytes)')

    # Post-write assertions. A merge that silently drops a slide is the failure that
    # matters here, so count what actually landed on disk rather than what we intended.
    written = OUT.read_text()
    got = written.count('<section class="slide')
    if got != total:
        die(f'wrote {got} slides, expected {total}')
    if written.count('class="slide cover active"') != 1:
        die('merged deck does not have exactly one active slide')
    if written.count('<section') != written.count('</section>'):
        die('merged deck has unbalanced <section> tags')
    print(f'verified on disk: {got} slides, 1 active, sections balanced')


def _js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CSE Lecture &middot; All Chapters | CloudMaster</title>
<!--
  CSE LECTURE DECK -- ALL EIGHT CHAPTERS, ONE FILE

  GENERATED. Do not hand-edit: run _planning/cse-visuals/merge-to-one-deck.py, which
  re-reads cse-lecture-ch1..ch8.html and re-emits this file. Hand-patching here is lost
  the next time a chapter changes.

  WHY ONE FILE
    Eight files meant eight URLs mid-lecture and -- because the presenter view was only
    ever added to chapter 1 -- seven chapters with no second screen. Merging carries the
    presenter view to all eight at once rather than implementing it eight times.

  THE CHAPTERS ARE STILL SEPARATE
    Each chapter keeps its own cover slide, and every slide carries data-ch. The top bar
    names the chapter you are in, C opens a chapter menu, and ?ch=N opens the deck at a
    chapter -- which is how the instructor index links to each one.

  CONTENT IS MOVED, NOT REWRITTEN
    Every slide below was copied byte for byte out of its chapter file: headings, beats,
    data-notes, image and video sources. Nothing was authored or re-illustrated here.

  KEYS
    -> / space / PageDown   next        <- / PageUp   previous
    N   presenter notes on this screen  P   presenter view in a second window
    C   chapter menu                    F   fullscreen
    Home / End              first / last slide

  POSITIONING NOTE
    Everything is absolutely positioned inside .app (the 100vh box), never
    position:fixed -- fixed breaks whenever body.style.filter is set, per CLAUDE.md.
-->
{style}
<style>
    /* ── chapter menu ─────────────────────────────────────────
       absolute, not fixed -- same reason as .notes. Lives inside .app so the
       presenter window's "hide .app" rule takes it down with everything else. */
    .chapmenu {{
        position: absolute; inset: 0; z-index: 8; display: none;
        background: rgba(5,9,17,.955);
        padding: 60px 46px 46px;
        overflow-y: auto;
    }}
    .chapmenu.open {{ display: block; }}
    .chapmenu h3 {{
        font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase;
        color: var(--gold); margin: 0 0 18px; text-align: center;
    }}
    .chapmenu ol {{
        list-style: none; padding: 0; margin: 0 auto; max-width: 780px;
        display: grid; gap: 9px;
    }}
    .chapmenu button {{
        width: 100%; text-align: left; font: inherit; cursor: pointer;
        background: var(--panel); color: var(--ink);
        border: 1px solid var(--line); border-radius: 9px;
        padding: 13px 17px; display: flex; align-items: baseline; gap: 14px;
    }}
    .chapmenu button:hover {{ border-color: var(--accent); }}
    .chapmenu button.here {{ border-color: var(--gold); }}
    .chapmenu .num {{
        color: var(--gold); font-weight: 700; font-size: 12px;
        letter-spacing: .14em; text-transform: uppercase; flex: none; min-width: 74px;
    }}
    .chapmenu .ttl {{ font-size: 1.02rem; }}
    .chapmenu .cnt {{ margin-left: auto; color: var(--muted); font-size: 12px; flex: none; }}
    .chapmenu .dismiss {{ text-align: center; color: var(--muted); font-size: 11.5px; margin-top: 20px; }}

    /* Chapter name in the top bar, beside the deck title. */
    .bar .chap {{ color: var(--ink); font-weight: 400; text-transform: none; letter-spacing: 0; }}

    /* Presenter view: flag when the next slide starts a new chapter, so the
       instructor is not surprised by a cover landing on the projector. */
    .pv-next .nx-chap {{
        display: inline-block; margin-bottom: 9px; padding: 3px 9px; border-radius: 4px;
        background: rgba(255,216,107,.14); color: var(--gold);
        font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; font-weight: 700;
    }}
</style>
<script src="../../../../components/FirebaseAuth.js"></script>
<script src="../../../../components/FirestoreManager.js"></script>
<script src="../../../../components/AccessGuard.js"></script>
<script>AccessGuard.require('instructor');</script>
</head>
<body>
<div class="app">

  <div class="bar">
    <a href="../../instructor/index.html">&larr; Instructor Slides</a>
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


  <!-- Presenter view. Hidden entirely unless ?presenter=1, so the projected
     deck never renders any of this. -->
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
  <!-- MIRROR-MODE WARNING. No API reports whether the displays are mirrored or
     extended, so this cannot be detected and silently handled -- it has to be said
     out loud. On a mirrored setup this window IS the projector, notes and all, which
     is precisely the failure the presenter view exists to prevent. Better the
     instructor reads this before the lecture than discovers it from the room. -->
  <div class="pv-warn">
    Drag this window to your laptop screen before you begin. If your displays are
    <b>mirrored</b> rather than <b>extended</b>, the class is reading these notes right now.
  </div>
</div>

<script>
/* Slide engine. Deliberately tiny -- a lecture deck that fails mid-class because of a
   clever framework is worse than one with no features.

   Lifted from cse-lecture-ch1.html, plus chapter awareness. The presenter-view half is
   unchanged from the version that passed 18/18 in two real synced windows. */
const slides  = Array.from(document.querySelectorAll('.slide'));
const notesEl = document.getElementById('notes');
let idx = 0;

/* Emitted by the merge script from the actual per-chapter slide counts, so the
   chapter boundaries cannot drift from the slides that are really in the file. */
const CHAPTERS = [
    {chapters}
];

/* Which chapter a slide index falls in. Reads data-ch off the slide itself rather
   than recomputing from the boundary table, so the two can never disagree. */
function chapterOf(i) {{
    const n = parseInt(slides[i].dataset.ch || '0', 10);
    return CHAPTERS.find(c => c.n === n) || CHAPTERS[0];
}}

/* Single parser for data-notes, shared by the on-slide overlay and the
   presenter window. One place to be tolerant of a malformed note, so the two
   views can never disagree about what a slide says. Returns null on absent or
   unparseable notes; callers decide how to phrase that. */
function readNotes(i) {{
    const raw = slides[i] && slides[i].dataset.notes;
    if (!raw) return null;
    try {{ return JSON.parse(raw); }} catch (e) {{ return null; }}
}}

function renderNotes(i) {{
    const n = readNotes(i);
    const c = chapterOf(i);
    if (!n) {{
        notesEl.innerHTML = '<h3>Presenter notes</h3>' +
            '<p class="private">No notes for this slide.</p>';
        return;
    }}
    let html = '<h3>Presenter notes &middot; chapter ' + c.n +
               ' &middot; slide ' + (i - c.start + 1) + ' of ' + c.len + '</h3>';
    if (n.points && n.points.length) {{
        html += '<ul>' + n.points.map(p => '<li>' + p + '</li>').join('') + '</ul>';
    }}
    if (n.anchor) html += '<div class="anchor"><b>Class anchor:</b> &ldquo;' + n.anchor + '&rdquo;</div>';
    if (n.ask)    html += '<div class="askrm"><b>Ask the room:</b> &ldquo;' + n.ask + '&rdquo;</div>';
    html += '<p class="private">Visible on your screen only &mdash; press N to hide before you ask.</p>';
    notesEl.innerHTML = html;
}}

function show(i) {{
    idx = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle('active', k === idx));
    const c = chapterOf(idx);
    document.getElementById('chapLabel').textContent =
        'Chapter ' + c.n + ' \\u00b7 ' + c.title;
    document.getElementById('counter').textContent =
        (idx - c.start + 1) + ' / ' + c.len + '  \\u00b7  ' + (idx + 1) + ' of ' + slides.length;
    renderNotes(idx);
    renderPresenter(idx);   // no-op unless this window is the presenter
    broadcast(idx);         // keep the other window in step
    // restart any animation so the motion is showing when the slide lands, not
    // half-finished from a previous visit
    const v = slides[idx].querySelector('video');
    if (v) {{ try {{ v.currentTime = 0; v.play(); }} catch (e) {{}} }}
}}
function go(d) {{ show(idx + d); }}
function toggleNotes() {{ notesEl.classList.toggle('open'); }}

/* ── chapter menu ────────────────────────────────────────────────── */
const menuEl = document.getElementById('chapMenu');
function buildChapterList() {{
    const list = document.getElementById('chapList');
    list.innerHTML = '';
    CHAPTERS.forEach(c => {{
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = '<span class="num">Ch ' + c.n + '</span>' +
                      '<span class="ttl"></span>' +
                      '<span class="cnt">' + c.len + ' slides</span>';
        // Title via textContent, not innerHTML -- it is deck data, not markup.
        b.querySelector('.ttl').textContent = c.title;
        b.onclick = () => {{ closeMenu(); show(c.start); }};
        li.appendChild(b);
        list.appendChild(li);
    }});
}}
function markHere() {{
    const here = chapterOf(idx).n;
    [...document.querySelectorAll('#chapList button')].forEach((b, k) => {{
        b.classList.toggle('here', CHAPTERS[k].n === here);
    }});
}}
function openMenu()  {{ markHere(); menuEl.classList.add('open'); }}
function closeMenu() {{ menuEl.classList.remove('open'); }}
function toggleMenu() {{ menuEl.classList.contains('open') ? closeMenu() : openMenu(); }}

document.addEventListener('keydown', e => {{
    // While the chapter menu is up, digits jump to a chapter and Esc closes it.
    if (menuEl.classList.contains('open')) {{
        if (e.key === 'Escape') {{ e.preventDefault(); closeMenu(); return; }}
        const d = parseInt(e.key, 10);
        if (!isNaN(d)) {{
            const c = CHAPTERS.find(x => x.n === d);
            if (c) {{ e.preventDefault(); closeMenu(); show(c.start); return; }}
        }}
    }}
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {{ e.preventDefault(); go(1); }}
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {{ e.preventDefault(); go(-1); }}
    else if (e.key === 'Home') {{ e.preventDefault(); show(0); }}
    else if (e.key === 'End')  {{ e.preventDefault(); show(slides.length - 1); }}
    else if (e.key === 'n' || e.key === 'N') {{ toggleNotes(); }}
    else if (e.key === 'c' || e.key === 'C') {{ if (!IS_PV) toggleMenu(); }}
    else if (e.key === 'p' || e.key === 'P') {{ if (!IS_PV) openPresenter(); }}
    else if (e.key === 'f' || e.key === 'F') {{
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    }}
}});

/* ── PRESENTER VIEW ──────────────────────────────────────────────────
   Two windows, one file, one shared integer: the slide index.

   BroadcastChannel is the transport, with a localStorage fallback for
   browsers that lack it. Sync is BIDIRECTIONAL on purpose -- during a lecture
   you are looking at the presenter screen, so navigation has to work from
   there; a one-way feed would force you back to the projected window to
   advance, which is exactly the problem this is solving.

   `echo` guards the obvious loop: a window that receives an index applies it
   WITHOUT rebroadcasting, so the two cannot ping-pong.
   ──────────────────────────────────────────────────────────────────── */
const IS_PV = new URLSearchParams(location.search).get('presenter') === '1';

/* PAIRING TOKEN -- do not reduce this back to the pathname.
   When the eight chapters were eight files, keying the channel on location.pathname
   was enough: every chapter was a different path, so two windows could only ever
   collide if they were the same chapter. Merging into ONE file made every chapter
   share a pathname, and a bare-pathname channel then lets ANY second window on this
   deck drive the projected one. Caught in test: opening ?ch=7 in a third tab yanked
   the presenter window from chapter 5 to chapter 7 while the class deck stayed put.

   So the channel is scoped to a token that identifies ONE deck-plus-presenter pair.
   The deck mints it per browser tab (sessionStorage is per-tab, and survives a
   reload, so a refreshed deck keeps talking to its presenter); the presenter is told
   the token in its URL. A second tab of the same deck mints a different token and is
   therefore inaudible to the first pair -- which is the whole point. */
function pairToken() {{
    if (IS_PV) return new URLSearchParams(location.search).get('pair') || 'unpaired';
    let t = null;
    try {{ t = sessionStorage.getItem('cse-deck-pair'); }} catch (e) {{}}
    if (!t) {{
        t = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        try {{ sessionStorage.setItem('cse-deck-pair', t); }} catch (e) {{}}
    }}
    return t;
}}
const PAIR  = pairToken();
const CHAN  = 'cse-deck-' + location.pathname + '-' + PAIR;
let bc = null, echo = false;
try {{ bc = new BroadcastChannel(CHAN); }} catch (e) {{ bc = null; }}

function broadcast(i) {{
    if (echo) return;
    const msg = {{ i: i, from: IS_PV ? 'pv' : 'deck', t: Date.now() }};
    if (bc) {{ try {{ bc.postMessage(msg); }} catch (e) {{}} }}
    // Fallback: a storage event fires in OTHER tabs of the same origin.
    try {{ localStorage.setItem(CHAN, JSON.stringify(msg)); }} catch (e) {{}}
}}
function receive(msg) {{
    if (!msg || typeof msg.i !== 'number') return;
    if ((msg.from === 'pv') === IS_PV) return;   // ignore our own role
    echo = true;                                  // apply without rebroadcasting
    show(msg.i);
    echo = false;
}}
if (bc) bc.onmessage = e => receive(e.data);
addEventListener('storage', e => {{
    if (e.key !== CHAN || !e.newValue) return;
    try {{ receive(JSON.parse(e.newValue)); }} catch (err) {{}}
}});

function openPresenter() {{
    // Carry the current index in the URL. Without it the presenter window runs
    // show(0) on load, broadcasts 0, and yanks the projected deck back to the
    // first slide the moment you press P mid-lecture.
    // The pair token MUST travel with it, or the presenter joins a different channel
    // than this deck and the two windows never speak.
    const url = location.pathname + '?presenter=1&pair=' + encodeURIComponent(PAIR) +
                '&i=' + idx + location.hash;
    const w = window.open(url, 'cse-presenter', 'width=1100,height=760');
    if (!w) {{
        alert('The presenter window was blocked. Allow pop-ups for this site, then press P again.');
        return;
    }}
    // The class deck should never show notes while the presenter window is up --
    // that is the entire point of having a second screen.
    notesEl.classList.remove('open');
    closeMenu();
    w.focus();
}}

/* ── presenter rendering ─────────────────────────────────────────── */
function pvNotesHTML(i) {{
    const n = readNotes(i);
    if (!n) return '<h4>Presenter notes</h4><p style="color:#64748b">No notes on this slide.</p>';
    let h = '<h4>Presenter notes</h4>';
    if (n.points && n.points.length) h += '<ul>' + n.points.map(p => '<li>' + p + '</li>').join('') + '</ul>';
    if (n.anchor) h += '<div class="anchor"><b>Class anchor:</b> &ldquo;' + n.anchor + '&rdquo;</div>';
    if (n.ask)    h += '<div class="askrm"><b>Ask the room:</b> &ldquo;' + n.ask + '&rdquo;</div>';
    return h;
}}
function pvNextHTML(i) {{
    const nxt = slides[i + 1];
    if (!nxt) return '<h4>Up next</h4><p style="color:#64748b">End of deck.</p>';
    const h2 = nxt.querySelector('h2');
    const h1 = nxt.querySelector('h1');
    const beats = [...nxt.querySelectorAll('.beats span')].map(s => s.textContent.trim());
    const img = nxt.querySelector('.visual img');
    let h = '<h4>Up next &middot; slide ' + (i + 2) + '</h4>';
    // A cover landing on the projector means the chapter just turned over. Say so,
    // rather than letting the instructor find out from the room.
    const cNow = chapterOf(i), cNext = chapterOf(i + 1);
    if (cNext.n !== cNow.n) {{
        h += '<span class="nx-chap">Chapter ' + cNext.n + ' begins</span>';
    }}
    const ttl = document.createElement('div');
    ttl.className = 'nx-title';
    ttl.textContent = h2 ? h2.textContent : (h1 ? h1.textContent : 'Untitled');
    h += ttl.outerHTML;
    beats.forEach(b => {{
        const s = document.createElement('span');
        s.className = 'nx-beat';
        s.textContent = b;
        h += s.outerHTML;
    }});
    if (img) h += '<img src="' + img.getAttribute('src') + '" alt="">';
    return h;
}}
function renderPresenter(i) {{
    if (!IS_PV) return;
    const h2 = slides[i].querySelector('h2');
    const h1 = slides[i].querySelector('h1');
    const c = chapterOf(i);
    document.getElementById('pvTitle').textContent =
        h2 ? h2.textContent : (h1 ? h1.textContent : 'Cover');
    document.getElementById('pvPos').textContent =
        'Ch ' + c.n + ' \\u00b7 ' + c.title + ' \\u00b7 slide ' + (i - c.start + 1) +
        ' of ' + c.len + ' (' + (i + 1) + ' of ' + slides.length + ')';
    document.getElementById('pvNotes').innerHTML = pvNotesHTML(i);
    document.getElementById('pvNext').innerHTML  = pvNextHTML(i);
}}

if (IS_PV) {{
    document.body.classList.add('presenter');
    document.title = 'PRESENTER \\u2014 ' + document.title;
    document.getElementById('pvPrev').onclick  = () => go(-1);
    document.getElementById('pvNext2').onclick = () => go(1);
    // Elapsed-time clock. Instructors ask for this more than anything else:
    // it answers "am I running long" without looking away at a phone.
    let t0 = Date.now();
    document.getElementById('pvReset').onclick = () => {{ t0 = Date.now(); }};
    setInterval(() => {{
        const s = Math.floor((Date.now() - t0) / 1000);
        document.getElementById('pvClock').textContent =
            String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }}, 1000);
}}

buildChapterList();

/* Opening index, in precedence order:
     ?i=N   exact slide -- how the presenter window is told where the deck already is
     ?ch=N  chapter start -- how the instructor index links to a chapter
     0      the first cover
   The presenter window applies its index with echo set, so opening it never moves
   the projected slide. */
(function start() {{
    const q = new URLSearchParams(location.search);
    let at = 0;
    if (q.has('i')) {{
        const v = parseInt(q.get('i'), 10);
        if (!isNaN(v)) at = v;
    }} else if (q.has('ch')) {{
        const c = CHAPTERS.find(x => x.n === parseInt(q.get('ch'), 10));
        if (c) at = c.start;
    }}
    if (IS_PV) {{ echo = true; show(at); echo = false; }}
    else {{ show(at); }}
}})();
</script>
</body>
</html>
'''

if __name__ == '__main__':
    main()
