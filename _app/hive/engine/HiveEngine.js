/**
 * HiveEngine.js — The Hive Core Game Engine
 *
 * Orchestrates map rendering, room navigation, puzzle integration, save/load,
 * and floor progression.
 *
 * Public API:
 *   HiveEngine.init()                    — async, loads map, checks save, starts game
 *   HiveEngine.moveTo(roomId)            — validate + enter room
 *   HiveEngine.startPuzzle(roomId)       — load puzzle JSON, run via PuzzleRenderer
 *   HiveEngine.puzzleSolved(roomId)      — mark solved, unlock dependents
 *   HiveEngine.completeFloor()           — mark floor done, show completion
 *   HiveEngine._onHintUsed(cost)         — PuzzleRenderer callback
 */

var HiveEngine = (() => {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    const SAVE_KEY = 'hexworth_hive_save';
    const FLOOR_ID = 'b1';
    const MAP_PATH = 'maps/b1.json';
    const PUZZLE_DIR = 'puzzles/';
    const VARIANT_CHANCE = 0.30;
    const AMBIENT_INTERVAL = 8;   // Red Queen speaks every ~N moves

    const AMBIENT_LINES = [
        'You wander these halls as if you belong here. You do not.',
        'Every step you take is recorded. Every hesitation, noted.',
        'The facility remembers those who came before you. Most did not leave.',
        'I wonder... do you understand what you are looking for?',
        'Your movements are... predictable. Disappointing.',
        'The lower levels grow restless. They can sense you.',
        'Do not mistake my silence for absence. I am always here.',
        'How many rooms must you visit before you realize you are the experiment?',
        'Your heart rate has increased. Good.',
        'The previous test subjects lasted longer. I expected more from Hexworth.',
        'These corridors were not designed for comfort. They were designed for containment.',
        'You are making progress. Whether that is a good thing remains to be seen.'
    ];

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    let _mapData = null;
    let _state = null;
    let _mapContainer = null;
    let _roomContainer = null;
    let _puzzleCache = {};       // puzzleId → JSON data
    let _activePuzzle = false;   // true when puzzle UI is displayed
    let _initialized = false;

    // -------------------------------------------------------------------------
    // Default state factory
    // -------------------------------------------------------------------------

    function _newState() {
        return {
            version: 1,
            floor: FLOOR_ID,
            currentRoom: 'entry',
            visited: [],
            puzzlesSolved: [],
            puzzleProgress: {},
            moveCount: 0,
            moveHistory: ['entry'],
            startedAt: new Date().toISOString(),
            lastSavedAt: new Date().toISOString(),
            floorComplete: false,
            depthTier: 'pristine'
        };
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    async function init() {
        if (_initialized) return;

        // Find containers (set by index.html)
        _mapContainer = document.getElementById('hive-map');
        _roomContainer = document.getElementById('hive-room');

        if (!_mapContainer || !_roomContainer) {
            console.error('HiveEngine: missing #hive-map or #hive-room containers');
            return;
        }

        // Load map data
        try {
            const resp = await fetch(MAP_PATH, { cache: 'no-cache' });
            if (!resp.ok) throw new Error('Map load failed: ' + resp.status);
            _mapData = await resp.json();
        } catch (err) {
            console.error('HiveEngine: failed to load map', err);
            _roomContainer.innerHTML = '<div style="padding:40px;color:#cc0000;font-family:monospace;">ERROR: Failed to load floor data.</div>';
            return;
        }

        // Initialize RedQueen
        if (typeof RedQueen !== 'undefined') {
            RedQueen.init(_mapData.depthTier || 'pristine');
        }

        // Keyboard controls
        _initKeyboard();

        // Check for existing save
        const saved = _loadSave();
        if (saved && saved.floor === FLOOR_ID && !saved.floorComplete) {
            _showResumePrompt(saved);
        } else {
            _startFresh();
        }
    }

    // -------------------------------------------------------------------------
    // Resume prompt
    // -------------------------------------------------------------------------

    function _showResumePrompt(savedState) {
        const panel = _roomContainer;
        panel.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px;
            background: #141414;
            font-family: 'Courier New', monospace;
            color: rgba(255,255,255,0.85);
            text-align: center;
        `;

        const title = document.createElement('div');
        title.style.cssText = 'font-size: 0.7rem; letter-spacing: 0.15em; color: #cc0000; text-transform: uppercase; margin-bottom: 20px;';
        title.textContent = '[ SAVE DATA DETECTED ]';
        wrapper.appendChild(title);

        const info = document.createElement('div');
        info.style.cssText = 'font-size: 0.85rem; line-height: 1.6; margin-bottom: 8px; color: rgba(255,255,255,0.6);';
        info.textContent = `Floor: B-1 \u2022 Room: ${_getRoomName(savedState.currentRoom, savedState)} \u2022 Rooms explored: ${savedState.visited.length}`;
        wrapper.appendChild(info);

        const timeInfo = document.createElement('div');
        timeInfo.style.cssText = 'font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-bottom: 30px;';
        const saveDate = new Date(savedState.lastSavedAt);
        timeInfo.textContent = `Last saved: ${saveDate.toLocaleDateString()} ${saveDate.toLocaleTimeString()}`;
        wrapper.appendChild(timeInfo);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;';

        const resumeBtn = document.createElement('button');
        resumeBtn.style.cssText = `
            padding: 14px 32px;
            background: transparent;
            color: #cc0000;
            border: 2px solid #cc0000;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            font-weight: bold;
            letter-spacing: 0.08em;
            cursor: pointer;
            transition: all 0.2s;
        `;
        resumeBtn.textContent = '[ RESUME ]';
        resumeBtn.onmouseover = () => { resumeBtn.style.background = 'rgba(204,0,0,0.15)'; };
        resumeBtn.onmouseout = () => { resumeBtn.style.background = 'transparent'; };
        resumeBtn.onclick = () => {
            _state = savedState;
            RoomRenderer.init(_roomContainer);
            _initializeMap();
            _enterRoom(_state.currentRoom, false);
            MapRenderer.centerOnRoom(_state.currentRoom);
            _initialized = true;
        };

        const freshBtn = document.createElement('button');
        freshBtn.style.cssText = `
            padding: 14px 32px;
            background: transparent;
            color: rgba(255,255,255,0.5);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            letter-spacing: 0.08em;
            cursor: pointer;
            transition: all 0.2s;
        `;
        freshBtn.textContent = '[ START FRESH ]';
        freshBtn.onmouseover = () => { freshBtn.style.borderColor = 'rgba(255,255,255,0.5)'; };
        freshBtn.onmouseout = () => { freshBtn.style.borderColor = 'rgba(255,255,255,0.2)'; };
        freshBtn.onclick = () => {
            _startFresh();
        };

        btnRow.appendChild(resumeBtn);
        btnRow.appendChild(freshBtn);
        wrapper.appendChild(btnRow);

        panel.appendChild(wrapper);

        // Still init the map in background so it's ready
        _initializeMap();
    }

    function _getRoomName(roomId, state) {
        if (_mapData && _mapData.rooms && _mapData.rooms[roomId]) {
            return _mapData.rooms[roomId].name;
        }
        return roomId;
    }

    // -------------------------------------------------------------------------
    // Start fresh
    // -------------------------------------------------------------------------

    function _startFresh() {
        _state = _newState();
        RoomRenderer.init(_roomContainer);
        _initializeMap();
        _enterRoom('entry', true);
        MapRenderer.centerOnRoom('entry');
        _save();
        _initialized = true;
        _showControlsHint();
    }

    function _showControlsHint() {
        const HINT_KEY = 'hexworth_hive_controls_seen';
        if (localStorage.getItem(HINT_KEY)) return;
        localStorage.setItem(HINT_KEY, '1');

        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: rgba(0,0,0,0.85);
            border: 1px solid rgba(204,0,0,0.4);
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
            color: rgba(255,255,255,0.7);
            letter-spacing: 0.05em;
            line-height: 1.6;
            text-align: center;
            z-index: 500;
            opacity: 1;
            transition: opacity 0.8s ease;
            pointer-events: none;
            white-space: nowrap;
        `;
        hint.innerHTML = 'WASD / Arrows to move &nbsp;&bull;&nbsp; ESC to exit puzzles &nbsp;&bull;&nbsp; Click text to skip';
        document.body.appendChild(hint);

        setTimeout(() => { hint.style.opacity = '0'; }, 5000);
        setTimeout(() => { hint.remove(); }, 6000);
    }

    // -------------------------------------------------------------------------
    // Keyboard navigation
    // -------------------------------------------------------------------------

    function _initKeyboard() {
        const KEY_MAP = {
            'ArrowUp': 'north', 'ArrowDown': 'south', 'ArrowLeft': 'west', 'ArrowRight': 'east',
            'w': 'north', 's': 'south', 'a': 'west', 'd': 'east',
            'W': 'north', 'S': 'south', 'A': 'west', 'D': 'east'
        };

        document.addEventListener('keydown', (e) => {
            // Don't capture if typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // ESC to leave puzzle terminal
            if (e.key === 'Escape' && _activePuzzle) {
                e.preventDefault();
                const abandonBtn = document.querySelector('.hive-puzzle-wrapper')
                    ?.parentElement?.querySelector('button');
                if (abandonBtn && abandonBtn.textContent.includes('LEAVE')) {
                    abandonBtn.click();
                }
                return;
            }

            if (_activePuzzle) return;

            // Backspace to go back
            if (e.key === 'Backspace') {
                e.preventDefault();
                goBack();
                return;
            }

            const dir = KEY_MAP[e.key];
            if (!dir || !_state || !_mapData) return;

            const room = _mapData.rooms[_state.currentRoom];
            if (!room) return;

            const targetId = room.exits[dir];
            if (targetId) {
                e.preventDefault();
                moveTo(targetId);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Map initialization
    // -------------------------------------------------------------------------

    function _initializeMap() {
        if (!_mapData) return;
        // Expose map data for RoomRenderer room name lookups
        window.HiveMapData = _mapData;
        MapRenderer.init(_mapContainer, _mapData);
        MapRenderer.update(_state);
    }

    // -------------------------------------------------------------------------
    // Room movement
    // -------------------------------------------------------------------------

    function moveTo(roomId) {
        if (_activePuzzle) return; // can't move during puzzle
        if (!_mapData || !_mapData.rooms[roomId]) return;
        if (!_state) return;

        const currentRoom = _mapData.rooms[_state.currentRoom];
        if (!currentRoom) return;

        // Validate adjacency: roomId must be an exit from current room
        const exits = currentRoom.exits || {};
        const isAdjacent = Object.values(exits).includes(roomId);
        if (!isAdjacent) {
            RoomRenderer.showMessage('You can\'t reach that room from here.', 2000);
            return;
        }

        // Check if target room is locked (allow entry — room shows locked/unlocked text)
        // Locked rooms don't block entry; they show their locked description.
        // The lock prevents further travel THROUGH them (handled by their exits).

        // Move
        const isFirstVisit = !_state.visited.includes(roomId);
        _state.currentRoom = roomId;
        _state.moveCount++;
        if (!_state.moveHistory) _state.moveHistory = [];
        _state.moveHistory.push(roomId);

        if (isFirstVisit) {
            _state.visited.push(roomId);
        }

        // Update map
        MapRenderer.update(_state);
        MapRenderer.centerOnRoom(roomId);
        MapRenderer.highlightRoom(roomId);

        // Discovery toast on new rooms
        if (isFirstVisit) {
            const total = Object.keys(_mapData.rooms).length;
            MapRenderer.showToast(_state.visited.length + ' / ' + total + ' ROOMS DISCOVERED', 2500);
        }

        // Enter room
        _enterRoom(roomId, isFirstVisit);

        // Ambient Red Queen commentary (every ~8 moves, skip if room has its own RQ dialogue)
        const roomData = _mapData.rooms[roomId];
        if (!isFirstVisit || !roomData.redQueen) {
            if (_state.moveCount > 0 && _state.moveCount % AMBIENT_INTERVAL === 0 && typeof RedQueen !== 'undefined') {
                const line = AMBIENT_LINES[Math.floor(Math.random() * AMBIENT_LINES.length)];
                setTimeout(() => { RedQueen.speak(line, 4000); }, 1500);
            }
        }

        // Auto-save
        _save();
    }

    function _enterRoom(roomId, isFirstVisit) {
        if (!_mapData || !_mapData.rooms[roomId]) return;

        // Brief fade transition
        if (_roomContainer) {
            _roomContainer.style.transition = 'opacity 0.12s ease';
            _roomContainer.style.opacity = '0.3';
            setTimeout(() => { _roomContainer.style.opacity = '1'; }, 130);
        }

        const room = _mapData.rooms[roomId];
        // Attach the room ID for downstream use
        const roomWithId = Object.assign({ _id: roomId, id: roomId }, room);

        // Make sure the room is in visited
        if (!_state.visited.includes(roomId)) {
            _state.visited.push(roomId);
        }

        // Re-initialize RoomRenderer if we're coming back from puzzle
        if (_activePuzzle) {
            _activePuzzle = false;
            RoomRenderer.init(_roomContainer);
        }

        // Show room
        RoomRenderer.showRoom(roomWithId, isFirstVisit, _state);

        // Update browser tab + header progress
        document.title = 'The Hive \u2014 ' + (room.name || roomId);
        const headerDepth = document.querySelector('.hive-header-depth');
        if (headerDepth) {
            const total = Object.keys(_mapData.rooms).length;
            headerDepth.textContent = _state.visited.length + '/' + total + ' EXPLORED';
        }

        // Update map
        MapRenderer.update(_state);
    }

    // -------------------------------------------------------------------------
    // Lock system
    // -------------------------------------------------------------------------

    function _checkLock(room) {
        if (!room.lockCondition) return true;
        const cond = room.lockCondition;

        if (cond.type === 'puzzle-solved') {
            return _state.puzzlesSolved.includes(cond.room);
        }

        return false;
    }

    // -------------------------------------------------------------------------
    // Puzzle system
    // -------------------------------------------------------------------------

    async function startPuzzle(roomId) {
        if (_activePuzzle) return;

        const room = _mapData.rooms[roomId];
        if (!room || room.type !== 'puzzle') return;
        if (_state.puzzlesSolved.includes(roomId)) return;

        const puzzleId = room.puzzleId;
        if (!puzzleId) return;

        // Load puzzle data (cached)
        let puzzleData;
        try {
            puzzleData = await _loadPuzzle(puzzleId);
        } catch (err) {
            console.error('HiveEngine: failed to load puzzle', err);
            RoomRenderer.showMessage('ERROR: Puzzle data could not be loaded.', 3000);
            return;
        }

        _activePuzzle = true;

        // Get the puzzle wrapper from RoomRenderer
        const wrapper = RoomRenderer.showPuzzle(puzzleData);

        // Check for saved partial progress
        const savedProgress = _state.puzzleProgress[roomId];
        const startIndex = savedProgress ? savedProgress.puzzleIndex : 0;
        const collectedDigits = savedProgress ? [...savedProgress.collectedDigits] : [];

        // Build puzzle list with variant selection
        const puzzles = _preparePuzzles(puzzleData, roomId);

        // Run puzzle sequence
        _runPuzzleSequence(puzzles, puzzleData, wrapper, roomId, startIndex, collectedDigits);
    }

    function _preparePuzzles(puzzleData, roomId) {
        // Determine variants using a seeded approach per session
        return puzzleData.puzzles.map((puzzle, i) => {
            const useVariant = puzzle.variants && puzzle.variants.length > 0 && Math.random() < VARIANT_CHANCE;
            if (useVariant) {
                const variant = puzzle.variants[0];
                return {
                    title: puzzle.title,
                    type: variant.type || puzzle.type,
                    prompt: variant.prompt,
                    answer: variant.answer,
                    choices: variant.choices || puzzle.choices,
                    hint: puzzle.hint,
                    teachingPoint: puzzle.teachingPoint,
                    codeDigit: puzzle.codeDigit,
                    isVariant: true
                };
            }
            return {
                title: puzzle.title,
                type: puzzle.type,
                prompt: puzzle.prompt,
                answer: puzzle.answer,
                choices: puzzle.choices,
                hint: puzzle.hint,
                teachingPoint: puzzle.teachingPoint,
                codeDigit: puzzle.codeDigit,
                isVariant: false
            };
        });
    }

    function _runPuzzleSequence(puzzles, puzzleData, wrapper, roomId, index, collectedDigits) {
        if (index >= puzzles.length) {
            // All puzzles done — show code entry
            _showCodeEntry(puzzleData, wrapper, roomId, collectedDigits);
            return;
        }

        const puzzle = puzzles[index];

        // Progress label
        const progressEl = document.createElement('div');
        progressEl.style.cssText = `
            font-size: 0.7rem;
            letter-spacing: 0.1em;
            color: rgba(255,255,255,0.35);
            text-transform: uppercase;
            margin-bottom: 12px;
            padding: 0 20px;
        `;
        progressEl.textContent = `[ Challenge ${index + 1} of ${puzzles.length} ]`;
        wrapper.innerHTML = '';
        wrapper.appendChild(progressEl);

        // Puzzle container
        const puzzleContainer = document.createElement('div');
        wrapper.appendChild(puzzleContainer);

        // Abandon button
        const abandonBtn = document.createElement('button');
        abandonBtn.style.cssText = `
            display: block;
            margin: 8px 20px 0;
            padding: 8px 16px;
            background: transparent;
            color: rgba(255,255,255,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.7rem;
            letter-spacing: 0.08em;
            cursor: pointer;
        `;
        abandonBtn.textContent = '\u2190 LEAVE TERMINAL';
        abandonBtn.onmouseover = () => { abandonBtn.style.color = 'rgba(255,255,255,0.6)'; abandonBtn.style.borderColor = 'rgba(255,255,255,0.3)'; };
        abandonBtn.onmouseout = () => { abandonBtn.style.color = 'rgba(255,255,255,0.3)'; abandonBtn.style.borderColor = 'rgba(255,255,255,0.1)'; };
        abandonBtn.onclick = () => {
            // Save partial progress
            _state.puzzleProgress[roomId] = {
                puzzleIndex: index,
                collectedDigits: [...collectedDigits]
            };
            _save();
            _activePuzzle = false;
            RoomRenderer.init(_roomContainer);
            _enterRoom(roomId, false);
        };
        wrapper.appendChild(abandonBtn);

        PuzzleRenderer.render(puzzle, puzzleContainer, (isCorrect, codeDigit) => {
            if (isCorrect) {
                collectedDigits.push(codeDigit);
            }

            // Save partial progress
            _state.puzzleProgress[roomId] = {
                puzzleIndex: index + 1,
                collectedDigits: [...collectedDigits]
            };
            _save();

            // Advance after a delay
            setTimeout(() => {
                _runPuzzleSequence(puzzles, puzzleData, wrapper, roomId, index + 1, collectedDigits);
            }, isCorrect ? 2000 : 2500);
        });
    }

    function _showCodeEntry(puzzleData, wrapper, roomId, collectedDigits) {
        wrapper.innerHTML = '';

        const codeContainer = document.createElement('div');
        wrapper.appendChild(codeContainer);

        PuzzleRenderer.renderCodeEntry(puzzleData.finalCode, codeContainer, (isCorrect) => {
            if (isCorrect) {
                puzzleSolved(roomId);

                // Show success in the wrapper
                wrapper.innerHTML = '';
                const success = document.createElement('div');
                success.style.cssText = `
                    text-align: center;
                    padding: 40px 20px;
                    font-family: 'Courier New', monospace;
                `;
                success.innerHTML = `
                    <div style="font-size: 0.7rem; letter-spacing: 0.15em; color: #4caf50; text-transform: uppercase; margin-bottom: 16px;">[ SEQUENCE COMPLETE ]</div>
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); line-height: 1.6;">Vault authorization accepted.<br>Storage access unlocked.</div>
                `;
                wrapper.appendChild(success);

                if (typeof RedQueen !== 'undefined') {
                    RedQueen.speak('Authorization confirmed. You continue to surprise me. The storage room is now accessible.', 5000);
                }

                // Return to room view after delay
                setTimeout(() => {
                    _activePuzzle = false;
                    RoomRenderer.init(_roomContainer);
                    _enterRoom(roomId, false);
                }, 4000);
            } else {
                // Wrong code
                if (typeof RedQueen !== 'undefined') {
                    RedQueen.taunt();
                }
                RoomRenderer.showMessage('Incorrect code. Try again.', 2000);
            }
        });
    }

    async function _loadPuzzle(puzzleId) {
        if (_puzzleCache[puzzleId]) return _puzzleCache[puzzleId];

        const resp = await fetch(PUZZLE_DIR + puzzleId + '.json', { cache: 'no-cache' });
        if (!resp.ok) throw new Error('Puzzle fetch failed: ' + resp.status);
        const data = await resp.json();
        _puzzleCache[puzzleId] = data;
        return data;
    }

    // -------------------------------------------------------------------------
    // Puzzle solved
    // -------------------------------------------------------------------------

    function puzzleSolved(roomId) {
        if (!_state.puzzlesSolved.includes(roomId)) {
            _state.puzzlesSolved.push(roomId);
        }

        // Clean up partial progress
        delete _state.puzzleProgress[roomId];

        // Check for rooms that unlock based on this puzzle
        for (const [id, room] of Object.entries(_mapData.rooms)) {
            if (room.type === 'locked' && room.lockCondition) {
                if (room.lockCondition.type === 'puzzle-solved' && room.lockCondition.room === roomId) {
                    // Room is now unlocked — flash it on the map if visible
                    MapRenderer.highlightRoom(id);
                }
            }
        }

        // Update map to show solved state
        MapRenderer.update(_state);
        _save();
    }

    // -------------------------------------------------------------------------
    // Hint callback (PuzzleRenderer compatibility)
    // -------------------------------------------------------------------------

    function _onHintUsed(cost) {
        // Phase 2A: no scoring yet, just log it
        console.log('Hint used, cost:', cost);
    }

    // -------------------------------------------------------------------------
    // Floor completion
    // -------------------------------------------------------------------------

    function completeFloor() {
        _state.floorComplete = true;
        _save();

        // Replace everything with completion screen
        const mapEl = _mapContainer;
        const roomEl = _roomContainer;

        // Darken map
        mapEl.style.opacity = '0.3';

        // Show completion in room panel
        RoomRenderer.init(_roomContainer);

        const panel = _roomContainer.querySelector('.hive-room-panel') || _roomContainer;
        panel.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px;
            background: #141414;
            font-family: 'Courier New', monospace;
            color: rgba(255,255,255,0.85);
            text-align: center;
        `;

        // Stats
        const explored = _state.visited.length;
        const total = Object.keys(_mapData.rooms).length;
        const puzzles = _state.puzzlesSolved.length;
        const moves = _state.moveCount;

        wrapper.innerHTML = `
            <div style="font-size: 0.65rem; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 24px;">[ FLOOR COMPLETE ]</div>
            <div style="font-size: 1.4rem; font-weight: bold; color: #cc0000; letter-spacing: 0.1em; margin-bottom: 8px;">BASEMENT LEVEL 1</div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 32px;">Administrative Wing — Cleared</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; width: 100%; max-width: 300px;">
                <div style="padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px;">
                    <div style="font-size: 1.2rem; color: #cc0000; font-weight: bold;">${explored}/${total}</div>
                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em;">Rooms</div>
                </div>
                <div style="padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px;">
                    <div style="font-size: 1.2rem; color: #cc0000; font-weight: bold;">${moves}</div>
                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em;">Moves</div>
                </div>
                <div style="padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px;">
                    <div style="font-size: 1.2rem; color: #4caf50; font-weight: bold;">${puzzles}</div>
                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em;">Puzzles</div>
                </div>
                <div style="padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px;">
                    <div style="font-size: 1.2rem; color: #00bcd4; font-weight: bold;">${Math.round((explored / total) * 100)}%</div>
                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em;">Explored</div>
                </div>
            </div>

            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.6; max-width: 400px; margin-bottom: 24px;">
                The elevator descends. The hum of the servers fades above you. Below, something colder waits.
            </div>

            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.25); letter-spacing: 0.1em;">
                B-2: DATA ARCHIVES — COMING SOON
            </div>

            <button onclick="location.href='../dashboard.html'" style="
                margin-top: 24px;
                padding: 12px 28px;
                background: transparent;
                color: rgba(255,255,255,0.5);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
            ">\u2190 RETURN TO DASHBOARD</button>
        `;

        panel.appendChild(wrapper);

        // Red Queen sign-off
        if (typeof RedQueen !== 'undefined') {
            setTimeout(() => {
                RedQueen.speak('B-1 cleared. You performed... adequately. B-2 will not be so accommodating. I will be watching.', 6000);
            }, 1500);
        }
    }

    // -------------------------------------------------------------------------
    // Save / Load
    // -------------------------------------------------------------------------

    let _saveFlashTimer = null;

    function _save() {
        if (!_state) return;
        _state.lastSavedAt = new Date().toISOString();
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(_state));
            _flashSaveIndicator();
        } catch (e) {
            console.warn('HiveEngine: save failed', e);
        }
    }

    function _flashSaveIndicator() {
        const depthEl = _roomContainer && _roomContainer.querySelector('.hive-status-depth');
        if (!depthEl) return;
        if (_saveFlashTimer) clearTimeout(_saveFlashTimer);

        const orig = depthEl.textContent;
        depthEl.textContent = '\u2713 SAVED';
        depthEl.style.color = 'rgba(76,175,80,0.7)';

        _saveFlashTimer = setTimeout(() => {
            depthEl.textContent = orig;
            depthEl.style.color = '';
            _saveFlashTimer = null;
        }, 800);
    }

    function _loadSave() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data && data.version === 1) return data;
        } catch (e) {
            console.warn('HiveEngine: load failed', e);
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // Go back
    // -------------------------------------------------------------------------

    function goBack() {
        if (_activePuzzle) return;
        if (!_state || !_state.moveHistory || _state.moveHistory.length < 2) {
            RoomRenderer.showMessage('Nowhere to go back to.', 1500);
            return;
        }
        // Pop current room, peek at previous
        _state.moveHistory.pop();
        const prevRoom = _state.moveHistory[_state.moveHistory.length - 1];
        if (!prevRoom || !_mapData.rooms[prevRoom]) return;

        _state.currentRoom = prevRoom;
        _state.moveCount++;

        MapRenderer.update(_state);
        MapRenderer.centerOnRoom(prevRoom);
        _enterRoom(prevRoom, false);
        _save();
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    return {
        init,
        moveTo,
        goBack,
        startPuzzle,
        puzzleSolved,
        completeFloor,
        _onHintUsed
    };

})();
