"""
Hexworth Prime — Trophy & Medal Art Generator
Generates medal/trophy art via fal.ai FLUX.1 [dev] API.

Usage:
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_trophy_medals.py

Output: _app/assets/images/icons/{name}.webp (512x512)
"""

import os
import time
import requests
import fal_client
from PIL import Image
from io import BytesIO

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', '_app', 'assets', 'images', 'icons')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Base style for all images
STYLE = (
    "Dark cyberpunk aesthetic, deep navy black background (#0a0a0f), "
    "clean centered icon design, metallic sheen, "
    "glowing neon light reflections, minimal composition, "
    "digital holographic shimmer, game UI asset style, "
    "high detail, sharp edges, 3D rendered, no text, no letters, no numbers, "
    "square format, single object centered"
)

MEDALS = [
    (
        "medal-gold",
        f"A prestigious gold medal with a star emblem in the center, "
        f"hanging from a rich golden ribbon, bright warm gold metallic surface "
        f"with glowing amber and yellow neon edge highlights, "
        f"champion first place award, {STYLE}"
    ),
    (
        "medal-silver",
        f"A sleek silver medal with a star emblem in the center, "
        f"hanging from a cool silver-white ribbon, polished chrome metallic surface "
        f"with glowing cool blue-white neon edge highlights, "
        f"second place award, {STYLE}"
    ),
    (
        "medal-bronze",
        f"A rugged bronze medal with a star emblem in the center, "
        f"hanging from a deep copper-orange ribbon, warm bronze metallic surface "
        f"with glowing amber-copper neon edge highlights, "
        f"third place award, {STYLE}"
    ),
    (
        "trophy-gold",
        f"A grand golden trophy cup with two handles, polished gold surface, "
        f"glowing golden aura and warm amber neon light emanating from it, "
        f"champion winner trophy, prestigious first place award, "
        f"cyberpunk holographic shimmer on the cup surface, {STYLE}"
    ),
]


def generate_image(name, prompt):
    out_path = os.path.join(OUTPUT_DIR, f"{name}.webp")

    if os.path.exists(out_path):
        print(f"  [SKIP] {name}.webp already exists")
        return

    print(f"  [GEN] {name}...")

    result = fal_client.subscribe(
        "fal-ai/flux/dev",
        arguments={
            "prompt": prompt,
            "image_size": "square",
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
            "num_images": 1,
            "enable_safety_checker": False,
        },
    )

    image_url = result["images"][0]["url"]
    img_data = requests.get(image_url).content

    # Convert to webp
    img = Image.open(BytesIO(img_data))
    img = img.resize((512, 512), Image.LANCZOS)
    img.save(out_path, "WEBP", quality=85)

    size_kb = os.path.getsize(out_path) / 1024
    print(f"  [OK]  {name}.webp ({size_kb:.1f} KB)")

    time.sleep(1)  # Rate limit courtesy


def main():
    print("=" * 60)
    print("Hexworth Prime — Trophy & Medal Art Generator")
    print("=" * 60)
    print(f"Output: {OUTPUT_DIR}")
    print(f"Generating {len(MEDALS)} images...\n")

    for name, prompt in MEDALS:
        try:
            generate_image(name, prompt)
        except Exception as e:
            print(f"  [ERR] {name}: {e}")

    print("\nDone!")


if __name__ == "__main__":
    main()
