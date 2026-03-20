/* ============================================================
   CTF ARENA — Box OSINT-02: The Hidden Location
   OSINT | Geolocation & Image Intelligence
   Config: images, EXIF data, filesystem, flags, hints, lore
   ============================================================ */

const Osint02Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Hidden Location',
    subtitle: 'OSINT — Geolocation & Image Intelligence',
    difficulty: 'Intermediate',
    accent: '#10b981',
    storageKey: 'hexworth_ctf_osint02',
    registryId: 'osint-02-geolocation',
    trackerKey: 'ctf_osint02',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Image Acquisition',
            icon: '\uD83D\uDDBC\uFE0F',
            description: 'Examine the intercepted images. Extract all available metadata from each file.',
            requiredFlags: [],
            mitre: ['T1113', 'T1005'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Metadata Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Analyze EXIF data, GPS coordinates, timestamps, and camera information.',
            requiredFlags: [],
            mitre: ['T1592.004', 'T1589'],
            unlocks: ['geolocation'],
            locked: true
        },
        {
            id: 'geolocation',
            name: 'Geolocation',
            icon: '\uD83D\uDDFA\uFE0F',
            description: 'Use GPS coordinates and visual clues to identify the exact location.',
            requiredFlags: ['user'],
            mitre: ['T1591.001', 'T1596'],
            unlocks: ['identification'],
            locked: true
        },
        {
            id: 'identification',
            name: 'Facility Identification',
            icon: '\uD83C\uDFE2',
            description: 'Identify the specific building and its purpose from all gathered intelligence.',
            requiredFlags: ['root'],
            mitre: ['T1591', 'T1598'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'List the evidence files',
                tip: 'Run: ls /home/kali/evidence/ to see available images.',
                trigger: { event: 'command', match: { cmd: 'contains:ls' } }
            },
            {
                title: 'Extract EXIF metadata',
                tip: 'Run: exiftool /home/kali/evidence/photo_001.jpg',
                trigger: { event: 'command', match: { cmd: 'contains:exiftool' } }
            },
            {
                title: 'Analyze embedded strings',
                tip: 'Try: strings /home/kali/evidence/photo_002.jpg | grep -i location',
                trigger: { event: 'command', match: { cmd: 'contains:strings' } }
            },
            {
                title: 'Reverse geocode the coordinates',
                tip: 'Use curl to query a geocoding API with the GPS coordinates from the EXIF data.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Identify the facility',
                tip: 'Cross-reference the address with the building description in the images to find the facility name.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Metadata analysis', skill: 'EXIF Data Extraction' },
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Image intelligence', skill: 'Geolocation from Metadata' },
            { flagId: 'root', objective: '5.1', description: 'Summarize elements of effective security governance — OSINT reconnaissance', skill: 'Physical Location Intelligence' },
            { flagId: 'root', objective: '5.4', description: 'Summarize elements of effective security governance — Threat intelligence', skill: 'Facility Identification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nEvidence files in: /home/kali/evidence/\n'
    },

    // ═══════════════════════════════════════════════════════
    // IMAGE EVIDENCE DATA
    // ═══════════════════════════════════════════════════════

    _images: {
        'photo_001.jpg': {
            camera: 'Nikon D850',
            lens: 'AF-S NIKKOR 24-70mm f/2.8E ED VR',
            datetime: '2024:06:15 09:22:41',
            gps_lat: '38.8977',
            gps_lon: '-77.0365',
            gps_display: '38 deg 53\' 51.72" N, 77 deg 2\' 11.40" W',
            software: 'Adobe Photoshop CC 2024',
            artist: 'J. Marcus',
            description: 'Exterior shot of a large white building with columns, iron fence in foreground',
            comment: 'SITE_SURVEY_PHASE2_WHITEHOUSE',
            classified: '{{FLAG:root}}'
        },
        'photo_002.jpg': {
            camera: 'iPhone 15 Pro',
            datetime: '2024:06:15 10:45:12',
            gps_lat: '38.8893',
            gps_lon: '-77.0502',
            gps_display: '38 deg 53\' 21.48" N, 77 deg 3\' 0.72" W',
            software: 'iOS 17.5',
            description: 'Long reflecting pool with monument at far end, viewed from elevated steps',
            comment: 'recon_lincoln_memorial_vantage'
        },
        'photo_003.jpg': {
            camera: 'Nikon D850',
            lens: 'AF-S NIKKOR 24-70mm f/2.8E ED VR',
            datetime: '2024:06:15 14:08:33',
            gps_lat: '38.8895',
            gps_lon: '-77.0353',
            gps_display: '38 deg 53\' 22.20" N, 77 deg 2\' 7.08" W',
            software: 'Adobe Photoshop CC 2024',
            artist: 'J. Marcus',
            description: 'Tall obelisk structure, surrounded by flags at base, clear sky',
            comment: 'washington_monument_baseline_photo'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Run exiftool on each image in /home/kali/evidence/. Pay attention to GPS coordinates and embedded comments.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use strings on the images to find hidden text. One image has a comment that reveals the site survey codename.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The GPS coordinates in photo_001.jpg point to 38.8977 N, 77.0365 W. Use reverse geocoding to find the address.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The user flag is the city: "Washington DC". The root flag is the primary target building: "The White House".',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Three photographs were intercepted from a suspected reconnaissance operation. The images appear to show government buildings and landmarks, but the locations have been scrubbed from the file names. Your mission: analyze the metadata, geolocate the images, and identify the primary target of the surveillance operation.',
        scenario: 'A foreign intelligence service dispatched an operative to conduct physical surveillance of high-value government targets. The operative used both a professional DSLR and a personal smartphone, not realizing the metadata differences. The photos were exfiltrated via an encrypted channel but intercepted by SIGINT.',
        outro: 'The Hidden Location is revealed. The surveillance operation was targeting the White House and surrounding landmarks in Washington DC. The operative\'s failure to strip EXIF data from the images compromised the entire operation.',
        ecer: {
            executive: 'Intelligence agency failed to train operatives on metadata scrubbing',
            culture: 'Overreliance on encrypted channels without addressing metadata leakage',
            employee: 'Operative mixed personal and operational devices during the mission',
            regulatory: 'No operational procedure requiring pre-exfiltration metadata removal'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://geo-tools.local/',

        pages: {
            '/': {
                title: 'Geo Intelligence Toolkit',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#10b981; font-size:1.6rem; margin-bottom:4px;">Geo Intelligence Toolkit</h1>
                        <div style="color:#888; font-size:0.8rem;">Reverse Geocoding & Mapping Service</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto 20px;">
                        <label style="display:block; color:#808080; font-size:0.8rem; margin-bottom:6px;">Enter GPS Coordinates (lat, lon):</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="search" placeholder="e.g. 38.8977, -77.0365"
                                   style="flex:1; padding:8px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <button data-action="search"
                                    style="padding:8px 20px; background:#10b981; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Lookup</button>
                        </div>
                    </div>
                    <div data-results style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.75rem; text-align:center; padding:20px;">Enter coordinates to reverse geocode.</div>
                    </div>
                `,
                formHandler: function(data) {
                    const q = (data.q || data.search || '').trim();
                    if (!q) return '<div style="color:#888; padding:10px; text-align:center;">Please enter GPS coordinates.</div>';

                    if (q.includes('38.8977') && q.includes('77.0365')) {
                        return `<div style="background:#ecfdf5; border:1px solid #6ee7b7; border-radius:6px; padding:15px; margin:10px 0;">
                            <strong style="color:#10b981;">Location Found</strong><br><br>
                            <strong>Address:</strong> 1600 Pennsylvania Avenue NW<br>
                            <strong>City:</strong> Washington, DC 20500<br>
                            <strong>Country:</strong> United States<br>
                            <strong>Landmark:</strong> The White House<br>
                            <strong>Type:</strong> Government Building — Executive Residence<br>
                            <strong>Intel Code:</strong> {{FLAG:user}}
                        </div>`;
                    }
                    if (q.includes('38.8893') && q.includes('77.0502')) {
                        return `<div style="background:#ecfdf5; border:1px solid #6ee7b7; border-radius:6px; padding:15px; margin:10px 0;">
                            <strong style="color:#10b981;">Location Found</strong><br><br>
                            <strong>Address:</strong> 2 Lincoln Memorial Circle NW<br>
                            <strong>City:</strong> Washington, DC 20037<br>
                            <strong>Country:</strong> United States<br>
                            <strong>Landmark:</strong> Lincoln Memorial<br>
                            <strong>Type:</strong> National Monument
                        </div>`;
                    }
                    if (q.includes('38.8895') && q.includes('77.0353')) {
                        return `<div style="background:#ecfdf5; border:1px solid #6ee7b7; border-radius:6px; padding:15px; margin:10px 0;">
                            <strong style="color:#10b981;">Location Found</strong><br><br>
                            <strong>Address:</strong> 2 15th Street NW<br>
                            <strong>City:</strong> Washington, DC 20024<br>
                            <strong>Country:</strong> United States<br>
                            <strong>Landmark:</strong> Washington Monument<br>
                            <strong>Type:</strong> National Monument
                        </div>`;
                    }
                    return '<div style="color:#888; padding:10px; text-align:center;">No results for those coordinates.</div>';
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Intercepted surveillance photographs\nObjective: Geolocate images and identify the target\n\nSteps:\n1. Examine files in /home/kali/evidence/\n2. Extract EXIF metadata with exiftool\n3. Look for hidden strings in the images\n4. Reverse geocode GPS coordinates\n5. Identify the primary surveillance target\n\nEvidence was intercepted from encrypted channel.\nGood luck, operator.'
                                },
                                'evidence': {
                                    type: 'dir',
                                    children: {
                                        'photo_001.jpg': {
                                            type: 'file',
                                            content: '[JPEG image data, 6000x4000, EXIF metadata present]\nNikon D850 | 38.8977 N, 77.0365 W\nComment: SITE_SURVEY_PHASE2_WHITEHOUSE'
                                        },
                                        'photo_002.jpg': {
                                            type: 'file',
                                            content: '[JPEG image data, 4032x3024, EXIF metadata present]\niPhone 15 Pro | 38.8893 N, 77.0502 W\nComment: recon_lincoln_memorial_vantage'
                                        },
                                        'photo_003.jpg': {
                                            type: 'file',
                                            content: '[JPEG image data, 6000x4000, EXIF metadata present]\nNikon D850 | 38.8895 N, 77.0353 W\nComment: washington_monument_baseline_photo'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: 'INTERCEPTED EVIDENCE\n====================\n3 photographs recovered from encrypted exfiltration channel.\nOriginal filenames were stripped. Renamed sequentially.\nAll files verified intact. EXIF data appears unmodified.\n\nClassification: CONFIDENTIAL\nCase: OP-SHADOW-LENS-2024'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls evidence/\nexiftool evidence/photo_001.jpg\nstrings evidence/photo_001.jpg | grep -i site'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': { type: 'dir', children: {} }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'exiftool': function(args) {
            if (args.length === 0) return 'Usage: exiftool [OPTIONS] FILE';
            const file = args[args.length - 1];
            const images = Osint02Config._images;

            for (const [name, data] of Object.entries(images)) {
                if (file.includes(name.replace('.jpg', '')) || file === name) {
                    let output = `ExifTool Version Number         : 12.67
File Name                       : ${name}
File Size                       : ${name === 'photo_002.jpg' ? '3.1 MB' : '8.7 MB'}
File Type                       : JPEG
MIME Type                       : image/jpeg
Camera Model Name               : ${data.camera}`;
                    if (data.lens) output += `\nLens Model                      : ${data.lens}`;
                    output += `
Date/Time Original              : ${data.datetime}
GPS Latitude                    : ${data.gps_display.split(',')[0].trim()}
GPS Longitude                   : ${data.gps_display.split(',')[1].trim()}
GPS Position                    : ${data.gps_lat} N, ${data.gps_lon.replace('-', '')} W
Software                        : ${data.software}`;
                    if (data.artist) output += `\nArtist                          : ${data.artist}`;
                    output += `\nImage Description               : ${data.description}`;
                    if (data.comment) output += `\nUser Comment                    : ${data.comment}`;
                    if (data.classified) output += `\nClassified Tag                  : ${data.classified}`;
                    return output;
                }
            }
            return `Error: File not found - ${file}`;
        },

        'strings': function(args) {
            if (args.length === 0) return 'Usage: strings [OPTIONS] FILE';
            const file = args[args.length - 1];
            const images = Osint02Config._images;

            for (const [name, data] of Object.entries(images)) {
                if (file.includes(name.replace('.jpg', '')) || file === name) {
                    let output = `JFIF\nExif\nNikon\nhttp://ns.adobe.com/xap/1.0/\n${data.camera}\n${data.software}\n`;
                    if (data.artist) output += `${data.artist}\n`;
                    if (data.comment) output += `${data.comment}\n`;
                    if (data.classified) output += `${data.classified}\n`;
                    output += `${data.description}\nGPS\n${data.gps_lat}\n${data.gps_lon}`;
                    return output;
                }
            }
            return '';
        },

        'curl': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('geocod') || url.includes('nominatim') || url.includes('maps')) {
                if (url.includes('38.8977') && url.includes('77.0365')) {
                    return JSON.stringify({
                        address: '1600 Pennsylvania Avenue NW',
                        city: 'Washington',
                        state: 'DC',
                        country: 'United States',
                        landmark: 'The White House',
                        postal_code: '20500'
                    }, null, 2);
                }
                if (url.includes('38.8893') && url.includes('77.0502')) {
                    return JSON.stringify({
                        address: '2 Lincoln Memorial Circle NW',
                        city: 'Washington',
                        state: 'DC',
                        country: 'United States',
                        landmark: 'Lincoln Memorial'
                    }, null, 2);
                }
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.11.6\nType "exit()" to quit.\n>>> ';
            return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory';
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [OPTIONS] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            if (pattern.toLowerCase().includes('site') || pattern.toLowerCase().includes('recon') || pattern.toLowerCase().includes('white')) {
                return 'SITE_SURVEY_PHASE2_WHITEHOUSE\nrecon_lincoln_memorial_vantage\nwashington_monument_baseline_photo';
            }
            if (pattern.toLowerCase().includes('gps') || pattern.toLowerCase().includes('location')) {
                return '38.8977 N, 77.0365 W\n38.8893 N, 77.0502 W\n38.8895 N, 77.0353 W';
            }
            return '';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
