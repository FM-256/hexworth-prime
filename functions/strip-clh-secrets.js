#!/usr/bin/env node
/**
 * Strip secret fields from CLHConfig.js insightPhase blocks.
 * Removes: acceptedAnswers, correctAnswerMessage, wrongAnswerMessage
 * Keeps: question, enabled, hint, hintAfterAttempts
 *
 * Usage: node strip-clh-secrets.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const configPath = path.resolve(__dirname, '../_app/components/CLHConfig.js');

let content = fs.readFileSync(configPath, 'utf8');
const lines = content.split('\n');

// Fields to remove from insightPhase blocks
const secretFields = ['acceptedAnswers', 'correctAnswerMessage', 'wrongAnswerMessage'];

let removedCount = 0;
let newLines = [];
let skipUntilLineEnd = false;
let inArrayRemoval = false;
let arrayBracketDepth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if we're in the middle of removing a multi-line array
    if (inArrayRemoval) {
        for (const ch of line) {
            if (ch === '[') arrayBracketDepth++;
            if (ch === ']') arrayBracketDepth--;
        }
        if (arrayBracketDepth <= 0) {
            inArrayRemoval = false;
        }
        continue; // Skip this line
    }

    // Check if this line starts a secret field
    let isSecret = false;
    for (const field of secretFields) {
        // Match patterns like: acceptedAnswers: [...] or correctAnswerMessage: '...'
        const fieldPattern = new RegExp(`^\\s*${field}\\s*:`);
        if (fieldPattern.test(trimmed)) {
            isSecret = true;

            // Check if it's an array that spans multiple lines
            if (field === 'acceptedAnswers') {
                arrayBracketDepth = 0;
                for (const ch of line) {
                    if (ch === '[') arrayBracketDepth++;
                    if (ch === ']') arrayBracketDepth--;
                }
                if (arrayBracketDepth > 0) {
                    inArrayRemoval = true;
                }
            }

            removedCount++;
            break;
        }
    }

    if (!isSecret) {
        newLines.push(line);
    }
}

const result = newLines.join('\n');

if (DRY_RUN) {
    console.log(`DRY RUN: Would remove ${removedCount} secret field lines from CLHConfig.js`);
} else {
    fs.writeFileSync(configPath, result, 'utf8');
    console.log(`Removed ${removedCount} secret field lines from CLHConfig.js`);
}
