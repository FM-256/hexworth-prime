/**
 * SignalData.js — Hexworth Prime Hardware Projects Hub ("The Signal")
 *
 * Defines all tracks, sections, and project mappings for the hardware hub.
 * The Signal = the physical layer. Electromagnetic, electronic, RF — where
 * hardware security lives.
 *
 * Project hrefs are relative from the section page depth:
 *   _app/signal/sections/{name}/index.html
 * So project pages live alongside their section index.
 *
 * Progress is tracked in localStorage as: hexworth_signal_progress
 */

const SignalData = {

    version: '1.0.0',

    // -------------------------------------------------------------------------
    // Hub metadata
    // -------------------------------------------------------------------------
    hub: {
        name: 'The Signal',
        tagline: 'Hardware Security Builds',
        description: 'Real hardware projects — from first breadboard to field-deployable security tools. Arduino, ESP32, Raspberry Pi.',
        icon: '../../assets/images/icons/icon-antenna.webp',
        color: '#ff6b35',
        colorDim: 'rgba(255, 107, 53, 0.15)',
        progressKey: 'hexworth_signal_progress'
    },

    // -------------------------------------------------------------------------
    // Hardware platforms — the kits you need
    // -------------------------------------------------------------------------
    platforms: {
        'arduino-mega': {
            name: 'Arduino Mega 2560',
            kit: 'ELEGOO Mega R3 Ultimate Starter Kit',
            approxCost: 55,
            icon: '../../assets/images/icons/icon-memory.webp',
            color: '#4ade80',
            description: '9 projects, zero additional cost beyond the kit. Sensors, LCD, SD card, RFID — all included.'
        },
        'esp32-cyd': {
            name: 'ESP32 CYD',
            kit: 'ESP32-2432S028R (2.8" TFT + Touch)',
            approxCost: 12,
            icon: '../../assets/images/icons/icon-signal.webp',
            color: '#38bdf8',
            description: 'Cheap Yellow Display — built-in 2.8" touchscreen, WiFi, Bluetooth. Perfect for portable dashboards.'
        },
        'esp32-devkit': {
            name: 'ESP32 DevKit V1',
            kit: 'ESP32-WROOM-32 DevKit',
            approxCost: 8,
            icon: '../../assets/images/icons/icon-plug.webp',
            color: '#facc15',
            description: 'Bare ESP32 dev board. WiFi + BT scanning, custom firmware, RF projects.'
        },
        'raspberry-pi': {
            name: 'Raspberry Pi 4/5',
            kit: 'Pi 4 4GB + SD Card + PSU',
            approxCost: 75,
            icon: '../../assets/images/icons/icon-desktop.webp',
            color: '#c084fc',
            description: 'Full Linux SBC. Network probes, encryption stations, IDS, Tor routing.'
        },
        'workstation': {
            name: 'Any PC / Laptop',
            kit: 'Your existing computer',
            approxCost: 0,
            icon: '../../assets/images/icons/icon-laptop.webp',
            color: '#94a3b8',
            description: 'Standard PC or laptop. No special hardware — just a computer and common peripherals.'
        },
        'rp2040-pico': {
            name: 'Raspberry Pi Pico',
            kit: 'RP2040-Zero or Pi Pico + MicroSD Breakout',
            approxCost: 12,
            icon: '../../assets/images/icons/icon-memory.webp',
            color: '#22d3ee',
            description: 'RP2040 microcontroller with native USB. USB devices, HID projects, mass storage builds.'
        }
    },

    // -------------------------------------------------------------------------
    // Skill tags — cross-cutting competencies
    // -------------------------------------------------------------------------
    skills: {
        'breadboarding': 'Breadboard Prototyping',
        'soldering': 'Soldering',
        'serial-comms': 'Serial Communication',
        'wifi-scanning': 'WiFi Scanning',
        'bluetooth': 'Bluetooth Protocol',
        'packet-capture': 'Packet Capture',
        'rfid-nfc': 'RFID / NFC',
        'encryption': 'Encryption',
        'linux-admin': 'Linux Administration',
        'python': 'Python Scripting',
        'cpp': 'C/C++ Firmware',
        'arduino-ide': 'Arduino IDE',
        'platformio': 'PlatformIO',
        'networking': 'Networking Fundamentals',
        'rf-fundamentals': 'RF Fundamentals',
        'usb-protocol': 'USB Protocol',
        'sensor-integration': 'Sensor Integration',
        'display-programming': 'Display Programming',
        'sd-storage': 'SD Card Storage',
        'gpio': 'GPIO / Pin Control',
        'tor-privacy': 'Tor / Privacy Tools',
        'ids-ips': 'IDS / IPS',
        'physical-security': 'Physical Security',
        'firmware-dev': 'Firmware Development'
    },

    // -------------------------------------------------------------------------
    // Difficulty tiers
    // -------------------------------------------------------------------------
    difficulties: {
        recruit: {
            label: 'Recruit',
            color: '#4ade80',
            xp: 300,
            costRange: '$0-20',
            description: 'Beginner-friendly. Kit components only, guided wiring, simple code.'
        },
        operative: {
            label: 'Operative',
            color: '#facc15',
            xp: 600,
            costRange: '$5-75',
            description: 'Intermediate. Some external parts, moderate code complexity, networking concepts.'
        },
        specialist: {
            label: 'Specialist',
            color: '#f87171',
            xp: 1200,
            costRange: '$10-80',
            description: 'Advanced. Custom configurations, protocol-level work, security concepts.'
        },
        field_agent: {
            label: 'Field Agent',
            color: '#c084fc',
            xp: 2500,
            costRange: '$15-80+',
            description: 'Expert. Field-deployable builds, complex firmware, production-grade tools.'
        }
    },

    // -------------------------------------------------------------------------
    // Track definitions — logical groupings shown as tabs on the hub page
    // -------------------------------------------------------------------------
    tracks: [
        {
            id: 'foundations',
            name: 'Foundations',
            tagline: 'Learn the basics.',
            description: 'Arduino fundamentals — circuits, sensors, serial communication, displays, and data logging. Everything in your starter kit.',
            icon: '../../assets/images/icons/icon-lightning.webp',
            color: '#4ade80',
            colorDim: 'rgba(74, 222, 128, 0.15)',
            sections: ['foundations']
        },
        {
            id: 'network-recon',
            name: 'Network Recon',
            tagline: 'Scan the spectrum.',
            description: 'WiFi scanning, Bluetooth enumeration, packet capture dashboards, and deauth detection. See what\'s on the air.',
            icon: '../../assets/images/icons/icon-signal.webp',
            color: '#38bdf8',
            colorDim: 'rgba(56, 189, 248, 0.15)',
            sections: ['network-recon']
        },
        {
            id: 'security-tools',
            name: 'Security Tools',
            tagline: 'Build your arsenal.',
            description: 'RFID access control, keylogger detection, Bad USB analysis, motion surveillance, and perimeter alarms.',
            icon: '../../assets/images/icons/icon-shield.webp',
            color: '#f87171',
            colorDim: 'rgba(248, 113, 113, 0.15)',
            sections: ['security-tools']
        },
        {
            id: 'privacy-builds',
            name: 'Privacy Builds',
            tagline: 'Go dark.',
            description: 'Encrypted dead drops, Faraday testing, air-gapped transfers, Tor routing, and signal jammer detection.',
            icon: '../../assets/images/icons/icon-padlock.webp',
            color: '#a78bfa',
            colorDim: 'rgba(167, 139, 250, 0.15)',
            sections: ['privacy-builds']
        },
        {
            id: 'firmware-ops',
            name: 'Firmware Ops',
            tagline: 'Own the silicon.',
            description: 'Custom firmware from scratch, badge hacking, portable field terminals, network anomaly monitors, and intrusion detection.',
            icon: '../../assets/images/icons/icon-tools.webp',
            color: '#fb923c',
            colorDim: 'rgba(251, 146, 60, 0.15)',
            sections: ['firmware-ops']
        },
        {
            id: 'arcade-ops',
            name: 'Arcade Ops',
            tagline: 'Insert coin.',
            description: 'Retro gaming builds — handheld consoles, emulation stations, arcade controllers, and full mini cabinets.',
            icon: '../../assets/images/icons/icon-joystick.webp',
            color: '#ec4899',
            colorDim: 'rgba(236, 72, 153, 0.15)',
            sections: ['arcade-ops']
        },
        {
            id: 'field-prep',
            name: 'Field Prep',
            tagline: 'Gear up.',
            description: 'Essential IT field skills — bootable media, drive imaging, workstation setup, cable making, and deployment kits. Day-one skills for any tech role.',
            icon: '../../assets/images/icons/icon-tools.webp',
            color: '#94a3b8',
            colorDim: 'rgba(148, 163, 184, 0.15)',
            sections: ['field-prep']
        },
        {
            id: 'red-team-hw',
            name: 'Red Team Hardware',
            tagline: 'Build your arsenal.',
            description: 'DIY offensive security hardware — USB attack tools, keystroke injectors, network implants, WiFi auditing, and cable detectors. Build Hak5-class tools from $4 microcontrollers.',
            icon: '../../assets/images/icons/icon-skull.webp',
            color: '#dc2626',
            colorDim: 'rgba(220, 38, 38, 0.15)',
            sections: ['red-team-hw']
        }
    ],

    // -------------------------------------------------------------------------
    // Section definitions — each section maps to a navigable page with projects
    // -------------------------------------------------------------------------
    sections: [

        // =================================================================
        // FOUNDATIONS — Arduino basics, all kit-included
        // =================================================================
        {
            id: 'foundations',
            name: 'Foundations',
            track: 'foundations',
            icon: '../../assets/images/icons/icon-lightning.webp',
            description: 'Arduino fundamentals — circuits, sensors, serial communication, displays, and data logging.',
            color: '#4ade80',
            projects: [
                {
                    id: 'sg-01',
                    title: 'Blink & Breadboard: Your First Circuit',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'arduino-mega',
                    buildTime: '45m',
                    cost: '$0',
                    status: 'ready',
                    href: 'sg-01-blink-breadboard.html',
                    skills: ['breadboarding', 'arduino-ide', 'gpio'],
                    prerequisites: [],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'USB Cable', qty: 1, inKit: true },
                        { component: 'Breadboard', qty: 1, inKit: true },
                        { component: 'LEDs (assorted)', qty: 5, inKit: true },
                        { component: '220\u03A9 Resistors', qty: 5, inKit: true },
                        { component: 'Jumper Wires', qty: 10, inKit: true }
                    ],
                    outcomes: [
                        'Understand voltage, current, and resistance basics',
                        'Wire an LED circuit on a breadboard',
                        'Upload and modify your first Arduino sketch',
                        'Control multiple LEDs with digital pins'
                    ]
                },
                {
                    id: 'sg-02',
                    title: 'Sensor I/O: Temperature, Light, Distance',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'arduino-mega',
                    buildTime: '60m',
                    cost: '$0',
                    status: 'ready',
                    href: 'sg-02-sensor-io.html',
                    skills: ['sensor-integration', 'arduino-ide', 'breadboarding'],
                    prerequisites: ['sg-01'],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'DHT11 Temperature/Humidity Sensor', qty: 1, inKit: true },
                        { component: 'Photoresistor', qty: 1, inKit: true },
                        { component: 'HC-SR04 Ultrasonic Sensor', qty: 1, inKit: true },
                        { component: '10K\u03A9 Resistor', qty: 1, inKit: true },
                        { component: 'Breadboard + Jumper Wires', qty: 1, inKit: true }
                    ],
                    outcomes: [
                        'Read analog and digital sensor values',
                        'Calibrate sensor thresholds',
                        'Use the Serial Monitor for debugging',
                        'Combine multiple sensor inputs in one sketch'
                    ]
                },
                {
                    id: 'sg-03',
                    title: 'Serial Bridge: Arduino Talks to Python',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'arduino-mega',
                    buildTime: '60m',
                    cost: '$0',
                    status: 'ready',
                    href: 'sg-03-serial-bridge.html',
                    skills: ['serial-comms', 'python', 'arduino-ide'],
                    prerequisites: ['sg-02'],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'USB Cable', qty: 1, inKit: true },
                        { component: 'Any sensor from sg-02', qty: 1, inKit: true }
                    ],
                    outcomes: [
                        'Send structured data over USB serial',
                        'Parse serial data in Python with pyserial',
                        'Build a live sensor dashboard in the terminal',
                        'Understand baud rates and serial protocols'
                    ]
                },
                {
                    id: 'sg-04',
                    title: 'LCD Dashboard: Multi-Screen Sensor Display',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'arduino-mega',
                    buildTime: '60m',
                    cost: '$0',
                    status: 'ready',
                    href: 'sg-04-lcd-dashboard.html',
                    skills: ['display-programming', 'sensor-integration', 'arduino-ide'],
                    prerequisites: ['sg-02'],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'LCD 1602 Display', qty: 1, inKit: true },
                        { component: 'I2C Adapter (or Potentiometer)', qty: 1, inKit: true },
                        { component: 'DHT11 Sensor', qty: 1, inKit: true },
                        { component: 'Breadboard + Jumper Wires', qty: 1, inKit: true }
                    ],
                    outcomes: [
                        'Drive an LCD display with the LiquidCrystal library',
                        'Create multi-page display interfaces',
                        'Display real-time sensor data on screen',
                        'Add button navigation between screens'
                    ]
                },
                {
                    id: 'sg-05',
                    title: 'Data Logger: SD Card + RTC Timestamps',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'arduino-mega',
                    buildTime: '75m',
                    cost: '$8',
                    status: 'ready',
                    href: 'sg-05-data-logger.html',
                    skills: ['sd-storage', 'sensor-integration', 'arduino-ide'],
                    prerequisites: ['sg-02'],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'SD Card Module', qty: 1, inKit: false },
                        { component: 'MicroSD Card (any size)', qty: 1, inKit: false },
                        { component: 'DS3231 RTC Module', qty: 1, inKit: false },
                        { component: 'DHT11 Sensor', qty: 1, inKit: true },
                        { component: 'Breadboard + Jumper Wires', qty: 1, inKit: true }
                    ],
                    outcomes: [
                        'Write sensor data to CSV files on SD card',
                        'Keep accurate timestamps with a real-time clock',
                        'Create rotation and file naming schemes',
                        'Analyze logged data in Python or Excel'
                    ]
                }
            ]
        },

        // =================================================================
        // NETWORK RECON — WiFi/BT scanning, packet capture
        // =================================================================
        {
            id: 'network-recon',
            name: 'Network Recon',
            track: 'network-recon',
            icon: '../../assets/images/icons/icon-signal.webp',
            description: 'WiFi scanning, Bluetooth enumeration, packet capture, and wireless threat detection.',
            color: '#38bdf8',
            projects: [
                {
                    id: 'sg-06',
                    title: 'WiFi Recon Scanner',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'esp32-cyd',
                    buildTime: '90m',
                    cost: '$12',
                    status: 'ready',
                    href: 'sg-06-wifi-recon.html',
                    skills: ['wifi-scanning', 'display-programming', 'cpp'],
                    prerequisites: [],
                    parts: [
                        { component: 'ESP32 CYD (2.8" TFT)', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Scan and enumerate nearby WiFi networks',
                        'Display SSID, channel, signal strength, encryption type',
                        'Build a touchscreen UI for scan results',
                        'Identify hidden networks and rogue access points'
                    ]
                },
                {
                    id: 'sg-07',
                    title: 'Bluetooth Device Scanner',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'esp32-devkit',
                    buildTime: '75m',
                    cost: '$8',
                    status: 'ready',
                    href: 'sg-07-bluetooth-scanner.html',
                    skills: ['bluetooth', 'serial-comms', 'cpp'],
                    prerequisites: [],
                    parts: [
                        { component: 'ESP32 DevKit V1', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Scan for Classic and BLE devices',
                        'Identify device types, names, and MAC addresses',
                        'Detect BLE beacons and advertising packets',
                        'Log discovered devices with timestamps'
                    ]
                },
                {
                    id: 'sg-08',
                    title: 'Packet Traffic Dashboard',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'esp32-cyd',
                    buildTime: '120m',
                    cost: '$12',
                    status: 'ready',
                    href: 'sg-08-packet-dashboard.html',
                    skills: ['packet-capture', 'wifi-scanning', 'display-programming', 'cpp'],
                    prerequisites: ['sg-06'],
                    parts: [
                        { component: 'ESP32 CYD (2.8" TFT)', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Enable promiscuous mode on ESP32 WiFi',
                        'Capture and categorize WiFi frame types',
                        'Visualize traffic patterns on the TFT display',
                        'Detect unusual traffic spikes or broadcast storms'
                    ]
                },
                {
                    id: 'sg-09',
                    title: 'Raspberry Pi Network Probe',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'raspberry-pi',
                    buildTime: '90m',
                    cost: '$75',
                    status: 'ready',
                    href: 'sg-09-network-probe.html',
                    skills: ['networking', 'linux-admin', 'python'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi 4 (4GB)', qty: 1, inKit: false },
                        { component: 'MicroSD Card (32GB+)', qty: 1, inKit: false },
                        { component: 'USB-C Power Supply', qty: 1, inKit: false },
                        { component: 'Ethernet Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Set up a headless Raspberry Pi with SSH',
                        'Run nmap and arp-scan for network discovery',
                        'Build a Python network monitoring script',
                        'Generate network topology reports'
                    ]
                },
                {
                    id: 'sg-10',
                    title: 'Deauth Attack Detector',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'esp32-devkit',
                    buildTime: '90m',
                    cost: '$10',
                    status: 'ready',
                    href: 'sg-10-deauth-detector.html',
                    skills: ['wifi-scanning', 'packet-capture', 'cpp'],
                    prerequisites: ['sg-06'],
                    parts: [
                        { component: 'ESP32 DevKit V1', qty: 1, inKit: false },
                        { component: 'LED (alert indicator)', qty: 1, inKit: false },
                        { component: 'Piezo Buzzer', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Detect 802.11 deauthentication frames in real-time',
                        'Identify the source MAC of deauth attacks',
                        'Trigger visual and audio alerts on detection',
                        'Log attack events with timestamps and channel info'
                    ]
                }
            ]
        },

        // =================================================================
        // SECURITY TOOLS — Physical security, access control
        // =================================================================
        {
            id: 'security-tools',
            name: 'Security Tools',
            track: 'security-tools',
            icon: '../../assets/images/icons/icon-shield.webp',
            description: 'Physical security builds — RFID access control, keylogger detection, USB analysis, surveillance, and alarms.',
            color: '#f87171',
            projects: [
                {
                    id: 'sg-11',
                    title: 'RFID Access Controller',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'arduino-mega',
                    buildTime: '90m',
                    cost: '$5',
                    status: 'ready',
                    href: 'sg-11-rfid-controller.html',
                    skills: ['rfid-nfc', 'arduino-ide', 'breadboarding'],
                    prerequisites: ['sg-01'],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'MFRC522 RFID Reader', qty: 1, inKit: false },
                        { component: 'RFID Cards/Tags (2 pack)', qty: 1, inKit: false },
                        { component: 'Servo Motor', qty: 1, inKit: true },
                        { component: 'LEDs (green + red)', qty: 2, inKit: true },
                        { component: 'Piezo Buzzer', qty: 1, inKit: true }
                    ],
                    outcomes: [
                        'Read RFID tag UIDs with the MFRC522 module',
                        'Build an authorized-card whitelist',
                        'Control a servo lock mechanism on valid scan',
                        'Log access attempts with timestamps'
                    ]
                },
                {
                    id: 'sg-12',
                    title: 'Hardware Keylogger Detector',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'raspberry-pi',
                    buildTime: '90m',
                    cost: '$75',
                    status: 'ready',
                    href: 'sg-12-keylogger-detector.html',
                    skills: ['usb-protocol', 'linux-admin', 'python', 'physical-security'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi 4 (4GB)', qty: 1, inKit: false },
                        { component: 'MicroSD Card (32GB+)', qty: 1, inKit: false },
                        { component: 'USB-C Power Supply', qty: 1, inKit: false },
                        { component: 'USB Keyboard (for testing)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Enumerate USB device descriptors programmatically',
                        'Detect anomalous USB device insertions',
                        'Identify known keylogger device signatures',
                        'Build an automated USB audit script'
                    ]
                },
                {
                    id: 'sg-13',
                    title: 'Bad USB Analysis Lab',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'arduino-mega',
                    buildTime: '120m',
                    cost: '$15',
                    status: 'ready',
                    href: 'sg-13-bad-usb-lab.html',
                    skills: ['usb-protocol', 'arduino-ide', 'cpp', 'physical-security'],
                    prerequisites: ['sg-01'],
                    parts: [
                        { component: 'Arduino Pro Micro (ATmega32U4)', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false },
                        { component: 'Test VM or isolated machine', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Understand HID (Human Interface Device) attacks',
                        'Write and analyze Rubber Ducky-style payloads',
                        'Build detection scripts for malicious HID devices',
                        'Develop countermeasures and USB policies'
                    ]
                },
                {
                    id: 'sg-14',
                    title: 'Motion Surveillance Rig',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'arduino-mega',
                    buildTime: '90m',
                    cost: '$0',
                    status: 'ready',
                    href: 'sg-14-motion-surveillance.html',
                    skills: ['sensor-integration', 'arduino-ide', 'breadboarding'],
                    prerequisites: ['sg-02'],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'PIR Motion Sensor', qty: 1, inKit: true },
                        { component: 'Piezo Buzzer', qty: 1, inKit: true },
                        { component: 'LED (alert)', qty: 1, inKit: true },
                        { component: 'Breadboard + Jumper Wires', qty: 1, inKit: true }
                    ],
                    outcomes: [
                        'Configure PIR sensor sensitivity and timing',
                        'Build multi-zone detection with multiple PIRs',
                        'Trigger alerts via buzzer, LED, and serial output',
                        'Create a motion event log with timestamps'
                    ]
                },
                {
                    id: 'sg-15',
                    title: 'Perimeter Alarm System',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'arduino-mega',
                    buildTime: '60m',
                    cost: '$0',
                    status: 'ready',
                    href: 'sg-15-perimeter-alarm.html',
                    skills: ['sensor-integration', 'arduino-ide', 'breadboarding', 'gpio'],
                    prerequisites: ['sg-01'],
                    parts: [
                        { component: 'Arduino Mega 2560', qty: 1, inKit: true },
                        { component: 'HC-SR04 Ultrasonic Sensor', qty: 1, inKit: true },
                        { component: 'Piezo Buzzer', qty: 1, inKit: true },
                        { component: 'LEDs (green/yellow/red)', qty: 3, inKit: true },
                        { component: 'Breadboard + Jumper Wires', qty: 1, inKit: true }
                    ],
                    outcomes: [
                        'Create distance-based proximity zones',
                        'Implement graduated alert levels (green/yellow/red)',
                        'Drive buzzer frequency based on distance',
                        'Add arming/disarming via button or serial command'
                    ]
                }
            ]
        },

        // =================================================================
        // PRIVACY BUILDS — Encryption, RF shielding, anonymity
        // =================================================================
        {
            id: 'privacy-builds',
            name: 'Privacy Builds',
            track: 'privacy-builds',
            icon: '../../assets/images/icons/icon-padlock.webp',
            description: 'Encryption, RF shielding, air-gapped transfers, anonymous routing, and signal detection.',
            color: '#a78bfa',
            projects: [
                {
                    id: 'sg-16',
                    title: 'Encrypted USB Dead Drop',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'raspberry-pi',
                    buildTime: '75m',
                    cost: '$20',
                    status: 'ready',
                    href: 'sg-16-encrypted-dead-drop.html',
                    skills: ['encryption', 'linux-admin', 'python'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi Zero 2 W', qty: 1, inKit: false },
                        { component: 'MicroSD Card (32GB+)', qty: 1, inKit: false },
                        { component: 'USB Flash Drive', qty: 1, inKit: false },
                        { component: 'USB OTG Adapter', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Set up LUKS full-disk encryption on a USB drive',
                        'Build an auto-mount encrypted volume script',
                        'Create a dead drop web interface for file exchange',
                        'Implement self-destructing message functionality'
                    ]
                },
                {
                    id: 'sg-17',
                    title: 'Faraday Pouch & RF Shielding Test',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'esp32-devkit',
                    buildTime: '60m',
                    cost: '$15',
                    status: 'ready',
                    href: 'sg-17-faraday-test.html',
                    skills: ['rf-fundamentals', 'wifi-scanning', 'bluetooth', 'cpp'],
                    prerequisites: [],
                    parts: [
                        { component: 'ESP32 DevKit V1', qty: 1, inKit: false },
                        { component: 'Faraday bag/pouch (or DIY materials)', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false },
                        { component: 'Phone (test target)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Measure WiFi and Bluetooth signal attenuation',
                        'Test commercial vs DIY Faraday shielding',
                        'Quantify RF leakage with RSSI measurements',
                        'Understand electromagnetic shielding principles'
                    ]
                },
                {
                    id: 'sg-18',
                    title: 'Air-Gapped File Transfer Station',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'raspberry-pi',
                    buildTime: '120m',
                    cost: '$80',
                    status: 'ready',
                    href: 'sg-18-air-gap-station.html',
                    skills: ['encryption', 'linux-admin', 'python', 'physical-security'],
                    prerequisites: ['sg-16'],
                    parts: [
                        { component: 'Raspberry Pi 4 (4GB)', qty: 1, inKit: false },
                        { component: 'MicroSD Card (32GB+)', qty: 1, inKit: false },
                        { component: 'USB-C Power Supply', qty: 1, inKit: false },
                        { component: 'USB Flash Drives (2x)', qty: 2, inKit: false },
                        { component: 'Small display (optional)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a physically isolated file transfer system',
                        'Implement one-way data diodes in software',
                        'Scan transferred files for malware signatures',
                        'Create an audit trail for all file movements'
                    ]
                },
                {
                    id: 'sg-19',
                    title: 'Pi Tor Router (Anonymous Gateway)',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'raspberry-pi',
                    buildTime: '90m',
                    cost: '$75',
                    status: 'ready',
                    href: 'sg-19-tor-router.html',
                    skills: ['tor-privacy', 'networking', 'linux-admin'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi 4 (4GB)', qty: 1, inKit: false },
                        { component: 'MicroSD Card (32GB+)', qty: 1, inKit: false },
                        { component: 'USB-C Power Supply', qty: 1, inKit: false },
                        { component: 'Ethernet Cable', qty: 1, inKit: false },
                        { component: 'USB WiFi Adapter (optional, for AP mode)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Configure Tor as a transparent proxy',
                        'Route all network traffic through Tor',
                        'Set up a WiFi access point for anonymous browsing',
                        'Verify anonymity with DNS leak and IP tests'
                    ]
                },
                {
                    id: 'sg-20',
                    title: 'Signal Jammer Detector',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'esp32-cyd',
                    buildTime: '90m',
                    cost: '$12',
                    status: 'ready',
                    href: 'sg-20-jammer-detector.html',
                    skills: ['rf-fundamentals', 'wifi-scanning', 'display-programming', 'cpp'],
                    prerequisites: ['sg-06'],
                    parts: [
                        { component: 'ESP32 CYD (2.8" TFT)', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Monitor WiFi channel noise floors across 2.4GHz',
                        'Detect broadband interference patterns',
                        'Visualize spectrum usage on the TFT display',
                        'Distinguish jamming from legitimate congestion'
                    ]
                }
            ]
        },

        // =================================================================
        // FIRMWARE OPS — Custom firmware, field terminals
        // =================================================================
        {
            id: 'firmware-ops',
            name: 'Firmware Ops',
            track: 'firmware-ops',
            icon: '../../assets/images/icons/icon-tools.webp',
            description: 'Custom firmware development, badge hacking, portable field terminals, and network intrusion detection.',
            color: '#fb923c',
            projects: [
                {
                    id: 'sg-21',
                    title: 'Custom Firmware: ESP32 from Scratch',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'esp32-devkit',
                    buildTime: '120m',
                    cost: '$8',
                    status: 'ready',
                    href: 'sg-21-custom-firmware.html',
                    skills: ['firmware-dev', 'cpp', 'platformio'],
                    prerequisites: [],
                    parts: [
                        { component: 'ESP32 DevKit V1', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Set up ESP-IDF or PlatformIO from scratch',
                        'Understand ESP32 boot process and partition tables',
                        'Write firmware with WiFi, BLE, and OTA updates',
                        'Flash, debug, and monitor via serial'
                    ]
                },
                {
                    id: 'sg-22',
                    title: 'Conference Badge Hacking Lab',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'esp32-devkit',
                    buildTime: '90m',
                    cost: '$15',
                    status: 'ready',
                    href: 'sg-22-badge-hacking.html',
                    skills: ['firmware-dev', 'cpp', 'bluetooth', 'rf-fundamentals'],
                    prerequisites: ['sg-21'],
                    parts: [
                        { component: 'ESP32 DevKit V1', qty: 1, inKit: false },
                        { component: 'NeoPixel LED Strip (small)', qty: 1, inKit: false },
                        { component: 'OLED Display (0.96" I2C)', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a custom electronic conference badge',
                        'Implement BLE-based badge-to-badge communication',
                        'Add interactive LED animations and display modes',
                        'Create a capture-the-flag challenge on the badge'
                    ]
                },
                {
                    id: 'sg-23',
                    title: 'Portable WiFi Field Terminal',
                    type: 'build',
                    difficulty: 'field_agent',
                    platform: 'esp32-cyd',
                    buildTime: '150m',
                    cost: '$20',
                    status: 'ready',
                    href: 'sg-23-field-terminal.html',
                    skills: ['wifi-scanning', 'display-programming', 'firmware-dev', 'cpp'],
                    prerequisites: ['sg-06', 'sg-21'],
                    parts: [
                        { component: 'ESP32 CYD (2.8" TFT)', qty: 1, inKit: false },
                        { component: 'LiPo Battery + Charger Module', qty: 1, inKit: false },
                        { component: '3D Printed Case (optional)', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a battery-powered portable WiFi tool',
                        'Implement multiple scan modes (WiFi, BLE, deauth detect)',
                        'Create a touch-driven menu system',
                        'Add SD card logging for field operations'
                    ]
                },
                {
                    id: 'sg-24',
                    title: 'Network Anomaly Monitor',
                    type: 'build',
                    difficulty: 'field_agent',
                    platform: 'esp32-cyd',
                    buildTime: '120m',
                    cost: '$15',
                    status: 'ready',
                    href: 'sg-24-anomaly-monitor.html',
                    skills: ['packet-capture', 'wifi-scanning', 'display-programming', 'cpp'],
                    prerequisites: ['sg-08'],
                    parts: [
                        { component: 'ESP32 CYD (2.8" TFT)', qty: 1, inKit: false },
                        { component: 'MicroSD Card Module', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Establish baseline traffic patterns for a network',
                        'Detect statistical anomalies in packet flow',
                        'Alert on new devices, unusual protocols, or traffic spikes',
                        'Visualize anomaly scores on the TFT display'
                    ]
                },
                {
                    id: 'sg-25',
                    title: 'Pi Network IDS (Intrusion Detection)',
                    type: 'build',
                    difficulty: 'field_agent',
                    platform: 'raspberry-pi',
                    buildTime: '150m',
                    cost: '$80',
                    status: 'ready',
                    href: 'sg-25-network-ids.html',
                    skills: ['ids-ips', 'networking', 'linux-admin', 'python'],
                    prerequisites: ['sg-09'],
                    parts: [
                        { component: 'Raspberry Pi 4 (4GB)', qty: 1, inKit: false },
                        { component: 'MicroSD Card (32GB+)', qty: 1, inKit: false },
                        { component: 'USB-C Power Supply', qty: 1, inKit: false },
                        { component: 'Ethernet Cable', qty: 1, inKit: false },
                        { component: 'USB Ethernet Adapter (for inline tap)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Install and configure Suricata or Snort on Pi',
                        'Write custom IDS rules for your network',
                        'Build a real-time alert dashboard',
                        'Analyze and triage security events'
                    ]
                }
            ]
        },

        // =================================================================
        // ARCADE OPS — Retro gaming, emulators, arcade builds
        // =================================================================
        {
            id: 'arcade-ops',
            name: 'Arcade Ops',
            track: 'arcade-ops',
            icon: '../../assets/images/icons/icon-joystick.webp',
            description: 'Retro gaming builds — from simple ESP32 games to full arcade cabinets with emulation.',
            color: '#ec4899',
            projects: [
                {
                    id: 'sg-26',
                    title: 'ESP32 Pong: Your First Game Console',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'esp32-cyd',
                    buildTime: '60m',
                    cost: '$15',
                    status: 'ready',
                    href: 'sg-26-esp32-pong.html',
                    skills: ['display-programming', 'cpp', 'gpio'],
                    prerequisites: [],
                    parts: [
                        { component: 'ESP32 CYD (2.8" TFT)', qty: 1, inKit: false },
                        { component: 'Tactile Buttons (4x)', qty: 4, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a playable Pong game on the ESP32 CYD touchscreen',
                        'Understand game loops, frame timing, and sprite rendering',
                        'Handle touch and button input for paddle control',
                        'Add score tracking and sound effects via the buzzer'
                    ]
                },
                {
                    id: 'sg-27',
                    title: 'Handheld Game Boy: ESP32 Emulator',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'esp32-devkit',
                    buildTime: '120m',
                    cost: '$25',
                    status: 'ready',
                    href: 'sg-27-handheld-gameboy.html',
                    skills: ['firmware-dev', 'display-programming', 'cpp', 'gpio'],
                    prerequisites: ['sg-26'],
                    parts: [
                        { component: 'ESP32 DevKit V1', qty: 1, inKit: false },
                        { component: 'ILI9341 2.8" TFT Display (SPI)', qty: 1, inKit: false },
                        { component: 'Tactile Buttons (6x: D-pad + A/B)', qty: 6, inKit: false },
                        { component: 'Small Speaker or Piezo Buzzer', qty: 1, inKit: false },
                        { component: 'MicroSD Card Module', qty: 1, inKit: false },
                        { component: 'LiPo Battery (500mAh) + TP4056', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Flash a Game Boy emulator (Peanut-GB) onto ESP32',
                        'Wire a TFT display and button matrix for controls',
                        'Load ROMs from an SD card with a file browser menu',
                        'Add battery power for portable play'
                    ]
                },
                {
                    id: 'sg-28',
                    title: 'RetroPie Emulation Station',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'raspberry-pi',
                    buildTime: '90m',
                    cost: '$85',
                    status: 'ready',
                    href: 'sg-28-retropie-station.html',
                    skills: ['linux-admin', 'python', 'gpio'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi 4 (4GB)', qty: 1, inKit: false },
                        { component: 'MicroSD Card (32GB+)', qty: 1, inKit: false },
                        { component: 'USB-C Power Supply', qty: 1, inKit: false },
                        { component: 'USB Game Controller (2x)', qty: 2, inKit: false },
                        { component: 'HDMI Cable + Display/TV', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Flash and configure RetroPie on a Raspberry Pi',
                        'Set up emulators for NES, SNES, Genesis, Game Boy, and more',
                        'Configure controllers and custom keymaps',
                        'Customize themes, splash screens, and the EmulationStation UI'
                    ]
                },
                {
                    id: 'sg-29',
                    title: 'USB Arcade Controller Build',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'arduino-mega',
                    buildTime: '120m',
                    cost: '$35',
                    status: 'ready',
                    href: 'sg-29-arcade-controller.html',
                    skills: ['usb-protocol', 'arduino-ide', 'breadboarding', 'gpio'],
                    prerequisites: ['sg-28'],
                    parts: [
                        { component: 'Arduino Pro Micro (ATmega32U4)', qty: 1, inKit: false },
                        { component: 'Arcade Joystick (Sanwa-style)', qty: 1, inKit: false },
                        { component: 'Arcade Buttons (8x, 30mm)', qty: 8, inKit: false },
                        { component: 'Mounting Panel (MDF/acrylic)', qty: 1, inKit: false },
                        { component: 'Spade Connectors + Wire', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a custom USB arcade fight stick from scratch',
                        'Program an ATmega32U4 as a USB HID gamepad',
                        'Wire arcade buttons and joystick with proper pull-ups',
                        'Add LED button lighting and rapid-fire modes'
                    ]
                },
                {
                    id: 'sg-30',
                    title: 'Mini Arcade Cabinet',
                    type: 'build',
                    difficulty: 'field_agent',
                    platform: 'raspberry-pi',
                    buildTime: '180m',
                    cost: '$150',
                    status: 'ready',
                    href: 'sg-30-mini-arcade.html',
                    skills: ['linux-admin', 'gpio', 'display-programming', 'python'],
                    prerequisites: ['sg-28', 'sg-29'],
                    parts: [
                        { component: 'Raspberry Pi 4 (4GB)', qty: 1, inKit: false },
                        { component: '7" HDMI IPS Display', qty: 1, inKit: false },
                        { component: 'Arcade Joystick + 8 Buttons', qty: 1, inKit: false },
                        { component: 'Zero-Delay USB Encoder', qty: 1, inKit: false },
                        { component: 'Small Speakers (2x) + Amplifier', qty: 1, inKit: false },
                        { component: 'MDF/Acrylic Cabinet Panels', qty: 1, inKit: false },
                        { component: 'LED Marquee Strip', qty: 1, inKit: false },
                        { component: 'Power Supply + Splitter', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a complete tabletop arcade cabinet from scratch',
                        'Assemble cabinet with display, controls, and audio',
                        'Configure RetroPie with auto-launch and attract mode',
                        'Add LED marquee, coin counter sound effects, and cabinet art'
                    ]
                }
            ]
        },

        // =================================================================
        // FIELD PREP — Practical IT field skills, workstation builds
        // =================================================================
        {
            id: 'field-prep',
            name: 'Field Prep',
            track: 'field-prep',
            icon: '../../assets/images/icons/icon-tools.webp',
            description: 'Essential IT field skills — bootable media, drive imaging, workstation setup, and deployment kits.',
            color: '#94a3b8',
            projects: [
                {
                    id: 'sg-31',
                    title: 'Build a Bootable USB Drive',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'workstation',
                    buildTime: '45m',
                    cost: '$8',
                    status: 'ready',
                    href: 'sg-31-bootable-usb.html',
                    skills: ['linux-admin', 'usb-protocol'],
                    prerequisites: [],
                    parts: [
                        { component: 'USB Flash Drive (8GB+)', qty: 1, inKit: false },
                        { component: 'PC or Laptop', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Create bootable USB drives for Windows, Linux, and recovery tools',
                        'Understand BIOS vs UEFI boot modes and GPT vs MBR',
                        'Use Rufus, Ventoy, and dd to write bootable media',
                        'Build a multi-boot USB toolkit with Ventoy',
                        'Configure BIOS/UEFI boot order and Secure Boot'
                    ]
                },
                {
                    id: 'sg-32',
                    title: 'Build a USB Flash Drive from Scratch',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'rp2040-pico',
                    buildTime: '2-3h',
                    cost: '$12',
                    status: 'ready',
                    href: 'sg-32-build-usb-drive.html',
                    skills: ['usb-protocol', 'firmware-dev', 'physical-security'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi Pico or RP2040-Zero', qty: 1, inKit: false },
                        { component: 'MicroSD Breakout Board', qty: 1, inKit: false },
                        { component: 'MicroSD Card (any size)', qty: 1, inKit: false },
                        { component: 'Jumper Wires (6x male-to-male)', qty: 6, inKit: false },
                        { component: 'Breadboard (half-size)', qty: 1, inKit: false },
                        { component: 'USB Micro-B or USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Understand USB flash drive architecture at the component level',
                        'Wire an RP2040 to an SD card over SPI',
                        'Flash TinyUSB firmware for USB Mass Storage Class',
                        'Build a working USB storage device that any OS recognizes',
                        'Explain USB enumeration, device descriptors, and block storage protocol'
                    ]
                }
            ]
        },

        // =================================================================
        // RED TEAM HARDWARE — DIY offensive security tools
        // Build Hak5-class hardware from cheap microcontrollers
        // =================================================================
        {
            id: 'red-team-hw',
            name: 'Red Team Hardware',
            track: 'red-team-hw',
            icon: '../../assets/images/icons/icon-skull.webp',
            description: 'Build offensive security hardware from $4 microcontrollers. USB attack tools, keystroke injectors, network implants, WiFi auditing devices, and malicious cable detectors.',
            color: '#dc2626',
            projects: [
                {
                    id: 'sg-33',
                    title: 'USB Rubber Ducky Clone',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'rp2040-pico',
                    buildTime: '1h',
                    cost: '$4',
                    status: 'ready',
                    href: 'sg-33-rubber-ducky.html',
                    skills: ['usb-protocol', 'hid-injection', 'payload-dev'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi Pico', qty: 1, inKit: false },
                        { component: 'USB Micro-B Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Understand USB HID (Human Interface Device) protocol',
                        'Flash CircuitPython with HID library onto Pi Pico',
                        'Write DuckyScript-style keystroke injection payloads',
                        'Build a working keystroke injector that types at 1000+ WPM',
                        'Create payloads for recon, reverse shells, and data exfil'
                    ]
                },
                {
                    id: 'sg-34',
                    title: 'Bad USB Multi-Payload Tool',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'rp2040-pico',
                    buildTime: '2h',
                    cost: '$4',
                    status: 'ready',
                    href: 'sg-34-bad-usb.html',
                    skills: ['usb-protocol', 'hid-injection', 'payload-dev', 'firmware-dev'],
                    prerequisites: ['sg-33'],
                    parts: [
                        { component: 'Raspberry Pi Pico', qty: 1, inKit: false },
                        { component: 'USB Micro-B Cable', qty: 1, inKit: false },
                        { component: 'Tactile Button (optional)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Store multiple payloads with a selector mechanism',
                        'Detect target OS (Windows/Mac/Linux) and auto-select payload',
                        'Add storage mode for data exfiltration to onboard flash',
                        'Implement arming mode with LED status indicators',
                        'Understand Bash Bunny attack philosophy'
                    ]
                },
                {
                    id: 'sg-35',
                    title: 'WiFi Deauther & Scanner',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'esp32',
                    buildTime: '2-3h',
                    cost: '$8',
                    status: 'ready',
                    href: 'sg-35-wifi-deauther.html',
                    skills: ['wifi-security', 'rf-fundamentals', 'firmware-dev'],
                    prerequisites: [],
                    parts: [
                        { component: 'ESP32 DevKit or ESP8266 NodeMCU', qty: 1, inKit: false },
                        { component: 'USB Cable', qty: 1, inKit: false },
                        { component: 'OLED Display 0.96" I2C (optional)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Understand 802.11 management frames and deauthentication',
                        'Flash Marauder or Deauther firmware onto ESP32',
                        'Scan for nearby access points and clients',
                        'Perform authorized deauthentication testing',
                        'Add OLED display for portable field use'
                    ]
                },
                {
                    id: 'sg-36',
                    title: 'Inline USB Keylogger',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'rp2040-pico',
                    buildTime: '2h',
                    cost: '$8',
                    status: 'ready',
                    href: 'sg-36-usb-keylogger.html',
                    skills: ['usb-protocol', 'hid-injection', 'forensics'],
                    prerequisites: ['sg-33'],
                    parts: [
                        { component: 'Raspberry Pi Pico', qty: 1, inKit: false },
                        { component: 'USB Host Adapter/OTG Cable', qty: 1, inKit: false },
                        { component: 'MicroSD Breakout (optional)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Understand USB host vs device modes',
                        'Intercept USB HID traffic inline between keyboard and computer',
                        'Log keystrokes to onboard flash or MicroSD',
                        'Understand Key Croc functionality and detection methods',
                        'Implement timestamped logging with trigger words'
                    ]
                },
                {
                    id: 'sg-37',
                    title: 'Network Packet Sniffer',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'rp2040-pico',
                    buildTime: '2-3h',
                    cost: '$12',
                    status: 'ready',
                    href: 'sg-37-packet-sniffer.html',
                    skills: ['networking', 'packet-analysis', 'firmware-dev'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi Pico W', qty: 1, inKit: false },
                        { component: 'W5500 Ethernet Module', qty: 1, inKit: false },
                        { component: 'Ethernet Cable', qty: 1, inKit: false },
                        { component: 'Jumper Wires', qty: 6, inKit: false }
                    ],
                    outcomes: [
                        'Understand Ethernet frame structure and packet capture',
                        'Wire an Ethernet module to Pi Pico over SPI',
                        'Capture and log network packets to flash storage',
                        'Understand Packet Squirrel functionality',
                        'Implement selective capture filters (DNS, HTTP, credentials)'
                    ]
                },
                {
                    id: 'sg-38',
                    title: 'Portable WiFi Audit Station',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'esp32',
                    buildTime: '3-4h',
                    cost: '$20',
                    status: 'ready',
                    href: 'sg-38-wifi-audit.html',
                    skills: ['wifi-security', 'rf-fundamentals', 'penetration-testing'],
                    prerequisites: ['sg-35'],
                    parts: [
                        { component: 'ESP32-S3 DevKit', qty: 1, inKit: false },
                        { component: 'TFT Display 1.8" SPI', qty: 1, inKit: false },
                        { component: 'MicroSD Card Module', qty: 1, inKit: false },
                        { component: 'LiPo Battery + Charger Board', qty: 1, inKit: false },
                        { component: '3D Printed Case (optional)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a portable WiFi Pineapple-style audit device',
                        'Implement evil twin / rogue AP functionality',
                        'Capture WPA handshakes for offline cracking',
                        'Build a captive portal for credential harvesting (authorized testing)',
                        'Add battery power for field deployment'
                    ]
                },
                {
                    id: 'sg-39',
                    title: 'Malicious Cable Detector',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'rp2040-pico',
                    buildTime: '1h',
                    cost: '$4',
                    status: 'ready',
                    href: 'sg-39-cable-detector.html',
                    skills: ['usb-protocol', 'physical-security', 'forensics'],
                    prerequisites: [],
                    parts: [
                        { component: 'Raspberry Pi Pico', qty: 1, inKit: false },
                        { component: 'USB Micro-B Cable', qty: 1, inKit: false },
                        { component: 'LED + Resistor (optional)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Understand O.MG cable attack vectors',
                        'Detect anomalous USB device descriptors',
                        'Identify cables with hidden wireless implants',
                        'Build a simple USB cable analysis tool',
                        'Test cables for unexpected HID or mass storage endpoints'
                    ]
                },
                {
                    id: 'sg-40',
                    title: 'LAN Implant Device',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'rp2040-pico',
                    buildTime: '3h',
                    cost: '$15',
                    status: 'ready',
                    href: 'sg-40-lan-implant.html',
                    skills: ['networking', 'penetration-testing', 'firmware-dev'],
                    prerequisites: ['sg-37'],
                    parts: [
                        { component: 'Raspberry Pi Pico W', qty: 1, inKit: false },
                        { component: 'W5500 Ethernet Module', qty: 1, inKit: false },
                        { component: 'Ethernet Coupler', qty: 1, inKit: false },
                        { component: 'Small Enclosure', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build an inline network implant (LAN Turtle concept)',
                        'Implement man-in-the-middle packet inspection',
                        'Add reverse shell callback over WiFi',
                        'DNS spoofing and traffic redirection',
                        'Understand network implant detection and defense'
                    ]
                },
                {
                    id: 'sg-41',
                    title: 'RFID/NFC Cloner',
                    type: 'build',
                    difficulty: 'operative',
                    platform: 'esp32',
                    buildTime: '2h',
                    cost: '$15',
                    status: 'ready',
                    href: 'sg-41-rfid-cloner.html',
                    skills: ['rf-fundamentals', 'physical-security', 'access-control'],
                    prerequisites: [],
                    parts: [
                        { component: 'ESP32 DevKit', qty: 1, inKit: false },
                        { component: 'RC522 RFID Module (13.56MHz)', qty: 1, inKit: false },
                        { component: 'RFID Cards/Tags (writable)', qty: 5, inKit: false },
                        { component: 'OLED Display (optional)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Understand RFID/NFC protocols (MIFARE, ISO 14443)',
                        'Read and clone access badges',
                        'Identify default keys and vulnerable card sectors',
                        'Build a portable badge cloner for physical pentest engagements',
                        'Understand Proxmark3 capabilities and limitations'
                    ]
                },
                {
                    id: 'sg-42',
                    title: 'Flipper Zero DIY Alternative',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'esp32',
                    buildTime: '4-6h',
                    cost: '$25',
                    status: 'ready',
                    href: 'sg-42-flipper-diy.html',
                    skills: ['rf-fundamentals', 'usb-protocol', 'firmware-dev', 'physical-security'],
                    prerequisites: ['sg-33', 'sg-35', 'sg-41'],
                    parts: [
                        { component: 'ESP32-S3 DevKit', qty: 1, inKit: false },
                        { component: 'CC1101 Sub-GHz RF Module', qty: 1, inKit: false },
                        { component: 'RC522 RFID Module', qty: 1, inKit: false },
                        { component: 'IR LED + Receiver', qty: 1, inKit: false },
                        { component: 'TFT Display 1.8"', qty: 1, inKit: false },
                        { component: 'LiPo Battery + Charger', qty: 1, inKit: false },
                        { component: 'Navigation Buttons (5-way)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Build a multi-tool combining Sub-GHz, RFID, IR, and WiFi',
                        'Clone garage door openers and simple RF remotes',
                        'Emulate NFC badges and read RFID cards',
                        'Capture and replay IR commands (TV, AC, etc.)',
                        'Understand the Flipper Zero ecosystem and its capabilities'
                    ]
                }
            ]
        }
    ],

    // -------------------------------------------------------------------------
    // Helper methods
    // -------------------------------------------------------------------------

    /** Get all sections belonging to a track. */
    getTrackSections(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (!track) return [];
        return this.sections.filter(s => track.sections.includes(s.id));
    },

    /** Get a section by its id. */
    getSection(sectionId) {
        return this.sections.find(s => s.id === sectionId) || null;
    },

    /** Get a project by its id. */
    getProject(projectId) {
        for (const section of this.sections) {
            const proj = section.projects.find(p => p.id === projectId);
            if (proj) return proj;
        }
        return null;
    },

    /** Get total project count across all sections. */
    getTotalProjects() {
        return this.sections.reduce((sum, s) => sum + s.projects.length, 0);
    },

    /** Get completed count from a progress object. */
    getCompletedCount(progress) {
        return Object.keys(progress).filter(k => progress[k]).length;
    },

    /** Get section completion stats. */
    getSectionStats(sectionId, progress) {
        const section = this.getSection(sectionId);
        if (!section) return { total: 0, completed: 0, pct: 0 };
        const total = section.projects.length;
        const completed = section.projects.filter(p => progress[p.id]).length;
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },

    /** Get track completion stats. */
    getTrackStats(trackId, progress) {
        const sections = this.getTrackSections(trackId);
        const allProjects = sections.flatMap(s => s.projects);
        const total = allProjects.length;
        const completed = allProjects.filter(p => progress[p.id]).length;
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },

    /** Get all projects for a given platform. */
    getByPlatform(platformId) {
        const all = this.sections.flatMap(s => s.projects);
        return all.filter(p => p.platform === platformId);
    },

    /** Get all projects at a given difficulty. */
    getByDifficulty(difficulty) {
        const all = this.sections.flatMap(s => s.projects);
        return all.filter(p => p.difficulty === difficulty);
    },

    /** Get prerequisite chain for a project (recursive). */
    getPrerequisiteChain(projectId, visited) {
        visited = visited || new Set();
        if (visited.has(projectId)) return [];
        visited.add(projectId);
        const proj = this.getProject(projectId);
        if (!proj || !proj.prerequisites.length) return [];
        const chain = [];
        for (const preId of proj.prerequisites) {
            chain.push(...this.getPrerequisiteChain(preId, visited));
            chain.push(preId);
        }
        return [...new Set(chain)];
    },

    /** Get platform cost summary for a track. */
    getTrackPlatformCost(trackId) {
        const sections = this.getTrackSections(trackId);
        const projects = sections.flatMap(s => s.projects);
        const platformIds = [...new Set(projects.map(p => p.platform))];
        return platformIds.map(id => ({
            platform: this.platforms[id],
            platformId: id,
            projectCount: projects.filter(p => p.platform === id).length
        }));
    }
};
