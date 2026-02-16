/**
 * ThreatAppletRenderer.js — Shared renderer for Threat Intelligence applets
 *
 * 5 tabs: Overview, Attack Flow, Detection, Defense, Quiz
 * Red/orange threat theming (#f87171 / #fb923c)
 *
 * Usage: ThreatAppletRenderer.init('APT')
 * Requires: ThreatAppletData.js loaded first
 */
const ThreatAppletRenderer = (() => {
    let threat = null;
    let storageKey = '';
    const PRIMARY = '#f87171';    // red accent
    const SECONDARY = '#fb923c';  // orange accent

    const TOPIC_PATHS = {
        APT: 'apt', BOTNETS: 'botnets', BUFFER_OVERFLOW: 'buffer_overflow_attack',
        CRYPTOJACKING: 'cryptojacking', DDOS: 'ddos', DNS_ATTACKS: 'dns_attacks',
        INSIDER_THREATS: 'insider_threats', IOT_THREATS: 'iot_threats', MITM: 'mitm',
        PHISHING: 'phishing', PRIVILEGE_ESCALATION: 'privilege_escalation',
        RANSOMWARE: 'ransomware_attack', ROOTKITS: 'rootkits',
        SOCIAL_ENGINEERING: 'social_engineering_attack', SUPPLY_CHAIN: 'supply_chain',
        ZERO_DAY: 'zero_day'
    };

    const SEVERITY_COLORS = {
        critical: { bg: '#dc262622', border: '#dc262666', text: '#f87171', label: 'CRITICAL' },
        high:     { bg: '#f9731622', border: '#f9731666', text: '#fb923c', label: 'HIGH' },
        medium:   { bg: '#eab30822', border: '#eab30866', text: '#fbbf24', label: 'MEDIUM' },
        low:      { bg: '#22c55e22', border: '#22c55e66', text: '#4ade80', label: 'LOW' }
    };

    function topicHref(code) {
        const dir = TOPIC_PATHS[code];
        if (!dir) return '#';
        return '../' + dir + '/shield-threat-' + code.toLowerCase().replace(/_/g, '-') + '.applet.html';
    }

    function getState() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
        catch { return {}; }
    }

    function saveState(state) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function init(code) {
        threat = ThreatAppletData[code];
        if (!threat) {
            document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Threat topic not found: ' + code + '</p>';
            return;
        }
        storageKey = 'hexworth_threat_' + code.toLowerCase();
        render();
    }

    /* ================================================================
     *  MAIN RENDER
     * ================================================================ */
    function render() {
        const state = getState();
        const sev = SEVERITY_COLORS[threat.severity] || SEVERITY_COLORS.high;
        const quizAnswered = Object.keys(state.answers || {}).length;
        const quizTotal = threat.quiz.length;

        document.title = 'Threat Intel \u2014 ' + threat.title;

        const root = document.createElement('div');
        root.id = 'threat-root';
        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#threat-root{max-width:1100px;margin:0 auto;padding:1rem}

/* Header */
.th-header{background:linear-gradient(135deg,#1a1020 0%,${PRIMARY}12 50%,${SECONDARY}08 100%);border:1px solid ${PRIMARY}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.th-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${PRIMARY},${SECONDARY},transparent)}
.th-header-top{display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;flex-wrap:wrap}
.th-icon{font-size:2.5rem}
.th-title{font-size:1.6rem;font-weight:700;color:#fff}
.th-sev-badge{background:${sev.bg};color:${sev.text};border:1px solid ${sev.border};padding:3px 12px;border-radius:20px;font-size:.72rem;font-weight:700;letter-spacing:.5px}
.th-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.th-stats{display:flex;gap:1.5rem;margin-top:1rem;flex-wrap:wrap}
.th-stat{background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem}
.th-stat strong{color:#fff;font-size:1.1rem;margin-right:.25rem}

/* Progress bar */
.th-progress-wrap{margin-top:1rem}
.th-progress-bar{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.th-progress-fill{height:100%;background:linear-gradient(90deg,${PRIMARY},${SECONDARY});border-radius:2px;transition:width .5s ease}
.th-progress-text{font-size:.72rem;color:#64748b;margin-top:.35rem;text-align:right}

/* Tabs */
.th-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.th-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:90px;text-align:center}
.th-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.th-tab.active{background:${PRIMARY}18;color:${PRIMARY};border:1px solid ${PRIMARY}44}

/* Panels */
.th-panel{display:none;animation:thFadeIn .3s ease}
.th-panel.active{display:block}
@keyframes thFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Section headers */
.th-section-title{color:#fff;font-size:1.1rem;font-weight:600;margin:1.5rem 0 .75rem;display:flex;align-items:center;gap:.5rem}
.th-section-title:first-child{margin-top:0}

/* Overview cards */
.th-what{color:#cbd5e1;font-size:.9rem;line-height:1.7;padding:1rem 1.25rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:1rem}
.th-key-points{list-style:none;padding:0}
.th-key-points li{color:#94a3b8;font-size:.85rem;padding:.4rem 0 .4rem 1.5rem;position:relative;line-height:1.5}
.th-key-points li::before{content:'\u25B8';position:absolute;left:.25rem;color:${PRIMARY}}

/* Example cards */
.th-example{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1rem 1.25rem;margin-bottom:.5rem;border-left:3px solid ${PRIMARY}44}
.th-example-name{font-weight:600;color:${SECONDARY};font-size:.9rem;margin-bottom:.35rem}
.th-example-detail{color:#94a3b8;font-size:.84rem;line-height:1.5}

/* Stats row */
.th-stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;margin-top:.5rem;margin-bottom:1rem}
.th-stat-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1rem;text-align:center}
.th-stat-value{font-size:1.5rem;font-weight:700;color:${PRIMARY};margin-bottom:.25rem}
.th-stat-label{font-size:.78rem;color:#94a3b8}
.th-stat-note{font-size:.68rem;color:#64748b;margin-top:.25rem}

/* Attack Flow */
.th-flow{position:relative;padding-left:2.5rem}
.th-flow::before{content:'';position:absolute;left:1.1rem;top:0;bottom:0;width:2px;background:linear-gradient(180deg,${PRIMARY}66,${SECONDARY}33,${PRIMARY}11)}
.th-step{position:relative;margin-bottom:1.25rem;padding:.75rem 1rem .75rem 0}
.th-step-num{position:absolute;left:-2.5rem;width:2.2rem;height:2.2rem;background:${PRIMARY}22;border:2px solid ${PRIMARY}66;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:${PRIMARY};z-index:1}
.th-step-icon{position:absolute;left:-2.5rem;width:2.2rem;height:2.2rem;background:#0a0a0f;border:2px solid ${PRIMARY}66;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;z-index:1}
.th-step-phase{font-weight:600;color:#fff;font-size:.92rem;margin-bottom:.35rem}
.th-step-desc{color:#94a3b8;font-size:.84rem;line-height:1.6}
.th-step-connector{position:absolute;left:-1.55rem;top:2.2rem;width:12px;height:2px;background:${PRIMARY}33}

/* Detection / IOC cards */
.th-ioc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:.75rem;margin-bottom:1.5rem}
.th-ioc-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1rem 1.25rem;border-left:3px solid ${SECONDARY}55}
.th-ioc-card.network{border-left-color:#60a5fa55}
.th-ioc-card.host{border-left-color:#f8717155}
.th-ioc-card.behavioral{border-left-color:#a78bfa55}
.th-ioc-type{font-size:.7rem;color:${SECONDARY};font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.th-ioc-card.network .th-ioc-type{color:#60a5fa}
.th-ioc-card.host .th-ioc-type{color:#f87171}
.th-ioc-card.behavioral .th-ioc-type{color:#a78bfa}
.th-ioc-item{color:#94a3b8;font-size:.84rem;padding:.35rem 0 .35rem 1.25rem;position:relative;line-height:1.5}
.th-ioc-item::before{content:'\u25AA';position:absolute;left:.25rem;color:${SECONDARY};font-size:.6rem;top:.55rem}
.th-ioc-card.network .th-ioc-item::before{color:#60a5fa}
.th-ioc-card.host .th-ioc-item::before{color:#f87171}
.th-ioc-card.behavioral .th-ioc-item::before{color:#a78bfa}
.th-ioc-tools{margin-top:1rem}
.th-ioc-tools-title{font-size:.78rem;color:${PRIMARY};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.th-ioc-tool{display:inline-block;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:.35rem .75rem;border-radius:6px;color:#94a3b8;font-size:.8rem;margin:.2rem .3rem .2rem 0;transition:all .2s}
.th-ioc-tool:hover{background:rgba(255,255,255,.06);color:#e2e8f0}

/* Defense cards */
.th-defense-section{margin-bottom:1.5rem}
.th-defense-label{font-size:.78rem;color:${PRIMARY};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem}
.th-defense-list{list-style:none;padding:0}
.th-defense-list li{color:#94a3b8;font-size:.85rem;padding:.5rem .75rem .5rem 2rem;position:relative;line-height:1.5;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);border-radius:8px;margin-bottom:.35rem;transition:all .2s}
.th-defense-list li:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
.th-defense-list li::before{position:absolute;left:.75rem;top:.55rem}
.th-prevent-list li::before{content:'\u{1F6E1}';font-size:.7rem}
.th-respond-list li::before{content:'\u26A1';font-size:.7rem}

/* Interactive scenario */
.th-scenario{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1.5rem;margin-top:1rem}
.th-scenario-title{font-size:1rem;font-weight:600;color:#fff;margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem}
.th-scenario-prompt{color:#cbd5e1;font-size:.88rem;line-height:1.6;margin-bottom:1rem;padding:.75rem 1rem;background:rgba(255,255,255,.02);border-left:3px solid ${SECONDARY}66;border-radius:0 8px 8px 0}
.th-scenario-option{display:block;width:100%;text-align:left;padding:.75rem 1rem;margin-bottom:.4rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.th-scenario-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:${SECONDARY}44}
.th-scenario-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.th-scenario-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.th-scenario-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.th-scenario-feedback{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${PRIMARY}08;border-left:3px solid ${PRIMARY}55;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.th-scenario-feedback.show{display:block}

/* Quiz */
.th-quiz-bar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.th-quiz-score{font-size:2rem;font-weight:700;color:${PRIMARY}}
.th-quiz-label{color:#64748b;font-size:.8rem;margin-top:.25rem}
.th-quiz-bar-visual{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.th-quiz-fill{height:100%;background:linear-gradient(90deg,${PRIMARY},${SECONDARY});border-radius:3px;transition:width .5s ease}
.th-reset-btn{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.th-reset-btn:hover{border-color:${PRIMARY}66;color:${PRIMARY}}

.th-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.th-q-num{font-size:.72rem;color:${SECONDARY};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.th-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.th-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.th-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.th-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.th-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.th-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.th-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${PRIMARY}08;border-left:3px solid ${PRIMARY}55;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.th-explanation.show{display:block}

/* Related topics */
.th-related{margin-top:1.5rem}
.th-related-link{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:.5rem 1rem;border-radius:8px;color:#94a3b8;text-decoration:none;font-size:.85rem;cursor:pointer;transition:all .2s;margin:.25rem .25rem .25rem 0}
.th-related-link:hover{background:rgba(255,255,255,.08);color:#e2e8f0;border-color:${PRIMARY}44}

/* Back link */
.th-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.th-back:hover{color:${PRIMARY}}

/* MITRE Badge */
.th-mitre{display:inline-flex;align-items:center;gap:.35rem;background:${PRIMARY}12;border:1px solid ${PRIMARY}33;padding:3px 10px;border-radius:6px;font-size:.72rem;font-weight:600;color:${PRIMARY};letter-spacing:.3px;font-family:monospace}

/* Responsive */
@media(max-width:768px){
    .th-stats-row{grid-template-columns:1fr 1fr}
    .th-ioc-grid{grid-template-columns:1fr}
}
@media(max-width:640px){
    #threat-root{padding:.75rem}
    .th-header{padding:1rem 1.25rem}
    .th-title{font-size:1.2rem}
    .th-tab{min-width:0;font-size:.75rem;padding:.5rem .5rem}
    .th-stats-row{grid-template-columns:1fr}
    .th-flow{padding-left:2rem}
    .th-step-icon{left:-2rem;width:1.8rem;height:1.8rem;font-size:.8rem}
}
</style>

<a class="th-back" href="../../../index.html">\u2039 Back to Shield House</a>

<div class="th-header">
    <div class="th-header-top">
        <span class="th-icon">${threat.icon}</span>
        <span class="th-title">${threat.title}</span>
        <span class="th-sev-badge">${sev.label}</span>
    </div>
    <p class="th-desc">${threat.description}</p>
    <div class="th-stats">
        ${threat.overview.stats.map(s => '<div class="th-stat"><strong>' + s.value + '</strong> ' + s.label + '</div>').join('')}
    </div>
    <div class="th-progress-wrap">
        <div class="th-progress-bar"><div class="th-progress-fill" style="width:${quizTotal ? Math.round(quizAnswered / quizTotal * 100) : 0}%"></div></div>
        <div class="th-progress-text">${quizAnswered} of ${quizTotal} quiz questions answered</div>
    </div>
</div>

<div class="th-tabs">
    <button class="th-tab active" data-tab="overview">\u{1F4D6} Overview</button>
    <button class="th-tab" data-tab="attack-flow">\u26A1 Attack Flow</button>
    <button class="th-tab" data-tab="detection">\u{1F50D} Detection</button>
    <button class="th-tab" data-tab="defense">\u{1F6E1} Defense</button>
    <button class="th-tab" data-tab="quiz">\u{1F9E0} Quiz</button>
</div>

<div id="panel-overview" class="th-panel active"></div>
<div id="panel-attack-flow" class="th-panel"></div>
<div id="panel-detection" class="th-panel"></div>
<div id="panel-defense" class="th-panel"></div>
<div id="panel-quiz" class="th-panel"></div>
`;
        document.body.innerHTML = '';
        document.body.appendChild(root);

        renderOverview();
        renderAttackFlow();
        renderDetection();
        renderDefense();
        renderQuiz();
        bindTabs();
    }

    /* -- Tab switching -- */
    function bindTabs() {
        document.querySelectorAll('.th-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.th-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.th-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* ================================================================
     *  OVERVIEW TAB
     * ================================================================ */
    function renderOverview() {
        const panel = document.getElementById('panel-overview');
        const ov = threat.overview;

        // Build related topics (all other topics)
        const allCodes = Object.keys(ThreatAppletData);
        const related = allCodes.filter(c => c !== threat.code).map(code => {
            const t = ThreatAppletData[code];
            return '<a class="th-related-link" href="' + topicHref(code) + '">' + t.icon + ' ' + t.title + '</a>';
        }).join('');

        panel.innerHTML = `
            <h3 class="th-section-title">\u{1F4CB} What Is It?</h3>
            <div class="th-what">${ov.what}</div>

            <h3 class="th-section-title">\u{1F511} Key Points</h3>
            <ul class="th-key-points">
                ${ov.keyPoints.map(k => '<li>' + k + '</li>').join('')}
            </ul>

            <h3 class="th-section-title">\u{1F4CA} Key Statistics</h3>
            <div class="th-stats-row">
                ${ov.stats.map(s => `
                    <div class="th-stat-card">
                        <div class="th-stat-value">${s.value}</div>
                        <div class="th-stat-label">${s.label}</div>
                        <div class="th-stat-note">${s.note}</div>
                    </div>
                `).join('')}
            </div>

            <h3 class="th-section-title">\u{1F30D} Real-World Examples</h3>
            ${ov.examples.map(ex => `
                <div class="th-example">
                    <div class="th-example-name">${ex.name}</div>
                    <div class="th-example-detail">${ex.detail}</div>
                </div>
            `).join('')}

            <div class="th-related" style="margin-top:2rem">
                <h3 class="th-section-title">\u{1F517} Explore Other Threats</h3>
                <div style="display:flex;flex-wrap:wrap;gap:0">${related}</div>
            </div>
        `;
    }

    /* ================================================================
     *  ATTACK FLOW TAB
     * ================================================================ */
    function renderAttackFlow() {
        const panel = document.getElementById('panel-attack-flow');
        const af = threat.attackFlow;

        panel.innerHTML = `
            <h3 class="th-section-title">\u26A1 ${af.title}</h3>
            <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin-bottom:1.5rem">
                Follow the step-by-step progression of how this attack unfolds, from initial reconnaissance through final objective. Understanding the attack lifecycle is essential for building effective defenses at each stage.
            </p>
            <div class="th-flow">
                ${af.steps.map((step, i) => `
                    <div class="th-step">
                        <div class="th-step-icon">${step.icon}</div>
                        <div class="th-step-phase">
                            <span style="color:${PRIMARY};font-size:.72rem;font-weight:700;margin-right:.5rem">STEP ${i + 1}</span>
                            ${step.phase}
                        </div>
                        <div class="th-step-desc">${step.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /* ================================================================
     *  DETECTION TAB (NEW — Indicators of Compromise)
     * ================================================================ */
    function renderDetection() {
        const panel = document.getElementById('panel-detection');
        const ind = threat.indicators;

        // Build IOC cards by category
        const categories = [
            { key: 'network', label: 'Network Indicators', icon: '\u{1F310}' },
            { key: 'host', label: 'Host-Based Indicators', icon: '\u{1F5A5}' },
            { key: 'behavioral', label: 'Behavioral Indicators', icon: '\u{1F441}' }
        ];

        const iocCards = categories.map(cat => {
            const items = ind[cat.key];
            if (!items || items.length === 0) return '';
            return `
                <div class="th-ioc-card ${cat.key}">
                    <div class="th-ioc-type">${cat.icon} ${cat.label}</div>
                    ${items.map(item => '<div class="th-ioc-item">' + item + '</div>').join('')}
                </div>
            `;
        }).join('');

        // Build detection tools
        const toolsHTML = ind.tools && ind.tools.length > 0
            ? `<div class="th-ioc-tools">
                    <div class="th-ioc-tools-title">\u{1F6E0} Detection Tools & Techniques</div>
                    <div>${ind.tools.map(t => '<span class="th-ioc-tool">' + t + '</span>').join('')}</div>
               </div>`
            : '';

        // Interactive scenario
        const scenarioHTML = threat.interactive ? renderScenario() : '';

        panel.innerHTML = `
            <h3 class="th-section-title">\u{1F50D} Indicators of Compromise (IOCs)</h3>
            <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin-bottom:1.25rem">
                These are the observable artifacts and patterns that indicate this threat may be present in your environment.
                Effective detection requires monitoring across network, host, and behavioral dimensions.
            </p>
            <div class="th-ioc-grid">${iocCards}</div>
            ${toolsHTML}
            ${scenarioHTML}
        `;

        // Bind scenario interactions if present
        if (threat.interactive) bindScenario();
    }

    /* ================================================================
     *  INTERACTIVE SCENARIO (rendered within Detection tab)
     * ================================================================ */
    function renderScenario() {
        const sc = threat.interactive;
        const state = getState();
        const answered = state.scenarioAnswer !== undefined;
        const userAnswer = state.scenarioAnswer;

        return `
            <div class="th-scenario" style="margin-top:1.5rem">
                <div class="th-scenario-title">\u{1F3AF} Scenario Exercise</div>
                <div class="th-scenario-prompt">${sc.scenario}</div>
                ${sc.options.map((opt, i) => {
                    let cls = 'th-scenario-option';
                    if (answered) {
                        cls += ' answered';
                        if (i === sc.correct) cls += ' correct right-answer';
                        else if (i === userAnswer && i !== sc.correct) cls += ' wrong';
                    }
                    return '<button class="' + cls + '" data-si="' + i + '">' + opt + '</button>';
                }).join('')}
                <div class="th-scenario-feedback ${answered ? 'show' : ''}">${sc.explanation}</div>
            </div>
        `;
    }

    function bindScenario() {
        document.querySelectorAll('.th-scenario-option:not(.answered)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const si = parseInt(e.target.dataset.si);
                const st = getState();
                if (st.scenarioAnswer !== undefined) return;
                st.scenarioAnswer = si;
                saveState(st);
                renderDetection();
            });
        });
    }

    /* ================================================================
     *  DEFENSE TAB
     * ================================================================ */
    function renderDefense() {
        const panel = document.getElementById('panel-defense');
        const def = threat.defense;

        panel.innerHTML = `
            <h3 class="th-section-title" style="margin-top:0">\u{1F6E1} Prevention Strategies</h3>
            <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin-bottom:1rem">
                Proactive measures to reduce the risk and impact of this threat before it occurs.
            </p>
            <div class="th-defense-section">
                <ul class="th-defense-list th-prevent-list">
                    ${def.prevention.map(p => '<li>' + p + '</li>').join('')}
                </ul>
            </div>

            <h3 class="th-section-title">\u26A1 Incident Response Procedures</h3>
            <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin-bottom:1rem">
                Steps to take when this threat is detected or confirmed in your environment.
            </p>
            <div class="th-defense-section">
                <ul class="th-defense-list th-respond-list">
                    ${def.response.map(r => '<li>' + r + '</li>').join('')}
                </ul>
            </div>
        `;
    }

    /* ================================================================
     *  QUIZ TAB
     * ================================================================ */
    function renderQuiz() {
        const panel = document.getElementById('panel-quiz');
        const state = getState();
        const answers = state.answers || {};
        const total = threat.quiz.length;
        let correctCount = 0;
        Object.entries(answers).forEach(([qi, ai]) => {
            if (threat.quiz[qi] && threat.quiz[qi].correct === ai) correctCount++;
        });
        const answeredCount = Object.keys(answers).length;
        const pct = total ? Math.round(correctCount / total * 100) : 0;

        panel.innerHTML = `
            <div class="th-quiz-bar">
                <div class="th-quiz-score">${answeredCount > 0 ? pct + '%' : '\u2014'}</div>
                <div class="th-quiz-label">${answeredCount} of ${total} answered${answeredCount > 0 ? ' \u00B7 ' + correctCount + ' correct' : ''}</div>
                <div class="th-quiz-bar-visual"><div class="th-quiz-fill" style="width:${pct}%"></div></div>
                ${answeredCount > 0 ? '<button class="th-reset-btn" id="resetQuiz">Reset Quiz</button>' : ''}
            </div>
            ${threat.quiz.map((q, i) => renderQuestion(q, i, answers)).join('')}
        `;

        // Bind option clicks
        panel.querySelectorAll('.th-option:not(.answered)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const qi = parseInt(e.target.dataset.qi);
                const oi = parseInt(e.target.dataset.oi);
                answerQuestion(qi, oi);
            });
        });

        // Reset button
        const resetBtn = document.getElementById('resetQuiz');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const st = getState();
                delete st.answers;
                saveState(st);
                renderQuiz();
                updateProgress();
                recordScore(0, 0);
            });
        }
    }

    function renderQuestion(q, qi, answers) {
        const answered = qi in answers;
        const userAnswer = answers[qi];
        return `
        <div class="th-question" id="q-${qi}">
            <div class="th-q-num">Question ${qi + 1} of ${threat.quiz.length}</div>
            <div class="th-q-text">${q.question}</div>
            ${q.options.map((opt, oi) => {
                let cls = 'th-option';
                if (answered) {
                    cls += ' answered';
                    if (oi === q.correct) cls += ' correct right-answer';
                    else if (oi === userAnswer && oi !== q.correct) cls += ' wrong';
                }
                return '<button class="' + cls + '" data-qi="' + qi + '" data-oi="' + oi + '">' + opt + '</button>';
            }).join('')}
            <div class="th-explanation ${answered ? 'show' : ''}">${q.explanation}</div>
        </div>`;
    }

    function answerQuestion(qi, oi) {
        const st = getState();
        if (!st.answers) st.answers = {};
        if (qi in st.answers) return;
        st.answers[qi] = oi;
        saveState(st);
        renderQuiz();
        updateProgress();

        // Record to GameTracker if all answered
        const total = threat.quiz.length;
        const answeredCount = Object.keys(st.answers).length;
        if (answeredCount === total) {
            let correct = 0;
            Object.entries(st.answers).forEach(([q, a]) => {
                if (threat.quiz[q] && threat.quiz[q].correct === a) correct++;
            });
            recordScore(correct, total);
        }
    }

    function recordScore(correct, total) {
        if (typeof GameTracker !== 'undefined' && total > 0) {
            try {
                GameTracker.record('threat-' + threat.code.toLowerCase().replace(/_/g, '-'), {
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
            progress.shield['threat-' + threat.code.toLowerCase().replace(/_/g, '-')] = {
                completed: total > 0 && correct / total >= 0.7,
                score: correct,
                total: total,
                timestamp: Date.now()
            };
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
        } catch(e) {}
    }

    function updateProgress() {
        const state = getState();
        const answered = Object.keys(state.answers || {}).length;
        const total = threat.quiz.length;
        const pct = total ? Math.round(answered / total * 100) : 0;
        const fill = document.querySelector('.th-progress-fill');
        const text = document.querySelector('.th-progress-text');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = answered + ' of ' + total + ' quiz questions answered';
    }

    return { init };
})();
