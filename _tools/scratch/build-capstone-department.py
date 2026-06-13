"""
Build _app/projects/ai-build-your-department.html — the AI House CAPSTONE,
"Build Your First Department." Unlike the four "My First" starter rungs (each a
single-skill beginner ladder), this is the integration finale: it composes the
Agent (brain), Workflow (automation), Knowledge Base (grounding), and Tool (hands)
the learner already built into ONE self-running Help-Desk Department, teaching
multi-agent orchestration. Tagged ADVANCED tier (1000 XP) using the existing
difficulty system — no new "capstone" project type is introduced. Five levels are an
integration ladder (assemble -> route/orchestrate -> hand-offs -> supervise -> operate),
with escalating per-level difficulty (Intermediate -> Pro). Clones the series build:
case-file format, AI-House purple theme, multi-agent-department blueprint background,
checkpoints + guardrails baked in.
"""
import re, urllib.parse

TMPL = '_app/projects/starter-first-app.html'
OUT = '_app/projects/ai-build-your-department.html'

src = open(TMPL).read()
css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)

# Background: a multi-agent department blueprint (request -> router -> 4 specialists,
# supervisor + human-approval gate above, dashboard/metrics below, escalation arrow).
dept_svg = (
"<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='800' fill='none' stroke='#8b5cf6'>"
# incoming request
"<text x='24' y='250' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>REQUEST</text>"
"<line x1='24' y1='258' x2='150' y2='258' stroke-width='1.5' opacity='0.16'/><polygon points='156,258 146,252 146,264' fill='#8b5cf6' stroke='none' opacity='0.18'/>"
# center: router / coordinator
"<rect x='160' y='228' width='120' height='60' rx='4' stroke-width='2' opacity='0.2'/>"
"<text x='178' y='252' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.22'>ROUTER</text>"
"<text x='172' y='270' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.15'>triage + delegate</text>"
# four specialists fanned to the right of the router
"<rect x='360' y='110' width='120' height='44' rx='4' stroke-width='1.5' opacity='0.18'/><text x='378' y='130' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.2'>AGENT</text><text x='372' y='145' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.14'>brain / converse</text>"
"<rect x='360' y='190' width='120' height='44' rx='4' stroke-width='1.5' opacity='0.16'/><text x='378' y='210' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.18'>KB</text><text x='372' y='225' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.13'>grounded answers</text>"
"<rect x='360' y='270' width='120' height='44' rx='4' stroke-width='1.5' opacity='0.14'/><text x='378' y='290' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.16'>TOOL</text><text x='372' y='305' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.12'>take action</text>"
"<rect x='360' y='350' width='120' height='44' rx='4' stroke-width='1.5' opacity='0.13'/><text x='378' y='370' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.15'>WORKFLOW</text><text x='372' y='385' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.11'>multi-step auto</text>"
# router -> specialists wiring
"<line x1='280' y1='245' x2='358' y2='132' stroke-width='1.2' opacity='0.14'/>"
"<line x1='280' y1='252' x2='358' y2='212' stroke-width='1.2' opacity='0.13'/>"
"<line x1='280' y1='262' x2='358' y2='292' stroke-width='1.2' opacity='0.12'/>"
"<line x1='280' y1='272' x2='358' y2='372' stroke-width='1.2' opacity='0.11'/>"
# hand-off arrow between two specialists (context passing)
"<path d='M420 154 q40 18 0 36' stroke-width='1.2' opacity='0.12'/><polygon points='420,190 414,182 426,184' fill='#8b5cf6' stroke='none' opacity='0.12'/>"
"<text x='430' y='178' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.12'>hand-off + context</text>"
# supervisor layer (top) with human-approval gate + escalation
"<rect x='600' y='60' width='180' height='70' rx='4' stroke-width='2' opacity='0.18'/>"
"<text x='616' y='82' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.2'>SUPERVISOR</text>"
"<line x1='600' y1='90' x2='780' y2='90' stroke-width='1' opacity='0.12'/>"
"<circle cx='628' cy='110' r='7' stroke-width='1.5' opacity='0.16'/><line x1='628' y1='117' x2='628' y2='124' stroke-width='1.5' opacity='0.12'/>"
"<text x='642' y='114' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>human approval gate</text>"
# escalation arrow specialist -> supervisor
"<line x1='480' y1='130' x2='598' y2='100' stroke-width='1.3' opacity='0.14' stroke-dasharray='5 5'/><polygon points='598,100 586,98 590,109' fill='#8b5cf6' stroke='none' opacity='0.14'/>"
"<text x='500' y='108' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.12'>escalate</text>"
# runaway limit marker
"<text x='600' y='150' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>max steps / no loops</text>"
# dashboard / log strip (bottom) with metrics
"<rect x='160' y='440' width='620' height='110' rx='4' stroke-width='1.5' opacity='0.16'/>"
"<text x='176' y='462' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.2'>DEPARTMENT DASHBOARD</text>"
"<line x1='176' y1='470' x2='764' y2='470' stroke-width='1' opacity='0.1'/>"
"<text x='176' y='488' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>case #4812  router-&gt;KB        resolved</text>"
"<text x='176' y='504' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>case #4813  router-&gt;tool      resolved</text>"
"<text x='176' y='520' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.1'>case #4814  router-&gt;flow-&gt;sup  escalated</text>"
# resolution-rate gauge
"<text x='620' y='492' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.16'>RESOLUTION</text>"
"<rect x='620' y='500' width='130' height='12' rx='3' stroke-width='1' opacity='0.14'/>"
"<rect x='620' y='500' width='98' height='12' rx='3' fill='#8b5cf6' stroke='none' opacity='0.16'/>"
"<text x='620' y='532' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>improve loop -&gt; fix KB / tool / routing</text>"
# integration ladder (center-right, mirrors siblings)
"<rect x='810' y='200' width='170' height='180' rx='3' stroke-width='2' opacity='0.18'/>"
"<line x1='810' y1='220' x2='980' y2='220' stroke-width='1.5' opacity='0.16'/>"
"<text x='824' y='214' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.2'>INTEGRATION LADDER</text>"
"<text x='824' y='250' font-family='monospace' font-size='9.5' fill='#8b5cf6' stroke='none' opacity='0.18'>1 ASSEMBLE</text>"
"<text x='824' y='272' font-family='monospace' font-size='9.5' fill='#8b5cf6' stroke='none' opacity='0.16'>2 ROUTE</text>"
"<text x='824' y='294' font-family='monospace' font-size='9.5' fill='#8b5cf6' stroke='none' opacity='0.14'>3 HAND-OFFS</text>"
"<text x='824' y='316' font-family='monospace' font-size='9.5' fill='#8b5cf6' stroke='none' opacity='0.12'>4 SUPERVISE</text>"
"<text x='824' y='338' font-family='monospace' font-size='9.5' fill='#8b5cf6' stroke='none' opacity='0.1'>5 OPERATE</text>"
# decorative wiring
"<line x1='0' y1='600' x2='420' y2='420' stroke-width='1.2' opacity='0.06' stroke-dasharray='10 14'/>"
"<line x1='720' y1='0' x2='1000' y2='200' stroke-width='1.2' opacity='0.05' stroke-dasharray='8 12'/>"
"<text x='540' y='600' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.09'>a team, not one model</text>"
"</svg>"
)
dept_uri = "data:image/svg+xml," + urllib.parse.quote(dept_svg)
css = re.sub(r'background-image: url\("data:image/svg\+xml,.*?"\);',
             f'background-image: url("{dept_uri}");', css, count=1, flags=re.S)

for a, b in [('#4ade80', '#8b5cf6'), ('rgba(74, 222, 128,', 'rgba(139, 92, 246,'),
             ('rgba(74,222,128,', 'rgba(139,92,246,'), ('#22c55e', '#a78bfa'),
             ('rgba(34, 197, 94,', 'rgba(139, 92, 246,'), ('#0d1a12', '#170d22'), ('#0a1410', '#120a1a')]:
    css = css.replace(a, b)
css = css.replace('/* Blueprint sketches layer — Python/quiz app theme */',
                  '/* Blueprint sketches layer: multi-agent department / orchestration theme */')
css += """
        .cf-level-meta { display:flex; gap:14px; margin:3px 0 10px; flex-wrap:wrap; font-size:0.68rem; letter-spacing:0.06em; text-transform:uppercase; }
        .cf-level-meta span { color: rgba(255,255,255,0.38); }
        .cf-level-meta b { color:#a78bfa; font-weight:700; }
        .cf-skills { margin-top:10px; font-size:0.82rem; color:rgba(255,255,255,0.5); line-height:1.6; }
        .cf-skills b { color: rgba(255,255,255,0.7); }
        .cf-rules { margin-top:10px; font-size:0.82rem; color:rgba(255,255,255,0.55); line-height:1.6; padding:8px 12px; background:rgba(244,63,94,0.05); border-left:3px solid rgba(244,63,94,0.5); border-radius:4px; }
        .cf-rules b { color:#fb7185; }
        .cf-wincond { margin-top:12px; padding:10px 12px; background:rgba(139,92,246,0.06); border-left:3px solid #8b5cf6; border-radius:4px; font-size:0.84rem; color:rgba(255,255,255,0.62); line-height:1.6; }
        .cf-wincond b { color:#a78bfa; text-transform:uppercase; letter-spacing:0.1em; font-size:0.68rem; display:block; margin-bottom:4px; }
        .cf-prereq { margin-top:10px; padding:10px 12px; background:rgba(139,92,246,0.05); border:1px dashed rgba(139,92,246,0.4); border-radius:4px; font-size:0.82rem; color:rgba(255,255,255,0.58); line-height:1.6; }
        .cf-prereq b { color:#a78bfa; }
"""

# One level card; checkpoint required, rules optional (mirrors the series builders).
def level(n, title, diff, time, xp, mission, skills, winc, checkpoint, rules=None):
    rules_html = f'<div class="cf-rules"><b>Guardrails.</b> {rules}</div>' if rules else ''
    return f'''                <div class="cf-evidence-card" id="phase-{n}">
                    <div class="phase-check" onclick="togglePhase({n})" id="check-{n}">&#10003;</div>
                    <div class="cf-evidence-marker">{n}</div>
                    <div class="cf-evidence-body">
                        <div class="cf-evidence-title">Level {n}: {title}</div>
                        <div class="cf-level-meta"><span><b>{diff}</b></span><span>{time}</span><span><b>+{xp} XP</b></span></div>
                        <div class="cf-evidence-desc">{mission}</div>
                        <div class="cf-skills"><b>Skills:</b> {skills}</div>
                        {rules_html}
                        <div class="cf-wincond"><b>Win condition</b>{winc}</div>
                        <div class="phase-checkpoint">
                            <div class="phase-checkpoint-label">Checkpoint &mdash; how to verify</div>
                            <div class="phase-checkpoint-text">{checkpoint}</div>
                        </div>
                    </div>
                </div>'''

# Five levels: the integration ladder that assembles the four rungs into one department.
levels = [
 level(1, "Assemble the Team", "Intermediate", "~45 min", 300,
   "A department isn't one agent, it's several specialists working together. Bring the pieces you already built into one solution: the help-desk <strong>Agent</strong> (the brain that talks to users), the <strong>Knowledge Base</strong> (what it knows), the <strong>Tool</strong> (how it acts, create-ticket), and the <strong>Workflow</strong> (the automation behind the scenes). Define the department's job and decide which component owns which responsibility.",
   "system composition, separation of responsibilities, multi-component architecture.",
   "All four components are connected in one department, and you can state in one sentence what each one is responsible for.",
   checkpoint="List the four components and write one sentence per component naming its single responsibility (Agent: converse and decide; KB: ground answers; Tool: take actions; Workflow: run multi-step automation). Confirm no two components own the same job and nothing is unowned. If two components do the same thing you have redundancy, collapse it; if a needed job has no owner you have a gap, assign it."),
 level(2, "Route the Work", "Intermediate+", "~1 hr", 400,
   "With specialists in place you need a coordinator. Build a <strong>router</strong> (triage) agent that receives every request and sends it to the right specialist: a simple question goes to the KB-grounded answerer, a request to do something goes to the Tool, a complex multi-step case goes to the Workflow. This is <strong>multi-agent orchestration</strong>, agents handing work to other agents.",
   "orchestration, triage and routing, agent-to-agent delegation.",
   "Three different requests, a question, an action, and a complex case, each get routed to the correct specialist automatically, without you intervening.",
   checkpoint="Send the department three distinct requests: an informational question, an action request (\"create a ticket\"), and a multi-step case. Confirm each is routed to the right specialist (check the trace showing which agent handled it). If a request lands on the wrong specialist, sharpen the router's decision criteria, what signals route where."),
 level(3, "Hand-offs and Shared Context", "Advanced", "~1.5 hr", 500,
   "When one agent hands work to another, the <em>context</em> has to travel with it, or the next agent makes the user repeat themselves and the department feels broken. Define the <strong>hand-off contract</strong>: exactly what information passes between agents so work continues seamlessly from one specialist to the next.",
   "context passing, hand-off contracts, state continuity across agents.",
   "A case that passes through two agents keeps its context, the second agent never asks the user for something the first already collected.",
   checkpoint="Run a case that requires two agents (triage gathers the problem, a resolver acts on it). Confirm the second agent uses the details the first collected and does NOT re-ask the user. If the second agent re-asks, the hand-off is dropping context, add the missing fields to what passes between them and re-run."),
 level(4, "Supervision and Guardrails", "Advanced", "~2 hr", 600,
   "An autonomous department needs a <strong>supervisor</strong>. Add a layer that requires human approval before high-impact actions, escalates to a person when no agent can handle a case, and sets hard limits so the department can't loop or run away. This is what makes a multi-agent system safe to actually run.",
   "supervisor pattern, human-in-the-loop approval, escalation paths, runaway limits.",
   "A high-impact request pauses for approval, an unhandleable case escalates to a human with its full context, and a request that would loop is stopped by a limit instead of running away.",
   checkpoint="Trigger a high-impact action and confirm it waits for human approval before executing. Send a request no specialist can handle and confirm it escalates to a human with the context attached (not dropped, not guessed). Confirm a max-steps / max-handoff limit exists and stops a runaway case. If any of these fails, an action fires without approval, a case vanishes, or it loops, add the missing supervisor control.",
   rules="High-impact actions require human approval before they run. Any case no agent can resolve escalates to a human, it is never silently dropped or guessed at. The department has hard step/hand-off limits so it cannot loop forever."),
 level(5, "Operate and Improve the Department", "Pro", "~2 hr", 700,
   "A real department is <strong>measured and improved</strong>. Add observability across all the agents, logs and a dashboard showing what came in, who handled it, and how it ended. Measure the resolution rate, find where the department fails most, and feed fixes back: re-train the KB, fix a tool, adjust the router. Run it as a live operation that gets better over time.",
   "cross-agent observability, metrics (resolution rate), failure analysis, the improve loop.",
   "A dashboard or log shows each case end-to-end across every agent that touched it, you can state your department's resolution rate, and you have made at least one improvement based on what the data showed.",
   checkpoint="Open the department's logs/dashboard and trace one case from arrival to resolution across every agent that touched it. State the resolution rate (resolved vs escalated) over your test cases. Identify the single biggest failure source and make one fix (a KB gap, a tool error, or a routing rule), then confirm that case type now succeeds. If you can't trace a case end-to-end, your observability has a blind spot, add logging where the trail goes cold.",
   rules="Every request and every agent action is logged, nothing the department does is invisible. A failed or escalated case is recorded honestly, never hidden, so the failure can be found and fixed.")
]
phases_html = '\n\n'.join(levels)

body = f'''<body>

    <div class="cf-drafting-table"></div>

    <div class="cf-header">
        <a href="index.html">&larr; PROJECTS</a>
        <span class="cf-header-title">Case File</span>
        <span class="cf-header-ref">AI-DEPT-001</span>
    </div>

    <div class="cf-content">

        <div class="cf-cover">
            <div class="cf-stamp">Capstone</div>

            <div class="cf-meta-row">
                <span class="cf-meta-item">Case No: <span class="cf-meta-value">AI-DEPT-001</span></span>
                <span class="cf-meta-item">Filed: <span class="cf-meta-value">2026-06-13</span></span>
                <span class="cf-meta-item">Status: <span class="cf-meta-value">Open</span></span>
            </div>
            <div class="cf-redaction-bar"></div>

            <div class="cf-house-row">
                <div class="cf-house-seal">
                    <img src="/assets/images/emblems/ai.webp" alt="">
                </div>
                <div class="cf-house-info">
                    <span class="cf-house-name">AI House</span>
                    <span class="cf-house-domain">Artificial Intelligence</span>
                </div>
            </div>

            <div class="cf-subject-label">Subject &mdash; AI Series Capstone</div>
            <h1 class="cf-subject">Build Your First Department</h1>

            <div class="cf-badges">
                <span class="cf-badge cf-badge-diff">Capstone &middot; L1&ndash;5</span>
                <span class="cf-badge cf-badge-time">45 min &ndash; 2 hr</span>
                <span class="cf-badge cf-badge-xp">300 &ndash; 2500 XP</span>
            </div>
        </div>

        <!-- Mission Brief -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Mission Brief</div>
            <div class="cf-prose">
                <p>
                    This is the capstone of the AI series. You have built the four pieces of the AI stack
                    one at a time, an <strong>Agent</strong> (the brain), a <strong>Workflow</strong> (the
                    automation), a <strong>Knowledge Base</strong> (the grounding), and a <strong>Tool</strong>
                    (the hands). Now you assemble them into something that is more than the sum of its parts:
                    a self-running <strong>Help-Desk Department</strong>.
                </p>
                <p>
                    The lesson here is <strong>multi-agent orchestration</strong>, how a team of focused
                    specialists coordinate. A <em>router</em> triages each request and delegates it to the
                    right specialist; agents <em>hand off</em> work with the context intact; a
                    <em>supervisor</em> approves high-impact actions and catches what no agent can handle;
                    and the whole department is <em>observed and improved</em> over time. This is how real AI
                    systems are built, not one giant model trying to do everything, but a team of narrow
                    agents with a coordinator and a human in the loop.
                </p>
                <p>
                    You will grow it across five levels: assemble the team, route the work, make the hand-offs
                    seamless, add supervision and guardrails, then operate and improve it as a live operation.
                    By the end you will have a working department, and you will understand the architecture
                    behind every serious AI system you will build after this.
                </p>
            </div>
        </div>

        <!-- Prerequisites -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Prerequisites &mdash; Bring Your Four Components</div>
            <div class="cf-prose" style="margin-bottom:12px; color:#94a3b8;">
                This capstone assembles the projects you have already built. Complete these first, you will wire each one into the department.
            </div>
            <ul class="cf-req-list">
                <li><b>My First Agent</b> &mdash; the brain that converses and decides</li>
                <li><b>My First Workflow</b> &mdash; the multi-step automation behind the scenes</li>
                <li><b>My First Knowledge Base</b> &mdash; the grounded answers the department gives</li>
                <li><b>My First Tool</b> &mdash; the create-ticket action the department takes</li>
                <li>A Microsoft account with Copilot Studio + Power Automate (the same environment as the four rungs)</li>
            </ul>
        </div>

        <!-- Operation Phases (the five levels) -->
        <div class="cf-paper">
            <div class="cf-section-stamp">Operation Phases &mdash; The Integration Ladder</div>

            <div class="phase-progress">
                <span class="phase-progress-label">Levels Cleared</span>
                <div class="phase-progress-bar"><div class="phase-progress-fill" id="phaseProgressFill"></div></div>
                <span class="phase-progress-count" id="phaseProgressCount">0 / 5</span>
            </div>

            <div class="cf-evidence-board">

{phases_html}

            </div>
        </div>

        <!-- Asset Manifest -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Asset Manifest</div>
            <div class="cf-manifest">
                <div class="cf-manifest-item">Router / triage agent</div>
                <div class="cf-manifest-item">Agent + KB + Tool + Workflow</div>
                <div class="cf-manifest-item">Hand-off contract</div>
                <div class="cf-manifest-item">Supervisor + approval gate</div>
                <div class="cf-manifest-item">Escalation paths</div>
                <div class="cf-manifest-item">Department dashboard / logs</div>
            </div>
        </div>

        <!-- Expected Outcomes -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Expected Outcomes</div>
            <ul class="cf-debrief-list">
                <li>Multi-agent orchestration</li>
                <li>System composition &amp; responsibilities</li>
                <li>Routing &amp; triage</li>
                <li>Agent-to-agent hand-offs &amp; shared context</li>
                <li>Supervisor pattern &amp; human-in-the-loop</li>
                <li>Escalation &amp; runaway limits</li>
                <li>Cross-agent observability &amp; metrics</li>
                <li>The improve loop</li>
            </ul>
        </div>

        <!-- Related Training -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Related Training &mdash; The Four Components</div>
            <p class="cf-prose" style="margin-bottom: 12px; color: #94a3b8;">
                The rungs you assemble into this department.
            </p>
            <div class="cf-training-grid">
                <a href="starter-first-agent.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">My First Agent</span>
                    <span class="tc-type">Project</span>
                </a>
                <a href="starter-first-workflow.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">My First Workflow</span>
                    <span class="tc-type">Project</span>
                </a>
                <a href="starter-first-knowledge-base.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">My First Knowledge Base</span>
                    <span class="tc-type">Project</span>
                </a>
                <a href="starter-first-tool.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">My First Tool</span>
                    <span class="tc-type">Project</span>
                </a>
            </div>
        </div>

        <div class="cf-footer">
            <div class="cf-footer-text">End of File &mdash; Hexworth Prime</div>
        </div>

    </div>

<script>
// Per-project level-completion tracker. Persists which of the 5 levels the learner
// has checked off to localStorage and renders the progress bar. Self-contained IIFE.
(function() {{
    var PROJECT_KEY = 'hex_project_ai-build-your-department';
    var TOTAL_PHASES = 5;

    // Read the saved {{levelId: true}} completion map (empty object if none/invalid).
    function getState() {{
        try {{ return JSON.parse(localStorage.getItem(PROJECT_KEY)) || {{}}; }}
        catch(e) {{ return {{}}; }}
    }}
    // Persist the completion map.
    function saveState(state) {{ localStorage.setItem(PROJECT_KEY, JSON.stringify(state)); }}

    // Toggle a level's done state when its checkbox is clicked, then re-render.
    window.togglePhase = function(id) {{
        var state = getState();
        state[id] = !state[id];
        saveState(state);
        renderProgress();
    }};

    // Apply saved state to each level card and update the progress bar/count.
    function renderProgress() {{
        var state = getState();
        var done = 0;
        for (var i = 1; i <= TOTAL_PHASES; i++) {{
            var card = document.getElementById('phase-' + i);
            var check = document.getElementById('check-' + i);
            if (!card || !check) continue;
            if (state[i]) {{ card.classList.add('phase-done'); check.classList.add('checked'); done++; }}
            else {{ card.classList.remove('phase-done'); check.classList.remove('checked'); }}
        }}
        var fill = document.getElementById('phaseProgressFill');
        var count = document.getElementById('phaseProgressCount');
        if (fill) fill.style.width = Math.round((done / TOTAL_PHASES) * 100) + '%';
        if (count) count.textContent = done + ' / ' + TOTAL_PHASES;
    }}
    renderProgress();
}})();
</script>
</body>
</html>'''

out = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CASE FILE: Build Your First Department | Hexworth Prime</title>
    <style>{css}</style>
</head>
{body}'''

open(OUT, 'w').write(out)
print(f'wrote {OUT} ({len(out)} bytes)')
