#!/usr/bin/env python3
"""
Reads manifest.json and emits a self-contained browsable gallery (image-gallery.html).
Repo images render as thumbnails (served from the repo root via a local static server);
off-repo accumulation is listed with paths. Nothing is moved.
"""
import json
import os

HERE = os.path.dirname(__file__)
REPO = "/home/eq/ai-content/hexworth-prime"

with open(os.path.join(HERE, "manifest.json")) as f:
    manifest = json.load(f)

items = []
for e in manifest["images"]:
    ap = e["abs_path"]
    if ap.startswith(REPO + os.sep):
        url = "/" + os.path.relpath(ap, REPO).replace(os.sep, "/")  # served from repo root
        previewable = True
    else:
        url = None  # off-repo: not served here
        previewable = False
    items.append({
        "n": e["name"],
        "c": e["category"],
        "s": e["size_bytes"] or 0,
        "src": e["source"],
        "u": url,
        "p": previewable,
    })

t = manifest["totals"]
data_json = json.dumps(items, separators=(",", ":"))

html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hexworth Image Gallery</title>
<style>
  :root {
    --bg:#0f1020; --panel:#191a2e; --panel2:#20223a; --edge:#2c2e4c;
    --ink:#e9e9f4; --muted:#9a9 bb0; --muted:#9a9bb0; --accent:#8b5cf6; --accent2:#22d3ee;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  header { position:sticky; top:0; z-index:10; background:linear-gradient(180deg,#14152a,#0f1020);
    border-bottom:1px solid var(--edge); padding:14px 20px; }
  .title { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
  h1 { margin:0; font-size:18px; letter-spacing:.3px; }
  h1 b { color:var(--accent); }
  .sub { color:var(--muted); font-size:12.5px; }
  .controls { display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; align-items:center; }
  input[type=search] { flex:1; min-width:220px; background:var(--panel); border:1px solid var(--edge);
    color:var(--ink); padding:9px 12px; border-radius:9px; font-size:14px; outline:none; }
  input[type=search]:focus { border-color:var(--accent); }
  .chips { display:flex; gap:6px; flex-wrap:wrap; }
  .chip { background:var(--panel); border:1px solid var(--edge); color:var(--muted);
    padding:5px 10px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap; }
  .chip:hover { color:var(--ink); }
  .chip.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .chip .n { opacity:.7; margin-left:5px; font-variant-numeric:tabular-nums; }
  main { padding:8px 20px 60px; }
  .group { margin-top:26px; }
  .group h2 { font-size:13px; text-transform:uppercase; letter-spacing:.8px; color:var(--accent2);
    border-bottom:1px solid var(--edge); padding-bottom:6px; margin:0 0 12px;
    display:flex; justify-content:space-between; align-items:baseline; }
  .group h2 .n { color:var(--muted); font-weight:400; letter-spacing:0; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:12px; }
  .card { background:var(--panel); border:1px solid var(--edge); border-radius:10px; overflow:hidden;
    display:flex; flex-direction:column; }
  .thumb { aspect-ratio:1/1; background:
      repeating-conic-gradient(#1c1e34 0% 25%, #17182b 0% 50%) 50%/18px 18px;
    display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .thumb img { max-width:100%; max-height:100%; object-fit:contain; display:block; }
  .thumb.miss { color:var(--muted); font-size:11px; text-align:center; padding:8px; }
  .meta { padding:7px 8px; border-top:1px solid var(--edge); }
  .meta .fn { font-size:11px; word-break:break-all; color:var(--ink); }
  .meta .dim { font-size:10.5px; color:var(--muted); font-variant-numeric:tabular-nums; margin-top:2px; }
  a.card { text-decoration:none; color:inherit; }
  a.card:hover { border-color:var(--accent); }
  .empty { color:var(--muted); padding:40px; text-align:center; }
  .foot { color:var(--muted); font-size:12px; margin-top:8px; }
</style>
</head>
<body>
<header>
  <div class="title">
    <h1><b>Hexworth</b> Image Gallery</h1>
    <span class="sub" id="stat"></span>
  </div>
  <div class="controls">
    <input type="search" id="q" placeholder="Search by filename or category (e.g. badge, honey, wsa, mascot)&hellip;" autofocus>
    <div class="chips" id="chips"></div>
  </div>
</header>
<main id="out"></main>
<script>
// Full image list, embedded at generation time (one entry per image everywhere).
const IMAGES = __DATA__;
// Human-readable byte size.
const fmt = b => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : b >= 1024 ? Math.round(b/1024)+' KB' : b+' B';

// Bucket every image by its full category path, then order categories biggest-first.
const groups = {};
for(const im of IMAGES){ (groups[im.c] ??= []).push(im); }
const cats = Object.keys(groups).sort((a,b)=>groups[b].length-groups[a].length);

// Build filter chips from the biggest categories
const chipDefs = [['all','All']].concat(cats.slice(0,14).map(c=>[c,c.replace(/^assets\//,'').replace(/^scattered\//,'~ ')]));
let active='all', term='';
const chipsEl=document.getElementById('chips');
chipDefs.forEach(([id,label])=>{
  const el=document.createElement('span'); el.className='chip'+(id==='all'?' on':'');
  el.innerHTML=label+' <span class="n">'+(id==='all'?IMAGES.length:groups[id].length)+'</span>';
  el.onclick=()=>{active=id; [...chipsEl.children].forEach(c=>c.classList.remove('on')); el.classList.add('on'); render();};
  chipsEl.appendChild(el);
});
document.getElementById('q').addEventListener('input',e=>{term=e.target.value.toLowerCase().trim(); render();});

const out=document.getElementById('out');
document.getElementById('stat').textContent =
  IMAGES.length+' images · '+fmt(IMAGES.reduce((a,x)=>a+x.s,0))+' · '+cats.length+' collections';

// Redraw the grid for the active category chip + search term (thumbnails per collection).
function render(){
  out.innerHTML='';
  const show = cats.filter(c=> active==='all' || c===active);
  let shown=0;
  for(const c of show){
    const rows = groups[c].filter(im=> !term || im.n.toLowerCase().includes(term) || im.c.toLowerCase().includes(term));
    if(!rows.length) continue;
    shown += rows.length;
    const g=document.createElement('section'); g.className='group';
    g.innerHTML='<h2>'+c+' <span class="n">'+rows.length+' · '+fmt(rows.reduce((a,x)=>a+x.s,0))+'</span></h2>';
    const grid=document.createElement('div'); grid.className='grid';
    for(const im of rows){
      const card=document.createElement(im.u?'a':'div'); card.className='card';
      if(im.u){ card.href=im.u; card.target='_blank'; }
      const thumb = im.p
        ? '<div class="thumb"><img loading="lazy" src="'+im.u+'" alt=""></div>'
        : '<div class="thumb miss">off-repo<br>(not served here)</div>';
      card.innerHTML=thumb+'<div class="meta"><div class="fn">'+im.n+'</div><div class="dim">'+fmt(im.s)+' · '+im.src+'</div></div>';
      grid.appendChild(card);
    }
    g.appendChild(grid); out.appendChild(g);
  }
  if(!shown) out.innerHTML='<div class="empty">No images match “'+term+'”.</div>';
}
render();
</script>
</body>
</html>
"""

html = html.replace("__DATA__", data_json)
# tidy an accidental space in the CSS var line
html = html.replace("--muted:#9a9 bb0; ", "")
out_path = os.path.join(HERE, "image-gallery.html")
with open(out_path, "w") as f:
    f.write(html)
print(f"Gallery -> {out_path}")
print(f"  {t['count']} images, {t['size_mb']} MB, {len(manifest['categories'])} collections")
