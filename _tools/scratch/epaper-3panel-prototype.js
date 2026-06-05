/**
 * Prototype: 3-class room-214 schedule with per-course time + per-course instructor.
 *
 * Layout: Day-class row (top) + 2 Night-class panels (bottom) + Open Lab bar + footer.
 * Groups by time-of-day so students see "Day @ 9-1" with one course OR "Night @ 6-9"
 * with two courses on different day pairs.
 *
 * Output: /tmp/epaper-3panel-preview.png
 *
 * No Firestore mutation, no CF deploy, no production touch. Standalone preview.
 */
const fs = require('fs');
const path = require('path');
const sharp = require(path.join('/home/eq/ai-content/hexworth-prime/functions/node_modules/sharp'));

const WIDTH = 800;
const HEIGHT = 480;

// New schedule per operator image (6-5-26)
const CONFIG = {
    room: 'Room 214',
    timezone: 'America/New_York',
    dayBlock: {
        label: 'DAY CLASS',
        time: '9 AM – 1 PM',
        instructor: 'Professor Wallace',
        course: {
            code: 'CIS2218',
            title: 'HUMAN ASPECTS OF CYBERSECURITY',
            days: 'Mon · Tue · Thu',
            dayNums: [1, 2, 4],
        },
    },
    nightBlock: {
        label: 'NIGHT CLASS',
        time: '6 PM – 9 PM',
        instructor: 'Professor Mora',
        courses: [
            {
                code: 'CTS4321',
                title: 'ADVANCED LINUX ADMINISTRATION',
                days: 'Mon · Wed',
                dayNums: [1, 3],
                side: 'left',
            },
            {
                code: 'CTS1328C',
                title: 'MANAGING &amp; MAINTAINING SERVER OS',
                days: 'Tue · Thu',
                dayNums: [2, 4],
                side: 'right',
            },
        ],
    },
    openLab: { enabled: true, time: '3:00 – 5:00 PM' },
};

function nowLocal(timezone) {
    const dn = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' }).format(new Date());
    const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
        dayName: new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date()),
        month: new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'long' }).format(new Date()),
        day: new Intl.DateTimeFormat('en-US', { timeZone: timezone, day: 'numeric' }).format(new Date()),
        year: new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric' }).format(new Date()),
        hour: new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }).format(new Date()),
        minute: new Intl.DateTimeFormat('en-US', { timeZone: timezone, minute: '2-digit' }).format(new Date()),
        dayNum: dayMap[dn],
    };
}

function findActiveCourseToday(cfg, dayNum) {
    // Day block first (morning typically priority on weekdays), then nights
    if (cfg.dayBlock.course.dayNums.includes(dayNum)) {
        return { course: cfg.dayBlock.course, block: 'day', time: cfg.dayBlock.time, instructor: cfg.dayBlock.instructor };
    }
    for (const c of cfg.nightBlock.courses) {
        if (c.dayNums.includes(dayNum)) {
            return { course: c, block: 'night', time: cfg.nightBlock.time, instructor: cfg.nightBlock.instructor };
        }
    }
    return null;
}

function render3Panel(cfg, now) {
    const active = findActiveCourseToday(cfg, now.dayNum);

    const headerH = 90;
    const openLabH = cfg.openLab && cfg.openLab.enabled ? 44 : 0;
    const footerH = 64;

    const contentTop = headerH + 12;
    const contentBottom = HEIGHT - footerH - openLabH - 8;
    const contentH = contentBottom - contentTop;

    // Day class gets more vertical space (single course, featured)
    const daySectH = Math.round(contentH * 0.55);
    const nightSectH = contentH - daySectH - 6;
    const dayTop = contentTop;
    const nightTop = contentTop + daySectH + 8;

    const midX = WIDTH / 2;
    const openLabY = contentBottom + 4;

    // ── Day class panel (full width) ──
    const dayActive = active && active.block === 'day';
    const dayBg = dayActive ? '#000' : '#fff';
    const dayFg = dayActive ? '#fff' : '#000';
    const dayPanel = `
        <g>
            <rect x="12" y="${dayTop}" width="${WIDTH - 24}" height="${daySectH}" fill="${dayBg}" stroke="#000" stroke-width="3"/>
            <text x="28" y="${dayTop + 26}" fill="${dayFg}" font-family="Inter, Segoe UI, sans-serif" font-size="14" font-weight="700" letter-spacing="4" opacity="0.65">${cfg.dayBlock.label}  ·  ${cfg.dayBlock.time}  ·  ${cfg.dayBlock.instructor}</text>
            ${dayActive ? `
                <rect x="${WIDTH - 130}" y="${dayTop + 10}" rx="6" ry="6" width="100" height="28" fill="#fff" stroke="#fff" stroke-width="2"/>
                <text x="${WIDTH - 80}" y="${dayTop + 30}" text-anchor="middle" fill="#000" font-family="Inter, Segoe UI, sans-serif" font-size="16" font-weight="800" letter-spacing="2">TODAY</text>
            ` : ''}
            <text x="${midX}" y="${dayTop + 78}" text-anchor="middle" fill="${dayFg}" font-family="Inter, Segoe UI, sans-serif" font-size="48" font-weight="900" letter-spacing="2">${cfg.dayBlock.course.code}</text>
            <text x="${midX}" y="${dayTop + 112}" text-anchor="middle" fill="${dayFg}" font-family="Inter, Segoe UI, sans-serif" font-size="18" font-weight="800" letter-spacing="1">${cfg.dayBlock.course.title}</text>
            <text x="${midX}" y="${dayTop + 138}" text-anchor="middle" fill="${dayFg}" font-family="Inter, Segoe UI, sans-serif" font-size="16" font-weight="600">${cfg.dayBlock.course.days}</text>
        </g>`;

    // ── Night-section header bar ──
    const nightHeaderH = 24;
    const nightSubHeader = `
        <rect x="12" y="${nightTop}" width="${WIDTH - 24}" height="${nightHeaderH}" fill="#000"/>
        <text x="${midX}" y="${nightTop + 17}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="14" font-weight="700" letter-spacing="4">NIGHT CLASS  ·  ${cfg.nightBlock.time}  ·  ${cfg.nightBlock.instructor}</text>`;

    // ── Night panels (2 side-by-side under the night header) ──
    const nightPanelTop = nightTop + nightHeaderH + 4;
    const nightPanelH = nightSectH - nightHeaderH - 4;
    const panelW = (WIDTH - 36) / 2;  // 12 left margin + 12 gutter + 12 right margin

    const nightPanel = (course, x0) => {
        const isActive = active && active.block === 'night' && active.course.code === course.code;
        const bg = isActive ? '#000' : '#fff';
        const fg = isActive ? '#fff' : '#000';
        return `
            <g>
                <rect x="${x0}" y="${nightPanelTop}" width="${panelW}" height="${nightPanelH}" fill="${bg}" stroke="#000" stroke-width="3"/>
                ${isActive ? `
                    <rect x="${x0 + 12}" y="${nightPanelTop + 10}" rx="5" ry="5" width="90" height="24" fill="#fff" stroke="#fff" stroke-width="2"/>
                    <text x="${x0 + 57}" y="${nightPanelTop + 28}" text-anchor="middle" fill="#000" font-family="Inter, Segoe UI, sans-serif" font-size="14" font-weight="800" letter-spacing="2">TODAY</text>
                ` : ''}
                <text x="${x0 + panelW / 2}" y="${nightPanelTop + 36}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="32" font-weight="900" letter-spacing="2">${course.code}</text>
                <text x="${x0 + panelW / 2}" y="${nightPanelTop + 60}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="12" font-weight="700">${course.title}</text>
                <text x="${x0 + panelW / 2}" y="${nightPanelTop + 80}" text-anchor="middle" fill="${fg}" font-family="Inter, Segoe UI, sans-serif" font-size="14" font-weight="600">${course.days}</text>
            </g>`;
    };

    const leftNight = cfg.nightBlock.courses.find(c => c.side === 'left') || cfg.nightBlock.courses[0];
    const rightNight = cfg.nightBlock.courses.find(c => c.side === 'right') || cfg.nightBlock.courses[1];

    // ── Open lab bar ──
    const openLabBar = cfg.openLab && cfg.openLab.enabled ? `
        <rect x="0" y="${openLabY}" width="${WIDTH}" height="${openLabH}" fill="#000"/>
        <text x="${midX}" y="${openLabY + 30}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="22" font-weight="900" letter-spacing="4">OPEN LAB  ·  ${cfg.openLab.time}</text>` : '';

    // ── Footer (active info or no-class) ──
    let footerText;
    if (active) {
        footerText = `${active.instructor}  ·  ${cfg.room}  ·  ${active.time}  ·  ${active.course.code}`;
    } else {
        footerText = `No class today  ·  ${cfg.room}  ·  Day MTR 9-1  ·  Night MW/TR 6-9`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#fff"/>
        <rect x="0" y="0" width="${WIDTH}" height="${headerH}" fill="#000"/>
        <text x="30" y="40" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="900" letter-spacing="3">HEXWORTH PRIME</text>
        <text x="30" y="72" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="18" font-weight="500" letter-spacing="2">CLASSROOM SCHEDULE  ·  ${cfg.room}</text>
        <text x="${WIDTH - 30}" y="40" text-anchor="end" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="20" font-weight="700">${now.dayName}</text>
        <text x="${WIDTH - 30}" y="68" text-anchor="end" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="16" font-weight="400">${now.month} ${now.day}, ${now.year}</text>
        ${dayPanel}
        ${nightSubHeader}
        ${nightPanel(leftNight, 12)}
        ${nightPanel(rightNight, 12 + panelW + 12)}
        ${openLabBar}
        <rect x="0" y="${HEIGHT - footerH}" width="${WIDTH}" height="${footerH}" fill="#000"/>
        <text x="${midX}" y="${HEIGHT - footerH + 30}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="17" font-weight="600">${footerText}</text>
        <text x="${midX}" y="${HEIGHT - footerH + 52}" text-anchor="middle" fill="#fff" font-family="Inter, Segoe UI, sans-serif" font-size="12" font-weight="400" opacity="0.7">Generated ${now.hour}:${now.minute} · refresh every 15 minutes · PROTOTYPE</text>
    </svg>`;
}

(async () => {
    const now = nowLocal(CONFIG.timezone);
    const svg = render3Panel(CONFIG, now);
    const out = '/tmp/epaper-3panel-preview.png';
    await sharp(Buffer.from(svg))
        .resize(WIDTH, HEIGHT)
        .toFile(out);
    console.log('Rendered:', out);
    console.log('Today is dayNum=' + now.dayNum + ' (' + now.dayName + ')');
    const active = findActiveCourseToday(CONFIG, now.dayNum);
    console.log('Active course today:', active ? active.course.code + ' ' + active.block : 'none');
})();
