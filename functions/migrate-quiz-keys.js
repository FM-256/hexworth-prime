#!/usr/bin/env node
/**
 * migrate-quiz-keys.js — SEC-5: Quiz Answer Key Migration
 *
 * Scans all *.quiz.html files in _app/houses/, extracts the quiz config
 * (moduleId + correct answer indices), and:
 *   1. Generates Firestore batch writes to quiz_keys/{quizId}
 *   2. Outputs modified quiz.html files with `correct` removed from questions
 *
 * Usage:
 *   node migrate-quiz-keys.js --dry-run       # Preview what would happen
 *   node migrate-quiz-keys.js --export-keys    # Write quiz_keys.json for Firestore import
 *   node migrate-quiz-keys.js --strip-answers  # Write modified HTML files to _output/
 *
 * This script does NOT modify quiz files in place or write to Firestore directly.
 * It generates artifacts for manual review and deployment.
 */

const fs = require('fs');
const path = require('path');

const HOUSES_DIR = path.resolve(__dirname, '..', '_app', 'houses');
const OUTPUT_DIR = path.resolve(__dirname, '..', '_output', 'migrated-quizzes');
const KEYS_OUTPUT = path.resolve(__dirname, 'quiz_keys.json');

// ─── Quiz Config Extraction ──────────────────────────────────────

/**
 * Extract quiz config from an HTML file's inline <script> block.
 * Parses the JavaScript object passed to `new QuizEngine({...})`.
 */
function extractQuizConfig(htmlContent, filePath) {
    // Find the QuizEngine constructor call
    const constructorMatch = htmlContent.match(/new\s+QuizEngine\s*\(\s*\{/);
    if (!constructorMatch) {
        return null;
    }

    const startIdx = constructorMatch.index + constructorMatch[0].length - 1; // position of opening {

    // Brace-match to find the full config object
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let escaped = false;
    let endIdx = -1;

    for (let i = startIdx; i < htmlContent.length; i++) {
        const ch = htmlContent[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (ch === '\\' && inString) {
            escaped = true;
            continue;
        }

        if (inString) {
            if (ch === stringChar) {
                inString = false;
            }
            continue;
        }

        if (ch === '"' || ch === "'" || ch === '`') {
            inString = true;
            stringChar = ch;
            continue;
        }

        if (ch === '{') depth++;
        if (ch === '}') {
            depth--;
            if (depth === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }

    if (endIdx === -1) {
        console.warn(`  [WARN] Could not find matching brace in ${filePath}`);
        return null;
    }

    const configStr = htmlContent.substring(startIdx, endIdx);

    // Use a sandboxed evaluation to parse the config
    // We wrap it in a function that captures the object
    try {
        // Replace HTML-specific content that breaks eval
        // Remove onComplete callbacks (contain arbitrary JS)
        let sanitized = configStr;

        // Strip onComplete/onQuestionAnswer callbacks (they reference DOM/window)
        sanitized = sanitized.replace(/onComplete\s*:\s*\(.*?\)\s*=>\s*\{[^}]*\}/gs, 'onComplete: null');
        sanitized = sanitized.replace(/onComplete\s*:\s*function\s*\(.*?\)\s*\{[^}]*\}/gs, 'onComplete: null');
        sanitized = sanitized.replace(/onQuestionAnswer\s*:\s*\(.*?\)\s*=>\s*\{[^}]*\}/gs, 'onQuestionAnswer: null');

        // Evaluate in a restricted scope
        const fn = new Function(`
            const window = {};
            const document = {};
            const localStorage = { getItem: () => null, setItem: () => {} };
            const AchievementManager = { unlock: () => {} };
            const ProgressManager = { completeModule: () => {} };
            return (${sanitized});
        `);

        return fn();
    } catch (e) {
        // Fallback: regex extraction for the fields we need
        console.warn(`  [WARN] Eval failed for ${filePath}: ${e.message}`);
        console.warn('  [INFO] Falling back to regex extraction...');
        return extractViaRegex(configStr, filePath);
    }
}

/**
 * Fallback: extract moduleId, passingScore, and correct answers via regex.
 * Less reliable but handles edge cases where eval fails.
 */
function extractViaRegex(configStr, filePath) {
    // Extract moduleId
    const moduleIdMatch = configStr.match(/moduleId\s*:\s*['"]([^'"]+)['"]/);
    const achievementMatch = configStr.match(/achievement\s*:\s*['"]([^'"]+)['"]/);
    const moduleId = (moduleIdMatch && moduleIdMatch[1]) || (achievementMatch && achievementMatch[1]);

    if (!moduleId) {
        console.warn(`  [WARN] No moduleId or achievement found in ${filePath}`);
        return null;
    }

    // Extract passingScore
    const passingMatch = configStr.match(/passingScore\s*:\s*(\d+)/);
    const passingScore = passingMatch ? parseInt(passingMatch[1]) : 70;

    // Extract all correct: N values from questions array
    const correctValues = [];
    const correctRegex = /correct\s*:\s*(\d+)/g;
    let match;
    while ((match = correctRegex.exec(configStr)) !== null) {
        correctValues.push(parseInt(match[1]));
    }

    if (correctValues.length === 0) {
        console.warn(`  [WARN] No correct answers found in ${filePath}`);
        return null;
    }

    return {
        moduleId,
        passingScore,
        questions: correctValues.map(c => ({ correct: c }))
    };
}

/**
 * Remove the `correct` property from question objects in the HTML source.
 * Preserves all other properties and formatting.
 */
function stripCorrectFromHtml(htmlContent) {
    // Match `correct: N,` or `correct: N` (with optional trailing comma)
    // Only within question object context (after options array)
    return htmlContent.replace(
        /(\s*)correct\s*:\s*\d+\s*,?\s*\n?/g,
        (match, leadingWhitespace) => {
            // Check if the line only contains the correct property
            // If there's a trailing comma on the previous line, handle that too
            return '';
        }
    );
}

// ─── File Discovery ──────────────────────────────────────────────

/**
 * Recursively find all *.quiz.html files under a directory.
 */
function findQuizFiles(dir) {
    const results = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.name.endsWith('.quiz.html')) {
                results.push(fullPath);
            }
        }
    }

    walk(dir);
    return results.sort();
}

// ─── Main ────────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const exportKeys = args.includes('--export-keys');
    const stripAnswers = args.includes('--strip-answers');

    if (!dryRun && !exportKeys && !stripAnswers) {
        console.log('SEC-5: Quiz Answer Key Migration');
        console.log('================================');
        console.log('');
        console.log('Usage:');
        console.log('  node migrate-quiz-keys.js --dry-run        Preview extraction results');
        console.log('  node migrate-quiz-keys.js --export-keys     Generate quiz_keys.json for Firestore');
        console.log('  node migrate-quiz-keys.js --strip-answers   Write modified HTML to _output/');
        console.log('');
        console.log('Run --dry-run first to verify extraction before proceeding.');
        process.exit(0);
    }

    console.log('SEC-5: Quiz Answer Key Migration');
    console.log('================================');
    console.log(`Scanning: ${HOUSES_DIR}`);
    console.log('');

    const quizFiles = findQuizFiles(HOUSES_DIR);
    console.log(`Found ${quizFiles.length} quiz files.\n`);

    const quizKeys = {};
    const errors = [];
    let extracted = 0;
    let skipped = 0;

    for (const filePath of quizFiles) {
        const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
        const htmlContent = fs.readFileSync(filePath, 'utf-8');

        const config = extractQuizConfig(htmlContent, relativePath);

        if (!config) {
            console.log(`  SKIP  ${relativePath} (no QuizEngine config found)`);
            skipped++;
            continue;
        }

        // Determine quizId from moduleId (primary) or achievement (fallback)
        const quizId = config.moduleId || config.achievement;

        if (!quizId) {
            console.log(`  SKIP  ${relativePath} (no moduleId or achievement)`);
            skipped++;
            continue;
        }

        // Extract correct answer indices
        const answers = config.questions.map(q => q.correct);

        if (answers.length === 0 || answers.every(a => a === undefined)) {
            console.log(`  SKIP  ${relativePath} (no correct answers in questions)`);
            skipped++;
            continue;
        }

        // Check for duplicate quizId
        if (quizKeys[quizId]) {
            console.log(`  DUPE  ${relativePath} -> quizId "${quizId}" already exists from ${quizKeys[quizId].sourceFile}`);
            errors.push({ file: relativePath, error: `Duplicate quizId: ${quizId}` });
            continue;
        }

        quizKeys[quizId] = {
            answers,
            passingScore: config.passingScore || 70,
            questionCount: answers.length,
            sourceFile: relativePath
        };

        console.log(`  OK    ${relativePath}`);
        console.log(`        quizId: ${quizId} | ${answers.length} questions | passing: ${config.passingScore || 70}%`);
        extracted++;
    }

    console.log('');
    console.log('─── Summary ───');
    console.log(`  Extracted: ${extracted}`);
    console.log(`  Skipped:   ${skipped}`);
    console.log(`  Errors:    ${errors.length}`);

    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
    }

    // --export-keys: Write quiz_keys.json
    if (exportKeys) {
        // Build Firestore-ready format (without sourceFile metadata)
        const firestoreData = {};
        for (const [quizId, data] of Object.entries(quizKeys)) {
            firestoreData[quizId] = {
                answers: data.answers,
                passingScore: data.passingScore,
                questionCount: data.questionCount
            };
        }

        fs.writeFileSync(KEYS_OUTPUT, JSON.stringify(firestoreData, null, 2));
        console.log(`\nWrote ${Object.keys(firestoreData).length} quiz keys to: ${KEYS_OUTPUT}`);
        console.log('Import to Firestore collection "quiz_keys" — each key becomes a document ID.');
    }

    // --strip-answers: Write modified HTML files
    if (stripAnswers) {
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        let stripped = 0;
        for (const filePath of quizFiles) {
            const htmlContent = fs.readFileSync(filePath, 'utf-8');
            const modified = stripCorrectFromHtml(htmlContent);

            if (modified === htmlContent) {
                continue; // No changes needed
            }

            // Preserve directory structure in output
            const relativePath = path.relative(HOUSES_DIR, filePath);
            const outputPath = path.join(OUTPUT_DIR, relativePath);
            const outputDir = path.dirname(outputPath);

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            fs.writeFileSync(outputPath, modified);
            stripped++;
        }

        console.log(`\nWrote ${stripped} modified quiz files to: ${OUTPUT_DIR}`);
        console.log('Review the output, then copy files back to _app/houses/ when ready.');
    }

    if (dryRun) {
        console.log('\n[DRY RUN] No files were written. Use --export-keys or --strip-answers to generate output.');
    }
}

main();
