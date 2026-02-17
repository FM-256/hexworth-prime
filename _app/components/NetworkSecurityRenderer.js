/**
 * NetworkSecurityRenderer.js — Shared renderer for network security applets
 *
 * Usage: NetworkSecurityRenderer.init('firewalls')
 * Requires: NetworkSecurityData.js loaded first
 */
const NetworkSecurityRenderer = (() => {
    let topic = null;
    let storageKey = '';
    const ACCENT = '#a855f7';

    function getState() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
    }
    function saveState(state) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function init(id) {
        topic = NetworkSecurityData[id];
        if (!topic) { document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Topic not found: ' + id + '</p>'; return; }
        storageKey = 'hexworth_netsec_' + id;
        render();
    }

    function render() {
        document.title = topic.name + ' | Shield House';

        const root = document.createElement('div');
        root.id = 'ns-root';
        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#ns-root{max-width:1100px;margin:0 auto;padding:1rem}

.ns-header{background:linear-gradient(135deg,#1a1020 0%,${ACCENT}22 100%);border:1px solid ${ACCENT}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.ns-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent)}
.ns-header-top{display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;flex-wrap:wrap}
.ns-icon{font-size:2.5rem}
.ns-title{font-size:1.6rem;font-weight:700;color:#fff}
.ns-badge{background:${ACCENT}33;color:${ACCENT};border:1px solid ${ACCENT}66;padding:3px 12px;border-radius:20px;font-size:.75rem;font-weight:600;letter-spacing:.5px}
.ns-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.ns-concepts{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}
.ns-concept{background:${ACCENT}15;color:${ACCENT};border:1px solid ${ACCENT}33;padding:4px 12px;border-radius:20px;font-size:.8rem}

.ns-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.ns-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:120px;text-align:center}
.ns-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.ns-tab.active{background:${ACCENT}22;color:${ACCENT};border:1px solid ${ACCENT}44}

.ns-panel{display:none;animation:nsFade .3s ease}
.ns-panel.active{display:block}
@keyframes nsFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Section cards */
.ns-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:.75rem;overflow:hidden;transition:all .2s}
.ns-section:hover{border-color:rgba(255,255,255,.12)}
.ns-section-head{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;cursor:pointer;user-select:none}
.ns-section-icon{font-size:1.3rem}
.ns-section-title{font-weight:600;color:#e2e8f0;font-size:.95rem;flex:1}
.ns-section-toggle{color:#64748b;transition:transform .2s;font-size:.85rem}
.ns-section.open .ns-section-toggle{transform:rotate(90deg)}
.ns-section-body{display:none;padding:0 1.25rem 1.25rem;border-top:1px solid rgba(255,255,255,.04)}
.ns-section.open .ns-section-body{display:block}
.ns-section-content{color:#cbd5e1;font-size:.88rem;line-height:1.6;margin:1rem 0;padding:.75rem 1rem;background:rgba(255,255,255,.02);border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0}
.ns-detail-label{font-size:.75rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;margin-top:1rem}
.ns-detail-list{list-style:none;padding:0}
.ns-detail-list li{color:#94a3b8;font-size:.82rem;padding:3px 0 3px 1.25rem;position:relative;line-height:1.5}
.ns-detail-list li::before{content:'\\203A';position:absolute;left:.25rem;color:${ACCENT}88}
.ns-real-world{background:${ACCENT}08;border:1px solid ${ACCENT}22;border-radius:8px;padding:1rem;margin-top:1rem}
.ns-rw-label{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.ns-rw-text{color:#94a3b8;font-size:.84rem;line-height:1.6}

/* Interactive */
.ns-inter-title{font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.5rem}
.ns-inter-inst{color:#94a3b8;font-size:.88rem;margin-bottom:1.5rem}
.ns-challenge{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;margin-bottom:.75rem}
.ns-challenge-text{color:#e2e8f0;font-size:.9rem;line-height:1.5;margin-bottom:1rem}
.ns-challenge-opts{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem}
.ns-ch-btn{padding:.5rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#94a3b8;font-size:.82rem;cursor:pointer;transition:all .15s}
.ns-ch-btn:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.2)}
.ns-ch-btn.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.ns-ch-btn.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.ns-ch-btn.right-answer{border-color:#22c55e44;background:#22c55e08}
.ns-ch-exp{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.ns-ch-exp.show{display:block}
.ns-score-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem;text-align:center;margin-bottom:1rem}
.ns-score-num{font-size:1.5rem;font-weight:700;color:${ACCENT}}
.ns-score-lbl{color:#64748b;font-size:.8rem}

/* Quiz */
.ns-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.ns-q-num{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.ns-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.ns-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.ns-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.ns-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.ns-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.ns-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.ns-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.ns-explanation.show{display:block}
.ns-quiz-score{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.ns-quiz-score-num{font-size:2rem;font-weight:700;color:${ACCENT}}
.ns-quiz-score-lbl{color:#64748b;font-size:.8rem;margin-top:.25rem}
.ns-bar-visual{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.ns-bar-fill{height:100%;background:${ACCENT};border-radius:3px;transition:width .5s ease}
.ns-reset{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.ns-reset:hover{border-color:${ACCENT}66;color:${ACCENT}}

.ns-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.ns-back:hover{color:${ACCENT}}

@media(max-width:640px){
    #ns-root{padding:.75rem}
    .ns-header{padding:1rem 1.25rem}
    .ns-title{font-size:1.2rem}
    .ns-tab{min-width:0;font-size:.78rem;padding:.5rem .75rem}
}
</style>

<a class="ns-back" href="/houses/shield/index.html">\\u2039 Back to Shield House</a>

<div class="ns-header">
    <div class="ns-header-top">
        <span class="ns-icon">${topic.icon}</span>
        <span class="ns-title">${topic.name}</span>
        <span class="ns-badge">NETWORK SECURITY</span>
    </div>
    ${topic.subtitle ? '<p style="color:' + ACCENT + ';font-size:.85rem;margin-top:.25rem">' + topic.subtitle + '</p>' : ''}
    <p class="ns-desc">${topic.description}</p>
    <div class="ns-concepts">${topic.keyConcepts.map(c => '<span class="ns-concept">' + c + '</span>').join('')}</div>
</div>

<div class="ns-tabs">
    <button class="ns-tab active" data-tab="overview">Overview</button>
    <button class="ns-tab" data-tab="howitworks">How It Works</button>
    <button class="ns-tab" data-tab="lab">Lab Exercise</button>
    <button class="ns-tab" data-tab="quiz">Quiz</button>
</div>

<div id="panel-overview" class="ns-panel active"></div>
<div id="panel-howitworks" class="ns-panel"></div>
<div id="panel-lab" class="ns-panel"></div>
<div id="panel-quiz" class="ns-panel"></div>
`;
        document.body.innerHTML = '';
        document.body.appendChild(root);

        renderOverview();
        renderHowItWorks();
        renderLab();
        renderQuiz();
        bindTabs();
    }

    function bindTabs() {
        document.querySelectorAll('.ns-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ns-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ns-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    function renderOverview() {
        const panel = document.getElementById('panel-overview');
        let html = '<div style="color:#94a3b8;font-size:.9rem;line-height:1.6;margin-bottom:1.5rem">';
        html += '<p>This module covers <strong style="color:#e2e8f0">' + topic.sections.length + ' key areas</strong> of ' + topic.name + '. ';
        html += 'Explore the tabs to learn the concepts, practice with interactive scenarios, and test your knowledge.</p></div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.75rem;margin-bottom:1.5rem">';
        topic.sections.forEach(s => {
            html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem">';
            html += '<div style="font-size:1.5rem;margin-bottom:.5rem">' + s.icon + '</div>';
            html += '<div style="font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:.35rem">' + s.title + '</div>';
            html += '<div style="font-size:.8rem;color:#64748b;line-height:1.4">' + s.content.substring(0, 90) + '...</div>';
            html += '</div>';
        });
        html += '</div>';

        html += '<div style="display:flex;gap:1.5rem;flex-wrap:wrap">';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.sections.length + '</strong> Topics</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + (topic.interactive ? topic.interactive.items.length : 0) + '</strong> Lab Scenarios</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.quiz.length + '</strong> Quiz Questions</div>';
        html += '</div>';
        panel.innerHTML = html;
    }

    function renderHowItWorks() {
        const panel = document.getElementById('panel-howitworks');
        let html = '';
        topic.sections.forEach((section, idx) => {
            html += '<div class="ns-section' + (idx === 0 ? ' open' : '') + '">';
            html += '<div class="ns-section-head"><span class="ns-section-icon">' + section.icon + '</span>';
            html += '<span class="ns-section-title">' + section.title + '</span>';
            html += '<span class="ns-section-toggle">\\u25B6</span></div>';
            html += '<div class="ns-section-body">';
            html += '<div class="ns-section-content">' + section.content + '</div>';
            if (section.details && section.details.length) {
                html += '<div class="ns-detail-label">Key Details</div><ul class="ns-detail-list">';
                section.details.forEach(d => { html += '<li>' + d + '</li>'; });
                html += '</ul>';
            }
            if (section.realWorld) {
                html += '<div class="ns-real-world"><div class="ns-rw-label">Real-World Example</div>';
                html += '<div class="ns-rw-text">' + section.realWorld + '</div></div>';
            }
            html += '</div></div>';
        });
        panel.innerHTML = html;
        panel.querySelectorAll('.ns-section-head').forEach(head => {
            head.addEventListener('click', () => head.parentElement.classList.toggle('open'));
        });
    }

    function renderLab() {
        const panel = document.getElementById('panel-lab');
        if (!topic.interactive) { panel.innerHTML = '<p style="color:#64748b;padding:1rem">No lab exercises available.</p>'; return; }
        const inter = topic.interactive;
        let labCorrect = 0;

        let html = '<div class="ns-inter-title">' + inter.title + '</div>';
        html += '<div class="ns-inter-inst">' + inter.instructions + '</div>';
        html += '<div class="ns-score-box"><span class="ns-score-num" id="lab-score">0</span><span class="ns-score-lbl"> / ' + inter.items.length + ' correct</span></div>';

        inter.items.forEach((item, idx) => {
            html += '<div class="ns-challenge"><div class="ns-challenge-text">' + (idx + 1) + '. ' + item.scenario + '</div>';
            html += '<div class="ns-challenge-opts" id="lab-opts-' + idx + '">';
            const allAnswers = [...new Set(inter.items.map(i => i.answer))];
            allAnswers.sort(() => Math.random() - 0.5).forEach(opt => {
                html += '<button class="ns-ch-btn" data-answer="' + opt + '">' + opt + '</button>';
            });
            html += '</div><div class="ns-ch-exp" id="lab-exp-' + idx + '">' + item.explanation + '</div></div>';
        });

        html += '<button class="ns-reset" id="lab-reset">Reset Lab</button>';
        panel.innerHTML = html;

        inter.items.forEach((item, idx) => {
            const container = document.getElementById('lab-opts-' + idx);
            container.querySelectorAll('.ns-ch-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    container.querySelectorAll('.ns-ch-btn').forEach(b => b.classList.add('answered'));
                    if (btn.dataset.answer === item.answer) { btn.classList.add('correct'); labCorrect++; }
                    else { btn.classList.add('wrong'); container.querySelectorAll('.ns-ch-btn').forEach(b => { if (b.dataset.answer === item.answer) b.classList.add('right-answer'); }); }
                    document.getElementById('lab-score').textContent = labCorrect;
                    document.getElementById('lab-exp-' + idx).classList.add('show');
                });
            });
        });

        document.getElementById('lab-reset').addEventListener('click', () => { renderLab(); });
    }

    function renderQuiz() {
        const panel = document.getElementById('panel-quiz');
        const state = getState();
        let quizScore = state.quizScore || 0;
        let quizAnswered = state.quizAnswered || 0;
        let quizAnswers = state.quizAnswers || {};

        let html = '<div class="ns-quiz-score"><div class="ns-quiz-score-num" id="quiz-score">' + quizScore + ' / ' + topic.quiz.length + '</div>';
        html += '<div class="ns-quiz-score-lbl">Questions Correct</div>';
        html += '<div class="ns-bar-visual"><div class="ns-bar-fill" id="quiz-fill" style="width:' + (topic.quiz.length ? Math.round(quizScore / topic.quiz.length * 100) : 0) + '%"></div></div></div>';

        topic.quiz.forEach((q, idx) => {
            html += '<div class="ns-question"><div class="ns-q-num">Question ' + (idx + 1) + ' of ' + topic.quiz.length + '</div>';
            html += '<div class="ns-q-text">' + q.question + '</div><div id="quiz-opts-' + idx + '">';
            q.options.forEach((opt, oi) => {
                let cls = 'ns-option';
                if (quizAnswers[idx] !== undefined) {
                    cls += ' answered';
                    if (oi === q.correct) cls += ' correct';
                    else if (oi === quizAnswers[idx] && oi !== q.correct) cls += ' wrong';
                }
                html += '<button class="' + cls + '" data-oi="' + oi + '">' + opt + '</button>';
            });
            html += '</div><div class="ns-explanation' + (quizAnswers[idx] !== undefined ? ' show' : '') + '" id="quiz-exp-' + idx + '">' + q.explanation + '</div></div>';
        });

        html += '<button class="ns-reset" id="quiz-reset">Reset Quiz</button>';
        panel.innerHTML = html;

        topic.quiz.forEach((q, idx) => {
            if (quizAnswers[idx] !== undefined) return;
            const container = document.getElementById('quiz-opts-' + idx);
            container.querySelectorAll('.ns-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    const oi = parseInt(btn.dataset.oi);
                    container.querySelectorAll('.ns-option').forEach(b => b.classList.add('answered'));
                    quizAnswered++;
                    quizAnswers[idx] = oi;
                    if (oi === q.correct) { btn.classList.add('correct'); quizScore++; }
                    else { btn.classList.add('wrong'); container.querySelectorAll('.ns-option').forEach(b => { if (parseInt(b.dataset.oi) === q.correct) b.classList.add('correct'); }); }
                    document.getElementById('quiz-exp-' + idx).classList.add('show');
                    document.getElementById('quiz-score').textContent = quizScore + ' / ' + topic.quiz.length;
                    document.getElementById('quiz-fill').style.width = Math.round(quizScore / topic.quiz.length * 100) + '%';
                    const s = getState(); s.quizScore = quizScore; s.quizAnswered = quizAnswered; s.quizAnswers = quizAnswers; saveState(s);
                    if (quizAnswered === topic.quiz.length && typeof GameTracker !== 'undefined') {
                        try { GameTracker.record('shield-' + topic.id + '-quiz', quizScore, topic.quiz.length, { house: 'shield', type: 'network-quiz' }); } catch (e) { /* silent */ }
                    }
                });
            });
        });

        document.getElementById('quiz-reset').addEventListener('click', () => {
            const s = getState(); delete s.quizScore; delete s.quizAnswered; delete s.quizAnswers; saveState(s);
            renderQuiz();
        });
    }

    return { init };
})();
