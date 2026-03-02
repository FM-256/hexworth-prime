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
    let arenaActivity = [];  // arena_complete, arena_flag, arena_hint events
    let chartInstances = { completion: null, difficulty: null, assignment: null };

    // Known CTF boxes (A1-A20) — used for grid columns and assignment dropdown
    const CTF_BOXES = [
        { id: 'hexworth_ctf_a1', label: 'A1', title: 'The Ancient Ledger' },
        { id: 'hexworth_ctf_a2', label: 'A2', title: 'The Whispering Wall' },
        { id: 'hexworth_ctf_a3', label: 'A3', title: 'Phantom Shell' },
        { id: 'hexworth_ctf_a4', label: 'A4', title: 'Lost Root' },
        { id: 'hexworth_ctf_a5', label: 'A5', title: "Custodian's Key" },
        { id: 'hexworth_ctf_a6', label: 'A6', title: 'Broken Cipher' },
        { id: 'hexworth_ctf_a7', label: 'A7', title: 'Hollow Database' },
        { id: 'hexworth_ctf_a8', label: 'A8', title: 'Forgotten Upload' },
        { id: 'hexworth_ctf_a9', label: 'A9', title: 'Rusted Lock' },
        { id: 'hexworth_ctf_a10', label: 'A10', title: 'Glass Tunnel' },
        { id: 'hexworth_ctf_a11', label: 'A11', title: 'Dockerized Vault' },
        { id: 'hexworth_ctf_a12', label: 'A12', title: 'Mobile Scapegoat' },
        { id: 'hexworth_ctf_a13', label: 'A13', title: 'Rogue Sensor' },
        { id: 'hexworth_ctf_a14', label: 'A14', title: 'Ghost Machine' },
        { id: 'hexworth_ctf_a15', label: 'A15', title: 'Spectral Interceptor' },
        { id: 'hexworth_ctf_a16', label: 'A16', title: 'Corrupted Core' },
        { id: 'hexworth_ctf_a17', label: 'A17', title: 'Whisper Campaign' },
        { id: 'hexworth_ctf_a18', label: 'A18', title: 'Ghost RAM' },
        { id: 'hexworth_ctf_a19', label: 'A19', title: "Foundation's Fault" },
        { id: 'hexworth_ctf_a20', label: 'A20', title: 'Project Chimera' }
    ];

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
                        <div class="id-empty-sigil"><img src="/assets/images/icons/icon-clipboard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
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
                        <div class="id-empty-sigil"><img src="/assets/images/icons/icon-clipboard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
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
                                    <span class="id-roster-empty-icon"><img src="/assets/images/icons/icon-users.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></span>
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
                                    <div class="id-chart-empty" id="idCompletionEmpty" style="display:none;">No completion data yet</div>
                                </div>
                                <div class="id-analytics-card">
                                    <div class="id-analytics-title">Assignment Performance</div>
                                    <canvas id="idDifficultyChart"></canvas>
                                    <div class="id-chart-empty" id="idDifficultyEmpty" style="display:none;">No scored assignments yet</div>
                                </div>
                                <div class="id-analytics-card">
                                    <div class="id-analytics-title">Assignment Completion</div>
                                    <canvas id="idAssignmentChart"></canvas>
                                    <div class="id-chart-empty" id="idAssignmentEmpty" style="display:none;">No assignments yet</div>
                                </div>
                            </div>
                        </div>

                        <!-- Arena (CTF) Section -->
                        <div class="id-section" id="idArenaSection" style="display:none;">
                            <div class="id-section-header">
                                <div class="id-section-title">Arena (CTF Boxes)</div>
                                <button class="id-small-btn" onclick="InstructorDashboard.exportArenaCSV()">Export Arena CSV</button>
                            </div>
                            <div id="idArenaLeaderboard"></div>
                            <div id="idArenaGrid" style="margin-top:16px;"></div>
                        </div>

                        <!-- Time on Task Section -->
                        <div class="id-section" id="idTimeOnTaskSection" style="display:none;">
                            <div class="id-section-header">
                                <div class="id-section-title">Time on Task</div>
                            </div>
                            <div id="idTimeOnTaskContent"></div>
                        </div>

                        <!-- Student Detail Modal Container -->
                        <div id="idStudentDetailContainer"></div>
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
                        <button class="id-settings-btn" onclick="InstructorDashboard.exportArenaCSV()">Export Arena (CSV)</button>
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

    async function selectClass(classId) {
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

        // Load roster + assignments first (analytics depend on both)
        await Promise.all([
            loadAssignments(classId),
            loadRoster(classId)
        ]);
        // Now load progress and render analytics (uses rosterMembers + classAssignments)
        await loadClassProgress(classId);
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
                        <div class="id-success-icon"><img src="/assets/images/icons/icon-clipboard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
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
                    <span class="id-roster-empty-icon"><img src="/assets/images/icons/icon-users.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></span>
                    <span>No students yet. Share the class code to invite students.</span>
                </div>
            `;
            return;
        }

        const hasAnonymous = rosterMembers.some(m => m.isAnonymous);
        rosterEl.innerHTML = `
            <table class="id-roster-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Progress</th>
                        ${hasAnonymous ? '<th style="width:40px;"></th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${rosterMembers.map(m => {
                        const name = m.displayName || m.email?.split('@')[0] || 'Student';
                        const email = m.email || '—';
                        const joined = m.joinedAt ? formatDate(m.joinedAt) : '—';
                        const progress = calculateStudentProgress(m.uid);
                        const anonBadge = m.isAnonymous ? ' <span style="color:#f59e0b;font-size:0.7rem;" title="Anonymous">[anon]</span>' : '';
                        const mergeBtn = (hasAnonymous && m.isAnonymous)
                            ? `<td><button class="id-merge-btn" onclick="event.stopPropagation(); InstructorDashboard.showMergeModal('${m.uid}')" title="Merge with another student">&#8644;</button></td>`
                            : (hasAnonymous ? '<td></td>' : '');
                        return `
                            <tr class="id-roster-row" onclick="InstructorDashboard.showStudentDetail('${m.uid}')">
                                <td>${escapeHtml(name)}${anonBadge}</td>
                                <td>${escapeHtml(email)}</td>
                                <td>${joined}</td>
                                <td><span class="id-progress-badge">${progress}%</span></td>
                                ${mergeBtn}
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
            const icon = a.assignmentType === 'path' ? '<img src="/assets/images/icons/icon-books.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' : (a.contentType === 'ctf_box' ? '<img src="/assets/images/icons/icon-scales.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' : '<img src="/assets/images/icons/icon-document.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">');
            const badge = a.assignmentType === 'path' ? 'Learning Path' : (a.contentType === 'ctf_box' ? 'CTF Box' : (a.contentType || 'Module'));

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
                    <div class="id-cb-section-title" style="margin-top:20px;">CTF Boxes</div>
                    <div class="id-cb-grid">
                        <div class="id-cb-card" onclick="InstructorDashboard.closeModal('idContentBrowser'); InstructorDashboard.openArenaAssignModal();">
                            <span class="id-cb-icon"><img src="/assets/images/icons/icon-scales.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                            <div class="id-cb-info">
                                <div class="id-cb-name">Assign CTF Box</div>
                                <div class="id-cb-meta">${CTF_BOXES.length} boxes available</div>
                            </div>
                        </div>
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
            // Load arena activity data
            await loadArenaActivity(classId);
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
                        icon: '<img src="/assets/images/icons/icon-checkbox.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
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
        if (typeof Chart !== 'undefined') {
            renderCompletionChart();
            renderDifficultyChart();
            renderAssignmentChart();
        }
        renderTimeOnTask();
    }

    function renderCompletionChart() {
        const canvas = container.querySelector('#idCompletionChart');
        const emptyEl = container.querySelector('#idCompletionEmpty');
        if (!canvas) return;

        if (chartInstances.completion) {
            chartInstances.completion.destroy();
            chartInstances.completion = null;
        }

        // Collect all completedAt timestamps
        const allCompletions = [];
        for (const student of classProgressData) {
            if (!student.completions) continue;
            for (const data of Object.values(student.completions)) {
                if (data.completed && data.completedAt) {
                    const date = data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt);
                    if (!isNaN(date.getTime())) allCompletions.push(date);
                }
            }
        }

        if (allCompletions.length === 0 || classAssignments.length === 0 || rosterMembers.length === 0) {
            canvas.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        canvas.style.display = 'block';
        if (emptyEl) emptyEl.style.display = 'none';

        // Build weekly buckets for the last 8 weeks
        const now = new Date();
        const weeks = [];
        for (let i = 7; i >= 0; i--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - (i * 7));
            weekEnd.setHours(23, 59, 59, 999);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            weekStart.setHours(0, 0, 0, 0);
            weeks.push({ start: weekStart, end: weekEnd });
        }

        const totalPossible = rosterMembers.length * classAssignments.length;
        const labels = weeks.map(w => {
            const m = w.start.getMonth() + 1;
            const d = w.start.getDate();
            return `${m}/${d}`;
        });

        // Cumulative completions up to each week end
        const data = weeks.map(w => {
            const count = allCompletions.filter(d => d <= w.end).length;
            return Math.round((count / totalPossible) * 100);
        });

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
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#d4a017'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', callback: v => v + '%' } },
                    x: { grid: { display: false }, ticks: { color: '#666' } }
                }
            }
        });
    }

    function renderDifficultyChart() {
        const canvas = container.querySelector('#idDifficultyChart');
        const emptyEl = container.querySelector('#idDifficultyEmpty');
        if (!canvas) return;

        if (chartInstances.difficulty) {
            chartInstances.difficulty.destroy();
            chartInstances.difficulty = null;
        }

        // Compute per-assignment average scores
        const scored = [];
        for (const assignment of classAssignments) {
            const scores = [];
            for (const student of classProgressData) {
                const comp = student.completions?.[assignment.contentId];
                if (comp?.completed && comp.score != null) {
                    scores.push(comp.score);
                }
            }
            if (scores.length > 0) {
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                scored.push({ title: assignment.title, avg, count: scores.length });
            }
        }

        if (scored.length === 0) {
            canvas.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        canvas.style.display = 'block';
        if (emptyEl) emptyEl.style.display = 'none';

        const labels = scored.map(s => s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title);
        const data = scored.map(s => s.avg);
        const colors = scored.map(s => s.avg >= 80 ? '#4ade80' : s.avg >= 60 ? '#fbbf24' : '#f87171');

        chartInstances.difficulty = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avg Score',
                    data: data,
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
                            label: (ctx) => `Avg: ${ctx.raw}% (${scored[ctx.dataIndex].count} submissions)`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', callback: v => v + '%' } },
                    x: { grid: { display: false }, ticks: { color: '#666', maxRotation: 45 } }
                }
            }
        });
    }

    function renderAssignmentChart() {
        const canvas = container.querySelector('#idAssignmentChart');
        const emptyEl = container.querySelector('#idAssignmentEmpty');
        if (!canvas) return;

        if (chartInstances.assignment) {
            chartInstances.assignment.destroy();
            chartInstances.assignment = null;
        }

        if (classAssignments.length === 0 || rosterMembers.length === 0) {
            canvas.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        canvas.style.display = 'block';
        if (emptyEl) emptyEl.style.display = 'none';

        const enrolled = rosterMembers.length;

        // Per-assignment completion count
        const items = classAssignments.map(a => {
            let completedCount = 0;
            for (const student of classProgressData) {
                if (student.completions?.[a.contentId]?.completed) {
                    completedCount++;
                }
            }
            const rate = Math.round((completedCount / enrolled) * 100);
            return { title: a.title, rate, completedCount };
        });

        // Sort ascending by completion rate (hardest to complete at top)
        items.sort((a, b) => a.rate - b.rate);

        const labels = items.map(i => i.title.length > 25 ? i.title.substring(0, 25) + '...' : i.title);
        const data = items.map(i => i.rate);
        const colors = items.map(i => i.rate >= 75 ? '#4ade80' : i.rate >= 50 ? '#fbbf24' : '#f87171');

        chartInstances.assignment = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completion %',
                    data: data,
                    backgroundColor: colors,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.raw}% (${items[ctx.dataIndex].completedCount}/${enrolled})`
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', callback: v => v + '%' } },
                    y: { grid: { display: false }, ticks: { color: '#666' } }
                }
            }
        });
    }

    function renderTimeOnTask() {
        const section = container.querySelector('#idTimeOnTaskSection');
        const content = container.querySelector('#idTimeOnTaskContent');
        if (!section || !content) return;

        // Build per-assignment time stats
        const timeStats = [];
        for (const assignment of classAssignments) {
            const durations = [];
            for (const student of classProgressData) {
                const comp = student.completions?.[assignment.contentId];
                if (comp?.completed && comp.duration != null && comp.duration > 0) {
                    durations.push(comp.duration);
                }
            }
            if (durations.length > 0) {
                const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
                const fastest = Math.min(...durations);
                const slowest = Math.max(...durations);
                timeStats.push({ title: assignment.title, avg, fastest, slowest, count: durations.length });
            }
        }

        if (timeStats.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        content.innerHTML = `
            <table class="id-time-table">
                <thead>
                    <tr>
                        <th>Assignment</th>
                        <th>Avg Time</th>
                        <th>Fastest</th>
                        <th>Slowest</th>
                        <th>Submissions</th>
                    </tr>
                </thead>
                <tbody>
                    ${timeStats.map(s => `
                        <tr>
                            <td>${escapeHtml(s.title)}</td>
                            <td>${formatDuration(s.avg)}</td>
                            <td>${formatDuration(s.fastest)}</td>
                            <td>${formatDuration(s.slowest)}</td>
                            <td>${s.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // ARENA (CTF) — Leaderboard, Grid, Detail, Assignment, Export
    // ═══════════════════════════════════════════════════════════════

    /**
     * Load arena activity events (arena_complete, arena_flag, arena_hint)
     * from the class activity subcollection.
     */
    async function loadArenaActivity(classId) {
        const section = container.querySelector('#idArenaSection');
        arenaActivity = [];

        try {
            if (typeof AssignmentManager !== 'undefined') {
                // Fetch arena events — use a higher limit since we need all arena activity
                const allActivity = await AssignmentManager.getClassActivity(classId, { limit: 500 });
                arenaActivity = allActivity.filter(e =>
                    e.eventType === 'arena_complete' ||
                    e.eventType === 'arena_flag' ||
                    e.eventType === 'arena_hint'
                );
            }
        } catch (error) {
            console.error('[InstructorDashboard] Failed to load arena activity:', error);
        }

        if (arenaActivity.length > 0) {
            if (section) section.style.display = 'block';
            renderArenaLeaderboard();
            renderArenaGrid();
        } else {
            if (section) section.style.display = 'none';
        }
    }

    /**
     * Build per-student arena stats from activity events.
     * Returns an array of { uid, name, boxesCompleted, totalScore, totalTime, completions }
     */
    function buildArenaStats() {
        const studentMap = {};

        // Process arena_complete events
        for (const evt of arenaActivity) {
            if (evt.eventType !== 'arena_complete') continue;

            const uid = evt.studentUid;
            if (!studentMap[uid]) {
                studentMap[uid] = {
                    uid,
                    name: evt.studentName || 'Student',
                    completions: {},
                    flagEvents: [],
                    hintEvents: []
                };
            }

            const boxId = evt.contentId;
            // Keep the best score for each box (in case of multiple completions)
            const existing = studentMap[uid].completions[boxId];
            const score = evt.score || 0;
            if (!existing || score > existing.score) {
                studentMap[uid].completions[boxId] = {
                    score: score,
                    flags: evt.flags || evt.score ? (evt.flags || 0) : 0,
                    totalFlags: evt.totalFlags || 0,
                    hints: evt.hints || 0,
                    time: evt.time || 0,
                    mode: evt.mode || 'solo',
                    timestamp: evt.timestamp,
                    certObjectives: evt.certObjectives || null,
                    objectivesCovered: evt.objectivesCovered || [],
                    phaseTimings: evt.phaseTimings || null,
                    preSurvey: evt.preSurvey || null,
                    postSurvey: evt.postSurvey || null
                };
            }
        }

        // Process arena_flag events
        for (const evt of arenaActivity) {
            if (evt.eventType !== 'arena_flag') continue;
            const uid = evt.studentUid;
            if (!studentMap[uid]) {
                studentMap[uid] = {
                    uid,
                    name: evt.studentName || 'Student',
                    completions: {},
                    flagEvents: [],
                    hintEvents: []
                };
            }
            studentMap[uid].flagEvents.push({
                boxId: evt.contentId,
                flagId: evt.flagId,
                points: evt.points,
                timestamp: evt.timestamp
            });
        }

        // Process arena_hint events
        for (const evt of arenaActivity) {
            if (evt.eventType !== 'arena_hint') continue;
            const uid = evt.studentUid;
            if (!studentMap[uid]) {
                studentMap[uid] = {
                    uid,
                    name: evt.studentName || 'Student',
                    completions: {},
                    flagEvents: [],
                    hintEvents: []
                };
            }
            studentMap[uid].hintEvents.push({
                boxId: evt.contentId,
                hintId: evt.hintId,
                penalty: evt.penalty,
                timestamp: evt.timestamp
            });
        }

        // Build summary rows
        const rows = Object.values(studentMap).map(s => {
            const completions = Object.values(s.completions);
            const totalScore = completions.reduce((sum, c) => sum + (c.score || 0), 0);
            const totalTime = completions.reduce((sum, c) => sum + (c.time || 0), 0);
            const avgTime = completions.length > 0 ? Math.round(totalTime / completions.length) : 0;

            return {
                uid: s.uid,
                name: s.name,
                boxesCompleted: completions.length,
                totalScore,
                avgTime,
                completions: s.completions,
                flagEvents: s.flagEvents,
                hintEvents: s.hintEvents
            };
        });

        // Sort by total score descending
        rows.sort((a, b) => b.totalScore - a.totalScore);
        return rows;
    }

    /**
     * Render the CTF leaderboard table.
     */
    function renderArenaLeaderboard() {
        const el = container.querySelector('#idArenaLeaderboard');
        if (!el) return;

        const stats = buildArenaStats();

        if (stats.length === 0) {
            el.innerHTML = '<div class="id-activity-empty">No arena completions yet.</div>';
            return;
        }

        const rankLabel = (i) => {
            if (i === 0) return '<span class="id-arena-medal id-arena-gold">1</span>';
            if (i === 1) return '<span class="id-arena-medal id-arena-silver">2</span>';
            if (i === 2) return '<span class="id-arena-medal id-arena-bronze">3</span>';
            return i + 1;
        };

        el.innerHTML = `
            <div class="id-arena-leaderboard-title">CTF Leaderboard</div>
            <table class="id-arena-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Boxes</th>
                        <th>Total Score</th>
                        <th>Avg Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map((s, i) => `
                        <tr class="id-arena-row ${i < 3 ? 'id-arena-top3' : ''} ${i % 2 === 1 ? 'id-arena-row-alt' : ''}">
                            <td class="id-arena-rank">${rankLabel(i)}</td>
                            <td>${escapeHtml(s.name)}</td>
                            <td>${s.boxesCompleted}</td>
                            <td class="id-arena-score">${s.totalScore}</td>
                            <td>${formatDuration(s.avgTime)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Render the student x box completion grid.
     * Rows = students, Columns = boxes (A1-A20).
     * Green = completed (shows score), Yellow = in-progress, Gray = not started.
     */
    function renderArenaGrid() {
        const el = container.querySelector('#idArenaGrid');
        if (!el) return;

        const stats = buildArenaStats();
        if (stats.length === 0) {
            el.innerHTML = '';
            return;
        }

        // Determine which boxes have any activity (to avoid showing 20 empty columns)
        const activeBoxIds = new Set();
        for (const s of stats) {
            for (const boxId of Object.keys(s.completions)) activeBoxIds.add(boxId);
            for (const fe of s.flagEvents) activeBoxIds.add(fe.boxId);
        }
        const activeCols = CTF_BOXES.filter(b => activeBoxIds.has(b.id));
        if (activeCols.length === 0) {
            el.innerHTML = '';
            return;
        }

        // Build in-progress map: student has flag events but no completion for a box
        const inProgressMap = {};
        for (const s of stats) {
            inProgressMap[s.uid] = {};
            for (const fe of s.flagEvents) {
                if (!s.completions[fe.boxId]) {
                    inProgressMap[s.uid][fe.boxId] = true;
                }
            }
        }

        el.innerHTML = `
            <div class="id-arena-leaderboard-title">Box Completion Grid</div>
            <div class="id-arena-grid-scroll">
                <table class="id-arena-grid-table">
                    <thead>
                        <tr>
                            <th class="id-arena-grid-name">Student</th>
                            ${activeCols.map(b => `<th class="id-arena-grid-box" title="${escapeAttr(b.title)}">${b.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(s => `
                            <tr>
                                <td class="id-arena-grid-name">${escapeHtml(s.name)}</td>
                                ${activeCols.map(b => {
                                    const comp = s.completions[b.id];
                                    const inProg = inProgressMap[s.uid]?.[b.id];
                                    if (comp) {
                                        const scoreClass = comp.score > 800 ? 'id-arena-score-high' : comp.score >= 500 ? 'id-arena-score-mid' : 'id-arena-score-low';
                                        return `<td class="id-arena-cell ${scoreClass}" onclick="InstructorDashboard.showArenaDetail('${s.uid}','${b.id}')" title="${escapeAttr(b.title)}: ${comp.score} pts">${comp.score}</td>`;
                                    } else if (inProg) {
                                        return `<td class="id-arena-cell id-arena-progress" onclick="InstructorDashboard.showArenaDetail('${s.uid}','${b.id}')" title="${escapeAttr(b.title)}: In Progress">...</td>`;
                                    } else {
                                        return `<td class="id-arena-cell id-arena-empty" title="${escapeAttr(b.title)}: Not Started">-</td>`;
                                    }
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Show a detail modal for a specific student + box combination.
     * Displays flags captured, hints used, wrong attempts, timing, surveys.
     */
    function showArenaDetail(uid, boxId) {
        const stats = buildArenaStats();
        const student = stats.find(s => s.uid === uid);
        if (!student) return;

        const box = CTF_BOXES.find(b => b.id === boxId) || { label: boxId, title: boxId };
        const comp = student.completions[boxId];
        const studentFlags = student.flagEvents.filter(f => f.boxId === boxId);
        const studentHints = student.hintEvents.filter(h => h.boxId === boxId);

        // Count wrong flag attempts: check arena_complete extras, then look for arena_flag_wrong events
        let wrongAttempts = comp?.wrongFlags || 0;
        if (!wrongAttempts) {
            // Count arena_flag events that have a wrong/miss indicator
            wrongAttempts = arenaActivity.filter(e =>
                e.eventType === 'arena_flag' &&
                e.studentUid === uid &&
                e.contentId === boxId &&
                e.wrong === true
            ).length;
        }

        // Phase timings
        let phaseHtml = '';
        if (comp?.phaseTimings) {
            const pt = comp.phaseTimings;
            const phases = ['RECON', 'EXPLOIT', 'EXTRACTION', 'OTHER'];
            phaseHtml = `
                <div class="id-arena-detail-section">
                    <div class="id-arena-detail-subtitle">Phase Timing</div>
                    <table class="id-arena-detail-table">
                        <thead><tr><th>Phase</th><th>Time</th></tr></thead>
                        <tbody>
                            ${phases.map(p => {
                                const ms = pt[p] || 0;
                                return ms > 0 ? `<tr><td>${p}</td><td>${formatDuration(Math.round(ms / 1000))}</td></tr>` : '';
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Pre/Post survey
        let surveyHtml = '';
        if (comp?.preSurvey || comp?.postSurvey) {
            const preQ = ['Confidence', 'Expected Difficulty', 'Tool Familiarity', 'Anxiety', 'Prior Experience'];
            const postQ = ['Confidence After', 'Actual Difficulty', 'Hint Helpfulness', 'Attempt Harder', 'Learning Gained'];

            let surveyRows = '';
            if (comp.preSurvey && comp.postSurvey) {
                surveyRows = preQ.map((q, i) => {
                    const preVal = comp.preSurvey['q' + (i + 1)] || '-';
                    const postVal = comp.postSurvey['q' + (i + 1)] || '-';
                    const postLabel = postQ[i] || q;
                    return `<tr><td>${escapeHtml(q)}</td><td>${preVal}/5</td><td>${escapeHtml(postLabel)}</td><td>${postVal}/5</td></tr>`;
                }).join('');
                surveyHtml = `
                    <div class="id-arena-detail-section">
                        <div class="id-arena-detail-subtitle">Pre/Post Survey</div>
                        <table class="id-arena-detail-table">
                            <thead><tr><th>Pre-Question</th><th>Rating</th><th>Post-Question</th><th>Rating</th></tr></thead>
                            <tbody>${surveyRows}</tbody>
                        </table>
                    </div>
                `;
            } else if (comp.preSurvey) {
                surveyRows = preQ.map((q, i) => {
                    const val = comp.preSurvey['q' + (i + 1)] || '-';
                    return `<tr><td>${escapeHtml(q)}</td><td>${val}/5</td></tr>`;
                }).join('');
                surveyHtml = `
                    <div class="id-arena-detail-section">
                        <div class="id-arena-detail-subtitle">Pre-Survey (post not completed)</div>
                        <table class="id-arena-detail-table">
                            <thead><tr><th>Question</th><th>Rating</th></tr></thead>
                            <tbody>${surveyRows}</tbody>
                        </table>
                    </div>
                `;
            }
        }

        // Objectives covered
        let objectivesHtml = '';
        if (comp?.objectivesCovered && comp.objectivesCovered.length > 0) {
            objectivesHtml = `
                <div class="id-arena-detail-section">
                    <div class="id-arena-detail-subtitle">Cert Objectives</div>
                    <table class="id-arena-detail-table">
                        <thead><tr><th>Objective</th><th>Status</th></tr></thead>
                        <tbody>
                            ${comp.objectivesCovered.map(o => `
                                <tr>
                                    <td>${escapeHtml(o.objective)}</td>
                                    <td>${o.captured ? '<span style="color:#4ade80;">Captured</span>' : '<span style="color:#f87171;">Missed</span>'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idArenaDetailModal';
        overlay.innerHTML = `
            <div class="id-modal id-modal-lg">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idArenaDetailModal')">&times;</button>
                <div class="id-arena-detail-header">
                    <div class="id-arena-detail-name">${escapeHtml(student.name)}</div>
                    <div class="id-arena-detail-box">${escapeHtml(box.label)}: ${escapeHtml(box.title)}</div>
                    ${comp ? `
                        <div class="id-arena-detail-score">Score: ${comp.score} | Time: ${formatDuration(comp.time)} | Mode: ${comp.mode || 'solo'}</div>
                        <div class="id-arena-detail-summary">
                            <span class="id-arena-detail-stat"><span class="id-arena-detail-stat-val" style="color:#4ade80;">${studentFlags.length}</span> flags</span>
                            <span class="id-arena-detail-stat"><span class="id-arena-detail-stat-val" style="color:#fbbf24;">${studentHints.length}</span> hints</span>
                            <span class="id-arena-detail-stat"><span class="id-arena-detail-stat-val" style="color:#f87171;">${wrongAttempts}</span> wrong attempts</span>
                        </div>
                    ` : '<div class="id-arena-detail-score">In Progress</div>'}
                </div>

                <!-- Flags Captured -->
                <div class="id-arena-detail-section">
                    <div class="id-arena-detail-subtitle">Flags Captured (${studentFlags.length}${comp ? '/' + (comp.totalFlags || '?') : ''})</div>
                    ${studentFlags.length > 0 ? `
                        <table class="id-arena-detail-table">
                            <thead><tr><th>Flag</th><th>Points</th><th>Time</th></tr></thead>
                            <tbody>
                                ${studentFlags.map(f => `
                                    <tr>
                                        <td><span style="color:#4ade80;">&#10003;</span> ${escapeHtml(f.flagId || 'flag')}</td>
                                        <td>+${f.points || 0}</td>
                                        <td>${f.timestamp ? formatTimeAgo(f.timestamp) : '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<div style="color:#666;font-size:0.85rem;">No flags captured yet</div>'}
                </div>

                <!-- Hints Used -->
                <div class="id-arena-detail-section">
                    <div class="id-arena-detail-subtitle">Hints Used (${studentHints.length})</div>
                    ${studentHints.length > 0 ? `
                        <table class="id-arena-detail-table">
                            <thead><tr><th>Hint</th><th>Penalty</th><th>Time</th></tr></thead>
                            <tbody>
                                ${studentHints.map(h => `
                                    <tr>
                                        <td>${escapeHtml(h.hintId || 'hint')}</td>
                                        <td style="color:#f87171;">${h.penalty || 0}</td>
                                        <td>${h.timestamp ? formatTimeAgo(h.timestamp) : '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<div style="color:#666;font-size:0.85rem;">No hints used</div>'}
                </div>

                ${phaseHtml}
                ${surveyHtml}
                ${objectivesHtml}

                <div class="id-modal-actions" style="margin-top:20px;">
                    <button class="id-secondary-btn" onclick="InstructorDashboard.closeModal('idArenaDetailModal')">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idArenaDetailModal');
        });
    }

    /**
     * Export arena data as CSV.
     * Columns: Student, Box, Score, Flags Found, Total Flags, Hints Used, Time (s), Completed (Y/N)
     * Filename: arena_analytics_{classId}_{date}.csv
     */
    function exportArenaCSV() {
        const stats = buildArenaStats();
        if (stats.length === 0) {
            showToast('No arena data to export');
            return;
        }

        const headers = ['Student', 'Box', 'Score', 'Flags Found', 'Total Flags', 'Hints Used', 'Time (s)', 'Completed (Y/N)', 'Completion Date', 'Cert Path', 'Objectives Covered'];
        const rows = [];

        // Include all students in roster, not just those with arena activity
        for (const member of rosterMembers) {
            const studentStat = stats.find(s => s.uid === member.uid);
            const name = member.displayName || member.email?.split('@')[0] || 'Student';

            if (studentStat && Object.keys(studentStat.completions).length > 0) {
                for (const [boxId, comp] of Object.entries(studentStat.completions)) {
                    const box = CTF_BOXES.find(b => b.id === boxId) || { label: boxId, title: boxId };
                    const completionDate = comp.timestamp ? (comp.timestamp.toISOString ? comp.timestamp.toISOString() : new Date(comp.timestamp).toISOString()) : '';
                    const certPath = comp.certObjectives?.certPath || '';
                    const objectives = (comp.objectivesCovered || []).map(o => `${o.objective}:${o.captured ? 'Y' : 'N'}`).join('; ');

                    rows.push([
                        name,
                        `${box.label} - ${box.title}`,
                        comp.score || 0,
                        comp.flags || 0,
                        comp.totalFlags || 0,
                        comp.hints || 0,
                        comp.time || 0,
                        'Y',
                        completionDate,
                        certPath,
                        objectives
                    ]);
                }

                // Also include in-progress boxes (flag events but no completion)
                for (const fe of (studentStat.flagEvents || [])) {
                    if (!studentStat.completions[fe.boxId]) {
                        const box = CTF_BOXES.find(b => b.id === fe.boxId) || { label: fe.boxId, title: fe.boxId };
                        // Only add once per box
                        if (!rows.find(r => r[0] === name && r[1] === `${box.label} - ${box.title}`)) {
                            const flagCount = studentStat.flagEvents.filter(f => f.boxId === fe.boxId).length;
                            const hintCount = studentStat.hintEvents.filter(h => h.boxId === fe.boxId).length;
                            rows.push([
                                name,
                                `${box.label} - ${box.title}`,
                                0,
                                flagCount,
                                '',
                                hintCount,
                                '',
                                'N',
                                '',
                                '',
                                ''
                            ]);
                        }
                    }
                }
            }
        }

        // Use specific filename format: arena_analytics_{classId}_{date}.csv
        const date = new Date().toISOString().split('T')[0];
        const cls = handlerClasses.find(c => c.id === selectedClassId);
        const classLabel = cls ? cls.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : selectedClassId;
        const filename = `arena_analytics_${classLabel}_${date}`;
        downloadCSV(filename, headers, rows, true);
    }

    /**
     * Open the CTF Box assignment dialog — lets the instructor assign a specific box.
     */
    function openArenaAssignModal() {
        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idArenaAssignModal';

        const boxOptions = CTF_BOXES.map(b =>
            `<option value="${b.id}">${b.label}: ${escapeHtml(b.title)}</option>`
        ).join('');

        overlay.innerHTML = `
            <div class="id-modal">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idArenaAssignModal')">&times;</button>
                <div class="id-modal-title">Assign CTF Box</div>
                <div class="id-input-group">
                    <label class="id-input-label">Select Box *</label>
                    <select class="id-input" id="idArenaAssignBox">${boxOptions}</select>
                </div>
                <div class="id-input-group">
                    <label class="id-input-label">Due Date</label>
                    <input type="date" class="id-input" id="idArenaAssignDue">
                </div>
                <div class="id-input-group">
                    <label class="id-input-label">Notes</label>
                    <textarea class="id-input" id="idArenaAssignNotes" placeholder="Optional instructions..." maxlength="500"></textarea>
                </div>
                <div class="id-error" id="idArenaAssignError"></div>
                <div class="id-modal-actions">
                    <button class="id-secondary-btn" onclick="InstructorDashboard.closeModal('idArenaAssignModal')">Cancel</button>
                    <button class="id-primary-btn" id="idArenaAssignSubmitBtn" onclick="InstructorDashboard.submitArenaAssign()">Assign</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idArenaAssignModal');
        });
    }

    async function submitArenaAssign() {
        const boxSelect = document.getElementById('idArenaAssignBox');
        const dueInput = document.getElementById('idArenaAssignDue');
        const notesInput = document.getElementById('idArenaAssignNotes');
        const errorEl = document.getElementById('idArenaAssignError');
        const submitBtn = document.getElementById('idArenaAssignSubmitBtn');

        const boxId = boxSelect?.value;
        const box = CTF_BOXES.find(b => b.id === boxId);
        if (!box) {
            if (errorEl) { errorEl.textContent = 'Please select a box.'; errorEl.style.display = 'block'; }
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="id-spinner"></span>';
        }
        if (errorEl) errorEl.style.display = 'none';

        try {
            await AssignmentManager.createAssignment(selectedClassId, {
                assignmentType: 'item',
                contentId: box.id,
                title: `CTF Box ${box.label}: ${box.title}`,
                contentType: 'ctf_box',
                description: `CTF Arena challenge — ${box.title}`,
                house: 'arena',
                dueDate: dueInput?.value || null,
                notes: notesInput?.value?.trim() || ''
            });

            closeModal('idArenaAssignModal');
            await loadAssignments(selectedClassId);
            showToast(`CTF Box ${box.label} assigned`);
        } catch (error) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Assign';
            }
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to assign box.';
                errorEl.style.display = 'block';
            }
        }
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

        // Build headers: Name, Email, Progress %, then per-assignment Score + Time
        const headers = ['Name', 'Email', 'Progress %'];
        for (const a of classAssignments) {
            const shortTitle = a.title.length > 30 ? a.title.substring(0, 30) : a.title;
            headers.push(shortTitle + ' Score');
            headers.push(shortTitle + ' Time');
        }

        const rows = rosterMembers.map(m => {
            const progress = calculateStudentProgress(m.uid);
            const studentData = classProgressData.find(p => p.uid === m.uid);
            const row = [
                m.displayName || m.email?.split('@')[0] || '',
                m.email || '',
                progress
            ];
            for (const a of classAssignments) {
                const comp = studentData?.completions?.[a.contentId];
                row.push(comp?.score != null ? comp.score : '');
                row.push(comp?.duration != null ? formatDuration(comp.duration) : '');
            }
            return row;
        });

        downloadCSV('grades', headers, rows);
    }

    function downloadCSV(filename, headers, rows, rawFilename) {
        let fullFilename;
        if (rawFilename) {
            fullFilename = `${filename}.csv`;
        } else {
            const cls = handlerClasses.find(c => c.id === selectedClassId);
            const className = cls ? cls.name.replace(/[^a-z0-9]/gi, '-') : 'class';
            fullFilename = `${className}-${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        }

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

    function formatDuration(seconds) {
        if (seconds == null || seconds <= 0) return '—';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    function showStudentDetail(uid) {
        // Find student in roster and progress data
        const member = rosterMembers.find(m => m.uid === uid);
        const studentData = classProgressData.find(p => p.uid === uid);
        if (!member) return;

        const name = member.displayName || member.email?.split('@')[0] || 'Student';
        const email = member.email || '—';
        const progress = calculateStudentProgress(uid);

        // Build assignment rows
        let assignmentRows = '';
        if (classAssignments.length > 0) {
            assignmentRows = classAssignments.map(a => {
                const comp = studentData?.completions?.[a.contentId];
                const completed = comp?.completed;
                const statusIcon = completed ? '<span style="color:#4ade80;">&#10003;</span>' : '<span style="color:#555;">—</span>';
                const score = comp?.score != null ? `${comp.score}%` : '—';
                const time = comp?.duration != null ? formatDuration(comp.duration) : '—';
                let completedAt = '—';
                if (comp?.completedAt) {
                    const d = comp.completedAt?.toDate ? comp.completedAt.toDate() : new Date(comp.completedAt);
                    if (!isNaN(d.getTime())) completedAt = formatDate(d);
                }
                return `
                    <tr>
                        <td>${escapeHtml(a.title)}</td>
                        <td>${statusIcon}</td>
                        <td>${score}</td>
                        <td>${time}</td>
                        <td>${completedAt}</td>
                    </tr>
                `;
            }).join('');
        } else {
            assignmentRows = '<tr><td colspan="5" style="text-align:center;color:#666;padding:20px;">No assignments</td></tr>';
        }

        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idStudentDetailModal';
        overlay.innerHTML = `
            <div class="id-modal id-modal-lg">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idStudentDetailModal')">&times;</button>
                <div class="id-student-detail-header">
                    <div class="id-student-detail-name">${escapeHtml(name)}</div>
                    <div class="id-student-detail-email">${escapeHtml(email)}</div>
                    <div class="id-student-detail-progress">
                        <span class="id-progress-badge">${progress}%</span> overall completion
                    </div>
                </div>
                <table class="id-student-detail-table">
                    <thead>
                        <tr>
                            <th>Assignment</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Time Spent</th>
                            <th>Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${assignmentRows}
                    </tbody>
                </table>
                <div class="id-modal-actions" style="margin-top:20px;">
                    <button class="id-secondary-btn" onclick="InstructorDashboard.closeModal('idStudentDetailModal')">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idStudentDetailModal');
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // STUDENT MERGE (HD-6)
    // ═══════════════════════════════════════════════════════════════

    function showMergeModal(sourceUid) {
        const source = rosterMembers.find(m => m.uid === sourceUid);
        if (!source) return;

        const sourceName = source.displayName || source.email?.split('@')[0] || 'Student';
        const sourceProgress = calculateStudentProgress(sourceUid);

        // Build target options — all non-source students
        const targets = rosterMembers.filter(m => m.uid !== sourceUid);
        if (targets.length === 0) {
            alert('No other students to merge with.');
            return;
        }

        const targetOptions = targets.map(m => {
            const tName = m.displayName || m.email?.split('@')[0] || 'Student';
            const tProg = calculateStudentProgress(m.uid);
            const tAnon = m.isAnonymous ? ' [anon]' : '';
            return `<option value="${m.uid}">${escapeHtml(tName)}${tAnon} (${tProg}%)</option>`;
        }).join('');

        const overlay = document.createElement('div');
        overlay.className = 'id-overlay';
        overlay.id = 'idMergeModal';
        overlay.innerHTML = `
            <div class="id-modal">
                <button class="id-modal-close" onclick="InstructorDashboard.closeModal('idMergeModal')">&times;</button>
                <div class="id-modal-title">Merge Students</div>
                <div style="color:#888;font-size:0.85rem;margin-bottom:16px;line-height:1.5;">
                    Merge <strong style="color:#f59e0b;">${escapeHtml(sourceName)}</strong> (${sourceProgress}% complete, anonymous)
                    into another student record. Completions are combined (max scores, earliest timestamps).
                    The source record is then removed.
                </div>
                <div class="id-input-group">
                    <label class="id-input-label">Merge into:</label>
                    <select class="id-input" id="idMergeTarget">${targetOptions}</select>
                </div>
                <div id="idMergePreview" style="margin:12px 0;padding:10px;background:#111;border-radius:6px;font-size:0.8rem;color:#aaa;display:none;"></div>
                <div class="id-error" id="idMergeError"></div>
                <div class="id-modal-actions">
                    <button class="id-secondary-btn" onclick="InstructorDashboard.closeModal('idMergeModal')">Cancel</button>
                    <button class="id-secondary-btn" onclick="InstructorDashboard.previewMerge('${sourceUid}')" id="idMergePreviewBtn">Preview</button>
                    <button class="id-primary-btn" onclick="InstructorDashboard.submitMerge('${sourceUid}')" id="idMergeSubmitBtn" style="background:#f59e0b;color:#000;">Merge</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal('idMergeModal');
        });
    }

    function previewMerge(sourceUid) {
        const targetUid = document.getElementById('idMergeTarget')?.value;
        if (!targetUid) return;

        const sourceData = classProgressData.find(p => p.uid === sourceUid);
        const targetData = classProgressData.find(p => p.uid === targetUid);
        const targetMember = rosterMembers.find(m => m.uid === targetUid);
        const targetName = targetMember?.displayName || 'Target student';

        const sourceCompletions = sourceData?.completions || {};
        const targetCompletions = targetData?.completions || {};

        // Calculate what would change
        let newCompletions = 0;
        let scoreUpgrades = 0;
        for (const [contentId, comp] of Object.entries(sourceCompletions)) {
            if (comp?.completed) {
                const existing = targetCompletions[contentId];
                if (!existing?.completed) {
                    newCompletions++;
                } else if (comp.score != null && (existing.score == null || comp.score > existing.score)) {
                    scoreUpgrades++;
                }
            }
        }

        const preview = document.getElementById('idMergePreview');
        preview.style.display = 'block';
        preview.innerHTML = `
            <div style="margin-bottom:6px;color:#ccc;font-weight:600;">Preview: merge into ${escapeHtml(targetName)}</div>
            <div>+ ${newCompletions} new completion(s) added</div>
            <div>+ ${scoreUpgrades} score upgrade(s)</div>
            <div style="margin-top:6px;color:#f59e0b;">Source record will be permanently removed after merge.</div>
        `;
    }

    async function submitMerge(sourceUid) {
        const targetUid = document.getElementById('idMergeTarget')?.value;
        if (!targetUid) return;

        const errorEl = document.getElementById('idMergeError');
        const btn = document.getElementById('idMergeSubmitBtn');

        if (!confirm('This action cannot be undone. Proceed with merge?')) return;

        btn.disabled = true;
        btn.textContent = 'Merging...';
        errorEl.textContent = '';

        try {
            await mergeStudents(sourceUid, targetUid, selectedClassId);
            closeModal('idMergeModal');
            showToast('Students merged successfully');
            // Reload roster and progress
            await Promise.all([
                loadRoster(selectedClassId),
                loadClassProgress(selectedClassId)
            ]);
        } catch (error) {
            console.error('[InstructorDashboard] Merge failed:', error);
            errorEl.textContent = error.message || 'Merge failed';
            btn.disabled = false;
            btn.textContent = 'Merge';
        }
    }

    /**
     * Merge source student into target:
     * - Union completions (max scores, earliest timestamps)
     * - Copy activity logs
     * - Add mergedFrom audit trail to target progress doc
     * - Delete source member doc
     */
    async function mergeStudents(sourceUid, targetUid, classId) {
        const { getFirestore } = window.firebaseFirestore;
        const db = getFirestore();
        if (!db) throw new Error('Database not available');

        const {
            doc, getDoc, setDoc, updateDoc, deleteDoc, collection: colRef, getDocs, arrayUnion
        } = window.firebaseFirestore;

        // Load both progress docs
        const sourceProgRef = doc(db, 'classes', classId, 'progress', sourceUid);
        const targetProgRef = doc(db, 'classes', classId, 'progress', targetUid);

        const [sourceSnap, targetSnap] = await Promise.all([
            getDoc(sourceProgRef),
            getDoc(targetProgRef)
        ]);

        const sourceProgress = sourceSnap.exists() ? sourceSnap.data() : {};
        const targetProgress = targetSnap.exists() ? targetSnap.data() : {};

        // Merge completions — union with max scores, earliest timestamps
        const sourceCompletions = sourceProgress.completions || {};
        const targetCompletions = targetProgress.completions || {};
        const mergedCompletions = { ...targetCompletions };

        for (const [contentId, sourceComp] of Object.entries(sourceCompletions)) {
            if (!sourceComp?.completed) continue;

            const existing = mergedCompletions[contentId];
            if (!existing?.completed) {
                // New completion from source
                mergedCompletions[contentId] = sourceComp;
            } else {
                // Both completed — take max score, earliest completedAt
                if (sourceComp.score != null && (existing.score == null || sourceComp.score > existing.score)) {
                    mergedCompletions[contentId] = {
                        ...existing,
                        score: sourceComp.score
                    };
                }
                if (sourceComp.completedAt && existing.completedAt) {
                    const srcTime = sourceComp.completedAt?.toMillis ? sourceComp.completedAt.toMillis()
                        : new Date(sourceComp.completedAt).getTime();
                    const tgtTime = existing.completedAt?.toMillis ? existing.completedAt.toMillis()
                        : new Date(existing.completedAt).getTime();
                    if (srcTime < tgtTime) {
                        mergedCompletions[contentId] = {
                            ...mergedCompletions[contentId],
                            completedAt: sourceComp.completedAt
                        };
                    }
                }
            }
        }

        // Write merged progress to target
        await setDoc(targetProgRef, {
            ...targetProgress,
            uid: targetUid,
            completions: mergedCompletions,
            mergedFrom: arrayUnion(sourceUid)
        }, { merge: true });

        // Copy activity logs from source to target
        try {
            const sourceActivityRef = colRef(db, 'classes', classId, 'progress', sourceUid, 'activity');
            const activitySnap = await getDocs(sourceActivityRef);

            for (const actDoc of activitySnap.docs) {
                const targetActivityRef = doc(db, 'classes', classId, 'progress', targetUid, 'activity', `merged_${sourceUid}_${actDoc.id}`);
                await setDoc(targetActivityRef, {
                    ...actDoc.data(),
                    _mergedFrom: sourceUid
                });
            }
        } catch (e) {
            console.warn('[InstructorDashboard] Could not copy activity logs:', e);
        }

        // Remove source member doc and update class memberUids
        const { arrayRemove, increment, serverTimestamp } = window.firebaseFirestore;

        const sourceMemberRef = doc(db, 'classes', classId, 'members', sourceUid);
        await deleteDoc(sourceMemberRef);

        // Delete source progress doc
        await deleteDoc(sourceProgRef);

        // Update class doc
        const classRef = doc(db, 'classes', classId);
        await updateDoc(classRef, {
            memberUids: arrayRemove(sourceUid),
            memberCount: increment(-1),
            updatedAt: serverTimestamp()
        });

        console.log(`[InstructorDashboard] Merged ${sourceUid} into ${targetUid} in class ${classId}`);
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

            .id-merge-btn {
                background: none;
                border: 1px solid #f59e0b44;
                color: #f59e0b;
                font-size: 14px;
                cursor: pointer;
                padding: 2px 8px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .id-merge-btn:hover {
                background: #f59e0b22;
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

            .id-roster-row {
                cursor: pointer;
                transition: background 0.15s;
            }

            .id-roster-row:hover {
                background: var(--id-gold-subtle);
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

            .id-chart-empty {
                text-align: center;
                padding: 30px 10px;
                color: var(--id-text-muted);
                font-size: 0.8rem;
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

            /* Time on Task */
            .id-time-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
            }

            .id-time-table th {
                text-align: left;
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 0.7rem;
                text-transform: uppercase;
                color: var(--id-text-muted);
            }

            .id-time-table td {
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            /* Student Detail Modal */
            .id-student-detail-header {
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .id-student-detail-name {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--id-gold);
                margin-bottom: 4px;
            }

            .id-student-detail-email {
                font-size: 0.8rem;
                color: var(--id-text-muted);
                margin-bottom: 8px;
            }

            .id-student-detail-progress {
                font-size: 0.85rem;
                color: var(--id-text);
            }

            .id-student-detail-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
            }

            .id-student-detail-table th {
                text-align: left;
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 0.7rem;
                text-transform: uppercase;
                color: var(--id-text-muted);
            }

            .id-student-detail-table td {
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            /* Arena (CTF) */
            .id-arena-leaderboard-title {
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--id-gold);
                margin-bottom: 10px;
            }

            .id-arena-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
            }

            .id-arena-table th {
                text-align: left;
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 0.7rem;
                text-transform: uppercase;
                color: var(--id-text-muted);
            }

            .id-arena-table td {
                padding: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            .id-arena-row {
                transition: background 0.15s;
            }

            .id-arena-row:hover {
                background: var(--id-gold-subtle);
            }

            .id-arena-rank {
                font-weight: 700;
                color: var(--id-gold);
                width: 40px;
            }

            .id-arena-score {
                font-weight: 700;
                color: var(--id-gold);
            }

            .id-arena-grid-scroll {
                overflow-x: auto;
                max-width: 100%;
            }

            .id-arena-grid-table {
                border-collapse: collapse;
                font-size: 0.8rem;
                min-width: 100%;
            }

            .id-arena-grid-table th {
                padding: 8px 6px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 0.65rem;
                text-transform: uppercase;
                color: var(--id-text-muted);
                text-align: center;
                white-space: nowrap;
            }

            .id-arena-grid-name {
                text-align: left !important;
                white-space: nowrap;
                padding-right: 12px !important;
                position: sticky;
                left: 0;
                background: var(--id-card-bg);
                z-index: 1;
            }

            .id-arena-grid-box {
                min-width: 45px;
            }

            .id-arena-cell {
                text-align: center;
                padding: 6px 4px;
                border-bottom: 1px solid rgba(255,255,255,0.04);
                font-size: 0.75rem;
                font-weight: 600;
                border-radius: 4px;
            }

            /* Score-based cell coloring: >800 green, 500-800 yellow, <500 red */
            .id-arena-score-high {
                background: rgba(74, 222, 128, 0.15);
                color: #4ade80;
                cursor: pointer;
                transition: background 0.15s;
            }

            .id-arena-score-high:hover {
                background: rgba(74, 222, 128, 0.3);
            }

            .id-arena-score-mid {
                background: rgba(251, 191, 36, 0.15);
                color: #fbbf24;
                cursor: pointer;
                transition: background 0.15s;
            }

            .id-arena-score-mid:hover {
                background: rgba(251, 191, 36, 0.3);
            }

            .id-arena-score-low {
                background: rgba(248, 113, 113, 0.15);
                color: #f87171;
                cursor: pointer;
                transition: background 0.15s;
            }

            .id-arena-score-low:hover {
                background: rgba(248, 113, 113, 0.3);
            }

            /* Backward compat alias */
            .id-arena-complete {
                background: rgba(74, 222, 128, 0.15);
                color: #4ade80;
                cursor: pointer;
                transition: background 0.15s;
            }

            .id-arena-complete:hover {
                background: rgba(74, 222, 128, 0.3);
            }

            .id-arena-progress {
                background: rgba(251, 191, 36, 0.15);
                color: #fbbf24;
                cursor: pointer;
                transition: background 0.15s;
            }

            .id-arena-progress:hover {
                background: rgba(251, 191, 36, 0.3);
            }

            .id-arena-empty {
                color: #333;
            }

            /* Leaderboard: alternating rows */
            .id-arena-row-alt {
                background: rgba(255,255,255,0.02);
            }

            /* Leaderboard: top-3 highlight */
            .id-arena-top3 {
                background: rgba(212, 160, 23, 0.06);
            }

            .id-arena-top3:hover {
                background: rgba(212, 160, 23, 0.12);
            }

            /* Leaderboard: rank medals */
            .id-arena-medal {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                font-size: 0.7rem;
                font-weight: 800;
            }

            .id-arena-gold {
                background: linear-gradient(135deg, #ffd700, #daa520);
                color: #000;
                box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
            }

            .id-arena-silver {
                background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
                color: #000;
                box-shadow: 0 0 6px rgba(192, 192, 192, 0.3);
            }

            .id-arena-bronze {
                background: linear-gradient(135deg, #cd7f32, #a0522d);
                color: #000;
                box-shadow: 0 0 6px rgba(205, 127, 50, 0.3);
            }

            /* Arena Detail Modal */
            .id-arena-detail-header {
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .id-arena-detail-name {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--id-gold);
                margin-bottom: 4px;
            }

            .id-arena-detail-box {
                font-size: 0.9rem;
                color: var(--id-text);
                margin-bottom: 4px;
            }

            .id-arena-detail-score {
                font-size: 0.8rem;
                color: var(--id-text-muted);
            }

            .id-arena-detail-summary {
                display: flex;
                gap: 16px;
                margin-top: 10px;
                padding: 10px 14px;
                background: rgba(255,255,255,0.03);
                border-radius: 6px;
                font-size: 0.8rem;
                color: var(--id-text-muted);
            }

            .id-arena-detail-stat {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .id-arena-detail-stat-val {
                font-weight: 700;
                font-size: 0.9rem;
            }

            .id-arena-detail-section {
                margin-bottom: 16px;
            }

            .id-arena-detail-subtitle {
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--id-text-muted);
                margin-bottom: 8px;
            }

            .id-arena-detail-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.8rem;
            }

            .id-arena-detail-table th {
                text-align: left;
                padding: 8px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 0.65rem;
                text-transform: uppercase;
                color: var(--id-text-muted);
            }

            .id-arena-detail-table td {
                padding: 8px;
                border-bottom: 1px solid rgba(255,255,255,0.04);
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
        exportGradesCSV: exportGradesCSV,
        exportArenaCSV: exportArenaCSV,
        showStudentDetail: showStudentDetail,
        showArenaDetail: showArenaDetail,
        openArenaAssignModal: openArenaAssignModal,
        submitArenaAssign: submitArenaAssign,
        showMergeModal: showMergeModal,
        previewMerge: previewMerge,
        submitMerge: submitMerge
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstructorDashboard;
}
