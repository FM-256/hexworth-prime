// ============================================================================
// Signal IoT Sensor Mesh — Build Guides (sg-93 through sg-97)
// BeagleConnect Zepto (TI MSPM0L1117, ARM Cortex-M0+ @ 32 MHz) projects
// Zephyr RTOS / MicroPython / Python 3 — IoT and security focus
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-93: Zepto Blink — First ARM Bare-Metal Program
    // ========================================================================
    'sg-93': {
        // Wokwi wave 3: NO SIM — BeagleConnect Zepto (TI MSPM0) not a Wokwi board; devicetree/mikroBUS/mesh/Greybus not simulable.
        simulator: { available: false, note: 'This runs <strong>Zephyr RTOS on the BeagleConnect Zepto</strong> (a TI MSPM0 Cortex-M0+ board) &mdash; not a board any browser simulator offers, and the whole lesson is its <strong>devicetree</strong> hardware model. Read the devicetree walkthrough and build it on the real Zepto.' },
        intro: '<p>The BeagleConnect Zepto is a production-grade ARM Cortex-M0+ board running the Zephyr real-time operating system. Unlike Arduino, Zephyr uses a hardware abstraction layer called <strong>devicetree</strong> to describe the physical board — every pin, peripheral, and clock is declared in a structured configuration file before a single line of C runs. Understanding that model is the foundation for every project in this track.</p>' +
               '<p>In this project you will install the Zephyr SDK and the <code>west</code> meta-tool, understand how a board definition maps hardware to software, and write a complete blink program using the Zephyr GPIO API. You will then flash the firmware over USB using the MCUBOOT bootloader built into the Zepto — no JTAG probe required. Finally you will cycle the onboard RGB LED through red, green, and blue channels and read the user button to gate the pattern.</p>' +
               '<p>The Zepto has no external wiring requirements for this project. Power it with any USB-C cable and the board provides everything you need: an RGB LED connected to three GPIO pins, a tactile user button, and a reset button. The same USB connection that flashes firmware also provides a USB CDC serial console for debug output.</p>',

        wiring: '    BeagleConnect Zepto (USB-C only — no external wiring)\n' +
                '    +------------------------------------------+\n' +
                '    |                                          |\n' +
                '    |  USB-C port  <------>  Host PC           |\n' +
                '    |  (power + flash + serial console)        |\n' +
                '    |                                          |\n' +
                '    |  Onboard peripherals used:               |\n' +
                '    |  RGB LED   -> GPIO PA13 (red)            |\n' +
                '    |              GPIO PA12 (green)           |\n' +
                '    |              GPIO PA11 (blue)            |\n' +
                '    |  USER BTN  -> GPIO PA14 (active-low)     |\n' +
                '    |  RESET BTN -> nRST pin (hardware reset)  |\n' +
                '    |                                          |\n' +
                '    +------------------------------------------+\n' +
                '\n' +
                '    No breadboard, no jumper wires, no external components needed.',

        wiringNotes: '<p><strong>Pin reference:</strong> The RGB LED channels are driven by GPIO port A pins 11, 12, and 13. All three are active-low &mdash; writing a logical 0 turns the LED on, writing a 1 turns it off. The Zephyr devicetree overlay handles this polarity so your application code uses <code>GPIO_ACTIVE_LOW</code> and writes 1 for on.</p>' +
                     '<p><strong>User button:</strong> PA14 is pulled high internally. When pressed, the pin reads 0. In Zephyr you declare it <code>GPIO_ACTIVE_LOW | GPIO_PULL_UP</code> and treat a value of 1 as pressed.</p>' +
                     '<p><strong>USB-C:</strong> The Zepto\'s MCUBOOT bootloader enumerates as a USB DFU device when you hold the user button during reset. It also exposes a USB CDC-ACM serial port at all other times for <code>printk()</code> output. No extra USB-to-serial adapter is needed.</p>' +
                     '<p><strong>Safety:</strong> The MSPM0L1117 GPIO pins are 3.3V logic. Do not connect them directly to 5V sources. The onboard RGB LED is current-limited by the PCB design &mdash; do not bypass it with external wiring.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg93-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg93-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-93 BEAGLECONNECT ZEPTO — BOARD LAYOUT</text>' +
            '<!-- Board outline -->' +
            '<rect x="200" y="50" width="320" height="300" rx="10" fill="#1a2035" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="360" y="74" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="700">BeagleConnect Zepto</text>' +
            '<text x="360" y="88" text-anchor="middle" fill="#475569" font-size="8">TI MSPM0L1117 &mdash; ARM Cortex-M0+ @ 32 MHz</text>' +
            '<!-- USB-C port -->' +
            '<rect x="334" y="46" width="52" height="20" rx="4" fill="#1e2736" stroke="#60a5fa" stroke-width="1.5"/>' +
            '<text x="360" y="59" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">USB-C</text>' +
            '<!-- Qwiic connectors -->' +
            '<rect x="212" y="100" width="36" height="18" rx="3" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="230" y="112" text-anchor="middle" fill="#4ade80" font-size="6">QWIIC 1</text>' +
            '<rect x="212" y="126" width="36" height="18" rx="3" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="230" y="138" text-anchor="middle" fill="#4ade80" font-size="6">QWIIC 2</text>' +
            '<!-- mikroBUS header -->' +
            '<rect x="212" y="160" width="36" height="120" rx="3" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<text x="230" y="218" text-anchor="middle" fill="#c084fc" font-size="6" font-weight="600" writing-mode="tb">mikroBUS</text>' +
            '<!-- TAG-CONNECT JTAG -->' +
            '<rect x="466" y="100" width="42" height="28" rx="3" fill="#1e2736" stroke="#f59e0b" stroke-width="1"/>' +
            '<text x="487" y="112" text-anchor="middle" fill="#fbbf24" font-size="5.5">TAG-CONN</text>' +
            '<text x="487" y="122" text-anchor="middle" fill="#fbbf24" font-size="5.5">JTAG 8p</text>' +
            '<!-- RGB LED -->' +
            '<circle cx="420" cy="180" r="14" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="1.5"/>' +
            '<circle cx="420" cy="180" r="7" fill="rgba(255,255,255,0.12)" stroke="#e2e8f0" stroke-width="1"/>' +
            '<text x="420" y="206" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="600">RGB LED</text>' +
            '<!-- RGB channel labels -->' +
            '<text x="456" y="164" fill="#ef4444" font-size="7">PA13 RED</text>' +
            '<text x="456" y="178" fill="#4ade80" font-size="7">PA12 GRN</text>' +
            '<text x="456" y="192" fill="#60a5fa" font-size="7">PA11 BLU</text>' +
            '<line x1="434" y1="174" x2="453" y2="162" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<line x1="434" y1="180" x2="453" y2="176" stroke="#4ade80" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<line x1="434" y1="186" x2="453" y2="190" stroke="#60a5fa" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<!-- Reset button -->' +
            '<rect x="296" y="290" width="36" height="22" rx="4" fill="#1e2736" stroke="#f59e0b" stroke-width="1"/>' +
            '<text x="314" y="304" text-anchor="middle" fill="#fbbf24" font-size="7">RESET</text>' +
            '<!-- User button -->' +
            '<rect x="388" y="290" width="36" height="22" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="406" y="304" text-anchor="middle" fill="#4ade80" font-size="7">USER</text>' +
            '<text x="406" y="318" text-anchor="middle" fill="#475569" font-size="6">PA14</text>' +
            '<!-- USB cable to host -->' +
            '<line x1="360" y1="46" x2="360" y2="10" stroke="#60a5fa" stroke-width="2"/>' +
            '<rect x="310" y="2" width="100" height="16" rx="4" fill="#1e2736" stroke="#60a5fa" stroke-width="1"/>' +
            '<text x="360" y="13" text-anchor="middle" fill="#60a5fa" font-size="7">Host PC (power + flash + serial)</text>' +
            '<!-- Legend -->' +
            '<rect x="540" y="160" width="150" height="120" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
            '<text x="615" y="178" text-anchor="middle" fill="#8b949e" font-size="8" font-weight="600">LEGEND</text>' +
            '<rect x="552" y="186" width="10" height="6" rx="1" fill="none" stroke="#3b82f6" stroke-width="1.5"/><text x="568" y="193" fill="#8b949e" font-size="7">Board outline</text>' +
            '<rect x="552" y="200" width="10" height="6" rx="1" fill="none" stroke="#a855f7" stroke-width="1.5"/><text x="568" y="207" fill="#8b949e" font-size="7">mikroBUS header</text>' +
            '<rect x="552" y="214" width="10" height="6" rx="1" fill="none" stroke="#22c55e" stroke-width="1.5"/><text x="568" y="221" fill="#8b949e" font-size="7">Qwiic / I2C</text>' +
            '<rect x="552" y="228" width="10" height="6" rx="1" fill="none" stroke="#f59e0b" stroke-width="1.5"/><text x="568" y="235" fill="#8b949e" font-size="7">JTAG / Debug</text>' +
            '<rect x="552" y="242" width="10" height="6" rx="1" fill="none" stroke="#60a5fa" stroke-width="1.5"/><text x="568" y="249" fill="#8b949e" font-size="7">USB-C</text>' +
            '<!-- Board dimensions -->' +
            '<text x="360" y="378" text-anchor="middle" fill="#475569" font-size="8">33.7 x 25.4 mm &mdash; 2-layer PCB</text>' +
            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Install the Zephyr SDK and west Tool',
                content: '<p>Zephyr requires the <code>west</code> meta-tool to manage its multi-repository workspace, and the Zephyr SDK which bundles ARM cross-compilers, OpenOCD, and target libraries. All commands below target Ubuntu 22.04 / 24.04. On Windows, use WSL2.</p>' +
                         '<p>After the SDK installs, export the <code>ZEPHYR_BASE</code> environment variable and add the SDK toolchain to your path. The <code>west zephyr-export</code> command registers the Zephyr CMake package so build commands resolve correctly without needing full paths.</p>',
                code: '# 1. Install host dependencies\nsudo apt update && sudo apt install -y \\\n  git cmake ninja-build gperf \\\n  ccache dfu-util python3-pip python3-venv \\\n  python3-setuptools python3-wheel \\\n  device-tree-compiler\n\n# 2. Install west\npip3 install --user west\nexport PATH="$HOME/.local/bin:$PATH"\n\n# 3. Initialize a Zephyr workspace\nmkdir ~/zephyrproject && cd ~/zephyrproject\nwest init\nwest update\n\n# 4. Install Zephyr Python dependencies\npip3 install --user -r zephyr/scripts/requirements.txt\n\n# 5. Download the Zephyr SDK (v0.16.8)\ncd ~\nwget https://github.com/zephyrproject-rtos/sdk-ng/releases/download/v0.16.8/zephyr-sdk-0.16.8_linux-x86_64.tar.xz\ntar xf zephyr-sdk-0.16.8_linux-x86_64.tar.xz\ncd zephyr-sdk-0.16.8\n./setup.sh\n\n# 6. Export Zephyr CMake package\ncd ~/zephyrproject/zephyr\nwest zephyr-export\n\n# Verify the environment\nwest --version\n# Expected output: west, version 1.2.0 (or newer)',
                language: 'bash',
                codeCaption: 'Run these commands in order. The west update step downloads ~2 GB of Zephyr modules — allow 5-10 minutes on a typical connection.'
            },
            {
                title: 'Understand the Board Definition and Devicetree',
                content: '<p>Zephyr\'s devicetree is a hierarchical description of the physical hardware. Every board ships a base DTS (devicetree source) file that declares its peripherals. Your application can layer a <strong>devicetree overlay</strong> on top to enable or configure specific nodes without touching the board definition itself.</p>' +
                         '<p>The BeagleConnect Zepto board support package lives under <code>boards/arm/beagleconnect_zepto/</code> in the Zephyr tree. The key files are the base <code>.dts</code> (hardware map), the <code>_defconfig</code> (Kconfig defaults), and the <code>.yaml</code> (board metadata). The RGB LED and buttons are already declared in the base DTS — you just need to reference them by node alias in your code.</p>',
                code: '# Inspect the Zepto board definition\ncd ~/zephyrproject/zephyr\ncat boards/arm/beagleconnect_zepto/beagleconnect_zepto.dts\n\n# The relevant sections look like this:\n# leds {\n#     compatible = "gpio-leds";\n#     led_red: led_0 {\n#         gpios = <&gpioa 13 (GPIO_ACTIVE_LOW)>;\n#         label = "LED Red";\n#     };\n#     led_green: led_1 {\n#         gpios = <&gpioa 12 (GPIO_ACTIVE_LOW)>;\n#         label = "LED Green";\n#     };\n#     led_blue: led_2 {\n#         gpios = <&gpioa 11 (GPIO_ACTIVE_LOW)>;\n#         label = "LED Blue";\n#     };\n# };\n# buttons {\n#     compatible = "gpio-keys";\n#     user_button: button_0 {\n#         gpios = <&gpioa 14 (GPIO_ACTIVE_LOW | GPIO_PULL_UP)>;\n#         label = "User Button";\n#     };\n# };\n\n# These aliases are used in your app with DT_ALIAS() macros.',
                language: 'bash',
                codeCaption: 'Read the DTS to understand the hardware map before writing any code. Never hardcode GPIO numbers — always use the devicetree alias.'
            },
            {
                title: 'Write and Build the RGB Blink Program',
                content: '<p>Create a new Zephyr application directory with three files: <code>CMakeLists.txt</code>, <code>prj.conf</code>, and <code>src/main.c</code>. The CMakeLists.txt declares the Zephyr app and links the kernel. The prj.conf enables the GPIO driver. The main.c retrieves the LED device nodes via devicetree macros and toggles them using the Zephyr GPIO API.</p>' +
                         '<p>The build command targets the <code>beagleconnect_zepto</code> board. West invokes CMake and Ninja under the hood. A successful build produces <code>build/zephyr/zephyr.bin</code> — the raw binary to flash.</p>',
                code: '# Directory structure\n# sg93-blink/\n#   CMakeLists.txt\n#   prj.conf\n#   src/main.c\n\n# --- CMakeLists.txt ---\ncmake_minimum_required(VERSION 3.20.0)\nfind_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})\nproject(sg93_blink)\ntarget_sources(app PRIVATE src/main.c)\n\n# --- prj.conf ---\nCONFIG_GPIO=y\nCONFIG_USB_DEVICE_STACK=y\nCONFIG_USB_CDC_ACM=y\nCONFIG_SERIAL=y\nCONFIG_CONSOLE=y\nCONFIG_UART_CONSOLE=y\nCONFIG_LOG=y\n\n# --- src/main.c ---\n#include <zephyr/kernel.h>\n#include <zephyr/drivers/gpio.h>\n#include <zephyr/logging/log.h>\n\nLOG_MODULE_REGISTER(sg93_blink, LOG_LEVEL_INF);\n\n/* Devicetree aliases defined in the board DTS */\n#define LED_RED_NODE   DT_ALIAS(led0)\n#define LED_GREEN_NODE DT_ALIAS(led1)\n#define LED_BLUE_NODE  DT_ALIAS(led2)\n\nstatic const struct gpio_dt_spec led_red   = GPIO_DT_SPEC_GET(LED_RED_NODE,   gpios);\nstatic const struct gpio_dt_spec led_green = GPIO_DT_SPEC_GET(LED_GREEN_NODE, gpios);\nstatic const struct gpio_dt_spec led_blue  = GPIO_DT_SPEC_GET(LED_BLUE_NODE,  gpios);\n\nstatic void leds_off(void)\n{\n    gpio_pin_set_dt(&led_red,   0);\n    gpio_pin_set_dt(&led_green, 0);\n    gpio_pin_set_dt(&led_blue,  0);\n}\n\nint main(void)\n{\n    if (!gpio_is_ready_dt(&led_red) ||\n        !gpio_is_ready_dt(&led_green) ||\n        !gpio_is_ready_dt(&led_blue)) {\n        LOG_ERR("LED GPIO devices not ready");\n        return -ENODEV;\n    }\n\n    gpio_pin_configure_dt(&led_red,   GPIO_OUTPUT_INACTIVE);\n    gpio_pin_configure_dt(&led_green, GPIO_OUTPUT_INACTIVE);\n    gpio_pin_configure_dt(&led_blue,  GPIO_OUTPUT_INACTIVE);\n\n    LOG_INF("SG-93: RGB blink starting");\n\n    while (1) {\n        /* Red */\n        leds_off();\n        gpio_pin_set_dt(&led_red, 1);\n        LOG_INF("RED");\n        k_msleep(500);\n\n        /* Green */\n        leds_off();\n        gpio_pin_set_dt(&led_green, 1);\n        LOG_INF("GREEN");\n        k_msleep(500);\n\n        /* Blue */\n        leds_off();\n        gpio_pin_set_dt(&led_blue, 1);\n        LOG_INF("BLUE");\n        k_msleep(500);\n    }\n    return 0;\n}\n\n# Build\ncd ~/zephyrproject\nwest build -b beagleconnect_zepto sg93-blink\n# Expected: [100/100] Linking C executable zephyr/zephyr.elf',
                language: 'c',
                codeCaption: 'gpio_pin_set_dt() writes to the active-low LED correctly — pass 1 to turn on, 0 to turn off, regardless of the electrical polarity.'
            },
            {
                title: 'Flash via MCUBOOT USB Bootloader',
                content: '<p>The Zepto ships with MCUBOOT pre-flashed. To enter DFU mode, hold the <strong>USER button</strong>, press and release <strong>RESET</strong>, then release the USER button. The board enumerates as a USB DFU device. Run <code>west flash</code> to transfer the firmware. The board resets automatically after a successful flash.</p>' +
                         '<p>After flashing, open a serial terminal at 115200 baud to see the <code>LOG_INF()</code> output. The USB CDC-ACM port appears as <code>/dev/ttyACM0</code> on Linux or <code>COMx</code> on Windows.</p>',
                code: '# Enter DFU mode: hold USER button, tap RESET, release USER button\n# The board appears as "MCUBOOT DFU" in lsusb\n\n# Flash over USB DFU\nwest flash\n# Output:\n# -- west flash: using runner dfu-util\n# -- runners.dfu-util: Flashing file: build/zephyr/zephyr.bin\n# -- runners.dfu-util: DFU transfer complete\n\n# Open serial console (Linux)\nscreen /dev/ttyACM0 115200\n# Or with minicom:\nminicom -D /dev/ttyACM0 -b 115200\n\n# Expected console output:\n# [00:00:00.012,000] <inf> sg93_blink: SG-93: RGB blink starting\n# [00:00:00.512,000] <inf> sg93_blink: RED\n# [00:00:01.012,000] <inf> sg93_blink: GREEN\n# [00:00:01.512,000] <inf> sg93_blink: BLUE\n\n# If lsusb does not show the DFU device, retry the button sequence.\n# Timing is: hold USER, then tap RESET (release immediately), hold USER 1s, release.',
                language: 'bash',
                codeCaption: 'If dfu-util reports "No DFU capable USB device available", you are not in DFU mode. Check the button sequence and try again.'
            },
            {
                title: 'Add User Button Input to Gate the Pattern',
                content: '<p>Extend the program to pause the RGB cycle when the user button is held. The button is declared in the DTS with the alias <code>sw0</code>. Configure it as an input with the internal pull-up active. Read it with <code>gpio_pin_get_dt()</code> inside the loop. When the button returns 1 (active-low, so physically pressed), skip the color change and wait.</p>',
                code: '#include <zephyr/kernel.h>\n#include <zephyr/drivers/gpio.h>\n#include <zephyr/logging/log.h>\n\nLOG_MODULE_REGISTER(sg93_btn, LOG_LEVEL_INF);\n\n#define LED_RED_NODE   DT_ALIAS(led0)\n#define LED_GREEN_NODE DT_ALIAS(led1)\n#define LED_BLUE_NODE  DT_ALIAS(led2)\n#define BTN_NODE       DT_ALIAS(sw0)\n\nstatic const struct gpio_dt_spec led_red   = GPIO_DT_SPEC_GET(LED_RED_NODE,   gpios);\nstatic const struct gpio_dt_spec led_green = GPIO_DT_SPEC_GET(LED_GREEN_NODE, gpios);\nstatic const struct gpio_dt_spec led_blue  = GPIO_DT_SPEC_GET(LED_BLUE_NODE,  gpios);\nstatic const struct gpio_dt_spec btn       = GPIO_DT_SPEC_GET(BTN_NODE,       gpios);\n\nstatic void leds_off(void)\n{\n    gpio_pin_set_dt(&led_red,   0);\n    gpio_pin_set_dt(&led_green, 0);\n    gpio_pin_set_dt(&led_blue,  0);\n}\n\nint main(void)\n{\n    gpio_pin_configure_dt(&led_red,   GPIO_OUTPUT_INACTIVE);\n    gpio_pin_configure_dt(&led_green, GPIO_OUTPUT_INACTIVE);\n    gpio_pin_configure_dt(&led_blue,  GPIO_OUTPUT_INACTIVE);\n    gpio_pin_configure_dt(&btn,       GPIO_INPUT);\n\n    const struct gpio_dt_spec *colors[] = { &led_red, &led_green, &led_blue };\n    const char *names[] = { "RED", "GREEN", "BLUE" };\n    int idx = 0;\n\n    LOG_INF("SG-93: button-gated RGB ready. Hold USER to pause.");\n\n    while (1) {\n        if (gpio_pin_get_dt(&btn) == 1) {\n            /* Button held — all LEDs off, spin */\n            leds_off();\n            k_msleep(50);\n            continue;\n        }\n        leds_off();\n        gpio_pin_set_dt(colors[idx], 1);\n        LOG_INF("%s", names[idx]);\n        idx = (idx + 1) % 3;\n        k_msleep(500);\n    }\n    return 0;\n}',
                language: 'c',
                codeCaption: 'gpio_pin_get_dt() returns 1 when the active-low button is physically pressed (pin reads 0). The DTS GPIO_ACTIVE_LOW flag inverts the logical value automatically.'
            }
        ],

        challenges: '<p><strong>Challenge 1: PWM Breathing Effect</strong> &mdash; Enable <code>CONFIG_PWM=y</code> and switch the LED control from GPIO to the Zephyr PWM API (<code>pwm_set_dt()</code>). Fade each color channel in and out using a sine-wave approximation computed with integer math. The MSPM0L1117 has three PWM outputs that map to the RGB pins.</p>' +
                    '<p><strong>Challenge 2: Morse Code via RGB</strong> &mdash; Write a <code>morse_flash()</code> function that accepts a string and blinks the red LED in Morse code. Dots are 100ms, dashes are 300ms, letter gaps are 200ms. Call it with your initials on boot before entering the RGB cycle.</p>' +
                    '<p><strong>Challenge 3: Boot Counter in Flash</strong> &mdash; Use the Zephyr NVS (Non-Volatile Storage) subsystem to persist a boot counter across resets. On each boot, increment the counter, log it, and flash the blue LED that many times (up to 8). This demonstrates how firmware can maintain state without a filesystem.</p>' +
                    '<p><strong>Challenge 4: Interrupt-Driven Button</strong> &mdash; Replace the polling loop with a GPIO interrupt callback registered via <code>gpio_init_callback()</code> and <code>gpio_add_callback()</code>. On each button press, advance the color index from the ISR context using an atomic variable. This is how production firmware handles input without burning CPU cycles in a tight poll loop.</p>'
    },

    // ========================================================================
    // SG-94: mikroBUS Sensor Click — I2C Temperature + Humidity
    // ========================================================================
    'sg-94': {
        // Wokwi wave 3: NO SIM — BeagleConnect Zepto (TI MSPM0) not a Wokwi board; devicetree/mikroBUS/mesh/Greybus not simulable.
        simulator: { available: false, note: 'This reads a <strong>mikroBUS Click</strong> sensor over the Zepto&#39;s I2C0 bus. Wokwi has neither the BeagleConnect Zepto nor the mikroBUS Click ecosystem, so the wiring-free Click experience only exists on the real hardware. The I2C/driver code here is the transferable part.' },
        intro: '<p>The mikroBUS standard is a 42-pin socket specification created by MikroElektronika. It exposes SPI, I2C, UART, ADC, PWM, and several control lines (RST, CS, AN, INT) in a consistent pinout, so any Click board snaps onto any mikroBUS host without wiring. The BeagleConnect Zepto has one mikroBUS header that gives you access to the MSPM0L1117\'s I2C0 bus, SPI0 bus, and several GPIO lines.</p>' +
               '<p>In this project you will mount a BME280 Weather Click board onto the Zepto\'s mikroBUS header, add a Zephyr devicetree overlay that enables the BME280 sensor driver on I2C, and write a Zephyr application that calls <code>sensor_sample_fetch()</code> and <code>sensor_channel_get()</code> to read temperature, humidity, and barometric pressure. The data streams to a USB serial console in a formatted table you can log for analysis.</p>' +
               '<p>The BME280 is widely used in commercial IoT products and is the reference sensor for Zephyr\'s sensor subsystem documentation. Every technique you apply here — devicetree overlay, sensor API, formatted serial output — transfers directly to any other Zephyr-supported sensor.</p>',

        wiring: '    BeagleConnect Zepto                BME280 Weather Click\n' +
                '    mikroBUS Header                    (snaps directly in)\n' +
                '    +-------------------+              +------------------+\n' +
                '    | Pin 1  AN   PA25  |              | AN               |\n' +
                '    | Pin 2  RST  PA21  |              | RST              |\n' +
                '    | Pin 3  CS   PA22  |              | CS  (SPI, N/A)  |\n' +
                '    | Pin 4  SCK  PA24  |              | SCK (SPI, N/A)  |\n' +
                '    | Pin 5  MISO PA23  |              | MISO            |\n' +
                '    | Pin 6  MOSI PA26  |              | MOSI            |\n' +
                '    |  --- 3.3V ---     |              | 3.3V (VCC)      |\n' +
                '    |  --- GND   ---    |              | GND             |\n' +
                '    | Pin 7  PWM  PA18  |              | PWM             |\n' +
                '    | Pin 8  INT  PA19  |              | INT             |\n' +
                '    | Pin 9  RX   PA9   |              | RX  (UART, N/A) |\n' +
                '    | Pin 10 TX   PA8   |              | TX              |\n' +
                '    | Pin 11 SCL  PA31  |<---I2C SCL-->| SCL (I2C mode) |\n' +
                '    | Pin 12 SDA  PA30  |<---I2C SDA-->| SDA (I2C mode) |\n' +
                '    +-------------------+              +------------------+\n' +
                '\n' +
                '    No jumper wires. Click board snaps into socket mechanically.\n' +
                '    I2C address: 0x76 (SDO to GND on BME280 Click)',

        wiringNotes: '<p><strong>Click board installation:</strong> Align the BME280 Weather Click with the Zepto\'s mikroBUS header. The "1" marker on the Click PCB aligns with pin 1 (AN) on the host. Press down firmly until the board seats fully. The 3.3V and GND pins on the mikroBUS provide power automatically.</p>' +
                     '<p><strong>I2C addressing:</strong> The BME280 supports addresses 0x76 and 0x77 depending on the SDO pin state. The MikroElektronika Weather Click ties SDO to GND, selecting 0x76. Your devicetree overlay must match this address.</p>' +
                     '<p><strong>Bus selection:</strong> The Zepto\'s mikroBUS pins 11 (SCL = PA31) and 12 (SDA = PA30) connect to the MSPM0L1117\'s I2C0 peripheral. The devicetree overlay enables <code>&i2c0</code> and adds the BME280 as a child node.</p>' +
                     '<p><strong>Safety:</strong> The BME280 is a 3.3V device. The Zepto provides 3.3V on the mikroBUS VCC pin &mdash; this is correct. Never use a 5V mikroBUS host without a level shifter.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg94-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg94-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-94 MIKROBUS I2C — BME280 WEATHER CLICK</text>' +
            '<!-- Zepto board -->' +
            '<rect x="60" y="60" width="240" height="300" rx="10" fill="#1a2035" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="180" y="82" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="700">BeagleConnect Zepto</text>' +
            '<!-- mikroBUS header on Zepto -->' +
            '<rect x="80" y="100" width="40" height="200" rx="4" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<text x="100" y="205" text-anchor="middle" fill="#c084fc" font-size="7" writing-mode="tb">mikroBUS</text>' +
            '<!-- I2C pins highlighted -->' +
            '<rect x="80" y="245" width="40" height="15" rx="2" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="100" y="255" text-anchor="middle" fill="#4ade80" font-size="6">SCL PA31</text>' +
            '<rect x="80" y="263" width="40" height="15" rx="2" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="100" y="273" text-anchor="middle" fill="#60a5fa" font-size="6">SDA PA30</text>' +
            '<!-- 3.3V and GND -->' +
            '<rect x="80" y="157" width="40" height="12" rx="2" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="0.5"/>' +
            '<text x="100" y="165" text-anchor="middle" fill="#ef4444" font-size="6">3.3V</text>' +
            '<rect x="80" y="172" width="40" height="12" rx="2" fill="rgba(100,116,139,0.15)" stroke="#64748b" stroke-width="0.5"/>' +
            '<text x="100" y="180" text-anchor="middle" fill="#94a3b8" font-size="6">GND</text>' +
            '<!-- I2C bus wires -->' +
            '<line x1="380" y1="252" x2="490" y2="252" stroke="#22c55e" stroke-width="2"/>' +
            '<line x1="380" y1="270" x2="490" y2="270" stroke="#3b82f6" stroke-width="2"/>' +
            '<line x1="380" y1="165" x2="490" y2="165" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2"/>' +
            '<line x1="380" y1="180" x2="490" y2="180" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,2"/>' +
            '<!-- SCL/SDA labels on wires -->' +
            '<text x="435" y="248" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="600">SCL</text>' +
            '<text x="435" y="282" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">SDA</text>' +
            '<text x="435" y="161" text-anchor="middle" fill="#ef4444" font-size="7">3.3V</text>' +
            '<text x="435" y="176" text-anchor="middle" fill="#94a3b8" font-size="7">GND</text>' +
            '<!-- BME280 Click board -->' +
            '<rect x="490" y="60" width="200" height="300" rx="10" fill="#1a2035" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="590" y="82" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="700">BME280 Click</text>' +
            '<text x="590" y="96" text-anchor="middle" fill="#475569" font-size="7">Weather Click (MikroElektronika)</text>' +
            '<!-- BME280 IC -->' +
            '<rect x="545" y="140" width="90" height="60" rx="6" fill="#1e2736" stroke="#f59e0b" stroke-width="1.5"/>' +
            '<text x="590" y="164" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="700">BME280</text>' +
            '<text x="590" y="178" text-anchor="middle" fill="#475569" font-size="7">Bosch Sensortec</text>' +
            '<text x="590" y="190" text-anchor="middle" fill="#475569" font-size="6">I2C addr: 0x76</text>' +
            '<!-- Click board pins -->' +
            '<rect x="490" y="243" width="40" height="15" rx="2" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="510" y="253" text-anchor="middle" fill="#4ade80" font-size="6">SCL</text>' +
            '<rect x="490" y="261" width="40" height="15" rx="2" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="510" y="271" text-anchor="middle" fill="#60a5fa" font-size="6">SDA</text>' +
            '<!-- Zepto mikroBUS right side connector -->' +
            '<rect x="300" y="243" width="80" height="15" rx="2" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<text x="340" y="253" text-anchor="middle" fill="#4ade80" font-size="6">i2c0 SCL</text>' +
            '<rect x="300" y="261" width="80" height="15" rx="2" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="340" y="271" text-anchor="middle" fill="#60a5fa" font-size="6">i2c0 SDA</text>' +
            '<!-- Serial output arrow -->' +
            '<rect x="130" y="380" width="120" height="24" rx="4" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="190" y="395" text-anchor="middle" fill="#60a5fa" font-size="7">USB-C serial console</text>' +
            '<!-- Data flow arrow -->' +
            '<text x="360" y="395" text-anchor="middle" fill="#475569" font-size="8">Temp / Humidity / Pressure &#8594; USB CDC-ACM &#8594; Terminal</text>' +
            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Mount the Click Board and Verify Mechanical Fit',
                content: '<p>Power off the Zepto by unplugging the USB-C cable. Align the BME280 Weather Click board over the Zepto\'s mikroBUS header. The Click board\'s notch and the "1" silkscreen marker indicate pin 1 (AN). Press straight down until both rows of pins seat fully into the header. The Click board should sit flush with no rocking.</p>' +
                         '<p>Reconnect USB. The Click board draws power from the mikroBUS 3.3V rail immediately. There is nothing to configure on the Click board hardware side &mdash; the BME280 powers up in normal mode and responds to I2C commands at address 0x76.</p>',
                code: '# Verify the I2C device is visible on the bus (Zephyr shell)\n# Add CONFIG_I2C_SHELL=y and CONFIG_SHELL=y to prj.conf first\n# Then from the serial console:\ni2c scan i2c@400f0000\n# Expected output:\n#      0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f\n# 70: -- -- -- -- -- -- 76 --\n# 1 device found on bus i2c@400f0000\n\n# 0x76 = BME280 with SDO tied to GND (MikroElektronika default)',
                language: 'bash',
                codeCaption: 'The I2C shell scan confirms the BME280 is electrically present before you write any sensor driver code.'
            },
            {
                title: 'Add the Devicetree Overlay for the BME280',
                content: '<p>Create a <code>boards/</code> directory inside your application and add a file named <code>beagleconnect_zepto.overlay</code>. This overlay appends the BME280 node to the <code>&i2c0</code> bus at address 0x76. Zephyr\'s build system merges the overlay with the board DTS automatically when it detects the matching filename.</p>',
                code: '# File: boards/beagleconnect_zepto.overlay\n\n&i2c0 {\n    status = "okay";\n    bme280: bme280@76 {\n        compatible = "bosch,bme280";\n        reg = <0x76>;\n        label = "BME280";\n    };\n};\n\n# prj.conf additions\nCONFIG_I2C=y\nCONFIG_SENSOR=y\nCONFIG_BME280=y\nCONFIG_USB_DEVICE_STACK=y\nCONFIG_USB_CDC_ACM=y\nCONFIG_SERIAL=y\nCONFIG_CONSOLE=y\nCONFIG_UART_CONSOLE=y',
                language: 'dts',
                codeCaption: 'The overlay filename must exactly match the board identifier: beagleconnect_zepto.overlay — case sensitive.'
            },
            {
                title: 'Write the Sensor Read Application',
                content: '<p>Use the Zephyr Sensor API. The two-call pattern is consistent across all Zephyr sensors: <code>sensor_sample_fetch()</code> triggers a measurement and caches it in the driver, then <code>sensor_channel_get()</code> reads individual channels from that cache. The result is a <code>struct sensor_value</code> with an integer part (<code>.val1</code>) and a fractional part (<code>.val2</code>) in millionths.</p>',
                code: '#include <zephyr/kernel.h>\n#include <zephyr/device.h>\n#include <zephyr/drivers/sensor.h>\n#include <zephyr/logging/log.h>\n#include <stdio.h>\n\nLOG_MODULE_REGISTER(sg94_sensor, LOG_LEVEL_INF);\n\nint main(void)\n{\n    const struct device *dev = DEVICE_DT_GET_ANY(bosch_bme280);\n\n    if (!device_is_ready(dev)) {\n        LOG_ERR("BME280 not ready — check devicetree overlay and I2C wiring");\n        return -ENODEV;\n    }\n\n    LOG_INF("SG-94: BME280 sensor online at I2C 0x76");\n    printk("\\n%-20s %-20s %-20s\\n", "Temperature (C)", "Humidity (%RH)", "Pressure (hPa)");\n    printk("%s\\n", "------------------------------------------------------------");\n\n    struct sensor_value temp, hum, press;\n\n    while (1) {\n        int rc = sensor_sample_fetch(dev);\n        if (rc != 0) {\n            LOG_ERR("sensor_sample_fetch failed: %d", rc);\n            k_msleep(1000);\n            continue;\n        }\n\n        sensor_channel_get(dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);\n        sensor_channel_get(dev, SENSOR_CHAN_HUMIDITY,     &hum);\n        sensor_channel_get(dev, SENSOR_CHAN_PRESS,        &press);\n\n        /* sensor_value: val1 = integer, val2 = fractional (millionths) */\n        printk("%-20s %-20s %-20s\\n",\n               /* temp  */ \"\",\n               /* hum   */ \"\",\n               /* press */ \"\");\n\n        /* Formatted output using integer arithmetic */\n        printk("%d.%02d C            %d.%02d %%RH         %d.%02d hPa\\n",\n               temp.val1,  abs(temp.val2)  / 10000,\n               hum.val1,   abs(hum.val2)   / 10000,\n               press.val1, abs(press.val2) / 10000);\n\n        k_msleep(2000);\n    }\n    return 0;\n}',
                language: 'c',
                codeCaption: 'sensor_value.val2 is in millionths. Dividing by 10000 gives two decimal places. Use abs() because val2 can be negative when val1 is 0 and the reading is negative.'
            },
            {
                title: 'Verify Serial Output and Data Formatting',
                content: '<p>Build and flash. Connect a terminal at 115200 baud. You should see a table updating every 2 seconds. Breathe on the BME280 sensor to verify the humidity reading climbs &mdash; it will react within 1-2 seconds. Move the board to different locations to observe pressure changes (a 10-metre elevation change produces roughly 1.2 hPa).</p>',
                code: '# Build and flash\nwest build -b beagleconnect_zepto sg94-sensor\nwest flash\n\n# Expected serial output:\n# [00:00:00.040,000] <inf> sg94_sensor: SG-94: BME280 sensor online at I2C 0x76\n#\n# Temperature (C)     Humidity (%RH)      Pressure (hPa)\n# ------------------------------------------------------------\n# 23.45 C             48.12 %RH           1013.25 hPa\n# 23.46 C             48.14 %RH           1013.24 hPa\n# 23.46 C             55.20 %RH           1013.25 hPa  <- breath\n\n# To log to a file on Linux:\nscreen -L -Logfile sg94-log.txt /dev/ttyACM0 115200',
                language: 'bash',
                codeCaption: 'The -L flag in screen enables logging. You will find sg94-log.txt in the current directory after ending the session with Ctrl-A K.'
            },
            {
                title: 'Format Output as CSV for Data Analysis',
                content: '<p>Modify the output to CSV format so readings can be imported directly into a spreadsheet or processed by Python. Add a millisecond timestamp using <code>k_uptime_get()</code>. This is the output format used in the SG-95 multi-node array project.</p>',
                code: '/* Replace the printk loop with this CSV version */\n\n/* Print CSV header once */\nprintk("timestamp_ms,temp_c,humidity_pct,pressure_hpa\\n");\n\nwhile (1) {\n    sensor_sample_fetch(dev);\n    sensor_channel_get(dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);\n    sensor_channel_get(dev, SENSOR_CHAN_HUMIDITY,     &hum);\n    sensor_channel_get(dev, SENSOR_CHAN_PRESS,        &press);\n\n    int64_t uptime = k_uptime_get();\n\n    printk("%lld,%d.%02d,%d.%02d,%d.%02d\\n",\n           uptime,\n           temp.val1,  abs(temp.val2)  / 10000,\n           hum.val1,   abs(hum.val2)   / 10000,\n           press.val1, abs(press.val2) / 10000);\n\n    k_msleep(2000);\n}\n\n/* Example output:\n   timestamp_ms,temp_c,humidity_pct,pressure_hpa\n   2012,23.45,48.12,1013.25\n   4024,23.46,48.14,1013.24\n*/',
                language: 'c',
                codeCaption: 'k_uptime_get() returns milliseconds since boot as int64_t. This gives a monotonic timestamp relative to the node — important for multi-node correlation in SG-95.'
            }
        ],

        challenges: '<p><strong>Challenge 1: Altitude Calculation</strong> &mdash; Implement the barometric altitude formula in C using Zephyr\'s <code>&lt;math.h&gt;</code> (add <code>CONFIG_NEWLIB_LIBC=y</code> to enable floating-point math). At sea level standard pressure is 1013.25 hPa. Print the computed altitude alongside the sensor readings and verify it against your building\'s known elevation.</p>' +
                    '<p><strong>Challenge 2: Threshold Alerts</strong> &mdash; Add configurable thresholds for temperature and humidity. When either reading exceeds the threshold, flash the red LED three times and print a <code>WARN</code> log message. Store the thresholds in a <code>const</code> struct so they are easy to adjust without hunting through the code.</p>' +
                    '<p><strong>Challenge 3: Second Click Board via Qwiic</strong> &mdash; Add an SHTC3 humidity sensor on one of the Zepto\'s Qwiic connectors (I2C address 0x70). Modify the devicetree overlay to add both sensors on <code>&i2c0</code>, read both simultaneously, and print a comparison table showing the delta between the two humidity sensors. This is standard sensor cross-validation practice.</p>' +
                    '<p><strong>Challenge 4: Interrupt-Driven Data Ready</strong> &mdash; Configure the BME280 for forced mode sampling and wire the BME280 data-ready signal to the mikroBUS INT pin (PA19). Register a GPIO interrupt callback that triggers a sensor fetch only when new data is available. Compare CPU utilization to the polling approach by measuring how often the main thread wakes.</p>'
    },

    // ========================================================================
    // SG-95: Multi-Node Sensor Array — 3 Zeptos, 1 Dashboard
    // ========================================================================
    'sg-95': {
        // Wokwi wave 3: NO SIM — BeagleConnect Zepto (TI MSPM0) not a Wokwi board; devicetree/mikroBUS/mesh/Greybus not simulable.
        simulator: { available: false, note: 'A <strong>multi-node radio mesh</strong> (three Zeptos reporting to one dashboard) depends on real sub-GHz radios and several physical boards &mdash; there is no simulated RF mesh in Wokwi. Study the mesh protocol and dashboard code here; run it across real nodes.' },
        intro: '<p>A single sensor tells you about one location at one moment. A sensor array tells you about gradients, distributions, and anomalies across space and time &mdash; and that is where IoT becomes genuinely useful for security and monitoring applications. In this project you will operate three BeagleConnect Zepto boards simultaneously, each flashed with a variant of the SG-94 firmware that includes a unique node ID, all connected to a USB hub plugged into your laptop.</p>' +
               '<p>On the host side, a Python 3 script discovers all three serial ports, opens them concurrently using threads, and aggregates the incoming CSV streams into a shared data structure. A live terminal dashboard built with the <code>rich</code> library renders a table that refreshes every two seconds, showing current readings from all three nodes side by side. You will see firsthand how multi-source data aggregation works at the software level &mdash; the same architecture used by industrial SCADA systems and security telemetry pipelines.</p>' +
               '<p>This project also exposes a real vulnerability: the data flowing from the Zeptos to the aggregator is plaintext and unauthenticated. Anyone with access to the USB hub can inject or modify readings. SG-97 builds on this setup to audit and harden the communication channel.</p>',

        wiring: '    Node A (Zepto #1)  ----USB-C----> USB Hub Port 1 ---+\n' +
                '    Node B (Zepto #2)  ----USB-C----> USB Hub Port 2 ---+--> Laptop\n' +
                '    Node C (Zepto #3)  ----USB-C----> USB Hub Port 3 ---+\n' +
                '\n' +
                '    Each Zepto carries a different Click board (optional):\n' +
                '    Node A: BME280 Weather Click  (temp/humidity/pressure)\n' +
                '    Node B: BME280 Weather Click  (temp/humidity/pressure)\n' +
                '    Node C: BME280 Weather Click  (temp/humidity/pressure)\n' +
                '\n' +
                '    Or run all three without Click boards using the MSPM0L1117\n' +
                '    internal temperature sensor for a minimal-hardware demonstration.\n' +
                '\n' +
                '    Linux: /dev/ttyACM0, /dev/ttyACM1, /dev/ttyACM2\n' +
                '    Windows: COM3, COM4, COM5  (check Device Manager)',

        wiringNotes: '<p><strong>USB hub requirement:</strong> Use a powered USB hub if the Zepto boards draw more than 500mA combined from the laptop port. An unpowered hub sharing a single 500mA port will cause brownout resets on the Zepto boards. Each Zepto draws approximately 50-80mA with a Click board attached, so three together sit well under 500mA &mdash; an unpowered hub is adequate here.</p>' +
                     '<p><strong>Port enumeration:</strong> Linux assigns <code>/dev/ttyACMx</code> in plug-in order. Unplug all three, then plug them in one at a time to get predictable assignments: first plugged = ACM0, second = ACM1, third = ACM2. On Windows, Device Manager shows each port under "Ports (COM &amp; LPT)".</p>' +
                     '<p><strong>Node IDs:</strong> Flash each Zepto with a different firmware binary where only the <code>NODE_ID</code> constant differs. The Python aggregator reads the node ID from the CSV prefix and routes data to the correct display column.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg95-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg95-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-95 MULTI-NODE SENSOR ARRAY</text>' +
            '<!-- Node A -->' +
            '<rect x="30" y="60" width="130" height="90" rx="8" fill="#1a2035" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="95" y="82" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="700">Node A</text>' +
            '<text x="95" y="96" text-anchor="middle" fill="#475569" font-size="7">Zepto #1</text>' +
            '<rect x="45" y="102" width="100" height="18" rx="3" fill="#1e2736" stroke="#f59e0b" stroke-width="0.5"/>' +
            '<text x="95" y="114" text-anchor="middle" fill="#fbbf24" font-size="6">BME280 Click</text>' +
            '<text x="95" y="140" text-anchor="middle" fill="#475569" font-size="6">NODE_ID = "A"</text>' +
            '<!-- Node B -->' +
            '<rect x="30" y="175" width="130" height="90" rx="8" fill="#1a2035" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="95" y="197" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="700">Node B</text>' +
            '<text x="95" y="211" text-anchor="middle" fill="#475569" font-size="7">Zepto #2</text>' +
            '<rect x="45" y="217" width="100" height="18" rx="3" fill="#1e2736" stroke="#f59e0b" stroke-width="0.5"/>' +
            '<text x="95" y="229" text-anchor="middle" fill="#fbbf24" font-size="6">BME280 Click</text>' +
            '<text x="95" y="255" text-anchor="middle" fill="#475569" font-size="6">NODE_ID = "B"</text>' +
            '<!-- Node C -->' +
            '<rect x="30" y="290" width="130" height="90" rx="8" fill="#1a2035" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="95" y="312" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="700">Node C</text>' +
            '<text x="95" y="326" text-anchor="middle" fill="#475569" font-size="7">Zepto #3</text>' +
            '<rect x="45" y="332" width="100" height="18" rx="3" fill="#1e2736" stroke="#f59e0b" stroke-width="0.5"/>' +
            '<text x="95" y="344" text-anchor="middle" fill="#fbbf24" font-size="6">BME280 Click</text>' +
            '<text x="95" y="370" text-anchor="middle" fill="#475569" font-size="6">NODE_ID = "C"</text>' +
            '<!-- USB wires to hub -->' +
            '<line x1="160" y1="105" x2="300" y2="200" stroke="#ef4444" stroke-width="1.5"/>' +
            '<line x1="160" y1="220" x2="300" y2="210" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="160" y1="335" x2="300" y2="220" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<!-- USB Hub -->' +
            '<rect x="295" y="170" width="100" height="80" rx="6" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<text x="345" y="205" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">USB Hub</text>' +
            '<text x="345" y="220" text-anchor="middle" fill="#475569" font-size="7">(powered)</text>' +
            '<!-- Hub to laptop -->' +
            '<line x1="395" y1="210" x2="490" y2="210" stroke="#a855f7" stroke-width="2"/>' +
            '<polygon points="486,206 496,210 486,214" fill="#a855f7"/>' +
            '<!-- Laptop / dashboard -->' +
            '<rect x="490" y="80" width="210" height="280" rx="10" fill="#1a2035" stroke="#60a5fa" stroke-width="1.5"/>' +
            '<text x="595" y="102" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="700">Laptop Dashboard</text>' +
            '<text x="595" y="116" text-anchor="middle" fill="#475569" font-size="7">Python 3 / rich library</text>' +
            '<!-- Dashboard table mockup -->' +
            '<rect x="504" y="124" width="182" height="210" rx="4" fill="#0d1117" stroke="#1e2736" stroke-width="1"/>' +
            '<text x="595" y="142" text-anchor="middle" fill="#8b949e" font-size="7" font-weight="600">Node  Temp    Hum    Press</text>' +
            '<line x1="510" y1="147" x2="680" y2="147" stroke="#1e2736" stroke-width="0.5"/>' +
            '<text x="510" y="162" fill="#ef4444" font-size="7">A     23.4C   48%    1013hPa</text>' +
            '<text x="510" y="176" fill="#22c55e" font-size="7">B     23.6C   51%    1013hPa</text>' +
            '<text x="510" y="190" fill="#3b82f6" font-size="7">C     22.9C   47%    1013hPa</text>' +
            '<text x="595" y="310" text-anchor="middle" fill="#475569" font-size="7">refreshes every 2s</text>' +
            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Flash Three Firmware Variants with Node IDs',
                content: '<p>The only difference between the three firmware images is the <code>NODE_ID</code> string constant. All other logic is identical. Build three times, changing the constant before each build, and flash each Zepto in turn. Label each board A, B, and C with masking tape so you do not mix them up.</p>',
                code: '/* src/main.c — top of file, change for each node */\n#define NODE_ID "A"   /* Change to "B" or "C" for the other nodes */\n\n/* In the CSV output loop: */\nprintk("timestamp_ms,node,temp_c,humidity_pct,pressure_hpa\\n");\n\nwhile (1) {\n    sensor_sample_fetch(dev);\n    sensor_channel_get(dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);\n    sensor_channel_get(dev, SENSOR_CHAN_HUMIDITY,     &hum);\n    sensor_channel_get(dev, SENSOR_CHAN_PRESS,        &press);\n\n    printk("%lld,%s,%d.%02d,%d.%02d,%d.%02d\\n",\n           k_uptime_get(),\n           NODE_ID,\n           temp.val1,  abs(temp.val2)  / 10000,\n           hum.val1,   abs(hum.val2)   / 10000,\n           press.val1, abs(press.val2) / 10000);\n\n    k_msleep(2000);\n}\n\n# Build and flash sequence\n# For node A:\nwest build -b beagleconnect_zepto sg95-node -- -DNODE_ID_STR="A"\nwest flash   # with Node A connected\n\n# For node B:\nwest build -b beagleconnect_zepto sg95-node -- -DNODE_ID_STR="B"\nwest flash   # with Node B connected\n\n# For node C:\nwest build -b beagleconnect_zepto sg95-node -- -DNODE_ID_STR="C"\nwest flash   # with Node C connected',
                language: 'c',
                codeCaption: 'Alternatively pass NODE_ID as a CMake variable (-DCONFIG_NODE_ID="B") and reference it via Kconfig string in firmware to avoid recompilation.'
            },
            {
                title: 'Discover Serial Ports and Test Each Node',
                content: '<p>Plug all three Zeptos into the USB hub. Verify that three serial ports appear. Test each one individually with a terminal before running the aggregator, confirming valid CSV output and the correct node ID in column 2.</p>',
                code: '# Linux — list CDC-ACM ports\nls /dev/ttyACM*\n# Output: /dev/ttyACM0  /dev/ttyACM1  /dev/ttyACM2\n\n# Quick test each node (Ctrl-C to exit)\npython3 -c "\nimport serial, time\nwith serial.Serial(\'/dev/ttyACM0\', 115200, timeout=2) as s:\n    for _ in range(5):\n        line = s.readline().decode(\'utf-8\', errors=\'replace\').strip()\n        if line: print(line)\n"\n# Expected:\n# timestamp_ms,node,temp_c,humidity_pct,pressure_hpa\n# 2014,A,23.45,48.12,1013.25\n# 4026,A,23.46,48.13,1013.25\n\n# Windows equivalent (replace port name)\n# python3 -c "import serial; ..." with port=\'COM3\'',
                language: 'python',
                codeCaption: 'If pyserial is not installed: pip3 install pyserial. Confirm node IDs match your labelled boards before proceeding.'
            },
            {
                title: 'Write the Multi-Port Python Aggregator',
                content: '<p>The aggregator opens all three ports in separate threads. Each thread reads lines continuously and pushes parsed CSV rows into a shared dictionary keyed by node ID. The main thread reads from that dictionary to update the display. Use <code>threading.Lock()</code> to prevent race conditions when the display thread reads while a reader thread is writing.</p>',
                code: '#!/usr/bin/env python3\n# sg95_aggregator.py\n# Reads CSV data from 3 Zepto nodes via USB serial concurrently.\n\nimport serial\nimport threading\nimport time\nfrom dataclasses import dataclass, field\nfrom typing import Dict\n\nPORTS = [\'/dev/ttyACM0\', \'/dev/ttyACM1\', \'/dev/ttyACM2\']\nBAUD  = 115200\n\n@dataclass\nclass NodeData:\n    node_id:  str   = "?"\n    temp:     float = 0.0\n    humidity: float = 0.0\n    pressure: float = 0.0\n    ts_ms:    int   = 0\n    updated:  bool  = False\n\nlock  = threading.Lock()\nstore: Dict[str, NodeData] = {}\n\ndef reader_thread(port: str) -> None:\n    """Opens a serial port and parses CSV lines into the shared store."""\n    try:\n        with serial.Serial(port, BAUD, timeout=3) as ser:\n            # Skip the header line\n            ser.readline()\n            while True:\n                raw = ser.readline().decode(\'utf-8\', errors=\'replace\').strip()\n                if not raw:\n                    continue\n                parts = raw.split(\',\')\n                if len(parts) != 5:\n                    continue\n                ts, node, temp, hum, press = parts\n                nd = NodeData(\n                    node_id  = node,\n                    temp     = float(temp),\n                    humidity = float(hum),\n                    pressure = float(press),\n                    ts_ms    = int(ts),\n                    updated  = True,\n                )\n                with lock:\n                    store[node] = nd\n    except serial.SerialException as exc:\n        print(f"[ERROR] {port}: {exc}")\n\n# Start one thread per port\nfor p in PORTS:\n    t = threading.Thread(target=reader_thread, args=(p,), daemon=True)\n    t.start()\n\n# Simple polling display (replaced with rich in next step)\nwhile True:\n    with lock:\n        snapshot = dict(store)\n    print(f"\\n{time.strftime(\'%H:%M:%S\')} --- Node readings ---")\n    for node_id in sorted(snapshot):\n        nd = snapshot[node_id]\n        print(f"  Node {nd.node_id}: {nd.temp:.2f}C  {nd.humidity:.2f}%RH  {nd.pressure:.2f}hPa")\n    time.sleep(2)',
                language: 'python',
                codeCaption: 'daemon=True ensures threads exit when the main process ends (Ctrl-C). The lock prevents a partially-written NodeData from being read by the display thread.'
            },
            {
                title: 'Upgrade to a rich Live Dashboard',
                content: '<p>Replace the print loop with a <code>rich</code> live table that renders in-place using terminal ANSI escape codes. Install <code>rich</code> via pip. The <code>Live</code> context manager handles the refresh cycle; you only need to rebuild the table on each tick.</p>',
                code: '#!/usr/bin/env python3\n# sg95_dashboard.py  (extends aggregator — add after the thread start block)\n\nfrom rich.console import Console\nfrom rich.table  import Table\nfrom rich.live   import Live\nfrom rich        import box\n\nconsole = Console()\n\ndef build_table(snapshot: dict) -> Table:\n    tbl = Table(\n        title="[bold cyan]SG-95 Sensor Array[/bold cyan]",\n        box=box.ROUNDED,\n        show_header=True,\n        header_style="bold white",\n    )\n    tbl.add_column("Node",     style="bold",   width=6)\n    tbl.add_column("Temp (C)", style="yellow", width=12)\n    tbl.add_column("Hum (%)",  style="cyan",   width=12)\n    tbl.add_column("Press (hPa)", style="green", width=14)\n    tbl.add_column("Last seen (ms)", style="dim", width=16)\n\n    node_colors = {"A": "red", "B": "green", "C": "blue"}\n\n    for node_id in sorted(snapshot):\n        nd = snapshot[node_id]\n        color = node_colors.get(nd.node_id, "white")\n        stale = "[dim](stale)[/dim]" if not nd.updated else ""\n        tbl.add_row(\n            f"[{color}]{nd.node_id}[/{color}]",\n            f"{nd.temp:.2f} {stale}",\n            f"{nd.humidity:.2f}",\n            f"{nd.pressure:.2f}",\n            str(nd.ts_ms),\n        )\n    return tbl\n\nwith Live(console=console, refresh_per_second=2) as live:\n    while True:\n        with lock:\n            snapshot = dict(store)\n            for nd in store.values():\n            # Mark all as not-updated so stale status is detectable\n                nd.updated = False\n        live.update(build_table(snapshot))\n        time.sleep(2)',
                language: 'python',
                codeCaption: 'pip3 install rich. The Live context manager clears and redraws the table in-place. Stale rows (no new data in the last cycle) are marked dim.'
            }
        ],

        challenges: '<p><strong>Challenge 1: Node Auto-Discovery</strong> &mdash; Remove the hardcoded <code>PORTS</code> list. Instead, scan <code>/dev/ttyACM*</code> at startup using <code>glob.glob()</code>, open each one, read the first two lines, and identify Zepto nodes by checking for the CSV header. Register only confirmed Zepto ports. This makes the script work regardless of plug order.</p>' +
                    '<p><strong>Challenge 2: Anomaly Detection</strong> &mdash; Add a per-node rolling average over the last 10 readings. If any single reading deviates from the rolling average by more than 3 standard deviations, print a red warning row in the dashboard and log the anomaly to a file with a timestamp. This is basic statistical process control.</p>' +
                    '<p><strong>Challenge 3: CSV File Logging</strong> &mdash; Add a background thread that writes every received data point to a timestamped CSV file (<code>session_YYYYMMDD_HHMMSS.csv</code>). After a 5-minute collection run, load the file in a Jupyter notebook and plot temperature over time for all three nodes on one chart using <code>matplotlib</code>.</p>' +
                    '<p><strong>Challenge 4: WebSocket Broadcast</strong> &mdash; Expose the aggregated data over a WebSocket using the <code>websockets</code> library. Write a minimal HTML page with JavaScript that connects to the WebSocket, receives JSON updates, and renders the three node readings in a live table in the browser. This is the architecture behind most IoT cloud dashboards.</p>'
    },

    // ========================================================================
    // SG-96: Greybus Bridge — Zepto Peripherals on Linux
    // ========================================================================
    'sg-96': {
        // Wokwi wave 3: NO SIM — BeagleConnect Zepto (TI MSPM0) not a Wokwi board; devicetree/mikroBUS/mesh/Greybus not simulable.
        simulator: { available: false, note: '<strong>Greybus</strong> bridges the Zepto&#39;s peripherals onto a Linux host over a real transport &mdash; an experimental hardware/kernel integration with nothing a simulator can stand in for. Needs the real Zepto + a Linux box.' },
        intro: '<p>Greybus is a communication protocol originally designed for the Project Ara modular smartphone. It was upstreamed into the Linux kernel and is now supported by BeagleConnect firmware as a way to expose microcontroller peripherals to a Linux host as native kernel subsystem devices. When you flash Greybus firmware onto a Zepto and connect it to a Raspberry Pi (or any Linux machine), the Click board sensor on the Zepto appears as a standard <code>/dev/iio</code> device &mdash; readable with the same tools you would use for a sensor soldered directly to the Pi.</p>' +
               '<p>The significance for security work is substantial: Greybus completely decouples the sensor hardware from the host software. No custom firmware needs to run on the Pi. No Python scripts, no custom drivers, no serial parsing. The Pi kernel\'s Industrial I/O (IIO) subsystem handles everything. This means a Zepto can be deployed as a sensor puck, plugged into any Linux host, and start delivering data immediately through standardized kernel interfaces that security tools like Falco and auditd can monitor.</p>' +
               '<p>This project walks through flashing the Greybus firmware, verifying device enumeration, reading sensor data using standard Linux command-line tools, and writing a minimal shell script that logs IIO data to a file &mdash; no C programming and no Python required on the host side.</p>',

        wiring: '    BeagleConnect Zepto          Raspberry Pi 4 (or any Linux host)\n' +
                '    +-------------------+         +-------------------------+\n' +
                '    |                   |         |                         |\n' +
                '    | USB-C port   <----|--USB--->| USB-A port              |\n' +
                '    |                   |         |                         |\n' +
                '    | BME280 Click      |         | Greybus kernel module   |\n' +
                '    | mounted on        |         | (gb-temperature, etc.)  |\n' +
                '    | mikroBUS header   |         |                         |\n' +
                '    |                   |         | /dev/iio:device0        |\n' +
                '    +-------------------+         |   in_temp_input         |\n' +
                '                                  |   in_humidityrelative   |\n' +
                '                                  |   in_pressure_input     |\n' +
                '                                  +-------------------------+\n' +
                '\n' +
                '    One USB-C to USB-A cable. No other wiring.',

        wiringNotes: '<p><strong>Raspberry Pi requirement:</strong> Raspberry Pi 4 running Raspberry Pi OS Bookworm (64-bit) or Ubuntu 22.04. The Greybus kernel modules (<code>greybus</code>, <code>gb-usb</code>, <code>gb-bridged-phy</code>) are built into the Raspberry Pi OS kernel since version 6.1. No module compilation needed.</p>' +
                     '<p><strong>USB connection:</strong> A standard USB-C to USB-A cable connects the Zepto to the Pi. Power flows from the Pi to the Zepto &mdash; the Zepto does not need a separate USB-C power supply in this configuration.</p>' +
                     '<p><strong>Click board:</strong> The BME280 Weather Click from SG-94 is used here. The Greybus firmware on the Zepto scans the I2C bus and exports discovered sensors automatically over the Greybus protocol.</p>' +
                     '<p><strong>Greybus vs direct I2C:</strong> Greybus adds one USB round-trip of latency per sensor read (&lt;5ms at USB full-speed). For environmental monitoring at 1-second intervals, this is imperceptible. For latency-sensitive applications, direct I2C on the host is faster.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg96-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg96-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-96 GREYBUS BRIDGE — ZEPTO TO LINUX IIO</text>' +
            '<!-- Zepto -->' +
            '<rect x="40" y="80" width="180" height="200" rx="10" fill="#1a2035" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="130" y="102" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="700">Zepto</text>' +
            '<text x="130" y="116" text-anchor="middle" fill="#475569" font-size="7">Greybus firmware</text>' +
            '<rect x="60" y="130" width="140" height="40" rx="4" fill="#1e2736" stroke="#f59e0b" stroke-width="1"/>' +
            '<text x="130" y="148" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="600">BME280 Click</text>' +
            '<text x="130" y="162" text-anchor="middle" fill="#475569" font-size="6">I2C 0x76</text>' +
            '<rect x="60" y="182" width="140" height="28" rx="4" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="130" y="198" text-anchor="middle" fill="#60a5fa" font-size="7">Greybus I2C bridge</text>' +
            '<rect x="74" y="226" width="30" height="16" rx="3" fill="#1e2736" stroke="#60a5fa" stroke-width="1"/>' +
            '<text x="89" y="237" text-anchor="middle" fill="#60a5fa" font-size="6">USB-C</text>' +
            '<!-- USB cable -->' +
            '<line x1="230" y1="234" x2="370" y2="234" stroke="#60a5fa" stroke-width="3"/>' +
            '<polygon points="366,229 376,234 366,239" fill="#60a5fa"/>' +
            '<text x="300" y="222" text-anchor="middle" fill="#475569" font-size="7">USB cable</text>' +
            '<!-- Greybus abstraction layers -->' +
            '<rect x="200" y="300" width="320" height="80" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="1"/>' +
            '<text x="360" y="318" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">Greybus Protocol Stack</text>' +
            '<rect x="215" y="326" width="130" height="16" rx="3" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="280" y="337" text-anchor="middle" fill="#c084fc" font-size="6">gb-temperature driver</text>' +
            '<rect x="355" y="326" width="150" height="16" rx="3" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="0.5"/>' +
            '<text x="430" y="337" text-anchor="middle" fill="#c084fc" font-size="6">gb-humidity / gb-pressure</text>' +
            '<rect x="215" y="348" width="290" height="16" rx="3" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" stroke-width="0.5"/>' +
            '<text x="360" y="359" text-anchor="middle" fill="#60a5fa" font-size="6">Linux IIO subsystem (kernel)</text>' +
            '<!-- Raspberry Pi -->' +
            '<rect x="380" y="80" width="300" height="200" rx="10" fill="#1a2035" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="530" y="102" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="700">Raspberry Pi 4</text>' +
            '<text x="530" y="116" text-anchor="middle" fill="#475569" font-size="7">Linux 6.1+ / RPi OS Bookworm</text>' +
            '<rect x="398" y="128" width="264" height="50" rx="4" fill="#0d1117" stroke="#1e2736" stroke-width="1"/>' +
            '<text x="530" y="145" text-anchor="middle" fill="#8b949e" font-size="7" font-weight="600">/sys/bus/iio/devices/iio:device0/</text>' +
            '<text x="408" y="160" fill="#4ade80" font-size="6">in_temp_input</text>' +
            '<text x="508" y="160" fill="#60a5fa" font-size="6">in_humidityrelative_input</text>' +
            '<text x="408" y="170" fill="#f59e0b" font-size="6">in_pressure_input</text>' +
            '<rect x="398" y="190" width="264" height="28" rx="4" fill="rgba(34,197,94,0.05)" stroke="#22c55e" stroke-width="0.5"/>' +
            '<text x="530" y="204" text-anchor="middle" fill="#4ade80" font-size="7">$ cat in_temp_input</text>' +
            '<text x="530" y="215" text-anchor="middle" fill="#8b949e" font-size="6">23450  (millidegrees C = 23.450 C)</text>' +
            '<rect x="398" y="230" width="30" height="16" rx="3" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="413" y="241" text-anchor="middle" fill="#4ade80" font-size="6">USB</text>' +
            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Flash Greybus Firmware onto the Zepto',
                content: '<p>The Zephyr project maintains an official Greybus sample under <code>samples/subsys/greybus/peripheral/</code>. This sample configures the Zepto to enumerate over USB as a Greybus USB device, scan its own I2C buses, and export any discovered sensors to the connected Linux host via the Greybus protocol.</p>',
                code: '# Navigate to your Zephyr workspace\ncd ~/zephyrproject\n\n# Build the Greybus peripheral sample for Zepto\nwest build -b beagleconnect_zepto zephyr/samples/subsys/greybus/peripheral\n\n# Enter DFU mode on the Zepto (hold USER, tap RESET, release USER)\n# Then flash:\nwest flash\n\n# The board will reboot and enumerate as a Greybus USB device.\n# Verify on the Pi (or any Linux host):\ndmesg | tail -20\n# Expected output:\n# usb 1-1.2: new full-speed USB device number 4 using xhci_hcd\n# usb 1-1.2: New USB device found, idVendor=1d50, idProduct=6018\n# greybus 1-1.2: new Greybus device\n# gb_tape 1-1.2:1.0: Greybus USB bridged PHY driver connected\n# iio iio:device0: BME280 registered via Greybus',
                language: 'bash',
                codeCaption: 'The BME280 Click must be mounted before flashing. The Greybus firmware scans I2C on boot and exports only sensors it finds at that moment.'
            },
            {
                title: 'Load Greybus Kernel Modules on the Pi',
                content: '<p>On Raspberry Pi OS Bookworm, the Greybus modules are compiled in but may not be auto-loaded. Check whether they are loaded and load them manually if needed. Once loaded, they persist across reboots when added to <code>/etc/modules</code>.</p>',
                code: '# Check if Greybus modules are loaded\nlsmod | grep greybus\n# If empty, load them:\nsudo modprobe greybus\nsudo modprobe gb-usb\nsudo modprobe gb-bridged-phy\n\n# Make persistent across reboots:\necho -e "greybus\\ngb-usb\\ngb-bridged-phy" | sudo tee -a /etc/modules\n\n# Plug in the Zepto via USB and verify IIO device appears:\nls /sys/bus/iio/devices/\n# Expected:\n# iio:device0\n\n# Inspect available channels:\nls /sys/bus/iio/devices/iio:device0/\n# Expected files include:\n# in_temp_input  in_humidityrelative_input  in_pressure_input  name',
                language: 'bash',
                codeCaption: 'If /sys/bus/iio/devices/ is empty after plugging in the Zepto, check dmesg for Greybus probe errors. The most common cause is the BME280 not being detected on I2C during Zepto boot.'
            },
            {
                title: 'Read Sensor Data with Standard Linux Tools',
                content: '<p>IIO devices expose measurements as plain text files under <code>/sys/bus/iio/devices/iio:device0/</code>. Read them with <code>cat</code>. Values are in millidegrees Celsius, thousandths of percent RH, and kilopascals respectively &mdash; standard IIO unit conventions.</p>',
                code: '# Read the device name to confirm it is the BME280\ncat /sys/bus/iio/devices/iio:device0/name\n# Output: bme280\n\n# Read temperature (millidegrees C)\ncat /sys/bus/iio/devices/iio:device0/in_temp_input\n# Output: 23450  (= 23.450 degrees C)\n\n# Read relative humidity (thousandths of %)\ncat /sys/bus/iio/devices/iio:device0/in_humidityrelative_input\n# Output: 48125  (= 48.125 %RH)\n\n# Read pressure (kilopascals, scaled)\ncat /sys/bus/iio/devices/iio:device0/in_pressure_input\n# Output: 101325  (= 101.325 kPa = 1013.25 hPa)\n\n# Use iio_info for a full attribute dump (part of libiio-utils)\nsudo apt install -y libiio-utils\niio_info -s\n# Lists all IIO devices with all readable attributes and current values',
                language: 'bash',
                codeCaption: 'IIO values are integers scaled by the channel\'s scale factor. Run cat in_temp_scale to see the multiplier if raw vs processed values differ.'
            },
            {
                title: 'Write a Shell Script to Log IIO Data',
                content: '<p>Write a shell script that reads all three channels every 5 seconds and appends CSV rows to a log file. This runs without Python, without any custom code on the Zepto, and without any special drivers &mdash; the entire data pipeline is standard Linux.</p>',
                code: '#!/bin/bash\n# sg96_log.sh — Log BME280 data from Greybus IIO device\n\nDEVICE="/sys/bus/iio/devices/iio:device0"\nLOGFILE="sg96_sensor_$(date +%Y%m%d_%H%M%S).csv"\nINTERVAL=5\n\n# Verify device exists\nif [ ! -d "$DEVICE" ]; then\n    echo "ERROR: IIO device not found at $DEVICE"\n    echo "Check: lsmod | grep greybus  and  dmesg | tail"\n    exit 1\nfi\n\nDEV_NAME=$(cat "$DEVICE/name" 2>/dev/null || echo "unknown")\necho "Logging $DEV_NAME to $LOGFILE every ${INTERVAL}s. Ctrl-C to stop."\n\n# Write CSV header\necho "timestamp,temp_mc,humidity_mpct,pressure_kpa" > "$LOGFILE"\n\nwhile true; do\n    TS=$(date -Iseconds)\n    TEMP=$(cat "$DEVICE/in_temp_input"          2>/dev/null || echo "0")\n    HUM=$( cat "$DEVICE/in_humidityrelative_input" 2>/dev/null || echo "0")\n    PRESS=$(cat "$DEVICE/in_pressure_input"     2>/dev/null || echo "0")\n    echo "${TS},${TEMP},${HUM},${PRESS}" | tee -a "$LOGFILE"\n    sleep "$INTERVAL"\ndone\n\n# Usage:\n# chmod +x sg96_log.sh && ./sg96_log.sh\n#\n# Output:\n# Logging bme280 to sg96_sensor_20260421_140532.csv every 5s. Ctrl-C to stop.\n# 2026-04-21T14:05:32+00:00,23450,48125,101325\n# 2026-04-21T14:05:37+00:00,23460,48130,101324',
                language: 'bash',
                codeCaption: 'Values are raw IIO integers. Divide temp by 1000 for Celsius, humidity by 1000 for %RH, pressure by 1000 for kPa.'
            },
            {
                title: 'Automate Startup with systemd',
                content: '<p>Create a systemd service that starts the logging script automatically when the Zepto is connected, using udev rules to trigger on the Greybus USB device\'s vendor and product ID. This is production deployment practice for embedded sensor nodes.</p>',
                code: '# Step 1 — udev rule to trigger on Greybus USB device\n# File: /etc/udev/rules.d/99-zepto-greybus.rules\nATTR{idVendor}=="1d50", ATTR{idProduct}=="6018", \\\n  TAG+="systemd", ENV{SYSTEMD_WANTS}="sg96-logger.service"\n\n# Reload udev:\nsudo udevadm control --reload-rules\nsudo udevadm trigger\n\n# Step 2 — systemd service unit\n# File: /etc/systemd/system/sg96-logger.service\n[Unit]\nDescription=SG-96 Greybus Sensor Logger\nAfter=dev-iio\\x3adevice0.device\nRequires=dev-iio\\x3adevice0.device\n\n[Service]\nType=simple\nExecStart=/home/pi/sg96_log.sh\nRestart=on-failure\nRestartSec=5\nUser=pi\n\n[Install]\nWantedBy=multi-user.target\n\n# Enable and start:\nsudo systemctl daemon-reload\nsudo systemctl enable sg96-logger.service\n# The service now starts automatically each time the Zepto is plugged in.',
                language: 'bash',
                codeCaption: 'The udev vendor/product IDs 1d50:6018 are the BeagleConnect Greybus USB identifiers. Verify with lsusb after plugging in the Zepto to confirm they match your firmware build.'
            }
        ],

        challenges: '<p><strong>Challenge 1: Python iio Bindings</strong> &mdash; Install <code>libiio</code> and its Python bindings (<code>pip3 install pylibiio</code>). Rewrite the logging script in Python using the <code>iio</code> module. The Python API gives you typed values and handles the scale factor conversion automatically: <code>device.find_channel("temp").attrs["raw"].value</code>. Compare the code complexity to the shell script version.</p>' +
                    '<p><strong>Challenge 2: Second Zepto, Second Device</strong> &mdash; Connect a second Zepto with a different Click board (or the same BME280 at a different location). Write a Python script that enumerates all IIO devices, identifies each by name, and logs them all to separate columns in one CSV file. This demonstrates how Greybus scales to multiple sensor nodes without any configuration changes on the Pi.</p>' +
                    '<p><strong>Challenge 3: Grafana Dashboard</strong> &mdash; Install InfluxDB and Grafana on the Pi. Modify the logging script to write data to InfluxDB using the <code>influxdb-client</code> Python package. Create a Grafana dashboard that renders temperature, humidity, and pressure as time-series panels with auto-refresh every 5 seconds. This is the standard OSS IoT monitoring stack.</p>' +
                    '<p><strong>Challenge 4: Greybus Protocol Capture</strong> &mdash; Run Wireshark with USBPcap on the Pi and capture the USB traffic between the Zepto and the Pi during a sensor read. Identify the Greybus Operation frames in the capture. Document the request/response structure for a temperature read operation. This reverse-engineering exercise builds the analysis skills used in SG-97.</p>'
    },

    // ========================================================================
    // SG-97: IoT Security Audit — Sniff, Analyze, Harden
    // ========================================================================
    'sg-97': {
        // Wokwi wave 3: NO SIM — BeagleConnect Zepto (TI MSPM0) not a Wokwi board; devicetree/mikroBUS/mesh/Greybus not simulable.
        simulator: { available: false, note: 'This security audit <strong>sniffs and hardens real IoT traffic</strong> from the Zepto nodes (WiFi/MQTT over real radios). Capturing and attacking live wireless traffic is not something Wokwi models. Learn the audit methodology here; perform it against the real mesh.' },
        intro: '<p>The SG-95 multi-node array sends plaintext CSV data over USB serial. Anyone with access to the serial port &mdash; or a malicious process running on the aggregator host &mdash; can read, modify, or inject sensor readings without detection. In a physical security monitoring system, tampered temperature or occupancy data could mask an intrusion. In an industrial control system, injected pressure readings could trigger incorrect actuator responses. This project treats the SG-95 pipeline as a target and audits it from first principles.</p>' +
               '<p>You will capture raw serial traffic using Python to demonstrate the vulnerability, then implement two mitigations: a simple XOR stream cipher to provide confidentiality, and HMAC-SHA256 to provide message authentication. Each mitigation is introduced and broken individually before combining them, following the standard process of security engineering: understand the threat model, implement controls, verify the controls actually work, and document what residual risk remains.</p>' +
               '<p>The project concludes with a structured audit report using the format required in NIST SP 800-82 (Guide to OT Security) and IEC 62443 (Industrial Cybersecurity). Writing the report is not a documentation exercise &mdash; it is the deliverable that security engineers use to communicate findings to stakeholders who cannot read code.</p>',

        wiring: '    (Reuse the SG-95 wiring setup)\n' +
                '\n' +
                '    Node A (Zepto #1)  ----USB-C----> USB Hub ---+\n' +
                '    Node B (Zepto #2)  ----USB-C----> USB Hub ---+--> Laptop\n' +
                '    Node C (Zepto #3)  ----USB-C----> USB Hub ---+\n' +
                '\n' +
                '    Threat model: attacker has\n' +
                '    - Read access to serial port (e.g. rogue process, shared machine)\n' +
                '    - Write access to serial port (can inject bytes)\n' +
                '    - Cannot modify Zepto firmware (assumed trusted hardware)\n' +
                '\n' +
                '    Mitigations applied in firmware (Zepto) and aggregator (Python).',

        wiringNotes: '<p><strong>Reuse SG-95 setup:</strong> This project adds no new hardware. The vulnerability and mitigations are purely in software &mdash; firmware on the Zepto nodes and the Python aggregator on the laptop.</p>' +
                     '<p><strong>Threat model scope:</strong> This audit covers the USB serial channel between Zepto and aggregator. It does not cover physical access to the Zepto, supply-chain attacks on the BME280 Click board, or network attacks on the aggregator host. Each of those is a separate threat model boundary.</p>' +
                     '<p><strong>XOR cipher note:</strong> XOR is not cryptographically secure for production use. It is used here because it is simple enough to implement and analyze entirely by hand, making the key management and cipher properties fully visible. The final step upgrades to AES-CTR as an extension challenge.</p>' +
                     '<p><strong>HMAC key management:</strong> In this project the HMAC key is hardcoded in firmware for simplicity. In a production system, the key would be provisioned per-device at manufacture using a hardware security module and stored in protected flash. Documenting this gap is part of the audit report.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg97-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '</defs>' +
            '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="400" fill="url(#sg97-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-97 IOT SECURITY AUDIT — BEFORE AND AFTER</text>' +
            '<!-- BEFORE label -->' +
            '<text x="180" y="54" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="700">BEFORE: Plaintext</text>' +
            '<!-- AFTER label -->' +
            '<text x="540" y="54" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="700">AFTER: Encrypted + Authenticated</text>' +
            '<!-- Divider -->' +
            '<line x1="360" y1="45" x2="360" y2="390" stroke="#1e2736" stroke-width="1" stroke-dasharray="4,3"/>' +
            '<!-- BEFORE: Zepto -->' +
            '<rect x="30" y="70" width="110" height="70" rx="6" fill="#1a2035" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="85" y="91" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700">Zepto Node</text>' +
            '<text x="85" y="105" text-anchor="middle" fill="#475569" font-size="6">printk CSV</text>' +
            '<text x="85" y="118" text-anchor="middle" fill="#ef4444" font-size="6">plaintext</text>' +
            '<!-- BEFORE: plaintext wire -->' +
            '<line x1="140" y1="105" x2="230" y2="105" stroke="#ef4444" stroke-width="2"/>' +
            '<text x="185" y="98" text-anchor="middle" fill="#ef4444" font-size="7">PLAINTEXT</text>' +
            '<text x="185" y="115" text-anchor="middle" fill="#475569" font-size="6">23.45,48.1,1013</text>' +
            '<!-- Attacker sniff -->' +
            '<rect x="155" y="125" width="90" height="30" rx="4" fill="rgba(239,68,68,0.1)" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="200" y="140" text-anchor="middle" fill="#ef4444" font-size="7">Attacker reads</text>' +
            '<text x="200" y="150" text-anchor="middle" fill="#ef4444" font-size="6">or injects data</text>' +
            '<line x1="185" y1="125" x2="185" y2="107" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<!-- BEFORE: aggregator -->' +
            '<rect x="230" y="70" width="110" height="70" rx="6" fill="#1a2035" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="285" y="91" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700">Aggregator</text>' +
            '<text x="285" y="105" text-anchor="middle" fill="#475569" font-size="6">parses CSV</text>' +
            '<text x="285" y="118" text-anchor="middle" fill="#ef4444" font-size="6">no validation</text>' +
            '<!-- BEFORE vulnerability box -->' +
            '<rect x="30" y="175" width="310" height="50" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
            '<text x="185" y="195" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">VULNERABILITIES FOUND</text>' +
            '<text x="185" y="210" text-anchor="middle" fill="#8b949e" font-size="6">V-01: Plaintext data  V-02: No authentication  V-03: No integrity check</text>' +
            '<!-- AFTER: Zepto -->' +
            '<rect x="380" y="70" width="110" height="70" rx="6" fill="#1a2035" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="435" y="91" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700">Zepto Node</text>' +
            '<text x="435" y="105" text-anchor="middle" fill="#475569" font-size="6">XOR encrypt</text>' +
            '<text x="435" y="118" text-anchor="middle" fill="#4ade80" font-size="6">+ HMAC tag</text>' +
            '<!-- AFTER: encrypted wire -->' +
            '<line x1="490" y1="105" x2="580" y2="105" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="535" y="98" text-anchor="middle" fill="#22c55e" font-size="7">ENCRYPTED</text>' +
            '<text x="535" y="115" text-anchor="middle" fill="#475569" font-size="6">cipher:A:ab3f...:hmac:9c2e...</text>' +
            '<!-- Attacker blocked -->' +
            '<rect x="505" y="125" width="90" height="30" rx="4" fill="rgba(34,197,94,0.06)" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="550" y="140" text-anchor="middle" fill="#22c55e" font-size="7">Attacker sees</text>' +
            '<text x="550" y="150" text-anchor="middle" fill="#22c55e" font-size="6">ciphertext only</text>' +
            '<line x1="535" y1="125" x2="535" y2="107" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"/>' +
            '<!-- AFTER: aggregator -->' +
            '<rect x="580" y="70" width="110" height="70" rx="6" fill="#1a2035" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="635" y="91" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700">Aggregator</text>' +
            '<text x="635" y="105" text-anchor="middle" fill="#475569" font-size="6">verify HMAC</text>' +
            '<text x="635" y="118" text-anchor="middle" fill="#4ade80" font-size="6">then decrypt</text>' +
            '<!-- AFTER mitigations box -->' +
            '<rect x="380" y="175" width="310" height="50" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
            '<text x="535" y="195" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">MITIGATIONS APPLIED</text>' +
            '<text x="535" y="210" text-anchor="middle" fill="#8b949e" font-size="6">M-01: XOR stream cipher  M-02: HMAC-SHA256  M-03: Seq counter</text>' +
            '<!-- Audit report -->' +
            '<rect x="200" y="290" width="320" height="90" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>' +
            '<text x="360" y="310" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="600">Security Audit Report</text>' +
            '<text x="360" y="326" text-anchor="middle" fill="#475569" font-size="6">NIST SP 800-82 / IEC 62443 format</text>' +
            '<text x="210" y="345" fill="#8b949e" font-size="6">1. Scope &amp; assets</text>' +
            '<text x="210" y="358" fill="#8b949e" font-size="6">2. Findings (V-01 to V-03)</text>' +
            '<text x="360" y="345" fill="#8b949e" font-size="6">3. Mitigations (M-01 to M-03)</text>' +
            '<text x="360" y="358" fill="#8b949e" font-size="6">4. Residual risk</text>' +
            '<text x="460" y="345" fill="#8b949e" font-size="6">5. Recommendations</text>' +
            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Capture and Analyze Plaintext Traffic',
                content: '<p>Start with the SG-95 setup running. Write a Python script that opens one of the Zepto serial ports and prints every byte it receives &mdash; this simulates an attacker with read access to the serial interface. Observe that all sensor data, node IDs, and timestamps are fully visible with zero effort. Then write a second script that injects a fake sensor reading to demonstrate the lack of authentication.</p>',
                code: '#!/usr/bin/env python3\n# sg97_sniff.py — Demonstrate plaintext vulnerability\n\nimport serial\nimport time\n\nPORT = \'/dev/ttyACM0\'\nBAUD = 115200\n\nprint(f"[AUDIT] Opening {PORT} — intercepting sensor traffic...")\nprint("[AUDIT] VULNERABILITY V-01: All data is plaintext\\n")\n\nwith serial.Serial(PORT, BAUD, timeout=2) as ser:\n    packet_count = 0\n    for _ in range(10):\n        line = ser.readline().decode(\'utf-8\', errors=\'replace\').strip()\n        if \',\' in line:\n            packet_count += 1\n            parts = line.split(\',\')\n            print(f"[INTERCEPT #{packet_count}] Raw: {line}")\n            if len(parts) == 5:\n                ts, node, temp, hum, press = parts\n                print(f"  Decoded: Node={node} Temp={temp}C Hum={hum}% Press={press}hPa")\n            print()\n\nprint(f"[AUDIT] Intercepted {packet_count} packets without any credentials.")\nprint("[AUDIT] VULNERABILITY V-02: No authentication — injection possible\\n")\n\n# Demonstrate injection\nprint("[AUDIT] Injecting fake reading for Node A...")\nwith serial.Serial(PORT, BAUD, timeout=1) as ser:\n    fake_line = "99999,A,99.99,99.99,999.99\\n"\n    ser.write(fake_line.encode())\n    print(f"[AUDIT] Injected: {fake_line.strip()}")\n    print("[AUDIT] Aggregator will accept this as valid data from Node A.")',
                language: 'python',
                codeCaption: 'This script models the attacker\'s perspective. Run it alongside the SG-95 aggregator to observe that the injected reading appears in the dashboard unchallenged.'
            },
            {
                title: 'Implement XOR Stream Cipher in Zepto Firmware',
                content: '<p>Add a symmetric XOR cipher to the Zepto firmware. The key is a 16-byte array. For each byte of the plaintext CSV, XOR it with the next key byte (wrapping around with modulo). The result is unreadable without the key. Update the output format to hex-encode the ciphertext so it is safe to transmit over the text-mode serial port.</p>',
                code: '/* Add to Zepto firmware: sg97_cipher.h */\n\n#ifndef SG97_CIPHER_H\n#define SG97_CIPHER_H\n\n#include <stdint.h>\n#include <string.h>\n\n/* 16-byte shared key — must match the Python aggregator exactly */\nstatic const uint8_t CIPHER_KEY[16] = {\n    0x4A, 0x7E, 0x2B, 0x91, 0xC3, 0x58, 0xAD, 0x0F,\n    0x63, 0xE7, 0x14, 0x99, 0x5C, 0x2A, 0x86, 0xD4\n};\n\n/**\n * xor_cipher: XOR-encrypt or decrypt `len` bytes of `data` in-place.\n * XOR is symmetric: calling it twice restores the original.\n */\nstatic inline void xor_cipher(uint8_t *data, size_t len)\n{\n    for (size_t i = 0; i < len; i++) {\n        data[i] ^= CIPHER_KEY[i % sizeof(CIPHER_KEY)];\n    }\n}\n\n/**\n * bytes_to_hex: Convert `len` bytes to a null-terminated hex string.\n * `out` must be at least 2*len + 1 bytes.\n */\nstatic inline void bytes_to_hex(const uint8_t *in, size_t len, char *out)\n{\n    static const char hex[] = "0123456789abcdef";\n    for (size_t i = 0; i < len; i++) {\n        out[i * 2]     = hex[(in[i] >> 4) & 0x0F];\n        out[i * 2 + 1] = hex[ in[i]       & 0x0F];\n    }\n    out[len * 2] = \'\\0\';\n}\n\n#endif /* SG97_CIPHER_H */\n\n/* In main.c — replace the plaintext printk with: */\nchar plaintext[64];\nchar ciphertext_hex[130];  /* 64 bytes * 2 hex chars + null */\nuint8_t ct_bytes[64];\n\nsnprintf(plaintext, sizeof(plaintext), "%lld,%s,%d.%02d,%d.%02d,%d.%02d",\n         k_uptime_get(), NODE_ID,\n         temp.val1,  abs(temp.val2)  / 10000,\n         hum.val1,   abs(hum.val2)   / 10000,\n         press.val1, abs(press.val2) / 10000);\n\nmemcpy(ct_bytes, plaintext, strlen(plaintext));\nxor_cipher(ct_bytes, strlen(plaintext));\nbytes_to_hex(ct_bytes, strlen(plaintext), ciphertext_hex);\n\nprintk("cipher:%s:%s\\n", NODE_ID, ciphertext_hex);',
                language: 'c',
                codeCaption: 'XOR is applied before hex encoding. The receiving Python script hex-decodes first, then XORs with the same key to recover plaintext. The NODE_ID is transmitted in the clear as a routing prefix.'
            },
            {
                title: 'Add HMAC-SHA256 Message Authentication',
                content: '<p>A cipher provides confidentiality but not authentication. An attacker who does not know the XOR key can still flip bits in the ciphertext (a bit-flip attack), corrupting the decrypted plaintext in predictable ways. Add HMAC-SHA256 to sign each message. The HMAC tag is computed over the ciphertext bytes using a separate authentication key. The receiver verifies the tag before decrypting.</p>',
                code: '/* Zepto does not have a SHA256 hardware accelerator, but Zephyr provides\n   a software implementation via the mbedTLS subsystem. */\n\n/* Add to prj.conf:\nCONFIG_MBEDTLS=y\nCONFIG_MBEDTLS_HMAC_PRNG_ENABLED=y\nCONFIG_MBEDTLS_SHA256_C=y\n*/\n\n#include <mbedtls/md.h>\n\n/* Separate 32-byte authentication key */\nstatic const uint8_t HMAC_KEY[32] = {\n    0xB2, 0x5F, 0x3C, 0xA1, 0x7D, 0x08, 0xE4, 0x96,\n    0x1B, 0xC7, 0x52, 0x3E, 0x89, 0x0D, 0xF6, 0x44,\n    0x2C, 0x71, 0xA8, 0x5B, 0x6E, 0x93, 0x17, 0xD0,\n    0x4F, 0xBC, 0x28, 0x65, 0x9A, 0xE1, 0x03, 0x7C\n};\n\nstatic void compute_hmac(const uint8_t *data, size_t len,\n                         uint8_t out_mac[32])\n{\n    mbedtls_md_hmac(mbedtls_md_info_from_type(MBEDTLS_MD_SHA256),\n                    HMAC_KEY, sizeof(HMAC_KEY),\n                    data, len,\n                    out_mac);\n}\n\n/* Updated output in the firmware loop:\n   Format: cipher:<NODE_ID>:<ciphertext_hex>:<hmac_hex>           */\nuint8_t hmac_bytes[32];\nchar    hmac_hex[65];\n\ncompute_hmac(ct_bytes, strlen(plaintext), hmac_bytes);\nbytes_to_hex(hmac_bytes, 32, hmac_hex);\n\nprintk("cipher:%s:%s:%s\\n", NODE_ID, ciphertext_hex, hmac_hex);\n/* Example output:\n   cipher:A:4af23e...91bc:a3f8d2...7c01 */\n',
                language: 'c',
                codeCaption: 'HMAC is computed over the ciphertext, not the plaintext. This "MAC-then-encrypt" ordering is standard. The receiver checks the MAC first; if it fails, it discards the packet without decrypting.'
            },
            {
                title: 'Update the Python Aggregator to Decrypt and Verify',
                content: '<p>The aggregator must verify the HMAC first, reject the packet if verification fails, and only then decrypt the ciphertext. Use Python\'s <code>hmac</code> module with <code>hmac.compare_digest()</code> for timing-safe comparison. Never use <code>==</code> to compare MAC values &mdash; it is vulnerable to timing side-channels.</p>',
                code: '#!/usr/bin/env python3\n# sg97_aggregator_secure.py\n\nimport serial\nimport hmac\nimport hashlib\nimport binascii\nimport threading\nimport time\nfrom dataclasses import dataclass\nfrom typing import Dict\n\n# Must match the keys in Zepto firmware exactly\nCIPHER_KEY = bytes([\n    0x4A, 0x7E, 0x2B, 0x91, 0xC3, 0x58, 0xAD, 0x0F,\n    0x63, 0xE7, 0x14, 0x99, 0x5C, 0x2A, 0x86, 0xD4\n])\nHMAC_KEY = bytes([\n    0xB2, 0x5F, 0x3C, 0xA1, 0x7D, 0x08, 0xE4, 0x96,\n    0x1B, 0xC7, 0x52, 0x3E, 0x89, 0x0D, 0xF6, 0x44,\n    0x2C, 0x71, 0xA8, 0x5B, 0x6E, 0x93, 0x17, 0xD0,\n    0x4F, 0xBC, 0x28, 0x65, 0x9A, 0xE1, 0x03, 0x7C\n])\n\ndef xor_decrypt(ciphertext: bytes) -> bytes:\n    key = CIPHER_KEY\n    return bytes(b ^ key[i % len(key)] for i, b in enumerate(ciphertext))\n\ndef verify_and_decrypt(line: str):\n    """\n    Returns (node_id, plaintext) on success.\n    Returns (None, None) if HMAC verification fails.\n    Format: cipher:<NODE_ID>:<ciphertext_hex>:<hmac_hex>\n    """\n    parts = line.split(\':\')\n    if len(parts) != 4 or parts[0] != \'cipher\':\n        return None, None\n\n    _, node_id, ct_hex, rx_mac_hex = parts\n\n    try:\n        ct_bytes  = binascii.unhexlify(ct_hex)\n        rx_mac    = binascii.unhexlify(rx_mac_hex)\n    except (ValueError, binascii.Error):\n        return None, None\n\n    # Verify HMAC before decrypting\n    expected_mac = hmac.new(HMAC_KEY, ct_bytes, hashlib.sha256).digest()\n    if not hmac.compare_digest(expected_mac, rx_mac):\n        print(f"[SECURITY] HMAC FAIL for node {node_id} — packet REJECTED")\n        return None, None\n\n    plaintext = xor_decrypt(ct_bytes).decode(\'utf-8\', errors=\'replace\')\n    return node_id, plaintext\n\n# Integration test — try injecting a tampered packet:\ntest_line = "cipher:A:deadbeef:0000000000000000000000000000000000000000000000000000000000000000"\nresult = verify_and_decrypt(test_line)\nprint(f"Injection test: {result}") # Expected: (None, None)',
                language: 'python',
                codeCaption: 'hmac.compare_digest() runs in constant time regardless of where the strings differ, preventing timing attacks that could recover the key one byte at a time.'
            },
            {
                title: 'Write the Security Audit Report',
                content: '<p>The audit report documents what you found, what you implemented, and what risk remains. Use the structure below. The report format follows NIST SP 800-82r3 section 6.2 (vulnerability assessment) and maps to IEC 62443-3-3 security requirements. Write it as plain text or Markdown.</p>',
                code: '# Security Audit Report\n# System: SG-95 Multi-Node Sensor Array\n# Audit date: 2026-04-21\n# Standard references: NIST SP 800-82r3, IEC 62443-3-3\n\n## 1. Scope\nAssets: 3x BeagleConnect Zepto sensor nodes, USB hub, laptop aggregator.\nChannel audited: USB CDC-ACM serial (Zepto to aggregator).\nOut of scope: physical Zepto security, supply chain, aggregator OS security.\n\n## 2. Findings\n\nV-01 | Severity: HIGH | Plaintext transmission\n  All sensor data (temperature, humidity, pressure, node ID, timestamp)\n  transmitted without encryption. Any process with access to /dev/ttyACMx\n  can read all sensor data in real time without authentication.\n  CVSS v3.1 Base Score: 7.5 (AV:P/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)\n\nV-02 | Severity: CRITICAL | No message authentication\n  No mechanism prevents an attacker from injecting fake sensor readings.\n  A rogue process can write to the serial port and the aggregator will\n  accept the data as authentic. Demonstrated: fake Node A reading of\n  99.99C injected and displayed in dashboard without error.\n  CVSS v3.1 Base Score: 8.1 (AV:P/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H)\n\nV-03 | Severity: MEDIUM | No replay protection\n  A previously-captured valid ciphertext+HMAC pair can be replayed to\n  the aggregator. Without a sequence counter or timestamp validation,\n  the aggregator will accept replayed packets as fresh data.\n\n## 3. Mitigations Implemented\n\nM-01 | Addresses V-01 | XOR stream cipher (key: 16 bytes, hardcoded)\n  All sensor data now encrypted before transmission. Sniff test confirms\n  ciphertext is not human-readable. Limitation: XOR is not semantically\n  secure; an attacker with multiple known-plaintext pairs can recover key.\n  Recommendation: Replace with AES-CTR using Zephyr PSA Crypto API.\n\nM-02 | Addresses V-02 | HMAC-SHA256 message authentication\n  Each packet includes a 32-byte HMAC over the ciphertext. Aggregator\n  verifies HMAC with timing-safe compare before decrypting. Injection\n  test confirms tampered packets are rejected. Key: 32 bytes, hardcoded.\n  Limitation: Hardcoded keys create key-management risk (see R-01).\n\nM-03 | Addresses V-03 | Sequence counter (recommended, not yet implemented)\n  Add a monotonically-increasing 32-bit counter to each packet. Aggregator\n  tracks last-seen sequence per node and rejects packets with equal or\n  lower sequence numbers. Prevents replay within a single session.\n\n## 4. Residual Risk\n\nR-01 | Key management | CRITICAL\n  Both the XOR key and HMAC key are hardcoded in firmware. Extraction\n  of any one Zepto unit exposes keys for all nodes. Remediation requires\n  per-device key provisioning at manufacture (hardware security module)\n  and a key rotation mechanism.\n\nR-02 | Physical access | HIGH\n  The threat model assumes the attacker cannot flash new firmware. If\n  physical access is obtained, the attacker can reflash a rogue firmware\n  that reports arbitrary sensor values with valid HMAC signatures.\n  Remediation: MCUBOOT secure boot with signed firmware images.\n\n## 5. Recommendations (Priority Order)\n  1. Implement MCUBOOT secure boot (blocks R-02, highest impact)\n  2. Replace XOR with AES-CTR via Zephyr PSA Crypto API (strengthens M-01)\n  3. Implement per-device key provisioning (blocks R-01)\n  4. Add sequence counter (blocks replay, implements M-03)',
                language: 'text',
                codeCaption: 'This report structure is the deliverable format expected in professional IoT security assessments. CVSS scores communicate severity to stakeholders who cannot evaluate code.'
            }
        ],

        challenges: '<p><strong>Challenge 1: Upgrade to AES-CTR Encryption</strong> &mdash; Replace the XOR cipher with AES-128-CTR using Zephyr\'s PSA Crypto API (<code>psa_cipher_encrypt()</code>). Enable <code>CONFIG_MBEDTLS_PSA_CRYPTO_C=y</code> and <code>CONFIG_PSA_CRYPTO_DRIVER_CTR_DRBG=y</code>. Generate a random IV for each packet using <code>psa_generate_random()</code> and prepend it to the ciphertext. Update the Python aggregator to extract the IV before decrypting. Document the protocol change in the audit report as an updated M-01 entry.</p>' +
                    '<p><strong>Challenge 2: Replay Attack Demonstration</strong> &mdash; Before implementing the sequence counter, write a Python script that captures one valid authenticated packet from Node A and replays it 100 times to the aggregator. Confirm the aggregator accepts all 100 replayed packets as fresh data (this is the V-03 vulnerability in action). Then implement the sequence counter in firmware and aggregator, verify that replayed packets are now rejected, and document the fix in the audit report as M-03.</p>' +
                    '<p><strong>Challenge 3: MCUBOOT Secure Boot</strong> &mdash; Enable MCUBOOT\'s image signing in the Zepto build system by adding <code>CONFIG_BOOTLOADER_MCUBOOT=y</code> and <code>CONFIG_MCUBOOT_SIGNATURE_TYPE_RSA=y</code>. Generate an RSA-2048 signing key pair using <code>imgtool keygen</code>. Sign the firmware image with <code>west build -- -DCONFIG_BOOT_SIGNATURE_KEY_FILE=signing_key.pem</code>. Verify that an unsigned firmware binary is refused by MCUBOOT on the Zepto. This closes the R-02 residual risk.</p>' +
                    '<p><strong>Challenge 4: Network Threat Model Extension</strong> &mdash; The current audit covers only the USB serial channel. Extend the threat model to cover a scenario where the aggregator laptop forwards sensor data to a cloud MQTT broker over WiFi. Identify three additional attack surfaces (MQTT channel, broker, cloud API), assign a CVSS score to each, and propose mitigations. Write the extension as an addendum to the existing audit report following the same NIST SP 800-82 structure.</p>'
    }

};
