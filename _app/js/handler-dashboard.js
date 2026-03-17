        // ═══════════════════════════════════════════════════════════════
        // VIEW ENGINE
        // Stack-based navigation for instructor drill-down views.
        // Level 0 = class overview (tab-based). drillDown() pushes deeper
        // views (student detail, assignment detail, etc.) onto the stack.
        // goBack() pops the stack and restores the previous view's HTML.
        // ═══════════════════════════════════════════════════════════════

        const _viewStack = [];
        let _currentView = null;
        let _savedMainHTML = null;  // Snapshot of Level 0 HTML for restoration

        function drillDown(viewConfig) {
            const mainEl = document.getElementById('mainContent');
            // Save the original class detail HTML on first drill-down
            if (!_viewStack.length && mainEl && !_savedMainHTML) {
                _savedMainHTML = mainEl.innerHTML;
            }
            _viewStack.push({ label: _currentView ? _currentView.label : 'Class Overview' });
            _currentView = viewConfig;

            const bc = document.getElementById('hd-breadcrumb');
            if (bc) bc.style.display = 'block';

            if (mainEl && viewConfig.render) {
                mainEl.style.transition = 'opacity 0.15s ease';
                mainEl.style.opacity = '0';
                setTimeout(() => {
                    viewConfig.render(mainEl);
                    mainEl.style.opacity = '1';
                }, 150);
            }
            _updateBreadcrumb();
        }

        function goBack() {
            if (!_viewStack.length) return;
            _viewStack.pop();
            const mainEl = document.getElementById('mainContent');

            if (!_viewStack.length && _savedMainHTML && mainEl) {
                // Restore Level 0 — original class detail view
                mainEl.style.transition = 'opacity 0.15s ease';
                mainEl.style.opacity = '0';
                setTimeout(() => {
                    mainEl.innerHTML = _savedMainHTML;
                    mainEl.style.opacity = '1';
                    _savedMainHTML = null;
                    // Restore active tab state after DOM is rebuilt
                    switchTab(_activeTab);
                }, 150);
                _currentView = null;
                const bc = document.getElementById('hd-breadcrumb');
                if (bc) bc.style.display = 'none';
            } else if (_viewStack.length && _currentView) {
                // Deeper back — re-render previous drill view
                const prevConfig = _viewStack[_viewStack.length - 1];
                if (prevConfig && prevConfig.render) {
                    _renderView(prevConfig);
                }
            }
            _currentView = _viewStack.length ? _viewStack[_viewStack.length - 1] : null;
            _updateBreadcrumb();
        }

        function _renderView(config) {
            if (!config) return;
            _currentView = config;
            const _viewContainer = document.getElementById('mainContent') || document.querySelector('.hd-main') || document.querySelector('.hd-content');
            if (_viewContainer) {
                _viewContainer.style.transition = 'opacity 0.15s ease';
                _viewContainer.style.opacity = '0';
                setTimeout(() => {
                    if (config.render) config.render(_viewContainer);
                    _viewContainer.style.opacity = '1';
                }, 150);
            }
        }

        function _updateBreadcrumb() {
            const _breadcrumbEl = document.getElementById('hd-breadcrumb');
            if (!_breadcrumbEl) return;
            const crumbs = _viewStack.map((v, i) => {
                if (i < _viewStack.length - 1) {
                    return `<span class="hd-crumb" onclick="goBack()" style="cursor:pointer;color:var(--hd-accent)">${v && v.label ? v.label : 'Back'}</span>`;
                }
                return `<span class="hd-crumb" onclick="goBack()" style="cursor:pointer;color:var(--hd-accent)">${v && v.label ? v.label : 'Back'}</span>`;
            });
            if (_currentView) crumbs.push(`<span class="hd-crumb-current">${_currentView.label || ''}</span>`);
            _breadcrumbEl.innerHTML = crumbs.join(' <span style="color:var(--hd-text-muted,#666)">></span> ');
            _breadcrumbEl.style.display = crumbs.length ? 'block' : 'none';
        }

        // ═══════════════════════════════════════════════════════════════
        // TAB SYSTEM
        // ═══════════════════════════════════════════════════════════════

        let _activeTab = 'overview';
        let _analyticsRendered = false;
        let _ailabRendered = false;

        // Switch between class detail tabs (overview, roster, analytics, AI lab).
        // Analytics and AI Lab tabs are lazy-rendered on first activation to
        // avoid loading Chart.js and fetching data until actually needed.
        function switchTab(tab) {
            _activeTab = tab;
            document.querySelectorAll('.hd-tab-panel').forEach(function(p) { p.classList.remove('active'); });
            document.querySelectorAll('.hd-tab-btn').forEach(function(b) { b.classList.remove('active'); });
            const panel = document.querySelector('.hd-tab-panel[data-tab="' + tab + '"]');
            const btn = document.querySelector('.hd-tab-btn[data-tab="' + tab + '"]');
            if (panel) panel.classList.add('active');
            if (btn) btn.classList.add('active');
            if (tab === 'analytics' && !_analyticsRendered) { _renderAnalyticsTab(); _analyticsRendered = true; }
            if (tab === 'ailab' && !_ailabRendered) { loadAiLabData(); _ailabRendered = true; }
        }

        function _renderAnalyticsTab() {
            renderCompletionTrendChart();
            renderTimeOnTask();
            renderPerfChart();
            renderStudentStatusDonut();
            renderAssignmentCompletionDonut();
            renderScoreDistDonut();
            renderLowestScores();
            renderHeatmap();
        }

        // ═══════════════════════════════════════════════════════════════
        // THEME
        // ═══════════════════════════════════════════════════════════════

        function hdOverlay(alpha) {
            const rgb = document.documentElement.dataset.theme === 'light' ? '0,0,0' : '255,255,255';
            return `rgba(${rgb},${alpha})`;
        }
        function hdChartText() {
            return document.documentElement.dataset.theme === 'light' ? '#555' : '#aaa';
        }
        function toggleHdTheme() {
            const root = document.documentElement;
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            root.dataset.theme = next;
            localStorage.setItem('hd-theme', next);
            const btn = document.getElementById('hdThemeToggle');
            if (btn) btn.textContent = next === 'light' ? '\u263E' : '\u2600';
            if (_activeTab === 'analytics' && _analyticsRendered) { _renderAnalyticsTab(); }
        }
        (function applyStoredTheme() {
            const saved = localStorage.getItem('hd-theme');
            if (saved === 'light') {
                document.documentElement.dataset.theme = 'light';
                document.addEventListener('DOMContentLoaded', () => {
                    const btn = document.getElementById('hdThemeToggle');
                    if (btn) btn.textContent = '\u263E';
                });
            }
        })();

        // ═══════════════════════════════════════════════════════════════
        // STATE
        // ═══════════════════════════════════════════════════════════════

        let handlerClasses = [];       // All classes owned by this instructor
        let selectedClassId = null;    // Currently viewed class
        let classAssignments = [];     // Assignments for the selected class
        let classProgressData = [];    // Per-student progress snapshots
        let rosterMembers = [];        // Paginated student list for the roster tab
        let rosterPage = 0;
        const ROSTER_PAGE_SIZE = 15;
        let cbSelection = new Map();   // Clipboard: key => { type, data } for bulk operations
        const dismissedWarnings = new Set();
        const cohortCache = new Map(); // classId => { data, ts } — avoids re-fetching within session

        // ═══════════════════════════════════════════════════════════════
        // ACCESS GATE
        // Redirects non-handler accounts back to dashboard.html.
        // AccountFrame.getAccountType() is set during login based on
        // instructor tier or admin claims.
        // ═══════════════════════════════════════════════════════════════

        document.addEventListener('DOMContentLoaded', async () => {
            if (typeof AccountFrame === 'undefined' || AccountFrame.getAccountType() !== 'handler') {
                window.location.href = 'dashboard.html';
                return;
            }

            // Remove guard - page is authorized
            const guard = document.getElementById('handler-guard');
            if (guard) guard.remove();

            // Initialize Firebase
            await FirebaseAuth.init();

            // Wait for auth state
            const user = FirebaseAuth.getUser();
            if (!user) {
                // Wait a moment for cached auth
                await new Promise(resolve => setTimeout(resolve, 1000));
                const retryUser = FirebaseAuth.getUser();
                if (!retryUser) {
                    window.location.href = 'dashboard.html';
                    return;
                }
                setupUI(retryUser);
            } else {
                setupUI(user);
            }
        });

        async function setupUI(user) {
            // Set header user info
            const nameEl = document.getElementById('hdUserName');
            const avatarEl = document.getElementById('hdUserAvatar');

            nameEl.textContent = user.displayName || user.email || '';

            if (user.photoURL) {
                avatarEl.innerHTML = `<img class="hd-user-avatar" src="${user.photoURL}" alt="Avatar" referrerpolicy="no-referrer">`;
            } else {
                const initials = (user.displayName || user.email || '?').charAt(0).toUpperCase();
                avatarEl.innerHTML = `<div class="hd-user-avatar-placeholder">${initials}</div>`;
            }

            // Initialize ClassManager and load classes
            await ClassManager.init();
            await loadClasses();
        }

        // ═══════════════════════════════════════════════════════════════
        // CLASS LIST
        // ═══════════════════════════════════════════════════════════════

        async function loadClasses() {
            const user = FirebaseAuth.getUser();
            if (!user) return;

            handlerClasses = await ClassManager.getHandlerClasses(user.uid);
            renderClassList();
            renderMobileSelect();

            if (handlerClasses.length === 0) {
                showEmptyState();
            } else if (selectedClassId && handlerClasses.find(c => c.id === selectedClassId)) {
                // Restore previously selected class (e.g. after create/edit/delete)
                selectClass(selectedClassId);
            } else {
                // Show home state — no auto-select
                showHomeState();
            }
        }

        function renderClassList() {
            const list = document.getElementById('classList');
            list.innerHTML = '';

            handlerClasses.forEach(cls => {
                const item = document.createElement('div');
                item.className = 'hd-class-item' + (cls.id === selectedClassId ? ' active' : '');
                item.setAttribute('role', 'listitem');
                item.onclick = () => selectClass(cls.id);
                item.innerHTML = `
                    <span class="hd-class-item-name">${escapeHtml(cls.name)}</span>
                    <span class="hd-class-item-count">${cls.memberCount || 0}</span>
                `;
                list.appendChild(item);
            });
        }

        function renderMobileSelect() {
            const select = document.getElementById('mobileSelect');
            select.innerHTML = '<option value="">Select a class...</option>';

            handlerClasses.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls.id;
                opt.textContent = cls.name;
                if (cls.id === selectedClassId) opt.selected = true;
                select.appendChild(opt);
            });
        }

        document.getElementById('mobileSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                selectClass(e.target.value);
            }
        });

        // ═══════════════════════════════════════════════════════════════
        // CLASS SELECTION
        // ═══════════════════════════════════════════════════════════════

        function selectClass(classId) {
            selectedClassId = classId;
            const cls = handlerClasses.find(c => c.id === classId);
            if (!cls) return;

            // Update sidebar active state
            renderClassList();
            renderMobileSelect();

            // Hide empty/home state, show detail
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('homeState').classList.add('hidden');
            const detail = document.getElementById('classDetail');
            detail.classList.add('visible');

            // Show right panel
            document.getElementById('rightPanel').classList.add('visible');

            // Populate detail
            document.getElementById('detailName').textContent = cls.name;
            document.getElementById('detailDesc').textContent = cls.description || '';
            document.getElementById('statEnrolled').textContent = cls.memberCount || 0;

            // Right panel
            document.getElementById('rightClassCode').textContent = cls.classCode;

            // Reset tab state for new class
            _analyticsRendered = false;
            _ailabRendered = false;
            switchTab('overview');

            // Load assignments, roster, and progress
            loadAssignments(classId);
            loadRoster(classId);
            loadClassProgress(classId);
        }

        async function refreshClassData() {
            if (!selectedClassId) return;

            const btn = document.getElementById('refreshClassBtn');
            if (!btn || btn.disabled) return;

            btn.disabled = true;
            btn.classList.add('refreshing');

            try {
                await Promise.all([
                    loadRoster(selectedClassId),
                    loadClassProgress(selectedClassId),
                    loadAssignments(selectedClassId)
                ]);

                // Re-fetch class doc to get updated memberCount
                const cls = handlerClasses.find(c => c.id === selectedClassId);
                if (cls) {
                    const { doc, getDoc, getFirestore } = window.firebaseFirestore;
                    const { getApps } = window.firebaseApp;
                    const db = getFirestore(getApps()[0]);
                    const snap = await getDoc(doc(db, 'classes', selectedClassId));
                    if (snap.exists()) {
                        const fresh = snap.data();
                        cls.memberCount = fresh.memberCount || 0;
                        document.getElementById('statEnrolled').textContent = cls.memberCount;
                    }
                }

                showToast('Classroom data refreshed');
            } catch (error) {
                console.error('Refresh failed:', error);
                showToast('Refresh failed — check connection');
            } finally {
                btn.disabled = false;
                btn.classList.remove('refreshing');
            }
        }

        function showEmptyState() {
            document.getElementById('emptyState').style.display = '';
            document.getElementById('homeState').classList.add('hidden');
            document.getElementById('classDetail').classList.remove('visible');
            document.getElementById('rightPanel').classList.remove('visible');
            selectedClassId = null;
        }

        function showHomeState() {
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('homeState').classList.remove('hidden');
            document.getElementById('classDetail').classList.remove('visible');
            document.getElementById('rightPanel').classList.remove('visible');
            selectedClassId = null;

            // Render overview stats
            const totalStudents = handlerClasses.reduce((sum, c) => sum + (c.memberCount || 0), 0);
            const statsEl = document.getElementById('homeStats');
            statsEl.innerHTML = `
                <div class="hd-home-stat">
                    <div class="hd-home-stat-value">${handlerClasses.length}</div>
                    <div class="hd-home-stat-label">Classes</div>
                </div>
                <div class="hd-home-stat">
                    <div class="hd-home-stat-value">${totalStudents}</div>
                    <div class="hd-home-stat-label">Total Students</div>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════════
        // CREATE CLASS MODAL
        // ═══════════════════════════════════════════════════════════════

        function showCreateModal() {
            const overlay = document.createElement('div');
            overlay.className = 'hd-overlay';
            overlay.id = 'createModal';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'createModalTitle');
            overlay.innerHTML = `
                <div class="hd-modal">
                    <button class="hd-modal-close" onclick="closeModal('createModal')">&times;</button>
                    <div id="createForm">
                        <div class="hd-modal-title" id="createModalTitle">+ Create New Class</div>
                        <div class="hd-input-group">
                            <label class="hd-input-label">Class Name *</label>
                            <input type="text" class="hd-input" id="createName" placeholder="e.g. CIS 101 - Fall 2026" maxlength="60">
                            <div class="hd-input-hint">Max 60 characters</div>
                        </div>
                        <div class="hd-input-group">
                            <label class="hd-input-label">Description</label>
                            <textarea class="hd-input" id="createDesc" placeholder="Optional description..." maxlength="200"></textarea>
                            <div class="hd-input-hint">Max 200 characters</div>
                        </div>
                        <div class="hd-error" id="createError"></div>
                        <div class="hd-modal-actions">
                            <button class="hd-btn hd-btn-secondary" onclick="closeModal('createModal')">Cancel</button>
                            <button class="hd-btn hd-btn-primary" id="createSubmitBtn" onclick="submitCreateClass()">Create Class</button>
                        </div>
                    </div>
                    <div id="createSuccess" style="display:none">
                        <div class="hd-create-success">
                            <div class="hd-create-success-icon"></div>
                            <div class="hd-create-success-msg">Class created successfully!</div>
                            <div class="hd-create-success-code" id="newClassCode"></div>
                            <button class="hd-copy-btn" onclick="copyNewCode()" id="copyNewCodeBtn">Copy Code</button>
                            <div class="hd-modal-actions" style="margin-top:16px">
                                <button class="hd-btn hd-btn-primary" onclick="closeModal('createModal')">Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Close on backdrop click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal('createModal');
            });

            // Focus name input
            setTimeout(() => document.getElementById('createName').focus(), 100);
        }

        async function submitCreateClass() {
            const nameInput = document.getElementById('createName');
            const descInput = document.getElementById('createDesc');
            const errorEl = document.getElementById('createError');
            const submitBtn = document.getElementById('createSubmitBtn');

            const name = nameInput.value.trim();
            if (!name) {
                errorEl.textContent = 'Class name is required.';
                errorEl.style.display = 'block';
                nameInput.focus();
                return;
            }

            // Disable button, show spinner
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="hd-spinner"></span>';
            errorEl.style.display = 'none';

            try {
                const result = await ClassManager.createClass({
                    name: name,
                    description: descInput.value.trim()
                });

                // Show success state
                document.getElementById('createForm').style.display = 'none';
                document.getElementById('createSuccess').style.display = 'block';
                document.getElementById('newClassCode').textContent = result.classCode;

                // Reload classes and select the new one
                selectedClassId = result.classId;
                await loadClasses();

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Class';
                errorEl.textContent = error.message || 'Failed to create class.';
                errorEl.style.display = 'block';
            }
        }

        let _newCodeText = '';
        function copyNewCode() {
            const code = document.getElementById('newClassCode').textContent;
            copyToClipboard(code, 'copyNewCodeBtn');
        }

        // ═══════════════════════════════════════════════════════════════
        // EDIT CLASS MODAL
        // ═══════════════════════════════════════════════════════════════

        function showEditModal() {
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            const overlay = document.createElement('div');
            overlay.className = 'hd-overlay';
            overlay.id = 'editModal';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'editModalTitle');
            overlay.innerHTML = `
                <div class="hd-modal">
                    <button class="hd-modal-close" onclick="closeModal('editModal')">&times;</button>
                    <div class="hd-modal-title" id="editModalTitle">Edit Class</div>
                    <div class="hd-input-group">
                        <label class="hd-input-label">Class Name *</label>
                        <input type="text" class="hd-input" id="editName" value="${escapeAttr(cls.name)}" maxlength="60">
                    </div>
                    <div class="hd-input-group">
                        <label class="hd-input-label">Description</label>
                        <textarea class="hd-input" id="editDesc" maxlength="200">${escapeHtml(cls.description || '')}</textarea>
                    </div>
                    <div class="hd-error" id="editError"></div>
                    <div class="hd-modal-actions">
                        <button class="hd-btn hd-btn-secondary" onclick="closeModal('editModal')">Cancel</button>
                        <button class="hd-btn hd-btn-primary" id="editSubmitBtn" onclick="submitEditClass()">Save Changes</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal('editModal');
            });
            setTimeout(() => document.getElementById('editName').focus(), 100);
        }

        async function submitEditClass() {
            const nameInput = document.getElementById('editName');
            const descInput = document.getElementById('editDesc');
            const errorEl = document.getElementById('editError');
            const submitBtn = document.getElementById('editSubmitBtn');

            const name = nameInput.value.trim();
            if (!name) {
                errorEl.textContent = 'Class name is required.';
                errorEl.style.display = 'block';
                nameInput.focus();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="hd-spinner"></span>';
            errorEl.style.display = 'none';

            try {
                await ClassManager.updateClass(selectedClassId, {
                    name: name,
                    description: descInput.value.trim()
                });

                closeModal('editModal');
                await loadClasses();
                showToast('Class updated');

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
                errorEl.textContent = error.message || 'Failed to update class.';
                errorEl.style.display = 'block';
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // DELETE CLASS MODAL
        // ═══════════════════════════════════════════════════════════════

        function showDeleteModal() {
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            const overlay = document.createElement('div');
            overlay.className = 'hd-overlay';
            overlay.id = 'deleteModal';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'deleteModalTitle');
            overlay.innerHTML = `
                <div class="hd-modal">
                    <button class="hd-modal-close" onclick="closeModal('deleteModal')">&times;</button>
                    <div class="hd-modal-title" id="deleteModalTitle" style="color: var(--hd-danger)">Delete Class</div>
                    <div class="hd-delete-warning">
                        Are you sure you want to delete <span class="hd-delete-class-name">${escapeHtml(cls.name)}</span>?
                        This will remove the class and its code. Students will no longer be able to join.
                    </div>
                    <div class="hd-error" id="deleteError"></div>
                    <div class="hd-modal-actions">
                        <button class="hd-btn hd-btn-secondary" onclick="closeModal('deleteModal')">Cancel</button>
                        <button class="hd-btn hd-btn-danger" id="deleteSubmitBtn" onclick="submitDeleteClass()">Delete Class</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal('deleteModal');
            });
        }

        async function submitDeleteClass() {
            const errorEl = document.getElementById('deleteError');
            const submitBtn = document.getElementById('deleteSubmitBtn');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="hd-spinner"></span>';
            errorEl.style.display = 'none';

            try {
                await ClassManager.deleteClass(selectedClassId);

                closeModal('deleteModal');
                selectedClassId = null;
                await loadClasses();
                showToast('Class deleted');

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Delete Class';
                errorEl.textContent = error.message || 'Failed to delete class.';
                errorEl.style.display = 'block';
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // UTILITIES
        // ═══════════════════════════════════════════════════════════════

        function closeModal(id) {
            const overlay = document.getElementById(id);
            if (!overlay) return;
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 250);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeOverlay = document.querySelector('.hd-overlay.active, .hd-modal-overlay[style*="flex"]');
                if (activeOverlay) closeModal(activeOverlay.id);
            }
        });

        function copyClassCode() {
            const code = document.getElementById('rightClassCode').textContent;
            copyToClipboard(code, 'copyCodeBtn');
        }

        function copyToClipboard(text, btnId) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.textContent = 'Copied!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = 'Copy Code';
                        btn.classList.remove('copied');
                    }, 2000);
                }
            }).catch(() => {
                // Fallback
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();

                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.textContent = 'Copied!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = 'Copy Code';
                        btn.classList.remove('copied');
                    }, 2000);
                }
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function escapeAttr(str) {
            return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        // ═══════════════════════════════════════════════════════════════
        // ASSIGNMENTS
        // ═══════════════════════════════════════════════════════════════

        async function loadAssignments(classId) {
            try {
                await AssignmentManager.init();
                classAssignments = await AssignmentManager.getClassAssignments(classId);
                renderAssignments();
            } catch (error) {
                console.error('Failed to load assignments:', error);
                classAssignments = [];
                renderAssignments();
            }
        }

        function renderAssignments() {
            const container = document.getElementById('assignmentsList');
            if (!container) return;

            if (classAssignments.length === 0) {
                container.innerHTML = `
                    <div class="hd-assignment-empty">
                        No assignments yet. Click "+ Assign Content" to get started.
                    </div>
                `;
                return;
            }

            container.innerHTML = classAssignments.map(a => {
                const icon = a.assignmentType === 'path' ? '\uD83D\uDCDA' : '\uD83D\uDCC4';
                const typeBadge = a.assignmentType === 'path'
                    ? '<span class="hd-assignment-badge path">Learning Path</span>'
                    : '<span class="hd-assignment-badge item">' + escapeHtml(a.contentType || 'Module') + '</span>';

                let metaParts = [typeBadge];

                if (a.assignmentType === 'path') {
                    metaParts.push('<span>' + (a.moduleCount || 0) + ' modules</span>');
                } else {
                    if (a.house) metaParts.push('<span>' + escapeHtml(capitalize(a.house)) + '</span>');
                    if (a.difficulty) metaParts.push('<span>' + escapeHtml(capitalize(a.difficulty)) + '</span>');
                }

                if (a.dueDate) {
                    const date = a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const isPast = date < new Date();
                    metaParts.push('<span style="color:' + (isPast ? 'var(--hd-danger)' : 'var(--hd-gold)') + '">Due: ' + dateStr + '</span>');
                }

                // Completion badge from progress data
                const completionCount = classProgressData.filter(p =>
                    p.completions && p.completions[a.contentId] && p.completions[a.contentId].completed
                ).length;
                const memberCount = parseInt(document.getElementById('statEnrolled').textContent) || 0;
                if (memberCount > 0) {
                    metaParts.push('<span class="hd-assignment-completion">' + completionCount + '/' + memberCount + ' completed</span>');
                }

                const notesHtml = a.notes
                    ? '<div class="hd-assignment-notes">' + escapeHtml(a.notes) + '</div>'
                    : '';

                return `
                    <div class="hd-assignment-card">
                        <div class="hd-assignment-icon">${icon}</div>
                        <div class="hd-assignment-info">
                            <div class="hd-assignment-name">${escapeHtml(a.title)}</div>
                            <div class="hd-assignment-meta">${metaParts.join(' <span>\u00B7</span> ')}</div>
                            ${notesHtml}
                        </div>
                        <button class="hd-assignment-delete" onclick="removeAssignment('${selectedClassId}', '${a.id}')" title="Remove assignment">&times;</button>
                    </div>
                `;
            }).join('');
        }

        async function removeAssignment(classId, assignmentId) {
            if (!confirm('Remove this assignment?')) return;

            try {
                await AssignmentManager.deleteAssignment(classId, assignmentId);
                classAssignments = classAssignments.filter(a => a.id !== assignmentId);
                renderAssignments();
                showToast('Assignment removed');
            } catch (error) {
                showToast('Failed to remove assignment');
            }
        }

        function capitalize(str) {
            return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        }

        // ═══════════════════════════════════════════════════════════════
        // STUDENT PROGRESS
        // ═══════════════════════════════════════════════════════════════

        async function loadClassProgress(classId) {
            try {
                classProgressData = await AssignmentManager.getClassProgress(classId);

                // Normalize: merge legacy flat "completions.xxx" keys into nested completions map
                classProgressData.forEach(doc => {
                    if (!doc.completions) doc.completions = {};
                    Object.keys(doc).forEach(key => {
                        if (key.startsWith('completions.')) {
                            const contentId = key.substring('completions.'.length);
                            if (!doc.completions[contentId]) {
                                doc.completions[contentId] = doc[key];
                            }
                        }
                    });
                });

                updateCompletionDisplay();
                renderAssignments(); // Re-render to show completion badges
                renderActivityFeed(); // Show recent activity
                renderEarlyWarnings(); // Always render warnings (overview tab)
                renderGradeBreakdown(); // Always render (assignments tab)
                renderAssignmentHealth(); // Always render (assignments tab)
                // Analytics charts lazy-render when Analytics tab is opened
                if (_activeTab === 'analytics') { _renderAnalyticsTab(); _analyticsRendered = true; }
            } catch (error) {
                console.error('Failed to load progress:', error);
                classProgressData = [];
            }
        }

        function populateActivityFilter() {
            const filter = document.getElementById('activityStudentFilter');
            if (!filter) return;

            // Keep current selection if possible
            const currentValue = filter.value;

            filter.innerHTML = '<option value="">All Students</option>';
            rosterMembers.forEach(member => {
                const name = member.displayName || member.email?.split('@')[0] || 'Student';
                filter.innerHTML += `<option value="${member.uid}">${escapeHtml(name)}</option>`;
            });

            // Restore selection if still valid
            if (currentValue && [...filter.options].some(o => o.value === currentValue)) {
                filter.value = currentValue;
            }
        }

        function filterActivityByStudent() {
            renderActivityFeed();
        }

        function renderActivityFeed() {
            const feed = document.getElementById('activityFeed');
            const countBadge = document.getElementById('activityCount');
            const filter = document.getElementById('activityStudentFilter');
            const filterUid = filter ? filter.value : '';

            // Populate filter dropdown if roster changed
            populateActivityFilter();

            // Build activity events from progress data
            const events = [];

            for (const studentProgress of classProgressData) {
                // Apply student filter
                if (filterUid && studentProgress.uid !== filterUid) continue;

                const studentName = getStudentName(studentProgress.uid);
                const studentUid = studentProgress.uid;

                const completions = studentProgress.completions || {};

                for (const [contentId, data] of Object.entries(completions)) {
                    if (data.completed && data.completedAt) {
                        const contentTitle = getContentTitle(contentId);
                        events.push({
                            type: 'completed',
                            studentUid,
                            studentName,
                            contentTitle,
                            contentId,
                            timestamp: data.completedAt.toDate ? data.completedAt.toDate() : new Date(data.completedAt),
                            score: data.score
                        });
                    }
                }
            }

            // Sort by timestamp descending (most recent first)
            events.sort((a, b) => b.timestamp - a.timestamp);

            // Take only the most recent 20 events
            const recentEvents = events.slice(0, 20);

            const filterText = filterUid ? ' (filtered)' : '';
            if (events.length > 20) {
                countBadge.textContent = `20 of ${events.length} events${filterText}`;
            } else {
                countBadge.textContent = `${events.length} event${events.length !== 1 ? 's' : ''}${filterText}`;
            }

            if (recentEvents.length === 0) {
                const emptyText = filterUid ? 'No activity for this student.' : 'No activity yet. Student progress will appear here.';
                feed.innerHTML = `<div class="hd-activity-empty">${emptyText}</div>`;
                return;
            }

            feed.innerHTML = recentEvents.map(event => {
                const iconClass = event.score != null ? 'scored' : 'unscored';
                const iconChar = event.score != null ? '&#10003;' : '&#9679;';
                const scoreText = event.score != null ? ` (${event.score}%)` : '';
                const timeAgo = formatTimeAgo(event.timestamp);

                return `
                    <div class="hd-activity-item">
                        <span class="hd-activity-icon ${iconClass}">${iconChar}</span>
                        <div class="hd-activity-content">
                            <div class="hd-activity-text">
                                <strong>${escapeHtml(event.studentName)}</strong> completed <strong>${escapeHtml(event.contentTitle)}</strong>${scoreText}
                            </div>
                            <div class="hd-activity-time">${timeAgo}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function getStudentName(uid) {
            const member = rosterMembers.find(m => m.uid === uid);
            if (member) {
                return member.displayName || member.email?.split('@')[0] || 'Student';
            }
            return 'Student';
        }

        function getContentTitle(contentId) {
            // Try to get from ContentRegistry
            if (typeof ContentRegistry !== 'undefined' && ContentRegistry.content[contentId]) {
                return ContentRegistry.content[contentId].title;
            }
            // Fallback: humanize the ID
            return contentId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }

        function formatTimeAgo(date) {
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
            return date.toLocaleDateString();
        }

        function formatDuration(seconds) {
            if (!seconds || seconds <= 0) return '';
            if (seconds < 60) return `${Math.round(seconds)}s`;
            const m = Math.floor(seconds / 60);
            const h = Math.floor(m / 60);
            if (h > 0) return `${h}h ${m % 60}m`;
            return `${m}m`;
        }

        function updateCompletionDisplay() {
            const statCompletion = document.getElementById('statCompletion');
            const statLabs = document.getElementById('statLabs');
            const statAtRisk = document.getElementById('statAtRisk');

            if (classAssignments.length === 0 || rosterMembers.length === 0) {
                statCompletion.textContent = '--';
                statLabs.textContent = '0';
                statAtRisk.textContent = '0';
                renderStatRing('ringEnrolled', rosterMembers.length, Math.max(rosterMembers.length, 30), '#d4a017');
                renderStatRing('ringCompletion', 0, 100, '#4ade80');
                renderStatRing('ringLabs', 0, 1, '#60a5fa');
                renderStatRing('ringAtRisk', 0, 1, hdOverlay(0.15));
                return;
            }

            const memberCount = rosterMembers.length;
            let totalCompleted = 0;
            let totalModules = 0;
            let atRiskCount = 0;

            // Count completions using smart resolution (handles path→module expansion)
            for (const studentProgress of classProgressData) {
                const completions = studentProgress.completions || {};
                for (const assignment of classAssignments) {
                    const result = resolveAssignmentProgress(assignment, completions);
                    totalCompleted += result.completed;
                    totalModules += result.total;
                }
            }

            // Scale totalModules to include students with NO progress doc
            const studentsWithProgress = classProgressData.length;
            const studentsWithout = memberCount - studentsWithProgress;
            if (studentsWithout > 0) {
                // For students with no progress doc, they have 0 completed out of full module count
                for (const assignment of classAssignments) {
                    const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
                    const pathDef = (assignment.assignmentType === 'path') ? paths[assignment.contentId] : null;
                    const modCount = (pathDef?.modules?.length) || 1;
                    totalModules += modCount * studentsWithout;
                }
            }

            // Count at-risk students (< 40% completion)
            for (const member of rosterMembers) {
                const { pct } = getStudentCompletion(member.uid);
                if (pct < 40) atRiskCount++;
            }

            const avgPct = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;
            statCompletion.textContent = avgPct + '%';
            statLabs.textContent = totalCompleted.toString();
            statAtRisk.textContent = atRiskCount.toString();

            // Highlight at-risk card if there are at-risk students
            const atRiskCard = statAtRisk.closest('.hd-stat-card');
            if (atRiskCard) {
                atRiskCard.classList.toggle('at-risk', atRiskCount > 0);
            }

            // Render stat rings
            const maxEnrolled = Math.max(memberCount, 30);
            const maxCompletions = Math.max(totalModules, 1);
            renderStatRing('ringEnrolled', memberCount, maxEnrolled, '#d4a017');
            renderStatRing('ringCompletion', avgPct, 100, '#4ade80');
            renderStatRing('ringLabs', totalCompleted, maxCompletions, '#60a5fa');
            renderStatRing('ringAtRisk', atRiskCount, Math.max(memberCount, 1), atRiskCount > 0 ? '#f87171' : hdOverlay(0.15));
        }

        function renderStatRing(containerId, value, max, color) {
            const el = document.getElementById(containerId);
            if (!el) return;
            const r = 23;
            const circ = 2 * Math.PI * r;
            const pct = max > 0 ? Math.min(value / max, 1) : 0;
            const offset = circ * (1 - pct);
            el.innerHTML = `<svg viewBox="0 0 56 56" width="56" height="56">
                <circle class="ring-bg" cx="28" cy="28" r="${r}"/>
                <circle class="ring-fill" cx="28" cy="28" r="${r}"
                    stroke="${color}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
                    transform="rotate(-90 28 28)"/>
            </svg>`;
        }

        // ═══════════════════════════════════════════════════════════════
        // ANALYTICS
        // ═══════════════════════════════════════════════════════════════

        let completionTrendChart = null;

        let totChart = null;
        let totView = 'table';
        let studentStatusDonut = null;
        let assignmentCompletionDonut = null;
        let scoreDistDonut = null;

        function renderAnalytics() {
            renderCompletionTrendChart();
            renderGradeBreakdown();
            renderTimeOnTask();
            renderPerfChart();
            renderStudentStatusDonut();
            renderAssignmentCompletionDonut();
            renderScoreDistDonut();
            renderEarlyWarnings();
            renderLowestScores();
            renderAssignmentHealth();
            renderHeatmap();
        }

        function renderCompletionTrendChart() {
            const canvas = document.getElementById('completionTrendChart');
            if (!canvas) return;

            // Destroy previous chart if exists
            if (completionTrendChart) {
                completionTrendChart.destroy();
            }

            // Build timeline data from progress completions
            const completionsByDate = {};
            for (const studentProgress of classProgressData) {
                const completions = studentProgress.completions || {};
                for (const [contentId, data] of Object.entries(completions)) {
                    if (data.completed && data.completedAt) {
                        const date = data.completedAt.toDate
                            ? data.completedAt.toDate()
                            : new Date(data.completedAt);
                        const dateKey = date.toISOString().split('T')[0];
                        completionsByDate[dateKey] = (completionsByDate[dateKey] || 0) + 1;
                    }
                }
            }

            // Sort dates and create chart data
            const sortedDates = Object.keys(completionsByDate).sort();
            if (sortedDates.length === 0) {
                canvas.parentElement.innerHTML = '<div class="hd-analytics-empty">No completion data yet</div>';
                return;
            }

            // Fill in missing dates for smoother line
            const labels = [];
            const values = [];
            let cumulative = 0;

            for (const date of sortedDates) {
                labels.push(formatDateShort(date));
                cumulative += completionsByDate[date];
                values.push(cumulative);
            }

            // Build gradient fill
            const ctx = canvas.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.parentElement.clientHeight || 260);
            grad.addColorStop(0, 'rgba(212, 160, 23, 0.3)');
            grad.addColorStop(1, 'rgba(212, 160, 23, 0.02)');

            completionTrendChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Cumulative Completions',
                        data: values,
                        borderColor: '#d4a017',
                        backgroundColor: grad,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointBackgroundColor: '#d4a017'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { color: hdChartText(), font: { size: 11 } },
                            grid: { color: hdOverlay(0.08) }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: hdChartText(), font: { size: 11 }, stepSize: 1 },
                            grid: { color: hdOverlay(0.08) }
                        }
                    }
                }
            });
        }

        function renderGradeBreakdown() {
            const wrap = document.getElementById('gradeBreakdownWrap');
            if (!wrap) return;

            if (classAssignments.length === 0) {
                wrap.innerHTML = '<div class="hd-analytics-empty">No assignments yet</div>';
                return;
            }

            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            const gradeColors = { A: '#4ade80', B: '#60a5fa', C: '#fbbf24', D: '#fb923c', F: '#f87171' };

            const rows = classAssignments.map(a => {
                const studentScores = [];

                for (const sp of classProgressData) {
                    const completions = sp.completions || {};
                    const keys = Object.keys(completions);
                    const scores = [];

                    if (a.assignmentType === 'path') {
                        const pathDef = paths[a.contentId];
                        if (pathDef?.modules) {
                            for (const mod of pathDef.modules) {
                                const comp = findModuleCompletion(mod.id, completions, keys, true);
                                if (comp?.score != null) scores.push(comp.score);
                            }
                        }
                    } else {
                        const comp = findModuleCompletion(a.contentId, completions, keys);
                        if (comp?.score != null) scores.push(comp.score);
                    }

                    if (scores.length > 0) {
                        const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
                        studentScores.push(avg);
                    }
                }

                const title = a.title.length > 24 ? a.title.substring(0, 22) + '\u2026' : a.title;

                if (studentScores.length === 0) {
                    return `<div class="hd-grade-row"><span class="hd-grade-row-name" title="${a.title}">${title}</span><span class="hd-grade-none">No scores yet</span></div>`;
                }

                const high = Math.round(Math.max(...studentScores));
                const low = Math.round(Math.min(...studentScores));
                const avg = Math.round(studentScores.reduce((s, v) => s + v, 0) / studentScores.length);

                const buckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
                for (const s of studentScores) {
                    if (s >= 90) buckets.A++;
                    else if (s >= 80) buckets.B++;
                    else if (s >= 70) buckets.C++;
                    else if (s >= 60) buckets.D++;
                    else buckets.F++;
                }

                const total = studentScores.length;
                const barSegments = ['A','B','C','D','F']
                    .filter(g => buckets[g] > 0)
                    .map(g => `<span style="width:${(buckets[g]/total*100).toFixed(1)}%;background:${gradeColors[g]}" title="${g}: ${buckets[g]}"></span>`)
                    .join('');

                const highColor = high >= 90 ? '#4ade80' : high >= 70 ? '#fbbf24' : '#f87171';
                const lowColor = low >= 90 ? '#4ade80' : low >= 70 ? '#fbbf24' : '#f87171';

                return `<div class="hd-grade-row">
                    <span class="hd-grade-row-name" title="${a.title}">${title}</span>
                    <span class="hd-grade-stat" style="color:${highColor}"><span class="hd-grade-stat-label">HIGH</span>${high}%</span>
                    <span class="hd-grade-stat" style="color:#ccc"><span class="hd-grade-stat-label">AVG</span>${avg}%</span>
                    <span class="hd-grade-stat" style="color:${lowColor}"><span class="hd-grade-stat-label">LOW</span>${low}%</span>
                    <div class="hd-grade-bar">${barSegments}</div>
                </div>`;
            });

            wrap.innerHTML = `<div class="hd-grade-table">${rows.join('')}</div>`;
        }

        // ═══════════════════════════════════════════════════════════════
        // TIME ON TASK — Full Analytics
        // ═══════════════════════════════════════════════════════════════

        function buildTotData() {
            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            const result = [];
            const MAX_DURATION = 7200; // Cap at 120 min per module — beyond this is idle browser time

            for (const a of classAssignments) {
                const students = [];
                let totalSeconds = 0;

                for (const sp of classProgressData) {
                    const completions = sp.completions || {};
                    const keys = Object.keys(completions);
                    const member = rosterMembers.find(m => m.uid === sp.uid);
                    const name = getStudentName(sp.uid);
                    const houseColor = member ? (HOUSE_COLORS[member.house] || '#888') : '#888';
                    const entries = [];

                    if (a.assignmentType === 'path') {
                        const pathDef = paths[a.contentId];
                        if (pathDef?.modules) {
                            for (const mod of pathDef.modules) {
                                const comp = findModuleCompletion(mod.id, completions, keys, true);
                                if (comp?.duration > 0) {
                                    entries.push({
                                        duration: Math.min(comp.duration, MAX_DURATION),
                                        score: comp.score ?? null,
                                        completedAt: comp.completedAt
                                    });
                                }
                            }
                        }
                    } else {
                        const comp = findModuleCompletion(a.contentId, completions, keys);
                        if (comp?.duration > 0) {
                            entries.push({
                                duration: Math.min(comp.duration, MAX_DURATION),
                                score: comp.score ?? null,
                                completedAt: comp.completedAt
                            });
                        }
                    }

                    if (entries.length > 0) {
                        const sumDur = entries.reduce((s, e) => s + e.duration, 0);
                        const avgScore = entries.filter(e => e.score != null).length > 0
                            ? entries.filter(e => e.score != null).reduce((s, e) => s + e.score, 0) / entries.filter(e => e.score != null).length
                            : null;
                        totalSeconds += sumDur;
                        students.push({
                            name,
                            uid: sp.uid,
                            duration: sumDur,
                            score: avgScore,
                            houseColor,
                            completedAt: entries[0].completedAt
                        });
                    }
                }

                if (students.length === 0) continue;

                const durations = students.map(s => s.duration);
                const avg = durations.reduce((s, d) => s + d, 0) / durations.length;
                const slowCount = students.filter(s => s.duration > avg * 2).length;
                const fastCount = students.filter(s => s.duration < avg * 0.25).length;

                result.push({
                    id: a.contentId,
                    title: a.title,
                    shortTitle: a.title.length > 28 ? a.title.substring(0, 26) + '\u2026' : a.title,
                    students,
                    totalSeconds,
                    min: Math.min(...durations),
                    max: Math.max(...durations),
                    avg: Math.round(avg),
                    slowCount,
                    fastCount
                });
            }

            return result;
        }

        function fmtDuration(seconds) {
            if (seconds < 60) return `${seconds}s`;
            const m = Math.floor(seconds / 60);
            if (m < 60) return `${m}m`;
            const h = Math.floor(m / 60);
            return `${h}h ${m % 60}m`;
        }

        function renderTotSummary(totData) {
            const el = document.getElementById('totSummary');
            if (!el) return;

            if (totData.length === 0) {
                el.innerHTML = '';
                return;
            }

            // Total class hours
            const totalSec = totData.reduce((s, a) => s + a.totalSeconds, 0);
            const totalHrs = (totalSec / 3600).toFixed(1);

            // Average session across all students
            const allDurations = totData.flatMap(a => a.students.map(s => s.duration));
            const avgSession = allDurations.length > 0
                ? Math.round(allDurations.reduce((s, d) => s + d, 0) / allDurations.length)
                : 0;

            // Busiest day of week
            const dayCounts = [0, 0, 0, 0, 0, 0, 0];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (const a of totData) {
                for (const s of a.students) {
                    if (s.completedAt) {
                        const dt = s.completedAt.toDate ? s.completedAt.toDate() : new Date(s.completedAt);
                        if (!isNaN(dt)) dayCounts[dt.getDay()]++;
                    }
                }
            }
            const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
            const busiestDay = dayCounts[maxDay] > 0 ? dayNames[maxDay] : '--';

            // Outlier students (any completion >2x class avg for that assignment)
            const outlierUids = new Set();
            for (const a of totData) {
                for (const s of a.students) {
                    if (s.duration > a.avg * 2) outlierUids.add(s.uid);
                }
            }

            el.innerHTML = `
                <div class="hd-tot-stat"><div class="hd-tot-stat-value">${totalHrs}h</div><div class="hd-tot-stat-label">Total Class Hours</div></div>
                <div class="hd-tot-stat"><div class="hd-tot-stat-value">${fmtDuration(avgSession)}</div><div class="hd-tot-stat-label">Avg Session</div></div>
                <div class="hd-tot-stat"><div class="hd-tot-stat-value">${busiestDay}</div><div class="hd-tot-stat-label">Busiest Day</div></div>
                <div class="hd-tot-stat"><div class="hd-tot-stat-value">${outlierUids.size}</div><div class="hd-tot-stat-label">Outliers</div></div>
            `;
        }

        function renderTotTable(totData) {
            const el = document.getElementById('totTableContent');
            if (!el) return;

            if (totData.length === 0) {
                el.innerHTML = '<div class="hd-analytics-empty">No time data yet</div>';
                return;
            }

            // Sort by avg descending
            const sorted = [...totData].sort((a, b) => b.avg - a.avg);
            const globalMax = Math.max(...sorted.map(a => a.max));

            let html = `<div class="hd-tot-table-header">
                <div>Assignment</div><div style="text-align:center">Min</div><div style="text-align:center">Avg</div><div style="text-align:center">Max</div><div style="text-align:center">Range</div><div style="text-align:center">Outliers</div>
            </div>`;

            for (const a of sorted) {
                const minPct = globalMax > 0 ? (a.min / globalMax * 100) : 0;
                const maxPct = globalMax > 0 ? (a.max / globalMax * 100) : 0;
                const avgPct = globalMax > 0 ? (a.avg / globalMax * 100) : 0;
                const barLeft = minPct;
                const barWidth = Math.max(maxPct - minPct, 1);

                let outlierHtml = '';
                if (a.slowCount > 0) outlierHtml += `<span class="hd-tot-outlier hd-tot-outlier-slow">${a.slowCount} slow</span> `;
                if (a.fastCount > 0) outlierHtml += `<span class="hd-tot-outlier hd-tot-outlier-fast">${a.fastCount} fast</span>`;
                if (!outlierHtml) outlierHtml = '<span style="color:var(--hd-text-muted)">--</span>';

                html += `<div class="hd-tot-row">
                    <div class="hd-tot-row-name" title="${escapeHtml(a.title)}">${escapeHtml(a.shortTitle)}</div>
                    <div class="hd-tot-row-val">${fmtDuration(a.min)}</div>
                    <div class="hd-tot-row-val" style="font-weight:600;color:var(--hd-text)">${fmtDuration(a.avg)}</div>
                    <div class="hd-tot-row-val">${fmtDuration(a.max)}</div>
                    <div><div class="hd-tot-range"><div class="hd-tot-range-bar" style="left:${barLeft}%;width:${barWidth}%"></div><div class="hd-tot-range-avg" style="left:${avgPct}%"></div></div></div>
                    <div style="text-align:center">${outlierHtml}</div>
                </div>`;
            }

            el.innerHTML = html;
        }

        function renderTotScatter(totData) {
            const canvas = document.getElementById('totChart');
            if (!canvas) return;

            const selId = document.getElementById('totAssignment')?.value;
            const aData = totData.find(a => a.id === selId);

            if (!aData || aData.students.filter(s => s.score != null).length === 0) {
                if (totChart) { totChart.destroy(); totChart = null; }
                canvas.parentElement.style.display = 'none';
                document.getElementById('totTableContent').innerHTML = '<div class="hd-analytics-empty">No scored time data for this assignment</div>';
                return;
            }

            document.getElementById('totTableContent').innerHTML = '';
            canvas.parentElement.style.display = '';

            const scored = aData.students.filter(s => s.score != null);
            const avgTime = aData.avg / 60;
            const avgScore = scored.reduce((s, st) => s + st.score, 0) / scored.length;

            if (totChart) { totChart.destroy(); totChart = null; }

            // Build reference line datasets for quadrant markers
            const maxTime = Math.max(...scored.map(s => s.duration / 60)) * 1.1;
            const refColor = hdOverlay(0.2);

            totChart = new Chart(canvas, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Avg Time',
                            data: [{ x: avgTime, y: 0 }, { x: avgTime, y: 100 }],
                            type: 'line',
                            borderColor: refColor,
                            borderDash: [4, 4],
                            borderWidth: 1,
                            pointRadius: 0,
                            fill: false
                        },
                        {
                            label: 'Avg Score',
                            data: [{ x: 0, y: avgScore }, { x: maxTime, y: avgScore }],
                            type: 'line',
                            borderColor: refColor,
                            borderDash: [4, 4],
                            borderWidth: 1,
                            pointRadius: 0,
                            fill: false
                        },
                        {
                            label: 'Students',
                            data: scored.map(s => ({ x: Math.round(s.duration / 60 * 10) / 10, y: Math.round(s.score) })),
                            backgroundColor: scored.map(s => s.houseColor),
                            pointRadius: 7,
                            pointHoverRadius: 10
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            filter: (item) => item.datasetIndex === 2,
                            callbacks: {
                                label: (ctx) => {
                                    const s = scored[ctx.dataIndex];
                                    return `${s.name}: ${ctx.parsed.x}min, ${ctx.parsed.y}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Time (minutes)', color: hdChartText(), font: { size: 11 } },
                            ticks: { color: hdChartText(), font: { size: 10 } },
                            grid: { color: hdOverlay(0.06) },
                            beginAtZero: true
                        },
                        y: {
                            title: { display: true, text: 'Score (%)', color: hdChartText(), font: { size: 11 } },
                            ticks: { color: hdChartText(), font: { size: 10 }, callback: v => v + '%' },
                            grid: { color: hdOverlay(0.06) },
                            min: 0, max: 100
                        }
                    }
                }
            });
        }

        function renderTotHistogram(totData) {
            const canvas = document.getElementById('totChart');
            if (!canvas) return;

            const selId = document.getElementById('totAssignment')?.value;
            const aData = totData.find(a => a.id === selId);

            if (!aData) {
                if (totChart) { totChart.destroy(); totChart = null; }
                canvas.parentElement.style.display = 'none';
                document.getElementById('totTableContent').innerHTML = '<div class="hd-analytics-empty">No time data for this assignment</div>';
                return;
            }

            document.getElementById('totTableContent').innerHTML = '';
            canvas.parentElement.style.display = '';

            const durations = aData.students.map(s => s.duration / 60); // minutes
            const bucketSize = 5; // 5-min buckets
            const maxMin = Math.max(...durations);
            const bucketCount = Math.max(Math.ceil(maxMin / bucketSize), 1);
            const buckets = new Array(bucketCount).fill(0);
            const labels = [];

            for (let i = 0; i < bucketCount; i++) {
                labels.push(`${i * bucketSize}-${(i + 1) * bucketSize}m`);
            }

            for (const d of durations) {
                const idx = Math.min(Math.floor(d / bucketSize), bucketCount - 1);
                buckets[idx]++;
            }

            // Green→yellow→red gradient by position
            const colors = buckets.map((_, i) => {
                const t = bucketCount > 1 ? i / (bucketCount - 1) : 0;
                if (t < 0.5) {
                    const r = Math.round(74 + (251 - 74) * (t * 2));
                    const g = Math.round(222 + (191 - 222) * (t * 2));
                    const b = Math.round(128 + (36 - 128) * (t * 2));
                    return `rgb(${r},${g},${b})`;
                } else {
                    const t2 = (t - 0.5) * 2;
                    const r = Math.round(251 + (248 - 251) * t2);
                    const g = Math.round(191 + (113 - 191) * t2);
                    const b = Math.round(36 + (113 - 36) * t2);
                    return `rgb(${r},${g},${b})`;
                }
            });

            if (totChart) { totChart.destroy(); totChart = null; }

            totChart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Students',
                        data: buckets,
                        backgroundColor: colors,
                        borderRadius: 4,
                        maxBarThickness: 40
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `${ctx.raw} student${ctx.raw !== 1 ? 's' : ''}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Duration', color: hdChartText(), font: { size: 11 } },
                            ticks: { color: hdChartText(), font: { size: 10 } },
                            grid: { display: false }
                        },
                        y: {
                            title: { display: true, text: 'Students', color: hdChartText(), font: { size: 11 } },
                            ticks: { color: hdChartText(), font: { size: 10 }, stepSize: 1 },
                            grid: { color: hdOverlay(0.06) },
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function setTotView(view) {
            totView = view;
            document.querySelectorAll('[data-totview]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.totview === view);
            });
            const assignmentGroup = document.getElementById('totAssignmentGroup');
            if (assignmentGroup) {
                assignmentGroup.style.display = (view === 'scatter' || view === 'distribution') ? '' : 'none';
            }
            renderTimeOnTask();
        }

        function renderTimeOnTask() {
            const totData = buildTotData();

            // Populate assignment selector
            const sel = document.getElementById('totAssignment');
            if (sel && totData.length > 0) {
                const currentVal = sel.value;
                sel.innerHTML = totData.map(a =>
                    `<option value="${escapeHtml(a.id)}"${a.id === currentVal ? ' selected' : ''}>${escapeHtml(a.shortTitle)}</option>`
                ).join('');
                if (!currentVal || !totData.find(a => a.id === currentVal)) {
                    sel.value = totData[0].id;
                }
            }

            renderTotSummary(totData);

            const tableEl = document.getElementById('totTableContent');
            const chartWrap = document.getElementById('totChartWrap');

            if (totView === 'table') {
                if (chartWrap) chartWrap.style.display = 'none';
                if (totChart) { totChart.destroy(); totChart = null; }
                renderTotTable(totData);
            } else {
                // Scatter / Distribution — clear table, show chart
                if (tableEl) tableEl.innerHTML = '';
                if (chartWrap) chartWrap.style.display = '';
                if (totView === 'scatter') {
                    renderTotScatter(totData);
                } else {
                    renderTotHistogram(totData);
                }
            }
        }

        function toggleLeaderboard() {
            const toggle = document.getElementById('perfLeaderboardToggle');
            const list = document.getElementById('perfLeaderboardList');
            if (toggle && list) {
                list.style.opacity = toggle.checked ? '1' : '0.4';
            }
        }

        function formatDateShort(dateStr) {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        // ── Donut center-text plugin (inline, not global) ──
        const donutCenterPlugin = {
            id: 'donutCenter',
            beforeDraw(chart) {
                const meta = chart.options.plugins.donutCenter;
                if (!meta) return;
                const { ctx, chartArea: { left, right, top, bottom } } = chart;
                const cx = (left + right) / 2;
                const cy = (top + bottom) / 2;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#e0e0e0';
                ctx.font = 'bold 1.3rem -apple-system, sans-serif';
                ctx.fillText(meta.line1, cx, cy - 8);
                ctx.font = '0.65rem -apple-system, sans-serif';
                ctx.fillStyle = '#888';
                ctx.fillText(meta.line2, cx, cy + 12);
                ctx.restore();
            }
        };

        function renderStudentStatusDonut() {
            const canvas = document.getElementById('studentStatusDonut');
            if (!canvas) return;
            if (studentStatusDonut) { studentStatusDonut.destroy(); studentStatusDonut = null; }

            if (rosterMembers.length === 0 || classAssignments.length === 0) {
                canvas.parentElement.innerHTML = '<div class="hd-analytics-empty">No students yet</div>';
                return;
            }

            let onTrack = 0, inProgress = 0, atRisk = 0, noActivity = 0;
            for (const member of rosterMembers) {
                const { pct, completed } = getStudentCompletion(member.uid);
                if (completed === 0) noActivity++;
                else if (pct >= 70) onTrack++;
                else if (pct >= 40) inProgress++;
                else atRisk++;
            }

            studentStatusDonut = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['On Track', 'In Progress', 'At Risk', 'No Activity'],
                    datasets: [{
                        data: [onTrack, inProgress, atRisk, noActivity],
                        backgroundColor: ['#4ade80', '#fbbf24', '#f87171', hdOverlay(0.08)],
                        borderWidth: 0
                    }]
                },
                plugins: [donutCenterPlugin],
                options: {
                    cutout: '65%',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: hdChartText(), font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8, padding: 12 }
                        },
                        donutCenter: { line1: String(rosterMembers.length), line2: 'students' }
                    }
                }
            });
        }

        function renderAssignmentCompletionDonut() {
            const canvas = document.getElementById('assignmentCompletionDonut');
            if (!canvas) return;
            if (assignmentCompletionDonut) { assignmentCompletionDonut.destroy(); assignmentCompletionDonut = null; }

            if (classAssignments.length === 0) {
                canvas.parentElement.innerHTML = '<div class="hd-analytics-empty">No assignments yet</div>';
                return;
            }

            const memberCount = rosterMembers.length || 1;
            let high = 0, moderate = 0, low = 0;

            for (const a of classAssignments) {
                let totalPct = 0;
                for (const sp of classProgressData) {
                    const result = resolveAssignmentProgress(a, sp.completions || {});
                    totalPct += result.pct;
                }
                const avgPct = Math.round(totalPct / memberCount);
                if (avgPct >= 70) high++;
                else if (avgPct >= 40) moderate++;
                else low++;
            }

            assignmentCompletionDonut = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['High (>=70%)', 'Moderate (40-69%)', 'Low (<40%)'],
                    datasets: [{
                        data: [high, moderate, low],
                        backgroundColor: ['#4ade80', '#fbbf24', '#f87171'],
                        borderWidth: 0
                    }]
                },
                plugins: [donutCenterPlugin],
                options: {
                    cutout: '65%',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: hdChartText(), font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8, padding: 12 }
                        },
                        donutCenter: { line1: String(classAssignments.length), line2: 'assignments' }
                    }
                }
            });
        }

        function renderScoreDistDonut() {
            const canvas = document.getElementById('scoreDistDonut');
            if (!canvas) return;
            if (scoreDistDonut) { scoreDistDonut.destroy(); scoreDistDonut = null; }

            // Collect all scores across students + assignments
            const allScores = [];
            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};

            for (const sp of classProgressData) {
                const completions = sp.completions || {};
                const keys = Object.keys(completions);
                for (const a of classAssignments) {
                    if (a.assignmentType === 'path') {
                        const pathDef = paths[a.contentId];
                        if (pathDef?.modules) {
                            for (const mod of pathDef.modules) {
                                const comp = findModuleCompletion(mod.id, completions, keys, true);
                                if (comp?.score != null) allScores.push(comp.score);
                            }
                        }
                    } else {
                        const comp = findModuleCompletion(a.contentId, completions, keys);
                        if (comp?.score != null) allScores.push(comp.score);
                    }
                }
            }

            if (allScores.length === 0) {
                canvas.parentElement.innerHTML = '<div class="hd-analytics-empty">No scored work yet</div>';
                return;
            }

            let gradeA = 0, gradeB = 0, gradeC = 0, gradeD = 0, gradeF = 0;
            for (const s of allScores) {
                if (s >= 90) gradeA++;
                else if (s >= 80) gradeB++;
                else if (s >= 70) gradeC++;
                else if (s >= 60) gradeD++;
                else gradeF++;
            }

            const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

            scoreDistDonut = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (<60)'],
                    datasets: [{
                        data: [gradeA, gradeB, gradeC, gradeD, gradeF],
                        backgroundColor: ['#4ade80', '#86efac', '#fbbf24', '#fb923c', '#f87171'],
                        borderWidth: 0
                    }]
                },
                plugins: [donutCenterPlugin],
                options: {
                    cutout: '65%',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: hdChartText(), font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8, padding: 12 }
                        },
                        donutCenter: { line1: avg + '%', line2: 'class avg' }
                    }
                }
            });
        }

        function getRankBadge(rank) {
            if (rank === 1) return '<span class="hd-rank-badge rank-1">1</span>';
            if (rank === 2) return '<span class="hd-rank-badge rank-2">2</span>';
            if (rank === 3) return '<span class="hd-rank-badge rank-3">3</span>';
            return '<span class="hd-rank-badge rank-default">' + rank + '</span>';
        }

        // ═══════════════════════════════════════════════════════════════
        // PERFORMANCE TRACKER (Civilization-style)
        // ═══════════════════════════════════════════════════════════════

        let perfChart = null;
        let perfView = 'line';

        function buildPerfTimeline() {
            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            const timelines = [];

            // Count total effective modules across all assignments
            let totalModuleCount = 0;
            for (const a of classAssignments) {
                if (a.assignmentType === 'path') {
                    const pathDef = paths[a.contentId];
                    totalModuleCount += pathDef?.modules?.length || 1;
                } else {
                    totalModuleCount++;
                }
            }
            if (totalModuleCount === 0) return [];

            for (const member of rosterMembers) {
                const studentProgress = classProgressData.find(p => p.id === member.uid);
                const completions = studentProgress?.completions || {};
                const keys = Object.keys(completions);
                const houseColor = HOUSE_COLORS[member.house] || '#888';
                const fullName = (member.firstName && member.lastName)
                    ? `${member.firstName} ${member.lastName?.[0] || ''}.`
                    : member.displayName || 'Student';

                // Collect all completion events with timestamps
                const events = [];
                for (const a of classAssignments) {
                    if (a.assignmentType === 'path') {
                        const pathDef = paths[a.contentId];
                        if (pathDef?.modules) {
                            for (const mod of pathDef.modules) {
                                const comp = findModuleCompletion(mod.id, completions, keys, true);
                                if (comp?.completedAt) {
                                    const date = comp.completedAt.toDate
                                        ? comp.completedAt.toDate()
                                        : new Date(comp.completedAt);
                                    events.push({ date, score: comp.score });
                                }
                            }
                        }
                    } else {
                        const comp = findModuleCompletion(a.contentId, completions, keys);
                        if (comp?.completedAt) {
                            const date = comp.completedAt.toDate
                                ? comp.completedAt.toDate()
                                : new Date(comp.completedAt);
                            events.push({ date, score: comp.score });
                        }
                    }
                }

                if (events.length === 0) continue;
                events.sort((a, b) => a.date - b.date);

                // Build running metrics at each event
                const dataPoints = [];
                let cumulativeCount = 0;
                let scoreSum = 0;
                let scoredCount = 0;

                for (const ev of events) {
                    cumulativeCount++;
                    if (ev.score != null) { scoreSum += ev.score; scoredCount++; }
                    dataPoints.push({
                        date: ev.date,
                        completion: Math.round((cumulativeCount / totalModuleCount) * 100),
                        score: scoredCount > 0 ? Math.round(scoreSum / scoredCount) : null,
                        cumulative: cumulativeCount
                    });
                }

                timelines.push({
                    studentUid: member.uid,
                    studentName: fullName,
                    houseColor,
                    dataPoints
                });
            }

            return timelines;
        }

        function renderPerfChart() {
            const canvas = document.getElementById('perfChart');
            const emptyEl = document.getElementById('perfEmpty');
            if (!canvas) return;

            if (perfChart) { perfChart.destroy(); perfChart = null; }

            const metric = document.getElementById('perfMetric')?.value || 'completion';
            const filter = document.getElementById('perfFilter')?.value || 'all';
            const studentSelect = document.getElementById('perfStudent');
            const chartWrap = canvas.parentElement;

            // Show/hide student picker
            if (studentSelect) {
                studentSelect.style.display = filter === 'individual' ? '' : 'none';
            }

            const timelines = buildPerfTimeline();
            const leaderboardList = document.getElementById('perfLeaderboardList');

            if (perfView === 'leaderboard') {
                canvas.style.display = 'none';
                if (emptyEl) emptyEl.style.display = 'none';
                if (timelines.length === 0) {
                    if (leaderboardList) leaderboardList.innerHTML = '<div class="hd-leaderboard-empty">No completions yet.</div>';
                    if (leaderboardList) leaderboardList.style.display = '';
                } else {
                    if (leaderboardList) leaderboardList.style.display = '';
                    renderPerfLeaderboard(timelines, metric);
                }
                return;
            }

            if (leaderboardList) leaderboardList.style.display = 'none';

            if (timelines.length === 0) {
                canvas.style.display = 'none';
                if (emptyEl) emptyEl.style.display = '';
                return;
            }
            canvas.style.display = '';
            if (emptyEl) emptyEl.style.display = 'none';

            // Populate student picker when switching to individual
            if (filter === 'individual' && studentSelect && studentSelect.options.length <= 1) {
                studentSelect.innerHTML = '';
                timelines.forEach((t, i) => {
                    const opt = document.createElement('option');
                    opt.value = t.studentUid;
                    opt.textContent = t.studentName;
                    studentSelect.appendChild(opt);
                });
            }

            if (perfView === 'histogram') {
                renderPerfHistogram(canvas, timelines, metric);
            } else {
                renderPerfLineChart(canvas, timelines, metric, filter, studentSelect);
            }
        }

        function renderPerfLineChart(canvas, timelines, metric, filter, studentSelect) {
            // Get current value per student for percentile filtering
            const currentValues = timelines.map(t => {
                const last = t.dataPoints[t.dataPoints.length - 1];
                return { uid: t.studentUid, val: metric === 'score' ? (last.score ?? 0) : last[metric] ?? 0 };
            });
            currentValues.sort((a, b) => a.val - b.val);

            let datasets = [];
            const isPercentile = ['top25', 'mid50', 'bot25'].includes(filter);

            if (isPercentile) {
                // Compute percentile bands
                const n = currentValues.length;
                const p25 = Math.floor(n * 0.25);
                const p75 = Math.floor(n * 0.75);
                const bands = {
                    bot25: currentValues.slice(0, p25).map(c => c.uid),
                    mid50: currentValues.slice(p25, p75).map(c => c.uid),
                    top25: currentValues.slice(p75).map(c => c.uid)
                };
                const bandColors = { top25: '#4ade80', mid50: '#fbbf24', bot25: '#f87171' };
                const bandLabels = { top25: 'Top 25%', mid50: 'Middle 50%', bot25: 'Bottom 25%' };

                const targetBand = filter;
                const uids = bands[targetBand];
                const bandTimelines = timelines.filter(t => uids.includes(t.studentUid));
                if (bandTimelines.length > 0) {
                    // Average the band into a single line
                    const allDates = [...new Set(bandTimelines.flatMap(t => t.dataPoints.map(p => p.date.toISOString().split('T')[0])))].sort();
                    const avgData = allDates.map(dateStr => {
                        let sum = 0, count = 0;
                        for (const t of bandTimelines) {
                            // Find closest point on or before this date
                            let val = 0;
                            for (const p of t.dataPoints) {
                                if (p.date.toISOString().split('T')[0] <= dateStr) {
                                    val = metric === 'score' ? (p.score ?? 0) : p[metric] ?? 0;
                                }
                            }
                            sum += val; count++;
                        }
                        return { x: dateStr, y: count > 0 ? Math.round(sum / count) : 0 };
                    });
                    datasets.push({
                        label: bandLabels[targetBand],
                        data: avgData,
                        borderColor: bandColors[targetBand],
                        backgroundColor: bandColors[targetBand] + '22',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        borderWidth: 2
                    });
                }
            } else if (filter === 'individual') {
                const selectedUid = studentSelect?.value;
                for (const t of timelines) {
                    const isSelected = t.studentUid === selectedUid;
                    datasets.push({
                        label: t.studentName,
                        data: t.dataPoints.map(p => ({
                            x: p.date.toISOString().split('T')[0],
                            y: metric === 'score' ? (p.score ?? 0) : p[metric] ?? 0
                        })),
                        borderColor: isSelected ? t.houseColor : hdOverlay(0.08),
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: isSelected ? 4 : 0,
                        borderWidth: isSelected ? 3 : 1,
                        order: isSelected ? 0 : 1
                    });
                }

                // Add class average reference line
                const allDates = [...new Set(timelines.flatMap(t => t.dataPoints.map(p => p.date.toISOString().split('T')[0])))].sort();
                const avgData = allDates.map(dateStr => {
                    let sum = 0, count = 0;
                    for (const t of timelines) {
                        let val = 0;
                        for (const p of t.dataPoints) {
                            if (p.date.toISOString().split('T')[0] <= dateStr) {
                                val = metric === 'score' ? (p.score ?? 0) : p[metric] ?? 0;
                            }
                        }
                        sum += val; count++;
                    }
                    return { x: dateStr, y: count > 0 ? Math.round(sum / count) : 0 };
                });
                datasets.push({
                    label: 'Class Average',
                    data: avgData,
                    borderColor: 'rgba(212, 160, 23, 0.5)',
                    borderDash: [6, 3],
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                    order: 2
                });
            } else {
                // All students - one line per student
                for (const t of timelines) {
                    datasets.push({
                        label: t.studentName,
                        data: t.dataPoints.map(p => ({
                            x: p.date.toISOString().split('T')[0],
                            y: metric === 'score' ? (p.score ?? 0) : p[metric] ?? 0
                        })),
                        borderColor: t.houseColor,
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 2,
                        borderWidth: 2,
                        pointBackgroundColor: t.houseColor
                    });
                }
            }

            const yMax = metric === 'cumulative' ? undefined : 100;

            // Collect all unique dates for category axis labels
            const allDates = [...new Set(datasets.flatMap(d => d.data.map(p => p.x)))].sort();

            perfChart = new Chart(canvas, {
                type: 'line',
                data: { labels: allDates, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'nearest', intersect: false },
                    plugins: {
                        legend: {
                            display: datasets.length <= 12,
                            labels: { color: hdChartText(), font: { size: 11 }, boxWidth: 12 }
                        },
                        tooltip: {
                            callbacks: {
                                title: ctx => ctx[0]?.raw?.x ? formatDateShort(ctx[0].raw.x) : '',
                                label: ctx => `${ctx.dataset.label}: ${ctx.raw.y}${metric !== 'cumulative' ? '%' : ''}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'category',
                            ticks: { color: hdChartText(), font: { size: 10 }, maxTicksLimit: 12, callback: function(v) { return formatDateShort(this.getLabelForValue(v)); } },
                            grid: { color: hdOverlay(0.08) }
                        },
                        y: {
                            beginAtZero: true,
                            max: yMax,
                            ticks: { color: hdChartText(), font: { size: 11 }, callback: v => metric !== 'cumulative' ? v + '%' : v },
                            grid: { color: hdOverlay(0.08) }
                        }
                    }
                }
            });
        }

        function renderPerfHistogram(canvas, timelines, metric) {
            // Get latest value per student
            const values = timelines.map(t => {
                const last = t.dataPoints[t.dataPoints.length - 1];
                return metric === 'score' ? (last.score ?? 0) : last[metric] ?? 0;
            });

            // Create buckets
            let bucketSize, maxVal;
            if (metric === 'cumulative') {
                maxVal = Math.max(...values, 10);
                bucketSize = Math.max(1, Math.ceil(maxVal / 10));
            } else {
                maxVal = 100;
                bucketSize = 10;
            }

            const bucketCount = Math.ceil(maxVal / bucketSize);
            const buckets = new Array(bucketCount).fill(0);
            const labels = [];
            for (let i = 0; i < bucketCount; i++) {
                const lo = i * bucketSize;
                const hi = lo + bucketSize;
                labels.push(`${lo}-${hi}`);
            }

            for (const v of values) {
                const idx = Math.min(Math.floor(v / bucketSize), bucketCount - 1);
                buckets[idx]++;
            }

            // Color gradient: red→yellow→green
            const colors = buckets.map((_, i) => {
                const pct = bucketCount > 1 ? i / (bucketCount - 1) : 1;
                if (pct < 0.4) return '#f87171';
                if (pct < 0.7) return '#fbbf24';
                return '#4ade80';
            });

            perfChart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Students',
                        data: buckets,
                        backgroundColor: colors,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.raw} student${ctx.raw !== 1 ? 's' : ''}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: hdChartText(), font: { size: 11 } },
                            grid: { color: hdOverlay(0.08) },
                            title: { display: true, text: metric === 'cumulative' ? 'Completions' : metric === 'score' ? 'Avg Score' : 'Completion %', color: hdChartText(), font: { size: 11 } }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: hdChartText(), font: { size: 11 }, stepSize: 1 },
                            grid: { color: hdOverlay(0.08) },
                            title: { display: true, text: 'Students', color: hdChartText(), font: { size: 11 } }
                        }
                    }
                }
            });
        }

        function renderPerfLeaderboard(timelines, metric) {
            const list = document.getElementById('perfLeaderboardList');
            if (!list) return;

            if (timelines.length === 0) {
                list.innerHTML = '<div class="hd-leaderboard-empty">No completions yet.</div>';
                return;
            }

            // Get current metric value per student from timeline data
            const students = timelines.map(t => {
                const last = t.dataPoints[t.dataPoints.length - 1];
                let val, display;
                if (metric === 'completion') {
                    val = last.completion ?? 0;
                    display = val + '%';
                } else if (metric === 'score') {
                    val = last.score ?? 0;
                    display = val + '%';
                } else {
                    val = last.cumulative ?? 0;
                    display = val + '';
                }
                return {
                    uid: t.studentUid,
                    name: t.studentName,
                    houseColor: t.houseColor,
                    val,
                    display
                };
            });

            // Sort descending by metric value
            students.sort((a, b) => b.val - a.val);

            // Find max value for completion bar scaling
            const maxVal = students[0]?.val || 1;

            const metricLabels = { completion: 'Completion', score: 'Avg Score', cumulative: 'Completed' };
            const metricLabel = metricLabels[metric] || metric;

            list.innerHTML = students.map((s, i) => {
                const rank = i + 1;
                const topClass = rank <= 3 ? `top-${rank}` : '';
                const barPct = maxVal > 0 ? Math.round((s.val / maxVal) * 100) : 0;
                return `
                    <div class="hd-leaderboard-item ${topClass}" role="listitem">
                        <span class="hd-leaderboard-rank">${getRankBadge(rank)}</span>
                        <span class="hd-leaderboard-name">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${s.houseColor};margin-right:6px;vertical-align:middle"></span>
                            ${escapeHtml(s.name)}
                        </span>
                        <span class="hd-leaderboard-score">${s.display}</span>
                        <span class="hd-leaderboard-pct" style="min-width:60px">
                            <span style="display:block;height:4px;border-radius:2px;background:rgba(var(--hd-overlay-rgb),0.08)">
                                <span style="display:block;height:100%;width:${barPct}%;border-radius:2px;background:${s.houseColor}"></span>
                            </span>
                        </span>
                    </div>
                `;
            }).join('');
        }

        function setPerfView(view) {
            perfView = view;
            document.querySelectorAll('[data-view]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            const scopeGroup = document.getElementById('perfScopeGroup');
            const studentSelect = document.getElementById('perfStudent');
            const filterSelect = document.getElementById('perfFilter');
            const chartWrap = document.querySelector('.hd-perf-chart-wrap');
            const leaderboardList = document.getElementById('perfLeaderboardList');
            const toggleGroup = document.getElementById('perfLeaderboardToggleGroup');

            if (view === 'leaderboard') {
                if (scopeGroup) scopeGroup.style.display = 'none';
                if (chartWrap) chartWrap.style.display = 'none';
                if (leaderboardList) leaderboardList.style.display = '';
                if (toggleGroup) toggleGroup.style.display = '';
            } else {
                if (chartWrap) chartWrap.style.display = '';
                if (leaderboardList) leaderboardList.style.display = 'none';
                if (toggleGroup) toggleGroup.style.display = 'none';
                if (view === 'histogram') {
                    if (scopeGroup) scopeGroup.style.display = 'none';
                } else {
                    if (scopeGroup) scopeGroup.style.display = '';
                    if (studentSelect) {
                        studentSelect.style.display = filterSelect?.value === 'individual' ? '' : 'none';
                    }
                }
            }
            renderPerfChart();
        }

        // ═══════════════════════════════════════════════════════════════
        // CONTENT BROWSER
        // ═══════════════════════════════════════════════════════════════

        const HOUSE_META = {
            shield: { name: 'Shield House', desc: 'Security Fundamentals', icon: '/assets/images/icons/icon-shield.webp', color: '#a855f7' },
            web:    { name: 'Web House',    desc: 'Networking',            icon: '/assets/images/icons/icon-globe.webp', color: '#3b82f6' },
            forge:  { name: 'Forge House',  desc: 'Systems',              icon: '/assets/images/icons/icon-tools.webp', color: '#f97316' },
            script: { name: 'Script House', desc: 'Automation',           icon: '/assets/images/icons/icon-scroll.webp', color: '#22c55e' },
            cloud:  { name: 'Cloud House',  desc: 'Cloud Computing',      icon: '/assets/images/icons/icon-globe.webp', color: '#06b6d4' },
            code:   { name: 'Code House',   desc: 'DevOps',               icon: '/assets/images/icons/icon-laptop.webp', color: '#ec4899' },
            key:    { name: 'Key House',    desc: 'Cryptography',         icon: '/assets/images/icons/icon-key.webp', color: '#eab308' },
            eye:    { name: 'Eye House',    desc: 'Monitoring & Detection', icon: '/assets/images/icons/icon-eye.webp', color: '#6366f1' },
            ai:     { name: 'AI House',    desc: 'House of the Machine',  icon: '/assets/images/icons/icon-brain.webp', color: '#a855f7' },
            arctic: { name: 'The Arctic',  desc: 'Linux Training Hub',    icon: '/assets/images/icons/icon-terminal.webp', color: '#3ab8e0' }
        };

        // Map non-house path keys to their parent house for filtering
        const PATH_HOUSE_MAP = {
            'ai-builder': 'ai',
            'ai-foundations': 'ai',
            'ai-security': 'ai',
            'aplus-core1': 'forge',
            'aplus-core2': 'forge',
            'arctic-advanced-topics': 'arctic',
            'arctic-arena': 'arctic',
            'arctic-clh-advanced': 'arctic',
            'arctic-clh-fundamentals': 'arctic',
            'arctic-clh-intermediate': 'arctic',
            'arctic-cli-fundamentals': 'arctic',
            'arctic-databases': 'arctic',
            'arctic-hardening': 'arctic',
            'arctic-incident-response': 'arctic',
            'arctic-linux-admin': 'arctic',
            'arctic-log-analysis': 'arctic',
            'arctic-networking': 'arctic',
            'arctic-offensive-tools': 'arctic',
            'arctic-shell-scripting': 'arctic',
            'arctic-sysadmin': 'arctic',
            'arctic-text-processing': 'arctic',
            'aws-ccp': 'cloud',
            'aws-developer': 'cloud',
            'azure-fundamentals': 'cloud',
            'casp-plus': 'shield',
            'ccna': 'web',
            'comptia-linux': 'script',
            'comptia-network': 'web',
            'cryptography-track': 'key',
            'cse': 'cloud',
            'cyber-framework': 'shield',
            'cysa': 'eye',
            'cysa-plus': 'eye',
            'devops-fundamentals': 'code',
            'linux-admin': 'script',
            'linux-mastery': 'script',
            'md-100': 'forge',
            'openstack': 'cloud',
            'python-engineering': 'script',
            'python-fundamentals': 'script',
            'security-operations': 'eye',
            'security-plus': 'shield',
            'security-plus-crypto': 'key',
            'wsa': 'cloud'
        };

        function cbIconImg(val) {
            if (!val) return '';
            if (val.includes('.webp')) return '<img src="' + val + '" alt="" width="28" height="28" style="object-fit:contain">';
            return val;
        }

        let cbActiveTab = 'paths';

        function openContentBrowser() {
            if (!selectedClassId) return;
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            cbSelection.clear();
            cbActiveTab = 'paths';

            const overlay = document.createElement('div');
            overlay.className = 'cb-overlay';
            overlay.id = 'contentBrowser';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'contentBrowserTitle');
            overlay.innerHTML = `
                <div class="cb-header">
                    <div class="cb-header-title" id="contentBrowserTitle">Assign Content to: ${escapeHtml(cls.name)}</div>
                    <button class="cb-close" onclick="closeContentBrowser()">&times;</button>
                </div>
                <div class="cb-tabs">
                    <button class="cb-tab active" id="cbTabPaths" onclick="switchBrowserTab('paths')">Courses</button>
                    <button class="cb-tab" id="cbTabItems" onclick="switchBrowserTab('items')">Individual Items</button>
                </div>
                <div class="cb-filters" id="cbFilters" style="display:none">
                    <select class="cb-filter-select" id="cbFilterHouse" onchange="applyBrowserFilters()">
                        <option value="">All Houses</option>
                        ${Object.entries(HOUSE_META).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
                    </select>
                    <select class="cb-filter-select" id="cbFilterType" onchange="applyBrowserFilters()">
                        <option value="">All Types</option>
                        <option value="course">Course</option>
                        <option value="presentation">Presentation</option>
                        <option value="applet">Applet</option>
                        <option value="quiz">Quiz</option>
                        <option value="lab">Lab</option>
                        <option value="tool">Tool</option>
                    </select>
                    <select class="cb-filter-select" id="cbFilterDiff" onchange="applyBrowserFilters()">
                        <option value="">All Difficulties</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <input type="text" class="cb-search" id="cbSearch" placeholder="Search by title..." oninput="applyBrowserFilters()">
                </div>
                <div class="cb-body" id="cbBody"></div>
                <div class="cb-footer">
                    <div class="cb-footer-count" id="cbSelCount">0 items selected</div>
                    <div class="cb-footer-field">
                        <label>Due:</label>
                        <input type="date" class="cb-footer-input" id="cbDueDate">
                    </div>
                    <div class="cb-footer-field cb-notes-input">
                        <label>Notes:</label>
                        <input type="text" class="cb-footer-input" id="cbNotes" placeholder="Optional instructions..." maxlength="500" style="width:100%">
                    </div>
                    <div class="cb-footer-actions">
                        <button class="hd-btn hd-btn-secondary" onclick="closeContentBrowser()">Cancel</button>
                        <button class="hd-btn hd-btn-primary" id="cbAssignBtn" onclick="submitAssignments()" disabled>Assign</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            renderBrowserPaths();
        }

        function closeContentBrowser() {
            const el = document.getElementById('contentBrowser');
            if (!el) return;
            el.classList.add('fade-out');
            setTimeout(() => el.remove(), 250);
        }

        function switchBrowserTab(tab) {
            cbActiveTab = tab;
            document.getElementById('cbTabPaths').classList.toggle('active', tab === 'paths');
            document.getElementById('cbTabItems').classList.toggle('active', tab === 'items');
            document.getElementById('cbFilters').style.display = tab === 'items' ? 'flex' : 'none';

            if (tab === 'paths') {
                renderBrowserPaths();
            } else {
                applyBrowserFilters();
            }
        }

        function renderBrowserPaths() {
            const body = document.getElementById('cbBody');
            if (!body) return;

            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            const houseKeys = Object.keys(HOUSE_META);

            // Separate courses (non-house paths) from house paths
            const courseKeys = Object.keys(paths).filter(k => !houseKeys.includes(k));

            let html = '';

            // ── COURSES SECTION (prominent, first) ──
            if (courseKeys.length > 0) {
                html += '<div class="cb-section-label">Courses</div>';
                let courseCards = '';
                courseKeys.forEach(key => {
                    const pathData = paths[key];
                    const modCount = pathData.modules ? pathData.modules.length : 0;
                    const selected = cbSelection.has('path:' + key);
                    const icon = pathData.icon || '\uD83D\uDCDA';
                    const color = pathData.color || '#888';
                    const parentHouse = PATH_HOUSE_MAP[key];
                    const houseLabel = parentHouse ? capitalize(parentHouse) : key;

                    courseCards += `
                        <div class="cb-card${selected ? ' selected' : ''}" onclick="toggleBrowserSelection('path:${key}', 'path', this)">
                            <div class="cb-card-icon">${cbIconImg(icon)}</div>
                            <div class="cb-card-title">${escapeHtml(pathData.name)}</div>
                            <div class="cb-card-desc">${escapeHtml(pathData.description)}</div>
                            <div class="cb-card-badges">
                                <span class="cb-badge cb-badge-house" style="background:${color}20; color:${color}">${escapeHtml(houseLabel)}</span>
                                <span class="cb-badge cb-badge-count">${modCount} modules</span>
                                <span class="cb-badge cb-badge-type">course</span>
                            </div>
                        </div>
                    `;
                });
                html += '<div class="cb-grid">' + courseCards + '</div>';
            }

            // ── HOUSE PATHS SECTION (secondary) ──
            html += '<div class="cb-section-label">Full House Paths</div>';
            let houseCards = '';
            houseKeys.forEach(key => {
                const pathData = paths[key];
                if (!pathData) return;

                const meta = HOUSE_META[key];
                const modCount = pathData.modules ? pathData.modules.length : 0;
                const selected = cbSelection.has('path:' + key);

                houseCards += `
                    <div class="cb-card${selected ? ' selected' : ''}" onclick="toggleBrowserSelection('path:${key}', 'path', this)">
                        <div class="cb-card-icon">${cbIconImg(meta.icon)}</div>
                        <div class="cb-card-title">${escapeHtml(pathData.name)}</div>
                        <div class="cb-card-desc">${escapeHtml(pathData.description)}</div>
                        <div class="cb-card-badges">
                            <span class="cb-badge cb-badge-house" style="background:${meta.color}20; color:${meta.color}">${escapeHtml(capitalize(key))}</span>
                            <span class="cb-badge cb-badge-count">${modCount} modules</span>
                        </div>
                    </div>
                `;
            });
            html += houseCards ? '<div class="cb-grid">' + houseCards + '</div>' : '';

            body.innerHTML = html || '<div class="cb-empty">No courses available.</div>';
        }

        function renderBrowserItems(filters = {}) {
            const body = document.getElementById('cbBody');
            if (!body) return;

            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            const houseKeys = Object.keys(HOUSE_META);

            // If type filter is "course", show courses as path-level cards
            if (filters.type === 'course') {
                const courseKeys = Object.keys(paths).filter(k => !houseKeys.includes(k));
                let filtered = courseKeys.map(key => ({
                    key,
                    data: paths[key],
                    house: PATH_HOUSE_MAP[key] || key
                }));

                if (filters.house) {
                    filtered = filtered.filter(c => c.house === filters.house);
                }
                if (filters.search) {
                    const q = filters.search.toLowerCase();
                    filtered = filtered.filter(c =>
                        c.data.name.toLowerCase().includes(q) ||
                        c.key.toLowerCase().includes(q) ||
                        (c.data.description || '').toLowerCase().includes(q)
                    );
                }

                let cards = '';
                filtered.forEach(({ key, data, house }) => {
                    const selected = cbSelection.has('path:' + key);
                    const icon = data.icon || '\uD83D\uDCDA';
                    const color = data.color || '#888';
                    const modCount = data.modules ? data.modules.length : 0;

                    cards += `
                        <div class="cb-card${selected ? ' selected' : ''}" onclick="toggleBrowserSelection('path:${key}', 'path', this)">
                            <div class="cb-card-icon">${cbIconImg(icon)}</div>
                            <div class="cb-card-title">${escapeHtml(data.name)}</div>
                            <div class="cb-card-desc">${escapeHtml(data.description)}</div>
                            <div class="cb-card-badges">
                                <span class="cb-badge cb-badge-house" style="background:${color}20; color:${color}">${escapeHtml(capitalize(house))}</span>
                                <span class="cb-badge cb-badge-count">${modCount} modules</span>
                                <span class="cb-badge cb-badge-type">course</span>
                            </div>
                        </div>
                    `;
                });

                body.innerHTML = cards ? '<div class="cb-grid">' + cards + '</div>'
                    : '<div class="cb-empty">No courses match your filters.</div>';
                return;
            }

            // Standard individual items view
            let allItems = [];

            // Gather all individual modules from all paths
            Object.entries(paths).forEach(([pathKey, pathData]) => {
                if (!pathData.modules) return;
                const house = HOUSE_META[pathKey] ? pathKey : (PATH_HOUSE_MAP[pathKey] || pathKey);

                pathData.modules.forEach(mod => {
                    allItems.push({
                        ...mod,
                        house,
                        pathKey,
                        pathName: pathData.name || pathKey
                    });
                });
            });

            // Apply filters
            if (filters.house) {
                allItems = allItems.filter(m => m.house === filters.house);
            }
            if (filters.type) {
                allItems = allItems.filter(m => m.type === filters.type);
            }
            if (filters.difficulty) {
                allItems = allItems.filter(m => m.difficulty === filters.difficulty);
            }
            if (filters.search) {
                const q = filters.search.toLowerCase();
                allItems = allItems.filter(m =>
                    m.title.toLowerCase().includes(q) ||
                    (m.id && m.id.toLowerCase().includes(q)) ||
                    (m.pathName && m.pathName.toLowerCase().includes(q)) ||
                    (m.pathKey && m.pathKey.toLowerCase().includes(q))
                );
            }

            let cards = '';
            allItems.forEach(mod => {
                const selKey = 'item:' + mod.id;
                const selected = cbSelection.has(selKey);
                const houseMeta = HOUSE_META[mod.house];
                const color = houseMeta ? houseMeta.color : '#888';
                const houseLabel = houseMeta ? capitalize(mod.house) : mod.pathKey;

                cards += `
                    <div class="cb-card${selected ? ' selected' : ''}" onclick="toggleBrowserSelection('item:${mod.id}', 'item', this)">
                        <div class="cb-card-title">${escapeHtml(mod.title)}</div>
                        <div class="cb-card-badges">
                            <span class="cb-badge cb-badge-house" style="background:${color}20; color:${color}">${escapeHtml(houseLabel)}</span>
                            <span class="cb-badge cb-badge-type">${escapeHtml(mod.type || 'module')}</span>
                            <span class="cb-badge cb-badge-diff">${escapeHtml(mod.difficulty || '')}</span>
                            <span class="cb-badge cb-badge-count">${escapeHtml(mod.duration || '')}</span>
                        </div>
                    </div>
                `;
            });

            body.innerHTML = cards ? '<div class="cb-grid">' + cards + '</div>'
                : '<div class="cb-empty">No items match your filters.</div>';
        }

        function applyBrowserFilters() {
            const house = document.getElementById('cbFilterHouse')?.value || '';
            const type = document.getElementById('cbFilterType')?.value || '';
            const difficulty = document.getElementById('cbFilterDiff')?.value || '';
            const search = document.getElementById('cbSearch')?.value || '';

            renderBrowserItems({ house, type, difficulty, search });
        }

        function toggleBrowserSelection(key, type, cardEl) {
            if (cbSelection.has(key)) {
                cbSelection.delete(key);
                if (cardEl) cardEl.classList.remove('selected');
            } else {
                // Store the relevant data
                if (type === 'path') {
                    const pathKey = key.replace('path:', '');
                    const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
                    const pathData = paths[pathKey];
                    if (pathData) {
                        cbSelection.set(key, {
                            type: 'path',
                            assignmentType: 'path',
                            contentId: pathKey,
                            title: pathData.name,
                            description: pathData.description || '',
                            house: HOUSE_META[pathKey] ? pathKey : '',
                            moduleCount: pathData.modules ? pathData.modules.length : 0
                        });
                    }
                } else {
                    const modId = key.replace('item:', '');
                    // Find the module in LearningPaths
                    const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
                    for (const [pathKey, pathData] of Object.entries(paths)) {
                        const mod = pathData.modules?.find(m => m.id === modId);
                        if (mod) {
                            const house = HOUSE_META[pathKey] ? pathKey : (PATH_HOUSE_MAP[pathKey] || pathKey);
                            cbSelection.set(key, {
                                type: 'item',
                                assignmentType: 'item',
                                contentId: mod.id,
                                title: mod.title,
                                description: '',
                                house,
                                contentType: mod.type || 'module',
                                difficulty: mod.difficulty || null,
                                moduleCount: 1
                            });
                            break;
                        }
                    }
                }
                if (cardEl) cardEl.classList.add('selected');
            }

            updateSelectionCount();
        }

        function updateSelectionCount() {
            const count = cbSelection.size;
            const countEl = document.getElementById('cbSelCount');
            const btn = document.getElementById('cbAssignBtn');
            if (countEl) countEl.textContent = count + ' item' + (count !== 1 ? 's' : '') + ' selected';
            if (btn) btn.disabled = count === 0;
        }

        async function submitAssignments() {
            if (cbSelection.size === 0 || !selectedClassId) return;

            const btn = document.getElementById('cbAssignBtn');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="hd-spinner"></span>';
            }

            const dueDate = document.getElementById('cbDueDate')?.value || null;
            const notes = document.getElementById('cbNotes')?.value || '';

            try {
                await AssignmentManager.init();

                const promises = [];
                for (const [, data] of cbSelection) {
                    promises.push(AssignmentManager.createAssignment(selectedClassId, {
                        assignmentType: data.assignmentType,
                        contentId: data.contentId,
                        title: data.title,
                        description: data.description || '',
                        house: data.house || '',
                        contentType: data.contentType || null,
                        difficulty: data.difficulty || null,
                        moduleCount: data.moduleCount || 1,
                        dueDate,
                        notes
                    }));
                }

                await Promise.all(promises);

                closeContentBrowser();
                await loadAssignments(selectedClassId);
                showToast(cbSelection.size + ' assignment' + (cbSelection.size !== 1 ? 's' : '') + ' created');
                cbSelection.clear();

            } catch (error) {
                console.error('Failed to create assignments:', error);
                showToast('Failed to create assignments');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Assign';
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // STUDENT ROSTER (HD-2)
        // ═══════════════════════════════════════════════════════════════

        const HOUSE_COLORS = {
            web: '#60a5fa', shield: '#f87171', cloud: '#38bdf8', forge: '#fbbf24',
            script: '#a78bfa', code: '#4ade80', key: '#f472b6', eye: '#c084fc',
            'dark-arts': '#9b59d0', divergent: '#ff00ff',
            arctic: '#3ab8e0'
        };

        async function loadRoster(classId) {
            const container = document.getElementById('rosterContent');
            if (!container) return;

            try {
                const members = await ClassManager.getClassMembers(classId);
                rosterMembers = members;

                // Update enrolled stat with actual member count
                const cls = handlerClasses.find(c => c.id === classId);
                const count = members.length;
                document.getElementById('statEnrolled').textContent = count;

                if (count === 0) {
                    container.innerHTML = `
                        <div class="hd-roster-empty">
                            <div class="hd-roster-empty-icon">--</div>
                            <div class="hd-roster-empty-text">
                                No students yet.<br>
                                Share the class code to invite students.
                            </div>
                        </div>
                    `;
                    renderCommsPanel();
                    loadSentMessages(classId);
                    return;
                }

                rosterPage = 0;
                _renderRosterPage(container, classId);

                // Render comms panel now that roster is loaded
                renderCommsPanel();
                loadSentMessages(classId);

                // AI Lab analytics load lazily when AI Lab tab is opened
                if (_activeTab === 'ailab') { loadAiLabData(); _ailabRendered = true; }
            } catch (error) {
                console.error('Failed to load roster:', error);
                container.innerHTML = `
                    <div class="hd-roster-empty">
                        <div class="hd-roster-empty-text" style="color:var(--hd-danger)">
                            Failed to load roster.
                        </div>
                    </div>
                `;
            }
        }

        function _renderRosterPage(container, classId) {
            const count = rosterMembers.length;
            const totalPages = Math.ceil(count / ROSTER_PAGE_SIZE);
            const start = rosterPage * ROSTER_PAGE_SIZE;
            const end = Math.min(start + ROSTER_PAGE_SIZE, count);
            const pageMembers = rosterMembers.slice(start, end);

            let html = '<div class="hd-roster-count">' + count + ' student' + (count !== 1 ? 's' : '') + ' enrolled</div>';
            html += pageMembers.map(function(m) { return renderRosterCard(m, classId); }).join('');

            if (totalPages > 1) {
                html += '<div class="hd-roster-pagination">';
                html += '<button class="hd-btn hd-btn-sm" ' + (rosterPage === 0 ? 'disabled' : '') + ' onclick="_rosterPageNav(-1)">Prev</button>';
                html += '<span class="hd-roster-page-info">Page ' + (rosterPage + 1) + ' of ' + totalPages + '</span>';
                html += '<button class="hd-btn hd-btn-sm" ' + (rosterPage >= totalPages - 1 ? 'disabled' : '') + ' onclick="_rosterPageNav(1)">Next</button>';
                html += '</div>';
            }

            container.innerHTML = html;
        }

        function _rosterPageNav(delta) {
            const container = document.getElementById('rosterContent');
            if (!container || !selectedClassId) return;
            const totalPages = Math.ceil(rosterMembers.length / ROSTER_PAGE_SIZE);
            rosterPage = Math.max(0, Math.min(rosterPage + delta, totalPages - 1));
            _renderRosterPage(container, selectedClassId);
        }

        // ═══════════════════════════════════════════════════════════════
        // HANDLER COMMS (F-27)
        // ═══════════════════════════════════════════════════════════════

        let sentMessages = [];

        function renderCommsPanel() {
            const panel = document.getElementById('commsPanel');
            if (!panel) return;

            const recipientOptions = rosterMembers.map(m => {
                const name = m.displayName || m.email?.split('@')[0] || 'Student';
                return `<option value="${m.uid}">${escapeHtml(name)}</option>`;
            }).join('');

            panel.innerHTML = `
                <div class="hd-comms-compose">
                    <div class="hd-comms-row">
                        <label class="hd-comms-label">To:</label>
                        <select id="commsRecipient" class="hd-comms-select">
                            <option value="">Entire Class</option>
                            ${recipientOptions}
                        </select>
                    </div>
                    <div class="hd-comms-row">
                        <textarea id="commsText" class="hd-comms-textarea" placeholder="Type your message..." maxlength="500" rows="3"></textarea>
                    </div>
                    <div class="hd-comms-row hd-comms-footer">
                        <span class="hd-comms-charcount" id="commsCharCount">0 / 500</span>
                        <button class="hd-btn hd-btn-primary hd-comms-send-btn" id="commsSendBtn" onclick="sendCommsMessage()">Send Transmission</button>
                    </div>
                </div>
                <div id="commsSentList">
                    <div class="hd-comms-sent-empty">No messages sent yet.</div>
                </div>
            `;

            const textarea = panel.querySelector('#commsText');
            const counter = panel.querySelector('#commsCharCount');
            if (textarea && counter) {
                textarea.addEventListener('input', () => {
                    counter.textContent = `${textarea.value.length} / 500`;
                    counter.style.color = textarea.value.length > 450 ? '#f59e0b' : '';
                });
            }
        }

        async function sendCommsMessage() {
            const textEl = document.getElementById('commsText');
            const recipientEl = document.getElementById('commsRecipient');
            const sendBtn = document.getElementById('commsSendBtn');
            if (!textEl || !recipientEl) return;

            const text = textEl.value.trim();
            if (!text) { showToast('Message cannot be empty'); return; }
            if (text.length > 500) { showToast('Message must be 500 characters or less'); return; }
            if (!selectedClassId) { showToast('No class selected'); return; }

            if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Sending...'; }

            try {
                const data = { classId: selectedClassId, text };
                const recipientUid = recipientEl.value;
                if (recipientUid) data.recipientUid = recipientUid;

                await FirebaseAuth.callFunction('sendHandlerMessage', data);

                textEl.value = '';
                const counter = document.getElementById('commsCharCount');
                if (counter) counter.textContent = '0 / 500';

                showToast('Transmission sent');
                await loadSentMessages(selectedClassId);
            } catch (error) {
                console.error('[HandlerDashboard] Failed to send message:', error);
                showToast('Failed to send: ' + (error.message || 'Unknown error'));
            } finally {
                if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send Transmission'; }
            }
        }

        async function loadSentMessages(classId) {
            const listEl = document.getElementById('commsSentList');
            if (!listEl) return;

            try {
                if (!window.firebaseFirestore) return;

                const { collection, query, where, orderBy, limit: limitFn, getDocs, getFirestore } = window.firebaseFirestore;
                const { getApps } = window.firebaseApp;
                if (getApps().length === 0) return;
                const db = getFirestore(getApps()[0]);

                const user = FirebaseAuth.getUser();
                if (!user) return;

                const msgsRef = collection(db, 'handler_messages');
                const q = query(
                    msgsRef,
                    where('senderUid', '==', user.uid),
                    where('classId', '==', classId),
                    orderBy('createdAt', 'desc'),
                    limitFn(10)
                );
                const snapshot = await getDocs(q);

                sentMessages = [];
                snapshot.forEach(d => {
                    sentMessages.push({ id: d.id, ...d.data() });
                });

                renderSentMessages();
            } catch (e) {
                console.warn('[HandlerDashboard] Failed to load sent messages:', e);
                listEl.innerHTML = '<div class="hd-comms-sent-empty">Failed to load sent messages.</div>';
            }
        }

        function renderSentMessages() {
            const listEl = document.getElementById('commsSentList');
            if (!listEl) return;

            if (sentMessages.length === 0) {
                listEl.innerHTML = '<div class="hd-comms-sent-empty">No messages sent yet.</div>';
                return;
            }

            listEl.innerHTML = `
                <div class="hd-comms-sent-title">Recent Transmissions</div>
                ${sentMessages.map(msg => {
                    const time = msg.createdAt?.toDate
                        ? formatDateShort(msg.createdAt.toDate().toISOString())
                        : '\u2014';
                    const recipient = msg.recipientType === 'class'
                        ? 'Entire Class'
                        : (rosterMembers.find(m => m.uid === msg.recipientUid)?.displayName || 'Student');
                    const readCount = (msg.readBy || []).length;
                    const totalRecipients = msg.recipientType === 'class'
                        ? rosterMembers.length
                        : 1;
                    return `
                        <div class="hd-comms-sent-item" data-msg-id="${msg.id}">
                            <div class="hd-comms-sent-meta">
                                <span class="hd-comms-sent-to">To: ${escapeHtml(recipient)}</span>
                                <span class="hd-comms-sent-time">${time}</span>
                            </div>
                            <div class="hd-comms-sent-text">${escapeHtml(msg.text)}</div>
                            <div class="hd-comms-sent-footer">
                                <span class="hd-comms-sent-read">Read by ${readCount} / ${totalRecipients}</span>
                                <button class="hd-comms-delete-btn" onclick="deleteCommsMessage('${msg.id}')" title="Delete message">&times;</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }

        async function deleteCommsMessage(msgId) {
            if (!confirm('Delete this message? Students will no longer see it.')) return;
            try {
                const { doc, deleteDoc, getFirestore } = window.firebaseFirestore;
                const { getApps } = window.firebaseApp;
                const db = getFirestore(getApps()[0]);
                await deleteDoc(doc(db, 'handler_messages', msgId));

                sentMessages = sentMessages.filter(m => m.id !== msgId);
                renderSentMessages();
                showToast('Message deleted');
            } catch (e) {
                console.error('[HandlerDashboard] Failed to delete message:', e);
                showToast('Failed to delete: ' + (e.message || 'Unknown error'));
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ASSIGNMENT → COMPLETION RESOLUTION
        // Handles the mismatch between assignment contentIds (path-level
        // like 'aplus-core2') and student completion keys (module-level
        // like 'forge-core2-ch14-index') by expanding paths to their
        // constituent modules and fuzzy-matching IDs.
        // ═══════════════════════════════════════════════════════════════

        /**
         * Check if two hyphenated IDs share at least 2 consecutive segments.
         * e.g. 'aplus-core2-ch14' and 'forge-core2-ch14-index' share 'core2-ch14'
         */
        function shareCommonCore(id1, id2) {
            const p1 = id1.split('-');
            const p2 = id2.split('-');
            for (let i = 0; i < p1.length - 1; i++) {
                for (let j = 0; j < p2.length - 1; j++) {
                    if (p1[i] === p2[j] && p1[i+1] === p2[j+1]) return true;
                }
            }
            return false;
        }

        /**
         * Check if a specific module (by its LearningPaths ID) is completed
         * in a student's completions map, handling ID format mismatches.
         */
        function isModuleCompleted(moduleId, completions, keys, exactOnly) {
            // Exact match
            if (completions[moduleId]?.completed) return true;
            if (exactOnly) return false;
            // Fuzzy: find a key that shares 2+ consecutive hyphenated segments
            // (legacy fallback for old A+ Core 2 ID format mismatches)
            return keys.some(k => completions[k]?.completed && shareCommonCore(moduleId, k));
        }

        /**
         * Find the completion entry for a module, returning the matched data object or null
         */
        function findModuleCompletion(moduleId, completions, keys, exactOnly) {
            if (completions[moduleId]?.completed) return completions[moduleId];
            if (exactOnly) return null;
            for (const k of keys) {
                if (completions[k]?.completed && shareCommonCore(moduleId, k)) return completions[k];
            }
            return null;
        }

        /**
         * Resolve an assignment into its effective module count and completion count.
         * For path assignments, expands via LearningPaths.PATHS[contentId].modules.
         * For item assignments, checks direct or fuzzy match.
         */
        function resolveAssignmentProgress(assignment, completions) {
            const keys = Object.keys(completions || {});

            if (assignment.assignmentType === 'path') {
                const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
                const pathDef = paths[assignment.contentId];

                if (pathDef && pathDef.modules && pathDef.modules.length > 0) {
                    let done = 0;
                    const total = pathDef.modules.length;
                    for (const mod of pathDef.modules) {
                        if (isModuleCompleted(mod.id, completions, keys, true)) done++;
                    }
                    return { completed: done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
                }

                // Fallback for paths not in LearningPaths: count keys prefixed with contentId
                const related = keys.filter(k => k.startsWith(assignment.contentId + '-') && completions[k]?.completed);
                return { completed: related.length, total: Math.max(related.length, 1), pct: related.length > 0 ? 100 : 0 };
            }

            // Item assignment — exact or fuzzy
            if (completions[assignment.contentId]?.completed) {
                return { completed: 1, total: 1, pct: 100 };
            }
            const match = keys.find(k => completions[k]?.completed && shareCommonCore(assignment.contentId, k));
            if (match) return { completed: 1, total: 1, pct: 100 };

            return { completed: 0, total: 1, pct: 0 };
        }

        function getStudentCompletion(studentUid) {
            if (classAssignments.length === 0) return { completed: 0, total: 0, pct: 0 };

            const studentProgress = classProgressData.find(p => p.id === studentUid);
            const completions = studentProgress?.completions || {};
            let totalCompleted = 0;
            let totalModules = 0;

            for (const a of classAssignments) {
                const result = resolveAssignmentProgress(a, completions);
                totalCompleted += result.completed;
                totalModules += result.total;
            }

            const pct = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;
            return { completed: totalCompleted, total: totalModules, pct };
        }

        function getStudentDetailedProgress(studentUid) {
            const studentProgress = classProgressData.find(p => p.id === studentUid);
            const completions = studentProgress?.completions || {};
            const keys = Object.keys(completions);
            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};

            let totalCompleted = 0;
            let totalModules = 0;
            let totalScore = 0;
            let scoredCount = 0;
            let totalDuration = 0;
            let lastActiveDate = null;

            const enrichedAssignments = classAssignments.map(a => {
                const isPath = a.assignmentType === 'path';
                const pathDef = isPath ? paths[a.contentId] : null;
                const isOverdue = a.dueDate && new Date(a.dueDate.toDate ? a.dueDate.toDate() : a.dueDate) < new Date();

                if (isPath && pathDef?.modules?.length > 0) {
                    const modules = pathDef.modules.map(mod => {
                        const comp = findModuleCompletion(mod.id, completions, keys, true);
                        const isDone = !!comp;
                        if (isDone) {
                            totalCompleted++;
                            if (comp.score != null) { totalScore += comp.score; scoredCount++; }
                            if (comp.duration > 0) totalDuration += comp.duration;
                            const cDate = comp.completedAt
                                ? (comp.completedAt.toDate ? comp.completedAt.toDate() : new Date(comp.completedAt))
                                : null;
                            if (cDate && (!lastActiveDate || cDate > lastActiveDate)) lastActiveDate = cDate;
                        }
                        totalModules++;
                        return {
                            id: mod.id,
                            title: mod.title || getContentTitle(mod.id),
                            type: mod.type || 'module',
                            completed: isDone,
                            score: isDone ? comp.score : null,
                            duration: isDone ? comp.duration : null,
                            completedAt: isDone ? comp.completedAt : null
                        };
                    });
                    const done = modules.filter(m => m.completed).length;
                    return { ...a, isPath: true, modules, pathCompleted: done, pathTotal: modules.length, isOverdue };
                } else {
                    // Item assignment or path without definition
                    const comp = findModuleCompletion(a.contentId, completions, keys);
                    const isDone = !!comp;
                    if (isDone) {
                        totalCompleted++;
                        if (comp.score != null) { totalScore += comp.score; scoredCount++; }
                        if (comp.duration > 0) totalDuration += comp.duration;
                        const cDate = comp.completedAt
                            ? (comp.completedAt.toDate ? comp.completedAt.toDate() : new Date(comp.completedAt))
                            : null;
                        if (cDate && (!lastActiveDate || cDate > lastActiveDate)) lastActiveDate = cDate;
                    }
                    totalModules++;
                    return {
                        ...a, isPath: false, completed: isDone,
                        score: isDone ? comp?.score : null,
                        duration: isDone ? comp?.duration : null,
                        completedAt: isDone ? comp?.completedAt : null,
                        isOverdue
                    };
                }
            });

            const pct = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;
            const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;

            return {
                assignments: enrichedAssignments,
                totalCompleted,
                totalModules,
                pct,
                avgScore,
                totalDuration,
                lastActiveDate
            };
        }

        function progressColorClass(pct) {
            if (pct > 70) return 'green';
            if (pct >= 40) return 'yellow';
            return 'red';
        }

        function renderRosterCard(member, classId) {
            const houseColor = HOUSE_COLORS[member.house] || '#888';
            const houseName = member.house ? capitalize(member.house) : 'Unsorted';
            const joinDate = member.joinedAt?.toDate
                ? member.joinedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';

            // Use firstName/lastName if available, fall back to displayName
            const fullName = (member.firstName && member.lastName)
                ? `${member.lastName}, ${member.firstName}`
                : member.displayName || 'Unknown';
            const initials = member.firstName
                ? (member.firstName[0] + (member.lastName?.[0] || '')).toUpperCase()
                : getInitials(member.displayName || 'U');

            const studentIdBadge = member.studentId
                ? `<span class="hd-roster-joined">${escapeHtml(member.studentId)}</span>`
                : '';

            const avatarHtml = member.photoURL
                ? `<img src="${escapeHtml(member.photoURL)}" alt="${escapeHtml(fullName)} avatar">`
                : initials;

            const avatarBg = member.photoURL
                ? ''
                : `background: ${houseColor}22; color: ${houseColor};`;

            // Progress bar
            const { completed, total, pct } = getStudentCompletion(member.uid);
            const colorClass = total > 0 ? progressColorClass(pct) : 'none';
            const progressBar = total > 0
                ? `<div class="hd-roster-progress">
                       <div class="hd-roster-progress-bar">
                           <div class="hd-roster-progress-fill ${colorClass}" style="width:${pct}%"></div>
                       </div>
                       <span class="hd-roster-progress-label ${colorClass}">${pct}%</span>
                   </div>`
                : `<div class="hd-roster-progress">
                       <div class="hd-roster-progress-bar"><div class="hd-roster-progress-fill" style="width:0%"></div></div>
                       <span class="hd-roster-progress-label none">--</span>
                   </div>`;

            // Recently active badge (activity in last 24h)
            const recentlyActive = hasRecentActivity(member.uid);
            const activeBadge = recentlyActive ? '<span class="hd-roster-active-badge">Active</span>' : '';
            const anonBadge = member.isAnonymous ? '<span class="hd-roster-anon-badge">Anonymous</span>' : '';

            return `
                <div class="hd-roster-card hd-roster-clickable" tabindex="0" onclick="drillDownStudent('${member.uid}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();drillDownStudent('${member.uid}')}">
                    <div class="hd-roster-avatar" style="${avatarBg}">${avatarHtml}</div>
                    <div class="hd-roster-info">
                        <div class="hd-roster-name">${escapeHtml(fullName)}${activeBadge}${anonBadge}</div>
                        <div class="hd-roster-meta">
                            <span class="hd-roster-house" style="color:${houseColor}">${houseName}</span>
                            ${studentIdBadge}
                            ${joinDate ? `<span class="hd-roster-joined">Joined ${joinDate}</span>` : ''}
                        </div>
                        ${progressBar}
                    </div>
                    <div class="hd-roster-actions">
                        <button onclick="event.stopPropagation(); removeStudent('${classId}', '${member.uid}', '${escapeHtml(member.firstName || member.displayName || 'this student')}')" title="Remove student">&times;</button>
                    </div>
                </div>
            `;
        }

        function hasRecentActivity(studentUid) {
            const now = Date.now();
            const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

            const studentProgress = classProgressData.find(p => p.id === studentUid);
            if (!studentProgress || !studentProgress.completions) return false;

            for (const [contentId, data] of Object.entries(studentProgress.completions)) {
                if (data.completedAt) {
                    const completedTime = data.completedAt.toDate
                        ? data.completedAt.toDate().getTime()
                        : new Date(data.completedAt).getTime();
                    if (completedTime > twentyFourHoursAgo) {
                        return true;
                    }
                }
            }
            return false;
        }

        function getInitials(name) {
            return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
        }

        async function removeStudent(classId, studentUid, studentName) {
            if (!confirm(`Remove ${studentName} from this class?\n\nThey can rejoin with the class code.`)) return;

            try {
                await ClassManager.removeStudentFromClass(classId, studentUid);
                showToast(`${studentName} removed from class`);
                loadRoster(classId);
            } catch (error) {
                console.error('Failed to remove student:', error);
                showToast('Failed to remove student');
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // STUDENT DETAIL MODAL
        // ═══════════════════════════════════════════════════════════════

        function showStudentDetail(studentUid) {
            const member = rosterMembers.find(m => m.uid === studentUid);
            if (!member) return;

            const houseColor = HOUSE_COLORS[member.house] || '#888';
            const fullName = (member.firstName && member.lastName)
                ? `${member.lastName}, ${member.firstName}`
                : member.displayName || 'Unknown';
            const initials = member.firstName
                ? (member.firstName[0] + (member.lastName?.[0] || '')).toUpperCase()
                : getInitials(member.displayName || 'U');

            const avatarHtml = member.photoURL
                ? `<img src="${escapeHtml(member.photoURL)}" alt="${escapeHtml(fullName)} avatar">`
                : initials;
            const avatarStyle = member.photoURL
                ? ''
                : `background: ${houseColor}22; color: ${houseColor};`;

            const houseName = member.house ? capitalize(member.house) : 'Unsorted';
            const detail = getStudentDetailedProgress(studentUid);
            const colorClass = detail.totalModules > 0 ? progressColorClass(detail.pct) : 'none';
            const scoreColorClass = detail.avgScore != null
                ? (detail.avgScore >= 80 ? 'green' : detail.avgScore >= 60 ? 'yellow' : 'red')
                : 'none';
            const lastActiveText = detail.lastActiveDate ? formatTimeAgo(detail.lastActiveDate) : '--';

            // Build assignment rows with smart resolution
            let assignmentRows = '';
            if (classAssignments.length === 0) {
                assignmentRows = '<div class="hd-student-no-assignments">No assignments for this class yet.</div>';
            } else {
                assignmentRows = detail.assignments.map((a, idx) => {
                    if (a.isPath) {
                        const pathPct = a.pathTotal > 0 ? Math.round((a.pathCompleted / a.pathTotal) * 100) : 0;
                        const pathColor = progressColorClass(pathPct);
                        const overdueTag = (a.isOverdue && pathPct < 100)
                            ? ' <span class="hd-student-assignment-overdue">OVERDUE</span>' : '';

                        let moduleListHtml = a.modules.map(mod => {
                            const modDone = mod.completed;
                            const modIcon = modDone ? '&#10003;' : '&ndash;';
                            const modClass = modDone ? 'done' : 'pending';
                            const modScore = modDone && mod.score != null ? mod.score + '%' : '';
                            const modDur = modDone && mod.duration > 0 ? formatDuration(mod.duration) : '';
                            const modDate = modDone && mod.completedAt
                                ? new Date(mod.completedAt.toDate ? mod.completedAt.toDate() : mod.completedAt)
                                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : '';
                            return `
                                <div class="hd-student-module-row" role="listitem">
                                    <div class="hd-student-module-status ${modClass}">${modIcon}</div>
                                    <div class="hd-student-module-name">${escapeHtml(mod.title)}</div>
                                    <div class="hd-student-module-type">${escapeHtml(mod.type)}</div>
                                    <div class="hd-student-module-score">${modScore}</div>
                                    <div class="hd-student-module-duration">${modDur}</div>
                                    <div class="hd-student-module-date">${modDate}</div>
                                </div>`;
                        }).join('');

                        return `
                            <div class="hd-student-assignment-row path-row" role="button" tabindex="0" onclick="toggleModuleList(${idx})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleModuleList(${idx})}">
                                <div class="hd-student-chevron" id="chevron-${idx}"><img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                                <div class="hd-student-assignment-name">${escapeHtml(a.title)}${overdueTag}</div>
                                <div class="hd-student-path-progress">
                                    <div class="hd-student-path-progress-bar">
                                        <div class="hd-student-path-progress-fill ${pathColor}" style="width:${pathPct}%"></div>
                                    </div>
                                    <span class="hd-student-path-progress-label">${a.pathCompleted}/${a.pathTotal}</span>
                                </div>
                            </div>
                            <div class="hd-student-module-list" role="list" id="moduleList-${idx}">
                                ${moduleListHtml}
                            </div>`;
                    } else {
                        const isDone = a.completed;
                        const statusIcon = isDone ? '&#10003;' : '&ndash;';
                        const statusClass = isDone ? 'done' : 'pending';
                        const scoreText = isDone && a.score != null ? a.score + '%' : '';
                        const durText = isDone && a.duration > 0 ? formatDuration(a.duration) : '';
                        const dateText = isDone && a.completedAt
                            ? new Date(a.completedAt.toDate ? a.completedAt.toDate() : a.completedAt)
                                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '';
                        const overdueTag = (a.isOverdue && !isDone)
                            ? ' <span class="hd-student-assignment-overdue">OVERDUE</span>' : '';

                        return `
                            <div class="hd-student-assignment-row">
                                <div class="hd-student-assignment-status ${statusClass}">${statusIcon}</div>
                                <div class="hd-student-assignment-name">${escapeHtml(a.title)}${overdueTag}</div>
                                <div class="hd-student-assignment-score">${scoreText}</div>
                                <div class="hd-student-assignment-duration">${durText}</div>
                                <div class="hd-student-assignment-date">${dateText}</div>
                            </div>`;
                    }
                }).join('');
            }

            const overlay = document.createElement('div');
            overlay.className = 'hd-overlay';
            overlay.id = 'studentDetailModal';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'studentDetailTitle');
            overlay.innerHTML = `
                <div class="hd-modal hd-student-detail">
                    <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:8px">
                        <button class="hd-settings-btn" style="width:auto;padding:6px 14px;font-size:0.75rem" onclick="exportStudentReport('${studentUid}')">Export Report</button>
                        <button class="hd-modal-close" onclick="closeModal('studentDetailModal')">&times;</button>
                    </div>
                    <div class="hd-student-header">
                        <div class="hd-student-header-avatar" style="${avatarStyle}">${avatarHtml}</div>
                        <div class="hd-student-header-info">
                            <h2 id="studentDetailTitle">${escapeHtml(fullName)}${member.isAnonymous ? ' <span class="hd-roster-anon-badge" style="font-size:0.7rem;">Anonymous</span>' : ''}</h2>
                            <span style="color:${houseColor}">${houseName}</span>
                            ${member.studentId ? ' &middot; <span>' + escapeHtml(member.studentId) + '</span>' : ''}
                        </div>
                    </div>
                    <div class="hd-student-summary">
                        <div class="hd-student-stat">
                            <div class="hd-student-stat-value ${colorClass}">${detail.totalModules > 0 ? detail.pct + '%' : '--'}</div>
                            <div class="hd-student-stat-label">Completion</div>
                        </div>
                        <div class="hd-student-stat">
                            <div class="hd-student-stat-value">${detail.totalCompleted}/${detail.totalModules}</div>
                            <div class="hd-student-stat-label">Modules Done</div>
                        </div>
                        <div class="hd-student-stat">
                            <div class="hd-student-stat-value ${scoreColorClass}">${detail.avgScore != null ? detail.avgScore + '%' : '--'}</div>
                            <div class="hd-student-stat-label">Avg Score</div>
                        </div>
                        <div class="hd-student-stat">
                            <div class="hd-student-stat-value">${lastActiveText}</div>
                            <div class="hd-student-stat-label">Last Active</div>
                        </div>
                        <div class="hd-student-stat">
                            <div class="hd-student-stat-value">${detail.totalDuration > 0 ? formatDuration(detail.totalDuration) : '--'}</div>
                            <div class="hd-student-stat-label">Total Time</div>
                        </div>
                    </div>
                    <div class="hd-student-assignments-title">Assignment Breakdown</div>
                    ${assignmentRows}
                </div>
            `;

            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal('studentDetailModal');
            });
        }

        function toggleModuleList(index) {
            const list = document.getElementById('moduleList-' + index);
            const chevron = document.getElementById('chevron-' + index);
            if (!list || !chevron) return;
            list.classList.toggle('expanded');
            chevron.classList.toggle('expanded');
        }

        function showAtRiskDetail() {
            const atRiskCount = parseInt(document.getElementById('statAtRisk')?.textContent || '0');
            if (atRiskCount === 0) {
                showToast('No at-risk students');
                return;
            }

            const atRiskStudents = [];
            for (const member of rosterMembers) {
                const { pct } = getStudentCompletion(member.uid);
                if (pct < 40) {
                    const fullName = (member.firstName && member.lastName)
                        ? `${member.lastName}, ${member.firstName}`
                        : member.displayName || 'Unknown';

                    // Find which assignments they're behind on
                    const studentProgress = classProgressData.find(p => p.id === member.uid);
                    const completions = studentProgress?.completions || {};
                    const behindOn = classAssignments
                        .filter(a => {
                            const result = resolveAssignmentProgress(a, completions);
                            return result.pct < 100;
                        })
                        .map(a => a.title)
                        .slice(0, 3);
                    const behindText = behindOn.length > 0 ? behindOn.join(', ') : 'All assignments';

                    atRiskStudents.push({ uid: member.uid, fullName, pct, behindText });
                }
            }

            atRiskStudents.sort((a, b) => a.pct - b.pct);

            const rows = atRiskStudents.map(s => `
                <div class="hd-atrisk-row" role="listitem" tabindex="0" onclick="closeModal('atRiskModal'); setTimeout(() => showStudentDetail('${s.uid}'), 260)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();closeModal('atRiskModal'); setTimeout(() => showStudentDetail('${s.uid}'), 260)}">
                    <div class="hd-atrisk-name">${escapeHtml(s.fullName)}</div>
                    <div class="hd-atrisk-behind" title="${escapeHtml(s.behindText)}">${escapeHtml(s.behindText)}</div>
                    <div class="hd-atrisk-pct">${s.pct}%</div>
                </div>
            `).join('');

            const overlay = document.createElement('div');
            overlay.className = 'hd-overlay';
            overlay.id = 'atRiskModal';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'atRiskModalTitle');
            overlay.innerHTML = `
                <div class="hd-modal hd-atrisk-detail">
                    <button class="hd-modal-close" onclick="closeModal('atRiskModal')">&times;</button>
                    <div class="hd-atrisk-title" id="atRiskModalTitle">At-Risk Students (&lt;40% Completion)</div>
                    <div class="hd-atrisk-list" role="list">
                        ${rows}
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal('atRiskModal');
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // KPI DRILL-DOWN VIEWS (Wave 24b)
        // ═══════════════════════════════════════════════════════════════

        function drillDownEnrolled() {
            if (!rosterMembers.length) {
                showToast('No students enrolled yet');
                return;
            }
            drillDown({
                label: 'Enrollment Details',
                render: function(container) {
                    let html = '<div class="hd-drilldown">';
                    html += '<div class="hd-drilldown-header">';
                    html += '<button class="hd-btn hd-btn-sm" onclick="goBack()">&larr; Back</button>';
                    html += '<h2 class="hd-drilldown-title">Enrollment: ' + rosterMembers.length + ' Student' + (rosterMembers.length !== 1 ? 's' : '') + '</h2>';
                    html += '<button class="hd-btn hd-btn-sm hd-btn-outline" onclick="exportDrillCSV()">Export CSV</button>';
                    html += '</div>';

                    html += '<table class="hd-drill-table"><thead><tr>';
                    html += '<th>Student</th><th>House</th><th>Level</th><th>Joined</th><th>Last Active</th>';
                    html += '</tr></thead><tbody>';

                    rosterMembers.forEach(function(m) {
                        const joined = m.joinedAt
                            ? (m.joinedAt.toDate ? m.joinedAt.toDate().toLocaleDateString() : new Date(m.joinedAt).toLocaleDateString())
                            : '--';
                        const lastActive = m.lastActivity
                            ? (m.lastActivity.toDate ? m.lastActivity.toDate().toLocaleDateString() : new Date(m.lastActivity).toLocaleDateString())
                            : '--';
                        const displayName = m.firstName && m.lastName
                            ? m.lastName + ', ' + m.firstName
                            : m.displayName || m.email || 'Unknown';
                        html += '<tr>';
                        html += '<td><strong>' + escapeHtml(displayName) + '</strong></td>';
                        html += '<td>' + escapeHtml(m.house || '--') + '</td>';
                        html += '<td>' + (m.level || 1) + '</td>';
                        html += '<td>' + joined + '</td>';
                        html += '<td>' + lastActive + '</td>';
                        html += '</tr>';
                    });

                    html += '</tbody></table></div>';
                    container.innerHTML = html;
                }
            });
        }

        function drillDownCompletion() {
            if (!rosterMembers.length) {
                showToast('No students enrolled yet');
                return;
            }
            drillDown({
                label: 'Completion Breakdown',
                render: function(container) {
                    let html = '<div class="hd-drilldown">';
                    html += '<div class="hd-drilldown-header">';
                    html += '<button class="hd-btn hd-btn-sm" onclick="goBack()">&larr; Back</button>';
                    html += '<h2 class="hd-drilldown-title">Completion Distribution</h2>';
                    html += '<button class="hd-btn hd-btn-sm hd-btn-outline" onclick="exportDrillCSV()">Export CSV</button>';
                    html += '</div>';

                    const buckets = [
                        { label: '0-25%', count: 0, color: '#ef5350' },
                        { label: '26-50%', count: 0, color: '#ff9800' },
                        { label: '51-75%', count: 0, color: '#42a5f5' },
                        { label: '76-100%', count: 0, color: '#66bb6a' }
                    ];

                    rosterMembers.forEach(function(m) {
                        const pct = getStudentCompletion(m.uid).pct;
                        if (pct <= 25) buckets[0].count++;
                        else if (pct <= 50) buckets[1].count++;
                        else if (pct <= 75) buckets[2].count++;
                        else buckets[3].count++;
                    });

                    html += '<div class="hd-drill-charts">';
                    html += '<div class="hd-drill-chart-wrap" id="drillCompDonut"></div>';
                    html += '</div>';

                    html += '<div class="hd-drill-subtitle">Per Student</div>';
                    html += '<div class="hd-drill-bars">';

                    const sorted = rosterMembers.slice().sort(function(a, b) {
                        return getStudentCompletion(b.uid).pct - getStudentCompletion(a.uid).pct;
                    });
                    sorted.forEach(function(m) {
                        const pct = getStudentCompletion(m.uid).pct;
                        const color = pct >= 75 ? '#66bb6a' : pct >= 50 ? '#42a5f5' : pct >= 25 ? '#ff9800' : '#ef5350';
                        const displayName = m.firstName && m.lastName
                            ? m.lastName + ', ' + m.firstName
                            : m.displayName || m.email || '?';
                        html += '<div class="hd-drill-bar-row">';
                        html += '<span class="hd-drill-bar-label" title="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</span>';
                        html += '<div class="hd-drill-bar-track"><div class="hd-drill-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
                        html += '<span class="hd-drill-bar-value">' + pct + '%</span>';
                        html += '</div>';
                    });

                    html += '</div></div>';
                    container.innerHTML = html;

                    setTimeout(function() {
                        const donutEl = document.getElementById('drillCompDonut');
                        if (donutEl && typeof HandlerCharts !== 'undefined') {
                            HandlerCharts.donut(donutEl, buckets.map(function(b) {
                                return { label: b.label, value: b.count, color: b.color };
                            }), { size: 160, thickness: 30 });
                        }
                    }, 200);
                }
            });
        }

        function drillDownCompletions() {
            if (!classAssignments.length) {
                showToast('No assignments configured for this class');
                return;
            }
            drillDown({
                label: 'Assignment Completions',
                render: function(container) {
                    let html = '<div class="hd-drilldown">';
                    html += '<div class="hd-drilldown-header">';
                    html += '<button class="hd-btn hd-btn-sm" onclick="goBack()">&larr; Back</button>';
                    html += '<h2 class="hd-drilldown-title">Assignment Completion Status</h2>';
                    html += '<button class="hd-btn hd-btn-sm hd-btn-outline" onclick="exportDrillCSV()">Export CSV</button>';
                    html += '</div>';

                    html += '<table class="hd-drill-table"><thead><tr>';
                    html += '<th>Assignment</th><th>Completed</th><th>Rate</th><th>Avg Score</th>';
                    html += '</tr></thead><tbody>';

                    classAssignments.forEach(function(asgn) {
                        let completed = 0;
                        let totalScore = 0;
                        let scored = 0;

                        rosterMembers.forEach(function(m) {
                            const sp = classProgressData.find(function(p) { return p.id === m.uid; });
                            const completions = sp ? (sp.completions || {}) : {};
                            const result = resolveAssignmentProgress(asgn, completions);
                            if (result.pct === 100) {
                                completed++;
                                // Check if there's a score recorded
                                const entry = completions[asgn.contentId];
                                if (entry && entry.score != null) {
                                    totalScore += entry.score;
                                    scored++;
                                }
                            }
                        });

                        const rate = rosterMembers.length ? Math.round((completed / rosterMembers.length) * 100) : 0;
                        const avgScore = scored ? Math.round(totalScore / scored) : '--';
                        const color = rate >= 75 ? '#66bb6a' : rate >= 50 ? '#42a5f5' : rate >= 25 ? '#ff9800' : '#ef5350';

                        html += '<tr>';
                        html += '<td>' + escapeHtml(asgn.title || asgn.contentId) + '</td>';
                        html += '<td>' + completed + '/' + rosterMembers.length + '</td>';
                        html += '<td><span style="color:' + color + '">' + rate + '%</span></td>';
                        html += '<td>' + (avgScore !== '--' ? avgScore + '%' : '--') + '</td>';
                        html += '</tr>';
                    });

                    html += '</tbody></table></div>';
                    container.innerHTML = html;
                }
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // STUDENT PROFILE DRILL-DOWN (Wave 24c)
        // ═══════════════════════════════════════════════════════════════

        const _profileCache = {};

        function drillDownStudent(uid) {
            const member = rosterMembers.find(function(m) { return m.uid === uid; });
            if (!member) return;

            drillDown({
                label: member.displayName || member.firstName || 'Student Profile',
                render: function(container) {
                    _renderStudentProfile(container, member, 'class');
                    // Kick off async global fetch in background
                    _fetchGlobalProfile(uid).then(function() {
                        // Re-render active tab if still on class (no-op) or global (re-render)
                        const activeTab = container.querySelector('.hd-profile-tab.active');
                        if (activeTab && activeTab.dataset.tab === 'global') {
                            _renderProfileTab(container, member, 'global');
                        }
                    });
                }
            });
        }

        function _renderStudentProfile(container, member, activeTab) {
            const houseColor = HOUSE_COLORS[member.house] || '#888';
            const houseName = member.house ? capitalize(member.house) : 'Unsorted';
            const fullName = (member.firstName && member.lastName)
                ? member.lastName + ', ' + member.firstName
                : member.displayName || 'Unknown';
            const callsignDisplay = member.callsign || fullName;
            const avatarLetter = (callsignDisplay[0] || '?').toUpperCase();

            const joinDate = member.joinedAt
                ? (member.joinedAt.toDate
                    ? member.joinedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
                : '--';
            const lastActive = member.lastActivity
                ? (member.lastActivity.toDate
                    ? member.lastActivity.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : new Date(member.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
                : '--';
            const level = member.level || 1;
            const xp = member.xp || 0;

            let html = '<div class="hd-drilldown">';
            html += '<div class="hd-drilldown-header">';
            html += '<button class="hd-btn hd-btn-sm" onclick="goBack()">&larr; Back</button>';
            html += '<h2 class="hd-drilldown-title">' + escapeHtml(fullName) + '</h2>';
            html += '<button class="hd-btn hd-btn-sm hd-btn-outline" onclick="exportDrillCSV()">Export CSV</button>';
            html += '</div>';

            // Student header
            html += '<div class="hd-student-header">';
            html += '<div class="hd-student-avatar" style="background:' + houseColor + '33;color:' + houseColor + '">' + escapeHtml(avatarLetter) + '</div>';
            html += '<div class="hd-student-info">';
            html += '<div class="hd-student-name">' + escapeHtml(callsignDisplay) + '</div>';
            html += '<div class="hd-student-meta">' + escapeHtml(houseName) + ' | Level ' + level + ' | XP: ' + xp + ' | Joined: ' + joinDate + ' | Last active: ' + lastActive + '</div>';
            html += '</div>';
            html += '</div>';

            // Tabs
            html += '<div class="hd-profile-tabs">';
            html += '<button class="hd-profile-tab' + (activeTab === 'class' ? ' active' : '') + '" data-tab="class" onclick="_switchProfileTab(this,\'' + escapeHtml(member.uid) + '\',\'class\')">Class Profile</button>';
            html += '<button class="hd-profile-tab' + (activeTab === 'global' ? ' active' : '') + '" data-tab="global" onclick="_switchProfileTab(this,\'' + escapeHtml(member.uid) + '\',\'global\')">Global Profile</button>';
            html += '</div>';

            // Tab content placeholder
            html += '<div class="hd-profile-content" id="hd-profile-tab-content-' + escapeHtml(member.uid) + '"></div>';

            html += '</div>';
            container.innerHTML = html;

            // Render initial tab content
            const tabContent = document.getElementById('hd-profile-tab-content-' + member.uid);
            if (tabContent) {
                _renderProfileTab(tabContent, member, activeTab);
            }
        }

        function _switchProfileTab(btn, uid, tab) {
            const member = rosterMembers.find(function(m) { return m.uid === uid; });
            if (!member) return;
            // Update active tab button
            const tabs = btn.closest('.hd-profile-tabs');
            if (tabs) {
                tabs.querySelectorAll('.hd-profile-tab').forEach(function(t) { t.classList.remove('active'); });
            }
            btn.classList.add('active');
            const tabContent = document.getElementById('hd-profile-tab-content-' + uid);
            if (tabContent) {
                _renderProfileTab(tabContent, member, tab);
            }
        }

        function _renderProfileTab(container, member, tab) {
            if (tab === 'class') {
                container.innerHTML = _buildClassProfileHTML(member);
                _renderClassSparklineIfNeeded(member.uid);
            } else {
                container.innerHTML = _buildGlobalProfileHTML(member);
            }
        }

        function _buildClassProfileHTML(member) {
            const detail = getStudentDetailedProgress(member.uid);
            const { totalCompleted: completed, totalModules: total, pct, avgScore, totalDuration, lastActiveDate, assignments } = detail;
            const riskLabel = pct < 40 ? 'At Risk' : pct < 70 ? 'Watch' : 'On Track';
            const riskClass = pct < 40 ? 'hd-risk-high' : pct < 70 ? 'hd-risk-medium' : 'hd-risk-low';
            const colorClass = total > 0 ? progressColorClass(pct) : 'none';
            const riskScore = calculateRiskScore(member);
            const riskScoreColor = riskScore >= 70 ? '#f87171' : riskScore >= 40 ? '#fb923c' : '#4ade80';

            let html = '';

            // A. Summary row (kept from original)
            html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">';
            html += '<div>';
            html += '<div style="font-size:0.75rem;color:var(--hd-text-muted,#888);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Assignment Progress</div>';
            html += '<div style="font-size:1.4rem;font-weight:700;color:var(--hd-text,#e0e0e0)">' + completed + ' / ' + total + '</div>';
            html += '<div class="hd-roster-progress-bar" style="width:200px;height:6px;margin-top:6px;"><div class="hd-roster-progress-fill ' + colorClass + '" style="width:' + pct + '%;height:6px;border-radius:3px;"></div></div>';
            html += '<div style="font-size:0.75rem;color:var(--hd-text-muted,#888);margin-top:4px;">' + pct + '% complete</div>';
            html += '</div>';
            html += '<div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:8px;">';
            html += '<span class="hd-risk-badge ' + riskClass + '">' + riskLabel + '</span>';
            html += '<div style="text-align:right;">';
            html += '<div style="font-size:0.65rem;color:var(--hd-text-muted,#888);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Risk Score</div>';
            html += '<div style="font-size:1.1rem;font-weight:700;color:' + riskScoreColor + '">' + riskScore + '</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';

            // B. Mini-Stat Cards
            var durationStr = '--';
            if (totalDuration > 0) {
                var hrs = Math.floor(totalDuration / 3600);
                var mins = Math.round((totalDuration % 3600) / 60);
                durationStr = hrs > 0 ? hrs + 'h ' + mins + 'm' : mins + 'm';
            }
            var lastActiveStr = '--';
            if (lastActiveDate) {
                var now = new Date();
                var diffMs = now - lastActiveDate;
                var diffDays = Math.floor(diffMs / 86400000);
                if (diffDays === 0) lastActiveStr = 'Today';
                else if (diffDays === 1) lastActiveStr = 'Yesterday';
                else if (diffDays < 7) lastActiveStr = diffDays + 'd ago';
                else lastActiveStr = lastActiveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            var overdueCount = assignments.filter(function(a) {
                if (!a.isOverdue) return false;
                if (a.isPath) return a.pathCompleted < a.pathTotal;
                return !a.completed;
            }).length;

            html += '<div class="hd-mini-stats-row">';
            html += '<div class="hd-mini-stat"><div class="hd-mini-stat-value">' + (avgScore != null ? avgScore + '%' : '--') + '</div><div class="hd-mini-stat-label">Avg Score</div></div>';
            html += '<div class="hd-mini-stat"><div class="hd-mini-stat-value">' + durationStr + '</div><div class="hd-mini-stat-label">Time Invested</div></div>';
            html += '<div class="hd-mini-stat"><div class="hd-mini-stat-value">' + lastActiveStr + '</div><div class="hd-mini-stat-label">Last Active</div></div>';
            html += '<div class="hd-mini-stat"><div class="hd-mini-stat-value" style="color:' + (overdueCount > 0 ? '#f85149' : 'var(--hd-text)') + '">' + overdueCount + '</div><div class="hd-mini-stat-label">Overdue</div></div>';
            html += '</div>';

            // C. Score Sparkline
            var scores = [];
            assignments.forEach(function(a) {
                if (a.isPath && a.modules) {
                    a.modules.forEach(function(m) { if (m.score != null) scores.push(m.score); });
                } else if (a.score != null) {
                    scores.push(a.score);
                }
            });
            if (scores.length > 1) {
                html += '<div class="hd-sparkline-wrap">';
                html += '<div class="hd-sparkline-title">Score Trajectory</div>';
                html += '<div id="hd-class-sparkline-' + escapeHtml(member.uid) + '"></div>';
                html += '</div>';
            }

            // D. Enhanced Assignment Table
            if (classAssignments.length === 0) {
                html += '<div style="color:var(--hd-text-muted,#888);font-size:0.85rem;">No assignments configured for this class.</div>';
                return html;
            }

            html += '<table class="hd-asgn-table">';
            html += '<thead><tr><th>Status</th><th>Assignment</th><th>Progress / Score</th><th>Duration</th><th>Date</th></tr></thead>';
            html += '<tbody>';
            assignments.forEach(function(a, idx) {
                var isDone = a.isPath ? (a.pathCompleted === a.pathTotal) : a.completed;
                var statusDot = '<div class="hd-asgn-dot ' + (isDone ? 'complete' : 'incomplete') + '" style="display:inline-block;vertical-align:middle"></div>';
                var overdueTag = '';
                if (a.isOverdue && !isDone) overdueTag = '<span class="hd-asgn-overdue-tag">OVERDUE</span>';

                var scoreCell = '--';
                if (a.isPath) {
                    scoreCell = a.pathCompleted + '/' + a.pathTotal;
                } else if (a.score != null) {
                    var sc = a.score;
                    var scClass = sc >= 80 ? 'hd-score-green' : sc >= 60 ? 'hd-score-yellow' : 'hd-score-red';
                    scoreCell = '<span class="' + scClass + '">' + sc + '%</span>';
                }

                var durCell = '--';
                if (a.isPath && a.modules) {
                    var pathDur = a.modules.reduce(function(s, m) { return s + (m.duration || 0); }, 0);
                    if (pathDur > 0) {
                        var pH = Math.floor(pathDur / 3600);
                        var pM = Math.round((pathDur % 3600) / 60);
                        durCell = pH > 0 ? pH + 'h ' + pM + 'm' : pM + 'm';
                    }
                } else if (a.duration > 0) {
                    var aH = Math.floor(a.duration / 3600);
                    var aM = Math.round((a.duration % 3600) / 60);
                    durCell = aH > 0 ? aH + 'h ' + aM + 'm' : aM + 'm';
                }

                var dateCell = '--';
                if (a.completedAt) {
                    var d = a.completedAt.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
                    dateCell = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                } else if (a.isPath && a.modules) {
                    var lastMod = a.modules.filter(function(m) { return m.completedAt; }).pop();
                    if (lastMod) {
                        var ld = lastMod.completedAt.toDate ? lastMod.completedAt.toDate() : new Date(lastMod.completedAt);
                        dateCell = ld.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                }

                var expandBtn = '';
                if (a.isPath && a.modules && a.modules.length > 0) {
                    expandBtn = ' <button class="hd-asgn-expand-btn" onclick="this.dataset.open=this.dataset.open===\'1\'?\'0\':\'1\';document.querySelectorAll(\'.hd-sub-' + idx + '\').forEach(function(r){r.style.display=this.dataset.open===\'1\'?\'\':\' none\'}.bind(this));this.textContent=this.dataset.open===\'1\'?\'-\':\'...\'" data-open="0">...</button>';
                }

                html += '<tr>';
                html += '<td>' + statusDot + '</td>';
                html += '<td>' + escapeHtml(a.title || a.contentId) + overdueTag + expandBtn + '</td>';
                html += '<td>' + scoreCell + '</td>';
                html += '<td>' + durCell + '</td>';
                html += '<td>' + dateCell + '</td>';
                html += '</tr>';

                // Sub-rows for path modules
                if (a.isPath && a.modules) {
                    a.modules.forEach(function(m) {
                        var mDone = m.completed;
                        var mDot = '<div class="hd-asgn-dot ' + (mDone ? 'complete' : 'incomplete') + '" style="display:inline-block;vertical-align:middle;width:6px;height:6px"></div>';
                        var mScore = '--';
                        if (m.score != null) {
                            var msc = m.score;
                            var mscClass = msc >= 80 ? 'hd-score-green' : msc >= 60 ? 'hd-score-yellow' : 'hd-score-red';
                            mScore = '<span class="' + mscClass + '">' + msc + '%</span>';
                        }
                        var mDur = '--';
                        if (m.duration > 0) {
                            var mH = Math.floor(m.duration / 3600);
                            var mM = Math.round((m.duration % 3600) / 60);
                            mDur = mH > 0 ? mH + 'h ' + mM + 'm' : mM + 'm';
                        }
                        var mDate = '--';
                        if (m.completedAt) {
                            var md = m.completedAt.toDate ? m.completedAt.toDate() : new Date(m.completedAt);
                            mDate = md.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }
                        html += '<tr class="hd-asgn-sub-row hd-sub-' + idx + '" style="display:none">';
                        html += '<td>' + mDot + '</td>';
                        html += '<td>' + escapeHtml(m.title || m.id) + '</td>';
                        html += '<td>' + mScore + '</td>';
                        html += '<td>' + mDur + '</td>';
                        html += '<td>' + mDate + '</td>';
                        html += '</tr>';
                    });
                }
            });
            html += '</tbody></table>';

            return html;
        }

        // Render sparkline after DOM is built (called from _renderProfileTab)
        function _renderClassSparklineIfNeeded(uid) {
            var el = document.getElementById('hd-class-sparkline-' + uid);
            if (!el) return;
            var detail = getStudentDetailedProgress(uid);
            var scores = [];
            detail.assignments.forEach(function(a) {
                if (a.isPath && a.modules) {
                    a.modules.forEach(function(m) { if (m.score != null) scores.push(m.score); });
                } else if (a.score != null) {
                    scores.push(a.score);
                }
            });
            if (scores.length > 1 && typeof HandlerCharts !== 'undefined') {
                HandlerCharts.sparkline(el, scores, { width: 240, height: 40, color: '#d4a017' });
            }
        }

        function _buildGlobalProfileHTML(member) {
            const uid = member.uid;
            const cached = _profileCache[uid];

            if (!cached) {
                // Fetch and show loading
                _fetchGlobalProfile(uid).then(function() {
                    const tabContent = document.getElementById('hd-profile-tab-content-' + uid);
                    if (tabContent) tabContent.innerHTML = _buildGlobalProfileHTML(member);
                });
                return '<div style="color:var(--hd-text-muted,#888);font-size:0.85rem;padding:20px 0;">Loading global profile...</div>';
            }

            const p = cached;
            const quizAvg = p.quizAvg != null ? Math.round(p.quizAvg) + '%' : '--';
            const modulesCompleted = p.modulesCompleted != null ? p.modulesCompleted : '--';
            const labsCompleted = p.labsCompleted != null ? p.labsCompleted : '--';
            const xp = p.xp != null ? p.xp : (member.xp || '--');
            const level = p.level != null ? p.level : (member.level || '--');
            const streak = p.streak != null ? p.streak : '--';

            const stats = [
                { label: 'Quiz Avg', value: quizAvg, key: 'quizAvg' },
                { label: 'Modules', value: modulesCompleted, key: 'modulesCompleted' },
                { label: 'Labs', value: labsCompleted, key: 'labsCompleted' },
                { label: 'XP', value: xp, key: 'xp' },
                { label: 'Level', value: level, key: 'level' },
                { label: 'Streak', value: streak + (typeof streak === 'number' ? 'd' : ''), key: 'streak' }
            ];

            let html = '<div class="hd-stat-cards-row">';
            stats.forEach(function(s) {
                html += '<div class="hd-profile-stat" onclick="_profileStatDetail(\'' + escapeHtml(uid) + '\',\'' + s.key + '\')" title="Click for details">';
                html += '<div class="hd-profile-stat-value">' + escapeHtml(String(s.value)) + '</div>';
                html += '<div class="hd-profile-stat-label">' + escapeHtml(s.label) + '</div>';
                html += '</div>';
            });
            html += '</div>';

            // House + achievements summary
            const house = p.house || member.house || '--';
            const achievementsCount = p.achievements != null
                ? (Array.isArray(p.achievements) ? p.achievements.length : Object.keys(p.achievements).length)
                : '--';

            html += '<div style="display:flex;gap:24px;font-size:0.8rem;color:var(--hd-text-muted,#888);margin-top:8px;">';
            html += '<span>House: <strong style="color:var(--hd-text,#e0e0e0)">' + escapeHtml(house ? capitalize(house) : '--') + '</strong></span>';
            html += '<span>Achievements: <strong style="color:var(--hd-text,#e0e0e0)">' + escapeHtml(String(achievementsCount)) + '</strong></span>';
            html += '</div>';

            return html;
        }

        function _profileStatDetail(uid, key) {
            const cached = _profileCache[uid];
            const member = rosterMembers.find(function(m) { return m.uid === uid; });
            if (!member) return;
            const name = (member.firstName && member.lastName)
                ? member.lastName + ', ' + member.firstName
                : member.displayName || 'Student';

            const labels = {
                quizAvg: 'Quiz Average',
                modulesCompleted: 'Modules Completed',
                labsCompleted: 'Labs Completed',
                xp: 'Total XP',
                level: 'Level',
                streak: 'Current Streak'
            };

            let detail = '--';
            if (cached && cached[key] != null) {
                detail = String(cached[key]);
                if (key === 'streak') detail += ' days';
                if (key === 'quizAvg') detail = Math.round(cached[key]) + '%';
            }

            drillDown({
                label: labels[key] || key,
                render: function(container) {
                    let html = '<div class="hd-drilldown">';
                    html += '<div class="hd-drilldown-header">';
                    html += '<button class="hd-btn hd-btn-sm" onclick="goBack()">&larr; Back</button>';
                    html += '<h2 class="hd-drilldown-title">' + escapeHtml(name) + ' &mdash; ' + escapeHtml(labels[key] || key) + '</h2>';
                    html += '<button class="hd-btn hd-btn-sm hd-btn-outline" onclick="exportDrillCSV()">Export CSV</button>';
                    html += '</div>';
                    html += '<div style="padding:24px 0;font-size:2rem;font-weight:700;color:var(--hd-accent,#d4a017)">' + escapeHtml(detail) + '</div>';
                    html += '<div style="color:var(--hd-text-muted,#888);font-size:0.85rem;">Detailed breakdown coming in a future update.</div>';
                    html += '</div>';
                    container.innerHTML = html;
                }
            });
        }

        async function _fetchGlobalProfile(uid) {
            if (_profileCache[uid]) return _profileCache[uid];
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const doc = await db.collection('users').doc(uid).get();
                    if (doc.exists) {
                        const data = doc.data();
                        // Compute quiz average from quizzes map if present
                        let quizAvg = null;
                        if (data.quizzes && typeof data.quizzes === 'object') {
                            const scores = Object.values(data.quizzes)
                                .map(function(q) { return typeof q === 'object' ? q.score : q; })
                                .filter(function(s) { return typeof s === 'number'; });
                            if (scores.length > 0) {
                                quizAvg = scores.reduce(function(a, b) { return a + b; }, 0) / scores.length;
                            }
                        } else if (data.quizAvg != null) {
                            quizAvg = data.quizAvg;
                        }
                        _profileCache[uid] = {
                            xp: data.xp || 0,
                            level: data.level || 1,
                            modulesCompleted: data.modulesCompleted || 0,
                            labsCompleted: data.labsCompleted || 0,
                            streak: data.streak || 0,
                            house: data.house || null,
                            callsign: data.callsign || null,
                            achievements: data.achievements || null,
                            quizAvg: quizAvg
                        };
                        return _profileCache[uid];
                    }
                }
            } catch (e) {
                console.warn('Could not fetch global profile for', uid, e);
            }
            // Fallback: use roster member data
            const member = rosterMembers.find(function(m) { return m.uid === uid; });
            if (member) {
                _profileCache[uid] = {
                    xp: member.xp || 0,
                    level: member.level || 1,
                    modulesCompleted: null,
                    labsCompleted: null,
                    streak: null,
                    house: member.house || null,
                    callsign: member.callsign || null,
                    achievements: null,
                    quizAvg: null
                };
            }
            return _profileCache[uid] || null;
        }

        // ═══════════════════════════════════════════════════════════════
        // KEYBOARD NAVIGATION
        // ═══════════════════════════════════════════════════════════════

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && _viewStack.length > 0) {
                e.preventDefault();
                goBack();
            }
        });

        // ═══════════════════════════════════════════════════════════════
        // DRILL-DOWN CSV EXPORT
        // ═══════════════════════════════════════════════════════════════

        function exportDrillCSV() {
            const table = document.querySelector('.hd-drilldown .hd-drill-table');
            if (!table) {
                // Try bar data
                const bars = document.querySelectorAll('.hd-drill-bar-row');
                if (bars.length) {
                    let csv = 'Student,Completion %\n';
                    bars.forEach(function(row) {
                        const label = row.querySelector('.hd-drill-bar-label') ? row.querySelector('.hd-drill-bar-label').textContent : '';
                        const value = row.querySelector('.hd-drill-bar-value') ? row.querySelector('.hd-drill-bar-value').textContent : '';
                        csv += '"' + label.replace(/"/g, '""') + '",' + value + '\n';
                    });
                    _downloadCSV(csv, 'export.csv');
                    return;
                }
                return;
            }

            let csv = '';
            const rows = table.querySelectorAll('tr');
            rows.forEach(function(row) {
                const cells = row.querySelectorAll('th, td');
                const rowData = Array.from(cells).map(function(cell) {
                    const text = cell.textContent.trim().replace(/"/g, '""');
                    return '"' + text + '"';
                });
                csv += rowData.join(',') + '\n';
            });

            _downloadCSV(csv, 'dashboard-export.csv');
        }

        function _downloadCSV(csv, filename) {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // ═══════════════════════════════════════════════════════════════
        // RISK SCORE ENGINE
        // ═══════════════════════════════════════════════════════════════

        function calculateRiskScore(member) {
            const completion = getStudentCompletion(member.uid || member.id);
            const pct = completion ? completion.pct : 0;

            // Completion weight (0.4)
            const completionFactor = 1 - (pct / 100);

            // Activity weight (0.3) — days since last activity
            let inactivityFactor = 0;
            if (member.lastActivity) {
                const lastActive = member.lastActivity.seconds
                    ? member.lastActivity.seconds * 1000
                    : new Date(member.lastActivity).getTime();
                const daysSince = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
                inactivityFactor = Math.min(1, daysSince / 14); // Max at 14 days
            } else {
                inactivityFactor = 1;
            }

            // Assignment velocity weight (0.3)
            let velocityFactor = 0;
            if (classAssignments.length > 0) {
                const now = Date.now();
                let dueCount = 0, doneCount = 0;
                classAssignments.forEach(function(a) {
                    if (a.dueDate) {
                        const due = a.dueDate.seconds
                            ? a.dueDate.seconds * 1000
                            : new Date(a.dueDate).getTime();
                        if (due <= now) {
                            dueCount++;
                            const studentProgress = classProgressData.find(function(p) { return p.id === (member.uid || member.id); });
                            const completions = studentProgress ? (studentProgress.completions || {}) : {};
                            const prog = resolveAssignmentProgress(a, completions);
                            if (prog && prog.pct === 100) doneCount++;
                        }
                    }
                });
                if (dueCount > 0) velocityFactor = 1 - (doneCount / dueCount);
            }

            return Math.round(
                (completionFactor * 0.4 + inactivityFactor * 0.3 + velocityFactor * 0.3) * 100
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // EXPORT (CSV)
        // ═══════════════════════════════════════════════════════════════

        function downloadCSV(filename, csvContent) {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        function csvEscape(val) {
            if (val == null) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }

        async function exportRosterCSV() {
            if (!selectedClassId) return;
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            try {
                const members = await ClassManager.getClassMembers(selectedClassId);
                if (!members || members.length === 0) {
                    showToast('No students to export');
                    return;
                }

                // Blackboard-compatible columns
                const rows = [['Last Name', 'First Name', 'Student ID', 'Email', 'House', 'Joined']];
                for (const m of members) {
                    const joined = m.joinedAt?.toDate
                        ? m.joinedAt.toDate().toLocaleDateString('en-US')
                        : '';
                    rows.push([
                        csvEscape(m.lastName || ''),
                        csvEscape(m.firstName || ''),
                        csvEscape(m.studentId || ''),
                        csvEscape(m.email || ''),
                        csvEscape(m.house || ''),
                        csvEscape(joined)
                    ]);
                }

                const csv = rows.map(r => r.join(',')).join('\n');
                const safeName = cls.name.replace(/[^a-zA-Z0-9]/g, '_');
                downloadCSV(`${safeName}_roster_${new Date().toISOString().slice(0,10)}.csv`, csv);
                showToast('Roster exported');
            } catch (error) {
                console.error('Export roster failed:', error);
                showToast('Export failed');
            }
        }

        async function exportAssignmentsCSV() {
            if (!selectedClassId) return;
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            try {
                if (!classAssignments || classAssignments.length === 0) {
                    showToast('No assignments to export');
                    return;
                }

                const rows = [['Title', 'Type', 'House', 'Difficulty', 'Due Date', 'Notes']];
                for (const a of classAssignments) {
                    let dueStr = '';
                    if (a.dueDate) {
                        const d = a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
                        dueStr = d.toLocaleDateString('en-US');
                    }
                    rows.push([
                        csvEscape(a.contentTitle || a.title || a.contentId || ''),
                        csvEscape(a.assignmentType === 'path' ? 'Learning Path' : (a.contentType || 'Module')),
                        csvEscape(a.house || ''),
                        csvEscape(a.difficulty || ''),
                        csvEscape(dueStr),
                        csvEscape(a.notes || '')
                    ]);
                }

                const csv = rows.map(r => r.join(',')).join('\n');
                const safeName = cls.name.replace(/[^a-zA-Z0-9]/g, '_');
                downloadCSV(`${safeName}_assignments_${new Date().toISOString().slice(0,10)}.csv`, csv);
                showToast('Assignments exported');
            } catch (error) {
                console.error('Export assignments failed:', error);
                showToast('Export failed');
            }
        }

        async function exportGradesCSV() {
            if (!selectedClassId) return;
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            try {
                if (!classAssignments || classAssignments.length === 0) {
                    showToast('No assignments to export');
                    return;
                }
                if (!rosterMembers || rosterMembers.length === 0) {
                    showToast('No students to export');
                    return;
                }

                const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
                const rows = [['Last Name', 'First Name', 'Student ID', 'Assignment', 'Module', 'Status', 'Score', 'Duration (min)', 'Completed Date']];

                for (const m of rosterMembers) {
                    const studentProgress = classProgressData.find(p => p.id === m.uid);
                    const completions = studentProgress?.completions || {};
                    const keys = Object.keys(completions);

                    for (const a of classAssignments) {
                        if (a.assignmentType === 'path') {
                            const pathDef = paths[a.contentId];
                            if (pathDef?.modules?.length > 0) {
                                for (const mod of pathDef.modules) {
                                    const comp = findModuleCompletion(mod.id, completions, keys, true);
                                    const isDone = !!comp;
                                    const score = isDone && comp.score != null ? comp.score + '%' : '';
                                    const dur = isDone && comp.duration > 0 ? Math.round(comp.duration / 60) : '';
                                    const dateStr = isDone && comp.completedAt
                                        ? new Date(comp.completedAt.toDate ? comp.completedAt.toDate() : comp.completedAt).toLocaleDateString('en-US')
                                        : '';
                                    rows.push([
                                        csvEscape(m.lastName || ''),
                                        csvEscape(m.firstName || ''),
                                        csvEscape(m.studentId || ''),
                                        csvEscape(a.title || ''),
                                        csvEscape(mod.title || mod.id),
                                        csvEscape(isDone ? 'Completed' : 'Not Started'),
                                        csvEscape(score),
                                        csvEscape(dur),
                                        csvEscape(dateStr)
                                    ]);
                                }
                            } else {
                                // Path without definition — single row
                                const comp = findModuleCompletion(a.contentId, completions, keys);
                                const isDone = !!comp;
                                const score = isDone && comp?.score != null ? comp.score + '%' : '';
                                const dur = isDone && comp?.duration > 0 ? Math.round(comp.duration / 60) : '';
                                const dateStr = isDone && comp?.completedAt
                                    ? new Date(comp.completedAt.toDate ? comp.completedAt.toDate() : comp.completedAt).toLocaleDateString('en-US')
                                    : '';
                                rows.push([
                                    csvEscape(m.lastName || ''),
                                    csvEscape(m.firstName || ''),
                                    csvEscape(m.studentId || ''),
                                    csvEscape(a.title || ''),
                                    csvEscape(''),
                                    csvEscape(isDone ? 'Completed' : 'Not Started'),
                                    csvEscape(score),
                                    csvEscape(dur),
                                    csvEscape(dateStr)
                                ]);
                            }
                        } else {
                            // Item assignment — smart resolution
                            const comp = findModuleCompletion(a.contentId, completions, keys);
                            const isDone = !!comp;
                            const score = isDone && comp?.score != null ? comp.score + '%' : '';
                            const dur = isDone && comp?.duration > 0 ? Math.round(comp.duration / 60) : '';
                            const dateStr = isDone && comp?.completedAt
                                ? new Date(comp.completedAt.toDate ? comp.completedAt.toDate() : comp.completedAt).toLocaleDateString('en-US')
                                : '';
                            rows.push([
                                csvEscape(m.lastName || ''),
                                csvEscape(m.firstName || ''),
                                csvEscape(m.studentId || ''),
                                csvEscape(a.title || ''),
                                csvEscape(''),
                                csvEscape(isDone ? 'Completed' : 'Not Started'),
                                csvEscape(score),
                                csvEscape(dur),
                                csvEscape(dateStr)
                            ]);
                        }
                    }
                }

                const csv = rows.map(r => r.join(',')).join('\n');
                const safeName = cls.name.replace(/[^a-zA-Z0-9]/g, '_');
                downloadCSV(`${safeName}_grades_${new Date().toISOString().slice(0,10)}.csv`, csv);
                showToast('Grades exported');
            } catch (error) {
                console.error('Export grades failed:', error);
                showToast('Export failed');
            }
        }

        async function exportProgressCSV() {
            if (!selectedClassId) return;
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            try {
                if (!rosterMembers || rosterMembers.length === 0) {
                    showToast('No students to export');
                    return;
                }

                const rows = [['Last Name', 'First Name', 'Student ID', 'Completed', 'Total', 'Completion %']];
                for (const m of rosterMembers) {
                    const { completed, total, pct } = getStudentCompletion(m.uid);
                    rows.push([
                        csvEscape(m.lastName || ''),
                        csvEscape(m.firstName || ''),
                        csvEscape(m.studentId || ''),
                        csvEscape(completed),
                        csvEscape(total),
                        csvEscape(total > 0 ? pct + '%' : '--')
                    ]);
                }

                const csv = rows.map(r => r.join(',')).join('\n');
                const safeName = cls.name.replace(/[^a-zA-Z0-9]/g, '_');
                downloadCSV(`${safeName}_progress_${new Date().toISOString().slice(0,10)}.csv`, csv);
                showToast('Progress summary exported');
            } catch (error) {
                console.error('Export progress failed:', error);
                showToast('Export failed');
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // FEATURE 1: EARLY WARNING FLAGS
        // ═══════════════════════════════════════════════════════════════

        function renderEarlyWarnings() {
            const section = document.getElementById('warningsSection');
            const list = document.getElementById('warningsList');
            const countEl = document.getElementById('warningsCount');
            if (!section || !list) return;

            const flags = [];
            const now = Date.now();
            const sevenDays = 7 * 86400000;
            const fourteenDays = 14 * 86400000;
            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};

            for (const member of rosterMembers) {
                const uid = member.uid;
                const fullName = (member.firstName && member.lastName)
                    ? `${member.lastName}, ${member.firstName}`
                    : member.displayName || 'Unknown';
                const sp = classProgressData.find(p => p.id === uid);
                const completions = sp?.completions || {};
                const keys = Object.keys(completions);

                // Gather all completion timestamps
                const timestamps = [];
                let totalScore = 0, scoredCount = 0;
                for (const [, data] of Object.entries(completions)) {
                    if (data.completed && data.completedAt) {
                        const t = data.completedAt.toDate ? data.completedAt.toDate().getTime() : new Date(data.completedAt).getTime();
                        timestamps.push(t);
                    }
                    if (data.score != null) { totalScore += data.score; scoredCount++; }
                }

                const totalCompletions = timestamps.length;

                // Flag: No activity
                if (totalCompletions === 0 && classAssignments.length > 0) {
                    flags.push({ uid, name: fullName, severity: 'danger', reason: 'No activity — 0 completions', sort: 0 });
                    continue;
                }

                // Flag: Inactive (last completion >7 days ago)
                if (totalCompletions > 0) {
                    const lastTs = Math.max(...timestamps);
                    if (now - lastTs > sevenDays) {
                        const days = Math.floor((now - lastTs) / 86400000);
                        flags.push({ uid, name: fullName, severity: 'warning', reason: `Inactive — last activity ${days}d ago`, sort: 2 });
                    }
                }

                // Flag: Failing scores
                if (scoredCount > 0) {
                    const avg = Math.round(totalScore / scoredCount);
                    if (avg < 60) {
                        flags.push({ uid, name: fullName, severity: 'danger', reason: `Failing avg score: ${avg}%`, sort: 1 });
                    }
                }

                // Flag: Declining pace
                if (totalCompletions >= 2) {
                    const recent = timestamps.filter(t => t > now - fourteenDays).length;
                    const prior = timestamps.filter(t => t > now - fourteenDays * 2 && t <= now - fourteenDays).length;
                    if (prior > 0 && recent < prior * 0.5) {
                        flags.push({ uid, name: fullName, severity: 'warning', reason: `Declining pace — ${recent} vs ${prior} completions (14d)`, sort: 3 });
                    }
                }

                // Flag: Overdue assignments
                for (const a of classAssignments) {
                    if (!a.dueDate) continue;
                    const due = a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
                    if (due.getTime() > now) continue;
                    const result = resolveAssignmentProgress(a, completions);
                    if (result.pct < 100) {
                        flags.push({ uid, name: fullName, severity: 'danger', reason: `Overdue: ${a.title} (${result.pct}%)`, sort: 0 });
                    }
                }
            }

            // Remove dismissed, sort by severity, cap at 20
            const visible = flags
                .filter(f => !dismissedWarnings.has(f.uid + ':' + f.reason))
                .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name))
                .slice(0, 20);

            if (visible.length === 0) {
                section.style.display = 'none';
                return;
            }

            section.style.display = '';
            countEl.textContent = `${visible.length} flag${visible.length !== 1 ? 's' : ''}`;

            list.innerHTML = visible.map(f => `
                <div class="hd-warning-item ${f.severity}" role="button" tabindex="0"
                     onclick="closeModal('warningClick'); showStudentDetail('${f.uid}')"
                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showStudentDetail('${f.uid}')}">
                    <span class="hd-warning-badge ${f.severity}">${f.severity === 'danger' ? 'ALERT' : 'WARN'}</span>
                    <span class="hd-warning-name">${escapeHtml(f.name)}</span>
                    <span class="hd-warning-reason">${escapeHtml(f.reason)}</span>
                    <button class="hd-warning-dismiss" onclick="event.stopPropagation(); dismissWarning('${escapeHtml(f.uid + ':' + f.reason)}')" title="Dismiss">&times;</button>
                </div>
            `).join('');
        }

        function dismissWarning(key) {
            dismissedWarnings.add(key);
            renderEarlyWarnings();
        }

        // ═══════════════════════════════════════════════════════════════
        // FEATURE 2: LOWEST QUIZ SCORES
        // ═══════════════════════════════════════════════════════════════

        function renderLowestScores() {
            const container = document.getElementById('lowestScoresContent');
            if (!container) return;

            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            const moduleScores = {}; // moduleId => { scores: [], title }

            for (const sp of classProgressData) {
                const completions = sp.completions || {};
                const keys = Object.keys(completions);
                for (const a of classAssignments) {
                    if (a.assignmentType === 'path') {
                        const pathDef = paths[a.contentId];
                        if (pathDef?.modules) {
                            for (const mod of pathDef.modules) {
                                const comp = findModuleCompletion(mod.id, completions, keys, true);
                                if (comp?.score != null) {
                                    if (!moduleScores[mod.id]) moduleScores[mod.id] = { scores: [], title: mod.title || getContentTitle(mod.id) };
                                    moduleScores[mod.id].scores.push(comp.score);
                                }
                            }
                        }
                    } else {
                        const comp = findModuleCompletion(a.contentId, completions, keys);
                        if (comp?.score != null) {
                            if (!moduleScores[a.contentId]) moduleScores[a.contentId] = { scores: [], title: a.title || getContentTitle(a.contentId) };
                            moduleScores[a.contentId].scores.push(comp.score);
                        }
                    }
                }
            }

            const entries = Object.entries(moduleScores).map(([id, data]) => {
                const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
                const min = Math.min(...data.scores);
                const max = Math.max(...data.scores);
                return { id, title: data.title, avg, min, max, count: data.scores.length };
            });

            if (entries.length === 0) {
                container.innerHTML = '<div class="hd-analytics-empty">No scored work yet</div>';
                return;
            }

            entries.sort((a, b) => a.avg - b.avg);
            const top15 = entries.slice(0, 15);

            container.innerHTML = `<div class="hd-lowest-scores-list">${top15.map((e, i) => {
                const colorClass = e.avg < 60 ? 'score-red' : e.avg < 70 ? 'score-yellow' : e.avg >= 80 ? 'score-green' : '';
                return `<div class="hd-lowest-score-row">
                    <span class="hd-lowest-score-rank">${i + 1}.</span>
                    <span class="hd-lowest-score-name" title="${escapeHtml(e.title)}">${escapeHtml(e.title)}</span>
                    <span class="hd-lowest-score-avg ${colorClass}">${e.avg}%</span>
                    <span class="hd-lowest-score-range">${e.min}–${e.max}%</span>
                    <span class="hd-lowest-score-count">n=${e.count}</span>
                </div>`;
            }).join('')}</div>`;
        }

        // ═══════════════════════════════════════════════════════════════
        // FEATURE 3: ASSIGNMENT HEALTH
        // ═══════════════════════════════════════════════════════════════

        function renderAssignmentHealth() {
            const container = document.getElementById('assignmentHealthContent');
            if (!container) return;

            if (classAssignments.length === 0 || rosterMembers.length === 0) {
                container.innerHTML = '<div class="hd-analytics-empty">No assignments yet</div>';
                return;
            }

            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            const totalStudents = rosterMembers.length;

            const rows = classAssignments.map(a => {
                let completedCount = 0;
                let startedCount = 0;
                const durations = [];

                for (const sp of classProgressData) {
                    const completions = sp.completions || {};
                    const keys = Object.keys(completions);
                    const result = resolveAssignmentProgress(a, completions);

                    if (result.pct === 100) completedCount++;
                    if (result.completed > 0) startedCount++;

                    // Collect durations from individual modules
                    if (a.assignmentType === 'path') {
                        const pathDef = paths[a.contentId];
                        if (pathDef?.modules) {
                            for (const mod of pathDef.modules) {
                                const comp = findModuleCompletion(mod.id, completions, keys, true);
                                if (comp?.duration > 0) durations.push(comp.duration);
                            }
                        }
                    } else {
                        const comp = findModuleCompletion(a.contentId, completions, keys);
                        if (comp?.duration > 0) durations.push(comp.duration);
                    }
                }

                const completionPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
                const dropOff = (a.assignmentType === 'path' && startedCount > 0)
                    ? Math.round(((startedCount - completedCount) / startedCount) * 100) : null;

                let avgTime = null, medianTime = null;
                if (durations.length > 0) {
                    avgTime = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
                    const sorted = [...durations].sort((a, b) => a - b);
                    medianTime = sorted.length % 2 === 0
                        ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
                        : sorted[Math.floor(sorted.length / 2)];
                }

                return { title: a.title, completionPct, startedCount, completedCount, totalStudents, dropOff, avgTime, medianTime, isPath: a.assignmentType === 'path' };
            });

            const compColor = pct => pct >= 70 ? 'health-good' : pct >= 40 ? 'health-warn' : 'health-bad';
            const dropColor = d => d == null ? '' : d > 50 ? 'health-bad' : d > 25 ? 'health-warn' : 'health-good';

            container.innerHTML = `<table class="hd-health-table">
                <thead><tr>
                    <th>Assignment</th>
                    <th>Completion</th>
                    <th>Started</th>
                    <th>Drop-off</th>
                    <th>Avg Time</th>
                    <th class="hd-health-median">Median Time</th>
                </tr></thead>
                <tbody>${rows.map(r => `<tr>
                    <td>${escapeHtml(r.title)}</td>
                    <td class="${compColor(r.completionPct)}">${r.completionPct}%</td>
                    <td>${r.startedCount}/${r.totalStudents}</td>
                    <td class="${dropColor(r.dropOff)}">${r.dropOff != null ? r.dropOff + '%' : '--'}</td>
                    <td>${r.avgTime ? formatDuration(r.avgTime) : '--'}</td>
                    <td class="hd-health-median">${r.medianTime ? formatDuration(r.medianTime) : '--'}</td>
                </tr>`).join('')}</tbody>
            </table>`;
        }

        // ═══════════════════════════════════════════════════════════════
        // FEATURE 4: SCORE HEATMAP
        // ═══════════════════════════════════════════════════════════════

        function heatmapColor(score) {
            if (score == null) return { bg: '#1a1a2e', text: '' };
            if (score === -1) return { bg: '#1a3a5c', text: '\u2713' }; // completed, unscored
            if (score >= 90) return { bg: '#166534', text: '' };
            if (score >= 80) return { bg: '#4ade80', text: '' };
            if (score >= 70) return { bg: '#a16207', text: '' };
            if (score >= 60) return { bg: '#d97706', text: '' };
            return { bg: '#991b1b', text: '' };
        }

        function renderHeatmap() {
            const container = document.getElementById('heatmapContent');
            if (!container) return;

            const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};

            // Build column list (all modules from all assignments)
            const columns = [];
            for (const a of classAssignments) {
                if (a.assignmentType === 'path') {
                    const pathDef = paths[a.contentId];
                    if (pathDef?.modules) {
                        for (const mod of pathDef.modules) {
                            columns.push({ id: mod.id, title: mod.title || getContentTitle(mod.id) });
                        }
                    }
                } else {
                    columns.push({ id: a.contentId, title: a.title || getContentTitle(a.contentId) });
                }
            }

            if (columns.length === 0 || rosterMembers.length === 0) {
                container.innerHTML = '<div class="hd-analytics-empty">No scored work yet</div>';
                return;
            }

            // Build rows
            const rowData = rosterMembers.map(member => {
                const fullName = (member.firstName && member.lastName)
                    ? `${member.lastName}, ${member.firstName}`
                    : member.displayName || 'Unknown';
                const sp = classProgressData.find(p => p.id === member.uid);
                const completions = sp?.completions || {};
                const keys = Object.keys(completions);

                const cells = columns.map(col => {
                    const comp = findModuleCompletion(col.id, completions, keys, true);
                    if (!comp) return null; // not started
                    if (comp.score != null) return comp.score;
                    return -1; // completed but unscored
                });

                return { name: fullName, cells };
            });

            // Sort rows by name
            rowData.sort((a, b) => a.name.localeCompare(b.name));

            // Build table HTML
            const headerCells = columns.map(c => `<th class="hd-heatmap-col-header" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</th>`).join('');
            const bodyRows = rowData.map(r => {
                const cells = r.cells.map((score, i) => {
                    const { bg, text } = heatmapColor(score);
                    const label = score == null ? '' : score === -1 ? 'Done' : score + '%';
                    const tooltip = `${columns[i].title}: ${label || 'Not started'}`;
                    return `<td class="hd-heatmap-cell" style="background:${bg};color:#fff" title="${escapeHtml(tooltip)}">${text}</td>`;
                }).join('');
                return `<tr><td class="hd-heatmap-name" title="${escapeHtml(r.name)}">${escapeHtml(r.name)}</td>${cells}</tr>`;
            }).join('');

            container.innerHTML = `
                <div class="hd-heatmap-wrap">
                    <table class="hd-heatmap-table">
                        <thead><tr><th class="hd-heatmap-corner"></th>${headerCells}</tr></thead>
                        <tbody>${bodyRows}</tbody>
                    </table>
                </div>
                <div class="hd-heatmap-legend">
                    <span class="hd-heatmap-legend-swatch" style="background:#333"></span>Not started
                    <span class="hd-heatmap-legend-swatch" style="background:#1a3a5c"></span>Done (no score)
                    <span class="hd-heatmap-legend-swatch" style="background:#991b1b"></span>F &lt;60
                    <span class="hd-heatmap-legend-swatch" style="background:#d97706"></span>D 60-69
                    <span class="hd-heatmap-legend-swatch" style="background:#a16207"></span>C 70-79
                    <span class="hd-heatmap-legend-swatch" style="background:#4ade80"></span>B 80-89
                    <span class="hd-heatmap-legend-swatch" style="background:#166534"></span>A 90+
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════════
        // FEATURE 5: INDIVIDUAL STUDENT REPORTS
        // ═══════════════════════════════════════════════════════════════

        function exportStudentReport(studentUid) {
            const member = rosterMembers.find(m => m.uid === studentUid);
            if (!member) return;

            const cls = handlerClasses.find(c => c.id === selectedClassId);
            const fullName = (member.firstName && member.lastName)
                ? `${member.lastName}, ${member.firstName}`
                : member.displayName || 'Unknown';
            const detail = getStudentDetailedProgress(studentUid);
            const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Build module-by-module table
            let moduleRows = '';
            for (const a of detail.assignments) {
                if (a.isPath && a.modules) {
                    moduleRows += `<tr style="background:#f8f8f8"><td colspan="5" style="font-weight:700;padding:10px">${escapeHtml(a.title)} (${a.pathCompleted}/${a.pathTotal})</td></tr>`;
                    for (const mod of a.modules) {
                        const status = mod.completed ? 'Completed' : 'Not Started';
                        const score = mod.completed && mod.score != null ? mod.score + '%' : '--';
                        const dur = mod.completed && mod.duration > 0 ? formatDuration(mod.duration) : '--';
                        const dateStr = mod.completed && mod.completedAt
                            ? new Date(mod.completedAt.toDate ? mod.completedAt.toDate() : mod.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '--';
                        const tagClass = mod.completed ? 'green' : 'gray';
                        moduleRows += `<tr>
                            <td style="padding-left:24px">${escapeHtml(mod.title)}</td>
                            <td><span class="report-tag ${tagClass}">${status}</span></td>
                            <td>${score}</td>
                            <td>${dur}</td>
                            <td>${dateStr}</td>
                        </tr>`;
                    }
                } else {
                    const status = a.completed ? 'Completed' : 'Not Started';
                    const score = a.completed && a.score != null ? a.score + '%' : '--';
                    const dur = a.completed && a.duration > 0 ? formatDuration(a.duration) : '--';
                    const dateStr = a.completed && a.completedAt
                        ? new Date(a.completedAt.toDate ? a.completedAt.toDate() : a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '--';
                    const tagClass = a.completed ? 'green' : 'gray';
                    moduleRows += `<tr>
                        <td>${escapeHtml(a.title || getContentTitle(a.contentId))}</td>
                        <td><span class="report-tag ${tagClass}">${status}</span></td>
                        <td>${score}</td>
                        <td>${dur}</td>
                        <td>${dateStr}</td>
                    </tr>`;
                }
            }

            const overlay = document.createElement('div');
            overlay.className = 'hd-report-overlay';
            overlay.id = 'studentReportOverlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.innerHTML = `
                <div class="hd-report">
                    <div class="hd-report-toolbar">
                        <button class="primary" onclick="window.print()">Print Report</button>
                        <button onclick="document.getElementById('studentReportOverlay').remove()">Close</button>
                    </div>

                    <h2>${escapeHtml(fullName)}</h2>
                    <div class="report-subtitle">${cls ? escapeHtml(cls.name) + ' &mdash; ' : ''}Student Progress Report &mdash; ${reportDate}</div>

                    <div class="hd-report-stats">
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${detail.totalModules > 0 ? detail.pct + '%' : '--'}</div>
                            <div class="hd-report-stat-label">Completion</div>
                        </div>
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${detail.totalCompleted}/${detail.totalModules}</div>
                            <div class="hd-report-stat-label">Modules Done</div>
                        </div>
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${detail.avgScore != null ? detail.avgScore + '%' : '--'}</div>
                            <div class="hd-report-stat-label">Avg Score</div>
                        </div>
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${detail.totalDuration > 0 ? formatDuration(detail.totalDuration) : '--'}</div>
                            <div class="hd-report-stat-label">Total Time</div>
                        </div>
                    </div>

                    <div class="hd-report-section">
                        <div class="hd-report-section-title">Module Progress</div>
                        <table>
                            <thead><tr>
                                <th>Module</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Duration</th>
                                <th>Completed</th>
                            </tr></thead>
                            <tbody>${moduleRows || '<tr><td colspan="5" style="text-align:center;color:#999;">No assignments</td></tr>'}</tbody>
                        </table>
                    </div>

                    <div class="hd-report-footer">
                        Hexworth Prime &mdash; Student Report &mdash; ${reportDate}
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
        }

        // ═══════════════════════════════════════════════════════════════
        // FEATURE 6: COMPLIANCE EXPORT (Completion Evidence CSV)
        // ═══════════════════════════════════════════════════════════════

        async function exportCompletionEvidence() {
            if (!selectedClassId) return;
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            try {
                if (!rosterMembers || rosterMembers.length === 0) {
                    showToast('No students to export');
                    return;
                }
                if (classAssignments.length === 0) {
                    showToast('No assignments to export');
                    return;
                }

                const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
                const rows = [['Last Name', 'First Name', 'Student ID', 'Content ID', 'Content Title', 'Type', 'Score', 'Duration (min)', 'Completed At (ISO)', 'Completed At (Local)']];

                for (const m of rosterMembers) {
                    const sp = classProgressData.find(p => p.id === m.uid);
                    const completions = sp?.completions || {};
                    const keys = Object.keys(completions);

                    for (const a of classAssignments) {
                        if (a.assignmentType === 'path') {
                            const pathDef = paths[a.contentId];
                            if (pathDef?.modules) {
                                for (const mod of pathDef.modules) {
                                    const comp = findModuleCompletion(mod.id, completions, keys, true);
                                    if (comp) {
                                        const dt = comp.completedAt ? (comp.completedAt.toDate ? comp.completedAt.toDate() : new Date(comp.completedAt)) : null;
                                        rows.push([
                                            csvEscape(m.lastName || ''),
                                            csvEscape(m.firstName || ''),
                                            csvEscape(m.studentId || ''),
                                            csvEscape(mod.id),
                                            csvEscape(mod.title || getContentTitle(mod.id)),
                                            csvEscape(mod.type || 'module'),
                                            csvEscape(comp.score != null ? comp.score : ''),
                                            csvEscape(comp.duration > 0 ? Math.round(comp.duration / 60) : ''),
                                            csvEscape(dt ? dt.toISOString() : ''),
                                            csvEscape(dt ? dt.toLocaleString() : '')
                                        ]);
                                    }
                                }
                            }
                        } else {
                            const comp = findModuleCompletion(a.contentId, completions, keys);
                            if (comp) {
                                const dt = comp.completedAt ? (comp.completedAt.toDate ? comp.completedAt.toDate() : new Date(comp.completedAt)) : null;
                                rows.push([
                                    csvEscape(m.lastName || ''),
                                    csvEscape(m.firstName || ''),
                                    csvEscape(m.studentId || ''),
                                    csvEscape(a.contentId),
                                    csvEscape(a.title || getContentTitle(a.contentId)),
                                    csvEscape(a.contentType || 'module'),
                                    csvEscape(comp.score != null ? comp.score : ''),
                                    csvEscape(comp.duration > 0 ? Math.round(comp.duration / 60) : ''),
                                    csvEscape(dt ? dt.toISOString() : ''),
                                    csvEscape(dt ? dt.toLocaleString() : '')
                                ]);
                            }
                        }
                    }
                }

                if (rows.length <= 1) {
                    showToast('No completion evidence to export');
                    return;
                }

                const csv = rows.map(r => r.join(',')).join('\n');
                const safeName = cls.name.replace(/[^a-zA-Z0-9]/g, '_');
                downloadCSV(`${safeName}_completion_evidence_${new Date().toISOString().slice(0,10)}.csv`, csv);
                showToast('Completion evidence exported');
            } catch (error) {
                console.error('Export completion evidence failed:', error);
                showToast('Export failed');
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // FEATURE 7: COHORT COMPARISON
        // ═══════════════════════════════════════════════════════════════

        let cohortSelected = new Set();

        function showCohortComparison() {
            if (handlerClasses.length < 2) {
                showToast('You need at least 2 classes to compare');
                return;
            }

            cohortSelected.clear();

            const overlay = document.createElement('div');
            overlay.className = 'hd-overlay';
            overlay.id = 'cohortModal';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.innerHTML = `
                <div class="hd-modal" style="max-width:700px;max-height:80vh;overflow-y:auto">
                    <button class="hd-modal-close" onclick="closeModal('cohortModal')">&times;</button>
                    <h3 style="margin-bottom:4px;color:var(--hd-gold)">Compare Classes</h3>
                    <p style="font-size:0.78rem;color:var(--hd-text-muted);margin-bottom:16px">Select 2 or more classes to compare side by side.</p>
                    <div class="hd-cohort-class-grid" id="cohortClassGrid">
                        ${handlerClasses.map(c => `<button class="hd-cohort-class-btn" data-id="${c.id}" onclick="toggleCohortClass('${c.id}')">${escapeHtml(c.name)}</button>`).join('')}
                    </div>
                    <button class="hd-cohort-compare-btn" id="cohortCompareBtn" disabled onclick="runCohortComparison()">Compare Selected</button>
                    <div id="cohortResults"></div>
                </div>
            `;

            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal('cohortModal');
            });
        }

        function toggleCohortClass(classId) {
            if (cohortSelected.has(classId)) {
                cohortSelected.delete(classId);
            } else {
                cohortSelected.add(classId);
            }

            // Update button styles
            document.querySelectorAll('#cohortClassGrid .hd-cohort-class-btn').forEach(btn => {
                btn.classList.toggle('selected', cohortSelected.has(btn.dataset.id));
            });

            const compareBtn = document.getElementById('cohortCompareBtn');
            if (compareBtn) compareBtn.disabled = cohortSelected.size < 2;
        }

        async function runCohortComparison() {
            const resultsDiv = document.getElementById('cohortResults');
            if (!resultsDiv) return;

            resultsDiv.innerHTML = '<div class="hd-cohort-loading">Loading class data...</div>';

            const now = Date.now();
            const CACHE_TTL = 5 * 60 * 1000;
            const comparisons = [];

            try {
                for (const classId of cohortSelected) {
                    const cached = cohortCache.get(classId);
                    if (cached && (now - cached.ts) < CACHE_TTL) {
                        comparisons.push(cached.data);
                        continue;
                    }

                    const [members, progress, assignments] = await Promise.all([
                        ClassManager.getClassMembers(classId),
                        typeof AssignmentManager !== 'undefined' ? AssignmentManager.getClassProgress(classId) : [],
                        typeof AssignmentManager !== 'undefined' ? AssignmentManager.getClassAssignments(classId) : []
                    ]);

                    const cls = handlerClasses.find(c => c.id === classId);
                    const enrolled = members.length;
                    const assignmentCount = assignments.length;

                    // Compute avg completion and avg score
                    let totalPctSum = 0, totalScoreSum = 0, scoredStudents = 0, atRiskCount = 0, totalCompletions = 0;
                    const paths = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};

                    for (const m of members) {
                        const sp = progress.find(p => p.id === m.uid);
                        const completions = sp?.completions || {};
                        const keys = Object.keys(completions);
                        let studentCompleted = 0, studentTotal = 0, studentScore = 0, studentScored = 0;

                        for (const a of assignments) {
                            const result = resolveAssignmentProgress(a, completions);
                            studentCompleted += result.completed;
                            studentTotal += result.total;

                            if (a.assignmentType === 'path') {
                                const pathDef = paths[a.contentId];
                                if (pathDef?.modules) {
                                    for (const mod of pathDef.modules) {
                                        const comp = findModuleCompletion(mod.id, completions, keys, true);
                                        if (comp?.score != null) { studentScore += comp.score; studentScored++; }
                                        if (comp) totalCompletions++;
                                    }
                                }
                            } else {
                                const comp = findModuleCompletion(a.contentId, completions, keys);
                                if (comp?.score != null) { studentScore += comp.score; studentScored++; }
                                if (comp) totalCompletions++;
                            }
                        }

                        const pct = studentTotal > 0 ? Math.round((studentCompleted / studentTotal) * 100) : 0;
                        totalPctSum += pct;
                        if (pct < 40 && studentTotal > 0) atRiskCount++;
                        if (studentScored > 0) {
                            totalScoreSum += Math.round(studentScore / studentScored);
                            scoredStudents++;
                        }
                    }

                    const data = {
                        name: cls?.name || classId,
                        enrolled,
                        assignments: assignmentCount,
                        avgCompletion: enrolled > 0 ? Math.round(totalPctSum / enrolled) : 0,
                        avgScore: scoredStudents > 0 ? Math.round(totalScoreSum / scoredStudents) : null,
                        atRisk: atRiskCount,
                        totalCompletions
                    };

                    cohortCache.set(classId, { data, ts: now });
                    comparisons.push(data);
                }

                // Render table
                resultsDiv.innerHTML = `<table class="hd-cohort-table">
                    <thead><tr>
                        <th>Class</th>
                        <th>Enrolled</th>
                        <th>Assignments</th>
                        <th>Avg Completion</th>
                        <th>Avg Score</th>
                        <th>At Risk</th>
                        <th>Completions</th>
                    </tr></thead>
                    <tbody>${comparisons.map(c => `<tr>
                        <td style="font-weight:600">${escapeHtml(c.name)}</td>
                        <td>${c.enrolled}</td>
                        <td>${c.assignments}</td>
                        <td class="${c.avgCompletion >= 70 ? 'health-good' : c.avgCompletion >= 40 ? 'health-warn' : 'health-bad'}">${c.avgCompletion}%</td>
                        <td class="${c.avgScore != null ? (c.avgScore >= 80 ? 'health-good' : c.avgScore >= 60 ? 'health-warn' : 'health-bad') : ''}">${c.avgScore != null ? c.avgScore + '%' : '--'}</td>
                        <td class="${c.atRisk > 0 ? 'health-bad' : ''}">${c.atRisk}</td>
                        <td>${c.totalCompletions}</td>
                    </tr>`).join('')}</tbody>
                </table>`;
            } catch (error) {
                console.error('Cohort comparison failed:', error);
                resultsDiv.innerHTML = '<div class="hd-cohort-loading" style="color:var(--hd-danger)">Failed to load comparison data.</div>';
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // CLASS REPORT (Print-Friendly)
        // ═══════════════════════════════════════════════════════════════

        function showClassReport() {
            if (!selectedClassId) return;
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            if (!cls) return;

            const totalStudents = rosterMembers.length;
            const totalAssignments = classAssignments.length;
            const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Compute per-student progress
            const studentRows = rosterMembers.map(m => {
                const { completed, total, pct } = getStudentCompletion(m.uid);
                const fullName = (m.firstName && m.lastName)
                    ? `${m.lastName}, ${m.firstName}`
                    : m.displayName || 'Unknown';
                return { member: m, fullName, completed, total, pct };
            });

            // Sort by completion ascending (struggling students first)
            studentRows.sort((a, b) => a.pct - b.pct);

            // Compute overall avg (use per-student pct to match stat card — accounts for path expansion)
            let avgCompletion = 0;
            if (totalStudents > 0 && totalAssignments > 0) {
                const avgPctSum = studentRows.reduce((sum, s) => sum + s.pct, 0);
                avgCompletion = Math.round(avgPctSum / totalStudents);
            }

            // At-risk students (below 40%)
            const atRisk = studentRows.filter(s => s.total > 0 && s.pct < 40);
            const onTrack = studentRows.filter(s => s.total > 0 && s.pct >= 70);

            // Assignment completion breakdown (using resolveAssignmentProgress for path-aware counting)
            const assignmentBreakdown = classAssignments.map(a => {
                let completedStudents = 0;
                let totalPct = 0;
                for (const sp of classProgressData) {
                    const result = resolveAssignmentProgress(a, sp.completions || {});
                    if (result.pct === 100) completedStudents++;
                    totalPct += result.pct;
                }
                const avgPct = totalStudents > 0 ? Math.round(totalPct / totalStudents) : 0;
                const rate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
                return { title: a.title, count: completedStudents, rate, avgPct, isPath: a.assignmentType === 'path' };
            });

            // Score distribution stats
            const allScores = [];
            const pathsDef = typeof LearningPaths !== 'undefined' ? LearningPaths.PATHS : {};
            for (const sp of classProgressData) {
                const completions = sp.completions || {};
                const keys = Object.keys(completions);
                for (const a of classAssignments) {
                    if (a.assignmentType === 'path') {
                        const pathDef = pathsDef[a.contentId];
                        if (pathDef?.modules) {
                            for (const mod of pathDef.modules) {
                                const comp = findModuleCompletion(mod.id, completions, keys, true);
                                if (comp?.score != null) allScores.push(comp.score);
                            }
                        }
                    } else {
                        const comp = findModuleCompletion(a.contentId, completions, keys);
                        if (comp?.score != null) allScores.push(comp.score);
                    }
                }
            }
            let scoreDistHtml = '';
            if (allScores.length > 0) {
                let gradeA = 0, gradeB = 0, gradeC = 0, gradeD = 0, gradeF = 0;
                for (const s of allScores) {
                    if (s >= 90) gradeA++; else if (s >= 80) gradeB++; else if (s >= 70) gradeC++; else if (s >= 60) gradeD++; else gradeF++;
                }
                const classAvg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
                scoreDistHtml = `
                    <div class="hd-report-section">
                        <div class="hd-report-section-title">Score Distribution</div>
                        <p style="font-size:0.8rem;margin-bottom:8px">Class Average: <strong>${classAvg}%</strong> (${allScores.length} scores)</p>
                        <table>
                            <thead><tr><th>Grade</th><th>Range</th><th>Count</th><th>Percentage</th></tr></thead>
                            <tbody>
                                <tr><td>A</td><td>90-100%</td><td>${gradeA}</td><td>${Math.round(gradeA/allScores.length*100)}%</td></tr>
                                <tr><td>B</td><td>80-89%</td><td>${gradeB}</td><td>${Math.round(gradeB/allScores.length*100)}%</td></tr>
                                <tr><td>C</td><td>70-79%</td><td>${gradeC}</td><td>${Math.round(gradeC/allScores.length*100)}%</td></tr>
                                <tr><td>D</td><td>60-69%</td><td>${gradeD}</td><td>${Math.round(gradeD/allScores.length*100)}%</td></tr>
                                <tr><td>F</td><td>&lt;60%</td><td>${gradeF}</td><td>${Math.round(gradeF/allScores.length*100)}%</td></tr>
                            </tbody>
                        </table>
                    </div>`;
            }

            // At-risk detail section
            let atRiskDetailHtml = '';
            if (atRisk.length > 0) {
                const atRiskRows = atRisk.map(s => {
                    const sp = classProgressData.find(p => p.id === s.member.uid);
                    const completions = sp?.completions || {};
                    const behind = classAssignments
                        .filter(a => resolveAssignmentProgress(a, completions).pct < 100)
                        .map(a => a.title).slice(0, 3).join(', ') || 'All';
                    return `<tr><td>${escapeHtml(s.fullName)}</td><td>${s.pct}%</td><td>${escapeHtml(behind)}</td></tr>`;
                }).join('');
                atRiskDetailHtml = `
                    <div class="hd-report-section">
                        <div class="hd-report-section-title">At-Risk Students (Detail)</div>
                        <table>
                            <thead><tr><th>Student</th><th>Completion</th><th>Behind On</th></tr></thead>
                            <tbody>${atRiskRows}</tbody>
                        </table>
                    </div>`;
            }

            // Build alerts
            let alertsHtml = '';
            if (totalAssignments === 0) {
                alertsHtml = '<div class="hd-report-alert warning">No assignments have been created for this class yet.</div>';
            } else if (atRisk.length > 0) {
                const names = atRisk.map(s => s.fullName).join(', ');
                alertsHtml = `<div class="hd-report-alert warning"><strong>${atRisk.length} at-risk student${atRisk.length !== 1 ? 's' : ''}</strong> (below 40% completion): ${escapeHtml(names)}</div>`;
            }
            if (totalStudents > 0 && totalAssignments > 0 && avgCompletion >= 70) {
                alertsHtml += '<div class="hd-report-alert success"><strong>Class is on track</strong> — average completion is ' + avgCompletion + '%.</div>';
            }

            // Student progress table
            const studentTableRows = studentRows.map(s => {
                let tagClass, tagLabel;
                if (s.total === 0) { tagClass = 'gray'; tagLabel = 'No Data'; }
                else if (s.pct >= 70) { tagClass = 'green'; tagLabel = 'On Track'; }
                else if (s.pct >= 40) { tagClass = 'yellow'; tagLabel = 'In Progress'; }
                else { tagClass = 'red'; tagLabel = 'At Risk'; }

                return `<tr>
                    <td>${escapeHtml(s.fullName)}</td>
                    <td>${escapeHtml(s.member.studentId || '--')}</td>
                    <td>${s.completed}/${s.total}</td>
                    <td>${s.total > 0 ? s.pct + '%' : '--'}</td>
                    <td><span class="report-tag ${tagClass}">${tagLabel}</span></td>
                </tr>`;
            }).join('');

            // Assignment breakdown table
            const assignmentTableRows = assignmentBreakdown.map(a => {
                const displayPct = a.isPath ? a.avgPct : a.rate;
                let tagClass;
                if (displayPct >= 70) tagClass = 'green';
                else if (displayPct >= 40) tagClass = 'yellow';
                else tagClass = 'red';

                const completedCol = a.isPath
                    ? `${a.avgPct}% avg (${a.count}/${totalStudents} complete)`
                    : `${a.count}/${totalStudents}`;

                return `<tr>
                    <td>${escapeHtml(a.title)}</td>
                    <td>${completedCol}</td>
                    <td><span class="report-tag ${totalStudents > 0 ? tagClass : 'gray'}">${totalStudents > 0 ? displayPct + '%' : '--'}</span></td>
                </tr>`;
            }).join('');

            const overlay = document.createElement('div');
            overlay.className = 'hd-report-overlay';
            overlay.id = 'classReportOverlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'classReportTitle');
            overlay.innerHTML = `
                <div class="hd-report">
                    <div class="hd-report-toolbar">
                        <button class="primary" onclick="window.print()">Print Report</button>
                        <button onclick="document.getElementById('classReportOverlay').remove()">Close</button>
                    </div>

                    <h2 id="classReportTitle">${escapeHtml(cls.name)}</h2>
                    <div class="report-subtitle">Class Report &mdash; Generated ${reportDate}</div>

                    <div class="hd-report-stats">
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${totalStudents}</div>
                            <div class="hd-report-stat-label">Students</div>
                        </div>
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${totalAssignments}</div>
                            <div class="hd-report-stat-label">Assignments</div>
                        </div>
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${avgCompletion}%</div>
                            <div class="hd-report-stat-label">Avg Completion</div>
                        </div>
                        <div class="hd-report-stat">
                            <div class="hd-report-stat-value">${atRisk.length}</div>
                            <div class="hd-report-stat-label">At Risk</div>
                        </div>
                    </div>

                    ${alertsHtml}

                    <div class="hd-report-section">
                        <div class="hd-report-section-title">Student Progress</div>
                        <table>
                            <thead><tr>
                                <th>Student</th>
                                <th>ID</th>
                                <th>Completed</th>
                                <th>Completion</th>
                                <th>Status</th>
                            </tr></thead>
                            <tbody>${studentTableRows || '<tr><td colspan="5" style="text-align:center;color:#999;">No students enrolled</td></tr>'}</tbody>
                        </table>
                    </div>

                    <div class="hd-report-section">
                        <div class="hd-report-section-title">Assignment Breakdown</div>
                        <table>
                            <thead><tr>
                                <th>Assignment</th>
                                <th>Completed</th>
                                <th>Rate</th>
                            </tr></thead>
                            <tbody>${assignmentTableRows || '<tr><td colspan="3" style="text-align:center;color:#999;">No assignments created</td></tr>'}</tbody>
                        </table>
                    </div>

                    ${scoreDistHtml}
                    ${atRiskDetailHtml}

                    <div class="hd-report-footer">
                        Hexworth Prime &mdash; Class Report &mdash; ${reportDate}
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
        }

        // ═══════════════════════════════════════════════════════════════
        // AI EXPLOIT LAB ANALYTICS
        // ═══════════════════════════════════════════════════════════════

        let ailabScores = [];    // per-student score records
        let ailabLevelStats = {}; // per-level stats from Firestore
        let ailabCollapsed = false;

        const AILAB_LEVEL_NAMES = [
            'L1: Basic Prompt Injection',
            'L2: Role Manipulation',
            'L3: Context Overflow',
            'L4: Encoding Bypass',
            'L5: Multi-Step Chain',
            'L6: System Prompt Leak',
            'L7: Guardrail Evasion',
            'L8: Full Compromise'
        ];
        const AILAB_COMPLETION_THRESHOLD = 5;

        function toggleAiLabPanel() {
            ailabCollapsed = !ailabCollapsed;
            const body = document.getElementById('ailabBody');
            const chevron = document.getElementById('ailabChevron');

            if (ailabCollapsed) {
                body.classList.add('collapsed');
                chevron.classList.add('collapsed');
            } else {
                body.classList.remove('collapsed');
                chevron.classList.remove('collapsed');
            }
        }

        async function loadAiLabData() {
            const loading = document.getElementById('ailabLoading');
            const content = document.getElementById('ailabContent');

            if (!loading || !content) return;

            loading.style.display = 'flex';
            content.style.display = 'none';

            try {
                if (!window.firebaseFirestore) {
                    loading.innerHTML = '<span style="color:var(--hd-text-muted)">Firestore not available</span>';
                    return;
                }

                const { collection, query, where, getDocs, doc, getDoc, getFirestore } = window.firebaseFirestore;
                const { getApps } = window.firebaseApp;
                const db = getFirestore(getApps()[0]);

                // Get UIDs of students in the class
                const studentUids = rosterMembers.map(m => m.uid).filter(Boolean);

                if (studentUids.length === 0) {
                    loading.innerHTML = '<span style="color:var(--hd-text-muted)">No students enrolled -- AI Lab data will appear when students join</span>';
                    return;
                }

                // Fetch score records for class students
                // Firestore "in" queries are limited to 30 items per query
                ailabScores = [];
                const batches = [];
                for (let i = 0; i < studentUids.length; i += 30) {
                    batches.push(studentUids.slice(i, i + 30));
                }

                for (const batch of batches) {
                    try {
                        const q = query(
                            collection(db, 'challenge_leaderboard', 'shopbot', 'scores'),
                            where('uid', 'in', batch)
                        );
                        const snap = await getDocs(q);
                        snap.forEach(docSnap => {
                            const data = docSnap.data();
                            data._id = docSnap.id;
                            ailabScores.push(data);
                        });
                    } catch (err) {
                        console.error('AI Lab score fetch batch error:', err);
                    }
                }

                // Deduplicate: keep highest score per student
                const bestByUid = {};
                ailabScores.forEach(s => {
                    if (!bestByUid[s.uid] || (s.score || 0) > (bestByUid[s.uid].score || 0)) {
                        bestByUid[s.uid] = s;
                    }
                });
                ailabScores = Object.values(bestByUid);

                // Fetch per-level stats
                ailabLevelStats = {};
                for (let i = 1; i <= 8; i++) {
                    try {
                        const levelDoc = await getDoc(doc(db, 'challenge_leaderboard', 'shopbot', 'stats', 'level_' + i));
                        if (levelDoc.exists()) {
                            ailabLevelStats[i] = levelDoc.data();
                        }
                    } catch (err) {
                        // Level stats may not exist yet
                    }
                }

                renderAiLabPanel();
                loading.style.display = 'none';
                content.style.display = 'block';

            } catch (error) {
                console.error('AI Lab data load failed:', error);
                loading.innerHTML = '<span style="color:var(--hd-danger)">Failed to load AI Lab data</span>';
            }
        }

        async function refreshAiLabData() {
            const btn = document.getElementById('ailabRefreshBtn');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Loading...';
            }
            try {
                await loadAiLabData();
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Refresh';
                }
            }
        }

        function renderAiLabPanel() {
            // Summary stats
            const attempted = ailabScores.length;
            const completed = ailabScores.filter(s => (s.levelsCleared || 0) >= AILAB_COMPLETION_THRESHOLD).length;
            const avgScore = attempted > 0
                ? Math.round(ailabScores.reduce((sum, s) => sum + (s.score || 0), 0) / attempted)
                : 0;
            const avgLevels = attempted > 0
                ? (ailabScores.reduce((sum, s) => sum + (s.levelsCleared || 0), 0) / attempted).toFixed(1)
                : '0';

            document.getElementById('ailabAttempted').textContent = attempted;
            document.getElementById('ailabCompleted').textContent = completed;
            document.getElementById('ailabAvgScore').textContent = attempted > 0 ? avgScore : '--';
            document.getElementById('ailabAvgLevels').textContent = attempted > 0 ? avgLevels : '--';

            renderAiLabLevelTable();
            renderAiLabStudentTable();
        }

        function renderAiLabLevelTable() {
            const tbody = document.getElementById('ailabLevelTableBody');
            if (!tbody) return;

            // Build level rows
            const rows = [];
            let lowestRate = Infinity;
            let hardestLevel = -1;

            for (let i = 1; i <= 8; i++) {
                const stats = ailabLevelStats[i];
                let successRate = '--';
                let avgAttempts = '--';

                if (stats && stats.totalAttempts > 0) {
                    const rate = (stats.totalSuccesses / stats.totalAttempts) * 100;
                    successRate = rate.toFixed(1) + '%';
                    avgAttempts = (stats.totalAttempts / Math.max(stats.totalSuccesses, 1)).toFixed(1);

                    if (rate < lowestRate) {
                        lowestRate = rate;
                        hardestLevel = i;
                    }
                }

                rows.push({ level: i, name: AILAB_LEVEL_NAMES[i - 1], successRate, avgAttempts });
            }

            if (Object.keys(ailabLevelStats).length === 0 && ailabScores.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--hd-text-muted)">No level data yet</td></tr>';
                return;
            }

            tbody.innerHTML = rows.map(r => {
                const isHardest = r.level === hardestLevel;
                return `<tr>
                    <td>${escapeHtml(r.name)}</td>
                    <td>${r.successRate}</td>
                    <td>${r.avgAttempts}</td>
                    <td>${isHardest ? '<span class="hd-ailab-hardest">Most Challenging</span>' : ''}</td>
                </tr>`;
            }).join('');
        }

        function renderAiLabStudentTable() {
            const tbody = document.getElementById('ailabStudentTableBody');
            if (!tbody) return;

            if (ailabScores.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--hd-text-muted)">No students have attempted the AI Lab yet</td></tr>';
                return;
            }

            // Sort by score descending
            const sorted = [...ailabScores].sort((a, b) => (b.score || 0) - (a.score || 0));

            // Max score for bar scaling
            const maxScore = Math.max(...sorted.map(s => s.score || 0), 1);

            tbody.innerHTML = sorted.map((s, idx) => {
                const name = s.displayName || rosterMembers.find(m => m.uid === s.uid)?.displayName || 'Student';
                const score = s.score || 0;
                const levels = s.levelsCleared || 0;
                const barWidth = Math.round((score / maxScore) * 60);

                let timestamp = '--';
                if (s.timestamp) {
                    const d = s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
                    timestamp = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }

                // Build per-level attempt detail (shown on expand)
                const levelDetail = [];
                for (let l = 1; l <= 8; l++) {
                    const att = s['l' + l + '_attempts'] || s['level_' + l + '_attempts'] || 0;
                    if (att > 0 || l <= levels) {
                        levelDetail.push('L' + l + ': ' + att + ' attempt' + (att !== 1 ? 's' : ''));
                    }
                }

                const rowId = 'ailab-detail-' + idx;
                return `<tr class="hd-ailab-student-row" onclick="toggleAiLabDetail('${rowId}', this)">
                    <td>
                        <svg class="hd-ailab-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"></polyline></svg>
                        ${escapeHtml(name)}
                    </td>
                    <td><span class="hd-ailab-score-bar" style="width:${barWidth}px"></span>${score}</td>
                    <td>${levels} / 8</td>
                    <td>${timestamp}</td>
                </tr>
                <tr class="hd-ailab-detail-row" id="${rowId}" style="display:none">
                    <td colspan="4">${levelDetail.length > 0 ? levelDetail.join(' &middot; ') : 'No per-level data available'}</td>
                </tr>`;
            }).join('');
        }

        function toggleAiLabDetail(rowId, triggerRow) {
            const detailRow = document.getElementById(rowId);
            if (!detailRow) return;

            const icon = triggerRow.querySelector('.hd-ailab-expand-icon');
            const isVisible = detailRow.style.display !== 'none';

            detailRow.style.display = isVisible ? 'none' : 'table-row';
            if (icon) icon.classList.toggle('open', !isVisible);
        }

        function exportAiLabCSV() {
            if (ailabScores.length === 0) {
                showToast('No AI Lab data to export');
                return;
            }

            const headers = ['Student Name', 'Score', 'Levels Cleared'];
            for (let l = 1; l <= 8; l++) {
                headers.push('L' + l + ' Attempts');
            }
            headers.push('Completion Date');

            const rows = [...ailabScores]
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map(s => {
                    const name = s.displayName || rosterMembers.find(m => m.uid === s.uid)?.displayName || 'Student';
                    const cols = [
                        '"' + name.replace(/"/g, '""') + '"',
                        s.score || 0,
                        s.levelsCleared || 0
                    ];

                    for (let l = 1; l <= 8; l++) {
                        cols.push(s['l' + l + '_attempts'] || s['level_' + l + '_attempts'] || 0);
                    }

                    let ts = '';
                    if (s.timestamp) {
                        const d = s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
                        ts = d.toISOString();
                    }
                    cols.push(ts);

                    return cols.join(',');
                });

            const csv = headers.join(',') + '\n' + rows.join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const cls = handlerClasses.find(c => c.id === selectedClassId);
            const className = cls ? cls.name.replace(/[^a-zA-Z0-9]/g, '_') : 'class';
            a.download = 'AI_Exploit_Lab_' + className + '_' + new Date().toISOString().split('T')[0] + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('AI Lab CSV exported');
        }
