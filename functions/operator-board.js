/**
 * operatorBoard — HTTP Cloud Function that serves the e-paper display image.
 *
 * Phase 1: returns a static "Hexworth Operator Board v0.1" PNG bundled with the
 * function (functions/assets/operator-board.png). Proves the full pipeline
 * device → CF → display without any data-source coupling.
 *
 * Phase 2 (later): composes the image from Firestore (_quality_reports/latest,
 * scanHeartbeat, etc.) so it reflects real platform state.
 *
 * Auth: public read. The image is non-sensitive (Phase 2 will only show
 * aggregate counters / timestamps). If specific operator-only info ever lands
 * on this board, we add a shared-secret query param or App Check token.
 *
 * Cache: no-store. The device's 15-min refresh cadence makes upstream caching
 * counter-productive — every fetch should hit the function so we get fresh
 * data once Phase 2 wires real sources.
 */

const { onRequest } = require('firebase-functions/v2/https');
const fs = require('fs');
const path = require('path');

const IMAGE_PATH = path.join(__dirname, 'assets', 'operator-board.png');

// Read once at cold start; reused across warm invocations.
let cachedImage = null;
function getImage() {
    if (!cachedImage) {
        cachedImage = fs.readFileSync(IMAGE_PATH);
    }
    return cachedImage;
}

exports.operatorBoard = onRequest(
    { region: 'us-central1', cors: false, memory: '256MiB', timeoutSeconds: 30 },
    (req, res) => {
        if (req.method !== 'GET') {
            res.status(405).set('Allow', 'GET').send('Method Not Allowed');
            return;
        }

        try {
            const img = getImage();
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'no-store, max-age=0');
            res.set('X-Operator-Board-Phase', '1');
            res.status(200).send(img);
        } catch (err) {
            console.error('operatorBoard: failed to read image', err);
            res.status(500).send('Image unavailable');
        }
    }
);
