/**
 * operatorBoard — Multi-board e-paper renderer.
 *
 * Phase 3: per-board config stored in Firestore. Each physical device fetches
 * with ?board=<id>; CF looks up `/epaper_boards/{boardId}`, picks the right
 * template renderer, composes SVG, rasterizes to a 1-bit 800×480 PNG.
 *
 * Templates implemented:
 *   - classroom-schedule  (two-course door display with day-aware highlight)
 *
 * Resilience:
 *   - The legacy device URL has no ?board= param. We default to "room-214"
 *     so the existing wall display keeps working without an immediate reflash.
 *   - On first fetch where "room-214" doesn't exist in Firestore yet, we
 *     lazy-seed it with the previously-hardcoded config. Self-healing.
 *   - lastSeen update is best-effort; a Firestore write failure does NOT
 *     fail the image response. The device must always get a PNG.
 *
 * Firestore schema (/epaper_boards/{boardId}):
 *   {
 *     template: 'classroom-schedule',
 *     label: 'Room 214 Door Display',
 *     config: {
 *       room, instructor, timezone, classTime,
 *       courses: [ { code, title, days, dayNums:[Mon=1..Sat=6], side } ],
 *       openLab: { enabled, time }
 *     },
 *     createdAt, updatedAt, lastSeen, lastSeenIp
 *   }
 */

const { onRequest } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const sharp = require('sharp');

const WIDTH = 800;
const HEIGHT = 480;

// ─── Default config (lazy-seed for room-214) ──────────────────────
const ROOM_214_DEFAULT = {
    template: 'classroom-schedule',
    label: 'Room 214 Door Display',
    config: {
        room: 'Room 214',
        instructor: 'Professor Frank Mora, MCSIA',
        timezone: 'America/New_York',
        classTime: '6:00 – 9:00 PM',
        courses: [
            {
                code: 'CIS4253',
                title: 'ETHICS IN IT',
                days: 'Mondays · Wednesdays',
                dayNums: [1, 3],
                side: 'left',
            },
            {
                code: 'CIS2350C',
                title: 'PRINCIPLES OF INFOSEC',
                days: 'Tuesdays · Thursdays',
                dayNums: [2, 4],
                side: 'right',
            },
        ],
        openLab: { enabled: true, time: '3:00 – 5:00 PM' },
    },
};

// ─── Time helpers ─────────────────────────────────────────────────
function nowLocal(timezone) {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const get = (t) => (parts.find((p) => p.type === t) || {}).value;

    const dn = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
    }).format(new Date());
    const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    return {
        dayName: get('weekday'),
        month: get('month'),
        day: get('day'),
        year: get('year'),
        hour: get('hour'),
        minute: get('minute'),
        dayNum: dayMap[dn],
    };
}

// ─── classroom-schedule template ──────────────────────────────────
function findActiveCourse(courses, dayNum) {
    return courses.find((c) => Array.isArray(c.dayNums) && c.dayNums.includes(dayNum)) || null;
}

function findNextCourse(courses, dayNum) {
    for (let offset = 1; offset <= 7; offset++) {
        const d = (dayNum + offset) % 7;
        const c = courses.find((c) => Array.isArray(c.dayNums) && c.dayNums.includes(d));
        if (c) return { course: c, offset };
    }
    return null;
}

function dayOffsetLabel(now, offset) {
    if (offset === 1) return 'tomorrow';
    const dayName = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
    }).format(new Date(Date.now() + offset * 86400000));
    return dayName;
}

function renderClassroomSchedule(cfg, now) {
    const left = cfg.courses.find((c) => c.side === 'left') || cfg.courses[0] || null;
    const right = cfg.courses.find((c) => c.side === 'right') || cfg.courses[1] || null;

    const todayCourse = findActiveCourse(cfg.courses, now.dayNum);
    const noClass = todayCourse === null;

    const headerH = 90;
    const openLabH = cfg.openLab && cfg.openLab.enabled ? 44 : 0;
    const footerH = 64;
    const panelTop = headerH + 10;
    const panelBottom = HEIGHT - footerH - openLabH - 10;
    const openLabY = panelBottom + 5;
    const midX = WIDTH / 2;

    const panel = (course, x0) => {
        if (!course) return '';
        const active = todayCourse && todayCourse.code === course.code && todayCourse.side === course.side;
        const w = WIDTH / 2 - 16;
        const x = x0 + 8;
        const y = panelTop;
        const h = panelBottom - panelTop;
        const bg = active ? '#000' : '#fff';
        const fg = active ? '#fff' : '#000';
        const todayBadge = active
            ? `<g>
                 <rect x="${x + 18}" y="${y + 18}" rx="6" ry="6" width="98" height="28" fill="#fff" stroke="#fff" stroke-width="2"/>
                 <text x="${x + 67}" y="${y + 38}" text-anchor="middle" fill="#000" font-family="Inter, Segoe UI, sans-serif" font-size="16" font-weight="800" letter-spacing="2">TODAY</text>
               </g>`
            : '';
        return `
        <g>
            <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}" stroke="${fg}" stroke-width="3"/>
            ${todayBadge}
            <text x="${x + w / 2}" y="${y + 95}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="52" font-weight="900" letter-spacing="2">${course.code}</text>
            <text x="${x + w / 2}" y="${y + 140}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="26" font-weight="800" letter-spacing="1">${course.title}</text>
            <line x1="${x + 40}" y1="${y + 165}" x2="${x + w - 40}" y2="${y + 165}" stroke="${fg}" stroke-width="2" opacity="0.6"/>
            <text x="${x + w / 2}" y="${y + 205}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="22" font-weight="600">${course.days}</text>
            <text x="${x + w / 2}" y="${y + 245}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="700">${cfg.classTime}</text>
        </g>`;
    };

    let footerText;
    if (noClass) {
        const next = findNextCourse(cfg.courses, now.dayNum);
        footerText = next
            ? `No class today · Next: ${dayOffsetLabel(now, next.offset)} — ${next.course.code} ${next.course.title}`
            : 'No class today';
    } else {
        footerText = `${cfg.instructor}  ·  ${cfg.room}  ·  ${cfg.classTime}`;
    }

    const openLabBar = cfg.openLab && cfg.openLab.enabled
        ? `<rect x="0" y="${openLabY}" width="${WIDTH}" height="${openLabH}" fill="#000"/>
           <text x="${WIDTH / 2}" y="${openLabY + 30}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="24" font-weight="900" letter-spacing="4">OPEN LAB  ·  ${cfg.openLab.time}</text>`
        : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#fff"/>
        <rect x="0" y="0" width="${WIDTH}" height="${headerH}" fill="#000"/>
        <text x="30" y="40" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="900" letter-spacing="3">HEXWORTH PRIME</text>
        <text x="30" y="72" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="18" font-weight="500" letter-spacing="2">CLASSROOM SCHEDULE  ·  ${cfg.room}</text>
        <text x="${WIDTH - 30}" y="40" text-anchor="end" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="20" font-weight="700">${now.dayName}</text>
        <text x="${WIDTH - 30}" y="68" text-anchor="end" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="16" font-weight="400">${now.month} ${now.day}, ${now.year}</text>
        ${panel(left, 0)}
        ${panel(right, midX)}
        ${openLabBar}
        <rect x="0" y="${HEIGHT - footerH}" width="${WIDTH}" height="${footerH}" fill="#000"/>
        <text x="${WIDTH / 2}" y="${HEIGHT - footerH + 30}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="18" font-weight="600">${footerText}</text>
        <text x="${WIDTH / 2}" y="${HEIGHT - footerH + 52}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="12" font-weight="400" opacity="0.7">Generated ${now.hour}:${now.minute} · refresh every 15 minutes</text>
    </svg>`;
}

// ─── Renderer dispatch ────────────────────────────────────────────
const TEMPLATES = {
    'classroom-schedule': renderClassroomSchedule,
};

async function loadBoardConfig(db, boardId) {
    const ref = db.collection('epaper_boards').doc(boardId);
    const snap = await ref.get();
    if (snap.exists) return { ref, data: snap.data() };

    // Lazy-seed only for the default board so the existing device keeps working
    if (boardId === 'room-214') {
        const seed = {
            ...ROOM_214_DEFAULT,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };
        await ref.set(seed);
        const reread = await ref.get();
        return { ref, data: reread.data() };
    }

    return { ref, data: null };
}

async function updateHeartbeat(ref, req) {
    try {
        const ip = req.get('x-forwarded-for') || req.ip || '';
        await ref.update({
            lastSeen: FieldValue.serverTimestamp(),
            lastSeenIp: ip.split(',')[0].trim().slice(0, 64),
        });
    } catch (err) {
        // Best-effort — don't fail the image response on heartbeat write
        console.warn('operatorBoard heartbeat write failed:', err.message);
    }
}

async function renderPng(svg) {
    return await sharp(Buffer.from(svg))
        .resize(WIDTH, HEIGHT)
        .png({ colors: 2, compressionLevel: 9, palette: true })
        .toBuffer();
}

exports.operatorBoard = onRequest(
    { region: 'us-central1', cors: false, memory: '512MiB', timeoutSeconds: 30 },
    async (req, res) => {
        if (req.method !== 'GET') {
            res.status(405).set('Allow', 'GET').send('Method Not Allowed');
            return;
        }

        // Default to room-214 for backwards-compat with the existing device URL.
        const boardId = (req.query.board || 'room-214').toString().slice(0, 64);
        if (!/^[a-z0-9-]+$/i.test(boardId)) {
            res.status(400).send('Invalid board id');
            return;
        }

        try {
            const db = getFirestore();
            const { ref, data } = await loadBoardConfig(db, boardId);

            if (!data) {
                res.status(404).set('Content-Type', 'text/plain')
                    .send(`Board "${boardId}" not configured. Create it in /admin/epaper-boards.html`);
                return;
            }

            const template = data.template || 'classroom-schedule';
            const renderer = TEMPLATES[template];
            if (!renderer) {
                res.status(500).send(`Unknown template "${template}"`);
                return;
            }

            const cfg = data.config || {};
            const tz = cfg.timezone || 'America/New_York';
            const now = nowLocal(tz);
            const svg = renderer(cfg, now);
            const png = await renderPng(svg);

            // Heartbeat — best-effort, do not await before sending response
            updateHeartbeat(ref, req).catch(() => {});

            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'no-store, max-age=0');
            res.set('X-Operator-Board-Phase', '3');
            res.set('X-Operator-Board-Id', boardId);
            res.set('X-Operator-Board-Template', template);
            res.set('X-Operator-Board-Day', `${now.dayName}-${now.dayNum}`);
            res.status(200).send(png);
        } catch (err) {
            console.error('operatorBoard: render failed', err);
            res.status(500).send('Image render failed');
        }
    }
);
