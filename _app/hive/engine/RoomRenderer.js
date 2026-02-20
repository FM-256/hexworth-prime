/**
 * RoomRenderer.js — The Hive Room Description Panel
 *
 * Renders room descriptions with typewriter effect, exit compass controls,
 * and room-type-specific UI (puzzle buttons, lock messages, elevator, etc).
 *
 * Public API:
 *   RoomRenderer.init(container)                        — build panel structure
 *   RoomRenderer.showRoom(room, isFirstVisit, state)    — display room content
 *   RoomRenderer.showPuzzle(puzzleData)                 — delegate to PuzzleRenderer
 *   RoomRenderer.showMessage(text, duration)            — temporary overlay
 */

const RoomRenderer = (() => {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    const TYPEWRITER_SPEED = 18;  // ms per character
    const MESSAGE_FADE = 300;

    const DIR_LABELS = {
        north: 'N',
        south: 'S',
        east:  'E',
        west:  'W'
    };

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    let _container = null;
    let _statusBar = null;
    let _descPanel = null;
    let _eventPanel = null;
    let _exitPanel = null;
    let _messageOverlay = null;
    let _typewriterTimer = null;
    let _stylesInjected = false;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
            .hive-room-panel {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #141414;
                color: rgba(255,255,255,0.85);
                font-family: 'Courier New', monospace;
                position: relative;
                overflow: hidden;
            }

            /* Status bar */
            .hive-status-bar {
                padding: 14px 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }
            .hive-status-name {
                font-size: 0.85rem;
                font-weight: bold;
                letter-spacing: 0.08em;
                color: #cc0000;
                text-transform: uppercase;
            }
            .hive-status-depth {
                font-size: 0.65rem;
                letter-spacing: 0.12em;
                color: rgba(255,255,255,0.4);
                text-transform: uppercase;
            }

            /* Description panel */
            .hive-desc-panel {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            .hive-desc-text {
                font-size: 0.88rem;
                line-height: 1.7;
                border-left: 3px solid #cc0000;
                padding-left: 16px;
                margin-bottom: 16px;
                white-space: pre-line;
                min-height: 60px;
            }

            /* Lore documents */
            .hive-lore-doc {
                margin-top: 16px;
                padding: 14px 16px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 4px;
            }
            .hive-lore-title {
                font-size: 0.7rem;
                letter-spacing: 0.1em;
                color: rgba(255,255,255,0.5);
                text-transform: uppercase;
                margin-bottom: 8px;
            }
            .hive-lore-content {
                font-size: 0.8rem;
                line-height: 1.6;
                color: rgba(255,255,255,0.65);
                white-space: pre-line;
            }

            /* Event panel (puzzle buttons, elevator, etc) */
            .hive-event-panel {
                padding: 0 20px;
                flex-shrink: 0;
            }
            .hive-action-btn {
                display: block;
                width: 100%;
                padding: 14px 20px;
                margin-bottom: 10px;
                background: transparent;
                color: #cc0000;
                border: 2px solid #cc0000;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                font-weight: bold;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            .hive-action-btn:hover {
                background: rgba(204,0,0,0.15);
            }
            .hive-action-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .hive-action-btn.elevator-btn {
                color: #00bcd4;
                border-color: #00bcd4;
            }
            .hive-action-btn.elevator-btn:hover {
                background: rgba(0,188,212,0.1);
            }
            .hive-solved-badge {
                display: inline-block;
                padding: 8px 16px;
                background: rgba(76,175,80,0.1);
                border: 1px solid rgba(76,175,80,0.3);
                border-radius: 4px;
                color: #4caf50;
                font-size: 0.8rem;
                letter-spacing: 0.08em;
                margin-bottom: 10px;
            }
            .hive-locked-text {
                padding: 14px 16px;
                background: rgba(255,68,68,0.05);
                border-left: 3px solid #ff4444;
                color: rgba(255,255,255,0.6);
                font-size: 0.85rem;
                line-height: 1.5;
                margin-bottom: 10px;
            }
            .hive-supply-text {
                padding: 12px 16px;
                background: rgba(240,173,78,0.05);
                border-left: 3px solid #f0ad4e;
                color: rgba(255,255,255,0.6);
                font-size: 0.85rem;
                line-height: 1.5;
                margin-bottom: 10px;
            }

            /* Exit compass */
            .hive-exit-panel {
                padding: 16px 20px 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                flex-shrink: 0;
            }
            .hive-exit-label {
                font-size: 0.6rem;
                letter-spacing: 0.15em;
                color: rgba(255,255,255,0.3);
                text-transform: uppercase;
                margin-bottom: 10px;
            }
            .hive-compass {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: auto auto auto;
                gap: 6px;
                max-width: 220px;
                margin: 0 auto;
            }
            .hive-compass-btn {
                padding: 10px 0;
                background: rgba(255,255,255,0.04);
                color: rgba(255,255,255,0.7);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.8rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            .hive-compass-btn:hover:not(:disabled) {
                background: rgba(204,0,0,0.15);
                border-color: #cc0000;
                color: #cc0000;
            }
            .hive-compass-btn:disabled {
                opacity: 0.15;
                cursor: default;
            }
            .hive-compass-spacer {
                /* empty grid cell */
            }

            /* Message overlay */
            .hive-message-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 20px 30px;
                background: rgba(0,0,0,0.9);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px;
                color: rgba(255,255,255,0.9);
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                text-align: center;
                z-index: 100;
                opacity: 0;
                transition: opacity ${MESSAGE_FADE}ms ease;
                pointer-events: none;
            }
            .hive-message-overlay.visible {
                opacity: 1;
            }

            /* Puzzle wrapper dark theme overrides */
            .hive-puzzle-wrapper .hv-puzzle-prompt {
                color: rgba(255,255,255,0.85);
            }
            .hive-puzzle-wrapper .hv-puzzle-input {
                background: #1a1a1a;
                color: rgba(255,255,255,0.9);
                border-color: rgba(255,255,255,0.2);
            }
            .hive-puzzle-wrapper .hv-puzzle-input:focus {
                border-color: #cc0000;
            }
            .hive-puzzle-wrapper .hv-puzzle-choice {
                background: rgba(255,255,255,0.04);
                border-color: rgba(255,255,255,0.15);
                color: rgba(255,255,255,0.85);
            }
            .hive-puzzle-wrapper .hv-puzzle-choice:hover {
                border-color: #cc0000;
                background: rgba(204,0,0,0.1);
            }
            .hive-puzzle-wrapper .hv-puzzle-choice.selected {
                border-color: #cc0000;
                background: rgba(204,0,0,0.15);
            }
            .hive-puzzle-wrapper .hv-puzzle-choice-radio {
                border-color: rgba(255,255,255,0.3);
            }
            .hive-puzzle-wrapper .hv-puzzle-choice.selected .hv-puzzle-choice-radio {
                border-color: #cc0000;
            }
            .hive-puzzle-wrapper .hv-puzzle-choice-check {
                border-color: rgba(255,255,255,0.3);
            }
            .hive-puzzle-wrapper .hv-puzzle-hint {
                background: rgba(240,173,78,0.1);
                color: rgba(255,255,255,0.65);
            }
            .hive-puzzle-wrapper .hv-puzzle-feedback.correct {
                background: rgba(76,175,80,0.1);
                color: #81c784;
            }
            .hive-puzzle-wrapper .hv-puzzle-feedback.incorrect {
                background: rgba(204,0,0,0.1);
                color: #ef9a9a;
            }
            .hive-puzzle-wrapper .hv-puzzle-teaching {
                color: rgba(255,255,255,0.5);
                border-top-color: rgba(255,255,255,0.1);
            }
            .hive-puzzle-wrapper .hv-puzzle-title {
                color: #cc0000;
            }
            .hive-puzzle-wrapper .hv-code-title {
                color: #cc0000;
            }
            .hive-puzzle-wrapper .hv-code-box {
                background: #1a1a1a;
                color: rgba(255,255,255,0.9);
                border-color: rgba(255,255,255,0.2);
            }
            .hive-puzzle-wrapper .hv-code-box:focus {
                border-color: #cc0000;
            }
            .hive-puzzle-wrapper .hv-code-box.filled {
                border-color: rgba(255,255,255,0.4);
                background: #222;
            }
            .hive-puzzle-wrapper .hv-debug-answer {
                background: rgba(230,126,34,0.1);
                border-color: #e67e22;
                color: #e67e22;
            }
        `;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    function init(container) {
        _injectStyles();
        _container = container;
        container.innerHTML = '';

        const panel = document.createElement('div');
        panel.className = 'hive-room-panel';

        // Status bar
        _statusBar = document.createElement('div');
        _statusBar.className = 'hive-status-bar';
        _statusBar.innerHTML = `
            <div class="hive-status-name">---</div>
            <div class="hive-status-depth">DEPTH: PRISTINE</div>
        `;
        panel.appendChild(_statusBar);

        // Description
        _descPanel = document.createElement('div');
        _descPanel.className = 'hive-desc-panel';
        panel.appendChild(_descPanel);

        // Event panel (puzzle/elevator/etc)
        _eventPanel = document.createElement('div');
        _eventPanel.className = 'hive-event-panel';
        panel.appendChild(_eventPanel);

        // Exit compass
        _exitPanel = document.createElement('div');
        _exitPanel.className = 'hive-exit-panel';
        panel.appendChild(_exitPanel);

        // Message overlay
        _messageOverlay = document.createElement('div');
        _messageOverlay.className = 'hive-message-overlay';
        panel.appendChild(_messageOverlay);

        container.appendChild(panel);
    }

    // -------------------------------------------------------------------------
    // Show room
    // -------------------------------------------------------------------------

    function showRoom(room, isFirstVisit, state) {
        if (!room) return;

        // Cancel ongoing typewriter
        _clearTypewriter();

        // Status bar
        const nameEl = _statusBar.querySelector('.hive-status-name');
        const depthEl = _statusBar.querySelector('.hive-status-depth');
        if (nameEl) nameEl.textContent = room.name;
        if (depthEl) depthEl.textContent = 'DEPTH: ' + (state.depthTier || 'PRISTINE').toUpperCase();

        // Description text
        _descPanel.innerHTML = '';
        _descPanel.scrollTop = 0;
        const descEl = document.createElement('div');
        descEl.className = 'hive-desc-text';
        _descPanel.appendChild(descEl);

        // Choose text based on visit status
        let descText;
        if (room.type === 'locked') {
            const unlocked = _isUnlocked(room, state);
            if (isFirstVisit) {
                descText = unlocked ? (room.firstVisit || room.unlockedText) : room.lockedText;
            } else {
                descText = unlocked ? (room.revisit || room.unlockedText) : room.lockedText;
            }
        } else if (room.type === 'puzzle' && !isFirstVisit && _isPuzzleSolved(room, state)) {
            descText = room.solvedText || room.revisit;
        } else {
            descText = isFirstVisit ? room.firstVisit : room.revisit;
        }

        // Typewriter the description
        if (isFirstVisit && descText) {
            _typewriter(descText, descEl, () => {
                _showLoreDocs(room);
            });
        } else {
            descEl.textContent = descText || '';
            _showLoreDocs(room);
        }

        // Event panel (room type actions)
        _eventPanel.innerHTML = '';
        _renderRoomEvent(room, state);

        // Exit compass
        _renderExits(room, state);

        // Red Queen dialogue on first visit
        if (isFirstVisit && room.redQueen && typeof RedQueen !== 'undefined') {
            const delay = descText ? Math.min(descText.length * TYPEWRITER_SPEED, 3000) + 500 : 500;
            setTimeout(() => {
                RedQueen.speak(room.redQueen, 5000);
            }, delay);
        }
    }

    // -------------------------------------------------------------------------
    // Lore documents
    // -------------------------------------------------------------------------

    function _showLoreDocs(room) {
        if (!room.loreDocuments || room.loreDocuments.length === 0) return;

        for (const doc of room.loreDocuments) {
            const docEl = document.createElement('div');
            docEl.className = 'hive-lore-doc';

            const title = document.createElement('div');
            title.className = 'hive-lore-title';
            title.textContent = '[ ' + doc.title + ' ]';
            docEl.appendChild(title);

            const content = document.createElement('div');
            content.className = 'hive-lore-content';
            content.textContent = doc.content;
            docEl.appendChild(content);

            _descPanel.appendChild(docEl);
        }
    }

    // -------------------------------------------------------------------------
    // Room type events
    // -------------------------------------------------------------------------

    function _renderRoomEvent(room, state) {
        switch (room.type) {
            case 'puzzle':
                _renderPuzzleEvent(room, state);
                break;
            case 'locked':
                _renderLockedEvent(room, state);
                break;
            case 'elevator':
                _renderElevatorEvent(room, state);
                break;
            case 'supply':
                _renderSupplyEvent(room, state);
                break;
            default:
                break;
        }
    }

    function _renderPuzzleEvent(room, state) {
        if (_isPuzzleSolved(room, state)) {
            const badge = document.createElement('div');
            badge.className = 'hive-solved-badge';
            badge.textContent = '\u2713 PUZZLE COMPLETED';
            _eventPanel.appendChild(badge);
        } else {
            const btn = document.createElement('button');
            btn.className = 'hive-action-btn';
            btn.textContent = '[ ACCESS TERMINAL ]';
            btn.onclick = () => {
                if (window.HiveEngine && window.HiveEngine.startPuzzle) {
                    window.HiveEngine.startPuzzle(room.id || _getRoomId(room));
                }
            };
            _eventPanel.appendChild(btn);
        }
    }

    function _renderLockedEvent(room, state) {
        const unlocked = _isUnlocked(room, state);
        if (!unlocked) {
            const lockMsg = document.createElement('div');
            lockMsg.className = 'hive-locked-text';
            lockMsg.textContent = room.lockedText || 'This area is locked.';
            _eventPanel.appendChild(lockMsg);
        }
    }

    function _renderElevatorEvent(room, state) {
        const btn = document.createElement('button');
        btn.className = 'hive-action-btn elevator-btn';
        btn.textContent = '[ DESCEND TO B-2 ]';
        btn.onclick = () => {
            if (window.HiveEngine && window.HiveEngine.completeFloor) {
                window.HiveEngine.completeFloor();
            }
        };
        _eventPanel.appendChild(btn);
    }

    function _renderSupplyEvent(room, state) {
        if (room.supplyText) {
            const supplyMsg = document.createElement('div');
            supplyMsg.className = 'hive-supply-text';
            supplyMsg.textContent = room.supplyText;
            _eventPanel.appendChild(supplyMsg);
        }
    }

    // -------------------------------------------------------------------------
    // Exit compass
    // -------------------------------------------------------------------------

    function _renderExits(room, state) {
        _exitPanel.innerHTML = '';

        const label = document.createElement('div');
        label.className = 'hive-exit-label';
        label.textContent = '[ Exits ]';
        _exitPanel.appendChild(label);

        const compass = document.createElement('div');
        compass.className = 'hive-compass';

        const exits = room.exits || {};
        const directions = ['north', 'south', 'east', 'west'];

        // Grid layout: [empty, N, empty], [W, empty, E], [empty, S, empty]
        const grid = [
            null,    'north', null,
            'west',  null,    'east',
            null,    'south', null
        ];

        grid.forEach((dir) => {
            if (dir === null) {
                const spacer = document.createElement('div');
                spacer.className = 'hive-compass-spacer';
                compass.appendChild(spacer);
            } else {
                const btn = document.createElement('button');
                btn.className = 'hive-compass-btn';
                btn.textContent = DIR_LABELS[dir];
                const targetId = exits[dir];

                if (targetId) {
                    btn.onclick = () => {
                        if (window.HiveEngine && window.HiveEngine.moveTo) {
                            window.HiveEngine.moveTo(targetId);
                        }
                    };
                } else {
                    btn.disabled = true;
                }

                compass.appendChild(btn);
            }
        });

        _exitPanel.appendChild(compass);
    }

    // -------------------------------------------------------------------------
    // Puzzle display
    // -------------------------------------------------------------------------

    function showPuzzle(puzzleData) {
        _clearTypewriter();
        _descPanel.innerHTML = '';
        _eventPanel.innerHTML = '';
        _exitPanel.innerHTML = '';

        // Update status bar
        const nameEl = _statusBar.querySelector('.hive-status-name');
        if (nameEl) nameEl.textContent = 'COMPRESSION VAULT — ACTIVE';

        // Create dark-themed puzzle wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'hive-puzzle-wrapper';
        _descPanel.appendChild(wrapper);

        return wrapper;
    }

    // -------------------------------------------------------------------------
    // Show message
    // -------------------------------------------------------------------------

    function showMessage(text, duration) {
        if (!_messageOverlay) return;

        _messageOverlay.textContent = text;
        _messageOverlay.classList.add('visible');

        if (duration > 0) {
            setTimeout(() => {
                _messageOverlay.classList.remove('visible');
            }, duration);
        }
    }

    // -------------------------------------------------------------------------
    // Typewriter
    // -------------------------------------------------------------------------

    function _typewriter(text, el, onDone) {
        _clearTypewriter();

        let index = 0;
        el.textContent = '';

        _typewriterTimer = setInterval(() => {
            if (index < text.length) {
                el.textContent += text[index];
                index++;
            } else {
                _clearTypewriter();
                if (onDone) onDone();
            }
        }, TYPEWRITER_SPEED);
    }

    function _clearTypewriter() {
        if (_typewriterTimer) {
            clearInterval(_typewriterTimer);
            _typewriterTimer = null;
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    function _isPuzzleSolved(room, state) {
        const roomId = room.id || _getRoomIdFromMap(room);
        return (state.puzzlesSolved || []).includes(roomId);
    }

    function _isUnlocked(room, state) {
        if (!room.lockCondition) return true;
        if (room.lockCondition.type === 'puzzle-solved') {
            return (state.puzzlesSolved || []).includes(room.lockCondition.room);
        }
        return false;
    }

    function _getRoomIdFromMap(room) {
        // Fallback: find room ID by matching name in mapData
        // In practice, HiveEngine passes the room ID along with room data
        return room._id || '';
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    return {
        init,
        showRoom,
        showPuzzle,
        showMessage
    };

})();
