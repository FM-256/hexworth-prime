/**
 * Constellation.js - Pattern Formation System
 *
 * Fireflies occasionally align into recognizable patterns:
 * - Triangle, Square, Line, Pentagon
 * - Network topology shapes (Star, Ring, Mesh)
 * - Glow brighter when in formation
 * - Hold formation briefly, then disperse
 */

class ConstellationSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            formationChance: config.formationChance ?? 0.0003, // Per frame
            minFireflies: config.minFireflies ?? 4,
            maxFireflies: config.maxFireflies ?? 7,
            formationDuration: config.formationDuration ?? 4000,
            formationRadius: config.formationRadius ?? 100,
            glowBoost: config.glowBoost ?? 1.5,
            // Twinkle settings
            twinkleSpeed: config.twinkleSpeed ?? 0.003,
            twinkleIntensity: config.twinkleIntensity ?? 0.4,
            colorShiftSpeed: config.colorShiftSpeed ?? 0.0008,
            ...config
        };

        // Color gradient palettes for constellations
        this.colorPalettes = [
            // Aurora (cyan → purple → pink)
            ['#67e8f9', '#a78bfa', '#f472b6', '#a78bfa'],
            // Sunset (gold → orange → red → pink)
            ['#fbbf24', '#fb923c', '#f87171', '#fb7185'],
            // Ocean (teal → blue → indigo)
            ['#2dd4bf', '#38bdf8', '#818cf8', '#38bdf8'],
            // Forest (green → teal → emerald)
            ['#4ade80', '#2dd4bf', '#34d399', '#2dd4bf'],
            // Mystic (purple → pink → violet)
            ['#c084fc', '#f472b6', '#a855f7', '#e879f9'],
            // Ice (white → cyan → blue)
            ['#f0f9ff', '#67e8f9', '#7dd3fc', '#67e8f9']
        ];

        // Predefined patterns (relative positions, normalized to 0-1)
        this.patterns = {
            triangle: [
                { x: 0.5, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 }
            ],
            square: [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 1, y: 1 },
                { x: 0, y: 1 }
            ],
            line: [
                { x: 0, y: 0.5 },
                { x: 0.33, y: 0.5 },
                { x: 0.66, y: 0.5 },
                { x: 1, y: 0.5 }
            ],
            diamond: [
                { x: 0.5, y: 0 },
                { x: 1, y: 0.5 },
                { x: 0.5, y: 1 },
                { x: 0, y: 0.5 }
            ],
            star: [
                { x: 0.5, y: 0 },
                { x: 0.5, y: 0.5 }, // Center
                { x: 1, y: 0.5 },
                { x: 0, y: 0.5 },
                { x: 0.5, y: 1 }
            ],
            ring: [
                { x: 0.5, y: 0 },
                { x: 0.93, y: 0.25 },
                { x: 0.93, y: 0.75 },
                { x: 0.5, y: 1 },
                { x: 0.07, y: 0.75 },
                { x: 0.07, y: 0.25 }
            ],
            arrow: [
                { x: 0, y: 0.5 },
                { x: 0.5, y: 0 },
                { x: 0.5, y: 0.3 },
                { x: 1, y: 0.3 },
                { x: 1, y: 0.7 },
                { x: 0.5, y: 0.7 },
                { x: 0.5, y: 1 }
            ],
            binary: [ // Forms "10"
                { x: 0, y: 0.2 },
                { x: 0, y: 0.8 },
                { x: 0.4, y: 0 },
                { x: 0.7, y: 0 },
                { x: 0.85, y: 0.5 },
                { x: 0.7, y: 1 },
                { x: 0.4, y: 1 }
            ]
        };

        this.ecosystem = null;
        this.particleSystem = null;
        this.activeFormations = [];
        this.formationIdCounter = 0;
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
     * Main update
     */
    update(deltaTime) {
        if (!this.config.enabled || !this.ecosystem) return;

        // Update existing formations
        this.updateFormations(deltaTime);

        // Try to create new formation
        if (Math.random() < this.config.formationChance && this.activeFormations.length < 2) {
            this.tryCreateFormation();
        }
    }

    /**
     * Try to create a new constellation
     */
    tryCreateFormation() {
        const fireflies = this.ecosystem.fireflies.filter(f =>
            f.state === 'mature' && !f.inConstellation && !f.inSwarm
        );

        if (fireflies.length < this.config.minFireflies) return;

        // Pick random pattern
        const patternNames = Object.keys(this.patterns);
        const patternName = patternNames[Math.floor(Math.random() * patternNames.length)];
        const pattern = this.patterns[patternName];

        // Need enough fireflies for pattern
        if (fireflies.length < pattern.length) return;

        // Find cluster of nearby fireflies
        const seed = fireflies[Math.floor(Math.random() * fireflies.length)];
        const nearby = fireflies
            .filter(f => f !== seed && seed.distanceTo(f) < this.config.formationRadius * 2)
            .slice(0, pattern.length - 1);

        if (nearby.length < pattern.length - 1) return;

        // Create formation
        const members = [seed, ...nearby];
        this.createFormation(members, patternName, pattern);
    }

    /**
     * Create a constellation formation
     */
    createFormation(members, patternName, pattern) {
        const formationId = 'constellation_' + (++this.formationIdCounter);

        // Calculate formation center (center of members)
        let centerX = 0, centerY = 0;
        for (const m of members) {
            centerX += m.x;
            centerY += m.y;
        }
        centerX /= members.length;
        centerY /= members.length;

        // Calculate target positions
        const targets = pattern.map(p => ({
            x: centerX + (p.x - 0.5) * this.config.formationRadius,
            y: centerY + (p.y - 0.5) * this.config.formationRadius
        }));

        // Give formation a drift velocity (slow graceful movement)
        const driftAngle = Math.random() * Math.PI * 2;
        const driftSpeed = 0.3 + Math.random() * 0.4; // Slow drift

        // Select a color palette for this constellation
        const palette = this.colorPalettes[Math.floor(Math.random() * this.colorPalettes.length)];

        const formation = {
            id: formationId,
            name: patternName,
            members: members,
            targets: targets,
            centerX: centerX,
            centerY: centerY,
            // Drift movement - constellation floats across the screen
            driftVx: Math.cos(driftAngle) * driftSpeed,
            driftVy: Math.sin(driftAngle) * driftSpeed,
            age: 0,
            maxAge: this.config.formationDuration,
            phase: 'forming', // forming, holding, dispersing
            formingDuration: 1500,
            originalSpeeds: members.map(m => m.baseSpeed),
            // Twinkle and color data
            colorPalette: palette,
            colorPhase: Math.random() * Math.PI * 2, // Start at random point in gradient
            twinklePhase: 0,
            // Staggered twinkle offsets for each member (creates wave effect)
            memberTwinkleOffsets: members.map((_, i) => (i / members.length) * Math.PI * 2),
            // For inter-constellation communication
            lastTwinkleBurst: 0,
            respondingTo: null
        };

        // Mark members
        for (let i = 0; i < members.length; i++) {
            members[i].inConstellation = true;
            members[i].constellationId = formationId;
            members[i].constellationTarget = targets[i];
        }

        this.activeFormations.push(formation);

        return formation;
    }

    /**
     * Update all active formations
     */
    updateFormations(deltaTime) {
        const toRemove = [];

        for (const formation of this.activeFormations) {
            formation.age += deltaTime;

            // Remove dead/consumed members
            formation.members = formation.members.filter(m =>
                m.state === 'mature' && this.ecosystem.fireflies.includes(m)
            );

            // Formation breaks if too few members
            if (formation.members.length < 3) {
                toRemove.push(formation);
                continue;
            }

            // Phase management
            if (formation.phase === 'forming') {
                this.updateForming(formation, deltaTime);
            } else if (formation.phase === 'holding') {
                this.updateHolding(formation, deltaTime);
            } else if (formation.phase === 'dispersing') {
                this.updateDispersing(formation, deltaTime);
            }

            // Time's up
            if (formation.age > formation.maxAge) {
                toRemove.push(formation);
            }
        }

        // Clean up
        for (const formation of toRemove) {
            this.disperseFormation(formation);
        }
    }

    /**
     * Update forming phase - move to positions
     */
    updateForming(formation, deltaTime) {
        let allInPosition = true;

        for (let i = 0; i < formation.members.length; i++) {
            const member = formation.members[i];
            const target = member.constellationTarget;

            if (!target) continue;

            const dx = target.x - member.x;
            const dy = target.y - member.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 10) {
                allInPosition = false;
                // Move toward target
                member.applyForce(
                    (dx / dist) * 0.08,
                    (dy / dist) * 0.08
                );
                // Slow down normal movement
                member.vx *= 0.9;
                member.vy *= 0.9;
            }
        }

        // Transition to holding
        if (allInPosition || formation.age > formation.formingDuration) {
            formation.phase = 'holding';
            formation.holdStartAge = formation.age;

            // Boost glow
            for (const member of formation.members) {
                member.constellationGlow = this.config.glowBoost;
            }

            // Create connection particles
            this.createConnectionEffect(formation);
        }
    }

    /**
     * Update holding phase - maintain positions while drifting as a group
     * Now with twinkling and color shifting!
     */
    updateHolding(formation, deltaTime) {
        // Apply drift to the entire formation
        const screenWidth = window.innerWidth || 800;
        const screenHeight = window.innerHeight || 600;

        // Update formation center position
        formation.centerX += formation.driftVx;
        formation.centerY += formation.driftVy;

        // Bounce off screen edges (keep constellation visible)
        const margin = this.config.formationRadius + 50;
        if (formation.centerX < margin || formation.centerX > screenWidth - margin) {
            formation.driftVx *= -1;
            formation.centerX = Math.max(margin, Math.min(screenWidth - margin, formation.centerX));
        }
        if (formation.centerY < margin || formation.centerY > screenHeight - margin) {
            formation.driftVy *= -1;
            formation.centerY = Math.max(margin, Math.min(screenHeight - margin, formation.centerY));
        }

        // Update twinkle and color phases
        formation.twinklePhase += this.config.twinkleSpeed * deltaTime;
        formation.colorPhase += this.config.colorShiftSpeed * deltaTime;

        // Check for inter-constellation communication
        this.checkConstellationCommunication(formation);

        // Calculate current gradient color for this formation
        const currentColor = this.getGradientColor(formation.colorPalette, formation.colorPhase);

        // Update all target positions based on new center
        const pattern = this.patterns[formation.name];
        for (let i = 0; i < formation.members.length && i < pattern.length; i++) {
            const member = formation.members[i];
            const p = pattern[i];

            // Calculate new target based on drifted center
            const newTarget = {
                x: formation.centerX + (p.x - 0.5) * this.config.formationRadius,
                y: formation.centerY + (p.y - 0.5) * this.config.formationRadius
            };
            member.constellationTarget = newTarget;

            // Gently pull to new position (following the drift)
            const dx = newTarget.x - member.x;
            const dy = newTarget.y - member.y;
            member.applyForce(dx * 0.03, dy * 0.03);

            // Dampen independent movement
            member.vx *= 0.92;
            member.vy *= 0.92;

            // === TWINKLE EFFECT ===
            // Each member twinkles with a phase offset (creates ripple/wave effect)
            const memberOffset = formation.memberTwinkleOffsets[i] || 0;
            const twinkle = Math.sin(formation.twinklePhase + memberOffset);
            const twinkleIntensity = (twinkle + 1) / 2; // Normalize to 0-1

            // Apply twinkle to opacity
            const baseGlow = this.config.glowBoost;
            member.constellationGlow = baseGlow + (twinkleIntensity * this.config.twinkleIntensity);

            // === COLOR SHIFTING ===
            // Apply gradient color to this member
            member.constellationColor = currentColor;

            // If responding to another constellation, add extra sparkle
            if (formation.respondingTo) {
                member.constellationGlow += 0.3 * Math.sin(formation.twinklePhase * 3);
            }
        }

        // Start dispersing near end
        const holdDuration = formation.maxAge - formation.formingDuration - 500;
        if (formation.age - formation.holdStartAge > holdDuration) {
            formation.phase = 'dispersing';
        }
    }

    /**
     * Get color from gradient palette based on phase
     */
    getGradientColor(palette, phase) {
        const normalizedPhase = (Math.sin(phase) + 1) / 2; // 0-1
        const colorCount = palette.length;
        const exactIndex = normalizedPhase * (colorCount - 1);
        const index1 = Math.floor(exactIndex);
        const index2 = Math.min(index1 + 1, colorCount - 1);
        const blend = exactIndex - index1;

        return this.lerpColor(palette[index1], palette[index2], blend);
    }

    /**
     * Interpolate between two hex colors
     */
    lerpColor(color1, color2, t) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Check if constellations should "talk" to each other
     */
    checkConstellationCommunication(formation) {
        if (this.activeFormations.length < 2) {
            formation.respondingTo = null;
            return;
        }

        const now = Date.now();

        // Find other constellations in holding phase
        const others = this.activeFormations.filter(f =>
            f !== formation && f.phase === 'holding'
        );

        if (others.length === 0) {
            formation.respondingTo = null;
            return;
        }

        // Random chance to initiate "call" to another constellation
        if (!formation.respondingTo && now - formation.lastTwinkleBurst > 2000) {
            if (Math.random() < 0.01) {
                // Pick a constellation to "call" to
                const target = others[Math.floor(Math.random() * others.length)];
                formation.lastTwinkleBurst = now;

                // The target will "respond" shortly after
                setTimeout(() => {
                    if (target.phase === 'holding') {
                        target.respondingTo = formation.id;
                        target.lastTwinkleBurst = Date.now();

                        // Clear response after a moment
                        setTimeout(() => {
                            target.respondingTo = null;
                        }, 800);
                    }
                }, 300 + Math.random() * 200);

                // Create "call" particle effect
                this.createTwinkleCallEffect(formation, target);
            }
        }
    }

    /**
     * Create visual effect when constellations communicate
     */
    createTwinkleCallEffect(fromFormation, toFormation) {
        if (!this.particleSystem) return;

        // Sparkle burst from calling constellation
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;

            this.particleSystem.createParticle({
                x: fromFormation.centerX,
                y: fromFormation.centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: '✦',
                size: 8,
                life: 600,
                fadeRate: 0.02,
                type: 'constellation-call',
                color: fromFormation.colorPalette[0],
                friction: 0.97
            });
        }
    }

    /**
     * Update dispersing phase - release members
     */
    updateDispersing(formation, deltaTime) {
        for (const member of formation.members) {
            // Fade glow
            if (member.constellationGlow) {
                member.constellationGlow = Math.max(1, member.constellationGlow - 0.01);
            }
        }
    }

    /**
     * Disperse a formation
     */
    disperseFormation(formation) {
        for (const member of formation.members) {
            member.inConstellation = false;
            member.constellationId = null;
            member.constellationTarget = null;
            member.constellationGlow = null;
        }

        const index = this.activeFormations.indexOf(formation);
        if (index > -1) {
            this.activeFormations.splice(index, 1);
        }
    }

    /**
     * Create visual connection effect
     */
    createConnectionEffect(formation) {
        if (!this.particleSystem) return;

        // Draw lines between adjacent members
        for (let i = 0; i < formation.members.length; i++) {
            const a = formation.members[i];
            const b = formation.members[(i + 1) % formation.members.length];

            // Create particles along the line
            const steps = 3;
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const x = a.x + (b.x - a.x) * t;
                const y = a.y + (b.y - a.y) * t;

                this.particleSystem.createParticle({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    text: '·',
                    size: 6,
                    life: 2000,
                    fadeRate: 0.008,
                    type: 'constellation',
                    color: '#ffffff',
                    friction: 0.99,
                    gravity: 0
                });
            }
        }
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            activeFormations: this.activeFormations.length,
            totalInFormations: this.activeFormations.reduce((sum, f) => sum + f.members.length, 0)
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConstellationSystem;
}
