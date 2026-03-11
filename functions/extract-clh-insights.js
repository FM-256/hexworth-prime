#!/usr/bin/env node
/**
 * Extract all CLH insight phases from CLHConfig.js for server-side seeding.
 * Outputs JSON array of { moduleId, acceptedAnswers, correctMessage, wrongMessage }
 */
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../_app/components/CLHConfig.js');
const content = fs.readFileSync(configPath, 'utf8');
const lines = content.split('\n');

let currentModule = null;
let inInsight = false;
let insightLines = [];
let braceDepth = 0;
const results = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track module ID: 'CLH-001': { (object key in MODULES)
    const modMatch = line.match(/['"]?(CLH-\d+)['"]?\s*:\s*\{/);
    if (modMatch) {
        currentModule = modMatch[1];
    }

    // Detect insightPhase start (unquoted key in object literal)
    if (/^\s*insightPhase\s*:\s*\{/.test(line)) {
        inInsight = true;
        insightLines = [];
        braceDepth = 0;
        // Count braces on this line
        for (const ch of line) {
            if (ch === '{') braceDepth++;
            if (ch === '}') braceDepth--;
        }
        insightLines.push(line);
        if (braceDepth <= 0) {
            processInsight(currentModule, insightLines.join('\n'));
            inInsight = false;
        }
        continue;
    }

    if (inInsight) {
        insightLines.push(line);
        for (const ch of line) {
            if (ch === '{') braceDepth++;
            if (ch === '}') braceDepth--;
        }
        if (braceDepth <= 0) {
            processInsight(currentModule, insightLines.join('\n'));
            inInsight = false;
        }
    }
}

function processInsight(moduleId, block) {
    if (!moduleId) return;

    // Extract acceptedAnswers array
    const answersMatch = block.match(/acceptedAnswers\s*:\s*\[([\s\S]*?)\]/);
    if (!answersMatch) return;

    const answersRaw = answersMatch[1];
    const answers = [];
    const strPattern = /["']([^"']*?)["']/g;
    let m;
    while ((m = strPattern.exec(answersRaw)) !== null) {
        answers.push(m[1]);
    }

    // Extract messages
    const correctMatch = block.match(/correctAnswerMessage\s*:\s*["']([\s\S]*?)["']\s*[,}\n]/);
    const wrongMatch = block.match(/wrongAnswerMessage\s*:\s*["']([\s\S]*?)["']\s*[,}\n]/);
    const questionMatch = block.match(/question\s*:\s*["']([\s\S]*?)["']\s*[,}\n]/);

    results.push({
        moduleId,
        question: questionMatch ? questionMatch[1] : '',
        acceptedAnswers: answers,
        correctMessage: correctMatch ? correctMatch[1] : '',
        wrongMessage: wrongMatch ? wrongMatch[1] : ''
    });
}

console.log(JSON.stringify(results, null, 2));
console.error(`Extracted ${results.length} insight phases`);
