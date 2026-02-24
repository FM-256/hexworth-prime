"""
Hexworth Prime — Achievement Badge Art Generator
Generates badge art PNGs for all achievements via fal.ai FLUX.1 [dev] API.

Usage:
  pip install fal-client requests
  export FAL_KEY="your-fal-key-here"
  python3 tools/generate_badge_art.py

Output: _app/assets/images/badges/{achievementId}.png (512x512, 1:1 square)

Skips badges that already have a PNG. Safe to re-run after interruption.
"""

import os
import time
import random
import requests
import fal_client

# ---------------------------------------------------------------------------
# All 206 achievements — grouped by category
# Each tuple: (achievementId, name, concept for art prompt)
# ---------------------------------------------------------------------------

BADGES = [
    # ═══════════════════════════════════════════════════════════════
    # MILESTONE (3)
    # ═══════════════════════════════════════════════════════════════
    ("first_login", "First Steps",
     "Glowing footsteps leading into a grand cyber academy entrance, first step onto a luminous path, doorway of light"),
    ("sorted", "Sorted!",
     "Magical sorting hat hologram with swirling data streams forming 8 house colors, ceremonial sorting ritual, radiant energy burst"),
    ("first_module", "Getting Started",
     "Glowing star emerging from an opened digital textbook, first achievement sparkle, cosmic knowledge awakening"),

    # ═══════════════════════════════════════════════════════════════
    # QUIZ (6)
    # ═══════════════════════════════════════════════════════════════
    ("first_quiz", "Quiz Taker",
     "Glowing holographic quiz card with a checkmark forming, first exam completed, digital clipboard with pass mark"),
    ("perfect_score", "Perfectionist",
     "Blazing golden 100% score hologram radiating light, perfect exam sheet glowing, absolute mastery crown"),
    ("quiz_master_10", "Quiz Apprentice",
     "Stack of 10 glowing completed quiz scrolls forming a pillar, apprentice achievement tower, knowledge accumulation"),
    ("quiz_master_25", "Quiz Master",
     "Golden trophy atop a mountain of 25 completed exams, quiz mastery pinnacle, champion scholar throne"),
    ("persistence", "Persistent",
     "Iron fist breaking through a stone wall, determination symbol, cracked barrier with light streaming through, grit and resolve"),
    ("speed_demon", "Speed Demon",
     "Lightning bolt striking through an hourglass, time frozen mid-shatter, speed trails and electric energy, blazing fast completion"),

    # ═══════════════════════════════════════════════════════════════
    # SHIELD HOUSE (7)
    # ═══════════════════════════════════════════════════════════════
    ("shield-cia-master", "CIA Triad Master",
     "Three interlocking shield segments forming the CIA triad — confidentiality, integrity, availability — glowing in blue-white energy"),
    ("shield_apprentice", "Shield Apprentice",
     "Young defender holding a glowing cyber shield, apprentice armor forming around them, protective stance"),
    ("shield_master", "Shield Master",
     "Armored guardian with twin crossed energy swords over a massive glowing shield, fortress defender, full mastery aura"),
    ("shield_cia_triad", "Triad Guardian",
     "Rotating triangular shield construct with C-I-A inscribed in holographic runes, perfect balance symbol"),
    ("shield_threat_hunter", "Threat Hunter",
     "Hooded figure with a glowing crosshair lens scanning a dark network landscape, predatory stalking stance, target acquisition"),
    ("shield_defender", "First Line Defender",
     "Armored sentinel standing at a massive digital fortress gate, first line of defense, impenetrable wall of light"),
    ("shield_social_engineer", "Social Engineering Aware",
     "Theater mask half-revealed with manipulation strings visible, social engineering awareness, deception unveiled"),

    # ═══════════════════════════════════════════════════════════════
    # WEB HOUSE (7)
    # ═══════════════════════════════════════════════════════════════
    ("web_apprentice", "Network Novice",
     "Young technician connecting glowing network cables, first network connections forming, apprentice wiring station"),
    ("web_master", "Network Master",
     "Grand network architect overlooking a vast holographic network topology map, master controller of all connections"),
    ("subnetting_wizard", "Subnetting Wizard",
     "Wizard casting subnet mask spells, binary octets orbiting like magical runes, IP addresses splitting into subnets"),
    ("web_osi_master", "OSI Architect",
     "Seven-layer holographic pyramid structure representing OSI model, each layer glowing a different color, architectural mastery"),
    ("web_vlan_virtuoso", "VLAN Virtuoso",
     "Network switch with virtual LAN segments separating into colorful isolated domains, virtuoso conductor of traffic"),
    ("web_routing_guru", "Routing Guru",
     "Wise figure meditating at a crossroads of glowing routing paths, routing table hologram orbiting, path selection wisdom"),
    ("web_wireless_wizard", "Wireless Wizard",
     "Wizard channeling wireless signal waves between hands, radio frequency visualization, WiFi signal mastery aura"),

    # ═══════════════════════════════════════════════════════════════
    # FORGE HOUSE (6)
    # ═══════════════════════════════════════════════════════════════
    ("forge_apprentice", "Forge Apprentice",
     "Apprentice smith at a glowing digital forge anvil, first hardware components being crafted, sparks flying"),
    ("forge_master", "Master Smith",
     "Master blacksmith in a grand digital forge, hammering a perfect motherboard on a glowing anvil, mastery flames"),
    ("forge_hardware_expert", "Hardware Expert",
     "Expert hands assembling a glowing PC from floating component holograms — CPU, RAM, GPU all orbiting into place"),
    ("forge_windows_whisperer", "Windows Whisperer",
     "Ethereal figure communing with a glowing Windows logo, registry keys and system processes swirling in harmony"),
    ("forge_troubleshooter", "Master Troubleshooter",
     "Detective with magnifying glass examining a broken circuit board, diagnostic beams revealing the fault, eureka moment"),
    ("forge_raid_master", "RAID Master",
     "Array of hard drives in glowing RAID formation, data striping and mirroring visualization, redundant storage mastery"),

    # ═══════════════════════════════════════════════════════════════
    # SCRIPT HOUSE (6)
    # ═══════════════════════════════════════════════════════════════
    ("script_apprentice", "Script Kiddie",
     "Young hacker at a glowing terminal typing first scripts, green code cascading, terminal glow on excited face"),
    ("script_master", "Script Sorcerer",
     "Dark sorcerer channeling code spells from an ancient terminal, scripts spiraling like magical incantations, arcane automation"),
    ("script_python_prodigy", "Python Prodigy",
     "Glowing python serpent coiled around a code terminal, Python syntax floating as golden runes, mastery of the snake language"),
    ("script_bash_ninja", "Bash Ninja",
     "Shadow ninja with a glowing bash terminal shuriken, command-line strikes in the dark, stealth automation warrior"),
    ("script_linux_sage", "Linux Sage",
     "Ancient wise sage with a penguin companion, Linux terminal wisdom scrolls floating, kernel enlightenment aura"),
    ("script_automator", "The Automator",
     "Robotic figure orchestrating automated pipelines, cron jobs ticking like clockwork gears, process automation mastery"),

    # ═══════════════════════════════════════════════════════════════
    # CLOUD HOUSE (6)
    # ═══════════════════════════════════════════════════════════════
    ("cloud_apprentice", "Cloud Climber",
     "Climber ascending through layers of cloud platforms, each cloud layer a different service, ascending to the summit"),
    ("cloud_master", "Cloud Architect",
     "Grand architect designing a massive cloud infrastructure hologram, multi-region deployment blueprint, mountaintop mastery"),
    ("cloud_aws_certified", "AWS Explorer",
     "Explorer with a glowing compass navigating through orange AWS cloud service icons, discovery expedition through cloud services"),
    ("cloud_azure_adept", "Azure Adept",
     "Adept wielding blue Azure energy, cloud resources materializing from azure light, Microsoft cloud mastery aura"),
    ("cloud_multi_cloud", "Multi-Cloud Architect",
     "Architect bridging multiple cloud platforms, AWS orange and Azure blue and GCP multicolor all connecting, multi-cloud harmony"),
    ("cloud_iam_master", "IAM Master",
     "Key master holding a glowing golden identity key, access policies orbiting like shield panels, identity governance mastery"),

    # ═══════════════════════════════════════════════════════════════
    # CODE HOUSE (6)
    # ═══════════════════════════════════════════════════════════════
    ("code_apprentice", "Code Cadet",
     "Young cadet at a glowing IDE terminal, first code compiling with green checkmarks, apprentice developer desk"),
    ("code_master", "DevOps Champion",
     "Champion standing atop a CI/CD pipeline mountain, deployment rockets launching, DevOps mastery crown"),
    ("code_git_guru", "Git Guru",
     "Wise guru meditating on a branching git tree, merge commits flowing like water, version control enlightenment"),
    ("code_cicd_champion", "CI/CD Champion",
     "Champion at the center of a continuous integration infinity loop, automated builds flowing endlessly, pipeline mastery"),
    ("code_container_captain", "Container Captain",
     "Ship captain steering a vessel made of Docker containers, whale-shaped ship on a digital ocean, containerization mastery"),
    ("code_k8s_knight", "Kubernetes Knight",
     "Armored knight with a Kubernetes wheel shield and pod-shaped sword, orchestration battlefield, container knight"),

    # ═══════════════════════════════════════════════════════════════
    # KEY HOUSE (6)
    # ═══════════════════════════════════════════════════════════════
    ("key_apprentice", "Crypto Curious",
     "Curious student examining a glowing cipher wheel, first encryption puzzle, mysterious cryptographic symbols floating"),
    ("key_master", "Cryptographer",
     "Master cryptographer at an ancient cipher desk surrounded by floating encryption keys and hash algorithms, code-breaking mastery"),
    ("key_cipher_master", "Cipher Master",
     "Hands manipulating a rotating cipher machine, plaintext transforming to ciphertext in golden light, encryption mastery"),
    ("key_hash_hunter", "Hash Hunter",
     "Hunter tracking hash fingerprints through a digital forest, SHA-256 trail markers, cryptographic tracking"),
    ("key_pki_professional", "PKI Professional",
     "Professional managing a public key infrastructure tree, certificates branching from a root CA, trust hierarchy"),
    ("key_entropy_expert", "Entropy Expert",
     "Expert channeling pure randomness, dice and random number generators swirling in chaos, entropy mastery aura"),

    # ═══════════════════════════════════════════════════════════════
    # EYE HOUSE (6)
    # ═══════════════════════════════════════════════════════════════
    ("eye_apprentice", "Watchful Eye",
     "Watchful eye opening above a monitoring dashboard, first alert detected, surveillance apprentice awakening"),
    ("eye_master", "All-Seeing",
     "Crystal ball showing all network activity simultaneously, omniscient monitoring view, all-seeing eye of security"),
    ("eye_siem_specialist", "SIEM Specialist",
     "Specialist commanding a massive SIEM dashboard array, correlated alerts flowing, security event mastery"),
    ("eye_log_detective", "Log Detective",
     "Detective examining log files with a magnifying glass, suspicious entries highlighted, forensic log analysis"),
    ("eye_pattern_hunter", "Pattern Hunter",
     "Hunter identifying attack patterns in a matrix of data, pattern recognition visualization, anomaly detection mastery"),
    ("eye_alert_analyst", "Alert Analyst",
     "Analyst at a command center triaging cascading alerts, priority sorting of red amber green alerts, triage mastery"),

    # ═══════════════════════════════════════════════════════════════
    # LEVEL (3)
    # ═══════════════════════════════════════════════════════════════
    ("level_5", "Rising Star",
     "Bright star ascending from the horizon, level 5 numeral glowing in the center, ascending trajectory"),
    ("level_10", "Seasoned Learner",
     "Radiant double-star constellation forming level 10, seasoned warrior pose, experienced scholar aura"),
    ("level_15", "Hexworth Master",
     "Golden crown with embedded level 15 numeral, maximum power achieved, radiant mastery explosion"),

    # ═══════════════════════════════════════════════════════════════
    # SPECIAL (5)
    # ═══════════════════════════════════════════════════════════════
    ("night_owl", "Night Owl",
     "Wise owl perched on a glowing monitor at midnight, moonlit coding session, nocturnal scholar"),
    ("early_bird", "Early Bird",
     "Bird catching a glowing digital worm at dawn, sunrise over a terminal, early morning dedication"),
    ("weekend_warrior", "Weekend Warrior",
     "Warrior with weekend calendar shield, Saturday-Sunday determination, no-rest dedication stance"),
    ("streak_7", "Week Streak",
     "Seven flames burning in a row like a weekly calendar, study streak fire, consecutive day dedication"),
    ("multi_house", "Renaissance Learner",
     "Figure at the center of 8 radiating house color beams, renaissance master, multi-discipline excellence"),

    # ═══════════════════════════════════════════════════════════════
    # DARK ARTS (14)
    # ═══════════════════════════════════════════════════════════════
    ("dark_arts_gate1", "Gate Keeper",
     "Ancient door cracking open with dark purple energy spilling out, first gate to forbidden knowledge, ominous threshold"),
    ("dark_arts_master", "Dark Arts Master",
     "Cloaked figure with five gate keys orbiting, dark mastery crown, complete forbidden knowledge, skull emblem"),
    ("dark_arts_gate2", "Second Seal",
     "Second mystical seal breaking with violet lightning, deeper passage revealed, second barrier shattered"),
    ("dark_arts_gate3", "Third Eye Opens",
     "Mystical third eye opening on a forehead, purple energy vision, forbidden sight activated"),
    ("dark_arts_gate4", "Frequency Walker",
     "Figure walking through radio frequency waves, signal interception visualization, frequency spectrum mastery"),
    ("dark_arts_gate5", "Synthesis Complete",
     "All knowledge streams merging into a single point of synthesis, final gate key forming, complete understanding"),
    ("dark_arts_gate6", "Analyst",
     "Microscope examining malware binary code, static analysis breakdown, dissection of malicious code"),
    ("dark_arts_gate7", "Sentinel",
     "Armored sentinel with threat intelligence feeds orbiting, protective watch stance, intelligence gathering mastery"),
    ("dark_arts_gate8", "Master Investigator",
     "Investigator with magnifying glass in a dark digital crime scene, Operation Gone Dark, forensic investigation mastery"),
    ("dark_arts_gate9", "Phantom",
     "Ghost-like figure reverse engineering a binary executable, code decompilation visualization, phantom analysis"),
    ("dark_arts_gate10", "Grandmaster",
     "Skull-crowned grandmaster at a command throne, incident response capstone complete, ultimate dark arts mastery"),
    ("dark_arts_vault", "Vault Keeper",
     "Guardian standing before a massive vault door of forbidden tools, dark knowledge repository, secure vault access"),
    ("dark_arts_yara", "YARA Initiate",
     "Initiate writing glowing YARA detection rules, pattern matching runes, malware signature crafting"),
    ("dark_arts_malware_basics", "Know Thy Enemy",
     "Scholar studying enemy malware specimens in containment jars, know your enemy philosophy, malware taxonomy study"),
    ("dark_arts_speedrun", "Gate Speedrunner",
     "Blur of speed rushing through five gates simultaneously, speedrun timer counting down, lightning-fast mastery"),

    # ═══════════════════════════════════════════════════════════════
    # FACTIONLESS / DIVERGENT (10)
    # ═══════════════════════════════════════════════════════════════
    ("perspective_seeker", "Perspective Seeker",
     "Figure standing at a forked path with three directions glowing different colors, choosing multiple perspectives"),
    ("fundamentals_scholar", "Fundamentals Scholar",
     "Scholar surrounded by floating fundamental concept books glowing with foundation knowledge, bedrock mastery"),
    ("tool_wielder", "Tool Wielder",
     "Warrior wielding an arsenal of digital tools — terminal, scanner, analyzer — all glowing and ready, tool mastery"),
    ("skill_master", "Skill Master",
     "Master performing a perfect kata of combined skills, offensive and defensive stances in sequence, skill perfection"),
    ("true_divergent", "True Divergent",
     "Radiant figure at the center of three complete perspective circles, true divergent mastery, ultimate factionless achievement"),
    ("domain_explorer", "Domain Explorer",
     "Explorer with a compass navigating through knowledge domains, folder-shaped islands in a sea of data"),
    ("multi_domain", "Multi-Domain Specialist",
     "Specialist juggling multiple domain orbs — each representing a different skill area, multi-domain expertise"),
    ("jack_of_trades", "Jack of All Trades",
     "Joker card figure with tools from every domain, versatile expert, jack of all trades crown"),
    ("the_polymath", "The Polymath",
     "Brain hologram with multiple discipline connections firing simultaneously, polymath neural network, cross-domain genius"),
    ("path_finder", "Path Finder",
     "Compass rose revealing three hidden paths through a digital forest, pathfinder navigation, discovery moment"),
    ("terminal_explorer", "Terminal Explorer",
     "Explorer navigating a filesystem tree via terminal commands, cd commands leaving glowing breadcrumbs, directory traversal"),

    # ═══════════════════════════════════════════════════════════════
    # CAREER BRANCHES (12)
    # ═══════════════════════════════════════════════════════════════
    ("branch_security_analyst", "Security Analyst",
     "Analyst at a security operations center with multiple alert screens, magnifying glass over threat data, analytical focus"),
    ("branch_cloud_security", "Cloud Guardian",
     "Guardian floating in clouds with a security shield, protecting cloud infrastructure, aerial defense stance"),
    ("branch_devops", "DevOps Engineer",
     "Engineer at the intersection of development and operations, infinity loop pipeline, automated deployment mastery"),
    ("branch_network", "Network Architect",
     "Architect drafting a grand network blueprint hologram, infrastructure design mastery, network planning genius"),
    ("branch_sysadmin", "Systems Administrator",
     "Administrator at a server rack command center, managing blinking server lights, system control mastery"),
    ("branch_crypto", "Cryptographer",
     "Cryptographer at an ancient-modern cipher desk, encryption keys and mathematical formulas floating, code mastery"),
    ("branch_pentester", "Penetration Tester",
     "Tester with a red team toolkit, finding vulnerabilities in a digital fortress, ethical hacking stance"),
    ("branch_ir", "Incident Responder",
     "Responder rushing into a digital emergency, incident alarm blaring, rapid response gear, emergency protocol"),
    ("branch_master", "Master Class Graduate",
     "Graduate in ceremonial robes receiving a glowing master class diploma, pinnacle achievement, golden crown"),
    ("triple_threat", "Triple Threat",
     "Three lightning bolts converging into one point of power, triple career mastery, combined force"),
    ("renaissance_agent", "Renaissance Agent",
     "Agent with 5 career specialty tools orbiting, renaissance versatility, multi-career mastery"),
    ("complete_specialist", "Complete Specialist",
     "Trophy with all career branch emblems embedded, complete specialization crown, ultimate career achievement"),

    # ═══════════════════════════════════════════════════════════════
    # OPERATOR / MATRIX (14)
    # ═══════════════════════════════════════════════════════════════
    ("red_pill", "Red Pill Taken",
     "Glowing red pill floating between two hands, choosing to see the truth, matrix awakening moment"),
    ("terminal_initiate", "Terminal Initiate",
     "First command typed into a green-on-black Matrix terminal, cursor blinking, initiation into the system"),
    ("command_warrior", "Command Line Warrior",
     "Warrior wielding a keyboard like a weapon, command-line strikes creating digital shockwaves, terminal combat"),
    ("neo_apprentice", "Neo's Apprentice",
     "Apprentice in the Matrix training construct, code raining around them, learning to see the code"),
    ("the_one", "The One",
     "Figure stopping bullets of data with an outstretched hand, Matrix chosen one pose, absolute digital mastery"),
    ("no_spoon", "There Is No Spoon",
     "Spoon bending with pure digital will, reality manipulation, Matrix enlightenment, mind over code"),
    ("operator_status", "Operator Status",
     "Operator at a bank of screens guiding crew members through the Matrix, mission control, crew coordinator"),
    ("construct_master", "Construct Master",
     "Builder constructing a custom training simulation from floating code blocks, construct architect, training designer"),
    ("white_rabbit", "Follow the White Rabbit",
     "Glowing white rabbit made of code leading down a digital rabbit hole, follow the rabbit, discovery path"),
    ("free_your_mind", "Free Your Mind",
     "Figure leaping between rooftops made of code, freed from constraints, mind liberation, matrix jump"),
    ("deja_vu", "Deja Vu",
     "Black cat glitch walking past twice, deja vu moment, matrix glitch indicator, temporal loop"),
    ("matrix_glitch", "Glitch in the Matrix",
     "Digital reality fracturing and glitching, pixel distortion effects, matrix instability visualization"),
    ("morpheus_wisdom", "Morpheus' Wisdom",
     "Wise mentor figure in a chair offering knowledge, morpheus wisdom pose, teacher of truth"),
    ("matrix_code", "I Know Kung Fu",
     "Figure in fighting stance with downloaded skill data streaming into their mind, instant knowledge upload"),

    # ═══════════════════════════════════════════════════════════════
    # GAMES — Survival Series (41)
    # ═══════════════════════════════════════════════════════════════
    # Domain
    ("game_domain_win", "Domain Defender",
     "Defender standing over a secured Active Directory tree, domain threat neutralized, victory stance"),
    ("game_domain_by_the_book", "AD Incident Pro",
     "Professional executing perfect AD incident response procedure, textbook methodology, by-the-book mastery"),
    ("game_domain_speed", "Rapid Response: AD",
     "Lightning-fast hands at a keyboard, AD crisis resolved at blinding speed, speed lines"),
    ("game_domain_all", "Domain Master",
     "Crown atop an Active Directory tree, all 12 domain achievements completed, absolute mastery"),
    # Brick
    ("game_brick_win", "Endpoint Savior",
     "Hero saving a computer from crashing, endpoint rescue, catching a falling laptop, savior pose"),
    ("game_brick_by_the_book", "CompTIA Methodologist",
     "Professional following a glowing CompTIA troubleshooting flowchart step by step, methodology mastery"),
    ("game_brick_speed", "Rapid Response: IR",
     "Incident responder moving at light speed through containment steps, rapid IR, time blur"),
    ("game_brick_all", "Helpdesk Hero",
     "Crowned helpdesk hero with a cape, all endpoint challenges mastered, tech support champion"),
    # Phished
    ("game_phished_win", "Phishing Defender",
     "Defender hooking and discarding a phishing email before it reaches users, email shield, anti-phish"),
    ("game_phished_by_the_book", "NIST IR Pro",
     "Professional with NIST incident response framework hologram, structured response methodology"),
    ("game_phished_speed", "Rapid Response: SOC",
     "SOC analyst rapidly triaging alerts at blazing speed, alert screens flashing, rapid SOC response"),
    ("game_phished_all", "SOC Master",
     "Master of the SOC throne room, all phishing challenges conquered, security operations champion"),
    # Server
    ("game_server_win", "Server Savior",
     "Hero resuscitating a dying Linux server, server recovery, penguin being saved, sysadmin rescue"),
    ("game_server_by_the_book", "Methodical Sysadmin",
     "Sysadmin following a precise diagnostic checklist on a server, methodical troubleshooting, systematic approach"),
    ("game_server_speed", "Rapid Response: Linux",
     "Lightning-fast terminal commands fixing a Linux crisis, rapid SSH session, speed recovery"),
    ("game_server_all", "Sysadmin Legend",
     "Legendary sysadmin crowned atop a server rack mountain, all challenges mastered, Linux legend"),
    # Packet
    ("game_packet_win", "Network Savior",
     "Hero reconnecting severed network cables with energy, packet flow restored, network rescue"),
    ("game_packet_by_the_book", "Network Methodologist",
     "Network engineer following Network+ troubleshooting methodology precisely, OSI layer analysis"),
    ("game_packet_speed", "Rapid Response: Network",
     "Packets zooming through a network at incredible speed after rapid fix, network speed recovery"),
    ("game_packet_all", "Network Legend",
     "Legendary network engineer at the center of a perfect network topology, all challenges mastered"),
    # Deploy
    ("game_deploy_win", "Friday Survivor",
     "Survivor emerging from a Friday deployment disaster zone, deployment fixed, weekend saved"),
    ("game_deploy_by_the_book", "CI/CD Professional",
     "Professional managing a perfect CI/CD pipeline, green builds flowing, deployment methodology mastery"),
    ("game_deploy_speed", "Rapid Response: DevOps",
     "DevOps engineer rapidly rolling back a failed deploy, quick recovery, pipeline emergency fix"),
    ("game_deploy_all", "DevOps Legend",
     "Legendary DevOps engineer crowned with an infinity loop crown, all deployment challenges mastered"),
    # Troll
    ("game_troll_win", "Troll Tamer",
     "Intelligence agent containing an online threat actor, troll neutralized, OSINT victory"),
    ("game_troll_by_the_book", "OSINT Professional",
     "Professional executing the intelligence cycle perfectly, OSINT methodology, structured investigation"),
    ("game_troll_speed", "Rapid Response: OSINT",
     "Rapid OSINT gathering with multiple browser windows and tools, speed intelligence collection"),
    ("game_troll_all", "Intelligence Legend",
     "Legendary intelligence analyst crowned, all OSINT challenges mastered, intelligence operations master"),
    # Key
    ("game_key_win", "Key Keeper",
     "Guardian securing a leaked cryptographic key, key containment, securing the leak"),
    ("game_key_by_the_book", "Crypto Professional",
     "Professional executing crypto incident response by the textbook, key rotation methodology"),
    ("game_key_speed", "Rapid Response: Crypto",
     "Rapid key rotation and certificate revocation, speed crypto response, emergency key management"),
    ("game_key_all", "Crypto Legend",
     "Legendary cryptographer crowned with key-shaped crown, all crypto challenges mastered"),
    # Bill
    ("game_bill_win", "Budget Saver",
     "Hero plugging a flood of dollar signs from a cloud billing dashboard, budget saved, cost containment"),
    ("game_bill_by_the_book", "Cloud Professional",
     "Professional following cloud remediation procedures precisely, cost optimization methodology"),
    ("game_bill_speed", "Rapid Response: Cloud",
     "Rapid cloud resource termination stopping billing hemorrhage, speed cost recovery"),
    ("game_bill_all", "Cloud Legend",
     "Legendary cloud engineer crowned, all cloud challenges mastered, cloud operations champion"),
    # Printer
    ("game_printer_win", "Printer Tamer",
     "Hero calming a raging printer beast, paper jam conquered, printer tamed and submissive"),
    ("game_printer_by_the_book", "A+ Methodologist",
     "Professional following CompTIA A+ troubleshooting methodology on a printer, systematic approach"),
    ("game_printer_speed", "Rapid Response: Printer",
     "Lightning-fast printer repair, toner and paper flying into place, speed printer fix"),
    ("game_printer_all", "Printer Legend",
     "Legendary technician crowned atop a printer mountain, all printer challenges mastered, print champion"),
    # Master
    ("game_master_survivor", "Don't Panic",
     "Calm figure with 'DON'T PANIC' glowing behind them, surrounded by 10 resolved disasters, ultimate survivor trophy"),
    # High Scores
    ("game_top3", "Podium Finish",
     "Bronze medal on a competition podium, top 3 finish, third place glory, achievement podium"),
    ("game_first_highscore", "Record Setter",
     "Gold medal shattering a previous record display, number one score, record-breaking moment"),
    ("game_highscore_5", "Score Chaser",
     "Runner chasing a floating high score across five games, score pursuit, competitive fire"),
    ("game_highscore_10", "Leaderboard Legend",
     "Crown at the top of a massive leaderboard, 10 number-one scores, leaderboard dominance"),

    # ═══════════════════════════════════════════════════════════════
    # SEASONAL (12)
    # ═══════════════════════════════════════════════════════════════
    ("halloween_2026", "Spooky Season 2026",
     "Glowing jack-o-lantern on a desk next to a terminal, Halloween cyber study session, spooky coding"),
    ("midnight_hacker", "Midnight Hacker",
     "Hacker at a terminal at midnight on Halloween, bat silhouettes and moonlight, spooky midnight session"),
    ("ghost_protocol", "Ghost Protocol",
     "Ghost floating through 13 completed modules, October achievement chain, spectral study marathon"),
    ("winter_2026", "Winter Warrior 2026",
     "Warrior studying through a snowstorm, winter determination, frost-covered terminal, icicle dedication"),
    ("new_year_resolution", "Resolution Keeper",
     "Fireworks behind a completed module on New Year's Day, resolution fulfilled, fresh start celebration"),
    ("snowflake_scholar", "Snowflake Scholar",
     "Scholar surrounded by unique snowflake-shaped knowledge crystals, winter study streak, December dedication"),
    ("holiday_grind", "Holiday Grind",
     "Christmas tree made of 25 completed module cards, holiday study grind, festive dedication tower"),
    ("spring_awakening", "Spring Awakening",
     "Cherry blossoms blooming around a newly opened house portal, spring new beginning, fresh start"),
    ("summer_scholar", "Summer Scholar",
     "Scholar studying under bright summer sun, sunglasses on, cool dedication in the heat, summer persistence"),
    ("back_to_school", "Back to School",
     "Backpack glowing with fresh modules, September return to studies, back to school energy"),
    ("friday_13th", "Triskaidekaphile",
     "13 modules glowing in a circle on Friday the 13th, unlucky number lucky achievement, mystical 13"),
    ("pi_day", "Pi Day Scholar",
     "Pi symbol made of circuit traces, 3.14 glowing on a calculator display, mathematical celebration"),
    ("cyber_monday", "Cyber Monday",
     "Cyber-themed Monday calendar page with security modules, cyber shopping for knowledge, digital Monday"),

    # ═══════════════════════════════════════════════════════════════
    # OASIS RINGS (9)
    # ═══════════════════════════════════════════════════════════════
    ("ring_seeker", "Ring Seeker",
     "Seeker approaching a glowing ring pedestal, first challenge attempt, ring quest beginning"),
    ("ring_bearer", "Ring Bearer",
     "Bearer holding a glowing OASIS ring aloft, first ring claimed, triumphant possession"),
    ("ring_defender", "Ring Defender",
     "Defender protecting a ring from a challenger's attack, defensive stance, ring preservation"),
    ("ring_collector", "Ring Collector",
     "Collector with 3 glowing rings on their fingers, multi-ring possession, growing collection"),
    ("lord_of_rings", "Lord of the Rings",
     "Figure wearing all 8 OASIS rings radiating power, complete ring mastery, lord of all rings"),
    ("ring_dynasty", "Ring Dynasty",
     "Castle with a ring floating above its tower for 30 days, dynasty endurance, long-term reign"),
    ("ring_thief", "Ring Thief",
     "Thief stealing a ring from another house's pedestal, ring theft victory, cross-house conquest"),
    ("fellowship", "The Fellowship",
     "Fellowship of 8 figures each holding a different ring challenge, quest for all rings, fellowship journey"),
    ("perfect_challenger", "Perfect Challenger",
     "Perfect score star exploding from a ring challenge arena, flawless performance, perfect ring run"),

    # ═══════════════════════════════════════════════════════════════
    # PRESTIGE (10)
    # ═══════════════════════════════════════════════════════════════
    ("hexworth_legend", "Hexworth Legend",
     "Legendary figure at the peak of Hexworth, all 8 house flags planted, complete platform mastery, golden monument"),
    ("completionist", "The Completionist",
     "100 glowing achievement orbs orbiting a champion figure, completionist crown, massive collection"),
    ("platinum_scholar", "Platinum Scholar",
     "Platinum-plated scholar badge with 10000 XP inscribed, platinum tier mastery, gleaming achievement"),
    ("diamond_mind", "Diamond Mind",
     "Diamond-shaped brain radiating 25000 XP worth of brilliance, diamond tier intellect, crystalline mastery"),
    ("perfect_run", "Perfect Run",
     "25 perfect score stars arranged in a constellation, flawless quiz history, stellar accuracy"),
    ("iron_will", "Iron Will",
     "Iron chain of 30 unbroken links representing study days, unbreakable will, streak endurance"),
    ("streak_master", "Streak Master",
     "Blazing fire trail of 100 consecutive days, unstoppable dedication, legendary streak fire"),
    ("quiz_legend", "Quiz Legend",
     "Library of 100 completed quiz scrolls forming a throne, quiz mastery culmination, knowledge throne"),
    ("lab_master", "Lab Master",
     "Master scientist in a grand laboratory with 50 completed experiments, lab mastery, science achievement"),
    ("dedication", "Unwavering Dedication",
     "Calendar of 365 marked study days forming a medal, yearly dedication, annual commitment achievement"),

    # ═══════════════════════════════════════════════════════════════
    # EXPLORER (2)
    # ═══════════════════════════════════════════════════════════════
    ("explorer", "Explorer",
     "Explorer with a glowing map having 50 discovered locations marked, page exploration, discovery compass"),
    ("lab_rat", "Lab Rat",
     "Laboratory rat in a scientist coat completing 10 experiments, hands-on lab mastery, practical achievement"),

    # ═══════════════════════════════════════════════════════════════
    # EASTER EGGS (7)
    # ═══════════════════════════════════════════════════════════════
    ("konami_code", "Up Up Down Down",
     "Classic game controller with the konami code sequence glowing, retro gaming easter egg, cheat code discovered"),
    ("binary_reader", "Binary Reader",
     "Eyes decoding floating binary 01 sequences into readable text, binary translation moment, code reading"),
    ("firefly_whisperer", "Firefly Whisperer",
     "Figure surrounded by 1000 glowing digital fireflies, gentle communion with light particles, ethereal"),
    ("digital_life", "Digital Life Observer",
     "Observer watching a digital ecosystem through a window, firefly world observation, contemplative moment"),
    ("console_hacker", "Console Hacker",
     "Developer console open with hidden commands revealed, browser dev tools easter egg, hacker discovery"),
    ("time_traveler", "Time Traveler",
     "Figure existing at both dawn and midnight simultaneously, time duality, temporal achievement"),
    ("founder_badge", "Founding Member",
     "Golden founding member medal with establishment date, first generation badge, pioneer achievement"),
]

# ---------------------------------------------------------------------------
# Style template — badge-specific (compact, iconic, circular-composition)
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

# Category-specific accent colors
CATEGORY_COLORS = {
    "milestone": "cyan and white",
    "quiz": "gold and amber",
    "shield": "blue and silver",
    "web": "teal and cyan",
    "forge": "orange and copper",
    "script": "green and lime",
    "cloud": "sky blue and white",
    "code": "purple and magenta",
    "key": "gold and amber",
    "eye": "violet and indigo",
    "level": "gold and radiant white",
    "special": "rainbow and iridescent",
    "dark_arts": "deep purple and crimson",
    "factionless": "silver and prismatic",
    "career": "gold and platinum",
    "operator": "green-on-black and neon green",
    "games": "red and gold",
    "seasonal": "festive multicolor",
    "oasis": "mythic gold and gemstone",
    "prestige": "diamond and platinum",
    "explorer": "earth brown and compass gold",
    "easter_egg": "rainbow glitch and retro",
}

# Map achievement IDs to their category for color lookup
BADGE_CATEGORIES = {}
for bid, bname, bconcept in BADGES:
    # Derive category from known patterns
    if bid.startswith("shield"): BADGE_CATEGORIES[bid] = "shield"
    elif bid.startswith("web"): BADGE_CATEGORIES[bid] = "web"
    elif bid.startswith("forge"): BADGE_CATEGORIES[bid] = "forge"
    elif bid.startswith("script"): BADGE_CATEGORIES[bid] = "script"
    elif bid.startswith("cloud"): BADGE_CATEGORIES[bid] = "cloud"
    elif bid.startswith("code"): BADGE_CATEGORIES[bid] = "code"
    elif bid.startswith("key"): BADGE_CATEGORIES[bid] = "key"
    elif bid.startswith("eye"): BADGE_CATEGORIES[bid] = "eye"
    elif bid.startswith("dark_arts"): BADGE_CATEGORIES[bid] = "dark_arts"
    elif bid.startswith("branch"): BADGE_CATEGORIES[bid] = "career"
    elif bid.startswith("game"): BADGE_CATEGORIES[bid] = "games"
    elif bid.startswith("ring") or bid in ("fellowship", "perfect_challenger", "lord_of_rings"):
        BADGE_CATEGORIES[bid] = "oasis"
    elif bid.startswith("level"): BADGE_CATEGORIES[bid] = "level"
    elif bid in ("red_pill", "terminal_initiate", "command_warrior", "neo_apprentice",
                 "the_one", "no_spoon", "operator_status", "construct_master",
                 "white_rabbit", "free_your_mind", "deja_vu", "matrix_glitch",
                 "morpheus_wisdom", "matrix_code"):
        BADGE_CATEGORIES[bid] = "operator"
    elif bid in ("perspective_seeker", "fundamentals_scholar", "tool_wielder",
                 "skill_master", "true_divergent", "domain_explorer", "multi_domain",
                 "jack_of_trades", "the_polymath", "path_finder", "terminal_explorer"):
        BADGE_CATEGORIES[bid] = "factionless"
    elif bid in ("first_login", "sorted", "first_module"):
        BADGE_CATEGORIES[bid] = "milestone"
    elif bid in ("first_quiz", "perfect_score", "quiz_master_10", "quiz_master_25",
                 "persistence", "speed_demon"):
        BADGE_CATEGORIES[bid] = "quiz"
    elif bid in ("night_owl", "early_bird", "weekend_warrior", "streak_7", "multi_house"):
        BADGE_CATEGORIES[bid] = "special"
    elif bid in ("halloween_2026", "midnight_hacker", "ghost_protocol", "winter_2026",
                 "new_year_resolution", "snowflake_scholar", "holiday_grind",
                 "spring_awakening", "summer_scholar", "back_to_school",
                 "friday_13th", "pi_day", "cyber_monday"):
        BADGE_CATEGORIES[bid] = "seasonal"
    elif bid in ("hexworth_legend", "completionist", "platinum_scholar", "diamond_mind",
                 "perfect_run", "iron_will", "streak_master", "quiz_legend",
                 "lab_master", "dedication"):
        BADGE_CATEGORIES[bid] = "prestige"
    elif bid in ("explorer", "lab_rat"):
        BADGE_CATEGORIES[bid] = "explorer"
    elif bid in ("konami_code", "binary_reader", "firefly_whisperer", "digital_life",
                 "console_hacker", "time_traveler", "founder_badge"):
        BADGE_CATEGORIES[bid] = "easter_egg"
    else:
        BADGE_CATEGORIES[bid] = "special"


def make_prompt(badge_id, name, concept):
    cat = BADGE_CATEGORIES.get(badge_id, "special")
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
    print(f"Hexworth Prime — Badge Art Generator (fal.ai FLUX.1 [dev])")
    print(f"Output: {os.path.abspath(OUT_DIR)}")
    print(f"Badges: {total}")
    print(f"Size:   {IMAGE_SIZE['width']}x{IMAGE_SIZE['height']} (1:1 square)")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for i, (badge_id, name, concept) in enumerate(BADGES, 1):
        out_path = os.path.join(OUT_DIR, f"{badge_id}.png")

        if os.path.exists(out_path):
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


if __name__ == "__main__":
    main()
