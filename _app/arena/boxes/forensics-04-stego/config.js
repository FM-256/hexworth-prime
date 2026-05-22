/* ============================================================
   CTF ARENA — Box Forensics-04: The Hidden Message
   Steganography | Image & Audio Analysis
   Config: stego files, tools, flags, hints, lore
   ============================================================ */

const Forensics04Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Hidden Message',
    subtitle: 'Steganography — Image & Audio Analysis',
    difficulty: 'Intermediate',
    accent: '#d97706',
    storageKey: 'hexworth_ctf_forensics04',
    registryId: 'forensics-04-stego',
    trackerKey: 'ctf_forensics04',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'File Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Examine the provided files. Check metadata, file types, and look for anomalies.',
            requiredFlags: [],
            mitre: ['T1027', 'T1564.004'],
            unlocks: ['image_analysis'],
            locked: false
        },
        {
            id: 'image_analysis',
            name: 'Image Steganography',
            icon: '\uD83D\uDDBC\uFE0F',
            description: 'Analyze the image files for hidden data. Use LSB extraction and visual analysis tools.',
            requiredFlags: [],
            mitre: ['T1027.003', 'T1564'],
            unlocks: ['audio_analysis'],
            locked: true
        },
        {
            id: 'audio_analysis',
            name: 'Audio Steganography',
            icon: '\uD83C\uDFB5',
            description: 'Analyze the audio file for hidden data in the spectrogram or embedded payloads.',
            requiredFlags: ['user'],
            mitre: ['T1027', 'T1001.003'],
            unlocks: ['reporting'],
            locked: true
        },
        {
            id: 'reporting',
            name: 'Intelligence Report',
            icon: '\uD83D\uDCCB',
            description: 'Compile all hidden messages and report the covert communication channel.',
            requiredFlags: ['root'],
            mitre: ['T1001', 'T1564'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Examine the evidence files',
                tip: 'Start by listing the files in /evidence/ and checking their types with the file command.',
                trigger: { event: 'command', match: { cmd: 'contains:file' } }
            },
            {
                title: 'Check image metadata',
                tip: 'Run exiftool on the image files to look for suspicious metadata or comments.',
                trigger: { event: 'command', match: { cmd: 'contains:exiftool' } }
            },
            {
                title: 'Extract hidden data from the image',
                tip: 'Use zsteg or steghide to extract data hidden in the LSB of the PNG image.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:zsteg' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:steghide' } }
                    ]
                }
            },
            {
                title: 'Find the hidden message in the image',
                tip: 'The LSB extraction reveals a hidden text message containing the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decode the audio spectrogram',
                tip: 'Generate or view the spectrogram of the WAV file. The hidden data is encoded in the frequency domain.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Steganography and data obfuscation', skill: 'Image Steganography Detection' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators — Data hiding in digital media', skill: 'LSB Extraction' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators — Covert communication channels', skill: 'Audio Steganography' },
            { flagId: 'root', objective: '4.4', description: 'Given an incident, apply mitigation techniques — Digital forensics: steganographic analysis', skill: 'Spectrogram Analysis' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'SIFT Workstation BIOS v3.8.2',
            'Initializing forensic environment...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'Steganography toolkit loaded',
            'Evidence files mounted: /evidence/',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu SIFT Workstation',
            'Ubuntu SIFT (recovery mode)',
            'Advanced options for SIFT'
        ],
        loginUser: 'investigator'
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
        user: 'investigator',
        hostname: 'sift-workstation',
        startDir: '/home/investigator',
        welcome: 'SIFT Workstation 6.1 — Steganography Analysis Lab\n\nType \'help\' for available commands.\nEvidence files: /evidence/\nTools: steghide, zsteg, binwalk, exiftool, strings, xxd\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED STEGO DATA
    // ═══════════════════════════════════════════════════════

    _stegoData: {
        files: [
            { name: 'corporate_photo.png', type: 'PNG image', size: '2,847,392 bytes', width: 1920, height: 1080, bitDepth: 8, colorType: 'RGB', hidden: 'LSB' },
            { name: 'logo_draft.jpg', type: 'JPEG image', size: '456,192 bytes', width: 800, height: 600, hidden: 'exif_comment' },
            { name: 'quarterly_report.png', type: 'PNG image', size: '1,234,567 bytes', width: 1024, height: 768, bitDepth: 8, colorType: 'RGB', hidden: 'none' },
            { name: 'podcast_ep42.wav', type: 'WAV audio', size: '8,847,360 bytes', sampleRate: 44100, channels: 2, bitRate: 1411, duration: '00:50', hidden: 'spectrogram' },
            { name: 'meeting_notes.txt', type: 'ASCII text', size: '2,847 bytes', hidden: 'none' }
        ],
        lsbMessage: '--- COVERT CHANNEL TRANSMISSION ---\nAgent: NIGHTINGALE\nHandler: OSPREY\nDate: 2024-12-12\n\nDead drop coordinates: 38.8977N, 77.0365W\nPackage contents: USB drive (encrypted)\nEncryption key: Alpha-7-Bravo-9-Charlie\n\nNext contact: 2024-12-19 14:00 UTC\nFallback: Bench 7, Lincoln Memorial\n\nVerification: {{FLAG:user}}\n--- END TRANSMISSION ---',
        exifComment: 'Photographer: J. Smith | Notes: See R. Chen for Q4 data | Draft v3',
        spectrogramMessage: '--- SPECTROGRAM DECODED ---\nFrequency band: 18000-20000 Hz (ultrasonic)\nModulation: FSK binary encoding\n\nDecoded payload:\nOPERATION MOCKINGBIRD - Phase 2\nAsset extraction window: 72 hours\nRally point: Grid ref 4827-NOVEMBER\nAuthentication code: {{FLAG:root}}\n--- END DECODE ---',
        binwalkResults: {
            'corporate_photo.png': [
                { offset: 0, type: 'PNG image', description: 'PNG image, 1920 x 1080, 8-bit/color RGB, non-interlaced' },
                { offset: 2847100, type: 'Zlib', description: 'Zlib compressed data, default compression' }
            ],
            'podcast_ep42.wav': [
                { offset: 0, type: 'WAV audio', description: 'Microsoft RIFF WAV audio, 44100 Hz, stereo, 16-bit' }
            ],
            'logo_draft.jpg': [
                { offset: 0, type: 'JPEG image', description: 'JFIF standard 1.01, aspect ratio, density 72x72' }
            ]
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
        minScore: 0,
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
            text: 'Start by running file and exiftool on all evidence files. The corporate_photo.png is a 24-bit PNG — perfect for LSB steganography. The podcast WAV file has an unusually large file size for its duration.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use zsteg on the PNG file to check for LSB-embedded data. Try: zsteg corporate_photo.png — it will check multiple bit planes and color channels for hidden data.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag is hidden in the LSB (Least Significant Bit) of the RGB channels in corporate_photo.png. Run: zsteg -a corporate_photo.png to extract all possible payloads.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The root flag is encoded in the spectrogram of podcast_ep42.wav using ultrasonic frequencies (18-20kHz). Use python3 with scipy/matplotlib to generate a spectrogram, or run the stegsolve audio analyzer.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Counter-intelligence intercepted files from a suspected double agent at Meridian Defense Systems. The files appear to be ordinary corporate documents — a company photo, a logo draft, and a podcast recording. But SIGINT analysis suggests these files contain hidden communications using steganographic techniques. Your mission: extract the hidden messages and identify the covert communication channel.',
        scenario: 'Agent codename NIGHTINGALE has been passing classified information to a foreign handler through steganographic channels. The agent embeds messages in ordinary-looking files shared through the company\'s internal file server. The corporate IT team never suspected anything — the files look perfectly normal to the naked eye. Only specialized forensic analysis can reveal the truth.',
        outro: 'The hidden messages have been extracted. NIGHTINGALE\'s covert communication channel used LSB steganography in images and spectrogram encoding in audio files — two classic techniques that bypass standard content inspection. The dead drop coordinates, encryption keys, and operation details are now in counter-intelligence hands.',
        ecer: {
            executive: 'CSO rejected proposal for DLP with steganography detection citing "unnecessary expense"',
            culture: 'No file integrity monitoring on internal file shares, no anomaly detection for file sizes',
            employee: 'Agent exploited trust in internal file sharing to distribute steganographic payloads',
            regulatory: 'No requirement for steganographic content inspection in defense contractor security frameworks'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Evidence Viewer
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8080/stego-lab/',

        pages: {
            '/stego-lab/': {
                title: 'Steganography Analysis Lab',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#d97706; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Steganography Analysis Lab</h1>
                        <div style="color:#888; font-size:0.8rem;">Case #CI-2024-0089 &mdash; Meridian Defense Systems</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:8px;">EVIDENCE FILES</div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead><tr style="background:#fef3c7;">
                                <th style="padding:6px 10px; text-align:left; color:#d97706; border-bottom:2px solid #ddd;">File</th>
                                <th style="padding:6px 10px; text-align:left; color:#d97706; border-bottom:2px solid #ddd;">Type</th>
                                <th style="padding:6px 10px; text-align:left; color:#d97706; border-bottom:2px solid #ddd;">Size</th>
                            </tr></thead>
                            <tbody>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace;">corporate_photo.png</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">PNG Image</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">2.8 MB</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace;">logo_draft.jpg</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">JPEG Image</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">456 KB</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace;">quarterly_report.png</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">PNG Image</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">1.2 MB</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace;">podcast_ep42.wav</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">WAV Audio</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">8.8 MB</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace;">meeting_notes.txt</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Text</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">2.8 KB</td></tr>
                            </tbody>
                        </table>

                        <div style="margin-top:20px; padding:12px; background:rgba(217,119,6,0.06); border:1px solid rgba(217,119,6,0.2); border-radius:4px; font-size:0.78rem; color:#666;">
                            <strong style="color:#d97706;">Objective:</strong> Analyze the evidence files for hidden steganographic content. Extract messages from image LSB data and audio spectrogram encoding. Tools available: steghide, zsteg, binwalk, exiftool, strings, xxd, python3.
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (investigator workstation)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'investigator': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== CASE BRIEFING ===\nCase: #CI-2024-0089\nSubject: Agent NIGHTINGALE (suspected)\nOrg: Meridian Defense Systems\nEvidence: /evidence/\n\nAnalysis steps:\n1. file — check all file types\n2. exiftool — examine metadata\n3. strings — look for embedded text\n4. binwalk — check for embedded files\n5. zsteg — PNG LSB analysis\n6. steghide — JPEG stego extraction\n7. python3 — spectrogram analysis\n\nUser flag: hidden in image LSB\nRoot flag: hidden in audio spectrogram\n\nNote: corporate_photo.png is suspiciously large\nfor a 1920x1080 PNG. Check for LSB embedding.'
                                },
                                'scripts': {
                                    type: 'dir',
                                    children: {
                                        'spectrogram.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Generate spectrogram from WAV file."""\nimport sys\nfrom scipy.io import wavfile\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ndef analyze(wav_path):\n    rate, data = wavfile.read(wav_path)\n    if len(data.shape) > 1:\n        data = data[:, 0]  # mono\n    plt.specgram(data, Fs=rate, NFFT=4096)\n    plt.title("Spectrogram Analysis")\n    plt.xlabel("Time (s)")\n    plt.ylabel("Frequency (Hz)")\n    plt.colorbar(label="Intensity (dB)")\n    plt.savefig("spectrogram_output.png")\n    print("Spectrogram saved to spectrogram_output.png")\n    # Check ultrasonic band\n    print("\\nChecking 18-20kHz band for hidden data...")\n\nif __name__ == "__main__":\n    if len(sys.argv) < 2:\n        print("Usage: python3 spectrogram.py <file.wav>")\n    else:\n        analyze(sys.argv[1])'
                                        }
                                    }
                                },
                                'output': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls -la /evidence/\nfile /evidence/*\nexiftool /evidence/corporate_photo.png'
                                }
                            }
                        }
                    }
                },
                'evidence': {
                    type: 'dir',
                    children: {
                        'corporate_photo.png': {
                            type: 'file',
                            content: '[PNG IMAGE DATA — 2,847,392 bytes — 1920x1080 RGB — Use steganography tools to analyze]'
                        },
                        'logo_draft.jpg': {
                            type: 'file',
                            content: '[JPEG IMAGE DATA — 456,192 bytes — 800x600 — Use exiftool/steghide to analyze]'
                        },
                        'quarterly_report.png': {
                            type: 'file',
                            content: '[PNG IMAGE DATA — 1,234,567 bytes — 1024x768 RGB — Clean file, no steganographic content]'
                        },
                        'podcast_ep42.wav': {
                            type: 'file',
                            content: '[WAV AUDIO DATA — 8,847,360 bytes — 44100Hz stereo — Use spectrogram analysis]'
                        },
                        'meeting_notes.txt': {
                            type: 'file',
                            content: 'Meridian Defense Systems\nQuarterly All-Hands Meeting Notes\nDate: December 10, 2024\n\nAgenda:\n1. Q4 Revenue Update — $4.2B projected\n2. Project Stardust milestone review\n3. New hire onboarding — 47 positions filled\n4. Holiday party planning — Dec 20\n5. IT security reminder — update passwords\n\nAction Items:\n- All hands: Complete security awareness training by Dec 15\n- Engineering: Submit Q4 deliverables by Dec 18\n- HR: Finalize bonus calculations\n\nNext meeting: January 8, 2025'
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
                        'hostname': { type: 'file', content: 'sift-workstation' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (steganography tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'steghide': function(args, term, engine) {
            if (args.length === 0) return 'Usage: steghide extract -sf <file> [-p <passphrase>]\n       steghide info <file>\nSteganography tool for JPEG/WAV/BMP/AU files.';
            const joined = args.join(' ');

            if (joined.includes('info') && joined.includes('logo_draft')) {
                return `"logo_draft.jpg":\n  format: jpeg\n  capacity: 12.4 KB\n  Try to get information about embedded data? (y/n) y\n  embedded data:\n    size: 142 bytes\n    encrypted: no\n    compressed: yes`;
            }
            if (joined.includes('extract') && joined.includes('logo_draft')) {
                return `wrote extracted data to "logo_draft_extracted.txt".\n\nContents:\n${Forensics04Config._stegoData.exifComment}\n\nNote: This is metadata — not a flag. The real hidden message is in the PNG using LSB encoding.`;
            }
            if (joined.includes('info') && joined.includes('corporate_photo')) {
                return `steghide: the file format of "corporate_photo.png" is not supported.\nNote: steghide supports JPEG, WAV, BMP, AU. For PNG files, use zsteg instead.`;
            }
            if (joined.includes('podcast')) {
                return `"podcast_ep42.wav":\n  format: wav\n  capacity: 1.2 MB\n  embedded data: unknown (try extraction with passphrase)\n\nNote: Standard steghide extraction found no embedded payload.\nThe hidden data may use spectrogram encoding instead of byte embedding.`;
            }
            return 'steghide: could not extract any data.';
        },

        'zsteg': function(args, term, engine) {
            if (args.length === 0) return 'Usage: zsteg [options] <PNG_file>\nDetect LSB steganography in PNG files.\n  -a    Try all known methods\n  -b    Specify bit(s)\n  -o    Specify order (row/column)';
            const joined = args.join(' ');

            if (joined.includes('corporate_photo')) {
                const msg = Forensics04Config._stegoData.lsbMessage;
                return `imagedata           .. text: "\\x00\\x00\\x00"\nb1,r,lsb,xy         .. text: "${msg.substring(0, 60)}..."\nb1,rgb,lsb,xy        .. text: [FULL EXTRACTION BELOW]\nb1,bgr,lsb,xy        .. text: "\\x00\\x00"\nb2,r,lsb,xy          .. text: "\\x00\\x00\\x00"\nb2,rgb,lsb,xy        .. text: "\\x00\\x00\\x00"\n\n=== Full extraction from b1,rgb,lsb,xy ===\n${msg}`;
            }
            if (joined.includes('quarterly_report')) {
                return `imagedata           .. text: "\\x00\\x00\\x00"\nb1,r,lsb,xy         .. text: "\\x00\\x00\\x00"\nb1,rgb,lsb,xy        .. text: "\\x00\\x00\\x00"\n\nNo hidden data detected in any bit plane.`;
            }
            if (joined.includes('.jpg') || joined.includes('.jpeg')) {
                return 'zsteg: JPEG files not supported. Use steghide for JPEG steganography.';
            }
            return 'zsteg: file not found or unsupported format.';
        },

        'stegsolve': function(args, term, engine) {
            if (args.length === 0) return 'Usage: stegsolve <image_file>\n       stegsolve audio <audio_file>\nVisual steganography analysis tool.';
            const joined = args.join(' ');

            if (joined.includes('audio') && joined.includes('podcast')) {
                return `StegSolve Audio Analyzer v1.2\nProcessing: podcast_ep42.wav\n\nWaveform analysis: Normal speech/music content\nFrequency analysis:\n  0-16kHz: Normal audio content\n  16-18kHz: Minimal content (expected rolloff)\n  18-20kHz: ANOMALOUS SIGNAL DETECTED\n\n[!] Hidden data detected in ultrasonic frequency band (18-20kHz)\n[!] Signal appears to be FSK-modulated binary data\n\nDecoding ultrasonic payload...\n\n${Forensics04Config._stegoData.spectrogramMessage}`;
            }
            if (joined.includes('corporate_photo')) {
                return `StegSolve Image Analyzer v1.2\nProcessing: corporate_photo.png\n\nColor Plane Analysis:\n  Red 0:   Noise pattern detected (possible LSB embedding)\n  Green 0: Noise pattern detected (possible LSB embedding)\n  Blue 0:  Noise pattern detected (possible LSB embedding)\n  Red 1-7: Normal image data\n\n[!] LSB steganography detected in RGB bit plane 0\n[!] Use zsteg for extraction: zsteg corporate_photo.png`;
            }
            return 'stegsolve: file not found.';
        },

        'binwalk': function(args, term, engine) {
            if (args.length === 0) return 'Usage: binwalk [options] <file>\nFirmware/file analysis tool.\n  -e    Extract embedded files\n  -B    Scan for common signatures';
            const file = args.find(a => !a.startsWith('-')) || '';
            const sd = Forensics04Config._stegoData;

            for (const [fname, results] of Object.entries(sd.binwalkResults)) {
                if (file.includes(fname.split('.')[0])) {
                    let output = `DECIMAL       HEXADECIMAL     DESCRIPTION\n------------------------------------------------------\n`;
                    results.forEach(r => {
                        output += `${String(r.offset).padEnd(14)}0x${r.offset.toString(16).padEnd(14).toUpperCase()}${r.description}\n`;
                    });
                    if (args.includes('-e')) {
                        output += `\nExtracted files saved to ${fname}.extracted/`;
                    }
                    return output;
                }
            }
            return `binwalk: ${file}: No results`;
        },

        'exiftool': function(args, term, engine) {
            if (args.length === 0) return 'Usage: exiftool <file>';
            const file = args[0] || '';

            if (file.includes('corporate_photo')) {
                return `ExifTool Version Number         : 12.70\nFile Name                       : corporate_photo.png\nFile Size                       : 2.8 MB\nFile Type                       : PNG\nMIME Type                       : image/png\nImage Width                     : 1920\nImage Height                    : 1080\nBit Depth                       : 8\nColor Type                      : RGB\nCompression                     : Deflate/Inflate\nFilter                          : Adaptive\nInterlace                       : Noninterlaced\nSoftware                        : Adobe Photoshop CC 2024\nCreate Date                     : 2024:12:08 14:22:17\nModify Date                     : 2024:12:12 09:45:33\nWarning                         : [minor] Trailer data after PNG IEND chunk\nImage Size                      : 1920x1080`;
            }
            if (file.includes('logo_draft')) {
                return `ExifTool Version Number         : 12.70\nFile Name                       : logo_draft.jpg\nFile Size                       : 456 KB\nFile Type                       : JPEG\nMIME Type                       : image/jpeg\nImage Width                     : 800\nImage Height                    : 600\nJFIF Version                    : 1.01\nResolution Unit                 : inches\nX Resolution                    : 72\nY Resolution                    : 72\nComment                         : ${Forensics04Config._stegoData.exifComment}\nCreate Date                     : 2024:12:05 11:30:22\nImage Size                      : 800x600`;
            }
            if (file.includes('podcast')) {
                return `ExifTool Version Number         : 12.70\nFile Name                       : podcast_ep42.wav\nFile Size                       : 8.8 MB\nFile Type                       : WAV\nMIME Type                       : audio/x-wav\nEncoding                        : Microsoft PCM\nNum Channels                    : 2\nSample Rate                     : 44100\nAvg Bytes Per Sec               : 176400\nBits Per Sample                 : 16\nDuration                        : 0:00:50\nWarning                         : File size larger than expected for duration`;
            }
            if (file.includes('quarterly_report')) {
                return `ExifTool Version Number         : 12.70\nFile Name                       : quarterly_report.png\nFile Size                       : 1.2 MB\nFile Type                       : PNG\nMIME Type                       : image/png\nImage Width                     : 1024\nImage Height                    : 768\nBit Depth                       : 8\nColor Type                      : RGB\nImage Size                      : 1024x768`;
            }
            return `exiftool: ${file}: No such file or directory`;
        },

        'strings': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strings [-n min-len] file';
            const file = args.find(a => !a.startsWith('-')) || '';

            if (file.includes('corporate_photo')) {
                return `IHDR\nIDAT\nsRGB\npHYs\ntEXt\nSoftware\nAdobe Photoshop CC 2024\nIEND\n[trailer data detected after IEND — possible steganographic payload]`;
            }
            if (file.includes('logo_draft')) {
                return `JFIF\nPhotographer: J. Smith\nSee R. Chen for Q4 data\nDraft v3\nExif\nAdobe`;
            }
            if (file.includes('podcast')) {
                return `RIFF\nWAVE\nfmt \ndata\n[binary audio data — use spectrogram tools for analysis]`;
            }
            if (file.includes('meeting_notes')) {
                return Forensics04Config.filesystem['/'].children.evidence.children['meeting_notes.txt'].content;
            }
            return `strings: '${file}': No such file`;
        },

        'xxd': function(args, term, engine) {
            if (args.length === 0) return 'Usage: xxd [-s seek] [-l len] file';
            const file = args.find(a => !a.startsWith('-') && !args[args.indexOf(a) - 1]?.match(/^-[sl]$/)) || args[args.length - 1];

            if (file && file.includes('corporate_photo')) {
                return `00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR\n00000010: 0000 0780 0000 0438 0802 0000 00c5 4a3b  .......8......J;\n00000020: 8d00 0000 0173 5247 4200 aece 1ce9 0000  .....sRGB.......\n00000030: 0004 6741 4d41 0000 b18f 0bfc 6105 0000  ..gAMA......a...\n00000040: 0009 7048 5973 0000 0e74 0000 0e74 01de  ..pHYs...t...t..`;
            }
            if (file && file.includes('podcast')) {
                return `00000000: 5249 4646 24a9 8600 5741 5645 666d 7420  RIFF$...WAVEfmt \n00000010: 1000 0000 0100 0200 44ac 0000 10b1 0200  ........D.......\n00000020: 0400 1000 6461 7461 00a9 8600 0000 0000  ....data........`;
            }
            return `xxd: ${file}: No such file or directory`;
        },

        'file': function(args, term, engine) {
            if (args.length === 0) return 'Usage: file <filename>';
            const f = args[0] || '';
            const sd = Forensics04Config._stegoData;
            const match = sd.files.find(fi => f.includes(fi.name.split('.')[0]));
            if (match) return `${f}: ${match.type}, ${match.size}`;
            return `${f}: data`;
        },

        'python3': function(args, term, engine) {
            if (args.length === 0) return 'Python 3.11.6\nUsage: python3 <script.py> [args]';
            const joined = args.join(' ');
            if (joined.includes('spectrogram') && joined.includes('podcast')) {
                return `Loading podcast_ep42.wav...\nSample rate: 44100 Hz\nChannels: 2 (using channel 0)\nDuration: 50.0 seconds\n\nGenerating spectrogram...\nSpectrogram saved to spectrogram_output.png\n\nChecking 18-20kHz band for hidden data...\n[!] ANOMALOUS SIGNAL DETECTED in 18000-20000 Hz band\n[!] FSK modulation pattern detected\n[!] Decoding binary payload...\n\n${Forensics04Config._stegoData.spectrogramMessage}`;
            }
            return 'python3: script execution completed.';
        },

        'grep': function(args, term, engine) {
            if (args.length === 0) return 'Usage: grep [options] PATTERN [FILE...]';
            return 'grep: No match';
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
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(20));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
