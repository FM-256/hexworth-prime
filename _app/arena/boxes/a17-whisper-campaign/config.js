/* ============================================================
   CTF ARENA — Box A17: The Whisper Campaign
   Steganography & Data Hiding | The Whispering Eye
   Config: steg analysis engine, multimedia artifacts, filesystem, flags, hints, lore
   ============================================================ */

const A17Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Whisper Campaign',
    subtitle: 'Steganography — The Whispering Eye',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Reconnaissance",
                            "tip": "Start by scanning the target with nmap to discover services and potential attack vectors.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the target",
                            "tip": "Investigate the services you found. Browse web apps, check service versions, read documentation.",
                            "trigger": {
                                    "event": "navigate",
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "phase": "RECON"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find the vulnerability",
                            "tip": "Look for misconfigurations, weak inputs, or known CVEs in the services you discovered.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    }
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Exploit the vulnerability to gain initial access and retrieve the user flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Use what you found to escalate privileges and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Expert',
    accent: '#9b59b6',
    storageKey: 'hexworth_ctf_a17',
    trackerKey: 'ctf_a17',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer steganographic analysis chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Identify suspicious media files distributed by The Whispering Eye. Triage the evidence directory — inspect file types, sizes, metadata, and anomalies that hint at concealed content.',
            requiredFlags: [],
            mitre: ['T1036', 'T1564', 'T1027.003'],
            unlocks: ['carrier-analysis'],
            locked: false
        },
        {
            id: 'carrier-analysis',
            name: 'Carrier Analysis',
            icon: '\uD83D\uDDBC\uFE0F',
            description: 'Examine the image and audio carriers for signs of steganographic embedding. Inspect bit-planes, statistical anomalies, EXIF metadata, and spectral fingerprints to confirm data is hidden inside.',
            requiredFlags: [],
            mitre: ['T1027.003', 'T1001.002', 'T1564.004'],
            unlocks: ['data-extraction'],
            locked: true
        },
        {
            id: 'data-extraction',
            name: 'Data Extraction',
            icon: '\uD83E\uDDF2',
            description: 'Deploy steganographic analysis tools to recover the hidden payload. Extract the LSB-encoded passphrase from the image and use it to unlock the steghide-embedded audio secret.',
            requiredFlags: ['user'],
            mitre: ['T1027.003', 'T1001.002', 'T1119'],
            unlocks: ['payload-analysis'],
            locked: true
        },
        {
            id: 'payload-analysis',
            name: 'Payload Analysis',
            icon: '\uD83D\uDCC4',
            description: 'Decode the extracted payload and follow the evidence chain to its end. Use the audio secret to unlock the encrypted archive and recover The Whispering Eye\'s final Whisper Code.',
            requiredFlags: ['root'],
            mitre: ['T1027', 'T1027.010', 'T1119'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.3', description: 'Explain the importance of security concepts in an enterprise environment — Data concealment techniques', skill: 'LSB Steganography Detection and Extraction via zsteg/stegsolve' },
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Covert channels', skill: 'Bit-Plane Analysis of PNG Carrier Images' },
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Digital forensics', skill: 'EXIF Metadata Forensics and Anomaly Detection' },
            { flagId: 'root', objective: '4.4', description: 'Summarize the importance of policies, processes, and procedures for incident response — Evidence acquisition', skill: 'Chained Steganographic Evidence Extraction (Image → Audio → Archive)' },
            { flagId: 'root', objective: '2.3', description: 'Explain the importance of security concepts in an enterprise environment — Data concealment techniques', skill: 'Spectrogram Steganography Analysis and Steghide Decryption' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Digital forensics', skill: 'Encrypted Archive Recovery via Evidence Chain' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
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
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: Analyze multimedia artifacts from The Whispering Eye\nEvidence directory: ~/evidence/\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}', points: 100 },
        { id: 'root', value: 'flag{wh1sp3r_c0d3_f1n4l_m4n1f3st}',   points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }   // 20 minutes (Expert level)
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "Start with the image. Use zsteg to check for LSB steganography in the PNG. The tool analyzes least-significant-bit channels for hidden data.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "The audio file has a hidden message in its spectrogram. Use Audacity's spectrogram view to visualize frequencies above 15kHz. The message points you back to the image.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "The user flag from the image is also the passphrase for steghide extraction from the audio file. Try: steghide extract -sf audio_nature.wav -p \"flag{...}\"",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "The extracted audio secret is the password for archive.zip. Unzip it with that password to get the Whisper Code — the root flag.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Whispering Eye is a decentralized propaganda collective that communicates exclusively through public-facing media. They distribute images, audio recordings, and documents that look completely ordinary — but intelligence analysts suspect each release contains hidden operational directives. Your mission: triage the latest media drop, recover the concealed payload chain, and extract the Whisper Code before Cycle 48 activates.',
        scenario: 'The Whispering Eye\'s founder studied signals intelligence during a prior career and applied those tradecraft principles to steganography. Every public release is a multi-layered dead drop: an image that carries the passphrase, an audio file that holds the archive key, and a password-locked archive containing the next cycle\'s operational manifest. The chain is designed so that removing any single artifact makes the others useless — a perfect evidence dependency trap for anyone trying to intercept their communications.',
        outro: 'The Whisper Campaign is silenced. Hidden in plain sight across images, audio, and documents, The Whispering Eye believed their steganographic channels were invisible. But bit-plane analysis, spectrogram inspection, and forensic extraction revealed every secret they thought the noise would conceal. The Whisper Code is yours — their entire operation, decoded.',
        ecer: {
            executive: 'The Founder — an OSINT/SIGINT-trained operative — designed the multi-layer steg chain with operational discipline, but underestimated modern forensic tooling (zsteg, steghide, spectral analysis)',
            culture: 'The collective prioritized tradecraft elegance over defense-in-depth; each carrier artifact relied on the obscurity of the overall chain rather than independent cryptographic protection',
            employee: 'Cell members published raw carrier files to a clearnet .onion mirror without stripping metadata; exiftool revealed authorship fingerprints ("WE_Archivist") and software signatures (Adobe Photoshop, Audacity)',
            regulatory: 'No operational security review process; decoys (cityscape.png, backup_audio.mp3) were added as an afterthought and lacked the statistical noise profiles needed to fool dedicated bit-plane analysis'
        }
    },

    // ═══════════════════════════════════════════════════════
    // STATE TRACKING
    // ═══════════════════════════════════════════════════════

    state: {
        lsbExtracted: false,
        audioAnalyzed: false,
        archivePassword: false,
        archiveDecrypted: false
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Whispering Eye (.onion propaganda site)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://whispering-eye.onion/',

        pages: {

            // ── Page 1: Main propaganda site ──────────────────────
            'http://whispering-eye.onion/': {
                title: 'The Whispering Eye — Truth Awaits',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid rgba(155,89,182,0.3);">
                        <div style="font-size:2.5rem; margin-bottom:8px;">&#128065;</div>
                        <h1 style="color:#9b59b6; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.08em;">The Whispering Eye</h1>
                        <div style="color:#888; font-size:0.78rem; font-style:italic;">"Truth speaks in frequencies only the awakened can hear"</div>
                    </div>

                    <div style="max-width:680px; margin:0 auto; font-size:0.82rem; color:#555; line-height:1.7;">

                        <div style="background:rgba(155,89,182,0.06); border:1px solid rgba(155,89,182,0.2); border-radius:6px; padding:16px 20px; margin-bottom:24px;">
                            <div style="color:#9b59b6; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; margin-bottom:8px;">&#9670; LATEST BROADCAST &mdash; CYCLE 47</div>
                            <p style="margin:0 0 8px; color:#555;">Brothers and sisters of the Eye &mdash; the new materials have been distributed through our public channels. The landscape speaks. The nature recording soothes. The historical text educates. All is as it appears... and more.</p>
                            <p style="margin:0; color:#777; font-size:0.75rem;">Remember: <em>The unawakened see only the surface. We see the layers beneath.</em></p>
                        </div>

                        <div style="color:#444; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #eef;">&#9670; PUBLIC MEDIA ARCHIVE</div>

                        <div style="display:grid; gap:16px; margin-bottom:28px;">
                            <div style="background:#f8f9fb; border:1px solid #e0e0e6; border-radius:6px; padding:14px 18px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                                    <span style="font-size:1.2rem;"><img src="/assets/images/icons/icon-picture.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                                    <div>
                                        <div style="font-weight:700; color:#2c3e50; font-size:0.82rem;">landscape.png</div>
                                        <div style="color:#999; font-size:0.7rem;">1920 &times; 1080 &mdash; 2.4 MB &mdash; "Morning Serenity"</div>
                                    </div>
                                </div>
                                <p style="margin:0; color:#666; font-size:0.78rem;">A breathtaking panoramic landscape. Perfect for desktop wallpapers and meditation backgrounds.</p>
                            </div>

                            <div style="background:#f8f9fb; border:1px solid #e0e0e6; border-radius:6px; padding:14px 18px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                                    <span style="font-size:1.2rem;">&#127925;</span>
                                    <div>
                                        <div style="font-weight:700; color:#2c3e50; font-size:0.82rem;">audio_nature.wav</div>
                                        <div style="color:#999; font-size:0.7rem;">3:42 &mdash; 44100 Hz Stereo &mdash; 38.2 MB</div>
                                    </div>
                                </div>
                                <p style="margin:0; color:#666; font-size:0.78rem;">Relaxing nature ambient sounds. Birds, flowing water, gentle wind. Ideal for focus and concentration.</p>
                            </div>

                            <div style="background:#f8f9fb; border:1px solid #e0e0e6; border-radius:6px; padding:14px 18px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                                    <span style="font-size:1.2rem;"><img src="/assets/images/icons/icon-document.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                                    <div>
                                        <div style="font-weight:700; color:#2c3e50; font-size:0.82rem;">historical_text.pdf</div>
                                        <div style="color:#999; font-size:0.7rem;">12 pages &mdash; 1.8 MB &mdash; "The Art of Silent Communication"</div>
                                    </div>
                                </div>
                                <p style="margin:0; color:#666; font-size:0.78rem;">A scholarly essay on the history of cryptographic communication from ancient Rome to modern intelligence agencies.</p>
                            </div>

                            <div style="background:#f8f9fb; border:1px solid #e0e0e6; border-radius:6px; padding:14px 18px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                                    <span style="font-size:1.2rem;"><img src="/assets/images/icons/icon-package.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                                    <div>
                                        <div style="font-weight:700; color:#2c3e50; font-size:0.82rem;">archive.zip</div>
                                        <div style="color:#999; font-size:0.7rem;">Encrypted &mdash; 4.7 KB &mdash; "Members Only"</div>
                                    </div>
                                </div>
                                <p style="margin:0; color:#666; font-size:0.78rem;">Restricted archive for verified members. Password required. <em>"Those who have listened will know the key."</em></p>
                            </div>
                        </div>

                        <div style="color:#444; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid #eef;">&#9670; PHILOSOPHY</div>

                        <div style="background:rgba(155,89,182,0.04); border-left:3px solid #9b59b6; padding:12px 16px; margin-bottom:20px; color:#666; font-size:0.78rem; line-height:1.7;">
                            <p style="margin:0 0 8px;">"In an age of surveillance, the wise do not shout &mdash; they whisper. The Whispering Eye embeds truth within the ordinary. A photograph carries more than color. A recording holds more than sound. A document contains more than words."</p>
                            <p style="margin:0; color:#999; font-size:0.72rem;">&mdash; The Founder, Cycle 1 Address</p>
                        </div>

                        <div style="text-align:center; padding:16px; color:#bbb; font-size:0.7rem; border-top:1px solid #eee;">
                            &#128065; The Whispering Eye &mdash; Cycle 47 &mdash; "See Beyond the Surface"
                        </div>
                    </div>
                `
            },

            // ── Page 2: About page ──────────────────────────────
            'http://whispering-eye.onion/about': {
                title: 'The Whispering Eye — About Us',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid rgba(155,89,182,0.3);">
                        <div style="font-size:2rem; margin-bottom:8px;">&#128065;</div>
                        <h1 style="color:#9b59b6; font-size:1.3rem; font-family:Georgia,serif; letter-spacing:0.06em;">About The Whispering Eye</h1>
                    </div>

                    <div style="max-width:620px; margin:0 auto; font-size:0.82rem; color:#555; line-height:1.8;">
                        <p>Founded in Cycle 1, The Whispering Eye is a collective of truth-seekers who believe that information must flow freely, even through hostile territory.</p>

                        <p>Our methods are rooted in the ancient art of <strong>steganography</strong> &mdash; the practice of concealing messages within ordinary-looking media. Where cryptography makes a message unreadable, steganography makes it <em>invisible</em>.</p>

                        <h3 style="color:#9b59b6; font-size:0.9rem; margin-top:20px;">Our Techniques</h3>
                        <ul style="color:#666; padding-left:20px;">
                            <li><strong>Visual Embedding:</strong> Messages woven into the least significant bits of images</li>
                            <li><strong>Acoustic Layering:</strong> Data encoded within audio frequencies beyond casual perception</li>
                            <li><strong>Textual Concealment:</strong> Hidden layers within documents that only the trained eye can detect</li>
                            <li><strong>Layered Security:</strong> Multi-stage extraction requiring chained discoveries</li>
                        </ul>

                        <p style="margin-top:16px; color:#999; font-size:0.75rem; font-style:italic;">"The best hiding place is one that nobody thinks to look."</p>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker Kali machine)
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
                                    content: '=== MISSION BRIEFING: THE WHISPER CAMPAIGN ===\nTarget: The Whispering Eye propaganda network\nObjective: Steganographic analysis & hidden data extraction\n\nIntel:\n  - The Whispering Eye distributes covert messages through\n    public multimedia files on their .onion site\n  - Four artifacts have been downloaded to ~/evidence/\n  - Intelligence suggests data is hidden using LSB steganography,\n    spectrogram embedding, and document concealment\n  - Clues are CHAINED — each discovery unlocks the next layer\n\nEvidence Files:\n  1. landscape.png   — High-res landscape photo (check LSB)\n  2. audio_nature.wav — Nature ambient recording (check spectrogram)\n  3. historical_text.pdf — Scholarly essay (check for hidden text)\n  4. archive.zip     — Password-protected archive (need key from chain)\n\nRecommended Analysis Order:\n  1. Run file/exiftool/strings on all evidence\n  2. Use zsteg on the PNG to check bit-plane channels\n  3. Open the audio in Audacity and examine the spectrogram\n  4. Extract hidden data from the audio using steghide\n  5. Use the extracted password to unlock archive.zip\n\nFlags:\n  user.txt — Hidden passphrase extracted from image steganography\n  root.txt — The Whisper Code from the final chained extraction\n\nTools available: file, exiftool, strings, zsteg, stegsolve,\n  steghide, binwalk, audacity, xxd, pdftotext, sha256sum,\n  foremost, unzip\n\nGood luck, analyst.'
                                },
                                'evidence': {
                                    type: 'dir',
                                    children: {
                                        'landscape.png': {
                                            type: 'file',
                                            content: '[PNG IMAGE DATA — 1920x1080 RGBA — "Morning Serenity"]\n[Binary content: 2,457,600 bytes]\n[LSB Channel: flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}]\n[Appended ZIP at offset 0x1C2000]\n[EXIF Comment: "Layer: embedded"]'
                                        },
                                        'audio_nature.wav': {
                                            type: 'file',
                                            content: '[WAV AUDIO DATA — 44100 Hz, Stereo, 16-bit]\n[Binary content: 38,210,048 bytes]\n[Spectrogram 15-20kHz: "CHECK THE IMAGE LSB"]\n[Steghide payload (passphrase-protected): hidden_message.txt]'
                                        },
                                        'historical_text.pdf': {
                                            type: 'file',
                                            content: '[PDF DOCUMENT — 12 pages, v1.7]\n[Binary content: 1,843,200 bytes]\n[Visible text: "The Art of Silent Communication" — scholarly essay]\n[Hidden white-on-white text on page 7: "The archive key is found where sound meets silence. Extract it with what the image reveals."]\n[Metadata Author: "WE_Archivist"]'
                                        },
                                        'archive.zip': {
                                            type: 'file',
                                            content: '[ZIP ARCHIVE — Encrypted, AES-256]\n[Binary content: 4,812 bytes]\n[Password: Wh1sp3r_3y3_2024]\n[Contents: whisper_code.txt]'
                                        },
                                        'cityscape.png': {
                                            type: 'file',
                                            content: '[PNG IMAGE DATA — 2560x1440 RGBA — "Downtown Dusk"]\n[Binary content: 4,194,304 bytes]\n[LSB Channel: CLEAN — no embedded data detected]\n[EXIF Comment: "Standard stock photo"]\n[Statistical analysis: normal LSB distribution — chi-square p=0.91]\n[zsteg result: no hidden data found]\n[NOTE: decoy file — included in public drop to increase noise]'
                                        },
                                        'backup_audio.mp3': {
                                            type: 'file',
                                            content: '[MP3 AUDIO DATA — 320kbps, Stereo, 44100 Hz]\n[Binary content: 22,118,400 bytes — 9:12 runtime]\n[Format: MPEG Layer III — steghide does not support MP3]\n[Spectrogram: clean — all energy below 20kHz, no anomalous patterns]\n[Metadata ID3v2: Artist=WE_Media, Title=Ambient Loop 03, Comment=Royalty-free]\n[NOTE: decoy file — format incompatible with steghide; spectrogram shows no embedded text]'
                                        },
                                        'notes_draft.txt': {
                                            type: 'file',
                                            content: 'Cycle 47 public release — QA notes\n\nFiles distributed:\n  - landscape.png   (approved)\n  - audio_nature.wav (approved)\n  - historical_text.pdf (approved)\n  - archive.zip     (approved — members only)\n  - cityscape.png   (filler — no payload)\n  - backup_audio.mp3 (filler — no payload)\n\nReminder: only landscape.png and audio_nature.wav carry active layers.\nDo not embed in MP3 files — format not supported by our toolchain.\narchive.zip password: see the chain.\n\n— WE_QA'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'steg_check.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Quick steganography check script\n# Usage: ./steg_check.sh <file>\n\nFILE="$1"\nif [ -z "$FILE" ]; then\n    echo "Usage: ./steg_check.sh <file>"\n    exit 1\nfi\n\necho "[*] Running basic steg checks on: $FILE"\necho ""\necho "[1] File type:"\nfile "$FILE"\necho ""\necho "[2] Strings output (filtered):"\nstrings "$FILE" | grep -iE "(flag|password|key|secret|hidden|embed)" | head -20\necho ""\necho "[3] Binwalk scan:"\nbinwalk "$FILE"\necho ""\necho "[*] Done. Use specialized tools for deeper analysis."'
                                        },
                                        'extract_lsb.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nextract_lsb.py — Manual LSB extraction from PNG\nUsage: python3 extract_lsb.py <image.png>\nNote: For quick analysis, use zsteg instead.\n"""\nimport sys\nfrom PIL import Image\n\ndef extract_lsb(path):\n    img = Image.open(path)\n    pixels = img.load()\n    bits = []\n    for y in range(img.height):\n        for x in range(img.width):\n            r, g, b = pixels[x, y][:3]\n            bits.extend([r & 1, g & 1, b & 1])\n    # Convert bits to bytes\n    chars = []\n    for i in range(0, len(bits) - 8, 8):\n        byte = 0\n        for bit in bits[i:i+8]:\n            byte = (byte << 1) | bit\n        if byte == 0:\n            break\n        chars.append(chr(byte))\n    return "".join(chars)\n\nif __name__ == "__main__":\n    path = sys.argv[1] if len(sys.argv) > 1 else "landscape.png"\n    print(f"[*] Extracting LSB from: {path}")\n    result = extract_lsb(path)\n    print(f"[+] Extracted: {result}")'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cd evidence\nls -la\nfile landscape.png\nfile audio_nature.wav\nfile historical_text.pdf\nfile archive.zip\nexiftool landscape.png\nstrings landscape.png | grep -i flag'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[Wordlist: 14,344,392 entries — use for archive password brute-force if needed]'
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'zsteg': { type: 'file', content: 'zsteg 0.2.13 — detect stegano-hidden data in PNG & BMP' },
                                'steghide': { type: 'file', content: 'steghide 0.5.1 — hide/extract data in JPEG, BMP, WAV, AU' },
                                'stegsolve': { type: 'file', content: 'StegSolve 1.3 — image steganography analysis (Java)' },
                                'binwalk': { type: 'file', content: 'binwalk 2.3.4 — firmware analysis / file carving tool' },
                                'foremost': { type: 'file', content: 'foremost 1.5.7 — file carving based on headers/footers' },
                                'exiftool': { type: 'file', content: 'exiftool 12.76 — read/write meta information in files' }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific steg analysis tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── file: identify file type ──────────────────────────────
        'file': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: file <filename>';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                return 'landscape.png: PNG image data, 1920 x 1080, 8-bit/color RGBA, non-interlaced';
            }
            if (lower.includes('audio') && lower.includes('wav')) {
                return 'audio_nature.wav: RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, stereo 44100 Hz';
            }
            if (lower.includes('historical') && lower.includes('pdf')) {
                return 'historical_text.pdf: PDF document, version 1.7, 12 pages';
            }
            if (lower.includes('archive') && lower.includes('zip')) {
                return 'archive.zip: Zip archive data, at least v2.0 to extract, compression method=AES Encrypted';
            }
            if (lower.includes('whisper_code')) {
                if (engine.state && engine.state.archiveDecrypted) {
                    return 'whisper_code.txt: ASCII text, with no line terminators';
                }
                return `file: cannot open '${target}' (No such file or directory)`;
            }
            if (lower.includes('hidden_message')) {
                if (engine.state && engine.state.archivePassword) {
                    return 'hidden_message.txt: ASCII text';
                }
                return `file: cannot open '${target}' (No such file or directory)`;
            }
            if (lower.includes('cityscape') && lower.includes('png')) {
                return 'cityscape.png: PNG image data, 2560 x 1440, 8-bit/color RGBA, non-interlaced';
            }
            if (lower.includes('backup_audio') && lower.includes('mp3')) {
                return 'backup_audio.mp3: Audio file with ID3 version 2.3.0, contains: MPEG ADTS, layer III, v1, 320 kbps, 44100 Hz, JntStereo';
            }
            if (lower.includes('notes_draft') && lower.includes('txt')) {
                return 'notes_draft.txt: ASCII text';
            }

            return `file: cannot open '${target}' (No such file or directory)`;
        },

        // ── exiftool: read metadata ──────────────────────────────
        'exiftool': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: exiftool <filename>';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                return `ExifTool Version Number         : 12.76
File Name                       : landscape.png
Directory                       : /home/kali/evidence
File Size                       : 2.4 MB
File Modification Date/Time     : 2024:10:15 08:23:41+00:00
File Access Date/Time           : 2024:11:20 14:02:17+00:00
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 1920
Image Height                    : 1080
Bit Depth                       : 8
Color Type                      : RGB with Alpha
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Comment                         : Layer: embedded
Software                        : Adobe Photoshop CC 2024
Warning                         : [minor] Trailer data after PNG IEND chunk`;
            }

            if (lower.includes('audio') && lower.includes('wav')) {
                return `ExifTool Version Number         : 12.76
File Name                       : audio_nature.wav
Directory                       : /home/kali/evidence
File Size                       : 38 MB
File Modification Date/Time     : 2024:10:18 11:45:22+00:00
File Type                       : WAV
File Type Extension             : wav
MIME Type                       : audio/x-wav
Encoding                        : Microsoft PCM
Num Channels                    : 2
Sample Rate                     : 44100
Avg Bytes Per Sec               : 176400
Bits Per Sample                 : 16
Duration                        : 0:03:42
Artist                          : Nature Collective
Title                           : Morning Forest Ambience
Comment                         : Field recording — unaltered
Software                        : Audacity 3.4.2`;
            }

            if (lower.includes('historical') && lower.includes('pdf')) {
                return `ExifTool Version Number         : 12.76
File Name                       : historical_text.pdf
Directory                       : /home/kali/evidence
File Size                       : 1.8 MB
File Modification Date/Time     : 2024:10:20 16:33:09+00:00
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.7
Linearized                      : No
Page Count                      : 12
Title                           : The Art of Silent Communication
Author                          : WE_Archivist
Subject                         : Historical Analysis
Creator                         : LibreOffice 7.6
Producer                        : LibreOffice 7.6
Create Date                     : 2024:10:20 16:30:00+00:00`;
            }

            if (lower.includes('archive') && lower.includes('zip')) {
                return `ExifTool Version Number         : 12.76
File Name                       : archive.zip
Directory                       : /home/kali/evidence
File Size                       : 4.7 kB
File Modification Date/Time     : 2024:10:22 09:11:54+00:00
File Type                       : ZIP
File Type Extension             : zip
MIME Type                       : application/zip
Zip Required Version            : 20
Zip Bit Flag                    : 0x0009
Zip Compression                 : Deflated
Zip Modify Date                 : 2024:10:22 09:11:00
Zip CRC                         : 0xa4c3b2d1
Zip Compressed Size             : 3841
Zip Uncompressed Size           : 4096
Zip File Name                   : whisper_code.txt
Warning                         : AES encrypted — password required`;
            }

            if (lower.includes('cityscape') && lower.includes('png')) {
                return `ExifTool Version Number         : 12.76
File Name                       : cityscape.png
Directory                       : /home/kali/evidence
File Size                       : 4.0 MB
File Modification Date/Time     : 2024:10:16 09:44:02+00:00
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 2560
Image Height                    : 1440
Bit Depth                       : 8
Color Type                      : RGB with Alpha
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Comment                         : Standard stock photo
Software                        : GIMP 2.10.36`;
            }

            if (lower.includes('backup_audio') && lower.includes('mp3')) {
                return `ExifTool Version Number         : 12.76
File Name                       : backup_audio.mp3
Directory                       : /home/kali/evidence
File Size                       : 21 MB
File Modification Date/Time     : 2024:10:17 13:22:48+00:00
File Type                       : MP3
File Type Extension             : mp3
MIME Type                       : audio/mpeg
MPEG Audio Version              : 1
Audio Layer                     : 3
Sample Rate                     : 44100
Channel Mode                    : Joint Stereo
Bit Rate                        : 320
Duration                        : 0:09:12
ID3 Version                     : 2.3.0
Artist                          : WE_Media
Title                           : Ambient Loop 03
Comment                         : Royalty-free`;
            }

            return `File not found: ${target}`;
        },

        // ── strings: extract printable strings ────────────────────
        'strings': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: strings <filename>';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                return `IHDR
sRGB
gAMA
pHYs
IDATx
tEXtComment
Layer: embedded
tEXtSoftware
Adobe Photoshop CC 2024
steghide passphrase: whisper2024
IEND
PK\x03\x04
whisper_fragment.dat
PK\x05\x06`;
            }

            if (lower.includes('audio') && lower.includes('wav')) {
                return `RIFF
WAVEfmt
data
LIST
INAM
Morning Forest Ambience
IART
Nature Collective
ISFT
Audacity 3.4.2
ICMT
Field recording -- unaltered`;
            }

            if (lower.includes('historical') && lower.includes('pdf')) {
                return `%PDF-1.7
/Type /Catalog
/Pages
/Title (The Art of Silent Communication)
/Author (WE_Archivist)
/Creator (LibreOffice 7.6)
/Producer (LibreOffice 7.6)
The history of hidden communication
stretches back to ancient Greece
Histiaeus shaved a slave's head
tattooed a message, waited for hair
to regrow, and sent the slave
invisible ink, microdots, null ciphers
The archive key is found where sound meets silence.
Extract it with what the image reveals.
modern steganography leverages
digital media as carriers
/Font /F1 /Type1
/BaseFont /Helvetica
stream
endstream
endobj
%%EOF`;
            }

            if (lower.includes('archive') && lower.includes('zip')) {
                return `PK\x03\x04
whisper_code.txt
PK\x01\x02
PK\x05\x06`;
            }

            return `strings: '${target}': No such file`;
        },

        // ── zsteg: PNG/BMP steganography detector ─────────────────
        'zsteg': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) {
                return `Usage: zsteg [options] <file.png>

Options:
    -a, --all          Try all known methods
    -b, --bits N       Number of bits (1-8)
    -o, --order ORDER  Bit order (lsb/msb)
    -E, --extract NAME Extract payload

Examples:
    zsteg image.png
    zsteg -a image.png
    zsteg -E "b1,rgb,lsb,xy" image.png`;
            }

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                // Set state: LSB extracted
                if (engine.state) engine.state.lsbExtracted = true;

                const extractMode = args.includes('-E') || args.includes('--extract');
                if (extractMode) {
                    return 'flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}';
                }

                return `imagedata           .. text: "flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}"
b1,rgb,lsb,xy       .. text: "flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}"
b1,r,lsb,xy         .. text: "flag{wh1"
b1,g,lsb,xy         .. text: "sp3r_lsb"
b1,b,lsb,xy         .. text: "_h1dd3n_"
b1,a,lsb,xy         .. text: "p4ssphr4"
b2,rgb,lsb,xy       .. file: data
b2,r,lsb,xy         .. file: data
b3,rgb,lsb,xy       .. file: data
b4,rgb,lsb,xy       .. file: data

[*] Found hidden text in LSB channel (b1,rgb,lsb,xy)
[*] Confidence: HIGH — clear ASCII text detected in bit-plane 1`;
            }

            if (lower.includes('cityscape') && lower.includes('png')) {
                return `b1,rgb,lsb,xy       .. text: "\\x00\\x00\\x00\\x00"
b1,r,lsb,xy         .. file: data
b1,g,lsb,xy         .. file: data
b1,b,lsb,xy         .. file: data
b2,rgb,lsb,xy       .. file: data
b3,rgb,lsb,xy       .. file: data

[*] No readable ASCII text found in any bit-plane
[*] LSB distribution: p=0.91 (normal — no steganography detected)`;
            }

            if (lower.includes('wav') || lower.includes('mp3') || lower.includes('pdf') || lower.includes('zip')) {
                return `zsteg: unsupported file format. zsteg only supports PNG and BMP files.
Try: steghide (for WAV/JPEG) or binwalk (for embedded files)`;
            }

            return `zsteg: cannot open '${target}' — No such file`;
        },

        // ── stegsolve: image steganography analysis ───────────────
        'stegsolve': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: stegsolve <image>';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                if (engine.state) engine.state.lsbExtracted = true;

                return `Launching StegSolve v1.3...
Loading image: landscape.png (1920 x 1080, RGBA)

[Analysis Mode: Bit Plane]
  Red plane 0 (LSB):   *** DATA DETECTED ***
  Green plane 0 (LSB): *** DATA DETECTED ***
  Blue plane 0 (LSB):  *** DATA DETECTED ***
  Alpha plane 0:       Clean

[Analysis Mode: Extract]
  Channel: RGB LSB (xy order)
  Extracted text: "flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}"

[Analysis Mode: File Format]
  Trailing data detected after IEND chunk
  Offset: 0x1C2000 — possible embedded archive

[Summary]
  LSB steganography confirmed in RGB channels
  Hidden text: flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}
  Recommendation: Use binwalk to extract trailing data`;
            }

            return `stegsolve: cannot open '${target}' — unsupported format or file not found`;
        },

        // ── steghide: hide/extract data in media files ────────────
        'steghide': function(args, term, engine) {
            if (args.length === 0) {
                return `steghide 0.5.1 — a steganography program

Usage: steghide <command> [options]

Commands:
  embed     Embed data in a cover file
  extract   Extract data from a stego file
  info      Display info about a stego file

Options:
  -sf FILE  Stego file (input)
  -xf FILE  Write extracted data to FILE
  -p PASS   Use PASS as passphrase
  -f        Force overwrite

Examples:
  steghide extract -sf audio.wav
  steghide extract -sf audio.wav -p "passphrase"
  steghide info -sf image.jpg`;
            }

            const cmd = args[0];
            const sfIdx = args.indexOf('-sf');
            const stegFile = sfIdx >= 0 && args[sfIdx + 1] ? args[sfIdx + 1] : '';
            const pIdx = args.indexOf('-p');
            const passphrase = pIdx >= 0 && args[pIdx + 1] ? args[pIdx + 1].replace(/^["']|["']$/g, '') : null;
            const lower = stegFile.toLowerCase();

            if (cmd === 'info') {
                if (lower.includes('audio') && lower.includes('wav')) {
                    return `"audio_nature.wav":
  format: wave audio, PCM encoding
  capacity: 2.1 KB
  embedded data: yes (passphrase protected)
Try to get information about embedded data ? (y/n) y
  embedded file "hidden_message.txt":
    size: 89 bytes
    encrypted: rijndael-128, cbc
    compressed: yes`;
                }
                if (lower.includes('landscape') && lower.includes('png')) {
                    return `steghide: the file format of "landscape.png" is not supported.
Note: steghide supports JPEG, BMP, WAV, AU formats.
For PNG steganography, use zsteg or stegsolve instead.`;
                }
                return `steghide: could not open "${stegFile}" — file not found or unsupported format`;
            }

            if (cmd === 'extract') {
                if (lower.includes('audio') && lower.includes('wav')) {
                    // No passphrase — prompt for it
                    if (!passphrase) {
                        return `Enter passphrase:
steghide: could not extract any data with that passphrase!

[hint] This file requires a passphrase. Use -p "passphrase" to provide it.
       The passphrase may be found in another evidence artifact.`;
                    }

                    // Correct passphrase: the user flag
                    if (passphrase === 'flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}') {
                        if (engine.state) engine.state.archivePassword = true;

                        return `wrote extracted data to "hidden_message.txt".

[*] Extraction successful!
[*] Contents of hidden_message.txt:

---
WHISPER DIRECTIVE — EYES ONLY
Archive password: Wh1sp3r_3y3_2024
Use it to unlock the final manifest.
— The Founder
---`;
                    }

                    // Wrong passphrase
                    return `steghide: could not extract any data with that passphrase!

[hint] The passphrase is incorrect. Look for it in other evidence files.
       The image may hold the key.`;
                }

                if (lower.includes('landscape') && lower.includes('png')) {
                    return `steghide: the file format of "landscape.png" is not supported.
Note: steghide supports JPEG, BMP, WAV, AU formats.
For PNG steganography, use zsteg or stegsolve instead.`;
                }

                if (lower.includes('backup_audio') && lower.includes('mp3')) {
                    return `steghide: the file format of "backup_audio.mp3" is not supported.
Note: steghide supports JPEG, BMP, WAV, AU formats. MP3 is not supported.
Use the correct WAV file: audio_nature.wav`;
                }

                return `steghide: could not open "${stegFile}" — file not found or unsupported format`;
            }

            if (cmd === 'info') {
                if (lower.includes('backup_audio') && lower.includes('mp3')) {
                    return `steghide: the file format of "backup_audio.mp3" is not supported.
Note: steghide supports JPEG, BMP, WAV, AU formats.`;
                }
            }

            return `steghide: unknown command "${cmd}". Use: embed, extract, or info`;
        },

        // ── binwalk: firmware analysis / file carving ─────────────
        'binwalk': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            const extract = args.includes('-e') || args.includes('--extract');

            if (!target) return 'Usage: binwalk [options] <file>\n  -e  Extract identified files';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                if (extract) {
                    return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 1920 x 1080, 8-bit/color RGBA, non-interlaced
1843200       0x1C2000        Zip archive data, encrypted, at least v2.0 to extract, name: whisper_fragment.dat

Extracted to: _landscape.png.extracted/
  _landscape.png.extracted/1C2000.zip — WARNING: encrypted ZIP, password required

[*] Embedded ZIP archive found and extracted (still encrypted)
[*] The embedded archive is a fragment — the main archive.zip may be more useful`;
                }

                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 1920 x 1080, 8-bit/color RGBA, non-interlaced
1843200       0x1C2000        Zip archive data, encrypted, at least v2.0 to extract, compressed size: 1847, uncompressed size: 2048, name: whisper_fragment.dat
1845047       0x1C2837        End of Zip archive, footer length: 22

[*] Trailing data detected after PNG IEND chunk
[*] Embedded ZIP archive at offset 0x1C2000`;
            }

            if (lower.includes('audio') && lower.includes('wav')) {
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, stereo 44100 Hz

[*] No embedded files detected — data may be hidden using steghide or spectrogram encoding`;
            }

            if (lower.includes('historical') && lower.includes('pdf')) {
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PDF document, version 1.7
1247          0x4DF           Zlib compressed data, default compression
84221         0x148FD         Zlib compressed data, default compression
168844        0x2938C         JPEG image data, JFIF standard 1.01 (embedded figure)

[*] Standard PDF structure — no anomalous embedded files
[*] For hidden text, use pdftotext or a PDF reader`;
            }

            if (lower.includes('archive') && lower.includes('zip')) {
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Zip archive data, encrypted, at least v2.0 to extract, compressed size: 3841, uncompressed size: 4096, name: whisper_code.txt

[*] Single encrypted entry: whisper_code.txt
[*] Password required to extract`;
            }

            if (lower.includes('cityscape') && lower.includes('png')) {
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 2560 x 1440, 8-bit/color RGBA, non-interlaced

[*] Standard PNG structure — no trailing data after IEND chunk
[*] No embedded files detected`;
            }

            if (lower.includes('backup_audio') && lower.includes('mp3')) {
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             MPEG ADTS, layer III, v1, 320 kbps, 44100 Hz, JntStereo
5242880       0x500000        MPEG ADTS, layer III, v1, 320 kbps, 44100 Hz, JntStereo

[*] Standard MP3 frame structure — no embedded files detected
[*] Note: steghide does not support MP3 — this file cannot carry steghide payloads`;
            }

            return `binwalk: cannot open '${target}' — No such file or directory`;
        },

        // ── audacity: spectrogram analysis ────────────────────────
        'audacity': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: audacity <audio_file>';

            const lower = target.toLowerCase();

            if (lower.includes('audio') && lower.includes('wav')) {
                if (engine.state) engine.state.audioAnalyzed = true;

                return `Audacity 3.4.2 — Loading: audio_nature.wav
  Format: WAV, 44100 Hz, Stereo, 16-bit PCM
  Duration: 3 minutes 42 seconds
  Channels: 2 (Left + Right)

[Waveform View]
  Normal audio content: nature sounds (birds, water, wind)
  No visible anomalies in waveform

[Spectrogram View — switching to spectral analysis]
  Frequency range: 0 Hz — 22050 Hz
  Color map: Grayscale (intensity)

  0-15000 Hz:    Normal audio spectrum — nature sounds
  15000-20000 Hz: *** ANOMALY DETECTED ***

  ┌─────────────────────────────────────────────────┐
  │  20kHz ┊                                        │
  │        ┊  ████ █ █ ████ █ █                     │
  │        ┊  █    █ █ █    █ █                      │
  │        ┊  █    ███ ██   ███                      │
  │        ┊  █    █ █ █    █ █                      │
  │        ┊  ████ █ █ ████ █ █                     │
  │        ┊                                        │
  │        ┊  ███ █ █ ████                           │
  │        ┊    █ █ █ █                              │
  │        ┊    █ ███ ██                             │
  │        ┊    █ █ █ █                              │
  │        ┊    █ █ █ ████                           │
  │        ┊                                        │
  │        ┊  ████ █   █ █ ████ ████                │
  │        ┊    █  ██ ██ █ █    █                    │
  │        ┊    █  █ █ █ ████ ██                     │
  │        ┊    █  █   █ █ █  █                      │
  │        ┊  ████ █   █ █ █  ████                  │
  │        ┊                                        │
  │        ┊  █    ████ ████                         │
  │        ┊  █    █    █  █                         │
  │        ┊  █    ████ ████                         │
  │        ┊  █       █ █  █                         │
  │        ┊  ████ ████ ████                         │
  │  15kHz ┊                                        │
  └─────────────────────────────────────────────────┘

  Decoded spectrogram message: "CHECK THE IMAGE LSB"

[*] Hidden message embedded in spectrogram at 15-20 kHz
[*] This text was painted into the high-frequency band
[*] The message instructs: analyze the image using LSB techniques

[steghide info]
  This file also contains steghide-embedded data (passphrase protected)
  Use: steghide extract -sf audio_nature.wav -p "<passphrase>"`;
            }

            return `audacity: cannot open '${target}' — file not found or unsupported format`;
        },

        // ── pdftotext: extract text from PDF ──────────────────────
        'pdftotext': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: pdftotext <file.pdf> [output.txt | -]';

            const lower = target.toLowerCase();

            if (lower.includes('historical') && lower.includes('pdf')) {
                return `The Art of Silent Communication
A Historical Analysis of Covert Messaging

Chapter 1: Ancient Origins
The history of hidden communication stretches back to ancient Greece. According to
Herodotus, the tyrant Histiaeus shaved a slave's head, tattooed a secret message on
his scalp, waited for the hair to regrow, and then sent the slave to deliver the message.
The recipient simply shaved the slave's head again to read the directive.

Chapter 2: Invisible Inks and Physical Steganography
During the American Revolution, both sides employed invisible inks. The Culper Ring,
George Washington's spy network, used a mixture of ferrous sulfate and water. The text
became visible only when treated with sodium hydroxide solution.

Chapter 3: The Birth of Digital Steganography
With the advent of digital media, steganography evolved dramatically. The least
significant bit (LSB) of each pixel in a digital image can be altered without visible
change to the image. A 1920x1080 image contains over 6 million pixels — enough to
hide substantial payloads in the noise floor.

Chapter 4: Audio Steganography
Sound files offer unique concealment opportunities. Data can be encoded in frequency
ranges above human perception (>15kHz) or embedded using tools that distribute
information across the audio spectrum.

Chapter 5: Modern Counter-Steganography
The detection of steganographic content requires statistical analysis of the carrier
medium. Tools like zsteg (for PNG), steghide (for audio/JPEG), and spectral analyzers
can reveal hidden data that the naked eye or ear cannot perceive.

[Hidden text detected — white on white, page 7:]
The archive key is found where sound meets silence.
Extract it with what the image reveals.

[Metadata]
Author: WE_Archivist
Created: 2024-10-20
Pages: 12`;
            }

            return `pdftotext: cannot open '${target}' — No such file or directory`;
        },

        // ── xxd: hex dump ─────────────────────────────────────────
        'xxd': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            const isTail = args.includes('|') ? false : true;  // simplified check

            if (!target) return 'Usage: xxd <filename>';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                if (args.includes('tail') || args.includes('|')) {
                    return `001c1fe0: 0000 0000 0049 454e 44ae 4260 8250 4b03  .....IEND.B\`.PK.
001c1ff0: 0414 0000 0800 0800 0000 0000 5768 6973  ............Whis
001c2000: 7065 725f 6672 6167 6d65 6e74 2e64 6174  per_fragment.dat
001c2010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
001c2020: 4145 532d 3235 362d 454e 4352 5950 5445  AES-256-ENCRYPTE
001c2030: 4400 0000 504b 0506 0000 0000 0100 0100  D...PK..........

[*] IEND chunk at offset 0x001c1fe0 — normal PNG end marker
[*] Data continues after IEND — ZIP archive signature (PK) at 0x001c1ff0
[*] Embedded file: "whisper_fragment.dat" (AES-256 encrypted)`;
                }

                return `00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR
00000010: 0000 0780 0000 0438 0806 0000 0012 34a2  .......8......4.
00000020: 0000 0001 7352 4742 0000 aece 1ce9 0000  ....sRGB........
00000030: 0004 6741 4d41 0000 b18f 0bfc 6105 0000  ..gAMA......a...
00000040: 0009 7048 5973 0000 0ec4 0000 0ec4 0195  ..pHYs..........
...
[*] PNG header — use "xxd landscape.png | tail" to see appended data`;
            }

            if (lower.includes('archive') && lower.includes('zip')) {
                return `00000000: 504b 0304 1400 0900 0800 0000 0000 a4c3  PK..............
00000010: b2d1 010f 0000 0010 0000 1000 0000 7768  ..............wh
00000020: 6973 7065 725f 636f 6465 2e74 7874 0199  isper_code.txt..
00000030: 0700 0200 4145 0300 0000 0000 0000 0000  ....AE..........

[*] ZIP archive with AES encryption
[*] Single entry: whisper_code.txt`;
            }

            return `xxd: cannot open '${target}' — No such file or directory`;
        },

        // ── sha256sum: file hashes ────────────────────────────────
        'sha256sum': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: sha256sum <file>';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                return 'e7a3b1c4d5f6a8902b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5  landscape.png';
            }
            if (lower.includes('audio') && lower.includes('wav')) {
                return '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2  audio_nature.wav';
            }
            if (lower.includes('historical') && lower.includes('pdf')) {
                return '9f8e7d6c5b4a3928170615a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4  historical_text.pdf';
            }
            if (lower.includes('archive') && lower.includes('zip')) {
                return 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4  archive.zip';
            }

            return `sha256sum: ${target}: No such file or directory`;
        },

        // ── foremost: file carving ────────────────────────────────
        'foremost': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: foremost [-o output_dir] <file>';

            const lower = target.toLowerCase();

            if (lower.includes('landscape') && lower.includes('png')) {
                return `Foremost version 1.5.7 by Jesse Kornblum, Kris Kendall, and Nick Mikus
Audit File

Foremost started at Mon Nov 20 14:30:00 2024
Invocation: foremost landscape.png
Output directory: /home/kali/output

------------------------------------------------------------------
File: landscape.png
Start: Mon Nov 20 14:30:00 2024
Length: 2 MB (2459447 bytes)

Num      Name (bs=512)     Size     File Offset    Comment
0:       00000000.png      1.8 MB   0              (1920 x 1080)
1:       00003600.zip      4.7 KB   1843200        (encrypted)
------------------------------------------------------------------

Foremost finished at Mon Nov 20 14:30:01 2024
2 FILES EXTRACTED

[*] Carved 1 PNG image and 1 ZIP archive
[*] The ZIP is encrypted — a password is required`;
            }

            return `foremost: cannot open '${target}' — No such file or directory`;
        },

        // ── unzip: extract ZIP archives ───────────────────────────
        'unzip': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            const pIdx = args.indexOf('-P');
            const password = pIdx >= 0 && args[pIdx + 1] ? args[pIdx + 1].replace(/^["']|["']$/g, '') : null;

            if (!target) return 'Usage: unzip [-P password] <file.zip>';

            const lower = target.toLowerCase();

            if (lower.includes('archive') && lower.includes('zip')) {
                if (!password) {
                    return `Archive:  archive.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
     4096  2024-10-22 09:11   whisper_code.txt
---------                     -------
     4096                     1 file

[archive.zip] whisper_code.txt password:
   skipping: whisper_code.txt        unsupported compression method 99 (need password)

[hint] This archive is AES-encrypted. Use: unzip -P "password" archive.zip`;
                }

                if (password === 'Wh1sp3r_3y3_2024') {
                    if (engine.state) engine.state.archiveDecrypted = true;

                    return `Archive:  archive.zip
  inflating: whisper_code.txt

[*] Extraction successful!
[*] Contents of whisper_code.txt:

========================================
  THE WHISPER CODE — FINAL MANIFEST
  Classification: EYES ONLY
  Cycle: 47 | Author: The Founder
========================================

  flag{wh1sp3r_c0d3_f1n4l_m4n1f3st}

  Operation Status: ACTIVE
  Cells: 14 embedded worldwide
  Next broadcast: Cycle 48
  Distribution: Standard channels

  "We speak in whispers, but our
   message echoes through the data."

  — The Whispering Eye
========================================`;
                }

                return `Archive:  archive.zip
   skipping: whisper_code.txt        incorrect password

[*] Wrong password. The password is hidden within the evidence chain.`;
            }

            return `unzip: cannot find or open ${target}`;
        },

        // ── nmap: network scanning ────────────────────────────────
        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target) {
                return `Nmap 7.94 ( https://nmap.org )
Usage: nmap [Scan Type(s)] [Options] {target specification}`;
            }

            if (target.includes('whispering-eye') || target.includes('.onion')) {
                return `Starting Nmap 7.94 ( https://nmap.org )

Note: .onion addresses are Tor hidden services and cannot be scanned
directly with nmap. Use torify or proxychains.

The site is accessible via the Tor browser at:
  http://whispering-eye.onion/

Nmap done: 0 IP addresses (0 hosts up) scanned in 0.01 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds`;
        },

        // ── identify: ImageMagick identify ────────────────────────
        'identify': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: identify <image>';

            const lower = target.toLowerCase();
            const verbose = args.includes('-verbose') || args.includes('-v');

            if (lower.includes('landscape') && lower.includes('png')) {
                if (verbose) {
                    return `Image: landscape.png
  Format: PNG (Portable Network Graphics)
  Mime type: image/png
  Class: DirectClass
  Geometry: 1920x1080+0+0
  Resolution: 72x72
  Print size: 26.6667x15
  Units: PixelsPerInch
  Colorspace: sRGB
  Type: TrueColorAlpha
  Depth: 8-bit
  Channel depth:
    Red: 8-bit
    Green: 8-bit
    Blue: 8-bit
    Alpha: 8-bit
  Channel statistics:
    Pixels: 2073600
    Red:   min: 12 max: 255 mean: 142.3
    Green: min: 18 max: 248 mean: 138.7
    Blue:  min: 8  max: 241 mean: 119.2
  Properties:
    comment: Layer: embedded
    software: Adobe Photoshop CC 2024
  Filesize: 2.4MB
  Number pixels: 2.074M

  [*] Note: LSB statistics show non-random distribution in bit-plane 0
  [*] This is a strong indicator of LSB steganography`;
                }
                return 'landscape.png PNG 1920x1080 1920x1080+0+0 8-bit sRGB 2.4MB 0.010u 0:00.010';
            }

            return `identify: unable to open image '${target}': No such file or directory`;
        },

        // ── python3: run analysis scripts ─────────────────────────
        'python3': function(args, term, engine) {
            const script = args.find(a => a.endsWith('.py')) || '';

            if (script.includes('extract_lsb')) {
                const target = args.find(a => a.includes('.png')) || 'landscape.png';
                if (engine.state) engine.state.lsbExtracted = true;
                return `[*] Extracting LSB from: ${target}
[*] Image size: 1920 x 1080 (2,073,600 pixels)
[*] Extracting RGB LSB bits...
[*] Total bits: 6,220,800
[*] Converting to bytes...
[+] Extracted: flag{wh1sp3r_lsb_h1dd3n_p4ssphr4s3}`;
            }

            if (script.includes('steg_check')) {
                return `[*] Running basic steg checks on all evidence files...
See: ./tools/steg_check.sh for the shell version
Use: python3 tools/extract_lsb.py <image.png> for LSB extraction`;
            }

            if (!script) {
                return `Python 3.11.6 (default, Oct  8 2024, 05:18:41)
Type "help", "copyright", "credits" or "license" for more information.
>>> (use Ctrl+D to exit)`;
            }

            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        },

        // ── wavsteg: WAV steganography tool ───────────────────────
        'wavsteg': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: wavsteg -r -i <audio.wav> -o <output.txt> -n <num_lsb_bits>';

            const lower = target.toLowerCase();

            if (lower.includes('audio') && lower.includes('wav')) {
                return `wavsteg: analyzing audio_nature.wav
  Sample rate: 44100 Hz
  Channels: 2
  Bits per sample: 16
  Duration: 3:42

  LSB extraction (1 bit):
    No readable ASCII data found in LSB channel

  [*] This file uses steghide embedding, not LSB.
  [*] Try: steghide extract -sf audio_nature.wav -p "<passphrase>"
  [*] Also check the spectrogram for visual messages (audacity)`;
            }

            return `wavsteg: cannot open '${target}' — No such file or directory`;
        },

        // ── sonic-visualiser: advanced audio analysis ─────────────
        'sonic-visualiser': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: sonic-visualiser <audio_file>';

            const lower = target.toLowerCase();

            if (lower.includes('audio') && lower.includes('wav')) {
                if (engine.state) engine.state.audioAnalyzed = true;

                return `Sonic Visualiser 4.5.1
Loading: audio_nature.wav (44100 Hz, Stereo, 16-bit, 3:42)

[Spectrogram Layer — Window: 4096, Overlap: 75%]
  Frequency Range: 0 — 22050 Hz
  Color Scale: dBFS

  Analysis Results:
  ─────────────────
  0-14999 Hz:     Normal audio content (nature ambience)
  15000-20000 Hz: *** EMBEDDED TEXT PATTERN ***
    Timestamp: 0:15 — 0:45 (30 second block)
    Pattern: Block pixel text in high frequency band
    Decoded message: "CHECK THE IMAGE LSB"

  15000-20000 Hz: Unusual energy concentration
  Signal-to-noise ratio in this band: abnormally high
  Pattern periodicity: consistent with intentional embedding

[*] Spectrogram steganography detected
[*] Message painted in 15-20kHz band: "CHECK THE IMAGE LSB"`;
            }

            return `sonic-visualiser: cannot open '${target}'`;
        },

        // ── pdfinfo: PDF metadata ─────────────────────────────────
        'pdfinfo': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: pdfinfo <file.pdf>';

            const lower = target.toLowerCase();

            if (lower.includes('historical') && lower.includes('pdf')) {
                return `Title:          The Art of Silent Communication
Subject:        Historical Analysis
Keywords:
Author:         WE_Archivist
Creator:        LibreOffice 7.6
Producer:       LibreOffice 7.6
CreationDate:   Sun Oct 20 16:30:00 2024
ModDate:        Sun Oct 20 16:33:09 2024
Custom Metadata: no
Metadata Stream: no
Tagged:         no
UserProperties: no
Suspects:       no
Form:           none
JavaScript:     no
Pages:          12
Encrypted:      no
Page size:      612 x 792 pts (letter)
Page rot:       0
File size:      1843200 bytes
Optimized:      no
PDF version:    1.7`;
            }

            return `pdfinfo: cannot open '${target}'`;
        },

        // ── zip2john / john: password cracking ────────────────────
        'zip2john': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: zip2john <archive.zip> > hash.txt';

            const lower = target.toLowerCase();

            if (lower.includes('archive') && lower.includes('zip')) {
                return `archive.zip/whisper_code.txt:$zip2$*0*3*0*a4c3b2d1*0*28*0*4096*e7f8*$/zip2$:whisper_code.txt:archive.zip

[*] Hash extracted — save to hash.txt and crack with john or hashcat
[*] But consider: the password may be hidden in the other evidence files
[*] Brute-force is the hard way — the evidence chain is the intended path`;
            }

            return `zip2john: cannot open '${target}'`;
        },

        'john': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: john [options] <hash_file>';

            return `Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Press 'q' or Ctrl-C to abort, any other key for status

[*] Running dictionary attack...
[*] Trying rockyou.txt (14,344,392 entries)...
[*] Progress: 2,100,000 / 14,344,392 (14.64%)

[hint] This could take a while. The password might be obtainable
       through the evidence chain instead of brute-force.
       Check: steghide extract from the audio file.`;
        },

        // ── hashcat: GPU-accelerated cracking ─────────────────────
        'hashcat': function(args, term, engine) {
            return `hashcat (v6.2.6) starting...

[*] Device #1: No CUDA/OpenCL devices found

[hint] No GPU available in this environment.
       The archive password is hidden in the evidence chain.
       Try extracting data from the audio file with steghide.`;
        },

        // ── curl: download files ──────────────────────────────────
        'curl': function(args, term, engine) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('whispering-eye.onion')) {
                return `curl: (6) Could not resolve host: whispering-eye.onion
[hint] .onion sites require Tor. Use the browser instead, which has a simulated Tor connection.`;
            }

            return `curl: (7) Failed to connect: Connection refused`;
        },

        // ── ping ──────────────────────────────────────────────────
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            return `ping: ${target}: Name or service not known`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        if (typeof str !== 'string') return String(str);
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
