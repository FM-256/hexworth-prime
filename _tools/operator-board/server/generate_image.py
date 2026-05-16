#!/usr/bin/env python3
"""
Generate the Phase 1 Hello World image for the operator board.

Produces an 800×480 monochrome (1-bit) PNG suitable for the Waveshare 7.5" V2
e-paper panel.

Usage:
    python3 generate_image.py [output_path]

Default output: ./operator-board.png

Requires: Pillow  (pip install Pillow)
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WIDTH = 800
HEIGHT = 480
OUTPUT_DEFAULT = Path(__file__).parent / "operator-board.png"


def find_font(size: int) -> ImageFont.FreeTypeFont:
    """Try a few common font paths; fall back to PIL default."""
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main(out_path: Path) -> None:
    img = Image.new("1", (WIDTH, HEIGHT), color=1)  # 1-bit, white background
    draw = ImageDraw.Draw(img)

    # Border
    border = 10
    draw.rectangle(
        (border, border, WIDTH - border - 1, HEIGHT - border - 1),
        outline=0,
        width=3,
    )

    # Title (centered, large)
    title_font = find_font(56)
    title = "HEXWORTH"
    tb = draw.textbbox((0, 0), title, font=title_font)
    tx = (WIDTH - (tb[2] - tb[0])) // 2
    ty = 80
    draw.text((tx, ty), title, font=title_font, fill=0)

    # Subtitle
    sub_font = find_font(36)
    subtitle = "OPERATOR BOARD"
    sb = draw.textbbox((0, 0), subtitle, font=sub_font)
    sx = (WIDTH - (sb[2] - sb[0])) // 2
    sy = ty + (tb[3] - tb[1]) + 24
    draw.text((sx, sy), subtitle, font=sub_font, fill=0)

    # Divider
    line_y = sy + (sb[3] - sb[1]) + 40
    draw.line(
        (border + 60, line_y, WIDTH - border - 60, line_y),
        fill=0,
        width=2,
    )

    # Version + status (centered)
    body_font = find_font(28)
    version = "v0.2  ·  Pipeline Live"
    vb = draw.textbbox((0, 0), version, font=body_font)
    vx = (WIDTH - (vb[2] - vb[0])) // 2
    vy = line_y + 32
    draw.text((vx, vy), version, font=body_font, fill=0)

    note_font = find_font(20)
    note = "Phase 1 verified. Real Firestore data lands in Phase 2."
    nb = draw.textbbox((0, 0), note, font=note_font)
    nx = (WIDTH - (nb[2] - nb[0])) // 2
    ny = vy + (vb[3] - vb[1]) + 28
    draw.text((nx, ny), note, font=note_font, fill=0)

    # Footer
    footer_font = find_font(16)
    footer = "XIAO ESP32-C3  ·  7.5\" ePaper 800x480  ·  refresh every 15 min"
    fb = draw.textbbox((0, 0), footer, font=footer_font)
    fx = (WIDTH - (fb[2] - fb[0])) // 2
    fy = HEIGHT - border - 30
    draw.text((fx, fy), footer, font=footer_font, fill=0)

    img.save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path}  ({out_path.stat().st_size} bytes, {WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else OUTPUT_DEFAULT
    main(out)
