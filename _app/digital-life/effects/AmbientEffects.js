/**
 * AmbientEffects.js - Additional Visual Effects
 *
 * Spell Particles: { } < > ( ) floating like runes
 * Data Streams: Vertical Matrix-style columns
 * Circuit Pulse: Glowing lines like living circuits
 * Hex Wisps: Rare A-F hex digits
 * Packet Bubbles: Translucent spheres with data
 */

class AmbientEffects {
    constructor(config = {}) {
        this.config = {
            // Spell particles
            spellParticlesEnabled: config.spellParticlesEnabled ?? true,
            spellSpawnRate: config.spellSpawnRate ?? 0.002,
            maxSpellParticles: config.maxSpellParticles ?? 15,

            // Data streams
            dataStreamsEnabled: config.dataStreamsEnabled ?? true,
            dataStreamChance: config.dataStreamChance ?? 0.0005,
            maxDataStreams: config.maxDataStreams ?? 3,

            // Circuit pulses
            circuitPulseEnabled: config.circuitPulseEnabled ?? true,
            circuitPulseChance: config.circuitPulseChance ?? 0.0003,

            // Hex wisps (rare)
            hexWispsEnabled: config.hexWispsEnabled ?? true,
            hexWispChance: config.hexWispChance ?? 0.0001,
            maxHexWisps: config.maxHexWisps ?? 5,

            ...config
        };

        this.container = null;

        // Active elements
        this.spellParticles = [];
        this.dataStreams = [];
        this.circuitPulses = [];
        this.hexWisps = [];

        // Spell particle characters
        this.spellChars = ['{', '}', '<', '>', '(', ')', '[', ']', '/*', '*/', '//', '&&', '||'];

        // Hex characters
        this.hexChars = ['A', 'B', 'C', 'D', 'E', 'F'];
    }

    /**
     * Initialize with container
     */
    init(container) {
        this.container = container;
        this.injectStyles();
        return this;
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('ambient-effects-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ambient-effects-styles';
        styles.textContent = `
            .spell-particle {
                position: absolute;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: rgba(159, 122, 234, 0.4);
                text-shadow: 0 0 8px rgba(159, 122, 234, 0.3);
                pointer-events: none;
                user-select: none;
                z-index: 1;
            }

            .data-stream {
                position: absolute;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                color: rgba(34, 197, 94, 0.3);
                text-shadow: 0 0 5px rgba(34, 197, 94, 0.2);
                pointer-events: none;
                white-space: pre;
                line-height: 1.2;
                z-index: 0;
            }

            .circuit-pulse {
                position: absolute;
                pointer-events: none;
                z-index: 0;
            }

            .circuit-pulse-line {
                stroke: rgba(56, 189, 248, 0.2);
                stroke-width: 1;
                fill: none;
            }

            .circuit-pulse-glow {
                stroke: rgba(56, 189, 248, 0.6);
                stroke-width: 2;
                fill: none;
                filter: blur(2px);
            }

            .hex-wisp {
                position: absolute;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                font-size: 16px;
                color: #fbbf24;
                text-shadow:
                    0 0 10px rgba(251, 191, 36, 0.8),
                    0 0 20px rgba(251, 191, 36, 0.4);
                pointer-events: none;
                user-select: none;
                z-index: 3;
                animation: hexWispFloat 3s ease-in-out infinite;
            }

            @keyframes hexWispFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(5deg); }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Main update loop
     */
    update(deltaTime) {
        if (!this.container) return;

        // Update spell particles
        if (this.config.spellParticlesEnabled) {
            this.updateSpellParticles(deltaTime);
        }

        // Update data streams
        if (this.config.dataStreamsEnabled) {
            this.updateDataStreams(deltaTime);
        }

        // Update circuit pulses
        if (this.config.circuitPulseEnabled) {
            this.updateCircuitPulses(deltaTime);
        }

        // Update hex wisps
        if (this.config.hexWispsEnabled) {
            this.updateHexWisps(deltaTime);
        }
    }

    // ==================== SPELL PARTICLES ====================

    updateSpellParticles(deltaTime) {
        // Spawn new
        if (this.spellParticles.length < this.config.maxSpellParticles &&
            Math.random() < this.config.spellSpawnRate) {
            this.spawnSpellParticle();
        }

        // Update existing
        const toRemove = [];
        for (const particle of this.spellParticles) {
            particle.age += deltaTime;

            // Drift upward slowly
            particle.y -= particle.speed * (deltaTime / 16);
            particle.x += Math.sin(particle.age * 0.002 + particle.offset) * 0.3;

            // Fade
            particle.opacity = Math.max(0, 1 - (particle.age / particle.life));

            // Update DOM
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = particle.opacity * 0.4;

            if (particle.age > particle.life || particle.y < -50) {
                toRemove.push(particle);
            }
        }

        for (const p of toRemove) {
            this.removeSpellParticle(p);
        }
    }

    spawnSpellParticle() {
        const char = this.spellChars[Math.floor(Math.random() * this.spellChars.length)];
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;

        const particle = {
            x: Math.random() * screenWidth,
            y: screenHeight + 20,
            char: char,
            speed: 0.3 + Math.random() * 0.5,
            age: 0,
            life: 15000 + Math.random() * 10000,
            opacity: 1,
            offset: Math.random() * Math.PI * 2,
            element: null
        };

        particle.element = document.createElement('div');
        particle.element.className = 'spell-particle';
        particle.element.textContent = char;
        particle.element.style.fontSize = (12 + Math.random() * 8) + 'px';
        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';

        this.container.appendChild(particle.element);
        this.spellParticles.push(particle);
    }

    removeSpellParticle(particle) {
        const index = this.spellParticles.indexOf(particle);
        if (index > -1) this.spellParticles.splice(index, 1);
        if (particle.element?.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
        }
    }

    // ==================== DATA STREAMS ====================

    updateDataStreams(deltaTime) {
        // Spawn new
        if (this.dataStreams.length < this.config.maxDataStreams &&
            Math.random() < this.config.dataStreamChance) {
            this.spawnDataStream();
        }

        // Update existing
        const toRemove = [];
        for (const stream of this.dataStreams) {
            stream.age += deltaTime;

            // Update characters (scroll down)
            stream.scrollOffset += stream.speed * (deltaTime / 16);

            // Regenerate content periodically
            if (stream.scrollOffset > 20) {
                stream.scrollOffset = 0;
                stream.content = this.generateStreamContent(stream.length);
                stream.element.textContent = stream.content;
            }

            // Fade
            stream.opacity = stream.age < 1000 ?
                stream.age / 1000 :
                Math.max(0, 1 - ((stream.age - stream.life + 2000) / 2000));

            stream.element.style.opacity = stream.opacity * 0.3;

            if (stream.age > stream.life) {
                toRemove.push(stream);
            }
        }

        for (const s of toRemove) {
            this.removeDataStream(s);
        }
    }

    spawnDataStream() {
        const length = 15 + Math.floor(Math.random() * 20);
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;

        const stream = {
            x: Math.random() * screenWidth,
            y: 0,
            length: length,
            content: this.generateStreamContent(length),
            speed: 0.5 + Math.random() * 1,
            age: 0,
            life: 8000 + Math.random() * 7000,
            opacity: 0,
            scrollOffset: 0,
            element: null
        };

        stream.element = document.createElement('div');
        stream.element.className = 'data-stream';
        stream.element.textContent = stream.content;
        stream.element.style.left = stream.x + 'px';
        stream.element.style.top = stream.y + 'px';

        this.container.appendChild(stream.element);
        this.dataStreams.push(stream);
    }

    generateStreamContent(length) {
        let content = '';
        for (let i = 0; i < length; i++) {
            content += Math.random() > 0.5 ? '1' : '0';
            content += '\n';
        }
        return content;
    }

    removeDataStream(stream) {
        const index = this.dataStreams.indexOf(stream);
        if (index > -1) this.dataStreams.splice(index, 1);
        if (stream.element?.parentNode) {
            stream.element.parentNode.removeChild(stream.element);
        }
    }

    // ==================== CIRCUIT PULSES ====================

    updateCircuitPulses(deltaTime) {
        // Spawn new
        if (Math.random() < this.config.circuitPulseChance) {
            this.spawnCircuitPulse();
        }

        // Update existing
        const toRemove = [];
        for (const pulse of this.circuitPulses) {
            pulse.age += deltaTime;

            // Update glow position along path
            pulse.progress = Math.min(1, pulse.age / pulse.duration);

            // Update SVG
            this.updateCircuitPulseVisual(pulse);

            if (pulse.age > pulse.duration + 500) {
                toRemove.push(pulse);
            }
        }

        for (const p of toRemove) {
            this.removeCircuitPulse(p);
        }
    }

    spawnCircuitPulse() {
        // Generate random circuit path
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;
        const startX = Math.random() * screenWidth;
        const startY = Math.random() * screenHeight;

        const points = [{ x: startX, y: startY }];
        let currentX = startX;
        let currentY = startY;

        // Generate 3-5 segments
        const segments = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < segments; i++) {
            // Alternate horizontal/vertical
            if (i % 2 === 0) {
                currentX += (Math.random() - 0.5) * 200;
            } else {
                currentY += (Math.random() - 0.5) * 200;
            }
            points.push({ x: currentX, y: currentY });
        }

        const pulse = {
            points: points,
            age: 0,
            duration: 2000 + Math.random() * 1000,
            progress: 0,
            element: null
        };

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'circuit-pulse');
        svg.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        // Base line
        const pathD = this.pointsToPath(points);
        const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        baseLine.setAttribute('d', pathD);
        baseLine.setAttribute('class', 'circuit-pulse-line');
        svg.appendChild(baseLine);

        // Glow line (animated)
        const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowLine.setAttribute('d', pathD);
        glowLine.setAttribute('class', 'circuit-pulse-glow');
        glowLine.style.strokeDasharray = '20 1000';
        glowLine.style.strokeDashoffset = '0';
        svg.appendChild(glowLine);

        pulse.element = svg;
        pulse.glowLine = glowLine;
        pulse.totalLength = this.calculatePathLength(points);

        this.container.appendChild(svg);
        this.circuitPulses.push(pulse);
    }

    pointsToPath(points) {
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        return d;
    }

    calculatePathLength(points) {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x;
            const dy = points[i].y - points[i-1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    updateCircuitPulseVisual(pulse) {
        if (!pulse.glowLine) return;

        const offset = -pulse.progress * pulse.totalLength;
        pulse.glowLine.style.strokeDashoffset = offset + 'px';

        // Fade out at end
        if (pulse.progress > 0.8) {
            const fade = (1 - pulse.progress) / 0.2;
            pulse.element.style.opacity = fade;
        }
    }

    removeCircuitPulse(pulse) {
        const index = this.circuitPulses.indexOf(pulse);
        if (index > -1) this.circuitPulses.splice(index, 1);
        if (pulse.element?.parentNode) {
            pulse.element.parentNode.removeChild(pulse.element);
        }
    }

    // ==================== HEX WISPS ====================

    updateHexWisps(deltaTime) {
        // Spawn new (rare!)
        if (this.hexWisps.length < this.config.maxHexWisps &&
            Math.random() < this.config.hexWispChance) {
            this.spawnHexWisp();
        }

        // Update existing
        const toRemove = [];
        for (const wisp of this.hexWisps) {
            wisp.age += deltaTime;

            // Float and drift
            wisp.x += Math.sin(wisp.age * 0.001 + wisp.offset) * 0.5;
            wisp.y += Math.cos(wisp.age * 0.0008 + wisp.offset) * 0.3;
            wisp.y -= 0.2; // Slow upward drift

            // Fade
            wisp.opacity = wisp.age < 1000 ?
                wisp.age / 1000 :
                Math.max(0, 1 - ((wisp.age - wisp.life + 2000) / 2000));

            // Update DOM
            wisp.element.style.left = wisp.x + 'px';
            wisp.element.style.top = wisp.y + 'px';
            wisp.element.style.opacity = wisp.opacity;

            if (wisp.age > wisp.life || wisp.y < -50) {
                toRemove.push(wisp);
            }
        }

        for (const w of toRemove) {
            this.removeHexWisp(w);
        }
    }

    spawnHexWisp() {
        const char = this.hexChars[Math.floor(Math.random() * this.hexChars.length)];
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;

        const wisp = {
            x: Math.random() * screenWidth,
            y: Math.random() * screenHeight,
            char: char,
            age: 0,
            life: 10000 + Math.random() * 10000,
            opacity: 0,
            offset: Math.random() * Math.PI * 2,
            element: null
        };

        wisp.element = document.createElement('div');
        wisp.element.className = 'hex-wisp';
        wisp.element.textContent = char;
        wisp.element.style.left = wisp.x + 'px';
        wisp.element.style.top = wisp.y + 'px';

        this.container.appendChild(wisp.element);
        this.hexWisps.push(wisp);
    }

    removeHexWisp(wisp) {
        const index = this.hexWisps.indexOf(wisp);
        if (index > -1) this.hexWisps.splice(index, 1);
        if (wisp.element?.parentNode) {
            wisp.element.parentNode.removeChild(wisp.element);
        }
    }

    // ==================== CLEANUP ====================

    destroy() {
        for (const p of this.spellParticles) {
            if (p.element?.parentNode) p.element.parentNode.removeChild(p.element);
        }
        for (const s of this.dataStreams) {
            if (s.element?.parentNode) s.element.parentNode.removeChild(s.element);
        }
        for (const c of this.circuitPulses) {
            if (c.element?.parentNode) c.element.parentNode.removeChild(c.element);
        }
        for (const w of this.hexWisps) {
            if (w.element?.parentNode) w.element.parentNode.removeChild(w.element);
        }

        this.spellParticles = [];
        this.dataStreams = [];
        this.circuitPulses = [];
        this.hexWisps = [];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmbientEffects;
}
