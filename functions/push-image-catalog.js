/**
 * Push image catalog to Firestore image_catalog collection.
 * One doc per image; id = stable hash of relative path.
 * Uses batched writes (500/batch) to respect Firestore limits.
 */
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/config/image-catalog.json',
    'utf8'
));

const images = manifest.images;
console.log(`Pushing ${images.length} images to image_catalog collection...`);

(async () => {
    let written = 0;
    for (let i = 0; i < images.length; i += 500) {
        const batch = db.batch();
        const chunk = images.slice(i, i + 500);
        for (const img of chunk) {
            const ref = db.collection('image_catalog').doc(img.id);
            batch.set(ref, img, { merge: true });
        }
        await batch.commit();
        written += chunk.length;
        console.log(`  Batch ${Math.ceil(i / 500) + 1}: ${written}/${images.length} written`);
    }

    // Write the catalog summary as a separate doc
    await db.collection('image_catalog_meta').doc('summary').set({
        generatedAt: manifest.generatedAt,
        totalImages: manifest.totalImages,
        totalBytes: manifest.totalBytes,
        categories: manifest.categories,
        extensions: manifest.extensions,
    }, { merge: true });

    console.log('Done.');
    process.exit(0);
})().catch(e => {
    console.error(e);
    process.exit(1);
});
