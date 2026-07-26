#!/usr/bin/env python3
"""
Batch cover generator for ALL hubs (cover-cartridge system). Drives gen_cover.gen() over a curated
per-hub scene map so every hub gets a domain-appropriate neon-noir cover in its house color.

Every SUBJECT here is an ORIGINAL, generic tech/security scene. No real brand, product logo,
franchise, character, or copyrighted work is referenced; cert marks are composited separately later
from our own assets. Covers carry no text (the title is added by the card).

Usage:
  python3 _tools/covers/gen_batch.py --dry-run          # print slug + prompt for each, no fal calls
  python3 _tools/covers/gen_batch.py --count 2          # generate 2 variations per hub into staging
  python3 _tools/covers/gen_batch.py --only network-plus,security-plus --count 3
"""
import os, sys, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_cover import gen, build_prompt

# hub id -> (house-for-accent, original scene subject)
HUBS = {
    "wireshark":     ("eye",           "streams of captured network packets flowing through a neon protocol analyzer, glowing hex data lanes, deep packet inspection"),
    "forensics":     ("eye",           "a digital forensics lab, glowing evidence fragments under examination, magnified data, reconstructed timeline"),
    "bug-hunting":   ("dark-arts",     "a neon web of software vulnerabilities, a hunter's magnifier over glowing exploit code, subtle spider motif"),
    "signal":        ("signal",        "an electronics workbench, glowing circuit boards, oscilloscope waveforms, soldering iron light, a radio antenna"),
    "arctic-cli":    ("arctic",        "a frozen data center under aurora light, a glowing command-line terminal amid neon ice, cold prompt cursor"),
    "network-plus":  ("web",           "a vast network operations center, glowing fiber-optic cables and switches, holographic network topology, router status lights"),
    "cyberops":      ("eye",           "a security operations center war room, a wall of threat-monitoring dashboards, red incident-alert glow, analyst silhouette"),
    "aplus-core1":   ("forge",         "a technician's neon hardware repair bench, open PC chassis, motherboards and circuit boards, glowing diagnostic screens"),
    "aplus-core2":   ("forge",         "a neon workshop of operating systems and mobile devices, glowing OS installs, laptops and phones on a repair bench"),
    "md-100":        ("forge",         "a Windows client deployment workstation, glowing device-configuration screens, neon enterprise desktop"),
    "md-101":        ("forge",         "an enterprise device-management command desk, a fleet of glowing managed laptops, neon dashboards"),
    "feh":           ("eye",           "an ethical hacker's noir workstation, glowing penetration-test terminals, forensic evidence, a hooded analyst"),
    "python-hub":    ("code",          "cascading luminous code forming a serpent of light coiling through a neon data landscape"),
    "python-for-it": ("code",          "an IT automation scene, glowing scripts flowing through server pipelines, a coil of light-code"),
    "security-plus": ("security-plus", "a cyber-defense command center, holographic shields and firewalls, intrusion alerts, a guardian silhouette"),
    "isc2-cc":       ("shield",        "a certified cyber guardian before a shielded glowing data core, a neon security emblem of light"),
    "server-plus":   ("cloud",         "a towering neon server farm, blade servers and cooling glow, data pulsing through racks"),
    "wsa":           ("cloud",         "a Windows server administration control room, glowing datacenter racks, a neon management console"),
    "adv-linux":     ("matrix",        "a cathedral of green-lit terminals, cascading shell commands, root-access glow"),
    "ethics-it":     ("divergent",     "scales of justice rendered in glowing circuitry at an ethical crossroads, a neon moral dilemma"),
    "domino-effect": ("divergent",     "a chain reaction of glowing data-block dominoes toppling through a neon policy landscape"),
    "infosec":       ("shield",        "a fortress of encrypted data, glowing padlocks and layered firewalls, a neon security perimeter"),
}

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--count", type=int, default=2)
    ap.add_argument("--size", default="square_hd")
    ap.add_argument("--only", default="", help="comma-separated hub ids to limit to")
    a = ap.parse_args()
    only = set(x.strip() for x in a.only.split(",") if x.strip())
    items = [(k, v) for k, v in HUBS.items() if (not only or k in only)]
    print(f"{len(items)} hub(s), {a.count} variation(s) each = {len(items)*a.count} images\n")
    for slug, (house, subject) in items:
        if a.dry_run:
            print(f"[{slug}]  ({house})\n  {build_prompt(subject, house)}\n")
        else:
            gen(slug, subject, house, a.count, a.size)
