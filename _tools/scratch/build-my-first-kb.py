"""
Build _app/projects/starter-first-knowledge-base.html — the AI-house "My First
Knowledge Base" project, adaptive Level 1-5. Sibling of My First Database: the DATA/
grounding layer of the AI stack (RAG). One growing Help-Desk Knowledge Base threads
through all five levels (ingest -> organize -> retrieval quality -> citations/guardrails
-> freshness), keeping the help-desk theme used by My First Agent and My First Workflow.
Clones the case-file format, AI-House purple theme, knowledge-blueprint background, with
self-verify checkpoints + guardrails built in from the start.
"""
import re, urllib.parse

TMPL = '_app/projects/starter-first-app.html'
OUT = '_app/projects/starter-first-knowledge-base.html'

src = open(TMPL).read()
css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)

# Background: a RAG blueprint (documents -> chunks -> vectors -> retrieve -> grounded answer + cite).
kb_svg = (
"<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='800' fill='none' stroke='#8b5cf6'>"
# left: source documents stack
"<rect x='20' y='40' width='130' height='150' rx='2' stroke-width='1.5' opacity='0.16'/>"
"<text x='26' y='56' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.22'>SOURCES</text>"
"<line x1='20' y1='62' x2='150' y2='62' stroke-width='1' opacity='0.14'/>"
"<rect x='30' y='72' width='110' height='16' rx='2' stroke-width='1.2' opacity='0.18' fill='#8b5cf6' fill-opacity='0.06'/><text x='36' y='84' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.16'>faq.pdf</text>"
"<rect x='30' y='92' width='110' height='16' rx='2' stroke-width='1.2' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/><text x='36' y='104' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>policy.md</text>"
"<rect x='30' y='112' width='110' height='16' rx='2' stroke-width='1.2' opacity='0.14' fill='#8b5cf6' fill-opacity='0.04'/><text x='36' y='124' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>how-to.docx</text>"
"<text x='30' y='150' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>chunk + embed</text>"
"<line x1='85' y1='154' x2='85' y2='172' stroke-width='1' opacity='0.12'/><polygon points='85,178 80,168 90,168' fill='#8b5cf6' stroke='none' opacity='0.14'/>"
# left: chunk grid
"<text x='26' y='220' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>CHUNKS</text>"
"<g opacity='0.14'>"
"<rect x='26' y='228' width='28' height='18' rx='2' stroke-width='1' fill='#8b5cf6' fill-opacity='0.05'/><rect x='58' y='228' width='28' height='18' rx='2' stroke-width='1' fill='#8b5cf6' fill-opacity='0.05'/><rect x='90' y='228' width='28' height='18' rx='2' stroke-width='1' fill='#8b5cf6' fill-opacity='0.05'/>"
"<rect x='26' y='250' width='28' height='18' rx='2' stroke-width='1' fill='#8b5cf6' fill-opacity='0.05'/><rect x='58' y='250' width='28' height='18' rx='2' stroke-width='1' fill='#8b5cf6' fill-opacity='0.05'/><rect x='90' y='250' width='28' height='18' rx='2' stroke-width='1' fill='#8b5cf6' fill-opacity='0.05'/>"
"</g>"
# left: vector space scatter
"<rect x='20' y='300' width='130' height='110' rx='3' stroke-width='1.5' opacity='0.16'/>"
"<text x='26' y='318' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.18'>VECTOR SPACE</text>"
"<g fill='#8b5cf6' stroke='none'>"
"<circle cx='40' cy='340' r='2.5' opacity='0.18'/><circle cx='70' cy='355' r='2.5' opacity='0.16'/><circle cx='100' cy='335' r='2.5' opacity='0.14'/><circle cx='120' cy='370' r='2.5' opacity='0.12'/><circle cx='55' cy='385' r='2.5' opacity='0.1'/><circle cx='90' cy='378' r='2.5' opacity='0.12'/>"
"<circle cx='80' cy='360' r='5' opacity='0.22'/>"
"</g>"
"<text x='86' y='362' font-family='monospace' font-size='6' fill='#8b5cf6' stroke='none' opacity='0.16'>query</text>"
# right: retrieve -> generate -> cite
"<rect x='870' y='40' width='120' height='240' rx='2' stroke-width='1.5' opacity='0.16'/>"
"<text x='880' y='58' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.22'>RAG</text>"
"<line x1='870' y1='64' x2='990' y2='64' stroke-width='1' opacity='0.14'/>"
"<rect x='895' y='74' width='70' height='18' rx='2' stroke-width='1' opacity='0.18' fill='#8b5cf6' fill-opacity='0.06'/><text x='903' y='87' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.2'>QUESTION</text>"
"<line x1='930' y1='92' x2='930' y2='106' stroke-width='1' opacity='0.14'/>"
"<rect x='895' y='106' width='70' height='18' rx='2' stroke-width='1' opacity='0.16' fill='#8b5cf6' fill-opacity='0.05'/><text x='903' y='119' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.16'>RETRIEVE</text>"
"<line x1='930' y1='124' x2='930' y2='138' stroke-width='1' opacity='0.12'/>"
"<rect x='895' y='138' width='70' height='18' rx='2' stroke-width='1' opacity='0.14' fill='#8b5cf6' fill-opacity='0.04'/><text x='903' y='151' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.14'>GROUND</text>"
"<line x1='930' y1='156' x2='930' y2='170' stroke-width='1' opacity='0.1'/>"
"<rect x='895' y='170' width='70' height='18' rx='2' stroke-width='1' opacity='0.12' fill='#8b5cf6' fill-opacity='0.05'/><text x='905' y='183' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>ANSWER</text>"
"<line x1='930' y1='188' x2='930' y2='202' stroke-width='1' opacity='0.1'/>"
"<rect x='895' y='202' width='70' height='18' rx='2' stroke-width='1' opacity='0.1' fill='#8b5cf6' fill-opacity='0.04'/><text x='903' y='215' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.1'>[CITE src]</text>"
# right: freshness refresh cycle
"<text x='880' y='320' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.2'>FRESHNESS</text>"
"<path d='M905 360 A25 25 0 1 1 904 360' stroke-width='1.5' opacity='0.16'/>"
"<polygon points='904,360 898,352 910,352' fill='#8b5cf6' stroke='none' opacity='0.16'/>"
"<text x='894' y='400' font-family='monospace' font-size='7' fill='#8b5cf6' stroke='none' opacity='0.12'>re-index</text>"
# center: capability ladder
"<rect x='380' y='100' width='240' height='180' rx='3' stroke-width='2' opacity='0.18'/>"
"<line x1='380' y1='120' x2='620' y2='120' stroke-width='1.5' opacity='0.16'/>"
"<text x='415' y='114' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.2'>CAPABILITY LADDER</text>"
"<text x='400' y='150' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.18'>1 INGEST</text>"
"<text x='400' y='172' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.16'>2 ORGANIZE</text>"
"<text x='400' y='194' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.14'>3 RETRIEVAL</text>"
"<text x='400' y='216' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.12'>4 CITATIONS</text>"
"<text x='400' y='238' font-family='monospace' font-size='10' fill='#8b5cf6' stroke='none' opacity='0.1'>5 FRESHNESS</text>"
# center: doc-to-answer flow nodes
"<circle cx='500' cy='430' r='20' stroke-width='2' opacity='0.18'/><text x='484' y='434' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.18'>DOCS</text>"
"<circle cx='630' cy='400' r='16' stroke-width='1.5' opacity='0.14'/><text x='612' y='404' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.12'>index</text>"
"<circle cx='650' cy='490' r='17' stroke-width='1.5' opacity='0.12'/><text x='628' y='494' font-family='monospace' font-size='8' fill='#8b5cf6' stroke='none' opacity='0.1'>answer</text>"
"<line x1='520' y1='425' x2='614' y2='403' stroke-width='1.5' opacity='0.14'/><line x1='514' y1='443' x2='635' y2='483' stroke-width='1.2' opacity='0.12'/>"
"<text x='40' y='460' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.1' transform='rotate(-8 40 460)'>retrieve then generate</text>"
"<text x='560' y='560' font-family='monospace' font-size='9' fill='#8b5cf6' stroke='none' opacity='0.09'>grounded + cited</text>"
"<line x1='0' y1='560' x2='400' y2='300' stroke-width='1.2' opacity='0.06' stroke-dasharray='10 14'/>"
"<line x1='700' y1='0' x2='1000' y2='220' stroke-width='1.2' opacity='0.05' stroke-dasharray='8 12'/>"
"</svg>"
)
kb_uri = "data:image/svg+xml," + urllib.parse.quote(kb_svg)
css = re.sub(r'background-image: url\("data:image/svg\+xml,.*?"\);',
             f'background-image: url("{kb_uri}");', css, count=1, flags=re.S)

for a, b in [('#4ade80', '#8b5cf6'), ('rgba(74, 222, 128,', 'rgba(139, 92, 246,'),
             ('rgba(74,222,128,', 'rgba(139,92,246,'), ('#22c55e', '#a78bfa'),
             ('rgba(34, 197, 94,', 'rgba(139, 92, 246,'), ('#0d1a12', '#170d22'), ('#0a1410', '#120a1a')]:
    css = css.replace(a, b)
css = css.replace('/* Blueprint sketches layer — Python/quiz app theme */',
                  '/* Blueprint sketches layer: knowledge-base / RAG theme */')
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

# One level card; checkpoint required, rules optional.
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

# Five levels grow ONE Help-Desk Knowledge Base.
levels = [
 level(1, "Ingest One Source", "Beginner", "~30 min", 250,
   "Create your first knowledge base from <strong>one document</strong> (the help-desk FAQ) in Copilot Studio's knowledge feature. Connect it so an assistant answers questions <em>grounded</em> in that document instead of guessing. This is <strong>retrieval-augmented generation (RAG)</strong> at its simplest: the AI looks up the answer in your source before it replies.",
   "knowledge sources, grounding, basic RAG, document ingestion.",
   "The assistant answers a question using the FAQ's content (not generic advice) and says \"that's not in my knowledge base\" for a topic the FAQ doesn't cover.",
   checkpoint="Ask a question the FAQ answers (\"how do I reset my password?\"); the reply should match the FAQ's wording, not generic web advice. Then ask something the FAQ does not cover; it should decline rather than invent. If it invents answers, confirm the document is attached as a knowledge source and the \"answer only from sources\" grounding setting is on."),
 level(2, "Organize Many Sources", "Beginner+", "~45 min", 250,
   "Grow the base to <strong>several documents</strong> (FAQ + policy + a how-to guide). Give each a clear title and tags so retrieval pulls from the <em>right</em> source, and handle overlap: when two documents touch the same topic, the answer should be coherent, not contradictory.",
   "multi-document knowledge bases, titles and tags, source organization, handling overlap.",
   "A question answerable only in the policy doc pulls from the policy doc, and a how-to question pulls from the how-to: the correct source each time.",
   checkpoint="Ask one question whose answer lives only in the policy doc and one only in the how-to. Confirm each answer comes from the correct source (check the cited document). If answers blend or pull the wrong source, sharpen the document titles and tags so the topics are clearly distinct, then re-test."),
 level(3, "Retrieval Quality", "Intermediate", "~1 hr", 300,
   "Look under the hood. Documents are split into <strong>chunks</strong> and stored as <strong>embeddings</strong> (vectors); the base retrieves the chunks closest to the question. When answers are vague or off, the cause is usually chunking, too big, too small, or split mid-topic. Tune chunk size and add clear headings so the right passage is retrieved.",
   "chunking, embeddings, vector retrieval, retrieval tuning.",
   "A question that previously returned a vague or wrong answer now retrieves the correct passage and answers precisely.",
   checkpoint="Find a question your base answers poorly and inspect which passage it retrieved (use the tool's citation / retrieval view). Restructure the source, clear headings, right-sized sections, so the full answer lives in one chunk, then re-index. Confirm the same question now retrieves the correct passage. If it still misses, the answer is being split across two chunks, keep it together in one section."),
 level(4, "Citations and Grounding Guardrails", "Intermediate+", "~1.5 hr", 350,
   "Make the base <strong>trustworthy</strong>. Configure it to <em>cite the source</em> for every answer and to refuse or escalate when it cannot find grounding, instead of hallucinating. This is the anti-hallucination layer that makes a knowledge base safe to put in front of real users.",
   "citations, grounding thresholds, refusal and escalation, anti-hallucination.",
   "Every answer shows a source citation, and an out-of-scope question yields an honest \"I don't have that in my sources\" plus an escalation path, not a fabricated answer.",
   checkpoint="Ask three in-scope questions and confirm each answer includes a working citation you can open to the source. Then ask a plausible but out-of-scope question (\"what is our VPN vendor's stock price?\") and confirm it declines or escalates rather than inventing. If it fabricates, raise the grounding requirement and add an explicit \"only answer from sources, otherwise say you don't know\" instruction.",
   rules="The base must cite its source and must say \"I don't know / let me escalate\" when the answer is not in the sources. It must never present an ungrounded guess as fact.")
,
 level(5, "Freshness and Maintenance", "Advanced", "~2 hr", 350,
   "Keep it current. Stale knowledge is worse than none, it confidently gives outdated answers. Build a refresh process: re-index when a source changes, date and version your documents, retire stale ones, and optionally automate the refresh on a schedule (tie it to the Power Automate flow from My First Workflow).",
   "re-indexing, versioning, freshness and staleness, knowledge-base maintenance, automation.",
   "Updating a source document changes the assistant's answer after re-index, and a retired document no longer surfaces in answers.",
   checkpoint="Note the current answer to a question, edit the source document to change that answer, and re-index the base. Ask the same question and confirm the answer now reflects the edit, not the old value. Then retire/remove a document and confirm its content no longer appears in answers. If the old answer persists, the base did not re-index, trigger a manual re-index or wire the refresh into a scheduled flow.",
   rules="Outdated information must not persist: changed sources get re-indexed and stale documents retired, so the base reflects current truth, not last month's.")
]
phases_html = '\n\n'.join(levels)

body = f'''<body>

    <div class="cf-drafting-table"></div>

    <div class="cf-header">
        <a href="index.html">&larr; PROJECTS</a>
        <span class="cf-header-title">Case File</span>
        <span class="cf-header-ref">AI-KB-001</span>
    </div>

    <div class="cf-content">

        <div class="cf-cover">
            <div class="cf-stamp">Classified</div>

            <div class="cf-meta-row">
                <span class="cf-meta-item">Case No: <span class="cf-meta-value">AI-KB-001</span></span>
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
            <h1 class="cf-subject">My First Knowledge Base</h1>

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
                    A knowledge base is the <em>grounded memory</em> an AI answers from. Without one, a
                    model guesses from training data and sometimes confidently makes things up. With one,
                    it does <code>retrieve</code> then <code>generate</code>: look up the relevant passage
                    in <em>your</em> sources first, then answer from it, with a citation. This is the data
                    layer of the AI stack, the natural sibling of My First Database.
                </p>
                <p>
                    You will build one real base and grow it across five levels: a
                    <strong>Help-Desk Knowledge Base</strong> (the same help-desk world as My First Agent
                    and My First Workflow). Level 1 grounds an assistant in a single document in about
                    thirty minutes. Each level adds one capability to the <em>same</em> base: more sources
                    organized cleanly, then retrieval quality (chunking and embeddings), then citations and
                    anti-hallucination guardrails, and finally freshness so it never serves stale answers.
                </p>
                <p>
                    The throughline is trust. A base that cites its sources, says "I don't know" when it
                    should, and stays current is one you can safely put in front of real users. By the end
                    you will understand exactly why RAG beats a bare model, and how each piece, ingestion,
                    retrieval, grounding, and freshness, earns that trust.
                </p>
            </div>
        </div>

        <!-- Requirements -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Agent Requirements</div>
            <ul class="cf-req-list">
                <li>A Microsoft account with Copilot Studio access (a free trial works for Levels 1&ndash;2)</li>
                <li>A web browser &mdash; the base is built in the maker portal, no installs or code</li>
                <li>The provided sample sources: a help-desk FAQ, a policy document, and a how-to guide</li>
                <li>Optionally, the Power Automate flow from My First Workflow (for the Level 5 scheduled refresh)</li>
                <li>No prior AI, database, or programming experience required to start</li>
            </ul>
        </div>

        <!-- Operation Phases (the five levels) -->
        <div class="cf-paper">
            <div class="cf-section-stamp">Operation Phases &mdash; Five Levels, One Growing Base</div>

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
                <div class="cf-manifest-item">Policy Document (sample)</div>
                <div class="cf-manifest-item">How-To Guide (sample)</div>
                <div class="cf-manifest-item">Citations / grounding settings</div>
                <div class="cf-manifest-item">Power Automate refresh (L5)</div>
            </div>
        </div>

        <!-- Expected Outcomes -->
        <div class="cf-paper has-tape">
            <div class="cf-section-stamp">Expected Outcomes</div>
            <ul class="cf-debrief-list">
                <li>Retrieval-augmented generation (RAG)</li>
                <li>Document ingestion &amp; grounding</li>
                <li>Multi-source organization &amp; tagging</li>
                <li>Chunking, embeddings &amp; retrieval tuning</li>
                <li>Citations &amp; anti-hallucination guardrails</li>
                <li>Freshness, versioning &amp; re-indexing</li>
                <li>Knowledge-base maintenance</li>
                <li>Why RAG beats a bare model</li>
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
                <a href="ai-rag-chatbot.html" class="cf-training-card">
                    <span class="tc-district">AI House</span>
                    <span class="tc-title">Build a RAG Chatbot</span>
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
    var PROJECT_KEY = 'hex_project_starter-first-knowledge-base';
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
    <title>CASE FILE: My First Knowledge Base | Hexworth Prime</title>
    <style>{css}</style>
</head>
{body}'''

open(OUT, 'w').write(out)
print(f'wrote {OUT} ({len(out)} bytes)')
