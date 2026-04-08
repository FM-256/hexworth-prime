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

};
