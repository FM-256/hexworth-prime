#!/usr/bin/env python3
"""
Hub cartridge COVER generator (cover-cartridge system).

Offline tool. Reads FAL_KEY from the shell env (the key NEVER goes to the browser). Generates
neon-noir cartridge cover ART via fal-ai/flux/dev into a STAGING dir for human curation; a
separate promote step (build-manifest, below) moves the chosen variation into the gallery.

THE LOOK (locked): cinematic neon-noir / cyberpunk SCENE, square, cohesive family. Covers carry
NO embedded text / words / logos, the title is added by the card, and cert marks are composited
separately from our OWN assets (never AI-drawn). Prompts describe ORIGINAL, generic tech/security
scenes only; do not reference any real brand, franchise, character, or copyrighted work.

Usage:
  # anthology cover (pure scene), 3 variations
  python3 _tools/covers/gen_cover.py linux-mastery \
      "a lone hooded figure at a glowing terminal in a dark neon server corridor, cascading code" \
      --house script --count 3
  # cert-themed SCENE (the cert mark is composited later, NOT drawn here)
  python3 _tools/covers/gen_cover.py aplus-core1 \
      "a technician's neon-lit hardware repair bench, open PC chassis, circuit boards, diagnostic glow" \
      --house forge --count 3

Output: _tools/covers/staging/<slug>-1.webp ... (curate the best, then run build-manifest.py to promote)
"""
import os, sys, io, time, argparse
try:
    import fal_client
except ImportError:
    print("fal_client not installed (pip install fal-client). Same dep the existing gen-*.py scripts use.", file=sys.stderr)
    sys.exit(2)
import requests
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
STAGING = os.path.join(HERE, 'staging')

# Locked style. "no text/words/logos" keeps covers clean (title added by the card) and stops the
# model garbling any mark; the cert mark is composited on top later from our own asset.
STYLE = ("cinematic neon-noir cyberpunk digital illustration, dark moody atmosphere, dramatic "
         "volumetric neon rim lighting, high contrast, deep blacks with vivid neon accents, highly "
         "detailed, atmospheric poster art, square composition, absolutely no text, no words, no "
         "letters, no logos, no watermark, no signature")

# House color accents (from games.html .game-card[data-house] palette) so a cover reads on-theme.
HOUSE_ACCENT = {
    'web': 'electric blue', 'script': 'violet purple', 'key': 'gold amber', 'eye': 'indigo',
    'code': 'hot pink magenta', 'forge': 'orange ember', 'shield': 'crimson red', 'cloud': 'cyan teal',
    'ai': 'vivid purple', 'matrix': 'emerald green', 'observatory': 'cyan and violet',
    'divergent': 'teal', 'security-plus': 'crimson red', 'dark-arts': 'crimson and violet',
    'signal': 'amber and teal', 'arctic': 'icy cyan and blue',
}

def build_prompt(subject, house):
    accent = HOUSE_ACCENT.get(house, 'cyan and magenta')
    return f"{subject}, {accent} neon accent lighting, {STYLE}"

def gen(slug, subject, house, count, size):
    key = os.environ.get('FAL_KEY')
    if not key:
        print('FAL_KEY not set in this shell. It lives in ~/.bashrc; run from a login shell.', file=sys.stderr)
        sys.exit(2)
    os.environ['FAL_KEY'] = key
    os.makedirs(STAGING, exist_ok=True)
    prompt = build_prompt(subject, house)
    print('SLUG   :', slug)
    print('PROMPT :', prompt)
    for i in range(1, count + 1):
        print(f'  [{i}/{count}] generating...')
        result = fal_client.subscribe('fal-ai/flux/dev', {
            'prompt': prompt,
            'image_size': size,          # 'square' (512) or 'square_hd' (1024)
            'num_images': 1,
            'seed': int(time.time()) + i * 7919,
        })
        imgs = result.get('images') or []
        if not imgs:
            print('    no image in result:', str(result)[:200]); continue
        url = imgs[0]['url']
        raw = requests.get(url, timeout=90).content
        img = Image.open(io.BytesIO(raw)).convert('RGB').resize((512, 512), Image.LANCZOS)
        out = os.path.join(STAGING, f'{slug}-{i}.webp')
        img.save(out, 'WEBP', quality=90)
        print('    ->', out)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Generate hub cartridge cover art into staging for curation.')
    ap.add_argument('slug', help='hub slug the cover is for (staging filename base)')
    ap.add_argument('subject', help='ORIGINAL scene description (no brands/franchises/characters)')
    ap.add_argument('--house', default='', help='house id for the neon accent color')
    ap.add_argument('--count', type=int, default=3, help='number of variations')
    ap.add_argument('--size', default='square_hd', help="'square_hd' (1024) or 'square' (512)")
    a = ap.parse_args()
    gen(a.slug, a.subject, a.house, a.count, a.size)
