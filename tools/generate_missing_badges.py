"""
Hexworth Prime — Missing Badge Art Generator (Batch 3)
Generates badge art for desk-* (Dispatch dart game) and ta-* (threat applet) achievements.

Usage:
  pip install fal-client requests Pillow
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_missing_badges.py

Output: _app/assets/images/badges/{achievementId}.webp (512x512, 1:1 square)
Skips badges that already exist. Safe to re-run.
"""

import os
import time
import random
import requests
import fal_client
from PIL import Image
from io import BytesIO

# ---------------------------------------------------------------------------
# 14 Missing Badges
# ---------------------------------------------------------------------------

BADGES = [
    # ═══════════════════════════════════════════════════════════════
    # DISPATCH DESK TOYS — Dart Game (9)
    # ═══════════════════════════════════════════════════════════════
    ("desk-first-blood", "First Blood",
     "A single glowing dart striking a neon target board dead center, first impact, sparks flying, dramatic entry shot"),
    ("desk-bullseye", "Bullseye",
     "A perfect bullseye hit on a luminous circular target, dart embedded in the exact center, concentric rings of neon light radiating outward"),
    ("desk-zeroed-in", "Zeroed In",
     "A precision crosshair scope locked onto a glowing bullseye target, laser-focused aim, three darts grouped tightly in center, sniper precision"),
    ("desk-dead-eye", "Dead Eye",
     "A cybernetic eye with targeting reticle overlay, every shot landing true, multiple darts in a tight cluster, mechanical precision"),
    ("desk-sharpshooter", "Sharpshooter",
     "An elite marksman silhouette with glowing darts forming a perfect pattern, sharpshooting mastery, radiant accuracy aura"),
    ("desk-glass-cannon", "Glass Cannon",
     "A shattered glass bottle hit by a glowing dart, explosive impact frozen in time, glass fragments suspended in neon light"),
    ("desk-send-clowns", "Send in the Clowns",
     "A neon carnival clown target riddled with glowing darts, circus lights, clown nose bullseye glowing red, fun but deadly accuracy"),
    ("desk-cup-sweep", "Cup Sweep",
     "A row of cups being knocked over in sequence by darts, domino effect, clean sweep, every target toppled, neon trail following the projectile path"),
    ("desk-general", "The General",
     "A decorated military general badge with crossed darts instead of swords, five-star rank insignia, supreme dart mastery, commanding authority"),

    # ═══════════════════════════════════════════════════════════════
    # THREAT APPLET ACHIEVEMENTS (5)
    # ═══════════════════════════════════════════════════════════════
    ("ta-chmod-", "chmod Commander",
     "Glowing Linux terminal showing chmod command with permission bits transforming into shield patterns, file permission mastery, lock and key access control"),
    ("ta-hydra-", "Hydra Hunter",
     "A multi-headed digital hydra being slain by a cyber warrior, each head representing a brute-force attack vector, password defense mastery"),
    ("ta-rmrf-", "rm -rf Survivor",
     "A hero dodging cascading deleted files in a digital void, filesystem destruction narrowly avoided, the most dangerous command survived"),
    ("ta-whoami-", "Identity Verified",
     "A glowing user identity card with fingerprint scanner and digital face recognition, whoami command revealing true identity, authentication mastery"),
    ("ta-wireshark-", "Packet Inspector",
     "A shark made of flowing network packets swimming through data streams, Wireshark-inspired protocol analysis, packet capture and deep inspection"),
]

# ---------------------------------------------------------------------------
# Style (matches batch 1 and 2 exactly)
# ---------------------------------------------------------------------------

STYLE = """
detailed digital badge icon illustration,
circular composition centered design,
dark navy background with soft neon glow,
cyberpunk aesthetic with clean linework,
badge emblem design, award medal style,
neon cyan and teal primary accent with warm highlights,
dramatic rim lighting, soft volumetric glow,
high contrast, sharp details, professional quality,
game achievement badge art, collectible trophy,
iconic single focal symbol, centered subject,
no text, no words, no letters, no numbers, no watermark
""".strip()

CONSISTENCY = """
consistent cohesive art style across the entire badge set,
unified color grading and lighting,
same lens language and detail level
""".strip()

CATEGORY_COLORS = {
    "games": "red and gold",
    "threat": "deep purple and crimson",
}


def make_prompt(badge_id, name, concept):
    cat = "games" if badge_id.startswith("desk-") else "threat"
    accent = CATEGORY_COLORS.get(cat, "neon cyan and teal")

    return f"""
{concept},
{accent} accent highlights,

{STYLE}
{CONSISTENCY}
badge-series {cat} neon-cyber achievement-icon
""".strip()


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL = "fal-ai/flux/dev"
IMAGE_SIZE = {"width": 512, "height": 512}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "_app", "assets", "images", "badges")
os.makedirs(OUT_DIR, exist_ok=True)

SLEEP_BETWEEN = 0.5
MAX_RETRIES = 6
BASE_BACKOFF = 2.0
NUM_INFERENCE_STEPS = 28
GUIDANCE_SCALE = 3.5


# ---------------------------------------------------------------------------
# Generation with retry + backoff
# ---------------------------------------------------------------------------

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
            print(f"\n  [retry {attempt}/{MAX_RETRIES}] {e} -- waiting {sleep_s:.1f}s")
            time.sleep(sleep_s)

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries") from last_err


def png_to_webp(png_bytes):
    """Convert PNG bytes to WebP bytes (lossy, quality 85)."""
    img = Image.open(BytesIO(png_bytes))
    buf = BytesIO()
    img.save(buf, format="WEBP", quality=85)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not os.getenv("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable not set.")
        print("  export FAL_KEY=\"your-fal-key-here\"")
        raise SystemExit(1)

    total = len(BADGES)
    print(f"Hexworth Prime -- Missing Badge Art Generator (Batch 3)")
    print(f"Output: {os.path.abspath(OUT_DIR)}")
    print(f"Badges: {total}")
    print(f"Size:   {IMAGE_SIZE['width']}x{IMAGE_SIZE['height']} (1:1 square)")
    print(f"Format: WebP (converted from PNG)")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for i, (badge_id, name, concept) in enumerate(BADGES, 1):
        out_path = os.path.join(OUT_DIR, f"{badge_id}.webp")

        if os.path.exists(out_path):
            print(f"  [{i:3d}/{total}] [skip] {badge_id} -- {name} (exists)")
            skipped += 1
            continue

        prompt = make_prompt(badge_id, name, concept)
        print(f"  [{i:3d}/{total}] [gen]  {badge_id} -- {name} ...", end=" ", flush=True)

        try:
            png_bytes = generate_with_retries(prompt)
            webp_bytes = png_to_webp(png_bytes)
            with open(out_path, "wb") as f:
                f.write(webp_bytes)
            print(f"OK ({len(webp_bytes):,} bytes)")
            generated += 1
        except Exception as e:
            print(f"FAILED: {e}")
            failed += 1

        time.sleep(SLEEP_BETWEEN)

    print()
    print(f"Done. Generated: {generated} | Skipped: {skipped} | Failed: {failed}")


if __name__ == "__main__":
    main()
