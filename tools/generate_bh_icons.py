"""
Hexworth Prime — Bug Hunting Icon Generator
Generates 1 hub emblem (512x512) + 22 category icons (256x256) via fal.ai FLUX.1 [dev].

Usage:
  pip install fal-client requests Pillow
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_bh_icons.py

Output:
  _app/assets/images/emblems/bug-hunting.webp  (512x512)
  _app/assets/images/categories/bh-*.webp      (256x256)
"""

import os
import io
import time
import random
import requests
import fal_client
from PIL import Image

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

MODEL = "fal-ai/flux/dev"
MAX_RETRIES = 6
BASE_BACKOFF = 2.0
SLEEP_BETWEEN = 1.0

STYLE = """dark navy background (#0a0a1a), centered icon design,
cyberpunk digital art, neon glow on dark background,
clean minimalist composition, professional badge icon,
no text no letters no words no writing no labels"""

# Paths relative to repo root
EMBLEM_DIR = "_app/assets/images/emblems"
CATEGORY_DIR = "_app/assets/images/categories"

# ---------------------------------------------------------------------------
# Emblem (512x512)
# ---------------------------------------------------------------------------

EMBLEM = (
    "bug-hunting",
    "a glowing cyberpunk magnifying glass examining code with neon purple and green highlights, binary data streams, digital forensics theme"
)

# ---------------------------------------------------------------------------
# Category icons (256x256)
# ---------------------------------------------------------------------------

CATEGORIES = [
    # Existing 6
    ("bh-recon",
     "digital radar scanning network nodes, green and purple neon scan lines, cyber reconnaissance"),
    ("bh-web",
     "a cracked web browser window with glowing exploit code, red and purple neon"),
    ("bh-injection",
     "a neon syringe injecting glowing code into a database cylinder, purple and cyan"),
    ("bh-api",
     "interconnected API endpoint nodes with one node glowing red exploited, purple neon mesh"),
    ("bh-cloud",
     "a cracked cloud server with exposed data streams, neon orange and purple"),
    ("bh-tools",
     "cyberpunk workbench with glowing hacking tools, Burp Suite inspired, neon purple and green"),
    # New 16
    ("bh-recon-adv",
     "automated scanning pipeline with multiple data streams converging, green and cyan neon, cyber automation"),
    ("bh-reporting",
     "a professional security report document with severity ratings glowing red and green, purple neon"),
    ("bh-auth",
     "a broken padlock with JWT token fragments floating around it, gold and purple neon"),
    ("bh-advanced-web",
     "layered HTTP packets being smuggled through a firewall gap, red and purple neon"),
    ("bh-mobile",
     "a smartphone being decompiled with code layers separating, cyan and purple neon"),
    ("bh-network",
     "network topology map with highlighted vulnerable nodes, green and orange neon lines"),
    ("bh-iot",
     "an embedded circuit board with UART and JTAG debug ports glowing, green and red neon"),
    ("bh-ai-exploit",
     "a chatbot interface with glowing injection text breaking through guardrails, red and purple neon"),
    ("bh-ai-hunting",
     "an AI brain assisting a hacker terminal with code analysis, cyan and purple neon"),
    ("bh-blockchain",
     "a cracked smart contract block in a chain with exploit code visible, gold and purple neon"),
    ("bh-supply-chain",
     "a CI/CD pipeline with a poisoned package being injected, red and green neon"),
    ("bh-source-review",
     "magnifying glass examining source code with highlighted vulnerability, white and purple neon"),
    ("bh-chaining",
     "three medium severity bugs connecting into one critical chain, escalating red glow"),
    ("bh-automation",
     "a custom hacking framework dashboard with multiple tools running, green terminal on purple"),
    ("bh-career",
     "a hacker career path ascending from laptop to conference stage, blue and purple neon"),
    ("bh-resources",
     "a curated library of security tools and lab environments, warm purple and gold neon"),
]

# ---------------------------------------------------------------------------
# Generation helpers (same pattern as generate_category_icons.py)
# ---------------------------------------------------------------------------

def generate_image(prompt, size):
    """Generate a single image via fal.ai FLUX.1 [dev] with retry logic."""
    full_prompt = f"{prompt}, {STYLE}"

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = fal_client.subscribe(MODEL, arguments={
                "prompt": full_prompt,
                "image_size": {"width": size, "height": size},
                "num_inference_steps": 28,
                "guidance_scale": 3.5,
                "num_images": 1,
                "enable_safety_checker": False,
            })
            img_url = result["images"][0]["url"]
            resp = requests.get(img_url, timeout=60)
            resp.raise_for_status()
            return resp.content
        except Exception as e:
            sleep_s = (BASE_BACKOFF ** attempt) + random.uniform(0, 1.0)
            print(f"  [!] Attempt {attempt}/{MAX_RETRIES} failed: {e}")
            print(f"      Retrying in {sleep_s:.1f}s...")
            time.sleep(sleep_s)

    raise RuntimeError(f"Failed after {MAX_RETRIES} attempts")


def save_as_webp(png_bytes, output_path, size):
    """Convert PNG bytes to WebP at specified size, quality 82."""
    img = Image.open(io.BytesIO(png_bytes))
    img = img.resize((size, size), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=82)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(buf.getvalue())
    file_kb = os.path.getsize(output_path) / 1024
    print(f"  -> Saved {output_path} ({file_kb:.1f} KB)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    total = 1 + len(CATEGORIES)
    generated = 0
    skipped = 0

    # --- Emblem ---
    name, prompt = EMBLEM
    out_path = os.path.join(EMBLEM_DIR, f"{name}.webp")
    if os.path.exists(out_path):
        print(f"[SKIP] {out_path} already exists")
        skipped += 1
    else:
        print(f"[1/{total}] Generating emblem: {name} (512x512)")
        png_bytes = generate_image(prompt, 512)
        save_as_webp(png_bytes, out_path, 512)
        generated += 1
        time.sleep(SLEEP_BETWEEN)

    # --- Category icons ---
    for i, (cat_name, cat_prompt) in enumerate(CATEGORIES, start=2):
        out_path = os.path.join(CATEGORY_DIR, f"{cat_name}.webp")
        if os.path.exists(out_path):
            print(f"[SKIP] {out_path} already exists")
            skipped += 1
            continue

        print(f"[{i}/{total}] Generating category: {cat_name} (256x256)")
        png_bytes = generate_image(cat_prompt, 256)
        save_as_webp(png_bytes, out_path, 256)
        generated += 1
        time.sleep(SLEEP_BETWEEN)

    print(f"\nDone! Generated: {generated}, Skipped: {skipped}, Total: {total}")


if __name__ == "__main__":
    main()
