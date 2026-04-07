// ============================================================================
// Signal Foundations — Build Guides (sg-01 through sg-05)
// Arduino Mega 2560 projects for cybersecurity students
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-01: Blink & Breadboard — Your First Circuit
    // ========================================================================
    'sg-01': {
        intro: '<p>Every hardware hacker starts here. Before you can sniff packets, flash firmware, or build field tools, you need to understand the fundamentals: how electricity flows through a circuit, how microcontrollers drive output pins, and how to build reliable connections on a breadboard.</p>' +
               '<p>In this project you will wire your first LED circuit from scratch, upload code to your Arduino Mega, and then expand to a multi-LED chase pattern. By the end, you will be comfortable with the Arduino IDE, digital output pins, resistor calculations, and breadboard layout &mdash; the foundation for every project that follows.</p>' +
               '<p>Everything you need is in the ELEGOO Mega kit. No soldering, no extra purchases. Just unbox and build.</p>',

        wiring: '    Arduino Mega 2560            Breadboard\n' +
                '    +----------------+           +---------------------------+\n' +
                '    |                |           |  + rail   - rail          |\n' +
                '    |           GND  |---black---|--+--------[GND rail]     |\n' +
                '    |                |           |                           |\n' +
                '    |   Single LED:  |           |  Row 10:                  |\n' +
                '    |           D2   |---yellow--|--->|--- [220 ohm] ---GND |\n' +
                '    |                |           |   LED    resistor         |\n' +
                '    |   Chase LEDs:  |           |                           |\n' +
                '    |           D3   |---green---|--->|--- [220 ohm] ---GND |\n' +
                '    |           D4   |---blue----|--->|--- [220 ohm] ---GND |\n' +
                '    |           D5   |---red-----|--->|--- [220 ohm] ---GND |\n' +
                '    |           D6   |---white---|--->|--- [220 ohm] ---GND |\n' +
                '    +----------------+           +---------------------------+\n' +
                '\n' +
                '    LED Orientation:\n' +
                '    Long leg (anode +)  ----> Arduino pin (through wire)\n' +
                '    Short leg (cathode -) --> 220 ohm resistor --> GND rail',

        wiringNotes: '<p><strong>Pin reference:</strong> D2&ndash;D6 are digital pins on the Mega\'s double-row header. GND is any of the three GND pins.</p>' +
                     '<p><strong>Resistor value:</strong> 220&Omega; limits current to ~13&ndash;14mA at 5V (accounting for the LED forward voltage drop of ~2V: I = (5V &minus; 2V) / 220&Omega; = 13.6mA). Safe limit for standard LEDs is 20mA. Never connect an LED directly to a pin without a resistor &mdash; you will burn it out.</p>' +
                     '<p><strong>Wire colors:</strong> Black = ground, other colors = signal. Pick a consistent scheme and stick with it.</p>' +
                     '<p><strong>Safety:</strong> Always disconnect the USB cable before adding or changing wires. A misplaced wire on a powered board can short 5V to GND and damage the Mega. Build the habit now &mdash; power off, wire, verify, then reconnect.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg01-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg01-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-01 BLINK &amp; BREADBOARD</text>' +

            '<!-- Arduino Mega -->' +
            '<g>' +
            '<rect x="40" y="80" width="180" height="260" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="80" width="180" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="96" width="180" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="130" y="96" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ARDUINO MEGA 2560</text>' +
            '<!-- USB port -->' +
            '<rect x="16" y="95" width="28" height="22" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="30" y="109" text-anchor="middle" fill="#3b82f6" font-size="6">USB</text>' +
            '<!-- Pin labels -->' +
            '<text x="210" y="140" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="218" cy="137" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="210" y="170" text-anchor="end" fill="#8b949e" font-size="8">D2</text>' +
            '<circle cx="218" cy="167" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="210" y="200" text-anchor="end" fill="#8b949e" font-size="8">D3</text>' +
            '<circle cx="218" cy="197" r="3" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="210" y="230" text-anchor="end" fill="#8b949e" font-size="8">D4</text>' +
            '<circle cx="218" cy="227" r="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="210" y="260" text-anchor="end" fill="#8b949e" font-size="8">D5</text>' +
            '<circle cx="218" cy="257" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="210" y="290" text-anchor="end" fill="#8b949e" font-size="8">D6</text>' +
            '<circle cx="218" cy="287" r="3" fill="#1a1f2b" stroke="#e2e8f0" stroke-width="1"/>' +
            '</g>' +

            '<!-- Breadboard -->' +
            '<g>' +
            '<rect x="380" y="80" width="300" height="260" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="380" y="80" width="300" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="380" y="96" width="300" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="530" y="96" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">BREADBOARD</text>' +
            '<!-- Power rails -->' +
            '<rect x="392" y="112" width="276" height="16" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="400" y="123" fill="#ef4444" font-size="7">+ 5V RAIL</text>' +
            '<rect x="392" y="132" width="276" height="16" rx="3" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="400" y="143" fill="#60a5fa" font-size="7">- GND RAIL</text>' +

            '<!-- LED 1 (D2) -->' +
            '<polygon points="430,175 440,195 420,195" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1"/>' +
            '<text x="430" y="210" text-anchor="middle" fill="#eab308" font-size="7">LED 1</text>' +
            '<rect x="450" y="182" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="470" y="189" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +

            '<!-- LED 2 (D3) -->' +
            '<polygon points="430,225 440,245 420,245" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="430" y="260" text-anchor="middle" fill="#22c55e" font-size="7">LED 2</text>' +
            '<rect x="450" y="232" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="470" y="239" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +

            '<!-- LED 3 (D4) -->' +
            '<polygon points="530,175 540,195 520,195" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="530" y="210" text-anchor="middle" fill="#3b82f6" font-size="7">LED 3</text>' +
            '<rect x="550" y="182" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="570" y="189" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +

            '<!-- LED 4 (D5) -->' +
            '<polygon points="530,225 540,245 520,245" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="530" y="260" text-anchor="middle" fill="#ef4444" font-size="7">LED 4</text>' +
            '<rect x="550" y="232" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="570" y="239" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +

            '<!-- LED 5 (D6) -->' +
            '<polygon points="630,225 640,245 620,245" fill="rgba(226,232,240,0.3)" stroke="#e2e8f0" stroke-width="1"/>' +
            '<text x="630" y="260" text-anchor="middle" fill="#e2e8f0" font-size="7">LED 5</text>' +
            '<rect x="638" y="232" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="658" y="239" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +
            '</g>' +

            '<!-- Wires — arranged top-to-bottom matching pin order -->' +
            '<!-- GND wire (black dashed) -->' +
            '<line x1="221" y1="137" x2="392" y2="140" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3"/>' +
            '<!-- D2 wire (yellow) — to LED 1 -->' +
            '<line x1="221" y1="167" x2="430" y2="175" stroke="#eab308" stroke-width="1.5"/>' +
            '<!-- D3 wire (green) — to LED 2, below LED 1 -->' +
            '<line x1="221" y1="197" x2="430" y2="225" stroke="#22c55e" stroke-width="1.5"/>' +
            '<!-- D4 wire (blue) — to LED 3, right column top -->' +
            '<line x1="221" y1="227" x2="530" y2="175" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<!-- D5 wire (red) — to LED 4, right column bottom -->' +
            '<line x1="221" y1="257" x2="530" y2="225" stroke="#ef4444" stroke-width="1.5"/>' +
            '<!-- D6 wire (white) — to LED 5, far right bottom -->' +
            '<line x1="221" y1="287" x2="630" y2="225" stroke="#e2e8f0" stroke-width="1.5"/>' +

            '<!-- Resistor to GND rail connections -->' +
            '<line x1="490" y1="186" x2="500" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="490" y1="236" x2="510" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="590" y1="186" x2="570" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="590" y1="236" x2="580" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="678" y1="236" x2="650" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +

            '<!-- LED detail callout -->' +
            '<rect x="400" y="300" width="260" height="50" rx="6" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="410" y="316" fill="#eab308" font-size="8" font-weight="600">LED ORIENTATION</text>' +
            '<text x="410" y="332" fill="#8b949e" font-size="7">Long leg (anode +) &#8594; Arduino pin</text>' +
            '<text x="410" y="344" fill="#8b949e" font-size="7">Short leg (cathode -) &#8594; 220&#937; resistor &#8594; GND</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install and Configure the Arduino IDE',
                content: '<p>Download the Arduino IDE from <code>arduino.cc/en/software</code>. Install it, then open it. Go to <strong>Tools &gt; Board</strong> and select <strong>Arduino Mega or Mega 2560</strong>. Plug in your Mega via USB. Under <strong>Tools &gt; Port</strong>, select the COM port that appears (Windows) or <code>/dev/ttyACM0</code> (Linux).</p>' +
                         '<p>If no port appears, you may need to install the CH340 USB driver (common with ELEGOO clones). Search "CH340 driver" for your OS.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> On Linux, add your user to the <code>dialout</code> group: <code>sudo usermod -aG dialout $USER</code> then log out and back in. Otherwise you will get permission denied on the serial port.'
            },
            {
                title: 'Upload the Built-in Blink Sketch',
                content: '<p>Before wiring anything external, verify your board works. Open <strong>File &gt; Examples &gt; 01.Basics &gt; Blink</strong>. This sketch blinks the onboard LED on pin 13. Click the Upload button (right arrow). You should see "Done uploading" and the onboard LED should start blinking.</p>' +
                         '<p>If upload fails, double-check your board and port selections under the Tools menu.</p>',
                code: '// Built-in Blink — already loaded from Examples\n// This blinks the Mega\'s onboard LED (pin 13)\n\nvoid setup() {\n  pinMode(LED_BUILTIN, OUTPUT);  // LED_BUILTIN = pin 13 on Mega\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);  // ON\n  delay(1000);                      // wait 1 second\n  digitalWrite(LED_BUILTIN, LOW);   // OFF\n  delay(1000);                      // wait 1 second\n}',
                language: 'Arduino',
                tip: null
            },
            {
                title: 'Wire Your First External LED',
                content: '<p><strong>Disconnect the USB cable before wiring.</strong> Insert an LED into the breadboard with the <strong>long leg (anode)</strong> in one row and the <strong>short leg (cathode)</strong> in the adjacent row. Connect a 220&Omega; resistor from the cathode row to the ground rail. Run a jumper wire from the anode row to <strong>pin D2</strong> on the Mega, and another from the GND rail to any <strong>GND</strong> pin on the Mega.</p>' +
                         '<p>The circuit path is: Pin D2 &rarr; wire &rarr; LED anode &rarr; LED cathode &rarr; resistor &rarr; GND rail &rarr; wire &rarr; Mega GND.</p>' +
                         '<p>Double-check all connections, then reconnect USB and upload the code.</p>',
                code: '// External LED on pin 2\nconst int LED_PIN = 2;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(500);\n  digitalWrite(LED_PIN, LOW);\n  delay(500);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> If the LED does not light up, flip it around. LEDs only conduct in one direction. The long leg is positive.'
            },
            {
                title: 'Add Serial Feedback',
                content: '<p>Adding serial output lets you confirm what the code is doing. Open <strong>Tools &gt; Serial Monitor</strong> (or press <code>Ctrl+Shift+M</code>) and set the baud rate to <strong>9600</strong> in the bottom-right dropdown.</p>',
                code: 'const int LED_PIN = 2;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n  Serial.begin(9600);\n  Serial.println("SG-01: External LED initialized on pin 2");\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  Serial.println("LED ON");\n  delay(500);\n  \n  digitalWrite(LED_PIN, LOW);\n  Serial.println("LED OFF");\n  delay(500);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The Serial Monitor is your primary debugging tool. Get used to printing status messages &mdash; you will rely on this heavily in later projects.'
            },
            {
                title: 'Wire Multiple LEDs',
                content: '<p><strong>Disconnect USB before adding wires.</strong> Add four more LEDs on pins D3 through D6, each with its own 220&Omega; resistor to ground. Use different color LEDs if you have them. Each LED gets its own row on the breadboard &mdash; do not share rows between different LED circuits.</p>' +
                         '<p>Keep your wiring neat. Short, flat jumper wires are easier to debug than long tangled ones. Reconnect USB and upload when done.</p>',
                code: '// 5 LEDs on pins 2-6\nconst int LED_PINS[] = {2, 3, 4, 5, 6};\nconst int NUM_LEDS = 5;\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < NUM_LEDS; i++) {\n    pinMode(LED_PINS[i], OUTPUT);\n  }\n  Serial.println("SG-01: 5 LEDs initialized on pins 2-6");\n}\n\nvoid loop() {\n  // All on\n  for (int i = 0; i < NUM_LEDS; i++) {\n    digitalWrite(LED_PINS[i], HIGH);\n  }\n  delay(500);\n  \n  // All off\n  for (int i = 0; i < NUM_LEDS; i++) {\n    digitalWrite(LED_PINS[i], LOW);\n  }\n  delay(500);\n}',
                language: 'Arduino',
                tip: null
            },
            {
                title: 'Create a Chase Pattern',
                content: '<p>Now make the LEDs light up in sequence &mdash; a classic "chase" or "Knight Rider" pattern. Each LED turns on, holds briefly, then turns off as the next one lights up. The pattern sweeps back and forth.</p>',
                code: 'const int LED_PINS[] = {2, 3, 4, 5, 6};\nconst int NUM_LEDS = 5;\nconst int CHASE_DELAY = 100;  // ms between steps\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < NUM_LEDS; i++) {\n    pinMode(LED_PINS[i], OUTPUT);\n  }\n  Serial.println("SG-01: Chase pattern active");\n}\n\nvoid loop() {\n  // Sweep forward\n  for (int i = 0; i < NUM_LEDS; i++) {\n    allOff();\n    digitalWrite(LED_PINS[i], HIGH);\n    delay(CHASE_DELAY);\n  }\n  \n  // Sweep backward\n  for (int i = NUM_LEDS - 2; i > 0; i--) {\n    allOff();\n    digitalWrite(LED_PINS[i], HIGH);\n    delay(CHASE_DELAY);\n  }\n}\n\nvoid allOff() {\n  for (int i = 0; i < NUM_LEDS; i++) {\n    digitalWrite(LED_PINS[i], LOW);\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Change <code>CHASE_DELAY</code> to speed up or slow down the pattern. Try values between 50 and 300.'
            }
        ],

        testing: '<p>Verify each stage before moving on:</p>' +
                 '<ul>' +
                 '<li><strong>IDE check:</strong> Board shows "Arduino Mega or Mega 2560" under Tools &gt; Board. Port is selected and not grayed out.</li>' +
                 '<li><strong>Onboard blink:</strong> The small SMD LED near pin 13 blinks at 1 Hz after uploading the default Blink sketch.</li>' +
                 '<li><strong>External LED:</strong> Your wired LED blinks at 2 Hz (500ms on/off). If it stays solid, check your code uploaded correctly.</li>' +
                 '<li><strong>Serial output:</strong> Open Serial Monitor at 9600 baud. You should see "LED ON" / "LED OFF" messages alternating.</li>' +
                 '<li><strong>Multi-LED:</strong> All 5 LEDs blink in unison. If one is dim or off, check its resistor connection and LED orientation.</li>' +
                 '<li><strong>Chase pattern:</strong> Light sweeps left-to-right then right-to-left smoothly with no flickering or skipped LEDs.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Upload fails with "avrdude: stk500v2_ReceiveMessage() timeout":</strong> Wrong board selected. Make sure it is set to "Arduino Mega or Mega 2560", not "Arduino Uno".</li>' +
                         '<li><strong>No port available:</strong> Install CH340 driver. On Linux, check <code>dmesg | tail</code> after plugging in &mdash; it should show <code>ttyACM0</code> or <code>ttyUSB0</code>.</li>' +
                         '<li><strong>LED does not light up:</strong> (1) Check LED orientation &mdash; long leg toward the pin wire, short leg toward resistor/GND. (2) Verify the resistor is actually in the same breadboard row as the LED cathode. (3) Make sure GND rail is connected to Mega GND.</li>' +
                         '<li><strong>LED is extremely dim:</strong> You may have a higher value resistor (1K or 10K). Use the 220&Omega; (red-red-brown bands).</li>' +
                         '<li><strong>Serial Monitor shows garbage characters:</strong> Baud rate mismatch. Set both your code and the Serial Monitor dropdown to 9600.</li>' +
                         '<li><strong>Only some LEDs work in the chase:</strong> Check that each LED has its own complete circuit to GND. A broken connection in the GND rail will affect all LEDs downstream.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Variable Speed Chase</strong> &mdash; Add a potentiometer to analog pin A0 and use <code>analogRead(A0)</code> to control the chase speed. Map the 0&ndash;1023 value to a delay range of 30&ndash;500ms.</p>' +
                    '<p><strong>Challenge 2: Morse Code Flasher</strong> &mdash; Write a function that takes a string and blinks an LED in Morse code (short blink = dot, long blink = dash). Start with "SOS" and expand to full alphabet.</p>' +
                    '<p><strong>Challenge 3: Binary Counter</strong> &mdash; Use 5 LEDs to count from 0 to 31 in binary. Each LED represents one bit. Increment every second and display the current number on Serial Monitor alongside the binary representation.</p>',

        // ======================================================================
        // SG-01 visual enhancements
        // ======================================================================
        stepVisuals: {
            // Step 2 — Wire Your First External LED: LED circuit physics
            2: '<svg viewBox="0 0 680 190" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs><pattern id="sg01-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
               '<rect width="680" height="190" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="174" fill="url(#sg01-sv2-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">LED CIRCUIT — CURRENT PATH</text>' +
               '<!-- Current path line -->' +
               '<line x1="60" y1="100" x2="170" y2="100" stroke="#eab308" stroke-width="2.5"/>' +
               '<polygon points="165,96 175,100 165,104" fill="#eab308"/>' +
               '<line x1="270" y1="100" x2="370" y2="100" stroke="#eab308" stroke-width="2.5"/>' +
               '<polygon points="365,96 375,100 365,104" fill="#eab308"/>' +
               '<line x1="460" y1="100" x2="560" y2="100" stroke="#60a5fa" stroke-width="2.5" stroke-dasharray="5,3"/>' +
               '<!-- Arduino pin block -->' +
               '<rect x="20" y="76" width="44" height="48" rx="4" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
               '<text x="42" y="97" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="700">D2</text>' +
               '<text x="42" y="110" text-anchor="middle" fill="#8b949e" font-size="6">5V out</text>' +
               '<text x="42" y="120" text-anchor="middle" fill="#555" font-size="5.5">when HIGH</text>' +
               '<!-- LED symbol -->' +
               '<polygon points="170,78 230,100 170,122" fill="rgba(234,179,8,0.25)" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="230" y1="78" x2="230" y2="122" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="240" y1="78" x2="250" y2="78" stroke="#eab308" stroke-width="1" opacity="0.5"/>' +
               '<line x1="240" y1="88" x2="255" y2="88" stroke="#eab308" stroke-width="1" opacity="0.5"/>' +
               '<polygon points="240,78 248,74 246,80" fill="#eab308" opacity="0.5"/>' +
               '<polygon points="255,88 248,84 250,90" fill="#eab308" opacity="0.5"/>' +
               '<text x="200" y="145" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">LED</text>' +
               '<text x="200" y="156" text-anchor="middle" fill="#8b949e" font-size="6">anode (+) left</text>' +
               '<text x="200" y="166" text-anchor="middle" fill="#8b949e" font-size="6">cathode (-) right</text>' +
               '<!-- Resistor symbol -->' +
               '<rect x="372" y="86" width="84" height="28" rx="3" fill="rgba(168,85,247,0.12)" stroke="#a855f7" stroke-width="1.5"/>' +
               '<line x1="385" y1="100" x2="395" y2="84" stroke="#a855f7" stroke-width="1"/>' +
               '<line x1="395" y1="84" x2="405" y2="116" stroke="#a855f7" stroke-width="1"/>' +
               '<line x1="405" y1="116" x2="415" y2="84" stroke="#a855f7" stroke-width="1"/>' +
               '<line x1="415" y1="84" x2="425" y2="100" stroke="#a855f7" stroke-width="1"/>' +
               '<text x="414" y="148" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="600">220 ohm</text>' +
               '<text x="414" y="160" text-anchor="middle" fill="#8b949e" font-size="6">red-red-brown</text>' +
               '<text x="414" y="170" text-anchor="middle" fill="#555" font-size="5.5">limits ~13.6mA</text>' +
               '<!-- GND block -->' +
               '<rect x="560" y="82" width="44" height="36" rx="4" fill="#0a1628" stroke="#8b949e" stroke-width="1"/>' +
               '<line x1="582" y1="96" x2="582" y2="110" stroke="#60a5fa" stroke-width="2"/>' +
               '<line x1="573" y1="110" x2="591" y2="110" stroke="#60a5fa" stroke-width="2"/>' +
               '<line x1="577" y1="114" x2="587" y2="114" stroke="#60a5fa" stroke-width="1.5"/>' +
               '<line x1="580" y1="118" x2="584" y2="118" stroke="#60a5fa" stroke-width="1"/>' +
               '<text x="582" y="132" text-anchor="middle" fill="#8b949e" font-size="6">GND</text>' +
               '<!-- Ohms law callout -->' +
               '<rect x="490" y="40" width="174" height="44" rx="5" fill="rgba(255,107,53,0.06)" stroke="rgba(255,107,53,0.25)" stroke-width="1"/>' +
               '<text x="500" y="55" fill="#ff6b35" font-size="7" font-weight="700">Ohm\'s Law: I = V / R</text>' +
               '<text x="500" y="68" fill="#8b949e" font-size="6.5">I = (5V - 2V) / 220 ohm = 13.6 mA</text>' +
               '<text x="500" y="78" fill="#555" font-size="6">LED Vf ~2V  |  safe limit ~20mA</text>' +
               '</svg>',

            // Step 3 — Add Serial Feedback: Serial Monitor mockup
            3: '<svg viewBox="0 0 680 140" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<rect width="680" height="140" fill="#0d1117" rx="6"/>' +
               '<rect x="12" y="8" width="656" height="20" rx="3" fill="#1e2736"/>' +
               '<text x="20" y="22" fill="#8b949e" font-size="8">Serial Monitor — COM3 (9600 baud)</text>' +
               '<rect x="12" y="32" width="656" height="100" rx="3" fill="#000" stroke="#333" stroke-width="1"/>' +
               '<text x="20" y="50" fill="#4ade80" font-size="8">SG-01: External LED initialized on pin 2</text>' +
               '<text x="20" y="64" fill="#e2e8f0" font-size="8">LED ON</text>' +
               '<text x="20" y="78" fill="#e2e8f0" font-size="8">LED OFF</text>' +
               '<text x="20" y="92" fill="#e2e8f0" font-size="8">LED ON</text>' +
               '<text x="20" y="106" fill="#e2e8f0" font-size="8">LED OFF</text>' +
               '<text x="20" y="120" fill="#4ade80" font-size="8" opacity="0.5">_</text>' +
               '<rect x="580" y="110" width="80" height="18" rx="3" fill="#1e2736" stroke="#333" stroke-width="0.5"/>' +
               '<text x="620" y="123" text-anchor="middle" fill="#8b949e" font-size="7">9600 baud</text>' +
               '</svg>',

            // Step 4 — Wire Multiple LEDs: 5-LED breadboard layout
            4: '<svg viewBox="0 0 680 160" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<rect width="680" height="160" fill="#0d1117" rx="6"/>' +
               '<text x="340" y="18" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">5-LED BREADBOARD LAYOUT — ONE LED PER ROW</text>' +
               '<!-- Row labels -->' +
               '<text x="60" y="48" fill="#eab308" font-size="8" font-weight="600">Row 10: D2</text>' +
               '<text x="60" y="72" fill="#22c55e" font-size="8" font-weight="600">Row 15: D3</text>' +
               '<text x="60" y="96" fill="#3b82f6" font-size="8" font-weight="600">Row 20: D4</text>' +
               '<text x="60" y="120" fill="#ef4444" font-size="8" font-weight="600">Row 25: D5</text>' +
               '<text x="60" y="144" fill="#e2e8f0" font-size="8" font-weight="600">Row 30: D6</text>' +
               '<!-- LED + Resistor symbols per row -->' +
               '<polygon points="200,38 210,52 190,52" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1"/>' +
               '<rect x="230" y="41" width="30" height="6" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
               '<line x1="260" y1="44" x2="290" y2="44" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>' +
               '<text x="300" y="48" fill="#8b949e" font-size="7">GND</text>' +
               '<polygon points="200,62 210,76 190,76" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1"/>' +
               '<rect x="230" y="65" width="30" height="6" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
               '<line x1="260" y1="68" x2="290" y2="68" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>' +
               '<text x="300" y="72" fill="#8b949e" font-size="7">GND</text>' +
               '<polygon points="200,86 210,100 190,100" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="1"/>' +
               '<rect x="230" y="89" width="30" height="6" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
               '<line x1="260" y1="92" x2="290" y2="92" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>' +
               '<text x="300" y="96" fill="#8b949e" font-size="7">GND</text>' +
               '<polygon points="200,110 210,124 190,124" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1"/>' +
               '<rect x="230" y="113" width="30" height="6" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
               '<line x1="260" y1="116" x2="290" y2="116" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>' +
               '<text x="300" y="120" fill="#8b949e" font-size="7">GND</text>' +
               '<polygon points="200,134 210,148 190,148" fill="rgba(226,232,240,0.3)" stroke="#e2e8f0" stroke-width="1"/>' +
               '<rect x="230" y="137" width="30" height="6" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
               '<line x1="260" y1="140" x2="290" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>' +
               '<text x="300" y="144" fill="#8b949e" font-size="7">GND</text>' +
               '<!-- Key reminder -->' +
               '<rect x="380" y="40" width="270" height="80" rx="6" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
               '<text x="390" y="58" fill="#eab308" font-size="8" font-weight="600">KEY RULES</text>' +
               '<text x="390" y="74" fill="#8b949e" font-size="7">1. Each LED gets its own breadboard row</text>' +
               '<text x="390" y="88" fill="#8b949e" font-size="7">2. Each LED gets its own 220 ohm resistor</text>' +
               '<text x="390" y="102" fill="#8b949e" font-size="7">3. All resistors connect to the shared GND rail</text>' +
               '<text x="390" y="116" fill="#8b949e" font-size="7">4. Skip rows between LEDs for easy access</text>' +
               '</svg>',

            // Step 5 — Create a Chase Pattern: timing diagram
            5: '<svg viewBox="0 0 680 170" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs><pattern id="sg01-sv4-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
               '<rect width="680" height="170" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="154" fill="url(#sg01-sv4-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">CHASE PATTERN — FORWARD SWEEP (100ms per step, backward sweep mirrors in reverse)</text>' +
               '<!-- Lane labels -->' +
               '<text x="44" y="48" text-anchor="end" fill="#eab308" font-size="7">D2</text>' +
               '<text x="44" y="70" text-anchor="end" fill="#22c55e" font-size="7">D3</text>' +
               '<text x="44" y="92" text-anchor="end" fill="#3b82f6" font-size="7">D4</text>' +
               '<text x="44" y="114" text-anchor="end" fill="#ef4444" font-size="7">D5</text>' +
               '<text x="44" y="136" text-anchor="end" fill="#e2e8f0" font-size="7">D6</text>' +
               '<!-- Time axis -->' +
               '<line x1="54" y1="148" x2="660" y2="148" stroke="#333" stroke-width="1"/>' +
               '<text x="54" y="160" fill="#444" font-size="6">0ms</text>' +
               '<text x="162" y="160" fill="#444" font-size="6">100ms</text>' +
               '<text x="270" y="160" fill="#444" font-size="6">200ms</text>' +
               '<text x="378" y="160" fill="#444" font-size="6">300ms</text>' +
               '<text x="486" y="160" fill="#444" font-size="6">400ms</text>' +
               '<text x="590" y="160" fill="#444" font-size="6">500ms</text>' +
               '<!-- Grid lines -->' +
               '<line x1="162" y1="36" x2="162" y2="148" stroke="#222" stroke-width="0.5"/>' +
               '<line x1="270" y1="36" x2="270" y2="148" stroke="#222" stroke-width="0.5"/>' +
               '<line x1="378" y1="36" x2="378" y2="148" stroke="#222" stroke-width="0.5"/>' +
               '<line x1="486" y1="36" x2="486" y2="148" stroke="#222" stroke-width="0.5"/>' +
               '<line x1="594" y1="36" x2="594" y2="148" stroke="#222" stroke-width="0.5"/>' +
               '<!-- D2 HIGH pulse at 0ms -->' +
               '<rect x="54" y="36" width="108" height="18" rx="2" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1"/>' +
               '<rect x="54" y="58" width="108" height="2" rx="1" fill="#444"/>' +
               '<!-- D3 HIGH pulse at 100ms -->' +
               '<rect x="54" y="58" width="108" height="2" rx="1" fill="#444"/>' +
               '<rect x="162" y="58" width="108" height="18" rx="2" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1"/>' +
               '<rect x="54" y="80" width="108" height="2" rx="1" fill="#444"/>' +
               '<!-- D4 HIGH pulse at 200ms -->' +
               '<rect x="270" y="80" width="108" height="18" rx="2" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="1"/>' +
               '<rect x="54" y="102" width="108" height="2" rx="1" fill="#444"/>' +
               '<!-- D5 HIGH pulse at 300ms -->' +
               '<rect x="378" y="102" width="108" height="18" rx="2" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1"/>' +
               '<rect x="54" y="124" width="108" height="2" rx="1" fill="#444"/>' +
               '<!-- D6 HIGH pulse at 400ms -->' +
               '<rect x="486" y="124" width="108" height="18" rx="2" fill="rgba(226,232,240,0.25)" stroke="#e2e8f0" stroke-width="1"/>' +
               '<!-- LOW baselines -->' +
               '<line x1="54" y1="54" x2="660" y2="54" stroke="#333" stroke-width="0.5" stroke-dasharray="2,2"/>' +
               '<line x1="54" y1="76" x2="660" y2="76" stroke="#333" stroke-width="0.5" stroke-dasharray="2,2"/>' +
               '<line x1="54" y1="98" x2="660" y2="98" stroke="#333" stroke-width="0.5" stroke-dasharray="2,2"/>' +
               '<line x1="54" y1="120" x2="660" y2="120" stroke="#333" stroke-width="0.5" stroke-dasharray="2,2"/>' +
               '<line x1="54" y1="142" x2="660" y2="142" stroke="#333" stroke-width="0.5" stroke-dasharray="2,2"/>' +
               '</svg>'
        },

        componentCallouts: {
            svg: '<svg viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                 '<defs><pattern id="sg01-cc-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
                 '<rect width="560" height="220" fill="#0d1117" rx="6"/>' +
                 '<rect x="6" y="6" width="548" height="208" fill="url(#sg01-cc-grid)" rx="3"/>' +
                 '<text x="280" y="20" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.14em">SG-01 COMPONENT LAYOUT</text>' +
                 '<!-- Arduino Mega outline -->' +
                 '<rect x="20" y="34" width="120" height="148" rx="6" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5" data-callout="mega"/>' +
                 '<text x="80" y="50" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="700">ARDUINO</text>' +
                 '<text x="80" y="61" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="700">MEGA 2560</text>' +
                 '<circle cx="126" cy="80" r="4" fill="#1a1f2b" stroke="#eab308" stroke-width="1" data-callout="pin-d2"/>' +
                 '<text x="115" y="79" text-anchor="end" fill="#666" font-size="5.5">D2</text>' +
                 '<circle cx="126" cy="96" r="4" fill="#1a1f2b" stroke="#22c55e" stroke-width="1" data-callout="pin-d3"/>' +
                 '<text x="115" y="95" text-anchor="end" fill="#666" font-size="5.5">D3</text>' +
                 '<circle cx="126" cy="112" r="4" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
                 '<text x="115" y="111" text-anchor="end" fill="#666" font-size="5.5">D4</text>' +
                 '<circle cx="126" cy="128" r="4" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
                 '<text x="115" y="127" text-anchor="end" fill="#666" font-size="5.5">D5</text>' +
                 '<circle cx="126" cy="144" r="4" fill="#1a1f2b" stroke="#e2e8f0" stroke-width="1"/>' +
                 '<text x="115" y="143" text-anchor="end" fill="#666" font-size="5.5">D6</text>' +
                 '<circle cx="126" cy="160" r="4" fill="#1a1f2b" stroke="#8b949e" stroke-width="1" data-callout="gnd"/>' +
                 '<text x="115" y="159" text-anchor="end" fill="#666" font-size="5.5">GND</text>' +
                 '<!-- Breadboard -->' +
                 '<rect x="180" y="34" width="200" height="148" rx="6" fill="#0f1a2e" stroke="#22c55e" stroke-width="1.5" data-callout="breadboard"/>' +
                 '<text x="280" y="50" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="700">BREADBOARD</text>' +
                 '<rect x="190" y="58" width="180" height="10" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
                 '<text x="200" y="66" fill="#ef4444" font-size="5.5">+ 5V RAIL</text>' +
                 '<rect x="190" y="70" width="180" height="10" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
                 '<text x="200" y="78" fill="#60a5fa" font-size="5.5">- GND RAIL</text>' +
                 '<!-- LED symbols -->' +
                 '<polygon points="220,98 236,108 220,118" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1" data-callout="led"/>' +
                 '<polygon points="246,108 252,112 246,116" fill="rgba(234,179,8,0.2)" stroke="#eab308" stroke-width="0.5"/>' +
                 '<rect x="256" y="104" width="28" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5" data-callout="resistor"/>' +
                 '<polygon points="220,128 236,138 220,148" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1" data-callout="led"/>' +
                 '<rect x="256" y="134" width="28" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5" data-callout="resistor"/>' +
                 '<polygon points="310,98 326,108 310,118" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="1" data-callout="led"/>' +
                 '<rect x="336" y="104" width="28" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5" data-callout="resistor"/>' +
                 '<polygon points="310,128 326,138 310,148" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1" data-callout="led"/>' +
                 '<rect x="336" y="134" width="28" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5" data-callout="resistor"/>' +
                 '<!-- LED 5 (D6 white) -->' +
                 '<polygon points="220,156 236,166 220,176" fill="rgba(226,232,240,0.3)" stroke="#e2e8f0" stroke-width="1" data-callout="led"/>' +
                 '<rect x="256" y="162" width="28" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5" data-callout="resistor"/>' +
                 '</svg>',
            components: [
                {
                    id: 'mega',
                    name: 'Arduino Mega 2560',
                    purpose: 'AVR ATmega2560 microcontroller. 54 digital I/O pins, 16 analog inputs, 4 hardware UARTs. Runs at 16 MHz from an onboard crystal.',
                    specs: ['16 MHz clock', '256 KB Flash', '8 KB SRAM', '5V logic', 'USB-B connector']
                },
                {
                    id: 'led',
                    name: 'Standard LED (5mm)',
                    purpose: 'Light-emitting diode. Converts current to light. Forward voltage ~2V, maximum forward current 20mA. The long leg is the anode (+), short leg is cathode (-).',
                    specs: ['Vf ~2.0V (red/yellow)', 'Vf ~3.2V (blue/white)', 'If max 20mA', 'Emits ~25mcd']
                },
                {
                    id: 'resistor',
                    name: '220 ohm Resistor',
                    purpose: 'Current-limiting resistor. Drops excess voltage so the LED stays within safe operating current. Without it, the LED and Arduino pin would both be damaged.',
                    specs: ['220 ohm (red-red-brown)', '+/-5% tolerance', 'R = (5V-2V)/0.015A = 200 ohm min', '1/4 watt rated']
                },
                {
                    id: 'breadboard',
                    name: 'Half-size Breadboard',
                    purpose: 'Solderless prototyping board. Rows of 5 holes are internally connected. Power rails run the full length. Components push in and make reliable contact via spring clips.',
                    specs: ['400 tie points', '5-hole rows internally tied', 'Power rails full length', '0.1 inch pin spacing']
                },
                {
                    id: 'gnd',
                    name: 'GND (Ground Rail)',
                    purpose: 'The common 0V reference for the entire circuit. All current returns here. Connect the Mega GND pin to the breadboard GND rail so all components share the same reference.',
                    specs: ['0V reference', 'Three GND pins on Mega', 'Black wire convention', 'Required for every circuit']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'LED Inserted Backwards (Reversed Polarity)',
                correct: 'Long leg (anode) connects toward the Arduino pin, short leg (cathode) connects toward the resistor and GND.',
                incorrect: 'LED inserted with short leg toward the Arduino pin and long leg toward GND.',
                consequence: 'LED will not light up at all. LEDs only conduct in one direction. No damage is caused &mdash; just remove, flip, and reinsert.',
                svgDiff: '<svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="120" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="104" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="104" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<!-- Correct: anode left -->' +
                         '<text x="30" y="60" fill="#8b949e" font-size="7">PIN</text>' +
                         '<line x1="50" y1="58" x2="100" y2="58" stroke="#eab308" stroke-width="2"/>' +
                         '<polygon points="100,44 140,58 100,72" fill="rgba(234,179,8,0.35)" stroke="#eab308" stroke-width="1.5"/>' +
                         '<line x1="140" y1="44" x2="140" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
                         '<line x1="140" y1="58" x2="180" y2="58" stroke="#eab308" stroke-width="2"/>' +
                         '<text x="90" y="88" text-anchor="middle" fill="#22c55e" font-size="6.5">anode (+) first</text>' +
                         '<circle cx="104" cy="45" r="5" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="104" y="49" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">+</text>' +
                         '<text x="30" y="108" fill="#4ade80" font-size="6">LED lights up</text>' +
                         '<!-- Wrong: cathode left -->' +
                         '<text x="278" y="60" fill="#8b949e" font-size="7">PIN</text>' +
                         '<line x1="298" y1="58" x2="348" y2="58" stroke="#ef4444" stroke-width="2"/>' +
                         '<polygon points="348,72 388,58 348,44" fill="rgba(239,68,68,0.35)" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<line x1="388" y1="44" x2="388" y2="72" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<line x1="388" y1="58" x2="428" y2="58" stroke="#ef4444" stroke-width="2"/>' +
                         '<text x="338" y="88" text-anchor="middle" fill="#ef4444" font-size="6.5">cathode (-) first</text>' +
                         '<circle cx="392" cy="45" r="5" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1"/>' +
                         '<text x="392" y="49" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">-</text>' +
                         '<text x="278" y="108" fill="#f87171" font-size="6">LED is dark (no damage)</text>' +
                         '</svg>'
            },
            {
                title: 'Missing or Wrong-Value Resistor',
                correct: 'A 220 ohm resistor (red-red-brown bands) is placed between the LED cathode and the GND rail, completing the current-limiting path.',
                incorrect: 'LED connected directly to the Arduino pin and GND with no resistor, or using a 10K resistor that barely passes current.',
                consequence: 'No resistor: the Arduino\'s output driver tries to sink unlimited current. Pin current can spike above 40mA, permanently damaging the ATmega2560 I/O cell. 10K resistor: LED is invisible dim (~0.3mA).',
                svgDiff: '<svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="120" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="104" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="104" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<!-- Correct path -->' +
                         '<line x1="20" y1="58" x2="70" y2="58" stroke="#eab308" stroke-width="2"/>' +
                         '<polygon points="70,44 110,58 70,72" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1.5"/>' +
                         '<line x1="110" y1="44" x2="110" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
                         '<rect x="118" y="50" width="54" height="16" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="1.5"/>' +
                         '<text x="145" y="61" text-anchor="middle" fill="#c084fc" font-size="6.5">220R</text>' +
                         '<line x1="172" y1="58" x2="224" y2="58" stroke="#60a5fa" stroke-width="2"/>' +
                         '<text x="30" y="90" fill="#22c55e" font-size="6">13mA  -  bright + safe</text>' +
                         '<!-- Wrong path (no resistor) -->' +
                         '<line x1="272" y1="58" x2="322" y2="58" stroke="#eab308" stroke-width="2"/>' +
                         '<polygon points="322,44 362,58 322,72" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1.5"/>' +
                         '<line x1="362" y1="44" x2="362" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
                         '<line x1="362" y1="58" x2="460" y2="58" stroke="#ef4444" stroke-width="2"/>' +
                         '<text x="380" y="52" fill="#ef4444" font-size="9" font-weight="700">!</text>' +
                         '<circle cx="380" cy="58" r="8" fill="none" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<text x="272" y="90" fill="#ef4444" font-size="6">unlimited current  -  pin damage</text>' +
                         '</svg>'
            },
            {
                title: 'GND Rail Not Connected to Arduino GND',
                correct: 'A black jumper wire runs from any GND pin on the Arduino Mega to the negative (-) rail of the breadboard. All LED cathode circuits return current through this rail.',
                incorrect: 'The breadboard GND rail is floating with no wire connecting it back to the Arduino GND pin.',
                consequence: 'All LEDs remain dark even though power and code are correct. Current has no return path. The circuit is open. This is the most common beginner mistake and the first thing to check.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<!-- Correct: GND connected -->' +
                         '<rect x="18" y="34" width="40" height="34" rx="3" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1"/>' +
                         '<text x="38" y="50" text-anchor="middle" fill="#60a5fa" font-size="6">Mega</text>' +
                         '<text x="38" y="62" text-anchor="middle" fill="#8b949e" font-size="5.5">GND</text>' +
                         '<circle cx="58" cy="51" r="3" fill="#555" stroke="#8b949e" stroke-width="1"/>' +
                         '<line x1="61" y1="51" x2="130" y2="51" stroke="#8b949e" stroke-width="2"/>' +
                         '<rect x="130" y="44" width="80" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="#60a5fa" stroke-width="0.5"/>' +
                         '<text x="170" y="54" text-anchor="middle" fill="#60a5fa" font-size="5.5">- GND RAIL</text>' +
                         '<text x="124" y="84" text-anchor="middle" fill="#22c55e" font-size="6">Current has a return path</text>' +
                         '<!-- Wrong: GND floating -->' +
                         '<rect x="268" y="34" width="40" height="34" rx="3" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1"/>' +
                         '<text x="288" y="50" text-anchor="middle" fill="#60a5fa" font-size="6">Mega</text>' +
                         '<text x="288" y="62" text-anchor="middle" fill="#8b949e" font-size="5.5">GND</text>' +
                         '<circle cx="308" cy="51" r="3" fill="#555" stroke="#8b949e" stroke-width="1"/>' +
                         '<rect x="380" y="44" width="80" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="#60a5fa" stroke-width="0.5"/>' +
                         '<text x="420" y="54" text-anchor="middle" fill="#60a5fa" font-size="5.5">- GND RAIL</text>' +
                         '<line x1="310" y1="51" x2="350" y2="51" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>' +
                         '<text x="355" y="51" fill="#ef4444" font-size="9" font-weight="700">X</text>' +
                         '<text x="376" y="84" text-anchor="middle" fill="#ef4444" font-size="6">Rail is floating  -  all LEDs dark</text>' +
                         '</svg>'
            }
        ]
    },

    // ========================================================================
    // SG-02: Sensor I/O — Temperature, Light, Distance
    // ========================================================================
    'sg-02': {
        intro: '<p>Sensors are how hardware interacts with the physical world. In cybersecurity, sensors drive everything from environmental monitoring in server rooms to intrusion detection on physical perimeters. Understanding sensor input is the foundation of any field tool you will build later.</p>' +
               '<p>This project introduces three common sensor types: the DHT11 digital temperature/humidity sensor, a photoresistor (analog light sensor), and the HC-SR04 ultrasonic distance sensor. You will read data from each, display it on the Serial Monitor, and combine them into a single multi-sensor sketch with threshold alerts.</p>' +
               '<p>All parts are included in the ELEGOO Mega kit.</p>',

        wiring: '    Arduino Mega 2560              Breadboard\n' +
                '    +-------------------+          +-------------------------------+\n' +
                '    |              5V   |---red----|--[+5V rail]                   |\n' +
                '    |             GND   |---black--|--[GND rail]                   |\n' +
                '    |                   |          |                               |\n' +
                '    |   DHT11:          |          |  DHT11 (3 pins facing you):   |\n' +
                '    |             D7    |---yellow-|--[Data]   [+5V]   [GND]      |\n' +
                '    |                   |          |           (to + rail)(to - rail)\n' +
                '    |                   |          |                               |\n' +
                '    |   Photoresistor:  |          |  Voltage divider:             |\n' +
                '    |             A0    |---green--|--+--- photoresistor ---[+5V]  |\n' +
                '    |                   |          |  +--- 10K resistor ---[GND]   |\n' +
                '    |                   |          |                               |\n' +
                '    |   HC-SR04:        |          |  HC-SR04 (4 pins):            |\n' +
                '    |             D8    |---orange-|--[Trig]                       |\n' +
                '    |             D9    |---purple-|--[Echo]                       |\n' +
                '    |                   |          |  [VCC] ---[+5V rail]          |\n' +
                '    |                   |          |  [GND] ---[GND rail]          |\n' +
                '    +-------------------+          +-------------------------------+',

        wiringNotes: '<p><strong>DHT11:</strong> If your DHT11 is on a breakout board (3 pins), it has a built-in pull-up resistor. If it is the raw 4-pin component, add a 10K&Omega; pull-up between Data and VCC.</p>' +
                     '<p><strong>Photoresistor voltage divider:</strong> The photoresistor and 10K&Omega; resistor form a divider. The junction (where they meet) connects to A0. Bright light = high reading, dark = low reading.</p>' +
                     '<p><strong>HC-SR04:</strong> Trig sends the pulse, Echo receives it. Both are 5V logic, safe for the Mega. Keep the sensor facing away from the breadboard for clear readings.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg02-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="440" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="420" fill="url(#sg02-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-02 SENSOR I/O</text>' +

            '<!-- Arduino Mega -->' +
            '<g>' +
            '<rect x="40" y="60" width="170" height="320" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="60" width="170" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="76" width="170" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="125" y="76" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ARDUINO MEGA</text>' +
            '<!-- USB -->' +
            '<rect x="16" y="75" width="28" height="22" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="30" y="89" text-anchor="middle" fill="#3b82f6" font-size="6">USB</text>' +
            '<!-- Pins -->' +
            '<text x="200" y="115" text-anchor="end" fill="#8b949e" font-size="8">5V</text>' +
            '<circle cx="208" cy="112" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="200" y="140" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="208" cy="137" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="200" y="180" text-anchor="end" fill="#8b949e" font-size="8">D7</text>' +
            '<circle cx="208" cy="177" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="200" y="220" text-anchor="end" fill="#8b949e" font-size="8">A0</text>' +
            '<circle cx="208" cy="217" r="3" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="200" y="275" text-anchor="end" fill="#8b949e" font-size="8">D8</text>' +
            '<circle cx="208" cy="272" r="3" fill="#1a1f2b" stroke="#f97316" stroke-width="1"/>' +
            '<text x="200" y="300" text-anchor="end" fill="#8b949e" font-size="8">D9</text>' +
            '<circle cx="208" cy="297" r="3" fill="#1a1f2b" stroke="#a855f7" stroke-width="1"/>' +
            '</g>' +

            '<!-- DHT11 Sensor -->' +
            '<g>' +
            '<rect x="320" y="60" width="130" height="100" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<rect x="320" y="60" width="130" height="20" rx="8" fill="rgba(234,179,8,0.1)"/>' +
            '<rect x="320" y="73" width="130" height="7" fill="rgba(234,179,8,0.1)"/>' +
            '<text x="385" y="75" text-anchor="middle" fill="#eab308" font-size="10" font-weight="600">DHT11</text>' +
            '<text x="385" y="95" text-anchor="middle" fill="#8b949e" font-size="7">Temp + Humidity</text>' +
            '<!-- Pins -->' +
            '<rect x="340" y="120" width="30" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="355" y="130" text-anchor="middle" fill="#ef4444" font-size="6">VCC</text>' +
            '<rect x="375" y="120" width="30" height="14" rx="2" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="390" y="130" text-anchor="middle" fill="#eab308" font-size="6">DATA</text>' +
            '<rect x="410" y="120" width="30" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="425" y="130" text-anchor="middle" fill="#60a5fa" font-size="6">GND</text>' +
            '</g>' +

            '<!-- Photoresistor -->' +
            '<g>' +
            '<rect x="320" y="190" width="130" height="100" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="320" y="190" width="130" height="20" rx="8" fill="rgba(34,197,94,0.1)"/>' +
            '<rect x="320" y="203" width="130" height="7" fill="rgba(34,197,94,0.1)"/>' +
            '<text x="385" y="205" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">PHOTORESISTOR</text>' +
            '<text x="385" y="225" text-anchor="middle" fill="#8b949e" font-size="7">Voltage Divider</text>' +
            '<!-- Divider diagram -->' +
            '<line x1="360" y1="240" x2="360" y2="252" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="370" y="248" fill="#ef4444" font-size="6">5V</text>' +
            '<circle cx="360" cy="258" r="6" fill="none" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="372" y="261" fill="#22c55e" font-size="6">LDR</text>' +
            '<circle cx="360" cy="258" r="2" fill="#22c55e"/>' +
            '<line x1="360" y1="264" x2="360" y2="272" stroke="#22c55e" stroke-width="1.5"/>' +
            '<circle cx="360" cy="272" r="2" fill="#22c55e"/>' +
            '<line x1="362" y1="272" x2="380" y2="272" stroke="#22c55e" stroke-width="1" stroke-dasharray="2,1"/>' +
            '<text x="384" y="275" fill="#22c55e" font-size="6">&#8594; A0</text>' +
            '<rect x="356" y="276" width="8" height="4" fill="rgba(168,85,247,0.3)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="370" y="282" fill="#c084fc" font-size="6">10K</text>' +
            '<line x1="360" y1="280" x2="360" y2="288" stroke="#60a5fa" stroke-width="1.5"/>' +
            '<text x="370" y="288" fill="#60a5fa" font-size="6">GND</text>' +
            '</g>' +

            '<!-- HC-SR04 -->' +
            '<g>' +
            '<rect x="510" y="60" width="170" height="130" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="510" y="60" width="170" height="20" rx="8" fill="rgba(249,115,22,0.1)"/>' +
            '<rect x="510" y="73" width="170" height="7" fill="rgba(249,115,22,0.1)"/>' +
            '<text x="595" y="75" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="600">HC-SR04</text>' +
            '<text x="595" y="95" text-anchor="middle" fill="#8b949e" font-size="7">Ultrasonic Distance</text>' +
            '<!-- Transducer eyes -->' +
            '<circle cx="570" cy="115" r="14" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="1"/>' +
            '<circle cx="570" cy="115" r="8" fill="rgba(249,115,22,0.08)"/>' +
            '<circle cx="620" cy="115" r="14" fill="none" stroke="rgba(249,115,22,0.3)" stroke-width="1"/>' +
            '<circle cx="620" cy="115" r="8" fill="rgba(249,115,22,0.08)"/>' +
            '<text x="570" y="118" text-anchor="middle" fill="#fb923c" font-size="6">TX</text>' +
            '<text x="620" y="118" text-anchor="middle" fill="#fb923c" font-size="6">RX</text>' +
            '<!-- Pins -->' +
            '<rect x="520" y="148" width="30" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="535" y="158" text-anchor="middle" fill="#ef4444" font-size="6">VCC</text>' +
            '<rect x="555" y="148" width="30" height="14" rx="2" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="570" y="158" text-anchor="middle" fill="#fb923c" font-size="6">TRIG</text>' +
            '<rect x="590" y="148" width="30" height="14" rx="2" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="605" y="158" text-anchor="middle" fill="#c084fc" font-size="6">ECHO</text>' +
            '<rect x="625" y="148" width="30" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="640" y="158" text-anchor="middle" fill="#60a5fa" font-size="6">GND</text>' +
            '</g>' +

            '<!-- Wires -->' +
            '<!-- 5V (red) -->' +
            '<path d="M211,112 C260,112 280,65 340,127" stroke="#ef4444" stroke-width="1.5" fill="none"/>' +
            '<path d="M211,112 C260,100 380,55 535,155" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<!-- GND (dark) -->' +
            '<path d="M211,137 C260,137 290,135 425,127" stroke="#8b949e" stroke-width="1.5" fill="none" stroke-dasharray="4,3"/>' +
            '<path d="M211,137 C260,150 400,170 640,155" stroke="#8b949e" stroke-width="1.5" fill="none" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<!-- D7 to DHT11 Data (yellow) -->' +
            '<path d="M211,177 C270,177 310,127 390,127" stroke="#eab308" stroke-width="1.5" fill="none"/>' +
            '<!-- A0 to Photoresistor (green) -->' +
            '<path d="M211,217 C270,217 300,240 320,240" stroke="#22c55e" stroke-width="1.5" fill="none"/>' +
            '<!-- D8 to Trig (orange) -->' +
            '<path d="M211,272 C350,272 400,200 570,155" stroke="#f97316" stroke-width="1.5" fill="none"/>' +
            '<!-- D9 to Echo (purple) -->' +
            '<path d="M211,297 C370,297 420,210 605,155" stroke="#a855f7" stroke-width="1.5" fill="none"/>' +

            '<!-- Legend -->' +
            '<rect x="510" y="220" width="170" height="100" rx="6" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="520" y="236" fill="#60a5fa" font-size="8" font-weight="600">WIRE LEGEND</text>' +
            '<line x1="520" y1="250" x2="540" y2="250" stroke="#ef4444" stroke-width="2"/>' +
            '<text x="546" y="253" fill="#8b949e" font-size="7">Red = 5V Power</text>' +
            '<line x1="520" y1="265" x2="540" y2="265" stroke="#8b949e" stroke-width="2" stroke-dasharray="3,2"/>' +
            '<text x="546" y="268" fill="#8b949e" font-size="7">Gray = GND</text>' +
            '<line x1="520" y1="280" x2="540" y2="280" stroke="#eab308" stroke-width="2"/>' +
            '<text x="546" y="283" fill="#8b949e" font-size="7">Yellow = D7 (DHT11)</text>' +
            '<line x1="520" y1="295" x2="540" y2="295" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="546" y="298" fill="#8b949e" font-size="7">Green = A0 (Light)</text>' +
            '<line x1="520" y1="310" x2="540" y2="310" stroke="#f97316" stroke-width="2"/>' +
            '<text x="546" y="313" fill="#8b949e" font-size="7">Orange = D8 (Trig)</text>' +

            '<!-- Signal flow arrows -->' +
            '<text x="385" y="110" text-anchor="middle" fill="#eab308" font-size="7" opacity="0.6">temp + humidity</text>' +
            '<text x="595" y="140" text-anchor="middle" fill="#fb923c" font-size="7" opacity="0.6">sound pulse</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install the DHT Library',
                content: '<p>The DHT11 requires a library. In the Arduino IDE, go to <strong>Sketch &gt; Include Library &gt; Manage Libraries</strong>. Search for <strong>"DHT sensor library"</strong> by Adafruit and install it. It will prompt you to install the <strong>Adafruit Unified Sensor</strong> dependency &mdash; click "Install All".</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> You can also install libraries manually by downloading the ZIP from GitHub and using <strong>Sketch &gt; Include Library &gt; Add .ZIP Library</strong>.'
            },
            {
                title: 'Read Temperature and Humidity',
                content: '<p>Wire the DHT11 according to the diagram. Upload this sketch and open the Serial Monitor at 9600 baud. You should see temperature and humidity readings every 2 seconds.</p>' +
                         '<p>The DHT11 is not fast &mdash; it only updates every ~2 seconds. Do not poll it faster than that or you will get NaN readings.</p>',
                code: '#include <DHT.h>\n\n#define DHT_PIN 7\n#define DHT_TYPE DHT11\n\nDHT dht(DHT_PIN, DHT_TYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  Serial.println("SG-02: DHT11 sensor ready on pin 7");\n}\n\nvoid loop() {\n  float humidity = dht.readHumidity();\n  float tempC = dht.readTemperature();\n  float tempF = dht.readTemperature(true);\n  \n  if (isnan(humidity) || isnan(tempC)) {\n    Serial.println("ERROR: Failed to read DHT11");\n  } else {\n    Serial.print("Temp: ");\n    Serial.print(tempC, 1);\n    Serial.print(" C (");\n    Serial.print(tempF, 1);\n    Serial.print(" F)  Humidity: ");\n    Serial.print(humidity, 1);\n    Serial.println("%");\n  }\n  \n  delay(2000);  // DHT11 needs 2s between reads\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> If you get repeated NaN readings, check that your DHT11 data pin is on D7 and that VCC/GND are not swapped. The sensor is fragile &mdash; reversed power can damage it.'
            },
            {
                title: 'Add the Photoresistor (Light Sensor)',
                content: '<p>Wire the photoresistor voltage divider. The photoresistor connects between 5V and the A0 junction. The 10K&Omega; resistor connects between the A0 junction and GND. <code>analogRead(A0)</code> returns 0&ndash;1023 proportional to light level.</p>',
                code: '#define LIGHT_PIN A0\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("SG-02: Photoresistor on A0");\n}\n\nvoid loop() {\n  int lightVal = analogRead(LIGHT_PIN);\n  \n  Serial.print("Light: ");\n  Serial.print(lightVal);\n  \n  if (lightVal > 800) {\n    Serial.println(" (bright)");\n  } else if (lightVal > 400) {\n    Serial.println(" (normal)");\n  } else {\n    Serial.println(" (dark)");\n  }\n  \n  delay(500);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Cover the photoresistor with your hand to see the value drop. Point a flashlight at it to see it spike. These are your calibration reference points.'
            },
            {
                title: 'Add the HC-SR04 Ultrasonic Sensor',
                content: '<p>Wire Trig to D8 and Echo to D9. The HC-SR04 works by sending a 10&micro;s pulse on Trig, then measuring how long Echo stays HIGH. The time divided by 58 gives distance in centimeters.</p>',
                code: '#define TRIG_PIN 8\n#define ECHO_PIN 9\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  Serial.println("SG-02: HC-SR04 on pins 8 (trig) / 9 (echo)");\n}\n\nvoid loop() {\n  // Send 10us trigger pulse\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  \n  // Measure echo duration\n  long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout\n  \n  if (duration == 0) {\n    Serial.println("Distance: out of range");\n  } else {\n    float distCm = duration / 58.0;\n    float distIn = distCm / 2.54;\n    Serial.print("Distance: ");\n    Serial.print(distCm, 1);\n    Serial.print(" cm (");\n    Serial.print(distIn, 1);\n    Serial.println(" in)");\n  }\n  \n  delay(200);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The HC-SR04 is accurate from about 2cm to 400cm. Below 2cm it gives false readings. Point it at a flat wall for the most reliable test.'
            },
            {
                title: 'Combine All Sensors',
                content: '<p>Now bring everything together into a single sketch. Each sensor gets its own read function, and the main loop prints all three in a formatted line. This is the pattern you will use in nearly every hardware project: modular sensor reads, centralized output.</p>',
                code: '#include <DHT.h>\n\n// Pin definitions\n#define DHT_PIN    7\n#define DHT_TYPE   DHT11\n#define LIGHT_PIN  A0\n#define TRIG_PIN   8\n#define ECHO_PIN   9\n\nDHT dht(DHT_PIN, DHT_TYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  \n  Serial.println("SG-02: Multi-sensor station online");\n  Serial.println("Temp(C) | Humidity(%) | Light | Distance(cm)");\n  Serial.println("--------|-------------|-------|-------------");\n}\n\nfloat readDistance() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long dur = pulseIn(ECHO_PIN, HIGH, 30000);\n  return (dur == 0) ? -1.0 : dur / 58.0;\n}\n\nvoid loop() {\n  float tempC = dht.readTemperature();\n  float humid = dht.readHumidity();\n  int light = analogRead(LIGHT_PIN);\n  float dist = readDistance();\n  \n  // Temperature\n  if (isnan(tempC)) Serial.print("ERR     | ");\n  else { Serial.print(tempC, 1); Serial.print("    | "); }\n  \n  // Humidity\n  if (isnan(humid)) Serial.print("ERR          | ");\n  else { Serial.print(humid, 1); Serial.print("         | "); }\n  \n  // Light\n  Serial.print(light);\n  Serial.print(light < 100 ? "    | " : light < 1000 ? "   | " : "  | ");\n  \n  // Distance\n  if (dist < 0) Serial.println("OOR");\n  else { Serial.print(dist, 1); Serial.println(""); }\n  \n  delay(2000);\n}',
                language: 'Arduino',
                tip: null
            },
            {
                title: 'Add Threshold Alerts',
                content: '<p>In real monitoring, you want alerts when values cross thresholds. Add this logic to the combined sketch to print warnings when something is abnormal. Think of this as a primitive intrusion detection system &mdash; the same concept drives SIEM alert rules.</p>',
                code: '#include <DHT.h>\n\n#define DHT_PIN    7\n#define DHT_TYPE   DHT11\n#define LIGHT_PIN  A0\n#define TRIG_PIN   8\n#define ECHO_PIN   9\n\n// Alert thresholds\n#define TEMP_HIGH     30.0   // Celsius\n#define HUMID_HIGH    70.0   // Percent\n#define LIGHT_LOW     100    // Dark room\n#define DIST_CLOSE    20.0   // cm — proximity alert\n\nDHT dht(DHT_PIN, DHT_TYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  Serial.println("SG-02: Alert-enabled sensor station online");\n}\n\nfloat readDistance() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long dur = pulseIn(ECHO_PIN, HIGH, 30000);\n  return (dur == 0) ? -1.0 : dur / 58.0;\n}\n\nvoid loop() {\n  float tempC = dht.readTemperature();\n  float humid = dht.readHumidity();\n  int light = analogRead(LIGHT_PIN);\n  float dist = readDistance();\n  \n  Serial.println("--- Sensor Reading ---");\n  \n  if (!isnan(tempC)) {\n    Serial.print("  Temp: "); Serial.print(tempC, 1); Serial.print(" C");\n    if (tempC > TEMP_HIGH) Serial.print("  [ALERT: HIGH TEMP]");\n    Serial.println();\n  }\n  \n  if (!isnan(humid)) {\n    Serial.print("  Humidity: "); Serial.print(humid, 1); Serial.print(" %");\n    if (humid > HUMID_HIGH) Serial.print("  [ALERT: HIGH HUMIDITY]");\n    Serial.println();\n  }\n  \n  Serial.print("  Light: "); Serial.print(light);\n  if (light < LIGHT_LOW) Serial.print("  [ALERT: LOW LIGHT]");\n  Serial.println();\n  \n  if (dist > 0) {\n    Serial.print("  Distance: "); Serial.print(dist, 1); Serial.print(" cm");\n    if (dist < DIST_CLOSE) Serial.print("  [ALERT: PROXIMITY]");\n    Serial.println();\n  }\n  \n  Serial.println();\n  delay(2000);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Adjust the threshold constants for your environment. A "hot" server room might alert at 28C. A secure room might trigger on any light at all after hours.'
            }
        ],

        testing: '<p>Test each sensor individually before combining them:</p>' +
                 '<ul>' +
                 '<li><strong>DHT11:</strong> Readings should be roughly room temperature (18&ndash;28C) and 30&ndash;60% humidity. Breathe on it to see humidity spike briefly.</li>' +
                 '<li><strong>Photoresistor:</strong> Cover it completely &mdash; reading should drop below 100. Under normal room lighting, expect 300&ndash;700. Direct flashlight should push above 900.</li>' +
                 '<li><strong>HC-SR04:</strong> Point at a wall 30cm away. Reading should be within 1&ndash;2cm of the actual distance. Move your hand in front of it and watch the value change in real time.</li>' +
                 '<li><strong>Combined sketch:</strong> All three sensor columns update every 2 seconds. No "ERR" or "OOR" readings under normal conditions.</li>' +
                 '<li><strong>Threshold alerts:</strong> Trigger each alert deliberately &mdash; warm the DHT11 with your hand, cover the photoresistor, move an object close to the ultrasonic sensor. Verify each <code>[ALERT]</code> message fires correctly.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>DHT11 always reads NaN:</strong> (1) Verify VCC is on 5V not 3.3V. (2) Check data pin is on D7. (3) If using a bare 4-pin module, add a 10K pull-up resistor between Data and VCC. (4) Wait at least 2 seconds between reads.</li>' +
                         '<li><strong>Photoresistor always reads 0 or 1023:</strong> Missing half of the voltage divider. Both the photoresistor AND the 10K resistor must be present, meeting at the A0 junction.</li>' +
                         '<li><strong>HC-SR04 always reads "out of range":</strong> (1) Check Trig/Echo are not swapped. (2) Verify VCC is 5V. (3) Make sure it is pointing at a solid surface within 4 meters. Fabric and angled surfaces give poor reflections.</li>' +
                         '<li><strong>Readings are erratic/jumpy:</strong> Add a 100&micro;F capacitor between 5V and GND near the sensor power pins to smooth the power supply. Long jumper wires can also introduce noise.</li>' +
                         '<li><strong>"DHT.h: No such file or directory":</strong> Library not installed. Go to Sketch &gt; Include Library &gt; Manage Libraries and install "DHT sensor library" by Adafruit.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Data Averaging</strong> &mdash; Take 10 sensor readings in rapid succession, throw out the highest and lowest, and average the remaining 8. This is how professional sensors handle noise. Compare the smoothed output to the raw values.</p>' +
                    '<p><strong>Challenge 2: Alarm System</strong> &mdash; Add a piezo buzzer (included in the ELEGOO kit) and make it beep when any sensor crosses its threshold. Use different beep patterns for different alert types (rapid for proximity, slow for temperature).</p>' +
                    '<p><strong>Challenge 3: Environmental Heatmap</strong> &mdash; Walk around the room with the sensor station connected to your laptop. Log temperature and light readings from 10 different spots. Create a simple map showing the "hot spots" and "cold spots". This is the manual version of what HVAC sensors do in data centers.</p>',

        // ======================================================================
        // SG-02 visual enhancements
        // ======================================================================
        stepVisuals: {
            // Step 2 — Add the Photoresistor: voltage divider explained
            2: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs><pattern id="sg02-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
               '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="172" fill="url(#sg02-sv2-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">VOLTAGE DIVIDER — PHOTORESISTOR + 10K RESISTOR</text>' +
               '<!-- 5V rail -->' +
               '<rect x="60" y="36" width="60" height="20" rx="3" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1"/>' +
               '<text x="90" y="50" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700">5V</text>' +
               '<!-- Wire down to LDR -->' +
               '<line x1="90" y1="56" x2="90" y2="84" stroke="#ef4444" stroke-width="2"/>' +
               '<!-- LDR symbol (circle with arrow) -->' +
               '<circle cx="90" cy="96" r="14" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1.5"/>' +
               '<line x1="78" y1="84" x2="102" y2="108" stroke="#eab308" stroke-width="1" opacity="0.7"/>' +
               '<polygon points="102,100 106,110 96,107" fill="#eab308" opacity="0.7"/>' +
               '<text x="90" y="100" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">LDR</text>' +
               '<!-- Wire down to junction -->' +
               '<line x1="90" y1="110" x2="90" y2="136" stroke="#22c55e" stroke-width="2"/>' +
               '<!-- Junction node -->' +
               '<circle cx="90" cy="136" r="4" fill="#ff6b35"/>' +
               '<!-- Junction to A0 -->' +
               '<line x1="94" y1="136" x2="210" y2="136" stroke="#ff6b35" stroke-width="2"/>' +
               '<rect x="210" y="128" width="48" height="16" rx="3" fill="rgba(255,107,53,0.15)" stroke="#ff6b35" stroke-width="1"/>' +
               '<text x="234" y="139" text-anchor="middle" fill="#ff6b35" font-size="7" font-weight="700">A0</text>' +
               '<!-- Wire down from junction to 10K -->' +
               '<line x1="90" y1="140" x2="90" y2="156" stroke="#22c55e" stroke-width="2"/>' +
               '<!-- 10K Resistor -->' +
               '<rect x="72" y="156" width="36" height="16" rx="3" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="1.5"/>' +
               '<text x="90" y="167" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">10K</text>' +
               '<!-- Wire to GND -->' +
               '<line x1="90" y1="172" x2="90" y2="180" stroke="#60a5fa" stroke-width="2"/>' +
               '<rect x="60" y="180" width="60" height="4" rx="2" fill="#60a5fa"/>' +
               '<text x="90" y="178" text-anchor="middle" fill="#60a5fa" font-size="6.5">GND</text>' +
               '<!-- Math callout —  bright light -->' +
               '<rect x="294" y="36" width="180" height="70" rx="5" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
               '<text x="304" y="52" fill="#eab308" font-size="7" font-weight="700">BRIGHT LIGHT</text>' +
               '<text x="304" y="65" fill="#8b949e" font-size="6.5">LDR resistance drops to ~1K</text>' +
               '<text x="304" y="78" fill="#8b949e" font-size="6.5">Vout = 5V x 10K / (1K+10K)</text>' +
               '<text x="304" y="91" fill="#eab308" font-size="6.5">Vout = 4.5V  -->  analogRead ~921</text>' +
               '<!-- Math callout — dark -->' +
               '<rect x="494" y="36" width="176" height="70" rx="5" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>' +
               '<text x="504" y="52" fill="#60a5fa" font-size="7" font-weight="700">DARK</text>' +
               '<text x="504" y="65" fill="#8b949e" font-size="6.5">LDR resistance rises to ~100K</text>' +
               '<text x="504" y="78" fill="#8b949e" font-size="6.5">Vout = 5V x 10K / (100K+10K)</text>' +
               '<text x="504" y="91" fill="#60a5fa" font-size="6.5">Vout = 0.45V  -->  analogRead ~92</text>' +
               '<!-- analogRead scale -->' +
               '<rect x="294" y="122" width="376" height="50" rx="5" fill="rgba(255,107,53,0.04)" stroke="rgba(255,107,53,0.2)" stroke-width="1"/>' +
               '<text x="304" y="137" fill="#ff6b35" font-size="7" font-weight="700">analogRead(A0) SCALE</text>' +
               '<rect x="304" y="143" width="356" height="10" rx="5" fill="#111"/>' +
               '<rect x="304" y="143" width="20" height="10" rx="5" fill="#1a2a4a"/>' +
               '<rect x="304" y="143" width="130" height="10" rx="5" fill="rgba(59,130,246,0.3)"/>' +
               '<rect x="434" y="143" width="226" height="10" rx="5" fill="rgba(234,179,8,0.35)"/>' +
               '<text x="304" y="163" fill="#60a5fa" font-size="6">0 (dark)</text>' +
               '<text x="482" y="163" text-anchor="middle" fill="#ff6b35" font-size="6">511</text>' +
               '<text x="654" y="163" text-anchor="end" fill="#eab308" font-size="6">1023 (bright)</text>' +
               '</svg>',

            // Step 3 — HC-SR04: ultrasonic pulse timing
            3: '<svg viewBox="0 0 680 180" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs>' +
               '<pattern id="sg02-sv3-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
               '<marker id="sg02-arr-o" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f97316"/></marker>' +
               '<marker id="sg02-arr-g" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#22c55e"/></marker>' +
               '</defs>' +
               '<rect width="680" height="180" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="164" fill="url(#sg02-sv3-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">HC-SR04 — PULSE TIMING (distance = duration / 58)</text>' +
               '<!-- TRIG signal lane -->' +
               '<text x="48" y="54" text-anchor="end" fill="#f97316" font-size="7">TRIG</text>' +
               '<line x1="54" y1="52" x2="630" y2="52" stroke="#1a1f2b" stroke-width="8" rx="2"/>' +
               '<rect x="100" y="44" width="24" height="16" rx="2" fill="#f97316"/>' +
               '<text x="112" y="55" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="700">10us</text>' +
               '<text x="54" y="74" fill="#555" font-size="6.5">LOW</text>' +
               '<text x="100" y="42" text-anchor="middle" fill="#f97316" font-size="6">HIGH 10us trigger pulse</text>' +
               '<!-- ECHO signal lane -->' +
               '<text x="48" y="100" text-anchor="end" fill="#22c55e" font-size="7">ECHO</text>' +
               '<line x1="54" y1="98" x2="630" y2="98" stroke="#1a1f2b" stroke-width="8" rx="2"/>' +
               '<rect x="170" y="90" width="200" height="16" rx="2" fill="#22c55e"/>' +
               '<line x1="270" y1="82" x2="270" y2="90" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"/>' +
               '<text x="270" y="80" text-anchor="middle" fill="#22c55e" font-size="6">echo duration</text>' +
               '<text x="54" y="118" fill="#555" font-size="6.5">LOW</text>' +
               '<text x="170" y="88" fill="#22c55e" font-size="6">pulseIn() measures this HIGH period</text>' +
               '<!-- Dimension arrows -->' +
               '<line x1="170" y1="120" x2="370" y2="120" stroke="#22c55e" stroke-width="1" marker-end="url(#sg02-arr-g)"/>' +
               '<line x1="370" y1="120" x2="170" y2="120" stroke="#22c55e" stroke-width="1" marker-end="url(#sg02-arr-g)"/>' +
               '<text x="270" y="134" text-anchor="middle" fill="#22c55e" font-size="6.5">duration (microseconds)</text>' +
               '<!-- Sound wave arcs -->' +
               '<text x="400" y="62" fill="#fb923c" font-size="7" font-weight="600">Sound emitted</text>' +
               '<path d="M 400 74 Q 430 64 460 74" fill="none" stroke="#f97316" stroke-width="1.5" opacity="0.7"/>' +
               '<path d="M 410 78 Q 440 64 470 78" fill="none" stroke="#f97316" stroke-width="1" opacity="0.4"/>' +
               '<text x="520" y="62" fill="#22c55e" font-size="7" font-weight="600">Echo returned</text>' +
               '<path d="M 520 74 Q 550 64 580 74" fill="none" stroke="#22c55e" stroke-width="1.5" opacity="0.7"/>' +
               '<path d="M 510 78 Q 540 64 570 78" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.4"/>' +
               '<!-- Formula box -->' +
               '<rect x="54" y="142" width="572" height="24" rx="5" fill="rgba(255,107,53,0.06)" stroke="rgba(255,107,53,0.25)" stroke-width="1"/>' +
               '<text x="340" y="157" text-anchor="middle" fill="#ff6b35" font-size="8" font-weight="700">distance (cm) = pulseIn(ECHO, HIGH) / 58.0   |   range: 2cm to 400cm</text>' +
               '</svg>'
        },

        componentCallouts: {
            svg: '<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                 '<defs><pattern id="sg02-cc-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
                 '<rect width="560" height="200" fill="#0d1117" rx="6"/>' +
                 '<rect x="6" y="6" width="548" height="188" fill="url(#sg02-cc-grid)" rx="3"/>' +
                 '<text x="280" y="20" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.14em">SG-02 SENSOR STATION LAYOUT</text>' +
                 '<!-- Arduino Mega -->' +
                 '<rect x="16" y="32" width="100" height="154" rx="6" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5" data-callout="mega"/>' +
                 '<text x="66" y="48" text-anchor="middle" fill="#60a5fa" font-size="6.5" font-weight="700">ARDUINO MEGA</text>' +
                 '<circle cx="116" cy="80" r="4" fill="#1a1f2b" stroke="#ef4444" stroke-width="1" data-callout="power"/>' +
                 '<text x="108" y="79" text-anchor="end" fill="#555" font-size="5.5">5V</text>' +
                 '<circle cx="116" cy="96" r="4" fill="#1a1f2b" stroke="#8b949e" stroke-width="1" data-callout="power"/>' +
                 '<text x="108" y="95" text-anchor="end" fill="#555" font-size="5.5">GND</text>' +
                 '<circle cx="116" cy="114" r="4" fill="#1a1f2b" stroke="#eab308" stroke-width="1" data-callout="dht11"/>' +
                 '<text x="108" y="113" text-anchor="end" fill="#555" font-size="5.5">D7</text>' +
                 '<circle cx="116" cy="132" r="4" fill="#1a1f2b" stroke="#22c55e" stroke-width="1" data-callout="photoresistor"/>' +
                 '<text x="108" y="131" text-anchor="end" fill="#555" font-size="5.5">A0</text>' +
                 '<circle cx="116" cy="150" r="4" fill="#1a1f2b" stroke="#f97316" stroke-width="1" data-callout="hcsr04"/>' +
                 '<text x="108" y="149" text-anchor="end" fill="#555" font-size="5.5">D8 Trig</text>' +
                 '<circle cx="116" cy="166" r="4" fill="#1a1f2b" stroke="#a855f7" stroke-width="1" data-callout="hcsr04"/>' +
                 '<text x="108" y="165" text-anchor="end" fill="#555" font-size="5.5">D9 Echo</text>' +
                 '<!-- DHT11 -->' +
                 '<rect x="180" y="32" width="96" height="80" rx="6" fill="#0f1a2e" stroke="#eab308" stroke-width="1.5" data-callout="dht11"/>' +
                 '<text x="228" y="50" text-anchor="middle" fill="#eab308" font-size="7" font-weight="700">DHT11</text>' +
                 '<text x="228" y="66" text-anchor="middle" fill="#8b949e" font-size="6">1-wire protocol</text>' +
                 '<text x="228" y="80" text-anchor="middle" fill="#555" font-size="5.5">Temp + Humidity</text>' +
                 '<text x="228" y="92" text-anchor="middle" fill="#555" font-size="5.5">reads every 2s</text>' +
                 '<!-- Photoresistor -->' +
                 '<rect x="180" y="128" width="96" height="60" rx="6" fill="#0f1a2e" stroke="#22c55e" stroke-width="1.5" data-callout="photoresistor"/>' +
                 '<text x="228" y="146" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">LDR</text>' +
                 '<circle cx="228" cy="163" r="9" fill="none" stroke="#eab308" stroke-width="1"/>' +
                 '<text x="228" y="167" text-anchor="middle" fill="#eab308" font-size="5.5">light</text>' +
                 '<!-- HC-SR04 -->' +
                 '<rect x="326" y="60" width="130" height="80" rx="6" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5" data-callout="hcsr04"/>' +
                 '<text x="391" y="78" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="700">HC-SR04</text>' +
                 '<circle cx="366" cy="108" r="12" fill="none" stroke="rgba(249,115,22,0.4)" stroke-width="1"/>' +
                 '<circle cx="366" cy="108" r="6" fill="rgba(249,115,22,0.1)"/>' +
                 '<text x="366" y="111" text-anchor="middle" fill="#f97316" font-size="5">TX</text>' +
                 '<circle cx="416" cy="108" r="12" fill="none" stroke="rgba(249,115,22,0.4)" stroke-width="1"/>' +
                 '<circle cx="416" cy="108" r="6" fill="rgba(249,115,22,0.1)"/>' +
                 '<text x="416" y="111" text-anchor="middle" fill="#f97316" font-size="5">RX</text>' +
                 '</svg>',
            components: [
                {
                    id: 'dht11',
                    name: 'DHT11 Temperature and Humidity Sensor',
                    purpose: 'Digital sensor using a proprietary 1-wire protocol. The microcontroller sends a start pulse, then the DHT11 responds with 40 bits of data: 8 bits humidity integer, 8 bits humidity decimal, 8 bits temp integer, 8 bits temp decimal, 8 bits checksum.',
                    specs: ['Temp range: 0-50 C (+/-2 C)', 'Humidity: 20-90% RH (+/-5%)', 'Sample rate max 1 Hz', '3-5V supply', 'D7 on Mega']
                },
                {
                    id: 'photoresistor',
                    name: 'Photoresistor (LDR)',
                    purpose: 'A resistor whose resistance decreases as light intensity increases. Used in a voltage divider with a 10K resistor. The midpoint voltage is read by an analog pin and converted to a 0-1023 digital value by the 10-bit ADC.',
                    specs: ['Dark resistance ~1M ohm', 'Bright resistance ~1K ohm', 'Paired with 10K resistor', 'A0 analog pin', 'No polarity (passive)']
                },
                {
                    id: 'hcsr04',
                    name: 'HC-SR04 Ultrasonic Distance Sensor',
                    purpose: 'Emits a 40kHz ultrasonic burst on the TRIG pin HIGH pulse, then raises ECHO HIGH for the duration the sound takes to travel out and return. Distance is calculated from time-of-flight: distance = duration / 58 (cm).',
                    specs: ['Range: 2-400 cm', 'Accuracy: +/-3 mm', '40kHz ultrasound', 'D8=Trig, D9=Echo', '5V supply, 15mA']
                },
                {
                    id: 'power',
                    name: '5V Power and GND Rails',
                    purpose: 'The Mega 5V pin sources regulated 5V from the onboard LM1117 regulator (when powered via USB, it is powered from the USB 5V rail through a polyfuse). All three sensors require 5V. The GND rail is the common return path.',
                    specs: ['5V max 500mA (USB powered)', 'Three GND pins on Mega', 'Always connect GND first', 'Power rails on breadboard edges']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'DHT11 Data Pin Missing Pull-up (Bare Module)',
                correct: 'If using the raw 4-pin DHT11 component (not a breakout board), a 10K pull-up resistor must connect the DATA pin to VCC. Most breakout modules include this resistor internally.',
                incorrect: 'The bare DHT11 is wired with only VCC, DATA, and GND. No pull-up resistor is present on the DATA line.',
                consequence: 'The data line floats HIGH unreliably. The DHT11 response is corrupted. You get continuous NaN readings even though the sensor is otherwise correctly wired. This is a very common source of confusion.',
                svgDiff: '<svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="120" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="104" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="104" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT (bare DHT11)</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG (bare DHT11)</text>' +
                         '<text x="20" y="50" fill="#ef4444" font-size="6">VCC</text>' +
                         '<line x1="44" y1="48" x2="90" y2="48" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<line x1="90" y1="48" x2="90" y2="68" stroke="#ef4444" stroke-width="1"/>' +
                         '<rect x="78" y="68" width="24" height="12" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="1"/>' +
                         '<text x="90" y="77" text-anchor="middle" fill="#c084fc" font-size="5.5">10K</text>' +
                         '<line x1="90" y1="80" x2="90" y2="90" stroke="#22c55e" stroke-width="1.5"/>' +
                         '<line x1="44" y1="90" x2="200" y2="90" stroke="#22c55e" stroke-width="2"/>' +
                         '<text x="20" y="94" fill="#eab308" font-size="6">DATA</text>' +
                         '<rect x="160" y="62" width="46" height="34" rx="4" fill="#0f1a2e" stroke="#eab308" stroke-width="1.5"/>' +
                         '<text x="183" y="83" text-anchor="middle" fill="#eab308" font-size="7" font-weight="700">DHT</text>' +
                         '<text x="124" y="110" text-anchor="middle" fill="#22c55e" font-size="6">pull-up stabilizes line</text>' +
                         '<text x="272" y="50" fill="#ef4444" font-size="6">VCC</text>' +
                         '<line x1="296" y1="48" x2="370" y2="48" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<line x1="296" y1="90" x2="452" y2="90" stroke="#22c55e" stroke-width="2"/>' +
                         '<text x="272" y="94" fill="#eab308" font-size="6">DATA</text>' +
                         '<rect x="412" y="62" width="46" height="34" rx="4" fill="#0f1a2e" stroke="#eab308" stroke-width="1.5"/>' +
                         '<text x="435" y="83" text-anchor="middle" fill="#eab308" font-size="7" font-weight="700">DHT</text>' +
                         '<text x="340" y="70" fill="#ef4444" font-size="6.5" font-weight="700">NO PULL-UP</text>' +
                         '<text x="376" y="110" text-anchor="middle" fill="#ef4444" font-size="6">line floats  -  NaN readings</text>' +
                         '</svg>'
            },
            {
                title: 'Photoresistor Voltage Divider Wired Wrong Order',
                correct: 'Photoresistor connects from 5V to the A0 junction. The 10K resistor connects from A0 junction down to GND. This makes the output go HIGH in bright light.',
                incorrect: 'The 10K resistor is placed on the top (5V side) and the LDR is on the bottom (GND side). The readings are inverted: dark reads high, bright reads low.',
                consequence: 'The circuit works electrically and will not damage anything, but your threshold logic will be backwards. A "dark room" alert fires in bright light. Recalibrate thresholds or swap the component positions.',
                svgDiff: '<svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="120" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="104" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="104" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG (inverted)</text>' +
                         '<!-- Correct: LDR top, 10K bottom -->' +
                         '<text x="40" y="42" fill="#ef4444" font-size="6">5V</text>' +
                         '<line x1="56" y1="40" x2="90" y2="40" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<circle cx="90" cy="56" r="9" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="90" y="60" text-anchor="middle" fill="#22c55e" font-size="5.5">LDR</text>' +
                         '<circle cx="90" cy="72" r="3" fill="#ff6b35"/>' +
                         '<line x1="93" y1="72" x2="140" y2="72" stroke="#ff6b35" stroke-width="1.5"/>' +
                         '<text x="148" y="75" fill="#ff6b35" font-size="5.5">A0</text>' +
                         '<rect x="78" y="78" width="24" height="12" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="1"/>' +
                         '<text x="90" y="87" text-anchor="middle" fill="#c084fc" font-size="5.5">10K</text>' +
                         '<line x1="90" y1="90" x2="90" y2="100" stroke="#60a5fa" stroke-width="1.5"/>' +
                         '<text x="90" y="108" text-anchor="middle" fill="#60a5fa" font-size="6">GND</text>' +
                         '<!-- Wrong: 10K top, LDR bottom -->' +
                         '<text x="290" y="42" fill="#ef4444" font-size="6">5V</text>' +
                         '<line x1="306" y1="40" x2="340" y2="40" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<rect x="328" y="44" width="24" height="12" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="1"/>' +
                         '<text x="340" y="53" text-anchor="middle" fill="#c084fc" font-size="5.5">10K</text>' +
                         '<circle cx="340" cy="66" r="3" fill="#ff6b35"/>' +
                         '<line x1="343" y1="66" x2="390" y2="66" stroke="#ff6b35" stroke-width="1.5"/>' +
                         '<text x="398" y="69" fill="#ff6b35" font-size="5.5">A0</text>' +
                         '<circle cx="340" cy="82" r="9" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="340" y="86" text-anchor="middle" fill="#22c55e" font-size="5.5">LDR</text>' +
                         '<line x1="340" y1="91" x2="340" y2="100" stroke="#60a5fa" stroke-width="1.5"/>' +
                         '<text x="340" y="108" text-anchor="middle" fill="#60a5fa" font-size="6">GND</text>' +
                         '<text x="430" y="66" fill="#ef4444" font-size="6.5" font-weight="700">INVERTED</text>' +
                         '</svg>'
            },
            {
                title: 'HC-SR04 TRIG and ECHO Pins Swapped',
                correct: 'TRIG connects to Arduino D8 (OUTPUT) and ECHO connects to D9 (INPUT). Trig is the sender, Echo is the receiver.',
                incorrect: 'TRIG connected to D9 and ECHO connected to D8. The Arduino pulses the wrong pin and waits on a pin that never goes HIGH.',
                consequence: 'HC-SR04 never fires. The pulseIn() call times out after 30ms every reading, outputting "out of range" indefinitely. No hardware damage occurs, but the sensor is completely non-functional.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG (swapped)</text>' +
                         '<text x="18" y="52" fill="#f97316" font-size="6">D8</text>' +
                         '<line x1="36" y1="50" x2="120" y2="50" stroke="#f97316" stroke-width="1.5"/>' +
                         '<text x="128" y="53" fill="#f97316" font-size="6">TRIG</text>' +
                         '<text x="18" y="78" fill="#a855f7" font-size="6">D9</text>' +
                         '<line x1="36" y1="76" x2="120" y2="76" stroke="#a855f7" stroke-width="1.5"/>' +
                         '<text x="128" y="79" fill="#a855f7" font-size="6">ECHO</text>' +
                         '<rect x="154" y="44" width="60" height="40" rx="4" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5"/>' +
                         '<text x="184" y="66" text-anchor="middle" fill="#fb923c" font-size="6.5">HC-SR04</text>' +
                         '<text x="124" y="100" text-anchor="middle" fill="#22c55e" font-size="6">sensor fires  -  readings OK</text>' +
                         '<text x="270" y="52" fill="#a855f7" font-size="6">D8</text>' +
                         '<line x1="288" y1="50" x2="372" y2="50" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<text x="380" y="53" fill="#a855f7" font-size="6">TRIG</text>' +
                         '<text x="270" y="78" fill="#f97316" font-size="6">D9</text>' +
                         '<line x1="288" y1="76" x2="372" y2="76" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<text x="380" y="79" fill="#f97316" font-size="6">ECHO</text>' +
                         '<rect x="406" y="44" width="60" height="40" rx="4" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5"/>' +
                         '<text x="436" y="66" text-anchor="middle" fill="#fb923c" font-size="6.5">HC-SR04</text>' +
                         '<line x1="289" y1="50" x2="289" y2="76" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>' +
                         '<text x="376" y="100" text-anchor="middle" fill="#ef4444" font-size="6">always OOR  -  nothing fires</text>' +
                         '</svg>'
            }
        ]
    },

    // ========================================================================
    // SG-03: Serial Bridge — Arduino Talks to Python
    // ========================================================================
    'sg-03': {
        intro: '<p>So far your Arduino has been talking to you through the Serial Monitor &mdash; a built-in IDE tool. But the real power of serial communication is connecting your microcontroller to a full computer, letting Python (or any language) process, store, analyze, and visualize sensor data in real time.</p>' +
               '<p>This is the bridge between embedded hardware and software. In cybersecurity, this exact pattern drives everything from log aggregation (sensors report to a central server) to hardware-in-the-loop testing (Python controls and monitors a device under test).</p>' +
               '<p>You will send structured data from the Arduino over USB serial, read it in Python with the <code>pyserial</code> library, parse it into usable values, and build a live terminal dashboard. By the end, you will have a pattern you can reuse for any hardware-to-software pipeline.</p>',

        wiring: '    Arduino Mega 2560              Computer\n' +
                '    +-------------------+          +-------------------+\n' +
                '    |                   |          |                   |\n' +
                '    |              USB  |===cable==|  USB port         |\n' +
                '    |                   |          |                   |\n' +
                '    |   (Any sensors    |          |  Python script    |\n' +
                '    |    from SG-02     |          |  reads serial     |\n' +
                '    |    still wired)   |          |  data via         |\n' +
                '    |                   |          |  pyserial         |\n' +
                '    |   DHT11 on D7     |          |                   |\n' +
                '    |   Photo on A0     |          |  Serial port:     |\n' +
                '    |   HC-SR04 D8/D9   |          |  COM3 (Win)       |\n' +
                '    |                   |          |  /dev/ttyACM0 (L) |\n' +
                '    +-------------------+          +-------------------+\n' +
                '\n' +
                '    No new wiring required — reuse SG-02 setup.\n' +
                '    The USB cable IS the data connection.',

        wiringNotes: '<p><strong>Important:</strong> Close the Arduino IDE Serial Monitor before running your Python script. Only one program can access the serial port at a time. If Python reports "Permission denied" or "Port busy", the Serial Monitor is likely still open.</p>' +
                     '<p><strong>Port detection:</strong> On Windows, check Device Manager &gt; Ports. On Linux, run <code>ls /dev/ttyACM*</code> or <code>ls /dev/ttyUSB*</code>. On macOS, run <code>ls /dev/cu.usb*</code>.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg03-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg03-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-03 SERIAL BRIDGE</text>' +

            '<!-- Arduino Mega -->' +
            '<g>' +
            '<rect x="40" y="70" width="200" height="240" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="70" width="200" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="86" width="200" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="140" y="86" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ARDUINO MEGA 2560</text>' +
            '<!-- Sensor references -->' +
            '<rect x="55" y="110" width="170" height="80" rx="4" fill="rgba(234,179,8,0.05)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="65" y="125" fill="#eab308" font-size="8" font-weight="600">SENSORS (from SG-02)</text>' +
            '<text x="65" y="142" fill="#8b949e" font-size="7">DHT11 on D7</text>' +
            '<text x="65" y="155" fill="#8b949e" font-size="7">Photoresistor on A0</text>' +
            '<text x="65" y="168" fill="#8b949e" font-size="7">HC-SR04 on D8/D9</text>' +
            '<text x="65" y="183" fill="#555" font-size="6" font-style="italic">No new wiring needed</text>' +
            '<!-- USB port -->' +
            '<rect x="200" y="210" width="40" height="30" rx="4" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="208" y="216" width="8" height="18" rx="1" fill="#3b82f6" opacity="0.4"/>' +
            '<rect x="222" y="216" width="8" height="18" rx="1" fill="#3b82f6" opacity="0.4"/>' +
            '<text x="220" y="254" text-anchor="middle" fill="#60a5fa" font-size="7">USB-B</text>' +
            '<!-- Serial data label -->' +
            '<rect x="55" y="270" width="170" height="24" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="140" y="286" text-anchor="middle" fill="#4ade80" font-size="7">Serial.println("DATA,1,23.5,...")</text>' +
            '</g>' +

            '<!-- USB Cable -->' +
            '<g>' +
            '<rect x="245" y="200" width="230" height="50" rx="6" fill="rgba(59,130,246,0.04)"/>' +
            '<line x1="240" y1="225" x2="480" y2="225" stroke="#3b82f6" stroke-width="3"/>' +
            '<line x1="240" y1="225" x2="480" y2="225" stroke="#60a5fa" stroke-width="1" stroke-dasharray="8,4"/>' +
            '<text x="360" y="218" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">USB CABLE</text>' +
            '<!-- Data flow arrows -->' +
            '<polygon points="350,233 358,237 350,241" fill="#22c55e" opacity="0.7"/>' +
            '<polygon points="370,233 362,237 370,241" fill="#f97316" opacity="0.7"/>' +
            '<text x="340" y="255" text-anchor="middle" fill="#22c55e" font-size="6">TX (Arduino &#8594; PC)</text>' +
            '<text x="390" y="255" text-anchor="middle" fill="#f97316" font-size="6">RX (PC &#8594; Arduino)</text>' +
            '</g>' +

            '<!-- Computer -->' +
            '<g>' +
            '<rect x="480" y="70" width="200" height="240" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="480" y="70" width="200" height="24" rx="8" fill="rgba(168,85,247,0.12)"/>' +
            '<rect x="480" y="86" width="200" height="8" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="580" y="86" text-anchor="middle" fill="#c084fc" font-size="10" font-weight="600">COMPUTER</text>' +
            '<!-- USB port on computer -->' +
            '<rect x="480" y="210" width="40" height="30" rx="4" fill="#1a1f2b" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="486" y="216" width="28" height="18" rx="2" fill="rgba(168,85,247,0.15)"/>' +
            '<text x="500" y="254" text-anchor="middle" fill="#c084fc" font-size="7">USB-A</text>' +
            '<!-- Python stack -->' +
            '<rect x="495" y="110" width="170" height="80" rx="4" fill="rgba(168,85,247,0.05)" stroke="rgba(168,85,247,0.15)" stroke-width="0.5"/>' +
            '<text x="505" y="125" fill="#c084fc" font-size="8" font-weight="600">PYTHON SCRIPTS</text>' +
            '<text x="505" y="142" fill="#8b949e" font-size="7">import serial (pyserial)</text>' +
            '<text x="505" y="155" fill="#8b949e" font-size="7">Parse CSV data lines</text>' +
            '<text x="505" y="168" fill="#8b949e" font-size="7">Live dashboard / CSV export</text>' +
            '<text x="505" y="183" fill="#555" font-size="6" font-style="italic">pip install pyserial</text>' +
            '<!-- Port info -->' +
            '<rect x="495" y="270" width="170" height="24" rx="4" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
            '<text x="580" y="286" text-anchor="middle" fill="#fb923c" font-size="7">COM3 (Win) / /dev/ttyACM0 (Linux)</text>' +
            '</g>' +

            '<!-- Protocol info -->' +
            '<rect x="240" y="320" width="240" height="40" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="360" y="336" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">SERIAL PROTOCOL</text>' +
            '<text x="360" y="350" text-anchor="middle" fill="#8b949e" font-size="7">9600 baud | 8N1 | Line-terminated CSV</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Arduino: Send Structured Data',
                content: '<p>Instead of human-readable text, send a consistent delimited format that Python can parse reliably. Use comma-separated values with a newline terminator. Each line has a prefix so Python knows what kind of data it is receiving.</p>',
                code: '#include <DHT.h>\n\n#define DHT_PIN    7\n#define DHT_TYPE   DHT11\n#define LIGHT_PIN  A0\n#define TRIG_PIN   8\n#define ECHO_PIN   9\n\nDHT dht(DHT_PIN, DHT_TYPE);\nunsigned long readCount = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  \n  // Send header line so Python knows the format\n  Serial.println("INIT:SG03_BRIDGE,v1");\n}\n\nfloat readDistance() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long dur = pulseIn(ECHO_PIN, HIGH, 30000);\n  return (dur == 0) ? -1.0 : dur / 58.0;\n}\n\nvoid loop() {\n  float tempC = dht.readTemperature();\n  float humid = dht.readHumidity();\n  int light = analogRead(LIGHT_PIN);\n  float dist = readDistance();\n  readCount++;\n  \n  // Format: DATA,count,temp,humidity,light,distance\n  Serial.print("DATA,");\n  Serial.print(readCount);\n  Serial.print(",");\n  Serial.print(isnan(tempC) ? -999.0 : tempC, 1);\n  Serial.print(",");\n  Serial.print(isnan(humid) ? -999.0 : humid, 1);\n  Serial.print(",");\n  Serial.print(light);\n  Serial.print(",");\n  Serial.println(dist, 1);\n  \n  delay(2000);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Using <code>-999.0</code> as a sentinel value for failed reads makes parsing simpler in Python than handling "NaN" strings. Just check for <code>-999</code> on the Python side.'
            },
            {
                title: 'Install pyserial',
                content: '<p>On your computer, install the Python serial library. Open a terminal (not the Arduino IDE) and run:</p>' +
                         '<p><code>pip install pyserial</code></p>' +
                         '<p>If you have multiple Python versions, use <code>pip3 install pyserial</code>. Verify the install with <code>python -c "import serial; print(serial.VERSION)"</code>.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> Do not confuse <code>pyserial</code> with the <code>serial</code> package. If you accidentally installed <code>serial</code> (no "py" prefix), uninstall it first: <code>pip uninstall serial && pip install pyserial</code>.'
            },
            {
                title: 'Python: Read Serial Data',
                content: '<p>This is your first Python-side script. It opens the serial port, reads lines, and prints them. Update the port name for your system.</p>',
                code: 'import serial\nimport sys\n\n# Update this for your system:\n# Windows: "COM3", "COM4", etc.\n# Linux:   "/dev/ttyACM0"\n# macOS:   "/dev/cu.usbmodem14101"\nPORT = "/dev/ttyACM0"\nBAUD = 9600\n\ndef main():\n    try:\n        ser = serial.Serial(PORT, BAUD, timeout=2)\n        print(f"Connected to {PORT} at {BAUD} baud")\n        print("Waiting for data... (Ctrl+C to quit)\\n")\n    except serial.SerialException as e:\n        print(f"ERROR: Could not open {PORT}: {e}")\n        sys.exit(1)\n    \n    try:\n        while True:\n            line = ser.readline().decode("utf-8", errors="replace").strip()\n            if line:\n                print(f"RAW: {line}")\n    except KeyboardInterrupt:\n        print("\\nDisconnected.")\n    finally:\n        ser.close()\n\nif __name__ == "__main__":\n    main()',
                language: 'Python',
                tip: '<strong>Tip:</strong> The <code>timeout=2</code> parameter prevents <code>readline()</code> from blocking forever if the Arduino stops sending. Always set a timeout.'
            },
            {
                title: 'Python: Parse and Display',
                content: '<p>Now parse the comma-separated data into actual values and display them in a formatted table. This script validates the data format and handles errors gracefully.</p>',
                code: 'import serial\nimport sys\nfrom datetime import datetime\n\nPORT = "/dev/ttyACM0"\nBAUD = 9600\n\ndef parse_data(line):\n    """Parse a DATA line into a dict. Returns None on invalid data."""\n    parts = line.split(",")\n    if len(parts) != 6 or parts[0] != "DATA":\n        return None\n    try:\n        return {\n            "count": int(parts[1]),\n            "temp_c": float(parts[2]),\n            "humidity": float(parts[3]),\n            "light": int(parts[4]),\n            "distance": float(parts[5]),\n            "timestamp": datetime.now().strftime("%H:%M:%S")\n        }\n    except ValueError:\n        return None\n\ndef display(data):\n    """Print one reading in a formatted line."""\n    temp = f"{data[\'temp_c\']:.1f} C" if data["temp_c"] > -900 else "ERROR"\n    humid = f"{data[\'humidity\']:.1f} %" if data["humidity"] > -900 else "ERROR"\n    light = str(data["light"])\n    dist = f"{data[\'distance\']:.1f} cm" if data["distance"] > 0 else "OOR"\n    \n    print(f"[{data[\'timestamp\']}] #{data[\'count\']:04d}  "\n          f"Temp: {temp:>8s}  Humid: {humid:>8s}  "\n          f"Light: {light:>4s}  Dist: {dist:>8s}")\n\ndef main():\n    ser = serial.Serial(PORT, BAUD, timeout=2)\n    print(f"SG-03 Serial Bridge — {PORT} @ {BAUD}")\n    print("-" * 72)\n    \n    try:\n        while True:\n            line = ser.readline().decode("utf-8", errors="replace").strip()\n            if not line:\n                continue\n            if line.startswith("INIT:"):\n                print(f"Arduino initialized: {line}")\n                continue\n            data = parse_data(line)\n            if data:\n                display(data)\n    except KeyboardInterrupt:\n        print("\\nSession ended.")\n    finally:\n        ser.close()\n\nif __name__ == "__main__":\n    main()',
                language: 'Python',
                tip: null
            },
            {
                title: 'Build a Live Terminal Dashboard',
                content: '<p>Clear the screen on each update to create a live dashboard effect. This script keeps a rolling history of the last 10 readings and shows min/max/average for each sensor.</p>',
                code: 'import serial\nimport sys\nimport os\nfrom datetime import datetime\nfrom collections import deque\n\nPORT = "/dev/ttyACM0"\nBAUD = 9600\nHISTORY_SIZE = 10\n\nhistory = deque(maxlen=HISTORY_SIZE)\n\ndef parse_data(line):\n    parts = line.split(",")\n    if len(parts) != 6 or parts[0] != "DATA":\n        return None\n    try:\n        return {\n            "count": int(parts[1]),\n            "temp_c": float(parts[2]),\n            "humidity": float(parts[3]),\n            "light": int(parts[4]),\n            "distance": float(parts[5])\n        }\n    except ValueError:\n        return None\n\ndef clear_screen():\n    os.system("cls" if os.name == "nt" else "clear")\n\ndef render_dashboard():\n    clear_screen()\n    now = datetime.now().strftime("%H:%M:%S")\n    latest = history[-1]\n    \n    print(f"  SG-03 SENSOR DASHBOARD          {now}\")\n    print(\"=\" * 52)\n    \n    # Current values\n    print(f\"  Temperature:  {latest[\'temp_c\']:6.1f} C\")\n    print(f\"  Humidity:     {latest[\'humidity\']:6.1f} %\")\n    print(f\"  Light Level:  {latest[\'light\']:6d}\")\n    print(f\"  Distance:     {latest[\'distance\']:6.1f} cm\")\n    print()\n    \n    # Stats from history\n    if len(history) > 1:\n        temps = [d[\"temp_c\"] for d in history if d[\"temp_c\"] > -900]\n        lights = [d[\"light\"] for d in history]\n        \n        if temps:\n            print(f\"  Temp range:   {min(temps):.1f} - {max(temps):.1f} C  \"\n                  f\"(avg {sum(temps)/len(temps):.1f})\")\n        print(f\"  Light range:  {min(lights)} - {max(lights)}  \"\n              f\"(avg {sum(lights)//len(lights)})\")\n    \n    print()\n    print(f\"  Readings: {latest[\'count\']}  |  Buffer: {len(history)}/{HISTORY_SIZE}\")\n    print(\"  Ctrl+C to quit\")\n\ndef main():\n    ser = serial.Serial(PORT, BAUD, timeout=2)\n    \n    try:\n        while True:\n            line = ser.readline().decode(\"utf-8\", errors=\"replace\").strip()\n            if not line or line.startswith(\"INIT:\"):\n                continue\n            data = parse_data(line)\n            if data:\n                history.append(data)\n                render_dashboard()\n    except KeyboardInterrupt:\n        print(\"\\nDashboard closed.\")\n    finally:\n        ser.close()\n\nif __name__ == \"__main__\":\n    main()',
                language: 'Python',
                tip: '<strong>Tip:</strong> On Windows, <code>os.system("cls")</code> flickers. For a smoother experience, use ANSI escape codes: <code>print("\\033[2J\\033[H", end="")</code> to clear and move the cursor to the top.'
            },
            {
                title: 'Export Data to CSV',
                content: '<p>Add CSV logging to create a permanent record. This is identical to how real SIEM systems work &mdash; stream data in, write it to persistent storage, analyze later.</p>',
                code: 'import serial\nimport csv\nimport sys\nfrom datetime import datetime\n\nPORT = "/dev/ttyACM0"\nBAUD = 9600\nCSV_FILE = "sensor_log.csv"\n\ndef parse_data(line):\n    parts = line.split(",")\n    if len(parts) != 6 or parts[0] != "DATA":\n        return None\n    try:\n        return {\n            "count": int(parts[1]),\n            "temp_c": float(parts[2]),\n            "humidity": float(parts[3]),\n            "light": int(parts[4]),\n            "distance": float(parts[5])\n        }\n    except ValueError:\n        return None\n\ndef main():\n    ser = serial.Serial(PORT, BAUD, timeout=2)\n    \n    with open(CSV_FILE, "w", newline="") as f:\n        writer = csv.writer(f)\n        writer.writerow(["timestamp", "count", "temp_c",\n                         "humidity", "light", "distance_cm"])\n        \n        print(f"Logging to {CSV_FILE}... (Ctrl+C to stop)")\n        \n        try:\n            while True:\n                line = ser.readline().decode("utf-8", errors="replace").strip()\n                if not line or line.startswith("INIT:"):\n                    continue\n                data = parse_data(line)\n                if data:\n                    row = [\n                        datetime.now().isoformat(),\n                        data["count"],\n                        data["temp_c"],\n                        data["humidity"],\n                        data["light"],\n                        data["distance"]\n                    ]\n                    writer.writerow(row)\n                    f.flush()  # Write immediately, don\'t buffer\n                    print(f"  Logged reading #{data[\'count\']}")\n        except KeyboardInterrupt:\n            print(f"\\nSaved {CSV_FILE} with logged data.")\n        finally:\n            ser.close()\n\nif __name__ == "__main__":\n    main()',
                language: 'Python',
                tip: '<strong>Tip:</strong> <code>f.flush()</code> is critical. Without it, Python buffers writes and you lose data if the script crashes or you forget to Ctrl+C cleanly.'
            }
        ],

        testing: '<p>Test the pipeline in stages:</p>' +
                 '<ul>' +
                 '<li><strong>Arduino side:</strong> Open Serial Monitor first. Verify you see <code>INIT:SG03_BRIDGE,v1</code> followed by <code>DATA,1,...</code> lines every 2 seconds. The format must be consistent with no extra spaces or missing commas.</li>' +
                 '<li><strong>Raw Python reader:</strong> Close Serial Monitor, run the basic reader script. You should see <code>RAW: DATA,1,...</code> lines appear. If nothing appears, check port name and baud rate.</li>' +
                 '<li><strong>Parsed display:</strong> Run the display script. Each line should show formatted values with timestamps. Move sensors around to verify values change.</li>' +
                 '<li><strong>Dashboard:</strong> Screen should clear and redraw every 2 seconds. Stats section should populate after 2+ readings.</li>' +
                 '<li><strong>CSV export:</strong> Run the logger for 30 seconds, then Ctrl+C. Open <code>sensor_log.csv</code> and verify columns, timestamps, and data values are correct. Import into a spreadsheet to confirm it parses cleanly.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>"Permission denied" on serial port (Linux):</strong> Run <code>sudo usermod -aG dialout $USER</code> and log out/in. Or run the script with <code>sudo</code> as a quick test.</li>' +
                         '<li><strong>"Port is already in use":</strong> Close the Arduino IDE Serial Monitor. Only one program can claim the port at a time.</li>' +
                         '<li><strong>Python receives garbled text:</strong> Baud rate mismatch. Both the Arduino sketch (<code>Serial.begin(9600)</code>) and the Python script (<code>BAUD = 9600</code>) must match exactly.</li>' +
                         '<li><strong>Python hangs on <code>readline()</code>:</strong> The <code>timeout</code> parameter is missing or too high. Set <code>timeout=2</code> in the <code>serial.Serial()</code> constructor.</li>' +
                         '<li><strong>"ModuleNotFoundError: No module named serial":</strong> You installed <code>serial</code> instead of <code>pyserial</code>. Run <code>pip uninstall serial && pip install pyserial</code>.</li>' +
                         '<li><strong>CSV file is empty after logging:</strong> The <code>f.flush()</code> call is missing, or no valid DATA lines were received. Check that the Arduino is sending and the parse function is not returning None for every line.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: JSON Protocol</strong> &mdash; Change the Arduino to send actual JSON: <code>{"t":23.5,"h":45.0,"l":512,"d":30.2}</code>. Parse it in Python with <code>json.loads()</code>. This is how IoT devices communicate with cloud platforms.</p>' +
                    '<p><strong>Challenge 2: Two-Way Communication</strong> &mdash; Send commands FROM Python TO the Arduino. For example, <code>SET_INTERVAL:5000</code> to change the read interval, or <code>LED:ON</code> to toggle an LED. Use <code>Serial.readStringUntil(\'\\n\')</code> on the Arduino side.</p>' +
                    '<p><strong>Challenge 3: Matplotlib Live Plot</strong> &mdash; Replace the terminal dashboard with a <code>matplotlib</code> animated plot showing temperature and light over time. Use <code>matplotlib.animation.FuncAnimation</code> for smooth updates.</p>',

        // ======================================================================
        // SG-03 visual enhancements
        // ======================================================================
        stepVisuals: {
            // Step 0 — Arduino sends structured serial data: UART frame anatomy
            0: '<svg viewBox="0 0 680 180" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs><pattern id="sg03-sv0-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
               '<rect width="680" height="180" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="164" fill="url(#sg03-sv0-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">UART SERIAL FRAME — 9600 BAUD, 8N1</text>' +
               '<!-- Bit cells -->' +
               '<!-- Idle HIGH baseline -->' +
               '<rect x="30" y="42" width="44" height="32" rx="2" fill="rgba(255,255,255,0.04)" stroke="#333" stroke-width="0.5"/>' +
               '<text x="52" y="62" text-anchor="middle" fill="#555" font-size="6.5">IDLE</text>' +
               '<text x="52" y="90" text-anchor="middle" fill="#444" font-size="5.5">HIGH</text>' +
               '<!-- Start bit LOW -->' +
               '<rect x="74" y="58" width="44" height="16" rx="2" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1"/>' +
               '<rect x="74" y="42" width="44" height="16" rx="2" fill="rgba(255,255,255,0.02)" stroke="#333" stroke-width="0.5"/>' +
               '<text x="96" y="54" text-anchor="middle" fill="#ef4444" font-size="6.5">START</text>' +
               '<text x="96" y="90" text-anchor="middle" fill="#ef4444" font-size="5.5">LOW</text>' +
               '<!-- 8 data bits (showing "D" = 0x44 = 01000100) -->' +
               '<rect x="118" y="58" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="136" y="90" text-anchor="middle" fill="#22c55e" font-size="5.5">0</text>' +
               '<text x="136" y="54" text-anchor="middle" fill="#555" font-size="5">b0</text>' +
               '<rect x="154" y="42" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="172" y="52" text-anchor="middle" fill="#22c55e" font-size="5.5">1</text>' +
               '<text x="172" y="90" text-anchor="middle" fill="#555" font-size="5">b1</text>' +
               '<rect x="190" y="58" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="208" y="90" text-anchor="middle" fill="#22c55e" font-size="5.5">0</text>' +
               '<text x="208" y="54" text-anchor="middle" fill="#555" font-size="5">b2</text>' +
               '<rect x="226" y="58" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="244" y="90" text-anchor="middle" fill="#22c55e" font-size="5.5">0</text>' +
               '<text x="244" y="54" text-anchor="middle" fill="#555" font-size="5">b3</text>' +
               '<rect x="262" y="42" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="280" y="52" text-anchor="middle" fill="#22c55e" font-size="5.5">1</text>' +
               '<text x="280" y="90" text-anchor="middle" fill="#555" font-size="5">b4</text>' +
               '<rect x="298" y="58" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="316" y="90" text-anchor="middle" fill="#22c55e" font-size="5.5">0</text>' +
               '<text x="316" y="54" text-anchor="middle" fill="#555" font-size="5">b5</text>' +
               '<rect x="334" y="58" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="352" y="90" text-anchor="middle" fill="#22c55e" font-size="5.5">0</text>' +
               '<text x="352" y="54" text-anchor="middle" fill="#555" font-size="5">b6</text>' +
               '<rect x="370" y="58" width="36" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="388" y="90" text-anchor="middle" fill="#22c55e" font-size="5.5">0</text>' +
               '<text x="388" y="54" text-anchor="middle" fill="#555" font-size="5">b7</text>' +
               '<!-- 8 data bit label -->' +
               '<text x="253" y="108" text-anchor="middle" fill="#22c55e" font-size="6.5">8 data bits  (0x44 = ASCII \'D\')</text>' +
               '<!-- Stop bit HIGH -->' +
               '<rect x="406" y="42" width="44" height="16" rx="2" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="1"/>' +
               '<text x="428" y="52" text-anchor="middle" fill="#3b82f6" font-size="6.5">STOP</text>' +
               '<text x="428" y="90" text-anchor="middle" fill="#3b82f6" font-size="5.5">HIGH</text>' +
               '<!-- Idle after -->' +
               '<rect x="450" y="42" width="44" height="32" rx="2" fill="rgba(255,255,255,0.04)" stroke="#333" stroke-width="0.5"/>' +
               '<text x="472" y="62" text-anchor="middle" fill="#555" font-size="6.5">IDLE</text>' +
               '<!-- Next byte ellipsis -->' +
               '<text x="520" y="62" fill="#333" font-size="12">...</text>' +
               '<!-- Bit period label -->' +
               '<line x1="74" y1="100" x2="118" y2="100" stroke="#ef4444" stroke-width="1"/>' +
               '<text x="96" y="112" text-anchor="middle" fill="#555" font-size="5.5">104 us</text>' +
               '<text x="96" y="122" text-anchor="middle" fill="#444" font-size="5">(9600 baud)</text>' +
               '<!-- CSV line callout -->' +
               '<rect x="30" y="134" width="620" height="30" rx="5" fill="rgba(255,107,53,0.05)" stroke="rgba(255,107,53,0.25)" stroke-width="1"/>' +
               '<text x="340" y="148" text-anchor="middle" fill="#8b949e" font-size="7">Arduino sends:  </text>' +
               '<text x="390" y="148" fill="#ff6b35" font-size="7" font-weight="700">DATA,1,23.5,45.0,512,30.2\n</text>' +
               '<text x="340" y="159" text-anchor="middle" fill="#555" font-size="6">Each character = 1 UART frame (10 bits total at 9600 baud = ~1042us per character)</text>' +
               '</svg>',

            // Step 2 — Python parse and display: pyserial stack
            2: '<svg viewBox="0 0 680 190" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs>' +
               '<pattern id="sg03-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
               '<marker id="sg03-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#22c55e"/></marker>' +
               '</defs>' +
               '<rect width="680" height="190" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="174" fill="url(#sg03-sv2-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">PYSERIAL DATA PIPELINE</text>' +
               '<!-- Arduino box -->' +
               '<rect x="20" y="36" width="110" height="130" rx="6" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5"/>' +
               '<text x="75" y="54" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="700">Arduino</text>' +
               '<text x="75" y="68" text-anchor="middle" fill="#8b949e" font-size="6">Serial.begin(9600)</text>' +
               '<text x="75" y="84" text-anchor="middle" fill="#8b949e" font-size="6">Serial.println()</text>' +
               '<rect x="32" y="94" width="86" height="14" rx="2" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
               '<text x="75" y="104" text-anchor="middle" fill="#4ade80" font-size="5.5">DATA,1,23.5,45.0,512</text>' +
               '<text x="75" y="134" text-anchor="middle" fill="#555" font-size="5.5">TX pin (D0)</text>' +
               '<text x="75" y="146" text-anchor="middle" fill="#555" font-size="5.5">USB CDC</text>' +
               '<text x="75" y="158" text-anchor="middle" fill="#555" font-size="5.5">virtual COM</text>' +
               '<!-- Arrow -->' +
               '<line x1="132" y1="100" x2="178" y2="100" stroke="#22c55e" stroke-width="1.5" marker-end="url(#sg03-arr)"/>' +
               '<text x="155" y="92" text-anchor="middle" fill="#555" font-size="5.5">USB cable</text>' +
               '<text x="155" y="112" text-anchor="middle" fill="#555" font-size="5.5">9600 baud</text>' +
               '<!-- serial.Serial() -->' +
               '<rect x="180" y="36" width="120" height="130" rx="6" fill="#0f1a2e" stroke="#a855f7" stroke-width="1.5"/>' +
               '<text x="240" y="54" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">serial.Serial()</text>' +
               '<text x="240" y="68" text-anchor="middle" fill="#8b949e" font-size="6">pyserial library</text>' +
               '<text x="240" y="82" text-anchor="middle" fill="#555" font-size="5.5">opens OS port</text>' +
               '<text x="240" y="94" text-anchor="middle" fill="#555" font-size="5.5">sets baud rate</text>' +
               '<text x="240" y="106" text-anchor="middle" fill="#555" font-size="5.5">reads bytes</text>' +
               '<rect x="192" y="114" width="96" height="14" rx="2" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
               '<text x="240" y="124" text-anchor="middle" fill="#c084fc" font-size="5.5">readline() -> bytes</text>' +
               '<!-- Arrow -->' +
               '<line x1="302" y1="100" x2="348" y2="100" stroke="#22c55e" stroke-width="1.5" marker-end="url(#sg03-arr)"/>' +
               '<text x="325" y="92" text-anchor="middle" fill="#555" font-size="5.5">decode()</text>' +
               '<text x="325" y="112" text-anchor="middle" fill="#555" font-size="5.5">strip()</text>' +
               '<!-- split() parse -->' +
               '<rect x="350" y="36" width="120" height="130" rx="6" fill="#0f1a2e" stroke="#eab308" stroke-width="1.5"/>' +
               '<text x="410" y="54" text-anchor="middle" fill="#fde68a" font-size="7" font-weight="700">parse(line)</text>' +
               '<text x="410" y="68" text-anchor="middle" fill="#8b949e" font-size="6">Python string ops</text>' +
               '<text x="410" y="82" text-anchor="middle" fill="#555" font-size="5.5">line.split(\',\')</text>' +
               '<text x="410" y="94" text-anchor="middle" fill="#555" font-size="5.5">validate prefix</text>' +
               '<text x="410" y="106" text-anchor="middle" fill="#555" font-size="5.5">float(parts[2])</text>' +
               '<rect x="362" y="114" width="96" height="14" rx="2" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
               '<text x="410" y="124" text-anchor="middle" fill="#eab308" font-size="5.5">dict: temp=23.5</text>' +
               '<!-- Arrow -->' +
               '<line x1="472" y1="100" x2="518" y2="100" stroke="#22c55e" stroke-width="1.5" marker-end="url(#sg03-arr)"/>' +
               '<text x="495" y="92" text-anchor="middle" fill="#555" font-size="5.5">display</text>' +
               '<text x="495" y="112" text-anchor="middle" fill="#555" font-size="5.5">or log</text>' +
               '<!-- Output -->' +
               '<rect x="520" y="36" width="140" height="130" rx="6" fill="#0f1a2e" stroke="#ff6b35" stroke-width="1.5"/>' +
               '<text x="590" y="54" text-anchor="middle" fill="#ff6b35" font-size="7" font-weight="700">Output</text>' +
               '<text x="590" y="70" text-anchor="middle" fill="#8b949e" font-size="5.5">terminal dashboard</text>' +
               '<text x="590" y="82" text-anchor="middle" fill="#8b949e" font-size="5.5">CSV file write</text>' +
               '<text x="590" y="96" text-anchor="middle" fill="#8b949e" font-size="5.5">matplotlib plot</text>' +
               '<text x="590" y="108" text-anchor="middle" fill="#8b949e" font-size="5.5">network stream</text>' +
               '</svg>'
        },

        componentCallouts: {
            svg: '<svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                 '<defs><pattern id="sg03-cc-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
                 '<rect width="560" height="180" fill="#0d1117" rx="6"/>' +
                 '<rect x="6" y="6" width="548" height="168" fill="url(#sg03-cc-grid)" rx="3"/>' +
                 '<text x="280" y="20" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.14em">SG-03 SERIAL BRIDGE — SYSTEM OVERVIEW</text>' +
                 '<!-- Arduino -->' +
                 '<rect x="20" y="36" width="120" height="120" rx="6" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5" data-callout="arduino"/>' +
                 '<text x="80" y="56" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="700">ARDUINO MEGA</text>' +
                 '<text x="80" y="72" text-anchor="middle" fill="#8b949e" font-size="6">Sensors wired</text>' +
                 '<text x="80" y="84" text-anchor="middle" fill="#8b949e" font-size="6">from SG-02</text>' +
                 '<rect x="32" y="100" width="96" height="14" rx="2" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5" data-callout="serial"/>' +
                 '<text x="80" y="110" text-anchor="middle" fill="#4ade80" font-size="5.5">Serial.println()</text>' +
                 '<rect x="80" y="128" width="30" height="20" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1.5" data-callout="usb-port"/>' +
                 '<text x="95" y="140" text-anchor="middle" fill="#3b82f6" font-size="5">USB-B</text>' +
                 '<!-- USB cable -->' +
                 '<rect x="160" y="82" width="120" height="16" rx="4" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5" data-callout="usb-cable"/>' +
                 '<text x="220" y="93" text-anchor="middle" fill="#60a5fa" font-size="5.5">USB cable (data)</text>' +
                 '<!-- Computer -->' +
                 '<rect x="300" y="36" width="240" height="120" rx="6" fill="#0f1a2e" stroke="#a855f7" stroke-width="1.5" data-callout="computer"/>' +
                 '<text x="420" y="56" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">COMPUTER</text>' +
                 '<rect x="314" y="68" width="212" height="12" rx="2" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.15)" stroke-width="0.5" data-callout="pyserial"/>' +
                 '<text x="420" y="77" text-anchor="middle" fill="#c084fc" font-size="5.5">import serial  (pyserial)</text>' +
                 '<rect x="314" y="84" width="212" height="12" rx="2" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.12)" stroke-width="0.5" data-callout="parse"/>' +
                 '<text x="420" y="93" text-anchor="middle" fill="#eab308" font-size="5.5">line.split(\',\')  -  parse CSV</text>' +
                 '<rect x="314" y="100" width="212" height="12" rx="2" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.12)" stroke-width="0.5" data-callout="output"/>' +
                 '<text x="420" y="109" text-anchor="middle" fill="#4ade80" font-size="5.5">dashboard / CSV log / plot</text>' +
                 '<rect x="300" y="132" width="30" height="16" rx="3" fill="#1a1f2b" stroke="#a855f7" stroke-width="1.5" data-callout="usb-port"/>' +
                 '<text x="315" y="142" text-anchor="middle" fill="#a855f7" font-size="5">USB-A</text>' +
                 '</svg>',
            components: [
                {
                    id: 'arduino',
                    name: 'Arduino Mega 2560 (transmitter)',
                    purpose: 'Reads sensors and transmits structured text over the hardware UART0. Pin 0 (RX) and pin 1 (TX) are wired internally to the CH340G USB-to-serial converter chip on the Mega. No external wiring needed &mdash; the USB cable carries serial data.',
                    specs: ['UART0 baud: 9600 (configurable)', 'TX pin: D0 (to USB chip)', 'CH340G USB-UART bridge', 'Serial buffer: 64 bytes RX, 64 bytes TX']
                },
                {
                    id: 'serial',
                    name: 'Serial Protocol (CSV format)',
                    purpose: 'Arduino sends comma-separated lines: DATA,seq,temp,humidity,light,distance. The seq number catches dropped lines. Each line ends with \\r\\n (carriage return + newline), so Python readline() can detect the end.',
                    specs: ['Format: DATA,N,T,H,L,D', '\\r\\n line terminator', 'One line every 2 seconds', 'INIT: handshake on boot']
                },
                {
                    id: 'pyserial',
                    name: 'pyserial Library',
                    purpose: 'Python library that wraps the OS serial port API. serial.Serial() opens the port, configures baud rate and timeout. readline() blocks until a \\n character arrives or the timeout expires. Returns bytes that must be decoded to a string.',
                    specs: ['pip install pyserial', 'serial.Serial(port, baud, timeout)', '.readline() returns bytes', '.decode(\'utf-8\').strip()']
                },
                {
                    id: 'usb-cable',
                    name: 'USB Cable (data path)',
                    purpose: 'The USB cable carries serial data from the CH340G chip on the Arduino to the host PC. The OS enumerates it as a virtual COM port (Windows: COMx, Linux: /dev/ttyACM0 or ttyUSB0, macOS: /dev/cu.usbmodem). Close the IDE Serial Monitor before using pyserial.',
                    specs: ['USB 2.0 Full-Speed', 'Virtual COM port (CDC)', 'Linux: /dev/ttyACM0', 'Windows: COMx (Device Manager)']
                },
                {
                    id: 'parse',
                    name: 'CSV Parsing (Python)',
                    purpose: 'line.split(\',\') splits the received string into a list. parts[0] must equal "DATA". parts[2] through parts[5] are cast to float/int. If any conversion fails, the line is discarded rather than crashing the script.',
                    specs: ['split(\',\') -> list', 'try/except on float()', 'Validate parts[0]==\"DATA\"', 'Return None on bad parse']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'Serial Monitor Open While Python Script Runs',
                correct: 'Close the Arduino IDE Serial Monitor window completely before launching any Python script that opens the serial port. Only one program may hold the port at a time.',
                incorrect: 'Arduino IDE Serial Monitor is open and streaming data. Python script is launched and immediately gets a "serial.SerialException: [Errno 16] Device or resource busy" error.',
                consequence: 'Python cannot open the port at all. The script crashes on the serial.Serial() call. This is the most common SG-03 error by far. Close the Serial Monitor tab, not just the monitor window.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<rect x="18" y="34" width="90" height="28" rx="3" fill="#0f1a2e" stroke="#a855f7" stroke-width="1"/>' +
                         '<text x="63" y="46" text-anchor="middle" fill="#a855f7" font-size="6">Python script</text>' +
                         '<text x="63" y="58" text-anchor="middle" fill="#22c55e" font-size="5.5">port: OPEN</text>' +
                         '<rect x="18" y="68" width="90" height="24" rx="3" fill="#0f1a2e" stroke="#333" stroke-width="1"/>' +
                         '<text x="63" y="78" text-anchor="middle" fill="#555" font-size="6">Serial Monitor</text>' +
                         '<text x="63" y="88" text-anchor="middle" fill="#444" font-size="5.5">CLOSED</text>' +
                         '<text x="124" y="105" text-anchor="middle" fill="#22c55e" font-size="6">works correctly</text>' +
                         '<rect x="270" y="34" width="90" height="28" rx="3" fill="#0f1a2e" stroke="#a855f7" stroke-width="1"/>' +
                         '<text x="315" y="46" text-anchor="middle" fill="#a855f7" font-size="6">Python script</text>' +
                         '<text x="315" y="58" text-anchor="middle" fill="#ef4444" font-size="5.5">port: BLOCKED</text>' +
                         '<rect x="270" y="68" width="90" height="24" rx="3" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5"/>' +
                         '<text x="315" y="78" text-anchor="middle" fill="#3b82f6" font-size="6">Serial Monitor</text>' +
                         '<text x="315" y="88" text-anchor="middle" fill="#eab308" font-size="5.5">OPEN (holding port)</text>' +
                         '<text x="376" y="105" text-anchor="middle" fill="#ef4444" font-size="6">SerialException: resource busy</text>' +
                         '</svg>'
            },
            {
                title: 'Baud Rate Mismatch Between Arduino and Python',
                correct: 'Arduino sketch has Serial.begin(9600) and Python script has serial.Serial(port, 9600). Both sides must agree on the bit rate.',
                incorrect: 'Arduino uses Serial.begin(115200) but Python is still configured for 9600 baud. Or vice versa.',
                consequence: 'Python receives data, but it is completely garbled: random characters, question marks, or binary garbage. The bits arrive but are sampled at the wrong times. The data looks like it arrived but is unreadable.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<text x="20" y="52" fill="#60a5fa" font-size="6.5">Arduino:</text>' +
                         '<text x="90" y="52" fill="#eab308" font-size="6.5" font-weight="700">9600</text>' +
                         '<text x="20" y="68" fill="#a855f7" font-size="6.5">Python:</text>' +
                         '<text x="90" y="68" fill="#eab308" font-size="6.5" font-weight="700">9600</text>' +
                         '<rect x="18" y="78" width="200" height="16" rx="2" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
                         '<text x="118" y="89" text-anchor="middle" fill="#22c55e" font-size="6">DATA,1,23.5,45.0,512  -- clean</text>' +
                         '<text x="272" y="52" fill="#60a5fa" font-size="6.5">Arduino:</text>' +
                         '<text x="342" y="52" fill="#22c55e" font-size="6.5" font-weight="700">115200</text>' +
                         '<text x="272" y="68" fill="#a855f7" font-size="6.5">Python:</text>' +
                         '<text x="342" y="68" fill="#ef4444" font-size="6.5" font-weight="700">9600</text>' +
                         '<rect x="270" y="78" width="200" height="16" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
                         '<text x="370" y="89" text-anchor="middle" fill="#ef4444" font-size="6">&#xFFFD;&#xFFFD;&#x00B5;&#x00C7;&#xFFFD;&#x00FF;  -- garbage</text>' +
                         '</svg>'
            },
            {
                title: 'Wrong Python Serial Port Name',
                correct: 'Python script uses the exact port name shown in Device Manager (Windows: "COM3") or dmesg (Linux: "/dev/ttyACM0"). The port name can change if the device is re-plugged.',
                incorrect: 'Script hardcodes "COM3" but the Arduino is on COM7, or uses "/dev/ttyUSB0" when the device is on "/dev/ttyACM0".',
                consequence: 'Python raises serial.SerialException: could not open port. The error message includes the wrong port name, which is the clue. Run the port detection command for your OS to find the actual port.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<text x="20" y="50" fill="#8b949e" font-size="6">Actual OS port:</text>' +
                         '<text x="20" y="64" fill="#22c55e" font-size="6.5" font-weight="700">/dev/ttyACM0</text>' +
                         '<text x="20" y="78" fill="#8b949e" font-size="6">Script config:</text>' +
                         '<text x="20" y="92" fill="#22c55e" font-size="6.5" font-weight="700">PORT = "/dev/ttyACM0"</text>' +
                         '<text x="272" y="50" fill="#8b949e" font-size="6">Actual OS port:</text>' +
                         '<text x="272" y="64" fill="#22c55e" font-size="6.5" font-weight="700">/dev/ttyACM0</text>' +
                         '<text x="272" y="78" fill="#8b949e" font-size="6">Script config:</text>' +
                         '<text x="272" y="92" fill="#ef4444" font-size="6.5" font-weight="700">PORT = "/dev/ttyUSB0"</text>' +
                         '<text x="376" y="105" text-anchor="middle" fill="#ef4444" font-size="6">SerialException: could not open port</text>' +
                         '</svg>'
            }
        ]
    },

    // ========================================================================
    // SG-04: LCD Dashboard — Multi-Screen Sensor Display
    // ========================================================================
    'sg-04': {
        intro: '<p>An LCD display turns your Arduino from a tethered dev board into a standalone device. Instead of requiring a laptop and Serial Monitor to see data, you can read sensor values directly on a 16x2 character LCD. This is how real field instruments, server room panels, and embedded monitoring tools present information.</p>' +
               '<p>The LCD 1602 gives you 2 lines of 16 characters each &mdash; not much real estate, but enough for critical readings. You will learn to drive the display, show live sensor data, create a multi-page interface with button navigation, and build an auto-refreshing dashboard.</p>' +
               '<p>This project supports both I2C (2-wire, easier) and parallel (6+ wire, more common in kits) LCD connections. The ELEGOO kit includes the LCD and a potentiometer for contrast adjustment.</p>',

        wiring: '    === OPTION A: I2C Backpack (recommended, 4 wires) ===\n' +
                '\n' +
                '    Arduino Mega         I2C LCD Backpack\n' +
                '    +------------+       +-------------+\n' +
                '    |       SDA 20|------|SDA           |\n' +
                '    |       SCL 21|------|SCL           |\n' +
                '    |         5V  |------|VCC           |\n' +
                '    |        GND  |------|GND           |\n' +
                '    +------------+       +-------------+\n' +
                '\n' +
                '    === OPTION B: Parallel (12 wires, kit default) ===\n' +
                '\n' +
                '    Arduino Mega         LCD 1602          10K Pot\n' +
                '    +------------+       +-----------+     +-----+\n' +
                '    |        GND |-------|VSS (pin 1)|     |     |\n' +
                '    |         5V |-------|VDD (pin 2)|     |     |\n' +
                '    |            |       |V0  (pin 3)|-----|Wiper|\n' +
                '    |        GND |-------|RS  (pin 4)= D12 |     |\n' +
                '    |            |       |RW  (pin 5)|=GND +-----+\n' +
                '    |        D12 |-------|RS  (pin 4)|     5V--[H]\n' +
                '    |        GND |-------|RW  (pin 5)|     GND-[L]\n' +
                '    |        D11 |-------|E   (pin 6)|\n' +
                '    |         D5 |-------|D4 (pin 11)|\n' +
                '    |         D4 |-------|D5 (pin 12)|\n' +
                '    |         D3 |-------|D6 (pin 13)|\n' +
                '    |         D2 |-------|D7 (pin 14)|\n' +
                '    |         5V |-------|A  (pin 15)| (backlight +)\n' +
                '    |        GND |-------|K  (pin 16)| (backlight -)\n' +
                '    +------------+       +-----------+\n' +
                '\n' +
                '    DHT11 sensor: same as SG-02 (D7)\n' +
                '    Button: D10 --[button]-- GND (uses internal pull-up)',

        wiringNotes: '<p><strong>I2C vs Parallel:</strong> If you have an I2C backpack soldered to your LCD (a small board on the back with 4 pins), use Option A. If your LCD has 16 bare pins, use Option B. I2C uses only 2 data wires and is much simpler.</p>' +
                     '<p><strong>Contrast:</strong> With parallel wiring, the potentiometer on pin V0 controls contrast. Turn it slowly until you see dark blocks appear on the LCD &mdash; that means it is working. I2C backpacks usually have a small blue potentiometer on the board itself.</p>' +
                     '<p><strong>Button wiring:</strong> We use <code>INPUT_PULLUP</code> mode, so the button connects pin D10 directly to GND. No external resistor needed. When pressed, the pin reads LOW.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg04-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="460" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="440" fill="url(#sg04-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-04 LCD DASHBOARD</text>' +

            '<!-- Arduino Mega -->' +
            '<g>' +
            '<rect x="40" y="55" width="170" height="340" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="55" width="170" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="71" width="170" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="125" y="71" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ARDUINO MEGA</text>' +
            '<!-- Pin column -->' +
            '<text x="200" y="105" text-anchor="end" fill="#8b949e" font-size="8">5V</text>' +
            '<circle cx="208" cy="102" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="200" y="125" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="208" cy="122" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="200" y="160" text-anchor="end" fill="#8b949e" font-size="8">SDA 20</text>' +
            '<circle cx="208" cy="157" r="3" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="200" y="180" text-anchor="end" fill="#8b949e" font-size="8">SCL 21</text>' +
            '<circle cx="208" cy="177" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="200" y="220" text-anchor="end" fill="#8b949e" font-size="8">D7</text>' +
            '<circle cx="208" cy="217" r="3" fill="#1a1f2b" stroke="#f97316" stroke-width="1"/>' +
            '<text x="200" y="250" text-anchor="end" fill="#8b949e" font-size="8">A0</text>' +
            '<circle cx="208" cy="247" r="3" fill="#1a1f2b" stroke="#06b6d4" stroke-width="1"/>' +
            '<text x="200" y="290" text-anchor="end" fill="#8b949e" font-size="8">D10</text>' +
            '<circle cx="208" cy="287" r="3" fill="#1a1f2b" stroke="#e2e8f0" stroke-width="1"/>' +
            '</g>' +

            '<!-- LCD 1602 (I2C) -->' +
            '<g>' +
            '<rect x="310" y="55" width="220" height="130" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="310" y="55" width="220" height="20" rx="8" fill="rgba(34,197,94,0.1)"/>' +
            '<rect x="310" y="68" width="220" height="7" fill="rgba(34,197,94,0.1)"/>' +
            '<text x="420" y="70" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">LCD 1602 (I2C)</text>' +
            '<!-- LCD screen -->' +
            '<rect x="330" y="85" width="180" height="50" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.4)" stroke-width="1"/>' +
            '<text x="340" y="105" fill="#4ade80" font-size="9">Temp: 23.5 C</text>' +
            '<text x="340" y="122" fill="#4ade80" font-size="9">Humid: 45.2 %</text>' +
            '<!-- I2C Pins -->' +
            '<rect x="325" y="145" width="30" height="14" rx="2" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="340" y="155" text-anchor="middle" fill="#4ade80" font-size="6">SDA</text>' +
            '<rect x="360" y="145" width="30" height="14" rx="2" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="375" y="155" text-anchor="middle" fill="#eab308" font-size="6">SCL</text>' +
            '<rect x="395" y="145" width="30" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="410" y="155" text-anchor="middle" fill="#ef4444" font-size="6">VCC</text>' +
            '<rect x="430" y="145" width="30" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="445" y="155" text-anchor="middle" fill="#60a5fa" font-size="6">GND</text>' +
            '<!-- I2C address note -->' +
            '<text x="490" y="155" fill="#555" font-size="6">addr: 0x27</text>' +
            '</g>' +

            '<!-- DHT11 Sensor -->' +
            '<g>' +
            '<rect x="310" y="210" width="120" height="70" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="310" y="210" width="120" height="20" rx="8" fill="rgba(249,115,22,0.1)"/>' +
            '<rect x="310" y="223" width="120" height="7" fill="rgba(249,115,22,0.1)"/>' +
            '<text x="370" y="225" text-anchor="middle" fill="#fb923c" font-size="9" font-weight="600">DHT11</text>' +
            '<text x="370" y="248" text-anchor="middle" fill="#8b949e" font-size="7">D7 = Data</text>' +
            '<text x="370" y="262" text-anchor="middle" fill="#8b949e" font-size="7">5V + GND</text>' +
            '</g>' +

            '<!-- Photoresistor -->' +
            '<g>' +
            '<rect x="450" y="210" width="120" height="70" rx="8" fill="#1e2736" stroke="#06b6d4" stroke-width="1.5"/>' +
            '<rect x="450" y="210" width="120" height="20" rx="8" fill="rgba(6,182,212,0.1)"/>' +
            '<rect x="450" y="223" width="120" height="7" fill="rgba(6,182,212,0.1)"/>' +
            '<text x="510" y="225" text-anchor="middle" fill="#22d3ee" font-size="9" font-weight="600">PHOTORESISTOR</text>' +
            '<text x="510" y="248" text-anchor="middle" fill="#8b949e" font-size="7">A0 = Signal</text>' +
            '<text x="510" y="262" text-anchor="middle" fill="#8b949e" font-size="7">Voltage divider</text>' +
            '</g>' +

            '<!-- Push Button -->' +
            '<g>' +
            '<rect x="310" y="310" width="120" height="70" rx="8" fill="#1e2736" stroke="#e2e8f0" stroke-width="1.5"/>' +
            '<rect x="310" y="310" width="120" height="20" rx="8" fill="rgba(226,232,240,0.1)"/>' +
            '<rect x="310" y="323" width="120" height="7" fill="rgba(226,232,240,0.1)"/>' +
            '<text x="370" y="325" text-anchor="middle" fill="#e2e8f0" font-size="9" font-weight="600">PUSH BUTTON</text>' +
            '<text x="370" y="348" text-anchor="middle" fill="#8b949e" font-size="7">D10 &#8594; BTN &#8594; GND</text>' +
            '<text x="370" y="362" text-anchor="middle" fill="#555" font-size="6">INPUT_PULLUP (no resistor)</text>' +
            '</g>' +

            '<!-- Wires -->' +
            '<!-- SDA (green) -->' +
            '<path d="M211,157 C260,157 290,152 340,152" stroke="#22c55e" stroke-width="1.5" fill="none"/>' +
            '<!-- SCL (yellow) -->' +
            '<path d="M211,177 C260,177 300,152 375,152" stroke="#eab308" stroke-width="1.5" fill="none"/>' +
            '<!-- 5V (red) -->' +
            '<path d="M211,102 C260,102 300,100 410,152" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4,3"/>' +
            '<!-- GND (gray) -->' +
            '<path d="M211,122 C260,122 310,130 445,152" stroke="#8b949e" stroke-width="1.5" fill="none" stroke-dasharray="4,3"/>' +
            '<!-- D7 to DHT11 (orange) -->' +
            '<path d="M211,217 C260,217 280,240 310,240" stroke="#f97316" stroke-width="1.5" fill="none"/>' +
            '<!-- A0 to Photoresistor (cyan) -->' +
            '<path d="M211,247 C300,247 380,248 450,248" stroke="#06b6d4" stroke-width="1.5" fill="none"/>' +
            '<!-- D10 to Button (white) -->' +
            '<path d="M211,287 C260,287 280,340 310,340" stroke="#e2e8f0" stroke-width="1.5" fill="none"/>' +

            '<!-- Page indicator -->' +
            '<rect x="500" y="310" width="170" height="70" rx="6" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="510" y="326" fill="#4ade80" font-size="8" font-weight="600">LCD PAGES</text>' +
            '<text x="510" y="342" fill="#8b949e" font-size="7">P1: Temp + Humidity</text>' +
            '<text x="510" y="356" fill="#8b949e" font-size="7">P2: Light level bar</text>' +
            '<text x="510" y="370" fill="#8b949e" font-size="7">P3: System status</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install LCD Library',
                content: '<p>For <strong>I2C</strong>: Install "LiquidCrystal I2C" by Frank de Brabander from the Library Manager. For <strong>parallel</strong>: The <code>LiquidCrystal</code> library is built into the Arduino IDE &mdash; no install needed.</p>' +
                         '<p>If your I2C LCD does not display anything, you may need to find its address. Most are <code>0x27</code>, but some use <code>0x3F</code>. Run the I2C scanner sketch (below) to check.</p>',
                code: '// I2C Address Scanner — upload this if your LCD does not respond\n#include <Wire.h>\n\nvoid setup() {\n  Wire.begin();\n  Serial.begin(9600);\n  Serial.println("Scanning I2C bus...");\n  \n  int found = 0;\n  for (byte addr = 1; addr < 127; addr++) {\n    Wire.beginTransmission(addr);\n    if (Wire.endTransmission() == 0) {\n      Serial.print("  Device at 0x");\n      Serial.println(addr, HEX);\n      found++;\n    }\n  }\n  Serial.print("Scan complete. Found ");\n  Serial.print(found);\n  Serial.println(" device(s).");\n}\n\nvoid loop() {}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Keep this I2C scanner sketch handy. You will use it again for the RTC module in SG-05 and any future I2C device.'
            },
            {
                title: 'Display Static Text',
                content: '<p>Start simple: display fixed text to verify the LCD is working. If you see text, your wiring and library are correct. If you see blank or solid blocks, adjust the contrast potentiometer.</p>',
                code: '// === I2C VERSION ===\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);  // addr, cols, rows\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);  // col 0, row 0\n  lcd.print("SG-04 Dashboard");\n  lcd.setCursor(0, 1);  // col 0, row 1\n  lcd.print("LCD Online!");\n}\n\nvoid loop() {}\n\n// === PARALLEL VERSION ===\n// #include <LiquidCrystal.h>\n// LiquidCrystal lcd(12, 11, 5, 4, 3, 2);  // RS,E,D4,D5,D6,D7\n// void setup() {\n//   lcd.begin(16, 2);\n//   lcd.setCursor(0, 0);\n//   lcd.print("SG-04 Dashboard");\n//   lcd.setCursor(0, 1);\n//   lcd.print("LCD Online!");\n// }\n// void loop() {}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> If using the parallel version, uncomment that block and comment out the I2C block. The pin numbers in <code>LiquidCrystal lcd(12, 11, 5, 4, 3, 2)</code> must match your wiring exactly.'
            },
            {
                title: 'Show Live Sensor Readings',
                content: '<p>Connect the DHT11 (same wiring as SG-02, pin D7) and display temperature and humidity on the LCD. The key technique here is <code>lcd.clear()</code> before each update, or overwrite specific positions to avoid ghost characters.</p>',
                code: '#include <LiquidCrystal_I2C.h>\n#include <DHT.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nDHT dht(7, DHT11);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  dht.begin();\n  lcd.setCursor(0, 0);\n  lcd.print("Initializing...");\n  delay(2000);\n}\n\nvoid loop() {\n  float tempC = dht.readTemperature();\n  float humid = dht.readHumidity();\n  \n  lcd.setCursor(0, 0);\n  if (isnan(tempC)) {\n    lcd.print("Temp: ERROR     ");\n  } else {\n    lcd.print("Temp: ");\n    lcd.print(tempC, 1);\n    lcd.print(" C    ");  // trailing spaces clear old chars\n  }\n  \n  lcd.setCursor(0, 1);\n  if (isnan(humid)) {\n    lcd.print("Humid: ERROR    ");\n  } else {\n    lcd.print("Humid: ");\n    lcd.print(humid, 1);\n    lcd.print(" %   ");\n  }\n  \n  delay(2000);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Always pad your LCD output with trailing spaces to overwrite old characters. If the previous number was "100.0" and the new one is "23.5", the display would show "23.50" without the padding.'
            },
            {
                title: 'Create Multiple Screen Pages',
                content: '<p>With only 2 lines, you need pages. Define 3 screens: temperature/humidity, light level with a bar, and system status. A variable tracks the current page.</p>',
                code: '#include <LiquidCrystal_I2C.h>\n#include <DHT.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nDHT dht(7, DHT11);\n\n#define LIGHT_PIN A0\n\nint currentPage = 0;\nconst int TOTAL_PAGES = 3;\nunsigned long lastUpdate = 0;\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  dht.begin();\n  Serial.begin(9600);\n}\n\nvoid showPage0() {\n  float t = dht.readTemperature();\n  float h = dht.readHumidity();\n  lcd.setCursor(0, 0);\n  lcd.print("Temp: ");\n  lcd.print(isnan(t) ? 0.0 : t, 1);\n  lcd.print(" C    ");\n  lcd.setCursor(0, 1);\n  lcd.print("Humid: ");\n  lcd.print(isnan(h) ? 0.0 : h, 1);\n  lcd.print(" %   ");\n}\n\nvoid showPage1() {\n  int light = analogRead(LIGHT_PIN);\n  int bars = map(light, 0, 1023, 0, 16);\n  lcd.setCursor(0, 0);\n  lcd.print("Light: ");\n  lcd.print(light);\n  lcd.print("       ");\n  lcd.setCursor(0, 1);\n  for (int i = 0; i < 16; i++) {\n    lcd.print(i < bars ? (char)0xFF : \' \');  // filled block or space\n  }\n}\n\nvoid showPage2() {\n  lcd.setCursor(0, 0);\n  lcd.print("SG-04 Dashboard ");\n  lcd.setCursor(0, 1);\n  lcd.print("Up: ");\n  lcd.print(millis() / 1000);\n  lcd.print("s  P");\n  lcd.print(currentPage + 1);\n  lcd.print("/");\n  lcd.print(TOTAL_PAGES);\n  lcd.print("  ");\n}\n\nvoid loop() {\n  if (millis() - lastUpdate > 2000) {\n    lcd.clear();\n    switch (currentPage) {\n      case 0: showPage0(); break;\n      case 1: showPage1(); break;\n      case 2: showPage2(); break;\n    }\n    lastUpdate = millis();\n  }\n}',
                language: 'Arduino',
                tip: null
            },
            {
                title: 'Add Button Navigation',
                content: '<p>Connect a push button between pin D10 and GND. Using <code>INPUT_PULLUP</code>, the pin reads HIGH normally and LOW when pressed. Each press advances to the next page. Debouncing prevents a single press from registering as multiple presses.</p>',
                code: '#include <LiquidCrystal_I2C.h>\n#include <DHT.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nDHT dht(7, DHT11);\n\n#define LIGHT_PIN  A0\n#define BTN_PIN    10\n\nint currentPage = 0;\nconst int TOTAL_PAGES = 3;\nunsigned long lastUpdate = 0;\nunsigned long lastPress = 0;\nconst unsigned long DEBOUNCE_MS = 250;\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  dht.begin();\n  pinMode(BTN_PIN, INPUT_PULLUP);  // internal pull-up, no resistor needed\n  Serial.begin(9600);\n  Serial.println("SG-04: LCD Dashboard with button nav");\n}\n\nvoid showPage0() {\n  float t = dht.readTemperature();\n  float h = dht.readHumidity();\n  lcd.setCursor(0, 0);\n  lcd.print("Temp: ");\n  lcd.print(isnan(t) ? 0.0 : t, 1);\n  lcd.print(" C    ");\n  lcd.setCursor(0, 1);\n  lcd.print("Humid: ");\n  lcd.print(isnan(h) ? 0.0 : h, 1);\n  lcd.print(" %   ");\n}\n\nvoid showPage1() {\n  int light = analogRead(LIGHT_PIN);\n  int bars = map(light, 0, 1023, 0, 16);\n  lcd.setCursor(0, 0);\n  lcd.print("Light: ");\n  lcd.print(light);\n  lcd.print("       ");\n  lcd.setCursor(0, 1);\n  for (int i = 0; i < 16; i++) {\n    lcd.print(i < bars ? (char)0xFF : \' \');\n  }\n}\n\nvoid showPage2() {\n  lcd.setCursor(0, 0);\n  lcd.print("SG-04 Dashboard ");\n  lcd.setCursor(0, 1);\n  lcd.print("Up: ");\n  lcd.print(millis() / 1000);\n  lcd.print("s  P");\n  lcd.print(currentPage + 1);\n  lcd.print("/");\n  lcd.print(TOTAL_PAGES);\n  lcd.print("  ");\n}\n\nvoid loop() {\n  // Check button\n  if (digitalRead(BTN_PIN) == LOW && millis() - lastPress > DEBOUNCE_MS) {\n    lastPress = millis();\n    currentPage = (currentPage + 1) % TOTAL_PAGES;\n    lcd.clear();\n    Serial.print("Page: ");\n    Serial.println(currentPage + 1);\n  }\n  \n  // Auto-refresh every 2 seconds\n  if (millis() - lastUpdate > 2000) {\n    switch (currentPage) {\n      case 0: showPage0(); break;\n      case 1: showPage1(); break;\n      case 2: showPage2(); break;\n    }\n    lastUpdate = millis();\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The debounce delay (250ms) prevents mechanical switch bounce from registering as multiple presses. If pages skip, increase the value. If the button feels sluggish, decrease it.'
            },
            {
                title: 'Auto-Cycle Mode',
                content: '<p>Add a feature where, if no button is pressed for 10 seconds, the display automatically cycles through pages. This is how real monitoring displays work &mdash; they rotate through dashboards unless an operator intervenes.</p>',
                code: '#include <LiquidCrystal_I2C.h>\n#include <DHT.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nDHT dht(7, DHT11);\n\n#define LIGHT_PIN  A0\n#define BTN_PIN    10\n\nint currentPage = 0;\nconst int TOTAL_PAGES = 3;\nunsigned long lastUpdate = 0;\nunsigned long lastPress = 0;\nunsigned long lastInteraction = 0;\nconst unsigned long DEBOUNCE_MS = 250;\nconst unsigned long AUTO_CYCLE_MS = 10000;  // 10 seconds idle\nconst unsigned long PAGE_HOLD_MS = 4000;    // 4 seconds per page in auto\n\nbool autoCycle = true;\nunsigned long lastCycle = 0;\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  dht.begin();\n  pinMode(BTN_PIN, INPUT_PULLUP);\n  lastInteraction = millis();\n}\n\nvoid showPage(int page) {\n  lcd.clear();\n  switch (page) {\n    case 0: {\n      float t = dht.readTemperature();\n      float h = dht.readHumidity();\n      lcd.setCursor(0, 0);\n      lcd.print("Temp: ");\n      lcd.print(isnan(t) ? 0.0 : t, 1);\n      lcd.print(" C");\n      lcd.setCursor(0, 1);\n      lcd.print("Humid: ");\n      lcd.print(isnan(h) ? 0.0 : h, 1);\n      lcd.print(" %");\n      break;\n    }\n    case 1: {\n      int light = analogRead(LIGHT_PIN);\n      int bars = map(light, 0, 1023, 0, 16);\n      lcd.setCursor(0, 0);\n      lcd.print("Light: ");\n      lcd.print(light);\n      lcd.setCursor(0, 1);\n      for (int i = 0; i < 16; i++)\n        lcd.print(i < bars ? (char)0xFF : \' \');\n      break;\n    }\n    case 2: {\n      lcd.setCursor(0, 0);\n      lcd.print(autoCycle ? "AUTO " : "MANUAL ");\n      lcd.print("P");\n      lcd.print(currentPage + 1);\n      lcd.print("/");\n      lcd.print(TOTAL_PAGES);\n      lcd.setCursor(0, 1);\n      lcd.print("Uptime: ");\n      lcd.print(millis() / 60000);\n      lcd.print("m");\n      break;\n    }\n  }\n}\n\nvoid loop() {\n  unsigned long now = millis();\n  \n  // Button press\n  if (digitalRead(BTN_PIN) == LOW && now - lastPress > DEBOUNCE_MS) {\n    lastPress = now;\n    lastInteraction = now;\n    autoCycle = false;\n    currentPage = (currentPage + 1) % TOTAL_PAGES;\n    showPage(currentPage);\n    lastUpdate = now;\n  }\n  \n  // Re-enable auto-cycle after idle timeout\n  if (!autoCycle && now - lastInteraction > AUTO_CYCLE_MS) {\n    autoCycle = true;\n  }\n  \n  // Auto-cycle pages\n  if (autoCycle && now - lastCycle > PAGE_HOLD_MS) {\n    currentPage = (currentPage + 1) % TOTAL_PAGES;\n    lastCycle = now;\n    showPage(currentPage);\n    lastUpdate = now;\n  }\n  \n  // Refresh current page data\n  if (now - lastUpdate > 2000) {\n    showPage(currentPage);\n    lastUpdate = now;\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The auto-cycle pattern (idle timeout, manual override, return to auto) is the same pattern used in airport departure boards, retail displays, and security camera monitors. Good UX principle to internalize.'
            }
        ],

        testing: '<ul>' +
                 '<li><strong>I2C scan:</strong> Upload the I2C scanner. Serial Monitor should show a device at <code>0x27</code> or <code>0x3F</code>. If nothing appears, check SDA/SCL wiring.</li>' +
                 '<li><strong>Static text:</strong> "SG-04 Dashboard" and "LCD Online!" appear clearly on both lines. Characters are crisp (not blurry blocks). If contrast is wrong, turn the potentiometer slowly.</li>' +
                 '<li><strong>Sensor data:</strong> Temperature and humidity update every 2 seconds. Values should be reasonable for your room.</li>' +
                 '<li><strong>Light bar:</strong> Page 1 shows a numeric light value and a graphical bar. Cover the photoresistor &mdash; bar should shrink. Shine a light &mdash; bar should fill.</li>' +
                 '<li><strong>Button navigation:</strong> Each press advances to the next page. After page 3, it wraps to page 1. No double-press issues (debounce working).</li>' +
                 '<li><strong>Auto-cycle:</strong> Stop pressing the button. After 10 seconds, pages should start cycling automatically. Press the button to stop auto-cycle and regain manual control.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>LCD shows solid blocks on one line:</strong> This means the LCD is powered but not initialized. Check that your code uploaded successfully and that the I2C address (or parallel pin numbers) match your wiring.</li>' +
                         '<li><strong>LCD is completely blank (no backlight):</strong> VCC/GND may be disconnected or swapped. Verify 5V and GND connections. For parallel: check pins 15 (A) and 16 (K) for backlight power.</li>' +
                         '<li><strong>Text is garbled or wrong characters:</strong> Parallel wiring has the wrong data pins. Double-check that D4&ndash;D7 on the LCD go to the correct Arduino pins. The order matters.</li>' +
                         '<li><strong>I2C LCD not found in scan:</strong> (1) SDA and SCL might be swapped. On Mega, SDA=20, SCL=21. (2) Some I2C backpacks need a solder bridge to change address. Check the board for A0/A1/A2 jumpers.</li>' +
                         '<li><strong>Button does not change pages:</strong> Verify the button is wired between D10 and GND (not 5V). Check that <code>INPUT_PULLUP</code> is set in <code>pinMode()</code>. Test with Serial Monitor: print <code>digitalRead(BTN_PIN)</code> to verify it toggles.</li>' +
                         '<li><strong>Pages update too slowly:</strong> The DHT11 read takes up to 250ms and can only run every 2 seconds. If responsiveness matters, read the DHT in a separate timed block and cache the values.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Custom Characters</strong> &mdash; The LCD 1602 supports up to 8 custom 5x8 pixel characters. Create custom icons: a thermometer for temperature, a droplet for humidity, and a sun for light. Use <code>lcd.createChar()</code> and <code>lcd.write()</code>.</p>' +
                    '<p><strong>Challenge 2: Scrolling Alerts</strong> &mdash; When a sensor exceeds its threshold, scroll a warning message across the bottom line (like a news ticker). Use a timer and <code>lcd.scrollDisplayLeft()</code> or manual substring shifting.</p>' +
                    '<p><strong>Challenge 3: Two-Button Menu</strong> &mdash; Add a second button. One button cycles forward, the other cycles backward. Add a "settings" page where you can adjust the auto-cycle interval and temperature alert threshold using the two buttons (up/down selection).</p>',

        // ======================================================================
        // SG-04 visual enhancements
        // ======================================================================
        stepVisuals: {
            // Step 0 — Install LCD Library / I2C scan: I2C bus addressing
            0: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs>' +
               '<pattern id="sg04-sv0-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
               '<marker id="sg04-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#22c55e"/></marker>' +
               '</defs>' +
               '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="172" fill="url(#sg04-sv0-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">I2C BUS — TWO WIRES, 128 ADDRESSES</text>' +
               '<!-- Bus lines -->' +
               '<text x="36" y="72" text-anchor="end" fill="#22c55e" font-size="7">SDA</text>' +
               '<line x1="42" y1="70" x2="640" y2="70" stroke="#22c55e" stroke-width="2"/>' +
               '<text x="36" y="100" text-anchor="end" fill="#eab308" font-size="7">SCL</text>' +
               '<line x1="42" y1="98" x2="640" y2="98" stroke="#eab308" stroke-width="2"/>' +
               '<!-- Arduino master -->' +
               '<rect x="42" y="42" width="80" height="80" rx="5" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5"/>' +
               '<text x="82" y="60" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="700">MASTER</text>' +
               '<text x="82" y="74" text-anchor="middle" fill="#8b949e" font-size="6">Mega</text>' +
               '<text x="82" y="86" text-anchor="middle" fill="#555" font-size="5.5">SDA=20</text>' +
               '<text x="82" y="98" text-anchor="middle" fill="#555" font-size="5.5">SCL=21</text>' +
               '<!-- Pull-up resistors -->' +
               '<text x="160" y="55" text-anchor="middle" fill="#a855f7" font-size="5.5">4.7K</text>' +
               '<rect x="148" y="42" width="24" height="16" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="1"/>' +
               '<line x1="160" y1="42" x2="160" y2="36" stroke="#ef4444" stroke-width="1.5"/>' +
               '<text x="160" y="34" text-anchor="middle" fill="#ef4444" font-size="5.5">3.3V</text>' +
               '<text x="204" y="55" text-anchor="middle" fill="#a855f7" font-size="5.5">4.7K</text>' +
               '<rect x="192" y="42" width="24" height="16" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="1"/>' +
               '<line x1="204" y1="42" x2="204" y2="36" stroke="#ef4444" stroke-width="1.5"/>' +
               '<!-- Device 1: LCD 0x27 -->' +
               '<rect x="250" y="42" width="100" height="80" rx="5" fill="#0f1a2e" stroke="#22c55e" stroke-width="1.5"/>' +
               '<text x="300" y="60" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="700">LCD 1602</text>' +
               '<rect x="268" y="66" width="64" height="16" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="300" y="77" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700">0x27</text>' +
               '<text x="300" y="94" text-anchor="middle" fill="#555" font-size="5.5">A0=0 A1=0 A2=0</text>' +
               '<text x="300" y="106" text-anchor="middle" fill="#555" font-size="5.5">PCF8574 expander</text>' +
               '<!-- Device 2: possible 0x3F -->' +
               '<rect x="380" y="42" width="100" height="80" rx="5" fill="#0f1a2e" stroke="#555" stroke-width="1" stroke-dasharray="4,2"/>' +
               '<text x="430" y="60" text-anchor="middle" fill="#555" font-size="7">LCD alt addr</text>' +
               '<rect x="398" y="66" width="64" height="16" rx="2" fill="rgba(85,85,85,0.15)" stroke="#555" stroke-width="1"/>' +
               '<text x="430" y="77" text-anchor="middle" fill="#666" font-size="8" font-weight="700">0x3F</text>' +
               '<text x="430" y="94" text-anchor="middle" fill="#444" font-size="5.5">A0=1 A1=1 A2=1</text>' +
               '<text x="430" y="106" text-anchor="middle" fill="#444" font-size="5.5">solder bridge variant</text>' +
               '<!-- Address decode box -->' +
               '<rect x="30" y="136" width="620" height="36" rx="5" fill="rgba(255,107,53,0.05)" stroke="rgba(255,107,53,0.2)" stroke-width="1"/>' +
               '<text x="40" y="152" fill="#ff6b35" font-size="7" font-weight="700">I2C Address Decode:  </text>' +
               '<text x="160" y="152" fill="#8b949e" font-size="7">0x27 = 0b0100111  (PCF8574, A2=0, A1=1, A2=1)</text>' +
               '<text x="40" y="166" fill="#555" font-size="6.5">If your LCD does not respond at 0x27, run the I2C scanner sketch to find its actual address before proceeding.</text>' +
               '</svg>',

            // Step 2 — Show Live Sensor Readings: LCD character cell layout
            2: '<svg viewBox="0 0 680 180" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs><pattern id="sg04-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
               '<rect width="680" height="180" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="164" fill="url(#sg04-sv2-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">LCD 1602 — 16 COLUMNS x 2 ROWS, lcd.setCursor(col, row)</text>' +
               '<!-- LCD outer frame -->' +
               '<rect x="30" y="34" width="620" height="130" rx="8" fill="#060d0a" stroke="rgba(34,197,94,0.4)" stroke-width="2"/>' +
               '<!-- Row 0 cells -->' +
               '<text x="36" y="60" fill="#444" font-size="6" font-weight="700">ROW 0</text>' +
               '<text x="36" y="72" fill="#333" font-size="5.5">col: 0</text>' +
               '<!-- Render "Temp: 23.5 C    " in cells -->' +
               '<rect x="54" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="63" y="68" text-anchor="middle" fill="#4ade80" font-size="9">T</text>' +
               '<rect x="74" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="83" y="68" text-anchor="middle" fill="#4ade80" font-size="9">e</text>' +
               '<rect x="94" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="103" y="68" text-anchor="middle" fill="#4ade80" font-size="9">m</text>' +
               '<rect x="114" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="123" y="68" text-anchor="middle" fill="#4ade80" font-size="9">p</text>' +
               '<rect x="134" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="143" y="68" text-anchor="middle" fill="#4ade80" font-size="9">:</text>' +
               '<rect x="154" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="163" y="68" text-anchor="middle" fill="#4ade80" font-size="9"> </text>' +
               '<rect x="174" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="183" y="68" text-anchor="middle" fill="#4ade80" font-size="9">2</text>' +
               '<rect x="194" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="203" y="68" text-anchor="middle" fill="#4ade80" font-size="9">3</text>' +
               '<rect x="214" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="223" y="68" text-anchor="middle" fill="#4ade80" font-size="9">.</text>' +
               '<rect x="234" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="243" y="68" text-anchor="middle" fill="#4ade80" font-size="9">5</text>' +
               '<rect x="254" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="263" y="68" text-anchor="middle" fill="#4ade80" font-size="9"> </text>' +
               '<rect x="274" y="52" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="283" y="68" text-anchor="middle" fill="#4ade80" font-size="9">C</text>' +
               '<rect x="294" y="52" width="18" height="24" rx="2" fill="#111" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
               '<rect x="314" y="52" width="18" height="24" rx="2" fill="#111" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
               '<rect x="334" y="52" width="18" height="24" rx="2" fill="#111" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
               '<rect x="354" y="52" width="18" height="24" rx="2" fill="#111" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
               '<!-- col callout -->' +
               '<text x="63" y="48" text-anchor="middle" fill="#333" font-size="5">0</text>' +
               '<text x="183" y="48" text-anchor="middle" fill="#ff6b35" font-size="5">6</text>' +
               '<text x="363" y="48" text-anchor="middle" fill="#333" font-size="5">15</text>' +
               '<text x="183" y="86" text-anchor="middle" fill="#ff6b35" font-size="5.5">setCursor(6,0)</text>' +
               '<!-- Row 1 cells -->' +
               '<text x="36" y="120" fill="#444" font-size="6" font-weight="700">ROW 1</text>' +
               '<text x="36" y="132" fill="#333" font-size="5.5">col: 0</text>' +
               '<rect x="54" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="63" y="126" text-anchor="middle" fill="#4ade80" font-size="9">H</text>' +
               '<rect x="74" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="83" y="126" text-anchor="middle" fill="#4ade80" font-size="9">u</text>' +
               '<rect x="94" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="103" y="126" text-anchor="middle" fill="#4ade80" font-size="9">m</text>' +
               '<rect x="114" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="123" y="126" text-anchor="middle" fill="#4ade80" font-size="9">i</text>' +
               '<rect x="134" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="143" y="126" text-anchor="middle" fill="#4ade80" font-size="9">d</text>' +
               '<rect x="154" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="163" y="126" text-anchor="middle" fill="#4ade80" font-size="9">:</text>' +
               '<rect x="174" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="183" y="126" text-anchor="middle" fill="#4ade80" font-size="9"> </text>' +
               '<rect x="194" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="203" y="126" text-anchor="middle" fill="#4ade80" font-size="9">4</text>' +
               '<rect x="214" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="223" y="126" text-anchor="middle" fill="#4ade80" font-size="9">5</text>' +
               '<rect x="234" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="243" y="126" text-anchor="middle" fill="#4ade80" font-size="9">.</text>' +
               '<rect x="254" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.5)" stroke-width="1"/><text x="263" y="126" text-anchor="middle" fill="#4ade80" font-size="9">2</text>' +
               '<rect x="274" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="283" y="126" text-anchor="middle" fill="#4ade80" font-size="9"> </text>' +
               '<rect x="294" y="110" width="18" height="24" rx="2" fill="#0a1628" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/><text x="303" y="126" text-anchor="middle" fill="#4ade80" font-size="9">%</text>' +
               '<rect x="314" y="110" width="18" height="24" rx="2" fill="#111" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
               '<rect x="334" y="110" width="18" height="24" rx="2" fill="#111" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
               '<rect x="354" y="110" width="18" height="24" rx="2" fill="#111" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
               '<!-- Trailing spaces note -->' +
               '<rect x="400" y="52" width="238" height="82" rx="5" fill="rgba(255,107,53,0.05)" stroke="rgba(255,107,53,0.2)" stroke-width="1"/>' +
               '<text x="410" y="68" fill="#ff6b35" font-size="7" font-weight="700">Key rule: pad with trailing spaces</text>' +
               '<text x="410" y="82" fill="#8b949e" font-size="6.5">lcd.print("23.5 C    ");  // 4 spaces</text>' +
               '<text x="410" y="96" fill="#8b949e" font-size="6.5">Overwrites leftover characters</text>' +
               '<text x="410" y="110" fill="#8b949e" font-size="6.5">from previous longer value</text>' +
               '<text x="410" y="124" fill="#555" font-size="6">Without padding: "100.0" -> "23.50"</text>' +
               '</svg>'
        },

        componentCallouts: {
            svg: '<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                 '<defs><pattern id="sg04-cc-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
                 '<rect width="560" height="200" fill="#0d1117" rx="6"/>' +
                 '<rect x="6" y="6" width="548" height="188" fill="url(#sg04-cc-grid)" rx="3"/>' +
                 '<text x="280" y="20" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.14em">SG-04 LCD DASHBOARD COMPONENTS</text>' +
                 '<!-- Arduino Mega -->' +
                 '<rect x="14" y="32" width="90" height="154" rx="6" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5" data-callout="mega"/>' +
                 '<text x="59" y="48" text-anchor="middle" fill="#60a5fa" font-size="6.5" font-weight="700">ARDUINO</text>' +
                 '<text x="59" y="58" text-anchor="middle" fill="#60a5fa" font-size="6.5" font-weight="700">MEGA</text>' +
                 '<circle cx="104" cy="90" r="4" fill="#1a1f2b" stroke="#22c55e" stroke-width="1" data-callout="i2c"/>' +
                 '<text x="96" y="89" text-anchor="end" fill="#555" font-size="5.5">SDA 20</text>' +
                 '<circle cx="104" cy="106" r="4" fill="#1a1f2b" stroke="#eab308" stroke-width="1" data-callout="i2c"/>' +
                 '<text x="96" y="105" text-anchor="end" fill="#555" font-size="5.5">SCL 21</text>' +
                 '<circle cx="104" cy="124" r="4" fill="#1a1f2b" stroke="#f97316" stroke-width="1" data-callout="dht11"/>' +
                 '<text x="96" y="123" text-anchor="end" fill="#555" font-size="5.5">D7 DHT</text>' +
                 '<circle cx="104" cy="142" r="4" fill="#1a1f2b" stroke="#8b949e" stroke-width="1" data-callout="button"/>' +
                 '<text x="96" y="141" text-anchor="end" fill="#555" font-size="5.5">D10 BTN</text>' +
                 '<!-- LCD I2C -->' +
                 '<rect x="160" y="32" width="160" height="100" rx="6" fill="#0f1a2e" stroke="#22c55e" stroke-width="1.5" data-callout="lcd"/>' +
                 '<text x="240" y="50" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="700">LCD 1602 (I2C)</text>' +
                 '<rect x="178" y="58" width="124" height="32" rx="3" fill="#060d0a" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                 '<text x="188" y="72" fill="#4ade80" font-size="7">Temp: 23.5 C</text>' +
                 '<text x="188" y="84" fill="#4ade80" font-size="7">Humid: 45.2 %</text>' +
                 '<text x="240" y="112" text-anchor="middle" fill="#555" font-size="5.5">16 cols x 2 rows</text>' +
                 '<text x="240" y="124" text-anchor="middle" fill="#555" font-size="5.5">I2C addr 0x27</text>' +
                 '<!-- DHT11 -->' +
                 '<rect x="160" y="148" width="72" height="42" rx="6" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5" data-callout="dht11"/>' +
                 '<text x="196" y="166" text-anchor="middle" fill="#fb923c" font-size="6.5" font-weight="700">DHT11</text>' +
                 '<text x="196" y="180" text-anchor="middle" fill="#555" font-size="5.5">D7, 5V</text>' +
                 '<!-- Button -->' +
                 '<rect x="248" y="148" width="72" height="42" rx="6" fill="#0f1a2e" stroke="#8b949e" stroke-width="1.5" data-callout="button"/>' +
                 '<text x="284" y="162" text-anchor="middle" fill="#e2e8f0" font-size="6.5" font-weight="700">BUTTON</text>' +
                 '<circle cx="284" cy="175" r="6" fill="none" stroke="#8b949e" stroke-width="1.5"/>' +
                 '<text x="338" y="175" fill="#555" font-size="5.5">D10 -> GND</text>' +
                 '<!-- I2C bus lines -->' +
                 '<line x1="106" y1="90" x2="160" y2="90" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,2"/>' +
                 '<line x1="106" y1="106" x2="160" y2="106" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,2"/>' +
                 '</svg>',
            components: [
                {
                    id: 'lcd',
                    name: 'LCD 1602 with I2C Backpack',
                    purpose: 'HD44780-compatible character LCD with 16 columns and 2 rows. The I2C backpack (PCF8574 expander IC) reduces the 16-pin parallel interface to 4 wires: SDA, SCL, VCC, GND. The backpack handles the 4-bit mode data shifting internally.',
                    specs: ['16 x 2 character display', '5x8 dot character cells', 'I2C address 0x27 or 0x3F', 'VCC 5V, ~35mA', 'Contrast via trimmer pot']
                },
                {
                    id: 'i2c',
                    name: 'I2C Bus (SDA + SCL)',
                    purpose: 'Two-wire serial protocol. SDA (Serial Data) carries the payload. SCL (Serial Clock) synchronizes both devices. The Arduino is the master that generates the clock. The LCD responds to its configured 7-bit address (0x27). Only two wires needed regardless of how many devices are on the bus.',
                    specs: ['SDA = Mega pin 20', 'SCL = Mega pin 21', 'Standard mode: 100 kHz', 'Fast mode: 400 kHz', '4.7K pull-ups to VCC']
                },
                {
                    id: 'dht11',
                    name: 'DHT11 Sensor (from SG-02)',
                    purpose: 'Same sensor from SG-02. Provides temperature and humidity for the LCD display pages. The DHT11 uses a separate proprietary 1-wire protocol on D7, completely independent of the I2C bus used by the LCD.',
                    specs: ['D7 digital pin', '5V supply', '2-second sample rate', 'Temp +/-2C, Humidity +/-5%']
                },
                {
                    id: 'button',
                    name: 'Push Button (page navigation)',
                    purpose: 'Momentary tactile switch connected between D10 and GND. The Mega\'s internal pull-up resistor (INPUT_PULLUP mode) keeps D10 HIGH until the button is pressed, pulling it LOW. A debounce timer (250ms) prevents a single press from being read multiple times due to mechanical switch bounce.',
                    specs: ['D10 with INPUT_PULLUP', 'Reads LOW when pressed', '250ms debounce timer', 'No external resistor needed']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'Wrong I2C Address for the LCD Backpack',
                correct: 'Use the address found by the I2C scanner sketch. Most PCF8574-based backpacks use 0x27. Pass this to LiquidCrystal_I2C lcd(0x27, 16, 2). Run the scanner first before writing any display code.',
                incorrect: 'Hardcoding 0x27 without scanning. Some backpacks use 0x3F. If the address is wrong, no error is thrown &mdash; the LCD just stays blank or shows solid blocks.',
                consequence: 'The LCD is powered (backlight on) but shows nothing. The library silently sends commands to a non-existent address. Run the I2C scanner, confirm the actual address, then update your sketch.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<text x="20" y="52" fill="#8b949e" font-size="6.5">Scanner found:</text>' +
                         '<rect x="18" y="58" width="60" height="16" rx="2" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="48" y="69" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">0x3F</text>' +
                         '<text x="90" y="65" fill="#8b949e" font-size="6.5">-></text>' +
                         '<text x="106" y="52" fill="#8b949e" font-size="6.5">Code uses:</text>' +
                         '<rect x="104" y="58" width="60" height="16" rx="2" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="134" y="69" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">0x3F</text>' +
                         '<text x="124" y="94" text-anchor="middle" fill="#22c55e" font-size="6">addresses match  -  LCD works</text>' +
                         '<text x="272" y="52" fill="#8b949e" font-size="6.5">Scanner found:</text>' +
                         '<rect x="270" y="58" width="60" height="16" rx="2" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="300" y="69" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">0x3F</text>' +
                         '<text x="342" y="65" fill="#8b949e" font-size="6.5">-></text>' +
                         '<text x="358" y="52" fill="#8b949e" font-size="6.5">Code uses:</text>' +
                         '<rect x="356" y="58" width="60" height="16" rx="2" fill="rgba(239,68,68,0.1)" stroke="#ef4444" stroke-width="1"/>' +
                         '<text x="386" y="69" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">0x27</text>' +
                         '<text x="376" y="94" text-anchor="middle" fill="#ef4444" font-size="6">wrong address  -  blank LCD</text>' +
                         '</svg>'
            },
            {
                title: 'lcd.clear() Called Inside the Update Loop',
                correct: 'Overwrite specific cursor positions with lcd.setCursor() and pad strings with trailing spaces. Clear only when changing pages. This prevents the flash-black-flash flicker on every update.',
                incorrect: 'lcd.clear() is called at the top of loop() or inside a 2-second refresh block. The LCD blanks and redraws every update cycle, causing visible flicker.',
                consequence: 'The display flickers constantly at the update rate. In a 500ms loop the flicker is very obvious. lcd.clear() takes ~2ms during which the display is blank. Always overwrite in-place instead.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<text x="18" y="46" fill="#8b949e" font-size="6">setCursor(0,0);</text>' +
                         '<text x="18" y="58" fill="#8b949e" font-size="6">lcd.print("23.5 C    ");</text>' +
                         '<text x="18" y="72" fill="#555" font-size="5.5">// trailing spaces overwrite</text>' +
                         '<rect x="18" y="78" width="200" height="16" rx="2" fill="rgba(34,197,94,0.08)" stroke="#22c55e" stroke-width="0.5"/>' +
                         '<text x="118" y="89" text-anchor="middle" fill="#22c55e" font-size="6">stable display, no flicker</text>' +
                         '<text x="270" y="40" fill="#ef4444" font-size="6" font-weight="700">lcd.clear();</text>' +
                         '<text x="270" y="54" fill="#8b949e" font-size="6">setCursor(0,0);</text>' +
                         '<text x="270" y="68" fill="#8b949e" font-size="6">lcd.print("23.5 C");</text>' +
                         '<rect x="270" y="78" width="200" height="16" rx="2" fill="rgba(239,68,68,0.08)" stroke="#ef4444" stroke-width="0.5"/>' +
                         '<text x="370" y="89" text-anchor="middle" fill="#ef4444" font-size="6">2ms blank flash every update</text>' +
                         '</svg>'
            },
            {
                title: 'SDA and SCL Pins Swapped on the Mega',
                correct: 'On the Arduino Mega 2560, I2C SDA is pin 20 and SCL is pin 21. These are hardware I2C pins wired to the TWI peripheral. Connect LCD SDA to Mega pin 20 and LCD SCL to Mega pin 21.',
                incorrect: 'SDA connected to Mega pin 21 and SCL to Mega pin 20. Or using analog pins A4/A5 (which work on Uno but not on Mega for I2C).',
                consequence: 'The I2C scanner finds no devices. Wire.begin() initializes but all Wire.beginTransmission() calls fail. The LCD remains completely blank. This mistake is common for students who transferred their Uno wiring to a Mega.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT (MEGA)</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG (UNO pins on MEGA)</text>' +
                         '<text x="20" y="52" fill="#22c55e" font-size="6.5">Mega pin 20</text>' +
                         '<line x1="100" y1="50" x2="160" y2="50" stroke="#22c55e" stroke-width="1.5"/>' +
                         '<text x="168" y="54" fill="#22c55e" font-size="6.5">SDA (LCD)</text>' +
                         '<text x="20" y="74" fill="#eab308" font-size="6.5">Mega pin 21</text>' +
                         '<line x1="100" y1="72" x2="160" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
                         '<text x="168" y="76" fill="#eab308" font-size="6.5">SCL (LCD)</text>' +
                         '<text x="124" y="100" text-anchor="middle" fill="#22c55e" font-size="6">scanner finds 0x27</text>' +
                         '<text x="272" y="52" fill="#ef4444" font-size="6.5">Mega pin A4</text>' +
                         '<line x1="352" y1="50" x2="412" y2="50" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2"/>' +
                         '<text x="420" y="54" fill="#8b949e" font-size="6.5">SDA (LCD)</text>' +
                         '<text x="272" y="74" fill="#ef4444" font-size="6.5">Mega pin A5</text>' +
                         '<line x1="352" y1="72" x2="412" y2="72" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2"/>' +
                         '<text x="420" y="76" fill="#8b949e" font-size="6.5">SCL (LCD)</text>' +
                         '<text x="376" y="100" text-anchor="middle" fill="#ef4444" font-size="6">scanner finds nothing</text>' +
                         '</svg>'
            }
        ]
    },

    // ========================================================================
    // SG-05: Data Logger — SD Card + RTC Timestamps
    // ========================================================================
    'sg-05': {
        intro: '<p>Collecting data is useful. Collecting data <em>with timestamps and persistent storage</em> is powerful. A data logger records sensor readings to an SD card with accurate time stamps from a real-time clock (RTC), creating a permanent record that survives power cycles and can be analyzed offline.</p>' +
               '<p>This is the exact pattern behind security audit logs, environmental monitoring in data centers, and forensic evidence collection. In cybersecurity, tamper-evident logging and accurate timestamps are critical for incident response timelines. While this project does not implement tamper-proofing, it teaches the fundamental skill: capturing, timestamping, and persisting data reliably.</p>' +
               '<p>This project uses two new modules not included in the ELEGOO kit: an SD card module (~$3) and a DS3231 RTC module (~$5). Both are widely available and reusable across many future projects.</p>',

        wiring: '    Arduino Mega 2560\n' +
                '    +-------------------+\n' +
                '    |              5V   |---[+5V rail]----+--------+--------+\n' +
                '    |             GND   |---[GND rail]----+--------+--------+\n' +
                '    |                   |                 |        |        |\n' +
                '    |   SD Card Module (SPI):             |      DS3231    DHT11\n' +
                '    |             D53   |---[CS]          |      (I2C)    (D7)\n' +
                '    |             D51   |---[MOSI]        |        |\n' +
                '    |             D50   |---[MISO]        |  SDA 20|---[SDA]\n' +
                '    |             D52   |---[SCK]         |  SCL 21|---[SCL]\n' +
                '    |                   |   [VCC]---5V    |  [VCC]---5V\n' +
                '    |                   |   [GND]---GND   |  [GND]---GND\n' +
                '    |                   |                 |\n' +
                '    |   DHT11:          |                 |\n' +
                '    |              D7   |---[Data]        |\n' +
                '    |                   |   [VCC]---5V    |\n' +
                '    |                   |   [GND]---GND   |\n' +
                '    +-------------------+\n' +
                '\n' +
                '    SD Card Module:  CS=53, MOSI=51, MISO=50, SCK=52  (Mega SPI pins)\n' +
                '    DS3231 RTC:      SDA=20, SCL=21  (Mega I2C pins)\n' +
                '    DHT11:           Data=7',

        wiringNotes: '<p><strong>SPI pins are fixed on the Mega:</strong> MOSI=51, MISO=50, SCK=52. Only the CS (Chip Select) pin is flexible &mdash; we use D53 (the default SS pin on Mega). Do not use different pins for MOSI/MISO/SCK.</p>' +
                     '<p><strong>DS3231 vs DS1307:</strong> The DS3231 is far more accurate (drift of ~2 minutes/year vs ~5 minutes/month). The code works with either module since both use the same I2C protocol, but DS3231 is strongly recommended.</p>' +
                     '<p><strong>SD card formatting:</strong> The microSD card must be formatted as <strong>FAT16</strong> or <strong>FAT32</strong>. Most new cards ship as FAT32. If the SD library fails to initialize, try reformatting the card with the official SD Card Formatter tool.</p>' +
                     '<p><strong>Power note:</strong> The SD module can draw significant current during writes. If you experience random resets, power the SD module from the Mega\'s 5V pin (not the breadboard rail) and add a 100&micro;F capacitor between VCC and GND.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg05-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="460" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="440" fill="url(#sg05-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-05 DATA LOGGER</text>' +

            '<!-- Arduino Mega -->' +
            '<g>' +
            '<rect x="40" y="60" width="180" height="340" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="60" width="180" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="40" y="76" width="180" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="130" y="76" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">ARDUINO MEGA 2560</text>' +
            '<!-- USB -->' +
            '<rect x="16" y="75" width="28" height="22" rx="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="30" y="89" text-anchor="middle" fill="#3b82f6" font-size="6">USB</text>' +
            '<!-- Pin labels -->' +
            '<text x="210" y="110" text-anchor="end" fill="#8b949e" font-size="8">5V</text>' +
            '<circle cx="218" cy="107" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="210" y="130" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="218" cy="127" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<!-- SPI pins -->' +
            '<text x="210" y="170" text-anchor="end" fill="#8b949e" font-size="8">D53 CS</text>' +
            '<circle cx="218" cy="167" r="3" fill="#1a1f2b" stroke="#f97316" stroke-width="1"/>' +
            '<text x="210" y="190" text-anchor="end" fill="#8b949e" font-size="8">D51 MOSI</text>' +
            '<circle cx="218" cy="187" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="210" y="210" text-anchor="end" fill="#8b949e" font-size="8">D50 MISO</text>' +
            '<circle cx="218" cy="207" r="3" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="210" y="230" text-anchor="end" fill="#8b949e" font-size="8">D52 SCK</text>' +
            '<circle cx="218" cy="227" r="3" fill="#1a1f2b" stroke="#06b6d4" stroke-width="1"/>' +
            '<!-- I2C pins -->' +
            '<text x="210" y="275" text-anchor="end" fill="#8b949e" font-size="8">SDA 20</text>' +
            '<circle cx="218" cy="272" r="3" fill="#1a1f2b" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="210" y="295" text-anchor="end" fill="#8b949e" font-size="8">SCL 21</text>' +
            '<circle cx="218" cy="292" r="3" fill="#1a1f2b" stroke="#c084fc" stroke-width="1"/>' +
            '<!-- DHT pin -->' +
            '<text x="210" y="340" text-anchor="end" fill="#8b949e" font-size="8">D7</text>' +
            '<circle cx="218" cy="337" r="3" fill="#1a1f2b" stroke="#fb923c" stroke-width="1"/>' +
            '</g>' +

            '<!-- SD Card Module -->' +
            '<g>' +
            '<rect x="320" y="55" width="180" height="150" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="320" y="55" width="180" height="20" rx="8" fill="rgba(249,115,22,0.1)"/>' +
            '<rect x="320" y="68" width="180" height="7" fill="rgba(249,115,22,0.1)"/>' +
            '<text x="410" y="70" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="600">SD CARD MODULE</text>' +
            '<text x="410" y="90" text-anchor="middle" fill="#8b949e" font-size="7">SPI Interface</text>' +
            '<!-- SD card slot visual -->' +
            '<rect x="370" y="100" width="80" height="50" rx="4" fill="#0a1628" stroke="rgba(249,115,22,0.3)" stroke-width="1"/>' +
            '<rect x="380" y="108" width="60" height="34" rx="2" fill="rgba(249,115,22,0.08)"/>' +
            '<text x="410" y="128" text-anchor="middle" fill="#fb923c" font-size="8">microSD</text>' +
            '<text x="410" y="140" text-anchor="middle" fill="#555" font-size="6">FAT32</text>' +
            '<!-- Pins -->' +
            '<rect x="330" y="162" width="24" height="14" rx="2" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="342" y="172" text-anchor="middle" fill="#fb923c" font-size="5">CS</text>' +
            '<rect x="358" y="162" width="28" height="14" rx="2" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="372" y="172" text-anchor="middle" fill="#eab308" font-size="5">MOSI</text>' +
            '<rect x="390" y="162" width="28" height="14" rx="2" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="404" y="172" text-anchor="middle" fill="#22c55e" font-size="5">MISO</text>' +
            '<rect x="422" y="162" width="24" height="14" rx="2" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.3)" stroke-width="0.5"/>' +
            '<text x="434" y="172" text-anchor="middle" fill="#06b6d4" font-size="5">SCK</text>' +
            '<rect x="450" y="162" width="24" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="462" y="172" text-anchor="middle" fill="#ef4444" font-size="5">VCC</text>' +
            '<rect x="478" y="162" width="24" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="490" y="172" text-anchor="middle" fill="#60a5fa" font-size="5">GND</text>' +
            '</g>' +

            '<!-- DS3231 RTC -->' +
            '<g>' +
            '<rect x="320" y="240" width="180" height="110" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<rect x="320" y="240" width="180" height="20" rx="8" fill="rgba(168,85,247,0.1)"/>' +
            '<rect x="320" y="253" width="180" height="7" fill="rgba(168,85,247,0.1)"/>' +
            '<text x="410" y="255" text-anchor="middle" fill="#c084fc" font-size="10" font-weight="600">DS3231 RTC</text>' +
            '<text x="410" y="275" text-anchor="middle" fill="#8b949e" font-size="7">I2C Interface (addr: 0x68)</text>' +
            '<!-- Battery -->' +
            '<circle cx="410" cy="305" r="16" fill="none" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>' +
            '<circle cx="410" cy="305" r="10" fill="rgba(168,85,247,0.08)"/>' +
            '<text x="410" y="308" text-anchor="middle" fill="#c084fc" font-size="6">CR2032</text>' +
            '<text x="410" y="318" text-anchor="middle" fill="#555" font-size="5">backup battery</text>' +
            '<!-- Pins -->' +
            '<rect x="330" y="330" width="24" height="14" rx="2" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="342" y="340" text-anchor="middle" fill="#c084fc" font-size="5">SDA</text>' +
            '<rect x="358" y="330" width="24" height="14" rx="2" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
            '<text x="370" y="340" text-anchor="middle" fill="#c084fc" font-size="5">SCL</text>' +
            '<rect x="386" y="330" width="24" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="398" y="340" text-anchor="middle" fill="#ef4444" font-size="5">VCC</text>' +
            '<rect x="414" y="330" width="24" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="426" y="340" text-anchor="middle" fill="#60a5fa" font-size="5">GND</text>' +
            '</g>' +

            '<!-- DHT11 -->' +
            '<g>' +
            '<rect x="320" y="380" width="130" height="60" rx="8" fill="#1e2736" stroke="#fb923c" stroke-width="1.5"/>' +
            '<rect x="320" y="380" width="130" height="20" rx="8" fill="rgba(251,146,60,0.1)"/>' +
            '<rect x="320" y="393" width="130" height="7" fill="rgba(251,146,60,0.1)"/>' +
            '<text x="385" y="395" text-anchor="middle" fill="#fb923c" font-size="9" font-weight="600">DHT11</text>' +
            '<text x="385" y="418" text-anchor="middle" fill="#8b949e" font-size="7">D7 | 5V | GND</text>' +
            '<text x="385" y="432" text-anchor="middle" fill="#555" font-size="6">Temp + Humidity</text>' +
            '</g>' +

            '<!-- SPI Wires -->' +
            '<path d="M221,167 C270,167 290,169 342,169" stroke="#f97316" stroke-width="1.5" fill="none"/>' +
            '<path d="M221,187 C270,187 300,169 372,169" stroke="#eab308" stroke-width="1.5" fill="none"/>' +
            '<path d="M221,207 C270,207 310,169 404,169" stroke="#22c55e" stroke-width="1.5" fill="none"/>' +
            '<path d="M221,227 C270,227 320,169 434,169" stroke="#06b6d4" stroke-width="1.5" fill="none"/>' +

            '<!-- I2C Wires -->' +
            '<path d="M221,272 C270,272 290,337 342,337" stroke="#a855f7" stroke-width="1.5" fill="none"/>' +
            '<path d="M221,292 C270,292 300,337 370,337" stroke="#c084fc" stroke-width="1.5" fill="none"/>' +

            '<!-- DHT11 Wire -->' +
            '<path d="M221,337 C270,337 290,410 320,410" stroke="#fb923c" stroke-width="1.5" fill="none"/>' +

            '<!-- Power wires (dashed) -->' +
            '<path d="M221,107 C260,107 290,90 462,169" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4,3" opacity="0.5"/>' +
            '<path d="M221,127 C260,127 310,100 490,169" stroke="#8b949e" stroke-width="1.5" fill="none" stroke-dasharray="4,3" opacity="0.5"/>' +

            '<!-- Data flow labels -->' +
            '<rect x="545" y="60" width="140" height="145" rx="6" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.12)" stroke-width="0.5"/>' +
            '<text x="555" y="78" fill="#fb923c" font-size="8" font-weight="600">DATA FLOW</text>' +
            '<text x="555" y="96" fill="#8b949e" font-size="7">1. RTC provides time</text>' +
            '<text x="555" y="110" fill="#8b949e" font-size="7">2. DHT11 reads sensors</text>' +
            '<text x="555" y="124" fill="#8b949e" font-size="7">3. Arduino formats CSV</text>' +
            '<text x="555" y="138" fill="#8b949e" font-size="7">4. SD card stores data</text>' +
            '<text x="555" y="158" fill="#555" font-size="6">timestamp,temp,humidity,light</text>' +
            '<text x="555" y="172" fill="#555" font-size="6">2026-03-06T14:30:00,23.5,45.2,512</text>' +
            '<text x="555" y="190" fill="#fb923c" font-size="6" font-weight="600">LOG INTERVAL: 10s</text>' +

            '<!-- Bus labels -->' +
            '<rect x="545" y="240" width="140" height="70" rx="6" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.12)" stroke-width="0.5"/>' +
            '<text x="555" y="258" fill="#c084fc" font-size="8" font-weight="600">BUS PROTOCOLS</text>' +
            '<text x="555" y="276" fill="#fb923c" font-size="7">SPI: SD Card (4 wire)</text>' +
            '<text x="555" y="290" fill="#c084fc" font-size="7">I2C: RTC DS3231 (2 wire)</text>' +
            '<text x="555" y="304" fill="#8b949e" font-size="7">Digital: DHT11 (1 wire)</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install Required Libraries',
                content: '<p>You need two additional libraries. Open <strong>Sketch &gt; Include Library &gt; Manage Libraries</strong> and install:</p>' +
                         '<ul>' +
                         '<li><strong>RTClib</strong> by Adafruit &mdash; for the DS3231 real-time clock</li>' +
                         '<li><strong>DHT sensor library</strong> by Adafruit &mdash; same as SG-02 (skip if already installed)</li>' +
                         '</ul>' +
                         '<p>The <strong>SD</strong> library is built into the Arduino IDE and does not need to be installed.</p>',
                code: null,
                language: null,
                tip: '<strong>Tip:</strong> RTClib also installs the "Adafruit BusIO" dependency. Accept all dependency installs when prompted.'
            },
            {
                title: 'Test SD Card Read/Write',
                content: '<p>Before adding sensors, verify the SD card module works. This sketch initializes the SD card, writes a test file, reads it back, and prints the results. If this fails, do not proceed until it works &mdash; debug the wiring and formatting first.</p>',
                code: '#include <SPI.h>\n#include <SD.h>\n\n#define SD_CS_PIN 53  // Mega default SS pin\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("SG-05: SD Card Test");\n  \n  if (!SD.begin(SD_CS_PIN)) {\n    Serial.println("ERROR: SD card init failed!");\n    Serial.println("Check: (1) Card inserted? (2) FAT32 format? (3) Wiring?");\n    while (1);  // halt\n  }\n  Serial.println("SD card initialized.");\n  \n  // Write test file\n  File f = SD.open("test.txt", FILE_WRITE);\n  if (f) {\n    f.println("Hello from SG-05!");\n    f.println("SD card write successful.");\n    f.close();\n    Serial.println("Wrote test.txt");\n  } else {\n    Serial.println("ERROR: Could not open test.txt for writing");\n  }\n  \n  // Read it back\n  f = SD.open("test.txt");\n  if (f) {\n    Serial.println("Contents of test.txt:");\n    while (f.available()) {\n      Serial.write(f.read());\n    }\n    f.close();\n  } else {\n    Serial.println("ERROR: Could not open test.txt for reading");\n  }\n}\n\nvoid loop() {}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> After running this, power off the Arduino, pull the SD card, and open it on your computer. You should see <code>test.txt</code> with the two lines of text. This confirms the full write path works.'
            },
            {
                title: 'Wire and Test the DS3231 RTC',
                content: '<p>Wire the DS3231 to the I2C bus (SDA=20, SCL=21 on Mega). The first time you use the RTC, you need to set its time. This sketch sets the time to your computer\'s compile time, then reads it back every second.</p>',
                code: '#include <Wire.h>\n#include <RTClib.h>\n\nRTC_DS3231 rtc;\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("SG-05: DS3231 RTC Test");\n  \n  if (!rtc.begin()) {\n    Serial.println("ERROR: DS3231 not found! Check I2C wiring.");\n    while (1);\n  }\n  \n  if (rtc.lostPower()) {\n    Serial.println("RTC lost power — setting time to compile time");\n    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));\n  }\n  \n  // Uncomment this line to force-set time (re-comment after first upload):\n  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));\n  \n  Serial.println("RTC running.");\n}\n\nvoid loop() {\n  DateTime now = rtc.now();\n  \n  char buf[20];\n  sprintf(buf, "%04d-%02d-%02d %02d:%02d:%02d",\n    now.year(), now.month(), now.day(),\n    now.hour(), now.minute(), now.second());\n  \n  Serial.println(buf);\n  delay(1000);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The RTC has a coin cell battery that keeps time even when the Arduino is powered off. After the first time set, comment out the <code>rtc.adjust()</code> line so it does not reset every time you upload. The <code>lostPower()</code> check handles battery replacement automatically.'
            },
            {
                title: 'Set the RTC to Precise Time',
                content: '<p>The compile-time method above has a small delay (the time it takes to compile and upload). For more accuracy, you can set the time manually using an exact timestamp. Upload this sketch at the exact second shown.</p>',
                code: '#include <Wire.h>\n#include <RTClib.h>\n\nRTC_DS3231 rtc;\n\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n  \n  // Set to a specific date/time: Year, Month, Day, Hour, Min, Sec\n  // Update these values and upload at the matching second\n  rtc.adjust(DateTime(2026, 3, 6, 14, 30, 0));\n  \n  Serial.println("RTC time set! Verifying...");\n}\n\nvoid loop() {\n  DateTime now = rtc.now();\n  char buf[20];\n  sprintf(buf, "%04d-%02d-%02d %02d:%02d:%02d",\n    now.year(), now.month(), now.day(),\n    now.hour(), now.minute(), now.second());\n  Serial.println(buf);\n  delay(1000);\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> After setting the time precisely, immediately upload a different sketch (like the logger in the next step). If you re-upload this sketch, it will reset the time again.'
            },
            {
                title: 'Build the Complete Data Logger',
                content: '<p>Now combine everything: DHT11 sensor reads, RTC timestamps, and SD card writes. Each reading becomes a CSV row with an ISO timestamp. The file is created on boot with a header row, and data is flushed to disk after every write.</p>',
                code: '#include <SPI.h>\n#include <SD.h>\n#include <Wire.h>\n#include <RTClib.h>\n#include <DHT.h>\n\n#define SD_CS_PIN  53\n#define DHT_PIN    7\n#define DHT_TYPE   DHT11\n#define LIGHT_PIN  A0\n\n#define LOG_INTERVAL_MS  10000  // 10 seconds between readings\n\nRTC_DS3231 rtc;\nDHT dht(DHT_PIN, DHT_TYPE);\n\nconst char* LOG_FILE = "datalog.csv";\nunsigned long lastLog = 0;\nunsigned long readCount = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("SG-05: Data Logger initializing...");\n  \n  // Init I2C devices\n  if (!rtc.begin()) {\n    Serial.println("ERROR: RTC not found");\n    while (1);\n  }\n  \n  // Init DHT\n  dht.begin();\n  \n  // Init SD\n  if (!SD.begin(SD_CS_PIN)) {\n    Serial.println("ERROR: SD card init failed");\n    while (1);\n  }\n  \n  // Write CSV header if file is new\n  if (!SD.exists(LOG_FILE)) {\n    File f = SD.open(LOG_FILE, FILE_WRITE);\n    if (f) {\n      f.println("timestamp,reading,temp_c,humidity,light");\n      f.close();\n      Serial.println("Created new log file with header");\n    }\n  } else {\n    Serial.println("Appending to existing log file");\n  }\n  \n  Serial.println("Data logger online. Logging every 10 seconds.");\n}\n\nvoid loop() {\n  unsigned long now = millis();\n  \n  if (now - lastLog >= LOG_INTERVAL_MS) {\n    lastLog = now;\n    readCount++;\n    \n    // Get timestamp\n    DateTime dt = rtc.now();\n    char timestamp[20];\n    sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02d",\n      dt.year(), dt.month(), dt.day(),\n      dt.hour(), dt.minute(), dt.second());\n    \n    // Read sensors\n    float tempC = dht.readTemperature();\n    float humid = dht.readHumidity();\n    int light = analogRead(LIGHT_PIN);\n    \n    // Build CSV line\n    String line = String(timestamp) + "," +\n                  String(readCount) + "," +\n                  String(isnan(tempC) ? -999.0 : tempC, 1) + "," +\n                  String(isnan(humid) ? -999.0 : humid, 1) + "," +\n                  String(light);\n    \n    // Write to SD\n    File f = SD.open(LOG_FILE, FILE_WRITE);\n    if (f) {\n      f.println(line);\n      f.close();\n      Serial.print("Logged #");\n      Serial.print(readCount);\n      Serial.print(": ");\n      Serial.println(line);\n    } else {\n      Serial.println("ERROR: Could not write to SD card");\n    }\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> Opening and closing the file on every write is safer than keeping it open. If the Arduino loses power while the file is open, the file system can be corrupted and you lose all data. The open/write/close pattern ensures data is committed to disk every time.'
            },
            {
                title: 'Add File Rotation',
                content: '<p>A single log file will eventually fill the SD card or become too large to open. Implement date-based file rotation: each day gets its own file (e.g., <code>20260306.csv</code>). This mirrors how syslog and SIEM systems rotate logs.</p>',
                code: '#include <SPI.h>\n#include <SD.h>\n#include <Wire.h>\n#include <RTClib.h>\n#include <DHT.h>\n\n#define SD_CS_PIN  53\n#define DHT_PIN    7\n#define DHT_TYPE   DHT11\n#define LIGHT_PIN  A0\n#define LOG_INTERVAL_MS  10000\n\nRTC_DS3231 rtc;\nDHT dht(DHT_PIN, DHT_TYPE);\n\nunsigned long lastLog = 0;\nunsigned long readCount = 0;\nchar currentFile[13];  // 8.3 filename: YYYYMMDD.csv\n\nvoid getLogFilename(DateTime dt, char* buf) {\n  sprintf(buf, "%04d%02d%02d.csv", dt.year(), dt.month(), dt.day());\n}\n\nvoid ensureHeader(const char* filename) {\n  if (!SD.exists(filename)) {\n    File f = SD.open(filename, FILE_WRITE);\n    if (f) {\n      f.println("timestamp,reading,temp_c,humidity,light");\n      f.close();\n    }\n  }\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("SG-05: Data Logger v2 (file rotation)");\n  \n  if (!rtc.begin()) { Serial.println("ERROR: RTC"); while (1); }\n  dht.begin();\n  if (!SD.begin(SD_CS_PIN)) { Serial.println("ERROR: SD"); while (1); }\n  \n  DateTime now = rtc.now();\n  getLogFilename(now, currentFile);\n  ensureHeader(currentFile);\n  \n  Serial.print("Logging to: ");\n  Serial.println(currentFile);\n}\n\nvoid loop() {\n  if (millis() - lastLog < LOG_INTERVAL_MS) return;\n  lastLog = millis();\n  readCount++;\n  \n  DateTime dt = rtc.now();\n  \n  // Check for date change (file rotation)\n  char todayFile[13];\n  getLogFilename(dt, todayFile);\n  if (strcmp(todayFile, currentFile) != 0) {\n    strcpy(currentFile, todayFile);\n    ensureHeader(currentFile);\n    readCount = 1;  // reset counter for new day\n    Serial.print("Rotated to new file: ");\n    Serial.println(currentFile);\n  }\n  \n  char timestamp[20];\n  sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02d",\n    dt.year(), dt.month(), dt.day(),\n    dt.hour(), dt.minute(), dt.second());\n  \n  float tempC = dht.readTemperature();\n  float humid = dht.readHumidity();\n  int light = analogRead(LIGHT_PIN);\n  \n  String line = String(timestamp) + "," +\n                String(readCount) + "," +\n                String(isnan(tempC) ? -999.0 : tempC, 1) + "," +\n                String(isnan(humid) ? -999.0 : humid, 1) + "," +\n                String(light);\n  \n  File f = SD.open(currentFile, FILE_WRITE);\n  if (f) {\n    f.println(line);\n    f.close();\n    Serial.print("[");\n    Serial.print(currentFile);\n    Serial.print("] #");\n    Serial.print(readCount);\n    Serial.print(": ");\n    Serial.println(line);\n  } else {\n    Serial.println("ERROR: SD write failed");\n  }\n}',
                language: 'Arduino',
                tip: '<strong>Tip:</strong> The SD library uses 8.3 filenames (8 chars + 3 char extension). <code>YYYYMMDD.csv</code> fits perfectly. Do not use longer filenames or subdirectories without testing &mdash; some SD libraries have limitations.'
            },
            {
                title: 'Analyze Logged Data in Python',
                content: '<p>Pull the SD card, plug it into your computer, and analyze the CSV data with Python. This script reads the log, calculates statistics, and identifies anomalies.</p>',
                code: 'import csv\nimport sys\nfrom datetime import datetime\n\ndef analyze_log(filepath):\n    temps = []\n    humids = []\n    lights = []\n    errors = 0\n    \n    with open(filepath, "r") as f:\n        reader = csv.DictReader(f)\n        for row in reader:\n            try:\n                t = float(row["temp_c"])\n                h = float(row["humidity"])\n                l = int(row["light"])\n                \n                if t > -900:  # not error sentinel\n                    temps.append(t)\n                if h > -900:\n                    humids.append(h)\n                lights.append(l)\n            except (ValueError, KeyError):\n                errors += 1\n    \n    print(f"SG-05 Log Analysis: {filepath}")\n    print(f"Total readings: {len(temps) + errors}")\n    print(f"Parse errors: {errors}")\n    print()\n    \n    if temps:\n        print(f"Temperature:")\n        print(f"  Min: {min(temps):.1f} C")\n        print(f"  Max: {max(temps):.1f} C")\n        print(f"  Avg: {sum(temps)/len(temps):.1f} C")\n        print()\n    \n    if humids:\n        print(f"Humidity:")\n        print(f"  Min: {min(humids):.1f} %")\n        print(f"  Max: {max(humids):.1f} %")\n        print(f"  Avg: {sum(humids)/len(humids):.1f} %")\n        print()\n    \n    if lights:\n        print(f"Light Level:")\n        print(f"  Min: {min(lights)}")\n        print(f"  Max: {max(lights)}")\n        print(f"  Avg: {sum(lights)//len(lights)}")\n        \n        # Detect anomalies (readings > 2 std devs from mean)\n        mean = sum(lights) / len(lights)\n        variance = sum((x - mean) ** 2 for x in lights) / len(lights)\n        std = variance ** 0.5\n        anomalies = [(i, v) for i, v in enumerate(lights) if abs(v - mean) > 2 * std]\n        if anomalies:\n            print(f"  Anomalies (>2 std): {len(anomalies)} readings")\n            for idx, val in anomalies[:5]:\n                print(f"    Reading #{idx}: {val} (mean={mean:.0f})")\n\nif __name__ == "__main__":\n    if len(sys.argv) < 2:\n        print("Usage: python analyze_log.py <csv_file>")\n        sys.exit(1)\n    analyze_log(sys.argv[1])',
                language: 'Python',
                tip: '<strong>Tip:</strong> Let the logger run overnight (or for a few hours) to get meaningful data. Temperature fluctuations, light changes from sunrise/sunset, and activity patterns all become visible with enough data points.'
            }
        ],

        testing: '<ul>' +
                 '<li><strong>SD test:</strong> The test sketch writes and reads <code>test.txt</code> without errors. Pull the SD card and verify the file exists on your computer.</li>' +
                 '<li><strong>RTC test:</strong> Serial Monitor shows a timestamp incrementing by 1 second. The date and time should be approximately correct (within a few seconds of compile time).</li>' +
                 '<li><strong>RTC persistence:</strong> Unplug the Arduino for 30 seconds, then plug it back in. The time should still be correct (maintained by the coin cell battery).</li>' +
                 '<li><strong>Basic logger:</strong> After 1 minute of running, pull the SD card and open <code>datalog.csv</code>. It should have a header row and ~6 data rows (one every 10 seconds). Timestamps should be sequential. Sensor values should be reasonable.</li>' +
                 '<li><strong>File rotation:</strong> If you can wait for midnight, verify a new file appears. Otherwise, temporarily change the rotation logic to rotate every hour (check <code>dt.hour()</code> instead of date) and verify two files are created.</li>' +
                 '<li><strong>Python analysis:</strong> Run the analysis script on your CSV. Stats should match what you observed in the Serial Monitor. Anomaly detection should flag any readings where you deliberately covered a sensor.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>"SD card init failed":</strong> (1) Check CS pin is D53 (Mega SS). (2) Card must be FAT32 formatted. (3) Verify MOSI/MISO/SCK on pins 51/50/52 (Mega hardware SPI). (4) Try a different SD card &mdash; some cheap ones have compatibility issues.</li>' +
                         '<li><strong>SD writes are slow or Arduino freezes:</strong> (1) The SD card may be nearly full. (2) Use a Class 10 or faster card. (3) Add a 100&micro;F capacitor between 5V and GND near the SD module to stabilize power.</li>' +
                         '<li><strong>RTC reads wrong time after power cycle:</strong> The coin cell battery may be dead. Replace it (CR2032). Without battery, the RTC resets to the epoch date every power cycle.</li>' +
                         '<li><strong>"RTC not found" error:</strong> I2C wiring issue. Run the I2C scanner from SG-04. The DS3231 should appear at address <code>0x68</code>. If not found, check SDA (pin 20) and SCL (pin 21).</li>' +
                         '<li><strong>CSV file has garbled data:</strong> (1) Power brownout during write. Add the capacitor mentioned above. (2) File system corruption from pulling the card while powered. Always power off the Arduino before removing the SD card.</li>' +
                         '<li><strong>File rotation creates too many files:</strong> Check your RTC time is correct. If the year reads as 2000 or 2165, the RTC was not set properly. The filename will be wrong and may overwrite or create unexpected files.</li>' +
                         '<li><strong>Memory issues (Arduino crashes after hours of logging):</strong> Avoid using <code>String</code> objects extensively &mdash; they fragment the heap. For long-running loggers, switch to <code>sprintf()</code> with fixed char buffers.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Status LED Indicators</strong> &mdash; Add three LEDs: green (logging OK), yellow (sensor warning), red (SD write failure). This gives your logger visible status without needing the Serial Monitor connected. In professional equipment, this is called "front panel diagnostics".</p>' +
                    '<p><strong>Challenge 2: Configurable Interval</strong> &mdash; Read the log interval from a <code>config.txt</code> file on the SD card at boot. If the file says <code>interval=5000</code>, log every 5 seconds. This lets you reconfigure the logger by editing the SD card without recompiling code.</p>' +
                    '<p><strong>Challenge 3: Tamper Detection</strong> &mdash; Add a hash or checksum to each row. On the Python side, verify no rows were modified after the fact. This is a simplified version of how audit log integrity checking works in security compliance (think HIPAA audit trails or PCI-DSS log retention).</p>',

        // ======================================================================
        // SG-05 visual enhancements
        // ======================================================================
        stepVisuals: {
            // Step 1 — Test SD Card: SPI transaction anatomy
            1: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs>' +
               '<pattern id="sg05-sv1-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
               '</defs>' +
               '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="172" fill="url(#sg05-sv1-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">SPI TRANSACTION — SD CARD READ BLOCK (CMD17)</text>' +
               '<!-- Signal lanes -->' +
               '<text x="46" y="50" text-anchor="end" fill="#f97316" font-size="7">CS</text>' +
               '<text x="46" y="76" text-anchor="end" fill="#eab308" font-size="7">SCK</text>' +
               '<text x="46" y="102" text-anchor="end" fill="#22c55e" font-size="7">MOSI</text>' +
               '<text x="46" y="128" text-anchor="end" fill="#3b82f6" font-size="7">MISO</text>' +
               '<!-- Time axis -->' +
               '<line x1="50" y1="150" x2="650" y2="150" stroke="#333" stroke-width="0.5"/>' +
               '<!-- CS: HIGH initially, falls LOW -->' +
               '<line x1="50" y1="44" x2="90" y2="44" stroke="#f97316" stroke-width="1.5"/>' +
               '<line x1="90" y1="44" x2="90" y2="58" stroke="#f97316" stroke-width="1.5"/>' +
               '<line x1="90" y1="58" x2="530" y2="58" stroke="#f97316" stroke-width="1.5"/>' +
               '<line x1="530" y1="58" x2="530" y2="44" stroke="#f97316" stroke-width="1.5"/>' +
               '<line x1="530" y1="44" x2="650" y2="44" stroke="#f97316" stroke-width="1.5"/>' +
               '<text x="310" y="52" text-anchor="middle" fill="#f97316" font-size="5.5">CS LOW = device selected</text>' +
               '<text x="70" y="42" text-anchor="middle" fill="#f97316" font-size="5">HIGH</text>' +
               '<text x="590" y="42" text-anchor="middle" fill="#f97316" font-size="5">HIGH</text>' +
               '<!-- SCK: clock pulses during transaction -->' +
               '<line x1="50" y1="72" x2="90" y2="72" stroke="#eab308" stroke-width="1"/>' +
               '<text x="170" y="70" text-anchor="middle" fill="#eab308" font-size="5.5">clock (up to 25 MHz)</text>' +
               '<line x1="90" y1="72" x2="98" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="98" y1="72" x2="98" y2="82" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="98" y1="82" x2="108" y2="82" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="108" y1="82" x2="108" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="108" y1="72" x2="118" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="118" y1="72" x2="118" y2="82" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="118" y1="82" x2="128" y2="82" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="128" y1="82" x2="128" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="128" y1="72" x2="138" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="138" y1="72" x2="138" y2="82" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="138" y1="82" x2="148" y2="82" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="148" y1="82" x2="148" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="148" y1="72" x2="158" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<text x="168" y="82" text-anchor="middle" fill="#555" font-size="7">...</text>' +
               '<line x1="510" y1="82" x2="520" y2="82" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="520" y1="82" x2="520" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="520" y1="72" x2="530" y2="72" stroke="#eab308" stroke-width="1.5"/>' +
               '<line x1="530" y1="72" x2="650" y2="72" stroke="#eab308" stroke-width="1"/>' +
               '<!-- MOSI: CMD17 goes out -->' +
               '<rect x="90" y="96" width="200" height="12" rx="2" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1"/>' +
               '<text x="190" y="105" text-anchor="middle" fill="#22c55e" font-size="6.5">CMD17 (READ_SINGLE_BLOCK, addr)</text>' +
               '<line x1="50" y1="108" x2="650" y2="108" stroke="#22c55e" stroke-width="0.5" opacity="0.3"/>' +
               '<line x1="50" y1="96" x2="90" y2="96" stroke="#22c55e" stroke-width="1" opacity="0.3"/>' +
               '<line x1="290" y1="96" x2="650" y2="96" stroke="#22c55e" stroke-width="1" opacity="0.3"/>' +
               '<!-- MISO: data comes back -->' +
               '<line x1="50" y1="124" x2="300" y2="124" stroke="#3b82f6" stroke-width="1" opacity="0.3"/>' +
               '<rect x="300" y="118" width="230" height="12" rx="2" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="1"/>' +
               '<text x="415" y="127" text-anchor="middle" fill="#3b82f6" font-size="6.5">512-byte data block (SD sector)</text>' +
               '<line x1="530" y1="124" x2="650" y2="124" stroke="#3b82f6" stroke-width="1" opacity="0.3"/>' +
               '<!-- Phase labels -->' +
               '<text x="140" y="160" text-anchor="middle" fill="#555" font-size="6">Assert CS</text>' +
               '<text x="190" y="160" text-anchor="middle" fill="#22c55e" font-size="6">Send CMD</text>' +
               '<text x="415" y="160" text-anchor="middle" fill="#3b82f6" font-size="6">Receive 512B block</text>' +
               '<text x="590" y="160" text-anchor="middle" fill="#f97316" font-size="6">Deassert CS</text>' +
               '<!-- Formula -->' +
               '<rect x="50" y="166" width="580" height="14" rx="3" fill="rgba(255,107,53,0.05)" stroke="rgba(255,107,53,0.2)" stroke-width="0.5"/>' +
               '<text x="340" y="176" text-anchor="middle" fill="#ff6b35" font-size="6.5">SPI0 Mega pins: CS=D53, MOSI=D51, MISO=D50, SCK=D52  (hardware SPI, fixed)</text>' +
               '</svg>',

            // Step 4 — Build the Complete Data Logger: CSV log structure
            4: '<svg viewBox="0 0 680 180" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<defs><pattern id="sg05-sv4-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
               '<rect width="680" height="180" fill="#0d1117" rx="6"/>' +
               '<rect x="8" y="8" width="664" height="164" fill="url(#sg05-sv4-grid)" rx="3"/>' +
               '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">CSV LOG FILE STRUCTURE — datalog.csv</text>' +
               '<!-- Header row -->' +
               '<rect x="20" y="34" width="640" height="22" rx="3" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
               '<text x="30" y="49" fill="#c084fc" font-size="7" font-weight="700">timestamp</text>' +
               '<text x="174" y="49" fill="#c084fc" font-size="7" font-weight="700">reading</text>' +
               '<text x="280" y="49" fill="#c084fc" font-size="7" font-weight="700">temp_c</text>' +
               '<text x="380" y="49" fill="#c084fc" font-size="7" font-weight="700">humidity</text>' +
               '<text x="484" y="49" fill="#c084fc" font-size="7" font-weight="700">light</text>' +
               '<text x="30" y="58" fill="#555" font-size="5">HEADER ROW (written once on file creation)</text>' +
               '<!-- Column separators -->' +
               '<line x1="170" y1="34" x2="170" y2="156" stroke="#333" stroke-width="0.5"/>' +
               '<line x1="274" y1="34" x2="274" y2="156" stroke="#333" stroke-width="0.5"/>' +
               '<line x1="374" y1="34" x2="374" y2="156" stroke="#333" stroke-width="0.5"/>' +
               '<line x1="478" y1="34" x2="478" y2="156" stroke="#333" stroke-width="0.5"/>' +
               '<!-- Data rows -->' +
               '<rect x="20" y="56" width="640" height="20" rx="2" fill="rgba(255,255,255,0.02)"/>' +
               '<text x="30" y="70" fill="#eab308" font-size="7">2026-03-18T09:00:00</text>' +
               '<text x="184" y="70" fill="#8b949e" font-size="7">1</text>' +
               '<text x="284" y="70" fill="#22c55e" font-size="7">23.5</text>' +
               '<text x="384" y="70" fill="#60a5fa" font-size="7">45.0</text>' +
               '<text x="488" y="70" fill="#f97316" font-size="7">512</text>' +
               '<rect x="20" y="76" width="640" height="20" rx="2" fill="rgba(255,255,255,0.03)"/>' +
               '<text x="30" y="90" fill="#eab308" font-size="7">2026-03-18T09:00:10</text>' +
               '<text x="184" y="90" fill="#8b949e" font-size="7">2</text>' +
               '<text x="284" y="90" fill="#22c55e" font-size="7">23.6</text>' +
               '<text x="384" y="90" fill="#60a5fa" font-size="7">45.1</text>' +
               '<text x="488" y="90" fill="#f97316" font-size="7">514</text>' +
               '<rect x="20" y="96" width="640" height="20" rx="2" fill="rgba(255,255,255,0.02)"/>' +
               '<text x="30" y="110" fill="#eab308" font-size="7">2026-03-18T09:00:20</text>' +
               '<text x="184" y="110" fill="#8b949e" font-size="7">3</text>' +
               '<text x="284" y="110" fill="#22c55e" font-size="7">23.6</text>' +
               '<text x="384" y="110" fill="#60a5fa" font-size="7">44.9</text>' +
               '<text x="488" y="110" fill="#f97316" font-size="7">498</text>' +
               '<text x="340" y="130" text-anchor="middle" fill="#444" font-size="8">. . . one row per 10 seconds . . .</text>' +
               '<!-- Column annotations -->' +
               '<rect x="20" y="140" width="640" height="20" rx="3" fill="rgba(255,107,53,0.04)" stroke="rgba(255,107,53,0.15)" stroke-width="0.5"/>' +
               '<text x="90" y="153" text-anchor="middle" fill="#eab308" font-size="6">ISO 8601 timestamp</text>' +
               '<text x="222" y="153" text-anchor="middle" fill="#8b949e" font-size="6">seq #</text>' +
               '<text x="322" y="153" text-anchor="middle" fill="#22c55e" font-size="6">DHT11 C</text>' +
               '<text x="424" y="153" text-anchor="middle" fill="#60a5fa" font-size="6">DHT11 RH%</text>' +
               '<text x="560" y="153" text-anchor="middle" fill="#f97316" font-size="6">analogRead(A0) 0-1023</text>' +
               '<!-- Key insight -->' +
               '<rect x="20" y="162" width="640" height="10" rx="2" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.1)" stroke-width="0.5"/>' +
               '<text x="340" y="170" text-anchor="middle" fill="#555" font-size="5.5">Open/write/close on every row — prevents data loss on power cut  |  File survives unplugging the Arduino</text>' +
               '</svg>'
        },

        componentCallouts: {
            svg: '<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                 '<defs><pattern id="sg05-cc-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
                 '<rect width="560" height="200" fill="#0d1117" rx="6"/>' +
                 '<rect x="6" y="6" width="548" height="188" fill="url(#sg05-cc-grid)" rx="3"/>' +
                 '<text x="280" y="20" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.14em">SG-05 DATA LOGGER COMPONENTS</text>' +
                 '<!-- Arduino Mega -->' +
                 '<rect x="14" y="32" width="90" height="154" rx="6" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5" data-callout="mega"/>' +
                 '<text x="59" y="48" text-anchor="middle" fill="#60a5fa" font-size="6" font-weight="700">ARDUINO MEGA</text>' +
                 '<circle cx="104" cy="76" r="4" fill="#1a1f2b" stroke="#f97316" stroke-width="1" data-callout="sd"/>' +
                 '<text x="96" y="75" text-anchor="end" fill="#555" font-size="5">D53 CS</text>' +
                 '<circle cx="104" cy="90" r="4" fill="#1a1f2b" stroke="#eab308" stroke-width="1" data-callout="sd"/>' +
                 '<text x="96" y="89" text-anchor="end" fill="#555" font-size="5">D51 MOSI</text>' +
                 '<circle cx="104" cy="104" r="4" fill="#1a1f2b" stroke="#22c55e" stroke-width="1" data-callout="sd"/>' +
                 '<text x="96" y="103" text-anchor="end" fill="#555" font-size="5">D50 MISO</text>' +
                 '<circle cx="104" cy="118" r="4" fill="#1a1f2b" stroke="#06b6d4" stroke-width="1" data-callout="sd"/>' +
                 '<text x="96" y="117" text-anchor="end" fill="#555" font-size="5">D52 SCK</text>' +
                 '<circle cx="104" cy="138" r="4" fill="#1a1f2b" stroke="#a855f7" stroke-width="1" data-callout="rtc"/>' +
                 '<text x="96" y="137" text-anchor="end" fill="#555" font-size="5">SDA 20</text>' +
                 '<circle cx="104" cy="152" r="4" fill="#1a1f2b" stroke="#c084fc" stroke-width="1" data-callout="rtc"/>' +
                 '<text x="96" y="151" text-anchor="end" fill="#555" font-size="5">SCL 21</text>' +
                 '<circle cx="104" cy="168" r="4" fill="#1a1f2b" stroke="#fb923c" stroke-width="1" data-callout="dht11"/>' +
                 '<text x="96" y="167" text-anchor="end" fill="#555" font-size="5">D7 DHT</text>' +
                 '<!-- SD Card Module -->' +
                 '<rect x="154" y="32" width="120" height="90" rx="6" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5" data-callout="sd"/>' +
                 '<text x="214" y="50" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="700">SD MODULE</text>' +
                 '<rect x="172" y="56" width="84" height="40" rx="3" fill="#060810" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
                 '<text x="214" y="72" text-anchor="middle" fill="#fb923c" font-size="7">microSD</text>' +
                 '<text x="214" y="84" text-anchor="middle" fill="#555" font-size="5.5">FAT32</text>' +
                 '<text x="214" y="110" text-anchor="middle" fill="#555" font-size="5.5">SPI interface</text>' +
                 '<!-- DS3231 RTC -->' +
                 '<rect x="154" y="136" width="120" height="70" rx="6" fill="#0f1a2e" stroke="#a855f7" stroke-width="1.5" data-callout="rtc"/>' +
                 '<text x="214" y="154" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">DS3231 RTC</text>' +
                 '<circle cx="214" cy="172" r="12" fill="none" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>' +
                 '<circle cx="214" cy="172" r="7" fill="rgba(168,85,247,0.08)"/>' +
                 '<text x="214" y="175" text-anchor="middle" fill="#c084fc" font-size="5.5">CR2032</text>' +
                 '<text x="214" y="198" text-anchor="middle" fill="#555" font-size="5.5">I2C 0x68</text>' +
                 '<!-- DHT11 -->' +
                 '<rect x="290" y="32" width="100" height="54" rx="6" fill="#0f1a2e" stroke="#fb923c" stroke-width="1.5" data-callout="dht11"/>' +
                 '<text x="340" y="52" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="700">DHT11</text>' +
                 '<text x="340" y="70" text-anchor="middle" fill="#555" font-size="5.5">D7  |  5V  |  GND</text>' +
                 '<!-- Data flow arrows -->' +
                 '<text x="400" y="80" fill="#8b949e" font-size="6">1. RTC -> timestamp</text>' +
                 '<text x="400" y="96" fill="#8b949e" font-size="6">2. DHT -> temp, humid</text>' +
                 '<text x="400" y="112" fill="#8b949e" font-size="6">3. Arduino -> CSV line</text>' +
                 '<text x="400" y="128" fill="#8b949e" font-size="6">4. SD card -> write</text>' +
                 '<rect x="390" y="140" width="148" height="12" rx="2" fill="rgba(255,107,53,0.08)" stroke="rgba(255,107,53,0.2)" stroke-width="0.5"/>' +
                 '<text x="464" y="149" text-anchor="middle" fill="#ff6b35" font-size="5.5">every 10 seconds</text>' +
                 '</svg>',
            components: [
                {
                    id: 'sd',
                    name: 'SD Card Module (SPI)',
                    purpose: 'A microSD card slot with a 3.3V level shifter and SPI interface. The Arduino SD library communicates using the hardware SPI pins on the Mega (MOSI=51, MISO=50, SCK=52, CS=53). The SD card stores log files in FAT32 format, readable by any OS.',
                    specs: ['CS=D53, MOSI=D51, MISO=D50, SCK=D52', 'Hardware SPI (fixed pins on Mega)', 'FAT32 / FAT16 format required', 'Max file name: 8.3 format (e.g. LOG.CSV)', 'Open/close per write for data safety']
                },
                {
                    id: 'rtc',
                    name: 'DS3231 Real-Time Clock',
                    purpose: 'A temperature-compensated crystal oscillator (TCXO) module with I2C interface. Maintains accurate time even when the Arduino is powered off via a CR2032 coin cell. Much more accurate than the DS1307 (~2 minutes drift per year vs ~5 minutes per month).',
                    specs: ['I2C address: 0x68', 'SDA=pin 20, SCL=pin 21 (Mega)', 'TCXO: +/-2ppm accuracy', 'CR2032 backup battery', 'Adafruit RTClib required']
                },
                {
                    id: 'dht11',
                    name: 'DHT11 Temperature/Humidity Sensor',
                    purpose: 'Provides the environmental data that gets logged. Same sensor from SG-02 and SG-04. In the logger, it feeds the CSV rows. The -999.0 sentinel value is written when a DHT read fails (NaN result), making it detectable during Python analysis without crashing the logger.',
                    specs: ['D7 digital pin', '5V supply', 'Temp +/-2C, Humid +/-5%', '-999.0 sentinel on read error', '2-second minimum sample interval']
                },
                {
                    id: 'mega',
                    name: 'Arduino Mega 2560 (logger controller)',
                    purpose: 'Orchestrates all three peripherals: reads time from RTC via I2C, reads sensor via DHT protocol, formats a CSV string, and writes it to the SD card via SPI. Runs a simple millis()-based scheduler with no blocking delays in the main loop.',
                    specs: ['Two protocols: SPI + I2C', 'millis() non-blocking scheduler', 'LOG_INTERVAL_MS configurable', 'sprintf() for CSV formatting', 'No RTOS needed']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'Using VBUS (5V) Instead of 3.3V for the SD Card',
                correct: 'Most SD card breakout modules accept 5V on the VCC pin and use an onboard regulator or level shifter to provide the 3.3V the SD card requires. Connect the module VCC to Arduino 5V pin.',
                incorrect: 'Connecting the raw SD card pins (not a breakout module) directly to 5V SPI lines. Or wiring a breakout module to the wrong voltage. Some modules are 3.3V-only.',
                consequence: 'Overvoltage destroys the SD card immediately and silently. The card will stop working but show no visible damage. Always check your specific breakout module datasheet for its VCC tolerance before wiring.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT (breakout module)</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG (raw card)</text>' +
                         '<text x="20" y="50" fill="#ef4444" font-size="6">Arduino 5V</text>' +
                         '<line x1="72" y1="48" x2="110" y2="48" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<rect x="110" y="36" width="60" height="36" rx="3" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5"/>' +
                         '<text x="140" y="52" text-anchor="middle" fill="#f97316" font-size="5.5">SD Breakout</text>' +
                         '<text x="140" y="64" text-anchor="middle" fill="#555" font-size="5">5V->3.3V</text>' +
                         '<line x1="170" y1="54" x2="210" y2="54" stroke="#22c55e" stroke-width="1.5"/>' +
                         '<rect x="210" y="42" width="14" height="28" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="217" y="70" text-anchor="middle" fill="#22c55e" font-size="5">SD</text>' +
                         '<text x="124" y="96" text-anchor="middle" fill="#22c55e" font-size="6">module converts voltage safely</text>' +
                         '<text x="272" y="50" fill="#ef4444" font-size="6">Arduino 5V</text>' +
                         '<line x1="324" y1="48" x2="424" y2="48" stroke="#ef4444" stroke-width="2"/>' +
                         '<rect x="424" y="36" width="14" height="28" rx="2" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<text x="431" y="56" text-anchor="middle" fill="#ef4444" font-size="5">SD</text>' +
                         '<circle cx="398" cy="48" r="6" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<text x="398" y="52" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">!</text>' +
                         '<text x="376" y="96" text-anchor="middle" fill="#ef4444" font-size="6">5V destroys SD card permanently</text>' +
                         '</svg>'
            },
            {
                title: 'SD Card Formatted as exFAT Instead of FAT32',
                correct: 'SD card is formatted as FAT32 (or FAT16 for very small cards). Use the official SD Card Formatter tool or format from your OS with FAT32 selected explicitly.',
                incorrect: 'A large SD card (64GB+) auto-formatted by Windows/macOS as exFAT. The Arduino SD library does not support exFAT and will fail to initialize.',
                consequence: 'SD.begin() returns false every time. The logger prints "ERROR: SD card init failed" and halts. No data is ever written. Reformat as FAT32 (use a 32GB or smaller card for easiest compatibility).',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="94" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG</text>' +
                         '<rect x="20" y="36" width="60" height="54" rx="4" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5"/>' +
                         '<text x="50" y="56" text-anchor="middle" fill="#f97316" font-size="6.5">32 GB</text>' +
                         '<rect x="28" y="62" width="44" height="18" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>' +
                         '<text x="50" y="74" text-anchor="middle" fill="#22c55e" font-size="6.5" font-weight="700">FAT32</text>' +
                         '<text x="110" y="62" fill="#22c55e" font-size="6">SD.begin(53)</text>' +
                         '<text x="110" y="74" fill="#22c55e" font-size="6">returns true</text>' +
                         '<text x="110" y="86" fill="#22c55e" font-size="6">logging works</text>' +
                         '<rect x="272" y="36" width="60" height="54" rx="4" fill="#0f1a2e" stroke="#f97316" stroke-width="1.5"/>' +
                         '<text x="302" y="56" text-anchor="middle" fill="#f97316" font-size="6.5">128 GB</text>' +
                         '<rect x="280" y="62" width="44" height="18" rx="2" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1"/>' +
                         '<text x="302" y="74" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="700">exFAT</text>' +
                         '<text x="362" y="62" fill="#ef4444" font-size="6">SD.begin(53)</text>' +
                         '<text x="362" y="74" fill="#ef4444" font-size="6">returns false</text>' +
                         '<text x="362" y="86" fill="#ef4444" font-size="6">logger halts</text>' +
                         '</svg>'
            },
            {
                title: 'RTC Battery Dead — Time Resets to 2000-01-01 on Every Power Cycle',
                correct: 'The DS3231 CR2032 coin cell is installed and has charge. After power cycle, rtc.lostPower() returns false and the clock reads the correct time without needing to re-set.',
                incorrect: 'The coin cell is missing, flat, or facing the wrong way. rtc.lostPower() returns true on every boot. The sketch re-sets time from the compile time, which is always in the past.',
                consequence: 'Log files get timestamps that are wrong by hours, months, or years. Log rotation creates files with wrong dates (e.g. 20000101.csv). Security-critical audit logs become useless for incident timeline reconstruction.',
                svgDiff: '<svg viewBox="0 0 500 110" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                         '<rect width="500" height="110" fill="#0d1117" rx="6"/>' +
                         '<rect x="8" y="8" width="232" height="94" rx="5" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                         '<rect x="260" y="8" width="232" height="104" rx="5" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                         '<text x="124" y="24" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">CORRECT (battery ok)</text>' +
                         '<text x="376" y="24" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700">WRONG (battery dead)</text>' +
                         '<circle cx="66" cy="72" r="24" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="1.5"/>' +
                         '<text x="66" y="68" text-anchor="middle" fill="#c084fc" font-size="6" font-weight="700">CR2032</text>' +
                         '<text x="66" y="78" text-anchor="middle" fill="#c084fc" font-size="5.5">3.0V ok</text>' +
                         '<text x="140" y="60" fill="#22c55e" font-size="6">lostPower(): false</text>' +
                         '<text x="140" y="74" fill="#22c55e" font-size="6">2026-03-18</text>' +
                         '<text x="140" y="86" fill="#22c55e" font-size="6">09:00:00</text>' +
                         '<circle cx="318" cy="72" r="24" fill="rgba(239,68,68,0.1)" stroke="#ef4444" stroke-width="1.5"/>' +
                         '<text x="318" y="68" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="700">CR2032</text>' +
                         '<text x="318" y="78" text-anchor="middle" fill="#ef4444" font-size="5.5">0.0V dead</text>' +
                         '<text x="392" y="60" fill="#ef4444" font-size="6">lostPower(): true</text>' +
                         '<text x="392" y="74" fill="#ef4444" font-size="6">2000-01-01</text>' +
                         '<text x="392" y="86" fill="#ef4444" font-size="6">00:00:00</text>' +
                         '</svg>'
            }
        ]
    }

};
