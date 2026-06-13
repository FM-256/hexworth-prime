"""
Build _app/projects/starter-first-tool.html — the AI-house "My First Tool" project,
adaptive Level 1-5. The rung that turns an agent from a talker into a doer: a TOOL is a
capability the agent can call (tool use / function calling). Bridges My First Agent (the
brain) and My First Workflow (the automation) — the tool is the hands. One Help-Desk tool
threads all five levels (call a built-in action -> wrap your own flow as a tool -> input/
output schemas -> auth/secrets/guardrails -> errors/retries/observability), keeping the
help-desk theme used across the AI series. Clones the KB build: case-file format, AI-House
purple theme, tool/function-calling blueprint background, checkpoints + guardrails baked in.
"""
import re, urllib.parse

TMPL = '_app/projects/starter-first-app.html'
OUT = '_app/projects/starter-first-tool.html'

src = open(TMPL).read()
css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)

# Background: a tool-use blueprint (agent -> calls tool w/ typed inputs -> system -> output, + secret + retry + log).
tool_svg = (
"<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='800' fill='none' stroke='#8b5cf6'>"
# left: the agent (caller)
"<circle cx='95' cy='130' r='42' stroke-width='2' opacity='0.18'/>"
"<text x='66' y='126' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.2'>AGENT</text>"
"<text x='60' y='142' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>decides to call</text>"
"<line x1='137' y1='130' x2='205' y2='130' stroke-width='1.5' opacity='0.16'/>"
"<polygon points='211,130 201,124 201,136' fill='#8b5cf6' stroke='none' opacity='0.18'/>"
"<text x='150' y='122' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>call()</text>"
# left: the tool (plug + schema)
"<rect x='30' y='240' width='140' height='170' rx='3' stroke-width='2' opacity='0.18'/>"
"<text x='40' y='260' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.22'>TOOL</text>"
"<line x1='30' y1='266' x2='170' y2='266' stroke-width='1' opacity='0.14'/>"
"<text x='40' y='282' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.18'>inputs:</text>"
"<rect x='40' y='288' width='120' height='14' rx='2' stroke-width='1' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/><text x='46' y='298' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.16'>summary: string*</text>"
"<rect x='40' y='306' width='120' height='14' rx='2' stroke-width='1' opacity='0.14' fill='#8b5cf6' fill-opacity='0.04'/><text x='46' y='316' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.14'>category: enum*</text>"
"<text x='40' y='338' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.16'>output:</text>"
"<rect x='40' y='344' width='120' height='14' rx='2' stroke-width='1' opacity='0.12' fill='#8b5cf6' fill-opacity='0.05'/><text x='46' y='354' font-family='monospace' font-size='6.5' fill='#8b5cf6' stroke='none' opacity='0.14'>{ ticketId, status }</text>"
# the plug/connector glyph
"<path d='M150 372 h18 v8 h-18 z' stroke-width='1.5' opacity='0.16'/><line x1='168' y1='374' x2='180' y2='374' stroke-width='1.5' opacity='0.14'/><line x1='168' y1='378' x2='180' y2='378' stroke-width='1.5' opacity='0.14'/>"
"<text x='44' y='382' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>connector</text>"
# secret / key lock
"<rect x='250' y='300' width='44' height='34' rx='3' stroke-width='1.5' opacity='0.16'/>"
"<path d='M260 300 v-8 a12 12 0 0 1 24 0 v8' stroke-width='1.5' opacity='0.14'/>"
"<circle cx='272' cy='315' r='4' fill='#8b5cf6' stroke='none' opacity='0.16'/><line x1='272' y1='319' x2='272' y2='326' stroke-width='1.5' opacity='0.14'/>"
"<text x='244' y='350' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>secret (not in code)</text>"
# right: the system the tool acts on
"<rect x='850' y='100' width='130' height='120' rx='3' stroke-width='2' opacity='0.18'/>"
"<text x='862' y='120' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.2'>SYSTEM</text>"
"<line x1='850' y1='126' x2='980' y2='126' stroke-width='1' opacity='0.14'/>"
"<rect x='862' y='136' width='106' height='16' rx='2' stroke-width='1' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/>"
"<rect x='862' y='158' width='106' height='16' rx='2' stroke-width='1' opacity='0.14' fill='#8b5cf6' fill-opacity='0.04'/>"
"<rect x='862' y='180' width='106' height='16' rx='2' stroke-width='1' opacity='0.12' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='862' y='214' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>ticket store</text>"
"<line x1='790' y1='160' x2='848' y2='160' stroke-width='1.5' opacity='0.14'/><polygon points='846,160 836,154 836,166' fill='#8b5cf6' stroke='none' opacity='0.14'/>"
# retry loop
"<text x='840' y='300' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.18'>RETRY</text>"
"<path d='M868 340 A24 24 0 1 1 866 340' stroke-width='1.5' opacity='0.16'/>"
"<polygon points='866,340 860,332 872,332' fill='#8b5cf6' stroke='none' opacity='0.16'/>"
"<text x='846' y='382' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>on transient fail</text>"
# center: capability ladder
"<rect x='380' y='100' width='240' height='180' rx='3' stroke-width='2' opacity='0.18'/>"
"<line x1='380' y1='120' x2='620' y2='120' stroke-width='1.5' opacity='0.16'/>"
"<text x='415' y='114' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.2'>CAPABILITY LADDER</text>"
"<text x='400' y='150' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.18'>1 CALL</text>"
"<text x='400' y='172' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.16'>2 WRAP A FLOW</text>"
"<text x='400' y='194' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.14'>3 SCHEMA</text>"
"<text x='400' y='216' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.12'>4 AUTH</text>"
"<text x='400' y='238' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.1'>5 RESILIENCE</text>"
# log strip at the bottom
"<rect x='360' y='430' width='300' height='90' rx='3' stroke-width='1.5' opacity='0.16'/>"
"<text x='372' y='448' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>LOG</text>"
"<line x1='372' y1='458' x2='648' y2='458' stroke-width='1' opacity='0.1'/>"
"<text x='372' y='474' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.13'>call create_ticket  in={...}  out=OK #4812</text>"
"<text x='372' y='490' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.11'>call create_ticket  in={...}  RETRY 1</text>"
"<text x='372' y='506' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.09'>call create_ticket  in={...}  ERR -&gt; escalate</text>"
# decorative wiring
"<line x1='0' y1='560' x2='400' y2='320' stroke-width='1.2' opacity='0.06' stroke-dasharray='10 14'/>"
"<line x1='700' y1='0' x2='1000' y2='240' stroke-width='1.2' opacity='0.05' stroke-dasharray='8 12'/>"
"<text x='560' y='580' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.09'>talker -&gt; doer</text>"
"</svg>"
)
tool_uri = "data:image/svg+xml," + urllib.parse.quote(tool_svg)
css = re.sub(r'background-image: url\("data:image/svg\+xml,.*?"\);',
             f'background-image: url("{tool_uri}");', css, count=1, flags=re.S)

for a, b in [('#4ade80', '#8b5cf6'), ('rgba(74, 222, 128,', 'rgba(139, 92, 246,'),
             ('rgba(74,222,128,', 'rgba(139,92,246,'), ('#22c55e', '#a78bfa'),
             ('rgba(34, 197, 94,', 'rgba(139, 92, 246,'), ('#0d1a12', '#170d22'), ('#0a1410', '#120a1a')]:
    css = css.replace(a, b)
css = css.replace('/* Blueprint sketches layer — Python/quiz app theme */',
                  '/* Blueprint sketches layer: agent tool / function-calling theme */')
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

# One level card; checkpoint required, rules optional (mirrors the KB/workflow builders).
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

# Five levels grow ONE Help-Desk tool the agent can call.
levels = [
 level(1, "Call a Built-In Tool", "Beginner", "~30 min", 250,
   "An agent that only talks is limited. A <strong>tool</strong> is a capability the agent can <em>call</em> to actually do something. Give your help-desk agent a built-in action, a date calculation, for example, and watch it decide on its own when to call it. This is <strong>tool use (function calling)</strong>: the model picks the right tool, fills in the inputs, and uses the result instead of guessing.",
   "tool use / function calling, built-in actions, the agent deciding when to call.",
   "The agent calls the tool by itself when a question needs it (\"what date is 10 business days from now?\") and uses the returned value in its reply, rather than guessing.",
   checkpoint="Ask the agent something it can only answer correctly by calling the tool (a date or calculation). Confirm it actually invokes the tool, check the activity/trace, and that the answer is correct. Then ask a plain conversational question and confirm it does NOT call the tool needlessly. If it guesses instead of calling, the tool's name and description aren't clear enough for the agent to know when to use it, sharpen them."),
 level(2, "Wrap Your Own Flow as a Tool", "Beginner+", "~45 min", 250,
   "Built-in actions only go so far. Now make your <strong>own</strong> tool: take the Help-Desk Intake flow you built in <em>My First Workflow</em> and expose it as a tool the agent can call, \"create a ticket.\" The agent gathers the details from the conversation and hands them to your flow. This is how an agent acts on <em>your</em> systems, not just Microsoft's.",
   "custom actions, exposing a flow as a tool, mapping conversation into inputs.",
   "A learner says \"my laptop won't boot\" and the agent calls your create-ticket tool with a sensible summary and category, and a real ticket is created.",
   checkpoint="Describe a problem to the agent in plain language. Confirm it calls your create-ticket tool, that it mapped the conversation into the right inputs (summary, category), and that the ticket actually got created (check the flow run or the ticket list). If inputs arrive empty or wrong, sharpen each input's description so the agent knows what to put where."),
 level(3, "Inputs, Outputs and Schemas", "Intermediate", "~1 hr", 300,
   "A tool is only as reliable as its <strong>contract</strong>. Define clear inputs (name, type, required vs optional, description) and a structured output the agent can use next. Add <em>validation</em> so bad data is caught at the door, not deep inside your system. The schema is what makes every tool call predictable instead of a guess.",
   "input/output schemas, types and required fields, validation, structured returns.",
   "The tool rejects a malformed call with a clear message, accepts a well-formed one, and returns a structured result (ticket ID + status) the agent reads back to the user.",
   checkpoint="Call the tool once with a required field missing and confirm it returns a clear validation error, not a crash or a silent wrong result. Call it correctly and confirm the structured output (e.g. ticket ID) comes back and the agent repeats it to the user. If a bad call slips through, tighten the required-field and type definitions on the inputs."),
 level(4, "Auth, Secrets and Guardrails", "Intermediate+", "~1.5 hr", 350,
   "A tool that touches real systems must do so <strong>safely</strong>. Store credentials as secrets (never hard-coded), scope the tool to <em>least privilege</em> (it can create a ticket, not wipe a database), and require a confirmation step before any irreversible action. This is the safety layer that makes a tool safe to hand to an autonomous agent.",
   "connection references, secrets management, least privilege, human-in-the-loop confirmation.",
   "The tool authenticates through a stored connection with no secret visible in its definition, is limited to its one job, and a high-impact action pauses for confirmation instead of firing automatically.",
   checkpoint="Inspect the tool definition and confirm no API key or password is visible in it, it should reference a connection/secret. Confirm the tool cannot act outside its scope (try to make it do something it shouldn't and confirm it can't). Trigger the high-impact path and confirm it asks for confirmation before acting. If a secret is visible or the tool over-reaches, move the credential into a connection and narrow its permissions.",
   rules="Credentials live in a secure connection or secret, never in the tool body or the prompt. The tool is scoped to exactly what it needs. Any irreversible or high-impact action requires explicit confirmation before it runs."),
 level(5, "Errors, Retries and Observability", "Advanced", "~2 hr", 350,
   "Real tools fail, the API times out, returns an error, hits a rate limit. Make yours <strong>resilient</strong>: catch errors and return a useful message the agent can act on, retry transient failures, and log every call so you can see what happened. A tool you can't observe is a tool you can't trust in production.",
   "error handling, retries and backoff, graceful failure messages, logging and observability.",
   "When the downstream system is down, the tool returns a clear failure the agent relays honestly and escalates; transient errors are retried; and a log shows each call, its inputs, and its result.",
   checkpoint="Force a failure (point the tool at a bad endpoint or disable the downstream system) and confirm the agent reports the failure honestly and escalates, it must NOT claim success. Confirm a transient error is retried. Open the run history/log and confirm you can see the call, its inputs, and its outcome. If the agent ever reports success on a failed call, fix the error path so the failure is surfaced.",
   rules="A failed tool call must fail loudly and gracefully: the agent gets a clear error and tells the user or escalates, never silently pretends it worked. Every call is logged.")
]
phases_html = '\n\n'.join(levels)

body = f'''<body>

    <div class="cf-drafting-table"></div>

    <div class="cf-header">
        <a href="index.html">&larr; PROJECTS</a>
        <span class="cf-header-title">Case File</span>
        <span class="cf-header-ref">AI-TOOL-001</span>
    </div>

    <div class="cf-content">

        <div class="cf-cover">
            <div class="cf-stamp">Classified</div>

            <div class="cf-meta-row">
                <span class="cf-meta-item">Case No: <span class="cf-meta-value">AI-TOOL-001</span></span>
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

            <div class="cf-subject-label">Subject</div>
            <h1 class="cf-subject">My First Tool</h1>

            <div class="cf-badges">
                <span class="cf-badge cf-badge-diff">Adaptive &middot; L1&ndash;5</span>
                <span class="cf-badge cf-badge-time">30 min &ndash; 2 hr</span>
                <span class="cf-badge cf-badge-xp">250 &ndash; 1500 XP</span>
            </div>
        </div>

        <!-- Mission Brief -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Mission Brief</div>
            <div class="cf-prose">
                <p>
                    A <strong>tool</strong> is what turns an agent from a talker into a doer. On its own a
                    model can only produce words; a tool is a capability you hand it, look something up,
                    create a ticket, send a message, that it can <em>call</em> when the conversation needs
                    it. The mechanism is <code>tool use</code>, also called function calling: the model
                    decides a tool is needed, fills in the inputs from the conversation, runs it, and uses
                    the result in its answer.
                </p>
                <p>
                    This project is the bridge of the AI series. <em>My First Agent</em> built the brain and
                    <em>My First Workflow</em> built the automation; the tool is the <strong>hands</strong>
                    that let the brain trigger the automation. You will build one real tool for the same
                    <strong>Help-Desk</strong> world and grow it across five levels: call a built-in action,
                    then wrap your own flow as a tool, then give it a strict input/output schema, then secure
                    it with auth and guardrails, and finally make it resilient with retries and logging.
                </p>
                <p>
                    The throughline is reliability. A tool that validates its inputs, hides its secrets,
                    asks before doing anything irreversible, and fails honestly instead of pretending, is one
                    you can safely give an autonomous agent. By the end you will understand exactly how an AI
                    reaches out and acts on the real world, and how to make that safe.
                </p>
            </div>
        </div>

        <!-- Requirements -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Agent Requirements</div>
            <ul class="cf-req-list">
                <li>A Microsoft account with Copilot Studio access (a free trial covers Levels 1&ndash;2)</li>
                <li>A web browser &mdash; tools are built in the maker portal, no installs or code</li>
                <li>The Help-Desk Intake flow from <em>My First Workflow</em> (wrapped as a tool at Level 2)</li>
                <li>A help-desk agent from <em>My First Agent</em> to call the tool (or build a fresh one)</li>
                <li>No prior AI or programming experience required to start</li>
            </ul>
        </div>

        <!-- Operation Phases (the five levels) -->
        <div class="cf-paper">
            <div class="cf-section-stamp">Operation Phases &mdash; Five Levels, One Growing Tool</div>

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
                <div class="cf-manifest-item">Microsoft Copilot Studio</div>
                <div class="cf-manifest-item">Built-in actions</div>
                <div class="cf-manifest-item">Power Automate flow (wrapped)</div>
                <div class="cf-manifest-item">Input/output schema</div>
                <div class="cf-manifest-item">Connections &amp; secrets</div>
                <div class="cf-manifest-item">Run history / logs</div>
            </div>
        </div>

        <!-- Expected Outcomes -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Expected Outcomes</div>
            <ul class="cf-debrief-list">
                <li>Tool use / function calling</li>
                <li>Built-in &amp; custom actions</li>
                <li>Wrapping a flow as a tool</li>
                <li>Input/output schemas &amp; validation</li>
                <li>Auth, secrets &amp; least privilege</li>
                <li>Human-in-the-loop confirmation</li>
                <li>Error handling, retries &amp; backoff</li>
                <li>Logging &amp; observability</li>
            </ul>
        </div>

        <!-- Related Training -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Related Training</div>
            <p class="cf-prose" style="margin-bottom: 12px; color: #94a3b8;">
                Build the skills behind this project in the AI House.
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
    var PROJECT_KEY = 'hex_project_starter-first-tool';
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
    <title>CASE FILE: My First Tool | Hexworth Prime</title>
    <style>{css}</style>
</head>
{body}'''

open(OUT, 'w').write(out)
print(f'wrote {OUT} ({len(out)} bytes)')
