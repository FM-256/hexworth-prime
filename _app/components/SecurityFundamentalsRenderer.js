/**
 * SecurityFundamentalsRenderer.js — Shared renderer for security fundamentals applets
 *
 * Usage: SecurityFundamentalsRenderer.init('five_pillars')
 * Requires: SecurityFundamentalsData.js loaded first
 */
const SecurityFundamentalsRenderer = (() => {
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
        topic = SecurityFundamentalsData[id];
        if (!topic) { document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Topic not found: ' + id + '</p>'; return; }
        storageKey = 'hexworth_fund_' + id;
        render();
    }

    function render() {
        const state = getState();
        document.title = topic.name + ' | Shield House';

        const root = document.createElement('div');
        root.id = 'sf-root';
        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#sf-root{max-width:1100px;margin:0 auto;padding:1rem}

/* Header */
.sf-header{background:linear-gradient(135deg,#1a1020 0%,${ACCENT}22 100%);border:1px solid ${ACCENT}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.sf-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent)}
.sf-header-top{display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;flex-wrap:wrap}
.sf-icon{font-size:2.5rem}
.sf-title{font-size:1.6rem;font-weight:700;color:#fff}
.sf-badge{background:${ACCENT}33;color:${ACCENT};border:1px solid ${ACCENT}66;padding:3px 12px;border-radius:20px;font-size:.75rem;font-weight:600;letter-spacing:.5px}
.sf-subtitle{color:${ACCENT};font-size:.85rem;font-weight:500;margin-left:auto}
.sf-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.sf-concepts{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}
.sf-concept{background:${ACCENT}15;color:${ACCENT};border:1px solid ${ACCENT}33;padding:4px 12px;border-radius:20px;font-size:.8rem}

/* Tabs */
.sf-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.sf-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:120px;text-align:center}
.sf-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.sf-tab.active{background:${ACCENT}22;color:${ACCENT};border:1px solid ${ACCENT}44}

/* Panels */
.sf-panel{display:none;animation:sfFadeIn .3s ease}
.sf-panel.active{display:block}
@keyframes sfFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Section Cards */
.sf-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:.75rem;overflow:hidden;transition:all .2s}
.sf-section:hover{border-color:rgba(255,255,255,.12)}
.sf-section-head{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;cursor:pointer;user-select:none}
.sf-section-icon{font-size:1.3rem}
.sf-section-title{font-weight:600;color:#e2e8f0;font-size:.95rem;flex:1}
.sf-section-toggle{color:#64748b;transition:transform .2s;font-size:.85rem}
.sf-section.open .sf-section-toggle{transform:rotate(90deg)}
.sf-section-body{display:none;padding:0 1.25rem 1.25rem;border-top:1px solid rgba(255,255,255,.04)}
.sf-section.open .sf-section-body{display:block}
.sf-section-content{color:#cbd5e1;font-size:.88rem;line-height:1.6;margin:1rem 0;padding:.75rem 1rem;background:rgba(255,255,255,.02);border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0}
.sf-detail-label{font-size:.75rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;margin-top:1rem}
.sf-detail-list{list-style:none;padding:0}
.sf-detail-list li{color:#94a3b8;font-size:.82rem;padding:3px 0 3px 1.25rem;position:relative;line-height:1.5}
.sf-detail-list li::before{content:'\\203A';position:absolute;left:.25rem;color:${ACCENT}88}
.sf-real-world{background:${ACCENT}08;border:1px solid ${ACCENT}22;border-radius:8px;padding:1rem;margin-top:1rem}
.sf-real-world-label{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.sf-real-world-text{color:#94a3b8;font-size:.84rem;line-height:1.6}

/* Interactive */
.sf-interactive-title{font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.5rem}
.sf-interactive-instructions{color:#94a3b8;font-size:.88rem;margin-bottom:1.5rem}
.sf-challenge-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;margin-bottom:.75rem;transition:all .2s}
.sf-challenge-scenario{color:#e2e8f0;font-size:.9rem;line-height:1.5;margin-bottom:1rem}
.sf-challenge-options{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem}
.sf-challenge-btn{padding:.5rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#94a3b8;font-size:.82rem;cursor:pointer;transition:all .15s}
.sf-challenge-btn:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.2)}
.sf-challenge-btn.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.sf-challenge-btn.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.sf-challenge-btn.right-answer{border-color:#22c55e44;background:#22c55e08}
.sf-challenge-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.sf-challenge-explanation.show{display:block}
.sf-interactive-score{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem;text-align:center;margin-bottom:1rem}
.sf-interactive-score-num{font-size:1.5rem;font-weight:700;color:${ACCENT}}
.sf-interactive-score-label{color:#64748b;font-size:.8rem}

/* Quiz */
.sf-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.sf-q-num{font-size:.72rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.sf-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.sf-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.sf-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.sf-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.sf-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.sf-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.sf-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.sf-explanation.show{display:block}
.sf-score-bar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.sf-score-num{font-size:2rem;font-weight:700;color:${ACCENT}}
.sf-score-label{color:#64748b;font-size:.8rem;margin-top:.25rem}
.sf-score-bar-visual{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.sf-score-fill{height:100%;background:${ACCENT};border-radius:3px;transition:width .5s ease}
.sf-reset-btn{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.sf-reset-btn:hover{border-color:${ACCENT}66;color:${ACCENT}}

/* Back link */
.sf-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.sf-back:hover{color:${ACCENT}}

/* Responsive */
@media(max-width:640px){
    #sf-root{padding:.75rem}
    .sf-header{padding:1rem 1.25rem}
    .sf-title{font-size:1.2rem}
    .sf-tab{min-width:0;font-size:.78rem;padding:.5rem .75rem}
    .sf-subtitle{margin-left:0;width:100%}
}
</style>

<a class="sf-back" href="../../index.html">\\u2039 Back to Shield House</a>

<div class="sf-header">
    <div class="sf-header-top">
        <span class="sf-icon">${topic.icon}</span>
        <span class="sf-title">${topic.name}</span>
        <span class="sf-badge">FUNDAMENTALS</span>
    </div>
    ${topic.subtitle ? '<p style="color:' + ACCENT + ';font-size:.85rem;margin-top:.25rem">' + topic.subtitle + '</p>' : ''}
    <p class="sf-desc">${topic.description}</p>
    <div class="sf-concepts">${topic.keyConcepts.map(c => '<span class="sf-concept">' + c + '</span>').join('')}</div>
</div>

<div class="sf-tabs">
    <button class="sf-tab active" data-tab="overview">Overview</button>
    <button class="sf-tab" data-tab="concepts">Key Concepts</button>
    <button class="sf-tab" data-tab="practice">Practice</button>
    <button class="sf-tab" data-tab="quiz">Quiz</button>
</div>

<div id="panel-overview" class="sf-panel active"></div>
<div id="panel-concepts" class="sf-panel"></div>
<div id="panel-practice" class="sf-panel"></div>
<div id="panel-quiz" class="sf-panel"></div>
`;
        document.body.innerHTML = '';
        document.body.appendChild(root);

        renderOverview();
        renderConcepts();
        renderPractice();
        renderQuiz();
        bindTabs();
    }

    function bindTabs() {
        document.querySelectorAll('.sf-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.sf-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.sf-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* ── Overview ── */
    function renderOverview() {
        const panel = document.getElementById('panel-overview');
        let html = '<div style="color:#94a3b8;font-size:.9rem;line-height:1.6;margin-bottom:1.5rem">';
        html += '<p>This module covers <strong style="color:#e2e8f0">' + topic.sections.length + ' key areas</strong> of ' + topic.name + '. ';
        html += 'Work through each tab to build your understanding, then test yourself with the interactive practice and quiz.</p></div>';

        // Summary cards
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.75rem;margin-bottom:1.5rem">';
        topic.sections.forEach((s, i) => {
            html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;transition:all .2s">';
            html += '<div style="font-size:1.5rem;margin-bottom:.5rem">' + s.icon + '</div>';
            html += '<div style="font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:.35rem">' + s.title + '</div>';
            html += '<div style="font-size:.8rem;color:#64748b;line-height:1.4">' + s.content.substring(0, 80) + '...</div>';
            html += '</div>';
        });
        html += '</div>';

        // Quick stats
        html += '<div style="display:flex;gap:1.5rem;flex-wrap:wrap">';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.sections.length + '</strong> Concept Areas</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + (topic.interactive ? topic.interactive.items.length : 0) + '</strong> Practice Scenarios</div>';
        html += '<div style="background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem"><strong style="color:#fff;font-size:1.1rem;margin-right:.25rem">' + topic.quiz.length + '</strong> Quiz Questions</div>';
        html += '</div>';

        panel.innerHTML = html;
    }

    /* ── Key Concepts (expandable sections) ── */
    function renderConcepts() {
        const panel = document.getElementById('panel-concepts');
        let html = '';

        topic.sections.forEach((section, idx) => {
            html += '<div class="sf-section' + (idx === 0 ? ' open' : '') + '" data-idx="' + idx + '">';
            html += '<div class="sf-section-head">';
            html += '<span class="sf-section-icon">' + section.icon + '</span>';
            html += '<span class="sf-section-title">' + section.title + '</span>';
            html += '<span class="sf-section-toggle">\\u25B6</span>';
            html += '</div>';
            html += '<div class="sf-section-body">';
            html += '<div class="sf-section-content">' + section.content + '</div>';

            if (section.details && section.details.length) {
                html += '<div class="sf-detail-label">Key Details</div>';
                html += '<ul class="sf-detail-list">';
                section.details.forEach(d => { html += '<li>' + d + '</li>'; });
                html += '</ul>';
            }

            if (section.realWorld) {
                html += '<div class="sf-real-world">';
                html += '<div class="sf-real-world-label">Real-World Example</div>';
                html += '<div class="sf-real-world-text">' + section.realWorld + '</div>';
                html += '</div>';
            }

            html += '</div></div>';
        });

        panel.innerHTML = html;

        // Accordion behavior
        panel.querySelectorAll('.sf-section-head').forEach(head => {
            head.addEventListener('click', () => {
                const section = head.parentElement;
                section.classList.toggle('open');
            });
        });
    }

    /* ── Practice (Interactive) ── */
    function renderPractice() {
        const panel = document.getElementById('panel-practice');
        if (!topic.interactive) {
            panel.innerHTML = '<p style="color:#64748b;padding:1rem">No practice exercises available for this topic.</p>';
            return;
        }

        const inter = topic.interactive;
        let practiceCorrect = 0;
        let practiceAnswered = 0;

        let html = '<div class="sf-interactive-title">' + inter.title + '</div>';
        html += '<div class="sf-interactive-instructions">' + inter.instructions + '</div>';
        html += '<div class="sf-interactive-score"><span class="sf-interactive-score-num" id="practice-score">0</span><span class="sf-interactive-score-label"> / ' + inter.items.length + ' correct</span></div>';

        inter.items.forEach((item, idx) => {
            html += '<div class="sf-challenge-item" data-idx="' + idx + '">';
            html += '<div class="sf-challenge-scenario">' + (idx + 1) + '. ' + item.scenario + '</div>';
            html += '<div class="sf-challenge-options" id="practice-opts-' + idx + '">';

            // Generate options from all unique answers
            const allAnswers = [...new Set(inter.items.map(i => i.answer))];
            // Shuffle options
            const shuffled = allAnswers.sort(() => Math.random() - 0.5);
            shuffled.forEach(opt => {
                html += '<button class="sf-challenge-btn" data-answer="' + opt + '">' + opt + '</button>';
            });

            html += '</div>';
            html += '<div class="sf-challenge-explanation" id="practice-exp-' + idx + '">' + item.explanation + '</div>';
            html += '</div>';
        });

        html += '<button class="sf-reset-btn" id="practice-reset">Reset Practice</button>';
        panel.innerHTML = html;

        // Bind practice options
        inter.items.forEach((item, idx) => {
            const container = document.getElementById('practice-opts-' + idx);
            container.querySelectorAll('.sf-challenge-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    container.querySelectorAll('.sf-challenge-btn').forEach(b => b.classList.add('answered'));
                    practiceAnswered++;

                    if (btn.dataset.answer === item.answer) {
                        btn.classList.add('correct');
                        practiceCorrect++;
                    } else {
                        btn.classList.add('wrong');
                        container.querySelectorAll('.sf-challenge-btn').forEach(b => {
                            if (b.dataset.answer === item.answer) b.classList.add('right-answer');
                        });
                    }
                    document.getElementById('practice-score').textContent = practiceCorrect;
                    document.getElementById('practice-exp-' + idx).classList.add('show');
                });
            });
        });

        document.getElementById('practice-reset').addEventListener('click', () => {
            practiceCorrect = 0;
            practiceAnswered = 0;
            renderPractice();
        });
    }

    /* ── Quiz ── */
    function renderQuiz() {
        const panel = document.getElementById('panel-quiz');
        const state = getState();
        let quizScore = state.quizScore || 0;
        let quizAnswered = state.quizAnswered || 0;
        let quizAnswers = state.quizAnswers || {};

        let html = '';
        html += '<div class="sf-score-bar">';
        html += '<div class="sf-score-num" id="quiz-score">' + quizScore + ' / ' + topic.quiz.length + '</div>';
        html += '<div class="sf-score-label">Questions Correct</div>';
        html += '<div class="sf-score-bar-visual"><div class="sf-score-fill" id="quiz-fill" style="width:' + (topic.quiz.length ? Math.round(quizScore / topic.quiz.length * 100) : 0) + '%"></div></div>';
        html += '</div>';

        topic.quiz.forEach((q, idx) => {
            html += '<div class="sf-question" data-idx="' + idx + '">';
            html += '<div class="sf-q-num">Question ' + (idx + 1) + ' of ' + topic.quiz.length + '</div>';
            html += '<div class="sf-q-text">' + q.question + '</div>';
            html += '<div id="quiz-opts-' + idx + '">';
            q.options.forEach((opt, oi) => {
                let cls = 'sf-option';
                if (quizAnswers[idx] !== undefined) {
                    cls += ' answered';
                    if (oi === q.correct) cls += ' correct';
                    else if (oi === quizAnswers[idx] && oi !== q.correct) cls += ' wrong';
                }
                html += '<button class="' + cls + '" data-oi="' + oi + '">' + opt + '</button>';
            });
            html += '</div>';
            html += '<div class="sf-explanation' + (quizAnswers[idx] !== undefined ? ' show' : '') + '" id="quiz-exp-' + idx + '">' + q.explanation + '</div>';
            html += '</div>';
        });

        html += '<button class="sf-reset-btn" id="quiz-reset">Reset Quiz</button>';
        panel.innerHTML = html;

        // Bind quiz options
        topic.quiz.forEach((q, idx) => {
            if (quizAnswers[idx] !== undefined) return; // Already answered
            const container = document.getElementById('quiz-opts-' + idx);
            container.querySelectorAll('.sf-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('answered')) return;
                    const oi = parseInt(btn.dataset.oi);
                    container.querySelectorAll('.sf-option').forEach(b => b.classList.add('answered'));
                    quizAnswered++;
                    quizAnswers[idx] = oi;

                    if (oi === q.correct) {
                        btn.classList.add('correct');
                        quizScore++;
                    } else {
                        btn.classList.add('wrong');
                        container.querySelectorAll('.sf-option').forEach(b => {
                            if (parseInt(b.dataset.oi) === q.correct) b.classList.add('correct');
                        });
                    }

                    document.getElementById('quiz-exp-' + idx).classList.add('show');
                    document.getElementById('quiz-score').textContent = quizScore + ' / ' + topic.quiz.length;
                    document.getElementById('quiz-fill').style.width = Math.round(quizScore / topic.quiz.length * 100) + '%';

                    // Save state
                    const s = getState();
                    s.quizScore = quizScore;
                    s.quizAnswered = quizAnswered;
                    s.quizAnswers = quizAnswers;
                    saveState(s);

                    // Track with GameTracker if all answered
                    if (quizAnswered === topic.quiz.length && typeof GameTracker !== 'undefined') {
                        try {
                            GameTracker.record('shield-' + topic.id + '-quiz', quizScore, topic.quiz.length, { house: 'shield', type: 'fundamentals-quiz' });
                        } catch (e) { /* silent */ }
                    }
                });
            });
        });

        document.getElementById('quiz-reset').addEventListener('click', () => {
            const s = getState();
            delete s.quizScore;
            delete s.quizAnswered;
            delete s.quizAnswers;
            saveState(s);
            renderQuiz();
        });
    }

    return { init };
})();
