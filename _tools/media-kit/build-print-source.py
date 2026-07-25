#!/usr/bin/env python3
"""
Regenerable source for the Hexworth Prime media-kit PDF.
Fixes the "content cut off between pages" defect: the previous PDF was an ad-hoc
headless-chrome print of an uncommitted page with NO print CSS, so cards split across
A4 boundaries and the last page was a near-empty void. This builds explicit A4 `.page`
containers (break-after: always; last page break-after: avoid) with break-inside:avoid
cards, and embeds the brand assets as data URIs so the source is self-contained and
re-renderable anywhere.

Usage:
  python3 _tools/media-kit/build-print-source.py         # writes media-kit-print.html
  node   _tools/media-kit/render-pdf.js                   # renders -> _app/assets/media/hexworth-media-kit.pdf
"""
import base64, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
BRAND = ROOT / "_app/assets/media/brand"
OUT = pathlib.Path(__file__).resolve().parent / "media-kit-print.html"

def uri(name):
    p = BRAND / name
    mime = "image/png" if p.suffix == ".png" else ("image/jpeg" if p.suffix in (".jpg", ".jpeg") else "image/svg+xml")
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()

IMG = {
    "emblem": uri("emblem-cyan-1200.png"),
    "mark": uri("mark-cyan-512.png"),
    "markw": uri("mark-white-512.png"),
    "markb": uri("mark-black-512.png"),
    "mono": uri("monogram-cyan-512.png"),
    "badge": uri("social-badge.png"),
}

CSS = """
@page { size: A4; margin: 0; }
* { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
:root{ --bg:#0a0c16; --panel:#12151f; --panel2:#171b28; --line:#232838;
  --cyan:#22d3ee; --violet:#8b5cf6; --text:#e9edf4; --muted:#8b95a8; --gold:#f5c451; }
html,body{ background:var(--bg); color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; line-height:1.5; }
.page{ position:relative; width:210mm; min-height:297mm; padding:17mm 18mm 15mm; background:var(--bg);
  page-break-after:always; break-after:page; overflow:hidden;
  background-image:radial-gradient(900px 420px at 78% -8%, #161d30 0, rgba(10,12,22,0) 62%); }
.page:last-child{ page-break-after:avoid; break-after:auto; }
.eyebrow{ font-size:8.5pt; letter-spacing:.34em; text-transform:uppercase; color:var(--cyan); font-weight:700; }
h1{ font-size:40pt; letter-spacing:-.5pt; line-height:1.02; margin:5pt 0 8pt; }
h2{ font-size:20pt; line-height:1.12; margin:2pt 0 10pt; }
h3{ font-size:11.5pt; margin:0 0 3pt; }
p{ font-size:10.5pt; color:#d3dae6; }
.muted{ color:var(--muted); }
.phead{ display:flex; align-items:center; justify-content:space-between;
  border-bottom:1px solid var(--line); padding-bottom:9pt; margin-bottom:16pt; }
.phead .id{ display:flex; align-items:center; gap:9pt; }
.phead img{ width:20pt; height:20pt; }
.phead .id b{ font-size:8.5pt; letter-spacing:.26em; text-transform:uppercase; color:var(--muted); font-weight:700; }
.sec-num{ font-size:8.5pt; letter-spacing:.26em; text-transform:uppercase; color:var(--cyan); font-weight:700; }
.pfoot{ position:absolute; left:18mm; right:18mm; bottom:11mm; display:flex; justify-content:space-between;
  font-size:8pt; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); border-top:1px solid var(--line); padding-top:7pt; }
.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:11pt; }
.grid3{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:11pt; }
.grid4{ display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:9pt; }
.card{ background:var(--panel); border:1px solid var(--line); border-radius:9pt; padding:13pt 14pt; break-inside:avoid; }
.card .k{ font-size:7.5pt; letter-spacing:.18em; text-transform:uppercase; color:var(--cyan); font-weight:700; }
.card h3{ margin-top:5pt; }
.card p{ font-size:9.5pt; color:var(--muted); margin-top:4pt; }
.stat{ text-align:left; }
.stat .n{ font-size:26pt; font-weight:800; color:#fff; line-height:1; }
.stat .l{ font-size:7.5pt; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-top:5pt; }
.pill{ display:inline-block; border:1px solid var(--line); background:var(--panel2); border-radius:20pt;
  padding:5pt 12pt; font-size:9pt; margin:0 5pt 7pt 0; color:#d3dae6; }
.pill.cyan{ border-color:rgba(34,211,238,.4); color:var(--cyan); }
.layer{ background:var(--panel); border:1px solid var(--line); border-radius:9pt; padding:14pt 16pt; margin-bottom:11pt; break-inside:avoid; }
.layer .k{ font-size:8pt; letter-spacing:.2em; text-transform:uppercase; color:var(--cyan); font-weight:700; }
.layer h3{ font-size:15pt; margin:3pt 0 9pt; }
ul.opps{ list-style:none; }
ul.opps li{ font-size:10.5pt; padding:8pt 0; border-bottom:1px solid var(--line); color:#d8dfea; }
ul.opps li::before{ content:""; display:inline-block; width:6pt; height:6pt; border-radius:50%;
  background:var(--violet); margin-right:11pt; vertical-align:middle; }
.swatchrow{ display:grid; grid-template-columns:repeat(4,1fr); gap:10pt; }
.swatch{ border:1px solid var(--line); border-radius:8pt; overflow:hidden; }
.swatch .chip{ height:48pt; }
.swatch .lab{ padding:7pt 9pt; font-size:8pt; }
.swatch .lab b{ display:block; font-size:9.5pt; }
.logobox{ border:1px solid var(--line); border-radius:9pt; display:flex; align-items:center; justify-content:center; height:120pt; }
"""

def phead(label):
    return f'<div class="phead"><div class="id"><img src="{IMG["mark"]}" alt=""><b>Hexworth Prime &middot; Media Kit</b></div><div class="sec-num">{label}</div></div>'

def pfoot(n):
    return f'<div class="pfoot"><span>hexworth.com</span><span>frank@hexworth.com</span><span>{n:02d}</span></div>'

# ---- COVER ----
cover = f'''<div class="page" style="display:flex;flex-direction:column;justify-content:center;">
  <img src="{IMG["emblem"]}" alt="Hexworth Prime" style="width:118mm;max-width:70%;margin:0 auto 14mm;display:block;">
  <div style="text-align:center;">
    <div class="eyebrow">Enterprise Media Kit &middot; 2026</div>
    <h1 style="font-size:46pt;">Hexworth Prime</h1>
    <p style="font-size:13pt;max-width:135mm;margin:6pt auto 0;color:#c7cfdc;">The AI-powered technology education ecosystem where learning, labs, and careers connect.</p>
    <p class="muted" style="font-size:9.5pt;margin-top:8pt;">Prepared for enterprise partners, publishers &amp; sponsors.</p>
  </div>
  <div style="position:absolute;left:18mm;right:18mm;bottom:16mm;display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:9pt;font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);">
    <span>hexworth.com</span><span>frank@hexworth.com</span><span>Join our Discord</span></div>
</div>'''

# ---- P2 ABOUT ----
p2 = f'''<div class="page">{phead("01 &middot; About")}
  <h2>An integrated technology ecosystem, not just another course platform.</h2>
  <p style="max-width:150mm;">Hexworth is an AI-powered technology education platform built for practical learning. Rather than separating education, hands-on practice, and career preparation, Hexworth integrates them into a single connected ecosystem spanning cybersecurity, AI, Linux, networking, cloud, and programming.</p>
  <div class="grid3" style="margin-top:16pt;">
    <div class="card"><div class="k">01 / Learn</div><h3>AI-Assisted Education</h3><p>Instruction and mentoring powered by AI, grounded in real engineering practice, teach rather than hype.</p></div>
    <div class="card"><div class="k">02 / Build</div><h3>Immersive Labs &amp; CTFs</h3><p>Interactive laboratories and cybersecurity challenges that turn theory into hands-on capability.</p></div>
    <div class="card"><div class="k">03 / Advance</div><h3>Career Development</h3><p>Certification prep, documentation, and career services that connect learning to real outcomes.</p></div>
  </div>
  <div class="grid4" style="margin-top:20pt;">
    <div class="stat"><div class="n">3,500+</div><div class="l">Interactive modules</div></div>
    <div class="stat"><div class="n">12</div><div class="l">Learning houses</div></div>
    <div class="stat"><div class="n">120+</div><div class="l">CTF boxes</div></div>
    <div class="stat"><div class="n" style="color:var(--cyan)">Zero-install</div><div class="l">Browser-based</div></div>
  </div>
  {pfoot(2)}</div>'''

# ---- P3 MISSION / VISION ----
p3 = f'''<div class="page">{phead("02 &middot; Mission &amp; Vision")}
  <div class="grid2">
    <div class="card" style="padding:18pt;"><div class="k">Mission</div><p style="color:#d8dfea;font-size:11pt;margin-top:7pt;">To empower individuals and organizations to develop practical technology skills through AI-assisted learning, immersive laboratories, cybersecurity challenges, career development, and real-world engineering experiences.</p></div>
    <div class="card" style="padding:18pt;border-color:rgba(139,92,246,.4);"><div class="k" style="color:var(--violet)">Vision</div><p style="color:#d8dfea;font-size:11pt;margin-top:7pt;">To become the leading AI-powered technology education ecosystem where learning, building, experimentation, certification, and career growth exist within one connected platform.</p></div>
  </div>
  <div class="sec-num" style="margin:22pt 0 11pt;">Core Values</div>
  <div>{''.join(f'<span class="pill">{v}</span>' for v in ["Learning","Engineering","Curiosity","Integrity","Security","Community","Innovation","Excellence"])}</div>
  {pfoot(3)}</div>'''

# ---- P4 ECOSYSTEM ----
def layer(k, title, items):
    return f'<div class="layer"><div class="k">{k}</div><h3>{title}</h3><div>{"".join(f"<span class=pill>{i}</span>" for i in items)}</div></div>'
p4 = f'''<div class="page">{phead("03 &middot; Platform Ecosystem")}
  <h2>One connected platform</h2>
  {layer("Layer 01", "Learn", ["12 themed houses","3,500+ interactive modules","12 AI house advisors","Certification-aligned paths"])}
  {layer("Layer 02", "Build", ["Hands-on labs","120+ CTF boxes","120 Dojo challenges","200+ portfolio projects"])}
  {layer("Layer 03", "Advance", ["Career Launchpad","Server-graded assessments","Live tournaments","Community"])}
  {pfoot(4)}</div>'''

# ---- P5 TECH AREAS + AUDIENCE ----
tech = ["Artificial Intelligence","Cybersecurity","Linux","Networking","Cloud Computing","Windows Admin","Programming","Python","DevOps","Infrastructure","Career Development","Certification Prep","Enterprise Technology","+ Expanding continuously"]
aud = [("01","Students & Career Changers","Learners building technology skills and pivoting into technical careers."),
       ("02","Educators & Universities","Instructors and institutions integrating labs and curriculum."),
       ("03","IT & Security Professionals","Practitioners advancing skills in cybersecurity, cloud, and infrastructure."),
       ("04","Developers","Engineers deepening programming, DevOps, and AI capability."),
       ("05","Veterans & Workforce Dev","Programs reskilling talent for the technology workforce."),
       ("06","Enterprise Learning Teams","Organizations upskilling at scale with measurable outcomes.")]
p5 = f'''<div class="page">{phead("04 &middot; Technology &amp; Audience")}
  <div class="sec-num">Where Hexworth teaches</div>
  <div style="margin:9pt 0 16pt;">{''.join(f'<span class="pill cyan">{t}</span>' for t in tech)}</div>
  <div class="sec-num">Who learns on Hexworth</div>
  <div class="grid3" style="margin-top:9pt;">
    {''.join(f'<div class="card"><div class="k">{n}</div><h3 style="font-size:10.5pt">{t}</h3><p>{d}</p></div>' for n,t,d in aud)}
  </div>
  {pfoot(5)}</div>'''

# ---- P6 WHY PARTNER ----
why = [("01","Evidence-based & credible","We explain rather than hype and demonstrate through evidence: clarity over buzzwords, no clickbait."),
       ("02","One integrated ecosystem","Education, AI-assisted learning, hands-on labs, and careers live in one connected platform, deeper reach for partners."),
       ("03","Engaged technical audience","Students, practitioners, and enterprise teams actively building real cybersecurity, cloud, and AI skills."),
       ("04","Enterprise-ready for teams","Certification-aligned pathways, curriculum-ready content, and instructor-led cohort management designed for organizations at scale.")]
p6 = f'''<div class="page">{phead("05 &middot; Why Partner")}
  <h2>Built on credibility, not hype</h2>
  <div class="grid2" style="margin-top:6pt;">
    {''.join(f'<div class="card"><div class="k">{n}</div><h3>{t}</h3><p>{d}</p></div>' for n,t,d in why)}
  </div>
  {pfoot(6)}</div>'''

# ---- P7 PARTNERSHIP + CONTACT ----
opps = ["Affiliate partnerships & educational reviews","Hardware & software product evaluations","Guest content & technical workshops","Cloud credits & infrastructure partnerships","Certification & curriculum partnerships","Sponsorships, grants & research collaborations","Campus partnerships & developer advocacy"]
who = ["Cloud & infrastructure providers","Security tooling vendors","Certification bodies","Technical publishers","Hardware & device makers","Universities & workforce programs"]
p7 = f'''<div class="page">{phead("06 &middot; Partnership")}
  <h2>Ways to collaborate</h2>
  <ul class="opps">{''.join(f'<li>{o}</li>' for o in opps)}</ul>
  <div class="sec-num" style="margin:16pt 0 9pt;">Who we're looking to work with</div>
  <div class="grid3">{''.join(f'<div class="card" style="padding:10pt 12pt;text-align:center;font-size:9.5pt;color:#d8dfea;">{w}</div>' for w in who)}</div>
  <p class="muted" style="margin-top:14pt;font-style:italic;">We're actively building partnerships across these categories. To explore working together, reach out at frank@hexworth.com.</p>
  {pfoot(7)}</div>'''

# ---- P8 BRAND ----
colors = [("Cyan","#22D3EE","Primary"),("Violet","#8B5CF6","Secondary"),("Void","#0A0C16","Background"),("Ink","#E9EDF4","Text")]
p8 = f'''<div class="page">{phead("07 &middot; Brand Assets")}
  <h2>Logo &amp; identity</h2>
  <p class="muted" style="max-width:150mm;">Cyan is the canonical brand color. Use the mark on dark backgrounds (cyan or white) and the black mark on light backgrounds. Keep clear space of at least the height of the hexagon around the mark. Full asset pack (PNG sizes + social frames) available at hexworth.com/brand.</p>
  <div class="grid4" style="margin-top:14pt;">
    <div class="logobox" style="background:#0c0e18;"><img src="{IMG["mark"]}" style="height:70pt;" alt="mark cyan"></div>
    <div class="logobox" style="background:#0c0e18;"><img src="{IMG["markw"]}" style="height:70pt;" alt="mark white"></div>
    <div class="logobox" style="background:#f4f5f8;"><img src="{IMG["markb"]}" style="height:70pt;" alt="mark black"></div>
    <div class="logobox" style="background:#0c0e18;"><img src="{IMG["mono"]}" style="height:70pt;" alt="HP monogram"></div>
  </div>
  <div class="sec-num" style="margin:20pt 0 10pt;">Palette</div>
  <div class="swatchrow">
    {''.join(f'<div class="swatch"><div class="chip" style="background:{hexv}"></div><div class="lab"><b>{nm}</b><span class="muted">{hexv} &middot; {role}</span></div></div>' for nm,hexv,role in colors)}
  </div>
  <div style="margin-top:22pt;text-align:center;">
    <img src="{IMG["badge"]}" style="height:46pt;" alt="Powered by Hexworth Prime">
  </div>
  {pfoot(8)}</div>'''

HTML = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Hexworth Prime Media Kit</title><style>{CSS}</style></head>
<body>{cover}{p2}{p3}{p4}{p5}{p6}{p7}{p8}</body></html>'''

OUT.write_text(HTML)
print(f"wrote {OUT} ({len(HTML)//1024} KB, 8 pages)")
