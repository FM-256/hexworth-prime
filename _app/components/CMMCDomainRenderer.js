/**
 * CMMCDomainRenderer.js — Shared renderer for CMMC domain applets
 *
 * Usage: CMMCDomainRenderer.init('AC')
 * Requires: CMMCDomainData.js loaded first
 */
const CMMCDomainRenderer = (() => {
    let domain = null;
    let storageKey = '';

    const DOMAIN_PATHS = {
        AC: 'cmmc_access_control', AU: 'cmmc_audit_accountability', AT: 'cmmc_awareness_training',
        CM: 'cmmc_config_management', IA: 'cmmc_identification_auth', IR: 'cmmc_incident_response',
        MA: 'cmmc_maintenance', MP: 'cmmc_media_protection', PS: 'cmmc_personnel_security',
        PE: 'cmmc_physical_protection', RA: 'cmmc_risk_assessment', CA: 'cmmc_security_assessment',
        SC: 'cmmc_system_comm_protection', SI: 'cmmc_system_info_integrity'
    };

    function domainHref(code) {
        const dir = DOMAIN_PATHS[code];
        if (!dir) return '#';
        return '../' + dir + '/shield-cmmc-' + code.toLowerCase() + '.applet.html';
    }

    function getState() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
        catch { return {}; }
    }

    function saveState(state) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function init(code) {
        domain = CMMCDomainData[code];
        if (!domain) { document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Domain not found: ' + code + '</p>'; return; }
        storageKey = 'hexworth_cmmc_' + code.toLowerCase();
        render();
    }

    function render() {
        const state = getState();
        const reviewedCount = Object.keys(state.reviewed || {}).length;
        const totalPractices = domain.practices.length;
        const l1 = domain.practices.filter(p => p.level === 1).length;
        const l2 = domain.practices.filter(p => p.level === 2).length;

        document.title = 'CMMC — ' + domain.name;

        const root = document.createElement('div');
        root.id = 'cmmc-root';
        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#cmmc-root{max-width:1100px;margin:0 auto;padding:1rem}

/* Header */
.cmmc-header{background:linear-gradient(135deg,#1a1020 0%,${domain.color}22 100%);border:1px solid ${domain.color}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.cmmc-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${domain.color},transparent)}
.cmmc-header-top{display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;flex-wrap:wrap}
.cmmc-icon{font-size:2.5rem}
.cmmc-title{font-size:1.6rem;font-weight:700;color:#fff}
.cmmc-badge{background:${domain.color}33;color:${domain.color};border:1px solid ${domain.color}66;padding:3px 12px;border-radius:20px;font-size:.75rem;font-weight:600;letter-spacing:.5px}
.cmmc-nist{color:${domain.color};font-size:.85rem;font-weight:500;margin-left:auto}
.cmmc-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.cmmc-stats{display:flex;gap:1.5rem;margin-top:1rem;flex-wrap:wrap}
.cmmc-stat{background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem}
.cmmc-stat strong{color:#fff;font-size:1.1rem;margin-right:.25rem}

/* Tabs */
.cmmc-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.cmmc-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:120px;text-align:center}
.cmmc-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.cmmc-tab.active{background:${domain.color}22;color:${domain.color};border:1px solid ${domain.color}44}

/* Tab Content */
.cmmc-panel{display:none;animation:fadeIn .3s ease}
.cmmc-panel.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Overview */
.cmmc-concepts{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}
.cmmc-concept{background:${domain.color}15;color:${domain.color};border:1px solid ${domain.color}33;padding:4px 12px;border-radius:20px;font-size:.8rem}
.cmmc-related{margin-top:1.5rem}
.cmmc-related-link{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:.5rem 1rem;border-radius:8px;color:#94a3b8;text-decoration:none;font-size:.85rem;cursor:pointer;transition:all .2s}
.cmmc-related-link:hover{background:rgba(255,255,255,.08);color:#e2e8f0}

/* Practice Cards */
.cmmc-filter-bar{display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap;align-items:center}
.cmmc-filter-btn{padding:5px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.12);background:transparent;color:#94a3b8;font-size:.78rem;cursor:pointer;transition:all .2s}
.cmmc-filter-btn.active{background:${domain.color}22;color:${domain.color};border-color:${domain.color}44}
.cmmc-filter-btn:hover{background:rgba(255,255,255,.06)}
.cmmc-search{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;padding:6px 14px;border-radius:20px;font-size:.8rem;outline:none;margin-left:auto;min-width:180px}
.cmmc-search:focus{border-color:${domain.color}66}
.cmmc-search::placeholder{color:#64748b}

.cmmc-practice{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:.75rem;overflow:hidden;transition:all .2s}
.cmmc-practice:hover{border-color:rgba(255,255,255,.12)}
.cmmc-practice-head{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;cursor:pointer;user-select:none}
.cmmc-practice-id{background:${domain.color}22;color:${domain.color};padding:3px 10px;border-radius:6px;font-size:.72rem;font-weight:700;font-family:monospace;white-space:nowrap;letter-spacing:.3px}
.cmmc-practice-id.l1{background:#22c55e22;color:#22c55e}
.cmmc-practice-id.l2{background:#eab30822;color:#eab308}
.cmmc-practice-title{font-weight:600;color:#e2e8f0;font-size:.9rem;flex:1}
.cmmc-practice-level{font-size:.7rem;padding:2px 8px;border-radius:10px;font-weight:600}
.cmmc-practice-level.l1{background:#22c55e18;color:#22c55e;border:1px solid #22c55e33}
.cmmc-practice-level.l2{background:#eab30818;color:#eab308;border:1px solid #eab30833}
.cmmc-practice-toggle{color:#64748b;transition:transform .2s;font-size:.85rem}
.cmmc-practice.open .cmmc-practice-toggle{transform:rotate(90deg)}

.cmmc-practice-body{display:none;padding:0 1.25rem 1.25rem;border-top:1px solid rgba(255,255,255,.04)}
.cmmc-practice.open .cmmc-practice-body{display:block}
.cmmc-practice-req{color:#cbd5e1;font-size:.88rem;line-height:1.6;margin:1rem 0;padding:.75rem 1rem;background:rgba(255,255,255,.02);border-left:3px solid ${domain.color}66;border-radius:0 6px 6px 0}
.cmmc-detail-section{margin-top:1rem}
.cmmc-detail-label{font-size:.75rem;color:${domain.color};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.cmmc-detail-list{list-style:none;padding:0}
.cmmc-detail-list li{color:#94a3b8;font-size:.82rem;padding:3px 0 3px 1.25rem;position:relative}
.cmmc-detail-list li::before{content:'›';position:absolute;left:.25rem;color:${domain.color}88}
.cmmc-review-toggle{display:flex;align-items:center;gap:.5rem;margin-top:1rem;cursor:pointer;font-size:.82rem;color:#64748b;transition:color .2s}
.cmmc-review-toggle:hover{color:#94a3b8}
.cmmc-review-toggle input{accent-color:${domain.color}}
.cmmc-review-toggle.checked{color:${domain.color}}

/* Assessment */
.cmmc-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.cmmc-q-num{font-size:.72rem;color:${domain.color};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.cmmc-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.cmmc-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.cmmc-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.cmmc-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.cmmc-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.cmmc-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.cmmc-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${domain.color}08;border-left:3px solid ${domain.color}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.cmmc-explanation.show{display:block}
.cmmc-score-bar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.cmmc-score-num{font-size:2rem;font-weight:700;color:${domain.color}}
.cmmc-score-label{color:#64748b;font-size:.8rem;margin-top:.25rem}
.cmmc-score-bar-visual{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.cmmc-score-fill{height:100%;background:${domain.color};border-radius:3px;transition:width .5s ease}
.cmmc-reset-btn{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.cmmc-reset-btn:hover{border-color:${domain.color}66;color:${domain.color}}

/* Resources */
.cmmc-resource{display:flex;align-items:center;gap:.75rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1rem 1.25rem;margin-bottom:.5rem;text-decoration:none;color:#e2e8f0;transition:all .2s}
.cmmc-resource:hover{background:rgba(255,255,255,.06);border-color:${domain.color}44}
.cmmc-resource-icon{font-size:1.2rem}
.cmmc-resource-title{font-size:.88rem;font-weight:500}
.cmmc-resource-url{font-size:.72rem;color:#64748b;margin-top:2px;word-break:break-all}

/* Progress bar in header */
.cmmc-progress-wrap{margin-top:1rem}
.cmmc-progress-bar{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.cmmc-progress-fill{height:100%;background:${domain.color};border-radius:2px;transition:width .5s ease}
.cmmc-progress-text{font-size:.72rem;color:#64748b;margin-top:.35rem;text-align:right}

/* Back link */
.cmmc-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.cmmc-back:hover{color:${domain.color}}

/* Level Guide Cards */
.cmmc-level-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1.25rem}
.cmmc-level-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;transition:all .2s}
.cmmc-level-card.active{border-color:${domain.color}44;background:${domain.color}08}
.cmmc-lc-badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:.72rem;font-weight:700;letter-spacing:.5px;margin-bottom:.5rem}
.cmmc-lc-badge.l1{background:#22c55e22;color:#22c55e;border:1px solid #22c55e44}
.cmmc-lc-badge.l2{background:#eab30822;color:#eab308;border:1px solid #eab30844}
.cmmc-lc-badge.l3{background:#a855f722;color:#a855f7;border:1px solid #a855f744}
.cmmc-lc-name{font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.35rem}
.cmmc-lc-stat{font-size:.78rem;color:#64748b;margin-bottom:.5rem}
.cmmc-lc-protects{font-size:.82rem;color:#94a3b8;margin-bottom:.5rem}
.cmmc-lc-key{color:#64748b;font-size:.75rem}
.cmmc-lc-desc{font-size:.82rem;color:#94a3b8;line-height:1.5;margin-bottom:.5rem}
.cmmc-lc-who{font-size:.82rem;color:#94a3b8}

/* FCI/CUI Explainer */
.cmmc-fci-cui{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin:1rem 0}
.cmmc-fci-cui-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:1rem;border-left:3px solid #22c55e44}
.cmmc-fci-cui-card.cui{border-left-color:#eab30844}
.cmmc-fci-cui-label{font-size:.82rem;font-weight:600;color:#e2e8f0;margin-bottom:.35rem}
.cmmc-fci-cui-text{font-size:.8rem;color:#94a3b8;line-height:1.5}

/* Callout Box */
.cmmc-callout{display:flex;gap:1rem;align-items:flex-start;background:${domain.color}0a;border:1px solid ${domain.color}33;border-radius:10px;padding:1.25rem;margin-top:1rem}
.cmmc-callout-icon{font-size:1.5rem;flex-shrink:0}
.cmmc-callout-title{font-size:.9rem;font-weight:600;color:${domain.color};margin-bottom:.35rem}
.cmmc-callout-text{font-size:.85rem;color:#94a3b8;line-height:1.6}
.cmmc-callout-text strong{color:#e2e8f0}

/* Distribution Chart */
.cmmc-dist-chart{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:.75rem 1rem;overflow:hidden}
.cmmc-dist-row{display:flex;align-items:center;gap:.5rem;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.03)}
.cmmc-dist-row:last-child{border-bottom:none}
.cmmc-dist-row.current{background:${domain.color}0a;border-radius:6px;padding:4px .5rem;margin:0 -.5rem}
.cmmc-dist-label{width:28px;font-size:.72rem;font-weight:700;color:#94a3b8;text-decoration:none;font-family:monospace;letter-spacing:.3px;flex-shrink:0}
.cmmc-dist-label:hover{color:${domain.color}}
.cmmc-dist-row.current .cmmc-dist-label{color:${domain.color}}
.cmmc-dist-bar-wrap{flex:1;display:flex;height:20px;gap:1px;align-items:center}
.cmmc-dist-bar{height:100%;border-radius:3px;font-size:.65rem;font-weight:600;display:flex;align-items:center;justify-content:center;min-width:0;transition:width .3s}
.cmmc-dist-bar.l1{background:#22c55e33;color:#22c55e}
.cmmc-dist-bar.l2{background:#eab30833;color:#eab308}
.cmmc-dist-total{font-size:.72rem;color:#64748b;width:22px;text-align:right;flex-shrink:0}
.cmmc-dist-legend{display:flex;gap:1.25rem;margin-bottom:.75rem}
.cmmc-dist-legend-item{display:flex;align-items:center;gap:.35rem;font-size:.75rem;color:#94a3b8}
.cmmc-dist-swatch{width:12px;height:12px;border-radius:3px}
.cmmc-dist-swatch.l1{background:#22c55e33;border:1px solid #22c55e66}
.cmmc-dist-swatch.l2{background:#eab30833;border:1px solid #eab30866}
.cmmc-dist-name{font-size:.7rem;color:#64748b;margin-left:.25rem;display:none}
.cmmc-dist-row:hover .cmmc-dist-name{display:inline}

/* Responsive */
@media(max-width:768px){
    .cmmc-level-cards{grid-template-columns:1fr}
    .cmmc-fci-cui{grid-template-columns:1fr}
}
@media(max-width:640px){
    #cmmc-root{padding:.75rem}
    .cmmc-header{padding:1rem 1.25rem}
    .cmmc-title{font-size:1.2rem}
    .cmmc-tab{min-width:0;font-size:.78rem;padding:.5rem .75rem}
    .cmmc-practice-head{padding:.75rem 1rem}
    .cmmc-stats{gap:.75rem}
    .cmmc-filter-bar{gap:.35rem}
    .cmmc-search{min-width:140px;margin-left:0;width:100%;margin-top:.5rem}
}
</style>

<a class="cmmc-back" href="/houses/shield/index.html">‹ Back to Shield House</a>

<div class="cmmc-header">
    <div class="cmmc-header-top">
        <span class="cmmc-icon">${domain.icon}</span>
        <span class="cmmc-title">${domain.name}</span>
        <span class="cmmc-badge">CMMC 2.0</span>
        <span class="cmmc-nist">NIST SP 800-171 § ${domain.nistSection}</span>
    </div>
    <p class="cmmc-desc">${domain.description}</p>
    <div class="cmmc-stats">
        <div class="cmmc-stat"><strong>${totalPractices}</strong> Practices</div>
        <div class="cmmc-stat"><strong>${l1}</strong> Level 1</div>
        <div class="cmmc-stat"><strong>${l2}</strong> Level 2</div>
        <div class="cmmc-stat"><strong>${domain.assessment.length}</strong> Questions</div>
    </div>
    <div class="cmmc-progress-wrap">
        <div class="cmmc-progress-bar"><div class="cmmc-progress-fill" style="width:${totalPractices?Math.round(reviewedCount/totalPractices*100):0}%"></div></div>
        <div class="cmmc-progress-text">${reviewedCount} of ${totalPractices} practices reviewed</div>
    </div>
</div>

<div class="cmmc-tabs">
    <button class="cmmc-tab active" data-tab="overview">Overview</button>
    <button class="cmmc-tab" data-tab="practices">Practices</button>
    <button class="cmmc-tab" data-tab="assessment">Self-Assessment</button>
    <button class="cmmc-tab" data-tab="resources">Resources</button>
</div>

<div id="panel-overview" class="cmmc-panel active"></div>
<div id="panel-practices" class="cmmc-panel"></div>
<div id="panel-assessment" class="cmmc-panel"></div>
<div id="panel-resources" class="cmmc-panel"></div>
`;
        document.body.innerHTML = '';
        document.body.appendChild(root);

        renderOverview();
        renderPractices();
        renderAssessment();
        renderResources();
        bindTabs();
    }

    /* ── Tab switching ── */
    function bindTabs() {
        document.querySelectorAll('.cmmc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.cmmc-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.cmmc-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* ── Overview ── */
    function renderOverview() {
        const panel = document.getElementById('panel-overview');
        const concepts = domain.keyConcepts.map(c => `<span class="cmmc-concept">${c}</span>`).join('');
        const related = domain.relatedDomains.map(code => {
            const d = CMMCDomainData[code];
            return d ? `<a class="cmmc-related-link" href="${domainHref(code)}">${d.icon} ${d.name} (${code})</a>` : '';
        }).join(' ');

        // Calculate level distribution across ALL domains
        const allCodes = ['AC','AT','AU','CM','IA','IR','MA','MP','PS','PE','RA','CA','SC','SI'];
        const distData = allCodes.map(code => {
            const d = CMMCDomainData[code];
            if (!d) return null;
            const dl1 = d.practices.filter(p => p.level === 1).length;
            const dl2 = d.practices.filter(p => p.level === 2).length;
            return { code, name: d.name, icon: d.icon, l1: dl1, l2: dl2, total: dl1 + dl2, isCurrent: code === domain.code };
        }).filter(Boolean);
        const totalL1 = distData.reduce((s, d) => s + d.l1, 0);
        const totalL2 = distData.reduce((s, d) => s + d.l2, 0);
        const domainL1 = domain.practices.filter(p => p.level === 1).length;
        const domainL2 = domain.practices.filter(p => p.level === 2).length;
        const hasL1 = domainL1 > 0;
        const hasL2 = domainL2 > 0;
        const domainsWithNoL1 = distData.filter(d => d.l1 === 0).length;

        // Contextual explanation for THIS domain
        let contextText = '';
        if (domainL1 === 0) {
            contextText = `<strong>${domain.name}</strong> has <strong>no Level 1 practices</strong> — all ${domainL2} practices are Level 2. This means organizations only pursuing Level 1 certification (basic FCI protection) do not need to implement ${domain.name} controls. These requirements apply at Level 2 and above, when the organization handles CUI.`;
        } else if (domainL1 > 0 && domainL2 > 0) {
            contextText = `<strong>${domain.name}</strong> spans both certification levels: <strong>${domainL1} Level 1</strong> practice${domainL1 > 1 ? 's' : ''} establish basic FCI safeguards, while <strong>${domainL2} additional Level 2</strong> practice${domainL2 > 1 ? 's' : ''} add the controls needed for CUI protection. An organization pursuing any CMMC level will need to address this domain.`;
        } else {
            contextText = `All <strong>${domainL1}</strong> practice${domainL1 > 1 ? 's' : ''} in <strong>${domain.name}</strong> are Level 1 fundamentals, required at every CMMC certification level.`;
        }

        // Distribution bar chart
        const maxPractices = Math.max(...distData.map(d => d.total));
        const distHTML = distData.map(d => {
            const l1Pct = maxPractices ? (d.l1 / maxPractices * 100) : 0;
            const l2Pct = maxPractices ? (d.l2 / maxPractices * 100) : 0;
            const highlight = d.isCurrent ? ' current' : '';
            return `<div class="cmmc-dist-row${highlight}">
                <a class="cmmc-dist-label" href="${domainHref(d.code)}">${d.code}</a>
                <div class="cmmc-dist-bar-wrap">
                    ${d.l1 > 0 ? `<div class="cmmc-dist-bar l1" style="width:${l1Pct}%" title="${d.l1} Level 1 practices">${d.l1}</div>` : ''}
                    <div class="cmmc-dist-bar l2" style="width:${l2Pct}%" title="${d.l2} Level 2 practices">${d.l2}</div>
                </div>
                <span class="cmmc-dist-total">${d.total}</span>
                <span class="cmmc-dist-name">${d.name}</span>
            </div>`;
        }).join('');

        panel.innerHTML = `
            <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.5rem">Key Concepts</h3>
            <div class="cmmc-concepts">${concepts}</div>

            <!-- CMMC Level Guide -->
            <div style="margin-top:1.75rem">
                <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.75rem">Understanding CMMC Levels</h3>
                <p style="color:#94a3b8;font-size:.85rem;line-height:1.6;margin-bottom:1rem">
                    CMMC 2.0 (Cybersecurity Maturity Model Certification) organizes cybersecurity requirements into
                    <strong style="color:#e2e8f0">three maturity levels</strong>. These levels are not difficulty ratings —
                    they are <strong style="color:#e2e8f0">compliance tiers</strong> that determine which security controls
                    an organization must implement based on the sensitivity of the data they handle. Not every domain has
                    practices at every level.
                </p>

                <div class="cmmc-level-cards">
                    <div class="cmmc-level-card${hasL1 ? ' active' : ''}">
                        <div class="cmmc-lc-badge l1">Level 1</div>
                        <div class="cmmc-lc-name">Foundational</div>
                        <div class="cmmc-lc-stat">${totalL1} practices across all domains</div>
                        <div class="cmmc-lc-protects"><span class="cmmc-lc-key">Protects:</span> FCI</div>
                        <div class="cmmc-lc-desc">Basic cyber hygiene — the minimum bar for any DoD contractor. Covers fundamental safeguards like limiting system access, verifying user identity, and controlling physical entry. Self-assessment only; no third-party audit required.</div>
                        <div class="cmmc-lc-who"><span class="cmmc-lc-key">Who needs it:</span> All DoD contractors handling Federal Contract Information</div>
                    </div>
                    <div class="cmmc-level-card${hasL2 ? ' active' : ''}">
                        <div class="cmmc-lc-badge l2">Level 2</div>
                        <div class="cmmc-lc-name">Advanced</div>
                        <div class="cmmc-lc-stat">110 practices (all of NIST SP 800-171)</div>
                        <div class="cmmc-lc-protects"><span class="cmmc-lc-key">Protects:</span> CUI</div>
                        <div class="cmmc-lc-desc">Comprehensive security program aligned with NIST SP 800-171 Rev 2. Encompasses all Level 1 practices plus advanced controls for configuration management, incident response, risk assessment, and more. Requires third-party assessment by a C3PAO for critical CUI programs.</div>
                        <div class="cmmc-lc-who"><span class="cmmc-lc-key">Who needs it:</span> Contractors handling Controlled Unclassified Information on DoD programs</div>
                    </div>
                    <div class="cmmc-level-card">
                        <div class="cmmc-lc-badge l3">Level 3</div>
                        <div class="cmmc-lc-name">Expert</div>
                        <div class="cmmc-lc-stat">110+ practices (adds NIST SP 800-172)</div>
                        <div class="cmmc-lc-protects"><span class="cmmc-lc-key">Protects:</span> CUI against APTs</div>
                        <div class="cmmc-lc-desc">Enhanced security designed to resist Advanced Persistent Threats — nation-state adversaries. Adds penetration-resistant architecture, threat hunting, and advanced incident response capabilities beyond Level 2. Government-led assessment required (DIBCAC).</div>
                        <div class="cmmc-lc-who"><span class="cmmc-lc-key">Who needs it:</span> Contractors on the highest-priority DoD programs</div>
                    </div>
                </div>

                <!-- FCI vs CUI -->
                <div class="cmmc-fci-cui">
                    <div class="cmmc-fci-cui-card">
                        <div class="cmmc-fci-cui-label">FCI — Federal Contract Information</div>
                        <div class="cmmc-fci-cui-text">Information provided by or generated for the government under contract, not intended for public release. Think contract schedules, pricing data, or contractor employee lists assigned to a project. Less sensitive — Level 1 is sufficient.</div>
                    </div>
                    <div class="cmmc-fci-cui-card cui">
                        <div class="cmmc-fci-cui-label">CUI — Controlled Unclassified Information</div>
                        <div class="cmmc-fci-cui-text">Government-created or owned information that laws or policies require safeguarding. More sensitive than FCI — think technical drawings for military systems, vulnerability scan results, or personnel security data. Requires Level 2 or higher.</div>
                    </div>
                </div>

                <!-- Contextual callout for this domain -->
                <div class="cmmc-callout">
                    <div class="cmmc-callout-icon">${domain.icon}</div>
                    <div>
                        <div class="cmmc-callout-title">What This Means for ${domain.name}</div>
                        <div class="cmmc-callout-text">${contextText}</div>
                    </div>
                </div>
            </div>

            <!-- Practice Distribution Chart -->
            <div style="margin-top:1.75rem">
                <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.75rem">Practice Distribution Across All Domains</h3>
                <p style="color:#94a3b8;font-size:.82rem;line-height:1.5;margin-bottom:.75rem">
                    Of the 110 total CMMC practices, only <strong style="color:#22c55e">${totalL1} are Level 1</strong> (green)
                    while <strong style="color:#eab308">${totalL2} are Level 2</strong> (yellow).
                    ${domainsWithNoL1} of 14 domains have zero Level 1 practices — their requirements only apply
                    when an organization pursues Level 2 certification.
                </p>
                <div class="cmmc-dist-legend">
                    <span class="cmmc-dist-legend-item"><span class="cmmc-dist-swatch l1"></span>Level 1 (FCI)</span>
                    <span class="cmmc-dist-legend-item"><span class="cmmc-dist-swatch l2"></span>Level 2 (CUI)</span>
                </div>
                <div class="cmmc-dist-chart">${distHTML}</div>
            </div>

            <!-- Practice Breakdown -->
            <div style="margin-top:1.75rem">
                <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.75rem">Practice Breakdown</h3>
                ${domain.practices.map(p => `
                    <div style="display:flex;align-items:center;gap:.5rem;padding:.3rem 0">
                        <span class="cmmc-practice-id ${p.level===1?'l1':'l2'}" style="min-width:100px;text-align:center">${p.id}</span>
                        <span style="font-size:.82rem;color:#94a3b8">${p.title}</span>
                        <span class="cmmc-practice-level ${p.level===1?'l1':'l2'}" style="margin-left:auto">L${p.level}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Related Domains -->
            <div class="cmmc-related" style="margin-top:1.5rem">
                <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.75rem">Related Domains</h3>
                <div style="display:flex;gap:.5rem;flex-wrap:wrap">${related}</div>
            </div>
        `;
    }

    /* ── Practices ── */
    function renderPractices() {
        const state = getState();
        const reviewed = state.reviewed || {};
        const panel = document.getElementById('panel-practices');

        panel.innerHTML = `
            <div class="cmmc-filter-bar">
                <button class="cmmc-filter-btn active" data-filter="all">All (${domain.practices.length})</button>
                <button class="cmmc-filter-btn" data-filter="1">Level 1</button>
                <button class="cmmc-filter-btn" data-filter="2">Level 2</button>
                <button class="cmmc-filter-btn" data-filter="reviewed">Reviewed</button>
                <input class="cmmc-search" placeholder="Search practices..." id="practiceSearch">
            </div>
            <div id="practiceList">
                ${domain.practices.map((p, i) => renderPracticeCard(p, i, reviewed)).join('')}
            </div>
        `;

        // Filter buttons
        panel.querySelectorAll('.cmmc-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.cmmc-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterPractices(btn.dataset.filter);
            });
        });

        // Search
        const searchInput = document.getElementById('practiceSearch');
        searchInput.addEventListener('input', () => filterPractices(
            panel.querySelector('.cmmc-filter-btn.active').dataset.filter,
            searchInput.value.toLowerCase()
        ));

        // Expand/collapse
        panel.querySelectorAll('.cmmc-practice-head').forEach(head => {
            head.addEventListener('click', () => {
                head.parentElement.classList.toggle('open');
            });
        });

        // Review toggles
        panel.querySelectorAll('.cmmc-review-check').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const st = getState();
                if (!st.reviewed) st.reviewed = {};
                if (e.target.checked) {
                    st.reviewed[id] = Date.now();
                    e.target.closest('.cmmc-review-toggle').classList.add('checked');
                } else {
                    delete st.reviewed[id];
                    e.target.closest('.cmmc-review-toggle').classList.remove('checked');
                }
                saveState(st);
                updateProgress();
            });
        });
    }

    function renderPracticeCard(p, idx, reviewed) {
        const isReviewed = !!reviewed[p.id];
        return `
        <div class="cmmc-practice" data-level="${p.level}" data-reviewed="${isReviewed}" data-search="${(p.id + ' ' + p.title + ' ' + p.requirement).toLowerCase()}">
            <div class="cmmc-practice-head">
                <span class="cmmc-practice-id ${p.level===1?'l1':'l2'}">${p.id}</span>
                <span class="cmmc-practice-title">${p.title}</span>
                <span class="cmmc-practice-level ${p.level===1?'l1':'l2'}">L${p.level}</span>
                <span class="cmmc-practice-toggle"><img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></span>
            </div>
            <div class="cmmc-practice-body">
                <div class="cmmc-practice-req">${p.requirement}</div>

                <div class="cmmc-detail-section">
                    <div class="cmmc-detail-label">Evidence Examples</div>
                    <ul class="cmmc-detail-list">${p.evidence.map(e => `<li>${e}</li>`).join('')}</ul>
                </div>

                <div class="cmmc-detail-section">
                    <div class="cmmc-detail-label">Interview Subjects</div>
                    <ul class="cmmc-detail-list">${p.interviewSubjects.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>

                <div class="cmmc-detail-section">
                    <div class="cmmc-detail-label">Test Procedures</div>
                    <ul class="cmmc-detail-list">${p.testProcedures.map(t => `<li>${t}</li>`).join('')}</ul>
                </div>

                <label class="cmmc-review-toggle ${isReviewed ? 'checked' : ''}">
                    <input type="checkbox" class="cmmc-review-check" data-id="${p.id}" ${isReviewed ? 'checked' : ''}>
                    Mark as reviewed
                </label>
            </div>
        </div>`;
    }

    function filterPractices(filter, search) {
        document.querySelectorAll('#practiceList .cmmc-practice').forEach(card => {
            let show = true;
            if (filter === '1') show = card.dataset.level === '1';
            else if (filter === '2') show = card.dataset.level === '2';
            else if (filter === 'reviewed') show = card.dataset.reviewed === 'true';
            if (show && search) {
                show = card.dataset.search.includes(search);
            }
            card.style.display = show ? '' : 'none';
        });
    }

    function updateProgress() {
        const state = getState();
        const reviewed = Object.keys(state.reviewed || {}).length;
        const total = domain.practices.length;
        const pct = total ? Math.round(reviewed / total * 100) : 0;
        const fill = document.querySelector('.cmmc-progress-fill');
        const text = document.querySelector('.cmmc-progress-text');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = reviewed + ' of ' + total + ' practices reviewed';

        // Update reviewed filter count for practice cards
        document.querySelectorAll('#practiceList .cmmc-practice').forEach(card => {
            const cb = card.querySelector('.cmmc-review-check');
            card.dataset.reviewed = cb && cb.checked ? 'true' : 'false';
        });
    }

    /* ── Assessment ── */
    function renderAssessment() {
        const panel = document.getElementById('panel-assessment');
        const state = getState();
        const answers = state.answers || {};
        const total = domain.assessment.length;
        let correctCount = 0;
        Object.entries(answers).forEach(([qi, ai]) => {
            if (domain.assessment[qi] && domain.assessment[qi].correct === ai) correctCount++;
        });
        const answeredCount = Object.keys(answers).length;
        const pct = total ? Math.round(correctCount / total * 100) : 0;

        panel.innerHTML = `
            <div class="cmmc-score-bar">
                <div class="cmmc-score-num">${answeredCount > 0 ? pct + '%' : '—'}</div>
                <div class="cmmc-score-label">${answeredCount} of ${total} answered${answeredCount > 0 ? ' · ' + correctCount + ' correct' : ''}</div>
                <div class="cmmc-score-bar-visual"><div class="cmmc-score-fill" style="width:${pct}%"></div></div>
                ${answeredCount > 0 ? '<button class="cmmc-reset-btn" id="resetAssessment">Reset Assessment</button>' : ''}
            </div>
            ${domain.assessment.map((q, i) => renderQuestion(q, i, answers)).join('')}
        `;

        // Bind option clicks
        panel.querySelectorAll('.cmmc-option:not(.answered)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const qi = parseInt(e.target.dataset.qi);
                const oi = parseInt(e.target.dataset.oi);
                answerQuestion(qi, oi);
            });
        });

        // Reset button
        const resetBtn = document.getElementById('resetAssessment');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const st = getState();
                delete st.answers;
                saveState(st);
                renderAssessment();
                recordScore(0, 0);
            });
        }
    }

    function renderQuestion(q, qi, answers) {
        const answered = qi in answers;
        const userAnswer = answers[qi];
        return `
        <div class="cmmc-question" id="q-${qi}">
            <div class="cmmc-q-num">Question ${qi + 1} of ${domain.assessment.length}</div>
            <div class="cmmc-q-text">${q.question}</div>
            ${q.options.map((opt, oi) => {
                let cls = 'cmmc-option';
                if (answered) {
                    cls += ' answered';
                    if (oi === q.correct) cls += ' correct right-answer';
                    else if (oi === userAnswer && oi !== q.correct) cls += ' wrong';
                }
                return `<button class="${cls}" data-qi="${qi}" data-oi="${oi}">${opt}</button>`;
            }).join('')}
            <div class="cmmc-explanation ${answered ? 'show' : ''}">${q.explanation}</div>
        </div>`;
    }

    function answerQuestion(qi, oi) {
        const st = getState();
        if (!st.answers) st.answers = {};
        if (qi in st.answers) return;
        st.answers[qi] = oi;
        saveState(st);
        renderAssessment();

        // Record to GameTracker if all answered
        const total = domain.assessment.length;
        const answeredCount = Object.keys(st.answers).length;
        if (answeredCount === total) {
            let correct = 0;
            Object.entries(st.answers).forEach(([q, a]) => {
                if (domain.assessment[q] && domain.assessment[q].correct === a) correct++;
            });
            recordScore(correct, total);
        }
    }

    function recordScore(correct, total) {
        if (typeof GameTracker !== 'undefined' && total > 0) {
            try {
                GameTracker.record('cmmc-' + domain.code.toLowerCase(), {
                    result: correct / total >= 0.7 ? 'success' : 'failure',
                    score: correct,
                    maxScore: total,
                    percentage: Math.round(correct / total * 100)
                });
            } catch(e) { /* GameTracker not loaded */ }
        }
        // Also save to legacy progress
        try {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            if (!progress.shield) progress.shield = {};
            progress.shield['cmmc-' + domain.code.toLowerCase()] = {
                completed: total > 0 && correct / total >= 0.7,
                score: correct,
                total: total,
                timestamp: Date.now()
            };
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
        } catch(e) {}
    }

    /* ── Resources ── */
    function renderResources() {
        const panel = document.getElementById('panel-resources');
        panel.innerHTML = `
            <h3 style="color:#fff;font-size:1.1rem;margin-bottom:1rem">Reference Materials</h3>
            ${domain.resources.map(r => `
                <a class="cmmc-resource" href="${r.url}" target="_blank" rel="noopener">
                    <span class="cmmc-resource-icon"><img src="/assets/images/icons/icon-document.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></span>
                    <div>
                        <div class="cmmc-resource-title">${r.title}</div>
                        <div class="cmmc-resource-url">${r.url}</div>
                    </div>
                </a>
            `).join('')}

            <h3 style="color:#fff;font-size:1.1rem;margin:1.5rem 0 1rem">Related CMMC Domains</h3>
            ${domain.relatedDomains.map(code => {
                const d = CMMCDomainData[code];
                if (!d) return '';
                return `<a class="cmmc-resource" href="${domainHref(code)}">
                    <span class="cmmc-resource-icon">${d.icon}</span>
                    <div>
                        <div class="cmmc-resource-title">${d.name} (${code})</div>
                        <div class="cmmc-resource-url">NIST SP 800-171 § ${d.nistSection} · ${d.practices.length} practices</div>
                    </div>
                </a>`;
            }).join('')}
        `;
    }

    return { init };
})();
