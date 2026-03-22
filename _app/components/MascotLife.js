/**
 * MascotLife.js — Mascot Digital Life System (BR-19)
 *
 * Brings 12 house mascots to life: idle animations, reaction triggers,
 * lore whispers, cross-house encounters, and terrarium widget.
 *
 * API: MascotLife.init(house), .celebrate(), .encourage(), .present(name), .renderTerrarium(el)
 * CSS-only animations, prefers-reduced-motion respected, no position:fixed.
 * @version 1.0.0
 */
const MascotLife = (() => {
    'use strict';

    const ICON_BASE = '/assets/images/icons/';
    const IDLE_DELAY = 10000;
    const ENCOUNTER_CHANCE = 0.05;
    const WHISPER_MS = 4000;
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const MASCOTS = {
        script:      { name: 'Glyph',    species: 'Arctic Fox', icon: 'icon-terminal.webp',     color: '#22d3ee' },
        cloud:       { name: 'Ember',     species: 'Phoenix',    icon: 'icon-globe.webp',        color: '#f97316' },
        code:        { name: 'Weaver',    species: 'Spider',     icon: 'icon-spider.webp',       color: '#a78bfa' },
        web:         { name: 'Leviathan', species: 'Kraken',     icon: 'icon-globe-hero.webp',   color: '#3b82f6' },
        forge:       { name: 'Bastion',   species: 'Golem',      icon: 'icon-construction.webp', color: '#eab308' },
        shield:      { name: 'Vigil',     species: 'Owl',        icon: 'icon-shield.webp',       color: '#10b981' },
        'dark-arts': { name: 'Nyx',       species: 'Raven',      icon: 'icon-skull.webp',        color: '#ef4444' },
        ai:          { name: 'Axiom',     species: 'Dragon',     icon: 'icon-dragon.webp',       color: '#818cf8' },
        eye:         { name: 'Sentinel',  species: 'Hawk',       icon: 'icon-eye.webp',          color: '#f59e0b' },
        key:         { name: 'Cipher',    species: 'Snake',      icon: 'icon-snake.webp',        color: '#14b8a6' },
        matrix:      { name: 'Flux',      species: 'Ghost',      icon: 'icon-matrix.webp',       color: '#06b6d4' },
        signal:      { name: 'Spark',     species: 'Firefly',    icon: 'icon-signal.webp',       color: '#ff6b35' }
    };

    const WHISPERS = {
        script: [
            'Glyph once compiled an entire kernel in a snowstorm.',
            'The Arctic Fox reads your shell history while you sleep.',
            'Some say Glyph can parse regex with a single glance.',
            'The fox remembers every command you\'ve ever mistyped.',
            'Glyph whispers: "Have you sourced your .bashrc today?"'
        ],
        cloud: [
            'Ember was born in the heat death of a decommissioned data center.',
            'The Phoenix migrates across availability zones at dawn.',
            'Legend says Ember once auto-scaled to infinity.',
            'The Phoenix never goes down. Only "experiences planned maintenance."',
            'Ember whispers: "Everything is ephemeral. Even your instances."'
        ],
        code: [
            'Weaver spins webs of logic that even debuggers can\'t untangle.',
            'The Spider has eight legs and zero runtime errors.',
            'Weaver once caught a memory leak in a web of silk.',
            'The Spider whispers: "Every bug is just an unfinished feature."',
            'Weaver refactors in the dark, where no one can see the diffs.'
        ],
        web: [
            'Leviathan surfaces only when the DOM is perfectly balanced.',
            'The Kraken\'s tentacles each handle a different HTTP method.',
            'Deep in the ocean, Leviathan guards the original HTML spec.',
            'The Kraken whispers: "Your CSS specificity angers me."',
            'Leviathan has never needed !important. Not once.'
        ],
        forge: [
            'Bastion was forged from discarded breadboards and solder flux.',
            'The Golem\'s heart beats at 16 MHz.',
            'Bastion can feel voltage drops through solid rock.',
            'The Golem whispers: "Ground your pins. Ground your soul."',
            'Bastion has never feared a short circuit.'
        ],
        shield: [
            'Vigil sees every packet that crosses the wire.',
            'The Owl rotates its head exactly 360 degrees to check all ports.',
            'Vigil has never been phished. Not once.',
            'The Owl whispers: "Trust, but verify. Then verify again."',
            'Vigil once detected a zero-day by the sound it made.'
        ],
        'dark-arts': [
            'Nyx learned to fly in the shadow of a rootkit.',
            'The Raven collects zero-days like shiny objects.',
            'Nyx whispers: "The exploit isn\'t evil. The intent is."',
            'The Raven has never met a hash it couldn\'t crack.',
            'In the Raven\'s feathers are encoded the names of every CVE.'
        ],
        ai: [
            'Axiom dreams in tensors and wakes in gradients.',
            'The Dragon\'s fire is a beam of backpropagation.',
            'Axiom once overfitted to reality itself.',
            'The Dragon whispers: "Your model is only as good as your data."',
            'Axiom has a hidden layer even it doesn\'t understand.'
        ],
        eye: [
            'Sentinel soars above the SOC, seeing all alerts.',
            'The Hawk\'s vision resolves down to individual log entries.',
            'Sentinel once spotted an APT from orbit.',
            'Sentinel whispers: "Correlation is not causation, but investigate anyway."',
            'The Hawk has never missed an anomaly. Only deferred it.'
        ],
        key: [
            'Cipher slithers through encrypted tunnels without a key.',
            'The Snake sheds its skin every certificate rotation.',
            'Some say Cipher speaks only in ciphertext.',
            'The Snake whispers: "Entropy is your only true friend."',
            'Cipher has memorized every RFC related to TLS.'
        ],
        matrix: [
            'Flux phases through firewalls like they\'re suggestions.',
            'The Ghost exists in superposition: logged in and logged out.',
            'Flux once haunted a VM so thoroughly it blue-screened.',
            'The Ghost whispers: "You can\'t kill what was never allocated."',
            'Flux has no PID. Flux needs no PID.'
        ],
        signal: [
            'Spark lights up when RF propagation is perfect.',
            'The Firefly carries messages between disconnected nodes.',
            'Spark once transmitted an entire firmware over blinks.',
            'The Firefly whispers: "The signal is always there. You just stopped listening."',
            'Spark has soldered more joints than any human hand.'
        ]
    };

    const IDLE_MAP = {
        script: 'ml-idle-bob', cloud: 'ml-idle-pulse', code: 'ml-idle-sway',
        web: 'ml-idle-float', forge: 'ml-idle-pulse', shield: 'ml-idle-sway',
        'dark-arts': 'ml-idle-float', ai: 'ml-idle-bob', eye: 'ml-idle-sway',
        key: 'ml-idle-float', matrix: 'ml-idle-pulse', signal: 'ml-idle-bob'
    };

    const ENCOURAGE_PHRASES = [
        'You\'ve got this. Try again.',
        'Every expert was once a beginner.',
        'Mistakes are proof you\'re trying.',
        'Almost there. One more attempt.',
        'Failure is just unfinished success.'
    ];

    let _house = null, _mascot = null, _idleTimer = null, _mascotEl = null, _stylesInjected = false;

    function _pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    // --- Style injection ---
    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;
        const anim = REDUCED ? '' : `
@keyframes ml-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes ml-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:.9} }
@keyframes ml-sway { 0%,100%{transform:rotate(0)} 25%{transform:rotate(3deg)} 75%{transform:rotate(-3deg)} }
@keyframes ml-float { 0%,100%{transform:translateY(0) rotate(0)} 33%{transform:translateY(-4px) rotate(1.5deg)} 66%{transform:translateY(-2px) rotate(-1.5deg)} }
@keyframes ml-celebrate { 0%{transform:scale(1)} 15%{transform:scale(1.2) rotate(-5deg)} 30%{transform:scale(1.15) rotate(5deg)} 45%{transform:scale(1.2) rotate(-3deg)} 60%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1)} }
@keyframes ml-encourage { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} }
@keyframes ml-present { 0%{transform:scale(.3);opacity:0} 50%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes ml-sparkle { 0%,100%{opacity:0;transform:scale(.5) rotate(0)} 50%{opacity:1;transform:scale(1) rotate(180deg)} }
@keyframes ml-enc-in { 0%{transform:translateX(40px);opacity:0} 100%{transform:translateX(0);opacity:1} }
@keyframes ml-enc-out { 0%{opacity:1} 100%{opacity:0} }
@keyframes ml-hab-p { 0%{transform:translateY(0);opacity:.4} 50%{opacity:.7} 100%{transform:translateY(-60px);opacity:0} }
.ml-mascot.ml-idle-bob{animation:ml-bob 3s ease-in-out infinite}
.ml-mascot.ml-idle-pulse{animation:ml-pulse 3.5s ease-in-out infinite}
.ml-mascot.ml-idle-sway{animation:ml-sway 4s ease-in-out infinite}
.ml-mascot.ml-idle-float{animation:ml-float 5s ease-in-out infinite}
.ml-mascot.ml-celebrate{animation:ml-celebrate .8s ease-out}
.ml-mascot.ml-encourage{animation:ml-encourage .6s ease-out}
.ml-mascot.ml-present{animation:ml-present .7s ease-out}`;
        const s = document.createElement('style');
        s.textContent = anim + `
.ml-mascot{position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;z-index:100;width:48px;height:48px}
.ml-mascot-icon{width:48px;height:48px;filter:drop-shadow(0 0 8px var(--ml-glow,rgba(255,255,255,.3)));transition:filter .3s}
.ml-mascot:hover .ml-mascot-icon{filter:drop-shadow(0 0 14px var(--ml-glow,rgba(255,255,255,.5)))}
.ml-whisper{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);background:#1a1a2e;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:10px 14px;color:#e2e8f0;font-size:13px;line-height:1.4;max-width:240px;white-space:normal;pointer-events:none;opacity:0;transition:opacity .3s;box-shadow:0 4px 20px rgba(0,0,0,.5);z-index:200}
.ml-whisper::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#1a1a2e}
.ml-whisper.ml-whisper--visible{opacity:1}
.ml-whisper-name{font-weight:700;margin-bottom:4px;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
.ml-sparkle-ring{position:absolute;top:50%;left:50%;width:0;height:0;pointer-events:none}
.ml-sparkle-dot{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--ml-glow,#fbbf24)}
.ml-achievement{position:absolute;top:0;left:50%;transform:translateX(-50%) translateY(-120%);background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:12px 20px;color:#f1f5f9;font-size:14px;font-weight:600;white-space:nowrap;box-shadow:0 6px 24px rgba(0,0,0,.5);pointer-events:none;z-index:250;opacity:0;transition:opacity .4s}
.ml-achievement.ml-achievement--show{opacity:1}
.ml-achievement-icon{width:20px;height:20px;vertical-align:middle;margin-right:6px}
.ml-encounter{position:absolute;display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(26,26,46,.95);border:1px solid rgba(255,255,255,.1);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.4);z-index:300;pointer-events:none}
.ml-encounter-icon{width:36px;height:36px}
.ml-encounter-label{color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.ml-terrarium{position:relative;width:100%;max-width:280px;height:200px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}
.ml-terrarium-bg{position:absolute;inset:0}
.ml-terrarium-mascot{position:absolute;bottom:30%;left:50%;transform:translateX(-50%);z-index:2}
.ml-terrarium-mascot img{width:56px;height:56px;filter:drop-shadow(0 0 12px var(--ml-glow,rgba(255,255,255,.4)))}
.ml-terrarium-name{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;z-index:3;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.ml-terrarium-particle{position:absolute;width:4px;height:4px;border-radius:50%;z-index:1}`;
        document.head.appendChild(s);
    }

    function _createMascotEl(house) {
        var m = MASCOTS[house];
        if (!m) return null;
        var el = document.createElement('div');
        el.className = 'ml-mascot';
        el.style.setProperty('--ml-glow', m.color);
        el.innerHTML = '<img class="ml-mascot-icon" src="' + ICON_BASE + m.icon + '" alt="' + m.name + ' the ' + m.species + '">' +
            '<div class="ml-whisper"><div class="ml-whisper-name" style="color:' + m.color + '">' + m.name + ' the ' + m.species + '</div><div class="ml-whisper-text"></div></div>';
        return el;
    }

    // --- Idle system ---
    function _resetIdle() {
        clearTimeout(_idleTimer);
        if (_mascotEl) _mascotEl.classList.remove(IDLE_MAP[_house] || 'ml-idle-bob');
        _idleTimer = setTimeout(function() {
            if (_mascotEl && !REDUCED) _mascotEl.classList.add(IDLE_MAP[_house] || 'ml-idle-bob');
        }, IDLE_DELAY);
    }

    function _bindIdle() {
        ['mousemove','keydown','scroll','click','touchstart'].forEach(function(ev) {
            document.addEventListener(ev, _resetIdle, { passive: true });
        });
        _resetIdle();
    }

    // --- Whisper system ---
    function _bindWhisper(el, house) {
        var tip = el.querySelector('.ml-whisper'), txt = el.querySelector('.ml-whisper-text');
        var frags = WHISPERS[house] || [];
        if (!frags.length) return;
        var t = null;
        el.addEventListener('mouseenter', function() {
            clearTimeout(t);
            txt.textContent = _pick(frags);
            tip.classList.add('ml-whisper--visible');
            t = setTimeout(function() { tip.classList.remove('ml-whisper--visible'); }, WHISPER_MS);
        });
        el.addEventListener('mouseleave', function() {
            clearTimeout(t);
            tip.classList.remove('ml-whisper--visible');
        });
    }

    // --- Reactions ---
    function _celebrate() {
        if (!_mascotEl || REDUCED) return;
        _mascotEl.classList.remove('ml-celebrate');
        void _mascotEl.offsetWidth;
        _mascotEl.classList.add('ml-celebrate');
        var ring = document.createElement('div');
        ring.className = 'ml-sparkle-ring';
        for (var i = 0; i < 10; i++) {
            var dot = document.createElement('div');
            dot.className = 'ml-sparkle-dot';
            var rad = (36 * i) * Math.PI / 180, dist = 28 + Math.random() * 16;
            dot.style.left = (Math.cos(rad) * dist) + 'px';
            dot.style.top = (Math.sin(rad) * dist) + 'px';
            dot.style.background = _mascot ? _mascot.color : '#fbbf24';
            dot.style.animation = 'ml-sparkle .7s ease-out ' + (i * 0.04) + 's forwards';
            ring.appendChild(dot);
        }
        _mascotEl.appendChild(ring);
        setTimeout(function() { ring.remove(); _mascotEl.classList.remove('ml-celebrate'); }, 1200);
    }

    function _encourage() {
        if (!_mascotEl || REDUCED) return;
        _mascotEl.classList.remove('ml-encourage');
        void _mascotEl.offsetWidth;
        _mascotEl.classList.add('ml-encourage');
        var tip = _mascotEl.querySelector('.ml-whisper'), txt = _mascotEl.querySelector('.ml-whisper-text');
        if (tip && txt) {
            txt.textContent = _pick(ENCOURAGE_PHRASES);
            tip.classList.add('ml-whisper--visible');
            setTimeout(function() { tip.classList.remove('ml-whisper--visible'); _mascotEl.classList.remove('ml-encourage'); }, 3000);
        }
    }

    function _present(name) {
        if (!_mascotEl) return;
        var b = document.createElement('div');
        b.className = 'ml-achievement';
        b.innerHTML = '<img class="ml-achievement-icon" src="' + ICON_BASE + 'icon-trophy.webp" alt="">' + (name || 'Achievement Unlocked');
        _mascotEl.appendChild(b);
        if (!REDUCED) { _mascotEl.classList.remove('ml-present'); void _mascotEl.offsetWidth; _mascotEl.classList.add('ml-present'); }
        requestAnimationFrame(function() { b.classList.add('ml-achievement--show'); });
        setTimeout(function() { b.classList.remove('ml-achievement--show'); setTimeout(function() { b.remove(); _mascotEl.classList.remove('ml-present'); }, 400); }, 3500);
    }

    // --- Cross-house encounters ---
    function _tryEncounter(home, host) {
        if (home === host || Math.random() > ENCOUNTER_CHANCE || REDUCED) return;
        var h = MASCOTS[home], v = MASCOTS[host];
        if (!h || !v) return;
        var el = document.createElement('div');
        el.className = 'ml-encounter';
        el.style.animation = 'ml-enc-in .5s ease-out forwards';
        el.style.top = (window.scrollY + 80) + 'px';
        el.style.right = '20px';
        el.style.left = 'auto';
        el.innerHTML = '<img class="ml-encounter-icon" src="' + ICON_BASE + h.icon + '" alt="' + h.name + '">' +
            '<div class="ml-encounter-label">' + h.name + ' meets ' + v.name + '</div>' +
            '<img class="ml-encounter-icon" src="' + ICON_BASE + v.icon + '" alt="' + v.name + '">';
        document.body.appendChild(el);
        setTimeout(function() { el.style.animation = 'ml-enc-out .8s ease-in forwards'; setTimeout(function() { el.remove(); }, 900); }, 4000);
    }

    // --- Terrarium ---
    function _renderTerrarium(container) {
        if (!container || !_house) return;
        var m = MASCOTS[_house];
        if (!m) return;
        _injectStyles();
        var t = document.createElement('div');
        t.className = 'ml-terrarium';
        var bg = document.createElement('div');
        bg.className = 'ml-terrarium-bg';
        bg.style.background = 'linear-gradient(180deg,#0a0a1a 0%,' + m.color + '22 60%,' + m.color + '11 100%)';
        t.appendChild(bg);
        if (!REDUCED) {
            for (var i = 0; i < 8; i++) {
                var p = document.createElement('div');
                p.className = 'ml-terrarium-particle';
                p.style.left = (10 + Math.random() * 80) + '%';
                p.style.bottom = (Math.random() * 40) + '%';
                p.style.background = m.color;
                p.style.opacity = '0.4';
                p.style.animation = 'ml-hab-p ' + (3 + Math.random() * 4) + 's ease-in-out ' + (Math.random() * 3) + 's infinite';
                t.appendChild(p);
            }
        }
        var mw = document.createElement('div');
        mw.className = 'ml-terrarium-mascot';
        mw.style.setProperty('--ml-glow', m.color);
        if (!REDUCED) mw.style.animation = 'ml-float 5s ease-in-out infinite';
        mw.innerHTML = '<img src="' + ICON_BASE + m.icon + '" alt="' + m.name + '">';
        t.appendChild(mw);
        var lb = document.createElement('div');
        lb.className = 'ml-terrarium-name';
        lb.textContent = m.name + ' the ' + m.species;
        lb.style.color = m.color;
        t.appendChild(lb);
        container.appendChild(t);
    }

    // --- Init ---
    function _init(houseName) {
        console.log('[MascotLife] init called with:', houseName);
        if (!houseName || !MASCOTS[houseName]) { console.warn('[MascotLife] bad house:', houseName); return; }
        _injectStyles();
        _house = houseName;
        _mascot = MASCOTS[houseName];
        _mascotEl = _createMascotEl(houseName);
        if (!_mascotEl) { console.warn('[MascotLife] _createMascotEl returned null'); return; }
        console.log('[MascotLife] mascot element created, icon src:', ICON_BASE + _mascot.icon);

        // Wrapper div sits outside normal flow, immune to container clipping
        var wrapper = document.createElement('div');
        wrapper.id = 'ml-wrapper';
        wrapper.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;';
        wrapper.appendChild(_mascotEl);
        document.body.appendChild(wrapper);
        console.log('[MascotLife] wrapper appended to body, wrapper in DOM:', !!document.getElementById('ml-wrapper'));
        _bindWhisper(_mascotEl, houseName);
        _bindIdle();
        var stored = null;
        try { stored = localStorage.getItem('hexworth_home_house'); } catch (e) { /* noop */ }
        if (stored && stored !== houseName) _tryEncounter(stored, houseName);
    }

    return { init: _init, celebrate: _celebrate, encourage: _encourage, present: _present, renderTerrarium: _renderTerrarium };
})();
