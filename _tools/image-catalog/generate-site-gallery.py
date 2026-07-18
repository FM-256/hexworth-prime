#!/usr/bin/env python3
"""
Generates the PUBLIC, curated image gallery page -> _app/gallery.html.

Scope (operator-chosen): brand/showcase art only -- badges, mascots, emblems,
icons, categories. Internal game sprites, wsa course diagrams, dark-arts
evidence, scattered/case art, and off-repo accumulation are excluded.

Uses live served URLs (/assets/images/...), on-brand site theme, no emoji.
Nothing is moved; this only reads manifest.json and writes one page.
"""
import json
import os
import re

# Dark Arts gate/vault badge art is excluded from the PUBLIC gallery so non-enrolled
# visitors can't read the 10 gate names/themes (they still show to logged-in students
# via the achievement system). Operator-conservative call on a one-way public exposure.
EXCLUDE_NAME = re.compile(r"dark[-_ ]?arts", re.I)

HERE = os.path.dirname(__file__)
REPO = "/home/eq/ai-content/hexworth-prime"
OUT = os.path.join(REPO, "_app", "gallery.html")

# The only collections shown publicly (top-level category prefix under assets/).
CURATED = ["assets/badges", "assets/icons", "assets/categories", "assets/mascots", "assets/emblems"]
# Friendlier display names for each collection.
LABELS = {
    "assets/badges": "Badges", "assets/icons": "Icons", "assets/categories": "Category Art",
    "assets/mascots": "Mascots", "assets/emblems": "Emblems",
}

with open(os.path.join(HERE, "manifest.json")) as f:
    manifest = json.load(f)

items = []
for e in manifest["images"]:
    if e["category"] in CURATED and e["served_url"] and not EXCLUDE_NAME.search(e["name"]):
        items.append({"n": e["name"], "c": e["category"], "s": e["size_bytes"] or 0, "u": e["served_url"]})
items.sort(key=lambda x: (CURATED.index(x["c"]), x["n"].lower()))
data_json = json.dumps(items, separators=(",", ":"))
labels_json = json.dumps(LABELS, separators=(",", ":"))
total_bytes = sum(i["s"] for i in items)

html = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://hexworth.com/gallery.html">
<title>Image Gallery - Hexworth Prime</title>
<link rel="icon" type="image/webp" href="/assets/images/icons/icon-star.webp">
<meta name="description" content="Browse the Hexworth Prime visual identity: achievement badges, house emblems, mascots, and platform iconography.">
<style>
  :root { --primary:#9f7aea; --secondary:#7c3aed; --glow:rgba(159,122,234,.28); --edge:#2a2a44; --panel:#15151f; }
  * { box-sizing:border-box; }
  body { margin:0; color:#fff; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
    background:linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 50%,#0a0a0a 100%); background-attachment:fixed; min-height:100vh; }
  .wrap { max-width:1280px; margin:0 auto; padding:0 22px 70px; }
  header.top { text-align:center; padding:46px 22px 26px; }
  .eyebrow { text-transform:uppercase; letter-spacing:.28em; font-size:.72rem; color:var(--primary); }
  h1 { margin:.35em 0 .15em; font-size:2.1rem; }
  h1 span { color:var(--primary); }
  .lede { color:#b9b9c9; max-width:60ch; margin:0 auto; font-size:.98rem; }
  .controls { display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin:22px auto 6px; max-width:1280px; }
  input[type=search] { flex:1; min-width:240px; background:var(--panel); border:1px solid var(--edge); color:#fff;
    padding:11px 14px; border-radius:11px; font-size:15px; outline:none; }
  input[type=search]:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--glow); }
  .chips { display:flex; gap:7px; flex-wrap:wrap; }
  .chip { background:var(--panel); border:1px solid var(--edge); color:#b9b9c9; padding:7px 13px;
    border-radius:999px; font-size:12.5px; cursor:pointer; }
  .chip:hover { color:#fff; border-color:var(--primary); }
  .chip.on { background:var(--primary); border-color:var(--primary); color:#0a0a0a; font-weight:600; }
  .chip .n { opacity:.7; margin-left:6px; font-variant-numeric:tabular-nums; }
  .stat { text-align:center; color:#8a8a9c; font-size:.82rem; margin-top:6px; }
  .group { margin-top:30px; }
  .group h2 { font-size:.82rem; text-transform:uppercase; letter-spacing:.14em; color:var(--primary);
    border-bottom:1px solid var(--edge); padding-bottom:8px; margin:0 0 15px;
    display:flex; justify-content:space-between; align-items:baseline; }
  .group h2 .n { color:#8a8a9c; font-weight:400; letter-spacing:0; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(118px,1fr)); gap:13px; }
  a.card { text-decoration:none; color:inherit; background:var(--panel); border:1px solid var(--edge);
    border-radius:12px; overflow:hidden; display:flex; flex-direction:column; transition:border-color .12s,transform .12s; }
  a.card:hover { border-color:var(--primary); transform:translateY(-2px); }
  .thumb { aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; padding:10px;
    background:repeating-conic-gradient(#181826 0% 25%,#141420 0% 50%) 50%/16px 16px; }
  .thumb img { max-width:100%; max-height:100%; object-fit:contain; }
  .meta { padding:8px 9px; border-top:1px solid var(--edge); }
  .fn { font-size:11px; word-break:break-word; }
  .dim { font-size:10px; color:#8a8a9c; margin-top:2px; font-variant-numeric:tabular-nums; }
  .empty { text-align:center; color:#8a8a9c; padding:50px; }
  .foot { text-align:center; margin-top:44px; font-size:.85rem; }
  .foot a { color:var(--primary); text-decoration:none; letter-spacing:.05em; }
</style>
</head>
<body>
  <div class="wrap">
    <header class="top">
      <div class="eyebrow">Hexworth Prime</div>
      <h1>Image <span>Gallery</span></h1>
      <p class="lede">The visual identity of the platform &mdash; achievement badges, house emblems, mascots, and iconography, all in one place.</p>
    </header>

    <div class="controls">
      <input type="search" id="q" placeholder="Search the gallery (e.g. cloud, security, linux, master)">
      <div class="chips" id="chips"></div>
    </div>
    <div class="stat" id="stat"></div>

    <main id="out"></main>

    <div class="foot">
      <a href="/about.html">About</a> &nbsp;&middot;&nbsp;
      <a href="/product-info.html">Product Overview</a> &nbsp;&middot;&nbsp;
      <a href="/faq.html">FAQ</a> &nbsp;&middot;&nbsp;
      <a href="/privacy.html">Privacy</a> &nbsp;&middot;&nbsp;
      <a href="/dashboard.html">Return to Dashboard</a>
    </div>
  </div>

<script>
// Curated image list + display labels, embedded at build time.
const IMAGES = __DATA__;
const LABELS = __LABELS__;
// Human-readable byte size.
const fmt = b => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : b >= 1024 ? Math.round(b/1024)+' KB' : b+' B';

// Bucket by collection, preserving the curated display order.
const order = Object.keys(LABELS);
const groups = {};
for (const im of IMAGES) (groups[im.c] ??= []).push(im);

// Build the "All + per-collection" filter chips.
let active = 'all', term = '';
const chipsEl = document.getElementById('chips');
[['all','All']].concat(order.filter(c=>groups[c]).map(c=>[c,LABELS[c]])).forEach(([id,label]) => {
  const el = document.createElement('span');
  el.className = 'chip' + (id==='all'?' on':'');
  el.innerHTML = label + ' <span class="n">' + (id==='all'?IMAGES.length:groups[id].length) + '</span>';
  el.onclick = () => { active=id; [...chipsEl.children].forEach(c=>c.classList.remove('on')); el.classList.add('on'); render(); };
  chipsEl.appendChild(el);
});
document.getElementById('q').addEventListener('input', e => { term = e.target.value.toLowerCase().trim(); render(); });
document.getElementById('stat').textContent = IMAGES.length + ' images · ' + fmt(IMAGES.reduce((a,x)=>a+x.s,0));

const out = document.getElementById('out');
// Redraw the grid for the active collection chip + current search term.
function render() {
  out.innerHTML = '';
  let shown = 0;
  for (const c of order) {
    if (!groups[c] || (active!=='all' && c!==active)) continue;
    const rows = groups[c].filter(im => !term || im.n.toLowerCase().includes(term));
    if (!rows.length) continue;
    shown += rows.length;
    const g = document.createElement('section'); g.className = 'group';
    g.innerHTML = '<h2>' + LABELS[c] + ' <span class="n">' + rows.length + '</span></h2>';
    const grid = document.createElement('div'); grid.className = 'grid';
    for (const im of rows) {
      const a = document.createElement('a'); a.className='card'; a.href=im.u; a.target='_blank'; a.rel='noopener';
      // Build with DOM setters (src/alt/textContent), never innerHTML concat, so a filename
      // with quotes/brackets/ampersands can never break markup on this public page.
      const thumb=document.createElement('div'); thumb.className='thumb';
      const img=document.createElement('img'); img.src=im.u; img.alt=im.n;
      thumb.appendChild(img);
      const meta=document.createElement('div'); meta.className='meta';
      const fn=document.createElement('div'); fn.className='fn'; fn.textContent=im.n;
      const dim=document.createElement('div'); dim.className='dim'; dim.textContent=fmt(im.s);
      meta.appendChild(fn); meta.appendChild(dim);
      a.appendChild(thumb); a.appendChild(meta);
      grid.appendChild(a);
    }
    g.appendChild(grid); out.appendChild(g);
  }
  if (!shown) out.innerHTML = '<div class="empty">No images match your search.</div>';
}
render();
</script>
</body>
</html>
"""

html = html.replace("__DATA__", data_json).replace("__LABELS__", labels_json)
with open(OUT, "w") as f:
    f.write(html)
print(f"Public gallery -> {OUT}")
print(f"  {len(items)} curated images ({round(total_bytes/1024/1024,1)} MB) across {len(set(i['c'] for i in items))} collections")
for c in CURATED:
    n = sum(1 for i in items if i["c"] == c)
    if n:
        print(f"    {n:4d}  {LABELS[c]}")
