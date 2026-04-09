/* ═══════════════════════════════════════════════════════════════════
   OW-03: Operation Glass House — Shared Configuration
   Smart Building Side-Channel Espionage | BioGenesis Labs
   ═══════════════════════════════════════════════════════════════════ */

const GlassHouseConfig = {
    id: 'ow-03-glass-house',
    title: 'OPERATION GLASS HOUSE',
    storageKey: 'hexworth_ow03',
    registryId: 'ow-03-glass-house',
    startScore: 1000,
    clockStart: 8,
    clockRatio: 60,
    accentColor: '#10b981',
    minConnectionsToSubmit: 5,

    devices: ['bms', 'network', 'workstation-a', 'workstation-b', 'cameras'],

    pages: [
        { id: 'hub',           label: 'Hub',           href: 'index.html' },
        { id: 'bms',           label: 'BMS',           href: 'bms.html' },
        { id: 'network',       label: 'Network TAP',   href: 'network.html' },
        { id: 'workstation-a', label: 'Lab Director',  href: 'workstation-a.html' },
        { id: 'workstation-b', label: 'Facilities',    href: 'workstation-b.html' },
        { id: 'cameras',       label: 'Cameras',       href: 'cameras.html' },
        { id: 'caseboard',     label: 'CaseBoard',     href: 'caseboard.html' }
    ],

    evidence: {
        // BMS
        'bms-zone3-anomaly':  { title: 'HVAC Zone 3 Fan Speed Anomaly', detail: 'Zone 3 (R&D Lab) fan speed shows micro-oscillations not present in any other zone. Pattern repeats in 8-bit sequences.', source: 'bms', category: 'digital' },
        'bms-firmware-hash':  { title: 'Zone 3 Controller Firmware Mismatch', detail: 'Zone 3 controller hash differs from factory default and all other zone controllers. Firmware was modified.', source: 'bms', category: 'digital' },
        'bms-firmware-time':  { title: 'Zone 3 Firmware Update Timestamp', detail: 'Firmware updated at 02:32 AM on Feb 15 \u2014 outside maintenance window. No change ticket exists.', source: 'bms', category: 'digital' },

        // NETWORK
        'net-bacnet-cmds':    { title: 'Unauthorized BACnet Write Commands', detail: 'BACnet Write-Property commands to Zone 3 controller from IP 10.10.5.78 (facilities workstation). Not from BMS server.', source: 'network', category: 'digital' },
        'net-no-exfil':       { title: 'Zero Network Exfiltration Detected', detail: 'Complete network TAP analysis: no suspicious outbound data transfers, no DNS tunneling, no covert channels on IP network.', source: 'network', category: 'digital' },

        // WORKSTATION A (Lab Director — clean)
        'ws-a-clean':         { title: 'Lab Director Workstation — Clean', detail: 'USB backups are encrypted and policy-compliant. Late nights are legitimate research. No unauthorized software.', source: 'workstation-a', category: 'digital' },
        'ws-a-late-nights':   { title: 'Lab Director — Late Night Activity', detail: 'Dr. Vasquez worked past midnight 12 times in 2 months. All sessions have corresponding lab notebook entries and Git commits.', source: 'workstation-a', category: 'digital', isRedHerring: true },

        // WORKSTATION B (Facilities Engineer — suspect)
        'ws-b-hvac-script':   { title: '[RECOVERED] hvac_mod.py', detail: 'Python script that encodes binary data as fan speed modulation patterns. Accepts --input, --zone, --rate parameters.', source: 'workstation-b', category: 'digital' },
        'ws-b-bash-history':  { title: 'Deleted Bash History', detail: 'Recovered: "python3 hvac_mod.py --input /mnt/research/gt-7742.pdf --zone 3 --rate 12"', source: 'workstation-b', category: 'digital' },
        'ws-b-bacnet-tools':  { title: 'BACnet Programming Tools', detail: 'BACtool Pro and custom BACnet scripts installed. Legitimate for facilities role but used to flash modified firmware.', source: 'workstation-b', category: 'digital' },

        // CAMERAS
        'cam-hvac-room':      { title: 'Camera: HVAC Mechanical Room Entry', detail: 'Suspect B entered HVAC mechanical room at 02:15 AM on Feb 15. Exited at 02:47 AM. Carrying a laptop.', source: 'cameras', category: 'physical' },
        'cam-competitor':     { title: 'Camera: Competitor Vehicle at Exhaust Vent', detail: 'Same silver BMW (plate partially obscured) parked near HVAC exhaust vent 3 times in 2 weeks. Driver used directional microphone.', source: 'cameras', category: 'physical' },
        'cam-parking-b':      { title: 'Camera: Suspect B After-Hours Parking', detail: 'Suspect B\'s vehicle in parking garage at 01:50 AM on Feb 15. Only employee in the building besides security guard.', source: 'cameras', category: 'physical' },

        // RED HERRINGS
        'rh-usb-backup':      { title: 'Lab Director USB Backup', detail: 'Dr. Vasquez backs up research to encrypted USB weekly. All backups are AES-256 encrypted and policy-compliant.', source: 'workstation-a', category: 'digital', isRedHerring: true },
        'rh-vendor-access':   { title: 'HVAC Vendor Remote Access', detail: 'Trane vendor has remote monitoring access to BMS. Access logs show only read-only queries during business hours.', source: 'bms', category: 'digital', isRedHerring: true }
    },

    connections: [
        { id: 'conn-anomaly', label: 'Side Channel: Zone 3 fan speed oscillations encode binary data', from: 'bms-zone3-anomaly', to: 'ws-b-hvac-script' },
        { id: 'conn-source', label: 'BACnet Source: Unauthorized commands from facilities workstation', from: 'net-bacnet-cmds', to: 'ws-b-bacnet-tools' },
        { id: 'conn-tool', label: 'Exfiltration Tool: hvac_mod.py encodes files as fan speed modulation', from: 'ws-b-hvac-script', to: 'ws-b-bash-history' },
        { id: 'conn-physical', label: 'Physical Access: Suspect B in HVAC room at 2 AM for firmware flash', from: 'cam-hvac-room', to: 'bms-firmware-time' },
        { id: 'conn-receiver', label: 'Acoustic Receiver: Competitor vehicle at exhaust vent with directional mic', from: 'cam-competitor', to: 'bms-zone3-anomaly' },
        { id: 'conn-firmware', label: 'Modified Firmware: Zone 3 controller hash differs from factory', from: 'bms-firmware-hash', to: 'cam-hvac-room' },
        { id: 'conn-clean', label: 'Red Herring Cleared: Lab Director activity is legitimate research', from: 'ws-a-clean', to: 'ws-a-late-nights' }
    ],

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },

    answers: [
        'acoustic side channel hvac',
        'hvac fan modulation',
        'hvac side channel',
        'acoustic exfiltration hvac',
        'fan speed side channel',
        'facilities engineer hvac'
    ],
    answerKeywords: [
        ['acoustic', 'hvac', 'fan', 'side channel', 'modulation'],
        ['facilities', 'engineer', 'suspect b']
    ],
    nearMiss: [
        { match: ['facilities', 'engineer'], hint: 'Right suspect. But what was the exfiltration METHOD? There was no network exfil \u2014 the data left through an unconventional channel.' },
        { match: ['hvac', 'fan'], hint: 'You found the channel. Who set it up and who received the data on the other end?' },
        { match: ['network', 'dns', 'usb'], hint: 'The network TAP shows zero exfiltration. The USB backups are clean. The data left through a physical medium \u2014 not digital.' },
        { match: ['lab director', 'vasquez'], hint: 'Dr. Vasquez is clean. Late nights are legitimate research. Look at who has access to the building systems.' }
    ],

    triggers: {
        threats: [
            { id: 'threat-1', minGameHours: 10, from: 'UNKNOWN', text: 'Interesting investigation. But you won\'t find anything on the network. We don\'t use your wires.', condition: function(s) { return s.pinnedEvidence.length >= 4; } },
            { id: 'threat-2', minGameHours: 16, from: 'UNKNOWN', text: 'The firmware is being reflashed to factory defaults remotely. Whatever you haven\'t captured is gone.', condition: function(s) { return s.connections.length >= 3; }, onFire: function(engine) { engine.startRemoteWipe('bms', 0.167); } }
        ],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: The network TAP shows no data exfiltration. If data is leaving the building, it\'s not through the network. What other channels exist?', condition: function(s) { return s.openedFiles.length >= 3; } },
            { id: 'tip-2', minGameHours: 12, from: 'SYSTEM', text: 'Tip: Compare the HVAC fan speed patterns across all zones. One zone is different. Why would a fan oscillate in 8-bit patterns?', condition: function(s) { return s.pinnedEvidence.length >= 5; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'CISO NAKAMURA', text: 'Analyst \u2014 BioGenesis Labs has been losing proprietary gene therapy research to a competitor. We\'ve swept the network, scanned all endpoints, audited every USB. Nothing. The data is still leaking. Something we\'re not seeing. Check everything \u2014 including the building itself.', condition: function() { return true; } },
            { id: 'handler-2', minGameHours: 8, from: 'CISO NAKAMURA', text: 'Our competitor filed a patent using our exact methodology \u2014 for the third time. Whatever channel they\'re using, it\'s been active for at least 2 months. The network is clean. I\'m starting to think the leak isn\'t digital.', condition: function(s) { return s.openedFiles.length >= 6; } }
        ],
        surveillance: [
            { id: 'surv-1', minGameHours: 8, effect: 'network_spike', condition: function(s) { return s.openedFiles.length >= 4; } }
        ]
    }
};
