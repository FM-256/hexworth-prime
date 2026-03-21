#!/usr/bin/env node
/**
 * seed-demo-tenant.js — Pre-populate the hexworth-academy demo tenant
 * with realistic sample data for live demos and university pitches.
 *
 * Creates:
 *   - 1 sample class (CYB-301 Fall 2026)
 *   - 8 assignments (missions)
 *   - 5 students with varied progress
 *   - Updates tenant feature flags
 *
 * Idempotent: uses set() with explicit doc IDs — safe to run multiple times.
 *
 * Usage:
 *   GOOGLE_CLOUD_PROJECT=hexworth-prime node seed-demo-tenant.js
 *
 * @version 1.0.0
 * @feature WL-7
 */

'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

// ── Initialize ───────────────────────────────────────────────
initializeApp();
const db = getFirestore();

const TENANT_ID = 'hexworth-academy';
const CLASS_ID = 'cyb301-fall2026';
const CLASS_PATH = `tenants/${TENANT_ID}/classes/${CLASS_ID}`;

// ── Helpers ──────────────────────────────────────────────────

/** Return a Firestore Timestamp N days from now */
function daysFromNow(days) {
    return Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
}

/** Return a Firestore Timestamp N days ago */
function daysAgo(days) {
    return Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

// ── 1. Sample Class ─────────────────────────────────────────

const SAMPLE_CLASS = {
    name: 'CYB-301 Cybersecurity Fundamentals',
    section: 'Fall 2026 - Section A',
    instructor: 'Dr. Martinez',
    semester: 'Fall 2026',
    enrolledCount: 5,
    status: 'active',
    createdAt: FieldValue.serverTimestamp()
};

// ── 2. Assignments ──────────────────────────────────────────

const ASSIGNMENTS = [
    {
        id: 'mission-phantom-shell',
        title: 'Phantom Shell CTF',
        description: 'Exploit a vulnerable web shell to gain root access on a simulated production server. Apply enumeration, privilege escalation, and lateral movement techniques.',
        contentType: 'box',
        contentId: 'a3-phantom-shell',
        points: 100,
        dueDate: daysFromNow(7),
        order: 1
    },
    {
        id: 'mission-network-quiz',
        title: 'Network Fundamentals Quiz',
        description: 'Demonstrate understanding of the OSI model, TCP/IP stack, and common network protocols through a timed assessment.',
        contentType: 'quiz',
        contentId: 'web-osi-quiz',
        points: 50,
        dueDate: daysFromNow(3),
        order: 2
    },
    {
        id: 'mission-wireshark-tcp',
        title: 'Wireshark Packet Analysis',
        description: 'Analyze a TCP packet capture to identify anomalous traffic patterns, extract credentials, and reconstruct a multi-stage attack chain.',
        contentType: 'module',
        contentId: 'ws-pa-04-tcp',
        points: 75,
        dueDate: daysFromNow(10),
        order: 3
    },
    {
        id: 'mission-sql-injection',
        title: 'SQL Injection Defense Lab',
        description: 'Build and test parameterized queries, input validation, and WAF rules to defend a web application against SQL injection attacks.',
        contentType: 'lab',
        contentId: 'shield-sql-injection-defense',
        points: 100,
        dueDate: daysFromNow(14),
        order: 4
    },
    {
        id: 'mission-incident-response',
        title: 'Incident Response Forensics',
        description: 'Walk through a complete IR workflow: detection, containment, evidence collection, and post-incident reporting on a compromised endpoint.',
        contentType: 'module',
        contentId: 'df-57-incident-response',
        points: 75,
        dueDate: daysFromNow(21),
        order: 5
    },
    {
        id: 'mission-red-vs-blue',
        title: 'Red vs Blue Exercise',
        description: 'Compete in a live attack-defense scenario. Red team exploits vulnerabilities while blue team detects and responds in real time.',
        contentType: 'box',
        contentId: 'pr7-red-vs-blue',
        points: 150,
        dueDate: daysFromNow(28),
        order: 6
    },
    {
        id: 'mission-crypto-fundamentals',
        title: 'Cryptography Fundamentals',
        description: 'Review symmetric and asymmetric encryption, hashing algorithms, and PKI certificate chains through an interactive presentation.',
        contentType: 'presentation',
        contentId: 'key-cryptography-fundamentals',
        points: 25,
        dueDate: daysFromNow(5),
        order: 7
    },
    {
        id: 'mission-final-ctf',
        title: 'Final CTF Challenge',
        description: 'Capstone challenge combining web exploitation, cryptography, forensics, and network analysis across multiple attack surfaces.',
        contentType: 'box',
        contentId: 'a20-project-chimera',
        points: 200,
        dueDate: daysFromNow(35),
        order: 8
    }
];

// ── 3. Student Progress ─────────────────────────────────────

// Helper to build a completed assignment entry
function completed(score, daysAgoStarted, daysAgoCompleted) {
    return {
        status: 'completed',
        score,
        startedAt: daysAgo(daysAgoStarted),
        completedAt: daysAgo(daysAgoCompleted)
    };
}

function inProgress(daysAgoStarted) {
    return {
        status: 'in_progress',
        startedAt: daysAgo(daysAgoStarted)
    };
}

function notStarted() {
    return { status: 'not_started' };
}

const STUDENTS = [
    {
        uid: 'student-001',
        callsign: 'NOVA',
        profile: 'Top performer — consistently ahead of schedule',
        assignments: {
            'mission-phantom-shell':    completed(95, 14, 10),
            'mission-network-quiz':     completed(100, 12, 12),
            'mission-wireshark-tcp':    completed(88, 10, 7),
            'mission-sql-injection':    completed(92, 8, 5),
            'mission-incident-response': completed(90, 6, 3),
            'mission-red-vs-blue':      completed(97, 4, 2),
            'mission-crypto-fundamentals': inProgress(1),
            'mission-final-ctf':        notStarted()
        }
    },
    {
        uid: 'student-002',
        callsign: 'CIPHER',
        profile: 'Solid mid-range performer, steady pace',
        assignments: {
            'mission-phantom-shell':    completed(78, 12, 9),
            'mission-network-quiz':     completed(85, 10, 10),
            'mission-wireshark-tcp':    completed(72, 8, 5),
            'mission-sql-injection':    completed(80, 6, 3),
            'mission-incident-response': inProgress(2),
            'mission-red-vs-blue':      notStarted(),
            'mission-crypto-fundamentals': notStarted(),
            'mission-final-ctf':        notStarted()
        }
    },
    {
        uid: 'student-003',
        callsign: 'GHOST',
        profile: 'Struggling — needs additional support',
        assignments: {
            'mission-phantom-shell':    completed(62, 14, 11),
            'mission-network-quiz':     completed(58, 10, 9),
            'mission-wireshark-tcp':    inProgress(4),
            'mission-sql-injection':    notStarted(),
            'mission-incident-response': notStarted(),
            'mission-red-vs-blue':      notStarted(),
            'mission-crypto-fundamentals': notStarted(),
            'mission-final-ctf':        notStarted()
        }
    },
    {
        uid: 'student-004',
        callsign: 'SPARK',
        profile: 'New student — just enrolled, showing initiative',
        assignments: {
            'mission-phantom-shell':    inProgress(2),
            'mission-network-quiz':     completed(91, 3, 2),
            'mission-wireshark-tcp':    notStarted(),
            'mission-sql-injection':    notStarted(),
            'mission-incident-response': notStarted(),
            'mission-red-vs-blue':      notStarted(),
            'mission-crypto-fundamentals': notStarted(),
            'mission-final-ctf':        notStarted()
        }
    },
    {
        uid: 'student-005',
        callsign: 'ECHO',
        profile: 'Behind schedule — has not started any assignments',
        assignments: {
            'mission-phantom-shell':    notStarted(),
            'mission-network-quiz':     notStarted(),
            'mission-wireshark-tcp':    notStarted(),
            'mission-sql-injection':    notStarted(),
            'mission-incident-response': notStarted(),
            'mission-red-vs-blue':      notStarted(),
            'mission-crypto-fundamentals': notStarted(),
            'mission-final-ctf':        notStarted()
        }
    }
];

// ── 4. Tenant Config Update ─────────────────────────────────

const TENANT_UPDATES = {
    'licensing.contentAccess.features.vsMode': true,
    'licensing.contentAccess.features.wiresharkHub': true,
    'licensing.contentAccess.features.forensicsHub': true,
    'licensing.contentAccess.features.bugHunting': true,
    'demoClassId': CLASS_ID,
    updatedAt: new Date().toISOString()
};

// ── Seed Runner ─────────────────────────────────────────────

async function seed() {
    console.log('');
    console.log('\x1b[1m  HEXWORTH ACADEMY — Demo Tenant Seed\x1b[0m');
    console.log('\x1b[2m' + '  ' + '\u2500'.repeat(50) + '\x1b[0m');
    console.log('');

    // Verify tenant exists
    const tenantDoc = await db.doc(`tenants/${TENANT_ID}`).get();
    if (!tenantDoc.exists) {
        console.error(`\x1b[31m  ERROR: Tenant "${TENANT_ID}" not found.\x1b[0m`);
        console.error('  Run: node tenant-admin.js create --slug hexworth-academy --name "Hexworth Academy" --tier academy');
        process.exit(1);
    }
    console.log(`  \x1b[32m[ok]\x1b[0m Tenant "${TENANT_ID}" found`);

    // 1. Create class
    await db.doc(CLASS_PATH).set(SAMPLE_CLASS);
    console.log(`  \x1b[32m[ok]\x1b[0m Class: ${SAMPLE_CLASS.name}`);

    // 2. Create assignments
    const batch1 = db.batch();
    for (const a of ASSIGNMENTS) {
        const ref = db.doc(`${CLASS_PATH}/assignments/${a.id}`);
        batch1.set(ref, {
            title: a.title,
            description: a.description,
            contentType: a.contentType,
            contentId: a.contentId,
            dueDate: a.dueDate,
            points: a.points,
            status: 'active',
            order: a.order,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: 'admin-seed'
        });
    }
    await batch1.commit();
    console.log(`  \x1b[32m[ok]\x1b[0m Assignments: ${ASSIGNMENTS.length} missions created`);

    for (const a of ASSIGNMENTS) {
        console.log(`       ${String(a.order).padStart(2)}. ${a.title} (${a.contentType}, ${a.points}pts)`);
    }

    // 3. Create student progress
    const batch2 = db.batch();
    for (const s of STUDENTS) {
        const ref = db.doc(`${CLASS_PATH}/progress/${s.uid}`);
        batch2.set(ref, {
            callsign: s.callsign,
            assignments: s.assignments,
            updatedAt: FieldValue.serverTimestamp()
        });
    }
    await batch2.commit();
    console.log(`  \x1b[32m[ok]\x1b[0m Students: ${STUDENTS.length} progress records`);

    for (const s of STUDENTS) {
        const done = Object.values(s.assignments).filter(a => a.status === 'completed').length;
        const total = Object.keys(s.assignments).length;
        const bar = '\u2588'.repeat(done) + '\u2591'.repeat(total - done);
        console.log(`       ${s.callsign.padEnd(8)} ${bar} ${done}/${total}`);
    }

    // 4. Update tenant config
    await db.doc(`tenants/${TENANT_ID}`).update(TENANT_UPDATES);
    console.log(`  \x1b[32m[ok]\x1b[0m Tenant config updated (features + demoClassId)`);

    console.log('');
    console.log('\x1b[32m  Seed complete.\x1b[0m');
    console.log(`  View: /tenant/index.html?slug=${TENANT_ID}`);
    console.log('');
}

// ── Main ────────────────────────────────────────────────────

seed()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('\x1b[31m  SEED FAILED:\x1b[0m', err.message);
        process.exit(1);
    });
