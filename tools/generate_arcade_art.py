"""
Hexworth Prime — Arcade Game Card Art Generator
Generates cartridge/cover art for all 86 arcade games via fal.ai FLUX.1 [dev].

Usage:
  pip install fal-client requests
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_arcade_art.py

Output: _app/assets/images/arcade/{gameId}.png (512x512, 1:1 square)

Skips images that already have a PNG or WebP. Safe to re-run after interruption.
"""

import os
import time
import random
import requests
import fal_client

# ---------------------------------------------------------------------------
# All 86 arcade games — (gameId, title, art concept)
# gameId derived from href: last path segment minus .html
# ---------------------------------------------------------------------------

GAMES = [
    # ═══════════════════════════════════════════════════════════════
    # TEXT ADVENTURES (15)
    # ═══════════════════════════════════════════════════════════════
    ("script-sudo-su", "sudo su",
     "Dark Linux terminal showing root prompt with skull, rootkit hunt through filesystem directories, ominous red glow from deep inside the machine"),
    ("web-nmap", "nmap",
     "Corporate network as a dark dungeon map with glowing open ports, nmap scan beams revealing hidden services, explorer with network scanner torch"),
    ("shield-incident-response", "--incident",
     "SOC analyst at a wall of red alert screens, live breach in progress, ticking clock, emergency incident response, dramatic alarm lighting"),
    ("key-gpg-decrypt", "gpg --decrypt",
     "Spy thriller scene with encrypted envelope being opened by golden GPG key, cipher text transforming to plaintext, espionage atmosphere"),
    ("eye-grep-noir", "grep -rn",
     "Film noir detective in trenchcoat searching through stacks of log files, magnifying glass on suspicious lines, noir shadows and rain"),
    ("forge-fsck", "fsck",
     "Technician trapped inside a failing data center, sparking servers, disk sectors crumbling, emergency filesystem repair, red warning lights"),
    ("code-git-blame", "git blame",
     "Detective pointing at a git commit history timeline, supply chain attack in CI/CD pipeline, blame annotations revealing the culprit"),
    ("cloud-aws-sts", "aws sts",
     "Cloud heist scene with dollar counter spinning at $500/min, AWS console showing stolen credentials, cloud tokens scattering, urgent atmosphere"),
    ("shield-tor-darkweb", "tor",
     "Onion layers peeling back in a dark web investigation, .onion addresses floating, OSINT agent navigating hidden services, dark purple glow"),
    ("code-kill-nine.applet", "kill -9",
     "Rogue AI face glitching on screens, SIGKILL lightning bolt striking processes, digital uprising, terminal showing kill command, glitch effects"),
    ("cloud-text-adventure-whoami", "whoami",
     "Robot having identity crisis in the cloud, multiple IAM roles swirling around, 'whoami' on terminal, existential cloud computing"),
    ("script-text-adventure-chmod777", "chmod 777",
     "Permission nightmare — doors flying open everywhere, 777 in red warning, clock showing 8:59 AM deadline, frantic sysadmin"),
    ("eye-text-adventure-wireshark", "Deep Packet Dive",
     "Diver plunging into an ocean of network packets, Wireshark-style packet headers floating, APT shark lurking in the depths"),
    ("shield-text-adventure-hydra", "Hydra Protocol",
     "Multi-headed cyber hydra attacking a fortress, each severed head spawning two more, brute force visualization, overwhelming threat"),
    ("code-text-adventure-rmrf", "rm -rf /",
     "Point of no return — filesystem tree disintegrating into void, desperate recovery attempt, catastrophic data loss, dramatic red glow"),

    # ═══════════════════════════════════════════════════════════════
    # PIXEL RUNNERS (5)
    # ═══════════════════════════════════════════════════════════════
    ("web-packet-run.applet", "Packet Run",
     "Network packet character surfing through firewall barriers, side-scrolling action, neon data stream highway, packet dodging obstacles"),
    ("forge-bit-dash.applet", "Bit Dash",
     "Binary bit character dashing across motherboard circuit traces, electronic components as obstacles, pixel art speed run, copper paths"),
    ("script-shell-sprint.applet", "Shell Sprint",
     "Terminal cursor character sprinting through a Linux filesystem, command prompts as platforms, shell environment obstacle course"),
    ("shield-threat-runner.applet", "Threat Runner",
     "SOC analyst shield character running through incoming cyber threats, dodging malware and exploits, defensive sprint"),
    ("cloud-hop.applet", "Cloud Hop",
     "Container character hopping between cloud platform islands, AWS-Azure-GCP stepping stones, cloud platformer, sky-high action"),

    # ═══════════════════════════════════════════════════════════════
    # FLAPPY BIRD CHALLENGES (5)
    # ═══════════════════════════════════════════════════════════════
    ("web-packet-flap", "Packet Flap",
     "Winged network packet flying through firewall gap obstacles, flappy-style flight, green firewall walls, packet with tiny wings"),
    ("script-sudo-flap", "Sudo Flap",
     "Green terminal cursor with wings flying through permission wall obstacles, sudo elevation, flappy terminal, green-on-black"),
    ("shield-exploit-flap", "Exploit Flap",
     "Shield with wings dodging CVE vulnerability pillars, exploit defense flight, red danger walls, protective flapping"),
    ("cloud-flap", "Cloud Flap",
     "EC2 instance with wings navigating through server rack corridors, cloud computing flight, flappy cloud obstacles"),
    ("key-crypto-flap", "Crypto Flap",
     "Golden key with wings flying through encryption barrier gates, cipher walls, cryptographic flight, golden glow"),

    # ═══════════════════════════════════════════════════════════════
    # CHALLENGES & REVIEWS (20)
    # ═══════════════════════════════════════════════════════════════
    ("web-subnet-siege", "Subnet Siege",
     "Castle under siege with subnet mask calculations as artillery, IP address ranges as battle lines, network warfare, timed pressure"),
    ("web-protocol-stack", "Protocol Stack",
     "Seven-layer OSI tower being assembled with protocol blocks, each layer a different color, Tetris-style protocol matching"),
    ("web-dns-resolver-race", "DNS Resolver Race",
     "DNS query racing through resolver chain — root, TLD, authoritative — speed competition, globe with racing paths"),
    ("web-api-interceptor", "API Interceptor",
     "Burp Suite-style proxy intercepting API traffic, request/response being examined mid-flight, hacker analysis station"),
    ("forge-binary-blitz", "Binary Blitz",
     "Binary digits flying at speed, converter machine transforming 1s and 0s to decimal and hex, blitz-mode pressure"),
    ("forge-backup-or-bust", "Backup or Bust",
     "Disaster recovery scene — data bomb about to explode, backup tapes and cloud sync racing to save data, 3-2-1 rule"),
    ("forge-aplus-jeopardy.applet", "A+ Jeopardy",
     "Jeopardy game show stage with CompTIA A+ categories on the board, contestant podiums, trivia championship"),
    ("script-terminal-velocity", "Terminal Velocity",
     "Hands speed-typing Linux commands on a terminal, velocity blur, command streak, fastest fingers, terminal mastery"),
    ("script-permission-puzzle", "Permission Puzzle",
     "Linux permission puzzle grid with rwx pieces being arranged, chmod combinations, lock-and-key puzzle mechanics"),
    ("script-regex-runner", "Regex Runner",
     "Runner chasing matching text patterns, regex symbols as obstacles and power-ups, pattern matching sprint"),
    ("key-hash-cracker", "Hash Cracker",
     "Hash value vault being cracked open, rainbow table scrolling, MD5/SHA hashes shattering to reveal plaintext"),
    ("cloud-wsa-review.module", "WSA Review",
     "Windows Server control room with Jeopardy-style knowledge board, Active Directory trees, server management review"),
    ("eye-cyberops-review", "CyberOps Review",
     "SOC operations center Jeopardy board, incident response categories, security operations knowledge challenge"),
    ("shield-feh-review", "FEH Review",
     "Ethical hacking workstation with Jeopardy categories, penetration testing tools, security review challenge board"),
    ("script-linux-cli-review", "Linux CLI Review",
     "Linux penguin at Jeopardy podium, command line categories on the board, terminal knowledge competition"),
    ("forge-aplus-core1-review", "A+ Core 1 Review",
     "Hardware workbench with Jeopardy board showing Core 1 categories, motherboard and components, trivia review"),
    ("forge-aplus-core2-review", "A+ Core 2 Review",
     "Software troubleshooting desk with Jeopardy board showing Core 2 categories, OS and security topics"),
    ("forge-raid-calculator.applet", "RAID Calculator",
     "Array of hard drives being configured into RAID formations, calculator interface, striping and mirroring visualization"),
    ("key-cipher-cracker.presentation", "Cipher Cracker",
     "Cipher wheel spinning to decode encrypted messages, cryptographic puzzle being solved, key-shaped revelation"),
    ("shield-malware-zoo.lab", "Malware Zoo",
     "Containment facility with malware specimens in glass jars — trojans, worms, ransomware — classification lab"),

    # ═══════════════════════════════════════════════════════════════
    # LABS (15)
    # ═══════════════════════════════════════════════════════════════
    ("script-cron-builder.lab", "Cron Job Builder",
     "Clock mechanism with cron schedule expressions orbiting, scheduled task builder, precise timing gears and automation"),
    ("script-patch-tuesday.lab", "Patch Tuesday",
     "Patch Tuesday calendar page with vulnerability bulletins, triage prioritization board, CVE severity colors"),
    ("key-firewall-builder.lab", "Firewall Builder",
     "Brick-by-brick firewall construction, ACL rules as building blocks, network barrier being assembled, builder tools"),
    ("eye-log-detective.lab", "Log Detective",
     "Detective analyzing log files spread across a desk, suspicious entries highlighted, forensic log investigation"),
    ("eye-incident-timeline.lab", "Incident Timeline",
     "Horizontal breach timeline with event markers, forensic reconstruction, temporal analysis board, evidence pins"),
    ("web-packet-sniffer.applet", "Packet Sniffer",
     "Wireshark-style packet capture interface, shark analyzing packet data, network forensics tool, deep packet inspection"),
    ("web-network-architect.applet", "Network Architect",
     "Architect at a holographic network topology drafting table, drag-and-drop switches and routers, blueprint design"),
    ("eye-alert-triage", "Alert Triage",
     "Alert prioritization command center, red-amber-green severity sorting, cascading security alerts, triage dashboard"),
    ("eye-memory-forensics.applet", "Memory Forensics",
     "RAM chip under forensic microscope, memory dump analysis, volatile evidence extraction, Volatility-style analysis"),
    ("eye-threat-modeler", "Threat Modeler",
     "STRIDE threat model diagram with attack surface mapping, threat categories branching, architectural security analysis"),
    ("code-kubernetes-rescue.applet", "Kubernetes Rescue",
     "Kubernetes pods in distress — CrashLoopBackOff — rescue operator using kubectl, container orchestration emergency"),
    ("shield-sql-injection-defense", "SQL Injection Defense",
     "WAF shield blocking SQL injection syringe attacks, input sanitization, database defense, parameterized protection"),
    ("cloud-iam-debugger", "IAM Policy Debugger",
     "Tangled IAM policy tree being debugged, allow/deny paths highlighted, identity access management repair"),
    ("cloud-architect", "Cloud Architect",
     "Cloud architecture blueprint with multi-tier design, VPC, subnets, load balancers, well-architected framework"),
    ("shield-social-engineer", "Social Engineer",
     "Human silhouette resisting manipulation strings, social engineering defense training, theater masks, awareness"),

    # ═══════════════════════════════════════════════════════════════
    # CHALLENGES / PUZZLES (6)
    # ═══════════════════════════════════════════════════════════════
    ("web-wireless-warzone.applet", "Wireless Warzone",
     "WiFi signal battlefield with rogue access points and deauth attacks, wireless monitoring station, signal warfare"),
    ("code-pipeline-panic", "Pipeline Panic",
     "CI/CD pipeline on fire with red build failures, frantic engineer fixing stages before deployment, pipeline emergency"),
    ("code-git-bisect", "Git Bisect",
     "Git commit tree with binary search highlighting the bug-introducing commit, bisect narrowing down, detective work"),
    ("code-docker-escape", "Docker Escape Room",
     "Character breaking out of a Docker container box, container escape puzzle room, whale-shaped room, breakout"),
    ("cloud-ad-attack-path.applet", "AD Attack Path",
     "BloodHound-style Active Directory graph with privilege escalation path highlighted, attack path discovery, red arrows"),

    # ═══════════════════════════════════════════════════════════════
    # RETRO ARCADE (11)
    # ═══════════════════════════════════════════════════════════════
    ("key-cipher-bubbles.applet", "Cipher Bubbles",
     "Bubble Bobble-style scene with cipher-type enemies trapped in encrypted bubbles, pop and decode, retro arcade"),
    ("forge-chip-match.applet", "Chip Match",
     "Match-3 grid of hardware components — CPUs, RAM sticks, GPUs — being matched to build server racks, retro puzzle"),
    ("shield-dr-malware.applet", "Dr. Malware",
     "Dr. Mario-style scene dropping antivirus capsules onto malware infections, pill-shaped cures, virus elimination"),
    ("web-packet-invaders.applet", "Packet Invaders",
     "Space Invaders-style with hostile packet swarms descending, firewall defender ship shooting, pixel retro invasion"),
    ("script-pipe-snake.applet", "Pipe Snake",
     "Snake game where the snake is a Unix pipeline growing longer, collecting commands, pipe operators, retro grid"),
    ("key-crypto-pong.applet", "Crypto Pong",
     "Pong game with encrypted data ball bouncing between cipher paddles, encryption key scoring, retro crypto game"),
    ("eye-log-centipede.applet", "Log Centipede",
     "Centipede-style game with threat chain segments crawling through log streams, log-based shooting gallery"),
    ("code-build-breaker.applet", "Build Breaker",
     "Breakout/Arkanoid-style with CI/CD pipeline blocks being shattered, green build emerging from broken red blocks"),
    ("forge-rack-stack.applet", "Rack Stack",
     "Tetris-style server hardware stacking into data center racks, U-height fitting, rack unit puzzle, hardware Tetris"),
    ("shield-threat-swarm.applet", "Threat Swarm",
     "Galaga-style cyber threat formations swooping down, IDS defender intercepting coordinated attacks, space defense"),
    ("cloud-destroyer.applet", "Cloud Destroyer",
     "Asteroids-style with rogue cloud instances as debris, ship terminating instances, cloud destruction field, space"),

    # ═══════════════════════════════════════════════════════════════
    # DON'T SERIES (10)
    # ═══════════════════════════════════════════════════════════════
    ("web-dont-drop-the-packet", "Don't Drop the Packet",
     "Juggler desperately keeping network packets in the air, dropping one causes chaos, network pressure, frantic balancing"),
    ("script-dont-kill-the-server", "Don't Kill the Server",
     "Server on life support with vitals monitor, engineer frantically keeping it alive under DDoS attack, heartbeat flatline threat"),
    ("key-dont-leak-the-key", "Don't Leak the Key",
     "Secret key trying to escape through various leaks — git commits, logs, env vars — guardian plugging holes, containment"),
    ("eye-dont-feed-the-troll", "Don't Feed the Troll",
     "Internet troll under a bridge being tempted with social media bait, crisis management, don't engage, restraint"),
    ("code-dont-deploy-on-friday", "Don't Deploy on Friday",
     "Friday calendar page glowing red with deploy button, temptation vs wisdom, weekend destruction looming, danger zone"),
    ("forge-dont-brick-the-pc", "Don't Brick the PC",
     "PC on the edge of a cliff about to fall and shatter, careful technician trying to save it, hardware survival"),
    ("forge-dont-anger-the-printer", "Don't Anger the Printer",
     "Angry printer beast with paper jam teeth and toner claws, office worker trying to calm the beast, printer rage"),
    ("shield-dont-get-phished", "Don't Get Phished",
     "Fishing hooks disguised as legitimate emails, defender with shield deflecting phishing lures, email battlefield"),
    ("cloud-dont-check-the-bill", "Don't Check the Bill",
     "AWS billing dashboard with numbers spiraling out of control, terrified engineer, cost explosion, dollar signs flying"),
    ("cloud-dont-lose-your-domain", "Don't Lose Your Domain",
     "Domain registration expiring, clock counting down, domain snatchers circling, desperate renewal attempt"),
]

# ---------------------------------------------------------------------------
# Style template — game cartridge cover art (more dramatic than badges)
# ---------------------------------------------------------------------------

STYLE = """
detailed digital game cover art illustration,
cinematic composition with dramatic perspective,
dark background with vibrant neon accents,
cyberpunk aesthetic with bold colors,
game cartridge cover art style,
dramatic lighting with volumetric glow,
high contrast, sharp details, professional quality,
video game key art, action scene composition,
dynamic focal point, cinematic framing,
no text, no words, no letters, no numbers, no watermark, no UI elements
""".strip()

CONSISTENCY = """
consistent cohesive art style across the entire game art set,
unified color grading and dramatic lighting,
same cinematic language and detail level
""".strip()

# House-specific accent colors for the game cards
HOUSE_COLORS = {
    "web": "electric blue and cyan",
    "script": "deep purple and violet",
    "key": "golden amber and yellow",
    "eye": "indigo and deep blue",
    "code": "hot pink and magenta",
    "forge": "blazing orange and copper",
    "shield": "crimson red and scarlet",
    "cloud": "sky cyan and white",
}

# Game type style modifiers
TYPE_STYLES = {
    "adventure": "dark atmospheric narrative scene, moody cinematic",
    "runner": "fast-paced action, speed lines, pixel energy",
    "challenge": "competitive arena, puzzle elements, challenge mode",
    "retro": "retro pixel art inspired, classic arcade aesthetic, 8-bit neon",
    "dont": "tension and pressure, ticking clock, survival scenario",
}

# Derive house from gameId prefix
def get_house(game_id):
    prefixes = {
        "web-": "web", "script-": "script", "key-": "key",
        "eye-": "eye", "code-": "code", "forge-": "forge",
        "shield-": "shield", "cloud-": "cloud"
    }
    for prefix, house in prefixes.items():
        if game_id.startswith(prefix):
            return house
    return "web"

# Derive type from game list
GAME_TYPES = {}
# Text Adventures
for gid in ["script-sudo-su", "web-nmap", "shield-incident-response", "key-gpg-decrypt",
            "eye-grep-noir", "forge-fsck", "code-git-blame", "cloud-aws-sts",
            "shield-tor-darkweb", "code-kill-nine.applet", "cloud-text-adventure-whoami",
            "script-text-adventure-chmod777", "eye-text-adventure-wireshark",
            "shield-text-adventure-hydra", "code-text-adventure-rmrf"]:
    GAME_TYPES[gid] = "adventure"
# Pixel Runners
for gid in ["web-packet-run.applet", "forge-bit-dash.applet", "script-shell-sprint.applet",
            "shield-threat-runner.applet", "cloud-hop.applet"]:
    GAME_TYPES[gid] = "runner"
# Flappy
for gid in ["web-packet-flap", "script-sudo-flap", "shield-exploit-flap",
            "cloud-flap", "key-crypto-flap"]:
    GAME_TYPES[gid] = "challenge"
# Retro
for gid in ["key-cipher-bubbles.applet", "forge-chip-match.applet", "shield-dr-malware.applet",
            "web-packet-invaders.applet", "script-pipe-snake.applet", "key-crypto-pong.applet",
            "eye-log-centipede.applet", "code-build-breaker.applet", "forge-rack-stack.applet",
            "shield-threat-swarm.applet", "cloud-destroyer.applet"]:
    GAME_TYPES[gid] = "retro"
# Don't Series
for gid in ["web-dont-drop-the-packet", "script-dont-kill-the-server", "key-dont-leak-the-key",
            "eye-dont-feed-the-troll", "code-dont-deploy-on-friday", "forge-dont-brick-the-pc",
            "forge-dont-anger-the-printer", "shield-dont-get-phished",
            "cloud-dont-check-the-bill", "cloud-dont-lose-your-domain"]:
    GAME_TYPES[gid] = "dont"


def make_prompt(game_id, title, concept):
    house = get_house(game_id)
    gtype = GAME_TYPES.get(game_id, "challenge")
    accent = HOUSE_COLORS.get(house, "neon cyan and teal")
    type_style = TYPE_STYLES.get(gtype, "competitive arena, challenge mode")

    return f"""
{concept},
{accent} accent highlights,
{type_style},

{STYLE}
{CONSISTENCY}
game-cover-art {house}-house {gtype}-genre neon-cyber
""".strip()


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL = "fal-ai/flux/dev"
IMAGE_SIZE = {"width": 512, "height": 512}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "_app", "assets", "images", "arcade")
os.makedirs(OUT_DIR, exist_ok=True)

SLEEP_BETWEEN = 0.5
MAX_RETRIES = 6
BASE_BACKOFF = 2.0
NUM_INFERENCE_STEPS = 28
GUIDANCE_SCALE = 3.5


# ---------------------------------------------------------------------------
# Generation with retry + backoff
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not os.getenv("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable not set.")
        print("  export FAL_KEY=\"your-fal-key-here\"")
        raise SystemExit(1)

    total = len(GAMES)
    print(f"Hexworth Prime — Arcade Game Art Generator (fal.ai FLUX.1 [dev])")
    print(f"Output: {os.path.abspath(OUT_DIR)}")
    print(f"Games:  {total}")
    print(f"Size:   {IMAGE_SIZE['width']}x{IMAGE_SIZE['height']} (1:1 square)")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for i, (game_id, title, concept) in enumerate(GAMES, 1):
        out_path = os.path.join(OUT_DIR, f"{game_id}.png")
        webp_path = os.path.join(OUT_DIR, f"{game_id}.webp")

        # Skip if either PNG or WebP already exists
        if os.path.exists(out_path) or os.path.exists(webp_path):
            print(f"  [{i:3d}/{total}] [skip] {game_id} — {title} (exists)")
            skipped += 1
            continue

        prompt = make_prompt(game_id, title, concept)
        print(f"  [{i:3d}/{total}] [gen]  {game_id} — {title} ...", end=" ", flush=True)

        try:
            img_bytes = generate_with_retries(prompt)
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            print(f"OK ({len(img_bytes):,} bytes)")
            generated += 1
        except Exception as e:
            print(f"FAILED: {e}")
            failed += 1

        time.sleep(SLEEP_BETWEEN)

    print()
    print(f"Done. Generated: {generated}, Skipped: {skipped}, Failed: {failed}, Total: {total}")


if __name__ == "__main__":
    main()
