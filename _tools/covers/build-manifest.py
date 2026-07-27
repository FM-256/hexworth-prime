#!/usr/bin/env python3
"""
Promote curated staging covers into the gallery: copy _tools/covers/staging/<id>-1.webp
to _app/assets/images/covers/<id>.webp and add/update its manifest.json entry. Idempotent
and ADDITIVE — only touches the ids passed in, preserving every existing manifest entry.

The cover `type` is derived from the hub's HubRegistry category:
  cert-prep → 'cert'   ·   platform-hub → 'anthology'   ·   everything else → 'course'

Usage:
  python3 _tools/covers/build-manifest.py <id> [<id> ...]
  python3 _tools/covers/build-manifest.py --file _tools/covers/wave3_ids.txt   # comma/nl-separated
"""
import os, sys, json, shutil, re

HERE = os.path.dirname(os.path.abspath(__file__))
STAGING = os.path.join(HERE, 'staging')
GAL = os.path.abspath(os.path.join(HERE, '..', '..', '_app', 'assets', 'images', 'covers'))
REG = os.path.abspath(os.path.join(HERE, '..', '..', '_app', 'components', 'HubRegistry.js'))
MANIFEST = os.path.join(GAL, 'manifest.json')

def categories():
    """id -> category, parsed from HubRegistry.js."""
    src = open(REG).read()
    out = {}
    for m in re.finditer(r"id:\s*'([^']+)'[^}\n]*?category:\s*'([^']+)'", src):
        out[m.group(1)] = m.group(2)
    return out

def cover_type(cat):
    return {'cert-prep': 'cert', 'platform-hub': 'anthology'}.get(cat, 'course')

def main():
    args = sys.argv[1:]
    ids = []
    if args and args[0] == '--file':
        raw = open(args[1]).read()
        ids = [x.strip() for x in re.split(r'[,\s]+', raw) if x.strip()]
    else:
        ids = args
    if not ids:
        print('no ids given'); sys.exit(1)

    cats = categories()
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    done, missing = 0, []
    for hid in ids:
        src = os.path.join(STAGING, hid + '-1.webp')      # count=1 variation
        if not os.path.exists(src):
            missing.append(hid); continue
        shutil.copyfile(src, os.path.join(GAL, hid + '.webp'))
        manifest[hid] = {'file': hid + '.webp', 'source': hid + '-1', 'type': cover_type(cats.get(hid, 'course'))}
        done += 1
    json.dump(manifest, open(MANIFEST, 'w'), indent=2)
    print(f'promoted {done} cover(s); manifest now {len(manifest)} entries')
    if missing:
        print(f'MISSING staging art ({len(missing)}): ' + ', '.join(missing))

if __name__ == '__main__':
    main()
