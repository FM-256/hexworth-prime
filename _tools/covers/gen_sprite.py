#!/usr/bin/env python3
"""
SPRITE generator — small transparent-background graphics (birds, motes, drifting objects) that
animate over a backdrop.

Fourth sibling in this family, and it uses the vocabulary already locked in
_docs/operations/visual-asset-taxonomy.md rather than inventing a word:

  cover    512x512 square    the picture INSIDE a cartridge card      (gen_cover.py)
  banner   1536x512  3:1     a wide strip behind a section title      (gen_section_banner.py)
  backdrop 1920x1080 16:9    the environment a whole page sits in     (gen_backdrop.py)
  sprite   small, ALPHA      an animation frame that moves over it    (this file)

WHY THIS EXISTS. The Cloud Master hub's birds were hand-authored SVG paths. Next to a
photographic sky containing real bird silhouettes they read as crude marks -- the operator's
verdict on the second attempt was "oh no!!! that is worse". A drawn chevron cannot sit beside a
photograph; the sprite has to come from the same kind of source the backdrop did.

THE ALPHA STEP IS THE WHOLE JOB. flux returns opaque RGB. Asking for "on a plain white
background" and keying white to transparent is what turns that into a usable sprite. The key is
luminance-based with a soft edge so wingtips do not get a hard jagged cut, and every frame is
trimmed to its own content box so the poses can be swapped without the bird appearing to jump.

Same hard rules as its siblings:
  - ORIGINAL, generic subjects only. No real brand, franchise, or copyrighted character.
  - NO text, words or logos.
  - Output lands in staging/ for HUMAN curation. Nothing auto-promotes to _app/.

usage:
  python3 _tools/covers/gen_sprite.py --dry-run
  python3 _tools/covers/gen_sprite.py --only bird --count 3
Output: _tools/covers/staging/sprite-<slug>-<pose>-<n>.png   (RGBA, trimmed)
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
from gen_cover import STAGING

# Deliberately NOT gen_cover's neon-noir STYLE. A sprite that has to key cleanly to alpha needs a
# flat, high-contrast subject on empty background -- the cinematic grading that makes covers work
# is exactly what makes a silhouette impossible to cut out.
SPRITE_STYLE = (
    "solid black silhouette, flat, high contrast, crisp clean edges, centered, "
    "isolated on a pure plain white background, no shadow, no ground, no scenery, "
    "no text, no words, no logo, simple graphic shape"
)

SPRITES = {
    'bird': [
        ('up',   "a single bird in flight seen from the side, wings raised high above its body in "
                 "the upstroke of a wingbeat, wingtips pointing up, slender body, tail visible"),
        ('mid',  "a single bird in flight seen from the side, wings extended straight out "
                 "horizontally in a glide, full wingspan, slender body, tail visible"),
        ('down', "a single bird in flight seen from the side, wings swept down below its body in "
                 "the downstroke of a wingbeat, wingtips pointing down, slender body, tail visible"),
    ],
}


def key_to_alpha(img, thresh=200, soft=40):
    """White background -> transparent, with a soft edge, then trim to content.

    Hard-thresholding produces jagged wingtips at the scale these render (40px), which reads as
    a compression artefact. The soft band ramps alpha across `soft` luminance levels instead.
    """
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            lum = (r * 299 + g * 587 + b * 114) // 1000
            if lum >= thresh:
                a = 0
            elif lum >= thresh - soft:
                a = int(255 * (thresh - lum) / soft)
            else:
                a = 255
            # Silhouettes are meant to be dark; force the colour so off-white fringes do not
            # survive as grey halos around the shape.
            px[x, y] = (10, 20, 30, a)
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def gen(slug, poses, count, dry):
    made = 0
    for pose, subject in poses:
        prompt = f"{subject}, {SPRITE_STYLE}"
        print(f"\n=== {slug}/{pose} ===")
        print(f"  {prompt[:200]}...")
        if dry:
            continue
        for n in range(1, count + 1):
            out = os.path.join(STAGING, f"sprite-{slug}-{pose}-{n}.png")
            result = fal_client.subscribe('fal-ai/flux/dev', {
                'prompt': prompt, 'image_size': 'square', 'num_images': 1,
            })
            raw = requests.get(result['images'][0]['url'], timeout=120).content
            img = key_to_alpha(Image.open(io.BytesIO(raw)))
            os.makedirs(STAGING, exist_ok=True)
            img.save(out, 'PNG', optimize=True)
            print(f"    -> {out}  ({img.width}x{img.height}, {os.path.getsize(out)//1024}KB, RGBA)")
            made += 1
            time.sleep(1)
    return made


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--count', type=int, default=3)
    ap.add_argument('--only', default='')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    if not a.dry_run and not os.environ.get('FAL_KEY'):
        print('FAL_KEY not set.', file=sys.stderr)
        sys.exit(2)
    want = [s.strip() for s in a.only.split(',') if s.strip()] or list(SPRITES)
    total = 0
    for slug in want:
        if slug not in SPRITES:
            print(f"  unknown sprite slug: {slug}", file=sys.stderr)
            continue
        total += gen(slug, SPRITES[slug], a.count, a.dry_run)
    print(f"\n{total} sprite frame(s) in {STAGING}. Nothing auto-promotes: curate by hand.")


if __name__ == '__main__':
    main()
