"""Rich HTML+SVG slide visual renderer for WSA decks.
Templates per shape: architecture, compare, flow, hierarchy, bullet.
Each emits a 1280x720 HTML page with iconography + tier zones +
per-node captions + numbered step badges + colored flow arrows.
Rendered via headless Chromium puppeteer @ 2x scale, then PIL -> WebP.
"""
import os, json, subprocess, tempfile
from pathlib import Path

REPO = Path('/home/eq/ai-content/hexworth-prime')

# Inline SVG icon glyphs (Lucide style — single-path strokes).
# Keyed by intent so caller passes intent and gets icon back.
ICONS = {
    'client':    '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>',
    'server':    '<rect x="2" y="3" width="20" height="6" rx="1"/><rect x="2" y="11" width="20" height="6" rx="1"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="14" x2="6.01" y2="14"/>',
    'shield':    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'gear':      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    'lock':      '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'key':       '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    'globe':     '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/>',
    'cloud':     '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    'monitor':   '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    'database':  '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    'document':  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/>',
    'flame':     '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'network':   '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    'package':   '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    'users':     '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'list':      '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    'check':     '<polyline points="20 6 9 17 4 12"/>',
    'cog':       '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-7.5l-4.24 4.24M7.74 16.26L3.5 20.5m13-3l-4.24-4.24M7.74 7.74L3.5 3.5"/>',
    'tree':      '<path d="M12 2v20M5 10v10M19 14v6M5 10l7-8 7 12"/>',
    'arrow-r':   '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
}

# Color palette per WSA register
COLORS = {
    'client':   '#1f6feb',
    'edge':     '#d97706',
    'gateway':  '#d97706',
    'web':      '#facc15',
    'broker':   '#7c3aed',
    'control':  '#7c3aed',
    'compute':  '#16a34a',
    'rdsh':     '#16a34a',
    'server':   '#16a34a',
    'vdi':      '#0891b2',
    'storage':  '#0891b2',
    'license':  '#dc2626',
    'security': '#dc2626',
    'auth':     '#dc2626',
    'mute':     '#9ca3af',
    'accent':   '#ffd86b',
    'good':     '#16a34a',
    'warn':     '#d97706',
    'bad':      '#dc2626',
}

# Common CSS (shared across templates)
CSS = """
:root { --bg:#0c1a2e; --bg2:#142236; --bg3:#1a2c46; --fg:#fff; --mute:#9ca3af; --accent:#ffd86b; }
* { box-sizing:border-box; margin:0; padding:0; }
html,body { width:1280px; height:720px; background:var(--bg); color:var(--fg); font-family:'Inter',sans-serif; overflow:hidden; }
body { padding:24px 32px; display:flex; flex-direction:column;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(31,111,235,0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, rgba(124,58,237,0.10) 0%, transparent 50%),
    var(--bg);
}
.title-row { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
.title { font-size:26px; font-weight:700; letter-spacing:-0.02em; }
.subtitle { font-size:12.5px; color:var(--mute); font-weight:500; max-width: 70%; }
.subtitle.right { text-align:right; max-width:30%; }
.footer { margin-top:auto; padding-top:8px; display:flex; justify-content:space-between; font-size:10px; color:var(--mute); }
.node { background:var(--bg3); border:1.5px solid var(--node-color,rgba(255,255,255,0.18)); border-radius:12px;
  padding:10px 12px; display:flex; flex-direction:column; gap:6px; position:relative;
  box-shadow:0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06); }
.node-head { display:flex; align-items:center; gap:8px; }
.node-head svg.icon { width:22px; height:22px; flex-shrink:0; }
.node-title { font-size:13px; font-weight:700; color:var(--node-color,white); line-height:1.2; }
.node-caption { font-size:11px; color:var(--mute); line-height:1.35; }
.node-meta { font-size:10px; font-family:'JetBrains Mono',monospace; color:var(--accent);
  background:rgba(255,216,107,0.08); padding:2px 6px; border-radius:4px; display:inline-block; align-self:flex-start; margin-top:2px; }
.step-badge { position:absolute; top:-8px; right:-8px; width:22px; height:22px; border-radius:50%;
  background:var(--node-color,#1f6feb); color:var(--bg); font-size:12px; font-weight:700;
  display:grid; place-items:center; box-shadow:0 0 0 3px var(--bg); }
"""

def icon_svg(intent, color):
    glyph = ICONS.get(intent, ICONS['cog'])
    return (f'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{glyph}</svg>')

def html_page(title, body, course_tag=''):
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head>
<body>{body}<div class="footer"><div>WSA · Windows Server Administration</div><div>{course_tag}</div></div></body></html>"""

# === SHAPE TEMPLATES ===

def render_architecture(title, subtitle, tiers, course_tag='CTS1328C · AZ-800'):
    """tiers: list of dicts: {label, nodes: [{title, caption, meta, color_key, icon, step}, ...]}.
    Renders as N tier-columns side-by-side with optional flow arrows between."""
    n_tiers = len(tiers)
    tier_html = ''
    for tier in tiers:
        nodes_html = ''
        for node in tier['nodes']:
            color = COLORS.get(node.get('color_key','client'), '#1f6feb')
            step_html = f'<span class="step-badge">{node["step"]}</span>' if node.get('step') else ''
            meta_html = f'<span class="node-meta">{node["meta"]}</span>' if node.get('meta') else ''
            cap_html = f'<div class="node-caption">{node["caption"]}</div>' if node.get('caption') else ''
            nodes_html += (
                f'<div class="node" style="--node-color:{color}">'
                f'{step_html}'
                f'<div class="node-head">{icon_svg(node.get("icon","cog"), color)}<div class="node-title">{node["title"]}</div></div>'
                f'{cap_html}{meta_html}</div>'
            )
        tier_html += (
            f'<div class="tier" data-tier="{tier["label"]}">'
            f'<div class="tier-label">{tier["label"]}</div>{nodes_html}</div>'
        )

    extra_css = f"""
    .diagram-wrap {{ flex:1; display:grid; grid-template-columns: repeat({n_tiers}, 1fr); gap:14px; }}
    .tier {{ display:flex; flex-direction:column; gap:10px; padding:10px;
      border-radius:12px; border:1px solid rgba(255,255,255,0.06);
      background: linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%); position:relative; }}
    .tier-label {{ font-size:10px; color:var(--mute); text-transform:uppercase;
      letter-spacing:0.14em; font-weight:600; margin-bottom:4px; padding-left:2px; }}
    """
    body = f"""<style>{extra_css}</style>
    <div class="title-row">
      <div><div class="title">{title}</div><div class="subtitle">{subtitle}</div></div>
      <div class="subtitle right">{course_tag}</div>
    </div>
    <div class="diagram-wrap">{tier_html}</div>"""
    return html_page(title, body, course_tag)


def render_compare(title, subtitle, left_label, left_color_key, left_icon, left_items,
                   right_label, right_color_key, right_icon, right_items,
                   course_tag='CTS1328C · AZ-800'):
    """Two-panel side-by-side compare. Items is list of {head, body}."""
    def panel(label, color_key, icon, items, side):
        color = COLORS.get(color_key, '#1f6feb')
        items_html = ''
        for item in items:
            if isinstance(item, dict):
                head = item.get('head', '')
                body = item.get('body', '')
                items_html += f'<div class="cmp-item"><div class="cmp-item-head">{head}</div>'
                if body:
                    items_html += f'<div class="cmp-item-body">{body}</div>'
                items_html += '</div>'
            else:
                items_html += f'<div class="cmp-item"><div class="cmp-item-head">{item}</div></div>'
        return (
            f'<div class="cmp-panel cmp-{side}" style="--p-color:{color}">'
            f'<div class="cmp-head">{icon_svg(icon, color)}<div class="cmp-label">{label}</div></div>'
            f'<div class="cmp-items">{items_html}</div></div>'
        )

    extra_css = """
    .compare-wrap { flex:1; display:grid; grid-template-columns: 1fr auto 1fr; gap:14px; align-items:stretch; }
    .cmp-panel { border:1.5px solid var(--p-color); border-radius:14px; padding:14px 16px;
      display:flex; flex-direction:column; gap:10px;
      background: linear-gradient(180deg, color-mix(in srgb, var(--p-color) 12%, transparent) 0%, transparent 100%); }
    .cmp-head { display:flex; align-items:center; gap:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08); }
    .cmp-head svg.icon { width:28px; height:28px; }
    .cmp-label { font-size:18px; font-weight:700; color:var(--p-color); }
    .cmp-items { display:flex; flex-direction:column; gap:8px; flex:1; }
    .cmp-item { background:var(--bg3); border-radius:8px; padding:8px 10px; border-left:3px solid var(--p-color); }
    .cmp-item-head { font-size:13px; font-weight:600; color:var(--fg); }
    .cmp-item-body { font-size:11px; color:var(--mute); margin-top:2px; line-height:1.4; }
    .cmp-vs { display:flex; flex-direction:column; align-items:center; justify-content:center;
      padding: 0 4px; color:var(--mute); font-size:11px; }
    .cmp-vs .vs-circle { width:44px; height:44px; border-radius:50%; border:2px solid var(--mute);
      display:grid; place-items:center; font-size:14px; font-weight:700; color:var(--accent); margin-bottom:6px; background:var(--bg2); }
    """
    body = f"""<style>{extra_css}</style>
    <div class="title-row">
      <div><div class="title">{title}</div><div class="subtitle">{subtitle}</div></div>
      <div class="subtitle right">{course_tag}</div>
    </div>
    <div class="compare-wrap">
      {panel(left_label, left_color_key, left_icon, left_items, 'left')}
      <div class="cmp-vs"><div class="vs-circle">vs</div></div>
      {panel(right_label, right_color_key, right_icon, right_items, 'right')}
    </div>"""
    return html_page(title, body, course_tag)


def render_hierarchy(title, subtitle, root_label, root_color_key, root_icon, children,
                     course_tag='CTS1328C · AZ-800'):
    """children: list of {label, color_key, icon, items: [str, str, ...]}."""
    nchild = len(children)
    children_html = ''
    for child in children:
        color = COLORS.get(child.get('color_key','client'), '#1f6feb')
        items_html = ''.join(f'<li>{it}</li>' for it in child.get('items', []))
        children_html += (
            f'<div class="h-card" style="--c-color:{color}">'
            f'<div class="h-card-head">{icon_svg(child.get("icon","cog"), color)}<div class="h-card-label">{child["label"]}</div></div>'
            f'<ul class="h-card-items">{items_html}</ul></div>'
        )

    root_color = COLORS.get(root_color_key, '#7c3aed')
    extra_css = f"""
    .h-wrap {{ flex:1; display:flex; flex-direction:column; gap:14px; align-items:center; padding-top:8px; }}
    .h-root {{ background:var(--bg3); border:1.5px solid {root_color}; border-radius:12px;
      padding:10px 18px; display:flex; align-items:center; gap:10px; }}
    .h-root svg.icon {{ width:24px; height:24px; }}
    .h-root-label {{ font-size:16px; font-weight:700; color:{root_color}; }}
    .h-tree {{ display:grid; grid-template-columns: repeat({nchild}, 1fr); gap:12px; width:100%; flex:1; position:relative; }}
    .h-tree::before {{ content:''; position:absolute; top:-14px; left:50%; transform:translateX(-50%);
      width:80%; height:14px; border-bottom:1.5px solid rgba(255,255,255,0.10); }}
    .h-card {{ background:var(--bg3); border:1.5px solid var(--c-color); border-radius:12px;
      padding:10px 12px; display:flex; flex-direction:column; gap:8px;
      box-shadow:0 6px 18px rgba(0,0,0,0.35); }}
    .h-card-head {{ display:flex; align-items:center; gap:8px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); }}
    .h-card-head svg.icon {{ width:22px; height:22px; }}
    .h-card-label {{ font-size:14px; font-weight:700; color:var(--c-color); }}
    .h-card-items {{ list-style:none; display:flex; flex-direction:column; gap:5px; }}
    .h-card-items li {{ font-size:11.5px; color:var(--fg); padding-left:14px; position:relative; line-height:1.35; }}
    .h-card-items li::before {{ content:'▸'; position:absolute; left:0; color:var(--c-color); font-size:11px; }}
    """
    body = f"""<style>{extra_css}</style>
    <div class="title-row">
      <div><div class="title">{title}</div><div class="subtitle">{subtitle}</div></div>
      <div class="subtitle right">{course_tag}</div>
    </div>
    <div class="h-wrap">
      <div class="h-root">{icon_svg(root_icon, root_color)}<div class="h-root-label">{root_label}</div></div>
      <div class="h-tree">{children_html}</div>
    </div>"""
    return html_page(title, body, course_tag)


def render_bullet(title, subtitle, header_label, header_color_key, header_icon, items,
                  course_tag='CTS1328C · AZ-800'):
    """items: list of {head, body} or strings."""
    color = COLORS.get(header_color_key, '#7c3aed')
    items_html = ''
    for i, item in enumerate(items, 1):
        if isinstance(item, dict):
            head, body = item.get('head', ''), item.get('body', '')
        else:
            head, body = item, ''
        items_html += (
            f'<div class="b-item">'
            f'<div class="b-num">{i}</div>'
            f'<div class="b-text"><div class="b-head">{head}</div>'
            + (f'<div class="b-body">{body}</div>' if body else '')
            + '</div></div>'
        )
    extra_css = f"""
    .b-wrap {{ flex:1; display:flex; flex-direction:column; gap:14px; padding-top:8px; }}
    .b-head-row {{ display:flex; align-items:center; gap:12px; padding:10px 16px;
      background:var(--bg3); border:1.5px solid {color}; border-radius:12px; }}
    .b-head-row svg.icon {{ width:28px; height:28px; }}
    .b-head-label {{ font-size:18px; font-weight:700; color:{color}; }}
    .b-items {{ display:grid; grid-template-columns: 1fr 1fr; gap:10px; flex:1; }}
    .b-item {{ background:var(--bg3); border-radius:10px; padding:12px 14px;
      border-left:3px solid {color}; display:flex; gap:12px; align-items:flex-start; }}
    .b-num {{ flex-shrink:0; width:28px; height:28px; border-radius:50%; background:{color};
      color:var(--bg); font-weight:700; font-size:14px; display:grid; place-items:center; }}
    .b-text {{ flex:1; }}
    .b-head {{ font-size:13.5px; font-weight:600; color:var(--fg); line-height:1.25; }}
    .b-body {{ font-size:11px; color:var(--mute); margin-top:3px; line-height:1.4; }}
    """
    body = f"""<style>{extra_css}</style>
    <div class="title-row">
      <div><div class="title">{title}</div><div class="subtitle">{subtitle}</div></div>
      <div class="subtitle right">{course_tag}</div>
    </div>
    <div class="b-wrap">
      <div class="b-head-row">{icon_svg(header_icon, color)}<div class="b-head-label">{header_label}</div></div>
      <div class="b-items">{items_html}</div>
    </div>"""
    return html_page(title, body, course_tag)


# === RENDER PIPELINE ===

def render_html_to_webp(html_content, out_webp_path, width=1280, height=720):
    """Write HTML to temp file, render via headless Chromium, convert PNG -> WebP."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
        f.write(html_content)
        html_path = f.name
    png_path = html_path.replace('.html', '.png')
    node_script = f"""import puppeteer from '/home/eq/.local/lib/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
(async () => {{
  const b = await puppeteer.launch({{ args: ['--no-sandbox'] }});
  const p = await b.newPage();
  await p.setViewport({{ width: {width}, height: {height}, deviceScaleFactor: 2 }});
  await p.goto('file://{html_path}', {{ waitUntil: 'networkidle0' }});
  await p.evaluateHandle('document.fonts.ready');
  await p.screenshot({{ path: '{png_path}', fullPage: false }});
  await b.close();
}})().catch(e => {{ console.error(e.message); process.exit(1); }});
"""
    js_path = html_path.replace('.html', '.mjs')
    Path(js_path).write_text(node_script)
    subprocess.run(['node', js_path], check=True, capture_output=True)
    from PIL import Image
    Image.open(png_path).convert('RGB').save(out_webp_path, 'webp', quality=92, method=6)
    os.unlink(html_path); os.unlink(png_path); os.unlink(js_path)


if __name__ == '__main__':
    # Self-test: render the s02 RDS Architecture proof
    html = render_architecture(
        title='RDS Architecture',
        subtitle='Remote Desktop Services — five tiers, one connection flow, port boundaries enforced',
        tiers=[
            {'label': 'Client', 'nodes': [
                {'title': 'Client', 'caption': 'Remote user starts mstsc.exe or opens RD Web Access. From anywhere on the internet.', 'meta': 'mstsc.exe · RDP', 'color_key': 'client', 'icon': 'client', 'step': 1}
            ]},
            {'label': 'Edge', 'nodes': [
                {'title': 'RD Gateway', 'caption': 'TLS terminator. Only port the internet can see. CAP decides WHO; RAP decides WHAT.', 'meta': 'TLS · 443 ← public', 'color_key': 'gateway', 'icon': 'shield', 'step': 2},
                {'title': 'RD Web Access', 'caption': 'Browser portal. Lists published RemoteApps as clickable .rdp feed entries.', 'color_key': 'web', 'icon': 'globe'},
            ]},
            {'label': 'Control', 'nodes': [
                {'title': 'Connection Broker', 'caption': 'The orchestrator. Decides which session host gets your session. Reconnects on drop. Shared SQL when clustered.', 'meta': 'RDP 3389 · internal only', 'color_key': 'broker', 'icon': 'gear', 'step': 3},
            ]},
            {'label': 'Compute', 'nodes': [
                {'title': 'RD Session Host', 'caption': 'Where the user\'s desktop session actually runs. One server, many concurrent sessions.', 'meta': 'CAL per user / device', 'color_key': 'rdsh', 'icon': 'server', 'step': 4},
                {'title': 'RD Virt Host (VDI)', 'caption': 'VDI alternative. Each user gets their own Hyper-V VM — pooled or personal.', 'color_key': 'vdi', 'icon': 'monitor'},
            ]},
            {'label': 'License', 'nodes': [
                {'title': 'License Server', 'caption': 'Issues a Client Access License the first time a user connects. Without one, sessions get the 120-day grace clock.', 'meta': 'Per-User or Per-Device', 'color_key': 'license', 'icon': 'document', 'step': 5},
            ]},
        ],
    )
    render_html_to_webp(html, Path('/tmp/rich-s02.webp'))
    print('Wrote /tmp/rich-s02.webp')
