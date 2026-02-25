"""
Hexworth Prime — House Emblem Art Generator
Generates heraldic crest art for all 11 houses via fal.ai FLUX.1 [dev].

Usage:
  pip install fal-client requests Pillow
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_house_emblems.py

Output: _app/assets/images/emblems/{houseId}.webp (512x512)
"""

import os
import io
import time
import random
import requests
import fal_client
from PIL import Image

# ---------------------------------------------------------------------------
# Style constants (matching existing arcade/badge art style)
# ---------------------------------------------------------------------------

STYLE = """dark navy background (#0a0a1a), heraldic crest/shield design,
cyberpunk meets medieval heraldry, neon glow accents on dark background,
clean centered composition, digital art, highly detailed,
ornate border frame, professional emblem design,
no text no letters no words no writing"""

# ---------------------------------------------------------------------------
# All 11 houses — (houseId, name, color, concept)
# ---------------------------------------------------------------------------

HOUSES = [
    ("web", "House of the Web", "#60a5fa",
     "Grand heraldic shield crest with an intricate glowing spiderweb pattern radiating from center, connected network nodes pulsing with blue light, data streams flowing through web strands, network topology overlay, azure blue (#60a5fa) neon glow"),

    ("shield", "House of the Shield", "#f87171",
     "Imposing heraldic shield crest with a fortified castle tower and layered defensive walls, glowing red force field barriers, lock and firewall motifs, guardian sentinel silhouette, crimson red (#f87171) neon glow"),

    ("forge", "House of the Forge", "#fbbf24",
     "Industrial heraldic shield crest with crossed hammer and wrench over an anvil, sparks flying, circuit board patterns in the metalwork, gears and server rack elements, molten golden (#fbbf24) neon glow"),

    ("script", "House of the Script", "#a78bfa",
     "Elegant heraldic shield crest with an unfurling scroll covered in glowing automation runes, clockwork gears meshing perfectly, flowing script symbols, efficiency spirals, purple (#a78bfa) neon glow"),

    ("cloud", "House of the Cloud", "#38bdf8",
     "Majestic heraldic shield crest with layered cumulus clouds containing server infrastructure, upward data streams piercing through cloud layers, infinite scale symbol, cyan (#38bdf8) neon glow"),

    ("code", "House of the Code", "#4ade80",
     "Technical heraldic shield crest with a glowing terminal monolith at center, code brackets and curly braces as frame elements, git branch tree growing upward, digital construction, green (#4ade80) neon glow"),

    ("key", "House of the Key", "#f472b6",
     "Mystical heraldic shield crest with an ornate skeleton key as the centerpiece, cipher wheels and encryption symbols orbiting, locked vault door background, cryptographic equations, pink (#f472b6) neon glow"),

    ("eye", "House of the Eye", "#c084fc",
     "Watchful heraldic shield crest with a large all-seeing eye at center, scanning beams radiating outward, magnifying lens overlay, data analysis waves, monitoring dashboard fragments, violet (#c084fc) neon glow"),

    ("dark-arts", "House of the Dark Arts", "#6b21a8",
     "Sinister heraldic shield crest with a crescent moon over a hooded figure, exploit code fragments floating, vulnerability symbols, shadow tendrils, skull and crossbones with binary, dark purple (#6b21a8) and deep violet neon glow"),

    ("matrix", "House of the Matrix", "#00ff41",
     "Transcendent heraldic shield crest with half-human half-digital face, neural interface plugs, cascading Matrix-style green code rain, red pill and blue pill, cybernetic evolution, bright green (#00ff41) neon glow"),

    ("divergent", "The Factionless", "#ff00ff",
     "Chaotic heraldic shield crest fractured into multiple shards each glowing a different color, lightning bolts connecting the fragments, glitch art effects, RGB channel separation, no single center, magenta (#ff00ff) neon glow"),
]

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL = "fal-ai/flux/dev"
IMAGE_SIZE = {"width": 512, "height": 512}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "_app", "assets", "images", "emblems")
os.makedirs(OUT_DIR, exist_ok=True)

SLEEP_BETWEEN = 1.0
MAX_RETRIES = 6
BASE_BACKOFF = 2.0
NUM_INFERENCE_STEPS = 28
GUIDANCE_SCALE = 3.5


def make_prompt(house_id, name, color, concept):
    return f"""{concept},
{STYLE}
house-emblem heraldic-crest cyberpunk-heraldry neon-dark
""".strip()


def generate_with_retries(prompt):
    """Call fal.ai FLUX and return raw PNG bytes."""
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = fal_client.subscribe(
                MODEL,
                arguments={
                    "prompt": prompt,
                    "image_size": IMAGE_SIZE,
                    "num_images": 1,
                    "num_inference_steps": NUM_INFERENCE_STEPS,
                    "guidance_scale": GUIDANCE_SCALE,
                    "output_format": "png",
                    "enable_safety_checker": False,
                },
            )
            img_url = result["images"][0]["url"]
            resp = requests.get(img_url, timeout=60)
            resp.raise_for_status()
            return resp.content

        except Exception as e:
            last_err = e
            sleep_s = (BASE_BACKOFF ** attempt) + random.uniform(0, 1.0)
            print(f"\n  [retry {attempt}/{MAX_RETRIES}] {e} — waiting {sleep_s:.1f}s")
            time.sleep(sleep_s)

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries") from last_err


def png_to_webp(png_bytes, quality=82):
    """Convert PNG bytes to WebP bytes via Pillow."""
    img = Image.open(io.BytesIO(png_bytes))
    img = img.resize((512, 512), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality)
    return buf.getvalue()


def main():
    if not os.getenv("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable not set.")
        print('  export FAL_KEY="your-fal-key-here"')
        raise SystemExit(1)

    total = len(HOUSES)
    print(f"Hexworth Prime — House Emblem Art Generator (fal.ai FLUX.1 [dev])")
    print(f"Output: {os.path.abspath(OUT_DIR)}")
    print(f"Houses: {total}")
    print(f"Size:   {IMAGE_SIZE['width']}x{IMAGE_SIZE['height']} (1:1 square)")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for i, (house_id, name, color, concept) in enumerate(HOUSES, 1):
        webp_path = os.path.join(OUT_DIR, f"{house_id}.webp")

        if os.path.exists(webp_path):
            print(f"  [{i:2d}/{total}] [skip] {house_id} — {name} (exists)")
            skipped += 1
            continue

        prompt = make_prompt(house_id, name, color, concept)
        print(f"  [{i:2d}/{total}] [gen]  {house_id} — {name} ...", end=" ", flush=True)

        try:
            png_bytes = generate_with_retries(prompt)
            webp_bytes = png_to_webp(png_bytes)
            with open(webp_path, "wb") as f:
                f.write(webp_bytes)
            print(f"OK ({len(webp_bytes):,} bytes)")
            generated += 1
        except Exception as e:
            print(f"FAILED: {e}")
            failed += 1

        time.sleep(SLEEP_BETWEEN)

    print()
    print(f"Done — Generated: {generated} | Skipped: {skipped} | Failed: {failed}")


if __name__ == "__main__":
    main()
