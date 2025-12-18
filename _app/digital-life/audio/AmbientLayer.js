/**
 * AmbientLayer.js - Atmospheric Background Soundscape
 *
 * Creates a subtle, evolving ambient sound layer that responds
 * to ecosystem state. Uses layered filtered noise and gentle
 * oscillators to create a "space" atmosphere.
 *
 * Features:
 * - Soft background drone
 * - Filtered noise for texture
 * - Ecosystem-reactive intensity
 * - Smooth transitions between states
 */

class AmbientLayer {
    constructor(soundManager, config = {}) {
        this.soundManager = soundManager;

        this.config = {
            enabled: config.enabled ?? true,
            baseVolume: config.baseVolume ?? 0.08,
            maxVolume: config.maxVolume ?? 0.15,
            fadeTime: config.fadeTime ?? 2.0,           // Seconds to fade in/out
            droneFrequency: config.droneFrequency ?? 55, // A1 - deep bass
            updateInterval: config.updateInterval ?? 5000, // ms between state updates
            ...config
        };

        // Audio nodes
        this.nodes = {
            // Base drone
            droneOsc1: null,
            droneOsc2: null,
            droneGain: null,

            // Noise layer
            noiseSource: null,
            noiseFilter: null,
            noiseGain: null,

            // Shimmer (high harmonics)
            shimmerOsc: null,
            shimmerGain: null,

            // Master ambient gain
            masterGain: null
        };

        // State
        this.isPlaying = false;
        this.currentState = 'normal';  // normal, danger, calm, intense
        this.ecosystemData = null;
        this.updateTimer = null;

        // Noise buffer (reusable)
        this.noiseBuffer = null;
    }

    /**
     * Initialize and start the ambient layer
     */
    start() {
        if (!this.soundManager?.ensureReady() || !this.config.enabled) return this;
        if (this.isPlaying) return this;

        const ctx = this.soundManager.audioContext;
        const now = ctx.currentTime;

        // Create master gain for ambient
        this.nodes.masterGain = ctx.createGain();
        this.nodes.masterGain.gain.value = 0;
        this.nodes.masterGain.connect(this.soundManager.ambientGain);

        // Create drone layer (two detuned oscillators for richness)
        this.createDroneLayer(ctx, now);

        // Create noise layer (filtered for atmosphere)
        this.createNoiseLayer(ctx, now);

        // Create shimmer layer (subtle high harmonics)
        this.createShimmerLayer(ctx, now);

        // Fade in
        this.nodes.masterGain.gain.setValueAtTime(0, now);
        this.nodes.masterGain.gain.linearRampToValueAtTime(
            this.config.baseVolume,
            now + this.config.fadeTime
        );

        this.isPlaying = true;

        // Start update loop
        this.startUpdateLoop();

        console.log('🎵 Ambient layer started');
        return this;
    }

    /**
     * Create the base drone layer
     */
    createDroneLayer(ctx, now) {
        // Drone gain
        this.nodes.droneGain = ctx.createGain();
        this.nodes.droneGain.gain.value = 0.6;
        this.nodes.droneGain.connect(this.nodes.masterGain);

        // First oscillator - fundamental
        this.nodes.droneOsc1 = ctx.createOscillator();
        this.nodes.droneOsc1.type = 'sine';
        this.nodes.droneOsc1.frequency.value = this.config.droneFrequency;
        this.nodes.droneOsc1.connect(this.nodes.droneGain);
        this.nodes.droneOsc1.start(now);

        // Second oscillator - slightly detuned for width
        this.nodes.droneOsc2 = ctx.createOscillator();
        this.nodes.droneOsc2.type = 'sine';
        this.nodes.droneOsc2.frequency.value = this.config.droneFrequency * 1.003; // Slight detune
        this.nodes.droneOsc2.connect(this.nodes.droneGain);
        this.nodes.droneOsc2.start(now);

        // Add subtle LFO modulation to frequency
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05; // Very slow modulation
        lfoGain.gain.value = 2; // +/- 2Hz modulation
        lfo.connect(lfoGain);
        lfoGain.connect(this.nodes.droneOsc1.frequency);
        lfo.start(now);

        // Store for cleanup
        this.nodes.lfo = lfo;
        this.nodes.lfoGain = lfoGain;
    }

    /**
     * Create filtered noise layer for texture
     */
    createNoiseLayer(ctx, now) {
        // Create or reuse noise buffer
        if (!this.noiseBuffer) {
            const bufferSize = ctx.sampleRate * 2; // 2 seconds
            this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = this.noiseBuffer.getChannelData(0);

            // Generate pink-ish noise
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99765 * b0 + white * 0.0990460;
                b1 = 0.96300 * b1 + white * 0.2965164;
                b2 = 0.57000 * b2 + white * 1.0526913;
                data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06;
            }
        }

        // Create looping noise source
        this.nodes.noiseSource = ctx.createBufferSource();
        this.nodes.noiseSource.buffer = this.noiseBuffer;
        this.nodes.noiseSource.loop = true;

        // Low-pass filter for softness
        this.nodes.noiseFilter = ctx.createBiquadFilter();
        this.nodes.noiseFilter.type = 'lowpass';
        this.nodes.noiseFilter.frequency.value = 800;
        this.nodes.noiseFilter.Q.value = 0.5;

        // Noise gain
        this.nodes.noiseGain = ctx.createGain();
        this.nodes.noiseGain.gain.value = 0.3;

        // Connect
        this.nodes.noiseSource.connect(this.nodes.noiseFilter);
        this.nodes.noiseFilter.connect(this.nodes.noiseGain);
        this.nodes.noiseGain.connect(this.nodes.masterGain);

        this.nodes.noiseSource.start(now);
    }

    /**
     * Create shimmer layer (subtle high harmonics)
     */
    createShimmerLayer(ctx, now) {
        // Shimmer gain (very quiet)
        this.nodes.shimmerGain = ctx.createGain();
        this.nodes.shimmerGain.gain.value = 0.15;
        this.nodes.shimmerGain.connect(this.nodes.masterGain);

        // High harmonic oscillator
        this.nodes.shimmerOsc = ctx.createOscillator();
        this.nodes.shimmerOsc.type = 'sine';
        this.nodes.shimmerOsc.frequency.value = this.config.droneFrequency * 8; // 8th harmonic

        // Add tremolo
        const tremolo = ctx.createOscillator();
        const tremoloGain = ctx.createGain();
        tremolo.type = 'sine';
        tremolo.frequency.value = 0.2; // Slow tremolo
        tremoloGain.gain.value = 0.1;
        tremolo.connect(tremoloGain);
        tremoloGain.connect(this.nodes.shimmerGain.gain);
        tremolo.start(now);

        this.nodes.shimmerOsc.connect(this.nodes.shimmerGain);
        this.nodes.shimmerOsc.start(now);

        // Store for cleanup
        this.nodes.tremolo = tremolo;
        this.nodes.tremoloGain = tremoloGain;
    }

    /**
     * Stop the ambient layer
     */
    stop() {
        if (!this.isPlaying) return this;

        const ctx = this.soundManager?.audioContext;
        if (!ctx) return this;

        const now = ctx.currentTime;

        // Fade out
        this.nodes.masterGain?.gain.linearRampToValueAtTime(0, now + this.config.fadeTime);

        // Stop and clean up after fade
        setTimeout(() => {
            this.cleanup();
        }, this.config.fadeTime * 1000 + 100);

        this.isPlaying = false;

        // Stop update loop
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }

        console.log('🔇 Ambient layer stopped');
        return this;
    }

    /**
     * Clean up all audio nodes
     */
    cleanup() {
        // Stop oscillators
        try { this.nodes.droneOsc1?.stop(); } catch (e) {}
        try { this.nodes.droneOsc2?.stop(); } catch (e) {}
        try { this.nodes.shimmerOsc?.stop(); } catch (e) {}
        try { this.nodes.noiseSource?.stop(); } catch (e) {}
        try { this.nodes.lfo?.stop(); } catch (e) {}
        try { this.nodes.tremolo?.stop(); } catch (e) {}

        // Disconnect all
        Object.values(this.nodes).forEach(node => {
            try { node?.disconnect(); } catch (e) {}
        });

        // Clear references
        this.nodes = {
            droneOsc1: null,
            droneOsc2: null,
            droneGain: null,
            noiseSource: null,
            noiseFilter: null,
            noiseGain: null,
            shimmerOsc: null,
            shimmerGain: null,
            masterGain: null
        };
    }

    /**
     * Start the ecosystem state update loop
     */
    startUpdateLoop() {
        this.updateTimer = setInterval(() => {
            this.updateFromEcosystem();
        }, this.config.updateInterval);
    }

    /**
     * Update ambient based on ecosystem state
     */
    updateFromEcosystem() {
        if (!this.isPlaying || !this.ecosystemData) return;

        const data = this.ecosystemData;
        const ctx = this.soundManager?.audioContext;
        if (!ctx) return;

        const now = ctx.currentTime;

        // Determine state based on ecosystem
        let newState = 'normal';
        let intensity = 0.5;

        // Check for danger (predators, void storm, etc.)
        const predatorCount = (data.shadows ?? 0) + (data.serpents ?? 0) + (data.parasites ?? 0);
        if (predatorCount > 3 || data.voidStormActive) {
            newState = 'danger';
            intensity = 0.8;
        }
        // Check for calm (low population, no predators)
        else if (data.population < 15 && predatorCount === 0) {
            newState = 'calm';
            intensity = 0.3;
        }
        // Check for intense (high activity, cosmic events)
        else if (data.population > 40 || data.cosmicEventActive) {
            newState = 'intense';
            intensity = 0.7;
        }

        // Only transition if state changed
        if (newState !== this.currentState) {
            this.transitionToState(newState, intensity);
            this.currentState = newState;
        }
    }

    /**
     * Transition to a new ambient state
     */
    transitionToState(state, intensity) {
        const ctx = this.soundManager?.audioContext;
        if (!ctx) return;

        const now = ctx.currentTime;
        const transitionTime = 2.0;

        switch (state) {
            case 'danger':
                // Lower, more ominous
                this.nodes.droneOsc1?.frequency.linearRampToValueAtTime(
                    this.config.droneFrequency * 0.8,
                    now + transitionTime
                );
                this.nodes.noiseFilter?.frequency.linearRampToValueAtTime(
                    1200,
                    now + transitionTime
                );
                this.nodes.noiseGain?.gain.linearRampToValueAtTime(
                    0.5,
                    now + transitionTime
                );
                this.nodes.masterGain?.gain.linearRampToValueAtTime(
                    this.config.maxVolume,
                    now + transitionTime
                );
                break;

            case 'calm':
                // Softer, higher
                this.nodes.droneOsc1?.frequency.linearRampToValueAtTime(
                    this.config.droneFrequency * 1.2,
                    now + transitionTime
                );
                this.nodes.noiseFilter?.frequency.linearRampToValueAtTime(
                    400,
                    now + transitionTime
                );
                this.nodes.noiseGain?.gain.linearRampToValueAtTime(
                    0.15,
                    now + transitionTime
                );
                this.nodes.masterGain?.gain.linearRampToValueAtTime(
                    this.config.baseVolume * 0.6,
                    now + transitionTime
                );
                break;

            case 'intense':
                // Fuller, brighter
                this.nodes.droneOsc1?.frequency.linearRampToValueAtTime(
                    this.config.droneFrequency,
                    now + transitionTime
                );
                this.nodes.noiseFilter?.frequency.linearRampToValueAtTime(
                    1000,
                    now + transitionTime
                );
                this.nodes.noiseGain?.gain.linearRampToValueAtTime(
                    0.4,
                    now + transitionTime
                );
                this.nodes.shimmerGain?.gain.linearRampToValueAtTime(
                    0.25,
                    now + transitionTime
                );
                this.nodes.masterGain?.gain.linearRampToValueAtTime(
                    this.config.baseVolume * 1.3,
                    now + transitionTime
                );
                break;

            case 'normal':
            default:
                // Return to baseline
                this.nodes.droneOsc1?.frequency.linearRampToValueAtTime(
                    this.config.droneFrequency,
                    now + transitionTime
                );
                this.nodes.noiseFilter?.frequency.linearRampToValueAtTime(
                    800,
                    now + transitionTime
                );
                this.nodes.noiseGain?.gain.linearRampToValueAtTime(
                    0.3,
                    now + transitionTime
                );
                this.nodes.shimmerGain?.gain.linearRampToValueAtTime(
                    0.15,
                    now + transitionTime
                );
                this.nodes.masterGain?.gain.linearRampToValueAtTime(
                    this.config.baseVolume,
                    now + transitionTime
                );
                break;
        }
    }

    /**
     * Update ecosystem data (called externally)
     */
    setEcosystemData(data) {
        this.ecosystemData = data;
    }

    /**
     * Set volume
     */
    setVolume(volume) {
        this.config.baseVolume = Math.max(0, Math.min(1, volume));
        if (this.isPlaying && this.nodes.masterGain) {
            const ctx = this.soundManager?.audioContext;
            if (ctx) {
                this.nodes.masterGain.gain.linearRampToValueAtTime(
                    this.config.baseVolume,
                    ctx.currentTime + 0.5
                );
            }
        }
        return this;
    }

    /**
     * Enable/disable ambient layer
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        if (enabled && !this.isPlaying) {
            this.start();
        } else if (!enabled && this.isPlaying) {
            this.stop();
        }
        return this;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentState: this.currentState,
            enabled: this.config.enabled
        };
    }

    /**
     * Destroy the ambient layer
     */
    destroy() {
        this.stop();
        this.noiseBuffer = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmbientLayer;
}
