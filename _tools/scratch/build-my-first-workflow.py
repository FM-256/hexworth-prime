"""
Build _app/projects/starter-first-workflow.html — the AI-house "My First Workflow"
project, adaptive Level 1-5, built in Power Automate (no-code). Improvement over a
loose spec: ONE coherent scenario, a Help-Desk Ticket Intake automation, grows across
all five levels (trigger -> branch -> AI -> approval -> scheduled ops). Clones the
case-file format from starter-first-app.html, re-themes Code-green -> AI-House purple,
swaps the background to a flow blueprint, and ships each level with a self-verify
checkpoint + guardrails from the start (the Chris lesson from My First Agent).
"""
import re, urllib.parse

TMPL = '_app/projects/starter-first-app.html'
OUT = '_app/projects/starter-first-workflow.html'

src = open(TMPL).read()
css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)

# Decorative background: a flow blueprint (trigger -> action -> condition -> AI -> approval -> schedule).
flow_svg = (
"<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='800' fill='none' stroke='#8b5cf6'>"
# left: flow designer panel
"<rect x='15' y='30' width='150' height='170' rx='2' stroke-width='1.5' opacity='0.16'/>"
"<text x='20' y='46' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.22'>FLOW DESIGNER</text>"
"<line x1='15' y1='52' x2='165' y2='52' stroke-width='1' opacity='0.14'/>"
"<rect x='30' y='62' width='120' height='20' rx='3' stroke-width='1.2' opacity='0.18' fill='#8b5cf6' fill-opacity='0.06'/>"
"<text x='38' y='76' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.2'>WHEN form submitted</text>"
"<line x1='90' y1='82' x2='90' y2='94' stroke-width='1' opacity='0.14'/>"
"<rect x='30' y='94' width='120' height='20' rx='3' stroke-width='1.2' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/>"
"<text x='38' y='108' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.16'>condition: category?</text>"
"<line x1='90' y1='114' x2='90' y2='126' stroke-width='1' opacity='0.12'/>"
"<rect x='30' y='126' width='120' height='20' rx='3' stroke-width='1.2' opacity='0.14' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='38' y='140' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.14'>AI: classify urgency</text>"
"<line x1='90' y1='146' x2='90' y2='158' stroke-width='1' opacity='0.1'/>"
"<rect x='30' y='158' width='120' height='20' rx='3' stroke-width='1.2' opacity='0.12' fill='#8b5cf6' fill-opacity='0.05'/>"
"<text x='38' y='172' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.12'>approval: create acct</text>"
"<line x1='90' y1='178' x2='90' y2='190' stroke-width='1' opacity='0.1'/>"
"<rect x='30' y='190' width='120' height='16' rx='3' stroke-width='1.2' opacity='0.1' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='38' y='202' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.1'>notify team</text>"
# left: run history
"<rect x='20' y='250' width='130' height='90' rx='3' stroke-width='1.5' opacity='0.16'/>"
"<text x='28' y='268' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>RUN HISTORY</text>"
"<line x1='20' y1='274' x2='150' y2='274' stroke-width='1' opacity='0.12'/>"
"<circle cx='30' cy='288' r='3' fill='#8b5cf6' stroke='none' opacity='0.18'/><text x='40' y='291' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>08:00 success</text>"
"<circle cx='30' cy='304' r='3' fill='#8b5cf6' stroke='none' opacity='0.14'/><text x='40' y='307' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>08:15 success</text>"
"<circle cx='30' cy='320' r='3' fill='#8b5cf6' stroke='none' opacity='0.1'/><text x='40' y='323' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.1'>08:30 failed -> alert</text>"
# right: trigger-to-action chain
"<rect x='880' y='40' width='110' height='230' rx='2' stroke-width='1.5' opacity='0.16'/>"
"<text x='890' y='58' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.22'>FLOW</text>"
"<line x1='880' y1='64' x2='990' y2='64' stroke-width='1' opacity='0.14'/>"
"<rect x='905' y='74' width='60' height='18' rx='9' stroke-width='1' opacity='0.18' fill='#8b5cf6' fill-opacity='0.06'/>"
"<text x='913' y='87' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.2'>TRIGGER</text>"
"<line x1='935' y1='92' x2='935' y2='106' stroke-width='1' opacity='0.14'/>"
"<rect x='905' y='106' width='60' height='18' rx='2' stroke-width='1' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/>"
"<text x='914' y='119' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.16'>ACTION</text>"
"<line x1='935' y1='124' x2='935' y2='138' stroke-width='1' opacity='0.12'/>"
"<polygon points='935,138 957,158 935,178 913,158' stroke-width='1.2' opacity='0.14' fill='#8b5cf6' fill-opacity='0.05'/>"
"<text x='921' y='162' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>if?</text>"
"<line x1='913' y1='158' x2='895' y2='158' stroke-width='1' opacity='0.1'/><line x1='957' y1='158' x2='975' y2='158' stroke-width='1' opacity='0.1'/>"
"<line x1='935' y1='178' x2='935' y2='192' stroke-width='1' opacity='0.1'/>"
"<rect x='905' y='192' width='60' height='18' rx='2' stroke-width='1' opacity='0.1' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='916' y='205' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.1'>AI step</text>"
"<line x1='935' y1='210' x2='935' y2='224' stroke-width='1' opacity='0.09'/>"
"<rect x='905' y='224' width='60' height='18' rx='2' stroke-width='1' opacity='0.09' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='913' y='237' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.09'>approve?</text>"
# right: schedule clock
"<text x='890' y='320' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.2'>SCHEDULE</text>"
"<circle cx='935' cy='360' r='26' stroke-width='1.5' opacity='0.16'/>"
"<line x1='935' y1='360' x2='935' y2='342' stroke-width='1.2' opacity='0.16'/><line x1='935' y1='360' x2='950' y2='366' stroke-width='1.2' opacity='0.14'/>"
"<text x='905' y='402' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>weekdays 8am</text>"
# center: capability ladder
"<rect x='380' y='100' width='240' height='180' rx='3' stroke-width='2' opacity='0.18'/>"
"<line x1='380' y1='120' x2='620' y2='120' stroke-width='1.5' opacity='0.16'/>"
"<text x='415' y='114' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.2'>CAPABILITY LADDER</text>"
"<text x='400' y='150' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.18'>1 TRIGGER</text>"
"<text x='400' y='172' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.16'>2 BRANCH</text>"
"<text x='400' y='194' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.14'>3 AI</text>"
"<text x='400' y='216' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.12'>4 APPROVAL</text>"
"<text x='400' y='238' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.1'>5 SCHEDULED OPS</text>"
# center: connector nodes
"<circle cx='500' cy='420' r='20' stroke-width='2' opacity='0.18'/>"
"<circle cx='620' cy='380' r='15' stroke-width='1.5' opacity='0.14'/>"
"<circle cx='630' cy='480' r='16' stroke-width='1.5' opacity='0.12'/>"
"<line x1='520' y1='416' x2='606' y2='384' stroke-width='1.5' opacity='0.14'/>"
"<line x1='512' y1='436' x2='616' y2='474' stroke-width='1.2' opacity='0.12'/>"
"<text x='482' y='425' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.18'>FLOW</text>"
"<text x='602' y='384' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.14'>mail</text>"
"<text x='612' y='484' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.12'>sheet</text>"
"<text x='40' y='520' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.1' transform='rotate(-8 40 520)'>trigger + actions</text>"
"<text x='560' y='560' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.09'>human-in-the-loop</text>"
"<line x1='0' y1='560' x2='400' y2='300' stroke-width='1.2' opacity='0.06' stroke-dasharray='10 14'/>"
"<line x1='700' y1='0' x2='1000' y2='220' stroke-width='1.2' opacity='0.05' stroke-dasharray='8 12'/>"
"</svg>"
)
flow_uri = "data:image/svg+xml," + urllib.parse.quote(flow_svg)
css = re.sub(r'background-image: url\("data:image/svg\+xml,.*?"\);',
             f'background-image: url("{flow_uri}");', css, count=1, flags=re.S)

# Code-green -> AI-House purple.
for a, b in [('#4ade80', '#8b5cf6'), ('rgba(74, 222, 128,', 'rgba(139, 92, 246,'),
             ('rgba(74,222,128,', 'rgba(139,92,246,'), ('#22c55e', '#a78bfa'),
             ('rgba(34, 197, 94,', 'rgba(139, 92, 246,'), ('#0d1a12', '#170d22'), ('#0a1410', '#120a1a')]:
    css = css.replace(a, b)
css = css.replace('/* Blueprint sketches layer — Python/quiz app theme */',
                  '/* Blueprint sketches layer: workflow/automation theme */')

# Level-card extras (meta line, skills, guardrails, win condition).
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
"""

# One level card. checkpoint is required (the Chris lesson); rules optional.
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

# The five levels build ONE growing Help-Desk Ticket Intake flow.
levels = [
 level(1, "Trigger and Action", "Beginner", "~30 min", 250,
   "Open <strong>Power Automate</strong> and build your first automated flow: a <em>trigger</em> plus one <em>action</em>. When a help-desk request form is submitted (or a new row lands in a request spreadsheet), the flow automatically posts a notification to your help-desk channel or email. No code; you connect a trigger to an action and turn it on.",
   "triggers, actions, connectors, the flow maker portal.",
   "Submitting the request form fires the flow automatically (no manual run) and a notification arrives within about a minute.",
   checkpoint="Submit a test entry to the form/sheet. Open the flow's <strong>Run history</strong>; you should see a run marked Succeeded, and the notification should appear in your channel/inbox. If no run shows up, confirm the trigger points at the correct form/sheet and the flow toggle is <em>On</em>."),
 level(2, "Multi-Step and Branching", "Beginner+", "~45 min", 250,
   "Make the flow decide. Add a <strong>Condition</strong> that branches on the request's category (Password / Hardware / Other) and route each branch differently: notify the right team, set a priority, and log the ticket to the matching tracking list. Chain three or four actions across the branches using the form's fields as dynamic content.",
   "conditions and branching, multiple actions, dynamic content, basic expressions.",
   "A <strong>Password</strong> request and a <strong>Hardware</strong> request take different branches and reach different teams/lists.",
   checkpoint="Submit one Password request and one Hardware request. In Run history, open each run and confirm it followed the correct branch and the right team/list received it. If both take the same path, check the Condition's chosen field and its compare value."),
 level(3, "AI-Powered Flow", "Intermediate", "~1 hr", 300,
   "Add intelligence. Insert an <strong>AI step</strong> (AI Builder or a GPT action) that reads the free-text request, classifies its urgency as Low / Medium / High, and writes a one-line summary. Feed the AI's output back into the flow: set the ticket priority from the urgency and route High items to the front of the queue.",
   "AI Builder / GPT action, prompt design inside a flow, using AI output in later steps.",
   "A vague free-text request gets an AI urgency label and a readable summary, and a <strong>High</strong> item is routed or flagged differently than a <strong>Low</strong> one.",
   checkpoint="Submit a clearly urgent request (\"server down, whole office offline\") and a trivial one (\"how do I change my desktop wallpaper\"). Confirm the AI tags them High and Low, the one-line summaries are sensible, and the High one is escalated. If the label is always the same, refine the AI prompt with one example of each urgency level."),
 level(4, "Approval Flow", "Intermediate+", "~1.5 hr", 350,
   "Put a human in the loop. Before the flow takes a <em>consequential</em> action (auto-creating an account, resetting a password, or closing a ticket), add an <strong>Approval</strong> step that pauses and asks a person to Approve or Reject. The action runs only on approval; on rejection the flow stops and tells the requester why.",
   "approvals, human-in-the-loop, waiting on a response, conditional branches.",
   "A request that would trigger the consequential action <strong>pauses for approval</strong>; approving runs it, rejecting stops it and notifies the requester.",
   checkpoint="Trigger the consequential path and confirm the flow pauses and sends an approval request (an email or Teams card). Approve it and confirm the action completes. Run it again and Reject, then confirm the action did <em>not</em> happen and the requester was notified. If the action runs before you respond, the approval step is placed after the action instead of before it.",
   rules="Any consequential action (account changes, password resets, anything that touches a real user or system) must sit behind an approval. The flow never auto-executes those on its own.")
,
 level(5, "Scheduled Operations Flow", "Advanced", "~2-3 hr", 350,
   "Run the desk on a timer. Build a <strong>scheduled</strong> flow (for example, every weekday at 8am) that pulls the day's open tickets, has AI summarize the backlog, posts a digest report to the team, and alerts a manager if the backlog exceeds a threshold. Add <strong>error handling</strong> (configure run-after, or a Try/Catch scope) so a failed step raises an alert instead of failing silently.",
   "scheduled (recurrence) triggers, multi-connector orchestration, AI summarization, error handling, governance.",
   "The flow runs end to end on its schedule (pull &rarr; summarize &rarr; report &rarr; conditional alert), and when a step is made to fail it sends a failure alert rather than dying silently.",
   checkpoint="Run the flow manually (don't wait for the schedule). Confirm the digest posts with an AI summary and that the manager alert fires only when the backlog is over the threshold (test both above and below). Then deliberately break a step (point it at a missing list) and confirm the error-handling path sends you a failure alert. If a broken step fails silently, the run-after / scope error handling isn't wired.",
   rules="The scheduled flow reports and alerts; it does not silently change data. Failures must surface as an alert, never pass unnoticed.")
]
phases_html = '\n\n'.join(levels)

body = f'''<body>

    <div class="cf-drafting-table"></div>

    <div class="cf-header">
        <a href="index.html">&larr; PROJECTS</a>
        <span class="cf-header-title">Case File</span>
        <span class="cf-header-ref">AI-FLOW-001</span>
    </div>

    <div class="cf-content">

        <div class="cf-cover">
            <div class="cf-stamp">Classified</div>

            <div class="cf-meta-row">
                <span class="cf-meta-item">Case No: <span class="cf-meta-value">AI-FLOW-001</span></span>
                <span class="cf-meta-item">Filed: <span class="cf-meta-value">2026-06-12</span></span>
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

            <div class="cf-subject-label">Subject</div>
            <h1 class="cf-subject">My First Workflow</h1>

            <div class="cf-badges">
                <span class="cf-badge cf-badge-diff">Adaptive &middot; L1&ndash;5</span>
                <span class="cf-badge cf-badge-time">30 min &ndash; 3 hr</span>
                <span class="cf-badge cf-badge-xp">250 &ndash; 1500 XP</span>
            </div>
        </div>

        <!-- Mission Brief -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Mission Brief</div>
            <div class="cf-prose">
                <p>
                    A workflow is automation that runs <em>without you</em>. Strip away the buzzwords and
                    it is four things you wire together: a <code>trigger</code> (when to start),
                    <code>actions</code> (what to do), <code>logic</code> (how to decide), and, when it
                    matters, an <code>AI step</code> and a human <code>approval</code>. This is the
                    plumbing AI agents actually run on, so it is the natural next build after My First Agent.
                </p>
                <p>
                    You will build one real thing and grow it across five levels: a
                    <strong>Help-Desk Ticket Intake</strong> flow in <strong>Microsoft Power Automate</strong>
                    (no code). Level 1 is a single trigger and action you finish in half an hour. Each
                    level after adds exactly one capability to the <em>same</em> flow: branching, then AI
                    classification, then a human approval gate, and finally a scheduled daily operation
                    with error handling. Stop at any level and you still have a working automation.
                </p>
                <p>
                    The progression is deliberately safe. Early levels only notify and log; the consequential
                    actions (creating accounts, changing data) never run until you have built the approval
                    gate in Level 4. By the end you will have automated a small business process end to end,
                    and you will understand exactly which piece does what.
                </p>
            </div>
        </div>

        <!-- Requirements -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Agent Requirements</div>
            <ul class="cf-req-list">
                <li>A Microsoft account with Power Automate access (a free/developer plan works for Levels 1&ndash;2)</li>
                <li>AI Builder or a GPT/AI action available in your environment (for Level 3 onward)</li>
                <li>A web browser &mdash; the flow is built entirely in the Power Automate maker portal, no installs</li>
                <li>The provided sample pack: a request form, a tracking spreadsheet, and a sample ticket list</li>
                <li>No production systems and no real accounts &mdash; Levels 1&ndash;3 only notify and log</li>
                <li>No prior automation or programming experience required to start</li>
            </ul>
        </div>

        <!-- Operation Phases (the five levels) -->
        <div class="cf-paper">
            <div class="cf-section-stamp">Operation Phases &mdash; Five Levels, One Growing Flow</div>

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
                <div class="cf-manifest-item">Microsoft Power Automate</div>
                <div class="cf-manifest-item">Request Form (sample)</div>
                <div class="cf-manifest-item">Tracking Spreadsheet (sample)</div>
                <div class="cf-manifest-item">Sample Ticket List</div>
                <div class="cf-manifest-item">AI Builder / GPT action (L3)</div>
                <div class="cf-manifest-item">Approvals (L4)</div>
            </div>
        </div>

        <!-- Expected Outcomes -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Expected Outcomes</div>
            <ul class="cf-debrief-list">
                <li>Workflow = trigger + actions + logic + AI + approval</li>
                <li>Triggers, actions &amp; connectors</li>
                <li>Conditions, branching &amp; dynamic content</li>
                <li>AI classification &amp; summarization in a flow</li>
                <li>Human-in-the-loop approvals</li>
                <li>Scheduled (recurrence) automation</li>
                <li>Error handling &amp; alerting</li>
                <li>Safe, governed automation</li>
            </ul>
        </div>

        <!-- Related Training -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Related Training</div>
            <p class="cf-prose" style="margin-bottom: 12px; color: #94a3b8;">
                Build the skills behind this project in the AI House.
            </p>
            <div class="cf-training-grid">
                <a href="../houses/ai/index.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">Artificial Intelligence</span>
                    <span class="tc-type">House</span>
                </a>
                <a href="starter-first-agent.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">My First Agent</span>
                    <span class="tc-type">Project</span>
                </a>
                <a href="ai-research-agent.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">Build a Research Agent</span>
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
    var PROJECT_KEY = 'hex_project_starter-first-workflow';
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
    <title>CASE FILE: My First Workflow | Hexworth Prime</title>
    <style>{css}</style>
</head>
{body}'''

open(OUT, 'w').write(out)
print(f'wrote {OUT} ({len(out)} bytes)')
