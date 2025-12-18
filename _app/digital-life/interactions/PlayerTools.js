/**
 * PlayerTools.js - User Agency System
 *
 * Provides interactive tools for players to influence the ecosystem:
 * - Energy Blessing: Click to heal/boost fireflies
 * - Gravity Brush: Click-drag to create temporary gravity wells
 * - Shield Bubble: Create protective zones
 * - Spawn Beacon: Attract new fireflies to a location
 * - Evolution Catalyst: Accelerate evolution in an area
 *
 * Tools have cooldowns and limited uses to maintain balance.
 */

class PlayerTools {
    static TOOLS = {
        BLESSING: {
            name: 'Energy Blessing',
            icon: '✨',
            description: 'Click to heal and energize nearby fireflies',
            color: '#fbbf24',
            radius: 80,
            energyBoost: 30,
            cooldown: 3000,      // 3 seconds
            duration: 0,         // Instant
            maxCharges: 5,
            rechargeTime: 10000  // 10 seconds per charge
        },
        GRAVITY: {
            name: 'Gravity Brush',
            icon: '🌀',
            description: 'Click and drag to create temporary gravity',
            color: '#8b5cf6',
            radius: 100,
            strength: 0.15,
            cooldown: 500,
            duration: 2000,      // 2 second gravity wells
            maxCharges: 10,
            rechargeTime: 5000
        },
        SHIELD: {
            name: 'Shield Bubble',
            icon: '🛡️',
            description: 'Create a protective zone that blocks predators',
            color: '#38bdf8',
            radius: 120,
            cooldown: 8000,
            duration: 10000,     // 10 seconds
            maxCharges: 3,
            rechargeTime: 20000
        },
        BEACON: {
            name: 'Spawn Beacon',
            icon: '📡',
            description: 'Attract fireflies to this location',
            color: '#22c55e',
            radius: 150,
            attractStrength: 0.1,
            cooldown: 5000,
            duration: 8000,      // 8 seconds
            maxCharges: 3,
            rechargeTime: 15000
        },
        CATALYST: {
            name: 'Evolution Catalyst',
            icon: '⚗️',
            description: 'Accelerate evolution for fireflies in range',
            color: '#ec4899',
            radius: 100,
            evolutionBoost: 5,   // 5x evolution progress
            cooldown: 10000,
            duration: 5000,      // 5 seconds
            maxCharges: 2,
            rechargeTime: 30000
        }
    };

    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,
            showUI: config.showUI ?? true,
            startingCharges: config.startingCharges ?? 3,
            ...config
        };

        // Current tool state
        this.activeTool = null;
        this.isActive = false;

        // Tool charges (resources)
        this.charges = {};
        for (const [key, tool] of Object.entries(PlayerTools.TOOLS)) {
            this.charges[key] = Math.min(this.config.startingCharges, tool.maxCharges);
        }

        // Cooldown timers
        this.cooldowns = {};
        for (const key of Object.keys(PlayerTools.TOOLS)) {
            this.cooldowns[key] = 0;
        }

        // Active effects (temporary zones, gravity wells, etc.)
        this.activeEffects = [];

        // References
        this.container = null;
        this.ecosystem = null;

        // UI elements
        this.toolbarElement = null;
        this.cursorElement = null;

        // Input state
        this.mouseX = 0;
        this.mouseY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        // Event handlers
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundKeyDown = this.handleKeyDown.bind(this);

        // Stats
        this.stats = {
            blessingsUsed: 0,
            gravityWellsCreated: 0,
            shieldsDeployed: 0,
            beaconsPlaced: 0,
            catalystsUsed: 0,
            firefliesHealed: 0,
            firefliesProtected: 0
        };
    }

    /**
     * Initialize the tool system
     */
    init(container, ecosystem) {
        this.container = container;
        this.ecosystem = ecosystem;

        // Set up event listeners
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mousedown', this.boundMouseDown);
        document.addEventListener('mouseup', this.boundMouseUp);
        document.addEventListener('keydown', this.boundKeyDown);

        // Create UI
        if (this.config.showUI) {
            this.createToolbar();
            this.createCursor();
        }

        this.injectStyles();

        console.log('🛠️ Player tools initialized');
        return this;
    }

    /**
     * Create the tool selection toolbar
     */
    createToolbar() {
        this.toolbarElement = document.createElement('div');
        this.toolbarElement.className = 'player-tools-toolbar';
        this.toolbarElement.innerHTML = `
            <div class="toolbar-title">Tools</div>
            <div class="toolbar-tools">
                ${Object.entries(PlayerTools.TOOLS).map(([key, tool]) => `
                    <button class="tool-btn" data-tool="${key}" title="${tool.description}">
                        <span class="tool-icon">${tool.icon}</span>
                        <span class="tool-charges">${this.charges[key]}</span>
                    </button>
                `).join('')}
            </div>
            <div class="toolbar-hint">Press 1-5 or click to select</div>
        `;

        // Tool selection handlers
        this.toolbarElement.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectTool(btn.dataset.tool);
            });
        });

        document.body.appendChild(this.toolbarElement);
    }

    /**
     * Create custom cursor for active tool
     */
    createCursor() {
        this.cursorElement = document.createElement('div');
        this.cursorElement.className = 'player-tool-cursor';
        this.cursorElement.style.display = 'none';
        this.container.appendChild(this.cursorElement);
    }

    /**
     * Select a tool
     */
    selectTool(toolKey) {
        if (!PlayerTools.TOOLS[toolKey]) return;

        // Deselect if same tool
        if (this.activeTool === toolKey) {
            this.deselectTool();
            return;
        }

        this.activeTool = toolKey;
        this.isActive = true;

        // Update UI
        this.updateToolbarSelection();
        this.updateCursor();

        console.log(`🛠️ Selected: ${PlayerTools.TOOLS[toolKey].name}`);
    }

    /**
     * Deselect current tool
     */
    deselectTool() {
        this.activeTool = null;
        this.isActive = false;

        // Update UI
        this.updateToolbarSelection();
        if (this.cursorElement) {
            this.cursorElement.style.display = 'none';
        }
    }

    /**
     * Update toolbar visual state
     */
    updateToolbarSelection() {
        if (!this.toolbarElement) return;

        this.toolbarElement.querySelectorAll('.tool-btn').forEach(btn => {
            const isSelected = btn.dataset.tool === this.activeTool;
            btn.classList.toggle('selected', isSelected);

            // Update charge display
            const chargeEl = btn.querySelector('.tool-charges');
            if (chargeEl) {
                chargeEl.textContent = this.charges[btn.dataset.tool];
            }

            // Show cooldown state
            const cooldown = this.cooldowns[btn.dataset.tool];
            btn.classList.toggle('on-cooldown', cooldown > 0);
        });
    }

    /**
     * Update cursor appearance
     */
    updateCursor() {
        if (!this.cursorElement || !this.activeTool) return;

        const tool = PlayerTools.TOOLS[this.activeTool];
        this.cursorElement.style.display = 'block';
        this.cursorElement.style.width = `${tool.radius * 2}px`;
        this.cursorElement.style.height = `${tool.radius * 2}px`;
        this.cursorElement.style.borderColor = tool.color;
        this.cursorElement.style.boxShadow = `0 0 20px ${tool.color}40, inset 0 0 30px ${tool.color}20`;
        this.cursorElement.innerHTML = `<span class="cursor-icon">${tool.icon}</span>`;
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        // Update cursor position
        if (this.cursorElement && this.activeTool) {
            const tool = PlayerTools.TOOLS[this.activeTool];
            this.cursorElement.style.left = `${this.mouseX - tool.radius}px`;
            this.cursorElement.style.top = `${this.mouseY - tool.radius}px`;
        }

        // Handle gravity brush dragging
        if (this.isDragging && this.activeTool === 'GRAVITY') {
            this.createGravityWell(this.mouseX, this.mouseY);
        }
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(e) {
        if (!this.activeTool) return;
        if (e.target.closest('.player-tools-toolbar')) return;
        if (e.target.closest('.digital-life-debug')) return;
        if (e.target.closest('.controls')) return;

        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        // Use tool at click location
        this.useTool(e.clientX, e.clientY);
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(e) {
        this.isDragging = false;
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const toolKeys = Object.keys(PlayerTools.TOOLS);
        const keyNum = parseInt(e.key);

        if (keyNum >= 1 && keyNum <= toolKeys.length) {
            e.preventDefault();
            this.selectTool(toolKeys[keyNum - 1]);
        }

        // Escape to deselect
        if (e.key === 'Escape') {
            this.deselectTool();
        }
    }

    /**
     * Use the active tool at a location
     */
    useTool(x, y) {
        if (!this.activeTool) return false;

        const tool = PlayerTools.TOOLS[this.activeTool];

        // Check cooldown
        if (this.cooldowns[this.activeTool] > 0) {
            this.showFloatingText(x, y, 'Cooldown!', '#ef4444');
            return false;
        }

        // Check charges
        if (this.charges[this.activeTool] <= 0) {
            this.showFloatingText(x, y, 'No charges!', '#ef4444');
            return false;
        }

        // Use the tool
        let success = false;
        switch (this.activeTool) {
            case 'BLESSING':
                success = this.useBlessing(x, y);
                break;
            case 'GRAVITY':
                success = this.createGravityWell(x, y);
                break;
            case 'SHIELD':
                success = this.createShield(x, y);
                break;
            case 'BEACON':
                success = this.createBeacon(x, y);
                break;
            case 'CATALYST':
                success = this.createCatalyst(x, y);
                break;
        }

        if (success) {
            // Consume charge and start cooldown
            this.charges[this.activeTool]--;
            this.cooldowns[this.activeTool] = tool.cooldown;
            this.updateToolbarSelection();
        }

        return success;
    }

    /**
     * Energy Blessing - Heal and boost nearby fireflies
     */
    useBlessing(x, y) {
        const tool = PlayerTools.TOOLS.BLESSING;
        let healedCount = 0;

        if (!this.ecosystem) return false;

        for (const firefly of this.ecosystem.fireflies) {
            const dist = Math.sqrt((firefly.x - x) ** 2 + (firefly.y - y) ** 2);
            if (dist < tool.radius) {
                firefly.energy = Math.min(100, firefly.energy + tool.energyBoost);
                healedCount++;

                // Visual feedback on firefly
                if (firefly.element) {
                    firefly.element.style.filter = 'brightness(2)';
                    setTimeout(() => {
                        if (firefly.element) {
                            firefly.element.style.filter = '';
                        }
                    }, 300);
                }
            }
        }

        // Create visual effect
        this.createBlessingEffect(x, y, tool);

        this.stats.blessingsUsed++;
        this.stats.firefliesHealed += healedCount;

        if (healedCount > 0) {
            this.showFloatingText(x, y, `+${healedCount} healed!`, tool.color);
        }

        return true;
    }

    /**
     * Create blessing visual effect
     */
    createBlessingEffect(x, y, tool) {
        const effect = document.createElement('div');
        effect.className = 'blessing-effect';
        effect.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${tool.radius * 2}px;
            height: ${tool.radius * 2}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: radial-gradient(circle, ${tool.color}60 0%, transparent 70%);
            pointer-events: none;
            animation: blessingPulse 0.6s ease-out forwards;
            z-index: 20;
        `;
        this.container.appendChild(effect);

        setTimeout(() => effect.remove(), 600);
    }

    /**
     * Gravity Brush - Create temporary gravity well
     */
    createGravityWell(x, y) {
        const tool = PlayerTools.TOOLS.GRAVITY;

        // Limit gravity well creation rate when dragging
        const lastGravityWell = this.activeEffects.find(e => e.type === 'gravity');
        if (lastGravityWell && Date.now() - lastGravityWell.createdAt < 100) {
            return false;
        }

        const well = {
            type: 'gravity',
            x, y,
            radius: tool.radius,
            strength: tool.strength,
            createdAt: Date.now(),
            expiresAt: Date.now() + tool.duration,
            element: null
        };

        // Create visual
        well.element = document.createElement('div');
        well.element.className = 'gravity-well-effect';
        well.element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${tool.radius * 2}px;
            height: ${tool.radius * 2}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px dashed ${tool.color}80;
            background: radial-gradient(circle, ${tool.color}20 0%, transparent 70%);
            pointer-events: none;
            animation: gravityWellSpin 2s linear infinite;
            z-index: 15;
        `;
        this.container.appendChild(well.element);

        this.activeEffects.push(well);
        this.stats.gravityWellsCreated++;

        return true;
    }

    /**
     * Shield Bubble - Create protective zone
     */
    createShield(x, y) {
        const tool = PlayerTools.TOOLS.SHIELD;

        const shield = {
            type: 'shield',
            x, y,
            radius: tool.radius,
            createdAt: Date.now(),
            expiresAt: Date.now() + tool.duration,
            element: null
        };

        // Create visual
        shield.element = document.createElement('div');
        shield.element.className = 'shield-effect';
        shield.element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${tool.radius * 2}px;
            height: ${tool.radius * 2}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 3px solid ${tool.color};
            background: radial-gradient(circle, ${tool.color}10 0%, ${tool.color}30 80%, transparent 100%);
            box-shadow: 0 0 30px ${tool.color}60, inset 0 0 30px ${tool.color}20;
            pointer-events: none;
            animation: shieldPulse 2s ease-in-out infinite;
            z-index: 18;
        `;
        shield.element.innerHTML = `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;">🛡️</span>`;
        this.container.appendChild(shield.element);

        this.activeEffects.push(shield);
        this.stats.shieldsDeployed++;
        this.showFloatingText(x, y, 'Shield Active!', tool.color);

        return true;
    }

    /**
     * Spawn Beacon - Attract fireflies
     */
    createBeacon(x, y) {
        const tool = PlayerTools.TOOLS.BEACON;

        const beacon = {
            type: 'beacon',
            x, y,
            radius: tool.radius,
            strength: tool.attractStrength,
            createdAt: Date.now(),
            expiresAt: Date.now() + tool.duration,
            element: null
        };

        // Create visual
        beacon.element = document.createElement('div');
        beacon.element.className = 'beacon-effect';
        beacon.element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${tool.radius * 2}px;
            height: ${tool.radius * 2}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px solid ${tool.color}60;
            background: radial-gradient(circle, ${tool.color}30 0%, transparent 60%);
            pointer-events: none;
            animation: beaconPulse 1.5s ease-in-out infinite;
            z-index: 15;
        `;
        beacon.element.innerHTML = `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:20px;">📡</span>`;
        this.container.appendChild(beacon.element);

        this.activeEffects.push(beacon);
        this.stats.beaconsPlaced++;
        this.showFloatingText(x, y, 'Beacon Active!', tool.color);

        return true;
    }

    /**
     * Evolution Catalyst - Boost evolution
     */
    createCatalyst(x, y) {
        const tool = PlayerTools.TOOLS.CATALYST;

        const catalyst = {
            type: 'catalyst',
            x, y,
            radius: tool.radius,
            boost: tool.evolutionBoost,
            createdAt: Date.now(),
            expiresAt: Date.now() + tool.duration,
            element: null
        };

        // Create visual
        catalyst.element = document.createElement('div');
        catalyst.element.className = 'catalyst-effect';
        catalyst.element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${tool.radius * 2}px;
            height: ${tool.radius * 2}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px solid ${tool.color};
            background: radial-gradient(circle, ${tool.color}40 0%, ${tool.color}10 50%, transparent 70%);
            box-shadow: 0 0 40px ${tool.color}60;
            pointer-events: none;
            animation: catalystGlow 0.5s ease-in-out infinite alternate;
            z-index: 16;
        `;
        catalyst.element.innerHTML = `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;">⚗️</span>`;
        this.container.appendChild(catalyst.element);

        this.activeEffects.push(catalyst);
        this.stats.catalystsUsed++;
        this.showFloatingText(x, y, 'Evolution Boost!', tool.color);

        return true;
    }

    /**
     * Show floating text feedback
     */
    showFloatingText(x, y, text, color) {
        const el = document.createElement('div');
        el.className = 'tool-floating-text';
        el.textContent = text;
        el.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            text-shadow: 0 0 10px ${color};
            pointer-events: none;
            animation: floatUp 1s ease-out forwards;
            z-index: 100;
        `;
        this.container.appendChild(el);

        setTimeout(() => el.remove(), 1000);
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp) {
        if (!this.config.enabled) return;

        // Update cooldowns
        for (const key of Object.keys(this.cooldowns)) {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] = Math.max(0, this.cooldowns[key] - deltaTime);
            }
        }

        // Recharge system
        for (const [key, tool] of Object.entries(PlayerTools.TOOLS)) {
            if (this.charges[key] < tool.maxCharges) {
                if (!this.rechargeTimers) this.rechargeTimers = {};
                this.rechargeTimers[key] = (this.rechargeTimers[key] || 0) + deltaTime;

                if (this.rechargeTimers[key] >= tool.rechargeTime) {
                    this.charges[key]++;
                    this.rechargeTimers[key] = 0;
                    this.updateToolbarSelection();
                }
            }
        }

        // Update active effects
        this.updateActiveEffects(deltaTime, timestamp);

        // Update toolbar UI
        this.updateToolbarSelection();
    }

    /**
     * Update active tool effects
     */
    updateActiveEffects(deltaTime, timestamp) {
        const now = Date.now();

        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];

            // Check expiration
            if (now >= effect.expiresAt) {
                if (effect.element) {
                    effect.element.remove();
                }
                this.activeEffects.splice(i, 1);
                continue;
            }

            // Apply effect
            this.applyEffect(effect, deltaTime);
        }
    }

    /**
     * Apply an active effect to the ecosystem
     */
    applyEffect(effect, deltaTime) {
        if (!this.ecosystem) return;

        switch (effect.type) {
            case 'gravity':
                // Pull fireflies toward gravity well
                for (const firefly of this.ecosystem.fireflies) {
                    const dx = effect.x - firefly.x;
                    const dy = effect.y - firefly.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < effect.radius && dist > 5) {
                        const force = effect.strength * (1 - dist / effect.radius);
                        firefly.vx += (dx / dist) * force;
                        firefly.vy += (dy / dist) * force;
                    }
                }
                break;

            case 'shield':
                // Protect fireflies from predators
                this.applyShieldProtection(effect);
                break;

            case 'beacon':
                // Attract fireflies
                for (const firefly of this.ecosystem.fireflies) {
                    const dx = effect.x - firefly.x;
                    const dy = effect.y - firefly.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < effect.radius && dist > 20) {
                        const force = effect.strength * (1 - dist / effect.radius);
                        firefly.vx += (dx / dist) * force;
                        firefly.vy += (dy / dist) * force;
                    }
                }
                break;

            case 'catalyst':
                // Boost evolution progress
                for (const firefly of this.ecosystem.fireflies) {
                    const dx = effect.x - firefly.x;
                    const dy = effect.y - firefly.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < effect.radius) {
                        // Add evolution progress
                        firefly.evolutionProgress = (firefly.evolutionProgress || 0) +
                            deltaTime * 0.001 * effect.boost;
                    }
                }
                break;
        }
    }

    /**
     * Apply shield protection (repel predators)
     */
    applyShieldProtection(shield) {
        // Repel predator stars
        if (window.digitalLife?.predatorStars) {
            for (const predator of window.digitalLife.predatorStars) {
                const dx = predator.x - shield.x;
                const dy = predator.y - shield.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < shield.radius + 20) {
                    // Push predator away
                    const pushForce = 0.5;
                    predator.x += (dx / dist) * pushForce * 10;
                    predator.y += (dy / dist) * pushForce * 10;
                }
            }
        }

        // Repel Phase 5 predators
        if (window.digitalLife?.predatorManager) {
            const pm = window.digitalLife.predatorManager;

            // Repel shadows
            for (const shadow of pm.shadows) {
                const dx = shadow.x - shield.x;
                const dy = shadow.y - shield.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < shield.radius) {
                    shadow.flee(shield.x, shield.y);
                }
            }

            // Repel serpents
            for (const serpent of pm.serpents) {
                const dx = serpent.x - shield.x;
                const dy = serpent.y - shield.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < shield.radius) {
                    if (serpent.state !== 'fleeing' && serpent.state !== 'leaving') {
                        serpent.startFleeing();
                    }
                }
            }

            // Repel parasites
            for (const parasite of pm.parasites) {
                if (parasite.state === 'seeking') {
                    const dx = parasite.x - shield.x;
                    const dy = parasite.y - shield.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < shield.radius) {
                        // Push away
                        parasite.vx += (dx / Math.max(dist, 1)) * 0.1;
                        parasite.vy += (dy / Math.max(dist, 1)) * 0.1;
                    }
                }
            }
        }

        // Count protected fireflies
        if (this.ecosystem) {
            let protectedCount = 0;
            for (const firefly of this.ecosystem.fireflies) {
                const dx = firefly.x - shield.x;
                const dy = firefly.y - shield.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < shield.radius) {
                    protectedCount++;
                    firefly.isShielded = true;
                }
            }
            this.stats.firefliesProtected = Math.max(this.stats.firefliesProtected, protectedCount);
        }
    }

    /**
     * Check if a point is within any active shield
     */
    isPointShielded(x, y) {
        for (const effect of this.activeEffects) {
            if (effect.type === 'shield') {
                const dx = x - effect.x;
                const dy = y - effect.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < effect.radius) return true;
            }
        }
        return false;
    }

    /**
     * Get all active shields (for external systems)
     */
    getActiveShields() {
        return this.activeEffects.filter(e => e.type === 'shield');
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('player-tools-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'player-tools-styles';
        styles.textContent = `
            .player-tools-toolbar {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.85);
                padding: 10px 15px;
                border-radius: 12px;
                border: 1px solid #333;
                z-index: 1000;
                pointer-events: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .toolbar-title {
                font-family: 'Courier New', monospace;
                font-size: 10px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .toolbar-tools {
                display: flex;
                gap: 8px;
            }

            .tool-btn {
                position: relative;
                width: 50px;
                height: 50px;
                background: rgba(30, 30, 30, 0.9);
                border: 2px solid #444;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .tool-btn:hover {
                border-color: #888;
                transform: translateY(-2px);
            }

            .tool-btn.selected {
                border-color: #9f7aea;
                box-shadow: 0 0 15px rgba(159, 122, 234, 0.5);
                background: rgba(159, 122, 234, 0.2);
            }

            .tool-btn.on-cooldown {
                opacity: 0.5;
            }

            .tool-icon {
                font-size: 20px;
            }

            .tool-charges {
                position: absolute;
                bottom: 2px;
                right: 4px;
                font-size: 10px;
                color: #888;
                font-family: 'Courier New', monospace;
            }

            .toolbar-hint {
                font-family: 'Courier New', monospace;
                font-size: 9px;
                color: #444;
            }

            .player-tool-cursor {
                position: fixed;
                border-radius: 50%;
                border: 2px dashed;
                pointer-events: none;
                z-index: 50;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.2s;
            }

            .cursor-icon {
                font-size: 24px;
                opacity: 0.8;
            }

            @keyframes blessingPulse {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }

            @keyframes gravityWellSpin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            @keyframes shieldPulse {
                0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
            }

            @keyframes beaconPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); border-width: 2px; }
                50% { transform: translate(-50%, -50%) scale(1.1); border-width: 1px; }
            }

            @keyframes catalystGlow {
                0% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.4); }
                100% { box-shadow: 0 0 50px rgba(236, 72, 153, 0.8); }
            }

            @keyframes floatUp {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-40px); opacity: 0; }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Get tool stats
     */
    getStats() {
        return {
            ...this.stats,
            activeTool: this.activeTool,
            activeEffects: this.activeEffects.length,
            charges: { ...this.charges }
        };
    }

    /**
     * Clean up
     */
    destroy() {
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mousedown', this.boundMouseDown);
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('keydown', this.boundKeyDown);

        // Remove effects
        for (const effect of this.activeEffects) {
            if (effect.element) {
                effect.element.remove();
            }
        }
        this.activeEffects = [];

        // Remove UI
        if (this.toolbarElement) {
            this.toolbarElement.remove();
        }
        if (this.cursorElement) {
            this.cursorElement.remove();
        }

        // Remove styles
        const styles = document.getElementById('player-tools-styles');
        if (styles) styles.remove();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerTools;
}
