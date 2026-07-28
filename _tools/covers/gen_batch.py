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
    "cloud-master":      ("cloud",         "a grand cloud command nexus, multiple glowing cloud platforms orbiting a central neon control core, AWS-and-Azure-like constellations converging, master control room of the clouds"),
    "hardware-support":  ("forge",         "a hardware support bench, glowing open PC chassis, motherboards, RAM and drives under neon repair light"),
    "intro-security":    ("shield",        "an introductory security scene, a glowing shield over a data core, first-line firewalls and access controls in neon"),
    "cybersecurity-ethics":("divergent",   "an ethical crossroads in cybersecurity, glowing scales weighing privacy and access, a neon moral decision tree"),
    "linux-essentials":  ("script",        "an essential Linux terminal, glowing basic shell commands, a penguin motif in neon light, foundational command-line"),
    "linux-mastery":     ("script",        "a master's Linux command sanctum, cascading advanced shell pipelines, glowing text-processing streams, deep terminal mastery"),
    "grep-pipe-mastery": ("script",        "streams of text flowing through glowing pipes and filters, regex patterns of light, a command-line data-processing forge"),
    "databases":         ("code",          "a neon database landscape, glowing relational tables and query streams, indexed data structures pulsing with light"),
    "zero-to-python":    ("code",          "a beginner's coding journey rendered as a luminous serpent of light rising from darkness into neon, first scripts glowing"),
    # Observatory + LearningPaths reconciliation finds
    "projects":          ("key",           "a maker's workshop of glowing hands-on tech projects, circuit builds and code artifacts on a neon bench, a launch of ideas"),
    "clh":               ("script",        "a command-line hacker's neon terminal den, cascading offensive shell commands, a hooded figure at glowing prompts"),
    "linux-admin":       ("script",        "a Linux system administration control room, glowing server terminals, daemons and services, root-access management console"),
    "cse":               ("cloud",         "a cloud security engineering scene, glowing cloud fortresses and encrypted data flows, security controls over a neon cloud"),
    "openstack":         ("cloud",         "an open-source cloud platform, glowing orchestration of virtual machines and networks, a modular cloud infrastructure of light"),
    "cyber-framework":   ("shield",        "a cyber law and policy scene, glowing governance frameworks, scales of justice over a neon compliance landscape"),
    "python-programming":("code",          "a Python programming pit, a coiled serpent of luminous code, glowing scripts and data structures in a neon den"),

    # ── Derived wave 3 (2026-07-26): course-tree reconciliation, 82 hubs. Original generic scenes, no brand/logo. ──
    "api":                 ("cloud",     "a neon API security gateway, glowing endpoints and request tokens flowing through layered authentication checkpoints, a shielded data conduit"),
    "vault":               ("dark-arts", "a dark neon vault of offensive-security tools, glowing lockpicks and exploit racks behind a heavy cipher door, red access glow"),
    "ai-advanced":         ("ai",        "an advanced AI laboratory, glowing multimodal model cores fusing vision and language, cutting-edge neural circuitry in purple light"),
    "ai-agents":           ("ai",        "autonomous AI agents as glowing nodes coordinating across a neon task graph, tool-calling arrows of light, an agentic swarm"),
    "ai-automation":       ("ai",        "a no-code automation canvas, glowing workflow nodes wired end to end, data pulses flowing through connected triggers and actions"),
    "azure-openai":        ("ai",        "a cloud-hosted AI service, glowing language-model endpoints in a neon sky, prompt streams flowing into a luminous model core"),
    "cli-tools":           ("ai",        "an AI developer's neon terminal, glowing command-line copilots and code suggestions streaming into a dark shell"),
    "adversarial":         ("ai",        "adversarial machine learning, a glowing model under attack by perturbation noise, distorted inputs and defensive gradients in red light"),
    "cnn":                 ("ai",        "a convolutional neural network, glowing feature maps and filters sweeping across an image lattice, layered vision activations"),
    "cyber-ml":            ("ai",        "machine learning for cyber defense, glowing anomaly clusters and threat-classification boundaries over a neon security dataset"),
    "deep-learning":       ("ai",        "a deep neural network, many glowing layers of weighted connections cascading into abstraction, backpropagation light"),
    "cortex-foundations":  ("ai",        "the origins of artificial intelligence, a glowing timeline of neural ideas and ethical crossroads, foundational AI concepts in light"),
    "generative":          ("ai",        "generative AI, glowing latent space blooming into synthesized images and text, a diffusion of neon particles forming new creations"),
    "cortex-math":         ("ai",        "the mathematics of machine learning, glowing matrices, gradients and probability curves floating in a neon calculus space"),
    "mlops":               ("ai",        "an ML operations pipeline, glowing model-training and deployment stages, versioned models flowing through automated CI to production"),
    "nlp":                 ("ai",        "natural language processing, glowing word embeddings and attention links weaving sentences into meaning, language rendered as light"),
    "cortex-rl":           ("ai",        "reinforcement learning, a glowing agent navigating a neon maze of rewards and penalties, policy paths lighting up through trial and error"),
    "supervised":          ("ai",        "supervised learning, glowing labeled data points separated by a luminous decision boundary, a model fitting the pattern"),
    "transformers":        ("ai",        "recurrent networks and transformers, glowing sequence tokens flowing through attention heads, temporal connections of light"),
    "unsupervised":        ("ai",        "unsupervised learning, glowing data self-organizing into clusters, hidden structure emerging from a neon point cloud"),
    "api-auth":            ("cloud",     "API authentication, glowing identity keys and access tokens exchanging through a neon handshake, a secured authorization gateway"),
    "cloud-patterns":      ("cloud",     "cloud API architecture, glowing microservice endpoints connected across a neon service mesh, integration patterns of light"),
    "api-design":          ("cloud",     "API design, a glowing endpoint blueprint and schema documentation, clean routes mapped across a neon interface"),
    "event-driven":        ("cloud",     "event-driven APIs, glowing webhooks and websocket streams pulsing between services, real-time message flows of light"),
    "owasp":               ("cloud",     "API security threats, glowing attack vectors probing endpoints, a neon checklist of vulnerabilities under a protective shield"),
    "pentest":             ("cloud",     "API penetration testing, a hacker's neon console probing endpoints for flaws, glowing fuzzing payloads and broken-auth exploits"),
    "rate-limiting":       ("cloud",     "API rate limiting, glowing request buckets and throttle gates metering traffic, cached responses flowing through a neon valve"),
    "ms-102":              ("cloud",     "a cloud administration console, glowing tenant and identity management dashboards, enterprise productivity services in neon"),
    "ms-900":              ("cloud",     "cloud productivity fundamentals, glowing collaboration and identity services orbiting a neon cloud suite"),
    "pl-300":              ("cloud",     "a data-analytics dashboard, glowing charts and data models transforming raw tables into luminous insight"),
    "complexity":          ("code",      "algorithmic complexity, glowing growth curves comparing algorithms, a neon plot of running time versus input size"),
    "data-structures":     ("code",      "data structures, glowing linked nodes, trees and hash tables floating in neon space"),
    "discrete-math":       ("code",      "discrete mathematics, glowing logic gates, set diagrams and combinatorial graphs in neon"),
    "algorithm-chamber-dp":("code",      "divide and conquer and dynamic programming, a glowing problem splitting into subproblems, a memoization table lighting up with solutions"),
    "geometry":            ("code",      "computational geometry, glowing convex hulls, line intersections and spatial cells drawn in neon"),
    "graphs":              ("code",      "graph theory, a glowing web of nodes and edges, a shortest-path beam tracing across a neon network"),
    "greedy":              ("code",      "greedy algorithms, glowing locally-optimal choices lighting a path forward across a neon decision landscape"),
    "sorting":             ("code",      "sorting and searching, glowing bars rearranging into order, a binary-search beam narrowing on a neon array"),
    "strings":             ("code",      "string algorithms, glowing character sequences with pattern-matching highlights sweeping across neon text"),
    "assembly":            ("code",      "assembly language, glowing CPU registers and low-level opcodes, machine instructions pulsing through a neon processor"),
    "bash":                ("code",      "shell scripting, a glowing command-line terminal piping streams of text through neon commands"),
    "armory-c":            ("code",      "the C language, glowing memory addresses and pointers, low-level bytes flowing through a neon systems core"),
    "cpp":                 ("code",      "C++ programming, glowing object hierarchies and templates, high-performance code compiled into neon light"),
    "csharp":              ("code",      "managed .NET programming, glowing objects flowing through a neon runtime, enterprise application architecture"),
    "armory-go":           ("code",      "the Go language, glowing concurrent routines flowing through channels, lightweight parallelism in neon"),
    "java":                ("code",      "the Java language, glowing bytecode running in a virtual machine, portable objects flowing across a neon platform"),
    "javascript":          ("code",      "web scripting, a glowing browser event loop, async callbacks and typed objects flowing through neon"),
    "lua-perl-r":          ("code",      "scripting and statistics, glowing lightweight scripts and data plots weaving through a neon analysis bench"),
    "php":                 ("code",      "server-side web scripting, glowing scripts rendering dynamic pages, request-response cycles in neon"),
    "powershell":          ("code",      "shell automation, a glowing blue administrative terminal, commands piping objects across a neon system"),
    "armory-python":       ("code",      "the Python language, a glowing serpent of luminous code coiling through a neon data landscape"),
    "python-graphics":     ("code",      "Python graphics, glowing plotted curves and generative shapes drawing art on a neon canvas"),
    "ruby":                ("code",      "the Ruby language, a glowing gem radiating elegant expressive code across a neon workspace"),
    "rust":                ("code",      "the Rust language, glowing ownership and borrow-check gears enforcing memory safety in a neon systems forge"),
    "armory-sql":          ("code",      "relational databases, glowing tables joined by luminous queries, indexed rows flowing through a neon engine"),
    "swift-kotlin":        ("code",      "mobile development, glowing app interfaces on neon devices, code compiling to sleek screens"),
    "devops":              ("code",      "a DevOps pipeline, glowing CI/CD stages, containers and infrastructure-as-code flowing from commit to deployment in neon"),
    "ceh":                 ("dark-arts", "an ethical hacker's neon lair, glowing exploit frameworks and reconnaissance maps, a hooded figure at penetration-test terminals"),
    "intro-computers":     ("forge",     "a first look inside a computer, a glowing open chassis with labeled components, foundational hardware under neon light"),
    "piverse":             ("matrix",    "a single-board-computer maker's universe, glowing boards wired to sensors and LEDs, a neon electronics playground"),
    "protocore":           ("matrix",    "a microcontroller build bench, glowing dev boards and circuits, embedded firmware pulsing through neon protoboards"),
    "cmmc":                ("shield",    "a cybersecurity maturity framework, glowing compliance controls and assessment tiers layered over a neon defense posture"),
    "ms-security":         ("shield",    "cloud security fundamentals, glowing identity and endpoint protection shields over a neon enterprise estate"),
    "sc-200":              ("shield",    "a security operations analyst desk, glowing threat-detection dashboards and incident queues, alert triage in neon"),
    "sc-900":              ("shield",    "security, compliance and identity fundamentals, glowing shields, policy controls and identity tokens orbiting a neon cloud"),
    "security-101":        ("shield",    "security fundamentals, a glowing padlock over layered defenses, first principles of protection in neon"),
    "bgp":                 ("web",       "border gateway routing, glowing autonomous-system paths negotiating routes across a neon internet backbone"),
    "carrier":             ("web",       "carrier and mobile networks, glowing cell towers and radio access nodes, high-speed data arcing across a neon grid"),
    "datacenter":          ("web",       "data-center networking, glowing spine-and-leaf switch fabric, server racks linked by luminous high-speed paths"),
    "backbone-forensics":  ("web",       "network forensics, glowing captured packets reconstructed on a timeline, tracing an intrusion across a neon topology"),
    "infiniband":          ("web",       "ultra-low-latency interconnects, glowing high-performance fabric links, data bypassing the processor across a neon compute cluster"),
    "ipv6":                ("web",       "advanced IPv6, glowing address blocks and routing prefixes flowing across a next-generation neon network"),
    "mpls":                ("web",       "service-provider networking, glowing labeled packets switched along neon label-switched paths"),
    "netsec":              ("web",       "network security architecture, glowing firewalls, segmentation zones and inspection points guarding a neon perimeter"),
    "optical":             ("web",       "optical networking, glowing fiber strands carrying wavelengths of light, multiplexed channels pulsing through a neon backbone"),
    "qos":                 ("web",       "quality of service, glowing traffic queues prioritized and shaped, latency-sensitive packets flowing through a neon scheduler"),
    "routing":            ("web",       "advanced routing, glowing dynamic routing tables and converging paths across a neon multi-area network"),
    "sdn":                 ("web",       "software-defined networking, a glowing central controller orchestrating flows across a programmable neon switch fabric"),
    "sdwan":               ("web",       "software-defined wide-area networking, glowing overlay tunnels steering traffic across multiple links on a neon map"),
    "wireless":            ("web",       "advanced wireless networking, glowing access points and spectrum channels, roaming clients across a neon radio landscape"),
    "wifi-arsenal":        ("dark-arts", "a wireless-attack arsenal, glowing antennas and packet-capture rigs probing neon radio waves, wireless-security tools in the dark"),
    "toolkit":             ("signal",    "an essential-software toolkit, glowing utility apps and installers arranged on a neon technician's workbench"),

    # ── dedicated cert courses promoted to canonical (2026-07-27), replacing thin stubs. ──
    "eye-cysa":            ("eye",       "a cyber analyst's threat-hunting desk, glowing behavioral-analytics dashboards, alert timelines, anomaly heatmaps"),
    "web-ccna":            ("web",       "a neon enterprise routing and switching lab, glowing network topology, VLAN and routing paths of light, switch and router status lights"),
    "server-management":   ("forge",     "a server administration control room, glowing server racks and management consoles, operating-system deployment and maintenance under neon light"),
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
