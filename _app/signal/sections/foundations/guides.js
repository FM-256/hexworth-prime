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
                     '<p><strong>Resistor value:</strong> 220&Omega; limits current to ~15mA at 5V, safe for standard LEDs. Never connect an LED directly to a pin without a resistor &mdash; you will burn it out.</p>' +
                     '<p><strong>Wire colors:</strong> Black = ground, other colors = signal. Pick a consistent scheme and stick with it.</p>',

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
            '<polygon points="630,175 640,195 620,195" fill="rgba(226,232,240,0.3)" stroke="#e2e8f0" stroke-width="1"/>' +
            '<text x="630" y="210" text-anchor="middle" fill="#e2e8f0" font-size="7">LED 5</text>' +
            '<rect x="550" y="282" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="570" y="289" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +
            '</g>' +

            '<!-- Wires -->' +
            '<!-- GND wire (black) -->' +
            '<line x1="221" y1="137" x2="392" y2="140" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3"/>' +
            '<!-- D2 wire (yellow) -->' +
            '<line x1="221" y1="167" x2="430" y2="175" stroke="#eab308" stroke-width="1.5"/>' +
            '<!-- D3 wire (green) -->' +
            '<line x1="221" y1="197" x2="430" y2="225" stroke="#22c55e" stroke-width="1.5"/>' +
            '<!-- D4 wire (blue) -->' +
            '<line x1="221" y1="227" x2="530" y2="175" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<!-- D5 wire (red) -->' +
            '<line x1="221" y1="257" x2="530" y2="225" stroke="#ef4444" stroke-width="1.5"/>' +
            '<!-- D6 wire (white) -->' +
            '<line x1="221" y1="287" x2="630" y2="175" stroke="#e2e8f0" stroke-width="1.5"/>' +

            '<!-- Resistor to GND connections -->' +
            '<line x1="490" y1="186" x2="530" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="490" y1="236" x2="530" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="590" y1="186" x2="600" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="590" y1="236" x2="600" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="590" y1="286" x2="640" y2="140" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +

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
                content: '<p>Now build a real circuit. Insert an LED into the breadboard with the <strong>long leg (anode)</strong> in one row and the <strong>short leg (cathode)</strong> in the adjacent row. Connect a 220&Omega; resistor from the cathode row to the ground rail. Run a jumper wire from the anode row to <strong>pin D2</strong> on the Mega, and another from the GND rail to any <strong>GND</strong> pin on the Mega.</p>' +
                         '<p>The circuit path is: Pin D2 &rarr; wire &rarr; LED anode &rarr; LED cathode &rarr; resistor &rarr; GND rail &rarr; wire &rarr; Mega GND.</p>',
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
                content: '<p>Add four more LEDs on pins D3 through D6, each with its own 220&Omega; resistor to ground. Use different color LEDs if you have them. Each LED gets its own row on the breadboard &mdash; do not share rows between different LED circuits.</p>' +
                         '<p>Keep your wiring neat. Short, flat jumper wires are easier to debug than long tangled ones.</p>',
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
                    '<p><strong>Challenge 3: Binary Counter</strong> &mdash; Use 5 LEDs to count from 0 to 31 in binary. Each LED represents one bit. Increment every second and display the current number on Serial Monitor alongside the binary representation.</p>'
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
                    '<p><strong>Challenge 3: Environmental Heatmap</strong> &mdash; Walk around the room with the sensor station connected to your laptop. Log temperature and light readings from 10 different spots. Create a simple map showing the "hot spots" and "cold spots". This is the manual version of what HVAC sensors do in data centers.</p>'
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
                    '<p><strong>Challenge 3: Matplotlib Live Plot</strong> &mdash; Replace the terminal dashboard with a <code>matplotlib</code> animated plot showing temperature and light over time. Use <code>matplotlib.animation.FuncAnimation</code> for smooth updates.</p>'
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
                    '<p><strong>Challenge 3: Two-Button Menu</strong> &mdash; Add a second button. One button cycles forward, the other cycles backward. Add a "settings" page where you can adjust the auto-cycle interval and temperature alert threshold using the two buttons (up/down selection).</p>'
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
                    '<p><strong>Challenge 3: Tamper Detection</strong> &mdash; Add a hash or checksum to each row. On the Python side, verify no rows were modified after the fact. This is a simplified version of how audit log integrity checking works in security compliance (think HIPAA audit trails or PCI-DSS log retention).</p>'
    }

};
