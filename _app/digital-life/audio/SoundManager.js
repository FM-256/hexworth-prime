/**
 * SoundManager.js - Core Audio Infrastructure
 *
 * Manages the Web Audio API context and provides
 * centralized control for all Digital Life sounds.
 *
 * Features:
 * - Lazy AudioContext initialization (user gesture required)
 * - Master volume control
 * - Category volumes (ambient, events, UI)
 * - Mute/unmute functionality
 * - Performance-friendly sound limiting
 */

class SoundManager {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,
            masterVolume: config.masterVolume ?? 0.5,
            ambientVolume: config.ambientVolume ?? 0.3,
            eventVolume: config.eventVolume ?? 0.6,
            uiVolume: config.uiVolume ?? 0.5,
            maxConcurrentSounds: config.maxConcurrentSounds ?? 12,
            ...config
        };

        // AudioContext (lazy initialized)
        this.audioContext = null;
        this.isInitialized = false;

        // Master gain node
        this.masterGain = null;

        // Category gain nodes
        this.ambientGain = null;
        this.eventGain = null;
        this.uiGain = null;

        // Track active sounds for limiting
        this.activeSounds = new Set();

        // Mute state
        this.isMuted = false;
        this.preMuteVolume = this.config.masterVolume;

        // Callbacks
        this.onReady = null;
    }

    /**
     * Initialize the audio context (must be called after user gesture)
     */
    init() {
        if (this.isInitialized) return this;

        try {
            // Create AudioContext
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn('🔇 Web Audio API not supported');
                this.config.enabled = false;
                return this;
            }

            this.audioContext = new AudioContext();

            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.config.masterVolume;
            this.masterGain.connect(this.audioContext.destination);

            // Create category gain nodes
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = this.config.ambientVolume;
            this.ambientGain.connect(this.masterGain);

            this.eventGain = this.audioContext.createGain();
            this.eventGain.gain.value = this.config.eventVolume;
            this.eventGain.connect(this.masterGain);

            this.uiGain = this.audioContext.createGain();
            this.uiGain.gain.value = this.config.uiVolume;
            this.uiGain.connect(this.masterGain);

            this.isInitialized = true;

            // Resume context if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            console.log('🔊 Sound manager initialized');

            if (this.onReady) {
                this.onReady();
            }

        } catch (e) {
            console.error('🔇 Failed to initialize audio:', e);
            this.config.enabled = false;
        }

        return this;
    }

    /**
     * Ensure audio context is ready (call before playing sounds)
     */
    ensureReady() {
        if (!this.isInitialized) {
            this.init();
        }

        // Resume if suspended
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        return this.isInitialized && this.config.enabled;
    }

    /**
     * Get current audio time
     */
    now() {
        return this.audioContext?.currentTime ?? 0;
    }

    /**
     * Create an oscillator with envelope
     * @param {Object} options - Oscillator options
     * @returns {Object} - { oscillator, gainNode }
     */
    createTone(options = {}) {
        if (!this.ensureReady()) return null;

        const {
            frequency = 440,
            type = 'sine',          // sine, square, triangle, sawtooth
            duration = 0.3,
            attack = 0.01,
            decay = 0.1,
            sustain = 0.3,
            release = 0.2,
            volume = 0.5,
            category = 'event',     // ambient, event, ui
            detune = 0
        } = options;

        // Check sound limit
        if (this.activeSounds.size >= this.config.maxConcurrentSounds) {
            return null;
        }

        const now = this.now();

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.detune.value = detune;

        // Create envelope gain
        const envelopeGain = this.audioContext.createGain();
        envelopeGain.gain.value = 0;

        // ADSR envelope
        const totalDuration = attack + decay + duration + release;
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(volume, now + attack);
        envelopeGain.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
        envelopeGain.gain.setValueAtTime(volume * sustain, now + attack + decay + duration);
        envelopeGain.gain.linearRampToValueAtTime(0, now + totalDuration);

        // Connect to category gain
        const categoryGain = this.getCategoryGain(category);
        oscillator.connect(envelopeGain);
        envelopeGain.connect(categoryGain);

        // Track active sound
        const soundId = 'snd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        this.activeSounds.add(soundId);

        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + totalDuration + 0.1);

        // Clean up when done
        oscillator.onended = () => {
            this.activeSounds.delete(soundId);
            envelopeGain.disconnect();
        };

        return { oscillator, gainNode: envelopeGain, duration: totalDuration };
    }

    /**
     * Create noise (white, pink, brown)
     * @param {Object} options - Noise options
     * @returns {Object} - { bufferSource, gainNode }
     */
    createNoise(options = {}) {
        if (!this.ensureReady()) return null;

        const {
            type = 'white',         // white, pink, brown
            duration = 1.0,
            attack = 0.1,
            release = 0.3,
            volume = 0.1,
            category = 'ambient'
        } = options;

        const now = this.now();
        const sampleRate = this.audioContext.sampleRate;
        const bufferSize = sampleRate * (duration + release);

        // Create noise buffer
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);

        // Generate noise
        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
            // Pink noise approximation using Paul Kellet's method
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        } else if (type === 'brown') {
            // Brown noise (random walk)
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for volume loss
            }
        }

        // Create buffer source
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // Create envelope
        const envelopeGain = this.audioContext.createGain();
        envelopeGain.gain.value = 0;
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(volume, now + attack);
        envelopeGain.gain.setValueAtTime(volume, now + duration);
        envelopeGain.gain.linearRampToValueAtTime(0, now + duration + release);

        // Connect
        const categoryGain = this.getCategoryGain(category);
        source.connect(envelopeGain);
        envelopeGain.connect(categoryGain);

        // Track
        const soundId = 'noise_' + Date.now();
        this.activeSounds.add(soundId);

        source.start(now);

        source.onended = () => {
            this.activeSounds.delete(soundId);
            envelopeGain.disconnect();
        };

        return { source, gainNode: envelopeGain };
    }

    /**
     * Play a simple beep/tone
     */
    playTone(frequency, duration = 0.15, volume = 0.3, category = 'event') {
        return this.createTone({
            frequency,
            duration,
            volume,
            category,
            attack: 0.01,
            decay: 0.05,
            sustain: 0.5,
            release: 0.1
        });
    }

    /**
     * Play a chord (multiple frequencies)
     */
    playChord(frequencies, duration = 0.3, volume = 0.2, category = 'event') {
        const volumePerNote = volume / Math.sqrt(frequencies.length);
        return frequencies.map(freq =>
            this.createTone({
                frequency: freq,
                duration,
                volume: volumePerNote,
                category,
                attack: 0.02,
                decay: 0.1,
                sustain: 0.4,
                release: 0.2
            })
        );
    }

    /**
     * Play an arpeggio (notes in sequence)
     */
    playArpeggio(frequencies, noteLength = 0.1, overlap = 0.05, volume = 0.3, category = 'event') {
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.createTone({
                    frequency: freq,
                    duration: noteLength,
                    volume,
                    category,
                    attack: 0.01,
                    decay: 0.02,
                    sustain: 0.6,
                    release: 0.1
                });
            }, i * (noteLength - overlap) * 1000);
        });
    }

    /**
     * Get the gain node for a category
     */
    getCategoryGain(category) {
        switch (category) {
            case 'ambient': return this.ambientGain;
            case 'ui': return this.uiGain;
            case 'event':
            default: return this.eventGain;
        }
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.config.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.config.masterVolume, this.now());
        }
        return this;
    }

    /**
     * Set category volume
     */
    setCategoryVolume(category, volume) {
        const gain = this.getCategoryGain(category);
        if (gain) {
            gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.now());
        }
        return this;
    }

    /**
     * Mute all audio
     */
    mute() {
        if (this.isMuted) return this;

        this.preMuteVolume = this.config.masterVolume;
        this.setMasterVolume(0);
        this.isMuted = true;
        return this;
    }

    /**
     * Unmute audio
     */
    unmute() {
        if (!this.isMuted) return this;

        this.setMasterVolume(this.preMuteVolume);
        this.isMuted = false;
        return this;
    }

    /**
     * Toggle mute state
     */
    toggleMute() {
        return this.isMuted ? this.unmute() : this.mute();
    }

    /**
     * Enable/disable sound
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        if (!enabled && this.audioContext) {
            this.audioContext.suspend();
        } else if (enabled && this.audioContext) {
            this.audioContext.resume();
        }
        return this;
    }

    /**
     * Get current stats
     */
    getStats() {
        return {
            initialized: this.isInitialized,
            enabled: this.config.enabled,
            muted: this.isMuted,
            masterVolume: this.config.masterVolume,
            activeSounds: this.activeSounds.size,
            contextState: this.audioContext?.state ?? 'not created'
        };
    }

    /**
     * Destroy the sound manager
     */
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.activeSounds.clear();
        this.isInitialized = false;
    }
}

// Musical note frequencies (for convenience)
SoundManager.NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
};

// Common chords
SoundManager.CHORDS = {
    C_MAJOR: [261.63, 329.63, 392.00],
    A_MINOR: [220.00, 261.63, 329.63],
    G_MAJOR: [196.00, 246.94, 293.66],
    E_MINOR: [164.81, 196.00, 246.94],
    F_MAJOR: [174.61, 220.00, 261.63],
    D_MINOR: [146.83, 174.61, 220.00]
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
