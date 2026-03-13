/**
 * Account Lookup — Find a student's UID by callsign or email.
 *
 * Usage:
 *   node account-lookup.js --callsign SCOTTYKNOWS
 *   node account-lookup.js --email scott@example.com
 *   node account-lookup.js --list                      # List all users
 */
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const args = process.argv.slice(2);

async function lookupByCallsign(callsign) {
    const lower = callsign.toLowerCase();
    const snap = await db.collection('users')
        .where('callsignLower', '==', lower)
        .get();

    if (snap.empty) {
        // Fallback: try exact match on callsign field
        const snap2 = await db.collection('users')
            .where('callsign', '==', callsign)
            .get();
        if (snap2.empty) {
            console.log('No user found with callsign:', callsign);
            return;
        }
        printResults(snap2);
        return;
    }
    printResults(snap);
}

async function lookupByEmail(email) {
    const snap = await db.collection('users')
        .where('email', '==', email.toLowerCase())
        .get();

    if (snap.empty) {
        console.log('No user found with email:', email);
        return;
    }
    printResults(snap);
}

async function listAll() {
    const snap = await db.collection('users').get();
    console.log('=== ALL USERS (' + snap.size + ') ===');
    console.log();
    console.log(pad('UID', 30), pad('CALLSIGN', 20), pad('EMAIL', 30), pad('XP', 8), pad('LVL', 5), 'HOUSE');
    console.log('-'.repeat(100));
    snap.docs.forEach(doc => {
        const d = doc.data();
        console.log(
            pad(doc.id, 30),
            pad(d.callsign || '(none)', 20),
            pad(d.email || '(none)', 30),
            pad(String(d.xp || 0), 8),
            pad(String(d.level || 1), 5),
            d.house || '(none)'
        );
    });
}

function pad(str, len) {
    str = String(str);
    return str.length >= len ? str.substring(0, len) : str + ' '.repeat(len - str.length);
}

function printResults(snap) {
    snap.docs.forEach(doc => {
        const d = doc.data();
        console.log('=== FOUND ===');
        console.log('  UID:       ', doc.id);
        console.log('  Callsign:  ', d.callsign || '(none)');
        console.log('  Email:     ', d.email || '(none)');
        console.log('  House:     ', d.house || '(none)');
        console.log('  XP:        ', d.xp || 0, '| Level:', d.level || 1);
        console.log('  Modules:   ', (d.modulesCompleted || []).length);
        console.log('  Labs:      ', (d.labsCompleted || []).length);
        console.log('  Achievements:', (d.achievements || []).length);
        console.log('  Streak:    ', d.streak || 0);
        console.log('  Anonymous: ', d.isAnonymous || false);
        console.log('  Created:   ', d.createdAt ? d.createdAt.toDate() : '(unknown)');
        console.log('  Last Active:', d.lastActivity ? d.lastActivity.toDate() : '(unknown)');
        console.log();
    });
}

async function main() {
    if (args.includes('--list')) {
        await listAll();
    } else if (args.includes('--callsign')) {
        const idx = args.indexOf('--callsign');
        const callsign = args[idx + 1];
        if (!callsign) {
            console.error('Usage: node account-lookup.js --callsign SCOTTYKNOWS');
            process.exit(1);
        }
        await lookupByCallsign(callsign);
    } else if (args.includes('--email')) {
        const idx = args.indexOf('--email');
        const email = args[idx + 1];
        if (!email) {
            console.error('Usage: node account-lookup.js --email scott@example.com');
            process.exit(1);
        }
        await lookupByEmail(email);
    } else {
        console.log('Account Lookup Tool');
        console.log();
        console.log('Usage:');
        console.log('  node account-lookup.js --callsign SCOTTYKNOWS');
        console.log('  node account-lookup.js --email scott@example.com');
        console.log('  node account-lookup.js --list');
    }
}

main().catch(console.error).finally(() => setTimeout(() => process.exit(0), 3000));
