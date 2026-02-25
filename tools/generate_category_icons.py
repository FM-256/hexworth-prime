"""
Hexworth Prime — Module Category Icon Generator
Generates 79 category icons for module selector cards via fal.ai FLUX.1 [dev].

Usage:
  pip install fal-client requests Pillow
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_category_icons.py

Output: _app/assets/images/categories/{category}.webp (256x256)
"""

import os
import io
import time
import random
import requests
import fal_client
from PIL import Image

# ---------------------------------------------------------------------------
# Style constants — dark badge/icon style matching Hexworth aesthetic
# ---------------------------------------------------------------------------

STYLE = """dark navy background (#0a0a1a), centered icon design,
cyberpunk digital art, neon glow on dark background,
clean minimalist composition, professional badge icon,
no text no letters no words no writing no labels"""

# ---------------------------------------------------------------------------
# All 79 categories — (categoryId, concept prompt)
# ---------------------------------------------------------------------------

CATEGORIES = [
    ("access-control",
     "glowing digital padlock with fingerprint scanner overlay, biometric authentication, identity shield, cyan and pink neon glow"),

    ("api-development",
     "interconnected API endpoints as glowing nodes, REST arrows flowing between services, curly braces and JSON brackets, green neon glow"),

    ("aplus-core1",
     "motherboard circuit board with CPU and RAM slots glowing, soldering iron and multimeter tools, golden amber neon glow"),

    ("aplus-core2",
     "Windows desktop screen with control panel gears overlay, system settings icons, administrative tools, blue-white neon glow"),

    ("architecture",
     "blueprint wireframe of a zero-trust network fortress, layered security zones, architectural diagram, teal neon glow"),

    ("asymmetric-crypto",
     "two ornate keys intertwined — one gold one silver, elliptic curve mathematical graph behind them, pink-magenta neon glow"),

    ("aws",
     "stylized AWS cloud cube with Lambda, EC2, S3 bucket icons orbiting, orange-yellow neon glow on dark background"),

    ("certifications",
     "glowing certification badge seal with laurel wreath, exam scroll, professional credential emblem, gold neon glow"),

    ("cicd",
     "infinity loop pipeline with gear stages, automated deployment conveyor belt, green and blue neon glow"),

    ("clh",
     "hacker terminal with green cascading text, command prompt skull icon, dark matrix aesthetic, bright green (#00ff41) neon glow"),

    ("cloud-security",
     "cloud fortress with shield embedded in cumulus, firewall barriers around server infrastructure, cyan-blue neon glow"),

    ("cloud-security-engineering",
     "cloud architecture blueprint with security locks at each layer, IAM keys and encryption symbols, blue-purple neon glow"),

    ("command-line",
     "terminal window with blinking cursor, bash prompt commands flowing, command-line interface, green neon glow"),

    ("compliance",
     "legal gavel on a compliance checklist, regulatory shield with checkmarks, governance scroll, gold-amber neon glow"),

    ("containerization",
     "Docker whale carrying shipping containers, Kubernetes helm wheel orbiting, container orchestration, blue neon glow"),

    ("containers",
     "stacked shipping containers with digital circuit patterns, microservices architecture, blue-cyan neon glow"),

    ("crypto-protocols",
     "TLS handshake visualized as two hands exchanging encrypted data, padlock chain between endpoints, green neon glow"),

    ("cryptography",
     "cipher wheel with rotating encryption rings, mathematical symbols and binary code spiral, purple-violet neon glow"),

    ("ctf",
     "capture the flag banner on a digital fortress, binary flag waving, hacker competition trophy, red and cyan neon glow"),

    ("cyber-framework",
     "NIST framework columns as glowing pillars, governance structure pyramid, legal shield, blue-amber neon glow"),

    ("cyberops",
     "security operations command center with multiple monitoring screens, radar sweep, Cisco shield, teal-cyan neon glow"),

    ("cyberops-evaluations",
     "digital exam paper with checkboxes glowing, assessment gauge meter, evaluation score display, cyan neon glow"),

    ("cyberops-labs",
     "hands-on cyber lab workstation with virtual machines running, terminal windows open, practice environment, cyan-green neon glow"),

    ("cysa-plus",
     "security analyst magnifying glass over threat data, CompTIA plus badge, analysis dashboard, blue-purple neon glow"),

    ("devops-automation",
     "robotic arm assembling a CI/CD pipeline, automation gears and scripts, DevOps infinity symbol, orange-blue neon glow"),

    ("display-tech",
     "monitor cross-section showing pixel layers, OLED vs LCD comparison, display resolution grid, white-blue neon glow"),

    ("encryption-fundamentals",
     "simple padlock transforming plaintext into ciphertext blocks, encryption basics visual, green neon glow"),

    ("feh-course",
     "hooded ethical hacker figure with reconnaissance tools, OSINT magnifying glass, vulnerability scanner, dark purple neon glow"),

    ("fundamentals",
     "CIA triad triangle (Confidentiality Integrity Availability) glowing, foundational shield, core security emblem, blue neon glow"),

    ("games",
     "retro arcade joystick with cybersecurity symbols on the buttons, gamified learning controller, neon multi-color glow"),

    ("gates",
     "massive ornate gate with five locks, challenge progression path, dark arts entrance, deep purple neon glow"),

    ("general",
     "Swiss army knife with tech tool attachments (wrench, screwdriver, cable), multi-purpose IT tool, silver neon glow"),

    ("hardware-components",
     "exploded view of a PC with motherboard, CPU, GPU, RAM floating, hardware anatomy, golden-amber neon glow"),

    ("hashing-algorithms",
     "data flowing through a hash function grinder, input arrow to fixed-length output block, integrity chain, blue-green neon glow"),

    ("incident-investigation",
     "magnifying glass over a timeline of events, forensic evidence pins on a digital board, detective, amber-red neon glow"),

    ("infrastructure-as-code",
     "Terraform/CloudFormation template as a glowing blueprint, code defining cloud infrastructure, purple-blue neon glow"),

    ("ip-addressing",
     "IPv4 octets in dotted decimal with subnet mask overlay, binary conversion grid, network layer, blue neon glow"),

    ("key-management",
     "key vault door with HSM hardware module, key lifecycle arrows (generate store rotate destroy), pink-gold neon glow"),

    ("labs",
     "hands-on lab bench with networking equipment, Packet Tracer topology, cables and switches, green-blue neon glow"),

    ("linux",
     "Tux penguin silhouette with terminal overlay, bash shell prompt, Linux kernel symbol, green neon glow"),

    ("linux-admin",
     "Linux server rack with terminal console, systemd service tree, admin control panel, purple-green neon glow"),

    ("linux-administration",
     "hardened Linux server with firewall rules, audit log scrolling, security hardening shield, green-amber neon glow"),

    ("linux-labs",
     "hands-on Linux terminal with file system tree visible, interactive lab environment, green neon glow"),

    ("log-analysis",
     "scrolling log files with highlighted anomaly lines, log parser magnifying glass, data patterns, cyan-amber neon glow"),

    ("md-100",
     "Windows 10/11 logo with deployment tools, Microsoft certification badge overlay, blue-white neon glow"),

    ("memory-processing",
     "CPU die with cache layers visible, RAM stick with binary data flowing, processor architecture, blue-amber neon glow"),

    ("network-monitoring",
     "Wireshark-style packet capture display, network traffic flow visualization, monitoring dashboard, cyan neon glow"),

    ("network-security",
     "firewall barrier with traffic rules, IDS/IPS shield, network defense perimeter, red-blue neon glow"),

    ("networking",
     "network topology with routers switches and endpoints connected, data packets flowing, OSI layers, blue neon glow"),

    ("offensive-tools",
     "Nmap scan radar sweep with open ports revealed, penetration testing toolkit, hacker tools, red neon glow"),

    ("openstack",
     "OpenStack cloud dashboard with compute/storage/network panels, open-source cloud stack, red-white neon glow"),

    ("operations",
     "incident response war room with screens showing attack timeline, IR playbook, operations center, red-cyan neon glow"),

    ("peripheral-devices",
     "collection of peripherals — mouse, keyboard, printer, scanner — connected to a central hub, multi-color neon glow"),

    ("pki-certificates",
     "X.509 certificate with chain of trust hierarchy, certificate authority seal, digital signature, green-gold neon glow"),

    ("powershell",
     "PowerShell blue terminal with cmdlet pipeline flowing, automation script, Windows scripting, blue-white neon glow"),

    ("practical-applications",
     "applied cryptography toolkit with attack/defense scenarios, cryptanalysis tools, real-world crypto, red-purple neon glow"),

    ("presentations",
     "slide deck presentation with networking diagrams, educational slides, instructor materials, blue-white neon glow"),

    ("python",
     "Python snake coiled around a code editor, script automation symbols, programming language emblem, yellow-green neon glow"),

    ("risk-management",
     "risk matrix heat map with likelihood and impact axes, CMMC compliance shield, assessment gauge, amber-red neon glow"),

    ("routing-switching",
     "network router with routing table overlay, OSPF/EIGRP protocol arrows, switching VLAN diagram, blue-green neon glow"),

    ("security-operations",
     "SOC analyst workstation with SIEM dashboard, alert triage queue, operations workflow, teal neon glow"),

    ("siem-fundamentals",
     "Splunk-style search bar with event correlation dashboard, SIEM log aggregation funnel, purple-cyan neon glow"),

    ("simulators",
     "virtual sandbox environment with security tools running, Burp Suite and SQLMap interfaces, orange-green neon glow"),

    ("storage-tech",
     "RAID array of hard drives with data striping visualization, SSD vs HDD cross-section, blue-amber neon glow"),

    ("symmetric-crypto",
     "single ornate key with AES block cipher grid, symmetric encryption padlock, same-key-both-sides concept, cyan neon glow"),

    ("sysadmin",
     "system administrator control panel with server health gauges, package manager, automation scripts, green-purple neon glow"),

    ("threat-detection",
     "threat hunting crosshair targeting a hidden anomaly in data, detection radar, hunt workbench, red-amber neon glow"),

    ("threats",
     "collection of threat actor silhouettes with YARA rules overlay, attack vectors web, malware types, red neon glow"),

    ("tools",
     "cloud comparison dashboard with provider logos as silhouettes, utility toolkit, cloud platform tools, blue neon glow"),

    ("troubleshooting",
     "system diagnostic toolkit with error magnifying glass, troubleshooting flowchart, repair wrench, amber-yellow neon glow"),

    ("vault",
     "massive vault door half-open revealing malware specimens inside, dark analysis chamber, deep purple neon glow"),

    ("vault-labs",
     "malware analysis workbench with sandbox VM running, disassembly view, behavioral analysis tools, purple-green neon glow"),

    ("vault-presentations",
     "cyber kill chain as a cascading attack diagram, botnet C2 architecture slide, dark presentation, purple-red neon glow"),

    ("vault-tools",
     "malware analysis toolkit — hex editor, debugger, PE viewer arranged on a workbench, dark purple-cyan neon glow"),

    ("version-control",
     "Git branch tree with merge arrows, commit timeline, version history graph, green-orange neon glow"),

    ("visualizers",
     "OSI model as 7 glowing interactive layers, TCP/IP stack visualization, educational diagram, blue-cyan neon glow"),

    ("windows-os",
     "Windows logo with system settings overlay, OS administration tools, Windows shell, blue-white neon glow"),

    ("wireless",
     "wireless access point radiating signal waves, WiFi antenna with 802.11 protocol overlay, cyan-blue neon glow"),

    ("wsa",
     "Windows Server rack with Active Directory tree, Hyper-V containers, server administration console, blue-purple neon glow"),
]

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL = "fal-ai/flux/dev"
IMAGE_SIZE = {"width": 256, "height": 256}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "_app", "assets", "images", "categories")
os.makedirs(OUT_DIR, exist_ok=True)

SLEEP_BETWEEN = 1.0
MAX_RETRIES = 6
BASE_BACKOFF = 2.0
NUM_INFERENCE_STEPS = 28
GUIDANCE_SCALE = 3.5


def make_prompt(category_id, concept):
    return f"""{concept},
{STYLE}
icon-badge digital-art cyberpunk-icon neon-dark
""".strip()


def generate_with_retries(prompt):
    """Call fal.ai FLUX and return raw PNG bytes."""
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = fal_client.subscribe(
                MODEL,
                arguments={
                    "prompt": prompt,
                    "image_size": IMAGE_SIZE,
                    "num_images": 1,
                    "num_inference_steps": NUM_INFERENCE_STEPS,
                    "guidance_scale": GUIDANCE_SCALE,
                    "output_format": "png",
                    "enable_safety_checker": False,
                },
            )
            img_url = result["images"][0]["url"]
            resp = requests.get(img_url, timeout=60)
            resp.raise_for_status()
            return resp.content

        except Exception as e:
            last_err = e
            sleep_s = (BASE_BACKOFF ** attempt) + random.uniform(0, 1.0)
            print(f"\n  [retry {attempt}/{MAX_RETRIES}] {e} — waiting {sleep_s:.1f}s")
            time.sleep(sleep_s)

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries") from last_err


def png_to_webp(png_bytes, quality=82):
    """Convert PNG bytes to WebP bytes via Pillow."""
    img = Image.open(io.BytesIO(png_bytes))
    img = img.resize((256, 256), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality)
    return buf.getvalue()


def main():
    if not os.getenv("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable not set.")
        print('  export FAL_KEY="your-fal-key-here"')
        raise SystemExit(1)

    total = len(CATEGORIES)
    print(f"Hexworth Prime — Category Icon Generator (fal.ai FLUX.1 [dev])")
    print(f"Output: {os.path.abspath(OUT_DIR)}")
    print(f"Categories: {total}")
    print(f"Size:   {IMAGE_SIZE['width']}x{IMAGE_SIZE['height']} (1:1 square)")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for i, (cat_id, concept) in enumerate(CATEGORIES, 1):
        webp_path = os.path.join(OUT_DIR, f"{cat_id}.webp")

        if os.path.exists(webp_path):
            print(f"  [{i:2d}/{total}] [skip] {cat_id} (exists)")
            skipped += 1
            continue

        prompt = make_prompt(cat_id, concept)
        print(f"  [{i:2d}/{total}] [gen]  {cat_id} ...", end=" ", flush=True)

        try:
            png_bytes = generate_with_retries(prompt)
            webp_bytes = png_to_webp(png_bytes)
            with open(webp_path, "wb") as f:
                f.write(webp_bytes)
            print(f"OK ({len(webp_bytes):,} bytes)")
            generated += 1
        except Exception as e:
            print(f"FAILED: {e}")
            failed += 1

        time.sleep(SLEEP_BETWEEN)

    print()
    print(f"Done — Generated: {generated} | Skipped: {skipped} | Failed: {failed}")


if __name__ == "__main__":
    main()
