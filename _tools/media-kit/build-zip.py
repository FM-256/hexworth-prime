#!/usr/bin/env python3
"""
Regenerable builder for the downloadable brand/media-kit ZIP.
Assembles _app/assets/media/hexworth-media-kit.zip from the canonical assets in
_app/assets/media/brand/ + the rendered PDF, with a README whose usage guidance MATCHES
brand.html's Do/Don't section (adversarial-review finding: an earlier hand-assembled README
told sponsors to put the cyan mark "on any background" — cyan on white is ~1.8:1 contrast,
unreadable). The SVG is intentionally excluded: it is a simplified reinterpretation, not a
faithful trace of the ornate mark, so shipping it alongside the rasters would be a brand
inconsistency. The 1024px transparent PNG is the canonical scalable asset.

Usage:
  python3 _tools/media-kit/render-pdf.js  (via node) then:
  python3 _tools/media-kit/build-zip.py   -> _app/assets/media/hexworth-media-kit.zip
"""
import zipfile, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
BRAND = ROOT / "_app/assets/media/brand"
PDF = ROOT / "_app/assets/media/hexworth-media-kit.pdf"
OUT = ROOT / "_app/assets/media/hexworth-media-kit.zip"

LOGOS = [
    "mark-cyan-1024.png", "mark-cyan-512.png", "mark-cyan-256.png", "mark-cyan-128.png",
    "mark-white-1024.png", "mark-white-512.png", "mark-white-256.png",
    "mark-black-1024.png", "mark-black-512.png", "mark-black-256.png",
    "emblem-cyan-full.png", "monogram-cyan-512.png", "monogram-cyan-256.png",
]
SOCIAL = ["social-avatar-512.png", "social-avatar-400.png", "social-banner.png",
          "social-badge.png", "hero-1600.jpg"]

README = """HEXWORTH PRIME, BRAND & MEDIA KIT
=================================
Cyan (#22D3EE) is the canonical brand color.

/logos
  mark-cyan-{1024,512,256,128}.png   Primary mark. Use on DARK backgrounds only.
                                     (Cyan on white is low-contrast; use mark-black on light.)
  mark-white-{1024,512,256}.png      White knockout. For dark or photographic backgrounds.
  mark-black-{1024,512,256}.png      Black mark. For LIGHT or print backgrounds.
  emblem-cyan-full.png               Full neon wordmark emblem. DARK backgrounds only.
  monogram-cyan-{512,256}.png        "HP" hexagon monogram. Compact spaces / favicons.

/social
  social-avatar-{512,400}.png        Profile picture.
  social-banner.png    1500x500      Cover / header banner.
  social-badge.png                   "Powered by Hexworth Prime" badge for partners & bloggers.
  hero-1600.jpg                      Hero illustration (the twelve-house menagerie).

hexworth-media-kit.pdf               Full company overview deck.

USAGE
  Do:    cyan or white mark on dark; black mark on light; keep clear space of at least the
         hexagon's height around the mark.
  Don't: recolor the mark outside the brand cyan; stretch or rotate it; place the neon
         emblem on a light background.

  More assets, colors, and guidance: https://hexworth.com/brand
  Custom formats or lockups: frank@hexworth.com
"""

def main():
    missing = [f for f in LOGOS + SOCIAL if not (BRAND / f).exists()]
    if missing:
        raise SystemExit(f"ERROR: missing assets: {missing}")
    if not PDF.exists():
        raise SystemExit(f"ERROR: render the PDF first (node render-pdf.js). Not found: {PDF}")
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for f in LOGOS:
            z.write(BRAND / f, f"logos/{f}")
        for f in SOCIAL:
            z.write(BRAND / f, f"social/{f}")
        z.writestr("README.txt", README)
        z.write(PDF, "hexworth-media-kit.pdf")
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB, {len(LOGOS) + len(SOCIAL) + 2} entries)")

if __name__ == "__main__":
    main()
