/**
 * SoundToggle.js - Floating Sound Control Button
 *
 * A minimal, elegant floating button that lets users
 * enable/disable the Digital Life audio system.
 *
 * Features:
 * - Initializes AudioContext on first click (browser policy)
 * - Persists preference to localStorage
 * - Animated icon transitions
 * - Works with any DigitalLife instance
 *
 * Usage:
 *   const soundToggle = new SoundToggle(digitalLifeInstance);
 *   soundToggle.init();
 */

class SoundToggle {
    constructor(digitalLife, options = {}) {
        this.digitalLife = digitalLife;
        this.options = {
            position: options.position || 'bottom-right', // bottom-right, bottom-left, top-right, top-left
            size: options.size || 44,
            margin: options.margin || 20,
            zIndex: options.zIndex || 9999,
            storageKey: options.storageKey || 'hexworth_sound_enabled',
            ...options
        };

        this.element = null;
        this.isEnabled = false;
        this.hasInteracted = false;
    }

    /**
     * Initialize the sound toggle
     */
    init() {
        // Check stored preference
        const stored = localStorage.getItem(this.options.storageKey);
        this.isEnabled = stored === 'true';

        // Create the button
        this.createElement();

        // Inject styles
        this.injectStyles();

        // If user previously enabled sound, we still need a click to init AudioContext
        // So we show it as "ready to enable" state
        this.updateIcon();

        return this;
    }

    /**
     * Create the toggle button element
     */
    createElement() {
        this.element = document.createElement('button');
        this.element.className = 'sound-toggle';
        this.element.setAttribute('aria-label', 'Toggle sound');
        this.element.setAttribute('title', 'Toggle sound');

        // Icon container for animation
        this.element.innerHTML = `
            <span class="sound-toggle-icon">${this.getIcon()}</span>
            <span class="sound-toggle-pulse"></span>
        `;

        // Position based on options
        this.applyPosition();

        // Click handler
        this.element.addEventListener('click', () => this.toggle());

        // Add to document
        document.body.appendChild(this.element);
    }

    /**
     * Apply position styles
     */
    applyPosition() {
        const positions = {
            'bottom-right': { bottom: this.options.margin + 'px', right: this.options.margin + 'px' },
            'bottom-left': { bottom: this.options.margin + 'px', left: this.options.margin + 'px' },
            'top-right': { top: this.options.margin + 'px', right: this.options.margin + 'px' },
            'top-left': { top: this.options.margin + 'px', left: this.options.margin + 'px' }
        };

        const pos = positions[this.options.position] || positions['bottom-right'];
        Object.assign(this.element.style, pos);
    }

    /**
     * Get the appropriate icon
     */
    getIcon() {
        if (!this.hasInteracted && this.isEnabled) {
            // User wants sound but hasn't clicked yet
            return '🔊';
        }
        return this.isEnabled ? '🔊' : '🔇';
    }

    /**
     * Update the icon display
     */
    updateIcon() {
        const iconEl = this.element.querySelector('.sound-toggle-icon');
        if (iconEl) {
            iconEl.textContent = this.getIcon();
        }

        // Update class for styling
        this.element.classList.toggle('sound-enabled', this.isEnabled);
        this.element.classList.toggle('sound-disabled', !this.isEnabled);
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.hasInteracted = true;
        this.isEnabled = !this.isEnabled;

        // Save preference
        localStorage.setItem(this.options.storageKey, this.isEnabled.toString());

        // Initialize or toggle the Digital Life audio
        if (this.digitalLife) {
            if (this.isEnabled) {
                this.enableAudio();
            } else {
                this.disableAudio();
            }
        }

        // Update display
        this.updateIcon();

        // Animate
        this.playFeedback();
    }

    /**
     * Enable audio in Digital Life
     */
    enableAudio() {
        // Enable in config first
        if (this.digitalLife.config) {
            this.digitalLife.config.audio = this.digitalLife.config.audio || {};
            this.digitalLife.config.audio.enabled = true;
            this.digitalLife.config.audio.ambientEnabled = true;
            this.digitalLife.config.audio.eventsEnabled = true;
        }

        // If sound manager doesn't exist, we need to initialize the full audio system
        if (!this.digitalLife.soundManager) {
            // Call the DigitalLife's own audio initialization
            if (this.digitalLife.initAudioSystems) {
                this.digitalLife.initAudioSystems();
            } else {
                // Fallback: create sound manager manually
                if (typeof SoundManager !== 'undefined') {
                    this.digitalLife.soundManager = new SoundManager({
                        enabled: true,
                        masterVolume: 0.5
                    });
                    this.digitalLife.soundManager.init();

                    // Create event sounds
                    if (typeof EventSounds !== 'undefined') {
                        this.digitalLife.eventSounds = new EventSounds(this.digitalLife.soundManager, {
                            enabled: true
                        });
                    }

                    // Create ambient layer
                    if (typeof AmbientLayer !== 'undefined') {
                        this.digitalLife.ambientLayer = new AmbientLayer(this.digitalLife.soundManager, {
                            enabled: true
                        });
                    }

                    // Wire up audio hooks to ecosystem events
                    if (this.digitalLife.wirePhase8Audio) {
                        this.digitalLife.wirePhase8Audio();
                    }
                }
            }
        }

        // Now initialize/unmute the sound manager
        if (this.digitalLife.soundManager) {
            if (!this.digitalLife.soundManager.isInitialized) {
                this.digitalLife.soundManager.init();
            }
            this.digitalLife.soundManager.unmute();

            // Start ambient layer if available
            if (this.digitalLife.ambientLayer) {
                this.digitalLife.ambientLayer.start();
            }
        }

        console.log('🔊 Sound enabled');
    }

    /**
     * Disable audio in Digital Life
     */
    disableAudio() {
        if (this.digitalLife.soundManager) {
            this.digitalLife.soundManager.mute();

            // Stop ambient layer
            if (this.digitalLife.ambientLayer) {
                this.digitalLife.ambientLayer.stop();
            }
        }

        console.log('🔇 Sound disabled');
    }

    /**
     * Play visual feedback on toggle
     */
    playFeedback() {
        // Pulse animation
        const pulse = this.element.querySelector('.sound-toggle-pulse');
        if (pulse) {
            pulse.classList.remove('animate');
            void pulse.offsetWidth; // Trigger reflow
            pulse.classList.add('animate');
        }

        // Button scale
        this.element.classList.add('clicked');
        setTimeout(() => {
            this.element.classList.remove('clicked');
        }, 150);
    }

    /**
     * Inject component styles
     */
    injectStyles() {
        if (document.getElementById('sound-toggle-styles')) return;

        const style = document.createElement('style');
        style.id = 'sound-toggle-styles';
        style.textContent = `
            .sound-toggle {
                position: fixed;
                width: ${this.options.size}px;
                height: ${this.options.size}px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(20, 20, 30, 0.8);
                backdrop-filter: blur(10px);
                cursor: pointer;
                z-index: ${this.options.zIndex};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }

            .sound-toggle:hover {
                transform: scale(1.1);
                border-color: rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }

            .sound-toggle.clicked {
                transform: scale(0.95);
            }

            .sound-toggle-icon {
                font-size: 20px;
                transition: transform 0.2s ease;
            }

            .sound-toggle:hover .sound-toggle-icon {
                transform: scale(1.1);
            }

            .sound-toggle.sound-enabled {
                border-color: rgba(100, 200, 150, 0.3);
                box-shadow: 0 4px 15px rgba(100, 200, 150, 0.15);
            }

            .sound-toggle.sound-disabled {
                opacity: 0.7;
            }

            .sound-toggle.sound-disabled:hover {
                opacity: 1;
            }

            .sound-toggle-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 2px solid rgba(100, 200, 150, 0.5);
                opacity: 0;
                pointer-events: none;
            }

            .sound-toggle-pulse.animate {
                animation: soundPulse 0.4s ease-out;
            }

            @keyframes soundPulse {
                0% {
                    transform: scale(1);
                    opacity: 0.6;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }

            /* Theme-aware styling */
            [data-theme="matrix"] .sound-toggle.sound-enabled {
                border-color: rgba(0, 255, 65, 0.3);
                box-shadow: 0 4px 15px rgba(0, 255, 65, 0.15);
            }

            [data-theme="matrix"] .sound-toggle-pulse {
                border-color: rgba(0, 255, 65, 0.5);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Set enabled state programmatically
     */
    setEnabled(enabled) {
        if (this.isEnabled !== enabled) {
            this.toggle();
        }
    }

    /**
     * Destroy the toggle
     */
    destroy() {
        if (this.element) {
            this.element.remove();
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundToggle;
}
