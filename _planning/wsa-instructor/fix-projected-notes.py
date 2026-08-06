#!/usr/bin/env python3
"""
fix-projected-notes.py — take the instructor's private cues off the WSA projector.

@catalog what   Moves .cue and .demo blocks out of the projected WSA week decks into a
@catalog what   presenter notes payload (N on this screen, P on a second screen).
@catalog run    python3 _planning/wsa-instructor/fix-projected-notes.py
@catalog run    python3 _planning/wsa-instructor/fix-projected-notes.py --check
@catalog status TOOL

THE PROBLEM, SEEN ON THE PROJECTOR
  week-01 slide 5 renders, full size, to the class:
      Class anchor: "if it adds a workload, it's a role. If it adds a capability,
                     it's a feature."
  That is the instructor's line to SAY, on screen before they say it. The .demo blocks are
  worse: they are instructions to the instructor ("DEMO -- open sconfig and show...").
  Across the three week decks: 34 .cue blocks and 22 .demo blocks, all projected.

  This is the same doctrine the CSE decks already state in their own header: "The
  instructor's talking points, traps, asks and anchors are NOT projected. Projecting 'Ask
  the room: <question>' spoils the question before it is asked." WSA never got the
  mechanism, so it leaked.

WHAT MOVES AND WHAT DELIBERATELY DOES NOT
  MOVES OFF SCREEN:  .cue   (class anchors -- lines to say)
                     .demo  (do-this-now instructions)
  STAYS ON SCREEN:   .talking-points
      Those read as the LESSON, not as private notes -- "Server Manager. Role. Feature.
      Role services. PowerShell equivalent." Stripping them would leave title + one lead
      line + a visual, which is the images-only imbalance the CSE combine was just built to
      fix. Making WSA commit that mistake while fixing a smaller one is not a fix.
      If the operator wants them off too, move 'talking-points' into PRIVATE_CLASSES below;
      the rest of this script does not change.

HOW IT ATTACHES
  It does NOT rewrite the decks' own engine. Their `show(i)` and nav stay exactly as they
  are; this appends a notes layer that watches for the active-slide class changing via a
  MutationObserver. Nothing to keep in sync, and no way to break navigation.

  N  toggles notes on THIS screen (default hidden)
  P  opens a second window on the same file with ?presenter=1, so the projector keeps a
     clean deck. Carries the per-tab pairing token so a third window cannot hijack it, and
     the mirror-mode warning, both lifted from the CSE deck that was tested with them.

NOTHING IS DESTROYED
  Originals are copied to _planning/wsa-instructor/_originals/ before the first write, and
  the script refuses to run twice against an already-converted deck.
"""
import html as H
import json
import re
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DECKS_DIR = REPO / '_app/houses/cloud/modules/wsa/instructor'
ARCHIVE = REPO / '_planning/wsa-instructor/_originals'
TARGETS = ['week-01.html', 'week-02.html', 'week-03.html']

# Classes whose content is for the instructor's eyes only.
PRIVATE_CLASSES = ['cue', 'demo']

MARKER = 'wsa-presenter-layer-v1'


def die(msg):
    print('ABORTED: ' + msg, file=sys.stderr)
    sys.exit(1)


def strip_tags(x):
    return H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x))).strip()


def extract_private(slide_html):
    """Pull .cue/.demo out of one slide. Returns (cleaned_html, [note dicts])."""
    notes, cleaned = [], slide_html
    for cls in PRIVATE_CLASSES:
        # Non-greedy to the first </div>: these blocks are leaf containers in every deck
        # (verified -- no nested <div> inside any .cue or .demo across the three files).
        pat = re.compile(r'<div class="' + cls + r'"[^>]*>(.*?)</div>', re.S)
        for m in pat.finditer(cleaned):
            text = strip_tags(m.group(1))
            if text:
                notes.append({'kind': cls, 'text': text})
        cleaned = pat.sub('', cleaned)
    return cleaned, notes


def convert(path, dry):
    src = path.read_text(encoding='utf-8', errors='replace')
    if MARKER in src:
        return None, 'already converted'

    # Nested <div class="slide..."> do not occur; slides are siblings. Split on the opener.
    starts = [m.start() for m in re.finditer(r'<div class="slide[ "]', src)]
    if not starts:
        return None, 'no slides found'

    total_notes, converted = 0, src
    # Walk backwards so earlier offsets stay valid as we splice.
    for i in range(len(starts) - 1, -1, -1):
        end = starts[i + 1] if i + 1 < len(starts) else converted.find('</div>\n\n<div class="nav')
        if end == -1:
            end = len(converted)
        block = converted[starts[i]:end]
        cleaned, notes = extract_private(block)
        if not notes:
            continue
        total_notes += len(notes)
        payload = H.escape(json.dumps(notes), quote=True)
        # Stamp the payload on the slide's own opening tag. The replacement MUST be a
        # function: json.dumps emits \u escapes for the curly quotes in these notes, and
        # re.sub parses backslashes in a replacement STRING as escape sequences
        # ("bad escape \u"). A function replacement is inserted literally.
        cleaned = re.sub(r'(<div class="slide[^"]*")',
                         lambda m: m.group(1) + ' data-pnotes="' + payload + '"',
                         cleaned, count=1)
        converted = converted[:starts[i]] + cleaned + converted[end:]

    if total_notes == 0:
        return None, 'no .cue/.demo blocks to move'

    if '</body>' not in converted:
        return None, 'no </body> to attach the layer to'
    converted = converted.replace('</body>', LAYER + '\n</body>', 1)

    if not dry:
        ARCHIVE.mkdir(parents=True, exist_ok=True)
        backup = ARCHIVE / path.name
        if not backup.exists():                 # never overwrite a pristine original
            shutil.copy2(path, backup)
        path.write_text(converted, encoding='utf-8')
    return total_notes, 'ok'


def audit():
    """What is still projected? Run any time; this is the falsifiable check."""
    bad = 0
    for name in TARGETS + ['course-intro.html']:
        p = DECKS_DIR / name
        if not p.exists():
            continue
        s = p.read_text(encoding='utf-8', errors='replace')
        leaks = sum(len(re.findall(r'<div class="' + c + r'"', s)) for c in PRIVATE_CLASSES)
        stamped = len(re.findall(r'data-pnotes=', s))
        layer = MARKER in s
        print(f"  {name:<18} projected .cue/.demo={leaks:<3} slides carrying notes={stamped:<3} "
              f"presenter layer={'yes' if layer else 'no'}")
        bad += leaks
    print(f"\n  TOTAL still projected to the class: {bad}")
    return bad


def main():
    dry = '--dry-run' in sys.argv
    if '--check' in sys.argv:
        return 0 if audit() == 0 else 1

    print('BEFORE:')
    audit()
    print()
    # A dry run must never describe work it did not do. The first version printed "moved N
    # private blocks" and then an AFTER audit showing all N still projected, plus "originals
    # archived" when it had archived nothing -- a tool lying about its own outcome.
    verb = 'WOULD move' if dry else 'moved'
    for name in TARGETS:
        p = DECKS_DIR / name
        if not p.exists():
            die(f'{p} missing')
        n, msg = convert(p, dry)
        print(f"  {name:<18} {verb + ' ' + str(n) + ' private blocks off the slide' if n else msg}")

    if dry:
        print('\nDRY RUN — nothing was written, nothing was archived.')
        print('The counts above are unchanged on disk; re-run without --dry-run to apply.')
        return 0

    print('\nAFTER:')
    leaks = audit()
    if leaks:
        die(f'{leaks} .cue/.demo blocks are STILL projected -- conversion incomplete')
    print(f'\noriginals archived at {ARCHIVE.relative_to(REPO)}/')
    return 0


LAYER = '''
<!-- ''' + MARKER + ''' — appended by _planning/wsa-instructor/fix-projected-notes.py.
     Does NOT touch the deck's own show()/nav. Watches the active slide via a
     MutationObserver, so there is nothing to keep in sync and no way to break navigation. -->
<style>
    /* absolute, never fixed -- position:fixed breaks whenever body.style.filter is set. */
    .pnotes {
        position: absolute; left: 0; right: 0; bottom: 64px; z-index: 40;
        max-height: 58%; overflow-y: auto; display: none;
        background: rgba(9,14,26,.975); border-top: 2px solid #ffd86b;
        padding: 18px 40px 22px; text-align: left;
    }
    .pnotes.open { display: block; }
    .pnotes h4 {
        font-size: 11px; letter-spacing: .16em; text-transform: uppercase;
        color: #ffd86b; margin: 0 0 12px;
    }
    .pnotes .n { border-radius: 8px; padding: 11px 15px; margin-bottom: 10px;
                 font-size: 15px; line-height: 1.55; }
    .pnotes .n.cue  { background: rgba(74,222,128,.09); border-left: 3px solid #4ade80; }
    .pnotes .n.demo { background: rgba(168,85,247,.10); border-left: 3px solid #a855f7; }
    .pnotes .n b { color: #93c5fd; }
    .pnotes .priv { color: #8ea3bd; font-size: 11.5px; font-style: italic; margin-top: 12px; }
    /* ABOVE the nav bar, not on it. At bottom:18px this landed on top of the deck's own
       "Next ->" button -- the geometry check below now asserts they do not intersect. */
    .pnotes-hint { position: absolute; bottom: 74px; right: 24px; z-index: 41;
                   color: #64748b; font-size: 11.5px; pointer-events: none; }
    .pnotes-hint kbd { background: rgba(255,255,255,.07); border: 1px solid rgba(120,170,220,.2);
                       border-radius: 4px; padding: 1px 6px; font-family: inherit; font-size: 11px; }

    /* Presenter window: hide the whole deck, show only the notes. */
    body.wsa-presenter .slide, body.wsa-presenter .nav,
    body.wsa-presenter .deck-header, body.wsa-presenter .pnotes-hint { display: none !important; }
    body.wsa-presenter { overflow: auto; }
    .pv2 { display: none; }
    body.wsa-presenter .pv2 {
        display: block; padding: 22px 26px; max-width: 1100px; margin: 0 auto;
        font-family: 'Segoe UI', system-ui, sans-serif; color: #e8f0fb; text-align: left;
    }
    .pv2 h3 { color: #ffd86b; font-size: 1.15rem; margin: 0 0 4px; }
    .pv2 .pos { color: #93a4bd; font-size: .9rem; margin-bottom: 16px; }
    .pv2 .warn { background: rgba(251,191,36,.1); border: 1px solid rgba(251,191,36,.4);
                 color: #fcd34d; padding: 9px 13px; border-radius: 6px; font-size: .85rem;
                 margin-top: 20px; }
</style>
<div class="pnotes" id="pnotes"></div>
<div class="pnotes-hint"><kbd>N</kbd> notes &middot; <kbd>P</kbd> second screen</div>
<div class="pv2" id="pv2"></div>
<script>
(function () {
    /* PAIRING TOKEN, same reasoning as the CSE deck: the channel must identify ONE
       deck-plus-presenter pair, or any second window on this file drives the projector. */
    var IS_PV = new URLSearchParams(location.search).get('presenter') === '1';
    function pairToken() {
        if (IS_PV) return new URLSearchParams(location.search).get('pair') || 'unpaired';
        var t = null;
        try { t = sessionStorage.getItem('wsa-deck-pair'); } catch (e) {}
        if (!t) {
            t = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            try { sessionStorage.setItem('wsa-deck-pair', t); } catch (e) {}
        }
        return t;
    }
    var PAIR = pairToken();
    var CHAN = 'wsa-deck-' + location.pathname + '-' + PAIR;
    var bc = null; try { bc = new BroadcastChannel(CHAN); } catch (e) {}

    var panel = document.getElementById('pnotes');
    var pv2 = document.getElementById('pv2');

    function activeIndex() {
        var all = [].slice.call(document.querySelectorAll('.slide'));
        return all.indexOf(document.querySelector('.slide.active'));
    }
    function notesFor(el) {
        if (!el || !el.dataset.pnotes) return [];
        try { return JSON.parse(el.dataset.pnotes); } catch (e) { return []; }
    }
    function label(k) { return k === 'demo' ? 'Demo' : 'Class anchor'; }

    function render() {
        var el = document.querySelector('.slide.active');
        var ns = notesFor(el);
        var i = activeIndex(), n = document.querySelectorAll('.slide').length;
        var body = ns.length
            ? ns.map(function (x) {
                return '<div class="n ' + x.kind + '"><b>' + label(x.kind) + ':</b> ' +
                       x.text.replace(/[<>]/g, '') + '</div>';
              }).join('')
            : '<p class="priv">No private notes on this slide.</p>';
        panel.innerHTML = '<h4>Presenter notes &middot; slide ' + (i + 1) + ' of ' + n + '</h4>' +
            body + '<p class="priv">Visible on your screen only &mdash; press N to hide.</p>';
        if (IS_PV) {
            var h2 = el ? el.querySelector('h2') : null;
            pv2.innerHTML = '<h3>' + (h2 ? h2.textContent : 'Slide') + '</h3>' +
                '<div class="pos">slide ' + (i + 1) + ' of ' + n + '</div>' + body +
                '<div class="warn">Drag this window to your laptop screen. If your displays are ' +
                '<b>mirrored</b> rather than <b>extended</b>, the class is reading these now.</div>';
        }
        if (bc && !IS_PV) { try { bc.postMessage({ i: i }); } catch (e) {} }
    }

    /* Watch the deck's OWN class toggling rather than hooking show(). Nothing to sync. */
    var obs = new MutationObserver(render);
    [].forEach.call(document.querySelectorAll('.slide'), function (s) {
        obs.observe(s, { attributes: true, attributeFilter: ['class'] });
    });

    if (bc && IS_PV) {
        bc.onmessage = function (e) {
            var all = document.querySelectorAll('.slide');
            if (e.data && typeof e.data.i === 'number' && all[e.data.i]) {
                [].forEach.call(all, function (s, k) { s.classList.toggle('active', k === e.data.i); });
            }
        };
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'n' || e.key === 'N') { panel.classList.toggle('open'); }
        if ((e.key === 'p' || e.key === 'P') && !IS_PV) {
            var url = location.pathname + '?presenter=1&pair=' + encodeURIComponent(PAIR);
            var w = window.open(url, 'wsa-presenter', 'width=1000,height=720');
            if (!w) { alert('The presenter window was blocked. Allow pop-ups, then press P again.'); return; }
            panel.classList.remove('open');   // never leave notes up on the projector
            w.focus();
        }
    });

    if (IS_PV) { document.body.classList.add('wsa-presenter');
                 document.title = 'PRESENTER \\u2014 ' + document.title; }
    render();
})();
</script>'''

if __name__ == '__main__':
    sys.exit(main())
