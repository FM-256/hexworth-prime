/**
 * AmbientMusic.js
 * Procedural ambient music generator for Hexworth Prime
 *
 * Creates ethereal, evolving soundscapes using Web Audio API
 * Features house-themed musical variations and persistent settings
 *
 * @module AmbientMusic
 * @version 1.0.0
 */

const AmbientMusic = (function() {
    'use strict';

    // ============================================================================
    // PRIVATE STATE
    // ============================================================================

    let audioContext = null;
    let masterGain = null;
    let reverbGain = null;
    let isActive = false;

    // Layer-specific state
    let padOscillators = [];
    let padGain = null;
    let padFilter = null;
    let filterSweepInterval = null;

    let arpeggioGain = null;
    let arpeggioInterval = null;

    let shimmerSource = null;
    let shimmerGain = null;
    let shimmerFilter = null;

    let subBassOscillator = null;
    let subBassGain = null;
    let subBassLFO = null;

    // Configuration
    let currentHouse = 'shield';
    let currentVolume = 0.12;

    const STORAGE_KEY = 'hexworth_ambient_music';
    const LAYER_VOLUMES = {
        pad: 0.4,
        arpeggio: 0.15,
        shimmer: 0.08,
        subBass: 0.2
    };

    // ============================================================================
    // MUSICAL SCALES & HOUSE THEMES
    // ============================================================================

    const HOUSE_SCALES = {
        web: { root: 164.81, notes: [0, 3, 5, 7, 10] },        // E minor pentatonic
        shield: { root: 146.83, notes: [0, 3, 5, 7, 10] },     // D minor pentatonic
        cloud: { root: 196.00, notes: [0, 2, 4, 7, 9] },       // G major pentatonic
        forge: { root: 220.00, notes: [0, 3, 5, 7, 10] },      // A minor pentatonic
        script: { root: 130.81, notes: [0, 3, 5, 7, 10] },     // C minor pentatonic
        code: { root: 185.00, notes: [0, 3, 5, 7, 10] },       // F# minor pentatonic
        key: { root: 233.08, notes: [0, 3, 5, 7, 10] },        // Bb minor pentatonic
        eye: { root: 155.56, notes: [0, 3, 5, 7, 10] },        // Eb minor pentatonic
        'dark-arts': { root: 246.94, notes: [0, 3, 5, 7, 10] },// B minor pentatonic
        divergent: { root: 146.83, notes: [0, 3, 5, 7, 10] }   // Starts D minor, changes randomly
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Check if Web Audio API is supported
     */
    function isWebAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    /**
     * Get a frequency from the current scale
     */
    function getScaleFrequency(octaveOffset = 0, noteIndex = null) {
        const scale = HOUSE_SCALES[currentHouse];
        if (!scale) return 146.83; // Fallback to D

        const idx = noteIndex !== null ? noteIndex : Math.floor(Math.random() * scale.notes.length);
        const semitones = scale.notes[idx] + (octaveOffset * 12);
        return scale.root * Math.pow(2, semitones / 12);
    }

    /**
     * Load settings from localStorage
     */
    function loadSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                currentVolume = settings.volume ?? 0.12;
                currentHouse = settings.house ?? 'shield';
                return settings.enabled ?? true;
            }
        } catch (e) {
            console.warn('AmbientMusic: Failed to load settings', e);
        }
        return true;
    }

    /**
     * Save settings to localStorage
     */
    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                enabled: isActive,
                volume: currentVolume,
                house: currentHouse
            }));
        } catch (e) {
            console.warn('AmbientMusic: Failed to save settings', e);
        }
    }

    // ============================================================================
    // AUDIO INITIALIZATION
    // ============================================================================

    /**
     * Initialize AudioContext and core nodes
     */
    function initAudioContext() {
        if (!isWebAudioSupported()) {
            console.warn('AmbientMusic: Web Audio API not supported');
            return false;
        }

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();

            // Master gain
            masterGain = audioContext.createGain();
            masterGain.gain.value = currentVolume;

            // Reverb chain (simple delay-based reverb)
            reverbGain = createReverb();
            masterGain.connect(reverbGain);
            reverbGain.connect(audioContext.destination);

            return true;
        } catch (e) {
            console.error('AmbientMusic: Failed to initialize AudioContext', e);
            return false;
        }
    }

    /**
     * Create simple reverb using multiple delays
     */
    function createReverb() {
        const reverbNode = audioContext.createGain();
        reverbNode.gain.value = 1.0;

        const delays = [0.1, 0.23, 0.37, 0.51];
        const feedback = 0.35;

        delays.forEach(time => {
            const delay = audioContext.createDelay();
            delay.delayTime.value = time;

            const delayGain = audioContext.createGain();
            delayGain.gain.value = feedback;

            reverbNode.connect(delay);
            delay.connect(delayGain);
            delayGain.connect(delay); // Feedback loop
            delayGain.connect(audioContext.destination);
        });

        return reverbNode;
    }

    // ============================================================================
    // PAD/DRONE LAYER
    // ============================================================================

    function startPadLayer() {
        const now = audioContext.currentTime;

        // Create pad gain
        padGain = audioContext.createGain();
        padGain.gain.setValueAtTime(0, now);
        padGain.gain.linearRampToValueAtTime(LAYER_VOLUMES.pad, now + 3);

        // Create filter for sweeping
        padFilter = audioContext.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 500;
        padFilter.Q.value = 1;

        padGain.connect(padFilter);
        padFilter.connect(masterGain);

        // Two detuned oscillators for warmth
        const osc1 = audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = getScaleFrequency(-2, 0); // Root note, low octave
        osc1.detune.value = -5;
        osc1.connect(padGain);
        osc1.start();

        const osc2 = audioContext.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = getScaleFrequency(-2, 0);
        osc2.detune.value = 5;
        osc2.connect(padGain);
        osc2.start();

        padOscillators = [osc1, osc2];

        // Start filter sweep
        sweepFilter();
    }

    function sweepFilter() {
        if (!padFilter || !audioContext) return;

        const duration = 15 + Math.random() * 15; // 15-30 seconds
        const now = audioContext.currentTime;
        const minFreq = 200;
        const maxFreq = 800;
        const targetFreq = minFreq + Math.random() * (maxFreq - minFreq);

        padFilter.frequency.cancelScheduledValues(now);
        padFilter.frequency.setValueAtTime(padFilter.frequency.value, now);
        padFilter.frequency.linearRampToValueAtTime(targetFreq, now + duration);

        filterSweepInterval = setTimeout(sweepFilter, duration * 1000);
    }

    // ============================================================================
    // ARPEGGIO LAYER
    // ============================================================================

    function startArpeggioLayer() {
        const now = audioContext.currentTime;

        arpeggioGain = audioContext.createGain();
        arpeggioGain.gain.value = LAYER_VOLUMES.arpeggio;
        arpeggioGain.connect(masterGain);

        scheduleArpeggioNote();
    }

    function scheduleArpeggioNote() {
        if (!arpeggioGain || !audioContext) return;

        const now = audioContext.currentTime;
        const noteDelay = 2 + Math.random() * 2; // 2-4 seconds

        // Create oscillator for single note
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = getScaleFrequency(Math.floor(Math.random() * 2)); // Random octave (0 or 1)

        const noteGain = audioContext.createGain();
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + 0.3); // 0.3s attack
        noteGain.gain.linearRampToValueAtTime(0, now + 0.3 + 1.5); // 1.5s release

        osc.connect(noteGain);
        noteGain.connect(arpeggioGain);

        osc.start(now);
        osc.stop(now + 2); // Note duration

        arpeggioInterval = setTimeout(scheduleArpeggioNote, noteDelay * 1000);
    }

    // ============================================================================
    // SHIMMER LAYER
    // ============================================================================

    function startShimmerLayer() {
        const now = audioContext.currentTime;

        // Create buffer source with white noise
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        shimmerSource = audioContext.createBufferSource();
        shimmerSource.buffer = buffer;
        shimmerSource.loop = true;

        // High-pass filter for sparkle
        shimmerFilter = audioContext.createBiquadFilter();
        shimmerFilter.type = 'highpass';
        shimmerFilter.frequency.value = 2000 + Math.random() * 4000; // 2000-6000 Hz
        shimmerFilter.Q.value = 0.5;

        shimmerGain = audioContext.createGain();
        shimmerGain.gain.setValueAtTime(0, now);
        shimmerGain.gain.linearRampToValueAtTime(LAYER_VOLUMES.shimmer, now + 5);

        shimmerSource.connect(shimmerFilter);
        shimmerFilter.connect(shimmerGain);
        shimmerGain.connect(masterGain);

        shimmerSource.start();
    }

    // ============================================================================
    // SUB-BASS LAYER
    // ============================================================================

    function startSubBassLayer() {
        const now = audioContext.currentTime;

        // Sub-bass oscillator
        subBassOscillator = audioContext.createOscillator();
        subBassOscillator.type = 'sine';
        subBassOscillator.frequency.value = 40 + Math.random() * 20; // 40-60 Hz

        // LFO for volume modulation
        subBassLFO = audioContext.createOscillator();
        subBassLFO.type = 'sine';
        subBassLFO.frequency.value = 0.1; // Very slow (10 second cycle)

        const lfoGain = audioContext.createGain();
        lfoGain.gain.value = LAYER_VOLUMES.subBass * 0.5; // Modulation depth

        subBassGain = audioContext.createGain();
        subBassGain.gain.value = LAYER_VOLUMES.subBass * 0.5; // Base level

        subBassLFO.connect(lfoGain);
        lfoGain.connect(subBassGain.gain);

        subBassOscillator.connect(subBassGain);
        subBassGain.connect(masterGain);

        subBassLFO.start();
        subBassOscillator.start();
    }

    // ============================================================================
    // CLEANUP
    // ============================================================================

    function stopAllLayers() {
        const now = audioContext ? audioContext.currentTime : 0;

        // Clear intervals
        if (filterSweepInterval) clearTimeout(filterSweepInterval);
        if (arpeggioInterval) clearTimeout(arpeggioInterval);

        // Stop pad oscillators
        padOscillators.forEach(osc => {
            try { osc.stop(now); } catch (e) {}
        });
        padOscillators = [];

        // Stop shimmer
        if (shimmerSource) {
            try { shimmerSource.stop(now); } catch (e) {}
            shimmerSource = null;
        }

        // Stop sub-bass
        if (subBassOscillator) {
            try { subBassOscillator.stop(now); } catch (e) {}
            subBassOscillator = null;
        }
        if (subBassLFO) {
            try { subBassLFO.stop(now); } catch (e) {}
            subBassLFO = null;
        }

        // Disconnect nodes
        [padGain, padFilter, arpeggioGain, shimmerGain, shimmerFilter, subBassGain].forEach(node => {
            if (node) {
                try { node.disconnect(); } catch (e) {}
            }
        });

        padGain = null;
        padFilter = null;
        arpeggioGain = null;
        shimmerGain = null;
        shimmerFilter = null;
        subBassGain = null;
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================

    function start() {
        if (!isWebAudioSupported()) return false;
        if (isActive) return true;

        loadSettings();

        if (!audioContext) {
            if (!initAudioContext()) return false;
        }

        // Resume AudioContext (required for autoplay policy)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        isActive = true;

        // Start all layers
        startPadLayer();
        startArpeggioLayer();
        startShimmerLayer();
        startSubBassLayer();

        saveSettings();
        return true;
    }

    function stop() {
        if (!isActive) return;

        fadeOut(2).then(() => {
            stopAllLayers();
            isActive = false;
            saveSettings();
        });
    }

    function setVolume(value) {
        currentVolume = Math.max(0, Math.min(1, value));
        if (masterGain && audioContext) {
            const now = audioContext.currentTime;
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.setValueAtTime(masterGain.gain.value, now);
            masterGain.gain.linearRampToValueAtTime(currentVolume, now + 0.1);
        }
        saveSettings();
    }

    function getVolume() {
        return currentVolume;
    }

    function setHouse(houseName) {
        if (!HOUSE_SCALES[houseName]) {
            console.warn('AmbientMusic: Unknown house', houseName);
            return;
        }

        currentHouse = houseName;

        // If playing, restart to apply new scale
        if (isActive) {
            stopAllLayers();
            setTimeout(() => {
                startPadLayer();
                startArpeggioLayer();
                startShimmerLayer();
                startSubBassLayer();
            }, 100);
        }

        saveSettings();
    }

    function isPlaying() {
        return isActive;
    }

    function toggle() {
        if (isActive) {
            stop();
        } else {
            start();
        }
    }

    function fadeIn(duration = 3) {
        if (!masterGain || !audioContext) return Promise.resolve();

        const now = audioContext.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(currentVolume, now + duration);

        return new Promise(resolve => setTimeout(resolve, duration * 1000));
    }

    function fadeOut(duration = 3) {
        if (!masterGain || !audioContext) return Promise.resolve();

        const now = audioContext.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0, now + duration);

        return new Promise(resolve => setTimeout(resolve, duration * 1000));
    }

    // ============================================================================
    // RETURN PUBLIC API
    // ============================================================================

    /**
     * Get the AudioContext (for external AnalyserNode connections)
     */
    function getAudioContext() {
        return audioContext;
    }

    /**
     * Get the master output node (connect an AnalyserNode here to read frequency data)
     */
    function getOutputNode() {
        return masterGain;
    }

    return {
        start,
        stop,
        setVolume,
        getVolume,
        setHouse,
        isPlaying,
        toggle,
        fadeIn,
        fadeOut,
        getAudioContext,
        getOutputNode
    };

})();
