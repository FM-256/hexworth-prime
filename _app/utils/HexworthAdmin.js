/**
 * HexworthAdmin.js - God Mode & Admin Tools
 *
 * Provides administrative access to the Hexworth Prime platform:
 * - God Mode: Bypass all gates, locks, and restrictions
 * - Does NOT persist across sessions (re-activation required)
 * - Visual indicator: Spawns the God Particle in Digital Life
 *
 * Activation Methods:
 * 1. Console: HexworthAdmin.godMode()
 * 2. Secret: Triple-click "HEXWORTH PRIME" footer text
 *
 * Deactivation:
 * - HexworthAdmin.mortal() or refresh page
 */

const HexworthAdmin = {
    // State
    isGodMode: false,
    godParticle: null,
    activationClicks: 0,
    lastClickTime: 0,

    /**
     * Enable God Mode
     * Bypasses all gates and spawns the God Particle
     */
    godMode: function() {
        if (this.isGodMode) {
            console.log('%c👁️ Already in God Mode', 'color: #a855f7; font-size: 14px;');
            return;
        }

        this.isGodMode = true;
        window.godMode = true; // Global flag for gate checks

        // Console announcement
        console.log('%c' + '═'.repeat(50), 'color: #a855f7;');
        console.log('%c👁️  G O D   M O D E   A C T I V A T E D  👁️', 'color: #a855f7; font-size: 20px; font-weight: bold;');
        console.log('%c' + '═'.repeat(50), 'color: #a855f7;');
        console.log('%cAll gates unlocked. All paths open.', 'color: #c084fc; font-style: italic;');
        console.log('%cTo deactivate: HexworthAdmin.mortal()', 'color: #666;');

        // Spawn God Particle if Digital Life is active
        this.spawnGodParticle();

        // Add visual indicator to page
        this.addGodModeIndicator();

        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('godModeActivated'));

        return '👁️ You see all. You access all.';
    },

    /**
     * Disable God Mode
     * Returns to normal user state
     */
    mortal: function() {
        if (!this.isGodMode) {
            console.log('%c🚫 Not in God Mode', 'color: #666;');
            return;
        }

        this.isGodMode = false;
        window.godMode = false;

        // Remove God Particle
        this.removeGodParticle();

        // Remove visual indicator
        this.removeGodModeIndicator();

        console.log('%c👤 Returned to mortal state', 'color: #666; font-style: italic;');

        // Dispatch event
        window.dispatchEvent(new CustomEvent('godModeDeactivated'));

        return '👤 You are mortal once more.';
    },

    /**
     * Toggle God Mode
     */
    toggle: function() {
        return this.isGodMode ? this.mortal() : this.godMode();
    },

    /**
     * Check if God Mode is active
     */
    isActive: function() {
        return this.isGodMode;
    },

    /**
     * Spawn the God Particle in the Digital Life ecosystem
     */
    spawnGodParticle: function() {
        // Check if GodParticle class exists
        if (typeof GodParticle === 'undefined') {
            console.log('%c⚠️ GodParticle entity not loaded', 'color: #fbbf24;');
            return;
        }

        // Find the Digital Life container
        const container = document.getElementById('digital-life-container') ||
                         document.querySelector('.digital-life-canvas') ||
                         document.body;

        // Create and spawn God Particle
        this.godParticle = new GodParticle({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });

        this.godParticle.createElement(container);
        this.godParticle.start();

        // Notify ecosystem if available
        if (window.digitalLife && window.digitalLife.ecosystem) {
            window.digitalLife.godParticle = this.godParticle;
        }

        console.log('%c👁️ God Particle manifested', 'color: #a855f7;');
    },

    /**
     * Remove the God Particle
     */
    removeGodParticle: function() {
        if (this.godParticle) {
            this.godParticle.destroy();
            this.godParticle = null;

            if (window.digitalLife) {
                window.digitalLife.godParticle = null;
            }
        }
    },

    /**
     * Add visual indicator that God Mode is active
     */
    addGodModeIndicator: function() {
        // Remove existing if any
        this.removeGodModeIndicator();

        const indicator = document.createElement('div');
        indicator.id = 'god-mode-indicator';
        indicator.innerHTML = '👁️ GOD MODE';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(139, 92, 246, 0.9));
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-family: 'Segoe UI', sans-serif;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.1em;
            z-index: 99999;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3);
            animation: godPulse 2s ease-in-out infinite;
            pointer-events: none;
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('god-mode-styles')) {
            const style = document.createElement('style');
            style.id = 'god-mode-styles';
            style.textContent = `
                @keyframes godPulse {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(168, 85, 247, 0.7), 0 0 60px rgba(168, 85, 247, 0.5);
                        transform: scale(1.05);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(indicator);
    },

    /**
     * Remove the God Mode indicator
     */
    removeGodModeIndicator: function() {
        const indicator = document.getElementById('god-mode-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    /**
     * Handle footer click for secret activation
     * Call this on each click of the footer text
     */
    handleFooterClick: function() {
        const now = Date.now();

        // Reset if too much time passed (500ms between clicks)
        if (now - this.lastClickTime > 500) {
            this.activationClicks = 0;
        }

        this.lastClickTime = now;
        this.activationClicks++;

        // Triple-click activates
        if (this.activationClicks >= 3) {
            this.activationClicks = 0;
            this.toggle();
        }
    },

    /**
     * Initialize the admin system
     * Sets up footer click listener
     */
    init: function() {
        // Look for footer note element
        const footerNote = document.querySelector('.footer-note');
        if (footerNote) {
            footerNote.style.cursor = 'default'; // Don't hint it's clickable
            footerNote.addEventListener('click', () => this.handleFooterClick());
        }

        // Make available globally
        window.HexworthAdmin = this;

        console.log('%c🔐 Admin system initialized', 'color: #666; font-size: 10px;');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HexworthAdmin.init());
} else {
    HexworthAdmin.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HexworthAdmin;
}
