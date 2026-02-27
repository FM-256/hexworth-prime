/**
 * HoloFoil — Holographic foil & parallax tilt controller.
 *
 * Tracks mouse position over elements with class `holo-card` and drives
 * CSS custom properties for the foil gradient and 3D tilt transform.
 *
 * Usage:
 *   // Auto-init: all .holo-card elements get tracking automatically
 *   <script src="components/HoloFoil.js"></script>
 *
 *   // Manual: apply to specific elements with options
 *   HoloFoil.apply(element, { intensity: 1.5, perspective: 600 });
 *
 *   // Remove: clean up tracking
 *   HoloFoil.remove(element);
 *
 * Options:
 *   intensity   — Tilt multiplier (default: 1, range: 0.5-3)
 *   perspective — 3D perspective distance in px (default: 800)
 *   scale       — Hover scale factor (default: 1.02)
 *   glint       — Show specular highlight (default: true)
 *   idle        — Show idle shimmer animation (default: true)
 *
 * CSS Requirements:
 *   Link css/holo-foil.css before this script.
 *
 * Depends on: nothing (standalone)
 */

const HoloFoil = (() => {
    'use strict';

    const TRACKED = new WeakMap();   // element → { handlers, options }
    const DEFAULT_OPTS = {
        intensity: 1,
        perspective: 800,
        scale: 1.02,
        glint: true,
        idle: true
    };

    // Inject CSS link if not already present
    function ensureCSS() {
        if (document.getElementById('holo-foil-css')) return;

        // Try to resolve path relative to this script
        const scripts = document.querySelectorAll('script[src*="HoloFoil"]');
        let basePath = '/css/holo-foil.css';
        if (scripts.length > 0) {
            const src = scripts[0].getAttribute('src');
            const dir = src.substring(0, src.lastIndexOf('/'));
            basePath = dir.replace(/components$/, 'css') + '/holo-foil.css';
        }

        const link = document.createElement('link');
        link.id = 'holo-foil-css';
        link.rel = 'stylesheet';
        link.href = basePath;
        document.head.appendChild(link);
    }

    /**
     * Apply holographic foil tracking to an element.
     * @param {HTMLElement} el
     * @param {Object} [opts]
     */
    function apply(el, opts = {}) {
        if (TRACKED.has(el)) return;  // Already tracked

        const options = { ...DEFAULT_OPTS, ...opts };

        function onMouseEnter() {
            el.classList.add('holo-active');
        }

        function onMouseMove(e) {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Normalized position (0-100%)
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;

            // Tilt angles: centered at 0, max ~15deg at edges
            const maxTilt = 15 * options.intensity;
            const tiltX = ((py - 50) / 50) * -maxTilt;  // Invert X for natural feel
            const tiltY = ((px - 50) / 50) * maxTilt;

            el.style.setProperty('--holo-x', px + '%');
            el.style.setProperty('--holo-y', py + '%');
            el.style.setProperty('--holo-tilt-x', tiltX + 'deg');
            el.style.setProperty('--holo-tilt-y', tiltY + 'deg');
            el.style.setProperty('--holo-opacity', '1');
        }

        function onMouseLeave() {
            el.classList.remove('holo-active');

            // Smooth reset
            el.style.setProperty('--holo-tilt-x', '0deg');
            el.style.setProperty('--holo-tilt-y', '0deg');
            el.style.setProperty('--holo-x', '50%');
            el.style.setProperty('--holo-y', '50%');
            el.style.setProperty('--holo-opacity', '0');
        }

        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('mouseleave', onMouseLeave);

        // Store for cleanup
        TRACKED.set(el, {
            handlers: { onMouseEnter, onMouseMove, onMouseLeave },
            options
        });
    }

    /**
     * Remove tracking from an element.
     * @param {HTMLElement} el
     */
    function remove(el) {
        const data = TRACKED.get(el);
        if (!data) return;

        const { onMouseEnter, onMouseMove, onMouseLeave } = data.handlers;
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);

        el.classList.remove('holo-active');
        el.style.removeProperty('--holo-tilt-x');
        el.style.removeProperty('--holo-tilt-y');
        el.style.removeProperty('--holo-x');
        el.style.removeProperty('--holo-y');
        el.style.removeProperty('--holo-opacity');

        TRACKED.delete(el);
    }

    /**
     * Auto-apply to all .holo-card elements in a container.
     * @param {HTMLElement} [container=document]
     * @param {Object} [opts]
     */
    function init(container, opts) {
        const root = container || document;
        const cards = root.querySelectorAll('.holo-card');
        cards.forEach(card => apply(card, opts));
    }

    /**
     * Observe DOM for dynamically added .holo-card elements.
     */
    function observe() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    if (node.classList && node.classList.contains('holo-card')) {
                        apply(node);
                    }
                    // Also check children
                    if (node.querySelectorAll) {
                        node.querySelectorAll('.holo-card').forEach(card => apply(card));
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return observer;
    }

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ensureCSS();
            init();
            observe();
        });
    } else {
        ensureCSS();
        // Defer slightly to let other scripts add .holo-card elements
        setTimeout(() => {
            init();
            observe();
        }, 0);
    }

    return { apply, remove, init, observe, ensureCSS };
})();
