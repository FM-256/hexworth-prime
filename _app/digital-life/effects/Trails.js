/**
 * Trails.js - Persistent Visual Trails for Fireflies
 *
 * Creates fading afterimages that follow each firefly,
 * giving a sense of motion and history.
 *
 * Features:
 * - Configurable trail length
 * - Color inherits from firefly (tier, rare, constellation)
 * - Fading opacity along trail
 * - Performance-optimized with object pooling
 */

class TrailSystem {
    constructor(container, config = {}) {
        this.container = container;

        this.config = {
            enabled: true,
            maxTrailLength: config.maxTrailLength ?? 8,        // Trail points per firefly
            trailSpacing: config.trailSpacing ?? 40,           // ms between trail points
            fadeDuration: config.fadeDuration ?? 400,          // ms for trail to fade
            minOpacity: config.minOpacity ?? 0.1,
            maxOpacity: config.maxOpacity ?? 0.5,
            sizeDecay: config.sizeDecay ?? 0.85,               // Each point smaller than previous
            rareTrailBoost: config.rareTrailBoost ?? 1.5,      // Rare fireflies have longer trails
            desperationBoost: config.desperationBoost ?? true, // Desperate fireflies leave more intense trails
            ...config
        };

        // Trail data storage: fireflyId -> { points: [], lastUpdate: timestamp }
        this.trails = new Map();

        // Object pool for trail elements
        this.elementPool = [];
        this.activeElements = new Set();

        // Pre-create pool
        this.initializePool(200);

        // Style injection
        this.injectStyles();
    }

    /**
     * Initialize the element pool for performance
     */
    initializePool(size) {
        for (let i = 0; i < size; i++) {
            const element = document.createElement('div');
            element.className = 'firefly-trail-point';
            element.style.cssText = `
                position: absolute;
                pointer-events: none;
                user-select: none;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                opacity: 0;
                z-index: 1;
                transition: none;
            `;
            this.elementPool.push(element);
        }
    }

    /**
     * Get an element from the pool
     */
    getElement() {
        if (this.elementPool.length > 0) {
            const el = this.elementPool.pop();
            if (!el.parentNode) {
                this.container.appendChild(el);
            }
            this.activeElements.add(el);
            return el;
        }

        // Pool exhausted, create new element
        const element = document.createElement('div');
        element.className = 'firefly-trail-point';
        element.style.cssText = `
            position: absolute;
            pointer-events: none;
            user-select: none;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            opacity: 0;
            z-index: 1;
        `;
        this.container.appendChild(element);
        this.activeElements.add(element);
        return element;
    }

    /**
     * Return an element to the pool
     */
    returnElement(element) {
        element.style.opacity = '0';
        element.style.left = '-9999px';  // Move far off-screen to prevent glow artifacts
        element.style.top = '-9999px';
        element.style.textShadow = 'none';  // Clear any glow
        element.textContent = '';       // Clear content
        this.activeElements.delete(element);
        this.elementPool.push(element);
    }

    /**
     * Update trail for a firefly
     * @param {Firefly} firefly - The firefly to track
     * @param {number} timestamp - Current timestamp
     */
    updateFireflyTrail(firefly, timestamp) {
        if (!this.config.enabled) return;
        // Don't create trails for fireflies that are dead, dying, or being born
        if (firefly.state === 'dead' || firefly.state === 'dying' || firefly.state === 'birth') return;
        // Also skip if firefly has no element (already destroyed)
        if (!firefly.element) return;

        const id = firefly.id;

        if (!this.trails.has(id)) {
            this.trails.set(id, {
                points: [],
                lastUpdate: 0
            });
        }

        const trailData = this.trails.get(id);

        // Check if enough time has passed to add a new point
        if (timestamp - trailData.lastUpdate < this.config.trailSpacing) {
            return;
        }

        // Calculate trail length - rare and desperate fireflies get longer trails
        let maxLength = this.config.maxTrailLength;
        if (firefly.rareType) {
            maxLength = Math.floor(maxLength * this.config.rareTrailBoost);
        }
        if (this.config.desperationBoost && firefly.desperation > 0.3) {
            maxLength = Math.floor(maxLength * (1 + firefly.desperation * 0.5));
        }

        // Determine trail color
        let color = firefly.tier?.color || '#ffffff';
        let glowColor = firefly.tier?.glowColor || 'rgba(255, 255, 255, 0.6)';

        // Constellation override
        if (firefly.inConstellation && firefly.constellationColor) {
            color = firefly.constellationColor;
            glowColor = firefly.constellationColor;
        }

        // Rare override
        if (firefly.rareColor) {
            color = firefly.rareColor;
            glowColor = firefly.rareGlow || firefly.rareColor;
        }

        // Add new point
        const point = {
            x: firefly.x,
            y: firefly.y,
            size: firefly.size * (firefly.sizeMultiplier ?? 1),
            color: color,
            glowColor: glowColor,
            text: firefly.rareSymbol ?? firefly.digit,
            element: this.getElement(),
            createdAt: timestamp,
            opacity: this.config.maxOpacity * (firefly.desperation > 0.5 ? 1.2 : 1)
        };

        trailData.points.push(point);
        trailData.lastUpdate = timestamp;

        // Trim old points
        while (trailData.points.length > maxLength) {
            const oldPoint = trailData.points.shift();
            this.returnElement(oldPoint.element);
        }
    }

    /**
     * Render all trails
     * @param {number} timestamp - Current timestamp
     */
    render(timestamp) {
        if (!this.config.enabled) return;

        // Maximum age before point is considered expired (fade duration + buffer)
        const maxAge = this.config.fadeDuration * 2;

        for (const [fireflyId, trailData] of this.trails) {
            const points = trailData.points;

            // Process points in reverse to safely remove expired ones
            for (let i = points.length - 1; i >= 0; i--) {
                const point = points[i];
                const age = timestamp - point.createdAt;

                // Remove expired points
                if (age > maxAge) {
                    this.returnElement(point.element);
                    points.splice(i, 1);
                    continue;
                }

                // Calculate opacity based on position in trail and age
                const positionFactor = (i + 1) / points.length; // 0 = oldest, 1 = newest
                const ageFactor = Math.max(0, 1 - (age / this.config.fadeDuration));

                // Combine factors: older points in trail fade faster
                let opacity = point.opacity * positionFactor * ageFactor;
                opacity = Math.max(0, Math.min(this.config.maxOpacity, opacity));

                // Hide fully faded points (but don't remove yet - may need for reference)
                if (opacity < 0.01) {
                    point.element.style.opacity = '0';
                    continue;
                }

                // Size decay along trail
                const sizeMultiplier = Math.pow(this.config.sizeDecay, points.length - i - 1);
                const size = point.size * sizeMultiplier;

                // Update element
                const el = point.element;
                el.textContent = point.text;
                el.style.left = point.x + 'px';
                el.style.top = point.y + 'px';
                el.style.fontSize = Math.max(6, size * 0.7) + 'px';
                el.style.opacity = opacity;
                el.style.color = point.color;
                el.style.textShadow = `0 0 ${5 * positionFactor}px ${point.glowColor}`;
            }
        }
    }

    /**
     * Remove trail for a dead firefly
     * @param {string} fireflyId - The firefly ID
     */
    removeTrail(fireflyId) {
        const trailData = this.trails.get(fireflyId);
        if (trailData) {
            for (const point of trailData.points) {
                this.returnElement(point.element);
            }
            this.trails.delete(fireflyId);
        }
    }

    /**
     * Clear all trails
     */
    clear() {
        for (const [id, trailData] of this.trails) {
            for (const point of trailData.points) {
                this.returnElement(point.element);
            }
        }
        this.trails.clear();
    }

    /**
     * Clean up stale trails (fireflies that no longer exist or are dead/dying)
     * @param {Array} fireflies - Array of firefly objects (or Set of active IDs)
     */
    cleanup(fireflies) {
        // Build set of active, living firefly IDs
        let activeIds;
        if (fireflies instanceof Set) {
            // Legacy: Set of IDs passed directly
            activeIds = fireflies;
        } else if (Array.isArray(fireflies)) {
            // New: Filter out dead/dying fireflies
            activeIds = new Set();
            for (const f of fireflies) {
                if (f.state !== 'dead' && f.state !== 'dying' && f.element) {
                    activeIds.add(f.id);
                }
            }
        } else {
            return;
        }

        const toRemove = [];
        for (const id of this.trails.keys()) {
            if (!activeIds.has(id)) {
                toRemove.push(id);
            }
        }
        for (const id of toRemove) {
            this.removeTrail(id);
        }
    }

    /**
     * Get stats for debugging
     */
    getStats() {
        let totalPoints = 0;
        for (const trailData of this.trails.values()) {
            totalPoints += trailData.points.length;
        }
        return {
            trails: this.trails.size,
            totalPoints: totalPoints,
            poolSize: this.elementPool.length,
            activeElements: this.activeElements.size
        };
    }

    /**
     * Toggle trails on/off
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('trail-system-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'trail-system-styles';
        styles.textContent = `
            .firefly-trail-point {
                will-change: transform, opacity;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Destroy the trail system
     */
    destroy() {
        this.clear();

        // Remove all pool elements
        for (const el of this.elementPool) {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }
        for (const el of this.activeElements) {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }

        this.elementPool = [];
        this.activeElements.clear();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrailSystem;
}
