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

    # ── derived hubs (2026-07-26 catalog expansion). Same rules: original generic scenes, no brand/logo. ──
    # cert-prep
    "ccna":              ("web",           "a neon enterprise routing and switching lab, glowing network topology, VLAN and routing paths of light, switch and router status lights"),
    "cysa-plus":         ("shield",        "a cyber analyst's threat-hunting desk, glowing behavioral-analytics dashboards, alert timelines, anomaly heatmaps"),
    "casp-plus":         ("shield",        "a security architect's command wall, layered enterprise-defense blueprints in glowing lines, risk-governance holograms"),
    "comptia-linux":     ("matrix",        "a green-lit Linux terminal grove, cascading shell commands, glowing filesystem trees, kernel and daemon light"),
    "aws-ccp":           ("cloud",         "a luminous cloud-infrastructure diagram, glowing compute and storage nodes in a neon sky, cloud-scale data flows"),
    "aws-developer":     ("cloud",         "a serverless cloud-development scene, glowing function pipelines and API gateways, event-driven data streams"),
    "azure-fundamentals":("cloud",         "a neon cloud-services landscape, glowing resource groups and virtual networks, a cloud control plane of light"),
    "security-operations":("eye",          "a security operations center, a wall of live threat dashboards, incident-response glow, analyst silhouettes at monitoring stations"),
    "devops-fundamentals":("code",         "a glowing CI/CD pipeline, containers flowing through automated build-and-deploy stages, infrastructure-as-code streams"),
    "cryptography-track":("key",           "a vault of glowing cryptographic keys and ciphers, streams of encrypted light, a lattice of encryption algorithms"),
    "security-plus-crypto":("key",         "an encryption chamber, glowing hash functions and key exchanges, cipher streams weaving through neon locks"),
    "az-104":            ("cloud",         "an Azure-style cloud administration control room, glowing virtual machines and network resources, a governance console"),
    "ai-900":            ("ai",            "a luminous neural network unfolding, glowing nodes and weighted connections, an AI model taking shape in purple light"),
    "ai-102":            ("ai",            "an AI engineer's workstation, glowing cognitive-service pipelines, computer-vision and language models rendered as light"),
    "ehe":               ("dark-arts",     "an ethical hacker's neon lair, glowing exploit frameworks and reconnaissance maps, a hooded figure at penetration-test terminals"),
    # platform-hub containers
    "cortex":            ("ai",            "a glowing artificial cortex, a vast neural lattice of light, machine-learning data streams converging into intelligence"),
    "code-armory":       ("code",          "a neon armory of programming languages, glowing racks of code syntax, luminous language sigils on a wall of light"),
    "algorithm-chamber": ("code",          "a chamber of glowing algorithms, sorting and graph structures as light, data structures floating in neon space"),
    "proving-grounds":   ("dark-arts",     "a red-team proving ground, glowing attack-path graphs, capture-the-flag arenas of light, an offensive-security battlefield"),
    "backbone":          ("web",           "a glowing network backbone, high-capacity fiber trunks pulsing with data, core routers and a spine-and-leaf topology of light"),
    # courses
    "intro-networks":    ("web",           "a first networking lab, glowing cables connecting switches and hosts, an OSI-layer stack in light, introductory topology"),
    "net-essentials":    ("web",           "essential networking gear on a neon bench, glowing patch panels and cabling, subnet diagrams of light"),
    "cloud-essentials":  ("cloud",         "a cloud-essentials scene, glowing virtualization and cloud service nodes, foundational cloud architecture in neon"),
    "hardware-support":  ("forge",         "a hardware support bench, glowing open PC chassis, motherboards, RAM and drives under neon repair light"),
    "intro-security":    ("shield",        "an introductory security scene, a glowing shield over a data core, first-line firewalls and access controls in neon"),
    "cybersecurity-ethics":("divergent",   "an ethical crossroads in cybersecurity, glowing scales weighing privacy and access, a neon moral decision tree"),
    "linux-essentials":  ("script",        "an essential Linux terminal, glowing basic shell commands, a penguin motif in neon light, foundational command-line"),
    "linux-mastery":     ("script",        "a master's Linux command sanctum, cascading advanced shell pipelines, glowing text-processing streams, deep terminal mastery"),
    "grep-pipe-mastery": ("script",        "streams of text flowing through glowing pipes and filters, regex patterns of light, a command-line data-processing forge"),
    "databases":         ("code",          "a neon database landscape, glowing relational tables and query streams, indexed data structures pulsing with light"),
    "zero-to-python":    ("code",          "a beginner's coding journey rendered as a luminous serpent of light rising from darkness into neon, first scripts glowing"),
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
