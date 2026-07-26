#!/usr/bin/env python3
"""
Composite the cert MARK onto all cert-hub covers (cover-cartridge system).

Idempotent: always composites from the ORIGINAL scene in staging/ (per the manifest 'source'),
so re-running never double-stamps. The mark is the cert's SHORT NAME as our own text in a
house-colored chip, NOT a vendor logo (see composite_cert_mark.py).

Usage:  python3 _tools/covers/cert_marks.py
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from composite_cert_mark import composite

HERE = os.path.dirname(os.path.abspath(__file__))
STAGING = os.path.join(HERE, "staging")
GAL = os.path.join(HERE, "..", "..", "_app", "assets", "images", "covers")

# cert hub id -> (short-name text, house-color hex)
CERT = {
    "network-plus":  ("Network+",  "#3b82f6"),
    "cyberops":      ("CyberOps",  "#6366f1"),
    "aplus-core1":   ("A+ Core 1", "#f97316"),
    "aplus-core2":   ("A+ Core 2", "#f97316"),
    "md-100":        ("MD-100",    "#f97316"),
    "md-101":        ("MD-101",    "#f97316"),
    "security-plus": ("Security+", "#ef4444"),
    "isc2-cc":       ("ISC2 CC",   "#ef4444"),
    "server-plus":   ("Server+",   "#06b6d4"),
    # derived cert-prep hubs (2026-07-26). Short-name chip in the hub's house-accent color.
    "ccna":                ("CCNA",        "#3b82f6"),
    "cysa-plus":           ("CySA+",       "#ef4444"),
    "casp-plus":           ("CASP+",       "#ef4444"),
    "comptia-linux":       ("Linux+",      "#22c55e"),
    "aws-ccp":             ("AWS CCP",     "#06b6d4"),
    "aws-developer":       ("AWS Dev",     "#06b6d4"),
    "azure-fundamentals":  ("AZ-900",      "#06b6d4"),
    "security-operations": ("SecOps",      "#6366f1"),
    "devops-fundamentals": ("DevOps",      "#ec4899"),
    "cryptography-track":  ("Crypto",      "#eab308"),
    "security-plus-crypto":("Sec+ Crypto", "#eab308"),
    "az-104":              ("AZ-104",      "#06b6d4"),
    "ai-900":              ("AI-900",      "#a855f7"),
    "ai-102":              ("AI-102",      "#a855f7"),
    "ehe":                 ("EHE",         "#c026d3"),
}

def main():
    mpath = os.path.join(GAL, "manifest.json")
    manifest = json.load(open(mpath))
    for hid, (name, color) in CERT.items():
        entry = manifest.get(hid)
        if not entry:
            print("  SKIP (not in manifest):", hid); continue
        src = os.path.join(STAGING, entry["source"] + ".webp")   # original pure scene
        if not os.path.exists(src):
            print("  SKIP (no source scene):", src); continue
        out = os.path.join(GAL, hid + ".webp")
        composite(src, out, name, color)
        entry["mark"] = name
    json.dump(manifest, open(mpath, "w"), indent=2)
    print("done:", len(CERT), "cert marks composited")

if __name__ == "__main__":
    main()
