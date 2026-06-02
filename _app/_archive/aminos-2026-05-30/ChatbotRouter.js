/**
 * ChatbotRouter.js - House AI Chatbot Integration
 *
 * Determines the appropriate house chatbot based on the current page URL,
 * renders a floating "Need Help?" button, and opens a slide-up chat panel
 * with the bot's iframe embed.
 *
 * Pattern: IIFE module, follows HouseRenderer.js conventions.
 * Uses position: absolute + scroll offset (NOT position: fixed — broken with body.style.filter).
 * No emoji — webp icons only.
 *
 * Public API:
 *   ChatbotRouter.init()         — auto-detects house from URL, renders button
 *   ChatbotRouter.open()         — opens the chat panel
 *   ChatbotRouter.close()        — closes the chat panel
 *   ChatbotRouter.minimize()     — minimizes to button
 *   ChatbotRouter.getActiveBot() — returns current bot spec or null
 *
 * @version 1.0.0
 * @feature F-53
 */

const ChatbotRouter = (function () {
    'use strict';

    // ========================================
    // ROUTING MAP
    // ========================================

    const ROUTE_MAP = [
        { prefix: '/houses/script/',             bot: 'script-bot' },
        { prefix: '/houses/comptia-linux/',       bot: 'script-bot' },
        { prefix: '/houses/cloud/',              bot: 'cloud-bot' },
        { prefix: '/houses/aws-ccp/',            bot: 'cloud-bot' },
        { prefix: '/houses/azure-fundamentals/', bot: 'cloud-bot' },
        { prefix: '/houses/aws-developer/',      bot: 'cloud-bot' },
        { prefix: '/houses/code/',               bot: 'code-bot' },
        { prefix: '/houses/web/',                bot: 'web-bot' },
        { prefix: '/houses/comptia-network/',    bot: 'web-bot' },
        { prefix: '/houses/ccna/',               bot: 'web-bot' },
        { prefix: '/houses/forge/',              bot: 'forge-bot' },
        { prefix: '/houses/aplus-core1/',        bot: 'forge-bot' },
        { prefix: '/houses/aplus-core2/',        bot: 'forge-bot' },
        { prefix: '/houses/shield/',             bot: 'shield-bot' },
        { prefix: '/houses/security-plus/',      bot: 'shield-bot' },
        { prefix: '/houses/cysa-plus/',          bot: 'shield-bot' },
        { prefix: '/houses/casp-plus/',          bot: 'shield-bot' },
        { prefix: '/houses/security-operations/',bot: 'shield-bot' },
        { prefix: '/houses/dark-arts/',          bot: 'dark-arts-bot' },
        { prefix: '/dark-arts/',                 bot: 'dark-arts-bot' },
        { prefix: '/arena/',                     bot: 'dark-arts-bot' },
        { prefix: '/houses/ai/',                 bot: 'ai-bot' },
        { prefix: '/houses/eye/',                bot: 'eye-bot' },
        { prefix: '/forensics/',                 bot: 'eye-bot' },
        { prefix: '/houses/key/',                bot: 'key-bot' },
        { prefix: '/houses/cryptography-track/', bot: 'key-bot' },
        { prefix: '/houses/security-plus-crypto/',bot: 'key-bot' },
        { prefix: '/signal/',                    bot: 'signal-bot' },
        { prefix: '/houses/matrix/',             bot: 'matrix-bot' },
        { prefix: '/houses/devops-fundamentals/',bot: 'cloud-bot' }
    ];

    // ========================================
    // STATE
    // ========================================

    let activeBot = null;
    let botSpec = null;
    let panelEl = null;
    let btnEl = null;
    let isOpen = false;
    let isMinimized = false;
    let prefersReducedMotion = false;
    let styleInjected = false;
    let repositionTimer = null;

    // ========================================
    // HELPERS
    // ========================================

    function detectBot() {
        var path = window.location.pathname;
        // Normalize: ensure leading slash, lowercase
        if (path.charAt(0) !== '/') path = '/' + path;

        // Match longest prefix first (sort descending by length)
        var sorted = ROUTE_MAP.slice().sort(function (a, b) {
            return b.prefix.length - a.prefix.length;
        });

        for (var i = 0; i < sorted.length; i++) {
            if (path.indexOf(sorted[i].prefix) === 0) {
                return sorted[i].bot;
            }
        }
        return null;
    }

    function loadBotSpec(botId, callback) {
        var basePath = '/components/chatbots/bot-specs/';
        var url = basePath + botId + '.json';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        callback(JSON.parse(xhr.responseText));
                    } catch (e) {
                        console.warn('[ChatbotRouter] Failed to parse bot spec:', botId, e);
                        callback(null);
                    }
                } else {
                    console.warn('[ChatbotRouter] Failed to load bot spec:', botId, xhr.status);
                    callback(null);
                }
            }
        };
        xhr.send();
    }

    // ========================================
    // STYLES
    // ========================================

    function injectStyles() {
        if (styleInjected) return;
        styleInjected = true;

        var reducedMotion = prefersReducedMotion;
        var transition = reducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        var transformOpen = reducedMotion ? 'none' : 'translateY(0)';
        var transformClosed = reducedMotion ? 'none' : 'translateY(100%)';

        var css = '' +
            /* Floating button */
            '.cb-trigger {' +
            '  position: absolute;' +
            '  width: 52px;' +
            '  height: 52px;' +
            '  border-radius: 50%;' +
            '  border: 2px solid var(--cb-accent, #60a5fa);' +
            '  background: #0a0a0f;' +
            '  cursor: pointer;' +
            '  display: flex;' +
            '  align-items: center;' +
            '  justify-content: center;' +
            '  z-index: 9000;' +
            '  box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 15px var(--cb-accent-glow, rgba(96,165,250,0.2));' +
            '  transition: ' + transition + ';' +
            '}' +
            '.cb-trigger:hover {' +
            '  transform: scale(1.08);' +
            '  box-shadow: 0 4px 24px rgba(0,0,0,0.7), 0 0 25px var(--cb-accent-glow, rgba(96,165,250,0.35));' +
            '}' +
            '.cb-trigger img {' +
            '  width: 26px;' +
            '  height: 26px;' +
            '  pointer-events: none;' +
            '}' +

            /* Tooltip */
            '.cb-trigger::after {' +
            '  content: "Need Help?";' +
            '  position: absolute;' +
            '  right: 60px;' +
            '  top: 50%;' +
            '  transform: translateY(-50%);' +
            '  background: #1a1a2e;' +
            '  color: #e0e0e0;' +
            '  padding: 6px 12px;' +
            '  border-radius: 6px;' +
            '  font-size: 13px;' +
            '  font-family: "JetBrains Mono", "Fira Code", monospace;' +
            '  white-space: nowrap;' +
            '  opacity: 0;' +
            '  pointer-events: none;' +
            '  transition: opacity 0.2s;' +
            '  border: 1px solid rgba(255,255,255,0.08);' +
            '}' +
            '.cb-trigger:hover::after {' +
            '  opacity: 1;' +
            '}' +

            /* Panel */
            '.cb-panel {' +
            '  position: absolute;' +
            '  width: 380px;' +
            '  height: 520px;' +
            '  max-height: 70vh;' +
            '  background: #0a0a0f;' +
            '  border: 1px solid rgba(255,255,255,0.1);' +
            '  border-radius: 12px 12px 0 0;' +
            '  z-index: 9001;' +
            '  display: flex;' +
            '  flex-direction: column;' +
            '  overflow: hidden;' +
            '  box-shadow: 0 -4px 30px rgba(0,0,0,0.7);' +
            '  transform: ' + transformClosed + ';' +
            '  opacity: 0;' +
            '  pointer-events: none;' +
            '  transition: ' + transition + ';' +
            '}' +
            '.cb-panel.cb-open {' +
            '  transform: ' + transformOpen + ';' +
            '  opacity: 1;' +
            '  pointer-events: auto;' +
            '}' +

            /* Panel header */
            '.cb-header {' +
            '  display: flex;' +
            '  align-items: center;' +
            '  gap: 10px;' +
            '  padding: 12px 14px;' +
            '  background: #111118;' +
            '  border-bottom: 1px solid rgba(255,255,255,0.08);' +
            '  flex-shrink: 0;' +
            '}' +
            '.cb-header img {' +
            '  width: 28px;' +
            '  height: 28px;' +
            '}' +
            '.cb-header-info {' +
            '  flex: 1;' +
            '}' +
            '.cb-header-name {' +
            '  font-size: 14px;' +
            '  font-weight: 600;' +
            '  color: var(--cb-accent, #60a5fa);' +
            '  font-family: "JetBrains Mono", "Fira Code", monospace;' +
            '}' +
            '.cb-header-role {' +
            '  font-size: 11px;' +
            '  color: #888;' +
            '  font-family: "JetBrains Mono", "Fira Code", monospace;' +
            '}' +
            '.cb-header-controls {' +
            '  display: flex;' +
            '  gap: 6px;' +
            '}' +
            '.cb-ctrl-btn {' +
            '  width: 28px;' +
            '  height: 28px;' +
            '  border: 1px solid rgba(255,255,255,0.1);' +
            '  border-radius: 6px;' +
            '  background: transparent;' +
            '  color: #888;' +
            '  cursor: pointer;' +
            '  display: flex;' +
            '  align-items: center;' +
            '  justify-content: center;' +
            '  font-size: 16px;' +
            '  line-height: 1;' +
            '  transition: ' + transition + ';' +
            '}' +
            '.cb-ctrl-btn:hover {' +
            '  background: rgba(255,255,255,0.05);' +
            '  color: #ccc;' +
            '}' +

            /* Iframe body */
            '.cb-body {' +
            '  flex: 1;' +
            '  position: relative;' +
            '  overflow: hidden;' +
            '}' +
            '.cb-body iframe {' +
            '  width: 100%;' +
            '  height: 100%;' +
            '  border: none;' +
            '  background: #0a0a0f;' +
            '}' +

            /* Loading state */
            '.cb-loading {' +
            '  position: absolute;' +
            '  inset: 0;' +
            '  display: flex;' +
            '  align-items: center;' +
            '  justify-content: center;' +
            '  color: #555;' +
            '  font-size: 13px;' +
            '  font-family: "JetBrains Mono", "Fira Code", monospace;' +
            '}' +

            /* Status bar */
            '.cb-status {' +
            '  padding: 6px 14px;' +
            '  font-size: 10px;' +
            '  color: #555;' +
            '  font-family: "JetBrains Mono", "Fira Code", monospace;' +
            '  background: #08080c;' +
            '  border-top: 1px solid rgba(255,255,255,0.05);' +
            '  flex-shrink: 0;' +
            '}' +

            /* Mobile responsive */
            '@media (max-width: 480px) {' +
            '  .cb-panel {' +
            '    width: calc(100vw - 16px);' +
            '    height: 60vh;' +
            '    border-radius: 12px 12px 0 0;' +
            '  }' +
            '}' +
            '';

        var style = document.createElement('style');
        style.setAttribute('data-component', 'ChatbotRouter');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ========================================
    // POSITIONING (absolute + scroll offset)
    // ========================================

    function positionElements() {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        var scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
        var viewW = window.innerWidth;
        var viewH = window.innerHeight;

        if (btnEl) {
            btnEl.style.top = (scrollY + viewH - 80) + 'px';
            btnEl.style.left = (scrollX + viewW - 76) + 'px';
        }

        if (panelEl) {
            panelEl.style.top = (scrollY + viewH - 530) + 'px';
            // Clamp panel height on small viewports
            var maxH = Math.min(520, viewH * 0.7);
            panelEl.style.maxHeight = maxH + 'px';
            panelEl.style.left = (scrollX + viewW - 400) + 'px';
        }
    }

    function onScrollOrResize() {
        if (repositionTimer) cancelAnimationFrame(repositionTimer);
        repositionTimer = requestAnimationFrame(positionElements);
    }

    // ========================================
    // RENDER
    // ========================================

    function renderButton(spec) {
        btnEl = document.createElement('button');
        btnEl.className = 'cb-trigger';
        btnEl.setAttribute('aria-label', 'Need Help? Chat with ' + spec.name);
        btnEl.style.setProperty('--cb-accent', spec.accentColor);
        btnEl.style.setProperty('--cb-accent-glow', spec.accentColor + '33');

        var img = document.createElement('img');
        img.src = spec.icon;
        img.alt = spec.name;
        img.width = 26;
        img.height = 26;
        btnEl.appendChild(img);

        btnEl.addEventListener('click', function () {
            if (isOpen) {
                close();
            } else {
                open();
            }
        });

        document.body.appendChild(btnEl);
    }

    function renderPanel(spec) {
        panelEl = document.createElement('div');
        panelEl.className = 'cb-panel';
        panelEl.setAttribute('role', 'dialog');
        panelEl.setAttribute('aria-label', 'Chat with ' + spec.name);
        panelEl.style.setProperty('--cb-accent', spec.accentColor);

        // Header
        var header = document.createElement('div');
        header.className = 'cb-header';

        var icon = document.createElement('img');
        icon.src = spec.icon;
        icon.alt = '';
        icon.width = 28;
        icon.height = 28;

        var info = document.createElement('div');
        info.className = 'cb-header-info';

        var nameEl = document.createElement('div');
        nameEl.className = 'cb-header-name';
        nameEl.textContent = spec.name;

        var roleEl = document.createElement('div');
        roleEl.className = 'cb-header-role';
        roleEl.textContent = spec.personality.split('.')[0];

        info.appendChild(nameEl);
        info.appendChild(roleEl);

        var controls = document.createElement('div');
        controls.className = 'cb-header-controls';

        // Minimize button
        var minBtn = document.createElement('button');
        minBtn.className = 'cb-ctrl-btn';
        minBtn.setAttribute('aria-label', 'Minimize chat');
        minBtn.innerHTML = '&#x2013;'; // en dash as minimize icon
        minBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            minimize();
        });

        // Close button
        var closeBtn = document.createElement('button');
        closeBtn.className = 'cb-ctrl-btn';
        closeBtn.setAttribute('aria-label', 'Close chat');
        closeBtn.innerHTML = '&#x2715;'; // multiplication X
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            close();
        });

        controls.appendChild(minBtn);
        controls.appendChild(closeBtn);

        header.appendChild(icon);
        header.appendChild(info);
        header.appendChild(controls);

        // Body (iframe placeholder — loaded on open)
        var body = document.createElement('div');
        body.className = 'cb-body';

        var loading = document.createElement('div');
        loading.className = 'cb-loading';
        loading.textContent = 'Connecting to ' + spec.name + '...';
        body.appendChild(loading);

        // Status bar
        var status = document.createElement('div');
        status.className = 'cb-status';
        status.textContent = 'Powered by Hexworth Prime // ' + spec.name + ' v1.0';

        panelEl.appendChild(header);
        panelEl.appendChild(body);
        panelEl.appendChild(status);

        document.body.appendChild(panelEl);
    }

    // ========================================
    // IFRAME MANAGEMENT
    // ========================================

    function loadIframe(spec) {
        if (!panelEl) return;
        var body = panelEl.querySelector('.cb-body');
        if (!body) return;

        // Skip if iframe already loaded
        if (body.querySelector('iframe')) return;

        // Build embed URL (Aminos bot platform)
        // Format: https://aminos.ai/embed/{botId}
        // This URL will be configured when bots are provisioned on the platform
        var embedUrl = 'https://aminos.ai/embed/' + spec.id;

        var iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.title = 'Chat with ' + spec.name;
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

        iframe.addEventListener('load', function () {
            var loadingEl = body.querySelector('.cb-loading');
            if (loadingEl) loadingEl.style.display = 'none';
        });

        body.appendChild(iframe);
    }

    // ========================================
    // PUBLIC API
    // ========================================

    function open() {
        if (!panelEl || !botSpec) return;
        isOpen = true;
        isMinimized = false;
        loadIframe(botSpec);
        positionElements();
        panelEl.classList.add('cb-open');

        if (btnEl) {
            btnEl.setAttribute('aria-expanded', 'true');
        }
    }

    function close() {
        if (!panelEl) return;
        isOpen = false;
        isMinimized = false;
        panelEl.classList.remove('cb-open');

        if (btnEl) {
            btnEl.setAttribute('aria-expanded', 'false');
        }
    }

    function minimize() {
        close();
        isMinimized = true;
    }

    function getActiveBot() {
        return botSpec ? Object.assign({}, botSpec) : null;
    }

    function init() {
        // Check reduced motion preference
        prefersReducedMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Detect which bot to use
        activeBot = detectBot();
        if (!activeBot) {
            // No bot mapped for this page — silent exit
            return;
        }

        // Load spec and render
        loadBotSpec(activeBot, function (spec) {
            if (!spec) return;
            botSpec = spec;

            injectStyles();
            renderButton(spec);
            renderPanel(spec);
            positionElements();

            // Track scroll + resize for absolute positioning
            window.addEventListener('scroll', onScrollOrResize, { passive: true });
            window.addEventListener('resize', onScrollOrResize, { passive: true });

            // Keyboard: Escape to close
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && isOpen) {
                    close();
                }
            });
        });
    }

    // ========================================
    // EXPORT
    // ========================================

    return {
        init: init,
        open: open,
        close: close,
        minimize: minimize,
        getActiveBot: getActiveBot
    };

})();
