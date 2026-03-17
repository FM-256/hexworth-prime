/**
 * IdleDetector.js — Inactivity Help Prompt
 *
 * Watches for user inactivity and shows a non-intrusive "Need help?" banner.
 * Integrates with ProgressiveHints to encourage hint usage.
 *
 * Usage:
 *   IdleDetector.start({
 *       timeout: 120000,        // 2 minutes (default)
 *       container: '#main',     // Where to show the banner
 *       message: 'Stuck? Try the hint system!',
 *       onIdle: () => { },      // Optional callback
 *       hintText: 'Show Hint',  // Button text
 *       onHintClick: () => { ProgressiveHints.revealNext(); }
 *   });
 *
 *   // Clean up
 *   IdleDetector.stop();
 */
const IdleDetector = (function() {
    'use strict';

    let _timer = null;
    let _bannerEl = null;
    let _listeners = [];
    let _config = {
        timeout: 120000,
        container: null,
        message: 'Taking a while? Try using the hint system or check the Quick Reference.',
        hintText: 'Show Hint',
        onIdle: null,
        onHintClick: null,
        referenceUrl: null  // optional link to quick reference
    };

    function start(options = {}) {
        // Merge options
        Object.assign(_config, options);

        // Inject styles
        _injectStyles();

        // Set up activity listeners
        const events = ['keydown', 'mousedown', 'mousemove', 'touchstart', 'scroll'];
        events.forEach(evt => {
            const handler = () => _resetTimer();
            document.addEventListener(evt, handler, { passive: true });
            _listeners.push({ event: evt, handler });
        });

        // Start the timer
        _resetTimer();
    }

    function stop() {
        if (_timer) clearTimeout(_timer);
        _timer = null;

        // Remove listeners
        _listeners.forEach(({ event, handler }) => {
            document.removeEventListener(event, handler);
        });
        _listeners = [];

        // Remove banner if showing
        _dismissBanner();
    }

    function _resetTimer() {
        if (_timer) clearTimeout(_timer);
        _dismissBanner();
        _timer = setTimeout(_onIdle, _config.timeout);
    }

    function _onIdle() {
        _showBanner();
        if (_config.onIdle) _config.onIdle();
    }

    function _showBanner() {
        if (_bannerEl) return; // Already showing

        const container = _config.container
            ? document.querySelector(_config.container)
            : document.body;
        if (!container) return;

        _bannerEl = document.createElement('div');
        _bannerEl.className = 'idle-detector-banner';

        let buttonsHtml = '';
        if (_config.onHintClick) {
            buttonsHtml += `<button class="idle-btn idle-btn-hint">${_config.hintText}</button>`;
        }
        if (_config.referenceUrl) {
            buttonsHtml += `<a class="idle-btn idle-btn-ref" href="${_config.referenceUrl}" target="_blank">Quick Reference</a>`;
        }
        buttonsHtml += '<button class="idle-btn idle-btn-dismiss">Dismiss</button>';

        _bannerEl.innerHTML = `
            <div class="idle-detector-inner">
                <span class="idle-detector-icon">?</span>
                <span class="idle-detector-msg">${_config.message}</span>
                <div class="idle-detector-actions">${buttonsHtml}</div>
            </div>
        `;

        // Wire buttons
        const hintBtn = _bannerEl.querySelector('.idle-btn-hint');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                _dismissBanner();
                _resetTimer();
                if (_config.onHintClick) _config.onHintClick();
            });
        }

        const dismissBtn = _bannerEl.querySelector('.idle-btn-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                _dismissBanner();
                _resetTimer();
            });
        }

        container.appendChild(_bannerEl);
    }

    function _dismissBanner() {
        if (_bannerEl) {
            _bannerEl.remove();
            _bannerEl = null;
        }
    }

    function _injectStyles() {
        if (document.getElementById('idle-detector-styles')) return;

        const style = document.createElement('style');
        style.id = 'idle-detector-styles';
        style.textContent = `
            .idle-detector-banner {
                position: absolute;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9000;
                animation: idleFadeIn 0.4s ease;
                max-width: 600px;
                width: calc(100% - 40px);
            }
            @keyframes idleFadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .idle-detector-inner {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(20, 20, 35, 0.95);
                border: 1px solid rgba(167, 139, 250, 0.4);
                border-radius: 10px;
                padding: 12px 18px;
                backdrop-filter: blur(8px);
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                flex-wrap: wrap;
            }
            .idle-detector-icon {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(167, 139, 250, 0.2);
                border: 1px solid #a78bfa;
                color: #a78bfa;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.9rem;
                flex-shrink: 0;
            }
            .idle-detector-msg {
                flex: 1;
                color: #d1d5db;
                font-size: 0.85rem;
                line-height: 1.4;
                min-width: 150px;
            }
            .idle-detector-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }
            .idle-btn {
                padding: 5px 14px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 600;
                transition: all 0.2s;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
            }
            .idle-btn-hint {
                background: #a78bfa;
                color: #0a0a0f;
            }
            .idle-btn-hint:hover {
                background: #c4b5fd;
            }
            .idle-btn-ref {
                background: transparent;
                color: #a78bfa;
                border: 1px solid rgba(167, 139, 250, 0.4);
            }
            .idle-btn-ref:hover {
                border-color: #a78bfa;
            }
            .idle-btn-dismiss {
                background: transparent;
                color: #6b7280;
                border: 1px solid #4a5568;
            }
            .idle-btn-dismiss:hover {
                color: #9ca3af;
                border-color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }

    return { start, stop };
})();
