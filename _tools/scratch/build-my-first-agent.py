"""
Build _app/projects/starter-first-agent.html — the AI-house "My First Agent" project,
adaptive Level 1-5 (Talking -> Knowledge -> Inbox -> Action -> Autonomous Ops).
Clones the case-file format from starter-first-app.html, re-themes the Code-green
palette to AI-House purple (#8b5cf6), swaps the decorative background to an agent
blueprint, and authors the five-level content as the Operation Phases.
"""
import re, urllib.parse

TMPL = '_app/projects/starter-first-app.html'
OUT = '_app/projects/starter-first-agent.html'

src = open(TMPL).read()
css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)

# Replace the decorative background data-URI (Code/quiz blueprint) with an AI-agent one.
agent_svg = (
"<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='800' fill='none' stroke='#8b5cf6'>"
# left: agent.yaml config box
"<rect x='15' y='30' width='150' height='150' rx='2' stroke-width='1.5' opacity='0.16'/>"
"<text x='20' y='46' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.22'>agent.yaml</text>"
"<line x1='15' y1='52' x2='165' y2='52' stroke-width='1' opacity='0.14'/>"
"<text x='20' y='70' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>name: Helper</text>"
"<text x='20' y='84' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.16'>instructions:</text>"
"<text x='28' y='98' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.14'>answer + cite</text>"
"<text x='20' y='112' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.12'>knowledge: docs/</text>"
"<text x='20' y='126' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.1'>tools: [ticket]</text>"
"<text x='20' y='140' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.09'>boundaries:</text>"
"<text x='28' y='154' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.08'>never send</text>"
# left: knowledge base stack
"<text x='22' y='250' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>KNOWLEDGE BASE</text>"
"<rect x='22' y='258' width='80' height='14' rx='2' stroke-width='1.2' opacity='0.16' fill='#8b5cf6' fill-opacity='0.06'/>"
"<rect x='22' y='276' width='80' height='14' rx='2' stroke-width='1.2' opacity='0.14' fill='#8b5cf6' fill-opacity='0.05'/>"
"<rect x='22' y='294' width='80' height='14' rx='2' stroke-width='1.2' opacity='0.12' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='30' y='268' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>policy.pdf</text>"
"<text x='30' y='286' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>faq.md</text>"
# left: inbox triage
"<rect x='20' y='360' width='120' height='90' rx='3' stroke-width='1.5' opacity='0.16'/>"
"<text x='28' y='378' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>INBOX</text>"
"<line x1='20' y1='384' x2='140' y2='384' stroke-width='1' opacity='0.12'/>"
"<text x='28' y='400' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.16'>[URGENT] reset</text>"
"<text x='28' y='414' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.13'>[ROUTINE] lab</text>"
"<text x='28' y='428' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.1'>[SPAM] win $$$</text>"
"<text x='28' y='442' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.08'>[ESCALATE] sec</text>"
# right: agent flow (user -> agent -> tool -> answer)
"<rect x='880' y='40' width='110' height='220' rx='2' stroke-width='1.5' opacity='0.16'/>"
"<text x='890' y='58' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.22'>AGENT FLOW</text>"
"<line x1='880' y1='64' x2='990' y2='64' stroke-width='1' opacity='0.14'/>"
"<rect x='905' y='74' width='60' height='18' rx='2' stroke-width='1' opacity='0.18' fill='#8b5cf6' fill-opacity='0.06'/>"
"<text x='916' y='87' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.2'>USER</text>"
"<line x1='935' y1='92' x2='935' y2='104' stroke-width='1' opacity='0.14'/>"
"<rect x='905' y='104' width='60' height='18' rx='2' stroke-width='1' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/>"
"<text x='912' y='117' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.16'>AGENT</text>"
"<line x1='935' y1='122' x2='935' y2='134' stroke-width='1' opacity='0.12'/>"
"<rect x='905' y='134' width='60' height='18' rx='2' stroke-width='1' opacity='0.14' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='912' y='147' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>KNOW+TOOL</text>"
"<line x1='935' y1='152' x2='935' y2='164' stroke-width='1' opacity='0.1'/>"
"<rect x='905' y='164' width='60' height='18' rx='2' stroke-width='1' opacity='0.12' fill='#8b5cf6' fill-opacity='0.06'/>"
"<text x='912' y='177' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>APPROVE?</text>"
"<line x1='935' y1='182' x2='935' y2='194' stroke-width='1' opacity='0.1'/>"
"<rect x='905' y='194' width='60' height='18' rx='2' stroke-width='1' opacity='0.1' fill='#8b5cf6' fill-opacity='0.04'/>"
"<text x='914' y='207' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.1'>ANSWER</text>"
# right: approval gate diamond
"<text x='890' y='300' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.2'>HUMAN GATE</text>"
"<polygon points='935,320 965,350 935,380 905,350' stroke-width='1.5' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/>"
"<text x='922' y='354' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.16'>send?</text>"
"<line x1='905' y1='350' x2='885' y2='350' stroke-width='1' opacity='0.12'/>"
"<text x='862' y='354' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>no</text>"
# center: capability ladder
"<rect x='380' y='100' width='240' height='180' rx='3' stroke-width='2' opacity='0.18'/>"
"<line x1='380' y1='120' x2='620' y2='120' stroke-width='1.5' opacity='0.16'/>"
"<text x='418' y='114' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.2'>CAPABILITY LADDER</text>"
"<text x='400' y='150' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.18'>1 TALK</text>"
"<text x='400' y='172' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.16'>2 KNOW</text>"
"<text x='400' y='194' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.14'>3 INBOX</text>"
"<text x='400' y='216' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.12'>4 ACT</text>"
"<text x='400' y='238' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.1'>5 AUTONOMOUS</text>"
# center: node network (multi-agent)
"<circle cx='500' cy='420' r='22' stroke-width='2' opacity='0.18'/>"
"<circle cx='620' cy='370' r='16' stroke-width='1.5' opacity='0.14'/>"
"<circle cx='640' cy='490' r='18' stroke-width='1.5' opacity='0.14'/>"
"<circle cx='400' cy='480' r='14' stroke-width='1.2' opacity='0.1'/>"
"<line x1='522' y1='416' x2='604' y2='374' stroke-width='1.5' opacity='0.14'/>"
"<line x1='514' y1='436' x2='624' y2='480' stroke-width='1.2' opacity='0.12'/>"
"<line x1='480' y1='432' x2='412' y2='472' stroke-width='1.2' opacity='0.1'/>"
"<text x='482' y='425' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.18'>ORCH</text>"
"<text x='600' y='374' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.14'>help</text>"
"<text x='620' y='495' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.12'>sched</text>"
"<text x='386' y='484' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.1'>docs</text>"
# annotations
"<text x='40' y='520' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.1' transform='rotate(-8 40 520)'>prompt + grounding</text>"
"<text x='560' y='560' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.09'>human-in-the-loop</text>"
"<line x1='0' y1='560' x2='400' y2='300' stroke-width='1.2' opacity='0.06' stroke-dasharray='10 14'/>"
"<line x1='700' y1='0' x2='1000' y2='220' stroke-width='1.2' opacity='0.05' stroke-dasharray='8 12'/>"
"</svg>"
)
agent_uri = "data:image/svg+xml," + urllib.parse.quote(agent_svg)
css = re.sub(r'background-image: url\("data:image/svg\+xml,.*?"\);',
             f'background-image: url("{agent_uri}");', css, count=1, flags=re.S)

# Re-theme Code-green -> AI-House purple.
swaps = [
    ('#4ade80', '#8b5cf6'),
    ('rgba(74, 222, 128,', 'rgba(139, 92, 246,'),
    ('rgba(74,222,128,', 'rgba(139,92,246,'),
    ('#22c55e', '#a78bfa'),
    ('rgba(34, 197, 94,', 'rgba(139, 92, 246,'),
    ('#0d1a12', '#170d22'),   # cover gradient top (green-tint -> purple-tint)
    ('#0a1410', '#120a1a'),   # cover gradient bottom
]
for a, b in swaps:
    css = css.replace(a, b)
# Fix the inherited CSS comment so it describes the AI background, not the old quiz one.
css = css.replace('/* Blueprint sketches layer — Python/quiz app theme */',
                  '/* Blueprint sketches layer: AI agent theme */')

# A few extra rules for the level cards (meta line, win condition, skills, rules).
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

# ── Level content (the five Operation Phases) ──
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

# Every call passes checkpoint= and rules= as KEYWORDS so args cannot misroute.
levels = [
 level(1, "The Talking Agent", "Beginner", "~30 min", 250,
   "Create your first agent in <strong>Microsoft Copilot Studio</strong> (no code). Give it a name, write a clear <em>purpose</em>, and author <em>system instructions</em> that define how it answers and what it refuses. Point it at one provided document (the campus help-desk FAQ) and build a study/help assistant that stays in character and on-topic.",
   "prompt engineering, system instructions, agent identity, testing.",
   "The agent answers <strong>5 test questions</strong> correctly, greets users in its defined persona, and politely refuses an off-topic request (\"I can only help with campus IT questions\").",
   checkpoint="In Copilot Studio's <strong>Test</strong> pane, type a question your FAQ covers (e.g., \"my password is locked, what do I do?\"). The agent should reply in its persona using the FAQ's steps. Then type an off-topic question (\"what's the weather?\"); it should decline and point you to campus IT. If it answers off-topic asks, add an explicit scope line to the system instructions (\"only answer campus IT questions\") and re-test."),
 level(2, "The Knowledge Agent", "Beginner+", "~45 min", 250,
   "Add real <em>knowledge sources</em>: upload the policy and class-materials documents and connect them as the agent's knowledge base. This is <strong>retrieval-augmented generation (RAG)</strong>, where the agent answers <em>from the source</em> instead of guessing, which is how you cut hallucinations. Teach it to cite where an answer came from, and to say \"I don't know\" when the source doesn't cover it.",
   "RAG, knowledge bases, grounding, document management.",
   "The agent answers questions <strong>using the uploaded material</strong> (not invented facts) and correctly responds \"I don't know / that's not in my sources\" to a question the documents don't cover.",
   checkpoint="Ask a question whose answer lives <em>only</em> in your uploaded doc, not general knowledge; the agent should answer correctly and point to the source. Then ask something the docs do not cover; it should say it doesn't have that information instead of inventing an answer. If it makes something up, confirm the files are attached as knowledge and turn on the \"respond only from knowledge sources\" grounding setting."),
 level(3, "The Inbox Agent", "Intermediate", "~1-1.5 hr", 300,
   "Connect a <strong>sample mailbox</strong> via Microsoft Graph (read-only). The agent reads incoming messages, classifies each by priority, summarizes a thread, and <em>drafts</em> a suggested reply for you to review. This is your first agent that touches a real system, so it does it safely.",
   "Microsoft Graph, email workflows, AI classification.",
   "The agent correctly sorts messages into <strong>Urgent / Routine / Spam / Escalation</strong> and produces a drafted reply for an Urgent message, with no message sent, deleted, or forwarded.",
   checkpoint="Run the agent across the sample inbox. Every message should get one label (Urgent, Routine, Spam, or Escalation) and the Urgent one should produce a readable draft reply. Confirm the sample Sent and Deleted folders are still empty (nothing sent, moved, or deleted). If a message is mislabeled, add one example per category to the instructions and re-run.",
   rules="The agent may <em>read</em>, <em>summarize</em>, and <em>draft</em>. It may <strong>not</strong> send, delete, or forward. No real credentials; use the provided sample inbox."),
 level(4, "The Action Agent", "Intermediate+", "~2 hr", 350,
   "Give the agent <em>actions</em> via <strong>Power Automate</strong> workflows: create a ticket, schedule a meeting, update a spreadsheet, or generate a report. The critical skill here is the <strong>human-in-the-loop approval</strong>, where the agent proposes the action and a person approves before anything executes. You build the guardrails that make autonomy safe.",
   "Power Automate, agent actions, approval loops, guardrails.",
   "The agent completes <strong>one real workflow</strong> (e.g., creating a ticket) only <em>after</em> a human approval step, and is blocked from acting if approval is denied.",
   checkpoint="Ask the agent to create a ticket; it must pause for approval before the Power Automate flow runs. Approve it and confirm exactly one ticket appears in the target list. Run it again and deny approval; confirm no ticket is created. If the action fires without waiting, the approval step is missing; add it to the flow before the create-item action.",
   rules="Every action sits behind an explicit approval gate. The agent never executes a state-changing action without a human \"approve\" first."),
 level(5, "The Autonomous Operations Agent", "Advanced", "~3-4 hr", 350,
   "Combine everything into a <strong>department assistant</strong>: multiple tools, multiple workflows, memory, and decision logic. It reads email, creates tickets, schedules meetings, updates a project board, and produces a daily report, orchestrating the steps itself and pausing only at the approval gates you defined. You also write its <em>governance</em>: what it may decide alone, what always needs a human, and how it logs what it did.",
   "agent orchestration, tool calling, context management, AI governance.",
   "The agent runs a <strong>full multi-step business process end to end</strong> with minimal intervention (approvals only at the defined gates) and produces an auditable log of every action it took.",
   checkpoint="Start the daily run; the agent should triage the inbox, create needed tickets (pausing at the approval gate), schedule meetings, update the board, and output a daily report. Open the <strong>action log</strong> and confirm every state-changing step is recorded and every gated action shows an approval. If a step ran that should have been gated, add it to the \"never do this alone\" list and route it through approval.",
   rules="Autonomy is bounded by written governance: defined approval gates, a clear \"never do this alone\" list, and an action log. Nothing ships to real users or real email without sign-off.")
]
phases_html = '\n\n'.join(levels)

# ── Full body ──
body = f'''<body>

    <div class="cf-drafting-table"></div>

    <div class="cf-header">
        <a href="index.html">&larr; PROJECTS</a>
        <span class="cf-header-title">Case File</span>
        <span class="cf-header-ref">AI-AGENT-001</span>
    </div>

    <div class="cf-content">

        <div class="cf-cover">
            <div class="cf-stamp">Classified</div>

            <div class="cf-meta-row">
                <span class="cf-meta-item">Case No: <span class="cf-meta-value">AI-AGENT-001</span></span>
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
            <h1 class="cf-subject">My First Agent</h1>

            <div class="cf-badges">
                <span class="cf-badge cf-badge-diff">Adaptive &middot; L1&ndash;5</span>
                <span class="cf-badge cf-badge-time">30 min &ndash; 4 hr</span>
                <span class="cf-badge cf-badge-xp">250 &ndash; 1500 XP</span>
            </div>
        </div>

        <!-- Mission Brief -->
        <div class="cf-paper has-clip">
            <div class="cf-section-stamp">Mission Brief</div>
            <div class="cf-prose">
                <p>
                    Everyone says "AI agent" like it is magic. It is not. An agent is four things you
                    control: <code>instructions</code> (how it behaves), <code>knowledge</code> (what it
                    knows), <code>actions</code> (what it can do), and <code>boundaries</code> (what it
                    must never do). In this project you build one from scratch and watch it grow from a
                    chatbot into an operator.
                </p>
                <p>
                    This is an <strong>adaptive</strong> project with five levels. Level 1 takes about
                    thirty minutes and needs zero code. Each level after adds one real capability, and
                    you can stop at any level and still have built something that works. The progression
                    is deliberately safe: your agent learns to <em>read</em>, then <em>answer from
                    sources</em>, then <em>draft</em>, then <em>act with approval</em>, and only at the
                    top does it operate on its own inside guardrails you wrote.
                </p>
                <p>
                    You will build in <strong>Microsoft Copilot Studio</strong>, which lets you create an
                    agent by describing what you want in plain language before any code is involved. This
                    is the AI sibling of <em>My First Website</em> and <em>My First App</em>: the same
                    "zero to a real thing in one sitting" path, for the AI stack.
                </p>
            </div>
        </div>

        <!-- Requirements -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Agent Requirements</div>
            <ul class="cf-req-list">
                <li>A Microsoft account with Copilot Studio access (a free trial works for Levels 1&ndash;2)</li>
                <li>A web browser &mdash; no code editor or installs required for the early levels</li>
                <li>The provided sample pack: a help-desk FAQ, policy documents, and a sample inbox (Asset Manifest below)</li>
                <li>No API keys and no real email account &mdash; Levels 1&ndash;3 use sample data only</li>
                <li>No prior AI or programming experience required to start</li>
            </ul>
        </div>

        <!-- Operation Phases (the five levels) -->
        <div class="cf-paper">
            <div class="cf-section-stamp">Operation Phases &mdash; Five Levels</div>

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
                <div class="cf-manifest-item">Help-Desk FAQ (sample)</div>
                <div class="cf-manifest-item">Policy Docs (sample)</div>
                <div class="cf-manifest-item">Sample Inbox</div>
                <div class="cf-manifest-item">Microsoft Graph (L3)</div>
                <div class="cf-manifest-item">Power Automate (L4+)</div>
            </div>
        </div>

        <!-- Expected Outcomes -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Expected Outcomes</div>
            <ul class="cf-debrief-list">
                <li>Agent = instructions + knowledge + actions + boundaries</li>
                <li>Prompt engineering &amp; system instructions</li>
                <li>Retrieval-augmented generation (RAG)</li>
                <li>AI classification &amp; email triage</li>
                <li>Human-in-the-loop approval loops</li>
                <li>Workflow actions (Power Automate)</li>
                <li>Agent orchestration &amp; tool calling</li>
                <li>AI governance &amp; safe autonomy</li>
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
                <a href="ai-rag-chatbot.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">Build a RAG Chatbot</span>
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
    var PROJECT_KEY = 'hex_project_starter-first-agent';
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

    // Apply the saved state to each level card and update the progress bar/count.
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
    <title>CASE FILE: My First Agent | Hexworth Prime</title>
    <style>{css}</style>
</head>
{body}'''

open(OUT, 'w').write(out)
print(f'wrote {OUT} ({len(out)} bytes)')
