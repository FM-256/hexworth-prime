/**
 * BlacksiteAudio.js - Audio Management for BLACKSITE TERMINAL
 * Hexworth Prime - Grep & Pipe Mastery
 *
 * Procedurally generated sounds using Web Audio API:
 * - Fuse sizzle/crackle
 * - Ticking clock
 * - Heartbeat (tension)
 * - Explosion boom
 * - Success chime
 * - Ambient hum
 * - Radio static
 *
 * No external audio files required.
 *
 * Version: 1.0.0
 */

const BlacksiteAudio = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // AUDIO CONTEXT & STATE
    // ═══════════════════════════════════════════════════════════════

    let audioContext = null;
    let masterGain = null;
    let isInitialized = false;
    let isMuted = false;
    let masterVolume = 0.5;

    // Active sound loops
    let activeLoops = {
        fuse: null,
        tick: null,
        heartbeat: null,
        ambient: null
    };


    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    function init() {
        if (isInitialized) return true;

        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioContext.createGain();
            masterGain.connect(audioContext.destination);
            masterGain.gain.value = masterVolume;
            isInitialized = true;
            return true;
        } catch (e) {
            console.warn('[BlacksiteAudio] Web Audio API not supported:', e);
            return false;
        }
    }

    // Resume audio context (needed after user interaction)
    function resume() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function createOscillator(type, frequency) {
        const osc = audioContext.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;
        return osc;
    }

    function createGain(value = 1) {
        const gain = audioContext.createGain();
        gain.gain.value = value;
        return gain;
    }

    function createNoiseBuffer(duration = 1) {
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    function createBrownNoiseBuffer(duration = 1) {
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Amplify
        }

        return buffer;
    }

    function createFilter(type, frequency, Q = 1) {
        const filter = audioContext.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = Q;
        return filter;
    }


    // ═══════════════════════════════════════════════════════════════
    // SOUND GENERATORS
    // ═══════════════════════════════════════════════════════════════

    // Fuse sizzle - continuous crackling sound
    function createFuseSizzle() {
        if (!isInitialized || isMuted) return null;

        const now = audioContext.currentTime;

        // Noise source
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(2);
        noiseSource.loop = true;

        // Bandpass filter for crackle character
        const filter = createFilter('bandpass', 3000, 5);

        // Gain for volume control
        const gain = createGain(0.08);

        // LFO for variation
        const lfo = createOscillator('sine', 8);
        const lfoGain = createGain(0.03);
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        // Connect chain
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        // Start
        lfo.start(now);
        noiseSource.start(now);

        return {
            stop: () => {
                gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
                setTimeout(() => {
                    try {
                        lfo.stop();
                        noiseSource.stop();
                    } catch (e) {}
                }, 150);
            },
            setVolume: (v) => {
                gain.gain.setValueAtTime(v * 0.08, audioContext.currentTime);
            }
        };
    }

    // Tick sound - clock ticking
    function createTick() {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;

        // Click oscillator
        const osc = createOscillator('sine', 1000);
        const gain = createGain(0.15);

        // Quick decay envelope
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Heartbeat - low thump
    function createHeartbeat(intensity = 1) {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;

        // Low frequency thump
        const osc = createOscillator('sine', 60);
        const gain = createGain(0);

        // Double-beat envelope (lub-dub)
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3 * intensity, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        // Second beat
        gain.gain.setValueAtTime(0, now + 0.2);
        gain.gain.linearRampToValueAtTime(0.2 * intensity, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Explosion - big boom with rumble
    function createExplosion() {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;

        // Initial crack (high frequency transient)
        const crack = audioContext.createBufferSource();
        crack.buffer = createNoiseBuffer(0.1);
        const crackFilter = createFilter('highpass', 2000);
        const crackGain = createGain(0.5);
        crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        crack.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(masterGain);
        crack.start(now);

        // Main boom (low frequency)
        const boom = createOscillator('sine', 40);
        const boomGain = createGain(0.6);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        boom.frequency.exponentialRampToValueAtTime(20, now + 1);
        boom.connect(boomGain);
        boomGain.connect(masterGain);
        boom.start(now);
        boom.stop(now + 1.5);

        // Rumble (brown noise)
        const rumble = audioContext.createBufferSource();
        rumble.buffer = createBrownNoiseBuffer(3);
        const rumbleFilter = createFilter('lowpass', 200);
        const rumbleGain = createGain(0.4);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        rumble.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(masterGain);
        rumble.start(now);
    }

    // Success chime - ascending tones
    function createSuccessChime() {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = createOscillator('sine', freq);
            const gain = createGain(0);

            const startTime = now + i * 0.15;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    }

    // Wire cut sound - snip
    function createWireCut() {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;

        // High transient click
        const click = audioContext.createBufferSource();
        click.buffer = createNoiseBuffer(0.02);
        const filter = createFilter('highpass', 4000);
        const gain = createGain(0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        click.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        click.start(now);
    }

    // Wrong answer buzzer
    function createBuzzer() {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;

        const osc = createOscillator('sawtooth', 150);
        const gain = createGain(0.2);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Ambient hum - low electronic drone
    function createAmbientHum() {
        if (!isInitialized || isMuted) return null;

        const now = audioContext.currentTime;

        // Low drone
        const osc1 = createOscillator('sine', 60);
        const osc2 = createOscillator('sine', 62); // Slight detune for movement
        const gain = createGain(0.03);

        // Slow LFO for movement
        const lfo = createOscillator('sine', 0.1);
        const lfoGain = createGain(3);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);

        return {
            stop: () => {
                gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
                setTimeout(() => {
                    try {
                        lfo.stop();
                        osc1.stop();
                        osc2.stop();
                    } catch (e) {}
                }, 600);
            }
        };
    }

    // Radio static burst
    function createRadioStatic(duration = 0.3) {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;

        const noise = audioContext.createBufferSource();
        noise.buffer = createNoiseBuffer(duration);
        const filter = createFilter('bandpass', 1500, 2);
        const gain = createGain(0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(now);
    }

    // Keypress sound (terminal input)
    function createKeypress() {
        if (!isInitialized || isMuted) return;

        const now = audioContext.currentTime;

        const noise = audioContext.createBufferSource();
        noise.buffer = createNoiseBuffer(0.02);
        const filter = createFilter('highpass', 3000);
        const gain = createGain(0.05);

        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(now);
    }


    // ═══════════════════════════════════════════════════════════════
    // LOOP MANAGERS
    // ═══════════════════════════════════════════════════════════════

    // Start tick loop (interval-based)
    function startTickLoop(intervalMs = 1000) {
        if (activeLoops.tick) return;

        activeLoops.tick = setInterval(() => {
            createTick();
        }, intervalMs);
    }

    function stopTickLoop() {
        if (activeLoops.tick) {
            clearInterval(activeLoops.tick);
            activeLoops.tick = null;
        }
    }

    // Start heartbeat loop
    function startHeartbeatLoop(bpm = 80, intensity = 1) {
        if (activeLoops.heartbeat) return;

        const intervalMs = (60 / bpm) * 1000;
        activeLoops.heartbeat = setInterval(() => {
            createHeartbeat(intensity);
        }, intervalMs);
    }

    function stopHeartbeatLoop() {
        if (activeLoops.heartbeat) {
            clearInterval(activeLoops.heartbeat);
            activeLoops.heartbeat = null;
        }
    }

    // Start fuse sizzle
    function startFuseSizzle() {
        if (activeLoops.fuse) return;
        activeLoops.fuse = createFuseSizzle();
    }

    function stopFuseSizzle() {
        if (activeLoops.fuse) {
            activeLoops.fuse.stop();
            activeLoops.fuse = null;
        }
    }

    // Start ambient hum
    function startAmbient() {
        if (activeLoops.ambient) return;
        activeLoops.ambient = createAmbientHum();
    }

    function stopAmbient() {
        if (activeLoops.ambient) {
            activeLoops.ambient.stop();
            activeLoops.ambient = null;
        }
    }

    // Stop all loops
    function stopAll() {
        stopTickLoop();
        stopHeartbeatLoop();
        stopFuseSizzle();
        stopAmbient();
    }


    // ═══════════════════════════════════════════════════════════════
    // TENSION SYSTEM
    // Higher tension = faster tick, heartbeat kicks in
    // ═══════════════════════════════════════════════════════════════

    function setTensionLevel(level) {
        // level 0-1 (0 = calm, 1 = critical)
        if (!isInitialized) return;

        // Adjust tick rate
        stopTickLoop();
        if (level > 0) {
            const tickInterval = Math.max(200, 1000 - (level * 800));
            startTickLoop(tickInterval);
        }

        // Start heartbeat at high tension
        if (level > 0.5) {
            stopHeartbeatLoop();
            const bpm = 80 + (level - 0.5) * 100; // 80-130 bpm
            startHeartbeatLoop(bpm, level);
        } else {
            stopHeartbeatLoop();
        }

        // Adjust fuse sizzle volume
        if (activeLoops.fuse) {
            activeLoops.fuse.setVolume(0.5 + level * 0.5);
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // VOLUME & MUTE CONTROLS
    // ═══════════════════════════════════════════════════════════════

    function setVolume(value) {
        masterVolume = Math.max(0, Math.min(1, value));
        if (masterGain) {
            masterGain.gain.setValueAtTime(masterVolume, audioContext.currentTime);
        }
    }

    function getVolume() {
        return masterVolume;
    }

    function mute() {
        isMuted = true;
        if (masterGain) {
            masterGain.gain.setValueAtTime(0, audioContext.currentTime);
        }
    }

    function unmute() {
        isMuted = false;
        if (masterGain) {
            masterGain.gain.setValueAtTime(masterVolume, audioContext.currentTime);
        }
    }

    function toggleMute() {
        if (isMuted) {
            unmute();
        } else {
            mute();
        }
        return isMuted;
    }

    function getIsMuted() {
        return isMuted;
    }


    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        // Initialization
        init: init,
        resume: resume,

        // One-shot sounds
        tick: createTick,
        heartbeat: createHeartbeat,
        explosion: createExplosion,
        success: createSuccessChime,
        wireCut: createWireCut,
        buzzer: createBuzzer,
        radioStatic: createRadioStatic,
        keypress: createKeypress,

        // Loops
        startTick: startTickLoop,
        stopTick: stopTickLoop,
        startHeartbeat: startHeartbeatLoop,
        stopHeartbeat: stopHeartbeatLoop,
        startFuse: startFuseSizzle,
        stopFuse: stopFuseSizzle,
        startAmbient: startAmbient,
        stopAmbient: stopAmbient,
        stopAll: stopAll,

        // Tension system
        setTension: setTensionLevel,

        // Volume
        setVolume: setVolume,
        getVolume: getVolume,
        mute: mute,
        unmute: unmute,
        toggleMute: toggleMute,
        isMuted: getIsMuted
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlacksiteAudio;
}
