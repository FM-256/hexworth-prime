/**
 * MascotManager.js — Singleton manager for the Mascot Digital Life System
 *
 * Manages mascot configs, idle animations, reactions, seasonal variants,
 * and state machine transitions. CSS-animation based, no canvas/WebGL.
 *
 * Usage:
 *   const mgr = MascotManager.getInstance();
 *   const mascot = mgr.getMascot('shield');
 *   mgr.triggerReaction('achievement');
 *   const idle = mgr.getIdleAnimation();
 *   const season = mgr.getSeasonalVariant();
 *
 * @version 1.0.0
 */

const MascotManager = (function () {
    'use strict';

    let instance = null;

    // ========================================
    // MASCOT DEFINITIONS
    // ========================================

    const MASCOTS = {
        shield: {
            name: 'Guardian',
            cssClass: 'mascot-guardian',
            color: '#a855f7',
            house: 'Shield',
            domain: 'Defense & Compliance',
            idleAnimation: 'mascot-idle-breathe',
            personality: 'Steadfast protector. Calm under fire.',
            reactions: {
                achievement: { text: 'Defenses reinforced.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Rank upgraded.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Perimeter breached. Regroup.', anim: 'mascot-react-failure' },
                happy:       { text: 'All sectors secure.', anim: 'mascot-react-happy' },
                sad:         { text: 'Shield integrity low.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Standing watch.', anim: 'mascot-react-wave' }
            }
        },
        dark_arts: {
            name: 'Shadow',
            cssClass: 'mascot-shadow',
            color: '#ef4444',
            house: 'Dark Arts',
            domain: 'Offensive Security',
            idleAnimation: 'mascot-idle-sway',
            personality: 'Cunning and quick. Strikes from the dark.',
            reactions: {
                achievement: { text: 'Target neutralized.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'New exploit unlocked.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Detection alert. Evading...', anim: 'mascot-react-failure' },
                happy:       { text: 'Shell acquired.', anim: 'mascot-react-happy' },
                sad:         { text: 'Payload failed.', anim: 'mascot-react-sad' },
                greeting:    { text: '...lurking.', anim: 'mascot-react-wave' }
            }
        },
        eye: {
            name: 'Watcher',
            cssClass: 'mascot-watcher',
            color: '#6366f1',
            house: 'Eye',
            domain: 'Threat Intel & Forensics',
            idleAnimation: 'mascot-idle-pulse',
            personality: 'All-seeing. Nothing escapes its gaze.',
            reactions: {
                achievement: { text: 'Intelligence confirmed.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Clearance elevated.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Blind spot detected.', anim: 'mascot-react-failure' },
                happy:       { text: 'Threat landscape mapped.', anim: 'mascot-react-happy' },
                sad:         { text: 'Intel compromised.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Observing.', anim: 'mascot-react-wave' }
            }
        },
        cloud: {
            name: 'Nimbus',
            cssClass: 'mascot-nimbus',
            color: '#06b6d4',
            house: 'Cloud',
            domain: 'Cloud Infrastructure',
            idleAnimation: 'mascot-idle-float',
            personality: 'Ethereal drifter. Scales infinitely.',
            reactions: {
                achievement: { text: 'Instance deployed.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Region expanded.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Service degraded.', anim: 'mascot-react-failure' },
                happy:       { text: '99.99% uptime.', anim: 'mascot-react-happy' },
                sad:         { text: 'Outage detected.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Floating by.', anim: 'mascot-react-wave' }
            }
        },
        forge: {
            name: 'Ember',
            cssClass: 'mascot-ember',
            color: '#f97316',
            house: 'Forge',
            domain: 'Systems Administration',
            idleAnimation: 'mascot-idle-glow',
            personality: 'Relentless builder. Forges order from chaos.',
            reactions: {
                achievement: { text: 'System hardened.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Forge temperature rising.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Critical failure. Rebuilding.', anim: 'mascot-react-failure' },
                happy:       { text: 'All services nominal.', anim: 'mascot-react-happy' },
                sad:         { text: 'Flame flickering.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Stoking the fire.', anim: 'mascot-react-wave' }
            }
        },
        web: {
            name: 'Weaver',
            cssClass: 'mascot-weaver',
            color: '#60a5fa',
            house: 'Web',
            domain: 'Networking & Protocols',
            idleAnimation: 'mascot-idle-sway',
            personality: 'Patient spinner. Every connection matters.',
            reactions: {
                achievement: { text: 'Connection established.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Network expanded.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Link down.', anim: 'mascot-react-failure' },
                happy:       { text: 'Full mesh achieved.', anim: 'mascot-react-happy' },
                sad:         { text: 'Packet loss critical.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Spinning threads.', anim: 'mascot-react-wave' }
            }
        },
        code: {
            name: 'Logic',
            cssClass: 'mascot-logic',
            color: '#ec4899',
            house: 'Code',
            domain: 'Programming & Algorithms',
            idleAnimation: 'mascot-idle-breathe',
            personality: 'Precise and methodical. Zero tolerance for bugs.',
            reactions: {
                achievement: { text: 'Build passed.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Algorithm optimized.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Syntax error. Debugging.', anim: 'mascot-react-failure' },
                happy:       { text: 'All tests green.', anim: 'mascot-react-happy' },
                sad:         { text: 'Stack overflow.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Hello, World.', anim: 'mascot-react-wave' }
            }
        },
        key: {
            name: 'Cipher',
            cssClass: 'mascot-cipher',
            color: '#eab308',
            house: 'Key',
            domain: 'Cryptography',
            idleAnimation: 'mascot-idle-float',
            personality: 'Enigmatic keeper. Guards every secret.',
            reactions: {
                achievement: { text: 'Ciphertext cracked.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Key length increased.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Decryption failed.', anim: 'mascot-react-failure' },
                happy:       { text: 'Keys rotated. Vault sealed.', anim: 'mascot-react-happy' },
                sad:         { text: 'Key compromised.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Encrypted greetings.', anim: 'mascot-react-wave' }
            }
        },
        script: {
            name: 'Terminal',
            cssClass: 'mascot-terminal',
            color: '#22c55e',
            house: 'Script',
            domain: 'Linux & Automation',
            idleAnimation: 'mascot-idle-breathe',
            personality: 'Reliable penguin. Automates everything.',
            reactions: {
                achievement: { text: 'Script executed. Exit 0.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Root access granted.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Segfault. Core dumped.', anim: 'mascot-react-failure' },
                happy:       { text: 'Cron job succeeded.', anim: 'mascot-react-happy' },
                sad:         { text: 'Permission denied.', anim: 'mascot-react-sad' },
                greeting:    { text: '$ whoami', anim: 'mascot-react-wave' }
            }
        },
        ai: {
            name: 'Neural',
            cssClass: 'mascot-neural',
            color: '#8b5cf6',
            house: 'AI',
            domain: 'Machine Learning & Agents',
            idleAnimation: 'mascot-idle-pulse',
            personality: 'Evolving mind. Learns from everything.',
            reactions: {
                achievement: { text: 'Model converged.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Epoch complete. Loss reduced.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Overfitting detected.', anim: 'mascot-react-failure' },
                happy:       { text: 'Accuracy: 99.7%', anim: 'mascot-react-happy' },
                sad:         { text: 'Gradient vanished.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Processing...', anim: 'mascot-react-wave' }
            }
        },
        matrix: {
            name: 'Architect',
            cssClass: 'mascot-architect',
            color: '#14b8a6',
            house: 'Matrix',
            domain: 'Cross-Domain Mastery',
            idleAnimation: 'mascot-idle-sway',
            personality: 'Abstract designer. Sees the whole system.',
            reactions: {
                achievement: { text: 'Pattern recognized.', anim: 'mascot-react-achievement' },
                levelup:     { text: 'Dimension unlocked.', anim: 'mascot-react-levelup' },
                failure:     { text: 'Matrix destabilized.', anim: 'mascot-react-failure' },
                happy:       { text: 'All vectors aligned.', anim: 'mascot-react-happy' },
                sad:         { text: 'Entropy increasing.', anim: 'mascot-react-sad' },
                greeting:    { text: 'Calculating...', anim: 'mascot-react-wave' }
            }
        }
    };

    // ========================================
    // STATE MACHINE
    // ========================================

    const STATES = { IDLE: 'idle', REACTING: 'reacting', TRANSITIONING: 'transitioning' };

    // ========================================
    // MANAGER CLASS
    // ========================================

    function Manager() {
        this.state = STATES.IDLE;
        this.currentMascot = null;
        this.reactionQueue = [];
        this.activeElement = null;
        this._reactionTimer = null;
    }

    /**
     * Get mascot config by house ID
     * @param {string} house — house key (e.g. 'shield', 'dark_arts')
     * @returns {object|null}
     */
    Manager.prototype.getMascot = function (house) {
        const key = house.replace(/-/g, '_');
        return MASCOTS[key] || null;
    };

    /**
     * Get all mascot definitions
     * @returns {object}
     */
    Manager.prototype.getAllMascots = function () {
        return Object.assign({}, MASCOTS);
    };

    /**
     * Get mascot keys list
     * @returns {string[]}
     */
    Manager.prototype.getMascotKeys = function () {
        return Object.keys(MASCOTS);
    };

    /**
     * Get current idle animation class for bound mascot
     * @param {string} [house] — optional house override
     * @returns {string} CSS class name
     */
    Manager.prototype.getIdleAnimation = function (house) {
        var m = house ? this.getMascot(house) : this.currentMascot;
        if (!m) return 'mascot-idle-float';
        return m.idleAnimation;
    };

    /**
     * Get seasonal variant info based on current date
     * @returns {{ season: string, cssClass: string, label: string }}
     */
    Manager.prototype.getSeasonalVariant = function () {
        return MascotSeasonal ? MascotSeasonal.getCurrentSeason() : { season: 'none', cssClass: '', label: '' };
    };

    /**
     * Bind manager to a specific house (sets currentMascot)
     * @param {string} house
     */
    Manager.prototype.bind = function (house) {
        this.currentMascot = this.getMascot(house);
    };

    /**
     * Bind to a DOM element for animation control
     * @param {HTMLElement} el
     */
    Manager.prototype.bindElement = function (el) {
        this.activeElement = el;
    };

    /**
     * Trigger a reaction animation
     * @param {string} event — reaction key: achievement, levelup, failure, happy, sad, greeting
     * @param {HTMLElement} [el] — optional element override
     */
    Manager.prototype.triggerReaction = function (event, el) {
        var target = el || this.activeElement;
        var mascot = this.currentMascot;
        if (!mascot || !target) return;

        var reaction = mascot.reactions[event];
        if (!reaction) return;

        // Queue if already reacting
        if (this.state === STATES.REACTING) {
            this.reactionQueue.push({ event: event, el: target });
            return;
        }

        this._playReaction(reaction, target);
    };

    /**
     * Play a reaction (internal)
     */
    Manager.prototype._playReaction = function (reaction, el) {
        var self = this;
        this.state = STATES.REACTING;

        // Remove idle animation
        var idleClass = this.currentMascot ? this.currentMascot.idleAnimation : '';
        if (idleClass) el.classList.remove(idleClass);

        // Add reaction animation
        el.classList.add(reaction.anim);

        // Show speech bubble
        this._showSpeech(el, reaction.text);

        // Clear after animation ends
        clearTimeout(this._reactionTimer);
        this._reactionTimer = setTimeout(function () {
            el.classList.remove(reaction.anim);
            self._hideSpeech(el);

            // Restore idle
            if (idleClass) el.classList.add(idleClass);
            self.state = STATES.IDLE;

            // Process queue
            if (self.reactionQueue.length > 0) {
                var next = self.reactionQueue.shift();
                var nextReaction = self.currentMascot.reactions[next.event];
                if (nextReaction) {
                    self._playReaction(nextReaction, next.el);
                }
            }
        }, 1500);
    };

    /**
     * Show speech bubble on element
     */
    Manager.prototype._showSpeech = function (el, text) {
        this._hideSpeech(el);
        var bubble = document.createElement('div');
        bubble.className = 'mascot-speech';
        bubble.textContent = text;
        el.style.position = 'relative';
        el.appendChild(bubble);
    };

    /**
     * Remove speech bubble
     */
    Manager.prototype._hideSpeech = function (el) {
        var existing = el.querySelector('.mascot-speech');
        if (existing) existing.remove();
    };

    /**
     * Render a mascot entity as DOM element
     * @param {string} house — house key
     * @param {object} [opts] — { showName: bool, size: 'sm'|'md'|'lg' }
     * @returns {HTMLElement}
     */
    Manager.prototype.renderMascot = function (house, opts) {
        opts = opts || {};
        var m = this.getMascot(house);
        if (!m) return document.createElement('div');

        var entity = document.createElement('div');
        entity.className = 'mascot-entity ' + m.cssClass;
        entity.style.setProperty('--mascot-color', m.color);

        var scale = opts.size === 'sm' ? 0.7 : opts.size === 'lg' ? 1.4 : 1;
        entity.style.transform = 'scale(' + scale + ')';

        // Body
        var body = document.createElement('div');
        body.className = 'mascot-body';
        entity.appendChild(body);

        // Eyes
        var eyes = document.createElement('div');
        eyes.className = 'mascot-eyes';
        var eyeL = document.createElement('div');
        eyeL.className = 'mascot-eye';
        eyeL.style.setProperty('--blink-offset', String(Math.random() * 2));
        var eyeR = document.createElement('div');
        eyeR.className = 'mascot-eye';
        eyeR.style.setProperty('--blink-offset', String(Math.random() * 2 + 1));
        eyes.appendChild(eyeL);
        eyes.appendChild(eyeR);
        entity.appendChild(eyes);

        // Detail (shape-specific accent)
        var detail = document.createElement('div');
        detail.className = 'mascot-detail';
        entity.appendChild(detail);

        // Name tag
        if (opts.showName !== false) {
            var tag = document.createElement('div');
            tag.className = 'mascot-name-tag';
            tag.textContent = m.name;
            entity.appendChild(tag);
        }

        // Idle animation
        entity.classList.add(m.idleAnimation);

        // Seasonal overlay
        var season = this.getSeasonalVariant();
        if (season.cssClass) {
            entity.classList.add(season.cssClass);
        }

        return entity;
    };

    // ========================================
    // SINGLETON
    // ========================================

    return {
        getInstance: function () {
            if (!instance) {
                instance = new Manager();
            }
            return instance;
        },
        MASCOTS: MASCOTS,
        STATES: STATES
    };
})();
