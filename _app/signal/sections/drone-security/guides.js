// ============================================================================
// Signal Drone Security — Build Guides (sg-83 through sg-92)
// Drone hacking, analysis, and counter-drone projects
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-83: FPV Drone Build
    // ========================================================================
    'sg-83': {
        intro: '<p>Building an FPV (First Person View) drone from components is the foundation for understanding drone security. You cannot attack what you do not understand, and you cannot understand drones without building one. Every component &mdash; flight controller, ESC, receiver, video transmitter &mdash; runs firmware that can be configured, modified, or exploited.</p>' +
               '<p>The flight controller is the brain. It runs Betaflight firmware, which exposes a full command-line interface over USB serial. Through this CLI you configure motor protocols, receiver channels, PID tuning, failsafe behavior, and OSD (On Screen Display) elements. Every setting is a potential attack surface: a modified failsafe could force a landing, a corrupted PID loop could destabilize flight, and a hijacked receiver binding could give an attacker full control.</p>' +
               '<p>In this project you will assemble a 5-inch FPV quad, flash Betaflight, bind an ExpressLRS receiver, configure motors and failsafes, and verify flight readiness. This becomes your test platform for every drone security project that follows.</p>',

        wiring: '    FPV Drone Component Layout\n' +
                '    \n' +
                '    Motor 1 (CW)                Motor 2 (CCW)\n' +
                '        \\                          /\n' +
                '         \\   +----------------+   /\n' +
                '          +--| 4-in-1 ESC     |--+\n' +
                '             | (BLHeli_32)    |\n' +
                '             +-------+--------+\n' +
                '                     |\n' +
                '             +-------+--------+\n' +
                '             | Flight Ctrl    |\n' +
                '             | (STM32 F405)   |\n' +
                '             | Betaflight 4.x |---[USB]---> Computer\n' +
                '             +--+-----+----+--+\n' +
                '                |     |    |\n' +
                '          +-----+  +--+--+ +-----+\n' +
                '          | ELRS |  | VTX | | GPS |\n' +
                '          | RX   |  |5.8G | | M10 |\n' +
                '          +------+  +-----+ +-----+\n' +
                '         /                         \\\n' +
                '    Motor 3 (CCW)             Motor 4 (CW)',

        wiringNotes: '<p><strong>ESC protocol:</strong> Use DShot600 between flight controller and ESCs. DShot is a digital protocol immune to electrical noise, unlike legacy PWM/OneShot. BLHeli_32 ESCs support bidirectional DShot for RPM filtering, which also exposes telemetry data useful for security analysis.</p>' +
                     '<p><strong>ELRS (ExpressLRS):</strong> Open-source radio link operating on 2.4 GHz or 915 MHz. The binding phrase is a shared secret &mdash; knowing it allows any ELRS transmitter to bind to the receiver. Default binding phrases are a common misconfiguration.</p>' +
                     '<p><strong>Safety:</strong> Remove propellers during all bench testing. A 5-inch prop at full throttle can sever fingers. Never power motors with props attached until you are in an open field ready to fly.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Flash Betaflight and Connect CLI',
                content: '<p>Flash the latest Betaflight firmware to your flight controller and connect to the CLI. The CLI gives you full control over every parameter in the flight controller &mdash; hundreds of settings that define how the drone behaves.</p>',
                code: '# Install Betaflight Configurator (or use the Chrome app)\n# Download from: https://github.com/betaflight/betaflight-configurator/releases\n\n# Connect FC via USB, open Configurator, flash firmware for your target\n# For STM32F405 boards: select BETAFLIGHTF4 target\n\n# Once flashed, open the CLI tab and dump the full config:\ndump all\n\n# Key commands to configure:\n# Set board name and craft name\nset name = SECURITY-QUAD\n\n# Configure motor protocol — DShot600 with bidirectional\nset motor_pwm_protocol = DSHOT600\nset dshot_bidir = ON\n\n# Set motor order (verify with motor tab — spin WITHOUT props)\nresource MOTOR 1 B00\nresource MOTOR 2 B01\nresource MOTOR 3 A03\nresource MOTOR 4 A02\n\n# Configure failsafe — what happens when signal is lost\nset failsafe_delay = 5\nset failsafe_off_delay = 100\nset failsafe_procedure = DROP\n\n# Save all changes\nsave',
                language: 'Bash',
                tip: '<strong>Security note:</strong> The <code>dump all</code> command exports every setting including receiver binding info, VTX power levels, and GPS home coordinates. Captured Betaflight dumps from a target drone reveal its complete configuration and operational parameters.'
            },
            {
                title: 'Bind ExpressLRS Receiver',
                content: '<p>ExpressLRS uses a binding phrase &mdash; a string hashed into a unique UID that pairs transmitter and receiver. This is the authentication mechanism for the control link. If you know the binding phrase, you own the drone.</p>',
                code: '# Flash ELRS receiver firmware with your binding phrase\n# Using ELRS Configurator or espflash:\npip install esptool\n\n# Put receiver into bootloader mode (hold button during power-on)\n# Flash with binding phrase compiled into firmware:\n# In ELRS Configurator: set Binding Phrase = "your-secret-phrase-here"\n# Build & Flash for your receiver target\n\n# In Betaflight CLI — configure serial receiver:\nserial 1 64 115200 57600 0 115200\nset serialrx_provider = CRSF\nset serialrx_inverted = OFF\nset serialrx_halfduplex = ON\n\n# Verify receiver link in Betaflight:\n# Go to Receiver tab — move sticks and verify channel response\n# Channels: Roll=1, Pitch=2, Yaw=3, Throttle=4, Aux1=5...\n\n# Check ELRS link statistics via OSD or CLI:\nset osd_link_quality_pos = 2081\nset osd_rssi_dbm_pos = 2113\nsave\n\n# Default ELRS binding phrases to test against target drones:\n# "expresslrs" (factory default — never use in production)\n# "" (empty string — some firmware versions accept this)',
                language: 'Bash',
                tip: '<strong>Attack vector:</strong> Many pilots use weak or default binding phrases. ELRS binding phrases are compiled into firmware, not set at runtime. Extracting firmware from an ELRS receiver via SWD debug port reveals the compiled binding phrase hash, which can be brute-forced offline.'
            },
            {
                title: 'Configure OSD and GPS',
                content: '<p>The OSD (On Screen Display) overlays flight data onto the FPV video feed. GPS provides position, altitude, speed, and home location. Both are information leakage vectors &mdash; anyone receiving the 5.8 GHz video signal sees the OSD data.</p>',
                code: '# In Betaflight CLI — enable GPS:\nserial 3 2 115200 57600 0 115200\nset gps_provider = UBLOX\nset gps_sbas_mode = AUTO\nset gps_auto_config = ON\nset gps_rescue_min_sats = 8\n\n# Configure GPS Rescue (return-to-home failsafe)\nset gps_rescue_angle = 32\nset gps_rescue_initial_alt = 50\nset gps_rescue_descent_dist = 200\nset gps_rescue_ground_speed = 2000\nset gps_rescue_throttle_max = 1600\nset gps_rescue_sanity_checks = RESCUE_SANITY_ON\n\n# OSD elements that leak information:\nset osd_gps_lat_pos = 2529\nset osd_gps_lon_pos = 2561\nset osd_gps_speed_pos = 2145\nset osd_altitude_pos = 2177\nset osd_home_dir_pos = 2275\nset osd_home_dist_pos = 2307\nset osd_flymode_pos = 2209\nset osd_craft_name_pos = 2443\nsave\n\n# Verify GPS lock — go outside, check Betaflight GPS tab\n# 3D fix requires 4+ satellites, good fix needs 8+',
                language: 'Bash',
                tip: '<strong>Information leakage:</strong> OSD data broadcast over analog 5.8 GHz is visible to anyone with a receiver. Pilot name, GPS coordinates, altitude, home direction, and distance are all displayed. This is equivalent to broadcasting your location on an open radio channel.'
            },
            {
                title: 'Motor Test and Flight Verification',
                content: '<p>Verify motor direction, ESC telemetry, and control response before flight. This step also establishes baseline telemetry readings for anomaly detection in later security projects.</p>',
                code: '# CRITICAL: Remove all propellers before motor testing!\n\n# In Betaflight Motor tab — test each motor individually\n# Verify spin direction matches Betaflight motor diagram:\n# Motor 1 (rear right): CW\n# Motor 2 (front right): CCW\n# Motor 3 (rear left): CCW\n# Motor 4 (front left): CW\n\n# If motor spins wrong direction, reverse in BLHeli:\n# Connect BLHeli_32 Configurator via passthrough:\n# In Betaflight CLI:\nresource MOTOR 1 NONE\nresource MOTOR 2 NONE\nresource MOTOR 3 NONE\nresource MOTOR 4 NONE\nsave\n# Then use BLHeli_32 Suite to reverse direction\n# Re-assign motor resources after\n\n# Export full configuration backup:\ndump all > security-quad-backup.txt\n\n# Record baseline ESC telemetry for anomaly detection:\n# In Betaflight Sensors tab, enable ESC telemetry logging\nset esc_sensor_current_offset = 0\nset motor_poles = 14\nsave\n\n# Arm switch setup (Aux1 on channel 5):\naux 0 0 0 1700 2100 0 0\nsave\n# This maps ARM to AUX1 when channel value > 1700',
                language: 'Bash',
                tip: null
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Betaflight firmware flashed and CLI responsive via USB</li>' +
                 '<li>Motor direction correct for all 4 motors (props removed)</li>' +
                 '<li>DShot600 bidirectional confirmed &mdash; RPM readings in motor tab</li>' +
                 '<li>ELRS receiver bound &mdash; stick inputs move channels in Receiver tab</li>' +
                 '<li>GPS acquires 3D fix with 8+ satellites outdoors</li>' +
                 '<li>OSD displays GPS coordinates, altitude, speed, home direction</li>' +
                 '<li>Failsafe triggers correctly when transmitter is powered off</li>' +
                 '<li>Full config backup exported via <code>dump all</code></li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Betaflight Configurator cannot connect via USB:</strong> Install the correct USB driver (CP210x for most F4/F7 boards, STM32 VCP for boards in DFU mode). On Linux, add your user to the dialout group: <code>sudo usermod -aG dialout $USER</code> and log out/in. Check <code>dmesg | tail</code> after plugging in to see if the device is recognized.</li>' +
                         '<li><strong>Motors spin in wrong direction:</strong> Do not swap motor wires. Reverse the motor direction in BLHeli_32 Configurator via passthrough. In Betaflight CLI, temporarily deallocate motor resources, connect BLHeli Suite, reverse the motor, then restore resources and save.</li>' +
                         '<li><strong>ELRS receiver not binding:</strong> Verify the binding phrase is identical on both transmitter and receiver firmware. The phrase is case-sensitive and compiled into the firmware &mdash; you cannot change it at runtime. Reflash the receiver with the correct binding phrase. Put the receiver in bootloader mode by holding the button during power-on.</li>' +
                         '<li><strong>GPS does not acquire fix:</strong> GPS requires an outdoor sky view. It will not work indoors or near buildings. Wait at least 2-3 minutes for cold start fix. Verify UART configuration in Betaflight matches the GPS module baud rate (typically 115200 for u-blox M10).</li>' +
                         '<li><strong>OSD elements not visible on video feed:</strong> OSD requires a compatible VTX connection. Check that the OSD is enabled in the Betaflight OSD tab and that element positions are valid. Analog VTX needs the OSD signal mixed into the video path &mdash; ensure the FC is wired between the camera and VTX.</li>' +
                         '<li><strong>Failsafe does not trigger when TX is powered off:</strong> Confirm failsafe is configured: <code>set failsafe_procedure = DROP</code> (or RTL). Check <code>set failsafe_delay</code> value &mdash; the default may be too long for testing. ELRS failsafe behavior depends on both Betaflight and ELRS settings.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Configuration Diff Analysis</strong> &mdash; Export the Betaflight <code>dump all</code> from your build and compare it against the default firmware dump. Identify every parameter that was changed from default and explain the security implication of each. Which parameters could an attacker modify to compromise flight safety?</p>' +
                    '<p><strong>Challenge 2: Failsafe Attack Scenarios</strong> &mdash; Document three different failsafe configurations (DROP, LAND, GPS_RESCUE) and analyze how each could be exploited by an attacker who has MAVLink or CLI access. For each scenario, describe the attack vector, the expected behavior, and the defensive mitigation.</p>' +
                    '<p><strong>Challenge 3: Binding Phrase Security Audit</strong> &mdash; Research common ELRS binding phrases used in the community (default phrases, popular presets). Create a dictionary of at least 50 commonly used phrases. Explain how binding phrase brute-force works and calculate the search space if the phrase is a 12-character random string vs a common English word.</p>',

        commonMistakes: [
            {
                title: 'Testing Motors With Propellers Attached',
                correct: 'Remove all propellers during bench testing. Test motor direction and response in the Betaflight Motor tab with props removed. Only attach propellers in an open field when ready to fly.',
                incorrect: 'Running motor tests on the bench with propellers installed to "verify thrust."',
                consequence: 'A 5-inch propeller at full throttle can sever fingers and cause serious lacerations. Accidental full-throttle due to misconfigured channel mapping or a software bug is a real risk. Props-off bench testing is an absolute safety requirement.'
            },
            {
                title: 'Using Default ELRS Binding Phrase',
                correct: 'Set a unique, complex binding phrase that cannot be guessed. Treat it like a password &mdash; minimum 12 characters, mix of words and numbers.',
                incorrect: 'Leaving the binding phrase as "expresslrs" (the factory default) or using a simple common word like "drone" or "myquad."',
                consequence: 'Anyone who guesses the binding phrase can bind their own transmitter to your receiver and take full control of your drone. Default and common binding phrases are the first things an attacker tries. This is the equivalent of leaving the default password on a network device.'
            },
            {
                title: 'Skipping the Configuration Backup',
                correct: 'Export a complete config backup with <code>dump all</code> after setup is complete. Store it securely. This is your known-good baseline for detecting unauthorized modifications.',
                incorrect: 'Completing the build without saving a configuration backup.',
                consequence: 'If the configuration is tampered with or corrupted, there is no reference to restore from. You also lose the ability to detect unauthorized parameter changes. The dump serves as both a recovery tool and a forensic baseline.'
            }
        ]
    },

    // ========================================================================
    // SG-84: RF Analysis — Drone Protocols
    // ========================================================================
    'sg-84': {
        intro: '<p>Every drone communicates over radio frequency. The control link (2.4 GHz), video downlink (5.8 GHz), GPS (1.575 GHz), and telemetry all use RF. With an RTL-SDR and spectrum analysis tools, you can observe, characterize, and fingerprint these transmissions. This is passive reconnaissance &mdash; you are only listening, never transmitting.</p>' +
               '<p>Drone RF signatures are distinctive. Frequency hopping patterns, bandwidth, modulation type, and transmission timing create a fingerprint unique to each protocol. ExpressLRS hops across 80 channels in the 2.4 GHz ISM band with a specific FHSS (Frequency Hopping Spread Spectrum) pattern. DJI uses proprietary OcuSync with wider bandwidth. FrSky ACCESS uses its own hopping sequence. Each is identifiable from the RF signature alone.</p>' +
               '<p>In this project you will use RTL-SDR and GNU Radio to capture and analyze drone RF emissions, build a protocol identification pipeline, and create a drone detection capability based purely on RF signatures.</p>',

        wiring: '    RF Analysis Setup\n' +
                '    \n' +
                '    Target Drone (transmitting)      Analysis Station\n' +
                '         ~~~~ RF signals ~~~~\n' +
                '    2.4 GHz control link              +---------------+\n' +
                '    5.8 GHz video link                | RTL-SDR #1    |\n' +
                '    915 MHz telemetry                 | (24-1700 MHz) |---+\n' +
                '                                     +---------------+   |\n' +
                '                                                         |\n' +
                '                                     +---------------+   |\n' +
                '                                     | HackRF One    |   +---> GNU Radio\n' +
                '                                     | (1-6000 MHz)  |---+    Companion\n' +
                '                                     +---------------+   |\n' +
                '                                                         |\n' +
                '                                     +---------------+   |\n' +
                '                                     | WiFi Adapter  |---+\n' +
                '                                     | (monitor mode)|   \n' +
                '                                     +---------------+',

        wiringNotes: '<p><strong>RTL-SDR limitation:</strong> The RTL-SDR maxes out at ~1.766 GHz. It cannot directly receive 2.4 GHz or 5.8 GHz drone signals. For 2.4 GHz analysis, use a HackRF One ($300) or a WiFi adapter in monitor mode. For spectrum scanning below 1.7 GHz, the RTL-SDR works perfectly for 915 MHz telemetry and GPS bands.</p>' +
                     '<p><strong>Legal:</strong> Passive reception and analysis of RF signals is legal in most jurisdictions. You are observing publicly radiated energy. Do not attempt to jam, interfere with, or replay captured signals.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Capture Drone RF Emissions with RTL-SDR',
                content: '<p>Begin by scanning the frequency bands where drones operate. Use <code>rtl_power</code> for wideband surveys and <code>rtl_fm</code> for narrowband capture of specific signals in the sub-1.7 GHz range.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>FHSS detection:</strong> Frequency hopping shows up as horizontal dashes across the spectrogram, jumping between channels. ELRS 900 MHz hops across 60+ channels in the 902-928 MHz band. The hop rate and pattern are derived from the binding phrase UID.'
            },
            {
                title: 'Analyze 2.4 GHz with WiFi Monitor Mode',
                content: '<p>The 2.4 GHz ISM band hosts WiFi, Bluetooth, and most drone control links. Using a WiFi adapter in monitor mode, you can capture raw 802.11 frames and identify drone-specific traffic patterns.</p>',
                code: '# Put WiFi adapter into monitor mode\nsudo ip link set wlan1 down\nsudo iw dev wlan1 set type monitor\nsudo ip link set wlan1 up\n\n# Scan for drone WiFi networks (DJI drones create WiFi APs)\nsudo airodump-ng wlan1 --band abg -w drone_scan --output-format pcap\n# Look for SSIDs matching: DJI-*, PHANTOM-*, MAVIC-*, SPARK-*\n\n# Channel hop across 2.4 GHz to find FHSS signals\nfor ch in $(seq 1 13); do\n    sudo iw dev wlan1 set channel $ch\n    echo "Channel $ch — capturing 5 seconds..."\n    sudo timeout 5 tcpdump -i wlan1 -c 100 -w "channel_${ch}.pcap" 2>/dev/null\ndone\n\n# Analyze captures for drone protocol signatures:\ntshark -r drone_scan-01.cap -T fields \\\n    -e wlan.sa -e wlan.da -e wlan.ssid -e radiotap.dbm_antsignal \\\n    -Y "wlan.fc.type_subtype == 0x08" 2>/dev/null | \\\n    sort -u | head -30\n\n# Look for DJI OcuSync characteristics:\n# - Wide bandwidth (20-40 MHz)\n# - Rapid channel switching\n# - Proprietary management frames\ntshark -r drone_scan-01.cap -Y "wlan.fc.type == 0" \\\n    -T fields -e wlan.sa -e frame.len | sort | uniq -c | sort -rn',
                language: 'Bash',
                tip: '<strong>DJI drones</strong> broadcast WiFi beacons with identifiable SSIDs and OUIs (Organizationally Unique Identifiers). The MAC address prefix identifies the manufacturer. DJI uses <code>60:60:1F</code> and other registered OUIs.'
            },
            {
                title: 'Build GNU Radio Drone Detector Flowgraph',
                content: '<p>Create a GNU Radio flowgraph that detects drone RF emissions by monitoring power levels across drone frequency bands and triggering alerts when activity is detected.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Protocol Fingerprinting and Classification',
                content: '<p>Build a fingerprint database that identifies drone protocols by their RF characteristics: bandwidth, hop rate, modulation, and timing patterns.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>Passive identification:</strong> You can identify the drone make, model, and protocol without any active probing. The RF signature alone reveals whether you are dealing with a DJI Mavic, a racing quad on ELRS, or a custom build on Crossfire. This is the basis of counter-drone systems used at airports and military installations.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>RTL-SDR captures 915 MHz band activity when ELRS transmitter is powered on</li>' +
                 '<li>Spectrogram shows FHSS hopping pattern in 902-928 MHz</li>' +
                 '<li>WiFi monitor mode captures DJI drone beacon frames</li>' +
                 '<li>GNU Radio drone detector reports power above threshold when drone is active</li>' +
                 '<li>Protocol fingerprint database classifies at least 4 drone protocols</li>' +
                 '<li>Capture files saved in pcap/IQ format for later analysis</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>RTL-SDR shows no signal on 915 MHz when ELRS is active:</strong> Check that the ELRS transmitter is actually powered on and bound to a receiver. Unbound transmitters may not transmit. Also verify the antenna length (approximately 8.2 cm elements for 915 MHz). The signal is spread spectrum and may appear as a faint noise floor elevation rather than a distinct peak.</li>' +
                         '<li><strong>WiFi monitor mode fails with "Operation not supported":</strong> Not all WiFi adapters support monitor mode. You need a chipset that supports rfmon: Atheros AR9271, Ralink RT3070, or Realtek RTL8812AU are common choices. Check adapter support at <code>iw list</code> and look for "monitor" in supported interface modes.</li>' +
                         '<li><strong>airodump-ng shows no DJI drone SSIDs:</strong> DJI drones only broadcast WiFi beacons when in certain modes. Power on the DJI drone, turn on the controller, and activate the WiFi connection mode. Not all DJI models create visible WiFi access points &mdash; newer OcuSync models may not broadcast standard beacons.</li>' +
                         '<li><strong>GNU Radio flowgraph crashes or produces no output:</strong> Verify GNU Radio is installed with RTL-SDR support: <code>sudo apt install gnuradio gr-osmosdr</code>. Check that no other application is holding the SDR dongle. In GNU Radio, ensure the osmocom Source block is configured for your device.</li>' +
                         '<li><strong>FHSS pattern not visible on spectrogram:</strong> FHSS signals hop rapidly and each burst is brief. Use a short FFT size (512 or 1024) and high waterfall rate in GQRX to see individual hops. The default FFT settings may blur the hops together into a flat noise floor.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Protocol Fingerprint Database</strong> &mdash; Capture RF signatures from at least 4 different drone protocols (ELRS, DJI, FrSky, Crossfire, or others available to you). Document bandwidth, hop rate, modulation, and timing for each. Create a classification flowchart that identifies the protocol from RF characteristics alone.</p>' +
                    '<p><strong>Challenge 2: Drone Detection Distance</strong> &mdash; Using your RTL-SDR, determine the maximum distance at which you can detect a specific drone model by its RF emissions. Have a partner fly the drone progressively further away while you monitor for signal detection. Plot signal strength vs distance and compare to the inverse-square law prediction.</p>' +
                    '<p><strong>Challenge 3: Passive Drone Tracking</strong> &mdash; Using two or more directional antennas, attempt to determine the bearing to an active drone from RF emissions alone. Record signal strength from each antenna and calculate the approximate bearing. This is the basis of RF direction finding used in military counter-drone systems.</p>',

        commonMistakes: [
            {
                title: 'Expecting RTL-SDR to Receive 2.4 GHz or 5.8 GHz',
                correct: 'The RTL-SDR maxes out at approximately 1.766 GHz. For 2.4 GHz drone control links, use a HackRF One ($300) or WiFi adapter in monitor mode. For 5.8 GHz video, use a dedicated FPV receiver.',
                incorrect: 'Tuning the RTL-SDR to 2.4 GHz to capture drone control link signals.',
                consequence: 'No signal received. The RTL-SDR hardware physically cannot tune above ~1.766 GHz. It works well for sub-1.7 GHz analysis (900 MHz ELRS, GPS) but requires different hardware for the 2.4 GHz and 5.8 GHz bands where most drone activity occurs.'
            },
            {
                title: 'Confusing Active Probing with Passive Analysis',
                correct: 'RF analysis in this project is purely passive &mdash; receive only. You observe signals that drones are already broadcasting. No transmission or active probing is involved.',
                incorrect: 'Using a transmit-capable SDR to send probe packets or deauthentication frames to identify drones.',
                consequence: 'Active probing of drone links may violate FCC regulations and is potentially dangerous if it disrupts drone control. Passive analysis is legal and undetectable. Active attacks are a separate, carefully controlled domain covered in later projects.'
            },
            {
                title: 'Capturing Without Proper Metadata',
                correct: 'Record the date, time, location, frequency, sample rate, gain, and antenna configuration with every capture file. Name files systematically (e.g., <code>elrs900_20260315_1430_g40.bin</code>).',
                incorrect: 'Saving IQ capture files without documenting the recording parameters or using generic filenames like <code>capture.bin</code>.',
                consequence: 'The capture is useless for later analysis without metadata. You cannot decode or compare captures if you do not know the center frequency, sample rate, and gain used during recording. Proper metadata is essential for reproducible analysis.'
            }
        ]
    },

    // ========================================================================
    // SG-85: GPS Spoofing Detection
    // ========================================================================
    'sg-85': {
        intro: '<p>GPS is the weakest link in drone navigation. The GPS signal arrives from 20,000 km away at approximately -130 dBm &mdash; far weaker than a whisper. A ground-based transmitter broadcasting fake GPS signals at just -120 dBm can overpower the real satellites and feed the drone false coordinates. This is GPS spoofing, and it can redirect a drone to any location the attacker chooses.</p>' +
               '<p>Detection requires comparing multiple data sources. A single GPS receiver cannot distinguish real from spoofed signals. But if you compare GPS position against an independent reference &mdash; a second receiver, an inertial measurement unit (IMU), or known ground truth &mdash; spoofing becomes detectable. Sudden position jumps, impossible velocities, and timing inconsistencies all reveal a spoofer.</p>' +
               '<p>In this project you will build a multi-receiver GPS comparison system, parse NMEA sentences, implement spoofing detection heuristics, and test against simulated spoofing attacks using GPS-SDR-SIM.</p>',

        wiring: '    GPS Spoofing Detection Setup\n' +
                '    \n' +
                '    Real GPS satellites (L1: 1575.42 MHz)\n' +
                '          |           |           |\n' +
                '          v           v           v\n' +
                '    +-----------+ +-----------+ +-----------+\n' +
                '    | GPS Rx #1 | | GPS Rx #2 | | GPS Rx #3 |\n' +
                '    | u-blox M8 | | u-blox M10| | BN-880    |\n' +
                '    +-----+-----+ +-----+-----+ +-----+-----+\n' +
                '          |             |             |\n' +
                '       UART          USB           UART\n' +
                '          |             |             |\n' +
                '    +-----+-------------+-------------+-----+\n' +
                '    |        Raspberry Pi / Laptop           |\n' +
                '    |   GPS comparison + anomaly detection   |\n' +
                '    +----------------------------------------+',

        wiringNotes: '<p><strong>Multi-receiver approach:</strong> Spoofing a single receiver is easy. Spoofing three receivers at different physical locations simultaneously is much harder. If all receivers suddenly report the same position (within spoofing radius), that is normal. If one receiver jumps while others remain stable, that receiver is being targeted.</p>' +
                     '<p><strong>GPS-SDR-SIM:</strong> This tool generates fake GPS RF signals for testing. Use it ONLY in a shielded RF enclosure or via wired connection to a single receiver. <em>Broadcasting fake GPS over the air is a federal crime in the US</em> (18 USC 32) and violates regulations in most countries.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Configure GPS Receivers and Parse NMEA',
                content: '<p>Connect multiple GPS receivers and parse their NMEA output. NMEA 0183 is the standard protocol &mdash; ASCII sentences starting with <code>$GP</code> or <code>$GN</code> that contain position, time, satellite info, and fix quality.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>Fix quality values:</strong> 0=invalid, 1=GPS fix, 2=DGPS, 4=RTK fixed, 5=RTK float. A spoofer typically reports quality=1. If your receiver normally gets DGPS (quality=2) and suddenly drops to quality=1, that is suspicious.'
            },
            {
                title: 'Build Multi-Receiver Comparison Engine',
                content: '<p>Compare position reports from multiple receivers simultaneously. Legitimate GPS fixes from receivers in the same area will agree within a few meters. Spoofed signals cause detectable disagreement or suspicious agreement patterns.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Implement Spoofing Detection Heuristics',
                content: '<p>GPS spoofing leaves fingerprints. Implement detection algorithms that flag impossible position jumps, clock drift, satellite geometry anomalies, and signal strength inconsistencies.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Real-world spoofing:</strong> GPS spoofing has been documented in shipping lanes near Russian military bases, around airports, and during drone delivery tests. Iran famously captured a US RQ-170 Sentinel drone in 2011 using GPS spoofing to feed it false landing coordinates.'
            },
            {
                title: 'Generate Test Signals with GPS-SDR-SIM',
                content: '<p>Use GPS-SDR-SIM to generate fake GPS signals for testing your detection system. This runs entirely in software &mdash; connect the output to a single receiver via coaxial cable inside a shielded enclosure.</p>',
                code: '# Clone and build GPS-SDR-SIM (for testing only)\ngit clone https://github.com/osqzss/gps-sdr-sim.git\ncd gps-sdr-sim && make\n\n# Download GPS broadcast ephemeris (updated daily)\nwget -q "https://cddis.nasa.gov/archive/gnss/data/daily/2026/brdc/brdc0850.26n.gz"\ngunzip brdc0850.26n.gz\n\n# Generate spoofed GPS signal — target: NYC Times Square\n# WARNING: Output to file only. Never broadcast over the air.\n./gps-sdr-sim -e brdc0850.26n \\\n    -l 40.758896,-73.985130,10 \\\n    -d 60 -o spoof_timessquare.bin\n# -l lat,lon,alt  Spoofed location\n# -d 60           Duration in seconds\n# -o output       IQ sample file\n\n# Transmit via HackRF into shielded enclosure (wired to test receiver):\n# hackrf_transfer -t spoof_timessquare.bin -f 1575420000 -s 2600000 -a 1\n# NEVER do this without RF shielding!\n\n# Verify your detector catches the spoof:\n# 1. Start detector monitoring real GPS\n# 2. Begin spoofed signal transmission (shielded)\n# 3. Detector should alert on position jump + HDOP anomaly\n\necho "Test signal generated: spoof_timessquare.bin"\necho "Duration: 60 seconds of fake GPS at Times Square\"\nls -lh spoof_timessquare.bin',
                language: 'Bash',
                tip: '<strong>Shielded testing only.</strong> Broadcasting fake GPS signals is illegal under US law (18 USC 32, 49 USC 46505) and international regulations. Use a Faraday cage or wired RF connection to the test receiver. Even low-power spoofed signals can disrupt nearby GPS receivers through walls.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>NMEA parser correctly extracts lat, lon, alt, sats, HDOP from live GPS</li>' +
                 '<li>Multi-receiver comparison reports delta under 50m for co-located receivers</li>' +
                 '<li>Velocity heuristic flags position jumps exceeding 100 m/s</li>' +
                 '<li>HDOP and satellite count anomalies trigger alerts</li>' +
                 '<li>GPS-SDR-SIM generates valid test signal file</li>' +
                 '<li>Detector correctly identifies simulated spoofing in test data</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>GPS receivers show no fix indoors:</strong> GPS signals are extremely weak (-130 dBm) and do not penetrate most buildings. Move the receivers outdoors or place them near a window with a clear sky view. A cold start fix can take 2-5 minutes. If testing indoors, use a GPS repeater/re-radiator (not a spoofer) to bring the signal inside.</li>' +
                         '<li><strong>NMEA parser produces errors or empty fields:</strong> Check the serial baud rate matches the GPS module configuration (typically 9600 or 115200). Verify the serial connection is wired correctly (TX from GPS to RX on Pi). Use <code>screen /dev/ttyUSB0 9600</code> to verify raw NMEA output before running the parser.</li>' +
                         '<li><strong>Multi-receiver comparison shows large deltas even without spoofing:</strong> GPS accuracy is typically 2-5 meters. Receivers a few meters apart will show slightly different positions. Set the anomaly threshold higher than the expected GPS error (at least 10-20 meters for co-located receivers). Also check that all receivers have a good fix (8+ satellites).</li>' +
                         '<li><strong>GPS-SDR-SIM build fails:</strong> Install build dependencies: <code>sudo apt install build-essential</code>. The tool requires GCC and standard math libraries. If the ephemeris download fails, use an alternative source or a recent RINEX navigation file.</li>' +
                         '<li><strong>Spoofing detector does not trigger on test signals:</strong> Verify the test signal is actually reaching the target receiver. Use a coaxial cable connection inside an RF-shielded enclosure. Over-the-air testing risks interfering with real GPS receivers and is illegal. Check that the detector thresholds are calibrated to your normal GPS accuracy.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-Sensor Fusion</strong> &mdash; Add an IMU (Inertial Measurement Unit) as a second position reference independent of GPS. Compare GPS-derived velocity against IMU-derived acceleration. When the GPS position jumps but the IMU shows no corresponding acceleration, flag it as a potential spoof. This is how aviation-grade GPS anti-spoofing works.</p>' +
                    '<p><strong>Challenge 2: Spoofing Signature Analysis</strong> &mdash; Using GPS-SDR-SIM (in a shielded enclosure), generate spoofed signals for three different locations. Record the NMEA output during each transition from real to spoofed GPS. Document the exact sequence of anomalies: HDOP changes, satellite count variations, position jump magnitude, and time offset. Build a decision tree for spoof detection.</p>' +
                    '<p><strong>Challenge 3: Historical Spoofing Research</strong> &mdash; Research documented GPS spoofing incidents: the 2011 Iran RQ-170 capture, Black Sea shipping incidents (2017), and GPS disruption near conflict zones. For each incident, analyze the spoofing method, the detection failures, and what countermeasures would have prevented the attack. Present as a technical brief.</p>',

        commonMistakes: [
            {
                title: 'Broadcasting Fake GPS Signals Over the Air',
                correct: 'Test GPS spoofing signals ONLY through a coaxial cable connection to a single receiver inside an RF-shielded enclosure (Faraday cage). Never transmit fake GPS signals over the air.',
                incorrect: 'Using a HackRF to broadcast GPS-SDR-SIM output through an antenna, even at low power, even momentarily.',
                consequence: 'Broadcasting fake GPS signals is a federal crime in the US (18 USC 32, 49 USC 46505) and illegal in most countries. Even low-power signals can disrupt GPS receivers through walls and across hundreds of meters. This can affect aircraft, emergency vehicles, and critical infrastructure timing. Penalties include fines and imprisonment.'
            },
            {
                title: 'Using a Single GPS Receiver for Spoofing Detection',
                correct: 'Deploy multiple independent GPS receivers and compare their position reports. Spoof detection requires a reference that the attacker cannot simultaneously compromise.',
                incorrect: 'Relying on a single GPS receiver and analyzing only its internal consistency metrics (HDOP, satellite count) for spoof detection.',
                consequence: 'A sophisticated spoofer can present internally consistent signals to a single receiver &mdash; correct HDOP, realistic satellite count, and smooth position transitions. Only cross-referencing against independent sources (second receiver, IMU, known ground truth) reliably detects spoofing.'
            },
            {
                title: 'Setting Detection Thresholds Too Tightly',
                correct: 'Calibrate detection thresholds against normal GPS variation in your environment. Allow for 5-10 meter position jitter and occasional HDOP fluctuations under normal conditions.',
                incorrect: 'Setting the position delta threshold to 1 meter and the HDOP threshold to 0.1, triggering constant false alarms from normal GPS variation.',
                consequence: 'Constant false positives drown out real attacks. GPS accuracy varies with satellite geometry, atmospheric conditions, and multipath reflections. Thresholds must be above normal variation but below the signature of actual spoofing (typically 50+ meter position jumps).'
            }
        ]
    },

    // ========================================================================
    // SG-86: Counter-Drone Systems
    // ========================================================================
    'sg-86': {
        intro: '<p>Counter-drone systems detect, identify, track, and neutralize unauthorized drones. The detection layer is primarily RF-based &mdash; listening for the radio signatures that every drone emits. A drone that is flying must transmit control link, video, and telemetry signals. Even a fully autonomous drone emits GPS receiver noise and motor EMI. These emissions are detectable.</p>' +
               '<p>Commercial counter-drone platforms like DeDrone, DroneShield, and Orelia cost tens of thousands of dollars. But the core technology is straightforward: SDR receivers monitoring known drone frequency bands, matched against a signature database, with direction-finding for localization. You can build a functional prototype with RTL-SDR hardware and open-source software.</p>' +
               '<p>In this project you will build an RF-based drone detection system with a signature database, power-based range estimation, and multi-band monitoring. This is the same architectural pattern used by airport drone detection systems and military counter-UAS platforms.</p>',

        wiring: '    Counter-Drone Detection Station\n' +
                '    \n' +
                '    Scanning Antennas (3 bands)\n' +
                '    \n' +
                '    [900 MHz]   [2.4 GHz]   [5.8 GHz]\n' +
                '        |           |            |\n' +
                '    +---+---+  +----+----+  +----+----+\n' +
                '    |RTL-SDR|  |HackRF   |  |WiFi     |\n' +
                '    |dongle |  |One      |  |Adapter  |\n' +
                '    +---+---+  +----+----+  +----+----+\n' +
                '        |           |            |\n' +
                '        +-----+-----+-----+------+\n' +
                '              |                 \n' +
                '    +---------+-----------+\n' +
                '    |  Detection Server   |\n' +
                '    |  - Signature DB     |\n' +
                '    |  - Alert engine     |\n' +
                '    |  - Web dashboard    |\n' +
                '    +---------------------+',

        wiringNotes: '<p><strong>Multi-band monitoring:</strong> Drones operate across multiple frequency bands simultaneously. The control link may be on 2.4 GHz while video runs on 5.8 GHz and telemetry on 900 MHz. Monitoring all bands increases detection probability and enables protocol identification.</p>' +
                     '<p><strong>Direction finding:</strong> With two or more directional antennas, you can triangulate the drone position and &mdash; critically &mdash; the pilot position (by tracking the uplink signal from the controller).</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Build Drone Signature Database',
                content: '<p>Create a database of known drone RF signatures. Each entry captures frequency band, bandwidth, modulation type, hop pattern, and identifying characteristics.</p>',
                code: '# Drone signature database (JSON format)\ncat > drone_signatures.json << \'SIGEOF\'\n{\n  "signatures": [\n    {\n      "id": "DJI-OCUSYNC-3",\n      "make": "DJI", "models": ["Mavic 3", "Air 2S", "Mini 3 Pro"],\n      "control_freq_mhz": [2400, 2483],\n      "video_freq_mhz": [5725, 5850],\n      "bandwidth_mhz": 20,\n      "modulation": "OFDM",\n      "identifiers": ["OUI 60:60:1F", "SSID DJI-*"]\n    },\n    {\n      "id": "ELRS-2G4",\n      "make": "ExpressLRS", "models": ["Any ELRS 2.4GHz"],\n      "control_freq_mhz": [2400, 2480],\n      "bandwidth_mhz": 0.8,\n      "modulation": "LoRa-CSS",\n      "hop_channels": 80,\n      "hop_rate_hz": [50, 150, 250, 500],\n      "identifiers": ["Narrowband FHSS", "LoRa chirp"]\n    },\n    {\n      "id": "ELRS-900",\n      "make": "ExpressLRS", "models": ["Any ELRS 900MHz"],\n      "control_freq_mhz": [902, 928],\n      "bandwidth_mhz": 0.5,\n      "modulation": "LoRa-CSS",\n      "hop_channels": 60,\n      "identifiers": ["Sub-GHz FHSS", "LoRa chirp"]\n    },\n    {\n      "id": "FRSKY-ACCESS",\n      "make": "FrSky", "models": ["X20", "X18", "Tandem"],\n      "control_freq_mhz": [2400, 2480],\n      "bandwidth_mhz": 1.0,\n      "modulation": "GFSK",\n      "hop_channels": 47,\n      "identifiers": ["GFSK modulation", "47-ch hop"]\n    }\n  ]\n}\nSIGEOF\necho "Signature database created: drone_signatures.json"',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Implement Real-Time RF Monitor',
                content: '<p>Build a monitoring daemon that continuously scans drone frequency bands and compares detected signals against the signature database.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Baseline calibration:</strong> Run the scanner for 30+ minutes with no known drones present to establish the RF noise floor for each band. Detection is relative &mdash; you are looking for signals <em>above</em> the baseline, not absolute power levels.'
            },
            {
                title: 'Add WiFi-Based DJI Detection',
                content: '<p>DJI drones broadcast WiFi beacons. Monitor for DJI-specific OUIs and SSIDs to detect DJI drones without needing wideband SDR hardware.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>RSSI-based ranging:</strong> WiFi signal strength (RSSI) decreases with distance. At -30 dBm the drone is within ~10m. At -60 dBm it is ~100m away. At -80 dBm it is ~500m+. Calibrate with your specific antenna for better estimates.'
            },
            {
                title: 'Build Alert Dashboard',
                content: '<p>Create a simple web-based dashboard that displays real-time drone detections, alert history, and signal classification results.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Operational deployment:</strong> For continuous monitoring, run the detector as a systemd service. Log all detections to a database. Set up SMS/email alerts for new drone detections. This is exactly how commercial counter-drone systems like DroneShield operate.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Signature database contains at least 4 drone protocol profiles</li>' +
                 '<li>RTL-SDR scan detects ELRS 900 MHz transmitter when powered on</li>' +
                 '<li>WiFi monitor mode detects DJI drone beacon frames by OUI and SSID</li>' +
                 '<li>Alert engine classifies detected signals against signature database</li>' +
                 '<li>HTML report generates correctly with detection data</li>' +
                 '<li>False positive rate acceptable after baseline calibration</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>High false positive rate from RF monitor:</strong> The baseline scan was insufficient or the threshold is too sensitive. Run the baseline scan for at least 30 minutes with no known drones present, during both quiet and busy RF periods. Increase the alert threshold by 5 dB increments until false positives drop to an acceptable rate.</li>' +
                         '<li><strong>WiFi-based detection misses DJI drones:</strong> Newer DJI models using OcuSync 3+ may not broadcast standard WiFi beacons in all modes. The drone must be connected to the controller. Also verify the WiFi adapter supports monitor mode and is scanning all channels including 5 GHz (use <code>--band abg</code> in airodump-ng).</li>' +
                         '<li><strong>RTL-SDR cannot detect 2.4 GHz control links:</strong> The RTL-SDR maxes out at ~1.766 GHz. For 2.4 GHz detection, use a HackRF One or a WiFi adapter in monitor mode. The RTL-SDR is limited to sub-1.7 GHz bands (900 MHz ELRS, GPS, telemetry).</li>' +
                         '<li><strong>Signature database does not match detected signals:</strong> The database may be incomplete or the drone is using an unrecognized protocol. Add new signatures as you encounter them. Use the analyze mode to capture unknown signal characteristics and create new database entries.</li>' +
                         '<li><strong>Detection range is very short:</strong> Use a directional antenna (Yagi or patch) pointed at the likely drone approach direction instead of an omnidirectional dipole. Higher gain antennas increase detection range at the cost of directional coverage. For omnidirectional monitoring, a discone antenna provides better wideband performance.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-Sensor Detection Platform</strong> &mdash; Combine RF detection (SDR), WiFi monitoring (aircrack-ng), and acoustic detection (microphone + drone sound classifier) into a single integrated detection system. Compare the detection range and accuracy of each sensor modality. Determine which combination provides the best detection probability.</p>' +
                    '<p><strong>Challenge 2: Direction Finding</strong> &mdash; Build a two-antenna direction-finding system using a Yagi antenna on a manual rotator. Rotate the antenna while monitoring signal strength from a known drone. Plot signal strength vs bearing to determine the drone direction. With two receiver stations, triangulate the drone position.</p>' +
                    '<p><strong>Challenge 3: DroneID Detection</strong> &mdash; Research the DJI DroneID / Remote ID protocol that DJI drones broadcast. This contains the drone serial number, pilot location, and flight telemetry. Capture and decode DroneID broadcasts using open-source tools. Discuss the privacy and security implications of mandatory Remote ID.</p>',

        commonMistakes: [
            {
                title: 'Attempting to Jam Drone Signals',
                correct: 'Counter-drone detection is passive observation only. Detect, identify, classify, and report drone presence. Do not attempt to jam, interfere with, or disrupt drone communications.',
                incorrect: 'Using an SDR or purpose-built device to transmit jamming signals on drone control frequencies.',
                consequence: 'Jamming is illegal under FCC regulations (47 USC 333) and carries penalties up to $100,000 per violation. Jamming a drone control link can cause the drone to crash in an uncontrolled manner, potentially causing injury or property damage. Only authorized government agencies may employ counter-drone jamming.'
            },
            {
                title: 'Skipping Baseline Calibration',
                correct: 'Run the RF monitor for at least 30 minutes with no known drones present to establish the noise floor and identify existing RF activity on each monitored band.',
                incorrect: 'Starting the detection system without a baseline scan and relying on absolute power thresholds.',
                consequence: 'Every existing RF source in the environment triggers a false alert. WiFi access points, Bluetooth devices, microwave ovens, and other 2.4/5.8 GHz sources produce signals that look like drone activity without a proper baseline for comparison.'
            },
            {
                title: 'Relying on a Single Detection Method',
                correct: 'Use multiple detection modalities (RF scanning, WiFi monitoring, acoustic, visual) and correlate detections across sensors to reduce false positives.',
                incorrect: 'Building a counter-drone system based solely on RTL-SDR RF scanning and declaring it operational.',
                consequence: 'Single-modality detection has high false positive and false negative rates. A drone on an unusual frequency may evade RF scanning. A noisy environment may mask acoustic detection. Commercial counter-drone systems use 3-5 sensor types for reliable detection.'
            }
        ]
    },

    // ========================================================================
    // SG-87: MAVLink Protocol Analyzer
    // ========================================================================
    'sg-87': {
        intro: '<p>MAVLink (Micro Air Vehicle Link) is the standard telemetry and command protocol for open-source drones. ArduPilot, PX4, and dozens of ground control stations communicate using MAVLink messages. The protocol is binary, lightweight, and &mdash; critically &mdash; has no built-in encryption or authentication. Any device on the communication channel can read telemetry, inject commands, and take control of the vehicle.</p>' +
               '<p>MAVLink messages carry everything: GPS position, attitude, battery voltage, motor RPM, mission waypoints, and command acknowledgments. The protocol defines over 300 message types across multiple dialects. A MAVLink analyzer can decode this traffic in real-time, revealing the complete operational state of a drone.</p>' +
               '<p>In this project you will use pymavlink to connect to a drone or simulator, decode MAVLink messages, inject commands, analyze the attack surface, and build a traffic analyzer that logs and visualizes drone telemetry.</p>',

        wiring: '    MAVLink Communication Path\n' +
                '    \n' +
                '    Drone (ArduPilot)       Telemetry Link       GCS\n' +
                '    +---------------+       +----------+       +--------+\n' +
                '    | Flight Ctrl   |<----->| Radio    |<----->| Mission|\n' +
                '    | (Pixhawk/CUAV)|  UART | SiK 915  | USB   | Planner|\n' +
                '    +-------+-------+       +----------+       +---+----+\n' +
                '            |                                      |\n' +
                '            | MAVLink v2 (unencrypted)             |\n' +
                '            |                                      |\n' +
                '    +-------+--------------------------------------+----+\n' +
                '    |            MAVProxy (man-in-the-middle)           |\n' +
                '    |     Intercept, log, inject, modify messages       |\n' +
                '    +--------------------------------------------------+',

        wiringNotes: '<p><strong>MAVLink v2:</strong> Adds message signing (optional) which provides authentication but not encryption. Most deployments do not enable signing. Even with signing, telemetry is readable &mdash; only command injection is prevented.</p>' +
                     '<p><strong>SITL (Software In The Loop):</strong> ArduPilot SITL simulates a full drone in software. No hardware needed. You can practice MAVLink analysis, command injection, and protocol fuzzing safely against a virtual drone.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Set Up ArduPilot SITL Simulator',
                content: '<p>Install ArduPilot SITL to simulate a drone without any hardware. SITL creates a full virtual drone with GPS, IMU, motors, and MAVLink telemetry &mdash; identical to a real flight controller.</p>',
                code: '# Install ArduPilot SITL dependencies\nsudo apt install -y git python3-pip python3-dev python3-matplotlib \\\n    python3-lxml python3-wxgtk4.0 libxml2-dev libxslt1-dev\n\n# Clone ArduPilot\ngit clone --recurse-submodules https://github.com/ArduPilot/ardupilot.git\ncd ardupilot\n\n# Install Python dependencies\npip3 install pymavlink MAVProxy\n\n# Build SITL for ArduCopter\n./Tools/autotest/sim_vehicle.py -v ArduCopter --map --console\n# This launches a simulated quadcopter at default location\n# MAVProxy connects automatically on localhost:14550\n\n# In another terminal, connect MAVProxy to the SITL:\nmavproxy.py --master=tcp:127.0.0.1:5760 --out=udp:127.0.0.1:14550\n\n# Basic MAVProxy commands:\n# arm throttle        — arm the motors\n# mode GUIDED         — switch to guided mode\n# takeoff 50          — take off to 50m altitude\n# wp list             — list mission waypoints\n# param show          — show all parameters\n# link list           — show active connections',
                language: 'Bash',
                tip: '<strong>SITL is safe:</strong> SITL is a full software simulation. No hardware, no risk. You can crash the virtual drone, inject malicious commands, fuzz the protocol &mdash; all without consequences. This is the ideal environment for security research.'
            },
            {
                title: 'Decode MAVLink Messages with pymavlink',
                content: '<p>Connect to the drone (or SITL) with pymavlink and decode the message stream. Every piece of telemetry flows through MAVLink &mdash; position, attitude, battery, RC channels, and system status.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>Intelligence value:</strong> A 30-second MAVLink capture reveals the drone type, firmware version, GPS position, altitude, heading, battery state, flight mode, and pilot RC inputs. This is complete situational awareness of the target drone.'
            },
            {
                title: 'MAVLink Command Injection',
                content: '<p>Send MAVLink commands to a drone without authorization. On systems without message signing, any device that can reach the MAVLink channel can issue commands &mdash; including arm, disarm, change mode, set waypoints, and trigger failsafe.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>Real-world impact:</strong> These exact commands work against any ArduPilot drone without MAVLink signing enabled. An attacker on the telemetry radio channel (SiK radio, WiFi UDP, or any MAVLink forwarding link) can arm, disarm, redirect, or crash the drone.'
            },
            {
                title: 'Build Traffic Analyzer with Logging',
                content: '<p>Create a comprehensive MAVLink traffic analyzer that captures all messages, logs them for forensic analysis, and identifies anomalous command sequences that may indicate an attack.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Enable MAVLink signing:</strong> To defend against command injection, enable MAVLink v2 message signing in ArduPilot: <code>param set BRD_SERIAL_NUM &lt;key&gt;</code>. This adds HMAC-SHA256 authentication to commands. Telemetry remains readable but commands require the signing key.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>ArduPilot SITL launches and MAVProxy connects successfully</li>' +
                 '<li>pymavlink decodes HEARTBEAT, GPS, ATTITUDE, and SYS_STATUS messages</li>' +
                 '<li>Command injection successfully arms, takes off, and redirects SITL drone</li>' +
                 '<li>Traffic analyzer captures and logs all MAVLink messages to JSON</li>' +
                 '<li>Anomaly detection flags unexpected source systems and dangerous commands</li>' +
                 '<li>Message summary shows correct counts per message type</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>ArduPilot SITL fails to launch:</strong> Ensure all dependencies are installed, especially <code>python3-matplotlib</code> and <code>python3-wxgtk4.0</code>. On Ubuntu 22.04+, wxPython may need to be installed via pip: <code>pip3 install wxPython</code>. The SITL build can take 5-10 minutes on the first run. Check <code>Tools/autotest/sim_vehicle.py --help</code> for options.</li>' +
                         '<li><strong>pymavlink connection times out:</strong> Verify the correct connection string. For SITL on the same machine: <code>udp:127.0.0.1:14550</code> or <code>tcp:127.0.0.1:5760</code>. For a real drone via USB: <code>/dev/ttyACM0</code> or <code>/dev/ttyUSB0</code>. Check that MAVProxy is running and forwarding on the expected port.</li>' +
                         '<li><strong>Command injection commands are rejected:</strong> SITL may need to be armed first. Some commands are only accepted in specific flight modes. Try <code>mode GUIDED</code> before sending position commands. Check that the target system and component IDs match the SITL instance (typically sysid=1, compid=1).</li>' +
                         '<li><strong>HEARTBEAT messages received but no GPS data:</strong> Request data streams explicitly: <code>mav.mav.request_data_stream_send(target_sys, target_comp, mavutil.mavlink.MAV_DATA_STREAM_ALL, 4, 1)</code>. SITL does not send all message types until they are requested. The stream rate (4 Hz in this example) controls how often messages are sent.</li>' +
                         '<li><strong>MAVProxy shows "no heartbeat" and disconnects:</strong> The connection was lost or SITL crashed. Restart SITL and reconnect. If using a real drone, check the telemetry radio link. MAVProxy drops the connection after 5 seconds without a heartbeat by default.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Protocol Fuzzing</strong> &mdash; Send malformed MAVLink messages to SITL and observe the response. Try invalid system IDs, out-of-range parameter values, oversized payloads, and unknown message types. Document which malformed messages crash SITL, which are silently ignored, and which produce error responses.</p>' +
                    '<p><strong>Challenge 2: Traffic Replay</strong> &mdash; Capture a MAVLink session (SITL arm, takeoff, fly, land) to a binary log. Write a script that replays the captured traffic to a fresh SITL instance. Does the drone follow the same flight path? Analyze why replay succeeds or fails based on timing and state dependencies.</p>' +
                    '<p><strong>Challenge 3: Intrusion Detection Rules</strong> &mdash; Write a set of detection rules for a MAVLink IDS (Intrusion Detection System). Rules should flag: commands from unexpected source IDs, ARM commands outside a geofence, mode changes to unsafe modes, mission uploads during flight, and parameter changes to security-critical settings. Test each rule against SITL.</p>',

        commonMistakes: [
            {
                title: 'Forgetting to Request Data Streams',
                correct: 'Explicitly request data streams after connecting: <code>mav.mav.request_data_stream_send(sys, comp, MAV_DATA_STREAM_ALL, rate, 1)</code>. This tells the drone to send telemetry at the specified rate.',
                incorrect: 'Connecting to the drone and immediately trying to read GPS_RAW_INT or ATTITUDE messages without first requesting streams.',
                consequence: 'No telemetry messages are received. The drone sends only HEARTBEAT by default until data streams are requested. This is a flow control mechanism in MAVLink &mdash; the ground station must ask for the data it wants.'
            },
            {
                title: 'Testing Command Injection on a Real Drone',
                correct: 'Always test command injection, fuzzing, and attack techniques against ArduPilot SITL (software simulation). Never test against a real drone until the technique is fully understood and controlled.',
                incorrect: 'Connecting pymavlink to a real quadcopter and sending ARM, TAKEOFF, or SET_MODE commands without understanding the consequences.',
                consequence: 'The drone may actually arm and attempt to fly, potentially causing a crash, injury, or property damage. SITL simulates the complete drone behavior safely in software. There is no reason to risk real hardware during security research.'
            },
            {
                title: 'Assuming MAVLink Signing is Enabled by Default',
                correct: 'MAVLink v2 message signing is optional and disabled by default in ArduPilot. You must explicitly enable it and configure a signing key on both the drone and ground station.',
                incorrect: 'Assuming that upgrading to MAVLink v2 automatically provides authentication and encryption.',
                consequence: 'Command injection attacks work against any MAVLink v2 system without signing enabled. MAVLink v2 adds message signing as a capability but does not enforce it. Most field-deployed drones have signing disabled because it requires key management infrastructure.'
            }
        ]
    },

    // ========================================================================
    // SG-88: Geofencing Security
    // ========================================================================
    'sg-88': {
        intro: '<p>Geofencing restricts where a drone can fly by defining virtual boundaries in software. ArduPilot supports polygon and circular geofences that trigger failsafe actions (RTL, land, or report-only) when breached. DJI implements hardware-enforced geofencing that prevents flight near airports and sensitive facilities. Both systems have bypass vulnerabilities.</p>' +
               '<p>ArduPilot geofences are stored as parameters in the flight controller &mdash; they can be modified by anyone with MAVLink access. DJI geofencing relies on a GPS position check against a database stored on the drone. GPS spoofing can fool the position check, and firmware modifications can disable the database lookup entirely. Even DJI\'s online unlock system has been reverse-engineered.</p>' +
               '<p>In this project you will configure ArduPilot geofences, test breach behavior, analyze bypass methods, and understand the architectural limitations that make geofencing a policy control rather than a security control.</p>',

        wiring: '    Geofence Architecture\n' +
                '    \n' +
                '    +-------------------------------------------+\n' +
                '    |              Geofence Polygon             |\n' +
                '    |                                           |\n' +
                '    |    +----+  Max Alt: 120m                  |\n' +
                '    |    |HOME|                                 |\n' +
                '    |    +----+     * Drone                     |\n' +
                '    |                   \\                       |\n' +
                '    |                    \\  Approaching fence   |\n' +
                '    |                     \\                     |\n' +
                '    |===========================================|\n' +
                '    |  BREACH -> Failsafe triggers:             |\n' +
                '    |  0: Report only  1: RTL  2: Land  3: Brake|\n' +
                '    +-------------------------------------------+\n' +
                '    \n' +
                '    Fence Types: Circle (radius) or Polygon (vertices)',

        wiringNotes: '<p><strong>ArduPilot vs DJI:</strong> ArduPilot geofencing is software-enforced and fully configurable by the operator. DJI geofencing is firmware-enforced with an online unlock portal. Neither is tamper-proof: ArduPilot fences are parameters, DJI fences can be bypassed with modified firmware or GPS spoofing.</p>' +
                     '<p><strong>Regulatory context:</strong> Geofencing is required by regulation in some jurisdictions (EU drone regulation 2019/947). Understanding bypass methods is essential for security assessors evaluating drone fleet compliance.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Configure ArduPilot Geofence',
                content: '<p>Set up circular and polygon geofences in ArduPilot using MAVProxy and parameter configuration. Define the boundary, altitude limits, and failsafe action.</p>',
                code: '# In MAVProxy connected to SITL:\n# Enable circular geofence\nparam set FENCE_ENABLE 1\nparam set FENCE_TYPE 7\n# FENCE_TYPE bitmask: 1=max alt, 2=circle, 4=polygon\n# 7 = all three enabled\n\nparam set FENCE_ALT_MAX 120      # Max altitude 120m\nparam set FENCE_RADIUS 500       # Circle radius 500m from home\nparam set FENCE_MARGIN 10        # Warning margin 10m before fence\nparam set FENCE_ACTION 1         # 0=report, 1=RTL, 2=land\n\n# Upload polygon fence via MAVProxy:\nfence load polygon_fence.txt\n\n# Create polygon fence file:\ncat > polygon_fence.txt << \'FENCEEOF\'\n# Geofence polygon (lat lon per line, close the polygon)\n33.7500 -84.3900\n33.7500 -84.3800\n33.7450 -84.3800\n33.7450 -84.3900\n33.7500 -84.3900\nFENCEEOF\n\n# Verify fence is loaded:\nfence list\nfence status\n\n# Test with pymavlink:\npython3 -c "\nfrom pymavlink import mavutil\nmav = mavutil.mavlink_connection(\'udp:127.0.0.1:14550\')\nmav.wait_heartbeat()\nmav.mav.request_data_stream_send(\n    mav.target_system, mav.target_component,\n    mavutil.mavlink.MAV_DATA_STREAM_ALL, 4, 1)\nprint(\'Fence parameters:\')\nfor p in [\'FENCE_ENABLE\',\'FENCE_TYPE\',\'FENCE_ACTION\',\'FENCE_RADIUS\',\'FENCE_ALT_MAX\']:\n    mav.mav.param_request_read_send(mav.target_system, mav.target_component, p.encode(), -1)\n    msg = mav.recv_match(type=\'PARAM_VALUE\', blocking=True, timeout=5)\n    if msg: print(f\'  {msg.param_id}: {msg.param_value}\')\n"',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Test Geofence Breach Behavior',
                content: '<p>Fly the SITL drone into the geofence boundary and observe failsafe activation. Test each failsafe action type and verify the drone responds correctly.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>Failsafe race condition:</strong> If the drone is moving fast enough, it can breach the fence before the failsafe engages. The fence margin parameter (FENCE_MARGIN) adds a buffer, but at high speeds the drone may overshoot. This is a known limitation of software geofencing.'
            },
            {
                title: 'Analyze Geofence Bypass Methods',
                content: '<p>Document and test the known bypass vectors for ArduPilot geofencing. Each bypass exploits a different architectural assumption.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>DJI geofencing bypass:</strong> DJI drones check GPS position against an onboard database. Known bypasses include GPS spoofing (feed position outside restricted zone), firmware modification (patch out the database check), and date rollback (use old firmware without updated restriction zones).'
            },
            {
                title: 'Build Geofence Integrity Monitor',
                content: '<p>Create a monitoring tool that watches for unauthorized geofence modifications and alerts when fence parameters are changed or disabled.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Defense-in-depth:</strong> Geofencing should never be the only safety control. Combine with MAVLink signing (prevent parameter tampering), GPS spoofing detection (SG-85), physical pilot override, and independent flight termination systems.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Geofence configured with circular and altitude limits in SITL</li>' +
                 '<li>Fence breach triggers RTL failsafe when drone crosses boundary</li>' +
                 '<li>Parameter bypass successfully disables fence via MAVLink</li>' +
                 '<li>Fence action downgrade changes behavior from RTL to report-only</li>' +
                 '<li>Integrity monitor detects parameter changes and alerts</li>' +
                 '<li>All four bypass methods documented with mitigations</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Geofence does not trigger when drone crosses boundary:</strong> Verify FENCE_ENABLE is set to 1 and FENCE_TYPE bitmask includes the fence types you configured (1=altitude, 2=circle, 4=polygon; 7=all). Check that FENCE_ACTION is not set to 0 (report-only). In SITL, fly the drone with <code>mode GUIDED</code> and send a position beyond the fence radius.</li>' +
                         '<li><strong>Polygon fence upload fails:</strong> The polygon file must contain at least 4 vertices (forming a closed polygon with the first and last point identical). Verify the coordinate format is decimal degrees, one pair per line. The polygon must be convex &mdash; ArduPilot does not support concave geofence polygons in all versions.</li>' +
                         '<li><strong>SITL drone teleports instead of flying to fence boundary:</strong> In GUIDED mode, use <code>guided lat lon alt</code> in MAVProxy. Alternatively, create a mission in AUTO mode with waypoints that cross the fence. The drone must actually fly toward the boundary, not be teleported with a position override.</li>' +
                         '<li><strong>GPS Rescue failsafe does not return home:</strong> GPS Rescue requires a valid GPS fix and home position. In SITL, verify GPS_RESCUE is configured with appropriate altitude, speed, and angle parameters. The drone must have recorded a valid home position during arming. Check <code>gps_rescue_min_sats</code> parameter.</li>' +
                         '<li><strong>Integrity monitor misses parameter changes:</strong> The monitor may be polling too infrequently. Reduce the polling interval. Also ensure the monitor checks all fence-related parameters, not just FENCE_ENABLE. An attacker may change FENCE_ACTION to 0 (report-only) while leaving FENCE_ENABLE at 1.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Comprehensive Bypass Catalog</strong> &mdash; Document every known geofence bypass method for ArduPilot: parameter modification, fence disable, action downgrade, GPS spoofing, altitude-only bypass, and mission-based circumvention. For each bypass, rate the difficulty (1-5), required access level, and effectiveness. Propose a defense for each.</p>' +
                    '<p><strong>Challenge 2: DJI Geofence Analysis</strong> &mdash; Research DJI FlySafe geofencing: how the database is structured, which areas are restricted, and how the unlock system works. Document the known bypass methods (firmware modification, GPS spoofing, hardware mods). Compare the DJI approach to ArduPilot geofencing in terms of security architecture.</p>' +
                    '<p><strong>Challenge 3: Tamper-Resistant Geofence Design</strong> &mdash; Design a geofence system that resists the bypass methods you discovered. Consider hardware-enforced boundaries, signed parameter storage, multi-sensor position verification, and independent flight termination systems. Write a technical specification for your design.</p>',

        commonMistakes: [
            {
                title: 'Treating Geofencing as a Security Control',
                correct: 'Geofencing is a policy control, not a security control. It works against accidental boundary violations but cannot prevent intentional bypass by a motivated operator with access to the flight controller.',
                incorrect: 'Relying on software geofencing as the primary mechanism to prevent unauthorized drone flights over restricted areas.',
                consequence: 'A false sense of security. ArduPilot geofences are stored as modifiable parameters. Any user with CLI or MAVLink access can disable, modify, or delete them. DJI geofences can be bypassed with modified firmware or GPS spoofing. Geofencing is a layer in defense-in-depth, not a standalone solution.'
            },
            {
                title: 'Testing Fence Bypass on a Real Drone Near Restricted Airspace',
                correct: 'Test all geofence bypass techniques in SITL simulation only. Never test bypass methods on a real drone near airports, military installations, or other restricted areas.',
                incorrect: 'Flying a real drone toward a geofence boundary near an airport to test whether the bypass works in practice.',
                consequence: 'Violating FAA airspace restrictions carries civil penalties up to $27,500 per incident and criminal prosecution for intentional violations. Even if the geofence works correctly, testing near restricted airspace creates real safety risks. SITL provides a complete test environment with zero real-world risk.'
            }
        ]
    },

    // ========================================================================
    // SG-89: FPV Video Security
    // ========================================================================
    'sg-89': {
        intro: '<p>FPV video links operate on 5.8 GHz, transmitting analog or digital video from the drone camera to the pilot goggles. Analog video (used by most racing drones) is completely unencrypted &mdash; anyone with a 5.8 GHz receiver sees the same video feed the pilot sees. Digital systems like DJI FPV and HDZero add some encoding but are not cryptographically secured.</p>' +
               '<p>Video interception is passive and undetectable. The drone broadcasts continuously, and any compatible receiver within range picks up the signal. For security professionals, this means drone surveillance operations using analog FPV are inherently compromised &mdash; the target can watch the surveillance feed in real time with a $30 receiver.</p>' +
               '<p>In this project you will intercept analog FPV video feeds, analyze 5.8 GHz video channels, explore video link encryption options, and build a video monitoring station that detects and displays nearby FPV feeds.</p>',

        wiring: '    FPV Video Interception Setup\n' +
                '    \n' +
                '    Drone with VTX                 Attacker\n' +
                '    +------------------+            +------------------+\n' +
                '    | Camera -> VTX    |  ~~~5.8G~> | 5.8G RX module   |\n' +
                '    | 5.8 GHz analog   |  ~~~RF~~~> | (any channel RX) |\n' +
                '    | 25mW-600mW       |            +--------+---------+\n' +
                '    +------------------+                     |\n' +
                '                                        AV output\n' +
                '    Pilot (legitimate)                       |\n' +
                '    +------------------+            +--------+---------+\n' +
                '    | FPV Goggles      |            | USB capture card |\n' +
                '    | Same video feed  |            | + Recording PC   |\n' +
                '    +------------------+            +------------------+',

        wiringNotes: '<p><strong>5.8 GHz bands:</strong> FPV video uses the 5.8 GHz ISM band, divided into bands: A, B, E, F (FatShark), R (Raceband). Raceband (R1-R8) is most common for racing. Each band has 8 channels, 40 total. Scanning all 40 channels takes seconds with a module that supports frequency input.</p>' +
                     '<p><strong>Analog vs Digital:</strong> Analog (NTSC/PAL) is completely open. DJI FPV uses a proprietary digital link that is harder to intercept but has been partially reverse-engineered. HDZero is open-source digital video. Walksnail/Avatar is another proprietary system.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Scan 5.8 GHz Video Channels',
                content: '<p>Scan all 40 standard FPV channels to find active video transmitters. Each channel is a specific frequency in the 5.8 GHz band.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Channel identification:</strong> If you detect an active 5.8 GHz signal, match the frequency against the channel table to identify the exact band and channel. This tells you the VTX configuration and helps identify the drone model (racing drones typically use Raceband, DJI uses its own frequencies).'
            },
            {
                title: 'Intercept Analog FPV Video',
                content: '<p>Receive and display an analog FPV video feed using a 5.8 GHz receiver module and USB video capture card. The intercepted video shows exactly what the drone pilot sees, including OSD data.</p>',
                code: '# Hardware needed:\n# - 5.8 GHz FPV receiver module (e.g., Eachine ROTG02, ~$20)\n# - USB AV capture card (EasyCap or similar, ~$10)\n# - Or: FPV goggles with AV output\n\n# Connect: FPV RX -> AV cable -> USB capture card -> Computer\n\n# Check if capture device is detected:\nlsusb | grep -i "video\\|easycap\\|capture"\nls /dev/video*\n\n# View live FPV video with ffplay:\nffplay -i /dev/video0 -video_size 720x480 -input_format mjpeg\n\n# Record intercepted video:\nffmpeg -f v4l2 -video_size 720x480 -i /dev/video0 \\\n    -c:v libx264 -preset fast -crf 23 \\\n    intercepted_fpv_$(date +%Y%m%d_%H%M%S).mp4\n\n# Record with timestamp overlay:\nffmpeg -f v4l2 -video_size 720x480 -i /dev/video0 \\\n    -vf "drawtext=text=\'%{localtime}\':fontsize=18:fontcolor=white:\\\n    x=10:y=10:box=1:boxcolor=black@0.5" \\\n    -c:v libx264 -preset fast evidence_$(date +%Y%m%d_%H%M%S).mp4\n\n# Channel scanning — cycle through all channels:\n# Most FPV receivers have a channel button or serial control\n# For programmable receivers (RX5808 module):\n# python3 spi_control.py --scan-all  # custom script for SPI-controlled RX\n\necho "Intercepted video saved with timestamp."',
                language: 'Bash',
                tip: '<strong>OSD data extraction:</strong> The intercepted analog video includes the OSD overlay &mdash; GPS coordinates, altitude, battery voltage, home direction, craft name, and flight mode. This is intelligence-grade data captured passively from a $20 receiver.'
            },
            {
                title: 'Analyze Digital Video Link Security',
                content: '<p>Examine the security properties of digital FPV systems (DJI, HDZero, Walksnail). Digital links add encoding but their security varies significantly.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Build Encrypted Video Link',
                content: '<p>Implement an encrypted video link using standard IP video streaming over an encrypted tunnel. This demonstrates what secure drone video should look like.</p>',
                code: '# Encrypted drone video link proof-of-concept\n# Uses: Raspberry Pi (on drone) + WireGuard tunnel + RTSP\n\n# === On the drone (Raspberry Pi) ===\n# Install WireGuard and streaming tools:\nsudo apt install -y wireguard ffmpeg\n\n# Generate WireGuard keys:\nwg genkey | tee drone_private.key | wg pubkey > drone_public.key\n\n# Configure WireGuard tunnel:\nsudo cat > /etc/wireguard/wg-drone.conf << \'WGEOF\'\n[Interface]\nAddress = 10.13.37.2/24\nPrivateKey = <drone_private_key>\n\n[Peer]\nPublicKey = <ground_station_public_key>\nEndpoint = <ground_station_ip>:51820\nAllowedIPs = 10.13.37.0/24\nPersistentKeepalive = 25\nWGEOF\n\n# Start encrypted tunnel:\nsudo wg-quick up wg-drone\n\n# Stream video over encrypted tunnel:\nffmpeg -f v4l2 -video_size 1280x720 -framerate 30 -i /dev/video0 \\\n    -c:v libx264 -preset ultrafast -tune zerolatency -b:v 2M \\\n    -f mpegts udp://10.13.37.1:5600\n\n# === On the ground station ===\nsudo wg-quick up wg-drone\n\n# Receive encrypted video:\nffplay -i udp://10.13.37.1:5600 -fflags nobuffer \\\n    -flags low_delay -framedrop\n\n# Verify encryption — capture on WiFi interface:\n# tcpdump shows only WireGuard (UDP 51820) encrypted packets\n# No readable video data in the capture\nsudo tcpdump -i wlan0 -c 100 -w encrypted_test.pcap\ntshark -r encrypted_test.pcap -T fields -e udp.port | sort | uniq -c',
                language: 'Bash',
                tip: '<strong>Latency tradeoff:</strong> WireGuard adds ~1-2ms of encryption overhead. Combined with IP video encoding latency (~50-100ms), total latency is 60-100ms. This is acceptable for autonomous or slow-flight operations but too high for FPV racing (which requires under 30ms). Security and performance are always in tension.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>5.8 GHz channel map covers all 40 standard FPV frequencies</li>' +
                 '<li>Analog FPV video successfully intercepted and recorded (if hardware available)</li>' +
                 '<li>OSD data visible in intercepted video (GPS, altitude, battery)</li>' +
                 '<li>Digital video system analysis documents vulnerabilities for DJI, HDZero, Walksnail</li>' +
                 '<li>WireGuard encrypted video link streams with no readable data in packet capture</li>' +
                 '<li>Latency measured and documented for encrypted vs unencrypted video</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>USB capture card not detected:</strong> Check <code>lsusb</code> for the capture device and <code>ls /dev/video*</code> for video devices. Install the v4l-utils package: <code>sudo apt install v4l-utils</code>. Some cheap EasyCap clones use the UTV007 chipset which requires the <code>usbtv</code> kernel module. Try <code>sudo modprobe usbtv</code>.</li>' +
                         '<li><strong>ffplay shows black screen or "No video" error:</strong> Try different input parameters: <code>-input_format yuyv422</code> instead of <code>mjpeg</code>, or adjust the video size to <code>720x480</code> (NTSC) or <code>720x576</code> (PAL). Check the capture card capabilities with <code>v4l2-ctl --list-formats-ext -d /dev/video0</code>.</li>' +
                         '<li><strong>5.8 GHz video shows static on all channels:</strong> Verify the FPV receiver is powered correctly (usually 5V) and the antenna is connected. If no active VTX is nearby, all channels will show static. Power on a drone or standalone VTX to test. Also verify the receiver is not in a band your VTX does not use.</li>' +
                         '<li><strong>WireGuard tunnel has high latency or drops:</strong> Check the WiFi link quality between drone and ground station. WireGuard itself adds minimal latency (~1-2ms), but the underlying WiFi link may be congested or weak. Use <code>wg show</code> to monitor handshake timing and data transfer. Reduce video bitrate if bandwidth is insufficient.</li>' +
                         '<li><strong>OSD data not visible in intercepted video:</strong> The OSD overlay is mixed into the analog video signal by the flight controller. If the FC OSD is configured but the video path goes directly from camera to VTX (bypassing the FC), no OSD will be present. Check the wiring between camera, FC, and VTX.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Channel Scanner Build</strong> &mdash; Build an automated 5.8 GHz channel scanner using an RX5808 module controlled via SPI from an Arduino or Raspberry Pi. Scan all 40 standard FPV channels and display a power level heatmap. Log active channels with timestamps for surveillance detection.</p>' +
                    '<p><strong>Challenge 2: Video Encryption Benchmark</strong> &mdash; Measure the end-to-end latency of the encrypted WireGuard video link versus the unencrypted analog link. Use a stopwatch displayed on the camera feed to measure glass-to-glass latency. Document the tradeoff between security and latency for different use cases (racing, inspection, surveillance).</p>' +
                    '<p><strong>Challenge 3: Digital FPV Protocol Analysis</strong> &mdash; Research the DJI FPV digital video link protocol. Document what is known about the encoding, error correction, and any security mechanisms. Compare the security properties of DJI digital, HDZero, and Walksnail Avatar. Which system is most resistant to interception? Which is most resistant to jamming?</p>',

        commonMistakes: [
            {
                title: 'Assuming Digital FPV is Encrypted',
                correct: 'Understand that most digital FPV systems (DJI, HDZero, Walksnail) use proprietary encoding but not cryptographic encryption. The signal is harder to intercept than analog but is not secured against a determined adversary with the right hardware.',
                incorrect: 'Assuming that because the video is "digital" it is automatically encrypted and secure against interception.',
                consequence: 'False sense of security for drone surveillance operations using digital FPV. DJI FPV video has been partially reverse-engineered. HDZero is open-source. The encoding provides obfuscation, not security. Treat any FPV video link as potentially compromised unless cryptographic encryption is explicitly implemented.'
            },
            {
                title: 'Recording Intercepted Video Without Legal Consideration',
                correct: 'Understand the legal framework for intercepting radio signals in your jurisdiction. In most countries, receiving openly broadcast analog signals is legal, but recording and distributing the content may have restrictions.',
                incorrect: 'Recording intercepted FPV video feeds from other pilots without their knowledge or consent and sharing the recordings.',
                consequence: 'Potential privacy violations and legal issues depending on jurisdiction and context. While receiving openly broadcast signals is generally legal, recording someone else\'s drone camera feed may raise privacy concerns, especially if the feed shows private property or individuals.'
            },
            {
                title: 'Using Wrong Video Standard (NTSC vs PAL)',
                correct: 'Match the USB capture card input format to the VTX output standard. Most FPV systems in the Americas use NTSC (720x480, 29.97 fps). European systems often use PAL (720x576, 25 fps).',
                incorrect: 'Configuring the capture software for PAL when the VTX outputs NTSC, or vice versa.',
                consequence: 'The video displays with rolling horizontal bars, incorrect colors, or no picture at all. The capture card must be configured for the correct standard to properly synchronize with the incoming video signal.'
            }
        ]
    },

    // ========================================================================
    // SG-90: Autonomous Mission Planning
    // ========================================================================
    'sg-90': {
        intro: '<p>Autonomous drone missions remove the pilot from the control loop. The drone follows pre-programmed waypoints, executing actions at each point: take photos, orbit a structure, change altitude, adjust speed. Mission planning software (Mission Planner, QGroundControl) creates these flight plans and uploads them to the drone via MAVLink. The attack surface is substantial.</p>' +
               '<p>Every waypoint is a MAVLink MISSION_ITEM message containing GPS coordinates, altitude, speed, and action commands. These messages are transmitted without encryption. An attacker who can inject or modify waypoints controls the autonomous flight path. A modified waypoint could redirect the drone over restricted airspace, into a building, or to an attacker-controlled recovery point.</p>' +
               '<p>In this project you will create autonomous missions programmatically, analyze the waypoint protocol for injection vulnerabilities, test mission modification attacks against SITL, and implement integrity checks for mission files.</p>',

        wiring: '    Autonomous Mission Architecture\n' +
                '    \n' +
                '    Mission Planner / QGC           Flight Controller\n' +
                '    +-------------------+           +----------------+\n' +
                '    | Create waypoints  |  MAVLink  | Execute mission|\n' +
                '    | Upload mission    |---------->| Navigate WPs   |\n' +
                '    | Monitor progress  |<----------| Report status  |\n' +
                '    +-------------------+           +-------+--------+\n' +
                '                                            |\n' +
                '    Attacker (on MAVLink channel)            |\n' +
                '    +-------------------+                    v\n' +
                '    | Inject waypoints  |           +--------+-------+\n' +
                '    | Modify mission    |           | WP1 -> WP2 ->  |\n' +
                '    | Replace targets   |           | WP3 -> WP4 ->  |\n' +
                '    +-------------------+           | RTL             |\n' +
                '                                    +----------------+',

        wiringNotes: '<p><strong>Mission protocol:</strong> MAVLink mission protocol uses MISSION_COUNT, MISSION_REQUEST, MISSION_ITEM sequence. The GCS sends count, FC requests each item by index, GCS sends items. No authentication at any step.</p>' +
                     '<p><strong>QGroundControl:</strong> Open-source GCS that works with ArduPilot and PX4. Saves missions as <code>.plan</code> files (JSON format). These files can be modified with any text editor &mdash; changing coordinates, altitudes, or actions.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Create Mission Programmatically',
                content: '<p>Build autonomous missions using pymavlink. Each waypoint is a MISSION_ITEM with GPS coordinates, altitude, action type, and parameters.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Mission Injection Attack',
                content: '<p>Demonstrate waypoint injection by replacing an existing mission with modified coordinates while the drone is in flight. This redirects the autonomous flight path to attacker-controlled locations.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>In-flight replacement:</strong> ArduPilot allows mission replacement even during AUTO mode flight. The drone will begin following the new waypoints immediately. This means an attacker can redirect a drone mid-mission without any authentication.'
            },
            {
                title: 'Mission File Analysis and Tampering',
                content: '<p>QGroundControl mission files (.plan) are JSON. Analyze their structure, implement integrity verification, and demonstrate file-level tampering.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Supply chain attack:</strong> If an attacker compromises the computer running QGroundControl, they can modify .plan files before upload. The pilot reviews waypoints on a map but may not notice subtle coordinate changes (e.g., shifting a survey point 100m over a restricted area).'
            },
            {
                title: 'Implement Mission Integrity Verification',
                content: '<p>Build a mission integrity verification system that signs mission files and detects tampering before upload to the flight controller.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Operational security:</strong> Store the signing key on a hardware token (YubiKey) or HSM. The signing key must never be on the ground station computer &mdash; if the GCS is compromised, the attacker should not be able to sign modified missions. Use a separate, air-gapped signing station.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Autonomous mission created and uploaded to SITL with 5+ waypoints</li>' +
                 '<li>SITL drone follows waypoints in AUTO mode</li>' +
                 '<li>Mission injection successfully replaces waypoints during flight</li>' +
                 '<li>QGroundControl .plan file structure analyzed and documented</li>' +
                 '<li>Mission file tampering changes coordinates without detection</li>' +
                 '<li>HMAC-SHA256 integrity system detects tampered mission files</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Mission upload fails with "MISSION_ACK: ERROR":</strong> Check that the mission items are in the correct sequence (starting from index 0) and that the frame type matches the command. MISSION_ITEM uses MAV_FRAME_GLOBAL_RELATIVE_ALT (3) for most waypoints. Verify the lat/lon values are valid (not zero or out of range).</li>' +
                         '<li><strong>SITL drone does not follow uploaded waypoints:</strong> Switch to AUTO mode after uploading the mission: <code>mode AUTO</code> in MAVProxy. The drone must be armed and airborne before AUTO mode executes the mission. If using GUIDED mode, waypoints are not used &mdash; GUIDED uses direct position commands.</li>' +
                         '<li><strong>Mission injection does not redirect the drone mid-flight:</strong> ArduPilot accepts mission replacement during AUTO mode, but the drone may finish the current waypoint segment before switching to the new mission. Set the current waypoint index with <code>wp set N</code> to force immediate navigation to the new waypoint.</li>' +
                         '<li><strong>.plan file integrity check always fails:</strong> Ensure the HMAC is computed over the exact same byte sequence that was signed. Whitespace differences, JSON key ordering, and line endings can change the hash. Canonicalize the JSON before signing by using <code>json.dumps(data, sort_keys=True, separators=(',', ':'))</code>.</li>' +
                         '<li><strong>pymavlink MISSION_COUNT not acknowledged:</strong> The flight controller may be busy or the MAVLink connection is unstable. Add retries with timeout. Check that the target system and component IDs are correct. Some SITL configurations require the mission protocol to be explicitly started with MISSION_COUNT before sending items.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Man-in-the-Middle Mission Modification</strong> &mdash; Using MAVProxy as a transparent proxy between QGroundControl and SITL, intercept mission uploads and silently modify one waypoint coordinate by 100 meters. Verify that QGroundControl does not detect the modification. This demonstrates the danger of unauthenticated MAVLink channels.</p>' +
                    '<p><strong>Challenge 2: Mission File Forensics</strong> &mdash; Given a QGroundControl .plan file, write a script that extracts and visualizes the planned flight path on a map. Calculate total flight distance, estimated flight time, and identify any waypoints near restricted airspace using a database of airport locations. This is the forensic analysis needed when a mission file is recovered from a seized device.</p>' +
                    '<p><strong>Challenge 3: Signed Mission Pipeline</strong> &mdash; Build a complete mission signing and verification pipeline: create missions in QGroundControl, sign them with a hardware-backed key (or simulated HSM), upload only signed missions to the drone, and have the drone verify signatures before executing. Test the system against file tampering, replay, and key compromise scenarios.</p>',

        commonMistakes: [
            {
                title: 'Uploading Missions Without Verifying Coordinates',
                correct: 'Visually verify all waypoint coordinates on a map before uploading to the flight controller. Check that no waypoints are in restricted airspace, over populated areas, or beyond visual line of sight.',
                incorrect: 'Programmatically generating waypoints and uploading them without human verification of the flight path.',
                consequence: 'Waypoints with typos in coordinates (e.g., wrong sign on longitude) can send the drone to unexpected locations. A waypoint at 33.75N, 84.39W (missing the negative sign on longitude) is in China instead of Atlanta. Coordinate errors in autonomous missions are unforgiving.'
            },
            {
                title: 'Using Simple File Hashing Instead of HMAC for Integrity',
                correct: 'Use HMAC-SHA256 with a secret key for mission file integrity verification. The key must be pre-shared between the signing station and the drone.',
                incorrect: 'Computing a SHA-256 hash of the mission file and storing it alongside the file for "integrity checking."',
                consequence: 'An attacker who modifies the mission file can simply recompute the SHA-256 hash and replace it. Without a secret key (as in HMAC), the hash provides no protection against intentional tampering. Only HMAC or digital signatures provide authentication.'
            },
            {
                title: 'Not Considering Mission Replay Attacks',
                correct: 'Include a timestamp or sequence number in the signed mission payload. The drone should reject missions with stale timestamps or previously used sequence numbers.',
                incorrect: 'Signing mission files without any anti-replay mechanism, allowing a captured signed mission to be uploaded at any future time.',
                consequence: 'An attacker who captures a legitimately signed mission can replay it later, even if the mission is no longer appropriate. A survey mission signed for Monday can be replayed on Friday to redirect the drone to an unintended location.'
            }
        ]
    },

    // ========================================================================
    // SG-91: Drone Forensics
    // ========================================================================
    'sg-91': {
        intro: '<p>When a drone is recovered after an incident &mdash; a crash, an unauthorized flight, a surveillance operation &mdash; the flight controller contains a forensic goldmine. Flight logs record every sensor reading, every GPS coordinate, every pilot input, and every system event from power-on to power-off. These logs can reconstruct the entire flight path, identify the pilot, and reveal the drone\'s operational history.</p>' +
               '<p>ArduPilot stores binary DataFlash logs (.bin) on an SD card or internal flash. Betaflight stores Blackbox logs (.bbl). DJI stores encrypted flight records in the drone and on the DJI app. Each format requires different tools to extract and decode, but all contain the same fundamental data: where the drone went, what it did, and when it did it.</p>' +
               '<p>In this project you will extract flight logs from multiple drone platforms, reconstruct GPS tracks, recover video files from SD cards, and perform timeline analysis to build a complete forensic picture of a drone\'s operational history.</p>',

        wiring: '    Drone Forensics Workflow\n' +
                '    \n' +
                '    Recovered Drone\n' +
                '    +------------------+\n' +
                '    | Flight Controller |---> SD Card ---> DataFlash logs\n' +
                '    | Camera/SD        |---> SD Card ---> Video/photos\n' +
                '    | ESC telemetry    |---> FC logs\n' +
                '    | GPS module       |---> Position logs\n' +
                '    | Receiver         |---> Binding info (pilot ID)\n' +
                '    +------------------+\n' +
                '            |\n' +
                '            v\n' +
                '    +------------------+\n' +
                '    | Forensic Station |\n' +
                '    | - Log parsers    |\n' +
                '    | - GPS track plot |\n' +
                '    | - Video recovery |\n' +
                '    | - Timeline build |\n' +
                '    +------------------+',

        wiringNotes: '<p><strong>Evidence handling:</strong> Treat the drone as digital evidence. Photograph before disassembly. Remove SD cards with anti-static precautions. Create forensic images (dd) before analysis. Document chain of custody. Work on copies, never originals.</p>' +
                     '<p><strong>Log formats:</strong> ArduPilot DataFlash (.bin), Betaflight Blackbox (.bbl/.bfl), DJI (.txt encrypted), PX4 ULog (.ulg). Each requires specific parsing tools. pymavlink handles ArduPilot, Blackbox Explorer handles Betaflight.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Extract and Parse ArduPilot Flight Logs',
                content: '<p>ArduPilot DataFlash logs contain every sensor reading at up to 400 Hz. Extract logs from the SD card and parse them to reconstruct the flight.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Home position:</strong> The first GPS fix after arming reveals the launch location &mdash; likely where the pilot was standing. Correlate with local camera footage or cell tower records for pilot identification.'
            },
            {
                title: 'Reconstruct GPS Track and Export KML',
                content: '<p>Convert flight log GPS data into KML format for visualization in Google Earth. The reconstructed track shows exactly where the drone flew, with altitude and speed data.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Multi-flight analysis:</strong> ArduPilot creates a new log file for each power cycle. Analyzing all logs on an SD card reveals the drone\'s complete operational history &mdash; every flight, every location, every pilot input. This is equivalent to a car\'s black box recorder.'
            },
            {
                title: 'Recover Deleted Files from SD Card',
                content: '<p>Recover deleted video, photos, and log files from the drone\'s SD card using forensic recovery tools. Pilots often delete evidence before surrendering a drone.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>EXIF data:</strong> Recovered JPEG photos contain EXIF metadata with GPS coordinates, timestamps, camera model, and sometimes drone serial numbers. Use <code>exiftool</code> to extract: <code>exiftool -gps* -DateTimeOriginal recovered_photo.jpg</code>'
            },
            {
                title: 'Build Forensic Timeline Report',
                content: '<p>Combine all extracted evidence into a comprehensive forensic timeline: flight logs, GPS tracks, video files, system events, and parameter changes.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Pilot identification:</strong> The receiver binding phrase, radio MAC address, and DJI account (for DJI drones) link the drone to a specific pilot. Combined with launch-point GPS and CCTV, pilot identification is often achievable even from a crashed drone with no registration markings.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Forensic SD card image created with SHA-256 hash for integrity</li>' +
                 '<li>ArduPilot DataFlash logs parsed showing GPS, modes, battery, and events</li>' +
                 '<li>GPS track exported to KML and viewable in Google Earth</li>' +
                 '<li>Deleted files recovered from SD card image using foremost</li>' +
                 '<li>Filesystem timeline generated showing all file activity</li>' +
                 '<li>Complete forensic report generated with timeline and findings</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>DataFlash log file (.bin) will not parse:</strong> The log may be from a different firmware version than your parser expects. Use <code>mavlogdump.py</code> from pymavlink which auto-detects the format: <code>mavlogdump.py --type GPS flight.bin</code>. If the file is truncated (from a crash or power loss), the parser may fail on the last entries &mdash; try <code>--robust</code> flag.</li>' +
                         '<li><strong>No GPS data in the flight log:</strong> GPS logs are only recorded after the GPS module acquires a fix. If the drone was flown indoors or the GPS module was disconnected, there will be no position data. Check for IMU data (ACC, GYRO) which is always recorded regardless of GPS status.</li>' +
                         '<li><strong>Deleted file recovery produces corrupted files:</strong> Flash memory wear leveling and TRIM operations can overwrite deleted data. The sooner recovery is attempted after deletion, the better. If the SD card was used heavily after the target files were deleted, recovery probability decreases. Use <code>foremost</code> or <code>photorec</code> which work on raw sectors, bypassing the filesystem.</li>' +
                         '<li><strong>KML export shows track at ground level:</strong> The altitude field in the log may use relative altitude (AGL) while KML expects absolute altitude (MSL). Add the home position altitude to each waypoint altitude for correct display: <code>kml_alt = gps_alt + home_alt_msl</code>.</li>' +
                         '<li><strong>Forensic image hash does not match after analysis:</strong> If you modified the original SD card or worked on the original instead of a forensic copy, the hash will change. Always create a forensic image first with <code>dd</code> and work only on the copy. The original evidence must remain unmodified to maintain chain of custody.</li>' +
                         '<li><strong>Betaflight Blackbox logs (.bbl) not recognized:</strong> Blackbox logs use a different format than ArduPilot DataFlash. Use Betaflight Blackbox Explorer (desktop app) or <code>blackbox_decode</code> CLI tool to convert to CSV: <code>blackbox_decode flight.bbl</code>. The CSV output can then be parsed with standard tools.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-Flight Reconstruction</strong> &mdash; Given an SD card with multiple flight logs (simulate by generating several SITL flights), reconstruct the complete operational history of the drone. Build a timeline showing: all flight dates/times, total flight hours, launch and landing locations, maximum altitude and range for each flight, and any parameter changes between flights.</p>' +
                    '<p><strong>Challenge 2: Pilot Attribution</strong> &mdash; From a recovered drone\'s flight controller, extract all identifying information: receiver binding parameters, WiFi credentials stored in ESP-based receivers, DJI account info (if applicable), GPS home positions, and serial numbers. Document how each data point could be used to identify the pilot and assess the confidence level of each attribution method.</p>' +
                    '<p><strong>Challenge 3: Anti-Forensics Analysis</strong> &mdash; Research methods a drone operator might use to resist forensic analysis: SD card encryption, secure erase, firmware that disables logging, flight controller memory wipe on tamper detection. For each anti-forensic technique, document the method, its effectiveness, and potential forensic countermeasures.</p>',

        commonMistakes: [
            {
                title: 'Working on Original Evidence Instead of a Forensic Copy',
                correct: 'Create a bit-for-bit forensic image of the SD card using <code>dd if=/dev/sdX of=evidence.img bs=4M</code>. Compute and record the SHA-256 hash of the original. Perform all analysis on the image copy only.',
                incorrect: 'Plugging the SD card into a computer and directly browsing, copying, or deleting files.',
                consequence: 'The original evidence is modified. Modern operating systems may update access timestamps, create hidden files, or trigger auto-mount operations that write to the card. Modified evidence is inadmissible in legal proceedings and the chain of custody is broken.'
            },
            {
                title: 'Ignoring Timestamps and Timezone Differences',
                correct: 'Record the timezone setting of the flight controller and GPS module. Convert all timestamps to UTC for consistent analysis. GPS timestamps are always in UTC but flight controller local time may differ.',
                incorrect: 'Mixing local time and UTC timestamps in the forensic timeline without conversion.',
                consequence: 'Events appear out of order or at incorrect times. A flight that took place at 3:00 PM local time appears at 8:00 PM in the timeline (5-hour UTC offset). This can lead to incorrect correlations with CCTV footage, witness statements, and other time-referenced evidence.'
            },
            {
                title: 'Assuming All Data is in the Flight Logs',
                correct: 'Check multiple data sources: flight controller logs, SD card files, camera footage EXIF data, receiver binding info, VTX settings, and ESC telemetry. Each component stores different pieces of the forensic puzzle.',
                incorrect: 'Analyzing only the DataFlash flight logs and ignoring other data stored on the drone.',
                consequence: 'Critical evidence is missed. Camera photos contain GPS EXIF data that supplements flight logs. Receiver binding parameters identify the pilot. VTX channel settings reveal operational patterns. ESC telemetry shows motor health and loading. A complete forensic analysis requires examining every component.'
            }
        ]
    },

    // ========================================================================
    // SG-92: Swarm Communication
    // ========================================================================
    'sg-92': {
        intro: '<p>Drone swarms coordinate multiple autonomous vehicles through inter-drone communication. Each drone in a swarm must share its position, status, and intentions with its neighbors in real time. This creates a mesh network in the sky &mdash; a distributed system with no single point of failure, but also no centralized security authority.</p>' +
               '<p>Swarm communication protocols must handle dynamic topology (drones joining and leaving), limited bandwidth, high mobility, and real-time constraints. Most research swarms use WiFi mesh, MAVLink relay, or custom UDP protocols. None of the common implementations include authentication or encryption, making swarm networks vulnerable to injection, spoofing, and denial-of-service attacks.</p>' +
               '<p>In this project you will simulate a drone swarm with mesh networking, analyze the communication protocol for security vulnerabilities, inject rogue nodes into the swarm, and implement basic swarm authentication to defend against injection attacks.</p>',

        wiring: '    Drone Swarm Mesh Network\n' +
                '    \n' +
                '    Drone A <-----> Drone B <-----> Drone C\n' +
                '       ^              ^              ^\n' +
                '       |              |              |\n' +
                '       v              v              v\n' +
                '    Drone D <-----> Drone E <-----> Drone F\n' +
                '    \n' +
                '    Each drone: WiFi mesh + MAVLink\n' +
                '    Topology: Dynamic, self-healing\n' +
                '    Protocol: UDP broadcast + heartbeat\n' +
                '    \n' +
                '    +------- Ground Control Station -------+\n' +
                '    | Monitors all nodes via mesh gateway  |\n' +
                '    +--------------------------------------+',

        wiringNotes: '<p><strong>Mesh networking:</strong> Each drone acts as a router, forwarding messages for drones it cannot directly reach. If Drone A can reach Drone B, and Drone B can reach Drone C, then A can communicate with C through B. The mesh self-heals when nodes leave or join.</p>' +
                     '<p><strong>Simulation:</strong> We simulate the swarm entirely in software using threads as virtual drones. Each "drone" gets a UDP socket on localhost with a unique port. This is architecturally identical to a real WiFi mesh swarm but runs on a single machine.</p>',

        wiringSvg: '',

        steps: [
            {
                title: 'Build Swarm Communication Simulator',
                content: '<p>Create a multi-node swarm simulation where each virtual drone broadcasts its position and status via UDP, forming a mesh network.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Inject Rogue Node into Swarm',
                content: '<p>Demonstrate a rogue drone injection attack. A malicious node joins the swarm mesh and broadcasts false position data, disrupting formation flying and collision avoidance.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>Real-world consequences:</strong> A rogue node in a delivery drone swarm could cause collisions by reporting false positions. In military swarms, spoofed nodes could redirect the formation or trigger fratricide. Swarm authentication is an active area of defense research.'
            },
            {
                title: 'Implement Swarm Authentication',
                content: '<p>Add HMAC authentication to swarm messages. Each legitimate drone shares a pre-distributed key and signs every message. Unauthenticated messages are rejected.</p>',
                code: '# Run the analysis script:\npython3 tools/analyze.py\n\n# Or use the quick reference:\ncat docs/reference.txt',
                language: 'Bash',
                tip: '<strong>Key distribution problem:</strong> HMAC requires pre-shared keys. In a static swarm, this is straightforward. In a dynamic swarm where new drones join mid-mission, you need a key distribution protocol. This is the fundamental challenge of swarm security &mdash; how to authenticate newcomers without a central authority.'
            },
            {
                title: 'Analyze Swarm Protocol Security',
                content: '<p>Perform a comprehensive security analysis of swarm communication protocols. Document attack vectors, test defenses, and evaluate protocol resilience.</p>',
                code: '# See project guide for full commands\necho "Refer to the step description above for commands"',
                language: 'Bash',
                tip: '<strong>Open research problem:</strong> Swarm security at scale (100+ nodes) with dynamic membership, contested RF environments, and adversarial conditions is an unsolved problem. Current military swarm programs (DARPA OFFSET, AFRL Golden Horde) are actively researching these challenges. This is cutting-edge work.'
            }
        ],

        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>6-node swarm simulation runs with UDP broadcast heartbeats</li>' +
                 '<li>Each drone maintains neighbor table with position and last-seen time</li>' +
                 '<li>Rogue node injection succeeds against unauthenticated swarm</li>' +
                 '<li>Identity spoofing corrupts neighbor tables with false positions</li>' +
                 '<li>HMAC-authenticated swarm rejects unsigned and forged messages</li>' +
                 '<li>Security analysis documents 6 attack vectors with defenses</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>UDP broadcast messages not received between nodes:</strong> Check firewall rules. UDP broadcast on localhost should work without issues, but if nodes are on different machines, ensure the firewall allows UDP traffic on the configured port range. On Linux: <code>sudo ufw allow 5000:5010/udp</code>. Also verify the broadcast address matches your network configuration.</li>' +
                         '<li><strong>Swarm simulator crashes with "Address already in use":</strong> A previous instance is still running or did not clean up its sockets. Kill remaining processes: <code>pkill -f swarm</code>. Use <code>SO_REUSEADDR</code> socket option in the code to allow port reuse after unclean shutdown.</li>' +
                         '<li><strong>Rogue node injection has no effect:</strong> Verify the rogue node is broadcasting on the same UDP port and using the same message format as legitimate nodes. If the swarm is already running with HMAC authentication, the rogue messages will be rejected. Disable authentication first to demonstrate the vulnerability, then re-enable to demonstrate the defense.</li>' +
                         '<li><strong>HMAC authentication causes excessive latency:</strong> HMAC-SHA256 computation is fast (~1 microsecond per message on modern hardware). If latency is noticeable, the issue is likely in the message parsing or network layer, not the cryptographic operation. Profile the code to identify the actual bottleneck.</li>' +
                         '<li><strong>Nodes lose track of each other frequently:</strong> Increase the heartbeat rate or extend the timeout before marking a node as lost. In a simulated environment on localhost, network delays are negligible, but the heartbeat interval and timeout should be tuned for the expected message rate. Typical values: heartbeat every 1 second, timeout after 5 seconds.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Sybil Attack</strong> &mdash; Implement a Sybil attack where a single rogue node impersonates multiple fake nodes, flooding the swarm with phantom drones. Observe how the legitimate drones react to the influx of false position reports. Determine how many fake nodes are needed to disrupt formation flying. Implement a defense using challenge-response authentication.</p>' +
                    '<p><strong>Challenge 2: Byzantine Fault Tolerance</strong> &mdash; Modify the swarm simulator so that one or more nodes become "Byzantine" &mdash; sending inconsistent or contradictory position data to different neighbors. Implement a consensus algorithm (e.g., majority voting) that allows the swarm to maintain correct behavior despite Byzantine nodes. Test with 1, 2, and 3 Byzantine nodes in a 9-node swarm.</p>' +
                    '<p><strong>Challenge 3: Encrypted Mesh Communication</strong> &mdash; Replace the HMAC-only authentication with full AES-256-GCM encryption for all swarm messages. Implement a key distribution protocol for new nodes joining the swarm mid-mission. Measure the performance impact (messages per second, latency) compared to unencrypted and HMAC-only modes. Analyze whether the overhead is acceptable for real-time swarm coordination.</p>',

        commonMistakes: [
            {
                title: 'Using Symmetric Keys Without Key Rotation',
                correct: 'Implement a key rotation mechanism that periodically updates the shared HMAC key. Use a key derivation function (KDF) to generate new keys from a master secret and a counter or timestamp.',
                incorrect: 'Using a single static HMAC key for the entire operational lifetime of the swarm.',
                consequence: 'A compromised key gives the attacker permanent access to the swarm. If one drone is captured and its key extracted, the attacker can inject or forge messages indefinitely. Key rotation limits the window of vulnerability after a compromise.'
            },
            {
                title: 'Broadcasting Heartbeats Without Rate Limiting',
                correct: 'Set a fixed heartbeat interval (e.g., 1 Hz) and enforce it. Each node should send exactly one heartbeat per interval.',
                incorrect: 'Allowing nodes to broadcast heartbeats as fast as possible to "improve responsiveness."',
                consequence: 'Network flooding. In a 10-node swarm with unrestricted broadcast, each node receives 9 messages per heartbeat cycle. At 100 Hz, that is 900 messages per second per node. This saturates the network, increases latency, and can cause packet loss that degrades swarm coordination.'
            },
            {
                title: 'Trusting Node Self-Reported Identity',
                correct: 'Authenticate node identity using cryptographic mechanisms (HMAC, digital signatures, or challenge-response protocols). Never accept a node ID at face value from an unauthenticated message.',
                incorrect: 'Using the self-reported node ID field in UDP messages as the authoritative identity without any cryptographic verification.',
                consequence: 'Identity spoofing is trivial. An attacker broadcasts a message with a legitimate node\'s ID and a false position. Other nodes update their neighbor tables with the spoofed data, potentially causing collisions, formation errors, or targeted isolation of the impersonated node.'
            }
        ]
    }

};
