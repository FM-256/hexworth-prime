#!/usr/bin/env node
/**
 * Test CLH insight validation against Firebase emulator.
 * Verifies the evaluateClhInsight handler works correctly.
 *
 * Usage: node test-clh-insights.js
 * Requires: Firebase emulators running (functions + firestore)
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8181';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

const FUNC_URL = 'http://localhost:5001/hexworth-prime/us-central1/validateChallenge';

let passed = 0;
let failed = 0;

async function test(name, payload, expectFn) {
    try {
        const res = await fetch(FUNC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer owner'
            },
            body: JSON.stringify({ data: payload })
        });
        const json = await res.json();

        // Cloud Functions wraps in { result: ... } or { error: ... }
        if (json.error) {
            if (expectFn({ error: json.error })) {
                passed++;
                console.log(`  PASS: ${name}`);
            } else {
                failed++;
                console.log(`  FAIL: ${name} — unexpected error: ${JSON.stringify(json.error)}`);
            }
            return;
        }

        const result = json.result;
        if (expectFn(result)) {
            passed++;
            console.log(`  PASS: ${name}`);
        } else {
            failed++;
            console.log(`  FAIL: ${name} — got: ${JSON.stringify(result)}`);
        }
    } catch (err) {
        failed++;
        console.log(`  FAIL: ${name} — ${err.message}`);
    }
}

async function seedTestData() {
    const batch = db.batch();

    // Seed CLH metadata
    batch.set(db.doc('challenge_registry/clh'), {
        type: 'clh-insight',
        totalModules: 3,
        updatedAt: new Date().toISOString()
    });

    // Seed test modules
    batch.set(db.doc('challenge_registry/clh/insights/CLH-005'), {
        question: 'What is the password to the vault?',
        acceptedAnswers: ['shadow', 'shadow123', '/etc/shadow', 'the shadow file', 'shadow file', 'check /etc/shadow', 'look in /etc/shadow', '/etc/shadow file'],
        correctMessage: 'Correct! The shadow file contains the password hashes.',
        wrongMessage: 'Not quite. Look for hidden files in the intel directory.'
    });

    batch.set(db.doc('challenge_registry/clh/insights/CLH-012'), {
        question: 'What port is the web server running on?',
        acceptedAnswers: ['8080', 'port 8080', '8080/tcp'],
        correctMessage: 'Correct! The web server is running on port 8080.',
        wrongMessage: 'Check the netstat or ss output more carefully.'
    });

    batch.set(db.doc('challenge_registry/clh/insights/CLH-029'), {
        question: 'What command exits vim?',
        acceptedAnswers: [':q', ':q!'],
        correctMessage: 'Correct! :q exits vim (use :q! to force quit).',
        wrongMessage: 'Try the standard vim exit commands.'
    });

    await batch.commit();
    console.log('Test data seeded.\n');
}

async function runTests() {
    await seedTestData();

    console.log('--- Correct Answers ---');

    await test('CLH-005 correct (exact)', {
        challengeId: 'clh-insight',
        levelId: 'CLH-005',
        userInput: 'shadow'
    }, r => r.success === true && r.feedback.includes('shadow file'));

    await test('CLH-005 correct (variant)', {
        challengeId: 'clh-insight',
        levelId: 'CLH-005',
        userInput: '/etc/shadow'
    }, r => r.success === true);

    await test('CLH-005 correct (case insensitive)', {
        challengeId: 'clh-insight',
        levelId: 'CLH-005',
        userInput: 'SHADOW'
    }, r => r.success === true);

    await test('CLH-012 correct', {
        challengeId: 'clh-insight',
        levelId: 'CLH-012',
        userInput: '8080'
    }, r => r.success === true && r.feedback.includes('8080'));

    await test('CLH-029 correct (:q)', {
        challengeId: 'clh-insight',
        levelId: 'CLH-029',
        userInput: ':q'
    }, r => r.success === true);

    await test('CLH-029 correct (:q!)', {
        challengeId: 'clh-insight',
        levelId: 'CLH-029',
        userInput: ':q!'
    }, r => r.success === true);

    console.log('\n--- Wrong Answers ---');

    await test('CLH-005 wrong answer', {
        challengeId: 'clh-insight',
        levelId: 'CLH-005',
        userInput: 'password123'
    }, r => r.success === false && r.feedback.includes('hidden files'));

    await test('CLH-012 wrong answer', {
        challengeId: 'clh-insight',
        levelId: 'CLH-012',
        userInput: '443'
    }, r => r.success === false && r.feedback.includes('netstat'));

    await test('CLH-029 wrong answer', {
        challengeId: 'clh-insight',
        levelId: 'CLH-029',
        userInput: 'exit'
    }, r => r.success === false);

    console.log('\n--- Edge Cases ---');

    await test('Empty input', {
        challengeId: 'clh-insight',
        levelId: 'CLH-005',
        userInput: ''
    }, r => r.error || r.success === false);

    await test('Whitespace only', {
        challengeId: 'clh-insight',
        levelId: 'CLH-005',
        userInput: '   '
    }, r => r.error || r.success === false);

    await test('Nonexistent module', {
        challengeId: 'clh-insight',
        levelId: 'CLH-999',
        userInput: 'test'
    }, r => r.error !== undefined);

    await test('Missing levelId', {
        challengeId: 'clh-insight',
        userInput: 'test'
    }, r => r.error !== undefined);

    await test('Missing userInput', {
        challengeId: 'clh-insight',
        levelId: 'CLH-005'
    }, r => r.error || r.success === false);

    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Test runner error:', err.message);
    process.exit(1);
});
