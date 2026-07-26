#!/usr/bin/env python3
"""
Composite a cert MARK onto a cover scene (cover-cartridge system, cert hubs).

IMPORTANT: this renders the cert's SHORT NAME as plain text in our OWN typography (e.g. "A+",
"Security+"), a descriptive/nominative label of what the course preps for. It does NOT reproduce,
recreate, or approximate any vendor's stylized logo or trademarked mark. When official partner
logo rights are confirmed, the text chip is swapped for the real asset, no code change.

Usage:
  python3 _tools/covers/composite-cert-mark.py <cover.webp> <out.webp> "A+ Core 1" "#f97316"
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def hex_rgb(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

def font(sz):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", sz)
    except Exception:
        return ImageFont.load_default()

def composite(cover_path, out_path, cert_name, house_hex):
    im = Image.open(cover_path).convert("RGBA")
    W, H = im.size
    accent = hex_rgb(house_hex)
    f = font(34)
    d0 = ImageDraw.Draw(im)
    bbox = d0.textbbox((0, 0), cert_name, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    px, py = 18, 12
    cw, chh = tw + px * 2, th + py * 2
    x, y = 22, 22

    # Chip + text on a transparent overlay so we can add a soft accent glow behind it.
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle([x, y, x + cw, y + chh], radius=13, fill=(8, 10, 20, 225),
                         outline=accent + (255,), width=2)
    od.text((x + px, y + py - bbox[1]), cert_name, font=f, fill=(255, 255, 255, 255))

    glow = Image.new("RGBA", im.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle([x, y, x + cw, y + chh], radius=13, fill=accent + (150,))
    glow = glow.filter(ImageFilter.GaussianBlur(11))

    im = Image.alpha_composite(im, glow)
    im = Image.alpha_composite(im, overlay)
    im.convert("RGB").save(out_path, "WEBP", quality=90)
    print("  wrote", out_path)

if __name__ == "__main__":
    composite(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
