// Game Forge — registry + per-course config + theme helpers
// _tools/ is gitignored; track with `git add -f`.
//
// The registry is the authoritative list of legacy hardcoded game clones the
// Forge converts into the shared data-driven format consumed by
// _app/_games-lab/{jeopardy,kahoot}.html (data/<type>/<courseId>.json).

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(__dirname, '..', '..');
export const APP = path.join(REPO, '_app');
export const GAMES_LAB = path.join(APP, '_games-lab');
export const LIVE_DATA = path.join(GAMES_LAB, 'data');               // live (do not write here directly)
export const STAGE_DATA = path.join(GAMES_LAB, 'data-extracted');    // staging (converter writes here)
export const MANIFEST = path.join(GAMES_LAB, 'forge-manifest.json'); // catalog the admin panel reads
export const LINT_DIR = path.join(GAMES_LAB, 'forge-lint');          // per-game lint reports

// ---- Per-course presentation config -----------------------------------------
// Courses whose curated data already exists (ala, pis) reuse that file's
// metadata at convert-time; the config below is the fallback / source for the
// other courses. accent + bg + card + text are the load-bearing fields.
export const COURSES = {
  pis:     { title: 'Principles of Information Security', house: 'shield',    badge: 'PIS-REVIEW',     icon: '/assets/images/icons/icon-shield.webp',  accent: '#3b82f6', bg: '#0b0f1a', card: '#121a2e', text: '#e2e8f0' },
  ala:     { title: 'Advanced Linux Administration',      house: 'matrix',    badge: 'ALA-REVIEW',     icon: '/assets/images/icons/icon-terminal.webp', accent: '#00ff41', bg: '#060d08', card: '#0a130c', text: '#e0e0e0' },
  ethics:  { title: 'Ethics in IT',                       house: 'divergent', badge: 'ETHICS-REVIEW',  icon: '/assets/images/icons/icon-scales.webp',  accent: '#a855f7', bg: '#0d0a14', card: '#16111f', text: '#e9e3f2' },
  aplus:   { title: 'CompTIA A+',                         house: 'forge',     badge: 'A+-REVIEW',      icon: '/assets/images/icons/icon-wrench.webp',  accent: '#f59e0b', bg: '#140f06', card: '#1f160a', text: '#f2e9d8' },
  devops:  { title: 'DevOps Engineering',                 house: 'code',      badge: 'DEVOPS-REVIEW',  icon: '/assets/images/icons/icon-code.webp',    accent: '#34d399', bg: '#06140f', card: '#0a1f16', text: '#d8f2e7' },
  netplus: { title: 'CompTIA Network+',                   house: 'web',       badge: 'NET+-REVIEW',    icon: '/assets/images/icons/icon-network.webp', accent: '#818cf8', bg: '#0a0c14', card: '#11141f', text: '#e3e6f2' },
};

export const GRADE_LABELS = {
  s: 'S-RANK -- Master', a: 'A-RANK -- Advanced', b: 'B-RANK -- Practitioner',
  c: 'C-RANK -- Apprentice', f: 'F-RANK -- Back to Training',
};

// ---- The clone registry -----------------------------------------------------
// type: jeopardy | kahoot | wheel | fifth   (engine exists only for jeopardy + kahoot)
// varName: the JS identifier holding the data literal in the clone.
export const REGISTRY = [
  // Jeopardy (engine exists)
  { id: 'jeopardy/ethics',  type: 'jeopardy', course: 'ethics',  varName: 'categories', file: 'houses/divergent/ethics-it/exams/eth-jeopardy.review.html' },
  { id: 'jeopardy/pis',     type: 'jeopardy', course: 'pis',     varName: 'categories', file: 'houses/shield/infosec/exams/pis-jeopardy.review.html' },
  { id: 'jeopardy/ala',     type: 'jeopardy', course: 'ala',     varName: 'categories', file: 'houses/matrix/adv-linux/exams/ala-jeopardy.review.html' },
  { id: 'jeopardy/aplus',   type: 'jeopardy', course: 'aplus',   varName: 'categories', file: 'houses/forge/reviews/forge-aplus-jeopardy.applet.html' },
  { id: 'jeopardy/devops',  type: 'jeopardy', course: 'devops',  varName: 'categories', file: 'houses/code/devops/sections/assessments/do-28-devops-jeopardy.html' },
  { id: 'jeopardy/netplus', type: 'jeopardy', course: 'netplus', varName: 'categories', file: 'houses/web/network-plus/exams/jeopardy.review.html' },
  // Kahoot (engine exists)
  { id: 'kahoot/ethics',    type: 'kahoot',   course: 'ethics',  varName: 'QUESTIONS',  file: 'houses/divergent/ethics-it/exams/eth-kahoot.review.html' },
  { id: 'kahoot/pis',       type: 'kahoot',   course: 'pis',     varName: 'QUESTIONS',  file: 'houses/shield/infosec/exams/pis-kahoot.review.html' },
  { id: 'kahoot/ala',       type: 'kahoot',   course: 'ala',     varName: 'QUESTIONS',  file: 'houses/matrix/adv-linux/exams/ala-kahoot.review.html' },
  // Wheel + Fifth-Grader: NO shared engine yet — catalogued for future, not converted in MVP
  { id: 'wheel/ethics',     type: 'wheel',    course: 'ethics',  varName: 'PUZZLES',    file: 'houses/divergent/ethics-it/exams/eth-wheel.review.html',     engine: false },
  { id: 'wheel/pis',        type: 'wheel',    course: 'pis',     varName: 'PUZZLES',    file: 'houses/shield/infosec/exams/pis-wheel.review.html',          engine: false },
  { id: 'fifth/ethics',     type: 'fifth',    course: 'ethics',  varName: 'QUESTIONS',  file: 'houses/divergent/ethics-it/exams/eth-5th-grader.review.html', engine: false },
  { id: 'fifth/pis',        type: 'fifth',    course: 'pis',     varName: 'QUESTIONS',  file: 'houses/shield/infosec/exams/pis-5th-grader.review.html',      engine: false },
];

export const ENGINE_TYPES = new Set(['jeopardy', 'kahoot', 'wheel', 'fifth']);

// ---- Theme builders ---------------------------------------------------------
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
export function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

export function jeopardyTheme(c) {
  return {
    accent: c.accent, accentDim: rgba(c.accent, 0.12), accentGlow: rgba(c.accent, 0.3),
    bg: c.bg, card: c.card, text: c.text, textDim: '#8b949e',
    border: 'rgba(255,255,255,0.08)', border2: rgba(c.accent, 0.25),
    boardBg: '#060ce9', cellUsedBg: '#0a0c3a', cellHoverBg: '#1a1fe0',
    monoFont: "'Courier New', Courier, monospace",
  };
}
export function kahootTheme(c) { return { accent: c.accent, bg: c.bg, card: c.card, text: c.text }; }
