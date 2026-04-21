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
        'beagle-zepto': {
            name: 'BeagleConnect Zepto',
            kit: 'BeagleConnect Zepto + mikroBUS Click Boards',
            approxCost: 20,
            icon: '../../assets/images/icons/icon-memory.webp',
            color: '#06d6a0',
            availability: 'prototype',
            description: 'ARM Cortex-M0+ board (target $1). Zephyr RTOS, mikroBUS expansion, Qwiic I2C. PROTOTYPE — not yet retail. Track will go live when hardware ships.'
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
        'firmware-dev': 'Firmware Development',
        'zephyr-rtos': 'Zephyr RTOS',
        'mikrobus': 'mikroBUS Expansion',
        'arm-bare-metal': 'ARM Bare-Metal',
        'iot-mesh': 'IoT Mesh Networking',
        'greybus': 'Greybus Protocol'
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
        },
        {
            id: 'home-lab-builds',
            name: 'Home Lab Builds',
            tagline: 'Build your infrastructure.',
            description: 'Raspberry Pi servers, PXE boot, NAS storage, media servers, VPN gateways, and Pi-hole DNS. Real infrastructure on real hardware.',
            icon: '../../assets/images/icons/icon-desktop.webp',
            color: '#06b6d4',
            colorDim: 'rgba(6, 182, 212, 0.15)',
            sections: ['home-lab-builds']
        },
        {
            id: 'sdr-radio',
            name: 'SDR & Radio',
            tagline: 'Listen to everything.',
            description: 'Software Defined Radio — receive ADS-B aircraft data, weather satellites, FM radio, pager signals, and analyze RF spectrum. RTL-SDR dongle projects.',
            icon: '../../assets/images/icons/icon-signal.webp',
            color: '#eab308',
            colorDim: 'rgba(234, 179, 8, 0.15)',
            sections: ['sdr-radio']
        },
        {
            id: 'iot-hacking',
            name: 'IoT Hacking',
            tagline: 'Own the smart home.',
            description: 'Attack and defend IoT devices — Zigbee sniffing, BLE exploitation, MQTT interception, smart plug takeover, and IoT forensics.',
            icon: '../../assets/images/icons/icon-plug.webp',
            color: '#f472b6',
            colorDim: 'rgba(244, 114, 182, 0.15)',
            sections: ['iot-hacking']
        },
        {
            id: 'pcb-design',
            name: 'PCB Design',
            tagline: 'Design your own boards.',
            description: 'From schematic to fabrication — KiCad, custom breakout boards, badge design, and PCB assembly. Turn breadboard prototypes into real products.',
            icon: '../../assets/images/icons/icon-memory.webp',
            color: '#10b981',
            colorDim: 'rgba(16, 185, 129, 0.15)',
            sections: ['pcb-design']
        },
        {
            id: 'drone-security',
            name: 'Drone Security',
            tagline: 'Control the airspace.',
            description: 'Drone builds, RF communication analysis, GPS spoofing detection, counter-drone systems, and FPV security. Aerial cybersecurity.',
            icon: '../../assets/images/icons/icon-target.webp',
            color: '#8b5cf6',
            colorDim: 'rgba(139, 92, 246, 0.15)',
            sections: ['drone-security']
        },
        {
            id: 'iot-sensor-mesh',
            name: 'IoT Sensor Mesh',
            tagline: 'Deploy the swarm.',
            description: 'ARM Cortex-M0+ boards running Zephyr RTOS — sensor nodes, mesh networks, and Greybus bridges. COMING SOON — hardware is in prototype stage.',
            icon: '../../assets/images/icons/icon-plug.webp',
            color: '#06d6a0',
            colorDim: 'rgba(6, 214, 160, 0.15)',
            sections: ['iot-sensor-mesh']
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
        // =================================================================
        // HOME LAB BUILDS — Raspberry Pi infrastructure projects
        // =================================================================
        ,{
            id: 'home-lab-builds',
            name: 'Home Lab Builds',
            track: 'home-lab-builds',
            icon: '../../assets/images/icons/icon-desktop.webp',
            description: 'Raspberry Pi servers, PXE boot, NAS storage, media servers, VPN gateways, and network services.',
            color: '#06b6d4',
            projects: [
                { id: 'sg-43', title: 'Raspberry Pi Headless Setup', type: 'build', difficulty: 'recruit', platform: 'raspberry-pi', buildTime: '30m', cost: '$45', status: 'ready', href: 'sg-43-pi-headless.html', skills: ['ssh', 'linux', 'networking'], prerequisites: [], parts: [{ component: 'Raspberry Pi 4/5', qty: 1, inKit: false }, { component: 'microSD Card (32GB+)', qty: 1, inKit: false }, { component: 'USB-C Power Supply', qty: 1, inKit: false }, { component: 'Ethernet Cable', qty: 1, inKit: false }], outcomes: ['Flash Raspberry Pi OS to SD card', 'Configure WiFi and SSH before first boot', 'Connect headless via SSH from any computer', 'Update and secure the base OS'] },
                { id: 'sg-44', title: 'Pi-hole DNS Ad Blocker', type: 'build', difficulty: 'recruit', platform: 'raspberry-pi', buildTime: '45m', cost: '$0', status: 'ready', href: 'sg-44-pi-hole.html', skills: ['dns', 'networking', 'linux-admin'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi (running)', qty: 1, inKit: false }], outcomes: ['Install and configure Pi-hole', 'Set Pi as network DNS server', 'Create custom blocklists and whitelists', 'Monitor DNS queries in the Pi-hole dashboard'] },
                { id: 'sg-45', title: 'PXE Boot Server', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '2h', cost: '$0', status: 'ready', href: 'sg-45-pxe-server.html', skills: ['pxe', 'dhcp', 'tftp', 'networking'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi or Linux Server', qty: 1, inKit: false }, { component: 'Target computer with PXE support', qty: 1, inKit: false }, { component: 'Ethernet switch', qty: 1, inKit: false }], outcomes: ['Configure dnsmasq for DHCP and TFTP', 'Serve boot images over the network', 'PXE boot Ubuntu installer on a client machine', 'Understand the full PXE boot sequence'] },
                { id: 'sg-46', title: 'NAS File Server with Samba', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1.5h', cost: '$15', status: 'ready', href: 'sg-46-nas-samba.html', skills: ['samba', 'storage', 'file-sharing', 'permissions'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi (running)', qty: 1, inKit: false }, { component: 'USB External Drive', qty: 1, inKit: false }], outcomes: ['Mount and format external storage on Linux', 'Install and configure Samba shares', 'Set user-level access permissions', 'Access shared files from Windows, macOS, and Linux'] },
                { id: 'sg-47', title: 'WireGuard VPN Gateway', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1.5h', cost: '$0', status: 'ready', href: 'sg-47-wireguard-vpn.html', skills: ['vpn', 'wireguard', 'networking', 'firewall'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi (running)', qty: 1, inKit: false }, { component: 'Port forwarding access on router', qty: 1, inKit: false }], outcomes: ['Install and configure WireGuard server', 'Generate client key pairs and configs', 'Connect from mobile and laptop remotely', 'Route all traffic through home network via VPN'] },
                { id: 'sg-48', title: 'Home Media Server with Jellyfin', type: 'build', difficulty: 'recruit', platform: 'raspberry-pi', buildTime: '1h', cost: '$15', status: 'ready', href: 'sg-48-jellyfin.html', skills: ['media-server', 'docker', 'networking'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi 4/5 (4GB+)', qty: 1, inKit: false }, { component: 'USB External Drive with media', qty: 1, inKit: false }], outcomes: ['Install Jellyfin media server', 'Organize and serve video/music/photo libraries', 'Access media from any device on the network', 'Configure transcoding and user accounts'] },
                { id: 'sg-49', title: 'Monitoring Dashboard with Grafana', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '2h', cost: '$0', status: 'ready', href: 'sg-49-grafana-monitor.html', skills: ['monitoring', 'grafana', 'prometheus', 'metrics'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi (running)', qty: 1, inKit: false }], outcomes: ['Install Prometheus and node_exporter', 'Configure Grafana with Prometheus data source', 'Build dashboards showing CPU, RAM, disk, network', 'Set up alerting rules for threshold breaches'] },
                { id: 'sg-50', title: 'Pi Cluster with Docker Swarm', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '3h', cost: '$135', status: 'ready', href: 'sg-50-pi-cluster.html', skills: ['clustering', 'docker', 'distributed-systems'], prerequisites: ['sg-43', 'sg-46'], parts: [{ component: 'Raspberry Pi 4/5', qty: 3, inKit: false }, { component: 'Ethernet Switch', qty: 1, inKit: false }, { component: 'Cluster Case/Stack', qty: 1, inKit: false }, { component: 'USB-C Power Supply', qty: 3, inKit: false }], outcomes: ['Build a 3-node Pi cluster with shared networking', 'Initialize Docker Swarm across the cluster', 'Deploy replicated services across nodes', 'Test failover by pulling a node from the cluster'] },
                { id: 'sg-51', title: 'Reverse Proxy with Nginx', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1h', cost: '$0', status: 'ready', href: 'sg-51-nginx-proxy.html', skills: ['nginx', 'reverse-proxy', 'ssl', 'networking'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi (running)', qty: 1, inKit: false }], outcomes: ['Install and configure Nginx as reverse proxy', 'Route multiple services through one IP on different subdomains', 'Add SSL/TLS with Let\'s Encrypt certbot', 'Understand proxy headers and upstream configuration'] },
                { id: 'sg-52', title: 'Automated Backup Station', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1.5h', cost: '$15', status: 'ready', href: 'sg-52-backup-station.html', skills: ['rsync', 'cron', 'bash', 'backup-strategy'], prerequisites: ['sg-43', 'sg-46'], parts: [{ component: 'Raspberry Pi (running)', qty: 1, inKit: false }, { component: 'USB External Drive', qty: 1, inKit: false }], outcomes: ['Configure rsync for incremental backups', 'Set up cron schedules for automated daily backups', 'Build a bash script that logs backup status', 'Implement 3-2-1 backup strategy on home hardware'] }
            ]
        },

        // =================================================================
        // SDR & RADIO — Software Defined Radio projects
        // =================================================================
        {
            id: 'sdr-radio',
            name: 'SDR & Radio',
            track: 'sdr-radio',
            icon: '../../assets/images/icons/icon-signal.webp',
            description: 'Software Defined Radio — receive aircraft data, weather satellites, FM radio, and analyze RF spectrum.',
            color: '#eab308',
            projects: [
                { id: 'sg-53', title: 'RTL-SDR Setup and First Reception', type: 'build', difficulty: 'recruit', platform: 'raspberry-pi', buildTime: '30m', cost: '$25', status: 'ready', href: 'sg-53-rtl-sdr-setup.html', skills: ['sdr', 'radio', 'rf-basics'], prerequisites: [], parts: [{ component: 'RTL-SDR Blog V4 Dongle', qty: 1, inKit: false }, { component: 'Dipole Antenna Kit', qty: 1, inKit: false }, { component: 'Computer with USB port', qty: 1, inKit: false }], outcomes: ['Install RTL-SDR drivers and software', 'Receive FM radio stations', 'Understand frequency, bandwidth, and modulation', 'Navigate the RF spectrum with SDR# or GQRX'] },
                { id: 'sg-54', title: 'ADS-B Aircraft Tracker', type: 'build', difficulty: 'recruit', platform: 'raspberry-pi', buildTime: '1h', cost: '$25', status: 'ready', href: 'sg-54-adsb-tracker.html', skills: ['adsb', 'aviation', 'data-visualization'], prerequisites: ['sg-53'], parts: [{ component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: '1090 MHz Antenna', qty: 1, inKit: false }, { component: 'Raspberry Pi', qty: 1, inKit: false }], outcomes: ['Receive ADS-B signals from aircraft at 1090 MHz', 'Install dump1090 decoder', 'Visualize aircraft positions on a web map', 'Feed data to FlightAware or ADS-B Exchange'] },
                { id: 'sg-55', title: 'Weather Satellite Image Receiver', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '2h', cost: '$30', status: 'ready', href: 'sg-55-weather-satellite.html', skills: ['satellite', 'noaa', 'image-processing', 'antenna'], prerequisites: ['sg-53'], parts: [{ component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: 'V-Dipole or QFH Antenna (137 MHz)', qty: 1, inKit: false }, { component: 'Raspberry Pi', qty: 1, inKit: false }], outcomes: ['Track NOAA satellite passes with predict software', 'Receive APT signals at 137 MHz', 'Decode satellite images from raw audio', 'Build an automated capture station with cron'] },
                { id: 'sg-56', title: 'Pager and POCSAG Decoder', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1h', cost: '$0', status: 'ready', href: 'sg-56-pager-decoder.html', skills: ['paging', 'pocsag', 'rf-monitoring'], prerequisites: ['sg-53'], parts: [{ component: 'RTL-SDR Dongle (with antenna)', qty: 1, inKit: false }], outcomes: ['Receive pager transmissions on 150-170 MHz', 'Decode POCSAG and FLEX protocols', 'Understand why unencrypted paging is a security risk', 'Monitor hospital/emergency paging frequencies (receive-only, legal)'] },
                { id: 'sg-57', title: 'RF Spectrum Analyzer', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1h', cost: '$0', status: 'ready', href: 'sg-57-spectrum-analyzer.html', skills: ['rf-analysis', 'spectrum', 'signal-identification'], prerequisites: ['sg-53'], parts: [{ component: 'RTL-SDR Dongle (with antenna)', qty: 1, inKit: false }], outcomes: ['Use rtl_power to scan wide frequency ranges', 'Generate heatmap visualizations of RF activity', 'Identify common signal types (FM, WiFi, Bluetooth, cellular)', 'Detect rogue transmitters in your environment'] },
                { id: 'sg-58', title: 'Ham Radio Digital Modes Receiver', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '1.5h', cost: '$0', status: 'ready', href: 'sg-58-digital-modes.html', skills: ['ham-radio', 'ft8', 'wsjtx', 'propagation'], prerequisites: ['sg-53'], parts: [{ component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: 'HF Upconverter (optional, for HF bands)', qty: 1, inKit: false }], outcomes: ['Receive FT8, PSK31, and RTTY digital signals', 'Decode amateur radio transmissions with WSJT-X', 'Understand HF propagation and skip distances', 'Map received stations on a world map'] },
                { id: 'sg-59', title: 'ISS Communication Monitor', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1h', cost: '$0', status: 'ready', href: 'sg-59-iss-monitor.html', skills: ['satellite', 'iss', 'sstv', 'amateur-radio'], prerequisites: ['sg-53'], parts: [{ component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: '2m Band Antenna (144-146 MHz)', qty: 1, inKit: false }], outcomes: ['Track ISS passes with satellite prediction software', 'Receive APRS packets from the ISS digipeater', 'Decode SSTV images transmitted from the ISS', 'Understand Doppler shift in satellite communications'] },
                { id: 'sg-60', title: 'LoRa Long-Range Communicator', type: 'build', difficulty: 'specialist', platform: 'esp32-devkit', buildTime: '2h', cost: '$20', status: 'ready', href: 'sg-60-lora-comms.html', skills: ['lora', 'mesh-networking', 'long-range-rf'], prerequisites: [], parts: [{ component: 'ESP32 with LoRa Module (TTGO T-Beam or Heltec)', qty: 2, inKit: false }, { component: '868/915 MHz Antenna', qty: 2, inKit: false }], outcomes: ['Configure LoRa parameters (spreading factor, bandwidth, coding rate)', 'Send and receive messages over 1+ km distances', 'Build a simple mesh network with Meshtastic firmware', 'Understand LoRa modulation and link budget'] },
                { id: 'sg-61', title: 'Car Key Fob Analyzer', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '1.5h', cost: '$0', status: 'ready', href: 'sg-61-keyfob-analyzer.html', skills: ['rf-security', 'replay-analysis', 'rolling-codes'], prerequisites: ['sg-53', 'sg-57'], parts: [{ component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: 'Your own car key fob', qty: 1, inKit: false }], outcomes: ['Capture 315/433 MHz key fob transmissions', 'Analyze signal structure and modulation', 'Understand rolling codes and why replay attacks fail on modern cars', 'Compare fixed-code vs rolling-code security'] },
                { id: 'sg-62', title: 'Emergency Radio Scanner', type: 'build', difficulty: 'recruit', platform: 'raspberry-pi', buildTime: '45m', cost: '$0', status: 'ready', href: 'sg-62-emergency-scanner.html', skills: ['scanning', 'trunking', 'emergency-services'], prerequisites: ['sg-53'], parts: [{ component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: 'Discone or wideband antenna', qty: 1, inKit: false }], outcomes: ['Scan public safety frequencies (police, fire, EMS)', 'Understand trunked radio systems (P25)', 'Use SDRTrunk to follow trunked conversations', 'Know the legal boundaries of radio monitoring'] }
            ]
        },

        // =================================================================
        // IOT HACKING — Smart device attack and defense
        // =================================================================
        {
            id: 'iot-hacking',
            name: 'IoT Hacking',
            track: 'iot-hacking',
            icon: '../../assets/images/icons/icon-plug.webp',
            description: 'Attack and defend IoT devices — Zigbee, BLE, MQTT, smart plugs, cameras, and embedded firmware.',
            color: '#f472b6',
            projects: [
                { id: 'sg-63', title: 'MQTT Broker and Sniffer', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1h', cost: '$0', status: 'ready', href: 'sg-63-mqtt-sniffer.html', skills: ['mqtt', 'iot-protocols', 'wireshark'], prerequisites: ['sg-43'], parts: [{ component: 'Raspberry Pi (running)', qty: 1, inKit: false }], outcomes: ['Install Mosquitto MQTT broker', 'Publish and subscribe to topics from CLI', 'Sniff MQTT traffic with Wireshark', 'Understand why unencrypted MQTT is dangerous'] },
                { id: 'sg-64', title: 'BLE Device Scanner and Enumerator', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1h', cost: '$0', status: 'ready', href: 'sg-64-ble-scanner.html', skills: ['ble', 'bluetooth', 'enumeration'], prerequisites: [], parts: [{ component: 'Raspberry Pi with Bluetooth', qty: 1, inKit: false }], outcomes: ['Scan for BLE devices with hcitool and bluetoothctl', 'Enumerate services and characteristics', 'Read and write BLE attributes', 'Understand GATT profiles and UUIDs'] },
                { id: 'sg-65', title: 'Smart Plug Takeover Lab', type: 'build', difficulty: 'specialist', platform: 'esp32-devkit', buildTime: '2h', cost: '$15', status: 'ready', href: 'sg-65-smart-plug-hack.html', skills: ['iot-exploitation', 'tuya', 'api-abuse'], prerequisites: ['sg-63'], parts: [{ component: 'Tuya-based Smart Plug', qty: 1, inKit: false }, { component: 'ESP32 DevKit', qty: 1, inKit: false }], outcomes: ['Intercept smart plug cloud API traffic', 'Flash custom firmware (Tasmota) to take local control', 'Remove cloud dependency from IoT devices', 'Understand the Tuya protocol and local key extraction'] },
                { id: 'sg-66', title: 'Zigbee Sniffer with CC2531', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '1.5h', cost: '$10', status: 'ready', href: 'sg-66-zigbee-sniffer.html', skills: ['zigbee', 'wireless-protocols', 'packet-analysis'], prerequisites: [], parts: [{ component: 'CC2531 USB Sniffer', qty: 1, inKit: false }, { component: 'Zigbee devices (smart bulbs, sensors)', qty: 1, inKit: false }], outcomes: ['Flash sniffer firmware to CC2531', 'Capture Zigbee traffic with Wireshark', 'Analyze Zigbee network formation and key exchange', 'Understand Zigbee security model and its weaknesses'] },
                { id: 'sg-67', title: 'IP Camera Vulnerability Lab', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '2h', cost: '$25', status: 'ready', href: 'sg-67-ip-camera-lab.html', skills: ['rtsp', 'default-credentials', 'firmware-analysis'], prerequisites: ['sg-43'], parts: [{ component: 'Cheap IP Camera (Tapo, Wyze, or generic)', qty: 1, inKit: false }, { component: 'Isolated network', qty: 1, inKit: false }], outcomes: ['Discover cameras with nmap on your network', 'Access RTSP streams with default credentials', 'Analyze camera firmware for hardcoded secrets', 'Secure an IP camera properly (change defaults, isolate VLAN, disable cloud)'] },
                { id: 'sg-68', title: 'ESP32 Rogue Access Point', type: 'build', difficulty: 'specialist', platform: 'esp32-devkit', buildTime: '1.5h', cost: '$8', status: 'ready', href: 'sg-68-rogue-ap.html', skills: ['wifi', 'social-engineering', 'captive-portal'], prerequisites: [], parts: [{ component: 'ESP32 DevKit', qty: 1, inKit: false }], outcomes: ['Flash ESP32 with captive portal firmware', 'Create a fake WiFi network that captures credentials', 'Understand evil twin attacks from the builder perspective', 'Build defenses: how to detect rogue access points'] },
                { id: 'sg-69', title: 'Home Automation Security Audit', type: 'build', difficulty: 'field_agent', platform: 'raspberry-pi', buildTime: '3h', cost: '$0', status: 'ready', href: 'sg-69-home-audit.html', skills: ['iot-audit', 'network-scanning', 'risk-assessment'], prerequisites: ['sg-63', 'sg-64', 'sg-66'], parts: [{ component: 'Raspberry Pi with tools', qty: 1, inKit: false }, { component: 'Your own smart home devices', qty: 1, inKit: false }], outcomes: ['Inventory all IoT devices on your network', 'Scan for open ports and default credentials', 'Test for unencrypted communication channels', 'Write a security audit report with remediation steps'] },
                { id: 'sg-70', title: 'Firmware Extraction and Analysis', type: 'build', difficulty: 'field_agent', platform: 'raspberry-pi', buildTime: '3h', cost: '$15', status: 'ready', href: 'sg-70-firmware-extraction.html', skills: ['firmware', 'binwalk', 'reverse-engineering'], prerequisites: ['sg-43'], parts: [{ component: 'IoT device with downloadable firmware', qty: 1, inKit: false }, { component: 'Linux workstation', qty: 1, inKit: false }], outcomes: ['Download firmware from manufacturer websites', 'Extract filesystem with binwalk', 'Find hardcoded credentials and API keys', 'Analyze startup scripts and service configurations'] },
                { id: 'sg-71', title: 'CoAP Protocol Lab', type: 'build', difficulty: 'operator', platform: 'esp32-devkit', buildTime: '1.5h', cost: '$8', status: 'ready', href: 'sg-71-coap-lab.html', skills: ['coap', 'iot-protocols', 'constrained-devices'], prerequisites: [], parts: [{ component: 'ESP32 DevKit', qty: 1, inKit: false }], outcomes: ['Implement a CoAP server on ESP32', 'Send GET/PUT/POST requests from a CoAP client', 'Compare CoAP vs HTTP for constrained devices', 'Understand observe pattern for real-time IoT updates'] },
                { id: 'sg-72', title: 'UART and Serial Port Hacking', type: 'build', difficulty: 'specialist', platform: 'arduino-mega', buildTime: '2h', cost: '$5', status: 'ready', href: 'sg-72-uart-hacking.html', skills: ['uart', 'serial', 'hardware-hacking', 'logic-analyzer'], prerequisites: ['sg-01'], parts: [{ component: 'USB-to-TTL Serial Adapter', qty: 1, inKit: false }, { component: 'Target IoT device with UART pads', qty: 1, inKit: false }, { component: 'Jumper wires', qty: 4, inKit: true }], outcomes: ['Identify UART TX/RX/GND pins on a PCB', 'Connect to a device serial console', 'Access bootloader and root shell via UART', 'Understand baud rate detection and serial protocol basics'] }
            ]
        },

        // =================================================================
        // PCB DESIGN — Custom board design and fabrication
        // =================================================================
        {
            id: 'pcb-design',
            name: 'PCB Design',
            track: 'pcb-design',
            icon: '../../assets/images/icons/icon-memory.webp',
            description: 'From schematic to fabrication — KiCad, custom boards, badge design, and PCB assembly.',
            color: '#10b981',
            projects: [
                { id: 'sg-73', title: 'KiCad Installation and First Schematic', type: 'build', difficulty: 'recruit', platform: 'raspberry-pi', buildTime: '1h', cost: '$0', status: 'ready', href: 'sg-73-kicad-intro.html', skills: ['kicad', 'schematic-capture', 'eda'], prerequisites: [], parts: [{ component: 'Computer with KiCad 8 installed', qty: 1, inKit: false }], outcomes: ['Install KiCad and navigate the interface', 'Draw a simple LED circuit schematic', 'Add components from the symbol library', 'Run electrical rules check (ERC)'] },
                { id: 'sg-74', title: 'PCB Layout from Schematic', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '2h', cost: '$0', status: 'ready', href: 'sg-74-pcb-layout.html', skills: ['pcb-layout', 'footprints', 'routing', 'design-rules'], prerequisites: ['sg-73'], parts: [{ component: 'KiCad project from SG-73', qty: 1, inKit: false }], outcomes: ['Assign footprints to schematic symbols', 'Place components on the PCB board', 'Route traces manually and with auto-router', 'Set design rules (trace width, clearance, via size)'] },
                { id: 'sg-75', title: 'Order Your First PCB from JLCPCB', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1h', cost: '$5', status: 'ready', href: 'sg-75-order-pcb.html', skills: ['gerber-export', 'fabrication', 'bom'], prerequisites: ['sg-74'], parts: [{ component: 'Completed KiCad PCB design', qty: 1, inKit: false }, { component: 'JLCPCB account (free)', qty: 1, inKit: false }], outcomes: ['Export Gerber files from KiCad', 'Upload to JLCPCB and configure order options', 'Understand PCB specs (layers, thickness, finish)', 'Generate BOM and pick-and-place files for assembly'] },
                { id: 'sg-76', title: 'Design a Custom Arduino Shield', type: 'build', difficulty: 'specialist', platform: 'arduino-mega', buildTime: '3h', cost: '$10', status: 'ready', href: 'sg-76-arduino-shield.html', skills: ['shield-design', 'headers', 'prototyping'], prerequisites: ['sg-74'], parts: [{ component: 'KiCad', qty: 1, inKit: false }, { component: 'Arduino Mega 2560', qty: 1, inKit: true }, { component: 'Pin headers', qty: 1, inKit: false }], outcomes: ['Design a PCB that stacks on Arduino headers', 'Add custom circuits (sensor inputs, LED outputs, relays)', 'Match the Arduino Mega pin layout and mounting holes', 'Solder and test the completed shield'] },
                { id: 'sg-77', title: 'Conference Badge PCB', type: 'build', difficulty: 'field_agent', platform: 'esp32-devkit', buildTime: '4h', cost: '$15', status: 'ready', href: 'sg-77-conference-badge.html', skills: ['badge-design', 'led-art', 'ble', 'custom-firmware'], prerequisites: ['sg-74', 'sg-75'], parts: [{ component: 'KiCad', qty: 1, inKit: false }, { component: 'ESP32 module', qty: 1, inKit: false }, { component: 'LEDs, buttons, OLED display', qty: 1, inKit: false }], outcomes: ['Design a wearable PCB badge with aesthetic layout', 'Include ESP32 for BLE and WiFi CTF challenges', 'Add LED patterns and OLED display', 'Write badge firmware with interactive menus and hidden flags'] },
                { id: 'sg-78', title: 'USB Breakout Board Design', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '2h', cost: '$5', status: 'ready', href: 'sg-78-usb-breakout.html', skills: ['usb', 'connector-design', 'signal-integrity'], prerequisites: ['sg-73', 'sg-74'], parts: [{ component: 'KiCad', qty: 1, inKit: false }, { component: 'USB-C connector footprint', qty: 1, inKit: false }], outcomes: ['Design a USB-C breakout board', 'Understand USB pinout and signal routing', 'Add ESD protection and decoupling capacitors', 'Learn about impedance matching for USB data lines'] },
                { id: 'sg-79', title: 'Solder Your First SMD Board', type: 'build', difficulty: 'operator', platform: 'raspberry-pi', buildTime: '1.5h', cost: '$20', status: 'ready', href: 'sg-79-smd-soldering.html', skills: ['smd-soldering', 'hot-air', 'flux', 'inspection'], prerequisites: ['sg-75'], parts: [{ component: 'SMD practice kit or your custom PCB', qty: 1, inKit: false }, { component: 'Soldering iron with fine tip', qty: 1, inKit: false }, { component: 'Solder paste and flux', qty: 1, inKit: false }, { component: 'Tweezers and magnifier', qty: 1, inKit: false }], outcomes: ['Apply solder paste to SMD pads', 'Place components with tweezers', 'Reflow with hot air or soldering iron', 'Inspect joints under magnification'] },
                { id: 'sg-80', title: 'Power Supply PCB Design', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '3h', cost: '$10', status: 'ready', href: 'sg-80-power-supply.html', skills: ['power-design', 'voltage-regulation', 'thermal'], prerequisites: ['sg-74'], parts: [{ component: 'KiCad', qty: 1, inKit: false }, { component: 'LM7805 or buck converter module', qty: 1, inKit: false }], outcomes: ['Design a regulated 5V power supply PCB', 'Calculate heat dissipation and add heatsink pads', 'Add input protection (reverse polarity, overcurrent)', 'Understand linear vs switching regulator tradeoffs'] },
                { id: 'sg-81', title: 'Sensor Board with I2C Bus', type: 'build', difficulty: 'specialist', platform: 'arduino-mega', buildTime: '2.5h', cost: '$10', status: 'ready', href: 'sg-81-i2c-sensor-board.html', skills: ['i2c', 'multi-sensor', 'bus-design'], prerequisites: ['sg-74', 'sg-02'], parts: [{ component: 'KiCad', qty: 1, inKit: false }, { component: 'BME280, MPU6050, BH1750 sensors', qty: 1, inKit: false }], outcomes: ['Design a multi-sensor board with shared I2C bus', 'Add proper pull-up resistors and decoupling', 'Route I2C traces with correct impedance', 'Write Arduino code to read all sensors sequentially'] },
                { id: 'sg-82', title: 'RF PCB Design Fundamentals', type: 'build', difficulty: 'field_agent', platform: 'raspberry-pi', buildTime: '3h', cost: '$0', status: 'ready', href: 'sg-82-rf-pcb-design.html', skills: ['rf-design', 'impedance-matching', 'ground-planes', 'antenna-trace'], prerequisites: ['sg-74'], parts: [{ component: 'KiCad', qty: 1, inKit: false }], outcomes: ['Understand why RF PCB design differs from digital', 'Design a 50-ohm microstrip trace', 'Create proper ground planes for RF circuits', 'Add matching networks and antenna connections'] }
            ]
        },

        // =================================================================
        // DRONE SECURITY — Aerial cybersecurity
        // =================================================================
        {
            id: 'drone-security',
            name: 'Drone Security',
            track: 'drone-security',
            icon: '../../assets/images/icons/icon-target.webp',
            description: 'Drone builds, RF analysis, GPS spoofing detection, counter-drone systems, and FPV security.',
            color: '#8b5cf6',
            projects: [
                { id: 'sg-83', title: 'Build a FPV Drone from Kit', type: 'build', difficulty: 'operator', platform: 'esp32-devkit', buildTime: '4h', cost: '$120', status: 'ready', href: 'sg-83-fpv-drone-build.html', skills: ['drone', 'soldering', 'pid-tuning', 'betaflight'], prerequisites: [], parts: [{ component: 'FPV Drone Frame Kit (5")', qty: 1, inKit: false }, { component: 'Flight Controller (F4/F7)', qty: 1, inKit: false }, { component: 'ESC (4-in-1)', qty: 1, inKit: false }, { component: 'Motors (2306)', qty: 4, inKit: false }, { component: 'FPV Camera + VTX', qty: 1, inKit: false }, { component: 'FPV Goggles', qty: 1, inKit: false }, { component: 'Radio Transmitter', qty: 1, inKit: false }, { component: 'LiPo Battery', qty: 1, inKit: false }], outcomes: ['Assemble a complete FPV quadcopter', 'Flash and configure Betaflight firmware', 'Tune PID loops for stable flight', 'Understand ESC protocols (DShot) and motor timing'] },
                { id: 'sg-84', title: 'Drone RF Communication Analysis', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '2h', cost: '$0', status: 'ready', href: 'sg-84-drone-rf-analysis.html', skills: ['rf-analysis', 'drone-protocols', 'sdr'], prerequisites: ['sg-53', 'sg-83'], parts: [{ component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: 'Drone (any consumer model)', qty: 1, inKit: false }], outcomes: ['Identify drone control frequencies (2.4 GHz, 5.8 GHz)', 'Capture drone telemetry with SDR', 'Analyze video downlink signals', 'Understand frequency hopping spread spectrum (FHSS)'] },
                { id: 'sg-85', title: 'GPS Spoofing Detection System', type: 'build', difficulty: 'specialist', platform: 'esp32-devkit', buildTime: '2h', cost: '$15', status: 'ready', href: 'sg-85-gps-spoof-detect.html', skills: ['gps', 'gnss', 'spoofing-detection', 'sensor-fusion'], prerequisites: [], parts: [{ component: 'ESP32 DevKit', qty: 1, inKit: false }, { component: 'u-blox GPS Module (NEO-6M/M8N)', qty: 1, inKit: false }, { component: 'OLED Display', qty: 1, inKit: false }], outcomes: ['Parse NMEA sentences from GPS module', 'Detect GPS spoofing indicators (sudden jumps, impossible speeds)', 'Compare GPS position with known WiFi geolocation', 'Display spoofing alerts on OLED screen'] },
                { id: 'sg-86', title: 'Counter-Drone Detection Station', type: 'build', difficulty: 'field_agent', platform: 'raspberry-pi', buildTime: '3h', cost: '$30', status: 'ready', href: 'sg-86-counter-drone.html', skills: ['drone-detection', 'rf-monitoring', 'acoustic'], prerequisites: ['sg-53', 'sg-57'], parts: [{ component: 'Raspberry Pi', qty: 1, inKit: false }, { component: 'RTL-SDR Dongle', qty: 1, inKit: false }, { component: 'USB Microphone', qty: 1, inKit: false }, { component: 'Directional antenna', qty: 1, inKit: false }], outcomes: ['Detect drone control signals on 2.4/5.8 GHz', 'Identify drone motor signatures via acoustic analysis', 'Log detection events with timestamps and signal strength', 'Build a web dashboard showing drone alerts'] },
                { id: 'sg-87', title: 'MAVLink Protocol Analyzer', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '2h', cost: '$0', status: 'ready', href: 'sg-87-mavlink-analyzer.html', skills: ['mavlink', 'autopilot', 'telemetry', 'protocol-analysis'], prerequisites: ['sg-83'], parts: [{ component: 'ArduPilot SITL (software simulator)', qty: 1, inKit: false }, { component: 'Python 3 with pymavlink', qty: 1, inKit: false }], outcomes: ['Understand MAVLink protocol structure', 'Parse telemetry messages (heartbeat, GPS, attitude)', 'Inject waypoint commands via MAVLink', 'Identify security risks in unauthenticated MAVLink'] },
                { id: 'sg-88', title: 'Drone Geofencing System', type: 'build', difficulty: 'operator', platform: 'esp32-devkit', buildTime: '2h', cost: '$15', status: 'ready', href: 'sg-88-geofencing.html', skills: ['geofencing', 'gps', 'flight-restrictions'], prerequisites: ['sg-85'], parts: [{ component: 'ESP32 DevKit', qty: 1, inKit: false }, { component: 'GPS Module', qty: 1, inKit: false }, { component: 'Buzzer', qty: 1, inKit: false }], outcomes: ['Define geofence boundaries as GPS coordinates', 'Calculate point-in-polygon for real-time position checks', 'Trigger alerts when leaving the geofenced area', 'Understand FAA drone regulations and no-fly zones'] },
                { id: 'sg-89', title: 'FPV Video Link Security', type: 'build', difficulty: 'specialist', platform: 'raspberry-pi', buildTime: '2h', cost: '$0', status: 'ready', href: 'sg-89-fpv-video-security.html', skills: ['video-link', 'analog-digital', 'encryption', '5.8ghz'], prerequisites: ['sg-83', 'sg-84'], parts: [{ component: 'FPV system (from SG-83)', qty: 1, inKit: false }, { component: 'RTL-SDR or compatible 5.8 GHz receiver', qty: 1, inKit: false }], outcomes: ['Compare analog vs digital FPV link security', 'Understand why analog FPV is unencrypted and interceptable', 'Analyze DJI O3/O4 encrypted video protocol', 'Build a video receiver to demonstrate interception risk'] },
                { id: 'sg-90', title: 'Autonomous Waypoint Mission', type: 'build', difficulty: 'field_agent', platform: 'raspberry-pi', buildTime: '3h', cost: '$0', status: 'ready', href: 'sg-90-autonomous-mission.html', skills: ['autopilot', 'waypoints', 'mission-planning', 'ardupilot'], prerequisites: ['sg-87'], parts: [{ component: 'ArduPilot SITL simulator', qty: 1, inKit: false }, { component: 'QGroundControl or Mission Planner', qty: 1, inKit: false }], outcomes: ['Plan a multi-waypoint mission in QGroundControl', 'Upload and execute mission via MAVLink', 'Monitor telemetry during autonomous flight', 'Implement return-to-launch and failsafe behaviors'] },
                { id: 'sg-91', title: 'Drone Forensics Lab', type: 'build', difficulty: 'field_agent', platform: 'raspberry-pi', buildTime: '3h', cost: '$0', status: 'ready', href: 'sg-91-drone-forensics.html', skills: ['forensics', 'flight-logs', 'data-recovery', 'evidence'], prerequisites: ['sg-83'], parts: [{ component: 'Drone with flight logs (any model)', qty: 1, inKit: false }, { component: 'SD card reader', qty: 1, inKit: false }], outcomes: ['Extract flight logs from drone SD card and internal storage', 'Parse .bin and .log files with Mission Planner', 'Reconstruct flight path on a map from GPS data', 'Identify pilot location from takeoff coordinates and telemetry'] },
                { id: 'sg-92', title: 'Swarm Communication Simulator', type: 'build', difficulty: 'field_agent', platform: 'raspberry-pi', buildTime: '3h', cost: '$0', status: 'ready', href: 'sg-92-swarm-sim.html', skills: ['swarm', 'multi-agent', 'mesh-networking', 'simulation'], prerequisites: ['sg-87', 'sg-90'], parts: [{ component: 'Python 3 with matplotlib', qty: 1, inKit: false }, { component: 'ArduPilot SITL (multiple instances)', qty: 1, inKit: false }], outcomes: ['Simulate multiple drones communicating via MAVLink', 'Implement basic swarm behaviors (formation, follow-the-leader)', 'Visualize swarm positions in real time', 'Analyze communication overhead and failure modes'] }
            ]
        },

        // =================================================================
        // IOT SENSOR MESH — BeagleConnect Zepto, Zephyr, mikroBUS
        // =================================================================
        {
            id: 'iot-sensor-mesh',
            name: 'IoT Sensor Mesh',
            track: 'iot-sensor-mesh',
            icon: '../../assets/images/icons/icon-plug.webp',
            description: 'BeagleConnect Zepto projects — ARM Cortex-M0+ boards running Zephyr RTOS with mikroBUS sensor expansion. PROTOTYPE — projects go live when hardware ships.',
            color: '#06d6a0',
            projects: [
                {
                    id: 'sg-93',
                    title: 'Zepto Blink: Your First Zephyr RTOS Program',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'beagle-zepto',
                    buildTime: '45m',
                    cost: '$5',
                    status: 'coming-soon',
                    href: 'sg-93-zepto-blink.html',
                    skills: ['zephyr-rtos', 'gpio', 'cpp'],
                    prerequisites: [],
                    parts: [
                        { component: 'BeagleConnect Zepto', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Set up the Zephyr RTOS development environment',
                        'Understand the Cortex-M0+ boot process',
                        'Write and flash a blink program via USB bootloader',
                        'Control the onboard RGB LED with GPIO'
                    ]
                },
                {
                    id: 'sg-94',
                    title: 'mikroBUS Sensor Click: I2C Temperature + Humidity',
                    type: 'build',
                    difficulty: 'recruit',
                    platform: 'beagle-zepto',
                    buildTime: '60m',
                    cost: '$20',
                    status: 'coming-soon',
                    href: 'sg-94-mikrobus-sensor.html',
                    skills: ['mikrobus', 'sensor-integration', 'serial-comms', 'zephyr-rtos'],
                    prerequisites: ['sg-93'],
                    parts: [
                        { component: 'BeagleConnect Zepto', qty: 1, inKit: false },
                        { component: 'Weather Click Board (BME280)', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Install a mikroBUS Click board without soldering',
                        'Read temperature, humidity, and pressure over I2C',
                        'Output sensor data over USB serial',
                        'Understand the mikroBUS pin standard'
                    ]
                },
                {
                    id: 'sg-95',
                    title: 'Multi-Node Sensor Array: 3 Zeptos, 1 Dashboard',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'beagle-zepto',
                    buildTime: '90m',
                    cost: '$75',
                    status: 'coming-soon',
                    href: 'sg-95-multi-node-array.html',
                    skills: ['iot-mesh', 'sensor-integration', 'python', 'serial-comms'],
                    prerequisites: ['sg-94'],
                    parts: [
                        { component: 'BeagleConnect Zepto', qty: 3, inKit: false },
                        { component: 'Weather Click Board (BME280)', qty: 1, inKit: false },
                        { component: 'Light Sensor Click Board', qty: 1, inKit: false },
                        { component: 'Motion Click Board (PIR)', qty: 1, inKit: false },
                        { component: 'USB Hub (4-port)', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Deploy 3 sensor nodes reading different environmental data',
                        'Collect data from all nodes via a Python aggregator script',
                        'Build a live terminal dashboard showing all sensors',
                        'Understand distributed sensor architectures'
                    ]
                },
                {
                    id: 'sg-96',
                    title: 'Greybus Bridge: Zepto Peripherals on Linux (Experimental)',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'beagle-zepto',
                    buildTime: '2h',
                    cost: '$60',
                    status: 'coming-soon',
                    href: 'sg-96-greybus-bridge.html',
                    skills: ['greybus', 'linux-admin', 'zephyr-rtos', 'mikrobus'],
                    prerequisites: ['sg-94'],
                    parts: [
                        { component: 'BeagleConnect Zepto', qty: 1, inKit: false },
                        { component: 'Raspberry Pi 4/5', qty: 1, inKit: false },
                        { component: 'Any mikroBUS Click Board', qty: 1, inKit: false },
                        { component: 'USB-C Cable', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Flash BeagleConnect Greybus firmware to the Zepto',
                        'Connect Zepto to Raspberry Pi via USB',
                        'Access Click board sensors as native Linux devices',
                        'Understand Greybus protocol and hardware abstraction'
                    ]
                },
                {
                    id: 'sg-97',
                    title: 'IoT Security Audit: Sniff, Analyze, Harden',
                    type: 'build',
                    difficulty: 'specialist',
                    platform: 'beagle-zepto',
                    buildTime: '2h',
                    cost: '$80',
                    status: 'coming-soon',
                    href: 'sg-97-iot-security-audit.html',
                    skills: ['iot-mesh', 'packet-capture', 'python', 'encryption'],
                    prerequisites: ['sg-95', 'sg-96'],
                    parts: [
                        { component: 'BeagleConnect Zepto', qty: 3, inKit: false },
                        { component: 'Raspberry Pi 4/5', qty: 1, inKit: false },
                        { component: 'USB Hub', qty: 1, inKit: false }
                    ],
                    outcomes: [
                        'Capture serial traffic between Zepto nodes',
                        'Identify plaintext sensor data as a vulnerability',
                        'Implement a simple encryption layer on sensor payloads',
                        'Write a security audit report for the IoT deployment'
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
