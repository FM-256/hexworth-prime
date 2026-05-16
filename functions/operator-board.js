/**
 * operatorBoard — HTTP Cloud Function serving a classroom-door e-paper display.
 *
 * Audience: students approaching Room 214.
 *
 * Behavior:
 *   - Reads current time in America/New_York
 *   - Determines today's class (if any) and renders an SVG composition
 *   - Converts SVG → 800×480 1-bit PNG via sharp
 *   - Returns image/png; device polls every 15 min
 *
 * Schedule:
 *   Mon / Wed  →  CIS4253  Ethics in IT
 *   Tue / Thu  →  CIS2350C Principles of Information Security
 *   Fri / Sat / Sun  →  no class
 *
 *   All sections meet 6:00 - 9:00 PM in Room 214.
 *   Instructor: Professor Frank Mora MCSIA
 */

const { onRequest } = require('firebase-functions/v2/https');
const sharp = require('sharp');

const WIDTH = 800;
const HEIGHT = 480;
const TIMEZONE = 'America/New_York';

const COURSES = {
    ETH: {
        code: 'CIS4253',
        title: 'ETHICS IN IT',
        days: 'Mondays · Wednesdays',
        dayNums: [1, 3],  // 0=Sun, 1=Mon, ... 6=Sat
        side: 'left',
    },
    PIS: {
        code: 'CIS2350C',
        title: 'PRINCIPLES OF INFOSEC',
        days: 'Tuesdays · Thursdays',
        dayNums: [2, 4],
        side: 'right',
    },
};

const ROOM = 'Room 214';
const INSTRUCTOR = 'Professor Frank Mora, MCSIA';
const TIME = '6:00 – 9:00 PM';
const OPEN_LAB_TIME = '3:00 – 5:00 PM';

/** Get current local date components in America/New_York timezone. */
function nowLocal() {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
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

    // dayNum requires another pass — Intl gives the name, we need 0-6.
    const dn = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
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

/** Return the course meeting today, or null if no class day. */
function todaysCourse(dayNum) {
    if (COURSES.ETH.dayNums.includes(dayNum)) return 'ETH';
    if (COURSES.PIS.dayNums.includes(dayNum)) return 'PIS';
    return null;
}

/** Find the next class day relative to today (used on no-class days). */
function nextCourse(dayNum) {
    for (let offset = 1; offset <= 7; offset++) {
        const d = (dayNum + offset) % 7;
        if (COURSES.ETH.dayNums.includes(d)) return { key: 'ETH', offset };
        if (COURSES.PIS.dayNums.includes(d)) return { key: 'PIS', offset };
    }
    return null;
}

function dayLabel(offset) {
    if (offset === 1) return 'tomorrow';
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][
        (new Date().getDay() + offset) % 7
    ];
}

/** Build the SVG layout. Pure monochrome for a 1-bit e-paper. */
function buildSvg(now) {
    const todayKey = todaysCourse(now.dayNum);
    const ethActive = todayKey === 'ETH';
    const pisActive = todayKey === 'PIS';
    const noClass = todayKey === null;

    // Vertical layout — top to bottom:
    //   header → gap → panels → openLabBar → footer
    const headerH = 90;
    const openLabH = 44;
    const footerH = 64;
    const panelTop = headerH + 10;
    const panelBottom = HEIGHT - footerH - openLabH - 10;
    const openLabY = panelBottom + 5;
    const midX = WIDTH / 2;

    // A panel is either "active" (inverted: black fill, white text)
    // or "inactive" (white fill, black text + border)
    const panel = (course, active, x0) => {
        const w = WIDTH / 2 - 16;
        const x = x0 + 8;
        const y = panelTop;
        const h = panelBottom - panelTop;

        const bg = active ? '#000' : '#fff';
        const fg = active ? '#fff' : '#000';
        const accentStroke = active ? '#fff' : '#000';

        const todayBadge = active
            ? `<g>
                 <rect x="${x + 18}" y="${y + 18}" rx="6" ry="6" width="98" height="28" fill="#fff" stroke="#fff" stroke-width="2"/>
                 <text x="${x + 67}" y="${y + 38}" text-anchor="middle" fill="#000" font-family="Inter, Segoe UI, sans-serif" font-size="16" font-weight="800" letter-spacing="2">TODAY</text>
               </g>`
            : '';

        return `
        <g>
            <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}" stroke="${accentStroke}" stroke-width="3"/>
            ${todayBadge}
            <text x="${x + w / 2}" y="${y + 95}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="52" font-weight="900" letter-spacing="2">${course.code}</text>
            <text x="${x + w / 2}" y="${y + 140}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="26" font-weight="800" letter-spacing="1">${course.title}</text>
            <line x1="${x + 40}" y1="${y + 165}" x2="${x + w - 40}" y2="${y + 165}" stroke="${fg}" stroke-width="2" opacity="0.6"/>
            <text x="${x + w / 2}" y="${y + 205}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="22" font-weight="600">${course.days}</text>
            <text x="${x + w / 2}" y="${y + 245}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="700">${TIME}</text>
        </g>`;
    };

    // Footer message
    let footerText;
    if (noClass) {
        const next = nextCourse(now.dayNum);
        if (next) {
            const c = COURSES[next.key];
            footerText = `No class today · Next: ${dayLabel(next.offset)} — ${c.code} ${c.title}`;
        } else {
            footerText = 'No class today';
        }
    } else {
        footerText = `${INSTRUCTOR}  ·  ${ROOM}  ·  ${TIME}`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#fff"/>

        <!-- Header -->
        <rect x="0" y="0" width="${WIDTH}" height="${headerH}" fill="#000"/>
        <text x="30" y="40" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="900" letter-spacing="3">HEXWORTH PRIME</text>
        <text x="30" y="72" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="18" font-weight="500" letter-spacing="2">CLASSROOM SCHEDULE  ·  ${ROOM}</text>
        <text x="${WIDTH - 30}" y="40" text-anchor="end" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="20" font-weight="700">${now.dayName}</text>
        <text x="${WIDTH - 30}" y="68" text-anchor="end" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="16" font-weight="400">${now.month} ${now.day}, ${now.year}</text>

        <!-- Two course panels -->
        ${panel(COURSES.ETH, ethActive, 0)}
        ${panel(COURSES.PIS, pisActive, midX)}

        <!-- Central vertical divider rendered AS A GAP between panels.
             Each panel reserves 8px margin from midX, so the gap is the divider. -->

        <!-- Open Lab bar -->
        <rect x="0" y="${openLabY}" width="${WIDTH}" height="${openLabH}" fill="#000"/>
        <text x="${WIDTH / 2}" y="${openLabY + 30}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="24" font-weight="900" letter-spacing="4">OPEN LAB  ·  ${OPEN_LAB_TIME}</text>

        <!-- Footer -->
        <rect x="0" y="${HEIGHT - footerH}" width="${WIDTH}" height="${footerH}" fill="#000"/>
        <text x="${WIDTH / 2}" y="${HEIGHT - footerH + 30}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="18" font-weight="600">${footerText}</text>
        <text x="${WIDTH / 2}" y="${HEIGHT - footerH + 52}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="12" font-weight="400" opacity="0.7">Generated ${now.hour}:${now.minute} · refresh every 15 minutes</text>
    </svg>`;
}

/** Render the SVG to a 1-bit PNG via sharp. */
async function renderPng(svg) {
    return await sharp(Buffer.from(svg))
        .resize(WIDTH, HEIGHT)
        .png({
            colors: 2,        // monochrome palette
            compressionLevel: 9,
            palette: true,
        })
        .toBuffer();
}

exports.operatorBoard = onRequest(
    { region: 'us-central1', cors: false, memory: '512MiB', timeoutSeconds: 30 },
    async (req, res) => {
        if (req.method !== 'GET') {
            res.status(405).set('Allow', 'GET').send('Method Not Allowed');
            return;
        }

        try {
            const now = nowLocal();
            const svg = buildSvg(now);
            const png = await renderPng(svg);

            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'no-store, max-age=0');
            res.set('X-Operator-Board-Phase', '2');
            res.set('X-Operator-Board-Day', `${now.dayName}-${now.dayNum}`);
            res.status(200).send(png);
        } catch (err) {
            console.error('operatorBoard: render failed', err);
            res.status(500).send('Image render failed');
        }
    }
);
