#!/usr/bin/env node
/**
 * diag-pfi-csv-simulate.js — re-runs the post-fix _buildRawDataRows logic
 * against live Firestore data for the active PFI class. Outputs the same
 * 14-column rows the production CSV would produce, so we can verify the
 * fix without going through the browser export.
 *
 * Read-only.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const TENANT = 'python-april-2026';
const CLASS_ID = 'FRXlV8zW95eQ3CL6eWdc';

// Load the same course-map the production frontend uses
const mapText = fs.readFileSync(path.join(__dirname, '..', '_app/tenant/python-for-it-map.js'), 'utf8');
// crude eval — extract the JS object literal
const matchObj = mapText.match(/var PYTHON_FOR_IT_MAP\s*=\s*(\{[\s\S]+\});/);
if (!matchObj) { console.error('Could not extract PYTHON_FOR_IT_MAP'); process.exit(2); }
const PYTHON_FOR_IT_MAP = eval('(' + matchObj[1] + ')');

function csvEscape(v) {
    if (v == null) return '';
    var s = String(v);
    if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

// Mirrors the post-fix _buildRawDataRows in instructor.html (after 1bcdae1e)
function buildRawDataRows(students, courseMap) {
    var rows = [['Student Name', 'Student Email', 'Student UID', 'Status', 'Last Active', 'Total Time (min)', 'Chapter #', 'Chapter Title', 'Item Type', 'Item ID', 'Item Title', 'Completed', 'Score', 'Pass (>=70%)']];
    students.forEach(function(student) {
        var name = student.displayName || '';
        var email = student.email || '';
        var uid = student.studentUid || student.uid || '';
        var status = student.status || 'active';
        var lastActiveStr = '';
        if (student.lastActive) {
            var ts = student.lastActive._seconds ? student.lastActive._seconds * 1000 : new Date(student.lastActive).getTime();
            if (ts) lastActiveStr = new Date(ts).toISOString().substring(0, 19);
        }
        var timeMin = Math.round((student.totalTimeSpent || 0) / 60);
        var modulesCompleted = student.modulesCompleted || [];
        var quizScores = student.quizScores || {};
        var labsCompleted = student.labsCompleted || [];

        if (courseMap && courseMap.chapters) {
            courseMap.chapters.forEach(function(ch, chIdx) {
                (ch.items || []).forEach(function(item) {
                    var completed = false, score = '', pass = '';
                    // Post-fix unified lookup
                    if (modulesCompleted.indexOf(item.id) !== -1) completed = true;
                    if (labsCompleted.indexOf(item.id) !== -1) completed = true;
                    if (quizScores[item.id] != null) {
                        completed = true;
                        score = quizScores[item.id];
                        pass = (score >= 70) ? 'yes' : 'no';
                    }
                    rows.push([
                        csvEscape(name), csvEscape(email), csvEscape(uid), csvEscape(status),
                        lastActiveStr, timeMin,
                        (chIdx + 1), csvEscape(ch.title || ''),
                        csvEscape(item.type || ''), csvEscape(item.id || ''), csvEscape(item.title || ''),
                        completed ? 'yes' : 'no', score, pass
                    ]);
                });
            });
        }
    });
    return rows;
}

async function main() {
    const snap = await db.collection(`tenants/${TENANT}/classes/${CLASS_ID}/progress`).get();
    const students = [];
    snap.forEach(doc => {
        const data = doc.data();
        students.push({
            uid: doc.id,
            studentUid: doc.id,
            displayName: data.displayName || '',
            email: data.email || '',
            lastActive: data.lastActive || null,
            modulesCompleted: data.modulesCompleted || [],
            quizScores: data.quizScores || {},
            labsCompleted: data.labsCompleted || [],
            totalTimeSpent: data.totalTimeSpent || 0,
            status: data.status || 'active'
        });
    });

    console.log('Students fetched: ' + students.length);

    const rows = buildRawDataRows(students, PYTHON_FOR_IT_MAP);
    const totalRows = rows.length - 1;
    const yesRows = rows.slice(1).filter(r => r[11] === 'yes').length;
    const scoreRows = rows.slice(1).filter(r => r[12] !== '').length;

    console.log('Total CSV rows:           ' + totalRows);
    console.log('Rows with Completed=yes:  ' + yesRows);
    console.log('Rows with Score populated:' + scoreRows);
    console.log();

    // Per-student summary
    const byStudent = {};
    rows.slice(1).forEach(r => {
        const k = r[0]; // name (escaped)
        if (!byStudent[k]) byStudent[k] = { yes: 0, no: 0 };
        if (r[11] === 'yes') byStudent[k].yes++; else byStudent[k].no++;
    });
    console.log('Per-student totals:');
    Object.entries(byStudent).sort((a,b) => b[1].yes - a[1].yes).forEach(([name, c]) => {
        console.log('  ' + (c.yes + ' yes / ' + c.no + ' no').padEnd(20) + ' ' + name);
    });

    // Show Luis's three known completions
    console.log('\nLuis Diaz — verification of 3 known completions:');
    const luisRows = rows.slice(1).filter(r => r[0] === 'Luis Diaz');
    ['pfi-course-intro', 'pfi-w1-datatypes', 'pfi-sandbox-tour'].forEach(id => {
        const row = luisRows.find(r => r[9] === id);
        if (row) {
            console.log('  ' + id.padEnd(20) + ' → Completed=' + row[11] + (row[12] ? ' Score=' + row[12] : ''));
        } else {
            console.log('  ' + id.padEnd(20) + ' → NOT FOUND');
        }
    });

    // Save full CSV to disk
    const outFile = '/tmp/pfi-post-fix-simulation.csv';
    fs.writeFileSync(outFile, rows.map(r => r.join(',')).join('\n'));
    console.log('\nFull CSV written to: ' + outFile);

    process.exit(0);
}

main().catch(err => { console.error('FAILED:', err); process.exit(2); });
