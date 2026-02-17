/**
 * RiskManagementRenderer.js — Shared renderer for risk management applets
 *
 * Usage: RiskManagementRenderer.init('risk_management')
 * Requires: RiskManagementData.js loaded first
 */
const RiskManagementRenderer = (() => {
    let topic = null;
    let storageKey = '';
    const ACCENT = '#a855f7';

    function getState() { try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; } }
    function saveState(state) { localStorage.setItem(storageKey, JSON.stringify(state)); }

    function init(id) {
        topic = RiskManagementData[id];
        if (!topic) { document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Topic not found: ' + id + '</p>'; return; }
        storageKey = 'hexworth_risk_' + id;
        render();
    }

    function render() {
        document.title = topic.name + ' | Shield House';
        const root = document.createElement('div');
        root.id = 'rm-root';
        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#rm-root{max-width:1100px;margin:0 auto;padding:1rem}

.rm-header{background:linear-gradient(135deg,#1a1020 0%,${ACCENT}22 100%);border:1px solid ${ACCENT}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.rm-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent)}
.rm-header-top{display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;flex-wrap:wrap}
.rm-icon{font-size:2.5rem}.rm-title{font-size:1.6rem;font-weight:700;color:#fff}
.rm-badge{background:${ACCENT}33;color:${ACCENT};border:1px solid ${ACCENT}66;padding:3px 12px;border-radius:20px;font-size:.75rem;font-weight:600;letter-spacing:.5px}
.rm-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.rm-concepts{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}
.rm-concept{background:${ACCENT}15;color:${ACCENT};border:1px solid ${ACCENT}33;padding:4px 12px;border-radius:20px;font-size:.8rem}

.rm-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.rm-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:110px;text-align:center}
.rm-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.rm-tab.active{background:${ACCENT}22;color:${ACCENT};border:1px solid ${ACCENT}44}

.rm-panel{display:none;animation:rmFade .3s ease}.rm-panel.active{display:block}
@keyframes rmFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.rm-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:.75rem;overflow:hidden;transition:all .2s}
.rm-section:hover{border-color:rgba(255,255,255,.12)}
.rm-section-head{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;cursor:pointer;user-select:none}
.rm-section-icon{font-size:1.3rem}.rm-section-title{font-weight:600;color:#e2e8f0;font-size:.95rem;flex:1}
.rm-section-toggle{color:#64748b;transition:transform .2s;font-size:.85rem}
.rm-section.open .rm-section-toggle{transform:rotate(90deg)}
.rm-section-body{display:none;padding:0 1.25rem 1.25rem;border-top:1px solid rgba(255,255,255,.04)}
.rm-section.open .rm-section-body{display:block}
.rm-section-content{color:#cbd5e1;font-size:.88rem;line-height:1.6;margin:1rem 0;padding:.75rem 1rem;background:rgba(255,255,255,.02);border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0}
.rm-detail-label{font-size:.75rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;margin-top:1rem}
.rm-detail-list{list-style:none;padding:0}
.rm-detail-list li{color:#94a3b8;font-size:.82rem;padding:3px 0 3px 1.25rem;position:relative;line-height:1.5}
.rm-detail-list li::before{content:'\\203A';position:absolute;left:.25rem;color:${ACCENT}88}
.rm-real-world{background:${ACCENT}08;border:1px solid ${ACCENT}22;border-radius:8px;padding:1rem;margin-top:1rem}
.rm-rw-label{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.rm-rw-text{color:#94a3b8;font-size:.84rem;line-height:1.6}

.rm-inter-title{font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.5rem}
.rm-inter-inst{color:#94a3b8;font-size:.88rem;margin-bottom:1.5rem}
.rm-challenge{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;margin-bottom:.75rem}
.rm-challenge-text{color:#e2e8f0;font-size:.9rem;line-height:1.5;margin-bottom:1rem}
.rm-challenge-opts{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem}
.rm-ch-btn{padding:.5rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#94a3b8;font-size:.82rem;cursor:pointer;transition:all .15s}
.rm-ch-btn:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.2)}
.rm-ch-btn.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.rm-ch-btn.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.rm-ch-btn.right-answer{border-color:#22c55e44;background:#22c55e08}
.rm-ch-exp{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.rm-ch-exp.show{display:block}
.rm-score-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem;text-align:center;margin-bottom:1rem}
.rm-score-num{font-size:1.5rem;font-weight:700;color:${ACCENT}}.rm-score-lbl{color:#64748b;font-size:.8rem}

.rm-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.rm-q-num{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.rm-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.rm-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.rm-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.rm-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.rm-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.rm-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.rm-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.rm-explanation.show{display:block}
.rm-quiz-score{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.rm-quiz-score-num{font-size:2rem;font-weight:700;color:${ACCENT}}
.rm-quiz-score-lbl{color:#64748b;font-size:.8rem;margin-top:.25rem}
.rm-bar{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.rm-bar-fill{height:100%;background:${ACCENT};border-radius:3px;transition:width .5s ease}
.rm-reset{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.rm-reset:hover{border-color:${ACCENT}66;color:${ACCENT}}
.rm-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.rm-back:hover{color:${ACCENT}}

@media(max-width:640px){#rm-root{padding:.75rem}.rm-header{padding:1rem 1.25rem}.rm-title{font-size:1.2rem}.rm-tab{min-width:0;font-size:.78rem;padding:.5rem .75rem}}
</style>

<a class="rm-back" href="/houses/shield/index.html">\\u2039 Back to Shield House</a>
<div class="rm-header">
    <div class="rm-header-top">
        <span class="rm-icon">${topic.icon}</span>
        <span class="rm-title">${topic.name}</span>
        <span class="rm-badge">RISK MANAGEMENT</span>
    </div>
    ${topic.subtitle ? '<p style="color:' + ACCENT + ';font-size:.85rem;margin-top:.25rem">' + topic.subtitle + '</p>' : ''}
    <p class="rm-desc">${topic.description}</p>
    <div class="rm-concepts">${topic.keyConcepts.map(c => '<span class="rm-concept">' + c + '</span>').join('')}</div>
</div>
<div class="rm-tabs">
    <button class="rm-tab active" data-tab="overview">Overview</button>
    <button class="rm-tab" data-tab="framework">Framework</button>
    <button class="rm-tab" data-tab="assessment">Assessment</button>
    <button class="rm-tab" data-tab="quiz">Quiz</button>
</div>
<div id="panel-overview" class="rm-panel active"></div>
<div id="panel-framework" class="rm-panel"></div>
<div id="panel-assessment" class="rm-panel"></div>
<div id="panel-quiz" class="rm-panel"></div>
`;
        document.body.innerHTML = '';
        document.body.appendChild(root);
        renderOverview(); renderFramework(); renderAssessment(); renderQuiz(); bindTabs();
    }

    function bindTabs() {
        document.querySelectorAll('.rm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.rm-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.rm-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    function renderOverview() {
        const panel = document.getElementById('panel-overview');
        let html = '<div style="color:#94a3b8;font-size:.9rem;line-height:1.6;margin-bottom:1.5rem"><p>This module covers <strong style="color:#e2e8f0">' + topic.sections.length + ' key areas</strong> of ' + topic.name + '.</p></div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.75rem;margin-bottom:1.5rem">';
        topic.sections.forEach(s => {
            html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem"><div style="font-size:1.5rem;margin-bottom:.5rem">' + s.icon + '</div>';
            html += '<div style="font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:.35rem">' + s.title + '</div>';
            html += '<div style="font-size:.8rem;color:#64748b;line-height:1.4">' + s.content.substring(0, 90) + '...</div></div>';
        });
        html += '</div>';
        html += '<div style="display:flex;gap:1.5rem;flex-wrap:wrap">';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.sections.length + '</strong> Concept Areas</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + (topic.interactive ? topic.interactive.items.length : 0) + '</strong> Scenarios</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.quiz.length + '</strong> Quiz Questions</div></div>';
        panel.innerHTML = html;
    }

    function renderFramework() {
        const panel = document.getElementById('panel-framework');
        let html = '';
        topic.sections.forEach((section, idx) => {
            html += '<div class="rm-section' + (idx === 0 ? ' open' : '') + '">';
            html += '<div class="rm-section-head"><span class="rm-section-icon">' + section.icon + '</span><span class="rm-section-title">' + section.title + '</span><span class="rm-section-toggle">\\u25B6</span></div>';
            html += '<div class="rm-section-body"><div class="rm-section-content">' + section.content + '</div>';
            if (section.details && section.details.length) { html += '<div class="rm-detail-label">Key Details</div><ul class="rm-detail-list">'; section.details.forEach(d => { html += '<li>' + d + '</li>'; }); html += '</ul>'; }
            if (section.realWorld) { html += '<div class="rm-real-world"><div class="rm-rw-label">Real-World Example</div><div class="rm-rw-text">' + section.realWorld + '</div></div>'; }
            html += '</div></div>';
        });
        panel.innerHTML = html;
        panel.querySelectorAll('.rm-section-head').forEach(head => { head.addEventListener('click', () => head.parentElement.classList.toggle('open')); });
    }

    function renderAssessment() {
        const panel = document.getElementById('panel-assessment');
        if (!topic.interactive) { panel.innerHTML = '<p style="color:#64748b;padding:1rem">No assessment available.</p>'; return; }
        const inter = topic.interactive;
        let score = 0;
        let html = '<div class="rm-inter-title">' + inter.title + '</div><div class="rm-inter-inst">' + inter.instructions + '</div>';
        html += '<div class="rm-score-box"><span class="rm-score-num" id="assess-score">0</span><span class="rm-score-lbl"> / ' + inter.items.length + ' correct</span></div>';
        inter.items.forEach((item, idx) => {
            html += '<div class="rm-challenge"><div class="rm-challenge-text">' + (idx + 1) + '. ' + item.scenario + '</div>';
            html += '<div class="rm-challenge-opts" id="assess-opts-' + idx + '">';
            [...new Set(inter.items.map(i => i.answer))].sort(() => Math.random() - 0.5).forEach(opt => { html += '<button class="rm-ch-btn" data-answer="' + opt + '">' + opt + '</button>'; });
            html += '</div><div class="rm-ch-exp" id="assess-exp-' + idx + '">' + item.explanation + '</div></div>';
        });
        html += '<button class="rm-reset" id="assess-reset">Reset Assessment</button>';
        panel.innerHTML = html;
        inter.items.forEach((item, idx) => {
            const c = document.getElementById('assess-opts-' + idx);
            c.querySelectorAll('.rm-ch-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    c.querySelectorAll('.rm-ch-btn').forEach(b => b.classList.add('answered'));
                    if (btn.dataset.answer === item.answer) { btn.classList.add('correct'); score++; }
                    else { btn.classList.add('wrong'); c.querySelectorAll('.rm-ch-btn').forEach(b => { if (b.dataset.answer === item.answer) b.classList.add('right-answer'); }); }
                    document.getElementById('assess-score').textContent = score;
                    document.getElementById('assess-exp-' + idx).classList.add('show');
                });
            });
        });
        document.getElementById('assess-reset').addEventListener('click', () => renderAssessment());
    }

    function renderQuiz() {
        const panel = document.getElementById('panel-quiz');
        const state = getState();
        let qs = state.quizScore || 0, qa = state.quizAnswered || 0, qans = state.quizAnswers || {};
        let html = '<div class="rm-quiz-score"><div class="rm-quiz-score-num" id="quiz-score">' + qs + ' / ' + topic.quiz.length + '</div>';
        html += '<div class="rm-quiz-score-lbl">Questions Correct</div><div class="rm-bar"><div class="rm-bar-fill" id="quiz-fill" style="width:' + (topic.quiz.length ? Math.round(qs / topic.quiz.length * 100) : 0) + '%"></div></div></div>';
        topic.quiz.forEach((q, idx) => {
            html += '<div class="rm-question"><div class="rm-q-num">Question ' + (idx + 1) + ' of ' + topic.quiz.length + '</div><div class="rm-q-text">' + q.question + '</div><div id="quiz-opts-' + idx + '">';
            q.options.forEach((opt, oi) => {
                let cls = 'rm-option';
                if (qans[idx] !== undefined) { cls += ' answered'; if (oi === q.correct) cls += ' correct'; else if (oi === qans[idx] && oi !== q.correct) cls += ' wrong'; }
                html += '<button class="' + cls + '" data-oi="' + oi + '">' + opt + '</button>';
            });
            html += '</div><div class="rm-explanation' + (qans[idx] !== undefined ? ' show' : '') + '" id="quiz-exp-' + idx + '">' + q.explanation + '</div></div>';
        });
        html += '<button class="rm-reset" id="quiz-reset">Reset Quiz</button>';
        panel.innerHTML = html;
        topic.quiz.forEach((q, idx) => {
            if (qans[idx] !== undefined) return;
            const c = document.getElementById('quiz-opts-' + idx);
            c.querySelectorAll('.rm-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    const oi = parseInt(btn.dataset.oi);
                    c.querySelectorAll('.rm-option').forEach(b => b.classList.add('answered'));
                    qa++; qans[idx] = oi;
                    if (oi === q.correct) { btn.classList.add('correct'); qs++; }
                    else { btn.classList.add('wrong'); c.querySelectorAll('.rm-option').forEach(b => { if (parseInt(b.dataset.oi) === q.correct) b.classList.add('correct'); }); }
                    document.getElementById('quiz-exp-' + idx).classList.add('show');
                    document.getElementById('quiz-score').textContent = qs + ' / ' + topic.quiz.length;
                    document.getElementById('quiz-fill').style.width = Math.round(qs / topic.quiz.length * 100) + '%';
                    const s = getState(); s.quizScore = qs; s.quizAnswered = qa; s.quizAnswers = qans; saveState(s);
                    if (qa === topic.quiz.length && typeof GameTracker !== 'undefined') {
                        try { GameTracker.record('shield-' + topic.id + '-quiz', qs, topic.quiz.length, { house: 'shield', type: 'risk-quiz' }); } catch (e) {}
                    }
                });
            });
        });
        document.getElementById('quiz-reset').addEventListener('click', () => { const s = getState(); delete s.quizScore; delete s.quizAnswered; delete s.quizAnswers; saveState(s); renderQuiz(); });
    }

    return { init };
})();
