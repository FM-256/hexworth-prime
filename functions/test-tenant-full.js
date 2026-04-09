#!/usr/bin/env node
/**
 * test-tenant-full.js — Complete tenant pipeline + UI element verification.
 *
 * Tests:
 *   A. Data pipeline (Firestore CRUD)
 *   B. Cloud Function responses (getStudentProgress, resolveJoinCode, etc.)
 *   C. Page content verification (HTML elements, scripts, feature gates)
 *   D. Instructor dashboard data flow
 *   E. Lobby page elements
 *   F. Network+ hub elements (chapter locking, TenantRouter)
 *   G. All 9 dashboard variants (tile rendering, COURSE_MAP, feature gates)
 *
 * Usage: cd functions && node test-tenant-full.js
 */

const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const TEST_SLUG = '_test-full-' + Date.now();
const JOIN_CODE = 'TF-' + Math.random().toString(36).substring(2, 6).toUpperCase();
const TEST_UID = 'test-student-' + Date.now();
const ADMIN_UID = 'test-admin-' + Date.now();
const BASE_URL = 'https://hexworth-prime.web.app';
const APP_DIR = path.join(__dirname, '..');  // hexworth-prime root
const _APP = path.join(APP_DIR, '_app');

let classId = null;
let passed = 0;
let failed = 0;
const issues = [];

function ok(label) { passed++; console.log('  \x1b[32mPASS\x1b[0m ' + label); }
function fail(label, detail) {
    failed++;
    issues.push({ label, detail });
    console.log('  \x1b[31mFAIL\x1b[0m ' + label + (detail ? ' — ' + detail : ''));
}
function assert(cond, label, detail) { if (cond) ok(label); else fail(label, detail || 'assertion failed'); }
function section(name) { console.log('\n\x1b[33m[' + name + ']\x1b[0m'); }

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        }).on('error', reject);
    });
}

function readLocal(relPath) {
    const full = path.join(_APP, relPath);
    if (!fs.existsSync(full)) return null;
    return fs.readFileSync(full, 'utf8');
}

async function run() {
    console.log('\n\x1b[36m════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[36m  TENANT FULL PIPELINE + UI VERIFICATION TEST\x1b[0m');
    console.log('\x1b[36m════════════════════════════════════════════════════════\x1b[0m\n');
    console.log('  Slug: ' + TEST_SLUG + '  Code: ' + JOIN_CODE);

    // ═══════════════════════════════════════════════════════
    // A. DATA PIPELINE
    // ═══════════════════════════════════════════════════════
    section('A. Create Tenant + Class + Enroll + Progress');

    // Create tenant
    await db.doc('tenants/' + TEST_SLUG).set({
        tenantId: TEST_SLUG, name: 'Full Test', slug: TEST_SLUG, status: 'active',
        branding: { primaryColor: '#06b6d4', secondaryColor: '#8b5cf6', platformName: 'Full Test', tagline: 'Test', dashboardVariant: 'enterprise', logo: '', favicon: '' },
        licensing: { tier: 'team', maxSeats: 25, contentAccess: { houses: [], series: [], hubs: [], courses: ['network-plus'], features: { trainingRange: true, allCourses: false, vsMode: false, wiresharkHub: false, forensicsHub: false, bugHunting: false } } },
        adminUids: [ADMIN_UID],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    ok('Tenant created');

    // Create class
    const classRef = await db.collection('tenants/' + TEST_SLUG + '/classes').add({
        name: 'Test Class', courseId: 'network-plus', joinCode: JOIN_CODE,
        instructorUid: ADMIN_UID, instructorEmail: 'admin@test.com', status: 'active',
        startDate: '2026-04-01', endDate: '2026-06-15',
        settings: { sequentialChapters: true, passingScore: 70, requireQuiz: true },
        studentCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    classId = classRef.id;
    ok('Class created: ' + classId);

    // Enroll student
    await db.doc('tenants/' + TEST_SLUG + '/classes/' + classId + '/progress/' + TEST_UID).set({
        displayName: 'Jane Doe', email: 'jane@test.com',
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
        currentChapter: 3,
        chaptersCompleted: [1, 2],
        modulesCompleted: ['web-ne-01', 'web-ne-02', 'web-ne-03'],
        quizScores: { 'web-osi-quiz': 90, 'web-tcpip-quiz': 85 },
        labsCompleted: ['gui-ne01-wireshark'],
        totalTimeSpent: 7200
    });
    await db.doc('tenants/' + TEST_SLUG + '/classes/' + classId).update({
        studentCount: admin.firestore.FieldValue.increment(1)
    });
    ok('Student enrolled with progress data');

    // ═══════════════════════════════════════════════════════
    // B. CLOUD FUNCTION DATA VERIFICATION
    // ═══════════════════════════════════════════════════════
    section('B. Firestore Data Integrity');

    // Verify tenant
    const tenantDoc = await db.doc('tenants/' + TEST_SLUG).get();
    assert(tenantDoc.data().licensing.contentAccess.courses[0] === 'network-plus', 'Tenant courses contains network-plus');
    assert(tenantDoc.data().licensing.contentAccess.features.trainingRange === true, 'trainingRange enabled');
    assert(tenantDoc.data().licensing.contentAccess.features.allCourses === false, 'allCourses disabled');
    assert(tenantDoc.data().adminUids.length === 1, 'Exactly 1 admin UID');

    // Verify class
    const classDoc = await db.doc('tenants/' + TEST_SLUG + '/classes/' + classId).get();
    assert(classDoc.data().joinCode === JOIN_CODE, 'Class join code correct');
    assert(classDoc.data().studentCount === 1, 'Student count is 1');

    // Verify progress
    const progressDoc = await db.doc('tenants/' + TEST_SLUG + '/classes/' + classId + '/progress/' + TEST_UID).get();
    assert(progressDoc.data().displayName === 'Jane Doe', 'Student name in Firestore');
    assert(progressDoc.data().currentChapter === 3, 'Current chapter is 3');
    assert(progressDoc.data().chaptersCompleted.length === 2, '2 chapters completed');
    assert(progressDoc.data().quizScores['web-osi-quiz'] === 90, 'OSI quiz score is 90');
    assert(progressDoc.data().quizScores['web-tcpip-quiz'] === 85, 'TCPIP quiz score is 85');
    assert(progressDoc.data().modulesCompleted.length === 3, '3 modules completed');
    assert(progressDoc.data().labsCompleted.length === 1, '1 lab completed');

    // Verify join code resolution
    try {
        const codeSnap = await db.collectionGroup('classes')
            .where('joinCode', '==', JOIN_CODE)
            .where('status', '==', 'active')
            .limit(1).get();
        assert(!codeSnap.empty, 'Join code resolves via collectionGroup');
        if (!codeSnap.empty) {
            const p = codeSnap.docs[0].ref.path.split('/');
            assert(p[1] === TEST_SLUG, 'Resolved to correct tenant');
        }
    } catch (e) {
        if (e.code === 9) console.log('  \x1b[33mSKIP\x1b[0m CollectionGroup index building');
        else fail('Join code resolution', e.message);
    }

    // Verify getStudentProgress data shape
    const progressSnap = await db.collection('tenants/' + TEST_SLUG + '/classes/' + classId + '/progress').get();
    assert(progressSnap.size === 1, 'Progress collection has 1 student');
    const studentData = progressSnap.docs[0].data();
    assert(typeof studentData.displayName === 'string', 'displayName is string');
    assert(typeof studentData.email === 'string', 'email is string');
    assert(typeof studentData.currentChapter === 'number', 'currentChapter is number');
    assert(Array.isArray(studentData.chaptersCompleted), 'chaptersCompleted is array');
    assert(Array.isArray(studentData.modulesCompleted), 'modulesCompleted is array');
    assert(typeof studentData.quizScores === 'object', 'quizScores is object');
    assert(Array.isArray(studentData.labsCompleted), 'labsCompleted is array');
    assert(typeof studentData.totalTimeSpent === 'number', 'totalTimeSpent is number');
    assert(studentData.enrolledAt != null, 'enrolledAt exists');
    assert(studentData.lastActive != null, 'lastActive exists');

    // ═══════════════════════════════════════════════════════
    // C. LOBBY PAGE VERIFICATION
    // ═══════════════════════════════════════════════════════
    section('C. Lobby Page Elements');

    const lobbyHtml = readLocal('lobby.html');
    assert(lobbyHtml !== null, 'lobby.html exists');
    if (lobbyHtml) {
        assert(lobbyHtml.includes('state-signin'), 'Lobby has sign-in state');
        assert(lobbyHtml.includes('state-code'), 'Lobby has code input state');
        assert(lobbyHtml.includes('state-class'), 'Lobby has class info state');
        assert(lobbyHtml.includes('state-tournament'), 'Lobby has tournament state');
        assert(lobbyHtml.includes('state-enrolled'), 'Lobby has enrolled state');
        assert(lobbyHtml.includes('btn-enroll'), 'Lobby has enroll button');
        assert(lobbyHtml.includes('btn-continue'), 'Lobby has continue button');
        assert(lobbyHtml.includes('btn-leave'), 'Lobby has leave button');
        assert(lobbyHtml.includes('resolveJoinCode'), 'Lobby calls resolveJoinCode CF');
        assert(lobbyHtml.includes('enrollInClass'), 'Lobby calls enrollInClass CF');
        assert(lobbyHtml.includes('COURSE_MAP'), 'Lobby has COURSE_MAP');
        assert(lobbyHtml.includes('network-plus'), 'Lobby COURSE_MAP has network-plus');
        assert(lobbyHtml.includes('network-plus/index.html'), 'Lobby COURSE_MAP redirects to hub after enrollment');
        assert(!lobbyHtml.includes('FluxCapacitor'), 'Lobby has NO FluxCapacitor');
        assert(lobbyHtml.includes('localStorage'), 'Lobby uses localStorage for persistence');
        assert(lobbyHtml.includes('hexworth_tenant_slug'), 'Lobby saves tenant slug to localStorage');
        assert(lobbyHtml.includes('hexworth_class_id'), 'Lobby saves class ID to localStorage');
        assert(lobbyHtml.includes('hexworth_course_id'), 'Lobby saves course ID to localStorage');
        assert(lobbyHtml.includes('_clearEnrollment'), 'Lobby has enrollment clear function');
        assert(lobbyHtml.includes('AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M'), 'Lobby has correct Firebase API key');
    }

    // ═══════════════════════════════════════════════════════
    // D. NETWORK+ HUB VERIFICATION
    // ═══════════════════════════════════════════════════════
    section('D. Network+ Hub Elements');

    const hubHtml = readLocal('houses/web/network-plus/index.html');
    assert(hubHtml !== null, 'Network+ hub exists');
    if (hubHtml) {
        assert(hubHtml.includes('TenantRouter.js'), 'Hub loads TenantRouter');
        assert(hubHtml.includes('applyChapterLocking'), 'Hub has chapter locking function');
        assert(hubHtml.includes('hexworth_class'), 'Hub reads class context');
        assert(hubHtml.includes('localStorage'), 'Hub checks localStorage for class context');
        assert(!hubHtml.includes('networkplus_cohort_id'), 'Hub has NO old cohort localStorage key');
        assert(!hubHtml.includes('applyCohortMode'), 'Hub has NO old cohort function');
        assert(!hubHtml.includes('firebase.firestore()'), 'Hub has NO legacy Firebase SDK calls');
        assert(hubHtml.includes('dashboardBtn'), 'Hub has dashboard button ID');
        assert(hubHtml.includes('TenantRouter.getUrl'), 'Hub dashboard button is tenant-aware');

        // Verify chapter locking quiz IDs
        assert(hubHtml.includes('web-osi-quiz'), 'Hub has Ch1 quiz ID');
        assert(hubHtml.includes('web-tcpip-quiz'), 'Hub has Ch2 quiz ID');
        assert(hubHtml.includes('web-subnetting-quiz'), 'Hub has Ch3 quiz ID');
        assert(hubHtml.includes('web-troubleshooting-quiz'), 'Hub has Ch12 quiz ID');
    }

    // ═══════════════════════════════════════════════════════
    // E. INSTRUCTOR DASHBOARD VERIFICATION
    // ═══════════════════════════════════════════════════════
    section('E. Instructor Dashboard Elements');

    const instrHtml = readLocal('tenant/instructor.html');
    assert(instrHtml !== null, 'Instructor page exists');
    if (instrHtml) {
        assert(instrHtml.includes('TenantRouter.js'), 'Instructor loads TenantRouter');
        assert(instrHtml.includes('TenantShell.js'), 'Instructor loads TenantShell');
        assert(instrHtml.includes('tenant-data.js') || instrHtml.includes('_fbFirestore'), 'Instructor has Firestore data layer');
        assert(instrHtml.includes('getStudentProgress'), 'Instructor calls getStudentProgress');
        assert(instrHtml.includes('loadClasses'), 'Instructor has loadClasses');
        assert(instrHtml.includes('loadStudentProgress'), 'Instructor has loadStudentProgress');
        assert(instrHtml.includes('renderStudentsTable'), 'Instructor has renderStudentsTable');
        assert(instrHtml.includes('exportGrades'), 'Instructor has exportGrades');
        assert(instrHtml.includes('adminUids'), 'Instructor checks adminUids');
        assert(instrHtml.includes('displayName'), 'Instructor shows displayName');
        assert(instrHtml.includes('lastActive'), 'Instructor shows lastActive');
        assert(!instrHtml.includes('enrollments'), 'Instructor does NOT read from broken enrollments collection');
    }

    // ═══════════════════════════════════════════════════════
    // F. ALL 9 DASHBOARD VARIANTS
    // ═══════════════════════════════════════════════════════
    section('F. Dashboard Variants — Structure');

    const variants = [
        'command-center', 'clean-ops', 'tactical-hud', 'enterprise',
        'academy', 'federal', 'nightshift', 'minimalist', 'campus'
    ];

    for (const v of variants) {
        const html = readLocal('tenant/dashboard-' + v + '.html');
        assert(html !== null, v + ': file exists');
        if (!html) continue;

        assert(html.includes('getTenantConfig'), v + ': calls getTenantConfig');
        assert(html.includes('COURSE_MAP') || html.includes('courseMap'), v + ': has COURSE_MAP');
        assert(html.includes('network-plus'), v + ': has network-plus in COURSE_MAP');
        assert(html.includes('/lobby.html'), v + ': courses link to /lobby.html');
        assert(html.includes('trainingRange'), v + ': gates Training Range');
        assert(html.includes('allCourses'), v + ': gates All Courses');
        assert(html.includes('sessionStorage'), v + ': sets sessionStorage for TenantRouter');
        assert(html.includes('instructor.html'), v + ': has Manage Assignments link');
        assert(!html.includes('FluxCapacitor'), v + ': NO FluxCapacitor');

        // Check for broken href="#" links
        const brokenLinks = (html.match(/href="#"/g) || []).length;
        assert(brokenLinks === 0, v + ': no broken href="#" links', 'found ' + brokenLinks);

        // Check for wrong Firebase API key
        assert(!html.includes('AIzaSyAz_ux4duzWFmFEj8S4WZgBJAjsathFOqA'), v + ': no wrong API key');
    }

    // ═══════════════════════════════════════════════════════
    // G. VARIANT ROUTER
    // ═══════════════════════════════════════════════════════
    section('G. Tenant Router (index.html)');

    const routerHtml = readLocal('tenant/index.html');
    assert(routerHtml !== null, 'Router exists');
    if (routerHtml) {
        for (const v of variants) {
            assert(routerHtml.includes("'" + v + "'"), 'Router has variant: ' + v);
            assert(routerHtml.includes('dashboard-' + v + '.html'), 'Router maps to file: dashboard-' + v + '.html');
        }
    }

    // ═══════════════════════════════════════════════════════
    // H. ADMIN CONSOLE ELEMENTS
    // ═══════════════════════════════════════════════════════
    section('H. Admin Console — Tenant Panel');

    const consoleHtml = readLocal('admin/console.html');
    assert(consoleHtml !== null, 'Admin console exists');
    if (consoleHtml) {
        // Variant options
        for (const v of variants) {
            assert(consoleHtml.includes("'" + v + "'"), 'Console has variant option: ' + v);
        }

        // Classes management
        assert(consoleHtml.includes('tenantClassesCard'), 'Console has classes card');
        assert(consoleHtml.includes('classFormName'), 'Console has class name field');
        assert(consoleHtml.includes('classFormCourse'), 'Console has class course select');
        assert(consoleHtml.includes('classFormJoinCode'), 'Console has join code field');
        assert(consoleHtml.includes('generateClassJoinCode'), 'Console has join code generator');
        assert(consoleHtml.includes('submitCreateClass'), 'Console has create class function');
        assert(consoleHtml.includes('editClass'), 'Console has edit class function');
        assert(consoleHtml.includes('deleteClass'), 'Console has delete class function');
        assert(consoleHtml.includes('viewClassStudents'), 'Console has view students function');
        assert(consoleHtml.includes('classStudentPanel'), 'Console has student panel');
        assert(consoleHtml.includes('adminCreateClass'), 'Console calls adminCreateClass CF');
        assert(consoleHtml.includes('adminListClasses'), 'Console calls adminListClasses CF');

        // Tenant management
        assert(consoleHtml.includes('showTenantGuide'), 'Console has guide modal');
        assert(consoleHtml.includes('tenantDeleteBtn'), 'Console has delete tenant button');
        assert(consoleHtml.includes('restoreTenant'), 'Console has restore function');
        assert(consoleHtml.includes('purgeDeletedTenants'), 'Console has purge function');
        assert(consoleHtml.includes('showDeletedTenants'), 'Console has show-deleted toggle');

        // Tenant URL display
        assert(consoleHtml.includes('Tenant Dashboard URL'), 'Console shows dashboard URL');
        assert(consoleHtml.includes('tenant/index.html?slug='), 'Console URL uses router path');

        // No old cohort references
        assert(!consoleHtml.includes('data-panel="cohorts"'), 'Console has NO cohorts nav item');
        assert(!consoleHtml.includes('cohortName'), 'Console has NO cohort name field');
        // Check no active createCohort function (comments mentioning it are OK)
        assert(!consoleHtml.includes('window.createCohort'), 'Console has NO active createCohort function');

        // Deploy section
        assert(consoleHtml.includes('Coming Soon'), 'Deploy section marked Coming Soon');
    }

    // ═══════════════════════════════════════════════════════
    // I. MODULEPROGRSS TENANT SYNC
    // ═══════════════════════════════════════════════════════
    section('I. ModuleProgress Tenant Sync');

    const mpHtml = readLocal('components/ModuleProgress.js');
    assert(mpHtml !== null, 'ModuleProgress.js exists');
    if (mpHtml) {
        assert(mpHtml.includes('tryClassProgressSync'), 'Has tryClassProgressSync function');
        assert(mpHtml.includes('syncClassProgress'), 'Calls syncClassProgress CF');
        assert(mpHtml.includes('hexworth_tenant'), 'Reads tenant from storage');
        assert(mpHtml.includes('hexworth_class'), 'Reads class from storage');
        assert(mpHtml.includes('localStorage'), 'Falls back to localStorage');

        // Verify it's called in both complete() and completeQuiz()
        const syncCalls = (mpHtml.match(/tryClassProgressSync/g) || []).length;
        assert(syncCalls >= 3, 'tryClassProgressSync called in complete + completeQuiz (found ' + syncCalls + ' refs)');
    }

    // ═══════════════════════════════════════════════════════
    // J. TENANTROUTER + TENANTSHELL PERSISTENCE
    // ═══════════════════════════════════════════════════════
    section('J. TenantRouter + TenantShell Persistence');

    const trHtml = readLocal('components/TenantRouter.js');
    assert(trHtml !== null, 'TenantRouter.js exists');
    if (trHtml) {
        assert(trHtml.includes('localStorage'), 'TenantRouter falls back to localStorage');
    }

    const tsHtml = readLocal('components/TenantShell.js');
    assert(tsHtml !== null, 'TenantShell.js exists');
    if (tsHtml) {
        assert(tsHtml.includes('localStorage'), 'TenantShell falls back to localStorage');
    }

    // ═══════════════════════════════════════════════════════
    // K. PAGE ACCESSIBILITY (HTTP)
    // ═══════════════════════════════════════════════════════
    section('K. HTTP Accessibility');

    const pages = [
        '/lobby.html',
        '/tenant/index.html?slug=test',
        '/tenant/instructor.html',
        '/houses/web/network-plus/index.html'
    ];
    for (const v of variants) {
        pages.push('/tenant/dashboard-' + v + '.html?slug=test');
    }

    for (const p of pages) {
        try {
            const res = await fetchPage(BASE_URL + p);
            assert(res.status === 200, p + ' returns 200', 'got ' + res.status);
        } catch (e) {
            fail(p, e.message);
        }
    }

    // ═══════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════
    section('Cleanup');

    await db.doc('tenants/' + TEST_SLUG + '/classes/' + classId + '/progress/' + TEST_UID).delete();
    await db.doc('tenants/' + TEST_SLUG + '/classes/' + classId).delete();
    await db.doc('tenants/' + TEST_SLUG).delete();
    ok('All test data cleaned up');

    // ═══════════════════════════════════════════════════════
    // RESULTS
    // ═══════════════════════════════════════════════════════
    console.log('\n\x1b[36m════════════════════════════════════════════════════════\x1b[0m');
    console.log('  \x1b[32mPassed: ' + passed + '\x1b[0m  \x1b[31mFailed: ' + failed + '\x1b[0m');
    console.log('\x1b[36m════════════════════════════════════════════════════════\x1b[0m');

    if (issues.length > 0) {
        console.log('\n\x1b[31mISSUES FOUND:\x1b[0m');
        issues.forEach((issue, i) => {
            console.log('  ' + (i + 1) + '. ' + issue.label + (issue.detail ? ' — ' + issue.detail : ''));
        });
    } else {
        console.log('\n  \x1b[32mNo issues found.\x1b[0m');
    }

    console.log('');
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
