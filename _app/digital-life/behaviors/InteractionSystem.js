/**
 * InteractionSystem.js - User Input Handler
 *
 * Handles user interactions with the firefly ecosystem:
 * - Click to attract/repel fireflies
 * - Drag to create currents
 * - Double-click to spawn
 * - Right-click context actions
 * - Touch support for mobile
 */

class InteractionSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            // Click effects
            clickAttractionRadius: config.clickAttractionRadius ?? 150,
            clickAttractionForce: config.clickAttractionForce ?? 0.08,
            clickRepelForce: config.clickRepelForce ?? 0.12,
            // Drag effects
            dragCurrentWidth: config.dragCurrentWidth ?? 100,
            dragCurrentForce: config.dragCurrentForce ?? 0.05,
            dragTrailPersistence: config.dragTrailPersistence ?? 500,
            // Double-click
            doubleClickSpawn: config.doubleClickSpawn ?? true,
            spawnCooldown: config.spawnCooldown ?? 500,
            // Hold effects
            holdChargeTime: config.holdChargeTime ?? 1500,
            holdBurstRadius: config.holdBurstRadius ?? 200,
            ...config
        };

        this.container = null;
        this.ecosystem = null;
        this.particleSystem = null;

        // Input state
        this.mouse = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.isDragging = false;
        this.dragStart = null;
        this.dragTrail = [];
        this.lastClick = 0;
        this.lastSpawn = 0;
        this.holdStartTime = null;
        this.holdCharge = 0;

        // Touch state
        this.touches = new Map();
        this.isTouching = false;

        // Bound handlers
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseDown = this._handleMouseDown.bind(this);
        this._onMouseUp = this._handleMouseUp.bind(this);
        this._onClick = this._handleClick.bind(this);
        this._onDblClick = this._handleDoubleClick.bind(this);
        this._onContextMenu = this._handleContextMenu.bind(this);
        this._onTouchStart = this._handleTouchStart.bind(this);
        this._onTouchMove = this._handleTouchMove.bind(this);
        this._onTouchEnd = this._handleTouchEnd.bind(this);
    }

    /**
     * Initialize with container
     */
    init(container) {
        this.container = container;
        this.attachListeners();
        return this;
    }

    setEcosystem(ecosystem) {
        this.ecosystem = ecosystem;
        return this;
    }

    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
        return this;
    }

    /**
     * Attach event listeners
     */
    attachListeners() {
        if (!this.container) return;

        // Use document for mouse events since container has pointer-events: none
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mousedown', this._onMouseDown);
        document.addEventListener('mouseup', this._onMouseUp);
        document.addEventListener('click', this._onClick);
        document.addEventListener('dblclick', this._onDblClick);
        document.addEventListener('contextmenu', this._onContextMenu);

        // Touch events on document
        document.addEventListener('touchstart', this._onTouchStart, { passive: false });
        document.addEventListener('touchmove', this._onTouchMove, { passive: false });
        document.addEventListener('touchend', this._onTouchEnd, { passive: false });
    }

    /**
     * Remove event listeners
     */
    detachListeners() {
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('mouseup', this._onMouseUp);
        document.removeEventListener('click', this._onClick);
        document.removeEventListener('dblclick', this._onDblClick);
        document.removeEventListener('contextmenu', this._onContextMenu);

        document.removeEventListener('touchstart', this._onTouchStart);
        document.removeEventListener('touchmove', this._onTouchMove);
        document.removeEventListener('touchend', this._onTouchEnd);
    }

    /**
     * Main update loop
     */
    update(deltaTime) {
        if (!this.config.enabled || !this.ecosystem) return;

        // Update hold charge
        if (this.isMouseDown && this.holdStartTime) {
            this.holdCharge = Math.min(1, (Date.now() - this.holdStartTime) / this.config.holdChargeTime);

            // Visual feedback for charging
            if (this.holdCharge > 0.1 && this.particleSystem) {
                this.createChargeEffect();
            }
        }

        // Apply drag current
        if (this.isDragging && this.dragTrail.length > 1) {
            this.applyDragCurrent();
        }

        // Clean old drag trail points
        const now = Date.now();
        this.dragTrail = this.dragTrail.filter(p =>
            now - p.time < this.config.dragTrailPersistence
        );

        // Passive mouse attraction (subtle)
        if (!this.isMouseDown && !this.isDragging) {
            this.applyPassiveAttraction();
        }
    }

    /**
     * Mouse move handler
     */
    _handleMouseMove(event) {
        // Use clientX/Y directly since we're tracking on full viewport
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;

        if (this.isMouseDown) {
            this.isDragging = true;

            // Add to drag trail
            this.dragTrail.push({
                x: this.mouse.x,
                y: this.mouse.y,
                time: Date.now()
            });

            // Limit trail length
            if (this.dragTrail.length > 50) {
                this.dragTrail.shift();
            }
        }
    }

    /**
     * Mouse down handler
     */
    _handleMouseDown(event) {
        if (event.button !== 0) return; // Left click only

        this.isMouseDown = true;
        this.dragStart = { x: this.mouse.x, y: this.mouse.y };
        this.holdStartTime = Date.now();
        this.holdCharge = 0;

        this.dragTrail = [{
            x: this.mouse.x,
            y: this.mouse.y,
            time: Date.now()
        }];
    }

    /**
     * Mouse up handler
     */
    _handleMouseUp(event) {
        // Check for charged burst
        if (this.holdCharge > 0.8) {
            this.createChargeBurst();
        }

        this.isMouseDown = false;
        this.isDragging = false;
        this.dragStart = null;
        this.holdStartTime = null;
        this.holdCharge = 0;
    }

    /**
     * Click handler - attract nearby fireflies
     */
    _handleClick(event) {
        // Don't interact if clicking on controls
        if (event.target.closest('.controls') || event.target.closest('.digital-life-stats')) return;
        if (!this.ecosystem) return;

        const now = Date.now();

        // Attract fireflies to click position
        this.attractToPoint(this.mouse.x, this.mouse.y);

        // Create click ripple
        this.createClickRipple(this.mouse.x, this.mouse.y);

        this.lastClick = now;
    }

    /**
     * Double-click handler - spawn firefly
     */
    _handleDoubleClick(event) {
        if (event.target.closest('.controls') || event.target.closest('.digital-life-stats')) return;
        if (!this.config.doubleClickSpawn || !this.ecosystem) return;

        const now = Date.now();
        if (now - this.lastSpawn < this.config.spawnCooldown) return;

        // Spawn at double-click location
        const firefly = this.ecosystem.spawnFirefly({
            x: this.mouse.x,
            y: this.mouse.y,
            digit: Math.round(Math.random())
        });

        if (firefly) {
            this.createSpawnEffect(this.mouse.x, this.mouse.y);
            this.lastSpawn = now;
        }
    }

    /**
     * Right-click handler - repel fireflies
     */
    _handleContextMenu(event) {
        if (event.target.closest('.controls') || event.target.closest('.digital-life-stats')) return;

        event.preventDefault();

        if (!this.ecosystem) return;

        // Repel fireflies from click position
        this.repelFromPoint(this.mouse.x, this.mouse.y);

        // Create repel effect
        this.createRepelEffect(this.mouse.x, this.mouse.y);
    }

    /**
     * Touch start handler
     */
    _handleTouchStart(event) {
        // Don't prevent default for controls area
        if (event.target.closest('.controls')) return;

        event.preventDefault();

        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startTime: Date.now()
            });
        }

        this.isTouching = true;

        if (event.touches.length === 1) {
            this.isMouseDown = true;
            this.holdStartTime = Date.now();
            const touch = event.touches[0];
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;
        }
    }

    /**
     * Touch move handler
     */
    _handleTouchMove(event) {
        if (event.target.closest('.controls')) return;

        event.preventDefault();

        for (const touch of event.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
            }
        }

        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;

            this.isDragging = true;
            this.dragTrail.push({
                x: this.mouse.x,
                y: this.mouse.y,
                time: Date.now()
            });
        }
    }

    /**
     * Touch end handler
     */
    _handleTouchEnd(event) {
        event.preventDefault();

        for (const touch of event.changedTouches) {
            const touchData = this.touches.get(touch.identifier);

            if (touchData) {
                const duration = Date.now() - touchData.startTime;

                // Short tap = attract, long tap = spawn
                if (duration < 300) {
                    this.attractToPoint(touchData.x, touchData.y);
                    this.createClickRipple(touchData.x, touchData.y);
                } else if (duration > 800 && this.config.doubleClickSpawn) {
                    this.ecosystem.spawnFirefly({
                        x: touchData.x,
                        y: touchData.y,
                        digit: Math.round(Math.random())
                    });
                    this.createSpawnEffect(touchData.x, touchData.y);
                }

                this.touches.delete(touch.identifier);
            }
        }

        if (event.touches.length === 0) {
            this.isTouching = false;
            this.isMouseDown = false;
            this.isDragging = false;
            this.holdStartTime = null;
            this.holdCharge = 0;
        }
    }

    /**
     * Attract fireflies to a point
     */
    attractToPoint(x, y) {
        if (!this.ecosystem) return;

        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            const dx = x - firefly.x;
            const dy = y - firefly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.config.clickAttractionRadius && dist > 0) {
                const force = this.config.clickAttractionForce * (1 - dist / this.config.clickAttractionRadius);
                firefly.applyForce(
                    (dx / dist) * force,
                    (dy / dist) * force
                );
            }
        }
    }

    /**
     * Repel fireflies from a point
     */
    repelFromPoint(x, y) {
        if (!this.ecosystem) return;

        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            const dx = firefly.x - x;
            const dy = firefly.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.config.clickAttractionRadius && dist > 0) {
                const force = this.config.clickRepelForce * (1 - dist / this.config.clickAttractionRadius);
                firefly.applyForce(
                    (dx / dist) * force,
                    (dy / dist) * force
                );
            }
        }
    }

    /**
     * Apply force along drag trail (current/wind effect)
     */
    applyDragCurrent() {
        if (!this.ecosystem || this.dragTrail.length < 2) return;

        // Calculate drag direction from recent trail points
        const recentPoints = this.dragTrail.slice(-5);
        let avgDx = 0;
        let avgDy = 0;

        for (let i = 1; i < recentPoints.length; i++) {
            avgDx += recentPoints[i].x - recentPoints[i - 1].x;
            avgDy += recentPoints[i].y - recentPoints[i - 1].y;
        }

        const len = Math.sqrt(avgDx * avgDx + avgDy * avgDy);
        if (len < 1) return;

        // Normalize
        avgDx /= len;
        avgDy /= len;

        // Apply to nearby fireflies
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            // Check distance to drag line
            const lastPoint = this.dragTrail[this.dragTrail.length - 1];
            const dist = Math.sqrt(
                Math.pow(firefly.x - lastPoint.x, 2) +
                Math.pow(firefly.y - lastPoint.y, 2)
            );

            if (dist < this.config.dragCurrentWidth) {
                const force = this.config.dragCurrentForce * (1 - dist / this.config.dragCurrentWidth);
                firefly.applyForce(avgDx * force, avgDy * force);
            }
        }

        // Create current particles
        if (this.particleSystem && Math.random() < 0.3) {
            const point = this.dragTrail[this.dragTrail.length - 1];
            this.particleSystem.createParticle({
                x: point.x + (Math.random() - 0.5) * 20,
                y: point.y + (Math.random() - 0.5) * 20,
                vx: avgDx * 2,
                vy: avgDy * 2,
                text: '~',
                size: 8,
                life: 300,
                fadeRate: 0.04,
                type: 'current',
                color: 'rgba(159, 122, 234, 0.5)'
            });
        }
    }

    /**
     * Subtle attraction to mouse when idle
     */
    applyPassiveAttraction() {
        if (!this.ecosystem) return;

        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            const dx = this.mouse.x - firefly.x;
            const dy = this.mouse.y - firefly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Very subtle attraction when close
            if (dist < 100 && dist > 20) {
                firefly.applyForce(
                    (dx / dist) * 0.002,
                    (dy / dist) * 0.002
                );
            }
        }
    }

    /**
     * Create visual effects
     */
    createClickRipple(x, y) {
        if (!this.particleSystem) return;

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particleSystem.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * 1.5,
                vy: Math.sin(angle) * 1.5,
                text: '·',
                size: 6,
                life: 400,
                fadeRate: 0.03,
                type: 'click_ripple',
                color: 'rgba(159, 122, 234, 0.6)',
                friction: 0.95
            });
        }
    }

    createRepelEffect(x, y) {
        if (!this.particleSystem) return;

        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            this.particleSystem.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                text: '×',
                size: 10,
                life: 300,
                fadeRate: 0.04,
                type: 'repel',
                color: '#ef4444',
                friction: 0.92
            });
        }
    }

    createSpawnEffect(x, y) {
        if (!this.particleSystem) return;

        this.particleSystem.createFlash(x, y, 'spawn');

        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            this.particleSystem.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                text: '✦',
                size: 8,
                life: 500,
                fadeRate: 0.025,
                type: 'spawn',
                color: '#9f7aea',
                friction: 0.94
            });
        }
    }

    createChargeEffect() {
        if (!this.particleSystem) return;

        const angle = Math.random() * Math.PI * 2;
        const dist = this.config.holdBurstRadius * this.holdCharge;

        this.particleSystem.createParticle({
            x: this.mouse.x + Math.cos(angle) * dist,
            y: this.mouse.y + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 2,
            vy: -Math.sin(angle) * 2,
            text: '⚡',
            size: 6 + this.holdCharge * 4,
            life: 400,
            fadeRate: 0.03,
            type: 'charge',
            color: '#fbbf24',
            friction: 0.9
        });
    }

    createChargeBurst() {
        if (!this.ecosystem || !this.particleSystem) return;

        // Burst effect
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i;
            this.particleSystem.createParticle({
                x: this.mouse.x,
                y: this.mouse.y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                text: '⚡',
                size: 12,
                life: 600,
                fadeRate: 0.02,
                type: 'burst',
                color: '#fbbf24',
                friction: 0.94
            });
        }

        // Strong repel effect
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            const dx = firefly.x - this.mouse.x;
            const dy = firefly.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.config.holdBurstRadius && dist > 0) {
                const force = 0.3 * (1 - dist / this.config.holdBurstRadius);
                firefly.applyForce((dx / dist) * force, (dy / dist) * force);

                // Boost energy slightly
                firefly.energy = Math.min(100, firefly.energy + 5);
            }
        }
    }

    /**
     * Get mouse position
     */
    getMousePosition() {
        return { ...this.mouse };
    }

    /**
     * Check if user is interacting
     */
    isInteracting() {
        return this.isMouseDown || this.isDragging || this.isTouching;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.detachListeners();
        this.container = null;
        this.ecosystem = null;
        this.particleSystem = null;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionSystem;
}
