const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const D = require('./placeholder-detector');

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

// Load static registry
const staticPath = '/home/eq/ai-content/hexworth-prime/functions/quiz_keys.json';
const staticRaw = JSON.parse(fs.readFileSync(staticPath, 'utf8'));

// Detector consolidated into ./placeholder-detector (2026-05-09).
// Categories collapse to: REAL, CYCLING (any of CLASSIC/PERIOD/NEAR), ALL-ZEROS,
// ALL-SAME, EMPTY. Use D.classify for full granularity.
function isPlaceholder(arr) {
  return D.isPlaceholder(arr);
}

function classifyStatic(arr) {
  const c = D.classify(arr);
  if (c === 'EMPTY') return 'EMPTY';
  if (c === 'ALL-ZEROS') return 'ALL-ZEROS';
  if (c === 'REAL') return 'REAL';
  return 'CYCLING';
}

async function main() {
  // Fetch all Firestore quiz_keys docs
  const snap = await db.collection('quiz_keys').get();
  const firestoreMap = {};
  snap.forEach(doc => {
    firestoreMap[doc.id] = doc.data();
  });

  const staticIds = Object.keys(staticRaw);
  const firestoreIds = Object.keys(firestoreMap);

  const results = {
    OK: [],
    STATIC_NEWER: [],  // static is real, Firestore is placeholder — P0 bug
    FIRESTORE_NEWER: [], // Firestore is real, static is placeholder
    DIFFERENT: [],     // both real but differ
    LENGTH_MISMATCH: [],
    ONLY_IN_STATIC: [],
    ONLY_IN_FIRESTORE: [],
    FIRESTORE_ORPHAN_PLACEHOLDER: [], // in Firestore, placeholder, not in static
  };

  const allIds = new Set([...staticIds, ...firestoreIds]);

  for (const id of allIds) {
    const inStatic = staticRaw.hasOwnProperty(id);
    const inFirestore = firestoreMap.hasOwnProperty(id);

    if (inStatic && !inFirestore) {
      results.ONLY_IN_STATIC.push(id);
      continue;
    }

    if (!inStatic && inFirestore) {
      const fsData = firestoreMap[id];
      const fsAnswers = fsData.answers || [];
      if (isPlaceholder(fsAnswers)) {
        results.FIRESTORE_ORPHAN_PLACEHOLDER.push({
          id,
          fsAnswers,
          fsType: classifyStatic(fsAnswers),
        });
      } else {
        results.ONLY_IN_FIRESTORE.push({ id, fsAnswers });
      }
      continue;
    }

    // Both present
    const staticAnswers = staticRaw[id].answers || [];
    const fsData = firestoreMap[id];
    const fsAnswers = fsData.answers || [];

    const staticType = classifyStatic(staticAnswers);
    const fsType = classifyStatic(fsAnswers);

    if (staticAnswers.length !== fsAnswers.length) {
      results.LENGTH_MISMATCH.push({
        id,
        staticLength: staticAnswers.length,
        fsLength: fsAnswers.length,
        staticType,
        fsType,
        staticAnswers,
        fsAnswers,
      });
      continue;
    }

    const identical = JSON.stringify(staticAnswers) === JSON.stringify(fsAnswers);

    if (identical) {
      results.OK.push({ id, type: staticType });
      continue;
    }

    // Not identical — classify
    const staticIsReal = staticType === 'REAL';
    const fsIsReal = fsType === 'REAL';

    if (staticIsReal && !fsIsReal) {
      results.STATIC_NEWER.push({
        id,
        staticAnswers,
        fsAnswers,
        fsType,
        note: 'Static has real answers; Firestore is placeholder. P0 — students score 0.',
      });
    } else if (!staticIsReal && fsIsReal) {
      results.FIRESTORE_NEWER.push({
        id,
        staticAnswers,
        fsAnswers,
        staticType,
        note: 'Firestore has real answers; static is placeholder. Less critical — production correct.',
      });
    } else if (staticIsReal && fsIsReal) {
      results.DIFFERENT.push({
        id,
        staticAnswers,
        fsAnswers,
        note: 'Both appear real but differ — possible intentional update or drift.',
      });
    } else {
      // Both placeholder but different placeholder patterns
      results.DIFFERENT.push({
        id,
        staticAnswers,
        fsAnswers,
        staticType,
        fsType,
        note: 'Both are placeholder but different patterns.',
      });
    }
  }

  // Print console summary
  console.log('\n=== PLACEHOLDER KEY DRIFT AUDIT ===');
  console.log(`Static registry: ${staticIds.length} quiz IDs`);
  console.log(`Firestore collection: ${firestoreIds.length} docs`);
  console.log('');
  console.log(`OK (identical): ${results.OK.length}`);
  console.log(`STATIC-NEWER (P0 - real in static, placeholder in Firestore): ${results.STATIC_NEWER.length}`);
  console.log(`FIRESTORE-NEWER (Firestore correct, static is placeholder): ${results.FIRESTORE_NEWER.length}`);
  console.log(`DIFFERENT (both real but differ): ${results.DIFFERENT.length}`);
  console.log(`LENGTH-MISMATCH: ${results.LENGTH_MISMATCH.length}`);
  console.log(`ONLY IN STATIC (no Firestore doc): ${results.ONLY_IN_STATIC.length}`);
  console.log(`ONLY IN FIRESTORE (not in static): ${results.ONLY_IN_FIRESTORE.length}`);
  console.log(`FIRESTORE ORPHAN PLACEHOLDER (placeholder, not in static): ${results.FIRESTORE_ORPHAN_PLACEHOLDER.length}`);
  console.log('');
  console.log(`>>> P0 COUNT: ${results.STATIC_NEWER.length} quiz IDs need immediate Firestore seeding <<<`);

  if (results.STATIC_NEWER.length > 0) {
    console.log('\nP0 IDs:');
    results.STATIC_NEWER.forEach(r => console.log(`  - ${r.id} (Firestore: ${r.fsType})`));
  }

  // Write full markdown report
  const outputPath = '/home/eq/hexworth-shared/Solutions/_audit/karl-placeholder-key-drift-audit.md';
  
  let md = `# Placeholder Key Drift Audit\n\n`;
  md += `**Run date:** 2026-05-08\n`;
  md += `**Auditor:** Karl (citation-auditor agent)\n`;
  md += `**Source of truth:** \`/home/eq/ai-content/hexworth-prime/functions/quiz_keys.json\`\n`;
  md += `**Compared against:** Production Firestore \`quiz_keys/\` collection (project: hexworth-prime)\n\n`;
  md += `---\n\n`;

  // P0 section
  md += `## P0 — STATIC-NEWER (Immediate Action Required)\n\n`;
  md += `These quiz IDs have **real answer arrays in static** but **placeholder arrays in Firestore**.\n`;
  md += `Students taking these exams score 0% unless every answer is A (index 0).\n\n`;
  
  if (results.STATIC_NEWER.length === 0) {
    md += `**No P0 items found.**\n\n`;
  } else {
    md += `| Quiz ID | Firestore Pattern | Static Answers (first 5) | Firestore Answers |\n`;
    md += `|---------|-------------------|--------------------------|-------------------|\n`;
    results.STATIC_NEWER.forEach(r => {
      const staticPreview = JSON.stringify(r.staticAnswers.slice(0, 5)).replace(/,/g, ', ');
      const fsPreview = JSON.stringify(r.fsAnswers.slice(0, 5)).replace(/,/g, ', ');
      md += `| \`${r.id}\` | ${r.fsType} | ${staticPreview} | ${fsPreview} |\n`;
    });
    md += `\n`;
    
    md += `### P0 Detail — Full Arrays\n\n`;
    results.STATIC_NEWER.forEach(r => {
      md += `#### \`${r.id}\`\n\n`;
      md += `- **Firestore pattern:** ${r.fsType}\n`;
      md += `- **Static answers:** \`${JSON.stringify(r.staticAnswers)}\`\n`;
      md += `- **Firestore answers:** \`${JSON.stringify(r.fsAnswers)}\`\n`;
      md += `- **Impact:** ${r.note}\n\n`;
    });
  }

  md += `---\n\n`;

  // Length mismatch (also P0-class)
  md += `## LENGTH-MISMATCH\n\n`;
  md += `Arrays present in both static and Firestore but with different lengths. Could indicate partial seeding or question count change.\n\n`;
  if (results.LENGTH_MISMATCH.length === 0) {
    md += `**None found.**\n\n`;
  } else {
    results.LENGTH_MISMATCH.forEach(r => {
      md += `#### \`${r.id}\`\n\n`;
      md += `- **Static length:** ${r.staticLength} (${r.staticType})\n`;
      md += `- **Firestore length:** ${r.fsLength} (${r.fsType})\n`;
      md += `- **Static answers:** \`${JSON.stringify(r.staticAnswers)}\`\n`;
      md += `- **Firestore answers:** \`${JSON.stringify(r.fsAnswers)}\`\n\n`;
    });
  }

  md += `---\n\n`;

  // DIFFERENT
  md += `## DIFFERENT — Both Present But Arrays Differ\n\n`;
  if (results.DIFFERENT.length === 0) {
    md += `**None found.**\n\n`;
  } else {
    md += `| Quiz ID | Static Type | Firestore Type | Note |\n`;
    md += `|---------|-------------|----------------|------|\n`;
    results.DIFFERENT.forEach(r => {
      const sType = r.staticType || 'REAL';
      const fType = r.fsType || 'REAL';
      md += `| \`${r.id}\` | ${sType} | ${fType} | ${r.note} |\n`;
    });
    md += `\n`;
    md += `### DIFFERENT Detail — Full Arrays\n\n`;
    results.DIFFERENT.forEach(r => {
      md += `#### \`${r.id}\`\n\n`;
      md += `- **Static:** \`${JSON.stringify(r.staticAnswers)}\`\n`;
      md += `- **Firestore:** \`${JSON.stringify(r.fsAnswers)}\`\n`;
      md += `- **Note:** ${r.note}\n\n`;
    });
  }

  md += `---\n\n`;

  // FIRESTORE-NEWER
  md += `## FIRESTORE-NEWER — Production Correct, Static Stale\n\n`;
  md += `Firestore has real answers; static registry is placeholder. Production is correct. Static registry needs update.\n\n`;
  if (results.FIRESTORE_NEWER.length === 0) {
    md += `**None found.**\n\n`;
  } else {
    results.FIRESTORE_NEWER.forEach(r => {
      md += `- \`${r.id}\` — static is ${r.staticType}, Firestore has real answers\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;

  // OK (with placeholder pattern note)
  const okPlaceholders = results.OK.filter(r => r.type !== 'REAL');
  md += `## OK — Identical Arrays\n\n`;
  md += `**Total OK:** ${results.OK.length}\n\n`;
  if (okPlaceholders.length > 0) {
    md += `**Warning:** ${okPlaceholders.length} OK items have identical arrays but both are placeholder patterns (static and Firestore agree on a bad value). These are consistent but wrong.\n\n`;
    md += `| Quiz ID | Pattern |\n|---------|--------|\n`;
    okPlaceholders.forEach(r => md += `| \`${r.id}\` | ${r.type} |\n`);
    md += `\n`;
  }

  md += `---\n\n`;

  // Only in static
  md += `## ONLY IN STATIC — No Firestore Document\n\n`;
  md += `These quiz IDs exist in the static registry but have no document in the Firestore \`quiz_keys/\` collection. `;
  md += `Students cannot be graded — server-grading will fail with "quiz not found" or similar.\n\n`;
  if (results.ONLY_IN_STATIC.length === 0) {
    md += `**None found.**\n\n`;
  } else {
    results.ONLY_IN_STATIC.forEach(id => md += `- \`${id}\`\n`);
    md += `\n`;
  }

  md += `---\n\n`;

  // Only in Firestore
  md += `## ONLY IN FIRESTORE — Not in Static Registry\n\n`;
  md += `These quiz IDs have Firestore docs with real-looking answers but are absent from the static registry. `;
  md += `May be manually seeded or orphaned.\n\n`;
  if (results.ONLY_IN_FIRESTORE.length === 0) {
    md += `**None found.**\n\n`;
  } else {
    results.ONLY_IN_FIRESTORE.forEach(r => md += `- \`${r.id}\`\n`);
    md += `\n`;
  }

  md += `---\n\n`;

  // Orphan placeholders
  md += `## FIRESTORE ORPHAN PLACEHOLDER — Not in Static, Placeholder in Firestore\n\n`;
  if (results.FIRESTORE_ORPHAN_PLACEHOLDER.length === 0) {
    md += `**None found.**\n\n`;
  } else {
    results.FIRESTORE_ORPHAN_PLACEHOLDER.forEach(r => {
      md += `- \`${r.id}\` (${r.fsType})\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;

  // Footer summary
  md += `## Summary\n\n`;
  md += `| Category | Count |\n`;
  md += `|----------|-------|\n`;
  md += `| Total in static registry | ${staticIds.length} |\n`;
  md += `| Total in Firestore | ${firestoreIds.length} |\n`;
  md += `| OK (identical) | ${results.OK.length} |\n`;
  md += `| **P0 STATIC-NEWER (Firestore placeholder, must seed)** | **${results.STATIC_NEWER.length}** |\n`;
  md += `| LENGTH-MISMATCH | ${results.LENGTH_MISMATCH.length} |\n`;
  md += `| DIFFERENT (both real, drift) | ${results.DIFFERENT.length} |\n`;
  md += `| FIRESTORE-NEWER (static stale) | ${results.FIRESTORE_NEWER.length} |\n`;
  md += `| ONLY IN STATIC (no Firestore doc) | ${results.ONLY_IN_STATIC.length} |\n`;
  md += `| ONLY IN FIRESTORE (not in static) | ${results.ONLY_IN_FIRESTORE.length} |\n`;
  md += `| FIRESTORE ORPHAN PLACEHOLDER | ${results.FIRESTORE_ORPHAN_PLACEHOLDER.length} |\n`;
  md += `| OK items that agree on placeholder (consistent-but-wrong) | ${okPlaceholders.length} |\n`;

  fs.writeFileSync(outputPath, md, 'utf8');
  console.log(`\nReport written to: ${outputPath}`);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
