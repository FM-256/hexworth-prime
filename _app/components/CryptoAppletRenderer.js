/**
 * CryptoAppletRenderer.js — Shared renderer for Cryptography applets
 *
 * Usage: CryptoAppletRenderer.init('AES')
 * Requires: CryptoAppletData.js loaded first
 */
const CryptoAppletRenderer = (() => {
    let topic = null;
    let storageKey = '';

    const TOPIC_PATHS = {
        AES: 'shield-crypto-aes', BLOCK_CIPHERS: 'shield-crypto-block-ciphers',
        CAESAR: 'shield-crypto-caesar', CRYPTO_PROTOCOLS: 'shield-crypto-protocols',
        DIFFIE_HELLMAN: 'shield-crypto-diffie-hellman', DIGITAL_SIGNATURES: 'shield-crypto-digital-signatures',
        HASHING: 'shield-crypto-hashing', HMAC: 'shield-crypto-hmac',
        KEY_EXCHANGE: 'shield-crypto-key-exchange', PKI: 'shield-crypto-pki',
        RSA: 'shield-crypto-rsa', STEGANOGRAPHY: 'shield-crypto-steganography',
        STREAM_CIPHERS: 'shield-crypto-stream-ciphers', SYMMETRIC_VS_ASYMMETRIC: 'shield-crypto-symmetric-asymmetric'
    };

    function topicHref(key) {
        const file = TOPIC_PATHS[key];
        if (!file) return '#';
        return file + '.applet.html';
    }

    function getState() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
        catch { return {}; }
    }

    function saveState(state) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function init(key) {
        topic = CryptoAppletData[key];
        if (!topic) { document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Topic not found: ' + key + '</p>'; return; }
        storageKey = 'hexworth_crypto_' + key.toLowerCase();
        render();
    }

    /* ================================================================
       MAIN RENDER
       ================================================================ */
    function render() {
        const state = getState();
        const quizAnswers = state.quizAnswers || {};
        const answeredCount = Object.keys(quizAnswers).length;
        const totalQuestions = topic.quiz.length;
        let correctCount = 0;
        Object.entries(quizAnswers).forEach(([qi, ai]) => {
            if (topic.quiz[qi] && topic.quiz[qi].correct === ai) correctCount++;
        });
        const stepsViewed = Object.keys(state.stepsViewed || {}).length;
        const totalSteps = topic.howItWorks.steps.length;
        const overallProgress = Math.round(((stepsViewed / totalSteps) * 50 + (answeredCount / totalQuestions) * 50));

        document.title = topic.title + ' \u2014 Hexworth Prime';

        const root = document.createElement('div');
        root.id = 'crypto-root';
        root.innerHTML = buildStyles() + buildHeader(overallProgress, stepsViewed, totalSteps, answeredCount, totalQuestions) +
            buildTabs() + buildPanels();

        document.body.innerHTML = '';
        document.body.appendChild(root);

        renderOverview();
        renderHowItWorks();
        renderInteractive();
        renderQuiz();
        bindTabs();
    }

    /* ================================================================
       STYLES
       ================================================================ */
    function buildStyles() {
        const c = topic.color || '#a855f7';
        return `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#crypto-root{max-width:1100px;margin:0 auto;padding:1rem}
.cr-header{background:linear-gradient(135deg,#1a1020 0%,${c}22 100%);border:1px solid ${c}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.cr-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${c},transparent)}
.cr-header-top{display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;flex-wrap:wrap}
.cr-icon{font-size:2.5rem}
.cr-title{font-size:1.6rem;font-weight:700;color:#fff}
.cr-badge{background:${c}33;color:${c};border:1px solid ${c}66;padding:3px 12px;border-radius:20px;font-size:.75rem;font-weight:600;letter-spacing:.5px}
.cr-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.cr-stats{display:flex;gap:1.5rem;margin-top:1rem;flex-wrap:wrap}
.cr-stat{background:rgba(255,255,255,.04);padding:.5rem 1rem;border-radius:8px;font-size:.8rem}
.cr-stat strong{color:#fff;font-size:1.1rem;margin-right:.25rem}
.cr-progress-wrap{margin-top:1rem}
.cr-progress-bar{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.cr-progress-fill{height:100%;background:${c};border-radius:2px;transition:width .5s ease}
.cr-progress-text{font-size:.72rem;color:#64748b;margin-top:.35rem;text-align:right}
.cr-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.cr-back:hover{color:${c}}
.cr-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.cr-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:100px;text-align:center}
.cr-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.cr-tab.active{background:${c}22;color:${c};border:1px solid ${c}44}
.cr-panel{display:none;animation:crFadeIn .3s ease}
.cr-panel.active{display:block}
@keyframes crFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.cr-concepts{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}
.cr-concept{background:${c}15;color:${c};border:1px solid ${c}33;padding:4px 12px;border-radius:20px;font-size:.8rem}
.cr-explanation{color:#cbd5e1;font-size:.88rem;line-height:1.7;margin-top:1rem}
.cr-explanation h4{color:#fff;font-size:1rem;margin:1.25rem 0 .5rem}
.cr-explanation ul,.cr-explanation ol{padding-left:1.25rem;margin:.5rem 0}
.cr-explanation li{margin:.3rem 0}
.cr-explanation p{margin:.5rem 0}
.cr-explanation strong{color:#e2e8f0}
.crypto-comparison{display:grid;gap:.5rem;margin:.75rem 0}
.crypto-compare-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:.75rem 1rem}
.crypto-compare-label{font-weight:700;color:#fff;font-size:.88rem;margin-bottom:.25rem}
.crypto-compare-detail{color:#cbd5e1;font-size:.82rem}
.crypto-compare-note{color:#64748b;font-size:.75rem;margin-top:.25rem}
.crypto-compare-note.warn{color:#f87171}
.crypto-compare-note.good{color:#22c55e}
.cr-explanation table{width:100%;border-collapse:collapse}
.cr-explanation td{padding:.4rem;font-size:.82rem;color:#94a3b8}
.cr-related{margin-top:1.75rem}
.cr-related-grid{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem}
.cr-related-link{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:.5rem 1rem;border-radius:8px;color:#94a3b8;text-decoration:none;font-size:.85rem;cursor:pointer;transition:all .2s}
.cr-related-link:hover{background:rgba(255,255,255,.08);color:#e2e8f0}
.cr-step{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:.75rem;overflow:hidden;transition:all .2s}
.cr-step:hover{border-color:rgba(255,255,255,.12)}
.cr-step-head{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;cursor:pointer;user-select:none}
.cr-step-num{background:${c}22;color:${c};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:700;flex-shrink:0}
.cr-step-num.viewed{background:${c};color:#0a0a0f}
.cr-step-title{font-weight:600;color:#e2e8f0;font-size:.9rem;flex:1}
.cr-step-toggle{color:#64748b;transition:transform .2s;font-size:.85rem}
.cr-step.open .cr-step-toggle{transform:rotate(90deg)}
.cr-step-body{display:none;padding:0 1.25rem 1.25rem;border-top:1px solid rgba(255,255,255,.04)}
.cr-step.open .cr-step-body{display:block}
.cr-step-desc{color:#cbd5e1;font-size:.88rem;line-height:1.6;margin-top:1rem}
.cr-step-detail{margin-top:.75rem;padding:.75rem 1rem;background:${c}08;border-left:3px solid ${c}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.cr-step-mark{display:flex;align-items:center;gap:.5rem;margin-top:1rem;cursor:pointer;font-size:.82rem;color:#64748b;transition:color .2s}
.cr-step-mark:hover{color:#94a3b8}
.cr-step-mark input{accent-color:${c}}
.cr-step-mark.checked{color:${c}}
.cr-interactive-wrap{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1.5rem;margin-top:.5rem}
.cr-interactive-instructions{color:#94a3b8;font-size:.88rem;line-height:1.5;margin-bottom:1.25rem}
.cr-input-row{display:flex;gap:.75rem;margin-bottom:1rem;flex-wrap:wrap}
.cr-input{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;padding:.65rem 1rem;border-radius:8px;font-size:.88rem;outline:none;font-family:inherit;flex:1;min-width:200px}
.cr-input:focus{border-color:${c}66}
.cr-input::placeholder{color:#475569}
.cr-btn{background:${c}22;color:${c};border:1px solid ${c}44;padding:.65rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:600;transition:all .2s;white-space:nowrap}
.cr-btn:hover{background:${c}33;border-color:${c}66}
.cr-btn.secondary{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8}
.cr-btn.secondary:hover{border-color:${c}66;color:${c}}
.cr-output{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:1rem;font-family:'Courier New',monospace;font-size:.82rem;color:#22c55e;line-height:1.6;min-height:60px;word-break:break-all;margin-top:.5rem;white-space:pre-wrap}
.cr-output-label{font-size:.72rem;color:${c};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;margin-top:1rem}
.cr-slider-row{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}
.cr-slider-row label{color:#94a3b8;font-size:.85rem;white-space:nowrap}
.cr-slider-row input[type=range]{flex:1;accent-color:${c}}
.cr-slider-val{background:${c}22;color:${c};padding:3px 12px;border-radius:6px;font-size:.88rem;font-weight:700;font-family:monospace;min-width:36px;text-align:center}
.cr-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}
.cr-vis-box{background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:1rem;min-height:80px}
.cr-vis-label{font-size:.72rem;color:${c};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.cr-bit-display{display:flex;flex-wrap:wrap;gap:2px;font-family:monospace;font-size:.72rem}
.cr-bit{padding:2px 4px;border-radius:3px;background:rgba(255,255,255,.04);color:#94a3b8}
.cr-bit.on{background:${c}33;color:${c}}
.cr-bit.changed{background:#f8717133;color:#f87171}
.cr-sim-stage{display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;margin:1.5rem 0;min-height:120px}
.cr-sim-party{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:1rem 1.5rem;text-align:center;min-width:140px}
.cr-sim-party-name{font-weight:700;color:#fff;font-size:1rem;margin-bottom:.25rem}
.cr-sim-party-val{font-family:monospace;font-size:.82rem;color:${c};margin-top:.5rem;word-break:break-all}
.cr-sim-arrow{color:${c};font-size:1.5rem}
.cr-sim-status{text-align:center;color:#94a3b8;font-size:.85rem;padding:.75rem;background:rgba(255,255,255,.02);border-radius:8px;margin-top:.5rem}
.cr-sim-status.success{color:#22c55e;background:#22c55e0a;border:1px solid #22c55e33}
.cr-sim-status.fail{color:#f87171;background:#f871710a;border:1px solid #f8717133}
.cr-chain{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:1rem 0}
.cr-chain-block{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:.5rem .75rem;font-family:monospace;font-size:.72rem;color:#94a3b8;text-align:center;min-width:80px}
.cr-chain-block.highlight{border-color:${c}66;color:${c}}
.cr-chain-arrow{color:#475569;font-size:.8rem}
.cr-score-bar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.cr-score-num{font-size:2rem;font-weight:700;color:${c}}
.cr-score-label{color:#64748b;font-size:.8rem;margin-top:.25rem}
.cr-score-bar-visual{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.cr-score-fill{height:100%;background:${c};border-radius:3px;transition:width .5s ease}
.cr-reset-btn{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.cr-reset-btn:hover{border-color:${c}66;color:${c}}
.cr-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.cr-q-num{font-size:.72rem;color:${c};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.cr-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.cr-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.cr-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.cr-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.cr-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.cr-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.cr-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${c}08;border-left:3px solid ${c}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.cr-explanation.show{display:block}
@media(max-width:768px){
    .cr-grid-2{grid-template-columns:1fr}
    .cr-sim-stage{flex-direction:column}
    .cr-sim-arrow{transform:rotate(90deg)}
}
@media(max-width:640px){
    #crypto-root{padding:.75rem}
    .cr-header{padding:1rem 1.25rem}
    .cr-title{font-size:1.2rem}
    .cr-tab{min-width:0;font-size:.78rem;padding:.5rem .75rem}
    .cr-input-row{flex-direction:column}
}
</style>`;
    }

    /* ================================================================
       HEADER
       ================================================================ */
    function buildHeader(progress, stepsViewed, totalSteps, answered, totalQ) {
        return `
<a class="cr-back" href="/houses/shield/index.html">&lsaquo; Back to Shield House</a>
<div class="cr-header">
    <div class="cr-header-top">
        <span class="cr-icon">${topic.icon}</span>
        <span class="cr-title">${topic.title}</span>
        <span class="cr-badge">CRYPTOGRAPHY</span>
    </div>
    <p class="cr-desc">${topic.description}</p>
    <div class="cr-stats">
        <div class="cr-stat"><strong>${topic.howItWorks.steps.length}</strong> Steps</div>
        <div class="cr-stat"><strong>${topic.quiz.length}</strong> Questions</div>
        <div class="cr-stat"><strong>${stepsViewed}</strong>/${totalSteps} Viewed</div>
        <div class="cr-stat"><strong>${answered}</strong>/${totalQ} Answered</div>
    </div>
    <div class="cr-progress-wrap">
        <div class="cr-progress-bar"><div class="cr-progress-fill" style="width:${progress}%"></div></div>
        <div class="cr-progress-text">${progress}% complete</div>
    </div>
</div>`;
    }

    function buildTabs() {
        return `
<div class="cr-tabs">
    <button class="cr-tab active" data-tab="overview">Overview</button>
    <button class="cr-tab" data-tab="howitworks">How It Works</button>
    <button class="cr-tab" data-tab="interactive">Interactive</button>
    <button class="cr-tab" data-tab="quiz">Quiz</button>
</div>`;
    }

    function buildPanels() {
        return `
<div id="panel-overview" class="cr-panel active"></div>
<div id="panel-howitworks" class="cr-panel"></div>
<div id="panel-interactive" class="cr-panel"></div>
<div id="panel-quiz" class="cr-panel"></div>`;
    }

    function bindTabs() {
        document.querySelectorAll('.cr-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.cr-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.cr-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* ================================================================
       OVERVIEW TAB
       ================================================================ */
    function renderOverview() {
        const panel = document.getElementById('panel-overview');
        const concepts = topic.overview.concepts.map(c => `<span class="cr-concept">${c}</span>`).join('');
        const allKeys = Object.keys(CryptoAppletData);
        const related = allKeys.filter(k => k !== topic.key).map(k => {
            const t = CryptoAppletData[k];
            return `<a class="cr-related-link" href="${topicHref(k)}">${t.icon} ${t.title}</a>`;
        }).join('');

        panel.innerHTML = `
            <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.5rem">Key Concepts</h3>
            <div class="cr-concepts">${concepts}</div>
            <div class="cr-explanation">${topic.overview.explanation}</div>
            <div class="cr-related">
                <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.5rem">Other Cryptography Topics</h3>
                <div class="cr-related-grid">${related}</div>
            </div>`;
    }

    /* ================================================================
       HOW IT WORKS TAB
       ================================================================ */
    function renderHowItWorks() {
        const panel = document.getElementById('panel-howitworks');
        const state = getState();
        const viewed = state.stepsViewed || {};

        panel.innerHTML = `
            <h3 style="color:#fff;font-size:1.1rem;margin-bottom:1rem">Step-by-Step Process</h3>
            <div id="stepList">
                ${topic.howItWorks.steps.map((s, i) => renderStep(s, i, viewed)).join('')}
            </div>`;

        panel.querySelectorAll('.cr-step-head').forEach(head => {
            head.addEventListener('click', () => {
                const step = head.parentElement;
                step.classList.toggle('open');
                if (step.classList.contains('open')) {
                    const idx = step.dataset.idx;
                    const st = getState();
                    if (!st.stepsViewed) st.stepsViewed = {};
                    if (!st.stepsViewed[idx]) {
                        st.stepsViewed[idx] = Date.now();
                        saveState(st);
                        const numEl = step.querySelector('.cr-step-num');
                        if (numEl) numEl.classList.add('viewed');
                        updateProgress();
                    }
                }
            });
        });

        panel.querySelectorAll('.cr-step-check').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = e.target.dataset.idx;
                const st = getState();
                if (!st.stepsViewed) st.stepsViewed = {};
                if (e.target.checked) {
                    st.stepsViewed[idx] = Date.now();
                    e.target.closest('.cr-step-mark').classList.add('checked');
                    e.target.closest('.cr-step').querySelector('.cr-step-num').classList.add('viewed');
                } else {
                    delete st.stepsViewed[idx];
                    e.target.closest('.cr-step-mark').classList.remove('checked');
                    e.target.closest('.cr-step').querySelector('.cr-step-num').classList.remove('viewed');
                }
                saveState(st);
                updateProgress();
            });
        });
    }

    function renderStep(s, idx, viewed) {
        const isViewed = !!viewed[idx];
        return `
        <div class="cr-step" data-idx="${idx}">
            <div class="cr-step-head">
                <span class="cr-step-num ${isViewed ? 'viewed' : ''}">${idx + 1}</span>
                <span class="cr-step-title">${s.title}</span>
                <span class="cr-step-toggle">&#9654;</span>
            </div>
            <div class="cr-step-body">
                <div class="cr-step-desc">${s.description}</div>
                <div class="cr-step-detail">${s.detail}</div>
                <label class="cr-step-mark ${isViewed ? 'checked' : ''}">
                    <input type="checkbox" class="cr-step-check" data-idx="${idx}" ${isViewed ? 'checked' : ''}>
                    Mark as studied
                </label>
            </div>
        </div>`;
    }

    /* ================================================================
       INTERACTIVE TAB
       ================================================================ */
    function renderInteractive() {
        const panel = document.getElementById('panel-interactive');
        const inter = topic.interactive;

        panel.innerHTML = `
            <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.5rem">Hands-On Exercise</h3>
            <div class="cr-interactive-wrap">
                <div class="cr-interactive-instructions">${inter.instructions}</div>
                <div id="interactiveContent"></div>
            </div>`;

        const container = document.getElementById('interactiveContent');
        const builders = {
            'caesar-shift': buildCaesarInteractive,
            'hash-demo': buildHashInteractive,
            'aes-encrypt': buildAESInteractive,
            'block-mode-visual': buildBlockModeInteractive,
            'stream-cipher-xor': buildStreamCipherInteractive,
            'diffie-hellman-sim': buildDiffieHellmanInteractive,
            'rsa-demo': buildRSAInteractive,
            'digital-signature-sim': buildDigitalSignatureInteractive,
            'hmac-demo': buildHMACInteractive,
            'steganography-demo': buildSteganographyInteractive,
            'pki-chain-explorer': buildPKIInteractive,
            'tls-handshake-sim': buildTLSInteractive,
            'key-exchange-compare': buildKeyExchangeInteractive,
            'symmetric-asymmetric-compare': buildSymAsymInteractive
        };
        const builder = builders[inter.type];
        if (builder) builder(container, inter);
        else container.innerHTML = '<p style="color:#64748b">Interactive exercise coming soon.</p>';
    }

    /* ── Caesar Cipher ── */
    function buildCaesarInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-slider-row">
                <label>Shift (Key):</label>
                <input type="range" id="caesarShift" min="1" max="25" value="3">
                <span class="cr-slider-val" id="caesarShiftVal">3</span>
            </div>
            <div class="cr-input-row">
                <input class="cr-input" id="caesarInput" placeholder="${inter.placeholder}" value="HELLO WORLD">
                <button class="cr-btn" id="caesarEncBtn">Encrypt</button>
                <button class="cr-btn secondary" id="caesarDecBtn">Decrypt</button>
            </div>
            <div class="cr-output-label">Result</div>
            <div class="cr-output" id="caesarOutput">KHOOR ZRUOG</div>
            <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06)">
                <div class="cr-output-label">Crack This Message</div>
                <div class="cr-output" id="caesarChallenge" style="color:#f87171">WKLV LV D VHFUHW PHVVDJH</div>
                <p style="color:#64748b;font-size:.78rem;margin-top:.5rem">Hint: Try different shift values on this ciphertext using Decrypt.</p>
            </div>`;
        const shift = el.querySelector('#caesarShift');
        const shiftVal = el.querySelector('#caesarShiftVal');
        const input = el.querySelector('#caesarInput');
        const output = el.querySelector('#caesarOutput');
        function caesarChar(ch, s) {
            if (ch >= 'A' && ch <= 'Z') return String.fromCharCode(((ch.charCodeAt(0) - 65 + s) % 26 + 26) % 26 + 65);
            if (ch >= 'a' && ch <= 'z') return String.fromCharCode(((ch.charCodeAt(0) - 97 + s) % 26 + 26) % 26 + 97);
            return ch;
        }
        function caesarStr(str, s) { return str.split('').map(c => caesarChar(c, s)).join(''); }
        shift.addEventListener('input', () => { shiftVal.textContent = shift.value; });
        el.querySelector('#caesarEncBtn').addEventListener('click', () => { output.textContent = caesarStr(input.value, parseInt(shift.value)); });
        el.querySelector('#caesarDecBtn').addEventListener('click', () => { output.textContent = caesarStr(input.value, -parseInt(shift.value)); });
    }

    /* ── Hash Demo ── */
    function buildHashInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="hashInput" placeholder="${inter.placeholder}" value="Hello, World!">
            </div>
            <div class="cr-output-label">SHA-256 Hash</div>
            <div class="cr-output" id="hashOutput" style="word-break:break-all"></div>
            <div class="cr-grid-2">
                <div class="cr-vis-box">
                    <div class="cr-vis-label">Input Bytes</div>
                    <div class="cr-bit-display" id="hashInputBits"></div>
                </div>
                <div class="cr-vis-box">
                    <div class="cr-vis-label">Hash Bytes (first 32)</div>
                    <div class="cr-bit-display" id="hashOutputBits"></div>
                </div>
            </div>
            <div style="margin-top:1rem">
                <div class="cr-output-label">Avalanche Test</div>
                <p style="color:#94a3b8;font-size:.82rem;margin-bottom:.5rem">Change one character and watch ~50% of hash bits flip.</p>
                <div id="avalancheInfo" style="color:#64748b;font-size:.82rem"></div>
            </div>`;
        const input = el.querySelector('#hashInput');
        const output = el.querySelector('#hashOutput');
        const inputBits = el.querySelector('#hashInputBits');
        const outputBits = el.querySelector('#hashOutputBits');
        const avalanche = el.querySelector('#avalancheInfo');
        let prevHash = '';

        async function computeHash(str) {
            const data = new TextEncoder().encode(str);
            try {
                const buf = await crypto.subtle.digest('SHA-256', data);
                return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                let h = 0;
                for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
                return Math.abs(h).toString(16).padStart(8, '0').repeat(8);
            }
        }
        function hexToBits(hex) { return hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join(''); }

        async function update() {
            const hash = await computeHash(input.value || '');
            output.textContent = hash;
            const inputHex = Array.from(new TextEncoder().encode(input.value || '')).slice(0, 16).map(b => b.toString(16).padStart(2, '0'));
            inputBits.innerHTML = inputHex.map(b => '<span class="cr-bit on">' + b + '</span>').join('');
            const hashBytes = hash.match(/.{2}/g).slice(0, 32);
            const prevBits = prevHash ? hexToBits(prevHash) : '';
            const currBits = hexToBits(hash);
            outputBits.innerHTML = hashBytes.map((b, i) => {
                let changed = false;
                if (prevBits) { for (let j = 0; j < 8; j++) { if (currBits[i * 8 + j] !== prevBits[i * 8 + j]) { changed = true; break; } } }
                return '<span class="cr-bit ' + (changed ? 'changed' : 'on') + '">' + b + '</span>';
            }).join('');
            if (prevHash && prevHash !== hash) {
                const pb = hexToBits(prevHash), cb = hexToBits(hash);
                let flipped = 0;
                for (let i = 0; i < Math.min(pb.length, cb.length); i++) { if (pb[i] !== cb[i]) flipped++; }
                const pct = Math.round(flipped / cb.length * 100);
                avalanche.innerHTML = '<strong style="color:#e2e8f0">' + flipped + '</strong> of ' + cb.length + ' bits changed (<strong style="color:' + (pct >= 40 && pct <= 60 ? '#22c55e' : '#f87171') + '">' + pct + '%</strong>)';
            }
            prevHash = hash;
        }
        input.addEventListener('input', update);
        update();
    }

    /* ── AES Encrypt ── */
    function buildAESInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="aesInput" placeholder="${inter.placeholder}" maxlength="64">
                <button class="cr-btn" id="aesEncBtn">Encrypt</button>
            </div>
            <div class="cr-output-label">AES Round Simulation</div>
            <div id="aesSteps" style="margin-top:.5rem"></div>
            <div class="cr-output-label">Final Ciphertext (Hex)</div>
            <div class="cr-output" id="aesOutput"></div>`;
        const input = el.querySelector('#aesInput');
        const stepsEl = el.querySelector('#aesSteps');
        const output = el.querySelector('#aesOutput');

        function simAES(text) {
            const bytes = Array.from(new TextEncoder().encode(text.padEnd(16, '\0').slice(0, 16)));
            const steps = [];
            let state = [...bytes];
            const roundKey = bytes.map((b, i) => (b * 7 + i * 13 + 0xA5) & 0xFF);
            state = state.map((b, i) => b ^ roundKey[i]);
            steps.push({ name: 'AddRoundKey (Initial)', state: [...state] });
            for (let r = 0; r < 4; r++) {
                state = state.map(b => ((b * 0x0101 ^ 0x63) & 0xFF));
                steps.push({ name: 'Round ' + (r + 1) + ': SubBytes', state: [...state] });
                const m = [state[0], state[5], state[10], state[15], state[4], state[9], state[14], state[3],
                           state[8], state[13], state[2], state[7], state[12], state[1], state[6], state[11]];
                state = m;
                steps.push({ name: 'Round ' + (r + 1) + ': ShiftRows', state: [...state] });
                const rk = roundKey.map((b, i) => (b + r * 37 + i * 11) & 0xFF);
                state = state.map((b, i) => b ^ rk[i]);
                steps.push({ name: 'Round ' + (r + 1) + ': AddRoundKey', state: [...state] });
            }
            return { steps, final: state };
        }
        el.querySelector('#aesEncBtn').addEventListener('click', () => {
            const result = simAES(input.value || 'Hexworth Prime!');
            stepsEl.innerHTML = result.steps.map(s =>
                '<div style="display:flex;align-items:center;gap:.75rem;margin:.35rem 0">' +
                '<span style="color:#a855f7;font-size:.78rem;font-weight:600;min-width:180px">' + s.name + '</span>' +
                '<span style="font-family:monospace;font-size:.72rem;color:#94a3b8">' + s.state.map(b => b.toString(16).padStart(2, '0')).join(' ') + '</span></div>'
            ).join('');
            output.textContent = result.final.map(b => b.toString(16).padStart(2, '0')).join('');
        });
        el.querySelector('#aesEncBtn').click();
    }

    /* ── Block Mode Visual ── */
    function buildBlockModeInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="blockInput" placeholder="${inter.placeholder}" value="AAAA AAAA AAAA AAAA">
            </div>
            <div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">
                <button class="cr-btn" id="modeECB" data-mode="ecb">ECB</button>
                <button class="cr-btn secondary" id="modeCBC" data-mode="cbc">CBC</button>
                <button class="cr-btn secondary" id="modeCTR" data-mode="ctr">CTR</button>
            </div>
            <div class="cr-output-label">Plaintext Blocks</div>
            <div class="cr-chain" id="blockPlain"></div>
            <div class="cr-output-label">Ciphertext Blocks</div>
            <div class="cr-chain" id="blockCipher"></div>
            <div id="blockNote" style="color:#94a3b8;font-size:.82rem;margin-top:1rem;padding:.75rem;background:rgba(255,255,255,.02);border-radius:8px"></div>`;
        const input = el.querySelector('#blockInput');
        const plainEl = el.querySelector('#blockPlain');
        const cipherEl = el.querySelector('#blockCipher');
        const noteEl = el.querySelector('#blockNote');
        const modeButtons = el.querySelectorAll('[data-mode]');
        let currentMode = 'ecb';

        function blockEnc(block, key) { return block.map((b, i) => (b ^ key[i % key.length]) & 0xFF); }
        function update() {
            const bytes = Array.from(new TextEncoder().encode(input.value || 'TEST'));
            while (bytes.length % 4 !== 0) bytes.push(0);
            const blocks = [];
            for (let i = 0; i < bytes.length; i += 4) blocks.push(bytes.slice(i, i + 4));
            const key = [0xA5, 0x3C, 0x7F, 0x12], iv = [0x91, 0xE2, 0x47, 0xBB];
            const cipherBlocks = [];
            if (currentMode === 'ecb') { blocks.forEach(b => cipherBlocks.push(blockEnc(b, key))); }
            else if (currentMode === 'cbc') { let prev = iv; blocks.forEach(b => { const x = b.map((v, i) => v ^ prev[i]); const enc = blockEnc(x, key); cipherBlocks.push(enc); prev = enc; }); }
            else { blocks.forEach((b, idx) => { const ctr = iv.map((v, i) => (v + idx + i) & 0xFF); const ks = blockEnc(ctr, key); cipherBlocks.push(b.map((v, i) => v ^ ks[i])); }); }
            plainEl.innerHTML = blocks.map((b, i) => '<div class="cr-chain-block' + (i === 0 ? ' highlight' : '') + '">' + b.map(v => v.toString(16).padStart(2, '0')).join(' ') + '</div>' + (i < blocks.length - 1 ? '<span class="cr-chain-arrow">&rarr;</span>' : '')).join('');
            const cStrs = cipherBlocks.map(b => b.join(','));
            const hasDupes = new Set(cStrs).size < cStrs.length;
            cipherEl.innerHTML = cipherBlocks.map((b, i) => '<div class="cr-chain-block' + (hasDupes && cStrs.indexOf(cStrs[i]) !== i ? ' highlight' : '') + '">' + b.map(v => v.toString(16).padStart(2, '0')).join(' ') + '</div>' + (i < cipherBlocks.length - 1 ? '<span class="cr-chain-arrow">&rarr;</span>' : '')).join('');
            const notes = { ecb: 'ECB: Each block encrypted independently. <strong style="color:#f87171">Identical plaintext blocks produce identical ciphertext!</strong>', cbc: 'CBC: Each block XORed with previous ciphertext. Identical blocks now produce <strong style="color:#22c55e">different ciphertext</strong>.', ctr: 'CTR: Counter encrypted and XORed with plaintext. <strong style="color:#22c55e">Identical blocks produce different output</strong>.' };
            noteEl.innerHTML = notes[currentMode];
        }
        modeButtons.forEach(btn => { btn.addEventListener('click', () => { modeButtons.forEach(b => { b.classList.remove('active'); b.classList.add('secondary'); }); btn.classList.add('active'); btn.classList.remove('secondary'); currentMode = btn.dataset.mode; update(); }); });
        input.addEventListener('input', update);
        update();
    }

    /* ── Stream Cipher XOR ── */
    function buildStreamCipherInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="streamInput" placeholder="${inter.placeholder}" value="HELLO">
                <button class="cr-btn" id="streamBtn">Encrypt</button>
            </div>
            <div class="cr-grid-2">
                <div class="cr-vis-box"><div class="cr-vis-label">Plaintext (Binary)</div><div class="cr-bit-display" id="streamPlain"></div></div>
                <div class="cr-vis-box"><div class="cr-vis-label">Keystream (Binary)</div><div class="cr-bit-display" id="streamKey"></div></div>
            </div>
            <div class="cr-output-label">Ciphertext = Plaintext XOR Keystream</div>
            <div class="cr-vis-box" style="margin-top:.5rem"><div class="cr-bit-display" id="streamCipher"></div></div>
            <div class="cr-output-label">Decrypted = Ciphertext XOR Keystream</div>
            <div class="cr-output" id="streamDecrypted"></div>`;
        const input = el.querySelector('#streamInput');
        function update() {
            const bytes = Array.from(new TextEncoder().encode(input.value || 'A'));
            const ks = bytes.map((_, i) => (0xA5 ^ (i * 37 + 0x3C)) & 0xFF);
            const cipher = bytes.map((b, i) => b ^ ks[i]);
            const dec = cipher.map((b, i) => b ^ ks[i]);
            function bitsHTML(arr, cls) { return arr.map(b => b.toString(2).padStart(8, '0').split('').map(bit => '<span class="cr-bit ' + (bit === '1' ? cls : '') + '">' + bit + '</span>').join('')).join(' '); }
            el.querySelector('#streamPlain').innerHTML = bitsHTML(bytes, 'on');
            el.querySelector('#streamKey').innerHTML = bitsHTML(ks, 'on');
            el.querySelector('#streamCipher').innerHTML = bitsHTML(cipher, 'changed');
            el.querySelector('#streamDecrypted').textContent = new TextDecoder().decode(new Uint8Array(dec));
        }
        el.querySelector('#streamBtn').addEventListener('click', update);
        update();
    }

    /* ── Diffie-Hellman Sim ── */
    function buildDiffieHellmanInteractive(el) {
        el.innerHTML = `
            <div class="cr-sim-stage">
                <div class="cr-sim-party"><div class="cr-sim-party-name">Alice</div><div style="font-size:.78rem;color:#64748b">Private: <span id="dhAP">?</span></div><div class="cr-sim-party-val" id="dhAPub">Public: ?</div></div>
                <div style="text-align:center"><div style="color:#64748b;font-size:.78rem;margin-bottom:.25rem">Public: p=23, g=5</div><div class="cr-sim-arrow">&harr;</div></div>
                <div class="cr-sim-party"><div class="cr-sim-party-name">Bob</div><div style="font-size:.78rem;color:#64748b">Private: <span id="dhBP">?</span></div><div class="cr-sim-party-val" id="dhBPub">Public: ?</div></div>
            </div>
            <div style="text-align:center;margin-bottom:1rem">
                <button class="cr-btn" id="dhRunBtn">Run Key Exchange</button>
                <button class="cr-btn secondary" id="dhResetBtn" style="margin-left:.5rem">Reset</button>
            </div>
            <div class="cr-sim-status" id="dhStatus">Click "Run Key Exchange" to watch the math</div>
            <div id="dhLog" style="margin-top:1rem"></div>`;
        function modPow(base, exp, mod) { let r = 1; base = base % mod; while (exp > 0) { if (exp % 2 === 1) r = (r * base) % mod; exp = Math.floor(exp / 2); base = (base * base) % mod; } return r; }
        el.querySelector('#dhRunBtn').addEventListener('click', () => {
            const p = 23, g = 5, a = Math.floor(Math.random() * 10) + 2, b = Math.floor(Math.random() * 10) + 2;
            const A = modPow(g, a, p), B = modPow(g, b, p), sA = modPow(B, a, p), sB = modPow(A, b, p);
            el.querySelector('#dhAP').textContent = a; el.querySelector('#dhAPub').textContent = 'A = ' + g + '^' + a + ' mod ' + p + ' = ' + A;
            el.querySelector('#dhBP').textContent = b; el.querySelector('#dhBPub').textContent = 'B = ' + g + '^' + b + ' mod ' + p + ' = ' + B;
            const status = el.querySelector('#dhStatus'); status.className = 'cr-sim-status success';
            status.innerHTML = 'Shared Secret: <strong>' + sA + '</strong>';
            el.querySelector('#dhLog').innerHTML = '<div style="font-size:.82rem;color:#94a3b8;line-height:1.8">' +
                '<div>1. Public: p=' + p + ', g=' + g + '</div>' +
                '<div>2. Alice: a=' + a + ', A = ' + g + '<sup>' + a + '</sup> mod ' + p + ' = <strong style="color:#e2e8f0">' + A + '</strong></div>' +
                '<div>3. Bob: b=' + b + ', B = ' + g + '<sup>' + b + '</sup> mod ' + p + ' = <strong style="color:#e2e8f0">' + B + '</strong></div>' +
                '<div>4. Alice: B<sup>a</sup> mod p = ' + B + '<sup>' + a + '</sup> mod ' + p + ' = <strong style="color:#22c55e">' + sA + '</strong></div>' +
                '<div>5. Bob: A<sup>b</sup> mod p = ' + A + '<sup>' + b + '</sup> mod ' + p + ' = <strong style="color:#22c55e">' + sB + '</strong></div>' +
                '<div style="color:#a855f7;margin-top:.5rem">Eve sees p, g, A=' + A + ', B=' + B + ' but cannot compute the shared secret!</div></div>';
        });
        el.querySelector('#dhResetBtn').addEventListener('click', () => {
            el.querySelector('#dhAP').textContent = '?'; el.querySelector('#dhAPub').textContent = 'Public: ?';
            el.querySelector('#dhBP').textContent = '?'; el.querySelector('#dhBPub').textContent = 'Public: ?';
            el.querySelector('#dhStatus').className = 'cr-sim-status'; el.querySelector('#dhStatus').textContent = 'Click "Run Key Exchange" to watch the math';
            el.querySelector('#dhLog').innerHTML = '';
        });
    }

    /* ── RSA Demo ── */
    function buildRSAInteractive(el) {
        el.innerHTML = `
            <div style="margin-bottom:1rem"><button class="cr-btn" id="rsaGenBtn">Generate RSA Keys (Small Primes)</button></div>
            <div class="cr-grid-2" style="margin-bottom:1rem">
                <div class="cr-vis-box"><div class="cr-vis-label">Public Key (n, e)</div><div id="rsaPub" style="font-family:monospace;font-size:.85rem;color:#22c55e">Generate keys first...</div></div>
                <div class="cr-vis-box"><div class="cr-vis-label">Private Key (n, d)</div><div id="rsaPriv" style="font-family:monospace;font-size:.85rem;color:#f87171">Generate keys first...</div></div>
            </div>
            <div class="cr-input-row">
                <input class="cr-input" id="rsaInput" type="number" placeholder="Enter number to encrypt (< n)..." min="2" max="999">
                <button class="cr-btn" id="rsaEncBtn">Encrypt</button>
                <button class="cr-btn secondary" id="rsaDecBtn">Decrypt</button>
            </div>
            <div class="cr-output-label">Result</div>
            <div class="cr-output" id="rsaOutput">Generate keys and enter a number...</div>
            <div id="rsaLog" style="margin-top:1rem;font-size:.82rem;color:#94a3b8;line-height:1.8"></div>`;
        let n = 0, e = 0, d = 0;
        function modPow(base, exp, mod) { let r = 1n; base = BigInt(base) % BigInt(mod); exp = BigInt(exp); mod = BigInt(mod); while (exp > 0n) { if (exp % 2n === 1n) r = (r * base) % mod; exp = exp / 2n; base = (base * base) % mod; } return Number(r); }
        function modInverse(a, m) { let [o, r] = [a, m], [os, s] = [1, 0]; while (r !== 0) { const q = Math.floor(o / r); [o, r] = [r, o - q * r]; [os, s] = [s, os - q * s]; } return ((os % m) + m) % m; }
        const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        el.querySelector('#rsaGenBtn').addEventListener('click', () => {
            const p = primes[Math.floor(Math.random() * primes.length)];
            let q = primes[Math.floor(Math.random() * primes.length)]; while (q === p) q = primes[Math.floor(Math.random() * primes.length)];
            n = p * q; const phi = (p - 1) * (q - 1);
            for (const tryE of [65537, 257, 17, 7, 5, 3]) { if (tryE < phi) { let g = phi, t = tryE; while (t) { [g, t] = [t, g % t]; } if (g === 1) { e = tryE; break; } } }
            d = modInverse(e, phi); el.querySelector('#rsaInput').max = n - 1;
            el.querySelector('#rsaPub').textContent = 'n = ' + n + ', e = ' + e;
            el.querySelector('#rsaPriv').textContent = 'n = ' + n + ', d = ' + d;
            el.querySelector('#rsaLog').innerHTML = '<div>p=' + p + ', q=' + q + ', n=' + n + ', phi=' + phi + ', e=' + e + ', d=' + d + '</div>';
            el.querySelector('#rsaOutput').textContent = 'Keys generated! Enter number < ' + n;
        });
        el.querySelector('#rsaEncBtn').addEventListener('click', () => {
            if (!n) { el.querySelector('#rsaOutput').textContent = 'Generate keys first!'; return; }
            const m = parseInt(el.querySelector('#rsaInput').value); if (isNaN(m) || m < 2 || m >= n) { el.querySelector('#rsaOutput').textContent = 'Enter number between 2 and ' + (n - 1); return; }
            const c = modPow(m, e, n); el.querySelector('#rsaOutput').textContent = 'Ciphertext: ' + c;
            el.querySelector('#rsaLog').innerHTML += '<div style="color:#22c55e">Encrypt: ' + m + '^' + e + ' mod ' + n + ' = <strong>' + c + '</strong></div>';
        });
        el.querySelector('#rsaDecBtn').addEventListener('click', () => {
            if (!n) { el.querySelector('#rsaOutput').textContent = 'Generate keys first!'; return; }
            const c = parseInt(el.querySelector('#rsaInput').value); if (isNaN(c) || c < 1 || c >= n) { el.querySelector('#rsaOutput').textContent = 'Enter a ciphertext number'; return; }
            const m = modPow(c, d, n); el.querySelector('#rsaOutput').textContent = 'Decrypted: ' + m;
            el.querySelector('#rsaLog').innerHTML += '<div style="color:#f87171">Decrypt: ' + c + '^' + d + ' mod ' + n + ' = <strong>' + m + '</strong></div>';
        });
    }

    /* ── Digital Signature Sim ── */
    function buildDigitalSignatureInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="sigInput" placeholder="${inter.placeholder}" value="Transfer $500 to Bob">
                <button class="cr-btn" id="sigSignBtn">Sign Message</button>
            </div>
            <div class="cr-grid-2">
                <div class="cr-vis-box"><div class="cr-vis-label">Message Hash</div><div id="sigHash" style="font-family:monospace;font-size:.78rem;color:#94a3b8;word-break:break-all">&mdash;</div></div>
                <div class="cr-vis-box"><div class="cr-vis-label">Digital Signature</div><div id="sigValue" style="font-family:monospace;font-size:.78rem;color:#a855f7;word-break:break-all">&mdash;</div></div>
            </div>
            <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06)">
                <div class="cr-output-label">Tamper Test</div>
                <div class="cr-input-row">
                    <input class="cr-input" id="sigVerify" placeholder="Modify the signed message...">
                    <button class="cr-btn secondary" id="sigVerifyBtn">Verify</button>
                </div>
                <div class="cr-sim-status" id="sigStatus">Sign a message, then modify it to see verification fail</div>
            </div>`;
        let signedHash = '';
        function simHash(str) { let h1 = 0x9E3779B9, h2 = 0x85EBCA6B; for (let i = 0; i < str.length; i++) { h1 = Math.imul(h1 ^ str.charCodeAt(i), 0xCC9E2D51); h2 = Math.imul(h2 ^ str.charCodeAt(i), 0x1B873593); h1 = (h1 << 13) | (h1 >>> 19); h2 = (h2 << 15) | (h2 >>> 17); } return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0') + ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0') + ((h1 + h2) >>> 0).toString(16).padStart(8, '0'); }
        function simSign(hash) { return hash.split('').map(c => ((parseInt(c, 16) * 7 + 3) % 16).toString(16)).join(''); }
        el.querySelector('#sigSignBtn').addEventListener('click', () => {
            const msg = el.querySelector('#sigInput').value; const hash = simHash(msg); signedHash = hash;
            el.querySelector('#sigHash').textContent = hash; el.querySelector('#sigValue').textContent = simSign(hash);
            el.querySelector('#sigVerify').value = msg;
            const s = el.querySelector('#sigStatus'); s.className = 'cr-sim-status'; s.textContent = 'Message signed. Modify the text above and click Verify.';
        });
        el.querySelector('#sigVerifyBtn').addEventListener('click', () => {
            if (!signedHash) { el.querySelector('#sigStatus').textContent = 'Sign a message first!'; return; }
            const h = simHash(el.querySelector('#sigVerify').value); const s = el.querySelector('#sigStatus');
            if (h === signedHash) { s.className = 'cr-sim-status success'; s.innerHTML = 'VALID &mdash; Hashes match. Message is authentic.'; }
            else { s.className = 'cr-sim-status fail'; s.innerHTML = 'INVALID &mdash; Hash mismatch! Message tampered.<br><span style="font-size:.78rem">Expected: ' + signedHash.slice(0, 16) + '... Got: ' + h.slice(0, 16) + '...</span>'; }
        });
    }

    /* ── HMAC Demo ── */
    function buildHMACInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="hmacMsg" placeholder="${inter.placeholder}" value="Hello API Server">
                <input class="cr-input" id="hmacKey" placeholder="Secret key..." value="my-secret-key" style="max-width:200px">
            </div>
            <button class="cr-btn" id="hmacBtn">Compute HMAC</button>
            <div class="cr-output-label">HMAC (Simulated)</div>
            <div class="cr-output" id="hmacOutput">&mdash;</div>
            <p style="color:#94a3b8;font-size:.82rem;margin-top:1rem">Change message or key and recompute. Any change completely alters the HMAC.</p>`;
        function simHMAC(key, msg) {
            let inner = 0x6A09E667; for (let i = 0; i < key.length; i++) inner = Math.imul(inner ^ (key.charCodeAt(i) ^ 0x36), 0xCC9E2D51);
            for (let i = 0; i < msg.length; i++) inner = Math.imul(inner ^ msg.charCodeAt(i), 0x1B873593); inner = (inner << 13) | (inner >>> 19);
            let outer = 0xBB67AE85; for (let i = 0; i < key.length; i++) outer = Math.imul(outer ^ (key.charCodeAt(i) ^ 0x5C), 0xCC9E2D51);
            outer = Math.imul(outer ^ inner, 0x1B873593); outer = (outer << 15) | (outer >>> 17);
            return (inner >>> 0).toString(16).padStart(8, '0') + (outer >>> 0).toString(16).padStart(8, '0') + ((inner ^ outer) >>> 0).toString(16).padStart(8, '0') + ((inner + outer) >>> 0).toString(16).padStart(8, '0');
        }
        function update() { el.querySelector('#hmacOutput').textContent = simHMAC(el.querySelector('#hmacKey').value, el.querySelector('#hmacMsg').value); }
        el.querySelector('#hmacBtn').addEventListener('click', update);
        update();
    }

    /* ── Steganography Demo ── */
    function buildSteganographyInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="stegoInput" placeholder="${inter.placeholder}" value="SECRET" maxlength="32">
                <button class="cr-btn" id="stegoBtn">Hide Message</button>
                <button class="cr-btn secondary" id="stegoExtBtn">Extract</button>
            </div>
            <div class="cr-grid-2">
                <div class="cr-vis-box"><div class="cr-vis-label">Original Image</div><canvas id="stegoOrig" width="160" height="80" style="border:1px solid rgba(255,255,255,.1);border-radius:4px;width:100%;image-rendering:pixelated"></canvas></div>
                <div class="cr-vis-box"><div class="cr-vis-label">Stego Image (Hidden)</div><canvas id="stegoMod" width="160" height="80" style="border:1px solid rgba(255,255,255,.1);border-radius:4px;width:100%;image-rendering:pixelated"></canvas></div>
            </div>
            <div class="cr-output-label">Pixel Differences (Exaggerated)</div>
            <canvas id="stegoDiff" width="160" height="80" style="border:1px solid rgba(255,255,255,.1);border-radius:4px;width:100%;max-width:400px;image-rendering:pixelated"></canvas>
            <div class="cr-output-label">Extracted Message</div>
            <div class="cr-output" id="stegoOutput">&mdash;</div>
            <div style="margin-top:.5rem;color:#64748b;font-size:.78rem" id="stegoStats"></div>`;
        const w = 160, h = 80;
        const origCtx = el.querySelector('#stegoOrig').getContext('2d');
        const modCtx = el.querySelector('#stegoMod').getContext('2d');
        const diffCtx = el.querySelector('#stegoDiff').getContext('2d');
        const origData = origCtx.createImageData(w, h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            origData.data[i] = Math.floor(100 + 80 * Math.sin(x * 0.1) + 40 * Math.cos(y * 0.15));
            origData.data[i + 1] = Math.floor(80 + 60 * Math.cos(x * 0.08 + y * 0.05));
            origData.data[i + 2] = Math.floor(120 + 70 * Math.sin(y * 0.12 + x * 0.03));
            origData.data[i + 3] = 255;
        }
        origCtx.putImageData(origData, 0, 0);

        function hide() {
            const msg = el.querySelector('#stegoInput').value; const bits = [];
            for (let i = 0; i < msg.length; i++) { const b = msg.charCodeAt(i); for (let j = 7; j >= 0; j--) bits.push((b >> j) & 1); }
            for (let j = 0; j < 8; j++) bits.push(0);
            const modData = modCtx.createImageData(w, h); const dData = diffCtx.createImageData(w, h);
            let bi = 0, changed = 0;
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                for (let c = 0; c < 3; c++) {
                    let val = origData.data[i + c];
                    if (bi < bits.length) { const old = val & 1; val = (val & 0xFE) | bits[bi]; if (old !== bits[bi]) changed++; bi++; }
                    modData.data[i + c] = val; dData.data[i + c] = Math.abs(modData.data[i + c] - origData.data[i + c]) > 0 ? 255 : 0;
                }
                modData.data[i + 3] = 255; dData.data[i + 3] = 255;
            }
            modCtx.putImageData(modData, 0, 0); diffCtx.putImageData(dData, 0, 0);
            el.querySelector('#stegoStats').textContent = (bits.length - 8) + ' message bits embedded. ' + changed + ' LSBs changed out of ' + (w * h * 3) + '.';
        }
        function extract() {
            const modData = modCtx.getImageData(0, 0, w, h); const bits = [];
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; for (let c = 0; c < 3; c++) bits.push(modData.data[i + c] & 1); }
            let msg = '';
            for (let i = 0; i + 8 <= bits.length; i += 8) { let byte = 0; for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b]; if (byte === 0) break; msg += String.fromCharCode(byte); }
            el.querySelector('#stegoOutput').textContent = msg || '(no message found)';
        }
        el.querySelector('#stegoBtn').addEventListener('click', hide);
        el.querySelector('#stegoExtBtn').addEventListener('click', extract);
        hide();
    }

    /* ── PKI Chain Explorer ── */
    function buildPKIInteractive(el) {
        const certs = [
            { level: 'Root CA', name: 'DigiCert Global Root G2', issuer: 'Self-Signed', algo: 'RSA-4096', validity: '2006-2031', color: '#f87171' },
            { level: 'Intermediate CA', name: 'DigiCert TLS RSA SHA256 2020 CA1', issuer: 'DigiCert Global Root G2', algo: 'RSA-2048', validity: '2020-2030', color: '#eab308' },
            { level: 'End-Entity', name: '*.example.com', issuer: 'DigiCert TLS RSA SHA256 2020 CA1', algo: 'ECDSA P-256', validity: '2024-2025', color: '#22c55e' }
        ];
        el.innerHTML = '<p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Click each certificate to explore its contents and follow the chain of trust.</p>' +
            certs.map((c, i) => '<div class="cr-step" style="border-left:3px solid ' + c.color + '"><div class="cr-step-head">' +
                '<span class="cr-step-num" style="background:' + c.color + '22;color:' + c.color + '">' + (i + 1) + '</span>' +
                '<span class="cr-step-title">' + c.level + ': ' + c.name + '</span><span class="cr-step-toggle">&#9654;</span></div>' +
                '<div class="cr-step-body"><div style="display:grid;gap:.5rem;margin-top:1rem">' +
                ['Subject: ' + c.name, 'Issuer: ' + c.issuer, 'Algorithm: ' + c.algo, 'Validity: ' + c.validity,
                 'Trust: ' + (i === 0 ? 'Pre-installed in browser/OS trust store' : 'Signed by ' + certs[i - 1].name)
                ].map(t => '<div style="display:flex;gap:.5rem"><span style="color:#a855f7;font-size:.78rem;font-weight:600;min-width:80px">' + t.split(': ')[0] + ':</span><span style="font-size:.85rem">' + t.split(': ').slice(1).join(': ') + '</span></div>').join('') +
                '</div>' + (i < 2 ? '<div style="text-align:center;color:#475569;margin-top:.75rem">&darr; signs &darr;</div>' : '') + '</div></div>').join('');
        el.querySelectorAll('.cr-step-head').forEach(head => { head.addEventListener('click', () => head.parentElement.classList.toggle('open')); });
    }

    /* ── TLS Handshake Sim ── */
    function buildTLSInteractive(el) {
        const stages = [
            { from: 'Client', to: 'Server', label: 'Client Hello', desc: 'Cipher suites, TLS version, random, ECDHE key share', color: '#22c55e' },
            { from: 'Server', to: 'Client', label: 'Server Hello + Cert', desc: 'Selected suite, random, certificate, key share', color: '#a855f7' },
            { from: 'Both', to: 'Both', label: 'Key Derivation', desc: 'ECDHE shared secret computed, HKDF derives session keys', color: '#eab308' },
            { from: 'Client', to: 'Server', label: 'Finished', desc: 'HMAC of handshake transcript proves client has keys', color: '#22c55e' },
            { from: 'Server', to: 'Client', label: 'Finished', desc: 'HMAC of handshake transcript proves server has keys', color: '#a855f7' },
            { from: 'Both', to: 'Both', label: 'Encrypted Data', desc: 'AES-GCM or ChaCha20-Poly1305 encrypts all traffic', color: '#3b82f6' }
        ];
        el.innerHTML = '<p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Click each stage to walk through a TLS 1.3 handshake:</p>' +
            stages.map((s, i) => '<div class="cr-step" style="border-left:3px solid ' + s.color + '"><div class="cr-step-head">' +
                '<span class="cr-step-num" style="background:' + s.color + '22;color:' + s.color + '">' + (i + 1) + '</span>' +
                '<span class="cr-step-title">' + s.from + ' &rarr; ' + s.to + ': ' + s.label + '</span><span class="cr-step-toggle">&#9654;</span></div>' +
                '<div class="cr-step-body"><div class="cr-step-desc">' + s.desc + '</div></div></div>').join('') +
            '<div class="cr-sim-status" style="margin-top:1rem">Total: 1-RTT (one round trip). TLS 1.2 required 2-RTT.</div>';
        el.querySelectorAll('.cr-step-head').forEach(head => { head.addEventListener('click', () => head.parentElement.classList.toggle('open')); });
    }

    /* ── Key Exchange Compare ── */
    function buildKeyExchangeInteractive(el) {
        const methods = [
            { name: 'Pre-Shared Key (PSK)', pros: ['Simple', 'No public-key math', 'Fast'], cons: ['Must share key first', 'N^2 keys needed', 'No forward secrecy'], fs: false },
            { name: 'RSA Key Transport', pros: ['One-way send', 'Well-understood'], cons: ['No forward secrecy', 'Removed from TLS 1.3', 'Quantum-vulnerable'], fs: false },
            { name: 'ECDHE (Diffie-Hellman)', pros: ['Forward secrecy', 'No pre-shared secret', 'TLS 1.3 standard'], cons: ['MITM without auth', 'Needs certificate layer', 'Quantum-vulnerable'], fs: true }
        ];
        el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem">' +
            methods.map(m => '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem">' +
                '<div style="font-weight:700;color:#fff;font-size:1rem;margin-bottom:.75rem">' + m.name + '</div>' +
                '<div style="margin-bottom:.5rem"><span style="font-size:.72rem;color:#22c55e;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Advantages</span>' +
                '<ul style="padding-left:1rem;margin:.25rem 0">' + m.pros.map(p => '<li style="color:#94a3b8;font-size:.82rem">' + p + '</li>').join('') + '</ul></div>' +
                '<div style="margin-bottom:.5rem"><span style="font-size:.72rem;color:#f87171;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Disadvantages</span>' +
                '<ul style="padding-left:1rem;margin:.25rem 0">' + m.cons.map(c => '<li style="color:#94a3b8;font-size:.82rem">' + c + '</li>').join('') + '</ul></div>' +
                '<div style="padding:.5rem .75rem;border-radius:6px;font-size:.78rem;font-weight:600;text-align:center;' + (m.fs ? 'background:#22c55e15;color:#22c55e;border:1px solid #22c55e33' : 'background:#f8717115;color:#f87171;border:1px solid #f8717133') + '">' + (m.fs ? 'Forward Secrecy' : 'No Forward Secrecy') + '</div></div>').join('') + '</div>';
    }

    /* ── Symmetric vs Asymmetric Compare ── */
    function buildSymAsymInteractive(el, inter) {
        el.innerHTML = `
            <div class="cr-input-row">
                <input class="cr-input" id="saInput" placeholder="${inter.placeholder}" value="The quick brown fox">
            </div>
            <div class="cr-grid-2">
                <div class="cr-vis-box"><div class="cr-vis-label">Symmetric (AES-like)</div><div style="font-size:.78rem;color:#64748b;margin-bottom:.5rem">Key: <code style="color:#22c55e">shared-secret</code></div><div class="cr-output" id="symOut" style="min-height:40px;font-size:.75rem"></div><div id="symTime" style="font-size:.72rem;color:#22c55e;margin-top:.5rem"></div></div>
                <div class="cr-vis-box"><div class="cr-vis-label">Asymmetric (RSA-like)</div><div style="font-size:.78rem;color:#64748b;margin-bottom:.5rem">Key: <code style="color:#f87171">pub/priv pair</code></div><div class="cr-output" id="asymOut" style="min-height:40px;font-size:.75rem"></div><div id="asymTime" style="font-size:.72rem;color:#eab308;margin-top:.5rem"></div></div>
            </div>
            <div style="text-align:center;margin-top:1rem"><button class="cr-btn" id="saBtn">Encrypt Both</button></div>
            <div class="cr-sim-status" id="saNote" style="margin-top:1rem">Click to compare speed side by side.</div>`;
        function simSym(text) { const k = 0xA5B7C9D1; return Array.from(new TextEncoder().encode(text)).map((b, i) => ((b ^ ((k >> ((i % 4) * 8)) & 0xFF)) & 0xFF).toString(16).padStart(2, '0')).join(''); }
        function simAsym(text) { const n = 3233, e = 17; return Array.from(new TextEncoder().encode(text)).map(b => { let r = 1; for (let i = 0; i < e; i++) r = (r * b) % n; return r.toString(16).padStart(4, '0'); }).join(''); }
        el.querySelector('#saBtn').addEventListener('click', () => {
            const text = el.querySelector('#saInput').value || 'test';
            const t1 = performance.now(); for (let i = 0; i < 1000; i++) simSym(text); const sMs = (performance.now() - t1).toFixed(2);
            el.querySelector('#symOut').textContent = simSym(text); el.querySelector('#symTime').textContent = '1000x: ' + sMs + 'ms';
            const t2 = performance.now(); for (let i = 0; i < 1000; i++) simAsym(text); const aMs = (performance.now() - t2).toFixed(2);
            el.querySelector('#asymOut').textContent = simAsym(text); el.querySelector('#asymTime').textContent = '1000x: ' + aMs + 'ms';
            const ratio = (parseFloat(aMs) / parseFloat(sMs)).toFixed(1);
            el.querySelector('#saNote').innerHTML = 'Asymmetric was <strong style="color:#e2e8f0">' + ratio + 'x slower</strong>. In reality the difference is ~1000x, which is why TLS uses asymmetric only for key exchange.';
        });
    }

    /* ================================================================
       QUIZ TAB
       ================================================================ */
    function renderQuiz() {
        const panel = document.getElementById('panel-quiz');
        const state = getState();
        const answers = state.quizAnswers || {};
        const total = topic.quiz.length;
        let correctCount = 0;
        Object.entries(answers).forEach(([qi, ai]) => { if (topic.quiz[qi] && topic.quiz[qi].correct === ai) correctCount++; });
        const answeredCount = Object.keys(answers).length;
        const pct = total ? Math.round(correctCount / total * 100) : 0;

        panel.innerHTML = `
            <div class="cr-score-bar">
                <div class="cr-score-num">${answeredCount > 0 ? pct + '%' : '&mdash;'}</div>
                <div class="cr-score-label">${answeredCount} of ${total} answered${answeredCount > 0 ? ' &middot; ' + correctCount + ' correct' : ''}</div>
                <div class="cr-score-bar-visual"><div class="cr-score-fill" style="width:${pct}%"></div></div>
                ${answeredCount > 0 ? '<button class="cr-reset-btn" id="resetQuiz">Reset Quiz</button>' : ''}
            </div>
            ${topic.quiz.map((q, i) => renderQuestion(q, i, answers)).join('')}`;

        panel.querySelectorAll('.cr-option:not(.answered)').forEach(btn => {
            btn.addEventListener('click', (e) => { answerQuestion(parseInt(e.target.dataset.qi), parseInt(e.target.dataset.oi)); });
        });
        const resetBtn = document.getElementById('resetQuiz');
        if (resetBtn) { resetBtn.addEventListener('click', () => { const st = getState(); delete st.quizAnswers; saveState(st); renderQuiz(); recordScore(0, 0); updateProgress(); }); }
    }

    function renderQuestion(q, qi, answers) {
        const answered = qi in answers; const userAnswer = answers[qi];
        return '<div class="cr-question" id="q-' + qi + '"><div class="cr-q-num">Question ' + (qi + 1) + ' of ' + topic.quiz.length + '</div><div class="cr-q-text">' + q.question + '</div>' +
            q.options.map((opt, oi) => {
                let cls = 'cr-option';
                if (answered) { cls += ' answered'; if (oi === q.correct) cls += ' correct right-answer'; else if (oi === userAnswer && oi !== q.correct) cls += ' wrong'; }
                return '<button class="' + cls + '" data-qi="' + qi + '" data-oi="' + oi + '">' + opt + '</button>';
            }).join('') +
            '<div class="cr-explanation ' + (answered ? 'show' : '') + '">' + q.explanation + '</div></div>';
    }

    function answerQuestion(qi, oi) {
        const st = getState();
        if (!st.quizAnswers) st.quizAnswers = {};
        if (qi in st.quizAnswers) return;
        st.quizAnswers[qi] = oi;
        saveState(st);
        renderQuiz();
        updateProgress();
        const total = topic.quiz.length;
        if (Object.keys(st.quizAnswers).length === total) {
            let correct = 0;
            Object.entries(st.quizAnswers).forEach(([q, a]) => { if (topic.quiz[q] && topic.quiz[q].correct === a) correct++; });
            recordScore(correct, total);
        }
    }

    function recordScore(correct, total) {
        if (typeof GameTracker !== 'undefined' && total > 0) {
            try { GameTracker.record('crypto-' + topic.key.toLowerCase(), { result: correct / total >= 0.7 ? 'success' : 'failure', score: correct, maxScore: total, percentage: Math.round(correct / total * 100) }); } catch(e) {}
        }
        try {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            if (!progress.shield) progress.shield = {};
            progress.shield['crypto-' + topic.key.toLowerCase()] = { completed: total > 0 && correct / total >= 0.7, score: correct, total: total, timestamp: Date.now() };
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
        } catch(e) {}
    }

    function updateProgress() {
        const state = getState();
        const sv = Object.keys(state.stepsViewed || {}).length;
        const ts = topic.howItWorks.steps.length;
        const qa = Object.keys(state.quizAnswers || {}).length;
        const tq = topic.quiz.length;
        const progress = Math.round(((sv / ts) * 50 + (qa / tq) * 50));
        const fill = document.querySelector('.cr-progress-fill');
        const text = document.querySelector('.cr-progress-text');
        if (fill) fill.style.width = progress + '%';
        if (text) text.textContent = progress + '% complete';
    }

    return { init };
})();
