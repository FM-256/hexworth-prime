#!/usr/bin/env node
/**
 * seed-gate-registry.js — One-time script to populate gate_registry in Firestore.
 *
 * Uses the Firestore REST API with a token from `firebase auth:export`.
 * This avoids needing a service account key file.
 *
 * Usage:
 *   cd functions
 *   node seed-gate-registry.js
 *
 * Prerequisites:
 *   - Logged in via `firebase login`
 *   - firebase-tools installed globally
 */

const { execSync } = require('child_process');
const https = require('https');

const PROJECT_ID = 'hexworth-prime';
const DATABASE = '(default)';

// ─── Get access token from Firebase CLI ──────────────────────────

function getAccessToken() {
    try {
        // firebase login:use prints nothing useful, but firebase
        // uses a refresh token stored in configstore.
        // We can get a fresh access token via the oauth2 endpoint.
        const configRaw = require('fs').readFileSync(
            require('os').homedir() + '/.config/configstore/firebase-tools.json', 'utf8'
        );
        const config = JSON.parse(configRaw);
        const refreshToken = config.tokens?.refresh_token;

        if (!refreshToken) {
            throw new Error('No refresh token found. Run: firebase login');
        }

        // Exchange refresh token for access token using Google's OAuth endpoint
        const clientId = config.tokens?.client_id || '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
        const clientSecret = config.tokens?.client_secret || 'j9iVZfS8kkCEFUPaAeJV0sAi';

        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret
        }).toString();

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'oauth2.googleapis.com',
                path: '/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const parsed = JSON.parse(data);
                    if (parsed.access_token) {
                        resolve(parsed.access_token);
                    } else {
                        reject(new Error('Token exchange failed: ' + data));
                    }
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    } catch (err) {
        throw new Error('Cannot get access token: ' + err.message);
    }
}

// ─── Firestore REST API helper ───────────────────────────────────

function firestoreValue(val) {
    if (typeof val === 'string') {
        return { stringValue: val };
    }
    if (Array.isArray(val)) {
        return {
            arrayValue: {
                values: val.map(v => firestoreValue(v))
            }
        };
    }
    throw new Error('Unsupported type: ' + typeof val);
}

function buildDocument(data) {
    const fields = {};
    for (const [key, value] of Object.entries(data)) {
        fields[key] = firestoreValue(value);
    }
    return { fields };
}

async function writeDocument(token, collectionId, docId, data) {
    const document = buildDocument(data);
    const path = `/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/${collectionId}/${docId}`;

    return new Promise((resolve, reject) => {
        const body = JSON.stringify(document);
        const req = https.request({
            hostname: 'firestore.googleapis.com',
            path: path,
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ─── Gate Answer Hashes ──────────────────────────────────────────

const GATE5_BINDING_HASHES = [
    'f44e85c4b8ea2addc796f8beab6600e801d767ccd26c800dce6d88fdaa5eb4e6',
    'b83d7514ba17c3f1156a2648c1a9d3d167143e695ad491e6197f88441c7a1e4a',
    '29ba6947875fa4dbc743bf54cd2ee163cf566e14203dfccd6c1bbf65585d861c',
    '57794bdeddd908748d80f827d22b534019ac4de886dde656caef927cbb839537',
    'ccb261d43dccffa7475815572d1b031be3731cb77d5772cf90207cae491142df',
    '14a60637758cb026afd2fe447f3648a07965072eeefaa9ee57734959bce8ae2b',
    '5d2d3ceb7abe552344276d47d36a8175b7aeb250a9bf0bf00e850cd23ecf2e43',
    '1f5087db919ced5c123c7f507d3fcce818cb0cf6e77c2f95a8a35e951e03fdb9',
    '8950aeb7bd2ed1fa44e3f753013b8274d578a51b963b7c9b303274a2d367b6be',
    '44fdf624b4cd4ddb26a2b389ecbffac8ba20d72ee8e030ea183c1a8fdd61c683',
    'ee8da6515d50832259fd35b357d89e81fa194a746d99f38f05c0c5fba4db2639'
];

const GATE_REGISTRY = {
    set_0: {
        gate1: '020ac54b315b295ad705b1d0ce5964f62591201114e25361e7d84acbac81cd94',
        gate2: '20524b12c3e0d27febace929c0a114bde5e5f833bf93d409ab5b2ed715b11733',
        gate3: '305e3574e96892791779baf17075151eaf260178c66b0576f3c336a20bf6b143',
        gate4: 'ca99994b3b9bc0cbdb210efef623759146df77abe378eb5d13ca01fe6116e8fe',
        gate5: GATE5_BINDING_HASHES
    },
    set_1: {
        gate1: 'c75faed564c74ded5e73b15fec865838510618929f48c9e880bd7def8328acf4',
        gate2: 'ab4b8a6be78bbc40be155a60a9999308f3ec304bd374986e85fa52424d8875eb',
        gate3: 'e758ef07d7e7c1d844d8b3aa94dfe8bb604fbba76cf0bf5f0a68128b35937d2f',
        gate4: '3a0e14026c6b1d6b4cae899e451e9ebcbd9646c44a956440f2227b2212447be6',
        gate5: GATE5_BINDING_HASHES
    },
    set_2: {
        gate1: '54f127b2790d0be10f3caac1714d38279c2ddc5f9e42e29c829461c7d060ae2f',
        gate2: 'e855d6051bb9ab88163c325f1512432c44c79bbaea81131eec8534216385b114',
        gate3: '321be37ec4e36f40cbcff22a311258cb2514f7f0256a8bb3282c7c88bcb639f9',
        gate4: '9baed8fceea6e36d36670d72429d909547165efc038c293a14a41ef2edf83141',
        gate5: GATE5_BINDING_HASHES
    },
    set_3: {
        gate1: '204eb305678b60770be636e80fc6f32cbe82b610c34162120914ad7e7deaa5d1',
        gate2: '56eadef15f7190903774243c4d2fc5915065a754963bb9449121ec83ead302db',
        gate3: '315a6c5811d2ecfeb79feb54c6ba6d663f7ad1977cc94671044b014b2733fd27',
        gate4: '42e544025f96e6ee0a064873a7f2d431ca555ed0ab1f2990377a5dcac1a7dd16',
        gate5: GATE5_BINDING_HASHES
    }
};

// ─── Main ────────────────────────────────────────────────────────

async function main() {
    console.log('Getting access token from Firebase CLI credentials...');
    const token = await getAccessToken();
    console.log('Token obtained.\n');

    console.log('Seeding gate_registry collection...\n');

    for (const [docId, data] of Object.entries(GATE_REGISTRY)) {
        await writeDocument(token, 'gate_registry', docId, data);
        console.log(`  + gate_registry/${docId} — gates 1-5 (${Object.keys(data).length} fields)`);
    }

    console.log('\nDone. 4 documents written to gate_registry.');
    console.log('Firestore rules block all client access (read: false, write: false).');
    console.log('Only Cloud Functions (Admin SDK) can read these hashes.');
}

main().catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
});
