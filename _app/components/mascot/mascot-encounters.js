/**
 * mascot-encounters.js — Cross-mascot encounter system
 *
 * Generates random encounter events between mascots with unique dialogue
 * per pair. Can be triggered periodically or on specific events.
 *
 * Usage:
 *   MascotEncounters.init({ container: document.getElementById('terrarium') });
 *   MascotEncounters.triggerRandom();
 *   MascotEncounters.triggerEncounter('shield', 'dark_arts');
 *
 * @version 1.0.0
 */

var MascotEncounters = (function () {
    'use strict';

    var _container = null;
    var _active = false;
    var _autoTimer = null;
    var _encounterLog = [];

    // ========================================
    // ENCOUNTER DIALOGUES
    // Key format: "houseA|houseB" (alphabetical order)
    // Each entry: array of { a: text, b: text } exchanges
    // ========================================

    var DIALOGUES = {
        'dark_arts|shield': [
            { a: 'Your defenses are impressive.', b: 'Your attacks keep them sharp.' },
            { a: 'Found a gap in sector 7.', b: 'Patching now. Thanks for the report.' },
            { a: 'Red team inbound.', b: 'Blue team ready.' }
        ],
        'cloud|shield': [
            { a: 'Cloud perimeter secured?', b: 'Every availability zone.' },
            { a: 'Scaling up defenses.', b: 'Approved. Deploy at will.' },
            { a: 'Shared responsibility model.', b: 'We own our layer.' }
        ],
        'dark_arts|eye': [
            { a: 'Think you can track me?', b: 'Already have. Three steps ahead.' },
            { a: 'Going dark.', b: 'Your digital footprint says otherwise.' },
            { a: 'Catch me if you can.', b: 'Captured at 14:32:07 UTC.' }
        ],
        'code|dark_arts': [
            { a: 'Your exploit has a bug on line 47.', b: '...noted.' },
            { a: 'That payload needs a refactor.', b: 'It works. That is enough.' },
            { a: 'Code review on your rootkit?', b: 'Hard pass.' }
        ],
        'cloud|dark_arts': [
            { a: 'Your S3 bucket is public.', b: 'That is the point.' },
            { a: 'Interesting IAM policy.', b: 'Feature, not a bug.' },
            { a: 'Cloud security scan found 47 issues.', b: '47 opportunities.' }
        ],
        'eye|shield': [
            { a: 'Threat intel incoming.', b: 'Feed it to the firewall.' },
            { a: 'APT-29 activity detected.', b: 'Raising DEFCON level.' },
            { a: 'New IOCs uploaded.', b: 'SIEM rules updated.' }
        ],
        'cloud|forge': [
            { a: 'Need more compute.', b: 'Provisioning bare metal.' },
            { a: 'Serverless or containers?', b: 'Real servers. Real racks.' },
            { a: 'Auto-scaling triggered.', b: 'The forge provides.' }
        ],
        'forge|web': [
            { a: 'DNS propagation complete?', b: 'All resolvers updated.' },
            { a: 'Server rack 7 is hot.', b: 'Rerouting traffic through rack 3.' },
            { a: 'Hardware or software issue?', b: 'Layer 1. Always layer 1.' }
        ],
        'code|script': [
            { a: 'Python or Bash for this?', b: 'Bash. Always Bash.' },
            { a: 'Your function has no error handling.', b: 'set -e. Done.' },
            { a: 'Object-oriented approach?', b: 'Pipe it. grep it. Done.' }
        ],
        'ai|code': [
            { a: 'Training complete. Accuracy 99.2%.', b: 'Show me the unit tests.' },
            { a: 'Neural network optimized.', b: 'But does it compile?' },
            { a: 'The model predicts success.', b: 'The tests confirm failure.' }
        ],
        'ai|eye': [
            { a: 'Anomaly detected in network traffic.', b: 'Correlating with threat feeds.' },
            { a: 'Pattern recognition active.', b: 'Human analysis confirms.' },
            { a: 'My model sees everything.', b: 'So do I. Without electricity.' }
        ],
        'key|dark_arts': [
            { a: 'Try to crack this.', b: 'AES-256? Give me a century.' },
            { a: 'Your encrypted channel leaks metadata.', b: 'The ciphertext holds.' },
            { a: 'Brute force?', b: 'Not in this universe.' }
        ],
        'key|code': [
            { a: 'Implement this cipher.', b: 'Never roll your own crypto.' },
            { a: 'Key exchange protocol ready.', b: 'Integrating into the library.' },
            { a: 'Entropy source needed.', b: 'Using /dev/urandom.' }
        ],
        'matrix|ai': [
            { a: 'The architecture transcends layers.', b: 'My neural net agrees.' },
            { a: 'Cross-domain pattern detected.', b: 'Training on that vector now.' },
            { a: 'Everything connects.', b: 'That is what networks do.' }
        ],
        'matrix|shield': [
            { a: 'Defense in depth. I see all layers.', b: 'Good. Guard them all.' },
            { a: 'The blueprint shows a weakness.', b: 'Reinforcing now.' },
            { a: 'Holistic security assessment.', b: 'Report accepted.' }
        ],
        'forge|script': [
            { a: 'Server needs a rebuild.', b: 'Automated playbook ready.' },
            { a: 'Manual configuration?', b: 'Ansible handles that now.' },
            { a: 'The hardware is ready.', b: 'The script is too.' }
        ],
        'cloud|web': [
            { a: 'CDN latency is up.', b: 'Rerouting through edge nodes.' },
            { a: 'Load balancer healthy?', b: 'All backend targets green.' },
            { a: 'Multi-region deployment.', b: 'Mesh network spanning all zones.' }
        ],
        'eye|web': [
            { a: 'Suspicious traffic on port 443.', b: 'Deep packet inspection running.' },
            { a: 'Network forensics needed.', b: 'Capturing packets now.' },
            { a: 'Follow the data flow.', b: 'Traceroute complete.' }
        ],
        'forge|key': [
            { a: 'HSM module installed.', b: 'Keys stored in hardware.' },
            { a: 'Disk encryption on all servers?', b: 'LUKS on every volume.' },
            { a: 'Physical security check.', b: 'Tamper seals intact.' }
        ],
        'ai|script': [
            { a: 'Need a training pipeline.', b: 'Bash wrapper around PyTorch.' },
            { a: 'Deploy the model to production.', b: 'Cron job or systemd service?' },
            { a: 'GPU utilization report.', b: 'nvidia-smi | grep MiB.' }
        ],
        'matrix|eye': [
            { a: 'The full picture emerges.', b: 'Every pixel catalogued.' },
            { a: 'Cross-reference all domains.', b: 'OSINT feeds integrated.' },
            { a: 'Convergence point identified.', b: 'Eyes on target.' }
        ]
    };

    // ========================================
    // CORE FUNCTIONS
    // ========================================

    /**
     * Initialize encounter system
     * @param {object} opts — { container: HTMLElement, autoInterval: number (ms, 0 = disabled) }
     */
    function init(opts) {
        opts = opts || {};
        _container = opts.container || null;

        if (opts.autoInterval && opts.autoInterval > 0) {
            startAuto(opts.autoInterval);
        }
    }

    /**
     * Start auto-triggering encounters at interval
     * @param {number} intervalMs — milliseconds between encounters (default 30000)
     */
    function startAuto(intervalMs) {
        stopAuto();
        _autoTimer = setInterval(function () {
            triggerRandom();
        }, intervalMs || 30000);
    }

    /**
     * Stop auto encounters
     */
    function stopAuto() {
        if (_autoTimer) {
            clearInterval(_autoTimer);
            _autoTimer = null;
        }
    }

    /**
     * Get the dialogue key for two houses (alphabetical order)
     */
    function _dialogueKey(houseA, houseB) {
        var a = houseA.replace(/-/g, '_');
        var b = houseB.replace(/-/g, '_');
        var sorted = [a, b].sort();
        return sorted[0] + '|' + sorted[1];
    }

    /**
     * Pick a random element from an array
     */
    function _pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Pick two random distinct mascot keys
     * @returns {string[]} [houseA, houseB]
     */
    function _pickPair() {
        var keys = Object.keys(MascotManager.MASCOTS);
        var a = _pick(keys);
        var b;
        do { b = _pick(keys); } while (b === a);
        return [a, b];
    }

    /**
     * Trigger a random encounter between two random mascots
     * @returns {{ houseA: string, houseB: string, dialogue: object }|null}
     */
    function triggerRandom() {
        if (_active) return null;

        var pair = _pickPair();
        return triggerEncounter(pair[0], pair[1]);
    }

    /**
     * Trigger a specific encounter between two mascots
     * @param {string} houseA
     * @param {string} houseB
     * @returns {{ houseA: string, houseB: string, dialogue: object }|null}
     */
    function triggerEncounter(houseA, houseB) {
        if (_active) return null;

        var keyA = houseA.replace(/-/g, '_');
        var keyB = houseB.replace(/-/g, '_');
        var key = _dialogueKey(keyA, keyB);

        var dialogues = DIALOGUES[key];
        if (!dialogues || dialogues.length === 0) {
            // Generate a generic encounter
            dialogues = [_generateGeneric(keyA, keyB)];
        }

        var dialogue = _pick(dialogues);
        var sorted = [keyA, keyB].sort();

        var encounter = {
            houseA: sorted[0],
            houseB: sorted[1],
            dialogue: dialogue,
            timestamp: Date.now()
        };

        _encounterLog.push(encounter);
        _active = true;

        // Dispatch event
        _dispatchEncounter(encounter);

        // Animate if container is set
        if (_container) {
            _animateEncounter(encounter);
        }

        return encounter;
    }

    /**
     * Generate a generic dialogue for pairs without specific lines
     */
    function _generateGeneric(houseA, houseB) {
        var mgr = MascotManager.getInstance();
        var mA = mgr.getMascot(houseA);
        var mB = mgr.getMascot(houseB);
        var nameA = mA ? mA.name : houseA;
        var nameB = mB ? mB.name : houseB;
        return {
            a: nameA + ', reporting in.',
            b: nameB + ', acknowledged.'
        };
    }

    /**
     * Dispatch a custom DOM event for encounter
     */
    function _dispatchEncounter(encounter) {
        if (typeof CustomEvent === 'function') {
            document.dispatchEvent(new CustomEvent('mascot-encounter', { detail: encounter }));
        }
    }

    /**
     * Animate encounter in the container (terrarium context)
     */
    function _animateEncounter(encounter) {
        // Find mascot elements in container
        var elA = _container.querySelector('[data-mascot="' + encounter.houseA + '"]');
        var elB = _container.querySelector('[data-mascot="' + encounter.houseB + '"]');

        if (!elA || !elB) {
            _active = false;
            return;
        }

        // Approach animation
        elA.classList.add('mascot-terrarium-approach');
        elB.classList.add('mascot-terrarium-approach');

        // Show speech after approach starts
        setTimeout(function () {
            _showEncounterSpeech(elA, encounter.dialogue.a);
        }, 500);

        setTimeout(function () {
            _showEncounterSpeech(elB, encounter.dialogue.b);
        }, 1500);

        // Cleanup
        setTimeout(function () {
            elA.classList.remove('mascot-terrarium-approach');
            elB.classList.remove('mascot-terrarium-approach');
            _hideEncounterSpeech(elA);
            _hideEncounterSpeech(elB);
            _active = false;
        }, 4000);
    }

    /**
     * Show encounter speech bubble
     */
    function _showEncounterSpeech(el, text) {
        _hideEncounterSpeech(el);
        var bubble = document.createElement('div');
        bubble.className = 'mascot-speech';
        bubble.textContent = text;
        el.appendChild(bubble);
    }

    /**
     * Remove encounter speech bubble
     */
    function _hideEncounterSpeech(el) {
        var existing = el.querySelector('.mascot-speech');
        if (existing) existing.remove();
    }

    /**
     * Get encounter log
     * @returns {object[]}
     */
    function getLog() {
        return _encounterLog.slice();
    }

    /**
     * Get all dialogue keys (for testing/debug)
     * @returns {string[]}
     */
    function getDialogueKeys() {
        return Object.keys(DIALOGUES);
    }

    /**
     * Check if a specific pair has custom dialogues
     * @param {string} houseA
     * @param {string} houseB
     * @returns {boolean}
     */
    function hasPairDialogue(houseA, houseB) {
        var key = _dialogueKey(houseA, houseB);
        return !!DIALOGUES[key];
    }

    // ========================================
    // PUBLIC API
    // ========================================

    return {
        init: init,
        triggerRandom: triggerRandom,
        triggerEncounter: triggerEncounter,
        startAuto: startAuto,
        stopAuto: stopAuto,
        getLog: getLog,
        getDialogueKeys: getDialogueKeys,
        hasPairDialogue: hasPairDialogue,
        DIALOGUES: DIALOGUES
    };
})();
