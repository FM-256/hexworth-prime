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
    function spawnPipe() {
        const gapSize = Math.max(baseGapSize - difficultyMultiplier * 2, 100);
        const minY = 80;
        const maxY = H - GROUND_H - gapSize - 80;
        const gapY = minY + Math.random() * (maxY - minY);

        pipes.push({
            x: W + 10,
            gapY: gapY,
            gapSize: gapSize,
            width: 52,
            scored: false,
            // Random decoration text for themed pipes
            label: config.pipes.labels ? config.pipes.labels[Math.floor(Math.random() * config.pipes.labels.length)] : ''
        });
    }

    // ── Collision Detection ─────────────────────────────────────────────
    function checkCollision() {
        const bw = config.character.width;
        const bh = config.character.height;
        const bx = bird.x - bw / 2;
        const by = bird.y - bh / 2;

        // Ground
        if (bird.y + bh / 2 >= H - GROUND_H) return true;
        // Ceiling
        if (bird.y - bh / 2 <= 0) return true;

        // Pipes
        for (let i = 0; i < pipes.length; i++) {
            const p = pipes[i];
            // Pipe rects
            const pLeft = p.x;
            const pRight = p.x + p.width;

            if (bx + bw > pLeft && bx < pRight) {
                // Top pipe
                if (by < p.gapY) return true;
                // Bottom pipe
                if (by + bh > p.gapY + p.gapSize) return true;
            }
        }
        return false;
    }

    // ── Drawing ─────────────────────────────────────────────────────────
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

        // Parallax layer 2 — mid-ground shapes
        ctx.globalAlpha = 0.07;
        for (let i = 0; i < 8; i++) {
            const px = ((i * 211 + bgLayers[1].offset * 0.5) % (W + 120)) - 60;
            const py = H - GROUND_H - 40 - (i * 37) % 80;
            ctx.fillRect(px, py, 60 + (i % 3) * 20, 40);
        }

        // Parallax layer 3 — near-ground elements
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < 12; i++) {
            const px = ((i * 173 + bgLayers[2].offset * 0.8) % (W + 80)) - 40;
            const py = H - GROUND_H - 20 - (i * 23) % 30;
            ctx.fillRect(px, py, 30, 20);
        }
        ctx.globalAlpha = 1;
    }

    function drawGround() {
        const bg = config.background;
        ctx.fillStyle = bg.groundColor;
        ctx.fillRect(0, H - GROUND_H, W, GROUND_H);

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
        const pc = config.pipes;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(p.x + 4, 0, p.width, p.gapY - 2);
        ctx.fillRect(p.x + 4, p.gapY + p.gapSize + 2, p.width, H - GROUND_H - p.gapY - p.gapSize);

        // Top pipe body
        ctx.fillStyle = pc.color;
        ctx.fillRect(p.x, 0, p.width, p.gapY);
        // Top pipe cap
        ctx.fillStyle = pc.borderColor;
        ctx.fillRect(p.x - 4, p.gapY - 20, p.width + 8, 20);

        // Bottom pipe body
        ctx.fillStyle = pc.color;
        ctx.fillRect(p.x, p.gapY + p.gapSize, p.width, H - GROUND_H - p.gapY - p.gapSize);
        // Bottom pipe cap
        ctx.fillStyle = pc.borderColor;
        ctx.fillRect(p.x - 4, p.gapY + p.gapSize, p.width + 8, 20);

        // Pipe border lines
        ctx.strokeStyle = pc.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, p.width, p.gapY);
        ctx.strokeRect(p.x, p.gapY + p.gapSize, p.width, H - GROUND_H - p.gapY - p.gapSize);

        // Pipe decoration: custom draw function if provided
        if (config.pipes.drawDecoration) {
            config.pipes.drawDecoration(ctx, p);
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

    // ── Game Loop ───────────────────────────────────────────────────────
    function update(dt) {
        if (state === 'playing') {
            // Bird physics
            bird.vy += GRAVITY;
            if (bird.vy > TERMINAL_VEL) bird.vy = TERMINAL_VEL;
            bird.y += bird.vy;

            // Flap frame decay
            if (bird.flapFrame > 0) bird.flapFrame -= dt * 5;
            if (bird.flapFrame < 0) bird.flapFrame = 0;

            // Difficulty ramp
            difficultyMultiplier = 1 + score * 0.015;
            const currentSpeed = basePipeSpeed * difficultyMultiplier;

            // Pipe movement
            for (let i = pipes.length - 1; i >= 0; i--) {
                pipes[i].x -= currentSpeed * dt * 60;

                // Score check
                if (!pipes[i].scored && pipes[i].x + pipes[i].width < bird.x) {
                    pipes[i].scored = true;
                    score++;
                    playScore();
                    scorePopups.push({
                        x: bird.x,
                        y: bird.y - 30,
                        text: '+1',
                        alpha: 1,
                        vy: -1.5
                    });
                    if (config.onScore) config.onScore(score);
                    checkMilestones();
                }

                // Remove off-screen pipes
                if (pipes[i].x + pipes[i].width < -20) {
                    pipes.splice(i, 1);
                }
            }

            // Pipe spawning
            pipeTimer += dt * 60 * (currentSpeed / basePipeSpeed);
            const spacing = config.pipes.spacing || 100;
            if (pipeTimer >= spacing) {
                pipeTimer = 0;
                spawnPipe();
            }

            // Parallax scrolling
            const scrollSpeed = currentSpeed * dt * 60;
            bgLayers[0].offset += scrollSpeed * 0.3;
            bgLayers[1].offset += scrollSpeed * 0.6;
            bgLayers[2].offset += scrollSpeed * 0.9;
            groundOffset += scrollSpeed;

            // Score popups
            for (let i = scorePopups.length - 1; i >= 0; i--) {
                scorePopups[i].y += scorePopups[i].vy;
                scorePopups[i].alpha -= dt * 2;
                if (scorePopups[i].alpha <= 0) scorePopups.splice(i, 1);
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
        ctx.clearRect(0, 0, W, H);
        drawBackground();

        // Pipes
        for (let i = 0; i < pipes.length; i++) {
            drawPipe(pipes[i]);
        }

        drawGround();
        drawBird();

        if (state === 'playing' || state === 'dead') {
            drawScore();
        }

        if (state === 'menu') {
            drawMenuScreen();
        } else if (state === 'dead') {
            drawDeadScreen();
        }
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

        bird.x = W * 0.25;
        bird.y = H / 2 - 30;
        bird.vy = 0;
        bird.rotation = 0;
        bird.flapFrame = 0;

        basePipeSpeed = config.pipes.speed || 2.5;
        baseGapSize = config.pipes.gapSize || 150;

        resumeAudio();
        startBgPulse();
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

        // Find or create canvas
        const container = document.getElementById(cfg.containerId);
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
