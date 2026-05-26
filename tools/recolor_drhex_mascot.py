"""
Recolor the Dr. Hex hooded-figure SVG to produce 5 mood-state variants.

The button's mood ring already changes color based on state (calm/noticing/
active/insistent/celebrating). The mascot eye should match — when the ring
is red, the eye should be red. This gives a unified visual signal.

Strategy: source SVG uses a pale cyan-green palette (rgb(182,217,209) /
rgb(172,206,197)) for the eye + accents. Swap those two colors per state.

Output: _app/assets/images/icons/dr-hex-{state}.svg (5 files)
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "_app/assets/images/icons/dr-hex-hooded-figure.svg"
OUT_DIR = REPO / "_app/assets/images/icons"

# Source palette in the hooded-figure SVG (light, darker)
SOURCE_LIGHT = "rgb(182,217,209)"
SOURCE_DARK  = "rgb(172,206,197)"

# Target palettes per mood-ring state. Light = main fill, darker = shadow.
# Hex colors come from HexAIButton.js STATE_CONFIG (the mood-ring background).
STATES = {
    "calm":         ("rgb(103,232,249)", "rgb(85,200,220)"),    # #67e8f9 cyan
    "noticing":     ("rgb(251,191,36)",  "rgb(224,168,30)"),    # #fbbf24 yellow
    "active":       ("rgb(251,146,60)",  "rgb(220,124,48)"),    # #fb923c orange
    "insistent":    ("rgb(239,68,68)",   "rgb(212,55,55)"),     # #ef4444 red
    "celebrating":  ("rgb(167,139,250)", "rgb(140,116,210)"),   # #a78bfa purple
}


def main():
    src = SRC.read_text()

    # Sanity check the source palette is actually present
    if SOURCE_LIGHT not in src or SOURCE_DARK not in src:
        raise SystemExit(
            f"Source palette not found in {SRC.name}. Expected "
            f"{SOURCE_LIGHT} and {SOURCE_DARK}."
        )

    print(f"Source: {SRC.relative_to(REPO)} ({SRC.stat().st_size // 1024} KB)")
    print(f"  source light occurrences: {src.count(SOURCE_LIGHT)}")
    print(f"  source dark  occurrences: {src.count(SOURCE_DARK)}")
    print()

    for state, (light, dark) in STATES.items():
        out = src.replace(SOURCE_LIGHT, light).replace(SOURCE_DARK, dark)
        out_path = OUT_DIR / f"dr-hex-{state}.svg"
        out_path.write_text(out)
        print(f"  wrote {out_path.relative_to(REPO)} ({out_path.stat().st_size // 1024} KB) — eye {light}")

    print()
    print("Done. Update HexAIButton.js state machine to swap the src per state:")
    print('  /assets/images/icons/dr-hex-{state}.svg')


if __name__ == "__main__":
    main()
