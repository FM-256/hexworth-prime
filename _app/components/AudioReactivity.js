/**
 * AudioReactivity.js
 * Bridges AmbientMusic frequency data to Digital Life behaviors
 *
 * Analyzes audio output in real-time and modulates firefly properties:
 *   - Bass energy → size pulses, black hole gravity spikes
 *   - Mid frequencies → movement speed, swarm cohesion
 *   - High frequencies → glow intensity, particle spawns
 *   - Overall energy → population activity level
 *
 * @module AudioReactivity
 * @version 1.0.0
 */

const AudioReactivity = (function() {
    'use strict';

    // ========================================================================
    // PRIVATE STATE
    // ========================================================================

    let analyser = null;
    let frequencyData = null;
    let animationId = null;
    let isActive = false;
    let digitalLifeRef = null;

    // Smoothed band values (prevents jitter)
    let bands = { bass: 0, mid: 0, treble: 0, energy: 0 };
    const SMOOTHING = 0.82; // Higher = smoother, slower reaction

    // Band frequency ranges (indices into 1024-bin FFT at 44100Hz sample rate)
    // Each bin = ~21.5Hz
    const BASS_START = 1;    // ~21Hz
    const BASS_END = 10;     // ~215Hz
    const MID_START = 10;    // ~215Hz
    const MID_END = 80;      // ~1720Hz
    const TREBLE_START = 80; // ~1720Hz
    const TREBLE_END = 300;  // ~6450Hz

    // Reactivity thresholds (0-1 normalized)
    const PULSE_THRESHOLD = 0.4;     // Bass level to trigger size pulse
    const PARTICLE_THRESHOLD = 0.5;  // Treble level to trigger sparkles
    const GRAVITY_THRESHOLD = 0.6;   // Bass level to spike black hole gravity

    // Cooldowns (prevent spam)
    let lastParticleSpawn = 0;
    let lastGravitySpike = 0;
    const PARTICLE_COOLDOWN = 200;   // ms
    const GRAVITY_COOLDOWN = 500;    // ms

    // ========================================================================
    // ANALYSIS
    // ========================================================================

    /**
     * Extract energy from a frequency band
     * Returns normalized 0-1 value
     */
    function getBandEnergy(startBin, endBin) {
        if (!frequencyData) return 0;
        let sum = 0;
        const count = endBin - startBin;
        for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
            // frequencyData values are 0-255 (Uint8Array from getByteFrequencyData)
            sum += frequencyData[i];
        }
        return count > 0 ? (sum / count) / 255 : 0;
    }

    /**
     * Main analysis loop — runs every animation frame
     */
    function analyze() {
        if (!isActive || !analyser) return;

        // Read frequency data
        analyser.getByteFrequencyData(frequencyData);

        // Extract band energies with smoothing
        const rawBass = getBandEnergy(BASS_START, BASS_END);
        const rawMid = getBandEnergy(MID_START, MID_END);
        const rawTreble = getBandEnergy(TREBLE_START, TREBLE_END);
        const rawEnergy = (rawBass * 0.4 + rawMid * 0.35 + rawTreble * 0.25);

        bands.bass = bands.bass * SMOOTHING + rawBass * (1 - SMOOTHING);
        bands.mid = bands.mid * SMOOTHING + rawMid * (1 - SMOOTHING);
        bands.treble = bands.treble * SMOOTHING + rawTreble * (1 - SMOOTHING);
        bands.energy = bands.energy * SMOOTHING + rawEnergy * (1 - SMOOTHING);

        // Apply effects to Digital Life
        applyEffects();

        animationId = requestAnimationFrame(analyze);
    }

    // ========================================================================
    // EFFECTS — Modulate Digital Life
    // ========================================================================

    function applyEffects() {
        if (!digitalLifeRef) return;

        const now = performance.now();
        const ecosystem = digitalLifeRef.ecosystem;
        if (!ecosystem) return;

        const fireflies = ecosystem.fireflies;
        if (!fireflies || fireflies.length === 0) return;

        // ---- BASS: Size pulse + black hole gravity ----
        if (bands.bass > PULSE_THRESHOLD) {
            const intensity = (bands.bass - PULSE_THRESHOLD) / (1 - PULSE_THRESHOLD);
            const scaleFactor = 1 + intensity * 0.4; // Up to 1.4x size

            for (const ff of fireflies) {
                if (ff.state === 'MATURE' || ff.state === 'GROWING') {
                    // Pulse size
                    ff._reactiveScale = scaleFactor;
                    // Pulse glow
                    if (ff.element) {
                        const glowSize = 4 + intensity * 12;
                        ff.element.style.textShadow = `0 0 ${glowSize}px currentColor`;
                    }
                }
            }

            // Spike black hole gravity on strong bass hits
            if (bands.bass > GRAVITY_THRESHOLD && now - lastGravitySpike > GRAVITY_COOLDOWN) {
                lastGravitySpike = now;
                if (digitalLifeRef.blackHole) {
                    const originalStrength = digitalLifeRef.blackHole.gravityStrength || 0.08;
                    digitalLifeRef.blackHole.gravityStrength = originalStrength * (1 + intensity * 0.8);
                    // Decay back over 300ms
                    setTimeout(() => {
                        if (digitalLifeRef.blackHole) {
                            digitalLifeRef.blackHole.gravityStrength = originalStrength;
                        }
                    }, 300);
                }
            }
        } else {
            // Reset scales when bass is quiet
            for (const ff of fireflies) {
                ff._reactiveScale = 1;
                if (ff.element) {
                    ff.element.style.textShadow = '';
                }
            }
        }

        // ---- MID: Speed modulation ----
        if (bands.mid > 0.1) {
            const speedBoost = 1 + bands.mid * 0.6; // Up to 1.6x speed
            for (const ff of fireflies) {
                ff.speedMultiplier = speedBoost;
            }
        } else {
            for (const ff of fireflies) {
                if (!ff._planetSpeedBoost) {
                    ff.speedMultiplier = 1;
                }
            }
        }

        // ---- TREBLE: Particle spawns ----
        if (bands.treble > PARTICLE_THRESHOLD && now - lastParticleSpawn > PARTICLE_COOLDOWN) {
            lastParticleSpawn = now;

            if (digitalLifeRef.particleSystem) {
                // Pick a random firefly position for sparkle
                const ff = fireflies[Math.floor(Math.random() * fireflies.length)];
                if (ff && ff.x && ff.y) {
                    const count = Math.floor(1 + bands.treble * 3);
                    const symbols = ['.', '*', '+', '\u2022', '\u2727'];
                    for (let i = 0; i < count; i++) {
                        digitalLifeRef.particleSystem.createParticle({
                            x: ff.x + (Math.random() - 0.5) * 30,
                            y: ff.y + (Math.random() - 0.5) * 30,
                            vx: (Math.random() - 0.5) * 1.5,
                            vy: (Math.random() - 0.5) * 1.5 - 0.5,
                            life: 600 + Math.random() * 400,
                            color: bands.energy > 0.5 ? '#fbbf24' : '#9f7aea',
                            size: 8 + Math.random() * 6,
                            text: symbols[Math.floor(Math.random() * symbols.length)],
                            type: 'audio-sparkle',
                            fadeRate: 0.03
                        });
                    }
                }
            }
        }

        // ---- OVERALL ENERGY: Wobble speed + reproduction bias ----
        for (const ff of fireflies) {
            // Higher energy = faster wobble (more lively movement)
            ff.wobbleSpeed = (ff._baseWobbleSpeed || ff.wobbleSpeed || 0.003) * (1 + bands.energy * 1.5);
        }
    }

    // ========================================================================
    // CLEANUP
    // ========================================================================

    function resetEffects() {
        if (!digitalLifeRef || !digitalLifeRef.ecosystem) return;

        const fireflies = digitalLifeRef.ecosystem.fireflies;
        if (!fireflies) return;

        for (const ff of fireflies) {
            ff._reactiveScale = 1;
            ff.speedMultiplier = ff._planetSpeedBoost || 1;
            if (ff.element) {
                ff.element.style.textShadow = '';
            }
        }
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    /**
     * Connect to AmbientMusic and a DigitalLife instance
     * @param {object} digitalLife - The DigitalLife instance (window.digitalLife)
     */
    function connect(digitalLife) {
        if (isActive) disconnect();

        if (typeof AmbientMusic === 'undefined' || !AmbientMusic.isPlaying()) {
            console.warn('AudioReactivity: AmbientMusic not playing — call connect() after music starts');
            return false;
        }

        const ctx = AmbientMusic.getAudioContext();
        const output = AmbientMusic.getOutputNode();
        if (!ctx || !output) {
            console.warn('AudioReactivity: Cannot access AmbientMusic audio nodes');
            return false;
        }

        digitalLifeRef = digitalLife;

        // Create analyser node
        analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;        // 1024 frequency bins
        analyser.smoothingTimeConstant = 0.8;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);

        // Tap into the signal chain (non-destructive — parallel connection)
        output.connect(analyser);

        // Cache base wobble speeds
        if (digitalLife.ecosystem) {
            for (const ff of digitalLife.ecosystem.fireflies) {
                ff._baseWobbleSpeed = ff.wobbleSpeed;
            }
        }

        isActive = true;
        animationId = requestAnimationFrame(analyze);

        console.log('AudioReactivity: Connected — fireflies will react to music');
        return true;
    }

    /**
     * Disconnect and reset all effects
     */
    function disconnect() {
        isActive = false;

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        if (analyser) {
            try { analyser.disconnect(); } catch (e) {}
            analyser = null;
        }

        resetEffects();
        frequencyData = null;
        digitalLifeRef = null;
        bands = { bass: 0, mid: 0, treble: 0, energy: 0 };

        console.log('AudioReactivity: Disconnected');
    }

    /**
     * Get current band levels (for UI visualizers)
     */
    function getBands() {
        return { ...bands };
    }

    /**
     * Check if currently active
     */
    function isConnected() {
        return isActive;
    }

    return {
        connect,
        disconnect,
        getBands,
        isConnected
    };

})();
