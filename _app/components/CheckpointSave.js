/**
 * CheckpointSave.js — Lab State Checkpoint System
 *
 * Saves and restores lab progress snapshots to localStorage.
 * Labs call save() at key milestones (objective completion).
 * On page load, labs check hasSave() and offer to resume.
 *
 * Usage:
 *   // Save checkpoint
 *   CheckpointSave.save('file-ops', { completedObjectives: [1,2], currentStep: 3 });
 *
 *   // Check and restore
 *   if (CheckpointSave.hasSave('file-ops')) {
 *       const checkpoint = CheckpointSave.load('file-ops');
 *       // checkpoint.data = { completedObjectives: [1,2], currentStep: 3 }
 *       // checkpoint.savedAt = 1707408000000
 *   }
 *
 *   // Show resume prompt
 *   CheckpointSave.promptResume('file-ops', containerSelector, {
 *       onResume: (data) => { ...restore state... },
 *       onStartFresh: () => { ...clear and start over... }
 *   });
 */
const CheckpointSave = (function() {
    'use strict';

    const PREFIX = 'hexworth_checkpoint_';

    function save(labId, stateData) {
        try {
            const key = PREFIX + labId;
            const checkpoint = {
                data: stateData,
                savedAt: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(checkpoint));
        } catch(e) { console.warn('CheckpointSave: save failed', e); }
    }

    function load(labId) {
        try {
            const raw = localStorage.getItem(PREFIX + labId);
            return raw ? JSON.parse(raw) : null;
        } catch(e) { return null; }
    }

    function clear(labId) {
        localStorage.removeItem(PREFIX + labId);
    }

    function hasSave(labId) {
        return localStorage.getItem(PREFIX + labId) !== null;
    }

    /**
     * Show a styled resume prompt if a checkpoint exists
     * @param {string} labId
     * @param {string} containerSelector — CSS selector to prepend the prompt into
     * @param {Object} callbacks — { onResume(data), onStartFresh() }
     */
    function promptResume(labId, containerSelector, callbacks) {
        if (!hasSave(labId)) return false;

        const checkpoint = load(labId);
        if (!checkpoint) return false;

        const container = document.querySelector(containerSelector);
        if (!container) return false;

        const savedDate = new Date(checkpoint.savedAt);
        const timeAgo = _formatTimeAgo(checkpoint.savedAt);

        const prompt = document.createElement('div');
        prompt.className = 'checkpoint-resume-prompt';
        prompt.innerHTML = `
            <div class="checkpoint-resume-inner">
                <div class="checkpoint-resume-icon"><img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                <div class="checkpoint-resume-text">
                    <strong>Previous progress found</strong>
                    <span>Saved ${timeAgo}</span>
                </div>
                <button class="checkpoint-btn checkpoint-btn-resume">Resume</button>
                <button class="checkpoint-btn checkpoint-btn-fresh">Start Fresh</button>
            </div>
        `;

        // Inject styles if not already present
        if (!document.getElementById('checkpoint-save-styles')) {
            const style = document.createElement('style');
            style.id = 'checkpoint-save-styles';
            style.textContent = `
                .checkpoint-resume-prompt {
                    background: rgba(167, 139, 250, 0.1);
                    border: 1px solid rgba(167, 139, 250, 0.3);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                    animation: checkpointSlideIn 0.3s ease;
                }
                @keyframes checkpointSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .checkpoint-resume-inner {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .checkpoint-resume-icon {
                    font-size: 1.2rem;
                    color: #a78bfa;
                }
                .checkpoint-resume-text {
                    flex: 1;
                    min-width: 150px;
                }
                .checkpoint-resume-text strong {
                    display: block;
                    color: #e0e0e0;
                    font-size: 0.9rem;
                }
                .checkpoint-resume-text span {
                    color: #9ca3af;
                    font-size: 0.8rem;
                }
                .checkpoint-btn {
                    padding: 6px 16px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .checkpoint-btn-resume {
                    background: #a78bfa;
                    color: #0a0a0f;
                }
                .checkpoint-btn-resume:hover {
                    background: #c4b5fd;
                }
                .checkpoint-btn-fresh {
                    background: transparent;
                    color: #9ca3af;
                    border: 1px solid #4a5568;
                }
                .checkpoint-btn-fresh:hover {
                    border-color: #9ca3af;
                    color: #e0e0e0;
                }
            `;
            document.head.appendChild(style);
        }

        // Wire buttons
        prompt.querySelector('.checkpoint-btn-resume').addEventListener('click', () => {
            prompt.remove();
            if (callbacks.onResume) callbacks.onResume(checkpoint.data);
        });

        prompt.querySelector('.checkpoint-btn-fresh').addEventListener('click', () => {
            clear(labId);
            prompt.remove();
            if (callbacks.onStartFresh) callbacks.onStartFresh();
        });

        container.prepend(prompt);
        return true;
    }

    function _formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        return Math.floor(seconds / 86400) + 'd ago';
    }

    return { save, load, clear, hasSave, promptResume };
})();
