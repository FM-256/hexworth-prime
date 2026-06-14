"""Render the Hexworth PhD intake-answers markdown to a branded PDF — reuses the ALA
walkthrough-PDF look (indigo accents, running header, page-numbered footer) from
build-ala-pdfs.py. Sibling tool to that one.

Usage:  python3 render-intake-pdf.py [path/to/answers.md]
        (no arg = the default intake-answers doc in the shared PHD folder)
Output: a sibling .pdf next to the .md.

Requires: weasyprint, markdown (both present in the repo's python env).
"""
import os, re, sys, html, markdown
from weasyprint import HTML

DEFAULT_MD = os.path.expanduser(
    '~/hexworth-shared/Raw sources/PHD/software design/Hexworth_Intake_Answers.md')
MD = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_MD

# Branded stylesheet — indigo accent, Letter, running header from the H1, footer page count.
CSS = """
@page {
    size: Letter; margin: 22mm 18mm 20mm 18mm;
    @top-center { content: string(doctitle); font-family: 'Helvetica Neue', Arial, sans-serif;
                  font-size: 8pt; color: #94a3b8; padding-bottom: 4pt; }
    @bottom-left { content: 'Hexworth Prime  ·  TIM-8340 Intake  ·  Category-level only';
                   font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 7.5pt; color: #94a3b8; }
    @bottom-right { content: 'Page ' counter(page) ' of ' counter(pages);
                    font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 7.5pt; color: #94a3b8; }
}
@page :first { @top-center { content: none; } }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; line-height: 1.55; color: #1e293b; }
.cover { page-break-after: always; padding-top: 30mm; }
.cover-bar { height: 6px; background: #4f46e5; width: 100%; margin-bottom: 26pt; }
.cover-kicker { font-size: 10pt; letter-spacing: 0.18em; text-transform: uppercase; color: #4f46e5; font-weight: 700; }
.cover-title { font-size: 30pt; font-weight: 800; color: #0f172a; line-height: 1.15; margin: 10pt 0 6pt; }
.cover-sub { font-size: 12pt; color: #475569; margin-bottom: 30pt; }
.cover-meta { border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; border-collapse: collapse; }
.cover-meta td { padding: 9pt 14pt; border-bottom: 1px solid #eef2f7; font-size: 10.5pt; }
.cover-meta tr:last-child td { border-bottom: none; }
.cover-meta .k { color: #64748b; font-weight: 600; width: 32%; text-transform: uppercase; letter-spacing: 0.04em; font-size: 8.5pt; }
.cover-meta .v { color: #0f172a; font-weight: 600; }
.cover-note { margin-top: 26pt; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10pt; }
h1 { string-set: doctitle content(); font-size: 0; margin: 0; }
h2 { font-size: 15pt; color: #0f172a; font-weight: 800; margin: 20pt 0 8pt; padding-bottom: 5pt; border-bottom: 2px solid #4f46e5; }
h3 { font-size: 12pt; color: #4f46e5; font-weight: 700; margin: 14pt 0 6pt; }
p { margin: 6pt 0; }
strong { color: #0f172a; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 16pt 0; }
ul, ol { margin: 6pt 0 6pt 4pt; padding-left: 18pt; }
li { margin: 3pt 0; }
code { font-family: 'SFMono-Regular','Consolas',monospace; font-size: 9pt; background: #eef2f7; color: #b91c1c; padding: 1pt 4pt; border-radius: 3px; }
em { color: #475569; }
"""

raw = open(MD, encoding='utf-8').read()
lines = raw.splitlines()
# H1 (first '# ...') drives the running header; '—' splits a title/subtitle if present.
title = next((re.match(r'#\s+(.*)', l).group(1).strip() for l in lines if re.match(r'#\s+', l)), 'Hexworth Prime')
main = title.split('—', 1)[0].strip() if '—' in title else title

# Body = the markdown minus the leading H1 line and the immediately-following *italic* subtitle
# line (those are reproduced on the cover, so we don't repeat them at the top of page 2).
body_md = re.sub(r'^#\s+.*\n', '', raw, count=1)
body_md = re.sub(r'^\s*\*[^\n]*\*\s*\n', '', body_md, count=1)
body_html = markdown.markdown(body_md, extensions=['fenced_code', 'tables', 'sane_lists'])

doc = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<h1>{html.escape(main)}</h1>
<div class="cover">
  <div class="cover-bar"></div>
  <div class="cover-kicker">Hexworth Prime · PhD Intake</div>
  <div class="cover-title">Intake Checklist Answers</div>
  <div class="cover-sub">Platform facts anchoring the TIM-8340 Week 1 paper — traditional vs. security-integrated software practice</div>
  <table class="cover-meta">
    <tr><td class="k">Prepared</td><td class="v">2026-06-14</td></tr>
    <tr><td class="k">Subject</td><td class="v">Hexworth Prime (running example)</td></tr>
    <tr><td class="k">Source</td><td class="v">Hexworth_Intake_Checklist.pdf</td></tr>
    <tr><td class="k">Scope</td><td class="v">Category-level only · grounded in the live codebase</td></tr>
  </table>
  <div class="cover-note">Category-level descriptions only — no real student names/emails/records, no
  credentials/API keys/secrets, no real telemetry values, and no live tenant names. Items not
  confirmable from the codebase are marked [Assumption].</div>
</div>
{body_html}
</body></html>"""

out = os.path.splitext(MD)[0] + '.pdf'
HTML(string=doc).write_pdf(out)
print(f"wrote {out} ({os.path.getsize(out)//1024} KB)")
