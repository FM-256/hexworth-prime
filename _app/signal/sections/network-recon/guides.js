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
                '<p><strong>Challenge 3: Signal Strength Heatmap</strong> -- Pick one target SSID and display a real-time RSSI graph over time. Walk around your space and observe how the signal fluctuates. This is the basis for WiFi site surveys used in enterprise network planning.</p>'
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
             '<li><strong>RSSI values</strong> -- Nearby devices (within 1 meter) should show RSSI above -50 dBm. Devices across the room should be -60 to -80 dBm.</li>' +
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
                '<p><strong>Challenge 3: Add an OLED Display</strong> -- Wire a 0.96" I2C OLED (SSD1306) to GPIO 21 (SDA) and GPIO 22 (SCL). Display a live count of Classic and BLE devices, plus the name and RSSI of the strongest signal. This turns the project into a portable device without needing a laptop for the serial monitor.</p>'
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
                '<p><strong>Challenge 3: Traffic Rate Graph</strong> -- Instead of cumulative counts, display a scrolling line graph of frames-per-second over the last 60 seconds. This shows traffic patterns over time and makes spikes instantly visible.</p>'
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
                '<p><strong>Challenge 3: Historical Tracking</strong> -- Log all monitor events to a SQLite database with timestamps. Build a query that shows device presence patterns over a week -- when each device typically appears and disappears. This is the foundation of network behavior analysis.</p>'
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
                 '<p>Both components share the GND bus on the breadboard. The ESP32 DevKit provides multiple GND pins on both sides of the board.</p>',

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
                '<p><strong>Challenge 3: Multi-Attack Differentiation</strong> -- A sophisticated attacker may use MAC spoofing or multiple devices. Add logic to detect when deauth frames target different BSSIDs (indicating a sweep across all nearby networks) vs a single BSSID (targeted attack). Also detect when the "source" MAC matches a known AP but the RSSI is different from the real AP\'s baseline -- this is a telltale sign of MAC spoofing.</p>'
};
