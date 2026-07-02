/**
 * FlappyEngine.js — Shared Flappy Bird game engine for Hexworth Prime
 *
 * Reusable canvas-based flappy game with themed skins.
 * Usage: FlappyEngine.init(config) from any game page.
 *
 * Sprint F-23: Flappy Bird Style Game Series
 */
window.FlappyEngine = (function () {
    'use strict';

    // ── Internal State ──────────────────────────────────────────────────
    let canvas, ctx;
    let config = {};
    let state = 'menu'; // menu | playing | dead
    let animFrame = null;
    let lastTime = 0;

    // Bird
    let bird = { x: 0, y: 0, vy: 0, rotation: 0, flapFrame: 0 };

    // Pipes
    let pipes = [];
    let pipeTimer = 0;

    // Parallax layers
    let bgLayers = [{ offset: 0 }, { offset: 0 }, { offset: 0 }];
    let groundOffset = 0;

    // Score
    let score = 0;
    let highScore = 0;
    let scorePopups = [];

    // Difficulty
    let difficultyMultiplier = 1;
    let basePipeSpeed = 0;
    let baseGapSize = 0;

    // Death animation
    let deathTimer = 0;
    let deathVy = 0;

    // Milestone tracking
    let lastMilestone = 0;

    // ── Power-Up State ──────────────────────────────────────────────────
    let powerups = [];           // collectibles on screen
    let activePowerup = null;    // { id, endTime, startTime } or null
    let scoreMultiplier = 1;     // for 'multi' powerup
    let borderFlashTimer = 0;    // countdown for border flash effect
    let borderFlashColor = '';   // color for border flash

    // ── Obstacle Variety State ──────────────────────────────────────────
    // type property added to pipe objects; no extra global state needed

    // ── Progressive Difficulty Events State ─────────────────────────────
    let activeEvent = null;      // { type, ... } or null
    let triggeredEvents = {};    // score thresholds already triggered
    let windParticles = [];      // visual particles for wind event
    let shakeOffset = { x: 0, y: 0 }; // screen shake for turbulence

    // Canvas dimensions
    const W = 400;
    const H = 600;

    // Physics
    const GRAVITY = 0.45;
    const JUMP_VEL = -7.5;
    const TERMINAL_VEL = 10;
    const GROUND_H = 60;

    // ── Audio (Web Audio API chiptune) ──────────────────────────────────
    let audioCtx = null;
    let audioEnabled = true;
    let bgOsc = null;
    let bgGain = null;

    function initAudio() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            audioEnabled = false;
        }
    }

    function resumeAudio() {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playFlap() {
        if (!audioEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
    }

    function playScore() {
        if (!audioEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } catch (e) {}
    }

    function playCrash() {
        if (!audioEnabled || !audioCtx) return;
        try {
            const bufferSize = audioCtx.sampleRate * 0.2;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            noise.start();
            noise.stop(audioCtx.currentTime + 0.2);
        } catch (e) {}
    }

    function startBgPulse() {
        if (!audioEnabled || !audioCtx) return;
        stopBgPulse();
        try {
            bgOsc = audioCtx.createOscillator();
            bgGain = audioCtx.createGain();
            bgOsc.type = 'sine';
            bgOsc.frequency.value = 55;
            bgGain.gain.value = 0.015;
            bgOsc.connect(bgGain);
            bgGain.connect(audioCtx.destination);
            bgOsc.start();
        } catch (e) {}
    }

    function stopBgPulse() {
        try {
            if (bgOsc) { bgOsc.stop(); bgOsc.disconnect(); }
            if (bgGain) { bgGain.disconnect(); }
        } catch (e) {}
        bgOsc = null;
        bgGain = null;
    }

    // ── Power-Up Audio ────────────────────────────────────────────────
    function playCollect() {
        if (!audioEnabled || !audioCtx) return;
        try {
            // Ascending arpeggio: 3 quick notes rising
            var notes = [523, 659, 784]; // C5, E5, G5
            for (var n = 0; n < notes.length; n++) {
                (function (freq, delay) {
                    var osc = audioCtx.createOscillator();
                    var gain = audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
                    gain.gain.setValueAtTime(0.07, audioCtx.currentTime + delay);
                    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delay + 0.08);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(audioCtx.currentTime + delay);
                    osc.stop(audioCtx.currentTime + delay + 0.08);
                })(notes[n], n * 0.06);
            }
        } catch (e) {}
    }

    function playDeflect() {
        if (!audioEnabled || !audioCtx) return;
        try {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } catch (e) {}
    }

    // ── Helpers ─────────────────────────────────────────────────────────
    function loadHighScore() {
        try {
            const stored = localStorage.getItem(config.storageKey);
            highScore = stored ? parseInt(stored, 10) || 0 : 0;
        } catch (e) { highScore = 0; }
    }

    function saveHighScore() {
        try {
            if (score > highScore) {
                highScore = score;
                localStorage.setItem(config.storageKey, highScore);
            }
        } catch (e) {}
    }

    // ── Pipe Generation ─────────────────────────────────────────────────
    function selectObstacleType() {
        var obs = config.obstacles;
        if (!obs || !obs.types || obs.types.length <= 1) return 'pipe';
        var thresholds = obs.scoreThresholds || {};
        var available = ['pipe'];
        for (var i = 0; i < obs.types.length; i++) {
            var t = obs.types[i];
            if (t === 'pipe') continue;
            var threshold = thresholds[t] || 0;
            if (score >= threshold) available.push(t);
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    function spawnPipe() {
        var effectiveGapSize = baseGapSize;
        // Widen powerup: increase gap
        if (activePowerup && activePowerup.id === 'widen') {
            effectiveGapSize += 30;
        }

        var gapSize = Math.max(effectiveGapSize - difficultyMultiplier * 2, 100);
        var minY = 80;
        var maxY = H - GROUND_H - gapSize - 80;
        var gapY = minY + Math.random() * (maxY - minY);

        var obstacleType = selectObstacleType();

        var pipe = {
            x: W + 10,
            gapY: gapY,
            gapSize: gapSize,
            originalGapSize: gapSize,
            originalGapY: gapY,
            width: 52,
            scored: false,
            wasOverlapping: false,
            type: obstacleType,
            spawnX: W + 10,
            phase: Math.random() * Math.PI * 2, // for sinusoidal movement
            // Random decoration text for themed pipes
            label: config.pipes.labels ? config.pipes.labels[Math.floor(Math.random() * config.pipes.labels.length)] : ''
        };

        // For split type: generate second gap
        if (obstacleType === 'split') {
            var splitGap = Math.max(gapSize * 0.6, 60);
            var region = H - GROUND_H - 80 - 80;
            var gap1Y = 80 + Math.random() * (region * 0.4);
            var gap2Y = gap1Y + splitGap + 40 + Math.random() * (region * 0.3);
            // Ensure gap2 fits
            if (gap2Y + splitGap > H - GROUND_H - 40) {
                gap2Y = H - GROUND_H - 40 - splitGap;
            }
            pipe.gapY = gap1Y;
            pipe.gapSize = splitGap;
            pipe.gap2Y = gap2Y;
            pipe.gap2Size = splitGap;
        }

        // Hook: onPipeSpawn — let consumer modify pipe before it enters play
        if (config.hooks && typeof config.hooks.onPipeSpawn === 'function') {
            config.hooks.onPipeSpawn(pipe);
        }

        pipes.push(pipe);

        // Power-up spawn chance
        var pu = config.powerups;
        if (pu && pu.enabled && pu.types && pu.types.length > 0) {
            if (Math.random() < (pu.spawnChance || 0.15)) {
                var puType = pu.types[Math.floor(Math.random() * pu.types.length)];
                var puY = pipe.gapY + pipe.gapSize / 2;
                powerups.push({
                    x: pipe.x + pipe.width + 30,
                    y: puY,
                    type: puType,
                    collected: false,
                    bobFrame: Math.random() * Math.PI * 2
                });
            }
        }
    }

    // ── Collision Detection ─────────────────────────────────────────────
    function clampToSurfaces() {
        const bh = config.character.height;
        const groundY = H - GROUND_H - bh / 2;
        const ceilingY = bh / 2;

        // Ground — land on it, don't die
        if (bird.y >= groundY) {
            bird.y = groundY;
            bird.vy = 0;
        }
        // Ceiling — bonk off it, don't die
        if (bird.y <= ceilingY) {
            bird.y = ceilingY;
            if (bird.vy < 0) bird.vy = 0;
        }
    }

    function checkCollision() {
        var bw = config.character.width;
        var bh = config.character.height;
        var bx = bird.x - bw / 2;
        var by = bird.y - bh / 2;

        for (var i = 0; i < pipes.length; i++) {
            var p = pipes[i];
            var pLeft = p.x;
            var pRight = p.x + p.width;
            var isOverlapping = (bx + bw > pLeft && bx < pRight);

            if (isOverlapping) {
                var inGap;
                if (p.type === 'split' && p.gap2Y !== undefined) {
                    // Split pipe: bird is safe if in either gap
                    var inGap1 = (by >= p.gapY && by + bh <= p.gapY + p.gapSize);
                    var inGap2 = (by >= p.gap2Y && by + bh <= p.gap2Y + p.gap2Size);
                    inGap = inGap1 || inGap2;
                } else {
                    inGap = (by >= p.gapY && by + bh <= p.gapY + p.gapSize);
                }

                var inTopPipe = (by < p.gapY);
                var inBottomPipe = (by + bh > p.gapY + p.gapSize);

                // For split pipes, redefine collision zones
                if (p.type === 'split' && p.gap2Y !== undefined) {
                    // Collision if not in either gap
                    inTopPipe = !inGap && (by < p.gapY);
                    inBottomPipe = !inGap && (by + bh > p.gap2Y + p.gap2Size);
                }

                if (!p.wasOverlapping && !inGap) {
                    // Just entered pipe's x-range while NOT in gap = side crash
                    p.wasOverlapping = true;

                    // Hook: onCollision — return false to cancel death
                    if (config.hooks && typeof config.hooks.onCollision === 'function') {
                        if (config.hooks.onCollision(p) === false) continue;
                    }

                    // Shield absorbs hit
                    if (activePowerup && activePowerup.id === 'shield') {
                        activePowerup = null;
                        playDeflect();
                        borderFlashTimer = 200;
                        borderFlashColor = '#06b6d4';
                        continue;
                    }

                    return true;
                }

                if (p.wasOverlapping || inGap) {
                    // Already inside pipe's x-range — treat edges as surfaces
                    if (inBottomPipe) {
                        bird.y = p.gapY + p.gapSize - bh / 2;
                        bird.vy = 0;
                    }
                    if (inTopPipe) {
                        bird.y = p.gapY + bh / 2;
                        if (bird.vy < 0) bird.vy = 0;
                    }
                }
            }

            p.wasOverlapping = isOverlapping;
        }
        return false;
    }

    // ── Power-Up Collection ─────────────────────────────────────────────
    function checkPowerupCollection() {
        var bx = bird.x;
        var by = bird.y;
        var collectRadius = 12;
        var birdRadius = Math.max(config.character.width, config.character.height) / 2;

        for (var i = powerups.length - 1; i >= 0; i--) {
            var pu = powerups[i];
            if (pu.collected) continue;

            var dx = bx - pu.x;
            var dy = by - pu.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < collectRadius + birdRadius) {
                pu.collected = true;
                playCollect();
                borderFlashTimer = 300;
                borderFlashColor = pu.type.color;

                // Apply powerup effect
                if (pu.type.id === 'multi') {
                    // Instant: double next score
                    scoreMultiplier = 2;
                    activePowerup = { id: 'multi', endTime: 0, startTime: Date.now() };
                } else {
                    activePowerup = {
                        id: pu.type.id,
                        endTime: Date.now() + pu.type.duration,
                        startTime: Date.now(),
                        color: pu.type.color,
                        label: pu.type.label,
                        duration: pu.type.duration
                    };
                }
            }
        }
    }

    // ── Drawing ─────────────────────────────────────────────────────────
    // ── Visual helpers (color shading + pipe rendering) — geometry unchanged ──
    // shadeColor: lighten (pct>0, toward white) or darken (pct<0, toward black) a
    // hex color by a percentage; returns an 'rgb(...)' string. Falls back to the
    // input on a bad hex. Used to derive per-clone pipe highlights/edges from the
    // game's own theme color so every Flap clone shades consistently.
    function shadeColor(hex, pct) {
        var h = ('' + hex).replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
        var t = pct < 0 ? 0 : 255, p = Math.min(1, Math.abs(pct) / 100);
        r = Math.round((t - r) * p + r);
        g = Math.round((t - g) * p + g);
        b = Math.round((t - b) * p + b);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
    // hexToRgba: convert a hex color to an 'rgba(...)' string with alpha `a`
    // (0..1). Falls back to the input on a bad hex. Used for the semi-transparent
    // parallax skyline + ground highlight so they tint to the clone's accent color.
    function hexToRgba(hex, a) {
        var h = ('' + hex).replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    // One vertical pipe body section with cylindrical shading (base at edges, lit center).
    // Never darkens below the base beyond a small clamp, so it reads well on dark themes.
    function drawPipeSection(x, y, w, h, pc) {
        if (h <= 0) return;
        var grad = ctx.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, shadeColor(pc.color, -12));
        grad.addColorStop(0.34, shadeColor(pc.color, 30));
        grad.addColorStop(0.55, shadeColor(pc.color, 10));
        grad.addColorStop(1, shadeColor(pc.color, -18));
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        // bright vertical highlight stripe (left-of-center) for a glossy cylinder read
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = shadeColor(pc.color, 60);
        ctx.fillRect(x + w * 0.26, y, Math.max(2, w * 0.07), h);
        ctx.restore();
    }
    // One pipe cap (lip): wider block with a top shine + bottom inner shadow.
    function drawPipeCap(x, capY, w, pc) {
        var cx = x - 4, cw = w + 8;
        var grad = ctx.createLinearGradient(cx, 0, cx + cw, 0);
        grad.addColorStop(0, shadeColor(pc.borderColor, -8));
        grad.addColorStop(0.3, shadeColor(pc.borderColor, 30));
        grad.addColorStop(1, shadeColor(pc.borderColor, -14));
        ctx.fillStyle = grad;
        ctx.fillRect(cx, capY, cw, 20);
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = shadeColor(pc.borderColor, 65);
        ctx.fillRect(cx, capY, cw, 3);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(cx, capY + 17, cw, 3);
        ctx.restore();
    }

    function drawBackground() {
        const bg = config.background;

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H - GROUND_H);
        grad.addColorStop(0, bg.topColor);
        grad.addColorStop(1, bg.bottomColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H - GROUND_H);

        // Parallax layer 1 — far background dots/stars
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = config.theme.accentColor;
        for (let i = 0; i < 30; i++) {
            const px = ((i * 137 + bgLayers[0].offset * 0.2) % (W + 40)) - 20;
            const py = (i * 89) % (H - GROUND_H - 20) + 10;
            const sz = (i % 3) + 1;
            ctx.fillRect(px, py, sz, sz);
        }

        // Parallax layer 2 — city skyline silhouette + horizon glow.
        // Drawn from theme.accentColor (NOT bottomColor — near the ground the sky
        // gradient already equals bottomColor, so bottomColor buildings would be
        // invisible on dark themes). Accent guarantees contrast on all 5 clones.
        var horizon = H - GROUND_H;
        var glow = ctx.createLinearGradient(0, horizon - 80, 0, horizon);
        glow.addColorStop(0, 'rgba(0,0,0,0)');
        glow.addColorStop(1, hexToRgba(config.theme.accentColor, 0.10));
        ctx.fillStyle = glow;
        ctx.fillRect(0, horizon - 80, W, 80);
        for (let i = 0; i < 10; i++) {
            const bw = 30 + (i % 4) * 12;
            const bh = 26 + (i * 53) % 66;
            const px = ((i * 97 + bgLayers[1].offset * 0.5) % (W + 130)) - 65;
            // building body
            ctx.globalAlpha = 1;
            ctx.fillStyle = hexToRgba(config.theme.accentColor, 0.13);
            ctx.fillRect(px, horizon - bh, bw, bh);
            // lit windows (sparse, deterministic pattern)
            ctx.fillStyle = hexToRgba(config.theme.accentColor, 0.5);
            for (let wy = horizon - bh + 6; wy < horizon - 5; wy += 9) {
                for (let wx = px + 4; wx < px + bw - 4; wx += 8) {
                    if ((wx + wy + i) % 3 === 0) ctx.fillRect(wx, wy, 3, 4);
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    function drawGround() {
        const bg = config.background;
        ctx.fillStyle = bg.groundColor;
        ctx.fillRect(0, H - GROUND_H, W, GROUND_H);

        // Two-tone surface highlight band (accent-tinted) so the ground reads as a
        // lit surface rather than a flat block.
        var gg = ctx.createLinearGradient(0, H - GROUND_H, 0, H - GROUND_H + 12);
        gg.addColorStop(0, hexToRgba(config.theme.accentColor, 0.18));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(0, H - GROUND_H, W, 12);

        // Ground line
        ctx.strokeStyle = config.theme.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, H - GROUND_H);
        ctx.lineTo(W, H - GROUND_H);
        ctx.stroke();

        // Scrolling hash marks
        ctx.strokeStyle = config.theme.accentColor;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1;
        for (let i = -1; i < W / 20 + 2; i++) {
            const x = (i * 20 - groundOffset % 20);
            ctx.beginPath();
            ctx.moveTo(x, H - GROUND_H);
            ctx.lineTo(x - 10, H - GROUND_H + 15);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function drawPipe(p) {
        // Dispatch to split renderer for split obstacle type
        if (p.type === 'split' && p.gap2Y !== undefined) {
            drawPipeSplit(p);
            drawObstacleIndicators(p);
            return;
        }

        var pc = config.pipes;

        ctx.save();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(p.x + 4, 0, p.width, p.gapY - 2);
        ctx.fillRect(p.x + 4, p.gapY + p.gapSize + 2, p.width, H - GROUND_H - p.gapY - p.gapSize);

        // Top pipe: shaded cylindrical body + capped lip
        drawPipeSection(p.x, 0, p.width, p.gapY, pc);
        drawPipeCap(p.x, p.gapY - 20, p.width, pc);

        // Bottom pipe: shaded cylindrical body + capped lip
        drawPipeSection(p.x, p.gapY + p.gapSize, p.width, H - GROUND_H - p.gapY - p.gapSize, pc);
        drawPipeCap(p.x, p.gapY + p.gapSize, p.width, pc);

        // Pipe border lines
        ctx.strokeStyle = pc.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, p.width, p.gapY);
        ctx.strokeRect(p.x, p.gapY + p.gapSize, p.width, H - GROUND_H - p.gapY - p.gapSize);
        ctx.restore();

        // Pipe decoration: custom hook — wrapped in save/restore so it always
        // receives clean ctx state (globalAlpha=1, no shadow, string fillStyle)
        // regardless of the gradient/highlight rendering above.
        if (config.pipes.drawDecoration) {
            ctx.save();
            config.pipes.drawDecoration(ctx, p);
            ctx.restore();
        }

        // Label text on pipe cap
        if (p.label) {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.7;
            ctx.font = 'bold 9px Courier New';
            ctx.textAlign = 'center';
            // Top pipe label
            ctx.fillText(p.label, p.x + p.width / 2, p.gapY - 5);
            // Bottom pipe label
            ctx.fillText(p.label, p.x + p.width / 2, p.gapY + p.gapSize + 14);
            ctx.restore();
        }

        // Obstacle type indicators (moving arrows, narrowing warning, etc.)
        drawObstacleIndicators(p);
    }

    function drawBird() {
        ctx.save();
        ctx.translate(bird.x, bird.y);

        // Rotation: tilt up on flap, down on fall
        let targetRot = bird.vy * 3;
        targetRot = Math.max(-30, Math.min(70, targetRot));
        bird.rotation += (targetRot - bird.rotation) * 0.15;
        ctx.rotate(bird.rotation * Math.PI / 180);

        // Draw character via config sprite function
        if (config.character.sprite) {
            config.character.sprite(ctx, config.character.width, config.character.height, bird.flapFrame);
        } else {
            // Fallback: simple rectangle
            ctx.fillStyle = config.character.color || '#fbbf24';
            ctx.fillRect(-config.character.width / 2, -config.character.height / 2,
                config.character.width, config.character.height);
        }

        ctx.restore();
    }

    function drawScore() {
        // Main score
        ctx.save();
        ctx.fillStyle = config.theme.scoreColor || '#ffffff';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(score, W / 2, 50);
        ctx.restore();

        // Score popups
        for (let i = scorePopups.length - 1; i >= 0; i--) {
            const sp = scorePopups[i];
            ctx.save();
            ctx.globalAlpha = sp.alpha;
            ctx.fillStyle = config.theme.accentColor;
            ctx.font = 'bold 18px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(sp.text, sp.x, sp.y);
            ctx.restore();
        }
    }

    function drawPowerups() {
        var now = Date.now();
        for (var i = 0; i < powerups.length; i++) {
            var pu = powerups[i];
            if (pu.collected) continue;

            // Custom sprite override
            var puCfg = config.powerups;
            if (puCfg && typeof puCfg.sprite === 'function') {
                puCfg.sprite(ctx, pu);
                continue;
            }

            // Pulsing glow circle
            pu.bobFrame += 0.05;
            var pulse = 1 + 0.2 * Math.sin(pu.bobFrame);
            var radius = 12 * pulse;

            ctx.save();

            // Outer glow
            ctx.shadowColor = pu.type.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(pu.x, pu.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = pu.type.color;
            ctx.globalAlpha = 0.3;
            ctx.fill();

            // Inner circle
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(pu.x, pu.y, radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = pu.type.color;
            ctx.fill();

            // Label
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pu.type.label, pu.x, pu.y);

            ctx.restore();
        }
    }

    function drawActivePowerupIndicator() {
        if (!activePowerup) return;
        var now = Date.now();

        // For 'multi' type (instant), show brief flash only
        if (activePowerup.id === 'multi') return;

        // Timer bar below score
        var remaining = Math.max(0, activePowerup.endTime - now);
        var total = activePowerup.duration || 1;
        var ratio = remaining / total;
        var barW = 60;
        var barH = 6;
        var barX = W / 2 - barW / 2;
        var barY = 58;

        ctx.save();
        // Color dot
        ctx.fillStyle = activePowerup.color || '#ffffff';
        ctx.beginPath();
        ctx.arc(barX - 8, barY + barH / 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Timer bar background
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(barX, barY, barW, barH);

        // Timer bar fill
        ctx.fillStyle = activePowerup.color || '#ffffff';
        ctx.fillRect(barX, barY, barW * ratio, barH);

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(activePowerup.label || activePowerup.id.toUpperCase(), W / 2, barY + barH + 10);

        ctx.restore();
    }

    function drawShieldAura() {
        if (!activePowerup || activePowerup.id !== 'shield') return;
        ctx.save();
        ctx.translate(bird.x, bird.y);
        var pulse = 1 + 0.1 * Math.sin(Date.now() / 200);
        var radius = Math.max(config.character.width, config.character.height) * 0.7 * pulse;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4 + 0.2 * Math.sin(Date.now() / 150);
        ctx.stroke();
        ctx.restore();
    }

    function drawBorderFlash() {
        if (borderFlashTimer <= 0) return;
        ctx.save();
        ctx.strokeStyle = borderFlashColor;
        ctx.lineWidth = 4;
        ctx.globalAlpha = borderFlashTimer / 300;
        ctx.strokeRect(2, 2, W - 4, H - 4);
        ctx.restore();
    }

    function drawObstacleIndicators(p) {
        // Moving pipe: draw up/down arrows
        if (p.type === 'moving') {
            ctx.save();
            ctx.fillStyle = config.theme.accentColor;
            ctx.globalAlpha = 0.5;
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('\u2195', p.x + p.width / 2, p.gapY + p.gapSize / 2 + 5);
            ctx.restore();
        }
        // Narrowing pipe: warning color on caps
        if (p.type === 'narrowing') {
            ctx.save();
            ctx.fillStyle = '#f59e0b';
            ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 200);
            ctx.fillRect(p.x - 4, p.gapY - 20, p.width + 8, 20);
            ctx.fillRect(p.x - 4, p.gapY + p.gapSize, p.width + 8, 20);
            ctx.restore();
        }
        // Split pipe: draw second gap region
        if (p.type === 'split' && p.gap2Y !== undefined) {
            // The middle section between the two gaps is solid pipe
            // Already handled in drawPipeSplit, just add indicator dots
            ctx.save();
            ctx.fillStyle = config.theme.accentColor;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.gapY + p.gapSize / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.gap2Y + p.gap2Size / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawPipeSplit(p) {
        // Split pipe renders 3 solid sections with 2 gaps
        var pc = config.pipes;

        ctx.save();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(p.x + 4, 0, p.width, p.gapY - 2);
        ctx.fillRect(p.x + 4, p.gapY + p.gapSize + 2, p.width, p.gap2Y - p.gapY - p.gapSize - 2);
        ctx.fillRect(p.x + 4, p.gap2Y + p.gap2Size + 2, p.width, H - GROUND_H - p.gap2Y - p.gap2Size);

        // Top section: shaded body + cap (shared helpers keep this in sync with drawPipe)
        drawPipeSection(p.x, 0, p.width, p.gapY, pc);
        drawPipeCap(p.x, p.gapY - 20, p.width, pc);

        // Middle section (between the two gaps): body + a cap on each edge
        drawPipeSection(p.x, p.gapY + p.gapSize, p.width, p.gap2Y - p.gapY - p.gapSize, pc);
        drawPipeCap(p.x, p.gapY + p.gapSize, p.width, pc);
        drawPipeCap(p.x, p.gap2Y - 20, p.width, pc);

        // Bottom section: shaded body + cap
        drawPipeSection(p.x, p.gap2Y + p.gap2Size, p.width, H - GROUND_H - p.gap2Y - p.gap2Size, pc);
        drawPipeCap(p.x, p.gap2Y + p.gap2Size, p.width, pc);

        // Border strokes
        ctx.strokeStyle = pc.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, p.width, p.gapY);
        ctx.strokeRect(p.x, p.gapY + p.gapSize, p.width, p.gap2Y - p.gapY - p.gapSize);
        ctx.strokeRect(p.x, p.gap2Y + p.gap2Size, p.width, H - GROUND_H - p.gap2Y - p.gap2Size);
        ctx.restore();

        // Decoration hook — wrapped so it always gets clean ctx state.
        if (config.pipes.drawDecoration) {
            ctx.save();
            config.pipes.drawDecoration(ctx, p);
            ctx.restore();
        }
    }

    function drawEventVisuals() {
        if (!activeEvent) return;

        if (activeEvent.type === 'wind') {
            // Diagonal wind lines
            ctx.save();
            ctx.strokeStyle = config.theme.accentColor || '#ffffff';
            ctx.globalAlpha = 0.15;
            ctx.lineWidth = 1;
            for (var i = 0; i < windParticles.length; i++) {
                var wp = windParticles[i];
                ctx.beginPath();
                ctx.moveTo(wp.x, wp.y);
                var dir = activeEvent.direction === 'left' ? -1 : 1;
                ctx.lineTo(wp.x + dir * 15, wp.y + 8);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (activeEvent.type === 'fog') {
            ctx.save();
            ctx.fillStyle = '#0f172a';
            ctx.globalAlpha = activeEvent.opacity || 0.3;
            ctx.fillRect(0, 0, W, H - GROUND_H);
            ctx.restore();
        }

        // Turbulence shake is applied via shakeOffset in render()
    }

    function drawMenuScreen() {
        // Dim overlay
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.save();
        ctx.fillStyle = config.theme.accentColor;
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = config.theme.accentColor;
        ctx.shadowBlur = 15;
        ctx.fillText(config.title || 'FLAPPY', W / 2, H / 2 - 80);
        ctx.restore();

        // Character name
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('You are ' + (config.character.name || 'BIRD-1'), W / 2, H / 2 - 50);

        // High score
        if (highScore > 0) {
            ctx.fillStyle = config.theme.accentColor;
            ctx.font = '14px Courier New';
            ctx.fillText('HIGH SCORE: ' + highScore, W / 2, H / 2 - 20);
        }

        // Instructions
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Courier New';
        ctx.fillText('SPACE / CLICK to flap', W / 2, H / 2 + 20);

        // Prompt
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
        ctx.globalAlpha = 0.5 + pulse * 0.5;
        ctx.fillStyle = config.theme.accentColor;
        ctx.font = 'bold 20px Courier New';
        ctx.fillText('PRESS ANY KEY TO START', W / 2, H / 2 + 70);
        ctx.globalAlpha = 1;
    }

    function drawDeadScreen() {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillText('GAME OVER', W / 2, H / 2 - 70);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Score: ' + score, W / 2, H / 2 - 30);

        if (score >= highScore && score > 0) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 16px Courier New';
            ctx.fillText('NEW HIGH SCORE!', W / 2, H / 2);
        } else {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Courier New';
            ctx.fillText('Best: ' + highScore, W / 2, H / 2);
        }

        // Milestone fact
        if (config.milestones && score > 0) {
            const fact = getHighestMilestone(score);
            if (fact) {
                ctx.fillStyle = config.theme.accentColor;
                ctx.font = '12px Courier New';
                const lines = wrapText(fact, 34);
                lines.forEach(function (line, idx) {
                    ctx.fillText(line, W / 2, H / 2 + 30 + idx * 16);
                });
            }
        }

        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
        ctx.globalAlpha = 0.5 + pulse * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Courier New';
        ctx.fillText('PRESS ANY KEY TO RETRY', W / 2, H / 2 + 100);
        ctx.globalAlpha = 1;
    }

    function wrapText(text, maxChars) {
        const words = text.split(' ');
        const lines = [];
        let current = '';
        words.forEach(function (word) {
            if ((current + ' ' + word).trim().length > maxChars) {
                if (current) lines.push(current.trim());
                current = word;
            } else {
                current = current ? current + ' ' + word : word;
            }
        });
        if (current) lines.push(current.trim());
        return lines;
    }

    // ── Milestones ──────────────────────────────────────────────────────
    function checkMilestones() {
        if (!config.milestones) return;
        const milestoneScores = Object.keys(config.milestones).map(Number).sort(function (a, b) { return a - b; });
        for (let i = 0; i < milestoneScores.length; i++) {
            const ms = milestoneScores[i];
            if (score >= ms && lastMilestone < ms) {
                lastMilestone = ms;
                if (config.onMilestone) config.onMilestone(ms, config.milestones[ms]);
            }
        }
    }

    function getHighestMilestone(s) {
        if (!config.milestones) return null;
        const milestoneScores = Object.keys(config.milestones).map(Number).sort(function (a, b) { return b - a; });
        for (let i = 0; i < milestoneScores.length; i++) {
            if (s >= milestoneScores[i]) return config.milestones[milestoneScores[i]];
        }
        return null;
    }

    // ── Progressive Difficulty Events ──────────────────────────────────
    function checkProgressiveEvents() {
        if (!config.events) return;
        var thresholds = Object.keys(config.events).map(Number).sort(function (a, b) { return a - b; });
        for (var i = 0; i < thresholds.length; i++) {
            var t = thresholds[i];
            if (score >= t && !triggeredEvents[t]) {
                triggeredEvents[t] = true;
                var evt = config.events[t];
                activeEvent = {
                    type: evt.type,
                    direction: evt.direction || 'right',
                    strength: evt.strength || 0.5,
                    opacity: evt.opacity || 0.3,
                    intensity: evt.intensity || 1.5
                };
                // Reset wind particles for new wind event
                if (evt.type === 'wind') {
                    windParticles = [];
                }
            }
        }
    }

    // ── Game Loop ───────────────────────────────────────────────────────
    function update(dt) {
        if (state === 'playing') {
            // Bird physics
            bird.vy += GRAVITY;
            if (bird.vy > TERMINAL_VEL) bird.vy = TERMINAL_VEL;
            bird.y += bird.vy;

            // Hook: onBirdUpdate — custom per-frame physics
            if (config.hooks && typeof config.hooks.onBirdUpdate === 'function') {
                config.hooks.onBirdUpdate(bird, dt);
            }

            // Wind event: push bird horizontally (manifests as y-drift since side-scroller)
            if (activeEvent && activeEvent.type === 'wind') {
                var windDir = activeEvent.direction === 'left' ? -1 : 1;
                bird.vy += (activeEvent.strength || 0.5) * windDir * dt * 30;
            }

            // Turbulence event: random y-velocity nudges
            if (activeEvent && activeEvent.type === 'turbulence') {
                var intensity = activeEvent.intensity || 1.5;
                bird.vy += (Math.random() - 0.5) * intensity * dt * 20;
                shakeOffset.x = (Math.random() - 0.5) * intensity * 2;
                shakeOffset.y = (Math.random() - 0.5) * intensity * 2;
            } else {
                // Ease shake offset back to zero
                shakeOffset.x *= 0.9;
                shakeOffset.y *= 0.9;
            }

            // Clamp to ground/ceiling (solid surfaces, not death)
            clampToSurfaces();

            // Flap frame decay
            if (bird.flapFrame > 0) bird.flapFrame -= dt * 5;
            if (bird.flapFrame < 0) bird.flapFrame = 0;

            // Difficulty ramp
            difficultyMultiplier = 1 + score * 0.015;
            var speedMult = 1;

            // Slow powerup: reduce pipe speed by 40%
            if (activePowerup && activePowerup.id === 'slow') {
                speedMult = 0.6;
            }

            var currentSpeed = basePipeSpeed * difficultyMultiplier * speedMult;

            // Pipe movement + obstacle type behaviors
            for (var i = pipes.length - 1; i >= 0; i--) {
                pipes[i].x -= currentSpeed * dt * 60;

                // Moving obstacle: sinusoidal gap shift
                if (pipes[i].type === 'moving') {
                    var elapsed = (pipes[i].spawnX - pipes[i].x) * 0.02;
                    var amplitude = 30;
                    pipes[i].gapY = pipes[i].originalGapY + Math.sin(elapsed + pipes[i].phase) * amplitude;
                    // Clamp to playable area
                    var minGapY = 60;
                    var maxGapY = H - GROUND_H - pipes[i].gapSize - 60;
                    if (pipes[i].gapY < minGapY) pipes[i].gapY = minGapY;
                    if (pipes[i].gapY > maxGapY) pipes[i].gapY = maxGapY;
                }

                // Narrowing obstacle: gap shrinks as pipe approaches bird
                if (pipes[i].type === 'narrowing') {
                    var progress = 1 - Math.max(0, Math.min(1, (pipes[i].x - bird.x) / (W * 0.6)));
                    var shrink = progress * 40; // narrows by up to 40px
                    pipes[i].gapSize = Math.max(pipes[i].originalGapSize - shrink, 70);
                    // Keep gap centered on original position
                    pipes[i].gapY = pipes[i].originalGapY + (pipes[i].originalGapSize - pipes[i].gapSize) / 2;
                }

                // Score check
                if (!pipes[i].scored && pipes[i].x + pipes[i].width < bird.x) {
                    pipes[i].scored = true;
                    var increment = scoreMultiplier;
                    score += increment;
                    // Consume multi powerup after use
                    if (scoreMultiplier > 1) {
                        scoreMultiplier = 1;
                        activePowerup = null;
                    }
                    playScore();
                    scorePopups.push({
                        x: bird.x,
                        y: bird.y - 30,
                        text: '+' + increment,
                        alpha: 1,
                        vy: -1.5
                    });

                    // Hook: onScoreChange
                    if (config.hooks && typeof config.hooks.onScoreChange === 'function') {
                        config.hooks.onScoreChange(score);
                    }
                    if (config.onScore) config.onScore(score);
                    checkMilestones();
                    checkProgressiveEvents();
                }

                // Remove off-screen pipes
                if (pipes[i].x + pipes[i].width < -20) {
                    pipes.splice(i, 1);
                }
            }

            // Pipe spawning
            pipeTimer += dt * 60 * (currentSpeed / basePipeSpeed);
            var spacing = config.pipes.spacing || 100;
            if (pipeTimer >= spacing) {
                pipeTimer = 0;
                spawnPipe();
            }

            // Power-up movement (move with pipes)
            for (var j = powerups.length - 1; j >= 0; j--) {
                powerups[j].x -= currentSpeed * dt * 60;
                if (powerups[j].x < -30 || powerups[j].collected) {
                    if (powerups[j].collected || powerups[j].x < -30) {
                        powerups.splice(j, 1);
                    }
                }
            }

            // Power-up collection check
            checkPowerupCollection();

            // Power-up timer expiration
            if (activePowerup && activePowerup.id !== 'multi' && activePowerup.endTime > 0) {
                if (Date.now() >= activePowerup.endTime) {
                    activePowerup = null;
                }
            }

            // Border flash decay
            if (borderFlashTimer > 0) {
                borderFlashTimer -= dt * 1000;
            }

            // Wind particles update
            if (activeEvent && activeEvent.type === 'wind') {
                var wDir = activeEvent.direction === 'left' ? -1 : 1;
                for (var wi = windParticles.length - 1; wi >= 0; wi--) {
                    windParticles[wi].x += wDir * 4;
                    windParticles[wi].y += 2;
                    if (windParticles[wi].x < -20 || windParticles[wi].x > W + 20 || windParticles[wi].y > H) {
                        windParticles[wi] = {
                            x: Math.random() * W,
                            y: Math.random() * -50,
                        };
                    }
                }
                // Ensure we have particles
                while (windParticles.length < 20) {
                    windParticles.push({
                        x: Math.random() * W,
                        y: Math.random() * H
                    });
                }
            }

            // Parallax scrolling
            var scrollSpeed = currentSpeed * dt * 60;
            bgLayers[0].offset += scrollSpeed * 0.3;
            bgLayers[1].offset += scrollSpeed * 0.6;
            bgLayers[2].offset += scrollSpeed * 0.9;
            groundOffset += scrollSpeed;

            // Score popups
            for (var k = scorePopups.length - 1; k >= 0; k--) {
                scorePopups[k].y += scorePopups[k].vy;
                scorePopups[k].alpha -= dt * 2;
                if (scorePopups[k].alpha <= 0) scorePopups.splice(k, 1);
            }

            // Collision
            if (checkCollision()) {
                die();
            }
        } else if (state === 'dead') {
            // Death tumble animation
            deathTimer += dt;
            deathVy += GRAVITY * 0.7;
            bird.y += deathVy;
            bird.rotation += 8;
            if (bird.y > H + 50) {
                // Bird off screen — hold dead screen
            }
            // Keep scrolling ground slowly
            groundOffset += 0.5;
        } else {
            // Menu — animate bird bobbing and ground scrolling
            bird.y = H / 2 - 20 + Math.sin(Date.now() / 300) * 10;
            bird.rotation = Math.sin(Date.now() / 500) * 5;
            groundOffset += 1;
            bgLayers[0].offset += 0.15;
            bgLayers[1].offset += 0.3;
            bgLayers[2].offset += 0.5;
        }
    }

    function render() {
        ctx.save();

        // Turbulence screen shake
        if (Math.abs(shakeOffset.x) > 0.1 || Math.abs(shakeOffset.y) > 0.1) {
            ctx.translate(shakeOffset.x, shakeOffset.y);
        }

        ctx.clearRect(-5, -5, W + 10, H + 10);
        drawBackground();

        // Event visuals (fog, wind) behind pipes
        drawEventVisuals();

        // Pipes
        for (var i = 0; i < pipes.length; i++) {
            drawPipe(pipes[i]);
        }

        // Power-up collectibles
        drawPowerups();

        drawGround();

        // Shield aura (drawn behind bird body but after ground)
        drawShieldAura();
        drawBird();

        if (state === 'playing' || state === 'dead') {
            drawScore();
            drawActivePowerupIndicator();
        }

        // Border flash effect
        drawBorderFlash();

        if (state === 'menu') {
            drawMenuScreen();
        } else if (state === 'dead') {
            drawDeadScreen();
        }

        ctx.restore();
    }

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;

        update(dt);
        render();

        animFrame = requestAnimationFrame(gameLoop);
    }

    // ── State Transitions ───────────────────────────────────────────────
    function startPlaying() {
        state = 'playing';
        score = 0;
        lastMilestone = 0;
        pipes = [];
        pipeTimer = 60; // spawn first pipe soon
        scorePopups = [];
        difficultyMultiplier = 1;

        // Reset power-up state
        powerups = [];
        activePowerup = null;
        scoreMultiplier = 1;
        borderFlashTimer = 0;
        borderFlashColor = '';

        // Reset progressive events
        activeEvent = null;
        triggeredEvents = {};
        windParticles = [];
        shakeOffset = { x: 0, y: 0 };

        bird.x = W * 0.25;
        bird.y = H / 2 - 30;
        bird.vy = 0;
        bird.rotation = 0;
        bird.flapFrame = 0;

        basePipeSpeed = config.pipes.speed || 2.5;
        baseGapSize = config.pipes.gapSize || 150;

        resumeAudio();
        startBgPulse();

        // Notify consumer so side panels can reset
        if (config.onStart) config.onStart();
    }

    function die() {
        if (state === 'dead') return;
        state = 'dead';
        deathTimer = 0;
        deathVy = -4;
        playCrash();
        stopBgPulse();
        saveHighScore();

        if (config.onGameOver) config.onGameOver(score);

        // GameTracker integration
        if (typeof GameTracker !== 'undefined' && config.trackerKey) {
            GameTracker.record(config.trackerKey, {
                score: score,
                result: 'failure'
            });
        }
    }

    function flap() {
        if (state === 'playing') {
            bird.vy = JUMP_VEL;
            bird.flapFrame = 1;
            playFlap();
        }
    }

    // ── Input Handling ──────────────────────────────────────────────────
    function handleKeyDown(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            handleInput();
        }
    }

    function handleInput() {
        resumeAudio();
        if (state === 'menu') {
            startPlaying();
            // First flap
            flap();
        } else if (state === 'playing') {
            flap();
        } else if (state === 'dead' && deathTimer > 0.8) {
            // Return to menu after brief delay
            state = 'menu';
            loadHighScore();
        }
    }

    function handleClick(e) {
        e.preventDefault();
        handleInput();
    }

    function handleTouch(e) {
        e.preventDefault();
        handleInput();
    }

    // ── Toggle Audio ────────────────────────────────────────────────────
    function toggleAudio() {
        audioEnabled = !audioEnabled;
        if (!audioEnabled) {
            stopBgPulse();
        } else if (state === 'playing') {
            startBgPulse();
        }
        return audioEnabled;
    }

    // ── Public API ──────────────────────────────────────────────────────
    function init(cfg) {
        config = cfg;

        // ── Apply defaults for new config sections ──────────────────────
        // Power-ups: disabled by default
        if (!config.powerups) {
            config.powerups = { enabled: false, types: [], spawnChance: 0 };
        }
        // Obstacles: standard pipes only by default
        if (!config.obstacles) {
            config.obstacles = { types: ['pipe'], scoreThresholds: {} };
        }
        // Progressive events: none by default
        if (!config.events) {
            config.events = null; // no events
        }
        // Hooks: empty by default
        if (!config.hooks) {
            config.hooks = {};
        }

        // Find or create canvas
        var container = document.getElementById(cfg.containerId);
        if (!container) {
            console.error('FlappyEngine: container not found:', cfg.containerId);
            return;
        }

        canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.imageRendering = 'pixelated';
        canvas.style.cursor = 'pointer';
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');

        // Apply border color from theme
        canvas.style.border = '3px solid ' + (config.theme.accentColor || '#06b6d4');

        // Audio init
        if (config.audio && config.audio.enabled !== false) {
            initAudio();
        } else {
            audioEnabled = false;
        }

        // Load high score
        loadHighScore();

        // Bird starting position
        bird.x = W * 0.25;
        bird.y = H / 2 - 30;

        basePipeSpeed = config.pipes.speed || 2.5;
        baseGapSize = config.pipes.gapSize || 150;

        // Input listeners
        document.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', handleTouch, { passive: false });

        // Start loop
        state = 'menu';
        lastTime = performance.now();
        animFrame = requestAnimationFrame(gameLoop);

        return {
            toggleAudio: toggleAudio,
            getScore: function () { return score; },
            getHighScore: function () { return highScore; },
            getState: function () { return state; },
            getPowerup: function () {
                if (!activePowerup) return null;
                return {
                    id: activePowerup.id,
                    remaining: activePowerup.endTime > 0
                        ? Math.max(0, activePowerup.endTime - Date.now())
                        : 0,
                    startTime: activePowerup.startTime
                };
            },
            destroy: function () {
                if (animFrame) cancelAnimationFrame(animFrame);
                document.removeEventListener('keydown', handleKeyDown);
                canvas.removeEventListener('click', handleClick);
                canvas.removeEventListener('touchstart', handleTouch);
                stopBgPulse();
                if (audioCtx) { try { audioCtx.close(); } catch (e) {} }
            }
        };
    }

    return { init: init };
})();
