/**
 * InstructorDashboard.js - Instructor Module for Hexworth Prime Dashboard
 *
 * Provides handler/instructor functionality as an embedded tab within the main dashboard.
 * Extracted from handler-dashboard.html for modular integration.
 *
 * Features:
 * - Class management (create, edit, delete)
 * - Student roster viewing
 * - Assignment management
 * - Analytics (completion trends, difficulty charts)
 * - Activity feed
 * - Export functionality (CSV, reports)
 *
 * Usage:
 *   InstructorDashboard.init(containerElement);
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js)
 *   - ClassManager (components/ClassManager.js)
 *   - AssignmentManager (components/AssignmentManager.js)
 *   - ContentRegistry (config/content-registry.js)
 *   - Chart.js (CDN)
 *
 * @version 1.0.0
 */

const InstructorDashboard = (function() {

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    let container = null;
    let initialized = false;
    let handlerClasses = [];
    let selectedClassId = null;
    let classAssignments = [];
    let classProgressData = [];
    let rosterMembers = [];
    let chartInstances = { completion: null, difficulty: null };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async function init(containerEl) {
        if (initialized && container === containerEl) {
            // Already initialized to this container
            return;
        }

        container = containerEl;

        // Inject styles if not already present
        if (!document.getElementById('instructor-dashboard-styles')) {
            injectStyles();
        }

        // Render layout
        render();

        // Load Chart.js if needed
        await loadChartJS();

        // Initialize Firebase and load classes
        try {
            if (typeof FirebaseAuth !== 'undefined') {
                await FirebaseAuth.init();
            }
            if (typeof ClassManager !== 'undefined') {
                await ClassManager.init();
            }
            await loadClasses();
        } catch (error) {
            console.error('[InstructorDashboard] Init error:', error);
            showError('Failed to initialize. Please try again.');
        }

        initialized = true;
    }

    function render() {
        container.innerHTML = `
            <div class="id-layout">
                <!-- LEFT: Class List Sidebar -->
                <aside class="id-sidebar">
                    <div class="id-sidebar-title">My Classes</div>
                    <div class="id-class-list" id="idClassList"></div>
                    <button class="id-new-class-btn" onclick="InstructorDashboard.showCreateModal()">+ New Class</button>
                </aside>

                <!-- CENTER: Main Content -->
                <main class="id-main" id="idMainContent">
                    <!-- Empty State -->
                    <div class="id-empty-state" id="idEmptyState" style="display:none;">
                        <div class="id-empty-sigil">📋</div>
                        <div class="id-empty-title">Welcome, Instructor</div>
                        <div class="id-empty-subtitle">
                            Get started in 3 simple steps:
                        </div>
                        <div class="id-quickstart">
                            <div class="id-quickstart-step">
                                <div class="id-step-num">1</div>
                                <div class="id-step-text"><strong>Create a class</strong> — Click the button below to generate a unique join code</div>
                            </div>
                            <div class="id-quickstart-step">
                                <div class="id-step-num">2</div>
                                <div class="id-step-text"><strong>Share the code</strong> — Give students your HEX-XXXX code to join</div>
                            </div>
                            <div class="id-quickstart-step">
                                <div class="id-step-num">3</div>
                                <div class="id-step-text"><strong>Assign content</strong> — Pick modules, labs, or full learning paths</div>
                            </div>
                        </div>
                        <button class="id-primary-btn" onclick="InstructorDashboard.showCreateModal()">+ Create Your First Class</button>
                    </div>

                    <!-- Home State -->
                    <div class="id-home-state" id="idHomeState">
                        <div class="id-empty-sigil">📋</div>
                        <div class="id-empty-title">Instructor Dashboard</div>
                        <div class="id-empty-subtitle">
                            Select a class from the sidebar to view its roster, assignments, and settings.
                        </div>
                        <div class="id-home-stats" id="idHomeStats"></div>
                    </div>

                    <!-- Class Detail -->
                    <div class="id-class-detail" id="idClassDetail">
                        <div class="id-detail-header">
                            <div class="id-detail-name" id="idDetailName"></div>
                            <div class="id-detail-desc" id="idDetailDesc"></div>
                        </div>

                        <div class="id-stats-grid">
                            <div class="id-stat-card">
                                <div class="id-stat-value" id="idStatEnrolled">0</div>
                                <div class="id-stat-label">Enrolled</div>
                            </div>
                            <div class="id-stat-card">
                                <div class="id-stat-value" id="idStatCompletion">--</div>
                                <div class="id-stat-label">Avg Completion</div>
                            </div>
                            <div class="id-stat-card">
                                <div class="id-stat-value" id="idStatLabs">0</div>
                                <div class="id-stat-label">Total Completions</div>
                            </div>
                            <div class="id-stat-card" id="idAtRiskCard">
                                <div class="id-stat-value" id="idStatAtRisk">0</div>
                                <div class="id-stat-label">At Risk (&lt;40%)</div>
                            </div>
                        </div>

                        <!-- Activity Feed -->
                        <div class="id-section">
                            <div class="id-section-header">
                                <div class="id-section-title">Recent Activity</div>
                                <span class="id-activity-badge" id="idActivityCount">0 events</span>
                            </div>
                            <div class="id-activity-feed" id="idActivityFeed">
                                <div class="id-activity-empty">No activity yet. Student progress will appear here.</div>
                            </div>
                        </div>

                        <!-- Assignments Section -->
                        <div class="id-section">
                            <div class="id-section-header">
                                <div class="id-section-title">Assignments</div>
                                <button class="id-small-btn" onclick="InstructorDashboard.openContentBrowser()">+ Assign Content</button>
                            </div>
                            <div id="idAssignmentsList">
                                <div class="id-assignment-empty">
                                    No assignments yet. Click "+ Assign Content" to get started.
                                </div>
                            </div>
                        </div>

                        <!-- Roster Section -->
                        <div class="id-section">
                            <div class="id-section-header">
                                <div class="id-section-title">Student Roster</div>
                            </div>
                            <div id="idRosterContent">
                                <div class="id-roster-empty">
                                    <span class="id-roster-empty-icon">👥</span>
                                    <span>No students yet. Share the class code to invite students.</span>
                                </div>
                            </div>
                        </div>

                        <!-- Analytics Section -->
                        <div class="id-section" id="idAnalyticsSection">
                            <div class="id-section-header">
                                <div class="id-section-title">Analytics</div>
                            </div>
                            <div class="id-analytics-grid">
                                <div class="id-analytics-card">
                                    <div class="id-analytics-title">Completion Trend</div>
                                    <canvas id="idCompletionChart"></canvas>
                                </div>
                                <div class="id-analytics-card">
                                    <div class="id-analytics-title">Assignment Difficulty</div>
                                    <canvas id="idDifficultyChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- RIGHT: Class Settings Panel -->
                <aside class="id-right" id="idRightPanel">
                    <div class="id-right-section">
                        <div class="id-right-label">Class Code</div>
                        <div class="id-code-display" id="idClassCode">---</div>
                        <button class="id-copy-btn" id="idCopyCodeBtn" onclick="InstructorDashboard.copyClassCode()">Copy Code</button>
                    </div>

                    <div class="id-right-section">
                        <div class="id-right-label">Export</div>
                        <button class="id-settings-btn" onclick="InstructorDashboard.exportRosterCSV()">Export Roster (CSV)</button>
                        <button class="id-settings-btn" onclick="InstructorDashboard.exportGradesCSV()">Export Grades (CSV)</button>
                    </div>

                    <div class="id-right-section">
                        <div class="id-right-label">Class Settings</div>
                        <button class="id-settings-btn" onclick="InstructorDashboard.showEditModal()">Edit Class</button>
                        <button class="id-settings-btn id-danger" onclick="InstructorDashboard.showDeleteModal()">Delete Class</button>
                    </div>
                </aside>
            </div>

            <!-- Toast -->
            <div class="id-toast" id="idToast"></div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // CLASS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    async function loadClasses() {
        const user = typeof FirebaseAuth !== 'undefined' ? FirebaseAuth.getUser() : null;
        if (!user) {
            showError('Please sign in to manage classes.');
            return;
        }

        try {
            handlerClasses = await ClassManager.getHandlerClasses(user.uid);
            renderClassList();

            if (handlerClasses.length === 0) {
                showEmptyState();
            } else if (selectedClassId && handlerClasses.find(c => c.id === selectedClassId)) {
                selectClass(selectedClassId);
            } else {
                showHomeState();
            }
        } catch (error) {
            console.error('[InstructorDashboard] Failed to load classes:', error);
            showError('Failed to load classes.');
        }
    }

    function renderClassList() {
        const list = container.querySelector('#idClassList');
        if (!list) return;

        list.innerHTML = handlerClasses.map(cls => `
            <div class="id-class-item ${cls.id === selectedClassId ? 'active' : ''}"
                 onclick="InstructorDashboard.selectClass('${cls.id}')">
                <span class="id-class-name">${escapeHtml(cls.name)}</span>
                <span class="id-class-count">${cls.memberCount || 0}</span>
            </div>
        `).join('');
    }

    function selectClass(classId) {
        selectedClassId = classId;
        const cls = handlerClasses.find(c => c.id === classId);
        if (!cls) return;

        renderClassList();

        // Hide empty/home state, show detail
        const emptyState = container.querySelector('#idEmptyState');
        const homeState = container.querySelector('#idHomeState');
        const detail = container.querySelector('#idClassDetail');
        const rightPanel = container.querySelector('#idRightPanel');

        if (emptyState) emptyState.style.display = 'none';
        if (homeState) homeState.style.display = 'none';
        if (detail) detail.style.display = 'block';
        if (rightPanel) rightPanel.style.display = 'block';

        // Populate detail
        const nameEl = container.querySelector('#idDetailName');
        const descEl = container.querySelector('#idDetailDesc');
        const enrolledEl = container.querySelector('#idStatEnrolled');
        const codeEl = container.querySelector('#idClassCode');

        if (nameEl) nameEl.textContent = cls.name;
        if (descEl) descEl.textContent = cls.description || '';
        if (enrolledEl) enrolledEl.textContent = cls.memberCount || 0;
        if (codeEl) codeEl.textContent = cls.classCode;

        // Load data
        loadAssignments(classId);
        loadRoster(classId);
        loadClassProgress(classId);
    }

    function showEmptyState() {
        const emptyState = container.querySelector('#idEmptyState');
        const homeState = container.querySelector('#idHomeState');
        const detail = container.querySelector('#idClassDetail');
        const rightPanel = container.querySelector('#idRightPanel');

        if (emptyState) emptyState.style.display = 'flex';
        if (homeState) homeState.style.display = 'none';
        if (detail) detail.style.display = 'none';
        if (rightPanel) rightPanel.style.display = 'none';
        selectedClassId = null;
    }

    function showHomeState() {
        const emptyState = container.querySelector('#idEmptyState');
        const homeState = container.querySelector('#idHomeState');
        const detail = container.querySelector('#idClassDetail');
        const rightPanel = container.querySelector('#idRightPanel');

        if (emptyState) emptyState.style.display = 'none';
        if (homeState) homeState.style.display = 'flex';
        if (detail) detail.style.display = 'none';
        if (rightPanel) rightPanel.style.display = 'none';
        selectedClassId = null;

        // Update home stats
        const totalStudents = handlerClasses.reduce((sum, c) => sum + (c.memberCount || 0), 0);
        const statsEl = container.querySelector('#idHomeStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="id-home-stat">
                    <div class="id-home-stat-value">${handlerClasses.length}</div>
                    <div class="id-home-stat-label">Classes</div>
                </div>
                <div class="id-home-stat">
                    <div class="id-home-stat-value">${totalStudents}</div>
                    <div class="id-home-stat-label">Total Students</div>
                </div>
            `;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CREATE CLASS
    // ═══════════════════════════════════════════════════════════════

    function showCreateModal() {
        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idCreateModal';
        overlay.innerHTML = `
            <div class="id-modal">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idCreateModal')">&times;</button>
                <div id="idCreateForm">
                    <div class="id-modal-title">+ Create New Class</div>
                    <div class="id-input-group">
                        <label class="id-input-label">Class Name *</label>
                        <input type="text" class="id-input" id="idCreateName" placeholder="e.g. CIS 101 - Fall 2026" maxlength="60">
                    </div>
                    <div class="id-input-group">
                        <label class="id-input-label">Description</label>
                        <textarea class="id-input" id="idCreateDesc" placeholder="Optional description..." maxlength="200"></textarea>
                    </div>
                    <div class="id-error" id="idCreateError"></div>
                    <div class="id-modal-actions">
                        <button class="id-secondary-btn" onclick="InstructorDashboard.closeModal('idCreateModal')">Cancel</button>
                        <button class="id-primary-btn" id="idCreateSubmitBtn" onclick="InstructorDashboard.submitCreateClass()">Create Class</button>
                    </div>
                </div>
                <div id="idCreateSuccess" style="display:none">
                    <div class="id-success-content">
                        <div class="id-success-icon">📋</div>
                        <div class="id-success-msg">Class created successfully!</div>
                        <div class="id-success-code" id="idNewClassCode"></div>
                        <button class="id-copy-btn" onclick="InstructorDashboard.copyNewCode()" id="idCopyNewCodeBtn">Copy Code</button>
                        <div class="id-modal-actions">
                            <button class="id-primary-btn" onclick="InstructorDashboard.closeModal('idCreateModal')">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idCreateModal');
        });
        setTimeout(() => document.getElementById('idCreateName')?.focus(), 100);
    }

    async function submitCreateClass() {
        const nameInput = document.getElementById('idCreateName');
        const descInput = document.getElementById('idCreateDesc');
        const errorEl = document.getElementById('idCreateError');
        const submitBtn = document.getElementById('idCreateSubmitBtn');

        const name = nameInput?.value.trim();
        if (!name) {
            if (errorEl) {
                errorEl.textContent = 'Class name is required.';
                errorEl.style.display = 'block';
            }
            nameInput?.focus();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="id-spinner"></span>';
        }
        if (errorEl) errorEl.style.display = 'none';

        try {
            const result = await ClassManager.createClass({
                name: name,
                description: descInput?.value.trim() || ''
            });

            // Show success
            const form = document.getElementById('idCreateForm');
            const success = document.getElementById('idCreateSuccess');
            const codeEl = document.getElementById('idNewClassCode');

            if (form) form.style.display = 'none';
            if (success) success.style.display = 'block';
            if (codeEl) codeEl.textContent = result.classCode;

            selectedClassId = result.classId;
            await loadClasses();

        } catch (error) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Class';
            }
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to create class.';
                errorEl.style.display = 'block';
            }
        }
    }

    function copyNewCode() {
        const code = document.getElementById('idNewClassCode')?.textContent;
        if (code) copyToClipboard(code, 'idCopyNewCodeBtn');
    }

    // ═══════════════════════════════════════════════════════════════
    // EDIT CLASS
    // ═══════════════════════════════════════════════════════════════

    function showEditModal() {
        const cls = handlerClasses.find(c => c.id === selectedClassId);
        if (!cls) return;

        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idEditModal';
        overlay.innerHTML = `
            <div class="id-modal">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idEditModal')">&times;</button>
                <div class="id-modal-title">Edit Class</div>
                <div class="id-input-group">
                    <label class="id-input-label">Class Name *</label>
                    <input type="text" class="id-input" id="idEditName" value="${escapeAttr(cls.name)}" maxlength="60">
                </div>
                <div class="id-input-group">
                    <label class="id-input-label">Description</label>
                    <textarea class="id-input" id="idEditDesc" maxlength="200">${escapeHtml(cls.description || '')}</textarea>
                </div>
                <div class="id-error" id="idEditError"></div>
                <div class="id-modal-actions">
                    <button class="id-secondary-btn" onclick="InstructorDashboard.closeModal('idEditModal')">Cancel</button>
                    <button class="id-primary-btn" id="idEditSubmitBtn" onclick="InstructorDashboard.submitEditClass()">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idEditModal');
        });
        setTimeout(() => document.getElementById('idEditName')?.focus(), 100);
    }

    async function submitEditClass() {
        const nameInput = document.getElementById('idEditName');
        const descInput = document.getElementById('idEditDesc');
        const errorEl = document.getElementById('idEditError');
        const submitBtn = document.getElementById('idEditSubmitBtn');

        const name = nameInput?.value.trim();
        if (!name) {
            if (errorEl) {
                errorEl.textContent = 'Class name is required.';
                errorEl.style.display = 'block';
            }
            nameInput?.focus();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="id-spinner"></span>';
        }
        if (errorEl) errorEl.style.display = 'none';

        try {
            await ClassManager.updateClass(selectedClassId, {
                name: name,
                description: descInput?.value.trim() || ''
            });

            closeModal('idEditModal');
            await loadClasses();
            showToast('Class updated');

        } catch (error) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to update class.';
                errorEl.style.display = 'block';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DELETE CLASS
    // ═══════════════════════════════════════════════════════════════

    function showDeleteModal() {
        const cls = handlerClasses.find(c => c.id === selectedClassId);
        if (!cls) return;

        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idDeleteModal';
        overlay.innerHTML = `
            <div class="id-modal">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idDeleteModal')">&times;</button>
                <div class="id-modal-title id-danger-title">Delete Class</div>
                <div class="id-delete-warning">
                    Are you sure you want to delete <strong>${escapeHtml(cls.name)}</strong>?
                    This will remove the class and its code. Students will no longer be able to join.
                </div>
                <div class="id-error" id="idDeleteError"></div>
                <div class="id-modal-actions">
                    <button class="id-secondary-btn" onclick="InstructorDashboard.closeModal('idDeleteModal')">Cancel</button>
                    <button class="id-danger-btn" id="idDeleteSubmitBtn" onclick="InstructorDashboard.submitDeleteClass()">Delete Class</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idDeleteModal');
        });
    }

    async function submitDeleteClass() {
        const errorEl = document.getElementById('idDeleteError');
        const submitBtn = document.getElementById('idDeleteSubmitBtn');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="id-spinner"></span>';
        }
        if (errorEl) errorEl.style.display = 'none';

        try {
            await ClassManager.deleteClass(selectedClassId);
            closeModal('idDeleteModal');
            selectedClassId = null;
            await loadClasses();
            showToast('Class deleted');

        } catch (error) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Delete Class';
            }
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to delete class.';
                errorEl.style.display = 'block';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ROSTER
    // ═══════════════════════════════════════════════════════════════

    async function loadRoster(classId) {
        try {
            rosterMembers = await ClassManager.getClassMembers(classId);
            renderRoster();
        } catch (error) {
            console.error('Failed to load roster:', error);
            rosterMembers = [];
            renderRoster();
        }
    }

    function renderRoster() {
        const rosterEl = container.querySelector('#idRosterContent');
        if (!rosterEl) return;

        if (rosterMembers.length === 0) {
            rosterEl.innerHTML = `
                <div class="id-roster-empty">
                    <span class="id-roster-empty-icon">👥</span>
                    <span>No students yet. Share the class code to invite students.</span>
                </div>
            `;
            return;
        }

        rosterEl.innerHTML = `
            <table class="id-roster-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    ${rosterMembers.map(m => {
                        const name = m.displayName || m.email?.split('@')[0] || 'Student';
                        const email = m.email || '—';
                        const joined = m.joinedAt ? formatDate(m.joinedAt) : '—';
                        const progress = calculateStudentProgress(m.uid);
                        return `
                            <tr>
                                <td>${escapeHtml(name)}</td>
                                <td>${escapeHtml(email)}</td>
                                <td>${joined}</td>
                                <td><span class="id-progress-badge">${progress}%</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    function calculateStudentProgress(uid) {
        const studentData = classProgressData.find(p => p.uid === uid);
        if (!studentData || !studentData.completions) return 0;

        const completions = Object.values(studentData.completions);
        if (completions.length === 0) return 0;

        const completed = completions.filter(c => c.completed).length;
        return Math.round((completed / classAssignments.length) * 100) || 0;
    }

    // ═══════════════════════════════════════════════════════════════
    // ASSIGNMENTS
    // ═══════════════════════════════════════════════════════════════

    async function loadAssignments(classId) {
        try {
            if (typeof AssignmentManager !== 'undefined') {
                await AssignmentManager.init();
                classAssignments = await AssignmentManager.getClassAssignments(classId);
            } else {
                classAssignments = [];
            }
            renderAssignments();
        } catch (error) {
            console.error('Failed to load assignments:', error);
            classAssignments = [];
            renderAssignments();
        }
    }

    function renderAssignments() {
        const listEl = container.querySelector('#idAssignmentsList');
        if (!listEl) return;

        if (classAssignments.length === 0) {
            listEl.innerHTML = `
                <div class="id-assignment-empty">
                    No assignments yet. Click "+ Assign Content" to get started.
                </div>
            `;
            return;
        }

        listEl.innerHTML = classAssignments.map(a => {
            const icon = a.assignmentType === 'path' ? '📚' : '📄';
            const badge = a.assignmentType === 'path' ? 'Learning Path' : (a.contentType || 'Module');

            return `
                <div class="id-assignment-card">
                    <span class="id-assignment-icon">${icon}</span>
                    <div class="id-assignment-info">
                        <div class="id-assignment-name">${escapeHtml(a.title)}</div>
                        <div class="id-assignment-meta">
                            <span class="id-badge">${badge}</span>
                            ${a.dueDate ? `<span>Due: ${formatDate(a.dueDate)}</span>` : ''}
                        </div>
                    </div>
                    <button class="id-assignment-delete" onclick="InstructorDashboard.removeAssignment('${a.id}')" title="Remove">&times;</button>
                </div>
            `;
        }).join('');
    }

    async function removeAssignment(assignmentId) {
        if (!confirm('Remove this assignment?')) return;

        try {
            await AssignmentManager.deleteAssignment(selectedClassId, assignmentId);
            classAssignments = classAssignments.filter(a => a.id !== assignmentId);
            renderAssignments();
            showToast('Assignment removed');
        } catch (error) {
            showToast('Failed to remove assignment');
        }
    }

    function openContentBrowser() {
        // Simplified content browser - shows available paths and modules
        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idContentBrowser';

        // Get available content from ContentRegistry
        const paths = typeof ContentRegistry !== 'undefined' ? Object.values(ContentRegistry.paths || {}) : [];

        overlay.innerHTML = `
            <div class="id-modal id-modal-lg">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idContentBrowser')">&times;</button>
                <div class="id-modal-title">Assign Content</div>
                <div class="id-content-browser">
                    <div class="id-cb-section-title">Learning Paths</div>
                    <div class="id-cb-grid">
                        ${paths.map(p => `
                            <div class="id-cb-card" onclick="InstructorDashboard.assignContent('path', '${p.id}', '${escapeAttr(p.title)}')">
                                <span class="id-cb-icon">${p.icon}</span>
                                <div class="id-cb-info">
                                    <div class="id-cb-name">${escapeHtml(p.title)}</div>
                                    <div class="id-cb-meta">${p.modules?.length || 0} modules</div>
                                </div>
                            </div>
                        `).join('') || '<p class="id-cb-empty">No content available</p>'}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idContentBrowser');
        });
    }

    async function assignContent(type, contentId, title) {
        try {
            await AssignmentManager.createAssignment(selectedClassId, {
                assignmentType: type,
                contentId: contentId,
                title: title
            });

            closeModal('idContentBrowser');
            await loadAssignments(selectedClassId);
            showToast('Content assigned');
        } catch (error) {
            showToast('Failed to assign content');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PROGRESS & ANALYTICS
    // ═══════════════════════════════════════════════════════════════

    async function loadClassProgress(classId) {
        try {
            if (typeof AssignmentManager !== 'undefined') {
                classProgressData = await AssignmentManager.getClassProgress(classId);
            } else {
                classProgressData = [];
            }
            updateCompletionStats();
            renderActivityFeed();
            renderAnalytics();
        } catch (error) {
            console.error('Failed to load progress:', error);
            classProgressData = [];
        }
    }

    function updateCompletionStats() {
        const enrolled = rosterMembers.length;
        const enrolledEl = container.querySelector('#idStatEnrolled');
        if (enrolledEl) enrolledEl.textContent = enrolled;

        if (enrolled === 0 || classAssignments.length === 0) {
            const compEl = container.querySelector('#idStatCompletion');
            const labsEl = container.querySelector('#idStatLabs');
            const riskEl = container.querySelector('#idStatAtRisk');
            if (compEl) compEl.textContent = '--';
            if (labsEl) labsEl.textContent = '0';
            if (riskEl) riskEl.textContent = '0';
            return;
        }

        let totalCompletions = 0;
        let atRiskCount = 0;

        for (const student of classProgressData) {
            const completions = student.completions ? Object.values(student.completions) : [];
            const completed = completions.filter(c => c.completed).length;
            totalCompletions += completed;

            const percent = (completed / classAssignments.length) * 100;
            if (percent < 40) atRiskCount++;
        }

        const avgCompletion = Math.round((totalCompletions / (enrolled * classAssignments.length)) * 100);

        const compEl = container.querySelector('#idStatCompletion');
        const labsEl = container.querySelector('#idStatLabs');
        const riskEl = container.querySelector('#idStatAtRisk');
        const riskCard = container.querySelector('#idAtRiskCard');

        if (compEl) compEl.textContent = `${avgCompletion}%`;
        if (labsEl) labsEl.textContent = totalCompletions;
        if (riskEl) riskEl.textContent = atRiskCount;
        if (riskCard) {
            riskCard.classList.toggle('id-at-risk', atRiskCount > 0);
        }
    }

    function renderActivityFeed() {
        const feed = container.querySelector('#idActivityFeed');
        const countBadge = container.querySelector('#idActivityCount');
        if (!feed) return;

        // Build activity events
        const events = [];

        for (const student of classProgressData) {
            const name = student.displayName || student.email?.split('@')[0] || 'Student';
            const completions = student.completions || {};

            for (const [contentId, data] of Object.entries(completions)) {
                if (data.completed && data.completedAt) {
                    events.push({
                        icon: '✅',
                        text: `${name} completed ${data.title || contentId}`,
                        time: data.completedAt
                    });
                }
            }
        }

        // Sort by time, newest first
        events.sort((a, b) => {
            const timeA = a.time?.toDate ? a.time.toDate() : new Date(a.time);
            const timeB = b.time?.toDate ? b.time.toDate() : new Date(b.time);
            return timeB - timeA;
        });

        if (countBadge) countBadge.textContent = `${events.length} events`;

        if (events.length === 0) {
            feed.innerHTML = '<div class="id-activity-empty">No activity yet.</div>';
            return;
        }

        feed.innerHTML = events.slice(0, 10).map(e => `
            <div class="id-activity-item">
                <span class="id-activity-icon">${e.icon}</span>
                <div class="id-activity-content">
                    <div class="id-activity-text">${escapeHtml(e.text)}</div>
                    <div class="id-activity-time">${formatTimeAgo(e.time)}</div>
                </div>
            </div>
        `).join('');
    }

    function renderAnalytics() {
        // Render charts if Chart.js is loaded
        if (typeof Chart === 'undefined') return;

        renderCompletionChart();
        renderDifficultyChart();
    }

    function renderCompletionChart() {
        const canvas = container.querySelector('#idCompletionChart');
        if (!canvas) return;

        if (chartInstances.completion) {
            chartInstances.completion.destroy();
        }

        // Simple completion data by week
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const data = [10, 25, 45, 65]; // Placeholder trend data

        chartInstances.completion = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completion %',
                    data: data,
                    borderColor: '#d4a017',
                    backgroundColor: 'rgba(212, 160, 23, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                    x: { grid: { display: false }, ticks: { color: '#666' } }
                }
            }
        });
    }

    function renderDifficultyChart() {
        const canvas = container.querySelector('#idDifficultyChart');
        if (!canvas) return;

        if (chartInstances.difficulty) {
            chartInstances.difficulty.destroy();
        }

        // Placeholder difficulty distribution
        const labels = ['Easy', 'Medium', 'Hard'];
        const data = [4, 3, 2];

        chartInstances.difficulty = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Assignments',
                    data: data,
                    backgroundColor: ['#4ade80', '#fbbf24', '#f87171']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                    x: { grid: { display: false }, ticks: { color: '#666' } }
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════

    function exportRosterCSV() {
        if (rosterMembers.length === 0) {
            showToast('No students to export');
            return;
        }

        const headers = ['Name', 'Email', 'Joined'];
        const rows = rosterMembers.map(m => [
            m.displayName || m.email?.split('@')[0] || '',
            m.email || '',
            m.joinedAt ? formatDate(m.joinedAt) : ''
        ]);

        downloadCSV('roster', headers, rows);
    }

    function exportGradesCSV() {
        if (rosterMembers.length === 0) {
            showToast('No students to export');
            return;
        }

        const headers = ['Name', 'Email', 'Progress %'];
        const rows = rosterMembers.map(m => {
            const progress = calculateStudentProgress(m.uid);
            return [
                m.displayName || m.email?.split('@')[0] || '',
                m.email || '',
                progress
            ];
        });

        downloadCSV('grades', headers, rows);
    }

    function downloadCSV(filename, headers, rows) {
        const cls = handlerClasses.find(c => c.id === selectedClassId);
        const className = cls ? cls.name.replace(/[^a-z0-9]/gi, '-') : 'class';
        const fullFilename = `${className}-${filename}-${new Date().toISOString().split('T')[0]}.csv`;

        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fullFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Exported ' + filename);
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    function closeModal(id) {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        overlay.classList.add('id-fade-out');
        setTimeout(() => overlay.remove(), 250);
    }

    function copyClassCode() {
        const code = container.querySelector('#idClassCode')?.textContent;
        if (code) copyToClipboard(code, 'idCopyCodeBtn');
    }

    function copyToClipboard(text, btnId) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy Code', 2000);
            }
        }).catch(() => {
            showToast('Failed to copy');
        });
    }

    function showToast(message) {
        const toast = container.querySelector('#idToast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function showError(message) {
        if (!container) return;
        container.innerHTML = `<div class="id-error-state">${escapeHtml(message)}</div>`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatDate(timestamp) {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatTimeAgo(timestamp) {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return formatDate(timestamp);
    }

    async function loadChartJS() {
        if (typeof Chart !== 'undefined') return;

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
            script.onload = resolve;
            script.onerror = resolve; // Continue even if Chart.js fails
            document.head.appendChild(script);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'instructor-dashboard-styles';
        style.textContent = getStyles();
        document.head.appendChild(style);
    }

    function getStyles() {
        return `
            /* InstructorDashboard - Embedded Styles */

            :root {
                --id-gold: #d4a017;
                --id-gold-bright: #e6b422;
                --id-gold-dark: #b8860b;
                --id-gold-subtle: rgba(212, 160, 23, 0.15);
                --id-gold-border: rgba(212, 160, 23, 0.25);
                --id-danger: #f85149;
                --id-bg: #0a0a1a;
                --id-card-bg: #12122a;
                --id-text: #e0e0e0;
                --id-text-muted: #888;
            }

            .id-layout {
                display: grid;
                grid-template-columns: 250px 1fr 260px;
                min-height: 600px;
                background: var(--id-bg);
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--id-gold-border);
            }

            /* Sidebar */
            .id-sidebar {
                background: var(--id-card-bg);
                border-right: 1px solid var(--id-gold-border);
                padding: 20px 0;
                display: flex;
                flex-direction: column;
            }

            .id-sidebar-title {
                font-size: 0.7rem;
                font-weight: 700;
                color: var(--id-gold);
                letter-spacing: 1.5px;
                text-transform: uppercase;
                padding: 0 20px 12px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                margin-bottom: 8px;
            }

            .id-class-list {
                flex: 1;
                overflow-y: auto;
                padding: 0 10px;
            }

            .id-class-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 14px;
                margin-bottom: 4px;
                border-radius: 8px;
                cursor: pointer;
                border-left: 3px solid transparent;
                transition: all 0.2s;
            }

            .id-class-item:hover {
                background: var(--id-gold-subtle);
            }

            .id-class-item.active {
                background: var(--id-gold-subtle);
                border-left-color: var(--id-gold);
            }

            .id-class-name {
                font-size: 0.85rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 160px;
            }

            .id-class-count {
                font-size: 0.7rem;
                color: var(--id-text-muted);
                background: rgba(255,255,255,0.05);
                padding: 2px 8px;
                border-radius: 10px;
            }

            .id-new-class-btn {
                margin: 12px 16px 0;
                padding: 12px;
                background: transparent;
                border: 1px dashed var(--id-gold-border);
                border-radius: 8px;
                color: var(--id-gold);
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .id-new-class-btn:hover {
                background: var(--id-gold-subtle);
                border-color: var(--id-gold);
            }

            /* Main Content */
            .id-main {
                padding: 24px;
                overflow-y: auto;
            }

            .id-empty-state, .id-home-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 60px 30px;
            }

            .id-empty-sigil {
                font-size: 3rem;
                margin-bottom: 20px;
                filter: drop-shadow(0 0 12px rgba(212, 160, 23, 0.4));
            }

            .id-empty-title {
                font-size: 1.4rem;
                font-weight: 600;
                color: var(--id-gold);
                margin-bottom: 10px;
            }

            .id-empty-subtitle {
                font-size: 0.9rem;
                color: var(--id-text-muted);
                max-width: 400px;
                line-height: 1.6;
                margin-bottom: 20px;
            }

            .id-quickstart {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 30px;
                text-align: left;
                max-width: 400px;
            }

            .id-quickstart-step {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                background: var(--id-gold-subtle);
                border: 1px solid var(--id-gold-border);
                border-radius: 8px;
                padding: 12px 15px;
            }

            .id-step-num {
                width: 24px;
                height: 24px;
                background: var(--id-gold);
                color: #000;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.8rem;
                flex-shrink: 0;
            }

            .id-step-text {
                font-size: 0.85rem;
                color: var(--id-text);
                line-height: 1.5;
            }

            .id-step-text strong {
                color: var(--id-gold);
            }

            .id-home-stats {
                display: flex;
                gap: 20px;
                margin-top: 20px;
            }

            .id-home-stat {
                background: var(--id-gold-subtle);
                border: 1px solid var(--id-gold-border);
                border-radius: 10px;
                padding: 20px 30px;
                text-align: center;
            }

            .id-home-stat-value {
                font-size: 1.8rem;
                font-weight: 700;
                color: var(--id-gold);
            }

            .id-home-stat-label {
                font-size: 0.75rem;
                color: var(--id-text-muted);
                text-transform: uppercase;
            }

            /* Class Detail */
            .id-class-detail {
                display: none;
            }

            .id-detail-header {
                margin-bottom: 24px;
            }

            .id-detail-name {
                font-size: 1.3rem;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .id-detail-desc {
                font-size: 0.85rem;
                color: var(--id-text-muted);
            }

            /* Stats Grid */
            .id-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 30px;
            }

            .id-stat-card {
                background: var(--id-card-bg);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 10px;
                padding: 18px;
                text-align: center;
            }

            .id-stat-value {
                font-size: 1.6rem;
                font-weight: 700;
                color: var(--id-gold);
            }

            .id-stat-label {
                font-size: 0.7rem;
                color: var(--id-text-muted);
                text-transform: uppercase;
            }

            .id-stat-card.id-at-risk {
                border-color: rgba(248, 113, 113, 0.3);
                background: rgba(248, 113, 113, 0.05);
            }

            .id-stat-card.id-at-risk .id-stat-value {
                color: #f87171;
            }

            /* Sections */
            .id-section {
                background: var(--id-card-bg);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 10px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .id-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .id-section-title {
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .id-activity-badge {
                font-size: 0.65rem;
                background: var(--id-gold);
                color: #000;
                padding: 2px 8px;
                border-radius: 10px;
                font-weight: 700;
            }

            /* Activity Feed */
            .id-activity-feed {
                max-height: 200px;
                overflow-y: auto;
            }

            .id-activity-item {
                display: flex;
                gap: 10px;
                padding: 10px;
                background: rgba(255,255,255,0.02);
                border-radius: 6px;
                margin-bottom: 8px;
            }

            .id-activity-icon {
                font-size: 1rem;
                flex-shrink: 0;
            }

            .id-activity-content {
                flex: 1;
            }

            .id-activity-text {
                font-size: 0.8rem;
                color: var(--id-text);
            }

            .id-activity-time {
                font-size: 0.7rem;
                color: var(--id-text-muted);
                margin-top: 2px;
            }

            .id-activity-empty {
                text-align: center;
                padding: 20px;
                color: var(--id-text-muted);
                font-size: 0.85rem;
            }

            /* Assignments */
            .id-assignment-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px;
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 8px;
                margin-bottom: 8px;
                position: relative;
            }

            .id-assignment-icon {
                font-size: 1.2rem;
            }

            .id-assignment-info {
                flex: 1;
            }

            .id-assignment-name {
                font-size: 0.9rem;
                font-weight: 500;
                margin-bottom: 4px;
            }

            .id-assignment-meta {
                display: flex;
                gap: 10px;
                font-size: 0.7rem;
                color: var(--id-text-muted);
            }

            .id-badge {
                background: var(--id-gold-subtle);
                color: var(--id-gold);
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.6rem;
            }

            .id-assignment-delete {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: #555;
                font-size: 16px;
                cursor: pointer;
                padding: 2px 6px;
            }

            .id-assignment-delete:hover {
                color: var(--id-danger);
            }

            .id-assignment-empty {
                text-align: center;
                padding: 30px;
                color: var(--id-text-muted);
                font-size: 0.85rem;
                border: 1px dashed rgba(255,255,255,0.1);
                border-radius: 8px;
            }

            /* Roster */
            .id-roster-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                padding: 30px;
                color: var(--id-text-muted);
            }

            .id-roster-empty-icon {
                font-size: 2rem;
            }

            .id-roster-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
            }

            .id-roster-table th {
                text-align: left;
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 0.7rem;
                text-transform: uppercase;
                color: var(--id-text-muted);
            }

            .id-roster-table td {
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            .id-progress-badge {
                background: var(--id-gold-subtle);
                color: var(--id-gold);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            /* Analytics */
            .id-analytics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .id-analytics-card {
                background: rgba(255,255,255,0.02);
                border-radius: 8px;
                padding: 16px;
            }

            .id-analytics-title {
                font-size: 0.75rem;
                color: var(--id-text-muted);
                margin-bottom: 12px;
            }

            .id-analytics-card canvas {
                max-height: 150px;
            }

            /* Right Panel */
            .id-right {
                display: none;
                background: var(--id-card-bg);
                border-left: 1px solid var(--id-gold-border);
                padding: 20px;
            }

            .id-right-section {
                margin-bottom: 24px;
            }

            .id-right-label {
                font-size: 0.65rem;
                font-weight: 700;
                color: var(--id-gold);
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }

            .id-code-display {
                font-family: 'SF Mono', Monaco, Consolas, monospace;
                font-size: 1.4rem;
                font-weight: 700;
                color: var(--id-gold);
                letter-spacing: 2px;
                text-align: center;
                padding: 15px;
                background: rgba(212, 160, 23, 0.1);
                border: 1px solid var(--id-gold-border);
                border-radius: 8px;
                margin-bottom: 10px;
            }

            .id-copy-btn, .id-settings-btn {
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                border-radius: 6px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .id-copy-btn {
                background: linear-gradient(135deg, var(--id-gold), var(--id-gold-dark));
                color: #000;
                border: none;
                font-weight: 600;
            }

            .id-copy-btn:hover {
                box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3);
            }

            .id-settings-btn {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.1);
                color: var(--id-text-muted);
            }

            .id-settings-btn:hover {
                border-color: var(--id-gold);
                color: var(--id-gold);
            }

            .id-settings-btn.id-danger {
                border-color: var(--id-danger);
                color: var(--id-danger);
            }

            .id-settings-btn.id-danger:hover {
                background: rgba(248, 81, 73, 0.1);
            }

            /* Buttons */
            .id-primary-btn {
                padding: 14px 28px;
                background: linear-gradient(135deg, var(--id-gold), var(--id-gold-dark));
                color: #000;
                border: none;
                border-radius: 8px;
                font-size: 0.95rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
            }

            .id-primary-btn:hover {
                box-shadow: 0 4px 20px rgba(212, 160, 23, 0.4);
            }

            .id-primary-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .id-secondary-btn {
                padding: 12px 20px;
                background: transparent;
                border: 1px solid rgba(255,255,255,0.15);
                color: var(--id-text-muted);
                border-radius: 6px;
                font-size: 0.85rem;
                cursor: pointer;
            }

            .id-secondary-btn:hover {
                border-color: rgba(255,255,255,0.3);
                color: var(--id-text);
            }

            .id-danger-btn {
                padding: 12px 20px;
                background: transparent;
                border: 1px solid var(--id-danger);
                color: var(--id-danger);
                border-radius: 6px;
                font-size: 0.85rem;
                cursor: pointer;
            }

            .id-danger-btn:hover {
                background: rgba(248, 81, 73, 0.15);
            }

            .id-small-btn {
                padding: 8px 14px;
                background: linear-gradient(135deg, var(--id-gold), var(--id-gold-dark));
                color: #000;
                border: none;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
            }

            /* Modal */
            .id-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                backdrop-filter: blur(6px);
                animation: idFadeIn 0.25s ease;
            }

            @keyframes idFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .id-overlay.id-fade-out {
                opacity: 0;
                transition: opacity 0.25s ease;
            }

            .id-modal {
                background: var(--id-card-bg);
                border: 1px solid var(--id-gold-border);
                border-radius: 12px;
                padding: 30px;
                width: 90%;
                max-width: 420px;
                position: relative;
            }

            .id-modal.id-modal-lg {
                max-width: 700px;
                max-height: 80vh;
                overflow-y: auto;
            }

            .id-modal-close {
                position: absolute;
                top: 12px;
                right: 15px;
                background: none;
                border: none;
                color: #666;
                font-size: 24px;
                cursor: pointer;
            }

            .id-modal-close:hover {
                color: var(--id-gold);
            }

            .id-modal-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--id-gold);
                margin-bottom: 20px;
            }

            .id-danger-title {
                color: var(--id-danger);
            }

            .id-input-group {
                margin-bottom: 16px;
            }

            .id-input-label {
                display: block;
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--id-text-muted);
                margin-bottom: 6px;
            }

            .id-input {
                width: 100%;
                padding: 12px;
                background: var(--id-bg);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 6px;
                color: var(--id-text);
                font-size: 0.9rem;
            }

            .id-input:focus {
                outline: none;
                border-color: var(--id-gold);
            }

            textarea.id-input {
                resize: vertical;
                min-height: 70px;
            }

            .id-modal-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }

            .id-modal-actions button {
                flex: 1;
            }

            .id-error {
                color: var(--id-danger);
                font-size: 0.8rem;
                margin-top: 8px;
                display: none;
            }

            .id-delete-warning {
                font-size: 0.9rem;
                color: var(--id-text-muted);
                line-height: 1.6;
                margin-bottom: 16px;
            }

            /* Success State */
            .id-success-content {
                text-align: center;
            }

            .id-success-icon {
                font-size: 2rem;
                margin-bottom: 12px;
            }

            .id-success-msg {
                font-size: 0.9rem;
                margin-bottom: 16px;
            }

            .id-success-code {
                font-family: 'SF Mono', Monaco, Consolas, monospace;
                font-size: 2rem;
                font-weight: 700;
                color: var(--id-gold);
                letter-spacing: 3px;
                margin-bottom: 16px;
            }

            /* Content Browser */
            .id-content-browser {
                margin-top: 20px;
            }

            .id-cb-section-title {
                font-size: 0.7rem;
                font-weight: 700;
                color: var(--id-text-muted);
                text-transform: uppercase;
                margin-bottom: 12px;
            }

            .id-cb-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
            }

            .id-cb-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px;
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .id-cb-card:hover {
                border-color: var(--id-gold);
                background: var(--id-gold-subtle);
            }

            .id-cb-icon {
                font-size: 1.5rem;
            }

            .id-cb-name {
                font-size: 0.85rem;
                font-weight: 500;
            }

            .id-cb-meta {
                font-size: 0.7rem;
                color: var(--id-text-muted);
            }

            .id-cb-empty {
                text-align: center;
                padding: 30px;
                color: var(--id-text-muted);
            }

            /* Spinner */
            .id-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(0, 0, 0, 0.2);
                border-top-color: #000;
                border-radius: 50%;
                animation: idSpin 0.6s linear infinite;
            }

            @keyframes idSpin {
                to { transform: rotate(360deg); }
            }

            /* Toast */
            .id-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(80px);
                background: var(--id-card-bg);
                border: 1px solid var(--id-gold-border);
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 0.85rem;
                color: var(--id-gold);
                z-index: 10002;
                transition: transform 0.3s ease;
                pointer-events: none;
            }

            .id-toast.show {
                transform: translateX(-50%) translateY(0);
            }

            /* Error State */
            .id-error-state {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 60px;
                color: var(--id-danger);
                text-align: center;
            }

            /* Responsive */
            @media (max-width: 1000px) {
                .id-layout {
                    grid-template-columns: 200px 1fr;
                }

                .id-right {
                    display: none !important;
                }

                .id-stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .id-analytics-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .id-layout {
                    grid-template-columns: 1fr;
                }

                .id-sidebar {
                    display: none;
                }
            }
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        init: init,
        selectClass: selectClass,
        showCreateModal: showCreateModal,
        submitCreateClass: submitCreateClass,
        copyNewCode: copyNewCode,
        showEditModal: showEditModal,
        submitEditClass: submitEditClass,
        showDeleteModal: showDeleteModal,
        submitDeleteClass: submitDeleteClass,
        closeModal: closeModal,
        copyClassCode: copyClassCode,
        openContentBrowser: openContentBrowser,
        assignContent: assignContent,
        removeAssignment: removeAssignment,
        exportRosterCSV: exportRosterCSV,
        exportGradesCSV: exportGradesCSV
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstructorDashboard;
}
