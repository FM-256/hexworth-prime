/* ============================================================
   GUI Lab Engine — Hexworth Prime (Network+ / CCNA)

   Simulates real device management interfaces (Windows NIC properties,
   Cisco/Juniper/pfSense/UniFi web consoles, command prompts, Device
   Manager, Services console) for hands-on configuration labs.

   Students interact with a desktop environment — double-click icons
   to open windows, configure adapters, run CLI commands, and verify
   tasks. The engine validates task completion against simulated state
   (adapter configs, connectivity, service status, command history).

   Architecture:
   - Self-contained IIFE, injects own CSS (~1000 lines), no dependencies
   - Config-driven: lab content defined in configs/*.config.js
   - State engine: adapters, services, connectivity derived from config
   - Simulated CLI: ipconfig, ping, tracert, nslookup (Windows) or
     ip addr, nmcli, dig, systemctl (Linux) based on config.osType
   - Task verification: 10 verification types (command_run, adapter_config,
     connectivity, ping_success, state_value, state_match, custom, etc.)
   - Window manager: drag, resize, minimize, maximize, focus, cascade
   - Scoring: task points + time bonus for early completion

   Usage:
     <script src="engine/GUILabEngine.js"></script>
     <script src="../configs/gui-ne01-wireshark.config.js"></script>
     <script>
       GUILabEngine.init(LAB_CONFIG, document.getElementById('lab'));
     </script>
   ============================================================ */

const GUILabEngine = (() => {
    'use strict';

    // ─────────────────────────────────────────────────────────
    // INTERNAL STATE
    // All mutable state lives here. Reset via _reset().
    // ─────────────────────────────────────────────────────────

    let _config = null;          // Lab configuration (from configs/*.config.js)
    let _container = null;       // DOM element the engine renders into
    let _state = {};             // Simulated device state (adapters, services, connectivity)
    let _windows = {};           // Open window registry: { appId: { el, title, ... } }
    let _windowOrder = [];       // Z-order stack for window focus management
    let _zIndex = 100;           // Incrementing z-index counter for window layering
    let _clockInterval = null;   // setInterval handle for the countdown timer
    let _startTime = 0;          // Date.now() when lab started (for elapsed calculation)
    let _elapsed = 0;            // Seconds elapsed since lab start
    let _paused = false;         // Timer pause flag (not currently exposed in UI)
    let _taskPanelOpen = true;   // Whether the right-side task panel is expanded
    let _completedTasks = [];    // Array of completed task IDs
    let _commandHistory = [];    // Raw command strings entered in any terminal window
    let _listeners = [];         // State change subscribers (fn(state) callbacks)

    // ─────────────────────────────────────────────────────────
    // CSS INJECTION
    // ─────────────────────────────────────────────────────────

    function _injectCSS() {
        if (document.getElementById('gui-lab-engine-css')) return;
        const style = document.createElement('style');
        style.id = 'gui-lab-engine-css';
        style.textContent = `
/* ── RESET & BASE ────────────────────────────────── */
.gle-root {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    font-family: 'Segoe UI', -apple-system, sans-serif;
    font-size: 14px;
    color: #e0e0e0;
    background: #1a1a2e;
    user-select: none;
}
.gle-root *, .gle-root *::before, .gle-root *::after {
    box-sizing: border-box;
}

/* ── DESKTOP ─────────────────────────────────────── */
.gle-desktop {
    position: absolute;
    inset: 0 0 48px 0;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    padding: 20px;
    gap: 8px;
    background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%);
}

.gle-desktop-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
    padding: 8px 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s;
}
.gle-desktop-icon:hover { background: rgba(255,255,255,0.08); }
.gle-desktop-icon.selected { background: rgba(100,149,237,0.25); }
.gle-desktop-icon .gle-icon-img {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 4px;
    border-radius: 8px;
    background: rgba(255,255,255,0.06);
}
.gle-desktop-icon .gle-icon-label {
    font-size: 11px;
    text-align: center;
    line-height: 1.3;
    color: #ccc;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    word-break: break-word;
}

/* ── TASKBAR ─────────────────────────────────────── */
.gle-taskbar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 48px;
    background: #111;
    border-top: 1px solid #333;
    display: flex;
    align-items: center;
    padding: 0 12px;
    z-index: 9000;
}
.gle-taskbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 200px;
}
.gle-taskbar-title {
    font-size: 12px;
    font-weight: 600;
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
}
.gle-taskbar-center {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 2px;
    overflow-x: auto;
    padding: 0 8px;
}
.gle-taskbar-btn {
    background: #222;
    border: 1px solid #333;
    color: #ccc;
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background 0.15s;
}
.gle-taskbar-btn:hover { background: #333; }
.gle-taskbar-btn.active { background: #1a3a5c; border-color: #3a7bd5; color: #fff; }
.gle-taskbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 200px;
    justify-content: flex-end;
}
.gle-timer {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    color: #6fcf97;
    min-width: 60px;
    text-align: right;
}
.gle-timer.warning { color: #f2c94c; }
.gle-timer.critical { color: #eb5757; animation: gle-pulse 1s infinite; }
@keyframes gle-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.gle-score-badge {
    background: #1a3a5c;
    color: #6fcf97;
    font-weight: 600;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 3px;
    border: 1px solid #2a5a8c;
}
.gle-task-toggle-btn {
    background: #0078d4;
    border: none;
    color: #fff;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 3px;
    cursor: pointer;
}
.gle-task-toggle-btn:hover { background: #1a8ae6; }

/* ── WINDOWS ─────────────────────────────────────── */
.gle-window {
    position: absolute;
    background: #1e1e2e;
    border: 1px solid #444;
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    min-width: 400px;
    min-height: 280px;
    overflow: hidden;
    transition: box-shadow 0.15s;
}
.gle-window.focused { border-color: #3a7bd5; box-shadow: 0 8px 40px rgba(58,123,213,0.25); }
.gle-window.minimized { display: none; }

.gle-win-titlebar {
    display: flex;
    align-items: center;
    height: 36px;
    background: #252540;
    padding: 0 10px;
    flex-shrink: 0;
    cursor: move;
    border-bottom: 1px solid #333;
}
.gle-window.focused .gle-win-titlebar { background: #2a2a50; }
.gle-win-icon { margin-right: 8px; font-size: 14px; }
.gle-win-title { flex: 1; font-size: 12px; font-weight: 600; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gle-win-buttons { display: flex; gap: 4px; }
.gle-win-btn {
    width: 14px; height: 14px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
}
.gle-win-btn:hover { opacity: 0.8; }
.gle-win-btn-minimize { background: #f2c94c; }
.gle-win-btn-maximize { background: #6fcf97; }
.gle-win-btn-close { background: #eb5757; }

.gle-win-menubar {
    display: flex;
    height: 28px;
    background: #1a1a30;
    border-bottom: 1px solid #333;
    padding: 0 8px;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}
.gle-win-menu-item {
    font-size: 11px;
    color: #aaa;
    padding: 2px 10px;
    border-radius: 3px;
    cursor: default;
}
.gle-win-menu-item:hover { background: rgba(255,255,255,0.08); color: #ddd; }

.gle-win-toolbar {
    display: flex;
    height: 32px;
    background: #1c1c35;
    border-bottom: 1px solid #333;
    padding: 0 8px;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}
.gle-toolbar-btn {
    font-size: 11px;
    color: #aaa;
    background: rgba(255,255,255,0.05);
    border: 1px solid #444;
    padding: 2px 8px;
    border-radius: 3px;
    cursor: pointer;
}
.gle-toolbar-btn:hover { background: rgba(255,255,255,0.1); color: #ddd; }
.gle-toolbar-btn:disabled { opacity: 0.4; cursor: default; }

.gle-win-content {
    flex: 1;
    overflow: auto;
    position: relative;
}

.gle-win-statusbar {
    height: 24px;
    background: #151530;
    border-top: 1px solid #333;
    padding: 0 10px;
    font-size: 11px;
    color: #666;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.gle-win-resize {
    position: absolute;
    bottom: 0; right: 0;
    width: 16px; height: 16px;
    cursor: nwse-resize;
}

/* ── TASK PANEL ──────────────────────────────────── */
.gle-task-panel {
    position: absolute;
    top: 0; right: 0; bottom: 48px;
    width: 320px;
    background: #151525;
    border-left: 1px solid #333;
    display: flex;
    flex-direction: column;
    z-index: 8000;
    transition: transform 0.25s ease;
}
.gle-task-panel.collapsed { transform: translateX(320px); }
.gle-task-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #333;
    background: #1a1a35;
}
.gle-task-panel-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #ddd;
}
.gle-task-panel-close {
    background: none; border: none;
    color: #888; font-size: 18px;
    cursor: pointer;
}
.gle-task-panel-close:hover { color: #ddd; }
.gle-task-progress {
    padding: 10px 16px;
    border-bottom: 1px solid #333;
}
.gle-task-progress-bar-bg {
    height: 6px;
    background: #2a2a45;
    border-radius: 3px;
    overflow: hidden;
}
.gle-task-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #0078d4, #6fcf97);
    border-radius: 3px;
    transition: width 0.4s ease;
}
.gle-task-progress-text {
    font-size: 11px;
    color: #888;
    margin-top: 4px;
    text-align: right;
}
.gle-task-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}
.gle-task-item {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    transition: background 0.15s;
}
.gle-task-item:hover { background: rgba(255,255,255,0.03); }
.gle-task-item.active { background: rgba(0,120,212,0.1); border-left: 3px solid #0078d4; }
.gle-task-item.completed { opacity: 0.6; }
.gle-task-item.locked { opacity: 0.35; cursor: default; }
.gle-task-header {
    display: flex;
    align-items: center;
    gap: 8px;
}
.gle-task-check {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 2px solid #555;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 11px;
    color: transparent;
    transition: all 0.2s;
}
.gle-task-item.completed .gle-task-check {
    border-color: #6fcf97;
    background: #6fcf97;
    color: #111;
}
.gle-task-item.locked .gle-task-check {
    border-color: #444;
}
.gle-task-title {
    font-size: 12px;
    font-weight: 600;
    color: #ccc;
}
.gle-task-item.completed .gle-task-title { color: #6fcf97; text-decoration: line-through; }
.gle-task-desc {
    font-size: 11px;
    color: #888;
    margin: 4px 0 0 26px;
    line-height: 1.4;
}
.gle-task-item.locked .gle-task-desc { color: #555; }
.gle-task-verify-btn {
    margin: 8px 0 0 26px;
    background: #0078d4;
    border: none;
    color: #fff;
    font-size: 11px;
    padding: 4px 14px;
    border-radius: 3px;
    cursor: pointer;
}
.gle-task-verify-btn:hover { background: #1a8ae6; }
.gle-task-verify-btn:disabled { background: #444; cursor: default; }

/* ── COMMAND PROMPT ──────────────────────────────── */
.gle-cmd {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #0c0c0c;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    color: #cccccc;
}
.gle-cmd-output {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.4;
}
.gle-cmd-input-row {
    display: flex;
    align-items: center;
    padding: 4px 12px 8px;
    border-top: 1px solid #222;
    background: #0c0c0c;
}
.gle-cmd-prompt-text {
    color: #cccccc;
    white-space: nowrap;
    margin-right: 4px;
}
.gle-cmd-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #cccccc;
    font-family: inherit;
    font-size: inherit;
    caret-color: #ccc;
}

/* ── NETWORK ADAPTER PROPERTIES ──────────────────── */
.gle-net-adapter {
    display: flex;
    height: 100%;
}
.gle-net-adapter-list {
    width: 200px;
    border-right: 1px solid #333;
    overflow-y: auto;
    background: #161630;
}
.gle-net-adapter-item {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s;
}
.gle-net-adapter-item:hover { background: rgba(255,255,255,0.05); }
.gle-net-adapter-item.selected { background: rgba(0,120,212,0.15); border-left: 3px solid #0078d4; }
.gle-net-adapter-item .gle-adapter-icon {
    font-size: 20px;
    flex-shrink: 0;
}
.gle-net-adapter-item .gle-adapter-info {
    flex: 1;
    min-width: 0;
}
.gle-net-adapter-item .gle-adapter-name {
    font-size: 12px;
    font-weight: 600;
    color: #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.gle-net-adapter-item .gle-adapter-status {
    font-size: 10px;
    margin-top: 2px;
}
.gle-adapter-status.connected { color: #6fcf97; }
.gle-adapter-status.disconnected { color: #eb5757; }
.gle-adapter-status.disabled { color: #888; }

.gle-net-adapter-props {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
}
.gle-prop-section {
    margin-bottom: 16px;
}
.gle-prop-section h4 {
    font-size: 12px;
    font-weight: 600;
    color: #0078d4;
    margin: 0 0 8px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid #333;
}
.gle-prop-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    gap: 8px;
}
.gle-prop-label {
    width: 140px;
    font-size: 12px;
    color: #999;
    flex-shrink: 0;
}
.gle-prop-input {
    flex: 1;
    background: #1a1a35;
    border: 1px solid #444;
    color: #ddd;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 3px;
    font-family: 'Consolas', monospace;
}
.gle-prop-input:focus { border-color: #0078d4; outline: none; }
.gle-prop-input:disabled { opacity: 0.4; cursor: default; }
.gle-prop-select {
    flex: 1;
    background: #1a1a35;
    border: 1px solid #444;
    color: #ddd;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 3px;
}
.gle-prop-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
}
.gle-toggle-track {
    width: 36px; height: 18px;
    background: #444;
    border-radius: 9px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
}
.gle-toggle-track.on { background: #0078d4; }
.gle-toggle-thumb {
    width: 14px; height: 14px;
    background: #ddd;
    border-radius: 50%;
    position: absolute;
    top: 2px; left: 2px;
    transition: left 0.2s;
}
.gle-toggle-track.on .gle-toggle-thumb { left: 20px; }
.gle-toggle-label {
    font-size: 12px;
    color: #aaa;
}
.gle-prop-btn-row {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    justify-content: flex-end;
}
.gle-btn-primary {
    background: #0078d4;
    border: none;
    color: #fff;
    padding: 6px 20px;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
}
.gle-btn-primary:hover { background: #1a8ae6; }
.gle-btn-secondary {
    background: #333;
    border: 1px solid #555;
    color: #ccc;
    padding: 6px 20px;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
}
.gle-btn-secondary:hover { background: #444; }

/* ── DEVICE MANAGER ──────────────────────────────── */
.gle-devmgr {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.gle-devmgr-tree {
    flex: 1;
    padding: 8px 12px;
    overflow-y: auto;
    font-size: 12px;
}
.gle-devmgr-node {
    padding: 2px 0;
}
.gle-devmgr-branch {
    cursor: pointer;
    padding: 3px 4px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.gle-devmgr-branch:hover { background: rgba(255,255,255,0.05); }
.gle-devmgr-branch .gle-tree-arrow {
    font-size: 10px;
    width: 12px;
    color: #888;
    transition: transform 0.15s;
}
.gle-devmgr-branch .gle-tree-arrow.expanded { transform: rotate(90deg); }
.gle-devmgr-branch .gle-tree-icon { font-size: 14px; }
.gle-devmgr-branch .gle-tree-label { color: #ccc; }
.gle-devmgr-children {
    padding-left: 24px;
    overflow: hidden;
}
.gle-devmgr-children.collapsed { display: none; }
.gle-devmgr-leaf {
    padding: 3px 4px 3px 18px;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #bbb;
}
.gle-devmgr-leaf:hover { background: rgba(255,255,255,0.05); }
.gle-devmgr-leaf.selected { background: rgba(0,120,212,0.15); }
.gle-devmgr-leaf.disabled-device { color: #888; }
.gle-devmgr-leaf.disabled-device .gle-tree-icon { opacity: 0.4; }

.gle-devmgr-ctx {
    position: absolute;
    background: #222;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 4px 0;
    min-width: 160px;
    z-index: 9500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}
.gle-devmgr-ctx-item {
    padding: 6px 16px;
    font-size: 12px;
    color: #ccc;
    cursor: pointer;
}
.gle-devmgr-ctx-item:hover { background: #0078d4; color: #fff; }
.gle-devmgr-ctx-sep {
    height: 1px;
    background: #444;
    margin: 4px 0;
}

/* ── SERVICES CONSOLE ────────────────────────────── */
.gle-services {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.gle-services-list {
    flex: 1;
    overflow-y: auto;
}
.gle-services-header,
.gle-services-row {
    display: grid;
    grid-template-columns: 2fr 100px 100px 90px;
    padding: 6px 12px;
    font-size: 12px;
    align-items: center;
}
.gle-services-header {
    background: #1a1a35;
    border-bottom: 1px solid #444;
    color: #888;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
}
.gle-services-row {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    transition: background 0.15s;
}
.gle-services-row:hover { background: rgba(255,255,255,0.04); }
.gle-services-row.selected { background: rgba(0,120,212,0.12); }
.gle-svc-name { color: #ccc; }
.gle-svc-status {
    font-size: 11px;
    font-weight: 600;
}
.gle-svc-status.running { color: #6fcf97; }
.gle-svc-status.stopped { color: #eb5757; }
.gle-svc-startup { color: #888; font-size: 11px; }
.gle-svc-actions {
    display: flex;
    gap: 4px;
}
.gle-svc-action-btn {
    background: #2a2a45;
    border: 1px solid #444;
    color: #aaa;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 3px;
    cursor: pointer;
}
.gle-svc-action-btn:hover { background: #3a3a55; color: #ddd; }
.gle-svc-action-btn:disabled { opacity: 0.3; cursor: default; }

/* ── WEB MANAGEMENT INTERFACE ────────────────────── */
.gle-webmgmt {
    display: flex;
    height: 100%;
}
.gle-webmgmt-sidebar {
    width: 200px;
    background: #151530;
    border-right: 1px solid #333;
    overflow-y: auto;
    flex-shrink: 0;
}
.gle-webmgmt-sidebar-header {
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 700;
    color: #0078d4;
    border-bottom: 1px solid #333;
}
.gle-webmgmt-nav-item {
    padding: 8px 16px;
    font-size: 12px;
    color: #aaa;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.15s;
}
.gle-webmgmt-nav-item:hover { background: rgba(255,255,255,0.04); color: #ccc; }
.gle-webmgmt-nav-item.active {
    background: rgba(0,120,212,0.1);
    color: #fff;
    border-left-color: #0078d4;
}
.gle-webmgmt-nav-section {
    padding: 10px 16px 4px;
    font-size: 10px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.gle-webmgmt-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}
.gle-webmgmt-page-title {
    font-size: 18px;
    font-weight: 600;
    color: #ddd;
    margin: 0 0 16px 0;
}
.gle-webmgmt-form-group {
    margin-bottom: 14px;
}
.gle-webmgmt-form-label {
    display: block;
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
}
.gle-webmgmt-form-input {
    width: 100%;
    max-width: 360px;
    background: #1a1a35;
    border: 1px solid #444;
    color: #ddd;
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 3px;
    font-family: 'Consolas', monospace;
}
.gle-webmgmt-form-input:focus { border-color: #0078d4; outline: none; }
.gle-webmgmt-form-select {
    width: 100%;
    max-width: 360px;
    background: #1a1a35;
    border: 1px solid #444;
    color: #ddd;
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 3px;
}
.gle-webmgmt-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 12px;
}
.gle-webmgmt-table th {
    background: #1a1a35;
    color: #888;
    font-weight: 600;
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid #444;
}
.gle-webmgmt-table td {
    padding: 6px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #ccc;
}
.gle-webmgmt-save-bar {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #333;
}

/* ── NOTIFICATIONS ───────────────────────────────── */
.gle-notification {
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 9999;
    animation: gle-notif-in 0.3s ease;
    max-width: 400px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.gle-notification.success { background: #1a3a2a; border: 1px solid #6fcf97; color: #6fcf97; }
.gle-notification.error { background: #3a1a1a; border: 1px solid #eb5757; color: #eb5757; }
.gle-notification.info { background: #1a2a3a; border: 1px solid #3a7bd5; color: #6ab0f3; }
.gle-notification.warning { background: #3a3a1a; border: 1px solid #f2c94c; color: #f2c94c; }
@keyframes gle-notif-in { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

/* ── COMPLETION OVERLAY ──────────────────────────── */
.gle-completion-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9500;
}
.gle-completion-overlay.active { display: flex; }
.gle-completion-card {
    background: #1e1e2e;
    border: 1px solid #444;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 16px 64px rgba(0,0,0,0.6);
}
.gle-completion-card h2 {
    font-size: 28px;
    color: #6fcf97;
    margin: 0 0 8px;
}
.gle-completion-subtitle {
    font-size: 14px;
    color: #888;
    margin-bottom: 24px;
}
.gle-completion-score {
    font-size: 48px;
    font-weight: 700;
    color: #3a7bd5;
    margin-bottom: 8px;
}
.gle-completion-breakdown {
    font-size: 13px;
    color: #888;
    line-height: 1.8;
    margin-bottom: 24px;
}
.gle-completion-breakdown span { color: #ccc; }
.gle-completion-time {
    font-size: 14px;
    color: #f2c94c;
    margin-bottom: 24px;
}
.gle-completion-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
}
.gle-completion-btn {
    padding: 10px 28px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    border: none;
}
.gle-completion-btn.primary {
    background: #0078d4;
    color: #fff;
}
.gle-completion-btn.primary:hover { background: #1a8ae6; }
.gle-completion-btn.secondary {
    background: #333;
    border: 1px solid #555;
    color: #ccc;
}
.gle-completion-btn.secondary:hover { background: #444; }

/* ── START OVERLAY ───────────────────────────────── */
.gle-start-overlay {
    position: absolute;
    inset: 0;
    background: rgba(10,10,30,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9600;
}
.gle-start-card {
    background: #1e1e2e;
    border: 1px solid #444;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    max-width: 550px;
    width: 90%;
}
.gle-start-card h2 {
    font-size: 24px;
    color: #ddd;
    margin: 0 0 8px;
}
.gle-start-card .gle-start-subtitle {
    font-size: 14px;
    color: #888;
    margin-bottom: 20px;
}
.gle-start-objectives {
    text-align: left;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: rgba(0,120,212,0.08);
    border-radius: 6px;
    border: 1px solid rgba(0,120,212,0.2);
}
.gle-start-objectives h4 {
    font-size: 12px;
    color: #0078d4;
    margin: 0 0 8px;
}
.gle-start-objectives ul {
    margin: 0;
    padding: 0 0 0 18px;
    font-size: 12px;
    color: #aaa;
    line-height: 1.7;
}
.gle-start-meta {
    font-size: 12px;
    color: #666;
    margin-bottom: 24px;
}
.gle-start-btn {
    background: #0078d4;
    border: none;
    color: #fff;
    font-size: 16px;
    padding: 12px 40px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.gle-start-btn:hover { background: #1a8ae6; }
`;
        document.head.appendChild(style);
    }

    // ─────────────────────────────────────────────────────────
    // UTILITIES
    // Shared helper functions used throughout the engine.
    // ─────────────────────────────────────────────────────────

    /** Escape HTML entities to prevent XSS when inserting user-provided text into the DOM. */
    function _esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    /** Shorthand DOM element factory — creates element with optional class and innerHTML. */
    function _el(tag, cls, html) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        if (html) el.innerHTML = html;
        return el;
    }

    /** Show a temporary toast notification (3s visible, 300ms fade). Types: 'success', 'error', 'warning', 'info'. */
    function _notify(msg, type) {
        const n = _el('div', 'gle-notification ' + (type || 'info'));
        n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => {
            n.style.opacity = '0';
            n.style.transition = 'opacity 0.3s';
            setTimeout(() => n.remove(), 300);
        }, 3000);
    }

    /** Format seconds as M:SS for the countdown timer display. */
    function _formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    /** Deep clone via JSON round-trip. Safe for plain objects (no functions, dates, undefined). */
    function _deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // ─────────────────────────────────────────────────────────
    // STATE ENGINE
    // Manages the simulated device state — network adapters,
    // Windows services, connectivity status, and device manager
    // tree. State is initialized from config.initialState and
    // mutated by user actions (CLI commands, GUI toggles, etc.).
    // ─────────────────────────────────────────────────────────

    /**
     * Initialize state from config. Deep-clones initialState so the
     * original config is never mutated (allows clean reset). Also
     * creates internal tracking arrays for task verification.
     */
    function _initState() {
        _state = _deepClone(_config.initialState || {});
        // Ensure required structures exist even if config omits them
        if (!_state.adapters) _state.adapters = [];
        if (!_state.services) _state.services = [];
        if (!_state.connectivity) _state.connectivity = { gateway: false, internet: false, dns: false };
        if (!_state.deviceManager) _state.deviceManager = {};
        if (!_state.webMgmt) _state.webMgmt = {};
        // Internal tracking arrays — used by _verifyTask() to check
        // what commands the student ran and what windows they opened
        _state._commandsRun = [];
        _state._windowsOpened = [];
    }

    /** Find a network adapter by name in the simulated state. */
    function _getAdapter(name) {
        return _state.adapters.find(a => a.name === name);
    }

    /**
     * Recalculate connectivity flags (gateway, internet, DNS) based on
     * current adapter configuration. This is the "physics engine" of the
     * network simulation — it determines what's reachable.
     *
     * Logic mirrors real networking:
     * - Gateway reachable if an enabled adapter has an IP in the same subnet
     * - Internet reachable if gateway is reachable and no firewall blocks outbound
     * - DNS works if internet works, DNS servers are configured, and DNS Client service is running
     * - APIPA addresses (169.254.x.x) and 0.0.0.0 mean no valid config
     */
    function _updateConnectivity() {
        const conn = _state.connectivity;
        // Find first enabled + connected adapter (simulates primary NIC)
        const active = _state.adapters.find(a => a.enabled && a.connected);
        if (!active) {
            conn.gateway = false;
            conn.internet = false;
            conn.dns = false;
            return;
        }

        const ip = active.ip || '';
        const gw = active.gateway || '';
        const mask = active.mask || '255.255.255.0';

        // No gateway configured, or APIPA/zeroed IP = no connectivity
        if (!gw || gw === '' || ip.startsWith('169.254') || ip === '0.0.0.0') {
            conn.gateway = false;
            conn.internet = false;
            conn.dns = false;
            return;
        }

        // Gateway reachable only if IP and gateway are in the same subnet
        conn.gateway = _sameSubnet(ip, gw, mask);

        // Internet blocked if Windows Firewall is running with outbound block enabled
        const fwBlocking = (_state.services || []).some(s =>
            s.name === 'Windows Firewall' && s.status === 'running' && s.blockOutbound
        );
        conn.internet = conn.gateway && !fwBlocking;

        // DNS requires: internet + configured DNS servers + DNS Client service running
        const dnsClient = (_state.services || []).find(s => s.name === 'DNS Client');
        const hasDNS = active.dns && active.dns.some(d => d && d !== '');
        conn.dns = conn.internet && hasDNS && (!dnsClient || dnsClient.status === 'running');
    }

    /** Compare two IPs against a subnet mask using bitwise AND. Returns true if same subnet. */
    function _sameSubnet(ip1, ip2, mask) {
        const a = _ipToNum(ip1);
        const b = _ipToNum(ip2);
        const m = _ipToNum(mask);
        if (a === null || b === null || m === null) return false;
        return (a & m) === (b & m);
    }

    /** Convert dotted-quad IP string to 32-bit unsigned integer. Returns null if invalid. */
    function _ipToNum(ip) {
        if (!ip) return null;
        const parts = ip.split('.');
        if (parts.length !== 4) return null;
        let n = 0;
        for (let i = 0; i < 4; i++) {
            const p = parseInt(parts[i], 10);
            if (isNaN(p) || p < 0 || p > 255) return null;
            n = (n << 8) | p;  // Shift left and OR each octet
        }
        return n >>> 0;  // Unsigned right-shift to ensure positive 32-bit
    }

    /** Validate that a string is a well-formed IPv4 address. */
    function _isValidIP(ip) {
        return _ipToNum(ip) !== null;
    }

    /** Called after any state mutation — recalculates connectivity and notifies listeners. */
    function _onStateChange() {
        _updateConnectivity();
        _broadcastStateChange();
    }

    /** Notify all registered state change listeners. Errors in listeners are caught to prevent cascade. */
    function _broadcastStateChange() {
        _listeners.forEach(fn => {
            try { fn(_state); } catch (e) { console.error('[GUILab] Listener error:', e); }
        });
    }

    // ─────────────────────────────────────────────────────────
    // SIMULATED COMMAND PROCESSOR
    // Routes CLI input to the appropriate command handler based
    // on config.osType ('linux' or Windows default). Every command
    // is logged to _state._commandsRun for task verification.
    //
    // Windows commands: ipconfig, ping, tracert, nslookup, netstat,
    //   arp, route, nbtstat, netsh
    // Linux commands: ip addr/route/link, ping, traceroute, dig,
    //   nslookup, ss, nmcli, cat, systemctl, journalctl
    // ─────────────────────────────────────────────────────────

    /** Parse and dispatch a command entered in the simulated terminal. Returns output string. */
    function _processCommand(input) {
        const raw = input.trim();
        if (!raw) return '';
        const parts = raw.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1).map(a => a.toLowerCase());

        // Log command for verification
        _state._commandsRun.push(raw.toLowerCase());

        // Check if this lab uses Linux commands
        const isLinux = _config && _config.osType === 'linux';

        if (isLinux) {
            switch (cmd) {
                case 'ip':
                    if (args[0] === 'addr' || args[0] === 'a') return _cmdIpAddr(args.slice(1));
                    if (args[0] === 'route' || args[0] === 'r') return _cmdIpRoute(args.slice(1));
                    if (args[0] === 'link') return _cmdIpLink(args.slice(1));
                    return '\nUsage: ip [addr|route|link] [show]\n';
                case 'ping': return _cmdPing(args);
                case 'traceroute': return _cmdTracert(args);
                case 'dig': return _cmdDig(args);
                case 'nslookup': return _cmdNslookup(args);
                case 'ss': return _cmdSs(args);
                case 'nmcli':
                    if (args[0] === 'con' && args[1] === 'show') return _cmdNmcliConShow();
                    if (args[0] === 'con' && args[1] === 'up') return _cmdNmcliConUp(args.slice(2));
                    if (args[0] === 'con' && args[1] === 'mod') return _cmdNmcliConMod(args.slice(2));
                    if (args[0] === 'general') return '\nSTATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN\nconnected  full          enabled  enabled  enabled  enabled\n';
                    return '\nUsage: nmcli [con show|con up <name>|con mod <name> <prop> <val>|general]\n';
                case 'cat': return _cmdCat(args);
                case 'systemctl': return _cmdSystemctl(args);
                case 'journalctl': return '\n-- Logs begin at Mon 2026-03-25 06:12:01 EDT --\nMar 25 06:12:01 meridian-ws01 NetworkManager[842]: <info> starting...\nMar 25 06:12:02 meridian-ws01 NetworkManager[842]: <info> (eth0): device state change: unmanaged -> disconnected\nMar 25 06:12:03 meridian-ws01 NetworkManager[842]: <info> (eth0): Activation: starting connection \'Wired connection 1\'\n';
                case 'ifconfig': return '\nifconfig is deprecated. Use: ip addr show\n';
                case 'clear': return '\x0C';
                case 'help': return _cmdHelpLinux();
                default: return `bash: ${_esc(cmd)}: command not found\n`;
            }
        }

        switch (cmd) {
            case 'ipconfig': return _cmdIpconfig(args);
            case 'ping': return _cmdPing(args);
            case 'tracert': return _cmdTracert(args);
            case 'nslookup': return _cmdNslookup(args);
            case 'netstat': return _cmdNetstat(args);
            case 'arp': return _cmdArp(args);
            case 'route': return _cmdRoute(args);
            case 'nbtstat': return _cmdNbtstat(args);
            case 'netsh': return _cmdNetsh(parts.slice(1));
            case 'cls': return '\x0C';
            case 'help': return _cmdHelp();
            default: return `'${_esc(cmd)}' is not recognized as an internal or external command,\noperable program or batch file.\n`;
        }
    }

    // ── Linux Commands ───────────────────────────────────────

    function _cmdIpAddr() {
        const adapters = _state.adapters || [];
        let out = '';
        adapters.forEach((a, i) => {
            const idx = i + 1;
            const state = a.enabled ? 'UP' : 'DOWN';
            const flags = a.enabled ? '<BROADCAST,MULTICAST,UP,LOWER_UP>' : '<BROADCAST,MULTICAST>';
            out += `${idx}: ${a.name}: ${flags} mtu 1500 qdisc fq_codel state ${state}\n`;
            out += `    link/ether ${a.mac || '00:1a:2b:3c:4d:' + String(10 + i * 11).padStart(2, '0')} brd ff:ff:ff:ff:ff:ff\n`;
            if (a.enabled && a.ip && a.ip !== '0.0.0.0') {
                out += `    inet ${a.ip}/${_maskToCidr(a.mask || '255.255.255.0')} brd ${_getBroadcast(a.ip, a.mask || '255.255.255.0')} scope global ${a.dhcp ? 'dynamic' : ''} ${a.name}\n`;
                out += `       valid_lft ${a.dhcp ? '86400sec' : 'forever'} preferred_lft ${a.dhcp ? '86400sec' : 'forever'}\n`;
            }
        });
        out += `${adapters.length + 1}: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n`;
        out += `    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n`;
        out += `    inet 127.0.0.1/8 scope host lo\n`;
        return '\n' + out;
    }

    function _cmdIpRoute() {
        const adapters = _state.adapters || [];
        let out = '';
        const primary = adapters.find(a => a.enabled && a.gateway);
        if (primary && primary.gateway) {
            out += `default via ${primary.gateway} dev ${primary.name} proto static metric 100\n`;
        }
        adapters.forEach(a => {
            if (a.enabled && a.ip && a.ip !== '0.0.0.0') {
                const net = _getNetwork(a.ip, a.mask || '255.255.255.0');
                const cidr = _maskToCidr(a.mask || '255.255.255.0');
                out += `${net}/${cidr} dev ${a.name} proto kernel scope link src ${a.ip} metric 100\n`;
            }
        });
        if (!out) out = 'No routes configured.\n';
        return '\n' + out;
    }

    function _cmdIpLink() {
        const adapters = _state.adapters || [];
        let out = '';
        adapters.forEach((a, i) => {
            const state = a.enabled ? 'UP' : 'DOWN';
            out += `${i + 1}: ${a.name}: <BROADCAST,MULTICAST${a.enabled ? ',UP,LOWER_UP' : ''}> mtu 1500 state ${state}\n`;
        });
        return '\n' + out;
    }

    function _cmdDig(args) {
        if (args.length === 0) return '\nUsage: dig <hostname>\n';
        const host = args[0];
        const domains = _config.knownDomains || {};
        const ip = domains[host];
        if (ip) {
            return `\n; <<>> DiG 9.18.1 <<>> ${host}\n;; ANSWER SECTION:\n${host}.\t\t300\tIN\tA\t${ip}\n\n;; Query time: 4 msec\n;; SERVER: ${(_state.adapters[0] && _state.adapters[0].dns && _state.adapters[0].dns[0]) || '127.0.0.53'}#53\n`;
        }
        return `\n; <<>> DiG 9.18.1 <<>> ${host}\n;; connection timed out; no servers could be reached\n`;
    }

    function _cmdSs(args) {
        return '\nNetid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port\ntcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*\ntcp    LISTEN  0       5        127.0.0.1:631          0.0.0.0:*\nudp    UNCONN  0       0        0.0.0.0:68             0.0.0.0:*\nudp    UNCONN  0       0        0.0.0.0:5353           0.0.0.0:*\n';
    }

    function _cmdNmcliConShow() {
        const adapters = _state.adapters || [];
        let out = 'NAME                UUID                                  TYPE      DEVICE\n';
        adapters.forEach(a => {
            const uuid = 'a1b2c3d4-e5f6-7890-abcd-' + a.name.replace(/[^a-z0-9]/gi, '').padEnd(12, '0');
            const active = a.enabled ? a.name : '--';
            out += `Wired connection ${a.name === 'eth0' ? '1' : '2'}  ${uuid}  ethernet  ${active}\n`;
        });
        return '\n' + out;
    }

    function _cmdNmcliConUp(args) {
        if (args.length === 0) return '\nUsage: nmcli con up <connection-name>\n';
        _state._commandsRun.push('nmcli con up ' + args.join(' '));
        return `\nConnection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/1)\n`;
    }

    function _cmdNmcliConMod(args) {
        return `\nConnection 'Wired connection 1' successfully modified.\n`;
    }

    function _cmdCat(args) {
        if (args.length === 0) return '\nUsage: cat <file>\n';
        const file = args[0];
        if (file === '/etc/resolv.conf') {
            const dns = (_state.adapters && _state.adapters[0] && _state.adapters[0].dns) || ['127.0.0.53'];
            let out = '# Generated by NetworkManager\n';
            dns.forEach(d => { if (d) out += 'nameserver ' + d + '\n'; });
            return '\n' + out;
        }
        if (file === '/etc/hosts') {
            return '\n127.0.0.1\tlocalhost\n127.0.1.1\tmeridian-ws01\n::1\t\tlocalhost ip6-localhost ip6-loopback\n';
        }
        if (file === '/etc/hostname') return '\nmeridian-ws01\n';
        if (file.includes('network') || file.includes('interfaces')) {
            const a = _state.adapters && _state.adapters[0];
            if (a && !a.dhcp) {
                return `\n# /etc/network/interfaces\nauto lo\niface lo inet loopback\n\nauto ${a.name}\niface ${a.name} inet static\n    address ${a.ip}\n    netmask ${a.mask || '255.255.255.0'}\n    gateway ${a.gateway || ''}\n    dns-nameservers ${(a.dns || []).join(' ')}\n`;
            }
            return `\n# /etc/network/interfaces\nauto lo\niface lo inet loopback\n\nauto eth0\niface eth0 inet dhcp\n`;
        }
        return `\ncat: ${file}: No such file or directory\n`;
    }

    function _cmdSystemctl(args) {
        if (args.length < 2) return '\nUsage: systemctl [status|start|stop|restart] <service>\n';
        const action = args[0];
        const svc = args[1];
        if (action === 'status') {
            const service = (_state.services || []).find(s => s.name.toLowerCase().includes(svc));
            if (service) {
                const active = service.status === 'running' ? 'active (running)' : 'inactive (dead)';
                return `\n● ${service.name}.service\n   Loaded: loaded (/lib/systemd/system/${svc}.service; enabled)\n   Active: ${active}\n`;
            }
        }
        return `\n● ${svc}.service\n   Active: active (running)\n`;
    }

    function _cmdHelpLinux() {
        return [
            'Available commands:',
            '  ip addr show          — show interface addresses',
            '  ip route show         — show routing table',
            '  ip link show          — show link status',
            '  ping <host>           — test connectivity',
            '  traceroute <host>     — trace packet path',
            '  dig <host>            — DNS lookup',
            '  nslookup <host>       — DNS lookup (legacy)',
            '  ss -tuln              — show listening sockets',
            '  nmcli con show        — show NetworkManager connections',
            '  nmcli con up <name>   — activate connection',
            '  nmcli con mod <name>  — modify connection',
            '  cat <file>            — read file (/etc/resolv.conf, /etc/hosts, etc.)',
            '  systemctl status <svc> — check service status',
            '  journalctl            — view system logs',
            '  clear                 — clear terminal',
            ''
        ].join('\n');
    }

    // ── Helper: subnet math for Linux output ─────────────────
    // These functions convert between dotted-quad masks and CIDR
    // notation, and compute broadcast/network addresses for the
    // simulated 'ip addr' and 'ip route' command output.

    /** Convert subnet mask '255.255.255.0' to CIDR prefix length 24. Counts set bits. */
    function _maskToCidr(mask) {
        return mask.split('.').reduce((c, o) => c + (parseInt(o) >>> 0).toString(2).replace(/0/g, '').length, 0);
    }

    /** Compute broadcast address: OR each octet with the inverse of the mask. */
    function _getBroadcast(ip, mask) {
        const ipParts = ip.split('.').map(Number);
        const maskParts = mask.split('.').map(Number);
        return ipParts.map((p, i) => (p | (~maskParts[i] & 255))).join('.');
    }

    /** Compute network address: AND each octet with the mask. */
    function _getNetwork(ip, mask) {
        const ipParts = ip.split('.').map(Number);
        const maskParts = mask.split('.').map(Number);
        return ipParts.map((p, i) => (p & maskParts[i])).join('.');
    }

    function _cmdHelp() {
        return [
            'Available commands:',
            '  ipconfig [/all] [/release] [/renew] [/flushdns] [/displaydns]',
            '  ping <host>',
            '  tracert <host>',
            '  nslookup <host>',
            '  netstat [-a] [-n] [-r]',
            '  arp -a',
            '  route print',
            '  nbtstat [-n] [-c]',
            '  netsh interface ip set address "<adapter>" static <ip> <mask> <gw>',
            '  netsh interface ip set dns "<adapter>" static <dns>',
            '  cls',
            ''
        ].join('\n');
    }

    function _cmdIpconfig(args) {
        const showAll = args.includes('/all');

        if (args.includes('/release')) {
            const adapter = _state.adapters.find(a => a.enabled && a.dhcp);
            if (adapter) {
                adapter.ip = '0.0.0.0';
                adapter.mask = '0.0.0.0';
                adapter.gateway = '';
                _onStateChange();
                return `\nWindows IP Configuration\n\n   Successfully released the IP address for adapter ${adapter.name}.\n`;
            }
            return '\nWindows IP Configuration\n\n   No adapter found with DHCP enabled.\n';
        }

        if (args.includes('/renew')) {
            const adapter = _state.adapters.find(a => a.enabled && a.dhcp);
            if (!adapter) return '\nWindows IP Configuration\n\n   No adapter found with DHCP enabled.\n';

            // Check DHCP Client service
            const dhcpSvc = _state.services.find(s => s.name === 'DHCP Client');
            if (dhcpSvc && dhcpSvc.status !== 'running') {
                return `\nWindows IP Configuration\n\nAn error occurred while renewing interface ${adapter.name} : unable to contact your DHCP server.\nThe DHCP Client service is not running.\n`;
            }

            // Simulate DHCP success
            const dhcpPool = _config.dhcpPool || { ip: '192.168.1.50', mask: '255.255.255.0', gateway: '192.168.1.1', dns: ['8.8.8.8', '8.8.4.4'] };
            adapter.ip = dhcpPool.ip;
            adapter.mask = dhcpPool.mask;
            adapter.gateway = dhcpPool.gateway;
            adapter.dns = dhcpPool.dns;
            _onStateChange();
            return `\nWindows IP Configuration\n\n   Successfully renewed IP address for adapter ${adapter.name}.\n`;
        }

        if (args.includes('/flushdns')) {
            _state._dnsFlushed = true;
            _onStateChange();
            return '\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.\n';
        }

        if (args.includes('/displaydns')) {
            if (_state._dnsPoisoned && !_state._dnsFlushed) {
                const poisoned = _config.poisonedDNS || {};
                let out = '\nWindows IP Configuration\n\n';
                for (const [domain, ip] of Object.entries(poisoned)) {
                    out += `    ${domain}\n    ----------------------------------------\n    Record Name . . : ${domain}\n    Record Type . . : 1\n    A (Host) Record : ${ip}\n\n`;
                }
                return out;
            }
            return '\nWindows IP Configuration\n\n   DNS Resolver Cache is empty.\n';
        }

        let out = '\nWindows IP Configuration\n\n';
        for (const adapter of _state.adapters) {
            if (!adapter.enabled) {
                out += `${adapter.type || 'Ethernet'} adapter ${adapter.name}:\n\n`;
                out += '   Media State . . . . . . . . . . . : Media disconnected\n\n';
                continue;
            }
            out += `${adapter.type || 'Ethernet'} adapter ${adapter.name}:\n\n`;
            if (showAll) {
                out += `   Description . . . . . . . . . . . : ${adapter.description || 'Intel(R) Ethernet Connection I219-V'}\n`;
                out += `   Physical Address. . . . . . . . . : ${adapter.mac || '00-1A-2B-3C-4D-5E'}\n`;
                out += `   DHCP Enabled. . . . . . . . . . . : ${adapter.dhcp ? 'Yes' : 'No'}\n`;
            }
            if (adapter.connected) {
                out += `   Connection-specific DNS Suffix  . : ${adapter.dnsSuffix || ''}\n`;
                out += `   IPv4 Address. . . . . . . . . . . : ${adapter.ip}\n`;
                out += `   Subnet Mask . . . . . . . . . . . : ${adapter.mask}\n`;
                out += `   Default Gateway . . . . . . . . . : ${adapter.gateway || ''}\n`;
                if (showAll && adapter.dns) {
                    out += `   DNS Servers . . . . . . . . . . . : ${adapter.dns[0] || ''}\n`;
                    for (let i = 1; i < adapter.dns.length; i++) {
                        if (adapter.dns[i]) out += `                                       ${adapter.dns[i]}\n`;
                    }
                }
                if (showAll) {
                    out += `   Lease Obtained. . . . . . . . . . : ${new Date().toLocaleString()}\n`;
                    out += `   Lease Expires . . . . . . . . . . : ${new Date(Date.now() + 86400000).toLocaleString()}\n`;
                }
            } else {
                out += '   Media State . . . . . . . . . . . : Media disconnected\n';
            }
            out += '\n';
        }
        return out;
    }

    function _cmdPing(args) {
        if (args.length === 0) return '\nUsage: ping [-t] [-n count] target_name\n';
        const target = args[args.length - 1];
        _updateConnectivity();
        const conn = _state.connectivity;

        // Loopback
        if (target === '127.0.0.1' || target === 'localhost') {
            return _pingSuccess(target, '127.0.0.1');
        }

        // Check adapter
        const active = _state.adapters.find(a => a.enabled && a.connected);
        if (!active) return _pingFail(target, 'General failure.');

        // Local subnet ping
        if (_isValidIP(target)) {
            const mask = active.mask || '255.255.255.0';
            if (_sameSubnet(active.ip, target, mask)) {
                return _pingSuccess(target, target);
            }
            // Ping gateway
            if (target === active.gateway) {
                return conn.gateway ? _pingSuccess(target, target) : _pingFail(target, 'Request timed out.');
            }
            // External IP
            return conn.internet ? _pingSuccess(target, target) : _pingFail(target, 'Request timed out.');
        }

        // Domain name
        if (!conn.dns) {
            return `\nPing request could not find host ${target}. Please check the name and try again.\n`;
        }
        const knownDomains = _config.knownDomains || {};
        const resolved = knownDomains[target];
        if (_state._dnsPoisoned && !_state._dnsFlushed) {
            const poisoned = _config.poisonedDNS || {};
            if (poisoned[target]) {
                return _pingFail(target, 'Request timed out.', poisoned[target]);
            }
        }
        if (resolved) {
            return _pingSuccess(target, resolved);
        }
        // Generic resolution
        return conn.internet ? _pingSuccess(target, '93.184.216.34') : _pingFail(target, 'Request timed out.');
    }

    function _pingSuccess(host, ip) {
        let out = `\nPinging ${host} [${ip}] with 32 bytes of data:\n`;
        for (let i = 0; i < 4; i++) {
            const ms = 2 + Math.floor(Math.random() * 15);
            out += `Reply from ${ip}: bytes=32 time=${ms}ms TTL=64\n`;
        }
        out += `\nPing statistics for ${ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 2ms, Maximum = 16ms, Average = 8ms\n`;
        return out;
    }

    function _pingFail(host, reason, ip) {
        const addr = ip || host;
        let out = `\nPinging ${host} [${addr}] with 32 bytes of data:\n`;
        for (let i = 0; i < 4; i++) out += `${reason}\n`;
        out += `\nPing statistics for ${addr}:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),\n`;
        return out;
    }

    function _cmdTracert(args) {
        if (args.length === 0) return '\nUsage: tracert target_name\n';
        const target = args[args.length - 1];
        _updateConnectivity();
        const conn = _state.connectivity;
        const active = _state.adapters.find(a => a.enabled && a.connected);

        if (!active || !conn.gateway) {
            return `\nUnable to resolve target system name ${target}.\n`;
        }

        let out = `\nTracing route to ${target}\nover a maximum of 30 hops:\n\n`;
        if (conn.internet) {
            const gw = active.gateway || '192.168.1.1';
            out += `  1    <1 ms    <1 ms    <1 ms  ${gw}\n`;
            out += `  2     5 ms     4 ms     5 ms  10.0.0.1\n`;
            out += `  3    12 ms    11 ms    12 ms  72.14.215.85\n`;
            out += `  4    14 ms    13 ms    14 ms  ${target}\n\n`;
            out += 'Trace complete.\n';
        } else {
            out += `  1     *        *        *     Request timed out.\n`;
            out += `  2     *        *        *     Request timed out.\n`;
            out += `  3     *        *        *     Request timed out.\n\n`;
        }
        return out;
    }

    function _cmdNslookup(args) {
        if (args.length === 0) return '\nUsage: nslookup name\n';
        const target = args[args.length - 1];
        _updateConnectivity();
        const conn = _state.connectivity;
        const active = _state.adapters.find(a => a.enabled && a.connected);

        if (!active || !conn.dns) {
            return `\n*** UnKnown can\'t find ${target}: No response from server\n`;
        }

        const dns1 = active.dns?.[0] || '8.8.8.8';
        const knownDomains = _config.knownDomains || {};
        const ip = knownDomains[target] || '93.184.216.34';

        return `\nServer:  dns.local\nAddress:  ${dns1}\n\nNon-authoritative answer:\nName:    ${target}\nAddress:  ${ip}\n\n`;
    }

    function _cmdNetstat(args) {
        const showAll = args.includes('-a');
        const showNumeric = args.includes('-n');
        const showRouting = args.includes('-r');

        if (showRouting) return _cmdRoute(['print']);

        let out = '\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n';
        const active = _state.adapters.find(a => a.enabled && a.connected);
        const lip = active ? active.ip : '0.0.0.0';

        out += `  TCP    ${lip}:49152        0.0.0.0:0              LISTENING\n`;
        out += `  TCP    ${lip}:49153        0.0.0.0:0              LISTENING\n`;
        if (showAll) {
            out += `  TCP    ${lip}:135          0.0.0.0:0              LISTENING\n`;
            out += `  TCP    ${lip}:445          0.0.0.0:0              LISTENING\n`;
            out += `  UDP    ${lip}:137          *:*\n`;
            out += `  UDP    ${lip}:138          *:*\n`;
        }
        out += '\n';
        return out;
    }

    function _cmdArp(args) {
        const active = _state.adapters.find(a => a.enabled && a.connected);
        if (!active || !active.gateway) {
            return '\nNo ARP Entries Found.\n';
        }

        let out = `\nInterface: ${active.ip} --- 0x2\n  Internet Address      Physical Address      Type\n`;
        const conn = _state.connectivity;
        if (conn.gateway) {
            out += `  ${active.gateway.padEnd(20)} 00-50-56-c0-00-08     dynamic\n`;
        }
        out += `  255.255.255.255       ff-ff-ff-ff-ff-ff     static\n`;
        out += '\n';
        return out;
    }

    function _cmdRoute(args) {
        const active = _state.adapters.find(a => a.enabled && a.connected);
        const ip = active ? active.ip : '0.0.0.0';
        const gw = active ? (active.gateway || '0.0.0.0') : '0.0.0.0';
        const mask = active ? (active.mask || '255.255.255.0') : '255.255.255.0';

        // Calculate network address
        const ipNum = _ipToNum(ip) || 0;
        const maskNum = _ipToNum(mask) || 0;
        const netNum = (ipNum & maskNum) >>> 0;
        const net = [(netNum >>> 24) & 255, (netNum >>> 16) & 255, (netNum >>> 8) & 255, netNum & 255].join('.');

        let out = '\nIPv4 Route Table\n===========================================================================\nActive Routes:\nNetwork Destination        Netmask          Gateway       Interface  Metric\n';
        out += `          0.0.0.0          0.0.0.0      ${gw.padEnd(14)}${ip.padEnd(14)} 25\n`;
        out += `     ${net.padEnd(17)}${mask.padEnd(17)}On-link       ${ip.padEnd(14)} 281\n`;
        out += `        127.0.0.0        255.0.0.0         On-link         127.0.0.1     331\n`;
        out += '===========================================================================\n';
        return out;
    }

    function _cmdNbtstat(args) {
        const active = _state.adapters.find(a => a.enabled && a.connected);
        if (!active) return '\n   Host not found.\n';

        if (args.includes('-n')) {
            return `\n    NetBIOS Local Name Table\n\n       Name               Type         Status\n    -----------------------------------------\n    WORKSTATION    <00>  UNIQUE      Registered\n    WORKSTATION    <20>  UNIQUE      Registered\n    WORKGROUP      <00>  GROUP       Registered\n\n`;
        }
        if (args.includes('-c')) {
            return `\n    NetBIOS Remote Cache Name Table\n\n       Name              Type       Host Address    Life [sec]\n    ------------------------------------------------------------\n    No names in cache\n\n`;
        }
        return '\nUsage: nbtstat [-n] [-c]\n';
    }

    function _cmdNetsh(args) {
        if (args.length < 5) return '\nUsage:\n  netsh interface ip set address "<adapter>" static <ip> <mask> <gw>\n  netsh interface ip set dns "<adapter>" static <dns>\n';

        const sub = args.map(a => a.toLowerCase());

        // netsh interface ip set address "Ethernet0" static 10.0.1.50 255.255.255.0 10.0.1.1
        if (sub[0] === 'interface' && sub[1] === 'ip' && sub[2] === 'set' && sub[3] === 'address') {
            const adapterName = args[4].replace(/"/g, '');
            const adapter = _getAdapter(adapterName);
            if (!adapter) return `\nThe adapter "${adapterName}" was not found.\n`;
            if (!adapter.enabled) return `\nThe adapter "${adapterName}" is disabled.\n`;

            if (sub[5] === 'static' && args[6] && args[7] && args[8]) {
                if (!_isValidIP(args[6]) || !_isValidIP(args[7]) || !_isValidIP(args[8])) {
                    return '\nThe parameter is incorrect.\n';
                }
                adapter.dhcp = false;
                adapter.ip = args[6];
                adapter.mask = args[7];
                adapter.gateway = args[8];
                _onStateChange();
                return '\nOk.\n\n';
            }
            if (sub[5] === 'dhcp') {
                adapter.dhcp = true;
                _onStateChange();
                return '\nOk.\n\n';
            }
        }

        // netsh interface ip set dns "Ethernet0" static 10.0.1.10
        if (sub[0] === 'interface' && sub[1] === 'ip' && sub[2] === 'set' && sub[3] === 'dns') {
            const adapterName = args[4].replace(/"/g, '');
            const adapter = _getAdapter(adapterName);
            if (!adapter) return `\nThe adapter "${adapterName}" was not found.\n`;

            if (sub[5] === 'static' && args[6]) {
                if (!_isValidIP(args[6])) return '\nThe parameter is incorrect.\n';
                adapter.dns = [args[6]];
                _onStateChange();
                return '\nOk.\n\n';
            }
        }

        return '\nThe syntax of the command is incorrect.\n';
    }

    // ─────────────────────────────────────────────────────────
    // TASK VERIFICATION
    // Checks whether a lab task's completion conditions are met
    // by examining the current simulated state. Each task has a
    // verify object with a type that determines the check:
    //
    //   command_run     — student ran a specific command
    //   window_opened   — student opened a specific window type
    //   service_state   — a service is in the expected status
    //   adapter_config  — adapter has correct IP/mask/gateway/DNS/DHCP
    //   adapter_enabled — adapter is enabled
    //   connectivity    — gateway/internet/dns flags match expected
    //   ping_success    — student ran ping AND internet is reachable
    //   dns_flushed     — student ran ipconfig /flushdns
    //   state_value     — arbitrary state path equals expected value
    //   state_match     — multiple state paths all match
    //   custom          — arbitrary function(state) returns boolean
    // ─────────────────────────────────────────────────────────

    /** Evaluate a task's verification conditions against current state. Returns boolean. */
    function _verifyTask(task) {
        const v = task.verify;
        if (!v) return false;

        switch (v.type) {
            case 'command_run':
                return _state._commandsRun.some(c => c.includes(v.command.toLowerCase()));

            case 'window_opened':
                return _state._windowsOpened.includes(v.window);

            case 'service_state': {
                const svc = _state.services.find(s => s.name === v.service);
                return svc && svc.status === v.status;
            }

            case 'adapter_config': {
                const adapter = _getAdapter(v.adapter);
                if (!adapter) return false;
                let ok = true;
                if (v.ip && adapter.ip !== v.ip) ok = false;
                if (v.mask && adapter.mask !== v.mask) ok = false;
                if (v.gateway && adapter.gateway !== v.gateway) ok = false;
                if (v.dns) {
                    const targetDNS = Array.isArray(v.dns) ? v.dns : [v.dns];
                    const adapterDNS = adapter.dns || [];
                    if (!targetDNS.every((d, i) => adapterDNS[i] === d)) ok = false;
                }
                if (v.dhcp !== undefined && adapter.dhcp !== v.dhcp) ok = false;
                if (v.enabled !== undefined && adapter.enabled !== v.enabled) ok = false;
                return ok;
            }

            case 'adapter_enabled': {
                const adapter = _getAdapter(v.adapter);
                return adapter && adapter.enabled === true;
            }

            case 'connectivity': {
                _updateConnectivity();
                const conn = _state.connectivity;
                let ok = true;
                if (v.gateway !== undefined && conn.gateway !== v.gateway) ok = false;
                if (v.internet !== undefined && conn.internet !== v.internet) ok = false;
                if (v.dns !== undefined && conn.dns !== v.dns) ok = false;
                return ok;
            }

            case 'ping_success': {
                const hasPing = _state._commandsRun.some(c => {
                    if (!c.startsWith('ping ')) return false;
                    if (v.target) {
                        const target = c.split(/\s+/).pop();
                        return target === v.target;
                    }
                    return true; // any ping counts if no specific target required
                });
                return hasPing && _state.connectivity.internet;
            }

            case 'dns_flushed':
                return _state._dnsFlushed === true;

            case 'state_value': {
                // Generic state check: v.path = 'webMgmt.firewall.rule1.enabled', v.value = false
                const val = _getNestedValue(_state, v.path);
                return val === v.value;
            }

            case 'state_match': {
                // Check multiple state paths
                if (!v.checks) return false;
                return v.checks.every(check => {
                    const val = _getNestedValue(_state, check.path);
                    return val === check.value;
                });
            }

            case 'custom':
                if (typeof v.fn === 'function') return v.fn(_state);
                return false;

            default:
                return false;
        }
    }

    /** Traverse a dotted path ('webMgmt.firewall.rule1.enabled') to read a nested value. */
    function _getNestedValue(obj, path) {
        const parts = path.split('.');
        let cur = obj;
        for (const p of parts) {
            if (cur == null) return undefined;
            cur = cur[p];
        }
        return cur;
    }

    /** Traverse a dotted path and set the leaf value. Creates intermediate objects if missing. */
    function _setNestedValue(obj, path, value) {
        const parts = path.split('.');
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            if (cur[parts[i]] == null) cur[parts[i]] = {};
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
    }

    // ─────────────────────────────────────────────────────────
    // SCORING
    // Points = (completed tasks * taskPoints) + time bonus.
    // Time bonus is proportional to remaining time if ALL
    // tasks are completed before the timer expires.
    // Default: 50 pts/task, 100 pts max time bonus, 30 min.
    // ─────────────────────────────────────────────────────────

    /** Calculate current score: task points + optional time bonus for early completion. */
    function _calculateScore() {
        const scoring = _config.scoring || {};
        const taskPoints = scoring.taskPoints || 50;
        const timeBonus = scoring.timeBonus || 100;
        const duration = _config.duration || 1800;
        const penalty = scoring.penalty || 0;

        let score = _completedTasks.length * taskPoints;
        const totalTasks = (_config.tasks || []).length;

        // Time bonus for finishing all tasks early
        if (_completedTasks.length === totalTasks && _elapsed < duration) {
            const remaining = duration - _elapsed;
            const ratio = remaining / duration;
            score += Math.round(timeBonus * ratio);
        }

        return score;
    }

    function _updateScoreDisplay() {
        const badge = _container.querySelector('.gle-score-badge');
        if (badge) badge.textContent = _calculateScore() + ' pts';
    }

    // ─────────────────────────────────────────────────────────
    // DOM: ROOT STRUCTURE
    // Builds the full desktop environment: desktop area with
    // icons, taskbar at the bottom, task panel on the right,
    // start overlay (lab briefing), and completion overlay.
    // ─────────────────────────────────────────────────────────

    /** Build the complete lab UI from scratch. Called on init and reset. */
    function _buildRoot() {
        _container.innerHTML = '';
        _container.className = 'gle-root';

        // Desktop area
        const desktop = _el('div', 'gle-desktop');
        desktop.id = 'gle-desktop';
        _container.appendChild(desktop);

        // Task panel
        _buildTaskPanel();

        // Taskbar
        _buildTaskbar();

        // Completion overlay
        _buildCompletionOverlay();

        // Start overlay
        _buildStartOverlay();

        // Build desktop icons
        _buildDesktopIcons();
    }

    function _buildDesktopIcons() {
        const desktop = _container.querySelector('#gle-desktop');
        const icons = _config.desktop || [];

        icons.forEach(iconDef => {
            const el = _el('div', 'gle-desktop-icon');
            el.innerHTML = `
                <div class="gle-icon-img">${_getIconGlyph(iconDef.icon)}</div>
                <div class="gle-icon-label">${_esc(iconDef.label)}</div>
            `;
            el.addEventListener('dblclick', () => _launchWindow(iconDef));
            el.addEventListener('click', () => {
                desktop.querySelectorAll('.gle-desktop-icon').forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');
            });
            desktop.appendChild(el);
        });
    }

    function _getIconGlyph(iconType) {
        const map = {
            network: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6ab0f3" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/><circle cx="8" cy="10" r="2"/><circle cx="16" cy="10" r="2"/><line x1="10" y1="10" x2="14" y2="10"/></svg>',
            terminal: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#cccccc" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><polyline points="6,9 10,12 6,15"/><line x1="12" y1="15" x2="18" y2="15"/></svg>',
            device_manager: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f2c94c" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="14" y2="14"/><circle cx="12" cy="19" r="1"/></svg>',
            services: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#6fcf97" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
            browser: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#e07cda" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            firewall: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#eb5757" stroke-width="1.5"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/><line x1="9" y1="12" x2="15" y2="12"/></svg>',
            dns: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#3a7bd5" stroke-width="1.5"><rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><circle cx="6" cy="6.5" r="1" fill="#6fcf97"/><circle cx="6" cy="17.5" r="1" fill="#6fcf97"/></svg>',
            dhcp: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f2994a" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><circle cx="7" cy="6.5" r="0.5" fill="#6fcf97"/><circle cx="9.5" cy="6.5" r="0.5" fill="#f2c94c"/><circle cx="12" cy="6.5" r="0.5" fill="#eb5757"/></svg>',
            generic: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#aaa" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="8" x2="22" y2="8"/><circle cx="5" cy="5.5" r="1"/></svg>'
        };
        return map[iconType] || map.generic;
    }

    // ─────────────────────────────────────────────────────────
    // DOM: TASKBAR
    // ─────────────────────────────────────────────────────────

    function _buildTaskbar() {
        const bar = _el('div', 'gle-taskbar');
        bar.innerHTML = `
            <div class="gle-taskbar-left">
                <span class="gle-taskbar-title">${_esc(_config.title || 'GUI Lab')}</span>
            </div>
            <div class="gle-taskbar-center" id="gle-taskbar-center"></div>
            <div class="gle-taskbar-right">
                <span class="gle-timer" id="gle-timer">0:00</span>
                <span class="gle-score-badge" id="gle-score-badge">0 pts</span>
                <button class="gle-task-toggle-btn" id="gle-task-toggle">Tasks</button>
            </div>
        `;
        _container.appendChild(bar);

        bar.querySelector('#gle-task-toggle').addEventListener('click', _toggleTaskPanel);
    }

    function _addTaskbarButton(appId, title) {
        const center = _container.querySelector('#gle-taskbar-center');
        if (!center) return;
        const btn = _el('button', 'gle-taskbar-btn active');
        btn.id = 'gle-tbtn-' + appId;
        btn.textContent = title;
        btn.addEventListener('click', () => {
            const win = _windows[appId];
            if (!win) return;
            if (win.el.classList.contains('minimized')) {
                win.el.classList.remove('minimized');
                _focusWindow(appId);
            } else if (win.el.classList.contains('focused')) {
                win.el.classList.add('minimized');
            } else {
                _focusWindow(appId);
            }
        });
        center.appendChild(btn);

        center.querySelectorAll('.gle-taskbar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    function _removeTaskbarButton(appId) {
        const btn = _container.querySelector('#gle-tbtn-' + appId);
        if (btn) btn.remove();
    }

    // ─────────────────────────────────────────────────────────
    // DOM: TASK PANEL
    // ─────────────────────────────────────────────────────────

    function _buildTaskPanel() {
        const panel = _el('div', 'gle-task-panel');
        panel.id = 'gle-task-panel';
        panel.innerHTML = `
            <div class="gle-task-panel-header">
                <h3>Lab Tasks</h3>
                <button class="gle-task-panel-close" id="gle-task-panel-close">&times;</button>
            </div>
            <div class="gle-task-progress">
                <div class="gle-task-progress-bar-bg"><div class="gle-task-progress-bar" id="gle-task-bar" style="width:0%"></div></div>
                <div class="gle-task-progress-text" id="gle-task-progress-text">0 / 0</div>
            </div>
            <div class="gle-task-list" id="gle-task-list"></div>
        `;
        _container.appendChild(panel);

        panel.querySelector('#gle-task-panel-close').addEventListener('click', _toggleTaskPanel);
    }

    function _toggleTaskPanel() {
        const panel = _container.querySelector('#gle-task-panel');
        if (!panel) return;
        _taskPanelOpen = !_taskPanelOpen;
        panel.classList.toggle('collapsed', !_taskPanelOpen);

        // Adjust desktop width
        const desktop = _container.querySelector('#gle-desktop');
        if (desktop) {
            desktop.style.right = _taskPanelOpen ? '320px' : '0';
        }
    }

    function _renderTasks() {
        const list = _container.querySelector('#gle-task-list');
        if (!list) return;
        list.innerHTML = '';

        const tasks = _config.tasks || [];
        const sequential = _config.sequentialTasks !== false;

        tasks.forEach((task, idx) => {
            const completed = _completedTasks.includes(task.id);
            const locked = sequential && idx > 0 && !_completedTasks.includes(tasks[idx - 1].id) && !completed;

            const item = _el('div', 'gle-task-item' + (completed ? ' completed' : '') + (locked ? ' locked' : ''));
            item.dataset.taskId = task.id;

            item.innerHTML = `
                <div class="gle-task-header">
                    <div class="gle-task-check">${completed ? '\u2713' : (idx + 1)}</div>
                    <div class="gle-task-title">${_esc(task.title)}</div>
                </div>
                <div class="gle-task-desc">${_esc(task.description)}</div>
                ${!completed && !locked ? '<button class="gle-task-verify-btn">Verify</button>' : ''}
            `;

            const verifyBtn = item.querySelector('.gle-task-verify-btn');
            if (verifyBtn) {
                verifyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    _verifyAndComplete(task);
                });
            }

            list.appendChild(item);
        });

        // Update progress
        _updateTaskProgress();
    }

    function _updateTaskProgress() {
        const total = (_config.tasks || []).length;
        const done = _completedTasks.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const bar = _container.querySelector('#gle-task-bar');
        if (bar) bar.style.width = pct + '%';

        const text = _container.querySelector('#gle-task-progress-text');
        if (text) text.textContent = done + ' / ' + total + ' tasks';
    }

    function _verifyAndComplete(task) {
        if (_completedTasks.includes(task.id)) return;

        const passed = _verifyTask(task);
        if (passed) {
            _completedTasks.push(task.id);
            _notify('Task completed: ' + task.title, 'success');
            _renderTasks();
            _updateScoreDisplay();

            // Check if all tasks done
            const total = (_config.tasks || []).length;
            if (_completedTasks.length >= total) {
                _showCompletion();
            }
        } else {
            _notify('Task not yet complete. Check your configuration.', 'error');
        }
    }

    // ─────────────────────────────────────────────────────────
    // DOM: WINDOWS
    // Window manager for the simulated desktop. Each window has:
    // - Title bar with drag, minimize, maximize, close buttons
    // - Optional menu bar and toolbar
    // - Content area (renders based on window type)
    // - Status bar and resize handle
    // Windows cascade position and maintain z-order focus stack.
    // Window types: network_adapter, cmd, device_manager,
    //   services, web_mgmt (generic configurable management UI)
    // ─────────────────────────────────────────────────────────

    /** Launch a window from a desktop icon definition. Focuses if already open. */
    function _launchWindow(iconDef) {
        const appId = iconDef.id;
        const windowType = iconDef.window;

        // Track opened window types
        if (!_state._windowsOpened.includes(windowType)) {
            _state._windowsOpened.push(windowType);
        }

        // If already open, focus
        if (_windows[appId]) {
            const win = _windows[appId];
            if (win.el.classList.contains('minimized')) {
                win.el.classList.remove('minimized');
            }
            _focusWindow(appId);
            return;
        }

        // Build content based on window type
        let contentEl;
        let menuItems = [];
        let toolbarItems = [];
        let statusText = '';
        let windowTitle = iconDef.label;

        switch (windowType) {
            case 'network_adapter':
                contentEl = _buildNetworkAdapterUI();
                menuItems = ['File', 'Edit', 'View', 'Help'];
                statusText = 'Network Connections';
                break;
            case 'cmd':
                contentEl = _buildCommandPromptUI();
                windowTitle = 'Command Prompt';
                statusText = 'Ready';
                break;
            case 'device_manager':
                contentEl = _buildDeviceManagerUI();
                menuItems = ['File', 'Action', 'View', 'Help'];
                toolbarItems = ['Scan for changes', 'Properties'];
                statusText = 'Device Manager';
                break;
            case 'services':
                contentEl = _buildServicesUI();
                menuItems = ['File', 'Action', 'View', 'Help'];
                statusText = 'Services';
                break;
            case 'web_mgmt':
                contentEl = _buildWebMgmtUI(iconDef.webMgmtConfig || _config.webMgmt);
                statusText = iconDef.webMgmtConfig?.title || 'Management Console';
                break;
            default:
                contentEl = _el('div', '', '<div style="padding:20px;color:#888;">No interface configured for this window type.</div>');
                break;
        }

        _openWindow(appId, windowTitle, iconDef.icon, contentEl, menuItems, toolbarItems, statusText);
    }

    function _openWindow(appId, title, iconType, contentEl, menuItems, toolbarItems, statusText) {
        if (_windows[appId]) {
            _focusWindow(appId);
            return;
        }

        const win = _el('div', 'gle-window focused');
        win.dataset.app = appId;

        // Cascade position
        const count = Object.keys(_windows).length;
        const top = 30 + (count * 35) % 180;
        const left = 60 + (count * 45) % 260;
        win.style.cssText = `top:${top}px; left:${left}px; width:720px; height:480px; z-index:${++_zIndex};`;

        // Title bar
        const titlebar = _el('div', 'gle-win-titlebar');
        titlebar.innerHTML = `
            <span class="gle-win-icon">${_getIconGlyph(iconType)}</span>
            <span class="gle-win-title">${_esc(title)}</span>
            <div class="gle-win-buttons">
                <button class="gle-win-btn gle-win-btn-minimize" title="Minimize"></button>
                <button class="gle-win-btn gle-win-btn-maximize" title="Maximize"></button>
                <button class="gle-win-btn gle-win-btn-close" title="Close"></button>
            </div>
        `;
        win.appendChild(titlebar);

        // Menu bar
        if (menuItems && menuItems.length > 0) {
            const menubar = _el('div', 'gle-win-menubar');
            menuItems.forEach(item => {
                const mi = _el('span', 'gle-win-menu-item', _esc(item));
                menubar.appendChild(mi);
            });
            win.appendChild(menubar);
        }

        // Toolbar
        if (toolbarItems && toolbarItems.length > 0) {
            const toolbar = _el('div', 'gle-win-toolbar');
            toolbarItems.forEach(item => {
                const btn = _el('button', 'gle-toolbar-btn', _esc(item));
                toolbar.appendChild(btn);
            });
            win.appendChild(toolbar);
        }

        // Content
        const content = _el('div', 'gle-win-content');
        content.appendChild(contentEl);
        win.appendChild(content);

        // Status bar
        if (statusText) {
            const statusbar = _el('div', 'gle-win-statusbar', _esc(statusText));
            win.appendChild(statusbar);
        }

        // Resize handle
        const resizeHandle = _el('div', 'gle-win-resize');
        win.appendChild(resizeHandle);

        // Events
        win.addEventListener('mousedown', () => _focusWindow(appId));
        titlebar.querySelector('.gle-win-btn-close').addEventListener('click', (e) => {
            e.stopPropagation();
            _closeWindow(appId);
        });
        titlebar.querySelector('.gle-win-btn-minimize').addEventListener('click', (e) => {
            e.stopPropagation();
            win.classList.add('minimized');
        });
        titlebar.querySelector('.gle-win-btn-maximize').addEventListener('click', (e) => {
            e.stopPropagation();
            _toggleMaximize(win);
        });

        _makeDraggable(win, titlebar);
        _makeResizable(win, resizeHandle);

        // Append to desktop area (before task panel)
        const desktop = _container.querySelector('#gle-desktop');
        desktop.appendChild(win);

        _windows[appId] = { el: win, title };
        _windowOrder.push(appId);

        _addTaskbarButton(appId, title);
        _focusWindow(appId);
    }

    function _closeWindow(appId) {
        const win = _windows[appId];
        if (!win) return;
        win.el.remove();
        delete _windows[appId];
        _windowOrder = _windowOrder.filter(id => id !== appId);
        _removeTaskbarButton(appId);
    }

    function _focusWindow(appId) {
        Object.values(_windows).forEach(w => w.el.classList.remove('focused'));
        const win = _windows[appId];
        if (win) {
            win.el.classList.add('focused');
            win.el.style.zIndex = ++_zIndex;
        }
        const center = _container.querySelector('#gle-taskbar-center');
        if (center) {
            center.querySelectorAll('.gle-taskbar-btn').forEach(b => b.classList.remove('active'));
            const btn = center.querySelector('#gle-tbtn-' + appId);
            if (btn) btn.classList.add('active');
        }
    }

    function _toggleMaximize(winEl) {
        if (winEl.dataset.maximized === 'true') {
            winEl.style.cssText = winEl.dataset.prevStyle;
            winEl.dataset.maximized = 'false';
        } else {
            winEl.dataset.prevStyle = winEl.style.cssText;
            const panelOffset = _taskPanelOpen ? 320 : 0;
            winEl.style.cssText = `top:0; left:0; width:calc(100% - ${panelOffset}px); height:calc(100% - 48px); z-index:${++_zIndex}; border-radius:0;`;
            winEl.dataset.maximized = 'true';
        }
    }

    function _makeDraggable(el, handle) {
        let startX, startY, origX, origY;
        handle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('gle-win-btn')) return;
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            origX = el.offsetLeft;
            origY = el.offsetTop;
            // Reset maximize state on drag
            el.dataset.maximized = 'false';

            const onMove = (e) => {
                el.style.left = (origX + e.clientX - startX) + 'px';
                el.style.top = Math.max(0, origY + e.clientY - startY) + 'px';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    function _makeResizable(el, handle) {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startW = el.offsetWidth;
            const startH = el.offsetHeight;

            const onMove = (e) => {
                el.style.width = Math.max(400, startW + e.clientX - startX) + 'px';
                el.style.height = Math.max(280, startH + e.clientY - startY) + 'px';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // ─────────────────────────────────────────────────────────
    // WINDOW: NETWORK ADAPTER PROPERTIES
    // ─────────────────────────────────────────────────────────

    function _buildNetworkAdapterUI() {
        const root = _el('div', 'gle-net-adapter');

        // Adapter list
        const listPane = _el('div', 'gle-net-adapter-list');
        // Props pane
        const propsPane = _el('div', 'gle-net-adapter-props');

        function renderList() {
            listPane.innerHTML = '';
            _state.adapters.forEach((adapter, idx) => {
                const statusCls = !adapter.enabled ? 'disabled' : (adapter.connected ? 'connected' : 'disconnected');
                const statusText = !adapter.enabled ? 'Disabled' : (adapter.connected ? 'Connected' : 'Disconnected');
                const item = _el('div', 'gle-net-adapter-item' + (idx === 0 ? ' selected' : ''));
                item.dataset.adapterIdx = idx;
                item.innerHTML = `
                    <div class="gle-adapter-icon">${_getIconGlyph('network')}</div>
                    <div class="gle-adapter-info">
                        <div class="gle-adapter-name">${_esc(adapter.name)}</div>
                        <div class="gle-adapter-status ${statusCls}">${statusText}${adapter.speed ? ' - ' + adapter.speed : ''}</div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    listPane.querySelectorAll('.gle-net-adapter-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    renderProps(idx);
                });
                listPane.appendChild(item);
            });
        }

        function renderProps(idx) {
            const adapter = _state.adapters[idx];
            if (!adapter) { propsPane.innerHTML = ''; return; }

            const dhcpChecked = adapter.dhcp ? 'checked' : '';
            const fieldsDisabled = adapter.dhcp ? 'disabled' : '';
            const enabledOn = adapter.enabled ? 'on' : '';

            propsPane.innerHTML = `
                <div class="gle-prop-section">
                    <h4>${_esc(adapter.name)} Properties</h4>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">Adapter Status</span>
                        <div class="gle-prop-toggle">
                            <div class="gle-toggle-track ${enabledOn}" id="gle-adapter-toggle" data-idx="${idx}">
                                <div class="gle-toggle-thumb"></div>
                            </div>
                            <span class="gle-toggle-label">${adapter.enabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">Connection</span>
                        <span style="color:${adapter.connected && adapter.enabled ? '#6fcf97' : '#eb5757'}; font-size:12px;">
                            ${adapter.connected && adapter.enabled ? 'Connected' : 'Disconnected'}
                            ${adapter.speed && adapter.enabled ? ' (' + adapter.speed + ')' : ''}
                        </span>
                    </div>
                    ${adapter.duplex ? `<div class="gle-prop-row"><span class="gle-prop-label">Duplex</span><span style="font-size:12px;color:#aaa;">${_esc(adapter.duplex)}</span></div>` : ''}
                    ${adapter.mac ? `<div class="gle-prop-row"><span class="gle-prop-label">MAC Address</span><span style="font-size:12px;color:#aaa;font-family:Consolas,monospace;">${_esc(adapter.mac)}</span></div>` : ''}
                </div>

                <div class="gle-prop-section">
                    <h4>IPv4 Configuration</h4>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">DHCP</span>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#aaa;cursor:pointer;">
                            <input type="checkbox" id="gle-dhcp-check" ${dhcpChecked} data-idx="${idx}"> Obtain IP automatically
                        </label>
                    </div>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">IP Address</span>
                        <input type="text" class="gle-prop-input" id="gle-ip-input" value="${_esc(adapter.ip)}" ${fieldsDisabled} data-idx="${idx}">
                    </div>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">Subnet Mask</span>
                        <input type="text" class="gle-prop-input" id="gle-mask-input" value="${_esc(adapter.mask)}" ${fieldsDisabled} data-idx="${idx}">
                    </div>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">Default Gateway</span>
                        <input type="text" class="gle-prop-input" id="gle-gw-input" value="${_esc(adapter.gateway || '')}" ${fieldsDisabled} data-idx="${idx}">
                    </div>
                </div>

                <div class="gle-prop-section">
                    <h4>DNS Servers</h4>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">Primary DNS</span>
                        <input type="text" class="gle-prop-input" id="gle-dns1-input" value="${_esc((adapter.dns && adapter.dns[0]) || '')}" ${fieldsDisabled} data-idx="${idx}">
                    </div>
                    <div class="gle-prop-row">
                        <span class="gle-prop-label">Secondary DNS</span>
                        <input type="text" class="gle-prop-input" id="gle-dns2-input" value="${_esc((adapter.dns && adapter.dns[1]) || '')}" ${fieldsDisabled} data-idx="${idx}">
                    </div>
                </div>

                <div class="gle-prop-btn-row">
                    <button class="gle-btn-secondary" id="gle-net-cancel">Cancel</button>
                    <button class="gle-btn-primary" id="gle-net-apply">Apply</button>
                </div>
            `;

            // Enable/Disable toggle
            const toggle = propsPane.querySelector('#gle-adapter-toggle');
            if (toggle) {
                toggle.addEventListener('click', () => {
                    adapter.enabled = !adapter.enabled;
                    _onStateChange();
                    renderList();
                    renderProps(idx);
                    _notify(adapter.name + (adapter.enabled ? ' enabled' : ' disabled'), adapter.enabled ? 'success' : 'warning');
                });
            }

            // DHCP toggle
            const dhcpCheck = propsPane.querySelector('#gle-dhcp-check');
            if (dhcpCheck) {
                dhcpCheck.addEventListener('change', () => {
                    adapter.dhcp = dhcpCheck.checked;
                    renderProps(idx);
                });
            }

            // Apply button
            const applyBtn = propsPane.querySelector('#gle-net-apply');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    if (adapter.dhcp) {
                        // Check DHCP service
                        const dhcpSvc = _state.services.find(s => s.name === 'DHCP Client');
                        if (dhcpSvc && dhcpSvc.status !== 'running') {
                            _notify('DHCP Client service is not running. Cannot obtain IP.', 'error');
                            return;
                        }
                        const pool = _config.dhcpPool || { ip: '192.168.1.50', mask: '255.255.255.0', gateway: '192.168.1.1', dns: ['8.8.8.8', '8.8.4.4'] };
                        adapter.ip = pool.ip;
                        adapter.mask = pool.mask;
                        adapter.gateway = pool.gateway;
                        adapter.dns = pool.dns;
                    } else {
                        const ipVal = propsPane.querySelector('#gle-ip-input').value.trim();
                        const maskVal = propsPane.querySelector('#gle-mask-input').value.trim();
                        const gwVal = propsPane.querySelector('#gle-gw-input').value.trim();
                        const dns1Val = propsPane.querySelector('#gle-dns1-input').value.trim();
                        const dns2Val = propsPane.querySelector('#gle-dns2-input').value.trim();

                        if (!_isValidIP(ipVal)) { _notify('Invalid IP address', 'error'); return; }
                        if (!_isValidIP(maskVal)) { _notify('Invalid subnet mask', 'error'); return; }
                        if (gwVal && !_isValidIP(gwVal)) { _notify('Invalid gateway', 'error'); return; }
                        if (dns1Val && !_isValidIP(dns1Val)) { _notify('Invalid primary DNS', 'error'); return; }
                        if (dns2Val && !_isValidIP(dns2Val)) { _notify('Invalid secondary DNS', 'error'); return; }

                        adapter.ip = ipVal;
                        adapter.mask = maskVal;
                        adapter.gateway = gwVal;
                        adapter.dns = [dns1Val, dns2Val].filter(d => d);
                    }

                    _onStateChange();
                    renderList();
                    renderProps(idx);
                    _notify('Network configuration applied', 'success');
                });
            }

            // Cancel button
            const cancelBtn = propsPane.querySelector('#gle-net-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => renderProps(idx));
            }
        }

        renderList();
        if (_state.adapters.length > 0) renderProps(0);

        // Subscribe to state changes to refresh UI
        _listeners.push(() => {
            renderList();
            const selectedItem = listPane.querySelector('.gle-net-adapter-item.selected');
            if (selectedItem) {
                renderProps(parseInt(selectedItem.dataset.adapterIdx, 10));
            }
        });

        root.appendChild(listPane);
        root.appendChild(propsPane);
        return root;
    }

    // ─────────────────────────────────────────────────────────
    // WINDOW: COMMAND PROMPT
    // ─────────────────────────────────────────────────────────

    function _buildCommandPromptUI() {
        const root = _el('div', 'gle-cmd');
        const output = _el('div', 'gle-cmd-output');
        const isLinux = _config && _config.osType === 'linux';
        const promptStr = isLinux ? 'admin@meridian:~$ ' : 'C:\\Users\\Student&gt;';
        const banner = isLinux
            ? 'admin@meridian-ws01 ~ $ bash\nLinux meridian-ws01 5.15.0-91-generic #101-Ubuntu SMP x86_64\nType "help" for available commands.\n\n'
            : 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n\n';
        output.textContent = banner;

        const inputRow = _el('div', 'gle-cmd-input-row');
        const promptText = _el('span', 'gle-cmd-prompt-text', promptStr);
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'gle-cmd-input';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');

        let historyIdx = -1;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value;
                output.textContent += (isLinux ? 'admin@meridian:~$ ' : 'C:\\Users\\Student>') + cmd + '\n';
                const result = _processCommand(cmd);

                if (result === '\x0C') {
                    output.textContent = '';
                } else {
                    output.textContent += result;
                }

                _commandHistory.unshift(cmd);
                historyIdx = -1;
                input.value = '';
                output.scrollTop = output.scrollHeight;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIdx < _commandHistory.length - 1) {
                    historyIdx++;
                    input.value = _commandHistory[historyIdx];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIdx > 0) {
                    historyIdx--;
                    input.value = _commandHistory[historyIdx];
                } else {
                    historyIdx = -1;
                    input.value = '';
                }
            }
        });

        inputRow.appendChild(promptText);
        inputRow.appendChild(input);
        root.appendChild(output);
        root.appendChild(inputRow);

        // Focus input on click
        root.addEventListener('click', () => input.focus());

        // Auto-focus when window is opened
        requestAnimationFrame(() => input.focus());

        return root;
    }

    // ─────────────────────────────────────────────────────────
    // WINDOW: DEVICE MANAGER
    // ─────────────────────────────────────────────────────────

    function _buildDeviceManagerUI() {
        const root = _el('div', 'gle-devmgr');
        const tree = _el('div', 'gle-devmgr-tree');

        // Default device tree categories
        const categories = _config.deviceTree || [
            {
                name: 'Network Adapters',
                icon: 'network',
                devices: () => _state.adapters.map(a => ({
                    name: a.description || a.name,
                    adapterRef: a.name,
                    enabled: a.enabled,
                    driver: a.driver || 'Intel Corporation',
                    driverVersion: a.driverVersion || '12.19.1.37',
                    irq: a.irq || '11'
                }))
            },
            {
                name: 'Display Adapters',
                icon: 'generic',
                devices: () => [{ name: 'Microsoft Basic Display Adapter', enabled: true }]
            },
            {
                name: 'Disk Drives',
                icon: 'generic',
                devices: () => [{ name: 'Virtual Disk Drive', enabled: true }]
            },
            {
                name: 'Keyboards',
                icon: 'generic',
                devices: () => [{ name: 'Standard PS/2 Keyboard', enabled: true }]
            },
            {
                name: 'Mice and other pointing devices',
                icon: 'generic',
                devices: () => [{ name: 'Microsoft PS/2 Mouse', enabled: true }]
            }
        ];

        let ctxMenu = null;

        function renderTree() {
            tree.innerHTML = `<div class="gle-devmgr-node" style="margin-bottom:8px;">
                <div class="gle-devmgr-branch" style="font-weight:600;">
                    <span class="gle-tree-icon">${_getIconGlyph('device_manager')}</span>
                    <span class="gle-tree-label" style="color:#ddd;">WORKSTATION</span>
                </div>
            </div>`;

            categories.forEach(cat => {
                const catNode = _el('div', 'gle-devmgr-node');
                const branch = _el('div', 'gle-devmgr-branch');
                branch.innerHTML = `
                    <span class="gle-tree-arrow expanded">\u25B6</span>
                    <span class="gle-tree-icon">${_getIconGlyph(cat.icon)}</span>
                    <span class="gle-tree-label">${_esc(cat.name)}</span>
                `;

                const children = _el('div', 'gle-devmgr-children');
                const devices = typeof cat.devices === 'function' ? cat.devices() : (cat.devices || []);

                devices.forEach(dev => {
                    const leaf = _el('div', 'gle-devmgr-leaf' + (dev.enabled === false ? ' disabled-device' : ''));
                    leaf.innerHTML = `
                        <span class="gle-tree-icon" style="font-size:12px;">${dev.enabled === false ? '\u26A0' : '\u2022'}</span>
                        <span>${_esc(dev.name)}${dev.enabled === false ? ' (Disabled)' : ''}</span>
                    `;

                    // Right-click context menu for network adapters
                    if (cat.name === 'Network Adapters' && dev.adapterRef) {
                        leaf.addEventListener('contextmenu', (e) => {
                            e.preventDefault();
                            _showDevMgrContextMenu(e, dev, renderTree);
                        });
                        leaf.addEventListener('click', () => {
                            tree.querySelectorAll('.gle-devmgr-leaf').forEach(l => l.classList.remove('selected'));
                            leaf.classList.add('selected');
                        });
                    }

                    children.appendChild(leaf);
                });

                branch.addEventListener('click', () => {
                    const arrow = branch.querySelector('.gle-tree-arrow');
                    arrow.classList.toggle('expanded');
                    children.classList.toggle('collapsed');
                });

                catNode.appendChild(branch);
                catNode.appendChild(children);
                tree.appendChild(catNode);
            });
        }

        function _showDevMgrContextMenu(e, dev, refreshFn) {
            // Remove existing context menu
            if (ctxMenu) ctxMenu.remove();

            ctxMenu = _el('div', 'gle-devmgr-ctx');
            const adapter = _getAdapter(dev.adapterRef);
            const isEnabled = adapter && adapter.enabled;

            const items = [
                { label: isEnabled ? 'Disable device' : 'Enable device', action: () => {
                    if (adapter) {
                        adapter.enabled = !adapter.enabled;
                        _onStateChange();
                        refreshFn();
                        _notify(adapter.name + (adapter.enabled ? ' enabled' : ' disabled'), adapter.enabled ? 'success' : 'warning');
                    }
                }},
                { label: 'Update driver', action: () => _notify('Driver is up to date.', 'info') },
                { sep: true },
                { label: 'Properties', action: () => {
                    _notify(`${dev.name}\nDriver: ${dev.driver || 'N/A'}\nVersion: ${dev.driverVersion || 'N/A'}\nIRQ: ${dev.irq || 'N/A'}`, 'info');
                }}
            ];

            items.forEach(item => {
                if (item.sep) {
                    ctxMenu.appendChild(_el('div', 'gle-devmgr-ctx-sep'));
                    return;
                }
                const menuItem = _el('div', 'gle-devmgr-ctx-item', _esc(item.label));
                menuItem.addEventListener('click', () => {
                    item.action();
                    ctxMenu.remove();
                    ctxMenu = null;
                });
                ctxMenu.appendChild(menuItem);
            });

            // Position near click
            const rect = _container.getBoundingClientRect();
            ctxMenu.style.left = (e.clientX - rect.left) + 'px';
            ctxMenu.style.top = (e.clientY - rect.top) + 'px';
            _container.appendChild(ctxMenu);

            // Close on click elsewhere
            const closeCtx = (ev) => {
                if (ctxMenu && !ctxMenu.contains(ev.target)) {
                    ctxMenu.remove();
                    ctxMenu = null;
                    document.removeEventListener('click', closeCtx);
                }
            };
            setTimeout(() => document.addEventListener('click', closeCtx), 10);
        }

        renderTree();

        // Refresh on state change
        _listeners.push(() => renderTree());

        root.appendChild(tree);
        return root;
    }

    // ─────────────────────────────────────────────────────────
    // WINDOW: SERVICES CONSOLE
    // ─────────────────────────────────────────────────────────

    function _buildServicesUI() {
        const root = _el('div', 'gle-services');

        // Header row
        const header = _el('div', 'gle-services-header');
        header.innerHTML = '<span>Name</span><span>Status</span><span>Startup</span><span>Actions</span>';
        root.appendChild(header);

        const listContainer = _el('div', 'gle-services-list');

        function renderServices() {
            listContainer.innerHTML = '';
            const services = _state.services || [];

            services.forEach((svc, idx) => {
                const row = _el('div', 'gle-services-row');
                row.dataset.svcIdx = idx;

                const isRunning = svc.status === 'running';
                const startup = svc.startup || 'Automatic';

                row.innerHTML = `
                    <span class="gle-svc-name">${_esc(svc.name)}</span>
                    <span class="gle-svc-status ${isRunning ? 'running' : 'stopped'}">${isRunning ? 'Running' : 'Stopped'}</span>
                    <span class="gle-svc-startup">${_esc(startup)}</span>
                    <div class="gle-svc-actions">
                        <button class="gle-svc-action-btn" data-action="start" ${isRunning ? 'disabled' : ''}>Start</button>
                        <button class="gle-svc-action-btn" data-action="stop" ${!isRunning ? 'disabled' : ''}>Stop</button>
                        <button class="gle-svc-action-btn" data-action="restart">Restart</button>
                    </div>
                `;

                row.querySelector('[data-action="start"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    svc.status = 'running';
                    _onStateChange();
                    renderServices();
                    _notify(svc.name + ' started', 'success');
                });

                row.querySelector('[data-action="stop"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    svc.status = 'stopped';
                    _onStateChange();
                    renderServices();
                    _notify(svc.name + ' stopped', 'warning');
                });

                row.querySelector('[data-action="restart"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    svc.status = 'stopped';
                    renderServices();
                    setTimeout(() => {
                        svc.status = 'running';
                        _onStateChange();
                        renderServices();
                        _notify(svc.name + ' restarted', 'success');
                    }, 500);
                });

                row.addEventListener('click', () => {
                    listContainer.querySelectorAll('.gle-services-row').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                });

                listContainer.appendChild(row);
            });
        }

        renderServices();
        _listeners.push(() => renderServices());

        root.appendChild(listContainer);
        return root;
    }

    // ─────────────────────────────────────────────────────────
    // WINDOW: WEB MANAGEMENT INTERFACE (GENERIC)
    // ─────────────────────────────────────────────────────────

    function _buildWebMgmtUI(wmConfig) {
        const cfg = wmConfig || {};
        const root = _el('div', 'gle-webmgmt');

        // Sidebar
        const sidebar = _el('div', 'gle-webmgmt-sidebar');
        const sidebarHeader = _el('div', 'gle-webmgmt-sidebar-header', _esc(cfg.title || 'Management Console'));
        sidebar.appendChild(sidebarHeader);

        // Content area
        const contentArea = _el('div', 'gle-webmgmt-content');

        const sections = cfg.sections || [];
        let activeSection = sections[0]?.id || null;

        function renderSidebar() {
            // Clear nav items but keep header
            const navItems = sidebar.querySelectorAll('.gle-webmgmt-nav-item, .gle-webmgmt-nav-section');
            navItems.forEach(n => n.remove());

            let currentGroup = null;
            sections.forEach(section => {
                if (section.group && section.group !== currentGroup) {
                    currentGroup = section.group;
                    const groupEl = _el('div', 'gle-webmgmt-nav-section', _esc(currentGroup));
                    sidebar.appendChild(groupEl);
                }

                const navItem = _el('div', 'gle-webmgmt-nav-item' + (section.id === activeSection ? ' active' : ''));
                navItem.textContent = section.label;
                navItem.addEventListener('click', () => {
                    activeSection = section.id;
                    renderSidebar();
                    renderContent(section);
                });
                sidebar.appendChild(navItem);
            });
        }

        function renderContent(section) {
            contentArea.innerHTML = '';
            if (!section) return;

            const title = _el('h3', 'gle-webmgmt-page-title', _esc(section.label));
            contentArea.appendChild(title);

            // Render fields
            const fields = section.fields || [];
            fields.forEach(field => {
                const group = _el('div', 'gle-webmgmt-form-group');

                if (field.type === 'text' || field.type === 'ip' || field.type === 'number') {
                    const label = _el('label', 'gle-webmgmt-form-label', _esc(field.label));
                    const input = document.createElement('input');
                    input.type = field.type === 'number' ? 'number' : 'text';
                    input.className = 'gle-webmgmt-form-input';
                    input.value = _getNestedValue(_state, field.statePath) || field.default || '';
                    if (field.placeholder) input.placeholder = field.placeholder;
                    if (field.readonly) input.readOnly = true;

                    input.addEventListener('change', () => {
                        _setNestedValue(_state, field.statePath, input.value);
                        _onStateChange();
                    });

                    group.appendChild(label);
                    group.appendChild(input);
                }

                else if (field.type === 'select') {
                    const label = _el('label', 'gle-webmgmt-form-label', _esc(field.label));
                    const select = document.createElement('select');
                    select.className = 'gle-webmgmt-form-select';
                    (field.options || []).forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt.value;
                        option.textContent = opt.label;
                        if (opt.value === _getNestedValue(_state, field.statePath)) option.selected = true;
                        select.appendChild(option);
                    });

                    select.addEventListener('change', () => {
                        _setNestedValue(_state, field.statePath, select.value);
                        _onStateChange();
                    });

                    group.appendChild(label);
                    group.appendChild(select);
                }

                else if (field.type === 'toggle') {
                    const label = _el('label', 'gle-webmgmt-form-label', _esc(field.label));
                    const curVal = _getNestedValue(_state, field.statePath);
                    const isOn = curVal === true || curVal === 'true';

                    const toggleWrap = _el('div', 'gle-prop-toggle');
                    const track = _el('div', 'gle-toggle-track' + (isOn ? ' on' : ''));
                    track.innerHTML = '<div class="gle-toggle-thumb"></div>';
                    const toggleLabel = _el('span', 'gle-toggle-label', isOn ? (field.onLabel || 'Enabled') : (field.offLabel || 'Disabled'));

                    track.addEventListener('click', () => {
                        const newVal = !_getNestedValue(_state, field.statePath);
                        _setNestedValue(_state, field.statePath, newVal);
                        track.classList.toggle('on', newVal);
                        toggleLabel.textContent = newVal ? (field.onLabel || 'Enabled') : (field.offLabel || 'Disabled');
                        _onStateChange();
                    });

                    toggleWrap.appendChild(track);
                    toggleWrap.appendChild(toggleLabel);
                    group.appendChild(label);
                    group.appendChild(toggleWrap);
                }

                else if (field.type === 'table') {
                    const label = _el('label', 'gle-webmgmt-form-label', _esc(field.label));
                    group.appendChild(label);

                    const table = _el('table', 'gle-webmgmt-table');
                    // Header
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    (field.columns || []).forEach(col => {
                        const th = document.createElement('th');
                        th.textContent = col.label;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);

                    // Rows
                    const tbody = document.createElement('tbody');
                    const data = _getNestedValue(_state, field.statePath) || [];
                    (Array.isArray(data) ? data : []).forEach(row => {
                        const tr = document.createElement('tr');
                        (field.columns || []).forEach(col => {
                            const td = document.createElement('td');
                            td.textContent = row[col.key] || '';
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    group.appendChild(table);
                }

                else if (field.type === 'info') {
                    const label = _el('label', 'gle-webmgmt-form-label', _esc(field.label));
                    const val = _el('div', '', '<span style="font-size:13px;color:#ddd;">' + _esc(_getNestedValue(_state, field.statePath) || field.default || 'N/A') + '</span>');
                    group.appendChild(label);
                    group.appendChild(val);
                }

                contentArea.appendChild(group);
            });

            // Apply/Save bar
            if (section.saveable !== false && fields.length > 0) {
                const saveBar = _el('div', 'gle-webmgmt-save-bar');
                const saveBtn = _el('button', 'gle-btn-primary', 'Apply Changes');
                const resetBtn = _el('button', 'gle-btn-secondary', 'Reset');

                saveBtn.addEventListener('click', () => {
                    _onStateChange();
                    _notify('Configuration saved', 'success');
                    if (typeof section.onSave === 'function') {
                        section.onSave(_state);
                        renderContent(section);
                    }
                });

                resetBtn.addEventListener('click', () => {
                    renderContent(section);
                    _notify('Changes reverted', 'warning');
                });

                saveBar.appendChild(resetBtn);
                saveBar.appendChild(saveBtn);
                contentArea.appendChild(saveBar);
            }
        }

        renderSidebar();
        if (sections[0]) renderContent(sections[0]);

        root.appendChild(sidebar);
        root.appendChild(contentArea);
        return root;
    }

    // ─────────────────────────────────────────────────────────
    // DOM: START OVERLAY
    // ─────────────────────────────────────────────────────────

    function _buildStartOverlay() {
        const overlay = _el('div', 'gle-start-overlay');
        overlay.id = 'gle-start-overlay';

        const tasks = _config.tasks || [];
        const duration = _config.duration || 1800;
        const objectives = _config.certObjectives || [];

        let objectivesHtml = '';
        if (objectives.length > 0) {
            objectivesHtml = `
                <div class="gle-start-objectives">
                    <h4>Certification Objectives Covered</h4>
                    <ul>${objectives.map(o => '<li>' + _esc(o) + '</li>').join('')}</ul>
                </div>
            `;
        }

        overlay.innerHTML = `
            <div class="gle-start-card">
                <h2>${_esc(_config.title || 'GUI Lab')}</h2>
                <div class="gle-start-subtitle">${_esc(_config.subtitle || '')}</div>
                ${objectivesHtml}
                <div class="gle-start-meta">
                    ${tasks.length} tasks &middot; ${Math.round(duration / 60)} minutes &middot; ${(_config.scoring?.maxScore || (tasks.length * 50)) + ' points possible'}
                </div>
                <button class="gle-start-btn" id="gle-start-btn">Begin Lab</button>
            </div>
        `;

        _container.appendChild(overlay);

        overlay.querySelector('#gle-start-btn').addEventListener('click', () => {
            overlay.style.display = 'none';
            _startTimer();
            _renderTasks();
            // Adjust desktop for task panel
            const desktop = _container.querySelector('#gle-desktop');
            if (desktop) desktop.style.right = '320px';
        });
    }

    // ─────────────────────────────────────────────────────────
    // DOM: COMPLETION OVERLAY
    // ─────────────────────────────────────────────────────────

    function _buildCompletionOverlay() {
        const overlay = _el('div', 'gle-completion-overlay');
        overlay.id = 'gle-completion-overlay';
        overlay.innerHTML = `
            <div class="gle-completion-card">
                <h2>Lab Complete</h2>
                <div class="gle-completion-subtitle" id="gle-comp-subtitle"></div>
                <div class="gle-completion-score" id="gle-comp-score"></div>
                <div class="gle-completion-breakdown" id="gle-comp-breakdown"></div>
                <div class="gle-completion-time" id="gle-comp-time"></div>
                <div class="gle-completion-btns">
                    <button class="gle-completion-btn secondary" id="gle-comp-retry">Retry Lab</button>
                    <button class="gle-completion-btn primary" id="gle-comp-close">Continue</button>
                </div>
            </div>
        `;
        _container.appendChild(overlay);

        overlay.querySelector('#gle-comp-close').addEventListener('click', () => {
            overlay.classList.remove('active');
        });
        overlay.querySelector('#gle-comp-retry').addEventListener('click', () => {
            _reset();
        });
    }

    /**
     * Show the completion overlay with final score, breakdown, and time.
     * Also reports completion to ModuleProgress (platform XP system)
     * so the lab counts toward the student's Web house progress.
     */
    function _showCompletion() {
        _stopTimer();

        const score = _calculateScore();
        const total = (_config.tasks || []).length;
        const done = _completedTasks.length;
        const scoring = _config.scoring || {};
        const taskPoints = scoring.taskPoints || 50;
        const duration = _config.duration || 1800;

        const overlay = _container.querySelector('#gle-completion-overlay');
        if (!overlay) return;

        overlay.querySelector('#gle-comp-subtitle').textContent = _config.subtitle || '';
        overlay.querySelector('#gle-comp-score').textContent = score + ' pts';

        let breakdown = `<span>${done}/${total}</span> tasks completed (${done * taskPoints} pts)`;
        if (done === total && _elapsed < duration) {
            const remaining = duration - _elapsed;
            const timeBonus = Math.round((scoring.timeBonus || 100) * (remaining / duration));
            breakdown += `<br>Time bonus: <span>+${timeBonus} pts</span>`;
        }
        overlay.querySelector('#gle-comp-breakdown').innerHTML = breakdown;
        overlay.querySelector('#gle-comp-time').textContent = 'Completed in ' + _formatTime(_elapsed);

        overlay.classList.add('active');

        // Report completion to platform progress system
        if (typeof ModuleProgress !== 'undefined' && _config.id) {
            try {
                ModuleProgress.complete('web', _config.id, { returnUrl: '../index.html' });
            } catch (e) { console.warn('[GUILab] ModuleProgress error:', e); }
        }
    }

    // ─────────────────────────────────────────────────────────
    // TIMER
    // Countdown from config.duration (default 1800s = 30 min).
    // Visual states: normal (green), warning (<5 min, yellow),
    // critical (<1 min, red with pulse animation).
    // Timer expiry triggers _showCompletion() with current progress.
    // ─────────────────────────────────────────────────────────

    /** Start the countdown timer. Updates every second. */
    function _startTimer() {
        _startTime = Date.now();
        _elapsed = 0;

        _clockInterval = setInterval(() => {
            if (_paused) return;
            _elapsed = Math.floor((Date.now() - _startTime) / 1000);

            const timerEl = _container.querySelector('#gle-timer');
            if (!timerEl) return;

            const duration = _config.duration || 1800;
            const remaining = Math.max(0, duration - _elapsed);
            timerEl.textContent = _formatTime(remaining);

            // Warning states
            timerEl.classList.remove('warning', 'critical');
            if (remaining <= 60) {
                timerEl.classList.add('critical');
            } else if (remaining <= 300) {
                timerEl.classList.add('warning');
            }

            // Time's up
            if (remaining <= 0) {
                _stopTimer();
                _showCompletion();
            }
        }, 1000);
    }

    function _stopTimer() {
        if (_clockInterval) {
            clearInterval(_clockInterval);
            _clockInterval = null;
        }
    }

    // ─────────────────────────────────────────────────────────
    // RESET
    // Full lab reset — clears all state, windows, progress,
    // and re-renders from the original config. Used by the
    // "Retry Lab" button on the completion overlay.
    // ─────────────────────────────────────────────────────────

    /** Reset the entire lab to initial state and rebuild the UI. */
    function _reset() {
        _stopTimer();
        _windows = {};
        _windowOrder = [];
        _zIndex = 100;
        _completedTasks = [];
        _commandHistory = [];
        _listeners = [];
        _taskPanelOpen = true;
        _elapsed = 0;
        _initState();
        _buildRoot();
    }

    // ─────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────

    return {
        /**
         * Initialize the GUI Lab Engine.
         * @param {Object} config - Lab configuration object
         * @param {HTMLElement} container - DOM element to render into
         */
        init(config, container) {
            _config = config;
            _container = container;

            _injectCSS();
            _initState();
            _buildRoot();

            console.log(`%c[GUILab] Initialized: ${config.title || 'GUI Lab'}`, 'color: #0078d4; font-weight: bold;');
        },

        /** Get current engine state (read-only clone) */
        getState() {
            return _deepClone(_state);
        },

        /** Subscribe to state changes */
        onStateChange(fn) {
            _listeners.push(fn);
        },

        /** Programmatically verify a task by ID */
        verifyTask(taskId) {
            const task = (_config.tasks || []).find(t => t.id === taskId);
            if (task) _verifyAndComplete(task);
        },

        /** Get completion status */
        isComplete() {
            const total = (_config.tasks || []).length;
            return _completedTasks.length >= total;
        },

        /** Get current score */
        getScore() {
            return _calculateScore();
        },

        /** Get elapsed time in seconds */
        getElapsed() {
            return _elapsed;
        },

        /** Reset the lab */
        reset() {
            _reset();
        },

        /** Notify user */
        notify(msg, type) {
            _notify(msg, type);
        }
    };

})();
