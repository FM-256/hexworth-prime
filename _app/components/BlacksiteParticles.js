/**
 * BlacksiteParticles.js - Particle Engine for BLACKSITE TERMINAL
 * Hexworth Prime - Grep & Pipe Mastery
 *
 * Handles:
 * - Fuse sparks and ember glow
 * - Smoke particles
 * - Explosion shockwave
 * - Mushroom cloud
 * - Debris particles
 *
 * Version: 1.0.0
 */

const BlacksiteParticles = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const CONFIG = {
        // Spark settings
        spark: {
            count: 3,
            speed: { min: 50, max: 150 },
            size: { min: 1, max: 3 },
            life: { min: 0.3, max: 0.6 },
            gravity: 200,
            colors: ['#fff', '#fbbf24', '#f59e0b', '#ef4444']
        },

        // Smoke settings
        smoke: {
            count: 2,
            speed: { min: 20, max: 40 },
            size: { min: 3, max: 8 },
            life: { min: 0.8, max: 1.5 },
            gravity: -30, // rises
            colors: ['rgba(100,100,100,0.3)', 'rgba(80,80,80,0.2)', 'rgba(60,60,60,0.1)']
        },

        // Explosion settings
        explosion: {
            // Shockwave
            shockwave: {
                maxRadius: 800,
                speed: 1500,
                color: 'rgba(255,200,100,0.6)',
                thickness: 20
            },

            // Core flash
            flash: {
                duration: 200,
                color: '#fff'
            },

            // Mushroom cloud
            cloud: {
                particles: 200,
                speed: { min: 100, max: 400 },
                size: { min: 5, max: 40 },
                life: { min: 2, max: 4 },
                gravity: -50,
                colors: [
                    'rgba(255,100,50,0.8)',
                    'rgba(255,150,50,0.7)',
                    'rgba(200,100,50,0.6)',
                    'rgba(150,80,50,0.5)',
                    'rgba(100,100,100,0.4)'
                ]
            },

            // Debris
            debris: {
                count: 50,
                speed: { min: 200, max: 600 },
                size: { min: 2, max: 6 },
                life: { min: 1, max: 3 },
                gravity: 400,
                colors: ['#333', '#444', '#555', '#222']
            }
        }
    };


    // ═══════════════════════════════════════════════════════════════
    // PARTICLE CLASS
    // ═══════════════════════════════════════════════════════════════

    class Particle {
        constructor(options) {
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.vx = options.vx || 0;
            this.vy = options.vy || 0;
            this.size = options.size || 2;
            this.originalSize = this.size;
            this.life = options.life || 1;
            this.maxLife = this.life;
            this.gravity = options.gravity || 0;
            this.color = options.color || '#fff';
            this.type = options.type || 'spark';
            this.alpha = 1;
            this.rotation = options.rotation || 0;
            this.rotationSpeed = options.rotationSpeed || 0;
        }

        update(dt) {
            // Apply velocity
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Apply gravity
            this.vy += this.gravity * dt;

            // Apply rotation
            this.rotation += this.rotationSpeed * dt;

            // Reduce life
            this.life -= dt;

            // Calculate alpha based on life
            this.alpha = Math.max(0, this.life / this.maxLife);

            // Size changes for certain types
            if (this.type === 'smoke') {
                this.size = this.originalSize * (1 + (1 - this.alpha) * 2);
            } else if (this.type === 'cloud') {
                this.size = this.originalSize * (0.5 + this.alpha * 0.5);
            }

            return this.life > 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;

            if (this.type === 'spark') {
                // Glowing spark
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'smoke' || this.type === 'cloud') {
                // Soft circle
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size
                );
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'debris') {
                // Rotating square debris
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }

            ctx.restore();
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // SHOCKWAVE CLASS
    // ═══════════════════════════════════════════════════════════════

    class Shockwave {
        constructor(x, y, config) {
            this.x = x;
            this.y = y;
            this.radius = 0;
            this.maxRadius = config.maxRadius;
            this.speed = config.speed;
            this.color = config.color;
            this.thickness = config.thickness;
            this.active = true;
        }

        update(dt) {
            this.radius += this.speed * dt;
            if (this.radius >= this.maxRadius) {
                this.active = false;
            }
            return this.active;
        }

        draw(ctx) {
            const alpha = 1 - (this.radius / this.maxRadius);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.thickness * alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // PARTICLE SYSTEM
    // ═══════════════════════════════════════════════════════════════

    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.shockwaves = [];
            this.running = false;
            this.lastTime = 0;

            // Resize handler
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width || window.innerWidth;
            this.canvas.height = rect.height || window.innerHeight;
        }

        // Utility functions
        random(min, max) {
            return Math.random() * (max - min) + min;
        }

        randomFromArray(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // Spawn spark particles (for fuse)
        spawnSparks(x, y, count = CONFIG.spark.count) {
            for (let i = 0; i < count; i++) {
                const angle = this.random(-Math.PI, 0); // Upward arc
                const speed = this.random(CONFIG.spark.speed.min, CONFIG.spark.speed.max);

                this.particles.push(new Particle({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: this.random(CONFIG.spark.size.min, CONFIG.spark.size.max),
                    life: this.random(CONFIG.spark.life.min, CONFIG.spark.life.max),
                    gravity: CONFIG.spark.gravity,
                    color: this.randomFromArray(CONFIG.spark.colors),
                    type: 'spark'
                }));
            }
        }

        // Spawn smoke particles (for fuse)
        spawnSmoke(x, y, count = CONFIG.smoke.count) {
            for (let i = 0; i < count; i++) {
                const angle = this.random(-Math.PI * 0.75, -Math.PI * 0.25);
                const speed = this.random(CONFIG.smoke.speed.min, CONFIG.smoke.speed.max);

                this.particles.push(new Particle({
                    x: x + this.random(-5, 5),
                    y: y,
                    vx: Math.cos(angle) * speed + this.random(-10, 10),
                    vy: Math.sin(angle) * speed,
                    size: this.random(CONFIG.smoke.size.min, CONFIG.smoke.size.max),
                    life: this.random(CONFIG.smoke.life.min, CONFIG.smoke.life.max),
                    gravity: CONFIG.smoke.gravity,
                    color: this.randomFromArray(CONFIG.smoke.colors),
                    type: 'smoke'
                }));
            }
        }

        // Spawn explosion
        spawnExplosion(x, y, callback) {
            const cfg = CONFIG.explosion;

            // Add shockwave
            this.shockwaves.push(new Shockwave(x, y, cfg.shockwave));

            // Add mushroom cloud particles
            for (let i = 0; i < cfg.cloud.particles; i++) {
                const angle = this.random(0, Math.PI * 2);
                const speed = this.random(cfg.cloud.speed.min, cfg.cloud.speed.max);
                const distanceFactor = this.random(0.3, 1);

                this.particles.push(new Particle({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed * distanceFactor,
                    vy: Math.sin(angle) * speed * distanceFactor - this.random(50, 150),
                    size: this.random(cfg.cloud.size.min, cfg.cloud.size.max),
                    life: this.random(cfg.cloud.life.min, cfg.cloud.life.max),
                    gravity: cfg.cloud.gravity,
                    color: this.randomFromArray(cfg.cloud.colors),
                    type: 'cloud'
                }));
            }

            // Add debris
            for (let i = 0; i < cfg.debris.count; i++) {
                const angle = this.random(0, Math.PI * 2);
                const speed = this.random(cfg.debris.speed.min, cfg.debris.speed.max);

                this.particles.push(new Particle({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - this.random(100, 300),
                    size: this.random(cfg.debris.size.min, cfg.debris.size.max),
                    life: this.random(cfg.debris.life.min, cfg.debris.life.max),
                    gravity: cfg.debris.gravity,
                    color: this.randomFromArray(cfg.debris.colors),
                    type: 'debris',
                    rotation: this.random(0, Math.PI * 2),
                    rotationSpeed: this.random(-10, 10)
                }));
            }

            // Callback when explosion animation is "mostly done"
            if (callback) {
                setTimeout(callback, 2000);
            }
        }

        // Animation loop
        start() {
            if (this.running) return;
            this.running = true;
            this.lastTime = performance.now();
            this.animate();
        }

        stop() {
            this.running = false;
        }

        clear() {
            this.particles = [];
            this.shockwaves = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        animate() {
            if (!this.running) return;

            const now = performance.now();
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw shockwaves
            this.shockwaves = this.shockwaves.filter(sw => {
                const alive = sw.update(dt);
                if (alive) sw.draw(this.ctx);
                return alive;
            });

            // Update and draw particles
            this.particles = this.particles.filter(p => {
                const alive = p.update(dt);
                if (alive) p.draw(this.ctx);
                return alive;
            });

            requestAnimationFrame(() => this.animate());
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // FUSE MANAGER
    // ═══════════════════════════════════════════════════════════════

    class FuseManager {
        constructor(options) {
            this.container = options.container;
            this.onComplete = options.onComplete || (() => {});

            // Fuse state
            this.totalTime = options.time || 300; // seconds
            this.remainingTime = this.totalTime;
            this.running = false;
            this.lastUpdate = 0;

            // Particle canvas for fuse sparks
            this.sparkCanvas = null;
            this.sparkSystem = null;

            // DOM elements
            this.elements = {};

            this.init();
        }

        init() {
            // Create fuse elements
            const fuseContainer = document.createElement('div');
            fuseContainer.className = 'blacksite-fuse-container';
            fuseContainer.innerHTML = `
                <div class="blacksite-fuse-track">
                    <div class="blacksite-fuse-burned"></div>
                    <div class="blacksite-fuse-remaining"></div>
                    <div class="blacksite-fuse-ember"></div>
                </div>
            `;

            // Create spark canvas
            this.sparkCanvas = document.createElement('canvas');
            this.sparkCanvas.style.cssText = `
                position: absolute;
                top: -50px;
                left: 0;
                width: 100%;
                height: 80px;
                pointer-events: none;
            `;
            fuseContainer.appendChild(this.sparkCanvas);

            this.container.appendChild(fuseContainer);

            // Store references
            this.elements.burned = fuseContainer.querySelector('.blacksite-fuse-burned');
            this.elements.remaining = fuseContainer.querySelector('.blacksite-fuse-remaining');
            this.elements.ember = fuseContainer.querySelector('.blacksite-fuse-ember');
            this.elements.container = fuseContainer;

            // Initialize spark system
            this.sparkSystem = new ParticleSystem(this.sparkCanvas);
            this.sparkSystem.start();

            // Initial render
            this.render();
        }

        start() {
            if (this.running) return;
            this.running = true;
            this.lastUpdate = performance.now();
            this.tick();
        }

        pause() {
            this.running = false;
        }

        resume() {
            if (!this.running) {
                this.running = true;
                this.lastUpdate = performance.now();
                this.tick();
            }
        }

        reset(time) {
            this.totalTime = time || this.totalTime;
            this.remainingTime = this.totalTime;
            this.running = false;
            this.render();
        }

        addTime(seconds) {
            this.remainingTime = Math.min(this.remainingTime + seconds, this.totalTime);
            this.render();
        }

        tick() {
            if (!this.running) return;

            const now = performance.now();
            const dt = (now - this.lastUpdate) / 1000;
            this.lastUpdate = now;

            this.remainingTime = Math.max(0, this.remainingTime - dt);
            this.render();

            // Spawn sparks periodically
            if (Math.random() < 0.3) {
                const emberRect = this.elements.ember.getBoundingClientRect();
                const canvasRect = this.sparkCanvas.getBoundingClientRect();
                const x = emberRect.left - canvasRect.left + emberRect.width / 2;
                const y = emberRect.top - canvasRect.top + emberRect.height / 2;
                this.sparkSystem.spawnSparks(x, y, 2);
                this.sparkSystem.spawnSmoke(x, y, 1);
            }

            if (this.remainingTime <= 0) {
                this.running = false;
                this.onComplete();
            } else {
                requestAnimationFrame(() => this.tick());
            }
        }

        render() {
            const progress = this.remainingTime / this.totalTime;
            const burnedPercent = (1 - progress) * 100;

            this.elements.burned.style.width = `${burnedPercent}%`;
            this.elements.remaining.style.width = `${progress * 100}%`;
            this.elements.ember.style.left = `${burnedPercent}%`;
        }

        getTimeRemaining() {
            return this.remainingTime;
        }

        getFormattedTime() {
            const mins = Math.floor(this.remainingTime / 60);
            const secs = Math.floor(this.remainingTime % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        destroy() {
            this.running = false;
            if (this.sparkSystem) {
                this.sparkSystem.stop();
            }
            if (this.elements.container) {
                this.elements.container.remove();
            }
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // EXPLOSION MANAGER
    // ═══════════════════════════════════════════════════════════════

    class ExplosionManager {
        constructor() {
            this.overlay = null;
            this.canvas = null;
            this.particleSystem = null;
            this.flashElement = null;
            this.messageElement = null;
        }

        createOverlay() {
            // Create overlay container
            this.overlay = document.createElement('div');
            this.overlay.className = 'blacksite-explosion-overlay';
            this.overlay.innerHTML = `
                <div class="blacksite-explosion-flash"></div>
                <canvas class="blacksite-explosion-canvas"></canvas>
                <div class="blacksite-explosion-message">
                    <div class="blacksite-explosion-title">SIGNAL LOST</div>
                    <div class="blacksite-explosion-stats">Mission Failed</div>
                    <button class="blacksite-retry-btn">RETRY MISSION</button>
                </div>
            `;

            document.body.appendChild(this.overlay);

            // Store references
            this.flashElement = this.overlay.querySelector('.blacksite-explosion-flash');
            this.canvas = this.overlay.querySelector('.blacksite-explosion-canvas');
            this.messageElement = this.overlay.querySelector('.blacksite-explosion-message');

            // Size canvas
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // Initialize particle system
            this.particleSystem = new ParticleSystem(this.canvas);

            return this.overlay.querySelector('.blacksite-retry-btn');
        }

        trigger(stats, onRetry) {
            if (!this.overlay) {
                const retryBtn = this.createOverlay();
                retryBtn.addEventListener('click', () => {
                    this.hide();
                    if (onRetry) onRetry();
                });
            }

            // Update stats
            const statsEl = this.overlay.querySelector('.blacksite-explosion-stats');
            if (stats) {
                statsEl.textContent = `Bomb detonated with ${stats.timeRemaining} remaining`;
            }

            // Show overlay
            this.overlay.classList.add('active');

            // Shake screen
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 500);

            // Flash
            this.flashElement.classList.add('active');
            setTimeout(() => this.flashElement.classList.remove('active'), 300);

            // Spawn explosion at center
            this.particleSystem.start();
            this.particleSystem.spawnExplosion(
                window.innerWidth / 2,
                window.innerHeight / 2,
                () => {
                    // Show message after explosion
                    this.messageElement.classList.add('visible');
                }
            );
        }

        hide() {
            if (this.overlay) {
                this.overlay.classList.remove('active');
                this.messageElement.classList.remove('visible');
                this.particleSystem.clear();
            }
        }

        destroy() {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
            if (this.particleSystem) {
                this.particleSystem.stop();
            }
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        ParticleSystem: ParticleSystem,
        FuseManager: FuseManager,
        ExplosionManager: ExplosionManager,

        // Quick access factory methods
        createFuse: function(options) {
            return new FuseManager(options);
        },

        createExplosion: function() {
            return new ExplosionManager();
        },

        createParticleSystem: function(canvas) {
            return new ParticleSystem(canvas);
        }
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlacksiteParticles;
}
