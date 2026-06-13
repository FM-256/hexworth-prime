"""
Build 6 Shield-house GRC + Security-Leadership projects (fills the two empty career paths
grc-analyst / security-leadership). Process/deliverable case-file projects: each phase
produces a real artifact (a policy, a risk register, an IR plan, an after-action report).
Same proven case-file generator used for the orphan rebuild; Shield emblem, new unified tier
labels, neutral word-free blueprint background. Prints registry-entry stubs for ProjectsData.
"""
import re, urllib.parse

TMPL = '_app/projects/starter-first-app.html'
ROOT = '_app/projects/'
css = re.search(r'<style>(.*?)</style>', open(TMPL).read(), re.S).group(1)

# Neutral, word-free blueprint background (governance/grid motif, no domain text to mis-teach).
BG = ("<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='800' fill='none' stroke='#5b6b7a'>"
"<g opacity='0.05'>"+"".join(f"<line x1='{x}' y1='0' x2='{x}' y2='800' stroke-width='0.5'/>" for x in range(0,1001,40))
+"".join(f"<line x1='0' y1='{y}' x2='1000' y2='{y}' stroke-width='0.5'/>" for y in range(0,801,40))+"</g>"
"<g opacity='0.10'>"
"<rect x='150' y='160' width='180' height='120' rx='4' stroke-width='1.2'/>"
"<rect x='430' y='250' width='180' height='120' rx='4' stroke-width='1.2'/>"
"<rect x='710' y='150' width='160' height='120' rx='4' stroke-width='1.2'/>"
"<line x1='330' y1='220' x2='430' y2='300' stroke-width='1'/><line x1='610' y1='300' x2='710' y2='210' stroke-width='1'/>"
"<circle cx='240' cy='220' r='5' fill='#5b6b7a' stroke='none'/><circle cx='520' cy='310' r='5' fill='#5b6b7a' stroke='none'/>"
"<rect x='300' y='500' width='420' height='150' rx='4' stroke-width='1.2'/><line x1='300' y1='540' x2='720' y2='540' stroke-width='0.8'/>"
"</g></svg>")
css = re.sub(r'background-image: url\("data:image/svg\+xml,.*?"\);',
             f'background-image: url("data:image/svg+xml,{urllib.parse.quote(BG)}");', css, count=1, flags=re.S)
# Recolor the green Code-house template accents to Shield-house red for visual consistency.
for a, b in [('#4ade80', '#f87171'), ('rgba(74, 222, 128,', 'rgba(248, 113, 113,'),
             ('rgba(74,222,128,', 'rgba(248,113,113,'), ('#22c55e', '#ef4444'),
             ('rgba(34, 197, 94,', 'rgba(239, 68, 68,'), ('#0d1a12', '#1a0d0d'), ('#0a1410', '#140a0a')]:
    css = css.replace(a, b)
css = css.replace('/* Blueprint sketches layer — Python/quiz app theme */',
                  '/* Blueprint sketches layer: governance / grid theme */')
css += """
        .cf-level-meta { display:flex; gap:14px; margin:3px 0 10px; flex-wrap:wrap; font-size:0.68rem; letter-spacing:0.06em; text-transform:uppercase; }
        .cf-level-meta span { color: rgba(255,255,255,0.38); } .cf-level-meta b { color:#fb7185; font-weight:700; }
        .cf-skills { margin-top:10px; font-size:0.82rem; color:rgba(255,255,255,0.5); line-height:1.6; } .cf-skills b { color: rgba(255,255,255,0.7); }
        .cf-wincond { margin-top:12px; padding:10px 12px; background:rgba(248,113,113,0.06); border-left:3px solid #f87171; border-radius:4px; font-size:0.84rem; color:rgba(255,255,255,0.62); line-height:1.6; }
        .cf-wincond b { color:#fb7185; text-transform:uppercase; letter-spacing:0.1em; font-size:0.68rem; display:block; margin-bottom:4px; }
"""

# One Operation Phase card with a "Deliverable check" checkpoint.
def phase_card(n, p):
    items = "".join(f"<li>{it}</li>" for it in p['check'])
    return f'''                <div class="cf-evidence-card" id="phase-{n}">
                    <div class="phase-check" onclick="togglePhase({n})" id="check-{n}">&#10003;</div>
                    <div class="cf-evidence-marker">{n}</div>
                    <div class="cf-evidence-body">
                        <div class="cf-evidence-title">{p['title']}</div>
                        <div class="cf-evidence-desc">{p['desc']}</div>
                        <div class="phase-checkpoint">
                            <div class="phase-checkpoint-label">Checkpoint &mdash; the deliverable</div>
                            <div class="phase-checkpoint-text"><ul style="margin:0;padding-left:18px;">{items}</ul></div>
                        </div>
                    </div>
                </div>'''

# Assemble + write one project page from its spec.
def build(pid, s):
    n = len(s['phases'])
    # Render each section's HTML from the spec: phase cards, mission paragraphs, requirements,
    # asset manifest, outcomes, and related-training cards.
    cards = "\n\n".join(phase_card(i+1, s['phases'][i]) for i in range(n))
    mission = "".join(f"<p>{p}</p>" for p in s['mission'])
    reqs = "".join(f"<li>{r}</li>" for r in s['requirements'])
    assets = "".join(f'<div class="cf-manifest-item">{a}</div>' for a in s['assets'])
    outcomes = "".join(f"<li>{o}</li>" for o in s['outcomes'])
    related = "".join(
        f'''                <a href="{href}" class="cf-training-card"><span class="tc-district">Shield House</span><span class="tc-title">{title}</span><span class="tc-type">{typ}</span></a>'''
        for (title, href, typ) in s['related'])
    # Assemble the full case-file body (cover + sections + phases + progress IIFE).
    body = f'''<body>
    <div class="cf-drafting-table"></div>
    <div class="cf-header"><a href="index.html">&larr; PROJECTS</a><span class="cf-header-title">Case File</span><span class="cf-header-ref">{s['ref']}</span></div>
    <div class="cf-content">
        <div class="cf-cover">
            <div class="cf-stamp">Classified</div>
            <div class="cf-meta-row">
                <span class="cf-meta-item">Case No: <span class="cf-meta-value">{s['ref']}</span></span>
                <span class="cf-meta-item">Filed: <span class="cf-meta-value">2026-06-13</span></span>
                <span class="cf-meta-item">Status: <span class="cf-meta-value">Open</span></span>
            </div>
            <div class="cf-redaction-bar"></div>
            <div class="cf-house-row">
                <div class="cf-house-seal"><img src="/assets/images/emblems/shield.webp" alt=""></div>
                <div class="cf-house-info"><span class="cf-house-name">Shield House</span><span class="cf-house-domain">{s['domain']}</span></div>
            </div>
            <div class="cf-subject-label">Subject</div>
            <h1 class="cf-subject">{s['title']}</h1>
            <div class="cf-badges">
                <span class="cf-badge cf-badge-diff">{s['diff']}</span>
                <span class="cf-badge cf-badge-time">{s['time']}</span>
                <span class="cf-badge cf-badge-xp">{s['xp']}</span>
            </div>
        </div>
        <div class="cf-paper has-clip"><div class="cf-section-stamp">Mission Brief</div><div class="cf-prose">{mission}</div></div>
        <div class="cf-paper has-tape"><div class="cf-section-stamp">Agent Requirements</div><ul class="cf-req-list">{reqs}</ul></div>
        <div class="cf-paper">
            <div class="cf-section-stamp">Operation Phases &mdash; Each Produces a Deliverable</div>
            <div class="phase-progress"><span class="phase-progress-label">Deliverables</span><div class="phase-progress-bar"><div class="phase-progress-fill" id="phaseProgressFill"></div></div><span class="phase-progress-count" id="phaseProgressCount">0 / {n}</span></div>
            <div class="cf-evidence-board">

{cards}

            </div>
        </div>
        <div class="cf-paper has-clip"><div class="cf-section-stamp">Asset Manifest</div><div class="cf-manifest">{assets}</div></div>
        <div class="cf-paper has-tape"><div class="cf-section-stamp">Expected Outcomes</div><ul class="cf-debrief-list">{outcomes}</ul></div>
        <div class="cf-paper has-clip"><div class="cf-section-stamp">Related Training</div><div class="cf-training-grid">
                <a href="../houses/shield/index.html" class="cf-training-card"><span class="tc-district">Shield House</span><span class="tc-title">Defensive Security</span><span class="tc-type">House</span></a>
{related}
        </div></div>
        <div class="cf-footer"><div class="cf-footer-text">End of File &mdash; Hexworth Prime</div></div>
    </div>
<script>
(function() {{
    var PROJECT_KEY = 'hex_project_{pid}'; var TOTAL_PHASES = {n};
    function getState() {{ try {{ return JSON.parse(localStorage.getItem(PROJECT_KEY)) || {{}}; }} catch(e) {{ return {{}}; }} }}
    function saveState(st) {{ localStorage.setItem(PROJECT_KEY, JSON.stringify(st)); }}
    window.togglePhase = function(id) {{ var st = getState(); st[id] = !st[id]; saveState(st); render(); }};
    function render() {{
        var st = getState(), done = 0;
        for (var i = 1; i <= TOTAL_PHASES; i++) {{ var c = document.getElementById('phase-'+i), k = document.getElementById('check-'+i);
            if (!c||!k) continue; if (st[i]) {{ c.classList.add('phase-done'); k.classList.add('checked'); done++; }} else {{ c.classList.remove('phase-done'); k.classList.remove('checked'); }} }}
        var f = document.getElementById('phaseProgressFill'), nn = document.getElementById('phaseProgressCount');
        if (f) f.style.width = Math.round((done/TOTAL_PHASES)*100)+'%'; if (nn) nn.textContent = done+' / '+TOTAL_PHASES;
    }}
    render();
}})();
</script>
</body>
</html>'''
    # Wrap with the document shell (head + shared case-file <style>) and write the page.
    out = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CASE FILE: {s['title']} | Hexworth Prime</title>
    <style>{css}</style>
</head>
{body}'''
    open(ROOT + pid + '.html', 'w').write(out)
    return len(out)


GRC = [('Run Your First Risk Assessment', 'shield-first-risk-assessment.html', 'Project'),
       ('Map Controls to a Compliance Framework', 'shield-control-framework-mapping.html', 'Project')]
LDR = [('Write an Incident Response Plan', 'shield-incident-response-plan.html', 'Project'),
       ('Lead a Tabletop Exercise', 'shield-tabletop-exercise.html', 'Project')]

PROJECTS = {
 'shield-first-security-policy': dict(title='Write Your First Security Policy', ref='SH-GRC-001', domain='Governance, Risk & Compliance', diff='Recruit', time='45 min', xp='250 XP',
   mission=[
     "Every security program rests on policy &mdash; the written rules that say what is allowed, who is responsible, and what happens when the rules are broken. You will draft two foundational policies from scratch, an <strong>Acceptable Use Policy</strong> and a <strong>Password Policy</strong>, and learn the anatomy every real policy shares.",
     "Policy is the document a GRC analyst lives in and the artifact an auditor asks for first. Write it clearly enough that a new hire understands it and specifically enough that you can tell when it has been violated.",
     "By the end you will have two real, enforceable policies and understand the structure, roles, and review cycle behind every governance document you will ever write."],
   requirements=["A word processor or plain text editor", "Willingness to write clearly and specifically", "A real or fictional organization to scope the policies to", "No prior security background required"],
   phases=[
     dict(title="Learn the Anatomy of a Policy", desc="Study how a real policy is structured: purpose, scope, definitions, policy statements, roles &amp; responsibilities, enforcement, and review cadence. Pull a free reference (the SANS policy templates are well-structured) and pick a base to adapt.",
          check=["You can name the standard policy sections and point to each one in a sample policy", "You have chosen a base template to adapt"]),
     dict(title="Draft an Acceptable Use Policy", desc="Write the AUP: what users may and may not do with company systems (email, web, devices, data, BYOD). State monitoring and consent, and the consequences of violations. Make every rule specific enough to judge objectively.",
          check=["Your AUP covers acceptable use, prohibited use, BYOD, monitoring/consent, and consequences", "Pick any rule and confirm you could objectively decide whether it was violated"]),
     dict(title="Draft a Password Policy", desc="Write a password policy aligned with current guidance (NIST SP 800-63B): favor length over complexity, screen against breached-password lists, require MFA, and do not force periodic rotation without cause. State scope and enforcement.",
          check=["The policy reflects NIST 800-63B (minimum length, breached-password screening, MFA, no mandatory periodic rotation)", "It names who it applies to and how it is enforced"]),
     dict(title="Add Scope, Roles &amp; Enforcement", desc="Add a roles section (who owns the policy, who approves it, who enforces it), an enforcement/violation section, and a review cadence (for example, annual review).",
          check=["Each policy names an owner, an approver, an enforcement mechanism, and a review date", "None of those four are left implicit"]),
     dict(title="Review, Socialize &amp; Get Sign-off", desc="Have a non-expert read the AUP and revise anything unclear. Write a short rollout note describing how the policy is communicated and acknowledged (the sign-off step).",
          check=["A non-expert reads your AUP and can state three things they are not allowed to do", "You have defined an acknowledgement / sign-off mechanism"])],
   assets=["SANS policy templates", "NIST SP 800-63B", "Word processor", "Your org context"],
   outcomes=["Policy anatomy &amp; structure", "An Acceptable Use Policy", "A NIST-aligned password policy", "Roles &amp; enforcement", "Review cadence", "Governance fundamentals"],
   related=GRC),

 'shield-first-risk-assessment': dict(title='Run Your First Risk Assessment', ref='SH-GRC-002', domain='Governance, Risk & Compliance', diff='Operative', time='1.5 hr', xp='500 XP',
   mission=[
     "Risk assessment is the engine of GRC &mdash; you cannot protect what you have not valued, or defend against threats you have not named. You will run a complete qualitative risk assessment on a bounded scope: inventory assets, identify threats and vulnerabilities, score likelihood &times; impact, build a risk register, and propose treatments.",
     "The risk register you produce is the document that drives every security investment decision &mdash; it is how a security program decides where to spend its next dollar.",
     "By the end you will have run a real assessment end to end and be able to defend why one risk gets mitigated and another gets accepted."],
   requirements=["\"Write Your First Security Policy\" recommended first", "A spreadsheet", "A bounded environment to assess (a small business or your own home network, real or fictional)", "NIST SP 800-30 as reference"],
   phases=[
     dict(title="Define Scope &amp; Inventory Assets", desc="Pick a bounded scope. List the assets within it (data, systems, people, facilities) and rate each one's criticality (High/Medium/Low) with a one-line justification.",
          check=["An asset inventory of at least 8 assets, each with a criticality rating and a one-line reason", "The scope boundary is explicit"]),
     dict(title="Identify Threats &amp; Vulnerabilities", desc="For each critical asset, identify realistic threats (a threat exploits a vulnerability). Ground them in a source &mdash; the NIST SP 800-30 threat taxonomy or the CIS/OWASP lists &mdash; rather than inventing generic ones.",
          check=["At least two threat/vulnerability pairs per critical asset", "Each is grounded in a real category, not \"hackers might attack it\""]),
     dict(title="Score Likelihood &times; Impact", desc="Build a scoring matrix (5&times;5 or 3&times;3). Score each risk's likelihood and impact and compute its risk level. State the rationale for each score.",
          check=["Every risk is scored on both likelihood and impact with a stated rationale", "Risks are ranked by resulting level"]),
     dict(title="Build the Risk Register", desc="Assemble a risk register in your spreadsheet: risk ID, description, affected asset, score, owner, and proposed treatment. Identify your top risks.",
          check=["A risk register with all columns populated", "The top 3 risks are clearly identifiable from it"]),
     dict(title="Propose Treatments", desc="For each top risk choose a treatment &mdash; accept, mitigate, transfer, or avoid &mdash; with a concrete action and a note on the residual risk that remains after treatment.",
          check=["Each top risk has a treatment decision, a concrete action, and a residual-risk note", "You can defend why you chose accept vs mitigate vs transfer vs avoid"])],
   assets=["NIST SP 800-30", "A spreadsheet", "CIS / OWASP threat lists", "Your scoped environment"],
   outcomes=["Asset inventory &amp; valuation", "Threat/vulnerability identification", "Likelihood&times;impact scoring", "A risk register", "Risk treatment decisions", "Residual risk"],
   related=[('Write Your First Security Policy', 'shield-first-security-policy.html', 'Project'), ('Map Controls to a Compliance Framework', 'shield-control-framework-mapping.html', 'Project')]),

 'shield-control-framework-mapping': dict(title='Map Controls to a Compliance Framework', ref='SH-GRC-003', domain='Governance, Risk & Compliance', diff='Operator', time='2 hr', xp='1,000 XP',
   mission=[
     "Compliance is proving that your controls meet a recognized framework's requirements. You will map a system's existing controls to a framework (the NIST Cybersecurity Framework or ISO 27001 Annex A), find the gaps, and write a findings report &mdash; the deliverable that drives a remediation roadmap and, eventually, an audit.",
     "This is the work that turns \"we are probably secure\" into evidence a manager, auditor, or regulator can act on.",
     "By the end you will have a control-to-requirement mapping, a gap analysis, and a prioritized findings report."],
   requirements=["\"Run Your First Risk Assessment\" recommended first", "A system to assess (real or fictional)", "The NIST CSF or ISO 27001 Annex A (both free to read)", "A spreadsheet and a document"],
   phases=[
     dict(title="Choose a Framework &amp; Scope", desc="Pick a framework &mdash; NIST CSF (Identify, Protect, Detect, Respond, Recover) or ISO 27001 Annex A &mdash; and define the system in scope. Note why this framework fits.",
          check=["A framework chosen with a one-line rationale", "A documented scope boundary for the system being assessed"]),
     dict(title="Inventory Existing Controls", desc="Document the controls actually in place: technical (firewall, MFA, backups), administrative (policies, training), and physical. Note where each is implemented and the evidence for it.",
          check=["At least 10 existing controls documented", "Each has where it is implemented and what evidence proves it"]),
     dict(title="Map Controls to Requirements", desc="Build a mapping table linking each control to the framework subcategory / Annex item it satisfies. Work through every in-scope framework category.",
          check=["Every in-scope framework category has mapped control(s) or is explicitly flagged as a gap", "The mapping is traceable (control &harr; requirement)"]),
     dict(title="Run the Gap Analysis", desc="Identify the requirements with no adequate control. Rate each gap's severity and its potential impact.",
          check=["A list of gaps, each with a severity rating and impact note", "No framework category is left unassessed"]),
     dict(title="Write the Findings Report", desc="Produce a report: executive summary, methodology, findings (each with severity and evidence), and a prioritized remediation roadmap.",
          check=["A report with an executive summary, a findings table, and a prioritized roadmap", "Concrete enough that a manager could fund and sequence the fixes from it"])],
   assets=["NIST CSF", "ISO 27001 Annex A", "A spreadsheet", "A document"],
   outcomes=["Framework selection", "Control inventory", "Control-to-requirement mapping", "Gap analysis &amp; severity", "A findings report", "Remediation roadmap"],
   related=[('Run Your First Risk Assessment', 'shield-first-risk-assessment.html', 'Project'), ('Write Your First Security Policy', 'shield-first-security-policy.html', 'Project')]),

 'shield-awareness-program': dict(title='Build a Security Awareness Program', ref='SH-LDR-001', domain='Security Leadership', diff='Operative', time='1.5 hr', xp='500 XP',
   mission=[
     "People are the largest attack surface in any organization &mdash; and the security leader's job is to build the human firewall. You will design a security awareness program: who it targets, what it teaches, a simulated-phishing plan, the metrics that prove it works, and a rollout calendar.",
     "This is how a leader changes behavior at scale and shows the business a return on the security spend &mdash; the difference between a poster on a wall and a measurable drop in risk.",
     "By the end you will have a complete, defensible awareness program you could pitch to leadership tomorrow."],
   requirements=["No technical prerequisites", "An organization (real or fictional) to design for", "Familiarity with phishing as a concept", "A document and a spreadsheet"],
   phases=[
     dict(title="Segment the Audience &amp; Baseline Risk", desc="Break the audience into segments (executives, finance, general staff, IT) and identify each segment's top human risks &mdash; for example execs face whaling, finance faces business-email-compromise and invoice fraud.",
          check=["At least 3 audience segments", "Each has its top 2 human risks named specifically, not just \"phishing\" for everyone"]),
     dict(title="Plan the Training Content", desc="Map topics to segments &mdash; phishing, passwords/MFA, data handling, physical security, and how to report &mdash; in a topic-by-segment matrix.",
          check=["A topic-by-segment matrix", "Every segment has at least a phishing module and a \"how to report\" module"]),
     dict(title="Design a Simulated Phishing Plan", desc="Plan a phishing simulation: cadence, a difficulty ramp over time, and what happens when someone clicks &mdash; just-in-time teaching that is explicitly non-punitive.",
          check=["A simulation plan with a cadence and an escalating difficulty", "The clicked-the-link response is teaching-first and explicitly not punitive"]),
     dict(title="Define Metrics &amp; Reporting", desc="Choose the metrics &mdash; click rate, report rate, time-to-report, repeat clickers &mdash; set targets, and sketch a one-page leadership dashboard. Treat report rate as the key positive signal, not click rate alone.",
          check=["At least 4 metrics defined with targets", "Report rate is explicitly treated as a primary success metric (not click rate alone)"]),
     dict(title="Build the Rollout Calendar &amp; Pitch", desc="Lay out a 12-month calendar with monthly themes and write a one-paragraph pitch to leadership for budget and buy-in, framed in business-risk terms.",
          check=["A 12-month calendar with monthly themes", "A leadership pitch that ties the program to measurable risk reduction in business language"])],
   assets=["A document / spreadsheet", "NIST &amp; SANS awareness guidance", "Phishing-simulation concepts", "Your org context"],
   outcomes=["Audience segmentation", "Training content planning", "Simulated phishing design", "Awareness metrics", "A non-punitive culture", "Leadership buy-in"],
   related=LDR),

 'shield-incident-response-plan': dict(title='Write an Incident Response Plan', ref='SH-LDR-002', domain='Security Leadership', diff='Operator', time='2 hr', xp='1,000 XP',
   mission=[
     "When &mdash; not if &mdash; an incident hits, the difference between control and chaos is a plan written in advance. You will author an incident response plan following NIST SP 800-61: the response team and authority, a severity classification scheme, the full IR lifecycle, a communication plan, and one concrete runbook.",
     "A plan written during a breach is written too late. This is the document that lets a tired on-call act decisively at 3 a.m. instead of guessing.",
     "By the end you will have a real IR plan and at least one runbook ready to exercise."],
   requirements=["Basic understanding of common incidents (ransomware, phishing/BEC, data breach)", "NIST SP 800-61 as reference", "A document", "\"Build a Security Awareness Program\" pairs well with this"],
   phases=[
     dict(title="Define the Team &amp; Authority", desc="Define the IR team and roles (incident commander, technical lead, communications, legal/exec liaison), the on-call rotation, and who has authority to declare an incident and to authorize containment (such as isolating systems).",
          check=["An IR roles section", "An explicit statement of who declares an incident and who authorizes containment actions"]),
     dict(title="Build the Severity Classification", desc="Define severity levels (e.g. SEV1-SEV3) with the criteria for each, response-time targets, and escalation triggers.",
          check=["A severity table", "Specific enough that two different team members would classify the same scenario the same way"]),
     dict(title="Document the IR Lifecycle", desc="Document each NIST phase &mdash; Preparation, Detection &amp; Analysis, Containment, Eradication, Recovery, Post-Incident &mdash; with concrete actions and an entry/exit (\"done when\") criterion for each.",
          check=["All six phases documented", "Each has concrete actions and a \"done when\" criterion, not just a phase name"]),
     dict(title="Write the Communication Plan", desc="Define internal and external communications (customers, regulators, law enforcement), when each is triggered, a holding-statement template, and a rule to preserve evidence (chain of custody / do-not-wipe).",
          check=["A communications matrix (who / what / when) and a holding-statement template", "An explicit evidence-preservation rule"]),
     dict(title="Write One Runbook", desc="Pick a scenario (ransomware or business email compromise) and write a step-by-step runbook tied to the plan &mdash; numbered steps, decision points, and who to call.",
          check=["A runbook a tired on-call could follow at 3 a.m. (numbered, with decision points and contacts)", "It references the plan's roles and severity scheme"])],
   assets=["NIST SP 800-61", "A document", "Your IR team context"],
   outcomes=["IR team &amp; authority", "Severity classification", "The NIST IR lifecycle", "A communication plan", "Evidence preservation", "An actionable runbook"],
   related=[('Lead a Tabletop Exercise', 'shield-tabletop-exercise.html', 'Project'), ('Build a Security Awareness Program', 'shield-awareness-program.html', 'Project')]),

 'shield-tabletop-exercise': dict(title='Lead a Tabletop Exercise', ref='SH-LDR-003', domain='Security Leadership', diff='Specialist', time='2 hr', xp='2,000 XP',
   mission=[
     "A plan you have never exercised is a hope, not a capability. You will design and facilitate a <strong>tabletop exercise</strong> &mdash; a discussion-based incident simulation &mdash; and produce an <strong>after-action report</strong> that turns lessons into owned, dated improvements.",
     "This is how a security leader proves readiness, finds the gaps before an attacker does, and earns the trust to lead in a real crisis.",
     "By the end you will have run an exercise, captured what broke, and closed the loop by feeding fixes back into the plan."],
   requirements=["\"Write an Incident Response Plan\" strongly recommended (you will exercise a plan)", "A small group is ideal, but you can run it solo as a thought exercise", "A document for notes and the after-action report", "CISA tabletop exercise packages as reference"],
   phases=[
     dict(title="Design the Scenario &amp; Injects", desc="Choose a realistic scenario (e.g. ransomware via a phished credential). Write the scenario and a timeline of injects &mdash; escalating events revealed over time that force decisions. Define what you are testing.",
          check=["A scenario with at least 4 injects that escalate and force real decisions", "Clear objectives stating what capability you are testing"]),
     dict(title="Set Players, Objectives &amp; Ground Rules", desc="Decide who is at the table (IT, leadership, comms, legal), set success criteria, and establish no-fault ground rules that make it safe to surface failures.",
          check=["A participant roster mapped to roles, plus defined objectives", "Ground rules that make it safe for people to admit \"we don't have that\" or \"we don't know\""]),
     dict(title="Facilitate the Exercise", desc="Run it &mdash; present each inject, capture the decisions made and the questions raised, and note where the plan, roles, or tooling broke down. Facilitate; do not solve it for them.",
          check=["Notes capturing each inject and the decisions taken", "At least 3 friction points where the team hesitated, disagreed, or lacked the info/authority to act"]),
     dict(title="Turn Friction into Findings", desc="Convert each friction point into a finding: what failed, the root cause (not just the symptom), and the impact if it happened for real.",
          check=["A findings list where each item has a root cause tied to a specific plan/role/tool gap", "Findings name causes, not restated symptoms"]),
     dict(title="Write the After-Action Report", desc="Write the AAR: summary, what worked, the findings, and prioritized improvement actions &mdash; each with an owner and a due date. At least one improvement must feed back into the IR plan.",
          check=["An AAR with prioritized actions, each having an owner and a due date", "At least one action updates the IR plan itself, closing the loop"])],
   assets=["A document", "Your IR plan", "CISA tabletop exercise packages"],
   outcomes=["Scenario &amp; inject design", "Facilitation", "Capturing friction", "Root-cause findings", "An after-action report", "The improve loop"],
   related=[('Write an Incident Response Plan', 'shield-incident-response-plan.html', 'Project'), ('Build a Security Awareness Program', 'shield-awareness-program.html', 'Project')]),
}

# Build all 6 project pages from their specs.
for pid, spec in PROJECTS.items():
    sz = build(pid, spec)
    print(f"built {pid}: {sz}b, {len(spec['phases'])} phases")
