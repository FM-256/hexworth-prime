/**
 * CallsignModal.js - Callsign Selection Modal
 *
 * Prompts users to choose their unique callsign (handle/nickname).
 * Validates format and uniqueness before saving.
 *
 * Features:
 * - Real-time validation feedback
 * - Availability checking
 * - Themed to match Hexworth aesthetic
 * - Generates random suggestions
 */

const CallsignModal = (function() {
    'use strict';

    let modal = null;
    let isOpen = false;
    let currentUser = null;
    let onCompleteCallback = null;

    // Random callsign generators
    const PREFIXES = [
        'SHADOW', 'CIPHER', 'GHOST', 'PHANTOM', 'RAVEN', 'VIPER', 'STORM',
        'NEXUS', 'ECHO', 'ZERO', 'DELTA', 'OMEGA', 'APEX', 'NOVA', 'PULSE',
        'VECTOR', 'PROXY', 'CORE', 'NODE', 'BYTE', 'FLUX', 'VOLT', 'NEON'
    ];

    const SUFFIXES = [
        'X', '7', '13', '42', '99', 'ONE', 'PRIME', 'ZERO', 'MAX', 'ACE',
        'OPS', 'NET', 'SYS', 'HEX', 'BIT', 'KEY', 'EYE', 'GUARD'
    ];

    /**
     * Generate a random callsign suggestion
     */
    function generateRandomCallsign() {
        const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
        const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        const useNumber = Math.random() > 0.5;

        if (useNumber) {
            return `${prefix}_${Math.floor(Math.random() * 99) + 1}`;
        }
        return `${prefix}_${suffix}`;
    }

    /**
     * Generate multiple suggestions
     */
    function generateSuggestions(count = 4) {
        const suggestions = new Set();
        while (suggestions.size < count) {
            suggestions.add(generateRandomCallsign());
        }
        return [...suggestions];
    }

    /**
     * Create the modal DOM
     */
    function createModal() {
        modal = document.createElement('div');
        modal.className = 'callsign-modal-overlay';
        modal.innerHTML = `
            <div class="callsign-modal">
                <div class="callsign-header">
                    <div class="callsign-icon"><img src="/assets/images/icons/icon-antenna.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
                    <h2>Choose Your Callsign</h2>
                    <p>This is your unique identifier across Hexworth Prime</p>
                </div>

                <div class="callsign-input-section">
                    <div class="callsign-input-wrapper">
                        <span class="callsign-prefix">@</span>
                        <input
                            type="text"
                            id="callsign-input"
                            placeholder="SHADOW_42"
                            maxlength="16"
                            autocomplete="off"
                            spellcheck="false"
                        >
                        <div class="callsign-status" id="callsign-status"></div>
                    </div>
                    <div class="callsign-rules">
                        <span>3-16 characters</span>
                        <span>Letters, numbers, underscore</span>
                        <span>Must start with a letter</span>
                    </div>
                </div>

                <div class="callsign-suggestions">
                    <p>Or try one of these:</p>
                    <div class="suggestion-chips" id="suggestion-chips"></div>
                    <button class="refresh-suggestions" id="refresh-suggestions">
                        <img src="/assets/images/icons/icon-refresh.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Generate More
                    </button>
                </div>

                <div class="callsign-actions">
                    <button class="callsign-btn callsign-btn-primary" id="callsign-submit" disabled>
                        Lock In Callsign
                    </button>
                </div>

                <div class="callsign-warning">
                    <span><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span> Choose carefully - callsigns cannot be changed easily
                </div>
            </div>
        `;

        // Inject styles
        injectStyles();

        // Add to DOM
        document.body.appendChild(modal);

        // Bind events
        bindEvents();

        // Generate initial suggestions
        refreshSuggestions();
    }

    /**
     * Inject modal styles
     */
    function injectStyles() {
        if (document.getElementById('callsign-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'callsign-modal-styles';
        styles.textContent = `
            .callsign-modal-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            .callsign-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .callsign-modal {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(57, 255, 20, 0.3);
                border-radius: 20px;
                padding: 40px;
                max-width: 480px;
                width: 90%;
                text-align: center;
                box-shadow: 0 0 60px rgba(57, 255, 20, 0.2);
                transform: scale(0.9);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .callsign-modal-overlay.active .callsign-modal {
                transform: scale(1);
            }

            .callsign-header {
                margin-bottom: 30px;
            }

            .callsign-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .callsign-header h2 {
                color: #39ff14;
                font-size: 1.8rem;
                margin: 0 0 10px 0;
                text-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
            }

            .callsign-header p {
                color: #888;
                margin: 0;
                font-size: 0.95rem;
            }

            .callsign-input-section {
                margin-bottom: 25px;
            }

            .callsign-input-wrapper {
                display: flex;
                align-items: center;
                background: rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 5px 15px;
                transition: border-color 0.3s ease;
            }

            .callsign-input-wrapper:focus-within {
                border-color: #39ff14;
                box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
            }

            .callsign-input-wrapper.valid {
                border-color: #39ff14;
            }

            .callsign-input-wrapper.invalid {
                border-color: #ff4444;
            }

            .callsign-input-wrapper.checking {
                border-color: #ffa500;
            }

            .callsign-prefix {
                color: #39ff14;
                font-size: 1.4rem;
                font-weight: bold;
                margin-right: 5px;
            }

            #callsign-input {
                flex: 1;
                background: none;
                border: none;
                color: #fff;
                font-size: 1.4rem;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                text-transform: uppercase;
                padding: 12px 0;
                outline: none;
            }

            #callsign-input::placeholder {
                color: #444;
            }

            .callsign-status {
                font-size: 1.2rem;
                width: 30px;
                text-align: center;
            }

            .callsign-rules {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 10px;
                flex-wrap: wrap;
            }

            .callsign-rules span {
                color: #808080;
                font-size: 0.75rem;
            }

            .callsign-suggestions {
                margin-bottom: 25px;
            }

            .callsign-suggestions p {
                color: #8a8a8a;
                font-size: 0.85rem;
                margin-bottom: 12px;
            }

            .suggestion-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
                margin-bottom: 12px;
            }

            .suggestion-chip {
                background: rgba(57, 255, 20, 0.1);
                border: 1px solid rgba(57, 255, 20, 0.3);
                color: #39ff14;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.85rem;
                transition: all 0.2s ease;
            }

            .suggestion-chip:hover {
                background: rgba(57, 255, 20, 0.2);
                transform: scale(1.05);
            }

            .refresh-suggestions {
                background: none;
                border: none;
                color: #808080;
                cursor: pointer;
                font-size: 0.8rem;
                padding: 5px 10px;
                transition: color 0.2s ease;
            }

            .refresh-suggestions:hover {
                color: #888;
            }

            .callsign-actions {
                margin-bottom: 20px;
            }

            .callsign-btn {
                padding: 14px 40px;
                border-radius: 30px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }

            .callsign-btn-primary {
                background: linear-gradient(135deg, #39ff14 0%, #32cd32 100%);
                color: #000;
                box-shadow: 0 4px 20px rgba(57, 255, 20, 0.3);
            }

            .callsign-btn-primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 30px rgba(57, 255, 20, 0.5);
            }

            .callsign-btn-primary:disabled {
                background: #333;
                color: #8a8a8a;
                cursor: not-allowed;
                box-shadow: none;
            }

            .callsign-warning {
                color: #8a8a8a;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .callsign-warning span {
                font-size: 1rem;
            }

            /* Loading spinner for checking */
            .callsign-status.checking::after {
                content: '';
                width: 16px;
                height: 16px;
                border: 2px solid #ffa500;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                display: inline-block;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        const input = modal.querySelector('#callsign-input');
        const submitBtn = modal.querySelector('#callsign-submit');
        const refreshBtn = modal.querySelector('#refresh-suggestions');
        const chipsContainer = modal.querySelector('#suggestion-chips');

        // Input validation with debounce
        let debounceTimer;
        input.addEventListener('input', (e) => {
            // Force uppercase
            e.target.value = e.target.value.toUpperCase();

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => validateInput(), 300);
        });

        // Submit
        submitBtn.addEventListener('click', submitCallsign);

        // Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !submitBtn.disabled) {
                submitCallsign();
            }
        });

        // Refresh suggestions
        refreshBtn.addEventListener('click', refreshSuggestions);

        // Suggestion chips (delegated)
        chipsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                input.value = e.target.textContent;
                validateInput();
            }
        });
    }

    /**
     * Validate input and check availability
     */
    async function validateInput() {
        const input = modal.querySelector('#callsign-input');
        const wrapper = modal.querySelector('.callsign-input-wrapper');
        const status = modal.querySelector('#callsign-status');
        const submitBtn = modal.querySelector('#callsign-submit');

        const callsign = input.value.trim();

        // Reset state
        wrapper.classList.remove('valid', 'invalid', 'checking');
        status.classList.remove('checking');
        status.textContent = '';
        submitBtn.disabled = true;

        if (!callsign) return;

        // Format validation
        if (!FirestoreManager.validateCallsign(callsign)) {
            wrapper.classList.add('invalid');
            status.innerHTML = '<img src="/assets/images/icons/icon-crossmark.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">';
            return;
        }

        // Check availability
        wrapper.classList.add('checking');
        status.classList.add('checking');

        const available = await FirestoreManager.isCallsignAvailable(callsign);

        wrapper.classList.remove('checking');
        status.classList.remove('checking');

        if (available) {
            wrapper.classList.add('valid');
            status.innerHTML = '<img src="/assets/images/icons/icon-checkbox.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">';
            submitBtn.disabled = false;
        } else {
            wrapper.classList.add('invalid');
            status.innerHTML = '<img src="/assets/images/icons/icon-crossmark.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">';
        }
    }

    /**
     * Refresh suggestion chips
     */
    function refreshSuggestions() {
        const container = modal.querySelector('#suggestion-chips');
        const suggestions = generateSuggestions(4);

        container.innerHTML = suggestions
            .map(s => `<span class="suggestion-chip">${s}</span>`)
            .join('');
    }

    /**
     * Submit callsign
     */
    async function submitCallsign() {
        const input = modal.querySelector('#callsign-input');
        const submitBtn = modal.querySelector('#callsign-submit');
        const callsign = input.value.trim();

        if (!callsign) return;

        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const result = await FirestoreManager.setCallsign(currentUser.uid, callsign);

            if (result.success) {
                console.log('[CallsignModal] Callsign saved:', callsign);
                close();

                // Dispatch success event
                window.dispatchEvent(new CustomEvent('callsignSet', {
                    detail: { callsign }
                }));

                if (onCompleteCallback) {
                    onCompleteCallback(callsign);
                }
            } else {
                alert(result.error || 'Failed to save callsign. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Lock In Callsign';
            }
        } catch (error) {
            console.error('[CallsignModal] Error saving callsign:', error);
            alert('An error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Lock In Callsign';
        }
    }

    /**
     * Open the modal
     */
    function open(user, callback) {
        if (!modal) createModal();

        currentUser = user;
        onCompleteCallback = callback;

        // Reset input
        const input = modal.querySelector('#callsign-input');
        input.value = '';

        // Reset validation state
        const wrapper = modal.querySelector('.callsign-input-wrapper');
        wrapper.classList.remove('valid', 'invalid', 'checking');

        const status = modal.querySelector('#callsign-status');
        status.textContent = '';
        status.classList.remove('checking');

        const submitBtn = modal.querySelector('#callsign-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Lock In Callsign';

        // Refresh suggestions
        refreshSuggestions();

        // Show modal
        modal.classList.add('active');
        isOpen = true;

        // Focus input
        setTimeout(() => input.focus(), 300);
    }

    /**
     * Close the modal
     */
    function close() {
        if (modal) {
            modal.classList.remove('active');
        }
        isOpen = false;
        currentUser = null;
        onCompleteCallback = null;
    }

    /**
     * Check if modal is open
     */
    function isModalOpen() {
        return isOpen;
    }

    // Public API
    return {
        open,
        close,
        isOpen: isModalOpen
    };

})();
