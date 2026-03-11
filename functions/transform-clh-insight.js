#!/usr/bin/env node
/**
 * Transform CLH lab/applet files to use server-side insight validation.
 *
 * For each file:
 * 1. Adds FirebaseAuth.js + CLHInsightValidator.js script tags after CLHConfig.js
 * 2. Replaces submitInsightAnswer() function body with CF call
 *
 * Usage: node transform-clh-insight.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.resolve(__dirname, '..');

// Find all files containing submitInsightAnswer
const grepResult = execSync(
    `grep -rl "submitInsightAnswer" "${ROOT}/_app/houses/script/"`,
    { encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

console.log(`Found ${grepResult.length} files to transform`);

let transformed = 0;
let skipped = 0;
let errors = 0;

for (const filePath of grepResult) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(ROOT, filePath);
        let changed = false;

        // Step 1: Add script tags after CLHConfig.js line (if not already present)
        if (!content.includes('FirebaseAuth.js')) {
            const clhConfigMatch = content.match(/<script\s+src="([^"]*?)CLHConfig\.js"><\/script>/);
            if (clhConfigMatch) {
                const componentsPath = clhConfigMatch[1]; // e.g., "../../../components/"
                const oldTag = clhConfigMatch[0];
                const newTags = `${oldTag}\n    <script src="${componentsPath}FirebaseAuth.js"></script>\n    <script src="${componentsPath}CLHInsightValidator.js"></script>`;
                content = content.replace(oldTag, newTags);
                changed = true;
            } else {
                console.error(`  SKIP ${relPath} — no CLHConfig.js script tag found`);
                skipped++;
                continue;
            }
        }

        // Step 2: Replace submitInsightAnswer function body
        // Find the function start
        const funcStart = content.indexOf('function submitInsightAnswer()');
        if (funcStart === -1) {
            console.error(`  SKIP ${relPath} — no submitInsightAnswer function found`);
            skipped++;
            continue;
        }

        // Already transformed?
        if (content.includes('CLHInsightValidator.submit')) {
            console.log(`  SKIP ${relPath} — already transformed`);
            skipped++;
            continue;
        }

        // Find the opening brace of the function
        const braceStart = content.indexOf('{', funcStart);
        if (braceStart === -1) {
            console.error(`  ERROR ${relPath} — no opening brace after function`);
            errors++;
            continue;
        }

        // Brace-match to find the closing brace
        let depth = 0;
        let braceEnd = -1;
        for (let i = braceStart; i < content.length; i++) {
            if (content[i] === '{') depth++;
            if (content[i] === '}') depth--;
            if (depth === 0) {
                braceEnd = i;
                break;
            }
        }

        if (braceEnd === -1) {
            console.error(`  ERROR ${relPath} — unmatched braces`);
            errors++;
            continue;
        }

        // Detect if the file uses terminal.print
        const oldBody = content.substring(braceStart, braceEnd + 1);
        const hasTerminal = oldBody.includes('terminal.print');

        // Build the new function body
        // Indentation: detect from context
        const lineStart = content.lastIndexOf('\n', funcStart) + 1;
        const indent = content.substring(lineStart, funcStart).replace(/\S.*/g, '');

        const newBody = `{
${indent}    const insightConfig = config.insightPhase;
${indent}    const input = document.getElementById('insightAnswer');
${indent}    const feedback = document.getElementById('insightFeedback');
${indent}    const userAnswer = input.value.trim().toLowerCase();
${indent}
${indent}    if (!userAnswer) {
${indent}        feedback.className = 'insight-feedback wrong';
${indent}        feedback.textContent = 'Please enter your analysis.';
${indent}        return;
${indent}    }
${indent}
${indent}    insightAttempts++;
${indent}    input.disabled = true;
${indent}    document.querySelector('.insight-submit').disabled = true;
${indent}
${indent}    try {
${indent}        const result = await CLHInsightValidator.submit(MODULE_ID, userAnswer);
${indent}
${indent}        if (result.success) {
${indent}            feedback.className = 'insight-feedback';
${indent}            feedback.style.display = 'block';
${indent}            feedback.style.background = 'rgba(63, 185, 80, 0.1)';
${indent}            feedback.style.border = '1px solid #3fb950';
${indent}            feedback.style.color = '#3fb950';
${indent}            feedback.textContent = result.feedback;
${hasTerminal ? `${indent}            if (typeof terminal !== 'undefined') terminal.print('[CONFIRMED] ' + result.feedback, 'success');\n` : ''}${indent}            document.querySelector('.insight-submit').style.opacity = '0.5';
${indent}            setTimeout(() => { showCompletionModal(); }, 1500);
${indent}        } else {
${hasTerminal ? `${indent}            if (typeof terminal !== 'undefined') terminal.print('[REJECTED] Intelligence not confirmed.', 'error');\n` : ''}${indent}            if (insightAttempts >= (insightConfig.hintAfterAttempts || 3) && insightConfig.hint) {
${indent}                feedback.className = 'insight-feedback hint';
${indent}                feedback.textContent = 'Hint: ' + insightConfig.hint;
${indent}            } else {
${indent}                feedback.className = 'insight-feedback wrong';
${indent}                feedback.textContent = result.feedback;
${indent}            }
${indent}            input.disabled = false;
${indent}            document.querySelector('.insight-submit').disabled = false;
${indent}            input.value = '';
${indent}            input.focus();
${indent}        }
${indent}    } catch (err) {
${indent}        feedback.className = 'insight-feedback wrong';
${indent}        feedback.textContent = 'Connection error. Please try again.';
${indent}        input.disabled = false;
${indent}        document.querySelector('.insight-submit').disabled = false;
${indent}        console.error('Insight validation error:', err);
${indent}    }
${indent}}`;

        // Replace old function with async version
        const oldFunc = content.substring(funcStart, braceEnd + 1);
        const newFunc = 'async function submitInsightAnswer() ' + newBody;
        content = content.replace(oldFunc, newFunc);
        changed = true;

        if (changed) {
            if (DRY_RUN) {
                console.log(`  DRY-RUN ${relPath}`);
            } else {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`  OK ${relPath}`);
            }
            transformed++;
        }
    } catch (err) {
        console.error(`  ERROR ${path.relative(ROOT, filePath)}: ${err.message}`);
        errors++;
    }
}

console.log(`\nDone: ${transformed} transformed, ${skipped} skipped, ${errors} errors`);
if (DRY_RUN) console.log('(dry run — no files written)');
