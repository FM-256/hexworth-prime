// ============================================================================
// Pico Builds — Build Guides (sg-113 through sg-117)
// Raspberry Pi Pico MicroPython physical computing projects
// Companion builds to PiVerse educational content
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-113: Traffic Light Controller
    // ========================================================================
    'sg-113': {
        intro: '<p>The traffic light is the quintessential state machine &mdash; a system that cycles through a fixed set of states with defined transitions. In this build you will wire three LEDs (red, yellow, green) to a Raspberry Pi Pico and write MicroPython code that models a real-world traffic signal.</p>' +
               '<p>This is your entry point to Pico physical computing. You will learn how to set up Thonny IDE, flash MicroPython firmware, control GPIO output pins, and structure your code as a state machine &mdash; a pattern that shows up everywhere from embedded systems to network protocols.</p>' +
               '<p>Total cost is under $5 if you already have a Pico. All you need are three LEDs, three resistors, a breadboard, and jumper wires.</p>',

        wiring: '    Raspberry Pi Pico              Breadboard\n' +
                '    +----------------+            +---------------------------+\n' +
                '    |                |            |  + rail   - rail          |\n' +
                '    |          GND   |---black----|--+--------[GND rail]     |\n' +
                '    |                |            |                           |\n' +
                '    |          GP15  |---red------|--->|--- [220 ohm] ---GND |\n' +
                '    |                |            |   RED LED                 |\n' +
                '    |          GP14  |---yellow---|--->|--- [220 ohm] ---GND |\n' +
                '    |                |            |   YELLOW LED              |\n' +
                '    |          GP13  |---green----|--->|--- [220 ohm] ---GND |\n' +
                '    |                |            |   GREEN LED               |\n' +
                '    +----------------+            +---------------------------+\n' +
                '\n' +
                '    LED Orientation:\n' +
                '    Long leg (anode +)  ----> Pico GPIO pin (through wire)\n' +
                '    Short leg (cathode -) --> 220 ohm resistor --> GND rail',

        wiringNotes: '<p><strong>Pin reference:</strong> GP13, GP14, GP15 are on the right side of the Pico (pins 17, 19, 20 physical). GND is pin 18 (between GP13 and GP14) or any other GND pin.</p>' +
                     '<p><strong>Resistor value:</strong> 220&#937; limits current to ~5mA at 3.3V (Pico GPIO is 3.3V, not 5V like Arduino). The Pico has a 12mA max per pin &mdash; 220&#937; keeps you well within limits.</p>' +
                     '<p><strong>Voltage:</strong> The Pico runs at 3.3V logic. Never connect 5V signals directly to Pico GPIO pins &mdash; you will damage the RP2040 chip.</p>' +
                     '<p><strong>Safety:</strong> Disconnect the USB cable before wiring. Verify all connections before reconnecting power.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg113-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg113-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-113 TRAFFIC LIGHT CONTROLLER</text>' +

            '<!-- Pico -->' +
            '<g>' +
            '<rect x="40" y="70" width="180" height="240" rx="8" fill="#1e2736" stroke="#c51a4a" stroke-width="1.5"/>' +
            '<rect x="40" y="70" width="180" height="24" rx="8" fill="rgba(197,26,74,0.12)"/>' +
            '<rect x="40" y="86" width="180" height="8" fill="rgba(197,26,74,0.12)"/>' +
            '<text x="130" y="86" text-anchor="middle" fill="#c51a4a" font-size="10" font-weight="600">RASPBERRY PI PICO</text>' +
            '<!-- USB port -->' +
            '<rect x="105" y="46" width="50" height="28" rx="3" fill="#1a1f2b" stroke="#c51a4a" stroke-width="1"/>' +
            '<text x="130" y="64" text-anchor="middle" fill="#c51a4a" font-size="6">USB</text>' +
            '<!-- Pin labels -->' +
            '<text x="210" y="130" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="218" cy="127" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="210" y="175" text-anchor="end" fill="#8b949e" font-size="8">GP15</text>' +
            '<circle cx="218" cy="172" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="210" y="220" text-anchor="end" fill="#8b949e" font-size="8">GP14</text>' +
            '<circle cx="218" cy="217" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="210" y="265" text-anchor="end" fill="#8b949e" font-size="8">GP13</text>' +
            '<circle cx="218" cy="262" r="3" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
            '</g>' +

            '<!-- Breadboard -->' +
            '<g>' +
            '<rect x="380" y="70" width="300" height="240" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="380" y="70" width="300" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="380" y="86" width="300" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="530" y="86" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">BREADBOARD</text>' +
            '<!-- GND rail -->' +
            '<rect x="392" y="108" width="276" height="16" rx="3" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="400" y="119" fill="#60a5fa" font-size="7">- GND RAIL</text>' +

            '<!-- RED LED (GP15) -->' +
            '<polygon points="460,160 470,180 450,180" fill="rgba(239,68,68,0.4)" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="460" y="195" text-anchor="middle" fill="#ef4444" font-size="7">RED</text>' +
            '<rect x="480" y="166" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="500" y="173" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +

            '<!-- YELLOW LED (GP14) -->' +
            '<polygon points="460,215" fill="rgba(234,179,8,0.4)" stroke="#eab308" stroke-width="1.5"/>' +
            '<polygon points="460,210 470,230 450,230" fill="rgba(234,179,8,0.4)" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="460" y="245" text-anchor="middle" fill="#eab308" font-size="7">YELLOW</text>' +
            '<rect x="480" y="216" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="500" y="223" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +

            '<!-- GREEN LED (GP13) -->' +
            '<polygon points="460,260 470,280 450,280" fill="rgba(34,197,94,0.4)" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="460" y="295" text-anchor="middle" fill="#22c55e" font-size="7">GREEN</text>' +
            '<rect x="480" y="266" width="40" height="8" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="500" y="273" text-anchor="middle" fill="#c084fc" font-size="6">220R</text>' +
            '</g>' +

            '<!-- Wires -->' +
            '<line x1="221" y1="127" x2="392" y2="116" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3"/>' +
            '<line x1="221" y1="172" x2="460" y2="160" stroke="#ef4444" stroke-width="1.5"/>' +
            '<line x1="221" y1="217" x2="460" y2="210" stroke="#eab308" stroke-width="1.5"/>' +
            '<line x1="221" y1="262" x2="460" y2="260" stroke="#22c55e" stroke-width="1.5"/>' +

            '<!-- Resistor to GND rail connections -->' +
            '<line x1="520" y1="170" x2="540" y2="116" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="520" y1="220" x2="550" y2="116" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
            '<line x1="520" y1="270" x2="560" y2="116" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +

            '<!-- State diagram callout -->' +
            '<rect x="560" y="155" width="110" height="140" rx="6" fill="rgba(197,26,74,0.06)" stroke="rgba(197,26,74,0.2)" stroke-width="0.5"/>' +
            '<text x="615" y="172" text-anchor="middle" fill="#c51a4a" font-size="8" font-weight="600">STATE MACHINE</text>' +
            '<circle cx="615" cy="195" r="10" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="615" y="198" text-anchor="middle" fill="#22c55e" font-size="6">GO</text>' +
            '<circle cx="615" cy="230" r="10" fill="rgba(234,179,8,0.3)" stroke="#eab308" stroke-width="1"/>' +
            '<text x="615" y="233" text-anchor="middle" fill="#eab308" font-size="5">WARN</text>' +
            '<circle cx="615" cy="265" r="10" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="615" y="268" text-anchor="middle" fill="#ef4444" font-size="6">STOP</text>' +
            '<line x1="615" y1="206" x2="615" y2="219" stroke="#8b949e" stroke-width="0.8" marker-end="none"/>' +
            '<polygon points="612,218 615,222 618,218" fill="#8b949e"/>' +
            '<line x1="615" y1="241" x2="615" y2="254" stroke="#8b949e" stroke-width="0.8"/>' +
            '<polygon points="612,253 615,257 618,253" fill="#8b949e"/>' +
            '<path d="M 627 265 Q 645 230 627 195" fill="none" stroke="#8b949e" stroke-width="0.8" stroke-dasharray="3,2"/>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Flash MicroPython and Set Up Thonny',
                content: '<p>Download the MicroPython UF2 firmware from <code>micropython.org/download/RPI_PICO</code>. Hold the <strong>BOOTSEL</strong> button on the Pico while plugging in the USB cable. The Pico will appear as a USB drive called <strong>RPI-RP2</strong>. Drag the <code>.uf2</code> file onto the drive. The Pico will reboot automatically.</p>' +
                         '<p>Install Thonny IDE from <code>thonny.org</code>. Open Thonny, go to <strong>Tools &gt; Options &gt; Interpreter</strong>, and select <strong>MicroPython (Raspberry Pi Pico)</strong>. Select the correct port. You should see the MicroPython REPL prompt <code>&gt;&gt;&gt;</code> in the shell panel.</p>',
                code: '# Test in the REPL — type this directly in Thonny\'s shell panel\nprint("Pico is alive!")\n\n# Check firmware version\nimport sys\nprint(sys.implementation)\n# Should show: (name=\'micropython\', version=(1, 2x, x), ...)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> If Thonny cannot find the Pico, try a different USB cable. Some cables are charge-only and do not carry data. On Linux, add yourself to the <code>dialout</code> group: <code>sudo usermod -aG dialout $USER</code>.'
            },
            {
                title: 'Wire the Three-LED Circuit',
                content: '<p><strong>Disconnect USB before wiring.</strong> Place three LEDs on the breadboard &mdash; red, yellow, and green. For each LED: connect the <strong>long leg (anode)</strong> to the GPIO pin via a jumper wire, and the <strong>short leg (cathode)</strong> through a 220&#937; resistor to the GND rail. Run a wire from the GND rail to any GND pin on the Pico.</p>' +
                         '<p>Pin assignments: <strong>GP15 = Red</strong>, <strong>GP14 = Yellow</strong>, <strong>GP13 = Green</strong>. Keep the LEDs in order on the breadboard so they look like a real traffic light (red on top, green on bottom).</p>',
                code: '# Quick test — light each LED individually\nfrom machine import Pin\nimport utime\n\nred = Pin(15, Pin.OUT)\nyellow = Pin(14, Pin.OUT)\ngreen = Pin(13, Pin.OUT)\n\n# Flash each LED to verify wiring\nfor led in [red, yellow, green]:\n    led.on()\n    utime.sleep(0.5)\n    led.off()\n    utime.sleep(0.2)\n\nprint("All three LEDs tested")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> If an LED does not light, flip it around. LEDs are polarized. Also verify the resistor is in the correct row &mdash; it must share the same breadboard row as the LED cathode.'
            },
            {
                title: 'Build the State Machine',
                content: '<p>A traffic light has three states: <strong>GO</strong> (green on), <strong>WARN</strong> (yellow on), and <strong>STOP</strong> (red on). Each state has a fixed duration, and they transition in order: GO &rarr; WARN &rarr; STOP &rarr; GO. This is a <em>finite state machine</em> &mdash; one of the most fundamental patterns in computing.</p>' +
                         '<p>Save this as <code>main.py</code> on the Pico. Files named <code>main.py</code> run automatically when the Pico boots.</p>',
                code: 'from machine import Pin\nimport utime\n\n# --- Pin Setup ---\nred = Pin(15, Pin.OUT)\nyellow = Pin(14, Pin.OUT)\ngreen = Pin(13, Pin.OUT)\n\ndef all_off():\n    red.off()\n    yellow.off()\n    green.off()\n\n# --- State Definitions ---\n# Each state: (name, active_led, duration_seconds)\nSTATES = [\n    ("GO",   green,  5),\n    ("WARN", yellow, 2),\n    ("STOP", red,    5),\n]\n\n# --- Main Loop ---\nprint("SG-113: Traffic Light Controller")\nprint("States:", [s[0] for s in STATES])\n\nstate_index = 0\n\nwhile True:\n    name, led, duration = STATES[state_index]\n    all_off()\n    led.on()\n    print(f"State: {name} ({duration}s)")\n    utime.sleep(duration)\n    \n    # Advance to next state (wraps around)\n    state_index = (state_index + 1) % len(STATES)',
                language: 'MicroPython',
                tip: null
            },
            {
                title: 'Add Transition Blink Effect',
                content: '<p>Real traffic lights do not just snap between states. Add a blink effect to the yellow warning phase, and a brief all-off gap between red and green to simulate the pause at real intersections.</p>',
                code: 'from machine import Pin\nimport utime\n\nred = Pin(15, Pin.OUT)\nyellow = Pin(14, Pin.OUT)\ngreen = Pin(13, Pin.OUT)\n\ndef all_off():\n    red.off()\n    yellow.off()\n    green.off()\n\ndef blink(led, times, on_ms=300, off_ms=200):\n    """Blink an LED a specified number of times."""\n    for _ in range(times):\n        led.on()\n        utime.sleep_ms(on_ms)\n        led.off()\n        utime.sleep_ms(off_ms)\n\nprint("SG-113: Traffic Light Controller v2")\n\nwhile True:\n    # GREEN phase — steady\n    all_off()\n    green.on()\n    print(">> GO (green steady)")\n    utime.sleep(5)\n    \n    # WARN phase — yellow blinks\n    all_off()\n    print(">> WARN (yellow blink)")\n    blink(yellow, 4, on_ms=300, off_ms=200)\n    \n    # Brief pause before red\n    all_off()\n    utime.sleep(0.3)\n    \n    # STOP phase — steady\n    red.on()\n    print(">> STOP (red steady)")\n    utime.sleep(5)\n    \n    # Brief pause before green\n    all_off()\n    utime.sleep(0.3)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> <code>utime.sleep_ms()</code> takes milliseconds, while <code>utime.sleep()</code> takes seconds (or fractions). Use <code>sleep_ms</code> for precise timing under 1 second.'
            },
            {
                title: 'Add Serial State Logging',
                content: '<p>Add timestamps and state duration tracking to the serial output. This gives you a log you can read in Thonny\'s shell panel to verify timing accuracy and catch bugs.</p>',
                code: 'from machine import Pin\nimport utime\n\nred = Pin(15, Pin.OUT)\nyellow = Pin(14, Pin.OUT)\ngreen = Pin(13, Pin.OUT)\n\ndef all_off():\n    red.off()\n    yellow.off()\n    green.off()\n\ndef blink(led, times, on_ms=300, off_ms=200):\n    for _ in range(times):\n        led.on()\n        utime.sleep_ms(on_ms)\n        led.off()\n        utime.sleep_ms(off_ms)\n\nSTATES = [\n    ("GO",   green,  5000, "steady"),\n    ("WARN", yellow, 2000, "blink"),\n    ("STOP", red,    5000, "steady"),\n]\n\nprint("SG-113: Traffic Light Controller v3")\nprint("-" * 40)\n\ncycle = 0\nwhile True:\n    cycle += 1\n    print(f"\\n=== Cycle {cycle} ===")\n    \n    for name, led, duration_ms, mode in STATES:\n        all_off()\n        start = utime.ticks_ms()\n        \n        if mode == "blink":\n            blink(led, 4, on_ms=300, off_ms=200)\n        else:\n            led.on()\n            utime.sleep_ms(duration_ms)\n        \n        elapsed = utime.ticks_diff(utime.ticks_ms(), start)\n        print(f"  {name:5s} | {elapsed:5d}ms | mode={mode}")\n        \n        all_off()\n        utime.sleep_ms(300)  # inter-state gap',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> Always use <code>utime.ticks_diff()</code> to calculate elapsed time &mdash; it handles tick counter wraparound correctly. Never subtract ticks values directly.'
            }
        ],

        testing: '<p>Verify each stage before moving on:</p>' +
                 '<ul>' +
                 '<li><strong>REPL check:</strong> Thonny shell shows <code>&gt;&gt;&gt;</code> prompt and responds to <code>print()</code> commands.</li>' +
                 '<li><strong>Individual LED test:</strong> Each LED lights up individually in the quick test script. All three colors work.</li>' +
                 '<li><strong>State machine:</strong> LEDs cycle green &rarr; yellow &rarr; red &rarr; green continuously. Only one LED is on at a time.</li>' +
                 '<li><strong>Blink effect:</strong> Yellow phase blinks 4 times instead of staying steady.</li>' +
                 '<li><strong>Serial output:</strong> Thonny shell shows cycle count, state names, and timing data.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Pico not recognized as USB drive:</strong> Make sure you are holding BOOTSEL <em>before</em> plugging in the cable. Hold it until the drive appears.</li>' +
                         '<li><strong>Thonny says "Could not find the device":</strong> Check Tools &gt; Options &gt; Interpreter is set to "MicroPython (Raspberry Pi Pico)". Try unplugging and re-plugging the Pico.</li>' +
                         '<li><strong>LED does not light:</strong> (1) Check polarity &mdash; long leg toward GPIO wire. (2) Verify the resistor shares a row with the cathode. (3) Confirm the GND rail is wired to a Pico GND pin.</li>' +
                         '<li><strong>All LEDs are dim:</strong> You may be running them at 3.3V with high-value resistors. 220&#937; is correct for 3.3V. If you used 1K&#937;, LEDs will be very dim.</li>' +
                         '<li><strong>Code does not auto-run on boot:</strong> File must be saved as <code>main.py</code> on the Pico (not on your computer). In Thonny, use File &gt; Save As and select "Raspberry Pi Pico" as the target.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Pedestrian Button</strong> &mdash; Add a push button on GP16. When pressed during the green phase, shorten the remaining green time and transition to yellow immediately. This models a pedestrian crossing request.</p>' +
                    '<p><strong>Challenge 2: Dual Intersection</strong> &mdash; Add three more LEDs on GP10&ndash;GP12 for a cross-street. When street A is green, street B must be red, and vice versa. Include an all-red overlap phase for safety.</p>' +
                    '<p><strong>Challenge 3: Night Mode</strong> &mdash; After 10 full cycles, switch to "night mode" where only the yellow LED blinks at 1Hz. Add a button to toggle between day and night modes.</p>'
    },

    // ========================================================================
    // SG-114: Reaction Time Game
    // ========================================================================
    'sg-114': {
        intro: '<p>How fast are your reflexes? In this build you will wire a simple LED-and-buttons circuit and write a MicroPython reaction time game. The LED lights up after a random delay, and two players race to press their button first. The Pico measures the time difference in milliseconds and declares a winner.</p>' +
               '<p>You will learn digital input reading with pull-down resistors, random number generation, precise time measurement with <code>utime.ticks_ms()</code>, and basic game loop design. This is a great introduction to input handling and event-driven programming on a microcontroller.</p>' +
               '<p>Parts cost is under $5 &mdash; one LED, two buttons, and a few resistors.</p>',

        wiring: '    Raspberry Pi Pico              Breadboard\n' +
                '    +----------------+            +---------------------------+\n' +
                '    |                |            |                           |\n' +
                '    |          GND   |---black----|--[GND rail]              |\n' +
                '    |                |            |                           |\n' +
                '    |          GP15  |---yellow---|--->|--- [220R] ---GND    |\n' +
                '    |                |            |   LED (signal)            |\n' +
                '    |                |            |                           |\n' +
                '    |          GP14  |---blue-----|---[BTN 1]---GND          |\n' +
                '    |                |            |   + 10K pull-down to GND |\n' +
                '    |                |            |                           |\n' +
                '    |          GP13  |---green----|---[BTN 2]---GND          |\n' +
                '    |                |            |   + 10K pull-down to GND |\n' +
                '    +----------------+            +---------------------------+\n' +
                '\n' +
                '    Button Wiring (each):\n' +
                '    GPIO pin ---[wire]--- BTN leg 1\n' +
                '                         BTN leg 2 --- GND rail\n' +
                '    GPIO pin ---[10K resistor]--- GND rail (pull-down)',

        wiringNotes: '<p><strong>Pull-down resistors:</strong> The 10K&#937; resistors connect each GPIO pin to GND. Without them, the pin floats between HIGH and LOW when the button is not pressed, giving false readings. When the button is pressed, it connects the pin to 3.3V (or to GND in active-low configurations). Here we use internal pull-down, but external resistors make the concept visible.</p>' +
                     '<p><strong>Button orientation:</strong> Tactile buttons have 4 legs. The two legs on the same side are always connected. The button bridges the gap across the breadboard center channel. Press = connected, release = open.</p>' +
                     '<p><strong>Alternative:</strong> You can skip external pull-down resistors entirely and use the Pico\'s built-in pull-down: <code>Pin(14, Pin.IN, Pin.PULL_DOWN)</code>. This saves two resistors and simplifies wiring.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg114-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="380" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="360" fill="url(#sg114-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-114 REACTION TIME GAME</text>' +

            '<!-- Pico -->' +
            '<rect x="40" y="80" width="180" height="220" rx="8" fill="#1e2736" stroke="#c51a4a" stroke-width="1.5"/>' +
            '<rect x="40" y="80" width="180" height="24" rx="8" fill="rgba(197,26,74,0.12)"/>' +
            '<text x="130" y="96" text-anchor="middle" fill="#c51a4a" font-size="10" font-weight="600">RASPBERRY PI PICO</text>' +
            '<text x="210" y="140" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="218" cy="137" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="210" y="185" text-anchor="end" fill="#8b949e" font-size="8">GP15</text>' +
            '<circle cx="218" cy="182" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="210" y="225" text-anchor="end" fill="#8b949e" font-size="8">GP14</text>' +
            '<circle cx="218" cy="222" r="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="210" y="265" text-anchor="end" fill="#8b949e" font-size="8">GP13</text>' +
            '<circle cx="218" cy="262" r="3" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +

            '<!-- Breadboard -->' +
            '<rect x="380" y="80" width="300" height="220" rx="8" fill="#1e2736" stroke="#38bdf8" stroke-width="1.5"/>' +
            '<rect x="380" y="80" width="300" height="24" rx="8" fill="rgba(56,189,248,0.12)"/>' +
            '<text x="530" y="96" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="600">BREADBOARD</text>' +
            '<rect x="392" y="112" width="276" height="14" rx="3" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="400" y="122" fill="#60a5fa" font-size="7">- GND RAIL</text>' +

            '<!-- LED -->' +
            '<polygon points="460,160 470,180 450,180" fill="rgba(234,179,8,0.4)" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="460" y="195" text-anchor="middle" fill="#eab308" font-size="7">SIGNAL LED</text>' +
            '<rect x="480" y="167" width="36" height="7" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="498" y="173" text-anchor="middle" fill="#c084fc" font-size="5">220R</text>' +

            '<!-- Button 1 -->' +
            '<rect x="430" y="215" width="50" height="30" rx="4" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.2"/>' +
            '<text x="455" y="234" text-anchor="middle" fill="#3b82f6" font-size="7">BTN P1</text>' +
            '<rect x="490" y="222" width="36" height="7" rx="2" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="508" y="228" text-anchor="middle" fill="#c084fc" font-size="5">10K</text>' +

            '<!-- Button 2 -->' +
            '<rect x="430" y="260" width="50" height="30" rx="4" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1.2"/>' +
            '<text x="455" y="279" text-anchor="middle" fill="#22c55e" font-size="7">BTN P2</text>' +
            '<rect x="490" y="267" width="36" height="7" rx="2" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="508" y="273" text-anchor="middle" fill="#c084fc" font-size="5">10K</text>' +

            '<!-- Wires -->' +
            '<line x1="221" y1="137" x2="392" y2="119" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3"/>' +
            '<line x1="221" y1="182" x2="450" y2="168" stroke="#eab308" stroke-width="1.5"/>' +
            '<line x1="221" y1="222" x2="430" y2="228" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<line x1="221" y1="262" x2="430" y2="273" stroke="#22c55e" stroke-width="1.5"/>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Wire the LED and Buttons',
                content: '<p><strong>Disconnect USB before wiring.</strong> Place the LED and two tactile push buttons on the breadboard. Wire GP15 to the LED anode through a 220&#937; resistor to GND. Wire GP14 and GP13 to one leg of each button, with the other leg going to 3.3V (pin 36). Add 10K&#937; pull-down resistors from GP14 and GP13 to GND.</p>' +
                         '<p><strong>Simpler option:</strong> Skip the external pull-down resistors entirely and use the Pico\'s internal pull-downs in code. Then wire each button between the GPIO pin and 3.3V directly.</p>',
                code: '# Test the wiring — LED and buttons\nfrom machine import Pin\nimport utime\n\nled = Pin(15, Pin.OUT)\nbtn1 = Pin(14, Pin.IN, Pin.PULL_DOWN)\nbtn2 = Pin(13, Pin.IN, Pin.PULL_DOWN)\n\nprint("Press each button to test...")\nprint("Button 1 = GP14, Button 2 = GP13")\n\nwhile True:\n    if btn1.value():\n        led.on()\n        print("Button 1 pressed")\n    elif btn2.value():\n        led.on()\n        print("Button 2 pressed")\n    else:\n        led.off()\n    utime.sleep_ms(50)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> If using internal pull-downs (<code>Pin.PULL_DOWN</code>), wire each button between the GPIO pin and the 3.3V pin (pin 36). Pressing the button pulls the pin HIGH.'
            },
            {
                title: 'Build the Reaction Game Core',
                content: '<p>The game flow: (1) both players ready up, (2) LED turns off for a random delay (1&ndash;5 seconds), (3) LED turns ON, (4) first player to press their button wins, (5) reaction time displayed in milliseconds.</p>',
                code: 'from machine import Pin\nimport utime\nimport urandom\n\nled = Pin(15, Pin.OUT)\nbtn1 = Pin(14, Pin.IN, Pin.PULL_DOWN)\nbtn2 = Pin(13, Pin.IN, Pin.PULL_DOWN)\n\ndef wait_for_release():\n    """Wait until both buttons are released."""\n    while btn1.value() or btn2.value():\n        utime.sleep_ms(10)\n\ndef play_round():\n    print("\\n--- Get Ready ---")\n    led.off()\n    \n    # Random delay 1-5 seconds\n    delay_ms = urandom.randint(1000, 5000)\n    utime.sleep_ms(delay_ms)\n    \n    # Check for early press (cheating)\n    if btn1.value():\n        print("Player 1 pressed too early! False start.")\n        return\n    if btn2.value():\n        print("Player 2 pressed too early! False start.")\n        return\n    \n    # GO!\n    led.on()\n    start = utime.ticks_ms()\n    print(">>> GO! <<<")\n    \n    # Wait for first press\n    while True:\n        if btn1.value():\n            reaction = utime.ticks_diff(utime.ticks_ms(), start)\n            print(f"Player 1 wins! Reaction: {reaction}ms")\n            break\n        if btn2.value():\n            reaction = utime.ticks_diff(utime.ticks_ms(), start)\n            print(f"Player 2 wins! Reaction: {reaction}ms")\n            break\n    \n    led.off()\n    wait_for_release()\n\nprint("SG-114: Reaction Time Game")\nprint("Press any button to start a round...")\n\nwhile True:\n    # Wait for any button press to start\n    if btn1.value() or btn2.value():\n        wait_for_release()\n        utime.sleep(1)\n        play_round()\n    utime.sleep_ms(50)',
                language: 'MicroPython',
                tip: null
            },
            {
                title: 'Add Scorekeeping',
                content: '<p>Track wins across multiple rounds and display a running scoreboard. Add a configurable number of rounds for a complete match.</p>',
                code: 'from machine import Pin\nimport utime\nimport urandom\n\nled = Pin(15, Pin.OUT)\nbtn1 = Pin(14, Pin.IN, Pin.PULL_DOWN)\nbtn2 = Pin(13, Pin.IN, Pin.PULL_DOWN)\n\nROUNDS = 5\nscores = {1: 0, 2: 0}\ntimes = {1: [], 2: []}\n\ndef wait_for_release():\n    while btn1.value() or btn2.value():\n        utime.sleep_ms(10)\n\ndef countdown():\n    """Blink LED 3 times as countdown."""\n    for i in range(3, 0, -1):\n        led.on()\n        print(f"  {i}...")\n        utime.sleep_ms(300)\n        led.off()\n        utime.sleep_ms(300)\n\ndef play_round(round_num):\n    print(f"\\n--- Round {round_num}/{ROUNDS} ---")\n    countdown()\n    \n    # Random delay\n    delay_ms = urandom.randint(1500, 4000)\n    utime.sleep_ms(delay_ms)\n    \n    if btn1.value() or btn2.value():\n        print("  FALSE START! Round does not count.")\n        wait_for_release()\n        return False\n    \n    led.on()\n    start = utime.ticks_ms()\n    \n    while True:\n        if btn1.value():\n            reaction = utime.ticks_diff(utime.ticks_ms(), start)\n            scores[1] += 1\n            times[1].append(reaction)\n            print(f"  P1 wins! {reaction}ms")\n            break\n        if btn2.value():\n            reaction = utime.ticks_diff(utime.ticks_ms(), start)\n            scores[2] += 1\n            times[2].append(reaction)\n            print(f"  P2 wins! {reaction}ms")\n            break\n    \n    led.off()\n    print(f"  Score: P1={scores[1]} | P2={scores[2]}")\n    wait_for_release()\n    return True\n\ndef show_results():\n    print("\\n" + "=" * 40)\n    print("        FINAL RESULTS")\n    print("=" * 40)\n    print(f"  Player 1: {scores[1]} wins", end="")\n    if times[1]:\n        avg = sum(times[1]) // len(times[1])\n        print(f" (avg {avg}ms)")\n    else:\n        print()\n    print(f"  Player 2: {scores[2]} wins", end="")\n    if times[2]:\n        avg = sum(times[2]) // len(times[2])\n        print(f" (avg {avg}ms)")\n    else:\n        print()\n    \n    if scores[1] > scores[2]:\n        print("\\n  >>> PLAYER 1 IS THE CHAMPION <<<")\n    elif scores[2] > scores[1]:\n        print("\\n  >>> PLAYER 2 IS THE CHAMPION <<<")\n    else:\n        print("\\n  >>> TIE GAME <<<")\n    print("=" * 40)\n\nprint("SG-114: Reaction Time Game")\nprint(f"Best of {ROUNDS} rounds")\nprint("Press any button to start the match...")\n\nwhile not (btn1.value() or btn2.value()):\n    utime.sleep_ms(50)\nwait_for_release()\nutime.sleep(1)\n\nround_num = 1\nwhile round_num <= ROUNDS:\n    if play_round(round_num):\n        round_num += 1\n    utime.sleep(1)\n\nshow_results()',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> Average human reaction time to visual stimulus is 200&ndash;250ms. Under 150ms is excellent. Under 100ms means someone is probably guessing (or cheating).'
            },
            {
                title: 'Add Debouncing',
                content: '<p>Mechanical buttons "bounce" &mdash; they make and break contact several times in a few milliseconds when pressed. This can register as multiple presses. Add software debouncing to ensure clean input.</p>',
                code: '# Debounce utility — add this to your game code\n\ndef debounced_read(pin, stable_ms=20):\n    """\n    Return True only if the pin reads HIGH\n    for at least stable_ms milliseconds continuously.\n    """\n    if not pin.value():\n        return False\n    start = utime.ticks_ms()\n    while utime.ticks_diff(utime.ticks_ms(), start) < stable_ms:\n        if not pin.value():\n            return False\n    return True\n\n# Replace raw btn1.value() checks with debounced_read(btn1)\n# Example in the main game loop:\n#   if debounced_read(btn1):\n#       reaction = utime.ticks_diff(utime.ticks_ms(), start)\n#       ...\n\n# Note: For the reaction game, debounce adds 20ms to the\n# measured time. You can subtract the debounce delay from\n# the reported reaction time for accuracy:\n#   reported_time = reaction - stable_ms',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> In the reaction game context, 20ms of debounce delay is a reasonable tradeoff. For timing-critical applications, you can reduce it to 5&ndash;10ms or use hardware debouncing with a capacitor.'
            }
        ],

        testing: '<p>Verify each stage:</p>' +
                 '<ul>' +
                 '<li><strong>Button test:</strong> Both buttons register presses in the test script. LED lights up on press, turns off on release.</li>' +
                 '<li><strong>False start detection:</strong> Press a button during the random delay &mdash; the game should report a false start.</li>' +
                 '<li><strong>Reaction timing:</strong> Reaction times should be roughly 150&ndash;400ms for normal presses. If you see 0&ndash;10ms, something is wired wrong.</li>' +
                 '<li><strong>Scoreboard:</strong> After all rounds, final results show correct win counts and averages.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Button always reads HIGH:</strong> Missing or broken pull-down resistor. Or if using internal pull-down, check the button wires to 3.3V (not to GND).</li>' +
                         '<li><strong>Button never reads HIGH:</strong> Button may not be bridging the breadboard center channel correctly. Push it in firmly. Or check that you are reading the right GPIO pin number.</li>' +
                         '<li><strong>Reaction time shows 0ms:</strong> Both buttons are reading HIGH constantly (floating pins). Add pull-down resistors or use <code>Pin.PULL_DOWN</code>.</li>' +
                         '<li><strong>Game registers multiple presses:</strong> Button bounce. Add the debounce function from Step 4.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Speed Tiers</strong> &mdash; After each round, print a rating based on reaction time: "Lightning" (&lt;150ms), "Fast" (150&ndash;250ms), "Average" (250&ndash;400ms), "Slow" (&gt;400ms).</p>' +
                    '<p><strong>Challenge 2: Random LED Color</strong> &mdash; Add a red and green LED. Only react to the green LED &mdash; pressing on red is a penalty. This trains selective reaction.</p>' +
                    '<p><strong>Challenge 3: Solo Mode</strong> &mdash; Single-player mode that runs 10 rounds and calculates average, best, and worst reaction times. Save high scores to the Pico\'s filesystem.</p>'
    },

    // ========================================================================
    // SG-115: PIR Motion Alarm
    // ========================================================================
    'sg-115': {
        intro: '<p>Motion detection is the backbone of physical security systems &mdash; from home alarms to corporate intrusion detection. In this build you will wire an HC-SR501 Passive Infrared (PIR) sensor to a Raspberry Pi Pico and build a motion-triggered alarm with visual and audio alerts.</p>' +
               '<p>This project introduces <strong>hardware interrupts</strong> &mdash; a critical concept where the processor responds to an external event immediately instead of constantly checking (polling) a pin. You will also build an arm/disarm state machine with configurable cooldown periods, mimicking real security panel behavior.</p>' +
               '<p>The HC-SR501 PIR sensor costs about $2 and detects infrared radiation changes caused by warm bodies moving through its field of view (up to 7 meters, 120-degree cone).</p>',

        wiring: '    Raspberry Pi Pico              Breadboard\n' +
                '    +----------------+            +-------------------------------+\n' +
                '    |                |            |                               |\n' +
                '    |     3V3 (OUT)  |---red------|---[PIR VCC]                  |\n' +
                '    |          GND   |---black----|---[PIR GND]---[GND rail]     |\n' +
                '    |          GP14  |---yellow---|---[PIR OUT (data)]           |\n' +
                '    |                |            |                               |\n' +
                '    |          GP15  |---red------|---[LED anode]                |\n' +
                '    |                |            |   [LED cathode]--220R--GND   |\n' +
                '    |                |            |                               |\n' +
                '    |          GP13  |---orange---|---[Buzzer +]                 |\n' +
                '    |                |            |   [Buzzer -]------GND        |\n' +
                '    +----------------+            +-------------------------------+\n' +
                '\n' +
                '    PIR HC-SR501 Pinout (looking at the back):\n' +
                '    [VCC]  [OUT]  [GND]\n' +
                '     3.3V   GP14   GND\n' +
                '    Adjust sensitivity + delay pots to minimum for testing.',

        wiringNotes: '<p><strong>PIR sensor:</strong> The HC-SR501 has three pins (VCC, OUT, GND) and two orange potentiometers on the back. The left pot adjusts <strong>sensitivity</strong> (detection range), the right pot adjusts <strong>time delay</strong> (how long OUT stays HIGH after detection). Turn both to minimum (fully counter-clockwise) for testing.</p>' +
                     '<p><strong>Important:</strong> Some HC-SR501 modules are designed for 5V&ndash;20V input. They will work with the Pico\'s 3.3V output but the detection range may be reduced. If detection is unreliable, power the PIR from VBUS (5V USB power) instead of 3V3, but keep the data line on GP14 &mdash; the output is still 3.3V compatible.</p>' +
                     '<p><strong>Buzzer:</strong> Use an <em>active</em> buzzer (has a built-in oscillator &mdash; just apply voltage and it beeps). A passive buzzer requires a PWM signal to produce sound.</p>' +
                     '<p><strong>Warm-up:</strong> The PIR sensor needs 30&ndash;60 seconds to stabilize after power-on. During this time it may trigger false alarms.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg115-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg115-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-115 PIR MOTION ALARM</text>' +

            '<!-- Pico -->' +
            '<rect x="40" y="70" width="180" height="260" rx="8" fill="#1e2736" stroke="#c51a4a" stroke-width="1.5"/>' +
            '<rect x="40" y="70" width="180" height="24" rx="8" fill="rgba(197,26,74,0.12)"/>' +
            '<text x="130" y="86" text-anchor="middle" fill="#c51a4a" font-size="10" font-weight="600">RASPBERRY PI PICO</text>' +
            '<text x="210" y="120" text-anchor="end" fill="#8b949e" font-size="8">3V3</text>' +
            '<circle cx="218" cy="117" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="210" y="150" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="218" cy="147" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="210" y="195" text-anchor="end" fill="#8b949e" font-size="8">GP14</text>' +
            '<circle cx="218" cy="192" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="210" y="240" text-anchor="end" fill="#8b949e" font-size="8">GP15</text>' +
            '<circle cx="218" cy="237" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="210" y="285" text-anchor="end" fill="#8b949e" font-size="8">GP13</text>' +
            '<circle cx="218" cy="282" r="3" fill="#1a1f2b" stroke="#fb923c" stroke-width="1"/>' +

            '<!-- PIR Sensor -->' +
            '<rect x="380" y="80" width="140" height="100" rx="10" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
            '<circle cx="450" cy="115" r="28" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.3)" stroke-width="1"/>' +
            '<circle cx="450" cy="115" r="15" fill="rgba(234,179,8,0.12)" stroke="rgba(234,179,8,0.4)" stroke-width="0.8"/>' +
            '<text x="450" y="118" text-anchor="middle" fill="#eab308" font-size="7">PIR</text>' +
            '<text x="450" y="164" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">HC-SR501</text>' +
            '<text x="393" y="178" fill="#8b949e" font-size="6">VCC</text>' +
            '<text x="440" y="178" fill="#8b949e" font-size="6">OUT</text>' +
            '<text x="492" y="178" fill="#8b949e" font-size="6">GND</text>' +

            '<!-- Alert LED -->' +
            '<polygon points="450,225 460,245 440,245" fill="rgba(239,68,68,0.4)" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="450" y="260" text-anchor="middle" fill="#ef4444" font-size="7">ALERT LED</text>' +
            '<rect x="468" y="232" width="36" height="7" rx="2" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="486" y="238" text-anchor="middle" fill="#c084fc" font-size="5">220R</text>' +

            '<!-- Buzzer -->' +
            '<circle cx="450" cy="310" r="22" fill="rgba(251,146,60,0.1)" stroke="#fb923c" stroke-width="1.5"/>' +
            '<text x="450" y="313" text-anchor="middle" fill="#fb923c" font-size="7">BUZZER</text>' +
            '<text x="450" y="345" text-anchor="middle" fill="#8b949e" font-size="6">Active 3.3V</text>' +

            '<!-- Wires -->' +
            '<line x1="221" y1="117" x2="400" y2="170" stroke="#ef4444" stroke-width="1.5"/>' +
            '<line x1="221" y1="147" x2="500" y2="170" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3"/>' +
            '<line x1="221" y1="192" x2="450" y2="170" stroke="#eab308" stroke-width="1.5"/>' +
            '<line x1="221" y1="237" x2="440" y2="225" stroke="#ef4444" stroke-width="1.5"/>' +
            '<line x1="221" y1="282" x2="430" y2="295" stroke="#fb923c" stroke-width="1.5"/>' +

            '<!-- Detection cone -->' +
            '<path d="M 530 100 L 640 60 L 640 170 Z" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5" stroke-dasharray="4,2"/>' +
            '<text x="590" y="100" text-anchor="middle" fill="rgba(234,179,8,0.4)" font-size="7">DETECTION</text>' +
            '<text x="590" y="112" text-anchor="middle" fill="rgba(234,179,8,0.4)" font-size="7">CONE ~120&#176;</text>' +
            '<text x="590" y="132" text-anchor="middle" fill="rgba(234,179,8,0.3)" font-size="6">up to 7m</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Wire the PIR Sensor and Test',
                content: '<p><strong>Disconnect USB before wiring.</strong> The HC-SR501 has three pins on the bottom. Looking at the back (with the potentiometers visible): VCC is left, OUT is center, GND is right. Wire VCC to 3V3, GND to GND, and OUT to GP14.</p>' +
                         '<p>Turn both potentiometers fully counter-clockwise (minimum sensitivity, minimum delay). Reconnect USB and let the sensor warm up for 60 seconds before testing.</p>',
                code: '# Basic PIR test — polling mode\nfrom machine import Pin\nimport utime\n\npir = Pin(14, Pin.IN)\nled = Pin(15, Pin.OUT)\n\nprint("SG-115: PIR Sensor Test")\nprint("Warming up (30s)...")\nutime.sleep(30)\nprint("Ready. Walk in front of the sensor.")\n\nwhile True:\n    if pir.value():\n        led.on()\n        print("MOTION DETECTED!")\n    else:\n        led.off()\n    utime.sleep_ms(100)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> If the sensor triggers constantly, it is still warming up. Wait a full 60 seconds with no movement nearby. The sensor responds to <em>changes</em> in infrared &mdash; a person sitting still will eventually stop triggering it.'
            },
            {
                title: 'Switch to Hardware Interrupts',
                content: '<p>Polling (checking the pin in a loop) works but wastes CPU cycles. <strong>Hardware interrupts</strong> let the RP2040 processor respond to a pin change immediately, without constant checking. The interrupt handler (callback function) runs as soon as the PIR output goes HIGH.</p>' +
                         '<p>This is how real security systems work &mdash; the processor can sleep or do other work until an event occurs.</p>',
                code: 'from machine import Pin\nimport utime\n\npir = Pin(14, Pin.IN)\nled = Pin(15, Pin.OUT)\nbuzzer = Pin(13, Pin.OUT)\n\nmotion_detected = False\n\ndef pir_handler(pin):\n    """Interrupt handler — called on rising edge of PIR output."""\n    global motion_detected\n    motion_detected = True\n\n# Attach interrupt — trigger on rising edge (LOW -> HIGH)\npir.irq(trigger=Pin.IRQ_RISING, handler=pir_handler)\n\nprint("SG-115: PIR Interrupt Mode")\nprint("Warming up (30s)...")\nutime.sleep(30)\nprint("ARMED. Monitoring for motion...")\n\nwhile True:\n    if motion_detected:\n        print(f"[{utime.ticks_ms()}] ALERT: Motion detected!")\n        \n        # Alarm sequence\n        for _ in range(5):\n            led.on()\n            buzzer.on()\n            utime.sleep_ms(200)\n            led.off()\n            buzzer.off()\n            utime.sleep_ms(200)\n        \n        motion_detected = False\n        print("  Cooldown 3s...")\n        utime.sleep(3)\n        print("  Re-armed.")\n    \n    utime.sleep_ms(50)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> Keep interrupt handlers <em>very short</em>. Never use <code>print()</code>, <code>sleep()</code>, or memory allocation inside an interrupt handler. Set a flag (like <code>motion_detected</code>) and handle the response in the main loop.'
            },
            {
                title: 'Build the Arm/Disarm State Machine',
                content: '<p>A real alarm system has states: <strong>DISARMED</strong> (no alerts), <strong>ARMING</strong> (countdown to arm), <strong>ARMED</strong> (monitoring), and <strong>TRIGGERED</strong> (alarm active). Add a button to toggle between armed and disarmed, with an arming delay so you can leave the room.</p>',
                code: 'from machine import Pin\nimport utime\n\npir = Pin(14, Pin.IN)\nled = Pin(15, Pin.OUT)\nbuzzer = Pin(13, Pin.OUT)\n\n# States\nDISARMED = 0\nARMING = 1\nARMED = 2\nTRIGGERED = 3\n\nstate = DISARMED\nstate_names = ["DISARMED", "ARMING", "ARMED", "TRIGGERED"]\nmotion_flag = False\nARM_DELAY = 10       # seconds to arm\nALARM_DURATION = 10  # seconds alarm sounds\nCOOLDOWN = 5         # seconds after alarm before re-arm\n\ndef pir_handler(pin):\n    global motion_flag\n    motion_flag = True\n\npir.irq(trigger=Pin.IRQ_RISING, handler=pir_handler)\n\ndef set_state(new_state):\n    global state, motion_flag\n    state = new_state\n    motion_flag = False\n    print(f"\\n[STATE] {state_names[state]}")\n\ndef alarm_sequence():\n    """Flash LED and sound buzzer."""\n    start = utime.ticks_ms()\n    while utime.ticks_diff(utime.ticks_ms(), start) < ALARM_DURATION * 1000:\n        led.on()\n        buzzer.on()\n        utime.sleep_ms(150)\n        led.off()\n        buzzer.off()\n        utime.sleep_ms(150)\n\nprint("SG-115: PIR Motion Alarm System")\nprint("Warming up PIR sensor (30s)...")\nutime.sleep(30)\nprint("System ready.")\nprint("Type arm() to arm, disarm() to disarm in REPL")\nprint("Or modify code to use a physical button\\n")\n\n# For REPL control:\ndef arm():\n    if state == DISARMED:\n        set_state(ARMING)\n\ndef disarm():\n    global state\n    led.off()\n    buzzer.off()\n    set_state(DISARMED)\n\n# Auto-arm for demo\nset_state(ARMING)\n\nwhile True:\n    if state == ARMING:\n        print(f"  Arming in {ARM_DELAY}s... leave the room.")\n        for i in range(ARM_DELAY, 0, -1):\n            led.on()\n            utime.sleep_ms(100)\n            led.off()\n            utime.sleep_ms(900)\n            print(f"  {i}...")\n        set_state(ARMED)\n    \n    elif state == ARMED:\n        if motion_flag:\n            print("  !!! MOTION DETECTED !!!")\n            set_state(TRIGGERED)\n        utime.sleep_ms(50)\n    \n    elif state == TRIGGERED:\n        alarm_sequence()\n        print(f"  Cooldown {COOLDOWN}s...")\n        utime.sleep(COOLDOWN)\n        set_state(ARMED)\n    \n    elif state == DISARMED:\n        utime.sleep_ms(200)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> The arming countdown blinks the LED once per second (100ms on, 900ms off). This visual feedback tells you the system is in arming mode. The blink rate increases in many commercial systems as arming completes.'
            },
            {
                title: 'Add Event Logging',
                content: '<p>Log every motion event with a timestamp to the serial output. This creates an audit trail &mdash; a fundamental concept in security systems. Each log entry includes the event number, elapsed time since boot, and the state transition.</p>',
                code: '# Add this to the main alarm system code\n# Replace the ARMED and TRIGGERED state handlers\n\nevent_log = []\nevent_count = 0\n\ndef log_event(event_type, detail=""):\n    global event_count\n    event_count += 1\n    timestamp = utime.ticks_ms() // 1000  # seconds since boot\n    entry = {\n        "id": event_count,\n        "time": timestamp,\n        "type": event_type,\n        "detail": detail\n    }\n    event_log.append(entry)\n    \n    mins = timestamp // 60\n    secs = timestamp % 60\n    print(f"  [{event_count:03d}] {mins:02d}:{secs:02d} | {event_type} | {detail}")\n\ndef print_log_summary():\n    """Print all logged events."""\n    print("\\n" + "=" * 50)\n    print("  EVENT LOG SUMMARY")\n    print("=" * 50)\n    motion_events = [e for e in event_log if e["type"] == "MOTION"]\n    print(f"  Total events: {len(event_log)}")\n    print(f"  Motion alerts: {len(motion_events)}")\n    if motion_events:\n        first = motion_events[0]["time"]\n        last = motion_events[-1]["time"]\n        print(f"  First detection: {first // 60}m {first % 60}s")\n        print(f"  Last detection: {last // 60}m {last % 60}s")\n    print("=" * 50)\n\n# Usage in the state machine:\n# When state changes to ARMED:\n#   log_event("STATE", "System armed")\n# When motion detected:\n#   log_event("MOTION", "PIR trigger on GP14")\n# When alarm fires:\n#   log_event("ALARM", f"Duration {ALARM_DURATION}s")\n# Call print_log_summary() from REPL to see all events',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> The Pico does not have a real-time clock (RTC). Timestamps are relative to boot time. For real deployments, you would sync time via NTP on a Pico W or add an external RTC module (DS3231).'
            }
        ],

        testing: '<p>Verify each stage:</p>' +
                 '<ul>' +
                 '<li><strong>PIR warm-up:</strong> After power-on, wait 60 seconds. The PIR output should be LOW (0) when no motion.</li>' +
                 '<li><strong>Detection:</strong> Walk in front of the sensor. The LED should light and the buzzer should sound.</li>' +
                 '<li><strong>Interrupt mode:</strong> The detection should work even if the main loop is doing other work. It responds to the rising edge, not polling.</li>' +
                 '<li><strong>State transitions:</strong> DISARMED &rarr; ARMING (countdown) &rarr; ARMED &rarr; TRIGGERED (on motion) &rarr; ARMED (after cooldown).</li>' +
                 '<li><strong>Event log:</strong> Serial output shows numbered, timestamped events for every state change and motion detection.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>PIR triggers constantly:</strong> Sensor is still warming up, or sensitivity potentiometer is too high. Turn sensitivity down and wait 60 seconds.</li>' +
                         '<li><strong>PIR never triggers:</strong> (1) Check wiring &mdash; VCC to 3V3, OUT to GP14, GND to GND. (2) Try powering from VBUS (5V) instead of 3V3. (3) Walk slowly in front of the sensor &mdash; it detects <em>movement</em>, not presence.</li>' +
                         '<li><strong>Buzzer does not sound:</strong> Verify it is an <em>active</em> buzzer. Apply 3.3V directly &mdash; it should beep immediately. If not, it is a passive buzzer and needs PWM.</li>' +
                         '<li><strong>Interrupt fires multiple times:</strong> The PIR output stays HIGH for a period (set by the delay potentiometer). Your cooldown timer should be longer than this period.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-Zone</strong> &mdash; Add a second PIR sensor on GP16. Log which zone detected motion. Display different blink patterns for each zone.</p>' +
                    '<p><strong>Challenge 2: Silent Alarm</strong> &mdash; Instead of a buzzer, blink the LED in a specific pattern. Useful for stealth monitoring. Log events to a file on the Pico\'s filesystem.</p>' +
                    '<p><strong>Challenge 3: Timed Arm/Disarm</strong> &mdash; Add a schedule that arms the system at a set time and disarms it later. Use the Pico\'s internal timer to simulate a 24-hour clock cycle.</p>'
    },

    // ========================================================================
    // SG-116: Temperature Data Logger
    // ========================================================================
    'sg-116': {
        intro: '<p>Data logging is a core skill in IoT and embedded systems. In this build you will read temperature from two sources &mdash; the Pico\'s built-in temperature sensor and an external DS18B20 waterproof probe &mdash; then log the data as CSV files to an SD card.</p>' +
               '<p>You will learn ADC (analog-to-digital conversion) for the internal sensor, the 1-Wire protocol for the DS18B20, SPI communication for the SD card, and CSV file formatting. The result is a standalone data logger that can run on battery power and record temperature data for hours or days.</p>' +
               '<p>Total parts cost is about $10 &mdash; a DS18B20 waterproof probe (~$3), an SPI MicroSD breakout (~$3), and a MicroSD card (~$4).</p>',

        wiring: '    Raspberry Pi Pico              Breadboard\n' +
                '    +----------------+            +-------------------------------+\n' +
                '    |                |            |                               |\n' +
                '    |     3V3 (OUT)  |---red------|---[DS18B20 VCC (red wire)]   |\n' +
                '    |          GND   |---black----|---[DS18B20 GND (black wire)] |\n' +
                '    |          GP16  |---yellow---|---[DS18B20 DATA (yellow)]    |\n' +
                '    |                |            |   + 4.7K pull-up to 3V3      |\n' +
                '    |                |            |                               |\n' +
                '    |   SD Card Module (SPI):     |                               |\n' +
                '    |     3V3 (OUT)  |---red------|---[SD VCC]                   |\n' +
                '    |          GND   |---black----|---[SD GND]                   |\n' +
                '    |          GP10  |---orange---|---[SD SCK]                   |\n' +
                '    |          GP11  |---green----|---[SD MOSI]                  |\n' +
                '    |          GP12  |---blue-----|---[SD MISO]                  |\n' +
                '    |          GP13  |---white----|---[SD CS]                    |\n' +
                '    +----------------+            +-------------------------------+\n' +
                '\n' +
                '    DS18B20 Wire Colors (waterproof probe):\n' +
                '    Red = VCC (3.3V)  |  Black = GND  |  Yellow = Data\n' +
                '    Pull-up: 4.7K resistor between Data and VCC (required)',

        wiringNotes: '<p><strong>DS18B20 pull-up:</strong> The 1-Wire protocol requires a 4.7K&#937; pull-up resistor between the data line and VCC (3.3V). Without it, communication will fail completely. This resistor is <em>not optional</em>.</p>' +
                     '<p><strong>SD card module:</strong> Use an SPI-based MicroSD breakout (not SDIO). The module has a built-in voltage regulator and level shifter. Connect SCK, MOSI, MISO, CS to the specified GPIO pins.</p>' +
                     '<p><strong>Internal sensor:</strong> The Pico\'s RP2040 has a built-in temperature sensor connected to ADC channel 4. No external wiring needed &mdash; it reads the die temperature, which is typically 2&ndash;5&#176;C above ambient due to chip self-heating.</p>' +
                     '<p><strong>SD card:</strong> Format the MicroSD card as FAT32 before use. Most new cards come pre-formatted. The Pico can read/write FAT16 and FAT32.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg116-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg116-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-116 TEMPERATURE DATA LOGGER</text>' +

            '<!-- Pico -->' +
            '<rect x="40" y="60" width="180" height="300" rx="8" fill="#1e2736" stroke="#c51a4a" stroke-width="1.5"/>' +
            '<rect x="40" y="60" width="180" height="24" rx="8" fill="rgba(197,26,74,0.12)"/>' +
            '<text x="130" y="76" text-anchor="middle" fill="#c51a4a" font-size="10" font-weight="600">RASPBERRY PI PICO</text>' +
            '<text x="210" y="108" text-anchor="end" fill="#8b949e" font-size="7">3V3</text>' +
            '<text x="210" y="133" text-anchor="end" fill="#8b949e" font-size="7">GND</text>' +
            '<text x="210" y="163" text-anchor="end" fill="#8b949e" font-size="7">GP16</text>' +
            '<text x="210" y="208" text-anchor="end" fill="#8b949e" font-size="7">GP10 SCK</text>' +
            '<text x="210" y="233" text-anchor="end" fill="#8b949e" font-size="7">GP11 MOSI</text>' +
            '<text x="210" y="258" text-anchor="end" fill="#8b949e" font-size="7">GP12 MISO</text>' +
            '<text x="210" y="283" text-anchor="end" fill="#8b949e" font-size="7">GP13 CS</text>' +
            '<text x="130" y="330" text-anchor="middle" fill="rgba(197,26,74,0.4)" font-size="7">ADC4 = internal</text>' +
            '<text x="130" y="342" text-anchor="middle" fill="rgba(197,26,74,0.4)" font-size="7">temp sensor</text>' +

            '<!-- DS18B20 -->' +
            '<rect x="380" y="65" width="140" height="85" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="450" y="85" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">DS18B20</text>' +
            '<text x="450" y="100" text-anchor="middle" fill="#8b949e" font-size="7">Waterproof Probe</text>' +
            '<rect x="395" y="110" width="30" height="12" rx="2" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="0.5"/>' +
            '<text x="410" y="119" text-anchor="middle" fill="#ef4444" font-size="6">VCC</text>' +
            '<rect x="435" y="110" width="30" height="12" rx="2" fill="rgba(234,179,8,0.15)" stroke="#eab308" stroke-width="0.5"/>' +
            '<text x="450" y="119" text-anchor="middle" fill="#eab308" font-size="6">DATA</text>' +
            '<rect x="475" y="110" width="30" height="12" rx="2" fill="rgba(148,163,184,0.15)" stroke="#8b949e" stroke-width="0.5"/>' +
            '<text x="490" y="119" text-anchor="middle" fill="#8b949e" font-size="6">GND</text>' +
            '<!-- Pull-up resistor -->' +
            '<rect x="540" y="85" width="40" height="14" rx="2" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="560" y="94" text-anchor="middle" fill="#c084fc" font-size="6">4.7K</text>' +
            '<text x="560" y="110" text-anchor="middle" fill="#8b949e" font-size="5">pull-up</text>' +

            '<!-- SD Card Module -->' +
            '<rect x="380" y="190" width="160" height="120" rx="8" fill="#1e2736" stroke="#38bdf8" stroke-width="1.5"/>' +
            '<text x="460" y="210" text-anchor="middle" fill="#38bdf8" font-size="9" font-weight="600">SD CARD MODULE</text>' +
            '<text x="460" y="225" text-anchor="middle" fill="#8b949e" font-size="7">SPI MicroSD Breakout</text>' +
            '<rect x="420" y="240" width="80" height="40" rx="4" fill="rgba(56,189,248,0.06)" stroke="rgba(56,189,248,0.2)" stroke-width="0.5"/>' +
            '<text x="460" y="256" text-anchor="middle" fill="#38bdf8" font-size="6">MicroSD</text>' +
            '<text x="460" y="268" text-anchor="middle" fill="#8b949e" font-size="5">FAT32</text>' +

            '<!-- Wires -->' +
            '<line x1="221" y1="105" x2="395" y2="116" stroke="#ef4444" stroke-width="1.2"/>' +
            '<line x1="221" y1="130" x2="475" y2="116" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="5,3"/>' +
            '<line x1="221" y1="160" x2="435" y2="116" stroke="#eab308" stroke-width="1.2"/>' +
            '<line x1="221" y1="205" x2="380" y2="245" stroke="#fb923c" stroke-width="1.2"/>' +
            '<line x1="221" y1="230" x2="380" y2="255" stroke="#22c55e" stroke-width="1.2"/>' +
            '<line x1="221" y1="255" x2="380" y2="265" stroke="#3b82f6" stroke-width="1.2"/>' +
            '<line x1="221" y1="280" x2="380" y2="275" stroke="#e2e8f0" stroke-width="1.2"/>' +

            '<!-- CSV Preview -->' +
            '<rect x="560" y="190" width="140" height="120" rx="6" fill="rgba(197,26,74,0.04)" stroke="rgba(197,26,74,0.15)" stroke-width="0.5"/>' +
            '<text x="630" y="208" text-anchor="middle" fill="#c51a4a" font-size="7" font-weight="600">CSV OUTPUT</text>' +
            '<text x="570" y="225" fill="#8b949e" font-size="6">time,internal,ds18b20</text>' +
            '<text x="570" y="238" fill="#4ade80" font-size="6">0,26.3,24.1</text>' +
            '<text x="570" y="251" fill="#4ade80" font-size="6">30,26.4,24.2</text>' +
            '<text x="570" y="264" fill="#4ade80" font-size="6">60,26.5,24.3</text>' +
            '<text x="570" y="277" fill="#4ade80" font-size="6">90,26.4,24.2</text>' +
            '<text x="570" y="295" fill="#555" font-size="5">30s intervals</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Read the Internal Temperature Sensor',
                content: '<p>The RP2040 has a built-in temperature sensor connected to ADC channel 4. It reads the chip die temperature, which runs a few degrees above ambient. This is your first sensor &mdash; no wiring needed.</p>' +
                         '<p>The ADC returns a 16-bit value (0&ndash;65535) that maps to a voltage (0&ndash;3.3V). The temperature sensor has a known transfer function: <code>T = 27 - (V - 0.706) / 0.001721</code>.</p>',
                code: 'from machine import ADC\nimport utime\n\n# ADC channel 4 = internal temperature sensor\ntemp_sensor = ADC(4)\n\ndef read_internal_temp():\n    """Read RP2040 die temperature in Celsius."""\n    raw = temp_sensor.read_u16()\n    voltage = raw * 3.3 / 65535\n    temp_c = 27 - (voltage - 0.706) / 0.001721\n    return round(temp_c, 1)\n\nprint("SG-116: Internal Temp Sensor Test")\nprint("-" * 35)\n\nfor i in range(10):\n    temp = read_internal_temp()\n    print(f"  Reading {i+1}: {temp}C")\n    utime.sleep(2)\n\nprint("\\nNote: Die temp is typically 2-5C above ambient.")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> The internal sensor is useful for monitoring board health but is not accurate for ambient temperature. That is why we add an external DS18B20.'
            },
            {
                title: 'Wire and Read the DS18B20',
                content: '<p><strong>Disconnect USB.</strong> Wire the DS18B20: red to 3V3, black to GND, yellow (data) to GP16. Add a 4.7K&#937; pull-up resistor between the data line and 3V3. This resistor is required for the 1-Wire protocol to function.</p>' +
                         '<p>MicroPython includes built-in <code>onewire</code> and <code>ds18x20</code> modules that handle the 1-Wire protocol for you.</p>',
                code: 'from machine import Pin\nimport onewire\nimport ds18x20\nimport utime\n\n# Set up 1-Wire bus on GP16\now_pin = Pin(16)\now_bus = onewire.OneWire(ow_pin)\nds = ds18x20.DS18X20(ow_bus)\n\n# Scan for devices on the bus\nroms = ds.scan()\nprint(f"Found {len(roms)} DS18B20 device(s)")\nfor rom in roms:\n    print(f"  ROM: {rom.hex()}")\n\nif not roms:\n    print("ERROR: No DS18B20 found!")\n    print("Check wiring: data to GP16, 4.7K pull-up to 3V3")\nelse:\n    print("\\nReading temperature...")\n    for i in range(10):\n        ds.convert_temp()     # Start conversion\n        utime.sleep_ms(750)   # DS18B20 needs 750ms for 12-bit\n        \n        for rom in roms:\n            temp = ds.read_temp(rom)\n            print(f"  Reading {i+1}: {temp:.1f}C")\n        utime.sleep(2)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> The DS18B20 needs 750ms to complete a 12-bit temperature conversion. If you read too early, you get stale data. The <code>convert_temp()</code> call starts the conversion, then you wait before reading.'
            },
            {
                title: 'Set Up SD Card Storage',
                content: '<p><strong>Disconnect USB.</strong> Wire the MicroSD module via SPI: SCK to GP10, MOSI to GP11, MISO to GP12, CS to GP13, VCC to 3V3, GND to GND.</p>' +
                         '<p>You need to copy the <code>sdcard.py</code> driver to the Pico. Download it from the <a href="https://github.com/micropython/micropython-lib/blob/master/micropython/drivers/storage/sdcard/sdcard.py" target="_blank" rel="noopener">micropython-lib repository</a> and save it to the Pico using Thonny (File &gt; Save As &gt; Raspberry Pi Pico).</p>',
                code: '# First: save sdcard.py to the Pico via Thonny\n# Then run this test:\n\nfrom machine import Pin, SPI\nimport sdcard\nimport os\n\n# Set up SPI bus\nspi = SPI(1, baudrate=1_000_000,\n          polarity=0, phase=0,\n          sck=Pin(10), mosi=Pin(11), miso=Pin(12))\ncs = Pin(13, Pin.OUT)\n\n# Mount SD card\nsd = sdcard.SDCard(spi, cs)\nos.mount(sd, "/sd")\n\n# List files on the card\nprint("SD card mounted!")\nprint("Files:", os.listdir("/sd"))\n\n# Write a test file\nwith open("/sd/test.txt", "w") as f:\n    f.write("Hello from Pico!\\n")\n    f.write("SD card is working.\\n")\n\n# Read it back\nwith open("/sd/test.txt", "r") as f:\n    print("\\nFile contents:")\n    print(f.read())\n\n# Check free space\nstat = os.statvfs("/sd")\nfree_bytes = stat[0] * stat[3]\nprint(f"Free space: {free_bytes // 1024}KB")\n\n# Unmount when done\nos.umount("/sd")\nprint("SD card unmounted.")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> If mounting fails, check: (1) SD card is FAT32 formatted, (2) SPI wires are correct (SCK, MOSI, MISO are easy to mix up), (3) <code>sdcard.py</code> is saved on the Pico (not your computer).'
            },
            {
                title: 'Build the Data Logger',
                content: '<p>Combine both sensors and SD card into a continuous data logger. Readings are taken at configurable intervals and written as CSV rows to the SD card. The logger creates a new file for each session.</p>',
                code: 'from machine import Pin, SPI, ADC\nimport onewire\nimport ds18x20\nimport sdcard\nimport os\nimport utime\n\n# --- Configuration ---\nLOG_INTERVAL = 30   # seconds between readings\nFILENAME = "/sd/templog.csv"\n\n# --- Internal temp sensor ---\ntemp_adc = ADC(4)\n\ndef read_internal():\n    raw = temp_adc.read_u16()\n    voltage = raw * 3.3 / 65535\n    return round(27 - (voltage - 0.706) / 0.001721, 1)\n\n# --- DS18B20 ---\now_bus = onewire.OneWire(Pin(16))\nds = ds18x20.DS18X20(ow_bus)\nroms = ds.scan()\nprint(f"DS18B20 devices found: {len(roms)}")\n\ndef read_ds18b20():\n    if not roms:\n        return None\n    ds.convert_temp()\n    utime.sleep_ms(750)\n    return round(ds.read_temp(roms[0]), 1)\n\n# --- SD Card ---\nspi = SPI(1, baudrate=1_000_000,\n          polarity=0, phase=0,\n          sck=Pin(10), mosi=Pin(11), miso=Pin(12))\ncs = Pin(13, Pin.OUT)\nsd_card = sdcard.SDCard(spi, cs)\nos.mount(sd_card, "/sd")\nprint("SD card mounted.")\n\n# Create CSV with header if file is new\ntry:\n    os.stat(FILENAME)\n    print(f"Appending to {FILENAME}")\nexcept OSError:\n    with open(FILENAME, "w") as f:\n        f.write("elapsed_s,internal_c,ds18b20_c\\n")\n    print(f"Created {FILENAME}")\n\n# --- Logging Loop ---\nprint(f"\\nSG-116: Temperature Data Logger")\nprint(f"Interval: {LOG_INTERVAL}s")\nprint(f"File: {FILENAME}")\nprint("-" * 40)\n\nstart_time = utime.ticks_ms()\nreading_num = 0\n\ntry:\n    while True:\n        elapsed_s = utime.ticks_diff(utime.ticks_ms(), start_time) // 1000\n        internal = read_internal()\n        external = read_ds18b20()\n        \n        reading_num += 1\n        ext_str = f"{external}" if external is not None else "N/A"\n        \n        # Write to SD card\n        with open(FILENAME, "a") as f:\n            f.write(f"{elapsed_s},{internal},{ext_str}\\n")\n        \n        # Print to serial\n        print(f"  [{reading_num:04d}] {elapsed_s:6d}s | "\n              f"Internal: {internal}C | "\n              f"DS18B20: {ext_str}C")\n        \n        utime.sleep(LOG_INTERVAL)\n\nexcept KeyboardInterrupt:\n    print("\\nStopping logger...")\n    os.umount("/sd")\n    print("SD card unmounted. Data saved.")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> Always unmount the SD card before removing it (<code>os.umount("/sd")</code>). Pulling the card while data is being written can corrupt the filesystem. Use <code>Ctrl+C</code> in Thonny to trigger the <code>KeyboardInterrupt</code> handler.'
            },
            {
                title: 'Analyze the Logged Data',
                content: '<p>After running the logger for a while, read the CSV file back and compute basic statistics. You can do this on the Pico itself or pull the SD card and open the CSV in a spreadsheet.</p>',
                code: '# Read and analyze the logged CSV data\n# Run this after stopping the logger\n\nfrom machine import Pin, SPI\nimport sdcard\nimport os\n\n# Mount SD\nspi = SPI(1, baudrate=1_000_000,\n          polarity=0, phase=0,\n          sck=Pin(10), mosi=Pin(11), miso=Pin(12))\ncs = Pin(13, Pin.OUT)\nsd_card = sdcard.SDCard(spi, cs)\nos.mount(sd_card, "/sd")\n\nFILENAME = "/sd/templog.csv"\n\n# Read all data\nwith open(FILENAME, "r") as f:\n    lines = f.readlines()\n\nprint(f"Total lines: {len(lines)} (including header)")\nprint(f"Data points: {len(lines) - 1}\\n")\n\n# Parse data\ninternal_temps = []\nexternal_temps = []\n\nfor line in lines[1:]:  # skip header\n    parts = line.strip().split(",")\n    if len(parts) >= 3:\n        internal_temps.append(float(parts[1]))\n        if parts[2] != "N/A":\n            external_temps.append(float(parts[2]))\n\ndef stats(label, data):\n    if not data:\n        print(f"  {label}: No data")\n        return\n    mn = min(data)\n    mx = max(data)\n    avg = sum(data) / len(data)\n    print(f"  {label}:")\n    print(f"    Min: {mn}C  Max: {mx}C  Avg: {avg:.1f}C")\n    print(f"    Range: {mx - mn:.1f}C  Readings: {len(data)}")\n\nprint("=" * 40)\nprint("  TEMPERATURE ANALYSIS")\nprint("=" * 40)\nstats("Internal (die)", internal_temps)\nstats("DS18B20 (probe)", external_temps)\n\nif internal_temps and external_temps:\n    diff = sum(internal_temps) / len(internal_temps) - \\\n           sum(external_temps) / len(external_temps)\n    print(f"\\n  Avg offset (internal - external): {diff:.1f}C")\nprint("=" * 40)\n\nos.umount("/sd")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> For longer logging sessions, consider adding a status LED that blinks once per reading so you know the logger is still running. A green LED on GP15 with a brief 50ms blink works well.'
            }
        ],

        testing: '<p>Verify each stage:</p>' +
                 '<ul>' +
                 '<li><strong>Internal sensor:</strong> Returns a reasonable temperature (typically 25&ndash;40&#176;C depending on environment and chip load).</li>' +
                 '<li><strong>DS18B20:</strong> <code>ds.scan()</code> finds exactly one device. Temperature reads within 1&#176;C of a known reference.</li>' +
                 '<li><strong>SD card:</strong> Mount succeeds, test file writes and reads back correctly.</li>' +
                 '<li><strong>Data logger:</strong> CSV file grows with each interval. Unmounting cleanly after Ctrl+C.</li>' +
                 '<li><strong>Data analysis:</strong> Stats computation shows reasonable min/max/avg values. Internal sensor consistently reads higher than external.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>DS18B20 returns 85.0&#176;C:</strong> This is the power-on default. The conversion did not complete. Wait longer after <code>convert_temp()</code> (at least 750ms).</li>' +
                         '<li><strong>DS18B20 scan returns empty list:</strong> Missing or wrong-value pull-up resistor. Must be 4.7K&#937; between data and 3.3V. Also check wire colors &mdash; some probes use non-standard colors.</li>' +
                         '<li><strong>SD mount fails with OSError:</strong> (1) Verify FAT32 format. (2) Check SPI wiring (SCK/MOSI/MISO are commonly swapped). (3) Ensure <code>sdcard.py</code> is on the Pico.</li>' +
                         '<li><strong>CSV file is empty or corrupt:</strong> The Pico was powered off or the card was removed without unmounting. Always use <code>os.umount("/sd")</code> before removing the card.</li>' +
                         '<li><strong>Internal temp reads very high (50&#176;C+):</strong> Normal if the Pico has been running for a while under load. The die runs hot. This is why external sensors matter.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Dual-Probe Comparison</strong> &mdash; Add a second DS18B20 (they share the same 1-Wire bus). Log both probes and compare readings. Place one indoors and run the other probe wire outside.</p>' +
                    '<p><strong>Challenge 2: Threshold Alerts</strong> &mdash; Add an LED and buzzer that trigger when temperature exceeds a configurable threshold. Log the alert events alongside temperature data.</p>' +
                    '<p><strong>Challenge 3: Battery Operation</strong> &mdash; Power the Pico from a USB battery pack. Add a deep-sleep cycle between readings to extend battery life. Measure how long the battery lasts at different intervals.</p>'
    },

    // ========================================================================
    // SG-117: WiFi Weather Station
    // ========================================================================
    'sg-117': {
        intro: '<p>This is the capstone Pico build &mdash; a self-contained weather station that reads temperature, humidity, and barometric pressure from a BME280 sensor, displays readings on an OLED screen, and serves a live dashboard over WiFi that any device on your network can access.</p>' +
               '<p>You will learn I2C communication (shared bus for both the sensor and display), WiFi connectivity with the Pico W, socket programming for the HTTP server, and HTML template rendering on a microcontroller. The result is a fully functional IoT device that runs independently.</p>' +
               '<p>This project requires a <strong>Pico W</strong> (not the standard Pico) because it needs WiFi. The BME280 sensor reads temperature (&plusmn;1&#176;C), humidity (&plusmn;3%), and pressure (&plusmn;1 hPa). The SSD1306 OLED is a 0.96" 128x64 pixel display.</p>',

        wiring: '    Raspberry Pi Pico W             Breadboard\n' +
                '    +----------------+             +-------------------------------+\n' +
                '    |                |             |                               |\n' +
                '    |     3V3 (OUT)  |---red-------|---[BME280 VIN]               |\n' +
                '    |          GND   |---black-----|---[BME280 GND]               |\n' +
                '    |    GP4 (SDA)   |---blue------|---[BME280 SDA]               |\n' +
                '    |    GP5 (SCL)   |---yellow----|---[BME280 SCL]               |\n' +
                '    |                |             |                               |\n' +
                '    |     3V3 (OUT)  |---red-------|---[OLED VCC] (shared 3V3)    |\n' +
                '    |          GND   |---black-----|---[OLED GND] (shared GND)    |\n' +
                '    |    GP4 (SDA)   |---blue------|---[OLED SDA] (shared bus)    |\n' +
                '    |    GP5 (SCL)   |---yellow----|---[OLED SCL] (shared bus)    |\n' +
                '    +----------------+             +-------------------------------+\n' +
                '\n' +
                '    I2C Bus (shared):\n' +
                '    Both BME280 and SSD1306 OLED share the same I2C bus (GP4/GP5).\n' +
                '    They have different addresses: BME280 = 0x76, OLED = 0x3C.\n' +
                '    No pull-up resistors needed — both modules have built-in pull-ups.',

        wiringNotes: '<p><strong>I2C bus sharing:</strong> Both the BME280 and SSD1306 connect to the <em>same</em> SDA and SCL lines. I2C is a bus protocol &mdash; multiple devices share two wires. Each device has a unique address (BME280 = 0x76 or 0x77, OLED = 0x3C). The Pico sends the address first, and only the matching device responds.</p>' +
                     '<p><strong>Pico W vs Pico:</strong> The Pico W has an onboard CYW43439 WiFi/BT chip. It uses the same RP2040 processor. The pinout is identical except GP23, GP24, GP25, and GP29 are used internally for the wireless module. Do not use those pins for your circuit.</p>' +
                     '<p><strong>BME280 module:</strong> Make sure you have a BME280 (not BMP280). The BMP280 measures only temperature and pressure &mdash; no humidity. The BME280 adds the humidity sensor. Check the chip label under magnification if unsure.</p>' +
                     '<p><strong>MicroPython drivers:</strong> You need two driver files saved to the Pico: <code>bme280.py</code> and <code>ssd1306.py</code>. Both are available in the micropython-lib repository. Save them via Thonny before running the code.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg117-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg117-grid)" rx="4"/>' +
            '<text x="360" y="30" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-117 WIFI WEATHER STATION</text>' +

            '<!-- Pico W -->' +
            '<rect x="40" y="80" width="200" height="260" rx="8" fill="#1e2736" stroke="#c51a4a" stroke-width="1.5"/>' +
            '<rect x="40" y="80" width="200" height="24" rx="8" fill="rgba(197,26,74,0.12)"/>' +
            '<text x="140" y="96" text-anchor="middle" fill="#c51a4a" font-size="10" font-weight="600">RASPBERRY PI PICO W</text>' +
            '<!-- WiFi icon -->' +
            '<path d="M 120 120 Q 140 105 160 120" fill="none" stroke="rgba(197,26,74,0.4)" stroke-width="1"/>' +
            '<path d="M 125 115 Q 140 100 155 115" fill="none" stroke="rgba(197,26,74,0.3)" stroke-width="1"/>' +
            '<path d="M 130 110 Q 140 100 150 110" fill="none" stroke="rgba(197,26,74,0.2)" stroke-width="1"/>' +
            '<circle cx="140" cy="123" r="2" fill="rgba(197,26,74,0.5)"/>' +
            '<text x="230" y="165" text-anchor="end" fill="#8b949e" font-size="8">3V3</text>' +
            '<circle cx="238" cy="162" r="3" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="230" y="195" text-anchor="end" fill="#8b949e" font-size="8">GND</text>' +
            '<circle cx="238" cy="192" r="3" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="230" y="235" text-anchor="end" fill="#8b949e" font-size="8">GP4 SDA</text>' +
            '<circle cx="238" cy="232" r="3" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="230" y="270" text-anchor="end" fill="#8b949e" font-size="8">GP5 SCL</text>' +
            '<circle cx="238" cy="267" r="3" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +

            '<!-- I2C Bus lines -->' +
            '<line x1="241" y1="232" x2="370" y2="232" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="310" y="228" text-anchor="middle" fill="#3b82f6" font-size="6">SDA</text>' +
            '<line x1="241" y1="267" x2="370" y2="267" stroke="#eab308" stroke-width="2"/>' +
            '<text x="310" y="278" text-anchor="middle" fill="#eab308" font-size="6">SCL</text>' +

            '<!-- BME280 -->' +
            '<rect x="380" y="80" width="140" height="100" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="450" y="100" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">BME280</text>' +
            '<text x="450" y="115" text-anchor="middle" fill="#8b949e" font-size="6">Addr: 0x76</text>' +
            '<text x="420" y="138" fill="#8b949e" font-size="6">Temp</text>' +
            '<text x="420" y="150" fill="#8b949e" font-size="6">Humidity</text>' +
            '<text x="420" y="162" fill="#8b949e" font-size="6">Pressure</text>' +
            '<!-- Branch from I2C bus -->' +
            '<line x1="370" y1="232" x2="420" y2="180" stroke="#3b82f6" stroke-width="1.2"/>' +
            '<line x1="370" y1="267" x2="460" y2="180" stroke="#eab308" stroke-width="1.2"/>' +
            '<!-- 3V3 and GND -->' +
            '<line x1="241" y1="162" x2="395" y2="180" stroke="#ef4444" stroke-width="1"/>' +
            '<line x1="241" y1="192" x2="505" y2="180" stroke="#8b949e" stroke-width="1" stroke-dasharray="4,2"/>' +

            '<!-- OLED Display -->' +
            '<rect x="380" y="220" width="140" height="110" rx="8" fill="#1e2736" stroke="#38bdf8" stroke-width="1.5"/>' +
            '<rect x="395" y="238" width="110" height="60" rx="4" fill="#0a0a0f" stroke="rgba(56,189,248,0.3)" stroke-width="0.5"/>' +
            '<text x="450" y="258" text-anchor="middle" fill="#38bdf8" font-size="7">24.1C  58%</text>' +
            '<text x="450" y="275" text-anchor="middle" fill="#38bdf8" font-size="7">1013 hPa</text>' +
            '<text x="450" y="290" text-anchor="middle" fill="rgba(56,189,248,0.5)" font-size="5">WiFi: Connected</text>' +
            '<text x="450" y="315" text-anchor="middle" fill="#38bdf8" font-size="7" font-weight="600">SSD1306 OLED</text>' +
            '<text x="450" y="327" text-anchor="middle" fill="#8b949e" font-size="6">Addr: 0x3C</text>' +
            '<!-- Branch from I2C bus -->' +
            '<line x1="370" y1="232" x2="395" y2="240" stroke="#3b82f6" stroke-width="1.2"/>' +
            '<line x1="370" y1="267" x2="395" y2="268" stroke="#eab308" stroke-width="1.2"/>' +

            '<!-- WiFi dashboard preview -->' +
            '<rect x="550" y="80" width="150" height="180" rx="8" fill="#1e2736" stroke="rgba(197,26,74,0.3)" stroke-width="1"/>' +
            '<rect x="550" y="80" width="150" height="20" rx="8" fill="rgba(197,26,74,0.08)"/>' +
            '<rect x="550" y="94" width="150" height="6" fill="rgba(197,26,74,0.08)"/>' +
            '<text x="625" y="93" text-anchor="middle" fill="#c51a4a" font-size="7" font-weight="600">WEB DASHBOARD</text>' +
            '<text x="565" y="118" fill="#8b949e" font-size="6">http://192.168.x.x</text>' +
            '<rect x="562" y="128" width="126" height="50" rx="3" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="625" y="143" text-anchor="middle" fill="#4ade80" font-size="8">24.1&#176;C</text>' +
            '<text x="625" y="156" text-anchor="middle" fill="#38bdf8" font-size="8">58% RH</text>' +
            '<text x="625" y="170" text-anchor="middle" fill="#eab308" font-size="8">1013 hPa</text>' +
            '<rect x="562" y="184" width="126" height="30" rx="3" fill="rgba(56,189,248,0.04)" stroke="rgba(56,189,248,0.1)" stroke-width="0.5"/>' +
            '<text x="625" y="198" text-anchor="middle" fill="#8b949e" font-size="6">Auto-refresh 10s</text>' +
            '<text x="625" y="210" text-anchor="middle" fill="#555" font-size="5">Any browser on LAN</text>' +

            '<!-- WiFi signal from Pico to dashboard -->' +
            '<path d="M 250 130 Q 400 50 550 100" fill="none" stroke="rgba(197,26,74,0.2)" stroke-width="1" stroke-dasharray="4,3"/>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Scan the I2C Bus',
                content: '<p><strong>Disconnect USB.</strong> Wire both the BME280 and SSD1306 OLED to the same I2C bus: SDA to GP4, SCL to GP5, VCC to 3V3, GND to GND. Both devices share all four wires.</p>' +
                         '<p>Before reading any data, scan the I2C bus to verify both devices are detected at their expected addresses.</p>',
                code: 'from machine import Pin, I2C\n\n# I2C bus 0, SDA=GP4, SCL=GP5\ni2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=400_000)\n\n# Scan for devices\ndevices = i2c.scan()\nprint(f"I2C devices found: {len(devices)}")\nfor addr in devices:\n    label = ""\n    if addr == 0x76 or addr == 0x77:\n        label = " (BME280)"\n    elif addr == 0x3C:\n        label = " (SSD1306 OLED)"\n    print(f"  Address: 0x{addr:02X}{label}")\n\nif 0x76 not in devices and 0x77 not in devices:\n    print("\\nWARNING: BME280 not found!")\n    print("Check I2C wiring: SDA to GP4, SCL to GP5")\nif 0x3C not in devices:\n    print("\\nWARNING: SSD1306 OLED not found!")\n    print("Check I2C wiring and power connections")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> Some BME280 modules use address 0x77 instead of 0x76. If the scan shows 0x77, you will need to change the address in the BME280 driver initialization.'
            },
            {
                title: 'Read the BME280 Sensor',
                content: '<p>Copy the <code>bme280.py</code> driver to the Pico via Thonny. The BME280 provides temperature, humidity, and barometric pressure in a single reading.</p>',
                code: '# Requires: bme280.py saved to the Pico\n\nfrom machine import Pin, I2C\nimport bme280\nimport utime\n\ni2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=400_000)\nbme = bme280.BME280(i2c=i2c)\n\nprint("SG-117: BME280 Sensor Test")\nprint("-" * 40)\n\nfor i in range(10):\n    values = bme.values  # returns tuple of strings\n    temp = bme.values[0]   # e.g., "24.12C"\n    pressure = bme.values[1]  # e.g., "1013.25hPa"\n    humidity = bme.values[2]   # e.g., "58.33%"\n    \n    print(f"  [{i+1:02d}] Temp: {temp}  "\n          f"Humidity: {humidity}  "\n          f"Pressure: {pressure}")\n    utime.sleep(3)\n\nprint("\\nSensor test complete.")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> BME280 accuracy: temperature &plusmn;1&#176;C, humidity &plusmn;3%, pressure &plusmn;1 hPa. The sensor self-heats slightly when reading frequently. For best accuracy, read every 30+ seconds.'
            },
            {
                title: 'Display on the OLED',
                content: '<p>Copy the <code>ssd1306.py</code> driver to the Pico. The SSD1306 is a 128x64 pixel monochrome OLED. MicroPython\'s framebuf module handles text rendering.</p>',
                code: '# Requires: ssd1306.py and bme280.py on the Pico\n\nfrom machine import Pin, I2C\nimport ssd1306\nimport bme280\nimport utime\n\ni2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=400_000)\nbme = bme280.BME280(i2c=i2c)\noled = ssd1306.SSD1306_I2C(128, 64, i2c)\n\ndef update_display(temp, humidity, pressure):\n    """Update the OLED with current readings."""\n    oled.fill(0)  # Clear display\n    \n    # Header\n    oled.text("WEATHER STATION", 4, 0)\n    oled.hline(0, 10, 128, 1)  # Separator line\n    \n    # Temperature\n    oled.text(f"Temp: {temp}", 0, 16)\n    \n    # Humidity\n    oled.text(f"Hum:  {humidity}", 0, 30)\n    \n    # Pressure\n    oled.text(f"Pres: {pressure}", 0, 44)\n    \n    oled.show()  # Push framebuffer to display\n\nprint("SG-117: OLED Display Active")\n\nwhile True:\n    vals = bme.values\n    update_display(vals[0], vals[2], vals[1])\n    utime.sleep(5)',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> The SSD1306 font is 8x8 pixels. At 128 pixels wide, you can fit 16 characters per line. At 64 pixels tall, you get 8 lines of text. Plan your display layout on graph paper first.'
            },
            {
                title: 'Connect to WiFi',
                content: '<p>The Pico W uses the <code>network</code> module to connect to WiFi. Once connected, it gets an IP address that other devices on the same network can reach.</p>' +
                         '<p><strong>Security note:</strong> Never hardcode WiFi credentials in committed code. For this build project, storing them in the script is acceptable since the code stays on the Pico. For production, use a separate config file.</p>',
                code: 'import network\nimport utime\n\n# --- WiFi Credentials ---\n# Change these to match your network\nSSID = "YOUR_WIFI_SSID"\nPASSWORD = "YOUR_WIFI_PASSWORD"\n\ndef connect_wifi(ssid, password, timeout=15):\n    """Connect to WiFi and return the IP address."""\n    wlan = network.WLAN(network.STA_IF)\n    wlan.active(True)\n    \n    if wlan.isconnected():\n        print(f"Already connected: {wlan.ifconfig()[0]}")\n        return wlan.ifconfig()[0]\n    \n    print(f"Connecting to {ssid}...")\n    wlan.connect(ssid, password)\n    \n    start = utime.time()\n    while not wlan.isconnected():\n        if utime.time() - start > timeout:\n            print("ERROR: WiFi connection timed out")\n            return None\n        utime.sleep(1)\n        print("  waiting...")\n    \n    ip = wlan.ifconfig()[0]\n    print(f"Connected! IP: {ip}")\n    return ip\n\nip = connect_wifi(SSID, PASSWORD)\nif ip:\n    print(f"\\nAccess the weather station at: http://{ip}")',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> If WiFi fails to connect, verify: (1) SSID and password are correct (case-sensitive), (2) your network is 2.4GHz (Pico W does not support 5GHz), (3) you are within range of the access point.'
            },
            {
                title: 'Serve the Web Dashboard',
                content: '<p>Build a minimal HTTP server that serves an HTML page with live weather data. The page auto-refreshes every 10 seconds. Any browser on the same network can view it.</p>' +
                         '<p>Save this as <code>main.py</code> on the Pico W for auto-start on boot.</p>',
                code: 'import network\nimport socket\nimport utime\nfrom machine import Pin, I2C\nimport bme280\nimport ssd1306\n\n# --- WiFi ---\nSSID = "YOUR_WIFI_SSID"\nPASSWORD = "YOUR_WIFI_PASSWORD"\n\ndef connect_wifi():\n    wlan = network.WLAN(network.STA_IF)\n    wlan.active(True)\n    wlan.connect(SSID, PASSWORD)\n    while not wlan.isconnected():\n        utime.sleep(1)\n    return wlan.ifconfig()[0]\n\n# --- Sensors & Display ---\ni2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=400_000)\nbme = bme280.BME280(i2c=i2c)\noled = ssd1306.SSD1306_I2C(128, 64, i2c)\n\ndef read_sensors():\n    vals = bme.values\n    return {\n        "temp": vals[0],\n        "pressure": vals[1],\n        "humidity": vals[2]\n    }\n\ndef update_oled(data, ip):\n    oled.fill(0)\n    oled.text("WEATHER STATION", 4, 0)\n    oled.hline(0, 10, 128, 1)\n    oled.text(f"T: {data[\'temp\']}", 0, 16)\n    oled.text(f"H: {data[\'humidity\']}", 0, 28)\n    oled.text(f"P: {data[\'pressure\']}", 0, 40)\n    oled.text(ip, 0, 56)\n    oled.show()\n\ndef build_html(data):\n    return f"""<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta http-equiv="refresh" content="10">\n<title>Pico Weather Station</title>\n<style>\n  body {{ font-family: monospace; background: #0a0a0f; color: #e2e8f0;\n         display: flex; justify-content: center; padding: 2rem; }}\n  .card {{ background: #1e2736; border-radius: 12px; padding: 2rem;\n           max-width: 400px; width: 100%; border: 1px solid #c51a4a33; }}\n  h1 {{ color: #c51a4a; font-size: 1.2rem; margin: 0 0 1rem; }}\n  .reading {{ display: flex; justify-content: space-between;\n              padding: 0.75rem 0; border-bottom: 1px solid #ffffff10; }}\n  .label {{ color: #8b949e; }}\n  .value {{ font-weight: bold; }}\n  .temp {{ color: #4ade80; }}\n  .hum {{ color: #38bdf8; }}\n  .pres {{ color: #eab308; }}\n  .footer {{ color: #555; font-size: 0.8rem; margin-top: 1rem; text-align: center; }}\n</style>\n</head>\n<body>\n<div class="card">\n  <h1>Pico W Weather Station</h1>\n  <div class="reading">\n    <span class="label">Temperature</span>\n    <span class="value temp">{data["temp"]}</span>\n  </div>\n  <div class="reading">\n    <span class="label">Humidity</span>\n    <span class="value hum">{data["humidity"]}</span>\n  </div>\n  <div class="reading">\n    <span class="label">Pressure</span>\n    <span class="value pres">{data["pressure"]}</span>\n  </div>\n  <div class="footer">Auto-refresh every 10 seconds | SG-117</div>\n</div>\n</body>\n</html>\"\"\"\n\n# --- Main ---\nprint("SG-117: WiFi Weather Station")\nip = connect_wifi()\nprint(f"Dashboard: http://{ip}")\n\n# Start HTTP server\naddr = socket.getaddrinfo("0.0.0.0", 80)[0][-1]\ns = socket.socket()\ns.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\ns.bind(addr)\ns.listen(1)\nprint(f"HTTP server listening on port 80")\n\nwhile True:\n    try:\n        cl, addr = s.accept()\n        request = cl.recv(1024)\n        \n        data = read_sensors()\n        update_oled(data, ip)\n        \n        html = build_html(data)\n        cl.send("HTTP/1.0 200 OK\\r\\n")\n        cl.send("Content-Type: text/html\\r\\n")\n        cl.send(f"Content-Length: {len(html)}\\r\\n")\n        cl.send("\\r\\n")\n        cl.send(html)\n        cl.close()\n        \n        print(f"  Served to {addr[0]} | "\n              f"T={data[\'temp\']} H={data[\'humidity\']} "\n              f"P={data[\'pressure\']}")\n    except Exception as e:\n        print(f"  Error: {e}")\n        try:\n            cl.close()\n        except:\n            pass',
                language: 'MicroPython',
                tip: '<strong>Tip:</strong> The Pico W has limited memory. The HTTP server handles one request at a time (no concurrency). For production, you would use an async framework like <code>uasyncio</code>. For this build, synchronous is fine.'
            }
        ],

        testing: '<p>Verify each stage:</p>' +
                 '<ul>' +
                 '<li><strong>I2C scan:</strong> Two devices found &mdash; 0x76 (BME280) and 0x3C (SSD1306). If only one appears, check the missing device\'s wiring.</li>' +
                 '<li><strong>BME280 readings:</strong> Temperature reasonable for your environment. Humidity 20&ndash;90%. Pressure around 1013 hPa at sea level (lower at altitude).</li>' +
                 '<li><strong>OLED display:</strong> Text is readable. All three readings update every 5 seconds.</li>' +
                 '<li><strong>WiFi connection:</strong> IP address assigned and printed. Try pinging the IP from your computer.</li>' +
                 '<li><strong>Web dashboard:</strong> Open <code>http://[pico-ip]</code> in any browser. Page loads with current readings. Auto-refreshes every 10 seconds.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>I2C scan returns empty list:</strong> Wiring issue. Verify SDA is GP4, SCL is GP5, VCC is 3.3V, GND is GND. Try lower I2C frequency: <code>freq=100_000</code>.</li>' +
                         '<li><strong>BME280 import fails:</strong> <code>bme280.py</code> is not on the Pico. Save it via Thonny to the Pico (not your computer\'s filesystem).</li>' +
                         '<li><strong>OLED shows nothing:</strong> Call <code>oled.show()</code> after drawing. Also verify address &mdash; some OLEDs use 0x3D instead of 0x3C.</li>' +
                         '<li><strong>WiFi times out:</strong> (1) Verify SSID/password. (2) Must be 2.4GHz network. (3) Try moving closer to the router. (4) Some networks block new devices &mdash; check your router admin panel.</li>' +
                         '<li><strong>Browser cannot load the page:</strong> (1) Pico and your device must be on the same network. (2) Check the IP address printed in the serial console. (3) Try <code>http://</code> explicitly (not https).</li>' +
                         '<li><strong>Server crashes after a few requests:</strong> Memory issue. Add <code>import gc; gc.collect()</code> in the main loop after each request. The Pico has limited RAM.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Data History</strong> &mdash; Store the last 24 readings in memory and display a simple ASCII chart on the OLED showing temperature trend. Add a history endpoint to the web dashboard.</p>' +
                    '<p><strong>Challenge 2: JSON API</strong> &mdash; Add a <code>/api/weather</code> endpoint that returns JSON instead of HTML. This lets other programs and scripts consume the data programmatically.</p>' +
                    '<p><strong>Challenge 3: Outdoor Enclosure</strong> &mdash; Design and 3D-print (or build from a waterproof box) an enclosure for the weather station. Route the BME280 to the outside with a vented opening. Power via USB cable through a grommet. Deploy it outside your window and monitor from inside.</p>'
    }
};
