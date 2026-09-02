/**
 * SecretFeatures.js - Hidden Features & Easter Eggs
 * Hexworth Prime — Sprint F-30
 *
 * Nocturnal Mode, Konami Code, Discovery Mechanics, Educational Easter Eggs.
 * Self-initializes on load. Lean by design — the fun is in the discovery.
 *
 * @version 1.0.0
 */
const SecretFeatures = (function() {
    'use strict';

    const KEYS = {
        nocturnal: 'hexworth_nocturnal_mode',   // 'auto' | 'on' | 'off'
        konamiFound: 'hexworth_konami_found',
        pagesVisited: 'hexworth_session_pages',   // sessionStorage
        housesVisited: 'hexworth_session_houses',  // sessionStorage
        discoveries: 'hexworth_discoveries'
    };

    const customEggs = {};

    // ═══════════════════════════════════════════════════════════════
    // NOCTURNAL MODE (10pm–6am subtle cool shift)
    // ═══════════════════════════════════════════════════════════════

    const NOCTURNAL_CSS = `
        body.nocturnal-active { filter: brightness(0.92) saturate(0.9); }
        body.nocturnal-active::after {
            content:''; position:absolute; inset:0; pointer-events:none; z-index:99999;
            background:linear-gradient(135deg,rgba(30,20,60,0.08),rgba(15,10,40,0.12));
            mix-blend-mode:multiply;
        }
        body.nocturnal-active canvas { filter: brightness(1.25) contrast(1.1); }
    `;

    function getNocturnalPref() { return localStorage.getItem(KEYS.nocturnal) || 'auto'; }
    function setNocturnalPref(v) { localStorage.setItem(KEYS.nocturnal, v); applyNocturnal(); }
    function isNocturnalHour() { const h = new Date().getHours(); return h >= 22 || h < 6; }

    function applyNocturnal() {
        const pref = getNocturnalPref();
        const active = pref === 'on' || (pref === 'auto' && isNocturnalHour());
        if (active && !document.getElementById('nocturnal-styles')) {
            const s = document.createElement('style');
            s.id = 'nocturnal-styles'; s.textContent = NOCTURNAL_CSS;
            document.head.appendChild(s);
        } else if (!active) {
            const el = document.getElementById('nocturnal-styles');
            if (el) el.remove();
        }
        document.body.classList.toggle('nocturnal-active', active);
    }

    setInterval(applyNocturnal, 5 * 60 * 1000);

    // ═══════════════════════════════════════════════════════════════
    // KONAMI CODE (up up down down left right left right b a)
    // ═══════════════════════════════════════════════════════════════

    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiPos = 0;

    function handleKonamiKey(e) {
        const expected = KONAMI[konamiPos];
        if (e.key === expected || e.key.toLowerCase() === expected) {
            if (++konamiPos === KONAMI.length) { konamiPos = 0; triggerKonami(); }
        } else { konamiPos = 0; }
    }

    function triggerKonami() {
        localStorage.setItem(KEYS.konamiFound, 'true');
        markDiscovered('konami');
        // Green flash
        const flash = document.createElement('div');
        flash.style.cssText = 'position:absolute;top:' + window.scrollY + 'px;left:0;width:100%;height:' + window.innerHeight + 'px;background:#0f0;opacity:0.6;z-index:999999;pointer-events:none;';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.transition = 'opacity 0.4s'; flash.style.opacity = '0'; }, 100);
        setTimeout(() => flash.remove(), 600);
        unlockAchievement('konami');
        unlockAchievement('konami_code');
        showMatrixRain();
    }

    function showMatrixRain() {
        const c = document.createElement('canvas');
        c.style.cssText = 'position:absolute;top:' + window.scrollY + 'px;left:0;width:100%;height:' + window.innerHeight + 'px;z-index:999998;pointer-events:none;';
        c.width = window.innerWidth; c.height = window.innerHeight;
        document.body.appendChild(c);
        const ctx = c.getContext('2d'), fs = 14, cols = Math.floor(c.width / fs);
        const drops = new Array(cols).fill(1);
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ';
        const iv = setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, c.width, c.height);
            ctx.fillStyle = '#0f0'; ctx.font = fs + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fs, drops[i] * fs);
                if (drops[i] * fs > c.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }, 40);
        setTimeout(() => { clearInterval(iv); c.style.transition = 'opacity 1s'; c.style.opacity = '0'; setTimeout(() => c.remove(), 1000); }, 10000);
    }

    // ═══════════════════════════════════════════════════════════════
    // TYPED COMMANDS (sudo, help)
    // ═══════════════════════════════════════════════════════════════

    let typedBuf = '', typedTimer = null;

    function handleTypedKey(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        if (e.key.length === 1) {
            typedBuf += e.key.toLowerCase();
            clearTimeout(typedTimer);
            typedTimer = setTimeout(() => { typedBuf = ''; }, 2000);
            if (typedBuf.endsWith('sudo')) { typedBuf = ''; showTerminalFlash('$ sudo\nPermission denied. Nice try, operator.'); markDiscovered('sudo'); }
            else if (typedBuf.endsWith('help')) { typedBuf = ''; showShortcutSheet(); markDiscovered('help'); }
        }
    }

    function showTerminalFlash(text) {
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;bottom:' + (document.documentElement.scrollHeight - window.scrollY - window.innerHeight + 40) + 'px;left:50%;transform:translateX(-50%);background:#0a0a0a;color:#0f0;border:1px solid #0f03;font-family:monospace;font-size:14px;padding:16px 28px;border-radius:6px;z-index:999999;white-space:pre;box-shadow:0 0 20px rgba(0,255,0,0.15);animation:sf-termFlash 0.3s ease;';
        el.textContent = text;
        document.body.appendChild(el);
        setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 2500);
    }

    function showShortcutSheet() {
        const ov = document.createElement('div');
        ov.style.cssText = 'position:absolute;top:' + window.scrollY + 'px;left:0;width:100%;height:' + window.innerHeight + 'px;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        ov.onclick = () => ov.remove();
        const box = document.createElement('div');
        box.style.cssText = 'background:#111;color:#ccc;border:1px solid #333;border-radius:10px;padding:32px;max-width:440px;font-family:monospace;font-size:13px;box-shadow:0 0 40px rgba(0,0,0,0.5);';
        const shortcuts = [['Ctrl+K','Quick search'],['?','This help sheet'],['G then D','Go to Dashboard'],['G then G','Go to Games'],['Esc','Close modals']];
        box.innerHTML = '<div style="color:#0f0;font-size:16px;margin-bottom:16px;font-weight:bold;">Keyboard Shortcuts</div><table style="width:100%;border-collapse:collapse;">'
            + shortcuts.map(([k,v]) => `<tr><td style="padding:6px 12px 6px 0;color:#888;">${k}</td><td>${v}</td></tr>`).join('')
            + '</table><div style="margin-top:16px;color:#808080;font-size:11px;">Press anywhere to close</div>';
        ov.appendChild(box);
        document.body.appendChild(ov);
    }

    // ═══════════════════════════════════════════════════════════════
    // DISCOVERY MECHANICS
    // ═══════════════════════════════════════════════════════════════

    function initDiscoveryMechanics() {
        // Triple-click logo -> version info
        const logo = document.querySelector('.logo');
        if (logo) {
            let n = 0, t = null;
            logo.addEventListener('click', () => {
                n++; clearTimeout(t); t = setTimeout(() => { n = 0; }, 500);
                if (n >= 3) { n = 0; showVersionInfo(); markDiscovered('version_info'); }
            });
        }
        // Click copyright text 7 times -> credits
        const fn = document.getElementById('footerNote');
        if (fn) {
            let n = 0, t = null;
            fn.style.cursor = 'default';
            fn.addEventListener('click', () => {
                n++; clearTimeout(t); t = setTimeout(() => { n = 0; }, 3000);
                if (n >= 7) { n = 0; showCredits(); unlockAchievement('source_code'); markDiscovered('credits'); }
            });
        }
    }

    function showVersionInfo() {
        /* SIXTH renderer of the platform's identity, found by a reviewer AFTER five others had
           been guarded, on the same page as two of them. Triple-clicking the logo opens this, and
           its header is the literal unconditional string "HEXWORTH PRIME" plus the codename, so
           for a white-label student it is the brand name they are paying not to see, delivered by
           an easter egg.
           Suppressed entirely for tenants rather than having its text softened: this is a
           discovery reward about the PLATFORM, and there is nothing in it a tenant student is
           meant to find. Fails safe, so if UpdateManager is unavailable the panel does not open. */
        var suppressed = true;
        try {
            if (typeof UpdateManager !== 'undefined' && UpdateManager.isTenantContext) {
                suppressed = UpdateManager.isTenantContext();
            } else {
                suppressed = false;   // component genuinely absent on this page, not a tenant signal
            }
        } catch (e) { suppressed = true; }
        if (suppressed) return;

        let ver = '?', code = '?', rel = '?', mods = '?';
        try { const v = JSON.parse(localStorage.getItem('hexworth_version_cache') || '{}'); ver = v.version || ver; code = v.codename || code; rel = v.releaseDate || rel; } catch(_) {}
        if (typeof ContentCatalog !== 'undefined' && ContentCatalog.getStats) mods = ContentCatalog.getStats().total;
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;top:' + (window.scrollY + window.innerHeight / 2) + 'px;left:50%;transform:translate(-50%,-50%);background:#111;color:#aaa;border:1px solid #333;border-radius:10px;padding:32px;font-family:monospace;font-size:13px;z-index:999999;text-align:center;min-width:300px;box-shadow:0 0 40px rgba(0,0,0,0.5);';
        el.innerHTML = '<div style="color:#9f7aea;font-size:18px;margin-bottom:12px;">HEXWORTH PRIME</div>'
            + `<div style="margin:6px 0;">Version: <span style="color:#fff;">${ver}</span></div>`
            + `<div style="margin:6px 0;">Codename: <span style="color:#fff;">${code}</span></div>`
            + `<div style="margin:6px 0;">Released: <span style="color:#fff;">${rel}</span></div>`
            + `<div style="margin:6px 0;">Modules: <span style="color:#fff;">${mods}</span></div>`
            + '<div style="margin-top:16px;color:#808080;font-size:11px;">Triple-clicked the logo. You\'re observant.</div>';
        el.onclick = () => el.remove();
        document.body.appendChild(el);
        setTimeout(() => { if (el.parentNode) { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); } }, 8000);
    }

    function showCredits() {
        const ov = document.createElement('div');
        ov.style.cssText = 'position:absolute;top:' + window.scrollY + 'px;left:0;width:100%;height:' + window.innerHeight + 'px;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        ov.onclick = () => ov.remove();
        const box = document.createElement('div');
        box.style.cssText = 'background:#0a0a0a;color:#ccc;border:1px solid #9f7aea33;border-radius:12px;padding:40px;max-width:420px;text-align:center;font-family:"Segoe UI",sans-serif;box-shadow:0 0 60px rgba(159,122,234,0.15);';
        box.innerHTML = '<div style="font-size:24px;color:#9f7aea;margin-bottom:8px;">HEXWORTH PRIME</div>'
            + '<div style="color:#8a8a8a;margin-bottom:24px;font-size:13px;">You found the hidden credits.</div>'
            + '<div style="color:#888;font-size:14px;line-height:2;"><div>Designed & Built by</div>'
            + '<div style="color:#fff;font-size:16px;">The Professor</div>'
            + '<div style="margin-top:16px;color:#808080;">NSA / CIA / FAANG / Special Operations</div>'
            + '<div style="margin-top:8px;color:#808080;">17+ Years in the Shadows</div></div>'
            + '<div style="margin-top:24px;font-family:monospace;color:#0f03;font-size:11px;">"There is no spoon."</div>'
            + '<div style="margin-top:16px;color:#333;font-size:11px;">Click anywhere to close</div>';
        ov.appendChild(box);
        document.body.appendChild(ov);
    }

    // ═══════════════════════════════════════════════════════════════
    // EDUCATIONAL EASTER EGGS (session-based tracking)
    // ═══════════════════════════════════════════════════════════════

    function trackPageVisit() {
        const pages = JSON.parse(sessionStorage.getItem(KEYS.pagesVisited) || '[]');
        const cur = window.location.pathname;
        if (!pages.includes(cur)) { pages.push(cur); sessionStorage.setItem(KEYS.pagesVisited, JSON.stringify(pages)); }
        // The Answer: exactly 42 unique pages in one session
        if (pages.length === 42) { unlockAchievement('the_answer'); markDiscovered('42_pages'); }
        // Track houses visited this session
        const hm = cur.match(/houses\/([^/]+)/);
        if (hm) {
            const houses = JSON.parse(sessionStorage.getItem(KEYS.housesVisited) || '[]');
            if (!houses.includes(hm[1])) { houses.push(hm[1]); sessionStorage.setItem(KEYS.housesVisited, JSON.stringify(houses)); }
            // World Traveler: all 9 houses in one session
            if (houses.length >= 9) { unlockAchievement('world_traveler'); markDiscovered('all_houses'); }
        }
    }

    function checkMidnightCompletion() {
        window.addEventListener('moduleCompleted', () => {
            if (new Date().getHours() === 0) { unlockAchievement('night_owl'); markDiscovered('midnight_complete'); }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════

    function unlockAchievement(id) {
        if (typeof AchievementManager !== 'undefined' && AchievementManager.unlock) AchievementManager.unlock(id);
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.triggerEasterEgg) AchievementSystem.triggerEasterEgg(id);
    }

    function markDiscovered(featureId) {
        const d = JSON.parse(localStorage.getItem(KEYS.discoveries) || '{}');
        if (!d[featureId]) {
            d[featureId] = Date.now();
            localStorage.setItem(KEYS.discoveries, JSON.stringify(d));
            window.dispatchEvent(new CustomEvent('secretFeature:discovered', { detail: { featureId, timestamp: d[featureId] } }));
        }
    }

    function registerEgg(id, cb) { customEggs[id] = cb; }
    function triggerEgg(id) { if (customEggs[id]) { customEggs[id](); markDiscovered(id); } }

    // ═══════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════

    function init() {
        // Inject animation keyframes
        if (!document.getElementById('sf-animations')) {
            const s = document.createElement('style'); s.id = 'sf-animations';
            s.textContent = '@keyframes sf-termFlash{0%{opacity:0;transform:translateX(-50%) translateY(10px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}';
            document.head.appendChild(s);
        }
        applyNocturnal();
        document.addEventListener('keydown', handleKonamiKey);
        document.addEventListener('keydown', handleTypedKey);
        initDiscoveryMechanics();
        trackPageVisit();
        checkMidnightCompletion();
        console.log('[SecretFeatures] Initialized');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return {
        getNocturnalMode: getNocturnalPref,
        setNocturnalMode: setNocturnalPref,
        isNocturnalActive: () => document.body.classList.contains('nocturnal-active'),
        registerEgg,
        triggerEgg
    };
})();
