/**
 * IPToolsRenderer.js — Shared interactive renderer for IP addressing/subnetting applets
 *
 * Usage: IPToolsRenderer.init('binary-ip')
 * Requires: IPToolsData.js loaded first
 */
const IPToolsRenderer = (() => {
    let topic = null;
    let storageKey = '';

    const TOPIC_PATHS = {
        'binary-ip': 'binary-ip', 'cidr-notation': 'cidr-notation', 'ipv4-classes': 'ipv4-classes',
        'ipv6-addressing': 'ipv6-addressing', 'nat-pat': 'nat-pat', 'network-classes': 'network-classes',
        'private-public-ip': 'private-public-ip', 'subnet-calculator': 'subnet-calculator',
        'subnet-masks': 'subnet-masks', 'subnetting-practice': 'subnetting-practice',
        'supernetting': 'supernetting', 'vlsm': 'vlsm', 'wildcard-masks': 'wildcard-masks'
    };

    /* ══════════════════════════════════════════════════════════════
       IP MATH UTILITIES
       ══════════════════════════════════════════════════════════════ */
    const IP = {
        toInt(ip) {
            const p = ip.split('.').map(Number);
            return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
        },
        fromInt(n) {
            return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
        },
        isValid(ip) {
            if (!ip || typeof ip !== 'string') return false;
            const parts = ip.split('.');
            if (parts.length !== 4) return false;
            return parts.every(p => { const n = Number(p); return Number.isInteger(n) && n >= 0 && n <= 255 && p === String(n); });
        },
        toBin(octet) {
            return octet.toString(2).padStart(8, '0');
        },
        toBinFull(ip) {
            return ip.split('.').map(o => IP.toBin(Number(o))).join('.');
        },
        maskFromPrefix(prefix) {
            if (prefix === 0) return 0;
            return (~0 << (32 - prefix)) >>> 0;
        },
        maskToStr(prefix) {
            return IP.fromInt(IP.maskFromPrefix(prefix));
        },
        networkAddr(ipInt, prefix) {
            return (ipInt & IP.maskFromPrefix(prefix)) >>> 0;
        },
        broadcastAddr(ipInt, prefix) {
            const wild = ~IP.maskFromPrefix(prefix) >>> 0;
            return (IP.networkAddr(ipInt, prefix) | wild) >>> 0;
        },
        hostCount(prefix) {
            if (prefix >= 31) return prefix === 32 ? 1 : 2;
            return Math.pow(2, 32 - prefix) - 2;
        },
        totalAddrs(prefix) {
            return Math.pow(2, 32 - prefix);
        },
        wildcardStr(prefix) {
            return IP.fromInt(~IP.maskFromPrefix(prefix) >>> 0);
        },
        prefixFromMask(maskStr) {
            const n = IP.toInt(maskStr);
            let bits = 0;
            let found0 = false;
            for (let i = 31; i >= 0; i--) {
                if ((n >>> i) & 1) { if (found0) return -1; bits++; }
                else { found0 = true; }
            }
            return bits;
        },
        getClass(firstOctet) {
            if (firstOctet >= 1 && firstOctet <= 126) return 'A';
            if (firstOctet === 127) return 'Loopback';
            if (firstOctet >= 128 && firstOctet <= 191) return 'B';
            if (firstOctet >= 192 && firstOctet <= 223) return 'C';
            if (firstOctet >= 224 && firstOctet <= 239) return 'D';
            return 'E';
        },
        isPrivate(ip) {
            const n = IP.toInt(ip);
            if ((n >>> 24) === 10) return { private: true, range: '10.0.0.0/8 (Class A Private)' };
            if ((n >>> 20) === (172 << 4 | 1)) return { private: true, range: '172.16.0.0/12 (Class B Private)' };
            const hi16 = n >>> 16;
            if (hi16 === ((172 << 8) | 16) || (hi16 >= ((172 << 8) | 16) && hi16 <= ((172 << 8) | 31)))
                return { private: true, range: '172.16.0.0/12 (Class B Private)' };
            if ((n >>> 16) === ((192 << 8) | 168)) return { private: true, range: '192.168.0.0/16 (Class C Private)' };
            if ((n >>> 24) === 127) return { private: true, range: '127.0.0.0/8 (Loopback)' };
            if ((n >>> 16) === ((169 << 8) | 254)) return { private: true, range: '169.254.0.0/16 (APIPA)' };
            return { private: false, range: 'Public' };
        },
        isPrivateCheck(ip) {
            const parts = ip.split('.').map(Number);
            const a = parts[0], b = parts[1];
            if (a === 10) return true;
            if (a === 172 && b >= 16 && b <= 31) return true;
            if (a === 192 && b === 168) return true;
            return false;
        }
    };

    /* ══════════════════════════════════════════════════════════════
       STATE
       ══════════════════════════════════════════════════════════════ */
    function getState() { try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; } }
    function saveState(s) { localStorage.setItem(storageKey, JSON.stringify(s)); }

    /* ══════════════════════════════════════════════════════════════
       INIT
       ══════════════════════════════════════════════════════════════ */
    function init(id) {
        topic = IPToolsData[id];
        if (!topic) { document.body.innerHTML = '<p style="color:#f87171;padding:2rem">Topic not found: ' + id + '</p>'; return; }
        storageKey = 'hexworth_ip_' + id.replace(/-/g, '_');
        render();
    }

    /* ══════════════════════════════════════════════════════════════
       MAIN RENDER
       ══════════════════════════════════════════════════════════════ */
    function render() {
        const c = topic.color;
        document.title = topic.title + ' — Hexworth Prime';

        const root = document.createElement('div');
        root.id = 'ip-root';
        root.innerHTML = `
${getStyles(c)}
<a class="ip-back" href="../../../index.html">&lsaquo; Back to Web House</a>
<div class="ip-header">
    <div class="ip-header-top">
        <span class="ip-icon">${topic.icon}</span>
        <span class="ip-title">${topic.title}</span>
        <span class="ip-badge">IP Tools</span>
    </div>
    <p class="ip-desc">${topic.description}</p>
</div>
<div class="ip-tabs">
    <button class="ip-tab active" data-tab="learn">Learn</button>
    <button class="ip-tab" data-tab="practice">Practice</button>
    <button class="ip-tab" data-tab="quiz">Quiz</button>
</div>
<div id="panel-learn" class="ip-panel active"></div>
<div id="panel-practice" class="ip-panel"></div>
<div id="panel-quiz" class="ip-panel"></div>`;

        document.body.innerHTML = '';
        document.body.appendChild(root);
        renderLearn();
        renderPractice();
        renderQuiz();
        bindTabs();
    }

    /* ══════════════════════════════════════════════════════════════
       STYLES
       ══════════════════════════════════════════════════════════════ */
    function getStyles(c) {
        return `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh}
#ip-root{max-width:1100px;margin:0 auto;padding:1rem}
.ip-header{background:linear-gradient(135deg,#0f172a 0%,${c}18 100%);border:1px solid ${c}44;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.ip-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${c},transparent)}
.ip-header-top{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.ip-icon{font-size:2.5rem}
.ip-title{font-size:1.6rem;font-weight:700;color:#fff}
.ip-badge{background:${c}33;color:${c};border:1px solid ${c}66;padding:3px 12px;border-radius:20px;font-size:.75rem;font-weight:600;letter-spacing:.5px}
.ip-desc{color:#94a3b8;font-size:.9rem;line-height:1.5;margin-top:.5rem}
.ip-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px}
.ip-tab{flex:1;padding:.65rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;text-align:center}
.ip-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.ip-tab.active{background:${c}22;color:${c};border:1px solid ${c}44}
.ip-panel{display:none;animation:ipFade .3s ease}
.ip-panel.active{display:block}
@keyframes ipFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ip-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.ip-back:hover{color:${c}}

/* Learn sections */
.ip-learn-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.ip-learn-title{font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.75rem}
.ip-learn-text{color:#94a3b8;font-size:.88rem;line-height:1.7}

/* Practice area */
.ip-practice-area{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.ip-input-row{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}
.ip-input{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#e2e8f0;padding:8px 14px;border-radius:8px;font-size:.9rem;font-family:'Consolas','Courier New',monospace;outline:none;width:200px}
.ip-input:focus{border-color:${c}66}
.ip-input::placeholder{color:#4b5563}
.ip-btn{background:${c}22;color:${c};border:1px solid ${c}44;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:500;transition:all .2s}
.ip-btn:hover{background:${c}33}
.ip-btn-sm{padding:5px 14px;font-size:.8rem}
.ip-btn-danger{background:#ef444422;color:#ef4444;border-color:#ef444444}
.ip-btn-danger:hover{background:#ef444433}
.ip-btn-success{background:#22c55e22;color:#22c55e;border-color:#22c55e44}
.ip-btn-success:hover{background:#22c55e33}
.ip-result-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem;margin-top:1rem}
.ip-result-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:.75rem 1rem}
.ip-result-label{font-size:.72rem;color:${c};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.25rem}
.ip-result-value{font-size:1rem;font-weight:600;color:#fff;font-family:'Consolas','Courier New',monospace;word-break:break-all}
.ip-result-sub{font-size:.75rem;color:#64748b;margin-top:2px;font-family:'Consolas','Courier New',monospace}

/* Binary display */
.ip-binary-row{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin:.75rem 0}
.ip-bit{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:6px;font-family:'Consolas',monospace;font-size:.95rem;font-weight:700;border:1px solid rgba(255,255,255,.1);flex-direction:column}
.ip-bit.on{background:${c}33;color:${c};border-color:${c}55}
.ip-bit.off{background:rgba(255,255,255,.03);color:#4b5563}
.ip-bit-toggle{cursor:pointer!important;user-select:none;transition:transform .1s,box-shadow .1s}
.ip-bit-toggle:hover{transform:scale(1.08);box-shadow:0 0 8px ${c}33}
.ip-bit-toggle:active{transform:scale(.95)}
.ip-bit-sep{width:12px;display:flex;align-items:center;justify-content:center;color:#4b5563;font-size:1.2rem}
.ip-place-row{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-bottom:.5rem}
.ip-place{width:36px;text-align:center;font-size:.65rem;color:#64748b}
.ip-place-sep{width:12px}
.ip-octet-label{display:flex;justify-content:space-around;margin-top:4px}
.ip-octet-val{text-align:center;font-size:.85rem;font-weight:600;color:#e2e8f0;width:calc(25% - 10px)}

/* Diagram */
.ip-diagram{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:1rem;margin:.75rem 0;overflow-x:auto}
.ip-class-bar{display:flex;height:40px;border-radius:6px;overflow:hidden;margin:.5rem 0}
.ip-class-seg{display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:600;color:#fff;transition:all .2s;cursor:default;position:relative}
.ip-class-seg:hover{filter:brightness(1.2)}
.ip-class-seg.highlight{outline:2px solid #fff;outline-offset:-2px;z-index:1}

/* Quiz */
.ip-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.ip-q-num{font-size:.72rem;color:${c};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem}
.ip-q-text{color:#e2e8f0;font-size:.92rem;line-height:1.5;margin-bottom:1rem}
.ip-option{display:block;width:100%;text-align:left;padding:.7rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s;line-height:1.4}
.ip-option:hover:not(.answered){background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.ip-option.correct{background:#22c55e15;border-color:#22c55e55;color:#22c55e}
.ip-option.wrong{background:#ef444415;border-color:#ef444455;color:#ef4444}
.ip-option.right-answer{border-color:#22c55e44;background:#22c55e08}
.ip-explanation{display:none;margin-top:.75rem;padding:.75rem 1rem;background:${c}08;border-left:3px solid ${c}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.83rem;line-height:1.5}
.ip-explanation.show{display:block}
.ip-score-bar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.ip-score-num{font-size:2rem;font-weight:700;color:${c}}
.ip-score-label{color:#64748b;font-size:.8rem;margin-top:.25rem}
.ip-score-fill-wrap{height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:.75rem;overflow:hidden}
.ip-score-fill{height:100%;background:${c};border-radius:3px;transition:width .5s ease}
.ip-reset-btn{background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.5rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.8rem;margin-top:.75rem;transition:all .2s}
.ip-reset-btn:hover{border-color:${c}66;color:${c}}

/* Drill */
.ip-drill-problem{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.ip-drill-q{font-size:1rem;color:#fff;font-weight:600;margin-bottom:1rem}
.ip-drill-input{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.ip-feedback{padding:.75rem 1rem;border-radius:8px;margin-top:.75rem;font-size:.88rem}
.ip-feedback.correct{background:#22c55e15;border:1px solid #22c55e44;color:#22c55e}
.ip-feedback.wrong{background:#ef444415;border:1px solid #ef444444;color:#ef4444}
.ip-streak{display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;font-size:.85rem;color:#94a3b8}
.ip-streak strong{color:${c};font-size:1.2rem}

/* Table */
.ip-table{width:100%;border-collapse:collapse;margin:.75rem 0;font-size:.82rem}
.ip-table th{text-align:left;padding:8px 12px;color:${c};font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid rgba(255,255,255,.1)}
.ip-table td{padding:8px 12px;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,.04);font-family:'Consolas',monospace}
.ip-table tr:hover td{background:rgba(255,255,255,.02)}

/* VLSM designer */
.ip-vlsm-row{display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem;flex-wrap:wrap}
.ip-vlsm-input{width:120px}
.ip-vlsm-result{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:.75rem;margin-top:.5rem;font-family:'Consolas',monospace;font-size:.82rem;color:#94a3b8}

/* NAT table */
.ip-nat-table{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:8px;overflow:hidden;margin:.75rem 0}
.ip-nat-row{display:grid;grid-template-columns:1fr 80px 1fr 80px;gap:1px;padding:.5rem .75rem;border-bottom:1px solid rgba(255,255,255,.04);font-size:.8rem;align-items:center}
.ip-nat-header{background:${c}11;font-weight:600;color:${c};font-size:.72rem;text-transform:uppercase;letter-spacing:.3px}
.ip-nat-arrow{text-align:center;color:${c}}

/* Responsive */
@media(max-width:768px){
    .ip-result-grid{grid-template-columns:1fr}
    .ip-bit{width:28px;height:28px;font-size:.8rem}
    .ip-place{width:28px;font-size:.55rem}
    .ip-bit-sep,.ip-place-sep{width:8px}
}
@media(max-width:640px){
    #ip-root{padding:.75rem}
    .ip-header{padding:1rem 1.25rem}
    .ip-title{font-size:1.2rem}
    .ip-tab{font-size:.78rem;padding:.5rem .75rem}
    .ip-input{width:100%}
    .ip-input-row{flex-direction:column;align-items:stretch}
    .ip-btn{width:100%;text-align:center}
}
</style>`;
    }

    /* ══════════════════════════════════════════════════════════════
       TABS
       ══════════════════════════════════════════════════════════════ */
    function bindTabs() {
        document.querySelectorAll('.ip-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ip-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ip-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* ══════════════════════════════════════════════════════════════
       LEARN TAB
       ══════════════════════════════════════════════════════════════ */
    function renderLearn() {
        const panel = document.getElementById('panel-learn');
        panel.innerHTML = topic.learn.sections.map(s => {
            let diagramHTML = s.diagram ? renderDiagram(s.diagram) : '';
            return `<div class="ip-learn-section">
                <div class="ip-learn-title">${s.title}</div>
                <div class="ip-learn-text">${s.content}</div>
                ${diagramHTML}
            </div>`;
        }).join('');
    }

    function renderDiagram(type) {
        switch (type) {
            case 'octet-bits':
                return `<div class="ip-diagram">
                    <div style="text-align:center;margin-bottom:.5rem;color:#64748b;font-size:.75rem">Place values for one octet</div>
                    <div class="ip-place-row">${[128,64,32,16,8,4,2,1].map(v => `<span class="ip-place">${v}</span>`).join('')}</div>
                    <div class="ip-binary-row">${[1,1,0,0,0,0,0,0].map((b,i) => `<span class="ip-bit ${b?'on':'off'}">${b}</span>`).join('')}</div>
                    <div style="text-align:center;color:#e2e8f0;font-size:.9rem;margin-top:.5rem">128 + 64 = <strong>192</strong></div>
                </div>`;
            case 'class-ranges':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">IPv4 Address Class Ranges</div>
                    <div class="ip-class-bar">
                        <div class="ip-class-seg" style="flex:126;background:#3b82f6">A (1-126)</div>
                        <div class="ip-class-seg" style="flex:1;background:#6b7280" title="127 = Loopback">Lo</div>
                        <div class="ip-class-seg" style="flex:64;background:#8b5cf6">B (128-191)</div>
                        <div class="ip-class-seg" style="flex:32;background:#22c55e">C (192-223)</div>
                        <div class="ip-class-seg" style="flex:16;background:#eab308">D (224-239)</div>
                        <div class="ip-class-seg" style="flex:16;background:#ef4444">E (240-255)</div>
                    </div>
                </div>`;
            case 'ipv6-format':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">IPv6 Address Structure</div>
                    <div style="font-family:Consolas,monospace;font-size:.85rem;color:#e2e8f0;text-align:center;margin:.5rem 0">
                        <span style="color:#3b82f6">2001</span>:<span style="color:#8b5cf6">0db8</span>:<span style="color:#22c55e">85a3</span>:<span style="color:#eab308">0000</span>:<span style="color:#eab308">0000</span>:<span style="color:#ef4444">8a2e</span>:<span style="color:#f97316">0370</span>:<span style="color:#ec4899">7334</span>
                    </div>
                    <div style="text-align:center;color:#94a3b8;font-size:.78rem;margin-top:.25rem">8 groups x 4 hex digits = 128 bits</div>
                    <div style="text-align:center;color:#64748b;font-size:.78rem;margin-top:.5rem">Abbreviated: 2001:db8:85a3::8a2e:370:7334</div>
                </div>`;
            case 'nat-types':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">NAT Types Comparison</div>
                    <table class="ip-table">
                        <tr><th>Type</th><th>Mapping</th><th>Use Case</th></tr>
                        <tr><td style="color:#3b82f6;font-weight:600">Static NAT</td><td>1:1 permanent</td><td>Servers needing consistent public IP</td></tr>
                        <tr><td style="color:#8b5cf6;font-weight:600">Dynamic NAT</td><td>1:1 temporary (from pool)</td><td>Medium offices with IP pool</td></tr>
                        <tr><td style="color:#22c55e;font-weight:600">PAT/Overload</td><td>Many:1 (port-based)</td><td>Home/office — most common</td></tr>
                    </table>
                </div>`;
            case 'classful-bits':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">Network vs Host Bit Division</div>
                    <table class="ip-table">
                        <tr><th>Class</th><th>Format</th><th>Network Bits</th><th>Host Bits</th><th>Default Mask</th></tr>
                        <tr><td style="color:#3b82f6;font-weight:600">A</td><td>N.H.H.H</td><td>8</td><td>24</td><td>255.0.0.0</td></tr>
                        <tr><td style="color:#8b5cf6;font-weight:600">B</td><td>N.N.H.H</td><td>16</td><td>16</td><td>255.255.0.0</td></tr>
                        <tr><td style="color:#22c55e;font-weight:600">C</td><td>N.N.N.H</td><td>24</td><td>8</td><td>255.255.255.0</td></tr>
                    </table>
                </div>`;
            case 'private-ranges':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">RFC 1918 Private Address Ranges</div>
                    <table class="ip-table">
                        <tr><th>Range</th><th>CIDR</th><th>Addresses</th><th>Class</th></tr>
                        <tr><td style="color:#3b82f6;font-weight:600">10.0.0.0 - 10.255.255.255</td><td>10.0.0.0/8</td><td>16,777,216</td><td>A</td></tr>
                        <tr><td style="color:#8b5cf6;font-weight:600">172.16.0.0 - 172.31.255.255</td><td>172.16.0.0/12</td><td>1,048,576</td><td>B</td></tr>
                        <tr><td style="color:#22c55e;font-weight:600">192.168.0.0 - 192.168.255.255</td><td>192.168.0.0/16</td><td>65,536</td><td>C</td></tr>
                    </table>
                </div>`;
            case 'and-operation':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">Bitwise AND Example</div>
                    <div style="font-family:Consolas,monospace;font-size:.82rem;line-height:2">
                        <div><span style="color:#64748b;width:100px;display:inline-block">IP Address:</span> <span style="color:#e2e8f0">11000000.10101000.00000001.01100101</span> <span style="color:#64748b">(192.168.1.101)</span></div>
                        <div><span style="color:#64748b;width:100px;display:inline-block">Mask:</span> <span style="color:#3b82f6">11111111.11111111.11111111.00000000</span> <span style="color:#64748b">(255.255.255.0)</span></div>
                        <div style="border-top:1px solid rgba(255,255,255,.1);margin:4px 0;padding-top:4px"><span style="color:#64748b;width:100px;display:inline-block">Network:</span> <span style="color:#22c55e">11000000.10101000.00000001.00000000</span> <span style="color:#64748b">(192.168.1.0)</span></div>
                    </div>
                </div>`;
            case 'mask-binary':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">Subnet Mask in Binary</div>
                    <div style="font-family:Consolas,monospace;font-size:.82rem;line-height:2">
                        <div><span style="color:#3b82f6">11111111.11111111.11111111.</span><span style="color:#ef4444">00000000</span> = 255.255.255.0 (/24)</div>
                        <div><span style="color:#3b82f6">11111111.11111111.11111111.11</span><span style="color:#ef4444">000000</span> = 255.255.255.192 (/26)</div>
                        <div><span style="color:#3b82f6">11111111.11111111.11110000.</span><span style="color:#ef4444">00000000</span> = 255.255.240.0 (/20)</div>
                    </div>
                    <div style="margin-top:.5rem;font-size:.75rem"><span style="color:#3b82f6">Blue = Network bits (1s)</span> &nbsp; <span style="color:#ef4444">Red = Host bits (0s)</span></div>
                </div>`;
            case 'subnet-formulas':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">Key Subnetting Formulas</div>
                    <table class="ip-table">
                        <tr><th>Formula</th><th>Meaning</th></tr>
                        <tr><td style="color:#3b82f6;font-weight:600">2^n</td><td>Number of subnets (n = borrowed bits)</td></tr>
                        <tr><td style="color:#8b5cf6;font-weight:600">2^h - 2</td><td>Usable hosts per subnet (h = host bits)</td></tr>
                        <tr><td style="color:#22c55e;font-weight:600">256 - mask value</td><td>Block size (increment) in the interesting octet</td></tr>
                    </table>
                </div>`;
            case 'supernet-example':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">Supernetting Example</div>
                    <div style="font-family:Consolas,monospace;font-size:.82rem;line-height:1.8">
                        <div style="color:#94a3b8">192.168.0.0/24 &nbsp; 11000000.10101000.000000<span style="color:#3b82f6">00</span>.xxxxxxxx</div>
                        <div style="color:#94a3b8">192.168.1.0/24 &nbsp; 11000000.10101000.000000<span style="color:#3b82f6">01</span>.xxxxxxxx</div>
                        <div style="color:#94a3b8">192.168.2.0/24 &nbsp; 11000000.10101000.000000<span style="color:#3b82f6">10</span>.xxxxxxxx</div>
                        <div style="color:#94a3b8">192.168.3.0/24 &nbsp; 11000000.10101000.000000<span style="color:#3b82f6">11</span>.xxxxxxxx</div>
                        <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:4px;margin-top:4px">
                            <span style="color:#22c55e">Summary: 192.168.0.0/22</span> <span style="color:#64748b">(22 common bits)</span>
                        </div>
                    </div>
                </div>`;
            case 'vlsm-process':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">VLSM Allocation Process</div>
                    <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;justify-content:center;padding:.5rem 0">
                        <span style="background:#3b82f622;color:#3b82f6;padding:6px 14px;border-radius:6px;font-size:.78rem;border:1px solid #3b82f644">1. List needs</span>
                        <span style="color:#4b5563">&rarr;</span>
                        <span style="background:#8b5cf622;color:#8b5cf6;padding:6px 14px;border-radius:6px;font-size:.78rem;border:1px solid #8b5cf644">2. Sort largest first</span>
                        <span style="color:#4b5563">&rarr;</span>
                        <span style="background:#22c55e22;color:#22c55e;padding:6px 14px;border-radius:6px;font-size:.78rem;border:1px solid #22c55e44">3. Allocate sequentially</span>
                        <span style="color:#4b5563">&rarr;</span>
                        <span style="background:#eab30822;color:#eab308;padding:6px 14px;border-radius:6px;font-size:.78rem;border:1px solid #eab30844">4. Verify no overlaps</span>
                    </div>
                </div>`;
            case 'wildcard-calc':
                return `<div class="ip-diagram">
                    <div style="margin-bottom:.5rem;color:#64748b;font-size:.75rem">Wildcard Mask Calculation</div>
                    <div style="font-family:Consolas,monospace;font-size:.85rem;line-height:2;text-align:center">
                        <div><span style="color:#64748b">255.255.255.255</span></div>
                        <div><span style="color:#ef4444">- 255.255.255.192</span> <span style="color:#64748b">(subnet mask)</span></div>
                        <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:4px;margin-top:2px"><span style="color:#22c55e">=&nbsp; 0 . 0 . 0 . 63</span> <span style="color:#64748b">(wildcard mask)</span></div>
                    </div>
                </div>`;
            default:
                return '';
        }
    }

    /* ══════════════════════════════════════════════════════════════
       PRACTICE TAB — dispatches to the right interactive tool
       ══════════════════════════════════════════════════════════════ */
    function renderPractice() {
        const panel = document.getElementById('panel-practice');
        switch (topic.practiceType) {
            case 'binary-converter': renderBinaryConverter(panel); break;
            case 'cidr-calculator': renderCIDRCalc(panel); break;
            case 'class-identifier': renderClassIdentifier(panel); break;
            case 'ipv6-tool': renderIPv6Tool(panel); break;
            case 'nat-simulator': renderNATSim(panel); break;
            case 'private-public-checker': renderPrivatePublicChecker(panel); break;
            case 'subnet-calc': renderSubnetCalc(panel); break;
            case 'mask-explorer': renderMaskExplorer(panel); break;
            case 'subnetting-drill': renderSubnettingDrill(panel); break;
            case 'supernet-calculator': renderSupernetCalc(panel); break;
            case 'vlsm-designer': renderVLSMDesigner(panel); break;
            case 'wildcard-calculator': renderWildcardCalc(panel); break;
            default: panel.innerHTML = '<div class="ip-practice-area"><p style="color:#94a3b8">Interactive tool coming soon.</p></div>';
        }
    }

    /* ── 1. Binary Converter (interactive bit toggles) ── */
    function renderBinaryConverter(panel) {
        const places = [128, 64, 32, 16, 8, 4, 2, 1];
        const bits = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
        const octetNames = ['Octet 1', 'Octet 2', 'Octet 3', 'Octet 4'];

        function calcDecimal(octet) {
            return octet.reduce((sum, bit, i) => sum + bit * places[i], 0);
        }

        function buildHTML() {
            const octetsHTML = bits.map((oct, oi) => {
                const bitsHTML = oct.map((b, bi) => {
                    const cls = b ? 'ip-bit on ip-bit-toggle' : 'ip-bit off ip-bit-toggle';
                    return `<div class="${cls}" data-o="${oi}" data-b="${bi}" style="cursor:pointer;user-select:none;flex-direction:column;position:relative" title="Click to toggle">
                        <span class="ip-bit-val">${b}</span>
                        <span style="font-size:.55rem;color:${b ? 'inherit' : '#4b5563'};opacity:.8;margin-top:1px">${places[bi]}</span>
                    </div>`;
                }).join('');
                const dec = calcDecimal(oct);
                return `<div style="text-align:center">
                    <div style="font-size:.7rem;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">${octetNames[oi]}</div>
                    <div style="display:flex;gap:3px;justify-content:center">${bitsHTML}</div>
                    <div style="margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px">
                        <input type="text" class="ip-input ip-octet-dec" data-o="${oi}" value="${dec}" maxlength="3" style="width:54px;text-align:center;padding:4px 6px;font-size:.9rem">
                    </div>
                </div>`;
            });

            const ipStr = bits.map(o => calcDecimal(o)).join('.');
            const binStr = bits.map(o => o.join('')).join('.');
            const octets = bits.map(o => calcDecimal(o));

            return `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Interactive Binary IP Converter</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Click any bit to toggle it on/off. Type decimal values directly in the boxes below each octet. Watch binary and decimal update in real time.</p>
                <div id="binBitGrid" style="display:flex;gap:12px;justify-content:center;align-items:flex-start;flex-wrap:wrap;margin:1.5rem 0">
                    ${octetsHTML.join('<div style="color:#4b5563;font-size:1.5rem;font-weight:700;align-self:center;margin-top:8px">.</div>')}
                </div>
                <div class="ip-result-grid" id="binResultCards">
                    <div class="ip-result-card"><div class="ip-result-label">IP Address (Decimal)</div><div class="ip-result-value" id="binIpDec">${ipStr}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">IP Address (Binary)</div><div class="ip-result-value" id="binIpBin" style="font-size:.82rem">${binStr}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Hexadecimal</div><div class="ip-result-value" id="binIpHex">${octets.map(o => o.toString(16).padStart(2,'0').toUpperCase()).join('.')}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">IP Class</div><div class="ip-result-value" id="binIpClass">Class ${IP.getClass(octets[0])}</div></div>
                </div>
                <div style="display:flex;gap:.5rem;margin-top:1rem;flex-wrap:wrap">
                    <button class="ip-btn ip-btn-sm" id="binRandom">Random IP</button>
                    <button class="ip-btn ip-btn-sm" id="binClear">Clear All</button>
                    <button class="ip-btn ip-btn-sm" id="binAllOn">All On (255.255.255.255)</button>
                </div>
            </div>
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Text Converter</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter an IP in decimal or binary format.</p>
                <div class="ip-input-row">
                    <input class="ip-input" id="binDecInput" placeholder="e.g. 192.168.1.1 or 11000000.10101000.00000001.00000001" style="width:380px">
                    <button class="ip-btn" id="binDecBtn">Load into Grid</button>
                </div>
            </div>`;
        }

        panel.innerHTML = buildHTML();

        function updateDisplay() {
            const ipStr = bits.map(o => calcDecimal(o)).join('.');
            const binStr = bits.map(o => o.join('')).join('.');
            const octets = bits.map(o => calcDecimal(o));
            document.getElementById('binIpDec').textContent = ipStr;
            document.getElementById('binIpBin').textContent = binStr;
            document.getElementById('binIpHex').textContent = octets.map(o => o.toString(16).padStart(2,'0').toUpperCase()).join('.');
            document.getElementById('binIpClass').textContent = 'Class ' + IP.getClass(octets[0]);

            // Update all bit tiles
            panel.querySelectorAll('.ip-bit-toggle').forEach(el => {
                const oi = parseInt(el.dataset.o);
                const bi = parseInt(el.dataset.b);
                const v = bits[oi][bi];
                el.className = v ? 'ip-bit on ip-bit-toggle' : 'ip-bit off ip-bit-toggle';
                el.style.cursor = 'pointer';
                el.style.userSelect = 'none';
                el.querySelector('.ip-bit-val').textContent = v;
            });

            // Update decimal inputs (skip if focused)
            panel.querySelectorAll('.ip-octet-dec').forEach(inp => {
                const oi = parseInt(inp.dataset.o);
                if (document.activeElement !== inp) inp.value = calcDecimal(bits[oi]);
            });
        }

        // Bit toggle via click delegation
        panel.addEventListener('click', e => {
            const toggle = e.target.closest('.ip-bit-toggle');
            if (toggle) {
                const oi = parseInt(toggle.dataset.o);
                const bi = parseInt(toggle.dataset.b);
                bits[oi][bi] = bits[oi][bi] ? 0 : 1;
                updateDisplay();
            }
        });

        // Decimal input -> update bits
        panel.querySelectorAll('.ip-octet-dec').forEach(inp => {
            inp.addEventListener('input', () => {
                const oi = parseInt(inp.dataset.o);
                let val = parseInt(inp.value);
                if (isNaN(val) || val < 0) val = 0;
                if (val > 255) val = 255;
                for (let i = 0; i < 8; i++) {
                    bits[oi][i] = (val & (128 >> i)) ? 1 : 0;
                }
                updateDisplay();
            });
        });

        // Control buttons
        document.getElementById('binRandom').addEventListener('click', () => {
            for (let o = 0; o < 4; o++) {
                const v = Math.floor(Math.random() * 256);
                for (let b = 0; b < 8; b++) bits[o][b] = (v & (128 >> b)) ? 1 : 0;
            }
            updateDisplay();
        });

        document.getElementById('binClear').addEventListener('click', () => {
            bits.forEach(o => o.fill(0));
            updateDisplay();
        });

        document.getElementById('binAllOn').addEventListener('click', () => {
            bits.forEach(o => o.fill(1));
            updateDisplay();
        });

        // Text converter: load IP into the grid
        document.getElementById('binDecBtn').addEventListener('click', () => {
            const val = document.getElementById('binDecInput').value.trim();
            if (!val) return;
            // Binary format?
            if (/^[01.]+$/.test(val)) {
                const parts = val.split('.');
                if (parts.length === 4 && parts.every(p => p.length === 8)) {
                    parts.forEach((p, oi) => {
                        for (let bi = 0; bi < 8; bi++) bits[oi][bi] = p[bi] === '1' ? 1 : 0;
                    });
                    updateDisplay();
                    return;
                }
            }
            // Decimal format?
            if (IP.isValid(val)) {
                val.split('.').forEach((o, oi) => {
                    const v = parseInt(o);
                    for (let bi = 0; bi < 8; bi++) bits[oi][bi] = (v & (128 >> bi)) ? 1 : 0;
                });
                updateDisplay();
            }
        });
        document.getElementById('binDecInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('binDecBtn').click();
        });
    }

    /* ── 2. CIDR Calculator ── */
    function renderCIDRCalc(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">CIDR Notation Calculator</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter a CIDR address (e.g. 192.168.1.0/24) to see full network details.</p>
                <div class="ip-input-row">
                    <input class="ip-input" id="cidrInput" placeholder="192.168.1.0/24" style="width:220px">
                    <button class="ip-btn" id="cidrBtn">Calculate</button>
                </div>
                <div id="cidrResult"></div>
            </div>
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">CIDR Reference Table</h3>
                <div style="max-height:400px;overflow-y:auto">
                <table class="ip-table">
                    <tr><th>CIDR</th><th>Subnet Mask</th><th>Wildcard</th><th>Total Addrs</th><th>Usable Hosts</th></tr>
                    ${[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32].map(p => {
                        return `<tr><td style="color:#3b82f6;font-weight:600">/${p}</td><td>${IP.maskToStr(p)}</td><td>${IP.wildcardStr(p)}</td><td>${IP.totalAddrs(p).toLocaleString()}</td><td>${IP.hostCount(p).toLocaleString()}</td></tr>`;
                    }).join('')}
                </table>
                </div>
            </div>`;
        const input = document.getElementById('cidrInput');
        const btn = document.getElementById('cidrBtn');
        function doCalc() {
            const val = input.value.trim();
            const m = val.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
            if (!m || !IP.isValid(m[1])) {
                document.getElementById('cidrResult').innerHTML = '<div class="ip-feedback wrong">Invalid CIDR. Use format: 192.168.1.0/24</div>';
                return;
            }
            const ipStr = m[1], prefix = parseInt(m[2]);
            if (prefix < 0 || prefix > 32) {
                document.getElementById('cidrResult').innerHTML = '<div class="ip-feedback wrong">Prefix must be 0-32.</div>';
                return;
            }
            showSubnetResult(document.getElementById('cidrResult'), ipStr, prefix);
        }
        btn.addEventListener('click', doCalc);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') doCalc(); });
    }

    /* ── 3. Class Identifier ── */
    function renderClassIdentifier(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">IP Address Class Identifier</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter an IP address to identify its class, default mask, and type.</p>
                <div class="ip-input-row">
                    <input class="ip-input" id="classInput" placeholder="172.16.0.1">
                    <button class="ip-btn" id="classBtn">Identify</button>
                </div>
                <div id="classResult"></div>
            </div>
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Class Range Visualizer</h3>
                <div class="ip-class-bar" style="height:50px">
                    <div class="ip-class-seg" style="flex:126;background:#3b82f6" id="classA">A<br><span style="font-size:.6rem;opacity:.8">1-126</span></div>
                    <div class="ip-class-seg" style="flex:1;background:#6b7280" title="127 = Loopback">Lo</div>
                    <div class="ip-class-seg" style="flex:64;background:#8b5cf6" id="classB">B<br><span style="font-size:.6rem;opacity:.8">128-191</span></div>
                    <div class="ip-class-seg" style="flex:32;background:#22c55e" id="classC">C<br><span style="font-size:.6rem;opacity:.8">192-223</span></div>
                    <div class="ip-class-seg" style="flex:16;background:#eab308" id="classD">D<br><span style="font-size:.6rem;opacity:.8">224-239</span></div>
                    <div class="ip-class-seg" style="flex:16;background:#ef4444" id="classE">E<br><span style="font-size:.6rem;opacity:.8">240-255</span></div>
                </div>
                <table class="ip-table" style="margin-top:1rem">
                    <tr><th>Class</th><th>Range</th><th>Default Mask</th><th>Networks</th><th>Hosts/Net</th><th>Purpose</th></tr>
                    <tr><td style="color:#3b82f6;font-weight:600">A</td><td>1.0.0.0 - 126.255.255.255</td><td>255.0.0.0</td><td>126</td><td>16,777,214</td><td>Large organizations</td></tr>
                    <tr><td style="color:#8b5cf6;font-weight:600">B</td><td>128.0.0.0 - 191.255.255.255</td><td>255.255.0.0</td><td>16,384</td><td>65,534</td><td>Medium organizations</td></tr>
                    <tr><td style="color:#22c55e;font-weight:600">C</td><td>192.0.0.0 - 223.255.255.255</td><td>255.255.255.0</td><td>2,097,152</td><td>254</td><td>Small networks</td></tr>
                    <tr><td style="color:#eab308;font-weight:600">D</td><td>224.0.0.0 - 239.255.255.255</td><td>N/A</td><td>N/A</td><td>N/A</td><td>Multicast</td></tr>
                    <tr><td style="color:#ef4444;font-weight:600">E</td><td>240.0.0.0 - 255.255.255.255</td><td>N/A</td><td>N/A</td><td>N/A</td><td>Experimental</td></tr>
                </table>
            </div>`;
        const input = document.getElementById('classInput');
        const btn = document.getElementById('classBtn');
        function doIdentify() {
            const val = input.value.trim();
            if (!IP.isValid(val)) { document.getElementById('classResult').innerHTML = '<div class="ip-feedback wrong">Invalid IP address.</div>'; return; }
            const fo = Number(val.split('.')[0]);
            const cls = IP.getClass(fo);
            const priv = IP.isPrivate(val);
            const colors = { A: '#3b82f6', B: '#8b5cf6', C: '#22c55e', D: '#eab308', E: '#ef4444', Loopback: '#6b7280' };
            const masks = { A: '255.0.0.0 (/8)', B: '255.255.0.0 (/16)', C: '255.255.255.0 (/24)', D: 'N/A', E: 'N/A', Loopback: 'N/A' };
            document.querySelectorAll('.ip-class-seg').forEach(s => s.classList.remove('highlight'));
            const segId = 'class' + cls;
            const seg = document.getElementById(segId);
            if (seg) seg.classList.add('highlight');
            document.getElementById('classResult').innerHTML = `
                <div class="ip-result-grid">
                    <div class="ip-result-card"><div class="ip-result-label">Address</div><div class="ip-result-value">${val}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Class</div><div class="ip-result-value" style="color:${colors[cls] || '#fff'}">Class ${cls}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Default Mask</div><div class="ip-result-value">${masks[cls]}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Type</div><div class="ip-result-value" style="color:${priv.private ? '#eab308' : '#22c55e'}">${priv.range}</div></div>
                </div>`;
        }
        btn.addEventListener('click', doIdentify);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') doIdentify(); });
    }

    /* ── 4. IPv6 Tool ── */
    function renderIPv6Tool(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">IPv6 Address Abbreviator</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter a full or abbreviated IPv6 address to see its expanded and compressed forms.</p>
                <div class="ip-input-row">
                    <input class="ip-input" id="ipv6Input" placeholder="2001:0db8:0000:0000:0000:0000:0000:0001" style="width:400px">
                    <button class="ip-btn" id="ipv6Btn">Process</button>
                </div>
                <div id="ipv6Result"></div>
            </div>
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Common IPv6 Addresses</h3>
                <table class="ip-table">
                    <tr><th>Address</th><th>Full Form</th><th>Purpose</th></tr>
                    <tr><td style="color:#3b82f6;font-weight:600">::1</td><td>0000:0000:0000:0000:0000:0000:0000:0001</td><td>Loopback</td></tr>
                    <tr><td style="color:#3b82f6;font-weight:600">::</td><td>0000:0000:0000:0000:0000:0000:0000:0000</td><td>Unspecified</td></tr>
                    <tr><td style="color:#3b82f6;font-weight:600">fe80::</td><td>fe80:0000:0000:0000:...</td><td>Link-Local</td></tr>
                    <tr><td style="color:#3b82f6;font-weight:600">ff02::1</td><td>ff02:0000:0000:0000:0000:0000:0000:0001</td><td>All nodes multicast</td></tr>
                    <tr><td style="color:#3b82f6;font-weight:600">ff02::2</td><td>ff02:0000:0000:0000:0000:0000:0000:0002</td><td>All routers multicast</td></tr>
                    <tr><td style="color:#3b82f6;font-weight:600">2001:db8::</td><td>2001:0db8:0000:...</td><td>Documentation (RFC 3849)</td></tr>
                </table>
            </div>`;
        const input = document.getElementById('ipv6Input');
        const btn = document.getElementById('ipv6Btn');
        function expandIPv6(addr) {
            addr = addr.trim().toLowerCase();
            if (addr.indexOf('::') !== -1) {
                const halves = addr.split('::');
                const left = halves[0] ? halves[0].split(':') : [];
                const right = halves[1] ? halves[1].split(':') : [];
                const missing = 8 - left.length - right.length;
                const mid = Array(missing).fill('0000');
                const groups = [...left, ...mid, ...right];
                return groups.map(g => g.padStart(4, '0')).join(':');
            }
            const groups = addr.split(':');
            if (groups.length !== 8) return null;
            return groups.map(g => g.padStart(4, '0')).join(':');
        }
        function compressIPv6(full) {
            const groups = full.split(':').map(g => g.replace(/^0+/, '') || '0');
            let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
            for (let i = 0; i < 8; i++) {
                if (groups[i] === '0') {
                    if (curStart === -1) curStart = i;
                    curLen++;
                    if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
                } else { curStart = -1; curLen = 0; }
            }
            if (bestLen >= 2) {
                const before = groups.slice(0, bestStart).join(':');
                const after = groups.slice(bestStart + bestLen).join(':');
                return (before || '') + '::' + (after || '');
            }
            return groups.join(':');
        }
        function doProcess() {
            const val = input.value.trim();
            if (!val) return;
            const full = expandIPv6(val);
            if (!full || full.split(':').length !== 8) {
                document.getElementById('ipv6Result').innerHTML = '<div class="ip-feedback wrong">Invalid IPv6 address format.</div>';
                return;
            }
            const compressed = compressIPv6(full);
            const groups = full.split(':');
            const prefix = groups[0];
            let type = 'Unknown';
            if (full === '0000:0000:0000:0000:0000:0000:0000:0001') type = 'Loopback (::1)';
            else if (full === '0000:0000:0000:0000:0000:0000:0000:0000') type = 'Unspecified (::)';
            else if (prefix.startsWith('fe8') || prefix.startsWith('fe9') || prefix.startsWith('fea') || prefix.startsWith('feb')) type = 'Link-Local';
            else if (prefix.startsWith('fc') || prefix.startsWith('fd')) type = 'Unique Local';
            else if (prefix.startsWith('ff')) type = 'Multicast';
            else if (parseInt(prefix, 16) >= 0x2000 && parseInt(prefix, 16) <= 0x3fff) type = 'Global Unicast';
            const totalBits = groups.map(g => parseInt(g, 16).toString(2).padStart(16, '0')).join('');
            document.getElementById('ipv6Result').innerHTML = `
                <div class="ip-result-grid" style="margin-top:1rem">
                    <div class="ip-result-card"><div class="ip-result-label">Full Form</div><div class="ip-result-value" style="font-size:.82rem">${full}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Compressed</div><div class="ip-result-value">${compressed}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Address Type</div><div class="ip-result-value">${type}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Total Bits</div><div class="ip-result-value">${totalBits.length}</div></div>
                </div>
                <div style="margin-top:1rem;font-family:Consolas,monospace;font-size:.78rem;color:#64748b;word-break:break-all;background:rgba(255,255,255,.02);padding:.75rem;border-radius:6px">
                    <div style="color:#94a3b8;margin-bottom:.25rem">Binary:</div>${totalBits.match(/.{1,16}/g).join(' ')}
                </div>`;
        }
        btn.addEventListener('click', doProcess);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') doProcess(); });
    }

    /* ── 5. NAT Simulator ── */
    function renderNATSim(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">NAT/PAT Translation Simulator</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Simulate how PAT translates multiple internal addresses through one public IP.</p>
                <div class="ip-input-row">
                    <div>
                        <label style="font-size:.75rem;color:#64748b;display:block;margin-bottom:4px">Public IP (Router WAN)</label>
                        <input class="ip-input" id="natPublicIP" value="203.0.113.1" style="width:160px">
                    </div>
                </div>
                <div style="margin:1rem 0">
                    <label style="font-size:.75rem;color:#64748b;display:block;margin-bottom:4px">Internal Hosts (one per line: IP:port destination:port)</label>
                    <textarea class="ip-input" id="natHosts" style="width:100%;height:120px;resize:vertical;font-family:Consolas,monospace" placeholder="192.168.1.10:52431 93.184.216.34:443&#10;192.168.1.20:48812 93.184.216.34:443&#10;192.168.1.10:52432 142.250.80.46:80&#10;192.168.1.30:60100 151.101.1.69:443">192.168.1.10:52431 93.184.216.34:443
192.168.1.20:48812 93.184.216.34:443
192.168.1.10:52432 142.250.80.46:80
192.168.1.30:60100 151.101.1.69:443</textarea>
                </div>
                <button class="ip-btn" id="natBtn">Show NAT Table</button>
                <div id="natResult"></div>
            </div>`;
        document.getElementById('natBtn').addEventListener('click', () => {
            const pubIP = document.getElementById('natPublicIP').value.trim();
            const lines = document.getElementById('natHosts').value.trim().split('\n').filter(l => l.trim());
            let port = 40001;
            const rows = lines.map(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length < 2) return null;
                const [srcFull, dstFull] = parts;
                const [srcIP, srcPort] = srcFull.split(':');
                const [dstIP, dstPort] = dstFull.split(':');
                const transPort = port++;
                return { srcIP, srcPort, dstIP, dstPort, transIP: pubIP, transPort };
            }).filter(Boolean);
            document.getElementById('natResult').innerHTML = `
                <div style="margin-top:1rem">
                    <div style="color:#64748b;font-size:.75rem;margin-bottom:.5rem">NAT Translation Table (PAT)</div>
                    <div class="ip-nat-table">
                        <div class="ip-nat-row ip-nat-header">
                            <div>Inside Local</div><div></div><div>Inside Global</div><div>Destination</div>
                        </div>
                        ${rows.map(r => `
                            <div class="ip-nat-row">
                                <div style="color:#eab308;font-family:Consolas,monospace;font-size:.8rem">${r.srcIP}:${r.srcPort}</div>
                                <div class="ip-nat-arrow">&rarr;</div>
                                <div style="color:#22c55e;font-family:Consolas,monospace;font-size:.8rem">${r.transIP}:${r.transPort}</div>
                                <div style="color:#94a3b8;font-family:Consolas,monospace;font-size:.8rem">${r.dstIP}:${r.dstPort}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top:.75rem;padding:.75rem 1rem;background:rgba(59,130,246,.08);border-left:3px solid #3b82f666;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.82rem;line-height:1.6">
                        All ${rows.length} internal sessions share the single public IP <strong style="color:#22c55e">${pubIP}</strong>. The router uses unique translated port numbers to track which internal host each reply belongs to.
                    </div>
                </div>`;
        });
    }

    /* ── 6. Private/Public Checker ── */
    function renderPrivatePublicChecker(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Private vs Public IP Checker</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter an IP address to determine if it is private (RFC 1918) or public.</p>
                <div class="ip-input-row">
                    <input class="ip-input" id="privInput" placeholder="e.g. 10.0.0.1">
                    <button class="ip-btn" id="privBtn">Check</button>
                    <button class="ip-btn ip-btn-sm" id="privRandom">Random</button>
                </div>
                <div id="privResult"></div>
            </div>
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Quick-Fire Drill</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Is this address private or public? Test your speed!</p>
                <div id="privDrill"></div>
            </div>`;
        const input = document.getElementById('privInput');
        function doCheck() {
            const val = input.value.trim();
            if (!IP.isValid(val)) { document.getElementById('privResult').innerHTML = '<div class="ip-feedback wrong">Invalid IP address.</div>'; return; }
            const info = IP.isPrivate(val);
            const cls = IP.getClass(Number(val.split('.')[0]));
            document.getElementById('privResult').innerHTML = `
                <div class="ip-result-grid">
                    <div class="ip-result-card"><div class="ip-result-label">Address</div><div class="ip-result-value">${val}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Classification</div><div class="ip-result-value" style="color:${info.private ? '#eab308' : '#22c55e'}">${info.private ? 'PRIVATE' : 'PUBLIC'}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Range</div><div class="ip-result-value">${info.range}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Class</div><div class="ip-result-value">Class ${cls}</div></div>
                </div>`;
        }
        document.getElementById('privBtn').addEventListener('click', doCheck);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') doCheck(); });
        document.getElementById('privRandom').addEventListener('click', () => {
            const ips = ['10.0.5.1','172.16.0.1','192.168.1.100','8.8.8.8','1.1.1.1','172.32.0.1','192.169.1.1','10.255.255.254','172.20.10.5','11.0.0.1','100.64.0.1','169.254.1.1','192.168.0.1','203.0.113.5'];
            input.value = ips[Math.floor(Math.random() * ips.length)];
            doCheck();
        });
        // Drill
        let drillScore = 0, drillTotal = 0;
        function nextDrill() {
            const a = Math.floor(Math.random() * 223) + 1;
            const b = Math.floor(Math.random() * 256);
            const c = Math.floor(Math.random() * 256);
            const d = Math.floor(Math.random() * 256);
            const ip = `${a}.${b}.${c}.${d}`;
            const correct = IP.isPrivateCheck(ip) ? 'private' : 'public';
            document.getElementById('privDrill').innerHTML = `
                <div class="ip-streak">Score: <strong>${drillScore}/${drillTotal}</strong></div>
                <div class="ip-drill-problem">
                    <div class="ip-drill-q">${ip}</div>
                    <div class="ip-drill-input">
                        <button class="ip-btn" data-answer="private" onclick="this.blur()">Private</button>
                        <button class="ip-btn" data-answer="public" onclick="this.blur()">Public</button>
                    </div>
                    <div id="drillFeedback"></div>
                </div>`;
            document.querySelectorAll('#privDrill [data-answer]').forEach(btn => {
                btn.addEventListener('click', () => {
                    drillTotal++;
                    const fb = document.getElementById('drillFeedback');
                    if (btn.dataset.answer === correct) {
                        drillScore++;
                        fb.innerHTML = `<div class="ip-feedback correct">Correct! ${ip} is ${correct}. ${IP.isPrivate(ip).range}</div>`;
                    } else {
                        fb.innerHTML = `<div class="ip-feedback wrong">Wrong. ${ip} is ${correct}. ${IP.isPrivate(ip).range}</div>`;
                    }
                    setTimeout(nextDrill, 1500);
                });
            });
        }
        nextDrill();
    }

    /* ── 7. Subnet Calculator (full-featured) ── */
    function renderSubnetCalc(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Subnet Calculator</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter an IP address with CIDR prefix or subnet mask.</p>
                <div class="ip-input-row">
                    <input class="ip-input" id="subCalcIP" placeholder="192.168.1.100" style="width:180px">
                    <span style="color:#64748b">/</span>
                    <input class="ip-input" id="subCalcMask" placeholder="24 or 255.255.255.0" style="width:200px">
                    <button class="ip-btn" id="subCalcBtn">Calculate</button>
                </div>
                <div id="subCalcResult"></div>
            </div>`;
        document.getElementById('subCalcBtn').addEventListener('click', () => {
            const ipStr = document.getElementById('subCalcIP').value.trim();
            const maskVal = document.getElementById('subCalcMask').value.trim();
            if (!IP.isValid(ipStr)) { document.getElementById('subCalcResult').innerHTML = '<div class="ip-feedback wrong">Invalid IP address.</div>'; return; }
            let prefix;
            if (/^\d+$/.test(maskVal)) {
                prefix = parseInt(maskVal);
            } else if (IP.isValid(maskVal)) {
                prefix = IP.prefixFromMask(maskVal);
                if (prefix < 0) { document.getElementById('subCalcResult').innerHTML = '<div class="ip-feedback wrong">Invalid subnet mask (bits not contiguous).</div>'; return; }
            } else {
                document.getElementById('subCalcResult').innerHTML = '<div class="ip-feedback wrong">Enter a prefix length (e.g. 24) or subnet mask (e.g. 255.255.255.0).</div>';
                return;
            }
            if (prefix < 0 || prefix > 32) { document.getElementById('subCalcResult').innerHTML = '<div class="ip-feedback wrong">Prefix must be 0-32.</div>'; return; }
            showSubnetResult(document.getElementById('subCalcResult'), ipStr, prefix);
        });
        document.getElementById('subCalcIP').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('subCalcBtn').click(); });
        document.getElementById('subCalcMask').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('subCalcBtn').click(); });
    }

    /* ── Shared subnet result display ── */
    function showSubnetResult(el, ipStr, prefix) {
        const ipInt = IP.toInt(ipStr);
        const net = IP.networkAddr(ipInt, prefix);
        const bcast = IP.broadcastAddr(ipInt, prefix);
        const netStr = IP.fromInt(net);
        const bcastStr = IP.fromInt(bcast);
        const firstHost = prefix >= 31 ? netStr : IP.fromInt(net + 1);
        const lastHost = prefix >= 31 ? bcastStr : IP.fromInt(bcast - 1);
        const maskStr = IP.maskToStr(prefix);
        const wildcard = IP.wildcardStr(prefix);
        const total = IP.totalAddrs(prefix);
        const usable = IP.hostCount(prefix);
        const cls = IP.getClass(Number(ipStr.split('.')[0]));
        const priv = IP.isPrivate(ipStr);
        // Binary breakdown
        const ipBin = IP.toBinFull(ipStr);
        const maskBin = IP.toBinFull(maskStr);
        el.innerHTML = `
            <div class="ip-result-grid" style="margin-top:1rem">
                <div class="ip-result-card"><div class="ip-result-label">Network Address</div><div class="ip-result-value">${netStr}</div><div class="ip-result-sub">/${prefix}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">Broadcast Address</div><div class="ip-result-value">${bcastStr}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">Subnet Mask</div><div class="ip-result-value">${maskStr}</div><div class="ip-result-sub">/${prefix}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">Wildcard Mask</div><div class="ip-result-value">${wildcard}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">First Usable Host</div><div class="ip-result-value">${firstHost}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">Last Usable Host</div><div class="ip-result-value">${lastHost}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">Total Addresses</div><div class="ip-result-value">${total.toLocaleString()}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">Usable Hosts</div><div class="ip-result-value">${usable.toLocaleString()}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">IP Class</div><div class="ip-result-value">Class ${cls}</div></div>
                <div class="ip-result-card"><div class="ip-result-label">Type</div><div class="ip-result-value" style="color:${priv.private ? '#eab308' : '#22c55e'}">${priv.range}</div></div>
            </div>
            <div style="margin-top:1rem;font-family:Consolas,monospace;font-size:.78rem;color:#64748b;background:rgba(255,255,255,.02);padding:.75rem;border-radius:6px;line-height:1.8">
                <div><span style="color:#94a3b8;display:inline-block;width:90px">IP Binary:</span> ${ipBin}</div>
                <div><span style="color:#94a3b8;display:inline-block;width:90px">Mask Binary:</span> ${maskBin}</div>
                <div><span style="color:#94a3b8;display:inline-block;width:90px">Network:</span> ${IP.toBinFull(netStr)}</div>
            </div>`;
    }

    /* ── 8. Mask Explorer ── */
    function renderMaskExplorer(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Subnet Mask Explorer</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Drag the slider to explore different prefix lengths and their corresponding masks.</p>
                <div style="text-align:center;margin:1rem 0">
                    <input type="range" min="0" max="32" value="24" id="maskSlider" style="width:100%;max-width:500px;accent-color:#3b82f6">
                    <div style="margin-top:.5rem;font-size:1.2rem;font-weight:700;color:#fff" id="maskSliderVal">/ 24</div>
                </div>
                <div id="maskSliderResult"></div>
            </div>
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Valid Mask Values Reference</h3>
                <table class="ip-table">
                    <tr><th>Decimal</th><th>Binary</th><th>Bits</th></tr>
                    ${[0,128,192,224,240,248,252,254,255].map(v => `<tr><td style="font-weight:600;color:#3b82f6">${v}</td><td>${v.toString(2).padStart(8,'0')}</td><td>${v.toString(2).split('').filter(b=>b==='1').length}</td></tr>`).join('')}
                </table>
            </div>`;
        const slider = document.getElementById('maskSlider');
        function updateSlider() {
            const p = parseInt(slider.value);
            document.getElementById('maskSliderVal').textContent = '/ ' + p;
            const maskStr = IP.maskToStr(p);
            const wildcard = IP.wildcardStr(p);
            const maskBin = IP.toBinFull(maskStr);
            const netBits = maskBin.replace(/\./g, '').split('').map((b, i) => {
                const color = b === '1' ? '#3b82f6' : '#ef4444';
                const sep = (i > 0 && i % 8 === 0) ? '<span style="color:#4b5563">.</span>' : '';
                return sep + `<span style="color:${color}">${b}</span>`;
            }).join('');
            document.getElementById('maskSliderResult').innerHTML = `
                <div class="ip-result-grid">
                    <div class="ip-result-card"><div class="ip-result-label">Subnet Mask</div><div class="ip-result-value">${maskStr}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Wildcard Mask</div><div class="ip-result-value">${wildcard}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Total Addresses</div><div class="ip-result-value">${IP.totalAddrs(p).toLocaleString()}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Usable Hosts</div><div class="ip-result-value">${IP.hostCount(p).toLocaleString()}</div></div>
                </div>
                <div style="margin-top:.75rem;font-family:Consolas,monospace;font-size:.9rem;text-align:center;letter-spacing:1px">${netBits}</div>
                <div style="text-align:center;margin-top:.5rem;font-size:.75rem"><span style="color:#3b82f6">Blue = Network bits (${p})</span> &nbsp; <span style="color:#ef4444">Red = Host bits (${32-p})</span></div>`;
        }
        slider.addEventListener('input', updateSlider);
        updateSlider();
    }

    /* ── 9. Subnetting Drill ── */
    function renderSubnettingDrill(panel) {
        let streak = 0, total = 0, correct = 0;
        function genProblem() {
            const types = ['network', 'broadcast', 'hosts', 'mask'];
            const type = types[Math.floor(Math.random() * types.length)];
            const prefix = Math.floor(Math.random() * 9) + 24; // /24 to /32 range for simplicity
            const effectivePrefix = Math.min(prefix, 30);
            const a = [10, 172, 192][Math.floor(Math.random() * 3)];
            const b = a === 172 ? Math.floor(Math.random() * 16) + 16 : a === 192 ? 168 : Math.floor(Math.random() * 256);
            const c = Math.floor(Math.random() * 256);
            const d = Math.floor(Math.random() * 254) + 1;
            const ipStr = `${a}.${b}.${c}.${d}`;
            const ipInt = IP.toInt(ipStr);
            let question, answer;
            switch (type) {
                case 'network':
                    question = `What is the network address for ${ipStr}/${effectivePrefix}?`;
                    answer = IP.fromInt(IP.networkAddr(ipInt, effectivePrefix));
                    break;
                case 'broadcast':
                    question = `What is the broadcast address for ${ipStr}/${effectivePrefix}?`;
                    answer = IP.fromInt(IP.broadcastAddr(ipInt, effectivePrefix));
                    break;
                case 'hosts':
                    question = `How many usable hosts in a /${effectivePrefix} subnet?`;
                    answer = String(IP.hostCount(effectivePrefix));
                    break;
                case 'mask':
                    question = `What is the subnet mask for /${effectivePrefix}?`;
                    answer = IP.maskToStr(effectivePrefix);
                    break;
            }
            return { question, answer, type, ip: ipStr, prefix: effectivePrefix };
        }
        let currentProblem = genProblem();
        function renderDrill() {
            panel.innerHTML = `
                <div class="ip-practice-area">
                    <h3 class="ip-learn-title">Subnetting Speed Drill</h3>
                    <div class="ip-streak">Streak: <strong>${streak}</strong> &nbsp;|&nbsp; Score: <strong>${correct}/${total}</strong></div>
                    <div class="ip-drill-problem">
                        <div class="ip-drill-q">${currentProblem.question}</div>
                        <div class="ip-drill-input">
                            <input class="ip-input" id="drillAnswer" placeholder="Your answer" autofocus>
                            <button class="ip-btn" id="drillCheck">Check</button>
                            <button class="ip-btn ip-btn-sm" id="drillSkip">Skip</button>
                        </div>
                        <div id="drillFB"></div>
                    </div>
                </div>`;
            const ansInput = document.getElementById('drillAnswer');
            document.getElementById('drillCheck').addEventListener('click', () => {
                const userAns = ansInput.value.trim();
                total++;
                const fb = document.getElementById('drillFB');
                if (userAns === currentProblem.answer) {
                    correct++; streak++;
                    fb.innerHTML = `<div class="ip-feedback correct">Correct! ${currentProblem.answer}</div>`;
                } else {
                    streak = 0;
                    fb.innerHTML = `<div class="ip-feedback wrong">Incorrect. The answer is: ${currentProblem.answer}</div>`;
                }
                setTimeout(() => { currentProblem = genProblem(); renderDrill(); }, 1800);
            });
            document.getElementById('drillSkip').addEventListener('click', () => {
                document.getElementById('drillFB').innerHTML = `<div class="ip-feedback wrong">Skipped. Answer: ${currentProblem.answer}</div>`;
                streak = 0;
                setTimeout(() => { currentProblem = genProblem(); renderDrill(); }, 1500);
            });
            ansInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('drillCheck').click(); });
            setTimeout(() => ansInput.focus(), 50);
        }
        renderDrill();
    }

    /* ── 10. Supernet Calculator ── */
    function renderSupernetCalc(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Route Aggregation Calculator</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter a list of CIDR networks (one per line) to find the summary route.</p>
                <textarea class="ip-input" id="supernetInput" style="width:100%;height:120px;resize:vertical;font-family:Consolas,monospace" placeholder="192.168.0.0/24&#10;192.168.1.0/24&#10;192.168.2.0/24&#10;192.168.3.0/24">192.168.0.0/24
192.168.1.0/24
192.168.2.0/24
192.168.3.0/24</textarea>
                <div style="margin-top:.5rem"><button class="ip-btn" id="supernetBtn">Calculate Summary</button></div>
                <div id="supernetResult"></div>
            </div>`;
        document.getElementById('supernetBtn').addEventListener('click', () => {
            const lines = document.getElementById('supernetInput').value.trim().split('\n').filter(l => l.trim());
            const networks = [];
            for (const line of lines) {
                const m = line.trim().match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
                if (!m || !IP.isValid(m[1])) {
                    document.getElementById('supernetResult').innerHTML = `<div class="ip-feedback wrong">Invalid entry: ${line.trim()}</div>`;
                    return;
                }
                networks.push({ ip: m[1], prefix: parseInt(m[2]) });
            }
            if (networks.length < 2) {
                document.getElementById('supernetResult').innerHTML = '<div class="ip-feedback wrong">Enter at least 2 networks.</div>';
                return;
            }
            // Find common prefix
            const ints = networks.map(n => IP.networkAddr(IP.toInt(n.ip), n.prefix));
            let commonBits = 32;
            for (let i = 31; i >= 0; i--) {
                const bit = (ints[0] >>> i) & 1;
                if (!ints.every(n => ((n >>> i) & 1) === bit)) {
                    commonBits = 31 - i;
                    break;
                }
            }
            const summaryNet = IP.fromInt(IP.networkAddr(ints[0], commonBits));
            const summaryBcast = IP.fromInt(IP.broadcastAddr(ints[0], commonBits));
            document.getElementById('supernetResult').innerHTML = `
                <div class="ip-result-grid" style="margin-top:1rem">
                    <div class="ip-result-card"><div class="ip-result-label">Summary Route</div><div class="ip-result-value" style="color:#22c55e">${summaryNet}/${commonBits}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Summary Mask</div><div class="ip-result-value">${IP.maskToStr(commonBits)}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Range</div><div class="ip-result-value" style="font-size:.85rem">${summaryNet} - ${summaryBcast}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Total Addresses</div><div class="ip-result-value">${IP.totalAddrs(commonBits).toLocaleString()}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Networks Summarized</div><div class="ip-result-value">${networks.length}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Individual Routes Replaced</div><div class="ip-result-value">${networks.length} &rarr; 1</div></div>
                </div>
                <div style="margin-top:1rem">
                    <div style="color:#64748b;font-size:.75rem;margin-bottom:.5rem">Component Networks</div>
                    <table class="ip-table">
                        <tr><th>Network</th><th>Binary (third octet)</th></tr>
                        ${networks.map(n => {
                            const third = Number(n.ip.split('.')[2]);
                            return `<tr><td style="color:#94a3b8">${n.ip}/${n.prefix}</td><td>${IP.toBin(third)}</td></tr>`;
                        }).join('')}
                        <tr style="border-top:2px solid rgba(59,130,246,.3)"><td style="color:#22c55e;font-weight:700">${summaryNet}/${commonBits}</td><td style="color:#22c55e;font-weight:700">Summary</td></tr>
                    </table>
                </div>`;
        });
    }

    /* ── 11. VLSM Designer ── */
    function renderVLSMDesigner(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">VLSM Subnet Designer</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter a network and define subnets with their required host counts. The tool allocates optimally (largest first).</p>
                <div class="ip-input-row">
                    <div>
                        <label style="font-size:.75rem;color:#64748b;display:block;margin-bottom:4px">Parent Network</label>
                        <input class="ip-input" id="vlsmNetwork" value="192.168.1.0/24" style="width:200px">
                    </div>
                </div>
                <div style="margin:1rem 0">
                    <label style="font-size:.75rem;color:#64748b;display:block;margin-bottom:4px">Subnet Requirements (one per line: name hosts_needed)</label>
                    <textarea class="ip-input" id="vlsmReqs" style="width:100%;height:120px;resize:vertical;font-family:Consolas,monospace" placeholder="LAN_A 50&#10;LAN_B 25&#10;LAN_C 10&#10;WAN_1 2&#10;WAN_2 2">LAN_A 50
LAN_B 25
LAN_C 10
WAN_1 2
WAN_2 2</textarea>
                </div>
                <button class="ip-btn" id="vlsmBtn">Design VLSM</button>
                <div id="vlsmResult"></div>
            </div>`;
        document.getElementById('vlsmBtn').addEventListener('click', () => {
            const netInput = document.getElementById('vlsmNetwork').value.trim();
            const m = netInput.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
            if (!m || !IP.isValid(m[1])) {
                document.getElementById('vlsmResult').innerHTML = '<div class="ip-feedback wrong">Invalid network. Use format: 192.168.1.0/24</div>';
                return;
            }
            const parentNet = IP.networkAddr(IP.toInt(m[1]), parseInt(m[2]));
            const parentPrefix = parseInt(m[2]);
            const parentSize = IP.totalAddrs(parentPrefix);
            const lines = document.getElementById('vlsmReqs').value.trim().split('\n').filter(l => l.trim());
            const reqs = lines.map(l => {
                const parts = l.trim().split(/\s+/);
                return { name: parts[0] || 'Subnet', hosts: parseInt(parts[1]) || 2 };
            }).sort((a, b) => b.hosts - a.hosts); // Sort largest first
            // Allocate
            let nextAddr = parentNet;
            const allocations = [];
            let totalUsed = 0;
            for (const req of reqs) {
                // Find smallest prefix that fits
                let hostBits = 1;
                while (Math.pow(2, hostBits) - 2 < req.hosts && hostBits < 32) hostBits++;
                const prefix = 32 - hostBits;
                const blockSize = Math.pow(2, hostBits);
                // Align to block size
                if (nextAddr % blockSize !== 0) {
                    nextAddr = Math.ceil(nextAddr / blockSize) * blockSize;
                }
                if (nextAddr + blockSize > parentNet + parentSize) {
                    document.getElementById('vlsmResult').innerHTML = `<div class="ip-feedback wrong">Not enough address space! Cannot fit ${req.name} (${req.hosts} hosts).</div>`;
                    return;
                }
                allocations.push({
                    name: req.name,
                    needed: req.hosts,
                    prefix: prefix,
                    network: IP.fromInt(nextAddr >>> 0),
                    broadcast: IP.fromInt((nextAddr + blockSize - 1) >>> 0),
                    firstHost: IP.fromInt((nextAddr + 1) >>> 0),
                    lastHost: IP.fromInt((nextAddr + blockSize - 2) >>> 0),
                    mask: IP.maskToStr(prefix),
                    usable: Math.pow(2, hostBits) - 2,
                    waste: Math.pow(2, hostBits) - 2 - req.hosts,
                    size: blockSize
                });
                nextAddr += blockSize;
                totalUsed += blockSize;
            }
            const remaining = parentSize - totalUsed;
            document.getElementById('vlsmResult').innerHTML = `
                <div style="margin-top:1rem">
                    <div class="ip-result-grid">
                        <div class="ip-result-card"><div class="ip-result-label">Parent Network</div><div class="ip-result-value">${IP.fromInt(parentNet)}/${parentPrefix}</div></div>
                        <div class="ip-result-card"><div class="ip-result-label">Total Available</div><div class="ip-result-value">${parentSize}</div></div>
                        <div class="ip-result-card"><div class="ip-result-label">Addresses Used</div><div class="ip-result-value">${totalUsed}</div></div>
                        <div class="ip-result-card"><div class="ip-result-label">Remaining</div><div class="ip-result-value" style="color:${remaining > 0 ? '#22c55e' : '#ef4444'}">${remaining}</div></div>
                    </div>
                    <table class="ip-table" style="margin-top:1rem">
                        <tr><th>Subnet</th><th>Needed</th><th>Network</th><th>Mask</th><th>Range</th><th>Usable</th><th>Waste</th></tr>
                        ${allocations.map(a => `
                            <tr>
                                <td style="color:#3b82f6;font-weight:600">${a.name}</td>
                                <td>${a.needed}</td>
                                <td>${a.network}/${a.prefix}</td>
                                <td>${a.mask}</td>
                                <td style="font-size:.75rem">${a.firstHost} - ${a.lastHost}</td>
                                <td>${a.usable}</td>
                                <td style="color:${a.waste > 0 ? '#eab308' : '#22c55e'}">${a.waste}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <div style="margin-top:.75rem;height:24px;background:rgba(255,255,255,.04);border-radius:6px;overflow:hidden;display:flex">
                        ${allocations.map((a, i) => {
                            const pct = (a.size / parentSize * 100);
                            const colors = ['#3b82f6','#8b5cf6','#22c55e','#eab308','#ef4444','#ec4899','#f97316','#14b8a6'];
                            return `<div style="width:${pct}%;background:${colors[i % colors.length]}44;border-right:1px solid #0a0a0f;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#e2e8f0;overflow:hidden" title="${a.name}: ${a.network}/${a.prefix}">${pct > 8 ? a.name : ''}</div>`;
                        }).join('')}
                        ${remaining > 0 ? `<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#4b5563">Free</div>` : ''}
                    </div>
                </div>`;
        });
    }

    /* ── 12. Wildcard Calculator ── */
    function renderWildcardCalc(panel) {
        panel.innerHTML = `
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Wildcard Mask Calculator</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Enter a subnet mask or CIDR prefix to calculate the wildcard mask.</p>
                <div class="ip-input-row">
                    <input class="ip-input" id="wildInput" placeholder="255.255.255.0 or /24" style="width:220px">
                    <button class="ip-btn" id="wildBtn">Calculate</button>
                </div>
                <div id="wildResult"></div>
            </div>
            <div class="ip-practice-area">
                <h3 class="ip-learn-title">Common Wildcard Masks</h3>
                <table class="ip-table">
                    <tr><th>CIDR</th><th>Subnet Mask</th><th>Wildcard Mask</th><th>Matches</th></tr>
                    ${[{p:32,m:'Host'},{p:30,m:'Point-to-point'},{p:28,m:'14 hosts'},{p:27,m:'30 hosts'},{p:26,m:'62 hosts'},{p:25,m:'126 hosts'},{p:24,m:'Class C'},{p:16,m:'Class B'},{p:8,m:'Class A'},{p:0,m:'Any'}].map(r =>
                        `<tr><td style="color:#3b82f6;font-weight:600">/${r.p}</td><td>${IP.maskToStr(r.p)}</td><td style="color:#22c55e">${IP.wildcardStr(r.p)}</td><td>${r.m}</td></tr>`
                    ).join('')}
                </table>
            </div>`;
        document.getElementById('wildBtn').addEventListener('click', () => {
            const val = document.getElementById('wildInput').value.trim();
            let prefix;
            if (val.startsWith('/')) {
                prefix = parseInt(val.substring(1));
            } else if (/^\d+$/.test(val)) {
                prefix = parseInt(val);
            } else if (IP.isValid(val)) {
                prefix = IP.prefixFromMask(val);
                if (prefix < 0) { document.getElementById('wildResult').innerHTML = '<div class="ip-feedback wrong">Invalid subnet mask.</div>'; return; }
            } else {
                document.getElementById('wildResult').innerHTML = '<div class="ip-feedback wrong">Enter a mask (255.255.255.0) or prefix (/24 or 24).</div>';
                return;
            }
            if (prefix < 0 || prefix > 32) { document.getElementById('wildResult').innerHTML = '<div class="ip-feedback wrong">Invalid prefix length.</div>'; return; }
            const maskStr = IP.maskToStr(prefix);
            const wildStr = IP.wildcardStr(prefix);
            const maskBin = IP.toBinFull(maskStr);
            const wildBin = IP.toBinFull(wildStr);
            document.getElementById('wildResult').innerHTML = `
                <div class="ip-result-grid" style="margin-top:1rem">
                    <div class="ip-result-card"><div class="ip-result-label">Subnet Mask</div><div class="ip-result-value">${maskStr}</div><div class="ip-result-sub">/${prefix}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Wildcard Mask</div><div class="ip-result-value" style="color:#22c55e">${wildStr}</div></div>
                    <div class="ip-result-card"><div class="ip-result-label">Addresses Matched</div><div class="ip-result-value">${IP.totalAddrs(prefix).toLocaleString()}</div></div>
                </div>
                <div style="margin-top:1rem;font-family:Consolas,monospace;font-size:.82rem;color:#64748b;background:rgba(255,255,255,.02);padding:.75rem;border-radius:6px;line-height:2">
                    <div>Subnet: &nbsp;&nbsp;<span style="color:#3b82f6">${maskBin}</span> <span style="color:#94a3b8">(${maskStr})</span></div>
                    <div>Wildcard: <span style="color:#22c55e">${wildBin}</span> <span style="color:#94a3b8">(${wildStr})</span></div>
                    <div style="margin-top:.5rem;color:#94a3b8;font-size:.78rem">Formula: 255.255.255.255 - ${maskStr} = ${wildStr}</div>
                </div>`;
        });
        document.getElementById('wildInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('wildBtn').click(); });
    }

    /* ══════════════════════════════════════════════════════════════
       QUIZ TAB
       ══════════════════════════════════════════════════════════════ */
    function renderQuiz() {
        const panel = document.getElementById('panel-quiz');
        const state = getState();
        const answers = state.answers || {};
        const total = topic.quiz.length;
        let correctCount = 0;
        Object.entries(answers).forEach(([qi, ai]) => {
            if (topic.quiz[qi] && topic.quiz[qi].correct === ai) correctCount++;
        });
        const answeredCount = Object.keys(answers).length;
        const pct = total ? Math.round(correctCount / total * 100) : 0;

        panel.innerHTML = `
            <div class="ip-score-bar">
                <div class="ip-score-num">${answeredCount > 0 ? pct + '%' : '---'}</div>
                <div class="ip-score-label">${answeredCount} of ${total} answered${answeredCount > 0 ? ' | ' + correctCount + ' correct' : ''}</div>
                <div class="ip-score-fill-wrap"><div class="ip-score-fill" style="width:${pct}%"></div></div>
                ${answeredCount > 0 ? '<button class="ip-reset-btn" id="ipResetQuiz">Reset Quiz</button>' : ''}
            </div>
            ${topic.quiz.map((q, i) => renderQuizQ(q, i, answers)).join('')}`;

        panel.querySelectorAll('.ip-option:not(.answered)').forEach(btn => {
            btn.addEventListener('click', e => {
                const qi = parseInt(e.target.dataset.qi);
                const oi = parseInt(e.target.dataset.oi);
                answerQuiz(qi, oi);
            });
        });
        const resetBtn = document.getElementById('ipResetQuiz');
        if (resetBtn) resetBtn.addEventListener('click', () => {
            const st = getState();
            delete st.answers;
            saveState(st);
            renderQuiz();
            recordScore(0, 0);
        });
    }

    function renderQuizQ(q, qi, answers) {
        const answered = qi in answers;
        const userAnswer = answers[qi];
        return `
        <div class="ip-question">
            <div class="ip-q-num">Question ${qi + 1} of ${topic.quiz.length}</div>
            <div class="ip-q-text">${q.question}</div>
            ${q.options.map((opt, oi) => {
                let cls = 'ip-option';
                if (answered) {
                    cls += ' answered';
                    if (oi === q.correct) cls += ' correct right-answer';
                    else if (oi === userAnswer && oi !== q.correct) cls += ' wrong';
                }
                return `<button class="${cls}" data-qi="${qi}" data-oi="${oi}">${opt}</button>`;
            }).join('')}
            <div class="ip-explanation ${answered ? 'show' : ''}">${q.explanation}</div>
        </div>`;
    }

    function answerQuiz(qi, oi) {
        const st = getState();
        if (!st.answers) st.answers = {};
        if (qi in st.answers) return;
        st.answers[qi] = oi;
        saveState(st);
        renderQuiz();
        const total = topic.quiz.length;
        const answeredCount = Object.keys(st.answers).length;
        if (answeredCount === total) {
            let correct = 0;
            Object.entries(st.answers).forEach(([q, a]) => {
                if (topic.quiz[q] && topic.quiz[q].correct === a) correct++;
            });
            recordScore(correct, total);
        }
    }

    function recordScore(correct, total) {
        if (typeof GameTracker !== 'undefined' && total > 0) {
            try {
                GameTracker.record('ip-' + topic.id, {
                    result: correct / total >= 0.7 ? 'success' : 'failure',
                    score: correct, maxScore: total,
                    percentage: Math.round(correct / total * 100)
                });
            } catch(e) {}
        }
        try {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            if (!progress.web) progress.web = {};
            progress.web['ip-' + topic.id] = {
                completed: total > 0 && correct / total >= 0.7,
                score: correct, total: total, timestamp: Date.now()
            };
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
        } catch(e) {}
    }

    return { init };
})();
