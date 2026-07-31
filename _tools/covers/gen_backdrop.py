#!/usr/bin/env python3
"""
BACKDROP generator (full-viewport environment art behind a hub page).

Third sibling to gen_cover.py and gen_section_banner.py, NOT a replacement for either:

  cover    512x512 square   -- the picture INSIDE a cartridge card (locked, gen_cover.py)
  banner   1536x512  3:1    -- a wide strip BEHIND a page section title
  backdrop 1920x1080 16:9   -- the ENVIRONMENT a whole page sits in

WHY THIS FILE EXISTS. The Cloud Master hub environment was first built by stretching the hub's
512x512 CARTRIDGE COVER across the viewport. Measured: a 3.7x upscale of a 24KB lossy square,
force-cropped to 16:9. The "sharp" focal plane physically could not be sharp, and no amount of
blur/opacity tuning fixed it -- the operator kept saying it looked off and was right twice. A
backdrop is its own asset class with its own geometry; reusing the cover was the actual defect.

COMPOSITION RULES that make a backdrop different from a cover, beyond size:
  - Interest at the EDGES, negative space through the middle third. A reading column sits there;
    art that puts its subject dead-centre fights the text forever.
  - Darker top and bottom so headers and footers stay legible without a heavy scrim. The scrim
    should be insurance, not the thing doing the work.
  - A clear near/mid/far read, because the page splits it into parallax planes. Flat art gives
    flat parallax.

Same hard rules as its siblings:
  - ORIGINAL, generic tech scenes only. No real brand, franchise, character, or copyrighted work.
  - NO embedded text / words / logos. The model garbles letterforms and the page renders its own.
  - Output lands in staging/ for HUMAN curation. Nothing auto-promotes to _app/.

Usage:
  python3 _tools/covers/gen_backdrop.py --dry-run                  # print prompts, zero fal calls
  python3 _tools/covers/gen_backdrop.py --only cloud-master --count 3
Output: _tools/covers/staging/backdrop-<slug>-<n>.webp  (1920x1080)
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

BACKDROP_W, BACKDROP_H = 1920, 1080

# The composition hint. Covers say "square composition"; banners ask for a horizontal sweep; a
# backdrop needs depth AND a deliberately quiet centre.
BACKDROP_HINT = (
    "wide cinematic establishing shot, deep three-dimensional depth with a clear foreground, "
    "midground and far background, strong atmospheric perspective, the subject matter arranged "
    "toward the left and right edges with calm uncluttered negative space through the centre of "
    "the frame, darker toward the top and bottom edges, volumetric haze, shallow depth of field "
    "with the midground in sharp focus, absolutely no text, no words, no letters, no logos"
)

BACKDROPS = {
    # slug: (house, subject)
    'cloud-master': ('cloud',
        "an endless luminous cloudscape at high altitude, colossal glowing circular platforms "
        "resting on the cloud tops at different distances, soft beams of light rising between "
        "them, a vast cloud horizon receding into atmospheric haze"),
    # Richer, more photographic treatment of the same world. The first pass read as a flat
    # illustration; this one asks for real sky physics -- sun position, god rays, cloud density
    # variation, layered strata at different altitudes -- so the parallax planes have genuinely
    # different content to separate rather than three copies of one flat image.
    'cloud-master-v2': ('cloud',
        "a breathtaking photographic aerial view above a dense sea of clouds at golden altitude, "
        "towering cumulus formations catching rim light, distant cloud banks in layered strata "
        "receding to a curved horizon, volumetric god rays breaking through gaps, faint glowing "
        "circular platforms half-hidden in the cloud tops far below, birds gliding as tiny distant "
        "silhouettes, rich atmospheric depth, photorealistic sky, cinematic"),
}


def gen(slug, house, subject, count, dry):
    accent = HOUSE_ACCENT.get(house, '')
    prompt = f"{subject}, {accent}, {STYLE}, {BACKDROP_HINT}"
    print(f"\n=== {slug} ({house}) ===")
    print(f"  {prompt[:300]}...")
    if dry:
        return 0
    made = 0
    for n in range(1, count + 1):
        out = os.path.join(STAGING, f"backdrop-{slug}-{n}.webp")
        try:
            result = fal_client.subscribe('fal-ai/flux/dev', {
                'prompt': prompt,
                'image_size': {'width': BACKDROP_W, 'height': BACKDROP_H},
                'num_images': 1,
            })
        except Exception as e:
            # Some endpoints reject custom sizes; fall back to the widest enum and letterbox-crop.
            print(f"    custom size rejected ({type(e).__name__}); falling back to landscape_16_9")
            result = fal_client.subscribe('fal-ai/flux/dev', {
                'prompt': prompt,
                'image_size': 'landscape_16_9',
                'num_images': 1,
            })
        url = result['images'][0]['url']
        raw = requests.get(url, timeout=120).content
        img = Image.open(io.BytesIO(raw)).convert('RGB')
        # Normalize to exactly 16:9 by centre-cropping the taller axis, then resize up/down.
        tw, th = BACKDROP_W, BACKDROP_H
        target = tw / th
        cur = img.width / img.height
        if cur > target:
            nw = int(img.height * target)
            img = img.crop(((img.width - nw) // 2, 0, (img.width + nw) // 2, img.height))
        elif cur < target:
            nh = int(img.width / target)
            img = img.crop((0, (img.height - nh) // 2, img.width, (img.height + nh) // 2))
        img = img.resize((tw, th), Image.LANCZOS)
        os.makedirs(STAGING, exist_ok=True)
        img.save(out, 'WEBP', quality=88, method=6)
        print(f"    -> {out}  ({img.width}x{img.height}, {os.path.getsize(out)//1024}KB)")
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
    want = [s.strip() for s in a.only.split(',') if s.strip()] or list(BACKDROPS)
    total = 0
    for slug in want:
        if slug not in BACKDROPS:
            print(f"  unknown backdrop slug: {slug}", file=sys.stderr)
            continue
        house, subject = BACKDROPS[slug]
        total += gen(slug, house, subject, a.count, a.dry_run)
    print(f"\n{total} backdrop(s) written to {STAGING}. Nothing auto-promotes: curate by hand.")


if __name__ == '__main__':
    main()
