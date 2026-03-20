#!/usr/bin/env node
/**
 * tenant-admin.js — CLI for managing white-label tenants
 *
 * Usage:
 *   node tenant-admin.js create --slug university-x --name "University X Cyber Range" --tier academy
 *   node tenant-admin.js update --slug university-x --primary-color "#1e40af"
 *   node tenant-admin.js list
 *   node tenant-admin.js show --slug university-x
 *   node tenant-admin.js add-admin --slug university-x --uid firebase-uid-here
 *   node tenant-admin.js set-content --slug university-x --series a,b,c --houses shield,eye
 *   node tenant-admin.js deactivate --slug university-x
 *
 * Requires: firebase-admin (already in functions/package.json)
 * Auth: Uses Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS
 *
 * @version 1.0.0
 * @feature WL-1
 */

'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// ── Initialize Firebase Admin ──────────────────────────────
initializeApp();
const db = getFirestore();
const COLLECTION = 'tenants';

// ── Default tenant template ────────────────────────────────
// New tenants start with this structure. Fields get overridden
// by CLI arguments. The schema is the single source of truth
// for what a tenant document looks like.

function createDefaultTenant(slug, name, tier) {
    return {
        tenantId: slug,
        name: name,
        slug: slug,

        branding: {
            logo: '',
            favicon: '',
            primaryColor: '#06b6d4',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#0a0a0f',
            headerColor: '#0d1117',
            fontFamily: 'Inter, system-ui, sans-serif',
            customCSS: '',
            platformName: name,
            tagline: 'Cybersecurity Training Platform',
            terminology: {}
        },

        licensing: {
            tier: tier,
            contentAccess: {
                series: [],          // Empty = all series
                houses: [],          // Empty = all houses
                hubs: [],            // Empty = all hubs
                features: {
                    vsMode: tier === 'academy' || tier === 'enterprise',
                    chatbots: tier === 'enterprise',
                    bugHunting: true,
                    codeRunner: true,
                    wiresharkHub: true,
                    forensicsHub: true
                }
            },
            maxSeats: tier === 'analyst' ? 1 :
                      tier === 'team' ? 25 :
                      tier === 'academy' ? 200 :
                      9999,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },

        domain: {
            type: 'subdomain',
            subdomain: slug,
            customDomain: null
        },

        auth: {
            method: 'firebase',
            allowAnonymous: false,
            allowGoogleSSO: true,
            samlConfig: null,
            oidcConfig: null
        },

        adminUids: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
    };
}

// ── CLI Commands ───────────────────────────────────────────

async function cmdCreate(args) {
    const slug = args['slug'];
    const name = args['name'] || slug;
    const tier = args['tier'] || 'team';

    if (!slug) {
        console.error('Usage: node tenant-admin.js create --slug <slug> --name "<name>" --tier <tier>');
        process.exit(1);
    }

    // Check if already exists
    const existing = await db.doc(`${COLLECTION}/${slug}`).get();
    if (existing.exists) {
        console.error(`Tenant "${slug}" already exists. Use 'update' to modify.`);
        process.exit(1);
    }

    const tenant = createDefaultTenant(slug, name, tier);

    // Apply optional overrides
    if (args['primary-color']) tenant.branding.primaryColor = args['primary-color'];
    if (args['secondary-color']) tenant.branding.secondaryColor = args['secondary-color'];
    if (args['logo']) tenant.branding.logo = args['logo'];
    if (args['tagline']) tenant.branding.tagline = args['tagline'];
    if (args['max-seats']) tenant.licensing.maxSeats = parseInt(args['max-seats']);

    await db.doc(`${COLLECTION}/${slug}`).set(tenant);

    console.log('');
    console.log('\x1b[32mTenant created:\x1b[0m');
    console.log(`  Slug:     ${slug}`);
    console.log(`  Name:     ${name}`);
    console.log(`  Tier:     ${tier}`);
    console.log(`  Seats:    ${tenant.licensing.maxSeats}`);
    console.log(`  Expires:  ${tenant.licensing.expiresAt.split('T')[0]}`);
    console.log(`  URL:      ${slug}.hexworth.app`);
    console.log('');
}

async function cmdUpdate(args) {
    const slug = args['slug'];
    if (!slug) {
        console.error('Usage: node tenant-admin.js update --slug <slug> [--field value]');
        process.exit(1);
    }

    const ref = db.doc(`${COLLECTION}/${slug}`);
    const doc = await ref.get();
    if (!doc.exists) {
        console.error(`Tenant "${slug}" not found.`);
        process.exit(1);
    }

    const updates = { updatedAt: new Date().toISOString() };

    // Branding updates
    if (args['name']) { updates['name'] = args['name']; updates['branding.platformName'] = args['name']; }
    if (args['primary-color']) updates['branding.primaryColor'] = args['primary-color'];
    if (args['secondary-color']) updates['branding.secondaryColor'] = args['secondary-color'];
    if (args['logo']) updates['branding.logo'] = args['logo'];
    if (args['tagline']) updates['branding.tagline'] = args['tagline'];
    if (args['custom-css']) updates['branding.customCSS'] = args['custom-css'];

    // Licensing updates
    if (args['tier']) updates['licensing.tier'] = args['tier'];
    if (args['max-seats']) updates['licensing.maxSeats'] = parseInt(args['max-seats']);
    if (args['expires']) updates['licensing.expiresAt'] = args['expires'];

    // Domain updates
    if (args['custom-domain']) {
        updates['domain.type'] = 'custom';
        updates['domain.customDomain'] = args['custom-domain'];
    }

    // Status
    if (args['status']) updates['status'] = args['status'];

    await ref.update(updates);
    console.log(`\x1b[32mTenant "${slug}" updated.\x1b[0m`);
    console.log('  Fields:', Object.keys(updates).filter(k => k !== 'updatedAt').join(', '));
}

async function cmdList() {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();

    console.log('');
    console.log(`\x1b[1mTENANTS\x1b[0m — ${snapshot.size} total`);
    console.log('\x1b[2m' + '─'.repeat(70) + '\x1b[0m');

    snapshot.forEach(doc => {
        const t = doc.data();
        const status = t.status === 'active' ? '\x1b[32mactive\x1b[0m' :
                       t.status === 'trial' ? '\x1b[33mtrial\x1b[0m' :
                       '\x1b[31m' + t.status + '\x1b[0m';
        const seats = t.licensing?.maxSeats || '?';
        const tier = t.licensing?.tier || '?';

        console.log(`  ${doc.id.padEnd(25)} ${status.padEnd(20)} ${tier.padEnd(12)} ${seats} seats`);
    });
    console.log('');
}

async function cmdShow(args) {
    const slug = args['slug'];
    if (!slug) {
        console.error('Usage: node tenant-admin.js show --slug <slug>');
        process.exit(1);
    }

    const doc = await db.doc(`${COLLECTION}/${slug}`).get();
    if (!doc.exists) {
        console.error(`Tenant "${slug}" not found.`);
        process.exit(1);
    }

    const t = doc.data();
    console.log('');
    console.log(`\x1b[1m${t.name}\x1b[0m (${t.slug})`);
    console.log('\x1b[2m' + '─'.repeat(50) + '\x1b[0m');
    console.log(`  Status:       ${t.status}`);
    console.log(`  Tier:         ${t.licensing.tier}`);
    console.log(`  Seats:        ${t.licensing.maxSeats}`);
    console.log(`  Expires:      ${t.licensing.expiresAt?.split('T')[0] || 'never'}`);
    console.log(`  Domain:       ${t.domain.type === 'custom' ? t.domain.customDomain : t.domain.subdomain + '.hexworth.app'}`);
    console.log(`  Primary:      ${t.branding.primaryColor}`);
    console.log(`  Logo:         ${t.branding.logo || '(none)'}`);
    console.log(`  Admins:       ${(t.adminUids || []).length}`);
    console.log(`  Auth:         ${t.auth.method}`);
    console.log(`  Content:`);
    console.log(`    Series:     ${t.licensing.contentAccess.series.length ? t.licensing.contentAccess.series.join(', ') : 'ALL'}`);
    console.log(`    Houses:     ${t.licensing.contentAccess.houses.length ? t.licensing.contentAccess.houses.join(', ') : 'ALL'}`);
    console.log(`    Hubs:       ${t.licensing.contentAccess.hubs.length ? t.licensing.contentAccess.hubs.join(', ') : 'ALL'}`);
    console.log(`    VS Mode:    ${t.licensing.contentAccess.features.vsMode}`);
    console.log(`    Chatbots:   ${t.licensing.contentAccess.features.chatbots}`);
    console.log(`  Created:      ${t.createdAt?.split('T')[0]}`);
    console.log('');
}

async function cmdAddAdmin(args) {
    const slug = args['slug'];
    const uid = args['uid'];
    if (!slug || !uid) {
        console.error('Usage: node tenant-admin.js add-admin --slug <slug> --uid <firebase-uid>');
        process.exit(1);
    }

    await db.doc(`${COLLECTION}/${slug}`).update({
        adminUids: FieldValue.arrayUnion(uid),
        updatedAt: new Date().toISOString()
    });
    console.log(`\x1b[32mAdded admin ${uid} to tenant "${slug}".\x1b[0m`);
}

async function cmdSetContent(args) {
    const slug = args['slug'];
    if (!slug) {
        console.error('Usage: node tenant-admin.js set-content --slug <slug> --series a,b,c --houses shield,eye');
        process.exit(1);
    }

    const updates = { updatedAt: new Date().toISOString() };

    if (args['series']) {
        updates['licensing.contentAccess.series'] = args['series'] === 'all' ? [] : args['series'].split(',').map(s => s.trim());
    }
    if (args['houses']) {
        updates['licensing.contentAccess.houses'] = args['houses'] === 'all' ? [] : args['houses'].split(',').map(s => s.trim());
    }
    if (args['hubs']) {
        updates['licensing.contentAccess.hubs'] = args['hubs'] === 'all' ? [] : args['hubs'].split(',').map(s => s.trim());
    }

    await db.doc(`${COLLECTION}/${slug}`).update(updates);
    console.log(`\x1b[32mContent access updated for "${slug}".\x1b[0m`);
}

async function cmdDeactivate(args) {
    const slug = args['slug'];
    if (!slug) {
        console.error('Usage: node tenant-admin.js deactivate --slug <slug>');
        process.exit(1);
    }

    await db.doc(`${COLLECTION}/${slug}`).update({
        status: 'suspended',
        updatedAt: new Date().toISOString()
    });
    console.log(`\x1b[33mTenant "${slug}" deactivated.\x1b[0m`);
}

// ── Argument Parser ────────────────────────────────────────

function parseArgs(argv) {
    const args = {};
    const positional = [];
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith('--')) {
            const key = argv[i].slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith('--')) {
                args[key] = next;
                i++;
            } else {
                args[key] = true;
            }
        } else {
            positional.push(argv[i]);
        }
    }
    return { command: positional[0], args };
}

// ── Main ───────────────────────────────────────────────────

async function main() {
    const { command, args } = parseArgs(process.argv.slice(2));

    switch (command) {
        case 'create':      await cmdCreate(args); break;
        case 'update':      await cmdUpdate(args); break;
        case 'list':        await cmdList(); break;
        case 'show':        await cmdShow(args); break;
        case 'add-admin':   await cmdAddAdmin(args); break;
        case 'set-content': await cmdSetContent(args); break;
        case 'deactivate':  await cmdDeactivate(args); break;
        default:
            console.log(`
\x1b[1mtenant-admin\x1b[0m — Hexworth Prime White Label Tenant Manager

Commands:
  create        Create a new tenant
  update        Update tenant fields
  list          List all tenants
  show          Show tenant details
  add-admin     Add a Firebase UID as tenant admin
  set-content   Set content access (series, houses, hubs)
  deactivate    Suspend a tenant

Examples:
  node tenant-admin.js create --slug demo-university --name "Demo University Cyber Range" --tier academy
  node tenant-admin.js update --slug demo-university --primary-color "#dc2626" --logo "https://..."
  node tenant-admin.js set-content --slug demo-university --series a,b,c --houses shield,eye,web
  node tenant-admin.js add-admin --slug demo-university --uid abc123def456
  node tenant-admin.js show --slug demo-university
  node tenant-admin.js list
`);
    }

    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
