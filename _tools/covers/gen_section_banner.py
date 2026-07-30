#!/usr/bin/env python3
"""
SECTION BANNER generator (wide art for page section headers, e.g. faq.html / about.html).

Sibling to gen_cover.py, NOT a replacement. The cover system is locked to SQUARE cartridge art
(gen_cover.py hardcodes a 512x512 resize) because a cover is the picture inside a cartridge card.
A section banner is a different asset class: a WIDE strip behind a page section's title. It reuses
gen_cover's locked STYLE + HOUSE_ACCENT so the whole platform stays one visual family.

Same hard rules as covers:
  - ORIGINAL, generic tech/security scenes only. No real brand, franchise, character, or
    copyrighted work.
  - NO embedded text / words / logos. The section title is rendered by the page, not drawn by the
    model (which garbles letterforms anyway).
  - Output lands in staging/ for HUMAN curation. Nothing auto-promotes to _app/.

Usage:
  python3 _tools/covers/gen_section_banner.py --dry-run             # print every prompt, no fal calls
  python3 _tools/covers/gen_section_banner.py --count 2             # 2 variations per section
  python3 _tools/covers/gen_section_banner.py --only live-labs,grading --count 3

Output: _tools/covers/staging/section-<slug>-<n>.webp  (1536x512, 3:1)
Promote by hand into _app/assets/images/sections/ once curated.
"""
import os, sys, io, time, argparse
try:
    import fal_client
except ImportError:
    print("fal_client not installed (pip install fal-client).", file=sys.stderr)
    sys.exit(2)
import requests
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_cover import STYLE, HOUSE_ACCENT, STAGING

# Target banner geometry. 3:1 reads well as a section header strip and survives CSS
# object-fit: cover at any card width.
BANNER_W, BANNER_H = 1536, 512

# Wide-composition hint. Covers say "square composition"; a banner needs the opposite, plus a
# clear horizontal sweep so the eye travels along the strip instead of hunting a center subject.
WIDE = ("ultra wide panoramic banner composition, cinematic letterbox framing, strong horizontal "
        "sweep, balanced negative space across the width")

# slug -> (house-for-accent, ORIGINAL generic scene)
# Accent discipline: the FAQ page's own accent is violet (--house-primary #9f7aea), so violet
# ('script') is the default and carries the page. Only sections whose subject genuinely reads
# better in another color get one, so 12 banners still look like one set.
SECTIONS = {
    "getting-started": ("script",
        "a threshold into a neon academy of technology, a glowing entry arch, luminous pathways branching toward distant lit halls, a figure stepping through"),
    "live-labs": ("cloud",
        "a real server room seen down a long cold aisle, humming racks with blinking status lights, glowing terminal windows floating before the hardware, cables and cooling haze"),
    "grading": ("key",
        "an automated verification chamber, glowing checkmarks and validation seals being stamped onto streams of submitted work, tamper-proof ledger of light"),
    "progress": ("script",
        "a luminous progress constellation, a saved checkpoint beacon syncing across multiple glowing devices, threads of light connecting them"),
    "houses": ("script",
        "a vast neon atrium of separate themed wings branching off a central hall, each corridor glowing a different color, banners of light"),
    "certs": ("key",
        "a hall of achievement, glowing credential seals and medallions floating in ranked tiers, a rising ladder of light toward a career horizon"),
    "fireflies": ("divergent",
        "drifting bioluminescent motes of light swarming through a dark digital forest of circuitry, gentle glowing life among data trees"),
    "games": ("code",
        "a neon arcade corridor, rows of glowing cabinets casting magenta light, a survival scoreboard of light, retro pixel glow"),
    "technical": ("web",
        "a diagnostics bay, glowing system readouts and error traces being untangled, a technician's holographic troubleshooting console"),
    "privacy": ("key",
        "a vault of personal data, glowing padlocks over private records, a shielded amber core with layered encryption rings"),
    "instructors": ("shield",
        "an instructor's command dais overlooking a lecture hall of glowing student stations, a roster wall of light, classroom telemetry"),
    "contact": ("script",
        "a signal relay tower sending glowing message pulses across a dark neon city, an open channel of light reaching outward"),
}


def build_banner_prompt(subject, house):
    accent = HOUSE_ACCENT.get(house, 'violet and cyan')
    # STYLE ends with the no-text guarantees; append WIDE before it so composition reads first,
    # then strip the square hint that STYLE carries for cartridge covers.
    style = STYLE.replace('square composition, ', '')
    return f"{subject}, {accent} neon accent lighting, {WIDE}, {style}"


def gen_banner(slug, subject, house, count):
    prompt = build_banner_prompt(subject, house)
    print(f'\nSLUG   : section-{slug}  [{house}]')
    print(f'PROMPT : {prompt}')
    for i in range(1, count + 1):
        print(f'  [{i}/{count}] generating...')
        try:
            result = fal_client.subscribe('fal-ai/flux/dev', {
                'prompt': prompt,
                'image_size': {'width': BANNER_W, 'height': BANNER_H},
                'num_images': 1,
                'seed': int(time.time()) + i * 7919,
            })
        except Exception as e:
            # Fallback: some endpoints reject custom sizes. Take the widest enum and center-crop.
            print(f'    custom size rejected ({type(e).__name__}); falling back to landscape_16_9 + crop')
            result = fal_client.subscribe('fal-ai/flux/dev', {
                'prompt': prompt,
                'image_size': 'landscape_16_9',
                'num_images': 1,
                'seed': int(time.time()) + i * 7919,
            })
        imgs = result.get('images') or []
        if not imgs:
            print('    no image in result:', str(result)[:200]); continue
        raw = requests.get(imgs[0]['url'], timeout=120).content
        img = Image.open(io.BytesIO(raw)).convert('RGB')
        # Normalize to exactly 3:1 by center-cropping the taller axis, then resize.
        tw, th = BANNER_W, BANNER_H
        if abs(img.width / img.height - tw / th) > 0.01:
            target_h = int(img.width * th / tw)
            if target_h <= img.height:
                top = (img.height - target_h) // 2
                img = img.crop((0, top, img.width, top + target_h))
            else:
                target_w = int(img.height * tw / th)
                left = (img.width - target_w) // 2
                img = img.crop((left, 0, left + target_w, img.height))
        img = img.resize((tw, th), Image.LANCZOS)
        out = os.path.join(STAGING, f'section-{slug}-{i}.webp')
        img.save(out, 'WEBP', quality=88, method=6)
        print(f'    -> {out}  ({img.width}x{img.height}, {os.path.getsize(out)//1024}KB)')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Generate wide section-header banner art into staging.')
    ap.add_argument('--count', type=int, default=2, help='variations per section')
    ap.add_argument('--only', default='', help='comma-separated slugs')
    ap.add_argument('--dry-run', action='store_true', help='print prompts, make no fal calls')
    a = ap.parse_args()

    todo = list(SECTIONS.items())
    if a.only:
        want = {s.strip() for s in a.only.split(',') if s.strip()}
        unknown = want - set(SECTIONS)
        if unknown:
            print('unknown slug(s):', ', '.join(sorted(unknown)), file=sys.stderr)
            sys.exit(2)
        todo = [(k, v) for k, v in todo if k in want]

    if a.dry_run:
        for slug, (house, subject) in todo:
            print(f'\nsection-{slug}  [{house}]\n  {build_banner_prompt(subject, house)}')
        print(f'\n{len(todo)} section(s), {a.count} variation(s) each = {len(todo)*a.count} images')
        sys.exit(0)

    if not os.environ.get('FAL_KEY'):
        print('FAL_KEY not set in this shell. It lives in ~/.bashrc; run from a login shell.', file=sys.stderr)
        sys.exit(2)
    os.makedirs(STAGING, exist_ok=True)
    for slug, (house, subject) in todo:
        gen_banner(slug, subject, house, a.count)
    print(f'\nDone. Curate {STAGING}, then promote chosen files to _app/assets/images/sections/')
