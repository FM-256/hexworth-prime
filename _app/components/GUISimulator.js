/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GUISimulator.js - Windows Server GUI Simulation Framework
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hexworth Prime - House of Cloud
 * Course: WSA (Windows Server Administration)
 * Certification Alignment: Microsoft AZ-800
 *
 * A comprehensive GUI simulation framework that recreates Windows Server
 * management interfaces (ADUC, Server Manager, Disk Management, etc.) for
 * educational purposes.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ INSIGHT: GUI vs PowerShell Administration                                  │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ Windows Server can be managed two ways:                                    │
 * │                                                                             │
 * │ GUI (MMC Snap-ins):           PowerShell (CLI):                            │
 * │ ├─ Visual, discoverable       ├─ Scriptable, repeatable                    │
 * │ ├─ Good for one-off tasks     ├─ Good for automation                       │
 * │ ├─ Immediate feedback         ├─ Can affect many servers                   │
 * │ └─ Server Manager, ADUC, etc. └─ Get-*, Set-*, New-* cmdlets              │
 * │                                                                             │
 * │ Both approaches affect the SAME underlying system. GUISimulator and        │
 * │ PSTerminal share state through WSAState, teaching this equivalence.        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * Architecture:
 * - WindowManager: Z-index, focus, drag/resize handling
 * - Components: Window, TreeView, ListView, Modal, ContextMenu, etc.
 * - Apps: ServerManager, ADUC, DiskManagement (use components)
 * - WSAState integration for bidirectional sync with PSTerminal
 *
 * Version: 1.0.0
 * Created: January 30, 2026
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const GUISimulator = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════

    const config = {
        moduleId: null,
        container: null,
        domain: 'hexworth.local',
        hostname: 'DC01',
        cssInjected: false,
        theme: 'windows', // 'windows' or 'hexworth'
    };

    // Theme constants
    const THEMES = {
        WINDOWS: 'windows',
        HEXWORTH: 'hexworth',
    };

    // Track all open windows
    const windows = new Map();
    let windowZIndex = 100;
    let focusedWindowId = null;

    // Track active modals
    const modals = new Map();

    // Track context menus
    let activeContextMenu = null;

    // State subscription
    let stateUnsubscribe = null;

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Initialize GUISimulator
     *
     * @param {string} moduleId - Module identifier (e.g., 'WSA-M02')
     * @param {string|Element} container - Container selector or element
     * @param {Object} options - Configuration options
     */
    function init(moduleId, container, options = {}) {
        config.moduleId = moduleId;
        config.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!config.container) {
            console.error('GUISimulator: Container not found');
            return null;
        }

        // Apply options
        if (options.domain) config.domain = options.domain;
        if (options.hostname) config.hostname = options.hostname;
        if (options.theme) config.theme = options.theme;

        // Load saved theme preference
        const savedTheme = localStorage.getItem('gui-simulator-theme');
        if (savedTheme && (savedTheme === THEMES.WINDOWS || savedTheme === THEMES.HEXWORTH)) {
            config.theme = savedTheme;
        }

        // Inject CSS if not already done
        _injectCSS();

        // Set up container
        config.container.style.position = 'relative';

        // Apply theme class to container
        _applyTheme(config.theme);

        // Subscribe to WSAState if available
        if (typeof WSAState !== 'undefined') {
            stateUnsubscribe = WSAState.subscribe(_handleStateChange);
        }

        // Global event listeners
        _attachGlobalListeners();

        // Record content start time for time-on-task analytics
        try {
            const startKey = 'hexworth_start_times';
            const starts = JSON.parse(localStorage.getItem(startKey) || '{}');
            const contentKey = moduleId.toLowerCase();
            if (!starts[contentKey]) {
                starts[contentKey] = Date.now();
                localStorage.setItem(startKey, JSON.stringify(starts));
            }
        } catch(e) { /* non-critical */ }

        return GUISimulator;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // THEME MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Apply theme class to container
     */
    function _applyTheme(theme) {
        if (!config.container) return;

        // Remove existing theme classes
        config.container.classList.remove('gui-theme-windows', 'gui-theme-hexworth');

        // Add new theme class
        config.container.classList.add(`gui-theme-${theme}`);

        // Store theme for modals/context menus to read
        document.documentElement.dataset.guiTheme = theme;
    }

    /**
     * Set the current theme
     * @param {string} theme - 'windows' or 'hexworth'
     */
    function setTheme(theme) {
        if (theme !== THEMES.WINDOWS && theme !== THEMES.HEXWORTH) {
            console.error('GUISimulator.setTheme: Invalid theme. Use "windows" or "hexworth"');
            return;
        }

        config.theme = theme;
        _applyTheme(theme);

        // Save preference
        localStorage.setItem('gui-simulator-theme', theme);

        // Notify windows of theme change
        windows.forEach(win => {
            if (win.onThemeChange) {
                win.onThemeChange(theme);
            }
        });

        console.log(`GUISimulator: Theme changed to "${theme}"`);
    }

    /**
     * Get the current theme
     * @returns {string} Current theme ('windows' or 'hexworth')
     */
    function getTheme() {
        return config.theme;
    }

    /**
     * Toggle between Windows and Hexworth themes
     * @returns {string} The new theme
     */
    function toggleTheme() {
        const newTheme = config.theme === THEMES.WINDOWS ? THEMES.HEXWORTH : THEMES.WINDOWS;
        setTheme(newTheme);
        return newTheme;
    }

    /**
     * Create a theme toggle button
     * @param {Object} options - Toggle options
     * @returns {HTMLElement} The toggle button element
     */
    function createThemeToggle(options = {}) {
        const container = options.container
            ? (typeof options.container === 'string'
                ? document.querySelector(options.container)
                : options.container)
            : null;

        const toggleEl = document.createElement('button');
        toggleEl.className = 'gui-theme-toggle';
        toggleEl.type = 'button';
        toggleEl.title = 'Toggle between Windows Server and Hexworth themes';

        function updateToggle() {
            const isWindows = config.theme === THEMES.WINDOWS;
            toggleEl.innerHTML = `
                <span class="gui-theme-toggle-icon">${isWindows ? '🪟' : '✨'}</span>
                <span class="gui-theme-toggle-label">${isWindows ? 'Windows' : 'Hexworth'}</span>
            `;
        }

        updateToggle();

        toggleEl.addEventListener('click', () => {
            toggleTheme();
            updateToggle();
            if (options.onChange) {
                options.onChange(config.theme);
            }
        });

        if (container) {
            container.appendChild(toggleEl);
        }

        return toggleEl;
    }

    /**
     * Inject CSS styles
     */
    function _injectCSS() {
        if (config.cssInjected) return;

        // Check if external CSS is loaded
        const hasExternalCSS = Array.from(document.styleSheets).some(sheet => {
            try {
                return sheet.href && sheet.href.includes('gui-simulator.css');
            } catch (e) {
                return false;
            }
        });

        if (!hasExternalCSS) {
            // Add link to external CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '../components/styles/gui-simulator.css';
            document.head.appendChild(link);
        }

        config.cssInjected = true;
    }

    /**
     * Attach global event listeners
     */
    function _attachGlobalListeners() {
        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (activeContextMenu && !activeContextMenu.contains(e.target)) {
                closeContextMenu();
            }
        });

        // Close context menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (activeContextMenu) {
                    closeContextMenu();
                } else if (modals.size > 0) {
                    // Close topmost modal
                    const modalIds = Array.from(modals.keys());
                    closeModal(modalIds[modalIds.length - 1]);
                }
            }
        });
    }

    /**
     * Handle state changes from WSAState
     */
    function _handleStateChange(state, prevState, action) {
        // Skip if action came from GUI (prevent loops)
        if (action.source === 'gui') return;

        // Notify all windows of state change
        windows.forEach(win => {
            if (win.onStateChange) {
                win.onStateChange(state, prevState, action);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WINDOW MANAGER
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create a new window
     *
     * @param {Object} options - Window configuration
     * @returns {Object} Window instance
     *
     * @example
     * GUISimulator.createWindow({
     *     id: 'aduc',
     *     title: 'Active Directory Users and Computers',
     *     icon: '👥',
     *     width: 900,
     *     height: 600,
     *     content: htmlString,
     *     onClose: () => console.log('Window closed')
     * });
     */
    function createWindow(options) {
        const id = options.id || `window-${Date.now()}`;

        // Check if window already exists
        if (windows.has(id)) {
            focusWindow(id);
            return windows.get(id);
        }

        const defaults = {
            id,
            title: 'Window',
            icon: '📁',
            width: 800,
            height: 500,
            x: null,
            y: null,
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            content: '',
            onClose: null,
            onFocus: null,
            onBlur: null,
            onStateChange: null,
        };

        const windowConfig = { ...defaults, ...options };

        // Calculate initial position (centered if not specified)
        if (windowConfig.x === null) {
            windowConfig.x = Math.max(20, (config.container.offsetWidth - windowConfig.width) / 2);
        }
        if (windowConfig.y === null) {
            windowConfig.y = Math.max(20, (config.container.offsetHeight - windowConfig.height) / 2);
        }

        // Create window element
        const windowEl = document.createElement('div');
        windowEl.className = 'gui-window';
        windowEl.id = id;
        windowEl.style.width = `${windowConfig.width}px`;
        windowEl.style.height = `${windowConfig.height}px`;
        windowEl.style.left = `${windowConfig.x}px`;
        windowEl.style.top = `${windowConfig.y}px`;
        windowEl.style.zIndex = ++windowZIndex;

        windowEl.innerHTML = `
            <div class="gui-window-titlebar">
                <div class="gui-window-title">
                    <span class="gui-window-icon">${windowConfig.icon}</span>
                    <span class="gui-window-title-text">${windowConfig.title}</span>
                </div>
                <div class="gui-window-controls">
                    ${windowConfig.minimizable ? '<span class="gui-window-control minimize" title="Minimize"></span>' : ''}
                    ${windowConfig.maximizable ? '<span class="gui-window-control maximize" title="Maximize"></span>' : ''}
                    ${windowConfig.closable ? '<span class="gui-window-control close" title="Close"></span>' : ''}
                </div>
            </div>
            <div class="gui-window-content">${windowConfig.content}</div>
            ${windowConfig.resizable ? `
                <div class="gui-window-resize n"></div>
                <div class="gui-window-resize s"></div>
                <div class="gui-window-resize e"></div>
                <div class="gui-window-resize w"></div>
                <div class="gui-window-resize ne"></div>
                <div class="gui-window-resize nw"></div>
                <div class="gui-window-resize se"></div>
                <div class="gui-window-resize sw"></div>
            ` : ''}
        `;

        // Add to container
        config.container.appendChild(windowEl);

        // Store window instance
        const windowInstance = {
            id,
            element: windowEl,
            config: windowConfig,
            isMaximized: false,
            isMinimized: false,
            prevBounds: null,
            onStateChange: windowConfig.onStateChange,
        };
        windows.set(id, windowInstance);

        // Attach event handlers
        _attachWindowEvents(windowInstance);

        // Focus the new window
        focusWindow(id);

        return windowInstance;
    }

    /**
     * Attach event handlers to window
     */
    function _attachWindowEvents(windowInstance) {
        const { element: windowEl, id, config: windowConfig } = windowInstance;

        // Click to focus
        windowEl.addEventListener('mousedown', (e) => {
            focusWindow(id);
        });

        // Title bar - drag
        const titlebar = windowEl.querySelector('.gui-window-titlebar');
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('gui-window-control')) return;
            if (windowInstance.isMaximized) return;

            isDragging = true;
            dragOffset.x = e.clientX - windowEl.offsetLeft;
            dragOffset.y = e.clientY - windowEl.offsetTop;

            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', onDragEnd);
        });

        function onDrag(e) {
            if (!isDragging) return;
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            windowEl.style.left = `${Math.max(0, newX)}px`;
            windowEl.style.top = `${Math.max(0, newY)}px`;
        }

        function onDragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', onDragEnd);
        }

        // Double-click title bar to maximize
        titlebar.addEventListener('dblclick', () => {
            if (windowConfig.maximizable) {
                toggleMaximize(id);
            }
        });

        // Window controls
        const minimizeBtn = windowEl.querySelector('.gui-window-control.minimize');
        const maximizeBtn = windowEl.querySelector('.gui-window-control.maximize');
        const closeBtn = windowEl.querySelector('.gui-window-control.close');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                minimizeWindow(id);
            });
        }

        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMaximize(id);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWindow(id);
            });
        }

        // Resize handles
        if (windowConfig.resizable) {
            const resizeHandles = windowEl.querySelectorAll('.gui-window-resize');
            resizeHandles.forEach(handle => {
                _attachResizeHandler(windowInstance, handle);
            });
        }
    }

    /**
     * Attach resize handler to a resize handle
     */
    function _attachResizeHandler(windowInstance, handle) {
        const { element: windowEl } = windowInstance;
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        const direction = handle.className.split(' ').pop();

        handle.addEventListener('mousedown', (e) => {
            if (windowInstance.isMaximized) return;
            e.stopPropagation();
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowEl.offsetWidth;
            startHeight = windowEl.offsetHeight;
            startLeft = windowEl.offsetLeft;
            startTop = windowEl.offsetTop;

            document.addEventListener('mousemove', onResize);
            document.addEventListener('mouseup', onResizeEnd);
        });

        function onResize(e) {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const minWidth = 300;
            const minHeight = 200;

            if (direction.includes('e')) {
                windowEl.style.width = `${Math.max(minWidth, startWidth + dx)}px`;
            }
            if (direction.includes('w')) {
                const newWidth = Math.max(minWidth, startWidth - dx);
                const newLeft = startLeft + (startWidth - newWidth);
                windowEl.style.width = `${newWidth}px`;
                windowEl.style.left = `${newLeft}px`;
            }
            if (direction.includes('s')) {
                windowEl.style.height = `${Math.max(minHeight, startHeight + dy)}px`;
            }
            if (direction.includes('n')) {
                const newHeight = Math.max(minHeight, startHeight - dy);
                const newTop = startTop + (startHeight - newHeight);
                windowEl.style.height = `${newHeight}px`;
                windowEl.style.top = `${newTop}px`;
            }
        }

        function onResizeEnd() {
            isResizing = false;
            document.removeEventListener('mousemove', onResize);
            document.removeEventListener('mouseup', onResizeEnd);
        }
    }

    /**
     * Focus a window
     */
    function focusWindow(id) {
        const win = windows.get(id);
        if (!win) return;

        // Blur previous window
        if (focusedWindowId && focusedWindowId !== id) {
            const prevWin = windows.get(focusedWindowId);
            if (prevWin) {
                prevWin.element.classList.remove('focused');
                if (prevWin.config.onBlur) prevWin.config.onBlur();
            }
        }

        // Focus new window
        win.element.classList.add('focused');
        win.element.style.zIndex = ++windowZIndex;
        focusedWindowId = id;

        if (win.config.onFocus) win.config.onFocus();
    }

    /**
     * Close a window
     */
    function closeWindow(id) {
        const win = windows.get(id);
        if (!win) return;

        if (win.config.onClose) {
            const result = win.config.onClose();
            if (result === false) return; // Cancel close
        }

        win.element.remove();
        windows.delete(id);

        if (focusedWindowId === id) {
            focusedWindowId = null;
            // Focus next window if any
            if (windows.size > 0) {
                const lastWindowId = Array.from(windows.keys()).pop();
                focusWindow(lastWindowId);
            }
        }
    }

    /**
     * Minimize a window
     */
    function minimizeWindow(id) {
        const win = windows.get(id);
        if (!win) return;

        win.isMinimized = true;
        win.element.style.display = 'none';

        // Focus next window
        if (focusedWindowId === id) {
            focusedWindowId = null;
            if (windows.size > 0) {
                for (const [winId, w] of windows) {
                    if (!w.isMinimized && winId !== id) {
                        focusWindow(winId);
                        break;
                    }
                }
            }
        }
    }

    /**
     * Restore a minimized window
     */
    function restoreWindow(id) {
        const win = windows.get(id);
        if (!win || !win.isMinimized) return;

        win.isMinimized = false;
        win.element.style.display = '';
        focusWindow(id);
    }

    /**
     * Toggle maximize state
     */
    function toggleMaximize(id) {
        const win = windows.get(id);
        if (!win) return;

        if (win.isMaximized) {
            // Restore
            win.element.classList.remove('maximized');
            if (win.prevBounds) {
                win.element.style.width = win.prevBounds.width;
                win.element.style.height = win.prevBounds.height;
                win.element.style.left = win.prevBounds.left;
                win.element.style.top = win.prevBounds.top;
            }
            win.isMaximized = false;
        } else {
            // Maximize
            win.prevBounds = {
                width: win.element.style.width,
                height: win.element.style.height,
                left: win.element.style.left,
                top: win.element.style.top,
            };
            win.element.classList.add('maximized');
            win.isMaximized = true;
        }
    }

    /**
     * Get window by ID
     */
    function getWindow(id) {
        return windows.get(id);
    }

    /**
     * Get window content element
     */
    function getWindowContent(id) {
        const win = windows.get(id);
        return win ? win.element.querySelector('.gui-window-content') : null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TREE VIEW COMPONENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create a tree view
     *
     * @param {Object} options - TreeView configuration
     * @returns {Object} TreeView instance
     *
     * @example
     * GUISimulator.createTreeView({
     *     container: '#tree-container',
     *     data: [
     *         { id: 'root', label: 'hexworth.local', icon: '🏰', children: [...] }
     *     ],
     *     onSelect: (nodeId, nodeData) => {},
     *     onContextMenu: (nodeId, event) => {}
     * });
     */
    function createTreeView(options) {
        const container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;

        if (!container) {
            console.error('GUISimulator.createTreeView: Container not found');
            return null;
        }

        const treeInstance = {
            container,
            data: options.data || [],
            selectedId: options.selectedId || null,
            expandedIds: new Set(options.expandedIds || []),
            onSelect: options.onSelect || null,
            onContextMenu: options.onContextMenu || null,
            onExpand: options.onExpand || null,
            onCollapse: options.onCollapse || null,
        };

        // Render tree
        _renderTree(treeInstance);

        return {
            select: (id) => _treeSelect(treeInstance, id),
            expand: (id) => _treeExpand(treeInstance, id),
            collapse: (id) => _treeCollapse(treeInstance, id),
            toggle: (id) => _treeToggle(treeInstance, id),
            refresh: () => _renderTree(treeInstance),
            setData: (data) => {
                treeInstance.data = data;
                _renderTree(treeInstance);
            },
            getData: () => treeInstance.data,
            getSelected: () => treeInstance.selectedId,
        };
    }

    /**
     * Render tree view
     */
    function _renderTree(treeInstance) {
        const { container, data } = treeInstance;
        container.className = 'gui-tree';
        container.innerHTML = '';

        function renderNode(node, level = 0) {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = treeInstance.expandedIds.has(node.id);
            const isSelected = treeInstance.selectedId === node.id;

            const itemEl = document.createElement('div');
            itemEl.className = `gui-tree-item${isSelected ? ' selected' : ''}`;
            itemEl.dataset.id = node.id;
            itemEl.dataset.level = level;

            itemEl.innerHTML = `
                <span class="gui-tree-expand">${hasChildren ? (isExpanded ? '▼' : '▶') : ''}</span>
                <span class="gui-tree-icon">${node.icon || '📁'}</span>
                <span class="gui-tree-label">${node.label}</span>
                ${node.badge ? `<span class="gui-tree-badge">${node.badge}</span>` : ''}
            `;

            // Click to select
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();

                // If clicking on expand arrow, toggle instead of select
                if (e.target.classList.contains('gui-tree-expand') && hasChildren) {
                    _treeToggle(treeInstance, node.id);
                    return;
                }

                _treeSelect(treeInstance, node.id, node);
            });

            // Context menu
            if (treeInstance.onContextMenu) {
                itemEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    _treeSelect(treeInstance, node.id, node);
                    treeInstance.onContextMenu(node.id, node, e);
                });
            }

            container.appendChild(itemEl);

            // Render children if expanded
            if (hasChildren && isExpanded) {
                node.children.forEach(child => renderNode(child, level + 1));
            }
        }

        data.forEach(node => renderNode(node, 0));
    }

    function _treeSelect(treeInstance, id, node = null) {
        // Deselect previous
        const prevSelected = treeInstance.container.querySelector('.gui-tree-item.selected');
        if (prevSelected) prevSelected.classList.remove('selected');

        // Select new
        const newSelected = treeInstance.container.querySelector(`[data-id="${id}"]`);
        if (newSelected) newSelected.classList.add('selected');

        treeInstance.selectedId = id;

        if (treeInstance.onSelect) {
            treeInstance.onSelect(id, node);
        }
    }

    function _treeExpand(treeInstance, id) {
        treeInstance.expandedIds.add(id);
        _renderTree(treeInstance);
        if (treeInstance.onExpand) treeInstance.onExpand(id);
    }

    function _treeCollapse(treeInstance, id) {
        treeInstance.expandedIds.delete(id);
        _renderTree(treeInstance);
        if (treeInstance.onCollapse) treeInstance.onCollapse(id);
    }

    function _treeToggle(treeInstance, id) {
        if (treeInstance.expandedIds.has(id)) {
            _treeCollapse(treeInstance, id);
        } else {
            _treeExpand(treeInstance, id);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LIST VIEW COMPONENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create a list view
     *
     * @param {Object} options - ListView configuration
     * @returns {Object} ListView instance
     *
     * @example
     * GUISimulator.createListView({
     *     container: '#list-container',
     *     columns: [
     *         { id: 'icon', label: '', width: 40 },
     *         { id: 'name', label: 'Name', width: 200 },
     *         { id: 'type', label: 'Type', width: 100 }
     *     ],
     *     data: arrayOfObjects,
     *     onSelect: (item) => {},
     *     onDoubleClick: (item) => {},
     *     onContextMenu: (item, event) => {}
     * });
     */
    function createListView(options) {
        const container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;

        if (!container) {
            console.error('GUISimulator.createListView: Container not found');
            return null;
        }

        const listInstance = {
            container,
            columns: options.columns || [],
            data: options.data || [],
            selectedItem: null,
            selectedItems: new Set(),
            multiSelect: options.multiSelect || false,
            sortColumn: options.sortColumn || null,
            sortDirection: options.sortDirection || 'asc',
            onSelect: options.onSelect || null,
            onDoubleClick: options.onDoubleClick || null,
            onContextMenu: options.onContextMenu || null,
            emptyMessage: options.emptyMessage || 'No items to display.',
            getIcon: options.getIcon || null,
        };

        _renderList(listInstance);

        return {
            select: (item) => _listSelect(listInstance, item),
            clearSelection: () => _listClearSelection(listInstance),
            refresh: () => _renderList(listInstance),
            setData: (data) => {
                listInstance.data = data;
                listInstance.selectedItem = null;
                listInstance.selectedItems.clear();
                _renderList(listInstance);
            },
            getData: () => listInstance.data,
            getSelected: () => listInstance.selectedItem,
            sort: (columnId, direction) => {
                listInstance.sortColumn = columnId;
                listInstance.sortDirection = direction || 'asc';
                _renderList(listInstance);
            },
        };
    }

    /**
     * Render list view
     */
    function _renderList(listInstance) {
        const { container, columns, data, emptyMessage } = listInstance;
        container.className = 'gui-list';

        // Calculate grid template
        const gridTemplate = columns.map(col => col.width ? `${col.width}px` : '1fr').join(' ');

        // Sort data if needed
        let sortedData = [...data];
        if (listInstance.sortColumn) {
            const col = columns.find(c => c.id === listInstance.sortColumn);
            sortedData.sort((a, b) => {
                let aVal = a[listInstance.sortColumn] || '';
                let bVal = b[listInstance.sortColumn] || '';
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();

                if (aVal < bVal) return listInstance.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return listInstance.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Build HTML
        let html = `
            <div class="gui-list-header" style="grid-template-columns: ${gridTemplate}">
                ${columns.map(col => `
                    <div class="gui-list-header-cell${listInstance.sortColumn === col.id ? ' sorted' : ''}"
                         data-column="${col.id}">
                        ${col.label}
                        ${col.sortable !== false ? `<span class="sort-icon">${
                            listInstance.sortColumn === col.id
                                ? (listInstance.sortDirection === 'asc' ? '▲' : '▼')
                                : '▲'
                        }</span>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="gui-list-body">
        `;

        if (sortedData.length === 0) {
            html += `<div class="gui-list-empty">${emptyMessage}</div>`;
        } else {
            sortedData.forEach((item, index) => {
                const isSelected = listInstance.selectedItem === item ||
                                   listInstance.selectedItems.has(item);
                html += `
                    <div class="gui-list-item${isSelected ? ' selected' : ''}"
                         data-index="${index}"
                         style="grid-template-columns: ${gridTemplate}">
                        ${columns.map(col => {
                            let value = item[col.id];
                            let className = 'gui-list-cell';

                            if (col.id === 'icon') {
                                value = listInstance.getIcon
                                    ? listInstance.getIcon(item)
                                    : (item.icon || '📄');
                                className += ' icon';
                            } else if (col.secondary) {
                                className += ' secondary';
                            }

                            if (col.render) {
                                value = col.render(value, item);
                            }

                            return `<div class="${className}">${value ?? ''}</div>`;
                        }).join('')}
                    </div>
                `;
            });
        }

        html += '</div>';
        container.innerHTML = html;

        // Attach event handlers
        const headerCells = container.querySelectorAll('.gui-list-header-cell');
        headerCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const colId = cell.dataset.column;
                const col = columns.find(c => c.id === colId);
                if (col && col.sortable !== false) {
                    if (listInstance.sortColumn === colId) {
                        listInstance.sortDirection = listInstance.sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        listInstance.sortColumn = colId;
                        listInstance.sortDirection = 'asc';
                    }
                    _renderList(listInstance);
                }
            });
        });

        const items = container.querySelectorAll('.gui-list-item');
        items.forEach(itemEl => {
            const index = parseInt(itemEl.dataset.index);
            const item = sortedData[index];

            itemEl.addEventListener('click', (e) => {
                _listSelect(listInstance, item, e.ctrlKey || e.metaKey);
            });

            itemEl.addEventListener('dblclick', () => {
                if (listInstance.onDoubleClick) {
                    listInstance.onDoubleClick(item);
                }
            });

            if (listInstance.onContextMenu) {
                itemEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    _listSelect(listInstance, item);
                    listInstance.onContextMenu(item, e);
                });
            }
        });
    }

    function _listSelect(listInstance, item, addToSelection = false) {
        if (listInstance.multiSelect && addToSelection) {
            if (listInstance.selectedItems.has(item)) {
                listInstance.selectedItems.delete(item);
            } else {
                listInstance.selectedItems.add(item);
            }
            listInstance.selectedItem = item;
        } else {
            listInstance.selectedItems.clear();
            listInstance.selectedItems.add(item);
            listInstance.selectedItem = item;
        }

        _renderList(listInstance);

        if (listInstance.onSelect) {
            listInstance.onSelect(item);
        }
    }

    function _listClearSelection(listInstance) {
        listInstance.selectedItem = null;
        listInstance.selectedItems.clear();
        _renderList(listInstance);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTEXT MENU COMPONENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Show a context menu
     *
     * @param {Object} options - Context menu configuration
     *
     * @example
     * GUISimulator.showContextMenu({
     *     x: event.clientX,
     *     y: event.clientY,
     *     items: [
     *         { icon: '📁', label: 'New Folder', onClick: () => {} },
     *         { type: 'divider' },
     *         { icon: '🗑️', label: 'Delete', disabled: true }
     *     ]
     * });
     */
    function showContextMenu(options) {
        closeContextMenu();

        const menuEl = document.createElement('div');
        const ctxTheme = document.documentElement.dataset.guiTheme || 'hexworth';
        menuEl.className = `gui-context-menu gui-theme-${ctxTheme}`;

        let html = '';
        options.items.forEach(item => {
            if (item.type === 'divider') {
                html += '<div class="gui-context-divider"></div>';
            } else {
                const disabledClass = item.disabled ? ' disabled' : '';
                html += `
                    <div class="gui-context-item${disabledClass}" data-action="${item.action || ''}">
                        ${item.icon ? `<span class="gui-context-item-icon">${item.icon}</span>` : ''}
                        <span class="gui-context-item-label">${item.label}</span>
                        ${item.shortcut ? `<span class="gui-context-item-shortcut">${item.shortcut}</span>` : ''}
                        ${item.submenu ? '<span class="gui-context-submenu-arrow">▶</span>' : ''}
                    </div>
                `;
            }
        });

        menuEl.innerHTML = html;
        document.body.appendChild(menuEl);

        // Position menu
        const rect = menuEl.getBoundingClientRect();
        let x = options.x;
        let y = options.y;

        // Keep within viewport
        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width - 10;
        }
        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height - 10;
        }

        menuEl.style.left = `${x}px`;
        menuEl.style.top = `${y}px`;

        // Show with animation
        requestAnimationFrame(() => {
            menuEl.classList.add('visible');
        });

        // Attach click handlers
        const menuItems = menuEl.querySelectorAll('.gui-context-item:not(.disabled)');
        // Filter to only enabled, non-divider items to match DOM selection
        const enabledItems = options.items.filter(i => i.type !== 'divider' && !i.disabled);
        menuItems.forEach((itemEl, index) => {
            const item = enabledItems[index];
            itemEl.addEventListener('click', () => {
                if (item && item.onClick) {
                    item.onClick();
                }
                closeContextMenu();
            });
        });

        activeContextMenu = menuEl;
    }

    /**
     * Close the active context menu
     */
    function closeContextMenu() {
        if (activeContextMenu) {
            activeContextMenu.remove();
            activeContextMenu = null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODAL COMPONENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Show a modal dialog
     *
     * @param {Object} options - Modal configuration
     * @returns {Object} Modal instance
     *
     * @example
     * GUISimulator.showModal({
     *     id: 'new-user',
     *     title: 'New User',
     *     icon: '👤',
     *     content: formHtml,
     *     width: 450,
     *     actions: [
     *         { label: 'Create', primary: true, onClick: handleCreate },
     *         { label: 'Cancel', onClick: closeModal }
     *     ]
     * });
     */
    function showModal(options) {
        const id = options.id || `modal-${Date.now()}`;

        // Check if modal already exists
        if (modals.has(id)) {
            return modals.get(id);
        }

        const overlayEl = document.createElement('div');
        const currentTheme = document.documentElement.dataset.guiTheme || 'hexworth';
        overlayEl.className = `gui-modal-overlay gui-theme-${currentTheme}`;
        overlayEl.id = `${id}-overlay`;

        const width = options.width || 480;

        overlayEl.innerHTML = `
            <div class="gui-modal" style="max-width: ${width}px">
                <div class="gui-modal-header">
                    <div class="gui-modal-title">
                        ${options.icon ? `<span>${options.icon}</span>` : ''}
                        ${options.title || 'Dialog'}
                    </div>
                    <button class="gui-modal-close">&times;</button>
                </div>
                <div class="gui-modal-body">
                    ${options.content || ''}
                </div>
                ${options.actions ? `
                    <div class="gui-modal-footer">
                        ${options.actions.map(action => `
                            <button class="gui-btn ${action.primary ? 'primary' : 'secondary'}"
                                    data-action="${action.id || action.label}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(overlayEl);

        const modalInstance = {
            id,
            element: overlayEl,
            options,
        };
        modals.set(id, modalInstance);

        // Close button
        const closeBtn = overlayEl.querySelector('.gui-modal-close');
        closeBtn.addEventListener('click', () => closeModal(id));

        // Click backdrop to close
        overlayEl.addEventListener('click', (e) => {
            if (e.target === overlayEl && options.closeOnBackdrop !== false) {
                closeModal(id);
            }
        });

        // Action buttons
        if (options.actions) {
            const actionBtns = overlayEl.querySelectorAll('.gui-modal-footer .gui-btn');
            actionBtns.forEach((btn, index) => {
                const action = options.actions[index];
                btn.addEventListener('click', () => {
                    if (action.onClick) {
                        const result = action.onClick(modalInstance);
                        if (result !== false && action.closeOnClick !== false) {
                            closeModal(id);
                        }
                    } else {
                        closeModal(id);
                    }
                });
            });
        }

        // Show with animation
        requestAnimationFrame(() => {
            overlayEl.classList.add('visible');
        });

        return {
            id,
            element: overlayEl,
            getBody: () => overlayEl.querySelector('.gui-modal-body'),
            close: () => closeModal(id),
            setContent: (html) => {
                overlayEl.querySelector('.gui-modal-body').innerHTML = html;
            },
        };
    }

    /**
     * Close a modal
     */
    function closeModal(id) {
        const modal = modals.get(id);
        if (!modal) return;

        modal.element.classList.remove('visible');
        setTimeout(() => {
            modal.element.remove();
            modals.delete(id);
        }, 250);
    }

    /**
     * Show a confirmation dialog
     */
    function confirm(options) {
        return new Promise((resolve) => {
            showModal({
                id: 'confirm-dialog',
                title: options.title || 'Confirm',
                icon: options.icon || '❓',
                content: `<p>${options.message}</p>`,
                width: 400,
                actions: [
                    {
                        label: options.confirmLabel || 'OK',
                        primary: true,
                        onClick: () => { resolve(true); }
                    },
                    {
                        label: options.cancelLabel || 'Cancel',
                        onClick: () => { resolve(false); }
                    }
                ]
            });
        });
    }

    /**
     * Show an alert dialog
     */
    function alert(options) {
        return new Promise((resolve) => {
            showModal({
                id: 'alert-dialog',
                title: options.title || 'Alert',
                icon: options.icon || 'ℹ️',
                content: `<p>${options.message}</p>`,
                width: 400,
                actions: [
                    {
                        label: 'OK',
                        primary: true,
                        onClick: () => { resolve(); }
                    }
                ]
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FORM BUILDER COMPONENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Build a form from a schema
     *
     * @param {Object} options - Form configuration
     * @returns {Object} Form instance
     *
     * @example
     * const form = GUISimulator.buildForm({
     *     container: '#form-container',
     *     fields: [
     *         { id: 'firstName', type: 'text', label: 'First Name', required: true },
     *         { id: 'lastName', type: 'text', label: 'Last Name' },
     *         { id: 'department', type: 'select', label: 'Department', options: [...] }
     *     ]
     * });
     */
    function buildForm(options) {
        const container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;

        if (!container) {
            console.error('GUISimulator.buildForm: Container not found');
            return null;
        }

        const fields = options.fields || [];
        let html = '';

        fields.forEach(field => {
            const required = field.required ? ' required' : '';
            const requiredClass = field.required ? ' required' : '';

            if (field.type === 'row') {
                // Row of fields
                html += '<div class="gui-form-row">';
                field.fields.forEach(subField => {
                    html += _buildField(subField);
                });
                html += '</div>';
            } else {
                html += _buildField(field);
            }
        });

        container.innerHTML = html;

        // Return form helper
        return {
            getValues: () => {
                const values = {};
                fields.forEach(field => {
                    if (field.type === 'row') {
                        field.fields.forEach(subField => {
                            values[subField.id] = _getFieldValue(container, subField);
                        });
                    } else {
                        values[field.id] = _getFieldValue(container, field);
                    }
                });
                return values;
            },
            setValues: (values) => {
                Object.keys(values).forEach(key => {
                    const input = container.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = values[key];
                        } else {
                            input.value = values[key];
                        }
                    }
                });
            },
            validate: () => {
                let isValid = true;
                fields.forEach(field => {
                    if (field.type === 'row') {
                        field.fields.forEach(subField => {
                            if (!_validateField(container, subField)) isValid = false;
                        });
                    } else {
                        if (!_validateField(container, field)) isValid = false;
                    }
                });
                return isValid;
            },
            reset: () => {
                const inputs = container.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.type === 'checkbox') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                    input.classList.remove('error');
                });
                const errors = container.querySelectorAll('.gui-form-error');
                errors.forEach(el => el.remove());
            },
            getElement: (id) => container.querySelector(`[name="${id}"]`),
        };
    }

    function _buildField(field) {
        const required = field.required ? ' required' : '';
        const requiredClass = field.required ? ' required' : '';
        let html = `<div class="gui-form-group">`;

        if (field.type !== 'checkbox' && field.label) {
            html += `<label class="gui-form-label${requiredClass}">${field.label}</label>`;
        }

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
                html += `<input type="${field.type}" name="${field.id}" class="gui-form-input"
                         placeholder="${field.placeholder || ''}"${required}>`;
                break;

            case 'textarea':
                html += `<textarea name="${field.id}" class="gui-form-textarea"
                         placeholder="${field.placeholder || ''}"${required}></textarea>`;
                break;

            case 'select':
                html += `<select name="${field.id}" class="gui-form-select"${required}>`;
                if (field.placeholder) {
                    html += `<option value="">${field.placeholder}</option>`;
                }
                (field.options || []).forEach(opt => {
                    const value = typeof opt === 'object' ? opt.value : opt;
                    const label = typeof opt === 'object' ? opt.label : opt;
                    const selected = field.defaultValue === value ? ' selected' : '';
                    html += `<option value="${value}"${selected}>${label}</option>`;
                });
                html += '</select>';
                break;

            case 'checkbox':
                html += `<label class="gui-form-checkbox">
                    <input type="checkbox" name="${field.id}"${field.checked ? ' checked' : ''}>
                    ${field.label}
                </label>`;
                break;
        }

        if (field.hint) {
            html += `<div class="gui-form-hint">${field.hint}</div>`;
        }

        html += '</div>';
        return html;
    }

    function _getFieldValue(container, field) {
        const input = container.querySelector(`[name="${field.id}"]`);
        if (!input) return null;

        if (field.type === 'checkbox') {
            return input.checked;
        }
        return input.value;
    }

    function _validateField(container, field) {
        if (!field.required) return true;

        const input = container.querySelector(`[name="${field.id}"]`);
        if (!input) return true;

        const value = field.type === 'checkbox' ? input.checked : input.value.trim();

        // Remove existing error
        const existingError = input.parentElement.querySelector('.gui-form-error');
        if (existingError) existingError.remove();
        input.classList.remove('error');

        if (!value) {
            input.classList.add('error');
            const errorEl = document.createElement('div');
            errorEl.className = 'gui-form-error';
            errorEl.textContent = field.errorMessage || 'This field is required';
            input.parentElement.appendChild(errorEl);
            return false;
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TOOLBAR COMPONENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create a toolbar
     */
    function createToolbar(options) {
        const container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;

        if (!container) {
            console.error('GUISimulator.createToolbar: Container not found');
            return null;
        }

        container.className = 'gui-toolbar';
        _renderToolbar(container, options.items);

        return {
            setItems: (items) => _renderToolbar(container, items),
            enable: (id) => {
                const btn = container.querySelector(`[data-id="${id}"]`);
                if (btn) btn.disabled = false;
            },
            disable: (id) => {
                const btn = container.querySelector(`[data-id="${id}"]`);
                if (btn) btn.disabled = true;
            },
            highlight: (id, highlight = true) => {
                const btn = container.querySelector(`[data-id="${id}"]`);
                if (btn) btn.classList.toggle('highlight', highlight);
            },
        };
    }

    function _renderToolbar(container, items) {
        let html = '';

        items.forEach(item => {
            if (item.type === 'separator') {
                html += '<div class="gui-toolbar-separator"></div>';
            } else if (item.type === 'spacer') {
                html += '<div class="gui-toolbar-spacer"></div>';
            } else {
                const disabled = item.disabled ? ' disabled' : '';
                const primary = item.primary ? ' primary' : '';
                const highlight = item.highlight ? ' highlight' : '';
                html += `
                    <button class="gui-toolbar-btn${primary}${highlight}" data-id="${item.id || ''}"${disabled}>
                        ${item.icon ? `<span>${item.icon}</span>` : ''}
                        ${item.label || ''}
                    </button>
                `;
            }
        });

        container.innerHTML = html;

        // Attach click handlers
        const buttons = container.querySelectorAll('.gui-toolbar-btn');
        buttons.forEach((btn, index) => {
            const item = items.filter(i => i.type !== 'separator' && i.type !== 'spacer')[index];
            if (item && item.onClick) {
                btn.addEventListener('click', item.onClick);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS BAR COMPONENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create a status bar
     */
    function createStatusBar(options) {
        const container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;

        if (!container) {
            console.error('GUISimulator.createStatusBar: Container not found');
            return null;
        }

        container.className = 'gui-statusbar';

        const statusInstance = {
            container,
            leftItems: options.leftItems || [],
            rightItems: options.rightItems || [],
        };

        _renderStatusBar(statusInstance);

        return {
            setLeft: (items) => {
                statusInstance.leftItems = items;
                _renderStatusBar(statusInstance);
            },
            setRight: (items) => {
                statusInstance.rightItems = items;
                _renderStatusBar(statusInstance);
            },
            setMessage: (message, type = null) => {
                statusInstance.leftItems = [{ text: message, type }];
                _renderStatusBar(statusInstance);
            },
        };
    }

    function _renderStatusBar(statusInstance) {
        const { container, leftItems, rightItems } = statusInstance;

        const renderItems = (items) => items.map(item => {
            const typeClass = item.type ? ` ${item.type}` : '';
            return `
                <div class="gui-statusbar-item${typeClass}">
                    ${item.icon ? `<span>${item.icon}</span>` : ''}
                    ${item.text || ''}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="gui-statusbar-left">${renderItems(leftItems)}</div>
            <div class="gui-statusbar-right">${renderItems(rightItems)}</div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // APP: ACTIVE DIRECTORY USERS AND COMPUTERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create ADUC (Active Directory Users and Computers) simulation
     */
    function createADUC(options = {}) {
        const windowId = options.windowId || 'aduc-window';

        // Get initial state from WSAState
        const initialState = typeof WSAState !== 'undefined' ? WSAState.getState() : {};

        // ADUC state
        const aducState = {
            selectedNode: null,
            selectedObject: null,
            treeView: null,
            listView: null,
            statusBar: null,
        };

        // Build tree data from AD state
        function buildTreeData() {
            const domain = config.domain || 'hexworth.local';
            const state = typeof WSAState !== 'undefined' ? WSAState.getState() : {};
            const ous = Object.values(state.adOUs || {});

            const baseNodes = [
                { id: 'builtin', label: 'Builtin', icon: '📁' },
                { id: 'computers', label: 'Computers', icon: '💻' },
                { id: 'domain-controllers', label: 'Domain Controllers', icon: '🖥️' },
                { id: 'users', label: 'Users', icon: '👥' },
            ];

            // Add custom OUs
            ous.forEach(ou => {
                if (!['Domain Controllers', 'Servers', 'Workstations', 'Users', 'Employees', 'Groups'].includes(ou.Name)) {
                    baseNodes.push({
                        id: `ou-${ou.Name}`,
                        label: ou.Name,
                        icon: '📁',
                        data: ou,
                    });
                }
            });

            return [{
                id: 'root',
                label: domain,
                icon: '🏰',
                children: baseNodes,
            }];
        }

        // Get objects for selected container
        function getObjectsForNode(nodeId) {
            const state = typeof WSAState !== 'undefined' ? WSAState.getState() : {};
            const users = Object.values(state.adUsers || {});
            const groups = Object.values(state.adGroups || {});
            const computers = Object.values(state.adComputers || {});
            let items = [];

            switch (nodeId) {
                case 'users':
                    items = [
                        ...users.filter(u => {
                            const dn = u.DistinguishedName || '';
                            return dn.includes('CN=Users,') && !dn.includes('OU=');
                        }).map(u => ({
                            ...u,
                            _type: 'User',
                            icon: u.LockedOut ? '🔒' : '👤',
                        })),
                        ...groups.filter(g => {
                            const dn = g.DistinguishedName || '';
                            return dn.includes('CN=Users,');
                        }).map(g => ({
                            ...g,
                            _type: 'Group',
                            icon: '👥',
                        })),
                    ];
                    break;

                case 'computers':
                    items = computers.filter(c => {
                        const dn = c.DistinguishedName || '';
                        return !dn.includes('Domain Controllers');
                    }).map(c => ({
                        ...c,
                        _type: 'Computer',
                        icon: '💻',
                    }));
                    break;

                case 'domain-controllers':
                    items = computers.filter(c => {
                        const dn = c.DistinguishedName || '';
                        return dn.includes('Domain Controllers');
                    }).map(c => ({
                        ...c,
                        _type: 'Domain Controller',
                        icon: '🖥️',
                    }));
                    break;

                default:
                    // Custom OU
                    if (nodeId.startsWith('ou-')) {
                        const ouName = nodeId.replace('ou-', '');
                        items = [
                            ...users.filter(u => {
                                const dn = u.DistinguishedName || '';
                                return dn.includes(`OU=${ouName},`);
                            }).map(u => ({
                                ...u,
                                _type: 'User',
                                icon: u.LockedOut ? '🔒' : '👤',
                            })),
                            ...groups.filter(g => {
                                const dn = g.DistinguishedName || '';
                                return dn.includes(`OU=${ouName},`);
                            }).map(g => ({
                                ...g,
                                _type: 'Group',
                                icon: '👥',
                            })),
                        ];
                    }
            }

            return items;
        }

        // Create window content
        const content = `
            <div class="gui-menubar">
                <span class="gui-menu-item">File</span>
                <span class="gui-menu-item">Action</span>
                <span class="gui-menu-item">View</span>
                <span class="gui-menu-item">Help</span>
            </div>
            <div id="${windowId}-toolbar"></div>
            <div class="gui-split-layout">
                <div id="${windowId}-tree" style="width: 280px;"></div>
                <div id="${windowId}-list" class="gui-split-pane primary"></div>
            </div>
            <div id="${windowId}-statusbar"></div>
        `;

        // Create window
        const win = createWindow({
            id: windowId,
            title: 'Active Directory Users and Computers',
            icon: '👥',
            width: options.width || 950,
            height: options.height || 600,
            content,
            onStateChange: (state, prevState, action) => {
                // Refresh views when AD state changes
                if (action.type.startsWith('AD_')) {
                    aducState.treeView.setData(buildTreeData());
                    if (aducState.selectedNode) {
                        aducState.listView.setData(getObjectsForNode(aducState.selectedNode));
                    }
                }
            },
            onClose: options.onClose,
        });

        // Create toolbar
        aducState.toolbar = createToolbar({
            container: `#${windowId}-toolbar`,
            items: [
                { id: 'new-user', icon: '👤', label: 'New User', onClick: () => showNewUserDialog() },
                { id: 'new-group', icon: '👥', label: 'New Group', onClick: () => showNewGroupDialog() },
                { id: 'new-ou', icon: '📁', label: 'New OU', onClick: () => showNewOUDialog() },
                { type: 'separator' },
                { id: 'refresh', icon: '🔄', label: 'Refresh', onClick: () => {
                    aducState.treeView.setData(buildTreeData());
                    if (aducState.selectedNode) {
                        aducState.listView.setData(getObjectsForNode(aducState.selectedNode));
                    }
                }},
            ],
        });

        // Create tree view
        aducState.treeView = createTreeView({
            container: `#${windowId}-tree`,
            data: buildTreeData(),
            expandedIds: ['root'],
            onSelect: (nodeId, node) => {
                aducState.selectedNode = nodeId;
                aducState.listView.setData(getObjectsForNode(nodeId));
                aducState.statusBar.setMessage(`Selected: ${node?.label || nodeId}`);
            },
            onContextMenu: (nodeId, node, event) => {
                showContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    items: [
                        { icon: '📁', label: 'New → Organizational Unit', onClick: () => showNewOUDialog() },
                        { icon: '👤', label: 'New → User', onClick: () => showNewUserDialog() },
                        { icon: '👥', label: 'New → Group', onClick: () => showNewGroupDialog() },
                        { type: 'divider' },
                        { icon: '🔄', label: 'Refresh', onClick: () => {
                            aducState.treeView.setData(buildTreeData());
                            if (aducState.selectedNode) {
                                aducState.listView.setData(getObjectsForNode(aducState.selectedNode));
                            }
                        }},
                    ],
                });
            },
        });

        // Create list view
        aducState.listView = createListView({
            container: `#${windowId}-list`,
            columns: [
                { id: 'icon', label: '', width: 40 },
                { id: 'Name', label: 'Name', width: 180 },
                { id: '_type', label: 'Type', width: 120 },
                { id: 'Description', label: 'Description' },
            ],
            data: [],
            getIcon: (item) => item.icon || '📄',
            onSelect: (item) => {
                aducState.selectedObject = item;
            },
            onDoubleClick: (item) => {
                // Show properties
                showObjectProperties(item);
            },
            onContextMenu: (item, event) => {
                const items = [
                    { icon: '📋', label: 'Properties', onClick: () => showObjectProperties(item) },
                ];

                if (item._type === 'User') {
                    items.unshift(
                        { icon: '🔑', label: 'Reset Password...', onClick: () => showResetPasswordDialog(item) },
                        { icon: '👥', label: 'Add to a group...', onClick: () => showAddToGroupDialog(item) },
                        { type: 'divider' },
                    );

                    if (item.LockedOut) {
                        items.unshift({ icon: '🔓', label: 'Unlock Account', onClick: () => unlockAccount(item) });
                    }
                    if (item.Enabled) {
                        items.unshift({ icon: '🚫', label: 'Disable Account', onClick: () => disableAccount(item) });
                    } else {
                        items.unshift({ icon: '✓', label: 'Enable Account', onClick: () => enableAccount(item) });
                    }
                }

                showContextMenu({ x: event.clientX, y: event.clientY, items });
            },
            emptyMessage: 'Select a container to view objects.',
        });

        // Create status bar
        aducState.statusBar = createStatusBar({
            container: `#${windowId}-statusbar`,
            leftItems: [{ text: `Connected to: ${config.domain}` }],
            rightItems: [{ text: 'Ready' }],
        });

        // Dialog functions
        function showNewUserDialog() {
            const modal = showModal({
                id: 'new-user-dialog',
                title: 'New User',
                icon: '👤',
                width: 450,
                content: `
                    <div id="new-user-form"></div>
                    <div id="new-user-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">User created successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Create', primary: true, id: 'create', onClick: createUser },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#new-user-form',
                fields: [
                    { type: 'row', fields: [
                        { id: 'firstName', type: 'text', label: 'First name', placeholder: 'John' },
                        { id: 'lastName', type: 'text', label: 'Last name', placeholder: 'Smith' },
                    ]},
                    { id: 'samAccountName', type: 'text', label: 'User logon name', required: true, placeholder: 'jsmith', hint: `@${config.domain}` },
                    { id: 'password', type: 'password', label: 'Password', required: true, placeholder: 'Enter password' },
                    { id: 'mustChangePassword', type: 'checkbox', label: 'User must change password at next logon', checked: true },
                ],
            });

            function createUser() {
                if (!form.validate()) return false;

                const values = form.getValues();
                const samAccountName = values.samAccountName;
                const domain = config.domain;

                if (typeof WSAState !== 'undefined') {
                    WSAState.actions.createUser({
                        SamAccountName: samAccountName,
                        Name: `${values.firstName} ${values.lastName}`.trim() || samAccountName,
                        GivenName: values.firstName,
                        Surname: values.lastName,
                        UserPrincipalName: `${samAccountName}@${domain}`,
                        Enabled: true,
                        DistinguishedName: aducState.selectedNode?.startsWith('ou-')
                            ? `CN=${values.firstName} ${values.lastName},OU=${aducState.selectedNode.replace('ou-', '')},DC=${domain.replace('.', ',DC=')}`
                            : `CN=${values.firstName} ${values.lastName},CN=Users,DC=${domain.replace('.', ',DC=')}`,
                    }, 'gui');
                }

                document.getElementById('new-user-form').classList.add('gui-hidden');
                document.getElementById('new-user-success').classList.remove('gui-hidden');

                // Complete objective if callback provided
                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('create-user');
                }

                setTimeout(() => modal.close(), 1500);
                return false; // Keep modal open for success message
            }
        }

        function showNewGroupDialog() {
            const modal = showModal({
                id: 'new-group-dialog',
                title: 'New Group',
                icon: '👥',
                width: 450,
                content: `
                    <div id="new-group-form"></div>
                    <div id="new-group-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Group created successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Create', primary: true, onClick: createGroup },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#new-group-form',
                fields: [
                    { id: 'name', type: 'text', label: 'Group name', required: true, placeholder: 'IT Admins' },
                    { type: 'row', fields: [
                        { id: 'scope', type: 'select', label: 'Group scope', options: ['Global', 'Domain local', 'Universal'], defaultValue: 'Global' },
                        { id: 'type', type: 'select', label: 'Group type', options: ['Security', 'Distribution'], defaultValue: 'Security' },
                    ]},
                ],
            });

            function createGroup() {
                if (!form.validate()) return false;

                const values = form.getValues();
                const domain = config.domain;

                if (typeof WSAState !== 'undefined') {
                    WSAState.actions.createGroup({
                        Name: values.name,
                        GroupScope: values.scope,
                        GroupCategory: values.type,
                        DistinguishedName: aducState.selectedNode?.startsWith('ou-')
                            ? `CN=${values.name},OU=${aducState.selectedNode.replace('ou-', '')},DC=${domain.replace('.', ',DC=')}`
                            : `CN=${values.name},CN=Users,DC=${domain.replace('.', ',DC=')}`,
                    }, 'gui');
                }

                document.getElementById('new-group-form').classList.add('gui-hidden');
                document.getElementById('new-group-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('create-group');
                }

                setTimeout(() => modal.close(), 1500);
                return false;
            }
        }

        function showNewOUDialog() {
            const modal = showModal({
                id: 'new-ou-dialog',
                title: 'New Organizational Unit',
                icon: '📁',
                width: 400,
                content: `
                    <div id="new-ou-form"></div>
                    <div id="new-ou-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Organizational Unit created successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Create', primary: true, onClick: createOU },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#new-ou-form',
                fields: [
                    { id: 'name', type: 'text', label: 'Name', required: true, placeholder: 'IT Department' },
                    { id: 'protect', type: 'checkbox', label: 'Protect container from accidental deletion', checked: true },
                ],
            });

            function createOU() {
                if (!form.validate()) return false;

                const values = form.getValues();
                const domain = config.domain;

                if (typeof WSAState !== 'undefined') {
                    WSAState.actions.createOU({
                        Name: values.name,
                        DistinguishedName: `OU=${values.name},DC=${domain.replace('.', ',DC=')}`,
                        ProtectedFromAccidentalDeletion: values.protect,
                    }, 'gui');
                }

                document.getElementById('new-ou-form').classList.add('gui-hidden');
                document.getElementById('new-ou-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('create-ou');
                }

                setTimeout(() => modal.close(), 1500);
                return false;
            }
        }

        function showResetPasswordDialog(user) {
            const modal = showModal({
                id: 'reset-password-dialog',
                title: 'Reset Password',
                icon: '🔑',
                width: 400,
                content: `
                    <p class="gui-mb-3">Reset password for: <strong>${user.Name || user.SamAccountName}</strong></p>
                    <div id="reset-password-form"></div>
                    <div id="reset-password-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Password reset successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Reset', primary: true, onClick: resetPassword },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#reset-password-form',
                fields: [
                    { id: 'password', type: 'password', label: 'New password', required: true },
                    { id: 'confirmPassword', type: 'password', label: 'Confirm password', required: true },
                    { id: 'unlock', type: 'checkbox', label: 'Unlock user account', checked: user.LockedOut },
                ],
            });

            function resetPassword() {
                if (!form.validate()) return false;

                const values = form.getValues();

                if (values.password !== values.confirmPassword) {
                    GUISimulator.alert({
                        title: 'Error',
                        message: 'Passwords do not match.',
                        icon: '⚠️',
                    });
                    return false;
                }

                if (typeof WSAState !== 'undefined') {
                    WSAState.actions.resetPassword({
                        SamAccountName: user.SamAccountName,
                        unlock: values.unlock,
                    }, 'gui');
                }

                document.getElementById('reset-password-form').classList.add('gui-hidden');
                document.getElementById('reset-password-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('reset-password');
                }

                setTimeout(() => modal.close(), 1500);
                return false;
            }
        }

        function showAddToGroupDialog(user) {
            const state = typeof WSAState !== 'undefined' ? WSAState.getState() : {};
            const groups = Object.values(state.adGroups || {});

            const modal = showModal({
                id: 'add-to-group-dialog',
                title: 'Add to Group',
                icon: '👥',
                width: 400,
                content: `
                    <p class="gui-mb-3">Add <strong>${user.Name || user.SamAccountName}</strong> to group:</p>
                    <div id="add-to-group-form"></div>
                    <div id="add-to-group-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">User added to group successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Add', primary: true, onClick: addToGroup },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#add-to-group-form',
                fields: [
                    {
                        id: 'group',
                        type: 'select',
                        label: 'Group',
                        required: true,
                        options: groups.map(g => ({ value: g.Name, label: g.Name })),
                    },
                ],
            });

            function addToGroup() {
                if (!form.validate()) return false;

                const values = form.getValues();

                if (typeof WSAState !== 'undefined') {
                    WSAState.actions.addMember({
                        GroupName: values.group,
                        MemberName: user.SamAccountName,
                    }, 'gui');
                }

                document.getElementById('add-to-group-form').classList.add('gui-hidden');
                document.getElementById('add-to-group-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('add-member');
                }

                setTimeout(() => modal.close(), 1500);
                return false;
            }
        }

        function showObjectProperties(item) {
            GUISimulator.alert({
                title: `${item._type} Properties`,
                icon: item.icon,
                message: `
                    <strong>Name:</strong> ${item.Name}<br>
                    <strong>Type:</strong> ${item._type}<br>
                    ${item.SamAccountName ? `<strong>Logon Name:</strong> ${item.SamAccountName}<br>` : ''}
                    ${item.Description ? `<strong>Description:</strong> ${item.Description}<br>` : ''}
                    ${item.Enabled !== undefined ? `<strong>Enabled:</strong> ${item.Enabled ? 'Yes' : 'No'}<br>` : ''}
                    ${item.LockedOut !== undefined ? `<strong>Locked:</strong> ${item.LockedOut ? 'Yes' : 'No'}<br>` : ''}
                `,
            });
        }

        function unlockAccount(user) {
            if (typeof WSAState !== 'undefined') {
                WSAState.actions.unlockUser(user.SamAccountName, 'gui');
            }
            aducState.statusBar.setMessage(`Account unlocked: ${user.SamAccountName}`, 'success');

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('unlock-user-account');
            }
        }

        function enableAccount(user) {
            if (typeof WSAState !== 'undefined') {
                WSAState.actions.enableUser(user.SamAccountName, 'gui');
            }
            aducState.statusBar.setMessage(`Account enabled: ${user.SamAccountName}`, 'success');

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('enable-user-account');
            }
        }

        function disableAccount(user) {
            if (typeof WSAState !== 'undefined') {
                WSAState.actions.disableUser(user.SamAccountName, 'gui');
            }
            aducState.statusBar.setMessage(`Account disabled: ${user.SamAccountName}`, 'warning');

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('disable-user-account');
            }
        }

        // Select Users by default
        setTimeout(() => {
            aducState.treeView.expand('root');
            aducState.treeView.select('users');
        }, 100);

        return {
            window: win,
            refresh: () => {
                aducState.treeView.setData(buildTreeData());
                if (aducState.selectedNode) {
                    aducState.listView.setData(getObjectsForNode(aducState.selectedNode));
                }
            },
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // APP: DISK MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ┌─────────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: Disk Management MMC Snap-in                                        │
     * ├─────────────────────────────────────────────────────────────────────────────┤
     * │ The Disk Management console (diskmgmt.msc) is the GUI tool for managing     │
     * │ storage in Windows Server. It provides:                                     │
     * │                                                                             │
     * │ - Physical disk initialization (GPT vs MBR)                                 │
     * │ - Partition creation and deletion                                           │
     * │ - Volume formatting (NTFS, ReFS)                                            │
     * │ - Drive letter assignment                                                   │
     * │ - Status monitoring (Online, Offline, Failed)                               │
     * │                                                                             │
     * │ The graphical disk view shows colored bars representing partitions:         │
     * │ ┌─────────┬─────────────────────┬─────────────────────────────────┐         │
     * │ │ System  │ Windows (C:)        │ Data (D:)                       │         │
     * │ │ 100 MB  │ 237.37 GB NTFS      │ 500 GB NTFS                     │         │
     * │ └─────────┴─────────────────────┴─────────────────────────────────┘         │
     * │                                                                             │
     * │ PowerShell equivalents:                                                     │
     * │ Get-Disk, Initialize-Disk, New-Partition, Format-Volume, New-Volume         │
     * └─────────────────────────────────────────────────────────────────────────────┘
     *
     * Create Disk Management simulation
     * @param {Object} options - Configuration options
     * @returns {Object} DiskManagement instance
     */
    function createDiskManagement(options = {}) {
        const windowId = options.windowId || 'disk-mgmt-window';

        // Partition color scheme (matches real Windows Disk Management)
        const PARTITION_COLORS = {
            system: '#006400',      // Dark green for system/EFI
            boot: '#0078d4',        // Windows blue for boot/OS
            primary: '#3366cc',     // Blue for primary partitions
            recovery: '#8b0000',    // Dark red for recovery
            unallocated: '#000000', // Black for unallocated
            extended: '#228b22',    // Green for extended
            logical: '#4169e1',     // Royal blue for logical
            reserved: '#808080',    // Gray for reserved
        };

        // Disk status colors
        const STATUS_COLORS = {
            healthy: '#228b22',
            online: '#228b22',
            offline: '#cc0000',
            failed: '#cc0000',
            unknown: '#808080',
            foreign: '#ff8c00',
        };

        // Disk Management state
        const dmState = {
            selectedDisk: null,
            selectedVolume: null,
            volumeList: null,
            statusBar: null,
            disks: [],
            volumes: [],
        };

        // Get disks from WSAState or use defaults
        function getDisks() {
            const state = typeof WSAState !== 'undefined' ? WSAState.getState() : {};

            // If WSAState has disk data, use it
            if (state.disks && Object.keys(state.disks).length > 0) {
                return Object.values(state.disks);
            }

            // Default server disk configuration
            return options.disks || [
                {
                    Number: 0,
                    FriendlyName: 'Samsung SSD 980 PRO 500GB',
                    SerialNumber: 'S5GXNF0R123456',
                    Size: 500107862016,  // 500 GB
                    PartitionStyle: 'GPT',
                    OperationalStatus: 'Online',
                    HealthStatus: 'Healthy',
                    BusType: 'NVMe',
                    IsSystem: true,
                    IsBoot: true,
                    partitions: [
                        { Number: 1, Type: 'System', Size: 104857600, FileSystem: 'FAT32', DriveLetter: null, Label: 'EFI System Partition', IsSystem: true },
                        { Number: 2, Type: 'Reserved', Size: 16777216, FileSystem: null, DriveLetter: null, Label: 'Microsoft reserved partition' },
                        { Number: 3, Type: 'Primary', Size: 254942945280, FileSystem: 'NTFS', DriveLetter: 'C', Label: 'Windows', IsBoot: true },
                        { Number: 4, Type: 'Recovery', Size: 524288000, FileSystem: 'NTFS', DriveLetter: null, Label: 'Recovery' },
                    ],
                },
                {
                    Number: 1,
                    FriendlyName: 'WDC WD10EZEX-00WN4A0',
                    SerialNumber: 'WD-WMC3T0123456',
                    Size: 1000204886016,  // 1 TB
                    PartitionStyle: 'GPT',
                    OperationalStatus: 'Online',
                    HealthStatus: 'Healthy',
                    BusType: 'SATA',
                    IsSystem: false,
                    IsBoot: false,
                    partitions: [
                        { Number: 1, Type: 'Primary', Size: 500107862016, FileSystem: 'NTFS', DriveLetter: 'D', Label: 'Data' },
                        { Number: 2, Type: 'Unallocated', Size: 500097024000, FileSystem: null, DriveLetter: null, Label: null },
                    ],
                },
                {
                    Number: 2,
                    FriendlyName: 'Seagate Barracuda 2TB',
                    SerialNumber: 'Z8A00001',
                    Size: 2000398934016,  // 2 TB
                    PartitionStyle: 'RAW',
                    OperationalStatus: 'Offline',
                    HealthStatus: 'Healthy',
                    BusType: 'SATA',
                    IsSystem: false,
                    IsBoot: false,
                    IsOffline: true,
                    NeedsInitialization: true,
                    partitions: [],
                },
            ];
        }

        // Get volumes from disks
        function getVolumes() {
            const disks = getDisks();
            const volumes = [];

            disks.forEach(disk => {
                if (disk.partitions) {
                    disk.partitions.forEach(part => {
                        if (part.DriveLetter || (part.FileSystem && part.Type !== 'Unallocated')) {
                            volumes.push({
                                DriveLetter: part.DriveLetter,
                                Label: part.Label || '',
                                FileSystem: part.FileSystem,
                                Size: part.Size,
                                FreeSpace: part.FreeSpace || Math.floor(part.Size * 0.65),
                                Type: part.Type,
                                Status: 'Healthy',
                                DiskNumber: disk.Number,
                                PartitionNumber: part.Number,
                            });
                        }
                    });
                }
            });

            return volumes;
        }

        // Format bytes to human readable
        function formatSize(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
        }

        // Get partition color
        function getPartitionColor(partition) {
            const type = (partition.Type || '').toLowerCase();
            if (partition.IsSystem || type === 'system' || type === 'efi') return PARTITION_COLORS.system;
            if (partition.IsBoot || type === 'boot') return PARTITION_COLORS.boot;
            if (type === 'recovery') return PARTITION_COLORS.recovery;
            if (type === 'reserved') return PARTITION_COLORS.reserved;
            if (type === 'unallocated') return PARTITION_COLORS.unallocated;
            if (type === 'extended') return PARTITION_COLORS.extended;
            if (type === 'logical') return PARTITION_COLORS.logical;
            return PARTITION_COLORS.primary;
        }

        // Create window content
        const content = `
            <div class="gui-menubar">
                <span class="gui-menu-item">File</span>
                <span class="gui-menu-item">Action</span>
                <span class="gui-menu-item">View</span>
                <span class="gui-menu-item">Help</span>
            </div>
            <div id="${windowId}-toolbar"></div>
            <div class="gui-dm-container">
                <div class="gui-dm-volume-pane">
                    <div id="${windowId}-volume-list"></div>
                </div>
                <div class="gui-dm-disk-pane">
                    <div id="${windowId}-disk-view" class="gui-dm-disk-view"></div>
                </div>
            </div>
            <div id="${windowId}-statusbar"></div>
        `;

        // Create window
        const win = createWindow({
            id: windowId,
            title: 'Disk Management',
            icon: '💾',
            width: options.width || 1000,
            height: options.height || 650,
            content,
            onStateChange: (state, prevState, action) => {
                if (action.type.startsWith('STORAGE_') || action.type.startsWith('DISK_')) {
                    refreshViews();
                }
            },
            onClose: options.onClose,
        });

        // Create toolbar
        const toolbar = createToolbar({
            container: `#${windowId}-toolbar`,
            items: [
                { id: 'refresh', icon: '🔄', label: 'Rescan Disks', onClick: () => refreshViews() },
                { type: 'separator' },
                { id: 'online', icon: '▶️', label: 'Online', onClick: () => bringDiskOnline(), disabled: true },
                { id: 'offline', icon: '⏹️', label: 'Offline', onClick: () => takeDiskOffline(), disabled: true },
                { type: 'separator' },
                { id: 'properties', icon: '📋', label: 'Properties', onClick: () => showDiskProperties(), disabled: true },
            ],
        });

        // Attach menu bar handlers
        const menuItems = win.element.querySelectorAll('.gui-menu-item');
        const menuData = {
            'File': [
                { icon: '🔄', label: 'Rescan Disks', onClick: () => refreshViews() },
                { type: 'divider' },
                { icon: '❌', label: 'Exit', onClick: () => closeWindow(windowId) },
            ],
            'Action': [
                { icon: '⚙️', label: 'Initialize Disk...', onClick: () => {
                    if (dmState.selectedDisk?.NeedsInitialization) showInitializeDiskDialog(dmState.selectedDisk);
                }, disabled: !dmState.selectedDisk?.NeedsInitialization },
                { icon: '▶️', label: 'Online', onClick: () => bringDiskOnline(), disabled: dmState.selectedDisk?.OperationalStatus === 'Online' },
                { icon: '⏹️', label: 'Offline', onClick: () => takeDiskOffline(), disabled: dmState.selectedDisk?.OperationalStatus !== 'Online' },
                { type: 'divider' },
                { icon: '➕', label: 'New Simple Volume...', onClick: () => {
                    if (dmState.selectedDisk) showNewVolumeWizard(dmState.selectedDisk);
                } },
                { icon: '📝', label: 'Format...', onClick: () => {
                    if (dmState.selectedVolume?.FileSystem) showFormatDialog(dmState.selectedDisk, dmState.selectedVolume);
                } },
                { type: 'divider' },
                { icon: '📋', label: 'Properties', onClick: () => showDiskProperties() },
            ],
            'View': [
                { icon: '📊', label: 'Top - Volume List', onClick: () => {
                    const pane = win.element.querySelector('.gui-dm-volume-pane');
                    if (pane) {
                        pane.style.display = pane.style.display === 'none' ? 'block' : 'none';
                    }
                } },
                { icon: '💾', label: 'Bottom - Graphical View', onClick: () => {
                    const pane = win.element.querySelector('.gui-dm-disk-pane');
                    if (pane) {
                        pane.style.display = pane.style.display === 'none' ? 'block' : 'none';
                    }
                } },
                { type: 'divider' },
                { icon: '🔄', label: 'Refresh', onClick: () => refreshViews() },
                { icon: '📏', label: 'All disk info', onClick: () => {
                    const disks = getDisks();
                    let info = 'Disk Summary:\n\n';
                    disks.forEach(d => {
                        info += `Disk ${d.Number}: ${d.FriendlyName}\n`;
                        info += `  Size: ${formatSize(d.Size)} | ${d.PartitionStyle} | ${d.OperationalStatus}\n`;
                        info += `  Partitions: ${d.partitions?.length || 0}\n\n`;
                    });
                    GUISimulator.alert({ title: 'Disk Information', icon: '📏', message: info });
                } },
            ],
            'Help': [
                { icon: '❓', label: 'Disk Management Help', onClick: () => {
                    GUISimulator.alert({ title: 'Help', icon: '❓', message: 'Right-click on disks or partitions to see available actions.' });
                } },
                { type: 'divider' },
                { icon: 'ℹ️', label: 'About Disk Management', onClick: () => {
                    GUISimulator.alert({ title: 'About', icon: 'ℹ️', message: 'Disk Management Simulator\nHexworth Prime WSA Module' });
                } },
            ],
        };

        menuItems.forEach(menuItem => {
            const menuName = menuItem.textContent.trim();
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const items = menuData[menuName];
                if (items) {
                    const rect = menuItem.getBoundingClientRect();
                    showContextMenu({ x: rect.left, y: rect.bottom, items });
                }
            });
        });

        // Create volume list (top pane)
        function renderVolumeList() {
            const container = document.getElementById(`${windowId}-volume-list`);
            if (!container) return;

            const volumes = getVolumes();
            dmState.volumes = volumes;

            const listHtml = `
                <table class="gui-dm-volume-table">
                    <thead>
                        <tr>
                            <th style="width: 60px;">Volume</th>
                            <th style="width: 100px;">Layout</th>
                            <th style="width: 80px;">Type</th>
                            <th style="width: 80px;">File System</th>
                            <th style="width: 80px;">Status</th>
                            <th style="width: 100px;">Capacity</th>
                            <th style="width: 100px;">Free Space</th>
                            <th style="width: 60px;">% Free</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${volumes.map((vol, index) => {
                            const pctFree = vol.FreeSpace ? Math.round((vol.FreeSpace / vol.Size) * 100) : 0;
                            const selected = dmState.selectedVolume === vol ? ' selected' : '';
                            return `
                                <tr class="gui-dm-volume-row${selected}" data-index="${index}">
                                    <td>
                                        <span class="gui-dm-drive-icon">💿</span>
                                        ${vol.DriveLetter ? `(${vol.DriveLetter}:)` : ''}
                                    </td>
                                    <td>Simple</td>
                                    <td>${vol.Type || 'Basic'}</td>
                                    <td>${vol.FileSystem || ''}</td>
                                    <td class="status-${vol.Status?.toLowerCase() || 'healthy'}">
                                        ${vol.Status || 'Healthy'}
                                    </td>
                                    <td>${formatSize(vol.Size)}</td>
                                    <td>${vol.FreeSpace ? formatSize(vol.FreeSpace) : ''}</td>
                                    <td>${pctFree}%</td>
                                </tr>
                            `;
                        }).join('')}
                        ${volumes.length === 0 ? `
                            <tr>
                                <td colspan="8" class="gui-dm-empty">No volumes found</td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            `;

            container.innerHTML = listHtml;

            // Attach click handlers
            container.querySelectorAll('.gui-dm-volume-row').forEach(row => {
                row.addEventListener('click', () => {
                    container.querySelectorAll('.gui-dm-volume-row').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                    dmState.selectedVolume = volumes[parseInt(row.dataset.index)];
                    updateToolbarState();
                });

                row.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    row.click();
                    const vol = volumes[parseInt(row.dataset.index)];
                    showVolumeContextMenu(vol, e);
                });

                row.addEventListener('dblclick', () => {
                    const vol = volumes[parseInt(row.dataset.index)];
                    showVolumeProperties(vol);
                });
            });
        }

        // Render graphical disk view (bottom pane)
        function renderDiskView() {
            const container = document.getElementById(`${windowId}-disk-view`);
            if (!container) return;

            const disks = getDisks();
            dmState.disks = disks;

            let html = '';

            disks.forEach((disk, diskIndex) => {
                const totalSize = disk.Size;
                const isOnline = disk.OperationalStatus === 'Online';
                const needsInit = disk.NeedsInitialization || disk.PartitionStyle === 'RAW';
                const statusClass = isOnline ? 'online' : 'offline';

                html += `
                    <div class="gui-dm-disk-row" data-disk="${disk.Number}">
                        <div class="gui-dm-disk-info ${statusClass}">
                            <div class="gui-dm-disk-header">
                                <span class="gui-dm-disk-icon">💾</span>
                                <strong>Disk ${disk.Number}</strong>
                            </div>
                            <div class="gui-dm-disk-type">${disk.PartitionStyle === 'RAW' ? 'Unknown' : disk.PartitionStyle}</div>
                            <div class="gui-dm-disk-size">${formatSize(disk.Size)}</div>
                            <div class="gui-dm-disk-status ${statusClass}">${isOnline ? 'Online' : 'Offline'}</div>
                        </div>
                        <div class="gui-dm-partition-bar">
                `;

                if (needsInit) {
                    // Disk not initialized - show as single black unallocated block
                    html += `
                        <div class="gui-dm-partition unallocated not-initialized"
                             style="flex: 1; background-color: ${PARTITION_COLORS.unallocated};"
                             data-disk="${disk.Number}"
                             data-partition="unallocated"
                             title="Unallocated - ${formatSize(disk.Size)}">
                            <div class="gui-dm-partition-label">
                                <span class="gui-dm-partition-size">${formatSize(disk.Size)}</span>
                                <span class="gui-dm-partition-type">Not Initialized</span>
                            </div>
                        </div>
                    `;
                } else if (disk.partitions && disk.partitions.length > 0) {
                    // Show partitions
                    disk.partitions.forEach((part, partIndex) => {
                        const widthPct = (part.Size / totalSize) * 100;
                        const color = getPartitionColor(part);
                        const isUnalloc = part.Type?.toLowerCase() === 'unallocated';

                        html += `
                            <div class="gui-dm-partition${isUnalloc ? ' unallocated' : ''}"
                                 style="flex: ${widthPct}; background-color: ${color};"
                                 data-disk="${disk.Number}"
                                 data-partition="${part.Number}"
                                 title="${part.Label || part.Type || 'Partition'} - ${formatSize(part.Size)}">
                                <div class="gui-dm-partition-label">
                                    ${part.DriveLetter ? `<span class="gui-dm-partition-drive">${part.Label || ''} (${part.DriveLetter}:)</span>` :
                                      `<span class="gui-dm-partition-drive">${part.Label || part.Type || ''}</span>`}
                                    <span class="gui-dm-partition-size">${formatSize(part.Size)}</span>
                                    ${part.FileSystem ? `<span class="gui-dm-partition-fs">${part.FileSystem}</span>` : ''}
                                </div>
                            </div>
                        `;
                    });
                } else {
                    // Empty disk - show as single unallocated
                    html += `
                        <div class="gui-dm-partition unallocated"
                             style="flex: 1; background-color: ${PARTITION_COLORS.unallocated};"
                             data-disk="${disk.Number}"
                             data-partition="unallocated"
                             title="Unallocated - ${formatSize(disk.Size)}">
                            <div class="gui-dm-partition-label">
                                <span class="gui-dm-partition-size">${formatSize(disk.Size)}</span>
                                <span class="gui-dm-partition-type">Unallocated</span>
                            </div>
                        </div>
                    `;
                }

                html += `
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Attach click/context handlers to disk rows
            container.querySelectorAll('.gui-dm-disk-row').forEach(row => {
                const diskNum = parseInt(row.dataset.disk);
                const disk = disks.find(d => d.Number === diskNum);

                row.querySelector('.gui-dm-disk-info').addEventListener('click', () => {
                    container.querySelectorAll('.gui-dm-disk-row').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                    dmState.selectedDisk = disk;
                    dmState.selectedVolume = null;
                    updateToolbarState();
                    dmState.statusBar.setMessage(`Disk ${disk.Number}: ${disk.FriendlyName}`);
                });

                row.querySelector('.gui-dm-disk-info').addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    row.querySelector('.gui-dm-disk-info').click();
                    showDiskContextMenu(disk, e);
                });
            });

            // Attach click/context handlers to partitions
            container.querySelectorAll('.gui-dm-partition').forEach(partEl => {
                const diskNum = parseInt(partEl.dataset.disk);
                const partNum = partEl.dataset.partition;
                const disk = disks.find(d => d.Number === diskNum);

                partEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    container.querySelectorAll('.gui-dm-partition').forEach(p => p.classList.remove('selected'));
                    partEl.classList.add('selected');

                    if (partNum === 'unallocated') {
                        dmState.selectedDisk = disk;
                        dmState.selectedVolume = { Type: 'Unallocated', DiskNumber: diskNum };
                    } else {
                        const partition = disk.partitions?.find(p => p.Number === parseInt(partNum));
                        dmState.selectedDisk = disk;
                        dmState.selectedVolume = partition ? { ...partition, DiskNumber: diskNum } : null;
                    }
                    updateToolbarState();
                });

                partEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    partEl.click();
                    // Check for unallocated space - either by data attribute, CSS class, or partition type
                    const isUnallocated = partNum === 'unallocated' ||
                                          partEl.classList.contains('not-initialized') ||
                                          partEl.classList.contains('unallocated');
                    if (isUnallocated) {
                        showUnallocatedContextMenu(disk, e);
                    } else {
                        const partition = disk.partitions?.find(p => p.Number === parseInt(partNum));
                        if (partition) {
                            showPartitionContextMenu(disk, partition, e);
                        }
                    }
                });
            });
        }

        // Context menu for disk
        function showDiskContextMenu(disk, event) {
            const items = [];
            const needsInit = disk.NeedsInitialization || disk.PartitionStyle === 'RAW';
            const isOnline = disk.OperationalStatus === 'Online';

            if (needsInit) {
                items.push({
                    icon: '⚙️',
                    label: 'Initialize Disk',
                    onClick: () => showInitializeDiskDialog(disk),
                });
            }

            if (isOnline) {
                items.push({
                    icon: '⏹️',
                    label: 'Offline',
                    onClick: () => takeDiskOffline(disk),
                });
            } else {
                items.push({
                    icon: '▶️',
                    label: 'Online',
                    onClick: () => bringDiskOnline(disk),
                });
            }

            items.push({ type: 'divider' });
            items.push({
                icon: '📋',
                label: 'Properties',
                onClick: () => showDiskProperties(disk),
            });

            showContextMenu({ x: event.clientX, y: event.clientY, items });
        }

        // Context menu for unallocated space
        function showUnallocatedContextMenu(disk, event) {
            const needsInit = disk.NeedsInitialization || disk.PartitionStyle === 'RAW';

            const items = [];

            if (needsInit) {
                items.push({
                    icon: '⚙️',
                    label: 'Initialize Disk',
                    onClick: () => showInitializeDiskDialog(disk),
                });
                items.push({ type: 'divider' });
            }

            items.push({
                icon: '➕',
                label: 'New Simple Volume...',
                onClick: () => showNewVolumeWizard(disk),
                disabled: needsInit,
            });

            showContextMenu({ x: event.clientX, y: event.clientY, items });
        }

        // Context menu for partition
        function showPartitionContextMenu(disk, partition, event) {
            const items = [
                {
                    icon: '📂',
                    label: 'Open',
                    onClick: () => {
                        if (partition.DriveLetter) {
                            GUISimulator.alert({
                                title: 'Open Drive',
                                icon: '📂',
                                message: `Would open ${partition.DriveLetter}:\\ in File Explorer`,
                            });
                        }
                    },
                    disabled: !partition.DriveLetter,
                },
                { type: 'divider' },
                {
                    icon: '🔤',
                    label: 'Change Drive Letter and Paths...',
                    onClick: () => showChangeDriveLetterDialog(disk, partition),
                },
                {
                    icon: '📝',
                    label: 'Format...',
                    onClick: () => showFormatDialog(disk, partition),
                },
                { type: 'divider' },
                {
                    icon: '📊',
                    label: 'Extend Volume...',
                    onClick: () => showExtendVolumeDialog(disk, partition),
                },
                {
                    icon: '📉',
                    label: 'Shrink Volume...',
                    onClick: () => showShrinkVolumeDialog(disk, partition),
                },
                { type: 'divider' },
                {
                    icon: '🗑️',
                    label: 'Delete Volume...',
                    onClick: () => confirmDeleteVolume(disk, partition),
                    disabled: partition.IsSystem || partition.IsBoot,
                },
                { type: 'divider' },
                {
                    icon: '📋',
                    label: 'Properties',
                    onClick: () => showVolumeProperties({ ...partition, DiskNumber: disk.Number }),
                },
            ];

            showContextMenu({ x: event.clientX, y: event.clientY, items });
        }

        // Context menu for volume in list
        function showVolumeContextMenu(volume, event) {
            const disk = dmState.disks.find(d => d.Number === volume.DiskNumber);
            const partition = disk?.partitions?.find(p => p.Number === volume.PartitionNumber);

            if (partition) {
                showPartitionContextMenu(disk, partition, event);
            }
        }

        // Initialize Disk Dialog
        function showInitializeDiskDialog(disk) {
            const modal = showModal({
                id: 'init-disk-dialog',
                title: 'Initialize Disk',
                icon: '💾',
                width: 450,
                content: `
                    <p class="gui-mb-3">You must initialize a disk before Logical Disk Manager can access it.</p>
                    <div class="gui-dm-init-info gui-mb-3">
                        <strong>Disk ${disk.Number}:</strong> ${disk.FriendlyName}<br>
                        <strong>Size:</strong> ${formatSize(disk.Size)}
                    </div>
                    <div id="init-disk-form"></div>
                    <div id="init-disk-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Disk initialized successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'OK', primary: true, onClick: initializeDisk },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#init-disk-form',
                fields: [
                    {
                        id: 'partitionStyle',
                        type: 'select',
                        label: 'Select the partition style for the selected disks:',
                        options: [
                            { value: 'GPT', label: 'GPT (GUID Partition Table) - Recommended' },
                            { value: 'MBR', label: 'MBR (Master Boot Record)' },
                        ],
                        defaultValue: 'GPT',
                    },
                ],
            });

            function initializeDisk() {
                const values = form.getValues();

                // Update disk state
                disk.PartitionStyle = values.partitionStyle;
                disk.NeedsInitialization = false;
                disk.OperationalStatus = 'Online';
                disk.partitions = [{
                    Number: 1,
                    Type: 'Unallocated',
                    Size: disk.Size,
                    FileSystem: null,
                    DriveLetter: null,
                    Label: null,
                }];

                // Dispatch to WSAState if available
                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'STORAGE_INIT_DISK',
                        payload: {
                            DiskNumber: disk.Number,
                            PartitionStyle: values.partitionStyle,
                        },
                        source: 'gui',
                    });
                }

                document.getElementById('init-disk-form').classList.add('gui-hidden');
                document.getElementById('init-disk-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('initialize-disk');
                }

                setTimeout(() => {
                    modal.close();
                    refreshViews();
                }, 1500);

                return false;
            }
        }

        // New Simple Volume Wizard
        function showNewVolumeWizard(disk) {
            // Find unallocated space
            const unallocated = disk.partitions?.find(p => p.Type?.toLowerCase() === 'unallocated');
            const maxSize = unallocated ? unallocated.Size : disk.Size;
            const maxSizeMB = Math.floor(maxSize / (1024 * 1024));

            const modal = showModal({
                id: 'new-volume-wizard',
                title: 'New Simple Volume Wizard',
                icon: '💾',
                width: 500,
                content: `
                    <div class="gui-wizard-header gui-mb-4">
                        <h3>Welcome to the New Simple Volume Wizard</h3>
                        <p>This wizard helps you create a simple volume on a disk.</p>
                    </div>
                    <div id="new-volume-form"></div>
                    <div id="new-volume-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Volume created successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Create', primary: true, onClick: createVolume },
                    { label: 'Cancel' },
                ],
            });

            // Get available drive letters
            const usedLetters = new Set();
            dmState.disks.forEach(d => {
                d.partitions?.forEach(p => {
                    if (p.DriveLetter) usedLetters.add(p.DriveLetter);
                });
            });
            const availableLetters = [];
            for (let i = 68; i <= 90; i++) {  // D-Z
                const letter = String.fromCharCode(i);
                if (!usedLetters.has(letter)) {
                    availableLetters.push({ value: letter, label: `${letter}:` });
                }
            }

            const form = buildForm({
                container: '#new-volume-form',
                fields: [
                    {
                        id: 'size',
                        type: 'number',
                        label: `Volume size (MB): (Max: ${maxSizeMB.toLocaleString()} MB)`,
                        placeholder: maxSizeMB.toString(),
                        required: true,
                    },
                    {
                        id: 'driveLetter',
                        type: 'select',
                        label: 'Assign the following drive letter:',
                        options: availableLetters,
                        required: true,
                    },
                    {
                        id: 'fileSystem',
                        type: 'select',
                        label: 'File system:',
                        options: [
                            { value: 'NTFS', label: 'NTFS (Recommended)' },
                            { value: 'ReFS', label: 'ReFS' },
                            { value: 'exFAT', label: 'exFAT' },
                        ],
                        defaultValue: 'NTFS',
                    },
                    {
                        id: 'label',
                        type: 'text',
                        label: 'Volume label:',
                        placeholder: 'New Volume',
                    },
                    {
                        id: 'quickFormat',
                        type: 'checkbox',
                        label: 'Perform a quick format',
                        checked: true,
                    },
                ],
            });

            function createVolume() {
                if (!form.validate()) return false;

                const values = form.getValues();
                const sizeMB = parseInt(values.size) || maxSizeMB;
                const sizeBytes = sizeMB * 1024 * 1024;

                // Create the partition
                const newPartition = {
                    Number: (disk.partitions?.length || 0) + 1,
                    Type: 'Primary',
                    Size: Math.min(sizeBytes, maxSize),
                    FileSystem: values.fileSystem,
                    DriveLetter: values.driveLetter,
                    Label: values.label || 'New Volume',
                    FreeSpace: Math.min(sizeBytes, maxSize),
                };

                // Update disk partitions
                if (!disk.partitions) disk.partitions = [];

                // Remove or shrink unallocated space
                const unallocIdx = disk.partitions.findIndex(p => p.Type?.toLowerCase() === 'unallocated');
                if (unallocIdx >= 0) {
                    const remaining = disk.partitions[unallocIdx].Size - newPartition.Size;
                    if (remaining > 1024 * 1024) {
                        disk.partitions[unallocIdx].Size = remaining;
                        disk.partitions.splice(unallocIdx, 0, newPartition);
                    } else {
                        disk.partitions[unallocIdx] = newPartition;
                    }
                } else {
                    disk.partitions.push(newPartition);
                }

                // Dispatch to WSAState if available
                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'STORAGE_CREATE_PARTITION',
                        payload: {
                            DiskNumber: disk.Number,
                            Size: newPartition.Size,
                            DriveLetter: values.driveLetter,
                        },
                        source: 'gui',
                    });
                    WSAState.dispatch({
                        type: 'STORAGE_FORMAT_VOLUME',
                        payload: {
                            DriveLetter: values.driveLetter,
                            FileSystem: values.fileSystem,
                            FileSystemLabel: values.label || 'New Volume',
                            Size: newPartition.Size,
                        },
                        source: 'gui',
                    });
                }

                document.getElementById('new-volume-form').classList.add('gui-hidden');
                document.getElementById('new-volume-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('create-volume');
                }

                setTimeout(() => {
                    modal.close();
                    refreshViews();
                }, 1500);

                return false;
            }
        }

        // Format Volume Dialog
        function showFormatDialog(disk, partition) {
            const modal = showModal({
                id: 'format-dialog',
                title: 'Format',
                icon: '💾',
                width: 400,
                content: `
                    <p class="gui-mb-3 gui-text-warning">
                        <strong>⚠️ Warning:</strong> Formatting this volume will erase all data on it.
                    </p>
                    <div id="format-form"></div>
                    <div id="format-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Volume formatted successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'OK', primary: true, onClick: formatVolume },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#format-form',
                fields: [
                    {
                        id: 'label',
                        type: 'text',
                        label: 'Volume label:',
                        placeholder: partition.Label || 'New Volume',
                    },
                    {
                        id: 'fileSystem',
                        type: 'select',
                        label: 'File system:',
                        options: ['NTFS', 'ReFS', 'exFAT'],
                        defaultValue: partition.FileSystem || 'NTFS',
                    },
                    {
                        id: 'allocationUnit',
                        type: 'select',
                        label: 'Allocation unit size:',
                        options: [
                            { value: '4096', label: '4096 bytes (Default)' },
                            { value: '8192', label: '8192 bytes' },
                            { value: '16384', label: '16 KB' },
                            { value: '32768', label: '32 KB' },
                            { value: '65536', label: '64 KB' },
                        ],
                        defaultValue: '4096',
                    },
                    {
                        id: 'quickFormat',
                        type: 'checkbox',
                        label: 'Perform a quick format',
                        checked: true,
                    },
                ],
            });

            function formatVolume() {
                const values = form.getValues();

                partition.FileSystem = values.fileSystem;
                partition.Label = values.label || 'New Volume';
                partition.FreeSpace = partition.Size;

                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'STORAGE_FORMAT_VOLUME',
                        payload: {
                            DiskNumber: disk.Number,
                            PartitionNumber: partition.Number,
                            FileSystem: values.fileSystem,
                            Label: values.label,
                        },
                        source: 'gui',
                    });
                }

                document.getElementById('format-form').classList.add('gui-hidden');
                document.getElementById('format-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('format-volume');
                }

                setTimeout(() => {
                    modal.close();
                    refreshViews();
                }, 1500);

                return false;
            }
        }

        // Change Drive Letter Dialog
        function showChangeDriveLetterDialog(disk, partition) {
            const usedLetters = new Set();
            dmState.disks.forEach(d => {
                d.partitions?.forEach(p => {
                    if (p.DriveLetter && p !== partition) usedLetters.add(p.DriveLetter);
                });
            });
            const availableLetters = [{ value: '', label: '(None)' }];
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                if (!usedLetters.has(letter) || letter === partition.DriveLetter) {
                    availableLetters.push({ value: letter, label: `${letter}:` });
                }
            }

            const modal = showModal({
                id: 'change-letter-dialog',
                title: 'Change Drive Letter and Paths',
                icon: '🔤',
                width: 400,
                content: `
                    <p class="gui-mb-3">Change drive letter for: ${partition.Label || 'Volume'}</p>
                    <div id="change-letter-form"></div>
                `,
                actions: [
                    { label: 'OK', primary: true, onClick: changeLetter },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#change-letter-form',
                fields: [
                    {
                        id: 'driveLetter',
                        type: 'select',
                        label: 'Assign the following drive letter:',
                        options: availableLetters,
                        defaultValue: partition.DriveLetter || '',
                    },
                ],
            });

            function changeLetter() {
                const values = form.getValues();
                const oldLetter = partition.DriveLetter;
                partition.DriveLetter = values.driveLetter || null;

                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'STORAGE_CHANGE_DRIVE_LETTER',
                        payload: {
                            DiskNumber: disk.Number,
                            PartitionNumber: partition.Number,
                            OldDriveLetter: oldLetter,
                            NewDriveLetter: values.driveLetter,
                        },
                        source: 'gui',
                    });
                }

                refreshViews();
                dmState.statusBar.setMessage(`Drive letter changed to ${values.driveLetter || '(None)'}`, 'success');
            }
        }

        // Extend Volume Dialog
        function showExtendVolumeDialog(disk, partition) {
            // Find adjacent unallocated space
            const partIndex = disk.partitions.findIndex(p => p.Number === partition.Number);
            const nextPart = disk.partitions[partIndex + 1];
            const hasUnallocated = nextPart && nextPart.Type?.toLowerCase() === 'unallocated';
            const availableSpace = hasUnallocated ? nextPart.Size : 0;

            if (!hasUnallocated || availableSpace === 0) {
                GUISimulator.alert({
                    title: 'Extend Volume',
                    icon: '⚠️',
                    message: 'There is no adjacent unallocated space to extend into.\n\nTo extend a volume, you need unallocated space immediately following the partition.',
                });
                return;
            }

            const maxExtendMB = Math.floor(availableSpace / (1024 * 1024));
            const modal = showModal({
                id: 'extend-volume-dialog',
                title: 'Extend Volume',
                icon: '📊',
                width: 450,
                content: `
                    <div class="gui-mb-4">
                        <p>Extend volume <strong>${partition.DriveLetter ? `(${partition.DriveLetter}:)` : partition.Label || 'Partition'}</strong></p>
                        <p class="gui-text-muted gui-mt-2">Available space: ${formatSize(availableSpace)}</p>
                    </div>
                    <div id="extend-volume-form"></div>
                `,
                actions: [
                    { label: 'Extend', primary: true, onClick: doExtend },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#extend-volume-form',
                fields: [
                    {
                        id: 'extendSize',
                        type: 'number',
                        label: `Space to add (MB): (Max: ${maxExtendMB.toLocaleString()} MB)`,
                        placeholder: maxExtendMB.toString(),
                        required: true,
                    },
                ],
            });

            function doExtend() {
                const values = form.getValues();
                const extendMB = Math.min(parseInt(values.extendSize) || maxExtendMB, maxExtendMB);
                const extendBytes = extendMB * 1024 * 1024;

                // Extend the partition
                partition.Size += extendBytes;
                partition.FreeSpace = (partition.FreeSpace || 0) + extendBytes;

                // Shrink or remove unallocated space
                nextPart.Size -= extendBytes;
                if (nextPart.Size < 1024 * 1024) {
                    disk.partitions.splice(partIndex + 1, 1);
                }

                modal.close();
                refreshViews();
                dmState.statusBar.setMessage(`Volume extended by ${formatSize(extendBytes)}`, 'success');
                return false;
            }
        }

        // Shrink Volume Dialog
        function showShrinkVolumeDialog(disk, partition) {
            // Calculate available shrink space (simulate based on free space)
            const usedSpace = partition.Size - (partition.FreeSpace || partition.Size * 0.3);
            const availableShrink = partition.FreeSpace || partition.Size * 0.3;
            const maxShrinkMB = Math.floor(availableShrink / (1024 * 1024));

            if (maxShrinkMB < 1) {
                GUISimulator.alert({
                    title: 'Shrink Volume',
                    icon: '⚠️',
                    message: 'There is not enough free space to shrink this volume.\n\nThe volume must have free space that can be reclaimed.',
                });
                return;
            }

            const modal = showModal({
                id: 'shrink-volume-dialog',
                title: 'Shrink Volume',
                icon: '📉',
                width: 450,
                content: `
                    <div class="gui-mb-4">
                        <p>Shrink volume <strong>${partition.DriveLetter ? `(${partition.DriveLetter}:)` : partition.Label || 'Partition'}</strong></p>
                        <div class="gui-text-muted gui-mt-2" style="font-size: 0.85rem;">
                            <div>Total size: ${formatSize(partition.Size)}</div>
                            <div>Available shrink space: ${formatSize(availableShrink)}</div>
                        </div>
                    </div>
                    <div id="shrink-volume-form"></div>
                `,
                actions: [
                    { label: 'Shrink', primary: true, onClick: doShrink },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#shrink-volume-form',
                fields: [
                    {
                        id: 'shrinkSize',
                        type: 'number',
                        label: `Space to shrink (MB): (Max: ${maxShrinkMB.toLocaleString()} MB)`,
                        placeholder: Math.floor(maxShrinkMB / 2).toString(),
                        required: true,
                    },
                ],
            });

            function doShrink() {
                const values = form.getValues();
                const shrinkMB = Math.min(parseInt(values.shrinkSize) || maxShrinkMB, maxShrinkMB);
                const shrinkBytes = shrinkMB * 1024 * 1024;

                // Shrink the partition
                partition.Size -= shrinkBytes;
                partition.FreeSpace = Math.max(0, (partition.FreeSpace || 0) - shrinkBytes);

                // Create or expand unallocated space after this partition
                const partIndex = disk.partitions.findIndex(p => p.Number === partition.Number);
                const nextPart = disk.partitions[partIndex + 1];

                if (nextPart && nextPart.Type?.toLowerCase() === 'unallocated') {
                    nextPart.Size += shrinkBytes;
                } else {
                    // Insert new unallocated partition
                    disk.partitions.splice(partIndex + 1, 0, {
                        Number: partition.Number + 0.5, // Will be renumbered on refresh
                        Type: 'Unallocated',
                        Size: shrinkBytes,
                        FileSystem: null,
                        DriveLetter: null,
                        Label: null,
                    });
                }

                modal.close();
                refreshViews();
                dmState.statusBar.setMessage(`Volume shrunk by ${formatSize(shrinkBytes)}`, 'success');
                return false;
            }
        }

        // Confirm Delete Volume
        async function confirmDeleteVolume(disk, partition) {
            const confirmed = await GUISimulator.confirm({
                title: 'Delete Volume',
                icon: '⚠️',
                message: `Are you sure you want to delete the volume (${partition.DriveLetter || 'no drive letter'})? All data will be lost.`,
                confirmLabel: 'Yes',
                cancelLabel: 'No',
            });

            if (confirmed) {
                // Convert partition to unallocated
                partition.Type = 'Unallocated';
                partition.FileSystem = null;
                partition.DriveLetter = null;
                partition.Label = null;
                partition.FreeSpace = null;

                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'STORAGE_DELETE_VOLUME',
                        payload: {
                            DiskNumber: disk.Number,
                            PartitionNumber: partition.Number,
                        },
                        source: 'gui',
                    });
                }

                refreshViews();
                dmState.statusBar.setMessage('Volume deleted', 'warning');
            }
        }

        // Disk Properties
        function showDiskProperties(disk) {
            disk = disk || dmState.selectedDisk;
            if (!disk) return;

            GUISimulator.alert({
                title: `Disk ${disk.Number} Properties`,
                icon: '💾',
                message: `
                    <strong>Disk:</strong> Disk ${disk.Number}<br>
                    <strong>Type:</strong> ${disk.PartitionStyle}<br>
                    <strong>Status:</strong> ${disk.OperationalStatus}<br>
                    <strong>Capacity:</strong> ${formatSize(disk.Size)}<br>
                    <strong>Bus Type:</strong> ${disk.BusType || 'Unknown'}<br>
                    <strong>Model:</strong> ${disk.FriendlyName}<br>
                    <strong>Serial:</strong> ${disk.SerialNumber || 'N/A'}
                `,
            });
        }

        // Volume Properties
        function showVolumeProperties(volume) {
            const usedSpace = volume.Size - (volume.FreeSpace || 0);
            const pctUsed = Math.round((usedSpace / volume.Size) * 100);

            GUISimulator.alert({
                title: `${volume.Label || 'Volume'} (${volume.DriveLetter || 'No Letter'}:) Properties`,
                icon: '💿',
                message: `
                    <strong>Label:</strong> ${volume.Label || '(none)'}<br>
                    <strong>File System:</strong> ${volume.FileSystem || 'N/A'}<br>
                    <strong>Type:</strong> ${volume.Type || 'Basic'}<br>
                    <strong>Status:</strong> ${volume.Status || 'Healthy'}<br>
                    <hr style="margin: 8px 0; border-color: var(--gui-border);">
                    <strong>Capacity:</strong> ${formatSize(volume.Size)}<br>
                    <strong>Used Space:</strong> ${formatSize(usedSpace)} (${pctUsed}%)<br>
                    <strong>Free Space:</strong> ${formatSize(volume.FreeSpace || 0)}
                `,
            });
        }

        // Disk online/offline
        function bringDiskOnline(disk) {
            disk = disk || dmState.selectedDisk;
            if (!disk) return;

            disk.OperationalStatus = 'Online';
            disk.IsOffline = false;

            if (typeof WSAState !== 'undefined') {
                WSAState.dispatch({
                    type: 'DISK_ONLINE',
                    payload: { DiskNumber: disk.Number },
                    source: 'gui',
                });
            }

            refreshViews();
            dmState.statusBar.setMessage(`Disk ${disk.Number} is now online`, 'success');

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('disk-online');
            }
        }

        function takeDiskOffline(disk) {
            disk = disk || dmState.selectedDisk;
            if (!disk) return;

            if (disk.IsSystem || disk.IsBoot) {
                GUISimulator.alert({
                    title: 'Cannot Offline Disk',
                    icon: '⚠️',
                    message: 'This disk contains the system or boot partition and cannot be taken offline.',
                });
                return;
            }

            disk.OperationalStatus = 'Offline';
            disk.IsOffline = true;

            if (typeof WSAState !== 'undefined') {
                WSAState.dispatch({
                    type: 'DISK_OFFLINE',
                    payload: { DiskNumber: disk.Number },
                    source: 'gui',
                });
            }

            refreshViews();
            dmState.statusBar.setMessage(`Disk ${disk.Number} is now offline`, 'warning');
        }

        // Update toolbar state based on selection
        function updateToolbarState() {
            const hasDisk = !!dmState.selectedDisk;
            const isOffline = dmState.selectedDisk?.IsOffline;
            const isSystem = dmState.selectedDisk?.IsSystem || dmState.selectedDisk?.IsBoot;

            toolbar.enable('properties');

            if (hasDisk) {
                if (isOffline) {
                    toolbar.enable('online');
                    toolbar.disable('offline');
                } else {
                    toolbar.disable('online');
                    if (!isSystem) {
                        toolbar.enable('offline');
                    } else {
                        toolbar.disable('offline');
                    }
                }
            } else {
                toolbar.disable('online');
                toolbar.disable('offline');
            }
        }

        // Refresh all views
        function refreshViews() {
            renderVolumeList();
            renderDiskView();
            updateToolbarState();
        }

        // Create status bar
        dmState.statusBar = createStatusBar({
            container: `#${windowId}-statusbar`,
            leftItems: [{ text: `Disk Management - ${dmState.disks?.length || 0} disk(s)` }],
            rightItems: [{ text: 'Ready' }],
        });

        // Initial render
        refreshViews();

        return {
            window: win,
            refresh: refreshViews,
            getDisks: () => dmState.disks,
            getVolumes: () => dmState.volumes,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // APP: HYPER-V MANAGER
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ┌─────────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: Hyper-V Manager                                                   │
     * ├─────────────────────────────────────────────────────────────────────────────┤
     * │ Hyper-V Manager (virtmgmt.msc) is the GUI for managing Windows Server      │
     * │ virtualization. Key concepts:                                              │
     * │                                                                             │
     * │ Virtual Machines:                                                           │
     * │ ├─ Generation 1: Legacy BIOS, IDE boot, older OS support                   │
     * │ ├─ Generation 2: UEFI, Secure Boot, modern Windows/Linux                   │
     * │                                                                             │
     * │ Virtual Switches:                                                           │
     * │ ├─ External: Bridge to physical NIC (VMs access network)                   │
     * │ ├─ Internal: Host + VMs only (no external network)                         │
     * │ └─ Private: VMs only (isolated sandbox)                                    │
     * │                                                                             │
     * │ Checkpoints (Snapshots):                                                    │
     * │ └─ Point-in-time VM state for rollback                                     │
     * └─────────────────────────────────────────────────────────────────────────────┘
     *
     * Create Hyper-V Manager simulation
     * @param {Object} options - Configuration options
     * @returns {Object} HyperVManager instance
     */
    function createHyperVManager(options = {}) {
        const windowId = options.windowId || 'hyperv-manager-window';

        // VM state icons
        const VM_STATE_ICONS = {
            Running: '▶️',
            Off: '⏹️',
            Saved: '💾',
            Paused: '⏸️',
            Starting: '🔄',
            Stopping: '🔄',
        };

        // Hyper-V Manager state
        const hvState = {
            selectedVM: null,
            selectedSwitch: null,
            vmList: null,
            treeView: null,
            statusBar: null,
            vms: [],
            switches: [],
            checkpoints: {},
            uptimeTimer: null,
            vmStartTimes: {}, // Track when each VM was started
            currentView: 'vms', // Track active tree view for timer guard
        };

        // Parse uptime string to seconds (e.g., "2.14:32:05" -> seconds)
        function parseUptimeToSeconds(uptimeStr) {
            if (!uptimeStr || uptimeStr === '0:00:00') return 0;

            const parts = uptimeStr.split('.');
            let days = 0;
            let timePart = uptimeStr;

            if (parts.length === 2) {
                days = parseInt(parts[0], 10);
                timePart = parts[1];
            }

            const timeParts = timePart.split(':');
            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;
            const seconds = parseInt(timeParts[2], 10) || 0;

            return (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
        }

        // Format seconds to uptime string (e.g., seconds -> "2.14:32:05")
        function formatUptime(totalSeconds) {
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            return days > 0 ? `${days}.${timeStr}` : timeStr;
        }

        // Start the uptime timer
        function startUptimeTimer() {
            if (hvState.uptimeTimer) return;

            hvState.uptimeTimer = setInterval(() => {
                let needsUpdate = false;

                hvState.vms.forEach(vm => {
                    if (vm.State === 'Running' && hvState.vmStartTimes[vm.Name]) {
                        const elapsed = Math.floor((Date.now() - hvState.vmStartTimes[vm.Name]) / 1000);
                        vm.Uptime = formatUptime(elapsed);
                        needsUpdate = true;
                    }
                });

                if (needsUpdate && hvState.currentView === 'vms') {
                    renderVMList();
                }
            }, 1000);
        }

        // Stop the uptime timer
        function stopUptimeTimer() {
            if (hvState.uptimeTimer) {
                clearInterval(hvState.uptimeTimer);
                hvState.uptimeTimer = null;
            }
        }

        // Get VMs from WSAState or use defaults
        function getVMs() {
            const state = typeof WSAState !== 'undefined' ? WSAState.getState() : {};

            if (state.vms && Object.keys(state.vms).length > 0) {
                return Object.values(state.vms);
            }

            return options.vms || [
                {
                    Name: 'DC02',
                    State: 'Running',
                    CPUUsage: 12,
                    MemoryAssigned: 4294967296, // 4 GB
                    MemoryDemand: 2147483648,
                    Uptime: '2.14:32:05',
                    Status: 'Operating normally',
                    Version: '9.0',
                    Generation: 2,
                    Notes: 'Secondary Domain Controller',
                    ProcessorCount: 2,
                    DynamicMemoryEnabled: true,
                    MemoryMinimum: 536870912,
                    MemoryMaximum: 8589934592,
                    MemoryStartup: 2147483648,
                    Checkpoints: ['Before Updates', 'Baseline Config'],
                },
                {
                    Name: 'FS01',
                    State: 'Running',
                    CPUUsage: 3,
                    MemoryAssigned: 2147483648, // 2 GB
                    MemoryDemand: 1073741824,
                    Uptime: '5.08:15:22',
                    Status: 'Operating normally',
                    Version: '9.0',
                    Generation: 2,
                    Notes: 'File Server',
                    ProcessorCount: 2,
                    DynamicMemoryEnabled: true,
                    MemoryMinimum: 536870912,
                    MemoryMaximum: 4294967296,
                    MemoryStartup: 2147483648,
                    Checkpoints: [],
                },
                {
                    Name: 'WEB01',
                    State: 'Off',
                    CPUUsage: 0,
                    MemoryAssigned: 0,
                    MemoryDemand: 0,
                    Uptime: '0:00:00',
                    Status: 'Off',
                    Version: '9.0',
                    Generation: 2,
                    Notes: 'Web Server - IIS',
                    ProcessorCount: 4,
                    DynamicMemoryEnabled: false,
                    MemoryMinimum: 2147483648,
                    MemoryMaximum: 2147483648,
                    MemoryStartup: 2147483648,
                    Checkpoints: ['Pre-deployment'],
                },
                {
                    Name: 'SQL01',
                    State: 'Saved',
                    CPUUsage: 0,
                    MemoryAssigned: 0,
                    MemoryDemand: 0,
                    Uptime: '0:00:00',
                    Status: 'Saved',
                    Version: '9.0',
                    Generation: 2,
                    Notes: 'SQL Server Database',
                    ProcessorCount: 4,
                    DynamicMemoryEnabled: false,
                    MemoryMinimum: 8589934592,
                    MemoryMaximum: 8589934592,
                    MemoryStartup: 8589934592,
                    Checkpoints: [],
                },
            ];
        }

        // Get virtual switches
        function getSwitches() {
            const state = typeof WSAState !== 'undefined' ? WSAState.getState() : {};

            if (state.vmSwitches && Object.keys(state.vmSwitches).length > 0) {
                return Object.values(state.vmSwitches);
            }

            return options.switches || [
                {
                    Name: 'External Network',
                    SwitchType: 'External',
                    NetAdapterInterfaceDescription: 'Intel(R) Ethernet Controller I225-V',
                    AllowManagementOS: true,
                },
                {
                    Name: 'Internal Network',
                    SwitchType: 'Internal',
                    NetAdapterInterfaceDescription: '',
                    AllowManagementOS: true,
                },
                {
                    Name: 'Private Lab',
                    SwitchType: 'Private',
                    NetAdapterInterfaceDescription: '',
                    AllowManagementOS: false,
                },
            ];
        }

        // Format bytes to human readable
        function formatSize(bytes, decimals = 1) {
            if (!bytes || bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
        }

        // Create window content
        const content = `
            <div class="gui-menubar">
                <span class="gui-menu-item">File</span>
                <span class="gui-menu-item">Action</span>
                <span class="gui-menu-item">View</span>
                <span class="gui-menu-item">Help</span>
            </div>
            <div id="${windowId}-toolbar"></div>
            <div class="gui-split-layout">
                <div id="${windowId}-tree" style="width: 220px;"></div>
                <div id="${windowId}-main" class="gui-split-pane primary gui-hv-main"></div>
            </div>
            <div id="${windowId}-statusbar"></div>
        `;

        // Create window
        const win = createWindow({
            id: windowId,
            title: 'Hyper-V Manager',
            icon: '🖥️',
            width: options.width || 1050,
            height: options.height || 650,
            content,
            onStateChange: (state, prevState, action) => {
                if (action.type.startsWith('VM_')) {
                    refreshViews();
                }
            },
            onClose: options.onClose,
        });

        // Build tree data
        function buildTreeData() {
            const hostname = config.hostname || 'DC01';
            return [{
                id: 'host',
                label: hostname,
                icon: '🖥️',
                children: [
                    { id: 'vms', label: 'Virtual Machines', icon: '📦' },
                    { id: 'switches', label: 'Virtual Switch Manager', icon: '🔌' },
                    { id: 'checkpoints', label: 'Checkpoints', icon: '📸' },
                ],
            }];
        }

        // Create toolbar
        const toolbar = createToolbar({
            container: `#${windowId}-toolbar`,
            items: [
                { id: 'new-vm', icon: '➕', label: 'New', onClick: () => showNewVMWizard() },
                { type: 'separator' },
                { id: 'start', icon: '▶️', label: 'Start', onClick: () => startVM(), disabled: true },
                { id: 'stop', icon: '⏹️', label: 'Turn Off', onClick: () => stopVM(), disabled: true },
                { id: 'save', icon: '💾', label: 'Save', onClick: () => saveVM(), disabled: true },
                { id: 'pause', icon: '⏸️', label: 'Pause', onClick: () => pauseVM(), disabled: true },
                { type: 'separator' },
                { id: 'checkpoint', icon: '📸', label: 'Checkpoint', onClick: () => createCheckpoint(), disabled: true },
                { type: 'separator' },
                { id: 'settings', icon: '⚙️', label: 'Settings', onClick: () => showVMSettings(), disabled: true },
                { id: 'connect', icon: '🖥️', label: 'Connect', onClick: () => connectVM(), disabled: true },
            ],
        });

        // Create tree view
        hvState.treeView = createTreeView({
            container: `#${windowId}-tree`,
            data: buildTreeData(),
            expandedIds: ['host'],
            onSelect: (nodeId, node) => {
                hvState.selectedVM = null;
                hvState.selectedSwitch = null;
                updateToolbarState();

                switch (nodeId) {
                    case 'host':
                    case 'vms':
                        hvState.currentView = 'vms';
                        renderVMList();
                        break;
                    case 'switches':
                        hvState.currentView = 'switches';
                        renderSwitchList();
                        break;
                    case 'checkpoints':
                        hvState.currentView = 'checkpoints';
                        renderCheckpointList();
                        break;
                }
            },
        });

        // Render VM list
        function renderVMList() {
            const container = document.getElementById(`${windowId}-main`);
            if (!container) return;

            const vms = getVMs();
            hvState.vms = vms;

            let html = `
                <div class="gui-hv-vm-header">Virtual Machines</div>
                <table class="gui-hv-vm-table">
                    <thead>
                        <tr>
                            <th style="width: 30px;"></th>
                            <th style="width: 150px;">Name</th>
                            <th style="width: 80px;">State</th>
                            <th style="width: 70px;">CPU %</th>
                            <th style="width: 100px;">Assigned Memory</th>
                            <th style="width: 100px;">Uptime</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vms.map((vm, i) => `
                            <tr class="gui-hv-vm-row" data-index="${i}">
                                <td class="gui-hv-vm-icon">${VM_STATE_ICONS[vm.State] || '❓'}</td>
                                <td class="gui-hv-vm-name">${vm.Name}</td>
                                <td class="gui-hv-vm-state state-${vm.State.toLowerCase()}">${vm.State}</td>
                                <td>${vm.State === 'Running' ? vm.CPUUsage + '%' : '-'}</td>
                                <td>${vm.State === 'Running' ? formatSize(vm.MemoryAssigned) : '-'}</td>
                                <td>${vm.State === 'Running' ? vm.Uptime : '-'}</td>
                                <td>${vm.Status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            container.innerHTML = html;

            // Attach handlers
            container.querySelectorAll('.gui-hv-vm-row').forEach(row => {
                row.addEventListener('click', () => {
                    container.querySelectorAll('.gui-hv-vm-row').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                    hvState.selectedVM = vms[parseInt(row.dataset.index)];
                    updateToolbarState();
                    hvState.statusBar.setMessage(`Selected: ${hvState.selectedVM.Name}`);
                });

                row.addEventListener('dblclick', () => {
                    const vm = vms[parseInt(row.dataset.index)];
                    showVMSettings(vm);
                });

                row.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    row.click();
                    const vm = vms[parseInt(row.dataset.index)];
                    showVMContextMenu(vm, e);
                });
            });
        }

        // Render switch list
        function renderSwitchList() {
            const container = document.getElementById(`${windowId}-main`);
            if (!container) return;

            const switches = getSwitches();
            hvState.switches = switches;

            let html = `
                <div class="gui-hv-vm-header">Virtual Switches</div>
                <table class="gui-hv-vm-table">
                    <thead>
                        <tr>
                            <th style="width: 30px;">🔌</th>
                            <th style="width: 180px;">Name</th>
                            <th style="width: 100px;">Type</th>
                            <th>External Network Adapter</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${switches.map((sw, i) => `
                            <tr class="gui-hv-vm-row" data-index="${i}">
                                <td class="gui-hv-vm-icon">${sw.SwitchType === 'External' ? '🌐' : sw.SwitchType === 'Internal' ? '🔗' : '🔒'}</td>
                                <td>${sw.Name}</td>
                                <td>${sw.SwitchType}</td>
                                <td>${sw.NetAdapterInterfaceDescription || '(none)'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="padding: 15px;">
                    <button class="gui-btn primary" id="${windowId}-create-switch-btn">
                        Create Virtual Switch
                    </button>
                </div>
            `;

            container.innerHTML = html;

            const createBtn = document.getElementById(`${windowId}-create-switch-btn`);
            if (createBtn) createBtn.addEventListener('click', showNewSwitchDialog);
        }

        // Create virtual switch dialog
        function showNewSwitchDialog() {
            const modal = showModal({
                id: 'new-switch-dialog',
                title: 'Virtual Switch Manager',
                icon: '🔌',
                width: 450,
                content: `
                    <div class="gui-wizard-header gui-mb-4">
                        <h3>Create Virtual Switch</h3>
                        <p>Create a new virtual switch for your virtual machines.</p>
                    </div>
                    <div id="new-switch-form"></div>
                    <div id="new-switch-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Virtual switch created successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Create', primary: true, onClick: doCreateSwitch },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#new-switch-form',
                fields: [
                    {
                        id: 'name',
                        type: 'text',
                        label: 'Name:',
                        required: true,
                        placeholder: 'BranchExternal',
                    },
                    {
                        id: 'switchType',
                        type: 'select',
                        label: 'Connection type:',
                        options: [
                            { value: 'External', label: 'External network' },
                            { value: 'Internal', label: 'Internal network' },
                            { value: 'Private', label: 'Private network' },
                        ],
                        defaultValue: 'External',
                    },
                ],
            });

            function doCreateSwitch() {
                if (!form.validate()) return false;

                const values = form.getValues();

                const newSwitch = {
                    Name: values.name,
                    SwitchType: values.switchType,
                    NetAdapterInterfaceDescription: values.switchType === 'External' ? 'Intel(R) Ethernet Controller I225-V' : '',
                    AllowManagementOS: values.switchType !== 'Private',
                };

                hvState.switches.push(newSwitch);

                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'VMSWITCH_CREATE',
                        payload: newSwitch,
                        source: 'gui',
                    });
                }

                document.getElementById('new-switch-form').classList.add('gui-hidden');
                document.getElementById('new-switch-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('create-switch');
                }

                setTimeout(() => {
                    modal.close();
                    renderSwitchList();
                }, 1500);

                return false;
            }
        }

        // Render checkpoint list
        function renderCheckpointList() {
            const container = document.getElementById(`${windowId}-main`);
            if (!container) return;

            const vms = getVMs();
            const allCheckpoints = [];

            vms.forEach(vm => {
                if (vm.Checkpoints && vm.Checkpoints.length > 0) {
                    vm.Checkpoints.forEach(cp => {
                        allCheckpoints.push({
                            vmName: vm.Name,
                            checkpointName: cp,
                        });
                    });
                }
            });

            let html = `
                <div class="gui-hv-vm-header">Checkpoints</div>
                <table class="gui-hv-vm-table">
                    <thead>
                        <tr>
                            <th style="width: 30px;">📸</th>
                            <th style="width: 180px;">Virtual Machine</th>
                            <th>Checkpoint Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allCheckpoints.length > 0 ? allCheckpoints.map((cp, i) => `
                            <tr class="gui-hv-vm-row" data-index="${i}">
                                <td class="gui-hv-vm-icon">📸</td>
                                <td>${cp.vmName}</td>
                                <td>${cp.checkpointName}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="3" style="text-align: center; padding: 20px; color: var(--gui-text-muted);">
                                    No checkpoints found. Select a VM and create a checkpoint.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            `;

            container.innerHTML = html;
        }

        // VM Context Menu
        function showVMContextMenu(vm, event) {
            const isRunning = vm.State === 'Running';
            const isOff = vm.State === 'Off';
            const isSaved = vm.State === 'Saved';

            const items = [
                {
                    icon: '🖥️',
                    label: 'Connect...',
                    onClick: () => connectVM(vm),
                },
                { type: 'divider' },
                {
                    icon: '⚙️',
                    label: 'Settings...',
                    onClick: () => showVMSettings(vm),
                },
                { type: 'divider' },
                {
                    icon: '▶️',
                    label: 'Start',
                    onClick: () => startVM(vm),
                    disabled: isRunning,
                },
                {
                    icon: '⏹️',
                    label: 'Turn Off',
                    onClick: () => stopVM(vm),
                    disabled: !isRunning,
                },
                {
                    icon: '🔻',
                    label: 'Shut Down',
                    onClick: () => shutdownVM(vm),
                    disabled: !isRunning,
                },
                {
                    icon: '💾',
                    label: 'Save',
                    onClick: () => saveVM(vm),
                    disabled: !isRunning,
                },
                {
                    icon: '⏸️',
                    label: 'Pause',
                    onClick: () => pauseVM(vm),
                    disabled: !isRunning,
                },
                {
                    icon: '🔄',
                    label: 'Reset',
                    onClick: () => resetVM(vm),
                    disabled: !isRunning,
                },
                { type: 'divider' },
                {
                    icon: '📸',
                    label: 'Checkpoint',
                    onClick: () => createCheckpoint(vm),
                },
                { type: 'divider' },
                {
                    icon: '🗑️',
                    label: 'Delete...',
                    onClick: () => deleteVM(vm),
                    disabled: isRunning,
                },
            ];

            showContextMenu({ x: event.clientX, y: event.clientY, items });
        }

        // VM Operations
        function startVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm || vm.State === 'Running') return;

            vm.State = 'Running';
            vm.CPUUsage = Math.floor(Math.random() * 20) + 5;
            vm.MemoryAssigned = vm.MemoryStartup;
            vm.Uptime = '0:00:00';
            vm.Status = 'Operating normally';

            // Track start time for uptime calculation
            hvState.vmStartTimes[vm.Name] = Date.now();
            startUptimeTimer();

            if (typeof WSAState !== 'undefined') {
                WSAState.dispatch({
                    type: 'VM_START',
                    payload: { Name: vm.Name },
                    source: 'gui',
                });
            }

            renderVMList();
            hvState.statusBar.setMessage(`${vm.Name} started`, 'success');

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('start-vm');
            }
        }

        function stopVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm || vm.State !== 'Running') return;

            vm.State = 'Off';
            vm.CPUUsage = 0;
            vm.MemoryAssigned = 0;
            vm.Uptime = '0:00:00';
            vm.Status = 'Off';

            // Clear start time
            delete hvState.vmStartTimes[vm.Name];

            if (typeof WSAState !== 'undefined') {
                WSAState.dispatch({
                    type: 'VM_STOP',
                    payload: { Name: vm.Name },
                    source: 'gui',
                });
            }

            renderVMList();
            hvState.statusBar.setMessage(`${vm.Name} turned off`, 'warning');

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('stop-vm');
            }
        }

        function saveVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm || vm.State !== 'Running') return;

            vm.State = 'Saved';
            vm.CPUUsage = 0;
            vm.MemoryAssigned = 0;
            vm.Uptime = '0:00:00';
            vm.Status = 'Saved';

            // Clear start time
            delete hvState.vmStartTimes[vm.Name];

            renderVMList();
            hvState.statusBar.setMessage(`${vm.Name} saved`, 'success');
        }

        function pauseVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm || vm.State !== 'Running') return;

            vm.State = 'Paused';
            vm.Status = 'Paused';

            renderVMList();
            hvState.statusBar.setMessage(`${vm.Name} paused`);
        }

        function shutdownVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm || vm.State !== 'Running') return;

            hvState.statusBar.setMessage(`Sending shutdown signal to ${vm.Name}...`);

            setTimeout(() => {
                vm.State = 'Off';
                vm.CPUUsage = 0;
                vm.MemoryAssigned = 0;
                vm.Uptime = '0:00:00';
                vm.Status = 'Off';

                // Clear start time
                delete hvState.vmStartTimes[vm.Name];

                renderVMList();
                hvState.statusBar.setMessage(`${vm.Name} shut down gracefully`, 'success');
            }, 1500);
        }

        function resetVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm || vm.State !== 'Running') return;

            hvState.statusBar.setMessage(`Resetting ${vm.Name}...`);

            // Reset start time
            hvState.vmStartTimes[vm.Name] = Date.now();
            vm.Uptime = '0:00:00';
            renderVMList();

            setTimeout(() => {
                hvState.statusBar.setMessage(`${vm.Name} reset complete`, 'success');
            }, 1000);
        }

        function createCheckpoint(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm) return;

            const checkpointName = `Checkpoint ${new Date().toLocaleString()}`;

            if (!vm.Checkpoints) vm.Checkpoints = [];
            vm.Checkpoints.push(checkpointName);

            if (typeof WSAState !== 'undefined') {
                WSAState.dispatch({
                    type: 'VM_CHECKPOINT',
                    payload: { VMName: vm.Name, SnapshotName: checkpointName },
                    source: 'gui',
                });
            }

            hvState.statusBar.setMessage(`Checkpoint created for ${vm.Name}`, 'success');

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('create-checkpoint');
            }
        }

        async function deleteVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm || vm.State === 'Running') return;

            const confirmed = await GUISimulator.confirm({
                title: 'Delete Virtual Machine',
                icon: '⚠️',
                message: `Are you sure you want to delete "${vm.Name}"? This cannot be undone.`,
                confirmLabel: 'Delete',
                cancelLabel: 'Cancel',
            });

            if (confirmed) {
                hvState.vms = hvState.vms.filter(v => v.Name !== vm.Name);

                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'VM_DELETE',
                        payload: { Name: vm.Name },
                        source: 'gui',
                    });
                }

                hvState.selectedVM = null;
                renderVMList();
                updateToolbarState();
                hvState.statusBar.setMessage(`${vm.Name} deleted`, 'warning');
            }
        }

        function connectVM(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm) return;

            GUISimulator.alert({
                title: 'Virtual Machine Connection',
                icon: '🖥️',
                message: `In a real environment, this would open the VM console for "${vm.Name}".\n\nThe VM console provides keyboard, video, and mouse access to the virtual machine.`,
            });

            if (options.onObjectiveComplete) {
                options.onObjectiveComplete('connect-vm');
            }
        }

        function showVMSettings(vm) {
            vm = vm || hvState.selectedVM;
            if (!vm) return;

            GUISimulator.alert({
                title: `Settings for ${vm.Name}`,
                icon: '⚙️',
                message: `
                    <strong>General</strong><br>
                    Name: ${vm.Name}<br>
                    Generation: ${vm.Generation}<br>
                    Version: ${vm.Version}<br>
                    <br>
                    <strong>Hardware</strong><br>
                    Processor: ${vm.ProcessorCount} virtual processor(s)<br>
                    Memory: ${formatSize(vm.MemoryStartup)}<br>
                    Dynamic Memory: ${vm.DynamicMemoryEnabled ? 'Enabled' : 'Disabled'}<br>
                    <br>
                    <strong>Notes</strong><br>
                    ${vm.Notes || '(none)'}
                `,
            });
        }

        function showNewVMWizard() {
            const modal = showModal({
                id: 'new-vm-wizard',
                title: 'New Virtual Machine Wizard',
                icon: '➕',
                width: 500,
                content: `
                    <div class="gui-wizard-header gui-mb-4">
                        <h3>Create a New Virtual Machine</h3>
                        <p>This wizard helps you create a new virtual machine.</p>
                    </div>
                    <div id="new-vm-form"></div>
                    <div id="new-vm-success" class="gui-alert success gui-hidden">
                        <span class="gui-alert-icon">✓</span>
                        <div class="gui-alert-content">Virtual machine created successfully!</div>
                    </div>
                `,
                actions: [
                    { label: 'Create', primary: true, onClick: createVM },
                    { label: 'Cancel' },
                ],
            });

            const form = buildForm({
                container: '#new-vm-form',
                fields: [
                    {
                        id: 'name',
                        type: 'text',
                        label: 'Name:',
                        required: true,
                        placeholder: 'New Virtual Machine',
                    },
                    {
                        id: 'generation',
                        type: 'select',
                        label: 'Generation:',
                        options: [
                            { value: '2', label: 'Generation 2 (Recommended)' },
                            { value: '1', label: 'Generation 1 (Legacy)' },
                        ],
                        defaultValue: '2',
                    },
                    {
                        id: 'memory',
                        type: 'select',
                        label: 'Startup Memory:',
                        options: [
                            { value: '1073741824', label: '1 GB' },
                            { value: '2147483648', label: '2 GB' },
                            { value: '4294967296', label: '4 GB' },
                            { value: '8589934592', label: '8 GB' },
                        ],
                        defaultValue: '2147483648',
                    },
                    {
                        id: 'processors',
                        type: 'select',
                        label: 'Virtual Processors:',
                        options: ['1', '2', '4', '8'],
                        defaultValue: '2',
                    },
                    {
                        id: 'dynamicMemory',
                        type: 'checkbox',
                        label: 'Use Dynamic Memory',
                        checked: true,
                    },
                ],
            });

            function createVM() {
                if (!form.validate()) return false;

                const values = form.getValues();

                const newVM = {
                    Name: values.name,
                    State: 'Off',
                    CPUUsage: 0,
                    MemoryAssigned: 0,
                    MemoryDemand: 0,
                    Uptime: '0:00:00',
                    Status: 'Off',
                    Version: '9.0',
                    Generation: parseInt(values.generation),
                    Notes: '',
                    ProcessorCount: parseInt(values.processors),
                    DynamicMemoryEnabled: values.dynamicMemory,
                    MemoryMinimum: 536870912,
                    MemoryMaximum: parseInt(values.memory) * 2,
                    MemoryStartup: parseInt(values.memory),
                    Checkpoints: [],
                };

                hvState.vms.push(newVM);

                if (typeof WSAState !== 'undefined') {
                    WSAState.dispatch({
                        type: 'VM_CREATE',
                        payload: newVM,
                        source: 'gui',
                    });
                }

                document.getElementById('new-vm-form').classList.add('gui-hidden');
                document.getElementById('new-vm-success').classList.remove('gui-hidden');

                if (options.onObjectiveComplete) {
                    options.onObjectiveComplete('create-vm');
                }

                setTimeout(() => {
                    modal.close();
                    renderVMList();
                }, 1500);

                return false;
            }
        }

        // Update toolbar state based on selection
        function updateToolbarState() {
            const vm = hvState.selectedVM;

            if (!vm) {
                toolbar.disable('start');
                toolbar.disable('stop');
                toolbar.disable('save');
                toolbar.disable('pause');
                toolbar.disable('checkpoint');
                toolbar.disable('settings');
                toolbar.disable('connect');
                return;
            }

            const isRunning = vm.State === 'Running';
            const isOff = vm.State === 'Off';
            const isSaved = vm.State === 'Saved';

            if (isRunning) {
                toolbar.disable('start');
                toolbar.enable('stop');
                toolbar.enable('save');
                toolbar.enable('pause');
            } else {
                toolbar.enable('start');
                toolbar.disable('stop');
                toolbar.disable('save');
                toolbar.disable('pause');
            }

            toolbar.enable('checkpoint');
            toolbar.enable('settings');
            toolbar.enable('connect');
        }

        // Refresh all views
        function refreshViews() {
            renderVMList();
            updateToolbarState();
        }

        // Create status bar
        hvState.statusBar = createStatusBar({
            container: `#${windowId}-statusbar`,
            leftItems: [{ text: `Hyper-V Manager - ${config.hostname || 'DC01'}` }],
            rightItems: [{ text: `${hvState.vms?.length || 0} Virtual Machine(s)` }],
        });

        // Initial render - show VMs by default
        setTimeout(() => {
            hvState.treeView.expand('host');
            hvState.treeView.select('vms');
            renderVMList();

            // Initialize start times for already-running VMs and start timer
            const now = Date.now();
            hvState.vms.forEach(vm => {
                if (vm.State === 'Running') {
                    // Calculate how long ago VM "started" based on current uptime
                    const uptimeSeconds = parseUptimeToSeconds(vm.Uptime);
                    hvState.vmStartTimes[vm.Name] = now - (uptimeSeconds * 1000);
                }
            });

            // Start the timer if any VMs are running
            if (Object.keys(hvState.vmStartTimes).length > 0) {
                startUptimeTimer();
            }
        }, 100);

        // Cleanup timer when window closes
        const originalOnClose = win.onClose;
        win.onClose = () => {
            stopUptimeTimer();
            if (originalOnClose) originalOnClose();
        };

        return {
            window: win,
            refresh: refreshViews,
            getVMs: () => hvState.vms,
            getSwitches: () => hvState.switches,
            destroy: () => stopUptimeTimer(),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Dispatch action to WSAState
     */
    function dispatch(action) {
        if (typeof WSAState !== 'undefined') {
            return WSAState.dispatch({ ...action, source: 'gui' });
        }
        console.warn('GUISimulator: WSAState not available');
        return null;
    }

    /**
     * Get current state from WSAState
     */
    function getState() {
        if (typeof WSAState !== 'undefined') {
            return WSAState.getState();
        }
        return {};
    }

    /**
     * Cleanup - call when done with GUISimulator
     */
    function destroy() {
        // Close all windows
        windows.forEach((win, id) => {
            win.element.remove();
        });
        windows.clear();

        // Close all modals
        modals.forEach((modal, id) => {
            modal.element.remove();
        });
        modals.clear();

        // Close context menu
        closeContextMenu();

        // Unsubscribe from WSAState
        if (stateUnsubscribe) {
            stateUnsubscribe();
            stateUnsubscribe = null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════

    return {
        // Initialization
        init,
        destroy,

        // Theme Management
        setTheme,
        getTheme,
        toggleTheme,
        createThemeToggle,
        THEMES,

        // Window Management
        createWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        restoreWindow,
        toggleMaximize,
        getWindow,
        getWindowContent,

        // Components
        createTreeView,
        createListView,
        showContextMenu,
        closeContextMenu,
        showModal,
        closeModal,
        confirm,
        alert,
        buildForm,
        createToolbar,
        createStatusBar,

        // Apps
        createADUC,
        createDiskManagement,
        createHyperVManager,

        // State Integration
        dispatch,
        getState,

        // Configuration
        config,
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GUISimulator;
}
