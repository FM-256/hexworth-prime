/**
 * CertPathRenderer.js — Shared renderer for certification path landing pages.
 * Each cert path index.html sets PATH_ID and loads this script.
 * Reads path data from LearningPaths.PATHS[pathId] and renders a
 * progress-tracked module checklist themed to the path's color.
 */
const CertPathRenderer = (() => {
    let pathId, pathData, storageKey;

    const TYPE_ICONS = {
        presentation: '\u{1F4D6}', applet: '\u{1F527}', lab: '\u{1F9EA}',
        quiz: '\u{1F4DD}', chapter: '\u{1F4D1}', tool: '\u{1F6E0}', module: '\u{1F4E6}'
    };

    const DIFF = {
        beginner:     { color: '#22c55e', label: 'Beginner' },
        intermediate: { color: '#eab308', label: 'Intermediate' },
        advanced:     { color: '#ef4444', label: 'Advanced' }
    };

    /* ── localStorage helpers ── */
    function getCompleted() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
        catch { return {}; }
    }

    function toggleModule(modId) {
        const c = getCompleted();
        if (c[modId]) delete c[modId]; else c[modId] = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(c));
        updateUI();
    }

    /* ── path helpers ── */
    function resolveHref(href) {
        // Module hrefs are relative to _app/; pages live at _app/houses/{id}/
        return '../../' + href;
    }

    function totalMinutes() {
        return pathData.modules.reduce((sum, m) => {
            const n = (m.duration || '').match(/(\d+)/);
            return sum + (n ? parseInt(n[1]) : 0);
        }, 0);
    }

    function completionStats() {
        const completed = getCompleted();
        const total = pathData.modules.length;
        const done  = pathData.modules.filter(m => completed[m.id]).length;
        return { total, done, pct: total ? Math.round(done / total * 100) : 0, completed };
    }

    /* ── UI updates (post-render) ── */
    function updateUI() {
        const { done, pct, completed } = completionStats();
        const el = id => document.getElementById(id);
        if (el('stat-done'))  el('stat-done').textContent  = done;
        if (el('stat-pct'))   el('stat-pct').textContent   = pct + '%';
        if (el('prog-bar'))   el('prog-bar').style.width   = pct + '%';

        pathData.modules.forEach(m => {
            const cb  = el('cb-' + m.id);
            const row = el('row-' + m.id);
            if (cb)  cb.checked = !!completed[m.id];
            if (row) row.classList.toggle('completed', !!completed[m.id]);
        });
    }

    /* ── CSS injection ── */
    function injectStyles() {
        const c = pathData.color || '#8b5cf6';
        const s = document.createElement('style');
        s.textContent = `
:root{--pc:${c};--pg:${c}33;--pbg:${c}0d;--pb:${c}33}
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;background:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#e0e0e0;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 20% 20%,var(--pbg) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,${c}08 0%,transparent 50%);pointer-events:none;z-index:0}

.hdr{padding:16px 32px;border-bottom:1px solid var(--pb);background:rgba(10,10,15,.95);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:100;backdrop-filter:blur(10px)}
.hdr-l{display:flex;align-items:center;gap:16px}
.back{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#888;font-size:.8rem;text-decoration:none;transition:all .3s}
.back:hover{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)}
.pbadge{display:flex;align-items:center;gap:10px;padding:8px 18px;background:var(--pbg);border:1px solid var(--pb);border-radius:20px}
.pbadge-icon{font-size:1.2rem}
.pbadge-text{font-size:.7rem;letter-spacing:.2em;color:var(--pc);text-transform:uppercase}
.cert-tag{padding:5px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;font-size:.65rem;color:#666;letter-spacing:.1em}

.wrap{max-width:900px;margin:0 auto;padding:40px 24px;position:relative;z-index:10}
.hero{text-align:center;padding:50px 20px 40px}
.hero-icon{font-size:4rem;margin-bottom:20px;filter:drop-shadow(0 0 25px var(--pg))}
.hero-h{font-size:2rem;font-weight:300;letter-spacing:.1em;color:#fff;margin-bottom:12px}
.hero-p{font-size:.95rem;color:#888;max-width:600px;margin:0 auto;line-height:1.7}

.stats{display:flex;justify-content:center;gap:40px;padding:20px;background:rgba(15,15,20,.6);border:1px solid var(--pb);border-radius:12px;margin-bottom:12px}
.st{text-align:center}
.st-v{font-size:1.8rem;font-weight:300;color:var(--pc)}
.st-l{font-size:.65rem;color:#555;letter-spacing:.15em;text-transform:uppercase;margin-top:4px}

.prog{height:4px;background:rgba(255,255,255,.05);border-radius:2px;margin-bottom:40px;overflow:hidden}
.prog-f{height:100%;background:var(--pc);border-radius:2px;transition:width .5s ease}

.sec-lbl{font-size:.7rem;color:#555;letter-spacing:.25em;text-transform:uppercase;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.05)}

.mlist{display:flex;flex-direction:column;gap:6px;margin-bottom:40px}
.mrow{display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:8px;transition:all .2s}
.mrow:hover{background:rgba(255,255,255,.04);border-color:var(--pb)}
.mrow.completed{opacity:.55}
.mrow.completed .mtitle{text-decoration:line-through;text-decoration-color:var(--pc)}

.mcb{width:18px;height:18px;accent-color:var(--pc);cursor:pointer;flex-shrink:0}
.mnum{font-size:.65rem;color:#444;min-width:24px;text-align:center}
.mtype{font-size:.9rem;min-width:24px;text-align:center}
.minfo{flex:1;min-width:0}
.mtitle{font-size:.85rem;color:#ddd;text-decoration:none;transition:color .2s}
.mtitle:hover{color:var(--pc)}
.mmeta{display:flex;align-items:center;gap:8px;margin-top:3px}
.mdiff{font-size:.6rem;padding:2px 8px;border-radius:8px;text-transform:uppercase;letter-spacing:.1em}
.mdur{font-size:.65rem;color:#555}

.foot{text-align:center;padding:30px 0;color:#333;font-size:.7rem;letter-spacing:.15em}

@media(max-width:600px){
  .hdr{padding:12px 16px;flex-wrap:wrap;gap:8px}
  .wrap{padding:20px 12px}
  .hero{padding:30px 10px 20px}
  .hero-h{font-size:1.5rem}
  .stats{gap:20px;padding:16px;flex-wrap:wrap}
  .st-v{font-size:1.3rem}
  .mmeta{flex-wrap:wrap}
}`;
        document.head.appendChild(s);
    }

    /* ── DOM build ── */
    function render() {
        const { total, done, pct, completed } = completionStats();
        const mins  = totalMinutes();
        const hours = (mins / 60).toFixed(1);

        document.body.innerHTML = `
<div class="hdr">
  <div class="hdr-l">
    <a href="../../dashboard.html" class="back">\u2190 Dashboard</a>
    <div class="pbadge">
      <span class="pbadge-icon">${pathData.icon}</span>
      <span class="pbadge-text">${pathData.name}</span>
    </div>
  </div>
  <span class="cert-tag">CERTIFICATION PATH</span>
</div>

<div class="wrap">
  <div class="hero">
    <div class="hero-icon">${pathData.icon}</div>
    <h1 class="hero-h">${pathData.name}</h1>
    <p class="hero-p">${pathData.description}</p>
  </div>

  <div class="stats">
    <div class="st"><div class="st-v">${total}</div><div class="st-l">Modules</div></div>
    <div class="st"><div class="st-v">~${hours}h</div><div class="st-l">Estimated</div></div>
    <div class="st"><div class="st-v" id="stat-done">${done}</div><div class="st-l">Completed</div></div>
    <div class="st"><div class="st-v" id="stat-pct">${pct}%</div><div class="st-l">Progress</div></div>
  </div>

  <div class="prog"><div class="prog-f" id="prog-bar" style="width:${pct}%"></div></div>

  <div class="sec-lbl">Course Modules</div>

  <div class="mlist">
    ${pathData.modules.map((m, i) => {
        const ic  = TYPE_ICONS[m.type] || TYPE_ICONS.module;
        const d   = DIFF[m.difficulty];
        const dc  = d ? d.color : '#888';
        const dl  = d ? d.label : '';
        const href = m.href ? resolveHref(m.href) : '#';
        const chk = completed[m.id] ? 'checked' : '';
        const cls = completed[m.id] ? ' completed' : '';
        return `<div class="mrow${cls}" id="row-${m.id}">
      <input type="checkbox" class="mcb" id="cb-${m.id}" ${chk} onchange="CertPathRenderer.toggle('${m.id}')">
      <span class="mnum">${String(i+1).padStart(2,'0')}</span>
      <span class="mtype" title="${m.type||'module'}">${ic}</span>
      <div class="minfo">
        <a href="${href}" class="mtitle">${m.title}</a>
        <div class="mmeta">
          ${dl ? `<span class="mdiff" style="background:${dc}22;color:${dc};border:1px solid ${dc}44">${dl}</span>` : ''}
          ${m.duration ? `<span class="mdur">${m.duration}</span>` : ''}
        </div>
      </div>
    </div>`;
    }).join('')}
  </div>

  <div class="foot">HEXWORTH PRIME</div>
</div>`;
    }

    /* ── Public API ── */
    return {
        init(id) {
            pathId     = id;
            pathData   = typeof LearningPaths !== 'undefined' && LearningPaths.PATHS[id];
            storageKey = 'hexworth_certpath_' + id;
            if (!pathData) {
                document.body.innerHTML = '<div style="padding:40px;color:#f66;font-family:monospace">Certification path not found: ' + id + '</div>';
                return;
            }
            document.title = pathData.name + ' \u2014 Hexworth Prime';
            injectStyles();
            render();
        },
        toggle(modId) { toggleModule(modId); }
    };
})();
