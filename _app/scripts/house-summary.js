/**
 * House Content Summary Script
 * Usage: node scripts/house-summary.js [house]
 *
 * No argument = all houses summary
 * With argument = single house detail
 */

const fs = require('fs');
const path = require('path');

const houses = ['web', 'shield', 'cloud', 'forge', 'script', 'code', 'key', 'eye'];
const categories = ['presentations', 'applets', 'labs', 'quizzes', 'tools', 'simulators', 'games'];
const icons = {
    web: '🕸️', shield: '🛡️', cloud: '☁️', forge: '⚒️',
    script: '📜', code: '💻', key: '🔑', eye: '👁️'
};

const countHtmlFiles = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        items.forEach(item => {
            if (item.isDirectory()) {
                count += countHtmlFiles(path.join(dir, item.name));
            } else if (item.name.endsWith('.html') && item.name !== 'index.html') {
                count++;
            }
        });
    } catch (e) {}
    return count;
};

const listHtmlFiles = (dir, depth = 0) => {
    if (!fs.existsSync(dir)) return;
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        items.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });
        items.forEach(item => {
            const prefix = '  '.repeat(depth);
            if (item.isDirectory()) {
                console.log(`${prefix}📁 ${item.name}/`);
                listHtmlFiles(path.join(dir, item.name), depth + 1);
            } else if (item.name.endsWith('.html')) {
                console.log(`${prefix}📄 ${item.name}`);
            }
        });
    } catch (e) {}
};

// Check if single house requested
const targetHouse = process.argv[2];

if (targetHouse && houses.includes(targetHouse)) {
    // Single house detail view
    console.log('');
    console.log('╔' + '═'.repeat(60) + '╗');
    const title = icons[targetHouse] + ' ' + targetHouse.toUpperCase() + ' HOUSE - DETAILED CONTENT';
    console.log('║ ' + title.padEnd(58) + '║');
    console.log('╚' + '═'.repeat(60) + '╝');
    console.log('');

    categories.forEach(cat => {
        const dirPath = `./houses/${targetHouse}/${cat}`;
        const count = countHtmlFiles(dirPath);
        if (count > 0) {
            console.log(`\n── ${cat.toUpperCase()} (${count}) ──`);
            listHtmlFiles(dirPath, 1);
        }
    });

    console.log('');
} else {
    // All houses summary
    const summary = {};

    houses.forEach(house => {
        summary[house] = {};
        categories.forEach(cat => {
            summary[house][cat] = countHtmlFiles(`./houses/${house}/${cat}`);
        });
    });

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    HEXWORTH PRIME - HOUSE CONTENT SUMMARY                    ║');
    console.log('╠══════════╦═══════════════╦═════════╦══════╦═════════╦═══════╦═══════╦════════╣');
    console.log('║  House   ║ Presentations ║ Applets ║ Labs ║ Quizzes ║ Tools ║ Games ║ TOTAL  ║');
    console.log('╠══════════╬═══════════════╬═════════╬══════╬═════════╬═══════╬═══════╬════════╣');

    let grandTotal = 0;
    houses.forEach(house => {
        const s = summary[house];
        const total = Object.values(s).reduce((a, b) => a + b, 0);
        grandTotal += total;
        const name = house.charAt(0).toUpperCase() + house.slice(1);
        const row = [
            name.padEnd(8),
            String(s.presentations || 0).padStart(13),
            String(s.applets || 0).padStart(7),
            String(s.labs || 0).padStart(4),
            String(s.quizzes || 0).padStart(7),
            String(s.tools || 0).padStart(5),
            String(s.games || 0).padStart(5),
            String(total).padStart(6)
        ];
        console.log('║ ' + row.join(' ║ ') + ' ║');
    });

    console.log('╠══════════╩═══════════════╩═════════╩══════╩═════════╩═══════╩═══════╬════════╣');
    console.log('║                                                         GRAND TOTAL ║ ' + String(grandTotal).padStart(6) + ' ║');
    console.log('╚═════════════════════════════════════════════════════════════════════╩════════╝');
    console.log('');
}
