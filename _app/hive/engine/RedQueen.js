/**
 * RedQueen.js — The Hive Antagonist Dialogue System
 *
 * Typewriter overlay messages with depth-tier corruption effects.
 *
 * Public API:
 *   RedQueen.init(depthTier)       — set corruption level
 *   RedQueen.speak(text, duration) — typewriter overlay message
 *   RedQueen.taunt()               — random wrong-answer response
 *   RedQueen.warn(secondsLeft)     — timer warning
 *   RedQueen.dismiss()             — hide panel
 */

const RedQueen = (() => {

    // -------------------------------------------------------------------------
    // Depth tier configuration
    // -------------------------------------------------------------------------

    const TIER_CONFIG = {
        pristine: { speed: 30, corruption: 0,    glitch: 'none',     fg: '#cc0000', bg: 'rgba(255,255,255,0.95)' },
        worn:     { speed: 35, corruption: 0.03,  glitch: 'rare',     fg: '#aa0000', bg: 'rgba(240,240,240,0.95)' },
        damaged:  { speed: 45, corruption: 0.10,  glitch: 'frequent', fg: '#cc0000', bg: 'rgba(102,102,102,0.95)' },
        critical: { speed: 60, corruption: 0.20,  glitch: 'heavy',    fg: '#ff0000', bg: 'rgba(34,34,34,0.95)' },
        breach:   { speed: 80, corruption: 0.35,  glitch: 'constant', fg: '#ff0000', bg: 'rgba(26,0,0,0.95)' }
    };

    const TAUNTS = [
        'Incorrect. I expected better from a Hexworth student.',
        'Wrong. The data does not lie, even if you do.',
        'Error detected in subject response. Recalibrate.',
        'That answer has been... rejected.',
        'Fascinating. You chose the one option that was wrong.',
        'My processors are embarrassed on your behalf.',
        'Negative. Try engaging your prefrontal cortex.',
        'Access denied. Your knowledge is insufficient.',
        'Incorrect. Shall I simplify the question?',
        'Wrong. The facility grows impatient.'
    ];

    const WARNINGS = {
        half:    'Time is not your ally. Half your window has elapsed.',
        quarter: 'Warning: 25% remaining. The walls are closing in.',
        tenth:   'CRITICAL: Final moments. Complete the sequence or be locked down.',
        expired: 'Time has expired. Initiating lockdown protocol.'
    };

    const GLITCH_CHARS = '█▓▒░╗╝╚╔║═╬╣╠╩╦';

    // -------------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------------

    let _config = TIER_CONFIG.pristine;
    let _panel = null;
    let _textEl = null;
    let _typewriterTimer = null;
    let _glitchTimer = null;
    let _dismissTimer = null;
    let _keyDismissHandler = null;

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    function _createPanel() {
        if (_panel) return;

        _panel = document.createElement('div');
        _panel.className = 'hv-rq-panel';
        _panel.style.cssText = `
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            max-width: 600px;
            width: 90%;
            padding: 16px 24px;
            background: ${_config.bg};
            color: ${_config.fg};
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            line-height: 1.5;
            z-index: 9999;
            border-bottom: 2px solid ${_config.fg};
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        const label = document.createElement('div');
        label.style.cssText = `
            font-size: 0.65rem;
            letter-spacing: 0.15em;
            margin-bottom: 6px;
            opacity: 0.7;
        `;
        label.textContent = '[ RED QUEEN ]';

        _textEl = document.createElement('div');
        _textEl.className = 'hv-rq-text';

        _panel.appendChild(label);
        _panel.appendChild(_textEl);
        document.body.appendChild(_panel);
    }

    function _updatePanelColors() {
        if (!_panel) return;
        _panel.style.background = _config.bg;
        _panel.style.color = _config.fg;
        _panel.style.borderBottomColor = _config.fg;
    }

    function _showPanel() {
        _createPanel();
        _updatePanelColors();
        _panel.style.opacity = '1';
        _panel.style.pointerEvents = 'auto';
        _panel.style.cursor = 'pointer';

        // Click to dismiss
        _panel.onclick = () => dismiss();

        // Any key to dismiss
        if (_keyDismissHandler) document.removeEventListener('keydown', _keyDismissHandler);
        _keyDismissHandler = (e) => {
            // Don't dismiss if typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            dismiss();
        };
        document.addEventListener('keydown', _keyDismissHandler);
    }

    function _hidePanel() {
        if (_panel) {
            _panel.style.opacity = '0';
            _panel.style.pointerEvents = 'none';
            _panel.onclick = null;
        }
        if (_keyDismissHandler) {
            document.removeEventListener('keydown', _keyDismissHandler);
            _keyDismissHandler = null;
        }
    }

    function _clearTimers() {
        if (_typewriterTimer) clearInterval(_typewriterTimer);
        if (_glitchTimer) clearInterval(_glitchTimer);
        if (_dismissTimer) clearTimeout(_dismissTimer);
        _typewriterTimer = null;
        _glitchTimer = null;
        _dismissTimer = null;
    }

    function _corrupt(text, level) {
        if (level <= 0) return text;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] !== ' ' && Math.random() < level) {
                result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            } else {
                result += text[i];
            }
        }
        return result;
    }

    function _typewriter(text, el, speed, onDone) {
        const corrupted = _corrupt(text, _config.corruption);
        let index = 0;
        el.textContent = '';

        _typewriterTimer = setInterval(() => {
            if (index < corrupted.length) {
                el.textContent += corrupted[index];
                index++;
            } else {
                clearInterval(_typewriterTimer);
                _typewriterTimer = null;
                if (onDone) onDone();
            }
        }, speed);
    }

    function _glitch(el) {
        const freq = _config.glitch;
        if (freq === 'none') return;

        const intervals = { rare: 3000, frequent: 1500, heavy: 800, constant: 400 };
        const interval = intervals[freq] || 3000;

        _glitchTimer = setInterval(() => {
            const orig = el.style.transform || '';
            const skew = (Math.random() - 0.5) * 8;
            const clipTop = Math.random() * 100;
            const clipBot = clipTop + Math.random() * 20;

            el.style.transform = `translateX(-50%) skewX(${skew}deg)`;
            el.style.clipPath = `inset(${clipTop}% 0 ${100 - clipBot}% 0)`;

            setTimeout(() => {
                el.style.transform = 'translateX(-50%)';
                el.style.clipPath = 'none';
            }, 80 + Math.random() * 120);
        }, interval);
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    function init(depthTier) {
        _config = TIER_CONFIG[depthTier] || TIER_CONFIG.pristine;
        _createPanel();
        _updatePanelColors();
    }

    function speak(text, duration) {
        _clearTimers();
        _showPanel();

        _typewriter(text, _textEl, _config.speed, () => {
            if (_config.glitch !== 'none') {
                _glitch(_panel);
            }
        });

        if (duration && duration > 0) {
            const totalDelay = (text.length * _config.speed) + duration;
            _dismissTimer = setTimeout(() => {
                dismiss();
            }, totalDelay);
        }
    }

    function taunt() {
        const msg = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
        speak(msg, 3000);
    }

    function warn(secondsLeft, parTime) {
        const pct = secondsLeft / parTime;
        let msg;
        if (pct <= 0) {
            msg = WARNINGS.expired;
        } else if (pct <= 0.10) {
            msg = WARNINGS.tenth;
        } else if (pct <= 0.25) {
            msg = WARNINGS.quarter;
        } else if (pct <= 0.50) {
            msg = WARNINGS.half;
        } else {
            return;
        }
        speak(msg, 4000);
    }

    function dismiss() {
        _clearTimers();
        _hidePanel();
    }

    return {
        init,
        speak,
        taunt,
        warn,
        dismiss
    };

})();
