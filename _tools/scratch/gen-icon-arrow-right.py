"""
Generate icon-arrow-right.webp to match the existing Hexworth icon library
aesthetic (neon-glow effect on dark background — see icon-arrow-up.webp,
icon-rocket.webp, icon-compass.webp).

Reason: m01-fundamentals/cloud-presentation.module.html slide 28 references
this icon for "What's next — labs, quiz, then m02". The library had only
arrow-left + arrow-up (both identical up-arrows; left was misnamed). PIL
rotation of the existing arrow produced a side-glow artifact unsuitable for
production.

Output: _app/assets/images/icons/icon-arrow-right.webp (128x128)
"""
import os, io, sys
import fal_client
import requests
from PIL import Image

KEY = os.environ.get('FAL_KEY')
if not KEY:
    print('FAL_KEY env var not set', file=sys.stderr); sys.exit(2)
os.environ['FAL_KEY'] = KEY

OUT = '/home/eq/ai-content/hexworth-prime/_app/assets/images/icons/icon-arrow-right.webp'

# Match icon-arrow-up.webp aesthetic: bright neon pink/magenta arrow against
# a very dark near-black background, glow effect around the strokes, clean
# minimalist composition. The arrow points RIGHT.
PROMPT = (
    "minimalist neon glow icon, single right-pointing arrow rendered in "
    "bright neon pink and magenta with vivid glow halo around the strokes, "
    "centered horizontally and vertically against a deep dark navy near-black "
    "background, clean simple geometric arrow design with arrowhead on the "
    "right side, vector-style sharp lines, no text, no other symbols, no "
    "shadows beyond the neon glow, balanced composition, 1:1 aspect ratio, "
    "studio-lit cyberpunk aesthetic, matches a library of similar neon icons"
)

print('Submitting fal-ai/flux/dev request...')
result = fal_client.subscribe(
    'fal-ai/flux/dev',
    arguments={
        'prompt':           PROMPT,
        'image_size':       'square_hd',
        'num_inference_steps': 28,
        'guidance_scale':   3.5,
        'num_images':       1,
        'enable_safety_checker': True,
    },
    with_logs=False,
)
img_url = result['images'][0]['url']
print('Generated:', img_url)

resp = requests.get(img_url, timeout=30)
resp.raise_for_status()
img = Image.open(io.BytesIO(resp.content)).convert('RGB')
print('Source size:', img.size)

# Resize to 128x128 — matches the icon-google.py precedent (good headroom
# for retina rendering at the ~18-22px sizes the slide-title pattern uses)
img = img.resize((128, 128), Image.LANCZOS)
img.save(OUT, 'WEBP', quality=92)
print('Wrote', OUT, '(' + str(os.path.getsize(OUT)) + ' bytes)')
