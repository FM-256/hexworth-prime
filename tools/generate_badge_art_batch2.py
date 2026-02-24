"""
Hexworth Prime — Achievement Badge Art Generator (Batch 2)
Generates badge art for the 98 AchievementManager-only achievements
that were missed in the first generation pass.

Usage:
  pip install fal-client requests
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_badge_art_batch2.py

Output: _app/assets/images/badges/{achievementId}.png (512x512, 1:1 square)

Skips badges that already have a PNG or WebP. Safe to re-run after interruption.
"""

import os
import time
import random
import requests
import fal_client

# ---------------------------------------------------------------------------
# 98 AchievementManager-only badges — missing from batch 1
# Each tuple: (achievementId, name, concept for art prompt)
# ---------------------------------------------------------------------------

BADGES = [
    # ═══════════════════════════════════════════════════════════════
    # REGULAR — Streaks / Misc
    # ═══════════════════════════════════════════════════════════════
    ("first_visit", "First Steps",
     "Glowing neon footprint on a digital threshold, first login moment, door of light opening into a grand cyber academy"),
    ("streak_3", "Kindled",
     "Three small flames burning in a row on a shelf, kindling fire, first sparks of study dedication, warm amber glow"),
    ("streak_30", "Unstoppable",
     "Blazing diamond-hard flame burning through 30 calendar marks, unstoppable force, indestructible streak fire, crystal fire"),
    ("sound_master", "Attuned",
     "Sound waves emanating from a glowing speaker with harmonic rings, audio mastery, digital sound visualization, attuned ears"),

    # ═══════════════════════════════════════════════════════════════
    # DARK ARTS GATES (Manager versions — gate_1 through gate_5)
    # ═══════════════════════════════════════════════════════════════
    ("gate_1", "Initiate",
     "Ancient gate cracking open with dark purple energy, first forbidden threshold crossed, ominous purple glow, initiate step"),
    ("gate_2", "Acolyte",
     "Second mystical gate with deeper violet lightning bolts, acolyte passage, darker knowledge unlocked, two seals broken"),
    ("gate_3", "Adept",
     "Third gate with swirling dark energy, adept-level mastery, three mystical keys floating, deep purple arcane power"),
    ("gate_4", "Practitioner",
     "Fourth gate with machine gears and dark energy intertwined, practitioner of forbidden tech, mechanical arcane fusion"),
    ("gate_5", "Shadow Master",
     "Final fifth gate fully open, dark hooded figure emerging with five keys orbiting, shadow mastery complete, skull crown"),
    ("dark-arts-master", "Dark Arts Master",
     "Cloaked master standing atop all five shattered gates, dark arts mastery quiz passed, full forbidden knowledge, crimson aura"),

    # ═══════════════════════════════════════════════════════════════
    # SECRET ACHIEVEMENTS
    # ═══════════════════════════════════════════════════════════════
    ("divergent", "Divergent",
     "Glitching silhouette breaking free from digital faction labels, divergent energy, uncontainable force, electric surge escape"),
    ("god_mode", "Ascended",
     "All-seeing golden eye radiating divine light above a control panel, god mode activated, omniscient view, transcendence"),
    ("konami", "Old School",
     "Retro arcade joystick with up-up-down-down arrows glowing, classic cheat code activated, 8-bit nostalgia glow, pixel energy"),
    ("storm_gates", "Gate Crasher",
     "Figure smashing through a locked digital gate with force, backdoor breach, gate crashed open, explosive entry"),
    ("house_hopper", "Boundless",
     "Swirling vortex portal with 8 house colors blending, boundless movement between factions, interdimensional hopping"),
    ("the_answer", "The Answer",
     "Cosmic number 42 floating in deep space surrounded by galaxies, the answer to everything, universal truth, cosmic knowledge"),
    ("world_traveler", "World Traveler",
     "Globe with 9 glowing pins marking house locations, world traveler compass, all territories visited in one journey"),
    ("source_code", "Source Code",
     "Ancient scroll unfurling to reveal source code text, hidden credits discovered, secret origin story, developer lore"),
    ("secret_hunter", "Secret Hunter",
     "Crystal ball glowing with 5 discovered secret symbols inside, secret achievement hunter, mystical discovery collection"),

    # ═══════════════════════════════════════════════════════════════
    # LEGENDARY
    # ═══════════════════════════════════════════════════════════════
    ("first_blood", "First Blood",
     "Single drop of blood on a pristine achievement surface, first blood drawn, among the first discoverers, crimson droplet glow"),
    ("galaxy_architect", "Galaxy Architect",
     "Hands sculpting a spiral galaxy from raw cosmic energy, galaxy builder, permanent mark on the universe, cosmic architect"),

    # ═══════════════════════════════════════════════════════════════
    # GAME ACHIEVEMENTS — Mini-Games
    # ═══════════════════════════════════════════════════════════════
    ("game_brick", "Incident Commander",
     "Commander at a malware incident command post, endpoint quarantine screens, malware contained, Don't Brick the PC victory"),
    ("game_printer", "Printer Whisperer",
     "Figure gently calming a raging printer beast, paper jam cleared, printer whispering magic, tamed office monster"),
    ("game_pod", "Pod Saver",
     "Hands catching falling Docker containers, whale-shaped rescue vessel, pods saved from crashing, container rescue"),
    ("game_jeopardy", "Jeopardy Champion",
     "Champion podium with buzzer pressed and correct answer displayed, A+ Jeopardy winner, quiz show victory, spotlight glory"),
    ("game_scramble", "Unscrambled",
     "Scrambled letters magically rearranging into correct cyber terms, word puzzle solved, letter tiles clicking into place"),
    ("game_hangman", "Hack the Hangman",
     "Hacker figure freeing the hangman by guessing the word, skull pixelating away, word puzzle victory, digital rescue"),
    ("game_hatmatch", "Hat Trick",
     "Three matching cyber security hats revealed in a memory card game, hat trick match, pairs discovered, matching mastery"),
    ("game_crime", "Cyber Detective",
     "Detective with magnifying glass over a digital crime scene, cyber crime identified, forensic analysis, case solved"),
    ("game_cookies", "Cookie Monster",
     "Digital cookie being analyzed under a microscope, tracking cookie exposed, cookie caper solved, browser forensics"),
    ("game_ethcase", "Case Closed",
     "Case file stamped CLOSED with ethical hacking evidence inside, ethical investigation complete, justice served digitally"),
    ("game_subnet", "Subnet Slayer",
     "Warrior slicing subnet masks with a glowing blade, IP address segments splitting cleanly, subnet calculation mastery"),
    ("game_terminal", "Terminal Velocity",
     "Command prompt moving at light speed, terminal commands executing in rapid succession, velocity blur, speed typing"),
    ("game_cipher", "Cipher Cracker",
     "Cipher wheel spinning and decoding an encrypted message, key turning in a lock, cipher broken, decryption victory"),
    ("game_triage", "Alert Analyst",
     "Analyst at a SIEM console sorting alerts by severity, red-amber-green triage, alert prioritization, SOC analysis"),
    ("game_pipeline", "Pipeline Pro",
     "CI/CD pipeline flowing perfectly with green checkmarks, pipeline stages executing, deployment pipeline mastery"),
    ("game_protocol", "Protocol Master",
     "OSI model layers stacking perfectly, protocol handshake visualization, network protocol mastery, seven-layer tower"),
    ("game_dns", "DNS Resolver",
     "DNS query racing through resolvers to find the answer, domain name resolution chain, global DNS lookup, address found"),
    ("game_permissions", "Permission Granted",
     "Linux permission bits arranging into correct rwx pattern, chmod mastery, file permission puzzle solved, access granted"),
    ("game_regex", "Pattern Matcher",
     "Regex pattern highlighting matching strings in a wall of text, pattern recognition, regex mastery, matching glow"),
    ("game_hash", "Hash Breaker",
     "Hash value cracking open to reveal the plaintext inside, hash collision, cryptographic cracking, rainbow table victory"),
    ("game_logdetective", "Log Detective",
     "Detective examining log file entries with magnifying glass, suspicious log line highlighted, forensic log analysis"),
    ("game_gitbisect", "Bug Hunter",
     "Git commit tree with binary search narrowing down to the bug commit, git bisect visualization, bug found, red commit"),
    ("game_binary", "Binary Boss",
     "Binary digits 0 and 1 transforming into decimal numbers, binary conversion mastery, binary blitz champion"),
    ("game_bill", "Bill Dodger",
     "Figure dodging falling cloud billing alerts, cost containment, AWS bill tamed, cloud spending under control"),
    ("game_domain", "Domain Defender",
     "Knight defending a castle-shaped Active Directory tree, domain controller protected, AD defense victory"),
    ("game_deploy", "Friday Survivor",
     "Calendar showing Friday with a green checkmark, survived deployment, weekend saved, Friday deploy victory"),
    ("game_troll", "Troll Tamer",
     "OSINT agent containing an internet troll under a bridge, troll neutralized with intelligence, social media defense"),
    ("game_leak", "Key Keeper",
     "Guardian catching a leaked API key before it escapes, key containment, secret rotation, leak prevented"),
    ("game_server", "Server Savior",
     "Medic resuscitating a Linux server with defibrillator paddles, server recovery, uptime restored, penguin saved"),
    ("game_phished", "Phish Finder",
     "Fishing hook catching a phishing email mid-flight, phish identified and neutralized, email security victory"),
    ("game_packet", "Packet Protector",
     "Guardian shield protecting network packets from dropping, packet integrity maintained, network defense, zero packet loss"),
    ("game_packetsniffer", "Packet Shark",
     "Shark with Wireshark-style interface swimming through packet data, packet capture analysis, network forensics"),
    ("game_netarchitect", "Network Architect",
     "Architect drafting a network topology blueprint hologram, switches and routers placing perfectly, design mastery"),
    ("game_timeline", "Timeline Tracer",
     "Forensic timeline stretching across a wall with incident markers, event correlation, temporal analysis, evidence chain"),
    ("game_memforensics", "Memory Hunter",
     "Brain-shaped RAM chip being analyzed with forensic probes, memory dump analysis, volatile evidence extraction"),
    ("game_firewall", "Firewall Master",
     "Builder constructing a brick firewall with glowing ACL rules, firewall rule configuration, network barrier mastery"),
    ("game_docker", "Container Breaker",
     "Figure breaking out of a Docker container box, container escape room solved, whale-shaped box shattered"),
    ("game_raid", "RAID Master",
     "Array of hard drives in glowing RAID formation, striping and mirroring visualization, redundancy mastery"),
    ("game_cron", "Cron Commander",
     "Clock with cron schedule expressions orbiting like satellites, scheduled task execution, time-based automation mastery"),
    ("game_iam", "Policy Pro",
     "IAM policy document glowing with allow/deny rules, identity and access management, policy debugger, access control"),
    ("game_sqli", "Injection Blocker",
     "Shield blocking a SQL injection syringe attack, input sanitization, database defense, parameterized query protection"),
    ("game_wireless", "Signal Hunter",
     "Hunter tracking wireless signal waves through the air, WiFi and radio frequencies visualized, wireless warzone"),
    ("game_api", "API Inspector",
     "Inspector examining API request/response traffic with a lens, REST endpoint analysis, API security testing"),
    ("game_threat", "Threat Modeler",
     "STRIDE threat model diagram glowing with threat categories, attack surface analysis, threat modeling mastery"),
    ("game_malware", "Malware Wrangler",
     "Wrangler lassoing escaped malware specimens back into containment, malware zoo, virus containment, specimen control"),
    ("game_adpath", "Domain Conqueror",
     "Conqueror navigating an Active Directory attack path graph, Bloodhound-style path visualization, AD conquest"),
    ("game_k8s", "Pod Savior",
     "Hero rescuing Kubernetes pods from CrashLoopBackOff, pod recovery, K8s cluster stabilized, helm wheel shield"),
    ("game_backup", "Backup Hero",
     "Hero with a backup tape cape saving data from destruction, 3-2-1 backup rule, data recovery champion"),
    ("game_patch", "Patch Commander",
     "Commander deploying patches like paratroopers onto vulnerable systems, Patch Tuesday operation, vulnerability remediation"),
    ("game_cloudarch", "Cloud Architect",
     "Architect designing multi-tier cloud infrastructure blueprint, cloud architecture diagram, well-architected framework"),
    ("game_soceng", "Human Firewall",
     "Human silhouette forming a firewall barrier against social engineering attacks, anti-manipulation shield, awareness defense"),

    # ═══════════════════════════════════════════════════════════════
    # GAME ACHIEVEMENTS — Text Adventures
    # ═══════════════════════════════════════════════════════════════
    ("game_sudo", "Root Hunter",
     "Terminal showing 'sudo su' with root access granted, skull and crossbones root prompt, privilege escalation, power achieved"),
    ("game_nmap", "Network Explorer",
     "Nmap scan results revealing open ports on a target, network reconnaissance map, port scanning visualization"),
    ("game_incident", "First Responder",
     "First responder arriving at a digital incident scene with emergency gear, incident response, alarm lights flashing"),
    ("game_gpg", "Codebreaker",
     "GPG decryption key turning in a cipher lock, encrypted message decoding, pgp key exchange, secret message revealed"),
    ("game_grep", "Digital Detective",
     "Detective using grep command to search through mountains of text files, pattern found highlighted, search mastery"),
    ("game_fsck", "Hardware Survivor",
     "File system check repairing a damaged disk, fsck recovery, filesystem blocks rebuilding, hardware salvation"),
    ("game_gitblame", "Blame Master",
     "Git blame output revealing the author of a bug, pointing finger at the guilty commit, blame traced, accountability"),
    ("game_awssts", "Cloud Chaser",
     "Agent chasing temporary AWS credentials through cloud regions, STS token pursuit, cloud identity chase"),
    ("game_tor", "Dark Navigator",
     "Onion layers peeling back to reveal a hidden .onion site, Tor circuit visualization, dark web navigation, anonymity"),
    ("game_kill9", "Process Killer",
     "Lightning bolt striking a rogue process dead, kill -9 signal sent, process terminated, SIGKILL execution"),

    # ═══════════════════════════════════════════════════════════════
    # GAME ACHIEVEMENTS — Pixel Runners
    # ═══════════════════════════════════════════════════════════════
    ("game_packetrun", "Packet Surfer",
     "Surfer riding a wave made of network packets, packet run side-scroller, surfing through data streams"),
    ("game_bitdash", "Bit Dasher",
     "Runner dashing through a corridor of binary digits, bit dash speedrun, 0s and 1s flying past, pixel sprint"),
    ("game_shellsprint", "Shell Sprinter",
     "Sprinter racing through shell command obstacles, terminal commands as hurdles, command-line marathon, shell speed"),
    ("game_threatrunner", "Threat Runner",
     "Runner dodging incoming threat indicators, shield up while sprinting, threat evasion course, defensive dash"),
    ("game_cloudhop", "Cloud Hopper",
     "Figure hopping between cloud platform islands, AWS to Azure to GCP stepping stones, cloud platformer"),

    # ═══════════════════════════════════════════════════════════════
    # GAME MASTER (legendary)
    # ═══════════════════════════════════════════════════════════════
    ("game_master", "Game Master",
     "Golden trophy with 46 game icons orbiting it, ultimate game master crown, all games completed, legendary champion"),

    # ═══════════════════════════════════════════════════════════════
    # CLI MASTERY ACHIEVEMENTS
    # ═══════════════════════════════════════════════════════════════
    ("cli_ghost", "CLI Ghost",
     "Translucent ghost figure at a terminal, 30 completed modules orbiting as spectral cards, command line ghost mastery"),
    ("cli_recruit", "CLI Recruit",
     "Fresh recruit at a command line boot camp, first three modules as dog tags, military terminal training, green on black"),
    ("cli_analyst", "CLI Analyst",
     "Analyst at a terminal with forensic analysis tools, CLI modules 4-6 represented as evidence files, analytical mastery"),
    ("cli_operative", "CLI Operative",
     "Covert operative executing terminal commands in the shadows, modules 7-9 as mission dossiers, field operations"),
    ("cli_shadow", "CLI Shadow",
     "Shadow figure merging with a terminal screen, modules 10-12 as shadow artifacts, invisible presence, dark terminal"),
    ("cli_phantom", "CLI Phantom",
     "Phantom silhouette with glowing terminal commands orbiting, modules 13-15 as phantom relics, spectral command mastery"),
    ("cli_specter", "CLI Specter",
     "Ethereal specter commanding seven terminal windows simultaneously, modules 16-22 as specter chains, haunting presence"),
    ("cli_wraith", "CLI Wraith",
     "Wraith figure with skull face emerging from terminal darkness, modules 23-27 as wraith tokens, death-level mastery"),
    ("cli_blackout", "BLACKOUT",
     "Total darkness with a single terminal cursor blinking, OPERATION BLACKOUT text fading in, ultimate test, cosmic dark"),
    ("cli_master", "CLI Grandmaster",
     "Trident-wielding grandmaster atop a throne of 31 terminal screens, CLI grandmaster crown, ultimate command mastery"),
]

# ---------------------------------------------------------------------------
# Style template — same as batch 1 for consistency
# ---------------------------------------------------------------------------

STYLE = """
detailed digital badge icon illustration,
circular composition centered design,
dark navy background with soft neon glow,
cyberpunk aesthetic with clean linework,
badge emblem design, award medal style,
neon cyan and teal primary accent with warm highlights,
dramatic rim lighting, soft volumetric glow,
high contrast, sharp details, professional quality,
game achievement badge art, collectible trophy,
iconic single focal symbol, centered subject,
no text, no words, no letters, no numbers, no watermark
""".strip()

CONSISTENCY = """
consistent cohesive art style across the entire badge set,
unified color grading and lighting,
same lens language and detail level
""".strip()

# Category-specific accent colors — same as batch 1
CATEGORY_COLORS = {
    "streak": "orange and amber",
    "misc": "cyan and white",
    "dark_arts": "deep purple and crimson",
    "secret": "electric blue and silver glitch",
    "legendary": "gold and radiant platinum",
    "games": "red and gold",
    "text_adventure": "green-on-black terminal and neon green",
    "pixel_runner": "pixel neon pink and cyan",
    "cli": "dark green terminal and ghostly cyan",
    "game_master": "legendary gold and trophy platinum",
}

# Map achievement IDs to their category
BADGE_CATEGORIES = {}
for bid, bname, bconcept in BADGES:
    if bid.startswith("streak") or bid == "first_visit":
        BADGE_CATEGORIES[bid] = "streak"
    elif bid == "sound_master":
        BADGE_CATEGORIES[bid] = "misc"
    elif bid.startswith("gate_") or bid == "dark-arts-master":
        BADGE_CATEGORIES[bid] = "dark_arts"
    elif bid in ("divergent", "god_mode", "konami", "storm_gates", "house_hopper",
                 "the_answer", "world_traveler", "source_code", "secret_hunter"):
        BADGE_CATEGORIES[bid] = "secret"
    elif bid in ("first_blood", "galaxy_architect"):
        BADGE_CATEGORIES[bid] = "legendary"
    elif bid in ("game_sudo", "game_nmap", "game_incident", "game_gpg", "game_grep",
                 "game_fsck", "game_gitblame", "game_awssts", "game_tor", "game_kill9"):
        BADGE_CATEGORIES[bid] = "text_adventure"
    elif bid in ("game_packetrun", "game_bitdash", "game_shellsprint",
                 "game_threatrunner", "game_cloudhop"):
        BADGE_CATEGORIES[bid] = "pixel_runner"
    elif bid.startswith("cli_"):
        BADGE_CATEGORIES[bid] = "cli"
    elif bid == "game_master":
        BADGE_CATEGORIES[bid] = "game_master"
    elif bid.startswith("game_"):
        BADGE_CATEGORIES[bid] = "games"
    else:
        BADGE_CATEGORIES[bid] = "misc"


def make_prompt(badge_id, name, concept):
    cat = BADGE_CATEGORIES.get(badge_id, "misc")
    accent = CATEGORY_COLORS.get(cat, "neon cyan and teal")

    return f"""
{concept},
{accent} accent highlights,

{STYLE}
{CONSISTENCY}
badge-series {cat} neon-cyber achievement-icon
""".strip()


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL = "fal-ai/flux/dev"
IMAGE_SIZE = {"width": 512, "height": 512}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "_app", "assets", "images", "badges")
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

    total = len(BADGES)
    print(f"Hexworth Prime — Badge Art Generator BATCH 2 (fal.ai FLUX.1 [dev])")
    print(f"Output: {os.path.abspath(OUT_DIR)}")
    print(f"Badges: {total}")
    print(f"Size:   {IMAGE_SIZE['width']}x{IMAGE_SIZE['height']} (1:1 square)")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for i, (badge_id, name, concept) in enumerate(BADGES, 1):
        out_path = os.path.join(OUT_DIR, f"{badge_id}.png")
        webp_path = os.path.join(OUT_DIR, f"{badge_id}.webp")

        # Skip if either PNG or WebP already exists
        if os.path.exists(out_path) or os.path.exists(webp_path):
            print(f"  [{i:3d}/{total}] [skip] {badge_id} — {name} (exists)")
            skipped += 1
            continue

        prompt = make_prompt(badge_id, name, concept)
        print(f"  [{i:3d}/{total}] [gen]  {badge_id} — {name} ...", end=" ", flush=True)

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

    if generated > 0:
        print()
        print("Next: Convert PNGs to WebP:")
        print("  python3 -c \"")
        print("  from PIL import Image; import glob, os")
        print("  for f in glob.glob(os.path.join('" + OUT_DIR + "', '*.png')):")
        print("      img = Image.open(f)")
        print("      img.save(f.replace('.png', '.webp'), 'WEBP', quality=82, method=6)")
        print("      os.remove(f)")
        print("      print('Converted:', os.path.basename(f))")
        print("  \"")


if __name__ == "__main__":
    main()
