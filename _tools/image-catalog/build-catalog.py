#!/usr/bin/env python3
"""
Central image catalog builder for Hexworth Prime.

Scans every place images accumulate and emits ONE manifest (manifest.json) that
is the single source of truth for "what images do we have and where do they live":
  - _app/assets/images/**            -> the site-served store (badges, icons, wsa-visuals, ...)
  - _app/** (outside assets/images)  -> scattered in-repo images (bot-avatars, game/applet dirs, ...)
  - ~/hexworth-shared/images/**      -> off-repo accumulation (screenshots, dashboards, course art)
  - ~/hexworth-shared/HEX-Logos and Vids/**  -> logos + brand video stills

Nothing is moved or deleted. This only reads and indexes.
"""
import json
import os

REPO = "/home/eq/ai-content/hexworth-prime"
HOME = os.path.expanduser("~")
IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".ico", ".avif"}

SCAN_ROOTS = [
    # (label, absolute root, served: is it reachable via the site?)
    ("repo", os.path.join(REPO, "_app"), True),
    ("shared-images", os.path.join(HOME, "hexworth-shared", "images"), False),
    ("shared-logos-vids", os.path.join(HOME, "hexworth-shared", "HEX-Logos and Vids"), False),
]

ASSETS_IMAGES = os.path.join(REPO, "_app", "assets", "images")


def categorize(abs_path, root_label, root):
    """Derive a top-level category + whether this is the central served store."""
    if root_label == "repo":
        if abs_path.startswith(ASSETS_IMAGES + os.sep):
            rel = os.path.relpath(abs_path, ASSETS_IMAGES)
            top = rel.split(os.sep)[0]
            return ("assets/" + top, True)  # e.g. assets/badges, assets/icons, assets/wsa-visuals
        # scattered in-repo: category = its containing dir relative to _app
        rel = os.path.relpath(os.path.dirname(abs_path), os.path.join(REPO, "_app"))
        return ("scattered/" + rel, False)
    # shared drive
    rel = os.path.relpath(os.path.dirname(abs_path), root)
    return (root_label + ("/" + rel if rel != "." else ""), False)


def served_url(abs_path):
    """Path the live site serves this image at (only for _app files)."""
    app_root = os.path.join(REPO, "_app")
    if abs_path.startswith(app_root + os.sep):
        return "/" + os.path.relpath(abs_path, app_root).replace(os.sep, "/")
    return None


def main():
    entries = []
    for label, root, served in SCAN_ROOTS:
        if not os.path.isdir(root):
            print(f"  (skip, missing) {root}")
            continue
        for dirpath, _dirs, files in os.walk(root):
            for name in files:
                ext = os.path.splitext(name)[1].lower()
                if ext not in IMG_EXT:
                    continue
                if name.endswith(":Zone.Identifier"):
                    continue
                ap = os.path.join(dirpath, name)
                try:
                    size = os.path.getsize(ap)
                except OSError:
                    size = None
                cat, is_central = categorize(ap, label, root)
                entries.append({
                    "name": name,
                    "abs_path": ap,
                    "source": label,
                    "category": cat,
                    "central": is_central,          # already in the served assets/images store
                    "served_url": served_url(ap),   # None for off-repo / non-served
                    "size_bytes": size,
                    "ext": ext.lstrip("."),
                })

    entries.sort(key=lambda e: (e["source"], e["category"], e["name"].lower()))

    # Summary
    by_source = {}
    by_cat = {}
    total_bytes = 0
    for e in entries:
        by_source[e["source"]] = by_source.get(e["source"], 0) + 1
        by_cat[e["category"]] = by_cat.get(e["category"], 0) + 1
        total_bytes += e["size_bytes"] or 0

    manifest = {
        "generated_note": "Hexworth central image catalog. Source of truth for all image locations. Nothing moved.",
        "totals": {
            "count": len(entries),
            "size_bytes": total_bytes,
            "size_mb": round(total_bytes / 1024 / 1024, 1),
            "by_source": by_source,
        },
        "categories": dict(sorted(by_cat.items())),
        "images": entries,
    }

    out = os.path.join(os.path.dirname(__file__), "manifest.json")
    with open(out, "w") as f:
        json.dump(manifest, f, indent=1)

    print(f"Indexed {len(entries)} images, {manifest['totals']['size_mb']} MB")
    print("By source:", json.dumps(by_source, indent=0))
    print(f"Top categories ({len(by_cat)} total):")
    for cat, n in sorted(by_cat.items(), key=lambda kv: -kv[1])[:18]:
        print(f"  {n:5d}  {cat}")
    print(f"\nManifest -> {out}")


if __name__ == "__main__":
    main()
