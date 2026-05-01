#!/usr/bin/env python3
"""
Strip embedded quizzes from ethics chapter pages (eth-01.html .. eth-15.html).

Architecture violation: chapter pages mix lesson content + a chapter quiz in
one HTML file. Every other course separates these into presentations/ and
quizzes/ directories. This course already has weekly quizzes in quizzes/
(eth-w1, eth-w2, eth-w3) — the embedded chapter quizzes are redundant.

Per file:
1. Remove the <div class="ne-quiz" id="quizSection">...</div> block entirely.
2. Replace the .ne-complete-area block (which says "Pass the quiz to complete")
   with a simple "Mark Module Complete" button.
3. Replace the script block (everything from <script> after TenantShell.js
   include through its </script>) with a minimal completion-only script that
   calls ModuleProgress.complete() on click.
4. Save snapshot to /home/eq/hexworth-shared/eth-strip-quiz-2026-04-28/{file}.pre

Usage:
    python3 eth-strip-embedded-quiz.py eth-01            # dry run, single file
    python3 eth-strip-embedded-quiz.py eth-01 --execute  # apply
    python3 eth-strip-embedded-quiz.py --all             # dry run all 15
    python3 eth-strip-embedded-quiz.py --all --execute   # apply all 15
"""
import re
import sys
import os
import shutil
from pathlib import Path

ETH_DIR = Path('/home/eq/ai-content/hexworth-prime/_app/houses/divergent/ethics-it')
SNAP_DIR = Path('/home/eq/hexworth-shared/eth-strip-quiz-2026-04-28')
SNAP_DIR.mkdir(parents=True, exist_ok=True)

# Replacement complete-area block — uses ne-completion (the newer of the two
# wrapper class names used in this course). Both old wrapper classes —
# ne-complete-area and ne-completion — get replaced with this block.
NEW_COMPLETE_AREA = '''<div class="ne-completion">
            <button id="completeBtn" onclick="markModuleComplete()">Mark Module Complete</button>
            <p class="complete-note" id="completeNote">When you have read through this module, click to record completion. The weekly quiz covers content from this and the other modules in the week.</p>
        </div>'''

# Replacement script block. Keeps MODULE_HOUSE / MODULE_ID identifiers and the
# already-completed check on page load. Removes everything quiz-related.
def make_new_script(module_id):
    return f'''<script>
        var MODULE_HOUSE = 'divergent';
        var MODULE_ID    = '{module_id}';

        function markModuleComplete() {{
            if (typeof ModuleProgress !== 'undefined') {{
                ModuleProgress.complete(MODULE_HOUSE, MODULE_ID, {{ silent: true }});
            }}
            var btn = document.getElementById('completeBtn');
            btn.textContent = 'Module Complete';
            btn.disabled = true;
            btn.classList.add('is-done');
            document.getElementById('completeNote').textContent = 'Module progress recorded. Take the weekly quiz when you have completed all modules for the week.';
        }}

        (function () {{
            if (typeof ModuleProgress !== 'undefined' && ModuleProgress.isCompleted(MODULE_HOUSE, MODULE_ID)) {{
                var btn = document.getElementById('completeBtn');
                btn.textContent = 'Module Complete';
                btn.disabled = true;
                btn.classList.add('is-done');
                document.getElementById('completeNote').textContent = 'Module progress recorded.';
            }}
        }})();
    </script>'''

# ── Helpers ───────────────────────────────────────────────────────────────

def find_balanced_div_close(text, start_idx):
    """Given an index pointing AT a <div ...> opening, return the index just
    past the matching </div>. Counts nested <div> / </div> within."""
    depth = 0
    i = start_idx
    while i < len(text):
        # Look for next <div or </div
        next_open = text.find('<div', i)
        next_close = text.find('</div>', i)
        if next_close == -1:
            return -1
        if next_open != -1 and next_open < next_close:
            depth += 1
            i = next_open + 4
        else:
            depth -= 1
            i = next_close + 6
            if depth == 0:
                return i
    return -1

def strip_quiz(html, module_id):
    """Returns (new_html, changed_bool, notes)."""
    notes = []

    # 1. Remove the quizSection div + its <!-- Quiz --> comment marker (if present)
    quiz_pattern = re.compile(r'<div class="ne-quiz" id="quizSection"[^>]*>')
    m = quiz_pattern.search(html)
    if not m:
        notes.append('quizSection div not found — already stripped?')
    else:
        # Find the matching </div>
        end = find_balanced_div_close(html, m.start())
        if end == -1:
            notes.append('FATAL: could not find matching </div> for quizSection')
            return (html, False, notes)
        # Also remove the preceding <!-- Quiz... --> comment if present
        # Search backwards for any '<!-- Quiz' on the line(s) before
        comment_pattern = re.compile(r'<!--\s*Quiz[^>]*-->')
        # Look in the 200 chars before the div opening
        pre_text = html[max(0, m.start() - 300):m.start()]
        cm = comment_pattern.search(pre_text)
        strip_start = m.start()
        if cm:
            # Convert relative position back to absolute
            strip_start = max(0, m.start() - 300) + cm.start()
        # Trim trailing whitespace / newlines after the </div>
        post_idx = end
        while post_idx < len(html) and html[post_idx] in ' \t\n\r':
            post_idx += 1
        # Keep one newline of separation
        html = html[:strip_start] + html[end:]  # drop leading whitespace adjustment for now
        notes.append(f'Removed quiz section ({end - m.start()} chars)')

    # 2. Replace the complete-area block. Two generations of HTML structure:
    #   eth-01..07: <div class="ne-complete-area"> ... <p class="complete-note">
    #   eth-08..15: <div class="ne-completion">     ... <p class="ne-complete-note">
    # Button text varies: "Pass the quiz/checkpoint/midterm/assessment to complete"
    # — the regex doesn't constrain it.
    complete_pattern = re.compile(
        r'<div class="(?:ne-complete-area|ne-completion)">\s*'
        r'<button id="completeBtn"[^>]*>[^<]*</button>\s*'
        r'<p class="(?:complete-note|ne-complete-note)" id="completeNote">[^<]*</p>\s*'
        r'</div>',
        re.MULTILINE
    )
    n = complete_pattern.subn(NEW_COMPLETE_AREA, html)
    html = n[0]
    if n[1] == 0:
        notes.append('WARN: complete-area not matched (already updated?)')
    else:
        notes.append(f'Updated {n[1]} complete-area block(s)')

    # 3. Replace the inline quiz script. Variants:
    #   eth-01: separate `var QUIZ_ID = '...';` line
    #   eth-02..07: comma-separated `var MODULE_HOUSE = ..., QUIZ_ID = ..., ...;`
    #   eth-08..15: separate `var QUIZ_ID = '...';` line, often after a comment
    # Identify by presence of `QUIZ_ID =` (no `var` requirement — handles all forms).
    script_pattern = re.compile(
        r'<script>(?:(?!</script>).)*?QUIZ_ID\s*=.*?</script>',
        re.DOTALL
    )
    n = script_pattern.subn(make_new_script(module_id), html)
    html = n[0]
    if n[1] == 0:
        notes.append('WARN: quiz script block not matched (already updated?)')
    else:
        notes.append(f'Replaced {n[1]} script block(s)')

    return (html, True, notes)


def process(chapter, execute):
    src = ETH_DIR / f'{chapter}.html'
    if not src.exists():
        print(f'  [skip] {chapter}: not found')
        return
    html = src.read_text()

    new_html, changed, notes = strip_quiz(html, chapter)

    print(f'  {chapter}: {src.stat().st_size} bytes → {len(new_html.encode())} bytes')
    for n in notes:
        print(f'    · {n}')

    if not execute:
        return

    # Snapshot
    shutil.copy2(src, SNAP_DIR / f'{chapter}.html.pre')
    src.write_text(new_html)
    print(f'    ✓ Written ({SNAP_DIR / f"{chapter}.html.pre"} saved)')


def main():
    args = sys.argv[1:]
    execute = '--execute' in args
    all_flag = '--all' in args
    chapters = [a for a in args if not a.startswith('--')]

    if all_flag:
        chapters = [f'eth-{i:02d}' for i in range(1, 16)]
    if not chapters:
        print(__doc__)
        sys.exit(1)

    print('=' * 60)
    print(f'MODE: {"EXECUTE" if execute else "DRY RUN"}')
    print(f'Chapters: {", ".join(chapters)}')
    print('=' * 60)
    print()

    for ch in chapters:
        process(ch, execute)


if __name__ == '__main__':
    main()
