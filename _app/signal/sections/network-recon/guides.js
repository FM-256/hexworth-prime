/**
 * Network Recon — Build Guides (sg-06 through sg-10)
 *
 * Loaded by individual project HTML pages before SignalEngine.renderProject().
 * The engine reads window.SignalGuides[projectId] to populate the build guide section.
 */

window.SignalGuides = window.SignalGuides || {};

// =========================================================================
// SG-06: WiFi Recon Scanner (ESP32 CYD)
// =========================================================================
window.SignalGuides['sg-06'] = {

    intro: '<p>The ESP32 CYD (Cheap Yellow Display) is a self-contained development board with a 2.8-inch ILI9341 TFT touchscreen, WiFi, Bluetooth, and an ESP32-WROOM-32 module -- all on a single PCB for about $12. In this project you will turn it into a handheld WiFi reconnaissance scanner that enumerates every access point within range.</p>' +
           '<p>The ESP32 WiFi stack exposes a scan API that returns SSID, BSSID, channel, RSSI (signal strength), and encryption type for every detected network. We will render this data on the built-in touchscreen, sort results by signal strength, flag hidden networks, and let the operator trigger rescans with a tap.</p>' +
           '<p>This is a passive scanner -- it only listens to beacon frames that access points broadcast continuously. No traffic is generated beyond the initial probe request the ESP32 sends on each channel, which is standard 802.11 behavior identical to what your phone does when it searches for WiFi.</p>',

    wiring: '  ESP32 CYD (ESP32-2432S028R)\n' +
            '  +-------------------------------+\n' +
            '  |  2.8" ILI9341 TFT (built-in)  |\n' +
            '  |  XPT2046 Touch (built-in)      |\n' +
            '  |  ESP32-WROOM-32 (on-board)     |\n' +
            '  |                                 |\n' +
            '  |  TFT Pins (hard-wired on PCB):  |\n' +
            '  |    MOSI  = GPIO 13              |\n' +
            '  |    MISO  = GPIO 12              |\n' +
            '  |    SCLK  = GPIO 14              |\n' +
            '  |    CS    = GPIO 15              |\n' +
            '  |    DC    = GPIO  2              |\n' +
            '  |    RST   = EN (reset)           |\n' +
            '  |    BL    = GPIO 21              |\n' +
            '  |                                 |\n' +
            '  |  Touch Pins (hard-wired):       |\n' +
            '  |    T_CS  = GPIO 33              |\n' +
            '  |    T_IRQ = GPIO 36              |\n' +
            '  |                                 |\n' +
            '  |  USB-C --- power + programming  |\n' +
            '  +-------------------------------+',

    wiringNotes: '<p>The CYD has <strong>no external wiring</strong> for this project. The TFT, touch controller, and ESP32 are all connected on the PCB. You only need a USB-C cable for power and flashing. The pin assignments above are documented so you can configure the TFT_eSPI library correctly.</p>',

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
        '<defs>' +
        '<pattern id="sg06-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="700" height="380" fill="url(#sg06-grid)" rx="4"/>' +
        '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">ESP32 CYD — ALL-IN-ONE BOARD LAYOUT</text>' +

        '<!-- CYD Board -->' +
        '<rect x="160" y="55" width="400" height="280" rx="10" fill="#1a1f2b" stroke="#3b82f6" stroke-width="2"/>' +
        '<rect x="160" y="55" width="400" height="30" rx="10" fill="rgba(59,130,246,0.12)"/>' +
        '<rect x="160" y="77" width="400" height="8" fill="rgba(59,130,246,0.12)"/>' +
        '<text x="360" y="75" text-anchor="middle" fill="#60a5fa" font-size="12" font-weight="600">ESP32-2432S028R (CYD)</text>' +

        '<!-- USB-C connector -->' +
        '<rect x="330" y="42" width="60" height="18" rx="4" fill="#2a2a3a" stroke="#888" stroke-width="1"/>' +
        '<text x="360" y="54" text-anchor="middle" fill="#999" font-size="7">USB-C</text>' +

        '<!-- TFT Display area -->' +
        '<rect x="185" y="100" width="200" height="140" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
        '<text x="285" y="120" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">2.8" ILI9341 TFT</text>' +
        '<text x="285" y="136" text-anchor="middle" fill="#4ade80" font-size="7">320 x 240 px</text>' +
        '<rect x="200" y="148" width="170" height="80" rx="3" fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
        '<text x="285" y="175" text-anchor="middle" fill="#22c55e" font-size="8" opacity="0.6">WiFi Scan Results</text>' +
        '<text x="285" y="190" text-anchor="middle" fill="#22c55e" font-size="6" opacity="0.4">HomeNet_5G    Ch6  WPA2</text>' +
        '<text x="285" y="200" text-anchor="middle" fill="#22c55e" font-size="6" opacity="0.4">Office_WiFi   Ch1  WPA2</text>' +
        '<text x="285" y="210" text-anchor="middle" fill="#eab308" font-size="6" opacity="0.4">[HIDDEN]      Ch11 WPA2</text>' +

        '<!-- Touch overlay label -->' +
        '<rect x="185" y="244" width="200" height="20" rx="0" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
        '<text x="285" y="257" text-anchor="middle" fill="#a855f7" font-size="7">XPT2046 Touch Controller</text>' +

        '<!-- ESP32 Module -->' +
        '<rect x="410" y="105" width="130" height="80" rx="6" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.25)" stroke-width="1"/>' +
        '<text x="475" y="125" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">ESP32-WROOM-32</text>' +
        '<rect x="440" y="135" width="70" height="12" rx="2" fill="rgba(59,130,246,0.1)"/>' +
        '<text x="475" y="144" text-anchor="middle" fill="#3b82f6" font-size="6">WiFi 802.11 b/g/n</text>' +
        '<rect x="440" y="152" width="70" height="12" rx="2" fill="rgba(59,130,246,0.1)"/>' +
        '<text x="475" y="161" text-anchor="middle" fill="#3b82f6" font-size="6">Dual-core 240MHz</text>' +
        '<rect x="440" y="169" width="70" height="12" rx="2" fill="rgba(59,130,246,0.1)"/>' +
        '<text x="475" y="178" text-anchor="middle" fill="#3b82f6" font-size="6">520KB SRAM</text>' +

        '<!-- Internal wiring traces -->' +
        '<text x="420" y="210" fill="#555" font-size="7" font-weight="600">Internal SPI Bus</text>' +
        '<line x1="385" y1="170" x2="410" y2="170" stroke="#eab308" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.5"/>' +
        '<line x1="385" y1="180" x2="410" y2="180" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.5"/>' +
        '<line x1="385" y1="190" x2="410" y2="190" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.5"/>' +

        '<!-- Pin assignment table -->' +
        '<rect x="410" y="222" width="130" height="100" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
        '<text x="475" y="237" text-anchor="middle" fill="#8b949e" font-size="7" font-weight="600">Pin Map (on-PCB)</text>' +
        '<text x="420" y="252" fill="#eab308" font-size="6">SCLK  = GPIO 14</text>' +
        '<text x="420" y="263" fill="#22c55e" font-size="6">MOSI  = GPIO 13</text>' +
        '<text x="420" y="274" fill="#3b82f6" font-size="6">MISO  = GPIO 12</text>' +
        '<text x="420" y="285" fill="#f97316" font-size="6">CS    = GPIO 15</text>' +
        '<text x="420" y="296" fill="#c084fc" font-size="6">DC    = GPIO  2</text>' +
        '<text x="420" y="307" fill="#a855f7" font-size="6">T_CS  = GPIO 33</text>' +

        '<!-- WiFi antenna indicator -->' +
        '<rect x="495" y="90" width="50" height="16" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
        '<text x="520" y="101" text-anchor="middle" fill="#22c55e" font-size="6">Antenna</text>' +

        '<!-- USB cable -->' +
        '<line x1="360" y1="42" x2="360" y2="20" stroke="#ef4444" stroke-width="2" opacity="0.6"/>' +
        '<rect x="335" y="8" width="50" height="14" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" stroke-width="0.5"/>' +
        '<text x="360" y="18" text-anchor="middle" fill="#ef4444" font-size="6">Power + Flash</text>' +

        '<!-- Legend -->' +
        '<rect x="40" y="350" width="640" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
        '<text x="60" y="372" fill="#555" font-size="7" font-weight="600">NOTES:</text>' +
        '<text x="115" y="372" fill="#8b949e" font-size="7">No external wiring needed. All components are on-board. USB-C for power and programming only.</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Install Arduino IDE and ESP32 Board Support',
            content: '<p>Open Arduino IDE (2.x recommended). Go to <strong>File > Preferences</strong> and add the ESP32 board manager URL to "Additional Board Manager URLs":</p>' +
                     '<p><code>https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json</code></p>' +
                     '<p>Then go to <strong>Tools > Board > Boards Manager</strong>, search for <strong>esp32</strong> by Espressif, and install it. Select <strong>ESP32 Dev Module</strong> as your board. Set:</p>' +
                     '<ul><li><strong>Flash Size</strong>: 4MB</li><li><strong>Partition Scheme</strong>: Default 4MB with spiffs</li><li><strong>Upload Speed</strong>: 921600</li></ul>',
            language: 'Text',
            code: 'Board Manager URL:\nhttps://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json\n\nBoard:            ESP32 Dev Module\nFlash Size:       4MB (32Mb)\nPartition Scheme: Default 4MB with spiffs\nUpload Speed:     921600\nPort:             (your USB-C serial port)',
            tip: '<strong>Port not showing?</strong> The CYD uses a CH340 USB-serial chip. Install the CH340 driver from the manufacturer if your OS does not detect it automatically.'
        },
        {
            title: 'Install and Configure TFT_eSPI for CYD',
            content: '<p>Install the <strong>TFT_eSPI</strong> library by Bodmer via the Arduino Library Manager. This library needs a custom pin configuration for the CYD board.</p>' +
                     '<p>After installing, navigate to the library folder (usually <code>~/Arduino/libraries/TFT_eSPI/</code>) and edit <code>User_Setup.h</code>. Comment out the default setup and add the CYD pin definitions. Alternatively, create a new file <code>User_Setup_Select.h</code> that points to a CYD-specific config.</p>' +
                     '<p>The key settings are the ILI9341 driver selection and the GPIO assignments that match the CYD PCB traces.</p>',
            language: 'C++',
            code: '// User_Setup.h — TFT_eSPI configuration for ESP32 CYD\n// Place in: Arduino/libraries/TFT_eSPI/User_Setup.h\n\n#define ILI9341_DRIVER\n\n#define TFT_WIDTH  240\n#define TFT_HEIGHT 320\n\n// CYD pin assignments (hard-wired on the PCB)\n#define TFT_MOSI 13\n#define TFT_MISO 12\n#define TFT_SCLK 14\n#define TFT_CS   15\n#define TFT_DC    2\n#define TFT_RST  -1  // Connected to EN (reset)\n#define TFT_BL   21  // Backlight control\n\n// Touch screen pins (XPT2046)\n#define TOUCH_CS 33\n\n// SPI frequency\n#define SPI_FREQUENCY       40000000\n#define SPI_READ_FREQUENCY  20000000\n#define SPI_TOUCH_FREQUENCY  2500000',
            tip: '<strong>Why edit User_Setup.h?</strong> TFT_eSPI compiles pin definitions at build time for speed. Unlike other libraries that accept pins in constructors, TFT_eSPI uses preprocessor defines so the SPI driver is optimized at compile time.'
        },
        {
            title: 'Write the WiFi Scan Core',
            content: '<p>The ESP32 Arduino WiFi library provides <code>WiFi.scanNetworks()</code> which returns the count of discovered access points. You then call <code>WiFi.SSID(i)</code>, <code>WiFi.RSSI(i)</code>, <code>WiFi.channel(i)</code>, and <code>WiFi.encryptionType(i)</code> to read details about each result.</p>' +
                     '<p>The scan is synchronous by default -- it blocks for 1-3 seconds while the radio sweeps all channels. We will later trigger it from a touch event so the UI stays responsive between scans.</p>',
            language: 'C++',
            code: '#include <WiFi.h>\n\nstruct NetworkInfo {\n    String ssid;\n    int32_t rssi;\n    uint8_t channel;\n    uint8_t encType;\n    uint8_t bssid[6];\n    bool hidden;\n};\n\nNetworkInfo networks[64];\nint networkCount = 0;\n\nvoid runWifiScan() {\n    WiFi.mode(WIFI_STA);\n    WiFi.disconnect();  // Ensure we are not connected to anything\n    delay(100);\n\n    int found = WiFi.scanNetworks(false, true);  // sync, show hidden\n    networkCount = min(found, 64);\n\n    for (int i = 0; i < networkCount; i++) {\n        networks[i].ssid    = WiFi.SSID(i);\n        networks[i].rssi    = WiFi.RSSI(i);\n        networks[i].channel = WiFi.channel(i);\n        networks[i].encType = WiFi.encryptionType(i);\n        networks[i].hidden  = (WiFi.SSID(i).length() == 0);\n        memcpy(networks[i].bssid, WiFi.BSSID(i), 6);\n    }\n\n    // Sort by signal strength (strongest first)\n    for (int i = 0; i < networkCount - 1; i++) {\n        for (int j = i + 1; j < networkCount; j++) {\n            if (networks[j].rssi > networks[i].rssi) {\n                NetworkInfo temp = networks[i];\n                networks[i] = networks[j];\n                networks[j] = temp;\n            }\n        }\n    }\n\n    WiFi.scanDelete();  // Free scan result memory\n}\n\nconst char* encryptionLabel(uint8_t encType) {\n    switch (encType) {\n        case WIFI_AUTH_OPEN:            return "OPEN";\n        case WIFI_AUTH_WEP:             return "WEP";\n        case WIFI_AUTH_WPA_PSK:         return "WPA";\n        case WIFI_AUTH_WPA2_PSK:        return "WPA2";\n        case WIFI_AUTH_WPA_WPA2_PSK:    return "WPA/2";\n        case WIFI_AUTH_WPA2_ENTERPRISE: return "ENT";\n        case WIFI_AUTH_WPA3_PSK:        return "WPA3";\n        default:                        return "???";\n    }\n}',
            tip: '<strong>The second argument to scanNetworks()</strong> controls hidden network detection. When set to <code>true</code>, the ESP32 will include networks that do not broadcast their SSID. These appear with an empty SSID string but still have a valid BSSID, channel, and RSSI.'
        },
        {
            title: 'Build the TFT Display UI',
            content: '<p>Now we render scan results on the 2.8-inch TFT. The ILI9341 is 320x240 pixels. We will draw a header bar with the scan count and a scrollable list of networks. Each row shows the SSID (or "[HIDDEN]"), channel, RSSI bar, and encryption badge.</p>' +
                     '<p>TFT_eSPI draws are fast because the library uses DMA on ESP32. We clear and redraw the entire screen after each scan rather than trying to do partial updates.</p>',
            language: 'C++',
            code: '#include <TFT_eSPI.h>\n\nTFT_eSPI tft = TFT_eSPI();\n\n// Color palette\n#define BG_COLOR    0x0841   // Dark navy\n#define HEADER_BG   0x1082   // Slightly lighter\n#define TEXT_WHITE  0xFFFF\n#define TEXT_GREY   0xB596\n#define CYAN        0x07FF\n#define GREEN       0x07E0\n#define YELLOW      0xFFE0\n#define RED         0xF800\n#define ORANGE      0xFD20\n\nint scrollOffset = 0;\nconst int ROW_HEIGHT = 28;\nconst int HEADER_HEIGHT = 36;\nconst int VISIBLE_ROWS = (320 - HEADER_HEIGHT) / ROW_HEIGHT;  // landscape\n\nvoid initDisplay() {\n    tft.init();\n    tft.setRotation(1);  // Landscape: 320 wide x 240 tall\n    tft.fillScreen(BG_COLOR);\n    pinMode(21, OUTPUT);\n    digitalWrite(21, HIGH);  // Backlight on\n}\n\nvoid drawHeader() {\n    tft.fillRect(0, 0, 320, HEADER_HEIGHT, HEADER_BG);\n    tft.setTextColor(CYAN, HEADER_BG);\n    tft.setTextSize(1);\n    tft.setCursor(8, 6);\n    tft.print("WIFI RECON SCANNER");\n\n    tft.setTextColor(TEXT_GREY, HEADER_BG);\n    tft.setCursor(8, 20);\n    tft.printf("%d networks found  |  Tap to rescan\", networkCount);\n}\n\nuint16_t rssiColor(int32_t rssi) {\n    if (rssi > -50) return GREEN;\n    if (rssi > -65) return CYAN;\n    if (rssi > -75) return YELLOW;\n    if (rssi > -85) return ORANGE;\n    return RED;\n}\n\nvoid drawNetworkList() {\n    int y = HEADER_HEIGHT;\n    tft.fillRect(0, y, 320, 240 - y, BG_COLOR);\n\n    for (int i = scrollOffset; i < networkCount && (i - scrollOffset) < VISIBLE_ROWS; i++) {\n        int rowY = y + (i - scrollOffset) * ROW_HEIGHT;\n        NetworkInfo &n = networks[i];\n\n        // SSID\n        tft.setTextColor(n.hidden ? YELLOW : TEXT_WHITE, BG_COLOR);\n        tft.setTextSize(1);\n        tft.setCursor(8, rowY + 4);\n        String label = n.hidden ? "[HIDDEN]" : n.ssid;\n        if (label.length() > 20) label = label.substring(0, 17) + "...";\n        tft.print(label);\n\n        // Channel\n        tft.setTextColor(TEXT_GREY, BG_COLOR);\n        tft.setCursor(180, rowY + 4);\n        tft.printf("Ch%d", n.channel);\n\n        // Encryption\n        tft.setCursor(220, rowY + 4);\n        uint16_t encColor = (n.encType == WIFI_AUTH_OPEN) ? RED : GREEN;\n        tft.setTextColor(encColor, BG_COLOR);\n        tft.print(encryptionLabel(n.encType));\n\n        // RSSI bar\n        int barWidth = map(constrain(n.rssi, -100, -30), -100, -30, 2, 50);\n        tft.fillRect(270, rowY + 4, barWidth, 8, rssiColor(n.rssi));\n\n        // RSSI number\n        tft.setTextColor(TEXT_GREY, BG_COLOR);\n        tft.setCursor(270, rowY + 16);\n        tft.printf("%ddBm", n.rssi);\n\n        // Divider line\n        tft.drawLine(0, rowY + ROW_HEIGHT - 1, 320, rowY + ROW_HEIGHT - 1, 0x1082);\n    }\n}',
        },
        {
            title: 'Add Touch Input for Rescan and Scrolling',
            content: '<p>The CYD uses an XPT2046 resistive touch controller on the same SPI bus as the TFT (but with a separate chip-select on GPIO 33). TFT_eSPI includes built-in touch support. We will map touch zones: tap the top third to rescan, swipe or tap the bottom to scroll.</p>' +
                     '<p>Resistive touch coordinates need calibration. The raw values from the XPT2046 do not map 1:1 to pixel coordinates. We set calibration data once using the TFT_eSPI calibration example, then hardcode the values.</p>',
            language: 'C++',
            code: '// Calibration values — run the TFT_eSPI touch calibration example once\n// to get values for your specific CYD unit, then paste them here.\nuint16_t calData[5] = { 389, 3461, 257, 3493, 1 };\n\nvoid setupTouch() {\n    tft.setTouch(calData);\n}\n\nvoid handleTouch() {\n    uint16_t tx, ty;\n    if (!tft.getTouch(&tx, &ty)) return;\n\n    // Debounce: wait for release\n    delay(50);\n    while (tft.getTouch(&tx, &ty)) { delay(10); }\n\n    if (ty < HEADER_HEIGHT) {\n        // Tap on header = rescan\n        tft.fillScreen(BG_COLOR);\n        tft.setTextColor(CYAN, BG_COLOR);\n        tft.setTextSize(2);\n        tft.setCursor(60, 110);\n        tft.print("Scanning...");\n\n        runWifiScan();\n        scrollOffset = 0;\n        drawHeader();\n        drawNetworkList();\n    } else if (ty > 180) {\n        // Tap lower area = scroll down\n        if (scrollOffset + VISIBLE_ROWS < networkCount) {\n            scrollOffset++;\n            drawNetworkList();\n        }\n    } else if (ty > HEADER_HEIGHT && ty < 80) {\n        // Tap upper list area = scroll up\n        if (scrollOffset > 0) {\n            scrollOffset--;\n            drawNetworkList();\n        }\n    }\n}',
            tip: '<strong>Touch calibration matters.</strong> Every CYD panel is slightly different. Run the <code>TFT_eSPI/examples/Generic/Touch_calibrate</code> sketch once, note the 5 calibration numbers printed to serial, and replace the <code>calData</code> array above.'
        },
        {
            title: 'Detect Hidden Networks and Open APs',
            content: '<p>Hidden networks broadcast beacon frames with an empty SSID field, but the BSSID (MAC address) is still visible. We already detect these via the <code>hidden</code> flag in our struct. Now we add visual indicators so they stand out -- yellow text for hidden SSIDs and a red "OPEN" badge for unencrypted networks.</p>' +
                     '<p>Open access points are a security concern. In a corporate environment, an unexpected open AP could be a rogue access point set up for man-in-the-middle attacks. Our scanner makes these instantly visible.</p>',
            language: 'C++',
            code: '// Enhanced stats drawn below the header\nvoid drawStats() {\n    int openCount = 0;\n    int hiddenCount = 0;\n    int wpa3Count = 0;\n    int channels[14] = {0};\n\n    for (int i = 0; i < networkCount; i++) {\n        if (networks[i].encType == WIFI_AUTH_OPEN) openCount++;\n        if (networks[i].hidden) hiddenCount++;\n        if (networks[i].encType == WIFI_AUTH_WPA3_PSK) wpa3Count++;\n        if (networks[i].channel >= 1 && networks[i].channel <= 13) {\n            channels[networks[i].channel]++;\n        }\n    }\n\n    // Find most congested channel\n    int busiestCh = 1, busiestCount = 0;\n    for (int c = 1; c <= 13; c++) {\n        if (channels[c] > busiestCount) {\n            busiestCount = channels[c];\n            busiestCh = c;\n        }\n    }\n\n    // Draw stats bar just below header\n    int y = HEADER_HEIGHT;\n    tft.fillRect(0, y, 320, 14, 0x0841);\n    tft.setTextSize(1);\n    tft.setTextColor(openCount > 0 ? RED : GREEN, 0x0841);\n    tft.setCursor(8, y + 3);\n    tft.printf("Open:%d", openCount);\n\n    tft.setTextColor(hiddenCount > 0 ? YELLOW : TEXT_GREY, 0x0841);\n    tft.setCursor(80, y + 3);\n    tft.printf("Hidden:%d", hiddenCount);\n\n    tft.setTextColor(CYAN, 0x0841);\n    tft.setCursor(160, y + 3);\n    tft.printf("WPA3:%d", wpa3Count);\n\n    tft.setTextColor(TEXT_GREY, 0x0841);\n    tft.setCursor(230, y + 3);\n    tft.printf("Busy:Ch%d", busiestCh);\n}',
        },
        {
            title: 'Assemble the Complete Sketch',
            content: '<p>Now we combine all the pieces into a single Arduino sketch. The <code>setup()</code> function initializes the display and runs the first scan. The <code>loop()</code> function polls for touch input. Every 30 seconds we run an automatic rescan so the display stays current even without interaction.</p>',
            language: 'C++',
            code: '#include <WiFi.h>\n#include <TFT_eSPI.h>\n\n// --- Paste the structs and functions from Steps 3-6 above ---\n// NetworkInfo struct, runWifiScan(), encryptionLabel(),\n// display functions, touch handling, drawStats()\n\nunsigned long lastAutoScan = 0;\nconst unsigned long AUTO_SCAN_INTERVAL = 30000;  // 30 seconds\n\nvoid setup() {\n    Serial.begin(115200);\n    Serial.println("[SG-06] WiFi Recon Scanner starting...");\n\n    initDisplay();\n    setupTouch();\n\n    // Splash screen\n    tft.setTextColor(CYAN, BG_COLOR);\n    tft.setTextSize(2);\n    tft.setCursor(40, 100);\n    tft.print("WiFi Recon v1.0");\n    tft.setTextSize(1);\n    tft.setCursor(60, 130);\n    tft.setTextColor(TEXT_GREY, BG_COLOR);\n    tft.print("Initial scan...");\n\n    // First scan\n    runWifiScan();\n    drawHeader();\n    drawStats();\n    drawNetworkList();\n    lastAutoScan = millis();\n\n    Serial.printf("[SG-06] Found %d networks\\n", networkCount);\n}\n\nvoid loop() {\n    handleTouch();\n\n    // Auto-rescan every 30s\n    if (millis() - lastAutoScan > AUTO_SCAN_INTERVAL) {\n        runWifiScan();\n        scrollOffset = 0;\n        drawHeader();\n        drawStats();\n        drawNetworkList();\n        lastAutoScan = millis();\n    }\n}',
            tip: '<strong>Memory note:</strong> We cap at 64 networks because each <code>NetworkInfo</code> struct consumes about 48 bytes of RAM. The ESP32 has 520KB of SRAM, so 64 entries (about 3KB) is well within limits. In dense urban environments you may see 100+ networks -- increase the array if needed.'
        },
        {
            title: 'Flash and Test',
            content: '<p>Connect the CYD via USB-C. Select the correct port in Arduino IDE and click <strong>Upload</strong>. If the upload fails, hold the <strong>BOOT</strong> button on the CYD during the "Connecting..." phase, then release once upload starts.</p>' +
                     '<p>Open the Serial Monitor at 115200 baud to see debug output. The TFT should show the splash screen, then populate with scan results. Tap the header area to trigger a manual rescan. Walk around with the CYD to see how signal strengths change.</p>',
            language: 'Text',
            code: 'Expected Serial Output:\n[SG-06] WiFi Recon Scanner starting...\n[SG-06] Found 12 networks\n\nExpected TFT Display:\n+----------------------------------+\n| WIFI RECON SCANNER               |\n| 12 networks found | Tap to rescan|\n| Open:0  Hidden:1  WPA3:2  Busy:6 |\n|----------------------------------|\n| HomeNetwork_5G      Ch6  WPA2 ██ |\n| OfficeWiFi          Ch1  WPA2 ██ |\n| [HIDDEN]            Ch11 WPA2 █  |\n| Starbucks_Free      Ch6  OPEN █  |\n| ...                              |\n+----------------------------------+',
        }
    ],

    testing: '<p>Verify the following after flashing:</p>' +
             '<ul>' +
             '<li><strong>Network count</strong> -- Compare the number shown on the TFT with what your phone sees. The ESP32 typically finds comparable or more networks because it also detects hidden SSIDs.</li>' +
             '<li><strong>Signal strength accuracy</strong> -- Stand next to your router. The RSSI should be above -40 dBm. Move to another room and verify it drops to -60 to -80 dBm range.</li>' +
             '<li><strong>Hidden network detection</strong> -- If you have access to a router, temporarily hide the SSID and rescan. It should appear as "[HIDDEN]" with a valid channel and BSSID.</li>' +
             '<li><strong>Open AP flagging</strong> -- The stats bar should show "Open:N" in red if any unencrypted networks are detected.</li>' +
             '<li><strong>Touch responsiveness</strong> -- Tap the header to rescan. Tap the bottom area to scroll. Both should respond within 100ms.</li>' +
             '<li><strong>Auto-rescan</strong> -- Wait 30 seconds without touching and verify the display updates automatically.</li>' +
             '</ul>',

    troubleshooting: '<ul>' +
                     '<li><strong>TFT stays white/blank</strong> -- Verify <code>User_Setup.h</code> has the correct CYD pin assignments. The most common mistake is using generic ESP32 pin numbers instead of the CYD-specific ones (GPIO 13/12/14/15/2).</li>' +
                     '<li><strong>Upload fails with "Failed to connect"</strong> -- Hold the BOOT button on the CYD while Arduino attempts to connect. Release after upload begins. Some CYD batches need this every time.</li>' +
                     '<li><strong>Touch coordinates are wrong</strong> -- Run the TFT_eSPI touch calibration example and update the <code>calData</code> array with your specific values.</li>' +
                     '<li><strong>0 networks found</strong> -- Ensure <code>WiFi.mode(WIFI_STA)</code> is called before scanning. Also check that the antenna area on the ESP32 module is not obstructed by metal.</li>' +
                     '<li><strong>Crash/reboot loop</strong> -- Select "Default 4MB with spiffs" partition scheme. If using an older ESP32 board package, update to 2.0.x or later.</li>' +
                     '<li><strong>CH340 driver not found</strong> -- The CYD uses a CH340 USB-serial chip. Download the driver from the WCH manufacturer website for your OS.</li>' +
                     '</ul>',

    challenges: '<p><strong>Challenge 1: Channel Utilization Graph</strong> -- Add a second screen (accessible by swiping) that shows a bar chart of how many networks are on each channel (1-13). This helps identify the least congested channel for your own network.</p>' +
                '<p><strong>Challenge 2: BSSID Vendor Lookup</strong> -- The first 3 bytes of a MAC address identify the manufacturer (OUI). Embed a small lookup table of common vendors (Apple, Samsung, Cisco, Ubiquiti, TP-Link) and display the vendor name alongside each network.</p>' +
                '<p><strong>Challenge 3: Signal Strength Heatmap</strong> -- Pick one target SSID and display a real-time RSSI graph over time. Walk around your space and observe how the signal fluctuates. This is the basis for WiFi site surveys used in enterprise network planning.</p>',

    // ======================================================================
    // SIG-2: Step visual illustrations (0-based step index)
    // ======================================================================
    stepVisuals: {
        // Step 1 — Configure TFT_eSPI (User_Setup.h pin mapping)
        1: '<svg viewBox="0 0 680 190" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg06-sv1-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
           '<rect width="680" height="190" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="174" fill="url(#sg06-sv1-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">TFT_eSPI — USER_SETUP.H PIN MAP FOR ESP32 CYD</text>' +
           '<rect x="20" y="32" width="300" height="136" rx="6" fill="#111827" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="170" y="48" text-anchor="middle" fill="#555" font-size="7" font-weight="700" letter-spacing="0.1em">ESP32-2432S028R PCB TRACES</text>' +
           '<rect x="36" y="56" width="268" height="100" rx="4" fill="#0a1628" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>' +
           '<text x="170" y="70" text-anchor="middle" fill="#3b82f6" font-size="7" font-weight="600">ILI9341 TFT Controller</text>' +
           '<text x="46" y="86" fill="#eab308" font-size="6.5">SCLK</text><text x="90" y="86" fill="#555" font-size="6.5">= GPIO 14</text>' +
           '<text x="46" y="100" fill="#22c55e" font-size="6.5">MOSI</text><text x="90" y="100" fill="#555" font-size="6.5">= GPIO 13</text>' +
           '<text x="46" y="114" fill="#3b82f6" font-size="6.5">MISO</text><text x="90" y="114" fill="#555" font-size="6.5">= GPIO 12</text>' +
           '<text x="46" y="128" fill="#f97316" font-size="6.5">CS</text><text x="90" y="128" fill="#555" font-size="6.5">= GPIO 15</text>' +
           '<text x="46" y="142" fill="#c084fc" font-size="6.5">DC</text><text x="90" y="142" fill="#555" font-size="6.5">= GPIO  2</text>' +
           '<text x="190" y="86" fill="#a855f7" font-size="6.5">T_CS</text><text x="224" y="86" fill="#555" font-size="6.5">= GPIO 33</text>' +
           '<text x="190" y="100" fill="#a855f7" font-size="6.5">T_IRQ</text><text x="228" y="100" fill="#555" font-size="6.5">= GPIO 36</text>' +
           '<text x="190" y="114" fill="#ef4444" font-size="6.5">BL</text><text x="210" y="114" fill="#555" font-size="6.5">= GPIO 21</text>' +
           '<text x="170" y="158" text-anchor="middle" fill="#2a3a2a" font-size="6.5">All traces are on-PCB — no external wiring</text>' +
           '<rect x="340" y="32" width="320" height="136" rx="6" fill="#111827" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="500" y="48" text-anchor="middle" fill="#555" font-size="7" font-weight="700" letter-spacing="0.1em">USER_SETUP.H (compiled defines)</text>' +
           '<rect x="356" y="56" width="288" height="100" rx="4" fill="#0a1628" stroke="rgba(255,107,53,0.2)" stroke-width="0.5"/>' +
           '<text x="366" y="70" fill="#ff6b35" font-size="6.5">#define ILI9341_DRIVER</text>' +
           '<text x="366" y="83" fill="#eab308" font-size="6.5">#define TFT_SCLK</text><text x="450" y="83" fill="#8b949e" font-size="6.5">14</text>' +
           '<text x="366" y="96" fill="#22c55e" font-size="6.5">#define TFT_MOSI</text><text x="450" y="96" fill="#8b949e" font-size="6.5">13</text>' +
           '<text x="366" y="109" fill="#3b82f6" font-size="6.5">#define TFT_MISO</text><text x="450" y="109" fill="#8b949e" font-size="6.5">12</text>' +
           '<text x="366" y="122" fill="#f97316" font-size="6.5">#define TFT_CS</text><text x="450" y="122" fill="#8b949e" font-size="6.5">15</text>' +
           '<text x="366" y="135" fill="#c084fc" font-size="6.5">#define TFT_DC</text><text x="450" y="135" fill="#8b949e" font-size="6.5"> 2</text>' +
           '<text x="366" y="148" fill="#a855f7" font-size="6.5">#define TOUCH_CS</text><text x="450" y="148" fill="#8b949e" font-size="6.5">33</text>' +
           '<text x="500" y="174" text-anchor="middle" fill="#2a3a2a" font-size="6.5">TFT_eSPI compiles pins at build time for speed</text>' +
           '</svg>',

        // Step 3 — WiFi scan result structure / 802.11 beacon frame anatomy
        3: '<svg viewBox="0 0 680 185" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg06-sv3-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
           '<marker id="sg06-arr-o" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#ff6b35"/></marker></defs>' +
           '<rect width="680" height="185" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="169" fill="url(#sg06-sv3-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">802.11 BEACON FRAME -- WHAT WiFi.scanNetworks() SEES</text>' +
           '<rect x="16" y="32" width="648" height="52" rx="4" fill="#0f1923" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="26" y="45" fill="#555" font-size="6.5" font-weight="700">BEACON FRAME FIELDS (broadcast by every AP every 100ms)</text>' +
           '<rect x="20" y="50" width="56" height="24" rx="2" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
           '<text x="48" y="65" text-anchor="middle" fill="#60a5fa" font-size="6" font-weight="700">BSSID</text>' +
           '<rect x="82" y="50" width="120" height="24" rx="2" fill="rgba(255,107,53,0.1)" stroke="rgba(255,107,53,0.3)" stroke-width="0.5"/>' +
           '<text x="142" y="65" text-anchor="middle" fill="#ff6b35" font-size="6" font-weight="700">SSID (0-32 chars)</text>' +
           '<rect x="208" y="50" width="54" height="24" rx="2" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
           '<text x="235" y="65" text-anchor="middle" fill="#eab308" font-size="6" font-weight="700">Channel</text>' +
           '<rect x="268" y="50" width="64" height="24" rx="2" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
           '<text x="300" y="65" text-anchor="middle" fill="#22c55e" font-size="6" font-weight="700">RSSI (dBm)</text>' +
           '<rect x="338" y="50" width="88" height="24" rx="2" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
           '<text x="382" y="65" text-anchor="middle" fill="#a855f7" font-size="6" font-weight="700">Encryption Type</text>' +
           '<rect x="432" y="50" width="56" height="24" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>' +
           '<text x="460" y="65" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="700">Hidden?</text>' +
           '<rect x="494" y="50" width="64" height="24" rx="2" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
           '<text x="526" y="65" text-anchor="middle" fill="#8b949e" font-size="6" font-weight="700">Capabilities</text>' +
           '<rect x="20" y="96" width="644" height="68" rx="4" fill="#0a1628" stroke="rgba(255,107,53,0.15)" stroke-width="0.5"/>' +
           '<text x="30" y="110" fill="#555" font-size="6.5" font-weight="700">NetworkInfo STRUCT MAPPING</text>' +
           '<text x="48" y="124" fill="#3b82f6" font-size="6.5">bssid[6]</text><text x="110" y="124" fill="#666" font-size="6.5">= WiFi.BSSID(i)  — 6-byte MAC, uniquely identifies AP hardware</text>' +
           '<text x="48" y="137" fill="#ff6b35" font-size="6.5">ssid</text><text x="90" y="137" fill="#666" font-size="6.5">= WiFi.SSID(i)   — empty string if hidden; still has valid BSSID</text>' +
           '<text x="48" y="150" fill="#eab308" font-size="6.5">channel</text><text x="110" y="150" fill="#666" font-size="6.5">= WiFi.channel(i) — 1-13 (2.4GHz), 36-165 (5GHz)</text>' +
           '<text x="48" y="163" fill="#22c55e" font-size="6.5">rssi</text><text x="90" y="163" fill="#666" font-size="6.5">= WiFi.RSSI(i)   — negative dBm; -30 = strong, -90 = weak</text>' +
           '<text x="380" y="124" fill="#a855f7" font-size="6.5">encType</text><text x="430" y="124" fill="#666" font-size="6.5">= WiFi.encryptionType(i) — OPEN/WEP/WPA/WPA2/WPA3</text>' +
           '<text x="380" y="137" fill="#ef4444" font-size="6.5">hidden</text><text x="426" y="137" fill="#666" font-size="6.5">= ssid.length() == 0  — SSID element is empty in beacon</text>' +
           '</svg>',

        // Step 4 — TFT display layout / RSSI bar color scale
        4: '<svg viewBox="0 0 680 195" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg06-sv4-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
           '<rect width="680" height="195" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="179" fill="url(#sg06-sv4-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">ILI9341 DISPLAY LAYOUT (320x240, landscape)</text>' +
           '<rect x="20" y="30" width="360" height="148" rx="6" fill="#0a0e16" stroke="rgba(34,197,94,0.25)" stroke-width="1.5"/>' +
           '<rect x="20" y="30" width="360" height="24" rx="6" fill="#0f1e2e"/>' +
           '<text x="34" y="44" fill="#07ffff" font-size="6.5" font-weight="700">WIFI RECON SCANNER</text>' +
           '<text x="34" y="54" fill="#666" font-size="5.5">12 networks found  |  Tap to rescan</text>' +
           '<rect x="20" y="54" width="360" height="12" fill="#0d1a1d"/>' +
           '<text x="34" y="63" fill="#07ffff" font-size="5">Open:0</text>' +
           '<text x="90" y="63" fill="#ffe000" font-size="5">Hidden:1</text>' +
           '<text x="160" y="63" fill="#07ffff" font-size="5">WPA3:2</text>' +
           '<text x="230" y="63" fill="#666" font-size="5">Busy:Ch6</text>' +
           '<rect x="20" y="66" width="360" height="1" fill="rgba(255,255,255,0.05)"/>' +
           '<text x="34" y="78" fill="#ffffff" font-size="6">HomeNetwork_5G</text>' +
           '<text x="210" y="78" fill="#999" font-size="6">Ch6</text>' +
           '<text x="248" y="78" fill="#07e000" font-size="6">WPA2</text>' +
           '<rect x="296" y="73" width="48" height="7" rx="1" fill="#07e000" opacity="0.8"/>' +
           '<text x="34" y="95" fill="#ffffff" font-size="6">OfficeWiFi</text>' +
           '<text x="210" y="95" fill="#999" font-size="6">Ch1</text>' +
           '<text x="248" y="95" fill="#07e000" font-size="6">WPA2</text>' +
           '<rect x="296" y="90" width="32" height="7" rx="1" fill="#07ffff" opacity="0.8"/>' +
           '<text x="34" y="112" fill="#ffe000" font-size="6">[HIDDEN]</text>' +
           '<text x="210" y="112" fill="#999" font-size="6">Ch11</text>' +
           '<text x="248" y="112" fill="#07e000" font-size="6">WPA2</text>' +
           '<rect x="296" y="107" width="18" height="7" rx="1" fill="#ffaa00" opacity="0.8"/>' +
           '<text x="34" y="129" fill="#ffffff" font-size="6">Starbucks_Guest</text>' +
           '<text x="210" y="129" fill="#999" font-size="6">Ch6</text>' +
           '<text x="248" y="129" fill="#ff0000" font-size="6">OPEN</text>' +
           '<rect x="296" y="124" width="10" height="7" rx="1" fill="#ff4444" opacity="0.8"/>' +
           '<rect x="20" y="66" width="360" height="27" rx="0" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>' +
           '<text x="34" y="170" fill="#333" font-size="5.5">320 x 240 px — landscape rotation(1) — ILI9341 on SPI</text>' +
           '<rect x="400" y="30" width="268" height="148" rx="6" fill="#111827" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="534" y="48" text-anchor="middle" fill="#555" font-size="7" font-weight="700">RSSI COLOR SCALE</text>' +
           '<rect x="420" y="58" width="20" height="14" rx="2" fill="#07e000"/><text x="450" y="68" fill="#86efac" font-size="6.5">-30 to -50 dBm — Strong (green)</text>' +
           '<rect x="420" y="78" width="20" height="14" rx="2" fill="#07ffff"/><text x="450" y="88" fill="#67e8f9" font-size="6.5">-50 to -65 dBm — Good (cyan)</text>' +
           '<rect x="420" y="98" width="20" height="14" rx="2" fill="#ffe000"/><text x="450" y="108" fill="#fde68a" font-size="6.5">-65 to -75 dBm — Fair (yellow)</text>' +
           '<rect x="420" y="118" width="20" height="14" rx="2" fill="#ff8800"/><text x="450" y="128" fill="#fdba74" font-size="6.5">-75 to -85 dBm — Weak (orange)</text>' +
           '<rect x="420" y="138" width="20" height="14" rx="2" fill="#ff0000"/><text x="450" y="148" fill="#fca5a5" font-size="6.5">below -85 dBm — Very weak (red)</text>' +
           '<text x="534" y="172" text-anchor="middle" fill="#333" font-size="6">rssiColor() maps RSSI range to TFT 16-bit color</text>' +
           '</svg>'
    },

    // ======================================================================
    // SIG-3: Component callouts — interactive CYD board teardown
    // ======================================================================
    componentCallouts: {
        svg: '<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;max-width:440px;width:100%;height:auto">' +
             '<defs><pattern id="sg06-cc-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.7" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
             '<rect width="440" height="280" fill="#0d1117" rx="6"/>' +
             '<rect x="6" y="6" width="428" height="268" fill="url(#sg06-cc-grid)" rx="3"/>' +
             '<text x="220" y="20" text-anchor="middle" fill="#444" font-size="7" font-weight="700" letter-spacing="0.15em">ESP32 CYD — INTERACTIVE BOARD TEARDOWN</text>' +
             '<text x="220" y="30" text-anchor="middle" fill="#333" font-size="6">Hover component list items to highlight</text>' +
             '<rect x="20" y="38" width="400" height="180" rx="6" fill="#111a28" stroke="rgba(59,130,246,0.2)" stroke-width="1.5"/>' +
             '<g data-callout="esp32-module">' +
             '<rect x="100" y="55" width="130" height="65" rx="4" fill="#1e2736" stroke="#a855f7" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="98" y="53" width="134" height="69" rx="5" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="165" y="82" text-anchor="middle" fill="#c084fc" font-size="7.5" font-weight="700">ESP32-WROOM-32</text>' +
             '<text x="165" y="94" text-anchor="middle" fill="#8b949e" font-size="6">WiFi 802.11 b/g/n</text>' +
             '<text x="165" y="105" text-anchor="middle" fill="#666" font-size="5.5">Dual-core 240MHz</text>' +
             '</g>' +
             '<g data-callout="ili9341">' +
             '<rect x="30" y="55" width="64" height="90" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="53" width="68" height="94" rx="5" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="62" y="96" text-anchor="middle" fill="#4ade80" font-size="6.5" font-weight="700">ILI9341</text>' +
             '<text x="62" y="107" text-anchor="middle" fill="#8b949e" font-size="5.5">TFT 2.8"</text>' +
             '<text x="62" y="117" text-anchor="middle" fill="#666" font-size="5">320x240</text>' +
             '</g>' +
             '<g data-callout="xpt2046">' +
             '<rect x="30" y="155" width="64" height="34" rx="3" fill="#1e2736" stroke="#a855f7" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="153" width="68" height="38" rx="4" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="62" y="171" text-anchor="middle" fill="#c084fc" font-size="6" font-weight="700">XPT2046</text>' +
             '<text x="62" y="181" text-anchor="middle" fill="#8b949e" font-size="5.5">Touch ctrl</text>' +
             '</g>' +
             '<g data-callout="usb-c">' +
             '<rect x="186" y="38" width="68" height="16" rx="3" fill="#2a2a3a" stroke="#eab308" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="184" y="36" width="72" height="20" rx="4" fill="none" stroke="#eab308" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="220" y="49" text-anchor="middle" fill="#fde68a" font-size="6" font-weight="700">USB-C</text>' +
             '</g>' +
             '<g data-callout="backlight">' +
             '<rect x="240" y="55" width="56" height="22" rx="3" fill="#1e2736" stroke="#ef4444" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="238" y="53" width="60" height="26" rx="4" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="268" y="69" text-anchor="middle" fill="#f87171" font-size="6" font-weight="700">BL GPIO21</text>' +
             '</g>' +
             '<g data-callout="ch340">' +
             '<rect x="310" y="130" width="80" height="38" rx="4" fill="#1e2736" stroke="#f97316" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="308" y="128" width="84" height="42" rx="5" fill="none" stroke="#f97316" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="350" y="148" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="700">CH340</text>' +
             '<text x="350" y="160" text-anchor="middle" fill="#8b949e" font-size="5.5">USB-Serial</text>' +
             '</g>' +
             '<line x1="94" y1="100" x2="98" y2="100" stroke="rgba(168,85,247,0.15)" stroke-width="1"/>' +
             '<line x1="94" y1="172" x2="98" y2="172" stroke="rgba(168,85,247,0.15)" stroke-width="1"/>' +
             '</svg>',

        components: [
            {
                id: 'esp32-module',
                name: 'A — ESP32-WROOM-32 Module',
                purpose: 'The brain of the CYD. Contains the dual-core Tensilica Xtensa LX6 processor, 4MB flash, 520KB SRAM, the WiFi 802.11 b/g/n radio, Bluetooth Classic, and BLE — all in one shielded module. In this project the WiFi radio is the scanner.',
                specs: ['Dual-core 240 MHz', '520 KB SRAM', '4 MB flash', 'WiFi 802.11 b/g/n', 'BT + BLE', '2.4 GHz band']
            },
            {
                id: 'ili9341',
                name: 'B — ILI9341 2.8" TFT Display',
                purpose: 'A 320x240 pixel color TFT LCD controller interfaced via SPI. Renders scan results, signal bars, and encryption badges. Driven by the TFT_eSPI library with DMA for fast full-screen redraws after each scan cycle.',
                specs: ['320 x 240 px', 'SPI interface', '65K colors (16-bit)', 'ILI9341 driver', 'GPIO 13/12/14/15/2']
            },
            {
                id: 'xpt2046',
                name: 'C — XPT2046 Resistive Touch Controller',
                purpose: 'A resistive touchscreen controller that converts finger pressure on the display into X/Y coordinates. Shares the SPI bus with the TFT but uses a separate chip-select on GPIO 33. Used to trigger rescans and scroll through network lists.',
                specs: ['Resistive touch', 'SPI shared bus', 'CS GPIO 33', 'IRQ GPIO 36', 'Needs calibration']
            },
            {
                id: 'usb-c',
                name: 'D — USB-C Connector',
                purpose: 'Powers the CYD from any USB-C charger or laptop port, and provides the serial programming interface. The CH340 chip bridges USB to the ESP32 UART, allowing Arduino IDE to flash firmware without any external programmer.',
                specs: ['5V input', 'Power + programming', 'CH340 bridge', '921600 baud upload']
            },
            {
                id: 'backlight',
                name: 'E — TFT Backlight (GPIO 21)',
                purpose: 'The TFT backlight LED is controlled by GPIO 21. Writing HIGH turns it on. Writing LOW saves power. In this project we drive it HIGH at startup and leave it on. Future projects could dim it using PWM for power saving.',
                specs: ['GPIO 21 control', 'PWM dimming capable', 'Full brightness default', '~60 mA at full power']
            },
            {
                id: 'ch340',
                name: 'F — CH340 USB-to-Serial',
                purpose: 'Converts USB signals to the UART that the ESP32 uses for programming and serial debugging. The Serial Monitor output you see in Arduino IDE flows through this chip. If your OS does not detect the CYD, you likely need the CH340 driver.',
                specs: ['USB-UART bridge', 'Requires OS driver', '921600 baud support', 'Auto-reset circuit']
            }
        ]
    },

    // ======================================================================
    // SIG-4: Common mistakes for SG-06
    // ======================================================================
    commonMistakes: [
        {
            title: 'Wrong TFT_eSPI setup — using generic pin numbers instead of CYD-specific ones',
            correct: 'Edit User_Setup.h in the TFT_eSPI library folder and set exactly: TFT_SCLK=14, TFT_MOSI=13, TFT_MISO=12, TFT_CS=15, TFT_DC=2. These match the CYD PCB trace routing.',
            incorrect: 'Leaving the default TFT_eSPI pin definitions (which target a generic ESP32 pinout like SCLK=18, MOSI=23) causes the TFT to stay blank or show garbage. Many tutorials show wrong pin numbers for the CYD.',
            consequence: 'The TFT display stays white or shows random color noise. No scan results appear. The ESP32 runs normally (you can see serial output) but the display gets wrong SPI signals because the library talks to the wrong GPIO pins.',
            svgDiff: '<svg viewBox="0 0 640 148" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg06-m1-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="148" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="136" fill="url(#sg06-m1-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="118" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="86" rx="4" fill="#0a1628" stroke="rgba(255,107,53,0.15)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#555" font-size="6">// User_Setup.h — CYD-specific</text>' +
                     '<text x="30" y="64" fill="#eab308" font-size="6.5">#define TFT_SCLK  14</text>' +
                     '<text x="30" y="77" fill="#22c55e" font-size="6.5">#define TFT_MOSI  13</text>' +
                     '<text x="30" y="90" fill="#3b82f6" font-size="6.5">#define TFT_MISO  12</text>' +
                     '<text x="30" y="103" fill="#f97316" font-size="6.5">#define TFT_CS    15</text>' +
                     '<text x="30" y="116" fill="#c084fc" font-size="6.5">#define TFT_DC     2</text>' +
                     '<text x="161" y="126" text-anchor="middle" fill="#22c55e" font-size="7">Matches CYD PCB traces -- display works</text>' +
                     '<rect x="330" y="14" width="298" height="118" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="86" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#555" font-size="6">// User_Setup.h — generic ESP32 defaults</text>' +
                     '<text x="348" y="64" fill="#ef4444" font-size="6.5">#define TFT_SCLK  18</text>' +
                     '<text x="348" y="77" fill="#ef4444" font-size="6.5">#define TFT_MOSI  23</text>' +
                     '<text x="348" y="90" fill="#ef4444" font-size="6.5">#define TFT_MISO  19</text>' +
                     '<text x="348" y="103" fill="#ef4444" font-size="6.5">#define TFT_CS     5</text>' +
                     '<text x="348" y="116" fill="#ef4444" font-size="6.5">#define TFT_DC    17</text>' +
                     '<text x="479" y="126" text-anchor="middle" fill="#ef4444" font-size="7">Wrong GPIOs -- TFT stays white or shows garbage</text>' +
                     '</svg>'
        },
        {
            title: 'Missing WiFi.mode(WIFI_STA) before scan -- 0 networks found',
            correct: 'Call WiFi.mode(WIFI_STA) then WiFi.disconnect() before WiFi.scanNetworks(). Station mode must be active for the radio to perform channel sweeps. Calling scanNetworks() without setting mode may return WIFI_SCAN_FAILED.',
            incorrect: 'Calling WiFi.scanNetworks() directly without setting station mode, or calling it while connected to an AP. Some firmware versions return -1 (scan failed) or 0 networks in these states.',
            consequence: 'scanNetworks() returns 0 or -2 (WIFI_SCAN_FAILED). The TFT shows "0 networks found" regardless of how many APs are in range. No error message is displayed -- it looks like a working scan that found nothing.',
            svgDiff: '<svg viewBox="0 0 640 148" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg06-m2-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="148" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="136" fill="url(#sg06-m2-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="118" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="86" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#22c55e" font-size="6.5">WiFi.mode(WIFI_STA);</text>' +
                     '<text x="30" y="64" fill="#22c55e" font-size="6.5">WiFi.disconnect();</text>' +
                     '<text x="30" y="78" fill="#555" font-size="6.5">delay(100);</text>' +
                     '<text x="30" y="92" fill="#ff6b35" font-size="6.5">int n = WiFi.scanNetworks(false, true);</text>' +
                     '<text x="30" y="106" fill="#555" font-size="6">// n = number of found networks</text>' +
                     '<text x="161" y="126" text-anchor="middle" fill="#22c55e" font-size="7">Radio initialized in STA mode -- scan works correctly</text>' +
                     '<rect x="330" y="14" width="298" height="118" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="86" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#555" font-size="6">// No WiFi.mode() call</text>' +
                     '<text x="348" y="64" fill="#555" font-size="6">// No disconnect()</text>' +
                     '<text x="348" y="78" fill="#555" font-size="6.5">delay(100);</text>' +
                     '<text x="348" y="92" fill="#ef4444" font-size="6.5">int n = WiFi.scanNetworks(false, true);</text>' +
                     '<text x="348" y="106" fill="#ef4444" font-size="6">// n = 0 or -2 (WIFI_SCAN_FAILED)</text>' +
                     '<text x="479" y="126" text-anchor="middle" fill="#ef4444" font-size="7">Returns 0 networks -- radio not in correct mode</text>' +
                     '</svg>'
        },
        {
            title: 'Touch coordinates inverted -- tapping header triggers scroll, bottom triggers rescan',
            correct: 'After running the TFT_eSPI touch calibration sketch, replace calData[5] with the values specific to your CYD unit. Each panel differs slightly. Y=0 is the top of the screen in landscape rotation.',
            incorrect: 'Using hardcoded calibration values from a tutorial that were measured on a different CYD unit. Resistive touch raw values vary between manufacturing batches and are not interchangeable.',
            consequence: 'Touch zones are offset or inverted. Tapping the header area triggers bottom-area actions. Scrolling and rescanning become unreliable. The display still renders correctly -- only input mapping is wrong.',
            svgDiff: '<svg viewBox="0 0 640 142" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg06-m3-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="142" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="130" fill="url(#sg06-m3-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="112" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="28" y="36" width="100" height="80" rx="3" fill="#0a0e16" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>' +
                     '<rect x="28" y="36" width="100" height="22" rx="3" fill="#0f1e2e"/>' +
                     '<text x="78" y="50" text-anchor="middle" fill="#07ffff" font-size="5.5">RESCAN ZONE</text>' +
                     '<rect x="28" y="96" width="100" height="20" rx="0" fill="rgba(34,197,94,0.08)"/>' +
                     '<text x="78" y="109" text-anchor="middle" fill="#22c55e" font-size="5.5">SCROLL ZONE</text>' +
                     '<text x="78" y="128" text-anchor="middle" fill="#22c55e" font-size="6">Calibrated per unit</text>' +
                     '<rect x="148" y="36" width="148" height="90" rx="3" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="156" y="52" fill="#22c55e" font-size="6">// Run calibration sketch once:</text>' +
                     '<text x="156" y="65" fill="#8b949e" font-size="6">uint16_t calData[5] =</text>' +
                     '<text x="156" y="78" fill="#ff6b35" font-size="6">  { 389, 3461, 257, 3493, 1 };</text>' +
                     '<text x="156" y="91" fill="#555" font-size="5.5">// Your values will differ</text>' +
                     '<text x="156" y="104" fill="#22c55e" font-size="6">tft.setTouch(calData);</text>' +
                     '<rect x="330" y="14" width="298" height="112" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="346" y="36" width="100" height="80" rx="3" fill="#0a0e16" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>' +
                     '<rect x="346" y="36" width="100" height="22" rx="3" fill="#1a0a0a"/>' +
                     '<text x="396" y="50" text-anchor="middle" fill="#f87171" font-size="5.5">SCROLL ZONE</text>' +
                     '<rect x="346" y="96" width="100" height="20" rx="0" fill="rgba(239,68,68,0.08)"/>' +
                     '<text x="396" y="109" text-anchor="middle" fill="#ef4444" font-size="5.5">RESCAN ZONE</text>' +
                     '<text x="396" y="128" text-anchor="middle" fill="#ef4444" font-size="6">Wrong unit calData</text>' +
                     '<rect x="460" y="36" width="148" height="90" rx="3" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="468" y="52" fill="#ef4444" font-size="6">// Copy-pasted from tutorial:</text>' +
                     '<text x="468" y="65" fill="#8b949e" font-size="6">uint16_t calData[5] =</text>' +
                     '<text x="468" y="78" fill="#ef4444" font-size="6">  { 319, 3510, 280, 3420, 2 };</text>' +
                     '<text x="468" y="91" fill="#555" font-size="5.5">// Different hardware unit</text>' +
                     '<text x="468" y="104" fill="#ef4444" font-size="6">tft.setTouch(calData);</text>' +
                     '</svg>'
        }
    ]
};

// =========================================================================
// SG-07: Bluetooth Device Scanner (ESP32 DevKit)
// =========================================================================
window.SignalGuides['sg-07'] = {

    intro: '<p>Bluetooth is everywhere -- phones, laptops, earbuds, smartwatches, fitness trackers, IoT sensors, and even cars. In this project you will build a Bluetooth scanner on an ESP32 DevKit V1 that discovers both Classic Bluetooth and Bluetooth Low Energy (BLE) devices, logging their names, MAC addresses, RSSI, and device types to the serial console.</p>' +
           '<p>The ESP32 is one of the few microcontrollers that supports both Classic BT and BLE on the same radio. Classic Bluetooth uses an inquiry scan that discovers devices like phones in discoverable mode and audio devices. BLE uses an advertising scan that picks up beacons, fitness trackers, and most modern IoT devices. By combining both, you get a comprehensive picture of the wireless device landscape around you.</p>' +
           '<p>This is a passive operation -- we listen for devices that are advertising or responding to standard inquiry requests. The scanner does not pair, connect, or interact with any device beyond the initial discovery protocol.</p>',

    wiring: '  ESP32 DevKit V1\n' +
            '  +-----------+\n' +
            '  | USB       |  <--- USB cable to PC (power + serial)\n' +
            '  |           |\n' +
            '  | EN   D23  |\n' +
            '  | VP   D22  |\n' +
            '  | VN   TX0  |\n' +
            '  | D34  RX0  |\n' +
            '  | D35  D21  |\n' +
            '  | D32  D19  |\n' +
            '  | D33  D18  |\n' +
            '  | D25  D5   |\n' +
            '  | D26  D17  |\n' +
            '  | D27  D16  |\n' +
            '  | D14  D4   |\n' +
            '  | D12  D2   |\n' +
            '  | D13  D15  |\n' +
            '  | GND  3V3  |\n' +
            '  | VIN  GND  |\n' +
            '  +-----------+\n' +
            '\n' +
            '  No external wiring needed.\n' +
            '  All scanning uses the on-board\n' +
            '  BT/WiFi antenna.',

    wiringNotes: '<p>This project requires <strong>only the ESP32 DevKit and a USB cable</strong>. All Bluetooth scanning uses the built-in antenna on the ESP32-WROOM-32 module. Output goes to the Serial Monitor over USB.</p>',

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
        '<defs>' +
        '<pattern id="sg07-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="700" height="380" fill="url(#sg07-grid)" rx="4"/>' +
        '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">ESP32 DEVKIT V1 — BLUETOOTH SCANNER SETUP</text>' +

        '<!-- ESP32 DevKit Board -->' +
        '<rect x="230" y="60" width="260" height="260" rx="10" fill="#1a1f2b" stroke="#a855f7" stroke-width="2"/>' +
        '<rect x="230" y="60" width="260" height="30" rx="10" fill="rgba(168,85,247,0.12)"/>' +
        '<rect x="230" y="82" width="260" height="8" fill="rgba(168,85,247,0.12)"/>' +
        '<text x="360" y="80" text-anchor="middle" fill="#c084fc" font-size="12" font-weight="600">ESP32 DevKit V1</text>' +

        '<!-- USB Micro connector -->' +
        '<rect x="335" y="47" width="50" height="18" rx="4" fill="#2a2a3a" stroke="#888" stroke-width="1"/>' +
        '<text x="360" y="59" text-anchor="middle" fill="#999" font-size="7">USB</text>' +

        '<!-- ESP32 Module on board -->' +
        '<rect x="280" y="100" width="160" height="70" rx="6" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.25)" stroke-width="1"/>' +
        '<text x="360" y="120" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="600">ESP32-WROOM-32</text>' +
        '<rect x="310" y="130" width="100" height="12" rx="2" fill="rgba(168,85,247,0.1)"/>' +
        '<text x="360" y="139" text-anchor="middle" fill="#a855f7" font-size="6">WiFi + BT + BLE</text>' +
        '<rect x="310" y="147" width="100" height="12" rx="2" fill="rgba(168,85,247,0.1)"/>' +
        '<text x="360" y="156" text-anchor="middle" fill="#a855f7" font-size="6">Dual-core 240MHz</text>' +

        '<!-- Antenna -->' +
        '<rect x="330" y="90" width="60" height="14" rx="3" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="0.5"/>' +
        '<text x="360" y="100" text-anchor="middle" fill="#22c55e" font-size="6">PCB Antenna</text>' +

        '<!-- Left pin column -->' +
        '<g>' +
        '<circle cx="244" cy="195" r="3" fill="#8b949e"/><text x="260" y="198" fill="#8b949e" font-size="7">EN</text>' +
        '<circle cx="244" cy="210" r="3" fill="#8b949e"/><text x="260" y="213" fill="#8b949e" font-size="7">VP</text>' +
        '<circle cx="244" cy="225" r="3" fill="#8b949e"/><text x="260" y="228" fill="#8b949e" font-size="7">VN</text>' +
        '<circle cx="244" cy="240" r="3" fill="#8b949e"/><text x="260" y="243" fill="#8b949e" font-size="7">D34</text>' +
        '<circle cx="244" cy="255" r="3" fill="#8b949e"/><text x="260" y="258" fill="#8b949e" font-size="7">D35</text>' +
        '<circle cx="244" cy="270" r="3" fill="#333" stroke="#888" stroke-width="0.5"/><text x="260" y="273" fill="#8b949e" font-size="7">GND</text>' +
        '<circle cx="244" cy="285" r="3" fill="#ef4444"/><text x="260" y="288" fill="#8b949e" font-size="7">VIN</text>' +
        '</g>' +

        '<!-- Right pin column -->' +
        '<g>' +
        '<circle cx="476" cy="195" r="3" fill="#8b949e"/><text x="460" y="198" fill="#8b949e" font-size="7" text-anchor="end">D23</text>' +
        '<circle cx="476" cy="210" r="3" fill="#8b949e"/><text x="460" y="213" fill="#8b949e" font-size="7" text-anchor="end">D22</text>' +
        '<circle cx="476" cy="225" r="3" fill="#8b949e"/><text x="460" y="228" fill="#8b949e" font-size="7" text-anchor="end">TX0</text>' +
        '<circle cx="476" cy="240" r="3" fill="#8b949e"/><text x="460" y="243" fill="#8b949e" font-size="7" text-anchor="end">RX0</text>' +
        '<circle cx="476" cy="255" r="3" fill="#8b949e"/><text x="460" y="258" fill="#8b949e" font-size="7" text-anchor="end">D21</text>' +
        '<circle cx="476" cy="270" r="3" fill="#ef4444"/><text x="460" y="273" fill="#8b949e" font-size="7" text-anchor="end">3V3</text>' +
        '<circle cx="476" cy="285" r="3" fill="#333" stroke="#888" stroke-width="0.5"/><text x="460" y="288" fill="#8b949e" font-size="7" text-anchor="end">GND</text>' +
        '</g>' +

        '<!-- USB cable to PC -->' +
        '<line x1="360" y1="47" x2="360" y2="20" stroke="#ef4444" stroke-width="2" opacity="0.6"/>' +
        '<rect x="310" y="6" width="100" height="16" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" stroke-width="0.5"/>' +
        '<text x="360" y="17" text-anchor="middle" fill="#ef4444" font-size="7">USB to PC / Laptop</text>' +

        '<!-- Serial Monitor on PC -->' +
        '<rect x="530" y="70" width="160" height="180" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
        '<rect x="530" y="70" width="160" height="24" rx="8" fill="rgba(234,179,8,0.1)"/>' +
        '<rect x="530" y="86" width="160" height="8" fill="rgba(234,179,8,0.1)"/>' +
        '<text x="610" y="86" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">Serial Monitor</text>' +
        '<text x="545" y="110" fill="#8b949e" font-size="6">[BT] Phone_XS   -42dBm</text>' +
        '<text x="545" y="122" fill="#8b949e" font-size="6">[BLE] Mi Band 7  -58dBm</text>' +
        '<text x="545" y="134" fill="#8b949e" font-size="6">[BLE] AirPods    -63dBm</text>' +
        '<text x="545" y="146" fill="#8b949e" font-size="6">[BT] JBL Flip    -71dBm</text>' +
        '<text x="545" y="158" fill="#c084fc" font-size="6">Classic: 2  BLE: 8</text>' +
        '<text x="545" y="170" fill="#c084fc" font-size="6">Total: 10 devices</text>' +

        '<!-- Arrow from USB to PC -->' +
        '<path d="M490,150 C510,150 520,130 530,130" stroke="#eab308" stroke-width="1.5" fill="none" stroke-dasharray="4,3" opacity="0.5"/>' +
        '<polygon points="528,126 536,130 528,134" fill="#eab308" opacity="0.5"/>' +

        '<!-- Wireless scan indicators -->' +
        '<g>' +
        '<!-- BT Classic waves -->' +
        '<path d="M210,140 Q190,150 210,160" stroke="#3b82f6" stroke-width="1" fill="none" opacity="0.3"/>' +
        '<path d="M200,130 Q175,150 200,170" stroke="#3b82f6" stroke-width="1" fill="none" opacity="0.2"/>' +
        '<text x="175" y="155" text-anchor="middle" fill="#3b82f6" font-size="7" opacity="0.6">BT</text>' +

        '<!-- BLE waves -->' +
        '<path d="M210,200 Q190,210 210,220" stroke="#22c55e" stroke-width="1" fill="none" opacity="0.3"/>' +
        '<path d="M200,190 Q175,210 200,230" stroke="#22c55e" stroke-width="1" fill="none" opacity="0.2"/>' +
        '<text x="175" y="215" text-anchor="middle" fill="#22c55e" font-size="7" opacity="0.6">BLE</text>' +
        '</g>' +

        '<!-- Scan info -->' +
        '<rect x="40" y="280" width="150" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
        '<text x="115" y="298" text-anchor="middle" fill="#8b949e" font-size="7" font-weight="600">Dual Radio Scan</text>' +
        '<text x="115" y="312" text-anchor="middle" fill="#3b82f6" font-size="6">Classic BT: 10s inquiry</text>' +
        '<text x="115" y="324" text-anchor="middle" fill="#22c55e" font-size="6">BLE: 5s advertising scan</text>' +

        '<!-- Legend -->' +
        '<rect x="40" y="355" width="640" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
        '<text x="60" y="377" fill="#555" font-size="7" font-weight="600">NOTES:</text>' +
        '<text x="115" y="377" fill="#8b949e" font-size="7">No external wiring. USB cable provides power and serial data. All scanning uses on-board antenna.</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Enable Bluetooth in Arduino IDE',
            content: '<p>The ESP32 Arduino core includes both Classic BT and BLE libraries. To use Classic BT scanning, we need the <code>BluetoothSerial</code> library (included in the ESP32 core). For BLE, we use <code>BLEDevice</code>.</p>' +
                     '<p>Important: Classic BT and BLE share the same radio, but they use different protocol stacks. We will run them sequentially -- Classic scan first, then BLE scan -- because running both simultaneously can cause conflicts on the ESP32.</p>' +
                     '<p>Set your partition scheme to <strong>"Default 4MB with spiffs"</strong> or <strong>"Huge APP (3MB No OTA)"</strong> because the Bluetooth stack consumes significant flash space.</p>',
            language: 'C++',
            code: '#include "BluetoothSerial.h"\n#include <BLEDevice.h>\n#include <BLEUtils.h>\n#include <BLEScan.h>\n#include <BLEAdvertisedDevice.h>\n\nBluetoothSerial SerialBT;\nBLEScan* pBLEScan;\n\n// Store discovered devices to avoid duplicates\nstruct BTDevice {\n    String name;\n    String mac;\n    int rssi;\n    String type;       // "CLASSIC" or "BLE"\n    String devClass;   // Human-readable device class\n    unsigned long firstSeen;\n    unsigned long lastSeen;\n};\n\nBTDevice devices[128];\nint deviceCount = 0;\n\nbool deviceExists(String mac) {\n    for (int i = 0; i < deviceCount; i++) {\n        if (devices[i].mac == mac) {\n            devices[i].lastSeen = millis();\n            return true;\n        }\n    }\n    return false;\n}\n\nvoid addDevice(String name, String mac, int rssi, String type, String devClass) {\n    if (deviceExists(mac) || deviceCount >= 128) return;\n    devices[deviceCount].name = name;\n    devices[deviceCount].mac = mac;\n    devices[deviceCount].rssi = rssi;\n    devices[deviceCount].type = type;\n    devices[deviceCount].devClass = devClass;\n    devices[deviceCount].firstSeen = millis();\n    devices[deviceCount].lastSeen = millis();\n    deviceCount++;\n}',
            tip: '<strong>Flash space:</strong> The combined BT Classic + BLE stack can use 1.5MB+ of flash. If you get "Sketch too big" errors, switch to the "Huge APP" partition scheme which gives 3MB for your program.'
        },
        {
            title: 'Scan for Classic Bluetooth Devices',
            content: '<p>Classic Bluetooth inquiry mode discovers devices that are in "discoverable" mode -- phones with BT visibility on, speakers, headsets, car hands-free systems, and keyboards. The ESP32 <code>BluetoothSerial</code> library wraps the inquiry API.</p>' +
                     '<p>Classic BT inquiry takes about 10 seconds per scan. Each discovered device provides a name (if available), MAC address, and device class code. The class code tells you whether it is a phone, laptop, audio device, etc.</p>',
            language: 'C++',
            code: 'void scanClassicBT() {\n    Serial.println("\\n[CLASSIC BT] Starting inquiry scan (10s)...");\n\n    BTScanResults* results = SerialBT.discover(10000);  // 10 second scan\n\n    if (results) {\n        int count = results->getCount();\n        Serial.printf("[CLASSIC BT] Found %d devices\\n", count);\n\n        for (int i = 0; i < count; i++) {\n            BTAdvertisedDevice* dev = results->getDevice(i);\n            String mac = dev->getAddress().toString().c_str();\n            String name = dev->haveName() ? dev->getName().c_str() : "(unknown)";\n            int rssi = dev->getRSSI();\n            uint32_t cod = dev->getCOD();  // Class of Device\n\n            String devClass = classifyDevice(cod);\n            addDevice(name, mac, rssi, "CLASSIC", devClass);\n\n            Serial.printf("  [%s] %s | %s | %d dBm | %s\\n",\n                          "BT", mac.c_str(), name.c_str(), rssi, devClass.c_str());\n        }\n    } else {\n        Serial.println("[CLASSIC BT] Scan returned no results");\n    }\n}\n\nString classifyDevice(uint32_t cod) {\n    // Major Device Class is bits 12-8 of the CoD\n    uint8_t majorClass = (cod >> 8) & 0x1F;\n\n    switch (majorClass) {\n        case 0x01: return "Computer";\n        case 0x02: return "Phone";\n        case 0x03: return "LAN/Network";\n        case 0x04: return "Audio/Video";\n        case 0x05: return "Peripheral";\n        case 0x06: return "Imaging";\n        case 0x07: return "Wearable";\n        case 0x08: return "Toy";\n        case 0x09: return "Health";\n        default:   return "Unknown";\n    }\n}',
        },
        {
            title: 'Scan for BLE Devices',
            content: '<p>BLE (Bluetooth Low Energy) uses a completely different discovery mechanism. BLE devices continuously broadcast advertising packets on 3 dedicated advertising channels. The scanner passively listens on these channels and collects whatever devices are advertising.</p>' +
                     '<p>BLE advertising is where the real density is. In a typical office you may find 3-5 Classic BT devices but 20-50 BLE devices (trackers, sensors, beacons, smartwatches, earbuds in their cases, etc.).</p>',
            language: 'C++',
            code: '// BLE scan callback — called for each discovered BLE device\nclass BLEScanCallback : public BLEAdvertisedDeviceCallbacks {\n    void onResult(BLEAdvertisedDevice device) {\n        String mac = device.getAddress().toString().c_str();\n        String name = device.haveName() ? device.getName().c_str() : "(no name)";\n        int rssi = device.getRSSI();\n\n        // Classify BLE device by appearance or service UUIDs\n        String devClass = "BLE Device";\n        if (device.haveAppearance()) {\n            devClass = classifyBLEAppearance(device.getAppearance());\n        }\n        if (device.haveServiceUUID()) {\n            // Check for common service UUIDs\n            String uuid = device.getServiceUUID().toString().c_str();\n            if (uuid.indexOf("180d") >= 0) devClass = "Heart Rate";\n            else if (uuid.indexOf("180f") >= 0) devClass = "Battery Svc";\n            else if (uuid.indexOf("1812") >= 0) devClass = "HID Device";\n            else if (uuid.indexOf("fe9f") >= 0) devClass = "Google Beacon";\n            else if (uuid.indexOf("feaa") >= 0) devClass = "Eddystone";\n        }\n\n        addDevice(name, mac, rssi, "BLE", devClass);\n    }\n};\n\nString classifyBLEAppearance(uint16_t appearance) {\n    // BLE Assigned Numbers — Appearance Values\n    uint16_t category = appearance >> 6;  // Top 10 bits = category\n    switch (category) {\n        case 0x01: return "Phone";\n        case 0x02: return "Computer";\n        case 0x03: return "Watch";\n        case 0x0C: return "Thermometer";\n        case 0x0D: return "Heart Rate";\n        case 0x0F: return "HID";\n        case 0x31: return "Fitness Tracker";\n        default:   return "BLE Peripheral";\n    }\n}\n\nvoid scanBLE() {\n    Serial.println("\\n[BLE] Starting advertising scan (5s)...");\n\n    BLEDevice::init("");\n    pBLEScan = BLEDevice::getScan();\n    pBLEScan->setAdvertisedDeviceCallbacks(new BLEScanCallback(), false);\n    pBLEScan->setActiveScan(true);   // Active scan gets names\n    pBLEScan->setInterval(100);\n    pBLEScan->setWindow(99);\n\n    BLEScanResults results = pBLEScan->start(5, false);  // 5 second scan\n    Serial.printf("[BLE] Found %d devices\\n", results.getCount());\n\n    pBLEScan->clearResults();\n    BLEDevice::deinit(false);  // Free BLE memory for next Classic scan\n}',
            tip: '<strong>Active vs Passive scan:</strong> Active scanning sends a SCAN_REQ to each advertising device, which triggers a SCAN_RSP containing additional data like the device name. Passive scanning only listens. Active gives you more data but is slightly less stealthy.'
        },
        {
            title: 'Combine Both Scans with a Report',
            content: '<p>Now we alternate between Classic BT and BLE scans and print a consolidated summary after each cycle. The report shows all unique devices found, sorted by RSSI, with their type, classification, and timing information.</p>',
            language: 'C++',
            code: 'void printReport() {\n    Serial.println("\\n╔════════════════════════════════════════════════════════════════╗");\n    Serial.printf(  "║  BLUETOOTH RECON REPORT — %d devices discovered\\n", deviceCount);\n    Serial.println("╠════════════════════════════════════════════════════════════════╣");\n    Serial.println("║ TYPE    | MAC ADDRESS       | RSSI  | CLASS        | NAME");\n    Serial.println("╠════════════════════════════════════════════════════════════════╣");\n\n    // Sort by RSSI (strongest first)\n    for (int i = 0; i < deviceCount - 1; i++) {\n        for (int j = i + 1; j < deviceCount; j++) {\n            if (devices[j].rssi > devices[i].rssi) {\n                BTDevice temp = devices[i];\n                devices[i] = devices[j];\n                devices[j] = temp;\n            }\n        }\n    }\n\n    int classicCount = 0, bleCount = 0;\n    for (int i = 0; i < deviceCount; i++) {\n        BTDevice &d = devices[i];\n        if (d.type == "CLASSIC") classicCount++;\n        else bleCount++;\n\n        Serial.printf("║ %-7s | %s | %4d  | %-12s | %s\\n",\n                      d.type.c_str(), d.mac.c_str(), d.rssi,\n                      d.devClass.c_str(), d.name.c_str());\n    }\n\n    Serial.println("╠════════════════════════════════════════════════════════════════╣");\n    Serial.printf(  "║  Classic: %d  |  BLE: %d  |  Total: %d\\n",\n                  classicCount, bleCount, deviceCount);\n    Serial.println("╚════════════════════════════════════════════════════════════════╝");\n}',
        },
        {
            title: 'Add Timestamp Logging and CSV Export',
            content: '<p>For field use, you want machine-parseable output alongside the human-readable report. We will add timestamps (millis-based uptime) and print a CSV header at boot so you can capture serial output to a file and analyze it later.</p>' +
                     '<p>To capture serial output to a file, use the Arduino IDE Serial Monitor copy button, or use a terminal tool like <code>screen /dev/ttyUSB0 115200 | tee bt_scan.log</code> on Linux.</p>',
            language: 'C++',
            code: 'void printCSVHeader() {\n    Serial.println("\\n# CSV_START");\n    Serial.println("timestamp_ms,type,mac,rssi,class,name");\n}\n\nvoid printCSVData() {\n    for (int i = 0; i < deviceCount; i++) {\n        BTDevice &d = devices[i];\n        Serial.printf("%lu,%s,%s,%d,%s,\\"%s\\"\\n",\n                      d.lastSeen, d.type.c_str(), d.mac.c_str(),\n                      d.rssi, d.devClass.c_str(), d.name.c_str());\n    }\n    Serial.println("# CSV_END");\n}',
        },
        {
            title: 'Assemble the Complete Sketch',
            content: '<p>The main sketch initializes both stacks and runs alternating scan cycles. Each cycle takes about 15-20 seconds (10s Classic + 5s BLE + processing time). After each cycle, both a human-readable report and CSV block are printed.</p>',
            language: 'C++',
            code: '#include "BluetoothSerial.h"\n#include <BLEDevice.h>\n#include <BLEUtils.h>\n#include <BLEScan.h>\n#include <BLEAdvertisedDevice.h>\n\n// --- Paste all structs, functions, and callbacks from steps above ---\n\nint scanCycle = 0;\n\nvoid setup() {\n    Serial.begin(115200);\n    delay(1000);\n\n    Serial.println("====================================");\n    Serial.println("[SG-07] Bluetooth Device Scanner v1.0");\n    Serial.println("[SG-07] Classic BT + BLE dual scan");\n    Serial.println("====================================");\n\n    SerialBT.begin("ESP32_BT_Scanner");  // Device name for BT Classic\n    printCSVHeader();\n}\n\nvoid loop() {\n    scanCycle++;\n    Serial.printf("\\n--- Scan Cycle %d ---\\n", scanCycle);\n\n    // Phase 1: Classic BT scan\n    scanClassicBT();\n\n    // Small gap between scans\n    delay(500);\n\n    // Phase 2: BLE scan\n    scanBLE();\n\n    // Print reports\n    printReport();\n    printCSVData();\n\n    Serial.printf("\\n[SG-07] Cycle %d complete. %d unique devices.\\n", scanCycle, deviceCount);\n    Serial.println("[SG-07] Next scan in 10 seconds...");\n    delay(10000);\n}',
            tip: '<strong>Privacy note:</strong> Bluetooth MAC addresses can be used to track individuals. Many modern phones use MAC address randomization for BLE advertising, so the same phone may appear with different MACs between scans. Classic BT addresses are typically static. Use this tool responsibly and only in environments you control.'
        }
    ],

    testing: '<p>Verify these after uploading:</p>' +
             '<ul>' +
             '<li><strong>Serial output</strong> -- Open Serial Monitor at 115200 baud. You should see the banner, then scan cycle messages, then the report table.</li>' +
             '<li><strong>Classic BT detection</strong> -- Put your phone in Bluetooth discoverable mode. It should appear within the next Classic BT scan cycle with its name and "Phone" classification.</li>' +
             '<li><strong>BLE detection</strong> -- BLE devices like fitness trackers, AirPods cases, and smart home sensors should appear automatically since they advertise continuously.</li>' +
             '<li><strong>Deduplication</strong> -- The same device should not appear twice in the report. The MAC address is used as the unique key.</li>' +
             '<li><strong>RSSI values</strong> -- Nearby devices (within 1 meter) should show RSSI above -50 dBm. Devices across the room should be -60 to -80 dBm. <strong>Note:</strong> Classic BT RSSI may show 0 dBm for all devices &mdash; this is a known limitation of the ESP32 Arduino BT library. The HCI layer captures RSSI but the <code>BTAdvertisedDevice</code> API does not expose it. BLE RSSI works correctly.</li>' +
             '<li><strong>CSV format</strong> -- The CSV block between <code># CSV_START</code> and <code># CSV_END</code> should be parseable by any spreadsheet application.</li>' +
             '</ul>',

    troubleshooting: '<ul>' +
                     '<li><strong>"Sketch too big" error</strong> -- Switch partition scheme to "Huge APP (3MB No OTA/1MB SPIFFS)" under Tools > Partition Scheme.</li>' +
                     '<li><strong>Classic BT scan finds 0 devices</strong> -- Most modern phones hide from Classic BT inquiry by default. You must manually enable "Bluetooth visibility" or "discoverable mode" on the target phone. Try with a Bluetooth speaker or headset instead.</li>' +
                     '<li><strong>BLE scan finds 0 devices</strong> -- Ensure <code>setActiveScan(true)</code> is set. Also check that <code>BLEDevice::init("")</code> succeeds (no error in serial). Some ESP32 board revisions need a firmware update.</li>' +
                     '<li><strong>ESP32 crashes after a few cycles</strong> -- BLE memory leaks are common. Ensure you call <code>BLEDevice::deinit(false)</code> after each BLE scan and <code>pBLEScan->clearResults()</code> to free advertising data.</li>' +
                     '<li><strong>Names show as "(unknown)" or "(no name)"</strong> -- Classic BT names require the device to respond to a name request, which some devices ignore. BLE names require active scanning. Both are normal gaps.</li>' +
                     '</ul>',

    challenges: '<p><strong>Challenge 1: Device Persistence Tracking</strong> -- Track how long each device has been visible. Print a "dwell time" column showing how many seconds since first detection. This data reveals which devices are stationary vs passing through.</p>' +
                '<p><strong>Challenge 2: RSSI Distance Estimation</strong> -- Use the free-space path loss formula to estimate distance from RSSI: <code>distance = 10 ^ ((txPower - RSSI) / (10 * n))</code> where txPower is -59 dBm (typical) and n is 2.0 for open air. Display estimated distances in the report. Note that this is approximate -- walls, bodies, and multipath make real-world estimates rough.</p>' +
                '<p><strong>Challenge 3: Add an OLED Display</strong> -- Wire a 0.96" I2C OLED (SSD1306) to GPIO 21 (SDA) and GPIO 22 (SCL). Display a live count of Classic and BLE devices, plus the name and RSSI of the strongest signal. This turns the project into a portable device without needing a laptop for the serial monitor.</p>',

    // ======================================================================
    // SIG-2: Step visual illustrations (0-based step index)
    // ======================================================================
    stepVisuals: {
        // Step 1 — Classic BT inquiry: CoD (Class of Device) breakdown
        1: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg07-sv1-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
           '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="172" fill="url(#sg07-sv1-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">BLUETOOTH CLASS OF DEVICE (CoD) — 24-BIT FIELD</text>' +
           '<rect x="16" y="30" width="648" height="40" rx="4" fill="#0f1923" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="26" y="44" fill="#555" font-size="6.5" font-weight="700">CoD BITFIELD (3 bytes, returned by BTAdvertisedDevice::getCOD())</text>' +
           '<rect x="20" y="50" width="180" height="14" rx="2" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
           '<text x="110" y="60" text-anchor="middle" fill="#c084fc" font-size="6" font-weight="700">bits [23:13] — Minor Device Class</text>' +
           '<rect x="206" y="50" width="160" height="14" rx="2" fill="rgba(255,107,53,0.12)" stroke="rgba(255,107,53,0.3)" stroke-width="0.5"/>' +
           '<text x="286" y="60" text-anchor="middle" fill="#ff6b35" font-size="6" font-weight="700">bits [12:8] — Major Device Class</text>' +
           '<rect x="372" y="50" width="144" height="14" rx="2" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
           '<text x="444" y="60" text-anchor="middle" fill="#60a5fa" font-size="6" font-weight="700">bits [7:2] — Service Class</text>' +
           '<rect x="522" y="50" width="120" height="14" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>' +
           '<text x="582" y="60" text-anchor="middle" fill="#555" font-size="6">bits [1:0] — Format bits</text>' +
           '<rect x="16" y="82" width="648" height="88" rx="4" fill="#0a1628" stroke="rgba(255,107,53,0.1)" stroke-width="0.5"/>' +
           '<text x="26" y="96" fill="#555" font-size="6.5" font-weight="700">MAJOR DEVICE CLASS VALUES (bits [12:8] — extracted as: (cod >> 8) &amp; 0x1F)</text>' +
           '<rect x="24" y="102" width="72" height="16" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="60" y="113" text-anchor="middle" fill="#c084fc" font-size="6">0x01 — Computer</text>' +
           '<rect x="102" y="102" width="64" height="16" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="134" y="113" text-anchor="middle" fill="#c084fc" font-size="6">0x02 — Phone</text>' +
           '<rect x="172" y="102" width="86" height="16" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="215" y="113" text-anchor="middle" fill="#c084fc" font-size="6">0x03 — LAN/Net</text>' +
           '<rect x="264" y="102" width="86" height="16" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="307" y="113" text-anchor="middle" fill="#c084fc" font-size="6">0x04 — Audio/Video</text>' +
           '<rect x="356" y="102" width="80" height="16" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="396" y="113" text-anchor="middle" fill="#c084fc" font-size="6">0x05 — Peripheral</text>' +
           '<rect x="442" y="102" width="64" height="16" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="474" y="113" text-anchor="middle" fill="#c084fc" font-size="6">0x07 — Wearable</text>' +
           '<rect x="512" y="102" width="64" height="16" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="544" y="113" text-anchor="middle" fill="#c084fc" font-size="6">0x09 — Health</text>' +
           '<text x="26" y="135" fill="#555" font-size="6.5" font-weight="700">BLE APPEARANCE VALUES (haveAppearance() / getAppearance() -- top 10 bits = category)</text>' +
           '<rect x="24" y="141" width="72" height="16" rx="2" fill="rgba(34,197,94,0.08)"/>' +
           '<text x="60" y="152" text-anchor="middle" fill="#22c55e" font-size="6">0x01 — Phone</text>' +
           '<rect x="102" y="141" width="72" height="16" rx="2" fill="rgba(34,197,94,0.08)"/>' +
           '<text x="138" y="152" text-anchor="middle" fill="#22c55e" font-size="6">0x03 — Watch</text>' +
           '<rect x="180" y="141" width="72" height="16" rx="2" fill="rgba(34,197,94,0.08)"/>' +
           '<text x="216" y="152" text-anchor="middle" fill="#22c55e" font-size="6">0x0F — HID</text>' +
           '<rect x="258" y="141" width="100" height="16" rx="2" fill="rgba(34,197,94,0.08)"/>' +
           '<text x="308" y="152" text-anchor="middle" fill="#22c55e" font-size="6">0x31 — Fitness Tracker</text>' +
           '<rect x="364" y="141" width="100" height="16" rx="2" fill="rgba(34,197,94,0.08)"/>' +
           '<text x="414" y="152" text-anchor="middle" fill="#22c55e" font-size="6">0x0D — Heart Rate</text>' +
           '</svg>',

        // Step 2 — BLE advertising packet anatomy
        2: '<svg viewBox="0 0 680 182" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg07-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
           '<marker id="sg07-arr-g" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#22c55e"/></marker></defs>' +
           '<rect width="680" height="182" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="166" fill="url(#sg07-sv2-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">BLE ADVERTISING PACKET ANATOMY</text>' +
           '<rect x="16" y="30" width="648" height="32" rx="4" fill="#0f1923" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="26" y="43" fill="#555" font-size="6.5" font-weight="700">PDU STRUCTURE (over 3 advertising channels: 37, 38, 39)</text>' +
           '<rect x="20" y="50" width="56" height="18" rx="2" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
           '<text x="48" y="62" text-anchor="middle" fill="#60a5fa" font-size="6">Preamble 1B</text>' +
           '<rect x="82" y="50" width="60" height="18" rx="2" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.3)" stroke-width="0.5"/>' +
           '<text x="112" y="62" text-anchor="middle" fill="#60a5fa" font-size="6">Access Addr 4B</text>' +
           '<rect x="148" y="50" width="56" height="18" rx="2" fill="rgba(255,107,53,0.12)" stroke="rgba(255,107,53,0.3)" stroke-width="0.5"/>' +
           '<text x="176" y="62" text-anchor="middle" fill="#ff6b35" font-size="6">PDU Header 2B</text>' +
           '<rect x="210" y="50" width="60" height="18" rx="2" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
           '<text x="240" y="62" text-anchor="middle" fill="#c084fc" font-size="6">AdvAddr 6B</text>' +
           '<rect x="276" y="50" width="240" height="18" rx="2" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
           '<text x="396" y="62" text-anchor="middle" fill="#22c55e" font-size="6">AdvData (0-31B) -- AD structures</text>' +
           '<rect x="522" y="50" width="54" height="18" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>' +
           '<text x="549" y="62" text-anchor="middle" fill="#555" font-size="6">CRC 3B</text>' +
           '<rect x="16" y="80" width="648" height="82" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
           '<text x="26" y="93" fill="#555" font-size="6.5" font-weight="700">AD STRUCTURES INSIDE AdvData — each field is: length | type | value</text>' +
           '<rect x="24" y="99" width="146" height="14" rx="2" fill="rgba(255,107,53,0.08)"/>' +
           '<text x="97" y="109" text-anchor="middle" fill="#ff6b35" font-size="6">0x09 — Complete Local Name</text>' +
           '<text x="97" y="120" text-anchor="middle" fill="#555" font-size="5.5">device.getName()</text>' +
           '<rect x="176" y="99" width="146" height="14" rx="2" fill="rgba(59,130,246,0.08)"/>' +
           '<text x="249" y="109" text-anchor="middle" fill="#60a5fa" font-size="6">0x03 — 16-bit Service UUIDs</text>' +
           '<text x="249" y="120" text-anchor="middle" fill="#555" font-size="5.5">device.getServiceUUID()</text>' +
           '<rect x="328" y="99" width="130" height="14" rx="2" fill="rgba(234,179,8,0.08)"/>' +
           '<text x="393" y="109" text-anchor="middle" fill="#eab308" font-size="6">0x19 — Appearance</text>' +
           '<text x="393" y="120" text-anchor="middle" fill="#555" font-size="5.5">device.getAppearance()</text>' +
           '<rect x="464" y="99" width="166" height="14" rx="2" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="547" y="109" text-anchor="middle" fill="#c084fc" font-size="6">0xFF — Manufacturer Specific</text>' +
           '<text x="547" y="120" text-anchor="middle" fill="#555" font-size="5.5">iBeacon, AltBeacon payloads</text>' +
           '<text x="26" y="140" fill="#22c55e" font-size="6.5">Common service UUID shortcuts:  0x180D Heart Rate  0x180F Battery  0x1812 HID  0xFEAA Eddystone</text>' +
           '<text x="26" y="153" fill="#555" font-size="6">Active scan triggers SCAN_REQ, device responds with SCAN_RSP containing additional AD structures (e.g., full name if too long for initial packet)</text>' +
           '</svg>'
    },

    // ======================================================================
    // SIG-3: Component callouts — ESP32 DevKit V1 teardown
    // ======================================================================
    componentCallouts: {
        svg: '<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;max-width:440px;width:100%;height:auto">' +
             '<defs><pattern id="sg07-cc-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.7" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
             '<rect width="440" height="280" fill="#0d1117" rx="6"/>' +
             '<rect x="6" y="6" width="428" height="268" fill="url(#sg07-cc-grid)" rx="3"/>' +
             '<text x="220" y="20" text-anchor="middle" fill="#444" font-size="7" font-weight="700" letter-spacing="0.15em">ESP32 DEVKIT V1 — INTERACTIVE TEARDOWN</text>' +
             '<text x="220" y="30" text-anchor="middle" fill="#333" font-size="6">Hover component list items to highlight</text>' +
             '<rect x="110" y="38" width="220" height="200" rx="8" fill="#111a28" stroke="rgba(168,85,247,0.25)" stroke-width="1.5"/>' +
             '<g data-callout="esp32-wroom">' +
             '<rect x="140" y="68" width="160" height="72" rx="4" fill="#1e2736" stroke="#a855f7" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="138" y="66" width="164" height="76" rx="5" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="220" y="100" text-anchor="middle" fill="#c084fc" font-size="8" font-weight="700">ESP32-WROOM-32</text>' +
             '<text x="220" y="113" text-anchor="middle" fill="#8b949e" font-size="6">BT Classic + BLE + WiFi</text>' +
             '<text x="220" y="124" text-anchor="middle" fill="#666" font-size="5.5">2.4 GHz shared radio</text>' +
             '</g>' +
             '<g data-callout="pcb-ant">' +
             '<rect x="200" y="48" width="40" height="16" rx="3" fill="#1e2736" stroke="#22c55e" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="198" y="46" width="44" height="20" rx="4" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="220" y="59" text-anchor="middle" fill="#4ade80" font-size="5.5" font-weight="700">PCB Ant</text>' +
             '</g>' +
             '<g data-callout="usb-micro">' +
             '<rect x="188" y="38" width="64" height="14" rx="3" fill="#2a2a3a" stroke="#eab308" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="186" y="36" width="68" height="18" rx="4" fill="none" stroke="#eab308" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="220" y="48" text-anchor="middle" fill="#fde68a" font-size="5.5" font-weight="700">USB Micro-B</text>' +
             '</g>' +
             '<g data-callout="cp2102">' +
             '<rect x="140" y="158" width="80" height="40" rx="4" fill="#1e2736" stroke="#f97316" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="138" y="156" width="84" height="44" rx="5" fill="none" stroke="#f97316" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="180" y="176" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="700">CP2102</text>' +
             '<text x="180" y="188" text-anchor="middle" fill="#8b949e" font-size="5.5">USB-Serial</text>' +
             '</g>' +
             '<g data-callout="en-btn">' +
             '<circle cx="310" cy="85" r="12" fill="#1e2736" stroke="#ef4444" stroke-width="1" class="sp-callout-circle"/>' +
             '<circle class="sp-callout-ring" cx="310" cy="85" r="16" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="310" y="88" text-anchor="middle" fill="#f87171" font-size="6" font-weight="700">EN</text>' +
             '</g>' +
             '<g data-callout="boot-btn">' +
             '<circle cx="310" cy="145" r="12" fill="#1e2736" stroke="#3b82f6" stroke-width="1" class="sp-callout-circle"/>' +
             '<circle class="sp-callout-ring" cx="310" cy="145" r="16" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="310" y="148" text-anchor="middle" fill="#60a5fa" font-size="5.5" font-weight="700">BOOT</text>' +
             '</g>' +
             '</svg>',

        components: [
            {
                id: 'esp32-wroom',
                name: 'A — ESP32-WROOM-32 Module',
                purpose: 'The dual-core Xtensa LX6 processor with its entire wireless stack on a single shielded module. For Bluetooth scanning: Classic BT uses the inquiry scan (10s sweep), BLE uses the advertising scanner (passive or active). Both share the same 2.4 GHz radio -- they run sequentially, not simultaneously.',
                specs: ['Dual-core 240 MHz', 'BT Classic 2.1+EDR', 'BLE 4.2', 'WiFi 802.11 b/g/n', '520 KB SRAM', '4 MB flash']
            },
            {
                id: 'pcb-ant',
                name: 'B — PCB Trace Antenna',
                purpose: 'An etched copper trace on the PCB acts as the antenna for both WiFi and Bluetooth. Keep the antenna area clear of metal objects and conductive surfaces. Range degrades significantly when the antenna is obstructed by a hand, a metal case, or placed flat on a metal desk.',
                specs: ['2.4 GHz tuned', 'Shared BT + WiFi', 'Omni-directional', 'Approx 80m BLE range']
            },
            {
                id: 'usb-micro',
                name: 'C — USB Micro-B Connector',
                purpose: 'Provides 5V power and the serial programming interface. In this project, all output goes to the Serial Monitor over this connection. You can also power the board from a USB power bank for untethered field scanning.',
                specs: ['5V input power', 'Serial output', 'Programming port', 'Power bank compatible']
            },
            {
                id: 'cp2102',
                name: 'D — CP2102 USB-Serial Bridge',
                purpose: 'Converts USB signals from your laptop to the UART that the ESP32 uses for firmware upload and serial communication. The Serial Monitor data flows through this chip. Some DevKit clones use CH340 instead -- both work the same way but may need different OS drivers.',
                specs: ['USB to UART', 'CP2102 or CH340', 'Up to 921600 baud', 'Auto-reset support']
            },
            {
                id: 'en-btn',
                name: 'E — EN (Reset) Button',
                purpose: 'Resets the ESP32. Useful for restarting a scan cycle or recovering from a hang. During upload, Arduino IDE toggles the EN pin automatically via DTR/RTS on the USB-serial chip -- you rarely need to press this manually.',
                specs: ['Hardware reset', 'Active LOW', 'Auto-reset via DTR', 'Tactile switch']
            },
            {
                id: 'boot-btn',
                name: 'F — BOOT Button (GPIO 0)',
                purpose: 'Hold this while pressing EN (or while plugging in USB) to enter bootloader mode. Required if upload fails with "Failed to connect." Also used to trigger events in firmware -- GPIO 0 reads LOW when held. Most uploads succeed without needing it on modern DevKit revisions.',
                specs: ['GPIO 0', 'Active LOW', 'Bootloader trigger', 'Input in firmware']
            }
        ]
    },

    // ======================================================================
    // SIG-4: Common mistakes for SG-07
    // ======================================================================
    commonMistakes: [
        {
            title: 'Sketch too big -- Bluetooth stack + BLE fills more than default partition flash space',
            correct: 'In Arduino IDE, go to Tools > Partition Scheme and select "Huge APP (3MB No OTA/1MB SPIFFS)". This gives 3MB for your compiled sketch, enough for both Classic BT and BLE stacks plus your code.',
            incorrect: 'Leaving the default "Default 4MB with spiffs" partition scheme (which allocates only 1.2MB to the sketch). The combined BT Classic + BLE stack plus Arduino runtime exceeds this limit.',
            consequence: 'Compilation succeeds but upload fails with "Sketch too big: ... Compress..." or the firmware uploads but crashes immediately on boot because the binary overflows the allocated flash region.',
            svgDiff: '<svg viewBox="0 0 640 142" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg07-m1-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="142" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="130" fill="url(#sg07-m1-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="112" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<text x="26" y="46" fill="#555" font-size="6.5" font-weight="600">4MB Flash — Huge APP partition:</text>' +
                     '<rect x="26" y="52" width="270" height="18" rx="2" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
                     '<text x="34" y="64" fill="#22c55e" font-size="6.5">APP:  3072 KB (3.0 MB) ---- Sketch fits</text>' +
                     '<rect x="26" y="76" width="140" height="16" rx="2" fill="rgba(255,255,255,0.04)"/>' +
                     '<text x="34" y="87" fill="#555" font-size="6">SPIFFS: 1024 KB</text>' +
                     '<rect x="172" y="76" width="124" height="16" rx="2" fill="rgba(255,255,255,0.04)"/>' +
                     '<text x="180" y="87" fill="#555" font-size="6">NVS + OTA: 20 KB</text>' +
                     '<text x="161" y="120" text-anchor="middle" fill="#22c55e" font-size="7">BT + BLE + sketch ~2.8MB -- fits in 3MB region</text>' +
                     '<rect x="330" y="14" width="298" height="112" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<text x="344" y="46" fill="#555" font-size="6.5" font-weight="600">4MB Flash — Default partition:</text>' +
                     '<rect x="344" y="52" width="270" height="18" rx="2" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
                     '<text x="352" y="64" fill="#ef4444" font-size="6.5">APP:  1280 KB (1.2 MB) ---- TOO SMALL</text>' +
                     '<rect x="344" y="76" width="130" height="16" rx="2" fill="rgba(255,255,255,0.04)"/>' +
                     '<text x="352" y="87" fill="#555" font-size="6">SPIFFS: 1536 KB</text>' +
                     '<rect x="480" y="76" width="130" height="16" rx="2" fill="rgba(255,255,255,0.04)"/>' +
                     '<text x="488" y="87" fill="#555" font-size="6">OTA: 1280 KB</text>' +
                     '<text x="479" y="120" text-anchor="middle" fill="#ef4444" font-size="7">Sketch ~2.8MB overflows 1.2MB -- upload fails</text>' +
                     '</svg>'
        },
        {
            title: 'BLE memory leak -- ESP32 crashes after 2-3 scan cycles due to unreleased scan results',
            correct: 'After every BLE scan cycle, call pBLEScan->clearResults() to free advertising data from heap, then call BLEDevice::deinit(false) to release the BLE stack RAM. Reinitialize with BLEDevice::init("") before the next scan.',
            incorrect: 'Calling pBLEScan->start() repeatedly without clearing results or deinitializing. Each BLE scan allocates heap for discovered devices. Without clearing, heap fills up after 2-3 cycles and the ESP32 triggers a watchdog reset.',
            consequence: 'The ESP32 runs one or two scan cycles successfully, then reboots with a "Guru Meditation Error" or watchdog timeout. Serial shows "rst:0x8 (TG1WDT_SYS_RESET)" -- the classic ESP32 heap exhaustion symptom.',
            svgDiff: '<svg viewBox="0 0 640 148" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg07-m2-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="148" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="136" fill="url(#sg07-m2-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="118" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="90" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#ff6b35" font-size="6.5">BLEScanResults r = pBLEScan->start(5, false);</text>' +
                     '<text x="30" y="64" fill="#22c55e" font-size="6.5">pBLEScan->clearResults();  // free heap</text>' +
                     '<text x="30" y="78" fill="#22c55e" font-size="6.5">BLEDevice::deinit(false);  // free stack</text>' +
                     '<text x="30" y="92" fill="#555" font-size="6">// ... Classic BT scan ...</text>' +
                     '<text x="30" y="106" fill="#ff6b35" font-size="6.5">BLEDevice::init("");        // re-init next cycle</text>' +
                     '<text x="161" y="126" text-anchor="middle" fill="#22c55e" font-size="7">Heap released after each cycle -- stable long-term</text>' +
                     '<rect x="330" y="14" width="298" height="118" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="90" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#ff6b35" font-size="6.5">BLEScanResults r = pBLEScan->start(5, false);</text>' +
                     '<text x="348" y="64" fill="#ef4444" font-size="6.5">// clearResults() missing</text>' +
                     '<text x="348" y="78" fill="#ef4444" font-size="6.5">// deinit() missing</text>' +
                     '<text x="348" y="92" fill="#555" font-size="6">// Heap grows each cycle</text>' +
                     '<text x="348" y="106" fill="#ef4444" font-size="6.5">BLEScanResults r = pBLEScan->start(5, false);</text>' +
                     '<text x="479" y="126" text-anchor="middle" fill="#ef4444" font-size="7">Heap exhausted after 2-3 cycles -- watchdog reset</text>' +
                     '</svg>'
        }
    ]
};

// =========================================================================
// SG-08: Packet Traffic Dashboard (ESP32 CYD)
// =========================================================================
window.SignalGuides['sg-08'] = {

    intro: '<p>Every WiFi network is a constant stream of invisible radio frames. Access points send beacons 10 times per second, devices send probe requests looking for known networks, data frames carry actual traffic, and management frames handle associations and authentication. In this project you will put the ESP32 into promiscuous mode to capture these raw 802.11 frames and visualize the traffic breakdown on the CYD touchscreen.</p>' +
           '<p>Promiscuous mode is a special WiFi operating mode where the radio captures all frames it can decode on its current channel, not just frames addressed to it. The ESP32 provides a low-level callback API (<code>esp_wifi_set_promiscuous_rx_cb</code>) that fires for every received frame, giving you access to the raw 802.11 header including frame type, subtype, source/destination MAC, and signal strength.</p>' +
           '<p>This project builds directly on the TFT and touch skills from SG-06. You will add frame parsing, real-time counters, a bar chart visualization, channel hopping, and probe request logging -- turning the CYD into a pocket-sized wireless traffic monitor.</p>',

    wiring: '  ESP32 CYD (ESP32-2432S028R)\n' +
            '  +-------------------------------+\n' +
            '  |  Same hardware as SG-06       |\n' +
            '  |  No additional wiring needed   |\n' +
            '  |                                 |\n' +
            '  |  USB-C --- power + programming  |\n' +
            '  +-------------------------------+\n' +
            '\n' +
            '  The ESP32 WiFi radio operates in\n' +
            '  promiscuous (monitor) mode to\n' +
            '  receive all 802.11 frames on the\n' +
            '  current channel.',

    wiringNotes: '<p>No additional hardware beyond the CYD and USB-C cable. This project is purely a firmware change from SG-06. The same TFT_eSPI configuration applies.</p>',

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
        '<defs>' +
        '<pattern id="sg08-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="720" height="400" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="700" height="380" fill="url(#sg08-grid)" rx="4"/>' +
        '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">PACKET TRAFFIC DASHBOARD — PROMISCUOUS MODE</text>' +

        '<!-- CYD Board -->' +
        '<rect x="230" y="55" width="260" height="200" rx="10" fill="#1a1f2b" stroke="#22c55e" stroke-width="2"/>' +
        '<rect x="230" y="55" width="260" height="28" rx="10" fill="rgba(34,197,94,0.12)"/>' +
        '<rect x="230" y="75" width="260" height="8" fill="rgba(34,197,94,0.12)"/>' +
        '<text x="360" y="74" text-anchor="middle" fill="#4ade80" font-size="11" font-weight="600">ESP32 CYD (Promiscuous)</text>' +

        '<!-- USB-C -->' +
        '<rect x="335" y="42" width="50" height="18" rx="4" fill="#2a2a3a" stroke="#888" stroke-width="1"/>' +
        '<text x="360" y="54" text-anchor="middle" fill="#999" font-size="7">USB-C</text>' +

        '<!-- TFT showing dashboard -->' +
        '<rect x="250" y="95" width="160" height="100" rx="4" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="330" y="110" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">TRAFFIC DASHBOARD</text>' +
        '<!-- Bar chart representation -->' +
        '<text x="260" y="124" fill="#22c55e" font-size="5">MGMT</text>' +
        '<rect x="290" y="118" width="100" height="8" rx="2" fill="rgba(34,197,94,0.4)"/>' +
        '<text x="260" y="138" fill="#eab308" font-size="5">CTRL</text>' +
        '<rect x="290" y="132" width="45" height="8" rx="2" fill="rgba(234,179,8,0.4)"/>' +
        '<text x="260" y="152" fill="#60a5fa" font-size="5">DATA</text>' +
        '<rect x="290" y="146" width="70" height="8" rx="2" fill="rgba(59,130,246,0.4)"/>' +
        '<text x="260" y="168" fill="#f97316" font-size="5">Probes: 42</text>' +
        '<text x="260" y="178" fill="#ef4444" font-size="5">Deauths: 0</text>' +
        '<text x="330" y="190" text-anchor="middle" fill="#555" font-size="5">Ch 6 | 287 fps</text>' +

        '<!-- ESP32 radio info -->' +
        '<rect x="425" y="100" width="55" height="90" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
        '<text x="452" y="115" text-anchor="middle" fill="#4ade80" font-size="6" font-weight="600">WiFi</text>' +
        '<text x="452" y="128" text-anchor="middle" fill="#4ade80" font-size="5">Monitor</text>' +
        '<text x="452" y="138" text-anchor="middle" fill="#4ade80" font-size="5">Mode</text>' +
        '<text x="452" y="155" text-anchor="middle" fill="#8b949e" font-size="5">Ch 1-13</text>' +
        '<text x="452" y="168" text-anchor="middle" fill="#8b949e" font-size="5">Hopping</text>' +
        '<text x="452" y="181" text-anchor="middle" fill="#8b949e" font-size="5">200ms</text>' +

        '<!-- Wireless frames coming in from left -->' +
        '<g opacity="0.6">' +
        '<!-- Access points -->' +
        '<rect x="40" y="80" width="110" height="40" rx="5" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
        '<text x="95" y="98" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">Access Point 1</text>' +
        '<text x="95" y="112" text-anchor="middle" fill="#8b949e" font-size="6">Beacons @ 10/sec</text>' +

        '<rect x="40" y="135" width="110" height="40" rx="5" fill="#1e2736" stroke="#eab308" stroke-width="1"/>' +
        '<text x="95" y="153" text-anchor="middle" fill="#eab308" font-size="7" font-weight="600">Client Device</text>' +
        '<text x="95" y="167" text-anchor="middle" fill="#8b949e" font-size="6">Probe Requests</text>' +

        '<rect x="40" y="190" width="110" height="40" rx="5" fill="#1e2736" stroke="#3b82f6" stroke-width="1"/>' +
        '<text x="95" y="208" text-anchor="middle" fill="#3b82f6" font-size="7" font-weight="600">Data Traffic</text>' +
        '<text x="95" y="222" text-anchor="middle" fill="#8b949e" font-size="6">Encrypted Frames</text>' +
        '</g>' +

        '<!-- Frame arrows -->' +
        '<line x1="150" y1="100" x2="226" y2="130" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
        '<polygon points="224,126 230,132 222,134" fill="#22c55e" opacity="0.4"/>' +
        '<line x1="150" y1="155" x2="226" y2="155" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
        '<polygon points="224,151 230,155 224,159" fill="#eab308" opacity="0.4"/>' +
        '<line x1="150" y1="210" x2="226" y2="180" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
        '<polygon points="224,176 230,178 224,182" fill="#3b82f6" opacity="0.4"/>' +

        '<!-- Right side: access points -->' +
        '<g opacity="0.6">' +
        '<rect x="570" y="80" width="110" height="40" rx="5" fill="#1e2736" stroke="#22c55e" stroke-width="1"/>' +
        '<text x="625" y="98" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600">Access Point 2</text>' +
        '<text x="625" y="112" text-anchor="middle" fill="#8b949e" font-size="6">Ch 11 / WPA2</text>' +

        '<rect x="570" y="135" width="110" height="40" rx="5" fill="#1e2736" stroke="#f97316" stroke-width="1"/>' +
        '<text x="625" y="153" text-anchor="middle" fill="#f97316" font-size="7" font-weight="600">Phone (Probing)</text>' +
        '<text x="625" y="167" text-anchor="middle" fill="#8b949e" font-size="6">"Home_WiFi?"</text>' +
        '</g>' +

        '<line x1="570" y1="100" x2="494" y2="130" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
        '<polygon points="496,126 490,132 498,134" fill="#22c55e" opacity="0.4"/>' +
        '<line x1="570" y1="155" x2="494" y2="155" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
        '<polygon points="496,151 490,155 496,159" fill="#f97316" opacity="0.4"/>' +

        '<!-- 802.11 Frame Types legend -->' +
        '<rect x="40" y="270" width="640" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
        '<text x="60" y="288" fill="#555" font-size="7" font-weight="600" letter-spacing="0.1em">802.11 FRAME TYPES CAPTURED</text>' +
        '<rect x="60" y="296" width="120" height="20" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="120" y="309" text-anchor="middle" fill="#22c55e" font-size="7">Management (Beacons)</text>' +
        '<rect x="195" y="296" width="120" height="20" rx="3" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
        '<text x="255" y="309" text-anchor="middle" fill="#eab308" font-size="7">Control (ACK/RTS)</text>' +
        '<rect x="330" y="296" width="120" height="20" rx="3" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
        '<text x="390" y="309" text-anchor="middle" fill="#3b82f6" font-size="7">Data (Payload)</text>' +
        '<rect x="465" y="296" width="100" height="20" rx="3" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" stroke-width="0.5"/>' +
        '<text x="515" y="309" text-anchor="middle" fill="#f97316" font-size="7">Probe Requests</text>' +

        '<!-- Bottom note -->' +
        '<rect x="40" y="340" width="640" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
        '<text x="60" y="362" fill="#555" font-size="7" font-weight="600">NOTES:</text>' +
        '<text x="115" y="362" fill="#8b949e" font-size="7">Same CYD hardware as SG-06. Promiscuous mode captures all 802.11 frames on the current channel.</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Understand 802.11 Frame Types',
            content: '<p>Every 802.11 frame has a 2-byte Frame Control field at the start. Bits 2-3 encode the <strong>type</strong> and bits 4-7 encode the <strong>subtype</strong>. There are three main types:</p>' +
                     '<ul>' +
                     '<li><strong>Management (type 0)</strong> -- Beacons, probe requests/responses, association, authentication, deauthentication. These are the control plane of WiFi.</li>' +
                     '<li><strong>Control (type 1)</strong> -- ACKs, RTS/CTS, block acknowledgments. These are short frames that coordinate medium access.</li>' +
                     '<li><strong>Data (type 2)</strong> -- Actual payload frames carrying user traffic. Includes QoS data, null data, and encrypted payloads.</li>' +
                     '</ul>' +
                     '<p>We will count frames in each category and track interesting subtypes like probe requests (type 0, subtype 4) which reveal what SSIDs nearby devices are searching for.</p>',
            language: 'C++',
            code: '#include <WiFi.h>\n#include "esp_wifi.h"\n\n// Frame type constants from 802.11 spec\n#define FRAME_TYPE_MGMT    0\n#define FRAME_TYPE_CTRL    1\n#define FRAME_TYPE_DATA    2\n\n// Interesting management subtypes\n#define SUBTYPE_ASSOC_REQ  0\n#define SUBTYPE_PROBE_REQ  4\n#define SUBTYPE_PROBE_RSP  5\n#define SUBTYPE_BEACON     8\n#define SUBTYPE_DEAUTH    12\n\n// Traffic counters\nvolatile uint32_t mgmtCount = 0;\nvolatile uint32_t ctrlCount = 0;\nvolatile uint32_t dataCount = 0;\nvolatile uint32_t beaconCount = 0;\nvolatile uint32_t probeReqCount = 0;\nvolatile uint32_t deauthCount = 0;\nvolatile uint32_t totalFrames = 0;\n\n// Per-second rate tracking\nuint32_t prevTotal = 0;\nuint32_t framesPerSecond = 0;',
        },
        {
            title: 'Set Up the Promiscuous Mode Callback',
            content: '<p>The ESP32 WiFi API provides <code>esp_wifi_set_promiscuous(true)</code> to enable monitor mode and <code>esp_wifi_set_promiscuous_rx_cb()</code> to register a callback function. This callback fires for every received frame and provides a pointer to the frame data plus metadata including RSSI and channel.</p>' +
                     '<p>Important: The callback runs in the WiFi task context, not the Arduino loop. Keep it as fast as possible -- just parse the header, increment counters, and return. Do not call Serial.print or TFT functions from inside the callback.</p>',
            language: 'C++',
            code: '// The promiscuous mode callback structure\ntypedef struct {\n    unsigned frame_ctrl:16;\n    unsigned duration_id:16;\n    uint8_t addr1[6];  // Receiver\n    uint8_t addr2[6];  // Transmitter\n    uint8_t addr3[6];  // BSSID or other\n    unsigned sequence_ctrl:16;\n} wifi_ieee80211_mac_hdr_t;\n\ntypedef struct {\n    wifi_ieee80211_mac_hdr_t hdr;\n    uint8_t payload[0];\n} wifi_ieee80211_packet_t;\n\n// Probe request log (circular buffer)\n#define PROBE_LOG_SIZE 32\nstruct ProbeEntry {\n    char ssid[33];\n    uint8_t srcMac[6];\n    int8_t rssi;\n    unsigned long timestamp;\n};\nProbeEntry probeLog[PROBE_LOG_SIZE];\nint probeLogIndex = 0;\n\nvoid IRAM_ATTR promiscuousCallback(void* buf, wifi_promiscuous_pkt_type_t type) {\n    const wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buf;\n    const wifi_ieee80211_packet_t* frame = (wifi_ieee80211_packet_t*)pkt->payload;\n\n    uint16_t frameCtrl = frame->hdr.frame_ctrl;\n    uint8_t frameType = (frameCtrl >> 2) & 0x03;\n    uint8_t frameSubtype = (frameCtrl >> 4) & 0x0F;\n\n    totalFrames++;\n\n    switch (frameType) {\n        case FRAME_TYPE_MGMT:\n            mgmtCount++;\n            if (frameSubtype == SUBTYPE_BEACON) beaconCount++;\n            else if (frameSubtype == SUBTYPE_DEAUTH) deauthCount++;\n            else if (frameSubtype == SUBTYPE_PROBE_REQ) {\n                probeReqCount++;\n                // Extract SSID from probe request payload\n                parseProbeRequest(pkt, frame);\n            }\n            break;\n        case FRAME_TYPE_CTRL:\n            ctrlCount++;\n            break;\n        case FRAME_TYPE_DATA:\n            dataCount++;\n            break;\n    }\n}\n\nvoid parseProbeRequest(const wifi_promiscuous_pkt_t* pkt,\n                       const wifi_ieee80211_packet_t* frame) {\n    // Probe request body starts after the MAC header (24 bytes)\n    // First element is SSID tagged parameter: tag=0, len, ssid_bytes\n    const uint8_t* payload = pkt->payload + 24;\n    uint16_t payloadLen = pkt->rx_ctrl.sig_len - 24 - 4;  // minus FCS\n\n    if (payloadLen < 2) return;\n    if (payload[0] != 0) return;  // Tag 0 = SSID\n\n    uint8_t ssidLen = payload[1];\n    if (ssidLen == 0 || ssidLen > 32) return;  // Broadcast probe or invalid\n\n    ProbeEntry &entry = probeLog[probeLogIndex % PROBE_LOG_SIZE];\n    memcpy(entry.ssid, payload + 2, ssidLen);\n    entry.ssid[ssidLen] = \'\\0\';\n    memcpy(entry.srcMac, frame->hdr.addr2, 6);\n    entry.rssi = pkt->rx_ctrl.rssi;\n    entry.timestamp = millis();\n    probeLogIndex++;\n}',
            tip: '<strong>IRAM_ATTR:</strong> The callback is tagged with <code>IRAM_ATTR</code> to place it in instruction RAM for faster execution. This is important because the callback fires at very high rates (hundreds to thousands of times per second on busy channels).'
        },
        {
            title: 'Build the TFT Bar Chart Visualization',
            content: '<p>We will display three horizontal bars representing Management, Control, and Data frame counts, scaled proportionally. Below the bars we show key metrics: frames per second, beacon rate, probe request count, and any deauth detections (which could indicate an attack).</p>',
            language: 'C++',
            code: '#include <TFT_eSPI.h>\nTFT_eSPI tft = TFT_eSPI();\n\n#define BG       0x0841\n#define HDR_BG   0x1082\n#define CYAN     0x07FF\n#define GREEN    0x07E0\n#define YELLOW   0xFFE0\n#define RED      0xF800\n#define ORANGE   0xFD20\n#define WHITE    0xFFFF\n#define GREY     0xB596\n\nint currentChannel = 1;\n\nvoid drawDashboard() {\n    tft.fillScreen(BG);\n\n    // Header\n    tft.fillRect(0, 0, 320, 30, HDR_BG);\n    tft.setTextColor(CYAN, HDR_BG);\n    tft.setTextSize(1);\n    tft.setCursor(8, 4);\n    tft.print("PACKET TRAFFIC DASHBOARD");\n    tft.setCursor(8, 16);\n    tft.setTextColor(GREY, HDR_BG);\n    tft.printf("Ch %d  |  %lu fps  |  %lu total\", currentChannel, framesPerSecond, totalFrames);\n\n    // Bar chart area (y=40 to y=160)\n    uint32_t maxVal = max({mgmtCount, ctrlCount, dataCount, (uint32_t)1});\n    int barMaxWidth = 200;\n\n    // Management bar\n    int mgmtW = (mgmtCount * barMaxWidth) / maxVal;\n    tft.setCursor(8, 45);\n    tft.setTextColor(GREEN, BG);\n    tft.print("MGMT");\n    tft.fillRect(60, 42, mgmtW, 18, GREEN);\n    tft.setCursor(65 + mgmtW, 45);\n    tft.setTextColor(GREY, BG);\n    tft.printf(\"%lu\", mgmtCount);\n\n    // Control bar\n    int ctrlW = (ctrlCount * barMaxWidth) / maxVal;\n    tft.setCursor(8, 75);\n    tft.setTextColor(YELLOW, BG);\n    tft.print("CTRL");\n    tft.fillRect(60, 72, ctrlW, 18, YELLOW);\n    tft.setCursor(65 + ctrlW, 75);\n    tft.setTextColor(GREY, BG);\n    tft.printf(\"%lu\", ctrlCount);\n\n    // Data bar\n    int dataW = (dataCount * barMaxWidth) / maxVal;\n    tft.setCursor(8, 105);\n    tft.setTextColor(CYAN, BG);\n    tft.print("DATA");\n    tft.fillRect(60, 102, dataW, 18, CYAN);\n    tft.setCursor(65 + dataW, 105);\n    tft.setTextColor(GREY, BG);\n    tft.printf(\"%lu\", dataCount);\n\n    // Metrics row\n    int metricsY = 140;\n    tft.drawLine(0, metricsY - 5, 320, metricsY - 5, 0x1082);\n\n    tft.setTextColor(GREEN, BG);\n    tft.setCursor(8, metricsY);\n    tft.printf("Beacons: %lu\", beaconCount);\n\n    tft.setTextColor(ORANGE, BG);\n    tft.setCursor(8, metricsY + 16);\n    tft.printf("Probes:  %lu\", probeReqCount);\n\n    tft.setTextColor(deauthCount > 0 ? RED : GREY, BG);\n    tft.setCursor(8, metricsY + 32);\n    tft.printf("Deauths: %lu  %s\", deauthCount,\n              deauthCount > 0 ? \"<< ALERT\" : \"\");\n\n    // Recent probe requests\n    tft.setTextColor(GREY, BG);\n    tft.setCursor(8, metricsY + 54);\n    tft.print("Recent probes:");\n    int startIdx = max(0, probeLogIndex - 3);\n    for (int i = startIdx; i < probeLogIndex && i < startIdx + 3; i++) {\n        ProbeEntry &p = probeLog[i % PROBE_LOG_SIZE];\n        int row = metricsY + 66 + (i - startIdx) * 12;\n        tft.setCursor(16, row);\n        tft.setTextColor(ORANGE, BG);\n        tft.printf(\"  %s (%ddBm)\", p.ssid, p.rssi);\n    }\n}',
        },
        {
            title: 'Add Channel Hopping',
            content: '<p>WiFi operates on channels 1-13 (2.4 GHz). If we stay on one channel, we only see traffic on that channel. Channel hopping cycles through all channels to capture a broader view of the wireless environment.</p>' +
                     '<p>We hop channels on a timer. Spending too little time on each channel means we miss frames; too long means we do not see all channels. A 200ms dwell time per channel gives a full sweep every 2.6 seconds, which is a good balance.</p>',
            language: 'C++',
            code: 'unsigned long lastChannelHop = 0;\nconst int CHANNEL_DWELL_MS = 200;  // Time on each channel\nconst int MAX_CHANNEL = 13;\nbool channelHopping = true;\n\nvoid hopChannel() {\n    if (!channelHopping) return;\n    if (millis() - lastChannelHop < CHANNEL_DWELL_MS) return;\n\n    currentChannel++;\n    if (currentChannel > MAX_CHANNEL) currentChannel = 1;\n\n    esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);\n    lastChannelHop = millis();\n}\n\n// Lock to a specific channel (call from touch handler)\nvoid lockChannel(int ch) {\n    channelHopping = false;\n    currentChannel = ch;\n    esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);\n}\n\n// Resume hopping\nvoid resumeHopping() {\n    channelHopping = true;\n}',
        },
        {
            title: 'Initialize Promiscuous Mode',
            content: '<p>Putting it together: we initialize WiFi in station mode, then switch to promiscuous mode. The ESP32 cannot be connected to an AP while in promiscuous mode -- it is a passive listener only.</p>',
            language: 'C++',
            code: 'void initPromiscuous() {\n    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();\n    esp_wifi_init(&cfg);\n    esp_wifi_set_storage(WIFI_STORAGE_RAM);\n    esp_wifi_set_mode(WIFI_MODE_NULL);\n    esp_wifi_start();\n\n    // Set filter to receive all frame types\n    wifi_promiscuous_filter_t filter = {\n        .filter_mask = WIFI_PROMIS_FILTER_MASK_ALL\n    };\n    esp_wifi_set_promiscuous_filter(&filter);\n    esp_wifi_set_promiscuous_rx_cb(&promiscuousCallback);\n    esp_wifi_set_promiscuous(true);\n    esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);\n\n    Serial.println("[SG-08] Promiscuous mode enabled");\n}',
        },
        {
            title: 'Complete Sketch with Touch Controls',
            content: '<p>The final sketch adds touch interaction: tap the header to toggle channel hopping on/off. When hopping is off, tap the left or right side of the header to step through channels manually. Tap the lower screen area to reset counters. The dashboard refreshes once per second.</p>',
            language: 'C++',
            code: '#include <WiFi.h>\n#include "esp_wifi.h"\n#include <TFT_eSPI.h>\n\n// --- Paste all structs, counters, callbacks, display, and\n//     channel functions from steps above ---\n\nuint16_t calData[5] = { 389, 3461, 257, 3493, 1 };\nunsigned long lastDraw = 0;\n\nvoid setup() {\n    Serial.begin(115200);\n    Serial.println("[SG-08] Packet Traffic Dashboard starting...");\n\n    tft.init();\n    tft.setRotation(1);\n    tft.fillScreen(BG);\n    tft.setTouch(calData);\n    pinMode(21, OUTPUT);\n    digitalWrite(21, HIGH);\n\n    tft.setTextColor(CYAN, BG);\n    tft.setTextSize(2);\n    tft.setCursor(30, 100);\n    tft.print("Initializing...");\n\n    initPromiscuous();\n    lastDraw = millis();\n}\n\nvoid loop() {\n    hopChannel();\n\n    // Update display once per second\n    if (millis() - lastDraw >= 1000) {\n        framesPerSecond = totalFrames - prevTotal;\n        prevTotal = totalFrames;\n        drawDashboard();\n        lastDraw = millis();\n    }\n\n    // Handle touch\n    uint16_t tx, ty;\n    if (tft.getTouch(&tx, &ty)) {\n        delay(50);\n        while (tft.getTouch(&tx, &ty)) { delay(10); }\n\n        if (ty < 30) {\n            // Header area\n            if (tx < 80) {\n                // Left: previous channel (manual mode)\n                if (currentChannel > 1) lockChannel(currentChannel - 1);\n            } else if (tx > 240) {\n                // Right: next channel\n                if (currentChannel < MAX_CHANNEL) lockChannel(currentChannel + 1);\n            } else {\n                // Center: toggle hopping\n                if (channelHopping) lockChannel(currentChannel);\n                else resumeHopping();\n            }\n        } else if (ty > 200) {\n            // Bottom: reset counters\n            mgmtCount = ctrlCount = dataCount = 0;\n            beaconCount = probeReqCount = deauthCount = 0;\n            totalFrames = prevTotal = 0;\n            probeLogIndex = 0;\n        }\n    }\n}',
            tip: '<strong>Performance:</strong> On a busy WiFi channel, the callback may fire 500-2000 times per second. The ESP32 handles this well because the callback only increments counters (a few nanoseconds each). The expensive TFT drawing happens once per second in the main loop, completely decoupled from the capture rate.'
        }
    ],

    testing: '<p>After flashing, verify:</p>' +
             '<ul>' +
             '<li><strong>Frame counter increases</strong> -- The total frame count should climb rapidly. On a typical home network you should see 50-200 frames per second per channel, mostly beacons.</li>' +
             '<li><strong>Management frames dominate</strong> -- The Management bar should be the largest because beacons are sent 10x/second by every AP in range.</li>' +
             '<li><strong>Data frames appear during activity</strong> -- Stream a video on a device and watch the Data bar grow. When nothing is actively using the network, data frames are sparse.</li>' +
             '<li><strong>Probe requests log SSIDs</strong> -- The "Recent probes" section should show network names that nearby phones are searching for. This is a powerful demonstration of information leakage.</li>' +
             '<li><strong>Channel hopping works</strong> -- The "Ch N" indicator should cycle through 1-13. Tap the header center to stop hopping and verify the channel stays fixed.</li>' +
             '<li><strong>Deauth counter</strong> -- Should be 0 under normal conditions. If you see deauths, someone may be running a deauth attack (see SG-10).</li>' +
             '</ul>',

    troubleshooting: '<ul>' +
                     '<li><strong>0 frames captured</strong> -- Ensure <code>esp_wifi_set_promiscuous(true)</code> returns ESP_OK. Check that you are using <code>WIFI_MODE_NULL</code> not <code>WIFI_MODE_STA</code> -- station mode and promiscuous mode conflict on some firmware versions.</li>' +
                     '<li><strong>Only beacons, no data frames</strong> -- Data frames are encrypted and addressed to specific stations. You will only capture data frames on channels where active devices are associated. Try locking to your router\'s channel and generating traffic.</li>' +
                     '<li><strong>ESP32 resets/crashes</strong> -- The promiscuous callback must be fast. If you added Serial.print or TFT calls inside it, remove them. Only increment counters in the callback.</li>' +
                     '<li><strong>Channel hopping misses frames</strong> -- This is inherent to single-radio scanning. While on channel 6, you cannot see channel 1 traffic. A 200ms dwell time means you miss about 85% of frames on any given channel. This is normal for a single-antenna scanner.</li>' +
                     '<li><strong>Probe SSIDs look garbled</strong> -- Ensure the SSID length byte is validated (0 < len <= 32) before copying. Some malformed probe requests have invalid lengths.</li>' +
                     '</ul>',

    challenges: '<p><strong>Challenge 1: Per-Channel Traffic Histogram</strong> -- Track frame counts per channel separately during hopping. After a full sweep, display a mini bar chart showing which channels are busiest. This is useful for choosing the least congested channel for your own network.</p>' +
                '<p><strong>Challenge 2: Unique Device Counter</strong> -- Extract the source MAC (addr2) from each frame and maintain a set of unique transmitters. Display the count of unique devices seen. This tells you how many active wireless devices are in range.</p>' +
                '<p><strong>Challenge 3: Traffic Rate Graph</strong> -- Instead of cumulative counts, display a scrolling line graph of frames-per-second over the last 60 seconds. This shows traffic patterns over time and makes spikes instantly visible.</p>',

    // ======================================================================
    // SIG-2: Step visual illustrations (0-based step index)
    // ======================================================================
    stepVisuals: {
        // Step 0 — 802.11 Frame Control field bit layout
        0: '<svg viewBox="0 0 680 192" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg08-sv0-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
           '<rect width="680" height="192" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="176" fill="url(#sg08-sv0-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">802.11 FRAME CONTROL — 16-BIT FIELD BREAKDOWN</text>' +
           '<rect x="16" y="30" width="648" height="40" rx="4" fill="#0f1923" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="26" y="42" fill="#555" font-size="6.5" font-weight="700">FRAME CONTROL (first 2 bytes of every 802.11 frame)</text>' +
           '<rect x="20" y="47" width="56" height="18" rx="2" fill="rgba(255,255,255,0.06)"/>' +
           '<text x="48" y="59" text-anchor="middle" fill="#8b949e" font-size="6">bits [1:0]</text>' +
           '<rect x="82" y="47" width="76" height="18" rx="2" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" stroke-width="0.5"/>' +
           '<text x="120" y="59" text-anchor="middle" fill="#22c55e" font-size="6" font-weight="700">bits [3:2] — TYPE</text>' +
           '<rect x="164" y="47" width="120" height="18" rx="2" fill="rgba(255,107,53,0.12)" stroke="rgba(255,107,53,0.3)" stroke-width="0.5"/>' +
           '<text x="224" y="59" text-anchor="middle" fill="#ff6b35" font-size="6" font-weight="700">bits [7:4] — SUBTYPE</text>' +
           '<rect x="290" y="47" width="100" height="18" rx="2" fill="rgba(255,255,255,0.05)"/>' +
           '<text x="340" y="59" text-anchor="middle" fill="#555" font-size="6">bits [8:11] flags</text>' +
           '<rect x="396" y="47" width="240" height="18" rx="2" fill="rgba(255,255,255,0.04)"/>' +
           '<text x="516" y="59" text-anchor="middle" fill="#444" font-size="6">bits [15:12] — more flags</text>' +
           '<rect x="16" y="82" width="648" height="100" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
           '<text x="26" y="96" fill="#555" font-size="6.5" font-weight="700">TYPE FIELD (bits [3:2]) — ONLY 3 VALUES EXIST IN 802.11</text>' +
           '<rect x="24" y="102" width="200" height="24" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
           '<text x="124" y="116" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="700">00 = Management</text>' +
           '<text x="124" y="126" text-anchor="middle" fill="#555" font-size="5.5">Beacons, Probes, Deauths</text>' +
           '<rect x="234" y="102" width="200" height="24" rx="3" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.2)" stroke-width="0.5"/>' +
           '<text x="334" y="116" text-anchor="middle" fill="#eab308" font-size="7" font-weight="700">01 = Control</text>' +
           '<text x="334" y="126" text-anchor="middle" fill="#555" font-size="5.5">ACK, RTS, CTS, BlockACK</text>' +
           '<rect x="444" y="102" width="200" height="24" rx="3" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
           '<text x="544" y="116" text-anchor="middle" fill="#60a5fa" font-size="7" font-weight="700">10 = Data</text>' +
           '<text x="544" y="126" text-anchor="middle" fill="#555" font-size="5.5">Encrypted user traffic</text>' +
           '<text x="26" y="148" fill="#555" font-size="6.5" font-weight="700">KEY SUBTYPES (bits [7:4]):</text>' +
           '<text x="26" y="161" fill="#22c55e" font-size="6.5">Mgmt: 0000=AssocReq  0100=ProbeReq  0101=ProbeResp  1000=Beacon  1100=Deauth  1010=Disassoc</text>' +
           '<text x="26" y="174" fill="#eab308" font-size="6.5">Ctrl: 1011=RTS  1100=CTS  1101=ACK  1000=BlockACK</text>' +
           '</svg>',

        // Step 2 — Promiscuous callback data flow / IRAM_ATTR timing
        2: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg08-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
           '<marker id="sg08-arr-o" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#ff6b35"/></marker>' +
           '<marker id="sg08-arr-g" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#22c55e"/></marker></defs>' +
           '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="172" fill="url(#sg08-sv2-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">PROMISCUOUS CALLBACK — EXECUTION CONTEXT</text>' +
           '<rect x="16" y="30" width="200" height="130" rx="6" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
           '<rect x="16" y="30" width="200" height="22" rx="6" fill="rgba(59,130,246,0.12)"/>' +
           '<text x="116" y="44" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="700">WiFi Radio / Driver</text>' +
           '<text x="116" y="60" text-anchor="middle" fill="#8b949e" font-size="6.5">Receives 802.11 frame on air</text>' +
           '<text x="116" y="73" text-anchor="middle" fill="#8b949e" font-size="6.5">Decodes signal to bits</text>' +
           '<text x="116" y="86" text-anchor="middle" fill="#8b949e" font-size="6.5">Validates CRC</text>' +
           '<text x="116" y="99" text-anchor="middle" fill="#8b949e" font-size="6.5">Fills wifi_promiscuous_pkt_t</text>' +
           '<text x="116" y="112" text-anchor="middle" fill="#ff6b35" font-size="6.5" font-weight="600">Fires callback</text>' +
           '<text x="116" y="128" text-anchor="middle" fill="#555" font-size="5.5">Runs in WiFi task context</text>' +
           '<text x="116" y="140" text-anchor="middle" fill="#555" font-size="5.5">~500-2000 calls/sec busy ch</text>' +
           '<line x1="218" y1="112" x2="248" y2="112" stroke="#ff6b35" stroke-width="1.5" marker-end="url(#sg08-arr-o)"/>' +
           '<rect x="250" y="30" width="200" height="130" rx="6" fill="#1e2736" stroke="#ff6b35" stroke-width="1.5"/>' +
           '<rect x="250" y="30" width="200" height="22" rx="6" fill="rgba(255,107,53,0.12)"/>' +
           '<text x="350" y="44" text-anchor="middle" fill="#fb923c" font-size="8" font-weight="700">IRAM_ATTR Callback</text>' +
           '<text x="350" y="60" text-anchor="middle" fill="#8b949e" font-size="6.5">Runs in instruction RAM</text>' +
           '<text x="350" y="73" text-anchor="middle" fill="#22c55e" font-size="6.5">frameType = (ctrl >> 2) &amp; 3</text>' +
           '<text x="350" y="86" text-anchor="middle" fill="#22c55e" font-size="6.5">mgmtCount++ / ctrlCount++</text>' +
           '<text x="350" y="99" text-anchor="middle" fill="#22c55e" font-size="6.5">probeReqCount++ if subtype==4</text>' +
           '<text x="350" y="112" text-anchor="middle" fill="#ef4444" font-size="6.5">NO Serial.print here</text>' +
           '<text x="350" y="125" text-anchor="middle" fill="#ef4444" font-size="6.5">NO TFT calls here</text>' +
           '<text x="350" y="140" text-anchor="middle" fill="#555" font-size="5.5">Must return in &lt;10 microseconds</text>' +
           '<line x1="452" y1="112" x2="482" y2="112" stroke="#22c55e" stroke-width="1.5" marker-end="url(#sg08-arr-g)"/>' +
           '<rect x="484" y="30" width="180" height="130" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
           '<rect x="484" y="30" width="180" height="22" rx="6" fill="rgba(34,197,94,0.12)"/>' +
           '<text x="574" y="44" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="700">Main Loop (1Hz)</text>' +
           '<text x="574" y="60" text-anchor="middle" fill="#8b949e" font-size="6.5">Reads volatile counters</text>' +
           '<text x="574" y="73" text-anchor="middle" fill="#8b949e" font-size="6.5">Calculates fps = delta/sec</text>' +
           '<text x="574" y="86" text-anchor="middle" fill="#8b949e" font-size="6.5">Calls drawDashboard()</text>' +
           '<text x="574" y="99" text-anchor="middle" fill="#8b949e" font-size="6.5">Handles touch events</text>' +
           '<text x="574" y="112" text-anchor="middle" fill="#8b949e" font-size="6.5">Calls hopChannel()</text>' +
           '<text x="574" y="125" text-anchor="middle" fill="#555" font-size="5.5">Safe to Serial.print here</text>' +
           '<text x="574" y="140" text-anchor="middle" fill="#555" font-size="5.5">TFT draw is safe here</text>' +
           '<text x="340" y="172" text-anchor="middle" fill="#333" font-size="6.5">volatile keyword ensures main loop sees counter updates from callback running on WiFi task</text>' +
           '</svg>'
    },

    // ======================================================================
    // SIG-3: Component callouts -- 802.11 frame type breakdown
    // ======================================================================
    componentCallouts: {
        svg: '<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;max-width:440px;width:100%;height:auto">' +
             '<defs><pattern id="sg08-cc-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.7" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
             '<rect width="440" height="280" fill="#0d1117" rx="6"/>' +
             '<rect x="6" y="6" width="428" height="268" fill="url(#sg08-cc-grid)" rx="3"/>' +
             '<text x="220" y="20" text-anchor="middle" fill="#444" font-size="7" font-weight="700" letter-spacing="0.15em">802.11 FRAME TYPE MAP — INTERACTIVE</text>' +
             '<text x="220" y="30" text-anchor="middle" fill="#333" font-size="6">Hover component list items to highlight</text>' +
             '<rect x="20" y="38" width="400" height="200" rx="6" fill="#0f1923" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
             '<g data-callout="mgmt-beacon">' +
             '<rect x="30" y="52" width="116" height="44" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="50" width="120" height="48" rx="5" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="88" y="70" text-anchor="middle" fill="#4ade80" font-size="7.5" font-weight="700">Beacon</text>' +
             '<text x="88" y="83" text-anchor="middle" fill="#8b949e" font-size="5.5">Mgmt type=0, sub=8</text>' +
             '</g>' +
             '<g data-callout="mgmt-probe">' +
             '<rect x="152" y="52" width="116" height="44" rx="4" fill="#1e2736" stroke="#f97316" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="150" y="50" width="120" height="48" rx="5" fill="none" stroke="#f97316" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="210" y="70" text-anchor="middle" fill="#fb923c" font-size="7.5" font-weight="700">Probe Req</text>' +
             '<text x="210" y="83" text-anchor="middle" fill="#8b949e" font-size="5.5">Mgmt type=0, sub=4</text>' +
             '</g>' +
             '<g data-callout="mgmt-deauth">' +
             '<rect x="274" y="52" width="116" height="44" rx="4" fill="#1e2736" stroke="#ef4444" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="272" y="50" width="120" height="48" rx="5" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="332" y="70" text-anchor="middle" fill="#f87171" font-size="7.5" font-weight="700">Deauth</text>' +
             '<text x="332" y="83" text-anchor="middle" fill="#8b949e" font-size="5.5">Mgmt type=0, sub=12</text>' +
             '</g>' +
             '<g data-callout="ctrl-ack">' +
             '<rect x="30" y="108" width="116" height="44" rx="4" fill="#1e2736" stroke="#eab308" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="106" width="120" height="48" rx="5" fill="none" stroke="#eab308" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="88" y="126" text-anchor="middle" fill="#fde68a" font-size="7.5" font-weight="700">ACK / RTS</text>' +
             '<text x="88" y="139" text-anchor="middle" fill="#8b949e" font-size="5.5">Ctrl type=1, sub=13/11</text>' +
             '</g>' +
             '<g data-callout="data-qos">' +
             '<rect x="152" y="108" width="238" height="44" rx="4" fill="#1e2736" stroke="#3b82f6" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="150" y="106" width="242" height="48" rx="5" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="271" y="126" text-anchor="middle" fill="#60a5fa" font-size="7.5" font-weight="700">Data / QoS Data</text>' +
             '<text x="271" y="139" text-anchor="middle" fill="#8b949e" font-size="5.5">Data type=2 — encrypted payload frames</text>' +
             '</g>' +
             '<g data-callout="probe-ssid">' +
             '<rect x="30" y="164" width="360" height="50" rx="4" fill="#1e2736" stroke="#ff6b35" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="162" width="364" height="54" rx="5" fill="none" stroke="#ff6b35" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="210" y="182" text-anchor="middle" fill="#ff6b35" font-size="7.5" font-weight="700">Probe Request SSID Extraction</text>' +
             '<text x="210" y="195" text-anchor="middle" fill="#8b949e" font-size="5.5">payload[24] = tag 0 (SSID element), payload[25] = length, payload[26..] = SSID chars</text>' +
             '<text x="210" y="206" text-anchor="middle" fill="#555" font-size="5.5">Reveals network names devices are actively searching for -- information leakage</text>' +
             '</g>' +
             '</svg>',

        components: [
            {
                id: 'mgmt-beacon',
                name: 'A — Beacon Frame (Mgmt, subtype 8)',
                purpose: 'Broadcast by every access point 10 times per second on their operating channel. Contains SSID, BSSID, supported rates, channel, and RSN (security) information element. On a typical home network, beacons account for 60-80% of all management frames captured.',
                specs: ['Type=0 Subtype=0x08', 'Source: AP BSSID', 'Dest: FF:FF:FF:FF:FF:FF', '10 Hz interval', 'SSID in clear']
            },
            {
                id: 'mgmt-probe',
                name: 'B — Probe Request (Mgmt, subtype 4)',
                purpose: 'Sent by client devices searching for known networks. Contains the target SSID in a tagged parameter element at offset 24 of the frame body. An empty SSID (wildcard probe) requests all APs to respond. Capturing these reveals which networks a device has previously connected to -- a significant privacy leak.',
                specs: ['Type=0 Subtype=0x04', 'Source: Client MAC', 'Dest: FF:FF:FF:FF:FF:FF', 'SSID at payload[26]', 'Privacy concern']
            },
            {
                id: 'mgmt-deauth',
                name: 'C — Deauthentication (Mgmt, subtype 12)',
                purpose: 'Sent to terminate an authenticated relationship. Legitimate deauths are rare. A burst of deauths (dozens per second) targeting broadcast or a specific client indicates an attack. Our deauth counter (and SG-10) specifically watches for this pattern. WPA3 Protected Management Frames (PMF) prevents forged deauths.',
                specs: ['Type=0 Subtype=0x0C', '2-byte reason code', 'Unauth in WPA2', 'PMF prevents spoofing', 'Attack threshold: 3/2s']
            },
            {
                id: 'ctrl-ack',
                name: 'D — ACK / RTS / CTS (Control, subtype 13/11/12)',
                purpose: 'Control frames coordinate medium access. Every data frame gets an ACK from the receiver. RTS/CTS is used for large frames to reserve the medium and prevent collisions. Control frames are the shortest frames and arrive at very high rates on busy channels, sometimes exceeding management frame counts.',
                specs: ['Type=1', 'ACK: 14 bytes total', 'No SSID data', 'High rate on busy ch', 'Confirms delivery']
            },
            {
                id: 'data-qos',
                name: 'E — Data Frames (type 2)',
                purpose: 'Carry encrypted user traffic. In WPA2/WPA3 networks, the payload is encrypted with AES-CCMP and is completely opaque to passive sniffers. However, source and destination MACs remain visible, revealing which devices are communicating. On idle networks, data frames are sparse -- busy video streams produce hundreds per second.',
                specs: ['Type=2', 'Encrypted payload', 'MACs visible', 'QoS subtype common', 'AES-CCMP in WPA2']
            },
            {
                id: 'probe-ssid',
                name: 'F — Probe SSID Extraction',
                purpose: 'The SSID in a probe request sits at a fixed offset: after the 24-byte MAC header comes the frame body. Byte [0] of the body is the Element ID (0 = SSID), byte [1] is the length, and bytes [2..length+1] are the SSID characters. Our parser extracts this and logs it to the circular probe buffer displayed on the TFT.',
                specs: ['Offset: payload+24', 'Tag 0 = SSID element', 'Length byte at +25', 'String at +26', 'Max 32 chars']
            }
        ]
    },

    // ======================================================================
    // SIG-4: Common mistakes for SG-08
    // ======================================================================
    commonMistakes: [
        {
            title: 'Calling Serial.print or TFT draw inside the promiscuous callback -- ESP32 crashes',
            correct: 'Inside the callback, only increment volatile counters and copy raw data to a fixed-size circular buffer. All Serial output and TFT drawing happens in the main loop, which reads the counters once per second.',
            incorrect: 'Adding Serial.printf() or tft.print() inside promiscuousCallback(). The callback fires up to 2000 times per second on a busy channel. Serial and SPI are not re-entrant in the WiFi task context and will cause stack overflows or bus collisions.',
            consequence: 'ESP32 crashes with "Guru Meditation Error: Core 0 panic" or a watchdog reset within seconds of enabling promiscuous mode. The crash often happens inconsistently because it depends on traffic rate and timer alignment.',
            svgDiff: '<svg viewBox="0 0 640 160" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg08-m1-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="160" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="148" fill="url(#sg08-m1-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="128" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="100" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#ff6b35" font-size="6.5">void IRAM_ATTR promiscuousCallback(...) {</text>' +
                     '<text x="30" y="64" fill="#22c55e" font-size="6.5">  totalFrames++;      // fast</text>' +
                     '<text x="30" y="78" fill="#22c55e" font-size="6.5">  mgmtCount++;       // fast</text>' +
                     '<text x="30" y="92" fill="#22c55e" font-size="6.5">  // copy to buffer  // fast</text>' +
                     '<text x="30" y="106" fill="#555" font-size="6.5">  // return immediately</text>' +
                     '<text x="30" y="120" fill="#ff6b35" font-size="6.5">}</text>' +
                     '<text x="161" y="134" text-anchor="middle" fill="#22c55e" font-size="7">Counter increments only -- returns in nanoseconds</text>' +
                     '<rect x="330" y="14" width="298" height="128" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="100" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#ff6b35" font-size="6.5">void IRAM_ATTR promiscuousCallback(...) {</text>' +
                     '<text x="348" y="64" fill="#ef4444" font-size="6.5">  Serial.printf("frame\\n"); // CRASH</text>' +
                     '<text x="348" y="78" fill="#ef4444" font-size="6.5">  tft.print("frame");       // CRASH</text>' +
                     '<text x="348" y="92" fill="#555" font-size="6.5">  totalFrames++;</text>' +
                     '<text x="348" y="106" fill="#555" font-size="6.5">  ...</text>' +
                     '<text x="348" y="120" fill="#ff6b35" font-size="6.5">}</text>' +
                     '<text x="479" y="134" text-anchor="middle" fill="#ef4444" font-size="7">Stack overflow / SPI collision at high frame rates</text>' +
                     '</svg>'
        },
        {
            title: 'Promiscuous mode with WIFI_MODE_STA instead of WIFI_MODE_NULL -- 0 frames captured',
            correct: 'Initialize WiFi with esp_wifi_set_mode(WIFI_MODE_NULL) before enabling promiscuous mode. NULL mode disables AP and station roles, leaving the radio free to monitor all channels without association conflicts.',
            incorrect: 'Setting WIFI_MODE_STA then calling esp_wifi_set_promiscuous(true). In some ESP32 SDK versions, station mode and promiscuous mode conflict -- the radio filters to frames addressed to the station MAC and ignores all others.',
            consequence: 'The callback fires rarely or not at all. Frame counters stay at 0. The dashboard shows "0 fps" even on a busy WiFi channel. No error is reported -- the API calls succeed but the radio is not in true monitor mode.',
            svgDiff: '<svg viewBox="0 0 640 148" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg08-m2-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="148" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="136" fill="url(#sg08-m2-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="118" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="90" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#555" font-size="6.5">wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();</text>' +
                     '<text x="30" y="64" fill="#555" font-size="6.5">esp_wifi_init(&amp;cfg);</text>' +
                     '<text x="30" y="78" fill="#22c55e" font-size="6.5">esp_wifi_set_mode(WIFI_MODE_NULL);  // correct</text>' +
                     '<text x="30" y="92" fill="#555" font-size="6.5">esp_wifi_start();</text>' +
                     '<text x="30" y="106" fill="#ff6b35" font-size="6.5">esp_wifi_set_promiscuous(true);</text>' +
                     '<text x="161" y="120" text-anchor="middle" fill="#22c55e" font-size="7">NULL mode -- radio captures all frames on channel</text>' +
                     '<rect x="330" y="14" width="298" height="118" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="90" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#555" font-size="6.5">wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();</text>' +
                     '<text x="348" y="64" fill="#555" font-size="6.5">esp_wifi_init(&amp;cfg);</text>' +
                     '<text x="348" y="78" fill="#ef4444" font-size="6.5">esp_wifi_set_mode(WIFI_MODE_STA);   // wrong</text>' +
                     '<text x="348" y="92" fill="#555" font-size="6.5">esp_wifi_start();</text>' +
                     '<text x="348" y="106" fill="#ff6b35" font-size="6.5">esp_wifi_set_promiscuous(true);</text>' +
                     '<text x="479" y="120" text-anchor="middle" fill="#ef4444" font-size="7">STA mode filters frames -- most traffic invisible</text>' +
                     '</svg>'
        }
    ]
};

// =========================================================================
// SG-09: Raspberry Pi Network Probe
// =========================================================================
window.SignalGuides['sg-09'] = {

    intro: '<p>A Raspberry Pi on your network is a powerful reconnaissance tool. In this project you will set up a headless Pi (no monitor or keyboard), connect it to your network via Ethernet, and use it to discover every device on the LAN, map open ports, and run a Python monitoring script that watches for new devices joining or leaving.</p>' +
           '<p>Unlike the ESP32 projects that capture wireless frames, this probe operates at the IP layer. Tools like <code>nmap</code> and <code>arp-scan</code> send ARP requests and TCP probes to discover hosts, identify operating systems, and enumerate services. A Python script using the <code>scapy</code> library watches ARP traffic in real time to detect devices as they join the network.</p>' +
           '<p>This is the kind of tool that network administrators use for asset inventory and intrusion detection. By building it yourself, you understand exactly what network scanning looks like from the wire -- which is essential for both defending and auditing networks.</p>',

    wiring: null,

    wiringNotes: null,

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
        '<defs>' +
        '<pattern id="sg09-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="700" height="400" fill="url(#sg09-grid)" rx="4"/>' +
        '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">RASPBERRY PI NETWORK PROBE — DEPLOYMENT</text>' +

        '<!-- Raspberry Pi Board -->' +
        '<rect x="250" y="60" width="220" height="170" rx="10" fill="#1a1f2b" stroke="#22c55e" stroke-width="2"/>' +
        '<rect x="250" y="60" width="220" height="28" rx="10" fill="rgba(34,197,94,0.12)"/>' +
        '<rect x="250" y="80" width="220" height="8" fill="rgba(34,197,94,0.12)"/>' +
        '<text x="360" y="78" text-anchor="middle" fill="#4ade80" font-size="11" font-weight="600">Raspberry Pi 4/5</text>' +

        '<!-- CPU -->' +
        '<rect x="300" y="100" width="60" height="35" rx="4" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>' +
        '<text x="330" y="117" text-anchor="middle" fill="#4ade80" font-size="6" font-weight="600">BCM2711</text>' +
        '<text x="330" y="129" text-anchor="middle" fill="#22c55e" font-size="5">4x Cortex-A72</text>' +

        '<!-- RAM -->' +
        '<rect x="380" y="100" width="60" height="35" rx="4" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" stroke-width="0.5"/>' +
        '<text x="410" y="117" text-anchor="middle" fill="#60a5fa" font-size="6" font-weight="600">RAM</text>' +
        '<text x="410" y="129" text-anchor="middle" fill="#3b82f6" font-size="5">4/8 GB</text>' +

        '<!-- Ethernet port -->' +
        '<rect x="450" y="145" width="30" height="40" rx="3" fill="#2a2a3a" stroke="#eab308" stroke-width="1.5"/>' +
        '<text x="465" y="168" text-anchor="middle" fill="#eab308" font-size="5" font-weight="600">ETH</text>' +

        '<!-- USB ports -->' +
        '<rect x="450" y="95" width="15" height="18" rx="2" fill="#2a2a3a" stroke="#888" stroke-width="0.5"/>' +
        '<rect x="450" y="115" width="15" height="18" rx="2" fill="#2a2a3a" stroke="#888" stroke-width="0.5"/>' +
        '<text x="448" y="109" fill="#888" font-size="4" text-anchor="end">USB</text>' +

        '<!-- MicroSD slot -->' +
        '<rect x="250" y="195" width="50" height="16" rx="2" fill="#2a2a3a" stroke="#a855f7" stroke-width="1"/>' +
        '<text x="275" y="206" text-anchor="middle" fill="#a855f7" font-size="5">MicroSD</text>' +

        '<!-- USB-C power -->' +
        '<rect x="305" y="210" width="40" height="15" rx="3" fill="#2a2a3a" stroke="#ef4444" stroke-width="1"/>' +
        '<text x="325" y="220" text-anchor="middle" fill="#ef4444" font-size="5">PWR</text>' +

        '<!-- WiFi indicator -->' +
        '<rect x="370" y="145" width="60" height="20" rx="3" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" stroke-width="0.5"/>' +
        '<text x="400" y="158" text-anchor="middle" fill="#a855f7" font-size="5">WiFi (optional)</text>' +

        '<!-- GPIO header -->' +
        '<rect x="270" y="140" width="80" height="12" rx="2" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>' +
        '<text x="310" y="150" text-anchor="middle" fill="#666" font-size="5">40-pin GPIO Header</text>' +

        '<!-- Ethernet cable -->' +
        '<line x1="480" y1="165" x2="560" y2="165" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>' +
        '<text x="520" y="158" text-anchor="middle" fill="#eab308" font-size="6">CAT5e/6</text>' +

        '<!-- Router/Switch -->' +
        '<rect x="560" y="55" width="130" height="130" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
        '<rect x="560" y="55" width="130" height="24" rx="8" fill="rgba(234,179,8,0.1)"/>' +
        '<rect x="560" y="72" width="130" height="7" fill="rgba(234,179,8,0.1)"/>' +
        '<text x="625" y="72" text-anchor="middle" fill="#eab308" font-size="9" font-weight="600">Network Switch</text>' +

        '<!-- Devices on the network -->' +
        '<rect x="575" y="90" width="100" height="14" rx="2" fill="rgba(255,255,255,0.03)"/>' +
        '<text x="625" y="100" text-anchor="middle" fill="#8b949e" font-size="6">192.168.1.0/24</text>' +
        '<circle cx="585" cy="120" r="5" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="0.5"/>' +
        '<text x="600" y="123" fill="#8b949e" font-size="5">Laptop</text>' +
        '<circle cx="585" cy="138" r="5" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="0.5"/>' +
        '<text x="600" y="141" fill="#8b949e" font-size="5">Phone</text>' +
        '<circle cx="585" cy="156" r="5" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="0.5"/>' +
        '<text x="600" y="159" fill="#8b949e" font-size="5">IoT Device</text>' +
        '<circle cx="585" cy="174" r="5" fill="rgba(249,115,22,0.15)" stroke="#f97316" stroke-width="0.5"/>' +
        '<text x="600" y="177" fill="#8b949e" font-size="5">Server</text>' +

        '<!-- Power supply -->' +
        '<line x1="325" y1="225" x2="325" y2="260" stroke="#ef4444" stroke-width="2" opacity="0.6"/>' +
        '<rect x="295" y="260" width="60" height="20" rx="4" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" stroke-width="0.5"/>' +
        '<text x="325" y="273" text-anchor="middle" fill="#ef4444" font-size="6">5V 3A USB-C</text>' +

        '<!-- MicroSD detail -->' +
        '<line x1="275" y1="211" x2="275" y2="260" stroke="#a855f7" stroke-width="1" stroke-dasharray="3,2" opacity="0.4"/>' +
        '<rect x="200" y="260" width="80" height="20" rx="4" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.25)" stroke-width="0.5"/>' +
        '<text x="240" y="273" text-anchor="middle" fill="#a855f7" font-size="6">Pi OS Lite (64-bit)</text>' +

        '<!-- Tools installed -->' +
        '<rect x="40" y="60" width="170" height="170" rx="8" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<rect x="40" y="60" width="170" height="24" rx="8" fill="rgba(59,130,246,0.1)"/>' +
        '<rect x="40" y="77" width="170" height="7" fill="rgba(59,130,246,0.1)"/>' +
        '<text x="125" y="76" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="600">Network Tools</text>' +

        '<rect x="55" y="92" width="140" height="18" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>' +
        '<text x="125" y="104" text-anchor="middle" fill="#22c55e" font-size="7">nmap (port scanner)</text>' +

        '<rect x="55" y="116" width="140" height="18" rx="3" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.15)" stroke-width="0.5"/>' +
        '<text x="125" y="128" text-anchor="middle" fill="#eab308" font-size="7">arp-scan (L2 discovery)</text>' +

        '<rect x="55" y="140" width="140" height="18" rx="3" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.15)" stroke-width="0.5"/>' +
        '<text x="125" y="152" text-anchor="middle" fill="#f97316" font-size="7">scapy (ARP monitor)</text>' +

        '<rect x="55" y="164" width="140" height="18" rx="3" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.15)" stroke-width="0.5"/>' +
        '<text x="125" y="176" text-anchor="middle" fill="#a855f7" font-size="7">Python 3 (automation)</text>' +

        '<rect x="55" y="188" width="140" height="18" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
        '<text x="125" y="200" text-anchor="middle" fill="#ef4444" font-size="7">cron (scheduled scans)</text>' +

        '<!-- Arrow from tools to Pi -->' +
        '<line x1="210" y1="145" x2="246" y2="145" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
        '<polygon points="244,141 250,145 244,149" fill="#3b82f6" opacity="0.4"/>' +

        '<!-- SSH from laptop -->' +
        '<rect x="40" y="280" width="130" height="50" rx="6" fill="#1e2736" stroke="#60a5fa" stroke-width="1"/>' +
        '<text x="105" y="300" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="600">Your Laptop</text>' +
        '<text x="105" y="315" text-anchor="middle" fill="#8b949e" font-size="6">ssh pi@probe.local</text>' +
        '<line x1="170" y1="300" x2="340" y2="230" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>' +
        '<polygon points="338,226 344,232 336,234" fill="#60a5fa" opacity="0.4"/>' +

        '<!-- Bottom legend -->' +
        '<rect x="40" y="370" width="640" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
        '<text x="60" y="392" fill="#555" font-size="7" font-weight="600">SETUP:</text>' +
        '<text x="105" y="392" fill="#8b949e" font-size="7">Headless Pi on Ethernet. SSH for control. arp-scan + nmap for discovery. Python monitor for real-time alerts.</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Flash Raspberry Pi OS and Enable SSH',
            content: '<p>Download the <strong>Raspberry Pi Imager</strong> from raspberrypi.com. Flash <strong>Raspberry Pi OS Lite (64-bit)</strong> to your MicroSD card. Before ejecting, click the gear icon in the Imager to configure:</p>' +
                     '<ul>' +
                     '<li>Set hostname to <code>probe</code></li>' +
                     '<li>Enable SSH with password authentication</li>' +
                     '<li>Set username/password (e.g., <code>pi</code> / your-password)</li>' +
                     '<li>Configure WiFi if you want wireless access (but we will use Ethernet for scanning)</li>' +
                     '</ul>' +
                     '<p>Insert the SD card, connect an Ethernet cable to your router, and power on the Pi. Wait about 60 seconds for it to boot.</p>',
            language: 'Bash',
            code: '# Find the Pi on your network (from your laptop/desktop)\n# Method 1: Check your router\'s DHCP client list for "probe"\n# Method 2: Use arp-scan if you have it installed\nsudo arp-scan --localnet | grep -i raspberry\n\n# Method 3: Use nmap to find SSH servers\nnmap -sn 192.168.1.0/24 | grep -B2 "Raspberry"\n\n# Method 4: Try mDNS (works on most networks)\nping probe.local\n\n# Connect via SSH\nssh pi@probe.local\n# Or use the IP address directly:\nssh pi@192.168.1.XXX',
            tip: '<strong>Cannot find the Pi?</strong> If mDNS does not resolve, connect a monitor temporarily and run <code>ip addr</code> to see the assigned IP. Alternatively, check your router admin page for new DHCP leases.'
        },
        {
            title: 'Update and Install Network Tools',
            content: '<p>Once connected via SSH, update the system and install the scanning tools we need. <code>nmap</code> is the gold standard for network scanning. <code>arp-scan</code> discovers devices using ARP, which works even when hosts block ICMP ping. Python 3 and pip come pre-installed on Pi OS.</p>',
            language: 'Bash',
            code: '# Update the system\nsudo apt update && sudo apt upgrade -y\n\n# Install network scanning tools\nsudo apt install -y nmap arp-scan net-tools python3-pip\n\n# Install Python libraries for our monitoring script\npip3 install scapy netifaces\n\n# Verify installations\nnmap --version\narp-scan --version\npython3 -c "import scapy; print(\'Scapy\', scapy.VERSION)"',
        },
        {
            title: 'Run Network Discovery with arp-scan',
            content: '<p><code>arp-scan</code> sends ARP requests to every address in a subnet and reports devices that respond. ARP (Address Resolution Protocol) is how devices translate IP addresses to MAC addresses. Because ARP operates at Layer 2, it works even when devices have firewalls that block ping.</p>' +
                     '<p>ARP scanning is fast (scans 254 hosts in under 3 seconds) and reliable. It also reveals the device manufacturer from the MAC address OUI (Organizationally Unique Identifier).</p>',
            language: 'Bash',
            code: '# Scan the local subnet using the default interface\nsudo arp-scan --localnet\n\n# Example output:\n# Interface: eth0, type: EN10MB, MAC: dc:a6:32:xx:xx:xx\n# Starting arp-scan 1.10 with 256 hosts\n# 192.168.1.1     a0:40:a0:xx:xx:xx    Cisco Meraki\n# 192.168.1.10    dc:a6:32:xx:xx:xx    Raspberry Pi Trading\n# 192.168.1.25    f4:d4:88:xx:xx:xx    Apple, Inc.\n# 192.168.1.30    7c:2a:31:xx:xx:xx    Intel Corporate\n#\n# 4 packets received by filter, 0 packets dropped by kernel\n# Ending arp-scan 1.10: 256 hosts scanned in 2.147 seconds\n\n# Save results to a file for later analysis\nsudo arp-scan --localnet -x > ~/network_scan_$(date +%Y%m%d_%H%M%S).txt\n\n# Scan a specific range\nsudo arp-scan 192.168.1.1-192.168.1.50\n\n# Retry to catch sleeping devices (sends 3 ARP requests each)\nsudo arp-scan --localnet --retry=3',
        },
        {
            title: 'Deep Scan with nmap',
            content: '<p><code>nmap</code> goes far beyond ARP discovery. It can probe TCP/UDP ports, detect operating systems, identify running services and their versions, and run scripted vulnerability checks. Start with a host discovery scan, then run deeper scans on interesting targets.</p>' +
                     '<p><strong>Important:</strong> Only scan networks you own or have written permission to scan. Port scanning someone else\'s network without authorization may violate computer fraud laws in your jurisdiction.</p>',
            language: 'Bash',
            code: '# Host discovery: find all live hosts (fast, no port scan)\nsudo nmap -sn 192.168.1.0/24\n\n# Quick port scan of a specific host (top 1000 ports)\nsudo nmap 192.168.1.1\n\n# Service version detection on discovered hosts\nsudo nmap -sV 192.168.1.1\n\n# OS detection (requires root/sudo)\nsudo nmap -O 192.168.1.1\n\n# Comprehensive scan: OS + services + scripts + traceroute\nsudo nmap -A 192.168.1.1\n\n# Scan all hosts, all common ports, with OS and service detection\n# WARNING: This takes 5-15 minutes depending on network size\nsudo nmap -sV -O 192.168.1.0/24 -oN ~/full_scan_$(date +%Y%m%d).txt\n\n# XML output for machine parsing\nsudo nmap -sV -O 192.168.1.0/24 -oX ~/scan_results.xml\n\n# Example output snippet:\n# Nmap scan report for 192.168.1.1\n# PORT     STATE SERVICE  VERSION\n# 22/tcp   open  ssh      OpenSSH 8.9 (protocol 2.0)\n# 53/tcp   open  domain   dnsmasq 2.89\n# 80/tcp   open  http     nginx 1.22.1\n# 443/tcp  open  ssl/http nginx 1.22.1',
            tip: '<strong>nmap output formats:</strong> Use <code>-oN</code> for human-readable, <code>-oX</code> for XML (good for scripted parsing), or <code>-oG</code> for greppable output. You can use all three at once: <code>-oA scan_results</code> writes all formats with a common base filename.'
        },
        {
            title: 'Build a Python Network Monitor',
            content: '<p>Now we build a Python script that watches the network in real time. Using <code>scapy</code>, we sniff ARP packets to detect new devices joining the network. When a device sends an ARP request or reply, we log its IP address, MAC address, and timestamp. The script maintains a known-devices list and alerts on new arrivals.</p>',
            language: 'Python',
            code: '#!/usr/bin/env python3\n"""\nnetwork_monitor.py — Real-time network device monitor\nRun with: sudo python3 network_monitor.py\n"""\n\nimport time\nimport json\nimport os\nfrom datetime import datetime\nfrom scapy.all import ARP, sniff, conf\n\n# Known devices database (persists between runs)\nDB_FILE = os.path.expanduser("~/network_devices.json")\n\ndef load_db():\n    if os.path.exists(DB_FILE):\n        with open(DB_FILE) as f:\n            return json.load(f)\n    return {}\n\ndef save_db(db):\n    with open(DB_FILE, "w") as f:\n        json.dump(db, f, indent=2)\n\ndef get_vendor(mac):\n    """Look up vendor from MAC OUI (first 3 bytes)."""\n    # Small built-in lookup table of common vendors\n    oui_table = {\n        "dc:a6:32": "Raspberry Pi",\n        "b8:27:eb": "Raspberry Pi",\n        "f4:d4:88": "Apple",\n        "a4:83:e7": "Apple",\n        "7c:2a:31": "Intel",\n        "00:50:56": "VMware",\n        "a0:40:a0": "Cisco Meraki",\n        "fc:ec:da": "Ubiquiti",\n        "44:d9:e7": "Ubiquiti",\n    }\n    prefix = mac[:8].lower()\n    return oui_table.get(prefix, "Unknown")\n\ndef handle_arp(pkt):\n    """Callback for each ARP packet."""\n    if not pkt.haslayer(ARP):\n        return\n\n    arp = pkt[ARP]\n    ip = arp.psrc\n    mac = arp.hwsrc\n\n    if ip == "0.0.0.0":\n        return  # Ignore ARP probes with no source IP\n\n    now = datetime.now().isoformat()\n    vendor = get_vendor(mac)\n\n    if mac not in devices:\n        # New device detected\n        devices[mac] = {\n            "ip": ip,\n            "vendor": vendor,\n            "first_seen": now,\n            "last_seen": now,\n            "seen_count": 1\n        }\n        print(f"\\n[NEW DEVICE] {ip} ({mac}) — {vendor}\")\n        print(f\"  First seen: {now}\")\n        save_db(devices)\n    else:\n        # Known device — update last seen\n        devices[mac][\"last_seen\"] = now\n        devices[mac][\"seen_count\"] += 1\n        devices[mac][\"ip\"] = ip  # IP may change via DHCP\n        if devices[mac][\"seen_count\"] % 50 == 0:\n            save_db(devices)  # Periodic save\n\n# Load existing database\ndevices = load_db()\nprint(f\"Network Monitor started — {len(devices)} known devices loaded\")\nprint(f\"Database: {DB_FILE}\")\nprint(\"Listening for ARP traffic... (Ctrl+C to stop)\\n\")\n\n# Print current known devices\nfor mac, info in devices.items():\n    print(f\"  [{info[\'vendor\']}] {info[\'ip\']} ({mac})\")\n\nprint(\"\\n--- Monitoring ---\")\n\ntry:\n    sniff(filter=\"arp\", prn=handle_arp, store=0)\nexcept KeyboardInterrupt:\n    save_db(devices)\n    print(f\"\\nSaved {len(devices)} devices. Exiting.\")',
        },
        {
            title: 'Generate a Network Report',
            content: '<p>Create a report script that combines arp-scan results with nmap data and the monitor database into a single summary. This gives you a complete picture of your network at a glance.</p>',
            language: 'Python',
            code: '#!/usr/bin/env python3\n"""\nnetwork_report.py — Generate a network inventory report\nRun with: sudo python3 network_report.py\n"""\n\nimport subprocess\nimport json\nimport os\nfrom datetime import datetime\n\ndef run_cmd(cmd):\n    """Run a shell command and return stdout."""\n    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)\n    return result.stdout\n\ndef arp_scan():\n    """Run arp-scan and parse results."""\n    output = run_cmd("sudo arp-scan --localnet -x")\n    hosts = []\n    for line in output.strip().split("\\n"):\n        parts = line.split("\\t\")\n        if len(parts) >= 3:\n            hosts.append({\n                \"ip\": parts[0],\n                \"mac\": parts[1],\n                \"vendor\": parts[2]\n            })\n    return hosts\n\ndef nmap_quick(ip):\n    \"\"\"Quick nmap scan of a single host.\"\"\"\n    output = run_cmd(f\"sudo nmap -sV --top-ports 20 -T4 {ip}\")\n    ports = []\n    for line in output.split(\"\\n\"):\n        if \"/tcp\" in line or \"/udp\" in line:\n            ports.append(line.strip())\n    return ports\n\ndef generate_report():\n    timestamp = datetime.now().strftime(\"%Y-%m-%d %H:%M:%S\")\n    hosts = arp_scan()\n\n    report = []\n    report.append(f\"NETWORK INVENTORY REPORT\")\n    report.append(f\"Generated: {timestamp}\")\n    report.append(f\"Hosts discovered: {len(hosts)}\")\n    report.append(\"=\" * 60)\n\n    for host in hosts:\n        report.append(f\"\\nHost: {host[\'ip\']}\")\n        report.append(f\"  MAC:    {host[\'mac\']}\")\n        report.append(f\"  Vendor: {host[\'vendor\']}\")\n\n        ports = nmap_quick(host[\"ip\"])\n        if ports:\n            report.append(\"  Open Ports:\")\n            for p in ports:\n                report.append(f\"    {p}\")\n        else:\n            report.append(\"  Open Ports: none (or filtered)\")\n\n    report_text = \"\\n\".join(report)\n    report_file = os.path.expanduser(\n        f\"~/network_report_{datetime.now().strftime(\'%Y%m%d_%H%M%S\')}.txt\"\n    )\n    with open(report_file, \"w\") as f:\n        f.write(report_text)\n\n    print(report_text)\n    print(f\"\\nReport saved to: {report_file}\")\n\nif __name__ == \"__main__\":\n    generate_report()',
            tip: '<strong>Speed vs depth tradeoff:</strong> The <code>--top-ports 20</code> flag scans only the 20 most common ports per host, keeping the report fast (under 2 minutes for most home networks). For a thorough audit, increase to <code>--top-ports 1000</code> but expect 10-30 minutes.'
        },
        {
            title: 'Set Up Automated Scanning with Cron',
            content: '<p>Schedule the network monitor to run at boot and the report to generate daily. This turns the Pi into an always-on network probe that quietly watches for changes.</p>',
            language: 'Bash',
            code: '# Make scripts executable\nchmod +x ~/network_monitor.py ~/network_report.py\n\n# Start the monitor at boot using a systemd service\nsudo tee /etc/systemd/system/network-monitor.service > /dev/null << \'SERVICE\'\n[Unit]\nDescription=Network Device Monitor\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=simple\nUser=root\nExecStart=/usr/bin/python3 /home/pi/network_monitor.py\nRestart=on-failure\nRestartSec=10\n\n[Install]\nWantedBy=multi-user.target\nSERVICE\n\nsudo systemctl daemon-reload\nsudo systemctl enable network-monitor\nsudo systemctl start network-monitor\n\n# Check that it is running\nsudo systemctl status network-monitor\n\n# Schedule daily reports at 6 AM\n(crontab -l 2>/dev/null; echo "0 6 * * * sudo /usr/bin/python3 /home/pi/network_report.py") | crontab -\n\n# Verify cron entry\ncrontab -l\n\n# View monitor logs\njournalctl -u network-monitor -f',
            tip: '<strong>Remote access:</strong> You can check reports from any machine on the network via SSH: <code>ssh pi@probe.local "cat ~/network_report_*.txt | tail -100"</code>. For a nicer experience, consider setting up a simple web server with <code>python3 -m http.server 8080</code> in the reports directory.'
        }
    ],

    testing: '<p>Verify each component works:</p>' +
             '<ul>' +
             '<li><strong>SSH access</strong> -- You can connect to the Pi via <code>ssh pi@probe.local</code> or its IP address from another machine on the network.</li>' +
             '<li><strong>arp-scan finds devices</strong> -- Run <code>sudo arp-scan --localnet</code> and verify it discovers your router, laptop, phone, and any other connected devices.</li>' +
             '<li><strong>nmap port scan</strong> -- Run <code>sudo nmap -sV 192.168.1.1</code> (your router IP) and verify it detects open ports like 80 (HTTP), 443 (HTTPS), or 53 (DNS).</li>' +
             '<li><strong>Monitor detects new devices</strong> -- Start the monitor script, then connect a new device to the network (or toggle WiFi on your phone). The monitor should print a "[NEW DEVICE]" alert within 30 seconds.</li>' +
             '<li><strong>Report generates</strong> -- Run the report script and verify it produces a file in your home directory with host details and open ports.</li>' +
             '<li><strong>Cron job fires</strong> -- After setting up the cron job, verify with <code>crontab -l</code>. Check the next morning for a new report file.</li>' +
             '</ul>',

    troubleshooting: '<ul>' +
                     '<li><strong>Pi not found on the network</strong> -- Verify the Ethernet cable is connected and the LEDs on the Pi Ethernet port are blinking. Try a different cable. If using WiFi instead, check that the SSID/password were configured correctly in the Imager.</li>' +
                     '<li><strong>arp-scan shows only the Pi itself</strong> -- Some managed switches or enterprise networks block ARP broadcasts between ports. Try connecting the Pi and your test devices to the same simple switch or directly to the router.</li>' +
                     '<li><strong>nmap permission errors</strong> -- OS detection (<code>-O</code>) and SYN scans (<code>-sS</code>) require root. Always run nmap with <code>sudo</code>.</li>' +
                     '<li><strong>scapy import error</strong> -- If <code>pip3 install scapy</code> fails, try <code>sudo apt install python3-scapy</code> instead. Some Pi OS versions have scapy in the system package manager.</li>' +
                     '<li><strong>Monitor does not see ARP packets</strong> -- Ensure you run with <code>sudo</code>. Packet capture requires root privileges. Also verify the interface name with <code>ip link</code> -- it may be <code>eth0</code> or <code>enp0s3</code>.</li>' +
                     '<li><strong>Report takes too long</strong> -- The nmap scan of each host is the bottleneck. Reduce <code>--top-ports</code> from 20 to 10, or skip nmap scans for known devices.</li>' +
                     '</ul>',

    challenges: '<p><strong>Challenge 1: Network Topology Map</strong> -- Use the <code>python-nmap</code> library to parse nmap XML output and generate a simple text or HTML network diagram showing the router as a hub with connected devices as spokes. Include open port badges on each device.</p>' +
                '<p><strong>Challenge 2: Alert on Unknown Devices</strong> -- Maintain a whitelist of known MAC addresses. When the monitor detects a device not in the whitelist, send an alert (email via <code>msmtp</code>, or a push notification via a webhook to Slack/Discord).</p>' +
                '<p><strong>Challenge 3: Historical Tracking</strong> -- Log all monitor events to a SQLite database with timestamps. Build a query that shows device presence patterns over a week -- when each device typically appears and disappears. This is the foundation of network behavior analysis.</p>',

    // ======================================================================
    // SIG-2: Step visual illustrations (0-based step index)
    // ======================================================================
    stepVisuals: {
        // Step 2 — ARP request/reply flow: how arp-scan discovers devices
        2: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg09-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
           '<marker id="sg09-arr-y" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#eab308"/></marker>' +
           '<marker id="sg09-arr-g" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#22c55e"/></marker>' +
           '<marker id="sg09-arr-yl" markerWidth="7" markerHeight="5" refX="1" refY="2.5" orient="auto rotate-180"><polygon points="7 0, 0 2.5, 7 5" fill="#eab308"/></marker></defs>' +
           '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="172" fill="url(#sg09-sv2-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">ARP DISCOVERY — HOW arp-scan FINDS DEVICES</text>' +
           '<rect x="16" y="30" width="140" height="110" rx="6" fill="#1e2736" stroke="#22c55e" stroke-width="1.5"/>' +
           '<rect x="16" y="30" width="140" height="22" rx="6" fill="rgba(34,197,94,0.12)"/>' +
           '<text x="86" y="44" text-anchor="middle" fill="#4ade80" font-size="8" font-weight="700">Pi Probe</text>' +
           '<text x="86" y="58" text-anchor="middle" fill="#8b949e" font-size="6.5">eth0: 192.168.1.10</text>' +
           '<text x="86" y="72" text-anchor="middle" fill="#555" font-size="6">sudo arp-scan</text>' +
           '<text x="86" y="83" text-anchor="middle" fill="#555" font-size="6">--localnet</text>' +
           '<text x="86" y="98" text-anchor="middle" fill="#eab308" font-size="6.5" font-weight="600">Sends ARP Request</text>' +
           '<text x="86" y="110" text-anchor="middle" fill="#555" font-size="6">"Who has 192.168.1.X?"</text>' +
           '<text x="86" y="124" text-anchor="middle" fill="#555" font-size="6">to FF:FF:FF:FF:FF:FF</text>' +
           '<line x1="157" y1="85" x2="230" y2="85" stroke="#eab308" stroke-width="1.5" marker-end="url(#sg09-arr-y)"/>' +
           '<text x="193" y="79" text-anchor="middle" fill="#eab308" font-size="6">ARP REQ</text>' +
           '<text x="193" y="91" text-anchor="middle" fill="#555" font-size="5.5">broadcast</text>' +
           '<line x1="230" y1="100" x2="157" y2="100" stroke="#22c55e" stroke-width="1.5" marker-end="url(#sg09-arr-g)"/>' +
           '<text x="193" y="113" text-anchor="middle" fill="#22c55e" font-size="6">ARP REPLY</text>' +
           '<text x="193" y="124" text-anchor="middle" fill="#555" font-size="5.5">unicast</text>' +
           '<rect x="232" y="30" width="140" height="110" rx="6" fill="#1e2736" stroke="#3b82f6" stroke-width="1.5"/>' +
           '<rect x="232" y="30" width="140" height="22" rx="6" fill="rgba(59,130,246,0.12)"/>' +
           '<text x="302" y="44" text-anchor="middle" fill="#60a5fa" font-size="8" font-weight="700">Laptop</text>' +
           '<text x="302" y="58" text-anchor="middle" fill="#8b949e" font-size="6.5">192.168.1.25</text>' +
           '<text x="302" y="72" text-anchor="middle" fill="#555" font-size="6.5">f4:d4:88:xx:xx:xx</text>' +
           '<text x="302" y="90" text-anchor="middle" fill="#22c55e" font-size="6.5" font-weight="600">Responds:</text>' +
           '<text x="302" y="102" text-anchor="middle" fill="#555" font-size="6">"I am 192.168.1.25"</text>' +
           '<text x="302" y="114" text-anchor="middle" fill="#ff6b35" font-size="6">"MAC: f4:d4:88:..."</text>' +
           '<text x="302" y="126" text-anchor="middle" fill="#555" font-size="6">"OUI: Apple, Inc."</text>' +
           '<rect x="16" y="152" width="648" height="30" rx="4" fill="#0a1628" stroke="rgba(255,107,53,0.1)" stroke-width="0.5"/>' +
           '<text x="26" y="164" fill="#555" font-size="6.5" font-weight="700">WHY ARP WORKS BETTER THAN PING:</text>' +
           '<text x="26" y="177" fill="#8b949e" font-size="6.5">ARP operates at Layer 2 (Ethernet). Firewalls block ICMP ping (Layer 3) but cannot block ARP -- devices MUST reply to ARP to use the network at all.</text>' +
           '</svg>',

        // Step 3 — nmap port scan output anatomy
        3: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg09-sv3-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
           '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="172" fill="url(#sg09-sv3-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">NMAP OUTPUT ANATOMY — READING SCAN RESULTS</text>' +
           '<rect x="16" y="30" width="648" height="136" rx="4" fill="#0a0e16" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="26" y="46" fill="#ff6b35" font-size="7">$ sudo nmap -sV -O 192.168.1.1</text>' +
           '<text x="26" y="60" fill="#555" font-size="6.5">Starting Nmap 7.92 ...</text>' +
           '<rect x="20" y="64" width="644" height="18" rx="2" fill="rgba(34,197,94,0.04)"/>' +
           '<text x="26" y="75" fill="#4ade80" font-size="7" font-weight="600">Nmap scan report for 192.168.1.1 (router.local)</text>' +
           '<text x="26" y="90" fill="#eab308" font-size="6.5">Host is up (0.0012s latency).</text>' +
           '<text x="26" y="104" fill="#555" font-size="6.5" font-weight="700">PORT       STATE  SERVICE   VERSION</text>' +
           '<line x1="20" y1="108" x2="660" y2="108" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
           '<text x="26" y="120" fill="#3b82f6" font-size="6.5">22/tcp </text>' +
           '<text x="86" y="120" fill="#22c55e" font-size="6.5">open</text>' +
           '<text x="146" y="120" fill="#8b949e" font-size="6.5">ssh</text>' +
           '<text x="200" y="120" fill="#555" font-size="6.5">OpenSSH 8.4 (protocol 2.0)</text>' +
           '<rect x="22" y="112" width="30" height="12" rx="1" fill="rgba(59,130,246,0.08)"/>' +
           '<text x="26" y="133" fill="#f97316" font-size="6.5">53/tcp </text>' +
           '<text x="86" y="133" fill="#22c55e" font-size="6.5">open</text>' +
           '<text x="146" y="133" fill="#8b949e" font-size="6.5">domain</text>' +
           '<text x="200" y="133" fill="#555" font-size="6.5">dnsmasq 2.89</text>' +
           '<rect x="22" y="125" width="30" height="12" rx="1" fill="rgba(249,115,22,0.08)"/>' +
           '<text x="26" y="146" fill="#a855f7" font-size="6.5">80/tcp </text>' +
           '<text x="86" y="146" fill="#22c55e" font-size="6.5">open</text>' +
           '<text x="146" y="146" fill="#8b949e" font-size="6.5">http</text>' +
           '<text x="200" y="146" fill="#555" font-size="6.5">nginx 1.22 (admin panel)</text>' +
           '<rect x="22" y="138" width="30" height="12" rx="1" fill="rgba(168,85,247,0.08)"/>' +
           '<text x="26" y="160" fill="#eab308" font-size="6.5">OS detection: Linux 5.10 - 5.15 (99%)</text>' +
           '<text x="300" y="160" fill="#22c55e" font-size="6.5">MAC: a0:40:a0:xx:xx:xx (Cisco Meraki)</text>' +
           '</svg>',

        // Step 4 — Python scapy ARP monitor architecture
        4: '<svg viewBox="0 0 680 188" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg09-sv4-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
           '<marker id="sg09-arr-o" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#ff6b35"/></marker></defs>' +
           '<rect width="680" height="188" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="172" fill="url(#sg09-sv4-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">SCAPY ARP MONITOR — DATA FLOW</text>' +
           '<rect x="16" y="30" width="140" height="80" rx="6" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
           '<rect x="16" y="30" width="140" height="20" rx="6" fill="rgba(234,179,8,0.12)"/>' +
           '<text x="86" y="43" text-anchor="middle" fill="#fde68a" font-size="7.5" font-weight="700">Network Traffic</text>' +
           '<text x="86" y="58" text-anchor="middle" fill="#8b949e" font-size="6.5">ARP packets on eth0</text>' +
           '<text x="86" y="71" text-anchor="middle" fill="#555" font-size="6">ARP Who-has / Is-at</text>' +
           '<text x="86" y="83" text-anchor="middle" fill="#555" font-size="6">Ethernet broadcast</text>' +
           '<text x="86" y="95" text-anchor="middle" fill="#555" font-size="6">Layer 2 frame</text>' +
           '<line x1="157" y1="70" x2="195" y2="70" stroke="#ff6b35" stroke-width="1.5" marker-end="url(#sg09-arr-o)"/>' +
           '<text x="176" y="63" text-anchor="middle" fill="#555" font-size="6">sniff()</text>' +
           '<rect x="197" y="30" width="160" height="80" rx="6" fill="#1e2736" stroke="#ff6b35" stroke-width="1.5"/>' +
           '<rect x="197" y="30" width="160" height="20" rx="6" fill="rgba(255,107,53,0.12)"/>' +
           '<text x="277" y="43" text-anchor="middle" fill="#ff6b35" font-size="7.5" font-weight="700">handle_arp()</text>' +
           '<text x="277" y="58" text-anchor="middle" fill="#8b949e" font-size="6.5">Extracts ip + mac</text>' +
           '<text x="277" y="71" text-anchor="middle" fill="#555" font-size="6">Checks MAC in db</text>' +
           '<text x="277" y="83" text-anchor="middle" fill="#555" font-size="6">New? = alert + save</text>' +
           '<text x="277" y="95" text-anchor="middle" fill="#555" font-size="6">Known? = update ts</text>' +
           '<line x1="358" y1="70" x2="396" y2="70" stroke="#ff6b35" stroke-width="1.5" marker-end="url(#sg09-arr-o)"/>' +
           '<rect x="398" y="30" width="168" height="80" rx="6" fill="#1e2736" stroke="#a855f7" stroke-width="1.5"/>' +
           '<rect x="398" y="30" width="168" height="20" rx="6" fill="rgba(168,85,247,0.12)"/>' +
           '<text x="482" y="43" text-anchor="middle" fill="#c084fc" font-size="7.5" font-weight="700">JSON Database</text>' +
           '<text x="482" y="58" text-anchor="middle" fill="#8b949e" font-size="6.5">~/network_devices.json</text>' +
           '<text x="482" y="71" text-anchor="middle" fill="#555" font-size="6">MAC: { ip, vendor,</text>' +
           '<text x="482" y="83" text-anchor="middle" fill="#555" font-size="6">first_seen, last_seen,</text>' +
           '<text x="482" y="95" text-anchor="middle" fill="#555" font-size="6">seen_count }</text>' +
           '<rect x="16" y="122" width="648" height="50" rx="4" fill="#0a1628" stroke="rgba(255,107,53,0.1)" stroke-width="0.5"/>' +
           '<text x="26" y="136" fill="#555" font-size="6.5" font-weight="700">ARP PACKET FIELDS EXTRACTED BY SCAPY (pkt[ARP]):</text>' +
           '<text x="26" y="150" fill="#ff6b35" font-size="6.5">pkt[ARP].psrc</text><text x="112" y="150" fill="#666" font-size="6.5">= source IP address ("192.168.1.25")</text>' +
           '<text x="26" y="163" fill="#ff6b35" font-size="6.5">pkt[ARP].hwsrc</text><text x="118" y="163" fill="#666" font-size="6.5">= source MAC address ("f4:d4:88:xx:xx:xx") -- used as unique device key in db</text>' +
           '</svg>'
    },

    // ======================================================================
    // SIG-3: Component callouts -- Raspberry Pi network probe setup
    // ======================================================================
    componentCallouts: {
        svg: '<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;max-width:440px;width:100%;height:auto">' +
             '<defs><pattern id="sg09-cc-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.7" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
             '<rect width="440" height="280" fill="#0d1117" rx="6"/>' +
             '<rect x="6" y="6" width="428" height="268" fill="url(#sg09-cc-grid)" rx="3"/>' +
             '<text x="220" y="20" text-anchor="middle" fill="#444" font-size="7" font-weight="700" letter-spacing="0.15em">NETWORK PROBE STACK — INTERACTIVE</text>' +
             '<text x="220" y="30" text-anchor="middle" fill="#333" font-size="6">Hover component list items to highlight</text>' +
             '<rect x="20" y="38" width="400" height="200" rx="6" fill="#0f1923" stroke="rgba(34,197,94,0.15)" stroke-width="1"/>' +
             '<g data-callout="pi-hw">' +
             '<rect x="30" y="50" width="120" height="60" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="48" width="124" height="64" rx="5" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="90" y="72" text-anchor="middle" fill="#4ade80" font-size="7.5" font-weight="700">Raspberry Pi</text>' +
             '<text x="90" y="85" text-anchor="middle" fill="#8b949e" font-size="6">BCM2711 4x Cortex-A72</text>' +
             '<text x="90" y="97" text-anchor="middle" fill="#666" font-size="5.5">GbE + WiFi on board</text>' +
             '</g>' +
             '<g data-callout="arp-scan">' +
             '<rect x="164" y="50" width="120" height="60" rx="4" fill="#1e2736" stroke="#eab308" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="162" y="48" width="124" height="64" rx="5" fill="none" stroke="#eab308" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="224" y="72" text-anchor="middle" fill="#fde68a" font-size="7.5" font-weight="700">arp-scan</text>' +
             '<text x="224" y="85" text-anchor="middle" fill="#8b949e" font-size="6">Layer 2 discovery</text>' +
             '<text x="224" y="97" text-anchor="middle" fill="#666" font-size="5.5">OUI vendor lookup</text>' +
             '</g>' +
             '<g data-callout="nmap">' +
             '<rect x="298" y="50" width="110" height="60" rx="4" fill="#1e2736" stroke="#22c55e" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="296" y="48" width="114" height="64" rx="5" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="353" y="72" text-anchor="middle" fill="#4ade80" font-size="7.5" font-weight="700">nmap</text>' +
             '<text x="353" y="85" text-anchor="middle" fill="#8b949e" font-size="6">Port + OS detect</text>' +
             '<text x="353" y="97" text-anchor="middle" fill="#666" font-size="5.5">Service versions</text>' +
             '</g>' +
             '<g data-callout="scapy">' +
             '<rect x="30" y="128" width="120" height="60" rx="4" fill="#1e2736" stroke="#f97316" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="126" width="124" height="64" rx="5" fill="none" stroke="#f97316" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="90" y="152" text-anchor="middle" fill="#fb923c" font-size="7.5" font-weight="700">scapy</text>' +
             '<text x="90" y="165" text-anchor="middle" fill="#8b949e" font-size="6">ARP packet sniffer</text>' +
             '<text x="90" y="177" text-anchor="middle" fill="#666" font-size="5.5">Real-time new device alert</text>' +
             '</g>' +
             '<g data-callout="cron">' +
             '<rect x="164" y="128" width="120" height="60" rx="4" fill="#1e2736" stroke="#a855f7" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="162" y="126" width="124" height="64" rx="5" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="224" y="152" text-anchor="middle" fill="#c084fc" font-size="7.5" font-weight="700">cron / systemd</text>' +
             '<text x="224" y="165" text-anchor="middle" fill="#8b949e" font-size="6">Scheduled scanning</text>' +
             '<text x="224" y="177" text-anchor="middle" fill="#666" font-size="5.5">Daily reports at 06:00</text>' +
             '</g>' +
             '<g data-callout="ssh">' +
             '<rect x="298" y="128" width="110" height="60" rx="4" fill="#1e2736" stroke="#3b82f6" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="296" y="126" width="114" height="64" rx="5" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="353" y="152" text-anchor="middle" fill="#60a5fa" font-size="7.5" font-weight="700">SSH</text>' +
             '<text x="353" y="165" text-anchor="middle" fill="#8b949e" font-size="6">Remote access</text>' +
             '<text x="353" y="177" text-anchor="middle" fill="#666" font-size="5.5">pi@probe.local</text>' +
             '</g>' +
             '</svg>',

        components: [
            {
                id: 'pi-hw',
                name: 'A — Raspberry Pi 4/5 (Headless)',
                purpose: 'The probe platform. Running Pi OS Lite (no desktop) for minimal resource usage. Connected via Ethernet for reliable wired scanning. The BCM2711 4-core CPU handles nmap scans, Python scripts, and background services simultaneously without breaking a sweat.',
                specs: ['BCM2711 4x Cortex-A72', '4-8 GB RAM', 'GbE + WiFi', 'Pi OS Lite 64-bit', 'Headless via SSH']
            },
            {
                id: 'arp-scan',
                name: 'B — arp-scan (Layer 2 Discovery)',
                purpose: 'Sends ARP requests to every address in the subnet and collects replies. Faster and more reliable than ping because ARP is mandatory for network operation -- devices that block ICMP must still respond to ARP. Also resolves MAC addresses to manufacturer names via OUI lookup from its built-in database.',
                specs: ['sudo required', 'Scans 254 hosts in ~2s', 'OUI vendor lookup', '--retry=3 for stragglers', '-x for parseable output']
            },
            {
                id: 'nmap',
                name: 'C — nmap (Port and Service Scanner)',
                purpose: 'The gold standard for network reconnaissance. Goes beyond host discovery to probe TCP/UDP ports, identify running services and versions (-sV), detect operating systems (-O), and run scripted checks. Each scan depth level costs more time -- --top-ports 20 takes seconds per host, -A takes minutes.',
                specs: ['-sn host discovery', '-sV service versions', '-O OS detection', '-oX XML output', 'sudo for raw sockets']
            },
            {
                id: 'scapy',
                name: 'D — scapy (Real-time ARP Monitor)',
                purpose: 'A Python packet manipulation library that can capture, craft, and send any network packet. Used here with sniff(filter="arp") to watch for ARP traffic in real time. When a device sends its first ARP request (which happens when it joins the network), the callback fires and we log the new device.',
                specs: ['Python 3 library', 'sudo required', 'sniff() captures L2', 'pkt[ARP].psrc = IP', 'pkt[ARP].hwsrc = MAC']
            },
            {
                id: 'cron',
                name: 'E — cron + systemd (Automation)',
                purpose: 'The ARP monitor runs as a systemd service starting at boot (always-on). Daily reports are scheduled via cron at 06:00. This combination means the Pi works autonomously -- it monitors 24/7 without any manual intervention and generates fresh inventory reports every morning.',
                specs: ['systemd service', 'Restart on failure', 'cron daily at 06:00', 'journalctl for logs', 'Boot-persistent']
            },
            {
                id: 'ssh',
                name: 'F — SSH (Remote Access)',
                purpose: 'The primary interface to the headless Pi. Connect from any machine on the network with ssh pi@probe.local (mDNS) or ssh pi@192.168.1.X (IP). All administration, log viewing, and report retrieval happen over this encrypted connection. No monitor or keyboard ever needed.',
                specs: ['OpenSSH server', 'mDNS: probe.local', 'Port 22 TCP', 'Password or key auth', 'Enabled in Imager']
            }
        ]
    },

    // ======================================================================
    // SIG-4: Common mistakes for SG-09
    // ======================================================================
    commonMistakes: [
        {
            title: 'Running nmap or arp-scan without sudo -- permission denied on raw socket operations',
            correct: 'Always prefix network scanning commands with sudo. Raw socket access (required for SYN scans, OS detection, and ARP scanning) needs root privileges on Linux. Add yourself to sudoers or run as root for automated scripts.',
            incorrect: 'Running nmap 192.168.1.0/24 without sudo. Regular users can do a TCP connect scan (-sT) but not SYN scans (-sS), OS detection (-O), or raw packet operations. arp-scan always requires sudo.',
            consequence: 'arp-scan fails immediately with "Operation not permitted". nmap falls back to -sT (connect scan) which is slower and detectable. OS detection is silently skipped. Results are incomplete and the scan takes longer.',
            svgDiff: '<svg viewBox="0 0 640 142" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg09-m1-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="142" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="130" fill="url(#sg09-m1-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="112" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="82" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#22c55e" font-size="6.5">sudo arp-scan --localnet</text>' +
                     '<text x="30" y="64" fill="#22c55e" font-size="6.5">sudo nmap -sV -O 192.168.1.1</text>' +
                     '<text x="30" y="78" fill="#22c55e" font-size="6.5">sudo nmap -sS 192.168.1.0/24</text>' +
                     '<text x="30" y="92" fill="#555" font-size="5.5">// Raw sockets, SYN scan, OS detect</text>' +
                     '<text x="30" y="106" fill="#555" font-size="5.5">// All require root privileges</text>' +
                     '<text x="161" y="122" text-anchor="middle" fill="#22c55e" font-size="7">sudo gives raw socket access -- full results</text>' +
                     '<rect x="330" y="14" width="298" height="112" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="82" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#ef4444" font-size="6.5">arp-scan --localnet</text>' +
                     '<text x="348" y="64" fill="#ef4444" font-size="6.5">nmap -sV -O 192.168.1.1</text>' +
                     '<text x="348" y="78" fill="#ef4444" font-size="6.5">nmap -sS 192.168.1.0/24</text>' +
                     '<text x="348" y="92" fill="#555" font-size="5.5">// "Operation not permitted"</text>' +
                     '<text x="348" y="106" fill="#555" font-size="5.5">// OS detect silently skipped</text>' +
                     '<text x="479" y="122" text-anchor="middle" fill="#ef4444" font-size="7">No raw socket access -- incomplete or failed results</text>' +
                     '</svg>'
        },
        {
            title: 'scapy sniff() missing sudo -- ARP monitor sees no packets at all',
            correct: 'Run the Python monitor with sudo: "sudo python3 network_monitor.py". Packet capture (libpcap) requires root on Linux. Alternatively, grant the Python interpreter cap_net_raw capability with setcap, but sudo is simpler for this use case.',
            incorrect: 'Running "python3 network_monitor.py" as a normal user. The sniff() call does not raise an exception -- it simply captures no packets, which makes it look like no ARP traffic exists on the network.',
            consequence: 'The monitor script starts and prints "Listening for ARP traffic..." but the callback never fires. No new devices are ever detected. No error is shown. The script appears to work correctly but is silently doing nothing.',
            svgDiff: '<svg viewBox="0 0 640 142" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg09-m2-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="142" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="130" fill="url(#sg09-m2-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="112" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="82" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#22c55e" font-size="6.5">sudo python3 network_monitor.py</text>' +
                     '<text x="30" y="64" fill="#555" font-size="6.5">Network Monitor started -- 4 known devices</text>' +
                     '<text x="30" y="78" fill="#555" font-size="6.5">Listening for ARP traffic...</text>' +
                     '<text x="30" y="92" fill="#22c55e" font-size="6.5">[NEW DEVICE] 192.168.1.45 (Samsung)</text>' +
                     '<text x="30" y="106" fill="#22c55e" font-size="6.5">  First seen: 2026-03-18T09:22:41</text>' +
                     '<text x="161" y="122" text-anchor="middle" fill="#22c55e" font-size="7">sudo enables packet capture -- devices detected</text>' +
                     '<rect x="330" y="14" width="298" height="112" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="82" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#ef4444" font-size="6.5">python3 network_monitor.py</text>' +
                     '<text x="348" y="64" fill="#555" font-size="6.5">Network Monitor started -- 4 known devices</text>' +
                     '<text x="348" y="78" fill="#555" font-size="6.5">Listening for ARP traffic...</text>' +
                     '<text x="348" y="92" fill="#ef4444" font-size="6.5">// Nothing ever prints here</text>' +
                     '<text x="348" y="106" fill="#ef4444" font-size="6.5">// No error -- silently captures nothing</text>' +
                     '<text x="479" y="122" text-anchor="middle" fill="#ef4444" font-size="7">No root access -- sniff() captures zero packets</text>' +
                     '</svg>'
        }
    ]
};

// =========================================================================
// SG-10: Deauth Attack Detector (ESP32 DevKit)
// =========================================================================
window.SignalGuides['sg-10'] = {

    intro: '<p>A deauthentication attack exploits the fact that 802.11 management frames are unencrypted and unauthenticated in WPA2 (this is fixed in WPA3 with Protected Management Frames). An attacker sends forged deauthentication frames with the access point\'s MAC address as the source, causing connected clients to disconnect. This is used for denial-of-service, forcing clients to reconnect through a rogue AP (evil twin), or capturing the WPA handshake for offline cracking.</p>' +
           '<p>In this project you will build a detector that monitors WiFi traffic in promiscuous mode, identifies deauthentication frames (management type 0, subtype 0x0C), tracks the source MACs, and triggers visual and audio alerts. An LED flashes and a piezo buzzer sounds when deauth frames are detected, giving you an immediate physical warning of an attack in progress.</p>' +
           '<p>This builds on the promiscuous mode concepts from SG-08 (Packet Traffic Dashboard) but focuses specifically on threat detection rather than general traffic analysis. The detector scans all channels to catch attacks regardless of which channel they target.</p>',

    wiring: '  ESP32 DevKit V1\n' +
            '  +-------------------+\n' +
            '  |                   |\n' +
            '  |  GPIO2 ---[220R]---+--- LED (+)\n' +
            '  |                    |    LED (-) --- GND\n' +
            '  |                   |\n' +
            '  |  GPIO4 -----------+--- Buzzer (+)\n' +
            '  |                    |    Buzzer (-) --- GND\n' +
            '  |                   |\n' +
            '  |  GND  ----------- GND bus\n' +
            '  |                   |\n' +
            '  |  USB  --- power    |\n' +
            '  +-------------------+\n' +
            '\n' +
            '  Component Wiring:\n' +
            '  ==================\n' +
            '  LED:    GPIO2 --> 220 ohm resistor --> LED anode\n' +
            '          LED cathode --> GND\n' +
            '\n' +
            '  Buzzer: GPIO4 --> Buzzer positive (+)\n' +
            '          Buzzer negative (-) --> GND\n' +
            '\n' +
            '  (Use an active buzzer — it has a\n' +
            '   built-in oscillator and just needs\n' +
            '   a HIGH signal to sound.)',

    wiringNotes: '<p>Two components on a breadboard:</p>' +
                 '<ul>' +
                 '<li><strong>LED</strong> on <strong>GPIO 2</strong> through a 220 ohm current-limiting resistor. GPIO 2 is also the built-in LED on most ESP32 DevKit boards, so you get both the external and on-board LED.</li>' +
                 '<li><strong>Piezo buzzer</strong> on <strong>GPIO 4</strong>. Use an <strong>active buzzer</strong> (has built-in oscillator). If using a passive buzzer, you will need to generate a tone with <code>tone()</code> or PWM.</li>' +
                 '</ul>' +
                 '<p>Both components share the GND bus on the breadboard. The ESP32 DevKit provides multiple GND pins on both sides of the board.</p>' +
                 '<p><strong>Safety:</strong> Disconnect the USB cable before wiring the LED and buzzer. A misplaced wire on a powered ESP32 can damage GPIO pins. Wire first, verify connections, then reconnect.</p>',

    wiringSvg: '<div class="svg-build-wrap">' +
        '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace">' +
        '<defs>' +
        '<pattern id="sg10-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)"/></pattern>' +
        '</defs>' +
        '<rect width="720" height="420" fill="#0d1117" rx="8"/>' +
        '<rect x="10" y="10" width="700" height="400" fill="url(#sg10-grid)" rx="4"/>' +
        '<text x="360" y="35" text-anchor="middle" fill="#555" font-size="10" letter-spacing="0.15em">DEAUTH DETECTOR — BREADBOARD WIRING</text>' +

        '<!-- Breadboard base -->' +
        '<rect x="60" y="55" width="600" height="280" rx="6" fill="#1a1f2b" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>' +
        '<text x="360" y="48" text-anchor="middle" fill="#444" font-size="8">BREADBOARD</text>' +

        '<!-- ESP32 DevKit -->' +
        '<rect x="100" y="85" width="180" height="220" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="1.5"/>' +
        '<rect x="100" y="85" width="180" height="26" rx="8" fill="rgba(239,68,68,0.12)"/>' +
        '<rect x="100" y="103" width="180" height="8" fill="rgba(239,68,68,0.12)"/>' +
        '<text x="190" y="102" text-anchor="middle" fill="#f87171" font-size="10" font-weight="600">ESP32 DevKit V1</text>' +

        '<!-- USB connector -->' +
        '<rect x="165" y="72" width="50" height="18" rx="4" fill="#2a2a3a" stroke="#888" stroke-width="1"/>' +
        '<text x="190" y="84" text-anchor="middle" fill="#999" font-size="7">USB</text>' +

        '<!-- ESP32 module -->' +
        '<rect x="130" y="120" width="120" height="50" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>' +
        '<text x="190" y="140" text-anchor="middle" fill="#f87171" font-size="7" font-weight="600">ESP32-WROOM-32</text>' +
        '<text x="190" y="155" text-anchor="middle" fill="#ef4444" font-size="6">Promiscuous Mode</text>' +
        '<text x="190" y="165" text-anchor="middle" fill="#ef4444" font-size="5">Ch 1-13 Scanning</text>' +

        '<!-- Pin labels on ESP32 -->' +
        '<!-- Left side -->' +
        '<circle cx="112" cy="195" r="4" fill="#eab308" stroke="#fde68a" stroke-width="0.5"/>' +
        '<text x="128" y="198" fill="#e6edf3" font-size="8">GPIO2</text>' +
        '<circle cx="112" cy="225" r="4" fill="#22c55e" stroke="#86efac" stroke-width="0.5"/>' +
        '<text x="128" y="228" fill="#e6edf3" font-size="8">GPIO4</text>' +
        '<circle cx="112" cy="255" r="4" fill="#333" stroke="#888" stroke-width="0.5"/>' +
        '<text x="128" y="258" fill="#e6edf3" font-size="8">GND</text>' +
        '<circle cx="112" cy="280" r="4" fill="#ef4444" stroke="#fca5a5" stroke-width="0.5"/>' +
        '<text x="128" y="283" fill="#e6edf3" font-size="8">3V3</text>' +

        '<!-- Right side pins -->' +
        '<circle cx="268" cy="195" r="3" fill="#8b949e"/><text x="252" y="198" fill="#8b949e" font-size="7" text-anchor="end">D23</text>' +
        '<circle cx="268" cy="215" r="3" fill="#8b949e"/><text x="252" y="218" fill="#8b949e" font-size="7" text-anchor="end">D22</text>' +
        '<circle cx="268" cy="235" r="3" fill="#8b949e"/><text x="252" y="238" fill="#8b949e" font-size="7" text-anchor="end">D21</text>' +
        '<circle cx="268" cy="255" r="3" fill="#ef4444"/><text x="252" y="258" fill="#8b949e" font-size="7" text-anchor="end">3V3</text>' +
        '<circle cx="268" cy="280" r="3" fill="#333" stroke="#888" stroke-width="0.5"/><text x="252" y="283" fill="#8b949e" font-size="7" text-anchor="end">GND</text>' +

        '<!-- Wire from GPIO2 to resistor -->' +
        '<line x1="112" y1="195" x2="112" y2="195" stroke="#eab308" stroke-width="0"/>' +
        '<path d="M112,195 L90,195 L90,195 L370,195" stroke="#eab308" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +

        '<!-- 220 ohm Resistor -->' +
        '<rect x="370" y="186" width="60" height="18" rx="3" fill="#2a2a3a" stroke="#eab308" stroke-width="1"/>' +
        '<text x="400" y="198" text-anchor="middle" fill="#fde68a" font-size="7" font-weight="600">220R</text>' +
        '<!-- Color bands -->' +
        '<rect x="380" y="189" width="4" height="12" rx="1" fill="#ef4444"/>' +
        '<rect x="388" y="189" width="4" height="12" rx="1" fill="#ef4444"/>' +
        '<rect x="396" y="189" width="4" height="12" rx="1" fill="#8b4513"/>' +
        '<rect x="404" y="189" width="4" height="12" rx="1" fill="#d4a574"/>' +

        '<!-- Wire from resistor to LED -->' +
        '<line x1="430" y1="195" x2="470" y2="195" stroke="#eab308" stroke-width="2.5" stroke-linecap="round"/>' +

        '<!-- LED -->' +
        '<g>' +
        '<polygon points="470,180 510,195 470,210" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1.5"/>' +
        '<line x1="510" y1="180" x2="510" y2="210" stroke="#ef4444" stroke-width="1.5"/>' +
        '<text x="490" y="228" text-anchor="middle" fill="#f87171" font-size="8" font-weight="600">LED</text>' +
        '<text x="490" y="240" text-anchor="middle" fill="#ef4444" font-size="6">(Alert)</text>' +
        '</g>' +

        '<!-- LED cathode to GND -->' +
        '<line x1="510" y1="195" x2="560" y2="195" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="560" y1="195" x2="560" y2="310" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>' +

        '<!-- Wire from GPIO4 to Buzzer -->' +
        '<path d="M112,225 L80,225 L80,280 L370,280" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +

        '<!-- Buzzer -->' +
        '<circle cx="420" cy="280" r="25" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1.5"/>' +
        '<circle cx="420" cy="280" r="15" fill="rgba(34,197,94,0.05)" stroke="#22c55e" stroke-width="0.5"/>' +
        '<text x="420" y="275" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="600">BUZZER</text>' +
        '<text x="420" y="287" text-anchor="middle" fill="#22c55e" font-size="5">(Active)</text>' +
        '<text x="390" y="275" text-anchor="middle" fill="#4ade80" font-size="6">+</text>' +

        '<!-- Buzzer GND -->' +
        '<line x1="445" y1="280" x2="560" y2="280" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>' +

        '<!-- GND bus line -->' +
        '<line x1="112" y1="255" x2="75" y2="255" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="75" y1="255" x2="75" y2="310" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="75" y1="310" x2="560" y2="310" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>' +
        '<rect x="570" y="302" width="60" height="18" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>' +
        '<text x="600" y="314" text-anchor="middle" fill="#888" font-size="7" font-weight="600">GND BUS</text>' +

        '<!-- WiFi attack waves -->' +
        '<g opacity="0.5">' +
        '<path d="M560,100 Q580,110 560,120" stroke="#ef4444" stroke-width="1.5" fill="none"/>' +
        '<path d="M570,90 Q600,110 570,130" stroke="#ef4444" stroke-width="1.2" fill="none"/>' +
        '<path d="M580,80 Q620,110 580,140" stroke="#ef4444" stroke-width="0.8" fill="none"/>' +
        '<text x="610" y="114" fill="#ef4444" font-size="7" font-weight="600">Deauth</text>' +
        '<text x="610" y="126" fill="#ef4444" font-size="7" font-weight="600">Frames</text>' +
        '</g>' +

        '<!-- Wire color legend -->' +
        '<rect x="40" y="355" width="640" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
        '<text x="60" y="373" fill="#555" font-size="7" font-weight="600" letter-spacing="0.1em">WIRING KEY</text>' +
        '<circle cx="65" cy="390" r="4" fill="#eab308"/><text x="80" y="393" fill="#fde68a" font-size="7">GPIO2 to LED (via 220R)</text>' +
        '<circle cx="220" cy="390" r="4" fill="#22c55e"/><text x="235" y="393" fill="#86efac" font-size="7">GPIO4 to Buzzer (+)</text>' +
        '<circle cx="375" cy="390" r="4" fill="#555"/><text x="390" y="393" fill="#aaa" font-size="7">GND bus (shared)</text>' +
        '<circle cx="510" cy="390" r="4" fill="#ef4444"/><text x="525" y="393" fill="#fca5a5" font-size="7">3V3 (not used externally)</text>' +

        '</svg>' +
        '</div>',

    steps: [
        {
            title: 'Understand Deauth Frames',
            content: '<p>A deauthentication frame is an 802.11 management frame (type 0) with subtype 12 (0x0C). In the Frame Control field, this appears as bits: <code>type=00, subtype=1100</code>. The frame body contains a 2-byte reason code and the standard MAC header has source, destination, and BSSID fields.</p>' +
                     '<p>Legitimate deauth frames are sent when a client disconnects or when an AP removes a client. A deauth attack is characterized by a <strong>burst of deauth frames</strong> -- dozens or hundreds in rapid succession, often targeting broadcast (FF:FF:FF:FF:FF:FF) to disconnect all clients simultaneously. Our detector distinguishes attacks from normal disconnections by counting deauth frames per second.</p>',
            language: 'C++',
            code: '#include <WiFi.h>\n#include "esp_wifi.h"\n\n// Alert hardware pins\n#define LED_PIN    2\n#define BUZZER_PIN 4\n\n// Deauth frame identification\n// Frame Control: type=0 (mgmt), subtype=12 (deauth)\n// In the raw frame, this appears as subtype in bits [7:4]\n#define DEAUTH_FRAME_SUBTYPE 0x0C\n#define DISASSOC_FRAME_SUBTYPE 0x0A  // Also worth detecting\n\n// Detection thresholds\n#define DEAUTH_ALERT_THRESHOLD 3   // Deauths within window = attack\n#define DETECTION_WINDOW_MS  2000  // 2-second sliding window\n\n// Attack tracking\nstruct DeauthEvent {\n    uint8_t srcMac[6];\n    uint8_t dstMac[6];\n    uint8_t bssid[6];\n    int8_t rssi;\n    uint8_t channel;\n    uint16_t reason;\n    unsigned long timestamp;\n};\n\n#define EVENT_LOG_SIZE 64\nDeauthEvent eventLog[EVENT_LOG_SIZE];\nvolatile int eventLogIndex = 0;\n\nvolatile uint32_t deauthTotal = 0;\nvolatile uint32_t deauthInWindow = 0;\nvolatile bool attackDetected = false;\nunsigned long windowStart = 0;',
        },
        {
            title: 'Set Up Promiscuous Mode with Deauth Filtering',
            content: '<p>We use the same promiscuous mode API as SG-08, but our callback focuses specifically on management frames. For every frame received, we check if it is a deauthentication or disassociation frame. If so, we extract the source MAC, destination MAC, BSSID, reason code, and RSSI, then log the event.</p>',
            language: 'C++',
            code: '// 802.11 MAC header structure\ntypedef struct {\n    uint16_t frame_ctrl;\n    uint16_t duration;\n    uint8_t addr1[6];  // Destination\n    uint8_t addr2[6];  // Source\n    uint8_t addr3[6];  // BSSID\n    uint16_t seq_ctrl;\n} __attribute__((packed)) mac_header_t;\n\nvoid IRAM_ATTR snifferCallback(void* buf, wifi_promiscuous_pkt_type_t type) {\n    if (type != WIFI_PKT_MGMT) return;  // Only management frames\n\n    const wifi_promiscuous_pkt_t* pkt = (wifi_promiscuous_pkt_t*)buf;\n    const mac_header_t* hdr = (mac_header_t*)pkt->payload;\n\n    uint16_t frameCtrl = hdr->frame_ctrl;\n    uint8_t frameSubtype = (frameCtrl >> 4) & 0x0F;\n\n    // Check for deauth (subtype 12) or disassoc (subtype 10)\n    if (frameSubtype != DEAUTH_FRAME_SUBTYPE &&\n        frameSubtype != DISASSOC_FRAME_SUBTYPE) {\n        return;\n    }\n\n    deauthTotal++;\n    deauthInWindow++;\n\n    // Log the event\n    int idx = eventLogIndex % EVENT_LOG_SIZE;\n    memcpy(eventLog[idx].srcMac, hdr->addr2, 6);\n    memcpy(eventLog[idx].dstMac, hdr->addr1, 6);\n    memcpy(eventLog[idx].bssid, hdr->addr3, 6);\n    eventLog[idx].rssi = pkt->rx_ctrl.rssi;\n    eventLog[idx].channel = pkt->rx_ctrl.channel;\n    eventLog[idx].timestamp = millis();\n\n    // Extract reason code (2 bytes after the MAC header)\n    const uint8_t* body = pkt->payload + sizeof(mac_header_t);\n    eventLog[idx].reason = body[0] | (body[1] << 8);\n\n    eventLogIndex++;\n\n    // Check if we have crossed the alert threshold\n    if (deauthInWindow >= DEAUTH_ALERT_THRESHOLD) {\n        attackDetected = true;\n    }\n}\n\nvoid initSniffer() {\n    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();\n    esp_wifi_init(&cfg);\n    esp_wifi_set_storage(WIFI_STORAGE_RAM);\n    esp_wifi_set_mode(WIFI_MODE_NULL);\n    esp_wifi_start();\n\n    // Only capture management frames for efficiency\n    wifi_promiscuous_filter_t filter = {\n        .filter_mask = WIFI_PROMIS_FILTER_MASK_MGMT\n    };\n    esp_wifi_set_promiscuous_filter(&filter);\n    esp_wifi_set_promiscuous_rx_cb(&snifferCallback);\n    esp_wifi_set_promiscuous(true);\n    esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);\n}',
            tip: '<strong>Why filter to management frames only?</strong> Setting <code>WIFI_PROMIS_FILTER_MASK_MGMT</code> tells the WiFi hardware to discard control and data frames before they reach our callback. This reduces CPU load dramatically -- on a busy channel, data/control frames can outnumber management frames 10:1. Since we only care about deauth frames, filtering early is much more efficient.'
        },
        {
            title: 'Wire and Control the Alert Hardware',
            content: '<p>The LED and buzzer provide immediate physical alerts. We use three alert levels: idle (LED off, buzzer silent), warning (LED blinks slowly, no buzzer), and attack (LED blinks fast, buzzer sounds). The alert state is managed in the main loop based on the sliding window counter.</p>',
            language: 'C++',
            code: 'enum AlertLevel { ALERT_IDLE, ALERT_WARNING, ALERT_ATTACK };\nAlertLevel currentAlert = ALERT_IDLE;\nunsigned long lastBlink = 0;\nbool ledState = false;\n\nvoid setupAlertHardware() {\n    pinMode(LED_PIN, OUTPUT);\n    pinMode(BUZZER_PIN, OUTPUT);\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n}\n\nvoid updateAlerts() {\n    unsigned long now = millis();\n\n    // Reset sliding window counter every DETECTION_WINDOW_MS\n    if (now - windowStart > DETECTION_WINDOW_MS) {\n        if (deauthInWindow < DEAUTH_ALERT_THRESHOLD) {\n            attackDetected = false;\n        }\n        deauthInWindow = 0;\n        windowStart = now;\n    }\n\n    // Determine alert level\n    if (attackDetected) {\n        currentAlert = ALERT_ATTACK;\n    } else if (deauthTotal > 0) {\n        currentAlert = ALERT_WARNING;\n    } else {\n        currentAlert = ALERT_IDLE;\n    }\n\n    // Drive hardware based on alert level\n    switch (currentAlert) {\n        case ALERT_IDLE:\n            digitalWrite(LED_PIN, LOW);\n            digitalWrite(BUZZER_PIN, LOW);\n            break;\n\n        case ALERT_WARNING:\n            // Slow blink — 1 Hz\n            if (now - lastBlink > 500) {\n                ledState = !ledState;\n                digitalWrite(LED_PIN, ledState);\n                lastBlink = now;\n            }\n            digitalWrite(BUZZER_PIN, LOW);\n            break;\n\n        case ALERT_ATTACK:\n            // Fast blink — 5 Hz + buzzer\n            if (now - lastBlink > 100) {\n                ledState = !ledState;\n                digitalWrite(LED_PIN, ledState);\n                digitalWrite(BUZZER_PIN, ledState);  // Buzzer follows LED\n                lastBlink = now;\n            }\n            break;\n    }\n}',
        },
        {
            title: 'Track Attacker Source MACs',
            content: '<p>A deauth attack usually comes from a single source (the attacker\'s device). By tracking which MAC addresses are sending deauth frames, we can identify the attacker. We maintain a table of source MACs with their deauth frame counts and first/last seen timestamps.</p>',
            language: 'C++',
            code: 'struct AttackerInfo {\n    uint8_t mac[6];\n    uint32_t deauthCount;\n    unsigned long firstSeen;\n    unsigned long lastSeen;\n    int8_t lastRssi;\n    bool active;  // Seen in current window\n};\n\n#define MAX_ATTACKERS 16\nAttackerInfo attackers[MAX_ATTACKERS];\nint attackerCount = 0;\n\nvoid macToString(const uint8_t* mac, char* buf) {\n    sprintf(buf, \"%02X:%02X:%02X:%02X:%02X:%02X\",\n            mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);\n}\n\nvoid updateAttackerTable() {\n    // Process new events since last check\n    static int lastProcessed = 0;\n\n    for (int i = lastProcessed; i < eventLogIndex; i++) {\n        DeauthEvent &evt = eventLog[i % EVENT_LOG_SIZE];\n        bool found = false;\n\n        for (int j = 0; j < attackerCount; j++) {\n            if (memcmp(attackers[j].mac, evt.srcMac, 6) == 0) {\n                attackers[j].deauthCount++;\n                attackers[j].lastSeen = evt.timestamp;\n                attackers[j].lastRssi = evt.rssi;\n                attackers[j].active = true;\n                found = true;\n                break;\n            }\n        }\n\n        if (!found && attackerCount < MAX_ATTACKERS) {\n            memcpy(attackers[attackerCount].mac, evt.srcMac, 6);\n            attackers[attackerCount].deauthCount = 1;\n            attackers[attackerCount].firstSeen = evt.timestamp;\n            attackers[attackerCount].lastSeen = evt.timestamp;\n            attackers[attackerCount].lastRssi = evt.rssi;\n            attackers[attackerCount].active = true;\n            attackerCount++;\n        }\n    }\n    lastProcessed = eventLogIndex;\n}\n\nvoid printAttackerReport() {\n    if (attackerCount == 0) return;\n\n    Serial.println("\\n===== ATTACKER REPORT =====\");\n    for (int i = 0; i < attackerCount; i++) {\n        char macStr[18];\n        macToString(attackers[i].mac, macStr);\n        Serial.printf(\"  SRC: %s | Count: %lu | RSSI: %d dBm | Active: %s\\n\",\n                      macStr, attackers[i].deauthCount,\n                      attackers[i].lastRssi,\n                      attackers[i].active ? \"YES\" : \"no\");\n    }\n    Serial.println(\"==========================\");\n}',
        },
        {
            title: 'Add Channel Scanning',
            content: '<p>A deauth attack may target any channel. We implement channel hopping to scan all 13 channels (2.4 GHz). When an attack is detected, we lock onto that channel to capture maximum detail. When the attack subsides, we resume hopping.</p>',
            language: 'C++',
            code: 'int currentChannel = 1;\nconst int MAX_CH = 13;\nconst int HOP_INTERVAL_MS = 250;  // 250ms per channel\nunsigned long lastHop = 0;\nbool channelLocked = false;\nint lockedChannel = 0;\n\nvoid channelHop() {\n    if (channelLocked) return;\n    if (millis() - lastHop < HOP_INTERVAL_MS) return;\n\n    currentChannel++;\n    if (currentChannel > MAX_CH) currentChannel = 1;\n\n    esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);\n    lastHop = millis();\n}\n\nvoid lockToAttackChannel(int ch) {\n    channelLocked = true;\n    lockedChannel = ch;\n    currentChannel = ch;\n    esp_wifi_set_channel(ch, WIFI_SECOND_CHAN_NONE);\n    Serial.printf(\"[LOCK] Locked to channel %d for attack analysis\\n\", ch);\n}\n\nvoid resumeScanning() {\n    channelLocked = false;\n    Serial.println(\"[SCAN] Resumed channel hopping\");\n}\n\n// Call this from the main loop when attack state changes\nvoid manageChannelStrategy() {\n    if (attackDetected && !channelLocked) {\n        // Lock to the channel where deauths were detected\n        int latestIdx = (eventLogIndex - 1) % EVENT_LOG_SIZE;\n        lockToAttackChannel(eventLog[latestIdx].channel);\n    } else if (!attackDetected && channelLocked) {\n        // Attack subsided — resume scanning\n        resumeScanning();\n    }\n}',
        },
        {
            title: 'Log Events with Timestamps',
            content: '<p>Serial logging provides a persistent record of detected attacks. Each event is printed with a timestamp, source/destination MACs, channel, RSSI, and reason code. This log can be captured to a file for forensic analysis.</p>',
            language: 'C++',
            code: 'unsigned long bootTime = 0;\n\nString formatUptime(unsigned long ms) {\n    unsigned long secs = ms / 1000;\n    unsigned long mins = secs / 60;\n    unsigned long hrs = mins / 60;\n    char buf[16];\n    sprintf(buf, \"%02lu:%02lu:%02lu\", hrs, mins % 60, secs % 60);\n    return String(buf);\n}\n\nconst char* reasonCodeStr(uint16_t reason) {\n    switch (reason) {\n        case 1:  return \"Unspecified\";\n        case 2:  return \"Auth no longer valid\";\n        case 3:  return \"Leaving BSS\";\n        case 4:  return \"Inactivity\";\n        case 5:  return \"AP overloaded\";\n        case 6:  return \"Class 2 from non-auth\";\n        case 7:  return \"Class 3 from non-assoc\";\n        case 8:  return \"Leaving BSS (disassoc)\";\n        default: return \"Unknown\";\n    }\n}\n\nvoid logDeauthEvent(DeauthEvent &evt) {\n    char srcMac[18], dstMac[18], bssidStr[18];\n    macToString(evt.srcMac, srcMac);\n    macToString(evt.dstMac, dstMac);\n    macToString(evt.bssid, bssidStr);\n\n    bool isBroadcast = (evt.dstMac[0] == 0xFF);\n\n    Serial.printf(\"[%s] DEAUTH #%lu | Ch:%d | RSSI:%d | %s -> %s%s | BSSID:%s | Reason:%d (%s)\\n\",\n                  formatUptime(evt.timestamp).c_str(),\n                  deauthTotal,\n                  evt.channel,\n                  evt.rssi,\n                  srcMac,\n                  dstMac,\n                  isBroadcast ? \" [BROADCAST]\" : \"\",\n                  bssidStr,\n                  evt.reason,\n                  reasonCodeStr(evt.reason));\n}',
        },
        {
            title: 'Assemble the Complete Detector',
            content: '<p>The final sketch ties everything together. On boot, it initializes the alert hardware and enters promiscuous mode. The main loop handles channel hopping, alert management, attacker tracking, and periodic status reports. A status line is printed every 10 seconds even when idle, so you know the detector is running.</p>',
            language: 'C++',
            code: '#include <WiFi.h>\n#include "esp_wifi.h"\n\n// --- Paste all structs, callbacks, alert functions, channel\n//     management, attacker tracking, and logging from above ---\n\nunsigned long lastStatusPrint = 0;\nconst int STATUS_INTERVAL_MS = 10000;\n\nvoid setup() {\n    Serial.begin(115200);\n    delay(500);\n\n    Serial.println(\"==========================================\");\n    Serial.println(\"[SG-10] Deauth Attack Detector v1.0\");\n    Serial.println(\"[SG-10] Monitoring all 2.4GHz channels\");\n    Serial.println(\"[SG-10] Alert: GPIO2 (LED) + GPIO4 (Buzzer)\");\n    Serial.println(\"==========================================\");\n\n    setupAlertHardware();\n    initSniffer();\n\n    // Quick LED/buzzer test on boot\n    digitalWrite(LED_PIN, HIGH);\n    digitalWrite(BUZZER_PIN, HIGH);\n    delay(200);\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n\n    bootTime = millis();\n    windowStart = millis();\n    Serial.println(\"[SG-10] Detector active. Scanning...\\n\");\n}\n\nvoid loop() {\n    channelHop();\n    updateAlerts();\n    manageChannelStrategy();\n    updateAttackerTable();\n\n    // Log new events to serial\n    static int lastLogged = 0;\n    for (int i = lastLogged; i < eventLogIndex; i++) {\n        logDeauthEvent(eventLog[i % EVENT_LOG_SIZE]);\n    }\n    lastLogged = eventLogIndex;\n\n    // Periodic status output\n    if (millis() - lastStatusPrint > STATUS_INTERVAL_MS) {\n        Serial.printf(\"[%s] Status: Ch=%d %s | Deauths=%lu | Attackers=%d | %s\\n\",\n                      formatUptime(millis()).c_str(),\n                      currentChannel,\n                      channelLocked ? \"(LOCKED)\" : \"(hopping)\",\n                      deauthTotal,\n                      attackerCount,\n                      attackDetected ? \"** ATTACK ACTIVE **\" : \"Clear\");\n\n        if (attackerCount > 0) printAttackerReport();\n\n        lastStatusPrint = millis();\n    }\n}',
            tip: '<strong>Field deployment:</strong> Power the ESP32 from a USB phone charger or power bank. Place it near the access point you want to protect. Open a serial terminal on a laptop and run <code>screen /dev/ttyUSB0 115200 | tee deauth_log.txt</code> to capture the log to a file while watching it live.'
        }
    ],

    testing: '<p>Verify the detector works end-to-end:</p>' +
             '<ul>' +
             '<li><strong>Boot sequence</strong> -- LED and buzzer should blink/beep once on startup, then go silent. Serial should show the banner and "Detector active" message.</li>' +
             '<li><strong>Channel hopping</strong> -- The status line (every 10 seconds) should show the channel cycling through 1-13.</li>' +
             '<li><strong>Idle state</strong> -- On a normal network with no attacks, the deauth count should stay at 0 or very low (occasional legitimate disconnections are normal -- 1-2 per hour).</li>' +
             '<li><strong>LED/buzzer test</strong> -- Temporarily lower <code>DEAUTH_ALERT_THRESHOLD</code> to 1 and disconnect a device from your WiFi to trigger a single deauth frame. Verify the LED blinks and the warning state activates.</li>' +
             '<li><strong>Attacker report</strong> -- When deauths are detected, the serial output should show source MAC addresses with frame counts. In a real attack, one MAC will dominate with hundreds or thousands of frames.</li>' +
             '<li><strong>Channel lock</strong> -- When attack detection triggers, verify the status changes from "(hopping)" to "(LOCKED)" on the attack channel.</li>' +
             '</ul>' +
             '<p><strong>Important:</strong> Do NOT run actual deauth attacks on networks you do not own. For testing, use an isolated lab network with your own access point, or simply verify the detector logic by lowering the threshold to trigger on normal disconnections.</p>',

    troubleshooting: '<ul>' +
                     '<li><strong>0 deauths detected even during a test</strong> -- Verify promiscuous mode is active: you should see management frames in the serial output. Check that the filter is set to <code>WIFI_PROMIS_FILTER_MASK_MGMT</code>. If you set it to <code>MASK_ALL</code>, the callback must still correctly check for management type.</li>' +
                     '<li><strong>LED does not blink</strong> -- GPIO 2 is also the on-board LED on most ESP32 DevKits. If the external LED is not working, check polarity (longer leg = anode = goes to the resistor). Verify the 220 ohm resistor is in series, not parallel.</li>' +
                     '<li><strong>Buzzer is always on or always off</strong> -- Active buzzers have a (+) and (-) marking. Check polarity. If using a passive buzzer, it needs a PWM signal -- replace <code>digitalWrite</code> with <code>tone(BUZZER_PIN, 2000)</code> for a 2kHz tone.</li>' +
                     '<li><strong>False positives</strong> -- Some routers send periodic deauth frames to inactive clients. Increase <code>DEAUTH_ALERT_THRESHOLD</code> to 5 or 10 to filter out normal traffic. Real attacks generate dozens to hundreds of deauth frames per second.</li>' +
                     '<li><strong>Misses attacks on some channels</strong> -- With 13 channels and 250ms per channel, you are on each channel only 7.5% of the time. A targeted attack on one channel may be missed during hops. Reduce <code>HOP_INTERVAL_MS</code> to 100ms or lock to specific high-value channels (1, 6, 11 are the non-overlapping channels where most APs operate).</li>' +
                     '<li><strong>ESP32 crashes under heavy attack</strong> -- During a real deauth flood, the callback fires thousands of times per second. Ensure the callback only increments counters and copies data -- no memory allocation or Serial prints inside the callback.</li>' +
                     '</ul>',

    challenges: '<p><strong>Challenge 1: Add an OLED Status Display</strong> -- Wire a 0.96" SSD1306 OLED to I2C (GPIO 21 SDA, GPIO 22 SCL). Show: current channel, total deauths, alert status, and the MAC address of the most active attacker. This eliminates the need for a serial connection during field use.</p>' +
                '<p><strong>Challenge 2: RSSI-Based Distance Estimation</strong> -- Track the attacker\'s RSSI over time. If you walk toward the source, RSSI increases. Display a simple proximity indicator (far/medium/close) to help physically locate the attacking device. Remember: RSSI is noisy, so average over 5-10 readings.</p>' +
                '<p><strong>Challenge 3: Multi-Attack Differentiation</strong> -- A sophisticated attacker may use MAC spoofing or multiple devices. Add logic to detect when deauth frames target different BSSIDs (indicating a sweep across all nearby networks) vs a single BSSID (targeted attack). Also detect when the "source" MAC matches a known AP but the RSSI is different from the real AP\'s baseline -- this is a telltale sign of MAC spoofing.</p>',

    // ======================================================================
    // SIG-2: Step visual illustrations (0-based step index)
    // ======================================================================
    stepVisuals: {
        // Step 0 — Deauth frame structure and detection logic
        0: '<svg viewBox="0 0 680 192" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg10-sv0-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
           '<marker id="sg10-arr-r" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#ef4444"/></marker>' +
           '<marker id="sg10-arr-g" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#22c55e"/></marker></defs>' +
           '<rect width="680" height="192" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="176" fill="url(#sg10-sv0-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">DEAUTH FRAME — STRUCTURE AND DETECTION</text>' +
           '<rect x="16" y="30" width="648" height="42" rx="4" fill="#0f1923" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="26" y="43" fill="#555" font-size="6.5" font-weight="700">802.11 MAC HEADER (24 bytes) + DEAUTH BODY</text>' +
           '<rect x="20" y="48" width="104" height="18" rx="2" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/>' +
           '<text x="72" y="60" text-anchor="middle" fill="#f87171" font-size="6.5" font-weight="700">Frame Ctrl 2B</text>' +
           '<rect x="130" y="48" width="80" height="18" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
           '<text x="170" y="60" text-anchor="middle" fill="#555" font-size="6.5">Duration 2B</text>' +
           '<rect x="216" y="48" width="80" height="18" rx="2" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>' +
           '<text x="256" y="60" text-anchor="middle" fill="#c084fc" font-size="6.5">Dest MAC 6B</text>' +
           '<rect x="302" y="48" width="80" height="18" rx="2" fill="rgba(255,107,53,0.1)" stroke="rgba(255,107,53,0.3)" stroke-width="0.5"/>' +
           '<text x="342" y="60" text-anchor="middle" fill="#ff6b35" font-size="6.5">Src MAC 6B</text>' +
           '<rect x="388" y="48" width="80" height="18" rx="2" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.3)" stroke-width="0.5"/>' +
           '<text x="428" y="60" text-anchor="middle" fill="#eab308" font-size="6.5">BSSID 6B</text>' +
           '<rect x="474" y="48" width="64" height="18" rx="2" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
           '<text x="506" y="60" text-anchor="middle" fill="#555" font-size="6.5">SeqCtrl 2B</text>' +
           '<rect x="544" y="48" width="100" height="18" rx="2" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/>' +
           '<text x="594" y="60" text-anchor="middle" fill="#f87171" font-size="6.5" font-weight="700">Reason Code 2B</text>' +
           '<rect x="16" y="82" width="648" height="46" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
           '<text x="26" y="96" fill="#555" font-size="6.5" font-weight="700">FRAME CONTROL BITS FOR DEAUTH (type=0 mgmt, subtype=12=0x0C)</text>' +
           '<text x="26" y="112" fill="#ef4444" font-size="7" font-weight="600">frameCtrl = 0xC000</text>' +
           '<text x="160" y="112" fill="#555" font-size="6.5">-- bits [3:2]=00 (management), bits [7:4]=1100 (subtype 12)</text>' +
           '<text x="26" y="126" fill="#8b949e" font-size="6.5">Extract:  uint8_t type = (frameCtrl >> 2) &amp; 0x03;   // = 0 (management)</text>' +
           '<text x="26" y="139" fill="#8b949e" font-size="6.5">          uint8_t sub  = (frameCtrl >> 4) &amp; 0x0F;  // = 12 (0x0C = deauth)</text>' +
           '<rect x="16" y="140" width="648" height="44" rx="4" fill="#0f1a2e" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
           '<text x="26" y="154" fill="#555" font-size="6.5" font-weight="700">SLIDING WINDOW ATTACK DETECTION:</text>' +
           '<text x="26" y="168" fill="#8b949e" font-size="6.5">DEAUTH_ALERT_THRESHOLD = 3</text>' +
           '<text x="200" y="168" fill="#555" font-size="6.5">-- 3+ deauths within 2s = attack. Legitimate disconnect = 1-2 total per hour.</text>' +
           '<text x="26" y="181" fill="#ef4444" font-size="6.5">Broadcast deauth (dest FF:FF:FF:FF:FF:FF)</text>' +
           '<text x="280" y="181" fill="#555" font-size="6.5">-- disconnects ALL clients simultaneously, strongest attack indicator.</text>' +
           '</svg>',

        // Step 2 — LED + Buzzer alert level state machine
        2: '<svg viewBox="0 0 680 192" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg10-sv2-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern>' +
           '<marker id="sg10-sv2-arr-w" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#555"/></marker>' +
           '<marker id="sg10-sv2-arr-y" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#eab308"/></marker>' +
           '<marker id="sg10-sv2-arr-r" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#ef4444"/></marker>' +
           '<marker id="sg10-sv2-arr-g" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#22c55e"/></marker></defs>' +
           '<rect width="680" height="192" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="176" fill="url(#sg10-sv2-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">ALERT LEVEL STATE MACHINE</text>' +
           '<rect x="20" y="36" width="160" height="110" rx="8" fill="#1e2736" stroke="#555" stroke-width="1.5"/>' +
           '<rect x="20" y="36" width="160" height="24" rx="8" fill="rgba(255,255,255,0.05)"/>' +
           '<text x="100" y="51" text-anchor="middle" fill="#8b949e" font-size="9" font-weight="700">IDLE</text>' +
           '<circle cx="100" cy="90" r="16" fill="rgba(0,0,0,0.3)" stroke="#555" stroke-width="1.5"/>' +
           '<text x="100" y="93" text-anchor="middle" fill="#555" font-size="7">LED off</text>' +
           '<text x="100" y="120" text-anchor="middle" fill="#555" font-size="6.5">deauths = 0</text>' +
           '<text x="100" y="132" text-anchor="middle" fill="#555" font-size="6">Buzzer silent</text>' +
           '<rect x="250" y="36" width="180" height="110" rx="8" fill="#1e2736" stroke="#eab308" stroke-width="1.5"/>' +
           '<rect x="250" y="36" width="180" height="24" rx="8" fill="rgba(234,179,8,0.12)"/>' +
           '<text x="340" y="51" text-anchor="middle" fill="#eab308" font-size="9" font-weight="700">WARNING</text>' +
           '<circle cx="340" cy="90" r="16" fill="rgba(234,179,8,0.2)" stroke="#eab308" stroke-width="1.5"/>' +
           '<text x="340" y="93" text-anchor="middle" fill="#fde68a" font-size="7">LED 1Hz</text>' +
           '<text x="340" y="120" text-anchor="middle" fill="#eab308" font-size="6.5">1+ deauths seen</text>' +
           '<text x="340" y="132" text-anchor="middle" fill="#555" font-size="6">Buzzer silent</text>' +
           '<rect x="500" y="36" width="164" height="110" rx="8" fill="#1e2736" stroke="#ef4444" stroke-width="2"/>' +
           '<rect x="500" y="36" width="164" height="24" rx="8" fill="rgba(239,68,68,0.15)"/>' +
           '<text x="582" y="51" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="700">ATTACK</text>' +
           '<circle cx="582" cy="90" r="16" fill="rgba(239,68,68,0.25)" stroke="#ef4444" stroke-width="2"/>' +
           '<text x="582" y="93" text-anchor="middle" fill="#f87171" font-size="7">LED 5Hz</text>' +
           '<text x="582" y="120" text-anchor="middle" fill="#ef4444" font-size="6.5">3+ deauths/2s</text>' +
           '<text x="582" y="132" text-anchor="middle" fill="#ef4444" font-size="6" font-weight="600">Buzzer ON</text>' +
           '<line x1="183" y1="91" x2="246" y2="91" stroke="#eab308" stroke-width="1.5" marker-end="url(#sg10-sv2-arr-y)"/>' +
           '<text x="214" y="84" text-anchor="middle" fill="#eab308" font-size="6">1+ deauth</text>' +
           '<line x1="246" y1="101" x2="183" y2="101" stroke="#555" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#sg10-sv2-arr-w)"/>' +
           '<text x="214" y="114" text-anchor="middle" fill="#555" font-size="6">window clear</text>' +
           '<line x1="433" y1="91" x2="497" y2="91" stroke="#ef4444" stroke-width="1.5" marker-end="url(#sg10-sv2-arr-r)"/>' +
           '<text x="465" y="84" text-anchor="middle" fill="#ef4444" font-size="6">3+ /2s</text>' +
           '<line x1="497" y1="101" x2="433" y2="101" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#sg10-sv2-arr-g)"/>' +
           '<text x="465" y="114" text-anchor="middle" fill="#22c55e" font-size="6">attack clears</text>' +
           '<text x="340" y="162" text-anchor="middle" fill="#333" font-size="6.5">Window resets every 2000ms. If deauthInWindow &lt; threshold after reset, attackDetected = false and state drops back.</text>' +
           '<text x="340" y="175" text-anchor="middle" fill="#555" font-size="6">GPIO2 = LED (+ built-in LED on most DevKits). GPIO4 = active buzzer. All driven from updateAlerts() in main loop.</text>' +
           '</svg>',

        // Step 5 — Serial log format / reason code table
        5: '<svg viewBox="0 0 680 185" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
           '<defs><pattern id="sg10-sv5-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
           '<rect width="680" height="185" fill="#0d1117" rx="6"/>' +
           '<rect x="8" y="8" width="664" height="169" fill="url(#sg10-sv5-grid)" rx="3"/>' +
           '<text x="340" y="22" text-anchor="middle" fill="#444" font-size="8" font-weight="700" letter-spacing="0.15em">SERIAL LOG FORMAT + DEAUTH REASON CODES</text>' +
           '<rect x="16" y="30" width="648" height="60" rx="4" fill="#0a0e16" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
           '<text x="26" y="44" fill="#555" font-size="6.5" font-weight="700">EXPECTED LOG FORMAT (Serial Monitor at 115200 baud)</text>' +
           '<text x="26" y="58" fill="#22c55e" font-size="6.5">[00:03:14] DEAUTH #1  | Ch:6 | RSSI:-62 | AA:BB:CC:DD:EE:FF -> FF:FF:FF:FF:FF:FF [BROADCAST] | BSSID:11:22:33:44:55:66 | Reason:3 (Leaving BSS)</text>' +
           '<text x="26" y="72" fill="#ef4444" font-size="6.5">[00:03:14] DEAUTH #4  | Ch:6 | RSSI:-61 | AA:BB:CC:DD:EE:FF -> FF:FF:FF:FF:FF:FF [BROADCAST] | BSSID:11:22:33:44:55:66 | Reason:3 (Leaving BSS)</text>' +
           '<text x="26" y="84" fill="#ef4444" font-size="6.5">** 3 deauths in 2s window -- ATTACK ACTIVE **  SRC: AA:BB:CC:DD:EE:FF  Locked Ch:6</text>' +
           '<rect x="16" y="100" width="648" height="70" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
           '<text x="26" y="114" fill="#555" font-size="6.5" font-weight="700">DEAUTH REASON CODES (2-byte field in frame body)</text>' +
           '<text x="26" y="128" fill="#8b949e" font-size="6.5">Reason 1:</text><text x="96" y="128" fill="#555" font-size="6.5">Unspecified  |  </text>' +
           '<text x="200" y="128" fill="#8b949e" font-size="6.5">Reason 2:</text><text x="270" y="128" fill="#555" font-size="6.5">Auth no longer valid  |  </text>' +
           '<text x="400" y="128" fill="#8b949e" font-size="6.5">Reason 3:</text><text x="470" y="128" fill="#555" font-size="6.5">Leaving BSS</text>' +
           '<text x="26" y="142" fill="#8b949e" font-size="6.5">Reason 4:</text><text x="96" y="142" fill="#555" font-size="6.5">Inactivity timeout  |  </text>' +
           '<text x="200" y="142" fill="#8b949e" font-size="6.5">Reason 6:</text><text x="270" y="142" fill="#555" font-size="6.5">Class 2 from non-auth  |  </text>' +
           '<text x="400" y="142" fill="#8b949e" font-size="6.5">Reason 7:</text><text x="470" y="142" fill="#555" font-size="6.5">Class 3 from non-assoc</text>' +
           '<text x="26" y="156" fill="#ef4444" font-size="6.5">Attack signature:</text><text x="126" y="156" fill="#555" font-size="6.5">Reason 3 or 7 in rapid bursts from same SRC MAC targeting broadcast destination.</text>' +
           '<text x="26" y="169" fill="#22c55e" font-size="6.5">Legitimate disconnect:</text><text x="150" y="169" fill="#555" font-size="6.5">1-2 deauth frames total, reason 3/8, unicast dest (single client leaving).</text>' +
           '</svg>'
    },

    // ======================================================================
    // SIG-3: Component callouts -- deauth detector hardware teardown
    // ======================================================================
    componentCallouts: {
        svg: '<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;max-width:440px;width:100%;height:auto">' +
             '<defs><pattern id="sg10-cc-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.7" fill="rgba(255,255,255,0.04)"/></pattern></defs>' +
             '<rect width="440" height="280" fill="#0d1117" rx="6"/>' +
             '<rect x="6" y="6" width="428" height="268" fill="url(#sg10-cc-grid)" rx="3"/>' +
             '<text x="220" y="20" text-anchor="middle" fill="#444" font-size="7" font-weight="700" letter-spacing="0.15em">DEAUTH DETECTOR — INTERACTIVE TEARDOWN</text>' +
             '<text x="220" y="30" text-anchor="middle" fill="#333" font-size="6">Hover component list items to highlight</text>' +
             '<rect x="20" y="38" width="400" height="200" rx="6" fill="#111a28" stroke="rgba(239,68,68,0.2)" stroke-width="1.5"/>' +
             '<g data-callout="esp32-devkit">' +
             '<rect x="90" y="50" width="150" height="80" rx="6" fill="#1e2736" stroke="#ef4444" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="88" y="48" width="154" height="84" rx="7" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="165" y="80" text-anchor="middle" fill="#f87171" font-size="8" font-weight="700">ESP32 DevKit V1</text>' +
             '<text x="165" y="94" text-anchor="middle" fill="#8b949e" font-size="6.5">Promiscuous mode</text>' +
             '<text x="165" y="106" text-anchor="middle" fill="#666" font-size="5.5">Ch 1-13, 250ms/ch hop</text>' +
             '</g>' +
             '<g data-callout="led-alert">' +
             '<circle cx="298" cy="90" r="18" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1.5" class="sp-callout-circle"/>' +
             '<circle class="sp-callout-ring" cx="298" cy="90" r="23" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<circle cx="298" cy="90" r="8" fill="rgba(239,68,68,0.35)"/>' +
             '<text x="298" y="122" text-anchor="middle" fill="#f87171" font-size="6.5" font-weight="700">LED GPIO2</text>' +
             '<text x="298" y="133" text-anchor="middle" fill="#555" font-size="5.5">220 ohm series</text>' +
             '</g>' +
             '<g data-callout="resistor">' +
             '<rect x="336" y="80" width="50" height="16" rx="3" fill="#2a2a3a" stroke="#eab308" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="334" y="78" width="54" height="20" rx="4" fill="none" stroke="#eab308" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="361" y="92" text-anchor="middle" fill="#fde68a" font-size="6" font-weight="700">220 ohm</text>' +
             '</g>' +
             '<g data-callout="buzzer">' +
             '<circle cx="340" cy="160" r="22" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1.5" class="sp-callout-circle"/>' +
             '<circle class="sp-callout-ring" cx="340" cy="160" r="27" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<circle cx="340" cy="160" r="10" fill="rgba(34,197,94,0.08)" stroke="#22c55e" stroke-width="0.5"/>' +
             '<text x="340" y="163" text-anchor="middle" fill="#4ade80" font-size="6.5" font-weight="700">BUZZER</text>' +
             '<text x="340" y="196" text-anchor="middle" fill="#555" font-size="5.5">GPIO4 active</text>' +
             '</g>' +
             '<g data-callout="gnd-bus">' +
             '<rect x="30" y="190" width="200" height="16" rx="3" fill="#1a1a1a" stroke="#555" stroke-width="1" class="sp-callout-circle"/>' +
             '<rect class="sp-callout-ring" x="28" y="188" width="204" height="20" rx="4" fill="none" stroke="#555" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4,2"/>' +
             '<text x="130" y="201" text-anchor="middle" fill="#888" font-size="6" font-weight="700">GND BUS (shared)</text>' +
             '</g>' +
             '</svg>',

        components: [
            {
                id: 'esp32-devkit',
                name: 'A — ESP32 DevKit V1 (Monitor)',
                purpose: 'Running in WiFi promiscuous mode with management-only filter (WIFI_PROMIS_FILTER_MASK_MGMT). This reduces CPU load dramatically because data and control frames (the majority of traffic) are discarded by the hardware before the callback fires. Hops through channels 1-13 at 250ms per channel.',
                specs: ['Dual-core 240 MHz', 'MGMT filter active', '250ms channel dwell', 'Sliding window detector', 'IRAM_ATTR callback']
            },
            {
                id: 'led-alert',
                name: 'B — Alert LED (GPIO 2)',
                purpose: 'Visual indicator with three states: off (idle), 1Hz blink (warning -- deauths seen but below threshold), 5Hz blink (attack -- threshold exceeded). GPIO 2 is also the on-board LED on most ESP32 DevKits, so both the external and on-board LEDs respond to attack events.',
                specs: ['GPIO 2', 'Also on-board LED', 'Off / 1Hz / 5Hz', '3.3V logic', 'Up to 40mA source']
            },
            {
                id: 'resistor',
                name: 'C — 220 Ohm Current Limiting Resistor',
                purpose: 'In series with the LED to limit current. Without it, the LED draws too much current and can damage the ESP32 GPIO. Calculate: R = (3.3V - 2.0V forward voltage) / 10mA = 130 ohm minimum. 220 ohm gives ~6mA, bright enough for a clear visual alert.',
                specs: ['220 ohm', 'Limits to ~6 mA', 'Min 130 ohm', 'In series with LED', 'Red/red/brown bands']
            },
            {
                id: 'buzzer',
                name: 'D — Active Piezo Buzzer (GPIO 4)',
                purpose: 'An active buzzer has a built-in oscillator -- just drive the pin HIGH to produce a tone. Do NOT use a passive buzzer without code changes (passive buzzers need a PWM signal). The buzzer only sounds in ALERT_ATTACK state (5+ deauths in 2 seconds), making it clearly distinct from the silent warning state.',
                specs: ['GPIO 4', 'Active buzzer only', 'HIGH = tone on', '3-12V operating', '+ marking on body']
            },
            {
                id: 'gnd-bus',
                name: 'E — Shared GND Bus',
                purpose: 'Both the LED cathode (negative leg) and buzzer negative terminal connect to the same GND rail on the breadboard. The GND bus connects to any GND pin on the ESP32 DevKit -- there are multiple on both sides of the board. A shared reference ground is required for all components to work correctly.',
                specs: ['Common reference', 'Multiple GND pins', 'Both sides of DevKit', 'LED cathode + Buzzer -', 'Black wire convention']
            }
        ]
    },

    // ======================================================================
    // SIG-4: Common mistakes for SG-10
    // ======================================================================
    commonMistakes: [
        {
            title: 'Using a passive buzzer -- buzzer makes no sound even during confirmed attack',
            correct: 'Use an active buzzer (has built-in oscillator). When GPIO 4 goes HIGH the buzzer sounds automatically. Active buzzers are usually labeled with a (+) mark and a sticker on top. They typically cost $0.50 and come in electronics starter kits.',
            incorrect: 'Using a passive buzzer (just a piezoelectric disc with no oscillator). A passive buzzer needs a continuous PWM signal at the desired frequency. Driving it with digitalWrite(HIGH) produces a single click at power-on and then silence.',
            consequence: 'The attack detection logic works correctly (LED blinks at 5Hz, serial shows ATTACK ACTIVE) but no sound is produced. The buzzer may make a single faint click when the state first transitions to ATTACK but then goes silent. Very easy to miss attacks in noisy environments.',
            svgDiff: '<svg viewBox="0 0 640 148" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg10-m1-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="148" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="136" fill="url(#sg10-m1-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="118" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<circle cx="100" cy="80" r="40" fill="rgba(34,197,94,0.08)" stroke="#22c55e" stroke-width="1.5"/>' +
                     '<circle cx="100" cy="80" r="20" fill="rgba(34,197,94,0.05)" stroke="#22c55e" stroke-width="0.5"/>' +
                     '<text x="100" y="74" text-anchor="middle" fill="#4ade80" font-size="7" font-weight="700">ACTIVE</text>' +
                     '<text x="100" y="85" text-anchor="middle" fill="#22c55e" font-size="7">BUZZER</text>' +
                     '<text x="100" y="132" text-anchor="middle" fill="#555" font-size="6">Has built-in oscillator</text>' +
                     '<rect x="155" y="40" width="140" height="80" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="163" y="56" fill="#22c55e" font-size="6.5">digitalWrite(BUZZER, HIGH);</text>' +
                     '<text x="163" y="70" fill="#555" font-size="6.5">// Produces steady tone</text>' +
                     '<text x="163" y="84" fill="#555" font-size="6.5">// oscillator is inside</text>' +
                     '<text x="163" y="98" fill="#22c55e" font-size="6.5">// Easy to use, 3-12V</text>' +
                     '<text x="161" y="126" text-anchor="middle" fill="#22c55e" font-size="7">HIGH signal = sustained tone -- clear attack alert</text>' +
                     '<rect x="330" y="14" width="298" height="118" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<circle cx="418" cy="80" r="40" fill="rgba(239,68,68,0.05)" stroke="#ef4444" stroke-width="1.5"/>' +
                     '<circle cx="418" cy="80" r="20" fill="none" stroke="#ef4444" stroke-width="0.5" stroke-dasharray="3,2"/>' +
                     '<text x="418" y="74" text-anchor="middle" fill="#f87171" font-size="7" font-weight="700">PASSIVE</text>' +
                     '<text x="418" y="85" text-anchor="middle" fill="#ef4444" font-size="7">BUZZER</text>' +
                     '<text x="418" y="132" text-anchor="middle" fill="#555" font-size="6">No oscillator inside</text>' +
                     '<rect x="473" y="40" width="140" height="80" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="481" y="56" fill="#ef4444" font-size="6.5">digitalWrite(BUZZER, HIGH);</text>' +
                     '<text x="481" y="70" fill="#ef4444" font-size="6.5">// Single click then silent</text>' +
                     '<text x="481" y="84" fill="#555" font-size="6.5">// Needs PWM signal</text>' +
                     '<text x="481" y="98" fill="#ef4444" font-size="6.5">// tone(BUZZER, 2000) works</text>' +
                     '<text x="479" y="126" text-anchor="middle" fill="#ef4444" font-size="7">HIGH alone = silent -- attacks missed audibly</text>' +
                     '</svg>'
        },
        {
            title: 'Setting filter to WIFI_PROMIS_FILTER_MASK_ALL -- callback overwhelmed, ESP32 reboots',
            correct: 'Set the promiscuous filter to WIFI_PROMIS_FILTER_MASK_MGMT so only management frames reach the callback. Since we only care about deauth (management type), filtering early is both faster and safer.',
            incorrect: 'Using WIFI_PROMIS_FILTER_MASK_ALL which passes all frame types (management, control, and data) to the callback. On a busy WiFi channel, the callback fires 500-2000+ times per second instead of 50-200 times.',
            consequence: 'On a moderately busy WiFi channel, the callback fires too frequently for the ESP32 to keep up. The WiFi task queue overflows, the watchdog triggers, and the ESP32 reboots every 5-30 seconds. Serial shows "rst:0x8 (TG1WDT_SYS_RESET)" repeatedly.',
            svgDiff: '<svg viewBox="0 0 640 148" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg10-m2-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern></defs>' +
                     '<rect width="640" height="148" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="136" fill="url(#sg10-m2-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="118" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<rect x="22" y="34" width="270" height="90" rx="4" fill="#0a1628" stroke="rgba(34,197,94,0.1)" stroke-width="0.5"/>' +
                     '<text x="30" y="50" fill="#555" font-size="6.5">wifi_promiscuous_filter_t filter = {</text>' +
                     '<text x="30" y="64" fill="#22c55e" font-size="6.5">  .filter_mask = WIFI_PROMIS_FILTER_MASK_MGMT</text>' +
                     '<text x="30" y="78" fill="#555" font-size="6.5">};</text>' +
                     '<text x="30" y="92" fill="#555" font-size="5.5">// Only mgmt frames pass -- ~50-200 fps</text>' +
                     '<text x="30" y="106" fill="#22c55e" font-size="5.5">// Data + ctrl discarded by hardware</text>' +
                     '<text x="161" y="120" text-anchor="middle" fill="#22c55e" font-size="7">50-200 callbacks/sec -- stable operation</text>' +
                     '<rect x="330" y="14" width="298" height="118" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<rect x="340" y="34" width="270" height="90" rx="4" fill="#0a1628" stroke="rgba(239,68,68,0.1)" stroke-width="0.5"/>' +
                     '<text x="348" y="50" fill="#555" font-size="6.5">wifi_promiscuous_filter_t filter = {</text>' +
                     '<text x="348" y="64" fill="#ef4444" font-size="6.5">  .filter_mask = WIFI_PROMIS_FILTER_MASK_ALL</text>' +
                     '<text x="348" y="78" fill="#555" font-size="6.5">};</text>' +
                     '<text x="348" y="92" fill="#ef4444" font-size="5.5">// All frames pass -- 500-2000+ fps</text>' +
                     '<text x="348" y="106" fill="#ef4444" font-size="5.5">// Watchdog reset on busy channels</text>' +
                     '<text x="479" y="120" text-anchor="middle" fill="#ef4444" font-size="7">500-2000 callbacks/sec -- watchdog reset loop</text>' +
                     '</svg>'
        },
        {
            title: 'LED polarity reversed -- LED never lights during attack, anode wired to GND',
            correct: 'Connect the LED anode (longer leg, or the leg closest to the flat side on the LED body) to the resistor, then to GPIO 2. Connect the LED cathode (shorter leg) to GND. Current flows from GPIO 2 through the resistor through the LED to GND.',
            incorrect: 'Connecting the LED backwards: cathode to GPIO 2 (via resistor) and anode to GND. No current can flow in reverse bias at 3.3V (LEDs have a reverse breakdown voltage of ~5V). The LED appears dead.',
            consequence: 'The LED never lights regardless of GPIO state. The buzzer (if correctly wired) still alerts. Serial shows correct attack detection. The fault is invisible until you swap the LED orientation. No damage occurs -- reverse bias at 3.3V is safe for standard LEDs.',
            svgDiff: '<svg viewBox="0 0 640 148" xmlns="http://www.w3.org/2000/svg" style="font-family:Cascadia Code,Fira Code,Consolas,monospace;display:block;width:100%">' +
                     '<defs><pattern id="sg10-m3-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.6" fill="rgba(255,255,255,0.03)"/></pattern>' +
                     '<marker id="sg10-arr-o" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#ff6b35"/></marker>' +
                     '<marker id="sg10-arr-r" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#ef4444"/></marker></defs>' +
                     '<rect width="640" height="148" fill="#0d1117" rx="6"/>' +
                     '<rect x="6" y="6" width="628" height="136" fill="url(#sg10-m3-grid)" rx="3"/>' +
                     '<rect x="12" y="14" width="298" height="118" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.4)" stroke-width="1.5"/>' +
                     '<text x="161" y="27" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700" letter-spacing="0.1em">CORRECT</text>' +
                     '<text x="36" y="52" fill="#8b949e" font-size="6.5">GPIO2</text>' +
                     '<line x1="70" y1="47" x2="110" y2="47" stroke="#eab308" stroke-width="2" marker-end="url(#sg10-arr-o)"/>' +
                     '<rect x="112" y="38" width="44" height="18" rx="2" fill="#2a2a3a" stroke="#eab308" stroke-width="1"/>' +
                     '<text x="134" y="50" text-anchor="middle" fill="#fde68a" font-size="6">220 ohm</text>' +
                     '<line x1="156" y1="47" x2="196" y2="47" stroke="#eab308" stroke-width="2" marker-end="url(#sg10-arr-o)"/>' +
                     '<polygon points="198,36 232,47 198,58" fill="rgba(239,68,68,0.3)" stroke="#22c55e" stroke-width="1.5"/>' +
                     '<line x1="232" y1="36" x2="232" y2="58" stroke="#22c55e" stroke-width="1.5"/>' +
                     '<text x="215" y="74" text-anchor="middle" fill="#4ade80" font-size="6.5">Anode (+)</text>' +
                     '<text x="232" y="84" text-anchor="middle" fill="#4ade80" font-size="6">Cathode (-)</text>' +
                     '<line x1="232" y1="47" x2="272" y2="47" stroke="#555" stroke-width="2"/>' +
                     '<text x="280" y="52" fill="#8b949e" font-size="6.5">GND</text>' +
                     '<text x="161" y="120" text-anchor="middle" fill="#22c55e" font-size="7">Current flows through LED -- lights during attack</text>' +
                     '<rect x="330" y="14" width="298" height="118" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5"/>' +
                     '<text x="479" y="27" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700" letter-spacing="0.1em">MISTAKE</text>' +
                     '<text x="354" y="52" fill="#8b949e" font-size="6.5">GPIO2</text>' +
                     '<line x1="388" y1="47" x2="428" y2="47" stroke="#ef4444" stroke-width="2" marker-end="url(#sg10-arr-r)"/>' +
                     '<rect x="430" y="38" width="44" height="18" rx="2" fill="#2a2a3a" stroke="#eab308" stroke-width="1"/>' +
                     '<text x="452" y="50" text-anchor="middle" fill="#fde68a" font-size="6">220 ohm</text>' +
                     '<line x1="474" y1="47" x2="514" y2="47" stroke="#ef4444" stroke-width="2" marker-end="url(#sg10-arr-r)"/>' +
                     '<line x1="514" y1="36" x2="514" y2="58" stroke="#ef4444" stroke-width="1.5"/>' +
                     '<polygon points="514,36 548,47 514,58" fill="rgba(239,68,68,0.1)" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>' +
                     '<text x="531" y="74" text-anchor="middle" fill="#f87171" font-size="6.5">Cathode (-)</text>' +
                     '<text x="514" y="84" text-anchor="middle" fill="#f87171" font-size="6">Anode (+)</text>' +
                     '<line x1="548" y1="47" x2="588" y2="47" stroke="#555" stroke-width="2"/>' +
                     '<text x="596" y="52" fill="#8b949e" font-size="6.5">GND</text>' +
                     '<text x="479" y="120" text-anchor="middle" fill="#ef4444" font-size="7">Reverse bias -- no current flows, LED stays dark</text>' +
                     '</svg>'
        }
    ]
};
