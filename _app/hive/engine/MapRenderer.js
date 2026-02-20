/**
 * MapRenderer.js — The Hive SVG Map with Fog of War
 *
 * Renders the floor map as SVG. Handles visibility states (visited, adjacent,
 * hidden), player dot, corridor lines, pan/zoom, and click-to-move.
 *
 * Public API:
 *   MapRenderer.init(container, mapData)    — create SVG, draw all elements
 *   MapRenderer.update(state)               — update fog of war + player dot
 *   MapRenderer.highlightRoom(roomId)       — brief flash on a room
 *   MapRenderer.centerOnRoom(roomId)        — pan view to center on room
 */

const MapRenderer = (() => {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    const ROOM_W = 110;
    const ROOM_H = 50;
    const PLAYER_R = 8;
    const GLOW_R = 16;
    const ZOOM_MIN = 0.4;
    const ZOOM_MAX = 2.5;
    const ZOOM_STEP = 0.1;
    const PAN_SMOOTH = 0.15;

    const COLORS = {
        bg:           '#0a0a0a',
        roomStroke:   'rgba(255,255,255,0.55)',
        roomFill:     'rgba(255,255,255,0.04)',
        roomVisited:  'rgba(255,255,255,0.08)',
        roomText:     'rgba(255,255,255,0.8)',
        adjacent:     'rgba(255,255,255,0.35)',
        corridor:     'rgba(255,255,255,0.2)',
        corridorLit:  'rgba(255,255,255,0.45)',
        player:       '#cc0000',
        playerGlow:   'rgba(204,0,0,0.35)',
        locked:       '#ff4444',
        puzzle:       '#e67e22',
        puzzleSolved: '#4caf50',
        elevator:     '#00bcd4',
        supply:       '#f0ad4e',
        lore:         'rgba(255,255,255,0.5)'
    };

    const TYPE_ICONS = {
        puzzle:   '\u2623',  // biohazard
        supply:   '\u2620',  // skull (placeholder — box icon below)
        locked:   '\u26BF',  // radioactive (we'll use a lock char)
        elevator: '\u25BC',  // down arrow
        lore:     '\u2637'   // trigram (document-ish)
    };

    // Simpler icons that render well in SVG text
    const TYPE_LABELS = {
        puzzle:   '\u{1F5A5}',
        supply:   '+',
        locked:   '\u{1F512}',
        elevator: '\u25BC',
        lore:     '\u{1F4C4}'
    };

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    let _svg = null;
    let _contentG = null;
    let _corridorG = null;
    let _trailG = null;
    let _roomG = null;
    let _playerG = null;
    let _mapData = null;
    let _container = null;

    // Pan / zoom
    let _scale = 1;
    let _tx = 0;
    let _ty = 0;
    let _dragging = false;
    let _dragStart = { x: 0, y: 0 };
    let _dragTxStart = 0;
    let _dragTyStart = 0;

    // Room element cache
    let _roomEls = {};    // roomId → { group, rect, text, icon, corridors[] }
    let _corridorEls = []; // { line, roomA, roomB }
    let _playerDot = null;
    let _playerGlowEl = null;
    let _toastEl = null;
    let _toastTimer = null;
    let _lastCurrentRoom = null;

    // Animation
    let _pulseAnim = null;

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    function init(container, mapData) {
        _container = container;
        _mapData = mapData;
        _roomEls = {};
        _corridorEls = [];

        container.innerHTML = '';

        // Parse viewBox
        const vb = mapData.viewBox || '0 0 1250 700';

        // Create SVG
        _svg = _createSVG('svg', {
            viewBox: vb,
            preserveAspectRatio: 'xMidYMid meet',
            style: `width:100%;height:100%;background:${COLORS.bg};display:block;`
        });

        // Defs — player glow filter + adjacent pulse animation
        const defs = _createSVG('defs');
        defs.innerHTML = `
            <filter id="hive-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
        // Inject CSS animation for adjacent rooms
        if (!document.getElementById('hive-map-styles')) {
            const style = document.createElement('style');
            style.id = 'hive-map-styles';
            style.textContent = `
                @keyframes hive-adjacent-pulse {
                    0%, 100% { opacity: 0.5; }
                    50%      { opacity: 1; }
                }
                .hive-room.adjacent rect {
                    animation: hive-adjacent-pulse 2.5s ease-in-out infinite;
                }
                .hive-room:hover rect {
                    filter: brightness(1.6);
                    transition: filter 0.15s ease;
                }
                .hive-room rect {
                    transition: filter 0.15s ease;
                }
            `;
            document.head.appendChild(style);
        }
        _svg.appendChild(defs);

        // Content group (pan/zoom target)
        _contentG = _createSVG('g', { class: 'hive-map-content' });
        _updateTransform();

        // Layer groups
        _corridorG = _createSVG('g', { class: 'hive-corridors' });
        _trailG = _createSVG('g', { class: 'hive-trail' });
        _roomG = _createSVG('g', { class: 'hive-rooms' });
        _playerG = _createSVG('g', { class: 'hive-player' });

        _contentG.appendChild(_corridorG);
        _contentG.appendChild(_trailG);
        _contentG.appendChild(_roomG);
        _contentG.appendChild(_playerG);
        _svg.appendChild(_contentG);

        // Build room elements (all hidden initially)
        _buildRooms(mapData.rooms);
        _buildCorridors(mapData.rooms);
        _buildPlayer();

        // Attach to container
        container.appendChild(_svg);

        // Reset view button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '\u2316';  // position indicator
        resetBtn.title = 'Re-center on current room';
        resetBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 32px;
            height: 32px;
            background: rgba(0,0,0,0.6);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 4px;
            color: rgba(255,255,255,0.5);
            font-size: 16px;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
            padding: 0;
            font-family: monospace;
        `;
        resetBtn.onmouseover = () => { resetBtn.style.borderColor = '#cc0000'; resetBtn.style.color = '#cc0000'; };
        resetBtn.onmouseout = () => { resetBtn.style.borderColor = 'rgba(255,255,255,0.15)'; resetBtn.style.color = 'rgba(255,255,255,0.5)'; };
        resetBtn.onclick = () => {
            if (window.HiveEngine && _lastCurrentRoom) {
                centerOnRoom(_lastCurrentRoom);
            }
        };
        container.appendChild(resetBtn);

        // Discovery toast overlay
        _toastEl = document.createElement('div');
        _toastEl.style.cssText = `
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            padding: 6px 16px;
            background: rgba(0,0,0,0.8);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.7rem;
            letter-spacing: 0.08em;
            color: rgba(255,255,255,0.6);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10;
            white-space: nowrap;
        `;
        container.style.position = 'relative';
        container.appendChild(_toastEl);

        // Input handlers
        _attachInputHandlers();

        // Fit initial view
        _fitView();
    }

    // -------------------------------------------------------------------------
    // Build SVG elements
    // -------------------------------------------------------------------------

    function _buildRooms(rooms) {
        for (const [id, room] of Object.entries(rooms)) {
            const cx = room.x;
            const cy = room.y;

            const group = _createSVG('g', {
                class: 'hive-room',
                'data-room': id,
                style: 'display:none;cursor:pointer;'
            });

            // Room rectangle
            const rect = _createSVG('rect', {
                x: cx - ROOM_W / 2,
                y: cy - ROOM_H / 2,
                width: ROOM_W,
                height: ROOM_H,
                rx: 4,
                ry: 4,
                fill: COLORS.roomFill,
                stroke: COLORS.roomStroke,
                'stroke-width': 1.5
            });
            group.appendChild(rect);

            // Room name text
            const text = _createSVG('text', {
                x: cx,
                y: cy + 2,
                'text-anchor': 'middle',
                'dominant-baseline': 'middle',
                fill: COLORS.roomText,
                'font-family': "'Courier New', monospace",
                'font-size': '9',
                'letter-spacing': '0.5',
                style: 'display:none;pointer-events:none;'
            });
            text.textContent = _truncateName(room.name, 14);
            group.appendChild(text);

            // Type icon (top-right corner)
            const icon = _createSVG('text', {
                x: cx + ROOM_W / 2 - 8,
                y: cy - ROOM_H / 2 + 12,
                'text-anchor': 'middle',
                'dominant-baseline': 'middle',
                fill: _typeColor(room.type),
                'font-size': '10',
                style: 'display:none;pointer-events:none;'
            });
            icon.textContent = _typeIcon(room.type);
            group.appendChild(icon);

            // Tooltip on hover
            const tooltip = _createSVG('title');
            tooltip.textContent = room.name;
            group.appendChild(tooltip);

            // Click handler
            group.addEventListener('click', () => {
                if (window.HiveEngine && window.HiveEngine.moveTo) {
                    window.HiveEngine.moveTo(id);
                }
            });

            _roomG.appendChild(group);
            _roomEls[id] = { group, rect, text, icon, cx, cy };
        }
    }

    function _buildCorridors(rooms) {
        const drawn = new Set();
        for (const [id, room] of Object.entries(rooms)) {
            for (const [dir, targetId] of Object.entries(room.exits)) {
                if (!targetId) continue;
                const key = [id, targetId].sort().join('|');
                if (drawn.has(key)) continue;
                drawn.add(key);

                const target = rooms[targetId];
                if (!target) continue;

                const line = _createSVG('line', {
                    x1: room.x,
                    y1: room.y,
                    x2: target.x,
                    y2: target.y,
                    stroke: COLORS.corridor,
                    'stroke-width': 1.5,
                    'stroke-dasharray': '4,4',
                    style: 'display:none;'
                });

                _corridorG.appendChild(line);
                _corridorEls.push({ line, roomA: id, roomB: targetId });
            }
        }
    }

    function _buildPlayer() {
        // Glow circle
        _playerGlowEl = _createSVG('circle', {
            r: GLOW_R,
            fill: COLORS.playerGlow,
            filter: 'url(#hive-glow)',
            style: 'display:none;'
        });
        _playerG.appendChild(_playerGlowEl);

        // Solid dot
        _playerDot = _createSVG('circle', {
            r: PLAYER_R,
            fill: COLORS.player,
            filter: 'url(#hive-glow)',
            style: 'display:none;'
        });
        _playerG.appendChild(_playerDot);

        // Start pulse animation
        _startPulse();
    }

    function _startPulse() {
        let growing = true;
        let currentR = GLOW_R;
        const minR = GLOW_R - 3;
        const maxR = GLOW_R + 5;
        const step = 0.15;

        if (_pulseAnim) cancelAnimationFrame(_pulseAnim);

        function pulse() {
            if (growing) {
                currentR += step;
                if (currentR >= maxR) growing = false;
            } else {
                currentR -= step;
                if (currentR <= minR) growing = true;
            }
            if (_playerGlowEl) {
                _playerGlowEl.setAttribute('r', currentR);
            }
            _pulseAnim = requestAnimationFrame(pulse);
        }
        _pulseAnim = requestAnimationFrame(pulse);
    }

    // -------------------------------------------------------------------------
    // Update (fog of war + player)
    // -------------------------------------------------------------------------

    function update(state) {
        if (!_mapData || !state) return;

        const visited = new Set(state.visited || []);
        const currentRoom = state.currentRoom;
        _lastCurrentRoom = currentRoom;
        const rooms = _mapData.rooms;
        const puzzlesSolved = new Set(state.puzzlesSolved || []);

        // Determine adjacent rooms (exits from current room that aren't visited)
        const adjacent = new Set();
        if (rooms[currentRoom]) {
            for (const targetId of Object.values(rooms[currentRoom].exits)) {
                if (targetId && !visited.has(targetId)) {
                    adjacent.add(targetId);
                }
            }
        }

        // Update each room
        for (const [id, el] of Object.entries(_roomEls)) {
            const room = rooms[id];
            if (!room) continue;

            if (visited.has(id)) {
                // Fully visible
                el.group.style.display = '';
                el.group.classList.remove('adjacent');
                el.rect.setAttribute('fill', COLORS.roomVisited);
                el.rect.setAttribute('stroke-dasharray', 'none');
                el.text.style.display = '';
                el.icon.style.display = '';

                // Current room gets player color + thick border
                if (id === currentRoom) {
                    el.rect.setAttribute('stroke', COLORS.player);
                    el.rect.setAttribute('stroke-width', '2.5');
                } else {
                    // Visited rooms get subtle type-colored border
                    const typeCol = _typeColor(room.type);
                    el.rect.setAttribute('stroke', typeCol !== 'transparent' ? typeCol : COLORS.roomStroke);
                    el.rect.setAttribute('stroke-width', '1.5');
                }

                // Update icon for solved puzzles
                if (room.type === 'puzzle' && puzzlesSolved.has(id)) {
                    el.icon.textContent = '\u2713'; // checkmark
                    el.icon.setAttribute('fill', COLORS.puzzleSolved);
                }

                // Update locked rooms that are now unlocked
                if (room.type === 'locked') {
                    const unlocked = _checkLockCondition(room.lockCondition, state);
                    if (unlocked) {
                        el.icon.textContent = '\u2713';
                        el.icon.setAttribute('fill', COLORS.puzzleSolved);
                    }
                }

                el.group.style.cursor = 'pointer';

            } else if (adjacent.has(id)) {
                // Adjacent but not visited — outline only, with pulse
                el.group.style.display = '';
                el.group.classList.add('adjacent');
                el.rect.setAttribute('fill', 'rgba(255,255,255,0.02)');
                el.rect.setAttribute('stroke', COLORS.adjacent);
                el.rect.setAttribute('stroke-width', '1.5');
                el.rect.setAttribute('stroke-dasharray', '4,3');
                el.text.style.display = 'none';
                el.icon.style.display = 'none';
                el.group.style.cursor = 'pointer';

            } else {
                // Hidden
                el.group.style.display = 'none';
                el.group.classList.remove('adjacent');
            }
        }

        // Update corridors
        for (const c of _corridorEls) {
            const aVis = visited.has(c.roomA) || adjacent.has(c.roomA);
            const bVis = visited.has(c.roomB) || adjacent.has(c.roomB);
            if (aVis && bVis) {
                c.line.style.display = '';
                const bothVisited = visited.has(c.roomA) && visited.has(c.roomB);
                c.line.setAttribute('stroke', bothVisited ? COLORS.corridorLit : COLORS.corridor);
                c.line.setAttribute('stroke-dasharray', bothVisited ? 'none' : '4,4');
            } else {
                c.line.style.display = 'none';
            }
        }

        // Draw movement trail
        _trailG.innerHTML = '';
        const history = state.moveHistory || [];
        if (history.length >= 2) {
            // Build points from last N moves (cap at 30 to avoid clutter)
            const trail = history.slice(-30);
            const points = [];
            for (const rid of trail) {
                const re = _roomEls[rid];
                if (re) points.push(re.cx + ',' + re.cy);
            }
            if (points.length >= 2) {
                const polyline = _createSVG('polyline', {
                    points: points.join(' '),
                    fill: 'none',
                    stroke: 'rgba(204,0,0,0.2)',
                    'stroke-width': '2',
                    'stroke-dasharray': '3,5',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                });
                _trailG.appendChild(polyline);
            }
        }

        // Move player dot (smooth transition)
        const roomEl = _roomEls[currentRoom];
        if (roomEl) {
            _playerDot.style.display = '';
            _playerGlowEl.style.display = '';

            // Use CSS-like transition via SMIL-free approach: just set with transition style
            const oldCx = parseFloat(_playerDot.getAttribute('cx')) || roomEl.cx;
            const oldCy = parseFloat(_playerDot.getAttribute('cy')) || roomEl.cy;

            if (oldCx !== roomEl.cx || oldCy !== roomEl.cy) {
                // Animate over 300ms
                const start = performance.now();
                const dur = 300;
                function animatePlayer(now) {
                    const t = Math.min((now - start) / dur, 1);
                    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
                    const cx = oldCx + (roomEl.cx - oldCx) * ease;
                    const cy = oldCy + (roomEl.cy - oldCy) * ease;
                    _playerDot.setAttribute('cx', cx);
                    _playerDot.setAttribute('cy', cy);
                    _playerGlowEl.setAttribute('cx', cx);
                    _playerGlowEl.setAttribute('cy', cy);
                    if (t < 1) requestAnimationFrame(animatePlayer);
                }
                requestAnimationFrame(animatePlayer);
            } else {
                _playerDot.setAttribute('cx', roomEl.cx);
                _playerDot.setAttribute('cy', roomEl.cy);
                _playerGlowEl.setAttribute('cx', roomEl.cx);
                _playerGlowEl.setAttribute('cy', roomEl.cy);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Highlight + center
    // -------------------------------------------------------------------------

    function highlightRoom(roomId) {
        const el = _roomEls[roomId];
        if (!el) return;

        const origStroke = el.rect.getAttribute('stroke');
        const origWidth = el.rect.getAttribute('stroke-width');

        el.rect.setAttribute('stroke', '#ffffff');
        el.rect.setAttribute('stroke-width', '3');

        setTimeout(() => {
            el.rect.setAttribute('stroke', origStroke);
            el.rect.setAttribute('stroke-width', origWidth);
        }, 600);
    }

    function centerOnRoom(roomId) {
        const el = _roomEls[roomId];
        if (!el || !_svg) return;

        const svgRect = _svg.getBoundingClientRect();
        const svgW = svgRect.width;
        const svgH = svgRect.height;

        // Target: center the room in the viewport
        // The SVG viewBox is mapped to the element dimensions
        const vbParts = (_mapData.viewBox || '0 0 1250 700').split(' ').map(Number);
        const vbW = vbParts[2];
        const vbH = vbParts[3];

        // Scale from viewBox coords to screen coords
        const ratio = Math.min(svgW / vbW, svgH / vbH);

        // Desired screen center for the room
        const targetScreenX = svgW / 2;
        const targetScreenY = svgH / 2;

        // Current room position in screen space = (roomX * _scale * ratio + _tx * ratio)
        // We want: roomX * _scale + _tx = viewBox_center_x
        // Simpler: adjust _tx and _ty so the room is centered
        _tx = (vbW / 2) / _scale - el.cx;
        _ty = (vbH / 2) / _scale - el.cy;

        _updateTransform();
    }

    // -------------------------------------------------------------------------
    // Pan / Zoom input handlers
    // -------------------------------------------------------------------------

    function _attachInputHandlers() {
        // Wheel zoom
        _svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, _scale + delta));

            if (newScale !== _scale) {
                // Zoom toward cursor position
                const rect = _svg.getBoundingClientRect();
                const vbParts = (_mapData.viewBox || '0 0 1250 700').split(' ').map(Number);
                const ratioX = vbParts[2] / rect.width;
                const ratioY = vbParts[3] / rect.height;
                const mouseX = (e.clientX - rect.left) * ratioX;
                const mouseY = (e.clientY - rect.top) * ratioY;

                // Adjust translate so zoom centers on cursor
                const svgX = (mouseX - _tx * _scale) / _scale;
                const svgY = (mouseY - _ty * _scale) / _scale;

                _scale = newScale;
                _tx = (mouseX / _scale - svgX);
                _ty = (mouseY / _scale - svgY);

                _updateTransform();
            }
        }, { passive: false });

        // Pointer drag to pan
        _svg.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.hive-room')) return; // Don't pan when clicking rooms
            _dragging = true;
            _dragStart = { x: e.clientX, y: e.clientY };
            _dragTxStart = _tx;
            _dragTyStart = _ty;
            _svg.setPointerCapture(e.pointerId);
            _svg.style.cursor = 'grabbing';
        });

        _svg.addEventListener('pointermove', (e) => {
            if (!_dragging) return;
            const rect = _svg.getBoundingClientRect();
            const vbParts = (_mapData.viewBox || '0 0 1250 700').split(' ').map(Number);
            const ratioX = vbParts[2] / rect.width;
            const ratioY = vbParts[3] / rect.height;

            const dx = (e.clientX - _dragStart.x) * ratioX / _scale;
            const dy = (e.clientY - _dragStart.y) * ratioY / _scale;

            _tx = _dragTxStart + dx;
            _ty = _dragTyStart + dy;
            _updateTransform();
        });

        _svg.addEventListener('pointerup', () => {
            _dragging = false;
            _svg.style.cursor = '';
        });

        // Touch pinch zoom
        let _lastPinchDist = 0;
        _svg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                _lastPinchDist = _pinchDist(e.touches);
            }
        }, { passive: true });

        _svg.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const dist = _pinchDist(e.touches);
                if (_lastPinchDist > 0) {
                    const factor = dist / _lastPinchDist;
                    const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, _scale * factor));
                    _scale = newScale;
                    _updateTransform();
                }
                _lastPinchDist = dist;
            }
        }, { passive: true });

        _svg.addEventListener('touchend', () => {
            _lastPinchDist = 0;
        }, { passive: true });
    }

    function _pinchDist(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function _updateTransform() {
        if (_contentG) {
            _contentG.setAttribute('transform',
                `translate(${_tx * _scale}, ${_ty * _scale}) scale(${_scale})`
            );
        }
    }

    function _fitView() {
        // Reset to default centered view
        _scale = 1;
        _tx = 0;
        _ty = 0;
        _updateTransform();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    function _createSVG(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) {
            for (const [k, v] of Object.entries(attrs)) {
                if (k === 'style') {
                    el.setAttribute('style', v);
                } else {
                    el.setAttribute(k, v);
                }
            }
        }
        return el;
    }

    function _typeColor(type) {
        switch (type) {
            case 'puzzle':   return COLORS.puzzle;
            case 'supply':   return COLORS.supply;
            case 'locked':   return COLORS.locked;
            case 'elevator': return COLORS.elevator;
            case 'lore':     return COLORS.lore;
            default:         return 'transparent';
        }
    }

    function _typeIcon(type) {
        switch (type) {
            case 'puzzle':   return '\u25A3';  // filled square with dot
            case 'supply':   return '+';
            case 'locked':   return '\u2612';  // ballot box with x
            case 'elevator': return '\u25BC';  // down triangle
            case 'lore':     return '\u2261';  // triple bar
            default:         return '';
        }
    }

    function _truncateName(name, maxLen) {
        if (name.length <= maxLen) return name;
        return name.slice(0, maxLen - 1) + '\u2026';
    }

    function showToast(text, duration) {
        if (!_toastEl) return;
        if (_toastTimer) clearTimeout(_toastTimer);
        _toastEl.textContent = text;
        _toastEl.style.opacity = '1';
        _toastTimer = setTimeout(() => {
            _toastEl.style.opacity = '0';
            _toastTimer = null;
        }, duration || 2000);
    }

    function _checkLockCondition(condition, state) {
        if (!condition) return true;
        if (condition.type === 'puzzle-solved') {
            return (state.puzzlesSolved || []).includes(condition.room);
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    return {
        init,
        update,
        highlightRoom,
        centerOnRoom,
        showToast
    };

})();
