"""
Smoke-tag one representative project per house with careerRoles (P3a validation gate,
per adversarial review). Proves the new CareerPaths vocabulary assigns cleanly across all
12 houses BEFORE any mass-tagging (P3b) or bridge UI. Deliberately includes the ambiguous
houses (matrix, divergent) the reviewer flagged. Injects careerRoles right after each
target entry's xp field; additive, idempotent (skips entries that already have careerRoles).
"""
import re

PD = '/home/eq/ai-content/hexworth-prime/_app/projects/ProjectsData.js'
src = open(PD).read()

# (project id, [careerRoles]) — one representative per house. ai already tagged in P2.
TAGS = {
    'script-system-monitor':   ['devops-engineer', 'sysadmin'],     # script
    'shield-log-analyzer':     ['soc-analyst'],                     # shield
    'darkarts-metasploit':     ['penetration-tester'],              # dark-arts
    'eye-osint-dashboard':     ['forensics-analyst', 'soc-analyst'],# eye
    'code-cli-task-manager':   ['software-developer'],              # code
    'forge-sensor-dashboard':  ['hardware-engineer'],               # forge
    'web-topology-visualizer': ['network-engineer'],                # web
    'cloud-container-checker': ['cloud-engineer', 'devops-engineer'],# cloud
    'key-password-vault':      ['security-architect', 'appsec-engineer'], # key
    'matrix-packet-visualizer':['soc-analyst', 'data-analyst'],     # matrix (ambiguous: network analysis)
    'divergent-multi-tool':    ['sysadmin', 'soc-analyst'],         # divergent (cross-domain -> existing paths)
}

injected, skipped = [], []
for pid, roles in TAGS.items():
    # Already tagged? skip (idempotent).
    block = re.search(r"id: '" + re.escape(pid) + r"'[\s\S]{0,800}?xp: \d+", src)
    if not block:
        skipped.append(pid + ' (NOT FOUND)')
        continue
    if 'careerRoles' in src[block.start():block.end() + 40]:
        skipped.append(pid + ' (already tagged)')
        continue
    roles_js = "[" + ", ".join(f"'{r}'" for r in roles) + "]"
    # Insert careerRoles immediately after the matched "...xp: NNN".
    src = src[:block.end()] + f", careerRoles: {roles_js}" + src[block.end():]
    injected.append(pid)

open(PD, 'w').write(src)
print("injected:", injected)
print("skipped:", skipped)
