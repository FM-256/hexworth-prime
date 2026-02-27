"""
Hexworth Prime — House Mascot Art Generator
Generates mascot artwork for all 12 house familiars via fal.ai FLUX.1 [dev].

Usage:
  pip install fal-client requests Pillow
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_mascots.py

Output per mascot (3 sizes):
  _app/assets/images/mascots/{houseId}-hero.webp   (512x683, 3:4 portrait)
  _app/assets/images/mascots/{houseId}-badge.webp  (128x170)
  _app/assets/images/mascots/{houseId}-icon.webp   (64x85)

Skips files that already exist. Safe to re-run after interruption.
"""

import os
import io
import time
import random
import requests
import fal_client
from PIL import Image

# ---------------------------------------------------------------------------
# Style constants — semi-realistic digital-mythical hybrid
# ---------------------------------------------------------------------------

STYLE = """dark navy background (#0a0a1a), semi-realistic digital painting,
mythical creature with cyberpunk tech elements, neon glow accents on dark background,
centered heroic portrait composition, dramatic lighting from below,
particle effects and ambient glow, highly detailed fur/scales/feathers,
professional character concept art, no text no letters no words no writing"""

# ---------------------------------------------------------------------------
# All 12 mascots — (houseId, mascotName, color, creature, concept)
# ---------------------------------------------------------------------------

MASCOTS = [
    ("web", "Weaver", "#60a5fa",
     "Crystalline spider spinning luminous digital webs between network nodes. "
     "Blue-glowing silk threads form HTML tags and network connections. "
     "Translucent body reveals inner circuitry. Sky blue (#60a5fa) neon glow accents, "
     "web strands shimmer with data packets"),

    ("forge", "Ember", "#fbbf24",
     "Majestic phoenix rising from a glowing forge anvil in golden flames. "
     "Carries a soldering iron in one talon. Wings made of circuit boards and molten metal. "
     "Sparks cascade from tail feathers. Amber gold (#fbbf24) fire and glow, "
     "represents building and hardware resurrection"),

    ("cloud", "Nimbus", "#f97316",
     "Powerful thunderbird soaring through layered cloud infrastructure. "
     "Lightning-traced wings crackling with electrical energy. "
     "Storm patterns in feathers form server rack silhouettes. "
     "Orange (#f97316) lightning bolts and cloud glow accents, "
     "eyes like twin datacenter beacons"),

    ("code", "Helix", "#4ade80",
     "Elegant serpent coiling through flowing streams of green code. "
     "Emerald scales etched with syntax characters and brackets. "
     "Eyes glow with execution state — bright when running, dim when idle. "
     "Recursive spiral body pattern. Emerald green (#4ade80) glow, "
     "surrounded by floating code fragments"),

    ("dark-arts", "Nyx", "#6b21a8",
     "Shadow raven with purple-tinged feathers that dissolve into smoke at the edges. "
     "Moves through darkness unseen. Carries an ornate lockpick in beak. "
     "Eyes gleam with forbidden knowledge. Deep purple (#6b21a8) and violet glow, "
     "tendrils of shadow code trail behind, exploit symbols float nearby"),

    ("eye", "Vigil", "#c084fc",
     "Great horned owl with large compound eyes reflecting scrolling log data and SIEM dashboards. "
     "Each feather is a detection rule signature. Nocturnal watcher that never blinks. "
     "Perched on a stack of security monitors. Fuchsia-violet (#c084fc) glow, "
     "concentric radar rings emanate from eyes"),

    ("key", "Cipher", "#f472b6",
     "Ancient sphinx guarding encrypted vaults, stone body etched with mathematical formulas "
     "and cryptographic equations. Pink-glowing eyes that see through obfuscation. "
     "Interlocking key patterns carved into haunches. Hot pink (#f472b6) glow accents, "
     "cipher wheels orbit around head"),

    ("script", "Glyph", "#a78bfa",
     "Quick clever fox leaving trails of glowing automation runes as it moves. "
     "Tail writes terminal commands in luminous lavender script. "
     "Fur patterns form bash syntax. Alert pointed ears like antenna. "
     "Lavender (#a78bfa) glow, surrounded by floating script glyphs and automation symbols"),

    ("shield", "Bastion", "#f87171",
     "Armored lion with red mane that flows and ripples like firewall rules. "
     "Shield-plated chest armor with layered defense chevrons. "
     "Stands between threats and the network perimeter, protective stance. "
     "Crimson red (#f87171) glow from mane and armor joints, "
     "force field barrier visible behind"),

    ("ai", "Axiom", "#8b5cf6",
     "Crystalline golem construct with violet circuitry veins running through translucent stone body. "
     "Not born — built. Half ancient carved stone, half neural network visualization. "
     "Core pulses with light as it processes. Violet (#8b5cf6) circuitry glow, "
     "neural network nodes float around like orbiting satellites"),

    ("divergent", "Flux", "#ff00ff",
     "Impossible chimera shifting between all house familiars — one limb is raven wing, "
     "another lion paw, spider silk trails from one side, serpent tail. "
     "Iridescent body constantly morphing, never one fixed form. "
     "Shifting rainbow and magenta (#ff00ff) glow, RGB channel separation effects, "
     "glitch art distortion at transformation boundaries"),

    ("matrix", "Ghost", "#00ff41",
     "Neon green wireframe wolf moving through digital substrate. "
     "Body made entirely of falling Matrix-style code rain characters. "
     "Eyes are blinking terminal cursors. Skeletal frame visible through transparent digital mesh. "
     "Bright green (#00ff41) on pure black, prestige aura, "
     "digital particles scatter from every step"),
]

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL = "fal-ai/flux/dev"
HERO_SIZE = {"width": 512, "height": 683}   # 3:4 portrait

SIZES = [
    ("hero",  512, 683),
    ("badge", 128, 170),
    ("icon",   64,  85),
]

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "_app", "assets", "images", "mascots")
os.makedirs(OUT_DIR, exist_ok=True)

SLEEP_BETWEEN = 1.5
MAX_RETRIES = 6
BASE_BACKOFF = 2.0
NUM_INFERENCE_STEPS = 28
GUIDANCE_SCALE = 3.5


def make_prompt(house_id, name, color, concept):
    return f"""{concept},
{STYLE}
house-mascot creature-portrait digital-mythical neon-dark
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
                    "image_size": HERO_SIZE,
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


def png_to_webp_sized(png_bytes, width, height, quality=82):
    """Convert PNG bytes to WebP at a specific size."""
    img = Image.open(io.BytesIO(png_bytes))
    img = img.resize((width, height), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality)
    return buf.getvalue()


def main():
    if not os.getenv("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable not set.")
        print('  export FAL_KEY="your-fal-key-here"')
        raise SystemExit(1)

    total = len(MASCOTS)
    print(f"Hexworth Prime — House Mascot Art Generator (fal.ai FLUX.1 [dev])")
    print(f"Output: {os.path.abspath(OUT_DIR)}")
    print(f"Mascots: {total}")
    print(f"Sizes: {', '.join(f'{n} ({w}x{h})' for n, w, h in SIZES)}")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for i, (house_id, name, color, concept) in enumerate(MASCOTS, 1):
        hero_path = os.path.join(OUT_DIR, f"{house_id}-hero.webp")

        # Skip if hero already exists (all sizes generated together)
        if os.path.exists(hero_path):
            print(f"  [{i:2d}/{total}] [skip] {name} ({house_id}) — exists")
            skipped += 1
            continue

        prompt = make_prompt(house_id, name, color, concept)
        print(f"  [{i:2d}/{total}] [gen]  {name} ({house_id}) ...", end=" ", flush=True)

        try:
            png_bytes = generate_with_retries(prompt)

            # Generate all 3 sizes from the hero PNG
            for size_name, w, h in SIZES:
                webp_bytes = png_to_webp_sized(png_bytes, w, h)
                out_path = os.path.join(OUT_DIR, f"{house_id}-{size_name}.webp")
                with open(out_path, "wb") as f:
                    f.write(webp_bytes)

            hero_size = os.path.getsize(hero_path)
            print(f"OK (hero: {hero_size:,}b)")
            generated += 1
        except Exception as e:
            print(f"FAILED: {e}")
            failed += 1

        time.sleep(SLEEP_BETWEEN)

    print()
    print(f"Done — Generated: {generated} | Skipped: {skipped} | Failed: {failed}")
    print(f"Files at: {os.path.abspath(OUT_DIR)}")


if __name__ == "__main__":
    main()
