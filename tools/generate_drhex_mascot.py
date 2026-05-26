"""
Hexworth Prime — Dr. Hex mascot generator via fal.ai Recraft v3.

Generates a small set of variations for the Dr. Hex AI tutor mascot.
Output: vector-style cel-shaded PNG with transparent background so the
mascot absorbs onto whatever's behind it (mood-ring circle, chat panel
header, page background).

Design brief (from operator brainstorm, 2026-05-25):
  - Original character — NOT a generic robot icon
  - Hex-faceted visor / face-plate (brand tie to "Hexworth")
  - Single glowing cyclopean eye (focal point)
  - Small indicator bar BELOW the eye (mouth-like without being lips)
  - Compact upright body OR floating orb
  - Cel-shaded vector style, flat colors, hard edges, no gradients
  - Dark slate body color, neon-cyan accents
  - Transparent background — character absorbs onto any backdrop
  - Reads at 64×64 button size AND 320×320 hero size

Usage:
  source ~/.bashrc           # makes FAL_KEY available
  python3 tools/generate_drhex_mascot.py

Output: _app/assets/images/icons/dr-hex-{variant}.webp
        _app/assets/images/icons/dr-hex-{variant}-source.png  (transparent PNG)
"""

import os
import sys
from pathlib import Path

try:
    import fal_client
    import requests
    from PIL import Image
    from io import BytesIO
except ImportError as e:
    sys.stderr.write(f"missing dep: {e}. pip install fal-client requests Pillow\n")
    sys.exit(1)


OUTPUT_DIR = Path(__file__).resolve().parent.parent / "_app" / "assets" / "images" / "icons"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Shared style — all variations use this base
STYLE = (
    "cel-shaded vector illustration, flat colors, hard edges, "
    "thick black outline, no gradients, no shading, "
    "minimalist character design, mascot illustration, "
    "centered subject, transparent background, "
    "high contrast, neon cyan glow accents, dark slate gray body, "
    "no text, no letters, no logos"
)


# Four design variations — operator picks the one that lands
VARIANTS = [
    (
        "humanoid",
        # Compact upright humanoid with hex-faceted helmet
        "A small friendly mascot character, compact upright humanoid body, "
        "wearing a hex-faceted helmet visor that covers the entire face, "
        "the visor is a hexagonal geometric face-plate in dark slate gray with thin "
        "neon cyan trim lines along the hex edges, "
        "ONE single large glowing cyan circular eye in the center of the visor, "
        "below the eye a small horizontal indicator bar in neon cyan "
        "(suggesting a calm expression), "
        "dark slate gray body with subtle circuit trace patterns visible, "
        "tiny floating gauntlet hands at the sides (no full arms), "
        "no mouth, no nose, simple compact body proportions, "
        f"chibi style, charming and approachable but professional, {STYLE}"
    ),
    (
        "floating-orb",
        # Floating orb body — most Tron-coded
        "A small floating mascot character, ROUND spherical body in dark slate gray, "
        "the front of the orb has a hex-faceted visor inset — a hexagonal "
        "geometric face-plate in slightly darker slate with thin neon cyan edge lines, "
        "ONE single large glowing cyan circular eye centered in the hex visor, "
        "below the eye a small horizontal indicator bar in neon cyan "
        "(suggesting a neutral attentive expression), "
        "subtle circuit trace patterns visible across the orb surface, "
        "small floating side-pods on either side (not arms, more like satellite accessories), "
        "no legs, no mouth, the orb hovers in space, "
        f"clean geometric design, friendly but mysterious, {STYLE}"
    ),
    (
        "hooded-figure",
        # Hooded figure — most 'Doctor'-coded
        "A small mysterious mascot character, hooded robed figure, "
        "the hood casts a dark shadow over the entire face area, "
        "inside the hood shadow: a hex-faceted geometric visor floats — "
        "a hexagonal face-plate in dark slate gray with thin neon cyan edge trim, "
        "ONE single large glowing cyan circular eye centered in the hex visor, "
        "below the eye a small horizontal indicator bar in neon cyan, "
        "the robe is dark slate gray with subtle circuit trace patterns, "
        "robe drapes naturally, only the visor face glows through the hood shadow, "
        "no visible hands or body details — just the hood, the visor face, "
        f"and the silhouette of the robe, scholarly but technological, {STYLE}"
    ),
    (
        "headshot",
        # Tight headshot — most icon-friendly at 64px
        "A close-up headshot of a small mascot character, just the head and shoulders, "
        "hex-faceted helmet visor that covers the entire face, "
        "the visor is hexagonal in shape, dark slate gray with thin neon cyan trim "
        "along the hexagon edges, "
        "ONE single large glowing cyan circular eye in the center of the hex visor, "
        "below the eye a small horizontal indicator bar in neon cyan "
        "(suggesting a calm focused expression), "
        "small dark slate gray shoulders barely visible at the bottom, "
        "no nose, no mouth, no ears, no hair, "
        "the hex visor fills most of the image, "
        f"clean minimalist icon-friendly design, reads clearly at small sizes, {STYLE}"
    ),
]


def generate_one(name: str, prompt: str) -> None:
    """Generate one variant via Recraft v3 and save as PNG + webp."""
    out_png = OUTPUT_DIR / f"dr-hex-{name}-source.png"
    out_webp = OUTPUT_DIR / f"dr-hex-{name}.webp"

    if out_webp.exists():
        print(f"  [SKIP] dr-hex-{name}.webp already exists")
        return

    print(f"  [GEN]  dr-hex-{name}  ...")

    # Recraft v3 endpoint — vector-style native + transparent background
    result = fal_client.subscribe(
        "fal-ai/recraft-v3",
        arguments={
            "prompt": prompt,
            "image_size": "square_hd",     # 1024×1024
            "style": "vector_illustration",
            "colors": [],
            # Recraft API: not all params are documented; the model defaults
            # produce transparent backgrounds when "transparent background"
            # is in the prompt + style is vector_illustration.
        },
        with_logs=False,
    )

    if not result or "images" not in result or not result["images"]:
        print(f"  [FAIL] no image returned for {name}: {result}")
        return

    url = result["images"][0]["url"]
    ct_hint = result["images"][0].get("content_type", "?")
    print(f"         download url: {url}")
    print(f"         content_type (hint): {ct_hint}")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    ct = resp.headers.get("content-type", "")
    print(f"         actual content-type: {ct}  bytes: {len(resp.content)}")

    # Recraft v3 with style=vector_illustration returns SVG. Save raw + convert.
    if "svg" in ct.lower() or resp.content[:5].lower() == b"<?xml" or resp.content[:5].lower() == b"<svg ":
        out_svg = OUTPUT_DIR / f"dr-hex-{name}.svg"
        out_svg.write_bytes(resp.content)
        print(f"  [OK]   saved {out_svg.name} ({out_svg.stat().st_size // 1024} KB, vector SVG)")
        # Rasterize to PNG via cairosvg if available — otherwise skip the webp
        try:
            import cairosvg
            png_bytes = cairosvg.svg2png(bytestring=resp.content, output_width=1024, output_height=1024)
            img = Image.open(BytesIO(png_bytes)).convert("RGBA")
            img.save(out_png, format="PNG", optimize=True)
            img.save(out_webp, format="WEBP", quality=90, method=6)
            print(f"  [OK]   rasterized to {out_webp.name} ({out_webp.stat().st_size // 1024} KB)")
        except ImportError:
            print(f"  [note] cairosvg not installed — SVG saved, raster skipped")
        return

    # Raster image path (PNG/JPEG)
    img = Image.open(BytesIO(resp.content)).convert("RGBA")
    img.save(out_png, format="PNG", optimize=True)
    img.save(out_webp, format="WEBP", quality=90, method=6)
    print(f"  [OK]   saved {out_webp.name} ({out_webp.stat().st_size // 1024} KB) + source PNG")


def main() -> None:
    if not os.environ.get("FAL_KEY"):
        sys.stderr.write("ERROR: FAL_KEY env var not set. Source ~/.bashrc first.\n")
        sys.exit(1)

    print(f"Output dir: {OUTPUT_DIR}")
    print(f"Generating {len(VARIANTS)} Dr. Hex mascot variations via fal-ai/recraft-v3")
    print()

    for name, prompt in VARIANTS:
        try:
            generate_one(name, prompt)
        except Exception as e:
            print(f"  [ERROR] {name}: {e}")

    print()
    print("Done. Operator picks the variant — replace the 🤖 emoji in")
    print("_app/_lib/HexAIButton.js line 177 with <img src='/assets/images/icons/dr-hex-<variant>.webp'>")


if __name__ == "__main__":
    main()
