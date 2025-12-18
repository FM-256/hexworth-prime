/**
 * EventSounds.js - Event-Triggered Sound Effects
 *
 * Procedurally generated sounds for ecosystem events.
 * All sounds created using Web Audio API oscillators.
 *
 * Sound Categories:
 * - Lifecycle: birth, death, evolution
 * - Collisions: merge, split, bounce
 * - Rare: golden, diamond, glitch, ancient spawns
 * - Cosmic: shooting star, solar flare, meteor, void storm, eclipse, nebula
 * - Predators: shadow, serpent, parasite
 * - Player: tool use, portal, sanctuary
 * - Meta: achievement, milestone
 */

class EventSounds {
    constructor(soundManager, config = {}) {
        this.soundManager = soundManager;

        this.config = {
            enabled: config.enabled ?? true,
            pitchVariation: config.pitchVariation ?? 0.1,  // Random pitch variation
            cooldowns: {
                birth: 50,      // ms between birth sounds
                death: 50,
                collision: 30,
                evolution: 100,
                rare: 0,        // Always play rare sounds
                cosmic: 0,
                predator: 200,
                achievement: 0
            },
            ...config
        };

        // Cooldown tracking
        this.lastPlayed = {};
    }

    /**
     * Check if sound is on cooldown
     */
    canPlay(type) {
        if (!this.config.enabled || !this.soundManager?.config.enabled) return false;

        const cooldown = this.config.cooldowns[type] ?? 0;
        const lastTime = this.lastPlayed[type] ?? 0;
        const now = Date.now();

        if (now - lastTime < cooldown) return false;

        this.lastPlayed[type] = now;
        return true;
    }

    /**
     * Add random pitch variation
     */
    varyPitch(baseFreq) {
        const variation = 1 + (Math.random() - 0.5) * 2 * this.config.pitchVariation;
        return baseFreq * variation;
    }

    // ========================================
    // LIFECYCLE SOUNDS
    // ========================================

    /**
     * Birth sound - gentle rising tone
     */
    playBirth(firefly = {}) {
        if (!this.canPlay('birth')) return;

        const tier = firefly.tier?.level ?? 0;
        const baseFreq = 440 + tier * 100; // Higher tier = higher pitch

        // Rising two-note sequence
        this.soundManager.createTone({
            frequency: this.varyPitch(baseFreq * 0.8),
            type: 'sine',
            duration: 0.08,
            volume: 0.15,
            attack: 0.01,
            decay: 0.02,
            sustain: 0.5,
            release: 0.05
        });

        setTimeout(() => {
            this.soundManager.createTone({
                frequency: this.varyPitch(baseFreq),
                type: 'sine',
                duration: 0.12,
                volume: 0.2,
                attack: 0.01,
                decay: 0.03,
                sustain: 0.4,
                release: 0.08
            });
        }, 60);
    }

    /**
     * Death sound - falling tone with fade
     */
    playDeath(firefly = {}, cause = 'natural') {
        if (!this.canPlay('death')) return;

        const tier = firefly.tier?.level ?? 0;
        let baseFreq = 330 - tier * 30; // Higher tier = lower pitch (more significant)

        // Different sounds for different death causes
        if (cause === 'predator') {
            // Quick, sharp cutoff
            this.soundManager.createTone({
                frequency: this.varyPitch(baseFreq * 1.2),
                type: 'sawtooth',
                duration: 0.05,
                volume: 0.15,
                attack: 0.005,
                decay: 0.02,
                sustain: 0.3,
                release: 0.03
            });
        } else if (cause === 'blackhole') {
            // Descending sweep
            const osc = this.soundManager.createTone({
                frequency: this.varyPitch(baseFreq * 1.5),
                type: 'sine',
                duration: 0.2,
                volume: 0.12,
                attack: 0.01,
                decay: 0.05,
                sustain: 0.3,
                release: 0.15
            });
            if (osc) {
                osc.oscillator.frequency.exponentialRampToValueAtTime(
                    baseFreq * 0.3,
                    this.soundManager.now() + 0.25
                );
            }
        } else {
            // Natural death - soft fade
            this.soundManager.createTone({
                frequency: this.varyPitch(baseFreq),
                type: 'sine',
                duration: 0.15,
                volume: 0.1,
                attack: 0.01,
                decay: 0.1,
                sustain: 0.2,
                release: 0.15
            });
        }
    }

    /**
     * Evolution sound - ascending arpeggio
     */
    playEvolution(firefly = {}, oldTier = {}, newTier = {}) {
        if (!this.canPlay('evolution')) return;

        const tierLevel = newTier.level ?? 1;
        const baseFreq = 262; // C4

        // Ascending notes based on new tier
        const notes = [
            baseFreq,
            baseFreq * 1.25,  // Major third
            baseFreq * 1.5,   // Perfect fifth
            baseFreq * 2      // Octave
        ].slice(0, tierLevel + 1);

        // Play as quick arpeggio
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: freq * (1 + tierLevel * 0.1), // Higher tiers = higher overall pitch
                    type: 'triangle',
                    duration: 0.12,
                    volume: 0.25,
                    attack: 0.01,
                    decay: 0.02,
                    sustain: 0.5,
                    release: 0.1
                });
            }, i * 80);
        });

        // Final shimmer for high tiers
        if (tierLevel >= 3) {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: baseFreq * 4,
                    type: 'sine',
                    duration: 0.3,
                    volume: 0.15,
                    attack: 0.05,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 0.2
                });
            }, notes.length * 80);
        }
    }

    // ========================================
    // COLLISION SOUNDS
    // ========================================

    /**
     * Collision sound - varies by result
     */
    playCollision(digit1, digit2, result) {
        if (!this.canPlay('collision')) return;

        if (digit1 === 1 && digit2 === 1) {
            // 1+1=10 - bright click
            this.soundManager.createTone({
                frequency: this.varyPitch(880),
                type: 'square',
                duration: 0.03,
                volume: 0.12,
                attack: 0.002,
                decay: 0.01,
                sustain: 0.3,
                release: 0.02
            });
        } else if (digit1 === 0 && digit2 === 0) {
            // 0+0=01 - soft pop
            this.soundManager.createTone({
                frequency: this.varyPitch(440),
                type: 'sine',
                duration: 0.04,
                volume: 0.1,
                attack: 0.002,
                decay: 0.015,
                sustain: 0.4,
                release: 0.02
            });
        } else {
            // 1+0 merge - gentle chime
            this.soundManager.createTone({
                frequency: this.varyPitch(660),
                type: 'triangle',
                duration: 0.05,
                volume: 0.08,
                attack: 0.003,
                decay: 0.02,
                sustain: 0.3,
                release: 0.03
            });
        }
    }

    // ========================================
    // RARE SPAWN SOUNDS
    // ========================================

    /**
     * Golden firefly spawn - triumphant chime
     */
    playGoldenSpawn() {
        if (!this.canPlay('rare')) return;

        // Golden chord
        const baseFreq = 392; // G4
        [1, 1.25, 1.5].forEach((mult, i) => {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: baseFreq * mult,
                    type: 'sine',
                    duration: 0.4,
                    volume: 0.2,
                    attack: 0.02,
                    decay: 0.1,
                    sustain: 0.4,
                    release: 0.3
                });
            }, i * 50);
        });

        // Shimmer
        setTimeout(() => {
            this.soundManager.createTone({
                frequency: baseFreq * 2,
                type: 'sine',
                duration: 0.5,
                volume: 0.15,
                attack: 0.1,
                decay: 0.1,
                sustain: 0.3,
                release: 0.3
            });
        }, 200);
    }

    /**
     * Diamond firefly spawn - crystal chime
     */
    playDiamondSpawn() {
        if (!this.canPlay('rare')) return;

        // High crystalline tones
        const baseFreq = 1047; // C6

        [1, 1.2, 0.8, 1.5].forEach((mult, i) => {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: baseFreq * mult,
                    type: 'sine',
                    duration: 0.15,
                    volume: 0.12,
                    attack: 0.005,
                    decay: 0.02,
                    sustain: 0.4,
                    release: 0.1
                });
            }, i * 40);
        });
    }

    /**
     * Glitch firefly spawn - digital noise burst
     */
    playGlitchSpawn() {
        if (!this.canPlay('rare')) return;

        // Quick square wave bursts at random frequencies
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: 200 + Math.random() * 800,
                    type: 'square',
                    duration: 0.02 + Math.random() * 0.03,
                    volume: 0.1,
                    attack: 0.001,
                    decay: 0.01,
                    sustain: 0.5,
                    release: 0.01
                });
            }, i * 30 + Math.random() * 20);
        }

        // Noise burst
        setTimeout(() => {
            this.soundManager.createNoise({
                type: 'white',
                duration: 0.08,
                attack: 0.005,
                release: 0.03,
                volume: 0.08
            });
        }, 100);
    }

    /**
     * Ancient firefly spawn - deep resonant tone
     */
    playAncientSpawn() {
        if (!this.canPlay('rare')) return;

        // Deep bass drone
        this.soundManager.createTone({
            frequency: 110, // A2
            type: 'sine',
            duration: 0.8,
            volume: 0.2,
            attack: 0.1,
            decay: 0.2,
            sustain: 0.4,
            release: 0.4
        });

        // Harmonic overlay
        setTimeout(() => {
            this.soundManager.createTone({
                frequency: 220,
                type: 'triangle',
                duration: 0.6,
                volume: 0.12,
                attack: 0.15,
                decay: 0.1,
                sustain: 0.3,
                release: 0.3
            });
        }, 100);

        setTimeout(() => {
            this.soundManager.createTone({
                frequency: 330,
                type: 'sine',
                duration: 0.4,
                volume: 0.08,
                attack: 0.2,
                decay: 0.05,
                sustain: 0.3,
                release: 0.2
            });
        }, 200);
    }

    /**
     * Generic rare spawn (dispatches to specific)
     */
    playRareSpawn(rareType) {
        switch (rareType?.toLowerCase()) {
            case 'golden': this.playGoldenSpawn(); break;
            case 'diamond': this.playDiamondSpawn(); break;
            case 'glitch': this.playGlitchSpawn(); break;
            case 'ancient': this.playAncientSpawn(); break;
            default: this.playGoldenSpawn(); // Fallback
        }
    }

    // ========================================
    // COSMIC EVENT SOUNDS
    // ========================================

    /**
     * Solar Flare - rising energy sweep
     */
    playSolarFlare(phase = 'start') {
        if (!this.canPlay('cosmic')) return;

        if (phase === 'start') {
            // Warning tone
            this.soundManager.createTone({
                frequency: 440,
                type: 'sine',
                duration: 0.5,
                volume: 0.2,
                attack: 0.1,
                decay: 0.1,
                sustain: 0.5,
                release: 0.2
            });

            // Rising sweep
            setTimeout(() => {
                const osc = this.soundManager.createTone({
                    frequency: 220,
                    type: 'sawtooth',
                    duration: 1.0,
                    volume: 0.15,
                    attack: 0.2,
                    decay: 0.2,
                    sustain: 0.4,
                    release: 0.4
                });
                if (osc) {
                    osc.oscillator.frequency.exponentialRampToValueAtTime(
                        880,
                        this.soundManager.now() + 1.0
                    );
                }
            }, 300);
        }
    }

    /**
     * Shooting Star - magical whoosh with sparkle
     */
    playShootingStar() {
        if (!this.canPlay('cosmic')) return;

        // Main whoosh - descending sine sweep
        const startFreq = 1200 + Math.random() * 300;
        const osc = this.soundManager.createTone({
            frequency: startFreq,
            type: 'sine',
            duration: 0.6,
            volume: 0.15,
            attack: 0.02,
            decay: 0.1,
            sustain: 0.4,
            release: 0.3
        });

        if (osc) {
            osc.oscillator.frequency.exponentialRampToValueAtTime(
                startFreq * 0.25,
                this.soundManager.now() + 0.6
            );
        }

        // Soft noise trail
        this.soundManager.createNoise({
            type: 'pink',
            duration: 0.4,
            attack: 0.02,
            release: 0.3,
            volume: 0.06
        });

        // Sparkle at the end (when egg drops)
        setTimeout(() => {
            [1047, 1319, 1568].forEach((freq, i) => {
                setTimeout(() => {
                    this.soundManager.createTone({
                        frequency: freq,
                        type: 'sine',
                        duration: 0.15,
                        volume: 0.1,
                        attack: 0.01,
                        decay: 0.03,
                        sustain: 0.3,
                        release: 0.1
                    });
                }, i * 40);
            });
        }, 400);
    }

    /**
     * Meteor Shower - whistling descent
     */
    playMeteorShower() {
        if (!this.canPlay('cosmic')) return;

        // Multiple descending tones
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const startFreq = 1000 + Math.random() * 500;
                const osc = this.soundManager.createTone({
                    frequency: startFreq,
                    type: 'sine',
                    duration: 0.3,
                    volume: 0.1,
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 0.15
                });
                if (osc) {
                    osc.oscillator.frequency.exponentialRampToValueAtTime(
                        startFreq * 0.3,
                        this.soundManager.now() + 0.3
                    );
                }
            }, i * 150);
        }
    }

    /**
     * Void Storm - ominous rumble
     */
    playVoidStorm(phase = 'start') {
        if (!this.canPlay('cosmic')) return;

        // Deep rumbling noise
        this.soundManager.createNoise({
            type: 'brown',
            duration: 1.5,
            attack: 0.3,
            release: 0.5,
            volume: 0.15,
            category: 'ambient'
        });

        // Low frequency oscillation
        this.soundManager.createTone({
            frequency: 55, // A1
            type: 'sine',
            duration: 1.2,
            volume: 0.12,
            attack: 0.2,
            decay: 0.3,
            sustain: 0.4,
            release: 0.4
        });
    }

    /**
     * Eclipse - ethereal drone
     */
    playEclipse(phase = 'start') {
        if (!this.canPlay('cosmic')) return;

        if (phase === 'start') {
            // Descending tone
            const osc = this.soundManager.createTone({
                frequency: 440,
                type: 'triangle',
                duration: 1.5,
                volume: 0.15,
                attack: 0.3,
                decay: 0.3,
                sustain: 0.3,
                release: 0.5
            });
            if (osc) {
                osc.oscillator.frequency.exponentialRampToValueAtTime(
                    220,
                    this.soundManager.now() + 1.5
                );
            }
        }
    }

    /**
     * Nebula Drift - ambient pad
     */
    playNebulaDrift() {
        if (!this.canPlay('cosmic')) return;

        // Soft chord
        [262, 330, 392].forEach((freq, i) => {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: freq,
                    type: 'sine',
                    duration: 2.0,
                    volume: 0.08,
                    attack: 0.5,
                    decay: 0.3,
                    sustain: 0.3,
                    release: 0.8,
                    category: 'ambient'
                });
            }, i * 100);
        });
    }

    // ========================================
    // PREDATOR SOUNDS
    // ========================================

    /**
     * Shadow firefly - dark whisper
     */
    playShadowAppear() {
        if (!this.canPlay('predator')) return;

        // Reversed-sounding effect (attack at end)
        this.soundManager.createNoise({
            type: 'pink',
            duration: 0.2,
            attack: 0.15,
            release: 0.02,
            volume: 0.08
        });

        this.soundManager.createTone({
            frequency: 150,
            type: 'sawtooth',
            duration: 0.15,
            volume: 0.08,
            attack: 0.1,
            decay: 0.02,
            sustain: 0.3,
            release: 0.02
        });
    }

    /**
     * Void Serpent - menacing hiss
     */
    playVoidSerpent() {
        if (!this.canPlay('predator')) return;

        // Low growl
        this.soundManager.createTone({
            frequency: 80,
            type: 'sawtooth',
            duration: 0.5,
            volume: 0.12,
            attack: 0.1,
            decay: 0.1,
            sustain: 0.4,
            release: 0.2
        });

        // Hiss
        this.soundManager.createNoise({
            type: 'pink',
            duration: 0.4,
            attack: 0.05,
            release: 0.2,
            volume: 0.1
        });
    }

    /**
     * Parasite attach
     */
    playParasiteAttach() {
        if (!this.canPlay('predator')) return;

        // Quick squelch
        this.soundManager.createTone({
            frequency: 300,
            type: 'square',
            duration: 0.04,
            volume: 0.08,
            attack: 0.002,
            decay: 0.02,
            sustain: 0.3,
            release: 0.01
        });
    }

    // ========================================
    // PLAYER TOOL SOUNDS
    // ========================================

    /**
     * Energy Blessing - healing chime
     */
    playEnergyBlessing() {
        if (!this.canPlay('rare')) return;

        // Ascending healing tones
        [392, 494, 587].forEach((freq, i) => {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: freq,
                    type: 'sine',
                    duration: 0.2,
                    volume: 0.15,
                    attack: 0.02,
                    decay: 0.05,
                    sustain: 0.4,
                    release: 0.15
                });
            }, i * 70);
        });
    }

    /**
     * Shield Bubble - protective hum
     */
    playShieldBubble() {
        if (!this.canPlay('rare')) return;

        this.soundManager.createTone({
            frequency: 220,
            type: 'sine',
            duration: 0.4,
            volume: 0.12,
            attack: 0.05,
            decay: 0.1,
            sustain: 0.5,
            release: 0.2
        });

        this.soundManager.createTone({
            frequency: 330,
            type: 'triangle',
            duration: 0.3,
            volume: 0.08,
            attack: 0.1,
            decay: 0.05,
            sustain: 0.4,
            release: 0.15
        });
    }

    /**
     * Portal activation - whoosh
     */
    playPortalActivate() {
        if (!this.canPlay('rare')) return;

        // Swirling frequency
        const osc = this.soundManager.createTone({
            frequency: 300,
            type: 'sine',
            duration: 0.4,
            volume: 0.15,
            attack: 0.05,
            decay: 0.1,
            sustain: 0.4,
            release: 0.15
        });

        if (osc) {
            const now = this.soundManager.now();
            // Vibrato effect
            osc.oscillator.frequency.setValueAtTime(300, now);
            osc.oscillator.frequency.linearRampToValueAtTime(400, now + 0.1);
            osc.oscillator.frequency.linearRampToValueAtTime(300, now + 0.2);
            osc.oscillator.frequency.linearRampToValueAtTime(500, now + 0.3);
        }

        // Whoosh noise
        this.soundManager.createNoise({
            type: 'pink',
            duration: 0.3,
            attack: 0.02,
            release: 0.2,
            volume: 0.1
        });
    }

    // ========================================
    // META SOUNDS
    // ========================================

    /**
     * Achievement unlocked - fanfare
     */
    playAchievement() {
        if (!this.canPlay('achievement')) return;

        // Triumphant arpeggio
        const notes = [262, 330, 392, 523]; // C major to octave
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.soundManager.createTone({
                    frequency: freq,
                    type: 'triangle',
                    duration: 0.2,
                    volume: 0.2,
                    attack: 0.01,
                    decay: 0.05,
                    sustain: 0.5,
                    release: 0.15,
                    category: 'ui'
                });
            }, i * 100);
        });

        // Final chord
        setTimeout(() => {
            [523, 659, 784].forEach(freq => {
                this.soundManager.createTone({
                    frequency: freq,
                    type: 'sine',
                    duration: 0.5,
                    volume: 0.15,
                    attack: 0.02,
                    decay: 0.1,
                    sustain: 0.4,
                    release: 0.3,
                    category: 'ui'
                });
            });
        }, 400);
    }

    /**
     * UI click sound
     */
    playUIClick() {
        this.soundManager.createTone({
            frequency: 800,
            type: 'sine',
            duration: 0.03,
            volume: 0.1,
            attack: 0.002,
            decay: 0.01,
            sustain: 0.3,
            release: 0.02,
            category: 'ui'
        });
    }

    /**
     * Enable/disable event sounds
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        return this;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventSounds;
}
