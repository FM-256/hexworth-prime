/* ============================================================
   CTF ARENA — Box B11: The Silent Sensor
   Hardware/Embedded Systems Troubleshooting | Data Mine
   Config: serial console, firmware, sensors, flags, hints, lore
   ============================================================ */

const B11Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Silent Sensor',
    subtitle: 'Hardware Troubleshooting — Embedded Systems & Communication Protocols',
    difficulty: 'Intermediate-Advanced',
    accent: '#f59e0b',
    storageKey: 'hexworth_ctf_b11',
    registryId: 'b11-silent-sensor',
    trackerKey: 'ctf_b11',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Initial Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to the gateway and assess the state of SENSOR-MONITOR-01. Identify available interfaces.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082'],
            unlocks: ['serial-diag'],
            locked: false
        },
        {
            id: 'serial-diag',
            name: 'Serial Diagnostics',
            icon: '\uD83D\uDD0C',
            description: 'Connect to the sensor via serial console. Diagnose communication parameter mismatches.',
            requiredFlags: [],
            mitre: ['T1120', 'T1005'],
            unlocks: ['firmware-analysis'],
            locked: true
        },
        {
            id: 'firmware-analysis',
            name: 'Firmware Analysis',
            icon: '\u2699\uFE0F',
            description: 'Inspect firmware configuration and identify the root cause of the data transmission failure.',
            requiredFlags: ['user'],
            mitre: ['T1195.003', 'T1542.001'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation & Verification',
            icon: '\u2705',
            description: 'Apply the fix and verify that SENSOR-MONITOR-01 transmits valid environmental data.',
            requiredFlags: ['root'],
            mitre: ['T1562.001'],
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
                title: 'Assess the gateway environment',
                tip: 'Open the Terminal and run: dmesg or ls /dev/tty* to find available serial devices.',
                trigger: { event: 'command', match: { cmd: 'contains:dmesg' } }
            },
            {
                title: 'Connect to the sensor via serial',
                tip: 'Use screen or minicom to connect: screen /dev/ttyS0 115200',
                trigger: { event: 'command', match: { cmd: 'contains:screen' } }
            },
            {
                title: 'Diagnose the baud rate mismatch',
                tip: 'The output is garbled at 115200. Try different baud rates: screen /dev/ttyS0 9600',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inspect and fix the firmware config',
                tip: 'Check /opt/sensor/firmware.conf and use esptool.py to reflash with correct parameters.',
                trigger: { event: 'command', match: { cmd: 'contains:esptool' } }
            },
            {
                title: 'Verify sensor data transmission',
                tip: 'After applying the fix, read the sensor output for valid environmental data containing the root flag.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity -- Hardware/embedded misconfiguration', skill: 'Serial Protocol Analysis' },
            { flagId: 'user', objective: '2.3', description: 'Summarize vulnerabilities associated with embedded systems', skill: 'Embedded Device Diagnostics' },
            { flagId: 'root', objective: '3.1', description: 'Compare and contrast security implications of different architecture models -- Embedded systems', skill: 'Firmware Remediation' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security -- IoT/SCADA', skill: 'Sensor Calibration Verification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Data Mine Gateway BIOS v2.8.3',
            'Initializing hardware...',
            'Memory Test: 4096 MB OK',
            'Detecting drives... /dev/mmcblk0 (32GB eMMC)',
            'I2C bus 0: 3 devices detected',
            'SPI bus 0: 1 device detected',
            'UART0: /dev/ttyS0 ready',
            'Boot device: /dev/mmcblk0p1',
            'Loading kernel...'
        ],
        grubEntries: [
            'Data Mine Gateway OS (FreeRTOS Bridge)',
            'Data Mine Gateway OS (Recovery)',
            'Hardware Diagnostics Mode'
        ],
        loginUser: 'engineer'
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
        user: 'engineer',
        hostname: 'gw-datamine',
        startDir: '/home/engineer',
        welcome: 'Data Mine Gateway OS v2.8.3 (FreeRTOS Bridge)\nSENSOR-MONITOR-01 status: OFFLINE — no data received in 4h 23m\n\nType \'help\' for available commands.\nCritical: Environmental monitoring blind in Sector 7-G\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DEVICE DATA
    // ═══════════════════════════════════════════════════════

    _sensorData: {
        deviceId: 'SENSOR-MONITOR-01',
        chipset: 'ESP32-WROOM-32E',
        firmwareVersion: 'v1.4.2-beta',
        expectedBaud: 115200,
        actualBaud: 9600,
        serialConfig: { dataBits: 8, parity: 'none', stopBits: 1 },
        sensorReadings: [
            { sensor: 'GAS-CH4', value: 'NaN', unit: 'ppm', status: 'ERROR', calibrated: 'Temperature: 23.7C, CH4: 142ppm, CO: 3.2ppm, Seismic: 0.02g' },
            { sensor: 'GAS-CO', value: '0.0', unit: 'ppm', status: 'STALE', calibrated: 'CO: 3.2ppm' },
            { sensor: 'TEMP-INT', value: '-127.0', unit: 'C', status: 'ERROR', calibrated: 'Temperature: 23.7C' },
            { sensor: 'SEISMIC-Z', value: '0.0', unit: 'g', status: 'STALE', calibrated: 'Seismic-Z: 0.02g' }
        ],
        firmwareConfig: {
            uart_baud: 9600,
            uart_tx_pin: 17,
            uart_rx_pin: 16,
            wifi_ssid: 'DATAMINE-IOT',
            wifi_pass: '',
            mqtt_broker: '10.10.77.1',
            mqtt_topic: 'mine/sector7g/env',
            deep_sleep_ms: 500,
            sensor_poll_interval_ms: 1000,
            transmit_interval_ms: 5000
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
            text: 'The sensor device is connected via UART on /dev/ttyS0. The gateway expects 115200 baud, but the device may be transmitting at a different rate. Try common baud rates.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use "screen /dev/ttyS0 9600" to connect at 9600 baud. If the output becomes readable, you have found the mismatch. The incorrect baud rate IS the user flag.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Check /opt/sensor/firmware.conf for the misconfigured uart_baud value. The firmware was compiled with 9600 instead of 115200. Also check the wifi_pass field -- it is empty, blocking MQTT transmission.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After fixing the baud rate in firmware.conf and reflashing with esptool.py, reconnect at the correct baud rate. The first valid sensor reading contains the root flag: "Temperature: 23.7C, CH4: 142ppm, CO: 3.2ppm, Seismic: 0.02g"',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Deep within the subterranean levels of the Data Mine, automated environmental sensors are crucial for detecting toxic gas leaks, seismic shifts, and structural instabilities. SENSOR-MONITOR-01, a custom-built ESP32 device, has gone silent. Its status LED flickers erratically, but no data reaches the central monitoring station. The mine\'s automated safety protocols are now blind to Sector 7-G.',
        scenario: 'A firmware update was pushed to SENSOR-MONITOR-01 last week by a junior embedded engineer. The update was supposed to optimize power consumption by adjusting deep sleep intervals. However, the engineer accidentally changed the UART baud rate from 115200 to 9600 in the firmware configuration, and left the Wi-Fi password field blank. The gateway still listens at 115200 baud, so all incoming data appears as garbled noise. Additionally, the empty Wi-Fi credentials prevent MQTT data transmission to the central station.',
        outro: 'SENSOR-MONITOR-01 is back online. Valid environmental data flows to the central monitoring station once more. Sector 7-G is no longer blind. The methane readings are within normal parameters -- for now. The Data Mine endures.',
        ecer: {
            executive: 'No change management process for firmware deployments to critical safety systems',
            culture: 'Firmware updates pushed without peer review or staging environment validation',
            employee: 'Junior engineer modified serial parameters during an unrelated power optimization task',
            regulatory: 'No automated validation of communication parameters after firmware flash'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Sensor Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.77.1/sensor-dashboard/',

        pages: {
            '/sensor-dashboard/': {
                title: 'Data Mine Sensor Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#f59e0b; font-size:1.6rem; font-family:monospace; margin-bottom:4px;">Data Mine Sensor Dashboard</h1>
                        <div style="color:#888; font-size:0.8rem;">Central Monitoring Station &mdash; Sector 7-G Environmental</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px; margin-bottom:16px;">
                            <div style="color:#f59e0b; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">SENSOR-MONITOR-01</div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.8rem;">
                                <div style="color:#888;">Status:</div><div style="color:#e74c3c; font-weight:bold;">OFFLINE</div>
                                <div style="color:#888;">Last Data:</div><div style="color:#e74c3c;">4h 23m ago</div>
                                <div style="color:#888;">Chipset:</div><div style="color:#ccc;">ESP32-WROOM-32E</div>
                                <div style="color:#888;">Firmware:</div><div style="color:#ccc;">v1.4.2-beta</div>
                                <div style="color:#888;">MQTT Topic:</div><div style="color:#ccc;">mine/sector7g/env</div>
                                <div style="color:#888;">MQTT Status:</div><div style="color:#e74c3c;">DISCONNECTED</div>
                            </div>
                        </div>

                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px;">
                            <div style="color:#f59e0b; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">Sensor Readings (Last Known)</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="border-bottom:1px solid #333;">
                                        <th style="padding:6px; text-align:left; color:#f59e0b;">Sensor</th>
                                        <th style="padding:6px; text-align:left; color:#f59e0b;">Value</th>
                                        <th style="padding:6px; text-align:left; color:#f59e0b;">Unit</th>
                                        <th style="padding:6px; text-align:left; color:#f59e0b;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding:5px 6px; color:#ccc;">GAS-CH4</td><td style="color:#e74c3c;">NaN</td><td style="color:#888;">ppm</td><td style="color:#e74c3c;">ERROR</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">GAS-CO</td><td style="color:#e74c3c;">0.0</td><td style="color:#888;">ppm</td><td style="color:#e74c3c;">STALE</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">TEMP-INT</td><td style="color:#e74c3c;">-127.0</td><td style="color:#888;">C</td><td style="color:#e74c3c;">ERROR</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">SEISMIC-Z</td><td style="color:#e74c3c;">0.0</td><td style="color:#888;">g</td><td style="color:#e74c3c;">STALE</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="background:#2d1b1b; border:1px solid #e74c3c33; border-radius:6px; padding:12px; margin-top:16px; color:#e74c3c; font-size:0.8rem;">
                            ALERT: No valid telemetry from Sector 7-G for 4+ hours. Safety protocols degraded. Investigate immediately.
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (gateway machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'engineer': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: SENSOR-MONITOR-01 (ESP32 via /dev/ttyS0)\nObjective: Diagnose and restore environmental sensor data\n\nKnown facts:\n- Device is powered on, LED flickering erratically\n- No data reaching central monitoring station\n- Last firmware update: 7 days ago (power optimization)\n- Gateway expects 115200 baud on /dev/ttyS0\n\nSteps:\n1. Connect to sensor via serial console\n2. Diagnose communication issues (baud rate, parity, etc.)\n3. Inspect firmware configuration\n4. Apply fix and verify data flow\n5. Find both flags (user.txt + root.txt)\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'dmesg | grep tty\nls /dev/tty*\nscreen /dev/ttyS0 115200\ncat /opt/sensor/firmware.conf\nping 10.10.77.1'
                                },
                                'sensor-docs': {
                                    type: 'dir',
                                    children: {
                                        'esp32-pinout.txt': {
                                            type: 'file',
                                            content: 'ESP32-WROOM-32E Pin Configuration:\n  GPIO16 (RX2) -> UART RX\n  GPIO17 (TX2) -> UART TX\n  GPIO21 (SDA) -> I2C Data (sensors)\n  GPIO22 (SCL) -> I2C Clock (sensors)\n  GPIO34 (ADC6) -> Gas Sensor Analog\n  GPIO35 (ADC7) -> Seismic Sensor Analog\n  3V3 -> Sensor Power Rail\n  GND -> Common Ground\n\nDefault UART: 115200 8N1'
                                        },
                                        'changelog.txt': {
                                            type: 'file',
                                            content: 'SENSOR-MONITOR-01 Firmware Changelog\n\nv1.4.2-beta (2026-03-12) — J. Torres\n  - Optimized deep sleep interval (was 5000ms, now 500ms)\n  - Adjusted UART configuration for power savings\n  - TODO: Update Wi-Fi credentials for new SSID\n\nv1.4.1 (2026-02-28) — S. Nakamura\n  - Fixed CH4 sensor calibration offset\n  - Added seismic sensor Z-axis monitoring\n  - Verified 115200 baud UART communication\n\nv1.4.0 (2026-01-15) — S. Nakamura\n  - Initial multi-sensor support\n  - MQTT telemetry to central station\n  - Wi-Fi auto-reconnect logic'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'sensor': {
                            type: 'dir',
                            children: {
                                'firmware.conf': {
                                    type: 'file',
                                    content: '# SENSOR-MONITOR-01 Firmware Configuration\n# Last modified: 2026-03-12 by J. Torres\n# WARNING: Changes require reflash via esptool.py\n\n[uart]\nbaud = 9600          # <-- Changed from 115200 for "power savings"\ndata_bits = 8\nparity = none\nstop_bits = 1\ntx_pin = 17\nrx_pin = 16\n\n[wifi]\nssid = DATAMINE-IOT\npassword =           # <-- Left blank after SSID rotation\n\n[mqtt]\nbroker = 10.10.77.1\nport = 1883\ntopic = mine/sector7g/env\nclient_id = sensor-monitor-01\n\n[power]\ndeep_sleep_ms = 500  # <-- Reduced from 5000ms\nsensor_poll_interval_ms = 1000\ntransmit_interval_ms = 5000\n\n[sensors]\nch4_pin = 34\nco_pin = 34\ntemp_bus = 21\nseismic_pin = 35\ncalibration_offset = 0.0'
                                },
                                'firmware.bin': {
                                    type: 'file',
                                    content: '[BINARY: ESP32 firmware image — 487,392 bytes — compiled 2026-03-12]\n[ELF header: Xtensa LX6 — FreeRTOS v10.4.3]\n[Sections: .text .data .rodata .bss]\n[Build flags: -DUART_BAUD=9600 -DWIFI_PASS="" -DDEEP_SLEEP=500]'
                                },
                                'firmware.bin.bak': {
                                    type: 'file',
                                    content: '[BINARY: ESP32 firmware image — 485,120 bytes — compiled 2026-02-28]\n[ELF header: Xtensa LX6 — FreeRTOS v10.4.3]\n[Sections: .text .data .rodata .bss]\n[Build flags: -DUART_BAUD=115200 -DWIFI_PASS="M1n3s4f3ty!" -DDEEP_SLEEP=5000]'
                                },
                                'flash.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Flash firmware to SENSOR-MONITOR-01\n# Usage: ./flash.sh <firmware.bin>\nesptool.py --chip esp32 --port /dev/ttyS0 --baud 115200 write_flash 0x1000 "$1"'
                                }
                            }
                        }
                    }
                },
                'dev': {
                    type: 'dir',
                    children: {
                        'ttyS0': { type: 'file', content: '[serial device — SENSOR-MONITOR-01]' },
                        'ttyS1': { type: 'file', content: '[serial device — unused]' },
                        'i2c-0': { type: 'file', content: '[I2C bus 0 — sensors]' }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'gw-datamine' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nengineer:x:1000:1000:Mine Engineer:/home/engineer:/bin/bash\nmqtt:x:1001:1001:MQTT Service:/var/lib/mqtt:/usr/sbin/nologin'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'sensor-gateway.log': {
                                    type: 'file',
                                    content: '[2026-03-19 02:14:00] WARN: /dev/ttyS0 — received garbled data (115200 baud)\n[2026-03-19 02:14:01] WARN: Frame check failed — expected ASCII, got 0xFE 0x3A 0x91 0x7C\n[2026-03-19 02:14:05] ERROR: SENSOR-MONITOR-01 — no valid telemetry frame in 60s\n[2026-03-19 02:15:00] WARN: /dev/ttyS0 — received garbled data (115200 baud)\n[2026-03-19 02:15:01] WARN: Baud rate mismatch suspected — device may have changed TX rate\n[2026-03-19 02:16:00] ERROR: MQTT publish failed for mine/sector7g/env — no valid data\n[2026-03-19 02:17:00] CRITICAL: No valid data from SENSOR-MONITOR-01 for 240 minutes\n[2026-03-19 02:17:01] CRITICAL: Sector 7-G environmental monitoring OFFLINE'
                                },
                                'dmesg.log': {
                                    type: 'file',
                                    content: '[    0.000000] Linux version 5.15.0-embedded (gcc 11.2.0)\n[    0.102341] Serial: 8250/16550 driver, 4 ports, IRQ sharing enabled\n[    0.103456] serial8250: ttyS0 at I/O 0x3f8 (irq = 4) is a 16550A\n[    0.103890] serial8250: ttyS1 at I/O 0x2f8 (irq = 3) is a 16550A\n[    0.234567] i2c /dev entries driver\n[    0.235000] i2c-0: Found 3 devices on bus\n[    0.890123] USB: FTDI USB-Serial converter detected on ttyUSB0\n[    1.234567] MQTT client service started — broker: 10.10.77.1:1883\n[    1.345678] sensor-gateway: Monitoring /dev/ttyS0 at 115200 baud\n[    1.456789] sensor-gateway: Waiting for SENSOR-MONITOR-01 telemetry...'
                                },
                                'mqtt.log': {
                                    type: 'file',
                                    content: '[2026-03-19 02:14:00] MQTT: Connected to broker 10.10.77.1:1883\n[2026-03-19 02:14:01] MQTT: Subscribed to mine/sector7g/env\n[2026-03-19 02:14:05] MQTT: No messages received on mine/sector7g/env\n[2026-03-19 02:15:00] MQTT: Publish failed — no valid sensor payload\n[2026-03-19 02:16:00] MQTT: Client sensor-monitor-01 last seen 4h 22m ago\n[2026-03-19 02:17:00] MQTT: WARNING — client sensor-monitor-01 presumed offline'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'serial-capture.txt': {
                            type: 'file',
                            content: '# Serial capture from /dev/ttyS0 at 115200 baud\n# Captured: 2026-03-19 02:14:00\n\xFE\x3A\x91\x7C\xD2\xA8\x4F\x0B\xE5\x1C\n\xFE\x3A\x92\x7D\xD3\xA9\x50\x0C\xE6\x1D\n\xFE\x3A\x91\x7B\xD2\xA7\x4E\x0A\xE4\x1B\n# NOTE: Data appears garbled. Likely baud rate mismatch.'
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'dmesg': function(args, term, engine) {
            return `[    0.000000] Linux version 5.15.0-embedded (gcc 11.2.0)
[    0.102341] Serial: 8250/16550 driver, 4 ports, IRQ sharing enabled
[    0.103456] serial8250: ttyS0 at I/O 0x3f8 (irq = 4) is a 16550A
[    0.103890] serial8250: ttyS1 at I/O 0x2f8 (irq = 3) is a 16550A
[    0.234567] i2c /dev entries driver
[    0.235000] i2c-0: Found 3 devices on bus
[    0.890123] USB: FTDI USB-Serial converter detected on ttyUSB0
[    1.234567] MQTT client service started -- broker: 10.10.77.1:1883
[    1.345678] sensor-gateway: Monitoring /dev/ttyS0 at 115200 baud
[    1.456789] sensor-gateway: Waiting for SENSOR-MONITOR-01 telemetry...
[  243.891234] sensor-gateway: WARNING -- no valid frames for 240 minutes
[  243.891235] sensor-gateway: Baud rate mismatch suspected on /dev/ttyS0`;
        },

        'screen': function(args, term, engine) {
            if (args.length === 0) return 'Usage: screen <device> [baud_rate]\nExample: screen /dev/ttyS0 115200';
            const device = args[0] || '';
            const baud = parseInt(args[1]) || 115200;

            if (!device.includes('ttyS0')) {
                return `[screen: Could not open ${device} -- No such device]`;
            }

            if (baud === 9600) {
                return `[screen: Connected to /dev/ttyS0 at 9600 baud 8N1]

SENSOR-MONITOR-01 v1.4.2-beta (ESP32-WROOM-32E)
Boot reason: power-on reset
UART initialized: 9600 baud, 8N1
I2C bus scan: 3 devices found (0x48, 0x68, 0x77)
Sensor init: CH4(GPIO34) CO(GPIO34) TEMP(I2C:0x48) SEISMIC(GPIO35)
WiFi: SSID=DATAMINE-IOT, connecting...
WiFi: FAILED -- password empty, skipping
MQTT: Cannot connect -- no WiFi

[SENSOR DATA FRAME]
  CH4:  142 ppm   (OK)
  CO:   3.2 ppm   (OK)
  TEMP: 23.7 C    (OK)
  SEIS: 0.02 g    (OK)

WARNING: MQTT transmit failed -- no network
WARNING: Deep sleep in 500ms (too aggressive?)

{{FLAG:user}}

[Device entering deep sleep...]`;
            }

            if (baud === 115200) {
                return `[screen: Connected to /dev/ttyS0 at 115200 baud 8N1]

\xFE\x3A\x91\x7C\xD2\xA8\x4F\x0B\xE5\x1C\xAA\xBB
\x7F\x9E\x2D\x8A\xC1\xF3\x56\x72\xD4\xE8\x3B\x0F
\xFE\x3A\x92\x7D\xD3\xA9\x50\x0C\xE6\x1D\xAC\xBD
[garbled output -- possible baud rate mismatch]
[Try connecting at a different baud rate]`;
            }

            return `[screen: Connected to /dev/ttyS0 at ${baud} baud 8N1]

\xC0\xD1\xE2\xF3\x04\x15\x26\x37
[garbled output -- baud rate ${baud} does not match device]
[Common baud rates: 9600, 19200, 38400, 57600, 115200]`;
        },

        'minicom': function(args, term, engine) {
            const baudArg = args.find(a => a.startsWith('-b'));
            const baud = baudArg ? parseInt(args[args.indexOf(baudArg) + 1]) : 115200;
            const device = args.find(a => a.startsWith('/dev')) || '/dev/ttyS0';
            return B11Config.commands.screen([device, String(baud)], term, engine);
        },

        'esptool.py': function(args, term, engine) {
            if (args.length === 0) return 'Usage: esptool.py --chip esp32 --port /dev/ttyS0 --baud <baud> write_flash 0x1000 <firmware.bin>\n\nOptions:\n  --chip     Target chip type (esp32, esp8266)\n  --port     Serial port\n  --baud     Flash baud rate\n  write_flash  Write binary to flash\n  flash_id     Read flash chip ID\n  read_flash   Read flash contents';

            if (args.includes('flash_id')) {
                return `esptool.py v4.7.0
Serial port /dev/ttyS0
Connecting....
Detecting chip type... ESP32
Chip is ESP32-D0WDQ6-V3 (revision v3.1)
Features: WiFi, BT, Dual Core, 240MHz, VRef calibration in efuse
Crystal is 40MHz
MAC: 24:0a:c4:12:5e:9c
Flash size: 4MB
Flash type: QIO`;
            }

            if (args.includes('write_flash')) {
                const firmwareFile = args[args.length - 1] || '';
                if (firmwareFile.includes('.bak') || firmwareFile.includes('firmware.bin.bak')) {
                    return `esptool.py v4.7.0
Serial port /dev/ttyS0
Connecting....
Chip is ESP32-D0WDQ6-V3 (revision v3.1)
Uploading stub...
Running stub...
Configuring flash size...
Flash will be erased from 0x00001000 to 0x00076fff...
Compressed 485120 bytes to 287456...
Writing at 0x00001000... (5 %)
Writing at 0x0000d000... (11 %)
Writing at 0x00019000... (16 %)
Writing at 0x00025000... (22 %)
Writing at 0x00031000... (27 %)
Writing at 0x0003d000... (33 %)
Writing at 0x00049000... (38 %)
Writing at 0x00055000... (44 %)
Writing at 0x00061000... (50 %)
Writing at 0x0006d000... (55 %)
Writing at 0x00076000... (100 %)
Wrote 485120 bytes (287456 compressed) at 0x00001000 in 12.4 seconds...
Hash of data verified.

Leaving...
Hard resetting via RTS pin...

[SENSOR-MONITOR-01 rebooting with restored firmware v1.4.1]
[UART: 115200 baud | WiFi: DATAMINE-IOT | MQTT: Connected]

First valid telemetry frame:
  Temperature: 23.7C, CH4: 142ppm, CO: 3.2ppm, Seismic: 0.02g

{{FLAG:root}}

SENSOR-MONITOR-01 is now ONLINE.`;
                }

                return `esptool.py v4.7.0
Serial port /dev/ttyS0
Connecting....
Chip is ESP32-D0WDQ6-V3 (revision v3.1)
Uploading stub...
Running stub...
Writing firmware...
Wrote ${firmwareFile ? '487392' : '0'} bytes at 0x00001000
Hash of data verified.
Hard resetting via RTS pin...

[Device rebooting with current firmware v1.4.2-beta]
[UART: 9600 baud | WiFi: FAILED (no password) | MQTT: DISCONNECTED]
NOTE: Same firmware reflashed -- issues persist.`;
            }

            return 'esptool.py: invalid arguments. Use --help for usage.';
        },

        'i2cdetect': function(args) {
            return `     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:          -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- 48 -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- 68 -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- 77`;
        },

        'binwalk': function(args) {
            const file = args[0] || '';
            if (!file) return 'Usage: binwalk [options] <firmware_file>';
            if (file.includes('firmware.bin')) {
                return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             ELF, 32-bit LSB executable, Tensilica Xtensa
4096          0x1000          FreeRTOS kernel image
8192          0x2000          ESP32 partition table
12288         0x3000          Application code section (.text)
262144        0x40000         Read-only data section (.rodata)
393216        0x60000         Configuration data (UART, WiFi, MQTT)
458752        0x70000         Sensor calibration tables`;
            }
            return `binwalk: ${file}: No such file or directory`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '10.10.77.1' || target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00045s latency).

PORT     STATE  SERVICE
22/tcp   open   ssh
80/tcp   open   http (Sensor Dashboard)
1883/tcp open   mqtt

Nmap done: 1 IP address (1 host up) scanned in 2.14 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.77.1') {
                return `PING 10.10.77.1 (10.10.77.1) 56(84) bytes of data.
64 bytes from 10.10.77.1: icmp_seq=1 ttl=64 time=0.8 ms
64 bytes from 10.10.77.1: icmp_seq=2 ttl=64 time=0.7 ms
64 bytes from 10.10.77.1: icmp_seq=3 ttl=64 time=0.9 ms

--- 10.10.77.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'mosquitto_sub': function(args) {
            return `Connecting to MQTT broker 10.10.77.1:1883...
Connected. Subscribing to mine/sector7g/env...
[Waiting for messages... no data received]
[SENSOR-MONITOR-01 client appears offline]
^C`;
        },

        'stty': function(args) {
            if (args.length === 0) return 'Usage: stty [-F device] [settings]\nExample: stty -F /dev/ttyS0 speed';
            if (args.includes('speed') || args.includes('-a')) {
                return `speed 115200 baud; rows 0; columns 0; line = 0;
intr = ^C; quit = ^\\; erase = ^?; kill = ^U;
-parenb -parodd -cmspar cs8 -hupcl -cstopb cread clocal -crtscts
-ignbrk -brkint -ignpar -parmrk -inpck -istrip -inlcr -igncr`;
            }
            return 'stty: settings applied.';
        },

        'systemctl': function(args) {
            const action = args[0] || '';
            const service = args[1] || '';
            if (action === 'status' && service.includes('mqtt')) {
                return `mqtt-bridge.service - MQTT Bridge for Sensor Gateway
     Loaded: loaded (/etc/systemd/system/mqtt-bridge.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:14:00 UTC
   Main PID: 1234 (mqtt-bridge)
      Tasks: 2 (limit: 2048)
     Memory: 8.4M
        CPU: 1.234s
     CGroup: /system.slice/mqtt-bridge.service

Mar 19 02:17:00 gw-datamine mqtt-bridge[1234]: WARNING: No data from sensor-monitor-01`;
            }
            if (action === 'status' && service.includes('sensor')) {
                return `sensor-gateway.service - Sensor Serial Gateway Monitor
     Loaded: loaded (/etc/systemd/system/sensor-gateway.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:14:00 UTC
   Main PID: 1235 (sensor-gw)
      Tasks: 1 (limit: 2048)
     Memory: 4.2M

Mar 19 02:17:00 gw-datamine sensor-gw[1235]: ERROR: Garbled data on /dev/ttyS0 at 115200 baud`;
            }
            return `Unit ${service || 'unknown'}.service could not be found.`;
        },

        'journalctl': function(args) {
            return `-- Journal begins at Wed 2026-03-19 02:14:00 UTC --
Mar 19 02:14:00 gw-datamine sensor-gw[1235]: Started monitoring /dev/ttyS0 at 115200 baud
Mar 19 02:14:01 gw-datamine sensor-gw[1235]: Received data frame -- CRC check FAILED
Mar 19 02:14:02 gw-datamine sensor-gw[1235]: WARNING: Garbled data -- possible baud mismatch
Mar 19 02:15:00 gw-datamine mqtt-bridge[1234]: No valid payload to publish
Mar 19 02:16:00 gw-datamine sensor-gw[1235]: ERROR: 120 consecutive failed frames
Mar 19 02:17:00 gw-datamine sensor-gw[1235]: CRITICAL: SENSOR-MONITOR-01 presumed offline`;
        },

        'hexdump': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('serial-capture') || file.includes('ttyS0')) {
                return `00000000  fe 3a 91 7c d2 a8 4f 0b  e5 1c aa bb fe 3a 92 7d  |.:..|..O......:.|
00000010  d3 a9 50 0c e6 1d ac bd  fe 3a 91 7b d2 a7 4e 0a  |..P......:.{..N.|
00000020  e4 1b aa ba 00 00 00 00  00 00 00 00 00 00 00 00  |................|

NOTE: This is 9600-baud data captured at 115200 baud.
      Frame headers (0xFE 0x3A) are consistent but data is misinterpreted.`;
            }
            return `hexdump: ${file || 'stdin'}: No such file or directory`;
        },

        'strings': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('firmware.bin') && !file.includes('.bak')) {
                return `FreeRTOS v10.4.3
ESP32-WROOM-32E
SENSOR-MONITOR-01
v1.4.2-beta
uart_baud=9600
wifi_ssid=DATAMINE-IOT
wifi_pass=
mqtt_broker=10.10.77.1
mine/sector7g/env
deep_sleep_ms=500
CH4 CO TEMP SEISMIC`;
            }
            if (file.includes('.bak')) {
                return `FreeRTOS v10.4.3
ESP32-WROOM-32E
SENSOR-MONITOR-01
v1.4.1
uart_baud=115200
wifi_ssid=DATAMINE-IOT
wifi_pass=M1n3s4f3ty!
mqtt_broker=10.10.77.1
mine/sector7g/env
deep_sleep_ms=5000
CH4 CO TEMP SEISMIC`;
            }
            return `strings: ${file}: No such file or directory`;
        },

        'diff': function(args) {
            if (args.length < 2) return 'Usage: diff <file1> <file2>';
            if ((args[0].includes('firmware.bin') && args[1].includes('.bak')) ||
                (args[1].includes('firmware.bin') && args[0].includes('.bak'))) {
                return `--- firmware.bin.bak    2026-02-28 (v1.4.1)
+++ firmware.bin        2026-03-12 (v1.4.2-beta)
@@ UART Configuration @@
-uart_baud=115200
+uart_baud=9600
@@ WiFi Configuration @@
-wifi_pass=M1n3s4f3ty!
+wifi_pass=
@@ Power Management @@
-deep_sleep_ms=5000
+deep_sleep_ms=500`;
            }
            return 'diff: No differences or files not found.';
        },

        'curl': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('10.10.77.1') && url.includes('sensor')) {
                return `{"status":"offline","device":"SENSOR-MONITOR-01","lastSeen":"4h 23m ago","error":"no valid telemetry"}`;
            }
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#f59e0b; border-bottom:2px solid #333; background:#1a1a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222; color:#ccc;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

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
