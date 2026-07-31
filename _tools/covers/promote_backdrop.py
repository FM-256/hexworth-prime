#!/usr/bin/env python3
"""
BACKDROP PROMOTE — grade a curated staging backdrop and emit the three planes the hub renderer
expects.

Sibling to gen_backdrop.py, which only ever writes to staging/ and deliberately never touches
_app/. This is the promote half: a human picks a variant, this turns it into the shipped assets.

WHY THIS FILE EXISTS. The first backdrop shipped by running a per-pixel colour grade and two
blur passes in a throwaway heredoc. The output was committed; the recipe was not. Nancy caught
that the exact channel weights were gone, that gen_backdrop.py is explicitly multi-house
(`--only <slug>`), and that the next backdrop therefore had nothing to reuse and no protection
against double-grading an already-graded file. Re-running a grade on graded art is silent: it
just looks slightly more teal each time, with no error.

WHAT IT DOES, and why each step:
  1. GRADE toward the platform's cyan. The generator produces gorgeous warm/golden skies; the
     platform's accents and every hub cartridge are cyan. Ungraded, the backdrop and the content
     read as two different products. The shift is luminance-weighted, NOT a hue rotation:
     highlights keep their warmth -- that is what still makes it read as a real sun -- while
     midtones and shadows move teal, which is where the clouds live.
  2. PRE-BLUR the far and near planes into their own files. The hub applies NO runtime
     filter:blur(): a CSS blur on a full-viewport animated plane is re-rasterised every frame and
     measured at 11.8fps on a throttled CPU. Baking it in got that to 60fps. The blurred planes
     are also downscaled -- nothing is visible through a 26px blur and a smaller texture is
     cheaper to composite.
  3. STAMP the output so a second run is refused rather than silently double-graded.

usage:
  python3 _tools/covers/promote_backdrop.py --slug cloud-master --from backdrop-cloud-master-v2-3.webp
  python3 _tools/covers/promote_backdrop.py --slug cloud-master --from ... --force   # re-promote
  python3 _tools/covers/promote_backdrop.py --slug cloud-master --from ... --no-grade
"""
import os, sys, json, argparse, hashlib
from PIL import Image, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
STAGING = os.path.join(HERE, 'staging')
OUT_DIR = os.path.abspath(os.path.join(HERE, '../../_app/assets/images/backdrops'))
LEDGER = os.path.join(OUT_DIR, '.promoted.json')

# The grade, written down. These are the exact weights that produced the shipped cloud-master
# backdrop. Change them deliberately, not by accident.
GRADE = {
    'shadow_bias':  1.25,   # how fast the effect falls off as luminance rises
    'r_cut':        0.42,   # red pulled out of shadows/midtones
    'g_cut':        0.06,   # green barely touched -- it carries cloud form
    'g_lift':      10.0,
    'b_gain':       0.30,   # blue pushed in
    'b_lift':      26.0,
    'saturation':   1.08,
}
# far/near plane geometry: (blur radius at full size, downscale factor)
PLANES = {'far': (26, 0.5), 'near': (12, 0.75)}


def grade(im):
    px = im.load()
    w, h = im.size
    g = GRADE
    for y in range(h):
        for x in range(w):
            r, gg, b = px[x, y]
            lum = (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255.0
            k = max(0.0, 1.0 - lum * g['shadow_bias'])
            px[x, y] = (
                max(0, int(r * (1 - g['r_cut'] * k))),
                max(0, int(gg * (1 - g['g_cut'] * k) + g['g_lift'] * k)),
                min(255, int(b * (1 + g['b_gain'] * k) + g['b_lift'] * k)),
            )
    return ImageEnhance.Color(im).enhance(g['saturation'])


def load_ledger():
    try:
        with open(LEDGER) as f:
            return json.load(f)
    except Exception:
        return {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug', required=True, help='hub id, e.g. cloud-master')
    ap.add_argument('--from', dest='src', required=True, help='filename in staging/')
    ap.add_argument('--no-grade', action='store_true', help='promote the art untouched')
    ap.add_argument('--force', action='store_true', help='re-promote even if already promoted')
    a = ap.parse_args()

    src = a.src if os.path.isabs(a.src) else os.path.join(STAGING, a.src)
    if not os.path.exists(src):
        print(f'source not found: {src}', file=sys.stderr)
        sys.exit(2)

    ledger = load_ledger()
    prev = ledger.get(a.slug)
    if prev and not a.force:
        # THE DOUBLE-GRADE GUARD. Re-grading graded art produces no error and no obvious symptom;
        # it just drifts teal. Refuse, and say what was promoted before.
        print(f'REFUSING: {a.slug} was already promoted from {prev.get("source")} '
              f'on {prev.get("at", "?")}.', file=sys.stderr)
        print('Re-running would grade already-graded art. Pass --force if that is genuinely '
              'what you want, or --no-grade to promote untouched.', file=sys.stderr)
        sys.exit(3)

    im = Image.open(src).convert('RGB')
    print(f'  source : {os.path.basename(src)}  {im.width}x{im.height}')
    if not a.no_grade:
        im = grade(im)
        print(f'  graded : luminance-weighted toward cyan (weights in GRADE)')

    os.makedirs(OUT_DIR, exist_ok=True)
    base = os.path.join(OUT_DIR, a.slug + '.webp')
    im.save(base, 'WEBP', quality=88, method=6)
    print(f'  -> {os.path.relpath(base)}  {os.path.getsize(base)//1024}KB   (mid plane, sharp)')

    for name, (radius, scale) in PLANES.items():
        w, h = int(im.width * scale), int(im.height * scale)
        o = im.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius * scale))
        p = os.path.join(OUT_DIR, f'{a.slug}-{name}.webp')
        o.save(p, 'WEBP', quality=82, method=6)
        print(f'  -> {os.path.relpath(p)}  {w}x{h}  {os.path.getsize(p)//1024}KB   (pre-blurred)')

    with open(src, 'rb') as f:
        digest = hashlib.sha256(f.read()).hexdigest()[:16]
    ledger[a.slug] = {
        'source': os.path.basename(src),
        'sourceSha256': digest,
        'graded': (not a.no_grade),
        'at': __import__('datetime').datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
    }
    with open(LEDGER, 'w') as f:
        json.dump(ledger, f, indent=2, sort_keys=True)
        f.write('\n')
    print(f'  ledger : {os.path.relpath(LEDGER)} updated (guards against double-grading)')
    print(f'\nRemember: add "{a.slug}" to ENV_HUBS in _app/houses/hub/index.html for it to render.')


if __name__ == '__main__':
    main()
