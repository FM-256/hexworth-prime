/**
 * FileTreeExplorer - Factionless Content Navigation
 *
 * A terminal-style file tree interface for Divergent users.
 * Replaces house-based content cards with a skill-based tree.
 *
 * Inspired by: Final Fantasy 7 Remake skill trees + Unix file systems
 */

const FileTreeExplorer = {
    currentPerspective: 'fundamentals',
    container: null,

    /**
     * Initialize the explorer in a container element
     */
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('FileTreeExplorer: Container not found:', containerId);
            return;
        }

        this.render();
        console.log('%c⚡ FileTreeExplorer initialized', 'color: #ff00ff;');
    },

    /**
     * Main render function
     */
    render() {
        if (!this.container) return;

        const stats = SkillTree.getPerspectiveStats(this.currentPerspective);
        const perspective = SkillTree.getPerspective(this.currentPerspective);

        this.container.innerHTML = `
            <div class="file-tree-explorer">
                <div class="fte-header">
                    <div class="fte-title">
                        <span class="fte-icon">⚡</span>
                        <span class="fte-name">FACTIONLESS EXPLORER</span>
                    </div>
                    <div class="fte-stats">
                        <span class="fte-progress">${stats.completed}/${stats.total}</span>
                        <span class="fte-percentage">${stats.percentage}%</span>
                    </div>
                </div>

                <div class="fte-tabs">
                    ${this.renderTabs()}
                </div>

                <div class="fte-path">
                    <span class="fte-prompt">~/${this.currentPerspective}/</span>
                </div>

                <div class="fte-tree">
                    ${this.renderTree()}
                </div>

                <div class="fte-footer">
                    <span class="fte-hint">Click a file to open • Click folders to expand</span>
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    /**
     * Render perspective tabs
     */
    renderTabs() {
        const perspectives = SkillTree.getPerspectives();

        return perspectives.map(id => {
            const p = SkillTree.getPerspective(id);
            const isActive = id === this.currentPerspective;
            const stats = SkillTree.getPerspectiveStats(id);

            return `
                <button class="fte-tab ${isActive ? 'active' : ''}"
                        data-perspective="${id}"
                        style="--tab-color: ${p.color}">
                    <span class="fte-tab-icon">${p.icon}</span>
                    <span class="fte-tab-name">${p.name}</span>
                    <span class="fte-tab-count">${stats.completed}/${stats.total}</span>
                </button>
            `;
        }).join('');
    },

    /**
     * Render the file tree
     */
    renderTree() {
        const perspective = SkillTree.getPerspective(this.currentPerspective);
        if (!perspective) return '<div class="fte-error">Perspective not found</div>';

        const folders = Object.entries(perspective.folders);

        return folders.map(([folderId, folder], index) => {
            const isLast = index === folders.length - 1;
            const isExpanded = SkillTree.getFolderState(this.currentPerspective, folderId);
            const prefix = isLast ? '└── ' : '├── ';
            const childPrefix = isLast ? '    ' : '│   ';

            const folderLocked = folder.locked;
            const folderIcon = folderLocked ? '🔒' : (isExpanded ? '📂' : '📁');

            let folderHtml = `
                <div class="fte-folder ${folderLocked ? 'locked' : ''}"
                     data-folder="${folderId}"
                     data-expanded="${isExpanded}">
                    <span class="fte-prefix">${prefix}</span>
                    <span class="fte-folder-icon">${folderIcon}</span>
                    <span class="fte-folder-name">${folder.displayName}/</span>
                    <span class="fte-folder-count">[${folder.items.length}]</span>
                    ${folderLocked ? `<span class="fte-lock-hint">${folder.unlockHint || 'Locked'}</span>` : ''}
                </div>
            `;

            if (isExpanded && !folderLocked) {
                folderHtml += this.renderFolderItems(folder.items, childPrefix);
            }

            return folderHtml;
        }).join('');
    },

    /**
     * Render items within a folder
     */
    renderFolderItems(items, prefix) {
        return items.map((item, index) => {
            const isLast = index === items.length - 1;
            const itemPrefix = prefix + (isLast ? '└── ' : '├── ');

            const isCompleted = SkillTree.isCompleted(item.contentId);
            const isLocked = item.locked || SkillTree.isLocked(item.contentId);

            let statusIcon = '○'; // Not started
            let statusClass = 'available';

            if (isLocked) {
                statusIcon = '❓';
                statusClass = 'locked';
            } else if (isCompleted) {
                statusIcon = '✓';
                statusClass = 'completed';
            }

            const displayTitle = isLocked && !item.title.includes('?') ? '?' : item.title;
            const displayFile = isLocked ? '?.md' : item.file;

            return `
                <div class="fte-item ${statusClass}"
                     data-content-id="${item.contentId || ''}"
                     ${isLocked ? 'data-locked="true"' : ''}>
                    <span class="fte-prefix">${itemPrefix}</span>
                    <span class="fte-item-icon">📄</span>
                    <span class="fte-item-name">${displayFile}</span>
                    <span class="fte-item-status">${statusIcon}</span>
                    <span class="fte-item-title">${displayTitle}</span>
                </div>
            `;
        }).join('');
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Tab clicks
        this.container.querySelectorAll('.fte-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const perspective = e.currentTarget.dataset.perspective;
                this.switchPerspective(perspective);
            });
        });

        // Folder clicks
        this.container.querySelectorAll('.fte-folder:not(.locked)').forEach(folder => {
            folder.addEventListener('click', (e) => {
                const folderId = e.currentTarget.dataset.folder;
                this.toggleFolder(folderId);
            });
        });

        // Item clicks
        this.container.querySelectorAll('.fte-item:not(.locked)').forEach(item => {
            item.addEventListener('click', (e) => {
                const contentId = e.currentTarget.dataset.contentId;
                if (contentId) {
                    this.openContent(contentId);
                }
            });
        });
    },

    /**
     * Switch to a different perspective
     */
    switchPerspective(perspectiveId) {
        if (this.currentPerspective === perspectiveId) return;

        this.currentPerspective = perspectiveId;
        this.render();

        // Visual feedback
        this.container.style.transition = 'opacity 0.15s';
        this.container.style.opacity = '0.7';
        setTimeout(() => {
            this.container.style.opacity = '1';
        }, 150);
    },

    /**
     * Toggle folder expanded/collapsed
     */
    toggleFolder(folderId) {
        const currentState = SkillTree.getFolderState(this.currentPerspective, folderId);
        SkillTree.setFolderState(this.currentPerspective, folderId, !currentState);
        this.render();
    },

    /**
     * Open content item
     */
    openContent(contentId) {
        const content = ContentRegistry.content[contentId];
        if (!content) {
            console.error('Content not found:', contentId);
            return;
        }

        // Find the appropriate component to open
        let targetPath = null;

        if (content.components) {
            // Priority: applet > presentation > lab > quiz
            if (content.components.applet) {
                targetPath = content.components.applet;
            } else if (content.components.presentation) {
                targetPath = content.components.presentation;
            } else if (content.components.lab) {
                targetPath = content.components.lab;
            } else if (content.components.quiz) {
                targetPath = content.components.quiz;
            }
        }

        if (targetPath) {
            // Visual feedback
            this.container.style.transition = 'filter 0.2s, opacity 0.2s';
            this.container.style.filter = 'brightness(1.5)';
            this.container.style.opacity = '0.8';

            setTimeout(() => {
                window.location.href = targetPath;
            }, 200);
        } else {
            console.warn('No component path found for:', contentId);
        }
    }
};

// CSS Styles for FileTreeExplorer
const FileTreeExplorerStyles = `
<style id="file-tree-explorer-styles">
.file-tree-explorer {
    background: #0a0a0a;
    border: 1px solid #1a3a1a;
    border-radius: 8px;
    font-family: 'Courier New', 'Consolas', monospace;
    color: #00cc44;
    overflow: hidden;
}

.fte-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: linear-gradient(180deg, #0d1a0d 0%, #0a0a0a 100%);
    border-bottom: 1px solid #1a3a1a;
}

.fte-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.fte-icon {
    font-size: 1.2rem;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.fte-name {
    font-size: 0.85rem;
    font-weight: bold;
    letter-spacing: 0.15em;
    color: #ff00ff;
}

.fte-stats {
    display: flex;
    gap: 15px;
    font-size: 0.75rem;
}

.fte-progress {
    color: #00aa44;
}

.fte-percentage {
    color: #00ffff;
    font-weight: bold;
}

.fte-tabs {
    display: flex;
    gap: 5px;
    padding: 10px 15px;
    background: #050505;
    border-bottom: 1px solid #1a3a1a;
}

.fte-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    background: transparent;
    border: 1px solid #1a3a1a;
    border-radius: 4px;
    color: #666;
    font-family: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.fte-tab:hover {
    background: rgba(0, 255, 0, 0.05);
    border-color: #2a4a2a;
    color: #00aa44;
}

.fte-tab.active {
    background: rgba(0, 255, 0, 0.1);
    border-color: var(--tab-color, #00cc44);
    color: var(--tab-color, #00cc44);
}

.fte-tab-icon {
    font-size: 1rem;
}

.fte-tab-name {
    font-weight: bold;
}

.fte-tab-count {
    opacity: 0.7;
    font-size: 0.65rem;
}

.fte-path {
    padding: 10px 20px;
    font-size: 0.8rem;
    color: #00aa44;
    border-bottom: 1px solid #0d1a0d;
}

.fte-prompt::before {
    content: '$ ';
    color: #666;
}

.fte-tree {
    padding: 15px 20px;
    max-height: 400px;
    overflow-y: auto;
    line-height: 1.8;
}

.fte-tree::-webkit-scrollbar {
    width: 8px;
}

.fte-tree::-webkit-scrollbar-track {
    background: #0a0a0a;
}

.fte-tree::-webkit-scrollbar-thumb {
    background: #1a3a1a;
    border-radius: 4px;
}

.fte-folder {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 2px 0;
    transition: background 0.1s;
}

.fte-folder:hover {
    background: rgba(0, 255, 0, 0.05);
}

.fte-folder.locked {
    opacity: 0.5;
    cursor: not-allowed;
}

.fte-prefix {
    color: #444;
    white-space: pre;
}

.fte-folder-icon {
    font-size: 0.9rem;
}

.fte-folder-name {
    color: #00ccff;
    font-weight: bold;
}

.fte-folder-count {
    color: #666;
    font-size: 0.75rem;
    margin-left: 5px;
}

.fte-lock-hint {
    color: #663300;
    font-size: 0.65rem;
    margin-left: 10px;
    font-style: italic;
}

.fte-item {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 2px 0;
    transition: all 0.1s;
}

.fte-item:hover:not(.locked) {
    background: rgba(0, 255, 0, 0.05);
}

.fte-item.locked {
    opacity: 0.4;
    cursor: not-allowed;
}

.fte-item.completed .fte-item-name,
.fte-item.completed .fte-item-title {
    color: #00aa44;
}

.fte-item.completed .fte-item-status {
    color: #00ff44;
}

.fte-item-icon {
    font-size: 0.85rem;
    opacity: 0.7;
}

.fte-item-name {
    color: #00cc44;
}

.fte-item-status {
    margin-left: 10px;
    font-size: 0.8rem;
}

.fte-item.available .fte-item-status {
    color: #666;
}

.fte-item.locked .fte-item-status {
    color: #663300;
}

.fte-item-title {
    color: #888;
    font-size: 0.75rem;
    margin-left: 5px;
}

.fte-item.locked .fte-item-title {
    color: #444;
}

.fte-footer {
    padding: 10px 20px;
    border-top: 1px solid #0d1a0d;
    text-align: center;
}

.fte-hint {
    font-size: 0.65rem;
    color: #444;
    letter-spacing: 0.05em;
}

.fte-error {
    color: #cc4444;
    padding: 20px;
    text-align: center;
}
</style>
`;

// Inject styles when the script loads
if (typeof document !== 'undefined') {
    if (!document.getElementById('file-tree-explorer-styles')) {
        document.head.insertAdjacentHTML('beforeend', FileTreeExplorerStyles);
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.FileTreeExplorer = FileTreeExplorer;
}
