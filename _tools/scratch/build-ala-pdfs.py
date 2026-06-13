"""
Convert the ALA (CTS4321C Advanced Linux Administration) markdown walkthroughs into
professional, branded instructor PDFs via python-markdown -> branded HTML/CSS -> WeasyPrint.

Each .md has: H1 title, a 6-field metadata block (Course/Week/Duration/Flags/Difficulty/Points),
then `---`, then the body (Objective, Starting State, per-flag Step-by-Step, code, tables).
The metadata renders on a title page; the body renders with styled headings/code/tables and a
running header + page-numbered footer marked Instructor-Only.

Usage:  python3 build-ala-pdfs.py [file.md ...]   (no args = all 13)
Output: <PDF next to each .md> in the shared ALA Solutions folder.
"""
import sys, os, re, html, glob
import markdown
from weasyprint import HTML

SRC = os.path.expanduser('~/hexworth-shared/Solutions/Advanced Linux Administration')

CSS = """
@page {
    size: Letter; margin: 22mm 18mm 20mm 18mm;
    @top-center { content: string(doctitle); font-family: 'Helvetica Neue', Arial, sans-serif;
                  font-size: 8pt; color: #94a3b8; padding-bottom: 4pt; }
    @bottom-left { content: 'Hexworth Prime  ·  CTS4321C  ·  Instructor-Only';
                   font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 7.5pt; color: #94a3b8; }
    @bottom-right { content: 'Page ' counter(page) ' of ' counter(pages);
                    font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 7.5pt; color: #94a3b8; }
}
@page :first { @top-center { content: none; } }  /* no running header on the title page */

body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; line-height: 1.55;
       color: #1e293b; }

/* ── Title page ── */
.cover { page-break-after: always; padding-top: 30mm; }
.cover-bar { height: 6px; background: #4f46e5; width: 100%; margin-bottom: 26pt; }
.cover-kicker { font-size: 10pt; letter-spacing: 0.18em; text-transform: uppercase; color: #4f46e5; font-weight: 700; }
.cover-title { font-size: 30pt; font-weight: 800; color: #0f172a; line-height: 1.15; margin: 10pt 0 6pt; }
.cover-sub { font-size: 12pt; color: #475569; margin-bottom: 30pt; }
.cover-meta { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0; width: 100%; border-collapse: collapse; }
.cover-meta td { padding: 9pt 14pt; border-bottom: 1px solid #eef2f7; font-size: 10.5pt; }
.cover-meta tr:last-child td { border-bottom: none; }
.cover-meta .k { color: #64748b; font-weight: 600; width: 32%; text-transform: uppercase; letter-spacing: 0.04em; font-size: 8.5pt; }
.cover-meta .v { color: #0f172a; font-weight: 600; }
.cover-note { margin-top: 26pt; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10pt; }

/* ── Body ── */
h1 { string-set: doctitle content(); font-size: 0; margin: 0; }  /* H1s in body suppressed (title on cover) */
h2 { font-size: 16pt; color: #0f172a; font-weight: 800; margin: 22pt 0 8pt;
     padding-bottom: 5pt; border-bottom: 2px solid #4f46e5; }
h3 { font-size: 12.5pt; color: #4f46e5; font-weight: 700; margin: 16pt 0 6pt; }
p { margin: 6pt 0; }
a { color: #4f46e5; text-decoration: none; }
strong { color: #0f172a; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 16pt 0; }
ul, ol { margin: 6pt 0 6pt 4pt; padding-left: 18pt; }
li { margin: 3pt 0; }
code { font-family: 'SFMono-Regular', 'Consolas', monospace; font-size: 9pt;
       background: #eef2f7; color: #b91c1c; padding: 1pt 4pt; border-radius: 3px; }
pre { background: #f6f8fa; border: 1px solid #e2e8f0; border-left: 3px solid #4f46e5;
      border-radius: 6px; padding: 10pt 12pt; margin: 8pt 0; overflow-wrap: break-word; }
pre code { background: none; color: #1e293b; padding: 0; font-size: 8.7pt; line-height: 1.45; white-space: pre-wrap; }
blockquote { border-left: 3px solid #cbd5e1; margin: 8pt 0; padding: 2pt 12pt; color: #475569; font-style: italic; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 9.5pt; }
th { background: #4f46e5; color: #fff; text-align: left; padding: 6pt 10pt; font-weight: 700; }
td { border: 1px solid #e2e8f0; padding: 6pt 10pt; vertical-align: top; }
tr:nth-child(even) td { background: #f8fafc; }
"""

def parse(md_text):
    """Split a walkthrough into (title, subtitle, [(field,value)...], body_markdown)."""
    # First H1 = title; metadata = the **Field:** value lines before the first '---'; body = after it.
    lines = md_text.splitlines()
    title = ''
    for ln in lines:
        m = re.match(r'#\s+(.*)', ln)
        if m: title = m.group(1).strip(); break
    # split title (before "—") from subtitle (after)
    sub = ''
    if '—' in title:
        title, sub = [x.strip() for x in title.split('—', 1)]
    meta = re.findall(r'\*\*([A-Za-z ]+):\*\*\s*(.+)', md_text.split('\n---', 1)[0])
    body = md_text.split('\n---', 1)[1] if '\n---' in md_text else md_text
    return title, sub, meta, body

# Read one walkthrough .md, convert its body to HTML, wrap it with the title page + branded
# template, and write a sibling .pdf via WeasyPrint. Returns the output path.
def render(md_path):
    raw = open(md_path, encoding='utf-8').read()
    title, sub, meta, body = parse(raw)
    body_html = markdown.markdown(body, extensions=['fenced_code', 'tables', 'sane_lists'])
    meta_rows = "".join(
        f'<tr><td class="k">{html.escape(k)}</td><td class="v">{html.escape(v)}</td></tr>' for k, v in meta)
    doc = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{CSS}</style></head><body>
<h1>{html.escape(title)}</h1>
<div class="cover">
  <div class="cover-bar"></div>
  <div class="cover-kicker">Hexworth Prime · Instructor Solution Guide</div>
  <div class="cover-title">{html.escape(title)}</div>
  <div class="cover-sub">{html.escape(sub)}</div>
  <table class="cover-meta">{meta_rows}</table>
  <div class="cover-note">CONFIDENTIAL — Instructor solution guide. Not for distribution to students
  except at the instructor's discretion. Contains flag answers and full walkthrough steps.</div>
</div>
{body_html}
</body></html>"""
    out = os.path.splitext(md_path)[0] + '.pdf'
    HTML(string=doc).write_pdf(out)
    return out

# Resolve targets (CLI args, else all 13 walkthroughs) to absolute paths and render each to PDF.
targets = sys.argv[1:] or sorted(glob.glob(os.path.join(SRC, '*.md')))
targets = [t if os.path.isabs(t) else os.path.join(SRC, t) for t in targets]
for t in targets:
    out = render(t)
    print(f"wrote {os.path.basename(out)} ({os.path.getsize(out)//1024} KB)")
