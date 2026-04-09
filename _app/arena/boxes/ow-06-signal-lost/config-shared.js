/* ═══════════════════════════════════════════════════════════════════
   OW-06: Operation Signal Lost — Shared Configuration
   Downed Drone Intelligence Recovery | Cyber-Hijacked MQ-9B
   ═══════════════════════════════════════════════════════════════════ */

const SignalLostConfig = {
    id: 'ow-06-signal-lost',
    title: 'OPERATION SIGNAL LOST',
    storageKey: 'hexworth_ow06',
    registryId: 'ow-06-signal-lost',
    startScore: 1000,
    clockStart: 6,
    clockRatio: 60,
    accentColor: '#3b82f6',
    minConnectionsToSubmit: 5,

    devices: ['telemetry', 'sigint', 'satellite', 'network', 'briefing'],

    pages: [
        { id: 'hub',       label: 'TOC',        href: 'index.html' },
        { id: 'telemetry', label: 'Telemetry',   href: 'telemetry.html' },
        { id: 'sigint',    label: 'SIGINT',      href: 'sigint.html' },
        { id: 'satellite', label: 'Satellite',   href: 'satellite.html' },
        { id: 'network',   label: 'Adversary',   href: 'network.html' },
        { id: 'briefing',  label: 'Briefing',    href: 'briefing.html' },
        { id: 'caseboard', label: 'CaseBoard',   href: 'caseboard.html' }
    ],

    evidence: {
        'tl-controlled-descent': { title: 'Controlled Descent Pattern', detail: 'Drone descended in a controlled spiral over 4 minutes. No sudden altitude loss. Not consistent with missile strike.', source: 'telemetry', category: 'digital' },
        'tl-satcom-reboot':      { title: 'Sat-Comm Module Reboot at T-47:23', detail: 'Satellite communication module rebooted mid-flight. Firmware was overwritten during flight. Signal lost for 8 seconds.', source: 'telemetry', category: 'digital' },
        'tl-gps-spoof':          { title: 'GPS Spoofing Detected', detail: 'GPS coordinates shifted 12km east during descent. Drone was fed false coordinates to guide it to adversary landing zone.', source: 'telemetry', category: 'digital' },
        'si-burst-transmission': { title: 'EW Burst Transmission at T-47:20', detail: 'High-power burst on adversary EW frequency 3 seconds before sat-comm reboot. Source: Grid Square 38TLN-4421.', source: 'sigint', category: 'digital' },
        'si-package-secured':    { title: 'Intercept: "Package Secured"', detail: 'Decoded radio intercept at T+02:15: "Package secured at grid reference. Recovery team en route." Source: Specter Brigade freq.', source: 'sigint', category: 'communications' },
        'si-gps-spoof-sig':      { title: 'GPS Spoofing Signatures', detail: 'SIGINT detected GPS spoofing emissions from Grid Square 38TLN-4433. Signal characteristics match Specter Brigade EW suite.', source: 'sigint', category: 'digital' },
        'sat-no-debris':         { title: 'Satellite: No Debris Field', detail: 'Satellite imagery of reported crash site shows no debris, no crater, no burn marks. The drone did not crash here.', source: 'satellite', category: 'physical' },
        'sat-black-site':        { title: 'Satellite: New Vehicle at Black Site', detail: 'A new flatbed truck appeared at known adversary black site 12km east. Thermal signature consistent with drone engine cooldown.', source: 'satellite', category: 'physical' },
        'sat-thermal':           { title: 'Satellite: Thermal Match', detail: 'Thermal overlay shows heat signature at black site matching MQ-9B turboprop engine cooldown curve (800F -> 200F over 4 hours).', source: 'satellite', category: 'physical' },
        'nw-specter-brigade':    { title: 'Adversary: Specter Brigade EW Unit', detail: 'Specter Brigade operates EW installations in the area. Known for cyber-EW capabilities including GPS spoofing and signal injection.', source: 'network', category: 'people' },
        'br-firmware-vuln':      { title: 'Firmware Changelog: Sat-Comm v3.2.1 Vulnerable', detail: 'The sat-comm module was running v3.2.1. Version 3.2.2 (released 2 weeks prior) patched a remote code execution vulnerability (CVE-2026-1847).', source: 'briefing', category: 'digital' },
        'br-firmware-patch':     { title: 'Patch Not Applied', detail: 'v3.2.2 patch was available but not applied to RAVEN-7. Maintenance log shows "patch pending next scheduled downtime."', source: 'briefing', category: 'digital' },

        'rh-sam-theory':  { title: 'SAM Launch Theory', detail: 'Initial assessment suggested SA-22 Greyhound SAM engagement. But telemetry shows no sudden acceleration, no warhead detonation, no fragmentation pattern.', source: 'telemetry', category: 'digital', isRedHerring: true },
        'rh-mechanical':  { title: 'Mechanical Failure Theory', detail: 'Engineering review: no engine anomalies, no structural stress, no fuel system failures in telemetry. The aircraft was healthy when it descended.', source: 'briefing', category: 'digital', isRedHerring: true }
    },

    connections: [
        { id: 'conn-not-shootdown', label: 'Not a Shootdown: Controlled descent, no debris', from: 'tl-controlled-descent', to: 'sat-no-debris' },
        { id: 'conn-cyber-hijack', label: 'Cyber Hijack: Sat-comm firmware exploit via EW burst', from: 'tl-satcom-reboot', to: 'si-burst-transmission' },
        { id: 'conn-gps-spoof', label: 'GPS Spoofed: Drone guided to adversary landing zone', from: 'tl-gps-spoof', to: 'si-gps-spoof-sig' },
        { id: 'conn-landing', label: 'Intact Landing: Thermal match at black site 12km east', from: 'sat-black-site', to: 'sat-thermal' },
        { id: 'conn-attribution', label: 'Attribution: Specter Brigade EW unit (frequency + capability)', from: 'nw-specter-brigade', to: 'si-burst-transmission' },
        { id: 'conn-recovery', label: 'Recovery Confirmed: "Package secured" intercept', from: 'si-package-secured', to: 'sat-black-site' },
        { id: 'conn-vulnerability', label: 'Unpatched Firmware: CVE-2026-1847 enabled the attack', from: 'br-firmware-vuln', to: 'tl-satcom-reboot' }
    ],

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },

    // Flags server-side only (Firestore flag_registry/ow-06-signal-lost)
    flagConnections: {
        'conn-cyber-hijack': 'cause',
        'conn-landing': 'location',
        'conn-attribution': 'unit'
    },

    triggers: {
        threats: [],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Compare the telemetry descent profile with known missile engagement patterns. What\'s different?', condition: function(s) { return s.openedFiles.length >= 3; } },
            { id: 'tip-2', minGameHours: 10, from: 'SYSTEM', text: 'Tip: The sat-comm reboot and the EW burst happened 3 seconds apart. That\'s not a coincidence.', condition: function(s) { return s.pinnedEvidence.length >= 5; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'COL. HARTWELL (J2)', text: 'Analyst \u2014 RAVEN-7 went dark 6 hours ago during a routine ISR mission. Command assumed SAM engagement but we have no MAWS (Missile Approach Warning System) activation in the telemetry. Something doesn\'t add up. I need your assessment before we brief the JCS.', condition: function() { return true; } },
            { id: 'handler-2', minGameHours: 8, from: 'COL. HARTWELL (J2)', text: 'NSA just forwarded a SIGINT intercept that mentions "package secured." If this drone landed intact, we have a catastrophic intelligence compromise. The crypto modules, the sensor suite, the SIGINT payload \u2014 all of it.', condition: function(s) { return s.openedFiles.length >= 8; } }
        ],
        surveillance: []
    }
};
