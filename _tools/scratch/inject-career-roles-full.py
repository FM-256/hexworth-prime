"""
Full P3 tagging pass: assign careerRoles to the remaining ~104 untagged projects, mapping
each to 1-2 CareerPaths ids (house-informed, refined by the project's actual content/title).
Idempotent + additive: skips entries that already have careerRoles (the 16 smoke-tagged).
Same targeted-insert mechanism as inject-career-roles.py (insert after each entry's xp field).
"""
import re

PD = '/home/eq/ai-content/hexworth-prime/_app/projects/ProjectsData.js'
src = open(PD).read()

TAGS = {
    # ── ai ──
    'ai-threat-classifier': ['ai-engineer', 'soc-analyst'],
    'ai-network-anomaly': ['ai-engineer', 'soc-analyst'],
    'ai-rag-chatbot': ['ai-engineer'],
    'ai-intrusion-detector': ['ai-engineer', 'soc-analyst'],
    'ai-research-agent': ['ai-engineer'],
    'ai-explainable-ml': ['ai-engineer', 'data-analyst'],
    'ai-reinforcement-taxi': ['ai-engineer'],
    'ai-music-generation': ['ai-engineer'],
    'ai-rasa-chatbot': ['ai-engineer'],
    'ai-face-detection': ['ai-engineer'],
    'ai-data-augmentation': ['ai-engineer', 'data-analyst'],
    # ── cloud ──
    'starter-first-server': ['cloud-engineer', 'sysadmin'],
    'starter-first-container': ['cloud-engineer', 'devops-engineer'],
    'cloud-ec2-first-server': ['cloud-engineer'],
    'cloud-oracle-free-vm': ['cloud-engineer'],
    'cloud-s3-static-site': ['cloud-engineer'],
    'cloud-pi-homelab': ['sysadmin', 'devops-engineer'],
    'cloud-k8s-deploy': ['devops-engineer', 'cloud-engineer'],
    'cloud-terraform-infra': ['devops-engineer', 'cloud-engineer'],
    'cloud-api-nginx': ['devops-engineer', 'cloud-engineer'],
    'cloud-budget-fern': ['software-developer', 'cloud-engineer'],
    'cloud-django-eks': ['devops-engineer', 'cloud-engineer'],
    'cloud-helm-charts': ['devops-engineer'],
    'cloud-aws-vpc': ['cloud-security-engineer', 'cloud-engineer'],
    'cloud-serverless-django': ['cloud-engineer', 'devops-engineer'],
    # ── code ──
    'starter-first-app': ['software-developer'],
    'starter-first-gui': ['software-developer'],
    'starter-first-api': ['software-developer'],
    'starter-first-database': ['software-developer'],
    'starter-first-pipeline': ['devops-engineer'],
    'starter-calculator': ['software-developer'],
    'starter-first-repo': ['software-developer'],
    'starter-github-profile': ['software-developer'],
    'code-serial-console': ['software-developer', 'hardware-engineer'],
    'code-arduino-pipeline': ['software-developer', 'hardware-engineer'],
    'code-typing-speed': ['software-developer'],
    'code-task-manager': ['software-developer'],
    'code-chat-app': ['software-developer'],
    'code-resume-builder': ['software-developer'],
    'code-ecommerce-stripe': ['software-developer'],
    'code-memory-game': ['software-developer'],
    'code-wordle-clone': ['software-developer'],
    # ── dark-arts ──
    'starter-first-hack': ['penetration-tester'],
    'darkarts-kali-setup': ['penetration-tester'],
    'darkarts-port-scanner': ['penetration-tester'],
    'darkarts-wifi-scanner': ['penetration-tester'],
    'darkarts-recon-automation': ['penetration-tester'],
    'darkarts-web-scraping': ['penetration-tester', 'forensics-analyst'],
    'darkarts-puppeteer': ['penetration-tester'],
    # ── divergent ──
    'starter-first-bot': ['software-developer'],
    'divergent-faceless-youtube': ['software-developer'],
    'divergent-field-terminal': ['hardware-engineer', 'penetration-tester'],
    'divergent-discord-bot': ['software-developer'],
    'divergent-manim': ['software-developer'],
    # ── eye ──
    'starter-first-scan': ['soc-analyst'],
    'eye-motion-surveillance': ['hardware-engineer'],
    'eye-selenium-testing': ['software-developer'],
    'eye-playwright-testing': ['software-developer'],
    'eye-pytorch-onnx': ['ai-engineer', 'software-developer'],
    # ── forge ──
    'forge-home-lab': ['sysadmin'],
    'forge-virtualbox-first-vm': ['sysadmin'],
    'forge-vmware-first-vm': ['sysadmin'],
    'forge-flashcard-engine': ['software-developer'],
    'forge-env-monitor': ['hardware-engineer'],
    'forge-telegram-bot': ['software-developer', 'devops-engineer'],
    'forge-crossword-puzzle': ['software-developer'],
    'forge-spring-fullstack': ['software-developer'],
    # ── key ──
    'key-rfid-access': ['hardware-engineer', 'security-architect'],
    'key-blockchain': ['software-developer', 'security-architect'],
    'key-nft-marketplace': ['software-developer', 'appsec-engineer'],
    'key-secure-doc-storage': ['security-architect', 'software-developer'],
    'key-brownie-contracts': ['software-developer', 'appsec-engineer'],
    # ── matrix ──
    'matrix-traffic-dashboard': ['soc-analyst', 'data-analyst'],
    'matrix-data-viz': ['data-analyst'],
    'matrix-time-series': ['data-analyst', 'ai-engineer'],
    'matrix-sentiment-nlp': ['data-analyst', 'ai-engineer'],
    'matrix-climate-analysis': ['data-analyst'],
    'matrix-customer-segmentation': ['data-analyst', 'ai-engineer'],
    'matrix-plotly-viz': ['data-analyst'],
    'matrix-stock-analysis': ['data-analyst'],
    'matrix-kafka-streaming': ['data-analyst', 'devops-engineer'],
    # ── script ──
    'starter-first-script': ['sysadmin', 'devops-engineer'],
    'script-pi-automation': ['sysadmin', 'devops-engineer'],
    'script-data-logger': ['hardware-engineer', 'sysadmin'],
    'script-etl-pipeline': ['data-analyst', 'devops-engineer'],
    'script-github-actions': ['devops-engineer'],
    'script-video-summarizer': ['software-developer', 'data-analyst'],
    'script-web-crawler': ['software-developer'],
    'script-data-pipeline': ['data-analyst', 'devops-engineer'],
    # ── shield ──
    'starter-first-firewall': ['soc-analyst'],
    'shield-firewall-iptables': ['soc-analyst'],
    'shield-pi-ids': ['soc-analyst'],
    'shield-perimeter-alarm': ['hardware-engineer', 'soc-analyst'],
    'shield-ids-ml': ['soc-analyst', 'ai-engineer'],
    'shield-fake-news': ['ai-engineer', 'data-analyst'],
    'shield-aws-cognito': ['cloud-security-engineer', 'appsec-engineer'],
    # ── web ──
    'starter-first-webpage': ['software-developer'],
    'starter-first-network': ['network-engineer'],
    'starter-portfolio-site': ['software-developer'],
    'web-pi-network-probe': ['network-engineer', 'sysadmin'],
    'web-rest-api': ['software-developer'],
    'web-online-portfolio': ['software-developer'],
    'web-react-router': ['software-developer'],
    'web-elearning-flask': ['software-developer'],
}

injected, skipped = [], []
for pid, roles in TAGS.items():
    block = re.search(r"id: '" + re.escape(pid) + r"'[\s\S]{0,1200}?xp: \d+", src)
    if not block:
        skipped.append(pid + ' (NOT FOUND)')
        continue
    if 'careerRoles' in src[block.start():block.end() + 40]:
        skipped.append(pid + ' (already)')
        continue
    roles_js = "[" + ", ".join(f"'{r}'" for r in roles) + "]"
    src = src[:block.end()] + f", careerRoles: {roles_js}" + src[block.end():]
    injected.append(pid)

open(PD, 'w').write(src)
print(f"injected {len(injected)} | skipped {len(skipped)}")
if skipped:
    print("skipped:", skipped)
