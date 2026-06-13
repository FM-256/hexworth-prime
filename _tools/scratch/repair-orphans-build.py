"""
Rebuild the 12 malformed orphan project pages as clean, single-document case-file pages.

Strategy: take the proven exemplar template (starter-first-app.html) for the canonical
<style> + cover/section structure, SALVAGE the good body content from /tmp/orphan-content.json
(mission brief, requirements, phase titles+instructions, asset manifest, expected outcomes —
all verbatim), and apply FIXES authored here: one correctly-aligned checkpoint per phase,
unique case refs, real house + emblem, a Related Training section, registry-matching difficulty
badge, and a neutral word-free blueprint background (removes the wrong-domain-art defect).

Eliminates the duplicate-document defect mechanically (single emitted doc) and the missing
sections / wrong emblem / misaligned-checkpoint defects via the generator + authored fixes.
"""
import re, json, urllib.parse, html as _html

ROOT = '/home/eq/ai-content/hexworth-prime/_app/projects/'
TMPL = ROOT + 'starter-first-app.html'
CONTENT = json.load(open('/tmp/orphan-content.json'))

# Canonical case-file <style> from the proven exemplar.
css = re.search(r'<style>(.*?)</style>', open(TMPL).read(), re.S).group(1)

# Neutral, word-free blueprint background (faint geometry only — no domain text to mis-teach).
BG = (
"<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='800' fill='none' stroke='#5b6b7a'>"
"<g opacity='0.05'>"
+ "".join(f"<line x1='{x}' y1='0' x2='{x}' y2='800' stroke-width='0.5'/>" for x in range(0,1001,40))
+ "".join(f"<line x1='0' y1='{y}' x2='1000' y2='{y}' stroke-width='0.5'/>" for y in range(0,801,40))
+ "</g>"
"<g opacity='0.10'>"
"<rect x='120' y='150' width='180' height='110' rx='4' stroke-width='1.2'/>"
"<rect x='420' y='240' width='180' height='110' rx='4' stroke-width='1.2'/>"
"<rect x='700' y='130' width='180' height='110' rx='4' stroke-width='1.2'/>"
"<line x1='300' y1='205' x2='420' y2='295' stroke-width='1'/>"
"<line x1='600' y1='295' x2='700' y2='185' stroke-width='1'/>"
"<circle cx='210' cy='205' r='5' fill='#5b6b7a' stroke='none'/>"
"<circle cx='510' cy='295' r='5' fill='#5b6b7a' stroke='none'/>"
"<circle cx='790' cy='185' r='5' fill='#5b6b7a' stroke='none'/>"
"<rect x='250' y='500' width='500' height='160' rx='4' stroke-width='1.2'/>"
"<line x1='250' y1='540' x2='750' y2='540' stroke-width='0.8'/>"
"<line x1='400' y1='500' x2='400' y2='660' stroke-width='0.8'/>"
"</g></svg>"
)
BG_URI = "data:image/svg+xml," + urllib.parse.quote(BG)
css = re.sub(r'background-image: url\("data:image/svg\+xml,.*?"\);',
             f'background-image: url("{BG_URI}");', css, count=1, flags=re.S)

EMBLEM = {'cloud':'cloud','dark-arts':'dark-arts','forge':'forge','shield':'shield','code':'code','web':'web'}

# Per-page fixes: house, domain, case ref, registry-matching difficulty label, Related Training,
# and one correctly-aligned checkpoint (list of verify items) PER PHASE (phase order from JSON).
FIXES = {
 'cloud-ec2-first-server': dict(house='cloud', domain='Cloud Infrastructure', ref='CL-EC2-001', diff='Beginner',
   related=[('cloud','Cloud House','../houses/cloud/index.html','House'),
            ('cloud','My First Server','starter-first-server.html','Project'),
            ('cloud','My First Container','starter-first-container.html','Project')],
   checkpoints=[
     ['Launch an EC2 instance from a free-tier AMI and confirm it reaches the "running" state in the console',
      'Confirm the instance has a public IPv4 address assigned'],
     ['Confirm the security group allows inbound SSH (port 22) from your IP and HTTP (port 80)',
      'Verify no port is left open to 0.0.0.0/0 that does not need to be'],
     ['SSH into the instance using your key pair and confirm you land at a shell prompt',
      'Run a command (e.g. uname -a) to confirm the session is live'],
     ['Install and start a web server, then load the instance public IP in a browser and see the default page',
      'Confirm the web server is listening with a port check'],
     ['Terminate the instance and confirm it leaves the "running" state so you incur no further charges',
      'Verify in the console that no stray volumes or Elastic IPs remain billable']]),
 'cloud-oracle-free-vm': dict(house='cloud', domain='Cloud Infrastructure', ref='CL-OCI-001', diff='Beginner',
   related=[('cloud','Cloud House','../houses/cloud/index.html','House'),
            ('cloud','Launch Your First EC2 Instance','cloud-ec2-first-server.html','Project'),
            ('cloud','My First Server','starter-first-server.html','Project')],
   checkpoints=[
     ['Create an Oracle Cloud free-tier account and reach the console dashboard',
      'Confirm you selected an Always Free eligible region and shape'],
     ['Generate an SSH key pair and confirm both the private and public key files exist locally',
      'Confirm the public key is the one you will paste into the instance config'],
     ['Create an Always Free compute instance and confirm it reaches the "running" state',
      'Confirm the instance shows a public IP address'],
     ['SSH into the instance with your key and confirm you reach a shell prompt',
      'Run a command to confirm the session is live'],
     ['Add an ingress rule for HTTP (port 80) to the security list and confirm it is saved',
      'Confirm a web request to the public IP reaches the instance']]),
 'cloud-s3-static-site': dict(house='cloud', domain='Cloud Infrastructure', ref='CL-S3-001', diff='Beginner',
   related=[('cloud','Cloud House','../houses/cloud/index.html','House'),
            ('cloud','My First Web Page','starter-first-webpage.html','Project'),
            ('cloud','Launch Your First EC2 Instance','cloud-ec2-first-server.html','Project')],
   checkpoints=[
     ['Create an S3 bucket with a globally-unique name and confirm it appears in the console',
      'Confirm the bucket region is the one you intended'],
     ['Enable static website hosting on the bucket and note the website endpoint URL',
      'Confirm you set the index document (e.g. index.html)'],
     ['Apply a bucket policy granting public read and confirm the policy saves without error',
      'Confirm public-access-block settings allow the policy to take effect'],
     ['Upload your site files and confirm they appear in the bucket',
      'Confirm index.html is at the bucket root, not inside a folder'],
     ['Load the website endpoint URL in a browser and see your site',
      'Change a file, re-upload, and confirm the change appears after refresh']]),
 'darkarts-kali-setup': dict(house='dark-arts', domain='Offensive Security', ref='DA-KAL-001', diff='Beginner',
   related=[('dark-arts','Dark Arts','../houses/dark-arts/index.html','House'),
            ('dark-arts','My First Hack','starter-first-hack.html','Project'),
            ('forge','Create Your First Virtual Machine','forge-virtualbox-first-vm.html','Project')],
   checkpoints=[
     ['Create a VM and complete the Kali Linux install, reaching the desktop after reboot',
      'Confirm the VM is on a host-only or NAT network isolated from production'],
     ['Run apt update and apt upgrade and confirm the system reports up to date',
      'Confirm you can resolve DNS and reach the internet from the VM'],
     ['Install guest additions / VMware tools and confirm clipboard or resize works',
      'Confirm the integration survives a reboot'],
     ['Confirm your shell, user, and any tooling preferences are configured',
      'Confirm a non-root workflow (sudo) works as expected'],
     ['Run a baseline tool (e.g. nmap --version) and confirm the toolkit is functional',
      'Run a first scan against your own lab host and confirm you get results']]),
 'forge-home-lab': dict(house='forge', domain='Hardware & Systems', ref='FG-LAB-001', diff='Journeyman',
   related=[('forge','Forge House','../houses/forge/index.html','House'),
            ('forge','Create Your First Virtual Machine','forge-virtualbox-first-vm.html','Project'),
            ('dark-arts','Set Up Your Kali Linux Attack VM','darkarts-kali-setup.html','Project')],
   requirements=[
     'VirtualBox or VMware Workstation installed',
     'At least 16 GB total RAM (10 GB allocatable to run all three VMs concurrently: 4 + 4 + 2)',
     'Windows Server 2022 evaluation ISO (free 180-day eval from Microsoft)',
     'Windows 10 Enterprise evaluation ISO (free 90-day eval from Microsoft)',
     'Kali Linux ISO from kali.org',
     '80+ GB free disk space'],
   checkpoints=[
     ['Create a host-only/internal network and confirm VMs on it can reach each other but not the internet unless intended',
      'Confirm the lab is isolated from your production LAN'],
     ['Install the AD DS role and promote the server to a domain controller for hexlab.local',
      'In PowerShell, run <code>Get-ADDomain</code> and confirm it returns hexlab.local; confirm AD DS appears under Roles in Server Manager'],
     ['Join the workstation to hexlab.local and reboot',
      'Log in as <code>hexlab\\Administrator</code>, then open Settings &gt; System &gt; About and confirm "Domain: hexlab.local" appears under Device specifications'],
     ['Build the attacker VM and confirm it sits on the same isolated network',
      'From the attacker, run <code>ping 10.0.0.1</code> to reach the DC and <code>nmap 10.0.0.0/24</code> to see all three machines'],
     ['Take a clean snapshot of all three VMs so you can reset the lab',
      'Restore one snapshot and confirm the VM returns to its clean state']]),
 'forge-virtualbox-first-vm': dict(house='forge', domain='Hardware & Systems', ref='FG-VBX-001', diff='Beginner',
   related=[('forge','Forge House','../houses/forge/index.html','House'),
            ('forge','Build a VM with VMware Workstation','forge-vmware-first-vm.html','Project'),
            ('forge','Build a 3-VM Home Lab','forge-home-lab.html','Project')],
   checkpoints=[
     ['Create a new VM in VirtualBox with a name, OS type, RAM, and a virtual disk',
      'Confirm the VM appears in the VirtualBox manager'],
     ['Attach the Ubuntu ISO to the optical drive and boot the VM to the installer',
      'Confirm the VM boots from the ISO, not an empty disk'],
     ['Complete the Ubuntu install and reboot into the installed system',
      'Confirm you can log in to the desktop'],
     ['Install Guest Additions and confirm dynamic resize or shared clipboard works',
      'Confirm the integration persists after reboot'],
     ['Take a snapshot of the clean install and name it',
      'Make a change, restore the snapshot, and confirm the change is gone']]),
 'forge-vmware-first-vm': dict(house='forge', domain='Hardware & Systems', ref='FG-VMW-001', diff='Beginner',
   related=[('forge','Forge House','../houses/forge/index.html','House'),
            ('forge','Create Your First Virtual Machine','forge-virtualbox-first-vm.html','Project'),
            ('forge','Build a 3-VM Home Lab','forge-home-lab.html','Project')],
   checkpoints=[
     ['Create a VM with VMware Workstation and complete the guest OS install',
      'Confirm the VM boots to the OS after install'],
     ['Set the VM CPU, RAM, and disk allocation and confirm the VM still boots',
      'Confirm the allocation is sane for your host'],
     ['Switch the VM network adapter between NAT and bridged and confirm connectivity in each',
      'Confirm you understand which mode isolates vs exposes the VM'],
     ['Install VMware Tools and confirm resize / clipboard integration works',
      'Confirm the integration persists after reboot'],
     ['Take a snapshot, then create a linked or full clone of the VM',
      'Confirm the clone boots independently of the original']]),
 'shield-firewall-iptables': dict(house='shield', domain='Security & Defense', ref='SH-FW-001', diff='Beginner',
   related=[('shield','Shield House','../houses/shield/index.html','House'),
            ('shield','My First Firewall','starter-first-firewall.html','Project'),
            ('dark-arts','Set Up Your Kali Linux Attack VM','darkarts-kali-setup.html','Project')],
   checkpoints=[
     ['List current rules with iptables -L and set default policies (e.g. DROP for INPUT)',
      'Confirm the default policy is shown as set'],
     ['Add a rule allowing SSH (port 22) from your IP and confirm you can still connect',
      'Confirm the rule appears in iptables -L in the correct chain'],
     ['Add rules allowing established/outbound web traffic and confirm browsing still works',
      'Confirm a blocked port is actually refused'],
     ['Add a LOG rule for dropped packets and confirm entries appear in the kernel log',
      'Confirm the log rule sits before the drop in the chain order'],
     ['Save the ruleset so it persists across reboot (iptables-save / netfilter-persistent)',
      'Reboot and confirm the rules are still loaded']]),
 'starter-calculator': dict(house='code', domain='Software Development', ref='CD-CALC-001', diff='Beginner',
   related=[('code','Code House','../houses/code/index.html','House'),
            ('code','My First App','starter-first-app.html','Project'),
            ('code','Build a Portfolio Website with GitHub Pages','starter-portfolio-site.html','Project')],
   checkpoints=[
     ['Build the HTML layout with a display element and number/operator buttons',
      'Confirm every button and the display render in the browser'],
     ['Style the buttons into a grid with CSS and confirm the layout holds on resize',
      'Confirm the display and buttons align cleanly'],
     ['Wire click handlers so pressing a button updates the display',
      'Confirm digits and operators append to the display correctly'],
     ['Implement the arithmetic so an expression evaluates to the right result on "="',
      'Confirm all four operations (+, -, *, /) compute correctly'],
     ['Handle edge cases: divide-by-zero, clear, and chained operations',
      'Confirm divide-by-zero shows a safe message rather than crashing']]),
 'starter-first-repo': dict(house='code', domain='Software Development', ref='CD-GIT-001', diff='Beginner',
   related=[('code','Code House','../houses/code/index.html','House'),
            ('code','Create Your GitHub Profile README','starter-github-profile.html','Project'),
            ('code','My First App','starter-first-app.html','Project')],
   checkpoints=[
     ['Run git --version to confirm Git is installed, then set user.name and user.email',
      'Confirm git config shows your name and email'],
     ['Run git init in a new folder and confirm the .git/ directory is created',
      'Confirm git status shows your README as untracked'],
     ['Stage with git add, commit with a message, and confirm it appears in git log',
      'Confirm the commit shows your configured author identity'],
     ['Create an empty GitHub repo, then git remote add origin <url>',
      'Confirm git remote -v shows the origin URL'],
     ['Run git push -u origin main and confirm your files appear on GitHub',
      'Confirm the remote commit history matches your local git log']]),
 'starter-github-profile': dict(house='code', domain='Software Development', ref='CD-GHP-001', diff='Beginner',
   related=[('code','Code House','../houses/code/index.html','House'),
            ('code','Your First Git Repository','starter-first-repo.html','Project'),
            ('web','Build a Portfolio Website with GitHub Pages','starter-portfolio-site.html','Project')],
   checkpoints=[
     ['Create the special repo named exactly after your username with a README.md',
      'Confirm GitHub shows the "magic" profile README on your profile page'],
     ['Write a bio/intro section and confirm it renders as Markdown on your profile',
      'Confirm headings and links display correctly'],
     ['Add technology badges and confirm the images load on the profile',
      'Confirm each badge links or renders without broken images'],
     ['Add links to your pinned projects and confirm each link resolves',
      'Confirm the project links open the intended repos'],
     ['Add a GitHub stats widget and confirm it renders live stats',
      'Confirm the widget reflects your real activity']]),
 'starter-portfolio-site': dict(house='web', domain='Web Development', ref='WB-PORT-001', diff='Beginner',
   related=[('web','Web House','../houses/web/index.html','House'),
            ('web','My First Web Page','starter-first-webpage.html','Project'),
            ('code','Create Your GitHub Profile README','starter-github-profile.html','Project')],
   checkpoints=[
     ['Build the HTML structure with header, about, projects, and contact sections',
      'Confirm every section renders in order in the browser'],
     ['Fill the about and skills sections with real content',
      'Confirm the text renders and is readable'],
     ['Build the projects section with a card per project',
      'Confirm each project card shows a title, description, and link'],
     ['Style the site with CSS so it looks intentional on desktop and mobile',
      'Confirm the layout holds at a narrow (mobile) width'],
     ['Deploy via GitHub Pages and confirm the public URL serves your site',
      'Confirm a change pushed to the repo appears on the live URL after rebuild']]),
}

def esc(s): return s  # content already HTML in source; pass through

# Build the dossier cover block: classified stamp, case-no/filed/status meta row, redaction
# bar, house seal (correct emblem for the assigned house), subject title, and the three
# badges (registry-matching difficulty label + salvaged time + salvaged XP).
def cover(rec, fx):
    emblem = EMBLEM[fx['house']]
    house_name = {'cloud':'Cloud House','dark-arts':'Dark Arts','forge':'Forge House',
                  'shield':'Shield House','code':'Code House','web':'Web House'}[fx['house']]
    return f'''        <div class="cf-cover">
            <div class="cf-stamp">Classified</div>
            <div class="cf-meta-row">
                <span class="cf-meta-item">Case No: <span class="cf-meta-value">{fx['ref']}</span></span>
                <span class="cf-meta-item">Filed: <span class="cf-meta-value">2026-06-13</span></span>
                <span class="cf-meta-item">Status: <span class="cf-meta-value">Open</span></span>
            </div>
            <div class="cf-redaction-bar"></div>
            <div class="cf-house-row">
                <div class="cf-house-seal"><img src="/assets/images/emblems/{emblem}.webp" alt=""></div>
                <div class="cf-house-info">
                    <span class="cf-house-name">{house_name}</span>
                    <span class="cf-house-domain">{fx['domain']}</span>
                </div>
            </div>
            <div class="cf-subject-label">Subject</div>
            <h1 class="cf-subject">{rec['subject']}</h1>
            <div class="cf-badges">
                <span class="cf-badge cf-badge-diff">{fx['diff']}</span>
                <span class="cf-badge cf-badge-time">{rec['time']}</span>
                <span class="cf-badge cf-badge-xp">{rec['xp']}</span>
            </div>
        </div>'''

# Build one Operation Phase evidence card: completion checkbox, marker number, the salvaged
# phase title + instruction, and a correctly-aligned "how to verify" checkpoint (authored here,
# one per phase) rendered as a verify-item list.
def phase_card(n, p, checkpoint):
    items = "".join(f"<li>{it}</li>" for it in checkpoint)
    return f'''                <div class="cf-evidence-card" id="phase-{n}">
                    <div class="phase-check" onclick="togglePhase({n})" id="check-{n}">&#10003;</div>
                    <div class="cf-evidence-marker">{n}</div>
                    <div class="cf-evidence-body">
                        <div class="cf-evidence-title">{p['title']}</div>
                        <div class="cf-evidence-desc">{p['desc']}</div>
                        <div class="phase-checkpoint">
                            <div class="phase-checkpoint-label">Checkpoint &mdash; how to verify</div>
                            <div class="phase-checkpoint-text"><ul style="margin:0;padding-left:18px;">{items}</ul></div>
                        </div>
                    </div>
                </div>'''

# Assemble and write one clean single-document case-file page: merges the salvaged content
# (mission, requirements, phase titles/instructions, assets, outcomes) from the JSON with the
# authored fixes (cover metadata, aligned checkpoints, Related Training) and the canonical
# <style>. Returns (byte size, phase count).
def build(pid):
    rec = CONTENT[pid]; fx = FIXES[pid]
    n_phases = len(rec['phases'])
    mission = "".join(f"<p>{p}</p>" for p in rec['mission'])
    # Requirements default to the salvaged list, but a page may override them in FIXES
    # (e.g. to reconcile a factual error in the original content).
    reqs = "".join(f"<li>{r}</li>" for r in fx.get('requirements', rec['requirements']))
    cards = "\n\n".join(phase_card(i+1, rec['phases'][i], fx['checkpoints'][i]) for i in range(n_phases))
    assets = "".join(f'<div class="cf-manifest-item">{a}</div>' for a in rec['assets'])
    outcomes = "".join(f"<li>{o}</li>" for o in rec['outcomes'])
    related = "".join(
        f'''                <a href="{href}" class="cf-training-card">
                    <span class="tc-district">{dist}</span>
                    <span class="tc-title">{title}</span>
                    <span class="tc-type">{typ}</span>
                </a>''' for (dist_house, dist, href, typ), title in
        [((r[0], {'cloud':'Cloud House','dark-arts':'Dark Arts','forge':'Forge House','shield':'Shield House','code':'Code House','web':'Web House'}[r[0]], r[2], r[3]), r[1]) for r in fx['related']])

    body = f'''<body>

    <div class="cf-drafting-table"></div>

    <div class="cf-header">
        <a href="index.html">&larr; PROJECTS</a>
        <span class="cf-header-title">Case File</span>
        <span class="cf-header-ref">{fx['ref']}</span>
    </div>

    <div class="cf-content">

{cover(rec, fx)}

        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Mission Brief</div>
            <div class="cf-prose">{mission}</div>
        </div>

        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Agent Requirements</div>
            <ul class="cf-req-list">{reqs}</ul>
        </div>

        <div class="cf-paper">
            <div class="cf-section-stamp">Operation Phases</div>
            <div class="phase-progress">
                <span class="phase-progress-label">Progress</span>
                <div class="phase-progress-bar"><div class="phase-progress-fill" id="phaseProgressFill"></div></div>
                <span class="phase-progress-count" id="phaseProgressCount">0 / {n_phases}</span>
            </div>
            <div class="cf-evidence-board">

{cards}

            </div>
        </div>

        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Asset Manifest</div>
            <div class="cf-manifest">{assets}</div>
        </div>

        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Expected Outcomes</div>
            <ul class="cf-debrief-list">{outcomes}</ul>
        </div>

        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Related Training</div>
            <div class="cf-training-grid">
{related}
            </div>
        </div>

        <div class="cf-footer">
            <div class="cf-footer-text">End of File &mdash; Hexworth Prime</div>
        </div>

    </div>

<script>
(function() {{
    var PROJECT_KEY = 'hex_project_{pid}';
    var TOTAL_PHASES = {n_phases};
    function getState() {{ try {{ return JSON.parse(localStorage.getItem(PROJECT_KEY)) || {{}}; }} catch(e) {{ return {{}}; }} }}
    function saveState(s) {{ localStorage.setItem(PROJECT_KEY, JSON.stringify(s)); }}
    window.togglePhase = function(id) {{ var s = getState(); s[id] = !s[id]; saveState(s); render(); }};
    function render() {{
        var s = getState(), done = 0;
        for (var i = 1; i <= TOTAL_PHASES; i++) {{
            var c = document.getElementById('phase-' + i), k = document.getElementById('check-' + i);
            if (!c || !k) continue;
            if (s[i]) {{ c.classList.add('phase-done'); k.classList.add('checked'); done++; }}
            else {{ c.classList.remove('phase-done'); k.classList.remove('checked'); }}
        }}
        var f = document.getElementById('phaseProgressFill'), n = document.getElementById('phaseProgressCount');
        if (f) f.style.width = Math.round((done / TOTAL_PHASES) * 100) + '%';
        if (n) n.textContent = done + ' / ' + TOTAL_PHASES;
    }}
    render();
}})();
</script>
</body>
</html>'''

    out = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CASE FILE: {rec['subject']} | Hexworth Prime</title>
    <style>{css}</style>
</head>
{body}'''
    open(ROOT + pid + '.html', 'w').write(out)
    return len(out), n_phases

import sys
targets = sys.argv[1:] if len(sys.argv) > 1 else list(FIXES.keys())
for pid in targets:
    sz, n = build(pid)
    print(f"rebuilt {pid}: {sz}b, {n} phases")
