#!/usr/bin/env python3
"""
Refresh _app/config/image-catalog.json by walking _app/assets/images/ recursively.

Schema preserved from prior commit b287d4386:
  Top: generatedAt, totalImages, totalBytes, categories, extensions, images[]
  Per image: path, category, filename, extension, sizeBytes, modifiedAt,
             [width, height], id

Rules (Nancy-cleared 2026-06-09):
- category = basename(dirname(path))   — works for arcade/foo + wsa-visuals/m01/foo
- id = sha1(path).hexdigest()[:16]     — stable; reuses existing IDs by construction
- modifiedAt = ISO8601 UTC with +00:00 — matches prior schema
- width/height ONLY for image extensions {webp, png, jpg, jpeg, gif} via PIL
  (mp4/webm/svg/bak get no dimensions — field omitted)
- Top-level keys built in insertion order: generated/total/total/cat/ext/images
- images[] sorted by path (stable diff)
"""
import os
import json
import hashlib
from datetime import datetime, timezone
from collections import OrderedDict
from PIL import Image

REPO = "/home/eq/ai-content/hexworth-prime"
ROOT = os.path.join(REPO, "_app/assets/images")
WEB_PREFIX = "/assets/images"
OUT = os.path.join(REPO, "_app/config/image-catalog.json")

IMAGE_EXTS = {"webp", "png", "jpg", "jpeg", "gif"}

def iter_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip dotfiles/dotdirs
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for fn in filenames:
            if fn.startswith("."):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, ROOT)
            yield full, rel, fn

def main():
    images = []
    cat_counter = {}
    ext_counter = {}
    total_bytes = 0

    for full, rel, fn in iter_files(ROOT):
        web_path = f"{WEB_PREFIX}/{rel.replace(os.sep, '/')}"
        category = os.path.basename(os.path.dirname(web_path))
        ext = fn.rsplit(".", 1)[-1].lower() if "." in fn else ""
        st = os.stat(full)
        size_bytes = st.st_size
        total_bytes += size_bytes
        mtime = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat()
        # Match prior format: microseconds + +00:00 (Python default with utc)
        # isoformat gives '2026-06-09T06:28:09.008054+00:00' which matches.
        img_id = hashlib.sha1(web_path.encode()).hexdigest()[:16]

        entry = OrderedDict()
        entry["path"] = web_path
        entry["category"] = category
        entry["filename"] = fn
        entry["extension"] = ext
        entry["sizeBytes"] = size_bytes
        entry["modifiedAt"] = mtime

        if ext in IMAGE_EXTS:
            try:
                with Image.open(full) as im:
                    entry["width"] = im.width
                    entry["height"] = im.height
            except Exception as e:
                # Image format we couldn't read — emit absent (no width/height)
                print(f"  WARN: PIL failed on {web_path}: {e}", flush=True)

        entry["id"] = img_id

        images.append(entry)
        cat_counter[category] = cat_counter.get(category, 0) + 1
        ext_counter[ext] = ext_counter.get(ext, 0) + 1

    # Sort by path for stable diff
    images.sort(key=lambda x: x["path"])

    # Build top-level in the prior schema's insertion order
    manifest = OrderedDict()
    manifest["generatedAt"] = datetime.now(timezone.utc).isoformat()
    manifest["totalImages"] = len(images)
    manifest["totalBytes"] = total_bytes
    manifest["categories"] = OrderedDict(sorted(cat_counter.items()))
    manifest["extensions"] = OrderedDict(sorted(ext_counter.items()))
    manifest["images"] = images

    with open(OUT, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"Wrote {OUT}")
    print(f"  images:  {len(images)}")
    print(f"  bytes:   {total_bytes:,} ({total_bytes/1024/1024:.1f} MB)")
    print(f"  cats:    {len(cat_counter)}")
    print(f"  exts:    {ext_counter}")

if __name__ == "__main__":
    main()
