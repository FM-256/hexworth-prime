/**
 * AccessControlRenderer.js — Shared renderer for access control applets
 *
 * Usage: AccessControlRenderer.init('access_control')
 * Requires: AccessControlData.js loaded first
 */
const AccessControlRenderer = (() => {
    let topic = null;
    let storageKey = '';
    const ACCENT = '#a855f7';
    // Render an icon value as an <img> when it is an image path (webp/svg/png);
    // otherwise emit it inline (emoji/text-safe). Data migrated emoji -> webp paths.
    function iconImg(v, px) {
        return (v && /\.(webp|svg|png|jpe?g)$/i.test(v))
            ? '<img src="' + v + '" alt="" style="width:' + px + 'px;height:' + px + 'px;object-fit:contain;vertical-align:middle">'
            : (v || '');
    }


    function getState() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
    }
    function saveState(state) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function init(id) {
        topic = AccessControlData[id];
        if (!topic) { document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Topic not found: ' + id + '</p>'; return; }
        storageKey = 'hexworth_ac_' + id;
        render();
    }

    function render() {
        document.title = topic.name + ' | Shield House';
        const root = document.createElement('div');
        root.id = 'ac-root';
        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#ac-root{max-width:1100px;margin:0 auto;padding:1rem}

.ac-header{background:linear-gradient(135deg,#1a1020 0%,${ACCENT}22 100%);border:1px solid ${ACCENT}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.ac-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent)}
.ac-header-top{display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;flex-wrap:wrap}
.ac-icon{font-size:2.5rem}.ac-title{font-size:1.6rem;font-weight:700;color:#fff}
.ac-badge{background:${ACCENT}33;color:${ACCENT};border:1px solid ${ACCENT}66;padding:3px 12px;border-radius:20px;font-size:.75rem;font-weight:600;letter-spacing:.5px}
.ac-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.ac-concepts{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}
.ac-concept{background:${ACCENT}15;color:${ACCENT};border:1px solid ${ACCENT}33;padding:4px 12px;border-radius:20px;font-size:.8rem}

.ac-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.ac-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:110px;text-align:center}
.ac-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.ac-tab.active{background:${ACCENT}22;color:${ACCENT};border:1px solid ${ACCENT}44}

.ac-panel{display:none;animation:acFade .3s ease}.ac-panel.active{display:block}
@keyframes acFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.ac-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:.75rem;overflow:hidden;transition:all .2s}
.ac-section:hover{border-color:rgba(255,255,255,.12)}
.ac-section-head{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;cursor:pointer;user-select:none}
.ac-section-icon{font-size:1.3rem}.ac-section-title{font-weight:600;color:#e2e8f0;font-size:.95rem;flex:1}
.ac-section-toggle{color:#64748b;transition:transform .2s;font-size:.85rem}
.ac-section.open .ac-section-toggle{transform:rotate(90deg)}
.ac-section-body{display:none;padding:0 1.25rem 1.25rem;border-top:1px solid rgba(255,255,255,.04)}
.ac-section.open .ac-section-body{display:block}
.ac-section-content{color:#cbd5e1;font-size:.88rem;line-height:1.6;margin:1rem 0;padding:.75rem 1rem;background:rgba(255,255,255,.02);border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0}
.ac-detail-label{font-size:.75rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;margin-top:1rem}
.ac-detail-list{list-style:none;padding:0}
.ac-detail-list li{color:#94a3b8;font-size:.82rem;padding:3px 0 3px 1.25rem;position:relative;line-height:1.5}
.ac-detail-list li::before{content:'\\203A';position:absolute;left:.25rem;color:${ACCENT}88}
.ac-real-world{background:${ACCENT}08;border:1px solid ${ACCENT}22;border-radius:8px;padding:1rem;margin-top:1rem}
.ac-rw-label{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.ac-rw-text{color:#94a3b8;font-size:.84rem;line-height:1.6}

.ac-inter-title{font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.5rem}
.ac-inter-inst{color:#94a3b8;font-size:.88rem;margin-bottom:1.5rem}
.ac-challenge{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;margin-bottom:.75rem}
.ac-challenge-text{color:#e2e8f0;font-size:.9rem;line-height:1.5;margin-bottom:1rem}
.ac-challenge-opts{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem}
.ac-ch-btn{padding:.5rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#94a3b8;font-size:.82rem;cursor:pointer;transition:all .15s}
.ac-ch-btn:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.2)}
.ac-ch-btn.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.ac-ch-btn.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.ac-ch-btn.right-answer{border-color:#22c55e44;background:#22c55e08}
.ac-ch-exp{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.ac-ch-exp.show{display:block}
.ac-score-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem;text-align:center;margin-bottom:1rem}
.ac-score-num{font-size:1.5rem;font-weight:700;color:${ACCENT}}.ac-score-lbl{color:#64748b;font-size:.8rem}

.ac-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.ac-q-num{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.ac-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.ac-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.ac-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.ac-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.ac-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.ac-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.ac-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.ac-explanation.show{display:block}
.ac-quiz-score{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.ac-quiz-score-num{font-size:2rem;font-weight:700;color:${ACCENT}}
.ac-quiz-score-lbl{color:#64748b;font-size:.8rem;margin-top:.25rem}
.ac-bar{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.ac-bar-fill{height:100%;background:${ACCENT};border-radius:3px;transition:width .5s ease}
.ac-reset{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.ac-reset:hover{border-color:${ACCENT}66;color:${ACCENT}}
.ac-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.ac-back:hover{color:${ACCENT}}

@media(max-width:640px){#ac-root{padding:.75rem}.ac-header{padding:1rem 1.25rem}.ac-title{font-size:1.2rem}.ac-tab{min-width:0;font-size:.78rem;padding:.5rem .75rem}}
</style>

<a class="ac-back" href="/houses/shield/index.html">\u2039 Back to Shield House</a>
<div class="ac-header">
    <div class="ac-header-top">
        <span class="ac-icon">${iconImg(topic.icon, 40)}</span>
        <span class="ac-title">${topic.name}</span>
        <span class="ac-badge">ACCESS CONTROL</span>
    </div>
    ${topic.subtitle ? '<p style="color:' + ACCENT + ';font-size:.85rem;margin-top:.25rem">' + topic.subtitle + '</p>' : ''}
    <p class="ac-desc">${topic.description}</p>
    <div class="ac-concepts">${topic.keyConcepts.map(c => '<span class="ac-concept">' + c + '</span>').join('')}</div>
</div>
<div class="ac-tabs">
    <button class="ac-tab active" data-tab="overview">Overview</button>
    <button class="ac-tab" data-tab="framework">Framework</button>
    <button class="ac-tab" data-tab="assessment">Assessment</button>
    <button class="ac-tab" data-tab="quiz">Quiz</button>
</div>
<div id="panel-overview" class="ac-panel active"></div>
<div id="panel-framework" class="ac-panel"></div>
<div id="panel-assessment" class="ac-panel"></div>
<div id="panel-quiz" class="ac-panel"></div>
`;
        document.body.innerHTML = '';
        document.body.appendChild(root);
        renderOverview(); renderFramework(); renderAssessment(); renderQuiz(); bindTabs();
    }

    function bindTabs() {
        document.querySelectorAll('.ac-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ac-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ac-panel').forEach(p => p.classList.remove('active'));
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
            html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem">';
            html += '<div style="font-size:1.5rem;margin-bottom:.5rem">' + iconImg(s.icon, 26) + '</div>';
            html += '<div style="font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:.35rem">' + s.title + '</div>';
            html += '<div style="font-size:.8rem;color:#64748b;line-height:1.4">' + s.content.substring(0, 90) + '...</div></div>';
        });
        html += '</div>';
        html += '<div style="display:flex;gap:1.5rem;flex-wrap:wrap">';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.sections.length + '</strong> Concept Areas</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + (topic.interactive ? topic.interactive.items.length : 0) + '</strong> Assessment Scenarios</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.quiz.length + '</strong> Quiz Questions</div></div>';
        panel.innerHTML = html;
    }

    function renderFramework() {
        const panel = document.getElementById('panel-framework');
        let html = '';
        topic.sections.forEach((section, idx) => {
            html += '<div class="ac-section' + (idx === 0 ? ' open' : '') + '">';
            html += '<div class="ac-section-head"><span class="ac-section-icon">' + iconImg(section.icon, 20) + '</span><span class="ac-section-title">' + section.title + '</span><span class="ac-section-toggle">\u25B6</span></div>';
            html += '<div class="ac-section-body"><div class="ac-section-content">' + section.content + '</div>';
            if (section.details && section.details.length) {
                html += '<div class="ac-detail-label">Key Details</div><ul class="ac-detail-list">';
                section.details.forEach(d => { html += '<li>' + d + '</li>'; });
                html += '</ul>';
            }
            if (section.realWorld) {
                html += '<div class="ac-real-world"><div class="ac-rw-label">Real-World Example</div><div class="ac-rw-text">' + section.realWorld + '</div></div>';
            }
            html += '</div></div>';
        });
        panel.innerHTML = html;
        panel.querySelectorAll('.ac-section-head').forEach(head => { head.addEventListener('click', () => head.parentElement.classList.toggle('open')); });
    }

    function renderAssessment() {
        const panel = document.getElementById('panel-assessment');
        if (!topic.interactive) { panel.innerHTML = '<p style="color:#64748b;padding:1rem">No assessment available.</p>'; return; }
        const inter = topic.interactive;
        let score = 0;
        let html = '<div class="ac-inter-title">' + inter.title + '</div>';
        html += '<div class="ac-inter-inst">' + inter.instructions + '</div>';
        html += '<div class="ac-score-box"><span class="ac-score-num" id="assess-score">0</span><span class="ac-score-lbl"> / ' + inter.items.length + ' correct</span></div>';
        inter.items.forEach((item, idx) => {
            html += '<div class="ac-challenge"><div class="ac-challenge-text">' + (idx + 1) + '. ' + item.scenario + '</div>';
            html += '<div class="ac-challenge-opts" id="assess-opts-' + idx + '">';
            const allAnswers = [...new Set(inter.items.map(i => i.answer))].sort(() => Math.random() - 0.5);
            allAnswers.forEach(opt => { html += '<button class="ac-ch-btn" data-answer="' + opt + '">' + opt + '</button>'; });
            html += '</div><div class="ac-ch-exp" id="assess-exp-' + idx + '">' + item.explanation + '</div></div>';
        });
        html += '<button class="ac-reset" id="assess-reset">Reset Assessment</button>';
        panel.innerHTML = html;

        inter.items.forEach((item, idx) => {
            const container = document.getElementById('assess-opts-' + idx);
            container.querySelectorAll('.ac-ch-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    container.querySelectorAll('.ac-ch-btn').forEach(b => b.classList.add('answered'));
                    if (btn.dataset.answer === item.answer) { btn.classList.add('correct'); score++; }
                    else { btn.classList.add('wrong'); container.querySelectorAll('.ac-ch-btn').forEach(b => { if (b.dataset.answer === item.answer) b.classList.add('right-answer'); }); }
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
        let quizScore = state.quizScore || 0, quizAnswered = state.quizAnswered || 0, quizAnswers = state.quizAnswers || {};

        let html = '<div class="ac-quiz-score"><div class="ac-quiz-score-num" id="quiz-score">' + quizScore + ' / ' + topic.quiz.length + '</div>';
        html += '<div class="ac-quiz-score-lbl">Questions Correct</div>';
        html += '<div class="ac-bar"><div class="ac-bar-fill" id="quiz-fill" style="width:' + (topic.quiz.length ? Math.round(quizScore / topic.quiz.length * 100) : 0) + '%"></div></div></div>';

        topic.quiz.forEach((q, idx) => {
            html += '<div class="ac-question"><div class="ac-q-num">Question ' + (idx + 1) + ' of ' + topic.quiz.length + '</div>';
            html += '<div class="ac-q-text">' + q.question + '</div><div id="quiz-opts-' + idx + '">';
            q.options.forEach((opt, oi) => {
                let cls = 'ac-option';
                if (quizAnswers[idx] !== undefined) { cls += ' answered'; if (oi === q.correct) cls += ' correct'; else if (oi === quizAnswers[idx] && oi !== q.correct) cls += ' wrong'; }
                html += '<button class="' + cls + '" data-oi="' + oi + '">' + opt + '</button>';
            });
            html += '</div><div class="ac-explanation' + (quizAnswers[idx] !== undefined ? ' show' : '') + '" id="quiz-exp-' + idx + '">' + q.explanation + '</div></div>';
        });
        html += '<button class="ac-reset" id="quiz-reset">Reset Quiz</button>';
        panel.innerHTML = html;

        topic.quiz.forEach((q, idx) => {
            if (quizAnswers[idx] !== undefined) return;
            const container = document.getElementById('quiz-opts-' + idx);
            container.querySelectorAll('.ac-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    const oi = parseInt(btn.dataset.oi);
                    container.querySelectorAll('.ac-option').forEach(b => b.classList.add('answered'));
                    quizAnswered++; quizAnswers[idx] = oi;
                    if (oi === q.correct) { btn.classList.add('correct'); quizScore++; }
                    else { btn.classList.add('wrong'); container.querySelectorAll('.ac-option').forEach(b => { if (parseInt(b.dataset.oi) === q.correct) b.classList.add('correct'); }); }
                    document.getElementById('quiz-exp-' + idx).classList.add('show');
                    document.getElementById('quiz-score').textContent = quizScore + ' / ' + topic.quiz.length;
                    document.getElementById('quiz-fill').style.width = Math.round(quizScore / topic.quiz.length * 100) + '%';
                    const s = getState(); s.quizScore = quizScore; s.quizAnswered = quizAnswered; s.quizAnswers = quizAnswers; saveState(s);
                    if (quizAnswered === topic.quiz.length && typeof GameTracker !== 'undefined') {
                        try { GameTracker.record('shield-' + topic.id + '-quiz', quizScore, topic.quiz.length, { house: 'shield', type: 'access-quiz' }); } catch (e) {}
                    }
                });
            });
        });
        document.getElementById('quiz-reset').addEventListener('click', () => { const s = getState(); delete s.quizScore; delete s.quizAnswered; delete s.quizAnswers; saveState(s); renderQuiz(); });
    }

    return { init };
})();
