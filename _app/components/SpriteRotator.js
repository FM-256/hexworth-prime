/**
 * SpriteRotator.js — 8-Frame Sprite Rotation for Mascot Turntable Effect
 *
 * Cycles through 8 pre-rendered angle frames (0/45/90/135/180/225/270/315 deg)
 * packed into a single vertical sprite sheet to create a 3D turntable illusion.
 *
 * Interaction modes:
 *   - 'hover'    — Static front-facing, spins on mouse enter (default)
 *   - 'auto'     — Continuous slow rotation at configurable RPM
 *   - 'drag'     — Mouse/touch drag controls rotation angle
 *
 * Features:
 *   - IntersectionObserver gating (only animates when visible)
 *   - Lazy-loaded sprite sheets (loads on first intersection)
 *   - prefers-reduced-motion respected (shows static hero fallback)
 *   - CSS steps() animation for crisp frame transitions
 *   - Touch-friendly drag-to-rotate
 *
 * Sprite Sheet Format:
 *   - Single WebP image, 8 frames stacked vertically
 *   - Each frame is the same width/height (e.g., 512x512)
 *   - Total sheet height = frame height * 8
 *   - File naming: {house}-sprite-sheet.webp (e.g., web-sprite-sheet.webp)
 *   - Located in: assets/images/mascots/sprites/
 *
 * Usage:
 *   <div class="sprite-rotator" data-house="web" data-mode="hover"></div>
 *
 *   // Or programmatic:
 *   const rotator = SpriteRotator.create(element, {
 *       house: 'web',
 *       mode: 'hover',     // 'hover' | 'auto' | 'drag'
 *       rpm: 3,            // Rotations per minute (auto mode)
 *       frameWidth: 512,
 *       frameHeight: 512,
 *       basePath: '../../assets/images/mascots/sprites/'
 *   });
 *   rotator.setMode('auto');
 *   rotator.destroy();
 */

const SpriteRotator = (function() {
    'use strict';

    const FRAME_COUNT = 8;
    const DEGREES_PER_FRAME = 360 / FRAME_COUNT; // 45 deg
    const DEFAULT_RPM = 3;
    const DEFAULT_FRAME_SIZE = 512;
    const SPRITE_PATH = 'assets/images/mascots/sprites/';

    // Track all active rotator instances for cleanup
    const instances = new Map();
    let instanceId = 0;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /**
     * Inject shared CSS once
     */
    let stylesInjected = false;
    function injectStyles() {
        if (stylesInjected) return;
        stylesInjected = true;

        const style = document.createElement('style');
        style.id = 'sprite-rotator-styles';
        style.textContent = `
            .sr-container {
                position: relative;
                overflow: hidden;
                display: inline-block;
            }

            .sr-sprite {
                display: block;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
            }

            /* Auto-rotate: CSS steps() animation */
            .sr-auto .sr-sprite {
                animation: sr-spin var(--sr-duration, 2.5s) steps(${FRAME_COUNT}) infinite;
            }

            @keyframes sr-spin {
                from { transform: translateY(0); }
                to { transform: translateY(calc(-100% + var(--sr-frame-h, ${DEFAULT_FRAME_SIZE}px))); }
            }

            /* Hover-to-spin */
            .sr-hover .sr-sprite {
                transition: none;
            }

            .sr-hover:hover .sr-sprite,
            .sr-hover:focus-within .sr-sprite {
                animation: sr-spin var(--sr-duration, 2.5s) steps(${FRAME_COUNT}) infinite;
            }

            /* Drag mode cursor */
            .sr-drag {
                cursor: grab;
                user-select: none;
                -webkit-user-select: none;
            }

            .sr-drag.sr-dragging {
                cursor: grabbing;
            }

            /* Fallback: static hero image */
            .sr-fallback {
                display: block;
                width: 100%;
                height: auto;
            }

            .sr-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.05);
                border-radius: 12px;
            }

            .sr-loading::after {
                content: '';
                width: 32px;
                height: 32px;
                border: 3px solid rgba(128,128,128,0.2);
                border-top-color: rgba(128,128,128,0.6);
                border-radius: 50%;
                animation: sr-loader 0.8s linear infinite;
            }

            @keyframes sr-loader {
                to { transform: rotate(360deg); }
            }

            /* Reduced motion: no animations */
            @media (prefers-reduced-motion: reduce) {
                .sr-auto .sr-sprite,
                .sr-hover:hover .sr-sprite,
                .sr-hover:focus-within .sr-sprite {
                    animation: none !important;
                    transform: translateY(0) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create a sprite rotator on an element
     */
    function create(element, options = {}) {
        if (!element) return null;
        injectStyles();

        const id = ++instanceId;
        const house = options.house || element.dataset.house || 'web';
        const mode = options.mode || element.dataset.mode || 'hover';
        const rpm = parseFloat(options.rpm || element.dataset.rpm) || DEFAULT_RPM;
        const frameWidth = parseInt(options.frameWidth || element.dataset.frameWidth) || DEFAULT_FRAME_SIZE;
        const frameHeight = parseInt(options.frameHeight || element.dataset.frameHeight) || DEFAULT_FRAME_SIZE;
        const basePath = options.basePath || element.dataset.basePath || SPRITE_PATH;

        const state = {
            id,
            element,
            house,
            mode,
            rpm,
            frameWidth,
            frameHeight,
            basePath,
            currentFrame: 0,
            loaded: false,
            visible: false,
            dragging: false,
            dragStartX: 0,
            dragStartFrame: 0,
            spriteImg: null,
            observer: null,
            cleanupFns: []
        };

        // Set up container
        element.classList.add('sr-container', 'sr-loading');
        element.style.width = frameWidth + 'px';
        element.style.height = frameHeight + 'px';
        element.setAttribute('role', 'img');
        element.setAttribute('aria-label', `${house} house mascot, rotatable`);

        // Set CSS custom properties
        const duration = 60 / rpm; // seconds per rotation
        element.style.setProperty('--sr-duration', duration + 's');
        element.style.setProperty('--sr-frame-h', frameHeight + 'px');

        // Intersection Observer: lazy-load + visibility gating
        state.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                state.visible = entry.isIntersecting;
                if (entry.isIntersecting && !state.loaded) {
                    loadSprite(state);
                }
                // Pause/resume auto animation
                if (state.loaded) {
                    toggleAnimation(state);
                }
            });
        }, { threshold: 0.1 });
        state.observer.observe(element);

        // Set mode
        applyMode(state, mode);

        instances.set(id, state);

        return {
            setMode: (newMode) => { applyMode(state, newMode); },
            setFrame: (frame) => { setFrame(state, frame); },
            setRPM: (newRPM) => {
                state.rpm = newRPM;
                const dur = 60 / newRPM;
                element.style.setProperty('--sr-duration', dur + 's');
            },
            destroy: () => { destroyInstance(state); },
            getFrame: () => state.currentFrame,
            getMode: () => state.mode,
            getId: () => id
        };
    }

    /**
     * Load sprite sheet image
     */
    function loadSprite(state) {
        const spriteUrl = state.basePath + state.house + '-sprite-sheet.webp';
        const heroUrl = `assets/images/mascots/${state.house}-hero.webp`;

        const img = new Image();
        img.onload = function() {
            state.loaded = true;
            state.spriteImg = img;

            // Clear loading state
            state.element.classList.remove('sr-loading');

            // Build the sprite display
            const spriteEl = document.createElement('div');
            spriteEl.className = 'sr-sprite';
            spriteEl.style.width = state.frameWidth + 'px';
            spriteEl.style.height = (state.frameHeight * FRAME_COUNT) + 'px';
            spriteEl.style.backgroundImage = `url('${spriteUrl}')`;
            spriteEl.style.backgroundSize = `${state.frameWidth}px ${state.frameHeight * FRAME_COUNT}px`;
            spriteEl.style.backgroundRepeat = 'no-repeat';

            state.element.innerHTML = '';
            state.element.appendChild(spriteEl);

            // If reduced motion, just show frame 0 (front-facing)
            if (prefersReducedMotion.matches) {
                setFrame(state, 0);
                return;
            }

            toggleAnimation(state);
        };

        img.onerror = function() {
            // Fallback to static hero image
            state.element.classList.remove('sr-loading');
            const fallback = new Image();
            fallback.className = 'sr-fallback';
            fallback.src = heroUrl;
            fallback.alt = `${state.house} house mascot`;
            fallback.width = state.frameWidth;
            fallback.height = state.frameHeight;
            state.element.innerHTML = '';
            state.element.appendChild(fallback);
            state.loaded = true;
        };

        img.src = spriteUrl;
    }

    /**
     * Apply interaction mode
     */
    function applyMode(state, mode) {
        const el = state.element;

        // Clean up previous mode listeners
        state.cleanupFns.forEach(fn => fn());
        state.cleanupFns = [];

        el.classList.remove('sr-hover', 'sr-auto', 'sr-drag', 'sr-dragging');
        state.mode = mode;

        switch (mode) {
            case 'hover':
                el.classList.add('sr-hover');
                break;

            case 'auto':
                el.classList.add('sr-auto');
                break;

            case 'drag':
                el.classList.add('sr-drag');
                setupDrag(state);
                break;
        }

        if (state.loaded) {
            toggleAnimation(state);
        }
    }

    /**
     * Set up drag-to-rotate handlers
     */
    function setupDrag(state) {
        const el = state.element;

        function onStart(e) {
            e.preventDefault();
            state.dragging = true;
            state.dragStartX = getClientX(e);
            state.dragStartFrame = state.currentFrame;
            el.classList.add('sr-dragging');
        }

        function onMove(e) {
            if (!state.dragging) return;
            e.preventDefault();
            const dx = getClientX(e) - state.dragStartX;
            // Map drag distance to frame index
            // Sensitivity: ~60px per frame
            const frameDelta = Math.round(dx / 60);
            const newFrame = ((state.dragStartFrame + frameDelta) % FRAME_COUNT + FRAME_COUNT) % FRAME_COUNT;
            setFrame(state, newFrame);
        }

        function onEnd() {
            if (!state.dragging) return;
            state.dragging = false;
            el.classList.remove('sr-dragging');
        }

        // Mouse events
        el.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);

        // Touch events
        el.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        // Cleanup
        state.cleanupFns.push(() => {
            el.removeEventListener('mousedown', onStart);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            el.removeEventListener('touchstart', onStart);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        });
    }

    /**
     * Get clientX from mouse or touch event
     */
    function getClientX(e) {
        if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
        return e.clientX;
    }

    /**
     * Set the displayed frame (for drag mode)
     */
    function setFrame(state, frameIndex) {
        frameIndex = ((frameIndex % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
        state.currentFrame = frameIndex;

        const sprite = state.element.querySelector('.sr-sprite');
        if (sprite) {
            // In drag mode, we manually position the sprite
            sprite.style.animation = 'none';
            sprite.style.transform = `translateY(-${frameIndex * state.frameHeight}px)`;
        }
    }

    /**
     * Toggle animation based on visibility and mode
     */
    function toggleAnimation(state) {
        if (prefersReducedMotion.matches) return;

        const sprite = state.element.querySelector('.sr-sprite');
        if (!sprite) return;

        if (state.mode === 'drag') {
            // Drag mode: no CSS animation, manual positioning
            sprite.style.animation = 'none';
            return;
        }

        if (!state.visible) {
            // Not visible: pause animation to save resources
            sprite.style.animationPlayState = 'paused';
        } else {
            sprite.style.animationPlayState = 'running';
        }
    }

    /**
     * Destroy a rotator instance
     */
    function destroyInstance(state) {
        state.cleanupFns.forEach(fn => fn());
        state.cleanupFns = [];

        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }

        state.element.classList.remove('sr-container', 'sr-loading', 'sr-hover', 'sr-auto', 'sr-drag', 'sr-dragging');
        state.element.innerHTML = '';
        state.element.removeAttribute('style');
        state.element.removeAttribute('role');
        state.element.removeAttribute('aria-label');

        instances.delete(state.id);
    }

    /**
     * Auto-initialize all [data-sprite-rotator] elements on DOMContentLoaded
     */
    function autoInit() {
        document.querySelectorAll('.sprite-rotator, [data-sprite-rotator]').forEach(el => {
            if (!instances.has(el.dataset._srId)) {
                const instance = create(el);
                if (instance) {
                    el.dataset._srId = instance.getId();
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        setTimeout(autoInit, 0);
    }

    // Public API
    return {
        create,
        autoInit,
        destroyAll: () => {
            instances.forEach(state => destroyInstance(state));
        },
        getInstances: () => instances.size,
        FRAME_COUNT,
        DEGREES_PER_FRAME
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteRotator;
}
